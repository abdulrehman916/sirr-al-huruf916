-- Owner-only cleanup: move test/sample records into an archive table (recoverable), then remove them.
create table if not exists public.platform_records_archive (
  like public.platform_records including defaults,
  archived_at timestamptz not null default now(),
  archive_reason text not null
);
alter table public.platform_records_archive enable row level security;
revoke all on public.platform_records_archive from anon, authenticated;

with owners as (select id from public.profiles where role='owner'),
waste as (
  select r.*, case
    when r.data->>'is_sample'='true' or r.data::text ilike '%@example.com%' or r.data::text ilike '%test_payment%' then 'test/sample record'
    when r.entity='SupportMessage' and r.data->>'ticket_id' in ('SUP-000001','SUP-000002','SUP-TEST-001') then 'test support chat'
    when r.entity='SupportTickets' and r.data->>'ticket_id' in ('SUP-000001','SUP-000002') then 'test support chat'
    when r.entity='AccessRequest' and lower(r.data->>'email') in (select lower(email) from public.profiles where role='owner') then 'owner test access request'
    when r.entity='Subscription' and r.data->>'status'='EXPIRED' and r.data->>'user_id' in (select id::text from owners) then 'owner test subscription'
    when r.entity='OwnerAuditLog' and r.data->>'action_type'='TEST' then 'test audit entry'
    when r.entity='BulkImportJob' and r.data->>'status'='processing' and r.created_at < now()-interval '7 days' then 'stale import job'
  end reason
  from public.platform_records r
  where r.entity in ('ApprovedUser','Subscription','SubscriptionRequest','SupportTickets','SupportMessage','AccessRequest','OwnerAuditLog','BulkImportJob')
), moved as (
  insert into public.platform_records_archive
  select w.id,w.entity,w.data,w.owner_id,w.created_at,w.updated_at, now(), w.reason
  from waste w where w.reason is not null
  returning id
)
delete from public.platform_records p using moved m where p.id=m.id;

update public.platform_records set data=jsonb_set(data,'{role}','"owner"')
where entity='UserAccessProfile' and data->>'role'='admin'
  and lower(data->>'email') in (select lower(email) from public.profiles where role='owner');
