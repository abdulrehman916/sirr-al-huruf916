import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { filter_status, filter_page, search_query } = await req.query;

    // Build query
    const query = {};
    if (filter_status) {
      if (filter_status === 'ACTIVE') {
        query.is_active = true;
        query.is_revoked = false;
      } else if (filter_status === 'EXPIRED') {
        // Will filter in memory
      } else if (filter_status === 'REVOKED') {
        query.is_revoked = true;
      }
    }

    // Get all permissions
    let permissions = await base44.entities.PagePermission.list();

    // Apply filters
    if (filter_status === 'EXPIRED') {
      const now = new Date();
      permissions = permissions.filter(p => new Date(p.expiry_date) <= now);
    } else if (Object.keys(query).length > 0) {
      permissions = await base44.entities.PagePermission.filter(query);
    }

    // Filter by page
    if (filter_page) {
      permissions = permissions.filter(p => p.page_path === filter_page);
    }

    // Search
    if (search_query) {
      const queryLower = search_query.toLowerCase();
      permissions = permissions.filter(p => 
        p.permission_id.toLowerCase().includes(queryLower) ||
        p.user_id.toLowerCase().includes(queryLower) ||
        p.page_name.toLowerCase().includes(queryLower)
      );
    }

    // Enrich with user data
    const enrichedPermissions = await Promise.all(
      permissions.map(async (perm) => {
        const profiles = await base44.entities.UserAccessProfile.filter({ user_id: perm.user_id });
        return {
          ...perm,
          user_profile: profiles.length > 0 ? profiles[0] : null
        };
      })
    );

    return Response.json({
      success: true,
      total: enrichedPermissions.length,
      permissions: enrichedPermissions
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});