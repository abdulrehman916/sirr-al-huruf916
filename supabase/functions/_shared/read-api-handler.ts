
import { createClient } from 'npm:@supabase/supabase-js@2.116.0';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
const unwrap = ({data,error}: any) => { if(error) throw error; return data; };
const record = (row: any) => ({ ...row.data, id: row.data?._base44_legacy_id || row.id,
  created_date: row.created_at, updated_date: row.updated_at });

export function readApi(name: string) {
  return async (req: Request) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
    if (req.method !== 'POST') return json({error:'Method not allowed'},405);
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    // The gateway validates the project/user JWT for every endpoint.
    // Anonymous callers can read only the onboarding reset timestamp.
    const options = { auth: { persistSession:false, autoRefreshToken:false } };
    const scoped = createClient(url,anon,{...options,global:{headers:{Authorization:req.headers.get('Authorization') || ''}}});
    const privileged = createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,options);
    try {
      const body = await req.json().catch(()=>null);
      if (!body || typeof body !== 'object' || Array.isArray(body)) return json({error:'JSON object required'},400);
      if (name === 'getOnboardingResetDate') {
        const rows = unwrap(await privileged.from('platform_records').select('data')
          .eq('entity','SystemSettings').eq('data->>settings_id','SETTINGS-MAIN').limit(1));
        return json({onboarding_reset_date:rows[0]?.data?.general?.onboarding_reset_date || null});
      }
      const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i,'');
      const {data:auth,error:authError} = await scoped.auth.getUser(token);
      if(authError || !auth.user) return json({error:'Sign in required'},401);
      const profile = unwrap(await scoped.from('profiles').select('id,status,role').eq('id',auth.user.id).maybeSingle());
      if(!profile || profile.status !== 'active') return json({error:'Active account required'},403);
      const uid = auth.user.id;
      const rows = async (entity: string, filters: Record<string,unknown> = {}, sort = 'created_at', ascending = false, limit = 100) => {
        let q = privileged.from('platform_records').select('*').eq('entity',entity);
        for(const [key,value] of Object.entries(filters)) q=q.eq(`data->>${key}`,String(value));
        return unwrap(await q.order(sort,{ascending}).limit(limit)).map(record);
      };
      if(name === 'getUserSubscriptions') {
        const [subscriptions,permissions,plans] = await Promise.all([
          rows('Subscription',{user_id:uid}),rows('PagePermission',{user_id:uid}),rows('SubscriptionPlan',{is_active:true}),
        ]);
        const active = (r:any) => !r.expiry_date || new Date(r.expiry_date).getTime()>Date.now();
        return json({subscriptions:subscriptions.filter((r:any)=>r.status==='ACTIVE' && active(r)),
          all_subscriptions:subscriptions,permissions:permissions.filter((r:any)=>r.is_active && !r.is_revoked && active(r)),plans});
      }
      if(name === 'getUserRequests') {
        // A caller-supplied browser session is not proof of ownership.
        const requests = await rows('AccessRequest',{user_id:uid},'data->>requested_at');
        const result = await Promise.all(requests.map(async(r:any)=>({...r,
          messages:await rows('AccessRequestMessage',{request_id:r.request_id},'created_at',true)})));
        return json({success:true,requests:result});
      }
      if(name === 'getPagePricing') {
        if(typeof body.page_path !== 'string' || !body.page_path.startsWith('/') || body.page_path.length>200)
          return json({error:'Valid page_path required'},400);
        const pricing = await rows('SubscriptionPricing',{page_path:body.page_path,is_active:true});
        return json({success:true,pricing:pricing.map((p:any)=>({plan_name:p.plan_name,price:p.price,currency:p.currency}))});
      }
      if(name === 'checkPageAccessFast') {
        if(typeof body.page_path !== 'string' || !body.page_path.startsWith('/') || body.page_path.length>200)
          return json({granted:false,reason:'Valid page_path required'},400);
        const granted = ['owner','admin'].includes(profile.role) || Boolean(unwrap(await scoped.rpc('can_access_legacy_page',{p_path:body.page_path})));
        return json({granted,status:granted?'granted':'locked',...(granted?{}:{reason:'Access denied'})});
      }
      return json({error:'Unknown operation'},404);
    } catch(error) {
      console.error('Independent read API failed',name,error instanceof Error ? error.message : 'Database error');
      return json({error:'Unable to load account information'},500);
    }
  };
}
