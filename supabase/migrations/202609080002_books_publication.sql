-- Books publication and public catalogue access.
-- Full PDFs remain private in the private-documents storage bucket.
drop policy if exists "records_public_read" on public.platform_records;
create policy "records_public_read" on public.platform_records for select to anon
using (
  entity in ('ManagedPage', 'BookPublication', 'Product', 'ShopCategory', 'ShopBrand', 'SubscriptionPlanConfig')
  and coalesce(data ->> 'status', data ->> 'product_status', 'PUBLISHED') in ('PUBLISHED', 'active', 'ACTIVE')
  and coalesce((data ->> 'is_active')::boolean, true)
);

drop policy if exists "records_authenticated_read" on public.platform_records;
create policy "records_authenticated_read" on public.platform_records for select to authenticated
using (
  owner_id = auth.uid() or public.current_role() in ('editor', 'admin', 'owner')
  or (entity in ('ManagedPage', 'BookPublication', 'Product', 'ShopCategory', 'ShopBrand', 'SubscriptionPlanConfig')
    and coalesce(data ->> 'status', data ->> 'product_status', 'PUBLISHED') in ('PUBLISHED', 'active', 'ACTIVE')
    and coalesce((data ->> 'is_active')::boolean, true))
);
