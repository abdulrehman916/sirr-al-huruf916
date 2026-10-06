import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// VERIFIED ARABIC MIGRATION ROLLBACK — AUTO-RESTORE SAFEGUARD
// ═══════════════════════════════════════════════════════════════
// PURPOSE: If any migration step fails, automatically rollback to
// the previous state by restoring from a backup file.
//
// RULES:
//   - Never overwrite or delete existing verified Arabic, translations,
//     manuscript references, images, or revision history.
//   - Existing record IDs and hashes must remain unchanged.
//   - Only RESTORE fields that were accidentally overwritten.
//   - Only RECREATE records that were accidentally deleted.
//   - New records created after the backup are PRESERVED (not deleted).
//
// USAGE: POST with { backup_file_url: "https://..." }
// ADMIN ONLY — requires admin role.
// ═══════════════════════════════════════════════════════════════

// Fields that existed BEFORE the migration — must never be overwritten
const ORIGINAL_FIELDS = [
  'text_hash', 'arabic_text', 'arabic_text_normalized', 'malayalam_meaning',
  'english_meaning', 'source_type', 'book_name', 'page_number', 'section',
  'source_url', 'source_priority', 'verification_status', 'cross_verification_sources',
  'holy_name_match', 'manuscript_match', 'manuscript_source_detail',
  'manuscript_arabic_text', 'date_verified', 'reviewer', 'notes',
];

// Fields ADDED by the migration
const MIGRATION_FIELDS = [
  'verification_confidence', 'verification_method', 'primary_source',
  'secondary_sources', 'original_manuscript_text', 'revision_number', 'revision_reason',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { backup_file_url } = body;
    if (!backup_file_url) {
      return Response.json({ error: 'backup_file_url is required' }, { status: 400 });
    }

    // ── Fetch the backup file ──
    const backupResponse = await fetch(backup_file_url);
    if (!backupResponse.ok) {
      return Response.json({ error: 'Failed to fetch backup file' }, { status: 500 });
    }
    const backupData = await backupResponse.json();
    const backupRecords = backupData.records || [];

    // ── Fetch all current records ──
    const currentRecords = await base44.asServiceRole.entities.VerifiedArabic.list('-created_date', 500);
    const currentMap = new Map(currentRecords.map((r) => [r.id, r]));

    const report = {
      backup_date: backupData.backup_date || 'unknown',
      backup_record_count: backupRecords.length,
      current_record_count: currentRecords.length,
      restored: 0,
      recreated: 0,
      untouched: 0,
      errors: [],
      details: [],
    };

    // ── Process each backup record ──
    for (const backupRecord of backupRecords) {
      const current = currentMap.get(backupRecord.id);

      if (!current) {
        // Record was deleted — recreate from backup (preserving original ID is not possible,
        // but we recreate with same text_hash so it links to the same record chain)
        try {
          const restoreRecord = { ...backupRecord };
          // Remove system fields that can't be set on create
          delete restoreRecord.id;
          delete restoreRecord.created_date;
          delete restoreRecord.updated_date;
          delete restoreRecord.created_by_id;

          await base44.asServiceRole.entities.VerifiedArabic.create(restoreRecord);
          report.recreated++;
          report.details.push({
            id: backupRecord.id,
            text_hash: backupRecord.text_hash?.slice(0, 16),
            action: 'recreated_from_backup',
          });
        } catch (e) {
          report.errors.push({ id: backupRecord.id, action: 'recreate', error: e.message });
        }
      } else {
        // Record exists — check if any ORIGINAL field was overwritten
        const overwrittenFields = [];
        for (const field of ORIGINAL_FIELDS) {
          const backupVal = backupRecord[field];
          const currentVal = current[field];
          // Compare values (handle arrays/objects with JSON.stringify)
          if (backupVal !== undefined) {
            const backupStr = JSON.stringify(backupVal);
            const currentStr = JSON.stringify(currentVal);
            if (backupStr !== currentStr) {
              overwrittenFields.push(field);
            }
          }
        }

        if (overwrittenFields.length > 0) {
          // Original field(s) were overwritten — restore from backup
          try {
            const updates = {};
            for (const field of overwrittenFields) {
              updates[field] = backupRecord[field];
            }
            await base44.asServiceRole.entities.VerifiedArabic.update(current.id, updates);
            report.restored++;
            report.details.push({
              id: backupRecord.id,
              text_hash: backupRecord.text_hash?.slice(0, 16),
              action: 'restored_overwritten_fields',
              fields: overwrittenFields,
            });
          } catch (e) {
            report.errors.push({ id: backupRecord.id, action: 'restore', error: e.message });
          }
        } else {
          // No original fields were overwritten — record is safe
          report.untouched++;
        }
      }
    }

    // ── Summary ──
    const success = report.errors.length === 0;
    return Response.json({
      status: success ? 'rollback_complete' : 'rollback_completed_with_errors',
      success,
      ...report,
      message: success
        ? `Rollback complete. ${report.restored} records restored, ${report.recreated} recreated, ${report.untouched} untouched.`
        : `Rollback completed with ${report.errors.length} errors. ${report.restored} restored, ${report.recreated} recreated, ${report.untouched} untouched.`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'rollback_failed' }, { status: 500 });
  }
});