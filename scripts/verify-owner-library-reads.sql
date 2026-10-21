begin;
select set_config('test.owner',(select id::text from public.profiles where role='owner' and status='active' limit 1),true);
insert into public.platform_records(entity,owner_id,data) values('MasterPdfBook',current_setting('test.owner')::uuid,'{"master_book_id":"ROLLBACK-LIBRARY-916","book_title":"Rollback Library Fixture","total_pages":40,"extraction_status":"pending_verification"}');
insert into public.platform_records(entity,owner_id,data)
select 'MasterPdfPage',current_setting('test.owner')::uuid,jsonb_build_object('master_book_id','ROLLBACK-LIBRARY-916','page_number',i,'search_text','فَحْصُٱلْإخْتبار916 fixture_library_token_916','arabic_text','فَحْصُٱلْإخْتبار916','ocr_text','Original fixture text') from generate_series(1,35) i;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
set local role authenticated;
do $$ declare r jsonb; cursor uuid; ids text[]:='{}'; row jsonb; status jsonb; begin
 loop
 r:=public.owner_library_search('فحصالاختبار916','harakat_insensitive',cursor,7);
 if jsonb_array_length(r->'db_results')>7 then raise exception 'Search page unbounded'; end if;
 for row in select * from jsonb_array_elements(r->'db_results') loop
   if row#>>'{citation,book_title}'<>'Rollback Library Fixture' or row->>'page_id'=any(ids) then raise exception 'Wrong citation or duplicate'; end if;
   if row->>'arabic'<>'فَحْصُٱلْإخْتبار916' then raise exception 'Source Arabic changed'; end if;
   ids:=array_append(ids,row->>'page_id');
 end loop;
 exit when not (r->>'has_more')::boolean;
 cursor:=(r->>'next_cursor')::uuid;
 end loop;
 if cardinality(ids)<>35 then raise exception 'Search lost matches'; end if;
 r:=public.owner_library_search('فحصالاختبار916','exact');
 if jsonb_array_length(r->'db_results')<>0 then raise exception 'Exact mode removed source diacritics'; end if;
 r:=public.owner_library_search('fixture_library_token_916','english');
 if jsonb_array_length(r->'db_results')<>30 or not (r->>'has_more')::boolean then raise exception 'English search or default bound failed'; end if;
 status:=public.owner_library_status();
 if not exists(select 1 from jsonb_array_elements(status->'books') b where b->>'book_id'='ROLLBACK-LIBRARY-916' and b->>'status'='needs_review' and (b->>'pages_scanned')::int=35 and (b->>'pages_remaining')::int=5) then raise exception 'Status counts or review state incorrect'; end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 begin perform public.owner_library_search('fixture_library_token_916'); raise exception 'Customer could search owner index'; exception when insufficient_privilege then null; end;
 begin perform public.owner_library_status(); raise exception 'Customer could see owner library'; exception when insufficient_privilege then null; end;
end $$;
select 'PASS normalized Arabic search, exact diacritics, English text, 35 paged matches, preserved source/citations, recorded review state and owner isolation' checks;
rollback;
