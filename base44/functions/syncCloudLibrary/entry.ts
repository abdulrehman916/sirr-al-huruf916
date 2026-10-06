import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// LIVE CLOUD AUTO-SYNC — Master PDF Library
//
// Detects add / update / rename / replace / delete across connected
// cloud sources and flags changed books for re-indexing. It does NOT
// auto-overwrite approved knowledge (append-only law §13): it records
// the detected change in SirrAuditLog and marks the book for the Owner
// to reprocess via the existing review/reprocess flow. Only changed
// books are flagged (re-index only changed pages), never the whole
// library.
//
// Coverage (no entity schema changes this phase):
//   • OneDrive  — full add/update/delete via onedrive_file_id + etag +
//                 modified_date (fields already on MasterPdfBook).
//   • Google Drive — new-file detection (no google file_id stored yet;
//                 per-file update tracking needs a schema addition).
//   • Adobe — reported unavailable (no public list/search API; creds
//                 pending).
//
// Runs unattended (scheduled automation) — allows no-user (system).
// SECURITY: only system or an admin/owner may invoke.
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    // Owner-only when invoked by a person; no-user (system/scheduled) is allowed.
    if (user) {
      let isOwner = false;
      try {
        const profiles = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
        const profile = (profiles || []).find((p) =>
          (p.user_id && p.user_id === user.id) ||
          (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
        );
        isOwner = profile?.is_owner === true;
      } catch { isOwner = false; }
      if (!isOwner) return Response.json({ error: 'Only the Owner can run cloud sync' }, { status: 403 });
    }
    const sdk = base44.asServiceRole;
    const now = new Date().toISOString();

    const books = await sdk.entities.MasterPdfBook.list('-upload_date', 300);
    const byOneDriveId = {};
    const byGoogleDriveId = {};
    const byFileName = {};
    (books || []).forEach((b) => {
      if (b.onedrive_file_id) byOneDriveId[b.onedrive_file_id] = b;
      if (b.google_drive_file_id) byGoogleDriveId[b.google_drive_file_id] = b;
      (Array.isArray(b.pdf_parts) ? b.pdf_parts : []).forEach((pt) => {
        if (pt.file_name) byFileName[pt.file_name] = b;
      });
      if (b.book_title) byFileName[b.book_title] = b;
    });

    const events = []; // {type:'add'|'update'|'rename'|'delete'|'replace', source, book_id, file_name, detail}

    // ── OneDrive ──
    try {
      const conn = await sdk.connectors.getConnection('one_drive');
      if (conn?.accessToken) {
        // List all PDFs (top 200) to detect add/update/delete
        const res = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/root?$top=1&$select=id`,
          { headers: { Authorization: `Bearer ${conn.accessToken}` } }
        );
        // Use the search-by-type: list children recursively is heavy; instead use $search for pdf
        const sres = await fetch(
          `https://graph.microsoft.com/v1.0/me/drive/root/microsoft.graph.search(q='.pdf')?$select=name,id,size,lastModifiedDateTime,eTag,file&$top=200`,
          { headers: { Authorization: `Bearer ${conn.accessToken}` } }
        );
        if (sres.ok) {
          const data = await sres.json();
          const driveIds = new Set();
          for (const it of (data.value || [])) {
            if (!it.file || it.file.mimeType !== 'application/pdf') continue;
            driveIds.add(it.id);
            const existing = byOneDriveId[it.id];
            if (!existing) {
              events.push({ type: 'add', source: 'OneDrive', file_name: it.name, file_id: it.id, detail: 'New PDF in OneDrive — awaiting import' });
            } else {
              const etagChanged = existing.onedrive_etag && it.eTag && existing.onedrive_etag !== it.eTag;
              const modChanged = existing.onedrive_modified_date && it.lastModifiedDateTime && existing.onedrive_modified_date !== it.lastModifiedDateTime;
              const renamed = existing.book_title && existing.book_title !== it.name && !(Array.isArray(existing.pdf_parts) && existing.pdf_parts.some((pt) => pt.file_name === it.name));
              if (etagChanged || modChanged) {
                events.push({ type: 'update', source: 'OneDrive', book_id: existing.master_book_id, file_name: it.name, detail: `Modified (etag/mod changed) — flagged for re-index` });
                await flagForReindex(sdk, existing, now, user);
              }
              if (renamed) {
                events.push({ type: 'rename', source: 'OneDrive', book_id: existing.master_book_id, file_name: it.name, detail: `Renamed: '${existing.book_title}' → '${it.name}'` });
              }
            }
          }
          // Deletes: OneDrive file_ids in DB but not in Drive
          for (const id of Object.keys(byOneDriveId)) {
            if (!driveIds.has(id)) {
              const b = byOneDriveId[id];
              if (b.import_source === 'onedrive') {
                events.push({ type: 'delete', source: 'OneDrive', book_id: b.master_book_id, file_name: b.book_title, detail: 'File no longer in OneDrive (possibly deleted)' });
              }
            }
          }
        }
      }
    } catch (_) {}

    // ── Google Drive — full add/update/rename/move/delete (mirrors OneDrive).
    //    Each PDF is a LIVE-INDEX book linked by google_drive_file_id. No binary
    //    is copied. Matching is by file ID only (no name matching → no duplicates).
    try {
      const conn = await sdk.connectors.getConnection('googledrive');
      if (conn?.accessToken) {
        let pageToken = '';
        const driveIds = new Set();
        const driveFiles = [];
        do {
          const q = encodeURIComponent("mimeType='application/pdf' and trashed=false");
          const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,modifiedTime,size,webViewLink,parents),nextPageToken&pageSize=200${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ''}`;
          const res = await fetch(url, { headers: { Authorization: `Bearer ${conn.accessToken}` } });
          if (!res.ok) break;
          const data = await res.json();
          (data.files || []).forEach((f) => { driveFiles.push(f); driveIds.add(f.id); });
          pageToken = data.nextPageToken || '';
        } while (pageToken);

        for (const f of driveFiles) {
          const existing = byGoogleDriveId[f.id];
          const parent = (f.parents && f.parents[0]) || '';
          if (!existing) {
            // ADD — create a live-index book linked by Google Drive file ID (no binary copied)
            const bookId = `MPB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            await sdk.entities.MasterPdfBook.create({
              master_book_id: bookId,
              library_type: 'master_library',
              import_source: 'googledrive',
              book_title: f.name,
              google_drive_file_id: f.id,
              google_drive_name: f.name,
              google_drive_modified_time: f.modifiedTime || '',
              google_drive_parent_id: parent,
              google_drive_view_link: f.webViewLink || '',
              upload_date: now,
              import_date: now,
              extraction_status: 'pending',
              extraction_error: 'Live index — awaiting indexing',
              combined_total_pages: 0,
              total_pages_indexed: 0,
              pdf_parts: [],
              version_history: [{ version_id: `V-${Date.now()}`, timestamp: now, action: 'cloud_sync', change_summary: 'Detected in Google Drive (live index created)' }],
            }).catch(() => {});
            events.push({ type: 'add', source: 'Google Drive', book_id: bookId, file_name: f.name, file_id: f.id, detail: 'New PDF — live index created' });
          } else {
            const modChanged = f.modifiedTime && existing.google_drive_modified_time && f.modifiedTime !== existing.google_drive_modified_time;
            const renamed = f.name && existing.google_drive_name && f.name !== existing.google_drive_name;
            const moved = parent && existing.google_drive_parent_id && parent !== existing.google_drive_parent_id;
            if (modChanged || renamed || moved) {
              const patch = {
                google_drive_modified_time: f.modifiedTime || existing.google_drive_modified_time,
                google_drive_name: f.name,
                google_drive_parent_id: parent,
                google_drive_view_link: f.webViewLink || existing.google_drive_view_link,
              };
              if (renamed) patch.book_title = f.name;
              if (modChanged) { patch.extraction_status = 'pending'; patch.extraction_error = 'Google Drive file updated — pending re-index'; }
              await sdk.entities.MasterPdfBook.update(existing.id || existing._id, patch).catch(() => {});
              if (modChanged) await flagForReindex(sdk, existing, now, user);
              if (modChanged) events.push({ type: 'update', source: 'Google Drive', book_id: existing.master_book_id, file_name: f.name, detail: 'Modified — flagged for re-index' });
              if (renamed) events.push({ type: 'rename', source: 'Google Drive', book_id: existing.master_book_id, file_name: f.name, detail: `Renamed → '${f.name}'` });
              if (moved) events.push({ type: 'move', source: 'Google Drive', book_id: existing.master_book_id, file_name: f.name, detail: 'Moved (parent folder changed)' });
            }
          }
        }
        // DELETE — Google Drive file_ids in DB but no longer in Drive (trashed or permanently deleted)
        for (const id of Object.keys(byGoogleDriveId)) {
          if (!driveIds.has(id)) {
            const b = byGoogleDriveId[id];
            if (b.import_source === 'googledrive') {
              const indexedPages = Number(b.total_pages_indexed || 0);
              if (indexedPages === 0) {
                // Pure live index (no extracted knowledge) — remove to avoid orphan/stale
                await sdk.entities.MasterPdfBook.delete(b.id || b._id).catch(() => {});
                events.push({ type: 'delete', source: 'Google Drive', book_id: b.master_book_id, file_name: b.book_title, detail: 'Removed from Drive — live-index record deleted (no indexed pages)' });
              } else {
                // Knowledge already extracted — preserve (append-only), mark source-deleted (never stale)
                await sdk.entities.MasterPdfBook.update(b.id || b._id, { extraction_status: 'cloud_deleted', extraction_error: 'Source file removed from Google Drive' }).catch(() => {});
                events.push({ type: 'delete', source: 'Google Drive', book_id: b.master_book_id, file_name: b.book_title, detail: 'Removed from Drive — marked cloud_deleted (indexed knowledge preserved)' });
              }
            }
          }
        }
      }
    } catch (_) {}

    // ── Audit + summary ──
    const summary = {
      checked_at: now,
      onedrive_detected: events.filter((e) => e.source === 'OneDrive').length,
      google_drive_detected: events.filter((e) => e.source === 'Google Drive').length,
      adobe: 'unavailable (no public list API; credentials pending)',
    };
    for (const ev of events) {
      await sdk.entities.SirrAuditLog.create({
        audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sirr_book_id: ev.book_id || 'CLOUD-SYNC',
        action: 'integrity_check',
        user_id: user?.id || 'system',
        user_name: user?.full_name || user?.email || 'system',
        timestamp: now,
        status: 'info',
        details: `[CLOUD-SYNC] ${ev.type.toUpperCase()} · ${ev.source} · ${ev.file_name} — ${ev.detail}`,
      }).catch(() => {});
    }

    return Response.json({ success: true, events, summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function flagForReindex(sdk, book, now, user) {
  try {
    // Only flag if not currently locked by the pipeline.
    if (book.processing_lock_until) {
      const lock = new Date(book.processing_lock_until).getTime();
      if (lock > Date.now()) return; // pipeline is busy; skip this cycle
    }
    await sdk.entities.MasterPdfBook.update(book.id || book._id, {
      extraction_status: 'pending',
      extraction_error: 'Cloud file changed — pending re-index (auto-sync)',
    });
  } catch (_) {}
}