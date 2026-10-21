-- Resumable owner imports. Original files/text remain private and unapproved.
create unique index master_pdf_import_hash on public.platform_records(owner_id,(data->>'file_sha256'))
 where entity='MasterPdfBook' and data->>'import_pipeline'='browser_pdf_v1';
create unique index master_pdf_import_page on public.platform_records((data->>'page_record_id'))
 where entity='MasterPdfPage' and data->>'import_pipeline'='browser_pdf_v1';

create function public.owner_library_ingest(p_payload jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare
 mode text:=p_payload->>'mode'; fingerprint text:=p_payload->>'file_sha256'; rec public.platform_records;
 prev public.platform_records; book_id text; part_id text; source_path text; source_url text;
 n int; total int; last_page int; raw_text text; content_hash text; method text; lang text;
 confidence numeric; patch jsonb; stamp timestamptz:=now(); entry jsonb; result jsonb;
begin
 if public.current_role() is distinct from 'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if mode is null or mode not in ('find','begin','page','pause') then raise exception 'Unsupported import action'; end if;
 if mode in ('find','begin') then
   if fingerprint is null or fingerprint !~ '^[a-f0-9]{64}$' then raise exception 'A valid PDF fingerprint is required'; end if;
   perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||fingerprint,0));
   select * into rec from public.platform_records where entity='MasterPdfBook' and owner_id=auth.uid()
    and data->>'import_pipeline'='browser_pdf_v1' and data->>'file_sha256'=fingerprint limit 1 for update;
   if mode='find' or rec.id is not null then
     return jsonb_build_object('success',true,'created',false,'book',case when rec.id is null then null else rec.data||jsonb_build_object('_record_id',rec.id) end);
   end if;
   total:=(p_payload->>'total_pages')::int;
   source_path:=p_payload->>'object_path';
   if total is null or total<1 or total>5000 then raise exception 'A PDF must contain between 1 and 5000 pages'; end if;
   if source_path is null or left(source_path,length(auth.uid()::text)+1)<>auth.uid()::text||'/'
    or not exists(select 1 from storage.objects where bucket_id='private-documents' and name=source_path) then
     raise exception 'A private PDF uploaded by this owner is required' using errcode='42501';
   end if;
   if coalesce((p_payload->>'file_size')::bigint,0) not between 1 and 52428800 or length(trim(coalesce(p_payload->>'file_name','')))=0 then raise exception 'A PDF no larger than 50 MB is required'; end if;
   if coalesce(p_payload->>'language','') not in ('ara','eng','mal') then raise exception 'Unsupported document language'; end if;
   book_id:='MPB-'||gen_random_uuid()::text; part_id:=book_id||'-part-1';
   source_url:='storage://private-documents/'||source_path;
   entry:=jsonb_build_object('version_id',gen_random_uuid(),'timestamp',stamp,'action','upload','user_id',auth.uid(),'change_summary','Private PDF uploaded; all extracted pages require owner review.');
   insert into public.platform_records(entity,owner_id,data) values('MasterPdfBook',auth.uid(),jsonb_build_object(
    'master_book_id',book_id,'library_type','master_library','import_source','upload','import_pipeline','browser_pdf_v1',
    'file_sha256',fingerprint,'source_object_path',source_path,'file_size',(p_payload->>'file_size')::bigint,
    'book_title',left(p_payload->>'file_name',300),'malayalam_book_name',left(coalesce(nullif(trim(p_payload->>'display_name'),''),p_payload->>'file_name'),300),
    'language',p_payload->>'language','upload_date',stamp,'combined_total_pages',total,'total_pages',total,'total_pages_indexed',0,'last_processed_page',0,
    'extraction_status','processing','owner_review_status','pending','version_history',jsonb_build_array(entry),
    'pdf_parts',jsonb_build_array(jsonb_build_object('part_id',part_id,'part_number',1,'file_url',source_url,'file_name',left(p_payload->>'file_name',300),'file_size',(p_payload->>'file_size')::bigint,'uploaded_at',stamp,'processed',false,'extraction_status','processing')))) returning * into rec;
   insert into public.platform_records(entity,owner_id,data) values('SirrAuditLog',auth.uid(),jsonb_build_object('audit_id',gen_random_uuid(),'sirr_book_id',book_id,'action','upload','user_id',auth.uid(),'timestamp',stamp,'status','success','details','Started private PDF import. Original file preserved.'));
   return jsonb_build_object('success',true,'created',true,'book',rec.data||jsonb_build_object('_record_id',rec.id));
 end if;
 select * into rec from public.platform_records where entity='MasterPdfBook' and owner_id=auth.uid()
  and data->>'import_pipeline'='browser_pdf_v1' and data->>'master_book_id'=p_payload->>'master_book_id' limit 1 for update;
 if rec.id is null then raise exception 'Import not found' using errcode='42501'; end if;
 total:=(rec.data->>'total_pages')::int; last_page:=coalesce((rec.data->>'last_processed_page')::int,0);
 if mode='pause' then
   if last_page<total then
     update public.platform_records set data=data||jsonb_build_object('extraction_status','paused','extraction_error',left(coalesce(p_payload->>'error','Paused. Select the same PDF to resume.'),1000)) where id=rec.id returning * into rec;
   end if;
   return jsonb_build_object('success',true,'book',rec.data);
 end if;
 n:=(p_payload->>'page_number')::int; raw_text:=p_payload->>'text'; method:=p_payload->>'method'; lang:=p_payload->>'language';
 if n is null or n<1 or n>total or n>last_page+1 then raise exception 'Pages must be indexed in order'; end if;
 if raw_text is null or length(raw_text)>200000 then raise exception 'Page text is required and must be no longer than 200000 characters'; end if;
 if method is null or method not in ('pdf_text','tesseract') or lang is distinct from rec.data->>'language' then raise exception 'Invalid extraction method or language'; end if;
 confidence:=(p_payload->>'confidence')::numeric;
 if confidence is not null and (confidence<0 or confidence>100 or confidence='NaN'::numeric or method<>'tesseract') then raise exception 'Invalid OCR confidence'; end if;
 content_hash:=encode(sha256(convert_to(raw_text,'UTF8')),'hex');
 book_id:=rec.data->>'master_book_id'; part_id:=rec.data#>>'{pdf_parts,0,part_id}';
 select * into prev from public.platform_records where entity='MasterPdfPage' and data->>'import_pipeline'='browser_pdf_v1' and data->>'page_record_id'=book_id||'-page-'||n;
 if prev.id is not null then
   if prev.data->>'content_hash' is distinct from content_hash then raise exception 'Original page text cannot be replaced; use owner corrections'; end if;
   return jsonb_build_object('success',true,'replayed',true,'indexed',last_page,'total',total,'complete',last_page=total);
 end if;
 if n<=last_page then raise exception 'The saved page is missing; original checkpoints cannot be replaced'; end if;
 patch:=jsonb_build_object('import_pipeline','browser_pdf_v1','page_record_id',book_id||'-page-'||n,'master_book_id',book_id,'source_part_id',part_id,'source_part_number',1,
  'page_number',n,'content_hash',content_hash,'ocr_text',raw_text,'extraction_method',method,'ocr_confidence',confidence,'indexed_at',stamp,
  'review_status','pending_review','needs_owner_review',true,'quality_flags',jsonb_build_object('unreviewed_extraction',true,'empty_text',length(trim(raw_text))=0,'low_ocr_confidence',method='tesseract' and (confidence is null or confidence<85)),
  'search_text',lower(raw_text),'ocr_corrections','[]'::jsonb);
 -- These are extracted source text, never a generated translation.
 patch:=patch||case lang when 'ara' then jsonb_build_object('arabic_text',raw_text,'ocr_text_ar',raw_text) when 'mal' then jsonb_build_object('malayalam_text',raw_text,'ocr_text_ml',raw_text) else jsonb_build_object('english_text',raw_text,'ocr_text_en',raw_text) end;
 insert into public.platform_records(entity,owner_id,data) values('MasterPdfPage',auth.uid(),patch);
 patch:=jsonb_build_object('last_processed_page',n,'total_pages_indexed',n,'extraction_error',null,'extraction_status',case when n=total then 'pending_verification' else 'processing' end);
 update public.platform_records set data=jsonb_set(jsonb_set(data||patch,'{pdf_parts,0,processed}',to_jsonb(n=total)),'{pdf_parts,0,extraction_status}',to_jsonb(case when n=total then 'completed' else 'processing' end)) where id=rec.id;
 if n=total then
   entry:=jsonb_build_object('version_id',gen_random_uuid(),'timestamp',stamp,'action','extraction','user_id',auth.uid(),'change_summary','Indexed '||total||' pages. All pages require owner review before publication.');
   update public.platform_records set data=jsonb_set(data,'{version_history}',coalesce(data->'version_history','[]'::jsonb)||jsonb_build_array(entry)) where id=rec.id;
   insert into public.platform_records(entity,owner_id,data) values('SirrAuditLog',auth.uid(),jsonb_build_object('audit_id',gen_random_uuid(),'sirr_book_id',book_id,'action','extraction','user_id',auth.uid(),'timestamp',stamp,'status','success','details','Indexed '||total||' pages; pending owner review.'));
 end if;
 result:=jsonb_build_object('success',true,'indexed',n,'total',total,'complete',n=total);
 return result;
end; $$;
revoke all on function public.owner_library_ingest(jsonb) from public,anon;
grant execute on function public.owner_library_ingest(jsonb) to authenticated;
