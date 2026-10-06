import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// FINALIZE — Purpose Dictionary import completion/failure
// ═══════════════════════════════════════════════════════════════
// ── ISOLATION CONTRACT ──
// ONLY writes PurposeDictionaryVersion + PurposeDictionaryAuditLog.
// Never touches any other entity, Mizan, Ritual, Calculation, Timing,
// Astro, GatherRules, or UI subsystem.
// ═══════════════════════════════════════════════════════════════
// Called by the client after all import chunks are processed (or
// after a rollback). Updates the version record with the final import
// report and status, and creates an audit log entry.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { version_id, report, status } = body;

    if (!version_id) {
      return Response.json({ error: 'version_id is required' }, { status: 400 });
    }

    // ── Get + update version record ──
    const versions = await base44.asServiceRole.entities.PurposeDictionaryVersion.filter(
      { version_id },
      null,
      1
    );
    if (!versions || versions.length === 0) {
      return Response.json({ error: 'Version not found' }, { status: 404 });
    }

    await base44.asServiceRole.entities.PurposeDictionaryVersion.update(versions[0].id, {
      import_status: status || 'completed',
      import_report: report || {},
    });

    // ── Create audit log entry ──
    const action = status === 'failed' ? 'IMPORT_FAILED' : 'IMPORT_COMPLETED';
    await base44.asServiceRole.entities.PurposeDictionaryAuditLog.create({
      log_id: `PDA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      action,
      version_id: version_id,
      performed_by: user.id,
      performed_by_email: user.email || '',
      details: JSON.stringify(report || {}),
      record_count: (report?.imported || 0) + (report?.updated || 0),
      timestamp: new Date().toISOString(),
    });

    return Response.json({ success: true, version_id, status });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});