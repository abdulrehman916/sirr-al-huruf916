-- Atomically remove a confirmed dictionary version and its private snapshot rows.
create function public.owner_purpose_delete_version(p_version_id text, p_request_id uuid)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare actor public.profiles; version public.platform_records; snap private.purpose_snapshots; response jsonb; removed bigint;
begin
 if public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if p_version_id is null or p_request_id is null then raise exception 'Version and request identifiers are required'; end if;
 perform pg_advisory_xact_lock(hashtextextended('purpose_dictionary_write',0));
 select data->'result' into response from public.platform_records
  where entity='PurposeDictionaryAuditLog' and data->>'request_id'=p_request_id::text limit 1;
 if response is not null then return response; end if;
 select * into actor from public.profiles where id=auth.uid();
 select * into version from public.platform_records where entity='PurposeDictionaryVersion' and data->>'version_id'=p_version_id for update;
 if version.id is null then raise exception 'Version not found'; end if;
 select * into snap from private.purpose_snapshots where version_id=p_version_id for update;
 if version.data->>'snapshot_storage'='independent' and snap.id is null then raise exception 'Snapshot metadata is missing; version was kept'; end if;
 if snap.id is not null then
   select count(*) into removed from private.purpose_snapshot_rows where snapshot_id=snap.id;
   delete from private.purpose_snapshots where id=snap.id;
 else removed:=0;
 end if;
 delete from public.platform_records where id=version.id;
 response:=jsonb_build_object('success',true,'version_id',p_version_id,'snapshot_rows_removed',removed,'legacy_file_retained',coalesce(version.data->>'snapshot_storage','')<>'independent');
 insert into public.platform_records(entity,owner_id,data) values('PurposeDictionaryAuditLog',actor.id,jsonb_build_object(
  'log_id',p_request_id,'request_id',p_request_id,'action','VERSION_DELETED','version_id',p_version_id,
  'performed_by',actor.id,'performed_by_email',actor.email,'timestamp',now(),'details',response::text,
  'record_count',removed,'result',response));
 return response;
end; $$;
revoke all on function public.owner_purpose_delete_version(text,uuid) from public,anon;
grant execute on function public.owner_purpose_delete_version(text,uuid) to authenticated;
