/** Independent Sirr al-Huruf platform client backed by Supabase. */
import { createClient } from '@supabase/supabase-js';
import { toRecord, byRecordId } from './recordIdentity';
import { createReferenceResolver } from './privateReferenceAssets';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const configured = Boolean(url && anonKey);

export const supabase = configured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

const client = () => {
  if (!supabase) throw new Error('Independent backend is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  return supabase;
};
const unwrap = ({ data, error }) => { if (error) throw error; return data; };
const references = createReferenceResolver(client);
supabase?.auth.onAuthStateChange(() => references.clear());
const hydrateRecord = (row) => references.resolve(toRecord(row));
const sortQuery = (query, sort) => {
  if (!sort) return query;
  const ascending = !String(sort).startsWith('-');
  const field = String(sort).replace(/^-/, '');
  const column = field === 'created_date' ? 'created_at' : field === 'updated_date' ? 'updated_at' : `data->>${field}`;
  return query.order(column, { ascending });
};

const entityApi = (entity) => ({
  async list(sort = null, limit = 100, skip = 0) {
    let query = client().from('platform_records').select('*').eq('entity', entity);
    query = sortQuery(query, sort).range(skip || 0, (skip || 0) + (limit || 100) - 1);
    return Promise.all(unwrap(await query).map(hydrateRecord));
  },
  async filter(filters = {}, sort = null, limit = 100, skip = 0) {
    let query = client().from('platform_records').select('*').eq('entity', entity);
    Object.entries(filters || {}).forEach(([key, value]) => {
      query = key === 'id' ? byRecordId(query, value) : query.eq(`data->>${key}`, String(value));
    });
    query = sortQuery(query, sort).range(skip || 0, (skip || 0) + (limit || 100) - 1);
    return Promise.all(unwrap(await query).map(hydrateRecord));
  },
  async get(id) {
    return hydrateRecord(unwrap(await byRecordId(client().from('platform_records').select('*').eq('entity', entity), id).maybeSingle()));
  },
  async create(data) {
    return hydrateRecord(unwrap(await client().from('platform_records').insert({ entity, data }).select().single()));
  },
  async update(id, data) {
    const current = unwrap(await byRecordId(client().from('platform_records').select('id,data').eq('entity', entity), id).single());
    const row = unwrap(await client().from('platform_records').update({ data: { ...(current?.data || {}), ...data } })
      .eq('entity', entity).eq('id', current.id).select().single());
    return hydrateRecord(row);
  },
  async delete(id) {
    unwrap(await byRecordId(client().from('platform_records').delete().eq('entity', entity), id));
    return { success: true };
  },
  async bulkCreate(rows = []) {
    if (!rows.length) return [];
    return Promise.all(unwrap(await client().from('platform_records').insert(rows.map((data) => ({ entity, data }))).select()).map(hydrateRecord));
  },
  async bulkUpdate(rows = []) {
    return Promise.all(rows.map((row) => { const { id, ...data } = row; return entityApi(entity).update(id, data); }));
  },
  async deleteMany(filters = {}) {
    let query = client().from('platform_records').delete().eq('entity', entity);
    Object.entries(filters || {}).forEach(([key, value]) => {
      query = key === 'id' ? byRecordId(query, value) : query.eq(`data->>${key}`, String(value));
    });
    unwrap(await query);
    return { success: true };
  },
  subscribe(callback) {
    const channel = client().channel(`records:${entity}:${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'platform_records', filter: `entity=eq.${entity}` },
        async (payload) => callback({ ...payload, data: await hydrateRecord(payload.new) }))
      .subscribe();
    return () => client().removeChannel(channel);
  },
});

const ACCESS_TO_DB = {
  PUBLIC: 'FREE',
  LOGIN: 'LOGIN',
  PREMIUM: 'PAID',
  PAID: 'PAID',
  SELECTED_CUSTOMERS: 'SELECTED',
};
const ACCESS_FROM_DB = {
  FREE: 'PUBLIC',
  LOGIN: 'LOGIN',
  PAID: 'PAID',
  COUPON: 'PREMIUM',
  SELECTED: 'SELECTED_CUSTOMERS',
};

const toManagedPage = (row) => row ? ({
  id: row.id,
  slug: row.slug,
  title_ml: row.title?.ml || '',
  title_en: row.title?.en || '',
  title_ar: row.title?.ar || '',
  excerpt_ml: row.summary?.ml || '',
  excerpt_en: row.summary?.en || '',
  excerpt_ar: row.summary?.ar || '',
  body_ml: row.body?.ml || '',
  body_en: row.body?.en || '',
  body_ar: row.body?.ar || '',
  status: row.status,
  access_mode: ACCESS_FROM_DB[row.access_mode] || 'PUBLIC',
  price_amount: Number(row.price_minor || 0) / 100,
  price_currency: row.currency || 'AED',
  validity_days: row.validity_days,
  lifetime_access: row.lifetime_access,
  featured_image_url: row.cover_url || '',
  attachment_url: row.asset_path || '',
  category: row.metadata?.category || 'general',
  is_featured: Boolean(row.metadata?.is_featured),
  seo_title: row.metadata?.seo_title || '',
  seo_description: row.metadata?.seo_description || '',
  version: Number(row.metadata?.version || 1),
  published_at: row.metadata?.published_at || null,
  last_published_by: row.metadata?.last_published_by || null,
  allow_download: row.metadata?.allow_download !== false,
  created_date: row.created_at,
  updated_date: row.updated_at,
}) : null;

const fromManagedPage = (page) => ({
  slug: page.slug,
  resource_type: 'PAGE',
  title: { ml: page.title_ml || '', en: page.title_en || '', ar: page.title_ar || '' },
  summary: { ml: page.excerpt_ml || '', en: page.excerpt_en || '', ar: page.excerpt_ar || '' },
  body: { ml: page.body_ml || '', en: page.body_en || '', ar: page.body_ar || '' },
  status: page.status || 'DRAFT',
  access_mode: ACCESS_TO_DB[page.access_mode] || 'FREE',
  price_minor: Math.max(0, Math.round(Number(page.price_amount || 0) * 100)),
  currency: page.price_currency || 'AED',
  validity_days: page.validity_days || null,
  lifetime_access: Boolean(page.lifetime_access),
  asset_path: page.attachment_url || null,
  cover_url: page.featured_image_url || null,
  metadata: {
    category: page.category || 'general',
    is_featured: Boolean(page.is_featured),
    seo_title: page.seo_title || '',
    seo_description: page.seo_description || '',
    version: Number(page.version || 1),
    published_at: page.published_at || null,
    last_published_by: page.last_published_by || null,
    allow_download: page.allow_download !== false,
  },
});

const isMissingResourcesSchema = (error) => (
  error?.code === '42P01'
  || error?.code === 'PGRST205'
  || /(resources|resource_assets|entitlements).*(not found|does not exist|schema cache)/i.test(error?.message || '')
);

const managedPageApi = {
  async list(sort = '-updated_date', limit = 100, skip = 0) {
    try {
      const ascending = !String(sort || '').startsWith('-');
      const field = String(sort || 'updated_date').replace(/^-/, '');
      const column = field === 'created_date' ? 'created_at' : field === 'published_at' ? 'updated_at' : 'updated_at';
      const rows = unwrap(await client().from('resources').select('*').eq('resource_type', 'PAGE')
        .order(column, { ascending }).range(skip || 0, (skip || 0) + (limit || 100) - 1));
      return rows.map(toManagedPage);
    } catch (error) {
      if (isMissingResourcesSchema(error)) return entityApi('ManagedPage').list(sort, limit, skip);
      throw error;
    }
  },
  async filter(filters = {}, sort = '-updated_date', limit = 100, skip = 0) {
    try {
      let query = client().from('resources').select('*').eq('resource_type', 'PAGE');
      if (filters.slug) query = query.eq('slug', filters.slug);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.access_mode) query = query.eq('access_mode', ACCESS_TO_DB[filters.access_mode] || filters.access_mode);
      const ascending = !String(sort || '').startsWith('-');
      const field = String(sort || 'updated_date').replace(/^-/, '');
      const column = field === 'created_date' ? 'created_at' : field === 'published_at' ? 'updated_at' : 'updated_at';
      const rows = unwrap(await query.order(column, { ascending }).range(skip || 0, (skip || 0) + (limit || 100) - 1));
      return rows.map(toManagedPage);
    } catch (error) {
      if (isMissingResourcesSchema(error)) return entityApi('ManagedPage').filter(filters, sort, limit, skip);
      throw error;
    }
  },
  async get(id) {
    try {
      return toManagedPage(unwrap(await client().from('resources').select('*').eq('id', id).maybeSingle()));
    } catch (error) {
      if (isMissingResourcesSchema(error)) return entityApi('ManagedPage').get(id);
      throw error;
    }
  },
  async create(data) {
    try {
      return toManagedPage(unwrap(await client().from('resources').insert(fromManagedPage(data)).select().single()));
    } catch (error) {
      if (isMissingResourcesSchema(error)) return entityApi('ManagedPage').create(data);
      throw error;
    }
  },
  async update(id, data) {
    try {
      const current = await this.get(id);
      if (current && !('title' in current)) {
        return toManagedPage(unwrap(await client().from('resources').update(fromManagedPage({ ...current, ...data }))
          .eq('id', id).select().single()));
      }
      return entityApi('ManagedPage').update(id, data);
    } catch (error) {
      if (isMissingResourcesSchema(error)) return entityApi('ManagedPage').update(id, data);
      throw error;
    }
  },
  async delete(id) {
    try {
      unwrap(await client().from('resources').delete().eq('id', id));
      return { success: true };
    } catch (error) {
      if (isMissingResourcesSchema(error)) return entityApi('ManagedPage').delete(id);
      throw error;
    }
  },
};

const toDirectoryUser = (profile) => ({
  id: profile.id, email: profile.email, full_name: profile.full_name || '',
  photo_url: profile.avatar_url || '', role: profile.role,
  account_status: profile.status === 'disabled' ? 'BLOCKED' : 'ACTIVE',
  created_date: profile.created_at,
});
const userDirectoryApi = {
  async list(_sort = null, limit = 100, skip = 0) {
    const { data, error } = await client().from('profiles').select(
      'id,email,full_name,avatar_url,role,status,created_at'
    ).order('created_at', { ascending: false }).range(skip || 0, (skip || 0) + (limit || 100) - 1);
    if (error) throw error;
    return (data || []).map(toDirectoryUser);
  },
  async get(id) {
    const { data, error } = await client().from('profiles').select(
      'id,email,full_name,avatar_url,role,status,created_at'
    ).eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? toDirectoryUser(data) : null;
  },
};
const auth = {
  async me() {
    if (!configured) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    const meta = data.user.user_metadata || {};
    const { data: profile, error: profileError } = await supabase.from('profiles')
      .select('role,status,full_name,avatar_url').eq('id', data.user.id).single();
    if (profileError || !profile || profile.status !== 'active') return null;
    return { ...meta, id: data.user.id, email: data.user.email,
      full_name: profile.full_name || meta.full_name || meta.name || '',
      photo_url: profile.avatar_url || meta.avatar_url || meta.picture || '',
      role: profile.role };
  },
  async isAuthenticated() { return Boolean(await this.me()); },
  async loginWithProvider(provider = 'google', returnTo = '/') {
    const safeReturn = String(returnTo || '/').startsWith('/') && !String(returnTo).startsWith('//') ? returnTo : '/';
    const redirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(safeReturn)}`;
    return unwrap(await client().auth.signInWithOAuth({ provider, options: { redirectTo } }));
  },
  async login({ email, password }) {
    return unwrap(await client().auth.signInWithPassword({ email, password }));
  },
  async requestLoginOtp({ email, redirectTo } = {}) {
    if (!email) throw new Error('Email is required.');
    return unwrap(await client().auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    }));
  },
  async verifyLoginOtp({ email, token } = {}) {
    if (!email || !token) throw new Error('Email and verification code are required.');
    return unwrap(await client().auth.verifyOtp({ email, token, type: 'email' }));
  },
  async register({ email, password, emailRedirectTo, ...metadata }) {
    return unwrap(await client().auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: emailRedirectTo || `${window.location.origin}/login`,
      },
    }));
  },
  async verifyOtp({ email, token, otpCode, type = 'signup' }) {
    return unwrap(await client().auth.verifyOtp({ email, token: token || otpCode, type }));
  },
  async resendOtp(input, type = 'signup') {
    const email = typeof input === 'string' ? input : input?.email;
    return unwrap(await client().auth.resend({ email, type: input?.type || type }));
  },
  async resetPasswordRequest(email) {
    return unwrap(await client().auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }));
  },
  async resetPassword({ password, newPassword }) {
    return unwrap(await client().auth.updateUser({ password: password || newPassword }));
  },
  async updateMe(attributes) { return unwrap(await client().auth.updateUser({ data: attributes })).user; },
  async setToken(accessToken, refreshToken = '') {
    return unwrap(await client().auth.setSession({ access_token: accessToken, refresh_token: refreshToken }));
  },
  async logout() { return unwrap(await client().auth.signOut()); },
};

const integrations = { Core: {
  async UploadFile({ file, bucket = 'private-documents', path } = {}) {
    const user = await auth.me();
    if (!user) throw new Error('Sign in is required to upload files.');
    const safeName = String(file?.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '-');
    const objectPath = path || `${user.id}/${crypto.randomUUID()}-${safeName}`;
    unwrap(await client().storage.from(bucket).upload(objectPath, file, { upsert: false }));
    return { file_url: objectPath, bucket };
  },
  async CreateSignedDownload({ path, bucket = 'private-documents', expiresIn = 120 } = {}) {
    if (!path) throw new Error('A file path is required.');
    const data = unwrap(await client().storage.from(bucket).createSignedUrl(path, expiresIn, { download: true }));
    return { signed_url: data.signedUrl, expires_in: expiresIn };
  },
  async InvokeLLM(payload) { return unwrap(await client().functions.invoke('invoke-llm', { body: payload })); },
} };

export const platform = {
  auth,
  integrations,
  functions: { async invoke(name, body = {}) {
    if (name === 'redeemCodeLinked' || name === 'redeemCodeGuest') {
      const { data, error } = await client().rpc('redeem_access_code', { p_code: body.code });
      if (error) throw error;
      return { data };
    }
    if (name === 'validateCodeStatus') {
      const { data, error } = await client().rpc('linked_code_permissions');
      if (error) throw error;
      return { data: { success: true, codes: (data || []).map(code => ({ ...code, status: 'active' })) } };
    }
    const codeActions = {
      createAccessCode: 'create', linkAccessCode: 'link',
      transferAccessCode: 'transfer', unlinkAccessCode: 'unlink',
      setAccessCodeDisabled: 'disable',
    };
    if (codeActions[name]) {
      const { data, error } = await client().rpc('manage_access_code',
        { p_action: codeActions[name], p_payload: body });
      if (error) throw error;
      return { data };
    }
    if (name === 'loadLinkedPermissions') {
      const { data: linked, error } = await client().rpc('linked_code_permissions');
      if (error) throw error;
      const permissions = (linked || []).flatMap((code) =>
        (code.page_paths || []).map((path, index) => ({
          page_path: path,
          page_name: (code.page_names || [])[index] || path,
          expiry_date: code.page_grants?.[path]
            ? code.page_grants[path].expires_at : code.expiry_date ?? null,
          granted_at: code.page_grants?.[path]?.granted_at || null,
          code: code.code,
        })));
      return { data: { success: true, permissions } };
    }
    if (name === 'getUserStats') {
      const { data, error } = await client().rpc('owner_dashboard_stats');
      if (error) throw error;
      return { data: { success: true, stats: data || {} } };
    }
    const codeDetailActions = {
      updateAccessCode: 'update', renewAccessCode: 'renew',
      deleteAccessCodeSecure: 'delete', resetCodeDevice: 'reset_device',
    };
    if (codeDetailActions[name]) {
      const { data, error } = await client().rpc('manage_access_code_detail',
        { p_action: codeDetailActions[name], p_payload: body });
      if (error) throw error;
      return { data };
    }
    if (name === 'adminManageSubscription') {
      const { data, error } = await client().rpc('manage_legacy_subscription', {
        p_subscription_id: body.subscription_id,
        p_action: body.action,
        p_extend_days: body.extend_days || null,
      });
      if (error) throw error;
      return { data };
    }
    if (name === 'submitAccessRequest') {
      const { data, error } = await client().rpc('request_page_access',
        { p_payload: body });
      if (error) throw error;
      return { data };
    }
    if (name === 'approveAccessRequest') {
      const { data, error } = await client().rpc('decide_access_request', {
        p_request_id: body.request_id,
        p_reject: body.reject === true,
        p_duration: body.access_duration || '1_MONTH',
      });
      if (error) throw error;
      return { data };
    }
    if (name === 'updatePageVisibility') {
      const { data, error } = await client().rpc('set_page_visibility', {
        p_path: body.page_path, p_name: body.page_name,
        p_requires_permission: body.requires_permission,
      });
      if (error) throw error;
      return { data };
    }
    const permissionActions = {
      grantPagePermission: 'grant', extendPermissionExpiry: 'extend',
      revokePagePermission: 'revoke',
    };
    if (permissionActions[name]) {
      const { data, error } = await client().rpc('manage_page_permission',
        { p_action: permissionActions[name], p_payload: body });
      if (error) throw error;
      return { data };
    }
    const { data, error } = await client().functions.invoke(name, { body });
    if (error) throw error;
    return { data };
  } },
  entities: /** @type {Record<string, ReturnType<typeof entityApi>> & { User: typeof userDirectoryApi, ManagedPage: typeof managedPageApi }} */ (new Proxy({}, { get: (_target, entity) => String(entity) === 'ManagedPage'
    ? managedPageApi : String(entity) === 'User' ? userDirectoryApi : entityApi(String(entity)) })),
  async canAccessLegacyPage(pagePath) {
    if (!pagePath) return false;
    return Boolean(unwrap(await client().rpc('can_access_legacy_page', { p_path: pagePath })));
  },
  async canAccessResource(resourceId) {
    if (!resourceId) return false;
    return Boolean(unwrap(await client().rpc('can_access_resource', { target: resourceId })));
  },
  async listResourceAssets(resourceId) {
    if (!resourceId) return [];
    return unwrap(await client().from('resource_assets').select('*')
      .eq('resource_id', resourceId).order('sort_order', { ascending: true }));
  },
  async uploadResourceAsset(resourceId, file, options = {}) {
    const user = await auth.me();
    if (!user) throw new Error('Owner sign-in is required to upload files.');
    if (!resourceId || !file) throw new Error('A saved resource and file are required.');
    const bucket = options.bucket || 'private-documents';
    const safeName = String(file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '-');
    const objectPath = `${user.id}/resources/${resourceId}/${crypto.randomUUID()}-${safeName}`;
    unwrap(await client().storage.from(bucket).upload(objectPath, file, { upsert: false, contentType: file.type || undefined }));
    try {
      return unwrap(await client().from('resource_assets').insert({
        resource_id: resourceId,
        asset_type: options.assetType || (file.type === 'application/pdf' ? 'PDF' : 'IMAGE'),
        bucket,
        object_path: objectPath,
        title: options.title || {},
        mime_type: file.type || null,
        byte_size: Number(file.size || 0),
        is_preview: Boolean(options.isPreview),
        is_downloadable: options.isDownloadable !== false,
        sort_order: Number(options.sortOrder || 0),
      }).select().single());
    } catch (error) {
      await client().storage.from(bucket).remove([objectPath]);
      throw error;
    }
  },
  async deleteResourceAsset(asset) {
    if (!asset?.id) return { success: true };
    if (asset.bucket && asset.object_path) {
      unwrap(await client().storage.from(asset.bucket).remove([asset.object_path]));
    }
    unwrap(await client().from('resource_assets').delete().eq('id', asset.id));
    return { success: true };
  },
  async createResourceAssetDownload(asset, expiresIn = 120) {
    if (asset?.external_url) return asset.external_url;
    if (!asset?.bucket || !asset?.object_path) throw new Error('Download file is not configured.');
    const data = unwrap(await client().storage.from(asset.bucket).createSignedUrl(asset.object_path, expiresIn, { download: true }));
    return data.signedUrl;
  },
  async createResourceAssetView(asset, expiresIn = 3600) {
    if (asset?.external_url) return asset.external_url;
    if (!asset?.bucket || !asset?.object_path) throw new Error('Media file is not configured.');
    const data = unwrap(await client().storage.from(asset.bucket).createSignedUrl(asset.object_path, expiresIn));
    return data.signedUrl;
  },
  async listMyEntitlements() {
    const user = await auth.me();
    if (!user) return [];
    try {
      return unwrap(await client().from('entitlements')
        .select('id, starts_at, expires_at, revoked_at, source, resource:resources(*)')
        .eq('user_id', user.id).is('revoked_at', null).order('created_at', { ascending: false }));
    } catch (error) {
      if (isMissingResourcesSchema(error)) return [];
      throw error;
    }
  },
  async listFreeResources(limit = 100) {
    try {
      return unwrap(await client().from('resources').select('*')
        .eq('status', 'PUBLISHED').eq('access_mode', 'FREE')
        .order('sort_order', { ascending: true }).limit(limit));
    } catch (error) {
      if (!isMissingResourcesSchema(error)) throw error;
      const pages = await entityApi('ManagedPage').filter({ status: 'PUBLISHED', access_mode: 'PUBLIC' }, '-updated_date', limit);
      return pages.map((page) => ({
        id: page.id,
        slug: page.slug,
        resource_type: 'PAGE',
        title: { ml: page.title_ml || '', en: page.title_en || '', ar: page.title_ar || '' },
        summary: { ml: page.excerpt_ml || '', en: page.excerpt_en || '', ar: page.excerpt_ar || '' },
        access_mode: 'FREE',
        status: 'PUBLISHED',
      }));
    }
  },
  isConfigured: configured,
};
