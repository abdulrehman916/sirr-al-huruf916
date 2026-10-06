import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { user_id } = await req.json();

    if (!user_id) {
      return Response.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user profile
    const profiles = await base44.entities.UserAccessProfile.filter({ user_id: user_id });
    const profile = profiles.length > 0 ? profiles[0] : null;

    // Get all permissions for user
    const allPermissions = await base44.entities.PagePermission.filter({ user_id: user_id });
    
    const now = new Date();
    const activePermissions = allPermissions.filter(p => 
      p.is_active && 
      !p.is_revoked && 
      new Date(p.expiry_date) > now
    );

    const expiredPermissions = allPermissions.filter(p => 
      new Date(p.expiry_date) <= now
    );

    const revokedPermissions = allPermissions.filter(p => p.is_revoked);

    // Get access logs (last 50)
    const accessLogs = await base44.entities.AccessLog.filter({ user_id: user_id }, '-timestamp', 50);

    return Response.json({
      success: true,
      profile: profile,
      permissions: {
        total: allPermissions.length,
        active: activePermissions.length,
        expired: expiredPermissions.length,
        revoked: revokedPermissions.length,
        details: allPermissions
      },
      recent_access_logs: accessLogs
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});