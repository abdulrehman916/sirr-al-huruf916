// ═══════════════════════════════════════════════════════════════
// SIRR BOOK CARD — library entry with Open / Rename / Delete / Re-import
// ═══════════════════════════════════════════════════════════════
// Operates ONLY on the SIRR-isolated SirrManuscriptBook entity.
// Shows: Malayalam Book Name (editable), Original Book Name, Total
// Pages, Upload Date, Import Status. Never touches other modules.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { BookOpen, FileText, Calendar, Pencil, Trash2, RefreshCw, ChevronLeft, Check, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

function hasText(v) { return v != null && String(v).trim().length > 0; }

function fmtDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch { return String(iso).slice(0, 10); }
}

export default function SirrBookCard({ book, entryCount, onOpen, onRefresh, language }) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(book.malayalam_book_name || "");
  const [savingName, setSavingName] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reimporting, setReimporting] = useState(false);
  const [err, setErr] = useState("");
  const isMl = language === "ml";

  const exColor = book.extraction_status === "completed" ? "#4ADE80"
    : book.extraction_status === "failed" ? "#F87171" : "#FBBF24";

  const saveName = async () => {
    if (!hasText(name)) { setRenaming(false); return; }
    setSavingName(true); setErr("");
    try {
      await base44.entities.SirrManuscriptBook.update(book.sirr_book_id || book._id, {
        malayalam_book_name: name.trim(),
      });
      setRenaming(false);
      if (onRefresh) onRefresh();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setSavingName(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true); setErr("");
    try {
      await base44.entities.SirrManuscriptEntry.deleteMany({ sirr_book_id: book.sirr_book_id });
      await base44.entities.SirrManuscriptBook.delete(book.sirr_book_id || book._id);
      if (onRefresh) onRefresh();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleReimport = async () => {
    if (!hasText(book.original_file_url)) { setErr(isMl ? "മൂല PDF ലഭ്യമല്ല" : "Original PDF unavailable"); return; }
    setReimporting(true); setErr("");
    try {
      const res = await base44.functions.invoke("ingestSirrManuscript", {
        pdf_file_url: book.original_file_url,
        original_file_name: book.original_file_name || "",
        malayalam_book_name: book.malayalam_book_name || "",
        existing_book_id: book.sirr_book_id,
      });
      const result = res?.data || res;
      if (result?.error) throw new Error(result.error);
      if (onRefresh) onRefresh();
    } catch (e) {
      setErr(String(e?.message || e));
    } finally {
      setReimporting(false);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: "1px solid rgba(212,175,55,0.22)",
      }}>
      <button onClick={onOpen} disabled={renaming}
        className="w-full flex items-start gap-3 p-3 text-left transition-all hover:bg-white/[0.02] disabled:opacity-60">
        <BookOpen className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgba(212,175,55,0.55)" }} />
        <div className="flex-1 min-w-0">
          {/* Malayalam Book Name — primary, editable */}
          {renaming ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className={`flex-1 px-2 py-1 rounded-md text-sm font-bold ${isMl ? "font-malayalam" : "font-inter"}`}
                style={{ background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(212,175,55,0.40)" }}
                autoFocus />
              <button onClick={saveName} disabled={savingName}
                className="p-1 rounded" style={{ color: "#4ADE80" }}>
                {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button onClick={() => { setRenaming(false); setName(book.malayalam_book_name || ""); }}
                className="p-1 rounded" style={{ color: "rgba(255,255,255,0.50)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className={`text-base font-bold truncate ${isMl ? "font-malayalam" : "font-inter"}`}
              style={{ color: "rgba(255,255,255,0.90)" }}>
              {book.malayalam_book_name || book.book_title || (isMl ? "പേരിടാത്ത ഗ്രന്ഥം" : "Untitled Book")}
            </p>
          )}
          {/* Original Book Name */}
          {hasText(book.book_title) && book.book_title !== book.malayalam_book_name && (
            <p className="font-inter text-[11px] truncate mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
              {book.book_title}
            </p>
          )}
          {hasText(book.book_title_ar) && book.book_title_ar !== book.book_title && (
            <p className="font-amiri text-sm truncate mt-0.5" style={{ color: "rgba(212,175,55,0.55)", direction: "rtl" }}>
              {book.book_title_ar}
            </p>
          )}
          {/* Meta: pages · sections · upload date · status */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="flex items-center gap-0.5 font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              <FileText className="w-2.5 h-2.5" /> {book.total_pages || "?"} {isMl ? "പേജ്" : "pg"}
            </span>
            <span className="font-inter text-[10px]" style={{ color: "rgba(129,140,248,0.55)" }}>
              {entryCount} {isMl ? "വിഭാഗം" : "sections"}
            </span>
            <span className="flex items-center gap-0.5 font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              <Calendar className="w-2.5 h-2.5" /> {fmtDate(book.upload_date)}
            </span>
            <span className="font-inter text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: `${exColor}15`, color: exColor, border: `1px solid ${exColor}40` }}>
              {book.extraction_status || "—"}
            </span>
          </div>
          {hasText(book.extraction_error) && (
            <p className="font-inter text-[9px] mt-1 line-clamp-2" style={{ color: "rgba(248,113,113,0.70)" }}>{book.extraction_error}</p>
          )}
        </div>
        {!renaming && <ChevronLeft className="w-4 h-4 flex-shrink-0 mt-1 rotate-180" style={{ color: "rgba(212,175,55,0.60)" }} />}
      </button>

      {/* Action bar: Rename · Re-import · Delete */}
      <div className="flex items-center gap-1.5 px-3 pb-3 pt-1" style={{ borderTop: "1px solid rgba(212,175,55,0.10)" }}>
        <button onClick={() => setRenaming(true)} disabled={reimporting || deleting}
          className="flex items-center gap-1 px-2 py-1 rounded-md font-inter text-[10px] font-bold"
          style={{ background: "rgba(212,175,55,0.08)", color: "rgba(212,175,55,0.75)", border: "1px solid rgba(212,175,55,0.20)" }}>
          <Pencil className="w-3 h-3" /> {isMl ? "പേരുമാറ്റം" : "Rename"}
        </button>
        <button onClick={handleReimport} disabled={reimporting || deleting}
          className="flex items-center gap-1 px-2 py-1 rounded-md font-inter text-[10px] font-bold"
          style={{ background: "rgba(129,140,248,0.08)", color: "rgba(129,140,248,0.75)", border: "1px solid rgba(129,140,248,0.20)" }}>
          {reimporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {isMl ? "വീണ്ടും ഇറക്കുമതി" : "Re-import"}
        </button>
        <div className="flex-1" />
        {!confirmDelete ? (
          <button onClick={() => setConfirmDelete(true)} disabled={reimporting || deleting}
            className="flex items-center gap-1 px-2 py-1 rounded-md font-inter text-[10px] font-bold"
            style={{ background: "rgba(248,113,113,0.06)", color: "rgba(248,113,113,0.70)", border: "1px solid rgba(248,113,113,0.18)" }}>
            <Trash2 className="w-3 h-3" /> {isMl ? "നീക്കം" : "Delete"}
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button onClick={handleDelete} disabled={deleting}
              className="px-2 py-1 rounded-md font-inter text-[10px] font-bold"
              style={{ background: "rgba(248,113,113,0.18)", color: "#F87171", border: "1px solid rgba(248,113,113,0.45)" }}>
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : (isMl ? "സ്ഥിരീകരിക്കുക" : "Confirm")}
            </button>
            <button onClick={() => setConfirmDelete(false)} disabled={deleting}
              className="px-2 py-1 rounded-md font-inter text-[10px] font-bold"
              style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.12)" }}>
              {isMl ? "റദ്ദാക്കുക" : "Cancel"}
            </button>
          </div>
        )}
      </div>
      {err && <p className="font-inter text-[9px] px-3 pb-2" style={{ color: "#F87171" }}>{err}</p>}
    </div>
  );
}