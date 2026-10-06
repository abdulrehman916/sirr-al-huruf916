import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Reset device binding for a Reading Access Code.
 * Clears used_by_user_id, used_by_email, used_at, device_id.
 * Resets use_count to 0. Increments reset_count.
 * Appends RESET_DEVICE audit entry + centralized AuditLog entry.
 *
 * Stabilization:
 *  - P3.6: Ensures reset always allows safe reactivation on another device
 *          (clears every binding field and the use counter atomically).
 *  - P3.7: Validates code_id.
 *  - P4.9: Writes a centralized AuditLog entry.
 *
 * Input:  { code_id }
 * Output: { success, message }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { code_id } = body;

    // ── P3.7: Input validation ──
    if (!code_id || typeof code_id !== 'string') {
      return Response.json({ error: 'code_id required' }, { status: 400 });
    }

    const code = await base44.asServiceRole.entities.AccessCode.get(code_id);
    if (!code) return Response.json({ error: 'Code not found' }, { status: 404 });

    const now = new Date().toISOString();
    const auditEntry = {
      action: 'RESET_DEVICE',
      timestamp: now,
      admin_id: user.id,
      details: `Device binding reset. Previous device: ${code.device_id || 'none'}`,
    };

    // ── P3.6: Clear every binding field + use counter so the code can be
    // redeemed cleanly on a new device. ──
    await base44.asServiceRole.entities.AccessCode.update(code_id, {
      used_by_user_id: null,
      used_by_email: null,
      used_at: null,
      device_id: null,
      use_count: 0,
      reset_count: (code.reset_count || 0) + 1,
      audit_log: [...(code.audit_log || []), auditEntry],
    });

    // ── P4.9: Centralized audit log ──
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        log_id: 'AUDIT-' + crypto.randomUUID().toUpperCase(),
        action_type: 'ACCESS_CODE_DEVICE_RESET',
        performed_by: user.id,
        performed_by_email: user.email || '',
        target_entity: 'AccessCode',
        target_id: code.code || code_id,
        details: JSON.stringify({ code_id, previous_device: code.device_id || null }),
        timestamp: now,
      });
    } catch { /* best-effort */ }

    return Response.json({
      success: true,
      message: 'Device binding reset. Code can now be redeemed on a new device.',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});