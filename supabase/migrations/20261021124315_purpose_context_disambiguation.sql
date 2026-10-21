-- Different purposes may legitimately use the same Arabic keyword.
create or replace function public.save_purpose_entry(p_id text,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare rec public.platform_records; other public.platform_records; nk text;
begin
 if public.current_role() is distinct from 'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended('purpose_dictionary_write',0));
 if octet_length(p_data::text)>200000 or coalesce(trim(p_data->>'purpose_phrase'),'')='' or coalesce(trim(p_data->>'arabic_keyword'),'')='' then raise exception 'Arabic phrase and calculation keyword are required'; end if;
 if coalesce(p_data->>'normalized_purpose_key','') not in ('celb','tard','sihhat','sekam','tarfet','rizq','knowledge','travel','sultan','haybah') then raise exception 'Select a supported purpose'; end if;
 if (p_data->>'arabic_keyword') !~ '[ء-ي]' then raise exception 'Use an Arabic calculation keyword'; end if;
 if jsonb_typeof(p_data->'aliases') is distinct from 'array' then raise exception 'Aliases must be a list'; end if;
 if p_id is not null then
  select * into rec from public.platform_records where entity='PurposeDictionary' and (id::text=p_id or data->>'_base44_legacy_id'=p_id) for update;
  if rec.id is null then raise exception 'Entry no longer exists'; end if;
 end if;
 nk:=private.purpose_normalize(p_data->>'arabic_keyword');
 if coalesce(p_data->>'is_active','true')<>'false' then
  select * into other from public.platform_records where entity='PurposeDictionary' and id is distinct from rec.id and coalesce(data->>'is_active','true')<>'false' and private.purpose_normalize(coalesce(nullif(data->>'arabic_keyword',''),data->>'purpose_phrase'))=nk and private.purpose_normalize(data->>'purpose_phrase')=private.purpose_normalize(p_data->>'purpose_phrase') and data->>'normalized_purpose_key'=p_data->>'normalized_purpose_key' and data->>'action' is not distinct from p_data->>'action' limit 1;
  if other.id is not null then raise exception 'This Arabic word already exists. Edit the existing entry instead.' using errcode='23505'; end if;
 end if;
 if rec.id is null then insert into public.platform_records(entity,owner_id,data) values('PurposeDictionary',auth.uid(),p_data) returning * into rec;
 else update public.platform_records set data=data||p_data where id=rec.id returning * into rec; end if;
 return to_jsonb(rec);
end; $$;
revoke all on function public.save_purpose_entry(text,jsonb) from public,anon;
grant execute on function public.save_purpose_entry(text,jsonb) to authenticated;
create or replace function public.archive_purpose_duplicates() returns jsonb language plpgsql security invoker set search_path='' as $$
declare backup jsonb; rec record; removed integer:=0;
begin
 if public.current_role() is distinct from 'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended('purpose_dictionary_write',0));
 backup:=private.snapshot_purpose_dictionary('Before archiving duplicate words');
 for rec in select id,first_value(id) over(partition by private.purpose_normalize(coalesce(nullif(data->>'arabic_keyword',''),data->>'purpose_phrase')),data->>'normalized_purpose_key',data->>'action',private.purpose_normalize(data->>'purpose_phrase') order by created_at,id) keep_id,
 row_number() over(partition by private.purpose_normalize(coalesce(nullif(data->>'arabic_keyword',''),data->>'purpose_phrase')),data->>'normalized_purpose_key',data->>'action',private.purpose_normalize(data->>'purpose_phrase') order by created_at,id) n
 from public.platform_records where entity='PurposeDictionary' and coalesce(data->>'is_active','true')<>'false'
 loop
  if rec.n>1 then
   update public.platform_records set data=data||jsonb_build_object('is_active',false,'duplicate_of',rec.keep_id,'duplicate_archived_at',now()) where id=rec.id;
   removed:=removed+1;
  end if;
 end loop;
 return backup||jsonb_build_object('archived',removed);
end; $$;
revoke all on function public.archive_purpose_duplicates() from public,anon;
grant execute on function public.archive_purpose_duplicates() to authenticated;
create function public.lookup_purpose_intent_for_action(p_phrase text,p_action text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare needle text; matched public.platform_records; classes integer;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 needle:=private.purpose_normalize(trim(coalesce(p_phrase,'')));
 if needle='' or length(needle)>2000 then return jsonb_build_object('matched',false); end if;
 if nullif(p_action,'') is null then
  select count(distinct r.data->>'normalized_purpose_key') into classes from public.platform_records r join private.purpose_search_terms t on t.record_id=r.id and t.term=needle;
  if classes>1 then return jsonb_build_object('matched',false,'ambiguous',true); end if;
 end if;
 select r.* into matched from public.platform_records r join private.purpose_search_terms t on t.record_id=r.id and t.term=needle
 order by case when r.data->>'normalized_purpose_key'=p_action or r.data->>'action'=case when p_action='celb' then 'jalb' else p_action end then 0 else 1 end,
 case when private.purpose_normalize(r.data->>'purpose_phrase')=needle then 0 when private.purpose_normalize(r.data->>'arabic_keyword')=needle then 1 else 2 end,r.created_at,r.id limit 1;
 if matched.id is null then return jsonb_build_object('matched',false); end if;
 return jsonb_build_object('matched',true,'ritualIntent',matched.data->>'normalized_purpose_key','normalized_purpose_key',matched.data->>'normalized_purpose_key','matchedPhrase',coalesce(nullif(matched.data->>'arabic_keyword',''),matched.data->>'purpose_phrase'),'english_meaning',coalesce(matched.data->>'english_meaning',''),'malayalam_meaning',coalesce(matched.data->>'malayalam_meaning',''),'source',coalesce(matched.data->>'source','Purpose Dictionary'));
end; $$;
revoke all on function public.lookup_purpose_intent_for_action(text,text) from public,anon;
grant execute on function public.lookup_purpose_intent_for_action(text,text) to authenticated;
-- Preserve callers of the original one-argument endpoint.
create or replace function public.lookup_purpose_intent(p_phrase text) returns jsonb language sql stable security invoker set search_path='' as $$ select public.lookup_purpose_intent_for_action(p_phrase,null); $$;
create unique index owner_named_card_title_unique on public.owner_content(lower(btrim(content->>'title'))) where scope='/holy-names/card/d-index';
