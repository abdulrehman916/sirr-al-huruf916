-- STEP 3 — Read-only check after the migration. Every row should say ok = true.
select 'payment functions installed' as check, count(*) = 10 as ok from pg_proc
 where proname in ('payment_create_order','payment_attach_provider_order','payment_mark_paid','payment_mark_failed',
   'payment_mark_refunded','payment_record_event','owner_set_page_price','owner_page_prices','owner_payment_orders','my_page_purchases')
union all select 'customers cannot run payment functions',
  not has_function_privilege('authenticated', 'public.payment_mark_paid(text,text,bigint,text,uuid)', 'execute')
union all select 'server can run payment functions',
  has_function_privilege('service_role', 'public.payment_mark_paid(text,text,bigint,text,uuid)', 'execute')
union all select 'gift codes unchanged', (select count(*) from public.platform_records where entity = 'AccessCode')
  = (select count(*) from backup_20261031_razorpay.access_codes)
union all select 'orders unchanged', (select count(*) from public.orders) >= (select count(*) from backup_20261031_razorpay.orders)
union all select 'entitlements unchanged', (select count(*) from public.entitlements) >= (select count(*) from backup_20261031_razorpay.entitlements);
