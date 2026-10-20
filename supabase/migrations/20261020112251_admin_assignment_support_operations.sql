create or replace function private.admin_workflow(p_domain text,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$
declare actor public.profiles%rowtype; account public.profiles%rowtype; rec public.platform_records%rowtype;
 staff public.platform_records%rowtype; assigned_record public.platform_records%rowtype;
 action text:=p_payload->>'action'; patch jsonb; items jsonb; stats jsonb; key text; assigned_id text; item_id text;
begin
 select * into actor from public.profiles where id=auth.uid() and status='active';
 if actor.id is null then raise exception 'Sign in required' using errcode='42501'; end if;
 if p_domain='admins' then
   if action='GET_STATUS' then
     if actor.role not in ('owner','admin') then raise exception 'Administrator required' using errcode='42501'; end if;
     select coalesce(jsonb_agg(data||jsonb_build_object('id',coalesce(data->>'_base44_legacy_id',id::text),'admin_profile_id',coalesce(data->>'admin_profile_id',id::text))),'[]') into items
     from public.platform_records where entity='AdminProfile' and (actor.role='owner' or data->>'user_id'=actor.id::text or lower(data->>'email')=lower(actor.email));
     return jsonb_build_object('success',true,'is_owner',actor.role='owner','profiles',items);
   end if;
   if actor.role<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
   perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('sirr-admin-profiles'));
   if action='CREATE' then
     select * into account from public.profiles where lower(email)=lower(trim(p_payload->>'email')) and role<>'owner' and status='active';
     if account.id is null then raise exception 'This person must first sign in to the app with this email'; end if;
     if exists(select 1 from public.platform_records where entity='AdminProfile' and lower(data->>'email')=lower(account.email)) then raise exception 'Admin profile already exists'; end if;
     patch:=jsonb_build_object('admin_profile_id','ADM-'||gen_random_uuid()::text,'user_id',account.id,'email',account.email,
       'full_name',coalesce(nullif(trim(p_payload->>'full_name'),''),account.full_name),'whatsapp_number',left(coalesce(p_payload->>'whatsapp_number',''),40),
       'is_owner',false,'status','ACTIVE','created_by',actor.email,'created_by_id',actor.id,'created_date',now());
   else
     select * into rec from public.platform_records where entity='AdminProfile' and (data->>'admin_profile_id'=p_payload->>'admin_profile_id' or id::text=p_payload->>'admin_profile_id' or data->>'_base44_legacy_id'=p_payload->>'admin_profile_id') limit 1 for update;
     if rec.id is null then raise exception 'Admin profile not found'; end if;
     select * into account from public.profiles where id::text=rec.data->>'user_id' or lower(email)=lower(rec.data->>'email') limit 1;
     if coalesce((rec.data->>'is_owner')::boolean,false) or account.role='owner' then raise exception 'Owner account cannot be changed'; end if;
     patch:=rec.data;
     if action='UPDATE' then patch:=patch||jsonb_build_object('full_name',left(coalesce(p_payload->>'full_name',patch->>'full_name'),200),'whatsapp_number',left(coalesce(p_payload->>'whatsapp_number',patch->>'whatsapp_number'),40));
     elsif action='DISABLE' then patch:=patch||jsonb_build_object('status','DISABLED','disabled_at',now(),'disabled_by',actor.id);
     elsif action='ENABLE' then patch:=patch||jsonb_build_object('status','ACTIVE');
     elsif action='RESET_DEVICE' then patch:=(patch-'device_id'-'device_bound_at')||jsonb_build_object('reset_count',coalesce((patch->>'reset_count')::integer,0)+1);
     elsif action='DELETE' then
       delete from public.platform_records where id=rec.id;
       update public.profiles set role='customer',status='active' where id=account.id and role<>'owner';
       return jsonb_build_object('success',true);
     elsif action<>'UPDATE_PERMISSIONS' then raise exception 'Unsupported admin action'; end if;
   end if;
   if action in ('CREATE','UPDATE_PERMISSIONS') then
     foreach key in array array['customer_management','access_requests','access_codes','redeem_code_approval','support_messages','analytics','pdf_editor','holy_names_translator','feature_pricing','shop_management','product_management','system_settings','page_permissions','admin_management'] loop
       patch:=patch||jsonb_build_object('perm_'||key,coalesce((p_payload->'permissions'->>key)::boolean,false));
     end loop;
   end if;
   if action='CREATE' then insert into public.platform_records(entity,owner_id,data) values('AdminProfile',account.id,patch) returning * into rec;
   else update public.platform_records set data=patch where id=rec.id; end if;
   update public.profiles set role='admin',status=case when action='DISABLE' then 'disabled' else 'active' end where id=account.id and role<>'owner';
   return jsonb_build_object('success',true,'profile',patch);
 elsif p_domain='assignments' then
   if actor.role<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
   if action='GET_STATS' then
     select jsonb_build_object('assigned',count(*) filter(where data->>'assigned_admin_id' is not null),
       'active_assigned',count(*) filter(where data->>'assigned_admin_id' is not null),'pending',count(*) filter(where data->>'assigned_admin_id' is null)) into stats
       from public.platform_records where entity='UserAccessProfile';
     return jsonb_build_object('success',true,'stats',stats);
   end if;
   select * into account from public.profiles where lower(email)=lower(trim(p_payload->>'customer_email')) and role='customer';
   if account.id is null then raise exception 'Customer account not found'; end if;
   if action='ASSIGN' then
     select * into rec from public.platform_records where entity='AdminProfile' and data->>'status'='ACTIVE'
       and (data->>'admin_profile_id'=p_payload->>'admin_profile_id' or id::text=p_payload->>'admin_profile_id') limit 1;
     if rec.id is null then raise exception 'Active admin not found'; end if;
     assigned_id:=coalesce(rec.data->>'admin_profile_id',rec.id::text);
   elsif action<>'REMOVE' then raise exception 'Invalid assignment action'; end if;
   perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(account.id::text));
   select * into assigned_record from public.platform_records where entity='UserAccessProfile'
     and (data->>'user_id'=account.id::text or lower(coalesce(data->>'email',data->>'user_email'))=lower(account.email)) limit 1 for update;
   patch:=jsonb_build_object('user_id',account.id,'email',account.email,'assigned_admin_id',assigned_id,'assigned_at',now(),'assigned_by',actor.id);
   if assigned_record.id is null then insert into public.platform_records(entity,owner_id,data) values('UserAccessProfile',account.id,patch);
   else update public.platform_records set data=data||patch where id=assigned_record.id; end if;
   return jsonb_build_object('success',true,'action',action,'message',case when action='ASSIGN' then 'Customer assigned' else 'Assignment removed' end);
 elsif p_domain='support' then
   select * into staff from public.platform_records where entity='AdminProfile' and data->>'status'='ACTIVE'
     and (data->>'user_id'=actor.id::text or lower(data->>'email')=lower(actor.email)) limit 1;
   if action='GET_ACTIVE_ADMINS' then
     select coalesce(jsonb_agg(jsonb_build_object('admin_profile_id',coalesce(r.data->>'admin_profile_id',r.id::text),
       'full_name',r.data->>'full_name','whatsapp_number',r.data->>'whatsapp_number','is_active',true)),'[]') into items
     from public.platform_records r join public.profiles p on p.id::text=r.data->>'user_id'
     where r.entity='AdminProfile' and r.data->>'status'='ACTIVE' and p.status='active' and p.role in ('admin','owner')
       and nullif(r.data->>'whatsapp_number','') is not null;
     return jsonb_build_object('success',true,'admins',items);
   elsif action='GET_SCOPED_TICKETS' then
     if actor.role<>'owner' and (actor.role<>'admin' or staff.id is null or not coalesce((staff.data->>'perm_support_messages')::boolean,false)) then raise exception 'Support permission required' using errcode='42501'; end if;
     with maps as (select lower(coalesce(data->>'email',data->>'user_email')) email,data->>'assigned_admin_id' admin_id from public.platform_records where entity='UserAccessProfile')
     select coalesce(jsonb_agg(r.data||jsonb_build_object('id',coalesce(r.data->>'_base44_legacy_id',r.id::text))),'[]') into items
     from public.platform_records r where r.entity='SupportTickets'
       and (actor.role='owner' or exists(select 1 from maps m where m.email=lower(r.data->>'email') and m.admin_id in (staff.id::text,staff.data->>'admin_profile_id')));
     select coalesce(jsonb_object_agg(lower(coalesce(data->>'email',data->>'user_email')),data->>'assigned_admin_id') filter(where coalesce(data->>'email',data->>'user_email') is not null),'{}') into patch from public.platform_records where entity='UserAccessProfile' and (actor.role='owner' or data->>'assigned_admin_id' in (staff.id::text,staff.data->>'admin_profile_id'));
     select coalesce(jsonb_agg(data),'[]') into stats from public.platform_records where entity='AdminProfile' and (actor.role='owner' or id=staff.id);
     return jsonb_build_object('success',true,'tickets',items,'is_owner',actor.role='owner','admin_profiles',stats,'customer_admin_map',patch);
   elsif action in ('GET_MY_ASSIGNED_ADMIN','SELF_ASSIGN_ADMIN') then
     if nullif(p_payload->>'email','') is not null and lower(trim(p_payload->>'email'))<>lower(actor.email) then raise exception 'Use your signed-in email' using errcode='42501'; end if;
     perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(actor.id::text));
     select * into assigned_record from public.platform_records where entity='UserAccessProfile' and (data->>'user_id'=actor.id::text or lower(coalesce(data->>'email',data->>'user_email'))=lower(actor.email)) limit 1 for update;
     if action='SELF_ASSIGN_ADMIN' then
       select * into rec from public.platform_records where entity='AdminProfile' and data->>'status'='ACTIVE' and data->>'admin_profile_id'=p_payload->>'admin_profile_id' limit 1;
       if rec.id is null then raise exception 'Active admin not found'; end if;
       if nullif(assigned_record.data->>'assigned_admin_id','') is not null and exists(select 1 from public.platform_records r where r.entity='AdminProfile' and r.data->>'admin_profile_id'=assigned_record.data->>'assigned_admin_id' and r.data->>'status'='ACTIVE') then raise exception 'An active admin is already assigned'; end if;
       patch:=jsonb_build_object('user_id',actor.id,'email',actor.email,'assigned_admin_id',rec.data->>'admin_profile_id');
       if assigned_record.id is null then insert into public.platform_records(entity,owner_id,data) values('UserAccessProfile',actor.id,patch);
       else update public.platform_records set data=data||patch where id=assigned_record.id; end if;
     else select * into rec from public.platform_records where entity='AdminProfile' and data->>'admin_profile_id'=assigned_record.data->>'assigned_admin_id' limit 1; end if;
     if rec.id is null then return jsonb_build_object('success',true,'admin',null); end if;
     return jsonb_build_object('success',true,'admin',jsonb_build_object('admin_profile_id',rec.data->>'admin_profile_id',
       'full_name',rec.data->>'full_name','whatsapp_number',rec.data->>'whatsapp_number','is_active',rec.data->>'status'='ACTIVE'));
   else raise exception 'Unsupported support action'; end if;
 else raise exception 'Unsupported workflow'; end if;
end;
$$;
revoke all on function private.admin_workflow(text,jsonb) from public,anon;
grant execute on function private.admin_workflow(text,jsonb) to authenticated;
create or replace function public.manage_admin_workflow(p_domain text,p_payload jsonb)
returns jsonb language sql security invoker set search_path='' as $$ select private.admin_workflow(p_domain,p_payload); $$;
revoke all on function public.manage_admin_workflow(text,jsonb) from public,anon;
grant execute on function public.manage_admin_workflow(text,jsonb) to authenticated;

-- Customers cannot bypass the approval endpoint or reassign their own admin.
create policy workflow_record_insert_guard on public.platform_records as restrictive for insert to authenticated
with check (entity<>'RedeemCodeApproval' and (entity<>'UserAccessProfile' or public.current_role()='owner'));
create policy workflow_record_update_guard on public.platform_records as restrictive for update to authenticated
using (entity<>'RedeemCodeApproval' and (entity<>'UserAccessProfile' or public.current_role()='owner'))
with check (entity<>'RedeemCodeApproval' and (entity<>'UserAccessProfile' or public.current_role()='owner'));
create policy workflow_record_delete_guard on public.platform_records as restrictive for delete to authenticated
using (entity<>'RedeemCodeApproval' and (entity<>'UserAccessProfile' or public.current_role()='owner'));
create policy approval_read_guard on public.platform_records as restrictive for select to authenticated
using (entity<>'RedeemCodeApproval' or public.current_role()='owner' or data->>'customer_user_id'=auth.uid()::text);
