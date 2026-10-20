-- App-record snapshots are separate from authentication and stored files.
create table private.owner_record_backups (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 created_by uuid not null, record_count bigint not null default 0,
 status text not null default 'pending', cursor_id uuid, max_id uuid, completed_at timestamptz,
 restore_target uuid, restore_cursor uuid, restored_count bigint not null default 0, restore_complete boolean not null default false
);
create table private.owner_record_backup_rows (
 backup_id uuid not null references private.owner_record_backups(id),
 record_id uuid not null, entity text not null, owner_id uuid, data jsonb not null,
 created_at timestamptz not null, primary key(backup_id,record_id)
);
alter table private.owner_record_backups enable row level security;
alter table private.owner_record_backup_rows enable row level security;
revoke all on private.owner_record_backups,private.owner_record_backup_rows from public,anon,authenticated;

create function private.owner_maintenance(p_action text,p_payload jsonb)
returns jsonb language plpgsql security definer set search_path=''
as $$ declare selected_backup_id uuid; n bigint; items jsonb; next_record_id uuid; more boolean; applied_count bigint; job private.owner_record_backups%rowtype;
begin
 if auth.uid() is null or public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if p_action='RESET_ONBOARDING' then
   return public.owner_configuration('UPDATE_SECTION',jsonb_build_object('section','general','data',jsonb_build_object('onboarding_reset_date',now())));
 elsif p_action='LATEST_BACKUP' then
   select id into selected_backup_id from private.owner_record_backups where status='ready' order by completed_at desc,id desc limit 1;
   if selected_backup_id is null then raise exception 'Create an app-record backup before restoring'; end if;
   return jsonb_build_object('success',true,'backup_id',selected_backup_id);
 elsif p_action='BACKUP' then
   perform pg_advisory_xact_lock(hashtext('owner-app-record-backups'));
   selected_backup_id:=nullif(p_payload->>'backup_id','')::uuid;
   if selected_backup_id is null then
     insert into private.owner_record_backups(created_by,max_id) values(auth.uid(),(select id from public.platform_records order by id desc limit 1)) returning id into selected_backup_id;
   end if;
   select * into job from private.owner_record_backups where id=selected_backup_id and created_by=auth.uid() for update;
   if job.id is null then raise exception 'Backup not found'; end if;
   if job.status<>'ready' then
     with batch as (select * from public.platform_records where (job.cursor_id is null or id>job.cursor_id) and id<=job.max_id and entity not in ('ConfigurationBackup','OwnerAuditLog','AuditLog') order by id limit 50),
     saved_rows as (insert into private.owner_record_backup_rows(backup_id,record_id,entity,owner_id,data,created_at) select selected_backup_id,id,entity,owner_id,data,created_at from batch returning record_id)
     select count(*),(array_agg(record_id order by record_id desc))[1] into n,next_record_id from saved_rows;
     update private.owner_record_backups set record_count=record_count+n,cursor_id=coalesce(next_record_id,job.cursor_id),status=case when n<50 then 'ready' else 'pending' end,completed_at=case when n<50 then now() else null end where id=selected_backup_id;
     select * into job from private.owner_record_backups where id=selected_backup_id;
   end if;
   return jsonb_build_object('success',true,'backup_id',selected_backup_id,'record_count',job.record_count,'complete',job.status='ready','scope','platform_records');
 elsif p_action='RESTORE' then
   perform pg_advisory_xact_lock(hashtext('owner-app-record-backups'));
   selected_backup_id:=(p_payload->>'backup_id')::uuid;
   select * into job from private.owner_record_backups where id=(p_payload->>'recovery_backup_id')::uuid and created_by=auth.uid() and status='ready' for update;
   if job.id is null or job.id=selected_backup_id then raise exception 'Completed recovery snapshot required'; end if;
   if not exists(select 1 from private.owner_record_backups where id=selected_backup_id and status='ready') then raise exception 'Completed source backup required'; end if;
   if job.restore_target is not null and job.restore_target<>selected_backup_id then raise exception 'Recovery snapshot already used for another restore'; end if;
   if not job.restore_complete then
     with batch as (select * from private.owner_record_backup_rows where backup_id=selected_backup_id and (job.restore_cursor is null or record_id>job.restore_cursor) order by record_id limit 50),
     applied as (insert into public.platform_records(id,entity,owner_id,data,created_at) select record_id,entity,owner_id,data,created_at from batch
       on conflict(id) do update set data=excluded.data,entity=excluded.entity,owner_id=excluded.owner_id where (platform_records.data,platform_records.entity,platform_records.owner_id) is distinct from (excluded.data,excluded.entity,excluded.owner_id) returning id)
     select (select count(*) from batch),(select (array_agg(record_id order by record_id desc))[1] from batch),(select count(*) from applied) into n,next_record_id,applied_count;
     update private.owner_record_backups set restore_target=selected_backup_id,restore_cursor=coalesce(next_record_id,job.restore_cursor),restored_count=restored_count+applied_count,restore_complete=n<50 where id=job.id;
     select * into job from private.owner_record_backups where id=job.id;
     if job.restore_complete then insert into public.platform_records(entity,owner_id,data) values('OwnerAuditLog',auth.uid(),jsonb_build_object('action_type','APP_RECORD_RESTORE','timestamp',now(),'backup_id',selected_backup_id,'recovery_backup_id',job.id,'record_count',job.restored_count)); end if;
   end if;
   return jsonb_build_object('success',true,'backup_id',selected_backup_id,'recovery_backup_id',job.id,'record_count',job.restored_count,'complete',job.restore_complete,'scope','platform_records','keeps_newer_records',true);
 elsif p_action='EXPORT' then
   if coalesce(p_payload->>'export_type','full') not in ('users','audit_logs','full') then raise exception 'Invalid export type'; end if;
   next_record_id:=nullif(p_payload->>'after','')::uuid;
   if p_payload->>'export_type'='users' then
     select coalesce(jsonb_agg(to_jsonb(p) order by p.id),'[]') into items from
       (select id,email,full_name,role,status,created_at from public.profiles where next_record_id is null or id>next_record_id order by id limit 201) p;
   else
     select coalesce(jsonb_agg(to_jsonb(r) order by r.id),'[]') into items from
       (select id,entity,owner_id,data,created_at,updated_at from public.platform_records
        where (next_record_id is null or id>next_record_id) and (coalesce(p_payload->>'export_type','full')='full' or entity in ('AuditLog','OwnerAuditLog')) order by id limit 201) r;
   end if;
   more:=jsonb_array_length(items)>200;
   if more then items:=items-200; end if;
   return jsonb_build_object('success',true,'rows',items,'has_more',more,'next_cursor',coalesce(items->-1->>'id',''),'scope','app_records_and_profile_metadata');
 else raise exception 'Unsupported maintenance action'; end if;
end; $$;
revoke all on function private.owner_maintenance(text,jsonb) from public,anon;
grant execute on function private.owner_maintenance(text,jsonb) to authenticated;
create function public.owner_maintenance(p_action text,p_payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$ select private.owner_maintenance(p_action,p_payload); $$;
revoke all on function public.owner_maintenance(text,jsonb) from public,anon;
grant execute on function public.owner_maintenance(text,jsonb) to authenticated;

create function private.runtime_status() returns jsonb language sql stable security definer set search_path=''
as $$ select jsonb_build_object('maintenance_mode',coalesce((data#>>'{security,maintenance_mode}')::boolean,false))
 from public.platform_records where entity='SystemSettings' order by created_at limit 1; $$;
revoke all on function private.runtime_status() from public;
grant execute on function private.runtime_status() to anon,authenticated;
create function public.runtime_status() returns jsonb language sql stable security invoker set search_path=''
as $$ select coalesce(private.runtime_status(),'{"maintenance_mode":false}'); $$;
revoke all on function public.runtime_status() from public;
grant execute on function public.runtime_status() to anon,authenticated;
