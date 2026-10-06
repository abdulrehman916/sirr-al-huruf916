import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * manageSupportRouting — WhatsApp Admin Selection & Smart Support Routing.
 *
 * Public actions (no auth required):
 *   GET_ACTIVE_ADMINS    — Returns active non-owner admins with WhatsApp numbers
 *   GET_MY_ASSIGNED_ADMIN— Returns the customer's assigned admin (matched by email)
 *   SELF_ASSIGN_ADMIN    — Customer self-selects an admin (sets assigned_admin_id)
 *
 * Admin-only actions (auth required):
 *   GET_SCOPED_TICKETS   — Returns tickets scoped to caller (owner=all, admin=assigned customers only)
 *
 * Security:
 *   - Admin scoping is enforced server-side: non-owner admins only receive their own customers' tickets.
 *   - Disabled admins cannot be self-assigned.
 *   - Does NOT modify: Reading Codes, Redeem logic, Calculations, Device Binding, Payment, Page Access.
 *   - Reuses existing assigned_admin_id field on UserAccessProfile — no duplicate tables.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // Fetch admin profiles (needed for all actions)
    const allAdmins = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
    const adminProfiles = allAdmins || [];

    switch (action) {
      // ── Public: Get active admins for customer selection ──
      case 'GET_ACTIVE_ADMINS': {
        const activeAdmins = adminProfiles.filter(
          (p) => p.status === 'ACTIVE' && !p.is_owner && p.whatsapp_number
        );
        return Response.json({
          success: true,
          admins: activeAdmins.map((a) => ({
            admin_profile_id: a.admin_profile_id,
            full_name: a.full_name,
            whatsapp_number: a.whatsapp_number,
            status: a.status,
            last_login: a.last_login,
          })),
        });
      }

      // ── Public: Get customer's assigned admin ──
      case 'GET_MY_ASSIGNED_ADMIN': {
        const { email } = body;
        if (!email) return Response.json({ success: true, admin: null });

        const allProfiles = await base44.asServiceRole.entities.UserAccessProfile.list(null, 500);
        const profile = (allProfiles || []).find(
          (p) => p.email && p.email.toLowerCase() === email.toLowerCase()
        );

        if (!profile || !profile.assigned_admin_id) {
          return Response.json({ success: true, admin: null });
        }

        const assignedAdmin = adminProfiles.find(
          (p) => p.admin_profile_id === profile.assigned_admin_id
        );

        if (!assignedAdmin) {
          return Response.json({ success: true, admin: null });
        }

        return Response.json({
          success: true,
          admin: {
            admin_profile_id: assignedAdmin.admin_profile_id,
            full_name: assignedAdmin.full_name,
            whatsapp_number: assignedAdmin.whatsapp_number,
            status: assignedAdmin.status,
            is_active: assignedAdmin.status === 'ACTIVE',
          },
        });
      }

      // ── Public: Customer self-assigns an admin ──
      case 'SELF_ASSIGN_ADMIN': {
        const { email, admin_profile_id } = body;
        if (!email || !admin_profile_id) {
          return Response.json(
            { error: 'email and admin_profile_id are required' },
            { status: 400 }
          );
        }

        // Validate target admin
        const targetAdmin = adminProfiles.find(
          (p) => p.admin_profile_id === admin_profile_id
        );
        if (!targetAdmin) {
          return Response.json({ error: 'Admin not found' }, { status: 404 });
        }
        if (targetAdmin.status !== 'ACTIVE') {
          return Response.json(
            { error: 'This admin is currently unavailable' },
            { status: 400 }
          );
        }
        if (targetAdmin.is_owner) {
          return Response.json({ error: 'Cannot select owner' }, { status: 400 });
        }
        if (!targetAdmin.whatsapp_number) {
          return Response.json(
            { error: 'This admin has no WhatsApp number' },
            { status: 400 }
          );
        }

        // Find or create UserAccessProfile
        const allProfiles = await base44.asServiceRole.entities.UserAccessProfile.list(null, 500);
        const existingProfile = (allProfiles || []).find(
          (p) => p.email && p.email.toLowerCase() === email.toLowerCase()
        );

        if (existingProfile) {
          // Already assigned to same admin?
          if (existingProfile.assigned_admin_id === admin_profile_id) {
            return Response.json({
              success: true,
              admin: {
                admin_profile_id: targetAdmin.admin_profile_id,
                full_name: targetAdmin.full_name,
                whatsapp_number: targetAdmin.whatsapp_number,
                status: targetAdmin.status,
                is_active: true,
              },
              already_assigned: true,
            });
          }

          // Update assignment
          await base44.asServiceRole.entities.UserAccessProfile.update(existingProfile.id, {
            assigned_admin_id: admin_profile_id,
          });
        } else {
          // No profile yet — try to find User by email for user_id
          let userId = null;
          try {
            const users = await base44.asServiceRole.entities.User.list(null, 500);
            const platformUser = (users || []).find(
              (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
            );
            userId = platformUser?.id || null;
          } catch {}

          await base44.asServiceRole.entities.UserAccessProfile.create({
            user_id: userId || 'pending-' + Date.now(),
            email: email.toLowerCase(),
            registration_date: new Date().toISOString(),
            account_status: 'ACTIVE',
            assigned_admin_id: admin_profile_id,
          });
        }

        // Log the self-assignment
        try {
          await base44.asServiceRole.entities.AssignmentLog.create({
            log_id:
              'ASG-' +
              Date.now() +
              '-' +
              Math.random().toString(36).substring(2, 6).toUpperCase(),
            customer_id: existingProfile?.user_id || email,
            customer_email: email,
            customer_name: existingProfile?.full_name || email,
            previous_admin_id: existingProfile?.assigned_admin_id || null,
            previous_admin_name: null,
            new_admin_id: admin_profile_id,
            new_admin_name: targetAdmin.full_name || targetAdmin.email,
            action: existingProfile?.assigned_admin_id ? 'REASSIGNED' : 'ASSIGNED',
            performed_by: 'customer-self-assign',
            performed_by_name: email,
            timestamp: new Date().toISOString(),
          });
        } catch {}

        return Response.json({
          success: true,
          admin: {
            admin_profile_id: targetAdmin.admin_profile_id,
            full_name: targetAdmin.full_name,
            whatsapp_number: targetAdmin.whatsapp_number,
            status: targetAdmin.status,
            is_active: true,
          },
          already_assigned: false,
        });
      }

      // ── Admin-only: Get scoped support tickets ──
      case 'GET_SCOPED_TICKETS': {
        let user = null;
        try {
          user = await base44.auth.me();
        } catch {
          return Response.json({ error: 'Authentication required' }, { status: 401 });
        }
        if (!user || user.role !== 'admin') {
          return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Find caller's admin profile
        const myProfile = adminProfiles.find(
          (p) =>
            (p.user_id && p.user_id === user.id) ||
            (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
        );
        const isOwner = myProfile?.is_owner === true;

        const [allTickets, allProfiles] = await Promise.all([
          base44.asServiceRole.entities.SupportTickets.list('-created_at', 500),
          base44.asServiceRole.entities.UserAccessProfile.list(null, 500),
        ]);

        // Build customer email → admin_id mapping for owner filtering
        const customerAdminMap = {};
        (allProfiles || []).forEach((p) => {
          if (p.assigned_admin_id && p.email) {
            customerAdminMap[p.email.toLowerCase()] = p.assigned_admin_id;
          }
        });

        let scopedTickets;
        if (isOwner) {
          // Owner: all tickets
          scopedTickets = allTickets || [];
        } else if (myProfile) {
          // Admin: only tickets from their assigned customers
          const myCustomerEmails = new Set(
            (allProfiles || [])
              .filter((p) => p.assigned_admin_id === myProfile.admin_profile_id)
              .map((p) => (p.email ? p.email.toLowerCase() : ''))
              .filter(Boolean)
          );
          scopedTickets = (allTickets || []).filter((t) =>
            myCustomerEmails.has(t.email ? t.email.toLowerCase() : '')
          );
        } else {
          // No admin profile: no tickets
          scopedTickets = [];
        }

        return Response.json({
          success: true,
          tickets: scopedTickets,
          is_owner: isOwner,
          admin_profiles: isOwner
            ? adminProfiles.filter((p) => !p.is_owner && p.status === 'ACTIVE')
            : [],
          customer_admin_map: customerAdminMap,
        });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});