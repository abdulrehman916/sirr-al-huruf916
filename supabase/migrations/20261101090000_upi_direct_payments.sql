-- Direct UPI payments to the owner's own bank account, approved by the owner.
--
-- The customer pays the shown amount to the owner's UPI ID, then submits the
-- 12-digit UPI reference (UTR). The owner checks it against the bank and
-- approves; approval grants exactly that page through the same ledger as
-- Razorpay (orders / order_items / entitlements). Additive only.

create table if not exists public.payment_settings (
  id boolean primary key default true check (id),
  upi_enabled boolean not null default false,
  upi_id text,
  payee_name text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);
insert into public.payment_settings (id) values (true) on conflict (id) do nothing;
alter table public.payment_settings enable row level security;
revoke all on public.payment_settings from public, anon, authenticated;

-- What the checkout may offer. The UPI ID is meant to be shown to payers.
create or replace function public.payment_options()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'upi_enabled', s.upi_enabled and coalesce(s.upi_id, '') <> '',
    'upi_id', case when s.upi_enabled then s.upi_id end,
    'payee_name', case when s.upi_enabled then s.payee_name end)
  from public.payment_settings s where s.id;
$$;
revoke all on function public.payment_options() from public;
grant execute on function public.payment_options() to anon, authenticated;

create or replace function public.owner_payment_settings(p_payload jsonb default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_upi text; v_name text;
begin
  if public.current_role() <> 'owner' then raise exception 'Owner access required' using errcode = '42501'; end if;
  if p_payload is not null then
    v_upi := lower(trim(coalesce(p_payload->>'upi_id', '')));
    v_name := left(trim(coalesce(p_payload->>'payee_name', '')), 80);
    if v_upi <> '' and v_upi !~ '^[a-z0-9._-]{2,64}@[a-z0-9.-]{2,64}$' then raise exception 'Invalid UPI ID'; end if;
    if coalesce((p_payload->>'upi_enabled')::boolean, false) and v_upi = '' then raise exception 'Invalid UPI ID'; end if;
    update public.payment_settings set upi_id = nullif(v_upi, ''), payee_name = nullif(v_name, ''),
      upi_enabled = coalesce((p_payload->>'upi_enabled')::boolean, false), updated_at = now(), updated_by = auth.uid()
     where id;
  end if;
  return (select jsonb_build_object('upi_enabled', upi_enabled, 'upi_id', upi_id, 'payee_name', payee_name, 'updated_at', updated_at)
          from public.payment_settings where id);
end; $$;
revoke all on function public.owner_payment_settings(jsonb) from public, anon;
grant execute on function public.owner_payment_settings(jsonb) to authenticated;

-- Customer: record a UPI payment for one page. Access waits for the owner.
create or replace function public.upi_submit_payment(p_resource_id uuid, p_utr text)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_user record; v_res public.resources%rowtype; v_order public.orders%rowtype;
  v_utr text := regexp_replace(coalesce(p_utr, ''), '\s', '', 'g'); v_pending integer;
begin
  if not exists(select 1 from public.payment_settings where id and upi_enabled and coalesce(upi_id, '') <> '') then
    raise exception 'UPI_DISABLED';
  end if;
  select p.id, p.status, a.email, a.email_confirmed_at into v_user
    from public.profiles p join auth.users a on a.id = p.id where p.id = auth.uid();
  if not found or v_user.status <> 'active' then raise exception 'SIGN_IN_REQUIRED' using errcode = '42501'; end if;
  if v_user.email is null or v_user.email_confirmed_at is null then raise exception 'EMAIL_NOT_VERIFIED'; end if;
  if v_utr !~ '^[0-9]{12}$' then raise exception 'INVALID_UTR'; end if;

  select * into v_res from public.resources where id = p_resource_id;
  if not found or v_res.status <> 'PUBLISHED' or v_res.access_mode <> 'PAID' or v_res.resource_type <> 'PAGE'
     or v_res.price_minor < 100 or v_res.currency <> 'INR'
     or (not v_res.lifetime_access and v_res.validity_days is null) then raise exception 'NOT_FOR_SALE'; end if;
  if exists(select 1 from public.entitlements e where e.user_id = v_user.id and e.resource_id = v_res.id
            and e.revoked_at is null and e.expires_at is null) then raise exception 'ALREADY_LIFETIME'; end if;

  perform pg_advisory_xact_lock(hashtext('upi:' || v_utr));
  if exists(select 1 from public.orders where provider_payment_id = v_utr) then raise exception 'UTR_ALREADY_USED'; end if;
  select count(*) into v_pending from public.orders
   where user_id = v_user.id and provider = 'upi' and status = 'PENDING';
  if v_pending >= 5 then raise exception 'TOO_MANY_PENDING'; end if;

  insert into public.orders (user_id, customer_email, status, subtotal_minor, total_minor, currency, provider, provider_payment_id)
  values (v_user.id, lower(v_user.email), 'PENDING', v_res.price_minor, v_res.price_minor, 'INR', 'upi', v_utr)
  returning * into v_order;
  update public.orders set provider_order_id = 'upi_' || v_order.id where id = v_order.id;
  insert into public.order_items (order_id, resource_id, quantity, unit_price_minor, validity_days, lifetime_access)
  values (v_order.id, v_res.id, 1, v_res.price_minor, v_res.validity_days, v_res.lifetime_access);
  return jsonb_build_object('success', true, 'order_id', v_order.id, 'status', 'PENDING');
end; $$;
revoke all on function public.upi_submit_payment(uuid, text) from public, anon;
grant execute on function public.upi_submit_payment(uuid, text) to authenticated;

-- Owner: approve (grants access with the page's validity) or reject.
create or replace function public.owner_upi_decide(p_order_id uuid, p_approve boolean, p_note text default null)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_order public.orders%rowtype; v_result jsonb;
begin
  if public.current_role() <> 'owner' then raise exception 'Owner access required' using errcode = '42501'; end if;
  select * into v_order from public.orders where id = p_order_id and provider = 'upi' for update;
  if not found then raise exception 'ORDER_NOT_FOUND'; end if;
  if v_order.status <> 'PENDING' then
    return jsonb_build_object('success', true, 'status', v_order.status, 'already_decided', true);
  end if;
  if p_approve then
    v_result := public.payment_mark_paid(v_order.provider_order_id, v_order.provider_payment_id, v_order.total_minor, v_order.currency);
    return v_result || jsonb_build_object('status', 'PAID');
  end if;
  update public.orders set status = 'FAILED', failure_reason = left(coalesce(nullif(trim(p_note), ''), 'Rejected by owner'), 200)
   where id = v_order.id;
  return jsonb_build_object('success', true, 'status', 'FAILED');
end; $$;
revoke all on function public.owner_upi_decide(uuid, boolean, text) from public, anon;
grant execute on function public.owner_upi_decide(uuid, boolean, text) to authenticated;

-- Owner order list and customer purchase list now include UPI payments.
create or replace function public.owner_payment_orders(p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  v_status text := nullif(p_payload->>'status','');
  v_provider text := nullif(p_payload->>'provider','');
  v_limit integer := least(greatest(coalesce(nullif(p_payload->>'limit','')::integer, 50), 1), 100);
  v_before_at timestamptz := nullif(p_payload->>'before_created_at','')::timestamptz;
  v_before_id uuid := nullif(p_payload->>'before_id','')::uuid;
  v_search text := lower(trim(coalesce(p_payload->>'search','')));
  v_rows jsonb;
begin
  if public.current_role() <> 'owner' then raise exception 'Owner access required' using errcode = '42501'; end if;
  select coalesce(jsonb_agg(row_data order by created_at desc, id desc), '[]'::jsonb) into v_rows from (
    select o.created_at, o.id, jsonb_build_object(
      'id', o.id, 'provider', o.provider, 'customer_email', o.customer_email, 'status', o.status,
      'total_minor', o.total_minor, 'currency', o.currency,
      'provider_order_id', o.provider_order_id, 'provider_payment_id', o.provider_payment_id,
      'paid_at', o.paid_at, 'created_at', o.created_at, 'failure_reason', o.failure_reason,
      'route_path', r.metadata->>'route_path', 'page_title', r.title,
      'validity_days', i.validity_days, 'lifetime_access', i.lifetime_access,
      'access_starts_at', e.starts_at, 'access_expires_at', e.expires_at, 'access_revoked_at', e.revoked_at) row_data
    from public.orders o
    left join public.order_items i on i.order_id = o.id
    left join public.resources r on r.id = i.resource_id
    left join public.entitlements e on e.source = 'PURCHASE' and e.source_id = o.id
    where o.provider in ('razorpay', 'upi')
      and (v_provider is null or o.provider = v_provider)
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

create or replace function public.my_page_purchases()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'order_id', o.id, 'provider', o.provider, 'status', o.status, 'total_minor', o.total_minor, 'currency', o.currency,
    'paid_at', o.paid_at, 'created_at', o.created_at, 'provider_payment_id', o.provider_payment_id,
    'failure_reason', o.failure_reason,
    'route_path', r.metadata->>'route_path', 'page_title', r.title,
    'access_starts_at', e.starts_at, 'access_expires_at', e.expires_at, 'access_revoked_at', e.revoked_at)
    order by o.created_at desc), '[]'::jsonb)
  from (select * from public.orders where user_id = auth.uid()
          and (status in ('PAID','REFUNDED') or provider = 'upi')
          and provider in ('razorpay', 'upi')
        order by created_at desc limit 200) o
  left join public.order_items i on i.order_id = o.id
  left join public.resources r on r.id = i.resource_id
  left join public.entitlements e on e.source = 'PURCHASE' and e.source_id = o.id;
$$;
revoke all on function public.my_page_purchases() from public, anon;
grant execute on function public.my_page_purchases() to authenticated;

create index if not exists orders_provider_status_idx on public.orders (provider, status, created_at desc);
