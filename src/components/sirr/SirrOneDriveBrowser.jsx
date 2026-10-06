// ═══════════════════════════════════════════════════════════════
// SIRR ONEDRIVE BROWSER — IMPORT PDFs FROM ONEDRIVE
// ═══════════════════════════════════════════════════════════════
// Admin-only. Browses the Owner's OneDrive folders, selects PDFs,
// and imports them through the existing validateManuscriptImport pipeline.
//
// Features:
//   - Folder navigation with breadcrumb
//   - Multi-select PDF files
//   - Duplicate detection (file already imported, unchanged)
//   - Change detection (file modified since last import)
//   - Force re-import as new version (preserves old version)
//   - Per-file import status tracking
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft, Folder, FileText, Loader2, Cloud,
  CheckCircle2, AlertCircle, RefreshCw, HardDriveDownload,
  Shield, Microscope
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import SirrAnalyzeModal from "./SirrAnalyzeModal";

export default function SirrOneDriveBrowser({ onBack, onImported, language }) {
  const isMl = language === "ml";
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState([{ id: "root", name: isMl ? "എന്റെ OneDrive" : "My OneDrive" }]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState({});
  const [error, setError] = useState("");
  const [analyzingFile, setAnalyzingFile] = useState(null);

  // ── Check admin status ──
  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        try {
          const me = await base44.auth.me();
          setIsAdmin(me.role === "admin");
        } catch { setIsAdmin(false); }
      }
      setAuthChecked(true);
    });
  }, []);

  // ── Browse folder ──
  const browse = useCallback(async (folderId, crumbName) => {
    setLoading(true);
    setError("");
    setSelected(new Set());
    try {
      const res = await base44.functions.invoke("browseOneDrive", { folder_id: folderId });
      const data = res.data;
      setFolders(data.folders || []);
      setFiles(data.files || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to browse OneDrive");
      setFolders([]);
      setFiles([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) browse("root");
  }, [isAdmin]);

  const navigateTo = (folder) => {
    setBreadcrumb((prev) => [...prev, { id: folder.id, name: folder.name }]);
    browse(folder.id);
  };

  const navigateToCrumb = (index) => {
    const crumb = breadcrumb[index];
    setBreadcrumb(breadcrumb.slice(0, index + 1));
    browse(crumb.id);
  };

  const toggleSelect = (fileId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  // ── Process chunked import (large files auto-split into parts) ──
  const processChunks = async (statusKey, name, bookTitle, data) => {
    const { book_id, chunks, total_chunks } = data;
    let chunkError = null;
    for (const chunk of chunks) {
      setImportStatus((prev) => ({
        ...prev,
        [statusKey]: { status: "importing", name, message: `Processing Part ${chunk.chunk_number}/${total_chunks}...` },
      }));
      try {
        const chunkRes = await base44.functions.invoke("validateManuscriptImport", {
          pdf_url: chunk.chunk_url,
          book_title: bookTitle,
          existing_book_id: book_id,
          page_offset: chunk.page_offset,
          chunk_number: chunk.chunk_number,
          total_chunks,
          do_quality_gate: chunk.chunk_number === 1,
          is_final_chunk: chunk.chunk_number === total_chunks,
          original_file_name: name,
        });
        const chunkData = chunkRes.data;
        if (chunkData.status === "import_rejected") {
          setImportStatus((prev) => ({
            ...prev,
            [statusKey]: { status: "error", message: `Quality rejected: ${chunkData.reason || "below threshold"}`, book_id, name },
          }));
          return false;
        }
      } catch (e) {
        chunkError = e.response?.data?.error || e.message || `Part ${chunk.chunk_number} failed`;
      }
    }
    setImportStatus((prev) => ({
      ...prev,
      [statusKey]: {
        status: chunkError ? "error" : "imported",
        message: chunkError ? `Partially imported: ${chunkError}` : `Completed. ${total_chunks} parts merged into one book.`,
        book_id, book_title: bookTitle, name,
      },
    }));
    return !chunkError;
  };

  // ── Import selected files ──
  const handleImport = async () => {
    setImporting(true);
    const selectedFiles = files.filter((f) => selected.has(f.id));
    for (const file of selectedFiles) {
      const bookTitle = file.name.replace(/\.pdf$/i, "");
      setImportStatus((prev) => ({ ...prev, [file.id]: { status: "importing", name: file.name } }));
      try {
        const res = await base44.functions.invoke("importFromOneDrive", {
          file_id: file.id,
          book_title: bookTitle,
        });
        const data = res.data;
        if (data.status === "chunked") {
          await processChunks(file.id, file.name, bookTitle, data);
        } else {
          setImportStatus((prev) => ({
            ...prev,
            [file.id]: {
              status: data.status,
              message: data.message,
              book_id: data.book_id,
              file_id: file.id,
              book_title: bookTitle,
              name: file.name,
            },
          }));
        }
      } catch (e) {
        setImportStatus((prev) => ({
          ...prev,
          [file.id]: { status: "error", message: e.response?.data?.error || e.message || "Import failed", name: file.name },
        }));
      }
    }
    setImporting(false);
    setSelected(new Set());
    if (onImported) onImported();
  };

  // ── Force re-import (file changed) ──
  const handleForceReimport = async (fileId, bookTitle) => {
    setImporting(true);
    setImportStatus((prev) => ({ ...prev, [fileId]: { status: "importing", name: bookTitle } }));
    try {
      const res = await base44.functions.invoke("importFromOneDrive", {
        file_id: fileId,
        book_title: bookTitle,
        force_reimport: true,
      });
      const data = res.data;
      if (data.status === "chunked") {
        await processChunks(fileId, bookTitle, bookTitle, data);
      } else {
        setImportStatus((prev) => ({
          ...prev,
          [fileId]: { status: "imported", message: data.message, book_id: data.book_id, name: bookTitle },
        }));
      }
    } catch (e) {
      setImportStatus((prev) => ({
        ...prev,
        [fileId]: { status: "error", message: e.response?.data?.error || e.message || "Re-import failed", name: bookTitle },
      }));
    }
    setImporting(false);
    if (onImported) onImported();
  };

  // ── Auth loading ──
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#D4AF37" }} />
      </div>
    );
  }

  // ── Not admin ──
  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: "#F87171" }} />
        <p className={`text-sm ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.60)" }}>
          {isMl ? "ഈ സവിശേഷത അഡ്മിൻ മാത്രം." : "Admin access required."}
        </p>
        <button onClick={onBack} className="mt-4 flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {isMl ? "തിരികെ" : "Back"}
        </button>
      </div>
    );
  }

  const pdfFiles = files.filter((f) => f.is_pdf);
  const statusEntries = Object.entries(importStatus);

  return (
    <div className="space-y-3">
      {/* Back button */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {isMl ? "തിരികെ" : "Back"}
        </button>
      </div>

      {/* Header */}
      <div className="text-center pb-1">
        <Cloud className="w-8 h-8 mx-auto" style={{ color: "#D4AF37" }} />
        <p className={`text-sm font-bold mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "#D4AF37" }}>
          {isMl ? "OneDrive ഇറക്കുമതി" : "Import from OneDrive"}
        </p>
        <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>
          {isMl ? "സുരക്ഷിത OAuth കണക്ഷൻ. പാസ്വേഡ് ഒരിക്കലും സംഭരിക്കുന്നില്ല." : "Secure OAuth connection. Password never stored."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg p-3" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}>
          <p className="font-inter text-xs" style={{ color: "#F87171" }}>{error}</p>
        </div>
      )}

      {/* Breadcrumb */}
      {!loading && !error && (
        <div className="flex items-center gap-1 flex-wrap px-1 py-1">
          {breadcrumb.map((crumb, idx) => (
            <span key={crumb.id} className="flex items-center gap-0.5">
              {idx > 0 && <ChevronLeft className="w-3 h-3 rotate-180" style={{ color: "rgba(255,255,255,0.30)" }} />}
              <button onClick={() => navigateToCrumb(idx)}
                className="font-inter text-[10px] font-bold px-1.5 py-0.5 rounded transition-all"
                style={{ color: idx === breadcrumb.length - 1 ? "#D4AF37" : "rgba(255,255,255,0.40)" }}>
                {crumb.name}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#D4AF37" }} />
        </div>
      )}

      {/* Folders */}
      {!loading && folders.length > 0 && (
        <div className="space-y-1.5">
          {folders.map((folder) => (
            <button key={folder.id} onClick={() => navigateTo(folder)}
              className="w-full flex items-center gap-2.5 p-3 rounded-xl transition-all hover:scale-[1.01]"
              style={{ background: "rgba(8,16,38,0.60)", border: "1px solid rgba(212,175,55,0.15)" }}>
              <Folder className="w-4 h-4 flex-shrink-0" style={{ color: "#D4AF37" }} />
              <span className="font-inter text-xs font-bold flex-1 text-left" style={{ color: "rgba(255,255,255,0.80)" }}>
                {folder.name}
              </span>
              <ChevronLeft className="w-3 h-3 rotate-180 flex-shrink-0" style={{ color: "rgba(255,255,255,0.30)" }} />
            </button>
          ))}
        </div>
      )}

      {/* PDF Files */}
      {!loading && pdfFiles.length > 0 && (
        <div className="space-y-1.5">
          {pdfFiles.map((file) => {
            const status = importStatus[file.id];
            const isDone = status && status.status !== "importing";
            return (
              <div key={file.id}
                className="flex items-center gap-2.5 p-3 rounded-xl"
                style={{
                  background: "rgba(8,16,38,0.60)",
                  border: status?.status === "imported" ? "1px solid rgba(74,222,128,0.30)"
                    : status?.status === "error" ? "1px solid rgba(248,113,113,0.30)"
                    : status?.status === "changed" ? "1px solid rgba(251,191,36,0.30)"
                    : "1px solid rgba(212,175,55,0.15)",
                }}>
                {/* Checkbox */}
                <button onClick={() => !isDone && toggleSelect(file.id)}
                  disabled={isDone || importing}
                  className="flex-shrink-0 w-4 h-4 rounded flex items-center justify-center transition-all"
                  style={{
                    border: `1.5px solid ${selected.has(file.id) ? "#D4AF37" : "rgba(255,255,255,0.30)"}`,
                    background: selected.has(file.id) ? "#D4AF37" : "transparent",
                    cursor: (isDone || importing) ? "default" : "pointer",
                  }}>
                  {selected.has(file.id) && <CheckCircle2 className="w-3 h-3" style={{ color: "#0d1b2a" }} />}
                </button>

                <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(212,175,55,0.60)" }} />
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-xs font-bold truncate" style={{ color: "rgba(255,255,255,0.80)" }}>
                    {file.name}
                  </p>
                  <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {Math.round(file.size / 1024)} KB
                  </p>
                </div>

                {/* ANALYZE button — full automatic pipeline */}
                <button onClick={(e) => { e.stopPropagation(); setAnalyzingFile(file); }}
                  disabled={importing}
                  className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
                  style={{ background: "rgba(212,175,55,0.12)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.25)" }}>
                  <Microscope className="w-3 h-3" />
                  {isMl ? "വിശകലനം" : "Analyze"}
                </button>

                {/* Status icon */}
                {status?.status === "importing" && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: "#D4AF37" }} />}
                {status?.status === "imported" && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4ADE80" }} />}
                {status?.status === "duplicate" && <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#94A3B8" }} />}
                {status?.status === "changed" && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#FBBF24" }} />}
                {status?.status === "error" && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F87171" }} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Status messages + actions */}
      {statusEntries.length > 0 && (
        <div className="space-y-1.5">
          {statusEntries.map(([fileId, status]) => {
            const bgColor = status.status === "imported" ? "rgba(74,222,128,0.06)"
              : status.status === "error" ? "rgba(248,113,113,0.06)"
              : status.status === "changed" ? "rgba(251,191,36,0.06)"
              : status.status === "duplicate" ? "rgba(148,163,184,0.06)"
              : "rgba(212,175,55,0.06)";
            const borderColor = status.status === "imported" ? "rgba(74,222,128,0.20)"
              : status.status === "error" ? "rgba(248,113,113,0.20)"
              : status.status === "changed" ? "rgba(251,191,36,0.20)"
              : status.status === "duplicate" ? "rgba(148,163,184,0.20)"
              : "rgba(212,175,55,0.20)";
            return (
              <div key={fileId} className="rounded-lg p-2.5" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
                <p className="font-inter text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.70)" }}>
                  {status.name || fileId}
                </p>
                <p className={`text-[9px] mt-0.5 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.50)" }}>
                  {status.message}
                </p>
                {status.status === "changed" && (
                  <button onClick={() => handleForceReimport(status.file_id, status.book_title)}
                    disabled={importing}
                    className="mt-1.5 flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-bold transition-all"
                    style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.30)" }}>
                    {importing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    {isMl ? "പുതിയ പതിപ്പായി വീണ്ടും ഇറക്കുമതി" : "Re-import as new version"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Import button */}
      {!loading && selected.size > 0 && (
        <button onClick={handleImport} disabled={importing}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all btn-gold">
          {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardDriveDownload className="w-4 h-4" />}
          {importing
            ? (isMl ? "ഇറക്കുമതി ചെയ്യുന്നു..." : "Importing...")
            : `${isMl ? "തിരഞ്ഞെടുത്തത് ഇറക്കുമതി ചെയ്യുക" : "Import Selected"} (${selected.size})`}
        </button>
      )}

      {/* Empty state */}
      {!loading && folders.length === 0 && pdfFiles.length === 0 && !error && (
        <div className="text-center py-8">
          <Folder className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.20)" }} />
          <p className={`text-xs ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.35)" }}>
            {isMl ? "ഈ ഫോൾഡറിൽ PDF ഫയലുകളില്ല." : "No PDF files in this folder."}
          </p>
        </div>
      )}

      {/* Analyze Modal — full automatic pipeline */}
      {analyzingFile && (
        <SirrAnalyzeModal
          file={analyzingFile}
          language={language}
          onClose={() => setAnalyzingFile(null)}
          onComplete={() => { setAnalyzingFile(null); if (onImported) onImported(); }}
        />
      )}
    </div>
  );
}