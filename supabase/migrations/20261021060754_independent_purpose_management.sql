-- Purpose Dictionary management is isolated from every calculation and timing engine.
create table private.purpose_snapshots (
 id uuid primary key default gen_random_uuid(), version_id text unique not null,
 created_by uuid not null references public.profiles(id), record_count bigint not null default 0, created_at timestamptz not null default now()
);
create table private.purpose_snapshot_rows (
 snapshot_id uuid not null references private.purpose_snapshots(id) on delete cascade,
 record_id uuid not null, owner_id uuid, data jsonb not null,
 created_at timestamptz not null, updated_at timestamptz not null, primary key(snapshot_id,record_id)
);
alter table private.purpose_snapshots enable row level security;
alter table private.purpose_snapshot_rows enable row level security;
create policy purpose_snapshot_owner on private.purpose_snapshots for all to authenticated using(public.current_role()='owner') with check(public.current_role()='owner');
create policy purpose_snapshot_rows_owner on private.purpose_snapshot_rows for all to authenticated using(public.current_role()='owner') with check(public.current_role()='owner');
grant select,insert,update,delete on private.purpose_snapshots,private.purpose_snapshot_rows to authenticated;

create function private.purpose_normalize(t text) returns text language sql immutable security invoker set search_path='' as $$
 select lower(trim(regexp_replace(coalesce(t,''),'[ؐ-ًؚ-ٰٟـ]','','g')));
$$;
revoke all on function private.purpose_normalize(text) from public,anon;
grant execute on function private.purpose_normalize(text) to authenticated;
create index purpose_keyword_normalized on public.platform_records(private.purpose_normalize(coalesce(nullif(data->>'arabic_keyword',''),data->>'purpose_phrase'))) where entity='PurposeDictionary';

-- Serialize dictionary writes only; customer access and other entities are unaffected.
create function private.serialize_purpose_writes() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if (TG_OP<>'DELETE' and NEW.entity='PurposeDictionary') or (TG_OP<>'INSERT' and OLD.entity='PurposeDictionary') then
   perform pg_advisory_xact_lock(hashtextextended('purpose_dictionary_write',0));
 end if;
 if TG_OP='DELETE' then return OLD; else return NEW; end if;
end; $$;
create trigger serialize_purpose_writes before insert or update or delete on public.platform_records for each row execute function private.serialize_purpose_writes();
revoke all on function private.serialize_purpose_writes() from public,anon;

create function private.snapshot_purpose_dictionary(p_label text) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare sid uuid:=gen_random_uuid(); vid text; n bigint; email text;
begin
 if public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended('purpose_dictionary_write',0));
 vid:='VER-'||sid::text;
 insert into private.purpose_snapshots(id,version_id,created_by) values(sid,vid,auth.uid());
 insert into private.purpose_snapshot_rows(snapshot_id,record_id,owner_id,data,created_at,updated_at)
 select sid,id,owner_id,data,created_at,updated_at from public.platform_records where entity='PurposeDictionary';
 get diagnostics n=row_count;
 update private.purpose_snapshots set record_count=n where id=sid;
 select p.email into email from public.profiles p where p.id=auth.uid();
 insert into public.platform_records(entity,owner_id,data) values('PurposeDictionaryVersion',auth.uid(),jsonb_build_object('version_id',vid,'version_label',left(p_label,200),'trigger','owner_backup','snapshot_storage','independent','record_count',n,'import_status','pending','created_by',auth.uid(),'created_by_email',email,'created_at',now()));
 return jsonb_build_object('success',true,'version_id',vid,'record_count',n);
end; $$;
revoke all on function private.snapshot_purpose_dictionary(text) from public,anon;
grant execute on function private.snapshot_purpose_dictionary(text) to authenticated;

create function public.owner_purpose_management(p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path='' as $$
declare
 actor public.profiles; version public.platform_records; rec public.platform_records; snap private.purpose_snapshots;
 row_data jsonb; patch jsonb; aliases jsonb; alias_value jsonb; fields text[]:=array['malayalam_meaning','english_meaning','source','notes']; f text;
 request_id uuid:=(p_payload->>'request_id')::uuid; response jsonb; recovery jsonb; vid text:=p_payload->>'version_id'; key text; nk text;
 total int:=0; imported int:=0; updated int:=0; skipped int:=0; merged int:=0; errs jsonb:='[]'; seen text[]:='{}'; n bigint; removed bigint; log_action text;
begin
 if public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if request_id is null then raise exception 'Request identifier required'; end if;
 select * into actor from public.profiles where id=auth.uid();
 perform pg_advisory_xact_lock(hashtextextended('purpose_dictionary_write',0));
 select data->'result' into response from public.platform_records where entity='PurposeDictionaryAuditLog' and data->>'request_id'=request_id::text limit 1;
 if response is not null then return response; end if;
 if p_action='BACKUP' then
   response:=private.snapshot_purpose_dictionary(coalesce(p_payload->>'label','Owner dictionary backup')); vid:=response->>'version_id'; log_action:='BACKUP_CREATED';
 elsif p_action in ('IMPORT','RESTORE','FINALIZE') then
   select * into version from public.platform_records where entity='PurposeDictionaryVersion' and data->>'version_id'=vid limit 1 for update;
   if version.id is null then raise exception 'Version not found'; end if;
   select * into snap from private.purpose_snapshots where version_id=vid;
   if p_action='IMPORT' then
     if snap.id is null then raise exception 'A complete independent backup is required before import'; end if;
     if jsonb_typeof(p_payload->'entries') is distinct from 'array' or jsonb_array_length(p_payload->'entries')>500 then raise exception 'Provide at most 500 entries per batch'; end if;
     for row_data in select value from jsonb_array_elements(p_payload->'entries') loop
       total:=total+1;
       if jsonb_typeof(row_data)<>'object' or concat_ws('',row_data->>'purpose_phrase',row_data->>'arabic_keyword',row_data->>'normalized_purpose_key',row_data->>'english_meaning')='' then skipped:=skipped+1; continue; end if;
       key:=trim(coalesce(row_data->>'normalized_purpose_key',''));
       nk:=private.purpose_normalize(coalesce(nullif(trim(row_data->>'arabic_keyword'),''),row_data->>'purpose_phrase'));
       if trim(coalesce(row_data->>'purpose_phrase',''))='' or nk='' or key not in ('celb','tard','sihhat','sekam','tarfet','rizq','knowledge','travel','sultan','haybah') then
         errs:=errs||jsonb_build_array('Row '||total||': purpose phrase and a valid normalized purpose key are required'); skipped:=skipped+1; continue;
       end if;
       if length(nk)>2000 or octet_length(row_data::text)>200000 then errs:=errs||jsonb_build_array('Row '||total||': entry too large'); skipped:=skipped+1; continue; end if;
       aliases:=case jsonb_typeof(row_data->'aliases') when 'array' then row_data->'aliases' when 'string' then to_jsonb(string_to_array(row_data->>'aliases','|')) else '[]'::jsonb end;
       select coalesce(jsonb_agg(value order by value),'[]') into aliases from (select distinct to_jsonb(trim(value#>>'{}')) value from jsonb_array_elements(aliases) where jsonb_typeof(value)='string' and trim(value#>>'{}')<>'') a;
       select * into rec from public.platform_records where entity='PurposeDictionary' and private.purpose_normalize(coalesce(nullif(data->>'arabic_keyword',''),data->>'purpose_phrase'))=nk order by created_at,id limit 1 for update;
       if rec.id is null then
         patch:=jsonb_build_object('purpose_phrase',trim(row_data->>'purpose_phrase'),'arabic_keyword',trim(coalesce(row_data->>'arabic_keyword','')),'normalized_purpose_key',key,'aliases',aliases,
          'action',case when row_data->>'action' in ('jalb','tard','tafriq','jam','sihhat','sekam','tarfet','other') then row_data->>'action' else 'jalb' end,
          'language',case when row_data->>'language' in ('ar','ml','en','mixed') then row_data->>'language' else 'mixed' end,'is_active',coalesce(row_data->>'is_active','true')<>'false');
         foreach f in array fields loop patch:=patch||jsonb_build_object(f,trim(coalesce(row_data->>f,''))); end loop;
         insert into public.platform_records(entity,owner_id,data) values('PurposeDictionary',actor.id,patch); imported:=imported+1;
       else
         patch:='{}';
         foreach f in array fields loop if coalesce(rec.data->>f,'')='' and coalesce(row_data->>f,'')<>'' then patch:=patch||jsonb_build_object(f,trim(row_data->>f)); end if; end loop;
         select coalesce(jsonb_agg(value order by value),'[]') into aliases from (select distinct value from jsonb_array_elements((case when jsonb_typeof(rec.data->'aliases')='array' then rec.data->'aliases' else '[]'::jsonb end)||aliases)) a;
         if aliases is distinct from coalesce(rec.data->'aliases','[]'::jsonb) then patch:=patch||jsonb_build_object('aliases',aliases); merged:=merged+1;
         elsif nk=any(seen) then merged:=merged+1; end if;
         if patch='{}'::jsonb then skipped:=skipped+1; else update public.platform_records set data=data||patch where id=rec.id; updated:=updated+1; end if;
       end if;
       seen:=array_append(seen,nk);
     end loop;
     response:=jsonb_build_object('success',true,'total',total,'imported',imported,'updated',updated,'skipped',skipped,'duplicatesMerged',merged,'errors',errs); log_action:='IMPORT_BATCH';
   elsif p_action='RESTORE' then
     if snap.id is null then
       -- A legacy file is read and validated by the owner client BEFORE any replacement.
       if jsonb_typeof(p_payload->'snapshot_entries') is distinct from 'array' then raise exception 'Legacy snapshot must be loaded before restore'; end if;
       if jsonb_array_length(p_payload->'snapshot_entries') is distinct from (version.data->>'record_count')::int then raise exception 'Legacy snapshot count does not match its manifest'; end if;
       if exists(select 1 from jsonb_array_elements(p_payload->'snapshot_entries') r where jsonb_typeof(r)<>'object' or coalesce(r->>'purpose_phrase','')='' or coalesce(r->>'normalized_purpose_key','')='') then raise exception 'Invalid legacy snapshot'; end if;
       insert into private.purpose_snapshots(version_id,created_by,record_count) values(vid,actor.id,jsonb_array_length(p_payload->'snapshot_entries')) returning * into snap;
       insert into private.purpose_snapshot_rows(snapshot_id,record_id,owner_id,data,created_at,updated_at) select snap.id,gen_random_uuid(),actor.id,r-'id'-'created_date'-'updated_date'-'_base44_legacy_id',now(),now() from jsonb_array_elements(p_payload->'snapshot_entries') r;
     end if;
     select count(*) into n from private.purpose_snapshot_rows where snapshot_id=snap.id;
     if n<>snap.record_count then raise exception 'Incomplete snapshot; restore cancelled'; end if;
     recovery:=private.snapshot_purpose_dictionary('Recovery before restoring '||vid);
     delete from public.platform_records where entity='PurposeDictionary'; get diagnostics removed=row_count;
     insert into public.platform_records(id,entity,owner_id,data,created_at,updated_at) select record_id,'PurposeDictionary',owner_id,data,created_at,updated_at from private.purpose_snapshot_rows where snapshot_id=snap.id;
     update public.platform_records set data=data||jsonb_build_object('import_status','rolled_back','recovery_version_id',recovery->>'version_id') where id=version.id;
     response:=jsonb_build_object('success',true,'version_id',vid,'record_count',n,'deleted_count',removed,'recovery_version_id',recovery->>'version_id'); log_action:='RESTORE';
   else
     if p_payload->>'status' not in ('completed','failed') or p_payload->>'status' is null then raise exception 'Invalid import completion status'; end if;
     update public.platform_records set data=data||jsonb_build_object('import_status',p_payload->>'status','import_report',coalesce(p_payload->'report','{}')) where id=version.id;
     response:=jsonb_build_object('success',true,'version_id',vid,'status',p_payload->>'status'); log_action:=case p_payload->>'status' when 'failed' then 'IMPORT_FAILED' else 'IMPORT_COMPLETED' end;
   end if;
 else raise exception 'Unknown dictionary management action'; end if;
 insert into public.platform_records(entity,owner_id,data) values('PurposeDictionaryAuditLog',actor.id,jsonb_build_object('log_id',request_id,'request_id',request_id,'action',log_action,'version_id',vid,'performed_by',actor.id,'performed_by_email',actor.email,'timestamp',now(),'details',response::text,'record_count',coalesce(response->'record_count',response->'imported','0'::jsonb),'result',response));
 return response;
end; $$;
revoke all on function public.owner_purpose_management(text,jsonb) from public,anon;
grant execute on function public.owner_purpose_management(text,jsonb) to authenticated;

create function public.owner_purpose_records(p_after uuid default null) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare rows_json jsonb; more boolean; cursor_id uuid;
begin
 if public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 with r as (select *,row_number() over(order by id) position from public.platform_records where entity='PurposeDictionary' and (p_after is null or id>p_after) order by id limit 201)
 select coalesce(jsonb_agg(data||jsonb_build_object('id',coalesce(data->>'_base44_legacy_id',id::text),'created_date',created_at,'updated_date',updated_at) order by id) filter(where position<=200),'[]'),
 coalesce(bool_or(position>200),false),(array_agg(id order by id desc) filter(where position<=200))[1] into rows_json,more,cursor_id from r;
 return jsonb_build_object('success',true,'rows',rows_json,'has_more',more,'next_cursor',cursor_id);
end; $$;
revoke all on function public.owner_purpose_records(uuid) from public,anon;
grant execute on function public.owner_purpose_records(uuid) to authenticated;
