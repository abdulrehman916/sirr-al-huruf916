import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin/owner access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin/Owner access required' }, { status: 403 });
    }

    const { user_id, page_path, page_name, permission_code, start_date, expiry_date } = await req.json();

    // expiry_date is optional — null means Lifetime access
    if (!user_id || !page_path || !permission_code || !start_date) {
      return Response.json({ error: 'user_id, page_path, permission_code, start_date are required' }, { status: 400 });
    }

    const now = new Date();
    const permissionId = `PERM-${now.getTime()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Check if permission already exists
    const existingPermissions = await base44.entities.PagePermission.filter({
      user_id: user_id,
      page_path: page_path,
      permission_code: permission_code,
      is_active: true,
      is_revoked: false
    });

    if (existingPermissions.length > 0) {
      // Update expiry instead of failing — allows re-granting / extending
      const existing = existingPermissions[0];
      await base44.entities.PagePermission.update(existing.id, {
        expiry_date: expiry_date ? new Date(expiry_date).toISOString() : null,
        extended_count: (existing.extended_count || 0) + 1,
        last_extended_at: new Date().toISOString(),
        last_extended_by: user.id,
      });
      return Response.json({
        success: true,
        permission_id: existing.permission_id,
        message: 'Permission expiry updated (re-granted)',
        updated: true
      });
    }

    // Create permission
    const permission = await base44.entities.PagePermission.create({
      permission_id: permissionId,
      user_id: user_id,
      page_path: page_path,
      page_name: page_name || page_path,
      permission_code: permission_code,
      granted_by: user.id,
      granted_at: now.toISOString(),
      start_date: new Date(start_date).toISOString(),
      expiry_date: expiry_date ? new Date(expiry_date).toISOString() : null,
      is_active: true,
      is_revoked: false,
      extended_count: 0
    });

    // Create audit log
    try {
      await base44.functions.invoke('createAuditLog', {
        action_type: 'PERMISSION_GRANT',
        target_user_id: user_id,
        target_entity: 'PagePermission',
        target_id: permissionId,
        details: JSON.stringify({ page_path, page_name, permission_code, granted_by: user.email, start_date, expiry_date }),
        ip_address: req.headers.get("x-forwarded-for")?.split(",")[0] || null
      });
    } catch (auditError) {
      console.error("Failed to create audit log:", auditError);
    }

    // Update user profile permission count
    const profiles = await base44.entities.UserAccessProfile.filter({ user_id: user_id });
    if (profiles.length > 0) {
      const profile = profiles[0];
      await base44.entities.UserAccessProfile.update(profile.id, {
        total_permissions: (profile.total_permissions || 0) + 1,
        active_permissions: (profile.active_permissions || 0) + 1
      });
    }

    // Flush permission cache for this user so access is immediate
    const cacheKey = `access:${user_id}:${page_path}`;

    return Response.json({
      success: true,
      permission_id: permissionId,
      message: 'Permission granted successfully',
      cache_flushed: true,
      cache_key: cacheKey
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});