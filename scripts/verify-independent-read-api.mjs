
import assert from 'node:assert/strict';
import { build } from 'esbuild';
const built = await build({entryPoints:['supabase/functions/_shared/read-api-handler.ts'],bundle:true,write:false,format:'esm',platform:'node',plugins:[{
 name:'test-auth-client',setup(b){b.onResolve({filter:/^npm:/},()=>({path:'client',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const createClient=(...args)=>globalThis.__readApiClient(...args);',loader:'js'}));}
}]});
const env={SUPABASE_URL:'https://test.invalid',SUPABASE_ANON_KEY:'public-test-key',SUPABASE_SERVICE_ROLE_KEY:'server-only-test-key'};
globalThis.Deno={env:{get:k=>env[k]}};
let active=true; let signedIn=true; let customerId='customer-one';
const records=[
 {entity:'Subscription',data:{user_id:'customer-one',status:'ACTIVE',expiry_date:null}},
 {entity:'Subscription',data:{user_id:'customer-two',status:'ACTIVE',private_note:'OTHER CUSTOMER'}},
 {entity:'Subscription',data:{user_id:'customer-one',status:'ACTIVE',expiry_date:'2000-01-01'}},
 {entity:'PagePermission',data:{user_id:'customer-one',is_active:true,is_revoked:false}},
 {entity:'PagePermission',data:{user_id:'customer-one',is_active:true,is_revoked:true}},
 {entity:'SubscriptionPlan',data:{is_active:true,plan_name:'Premium'}},
 {entity:'AccessRequest',data:{user_id:'customer-one',request_id:'one',session_id:'old-browser'}},
 {entity:'AccessRequest',data:{user_id:'customer-two',request_id:'two',session_id:'attacker-session'}},
 {entity:'AccessRequestMessage',data:{request_id:'one',message:'MY MESSAGE'}},
 {entity:'AccessRequestMessage',data:{request_id:'two',message:'OTHER MESSAGE'}},
 {entity:'SystemSettings',data:{settings_id:'SETTINGS-MAIN',secret:'NEVER RETURN',general:{onboarding_reset_date:'2026-10-01'}}},
];
globalThis.__readApiClient=(_url,key)=>({
 auth:{getUser:async()=>({data:{user:signedIn?{id:customerId}:null},error:signedIn?null:new Error('not signed in')})},
 rpc:async()=>({data:false,error:null}),
 from(table){
  const filters=[];
  const q={select:()=>q,eq:(k,v)=>{filters.push([k,v]);return q;},order:()=>q,limit:()=>q,maybeSingle:async()=>({data:{id:customerId,status:active?'active':'blocked',role:'customer'},error:null}),then(resolve){
   assert.equal(key,env.SUPABASE_SERVICE_ROLE_KEY);
   const data=records.filter(r=>filters.every(([k,v])=>(k.startsWith('data->>')?String(r.data[k.slice(7)]):r[k])===v));
   return Promise.resolve({data,error:null}).then(resolve);
  }};
  assert.ok(['profiles','platform_records'].includes(table)); return q;
 }
});
const {readApi}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
const request=(body={},headers={})=>new Request('https://test.invalid',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer test-user-token',...headers},body:JSON.stringify(body)});
let r=await readApi('getUserSubscriptions')(request({user_id:'customer-two'}));
assert.equal(r.status,200);let data=await r.json();assert.equal(data.subscriptions.length,1);assert.equal(data.all_subscriptions.length,2);assert.equal(data.permissions.length,1);assert.ok(!JSON.stringify(data).includes('OTHER CUSTOMER'));
r=await readApi('getUserRequests')(request({session_id:'attacker-session',user_id:'customer-two'}));data=await r.json();assert.equal(data.requests.length,1);assert.equal(data.requests[0].messages[0].message,'MY MESSAGE');assert.ok(!JSON.stringify(data).includes('OTHER MESSAGE'));
active=false;r=await readApi('getUserSubscriptions')(request());assert.equal(r.status,403);active=true;
signedIn=false;r=await readApi('getUserSubscriptions')(request());assert.equal(r.status,401);
r=await readApi('getOnboardingResetDate')(request({}, {apikey:env.SUPABASE_ANON_KEY}));assert.deepEqual(await r.json(),{onboarding_reset_date:'2026-10-01'});
signedIn=true;r=await readApi('checkPageAccessFast')(request({page_path:'/abjad'}));assert.equal((await r.json()).granted,false);
r=await readApi('getPagePricing')(request({page_path:'invalid'}));assert.equal(r.status,400);
r=await readApi('getUserRequests')(new Request('https://test.invalid',{method:'OPTIONS'}));assert.equal(r.status,200);assert.ok(r.headers.get('Access-Control-Allow-Headers').includes('authorization'));
console.log('Independent account reads: ownership, blocked accounts, authentication, public-field allowlist and CORS verified.');
