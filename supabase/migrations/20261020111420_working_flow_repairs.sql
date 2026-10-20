-- Allow delegated read-only admins to read without acquiring an update lock.
create or replace function public.owner_configuration(p_action text,p_payload jsonb default '{}')
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare
 actor public.profiles%rowtype;
 rec public.platform_records%rowtype;
 settings jsonb;
 section text;
 patch jsonb;
 entry jsonb;
 rows_json jsonb;
 total_count bigint;
 limit_count integer := least(greatest(coalesce((p_payload->>'limit')::integer,50),1),200);
 skip_count integer := greatest(coalesce((p_payload->>'skip')::integer,0),0);
begin
 select * into actor from public.profiles where id=auth.uid() and status='active';
 if actor.id is null or actor.role not in ('owner','admin') then
   raise exception 'Administrator access required' using errcode='42501';
 end if;
 if p_action='AUDIT_LOG' then
   if actor.role<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
   with filtered as (
    select data || jsonb_build_object('id',coalesce(data->>'_base44_legacy_id',id::text),
      'timestamp',coalesce(data->>'timestamp',created_at::text)) as item,created_at
    from public.platform_records where entity in ('OwnerAuditLog','AuditLog')
    and (nullif(p_payload->>'action_type','') is null or data->>'action_type'=p_payload->>'action_type')
    and (nullif(p_payload->>'actor_email','') is null or coalesce(data->>'performed_by_email',data->>'created_by','') ilike '%'||(p_payload->>'actor_email')||'%')
    and (nullif(p_payload->>'search','') is null or data::text ilike '%'||(p_payload->>'search')||'%')
    and (nullif(p_payload->>'from','') is null or created_at>=(p_payload->>'from')::timestamptz)
    and (nullif(p_payload->>'to','') is null or created_at<=(p_payload->>'to')::timestamptz)
   ), page as (select item from filtered order by created_at desc limit limit_count offset skip_count)
   select (select count(*) from filtered),coalesce((select jsonb_agg(item) from page),'[]') into total_count,rows_json;
   return jsonb_build_object('success',true,'rows',rows_json,'total',total_count);
 end if;
 select * into rec from public.platform_records where entity='SystemSettings' order by created_at limit 1;
 if p_action <> 'GET_SETTINGS' and rec.id is not null then
   select * into rec from public.platform_records where id=rec.id for update;
 end if;
 if rec.id is null then raise exception 'System settings record not found'; end if;
 settings := rec.data;
 if p_action='GET_SETTINGS' then
   return jsonb_build_object('success',true,'settings',settings,'is_owner',actor.role='owner');
 end if;
 if actor.role<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if p_action='UPDATE_SECTION' then
   section:=p_payload->>'section';
   if section not in ('general','registration','reading_codes','subscription','security','notifications')
      or jsonb_typeof(p_payload->'data') is distinct from 'object' then raise exception 'Invalid settings section'; end if;
   settings:=jsonb_set(settings,array[section],coalesce(settings->section,'{}')||(p_payload->'data'));
 elsif p_action='IMPORT_SETTINGS' then
   patch:=coalesce(p_payload->'import_data'->'settings',p_payload->'import_data');
   if jsonb_typeof(patch) is distinct from 'object' then raise exception 'Settings object required'; end if;
   foreach section in array array['general','registration','reading_codes','subscription','security','notifications'] loop
     if patch ? section then
       if jsonb_typeof(patch->section) is distinct from 'object' then raise exception 'Invalid settings section'; end if;
       settings:=jsonb_set(settings,array[section],patch->section);
     end if;
   end loop;
   settings:=jsonb_set(settings,'{backup}',coalesce(settings->'backup','{}')||jsonb_build_object('last_import_at',now()));
 elsif p_action='EXPORT_SETTINGS' then
   settings:=jsonb_set(settings,'{backup}',coalesce(settings->'backup','{}')||jsonb_build_object('last_export_at',now()));
 elsif p_action='BACKUP_CONFIG' then
   insert into public.platform_records(entity,owner_id,data) values('ConfigurationBackup',actor.id,
     jsonb_build_object('settings',settings,'created_by',actor.id,'created_at',now()));
   settings:=jsonb_set(settings,'{backup}',coalesce(settings->'backup','{}')||jsonb_build_object('last_backup_at',now()));
 else raise exception 'Unsupported settings action'; end if;
 entry:=jsonb_build_object('action',p_action,'section',section,'timestamp',now(),'performed_by',actor.email,'performed_by_name',actor.full_name,'user_name',actor.full_name,'user_role',actor.role);
 settings:=settings||jsonb_build_object('updated_at',now(),'updated_by',actor.id,
   'audit_log',coalesce(settings->'audit_log','[]')||jsonb_build_array(entry));
 update public.platform_records set data=settings where id=rec.id;
 insert into public.platform_records(entity,owner_id,data) values('OwnerAuditLog',actor.id,
   entry||jsonb_build_object('action_type','SETTINGS_CHANGED','action_label',p_action,
     'performed_by_email',actor.email,'performed_by_role',actor.role,'performed_by_id',actor.id));
 if p_action='EXPORT_SETTINGS' then
   return jsonb_build_object('success',true,'export_data',jsonb_build_object('settings',settings,'version',1));
 end if;
 return jsonb_build_object('success',true,'settings',settings,'is_owner',true);
end;
$$;
revoke all on function public.owner_configuration(text,jsonb) from public,anon;
grant execute on function public.owner_configuration(text,jsonb) to authenticated;
