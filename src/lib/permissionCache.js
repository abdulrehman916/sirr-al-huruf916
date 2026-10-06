import { base44 } from '../api/base44Client';

// Permission cache with TTL (30 seconds for faster role updates)
const CACHE_TTL = 30000;
const permissionCache = new Map();

// Generic cache for access checks and visibility
const genericCache = new Map();

export function getCached(key) {
  const cached = genericCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value;
  }
  return null;
}

export function setCached(key, value, ttl = CACHE_TTL) {
  genericCache.set(key, {
    value,
    timestamp: Date.now()
  });
}

export function accessCheckKey(userId, pagePath) {
  return `access:${userId}:${pagePath}`;
}

export function visibilityKey(pagePath) {
  return `visibility:${pagePath}`;
}

export function getCachedPermissions(userId) {
  const cached = permissionCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.permissions;
  }
  return null;
}

export async function refreshPermissionCache(userId) {
  try {
    const permissions = await base44.entities.PagePermission.filter({ user_id: userId, is_active: true, is_revoked: false });
    permissionCache.set(userId, {
      permissions,
      timestamp: Date.now()
    });
    return permissions;
  } catch (error) {
    console.error('[PermissionCache] Failed to refresh:', error);
    return [];
  }
}

export function clearPermissionCache(userId) {
  if (userId) {
    permissionCache.delete(userId);
  } else {
    permissionCache.clear();
  }
}

/**
 * Alias for clearPermissionCache - clears all caches (permission + generic)
 */
export function clearAllCache() {
  permissionCache.clear();
  genericCache.clear();
}

export function hasPagePermission(userId, pagePath, cachedPermissions = null) {
  const permissions = cachedPermissions || getCachedPermissions(userId);
  if (!permissions) return false;
  
  return permissions.some(p => 
    p.page_path === pagePath && 
    p.is_active && 
    !p.is_revoked &&
    new Date(p.expiry_date) > new Date()
  );
}