import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Transfer a Reading Access Code from its current Google account to a new one.
 * OWNER ONLY. Enforces one-account-one-code on the destination.
 *
 * Input:  { code_id: string, google_email: string }
 * Output: { success, message }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ success: false, message: "Authentication required." }, { status: 401 });

    // ── Owner-only ──
    let adminProfile: any = null;
    try {
      const aps = await base44.asServiceRole.entities.AdminProfile.filter({ email: me.email }, null, 1);
      if (aps && aps.length > 0) adminProfile = aps[0];
    } catch { /* ignore */ }
    if (!adminProfile || adminProfile.is_owner !== true) {
      try {
        const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('cf-connecting-ip') || '';
        await base44.asServiceRole.entities.OwnerAuditLog.create({
          log_id: 'OAL-REJECT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
          action_type: 'ACCESS_CODE_ACTION_REJECTED',
          action_label: 'Rejected: transfer AccessCode',
          performed_by_id: me.id,
          performed_by_email: me.email || '',
          performed_by_name: me.full_name || '',
          performed_by_role: adminProfile ? 'admin' : 'guest',
          object_type: 'AccessCode',
          object_id: code_id || '',
          object_label: '',
          details: JSON.stringify({ action: 'TRANSFER_ACCESS_CODE', reason: 'non-owner attempted transfer' }),
          ip_address: ip,
          user_agent: req.headers.get('user-agent') || '',
          timestamp: new Date().toISOString(),
        });
      } catch { /* best-effort */ }
      return Response.json({ success: false, message: "Owner access required to transfer." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { code_id, google_email } = body;
    if (!code_id) return Response.json({ success: false, message: "code_id is required." }, { status: 400 });
    if (!google_email || !google_email.trim()) return Response.json({ success: false, message: "google_email is required." }, { status: 400 });

    const email = google_email.trim().toLowerCase();

    const codes = await base44.asServiceRole.entities.AccessCode.filter({ id: code_id }, null, 1);
    if (!codes || codes.length === 0) return Response.json({ success: false, message: "Access Code not found." });
    const accessCode = codes[0];

    // Find the new target Google account
    let targetUser: any = null;
    try {
      const users = await base44.asServiceRole.entities.User.filter({ email }, null, 1);
      if (users && users.length > 0) targetUser = users[0];
    } catch { /* ignore */ }
    if (!targetUser) return Response.json({ success: false, message: "No Google account found with that email. Ask the customer to sign in with Google first." });

    // One Google account ↔ one code: reject if target already linked to a different code
    const existingLinked = await base44.asServiceRole.entities.AccessCode.filter({ linked_user_id: targetUser.id }, null, 100);
    const otherCodes = (existingLinked || []).filter((c: any) => c.id !== accessCode.id);
    if (otherCodes.length > 0) {
      return Response.json({ success: false, message: `The new Google account is already linked to code "${otherCodes[0].code}".` });
    }

    const oldEmail = accessCode.linked_user_email || "(none)";
    const nowISO = new Date().toISOString();
    await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
      linked_user_id: targetUser.id,
      linked_user_email: targetUser.email,
      linked_at: nowISO,
      linked_by: me.id,
      linked_by_name: me.full_name || me.email,
      audit_log: [...(accessCode.audit_log || []), {
        action: "GOOGLE_TRANSFERRED",
        timestamp: nowISO,
        admin_id: me.id,
        details: `Transferred from ${oldEmail} to ${targetUser.email} by ${me.full_name || me.email}`,
      }],
    });

    return Response.json({ success: true, message: `Access Code "${accessCode.code}" transferred from ${oldEmail} to ${targetUser.email}.` });
  } catch (error) {
    return Response.json({ success: false, message: error.message || "Transfer failed" }, { status: 500 });
  }
});