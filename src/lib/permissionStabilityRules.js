/**
 * PERMISSION STABILITY RULES - PERMANENT CONFIGURATION
 * 
 * These rules ensure page visibility settings are NEVER automatically reset.
 * All settings persist across deployments, updates, and restarts.
 * 
 * LOCKED PAGES: Cannot be changed by bulk operations (e.g., Home, Customer Service)
 * STABLE PAGES: Can be changed manually but persist permanently
 */

export const PERMISSION_STABILITY_RULES = {
  // Disable ALL automatic resets
  DISABLE_AUTOMATIC_RESET: true,
  
  // Disable AI-generated permission overwrites
  DISABLE_AI_OVERWRITE: true,
  
  // Disable migration/sync operations
  DISABLE_MIGRATION_SYNC: true,
  
  // Settings survive deployments
  PERSIST_ACROSS_DEPLOYMENTS: true,
  
  // Settings survive restarts
  PERSIST_ACROSS_RESTARTS: true,
};

/**
 * MASTER PAGE REGISTRY - PERMANENT RECORD
 * 
 * This is the authoritative source for all pages and their visibility preferences.
 * Changes here are PERMANENT and require manual admin/owner action.
 */
export const MASTER_PAGE_REGISTRY = [
  // === LOCKED PUBLIC PAGES (Never change automatically) ===
  {
    path: "/",
    name: "Home",
    defaultPublic: true,
    locked: true,
    lockedReason: "Primary landing page - must remain public",
    canChangeViaUI: false
  },
  {
    path: "/customer-service",
    name: "Customer Service",
    defaultPublic: true,
    locked: true,
    lockedReason: "Support access - must remain public",
    canChangeViaUI: false
  },
  {
    path: "/otp-login",
    name: "OTP Login",
    defaultPublic: true,
    locked: true,
    lockedReason: "Authentication entry point - must remain public",
    canChangeViaUI: false
  },
  
  // === UNLOCKED PUBLIC PAGES (Can be changed manually) ===
  {
    path: "/plants",
    name: "Plants",
    defaultPublic: true,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/subscription-expired",
    name: "Subscription Expired",
    defaultPublic: true,
    locked: false,
    canChangeViaUI: true
  },
  
  // === PRIVATE PAGES (Premium Content) ===
  {
    path: "/abjad",
    name: "Abjad Kabir",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/anasir",
    name: "Anasir",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/hadim",
    name: "Hadim",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/mizaan9",
    name: "Mizan 9",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/magic-sqayer",
    name: "Magic Sqayer",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/vefkin-yapilisi",
    name: "Vefkin Yapilisi",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/basthul-huroof-2",
    name: "Basthul Huroof",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/faal-hasrath",
    name: "Faal Hasrath",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/evil-jinn",
    name: "Evil Jinn",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/holy-names",
    name: "Holy Names",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  {
    path: "/astro-clock",
    name: "Astro Clock",
    defaultPublic: false,
    locked: false,
    canChangeViaUI: true
  },
  
  // === ADMIN PAGES (Admin/Owner Only) ===
  {
    path: "/admin/dashboard",
    name: "Admin Dashboard",
    defaultPublic: false,
    locked: true,
    lockedReason: "Admin control panel",
    adminOnly: true
  },
  {
    path: "/admin/permissions",
    name: "Permission Management",
    defaultPublic: false,
    locked: true,
    lockedReason: "Admin control panel",
    adminOnly: true
  },
  {
    path: "/admin/page-permissions",
    name: "Page Permissions",
    defaultPublic: false,
    locked: true,
    lockedReason: "Admin control panel",
    adminOnly: true
  },
  {
    path: "/admin/user-management",
    name: "User Management",
    defaultPublic: false,
    locked: true,
    lockedReason: "Admin control panel",
    adminOnly: true
  },
  {
    path: "/admin/access-logs",
    name: "Access Logs",
    defaultPublic: false,
    locked: true,
    lockedReason: "Admin control panel",
    adminOnly: true
  },
  {
    path: "/admin/pricing-settings",
    name: "Pricing Settings",
    defaultPublic: false,
    locked: true,
    lockedReason: "Admin control panel",
    adminOnly: true
  },
  {
    path: "/admin/subscription-requests",
    name: "Subscription Requests",
    defaultPublic: false,
    locked: true,
    lockedReason: "Admin control panel",
    adminOnly: true
  }
];

/**
 * Array of locked page paths (for quick lookup)
 */
export const LOCKED_PAGES = MASTER_PAGE_REGISTRY
  .filter(page => page.locked)
  .map(page => page.path);

/**
 * Get page config by path
 */
export const getPageConfig = (path) => {
  return MASTER_PAGE_REGISTRY.find(page => page.path === path) || null;
};

/**
 * Get all public pages
 */
export const getPublicPages = () => {
  return MASTER_PAGE_REGISTRY.filter(page => page.defaultPublic && !page.adminOnly);
};

/**
 * Get all private pages
 */
export const getPrivatePages = () => {
  return MASTER_PAGE_REGISTRY.filter(page => !page.defaultPublic && !page.adminOnly);
};

/**
 * Get locked pages
 */
export const getLockedPages = () => {
  return MASTER_PAGE_REGISTRY.filter(page => page.locked);
};

/**
 * Check if a page is locked
 */
export const isPageLocked = (path) => {
  const config = getPageConfig(path);
  return config?.locked || false;
};