/**
 * Admin permission definitions and helpers.
 * Used by AdminAdmins page, AdminFormModal, AdminDetailPanel.
 *
 * The Owner always has EVERY permission (enforced in hasPermission via is_owner,
 * and in rbac.canAccessAdminRoute which returns true for the owner role before
 * any perm flag check). These toggles only apply to non-owner Admins.
 *
 * Each permission maps 1:1 to a `perm_*` boolean field on AdminProfile and to a
 * `perm` key in rbac.ROUTE_ACCESS.
 */

export const ADMIN_PERMISSIONS = [
  { key: "perm_customer_management",   shortKey: "customer_management",   label: "User Management",        description: "View and manage assigned customers",                  icon: "👥" },
  { key: "perm_access_requests",       shortKey: "access_requests",       label: "Access Requests",         description: "View and process access requests",                    icon: "📝" },
  { key: "perm_access_codes",          shortKey: "access_codes",           label: "Access Codes",            description: "Create, edit, renew, and reset reading codes",         icon: "🔑" },
  { key: "perm_redeem_code_approval",  shortKey: "redeem_code_approval",  label: "Redeem Approvals",        description: "Verify payment and approve pending redeem codes",      icon: "✅" },
  { key: "perm_support_messages",      shortKey: "support_messages",      label: "Support Messages",        description: "View and reply to support messages",                  icon: "💬" },
  { key: "perm_analytics",             shortKey: "analytics",             label: "Analytics",               description: "View access logs, analytics, and audit reports",       icon: "📊" },
  { key: "perm_pdf_editor",            shortKey: "pdf_editor",            label: "PDF Editor",               description: "Edit PDF content (manuscript ingestion source)",       icon: "📄" },
  { key: "perm_holy_names_translator", shortKey: "holy_names_translator", label: "Holy Names Translator",   description: "Translate and manage Divine Names content",            icon: "📜" },
  { key: "perm_feature_pricing",       shortKey: "feature_pricing",       label: "Feature Pricing",         description: "Configure page and feature subscription pricing",      icon: "💰" },
  { key: "perm_shop_management",       shortKey: "shop_management",       label: "Shop Management",          description: "Manage shop dashboard, orders, and reports",          icon: "🏪" },
  { key: "perm_product_management",   shortKey: "product_management",   label: "Product Management",       description: "Create, edit, and manage shop products and inventory", icon: "📦" },
  { key: "perm_system_settings",       shortKey: "system_settings",       label: "System Settings",          description: "Configure system-wide settings",                       icon: "⚙️" },
  { key: "perm_page_permissions",      shortKey: "page_permissions",      label: "Page Permissions",         description: "Configure page visibility and access control",         icon: "🌐" },
  { key: "perm_admin_management",      shortKey: "admin_management",      label: "Admin Management",         description: "Add, edit, disable, and manage admin accounts",        icon: "🛡️" },
];

// Capabilities a non-owner Admin can NEVER receive, regardless of toggles.
// (Kept empty by design — every admin capability is now individually grantable.
//  The Owner-only constraint is enforced in rbac.ROUTE_ACCESS where a route's
//  `roles` array intentionally omits the admin role.)
export const ADMIN_FORBIDDEN = [];

export function hasPermission(profile, permKey) {
  if (!profile) return false;
  if (profile.is_owner) return true;
  return profile[permKey] === true;
}

export function isAdminActive(profile) {
  return profile?.status === "ACTIVE";
}

export function getEnabledPermissions(profile) {
  return ADMIN_PERMISSIONS.filter(
    (p) => profile?.is_owner || profile?.[p.key] === true
  );
}