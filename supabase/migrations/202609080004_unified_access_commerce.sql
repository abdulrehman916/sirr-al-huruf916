-- Unified catalogue, access, coupon and payment ledger.
-- Payment entitlements are granted only by trusted server/webhook code.

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.resources(id) on delete cascade,
  slug text not null unique,
  resource_type text not null check (resource_type in ('PAGE','CALCULATOR','CALCULATOR_SECTION','BOOK','PDF','RITUAL_PDF','PRODUCT')),
  title jsonb not null default '{}'::jsonb,
  summary jsonb not null default '{}'::jsonb,
  body jsonb not null default '{}'::jsonb,
  status text not null default 'DRAFT' check (status in ('DRAFT','PUBLISHED','ARCHIVED')),
  access_mode text not null default 'FREE' check (access_mode in ('FREE','LOGIN','PAID','COUPON','SELECTED')),
  price_minor bigint not null default 0 check (price_minor >= 0),
  currency text not null default 'INR',
  validity_days integer check (validity_days is null or validity_days > 0),
  lifetime_access boolean not null default false,
  preview jsonb not null default '{}'::jsonb,
  asset_path text,
  cover_url text,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  owner_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  message text not null default '',
  whatsapp text,
  status text not null default 'PENDING' check (status in ('PENDING','APPROVED','REJECTED','CANCELLED')),
  owner_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  resource_id uuid references public.resources(id) on delete cascade,
  bound_email text,
  validity_days integer check (validity_days is null or validity_days > 0),
  lifetime_access boolean not null default false,
  max_redemptions integer not null default 1 check (max_redemptions > 0),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  expires_at timestamptz,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','DISABLED','REVOKED')),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict default auth.uid(),
  customer_email text not null,
  customer_phone text,
  status text not null default 'PENDING' check (status in ('PENDING','PAID','FAILED','REFUNDED','CANCELLED')),
  subtotal_minor bigint not null check (subtotal_minor >= 0),
  total_minor bigint not null check (total_minor >= 0),
  currency text not null default 'INR',
  provider text,
  provider_order_id text unique,
  provider_payment_id text unique,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  validity_days integer,
  lifetime_access boolean not null default false,
  unique(order_id, resource_id)
);

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  source text not null check (source in ('PURCHASE','COUPON','OWNER_GRANT')),
  source_id uuid,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.terms_acceptances (
  user_id uuid not null references auth.users(id) on delete cascade,
  terms_version text not null,
  accepted_at timestamptz not null default now(),
  primary key (user_id, terms_version)
);

create index if not exists resources_parent_idx on public.resources(parent_id, sort_order);
create index if not exists resources_catalog_idx on public.resources(status, resource_type, access_mode);
create index if not exists resources_metadata_gin_idx on public.resources using gin(metadata jsonb_path_ops);
create index if not exists entitlements_lookup_idx on public.entitlements(user_id, resource_id, expires_at) where revoked_at is null;
create index if not exists requests_owner_queue_idx on public.access_requests(status, created_at desc);
create index if not exists orders_customer_idx on public.orders(user_id, created_at desc);

create or replace function public.can_access_resource(target uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.resources r
    where r.id = target and r.status = 'PUBLISHED' and (
      r.access_mode = 'FREE'
      or (r.access_mode = 'LOGIN' and auth.uid() is not null)
      or public.current_role() in ('editor','admin','owner')
      or exists (
        select 1 from public.entitlements e
        where e.user_id = auth.uid() and e.resource_id = r.id
          and e.revoked_at is null and (e.expires_at is null or e.expires_at > now())
      )
    )
  );
$$;

alter table public.resources enable row level security;
alter table public.access_requests enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.entitlements enable row level security;
alter table public.terms_acceptances enable row level security;

grant select on public.resources to anon, authenticated;
grant insert, update, delete on public.resources to authenticated;
grant select, insert, update on public.access_requests to authenticated;
grant select, insert, update, delete on public.coupons to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant select on public.entitlements to authenticated;
grant select, insert on public.terms_acceptances to authenticated;

create policy "resource_catalog_read" on public.resources for select to anon, authenticated
using (status = 'PUBLISHED' or public.current_role() in ('editor','admin','owner'));
create policy "resource_owner_write" on public.resources for all to authenticated
using (public.current_role() in ('editor','admin','owner'))
with check (public.current_role() in ('editor','admin','owner'));

create policy "request_self_read" on public.access_requests for select to authenticated
using (user_id = auth.uid() or public.current_role() in ('admin','owner'));
create policy "request_self_create" on public.access_requests for insert to authenticated
with check (user_id = auth.uid());
create policy "request_manage" on public.access_requests for update to authenticated
using (user_id = auth.uid() or public.current_role() in ('admin','owner'));

create policy "coupon_owner_only" on public.coupons for all to authenticated
using (public.current_role() in ('admin','owner'))
with check (public.current_role() in ('admin','owner'));
create policy "order_self_read" on public.orders for select to authenticated
using (user_id = auth.uid() or public.current_role() in ('admin','owner'));
create policy "order_item_self_read" on public.order_items for select to authenticated
using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.current_role() in ('admin','owner'))));
create policy "entitlement_self_read" on public.entitlements for select to authenticated
using (user_id = auth.uid() or public.current_role() in ('admin','owner'));
create policy "terms_self_read" on public.terms_acceptances for select to authenticated using (user_id = auth.uid());
create policy "terms_self_accept" on public.terms_acceptances for insert to authenticated with check (user_id = auth.uid());

-- Never grant clients INSERT/UPDATE on orders or INSERT on entitlements.
-- Checkout and a verified payment webhook/Edge Function must validate server-side
-- prices and atomically mark PAID and grant access.

drop trigger if exists resources_touch_updated_at on public.resources;
create trigger resources_touch_updated_at before update on public.resources for each row execute function public.touch_updated_at();
drop trigger if exists requests_touch_updated_at on public.access_requests;
create trigger requests_touch_updated_at before update on public.access_requests for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at before update on public.orders for each row execute function public.touch_updated_at();
