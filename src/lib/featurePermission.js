/**
 * Feature Permission utilities.
 * Works on top of the existing localStorage permission store (sessionId.js).
 *
 * Architecture:
 *   - Single pages (no sub-features): page-level permission only.
 *   - Multi-feature pages: each child feature is independent.
 *     • If FeatureConfig.requires_permission = false → feature is Public (no permission needed).
 *     • If FeatureConfig.requires_permission = true  → feature is Premium (check local permission).
 *     • No page-level permission requirement — the parent page is just a container.
 *
 * Backward compatibility:
 *   - If a page permission has no sub_features field → ALL features unlocked.
 *   - If sub_features is present → only listed feature IDs are unlocked.
 *   - Admin users bypass all feature checks.
 *   - If sync cache not loaded yet (undefined) → defaults to Premium behavior.
 */

import { getLocalPermissions, checkLocalPermission } from './sessionId';
import { getFeatures, hasSubFeatures } from './featureRegistry';
import { getCachedFeaturePermission } from './featureConfigCache';

// ── Module-level admin flag (set by ProtectedPage when admin is detected) ──
let _isAdmin = false;

export function setAdminFlag(isAdmin) {
  _isAdmin = !!isAdmin;
}

export function getAdminFlag() {
  return _isAdmin;
}

/**
 * Check if the current user has access to a specific feature.
 * @param {string} pagePath — e.g. '/abjad'
 * @param {string} featureId — e.g. 'abjad_kabir'
 * @returns {boolean}
 */
export function checkFeatureAccess(pagePath, featureId) {
  // Admin bypass
  if (_isAdmin) return true;

  // Pages without sub-features: check page-level permission only
  if (!hasSubFeatures(pagePath)) {
    return checkLocalPermission(pagePath).granted;
  }

  // ── Multi-feature page: each feature is independent ──

  // 1. Check if this feature is individually Public (no permission needed)
  const requiresPermission = getCachedFeaturePermission(pagePath, featureId);
  if (requiresPermission === false) return true; // Public feature

  // 2. Premium feature (or cache not loaded yet) — check local permission
  const perms = getLocalPermissions();
  const perm = perms.find(p => p.page_path === pagePath);

  // No permission entry at all → locked
  if (!perm) return false;

  // No sub_features → all features unlocked (backward compat)
  // But still check page-level expiry
  if (!perm.sub_features || !Array.isArray(perm.sub_features) || perm.sub_features.length === 0) {
    if (perm.expiry_date && new Date(perm.expiry_date) < new Date()) return false;
    return true;
  }

  // Check if this specific feature is in the allowed list
  if (!perm.sub_features.includes(featureId)) return false;

  // Check feature-specific expiry (per-plan duration)
  const featureExpiry = perm.feature_expiries?.[featureId];
  if (featureExpiry?.expiry_date) {
    if (new Date(featureExpiry.expiry_date) < new Date()) {
      return false; // feature expired
    }
  }

  return true;
}

/**
 * Get all unlocked feature IDs for a page.
 * Returns ['__all__'] if the page has no sub-features but is unlocked.
 * Returns all feature IDs if sub_features is absent (backward compat).
 * @param {string} pagePath
 * @returns {array}
 */
export function getUnlockedFeatureIds(pagePath) {
  if (_isAdmin) {
    return hasSubFeatures(pagePath)
      ? getFeatures(pagePath).map(f => f.id)
      : ['__all__'];
  }

  if (!hasSubFeatures(pagePath)) {
    return checkLocalPermission(pagePath).granted ? ['__all__'] : [];
  }

  // Multi-feature page: check each feature independently
  return getFeatures(pagePath)
    .filter(f => checkFeatureAccess(pagePath, f.id))
    .map(f => f.id);
}

/**
 * Is a specific feature locked for the current user?
 * @param {string} pagePath
 * @param {string} featureId
 * @returns {boolean}
 */
export function isFeatureLocked(pagePath, featureId) {
  return !checkFeatureAccess(pagePath, featureId);
}