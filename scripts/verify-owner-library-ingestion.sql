-- All source fixtures and actions are rolled back.
begin;
select set_config('test.owner',(select id::text from public.profiles where role='owner' and status='active' limit 1),true);
insert into storage.objects(bucket_id,name,owner_id) values('private-documents',current_setting('test.owner')||'/ROLLBACK-LIBRARY-IMPORT.pdf',current_setting('test.owner'));
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
set local role authenticated;
do $$
declare r jsonb; again jsonb; book_id text; source_path text:=current_setting('test.owner')||'/ROLLBACK-LIBRARY-IMPORT.pdf'; record_data jsonb; n int;
begin
 r:=public.owner_library_ingest(jsonb_build_object('mode','find','file_sha256',repeat('a',64)));
 if r->'book'<>'null'::jsonb then raise exception 'Fixture fingerprint unexpectedly exists'; end if;
 begin
   perform public.owner_library_ingest(jsonb_build_object('mode','begin','file_sha256',repeat('a',64),'object_path','not-owned/secret.pdf','total_pages',2,'file_name','fixture.pdf','file_size',500,'language','ara'));
   raise exception 'Foreign upload accepted';
 exception when insufficient_privilege then null; end;
 begin
   perform public.owner_library_ingest(jsonb_build_object('mode','begin','file_sha256',repeat('a',64),'object_path',source_path,'total_pages',5001,'file_name','fixture.pdf','file_size',500,'language','ara'));
   raise exception 'Oversized document accepted';
 exception when raise_exception then if sqlerrm='Oversized document accepted' then raise; end if; end;
 r:=public.owner_library_ingest(jsonb_build_object('mode','begin','file_sha256',repeat('a',64),'object_path',source_path,'total_pages',2,'file_name','fixture.pdf','file_size',500,'language','ara'));
 book_id:=r#>>'{book,master_book_id}';
 if not (r->>'created')::boolean or r#>>'{book,pdf_parts,0,file_url}'<>'storage://private-documents/'||source_path then raise exception 'Private source not preserved'; end if;
 again:=public.owner_library_ingest(jsonb_build_object('mode','begin','file_sha256',repeat('a',64)));
 if (again->>'created')::boolean or again#>>'{book,master_book_id}'<>book_id then raise exception 'Repeated upload created a duplicate book'; end if;
 begin
   perform public.owner_library_ingest(jsonb_build_object('mode','page','master_book_id',book_id,'page_number',2,'text','out of sequence','method','pdf_text','language','ara'));
   raise exception 'Out of sequence accepted';
 exception when raise_exception then if sqlerrm='Out of sequence accepted' then raise; end if; end;
 r:=public.owner_library_ingest(jsonb_build_object('mode','page','master_book_id',book_id,'page_number',1,'text','سَلَامٌ عَلَيْكُمْ','method','pdf_text','language','ara'));
 again:=public.owner_library_ingest(jsonb_build_object('mode','page','master_book_id',book_id,'page_number',1,'text','سَلَامٌ عَلَيْكُمْ','method','pdf_text','language','ara'));
 if not (again->>'replayed')::boolean then raise exception 'Lost-response retry was not idempotent'; end if;
 select count(*) into n from public.platform_records where entity='MasterPdfPage' and data->>'master_book_id'=book_id;
 if n<>1 then raise exception 'Page duplicated'; end if;
 perform public.owner_library_ingest(jsonb_build_object('mode','pause','master_book_id',book_id,'error','Rollback-only network interruption'));
 r:=public.owner_library_ingest(jsonb_build_object('mode','find','file_sha256',repeat('a',64)));
 if r#>>'{book,last_processed_page}'<>'1' or r#>>'{book,extraction_status}'<>'paused' then raise exception 'Resume checkpoint lost'; end if;
 begin
   perform public.owner_library_ingest(jsonb_build_object('mode','page','master_book_id',book_id,'page_number',1,'text','tampered','method','pdf_text','language','ara'));
   raise exception 'Original text replaced';
 exception when raise_exception then if sqlerrm='Original text replaced' then raise; end if; end;
 begin
   perform public.owner_library_ingest(jsonb_build_object('mode','page','master_book_id',book_id,'page_number',2,'text',repeat('x',200001),'method','tesseract','language','ara','confidence',84.5));
   raise exception 'Text limit bypassed';
 exception when raise_exception then if sqlerrm='Text limit bypassed' then raise; end if; end;
 r:=public.owner_library_ingest(jsonb_build_object('mode','page','master_book_id',book_id,'page_number',2,'text','مَصْدَرٌ','method','tesseract','language','ara','confidence',84.5));
 if not (r->>'complete')::boolean then raise exception 'Final page did not finish indexing'; end if;
 select data into record_data from public.platform_records where entity='MasterPdfPage' and data->>'master_book_id'=book_id and data->>'page_number'='2';
 if record_data->>'ocr_text'<>'مَصْدَرٌ' or record_data->>'review_status'<>'pending_review' or not (record_data->>'needs_owner_review')::boolean or record_data#>>'{quality_flags,low_ocr_confidence}'<>'true' then raise exception 'OCR fidelity/review gate lost'; end if;
 select data into record_data from public.platform_records where entity='MasterPdfBook' and data->>'master_book_id'=book_id;
 if record_data->>'extraction_status'<>'pending_verification' or record_data->>'total_pages_indexed'<>'2' or jsonb_array_length(record_data->'version_history')<>2 then raise exception 'Completion/status/history incorrect'; end if;
 perform set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
 begin perform public.owner_library_ingest(jsonb_build_object('mode','find','file_sha256',repeat('a',64))); raise exception 'Missing profile allowed import'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.profiles set status='disabled' where id=current_setting('test.owner')::uuid;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
set local role authenticated;
do $$ begin
 begin perform public.owner_library_ingest(jsonb_build_object('mode','find','file_sha256',repeat('a',64))); raise exception 'Disabled owner allowed import'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','',true);
set local role anon;
do $$ begin
 begin perform public.owner_library_ingest('{}'); raise exception 'Guest allowed import'; exception when insufficient_privilege then null; end;
end $$;
select 'PASS private source, duplicate book/page prevention, lost-response retry, checkpoint resume, original text/harakat retention, bounded payloads, review gate and guest/missing/disabled profile denial' checks;
rollback;
