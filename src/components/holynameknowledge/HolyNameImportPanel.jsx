import { useState, useRef } from "react";
import { UploadCloud, Loader2, CheckCircle2, AlertTriangle, FileText, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { HOLY_NAMES } from "@/lib/magicalHolyNamesData";

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

const RAW_MIN_CHARS = 200; // below this, fall back to LLM verbatim transcription

export default function HolyNameImportPanel({ onImported }) {
  const { role } = useAuth();
  const isAdmin = role === "admin" || role === "owner";
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState([]);
  const inputRef = useRef(null);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border p-5 flex items-center gap-3" style={{ background: P.bg, borderColor: P.border }}>
        <Lock className="w-4 h-4" style={{ color: P.dim }} />
        <p className="font-inter text-[11px]" style={{ color: P.dim }}>
          PDF import is available to administrators only.
        </p>
      </div>
    );
  }

  const addLog = (line) => setLog((l) => [...l, line]);

  // Section A names sent to the backend for matching (id + arabicPlain + englishName).
  const section_a_names = HOLY_NAMES.map((n) => ({
    id: n.id,
    arabicPlain: n.arabicPlain || n.arabicName,
    englishName: n.englishName,
  }));

  const extractRaw = async (file_url) => {
    const pages = [];
    let totalLen = 0;
    let pdf = null;
    try {
      const pdfjsLib = await import("pdfjs-dist");
      try {
        const workerModule = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
      } catch { /* worker setup optional — getDocument still works */ }
      const task = pdfjsLib.getDocument({ url: file_url });
      pdf = await task.promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        const text = (tc.items || []).map((it) => it.str || "").join(" ");
        pages.push({ page_number: i, text });
        totalLen += (text || "").length;
      }
    } catch (e) {
      return { pages: [], ok: false, pdf: null };
    }
    return { pages, ok: totalLen >= RAW_MIN_CHARS, pdf };
  };

  // ── Visual content detection (wafq, tables, diagrams, numeric layouts) ──
  const VISUAL_KEYWORDS = /وفق|مربع|شكل|جدول|ضرب|vefk|wafq|square|table|diagram|grid|magic/i;
  const hasVisualContent = (text) => {
    if (!text) return false;
    if (VISUAL_KEYWORDS.test(text)) return true;
    // Detect grid-like numeric patterns: 3+ lines each containing 2+ numbers
    const lines = text.split(/\n+/);
    let numericLines = 0;
    for (const line of lines) {
      const nums = line.match(/\d+/g);
      if (nums && nums.length >= 2) numericLines++;
    }
    return numericLines >= 3;
  };

  // ── Render a PDF page to a canvas image and upload it ──
  const renderPageToImage = async (pdf, pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.82));
      if (!blob) return null;
      const file = new File([blob], `page-${pageNum}.jpg`, { type: "image/jpeg" });
      const up = await base44.integrations.Core.UploadFile({ file });
      return up?.file_url || null;
    } catch { return null; }
  };

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setLog([]);
    const import_batch = "HNK-" + Date.now();
    for (const file of files) {
      try {
        addLog(`Uploading "${file.name}"…`);
        const up = await base44.integrations.Core.UploadFile({ file });
        const file_url = up?.file_url;
        if (!file_url) { addLog(`✗ Upload failed for "${file.name}"`); continue; }

        addLog(`Extracting text from "${file.name}"…`);
        const { pages, ok, pdf } = await extractRaw(file_url);

        let payload = { import_batch, source_pdf_file: file.name, source_pdf_url: file_url, section_a_names };
        if (ok) {
          payload.pages = pages;
          // Detect + render pages with visual content (wafq, tables, diagrams)
          const visualPages = pages.filter((p) => hasVisualContent(p.text || ""));
          if (visualPages.length > 0 && pdf) {
            addLog(`Rendering ${visualPages.length} page(s) with visual content…`);
            const page_images = [];
            for (const vp of visualPages) {
              const imgUrl = await renderPageToImage(pdf, vp.page_number);
              if (imgUrl) page_images.push({ page_number: vp.page_number, image_url: imgUrl, has_visual: true });
            }
            if (page_images.length > 0) payload.page_images = page_images;
          }
          addLog(`Raw text layer found (${pages.length} pages). Matching + categorizing…`);
        } else {
          addLog(`No usable text layer. Using verbatim LLM fallback…`);
        }

        const res = await base44.functions.invoke("importHolyNamesPDF", payload);
        const d = res?.data || {};
        addLog(
          `✓ "${file.name}": ${d.names_found || 0} names · ${d.sections_added || 0} sections added · ${d.duplicates_skipped || 0} duplicates skipped (${d.extraction_method || "raw"})`
        );
      } catch (e) {
        addLog(`✗ "${file.name}": ${e?.message || "error"}`);
      }
    }
    setBusy(false);
    if (onImported) onImported();
  };

  const onPick = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    handleFiles(files);
    e.target.value = "";
  };

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: P.bg, borderColor: P.borderHi, boxShadow: `0 0 18px ${P.glow}` }}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: P.text }} />
          <span className="font-inter text-[11px] font-bold uppercase tracking-widest" style={{ color: P.text }}>
            Import PDF Knowledge
          </span>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border font-inter text-[10px] uppercase tracking-widest font-bold"
          style={{
            background: busy ? P.faint : P.bgHi,
            borderColor: busy ? P.border : P.borderHi,
            color: busy ? P.dim : P.text,
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
          {busy ? "Importing…" : "Import PDF"}
        </button>
        <input ref={inputRef} type="file" accept="application/pdf" multiple onChange={onPick} className="hidden" />
      </div>

      {log.length === 0 ? (
        <p className="font-inter text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
          Select one or more PDF books. The system extracts the text, finds the matching Holy Names already in Section A and Section B, and appends only the information printed in the PDF — with the source file and page number recorded on every section. Existing information is never overwritten; duplicate paragraphs are skipped. Future uploads keep enriching the same Holy Names.
        </p>
      ) : (
        <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
          {log.map((line, i) => {
            const ok = line.startsWith("✓");
            const bad = line.startsWith("✗");
            return (
              <div key={i} className="flex items-start gap-2 font-inter text-[10px]" style={{ color: ok ? "rgba(134,239,172,0.85)" : bad ? "rgba(248,113,113,0.85)" : "rgba(255,255,255,0.65)" }}>
                {ok ? <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" /> : bad ? <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" /> : <span className="mt-0.5">•</span>}
                <span className="leading-relaxed">{line}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}