/**
 * Feature Registry — Re-exports from the central Module Manifest.
 *
 * This file preserves backward compatibility. All feature/module definitions
 * now live in moduleManifest.js (the single source of truth).
 *
 * Adding a new feature/method/section/tool: edit moduleManifest.js only.
 * This file's API (FEATURE_REGISTRY, getFeatures, hasSubFeatures, etc.)
 * remains unchanged — all existing imports continue to work identically.
 */

import { FEATURE_REGISTRY } from '@/lib/moduleManifest';

// Re-export for backward compatibility
export { FEATURE_REGISTRY };

/**
 * Get all sub-features for a page.
 * @param {string} pagePath
 * @returns {array} Array of { id, label, icon, ... } or empty array
 */
export function getFeatures(pagePath) {
  return FEATURE_REGISTRY[pagePath]?.features || [];
}

/**
 * Does this page have sub-features (multi-feature page)?
 * @param {string} pagePath
 * @returns {boolean}
 */
export function hasSubFeatures(pagePath) {
  return (FEATURE_REGISTRY[pagePath]?.features?.length || 0) > 0;
}

/**
 * Get a single feature by its ID.
 * @param {string} pagePath
 * @param {string} featureId
 * @returns {object|null}
 */
export function getFeatureById(pagePath, featureId) {
  return getFeatures(pagePath).find(f => f.id === featureId) || null;
}

/**
 * Get all multi-feature page paths (for admin panel).
 * @returns {array} Array of page paths
 */
export function getMultiFeaturePagePaths() {
  return Object.keys(FEATURE_REGISTRY);
}