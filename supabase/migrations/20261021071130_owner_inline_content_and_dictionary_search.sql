-- Owner-authored page/card text is separate from immutable calculation inputs.
create table public.owner_content (
 scope text not null check(length(scope) between 1 and 500 and scope like '/%'),
 section text not null check(length(section) between 1 and 300),
 feature text not null default '',
 content jsonb not null default '{}',
 revision integer not null default 1,
 updated_by uuid not null references public.profiles(id),
 updated_at timestamptz not null default now(),
 primary key(scope,section),
 check(octet_length(content::text)<=2000000)
);
create table private.owner_content_history (
 id bigint generated always as identity primary key,
 scope text not null, section text not null, content jsonb not null, revision integer not null,
 changed_by uuid not null references public.profiles(id), changed_at timestamptz not null default now()
);
alter table public.owner_content enable row level security;
alter table private.owner_content_history enable row level security;
create function private.can_read_owner_content(p_scope text,p_feature text) returns boolean
language plpgsql stable security definer set search_path='' as $$
begin
 if public.current_role()='owner' then return true; end if;
 if p_scope like '/admin/%' then return false; end if;
 if p_scope like '/holy-names/one/PDF-%' or p_feature='section_b' then return private.can_read_holy_section('section_b'); end if;
 if p_scope like '/holy-names/one/%' or p_feature='section_a' then return private.can_read_holy_section('section_a'); end if;
 if p_feature='section_d' then return private.can_read_holy_section('section_d'); end if;
 if p_feature='section_c' or p_scope='/section-c' then return private.can_read_holy_section('section_c'); end if;
 if p_scope in ('/','/abjad','/anasir','/hadim','/sirr','/section-d','/holy-names/one') then return true; end if;
 return public.can_access_legacy_page(case when p_scope like '/plants/%' then '/plants' else p_scope end)
 or exists(select 1 from public.platform_records where entity='PageVisibilityConfig' and data->>'page_path'=p_scope and data->>'requires_permission'='false');
end; $$;
revoke all on function private.can_read_owner_content(text,text) from public;
grant execute on function private.can_read_owner_content(text,text) to anon,authenticated;
create policy owner_content_read on public.owner_content for select to anon,authenticated using(private.can_read_owner_content(scope,feature));
-- Writes go through the checked, revision-aware endpoint only.
grant select on public.owner_content to anon,authenticated;
create function public.save_owner_content(p_scope text,p_section text,p_feature text,p_content jsonb,p_revision integer)
returns public.owner_content language plpgsql security definer set search_path='' as $$
declare previous public.owner_content; result public.owner_content; f text; picture jsonb;
begin
 if public.current_role() is distinct from 'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if p_scope not like '/%' or length(p_scope)>500 or p_section is null or length(p_section) not between 1 and 300 then raise exception 'Invalid content location'; end if;
 if p_feature not in ('','section_a','section_b','section_c','section_d') then raise exception 'Invalid section'; end if;
 if jsonb_typeof(p_content) is distinct from 'object' or octet_length(p_content::text)>2000000 then raise exception 'Content exceeds 2 MB'; end if;
 for f in select jsonb_object_keys(p_content) loop
  if f not in ('title','arabic','malayalam','english','images','replace_original') then raise exception 'Unsupported content field'; end if;
  if f in ('title','arabic','malayalam','english') and jsonb_typeof(p_content->f)<>'string' then raise exception 'Text required'; end if;
 end loop;
 if p_content ? 'images' then
  if jsonb_typeof(p_content->'images')<>'array' or jsonb_array_length(p_content->'images')>20 then raise exception 'At most 20 photos per section'; end if;
  for picture in select value from jsonb_array_elements(p_content->'images') loop
   if jsonb_typeof(picture)<>'object' or coalesce(picture->>'path','') not like auth.uid()::text||'/%'
     or not exists(select 1 from storage.objects where bucket_id='owner-content-images' and name=picture->>'path') then raise exception 'Use an image uploaded by this owner'; end if;
  end loop;
 end if;
 perform pg_advisory_xact_lock(hashtextextended('owner_content:'||p_scope||':'||p_section,0));
 select * into previous from public.owner_content where scope=p_scope and section=p_section for update;
 if coalesce(previous.revision,0) is distinct from p_revision then raise exception 'This section changed in another window. Reload before saving.' using errcode='40001'; end if;
 if previous.scope is not null then
  insert into private.owner_content_history(scope,section,content,revision,changed_by) values(p_scope,p_section,previous.content,previous.revision,auth.uid());
 end if;
 insert into public.owner_content(scope,section,feature,content,revision,updated_by)
 values(p_scope,p_section,p_feature,p_content,p_revision+1,auth.uid())
 on conflict(scope,section) do update set content=excluded.content,feature=excluded.feature,revision=excluded.revision,updated_by=excluded.updated_by,updated_at=now() returning * into result;
 return result;
end; $$;
revoke all on function public.save_owner_content(text,text,text,jsonb,integer) from public,anon;
grant execute on function public.save_owner_content(text,text,text,jsonb,integer) to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('owner-content-images','owner-content-images',false,10485760,array['image/jpeg','image/png','image/webp','image/gif']) on conflict(id) do nothing;
create policy owner_content_image_upload on storage.objects for insert to authenticated with check(bucket_id='owner-content-images' and public.current_role()='owner' and (storage.foldername(name))[1]=auth.uid()::text);
create policy owner_content_image_read on storage.objects for select to anon,authenticated using(bucket_id='owner-content-images' and (public.current_role()='owner' or exists(select 1 from public.owner_content c where c.content->'images' @> jsonb_build_array(jsonb_build_object('path',name)))));

-- Indexed normalized terms: meanings and aliases aid discovery but never replace Arabic calculation text.
create table private.purpose_search_terms (
 record_id uuid not null references public.platform_records(id) on delete cascade,
 term text not null, primary key(record_id,term)
);
create index purpose_search_terms_term on private.purpose_search_terms(term text_pattern_ops);
alter table private.purpose_search_terms enable row level security;
create function private.refresh_purpose_search_terms() returns trigger language plpgsql security definer set search_path='' as $$
begin
 delete from private.purpose_search_terms where record_id=NEW.id;
 if NEW.entity='PurposeDictionary' and coalesce(NEW.data->>'is_active','true')<>'false' then
  insert into private.purpose_search_terms(record_id,term)
  select distinct NEW.id,private.purpose_normalize(t) from (
   select unnest(array[NEW.data->>'purpose_phrase',NEW.data->>'arabic_keyword',NEW.data->>'english_meaning',NEW.data->>'malayalam_meaning']) t
   union all select jsonb_array_elements_text(case when jsonb_typeof(NEW.data->'aliases')='array' then NEW.data->'aliases' else '[]'::jsonb end)
  ) s where length(private.purpose_normalize(t)) between 1 and 2000 on conflict do nothing;
 end if;
 return NEW;
end; $$;
revoke all on function private.refresh_purpose_search_terms() from public,anon,authenticated;
create trigger insert_purpose_search_terms after insert on public.platform_records for each row when (NEW.entity='PurposeDictionary') execute function private.refresh_purpose_search_terms();
create trigger update_purpose_search_terms after update of data,entity on public.platform_records for each row when (NEW.entity='PurposeDictionary' or OLD.entity='PurposeDictionary') execute function private.refresh_purpose_search_terms();
insert into private.purpose_search_terms(record_id,term)
select distinct r.id,private.purpose_normalize(t) from public.platform_records r cross join lateral (
 select unnest(array[r.data->>'purpose_phrase',r.data->>'arabic_keyword',r.data->>'english_meaning',r.data->>'malayalam_meaning']) t
 union all select jsonb_array_elements_text(case when jsonb_typeof(r.data->'aliases')='array' then r.data->'aliases' else '[]'::jsonb end)
) s where r.entity='PurposeDictionary' and coalesce(r.data->>'is_active','true')<>'false' and length(private.purpose_normalize(t)) between 1 and 2000 on conflict do nothing;
create function public.search_purpose_dictionary(p_query text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare needle text;
begin
 if auth.uid() is null or public.current_role()='customer' and not exists(select 1 from public.profiles where id=auth.uid() and status='active') then raise exception 'Sign in required' using errcode='42501'; end if;
 needle:=private.purpose_normalize(trim(coalesce(p_query,'')));
 if length(needle)<2 or length(needle)>2000 then return '[]'::jsonb; end if;
 return (select coalesce(jsonb_agg(result),'[]') from (
 select jsonb_build_object('id',r.id,'arabic_keyword',coalesce(nullif(r.data->>'arabic_keyword',''),r.data->>'purpose_phrase'),'purpose_phrase',r.data->>'purpose_phrase','malayalam_meaning',r.data->>'malayalam_meaning','english_meaning',r.data->>'english_meaning') result
 from public.platform_records r join (select record_id,min(case when term=needle then 0 else 1 end) rank from private.purpose_search_terms where term like replace(replace(replace(needle,'\','\\'),'%','\%'),'_','\_')||'%' group by record_id order by rank,record_id limit 8) t on t.record_id=r.id order by t.rank,r.created_at,r.id
 ) s);
end; $$;
revoke all on function public.search_purpose_dictionary(text) from public,anon;
grant execute on function public.search_purpose_dictionary(text) to authenticated;
create or replace function public.lookup_purpose_intent(p_phrase text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare needle text; matched public.platform_records;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 needle:=private.purpose_normalize(trim(coalesce(p_phrase,'')));
 if needle='' or length(needle)>2000 then return jsonb_build_object('matched',false); end if;
 select r.* into matched from public.platform_records r join private.purpose_search_terms t on t.record_id=r.id and t.term=needle
 order by case when private.purpose_normalize(coalesce(nullif(r.data->>'arabic_keyword',''),r.data->>'purpose_phrase'))=needle then 0 else 1 end,r.created_at,r.id limit 1;
 if matched.id is null then return jsonb_build_object('matched',false); end if;
 return jsonb_build_object('matched',true,'ritualIntent',matched.data->>'normalized_purpose_key','normalized_purpose_key',matched.data->>'normalized_purpose_key','matchedPhrase',coalesce(nullif(matched.data->>'arabic_keyword',''),matched.data->>'purpose_phrase'),'english_meaning',coalesce(matched.data->>'english_meaning',''),'malayalam_meaning',coalesce(matched.data->>'malayalam_meaning',''),'source',coalesce(matched.data->>'source','Purpose Dictionary'));
end; $$;
create policy purpose_owner_insert on public.platform_records as restrictive for insert to authenticated with check(entity<>'PurposeDictionary' or public.current_role()='owner');
create policy purpose_owner_update on public.platform_records as restrictive for update to authenticated using(entity<>'PurposeDictionary' or public.current_role()='owner') with check(entity<>'PurposeDictionary' or public.current_role()='owner');
create policy purpose_owner_delete on public.platform_records as restrictive for delete to authenticated using(entity<>'PurposeDictionary' or public.current_role()='owner');
create function public.save_purpose_entry(p_id text,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
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
  select * into other from public.platform_records where entity='PurposeDictionary' and id is distinct from rec.id and coalesce(data->>'is_active','true')<>'false' and private.purpose_normalize(coalesce(nullif(data->>'arabic_keyword',''),data->>'purpose_phrase'))=nk limit 1;
  if other.id is not null then raise exception 'This Arabic word already exists. Edit the existing entry instead.' using errcode='23505'; end if;
 end if;
 if rec.id is null then insert into public.platform_records(entity,owner_id,data) values('PurposeDictionary',auth.uid(),p_data) returning * into rec;
 else update public.platform_records set data=data||p_data where id=rec.id returning * into rec; end if;
 return to_jsonb(rec);
end; $$;
revoke all on function public.save_purpose_entry(text,jsonb) from public,anon;
grant execute on function public.save_purpose_entry(text,jsonb) to authenticated;
create function public.archive_purpose_duplicates() returns jsonb language plpgsql security invoker set search_path='' as $$
declare backup jsonb; rec record; removed integer:=0;
begin
 if public.current_role() is distinct from 'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended('purpose_dictionary_write',0));
 backup:=private.snapshot_purpose_dictionary('Before archiving duplicate words');
 for rec in select id,first_value(id) over(partition by private.purpose_normalize(coalesce(nullif(data->>'arabic_keyword',''),data->>'purpose_phrase')),data->>'normalized_purpose_key',data->>'action' order by created_at,id) keep_id,
 row_number() over(partition by private.purpose_normalize(coalesce(nullif(data->>'arabic_keyword',''),data->>'purpose_phrase')),data->>'normalized_purpose_key',data->>'action' order by created_at,id) n
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
