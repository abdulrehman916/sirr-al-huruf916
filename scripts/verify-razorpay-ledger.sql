-- Database tests for Razorpay page purchases. Run with scripts/verify-razorpay-ledger.sh
-- against a throwaway database (never the live project).
\set ON_ERROR_STOP 1
\set O '00000000-0000-0000-0000-0000000000a0'
\set A '00000000-0000-0000-0000-0000000000a1'
\set B '00000000-0000-0000-0000-0000000000b2'
\set C '00000000-0000-0000-0000-0000000000c3'

insert into auth.users (id, email, email_confirmed_at) values
  (:'O', 'owner@example.com', now()), (:'A', 'a@example.com', now()),
  (:'B', 'b@example.com', now()), (:'C', 'c@example.com', null);
update public.profiles set role = 'owner' where id = :'O';

create or replace function pg_temp.expect_error(sql text, needle text) returns void language plpgsql as $$
begin
  execute sql;
  raise exception 'expected error containing %, but statement succeeded: %', needle, sql;
exception when others then
  if position(needle in sqlerrm) = 0 then raise exception 'expected %, got %', needle, sqlerrm; end if;
end $$;
grant execute on function pg_temp.expect_error(text, text) to public;

-- ── Owner sets prices ─────────────────────────────────────────────────────────
set role authenticated;
select set_config('request.jwt.claim.sub', :'O', false);
select public.owner_set_page_price('{"route_path":"/mizaan9","title":"Mizaan 9","price_minor":49900,"validity_days":30}');
select public.owner_set_page_price('{"route_path":"/plants","title":"Plants","price_minor":19900,"lifetime_access":true}');
select public.owner_set_page_price('{"route_path":"/section-c","title":"Section C","price_minor":9900,"validity_days":7}');
select pg_temp.expect_error($$select public.owner_set_page_price('{"route_path":"/admin/x","price_minor":500,"validity_days":1}')$$, 'Invalid page path');
select pg_temp.expect_error($$select public.owner_set_page_price('{"route_path":"/mizaan9","price_minor":50,"validity_days":1}')$$, 'Price must be');
do $$ begin assert jsonb_array_length(public.owner_page_prices()) = 3, 'owner sees three prices'; end $$;
-- Updating keeps one row per page.
select public.owner_set_page_price('{"route_path":"/mizaan9","title":"Mizaan 9","price_minor":49900,"validity_days":30}');
reset role;
do $$ begin
  assert (select count(*) from public.resources where metadata->>'route_path' = '/mizaan9') = 1, 'one resource per page';
end $$;

-- ── Customers cannot set prices or touch the server functions ────────────────
set role authenticated;
select set_config('request.jwt.claim.sub', :'A', false);
select pg_temp.expect_error($$select public.owner_set_page_price('{"route_path":"/mizaan9","price_minor":100,"validity_days":1}')$$, 'Owner access required');
select pg_temp.expect_error($$select public.owner_payment_orders('{}')$$, 'Owner access required');
select pg_temp.expect_error(format('select public.payment_create_order(%L, (select id from public.resources limit 1))', :'A'), 'permission denied');
select pg_temp.expect_error($$select public.payment_mark_paid('order_X','pay_X',1,'INR')$$, 'permission denied');
select pg_temp.expect_error($$insert into public.entitlements(user_id, resource_id, source) select auth.uid(), id, 'PURCHASE' from public.resources limit 1$$, 'permission denied');
do $$ begin
  assert not public.can_access_resource((select id from public.resources where metadata->>'route_path'='/mizaan9')), 'locked before payment';
  assert not public.can_access_legacy_page('/mizaan9'), 'legacy check locked before payment';
end $$;
reset role;

-- ── Server creates and pays an order ─────────────────────────────────────────
set role service_role;
create temp table t_ids (k text primary key, v text);
grant all on t_ids to public;
insert into t_ids select 'mizaan', id::text from public.resources where metadata->>'route_path'='/mizaan9';
insert into t_ids select 'plants', id::text from public.resources where metadata->>'route_path'='/plants';
insert into t_ids select 'sectionc', id::text from public.resources where metadata->>'route_path'='/section-c';

select pg_temp.expect_error(format('select public.payment_create_order(%L, %L)', :'C', (select v from t_ids where k='mizaan')), 'EMAIL_NOT_VERIFIED');
insert into t_ids select 'o1', public.payment_create_order(:'A', (select v::uuid from t_ids where k='mizaan'))->>'order_id';
do $$ declare r jsonb; begin
  perform public.payment_attach_provider_order((select v::uuid from t_ids where k='o1'), 'order_TEST000001');
  r := public.payment_create_order('00000000-0000-0000-0000-0000000000a1', (select v::uuid from t_ids where k='mizaan'));
  assert r->>'provider_order_id' = 'order_TEST000001' and (r->>'reused')::boolean, 'double click reuses the same order';
  assert (r->>'amount_minor')::bigint = 49900, 'server price, not browser price';
end $$;
select pg_temp.expect_error($$select public.payment_attach_provider_order((select v::uuid from t_ids where k='o1'), 'order_OTHER')$$, 'ORDER_NOT_PENDING');
select pg_temp.expect_error($$select public.payment_mark_paid('order_TEST000001','pay_TEST000001',100,'INR')$$, 'AMOUNT_MISMATCH');
select pg_temp.expect_error(format('select public.payment_mark_paid(%L,%L,49900,%L,%L)', 'order_TEST000001','pay_TEST000001','INR', :'B'), 'ORDER_USER_MISMATCH');
select pg_temp.expect_error($$select public.payment_mark_paid('order_UNKNOWN','pay_X',49900,'INR')$$, 'ORDER_NOT_FOUND');
do $$ declare r jsonb; again jsonb; begin
  r := public.payment_mark_paid('order_TEST000001','pay_TEST000001',49900,'inr','00000000-0000-0000-0000-0000000000a1');
  assert (r->>'already_paid')::boolean = false, 'first confirmation grants';
  assert abs(extract(epoch from ((r->>'expires_at')::timestamptz - now() - interval '30 days'))) < 60, '30 days validity';
  -- Browser callback and webhook both arrive: still one entitlement.
  again := public.payment_mark_paid('order_TEST000001','pay_TEST000001',49900,'INR');
  assert (again->>'already_paid')::boolean, 'second confirmation is a no-op';
  assert (select count(*) from public.entitlements where source='PURCHASE') = 1, 'exactly one entitlement';
  assert (select status from public.orders where provider_order_id='order_TEST000001') = 'PAID';
end $$;
reset role;

-- ── Only the bought page opens, only for the buyer ───────────────────────────
set role authenticated;
select set_config('request.jwt.claim.sub', :'A', false);
do $$ begin
  assert public.can_access_resource((select v::uuid from t_ids where k='mizaan')), 'buyer opens the page';
  assert public.can_access_legacy_page('/mizaan9'), 'child cards open too';
  assert not public.can_access_legacy_page('/plants'), 'other pages stay locked';
  assert not public.can_access_resource((select v::uuid from t_ids where k='plants')), 'other resources stay locked';
  assert exists(select 1 from jsonb_array_elements(public.legacy_permission_grants()) g
    where g->>'page_path'='/mizaan9' and g->>'source'='PURCHASE'), 'grant list includes the purchase';
  assert jsonb_array_length(public.my_page_purchases()) = 1, 'customer sees own purchase';
  assert (select count(*) from public.entitlements) = 1 and (select count(*) from public.orders) >= 1;
end $$;
select set_config('request.jwt.claim.sub', :'B', false);
do $$ begin
  assert not public.can_access_resource((select v::uuid from t_ids where k='mizaan')), 'another customer stays locked';
  assert (select count(*) from public.entitlements) = 0, 'RLS hides other customers entitlements';
  assert (select count(*) from public.orders) = 0, 'RLS hides other customers orders';
  assert jsonb_array_length(public.my_page_purchases()) = 0;
end $$;
reset role;

-- ── Renewal stacks after the current end; each purchase keeps its own dates ──
set role service_role;
do $$ declare first_end timestamptz; o2 uuid; r jsonb; begin
  select expires_at into first_end from public.entitlements where source='PURCHASE';
  o2 := (public.payment_create_order('00000000-0000-0000-0000-0000000000a1', (select v::uuid from t_ids where k='mizaan'))->>'order_id')::uuid;
  -- A fresh Razorpay order is needed because the first one is already paid.
  perform public.payment_attach_provider_order(o2, 'order_TEST000002');
  r := public.payment_mark_paid('order_TEST000002','pay_TEST000002',49900,'INR');
  assert (r->>'starts_at')::timestamptz = first_end, 'renewal starts when current access ends';
  assert (r->>'expires_at')::timestamptz = first_end + interval '30 days', 'renewal adds a new 30 day period';
  assert (select count(*) from public.entitlements where source='PURCHASE') = 2, 'one entitlement per purchase';
end $$;

-- Refund revokes only that purchase.
do $$ declare r jsonb; begin
  r := public.payment_mark_refunded('pay_TEST000002');
  assert (select status from public.orders where provider_payment_id='pay_TEST000002') = 'REFUNDED';
  assert (select revoked_at is not null from public.entitlements e join public.orders o on o.id=e.source_id where o.provider_payment_id='pay_TEST000002');
  assert (select revoked_at is null from public.entitlements e join public.orders o on o.id=e.source_id where o.provider_payment_id='pay_TEST000001');
end $$;

-- Lifetime purchase, then a repeat purchase is refused.
do $$ declare o3 uuid; begin
  o3 := (public.payment_create_order('00000000-0000-0000-0000-0000000000a1', (select v::uuid from t_ids where k='plants'))->>'order_id')::uuid;
  perform public.payment_attach_provider_order(o3, 'order_TEST000003');
  perform public.payment_mark_paid('order_TEST000003','pay_TEST000003',19900,'INR');
  assert (select expires_at is null from public.entitlements e where e.source_id=o3), 'lifetime has no end';
end $$;
select pg_temp.expect_error(format('select public.payment_create_order(%L, %L)', :'A', (select v from t_ids where k='plants')), 'ALREADY_LIFETIME');

-- Rate limit: ten unpaid orders per hour.
do $$ begin
  for i in 1..10 loop perform public.payment_create_order('00000000-0000-0000-0000-0000000000b2', (select v::uuid from t_ids where k='sectionc')); end loop;
end $$;
select pg_temp.expect_error(format('select public.payment_create_order(%L, %L)', :'B', (select v from t_ids where k='sectionc')), 'TOO_MANY_ATTEMPTS');

-- Webhook de-duplication.
do $$ begin
  assert public.payment_record_event('evt_1','payment.captured','order_TEST000001','pay_TEST000001','{}');
  assert not public.payment_record_event('evt_1','payment.captured','order_TEST000001','pay_TEST000001','{}');
end $$;
reset role;

-- ── Expiry locks the page by itself ──────────────────────────────────────────
update public.entitlements set expires_at = now() - interval '1 second'
 where resource_id = (select v::uuid from t_ids where k='mizaan');
set role authenticated;
select set_config('request.jwt.claim.sub', :'A', false);
do $$ begin
  assert not public.can_access_resource((select v::uuid from t_ids where k='mizaan')), 'expired purchase locks';
  assert not public.can_access_legacy_page('/mizaan9'), 'expired purchase locks child cards';
  assert public.can_access_resource((select v::uuid from t_ids where k='plants')), 'lifetime page still open';
end $$;
reset role;

-- ── Owner gift codes keep working (and are independent of purchases) ─────────
insert into public.platform_records (entity, data) values ('AccessCode', jsonb_build_object(
  'code','GIFT-1','page_paths',jsonb_build_array('/section-c'),'linked_user_id',:'B',
  'expiry_date',(now() + interval '2 hours')::text));
set role authenticated;
select set_config('request.jwt.claim.sub', :'B', false);
do $$ begin
  assert public.can_access_legacy_page('/section-c'), 'gift code opens its page';
  assert public.can_access_resource((select v::uuid from t_ids where k='sectionc')), 'gift code opens a priced page';
  assert not public.can_access_legacy_page('/mizaan9'), 'gift code opens nothing else';
end $$;
-- Owner archive = page no longer sold.
select set_config('request.jwt.claim.sub', :'O', false);
select public.owner_set_page_price('{"route_path":"/section-c","on_sale":false}');
do $$ begin
  assert jsonb_array_length((public.owner_payment_orders('{"status":"PAID"}'))->'orders') = 2, 'owner sees paid orders';
end $$;
reset role;
set role service_role;
select pg_temp.expect_error(format('select public.payment_create_order(%L, %L)', :'A', (select v from t_ids where k='sectionc')), 'NOT_FOR_SALE');
reset role;

-- ── Direct UPI payments approved by the owner ────────────────────────────────
\set D '00000000-0000-0000-0000-0000000000d4'
insert into auth.users (id, email, email_confirmed_at) values (:'D', 'd@example.com', now());
set role authenticated;
select set_config('request.jwt.claim.sub', :'O', false);
select public.owner_set_page_price('{"route_path":"/faal-hasrath","title":"Faal","price_minor":29900,"validity_days":10}');
select set_config('request.jwt.claim.sub', :'D', false);
do $$ begin
  assert (public.payment_options()->>'upi_enabled')::boolean = false, 'UPI is off until the owner turns it on';
end $$;
select pg_temp.expect_error($$select public.upi_submit_payment((select id from public.resources where metadata->>'route_path'='/faal-hasrath'), '123456789012')$$, 'UPI_DISABLED');
select pg_temp.expect_error($$select public.owner_payment_settings('{"upi_enabled":true,"upi_id":"me@okaxis"}')$$, 'Owner access required');
select set_config('request.jwt.claim.sub', :'O', false);
select pg_temp.expect_error($$select public.owner_payment_settings('{"upi_enabled":true,"upi_id":"not a upi"}')$$, 'Invalid UPI ID');
select public.owner_payment_settings('{"upi_enabled":true,"upi_id":"Owner.Name@okaxis","payee_name":"Sirr al-Huruf"}');
reset role;
set role anon;
do $$ begin
  assert public.payment_options()->>'upi_id' = 'owner.name@okaxis', 'payers see the UPI ID';
end $$;
reset role;
set role authenticated;
select set_config('request.jwt.claim.sub', :'D', false);
select pg_temp.expect_error($$select public.upi_submit_payment((select id from public.resources where metadata->>'route_path'='/faal-hasrath'), '12345')$$, 'INVALID_UTR');
select pg_temp.expect_error($$select public.upi_submit_payment((select id from public.resources where metadata->>'route_path'='/section-c'), '123456789012')$$, 'NOT_FOR_SALE');
create temp table t_upi as select (public.upi_submit_payment((select id from public.resources where metadata->>'route_path'='/faal-hasrath'), '1234 5678 9012')->>'order_id')::uuid id;
select pg_temp.expect_error($$select public.upi_submit_payment((select id from public.resources where metadata->>'route_path'='/faal-hasrath'), '123456789012')$$, 'UTR_ALREADY_USED');
select pg_temp.expect_error($$select public.owner_upi_decide((select id from t_upi), true)$$, 'Owner access required');
do $$ begin
  assert not public.can_access_legacy_page('/faal-hasrath'), 'no access before the owner approves';
  assert (select x->>'status' from jsonb_array_elements(public.my_page_purchases()) x limit 1) = 'PENDING', 'customer sees pending';
end $$;
select set_config('request.jwt.claim.sub', :'O', false);
do $$ declare r jsonb; begin
  assert jsonb_array_length(public.owner_payment_orders('{"provider":"upi","status":"PENDING"}')->'orders') = 1, 'owner sees the pending UPI payment';
  r := public.owner_upi_decide((select id from t_upi), true);
  assert r->>'status' = 'PAID';
  assert abs(extract(epoch from ((r->>'expires_at')::timestamptz - now() - interval '10 days'))) < 60, 'page validity applied';
  r := public.owner_upi_decide((select id from t_upi), true);
  assert (r->>'already_decided')::boolean, 'approving twice does nothing';
end $$;
select set_config('request.jwt.claim.sub', :'D', false);
do $$ begin
  assert public.can_access_legacy_page('/faal-hasrath'), 'approved UPI payment opens the page';
  assert not public.can_access_legacy_page('/mizaan9'), 'and nothing else';
end $$;
-- A rejected (fake) reference opens nothing.
create temp table t_upi2 as select (public.upi_submit_payment((select id from public.resources where metadata->>'route_path'='/plants'), '999999999999')->>'order_id')::uuid id;
select set_config('request.jwt.claim.sub', :'O', false);
do $$ begin
  assert public.owner_upi_decide((select id from t_upi2), false, 'Not in bank statement')->>'status' = 'FAILED';
end $$;
select set_config('request.jwt.claim.sub', :'D', false);
do $$ begin
  assert not public.can_access_legacy_page('/plants'), 'rejected payment opens nothing';
end $$;
reset role;

-- Step 4 (after merge) retires customer access requests.
\i supabase/manual/2026-10-31_step4_after_main_merge_disable_customer_requests.sql
set role authenticated;
select set_config('request.jwt.claim.sub', :'A', false);
select pg_temp.expect_error($$select public.request_page_access('{}')$$, 'permission denied');
reset role;

\echo 'PASS: payment ledger — UPI owner approval (bad UTR, reused UTR, reject, approve once), owner prices, server-only grants, idempotent payment, per-page isolation, renewals, refunds, expiry, gift codes.'
