-- STEP 1 — Backup before the Razorpay migration. Read-only for existing data:
-- it only COPIES rows and function definitions into a new schema.
-- Run in Supabase Dashboard → SQL Editor → New query → paste → Run.
create schema if not exists backup_20261031_razorpay;
revoke all on schema backup_20261031_razorpay from public, anon, authenticated;

create table backup_20261031_razorpay.resources    as select * from public.resources;
create table backup_20261031_razorpay.orders       as select * from public.orders;
create table backup_20261031_razorpay.order_items  as select * from public.order_items;
create table backup_20261031_razorpay.entitlements as select * from public.entitlements;
create table backup_20261031_razorpay.access_codes as select * from public.platform_records where entity = 'AccessCode';

-- Exact live definitions of the three functions the migration replaces.
create table backup_20261031_razorpay.function_definitions as
select p.oid::regprocedure::text as signature, pg_get_functiondef(p.oid) as definition
from pg_proc p
where p.oid in (
  'public.can_access_legacy_page(text)'::regprocedure,
  'private.legacy_permission_grants()'::regprocedure,
  'public.can_access_resource(uuid)'::regprocedure);

-- Show what was saved (row counts) so it can be checked before continuing.
select 'resources' as saved, count(*) from backup_20261031_razorpay.resources
union all select 'orders', count(*) from backup_20261031_razorpay.orders
union all select 'order_items', count(*) from backup_20261031_razorpay.order_items
union all select 'entitlements', count(*) from backup_20261031_razorpay.entitlements
union all select 'access_codes', count(*) from backup_20261031_razorpay.access_codes
union all select 'functions', count(*) from backup_20261031_razorpay.function_definitions
union all select 'duplicate purchase entitlements (must be 0)', count(*) from (
  select source_id from public.entitlements where source = 'PURCHASE' group by source_id having count(*) > 1) d;
