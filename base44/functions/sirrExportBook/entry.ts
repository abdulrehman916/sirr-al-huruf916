import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR EXPORT BOOK — sirrExportBook
//
// Permanent archival export. Builds a complete JSON snapshot of one
// book (metadata + pdf_parts + every extracted entry in order) and
// stores it permanently in private storage. Returns the permanent
// file_uri, which the UI can turn into a signed download URL.
//
// This is the "Export it" capability of the permanent archive:
// even after years, any book can be fully exported. The export is
// itself permanently archived (file_uri recorded in SirrAuditLog).
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const sirr_book_id = body.sirr_book_id;
    if (!sirr_book_id) return Response.json({ error: 'sirr_book_id is required' }, { status: 400 });

    const books = await sdk.entities.SirrManuscriptBook.filter({ sirr_book_id }, undefined, 1);
    const book = books[0];
    if (!book) return Response.json({ error: 'Book not found: ' + sirr_book_id }, { status: 404 });

    // Paginate ALL entries by monotonic entry_order (robust for any book size).
    const entries = [];
    let lastOrder = -1;
    while (true) {
      const batch = await sdk.entities.SirrManuscriptEntry.filter(
        { sirr_book_id, entry_order: { $gt: lastOrder } },
        'entry_order',
        5000
      );
      if (!batch.length) break;
      for (const e of batch) entries.push(e);
      lastOrder = Number(batch[batch.length - 1].entry_order) || lastOrder;
      if (batch.length < 5000) break;
    }

    const now = new Date().toISOString();
    const snapshot = {
      archive_type: 'sirr_book_export',
      exported_at: now,
      exported_by: user.email || user.id || '',
      book: {
        sirr_book_id: book.sirr_book_id,
        book_title: book.book_title,
        malayalam_book_name: book.malayalam_book_name,
        book_title_ar: book.book_title_ar,
        author: book.author,
        language: book.language,
        edition: book.edition,
        volume: book.volume,
        publication_year: book.publication_year,
        combined_total_pages: book.combined_total_pages,
        total_entries: book.total_entries,
        extraction_status: book.extraction_status,
        verification_status: book.verification_status,
        upload_date: book.upload_date,
        pdf_parts: book.pdf_parts || [],
      },
      entry_count: entries.length,
      entries,
    };

    const payload = JSON.stringify(snapshot);
    const file = new File([payload], `sirr-export-${sirr_book_id}-${Date.now()}.json`, { type: 'application/json' });
    const up = await sdk.integrations.Core.UploadPrivateFile({ file });
    const file_uri = up?.file_uri || up?.data?.file_uri || '';

    await sdk.entities.SirrAuditLog.create({
      audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sirr_book_id,
      action: 'export',
      user_id: user.id || '',
      user_name: user.full_name || user.email || '',
      timestamp: now,
      status: 'success',
      details: `Exported ${entries.length} entries to permanent archive. file_uri: ${file_uri}`,
      entry_count: entries.length,
      file_uri,
    }).catch(() => {});

    return Response.json({ status: 'success', file_uri, entry_count: entries.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});