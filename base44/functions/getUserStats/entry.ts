import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000).toISOString();

    const results = await Promise.all([
      base44.entities.ApprovedUser.filter({ status: 'ACTIVE' }).then(r => r.length),
      base44.entities.ApprovedUser.filter({ status: 'EXPIRED' }).then(r => r.length),
      base44.entities.ApprovedUser.filter({ status: 'BLOCKED' }).then(r => r.length),
      base44.entities.ApprovedUser.filter({ status: 'REMOVED' }).then(r => r.length),
      base44.entities.ApprovedUser.list().then(r => r.length),
      base44.entities.AccessCode.list("-created_date", 500),
      base44.entities.PagePermission.filter({ is_active: true }).then(r => r.length),
      base44.entities.SupportTickets.filter({ status: 'OPEN' }).then(r => r.length),
    ]);

    const allCodes = results[5] || [];

    // Compute code stats
    let activeCodes = 0, expiredCodes = 0, disabledCodes = 0, lifetimeCodes = 0;
    let renewalsToday = 0, expiringToday = 0, expiringTomorrow = 0, expiring7Days = 0;
    let recentRedeems = 0, recentRenewals = 0;

    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    allCodes.forEach((c: any) => {
      if (c.is_disabled) { disabledCodes++; return; }
      if (!c.expiry_date) { lifetimeCodes++; activeCodes++; return; }
      const exp = new Date(c.expiry_date);
      if (exp < now) { expiredCodes++; return; }
      activeCodes++;
      if (exp.toISOString() < tomorrowStart) expiringToday++;
      else if (exp.toISOString() < tomorrowEnd) expiringTomorrow++;
      if (exp.toISOString() < sevenDaysFromNow) expiring7Days++;
      if (c.used_at && c.used_at >= sevenDaysAgo) recentRedeems++;
      (c.renewal_history || []).forEach((r: any) => {
        if (r.renewed_at && r.renewed_at >= todayStart) renewalsToday++;
        if (r.renewed_at && r.renewed_at >= sevenDaysAgo) recentRenewals++;
      });
    });

    return Response.json({
      success: true,
      stats: {
        // User stats (preserved)
        active_users: results[0],
        expired_users: results[1],
        blocked_users: results[2],
        removed_users: results[3],
        total_users: results[4],
        // Code stats (new)
        total_codes: allCodes.length,
        active_codes: activeCodes,
        expired_codes: expiredCodes,
        disabled_codes: disabledCodes,
        lifetime_codes: lifetimeCodes,
        // Permissions (preserved)
        active_permissions: results[6],
        // Support (new)
        pending_support: results[7],
        // Activity (new)
        renewals_today: renewalsToday,
        expiring_today: expiringToday,
        expiring_tomorrow: expiringTomorrow,
        expiring_7days: expiring7Days,
        recent_redeems: recentRedeems,
        recent_renewals: recentRenewals,
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});