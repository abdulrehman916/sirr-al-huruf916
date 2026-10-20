-- Feature timers and sections are enforced by the database as well as the UI.
create or replace function private.code_feature_expiry(d jsonb,p_path text,p_feature text)
returns timestamptz language plpgsql stable security invoker set search_path=''
as $$ declare f jsonb:=d->'feature_durations'->(p_path||':'||p_feature); base timestamptz;
begin
 if f is null then return case when coalesce(d->'page_grants','{}') ? p_path then (d#>>array['page_grants',p_path,'expires_at'])::timestamptz else (d->>'expiry_date')::timestamptz end; end if;
 if coalesce((f->>'is_lifetime')::boolean,false) then return null; end if;
 if nullif(f->>'expiry_date','') is not null then return (f->>'expiry_date')::timestamptz; end if;
 base:=coalesce(nullif(f->>'added_at',''),d#>>array['page_grants',p_path,'granted_at'],d->>'_record_created_at',d->>'created_date',d->>'linked_at',d->>'used_at')::timestamptz;
 if base is null then return '-infinity'::timestamptz; end if;
 if nullif(f->>'duration_ms','') is not null then return base+(f->>'duration_ms')::numeric*interval '1 millisecond'; end if;
 if nullif(f->>'duration_days','') is not null then return base+(f->>'duration_days')::numeric*interval '1 day'; end if;
 return case when coalesce(d->'page_grants','{}') ? p_path then (d#>>array['page_grants',p_path,'expires_at'])::timestamptz else (d->>'expiry_date')::timestamptz end;
end; $$;
revoke all on function private.code_feature_expiry(jsonb,text,text) from public,anon,authenticated;

create or replace function private.legacy_permission_grants()
returns jsonb language sql stable security definer set search_path=''
as $$
with actor as (select id from public.profiles where id=auth.uid() and status='active'),
code_grants as (
 select jsonb_build_object('page_path',p.path,'page_name',coalesce(c.data->'page_names'->>(p.ordinality::integer-1),p.path),
 'expiry_date',case when coalesce(c.data->'page_grants','{}') ? p.path then c.data#>>array['page_grants',p.path,'expires_at'] else c.data->>'expiry_date' end,
 'granted_at',c.data#>>array['page_grants',p.path,'granted_at'],'code',c.data->>'code',
 'sub_features',coalesce(c.data->'sub_features'->p.path,'[]'),
 'feature_expiries',coalesce((select jsonb_object_agg(f,jsonb_build_object('expiry_date',private.code_feature_expiry(c.data||jsonb_build_object('_record_created_at',c.created_at),p.path,f)))
 from jsonb_array_elements_text(coalesce(c.data->'sub_features'->p.path,'[]')) f),'{}')) item
 from public.platform_records c cross join lateral jsonb_array_elements_text(coalesce(c.data->'page_paths','[]')) with ordinality p(path,ordinality)
 where c.entity='AccessCode' and c.data->>'linked_user_id'=(select id::text from actor)
 and (nullif(c.data->>'linked_session_id','') is null or c.data->>'linked_session_id'=auth.jwt()->>'session_id')
 and private.code_page_active(c.data,p.path)
), direct_grants as (
 select jsonb_build_object('page_path',data->>'page_path','page_name',data->>'page_name','expiry_date',data->>'expiry_date',
 'granted_at',data->>'granted_at','sub_features',coalesce(data->'sub_features','[]'),'feature_expiries',coalesce(data->'feature_expiries','{}')) item
 from public.platform_records where entity='PagePermission' and data->>'user_id'=(select id::text from actor)
 and coalesce((data->>'is_active')::boolean,false) and not coalesce((data->>'is_revoked')::boolean,false)
 and (nullif(data->>'expiry_date','') is null or (data->>'expiry_date')::timestamptz>now())
)
select coalesce(jsonb_agg(item),'[]') from (select item from code_grants union all select item from direct_grants) all_grants;
$$;
revoke all on function private.legacy_permission_grants() from public,anon;
grant execute on function private.legacy_permission_grants() to authenticated;
create or replace function public.legacy_permission_grants() returns jsonb language sql stable security invoker set search_path=''
as $$ select private.legacy_permission_grants(); $$;
revoke all on function public.legacy_permission_grants() from public,anon;
grant execute on function public.legacy_permission_grants() to authenticated;

create or replace function private.can_read_holy_section(p_section text)
returns boolean language plpgsql stable security definer set search_path=''
as $$ declare grant_record jsonb; expiry timestamptz; selected jsonb;
begin
 if public.current_role()='owner' then return true; end if;
 if exists(select 1 from public.platform_records where entity='FeatureConfig' and data->>'page_path'='/holy-names'
 and data->>'feature_id'=p_section and coalesce((data->>'is_active')::boolean,true)
 and data->>'requires_permission'='false') then return true; end if;
 for grant_record in select value from jsonb_array_elements(private.legacy_permission_grants()) loop
   if grant_record->>'page_path'<>'/holy-names' then continue; end if;
   selected:=coalesce(grant_record->'sub_features','[]');
   if jsonb_array_length(selected)>0 and not selected ? p_section then continue; end if;
   expiry:=(grant_record#>>array['feature_expiries',p_section,'expiry_date'])::timestamptz;
   if grant_record->'feature_expiries' ? p_section then
     if expiry is null or expiry>now() then return true; end if;
   else return true; end if;
 end loop;
 return false;
end; $$;
revoke all on function private.can_read_holy_section(text) from public;
grant usage on schema private to anon;
grant execute on function private.can_read_holy_section(text) to anon,authenticated;
create policy section_b_entitled_read on public.platform_records for select to anon,authenticated
using ((entity='HolyOnePDFName' or (entity='HolyNameImportedSection' and data->>'source_section'='section_b'))
 and (select private.can_read_holy_section('section_b')));
create policy section_a_entitled_read on public.platform_records for select to anon,authenticated
using ((entity='HolyOneName' or (entity='HolyNameImportedSection' and data->>'source_section'='section_a'))
 and (select private.can_read_holy_section('section_a')));

-- Safe public pricing metadata, with full configuration retained for the owner.
create or replace function private.feature_configs(p_path text default null)
returns jsonb language sql stable security definer set search_path=''
as $$ select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'created_at',r.created_at,'updated_at',r.updated_at,'data',
 case when public.current_role()='owner' then r.data else jsonb_build_object('config_id',r.data->>'config_id','page_path',r.data->>'page_path',
 'feature_id',r.data->>'feature_id','feature_name',r.data->>'feature_name','page_name',r.data->>'page_name','requires_permission',r.data->'requires_permission',
 'description',r.data->>'description','price',r.data->>'price','icon',r.data->>'icon','is_active',coalesce(r.data->'is_active','true'),
 'sort_order',r.data->'sort_order') end)),'[]') from public.platform_records r where r.entity='FeatureConfig'
 and (p_path is null or r.data->>'page_path'=p_path) and (public.current_role()='owner' or coalesce((r.data->>'is_active')::boolean,true)); $$;
revoke all on function private.feature_configs(text) from public;
grant execute on function private.feature_configs(text) to anon,authenticated;
create or replace function public.feature_configs(p_path text default null) returns jsonb language sql stable security invoker set search_path=''
as $$ select private.feature_configs(p_path); $$;
revoke all on function public.feature_configs(text) from public;
grant execute on function public.feature_configs(text) to anon,authenticated;
