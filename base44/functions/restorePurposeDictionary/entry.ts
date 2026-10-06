import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// RESTORE — Purpose Dictionary rollback from a version snapshot
// ═══════════════════════════════════════════════════════════════
// ── ISOLATION CONTRACT ──
// ONLY reads/writes PurposeDictionary records + PurposeDictionaryVersion
// + PurposeDictionaryAuditLog. Never touches any other entity, Mizan,
// Ritual, Calculation, Timing, Astro, GatherRules, or UI subsystem.
// ═══════════════════════════════════════════════════════════════
// Deletes all current PurposeDictionary records, updates the version
// status, creates an audit log entry, and returns the snapshot file URL.
// The CLIENT then downloads the snapshot and bulk-creates records in
// 250-record chunks (avoids Deno function timeout on large datasets).
//
// Used for:
//   • Automatic rollback when a bulk import chunk fails
//   • Manual restore from the Version History panel

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { version_id, rolled_back_from_version } = body;

    if (!version_id) {
      return Response.json({ error: 'version_id is required' }, { status: 400 });
    }

    // ── Get version record ──
    const versions = await base44.asServiceRole.entities.PurposeDictionaryVersion.filter(
      { version_id },
      null,
      1
    );
    if (!versions || versions.length === 0) {
      return Response.json({ error: 'Version not found' }, { status: 404 });
    }
    const version = versions[0];

    // ── Soft-delete all current records (mark inactive) ──
    // Hard deleteMany({}) times out for 500+ records on this platform.
    // Instead, mark all current records is_active=false. The lookup
    // function filters by is_active=true, so this effectively clears
    // the dictionary. The client then recreates snapshot records as
    // new active records. Old inactive records can be cleaned up later.
    // updateMany handles ≤500 records/call; 3 calls covers ≤1500 records.
    let deletedCount = 0;
    for (let i = 0; i < 3; i++) {
      await base44.asServiceRole.entities.PurposeDictionary.updateMany(
        { is_active: true },
        { $set: { is_active: false } }
      );
    }
    // Approximate count from version record
    deletedCount = version.record_count || 0;

    // ── Update version status ──
    await base44.asServiceRole.entities.PurposeDictionaryVersion.update(version.id, {
      import_status: 'rolled_back',
      rolled_back_from_version: rolled_back_from_version || null,
    });

    // ── Create audit log entry ──
    await base44.asServiceRole.entities.PurposeDictionaryAuditLog.create({
      log_id: `PDA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action: 'RESTORE',
      version_id: version_id,
      performed_by: user.id,
      performed_by_email: user.email || '',
      details: JSON.stringify({
        restored_from_version: version_id,
        version_label: version.version_label,
        deleted_count: deletedCount,
        snapshot_file_url: version.snapshot_file_url,
        rolled_back_from: rolled_back_from_version || null,
      }),
      record_count: version.record_count || 0,
      timestamp: new Date().toISOString(),
    });

    // ── Return snapshot URL for client-side recreation ──
    return Response.json({
      success: true,
      deleted_count: deletedCount,
      snapshot_file_url: version.snapshot_file_url,
      record_count: version.record_count || 0,
      version_id: version_id,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});