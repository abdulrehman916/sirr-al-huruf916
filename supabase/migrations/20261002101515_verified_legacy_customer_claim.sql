
create or replace function public.claim_base44_legacy_data() returns jsonb language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); mail text; linked integer:=0;
begin
select lower(trim(a.email)) into mail from auth.users a join public.profiles p on p.id=a.id where a.id=uid and a.email_confirmed_at is not null and p.status='active';
if mail is null then return jsonb_build_object('linked',0); end if;
update private.base44_user_map set profile_id=uid,linked_at=now(),updated_at=now() where email_normalized=mail and (profile_id is null or profile_id=uid);
update public.platform_records r set owner_id=uid,data=r.data||jsonb_build_object('user_id',uid::text),updated_at=now()
where r.entity in ('UserAccessProfile','PagePermission','Subscription','ApprovedUser','AccessRequest','SubscriptionRequest','VIPAccess','SupportTickets','SupportMessage')
and exists(select 1 from private.base44_user_map m where m.profile_id=uid and (r.data->>'_base44_legacy_user_id'=m.legacy_user_id or lower(trim(coalesce(r.data->>'user_email',r.data->>'customer_email',r.data->>'email','')))=mail));
get diagnostics linked=row_count;
return jsonb_build_object('linked',linked);
end; $$;
revoke all on function public.claim_base44_legacy_data() from public,anon;
grant execute on function public.claim_base44_legacy_data() to authenticated;
create or replace function public.linked_code_permissions() returns jsonb language sql stable security definer set search_path='' as $$
select coalesce(jsonb_agg(jsonb_build_object('code',c.data->>'code','page_paths',a.paths,'page_names',a.names,
'page_grants',coalesce(c.data->'page_grants','{}'::jsonb),'expiry_date',c.data->>'expiry_date')),'[]'::jsonb)
from public.platform_records c cross join lateral (
select jsonb_agg(p order by n) paths,jsonb_agg(coalesce(c.data->'page_names'->>(n::int-1),p) order by n) names
from jsonb_array_elements_text(coalesce(c.data->'page_paths','[]'::jsonb)) with ordinality t(p,n) where private.code_page_active(c.data,p)) a
where c.entity='AccessCode' and c.data->>'linked_user_id'=auth.uid()::text and a.paths is not null
and (nullif(c.data->>'linked_session_id','') is null or c.data->>'linked_session_id'=auth.jwt()->>'session_id')
and exists(select 1 from public.profiles where id=auth.uid() and status='active');
$$;
