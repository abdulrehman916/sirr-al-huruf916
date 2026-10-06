import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { page_path, permission_code } = await req.json();

    if (!page_path || !permission_code) {
      return Response.json({ error: 'Page path and permission code required' }, { status: 400 });
    }

    // Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const now = new Date();

    // Lifetime access bypass
    try {
      const profiles = await base44.entities.UserAccessProfile.filter({ user_id: user.id });
      if (profiles.length > 0 && profiles[0].lifetime_access) {
        return Response.json({
          success: true,
          access_granted: true,
          reason: 'Lifetime access',
          expiry_date: null
        });
      }
    } catch {}

    // Check for valid permission
    const permissions = await base44.entities.PagePermission.filter({
      user_id: user.id,
      page_path: page_path,
      permission_code: permission_code,
      is_active: true,
      is_revoked: false
    });

    if (permissions.length === 0) {
      // Log denied access
      await base44.entities.AccessLog.create({
        log_id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        user_id: user.id,
        page_path: page_path,
        permission_code: permission_code,
        access_result: 'NOT_FOUND',
        timestamp: now.toISOString()
      });

      return Response.json({ 
        success: false,
        access_granted: false,
        reason: 'No valid permission found'
      }, { status: 403 });
    }

    const permission = permissions[0];

    // Check expiry — null/empty expiry_date means Lifetime: never expires
    if (permission.expiry_date && new Date(permission.expiry_date) < now) {
      await base44.entities.AccessLog.create({
        log_id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        user_id: user.id,
        page_path: page_path,
        permission_code: permission_code,
        access_result: 'EXPIRED',
        timestamp: now.toISOString()
      });

      return Response.json({ 
        success: false,
        access_granted: false,
        reason: 'Permission has expired',
        expiry_date: permission.expiry_date
      }, { status: 403 });
    }

    // Access granted
    await base44.entities.AccessLog.create({
      log_id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      user_id: user.id,
      page_path: page_path,
      permission_code: permission_code,
      access_result: 'GRANTED',
      timestamp: now.toISOString()
    });

    return Response.json({ 
      success: true,
      access_granted: true,
      permission_id: permission.permission_id,
      expiry_date: permission.expiry_date
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});