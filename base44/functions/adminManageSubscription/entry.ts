import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Admin-only: refund, cancel, or extend a subscription
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ success: false, message: "Admin access required" }, { status: 403 });
    }

    const { 
      subscription_id,
      action,        // "cancel" | "extend"
      extend_days
    } = await req.json();

    if (!subscription_id || !action) {
      return Response.json({ success: false, message: "subscription_id and action required" }, { status: 400 });
    }

    // Find subscription
    const subs = await base44.asServiceRole.entities.Subscription.filter({ subscription_id });
    if (subs.length === 0) {
      return Response.json({ success: false, message: "Subscription not found" }, { status: 404 });
    }
    const sub = subs[0];

    const now = new Date().toISOString();

    if (action === 'cancel') {
      await base44.asServiceRole.entities.Subscription.update(sub.id, {
        status: 'CANCELLED',
        last_modified_by: user.id,
        last_modified_at: now,
        notes: (sub.notes || '') + `\n[ ${now} ] Cancelled by ${user.email}`
      });

      // Revoke all associated page permissions
      const perms = await base44.asServiceRole.entities.PagePermission.filter({
        user_id: sub.user_id,
        page_path: sub.page_path,
        is_active: true
      });

      for (const perm of perms) {
        await base44.asServiceRole.entities.PagePermission.update(perm.id, {
          is_active: false,
          is_revoked: true,
          revoked_by: user.id,
          revoked_at: now,
          revoked_reason: 'Subscription cancelled'
        });
      }

      return Response.json({ success: true, message: 'Subscription cancelled', status: 'CANCELLED' });
    }

    if (action === 'extend') {
      if (!extend_days || extend_days <= 0) {
        return Response.json({ success: false, message: "Valid extend_days required" }, { status: 400 });
      }

      const currentExpiry = sub.expiry_date ? new Date(sub.expiry_date) : new Date();
      const newExpiry = new Date(currentExpiry.getTime() + extend_days * 86400000);

      await base44.asServiceRole.entities.Subscription.update(sub.id, {
        expiry_date: newExpiry.toISOString(),
        last_modified_by: user.id,
        last_modified_at: now,
        notes: (sub.notes || '') + `\n[ ${now} ] Extended by ${extend_days} days by ${user.email}. New expiry: ${newExpiry.toISOString()}`
      });

      // Also extend associated page permissions
      const perms = await base44.asServiceRole.entities.PagePermission.filter({
        user_id: sub.user_id,
        page_path: sub.page_path,
        is_active: true
      });

      for (const perm of perms) {
        const permNewExpiry = perm.expiry_date ? new Date(perm.expiry_date) : new Date();
        const permExtendedExpiry = new Date(permNewExpiry.getTime() + extend_days * 86400000);
        
        await base44.asServiceRole.entities.PagePermission.update(perm.id, {
          expiry_date: permExtendedExpiry.toISOString(),
          extended_count: (perm.extended_count || 0) + 1,
          last_extended_at: now,
          last_extended_by: user.id
        });
      }

      return Response.json({ 
        success: true, 
        message: `Extended by ${extend_days} days`, 
        new_expiry: newExpiry.toISOString() 
      });
    }

    return Response.json({ success: false, message: "Invalid action" }, { status: 400 });

  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 });
  }
});