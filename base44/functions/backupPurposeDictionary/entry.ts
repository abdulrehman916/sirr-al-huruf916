import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// BACKUP — Purpose Dictionary snapshot before bulk import
// ═══════════════════════════════════════════════════════════════
// ── ISOLATION CONTRACT ──
// ONLY reads PurposeDictionary records and writes PurposeDictionaryVersion
// + PurposeDictionaryAuditLog. Never touches any other entity, Mizan,
// Ritual, Calculation, Timing, Astro, GatherRules, or UI subsystem.
// ═══════════════════════════════════════════════════════════════
// Creates a full snapshot of all PurposeDictionary records, uploads it
// as a JSON file, stores the URL in a PurposeDictionaryVersion record,
// and logs to PurposeDictionaryAuditLog. Returns version_id for
// rollback association.
//
// Uses defensive pagination (Set-based dedup) to handle SDK skip
// limitations. Scales to 10K+ records per call; client can call
// repeatedly for larger datasets.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const label = body.label || `Pre-import backup ${new Date().toISOString()}`;
    const trigger = body.trigger || 'pre_import';

    // ── Paginate through all PurposeDictionary records ──
    const seen = new Set();
    const allRecords = [];
    let skip = 0;
    const BATCH = 500;

    while (true) {
      const batch = await base44.asServiceRole.entities.PurposeDictionary.list(
        '-created_date',
        BATCH,
        skip
      );
      if (!batch || batch.length === 0) break;

      let newCount = 0;
      for (const r of batch) {
        if (r.id && !seen.has(r.id)) {
          seen.add(r.id);
          // Strip built-in fields — they'll be regenerated on restore
          const { id, created_date, updated_date, created_by_id, ...clean } = r;
          allRecords.push(clean);
          newCount++;
        }
      }

      if (newCount === 0) break; // skip not supported or exhausted
      skip += BATCH;
      if (batch.length < BATCH) break;
    }

    // ── Build JSON snapshot + upload ──
    const jsonStr = JSON.stringify(allRecords);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const file = new File([blob], `pd-backup-${Date.now()}.json`, { type: 'application/json' });
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    const fileUrl = uploadResult.file_url;

    // ── Create version record ──
    const versionId = `VER-${Date.now()}`;
    await base44.asServiceRole.entities.PurposeDictionaryVersion.create({
      version_id: versionId,
      version_label: label,
      trigger,
      snapshot_file_url: fileUrl,
      record_count: allRecords.length,
      import_status: 'pending',
      created_by: user.id,
      created_by_email: user.email || '',
      created_at: new Date().toISOString(),
    });

    // ── Create audit log entry ──
    await base44.asServiceRole.entities.PurposeDictionaryAuditLog.create({
      log_id: `PDA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action: 'BACKUP_CREATED',
      version_id: versionId,
      performed_by: user.id,
      performed_by_email: user.email || '',
      details: JSON.stringify({ label, trigger, record_count: allRecords.length }),
      record_count: allRecords.length,
      timestamp: new Date().toISOString(),
    });

    return Response.json({
      version_id: versionId,
      record_count: allRecords.length,
      file_url: fileUrl,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});