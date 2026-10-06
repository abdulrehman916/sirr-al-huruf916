// ═══════════════════════════════════════════════════════════════
// ASTRO SCREENSHOT UPLOADER — ADMIN ONLY
// Professional batch document uploader for the Astrology module.
//
// FLOW: idle → preparing → review → processing → complete
//   idle:       Source label + file select button
//   preparing:  PDF pages rendered, thumbnails generated
//   review:     Thumbnail grid (drag/reorder/rotate/remove/add more)
//   processing: Sequential upload through analyzeScreenshotAndMergeAstro
//   complete:   Detailed summary
//
// LIMITS: 50 images max, 100 PDF pages max
//
// PIPELINE (per page): Upload → analyzeScreenshotAndMergeAstro
// (Astro Clock ACK store — full_context timing rules in AstroClockKnowledge).
// Pages lacking Day+Saat+Kawkab context are rejected (no fabricated keys).
// Document Context Mode and Smart Topic Router remain independent.
// ═══════════════════════════════════════════════════════════════
import { useState, useRef } from "react";
import { Upload, Loader2, AlertCircle, Image as ImageIcon, FileText, Layers, Play, Plus, Route } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { renderPdfPages } from "@/lib/astroPdfRenderer";
import AstroBatchThumbnailGrid from "./AstroBatchThumbnailGrid";
import AstroUploadProgress from "./AstroUploadProgress";
import AstroUploadSummary from "./AstroUploadSummary";
import AstroDocumentSummary from "./AstroDocumentSummary";
import AstroRoutingReport from "./AstroRoutingReport";

const MAX_IMAGES = 50;
const MAX_PDF_PAGES = 100;

export default function AstroScreenshotUploader() {
  const { txt } = useAstroClockLanguage();
  const [stage, setStage] = useState('idle');
  const [pages, setPages] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [error, setError] = useState(null);
  const [sourceLabel, setSourceLabel] = useState("");
  const [summary, setSummary] = useState(null);
  const [pdfProgress, setPdfProgress] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [documentMode, setDocumentMode] = useState(false);
  const [documentSummary, setDocumentSummary] = useState(null);
  const [smartTopicRouter, setSmartTopicRouter] = useState(false);
  const [routingReport, setRoutingReport] = useState(null);
  const fileInputRef = useRef(null);

  // ── File selection: adds pages to the list (does not replace) ──
  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    if (fileInputRef.current) fileInputRef.current.value = "";

    setError(null);
    setStage('preparing');

    try {
      const newPages = [];
      let pageId = Date.now();

      const existingImages = pages.filter(p => !p.isPdf).length;
      const existingPdfPages = pages.filter(p => p.isPdf).length;
      let imageCount = existingImages;
      let pdfPageCount = existingPdfPages;

      for (const file of selectedFiles) {
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        const sourceName = sourceLabel || file.name;

        if (isPdf) {
          setPdfProgress({ fileName: file.name, current: 0, total: 0 });
          try {
            const renderedPages = await renderPdfPages(file, (pageNum, total) => {
              setPdfProgress({ fileName: file.name, current: pageNum, total });
            });
            setPdfProgress(null);

            for (const rp of renderedPages) {
              if (pdfPageCount >= MAX_PDF_PAGES) {
                setError(txt(
                  `PDF പേജുകളുടെ പരിധി ${MAX_PDF_PAGES} ആണ്`,
                  `PDF page limit is ${MAX_PDF_PAGES}`,
                  `حد صفحات PDF هو ${MAX_PDF_PAGES}`
                ));
                break;
              }
              newPages.push({
                id: `page-${pageId++}`,
                source_name: sourceName,
                file_name: file.name,
                page_number: rp.page_number,
                isPdf: true,
                blob: rp.blob,
                file: null,
                thumbnailUrl: URL.createObjectURL(rp.blob),
                rotation: 0,
                status: 'pending',
                result: null,
              });
              pdfPageCount++;
            }
          } catch (pdfErr) {
            setPdfProgress(null);
            setError(txt(
              `PDF വായിക്കാൻ കഴിഞ്ഞില്ല (${file.name}). ചിത്രങ്ങൾ തുടർന്ന് അപ്ലോഡ് ചെയ്യാം.`,
              `Could not read PDF (${file.name}). Image uploads will continue.`,
              `تعذر قراءة PDF (${file.name}). ستستمر رفع الصور.`
            ));
          }
        } else {
          if (imageCount >= MAX_IMAGES) {
            setError(txt(
              `ചിത്രങ്ങളുടെ പരിധി ${MAX_IMAGES} ആണ്`,
              `Image limit is ${MAX_IMAGES}`,
              `حد الصور هو ${MAX_IMAGES}`
            ));
            break;
          }
          newPages.push({
            id: `page-${pageId++}`,
            source_name: sourceName,
            file_name: file.name,
            page_number: 1,
            isPdf: false,
            blob: null,
            file: file,
            thumbnailUrl: URL.createObjectURL(file),
            rotation: 0,
            status: 'pending',
            result: null,
          });
          imageCount++;
        }
      }

      if (newPages.length > 0) {
        setPages(prev => [...prev, ...newPages]);
      }
      setStage(pages.length > 0 || newPages.length > 0 ? 'review' : 'idle');
    } catch (err) {
      setError(err?.message || txt("പിശക് സംഭവിച്ചു", "An error occurred", "حدث خطأ"));
      setStage(pages.length > 0 ? 'review' : 'idle');
    } finally {
      setPdfProgress(null);
    }
  };

  // ── Reorder: move page from one index to another ──
  const handleReorder = (fromIdx, toIdx) => {
    setPages(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  };

  // ── Remove: delete a single page and revoke its thumbnail URL ──
  const handleRemove = (pageId) => {
    setPages(prev => {
      const page = prev.find(p => p.id === pageId);
      if (page?.thumbnailUrl) URL.revokeObjectURL(page.thumbnailUrl);
      const next = prev.filter(p => p.id !== pageId);
      if (next.length === 0 && stage === 'review') setStage('idle');
      return next;
    });
  };

  // ── Rotate: cycle rotation 0 → 90 → 180 → 270 ──
  const handleRotate = (pageId) => {
    setPages(prev => prev.map(p =>
      p.id === pageId ? { ...p, rotation: (p.rotation + 90) % 360 } : p
    ));
  };

  // ── Apply rotation to a file/blob via canvas (returns new File) ──
  const applyRotation = async (fileOrBlob, rotation, fileName) => {
    if (rotation === 0) {
      if (fileOrBlob instanceof File) return fileOrBlob;
      return new File([fileOrBlob], fileName, { type: 'image/png' });
    }
    const url = URL.createObjectURL(fileOrBlob);
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (rotation === 90 || rotation === 270) {
      canvas.width = img.height;
      canvas.height = img.width;
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
    }
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    URL.revokeObjectURL(url);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.92));
    canvas.width = 0;
    canvas.height = 0;
    return new File([blob], fileName, { type: 'image/png' });
  };

  // ── Start upload: process all pages sequentially ──
  const startUpload = async () => {
    if (pages.length === 0) return;
    setStage('processing');
    setStartTime(Date.now());
    setError(null);

    let processed = 0, rejected = 0, duplicates = 0, errors = 0;
    let newKnowledge = 0;
    const entityKeysCreated = new Set();
    const entityKeysUpdated = new Set();

    for (let i = 0; i < pages.length; i++) {
      setCurrentIdx(i);
      setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'uploading' } : p));

      try {
        const page = pages[i];
        const rawFile = page.blob || page.file;
        if (!rawFile) {
          errors++;
          setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
          continue;
        }

        const uploadName = `${page.file_name}-p${page.page_number}.png`;
        const fileObj = await applyRotation(rawFile, page.rotation, uploadName);

        // Step 1: Upload page image to Base44 storage
        const uploadRes = await base44.integrations.Core.UploadFile({ file: fileObj });
        const fileUrl = uploadRes.data?.file_url || uploadRes.file_url;
        if (!fileUrl) {
          errors++;
          setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
          continue;
        }

        // Step 2: Send through the Astro Clock ACK pipeline (AstroClockKnowledge)
        setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'analyzing' } : p));
        const response = await base44.functions.invoke('analyzeScreenshotAndMergeAstro', {
          file_url: fileUrl,
          source_label: page.source_name,
        });
        const data = response.data || response;

        if (data.error) {
          errors++;
          setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error', result: data } : p));
          continue;
        }

        const created = data.records_created || 0;
        const merged = data.records_merged || 0;
        const combinationsFound = data.combinations_found || 0;

        let pageStatus = 'done';
        if (combinationsFound === 0) {
          pageStatus = 'rejected';
          rejected++;
        } else if (created === 0 && merged === 0) {
          pageStatus = 'duplicate';
          duplicates++;
        } else {
          processed++;
          newKnowledge += created;
          if (Array.isArray(data.merge_details)) {
            data.merge_details.forEach(d => {
              const key = d.full_context_key || '';
              if (d.action === 'created') entityKeysCreated.add(key);
              if (d.action && String(d.action).includes('merged')) entityKeysUpdated.add(key);
            });
          }
        }
        setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: pageStatus, result: data } : p));
      } catch (err) {
        errors++;
        setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
      }
    }

    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    setSummary({
      total_pages: pages.length,
      processed,
      rejected,
      duplicates,
      new_entities: entityKeysCreated.size,
      updated_entities: entityKeysUpdated.size,
      new_knowledge: newKnowledge,
      errors,
      elapsed_seconds: elapsedSeconds,
    });
    setStage('complete');
    setCurrentIdx(-1);
  };

  // ── Document Context Mode: upload all pages, then call documentContextIngest ──
  // This wraps the existing pipeline with a Document Context Layer that provides
  // continuous manuscript understanding (OCR, context reconstruction, chapter
  // detection, entity continuation, relationship graph, document summary).
  const startDocumentUpload = async () => {
    if (pages.length === 0) return;
    setStage('processing');
    setStartTime(Date.now());
    setError(null);
    setDocumentSummary(null);

    try {
      // Step 1: Upload all page images (sequentially, preserving order)
      const pageUrls = [];
      for (let i = 0; i < pages.length; i++) {
        setCurrentIdx(i);
        setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'uploading' } : p));

        const page = pages[i];
        const rawFile = page.blob || page.file;
        if (!rawFile) {
          pageUrls.push(null);
          setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
          continue;
        }

        const uploadName = `${page.file_name}-p${page.page_number}.png`;
        const fileObj = await applyRotation(rawFile, page.rotation, uploadName);
        const uploadRes = await base44.integrations.Core.UploadFile({ file: fileObj });
        const fileUrl = uploadRes.data?.file_url || uploadRes.file_url;

        if (!fileUrl) {
          pageUrls.push(null);
          setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
          continue;
        }

        pageUrls.push({
          file_url: fileUrl,
          page_number: page.page_number,
          is_pdf_page: page.isPdf,
          file_name: page.file_name,
        });
        setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'done' } : p));
      }

      // Step 2: Call documentContextIngest in batches (with resume)
      const validPages = pageUrls.filter(p => p !== null);
      if (validPages.length === 0) {
        setError(txt("ഒരു പേജും അപ്ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല", "No pages could be uploaded", "لم يتم رفع أي صفحة"));
        setStage('review');
        return;
      }

      // Mark all uploaded pages as analyzing (document processing)
      setPages(prev => prev.map(p => p.status === 'done' ? { ...p, status: 'analyzing' } : p));

      let resumeFrom = 0;
      let documentId = null;

      while (resumeFrom < validPages.length) {
        const response = await base44.functions.invoke('documentContextIngest', {
          pages: validPages,
          source_label: sourceLabel || 'Document Upload',
          document_id: documentId,
          resume_from_page: resumeFrom,
          batch_size: 3,
        });

        const data = response.data || response;
        if (data.error) {
          setError(data.error);
          break;
        }

        documentId = data.document_id;

        if (data.status === 'completed') {
          setDocumentSummary(data);
          setStage('complete');
          break;
        } else if (data.status === 'processing') {
          resumeFrom = data.resume_from_page;
          // Update progress: mark processed pages as done
          const processedCount = data.pages_processed;
          setPages(prev => prev.map((p, idx) => {
            if (idx < processedCount && p.status === 'analyzing') {
              return { ...p, status: 'done' };
            }
            return p;
          }));
        } else {
          break;
        }
      }

      setCurrentIdx(-1);
    } catch (err) {
      setError(err?.message || txt("പിശക്", "Error", "خطأ"));
      setStage('review');
      setCurrentIdx(-1);
    }
  };

  // ── Smart Topic Router: classify pages, group sections, route to correct store ──
  // Only astrology sections are processed via unifiedIngestKnowledge.
  // Non-astrology sections are noted in the routing report but skipped.
  const startSmartTopicRoute = async () => {
    if (pages.length === 0) return;
    setStage('processing');
    setStartTime(Date.now());
    setError(null);
    setRoutingReport(null);

    try {
      // Step 1: Upload all page images (sequentially, preserving order)
      const pageUrls = [];
      for (let i = 0; i < pages.length; i++) {
        setCurrentIdx(i);
        setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'uploading' } : p));

        const page = pages[i];
        const rawFile = page.blob || page.file;
        if (!rawFile) {
          pageUrls.push(null);
          setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
          continue;
        }

        const uploadName = `${page.file_name}-p${page.page_number}.png`;
        const fileObj = await applyRotation(rawFile, page.rotation, uploadName);
        const uploadRes = await base44.integrations.Core.UploadFile({ file: fileObj });
        const fileUrl = uploadRes.data?.file_url || uploadRes.file_url;

        if (!fileUrl) {
          pageUrls.push(null);
          setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error' } : p));
          continue;
        }

        pageUrls.push({
          file_url: fileUrl,
          page_number: page.page_number,
          is_pdf_page: page.isPdf,
          file_name: page.file_name,
        });
        setPages(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'done' } : p));
      }

      // Step 2: Call smartTopicRoute in batches (with resume)
      const validPages = pageUrls.filter(p => p !== null);
      if (validPages.length === 0) {
        setError(txt("ഒരു പേജും അപ്ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല", "No pages could be uploaded", "لم يتم رفع أي صفحة"));
        setStage('review');
        return;
      }

      setPages(prev => prev.map(p => p.status === 'done' ? { ...p, status: 'analyzing' } : p));

      let resumeFrom = 0;
      let documentId = null;

      while (resumeFrom < validPages.length) {
        const response = await base44.functions.invoke('smartTopicRoute', {
          pages: validPages,
          source_label: sourceLabel || 'Smart Topic Router',
          document_id: documentId,
          resume_from_page: resumeFrom,
          batch_size: 10,
        });

        const data = response.data || response;
        if (data.error) {
          setError(data.error);
          break;
        }

        documentId = data.document_id;

        if (data.status === 'completed') {
          setRoutingReport(data);
          setStage('complete');
          break;
        } else if (data.status === 'processing') {
          resumeFrom = data.resume_from_page;
          const processedCount = data.pages_classified;
          setPages(prev => prev.map((p, idx) => {
            if (idx < processedCount && p.status === 'analyzing') {
              return { ...p, status: 'done' };
            }
            return p;
          }));
        } else {
          break;
        }
      }

      setCurrentIdx(-1);
    } catch (err) {
      setError(err?.message || txt("പിശക്", "Error", "خطأ"));
      setStage('review');
      setCurrentIdx(-1);
    }
  };

  // ── Reset: clear everything and revoke all thumbnail URLs ──
  const reset = () => {
    pages.forEach(p => { if (p.thumbnailUrl) URL.revokeObjectURL(p.thumbnailUrl); });
    setStage('idle');
    setPages([]);
    setSummary(null);
    setDocumentSummary(null);
    setDocumentMode(false);
    setRoutingReport(null);
    setSmartTopicRouter(false);
    setError(null);
    setSourceLabel("");
    setStartTime(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Render helpers ──
  const isBusy = stage === 'preparing' || stage === 'processing';
  const isPreparing = stage === 'preparing';
  const showProgress = stage === 'preparing' || stage === 'processing';
  const showSummary = stage === 'complete' && (summary || documentSummary || routingReport);
  const showReview = stage === 'review' || stage === 'processing';

  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: "rgba(212,175,55,0.04)",
      border: "1px solid rgba(212,175,55,0.20)",
    }}>
      {/* Header */}
      <div className="p-2.5" style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 flex-shrink-0" style={{ color: "#F5D060" }} />
          <span className="font-inter text-[10px] uppercase tracking-wider font-bold" style={{ color: "rgba(212,175,55,0.65)" }}>
            {txt("കൈപ്പറ്റഺ അപ്ലോഡ്", "Manuscript Upload", "رفع المخطوطة")}
          </span>
          <span className="font-inter text-[7px] px-1.5 py-0.5 rounded uppercase font-bold" style={{
            background: "rgba(248,113,113,0.10)",
            color: "rgba(248,113,113,0.60)",
            border: "1px solid rgba(248,113,113,0.20)",
          }}>
            {txt("അഡ്മിൻ", "Admin", "مشرف")}
          </span>
        </div>
        <p className="font-inter text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {txt(
            "50 ചിത്രങ്ങൾ അല്ലെങ്കിൽ 100 PDF പേജുകൾ വരെ — തിരഞ്ഞെടുത്ത് ക്രമീകരിച്ച് അപ്ലോഡ് ചെയ്യുക",
            "Up to 50 images or 100 PDF pages — select, reorder, then upload",
            "حتى 50 صورة أو 100 صفحة PDF — اختر، رتب، ثم ارفع"
          )}
        </p>
      </div>

      {/* Body */}
      <div className="p-2.5 space-y-2">
        {/* Source label input */}
        <input
          type="text"
          value={sourceLabel}
          onChange={(e) => setSourceLabel(e.target.value)}
          placeholder={txt("സ്രോതസ്സ് പേര് (ഓപ്ഷണൽ)", "Source name (optional)", "اسم المصدر (اختياري)")}
          className="w-full px-2.5 py-2 rounded-lg font-inter text-[10px]"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(212,175,55,0.15)",
            color: "rgba(255,255,255,0.70)",
          }}
          disabled={isBusy}
        />

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* idle / review: Select / Add More button */}
        {(stage === 'idle' || stage === 'review') && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full cursor-pointer rounded-lg p-3 flex items-center justify-center gap-2 transition-opacity"
            style={{
              background: "rgba(212,175,55,0.08)",
              border: "1px dashed rgba(212,175,55,0.30)",
            }}
          >
            {isPreparing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#F5D060" }} />
                <span className="font-inter text-[10px] font-bold" style={{ color: "#F5D060" }}>
                  {txt("വായിക്കുന്നു...", "Reading...", "قراءة...")}
                </span>
              </>
            ) : stage === 'review' ? (
              <>
                <Plus className="w-4 h-4" style={{ color: "#F5D060" }} />
                <span className="font-inter text-[10px] font-bold" style={{ color: "#F5D060" }}>
                  {txt("കൂടുതൽ ചേർക്കുക", "Add More Pages", "إضافة المزيد")}
                </span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" style={{ color: "#F5D060" }} />
                <span className="font-inter text-[10px] font-bold" style={{ color: "#F5D060" }}>
                  {txt("ചിത്രങ്ങൾ/PDF തിരഞ്ഞെടുക്കുക", "Select Images or PDFs", "اختر صورًا أو PDF")}
                </span>
                <Layers className="w-3 h-3 ml-1" style={{ color: "rgba(212,175,55,0.40)" }} />
              </>
            )}
          </button>
        )}

        {/* Preparing indicator (before page list is built) */}
        {isPreparing && pages.length === 0 && pdfProgress && (
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{
            background: "rgba(212,175,55,0.04)",
            border: "1px solid rgba(212,175,55,0.12)",
          }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" style={{ color: "#F5D060" }} />
            <span className="font-inter text-[9px]" style={{ color: "rgba(212,175,55,0.60)" }}>
              {txt("PDF വായിക്കുന്നു", "Reading PDF", "قراءة PDF")}: {pdfProgress.fileName}
              {pdfProgress.current > 0 && ` (${pdfProgress.current}/${pdfProgress.total})`}
            </span>
          </div>
        )}

        {/* Thumbnail grid (review + processing stages) */}
        {showReview && pages.length > 0 && (
          <>
            {/* Page count info */}
            <div className="flex items-center gap-2 font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>
              <span>{pages.length} {txt("പേജുകൾ", "pages", "صفحة")}</span>
              {pages.filter(p => p.isPdf).length > 0 && (
                <span className="flex items-center gap-0.5">
                  <FileText className="w-2.5 h-2.5" /> {pages.filter(p => p.isPdf).length} PDF
                </span>
              )}
              {pages.filter(p => !p.isPdf).length > 0 && (
                <span className="flex items-center gap-0.5">
                  <ImageIcon className="w-2.5 h-2.5" /> {pages.filter(p => !p.isPdf).length} {txt("ചിത്രം", "img", "صورة")}
                </span>
              )}
            </div>

            <AstroBatchThumbnailGrid
              pages={pages}
              onReorder={handleReorder}
              onRemove={handleRemove}
              onRotate={handleRotate}
              disabled={stage === 'processing'}
            />

            {/* Document Context Mode toggle (review stage only) */}
            {stage === 'review' && (
              <button
                onClick={() => setDocumentMode(v => !v)}
                className="w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-opacity"
                style={{
                  background: documentMode ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${documentMode ? "rgba(212,175,55,0.45)" : "rgba(212,175,55,0.15)"}`,
                }}
              >
                <Layers className="w-3.5 h-3.5" style={{ color: documentMode ? "#F5D060" : "rgba(212,175,55,0.40)" }} />
                <span className="font-inter text-[9px] font-bold" style={{ color: documentMode ? "#F5D060" : "rgba(255,255,255,0.40)" }}>
                  {documentMode
                    ? txt("പ്രമാണ സന്ദർഭ മോഡ് ഓൺ", "Document Context Mode ON", "وضع سياق المستند مفعّل")
                    : txt("പ്രമാണ സന്ദർഭ മോഡ് ഓഫ്", "Document Context Mode OFF", "وضع سياق المستند معطّل")}
                </span>
              </button>
            )}

            {/* Smart Topic Router toggle (review stage only) */}
            {stage === 'review' && (
              <button
                onClick={() => setSmartTopicRouter(v => !v)}
                className="w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-opacity"
                style={{
                  background: smartTopicRouter ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${smartTopicRouter ? "rgba(96,165,250,0.40)" : "rgba(212,175,55,0.15)"}`,
                }}
              >
                <Route className="w-3.5 h-3.5" style={{ color: smartTopicRouter ? "rgba(96,165,250,0.80)" : "rgba(212,175,55,0.40)" }} />
                <span className="font-inter text-[9px] font-bold" style={{ color: smartTopicRouter ? "rgba(96,165,250,0.80)" : "rgba(255,255,255,0.40)" }}>
                  {smartTopicRouter
                    ? txt("സ്മാർട്ട് ടോപ്പിക് റൂട്ടർ ഓൺ", "Smart Topic Router ON", "موجّه المواضيع الذكي مفعّل")
                    : txt("സ്മാർട്ട് ടോപ്പിക് റൂട്ടർ ഓഫ്", "Smart Topic Router OFF", "موجّه المواضيع الذكي معطّل")}
                </span>
              </button>
            )}

            {/* Start Upload button (review stage only) */}
            {stage === 'review' && (
              <button
                onClick={smartTopicRouter ? startSmartTopicRoute : documentMode ? startDocumentUpload : startUpload}
                className="w-full py-2.5 rounded-lg font-inter text-[10px] font-bold uppercase tracking-wider transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)",
                  color: "#0d1b2a",
                  boxShadow: "0 0 20px rgba(212,175,55,0.30)",
                }}
              >
                <Play className="w-3 h-3 inline mr-1" />
                {smartTopicRouter
                  ? txt("റൂട്ട് ചെയ്ത് പ്രോസസ് ചെയ്യുക", "Route & Process", "وجّه وعالج")
                  : documentMode
                  ? txt("പ്രമാണം പ്രോസസ് ചെയ്യുക", "Process Document", "معالجة المستند")
                  : txt("അപ്ലോഡ് ആരംഭിക്കുക", "Start Upload", "ابدأ الرفع")}
              </button>
            )}
          </>
        )}

        {/* Progress display (processing stage) */}
        {showProgress && pages.length > 0 && (
          <AstroUploadProgress
            pages={pages}
            currentIdx={currentIdx}
            stage={stage}
            pdfProgress={pdfProgress}
            startTime={startTime}
          />
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg p-2 flex items-start gap-2" style={{
            background: "rgba(248,113,113,0.06)",
            border: "1px solid rgba(248,113,113,0.20)",
          }}>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "rgba(248,113,113,0.60)" }} />
            <p className="font-inter text-[10px]" style={{ color: "rgba(248,113,113,0.70)" }}>{error}</p>
          </div>
        )}

        {/* Final summary — document mode or standard mode */}
        {showSummary && (
          smartTopicRouter && routingReport
            ? <AstroRoutingReport report={routingReport} onReset={reset} />
            : documentMode && documentSummary
            ? <AstroDocumentSummary summary={documentSummary} onReset={reset} />
            : <AstroUploadSummary summary={summary} onReset={reset} />
        )}
      </div>
    </div>
  );
}