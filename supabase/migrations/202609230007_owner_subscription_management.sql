create or replace function public.manage_legacy_subscription(p_subscription_id text,p_action text,p_extend_days integer default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare sub public.platform_records%rowtype;
  perm public.platform_records%rowtype;
  expiry timestamptz;
  now_iso text := now()::text;
begin
 if auth.uid() is null or not exists(
   select 1 from public.profiles where id=auth.uid() and role='owner' and status='active'
 ) then raise exception 'Owner access required' using errcode='42501'; end if;
 select * into sub from public.platform_records where entity='Subscription'
   and data->>'subscription_id'=p_subscription_id for update;
 if not found then raise exception 'Subscription not found'; end if;
 if p_action='cancel' then
   update public.platform_records set data=sub.data || jsonb_build_object(
     'status','CANCELLED','last_modified_at',now_iso,'last_modified_by',auth.uid())
   where id=sub.id;
   for perm in select * from public.platform_records where entity='PagePermission'
     and data->>'user_id'=sub.data->>'user_id'
     and data->>'page_path'=sub.data->>'page_path'
     and coalesce((data->>'is_active')::boolean,false)
     for update
   loop
     update public.platform_records set data=perm.data || jsonb_build_object(
       'is_active',false,'is_revoked',true,'revoked_at',now_iso,'revoked_by',auth.uid())
     where id=perm.id;
   end loop;
   return jsonb_build_object('success',true,'status','CANCELLED');
 elsif p_action='extend' then
   if p_extend_days is null or p_extend_days < 1 or p_extend_days > 3650
   then raise exception 'Extension must be 1 to 3650 days'; end if;
   expiry := greatest(coalesce((sub.data->>'expiry_date')::timestamptz,now()),now())
     + p_extend_days * interval '1 day';
   update public.platform_records set data=sub.data || jsonb_build_object(
     'expiry_date',expiry,'last_modified_at',now_iso,'last_modified_by',auth.uid())
   where id=sub.id;
   for perm in select * from public.platform_records where entity='PagePermission'
     and data->>'user_id'=sub.data->>'user_id'
     and data->>'page_path'=sub.data->>'page_path'
     and coalesce((data->>'is_active')::boolean,false)
     and not coalesce((data->>'is_revoked')::boolean,false)
     for update
   loop
     update public.platform_records set data=perm.data || jsonb_build_object(
       'expiry_date',greatest(coalesce((perm.data->>'expiry_date')::timestamptz,now()),now())
           + p_extend_days * interval '1 day',
       'last_extended_at',now_iso,'last_extended_by',auth.uid())
     where id=perm.id;
   end loop;
   return jsonb_build_object('success',true,'new_expiry',expiry);
 end if;
 raise exception 'Invalid action';
end;
$$;
revoke all on function public.manage_legacy_subscription(text,text,integer) from public,anon;
grant execute on function public.manage_legacy_subscription(text,text,integer) to authenticated;