/**
 * Backward-compatibility re-export from the dynamic page registry.
 * All new code should import from '@/lib/pageRegistry' directly.
 */

import { getAllRegisteredPages, getPageConfig, derivePermissionCode } from '@/lib/pageRegistry';

// Build ROUTE_PERMISSION_MAP dynamically from the registry
const _map = {};
getAllRegisteredPages().forEach(p => {
  _map[p.path] = {
    code: p.code,
    name: p.name,
    requiresPermission: p.requiresPermission,
    adminOnly: p.adminOnly || false,
  };
});

export const ROUTE_PERMISSION_MAP = _map;

// Build PERMISSION_CODES dynamically
export const PERMISSION_CODES = {};
getAllRegisteredPages().forEach(p => {
  const key = p.path.replace(/^\//, '').replace(/\/$/, '').replace(/[\/\-:]/g, '_').toUpperCase() + '_ACCESS';
  PERMISSION_CODES[key] = p.code || derivePermissionCode(p.path);
});

/**
 * Get permission config for a route path
 */
export const getPermissionForRoute = (pathname) => {
  const config = getPageConfig(pathname);
  if (!config || !config.name) return null;
  return {
    code: config.code,
    name: config.name,
    requiresPermission: config.requiresPermission,
    adminOnly: config.adminOnly || false,
  };
};