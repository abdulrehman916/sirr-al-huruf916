import { supabase } from '@/api/platformClient';

const titleFor = (resource) => (
  resource?.title?.ml || resource?.title?.en || resource?.title?.ar || resource?.slug || ''
);

const RESOURCE_COLUMNS = 'id,slug,resource_type,title,status,access_mode,price_minor,currency,validity_days,lifetime_access,metadata';

/** '/plants/:id' is covered by the '/plants' price; static child routes are priced separately. */
export function priceLookupPaths(pagePath) {
  const paths = [pagePath];
  const index = pagePath.indexOf('/:');
  if (index > 0) paths.push(pagePath.slice(0, index));
  return paths;
}

export async function findPublishedResource(pagePath) {
  for (const path of priceLookupPaths(pagePath)) {
    const { data, error } = await supabase
      .from('resources')
      .select(RESOURCE_COLUMNS)
      .eq('status', 'PUBLISHED')
      .eq('metadata->>route_path', path)
      .order('updated_at', { ascending: false })
      .limit(1);
    if (error) throw error;
    if (data?.[0]) return data[0];
  }
  return null;
}

/**
 * When the signed-in customer's purchased access for a resource ends.
 * Returns null for lifetime/none; used only to re-lock an open page on time.
 */
export async function purchasedAccessEndsAt(resourceId) {
  if (!supabase || !resourceId) return null;
  const { data, error } = await supabase
    .from('entitlements')
    .select('expires_at')
    .eq('resource_id', resourceId)
    .is('revoked_at', null)
    .order('expires_at', { ascending: false, nullsFirst: true })
    .limit(1);
  if (error || !data?.[0]) return null;
  return data[0].expires_at || null;
}

export async function resolveUnifiedPageAccess(pagePath, { isAuthenticated = false } = {}) {
  if (!supabase || !pagePath) return { managed: false, allowed: false, resource: null };

  const resource = await findPublishedResource(pagePath);
  if (!resource) return { managed: false, allowed: false, resource: null };

  if (resource.access_mode === 'FREE') {
    return { managed: true, allowed: true, reason: 'FREE', resource, title: titleFor(resource) };
  }
  if (resource.access_mode === 'LOGIN') {
    return {
      managed: true,
      allowed: Boolean(isAuthenticated),
      reason: isAuthenticated ? 'LOGIN' : 'LOGIN_REQUIRED',
      resource,
      title: titleFor(resource),
    };
  }

  if (!isAuthenticated) {
    return { managed: true, allowed: false, reason: 'LOGIN_REQUIRED', resource, title: titleFor(resource) };
  }

  const { data: allowed, error: accessError } = await supabase.rpc('can_access_resource', { target: resource.id });
  if (accessError) throw accessError;
  return {
    managed: true,
    allowed: allowed === true,
    reason: allowed === true ? 'ENTITLEMENT' : 'PURCHASE_REQUIRED',
    resource,
    title: titleFor(resource),
  };
}

export function formatResourcePrice(resource) {
  const amount = Number(resource?.price_minor || 0) / 100;
  const currency = resource?.currency || 'INR';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
