import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { mobile, email } = await req.json();

    if (!mobile && !email) {
      return Response.json({ error: 'Mobile or email required' }, { status: 400 });
    }

    // Get current user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const now = new Date();

    // Check if profile already exists
    const existingProfiles = await base44.entities.UserAccessProfile.filter({ user_id: user.id });
    if (existingProfiles.length > 0) {
      return Response.json({ 
        success: true,
        message: 'Profile already exists',
        profile_id: existingProfiles[0].id
      });
    }

    // Create access profile
    const profile = await base44.entities.UserAccessProfile.create({
      user_id: user.id,
      mobile: mobile || '',
      email: email || '',
      mobile_verified: false,
      email_verified: false,
      registration_date: now.toISOString(),
      last_login: now.toISOString(),
      account_status: 'ACTIVE',
      total_permissions: 0,
      active_permissions: 0
    });

    return Response.json({
      success: true,
      profile_id: profile.id,
      message: 'Access profile created successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});