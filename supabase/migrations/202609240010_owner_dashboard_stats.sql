create or replace function public.owner_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  caller_role text;
  today_start timestamptz := date_trunc('day', now());
  tomorrow_start timestamptz := date_trunc('day', now()) + interval '1 day';
  week_end timestamptz := date_trunc('day', now()) + interval '8 days';
  result jsonb;
begin
  select p.role into caller_role
  from public.profiles p
  where p.id = auth.uid() and p.status = 'active';

  if caller_role not in ('owner', 'admin') then
    raise exception 'Owner or admin access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'total_users', (select count(*) from public.profiles where role = 'customer'),
    'active_users', (select count(*) from public.profiles where role = 'customer' and status = 'active'),
    'blocked_users', (select count(*) from public.profiles where role = 'customer' and status = 'disabled'),
    'expired_users', (
      select count(distinct pr.owner_id)
      from public.platform_records pr
      where pr.entity = 'PagePermission'
        and coalesce((pr.data->>'is_revoked')::boolean, false) = false
        and nullif(pr.data->>'expiry_date', '')::timestamptz <= now()
    ),
    'active_permissions', (
      select count(*) from public.platform_records pr
      where pr.entity = 'PagePermission'
        and coalesce((pr.data->>'is_active')::boolean, true) = true
        and coalesce((pr.data->>'is_revoked')::boolean, false) = false
        and (nullif(pr.data->>'expiry_date', '') is null or (pr.data->>'expiry_date')::timestamptz > now())
    ),
    'renewals_today', (
      select count(*) from public.platform_records pr
      where pr.entity in ('PagePermission', 'Subscription')
        and pr.updated_at >= today_start
    ),
    'expiring_today', (
      select count(*) from public.platform_records pr
      where pr.entity = 'PagePermission'
        and nullif(pr.data->>'expiry_date', '')::timestamptz >= today_start
        and nullif(pr.data->>'expiry_date', '')::timestamptz < tomorrow_start
        and coalesce((pr.data->>'is_revoked')::boolean, false) = false
    ),
    'expiring_tomorrow', (
      select count(*) from public.platform_records pr
      where pr.entity = 'PagePermission'
        and nullif(pr.data->>'expiry_date', '')::timestamptz >= tomorrow_start
        and nullif(pr.data->>'expiry_date', '')::timestamptz < tomorrow_start + interval '1 day'
        and coalesce((pr.data->>'is_revoked')::boolean, false) = false
    ),
    'expiring_7days', (
      select count(*) from public.platform_records pr
      where pr.entity = 'PagePermission'
        and nullif(pr.data->>'expiry_date', '')::timestamptz >= tomorrow_start
        and nullif(pr.data->>'expiry_date', '')::timestamptz < week_end
        and coalesce((pr.data->>'is_revoked')::boolean, false) = false
    ),
    'pending_support', (
      select count(*) from public.platform_records pr
      where pr.entity in ('SupportConversation', 'SupportTicket')
        and upper(coalesce(pr.data->>'status', 'OPEN')) in ('OPEN', 'IN_PROGRESS')
    ),
    'pending_requests', (
      select count(*) from public.platform_records pr
      where pr.entity in ('AccessRequest', 'PremiumAccessRequest')
        and upper(coalesce(pr.data->>'status', 'PENDING')) = 'PENDING'
    ),
    'recent_renewals', (
      select count(*) from public.platform_records pr
      where pr.entity in ('PagePermission', 'Subscription')
        and pr.updated_at >= now() - interval '7 days'
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.owner_dashboard_stats() from public, anon;
grant execute on function public.owner_dashboard_stats() to authenticated;
