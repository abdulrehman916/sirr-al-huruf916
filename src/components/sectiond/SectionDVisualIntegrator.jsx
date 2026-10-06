// ═══════════════════════════════════════════════════════════════
// SectionDVisualIntegrator — Approved Source-Page Visual Renderer
//
// ISOLATED to Section D (SectionDKnowledge) ONLY.
// Uses ONLY the 36 approved source books already indexed in the
// Master PDF Library (Google Drive live-index). No internet, no
// external rule engines, no Malayalam invention.
//
// WORKFLOW (resume-safe, append-only):
//   1. Loads ALL SectionDKnowledge cards, grouped by source_book_title.
//   2. SKIPS any book whose cards already ALL have visuals (already
//      done — never re-rendered, never duplicated).
//   3. For each remaining book, calls getMasterPdfRenderUrl to fetch
//      the approved Google Drive PDF and expose it as a CDN URL.
//   4. For every card citing that book which still has NO visuals,
//      takes the FIRST cited page (source_page_number), renders it
//      verbatim (uncropped) via browser-side pdfjs-dist, uploads the
//      page image, and APPENDS it to the card's attached_visuals.
//   5. Dedup: a card is never given a second visual for a page it
//      already has (matched by source_reference + source_page).
//      Arabic text, harakat, Malayalam, and every existing field are
//      NEVER touched.
//
// RULES:
//   - Source = ONLY approved Master PDF Library (Google Drive).
//   - visual_type = "source_page" (the cited source page, verbatim).
//   - Append-only. Never overwrites existing visuals or text.
//   - Never invents Malayalam.
//   - Admin/Owner only.
//   - One rendered page image per unique (book, first-page); shared
//     across all cards citing that same page (matches prior run).
// ═══════════════════════════════════════════════════════════════
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, CheckCircle2, AlertCircle, Eye, ChevronDown,
  Play,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const RENDER_SCALE = 2;

const P = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(245,208,96,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

// Lazy load pdfjs-dist (same pattern as Section B / Section C integrators)
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

// Parse a source_page_number string and return the FIRST page integer.
// Handles "57,58,59", "57-60", "57", "129,130,...".
function firstPageOf(pageStr) {
  if (!pageStr) return 0;
  const s = String(pageStr).trim();
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export default function SectionDVisualIntegrator() {
  const { toast } = useToast();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState({ bookIdx: 0, bookTotal: 0, book: "", page: 0, desc: "" });
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  const run = useCallback(async () => {
    setRunning(true);
    setDone(false);
    setError("");
    setReport(null);
    const bookReports = [];
    let totalAttached = 0, totalSkippedDone = 0, totalErrors = 0, totalNoPage = 0;

    try {
      // 1. Load ALL Section D cards (server-side, paginated)
      setProgress({ bookIdx: 0, bookTotal: 0, book: "", page: 0, desc: "Loading Section D cards…" });
      const allCards = [];
      let skip = 0;
      const PAGE = 100;
      while (true) {
        const batch = await base44.entities.SectionDKnowledge.list("-created_date", PAGE, skip);
        if (!batch || batch.length === 0) break;
        allCards.push(...batch);
        if (batch.length < PAGE) break;
        skip += PAGE;
      }

      // 2. Group by source_book_title
      const byBook = {};
      for (const c of allCards) {
        const bt = (c.source_book_title || "").trim();
        if (!bt) continue;
        if (!byBook[bt]) byBook[bt] = [];
        byBook[bt].push(c);
      }
      const bookTitles = Object.keys(byBook);

      // 3. Determine which books still need work (have ≥1 card with NO visuals)
      const neededBooks = [];
      const doneBooks = [];
      for (const bt of bookTitles) {
        const cards = byBook[bt];
        const pending = cards.filter(c => !Array.isArray(c.attached_visuals) || c.attached_visuals.length === 0);
        if (pending.length > 0) {
          neededBooks.push({ title: bt, cards, pending });
        } else {
          doneBooks.push(bt);
        }
      }
      totalSkippedDone = doneBooks.length;

      if (neededBooks.length === 0) {
        setReport({ totalCards: allCards.length, booksTotal: bookTitles.length, booksDone: bookTitles.length, booksSkippedAlreadyDone: bookTitles.length, booksFailed: 0, attached: 0, noPage: 0, errors: 0, bookReports: [] });
        setDone(true);
        toast({ title: "All Section D books already have visuals — nothing to render." });
        return;
      }

      // 4. Process each needed book
      for (let bi = 0; bi < neededBooks.length; bi++) {
        const { title, pending } = neededBooks[bi];
        const br = { book: title, pendingCards: pending.length, attached: 0, duplicates: 0, noPage: 0, errors: 0, status: "ok", detail: "" };

        setProgress({ bookIdx: bi, bookTotal: neededBooks.length, book: title, page: 0, desc: `Resolving approved source ${bi + 1}/${neededBooks.length} — ${title}` });

        let pdfUrl = "";
        try {
          const res = await base44.functions.invoke("getMasterPdfRenderUrl", { book_title: title });
          pdfUrl = res?.data?.file_url || res?.file_url || "";
          if (!pdfUrl) throw new Error("resolver returned no file_url");
        } catch (e) {
          br.status = "resolve_failed";
          br.detail = String(e?.message || e);
          br.errors = pending.length;
          totalErrors += pending.length;
          bookReports.push(br);
          continue;
        }

        // Fetch + load the approved PDF
        setProgress({ bookIdx: bi, bookTotal: neededBooks.length, book: title, page: 0, desc: `Loading approved PDF — ${title}` });
        let pdf;
        try {
          const resp = await fetch(pdfUrl);
          if (!resp.ok) throw new Error(`fetch PDF failed (${resp.status})`);
          const buf = await resp.arrayBuffer();
          const pdfjsLib = await loadPdfjs();
          pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        } catch (e) {
          br.status = "load_failed";
          br.detail = String(e?.message || e);
          br.errors = pending.length;
          totalErrors += pending.length;
          bookReports.push(br);
          continue;
        }

        // Group pending cards by their FIRST cited page (render each unique page once)
        const byPage = {};
        for (const c of pending) {
          const fp = firstPageOf(c.source_page_number);
          if (fp <= 0) { br.noPage++; totalNoPage++; continue; }
          if (!byPage[fp]) byPage[fp] = [];
          byPage[fp].push(c);
        }
        const pageNumbers = Object.keys(byPage).map(Number).sort((a, b) => a - b);

        for (let pi = 0; pi < pageNumbers.length; pi++) {
          const pn = pageNumbers[pi];
          const pageCards = byPage[pn];
          setProgress({ bookIdx: bi, bookTotal: neededBooks.length, book: title, page: pn, desc: `Rendering ${title} page ${pn} (${pageCards.length} card${pageCards.length > 1 ? "s" : ""}) [${pi + 1}/${pageNumbers.length}]` });

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
            if (!blob) throw new Error("render produced no blob");
            const safeSlug = String(title).replace(/[^\p{L}\p{N}._-]+/gu, "_").slice(0, 40);
            const file = new File([blob], `section_d_${safeSlug}_p${pn}.png`, { type: "image/png" });
            const up = await base44.integrations.Core.UploadFile({ file });
            imageUrl = up?.file_url || "";
            if (!imageUrl) throw new Error("upload returned no url");
          } catch (e) {
            for (const c of pageCards) { br.errors++; totalErrors++; }
            br.detail = br.detail || String(e?.message || e);
            continue;
          }

          // Attach (append-only, dedup by source_reference + source_page) — NEVER touch Arabic / harakat / Malayalam
          for (const c of pageCards) {
            try {
              const existing = Array.isArray(c.attached_visuals) ? c.attached_visuals : [];
              const pageStr = String(pn);
              if (existing.some(v => (v.source_reference || "") === title && String(v.source_page || "") === pageStr)) {
                br.duplicates++;
                continue;
              }
              const newVisual = {
                visual_url: imageUrl,
                visual_type: "source_page",
                description: `Source page ${pn} — ${title} (rendered verbatim, uncropped)`,
                source_reference: title,
                source_page: pageStr,
                imported_at: new Date().toISOString(),
              };
              await base44.entities.SectionDKnowledge.update(c.id, { attached_visuals: [...existing, newVisual] });
              br.attached++;
              totalAttached++;
            } catch (e) {
              br.errors++;
              totalErrors++;
            }
          }
        }

        try { pdf.destroy(); } catch (_) {}
        if (br.errors > 0 && br.attached === 0) br.status = "all_failed";
        else if (br.errors > 0) br.status = "partial";
        bookReports.push(br);
      }

      setReport({
        totalCards: allCards.length,
        booksTotal: bookTitles.length,
        booksDone: doneBooks.length,
        booksSkippedAlreadyDone: totalSkippedDone,
        booksProcessed: neededBooks.length,
        attached: totalAttached,
        noPage: totalNoPage,
        errors: totalErrors,
        bookReports,
      });
      setDone(true);
      setProgress({ bookIdx: neededBooks.length, bookTotal: neededBooks.length, book: "", page: 0, desc: "Complete" });
      toast({
        title: "Section D visual render complete",
        description: `${totalAttached} attached · ${totalSkippedDone} books already done · ${totalErrors} errors`,
      });
    } catch (e) {
      setError(String(e?.message || e));
      setReport({ attached: totalAttached, errors: totalErrors, noPage: totalNoPage, bookReports, aborted: true });
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
          Source-Page Visual Renderer · Section D
        </span>
      </div>

      <div className="px-4 py-4 space-y-3">
        <p className="font-malayalam text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
          അംഗീകൃത സ്രോതസ്സ് പുസ്തകങ്ങളിലെ ഉദ്ധരിച്ച താൾ ചിത്രങ്ങളായി റെൻഡർ ചെയ്ത് കാർഡുകളിൽ ചേർക്കുന്നു. ഇതിനകം പൂർത്തിയായ പുസ്തകങ്ങൾ ഒഴിവാക്കപ്പെടും; അറബിയോ ഹരകത്തോ മാറ്റപ്പെടുന്നില്ല; മലയാളം കണ്ടുപിടിക്കപ്പെടുന്നില്ല.
        </p>
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
          Renders the cited source page for each Section D card from the approved Master PDF Library (Google Drive). Already-completed books are skipped; append-only; never touches Arabic or harakat.
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
              Render Section D Source Pages
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
            <p className="font-malayalam text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{progress.desc}</p>
            {progress.bookTotal > 0 && (
              <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: P.faint }}>
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${(progress.bookIdx / progress.bookTotal) * 100}%`,
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
                  <ReportStat label="Section D Cards" value={report.totalCards ?? 0} color={P.text} />
                  <ReportStat label="Books Total" value={report.booksTotal ?? 0} color={P.text} />
                  <ReportStat label="Already Done (skipped)" value={report.booksSkippedAlreadyDone ?? 0} color="rgba(148,163,184,0.60)" />
                  <ReportStat label="Books Processed" value={report.booksProcessed ?? 0} color={P.text} />
                  <ReportStat label="Visuals Attached" value={report.attached ?? 0} color="rgba(74,222,128,0.70)" />
                  <ReportStat label="No Cited Page" value={report.noPage ?? 0} color="rgba(251,191,36,0.65)" />
                  <ReportStat label="Errors" value={report.errors ?? 0} color="rgba(239,68,68,0.70)" />
                </div>
              </div>

              {report.bookReports?.length > 0 && (
                <details className="rounded-xl overflow-hidden" style={{ background: "rgba(8,16,38,0.4)", border: `1px solid ${P.faint}` }}>
                  <summary className="cursor-pointer flex items-center gap-2 px-3 py-2.5 list-none">
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: P.dim }} />
                    <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: P.dim }}>
                      Per-Book Results ({report.bookReports.length})
                    </span>
                  </summary>
                  <div className="px-3 pb-3 space-y-1.5 max-h-60 overflow-y-auto">
                    {report.bookReports.map((br, i) => (
                      <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg" style={{ background: "rgba(8,16,38,0.5)" }}>
                        <span className="font-inter text-[9px] flex-1 truncate" style={{ color: "rgba(255,255,255,0.55)" }}>{br.book}</span>
                        <span className="font-inter text-[8px]" style={{ color: "rgba(74,222,128,0.70)" }}>+{br.attached}</span>
                        {br.duplicates > 0 && <span className="font-inter text-[8px]" style={{ color: "rgba(148,163,184,0.60)" }}>dup:{br.duplicates}</span>}
                        {br.noPage > 0 && <span className="font-inter text-[8px]" style={{ color: "rgba(251,191,36,0.65)" }}>np:{br.noPage}</span>}
                        {br.errors > 0 && <span className="font-inter text-[8px]" style={{ color: "rgba(239,68,68,0.70)" }}>err:{br.errors}</span>}
                        <span className="font-inter text-[8px]" style={{
                          color: br.status === "ok" ? "rgba(74,222,128,0.70)"
                            : br.status === "partial" ? "rgba(251,191,36,0.65)"
                            : "rgba(239,68,68,0.70)"
                        }}>{br.status}</span>
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
                  Re-run Pipeline (skips already-completed books)
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