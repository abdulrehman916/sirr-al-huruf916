// ═══════════════════════════════════════════════════════════════
// Access roles — single-owner model.
//
// There is exactly one owner. Delegated admin / shop-admin roles have
// been retired everywhere (profiles only allow 'owner' and 'customer').
//   owner    = profile.role === 'owner'
//   customer = any other signed-in account
//   guest    = not signed in
// Every /admin/* (owner panel) route is owner-only.
// ═══════════════════════════════════════════════════════════════

export const ROLES = {
  OWNER: "owner",
  CUSTOMER: "customer",
  GUEST: "guest",
};

export function isOwnerRole(role) {
  return role === ROLES.OWNER;
}

// Kept as an alias so older call sites read naturally ("can open the owner panel").
export const isAdminRole = isOwnerRole;

export function resolveRole(user) {
  if (!user) return ROLES.GUEST;
  return user.role === ROLES.OWNER ? ROLES.OWNER : ROLES.CUSTOMER;
}

export function canAccessAdminRoute(role) {
  return role === ROLES.OWNER;
}

export function getAdminHomePath() {
  return "/admin/access-dashboard";
}

// Top navigation tabs: every content tab is visible; there is no separate
// shop-admin tab any more (shop management lives inside the owner panel).
export function isNavTabVisible() {
  return true;
}

export function filterAdminSections(sections, role) {
  return role === ROLES.OWNER ? sections : [];
}
