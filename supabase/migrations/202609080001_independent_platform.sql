-- Sirr al-Huruf independent platform foundation
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'editor', 'admin', 'owner')),
  preferred_language text not null default 'ml' check (preferred_language in ('ml', 'ar', 'en')),
  status text not null default 'active' check (status in ('active', 'disabled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Compatibility store: safely preserves every corrected legacy entity while
-- commerce/content tables are normalized in later migrations.
create table if not exists public.platform_records (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  data jsonb not null default '{}'::jsonb,
  owner_id uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists platform_records_entity_idx on public.platform_records(entity);
create index if not exists platform_records_data_gin_idx on public.platform_records using gin(data jsonb_path_ops);
create index if not exists platform_records_entity_created_idx on public.platform_records(entity, created_at desc);

create or replace function public.touch_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();
drop trigger if exists records_touch_updated_at on public.platform_records;
create trigger records_touch_updated_at before update on public.platform_records
for each row execute function public.touch_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.current_role()
returns text language sql stable security definer set search_path = '' as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'customer');
$$;

alter table public.profiles enable row level security;
alter table public.platform_records enable row level security;
revoke all on public.profiles from anon, authenticated;
revoke all on public.platform_records from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.platform_records to anon, authenticated;
grant insert, update, delete on public.platform_records to authenticated;

create policy "profiles_read_self_or_admin" on public.profiles for select to authenticated
using (id = auth.uid() or public.current_role() in ('admin', 'owner'));
create policy "profiles_update_self_or_owner" on public.profiles for update to authenticated
using (id = auth.uid() or public.current_role() = 'owner')
with check (id = auth.uid() or public.current_role() = 'owner');

create policy "records_public_read" on public.platform_records for select to anon
using (
  entity in ('ManagedPage', 'Product', 'ShopCategory', 'ShopBrand', 'SubscriptionPlanConfig')
  and coalesce(data ->> 'status', data ->> 'product_status', 'PUBLISHED') in ('PUBLISHED', 'active', 'ACTIVE')
  and coalesce((data ->> 'is_active')::boolean, true)
);
create policy "records_authenticated_read" on public.platform_records for select to authenticated
using (
  owner_id = auth.uid() or public.current_role() in ('editor', 'admin', 'owner')
  or (entity in ('ManagedPage', 'Product', 'ShopCategory', 'ShopBrand', 'SubscriptionPlanConfig')
    and coalesce(data ->> 'status', data ->> 'product_status', 'PUBLISHED') in ('PUBLISHED', 'active', 'ACTIVE')
    and coalesce((data ->> 'is_active')::boolean, true))
);
create policy "records_create" on public.platform_records for insert to authenticated
with check (owner_id = auth.uid() or public.current_role() in ('editor', 'admin', 'owner'));
create policy "records_update" on public.platform_records for update to authenticated
using (owner_id = auth.uid() or public.current_role() in ('editor', 'admin', 'owner'))
with check (owner_id = auth.uid() or public.current_role() in ('editor', 'admin', 'owner'));
create policy "records_delete" on public.platform_records for delete to authenticated
using (owner_id = auth.uid() or public.current_role() in ('admin', 'owner'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('private-documents', 'private-documents', false, 52428800,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'audio/mpeg', 'audio/webm'])
on conflict (id) do nothing;

create policy "document_owner_read" on storage.objects for select to authenticated
using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "document_admin_read" on storage.objects for select to authenticated
using (bucket_id = 'private-documents' and public.current_role() in ('admin', 'owner'));
create policy "document_owner_upload" on storage.objects for insert to authenticated
with check (bucket_id = 'private-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "document_owner_update" on storage.objects for update to authenticated
using (bucket_id = 'private-documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "document_owner_delete" on storage.objects for delete to authenticated
using (bucket_id = 'private-documents' and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() in ('admin', 'owner')));
