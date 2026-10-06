// ═══════════════════════════════════════════════════════════════
// SIRR ONEDRIVE FOLDER IMPORTER — ENTERPRISE BULK IMPORT
// ═══════════════════════════════════════════════════════════════
// Admin-only. Recursively scans a OneDrive folder for ALL PDFs
// and imports each through the existing importFromOneDrive pipeline.
//
// Features:
//   - Folder navigation with breadcrumb (reuse browseOneDrive)
//   - "Import All PDFs from This Folder" button
//   - Recursive subfolder scanning (all levels)
//   - Live progress: total, current, imported, updated, skipped, failed, remaining, ETA
//   - Resume support: detects interrupted jobs and offers resume
//   - Final report with complete stats
//   - Never stops on single PDF failure
//   - Duplicate detection (SHA-256 + file ID + etag)
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback, useRef } from "react";
import {
  ChevronLeft, Folder, FileText, Loader2, FolderTree,
  CheckCircle2, AlertCircle, Play, RotateCcw, Shield,
  HardDriveDownload, Clock, X, ListChecks
} from "lucide-react";
import { base44 } from "@/api/base44Client";

// ── Time formatter ──
function formatTime(ms) {
  if (!ms || ms < 0) return "—";
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) return `${minutes}m ${remainingSeconds}s`;
  return `${remainingSeconds}s`;
}

// ── Stat card ──
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
      <Icon className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color }} />
      <p className="font-inter text-lg font-bold" style={{ color }}>{value}</p>
      <p className="font-inter text-[8px] uppercase tracking-wide" style={{ color: `${color}99` }}>{label}</p>
    </div>
  );
}

// ── Result row ──
function ResultRow({ result, isMl }) {
  const config = {
    imported: { color: "#4ADE80", icon: CheckCircle2, label: isMl ? "ഇറക്കുമതി" : "Imported" },
    updated: { color: "#FBBF24", icon: RotateCcw, label: isMl ? "അപ്ഡേറ്റ്" : "Updated" },
    skipped: { color: "#94A3B8", icon: CheckCircle2, label: isMl ? "ഒഴിവാക്കി" : "Skipped" },
    failed: { color: "#F87171", icon: AlertCircle, label: isMl ? "പരാജയം" : "Failed" },
  };
  const c = config[result.status] || config.failed;
  const Icon = c.icon;
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: `${c.color}08`, border: `1px solid ${c.color}20` }}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.color }} />
      <div className="flex-1 min-w-0">
        <p className="font-inter text-[10px] font-bold truncate" style={{ color: "rgba(255,255,255,0.80)" }}>
          {result.file_name}
        </p>
        {result.error ? (
          <p className="font-inter text-[9px] truncate" style={{ color: "#F87171" }}>{result.error}</p>
        ) : (
          <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>
            {c.label} · {formatTime(result.processing_time_ms)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SirrOneDriveFolderImporter({ onBack, onImported, language }) {
  const isMl = language === "ml";
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Folder browsing state
  const [breadcrumb, setBreadcrumb] = useState([{ id: "root", name: isMl ? "എന്റെ OneDrive" : "My OneDrive" }]);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [browseError, setBrowseError] = useState("");

  // Import state
  const [phase, setPhase] = useState("browsing"); // browsing | scanning | processing | completed | error
  const [job, setJob] = useState(null);
  const [importError, setImportError] = useState("");
  const [resumableJob, setResumableJob] = useState(null);
  const loopRef = useRef(false);

  // ── Stop loop on unmount ──
  useEffect(() => {
    return () => { loopRef.current = false; };
  }, []);

  // ── Check admin status + check for resumable jobs ──
  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      if (authed) {
        try {
          const me = await base44.auth.me();
          setIsAdmin(me.role === "admin");
          if (me.role === "admin") {
            // Check for interrupted jobs
            try {
              const jobs = await base44.entities.BulkImportJob.filter(
                { status: "processing" },
                "-started_at",
                5
              );
              if (jobs && jobs.length > 0) {
                setResumableJob(jobs[0]);
              }
            } catch {}
          }
        } catch { setIsAdmin(false); }
      }
      setAuthChecked(true);
    });
  }, []);

  // ── Browse folder ──
  const browse = useCallback(async (folderId) => {
    setLoading(true);
    setBrowseError("");
    try {
      const res = await base44.functions.invoke("browseOneDrive", { folder_id: folderId });
      const data = res.data;
      setFolders(data.folders || []);
      setFiles(data.files || []);
    } catch (e) {
      setBrowseError(e.response?.data?.error || e.message || "Failed to browse OneDrive");
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

  // ── Start bulk import for selected folder ──
  const startBulkImport = async (folderId, folderName) => {
    setPhase("scanning");
    setImportError("");
    setJob(null);
    loopRef.current = true;

    try {
      // Step 1: Create job (scan folder)
      const createRes = await base44.functions.invoke("bulkImportOneDriveFolder", { folder_id: folderId });
      const createData = createRes.data;

      if (createData.error) {
        setImportError(createData.error);
        setPhase("error");
        return;
      }

      if (createData.total_pdfs === 0) {
        setJob({ ...createData, total_pdfs: 0, status: "completed", imported: 0, updated: 0, skipped: 0, failed: 0, results: [] });
        setPhase("completed");
        return;
      }

      setJob(createData);
      setPhase("processing");

      // Step 2: Loop — process one PDF per call
      const currentJobId = createData.job_id;
      await processLoop(currentJobId);
    } catch (e) {
      setImportError(e.response?.data?.error || e.message || "Failed to start bulk import");
      setPhase("error");
    }
  };

  // ── Resume interrupted job ──
  const resumeJob = async () => {
    if (!resumableJob) return;
    setPhase("processing");
    setImportError("");
    setJob({
      job_id: resumableJob.job_id,
      total_pdfs: resumableJob.total_pdfs,
      current_index: resumableJob.current_index,
      imported: resumableJob.imported,
      updated: resumableJob.updated,
      skipped: resumableJob.skipped,
      failed: resumableJob.failed,
      results: resumableJob.results || [],
      processing_time_ms: resumableJob.processing_time_ms,
      status: "processing",
    });
    loopRef.current = true;
    setResumableJob(null);
    await processLoop(resumableJob.job_id);
  };

  // ── Processing loop — calls backend repeatedly until completed ──
  const processLoop = async (jobId) => {
    while (loopRef.current) {
      try {
        const res = await base44.functions.invoke("bulkImportOneDriveFolder", { job_id: jobId });
        const data = res.data;

        if (data.error) {
          setImportError(data.error);
          setPhase("error");
          loopRef.current = false;
          return;
        }

        setJob(data);

        if (data.status === "completed" || data.status === "already_completed") {
          setPhase("completed");
          loopRef.current = false;
          if (onImported) onImported();
          return;
        }

        if (data.status === "batch_complete") {
          // Continue loop — process next PDF
          continue;
        }

        // Unknown status — stop
        loopRef.current = false;
        setPhase("error");
        setImportError("Unexpected status: " + data.status);
        return;
      } catch (e) {
        setImportError(e.response?.data?.error || e.message || "Import loop failed");
        setPhase("error");
        loopRef.current = false;
        return;
      }
    }
  };

  // ── Cancel ──
  const handleCancel = () => {
    loopRef.current = false;
    setPhase("browsing");
    setJob(null);
  };

  // ── Reset to browser ──
  const handleReset = () => {
    setPhase("browsing");
    setJob(null);
    setImportError("");
    setResumableJob(null);
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

  // ═════════════════════════════════════════════════════════════
  // COMPLETED VIEW — Final report
  // ═════════════════════════════════════════════════════════════
  if (phase === "completed" && job) {
    const results = job.results || [];
    const failedResults = results.filter((r) => r.status === "failed");
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <ChevronLeft className="w-4 h-4" /> {isMl ? "ഫോൾഡർ തിരഞ്ഞെടുക്കുക" : "Select Another Folder"}
          </button>
          <button onClick={onBack}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all ml-auto"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
            {isMl ? "ലൈബ്രറിയിലേക്ക്" : "Back to Library"}
          </button>
        </div>

        {/* Success header */}
        <div className="text-center py-4">
          <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center"
            style={{ background: "rgba(74,222,128,0.10)", border: "2px solid rgba(74,222,128,0.30)" }}>
            <CheckCircle2 className="w-7 h-7" style={{ color: "#4ADE80" }} />
          </div>
          <p className={`text-base font-bold mt-2 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "#4ADE80" }}>
            {isMl ? "ബൾക്ക് ഇറക്കുമതി പൂർത്തിയായി" : "Bulk Import Complete"}
          </p>
          <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>
            {isMl ? "മൊത്തം സമയം" : "Total time"}: {formatTime(job.processing_time_ms)}
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard icon={CheckCircle2} label={isMl ? "ഇറക്കുമതി" : "Imported"} value={job.imported || 0} color="#4ADE80" />
          <StatCard icon={RotateCcw} label={isMl ? "അപ്ഡേറ്റ്" : "Updated"} value={job.updated || 0} color="#FBBF24" />
          <StatCard icon={CheckCircle2} label={isMl ? "ഒഴിവാക്കി" : "Skipped"} value={job.skipped || 0} color="#94A3B8" />
          <StatCard icon={AlertCircle} label={isMl ? "പരാജയം" : "Failed"} value={job.failed || 0} color="#F87171" />
          <StatCard icon={ListChecks} label={isMl ? "മൊത്തം" : "Total"} value={job.total_pdfs || 0} color="#D4AF37" />
          <StatCard icon={Clock} label={isMl ? "സമയം" : "Time"} value={formatTime(job.processing_time_ms)} color="#60A5FA" />
        </div>

        {/* Results list */}
        {results.length > 0 && (
          <div className="space-y-1.5">
            <p className="font-inter text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: "rgba(255,255,255,0.50)" }}>
              {isMl ? "ഫലങ്ങൾ" : "Results"} ({results.length})
            </p>
            <div className="space-y-1.5 max-h-[40vh] overflow-y-auto scrollbar-none">
              {results.map((r, idx) => (
                <ResultRow key={idx} result={r} isMl={isMl} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // PROCESSING / SCANNING VIEW — Live progress
  // ═════════════════════════════════════════════════════════════
  if (phase === "scanning" || phase === "processing") {
    const isScanning = phase === "scanning";
    const total = job?.total_pdfs || 0;
    const currentIndex = job?.current_index || 0;
    const imported = job?.imported || 0;
    const updated = job?.updated || 0;
    const skipped = job?.skipped || 0;
    const failed = job?.failed || 0;
    const remaining = isScanning ? total : (job?.remaining ?? (total - currentIndex));
    const processed = imported + updated + skipped + failed;
    const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;
    const avgTimePerPdf = processed > 0 ? (job?.processing_time_ms || 0) / processed : 56000;
    const estimatedRemainingMs = remaining * avgTimePerPdf;
    const results = job?.results || [];

    return (
      <div className="space-y-3">
        {/* Cancel button */}
        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleCancel}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <X className="w-3.5 h-3.5" /> {isMl ? "റദ്ദാക്കുക" : "Cancel"}
          </button>
        </div>

        {/* Header */}
        <div className="text-center py-2">
          <Loader2 className="w-8 h-8 mx-auto animate-spin" style={{ color: "#D4AF37" }} />
          <p className={`text-sm font-bold mt-2 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "#D4AF37" }}>
            {isScanning
              ? (isMl ? "ഫോൾഡർ സ്കാൻ ചെയ്യുന്നു..." : "Scanning folder...")
              : (isMl ? "PDF ഇറക്കുമതി ചെയ്യുന്നു..." : "Importing PDFs...")}
          </p>
        </div>

        {/* Progress bar */}
        {!isScanning && total > 0 && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-inter text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.70)" }}>
                {processed} / {total}
              </span>
              <span className="font-inter text-[10px] font-bold" style={{ color: "#D4AF37" }}>
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%`, background: "linear-gradient(90deg, #D4AF37, #f6d860)" }} />
            </div>
          </div>
        )}

        {/* Current PDF */}
        {!isScanning && job?.current_pdf && (
          <div className="rounded-lg p-2.5 flex items-center gap-2" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.20)" }}>
            <FileText className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" style={{ color: "#D4AF37" }} />
            <div className="flex-1 min-w-0">
              <p className="font-inter text-[9px] uppercase tracking-wide" style={{ color: "rgba(212,175,55,0.70)" }}>
                {isMl ? "നിലവിൽ പ്രോസസ്സ് ചെയ്യുന്നു" : "Now Processing"}
              </p>
              <p className="font-inter text-[10px] font-bold truncate" style={{ color: "rgba(255,255,255,0.80)" }}>
                {job.current_pdf}
              </p>
            </div>
          </div>
        )}

        {/* Stats grid */}
        {!isScanning && (
          <div className="grid grid-cols-3 gap-2">
            <StatCard icon={CheckCircle2} label={isMl ? "ഇറക്കുമതി" : "Imported"} value={imported} color="#4ADE80" />
            <StatCard icon={RotateCcw} label={isMl ? "അപ്ഡേറ്റ്" : "Updated"} value={updated} color="#FBBF24" />
            <StatCard icon={CheckCircle2} label={isMl ? "ഒഴിവാക്കി" : "Skipped"} value={skipped} color="#94A3B8" />
            <StatCard icon={AlertCircle} label={isMl ? "പരാജയം" : "Failed"} value={failed} color="#F87171" />
            <StatCard icon={Clock} label={isMl ? "ശേഷിക്കുന്നത്" : "Remaining"} value={remaining} color="#D4AF37" />
            <StatCard icon={Clock} label={isMl ? "എന്ത" : "ETA"} value={formatTime(estimatedRemainingMs)} color="#60A5FA" />
          </div>
        )}

        {/* Live results (last 5) */}
        {!isScanning && results.length > 0 && (
          <div className="space-y-1.5">
            <p className="font-inter text-[10px] font-bold uppercase tracking-wide px-1" style={{ color: "rgba(255,255,255,0.50)" }}>
              {isMl ? "സമീപകാല ഫലങ്ങൾ" : "Recent Results"}
            </p>
            {results.slice(-5).reverse().map((r, idx) => (
              <ResultRow key={results.length - 1 - idx} result={r} isMl={isMl} />
            ))}
          </div>
        )}

        {/* Scanning info */}
        {isScanning && (
          <div className="text-center py-4">
            <p className={`text-xs ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.50)" }}>
              {isMl ? "ഉപ്പഫോൾഡറുകൾ ഉൾപ്പെടെ എല്ലാ PDF ഫയലുകളും തിരയുന്നു..." : "Searching for all PDFs including subfolders..."}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // ERROR VIEW
  // ═════════════════════════════════════════════════════════════
  if (phase === "error") {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
            <ChevronLeft className="w-4 h-4" /> {isMl ? "തിരികെ" : "Back"}
          </button>
        </div>
        <div className="text-center py-4">
          <AlertCircle className="w-10 h-10 mx-auto mb-2" style={{ color: "#F87171" }} />
          <p className={`text-sm ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "#F87171" }}>
            {importError || (isMl ? "ഇറക്കുമതി പരാജയപ്പെട്ടു" : "Import failed")}
          </p>
          {job?.job_id && (
            <p className="font-inter text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.40)" }}>
              {isMl ? "ജോബ് ID" : "Job ID"}: {job.job_id}
            </p>
          )}
        </div>
        {job?.job_id && (
          <button onClick={() => { setPhase("processing"); loopRef.current = true; processLoop(job.job_id); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all btn-gold">
            <RotateCcw className="w-4 h-4" />
            {isMl ? "പുനരാരംഭിക്കുക" : "Resume Import"}
          </button>
        )}
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // BROWSING VIEW — Folder selection
  // ═════════════════════════════════════════════════════════════
  const currentFolder = breadcrumb[breadcrumb.length - 1];
  const currentFolderPdfCount = files.filter((f) => f.is_pdf).length;

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
        <FolderTree className="w-8 h-8 mx-auto" style={{ color: "#D4AF37" }} />
        <p className={`text-sm font-bold mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "#D4AF37" }}>
          {isMl ? "ഫോൾഡർ ബൾക്ക് ഇറക്കുമതി" : "Bulk Folder Import"}
        </p>
        <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.30)" }}>
          {isMl ? "ഉപ്പഫോൾഡറുകൾ ഉൾപ്പെടെ എല്ലാ PDF സ്വയമേവ ഇറക്കുമതി ചെയ്യും" : "Auto-imports all PDFs including subfolders"}
        </p>
      </div>

      {/* Resumable job banner */}
      {resumableJob && (
        <div className="rounded-xl p-3" style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <RotateCcw className="w-4 h-4 flex-shrink-0" style={{ color: "#FBBF24" }} />
            <p className="font-inter text-xs font-bold" style={{ color: "#FBBF24" }}>
              {isMl ? "തടസ്സപ്പെട്ട ഇറക്കുമതി കണ്ടെത്തി" : "Interrupted Import Found"}
            </p>
          </div>
          <p className="font-inter text-[10px] mb-2" style={{ color: "rgba(255,255,255,0.60)" }}>
            {isMl ? "ഫോൾഡർ" : "Folder"}: {resumableJob.folder_name} · {resumableJob.current_index || 0}/{resumableJob.total_pdfs}
          </p>
          <button onClick={resumeJob}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all"
            style={{ background: "rgba(251,191,36,0.15)", color: "#FBBF24", border: "1px solid rgba(251,191,36,0.30)" }}>
            <Play className="w-3.5 h-3.5" /> {isMl ? "പുനരാരംഭിക്കുക" : "Resume Import"}
          </button>
        </div>
      )}

      {/* Browse error */}
      {browseError && (
        <div className="rounded-lg p-3" style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)" }}>
          <p className="font-inter text-xs" style={{ color: "#F87171" }}>{browseError}</p>
        </div>
      )}

      {/* Breadcrumb */}
      {!loading && !browseError && (
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

      {/* PDF count in current folder */}
      {!loading && currentFolderPdfCount > 0 && (
        <div className="rounded-lg p-2 flex items-center gap-2" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
          <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D4AF37" }} />
          <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
            {currentFolderPdfCount} PDF{currentFolderPdfCount === 1 ? "" : "s"} {isMl ? "ഈ ഫോൾഡറിൽ (ഉപ്പഫോൾഡറുകൾ ഒഴികെ)" : "in this folder (excluding subfolders)"}
          </span>
        </div>
      )}

      {/* Import Folder button */}
      {!loading && !browseError && currentFolder.id !== "root" && (
        <button onClick={() => startBulkImport(currentFolder.id, currentFolder.name)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all btn-gold">
          <HardDriveDownload className="w-4 h-4" />
          {isMl
            ? `ഈ ഫോൾഡറിൽ നിന്ന് എല്ലാ PDF ഇറക്കുമതി ചെയ്യുക`
            : `Import All PDFs from "${currentFolder.name}"`}
        </button>
      )}

      {/* Root folder note */}
      {!loading && currentFolder.id === "root" && (
        <div className="text-center py-3">
          <p className={`text-[10px] ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.35)" }}>
            {isMl ? "ഇറക്കുമതി ചെയ്യാൻ ഒരു ഫോൾഡർ തിരഞ്ഞെടുക്കുക." : "Select a folder to start importing."}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && folders.length === 0 && currentFolderPdfCount === 0 && !browseError && (
        <div className="text-center py-6">
          <Folder className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(255,255,255,0.20)" }} />
          <p className={`text-xs ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.35)" }}>
            {isMl ? "ഈ ഫോൾഡറിൽ ഫയലുകളൊന്നുമില്ല." : "No files in this folder."}
          </p>
        </div>
      )}
    </div>
  );
}