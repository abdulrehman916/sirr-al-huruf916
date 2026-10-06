
create or replace function public.current_role() returns text language sql stable security definer set search_path='' as $$
select coalesce((select role from public.profiles where id=auth.uid() and status='active'),'customer');
$$;
create or replace function private.code_page_active(d jsonb,p text) returns boolean language sql stable set search_path='' as $$
select not coalesce((d->>'is_disabled')::boolean,false)
and coalesce(d->'page_paths','[]'::jsonb) ? p
and case when coalesce(d->'page_grants','{}'::jsonb) ? p
then nullif(d#>>array['page_grants',p,'expires_at'],'') is null or (d#>>array['page_grants',p,'expires_at'])::timestamptz>now()
else nullif(d->>'expiry_date','') is null or (d->>'expiry_date')::timestamptz>now() end;
$$;
create or replace function public.can_access_legacy_page(p_path text) returns boolean language sql stable security definer set search_path='' as $$
select auth.uid() is not null and exists(select 1 from public.profiles where id=auth.uid() and status='active') and (
exists(select 1 from public.platform_records c where c.entity='AccessCode'
and c.data->>'linked_user_id'=auth.uid()::text
and (nullif(c.data->>'linked_session_id','') is null or c.data->>'linked_session_id'=auth.jwt()->>'session_id')
and private.code_page_active(c.data,p_path))
or exists(select 1 from public.platform_records p where p.entity='PagePermission' and p.data->>'user_id'=auth.uid()::text and p.data->>'page_path'=p_path
and coalesce((p.data->>'is_active')::boolean,false) and not coalesce((p.data->>'is_revoked')::boolean,false)
and (nullif(p.data->>'expiry_date','') is null or (p.data->>'expiry_date')::timestamptz>now())));
$$;
create or replace function public.linked_code_permissions() returns jsonb language sql stable security definer set search_path='' as $$
select coalesce(jsonb_agg(jsonb_build_object('code',c.data->>'code','page_paths',a.paths,'page_names',coalesce(c.data->'page_names','[]'::jsonb),
'page_grants',coalesce(c.data->'page_grants','{}'::jsonb),'expiry_date',c.data->>'expiry_date')),'[]'::jsonb)
from public.platform_records c cross join lateral (select jsonb_agg(p) paths from jsonb_array_elements_text(coalesce(c.data->'page_paths','[]'::jsonb)) p where private.code_page_active(c.data,p)) a
where c.entity='AccessCode' and c.data->>'linked_user_id'=auth.uid()::text and a.paths is not null
and (nullif(c.data->>'linked_session_id','') is null or c.data->>'linked_session_id'=auth.jwt()->>'session_id')
and exists(select 1 from public.profiles where id=auth.uid() and status='active');
$$;
create or replace function public.redeem_access_code(p_code text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.platform_records%rowtype; u public.profiles%rowtype; sid text:=auth.jwt()->>'session_id'; bound text; permissions jsonb; pages jsonb; already boolean;
begin
select p.* into u from public.profiles p join auth.users a on a.id=p.id where p.id=auth.uid() and p.status='active' and a.email_confirmed_at is not null;
if not found then raise exception 'ആദ്യം email ഉപയോഗിച്ച് login ചെയ്യുക.' using errcode='42501'; end if;
if u.role<>'customer' then raise exception 'Customer account ഉപയോഗിക്കുക.'; end if;
select * into r from public.platform_records where entity='AccessCode' and upper(data->>'code')=upper(trim(p_code)) for update;
if not found or coalesce((r.data->>'is_disabled')::boolean,false) then raise exception 'Code ലഭ്യമല്ല അല്ലെങ്കിൽ block ചെയ്തിരിക്കുന്നു.'; end if;
bound:=lower(trim(coalesce(nullif(r.data->>'linked_user_email',''),nullif(r.data->>'email',''),'')));
if bound<>'' and bound<>lower(trim(u.email)) then raise exception 'ഈ code മറ്റൊരു email-നുള്ളതാണ്.' using errcode='42501'; end if;
if nullif(r.data->>'linked_user_id','') is not null and r.data->>'linked_user_id'<>u.id::text then raise exception 'Code മറ്റൊരു account-ൽ ഉപയോഗിച്ചിട്ടുണ്ട്.'; end if;
if nullif(r.data->>'linked_session_id','') is not null and r.data->>'linked_session_id' is distinct from sid then raise exception 'മറ്റൊരു device/session-ൽ code ഉപയോഗത്തിലാണ്. Owner-നോട് device reset ആവശ്യപ്പെടുക.'; end if;
already:=r.data->>'linked_user_id'=u.id::text;
if not coalesce(already,false) and coalesce((r.data->>'use_count')::integer,0)>=coalesce((r.data->>'max_uses')::integer,1)
and nullif(r.data->>'used_by_user_id','') is not null and r.data->>'used_by_user_id' not like 'guest_%' then raise exception 'Code ഇതിനകം ഉപയോഗിച്ചു.'; end if;
select jsonb_agg(jsonb_build_object('page_path',p,'page_name',coalesce(r.data->'page_names'->>ordinality::int-1,p),
'expiry_date',case when coalesce(r.data->'page_grants','{}'::jsonb)?p then r.data#>>array['page_grants',p,'expires_at'] else r.data->>'expiry_date' end)),
jsonb_agg(jsonb_build_object('path',p,'name',coalesce(r.data->'page_names'->>ordinality::int-1,p))) into permissions,pages
from jsonb_array_elements_text(coalesce(r.data->'page_paths','[]'::jsonb)) with ordinality t(p,ordinality)
where private.code_page_active(r.data,p);
if permissions is null then raise exception 'Code-ന്റെ കാലാവധി കഴിഞ്ഞു.'; end if;
update public.platform_records set data=data||jsonb_build_object('linked_user_id',u.id,'linked_user_email',u.email,'linked_session_id',sid,
'used_by_user_id',u.id,'used_by_email',u.email,'used_at',coalesce(data->>'used_at',now()::text),'linked_at',coalesce(data->>'linked_at',now()::text),
'use_count',case when coalesce(already,false) then coalesce((data->>'use_count')::int,1) else greatest(1,coalesce((data->>'use_count')::int,0)+1) end) where id=r.id;
return jsonb_build_object('success',true,'linked',true,'message','Code നിങ്ങളുടെ email account-ലേക്ക് ചേർത്തു.','permissions',permissions,'pages_granted',pages);
end; $$;
revoke all on function public.redeem_access_code(text) from public,anon;
grant execute on function public.redeem_access_code(text) to authenticated;
revoke all on function private.code_page_active(jsonb,text) from public,anon,authenticated;
revoke all on function public.can_access_legacy_page(text),public.linked_code_permissions() from public,anon;
grant execute on function public.can_access_legacy_page(text),public.linked_code_permissions() to authenticated;
