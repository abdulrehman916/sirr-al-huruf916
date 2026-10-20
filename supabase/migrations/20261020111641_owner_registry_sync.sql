-- Synchronize new selectors without overwriting existing access/pricing choices.
create or replace function public.sync_owner_registry(p_kind text,p_items jsonb)
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare item jsonb; target_entity text; item_path text; feature text; created_count integer:=0; unchanged_count integer:=0;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='owner' and status='active') then
   raise exception 'Owner access required' using errcode='42501'; end if;
 if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items)>1000 then raise exception 'Invalid registry'; end if;
 if p_kind not in ('pages','modules') then raise exception 'Invalid registry kind'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext('sirr-owner-registry'));
 target_entity:=case when p_kind='pages' then 'PageVisibilityConfig' else 'FeatureConfig' end;
 for item in select value from jsonb_array_elements(p_items) loop
   item_path:=case when p_kind='pages' then item->>'path' else item->>'page_path' end;
   if item_path is null or item_path not like '/%' or item_path like '/admin/%' or item_path like '%:%' then
     raise exception 'Invalid content path'; end if;
   feature:=case when p_kind='modules' then item->>'module_id' else null end;
   if p_kind='modules' and nullif(feature,'') is null then raise exception 'Module ID required'; end if;
   if exists(select 1 from public.platform_records where entity=target_entity and data->>'page_path'=item_path
      and (p_kind='pages' or data->>'feature_id'=feature)) then unchanged_count:=unchanged_count+1;
   else
     insert into public.platform_records(entity,owner_id,data) values(target_entity,auth.uid(),
       case when p_kind='pages' then jsonb_build_object('page_path',item_path,'page_name',item->>'page_name',
         'requires_permission',coalesce((item->>'requires_permission')::boolean,true),'admin_only',false,'archived',false)
       else jsonb_build_object('page_path',item_path,'page_name',item->>'page_name','feature_id',feature,
         'feature_name',item->>'module_name','module_type',item->>'module_type','icon',item->>'icon',
         'sort_order',coalesce((item->>'sort_order')::integer,0),'is_active',true,'requires_permission',true) end);
     created_count:=created_count+1;
   end if;
 end loop;
 return jsonb_build_object('success',true,'created',created_count,'unchanged',unchanged_count,'updated',0,
   'archived',0,'deactivated',0,'total_routes',jsonb_array_length(p_items),'total_modules',jsonb_array_length(p_items));
end;
$$;
revoke all on function public.sync_owner_registry(text,jsonb) from public,anon;
grant execute on function public.sync_owner_registry(text,jsonb) to authenticated;
