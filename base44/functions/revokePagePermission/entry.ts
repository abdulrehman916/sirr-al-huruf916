import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin/owner access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin/Owner access required' }, { status: 403 });
    }

    const { permission_id, reason } = await req.json();

    if (!permission_id) {
      return Response.json({ error: 'Permission ID required' }, { status: 400 });
    }

    const now = new Date();

    // Find permission
    const permissions = await base44.entities.PagePermission.filter({ permission_id: permission_id });
    if (permissions.length === 0) {
      return Response.json({ error: 'Permission not found' }, { status: 404 });
    }

    const permission = permissions[0];

    // Revoke permission
    await base44.entities.PagePermission.update(permission.id, {
      is_revoked: true,
      revoked_by: user.id,
      revoked_at: now.toISOString(),
      revoked_reason: reason || 'No reason provided',
      is_active: false
    });

    // Create audit log
    try {
      await base44.functions.invoke('createAuditLog', {
        action_type: 'PERMISSION_REVOKE',
        target_user_id: permission.user_id,
        target_entity: 'PagePermission',
        target_id: permission.permission_id,
        details: JSON.stringify({ page_path: permission.page_path, revoked_by: user.email, reason: reason || 'No reason provided' }),
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || null
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
    }

    // Update user profile — recompute BOTH counters from actual records so
    // total_permissions and active_permissions stay fully synchronized
    // (self-heals any prior drift from increment/decrement arithmetic) and
    // never go negative. total_permissions = non-revoked records;
    // active_permissions = records still marked active.
    const allUserPerms = await base44.entities.PagePermission.filter({ user_id: permission.user_id }, '-created_date', 500);
    const nonRevokedCount = allUserPerms.filter(p => p.is_revoked !== true).length;
    const activeCount = allUserPerms.filter(p => p.is_active === true && p.is_revoked !== true).length;
    const profiles = await base44.entities.UserAccessProfile.filter({ user_id: permission.user_id });
    if (profiles.length > 0) {
      const profile = profiles[0];
      await base44.entities.UserAccessProfile.update(profile.id, {
        total_permissions: Math.max(0, nonRevokedCount),
        active_permissions: Math.max(0, activeCount)
      });
    }

    return Response.json({
      success: true,
      message: 'Permission revoked successfully',
      permission_id: permission_id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});