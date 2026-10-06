// ═══════════════════════════════════════════════════════════════
// SectionBVisualIntegrator — Tilimsani Source-Page Visual Renderer
//
// ISOLATED to Section B (HolyOnePDFName) ONLY.
// Uses ONLY the approved Tilimsani manuscript already available in
// the HolyNameTranscriptionCache (no external sources, no internet).
//
// WORKFLOW:
//   1. Loads the 65 Tilimsani HolyOnePDFName cards (source_pdf_file
//      === "Tilimsani_MaanilEsma.pdf") that have a cited source page.
//   2. Reads the approved Tilimsani PDF URL from the transcription
//      cache (source_pdf_url).
//   3. Renders each card's CITED source page verbatim (uncropped,
//      unmodified) to a PNG via browser-side pdfjs-dist.
//   4. Uploads each rendered page via UploadFile.
//   5. Appends the page image to the card's attached_visuals
//      (append-only, dedup by URL). Arabic text and harakat are
//      NEVER touched. No Malayalam is invented.
//
// RULES:
//   - Source = ONLY the approved Tilimsani manuscript (cache URL).
//   - No LLM classification (visual_type = "other" — honest, no guess).
//   - The visual IS the cited source page, exactly as printed.
//   - Never modifies arabic_name, harakat, or any existing field.
//   - Admin/Owner only.
// ═══════════════════════════════════════════════════════════════
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, AlertCircle, Eye, ChevronDown,
  Sparkles, Image as ImageIcon, Play,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const TILIMSANI_FILE = "Tilimsani_MaanilEsma.pdf";
const RENDER_SCALE = 2;

const P = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(245,208,96,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

// Lazy load pdfjs-dist (same pattern as astroPdfRenderer / SectionC)
let _pdfjsLibPromise = null;
async function loadPdfjs() {
  if (_pdfjsLibPromise) return _pdfjsLibPromise;
  _pdfjsLibPromise = (async () => {
    const lib = await import("pdfjs-dist");
    lib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4/build/pdf.worker.min.mjs";
    return lib;
  })();
  return _pdfjsLibPromise;
}

export default function SectionBVisualIntegrator() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, page: 0, desc: "" });
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const run = useCallback(async () => {
    setRunning(true);
    setDone(false);
    setError("");
    setReport(null);
    const results = [];
    let attached = 0, duplicates = 0, errors = 0, noPage = 0;

    try {
      // 1. Load the 65 Tilimsani Section B cards
      setProgress({ current: 0, total: 1, page: 0, desc: "Loading Tilimsani cards…" });
      const cards = await base44.entities.HolyOnePDFName.filter(
        { source_pdf_file: TILIMSANI_FILE }, null, 200
      );
      const targets = cards.filter(c => Number(c.source_pdf_page) > 0);
      noPage = cards.length - targets.length;
      if (targets.length === 0) {
        setReport({ total: cards.length, attached: 0, duplicates: 0, errors: 0, noPage, uniquePages: 0, results });
        setDone(true);
        toast({ title: "No Tilimsani cards with a cited source page found" });
        return;
      }

      // 2. Read the approved Tilimsani PDF URL from the transcription cache
      setProgress({ current: 0, total: 1, page: 0, desc: "Locating approved Tilimsani source…" });
      const cacheHits = await base44.entities.HolyNameTranscriptionCache.filter(
        { source_pdf_file: TILIMSANI_FILE }, null, 1
      );
      const pdfUrl = cacheHits?.[0]?.source_pdf_url;
      if (!pdfUrl) throw new Error("Tilimsani source URL not found in transcription cache");

      // 3. Fetch + load the PDF (approved source only)
      setProgress({ current: 0, total: 1, page: 0, desc: "Loading approved Tilimsani manuscript…" });
      const resp = await fetch(pdfUrl);
      if (!resp.ok) throw new Error(`Failed to fetch source PDF (${resp.status})`);
      const buf = await resp.arrayBuffer();
      const pdfjsLib = await loadPdfjs();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

      // 4. Group cards by cited page (render each unique page once)
      const byPage = {};
      for (const c of targets) {
        const p = Number(c.source_pdf_page);
        if (!byPage[p]) byPage[p] = [];
        byPage[p].push(c);
      }
      const pageNumbers = Object.keys(byPage).map(Number).sort((a, b) => a - b);

      // 5. Render each cited page, attach to all cards citing it
      for (let i = 0; i < pageNumbers.length; i++) {
        const pn = pageNumbers[i];
        const pageCards = byPage[pn];
        setProgress({
          current: i,
          total: pageNumbers.length,
          page: pn,
          desc: `Rendering source page ${pn} (${pageCards.length} card${pageCards.length > 1 ? "s" : ""})…`,
        });

        let imageUrl = "";
        try {
          const page = await pdf.getPage(pn);
          const viewport = page.getViewport({ scale: RENDER_SCALE });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;
          const blob = await new Promise(r => canvas.toBlob(r, "image/png", 0.92));
          canvas.width = 0;
          canvas.height = 0;
          page.cleanup();
          if (!blob) throw new Error("page render produced no blob");
          const file = new File([blob], `section_b_tilimsani_p${pn}.png`, { type: "image/png" });
          const up = await base44.integrations.Core.UploadFile({ file });
          imageUrl = up?.file_url || "";
          if (!imageUrl) throw new Error("upload returned no url");
        } catch (e) {
          for (const c of pageCards) {
            errors++;
            results.push({ page: pn, card: c.pdf_name_id, status: "render_error", error: String(e?.message || e) });
          }
          continue;
        }

        // Attach (append-only, dedup by URL) — NEVER touch Arabic / harakat / other fields
        for (const c of pageCards) {
          try {
            const existing = Array.isArray(c.attached_visuals) ? c.attached_visuals : [];
            if (existing.some(v => v.visual_url === imageUrl)) {
              duplicates++;
              results.push({ page: pn, card: c.pdf_name_id, status: "duplicate" });
              continue;
            }
            const newVisual = {
              visual_url: imageUrl,
              visual_type: "other",
              description: `Source page ${pn} — Tilimsani Maʿānī al-Asmāʾ (rendered verbatim, uncropped)`,
              source_reference: TILIMSANI_FILE,
              source_page: String(pn),
              order_on_page: 0,
              imported_at: new Date().toISOString(),
            };
            await base44.entities.HolyOnePDFName.update(c.id, { attached_visuals: [...existing, newVisual] });
            attached++;
            results.push({ page: pn, card: c.pdf_name_id, status: "attached" });
          } catch (e) {
            errors++;
            results.push({ page: pn, card: c.pdf_name_id, status: "attach_error", error: String(e?.message || e) });
          }
        }
      }

      try { pdf.destroy(); } catch (_) {}

      setReport({
        total: cards.length,
        targets: targets.length,
        uniquePages: pageNumbers.length,
        attached,
        duplicates,
        errors,
        noPage,
        results,
      });
      setDone(true);
      setProgress({ current: pageNumbers.length, total: pageNumbers.length, page: 0, desc: "Complete" });
      toast({
        title: "Tilimsani visual render complete",
        description: `${attached} attached · ${duplicates} duplicates · ${errors} errors`,
      });
    } catch (e) {
      setError(String(e?.message || e));
      setReport({ attached, duplicates, errors, noPage, results, aborted: true });
      setDone(true);
      toast({ title: "Pipeline failed", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setRunning(false);
    }
  }, [toast]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(8,16,38,0.55)", border: `1px solid ${P.border}` }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: `1px solid ${P.faint}` }}>
        <Eye className="w-4 h-4" style={{ color: P.text }} />
        <span className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: P.text }}>
          Tilimsani Source-Page Visual Renderer · Section B
        </span>
      </div>

      <div className="px-4 py-4 space-y-3">
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
          Renders the cited Tilimsani source page for each of the 65 Section B cards and appends it to the card&rsquo;s visuals.
          Source = approved Tilimsani manuscript only. Arabic &amp; harakat untouched. No Malayalam invented.
        </p>

        {/* Run button */}
        {!running && !done && (
          <button
            onClick={run}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.20), rgba(212,175,55,0.08))",
              border: `1px solid ${P.borderHi}`,
              color: P.text,
            }}
          >
            <Play className="w-4 h-4" />
            <span className="font-inter text-xs font-bold uppercase tracking-widest">
              Render 65 Tilimsani Source Pages
            </span>
          </button>
        )}

        {/* Progress */}
        {running && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: P.text }} />
              <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: P.text }}>
                Rendering &amp; Attaching…
              </span>
            </div>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>
              {progress.desc}
            </p>
            {progress.total > 0 && (
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: P.faint }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                    background: "linear-gradient(90deg, rgba(212,175,55,0.60), rgba(245,208,96,0.80))",
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.30)" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "rgba(239,68,68,0.70)" }} />
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.70)" }}>{error}</p>
          </div>
        )}

        {/* Report */}
        {done && report && (
          <AnimatePresence>
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
              <div className="rounded-xl p-3 space-y-2" style={{ background: P.bgHi, border: `1px solid ${P.borderHi}` }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: P.text }} />
                  <span className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: P.text }}>
                    Render Report
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <ReportStat label="Tilimsani Cards" value={report.total ?? 0} color={P.text} />
                  <ReportStat label="Unique Pages" value={report.uniquePages ?? 0} color={P.text} />
                  <ReportStat label="Attached" value={report.attached ?? 0} color="rgba(74,222,128,0.70)" />
                  <ReportStat label="Duplicates Skipped" value={report.duplicates ?? 0} color="rgba(148,163,184,0.60)" />
                  <ReportStat label="No Cited Page" value={report.noPage ?? 0} color="rgba(251,191,36,0.65)" />
                  <ReportStat label="Errors" value={report.errors ?? 0} color="rgba(239,68,68,0.70)" />
                </div>
              </div>

              {report.results?.length > 0 && (
                <details className="rounded-xl overflow-hidden" style={{ background: "rgba(8,16,38,0.4)", border: `1px solid ${P.faint}` }}>
                  <summary className="cursor-pointer flex items-center gap-2 px-3 py-2.5 list-none">
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: P.dim }} />
                    <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: P.dim }}>
                      Detailed Results ({report.results.length})
                    </span>
                  </summary>
                  <div className="px-3 pb-3 space-y-1.5 max-h-60 overflow-y-auto">
                    {report.results.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: "rgba(8,16,38,0.5)" }}>
                        <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.60)" }}>p.{r.page}</span>
                        <span className="font-inter text-[9px] flex-1 truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{r.card}</span>
                        <span className="font-inter text-[8px]" style={{
                          color: r.status === "attached" ? "rgba(74,222,128,0.70)"
                            : r.status === "duplicate" ? "rgba(148,163,184,0.60)"
                            : "rgba(239,68,68,0.70)"
                        }}>{r.status}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}

              {!running && (
                <button
                  onClick={run}
                  className="w-full px-4 py-2.5 rounded-xl font-inter text-xs font-semibold"
                  style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.dim }}
                >
                  Re-run Pipeline
                </button>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

function ReportStat({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.40)" }}>{label}</span>
      <span className="font-inter text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  );
}