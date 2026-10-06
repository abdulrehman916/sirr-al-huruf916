/**
 * Module Sync — Automatic Feature/Method/Section Registration
 *
 * Synchronizes modules from moduleManifest (source of truth) to FeatureConfig
 * database records. Ensures every feature/method/section/tool automatically
 * appears in:
 *   - Admin → Page Access feature selectors
 *   - Access Code feature selection (CreateCodeForm)
 *   - Redeem Approval feature selectors
 *   - Any feature selector using FeatureConfig
 *
 * Safe operations only — never overwrites admin-configured fields, never deletes
 * records (deactivates instead). See syncModuleRegistry backend function for details.
 *
 * Usage:
 *   import { syncModules } from '@/lib/moduleSync';
 *   await syncModules(); // fire-and-forget on app load
 */

import { base44 } from '@/api/base44Client';
import { MODULE_DEFINITIONS } from '@/lib/moduleManifest';

// Build flat module list for backend sync (inlined — no separate registry file needed)
function buildModuleSyncList() {
  const list = [];
  for (const [pagePath, def] of Object.entries(MODULE_DEFINITIONS)) {
    for (const mod of def.modules) {
      list.push({
        page_path: pagePath,
        page_name: def.pageName,
        module_id: mod.id,
        module_name: mod.label,
        module_type: mod.module_type || 'FEATURE',
        icon: mod.icon || '',
        sort_order: mod.sort_order || 0,
      });
    }
  }
  return list;
}

let syncInProgress = false;
let lastSyncResult = null;
let lastSyncAt = null;

/**
 * Sync modules to FeatureConfig database.
 * Fire-and-forget safe: never throws, returns result object.
 *
 * @param {boolean} force - Force sync even if one is in progress
 * @returns {Promise<object>} Sync result { success, created, updated, deactivated, reactivated, unchanged }
 */
export async function syncModules(force = false) {
  if (syncInProgress && !force) {
    return { success: false, skipped: true, reason: 'sync_in_progress' };
  }

  try {
    syncInProgress = true;
    const modules = buildModuleSyncList();

    if (modules.length === 0) {
      lastSyncResult = {
        success: true,
        created: 0,
        updated: 0,
        deactivated: 0,
        reactivated: 0,
        unchanged: 0,
        total: 0,
      };
      lastSyncAt = new Date().toISOString();
      return lastSyncResult;
    }

    const response = await base44.functions.invoke('syncModuleRegistry', {
      modules,
    });
    const data = response?.data || response;

    lastSyncResult = {
      success: data?.success !== false,
      created: data?.created || 0,
      updated: data?.updated || 0,
      deactivated: data?.deactivated || 0,
      reactivated: data?.reactivated || 0,
      unchanged: data?.unchanged || 0,
      total: data?.total_modules || modules.length,
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
export function getLastModuleSyncResult() {
  return { result: lastSyncResult, timestamp: lastSyncAt };
}

/**
 * Check if a sync is currently in progress.
 * @returns {boolean}
 */
export function isModuleSyncInProgress() {
  return syncInProgress;
}