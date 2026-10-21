import { useEffect, useRef, useState } from 'react';
import { openOwnerPdf, pdfFileHash } from '@/lib/ownerPdfExtraction';

export default function MplReprocessModal({ page, part, busy, onClose, onApply }) {
  const [language, setLanguage] = useState(page.malayalam_text ? 'mal' : page.arabic_text ? 'ara' : 'eng');
  const [number, setNumber] = useState(Number(page.source_part_number || 1) > 1 ? '' : String(page.page_number || 1));
  const [file, setFile] = useState(null);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const pending = useRef(null);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; pending.current?.abort(); }; }, []);

  async function extract() {
    if (pending.current) return;
    const pageNo = Number(number);
    if (!Number.isInteger(pageNo) || pageNo < 1) { setError('Enter the page number within the original PDF part.'); return; }
    const controller = new AbortController(); pending.current = controller;
    let reader;
    setWorking(true); setError(''); setResult(null);
    try {
      if (file) await pdfFileHash(file);
      if (!file && !part?.file_url) throw new Error('Select the original PDF file.');
      reader = await openOwnerPdf(file || part.file_url, { language, signal: controller.signal, onProgress: text => { if (alive.current) setProgress(text); } });
      if (pageNo > reader.numPages) throw new Error(`This PDF has ${reader.numPages} pages.`);
      const extracted = await reader.readPage(pageNo, { forceOcr: true });
      if (extracted.text.length > 200000) throw new Error('This page exceeds the correction text limit. No text was truncated.');
      if (alive.current) setResult(extracted);
    } catch (err) { if (alive.current) setError(err?.name === 'AbortError' ? 'OCR paused. The stored page is unchanged.' : err.message); }
    finally {
      try { await reader?.destroy(); } catch { /* No stored text is changed by extraction. */ }
      pending.current = null;
      if (alive.current) { setWorking(false); setProgress(''); }
    }
  }

  return <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 p-4" role="dialog" aria-modal="true" aria-labelledby="reprocess-title">
    <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-amber-200/30 bg-slate-950 p-5 text-white">
      <h2 id="reprocess-title" className="font-bold mb-3">Reprocess page with on-device OCR</h2>
      <p className="text-xs text-white/70 mb-3">Compare the result with the original before saving. Original OCR is preserved; saving appends an owner correction. This does not translate the page.</p>
      <p className="text-xs mb-3">Original: {part?.file_name || 'select the original PDF below'}</p>
      <label className="block text-xs mb-3">Original PDF (optional replacement for an expired preview link)<input type="file" accept="application/pdf" disabled={working || busy} onChange={e => { setFile(e.target.files?.[0] || null); setResult(null); }} className="block mt-2 w-full" /></label>
      <label className="block text-xs mb-3">Page number within this PDF part<input type="number" min="1" value={number} disabled={working || busy} onChange={e => { setNumber(e.target.value); setResult(null); }} className="ml-3 w-24 rounded border border-white/30 bg-slate-900 p-2" /></label>
      <label className="block text-xs mb-3">Text language<select value={language} disabled={working || busy} onChange={e => { setLanguage(e.target.value); setResult(null); }} className="ml-3 rounded border border-white/30 bg-slate-900 p-2"><option value="ara">Arabic + English</option><option value="eng">English</option><option value="mal">Malayalam + English</option></select></label>
      <div className="flex gap-4 text-sm my-3">
        <button type="button" disabled={working || busy} onClick={extract} className="underline disabled:opacity-40">Run OCR</button>
        {working && <button type="button" onClick={() => pending.current?.abort()} className="underline">Pause OCR</button>}
        <button type="button" disabled={busy} onClick={onClose} className="underline">Close</button>
      </div>
      {progress && <p role="status" className="text-xs text-amber-200">{progress}</p>}
      {error && <p role="alert" className="text-xs text-red-300 my-3">{error}</p>}
      {result && <div className="mt-3">
        <p className="text-xs mb-2">OCR confidence: {result.confidence == null ? 'not recorded' : `${result.confidence.toFixed(1)}%`}. A confidence score does not verify source accuracy.</p>
        <textarea aria-label="OCR result for review" readOnly value={result.text} dir={result.language === 'ara' ? 'rtl' : 'ltr'} className="h-64 w-full rounded border border-white/30 bg-slate-900 p-3 text-sm" />
        <button type="button" disabled={busy || !result.text.trim()} onClick={() => onApply({ field: result.language === 'ara' ? 'arabic_text' : result.language === 'mal' ? 'malayalam_text' : 'english_text', corrected_value: result.text, reason: `Owner-reviewed on-device OCR (${result.language}); confidence ${result.confidence == null ? 'not recorded' : result.confidence.toFixed(1) + '%'}. Original OCR preserved.` })} className="mt-3 rounded border border-amber-200/50 px-4 py-2 text-sm disabled:opacity-40">{busy ? 'Saving…' : 'Save reviewed text as correction'}</button>
      </div>}
    </div>
  </div>;
}
