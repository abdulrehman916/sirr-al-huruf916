// Preserve independent grants when several codes cover one page.
export function mergePermissionGrants(grants = []) {
  const pages = new Map();
  for (const grant of grants) {
    if (!grant.page_path) continue;
    let page = pages.get(grant.page_path);
    if (!page) { page = { ...grant, grants: [], sub_features: [] }; pages.set(grant.page_path, page); }
    page.grants.push(grant);
    page.sub_features = [...new Set([...page.sub_features, ...(grant.sub_features || [])])];
    if (!page.expiry_date || !grant.expiry_date) page.expiry_date = null;
    else if (new Date(grant.expiry_date) > new Date(page.expiry_date)) page.expiry_date = grant.expiry_date;
  }
  return [...pages.values()];
}

export function featureGrantActive(grant, featureId, now = Date.now()) {
  if (grant.expiry_date && new Date(grant.expiry_date).getTime() <= now) return false;
  if (grant.sub_features?.length && !grant.sub_features.includes(featureId)) return false;
  const feature = grant.feature_expiries?.[featureId];
  return !feature?.expiry_date || new Date(feature.expiry_date).getTime() > now;
}
