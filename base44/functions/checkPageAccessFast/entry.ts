import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Consolidated page access check — replaces 5+ sequential client-side calls.
 * Single round-trip returns the complete access decision.
 *
 * Input:  { page_path: string }
 * Output: { granted: boolean, reason?: string, expiry_date?: string, status?: 'granted'|'locked'|'expired'|'revoked'|'denied' }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { page_path } = await req.json();

    if (!page_path) {
      return Response.json({ granted: false, reason: 'page_path required' }, { status: 400 });
    }

    // 1. Check PageVisibilityConfig — public pages bypass auth
    const configs = await base44.entities.PageVisibilityConfig.filter(
      { page_path },
      null, // no sort needed
      1     // limit 1
    );
    if (configs.length > 0 && !configs[0].requires_permission) {
      return Response.json({ granted: true, status: 'granted', source: 'public_config' });
    }

    // 2. Authenticate user
    let user;
    try {
      user = await base44.auth.me();
    } catch {
      return Response.json({ granted: false, reason: 'Authentication required', status: 'denied' });
    }
    if (!user) {
      return Response.json({ granted: false, reason: 'Authentication required', status: 'denied' });
    }

    // 3. Admin/owner bypass
    if (user.role === 'admin') {
      return Response.json({ granted: true, status: 'granted', source: 'admin_bypass' });
    }

    // 4. Profile check: blocked/archived/removed users are denied everything
    const profiles = await base44.asServiceRole.entities.UserAccessProfile.filter(
      { user_id: user.id },
      null,
      1
    );
    if (profiles.length > 0) {
      const status = profiles[0].account_status;
      if (status === 'BLOCKED') {
        return Response.json({ granted: false, reason: 'Account blocked', status: 'blocked' });
      }
      if (status === 'ARCHIVED') {
        return Response.json({ granted: false, reason: 'Account not accessible', status: 'denied' });
      }
      if (status === 'REMOVED') {
        return Response.json({ granted: false, reason: 'Account removed', status: 'denied' });
      }
    }
    if (profiles.length > 0 && profiles[0].lifetime_access) {
      return Response.json({ granted: true, status: 'granted', source: 'lifetime_access' });
    }

    // 5. Subscription-based access
    try {
      const subCheck = await base44.functions.invoke('checkPageSubscription', {
        user_id: user.id,
        page_path,
      });
      // subCheck is the parsed response body (invoke returns response.data directly in Deno)
      const subData = subCheck?.has_subscription !== undefined ? subCheck : (subCheck?.data || subCheck);
      if (subData?.has_subscription) {
        return Response.json({
          granted: true,
          status: 'granted',
          source: 'subscription',
          expiry_date: subData.expiry_date,
        });
      }
    } catch { /* continue */ }

    // 7. Permission-based access (derives code from path)
    const permCode = page_path
      .replace(/^\//, '')
      .replace(/\/$/, '')
      .replace(/[\/\-:]/g, '_')
      .toUpperCase() + '_ACCESS';

    try {
      const permCheck = await base44.functions.invoke('checkPageAccess', {
        page_path,
        permission_code: permCode,
      });
      if (permCheck?.access_granted) {
        return Response.json({
          granted: true,
          status: 'granted',
          source: 'permission',
          expiry_date: permCheck.expiry_date,
        });
      }
      // Map specific denial reasons
      if (permCheck?.reason === 'Permission has expired') {
        return Response.json({ granted: false, reason: 'Permission expired', status: 'expired' });
      }
      if (permCheck?.reason === 'Permission has been revoked') {
        return Response.json({ granted: false, reason: 'Permission revoked', status: 'revoked' });
      }
    } catch { /* continue */ }

    return Response.json({ granted: false, reason: 'Access denied', status: 'locked' });
  } catch (error) {
    return Response.json({ granted: false, reason: error.message, status: 'error' }, { status: 500 });
  }
});