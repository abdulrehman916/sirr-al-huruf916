-- Preserve revision conflict checks while allowing a lost-response retry.
create or replace function public.save_owner_content(p_scope text,p_section text,p_feature text,p_content jsonb,p_revision integer)
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
   if picture ? 'caption' and jsonb_typeof(picture->'caption')<>'string' then raise exception 'Photo caption must be text'; end if;
   if jsonb_typeof(picture)<>'object' or coalesce(picture->>'path','') not like auth.uid()::text||'/%'
     or not exists(select 1 from storage.objects where bucket_id='owner-content-images' and name=picture->>'path') then raise exception 'Use an image uploaded by this owner'; end if;
  end loop;
 end if;
 perform pg_advisory_xact_lock(hashtextextended('owner_content:'||p_scope||':'||p_section,0));
 select * into previous from public.owner_content where scope=p_scope and section=p_section for update;
 -- Replaying the same accepted save after a lost reply is successful.
 if previous.revision=p_revision+1 and previous.content=p_content and previous.feature=p_feature then return previous; end if;
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
