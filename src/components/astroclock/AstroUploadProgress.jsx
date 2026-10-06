// ═══════════════════════════════════════════════════════════════
// ASTRO UPLOAD PROGRESS — Batch upload progress display
// Shows: current page / total, progress bar, success count,
// failed count, and estimated remaining time (ETA).
// ═══════════════════════════════════════════════════════════════
import { Loader2 } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";

export default function AstroUploadProgress({ pages, currentIdx, stage, pdfProgress, startTime }) {
  const { txt } = useAstroClockLanguage();

  const total = pages.length;
  const completed = pages.filter(p =>
    ['done', 'rejected', 'duplicate', 'error'].includes(p.status)
  ).length;
  const successCount = pages.filter(p =>
    p.status === 'done' || p.status === 'duplicate'
  ).length;
  const failedCount = pages.filter(p => p.status === 'error').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  // ETA: average time per completed page × remaining pages
  let etaText = '';
  if (startTime && completed > 0) {
    const elapsedSec = (Date.now() - startTime) / 1000;
    const avgPerPage = elapsedSec / completed;
    const remaining = total - completed;
    const etaSec = Math.round(avgPerPage * remaining);
    if (remaining > 0 && etaSec > 0) {
      etaText = txt(`~${etaSec}സെ`, `~${etaSec}s`, `~${etaSec}ث`);
    }
  }

  // Current stage label
  let stageText = '';
  if (stage === 'preparing' && pdfProgress) {
    stageText = `${txt("PDF വായിക്കുന്നു", "Reading PDF", "قراءة PDF")}: ${pdfProgress.fileName}`;
    if (pdfProgress.current > 0) stageText += ` (${pdfProgress.current}/${pdfProgress.total})`;
  } else if (stage === 'processing' && currentIdx >= 0 && pages[currentIdx]) {
    const p = pages[currentIdx];
    const label = p.status === 'uploading'
      ? txt("അപ്ലോഡ്", "Uploading", "رفع")
      : txt("OCR + കണ്ടെത്തൽ", "OCR + Detection", "OCR + كشف");
    stageText = `${label} — ${txt("പേജ്", "p", "ص")}${currentIdx + 1}/${total}`;
  }

  return (
    <div className="space-y-2">
      {/* Stage label + percentage + ETA */}
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: "#F5D060" }} />
        <span className="font-inter text-[10px] font-bold truncate flex-1" style={{ color: "#F5D060" }}>
          {stageText}
        </span>
        <span className="font-inter text-[9px] flex-shrink-0" style={{ color: "rgba(255,255,255,0.40)" }}>
          {pct}%{etaText && ` · ${etaText}`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(212,175,55,0.10)" }}>
        <div className="h-full transition-all duration-300" style={{
          width: `${pct}%`,
          background: "linear-gradient(90deg, #D4AF37, #F5D060)",
        }} />
      </div>

      {/* Counts row */}
      <div className="flex items-center gap-3 font-inter text-[9px]">
        <span style={{ color: "rgba(255,255,255,0.50)" }}>
          {completed}/{total} {txt("പേജ്", "pages", "صفحة")}
        </span>
        <span style={{ color: "rgba(74,222,128,0.70)" }}>
          ✓ {successCount} {txt("വിജയം", "ok", "نجاح")}
        </span>
        {failedCount > 0 && (
          <span style={{ color: "rgba(248,113,113,0.70)" }}>
            ✕ {failedCount} {txt("പരാജയം", "failed", "فشل")}
          </span>
        )}
      </div>
    </div>
  );
}