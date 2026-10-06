import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * manageAdminProfile — Server-side RBAC for admin management.
 *
 * Actions:
 *   GET_STATUS        — Bootstrap owner if needed; return is_owner + all profiles (any admin)
 *   BIND_DEVICE       — Admin self-service on login: bind/check device (any admin)
 *   CREATE            — Create AdminProfile + generate invitation code (owner only)
 *   UPDATE            — Update full_name, whatsapp_number (owner only)
 *   UPDATE_PERMISSIONS— Update permission flags (owner only)
 *   DISABLE           — Set status DISABLED (owner only)
 *   ENABLE            — Set status ACTIVE (owner only)
 *   DELETE            — Delete AdminProfile (owner only)
 *   RESET_DEVICE      — Clear device_id (owner only)
 *
 * Security: All actions except GET_STATUS and BIND_DEVICE require caller to be the owner
 * (AdminProfile with is_owner=true). Owner cannot be disabled, deleted, or modified.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // Fetch all admin profiles
    const allProfiles = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
    const profiles = allProfiles || [];

    const ownerProfile = profiles.find((p) => p.is_owner === true);
    const currentProfile = profiles.find(
      (p) =>
        (p.user_id && p.user_id === user.id) ||
        (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
    );

    // ── GET_STATUS: Bootstrap owner if needed, return status ──
    if (action === 'GET_STATUS') {
      if (!ownerProfile) {
        const newOwnerData = {
          admin_profile_id: 'ADM-OWNER-' + Date.now(),
          user_id: user.id,
          full_name: user.full_name || user.email,
          email: user.email,
          whatsapp_number: '',
          status: 'ACTIVE',
          is_owner: true,
          perm_support_messages: true,
          perm_access_requests: true,
          perm_customer_management: true,
          perm_redeem_code_approval: true,
          perm_shop_management: true,
          perm_access_codes: true,
          perm_analytics: true,
          perm_pdf_editor: true,
          perm_holy_names_translator: true,
          perm_feature_pricing: true,
          perm_product_management: true,
          perm_system_settings: true,
          perm_page_permissions: true,
          perm_admin_management: true,
          invitation_code: '',
          invitation_used: true,
          device_id: null,
          assigned_customer_ids: [],
          assigned_customer_count: 0,
          login_count: 0,
          reset_count: 0,
          activity_log: [
            {
              action: 'OWNER_BOOTSTRAPPED',
              timestamp: new Date().toISOString(),
              details: 'Owner profile auto-created on first access',
            },
          ],
        };
        await base44.asServiceRole.entities.AdminProfile.create(newOwnerData);
        const refetched = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
        return Response.json({
          success: true,
          is_owner: true,
          profiles: refetched || [],
        });
      }

      return Response.json({
        success: true,
        is_owner: currentProfile?.is_owner === true,
        profiles: profiles,
      });
    }

    // ── BIND_DEVICE: Admin self-service on login (no owner required) ──
    if (action === 'BIND_DEVICE') {
      const { email, device_id } = body;
      if (!device_id) return Response.json({ error: 'Device ID required' }, { status: 400 });

      const profile = profiles.find(
        (p) => p.email && email && p.email.toLowerCase() === email.toLowerCase()
      );
      if (!profile)
        return Response.json({ error: 'No admin profile found for this email' }, { status: 404 });
      if (profile.status !== 'ACTIVE')
        return Response.json({ error: 'Admin account is disabled' }, { status: 403 });

      // If device already bound, check match
      if (profile.device_id && profile.device_id !== device_id) {
        return Response.json(
          {
            success: false,
            error: 'DEVICE_MISMATCH',
            message:
              'This admin account is bound to another device. Contact the owner to reset the device binding.',
          },
          { status: 403 }
        );
      }

      // Bind device if not yet bound
      if (!profile.device_id) {
        const updated = await base44.asServiceRole.entities.AdminProfile.update(profile.id, {
          device_id: device_id,
          device_bound_at: new Date().toISOString(),
          invitation_used: true,
          user_id: user.id,
          last_login: new Date().toISOString(),
          login_count: (profile.login_count || 0) + 1,
          activity_log: [
            ...(profile.activity_log || []),
            {
              action: 'DEVICE_BOUND',
              timestamp: new Date().toISOString(),
              details: 'Device bound on first login',
            },
          ],
        });
        return Response.json({ success: true, profile: updated, first_login: true });
      }

      // Device matches — update last login
      const updated = await base44.asServiceRole.entities.AdminProfile.update(profile.id, {
        last_login: new Date().toISOString(),
        login_count: (profile.login_count || 0) + 1,
        activity_log: [
          ...(profile.activity_log || []),
          {
            action: 'LOGIN',
            timestamp: new Date().toISOString(),
            details: 'Admin login',
          },
        ],
      });
      return Response.json({ success: true, profile: updated, first_login: false });
    }

    // ── All remaining actions require owner permission ──
    const isOwner = currentProfile?.is_owner === true || !ownerProfile;
    if (!isOwner) {
      return Response.json(
        { error: 'Only the owner can manage admin profiles', is_owner: false },
        { status: 403 }
      );
    }

    // ── Append-only audit log helper (best-effort, never throws) ──
    // Captures the owner's identity, the affected AdminProfile, IP, device, user-agent.
    const audit = async (action_type, action_label, profile, details) => {
      try {
        const ip =
          req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
          req.headers.get('x-real-ip') ||
          '';
        await base44.asServiceRole.entities.OwnerAuditLog.create({
          log_id:
            'OAL-' +
            Date.now().toString(36).toUpperCase() +
            '-' +
            Math.random().toString(36).substring(2, 8).toUpperCase(),
          action_type,
          action_label,
          performed_by_id: user.id,
          performed_by_email: user.email || '',
          performed_by_name: user.full_name || user.email || '',
          performed_by_role: 'owner',
          object_type: 'AdminProfile',
          object_id: profile?.admin_profile_id || profile?.email || '',
          object_label: profile?.email || profile?.full_name || '',
          details: details ? JSON.stringify(details) : '',
          device_id: profile?.device_id || '',
          ip_address: ip,
          user_agent: req.headers.get('user-agent') || '',
          timestamp: new Date().toISOString(),
        });
      } catch {
        // Audit logging must never break the primary action.
      }
    };

    switch (action) {
      case 'CREATE': {
        const { email, full_name, whatsapp_number, permissions } = body;
        if (!email) return Response.json({ error: 'Email is required' }, { status: 400 });

        const existing = profiles.find(
          (p) => p.email && p.email.toLowerCase() === email.toLowerCase()
        );
        if (existing)
          return Response.json({ error: 'Admin with this email already exists' }, { status: 400 });

        const invitationCode =
          'ADM-' +
          Math.random().toString(36).substring(2, 8).toUpperCase() +
          '-' +
          Date.now().toString(36).toUpperCase();

        const profile = await base44.asServiceRole.entities.AdminProfile.create({
          admin_profile_id: 'ADM-' + Date.now(),
          user_id: null,
          full_name: full_name || '',
          email: email.toLowerCase(),
          whatsapp_number: whatsapp_number || '',
          status: 'ACTIVE',
          is_owner: false,
          perm_support_messages: permissions?.support_messages || false,
          perm_access_requests: permissions?.access_requests || false,
          perm_customer_management: permissions?.customer_management || false,
          perm_redeem_code_approval: permissions?.redeem_code_approval || false,
          perm_shop_management: permissions?.shop_management || false,
          perm_access_codes: permissions?.access_codes || false,
          perm_analytics: permissions?.analytics || false,
          perm_pdf_editor: permissions?.pdf_editor || false,
          perm_holy_names_translator: permissions?.holy_names_translator || false,
          perm_feature_pricing: permissions?.feature_pricing || false,
          perm_product_management: permissions?.product_management || false,
          perm_system_settings: permissions?.system_settings || false,
          perm_page_permissions: permissions?.page_permissions || false,
          perm_admin_management: permissions?.admin_management || false,
          invitation_code: invitationCode,
          invitation_used: false,
          device_id: null,
          assigned_customer_ids: [],
          assigned_customer_count: 0,
          login_count: 0,
          reset_count: 0,
          activity_log: [
            {
              action: 'CREATED',
              timestamp: new Date().toISOString(),
              details: 'Admin profile created by owner',
            },
          ],
        });

        return Response.json({ success: true, profile, invitation_code: invitationCode });
      }

      case 'UPDATE': {
        const { admin_profile_id, full_name, whatsapp_number } = body;
        const profile = profiles.find((p) => p.admin_profile_id === admin_profile_id);
        if (!profile) return Response.json({ error: 'Admin not found' }, { status: 404 });
        if (profile.is_owner)
          return Response.json({ error: 'Cannot modify owner profile' }, { status: 403 });

        const updated = await base44.asServiceRole.entities.AdminProfile.update(profile.id, {
          full_name: full_name !== undefined ? full_name : profile.full_name,
          whatsapp_number:
            whatsapp_number !== undefined ? whatsapp_number : profile.whatsapp_number,
          activity_log: [
            ...(profile.activity_log || []),
            {
              action: 'UPDATED',
              timestamp: new Date().toISOString(),
              details: 'Profile updated by owner',
            },
          ],
        });

        return Response.json({ success: true, profile: updated });
      }

      case 'UPDATE_PERMISSIONS': {
        const { admin_profile_id, permissions } = body;
        const profile = profiles.find((p) => p.admin_profile_id === admin_profile_id);
        if (!profile) return Response.json({ error: 'Admin not found' }, { status: 404 });
        if (profile.is_owner)
          return Response.json({ error: 'Cannot modify owner permissions' }, { status: 403 });

        const updated = await base44.asServiceRole.entities.AdminProfile.update(profile.id, {
          perm_support_messages: permissions?.support_messages || false,
          perm_access_requests: permissions?.access_requests || false,
          perm_customer_management: permissions?.customer_management || false,
          perm_redeem_code_approval: permissions?.redeem_code_approval || false,
          perm_shop_management: permissions?.shop_management || false,
          perm_access_codes: permissions?.access_codes || false,
          perm_analytics: permissions?.analytics || false,
          perm_pdf_editor: permissions?.pdf_editor || false,
          perm_holy_names_translator: permissions?.holy_names_translator || false,
          perm_feature_pricing: permissions?.feature_pricing || false,
          perm_product_management: permissions?.product_management || false,
          perm_system_settings: permissions?.system_settings || false,
          perm_page_permissions: permissions?.page_permissions || false,
          perm_admin_management: permissions?.admin_management || false,
          activity_log: [
            ...(profile.activity_log || []),
            {
              action: 'PERMISSIONS_UPDATED',
              timestamp: new Date().toISOString(),
              details: JSON.stringify(permissions),
            },
          ],
        });

        await audit('PERMISSION_CHANGED', 'Permissions updated for ' + (profile.email || ''), updated, { permissions });
        return Response.json({ success: true, profile: updated });
      }

      case 'DISABLE': {
        const { admin_profile_id } = body;
        const profile = profiles.find((p) => p.admin_profile_id === admin_profile_id);
        if (!profile) return Response.json({ error: 'Admin not found' }, { status: 404 });
        if (profile.is_owner)
          return Response.json({ error: 'Cannot disable owner' }, { status: 403 });

        const updated = await base44.asServiceRole.entities.AdminProfile.update(profile.id, {
          status: 'DISABLED',
          disabled_at: new Date().toISOString(),
          disabled_by: user.id,
          activity_log: [
            ...(profile.activity_log || []),
            {
              action: 'DISABLED',
              timestamp: new Date().toISOString(),
              details: 'Disabled by owner',
            },
          ],
        });

        await audit('ADMIN_DISABLED', 'Admin disabled: ' + (profile.email || ''), updated);
        return Response.json({ success: true, profile: updated });
      }

      case 'ENABLE': {
        const { admin_profile_id } = body;
        const profile = profiles.find((p) => p.admin_profile_id === admin_profile_id);
        if (!profile) return Response.json({ error: 'Admin not found' }, { status: 404 });

        const updated = await base44.asServiceRole.entities.AdminProfile.update(profile.id, {
          status: 'ACTIVE',
          disabled_at: null,
          disabled_by: null,
          activity_log: [
            ...(profile.activity_log || []),
            {
              action: 'ENABLED',
              timestamp: new Date().toISOString(),
              details: 'Enabled by owner',
            },
          ],
        });

        await audit('ADMIN_ENABLED', 'Admin enabled: ' + (profile.email || ''), updated);
        return Response.json({ success: true, profile: updated });
      }

      case 'DELETE': {
        const { admin_profile_id } = body;
        const profile = profiles.find((p) => p.admin_profile_id === admin_profile_id);
        if (!profile) return Response.json({ error: 'Admin not found' }, { status: 404 });
        if (profile.is_owner)
          return Response.json({ error: 'Cannot delete owner' }, { status: 403 });

        await base44.asServiceRole.entities.AdminProfile.delete(profile.id);
        await audit('ADMIN_REMOVED', 'Admin removed: ' + (profile.email || ''), profile);
        return Response.json({ success: true });
      }

      case 'RESET_DEVICE': {
        const { admin_profile_id } = body;
        const profile = profiles.find((p) => p.admin_profile_id === admin_profile_id);
        if (!profile) return Response.json({ error: 'Admin not found' }, { status: 404 });
        if (profile.is_owner)
          return Response.json({ error: 'Cannot reset owner device' }, { status: 403 });

        const updated = await base44.asServiceRole.entities.AdminProfile.update(profile.id, {
          device_id: null,
          device_bound_at: null,
          reset_count: (profile.reset_count || 0) + 1,
          activity_log: [
            ...(profile.activity_log || []),
            {
              action: 'DEVICE_RESET',
              timestamp: new Date().toISOString(),
              details: 'Device binding reset by owner',
            },
          ],
        });

        await audit('ADMIN_DEVICE_RESET', 'Device reset for ' + (profile.email || ''), updated);
        return Response.json({ success: true, profile: updated });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});