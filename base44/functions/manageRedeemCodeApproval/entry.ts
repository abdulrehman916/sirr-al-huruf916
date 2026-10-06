import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * manageRedeemCodeApproval — Redeem Code Approval Workflow with full RBAC.
 *
 * Public actions (no auth required):
 *   SUBMIT              — Customer submits a reading code for approval
 *   GET_MY_SUBMISSIONS  — Customer retrieves their own submissions
 *   RESPOND_INFO        — Customer responds to an info request
 *
 * Admin actions (auth + RBAC required):
 *   GET_PENDING         — Admin/Owner gets pending approvals (RBAC scoped)
 *   GET_ALL             — Admin/Owner gets all approvals (RBAC scoped)
 *   APPROVE             — Admin/Owner approves a code (RBAC scoped)
 *   REJECT              — Admin/Owner rejects a code (RBAC scoped)
 *   REQUEST_INFO        — Admin/Owner requests more info (RBAC scoped)
 *   GET_STATS           — Admin/Owner gets stats (RBAC scoped)
 *
 * Owner-only actions:
 *   OVERRIDE            — Owner overrides any admin decision
 *
 * RBAC Enforcement (server-side):
 *   - Owner: full access to all approvals
 *   - Admin: only approvals where assigned_admin_id === their admin_profile_id
 *   - Every action logs to audit_log: User, Admin, Timestamp, Action, Prev, New
 *
 * Does NOT modify: Reading Codes, Calculations, Mizan, Page Access, Customer
 * Assignment, WhatsApp Support, Device Binding, Payment, Existing UI/Records.
 * The existing AccessCode entity and redeem flow remain completely untouched.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // ── Helpers ──

    // Get current user (optional — returns null for unauthenticated)
    const tryGetUser = async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    };

    // Fetch admin profiles (used by all actions)
    const adminProfiles = (await base44.asServiceRole.entities.AdminProfile.list(null, 500)) || [];

    // Find admin profile for a user
    const findAdminProfile = (user) => {
      if (!user) return null;
      return adminProfiles.find(
        (p) =>
          (p.user_id && p.user_id === user.id) ||
          (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
      );
    };

    // Verify admin auth + get profile — returns { error, user, profile }
    const verifyAdmin = async () => {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return {
          error: Response.json({ error: 'Admin access required' }, { status: 403 }),
          user: null,
          profile: null,
        };
      }
      const profile = findAdminProfile(user);
      if (!profile) {
        return {
          error: Response.json({ error: 'Admin profile not found' }, { status: 403 }),
          user: null,
          profile: null,
        };
      }
      return { error: null, user, profile };
    };

    // Verify owner — returns { error, user, profile }
    const verifyOwner = async () => {
      const { error, user, profile } = await verifyAdmin();
      if (error) return { error, user: null, profile: null };
      if (!profile.is_owner) {
        return {
          error: Response.json({ error: 'Owner access required' }, { status: 403 }),
          user: null,
          profile: null,
        };
      }
      return { error: null, user, profile };
    };

    // RBAC: can admin access this approval?
    const canAccess = (profile, approval) => {
      if (profile.is_owner) return true;
      return approval.assigned_admin_id === profile.admin_profile_id;
    };

    // Build audit log entry
    const auditEntry = (act, user, profile, prev, next, details) => ({
      action: act,
      user_id: user?.id || 'customer',
      user_name: profile?.full_name || user?.email || body.email || body.name || 'Customer',
      user_role: profile?.is_owner ? 'owner' : (profile ? 'admin' : 'customer'),
      timestamp: new Date().toISOString(),
      previous_value: prev || null,
      new_value: next || null,
      details: details || null,
    });

    // ── Actions ──

    switch (action) {
      // ── Public: Submit code for approval ──
      case 'SUBMIT': {
        const { code, email, name, session_id } = body;
        if (!code) return Response.json({ error: 'code is required' }, { status: 400 });

        const upperCode = code.toUpperCase();

        // Validate code exists in AccessCode
        const accessCodeResult = await base44.asServiceRole.entities.AccessCode.filter({ code: upperCode });
        if (!accessCodeResult || accessCodeResult.length === 0) {
          return Response.json({ error: 'Invalid reading code' }, { status: 400 });
        }

        // Check if already pending
        const existing = await base44.asServiceRole.entities.RedeemCodeApproval.filter({ code: upperCode });
        const emailLower = email ? email.toLowerCase() : null;
        const alreadyPending = (existing || []).find(
          (e) =>
            (e.status === 'PENDING' || e.status === 'INFO_REQUESTED') &&
            e.customer_email === emailLower
        );
        if (alreadyPending) {
          return Response.json({
            success: true,
            approval_id: alreadyPending.approval_id,
            status: alreadyPending.status,
            already_submitted: true,
          });
        }

        // Find customer's assigned admin
        let assignedAdminId = null;
        let assignedAdminName = null;
        let customerUserId = null;
        if (emailLower) {
          const profiles = await base44.asServiceRole.entities.UserAccessProfile.list(null, 500);
          const userProfile = (profiles || []).find(
            (p) => p.email && p.email.toLowerCase() === emailLower
          );
          if (userProfile?.assigned_admin_id) {
            const admin = adminProfiles.find(
              (p) => p.admin_profile_id === userProfile.assigned_admin_id
            );
            assignedAdminId = userProfile.assigned_admin_id;
            assignedAdminName = admin?.full_name || null;
          }
          customerUserId = userProfile?.user_id || null;
        }

        // Also try to get user_id from auth
        if (!customerUserId) {
          const user = await tryGetUser();
          if (user?.id) customerUserId = user.id;
        }

        // Generate approval_id
        const allApprovals = await base44.asServiceRole.entities.RedeemCodeApproval.list('-submitted_at', 100);
        const maxNum = (allApprovals || []).reduce((max, a) => {
          const num = parseInt((a.approval_id || '').split('-')[1] || '0', 10);
          return num > max ? num : max;
        }, 0);
        const approvalId = 'RCA-' + String(maxNum + 1).padStart(6, '0');

        const now = new Date().toISOString();
        await base44.asServiceRole.entities.RedeemCodeApproval.create({
          approval_id: approvalId,
          code: upperCode,
          customer_email: emailLower,
          customer_name: name || null,
          customer_session_id: session_id || null,
          customer_user_id: customerUserId,
          assigned_admin_id: assignedAdminId,
          assigned_admin_name: assignedAdminName,
          status: 'PENDING',
          submitted_at: now,
          audit_log: [
            auditEntry('SUBMITTED', null, null, null, 'PENDING', 'Code ' + upperCode + ' submitted for approval'),
          ],
        });

        return Response.json({
          success: true,
          approval_id: approvalId,
          status: 'PENDING',
          assigned_admin: assignedAdminName,
        });
      }

      // ── Admin: Get pending approvals (RBAC scoped) ──
      case 'GET_PENDING': {
        const { error, user, profile } = await verifyAdmin();
        if (error) return error;

        const allApprovals = await base44.asServiceRole.entities.RedeemCodeApproval.list('-submitted_at', 500);
        const pending = (allApprovals || []).filter(
          (a) => (a.status === 'PENDING' || a.status === 'INFO_REQUESTED') && canAccess(profile, a)
        );

        return Response.json({ success: true, approvals: pending, is_owner: profile.is_owner });
      }

      // ── Admin: Get all approvals (RBAC scoped) ──
      case 'GET_ALL': {
        const { error, user, profile } = await verifyAdmin();
        if (error) return error;

        const allApprovals = await base44.asServiceRole.entities.RedeemCodeApproval.list('-submitted_at', 500);
        const scoped = (allApprovals || []).filter((a) => canAccess(profile, a));

        // Compute stats
        const stats = {
          pending: scoped.filter((a) => a.status === 'PENDING').length,
          approved: scoped.filter((a) => a.status === 'APPROVED').length,
          rejected: scoped.filter((a) => a.status === 'REJECTED').length,
          info_requested: scoped.filter((a) => a.status === 'INFO_REQUESTED').length,
          overridden: scoped.filter((a) => a.override_by_owner).length,
          total: scoped.length,
        };

        return Response.json({
          success: true,
          approvals: scoped,
          stats,
          is_owner: profile.is_owner,
        });
      }

      // ── Public: Get customer's own submissions ──
      case 'GET_MY_SUBMISSIONS': {
        const { email, session_id } = body;
        if (!email && !session_id) {
          return Response.json({ error: 'email or session_id required' }, { status: 400 });
        }

        const allApprovals = await base44.asServiceRole.entities.RedeemCodeApproval.list('-submitted_at', 500);
        let mine;
        if (email) {
          const emailLower = email.toLowerCase();
          mine = (allApprovals || []).filter(
            (a) => a.customer_email && a.customer_email.toLowerCase() === emailLower
          );
        } else {
          mine = (allApprovals || []).filter((a) => a.customer_session_id === session_id);
        }

        return Response.json({ success: true, submissions: mine });
      }

      // ── Admin: Approve ──
      case 'APPROVE': {
        const { error, user, profile } = await verifyAdmin();
        if (error) return error;

        const { approval_id } = body;
        if (!approval_id) return Response.json({ error: 'approval_id required' }, { status: 400 });

        const allApprovals = await base44.asServiceRole.entities.RedeemCodeApproval.list(null, 500);
        const approval = (allApprovals || []).find((a) => a.approval_id === approval_id);
        if (!approval) return Response.json({ error: 'Approval not found' }, { status: 404 });

        if (!canAccess(profile, approval)) {
          return Response.json(
            { error: 'You can only approve codes for your assigned customers' },
            { status: 403 }
          );
        }

        // Get access code details for activated features
        const accessCodeResult = await base44.asServiceRole.entities.AccessCode.filter({ code: approval.code });
        const codeData = accessCodeResult?.[0];
        const activatedFeatures = codeData?.page_paths || [];
        const activatedCodeId = codeData?.id || null;

        const now = new Date().toISOString();
        const log = approval.audit_log || [];
        log.push(auditEntry('APPROVED', user, profile, approval.status, 'APPROVED', 'Code approved'));

        await base44.asServiceRole.entities.RedeemCodeApproval.update(approval.id, {
          status: 'APPROVED',
          reviewed_by: user.id,
          reviewed_by_name: profile.full_name,
          reviewed_by_role: profile.is_owner ? 'owner' : 'admin',
          reviewed_at: now,
          activated_features: activatedFeatures,
          activated_code_id: activatedCodeId,
          audit_log: log,
        });

        return Response.json({
          success: true,
          approval_id,
          status: 'APPROVED',
          activated_features: activatedFeatures,
        });
      }

      // ── Admin: Reject ──
      case 'REJECT': {
        const { error, user, profile } = await verifyAdmin();
        if (error) return error;

        const { approval_id, rejection_reason } = body;
        if (!approval_id) return Response.json({ error: 'approval_id required' }, { status: 400 });
        if (!rejection_reason) return Response.json({ error: 'rejection_reason required' }, { status: 400 });

        const allApprovals = await base44.asServiceRole.entities.RedeemCodeApproval.list(null, 500);
        const approval = (allApprovals || []).find((a) => a.approval_id === approval_id);
        if (!approval) return Response.json({ error: 'Approval not found' }, { status: 404 });

        if (!canAccess(profile, approval)) {
          return Response.json(
            { error: 'You can only reject codes for your assigned customers' },
            { status: 403 }
          );
        }

        const now = new Date().toISOString();
        const log = approval.audit_log || [];
        log.push(auditEntry('REJECTED', user, profile, approval.status, 'REJECTED', rejection_reason));

        await base44.asServiceRole.entities.RedeemCodeApproval.update(approval.id, {
          status: 'REJECTED',
          reviewed_by: user.id,
          reviewed_by_name: profile.full_name,
          reviewed_by_role: profile.is_owner ? 'owner' : 'admin',
          reviewed_at: now,
          rejection_reason: rejection_reason,
          audit_log: log,
        });

        return Response.json({ success: true, approval_id, status: 'REJECTED' });
      }

      // ── Admin: Request more info ──
      case 'REQUEST_INFO': {
        const { error, user, profile } = await verifyAdmin();
        if (error) return error;

        const { approval_id, info_request_message } = body;
        if (!approval_id) return Response.json({ error: 'approval_id required' }, { status: 400 });
        if (!info_request_message) return Response.json({ error: 'info_request_message required' }, { status: 400 });

        const allApprovals = await base44.asServiceRole.entities.RedeemCodeApproval.list(null, 500);
        const approval = (allApprovals || []).find((a) => a.approval_id === approval_id);
        if (!approval) return Response.json({ error: 'Approval not found' }, { status: 404 });

        if (!canAccess(profile, approval)) {
          return Response.json(
            { error: 'You can only request info for your assigned customers' },
            { status: 403 }
          );
        }

        const now = new Date().toISOString();
        const log = approval.audit_log || [];
        log.push(auditEntry('INFO_REQUESTED', user, profile, approval.status, 'INFO_REQUESTED', info_request_message));

        await base44.asServiceRole.entities.RedeemCodeApproval.update(approval.id, {
          status: 'INFO_REQUESTED',
          reviewed_by: user.id,
          reviewed_by_name: profile.full_name,
          reviewed_by_role: profile.is_owner ? 'owner' : 'admin',
          reviewed_at: now,
          info_request_message: info_request_message,
          audit_log: log,
        });

        return Response.json({ success: true, approval_id, status: 'INFO_REQUESTED' });
      }

      // ── Public: Customer responds to info request ──
      case 'RESPOND_INFO': {
        const { approval_id, customer_response, email } = body;
        if (!approval_id) return Response.json({ error: 'approval_id required' }, { status: 400 });
        if (!customer_response) return Response.json({ error: 'customer_response required' }, { status: 400 });

        const allApprovals = await base44.asServiceRole.entities.RedeemCodeApproval.list(null, 500);
        const approval = (allApprovals || []).find((a) => a.approval_id === approval_id);
        if (!approval) return Response.json({ error: 'Approval not found' }, { status: 404 });

        // Verify ownership (email match)
        if (email && approval.customer_email && approval.customer_email.toLowerCase() !== email.toLowerCase()) {
          return Response.json({ error: 'Not authorized' }, { status: 403 });
        }

        const now = new Date().toISOString();
        const log = approval.audit_log || [];
        log.push(auditEntry('CUSTOMER_RESPONDED', null, null, approval.status, 'PENDING', customer_response));

        await base44.asServiceRole.entities.RedeemCodeApproval.update(approval.id, {
          status: 'PENDING',
          customer_response: customer_response,
          customer_responded_at: now,
          audit_log: log,
        });

        return Response.json({ success: true, approval_id, status: 'PENDING' });
      }

      // ── Owner only: Override admin decision ──
      case 'OVERRIDE': {
        const { error, user, profile } = await verifyOwner();
        if (error) return error;

        const { approval_id, new_status, override_reason } = body;
        if (!approval_id) return Response.json({ error: 'approval_id required' }, { status: 400 });
        if (!new_status || !['APPROVED', 'REJECTED'].includes(new_status)) {
          return Response.json({ error: 'new_status must be APPROVED or REJECTED' }, { status: 400 });
        }

        const allApprovals = await base44.asServiceRole.entities.RedeemCodeApproval.list(null, 500);
        const approval = (allApprovals || []).find((a) => a.approval_id === approval_id);
        if (!approval) return Response.json({ error: 'Approval not found' }, { status: 404 });

        const prevStatus = approval.status;
        const prevReviewedBy = approval.reviewed_by_name;
        const now = new Date().toISOString();
        const log = approval.audit_log || [];
        log.push(
          auditEntry(
            'OVERRIDDEN',
            user,
            profile,
            prevStatus,
            new_status,
            'Owner override: ' + (override_reason || 'No reason provided') +
              '. Original decision by ' + (prevReviewedBy || 'admin') + ' was ' + prevStatus
          )
        );

        const updates = {
          status: new_status,
          reviewed_by: user.id,
          reviewed_by_name: profile.full_name,
          reviewed_by_role: 'owner',
          reviewed_at: now,
          override_by_owner: true,
          override_reason: override_reason || null,
          original_decision: prevStatus,
          original_reviewed_by: approval.reviewed_by,
          audit_log: log,
        };

        if (new_status === 'APPROVED') {
          const accessCodeResult = await base44.asServiceRole.entities.AccessCode.filter({ code: approval.code });
          const codeData = accessCodeResult?.[0];
          updates.activated_features = codeData?.page_paths || [];
          updates.activated_code_id = codeData?.id || null;
        }

        if (new_status === 'REJECTED' && !approval.rejection_reason) {
          updates.rejection_reason = override_reason || 'Overridden by owner';
        }

        await base44.asServiceRole.entities.RedeemCodeApproval.update(approval.id, updates);

        return Response.json({ success: true, approval_id, status: new_status });
      }

      // ── Admin: Get stats (RBAC scoped) ──
      case 'GET_STATS': {
        const { error, user, profile } = await verifyAdmin();
        if (error) return error;

        const allApprovals = await base44.asServiceRole.entities.RedeemCodeApproval.list(null, 500);
        const scoped = (allApprovals || []).filter((a) => canAccess(profile, a));

        const stats = {
          pending: scoped.filter((a) => a.status === 'PENDING').length,
          approved: scoped.filter((a) => a.status === 'APPROVED').length,
          rejected: scoped.filter((a) => a.status === 'REJECTED').length,
          info_requested: scoped.filter((a) => a.status === 'INFO_REQUESTED').length,
          overridden: scoped.filter((a) => a.override_by_owner).length,
          total: scoped.length,
        };

        return Response.json({ success: true, stats, is_owner: profile.is_owner });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});