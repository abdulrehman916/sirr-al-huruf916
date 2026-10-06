-- Scalable content/media foundation for the independent Sirr al-Huruf site.
-- Large binaries live in object storage; PostgreSQL stores searchable metadata.

create table if not exists public.resource_assets (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references public.resources(id) on delete cascade,
  asset_type text not null check (asset_type in ('COVER','IMAGE','PDF','PREVIEW_PDF','AUDIO','VIDEO','EXTERNAL_VIDEO','DOWNLOAD')),
  bucket text,
  object_path text,
  external_url text,
  title jsonb not null default '{}'::jsonb,
  mime_type text,
  byte_size bigint check (byte_size is null or byte_size >= 0),
  sort_order integer not null default 0,
  is_preview boolean not null default false,
  is_downloadable boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint resource_asset_location check (
    (bucket is not null and object_path is not null and external_url is null)
    or (bucket is null and object_path is null and external_url is not null)
  )
);

create table if not exists public.legacy_imports (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_entity text not null,
  source_record_id text not null,
  destination_table text not null,
  destination_id uuid,
  checksum text,
  status text not null default 'IMPORTED' check (status in ('IMPORTED','SKIPPED','FAILED')),
  error_message text,
  imported_at timestamptz not null default now(),
  unique(source_name, source_entity, source_record_id)
);

create index if not exists resource_assets_resource_idx
  on public.resource_assets(resource_id, sort_order);
create index if not exists resource_assets_type_idx
  on public.resource_assets(asset_type, resource_id);
create index if not exists legacy_imports_entity_idx
  on public.legacy_imports(source_entity, status);

alter table public.resource_assets enable row level security;
alter table public.legacy_imports enable row level security;

grant select on public.resource_assets to anon, authenticated;
grant insert, update, delete on public.resource_assets to authenticated;
grant select, insert, update on public.legacy_imports to authenticated;

create policy "resource_asset_catalog_read" on public.resource_assets
for select to anon, authenticated
using (
  exists (
    select 1 from public.resources r
    where r.id = resource_id
      and r.status = 'PUBLISHED'
      and (is_preview or public.can_access_resource(r.id))
  )
  or public.current_role() in ('editor','admin','owner')
);

create policy "resource_asset_owner_write" on public.resource_assets
for all to authenticated
using (public.current_role() in ('editor','admin','owner'))
with check (public.current_role() in ('editor','admin','owner'));

create policy "legacy_import_owner_only" on public.legacy_imports
for all to authenticated
using (public.current_role() = 'owner')
with check (public.current_role() = 'owner');

-- Private downloadable files are readable only when the resource is visible
-- to the current user (free/login access or a valid paid entitlement).
drop policy if exists "entitled_resource_asset_read" on storage.objects;
create policy "entitled_resource_asset_read" on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'private-documents'
  and exists (
    select 1
    from public.resource_assets a
    where a.bucket = storage.objects.bucket_id
      and a.object_path = storage.objects.name
      and public.can_access_resource(a.resource_id)
  )
);
