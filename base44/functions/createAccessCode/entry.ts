import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Create a Reading Access Code — OWNER ONLY (server-enforced).
 *
 * Defense-in-depth: AccessCode RLS blocks all user-scoped SDK create (role
 * superadmin), so this function (asServiceRole) is the ONLY path to create a
 * code. It verifies the caller is the Owner via AdminProfile.is_owner, logs
 * every rejected attempt to OwnerAuditLog (user, email, role, action, IP, UA),
 * performs an authoritative duplicate-code check, then creates the record.
 *
 * Input:  { code_data: object }  — full AccessCode record as built by CreateCodeForm
 * Output: { success, id, message }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ success: false, message: "Authentication required." }, { status: 401 });

    // ── Owner check via AdminProfile ──
    let adminProfile: any = null;
    try {
      const aps = await base44.asServiceRole.entities.AdminProfile.filter({ email: me.email }, null, 1);
      if (aps && aps.length > 0) adminProfile = aps[0];
    } catch { /* ignore */ }
    const isOwner = adminProfile?.is_owner === true;
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('cf-connecting-ip') || '';
    const ua = req.headers.get('user-agent') || '';

    const body = await req.json().catch(() => ({}));
    const { code_data } = body;

    if (!isOwner) {
      try {
        await base44.asServiceRole.entities.OwnerAuditLog.create({
          log_id: 'OAL-REJECT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
          action_type: 'ACCESS_CODE_ACTION_REJECTED',
          action_label: 'Rejected: create AccessCode',
          performed_by_id: me.id,
          performed_by_email: me.email || '',
          performed_by_name: me.full_name || '',
          performed_by_role: adminProfile ? 'admin' : 'guest',
          object_type: 'AccessCode',
          object_id: '',
          object_label: code_data?.code || '',
          details: JSON.stringify({ action: 'CREATE_ACCESS_CODE', reason: 'non-owner attempted create' }),
          ip_address: ip,
          user_agent: ua,
          timestamp: new Date().toISOString(),
        });
      } catch { /* best-effort */ }
      return Response.json({ success: false, message: "Owner access required to create Access Codes." }, { status: 403 });
    }

    if (!code_data || !code_data.code) return Response.json({ success: false, message: "code_data.code required." }, { status: 400 });

    // Authoritative duplicate check (service role)
    const existing = await base44.asServiceRole.entities.AccessCode.filter({ code: code_data.code }, null, 1);
    if (existing && existing.length > 0) return Response.json({ success: false, message: `Code "${code_data.code}" already exists.` }, { status: 409 });

    const created = await base44.asServiceRole.entities.AccessCode.create(code_data);

    // Centralized success audit
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        log_id: 'AUDIT-' + crypto.randomUUID().toUpperCase(),
        action_type: 'ACCESS_CODE_CREATED',
        performed_by: me.id,
        performed_by_email: me.email || '',
        target_entity: 'AccessCode',
        target_id: code_data.code,
        details: JSON.stringify({ customer: code_data.customer_name, pages: (code_data.page_paths || []).length }),
        timestamp: new Date().toISOString(),
      });
    } catch { /* best-effort */ }

    return Response.json({ success: true, id: created.id, message: `Code "${code_data.code}" created.` });
  } catch (error) {
    return Response.json({ success: false, message: error.message || "Create failed" }, { status: 500 });
  }
});