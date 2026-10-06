import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Returns the current user's active subscription plans + page permissions
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [subscriptions, permissions, plans] = await Promise.all([
      base44.entities.Subscription.filter({ user_id: user.id }),
      base44.entities.PagePermission.filter({ user_id: user.id }),
      base44.asServiceRole.entities.SubscriptionPlan.filter({ is_active: true }),
    ]);

    const now = new Date();
    const activeSubs = subscriptions.filter(s =>
      s.status === 'ACTIVE' && (!s.expiry_date || new Date(s.expiry_date) > now)
    );
    const activePerms = permissions.filter(p =>
      p.is_active && !p.is_revoked && (!p.expiry_date || new Date(p.expiry_date) > now)
    );

    return Response.json({
      subscriptions: activeSubs,
      all_subscriptions: subscriptions,
      permissions: activePerms,
      plans,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});