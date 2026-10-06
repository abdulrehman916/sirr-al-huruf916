import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access (scheduled task)
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ 
        success: false, 
        message: "Admin access required" 
      }, { status: 403 });
    }

    const now = new Date();
    
    // Find all active subscriptions that have expired
    const subscriptions = await base44.entities.Subscription.filter({
      status: "ACTIVE",
      expiry_date: { $ne: null } // Exclude lifetime subscriptions
    });

    let expiredCount = 0;
    const expiredIds = [];

    for (const sub of subscriptions) {
      const expiryDate = new Date(sub.expiry_date);
      
      if (expiryDate < now) {
        // Mark as expired
        await base44.entities.Subscription.update(sub.id, {
          status: "EXPIRED",
          last_modified_by: "system",
          last_modified_at: now.toISOString()
        });

        // Revoke associated page permissions
        try {
          const perms = await base44.entities.PagePermission.filter({
            user_id: sub.user_id,
            is_active: true,
            is_revoked: false,
          });
          for (const perm of perms) {
            if (perm.expiry_date && new Date(perm.expiry_date) < now) {
              await base44.entities.PagePermission.update(perm.id, {
                is_active: false,
              });
            }
          }
        } catch {}
        
        expiredCount++;
        expiredIds.push(sub.subscription_id);
      }
    }

    console.log(`Expired ${expiredCount} subscriptions`);

    return Response.json({
      success: true,
      message: `Expired ${expiredCount} subscriptions`,
      expired_count: expiredCount,
      expired_ids: expiredIds
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
});