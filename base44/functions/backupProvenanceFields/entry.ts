import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// PROVENANCE BACKUP (Phase 0 — safe, non-destructive)
//
// Copies every provenance/source field value from a public scholarly
// entity into the Owner-only ScholarlyProvenance store. This is the
// safe backup required by the Provenance Privacy Law BEFORE any field
// is cleared from a public entity. Nothing on the public record is
// modified — values are only copied. Re-runnable: existing backups
// (by provenance_id) are skipped.
//
// OWNER-ONLY: caller must be the Owner (AdminProfile.is_owner === true).
// Uses the service role so the admin-only ScholarlyProvenance entity
// can be written and the public entities can be scanned fully.
//
// payload: { entity: "<EntityName>", limit?: 200 }
//   entity must be one of the public scholarly entities in SPEC below.
// returns: { entity, scanned, backed_up, skipped_existing, has_more }
// ═══════════════════════════════════════════════════════════════

const SPEC = {
  HolyNameImportedSection: ['source_pdf_file', 'source_pdf_url', 'images', 'import_batch', 'content_hash'],
  HolyOnePDFName: ['source_pdf_file', 'import_batch', 'verified_by', 'verified_at', 'created_by'],
  HolyNameKnowledge: ['invocations', 'verification_sources', 'alternative_readings', 'alternative_spellings'],
  HolyNameEsotericKnowledge: ['sources'],
  HolyNameTranscriptionCache: ['source_pdf_url', 'page_text'],
  SirrManuscriptEntry: ['images', 'source_part_id', 'source_part_number', 'ocr_confidence'],
  SirrManuscriptBook: ['pdf_parts', 'original_file_url', 'original_file_name', 'processing_lock_until', 'verification_report', 'last_backup_uri', 'last_backup_at', 'last_backup_entry_count'],
  ManuscriptEntry: ['images', 'book_id', 'verified_arabic_hash', 'method_id', 'linked_method_id', 'primary_source', 'supporting_sources', 'verification_source', 'verification_date', 'extraction_confidence', 'extraction_date', 'duplicate_detection_date'],
  ManuscriptBook: ['original_file_url', 'original_file_name', 'onedrive_file_id', 'onedrive_file_path', 'onedrive_etag', 'onedrive_file_hash', 'onedrive_modified_date', 'validation_report'],
  AstroClockKnowledge: ['source_screenshot_url', 'source_book_id', 'source_entry_id', 'ocr_confidence', 'detected_language', 'upload_date', 'supporting_sources'],
  EntityKnowledge: ['source_book_id', 'source_entry_id', 'source_screenshot_url', 'extraction_confidence', 'supporting_sources'],
};

const OWNER_EMAIL = 'owner@sirralhuruf.app'; // safety net; real check is AdminProfile.is_owner

function nonEmpty(v) {
  if (v == null) return false;
  if (typeof v === 'string') return v.trim() !== '';
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    // ── Owner-only gate ──
    let isOwner = false;
    try {
      const profiles = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
      const profile = (profiles || []).find(
        (p) => (p.user_id && p.user_id === user.id) ||
               (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
      );
      isOwner = profile?.is_owner === true ||
                (user.email && user.email.toLowerCase() === OWNER_EMAIL);
    } catch { isOwner = false; }
    if (!isOwner) return Response.json({ error: 'Only the Owner can run the provenance backup' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const entity = String(body.entity || '');
    const limit = Math.min(Math.max(parseInt(body.limit, 10) || 200, 1), 500);
    if (!entity || !SPEC[entity]) {
      return Response.json({ error: 'Invalid entity', valid: Object.keys(SPEC) }, { status: 400 });
    }
    const fields = SPEC[entity];

    // ── Scan the public entity (service role), auto-paginating by created_date ──
    const MAX_PAGES = 10; // up to limit*10 records per call
    let scanned = 0, backed_up = 0, skipped_existing = 0;
    const toCreate = [];
    let before = body.before ? String(body.before) : '';
    let lastOldest = null;
    let exhausted = false;

    for (let page = 0; page < MAX_PAGES; page++) {
      let batch;
      if (before) {
        batch = await base44.asServiceRole.entities[entity].filter({ created_date: { $lt: before } }, '-created_date', limit);
      } else {
        batch = await base44.asServiceRole.entities[entity].list('-created_date', limit);
      }
      batch = batch || [];
      if (batch.length === 0) { exhausted = true; break; }
      const oldest = batch[batch.length - 1]?.created_date || null;
      for (const rec of batch) {
        scanned++;
        const rid = rec.id || rec._id;
        if (!rid) continue;
        const pid = `SP-${entity}-${rid}`;
        // capture all non-empty provenance fields for this record into one blob
        const captured = {};
        for (const f of fields) {
          const v = rec[f];
          if (nonEmpty(v)) captured[f] = v;
        }
        if (Object.keys(captured).length === 0) continue;
        const bookTitle = rec.book_title || rec.source_reference || rec.source_book_title || rec.book_name || rec.malayalam_book_name || '';
        toCreate.push({
          provenance_id: pid,
          source_entity: entity,
          record_id: rid,
          field_path: '__all__',
          field_value: JSON.stringify(captured),
          book_title: String(bookTitle).slice(0, 200),
          backed_up_at: new Date().toISOString(),
        });
      }
      if (batch.length < limit) { exhausted = true; break; }
      if (!oldest) break; // cannot advance without a cursor
      before = oldest;
      lastOldest = oldest;
    }

    // ── De-dup: find which provenance_ids already exist ──
    if (toCreate.length > 0) {
      const ids = toCreate.map((c) => c.provenance_id);
      // filter in chunks of 50 to avoid huge queries
      const existing = new Set();
      for (let i = 0; i < ids.length; i += 50) {
        const chunk = ids.slice(i, i + 50);
        const found = await base44.asServiceRole.entities.ScholarlyProvenance
          .filter({ provenance_id: { $in: chunk } }, null, 50)
          .catch(() => []);
        (found || []).forEach((p) => existing.add(p.provenance_id));
      }
      const fresh = toCreate.filter((c) => !existing.has(c.provenance_id));
      skipped_existing = toCreate.length - fresh.length;
      // bulkCreate in chunks of 100
      for (let i = 0; i < fresh.length; i += 100) {
        const chunk = fresh.slice(i, i + 100);
        try {
          await base44.asServiceRole.entities.ScholarlyProvenance.bulkCreate(chunk);
          backed_up += chunk.length;
        } catch (e) {
          // fall back to individual creates on bulk failure
          for (const c of chunk) {
            try { await base44.asServiceRole.entities.ScholarlyProvenance.create(c); backed_up++; }
            catch (_) {}
          }
        }
      }
    }

    return Response.json({
      success: true,
      entity,
      fields,
      scanned,
      provenance_records_found: toCreate.length,
      backed_up,
      skipped_existing,
      has_more: !exhausted,
      next_before: lastOldest,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});