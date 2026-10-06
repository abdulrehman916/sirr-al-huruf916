import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Load all page permissions from Reading Access Codes linked to the signed-in
 * Google account. Used on Google Sign-In to auto-restore access across devices
 * without re-entering the code.
 *
 * Preserves the existing per-page expiry logic (page_grants) verbatim.
 * Expired pages are returned (client checkLocalPermission denies them); the
 * account link is never removed by expiry — renewals auto-apply on next load.
 *
 * Input:  {} (authenticated)
 * Output: { success, permissions: [...], codes: [code strings] }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, message: "Authentication required." }, { status: 401 });

    const codes = await base44.asServiceRole.entities.AccessCode.filter(
      { linked_user_id: user.id },
      '-linked_at',
      100
    );

    // ── Build permissions (verbatim per-page expiry logic) ──
    const pagePathsOf = (c: any): string[] => c.page_paths || [];
    const pageNamesOf = (c: any): string[] => c.page_names || [];

    const buildPermissions = (c: any) => {
      const pagePaths: string[] = c.page_paths || [];
      const pageNames: string[] = c.page_names || [];
      const pageDurations: any = c.page_durations || {};
      const featureDurations: any = c.feature_durations || {};
      const subFeaturesMap: any = c.sub_features || {};
      const pageGrants: Record<string, any> = c.page_grants || {};
      const usedAt: Date = c.used_at ? new Date(c.used_at) : new Date();
      const usedAtISO: string = c.used_at || new Date().toISOString();

      return pagePaths.map((path: string, i: number) => {
        const pageDur = pageDurations[path];
        const pageSubFeats = subFeaturesMap[path] || [];
        const pageBaseTime = pageDur?.added_at ? new Date(pageDur.added_at) : usedAt;

        const featureExpiries: Record<string, { expiry_date: string | null; plan_name: string }> = {};
        let latestFeatureExpiry: string | null = null;
        let hasLifetimeFeature = false;

        pageSubFeats.forEach((featId: string) => {
          const featKey = `${path}:${featId}`;
          const featDur = featureDurations[featKey];
          if (featDur) {
            const featBaseTime = featDur.added_at ? new Date(featDur.added_at) : usedAt;
            if (featDur.is_lifetime) {
              featureExpiries[featId] = { expiry_date: null, plan_name: featDur.plan_name || "Lifetime" };
              hasLifetimeFeature = true;
            } else if (featDur.duration_ms) {
              const featExpiry = new Date(featBaseTime.getTime() + featDur.duration_ms).toISOString();
              featureExpiries[featId] = { expiry_date: featExpiry, plan_name: featDur.plan_name || "Plan" };
              if (!latestFeatureExpiry || new Date(featExpiry) > new Date(latestFeatureExpiry)) latestFeatureExpiry = featExpiry;
            } else if (featDur.duration_days) {
              const featExpiry = new Date(featBaseTime.getTime() + featDur.duration_days * 86400000).toISOString();
              featureExpiries[featId] = { expiry_date: featExpiry, plan_name: featDur.plan_name || "Plan" };
              if (!latestFeatureExpiry || new Date(featExpiry) > new Date(latestFeatureExpiry)) latestFeatureExpiry = featExpiry;
            }
          }
        });

        const hasFeatureDurations = Object.keys(featureExpiries).length > 0;
        let finalPageExpiry: string | null;
        if (hasFeatureDurations) {
          finalPageExpiry = hasLifetimeFeature ? null : latestFeatureExpiry;
        } else {
          // Page-level expiry from page_durations (legacy fallback)
          if (!pageDur) finalPageExpiry = null;
          else if (pageDur.value === "LIFETIME") finalPageExpiry = null;
          else if (pageDur.value === "CUSTOM" && pageDur.custom_date) finalPageExpiry = new Date(pageDur.custom_date).toISOString();
          else if (pageDur.duration_ms) finalPageExpiry = new Date(pageBaseTime.getTime() + pageDur.duration_ms).toISOString();
          else if (pageDur.days) finalPageExpiry = new Date(pageBaseTime.getTime() + pageDur.days * 86400000).toISOString();
          else finalPageExpiry = null;
        }

        // ── page_grants is the source of truth ──
        const grant = pageGrants[path];
        let grantedAt = usedAtISO;
        if (grant) {
          finalPageExpiry = grant.expires_at ?? null;
          grantedAt = grant.granted_at || usedAtISO;
        }

        return {
          page_path: path,
          page_name: pageNames[i] || path,
          expiry_date: finalPageExpiry,
          granted_at: grantedAt,
          sub_features: pageSubFeats.length > 0 ? pageSubFeats : null,
          feature_expiries: hasFeatureDurations ? featureExpiries : null,
        };
      });
    };

    const allPerms: any[] = [];
    (codes || []).forEach((c: any) => {
      if (c.is_disabled) return; // disabled codes grant nothing
      const perms = buildPermissions(c);
      allPerms.push(...perms);
    });

    return Response.json({
      success: true,
      permissions: allPerms,
      codes: (codes || []).filter((c: any) => !c.is_disabled).map((c: any) => c.code),
    });
  } catch (error) {
    return Response.json({ success: false, message: error.message || "Load failed" }, { status: 500 });
  }
});