import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const { user_id, status, revoke_reason } = await req.json();

    if (!user_id) {
      return Response.json({ 
        success: false, 
        error: 'User ID is required' 
      }, { status: 400 });
    }

    if (!['ACTIVE', 'BLOCKED', 'REMOVED'].includes(status)) {
      return Response.json({ 
        success: false, 
        error: 'Invalid status' 
      }, { status: 400 });
    }

    // Get current user record
    const approvedUser = await base44.entities.ApprovedUser.get(user_id);
    if (!approvedUser) {
      return Response.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }

    const updateData = {
      status: status,
      revoked_at: (status === 'BLOCKED' || status === 'REMOVED') ? new Date().toISOString() : null,
      revoked_by: (status === 'BLOCKED' || status === 'REMOVED') ? user.id : null,
      revoke_reason: (status === 'BLOCKED' || status === 'REMOVED') ? (revoke_reason || '') : null
    };

    // Clear revocation fields if reactivating
    if (status === 'ACTIVE') {
      updateData.revoked_at = null;
      updateData.revoked_by = null;
      updateData.revoke_reason = null;
    }

    const updated = await base44.entities.ApprovedUser.update(user_id, updateData);

    return Response.json({
      success: true,
      message: `User status updated to ${status}`,
      user: updated
    });
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});