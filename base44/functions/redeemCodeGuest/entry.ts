import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Redeem a Reading Access Code without requiring auth.
 * Uses a guest session_id (UUID from localStorage) as the device identifier.
 *
 * Stabilization (no behavior/architecture change to the Access Code system):
 *  - P1.2: Rate limiting + brute-force protection, respecting
 *          SystemSettings.reading_codes.max_redemption_attempts (default 3).
 *  - P3.7: Strict input validation.
 *  - P4.9: Audit logging of every redemption attempt (success/failure).
 *
 * Input:  { code: string, session_id: string }
 * Output: { success, message, pages_granted, permissions }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { code, session_id } = body;

    // ── P3.7: Input validation ──
    if (!code || typeof code !== "string" || !code.trim()) {
      return Response.json({ success: false, message: "Code is required." }, { status: 400 });
    }
    if (!session_id || typeof session_id !== "string" || !session_id.trim()) {
      return Response.json({ success: false, message: "Session ID is required." }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();
    const clientIP = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // ── P1.2: Rate limiting / brute-force protection ──
    // Respect SystemSettings.reading_codes.max_redemption_attempts (default 3).
    // Count this session's FAILED attempts in the last 15 minutes; lock if exceeded.
    // Per-session (not per-IP) so valid users on shared NAT are never blocked.
    const RATE_WINDOW_MS = 15 * 60 * 1000;
    let maxAttempts = 3;
    try {
      const settings = await base44.asServiceRole.entities.SystemSettings.filter({ settings_id: "SETTINGS-MAIN" }, null, 1);
      const cfg = settings && settings[0] ? settings[0].reading_codes : null;
      if (cfg && cfg.max_redemption_attempts) {
        const parsed = parseInt(cfg.max_redemption_attempts);
        if (!isNaN(parsed) && parsed > 0) maxAttempts = parsed;
      }
    } catch { /* best-effort — fall back to default */ }

    const windowStartISO = new Date(Date.now() - RATE_WINDOW_MS).toISOString();
    let recentFailed = 0;
    try {
      const attempts = await base44.asServiceRole.entities.AuditLog.filter(
        { action_type: "CODE_REDEMPTION_ATTEMPT", performed_by: session_id, timestamp: { $gte: windowStartISO } },
        "-timestamp", 200
      );
      recentFailed = (attempts || []).filter((a: any) => {
        try { return JSON.parse(a.details || "{}").result === "FAILED"; } catch { return false; }
      }).length;
    } catch { /* best-effort — never block a valid user on a log read failure */ }

    if (recentFailed >= maxAttempts) {
      // Log brute-force detection (best-effort)
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          log_id: "AUDIT-" + crypto.randomUUID().toUpperCase(),
          action_type: "BRUTE_FORCE_DETECTED",
          performed_by: session_id,
          performed_by_email: "session:" + session_id.slice(0, 16),
          target_entity: "AccessCode",
          target_id: normalizedCode,
          details: JSON.stringify({ ip: clientIP, user_agent: userAgent, failed_attempts: recentFailed, max_attempts: maxAttempts }),
          ip_address: clientIP,
          user_agent: userAgent,
          timestamp: new Date().toISOString(),
        });
      } catch { /* ignore */ }
      return Response.json({ success: false, message: "Too many failed attempts. Please wait a few minutes and try again.", blocked: true }, { status: 429 });
    }

    // ── P4.9: Failed-attempt logger (to AuditLog, for counting + audit) ──
    const logAttempt = async (result: string, reason?: string, extra: any = {}) => {
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          log_id: "AUDIT-" + crypto.randomUUID().toUpperCase(),
          action_type: "CODE_REDEMPTION_ATTEMPT",
          performed_by: session_id,
          performed_by_email: "session:" + session_id.slice(0, 16),
          target_entity: "AccessCode",
          target_id: normalizedCode,
          details: JSON.stringify({ result, ...(reason ? { reason } : {}), ip: clientIP, ...extra }),
          ip_address: clientIP,
          user_agent: userAgent,
          timestamp: new Date().toISOString(),
        });
      } catch { /* best-effort */ }
    };

    // Look up code
    const codes = await base44.asServiceRole.entities.AccessCode.filter({ code: normalizedCode }, null, 1);
    if (!codes || codes.length === 0) {
      await logAttempt("FAILED", "NOT_FOUND");
      return Response.json({ success: false, message: "Invalid code. Please check and try again." });
    }

    const accessCode = codes[0];

    if (accessCode.is_disabled) {
      const nowISO = new Date().toISOString();
      await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
        audit_log: [...(accessCode.audit_log || []), {
          action: "REJECTED_DISABLED",
          timestamp: nowISO,
          admin_id: "system",
          details: `Attempt by User/Device: ${session_id.slice(0, 16)} — Result: Rejected — Code Disabled`,
        }],
      });
      await logAttempt("FAILED", "DISABLED");
      return Response.json({ success: false, message: "This code has been disabled." });
    }

    // Expired code check — never unlock any page
    if (accessCode.expiry_date && new Date(accessCode.expiry_date) < new Date()) {
      const nowISOExp = new Date().toISOString();
      await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
        audit_log: [...(accessCode.audit_log || []), {
          action: "REJECTED_EXPIRED",
          timestamp: nowISOExp,
          admin_id: "system",
          details: `Attempt by User/Device: ${session_id.slice(0, 16)} — Result: Rejected — Code Expired`,
        }],
      });
      await logAttempt("FAILED", "EXPIRED");
      return Response.json({ success: false, message: "This code has expired." });
    }

    // Device binding: once redeemed, only the original device/session can use this code
    if (accessCode.device_id && accessCode.device_id !== session_id) {
      const nowISORej = new Date().toISOString();
      await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
        audit_log: [...(accessCode.audit_log || []), {
          action: "REJECTED_ALREADY_REDEEMED",
          timestamp: nowISORej,
          admin_id: "system",
          details: `Attempt by User ID: ${session_id.slice(0, 16)}, Device ID: ${session_id.slice(0, 16)} — Result: Rejected - Already Redeemed`,
        }],
      });
      await logAttempt("FAILED", "DEVICE_BOUND_ELSEWHERE");
      return Response.json({ success: false, message: "This Access Code has already been redeemed and cannot be used again." });
    }

    const maxUses = accessCode.max_uses || 1;
    const useCount = accessCode.use_count || 0;

    // Build permissions from code data (shared by both first-redeem and re-download paths)
    const pagePaths = accessCode.page_paths || [];
    const pageNames = accessCode.page_names || [];
    const pageDurations = accessCode.page_durations || {};
    const featureDurations = accessCode.feature_durations || {};
    const subFeaturesMap = accessCode.sub_features || {};
    // ── TRUE PER-PAGE EXPIRY: page_grants is the source of truth. Each page has
    // its own independent { granted_at, expires_at }. buildPermissions prefers
    // the stored grant so redemption never resets an existing page's timer. ──
    const pageGrants: Record<string, any> = accessCode.page_grants || {};

    // Compute a single page's feature-aware expiry (mirrors client computePageExpiry).
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

    const buildPermissions = (baseTime: Date, grantedAt: string, isRedownload: boolean) => {
      return pagePaths.map((path: string, i: number) => {
        const pageDur = pageDurations[path];
        const pageSubFeats = subFeaturesMap[path] || [];

        // Per-page base time for the page-level fallback: on re-download, use
        // added_at if present (pages added after initial redemption).
        const pageBaseTime = (isRedownload && pageDur?.added_at) ? new Date(pageDur.added_at) : baseTime;

        // Per-feature expiries from feature_durations
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
              if (!latestFeatureExpiry || new Date(featExpiry) > new Date(latestFeatureExpiry)) {
                latestFeatureExpiry = featExpiry;
              }
            } else if (featDur.duration_days) {
              const featExpiry = new Date(featBaseTime.getTime() + featDur.duration_days * 86400000).toISOString();
              featureExpiries[featId] = { expiry_date: featExpiry, plan_name: featDur.plan_name || "Plan" };
              if (!latestFeatureExpiry || new Date(featExpiry) > new Date(latestFeatureExpiry)) {
                latestFeatureExpiry = featExpiry;
              }
            }
          }
        });

        // Determine final page-level expiry
        const hasFeatureDurations = Object.keys(featureExpiries).length > 0;
        let finalPageExpiry: string | null;
        if (hasFeatureDurations) {
          finalPageExpiry = hasLifetimeFeature ? null : latestFeatureExpiry;
        } else {
          finalPageExpiry = pageExpiryFromDur(pageDur, pageBaseTime);
        }

        // ── TRUE PER-PAGE EXPIRY: prefer the stored per-page grant. ──
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

    // Page-level expiry from page_durations only (helper for buildPermissions).
    function pageExpiryFromDur(pageDur: any, base: Date): string | null {
      if (!pageDur) return null;
      if (pageDur.value === "LIFETIME") return null;
      if (pageDur.value === "CUSTOM" && pageDur.custom_date) return new Date(pageDur.custom_date).toISOString();
      if (pageDur.duration_ms) return new Date(base.getTime() + pageDur.duration_ms).toISOString();
      if (pageDur.days) return new Date(base.getTime() + pageDur.days * 86400000).toISOString();
      return null;
    }

    // Check if this session already used this code (re-download)
    if (accessCode.used_by_user_id === session_id) {
      // Even for the original device, reject if the code-level expiry has passed
      if (accessCode.expiry_date && new Date(accessCode.expiry_date) < new Date()) {
        await logAttempt("FAILED", "EXPIRED_REDOWNLOAD");
        return Response.json({ success: false, message: "This code has expired." });
      }
      const usedAt = accessCode.used_at ? new Date(accessCode.used_at) : new Date();
      const permissions = buildPermissions(usedAt, accessCode.used_at || new Date().toISOString(), true);
      await logAttempt("SUCCESS", "RE_DOWNLOAD");
      return Response.json({
        success: true,
        message: `Access restored to ${pagePaths.length} page(s)!`,
        pages_granted: pagePaths.map((p: string, i: number) => ({ path: p, name: pageNames[i] || p })),
        permissions,
        already_used: true
      });
    }

    if (useCount >= maxUses) {
      const nowISORej2 = new Date().toISOString();
      await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
        audit_log: [...(accessCode.audit_log || []), {
          action: "REJECTED_ALREADY_REDEEMED",
          timestamp: nowISORej2,
          admin_id: "system",
          details: `Attempt by User ID: ${session_id.slice(0, 16)}, Device ID: ${session_id.slice(0, 16)} — Result: Rejected - Already Redeemed`,
        }],
      });
      await logAttempt("FAILED", "MAX_USES_REACHED", { max_uses: maxUses });
      return Response.json({ success: false, message: "This Access Code has already been redeemed and cannot be used again." });
    }

    const now = new Date();
    const nowISO = now.toISOString();
    const permissions = buildPermissions(now, nowISO, false);

    // ── P2.5: Synchronize the code-level expiry_date with the actual per-page
    // expiries just granted. null only when every page is lifetime; otherwise the
    // latest finite page expiry. This removes the null-even-when-finite
    // inconsistency that previously let validateAndCleanPermissions grant lifetime.
    const finiteExps = permissions.map((p: any) => p.expiry_date).filter((e: any) => e !== null && e !== undefined);
    const codeLevelExpiry = finiteExps.length === 0
      ? null
      : finiteExps.reduce((m: string | null, e: string) => (!m || new Date(e) > new Date(m as string)) ? e : m, null as string | null);

    // ── TRUE PER-PAGE EXPIRY: persist per-page grants for legacy codes that have
    // none yet (created before page_grants, or admin never set them). Each page
    // gets its OWN independent { granted_at, expires_at }. Existing grants are
    // NEVER overwritten here — redemption never resets a page's timer. ──
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

    // Mark code as used + bind to device
    await base44.asServiceRole.entities.AccessCode.update(accessCode.id, {
      use_count: useCount + 1,
      used_by_user_id: session_id,
      used_by_email: "guest:" + session_id.slice(0, 16),
      used_at: nowISO,
      device_id: session_id,
      expiry_date: codeLevelExpiry,
      ...(newPageGrants ? { page_grants: newPageGrants } : {}),
      audit_log: [...(accessCode.audit_log || []), { action: "REDEEMED", timestamp: nowISO, admin_id: "system", details: `Redeemed by device: ${session_id.slice(0, 16)}` }],
    });

    await logAttempt("SUCCESS", "REDEEMED", { pages_granted: pagePaths.length });

    return Response.json({
      success: true,
      message: `Access granted to ${pagePaths.length} page(s)!`,
      pages_granted: pagePaths.map((p: string, i: number) => ({ path: p, name: pageNames[i] || p })),
      permissions,
    });

  } catch (error) {
    return Response.json({ success: false, message: error.message || "Redemption failed" }, { status: 500 });
  }
});