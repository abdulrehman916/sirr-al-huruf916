import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Enable/Disable a Reading Access Code — OWNER ONLY (server-enforced).
 *
 * Defense-in-depth: AccessCode RLS blocks all user-scoped SDK update (role
 * superadmin), so this function (asServiceRole) is the ONLY path to toggle a
 * code's disabled flag. Verifies Owner, logs rejected attempts, appends an
 * audit_log entry, and writes a centralized AuditLog record.
 *
 * Input:  { code_id: string, disable: boolean }
 * Output: { success, message }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ success: false, message: "Authentication required." }, { status: 401 });

    let adminProfile: any = null;
    try {
      const aps = await base44.asServiceRole.entities.AdminProfile.filter({ email: me.email }, null, 1);
      if (aps && aps.length > 0) adminProfile = aps[0];
    } catch { /* ignore */ }
    const isOwner = adminProfile?.is_owner === true;
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('cf-connecting-ip') || '';
    const ua = req.headers.get('user-agent') || '';

    const body = await req.json().catch(() => ({}));
    const { code_id, disable } = body;

    if (!isOwner) {
      try {
        await base44.asServiceRole.entities.OwnerAuditLog.create({
          log_id: 'OAL-REJECT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
          action_type: 'ACCESS_CODE_ACTION_REJECTED',
          action_label: 'Rejected: ' + (disable ? 'disable' : 'enable') + ' AccessCode',
          performed_by_id: me.id,
          performed_by_email: me.email || '',
          performed_by_name: me.full_name || '',
          performed_by_role: adminProfile ? 'admin' : 'guest',
          object_type: 'AccessCode',
          object_id: code_id || '',
          object_label: '',
          details: JSON.stringify({ action: disable ? 'DISABLE_ACCESS_CODE' : 'ENABLE_ACCESS_CODE', reason: 'non-owner attempted toggle' }),
          ip_address: ip,
          user_agent: ua,
          timestamp: new Date().toISOString(),
        });
      } catch { /* best-effort */ }
      return Response.json({ success: false, message: "Owner access required to enable/disable Access Codes." }, { status: 403 });
    }

    if (!code_id || typeof code_id !== 'string') return Response.json({ success: false, message: "code_id required." }, { status: 400 });

    const code = await base44.asServiceRole.entities.AccessCode.get(code_id);
    if (!code) return Response.json({ success: false, message: "Code not found." }, { status: 404 });

    const now = new Date().toISOString();
    await base44.asServiceRole.entities.AccessCode.update(code_id, {
      is_disabled: !!disable,
      audit_log: [...(code.audit_log || []), {
        action: disable ? 'DISABLED' : 'ENABLED',
        timestamp: now,
        admin_id: me.id,
        details: disable ? 'Code disabled' : 'Code enabled',
      }],
    });

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        log_id: 'AUDIT-' + crypto.randomUUID().toUpperCase(),
        action_type: disable ? 'ACCESS_CODE_DISABLED' : 'ACCESS_CODE_ENABLED',
        performed_by: me.id,
        performed_by_email: me.email || '',
        target_entity: 'AccessCode',
        target_id: code.code || code_id,
        details: JSON.stringify({ code_id, action: disable ? 'disabled' : 'enabled' }),
        timestamp: now,
      });
    } catch { /* best-effort */ }

    return Response.json({ success: true, message: `Code "${code.code}" ${disable ? 'disabled' : 'enabled'}.` });
  } catch (error) {
    return Response.json({ success: false, message: error.message || "Toggle failed" }, { status: 500 });
  }
});