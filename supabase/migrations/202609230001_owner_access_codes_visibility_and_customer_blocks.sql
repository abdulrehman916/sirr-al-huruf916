-- Owner-only access code operations and public-safe page visibility.
create unique index if not exists platform_access_code_unique
  on public.platform_records (upper(data->>'code'))
  where entity = 'AccessCode';

create or replace function public.manage_access_code(p_action text, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  rec public.platform_records%rowtype;
  account public.profiles%rowtype;
  code_text text;
  target_id uuid;
  updated_data jsonb;
  now_iso text := now()::text;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'owner' and status = 'active'
  ) then raise exception 'Owner access required' using errcode = '42501'; end if;
  if p_action = 'create' then
    updated_data := coalesce(p_payload->'code_data','{}'::jsonb);
    code_text := upper(trim(updated_data->>'code'));
    if length(code_text) < 4 or length(code_text) > 100 or
       jsonb_array_length(coalesce(updated_data->'page_paths','[]'::jsonb)) = 0 then
      raise exception 'A code and at least one page are required';
    end if;
    updated_data := updated_data || jsonb_build_object('code',code_text,'created_by',auth.uid(),'is_disabled',false,'use_count',0);
    insert into public.platform_records(entity,data,owner_id)
      values ('AccessCode',updated_data,auth.uid()) returning * into rec;
    return jsonb_build_object('success',true,'id',rec.id,'code',code_text);
  end if;
  if nullif(p_payload->>'code_id','') is null then raise exception 'code_id required'; end if;
  target_id := (p_payload->>'code_id')::uuid;
  select * into rec from public.platform_records where id=target_id and entity='AccessCode' for update;
  if not found then raise exception 'Code not found'; end if;
  if p_action in ('link','transfer') then
    select * into account from public.profiles
      where lower(email)=lower(trim(p_payload->>'google_email')) and status='active' limit 1;
    if not found then raise exception 'Customer must sign in before linking a code'; end if;
    if account.role <> 'customer' then raise exception 'A customer account is required'; end if;
    if p_action='link' and nullif(rec.data->>'linked_user_id','') is not null then
      raise exception 'Code is already linked';
    end if;
    updated_data := rec.data || jsonb_build_object(
      'linked_user_id',account.id,'linked_user_email',account.email,
      'linked_at',now_iso,'linked_by',auth.uid(),'used_by_user_id',account.id,
      'used_by_email',account.email,'used_at',coalesce(rec.data->>'used_at',now_iso));
  elsif p_action='unlink' then
    updated_data := rec.data - 'linked_user_id' - 'linked_user_email' - 'linked_at'
      - 'linked_by' - 'used_by_user_id' - 'used_by_email';
  elsif p_action='disable' then
    if jsonb_typeof(p_payload->'disable') <> 'boolean' then raise exception 'disable must be boolean'; end if;
    updated_data := rec.data || jsonb_build_object('is_disabled',p_payload->'disable');
  else raise exception 'Unsupported action'; end if;
  update public.platform_records set data=updated_data where id=rec.id;
  return jsonb_build_object('success',true,'message','Access code updated','code',rec.data->>'code');
exception when unique_violation then
  raise exception 'This access code already exists' using errcode = '23505';
end;
$$;
revoke all on function public.manage_access_code(text,jsonb) from public, anon;
grant execute on function public.manage_access_code(text,jsonb) to authenticated;

create or replace function public.linked_code_permissions()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'code', c.data->>'code', 'page_paths',coalesce(c.data->'page_paths','[]'::jsonb),
    'page_names',coalesce(c.data->'page_names','[]'::jsonb),
    'page_grants',coalesce(c.data->'page_grants','{}'::jsonb),
    'expiry_date',c.data->>'expiry_date'
  )), '[]'::jsonb)
  from public.platform_records c
  where c.entity='AccessCode' and c.data->>'linked_user_id'=auth.uid()::text
    and coalesce((c.data->>'is_disabled')::boolean,false)=false
    and exists(select 1 from public.profiles p where p.id=auth.uid() and p.status='active');
$$;
revoke all on function public.linked_code_permissions() from public, anon;
grant execute on function public.linked_code_permissions() to authenticated;

create or replace function public.can_access_legacy_page(p_path text)
returns boolean language sql stable security definer set search_path = ''
as $$
  select auth.uid() is not null
    and exists(select 1 from public.profiles p where p.id=auth.uid() and p.status='active')
    and (
      exists(select 1 from public.platform_records c
        where c.entity='AccessCode' and c.data->>'linked_user_id'=auth.uid()::text
          and coalesce((c.data->>'is_disabled')::boolean,false)=false
          and coalesce(c.data->'page_paths','[]'::jsonb) ? p_path
          and (not (coalesce(c.data->'page_grants','{}'::jsonb) ? p_path)
            or nullif(c.data#>>array['page_grants',p_path,'expires_at'],'') is null
            or (c.data#>>array['page_grants',p_path,'expires_at'])::timestamptz > now()))
      or exists(select 1 from public.platform_records p
        where p.entity='PagePermission' and p.data->>'user_id'=auth.uid()::text
          and p.data->>'page_path'=p_path
          and coalesce((p.data->>'is_active')::boolean,false)
          and not coalesce((p.data->>'is_revoked')::boolean,false)
          and (nullif(p.data->>'expiry_date','') is null or (p.data->>'expiry_date')::timestamptz > now()))
    );
$$;
revoke all on function public.can_access_legacy_page(text) from public;
grant execute on function public.can_access_legacy_page(text) to anon, authenticated;

create or replace function public.page_visibility(p_path text)
returns jsonb language sql stable security definer set search_path = ''
as $$
 select coalesce((select jsonb_build_object(
   'requires_permission',coalesce((data->>'requires_permission')::boolean,false),
   'permanent_lock',coalesce((data->>'permanent_lock')::boolean,false),
   'permanent_lock_reason',data->>'permanent_lock_reason',
   'permanent_lock_custom_message',data->>'permanent_lock_custom_message')
 from public.platform_records
 where entity='PageVisibilityConfig' and data->>'page_path'=p_path
   and not coalesce((data->>'archived')::boolean,false)
 order by updated_at desc limit 1), '{}'::jsonb);
$$;
grant execute on function public.page_visibility(text) to anon, authenticated;

create or replace function public.set_page_visibility(p_path text, p_name text, p_requires_permission boolean)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare rec public.platform_records%rowtype;
begin
 if auth.uid() is null or not exists(
   select 1 from public.profiles where id=auth.uid() and role='owner' and status='active'
 ) then raise exception 'Owner access required' using errcode='42501'; end if;
 if p_path is null or p_path not like '/%' or p_path like '/admin/%' then
   raise exception 'Invalid content page path'; end if;
 select * into rec from public.platform_records where entity='PageVisibilityConfig'
   and data->>'page_path'=p_path and not coalesce((data->>'archived')::boolean,false)
 order by updated_at desc limit 1 for update;
 if found then
   update public.platform_records set data=rec.data || jsonb_build_object(
     'page_name',p_name,'requires_permission',p_requires_permission)
   where id=rec.id;
 else
   insert into public.platform_records(entity,owner_id,data)
   values ('PageVisibilityConfig',auth.uid(),
     jsonb_build_object('page_path',p_path,'page_name',p_name,
       'requires_permission',p_requires_permission,'archived',false));
 end if;
 return jsonb_build_object('success',true);
end;
$$;
revoke all on function public.set_page_visibility(text,text,boolean) from public, anon;
grant execute on function public.set_page_visibility(text,text,boolean) to authenticated;

create or replace function public.can_access_resource(target uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(
    select 1 from public.resources r
    where r.id=target and r.status='PUBLISHED' and
      (r.access_mode='FREE' or
       (exists(select 1 from public.profiles p where p.id=auth.uid() and p.status='active')
        and (r.access_mode='LOGIN'
         or public.current_role() in ('editor','admin','owner')
         or exists(select 1 from public.entitlements e where e.user_id=auth.uid()
           and e.resource_id=r.id and e.revoked_at is null
           and (e.expires_at is null or e.expires_at>now())))))
  );
$$;

-- Prevent customer-owned compatibility records from creating or editing owner controls.
drop policy if exists "records_create" on public.platform_records;
create policy "records_create" on public.platform_records for insert to authenticated
with check (
  (entity in ('AccessCode','PageVisibilityConfig','PagePermission','AdminProfile','Subscription','SubscriptionPlan')
    and public.current_role()='owner')
  or
  (entity not in ('AccessCode','PageVisibilityConfig','PagePermission','AdminProfile','Subscription','SubscriptionPlan')
    and (owner_id=auth.uid() or public.current_role() in ('editor','admin','owner')))
);
drop policy if exists "records_update" on public.platform_records;
create policy "records_update" on public.platform_records for update to authenticated
using ((entity in ('AccessCode','PageVisibilityConfig','PagePermission','AdminProfile','Subscription','SubscriptionPlan')
  and public.current_role()='owner')
 or (entity not in ('AccessCode','PageVisibilityConfig','PagePermission','AdminProfile','Subscription','SubscriptionPlan')
  and (owner_id=auth.uid() or public.current_role() in ('editor','admin','owner'))))
with check ((entity in ('AccessCode','PageVisibilityConfig','PagePermission','AdminProfile','Subscription','SubscriptionPlan')
  and public.current_role()='owner')
 or (entity not in ('AccessCode','PageVisibilityConfig','PagePermission','AdminProfile','Subscription','SubscriptionPlan')
  and (owner_id=auth.uid() or public.current_role() in ('editor','admin','owner'))));
drop policy if exists "records_delete" on public.platform_records;
create policy "records_delete" on public.platform_records for delete to authenticated
using ((entity in ('AccessCode','PageVisibilityConfig','PagePermission','AdminProfile','Subscription','SubscriptionPlan')
  and public.current_role()='owner')
 or (entity not in ('AccessCode','PageVisibilityConfig','PagePermission','AdminProfile','Subscription','SubscriptionPlan')
  and (owner_id=auth.uid() or public.current_role() in ('admin','owner'))));

create or replace function public.set_customer_status(p_user_id uuid,p_status text)
returns boolean language plpgsql security definer set search_path = ''
as $$
begin
 if auth.uid() is null or not exists(
   select 1 from public.profiles where id=auth.uid() and role='owner' and status='active'
 ) then raise exception 'Owner access required' using errcode='42501'; end if;
 if p_status not in ('active','disabled') then raise exception 'Invalid status'; end if;
 update public.profiles set status=p_status where id=p_user_id and role='customer';
 if not found then raise exception 'Customer not found'; end if;
 return true;
end;
$$;
revoke all on function public.set_customer_status(uuid,text) from public, anon;
grant execute on function public.set_customer_status(uuid,text) to authenticated;
