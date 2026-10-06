-- Safe scale foundations: add foreign-key and high-volume ownership indexes,
-- and let Postgres evaluate Supabase identity/role helpers once per statement.
create index if not exists base44_user_map_profile_idx
  on private.base44_user_map (profile_id);
create index if not exists access_requests_resource_idx
  on public.access_requests (resource_id);
create index if not exists access_requests_user_idx
  on public.access_requests (user_id);
create index if not exists coupons_created_by_idx
  on public.coupons (created_by);
create index if not exists coupons_resource_idx
  on public.coupons (resource_id);
create index if not exists entitlements_resource_idx
  on public.entitlements (resource_id);
create index if not exists order_items_resource_idx
  on public.order_items (resource_id);
create index if not exists platform_records_owner_idx
  on public.platform_records (owner_id);
create index if not exists resources_owner_idx
  on public.resources (owner_id);

alter policy request_manage on public.access_requests
  using (user_id = (select auth.uid())
    or (select public.current_role()) = any (array['admin'::text, 'owner'::text]));
alter policy request_self_create on public.access_requests
  with check (user_id = (select auth.uid()));
alter policy request_self_read on public.access_requests
  using (user_id = (select auth.uid())
    or (select public.current_role()) = any (array['admin'::text, 'owner'::text]));

alter policy coupon_owner_only on public.coupons
  using ((select public.current_role()) = any (array['admin'::text, 'owner'::text]))
  with check ((select public.current_role()) = any (array['admin'::text, 'owner'::text]));
alter policy entitlement_self_read on public.entitlements
  using (user_id = (select auth.uid())
    or (select public.current_role()) = any (array['admin'::text, 'owner'::text]));
alter policy order_self_read on public.orders
  using (user_id = (select auth.uid())
    or (select public.current_role()) = any (array['admin'::text, 'owner'::text]));
alter policy order_item_self_read on public.order_items
  using (exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.user_id = (select auth.uid())
        or (select public.current_role()) = any (array['admin'::text, 'owner'::text]))
  ));

alter policy records_authenticated_read on public.platform_records
  using (
    owner_id = (select auth.uid())
    or (select public.current_role()) = any (array['editor'::text, 'admin'::text, 'owner'::text])
    or ((entity = any (array['ManagedPage'::text, 'BookPublication'::text, 'Product'::text, 'ShopCategory'::text, 'ShopBrand'::text, 'SubscriptionPlanConfig'::text]))
      and coalesce(data ->> 'status', data ->> 'product_status', 'PUBLISHED') = any (array['PUBLISHED'::text, 'active'::text, 'ACTIVE'::text])
      and coalesce((data ->> 'is_active')::boolean, true))
  );
alter policy records_create on public.platform_records
  with check (
    ((entity = any (array['AccessCode'::text, 'PageVisibilityConfig'::text, 'PagePermission'::text, 'AdminProfile'::text, 'Subscription'::text, 'SubscriptionPlan'::text]))
      and (select public.current_role()) = 'owner'::text)
    or ((entity <> all (array['AccessCode'::text, 'PageVisibilityConfig'::text, 'PagePermission'::text, 'AdminProfile'::text, 'Subscription'::text, 'SubscriptionPlan'::text]))
      and (owner_id = (select auth.uid())
        or (select public.current_role()) = any (array['editor'::text, 'admin'::text, 'owner'::text]))
    )
  );
alter policy records_delete on public.platform_records
  using (
    ((entity = any (array['AccessCode'::text, 'PageVisibilityConfig'::text, 'PagePermission'::text, 'AdminProfile'::text, 'Subscription'::text, 'SubscriptionPlan'::text]))
      and (select public.current_role()) = 'owner'::text)
    or ((entity <> all (array['AccessCode'::text, 'PageVisibilityConfig'::text, 'PagePermission'::text, 'AdminProfile'::text, 'Subscription'::text, 'SubscriptionPlan'::text]))
      and (owner_id = (select auth.uid())
        or (select public.current_role()) = any (array['admin'::text, 'owner'::text]))
    )
  );
alter policy records_update on public.platform_records
  using (
    ((entity = any (array['AccessCode'::text, 'PageVisibilityConfig'::text, 'PagePermission'::text, 'AdminProfile'::text, 'Subscription'::text, 'SubscriptionPlan'::text]))
      and (select public.current_role()) = 'owner'::text)
    or ((entity <> all (array['AccessCode'::text, 'PageVisibilityConfig'::text, 'PagePermission'::text, 'AdminProfile'::text, 'Subscription'::text, 'SubscriptionPlan'::text]))
      and (owner_id = (select auth.uid())
        or (select public.current_role()) = any (array['editor'::text, 'admin'::text, 'owner'::text]))
    )
  )
  with check (
    ((entity = any (array['AccessCode'::text, 'PageVisibilityConfig'::text, 'PagePermission'::text, 'AdminProfile'::text, 'Subscription'::text, 'SubscriptionPlan'::text]))
      and (select public.current_role()) = 'owner'::text)
    or ((entity <> all (array['AccessCode'::text, 'PageVisibilityConfig'::text, 'PagePermission'::text, 'AdminProfile'::text, 'Subscription'::text, 'SubscriptionPlan'::text]))
      and (owner_id = (select auth.uid())
        or (select public.current_role()) = any (array['editor'::text, 'admin'::text, 'owner'::text]))
    )
  );

alter policy profiles_read_self_or_admin on public.profiles
  using (id = (select auth.uid())
    or (select public.current_role()) = any (array['admin'::text, 'owner'::text]));
alter policy profiles_update_safe_self_fields on public.profiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

alter policy resource_catalog_read on public.resources
  using (status = 'PUBLISHED'::text
    or (select public.current_role()) = any (array['editor'::text, 'admin'::text, 'owner'::text]));
-- The previous ALL policy also granted this role group SELECT, duplicating the
-- catalog policy. Separate writes so SELECT has one permissive policy.
drop policy if exists resource_owner_write on public.resources;
create policy resource_owner_insert on public.resources
  for insert to authenticated
  with check ((select public.current_role()) = any (array['editor'::text, 'admin'::text, 'owner'::text]));
create policy resource_owner_update on public.resources
  for update to authenticated
  using ((select public.current_role()) = any (array['editor'::text, 'admin'::text, 'owner'::text]))
  with check ((select public.current_role()) = any (array['editor'::text, 'admin'::text, 'owner'::text]));
create policy resource_owner_delete on public.resources
  for delete to authenticated
  using ((select public.current_role()) = any (array['editor'::text, 'admin'::text, 'owner'::text]));


alter policy terms_self_accept on public.terms_acceptances
  with check (user_id = (select auth.uid()));
alter policy terms_self_read on public.terms_acceptances
  using (user_id = (select auth.uid()));
