begin;
select set_config('test.owner',(select id::text from public.profiles where role='owner' and status='active' limit 1),true);
insert into storage.objects(bucket_id,name,owner_id) values('owner-content-images',current_setting('test.owner')||'/rollback-photo.png',current_setting('test.owner'));
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
set local role authenticated;
do $$
declare r public.owner_content; result jsonb; entry_id text; data jsonb:=jsonb_build_object('purpose_phrase','اختبار قاموس مؤقت','arabic_keyword','اختبار قاموس مؤقت','malayalam_meaning','പരിശോധനാ വാക്ക്','english_meaning','Temporary dictionary test','normalized_purpose_key','knowledge','is_active',true,'aliases',jsonb_build_array('TEMPORARY ALIAS'));
begin
 r:=public.save_owner_content('/holy-names/one/ROLLBACK-TEST','note-1','section_b',jsonb_build_object('title','دُعَاءٌ','arabic',repeat('اللَّهُمَّ ',1000),'malayalam','മലയാളം വിവരണം','english','English description','images',jsonb_build_array(jsonb_build_object('path',current_setting('test.owner')||'/rollback-photo.png','caption','صورة'))),0);
 if r.revision<>1 or r.content->>'malayalam'<>'മലയാളം വിവരണം' then raise exception 'Multilingual content lost'; end if;
 perform public.save_owner_content('/holy-names/one/OTHER-CARD','note-1','section_a','{"title":"Separate card"}',0);
 if (select count(*) from public.owner_content where scope='/holy-names/one/ROLLBACK-TEST')<>1 then raise exception 'Cards mixed'; end if;
 begin perform public.save_owner_content(r.scope,r.section,'section_b','{"title":"Stale"}',0); raise exception 'Stale write accepted'; exception when serialization_failure then null; end;
 perform public.save_owner_content(r.scope,r.section,'section_b','{"title":"Updated"}',1);
 begin perform public.save_owner_content(r.scope,'bad','section_b','{"abjad_value":999}',0); raise exception 'Calculation field accepted'; exception when raise_exception then if sqlerrm='Calculation field accepted' then raise; end if; end;
 begin perform public.save_owner_content(r.scope,'bad','section_b','{"images":[{"path":"foreign/secret.png"}]}',0); raise exception 'Foreign image accepted'; exception when raise_exception then if sqlerrm='Foreign image accepted' then raise; end if; end;
 -- Thousand independent entries in one card, fetched twenty at a time by the UI.
 for i in 1..1000 loop perform public.save_owner_content('/holy-names/one/SCALE-ROLLBACK','note-'||lpad(i::text,4,'0'),'section_b',jsonb_build_object('title','Entry '||i),0); end loop;
 if (select count(*) from public.owner_content where scope='/holy-names/one/SCALE-ROLLBACK')<>1000 then raise exception 'Thousand-entry capacity failed'; end if;
 result:=public.save_purpose_entry(null,data); entry_id:=result->>'id';
 if jsonb_array_length(public.search_purpose_dictionary('temporary'))<1 then raise exception 'English prefix not found'; end if;
 if jsonb_array_length(public.search_purpose_dictionary('പരിശോധനാ'))<1 then raise exception 'Malayalam prefix not found'; end if;
 if public.lookup_purpose_intent('temporary alias')->>'normalized_purpose_key'<>'knowledge' then raise exception 'Normalized alias not found'; end if;
 begin perform public.save_purpose_entry(null,data); raise exception 'Duplicate accepted'; exception when unique_violation then null; end;
 data:=data||'{"is_active":false}'::jsonb; perform public.save_purpose_entry(entry_id,data);
 if (public.lookup_purpose_intent('temporary alias')->>'matched')::boolean then raise exception 'Inactive word matched'; end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 begin perform public.save_owner_content(r.scope,'bad','section_b','{"title":"Forbidden"}',0); raise exception 'Unknown user wrote content'; exception when insufficient_privilege then null; end;
 begin perform public.save_purpose_entry(null,data); raise exception 'Unknown user wrote dictionary'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$ begin
 if exists(select 1 from public.owner_content where scope='/holy-names/one/SCALE-ROLLBACK') then raise exception 'Unentitled guest read paid card'; end if;
 begin perform public.save_owner_content('/plants/1','bad','','{"title":"Forbidden"}',0); raise exception 'Guest wrote content'; exception when insufficient_privilege then null; end;
end $$;
select 'PASS: multilingual/long text, photos, card isolation, optimistic revisions, 1000 entries, calculation-field denial, dictionary meanings/aliases/dedup/inactive, owner-only writes and entitled reads' checks;
rollback;
