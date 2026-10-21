/** Independent Sirr al-Huruf platform client backed by Supabase. */
import { createClient } from '@supabase/supabase-js';
import { toRecord, byRecordId } from './recordIdentity';
import { createReferenceResolver } from './privateReferenceAssets';
import { mergePermissionGrants } from '../lib/permissionGrants.js';

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
// Resolve only at the RPC boundary: public record IDs and relationships remain stable.
const accessCodePayload = async (body) => {
  if (!body.code_id) return body;
  const row = unwrap(await byRecordId(client().from('platform_records')
    .select('id').eq('entity', 'AccessCode'), body.code_id).single());
  return { ...body, code_id: row.id };
};

const sortQuery = (query, sort) => {
  if (!sort) return query;
  const ascending = !String(sort).startsWith('-');
  const field = String(sort).replace(/^-/, '');
  const column = field === 'created_date' ? 'created_at' : field === 'updated_date' ? 'updated_at' : `data->>${field}`;
  return query.order(column, { ascending });
};

const entityApi = (entity) => ({
  async summaries(fields, limit = 500) {
    if (!Array.isArray(fields) || fields.some(field => !/^[a-z_][a-z0-9_]*$/.test(field))) throw new Error('Invalid summary fields.');
    const selected = [...new Set(['_base44_legacy_id', ...fields])];
    const columns = ['id', 'created_at', 'updated_at', ...selected.map(field => `${field}:data->${field}`)].join(',');
    const rows = unwrap(await client().from('platform_records').select(columns).eq('entity', entity).limit(Math.min(limit, 500)));
    return rows.map(({ id, created_at, updated_at, ...data }) => toRecord({ id, created_at, updated_at, data }));
  },
  async list(sort = null, limit = 100, skip = 0) {
    if (entity === 'FeatureConfig') return (unwrap(await client().rpc('feature_configs', { p_path: null })) || []).slice(skip, skip + limit).map(toRecord);
    let query = client().from('platform_records').select('*').eq('entity', entity);
    query = sortQuery(query, sort).range(skip || 0, (skip || 0) + (limit || 100) - 1);
    return Promise.all(unwrap(await query).map(hydrateRecord));
  },
  async filter(filters = {}, sort = null, limit = 100, skip = 0) {
    if (entity === 'FeatureConfig') return (unwrap(await client().rpc('feature_configs', { p_path: filters.page_path || null })) || []).map(toRecord)
      .filter(row => Object.entries(filters).every(([key, value]) => row[key] === value)).slice(skip, skip + limit);
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
    if (entity === 'SupportTickets' || entity === 'SupportMessage') {
      return hydrateRecord(unwrap(await client().rpc('create_support_record', {
        p_entity: entity, p_payload: references.restore(data),
      })));
    }
    return hydrateRecord(unwrap(await client().from('platform_records').insert({ entity, data: references.restore(data) }).select().single()));
  },
  async update(id, data) {
    const current = unwrap(await byRecordId(client().from('platform_records').select('id,data').eq('entity', entity), id).single());
    const row = unwrap(await client().from('platform_records').update({ data: { ...(current?.data || {}), ...references.restore(data) } })
      .eq('entity', entity).eq('id', current.id).select().single());
    return hydrateRecord(row);
  },
  async delete(id) {
    unwrap(await byRecordId(client().from('platform_records').delete().eq('entity', entity), id));
    return { success: true };
  },
  async bulkCreate(rows = []) {
    if (!rows.length) return [];
    return Promise.all(unwrap(await client().from('platform_records').insert(rows.map((data) => ({ entity, data: references.restore(data) }))).select()).map(hydrateRecord));
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
      role: profile.role === 'owner' ? 'owner' : 'customer' };
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
    if (!file || file.size > 50 * 1024 * 1024) throw new Error('Choose a file smaller than 50 MB.');
    const safeName = String(file?.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '-');
    const objectPath = path || `${user.id}/${crypto.randomUUID()}-${safeName}`;
    unwrap(await client().storage.from(bucket).upload(objectPath, file, { upsert: false }));
    const fileUrl = bucket === 'private-documents'
      ? await references.resolve(`storage://private-documents/${objectPath}`)
      : unwrap(await client().storage.from(bucket).createSignedUrl(objectPath, 900)).signedUrl;
    if (!fileUrl) throw new Error('File uploaded, but its preview URL could not be created.');
    return { file_url: fileUrl, path: objectPath, bucket };
  },
  async CreateSignedDownload({ path, bucket = 'private-documents', expiresIn = 120 } = {}) {
    if (!path) throw new Error('A file path is required.');
    const data = unwrap(await client().storage.from(bucket).createSignedUrl(path, expiresIn, { download: true }));
    return { signed_url: data.signedUrl, expires_in: expiresIn };
  },
  async RemoveUploadedFile({ path } = {}) {
    const user = await auth.me();
    if (!user || typeof path !== 'string' || !path.startsWith(`${user.id}/`)) throw new Error('You can only remove your own upload.');
    unwrap(await client().storage.from('private-documents').remove([path]));
  },
  async InvokeLLM(payload) { return unwrap(await client().functions.invoke('invoke-llm', { body: payload })); },
} };

const pendingInvocations = new Map();
const coalesceInvocations = (invoke) => (name, body = {}) => {
  const key = JSON.stringify([name, body]);
  if (pendingInvocations.has(key)) return pendingInvocations.get(key);
  const pending = Promise.resolve().then(() => invoke(name, body))
    .finally(() => { if (pendingInvocations.get(key) === pending) pendingInvocations.delete(key); });
  pendingInvocations.set(key, pending);
  return pending;
};

export const platform = {
  auth,
  integrations,
  functions: { invoke: coalesceInvocations(async (name, body = {}) => {
    if (name === 'ownerLibraryIngest') {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const { data, error } = await client().rpc('owner_library_ingest', { p_payload: body }).abortSignal(controller.signal);
        if (error) throw error;
        return { data: await references.resolve(data) };
      } finally { clearTimeout(timeout); }
    }
    if (name === 'getOwnerPurposeRecords') {
      const { data, error } = await client().rpc('owner_purpose_records', { p_after: body.after || null });
      if (error) throw error;
      return { data: await references.resolve(data) };
    }
    if (name === 'autoLearnPurpose') {
      const { data, error } = await client().rpc('lookup_purpose_intent', { p_phrase: body.customPurpose || '' });
      if (error) throw error;
      return { data };
    }
    if (name === 'deletePurposeDictionaryVersion') {
      const { data, error } = await client().rpc('owner_purpose_delete_version', {
        p_version_id: body.version_id,
        p_request_id: body.request_id || crypto.randomUUID(),
      });
      if (error) throw error;
      return { data };
    }
    const purposeActions = { backupPurposeDictionary: 'BACKUP', bulkImportPurposeDictionary: 'IMPORT', restorePurposeDictionary: 'RESTORE', finalizePurposeDictionaryImport: 'FINALIZE' };
    if (purposeActions[name]) {
      const payload = { ...body, request_id: body.request_id || crypto.randomUUID() };
      if (name === 'restorePurposeDictionary') {
        const versions = await entityApi('PurposeDictionaryVersion').filter({ version_id: body.version_id }, null, 1);
        const version = versions[0];
        if (!version) throw new Error('Version not found');
        if (version.snapshot_storage !== 'independent') {
          if (!version.snapshot_file_url) throw new Error('Legacy snapshot file is unavailable; current dictionary is unchanged');
          const file = await fetch(version.snapshot_file_url);
          if (!file.ok) throw new Error('Could not read the legacy snapshot; current dictionary is unchanged');
          const entries = await file.json();
          if (!Array.isArray(entries) || entries.length !== Number(version.record_count)) throw new Error('Legacy snapshot is incomplete; current dictionary is unchanged');
          payload.snapshot_entries = entries;
        }
      }
      const { data, error } = await client().rpc('owner_purpose_management', { p_action: purposeActions[name], p_payload: payload });
      if (error) throw error;
      return { data };
    }
    if (name === 'reviewMasterPdfPage' || name === 'getOwnerLibraryPages') {
      const { data, error } = await client().rpc(name === 'reviewMasterPdfPage' ? 'owner_library_review' : 'owner_library_pages', { p_payload: body });
      if (error) throw error;
      return { data: await references.resolve(data) };
    }
    if (name === 'unifiedKnowledgeSearch' || name === 'getAstroClockLibraryStatus') {
      const { data, error } = await client().rpc(name === 'unifiedKnowledgeSearch' ? 'owner_library_search' : 'owner_library_status', name === 'unifiedKnowledgeSearch' ? {
        p_query: body.query, p_mode: body.mode || 'harakat_insensitive', p_after: body.after || null, p_limit: body.limit || 30,
      } : {});
      if (error) throw error;
      return { data: await references.resolve(data) };
    }
    if (name === 'getRuntimeStatus') {
      const { data, error } = await client().rpc('runtime_status');
      if (error) throw error;
      return { data };
    }
    const maintenanceActions = { automatedBackup: 'BACKUP', restoreFromZipBackup: 'RESTORE', resetOnboarding: 'RESET_ONBOARDING', exportData: 'EXPORT' };
    if (maintenanceActions[name]) {
      const run = async (action, payload) => {
        const { data, error } = await client().rpc('owner_maintenance', { p_action: action, p_payload: payload });
        if (error) throw error;
        if (!data?.success) throw new Error('Maintenance operation failed');
        return data;
      };
      const backup = async () => {
        let data = await run('BACKUP', {});
        while (!data.complete) data = await run('BACKUP', { backup_id: data.backup_id });
        return data;
      };
      if (name === 'automatedBackup') return { data: await backup() };
      if (name === 'restoreFromZipBackup') {
        const source = await run('LATEST_BACKUP', {});
        const recovery = await backup();
        let data;
        do {
          data = await run('RESTORE', { backup_id: source.backup_id, recovery_backup_id: recovery.backup_id });
        } while (!data.complete);
        return { data };
      }
      return { data: await run(maintenanceActions[name], body) };
    }
    if (name === 'ownerCustomerDirectory') {
      const { data, error } = await client().rpc('owner_customer_directory', {
        p_search: body.search || '', p_status: body.status || '', p_after: body.after || '', p_limit: body.limit || 50,
      });
      if (error) throw error;
      return { data };
    }
    if (name === 'setCustomerStatus') {
      const { data, error } = await client().rpc('set_customer_status', { p_user_id: body.user_id, p_status: body.status === 'BLOCKED' ? 'disabled' : 'active' });
      if (error) throw error;
      return { data };
    }
    const adminWorkflow = { manageSupportRouting: 'support' };
    if (adminWorkflow[name]) {
      const { data, error } = await client().rpc('owner_support', { p_payload: body });
      if (error) throw error;
      return { data: await references.resolve(data) };
    }
    const workflowRpc = { ownerReplySupport: 'owner_reply_support', replyToAccessRequest: 'reply_access_request', manageRedeemCodeApproval: 'manage_redeem_approval' };
    if (workflowRpc[name]) {
      const { data, error } = await client().rpc(workflowRpc[name], { p_payload: references.restore(body) });
      if (error) throw error;
      return { data };
    }
    if (name === 'syncPageVisibility' || name === 'syncModuleRegistry') {
      const { data, error } = await client().rpc('sync_owner_registry', {
        p_kind: name === 'syncPageVisibility' ? 'pages' : 'modules',
        p_items: name === 'syncPageVisibility' ? body.routes : body.modules,
      });
      if (error) throw error;
      return { data };
    }
    if (name === 'manageSystemSettings' || name === 'getOwnerAuditLog') {
      const { data, error } = await client().rpc('owner_configuration', {
        p_action: name === 'getOwnerAuditLog' ? 'AUDIT_LOG' : body.action,
        p_payload: body,
      });
      if (error) throw error;
      return { data };
    }
    if (name === 'redeemCodeLinked' || name === 'redeemCodeGuest') {
      const { data, error } = await client().rpc('redeem_access_code', { p_code: body.code });
      if (error) throw error;
      const { data: refreshed, error: refreshError } = await client().rpc('legacy_permission_grants');
      if (refreshError) throw refreshError;
      return { data: { ...data, permissions: mergePermissionGrants(refreshed || []) } };
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
        { p_action: codeActions[name], p_payload: await accessCodePayload(body) });
      if (error) throw error;
      return { data };
    }
    if (name === 'loadLinkedPermissions') {
      const { data, error } = await client().rpc('legacy_permission_grants');
      if (error) throw error;
      return { data: { success: true, permissions: mergePermissionGrants(data || []) } };
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
        { p_action: codeDetailActions[name], p_payload: await accessCodePayload(body) });
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
    return { data: await references.resolve(data) };
  }) },
  entities: /** @type {Record<string, ReturnType<typeof entityApi>> & { User: typeof userDirectoryApi }} */ (new Proxy({}, { get: (_target, entity) => String(entity) === 'User' ? userDirectoryApi : entityApi(String(entity)) })),
  async canAccessLegacyPage(pagePath) {
    if (!pagePath) return false;
    return Boolean(unwrap(await client().rpc('can_access_legacy_page', { p_path: pagePath })));
  },
  isConfigured: configured,
};
