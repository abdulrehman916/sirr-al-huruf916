/**
 * Guest Session ID — a persistent UUID stored in localStorage.
 * Used as the user identifier for code redemption and permission checks
 * when the user is not authenticated.
 */

const SESSION_KEY = "sirr_session_id";

export function getSessionId() {
  let sid = localStorage.getItem(SESSION_KEY);
  if (!sid) {
    sid = "guest_" + crypto.randomUUID().replace(/-/g, "");
    localStorage.setItem(SESSION_KEY, sid);
  }
  return sid;
}

/**
 * Local permission store — keyed by session ID.
 * Permissions: [{ page_path, page_name, expiry_date (ISO or null=lifetime), granted_at }]
 */
const PERMS_KEY = "sirr_permissions";

export function getLocalPermissions() {
  try {
    const raw = localStorage.getItem(PERMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function setLocalPermissions(perms) {
  try {
    localStorage.setItem(PERMS_KEY, JSON.stringify(perms));
  } catch {}
}

/**
 * Merge new granted permissions into local store.
 * Replaces any existing entry for the same page_path.
 */
export function mergeGrantedPermissions(newPerms) {
  const existing = getLocalPermissions();
  const map = {};
  existing.forEach(p => { map[p.page_path] = p; });
  newPerms.forEach(np => {
    if (Array.isArray(np.grants)) { map[np.page_path] = np; return; }
    const prev = map[np.page_path];
    if (prev) {
      // Merge sub_features and feature_expiries (feature stacking)
      const mergedSubFeatures = [...new Set([
        ...(prev.sub_features || []),
        ...(np.sub_features || [])
      ])];
      const mergedFeatureExpiries = {
        ...(prev.feature_expiries || {}),
        ...(np.feature_expiries || {})
      };
      // Use latest page-level expiry (or null if either is lifetime)
      const prevExp = prev.expiry_date ? new Date(prev.expiry_date).getTime() : null;
      const newExp = np.expiry_date ? new Date(np.expiry_date).getTime() : null;
      const latestExpiry = (prevExp === null || newExp === null) ? null :
        prevExp > newExp ? prev.expiry_date : np.expiry_date;
      map[np.page_path] = {
        ...np,
        sub_features: mergedSubFeatures.length > 0 ? mergedSubFeatures : (np.sub_features || prev.sub_features),
        feature_expiries: Object.keys(mergedFeatureExpiries).length > 0 ? mergedFeatureExpiries : null,
        expiry_date: latestExpiry,
      };
    } else {
      map[np.page_path] = np;
    }
  });
  setLocalPermissions(Object.values(map));
}

/**
 * Check if local permissions grant access to a page_path.
 * Returns { granted: boolean, expiry_date: string|null }
 */
export function checkLocalPermission(page_path) {
  const perms = getLocalPermissions();
  const perm = perms.find(p => p.page_path === page_path);
  if (!perm) return { granted: false };
  // Check expiry
  if (perm.expiry_date && new Date(perm.expiry_date) < new Date()) {
    return { granted: false, expired: true };
  }
  return { granted: true, expiry_date: perm.expiry_date };
}

/**
 * Validate redeemed codes against the backend.
 * Removes localStorage permissions for deleted/disabled/expired codes.
 * Called on app load / page access to ensure revoked codes are enforced instantly.
 * Best-effort: silently fails if backend is unreachable.
 */
export async function validateAndCleanPermissions() {
  try {
    const { platform } = await import("@/api/platformClient");
    const response = await platform.functions.invoke('loadLinkedPermissions');
    if (response.data?.success && Array.isArray(response.data.permissions)) {
      setLocalPermissions(response.data.permissions);
    }
  } catch { /* Keep the previous expiring cache during a temporary connection failure. */ }
}

/**
 * Store redeemed code strings for admin request correlation.
 * Called when a code is successfully redeemed.
 */
const REDEEMED_CODES_KEY = "sirr_redeemed_codes";

export function addRedeemedCode(code) {
  try {
    const codes = getRedeemedCodes();
    if (!codes.includes(code)) {
      codes.push(code);
      localStorage.setItem(REDEEMED_CODES_KEY, JSON.stringify(codes));
    }
  } catch {}
}

export function getRedeemedCodes() {
  try {
    const raw = localStorage.getItem(REDEEMED_CODES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clear ONLY the locally restored permissions/session for the signed-in user.
 * Used on Logout: removes the in-memory permission cache, redeemed-code list,
 * and the guest session ID so the next sign-in starts clean. Does NOT touch
 * the database — Access Codes stay linked to their Google account, so signing
 * back in with the same (or a different) account auto-restores that account's
 * permissions via loadLinkedPermissions. No expiry, RLS, or code data changes.
 */
export function clearLocalSession() {
  try {
    localStorage.removeItem(PERMS_KEY);
    localStorage.removeItem(REDEEMED_CODES_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}