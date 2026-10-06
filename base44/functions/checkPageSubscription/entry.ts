import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_id, page_path } = await req.json();

    if (!user_id || !page_path) {
      return Response.json({ success: false, message: "User ID and page path required" }, { status: 400 });
    }

    const user = await base44.auth.me();
    if (!user || (user.id !== user_id && user.role !== 'admin')) {
      return Response.json({ success: false, message: "Access denied" }, { status: 403 });
    }

    // ── BLOCK/ARCHIVE CHECK ──────────────────────────────────────────────────
    const profiles = await base44.entities.UserAccessProfile.filter({ user_id }, null, 1);
    if (profiles.length > 0) {
      const status = profiles[0].account_status;
      if (status === 'BLOCKED' || status === 'ARCHIVED') {
        return Response.json({ success: true, has_subscription: false, message: "Account restricted" });
      }
    }

    // Find active subscriptions for this user and page
    const subscriptions = await base44.entities.Subscription.filter({
      user_id,
      page_path,
      status: "ACTIVE"
    });

    if (subscriptions.length === 0) {
      return Response.json({ success: true, has_subscription: false, message: "No active subscription found" });
    }

    const now = new Date();
    const validSubscription = subscriptions.find(sub => !sub.expiry_date || new Date(sub.expiry_date) > now);

    if (validSubscription) {
      return Response.json({ success: true, has_subscription: true, subscription: validSubscription, message: "Active subscription found" });
    }

    return Response.json({ success: true, has_subscription: false, expired: true, message: "Subscription has expired" });

  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});