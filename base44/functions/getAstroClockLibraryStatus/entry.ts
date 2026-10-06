import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// getAstroClockLibraryStatus — READ-ONLY Library Status dashboard
// endpoint for the Astro Clock Master PDF Library scan system.
//
// Returns:
//   - scan_status (idle | in_progress | completed)
//   - scan_metadata (cumulative stats from scan_status marker)
//   - library_status: { total_books, completed, in_progress,
//     needs_rescan, not_yet_scanned, failed, corrupt, newly_imported }
//   - books_needing_rescan: [{ book_id, book_title, reason, last_scan_date,
//     first_scan_date, scan_version }]
//   - books: [{ book_id, book_title, status, completion_percentage,
//     pages_scanned, pages_remaining, last_scan_date, first_scan_date,
//     scan_version }]
//
// Admin/Owner only. Never modifies any data (read-only).
// Does NOT touch Astro Clock calculations or UI — purely diagnostic.
// ═══════════════════════════════════════════════════════════════

function computeFingerprint(book) {
  const partsHash = (book.pdf_parts || []).map(p => p.file_hash || '').join('|');
  const totalPages = book.combined_total_pages || 0;
  const modifiedTime = book.google_drive_modified_time || '';
  const importDate = book.import_date || book.upload_date || '';
  return `${partsHash}||${totalPages}||${modifiedTime}||${importDate}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return Response.json({ error: 'Admin/Owner only' }, { status: 403 });
    }
    const sdk = base44.asServiceRole;

    // ── Load all scan markers (with attributes) ──
    const markers = [];
    let mSkip = 0;
    while (markers.length < 3000) {
      const mBatch = await sdk.entities.AstroClockKnowledge.filter({ rule_category: 'scan_marker' }, undefined, 500, mSkip).catch(() => []);
      if (!mBatch || mBatch.length === 0) break;
      markers.push(...mBatch); mSkip += mBatch.length;
      if (mBatch.length < 500) break;
    }

    // ── Load scan_status marker ──
    let scanStatusRec = null;
    const ssRecs = await sdk.entities.AstroClockKnowledge.filter({ rule_category: 'scan_status' }, undefined, 1).catch(() => []);
    if (ssRecs && ssRecs.length > 0) scanStatusRec = ssRecs[0];

    // ── Load all verified books (pending_verification + completed) ──
    const verifiedBooks = await sdk.entities.MasterPdfBook.filter(
      { extraction_status: { $in: ['pending_verification', 'completed'] } },
      'upload_date', 200
    ).catch(() => []);

    // ── Load failed books ──
    const failedBooks = await sdk.entities.MasterPdfBook.filter(
      { extraction_status: 'failed' }, 'upload_date', 200
    ).catch(() => []);

    // ── Corrupt books (FAILED_CORRUPT_PDF or error mentions corrupt/pdf) ──
    const corruptBooks = (failedBooks || []).filter(b => {
      const err = (b.extraction_error || '').toLowerCase();
      return err.includes('corrupt') || err.includes('failed_corrupt') || err.includes('pdf parse') || err.includes('wasm');
    });

    // ── Newly imported books (still uploading) ──
    const uploadingBooks = await sdk.entities.MasterPdfBook.filter(
      { extraction_status: 'uploading' }, 'upload_date', 200
    ).catch(() => []);

    // ── Build marker map: bookId → marker record ──
    const markerMap = new Map();
    for (const m of markers) {
      const bookId = m.rule_entity || m.source_book_id;
      if (bookId) markerMap.set(bookId, m);
    }

    // ── Compute per-book status ──
    let completed = 0, inProgress = 0, needsRescan = 0, notYetScanned = 0;
    const booksNeedingRescan = [];
    const bookStatusList = [];

    for (const book of (verifiedBooks || [])) {
      const bookId = book.master_book_id;
      const marker = markerMap.get(bookId);
      const isDone = marker && marker.source_page_number === 'done';

      if (!marker) {
        notYetScanned++;
        inProgress++;
        bookStatusList.push({
          book_id: bookId, book_title: book.book_title, status: 'not_scanned',
          completion_percentage: 0, pages_scanned: 0, pages_remaining: book.combined_total_pages || 0,
        });
        continue;
      }

      const attrs = marker.attributes || {};
      const currentFp = computeFingerprint(book);
      const fingerprintChanged = attrs.content_fingerprint && attrs.content_fingerprint !== currentFp;

      if (fingerprintChanged && isDone) {
        needsRescan++;
        booksNeedingRescan.push({
          book_id: bookId, book_title: book.book_title,
          reason: 'content_changed',
          last_scan_date: attrs.last_scan_date || '',
          first_scan_date: attrs.first_scan_date || '',
          scan_version: attrs.scan_version || 0,
        });
        bookStatusList.push({
          book_id: bookId, book_title: book.book_title, status: 'needs_rescan',
          completion_percentage: attrs.completion_percentage || 100,
          pages_scanned: attrs.pages_scanned || 0, pages_remaining: attrs.pages_remaining || 0,
          last_scan_date: attrs.last_scan_date || '',
        });
      } else if (isDone) {
        completed++;
        bookStatusList.push({
          book_id: bookId, book_title: book.book_title, status: 'completed',
          completion_percentage: 100, pages_scanned: attrs.pages_scanned || 0,
          pages_remaining: 0, last_scan_date: attrs.last_scan_date || '',
          first_scan_date: attrs.first_scan_date || '', scan_version: attrs.scan_version || 0,
        });
      } else {
        inProgress++;
        bookStatusList.push({
          book_id: bookId, book_title: book.book_title, status: 'in_progress',
          completion_percentage: attrs.completion_percentage || 0,
          pages_scanned: attrs.pages_scanned || 0, pages_remaining: attrs.pages_remaining || 0,
        });
      }
    }

    return Response.json({
      scan_status: scanStatusRec ? scanStatusRec.knowledge_text_en : 'idle',
      scan_metadata: (scanStatusRec && scanStatusRec.attributes) || {},
      library_status: {
        total_books: (verifiedBooks || []).length,
        completed,
        in_progress: inProgress,
        needs_rescan: needsRescan,
        not_yet_scanned: notYetScanned,
        failed: (failedBooks || []).length,
        corrupt: corruptBooks.length,
        newly_imported: (uploadingBooks || []).length,
      },
      books_needing_rescan: booksNeedingRescan,
      books: bookStatusList,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});