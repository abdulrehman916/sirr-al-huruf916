import { supabase } from '@/api/base44Client';

const titleFor = (resource) => (
  resource?.title?.ml || resource?.title?.en || resource?.title?.ar || resource?.slug || ''
);

export async function resolveUnifiedPageAccess(pagePath, { isAuthenticated = false } = {}) {
  if (!supabase || !pagePath) return { managed: false, allowed: false, resource: null };

  const { data: resource, error } = await supabase
    .from('resources')
    .select('id,slug,resource_type,title,status,access_mode,price_minor,currency,validity_days,lifetime_access,metadata')
    .eq('status', 'PUBLISHED')
    .eq('metadata->>route_path', pagePath)
    .maybeSingle();

  if (error) throw error;
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
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
