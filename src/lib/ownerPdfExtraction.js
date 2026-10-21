// Owner-only, on-device extraction. Lazy imports keep normal app pages small.
const abortError = () => new DOMException('Extraction paused. Select the same PDF to resume.', 'AbortError');
function check(signal) { if (signal?.aborted) throw abortError(); }

export async function pdfFileHash(file) {
  if (!file || !/\.pdf$/i.test(file.name) || file.size > 50 * 1024 * 1024 || !file.size) {
    throw new Error('Choose a PDF between 1 byte and 50 MB.');
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!new TextDecoder().decode(bytes.slice(0, 1024)).includes('%PDF-')) throw new Error('This file is not a PDF.');
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
}

export async function openOwnerPdf(source, { signal, language = 'ara', onProgress = () => {} } = {}) {
  if (!['ara', 'eng', 'mal'].includes(language)) throw new Error('Choose Arabic, English or Malayalam.');
  check(signal);
  const pdfjs = await import('pdfjs-dist');
  const workerAsset = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjs.GlobalWorkerOptions.workerSrc = workerAsset.default;
  const task = pdfjs.getDocument({ ...(typeof source === 'string' ? { url: source } : { data: await source.arrayBuffer() }), isEvalSupported: false });
  let ocrWorker;
  let closed = false;
  const stop = () => { closed = true; const worker = ocrWorker; ocrWorker = null; void worker?.terminate(); void task.destroy(); };
  signal?.addEventListener('abort', stop, { once: true });
  let pdf;
  try { pdf = await task.promise; check(signal); }
  catch (error) { signal?.removeEventListener('abort', stop); await task.destroy(); throw error; }

  async function timed(job, message) {
    let timer;
    let onAbort;
    try {
      check(signal);
      return await Promise.race([job, new Promise((_, reject) => {
        onAbort = () => reject(abortError());
        signal?.addEventListener('abort', onAbort, { once: true });
        timer = setTimeout(() => { stop(); reject(new Error(message)); }, 120000);
      })]);
    } finally { clearTimeout(timer); signal?.removeEventListener('abort', onAbort); }
  }

  return {
    numPages: pdf.numPages,
    async readPage(number, { forceOcr = false } = {}) {
      check(signal);
      if (closed) throw abortError();
      const page = await pdf.getPage(number);
      let canvas;
      try {
        const content = await page.getTextContent();
        const embedded = content.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').trim();
        if (!forceOcr && embedded.replace(/\s/g, '').length >= 20 && !embedded.includes('\uFFFD')) {
          return { text: embedded, method: 'pdf_text', confidence: null, language };
        }
        if (!ocrWorker) {
          onProgress('Loading on-device OCR…');
          const { createWorker } = await import('tesseract.js');
          const pending = createWorker(language === 'eng' ? ['eng'] : [language, 'eng'], 1, {
            workerPath: `${window.location.origin}/ocr/v7/worker.min.js`,
            corePath: `${window.location.origin}/ocr/v7/core`,
            langPath: `${window.location.origin}/ocr/v7/lang`,
            workerBlobURL: false,
          }).then(worker => { if (closed || signal?.aborted) { void worker.terminate(); throw abortError(); } return worker; });
          ocrWorker = await timed(pending, 'OCR could not start. Check your connection and retry.');
          await ocrWorker.setParameters({ tessedit_pageseg_mode: '3' });
        }
        check(signal);
        const base = page.getViewport({ scale: 1 });
        const scale = Math.min(2.5, Math.sqrt(3000000 / (base.width * base.height)));
        const viewport = page.getViewport({ scale });
        canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('This browser cannot render a PDF page.');
        await page.render({ canvasContext: context, viewport, background: '#fff' }).promise;
        check(signal); onProgress(`Recognizing page ${number} on this device…`);
        const { data } = await timed(ocrWorker.recognize(canvas), 'OCR timed out. Saved pages are retained; select the same PDF to resume.');
        check(signal);
        return { text: data.text || '', method: 'tesseract', confidence: Number.isFinite(data.confidence) ? data.confidence : null, language };
      } finally {
        if (canvas) { canvas.width = 0; canvas.height = 0; }
        page.cleanup();
      }
    },
    async destroy() {
      closed = true;
      signal?.removeEventListener('abort', stop);
      await ocrWorker?.terminate();
      await task.destroy();
    },
  };
}
