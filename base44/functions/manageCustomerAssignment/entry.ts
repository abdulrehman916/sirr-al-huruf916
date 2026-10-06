import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * manageCustomerAssignment — Server-side RBAC for customer-to-admin assignment.
 *
 * Actions:
 *   GET_STATS  — Return assignment statistics (owner only)
 *   ASSIGN     — Assign/reassign customer to an admin (owner only)
 *   REMOVE     — Remove customer's admin assignment (owner only)
 *   GET_LOGS   — List recent assignment logs (owner only)
 *
 * Security: All actions require caller to be the owner (AdminProfile.is_owner=true).
 * Server-side enforcement on every database action — no client-only checks.
 * Does NOT modify: Reading Codes, Page Access, Pricing, Support, Calculations, Device Binding.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const { action } = body;

    // Fetch admin profiles to verify owner status
    const allAdmins = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
    const adminProfiles = allAdmins || [];

    const currentAdminProfile = adminProfiles.find(
      (p) =>
        (p.user_id && p.user_id === user.id) ||
        (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
    );

    const isOwner = currentAdminProfile?.is_owner === true;

    // All actions require owner permission
    if (!isOwner) {
      return Response.json(
        { error: 'Only the owner can manage customer assignments' },
        { status: 403 }
      );
    }

    switch (action) {
      case 'GET_STATS': {
        const [profiles, approvedUsers] = await Promise.all([
          base44.asServiceRole.entities.UserAccessProfile.list(null, 500),
          base44.asServiceRole.entities.ApprovedUser.list(null, 500),
        ]);

        const allProfiles = profiles || [];
        const allApproved = approvedUsers || [];

        const assigned = allProfiles.filter(
          (p) => p.assigned_admin_id && p.assigned_admin_id !== ''
        );
        const activeAssigned = assigned.filter((p) => p.account_status === 'ACTIVE');
        const pendingCount = Math.max(0, allApproved.length - assigned.length);

        // Per-admin breakdown
        const perAdmin = {};
        adminProfiles.forEach((admin) => {
          const adminCustomers = assigned.filter(
            (p) => p.assigned_admin_id === admin.admin_profile_id
          );
          perAdmin[admin.admin_profile_id] = {
            total: adminCustomers.length,
            active: adminCustomers.filter((p) => p.account_status === 'ACTIVE').length,
          };
        });

        return Response.json({
          success: true,
          stats: {
            assigned: assigned.length,
            active_assigned: activeAssigned.length,
            pending: pendingCount,
            total_customers: allApproved.length,
            per_admin: perAdmin,
          },
        });
      }

      case 'ASSIGN': {
        const { customer_email, admin_profile_id } = body;
        if (!customer_email || !admin_profile_id) {
          return Response.json(
            { error: 'customer_email and admin_profile_id are required' },
            { status: 400 }
          );
        }

        // Verify target admin exists and is active
        const targetAdmin = adminProfiles.find(
          (p) => p.admin_profile_id === admin_profile_id
        );
        if (!targetAdmin) {
          return Response.json({ error: 'Admin not found' }, { status: 404 });
        }
        if (targetAdmin.status !== 'ACTIVE') {
          return Response.json({ error: 'Target admin is disabled' }, { status: 400 });
        }

        // Find UserAccessProfile by email
        const allProfiles = await base44.asServiceRole.entities.UserAccessProfile.list(null, 500);
        const existingProfile = (allProfiles || []).find(
          (p) => p.email && p.email.toLowerCase() === customer_email.toLowerCase()
        );

        let previousAdminId = null;
        let previousAdminName = null;
        let assignmentAction = 'ASSIGNED';

        if (existingProfile) {
          // Already assigned to same admin?
          if (existingProfile.assigned_admin_id === admin_profile_id) {
            return Response.json(
              { error: 'Customer already assigned to this admin' },
              { status: 400 }
            );
          }

          // Track previous admin for log
          if (existingProfile.assigned_admin_id) {
            const prevAdmin = adminProfiles.find(
              (p) => p.admin_profile_id === existingProfile.assigned_admin_id
            );
            previousAdminId = existingProfile.assigned_admin_id;
            previousAdminName = prevAdmin?.full_name || prevAdmin?.email || 'Unknown';
            assignmentAction = 'REASSIGNED';
          }

          // Update assignment
          await base44.asServiceRole.entities.UserAccessProfile.update(existingProfile.id, {
            assigned_admin_id: admin_profile_id,
          });
        } else {
          // No UserAccessProfile yet — try to find User by email for user_id
          let userId = null;
          try {
            const users = await base44.asServiceRole.entities.User.list(null, 500);
            const platformUser = (users || []).find(
              (u) => u.email && u.email.toLowerCase() === customer_email.toLowerCase()
            );
            userId = platformUser?.id || null;
          } catch {}

          // Create minimal profile with assignment
          await base44.asServiceRole.entities.UserAccessProfile.create({
            user_id: userId || 'pending-' + Date.now(),
            email: customer_email.toLowerCase(),
            registration_date: new Date().toISOString(),
            account_status: 'ACTIVE',
            assigned_admin_id: admin_profile_id,
          });
        }

        // Create assignment log
        await base44.asServiceRole.entities.AssignmentLog.create({
          log_id:
            'ASG-' +
            Date.now() +
            '-' +
            Math.random().toString(36).substring(2, 6).toUpperCase(),
          customer_id: existingProfile?.user_id || customer_email,
          customer_email: customer_email,
          customer_name: existingProfile?.full_name || customer_email,
          previous_admin_id: previousAdminId,
          previous_admin_name: previousAdminName,
          new_admin_id: admin_profile_id,
          new_admin_name: targetAdmin.full_name || targetAdmin.email,
          action: assignmentAction,
          performed_by: user.id,
          performed_by_name: user.full_name || user.email,
          timestamp: new Date().toISOString(),
        });

        return Response.json({
          success: true,
          action: assignmentAction,
          message:
            'Customer ' +
            assignmentAction.toLowerCase() +
            ' to ' +
            (targetAdmin.full_name || targetAdmin.email),
        });
      }

      case 'REMOVE': {
        const { customer_email } = body;
        if (!customer_email) {
          return Response.json({ error: 'customer_email is required' }, { status: 400 });
        }

        const allProfiles = await base44.asServiceRole.entities.UserAccessProfile.list(null, 500);
        const existingProfile = (allProfiles || []).find(
          (p) => p.email && p.email.toLowerCase() === customer_email.toLowerCase()
        );

        if (!existingProfile || !existingProfile.assigned_admin_id) {
          return Response.json(
            { error: 'Customer has no assignment to remove' },
            { status: 400 }
          );
        }

        const prevAdmin = adminProfiles.find(
          (p) => p.admin_profile_id === existingProfile.assigned_admin_id
        );

        // Clear assignment
        await base44.asServiceRole.entities.UserAccessProfile.update(existingProfile.id, {
          assigned_admin_id: null,
        });

        // Log the removal
        await base44.asServiceRole.entities.AssignmentLog.create({
          log_id:
            'ASG-' +
            Date.now() +
            '-' +
            Math.random().toString(36).substring(2, 6).toUpperCase(),
          customer_id: existingProfile.user_id,
          customer_email: existingProfile.email,
          customer_name: existingProfile.full_name || existingProfile.email,
          previous_admin_id: existingProfile.assigned_admin_id,
          previous_admin_name: prevAdmin?.full_name || prevAdmin?.email || 'Unknown',
          new_admin_id: null,
          new_admin_name: null,
          action: 'REMOVED',
          performed_by: user.id,
          performed_by_name: user.full_name || user.email,
          timestamp: new Date().toISOString(),
        });

        return Response.json({
          success: true,
          action: 'REMOVED',
          message: 'Assignment removed',
        });
      }

      case 'GET_LOGS': {
        const logs = await base44.asServiceRole.entities.AssignmentLog.list('-timestamp', 100);
        return Response.json({
          success: true,
          logs: logs || [],
        });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});