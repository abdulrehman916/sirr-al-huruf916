create or replace function public.decide_access_request(
  p_request_id text,p_reject boolean default false,p_duration text default '1_MONTH')
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare req public.platform_records%rowtype;
 target_user uuid;
 expires timestamptz;
 page_path text;
 permission_id text;
begin
 if auth.uid() is null or not exists(
   select 1 from public.profiles where id=auth.uid() and role='owner' and status='active'
 ) then raise exception 'Owner access required' using errcode='42501'; end if;
 select * into req from public.platform_records where entity='AccessRequest'
   and data->>'request_id'=p_request_id for update;
 if not found then raise exception 'Request not found'; end if;
 if req.data->>'status' not in ('PENDING','pending') then
   raise exception 'Request is not pending'; end if;
 if p_reject then
   update public.platform_records set data=req.data || jsonb_build_object(
     'status','REJECTED','approved_by',auth.uid(),'approved_at',now()) where id=req.id;
   return jsonb_build_object('success',true);
 end if;
 page_path := req.data->>'page_path';
 if page_path is null or page_path not like '/%' or page_path like '/admin/%'
 then raise exception 'Invalid requested page'; end if;
 if nullif(req.data->>'user_id','') is not null then
   select id into target_user from public.profiles where id=(req.data->>'user_id')::uuid
     and role='customer' and status='active';
 end if;
 if target_user is null and nullif(req.data->>'email','') is not null then
   select id into target_user from public.profiles
     where lower(email)=lower(req.data->>'email') and role='customer' and status='active';
 end if;
 if target_user is null then raise exception 'Customer must sign in before approving the request'; end if;
 expires := case p_duration when '1_HOUR' then now()+interval '1 hour'
  when '1_DAY' then now()+interval '1 day'
  when '7_DAYS' then now()+interval '7 days'
  when '1_MONTH' then now()+interval '30 days'
  when '3_MONTHS' then now()+interval '90 days'
  when '6_MONTHS' then now()+interval '180 days'
  when '12_MONTHS' then now()+interval '365 days'
  when 'LIFETIME' then null else now()-interval '1 second' end;
 if expires is not null and expires<=now() then raise exception 'Invalid duration'; end if;
 permission_id := 'PERM-' || upper(replace(gen_random_uuid()::text,'-',''));
 insert into public.platform_records(entity,data,owner_id) values (
  'PagePermission',jsonb_build_object(
   'permission_id',permission_id,'user_id',target_user,'page_path',page_path,
   'page_name',coalesce(req.data->>'page_name',page_path),
   'permission_code',coalesce(req.data->>'permission_code',page_path),
   'start_date',now(),'expiry_date',expires,'is_active',true,
   'is_revoked',false,'granted_at',now(),'granted_by',auth.uid()),
  auth.uid());
 update public.platform_records set data=req.data || jsonb_build_object(
   'status','APPROVED','approved_by',auth.uid(),'approved_at',now(),
   'permission_id',permission_id) where id=req.id;
 return jsonb_build_object('success',true,'permission_id',permission_id);
end;
$$;
revoke all on function public.decide_access_request(text,boolean,text) from public,anon;
grant execute on function public.decide_access_request(text,boolean,text) to authenticated;