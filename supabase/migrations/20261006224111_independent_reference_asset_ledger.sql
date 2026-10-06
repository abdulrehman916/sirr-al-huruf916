create table public.reference_asset_migration (
  source_url text primary key,
  object_path text not null unique,
  sha256 text not null,
  byte_size bigint not null check (byte_size > 0),
  verified_at timestamptz not null default now()
);
alter table public.reference_asset_migration enable row level security;
create policy reference_asset_owner_read on public.reference_asset_migration for select to authenticated using (public.current_role() = 'owner');
revoke all on public.reference_asset_migration from anon, authenticated;
grant select on public.reference_asset_migration to authenticated;
create table public.reference_record_backup (
  record_id uuid primary key,
  entity text not null,
  data jsonb not null,
  backed_up_at timestamptz not null default now()
);
alter table public.reference_record_backup enable row level security;
create policy reference_backup_owner_read on public.reference_record_backup for select to authenticated using (public.current_role() = 'owner');
revoke all on public.reference_record_backup from anon, authenticated;
grant select on public.reference_record_backup to authenticated;
