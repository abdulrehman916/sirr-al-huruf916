import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Unlink a Reading Access Code from its Google account. OWNER ONLY.
 * Clears the Google link fields. Does NOT delete the code, change pages, or
 * modify expiry/redeem state — only the Google account link is removed.
 *
 * Input:  { code_id: string }
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
      return Response.json({ success: false, message: "Owner access required to unlink." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { code_id } = body;
    if (!code_id) return Response.json({ success: false, message: "code_id is required." }, { status: 400 });

    const codes = await base44.asServiceRole.entities.AccessCode.filter({ id: code_id }, null, 1);
    if (!codes || codes.length === 0) return Response.json({ success: false, message: "Access Code not found." });
    const accessCode = codes[0];
    if (!accessCode.linked_user_id) return Response.json({ success: false, message: "This code is not linked to any Google account." });

    const nowISO = new Date().toISOString();
    await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
      linked_user_id: null,
      linked_user_email: null,
      linked_at: null,
      linked_by: null,
      linked_by_name: null,
      audit_log: [...(accessCode.audit_log || []), {
        action: "GOOGLE_UNLINKED",
        timestamp: nowISO,
        admin_id: me.id,
        details: `Unlinked from Google account ${accessCode.linked_user_email} by ${me.full_name || me.email}`,
      }],
    });

    return Response.json({ success: true, message: `Access Code "${accessCode.code}" unlinked from ${accessCode.linked_user_email}.` });
  } catch (error) {
    return Response.json({ success: false, message: error.message || "Unlink failed" }, { status: 500 });
  }
});