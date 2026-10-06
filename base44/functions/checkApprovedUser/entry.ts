import { createClientFromRequest } from 'npm:@base44/sdk@0.8.32';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { email } = await req.json();

    if (!email || !email.trim()) {
      return Response.json({ 
        success: false, 
        approved: false,
        error: 'Email is required' 
      }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user is in approved list
    const approvedUser = await base44.entities.ApprovedUser.filter({ email: normalizedEmail });
    
    if (!approvedUser || approvedUser.length === 0) {
      return Response.json({
        success: true,
        approved: false,
        message: 'User not in approved list'
      });
    }

    const userRecord = approvedUser[0];

    // Check status
    if (userRecord.status === 'BLOCKED' || userRecord.status === 'REMOVED') {
      return Response.json({
        success: true,
        approved: false,
        status: userRecord.status,
        message: `Access denied - Account ${userRecord.status.toLowerCase()}`,
        revoke_reason: userRecord.revoke_reason
      });
    }

    if (userRecord.status !== 'ACTIVE') {
      return Response.json({
        success: true,
        approved: false,
        message: 'Invalid user status'
      });
    }

    // Update login stats
    const now = new Date().toISOString();
    await base44.entities.ApprovedUser.update(userRecord.id, {
      last_login: now,
      login_count: (userRecord.login_count || 0) + 1
    });

    return Response.json({
      success: true,
      approved: true,
      status: 'ACTIVE',
      message: 'Access granted',
      user: {
        email: userRecord.email,
        full_name: userRecord.full_name,
        last_login: now,
        login_count: (userRecord.login_count || 0) + 1
      }
    });
  } catch (error) {
    return Response.json({ 
      success: false,
      approved: false,
      error: error.message 
    }, { status: 500 });
  }
});