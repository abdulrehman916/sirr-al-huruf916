// ═══════════════════════════════════════════════════════════════
// RBAC — Role-Based Access Control layer
// Built ON TOP of the existing access system (PageVisibilityConfig,
// AdminProfile flags, AccessCode/reading-code permissions, ProtectedPage).
// This module is READ-ONLY logic. It NEVER modifies Mizan calculations,
// Astro Clock, Ritual Engine, or any existing business logic.
//
// Roles (identified via AdminProfile flags):
//   owner    = AdminProfile.is_owner === true (or OWNER_EMAIL safety net)
//   admin    = AdminProfile active, is_owner false.
//             Shop Management is an ADDITIONAL PERMISSION (perm_shop_management)
//             layered onto an Admin — NOT a separate role/account. An Admin with
//             that flag keeps role 'admin' and additionally gains Shop routes.
//   customer = no admin profile / role === 'user'
//   guest    = not authenticated
//
// The SHOP_ADMIN constant is retained for backward compatibility only.
// ═══════════════════════════════════════════════════════════════
import { ADMIN_CONFIG } from "@/lib/adminConfig";

export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  SHOP_ADMIN: "shop_admin",
  CUSTOMER: "customer",
  GUEST: "guest",
};

export function isAdminRole(role) {
  return role === ROLES.OWNER || role === ROLES.ADMIN;
}

// Resolve role from platform user + AdminProfile record.
export function resolveRole(user, adminProfile) {
  if (!user) return ROLES.GUEST;
  // Owner email safety net — guarantees the owner is never locked out,
  // even before the AdminProfile record is bootstrapped.
  if (user.email && ADMIN_CONFIG.OWNER_EMAIL &&
      user.email.toLowerCase() === String(ADMIN_CONFIG.OWNER_EMAIL).toLowerCase()) {
    return ROLES.OWNER;
  }
  if (user.role !== "admin") return ROLES.CUSTOMER;
  if (!adminProfile) return ROLES.CUSTOMER;
  if (adminProfile.is_owner === true) return ROLES.OWNER;
  if (adminProfile.status !== "ACTIVE") return ROLES.CUSTOMER;
  // Shop Management is an additional permission on an Admin, not a separate role.
  // An Admin with perm_shop_management stays 'admin' and additionally gains the
  // Shop routes (see ROUTE_ACCESS perm gating below).
  return ROLES.ADMIN;
}

// ── Admin route access matrix ──────────────────────────────────
// roles: which admin roles may access (owner always allowed).
// perm: optional AdminProfile flag required for the 'admin' role.
export const ROUTE_ACCESS = {
  // ── Owner + Admin (each gated by an individual permission flag) ──
  // Owner always passes (canAccessAdminRoute short-circuits for owner).
  // Admin only when the matching perm_* flag is true on their AdminProfile.
  "/admin/admins":               { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_admin_management" },
  "/admin/page-permissions":      { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_page_permissions" },
  "/admin/access-logs":          { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_analytics" },
  "/admin/analytics":            { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_analytics" },
  "/admin/settings":             { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_system_settings" },
  "/admin/system-settings":      { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_system_settings" },
  "/admin/pdf-content-editor":    { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_pdf_editor" },
  "/admin/holy-names-translator": { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_holy_names_translator" },
  "/admin/feature-pricing":       { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_feature_pricing" },
  "/admin/access-codes":          { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_access_codes" },
  "/admin/access-codes/:codeId":  { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_access_codes" },
  "/admin/google-linked":         { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_access_codes" },
  "/admin/shop":                  { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_shop_management" },
  "/admin/products":              { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_product_management" },
  "/admin/approved-users":        { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_customer_management" },
  "/admin/access-requests":       { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_access_requests" },
  "/admin/redeem-approvals":      { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_redeem_code_approval" },
  "/admin/support":               { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_support_messages" },
  "/admin/user/:userId":          { roles: [ROLES.OWNER, ROLES.ADMIN], perm: "perm_customer_management" },
  // Dashboard — accessible to every admin (no perm flag required)
  "/admin/access-dashboard":      { roles: [ROLES.OWNER, ROLES.ADMIN] },
  // Owner publishing studios. These are intentionally owner-only: customers
  // and delegated admins must never create, upload, price or publish content.
  "/admin/content-studio":        { roles: [ROLES.OWNER] },
  "/admin/books-studio":          { roles: [ROLES.OWNER] },
  "/admin/resource-studio":       { roles: [ROLES.OWNER] },
  // Owner Audit Log — append-only trail; owner-only (the complete log must never
  // be visible to non-owners, so the admin role is intentionally omitted here;
  // the getOwnerAuditLog backend function also enforces owner-only server-side).
  "/admin/audit-log":             { roles: [ROLES.OWNER] },
  // Purpose Dictionary Manager — Owner-only (admin-only backend lookup database
  // for the 7th Mizan). NOT part of any calculation. Pure management surface.
  "/admin/purpose-dictionary":    { roles: [ROLES.OWNER] },
  // Master PDF Library — Owner-only private research workspace. Single source of
  // truth for all project knowledge. NEVER visible to admins/users/guests. Backend
  // functions (searchGoogleDrivePdfs, searchOneDrivePdfs, searchAdobeCloudPdfs) also
  // enforce Owner-only server-side. Entity RLS is admin-only as a second layer.
  "/admin/master-pdf-library":   { roles: [ROLES.OWNER] },
  // Owner Review & Approval — the mandatory gate between the processing
  // pipeline and the knowledge base. Only the Owner may approve knowledge.
  // Approved pages are the ONLY pages that ever reach Holy Names / Sections
  // A·B·C / Abjad / Bast / Wafq / Vefk / Mizan / Khadim / Astrology.
  "/admin/pending-reviews":      { roles: [ROLES.OWNER] },
  // Unified Knowledge Search — Owner-only permanent knowledge gateway.
  // Searches Google Drive + OneDrive + Adobe + Uploaded PDFs + Master
  // PDF Library simultaneously; AI compares all books before results.
  // All future modules obtain knowledge only through this engine.
  "/admin/knowledge-search":     { roles: [ROLES.OWNER] },
  // Astro Clock Library Status — Owner-only dashboard (Knowledge Management).
  "/admin/astro-library-status":  { roles: [ROLES.OWNER] },
  // Owner Approval Queue — READ-ONLY review of flagged Western-source Astro
  // Clock records (Knowledge Management). Owner-only.
  "/admin/astro-approval-queue":  { roles: [ROLES.OWNER] },
};

// Match a concrete path against ROUTE_ACCESS patterns (supports :param).
export function matchAdminRoute(path) {
  for (const pattern of Object.keys(ROUTE_ACCESS)) {
    if (pattern.indexOf(":") === -1) {
      if (path === pattern) return { pattern, ...ROUTE_ACCESS[pattern] };
    } else {
      const re = new RegExp("^" + pattern.replace(/:[^/]+/g, "[^/]+") + "$");
      if (re.test(path)) return { pattern, ...ROUTE_ACCESS[pattern] };
    }
  }
  return null;
}

// ── Owner-only development lock ─────────────────────────────────
// All development surfaces are HARD-LOCKED to the Owner. No Admin
// permission flag can ever grant access. Development is performed only
// through the Base44 builder using the Owner account.
// Locked surfaces: source code, pages, components, layouts, navigation,
// routes, DB schema, functions, workflows, settings, deployments,
// builder, and developer tools. This list is defensive — none of these
// routes exist in the runtime app (there is no in-app code/page/builder
// editor); any future path under these prefixes is denied to non-owners.
export const DEVELOPER_LOCKED_PREFIXES = [
  "/dev", "/builder", "/admin/developer", "/admin/code", "/admin/source",
  "/admin/schema", "/admin/db", "/admin/functions", "/admin/workflows",
  "/admin/deploy", "/admin/deployment", "/admin/build", "/admin/settings/dev",
];

export function isDeveloperLockedPath(path) {
  return DEVELOPER_LOCKED_PREFIXES.some(
    (p) => path === p || path.startsWith(p + "/")
  );
}

// Can the given role access an admin route?
export function canAccessAdminRoute(role, path, adminProfile) {
  // Hard developer lock — owner-only, no permission override possible.
  if (isDeveloperLockedPath(path)) return role === ROLES.OWNER;

  const rule = matchAdminRoute(path);
  if (!rule) {
    // Unlisted /admin route — default owner-only (strict).
    return role === ROLES.OWNER;
  }
  if (role === ROLES.OWNER) return true;
  if (!rule.roles.includes(role)) return false;
  if (role === ROLES.ADMIN && rule.perm) {
    return adminProfile ? adminProfile[rule.perm] === true : false;
  }
  return true;
}

// Landing admin path per role. (Shop Management is a permission, not a role,
// so every admin lands on the general dashboard; shop is reachable via nav/sidebar.)
export function getAdminHomePath(role) {
  return "/admin/access-dashboard";
}

// Top-nav tab visibility (PageLayout TAB_KEYS ids).
// Content tabs are visible to all roles (gated by reading codes downstream).
// 'admin-shop' tab is visible to the owner, and to an Admin only when that
// Admin has been granted the shop-management permission (perm_shop_management).
export function isNavTabVisible(tabId, role, adminProfile) {
  if (tabId !== "admin-shop") return true;
  if (role === ROLES.OWNER) return true;
  if (role === ROLES.ADMIN) return adminProfile ? adminProfile.perm_shop_management === true : false;
  return false;
}

// Filter admin sidebar sections for the role.
// sections: array of { label, items: [{path, label, icon}] }
export function filterAdminSections(sections, role, adminProfile) {
  if (role === ROLES.OWNER) return sections;
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canAccessAdminRoute(role, item.path, adminProfile)),
    }))
    .filter((section) => section.items.length > 0);
}
