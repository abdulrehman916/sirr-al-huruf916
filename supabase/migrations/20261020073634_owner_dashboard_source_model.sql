-- Dashboard reads remain independent and bounded. No code/permission mutations.
create or replace function private.dashboard_timestamp(value text)
returns timestamptz language plpgsql stable set search_path = '' as $$
begin
  return nullif(value, '')::timestamptz;
exception when invalid_datetime_format or datetime_field_overflow then
  return null;
end;
$$;
revoke all on function private.dashboard_timestamp(text) from public, anon, authenticated;

create or replace function public.owner_dashboard_stats()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  caller_role text;
  result jsonb;
begin
  select role into caller_role from public.profiles where id = auth.uid() and status = 'active';
  -- NULL must fail closed for unregistered, disabled and anonymous callers.
  if auth.uid() is null or coalesce(caller_role, '') not in ('owner','admin') then
    raise exception 'Owner or admin access required' using errcode = '42501';
  end if;
  with codes as materialized (
    select id, data, coalesce(data->>'_base44_legacy_id',id::text) public_id,
      data->>'is_disabled' = 'true' disabled
    from public.platform_records where entity = 'AccessCode'
  ), pages as materialized (
    select c.id,c.public_id,c.data,coalesce(c.disabled,false) disabled,p.path,
      coalesce(c.data->'page_names'->>(p.ordinality::int - 1),p.path) page_name,
      case when jsonb_typeof(c.data->'page_grants'->p.path)='object'
                  and (c.data->'page_grants'->p.path) ? 'expires_at'
        then c.data->'page_grants'->p.path->>'expires_at'
        else c.data->>'expiry_date' end expiry_text,
      lower(trim(coalesce(nullif(c.data->>'linked_user_email',''),c.data->>'email',''))) email
    from codes c cross join lateral jsonb_array_elements_text(
      case when jsonb_typeof(c.data->'page_paths')='array' then
        case when jsonb_array_length(c.data->'page_paths')>0 then c.data->'page_paths' else '[null]'::jsonb end
        else '[null]'::jsonb end
    ) with ordinality p(path,ordinality)
  ), windows as materialized (
    select *,private.dashboard_timestamp(expiry_text) expiry,
      nullif(expiry_text,'') is null lifetime from pages
  ), code_windows as (
    select id,bool_or(disabled) disabled,bool_or(lifetime) lifetime,
      bool_or(lifetime or coalesce(expiry>now(),false)) active,
      min(expiry) filter(where expiry>now()) next_expiry
    from windows group by id
  ), summaries as (
    select path,min(page_name) name,count(distinct nullif(email,'')) customers,
      count(distinct id) codes,count(distinct id) filter(where expiry>now() and expiry<=now()+interval '7 days') expiring
    from windows where not disabled and path is not null group by path
  ), due as (
    select distinct public_id id,data->>'code' code,email,page_name page,expiry
    from windows where not disabled and path is not null and expiry>now() and expiry<=now()+interval '7 days'
    order by expiry,public_id,page_name limit 8
  ), customer_emails as (
    select lower(trim(email)) email from public.profiles where role='customer'
    union select lower(trim(data->>'email')) from public.platform_records where entity='UserAccessProfile'
    union select email from windows
  ), renewals as (
    select private.dashboard_timestamp(r->>'renewed_at') renewed_at
    from codes c cross join lateral jsonb_array_elements(
      case when jsonb_typeof(c.data->'renewal_history')='array' then c.data->'renewal_history' else '[]'::jsonb end
    ) r
  )
  select jsonb_build_object(
    'total_users',(select count(*) from customer_emails e where nullif(email,'') is not null
      and not exists(select 1 from public.profiles p where lower(p.email)=e.email and p.role in ('owner','admin'))
      and not exists(select 1 from public.platform_records a where a.entity='AdminProfile' and lower(a.data->>'email')=e.email)),
    'active_users',(select count(*) from public.profiles where role='customer' and status='active'),
    'blocked_users',(select count(*) from public.profiles where role='customer' and status='disabled'),
    'total_codes',(select count(*) from codes),
    'active_codes',(select count(*) from code_windows where not disabled and active),
    'expired_codes',(select count(*) from code_windows where not disabled and not active),
    'disabled_codes',(select count(*) from code_windows where disabled),
    'lifetime_codes',(select count(*) from code_windows where not disabled and lifetime),
    'expiring_7days',(select count(*) from code_windows where not disabled and active and next_expiry<now()+interval '7 days'),
    'expiring_today',(select count(*) from code_windows where not disabled and active and next_expiry<((now() at time zone 'Asia/Dubai')::date+1)::timestamp at time zone 'Asia/Dubai'),
    'expiring_tomorrow',(select count(*) from code_windows where not disabled and active and next_expiry>=((now() at time zone 'Asia/Dubai')::date+1)::timestamp at time zone 'Asia/Dubai' and next_expiry<((now() at time zone 'Asia/Dubai')::date+2)::timestamp at time zone 'Asia/Dubai'),
    'renewals_today',(select count(*) from renewals where renewed_at>=((now() at time zone 'Asia/Dubai')::date)::timestamp at time zone 'Asia/Dubai' and renewed_at<=now()),
    'recent_renewals',(select count(*) from renewals where renewed_at>=now()-interval '7 days' and renewed_at<=now()),
    'recent_redeems',(select count(*) from codes where private.dashboard_timestamp(data->>'used_at') between now()-interval '7 days' and now()),
    'pending_support',(select count(*) from public.platform_records where entity in ('SupportTickets','SupportConversation') and upper(coalesce(data->>'status','OPEN')) in ('OPEN','IN_PROGRESS')),
    'pending_requests',(select count(*) from public.platform_records where entity in ('AccessRequest','PremiumAccessRequest') and upper(coalesce(data->>'status','PENDING'))='PENDING'),
    'active_permissions',(select count(*) from public.platform_records where entity='PagePermission' and coalesce(data->>'is_active','true')='true' and coalesce(data->>'is_revoked','false')<>'true' and (nullif(data->>'expiry_date','') is null or private.dashboard_timestamp(data->>'expiry_date')>now())),
    'renewals_due',coalesce((select jsonb_agg(to_jsonb(due) order by expiry,id,page) from due),'[]'::jsonb),
    'page_summary',coalesce((select jsonb_agg(to_jsonb(summaries) order by name,path) from summaries),'[]'::jsonb)
  ) into result;
  return result;
end;
$$;
revoke all on function public.owner_dashboard_stats() from public, anon;
grant execute on function public.owner_dashboard_stats() to authenticated;
