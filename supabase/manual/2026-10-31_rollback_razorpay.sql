-- ROLLBACK — only if the Razorpay migration must be undone. Restores the three
-- original function definitions saved in STEP 1 and switches online sales off.
-- No customer, order, entitlement or gift-code row is deleted.
do $$
declare d text;
begin
  for d in select definition from backup_20261031_razorpay.function_definitions loop
    execute d;
  end loop;
end $$;
revoke all on function public.can_access_legacy_page(text) from public, anon;
grant execute on function public.can_access_legacy_page(text) to authenticated;
grant execute on function public.request_page_access(jsonb) to authenticated; -- undo step 4 if it was run

-- Stop selling online (pages fall back to the previous gift-code-only lock).
update public.resources set status = 'ARCHIVED'
 where resource_type = 'PAGE' and metadata->>'sold_online' = 'true' and status = 'PUBLISHED';

drop function if exists public.payment_create_order(uuid, uuid);
drop function if exists public.payment_attach_provider_order(uuid, text);
drop function if exists public.payment_mark_paid(text, text, bigint, text, uuid);
drop function if exists public.payment_mark_failed(text, text);
drop function if exists public.payment_mark_refunded(text);
drop function if exists public.payment_record_event(text, text, text, text, jsonb);
drop function if exists public.owner_set_page_price(jsonb);
drop function if exists public.owner_page_prices();
drop function if exists public.owner_payment_orders(jsonb);
drop function if exists public.my_page_purchases();
-- Tables, columns and indexes added by the migration are left in place (they hold
-- payment history and do not change access on their own).
