-- The sole runtime reader allowed by purposeDictionaryIsolationLaw: one indexed, read-only match.
create index purpose_active_alias_lookup on public.platform_records using gin ((data->'aliases') jsonb_path_ops)
 where entity='PurposeDictionary' and data->>'is_active'='true';

create function public.lookup_purpose_intent(p_phrase text)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare needle text; matched public.platform_records;
begin
 if auth.uid() is null then raise exception 'Sign in required' using errcode='42501'; end if;
 needle:=private.purpose_normalize(left(trim(coalesce(p_phrase,'')),2000));
 if needle='' then return jsonb_build_object('matched',false); end if;
 select * into matched from public.platform_records
  where entity='PurposeDictionary' and data->>'is_active'='true'
   and private.purpose_normalize(coalesce(nullif(data->>'arabic_keyword',''),data->>'purpose_phrase'))=needle
  order by created_at,id limit 1;
 if matched.id is null then
   select * into matched from public.platform_records
    where entity='PurposeDictionary' and data->>'is_active'='true'
     and data->'aliases' @> jsonb_build_array(trim(p_phrase))
    order by created_at,id limit 1;
 end if;
 if matched.id is null then return jsonb_build_object('matched',false); end if;
 return jsonb_build_object('matched',true,'ritualIntent',matched.data->>'normalized_purpose_key',
  'normalized_purpose_key',matched.data->>'normalized_purpose_key','matchedPhrase',coalesce(matched.data->>'arabic_keyword',matched.data->>'purpose_phrase'),
  'english_meaning',coalesce(matched.data->>'english_meaning',''),'malayalam_meaning',coalesce(matched.data->>'malayalam_meaning',''),
  'source',coalesce(matched.data->>'source','Purpose Dictionary'));
end; $$;
revoke all on function public.lookup_purpose_intent(text) from public,anon;
grant execute on function public.lookup_purpose_intent(text) to authenticated;
