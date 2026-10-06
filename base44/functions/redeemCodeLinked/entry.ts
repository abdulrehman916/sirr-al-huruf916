import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Redeem a Reading Access Code while permanently linking it to the signed-in
 * Google account. Requires Google Sign-In (base44.auth.me()).
 *
 * One code ↔ one Google account:
 *  - If the code is already linked to THIS user → re-download (restore permissions).
 *  - If the code is already linked to ANOTHER user → reject.
 *  - If not yet linked → link to the current Google user on first redemption.
 *  - Legacy session-bound code redeemed from the same device → link on next redeem.
 *
 * Preserves the existing per-page expiry logic (page_grants) verbatim.
 *
 * Input:  { code: string, session_id?: string }
 * Output: { success, message, pages_granted, permissions, linked?, already_used? }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, message: "Google sign-in required to redeem a code." }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { code, session_id } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return Response.json({ success: false, message: "Code is required." }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    // Look up code
    const codes = await base44.asServiceRole.entities.AccessCode.filter({ code: normalizedCode }, null, 1);
    if (!codes || codes.length === 0) {
      return Response.json({ success: false, message: "Invalid code. Please check and try again." });
    }

    const accessCode = codes[0];

    if (accessCode.is_disabled) {
      return Response.json({ success: false, message: "This code has been disabled." });
    }

    if (accessCode.expiry_date && new Date(accessCode.expiry_date) < new Date()) {
      return Response.json({ success: false, message: "This code has expired." });
    }

    // ── One code ↔ one Google account ──
    if (accessCode.linked_user_id && accessCode.linked_user_id !== user.id) {
      try {
        await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
          audit_log: [...(accessCode.audit_log || []), {
            action: "REJECTED_LINKED_ELSEWHERE",
            timestamp: new Date().toISOString(),
            admin_id: "system",
            details: `Attempt by Google user ${user.email} — already linked to ${accessCode.linked_user_email || "another account"}`,
          }],
        });
      } catch { /* best-effort */ }
      return Response.json({ success: false, message: "This Access Code is already linked to another Google account." });
    }

    // ── Build permissions (verbatim per-page expiry logic from redeemCodeGuest) ──
    const pagePaths: string[] = accessCode.page_paths || [];
    const pageNames: string[] = accessCode.page_names || [];
    const pageDurations: any = accessCode.page_durations || {};
    const featureDurations: any = accessCode.feature_durations || {};
    const subFeaturesMap: any = accessCode.sub_features || {};
    const pageGrants: Record<string, any> = accessCode.page_grants || {};

    const computePageExpiry = (path: string, pageDur: any, subFeats: string[], featDurs: any, baseTimeMs: number): string | null => {
      let pageExpiryMs: number | null = null;
      let pageIsLifetime = false;
      if (pageDur) {
        if (pageDur.value === "LIFETIME") pageIsLifetime = true;
        else if (pageDur.value === "CUSTOM" && pageDur.custom_date) pageExpiryMs = new Date(pageDur.custom_date).getTime();
        else if (pageDur.duration_ms) pageExpiryMs = baseTimeMs + pageDur.duration_ms;
        else if (pageDur.days) pageExpiryMs = baseTimeMs + pageDur.days * 86400000;
      }
      let latestFeatureMs: number | null = null;
      let hasLifetimeFeature = false;
      let hasFeatureDurations = false;
      (subFeats || []).forEach((featId: string) => {
        const fd = featDurs[`${path}:${featId}`];
        if (fd) {
          hasFeatureDurations = true;
          const featBase = fd.added_at ? new Date(fd.added_at).getTime() : baseTimeMs;
          if (fd.is_lifetime) hasLifetimeFeature = true;
          else if (fd.duration_ms) { const e = featBase + fd.duration_ms; if (latestFeatureMs === null || e > latestFeatureMs) latestFeatureMs = e; }
          else if (fd.duration_days) { const e = featBase + fd.duration_days * 86400000; if (latestFeatureMs === null || e > latestFeatureMs) latestFeatureMs = e; }
        }
      });
      if (hasFeatureDurations) {
        if (hasLifetimeFeature) return null;
        return latestFeatureMs !== null ? new Date(latestFeatureMs).toISOString() : null;
      }
      return pageIsLifetime ? null : (pageExpiryMs !== null ? new Date(pageExpiryMs).toISOString() : null);
    };

    function pageExpiryFromDur(pageDur: any, base: Date): string | null {
      if (!pageDur) return null;
      if (pageDur.value === "LIFETIME") return null;
      if (pageDur.value === "CUSTOM" && pageDur.custom_date) return new Date(pageDur.custom_date).toISOString();
      if (pageDur.duration_ms) return new Date(base.getTime() + pageDur.duration_ms).toISOString();
      if (pageDur.days) return new Date(base.getTime() + pageDur.days * 86400000).toISOString();
      return null;
    }

    const buildPermissions = (baseTime: Date, grantedAt: string, isRedownload: boolean) => {
      return pagePaths.map((path: string, i: number) => {
        const pageDur = pageDurations[path];
        const pageSubFeats = subFeaturesMap[path] || [];
        const pageBaseTime = (isRedownload && pageDur?.added_at) ? new Date(pageDur.added_at) : baseTime;

        const featureExpiries: Record<string, { expiry_date: string | null; plan_name: string }> = {};
        let latestFeatureExpiry: string | null = null;
        let hasLifetimeFeature = false;

        pageSubFeats.forEach((featId: string) => {
          const featKey = `${path}:${featId}`;
          const featDur = featureDurations[featKey];
          if (featDur) {
            const featBaseTime = (isRedownload && featDur.added_at) ? new Date(featDur.added_at) : baseTime;
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
          finalPageExpiry = pageExpiryFromDur(pageDur, pageBaseTime);
        }

        const grant = pageGrants[path];
        if (grant) {
          finalPageExpiry = grant.expires_at ?? null;
          grantedAt = grant.granted_at || grantedAt;
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

    // ── Already linked to THIS Google account → re-download ──
    if (accessCode.linked_user_id === user.id) {
      const usedAt = accessCode.used_at ? new Date(accessCode.used_at) : new Date();
      const permissions = buildPermissions(usedAt, accessCode.used_at || new Date().toISOString(), true);
      return Response.json({
        success: true,
        message: `Access restored to ${pagePaths.length} page(s)!`,
        pages_granted: pagePaths.map((p: string, i: number) => ({ path: p, name: pageNames[i] || p })),
        permissions,
        already_used: true,
        linked: true,
      });
    }

    const now = new Date();
    const nowISO = now.toISOString();

    // ── Legacy session-bound code redeemed from the same device → link on next redeem ──
    if (!accessCode.linked_user_id && session_id && accessCode.used_by_user_id === session_id) {
      const usedAt = accessCode.used_at ? new Date(accessCode.used_at) : now;
      const permissions = buildPermissions(usedAt, accessCode.used_at || nowISO, true);
      await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
        linked_user_id: user.id,
        linked_user_email: user.email,
        linked_at: nowISO,
        used_by_user_id: user.id,
        used_by_email: user.email,
        audit_log: [...(accessCode.audit_log || []), { action: "LINKED_EXISTING", timestamp: nowISO, admin_id: "system", details: `Existing code linked to Google account ${user.email}` }],
      });
      return Response.json({
        success: true,
        message: `Access restored to ${pagePaths.length} page(s)!`,
        pages_granted: pagePaths.map((p: string, i: number) => ({ path: p, name: pageNames[i] || p })),
        permissions,
        already_used: true,
        linked: true,
      });
    }

    // ── First redemption → link to this Google account ──
    const useCount = accessCode.use_count || 0;
    const maxUses = accessCode.max_uses || 1;
    if (useCount >= maxUses) {
      return Response.json({ success: false, message: "This Access Code has already been redeemed and cannot be used again." });
    }

    const permissions = buildPermissions(now, nowISO, false);

    const finiteExps = permissions.map((p: any) => p.expiry_date).filter((e: any) => e !== null && e !== undefined);
    const codeLevelExpiry = finiteExps.length === 0
      ? null
      : finiteExps.reduce((m: string | null, e: string) => (!m || new Date(e) > new Date(m as string)) ? e : m, null as string | null);

    let newPageGrants: Record<string, any> | null = null;
    if (Object.keys(pageGrants).length === 0) {
      newPageGrants = {};
      pagePaths.forEach((path: string, i: number) => {
        const perm = permissions[i];
        newPageGrants![path] = {
          granted_at: perm.granted_at || nowISO,
          expires_at: perm.expiry_date ?? null,
          duration_label: (pageDurations[path] || {}).label || "",
        };
      });
    }

    await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
      use_count: useCount + 1,
      used_by_user_id: user.id,
      used_by_email: user.email,
      used_at: nowISO,
      device_id: session_id || accessCode.device_id || user.id,
      linked_user_id: user.id,
      linked_user_email: user.email,
      linked_at: nowISO,
      expiry_date: codeLevelExpiry,
      ...(newPageGrants ? { page_grants: newPageGrants } : {}),
      audit_log: [...(accessCode.audit_log || []), { action: "REDEEMED_LINKED", timestamp: nowISO, admin_id: "system", details: `Redeemed & linked to Google account ${user.email}` }],
    });

    return Response.json({
      success: true,
      message: `Access granted to ${pagePaths.length} page(s)!`,
      pages_granted: pagePaths.map((p: string, i: number) => ({ path: p, name: pageNames[i] || p })),
      permissions,
      linked: true,
    });

  } catch (error) {
    return Response.json({ success: false, message: error.message || "Redemption failed" }, { status: 500 });
  }
});