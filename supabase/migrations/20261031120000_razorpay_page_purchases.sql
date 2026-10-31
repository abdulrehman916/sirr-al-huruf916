-- Razorpay page purchases on the existing orders / order_items / entitlements ledger.
--
-- Additive and idempotent: no table is dropped, no existing row is deleted or
-- rewritten. Access is granted only by the payment_* functions below, which
-- are executable by the server (service_role) after Razorpay signature checks.
-- Owner gift codes (AccessCode records) keep working unchanged.

-- ── Ledger hardening ─────────────────────────────────────────────────────────
alter table public.orders add column if not exists failure_reason text;

-- One purchase entitlement per paid order, even if the browser callback and the
-- webhook arrive at the same moment.
create unique index if not exists entitlements_purchase_once_idx
  on public.entitlements (source_id) where source = 'PURCHASE';
create index if not exists entitlements_user_active_idx
  on public.entitlements (user_id, expires_at desc) where revoked_at is null;
create index if not exists orders_status_created_idx
  on public.orders (status, created_at desc, id desc);
create index if not exists orders_user_pending_idx
  on public.orders (user_id, created_at desc) where status = 'PENDING';
-- Gift-code checks run on every premium page open; index the linked user.
create index if not exists platform_records_access_code_user_idx
  on public.platform_records ((data->>'linked_user_id')) where entity = 'AccessCode';
create index if not exists resources_page_route_idx
  on public.resources ((metadata->>'route_path')) where resource_type = 'PAGE';

-- Webhook delivery log, used for de-duplication and audit. Server-only.
create table if not exists public.payment_events (
  event_id text primary key,
  event_type text not null,
  provider_order_id text,
  provider_payment_id text,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now()
);
create index if not exists payment_events_order_idx on public.payment_events (provider_order_id);
alter table public.payment_events enable row level security;
revoke all on public.payment_events from public, anon, authenticated;

-- ── Purchase grants ──────────────────────────────────────────────────────────
-- Active purchase entitlements for one route, for the signed-in user.
create or replace function private.purchase_grants(p_user uuid)
returns table(page_path text, page_name text, expiry_date timestamptz, granted_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select r.metadata->>'route_path', coalesce(nullif(r.title->>'ml',''), nullif(r.title->>'en',''), r.slug),
         e.expires_at, e.starts_at
  from public.entitlements e
  join public.resources r on r.id = e.resource_id
  where e.user_id = p_user and e.revoked_at is null
    and (e.expires_at is null or e.expires_at > now())
    and r.resource_type = 'PAGE' and r.metadata->>'route_path' is not null;
$$;
revoke all on function private.purchase_grants(uuid) from public, anon, authenticated;

-- A paid page also opens through the legacy page check used by multi-card pages.
create or replace function public.can_access_legacy_page(p_path text) returns boolean
language sql stable security definer set search_path = '' as $$
select auth.uid() is not null and exists(select 1 from public.profiles where id=auth.uid() and status='active') and (
exists(select 1 from public.platform_records c where c.entity='AccessCode'
and c.data->>'linked_user_id'=auth.uid()::text
and (nullif(c.data->>'linked_session_id','') is null or c.data->>'linked_session_id'=auth.jwt()->>'session_id')
and private.code_page_active(c.data,p_path))
or exists(select 1 from public.platform_records p where p.entity='PagePermission' and p.data->>'user_id'=auth.uid()::text and p.data->>'page_path'=p_path
and coalesce((p.data->>'is_active')::boolean,false) and not coalesce((p.data->>'is_revoked')::boolean,false)
and (nullif(p.data->>'expiry_date','') is null or (p.data->>'expiry_date')::timestamptz>now()))
or exists(select 1 from private.purchase_grants(auth.uid()) g where g.page_path=p_path));
$$;
revoke all on function public.can_access_legacy_page(text) from public, anon;
grant execute on function public.can_access_legacy_page(text) to authenticated;

-- Purchases appear in the same grant list as codes, so child cards and
-- Section A/B database reads unlock for the bought page (and only that page).
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
), purchase as (
 select jsonb_build_object('page_path',g.page_path,'page_name',g.page_name,'expiry_date',g.expiry_date,
 'granted_at',g.granted_at,'source','PURCHASE','sub_features','[]'::jsonb,'feature_expiries','{}'::jsonb) item
 from private.purchase_grants((select id from actor)) g
)
select coalesce(jsonb_agg(item),'[]') from (
 select item from code_grants union all select item from direct_grants union all select item from purchase
) all_grants;
$$;
revoke all on function private.legacy_permission_grants() from public,anon;
grant execute on function private.legacy_permission_grants() to authenticated;

-- Same rule as the live definition (owner bypass only), restated in full.
create or replace function public.can_access_resource(target uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists(
    select 1 from public.resources r
    where r.id=target and r.status='PUBLISHED' and
      (r.access_mode='FREE' or
       (exists(select 1 from public.profiles p where p.id=auth.uid() and p.status='active')
        and (r.access_mode='LOGIN'
         or public.current_role()='owner'
         or exists(select 1 from public.entitlements e where e.user_id=auth.uid()
           and e.resource_id=r.id and e.revoked_at is null
           and (e.expires_at is null or e.expires_at>now()))
         or (r.metadata->>'route_path' is not null
           and public.can_access_legacy_page(r.metadata->>'route_path')))))
  );
$$;

-- ── Owner: page prices ───────────────────────────────────────────────────────
create or replace function public.owner_set_page_price(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_path text := trim(coalesce(p_payload->>'route_path',''));
  v_title text := left(trim(coalesce(p_payload->>'title','')), 200);
  v_price bigint := nullif(p_payload->>'price_minor','')::bigint;
  v_days integer := nullif(p_payload->>'validity_days','')::integer;
  v_lifetime boolean := coalesce((p_payload->>'lifetime_access')::boolean, false);
  v_on_sale boolean := coalesce((p_payload->>'on_sale')::boolean, true);
  v_row public.resources%rowtype;
begin
  if public.current_role() <> 'owner' then raise exception 'Owner access required' using errcode = '42501'; end if;
  if v_path !~ '^/[a-z0-9/_-]{1,120}$' or v_path like '/admin%' then raise exception 'Invalid page path'; end if;
  if v_on_sale then
    if v_price is null or v_price < 100 or v_price > 50000000 then raise exception 'Price must be between ₹1 and ₹5,00,000'; end if;
    if not v_lifetime and (v_days is null or v_days < 1 or v_days > 3650) then raise exception 'Validity must be 1–3650 days'; end if;
  end if;
  perform pg_advisory_xact_lock(hashtext('page_price:' || v_path));
  select * into v_row from public.resources
   where resource_type = 'PAGE' and metadata->>'route_path' = v_path
   order by (status = 'PUBLISHED') desc, updated_at desc limit 1 for update;
  if not found then
    if not v_on_sale then return jsonb_build_object('success', true, 'on_sale', false); end if;
    insert into public.resources (slug, resource_type, title, status, access_mode, price_minor, currency,
      validity_days, lifetime_access, metadata, owner_id)
    values ('page' || replace(v_path, '/', '-') || '-' || substr(md5(v_path), 1, 6), 'PAGE',
      jsonb_build_object('ml', v_title, 'en', v_title), 'PUBLISHED', 'PAID', v_price, 'INR',
      case when v_lifetime then null else v_days end, v_lifetime,
      jsonb_build_object('route_path', v_path, 'sold_online', true), auth.uid())
    returning * into v_row;
  else
    update public.resources set
      title = case when v_title <> '' then title || jsonb_build_object('ml', v_title, 'en', v_title) else title end,
      status = case when v_on_sale then 'PUBLISHED' else 'ARCHIVED' end,
      access_mode = 'PAID',
      price_minor = coalesce(v_price, price_minor), currency = 'INR',
      validity_days = case when v_lifetime then null else coalesce(v_days, validity_days) end,
      lifetime_access = v_lifetime,
      metadata = metadata || jsonb_build_object('sold_online', true),
      owner_id = coalesce(owner_id, auth.uid())
    where id = v_row.id returning * into v_row;
  end if;
  return jsonb_build_object('success', true, 'resource_id', v_row.id, 'on_sale', v_row.status = 'PUBLISHED');
end; $$;
revoke all on function public.owner_set_page_price(jsonb) from public, anon;
grant execute on function public.owner_set_page_price(jsonb) to authenticated;

create or replace function public.owner_page_prices()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select case when public.current_role() <> 'owner' then '[]'::jsonb else coalesce(jsonb_agg(jsonb_build_object(
    'resource_id', r.id, 'route_path', r.metadata->>'route_path', 'title', r.title,
    'on_sale', r.status = 'PUBLISHED', 'price_minor', r.price_minor, 'currency', r.currency,
    'validity_days', r.validity_days, 'lifetime_access', r.lifetime_access, 'updated_at', r.updated_at)
    order by r.metadata->>'route_path'), '[]'::jsonb) end
  from public.resources r
  where r.resource_type = 'PAGE' and r.access_mode = 'PAID' and r.metadata->>'route_path' is not null;
$$;
revoke all on function public.owner_page_prices() from public, anon;
grant execute on function public.owner_page_prices() to authenticated;

-- Keyset-paginated order list for the owner (safe at any table size).
create or replace function public.owner_payment_orders(p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  v_status text := nullif(p_payload->>'status','');
  v_limit integer := least(greatest(coalesce(nullif(p_payload->>'limit','')::integer, 50), 1), 100);
  v_before_at timestamptz := nullif(p_payload->>'before_created_at','')::timestamptz;
  v_before_id uuid := nullif(p_payload->>'before_id','')::uuid;
  v_search text := lower(trim(coalesce(p_payload->>'search','')));
  v_rows jsonb;
begin
  if public.current_role() <> 'owner' then raise exception 'Owner access required' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(row_data order by created_at desc, id desc), '[]'::jsonb) into v_rows from (
    select o.created_at, o.id, jsonb_build_object(
      'id', o.id, 'customer_email', o.customer_email, 'status', o.status,
      'total_minor', o.total_minor, 'currency', o.currency,
      'provider_order_id', o.provider_order_id, 'provider_payment_id', o.provider_payment_id,
      'paid_at', o.paid_at, 'created_at', o.created_at, 'failure_reason', o.failure_reason,
      'route_path', r.metadata->>'route_path', 'page_title', r.title,
      'access_starts_at', e.starts_at, 'access_expires_at', e.expires_at, 'access_revoked_at', e.revoked_at) row_data
    from public.orders o
    left join public.order_items i on i.order_id = o.id
    left join public.resources r on r.id = i.resource_id
    left join public.entitlements e on e.source = 'PURCHASE' and e.source_id = o.id
    where o.provider = 'razorpay'
      and (v_status is null or o.status = v_status)
      and (v_search = '' or lower(o.customer_email) like '%' || v_search || '%' or o.provider_payment_id = v_search or o.provider_order_id = v_search)
      and (v_before_at is null or (o.created_at, o.id) < (v_before_at, v_before_id))
    order by o.created_at desc, o.id desc
    limit v_limit
  ) page;
  return jsonb_build_object('orders', v_rows);
end; $$;
revoke all on function public.owner_payment_orders(jsonb) from public, anon;
grant execute on function public.owner_payment_orders(jsonb) to authenticated;

-- ── Customer: own purchases ──────────────────────────────────────────────────
create or replace function public.my_page_purchases()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'order_id', o.id, 'status', o.status, 'total_minor', o.total_minor, 'currency', o.currency,
    'paid_at', o.paid_at, 'created_at', o.created_at, 'provider_payment_id', o.provider_payment_id,
    'route_path', r.metadata->>'route_path', 'page_title', r.title,
    'access_starts_at', e.starts_at, 'access_expires_at', e.expires_at, 'access_revoked_at', e.revoked_at)
    order by o.created_at desc), '[]'::jsonb)
  from (select * from public.orders where user_id = auth.uid() and provider = 'razorpay'
          and status in ('PAID','REFUNDED') order by created_at desc limit 200) o
  left join public.order_items i on i.order_id = o.id
  left join public.resources r on r.id = i.resource_id
  left join public.entitlements e on e.source = 'PURCHASE' and e.source_id = o.id;
$$;
revoke all on function public.my_page_purchases() from public, anon;
grant execute on function public.my_page_purchases() to authenticated;

-- ── Server-only payment operations (service_role) ────────────────────────────
create or replace function public.payment_create_order(p_user_id uuid, p_resource_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_user record; v_res public.resources%rowtype; v_order public.orders%rowtype; v_recent integer;
begin
  select p.id, p.status, a.email, a.email_confirmed_at into v_user
    from public.profiles p join auth.users a on a.id = p.id where p.id = p_user_id;
  if not found or v_user.status <> 'active' then raise exception 'ACCOUNT_INACTIVE'; end if;
  if v_user.email is null or v_user.email_confirmed_at is null then raise exception 'EMAIL_NOT_VERIFIED'; end if;

  select * into v_res from public.resources where id = p_resource_id;
  if not found or v_res.status <> 'PUBLISHED' or v_res.access_mode <> 'PAID' or v_res.resource_type <> 'PAGE'
     or v_res.price_minor < 100 or v_res.currency <> 'INR' then raise exception 'NOT_FOR_SALE'; end if;
  if not v_res.lifetime_access and v_res.validity_days is null then raise exception 'NOT_FOR_SALE'; end if;

  if exists(select 1 from public.entitlements e where e.user_id = p_user_id and e.resource_id = v_res.id
            and e.revoked_at is null and e.expires_at is null) then raise exception 'ALREADY_LIFETIME'; end if;

  perform pg_advisory_xact_lock(hashtext('order:' || p_user_id::text));

  -- Reuse a fresh unpaid order for the same page and price (double clicks, retries).
  select o.* into v_order from public.orders o join public.order_items i on i.order_id = o.id
   where o.user_id = p_user_id and o.status = 'PENDING' and o.provider = 'razorpay'
     and i.resource_id = v_res.id and i.unit_price_minor = v_res.price_minor
     and o.provider_order_id is not null and o.created_at > now() - interval '30 minutes'
     and i.validity_days is not distinct from v_res.validity_days and i.lifetime_access = v_res.lifetime_access
   order by o.created_at desc limit 1;
  if found then
    return jsonb_build_object('order_id', v_order.id, 'provider_order_id', v_order.provider_order_id,
      'amount_minor', v_order.total_minor, 'currency', v_order.currency, 'email', v_order.customer_email,
      'reused', true, 'title', v_res.title, 'validity_days', v_res.validity_days, 'lifetime_access', v_res.lifetime_access);
  end if;

  select count(*) into v_recent from public.orders
   where user_id = p_user_id and status = 'PENDING' and created_at > now() - interval '1 hour';
  if v_recent >= 10 then raise exception 'TOO_MANY_ATTEMPTS'; end if;

  insert into public.orders (user_id, customer_email, status, subtotal_minor, total_minor, currency, provider)
  values (p_user_id, lower(v_user.email), 'PENDING', v_res.price_minor, v_res.price_minor, 'INR', 'razorpay')
  returning * into v_order;
  insert into public.order_items (order_id, resource_id, quantity, unit_price_minor, validity_days, lifetime_access)
  values (v_order.id, v_res.id, 1, v_res.price_minor, v_res.validity_days, v_res.lifetime_access);

  return jsonb_build_object('order_id', v_order.id, 'provider_order_id', null,
    'amount_minor', v_order.total_minor, 'currency', v_order.currency, 'email', v_order.customer_email,
    'reused', false, 'title', v_res.title, 'validity_days', v_res.validity_days, 'lifetime_access', v_res.lifetime_access);
end; $$;

create or replace function public.payment_attach_provider_order(p_order_id uuid, p_provider_order_id text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  update public.orders set provider_order_id = p_provider_order_id
   where id = p_order_id and status = 'PENDING' and provider_order_id is null;
  if not found then raise exception 'ORDER_NOT_PENDING'; end if;
  return jsonb_build_object('success', true);
end; $$;

-- Marks an order paid and grants access exactly once. Callers must have
-- verified the Razorpay signature and the captured payment first.
create or replace function public.payment_mark_paid(
  p_provider_order_id text, p_provider_payment_id text, p_amount_minor bigint, p_currency text,
  p_expected_user_id uuid default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_order public.orders%rowtype; v_item public.order_items%rowtype;
  v_start timestamptz; v_end timestamptz; v_ent public.entitlements%rowtype;
begin
  select * into v_order from public.orders where provider_order_id = p_provider_order_id for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if p_expected_user_id is not null and v_order.user_id <> p_expected_user_id then raise exception 'ORDER_USER_MISMATCH'; end if;

  if v_order.status = 'PAID' then
    select * into v_ent from public.entitlements where source = 'PURCHASE' and source_id = v_order.id;
    return jsonb_build_object('success', true, 'already_paid', true, 'order_id', v_order.id,
      'expires_at', v_ent.expires_at, 'starts_at', v_ent.starts_at);
  end if;
  if v_order.status in ('REFUNDED','CANCELLED') then raise exception 'ORDER_CLOSED'; end if;
  if p_amount_minor <> v_order.total_minor or upper(p_currency) <> v_order.currency then
    raise exception 'AMOUNT_MISMATCH';
  end if;

  select * into v_item from public.order_items where order_id = v_order.id limit 1;
  if not found then raise exception 'ORDER_ITEM_MISSING'; end if;

  -- A renewal starts when the customer's current access for this page ends,
  -- so no paid time is lost. Each purchase keeps its own expiry date.
  perform pg_advisory_xact_lock(hashtext('ent:' || v_order.user_id::text || ':' || v_item.resource_id::text));
  select greatest(now(), coalesce(max(expires_at), now())) into v_start from public.entitlements
   where user_id = v_order.user_id and resource_id = v_item.resource_id and revoked_at is null and expires_at > now();
  v_start := coalesce(v_start, now());
  v_end := case when v_item.lifetime_access then null else v_start + make_interval(days => v_item.validity_days) end;

  update public.orders set status = 'PAID', provider_payment_id = p_provider_payment_id, paid_at = now(), failure_reason = null
   where id = v_order.id;
  insert into public.entitlements (user_id, resource_id, source, source_id, starts_at, expires_at)
  values (v_order.user_id, v_item.resource_id, 'PURCHASE', v_order.id, v_start, v_end)
  on conflict (source_id) where source = 'PURCHASE' do nothing;

  return jsonb_build_object('success', true, 'already_paid', false, 'order_id', v_order.id,
    'starts_at', v_start, 'expires_at', v_end);
end; $$;

create or replace function public.payment_mark_failed(p_provider_order_id text, p_reason text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
begin
  update public.orders set failure_reason = left(coalesce(p_reason, 'FAILED'), 200)
   where provider_order_id = p_provider_order_id and status = 'PENDING';
  return jsonb_build_object('success', true);
end; $$;

create or replace function public.payment_mark_refunded(p_provider_payment_id text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where provider_payment_id = p_provider_payment_id for update;
  if not found then return jsonb_build_object('success', false, 'reason', 'ORDER_NOT_FOUND'); end if;
  update public.orders set status = 'REFUNDED' where id = v_order.id and status = 'PAID';
  update public.entitlements set revoked_at = now()
   where source = 'PURCHASE' and source_id = v_order.id and revoked_at is null;
  return jsonb_build_object('success', true, 'order_id', v_order.id);
end; $$;

create or replace function public.payment_record_event(p_event_id text, p_event_type text,
  p_provider_order_id text, p_provider_payment_id text, p_payload jsonb)
returns boolean language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.payment_events (event_id, event_type, provider_order_id, provider_payment_id, payload)
  values (p_event_id, p_event_type, p_provider_order_id, p_provider_payment_id, coalesce(p_payload, '{}'::jsonb))
  on conflict (event_id) do nothing;
  return found;
end; $$;

do $$
declare fn text;
begin
  foreach fn in array array[
    'public.payment_create_order(uuid,uuid)',
    'public.payment_attach_provider_order(uuid,text)',
    'public.payment_mark_paid(text,text,bigint,text,uuid)',
    'public.payment_mark_failed(text,text)',
    'public.payment_mark_refunded(text)',
    'public.payment_record_event(text,text,text,text,jsonb)'
  ] loop
    execute format('revoke all on function %s from public, anon, authenticated', fn);
    execute format('grant execute on function %s to service_role', fn);
  end loop;
end $$;

