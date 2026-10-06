import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, mobile, device_type, country } = await req.json();

    const contact = email || mobile;
    if (!contact) {
      return Response.json({ success: false, message: 'Email or mobile required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null;

    // Detect device from User-Agent
    const ua = (req.headers.get('user-agent') || '').toLowerCase();
    const detectedDevice = device_type || (
      ua.includes('mobi') || ua.includes('android') ? 'mobile' :
      ua.includes('tablet') || ua.includes('ipad') ? 'tablet' : 'desktop'
    );

    // Look up platform user
    let platformUser = null;
    if (email) {
      const matches = await base44.asServiceRole.entities.User.filter({ email });
      platformUser = matches.length > 0 ? matches[0] : null;
    }
    if (!platformUser && mobile) {
      const profiles = await base44.asServiceRole.entities.UserAccessProfile.filter({ mobile });
      if (profiles.length > 0) {
        const userId = profiles[0].user_id;
        if (userId && userId !== 'pending') {
          try {
            const users = await base44.asServiceRole.entities.User.list();
            platformUser = users.find(u => u.id === userId) || null;
          } catch {}
        }
      }
    }

    if (!platformUser) {
      return Response.json({ success: false, message: 'No platform account found for ' + contact }, { status: 404 });
    }

    const userId = platformUser.id;
    const fullName = platformUser.full_name || '';
    const role = platformUser.role || 'user';

    // Upsert profile
    const existingByUserId = await base44.asServiceRole.entities.UserAccessProfile.filter({ user_id: userId });
    if (existingByUserId.length > 0) {
      const prof = existingByUserId[0];
      await base44.asServiceRole.entities.UserAccessProfile.update(prof.id, {
        full_name: fullName || prof.full_name || '',
        role,
        last_login: now,
        device_type: detectedDevice,
        country: country || prof.country || '',
        mobile: mobile || prof.mobile || '',
        email: email || prof.email || '',
        mobile_verified: mobile ? true : prof.mobile_verified,
        email_verified: email ? true : prof.email_verified,
        account_status: 'ACTIVE'
      });
      await recalcPermissionCounts(base44, userId, prof.id);
      return Response.json({ success: true, profile_id: prof.id, user_id: userId, message: 'Profile updated' });
    }

    // Check by contact
    let existingByContact = [];
    if (email) existingByContact = await base44.asServiceRole.entities.UserAccessProfile.filter({ email });
    if (existingByContact.length === 0 && mobile) existingByContact = await base44.asServiceRole.entities.UserAccessProfile.filter({ mobile });

    if (existingByContact.length > 0) {
      const prof = existingByContact[0];
      await base44.asServiceRole.entities.UserAccessProfile.update(prof.id, {
        user_id: userId,
        full_name: fullName,
        role,
        last_login: now,
        device_type: detectedDevice,
        country: country || '',
        mobile: mobile || prof.mobile || '',
        email: email || prof.email || '',
        mobile_verified: mobile ? true : prof.mobile_verified,
        email_verified: email ? true : prof.email_verified,
        account_status: 'ACTIVE'
      });
      await recalcPermissionCounts(base44, userId, prof.id);
      return Response.json({ success: true, profile_id: prof.id, user_id: userId, message: 'Profile linked' });
    }

    // Create new profile
    const newProfile = await base44.asServiceRole.entities.UserAccessProfile.create({
      user_id: userId,
      full_name: fullName,
      mobile: mobile || '',
      email: email || contact,
      mobile_verified: !!mobile,
      email_verified: !!email,
      role,
      registration_date: now,
      last_login: now,
      account_status: 'ACTIVE',
      subscription_plan: 'NONE',
      lifetime_access: false,
      total_permissions: 0,
      active_permissions: 0,
      device_type: detectedDevice,
      country: country || ''
    });

    try {
      await base44.functions.invoke('createAuditLog', {
        action_type: 'USER_ONBOARDED',
        target_user_id: userId,
        target_entity: 'UserAccessProfile',
        target_id: newProfile.id,
        details: JSON.stringify({ email, mobile, full_name: fullName, role, device: detectedDevice, country }),
        ip_address: ip
      });
    } catch {}

    return Response.json({ success: true, profile_id: newProfile.id, user_id: userId, message: 'Onboarding complete' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function recalcPermissionCounts(base44, userId, profileId) {
  try {
    const perms = await base44.asServiceRole.entities.PagePermission.filter({ user_id: userId });
    const active = perms.filter(p => p.is_active && !p.is_revoked && new Date(p.expiry_date) > new Date());
    await base44.asServiceRole.entities.UserAccessProfile.update(profileId, {
      total_permissions: perms.length,
      active_permissions: active.length
    });
  } catch {}
}