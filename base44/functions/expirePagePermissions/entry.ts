import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled task — must run as admin/service-role
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const now = new Date();
    const activePermissions = await base44.entities.PagePermission.filter({
      is_active: true,
      is_revoked: false
    });

    let expiredCount = 0;
    const expiredIds = [];

    for (const perm of activePermissions) {
      const expiryDate = new Date(perm.expiry_date);
      if (expiryDate < now) {
        await base44.entities.PagePermission.update(perm.id, {
          is_active: false
        });
        expiredCount++;
        expiredIds.push(perm.permission_id);
      }
    }

    // Update active_permissions count for affected users
    const affectedUsers = [...new Set(activePermissions.filter(p => {
      const expiryDate = new Date(p.expiry_date);
      return expiryDate < now;
    }).map(p => p.user_id))];

    for (const userId of affectedUsers) {
      try {
        const profiles = await base44.entities.UserAccessProfile.filter({ user_id: userId });
        if (profiles.length > 0) {
          const activeCount = activePermissions.filter(p => {
            const expiryDate = new Date(p.expiry_date);
            return p.user_id === userId && p.is_active && !p.is_revoked && expiryDate >= now;
          }).length;
          const profile = profiles[0];
          await base44.entities.UserAccessProfile.update(profile.id, {
            active_permissions: activeCount
          });
        }
      } catch {}
    }

    // Audit log
    try {
      await base44.functions.invoke('createAuditLog', {
        action_type: 'PERMISSION_AUTO_EXPIRE',
        target_entity: 'PagePermission',
        target_id: expiredIds.length > 0 ? expiredIds.join(',') : 'none',
        details: JSON.stringify({
          expired_count: expiredCount,
          affected_users: affectedUsers.length,
          expired_ids: expiredIds.slice(0, 50)
        }),
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0] || 'scheduled'
      });
    } catch {}

    return Response.json({
      success: true,
      expired_count: expiredCount,
      expired_ids: expiredIds,
      affected_users: affectedUsers.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});