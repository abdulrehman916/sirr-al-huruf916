/**
 * Page Sync — Automatic Page Access Registration
 *
 * Synchronizes routes from routeManifest (source of truth) to PageVisibilityConfig
 * database records. Ensures every page automatically appears in:
 *   - Admin → Page Access (PagePermissions)
 *   - Access Code page selection (CreateCodeForm)
 *   - Redeem Approval
 *   - Customer Page Permissions
 *   - Any page selector using PageVisibilityConfig
 *
 * Safe operations only — never overwrites admin-configured fields, never deletes
 * records (archives instead). See syncPageVisibility backend function for details.
 *
 * Usage:
 *   import { syncPages } from '@/lib/pageSync';
 *   await syncPages(); // fire-and-forget on app load
 */

import { base44 } from '@/api/base44Client';
import { getContentPages } from '@/lib/pageRegistry';
import { FEATURE_REGISTRY } from '@/lib/featureRegistry';

let syncInProgress = false;
let lastSyncResult = null;
let lastSyncAt = null;

/**
 * Build the canonical route list from routeManifest (via pageRegistry) + FEATURE_REGISTRY.
 * This is the source of truth for what pages should exist in PageVisibilityConfig.
 * @returns {Array<{path, page_name, requires_permission, admin_only}>}
 */
function buildRouteList() {
  const routes = [];
  const seen = new Set();

  // 1. Content pages from pageRegistry (auto-registers from routeManifest)
  for (const page of getContentPages()) {
    if (seen.has(page.path)) continue;
    if (!page.name) continue; // skip pages without names (hidden sub-pages)
    seen.add(page.path);
    routes.push({
      path: page.path,
      page_name: page.name,
      requires_permission: page.requiresPermission !== false,
      admin_only: page.adminOnly || false,
    });
  }

  // 2. Multi-feature pages from FEATURE_REGISTRY (ensure they're included)
  for (const path of Object.keys(FEATURE_REGISTRY)) {
    if (seen.has(path)) continue;
    seen.add(path);
    routes.push({
      path,
      page_name: FEATURE_REGISTRY[path].pageName || path,
      requires_permission: true,
      admin_only: false,
    });
  }

  return routes;
}

/**
 * Sync pages to PageVisibilityConfig database.
 * Fire-and-forget safe: never throws, returns result object.
 *
 * @param {boolean} force - Force sync even if one is in progress
 * @returns {Promise<object>} Sync result { success, created, updated, archived, unchanged }
 */
export async function syncPages(force = false) {
  if (syncInProgress && !force) {
    return { success: false, skipped: true, reason: 'sync_in_progress' };
  }

  try {
    syncInProgress = true;
    const routes = buildRouteList();

    if (routes.length === 0) {
      lastSyncResult = {
        success: true,
        created: 0,
        updated: 0,
        archived: 0,
        unchanged: 0,
        total: 0,
      };
      lastSyncAt = new Date().toISOString();
      return lastSyncResult;
    }

    const response = await base44.functions.invoke('syncPageVisibility', {
      routes,
    });
    const data = response?.data || response;

    lastSyncResult = {
      success: data?.success !== false,
      created: data?.created || 0,
      updated: data?.updated || 0,
      archived: data?.archived || 0,
      unchanged: data?.unchanged || 0,
      total: data?.total_routes || routes.length,
    };
    lastSyncAt = new Date().toISOString();
    return lastSyncResult;
  } catch (error) {
    lastSyncResult = { success: false, error: error.message };
    lastSyncAt = new Date().toISOString();
    return lastSyncResult;
  } finally {
    syncInProgress = false;
  }
}

/**
 * Get the last sync result (for UI display).
 * @returns {{result: object|null, timestamp: string|null}}
 */
export function getLastSyncResult() {
  return { result: lastSyncResult, timestamp: lastSyncAt };
}

/**
 * Check if a sync is currently in progress.
 * @returns {boolean}
 */
export function isSyncInProgress() {
  return syncInProgress;
}