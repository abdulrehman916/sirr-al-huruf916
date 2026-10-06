// ═══════════════════════════════════════════════════════════════
// SectionCVisualIntegrator — Visual Content Integration Tool
//
// This tool lets the Owner integrate visual content (magic squares,
// wafq, tables, symbols, seals, diagrams) from source PDFs into
// the Section C Birhatīya cards.
//
// WORKFLOW:
//   1. Owner uploads a source PDF (or provides a URL)
//   2. The backend scanSectionCVisuals function identifies pages
//      with visual content using vision LLM
//   3. This component renders each identified page as an image
//      using browser-side pdfjs-dist
//   4. Uploads each rendered page image via UploadFile
//   5. Calls attachSectionCVisual to attach the image URL to the
//      matching Birhatīya card
//   6. Shows progress and a final report
//
// RULES:
//   - Append-only — never overwrites existing visuals
//   - Displays visuals exactly as they appear in the source
//   - Multiple versions from different books preserved separately
// ═══════════════════════════════════════════════════════════════
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Scan, Image as ImageIcon, Loader2, CheckCircle2,
  AlertCircle, FileText, ChevronDown, X, Eye, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

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

const VISUAL_TYPE_LABELS = {
  magic_square: "Magic Square",
  wafq: "Wafq",
  table: "Table",
  symbol: "Symbol",
  seal: "Seal",
  diagram: "Diagram",
  figure: "Figure",
  grid: "Grid",
  handwritten_chart: "Handwritten Chart",
  other: "Other",
};

const VISUAL_TYPE_COLORS = {
  magic_square: "rgba(74,222,128,0.65)",
  wafq: "rgba(129,140,248,0.65)",
  table: "rgba(251,191,36,0.65)",
  symbol: "rgba(168,85,247,0.65)",
  seal: "rgba(14,165,233,0.65)",
  diagram: "rgba(236,72,153,0.65)",
  figure: "rgba(239,68,68,0.65)",
  grid: "rgba(34,197,94,0.65)",
  handwritten_chart: "rgba(245,208,96,0.65)",
  other: "rgba(148,163,184,0.65)",
};

// ── Lazy load pdfjs-dist (same pattern as astroPdfRenderer) ──
let _pdfjsLibPromise = null;
async function loadPdfjs() {
  if (_pdfjsLibPromise) return _pdfjsLibPromise;
  _pdfjsLibPromise = (async () => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4/build/pdf.worker.min.mjs";
    return pdfjsLib;
  })();
  return _pdfjsLibPromise;
}

const RENDER_SCALE = 2;

export default function SectionCVisualIntegrator() {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState("idle"); // idle | scanning | rendering | attaching | done
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [scanResults, setScanResults] = useState(null);
  const [attachResults, setAttachResults] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, current_page: 0, description: "" });
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const [showStatus, setShowStatus] = useState(false);
  const [statusReport, setStatusReport] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes("pdf")) {
      toast({ title: "Please select a PDF file", variant: "destructive" });
      return;
    }
    setPdfFile(file);
    setSourceLabel(file.name.replace(/\.pdf$/i, ""));
    setError("");
    setScanResults(null);
    setAttachResults([]);
  }, [toast]);

  const handleScan = useCallback(async () => {
    if (!pdfFile) {
      toast({ title: "Please select a PDF first", variant: "destructive" });
      return;
    }
    setStep("scanning");
    setError("");
    setScanResults(null);
    setAttachResults([]);

    try {
      // Step 1: Upload the PDF to get a URL for the LLM
      setProgress({ current: 0, total: 1, current_page: 0, description: "Uploading PDF for scanning…" });
      const uploadRes = await base44.integrations.Core.UploadFile({ file: pdfFile });
      const uploadedUrl = uploadRes?.file_url || "";

      // Step 2: Call InvokeLLM directly to identify pages with visual content
      setProgress({ current: 1, total: 1, current_page: 0, description: "Scanning PDF for visual content…" });
      const NAMES_28_LIST = [
        "HNK-MHC-001 = برهتية (Birhatya)", "HNK-MHC-002 = كريم (Karīr)",
        "HNK-MHC-003 = تتليه (Tatlīyah)", "HNK-MHC-004 = طوران (Ṭawrān)",
        "HNK-MHC-005 = مزجل (Mazjal)", "HNK-MHC-006 = بزجل (Bazjal)",
        "HNK-MHC-007 = ترقب (Tarqab)", "HNK-MHC-008 = برهش (Barhash)",
        "HNK-MHC-009 = غلمش (Ghalmash)", "HNK-MHC-010 = خوطير (Khawtayr)",
        "HNK-MHC-011 = قلنهود (Qalnahuwd)", "HNK-MHC-012 = برشان (Barshān)",
        "HNK-MHC-013 = كظيمر (Katẓīr)", "HNK-MHC-014 = نموشلخ (Namūshalakh)",
        "HNK-MHC-015 = برهيولا (Barhayūlā)", "HNK-MHC-016 = بشكيلخ (Bashkīlakh)",
        "HNK-MHC-017 = قزمز (Qazmaz)", "HNK-MHC-018 = انغلليط (Anghalalīt)",
        "HNK-MHC-019 = قبرات (Qabarāt)", "HNK-MHC-020 = غياها (Ghayāhā)",
        "HNK-MHC-021 = كيدهولا (Kaydhūlā)", "HNK-MHC-022 = سماخر (Simākhir)",
        "HNK-MHC-023 = شمحاهيمر (Shimkhāhīr)", "HNK-MHC-024 = شمحاهيمر (Shimhāhīr)",
        "HNK-MHC-025 = بكهطونيه (Bakhaṭūnīya)", "HNK-MHC-026 = بشارش (Bashārish)",
        "HNK-MHC-027 = طونش (Ṭawnish)", "HNK-MHC-028 = شمخاباروخ (Shamkhābārūkh)",
      ];
      const VISUAL_TYPES_LIST = "magic_square, wafq, table, symbol, seal, diagram, figure, grid, handwritten_chart, other";
      const scanPrompt = `You are a meticulous manuscript archivist scanning a scholarly PDF for VISUAL CONTENT related to the Birhatīya (Barhatiah / برهتية) conjuration oath.

Scan the ENTIRE PDF, every page.

For EVERY page, carefully examine it for VISUAL CONTENT. Visual content includes ANY of these:
- Magic Square (Wafq / Awfaq — a grid of letters or numbers, typically 3x3, 4x4, 5x5, etc.)
- Wafq (letter grid / magic square variant)
- Table (structured rows and columns of text or data)
- Symbol (a drawn symbol, sigil, or mark)
- Seal (Khatam — a circular or geometric seal design)
- Diagram (any explanatory diagram or schematic)
- Figure (a drawn figure or illustration)
- Grid (any grid layout — letters, numbers, or symbols)
- Handwritten chart (handwritten numerical or letter chart)
- Any other visual illustration, drawing, or mark

The 28 Birhatīya names to match visuals to:
${NAMES_28_LIST.join("\n")}

For EACH page that contains visual content, output ONE item:
- page_number: the PDF page number (1-based) where the visual appears
- name_id: the matching Birhatīya name ID from the list above. Use "" (empty string) if the visual is general/whole-conjuration content not specific to one name.
- visual_type: exactly one of: ${VISUAL_TYPES_LIST}
- description: a brief description of the visual content (what it shows, e.g. "3x3 magic square with Arabic letters for the name Birhatya", "circular seal with the name Karir in the center", "table of Abjad values for all 28 names")

ABSOLUTE RULES:
1. ONLY report visuals that are ACTUALLY VISIBLE on the page. Never fabricate or guess.
2. If a page has NO visual content (only text), do NOT output an item for it.
3. If a page has MULTIPLE distinct visuals, output ONE item per distinct visual (they can share the same page_number).
4. Match each visual to the correct Birhatīya name by examining the surrounding text context (headings, labels, chapter titles).
5. If you cannot determine which name a visual relates to, set name_id to "" and describe it as general.

Also report:
- total_pages: total page count of the PDF
- book_title: the title of the book/document as printed`;

      const llmRes = await base44.integrations.Core.InvokeLLM({
        prompt: scanPrompt,
        file_urls: [uploadedUrl],
        model: "gemini_3_flash",
        response_json_schema: {
          type: "object",
          properties: {
            total_pages: { type: "integer" },
            book_title: { type: "string" },
            visuals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  page_number: { type: "integer" },
                  name_id: { type: "string" },
                  visual_type: { type: "string" },
                  description: { type: "string" },
                },
                required: ["page_number", "visual_type", "description"],
              },
            },
          },
          required: ["visuals"],
        },
      });

      const scanData = llmRes && typeof llmRes === "object" ? llmRes : {};
      const resolvedSource = sourceLabel || scanData.book_title || "Section C PDF";
      const validVisualTypes = new Set(VISUAL_TYPES_LIST.split(", ").map((t) => t.trim()));
      const validVisuals = (Array.isArray(scanData.visuals) ? scanData.visuals : [])
        .filter((v) => Number(v.page_number) > 0 && v.visual_type && v.description)
        .map((v) => ({
          page_number: Number(v.page_number),
          name_id: String(v.name_id || "").trim(),
          visual_type: validVisualTypes.has(v.visual_type) ? v.visual_type : "other",
          description: String(v.description || "").trim(),
        }));

      scanData.visuals = validVisuals;
      scanData.total_visuals_found = validVisuals.length;
      scanData.pages_with_visuals = new Set(validVisuals.map((v) => v.page_number)).size;
      scanData.source_label = resolvedSource;
      setScanResults(scanData);

      if (!scanData?.visuals || scanData.visuals.length === 0) {
        setStep("done");
        toast({ title: "No visual content found in this PDF" });
        return;
      }

      // Step 3: Render and attach each identified page
      setStep("rendering");
      const visuals = scanData.visuals;
      setProgress({ current: 0, total: visuals.length, current_page: 0, description: "Rendering pages…" });

      // Load the PDF in pdfjs
      const pdfjsLib = await loadPdfjs();
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const results = [];
      // Group visuals by page to avoid re-rendering the same page
      const byPage = {};
      for (const v of visuals) {
        if (!byPage[v.page_number]) byPage[v.page_number] = [];
        byPage[v.page_number].push(v);
      }
      const pageNumbers = Object.keys(byPage).map(Number).sort((a, b) => a - b);

      let idx = 0;
      for (const pageNum of pageNumbers) {
        const pageVisuals = byPage[pageNum];
        setProgress({
          current: idx,
          total: pageNumbers.length,
          current_page: pageNum,
          description: `Rendering page ${pageNum} (${pageVisuals.length} visual${pageVisuals.length > 1 ? "s" : ""})…`,
        });

        try {
          // Render the page to canvas
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: RENDER_SCALE });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: ctx, viewport }).promise;

          // Convert to blob
          const blob = await new Promise((resolve) => {
            canvas.toBlob(resolve, "image/png", 0.92);
          });

          // Clean up canvas
          canvas.width = 0;
          canvas.height = 0;
          page.cleanup();

          if (!blob) throw new Error("Failed to render page");

          // Upload the page image
          const imageFile = new File([blob], `section_c_page_${pageNum}.png`, { type: "image/png" });
          const imgUploadRes = await base44.integrations.Core.UploadFile({ file: imageFile });
          const imageUrl = imgUploadRes?.file_url || "";

          // Attach each visual on this page to the matching card — direct SDK update
          for (const v of pageVisuals) {
            try {
              const targetNameId = v.name_id || "HNK-MHC-001";
              const cards = await base44.entities.HolyNameEsotericKnowledge.filter(
                { name_id: targetNameId }, null, 1
              );
              const card = cards?.[0];
              if (!card) throw new Error(`Card ${targetNameId} not found`);

              const existing = Array.isArray(card.attached_visuals) ? card.attached_visuals : [];
              if (existing.some((ev) => ev.visual_url === imageUrl)) {
                results.push({
                  page_number: v.page_number,
                  name_id: v.name_id || card.name_id,
                  visual_type: v.visual_type,
                  description: v.description,
                  status: "duplicate",
                  visual_url: imageUrl,
                });
                continue;
              }

              const newVisual = {
                visual_url: imageUrl,
                visual_type: v.visual_type,
                description: v.description,
                source_reference: scanData.source_label || sourceLabel,
                source_page: String(v.page_number),
                name_id: card.name_id,
                imported_at: new Date().toISOString(),
              };
              await base44.entities.HolyNameEsotericKnowledge.update(card.id, {
                attached_visuals: [...existing, newVisual],
              });
              results.push({
                page_number: v.page_number,
                name_id: v.name_id || card.name_id,
                visual_type: v.visual_type,
                description: v.description,
                status: "attached",
                visual_url: imageUrl,
              });
            } catch (e) {
              results.push({
                page_number: v.page_number,
                name_id: v.name_id || "",
                visual_type: v.visual_type,
                description: v.description,
                status: "error",
                error: String(e?.message || e),
              });
            }
          }
        } catch (e) {
          for (const v of pageVisuals) {
            results.push({
              page_number: v.page_number,
              name_id: v.name_id || "",
              visual_type: v.visual_type,
              description: v.description,
              status: "render_error",
              error: String(e?.message || e),
            });
          }
        }
        idx++;
      }

      pdf.destroy();
      setAttachResults(results);
      setStep("done");
      setProgress({ current: pageNumbers.length, total: pageNumbers.length, current_page: 0, description: "Complete" });
      setShowResults(true);

      // Generate the report
      const attached = results.filter((r) => r.status === "attached").length;
      const duplicates = results.filter((r) => r.status === "duplicate").length;
      const errors = results.filter((r) => r.status === "error" || r.status === "render_error").length;
      toast({
        title: "Visual integration complete",
        description: `${attached} visuals attached, ${duplicates} duplicates skipped, ${errors} errors`,
      });
    } catch (e) {
      setError(String(e?.message || e));
      setStep("idle");
      toast({ title: "Integration failed", description: String(e?.message || e), variant: "destructive" });
    }
  }, [pdfFile, sourceLabel, toast]);

  const handleShowStatus = useCallback(async () => {
    if (showStatus) {
      setShowStatus(false);
      return;
    }
    setLoadingStatus(true);
    setError("");
    try {
      const cards = await base44.entities.HolyNameEsotericKnowledge.list("order_index", 60);
      const report = {
        total_cards: cards.length,
        cards_with_visuals: 0,
        cards_without_visuals: 0,
        total_visuals: 0,
        by_type: {},
        cards_missing: [],
      };
      for (const card of cards) {
        const visuals = Array.isArray(card.attached_visuals) ? card.attached_visuals : [];
        if (visuals.length > 0) {
          report.cards_with_visuals++;
          report.total_visuals += visuals.length;
          for (const v of visuals) {
            report.by_type[v.visual_type] = (report.by_type[v.visual_type] || 0) + 1;
          }
        } else {
          report.cards_without_visuals++;
          report.cards_missing.push({
            name_id: card.name_id,
            arabic_name: card.arabic_name,
            transliteration: card.transliteration || "",
          });
        }
      }
      setStatusReport(report);
      setShowStatus(true);
    } catch (e) {
      setError(String(e?.message || e));
    }
    setLoadingStatus(false);
  }, [showStatus]);

  const handleReset = useCallback(() => {
    setStep("idle");
    setPdfFile(null);
    setPdfUrl("");
    setScanResults(null);
    setAttachResults([]);
    setProgress({ current: 0, total: 0, current_page: 0, description: "" });
    setError("");
    setShowResults(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const isProcessing = step === "scanning" || step === "rendering" || step === "attaching";

  // ── Final report ──
  const report = showResults ? {
    total_scanned: scanResults?.total_visuals_found || 0,
    pages_with_visuals: scanResults?.pages_with_visuals || 0,
    total_attached: attachResults.filter((r) => r.status === "attached").length,
    duplicates: attachResults.filter((r) => r.status === "duplicate").length,
    errors: attachResults.filter((r) => r.status === "error" || r.status === "render_error").length,
    by_type: attachResults.reduce((acc, r) => {
      if (r.status === "attached") {
        acc[r.visual_type] = (acc[r.visual_type] || 0) + 1;
      }
      return acc;
    }, {}),
  } : null;

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
          Visual Content Integrator
        </span>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Status report toggle */}
        <button
          onClick={handleShowStatus}
          disabled={loadingStatus}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl transition-all"
          style={{
            background: showStatus ? P.bgHi : "rgba(8,16,38,0.4)",
            border: `1px solid ${showStatus ? P.borderHi : P.faint}`,
            color: P.dim,
          }}
        >
          {loadingStatus ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          <span className="font-inter text-[10px] uppercase tracking-widest font-bold">
            {showStatus ? "Hide Integration Status" : "View Integration Status"}
          </span>
        </button>

        {/* Status report display */}
        {showStatus && statusReport && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-xl p-3 space-y-2"
            style={{ background: "rgba(8,16,38,0.5)", border: `1px solid ${P.border}` }}
          >
            <div className="grid grid-cols-2 gap-2">
              <ReportStat label="Total Cards" value={statusReport.total_cards} color={P.text} />
              <ReportStat label="With Visuals" value={statusReport.cards_with_visuals} color="rgba(74,222,128,0.70)" />
              <ReportStat label="Missing Visuals" value={statusReport.cards_without_visuals} color="rgba(239,68,68,0.65)" />
              <ReportStat label="Total Visuals" value={statusReport.total_visuals} color={P.text} />
            </div>
            {Object.keys(statusReport.by_type).length > 0 && (
              <div className="pt-2 space-y-1" style={{ borderTop: `1px solid ${P.faint}` }}>
                <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: P.dim }}>Breakdown by Type</p>
                {Object.entries(statusReport.by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="font-inter text-[10px]" style={{ color: VISUAL_TYPE_COLORS[type] || "rgba(255,255,255,0.70)" }}>
                      {VISUAL_TYPE_LABELS[type] || type}
                    </span>
                    <span className="font-inter text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{count}</span>
                  </div>
                ))}
              </div>
            )}
            {statusReport.cards_missing.length > 0 && (
              <details className="pt-2" style={{ borderTop: `1px solid ${P.faint}` }}>
                <summary className="cursor-pointer list-none flex items-center gap-2">
                  <ChevronDown className="w-3 h-3" style={{ color: P.dim }} />
                  <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(239,68,68,0.65)" }}>
                    Cards Missing Visuals ({statusReport.cards_missing.length})
                  </span>
                </summary>
                <div className="mt-1.5 space-y-0.5 max-h-32 overflow-y-auto">
                  {statusReport.cards_missing.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-0.5">
                      <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.45)" }}>{c.name_id}</span>
                      <span className="font-amiri text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }} dir="rtl">{c.arabic_name}</span>
                      {c.transliteration && (
                        <span className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.30)" }}>({c.transliteration})</span>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </motion.div>
        )}

        {/* Step 1: File selection */}
        <div className="space-y-2">
          <p className="font-malayalam text-sm font-semibold" style={{ color: P.dim }}>
            സ്രോതസ്സ് PDF തിരഞ്ഞെടുക്കുക
          </p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
            Upload the source PDF containing magic squares, wafq, tables, symbols, seals, diagrams
          </p>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              disabled={isProcessing}
              className="hidden"
              id="section-c-pdf-input"
            />
            <label
              htmlFor="section-c-pdf-input"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer transition-all"
              style={{
                background: pdfFile ? P.bgHi : P.bg,
                border: `1px solid ${pdfFile ? P.borderHi : P.border}`,
                color: P.text,
                opacity: isProcessing ? 0.5 : 1,
              }}
            >
              <Upload className="w-4 h-4" />
              <span className="font-inter text-xs font-semibold">
                {pdfFile ? pdfFile.name : "Select PDF File"}
              </span>
            </label>
            {pdfFile && !isProcessing && (
              <button
                onClick={handleReset}
                className="px-2 py-2.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${P.faint}` }}
              >
                <X className="w-4 h-4" style={{ color: "rgba(255,255,255,0.50)" }} />
              </button>
            )}
          </div>
          {pdfFile && (
            <input
              type="text"
              value={sourceLabel}
              onChange={(e) => setSourceLabel(e.target.value)}
              placeholder="Source label (book title)…"
              disabled={isProcessing}
              className="w-full px-3 py-2 rounded-xl font-inter text-xs outline-none"
              style={{ background: "rgba(8,16,38,0.6)", border: `1px solid ${P.border}`, color: "rgba(255,255,255,0.85)" }}
            />
          )}
        </div>

        {/* Step 2: Scan button */}
        {pdfFile && !isProcessing && step !== "done" && (
          <button
            onClick={handleScan}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(212,175,55,0.20), rgba(212,175,55,0.08))",
              border: `1px solid ${P.borderHi}`,
              color: P.text,
            }}
          >
            <Scan className="w-4 h-4" />
            <span className="font-inter text-xs font-bold uppercase tracking-widest">
              Scan & Integrate Visuals
            </span>
          </button>
        )}

        {/* Progress indicator */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: P.text }} />
              <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: P.text }}>
                {step === "scanning" ? "Scanning PDF…" : "Rendering & Attaching…"}
              </span>
            </div>
            <p className="font-malayalam text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              {progress.description}
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

        {/* Results / Report */}
        {step === "done" && report && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              {/* Summary */}
              <div className="rounded-xl p-3 space-y-2" style={{ background: P.bgHi, border: `1px solid ${P.borderHi}` }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" style={{ color: P.text }} />
                  <span className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: P.text }}>
                    Integration Report
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <ReportStat label="Visuals Found" value={report.total_scanned} color={P.text} />
                  <ReportStat label="Pages with Visuals" value={report.pages_with_visuals} color={P.text} />
                  <ReportStat label="Visuals Attached" value={report.total_attached} color="rgba(74,222,128,0.70)" />
                  <ReportStat label="Duplicates Skipped" value={report.duplicates} color="rgba(148,163,184,0.60)" />
                </div>
                {Object.keys(report.by_type).length > 0 && (
                  <div className="pt-2 space-y-1" style={{ borderTop: `1px solid ${P.faint}` }}>
                    <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: P.dim }}>Attached by Type</p>
                    {Object.entries(report.by_type).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="font-inter text-[10px]" style={{ color: VISUAL_TYPE_COLORS[type] || "rgba(255,255,255,0.70)" }}>
                          {VISUAL_TYPE_LABELS[type] || type}
                        </span>
                        <span className="font-inter text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
                {report.errors > 0 && (
                  <div className="pt-2" style={{ borderTop: `1px solid ${P.faint}` }}>
                    <p className="font-inter text-[10px]" style={{ color: "rgba(239,68,68,0.70)" }}>
                      ⚠ {report.errors} error(s) — see details below
                    </p>
                  </div>
                )}
              </div>

              {/* Detailed results */}
              <details className="rounded-xl overflow-hidden" style={{ background: "rgba(8,16,38,0.4)", border: `1px solid ${P.faint}` }}>
                <summary className="cursor-pointer flex items-center gap-2 px-3 py-2.5 list-none">
                  <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180" style={{ color: P.dim }} />
                  <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: P.dim }}>Detailed Results ({attachResults.length})</span>
                </summary>
                <div className="px-3 pb-3 space-y-1.5 max-h-60 overflow-y-auto">
                  {attachResults.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(8,16,38,0.5)" }}>
                      <span
                        className="font-inter text-[8px] px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
                        style={{ background: `${VISUAL_TYPE_COLORS[r.visual_type] || "rgba(148,163,184,0.30)"}22`, color: VISUAL_TYPE_COLORS[r.visual_type] || "rgba(148,163,184,0.70)" }}
                      >
                        {VISUAL_TYPE_LABELS[r.visual_type] || r.visual_type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.75)" }}>
                          p.{r.page_number} {r.name_id ? `· ${r.name_id}` : "· general"}
                        </span>
                        <p className="font-inter text-[9px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{r.description}</p>
                      </div>
                      <span className="font-inter text-[8px] flex-shrink-0" style={{ color: r.status === "attached" ? "rgba(74,222,128,0.70)" : r.status === "duplicate" ? "rgba(148,163,184,0.60)" : "rgba(239,68,68,0.70)" }}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              </details>

              <button
                onClick={handleReset}
                className="w-full px-4 py-2.5 rounded-xl font-inter text-xs font-semibold"
                style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.dim }}
              >
                Integrate Another PDF
              </button>
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