// ═══════════════════════════════════════════════════════════════
// ASTRO PDF RENDERER — Browser-side PDF page-to-image converter
// Uses pdfjs-dist to render each PDF page to a PNG blob.
// Each blob is then uploaded and sent through unifiedIngestKnowledge.
//
// LAZY LOADING: pdfjs-dist is dynamically imported ONLY when a PDF
// file is selected. Image uploads never trigger this import. This
// keeps the initial bundle small and prevents startup crashes.
//
// ISOLATED: Only used by AstroScreenshotUploader for multi-page PDF.
// Does NOT modify the OCR engine or any backend pipeline.
// ═══════════════════════════════════════════════════════════════

const RENDER_SCALE = 2;

let _pdfjsLibPromise = null;

/**
 * Lazily load pdfjs-dist via dynamic import.
 * The library and its worker are only fetched when a PDF is actually
 * selected — never during app startup and never for image uploads.
 * @returns {Promise<typeof import('pdfjs-dist')>}
 */
async function loadPdfjs() {
  if (_pdfjsLibPromise) return _pdfjsLibPromise;
  _pdfjsLibPromise = (async () => {
    const pdfjsLib = await import('pdfjs-dist');
    // Use CDN for worker — avoids Vite ?url build issues
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@4/build/pdf.worker.min.mjs';
    return pdfjsLib;
  })();
  return _pdfjsLibPromise;
}

/**
 * Get the number of pages in a PDF file.
 * @param {File} file
 * @returns {Promise<number>}
 */
export async function getPdfPageCount(file) {
  const pdfjsLib = await loadPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const count = pdf.numPages;
  pdf.destroy();
  return count;
}

/**
 * Render every page of a PDF to a PNG blob, preserving page order.
 * Calls onProgress(pageNum, totalPages) for each page.
 * @param {File} file
 * @param {(pageNum: number, totalPages: number) => void} [onProgress]
 * @returns {Promise<Array<{page_number: number, blob: Blob}>>}
 */
export async function renderPdfPages(file, onProgress) {
  const pdfjsLib = await loadPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const totalPages = pdf.numPages;
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    if (onProgress) onProgress(i, totalPages);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: RENDER_SCALE });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.92));
    pages.push({ page_number: i, blob });
    // Release canvas memory immediately
    canvas.width = 0;
    canvas.height = 0;
    page.cleanup();
  }

  pdf.destroy();
  return pages;
}