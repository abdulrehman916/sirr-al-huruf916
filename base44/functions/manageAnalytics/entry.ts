import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * manageAnalytics — Admin Analytics & Audit Dashboard backend.
 *
 * Actions:
 *   GET_ANALYTICS  — Aggregated stats + chart data (RBAC scoped)
 *   GET_AUDIT_LOGS — Searchable audit logs with filters (RBAC scoped)
 *   EXPORT_DATA    — Export analytics or audit logs as CSV (owner only)
 *
 * RBAC:
 *   Owner: full analytics + all audit logs
 *   Admin: only analytics/logs for their assigned customers
 *
 * Does NOT modify any existing system. Read-only aggregation only.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { action } = body;

    // ── Auth + RBAC ──
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Find admin profile
    const adminProfiles = (await base44.asServiceRole.entities.AdminProfile.list(null, 500)) || [];
    const myProfile = adminProfiles.find(
      (p) =>
        (p.user_id && p.user_id === user.id) ||
        (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
    );
    if (!myProfile) {
      return Response.json({ error: 'Admin profile not found' }, { status: 403 });
    }
    const isOwner = myProfile.is_owner === true;

    // Fetch all data in parallel
    const [accessProfiles, accessCodes, redeemApprovals, adminList, pagePermissions] = await Promise.all([
      base44.asServiceRole.entities.UserAccessProfile.list(null, 500),
      base44.asServiceRole.entities.AccessCode.list(null, 500),
      base44.asServiceRole.entities.RedeemCodeApproval.list('-submitted_at', 500),
      Promise.resolve(adminProfiles),
      base44.asServiceRole.entities.PagePermission.list(null, 500).catch(() => []),
    ]);

    const allProfiles = accessProfiles || [];
    const allCodes = accessCodes || [];
    const allApprovals = redeemApprovals || [];
    const allAdmins = adminList || [];
    const allPerms = pagePermissions || [];

    // ── RBAC scoping ──
    // Admin: only see their assigned customers' data
    let scopedProfiles, scopedApprovals, scopedPerms;
    if (isOwner) {
      scopedProfiles = allProfiles;
      scopedApprovals = allApprovals;
      scopedPerms = allPerms;
    } else {
      const myCustomerEmails = new Set(
        allProfiles
          .filter((p) => p.assigned_admin_id === myProfile.admin_profile_id)
          .map((p) => (p.email ? p.email.toLowerCase() : ''))
          .filter(Boolean)
      );
      const myCustomerUserIds = new Set(
        allProfiles
          .filter((p) => p.assigned_admin_id === myProfile.admin_profile_id)
          .map((p) => p.user_id)
          .filter(Boolean)
      );
      scopedProfiles = allProfiles.filter((p) => p.assigned_admin_id === myProfile.admin_profile_id);
      scopedApprovals = allApprovals.filter(
        (a) =>
          (a.customer_email && myCustomerEmails.has(a.customer_email.toLowerCase())) ||
          (a.customer_user_id && myCustomerUserIds.has(a.customer_user_id))
      );
      scopedPerms = allPerms.filter(
        (p) => myCustomerUserIds.has(p.user_id)
      );
    }

    // ── Helpers ──
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const isToday = (ts) => ts && ts.split('T')[0] === todayStr;
    const isThisMonth = (ts) => {
      if (!ts) return false;
      const d = new Date(ts);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    };
    const isThisYear = (ts) => {
      if (!ts) return false;
      const d = new Date(ts);
      return d.getFullYear() === thisYear;
    };

    // ── Actions ──
    switch (action) {
      // ── GET_ANALYTICS ──
      case 'GET_ANALYTICS': {
        // Customer stats
        const totalCustomers = scopedProfiles.length;
        const activeCustomers = scopedProfiles.filter((p) => p.account_status === 'ACTIVE').length;
        const premiumCustomers = scopedProfiles.filter(
          (p) => p.subscription_plan && p.subscription_plan !== 'NONE'
        ).length;
        const publicUsers = scopedProfiles.filter(
          (p) => !p.subscription_plan || p.subscription_plan === 'NONE'
        ).length;

        // Redeem approval stats
        const totalRedeemCodes = scopedApprovals.length;
        const pendingApprovals = scopedApprovals.filter(
          (a) => a.status === 'PENDING' || a.status === 'INFO_REQUESTED'
        ).length;
        const approvedToday = scopedApprovals.filter(
          (a) => a.status === 'APPROVED' && isToday(a.reviewed_at)
        ).length;
        const rejectedToday = scopedApprovals.filter(
          (a) => a.status === 'REJECTED' && isToday(a.reviewed_at)
        ).length;

        // Revenue (from access code pricing — approximate from SubscriptionPlanConfig if available)
        // Since we can't modify existing entities, we compute revenue from approved approvals
        // that have associated access codes with pricing info
        let revenueToday = 0;
        let revenueThisMonth = 0;
        let revenueThisYear = 0;

        // Try to get subscription plan configs for pricing
        let planConfigs = [];
        try {
          planConfigs = (await base44.asServiceRole.entities.SubscriptionPlanConfig.list(null, 500)) || [];
        } catch {}

        // Build price lookup: page_path+feature_id → price
        const priceLookup = {};
        planConfigs.forEach((pc) => {
          if (pc.price) {
            const key = (pc.page_path || '') + ':' + (pc.feature_id || 'FULL_PAGE');
            priceLookup[key] = pc.price;
          }
        });

        // Compute revenue from approved approvals
        scopedApprovals
          .filter((a) => a.status === 'APPROVED' && a.reviewed_at)
          .forEach((a) => {
            let approvalRevenue = 0;
            if (a.activated_features) {
              a.activated_features.forEach((feat) => {
                // Try to match feature to price
                if (priceLookup[feat]) approvalRevenue += priceLookup[feat];
                else if (priceLookup[feat + ':FULL_PAGE']) approvalRevenue += priceLookup[feat + ':FULL_PAGE'];
              });
            }
            revenueToday += isToday(a.reviewed_at) ? approvalRevenue : 0;
            revenueThisMonth += isThisMonth(a.reviewed_at) ? approvalRevenue : 0;
            revenueThisYear += isThisYear(a.reviewed_at) ? approvalRevenue : 0;
          });

        // Admin stats
        const activeAdmins = allAdmins.filter(
          (a) => a.status === 'ACTIVE' && !a.is_owner
        ).length;
        const assignedCustomers = scopedProfiles.filter(
          (p) => p.assigned_admin_id
        ).length;
        const unassignedCustomers = scopedProfiles.filter(
          (p) => !p.assigned_admin_id
        ).length;

        // ── Chart Data ──

        // Daily registrations (last 30 days)
        const dailyRegistrations = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          const count = scopedProfiles.filter(
            (p) => p.registration_date && p.registration_date.split('T')[0] === dStr
          ).length;
          dailyRegistrations.push({ date: dStr, count });
        }

        // Daily revenue (last 30 days)
        const dailyRevenue = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          let rev = 0;
          scopedApprovals
            .filter((a) => a.status === 'APPROVED' && a.reviewed_at && a.reviewed_at.split('T')[0] === dStr)
            .forEach((a) => {
              if (a.activated_features) {
                a.activated_features.forEach((feat) => {
                  if (priceLookup[feat]) rev += priceLookup[feat];
                  else if (priceLookup[feat + ':FULL_PAGE']) rev += priceLookup[feat + ':FULL_PAGE'];
                });
              }
            });
          dailyRevenue.push({ date: dStr, revenue: rev });
        }

        // Redeem approvals (last 14 days, by status)
        const redeemApprovalsChart = [];
        for (let i = 13; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const dStr = d.toISOString().split('T')[0];
          const dayApprovals = scopedApprovals.filter(
            (a) => a.submitted_at && a.submitted_at.split('T')[0] === dStr
          );
          redeemApprovalsChart.push({
            date: dStr,
            pending: dayApprovals.filter((a) => a.status === 'PENDING').length,
            approved: dayApprovals.filter((a) => a.status === 'APPROVED').length,
            rejected: dayApprovals.filter((a) => a.status === 'REJECTED').length,
          });
        }

        // Premium subscriptions (last 12 months)
        const premiumSubscriptions = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const m = d.getMonth();
          const y = d.getFullYear();
          const monthStr = y + '-' + String(m + 1).padStart(2, '0');
          const count = scopedProfiles.filter((p) => {
            if (!p.registration_date) return false;
            const pd = new Date(p.registration_date);
            return pd.getMonth() === m && pd.getFullYear() === y &&
              p.subscription_plan && p.subscription_plan !== 'NONE';
          }).length;
          premiumSubscriptions.push({ month: monthStr, count });
        }

        // Customer growth (cumulative, last 12 months)
        const customerGrowth = [];
        let cumulative = 0;
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const m = d.getMonth();
          const y = d.getFullYear();
          const monthStr = y + '-' + String(m + 1).padStart(2, '0');
          const newThisMonth = scopedProfiles.filter((p) => {
            if (!p.registration_date) return false;
            const pd = new Date(p.registration_date);
            return pd.getFullYear() < y || (pd.getFullYear() === y && pd.getMonth() <= m);
          }).length;
          cumulative = newThisMonth;
          customerGrowth.push({ month: monthStr, total: cumulative });
        }

        // Admin workload distribution
        const adminWorkload = allAdmins
          .filter((a) => !a.is_owner)
          .map((a) => {
            const assignedCount = allProfiles.filter(
              (p) => p.assigned_admin_id === a.admin_profile_id
            ).length;
            const pendingCount = allApprovals.filter(
              (ap) =>
                ap.assigned_admin_id === a.admin_profile_id &&
                (ap.status === 'PENDING' || ap.status === 'INFO_REQUESTED')
            ).length;
            return {
              admin_name: a.full_name || a.email,
              assigned_customers: assignedCount,
              pending_approvals: pendingCount,
            };
          });

        return Response.json({
          success: true,
          is_owner: isOwner,
          stats: {
            totalCustomers,
            activeCustomers,
            premiumCustomers,
            publicUsers,
            totalRedeemCodes,
            pendingApprovals,
            approvedToday,
            rejectedToday,
            revenueToday,
            revenueThisMonth,
            revenueThisYear,
            activeAdmins,
            assignedCustomers,
            unassignedCustomers,
          },
          charts: {
            dailyRegistrations,
            dailyRevenue,
            redeemApprovalsChart,
            premiumSubscriptions,
            customerGrowth,
            adminWorkload,
          },
        });
      }

      // ── GET_AUDIT_LOGS ──
      case 'GET_AUDIT_LOGS': {
        // Aggregate audit logs from multiple sources:
        // 1. RedeemCodeApproval.audit_log
        // 2. AccessCode.audit_log
        // 3. AdminProfile.activity_log
        // 4. AssignmentLog

        let logs = [];

        // 1. Redeem Code Approval audit logs
        scopedApprovals.forEach((a) => {
          if (a.audit_log) {
            a.audit_log.forEach((entry) => {
              logs.push({
                source: 'RedeemCodeApproval',
                entity: 'redeem_code_approval',
                entity_id: a.approval_id,
                user: entry.user_name || 'Unknown',
                user_role: entry.user_role || 'customer',
                action: entry.action || 'UNKNOWN',
                timestamp: entry.timestamp || a.submitted_at,
                previous_value: entry.previous_value || null,
                new_value: entry.new_value || null,
                details: entry.details || null,
                customer_email: a.customer_email,
                code: a.code,
              });
            });
          }
        });

        // 2. Access Code audit logs (owner only — admins can't read AccessCode)
        if (isOwner) {
          allCodes.forEach((c) => {
            if (c.audit_log) {
              c.audit_log.forEach((entry) => {
                logs.push({
                  source: 'AccessCode',
                  entity: 'access_code',
                  entity_id: c.code,
                  user: entry.admin_id || 'system',
                  user_role: 'admin',
                  action: entry.action || 'UNKNOWN',
                  timestamp: entry.timestamp || c.created_date,
                  previous_value: null,
                  new_value: entry.details || null,
                  details: entry.details || null,
                  customer_email: c.email,
                  code: c.code,
                });
              });
            }
          });
        }

        // 3. Admin activity logs (owner only)
        if (isOwner) {
          allAdmins.forEach((a) => {
            if (a.activity_log) {
              a.activity_log.forEach((entry) => {
                logs.push({
                  source: 'AdminProfile',
                  entity: 'admin_profile',
                  entity_id: a.admin_profile_id,
                  user: a.full_name || a.email,
                  user_role: a.is_owner ? 'owner' : 'admin',
                  action: entry.action || 'UNKNOWN',
                  timestamp: entry.timestamp,
                  previous_value: null,
                  new_value: null,
                  details: entry.details || null,
                });
              });
            }
          });
        }

        // 4. Assignment logs
        try {
          const assignmentLogs = (await base44.asServiceRole.entities.AssignmentLog.list('-timestamp', 500)) || [];
          const scopedAssignments = isOwner
            ? assignmentLogs
            : assignmentLogs.filter(
                (al) => al.new_admin_id === myProfile.admin_profile_id || al.previous_admin_id === myProfile.admin_profile_id
              );
          scopedAssignments.forEach((al) => {
            logs.push({
              source: 'AssignmentLog',
              entity: 'customer_assignment',
              entity_id: al.log_id,
              user: al.performed_by_name || al.performed_by || 'Unknown',
              user_role: 'owner',
              action: al.action || 'UNKNOWN',
              timestamp: al.timestamp,
              previous_value: al.previous_admin_name || null,
              new_value: al.new_admin_name || null,
              details: `Customer: ${al.customer_name || al.customer_email}`,
              customer_email: al.customer_email,
            });
          });
        } catch {}

        // Sort by timestamp descending
        logs.sort((a, b) => {
          const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tb - ta;
        });

        return Response.json({
          success: true,
          is_owner: isOwner,
          logs: logs.slice(0, 500), // Cap at 500 for performance
          total: logs.length,
        });
      }

      // ── EXPORT_DATA (owner only) ──
      case 'EXPORT_DATA': {
        if (!isOwner) {
          return Response.json({ error: 'Owner access required for export' }, { status: 403 });
        }

        const { export_type } = body; // 'analytics' or 'audit'
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        if (export_type === 'audit') {
          // Reuse audit log logic (simplified inline)
          let logs = [];
          allApprovals.forEach((a) => {
            if (a.audit_log) {
              a.audit_log.forEach((entry) => {
                logs.push({
                  source: 'RedeemCodeApproval',
                  entity: 'redeem_code_approval',
                  entity_id: a.approval_id,
                  user: entry.user_name || 'Unknown',
                  user_role: entry.user_role || 'customer',
                  action: entry.action || 'UNKNOWN',
                  timestamp: entry.timestamp || a.submitted_at,
                  previous_value: entry.previous_value || '',
                  new_value: entry.new_value || '',
                  details: entry.details || '',
                  customer_email: a.customer_email || '',
                  code: a.code,
                });
              });
            }
          });
          allCodes.forEach((c) => {
            if (c.audit_log) {
              c.audit_log.forEach((entry) => {
                logs.push({
                  source: 'AccessCode',
                  entity: 'access_code',
                  entity_id: c.code,
                  user: entry.admin_id || 'system',
                  user_role: 'admin',
                  action: entry.action || 'UNKNOWN',
                  timestamp: entry.timestamp || c.created_date,
                  previous_value: '',
                  new_value: entry.details || '',
                  details: entry.details || '',
                  customer_email: c.email || '',
                  code: c.code,
                });
              });
            }
          });
          logs.sort((a, b) => {
            const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            return tb - ta;
          });

          // Build CSV
          const headers = ['Source', 'Entity', 'Entity ID', 'User', 'Role', 'Action', 'Timestamp', 'Previous Value', 'New Value', 'Details', 'Customer Email', 'Code'];
          const csvRows = [headers.join(',')];
          logs.forEach((l) => {
            const row = [
              l.source, l.entity, l.entity_id, l.user, l.user_role, l.action,
              l.timestamp, l.previous_value, l.new_value, l.details, l.customer_email, l.code || ''
            ].map((v) => '"' + String(v).replace(/"/g, '""') + '"');
            csvRows.push(row.join(','));
          });
          const csv = csvRows.join('\n');

          return new Response(csv, {
            status: 200,
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="audit_logs_${dateStr}.csv"`,
            },
          });
        }

        // Default: analytics export
        const stats = {
          totalCustomers: allProfiles.length,
          activeCustomers: allProfiles.filter((p) => p.account_status === 'ACTIVE').length,
          premiumCustomers: allProfiles.filter((p) => p.subscription_plan && p.subscription_plan !== 'NONE').length,
          totalRedeemCodes: allApprovals.length,
          pendingApprovals: allApprovals.filter((a) => a.status === 'PENDING').length,
          approvedToday: allApprovals.filter((a) => a.status === 'APPROVED' && isToday(a.reviewed_at)).length,
          rejectedToday: allApprovals.filter((a) => a.status === 'REJECTED' && isToday(a.reviewed_at)).length,
          activeAdmins: allAdmins.filter((a) => a.status === 'ACTIVE' && !a.is_owner).length,
        };

        const headers = ['Metric', 'Value'];
        const csvRows = [headers.join(',')];
        Object.entries(stats).forEach(([k, v]) => {
          csvRows.push(`"${k}","${v}"`);
        });
        const csv = csvRows.join('\n');

        return new Response(csv, {
          status: 200,
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="analytics_${dateStr}.csv"`,
          },
        });
      }

      default:
        return Response.json({ error: 'Unknown action: ' + action }, { status: 400 });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});