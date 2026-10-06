import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // User may be a guest (not logged in) — don't fail if auth.me() throws
    let user = null;
    try { user = await base44.auth.me(); } catch (e) { /* guest user */ }

    const { name, phone, email, page_path, page_name, message, session_id, existing_code, feature_id, plan_name, price, currency } = await req.json();

    if (!page_path) {
      return Response.json({ success: false, error: "Missing page_path" }, { status: 400 });
    }

    // ── Duplicate prevention ──
    // Reject if an open request (PENDING / AWAITING_PAYMENT / INFO_REQUESTED /
    // PAYMENT_CONFIRMED) already exists for the same session_id + page_path.
    // Closed/Rejected/CODE_UPDATED/APPROVED requests do NOT block a new one.
    if (session_id) {
      const openStatuses = ["PENDING", "AWAITING_PAYMENT", "INFO_REQUESTED", "PAYMENT_CONFIRMED"];
      const existingReqs = await base44.asServiceRole.entities.AccessRequest.filter(
        { session_id, page_path }, "-requested_at", 50
      );
      const hasOpen = (existingReqs || []).some(r => openStatuses.includes(r.status));
      if (hasOpen) {
        return Response.json({ success: false, error: "You already have an open request for this page. Please wait for a response." });
      }
    }

    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    await base44.asServiceRole.entities.AccessRequest.create({
      request_id: requestId,
      user_id: user?.id || null,
      session_id: session_id || null,
      existing_code: existing_code || null,
      name: name || (user?.full_name || "Guest User"),
      phone: phone || "",
      email: email || (user?.email || ""),
      page_path,
      page_name: page_name || page_path,
      feature_id: feature_id || null,
      plan_name: plan_name || null,
      price: price || null,
      currency: currency || null,
      message: message || "",
      status: "PENDING",
      requested_at: new Date().toISOString(),
    });

    return Response.json({ success: true, request_id: requestId });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});