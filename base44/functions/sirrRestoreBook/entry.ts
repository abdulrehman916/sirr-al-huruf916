import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR RESTORE BOOK — sirrRestoreBook
//
// Recovery capability (RULE 11). Restores a book's extracted entries
// from a permanent backup JSON file. Idempotent and NON-DESTRUCTIVE:
// only entries whose sirr_entry_id does NOT already exist in the
// database are created — existing entries are never overwritten or
// deleted (RULE 5).
//
// Params:
//   { file_uri }          — restore from this specific backup file
//   { sirr_book_id }      — use the book's last_backup_uri
//
// The backup JSON is fetched via a signed URL, parsed, and missing
// entries are bulk-created. The restore is permanently recorded in
// SirrAuditLog (action='restore').
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    let file_uri = body.file_uri || '';
    let sirr_book_id = body.sirr_book_id || '';

    if (!file_uri) {
      if (!sirr_book_id) return Response.json({ error: 'file_uri or sirr_book_id is required' }, { status: 400 });
      const books = await sdk.entities.SirrManuscriptBook.filter({ sirr_book_id }, undefined, 1);
      const book = books[0];
      if (!book) return Response.json({ error: 'Book not found: ' + sirr_book_id }, { status: 404 });
      file_uri = book.last_backup_uri || '';
      if (!file_uri) return Response.json({ error: 'No backup on record for this book. Pass a file_uri.' }, { status: 400 });
      sirr_book_id = sirr_book_id || book.sirr_book_id;
    }

    // Create a signed URL to read the private backup file.
    const signed = await sdk.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 300 });
    const signed_url = signed?.signed_url || signed?.data?.signed_url;
    if (!signed_url) return Response.json({ error: 'Could not create signed URL for backup file' }, { status: 500 });

    const res = await fetch(signed_url);
    if (!res.ok) return Response.json({ error: `Fetch backup failed (HTTP ${res.status})` }, { status: 502 });
    const snapshot = await res.json();
    const backupEntries = Array.isArray(snapshot.entries) ? snapshot.entries : [];
    const target_book = snapshot.book_id || snapshot.sirr_book_id || sirr_book_id || '';

    if (!target_book) return Response.json({ error: 'Backup file has no book_id' }, { status: 400 });

    // Determine which sirr_entry_ids already exist (non-destructive).
    const existingIds = new Set();
    let lastOrder = -1;
    while (true) {
      const batch = await sdk.entities.SirrManuscriptEntry.filter(
        { sirr_book_id: target_book, entry_order: { $gt: lastOrder } },
        'entry_order',
        5000
      );
      if (!batch.length) break;
      for (const e of batch) { if (e.sirr_entry_id) existingIds.add(e.sirr_entry_id); lastOrder = Number(e.entry_order) || lastOrder; }
      if (batch.length < 5000) break;
    }

    const toCreate = [];
    for (const e of backupEntries) {
      if (!e.sirr_entry_id || existingIds.has(e.sirr_entry_id)) continue;
      // Strip built-in ids so the DB assigns fresh ones; keep the permanent natural key.
      const clean = { ...e };
      delete clean.id;
      delete clean._id;
      delete clean.created_date;
      delete clean.updated_date;
      delete clean.created_by_id;
      toCreate.push(clean);
    }

    let created = 0;
    for (let i = 0; i < toCreate.length; i += 100) {
      await sdk.entities.SirrManuscriptEntry.bulkCreate(toCreate.slice(i, i + 100));
      created += toCreate.slice(i, i + 100).length;
    }

    const now = new Date().toISOString();
    await sdk.entities.SirrAuditLog.create({
      audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sirr_book_id: target_book,
      action: 'restore',
      user_id: user.id || '',
      user_name: user.full_name || user.email || '',
      timestamp: now,
      status: 'success',
      details: `Restored ${created} entries from backup. file_uri: ${file_uri} (${existingIds.size} already present, skipped).`,
      entry_count: created,
      file_uri,
    }).catch(() => {});

    return Response.json({
      status: 'success',
      sirr_book_id: target_book,
      restored: created,
      already_present: existingIds.size,
      backup_entry_count: backupEntries.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});