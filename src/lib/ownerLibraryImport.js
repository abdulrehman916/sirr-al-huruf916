import { pdfFileHash, openOwnerPdf } from './ownerPdfExtraction';

// Each page is committed independently; a retry uses the same file fingerprint.
export async function importOwnerPdf({ file, language, displayName, signal, onProgress }, api) {
  let reader;
  let book;
  let uploaded;
  let beginAttempted = false;
  const check = () => { if (signal?.aborted) throw new DOMException('Paused. Select the same PDF to resume.', 'AbortError'); };
  const invoke = async payload => (await api.invoke(payload)).data;
  try {
    onProgress('Checking PDF…');
    const fingerprint = await pdfFileHash(file); check();
    book = (await invoke({ mode: 'find', file_sha256: fingerprint })).book; check();
    if (book && book.last_processed_page === book.total_pages) return { indexed: book.total_pages, alreadyIndexed: true };
    reader = await openOwnerPdf(file, { signal, language: book?.language || language, onProgress }); check();
    if (reader.numPages < 1 || reader.numPages > 5000) throw new Error('Choose a PDF with no more than 5,000 pages.');
    if (!book) {
      onProgress('Saving original PDF privately…');
      uploaded = await api.upload(file); check();
      beginAttempted = true;
      const start = await invoke({ mode: 'begin', file_sha256: fingerprint, total_pages: reader.numPages,
        object_path: uploaded.path, file_name: file.name, file_size: file.size, display_name: displayName, language });
      book = start.book;
      // A second tab may have started the same import. Keep its original file.
      if (!start.created && uploaded.path !== book.source_object_path) await api.remove(uploaded.path);
    }
    for (let number = Number(book.last_processed_page || 0) + 1; number <= reader.numPages; number++) {
      check(); onProgress(`Extracting page ${number} of ${reader.numPages}…`);
      const extracted = await reader.readPage(number); check();
      if (extracted.text.length > 200000) throw new Error(`Page ${number} exceeds the text limit. No text has been truncated.`);
      onProgress(`Saving page ${number} of ${reader.numPages}…`);
      await invoke({ mode: 'page', master_book_id: book.master_book_id, page_number: number, ...extracted });
    }
    return { indexed: reader.numPages, alreadyIndexed: false };
  } catch (error) {
    if (uploaded && !beginAttempted) {
      try { await api.remove(uploaded.path); } catch { /* An incomplete upload is not published. */ }
    }
    if (book) {
      try { await invoke({ mode: 'pause', master_book_id: book.master_book_id, error: error.message }); }
      catch { /* Saved checkpoints still remain; find resolves uncertain responses. */ }
    }
    throw error;
  } finally { try { await reader?.destroy(); } catch { /* Cleanup cannot invalidate a saved checkpoint. */ } }
}
