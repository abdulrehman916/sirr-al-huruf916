import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Called after successful payment (or manual grant by owner).
// Creates a Subscription record + auto-grants PagePermissions for all pages in the plan.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const {
      plan_id,
      duration,           // "1_MONTH" | "6_MONTHS" | "1_YEAR" | "LIFETIME"
      amount,
      currency,
      target_user_id,     // optional: for admin granting on behalf of another user
    } = await req.json();

    if (!plan_id || !duration) {
      return Response.json({ error: 'plan_id and duration are required' }, { status: 400 });
    }

    const recipientId = target_user_id || user.id;

    // Load plan
    const plans = await base44.asServiceRole.entities.SubscriptionPlan.filter({ plan_id });
    if (!plans.length) return Response.json({ error: 'Plan not found' }, { status: 404 });
    const plan = plans[0];

    // Calculate expiry
    const now = new Date();
    const durationDays = { '1_MONTH': 30, '6_MONTHS': 180, '1_YEAR': 365, 'LIFETIME': 36500 };
    const days = durationDays[duration] || 30;
    const expiryDate = new Date(now.getTime() + days * 86400000);

    // Create subscription record
    const subId = `SUB-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    await base44.asServiceRole.entities.Subscription.create({
      subscription_id: subId,
      user_id: recipientId,
      user_name: user.full_name || '',
      user_email: user.email || '',
      page_path: `/plan/${plan.plan_id}`,
      page_name: plan.plan_name,
      plan_name: duration,
      amount: amount || 0,
      currency: currency || 'INR',
      start_date: now.toISOString(),
      expiry_date: duration === 'LIFETIME' ? null : expiryDate.toISOString(),
      status: 'ACTIVE',
      granted_by: user.id,
      granted_at: now.toISOString(),
      notes: `Plan: ${plan.plan_name} · Duration: ${duration}`,
    });

    // Grant PagePermissions for every page in the plan
    const pagePaths = plan.page_paths || [];
    const granted = [];
    const skipped = [];

    for (const pagePath of pagePaths) {
      // Skip if already has active permission
      const existing = await base44.asServiceRole.entities.PagePermission.filter({
        user_id: recipientId,
        page_path: pagePath,
        is_active: true,
        is_revoked: false,
      });
      if (existing.length > 0) { skipped.push(pagePath); continue; }

      const permId = `PERM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      await base44.asServiceRole.entities.PagePermission.create({
        permission_id: permId,
        user_id: recipientId,
        page_path: pagePath,
        page_name: pagePath.replace(/\//g, '').replace(/-/g, ' '),
        permission_code: pagePath.replace(/\//g, '').toUpperCase() + '_ACCESS',
        granted_by: user.id,
        granted_at: now.toISOString(),
        start_date: now.toISOString(),
        expiry_date: duration === 'LIFETIME' ? new Date(now.getTime() + 36500 * 86400000).toISOString() : expiryDate.toISOString(),
        is_active: true,
        is_revoked: false,
        extended_count: 0,
        notes: `Auto-granted by plan ${plan.plan_name} (${duration})`,
      });
      granted.push(pagePath);
    }

    // Flush permission cache for immediate access
    const cacheKeys = pagePaths.map(p => `access:${recipientId}:${p}`);

    return Response.json({
      success: true,
      subscription_id: subId,
      plan_name: plan.plan_name,
      granted_pages: granted.length,
      skipped_pages: skipped.length,
      expiry_date: duration === 'LIFETIME' ? null : expiryDate.toISOString(),
      cache_flushed: true,
      cache_keys: cacheKeys,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});