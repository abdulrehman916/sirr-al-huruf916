import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * Validate code status for a guest session.
 * Called by the client on app load to check if redeemed codes are still valid.
 * Returns list of codes bound to this session with their current status.
 * Client removes localStorage permissions for codes that are deleted, disabled, or expired.
 *
 * Input:  { session_id }
 * Output: { success, codes: [{ code, status, expiry_date, page_paths }] }
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { session_id } = await req.json();

    if (!session_id) return Response.json({ error: 'session_id required' }, { status: 400 });

    // Find all codes bound to this session
    const codes = await base44.asServiceRole.entities.AccessCode.filter(
      { used_by_user_id: session_id },
      '-created_date',
      100
    );

    // Also include codes Google-linked to the authenticated user (if signed in)
    // so auto-restored linked permissions are not stripped by the client cleanup.
    let linkedCodes: any[] = [];
    try {
      const u = await base44.auth.me();
      if (u) {
        linkedCodes = await base44.asServiceRole.entities.AccessCode.filter(
          { linked_user_id: u.id },
          '-linked_at',
          100
        );
      }
    } catch { /* guest — no linked codes */ }

    const seenIds = new Set((codes || []).map((c: any) => c.id));
    const allCodes = [...(codes || [])];
    for (const lc of (linkedCodes || [])) {
      if (!seenIds.has(lc.id)) { allCodes.push(lc); seenIds.add(lc.id); }
    }

    const now = new Date();

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

    const results = (allCodes || []).map((c: any) => {
      // ── TRUE PER-PAGE EXPIRY: the code is only 'disabled' if the admin disabled
      // it. We NEVER mark the whole code 'expired' because of one page — each page
      // expires independently via its own page_grants[path].expires_at. ──
      const status = c.is_disabled ? 'disabled' : 'active';

      // Per-page grants: use stored page_grants; compute for legacy codes that
      // have none (backward compatibility). Each page is fully independent.
      const storedGrants: Record<string, any> = c.page_grants || {};
      const pageDurations = c.page_durations || {};
      const featureDurations = c.feature_durations || {};
      const subFeaturesMap = c.sub_features || {};
      const usedAtMs = c.used_at ? new Date(c.used_at).getTime() : now.getTime();

      const page_grants: Record<string, any> = { ...storedGrants };
      (c.page_paths || []).forEach((path: string) => {
        if (!page_grants[path]) {
          const pd = pageDurations[path];
          const subFeats = subFeaturesMap[path] || [];
          const baseMs = pd?.added_at ? new Date(pd.added_at).getTime() : usedAtMs;
          page_grants[path] = {
            granted_at: (pd?.added_at || c.used_at || new Date().toISOString()),
            expires_at: computePageExpiry(path, pd, subFeats, featureDurations, baseMs),
            duration_label: pd?.label || '',
          };
        }
      });

      return {
        code: c.code,
        status,
        expiry_date: c.expiry_date, // kept for compatibility; per-page is authoritative
        page_paths: c.page_paths || [],
        page_names: c.page_names || [],
        sub_features: c.sub_features || {},
        page_grants,
        is_disabled: c.is_disabled || false,
      };
    });

    return Response.json({
      success: true,
      codes: results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});