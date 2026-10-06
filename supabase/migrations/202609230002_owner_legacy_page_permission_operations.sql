create or replace function public.manage_page_permission(p_action text,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare rec public.platform_records%rowtype;
  target_user uuid;
  target_id uuid;
  page_path text;
  perm_id text;
  new_data jsonb;
begin
 if auth.uid() is null or not exists(select 1 from public.profiles where id=auth.uid() and role='owner' and status='active')
 then raise exception 'Owner access required' using errcode='42501'; end if;
 if p_action='grant' then
   target_user := (p_payload->>'user_id')::uuid;
   page_path := p_payload->>'page_path';
   if page_path is null or page_path not like '/%' or page_path like '/admin/%'
      or not exists(select 1 from public.profiles where id=target_user and role='customer')
   then raise exception 'Valid customer and content page are required'; end if;
   select * into rec from public.platform_records where entity='PagePermission'
     and data->>'user_id'=target_user::text and data->>'page_path'=page_path
     and coalesce((data->>'is_active')::boolean,false)
     and not coalesce((data->>'is_revoked')::boolean,false)
     order by updated_at desc limit 1 for update;
   if found then
     update public.platform_records set data=rec.data ||
       jsonb_build_object('expiry_date',p_payload->>'expiry_date','last_extended_by',auth.uid())
     where id=rec.id;
     perm_id := rec.data->>'permission_id';
   else
     perm_id := 'PERM-' || upper(replace(gen_random_uuid()::text,'-',''));
     insert into public.platform_records(entity,data,owner_id) values(
       'PagePermission',jsonb_build_object('permission_id',perm_id,
       'user_id',target_user,'page_path',page_path,'page_name',p_payload->>'page_name',
       'permission_code',p_payload->>'permission_code','start_date',coalesce(p_payload->>'start_date',now()::text),
       'expiry_date',p_payload->>'expiry_date','is_active',true,'is_revoked',false,
       'granted_at',now(),'granted_by',auth.uid()),auth.uid());
   end if;
   return jsonb_build_object('success',true,'permission_id',perm_id);
 end if;
 perm_id := p_payload->>'permission_id';
 select * into rec from public.platform_records where entity='PagePermission' and data->>'permission_id'=perm_id
 order by updated_at desc limit 1 for update;
 if not found then raise exception 'Permission not found'; end if;
 if p_action='revoke' then new_data := rec.data || jsonb_build_object('is_revoked',true,'revoked_at',now(),'revoked_by',auth.uid());
 elsif p_action='extend' then
   if nullif(p_payload->>'new_expiry_date','') is null then raise exception 'New expiry required'; end if;
   new_data := rec.data || jsonb_build_object('expiry_date',p_payload->>'new_expiry_date','last_extended_by',auth.uid());
 else raise exception 'Unsupported action'; end if;
 update public.platform_records set data=new_data where id=rec.id;
 return jsonb_build_object('success',true,'permission_id',perm_id);
end;
$$;
revoke all on function public.manage_page_permission(text,jsonb) from public, anon;
grant execute on function public.manage_page_permission(text,jsonb) to authenticated;