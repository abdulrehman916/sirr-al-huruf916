import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin/owner access
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin/Owner access required' }, { status: 403 });
    }

    const { permission_id, new_expiry_date, extended_by } = await req.json();

    if (!permission_id || !new_expiry_date) {
      return Response.json({ error: 'Permission ID and new expiry date required' }, { status: 400 });
    }

    const now = new Date();
    const newExpiry = new Date(new_expiry_date);

    // Find permission
    const permissions = await base44.entities.PagePermission.filter({ permission_id: permission_id });
    if (permissions.length === 0) {
      return Response.json({ error: 'Permission not found' }, { status: 404 });
    }

    const permission = permissions[0];

    // Check if already revoked
    if (permission.is_revoked) {
      return Response.json({ error: 'Cannot extend revoked permission' }, { status: 400 });
    }

    // Extend expiry
    await base44.entities.PagePermission.update(permission.id, {
      expiry_date: newExpiry.toISOString(),
      extended_count: (permission.extended_count || 0) + 1,
      last_extended_at: now.toISOString(),
      last_extended_by: extended_by || user.id,
      is_active: true // Reactivate if expired
    });

    return Response.json({
      success: true,
      message: 'Permission expiry extended',
      old_expiry: permission.expiry_date,
      new_expiry: newExpiry.toISOString(),
      extended_count: (permission.extended_count || 0) + 1
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});