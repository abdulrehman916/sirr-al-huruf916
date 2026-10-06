create or replace function public.manage_access_code_detail(p_action text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare rec public.platform_records%rowtype;
  target_id uuid;
  patch jsonb;
  grants jsonb;
  page_key text;
  page_value jsonb;
  expiry timestamptz;
  units text;
  count_units integer;
begin
 if auth.uid() is null or not exists(
   select 1 from public.profiles where id=auth.uid() and role='owner' and status='active'
 ) then raise exception 'Owner access required' using errcode='42501'; end if;
 target_id := nullif(p_payload->>'code_id','')::uuid;
 if target_id is null then raise exception 'code_id required'; end if;
 select * into rec from public.platform_records
   where id=target_id and entity='AccessCode' for update;
 if not found then raise exception 'Code not found'; end if;
 if p_action='delete' then
   delete from public.platform_records where id=target_id;
   return jsonb_build_object('success',true);
 elsif p_action='reset_device' then
   patch := rec.data - 'device_id' - 'device_fingerprint';
 elsif p_action='update' then
   patch := rec.data || (coalesce(p_payload->'update_data','{}'::jsonb)
      - 'id' - 'code' - 'linked_user_id' - 'linked_user_email'
      - 'is_disabled' - 'created_by' - 'used_by_user_id' - 'used_by_email');
   if jsonb_typeof(patch->'page_paths') <> 'array' then raise exception 'Invalid pages'; end if;
 elsif p_action='renew' then
   units := p_payload->>'duration_type';
   count_units := coalesce((p_payload->>'duration_count')::integer,1);
   if units='LIFETIME' then expiry := null;
   elsif units='CUSTOM' then expiry := (p_payload->>'custom_date')::timestamptz;
   elsif units in ('MINUTES','HOURS','DAYS','WEEKS','MONTHS','YEARS') then
     if count_units < 1 or count_units > 1000 then raise exception 'Invalid duration'; end if;
     expiry := now() + case units
       when 'MINUTES' then count_units*interval '1 minute'
       when 'HOURS' then count_units*interval '1 hour'
       when 'DAYS' then count_units*interval '1 day'
       when 'WEEKS' then count_units*interval '7 days'
       when 'MONTHS' then count_units*interval '30 days'
       else count_units*interval '365 days' end;
   else raise exception 'Invalid duration type'; end if;
   if expiry is not null and expiry<=now() then raise exception 'Expiry must be in the future'; end if;
   grants := '{}'::jsonb;
   for page_key,page_value in select key,value from jsonb_each(coalesce(rec.data->'page_grants','{}'::jsonb))
   loop grants := grants || jsonb_build_object(page_key,
     page_value || jsonb_build_object('expires_at',expiry,'renewed_at',now())); end loop;
   patch := rec.data || jsonb_build_object(
      'expiry_date',expiry,'page_grants',grants,'last_renewed_at',now(),
      'renewal_count',coalesce((rec.data->>'renewal_count')::integer,0)+1);
 else raise exception 'Unsupported action'; end if;
 update public.platform_records set data=patch where id=target_id;
 return jsonb_build_object('success',true);
end;
$$;
revoke all on function public.manage_access_code_detail(text,jsonb) from public,anon;
grant execute on function public.manage_access_code_detail(text,jsonb) to authenticated;