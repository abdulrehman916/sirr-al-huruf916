import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR BACKUP ARCHIVE — sirrBackupArchive
//
// Automatic, self-resuming, incremental backup of the permanent
// SIRR archive. Scheduled daily. Each run backs up a few books
// whose data changed since their last backup (or were never backed
// up), within an ~80s budget; the next run continues with the rest.
//
// For each book it builds a complete JSON snapshot (metadata +
// pdf_parts + every entry in order) and stores it PERMANENTLY in
// private storage. The resulting file_uri is recorded on the book
// (last_backup_at / last_backup_uri / last_backup_entry_count) and
// permanently logged in SirrAuditLog (action='backup').
//
// Scales to thousands of books / millions of entries: per-book
// snapshots, paginated entry fetch, time-budgeted resumable runs.
// ═══════════════════════════════════════════════════════════════
const TIME_BUDGET_MS = 80000;
const MAX_BOOKS_PER_RUN = 8;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    const sdk = base44.asServiceRole;

    const started = Date.now();
    let backedUp = 0;
    let skipped = 0;
    const now = new Date().toISOString();

    // Oldest books first so backups stay fresh across the whole library.
    const books = await sdk.entities.SirrManuscriptBook.filter({}, 'upload_date', 500).catch(() => []);

    for (const book of books) {
      if (Date.now() - started > TIME_BUDGET_MS) break;
      if (backedUp >= MAX_BOOKS_PER_RUN) break;

      const updated = book.updated_date || book.upload_date || '';
      const needs = !book.last_backup_at || (updated && updated > book.last_backup_at);
      if (!needs) { skipped++; continue; }

      try {
        // Paginate ALL entries by monotonic entry_order (robust for any size).
        const entries = [];
        let lastOrder = -1;
        while (true) {
          const batch = await sdk.entities.SirrManuscriptEntry.filter(
            { sirr_book_id: book.sirr_book_id, entry_order: { $gt: lastOrder } },
            'entry_order',
            5000
          );
          if (!batch.length) break;
          for (const e of batch) entries.push(e);
          lastOrder = Number(batch[batch.length - 1].entry_order) || lastOrder;
          if (batch.length < 5000) break;
          if (Date.now() - started > TIME_BUDGET_MS) break;
        }

        const snapshot = {
          archive_type: 'sirr_book_backup',
          backed_up_at: now,
          book_id: book.sirr_book_id,
          book_title: book.book_title,
          malayalam_book_name: book.malayalam_book_name,
          extraction_status: book.extraction_status,
          verification_status: book.verification_status,
          pdf_parts: book.pdf_parts || [],
          total_entries: entries.length,
          entries,
        };

        const payload = JSON.stringify(snapshot);
        const file = new File([payload], `sirr-backup-${book.sirr_book_id}-${Date.now()}.json`, { type: 'application/json' });
        const up = await sdk.integrations.Core.UploadPrivateFile({ file });
        const file_uri = up?.file_uri || up?.data?.file_uri || '';

        await sdk.entities.SirrManuscriptBook.update(book.id || book._id, {
          last_backup_at: now,
          last_backup_uri: file_uri,
          last_backup_entry_count: entries.length,
        }).catch(() => {});

        await sdk.entities.SirrAuditLog.create({
          audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          sirr_book_id: book.sirr_book_id,
          action: 'backup',
          user_id: user?.id || 'system',
          user_name: user?.full_name || user?.email || 'system',
          timestamp: now,
          status: 'success',
          details: `Backup created. file_uri: ${file_uri}`,
          entry_count: entries.length,
          file_uri,
        }).catch(() => {});

        backedUp++;
      } catch (e) {
        await sdk.entities.SirrAuditLog.create({
          audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          sirr_book_id: book.sirr_book_id,
          action: 'backup',
          user_id: user?.id || 'system',
          user_name: user?.full_name || user?.email || 'system',
          timestamp: now,
          status: 'failed',
          details: `Backup failed: ${String(e?.message || e).slice(0, 300)}`,
        }).catch(() => {});
      }
    }

    return Response.json({
      status: 'done',
      books_backed_up: backedUp,
      books_skipped_uptodate: skipped,
      budget_remaining_ms: Math.max(0, TIME_BUDGET_MS - (Date.now() - started)),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});