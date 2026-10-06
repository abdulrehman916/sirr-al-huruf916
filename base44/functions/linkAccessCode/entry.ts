import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Link an existing Reading Access Code to a customer's Google account.
 * Owner or Admin only. The customer must have signed in with Google at least
 * once so a Base44 User record exists for their email.
 *
 * Enforces:
 *  - One code ↔ one Google account (reject if code already linked elsewhere).
 *  - One Google account ↔ one code (reject if account already linked to another code).
 *
 * Does NOT touch redemption/use_count/device binding — linking is independent.
 *
 * Input:  { code_id: string, google_email: string }
 * Output: { success, message }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ success: false, message: "Authentication required." }, { status: 401 });

    // ── Resolve Owner/Admin role via AdminProfile ──
    let adminProfile: any = null;
    try {
      const aps = await base44.asServiceRole.entities.AdminProfile.filter({ email: me.email }, null, 1);
      if (aps && aps.length > 0) adminProfile = aps[0];
    } catch { /* ignore */ }
    const isOwner = adminProfile?.is_owner === true;
    const isAdminOrOwner = isOwner || (adminProfile && adminProfile.status === 'ACTIVE');
    if (!isAdminOrOwner) return Response.json({ success: false, message: "Owner or Admin access required." }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { code_id, google_email } = body;
    if (!code_id || typeof code_id !== "string") return Response.json({ success: false, message: "code_id is required." }, { status: 400 });
    if (!google_email || typeof google_email !== "string" || !google_email.trim()) return Response.json({ success: false, message: "google_email is required." }, { status: 400 });

    const email = google_email.trim().toLowerCase();

    // Find the code
    const codes = await base44.asServiceRole.entities.AccessCode.filter({ id: code_id }, null, 1);
    if (!codes || codes.length === 0) return Response.json({ success: false, message: "Access Code not found." });
    const accessCode = codes[0];

    // One code ↔ one Google account
    if (accessCode.linked_user_id && (accessCode.linked_user_email || "").toLowerCase() !== email) {
      return Response.json({ success: false, message: "This Access Code is already linked to another Google account. Use Transfer (Owner only) to reassign." });
    }

    // Find the customer's Base44 user by Google email (must have signed in once)
    let targetUser: any = null;
    try {
      const users = await base44.asServiceRole.entities.User.filter({ email }, null, 1);
      if (users && users.length > 0) targetUser = users[0];
    } catch { /* ignore */ }
    if (!targetUser) return Response.json({ success: false, message: "No Google account found with that email. Ask the customer to sign in with Google first, then link." });

    // One Google account ↔ one code
    const existingLinked = await base44.asServiceRole.entities.AccessCode.filter({ linked_user_id: targetUser.id }, null, 100);
    const otherCodes = (existingLinked || []).filter((c: any) => c.id !== accessCode.id);
    if (otherCodes.length > 0) {
      return Response.json({ success: false, message: `This Google account is already linked to code "${otherCodes[0].code}". One account ↔ one code.` });
    }

    const nowISO = new Date().toISOString();
    await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
      linked_user_id: targetUser.id,
      linked_user_email: targetUser.email,
      linked_at: nowISO,
      linked_by: me.id,
      linked_by_name: me.full_name || me.email,
      audit_log: [...(accessCode.audit_log || []), {
        action: "GOOGLE_LINKED",
        timestamp: nowISO,
        admin_id: me.id,
        details: `Linked to Google account ${targetUser.email} by ${me.full_name || me.email}`,
      }],
    });

    return Response.json({ success: true, message: `Access Code "${accessCode.code}" linked to ${targetUser.email}. The customer will get access on next sign-in.` });
  } catch (error) {
    return Response.json({ success: false, message: error.message || "Link failed" }, { status: 500 });
  }
});