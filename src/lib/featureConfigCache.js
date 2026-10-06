/**
 * Feature Config Cache — fetches and caches FeatureConfig entries from the database.
 * Used by FeatureLockedCard to display dynamic pricing/descriptions,
 * and by featurePermission.js to check feature-level requires_permission synchronously.
 *
 * Two cache layers:
 *   1. Async cache (permissionCache.js) — TTL 2 min, used by FeatureLockedCard.
 *   2. Sync in-memory cache (_syncCache) — populated by preloadPageFeatureConfigs(),
 *      read synchronously by checkFeatureAccess() during page render.
 *
 * Cache TTL: 2 minutes (120000ms) — balances freshness with performance.
 */
import { base44 } from "@/api/base44Client";
import { getCached, setCached } from "@/lib/permissionCache";

const CACHE_TTL = 120000; // 2 minutes
const CACHE_PREFIX = "feature_config";

// ── Sync in-memory cache for requires_permission ──
// Key: "pagePath:featureId" → boolean (true = Premium, false = Public)
const _syncCache = new Map();

/**
 * Synchronously read the requires_permission flag for a feature.
 * @returns {boolean|undefined} true=Premium, false=Public, undefined=not loaded yet
 */
export function getCachedFeaturePermission(pagePath, featureId) {
  return _syncCache.get(`${pagePath}:${featureId}`);
}

/**
 * Synchronously set the requires_permission flag for a feature.
 */
export function setCachedFeaturePermission(pagePath, featureId, requiresPermission) {
  _syncCache.set(`${pagePath}:${featureId}`, !!requiresPermission);
}

/**
 * Preload all FeatureConfig entries for a page into the sync cache.
 * Called by ProtectedPage before rendering multi-feature container pages.
 * @param {string} pagePath
 */
export async function preloadPageFeatureConfigs(pagePath) {
  try {
    const results = await base44.entities.FeatureConfig.filter(
      { page_path: pagePath, is_active: true },
      "sort_order",
      50
    );
    (results || []).forEach(c => {
      setCachedFeaturePermission(c.page_path, c.feature_id, c.requires_permission !== false);
    });
    // Also populate the async "all" cache
    setCached(`${CACHE_PREFIX}:${pagePath}:all`, results || [], CACHE_TTL);
  } catch {
    // If fetch fails, sync cache stays empty — features default to Premium
  }
}

/**
 * Fetch a single feature config from DB (with async cache).
 * Also populates the sync cache as a side effect.
 * @param {string} pagePath — e.g. '/abjad'
 * @param {string} featureId — e.g. 'abjad_kabir'
 * @returns {Promise<object|null>} FeatureConfig record or null
 */
export async function getFeatureConfig(pagePath, featureId) {
  const cacheKey = `${CACHE_PREFIX}:${pagePath}:${featureId}`;
  const cached = getCached(cacheKey);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  try {
    const results = await base44.entities.FeatureConfig.filter(
      { page_path: pagePath, feature_id: featureId, is_active: true },
      null,
      1
    );
    const config = results && results.length > 0 ? results[0] : null;
    setCached(cacheKey, config, CACHE_TTL);
    if (config) {
      setCachedFeaturePermission(pagePath, featureId, config.requires_permission !== false);
    }
    return config;
  } catch {
    return null;
  }
}

/**
 * Fetch all feature configs for a page (with async cache).
 * Also populates the sync cache as a side effect.
 * @param {string} pagePath
 * @returns {Promise<array>} Array of FeatureConfig records
 */
export async function getPageFeatureConfigs(pagePath) {
  const cacheKey = `${CACHE_PREFIX}:${pagePath}:all`;
  const cached = getCached(cacheKey);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  try {
    const results = await base44.entities.FeatureConfig.filter(
      { page_path: pagePath, is_active: true },
      "sort_order",
      50
    );
    setCached(cacheKey, results || [], CACHE_TTL);
    (results || []).forEach(c => {
      setCachedFeaturePermission(c.page_path, c.feature_id, c.requires_permission !== false);
    });
    return results || [];
  } catch {
    return [];
  }
}

/**
 * Invalidate cache for a specific feature or page (called after admin updates).
 * @param {string} pagePath
 * @param {string} [featureId] — if omitted, invalidates all configs for the page
 */
export function invalidateFeatureConfigCache(pagePath, featureId) {
  if (featureId) {
    setCached(`${CACHE_PREFIX}:${pagePath}:${featureId}`, null, 1);
    _syncCache.delete(`${pagePath}:${featureId}`);
  }
  setCached(`${CACHE_PREFIX}:${pagePath}:all`, null, 1);
  // Clear all sync cache entries for this page
  for (const key of _syncCache.keys()) {
    if (key.startsWith(`${pagePath}:`)) {
      _syncCache.delete(key);
    }
  }
}