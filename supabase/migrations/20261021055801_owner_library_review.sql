-- Independent owner review. Original OCR and source records are retained.
create function public.owner_library_review(p_payload jsonb) returns jsonb
language plpgsql security invoker set search_path='' as $$
declare
 actor public.profiles; rec public.platform_records; canonical public.platform_records; book public.platform_records;
 mode text:=p_payload->>'mode'; field text:=p_payload->>'field'; patch jsonb:='{}'; entry jsonb; result jsonb;
 request_id uuid:=(p_payload->>'request_id')::uuid; stamp timestamptz:=now(); details text; status text:='success';
 old_value text; new_value text; history jsonb;
begin
 if public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if request_id is null then raise exception 'A request identifier is required'; end if;
 if mode not in ('approve','reject','re_review','correct','note','uncertain','merge') or mode is null then
   raise exception 'Unsupported review action; OCR reprocessing requires a configured extraction service';
 end if;
 select * into actor from public.profiles where id=auth.uid();
 -- A request can only be applied once, including concurrent retries.
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||request_id::text,0));
 select data->'result' into result from public.platform_records where entity='SirrAuditLog' and data->>'request_id'=request_id::text and data->>'user_id'=auth.uid()::text limit 1;
 if result is not null then return result; end if;
 select * into rec from public.platform_records where entity='MasterPdfPage' and (id::text=p_payload->>'page_id' or data->>'_base44_legacy_id'=p_payload->>'page_id') limit 1 for update;
 if rec.id is null then raise exception 'Page not found'; end if;
 old_value:=coalesce(rec.data->>'review_status','pending_review');
 if mode in ('approve','reject') then
   new_value:=case mode when 'approve' then 'approved' else 'rejected' end;
   patch:=jsonb_build_object('review_status',new_value,'needs_owner_review',mode='reject','reviewed_by',actor.id,'reviewed_at',stamp);
   details:='Page '||coalesce(rec.data->>'page_number','')||' '||new_value||case when mode='reject' then ': '||left(coalesce(p_payload->>'reason',''),500) else ' by Owner.' end;
   status:=case mode when 'reject' then 'failed' else 'success' end;
 elsif mode='re_review' then
   if old_value not in ('rejected','ignored') then raise exception 'Only rejected or ignored pages can be reopened'; end if;
   patch:=jsonb_build_object('review_status','pending_review','needs_owner_review',true,'reviewed_by','','reviewed_at','');
   new_value:='pending_review'; details:='Page reopened for owner review.';
 elsif mode='correct' then
   if field not in ('arabic_text','english_text','malayalam_text') or field is null then raise exception 'Only verified language fields can be corrected'; end if;
   if jsonb_typeof(p_payload->'corrected_value') is distinct from 'string' or length(p_payload->>'corrected_value')>100000 then raise exception 'Invalid correction'; end if;
   old_value:=coalesce(rec.data->>field,''); new_value:=p_payload->>'corrected_value';
   entry:=jsonb_build_object('correction_id',request_id,'timestamp',stamp,'corrected_by',actor.id,'field',field,
    'original_snippet',left(old_value,400),'corrected_snippet',left(new_value,400),'original_value',old_value,'corrected_value',new_value,'reason',left(coalesce(p_payload->>'reason',''),500));
   history:=case when jsonb_typeof(rec.data->'ocr_corrections')='array' then rec.data->'ocr_corrections' else '[]'::jsonb end;
   patch:=jsonb_build_object(field,new_value,'ocr_corrections',history||jsonb_build_array(entry));
   patch:=patch||jsonb_build_object('search_text',lower(concat_ws(' ',rec.data->>'ocr_text',
    (rec.data||patch)->>'arabic_text',(rec.data||patch)->>'english_text',(rec.data||patch)->>'malayalam_text')));
   details:='Corrected '||field||' on page '||coalesce(rec.data->>'page_number','')||'. '||left(coalesce(p_payload->>'reason',''),500);
 elsif mode='note' then
   if length(trim(coalesce(p_payload->>'note','')))=0 then raise exception 'Note is required'; end if;
   details:='NOTE: '||left(trim(p_payload->>'note'),1000); status:='info';
 elsif mode='uncertain' then
   patch:=jsonb_build_object('needs_owner_review',true); details:='Page marked uncertain by Owner.'; status:='info';
 elsif mode='merge' then
   if old_value in ('approved','verified') then raise exception 'Approved pages cannot be merged'; end if;
   select * into canonical from public.platform_records where entity='MasterPdfPage' and (id::text=p_payload->>'canonical_page_record_id' or data->>'_base44_legacy_id'=p_payload->>'canonical_page_record_id') limit 1;
   if canonical.id is null or canonical.id=rec.id or nullif(rec.data->>'content_hash','') is null or canonical.data->>'content_hash' is distinct from rec.data->>'content_hash' or canonical.data->>'review_status' in ('ignored','rejected') or nullif(canonical.data->>'canonical_page_record_id','') is not null then raise exception 'Select a different canonical page with identical content'; end if;
   patch:=jsonb_build_object('review_status','ignored','canonical_page_record_id',canonical.id,'reviewed_by',actor.id,'reviewed_at',stamp);
   new_value:='ignored'; details:='Duplicate page retained; canonical record '||canonical.id::text; status:='info';
 end if;
 if patch<>'{}'::jsonb then update public.platform_records set data=data||patch where id=rec.id; end if;
 result:=jsonb_build_object('success',true,'page_id',p_payload->>'page_id','review_status',coalesce(patch->>'review_status',rec.data->>'review_status'),'request_id',request_id);
 insert into public.platform_records(entity,owner_id,data) values('SirrAuditLog',actor.id,jsonb_build_object('audit_id',request_id,'request_id',request_id,'record_id',rec.id,
  'sirr_book_id',rec.data->>'master_book_id','part_id',rec.data->>'source_part_id','part_number',rec.data->'source_part_number',
  'action','verify','user_id',actor.id,'user_name',actor.email,'timestamp',stamp,'page_range',rec.data->>'page_number','status',status,'details',details,'result',result));
 if mode in ('approve','reject','correct','merge') then
   select * into book from public.platform_records where entity='MasterPdfBook' and data->>'master_book_id'=rec.data->>'master_book_id' order by id limit 1 for update;
   if book.id is not null then
     history:=case when jsonb_typeof(book.data->'version_history')='array' then book.data->'version_history' else '[]'::jsonb end;
     entry:=jsonb_build_object('version_id',request_id,'timestamp',stamp,'action','review','user_id',actor.id,'user_name',actor.email,'change_summary',details,'previous_value',old_value,'new_value',new_value);
     update public.platform_records set data=jsonb_set(data,'{version_history}',history||jsonb_build_array(entry)) where id=book.id;
   end if;
 end if;
 return result;
end; $$;
revoke all on function public.owner_library_review(jsonb) from public,anon;
grant execute on function public.owner_library_review(jsonb) to authenticated;

create index master_pdf_content_hash_lookup on public.platform_records((data->>'content_hash')) where entity='MasterPdfPage';
create function public.owner_library_pages(p_payload jsonb default '{}') returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare rows_json jsonb; books_json jsonb; more boolean; cursor_id uuid; needle text;
begin
 if public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 needle:=trim(coalesce(p_payload->>'query',''));
 if length(needle)>200 then raise exception 'Search is limited to 200 characters'; end if;
 needle:=private.library_search_text(jsonb_build_object('search_text',needle));
 with matched as (
 select r.* from public.platform_records r where entity='MasterPdfPage'
 and (nullif(p_payload->>'after','') is null or r.id>(p_payload->>'after')::uuid)
 and (needle='' or private.library_search_text(r.data) like '%'||replace(replace(replace(needle,'\','\\'),'%','\%'),'_','\_')||'%')
 and (coalesce(p_payload->>'only_review','false')<>'true' or r.data->>'needs_owner_review'='true')
 and (coalesce(p_payload->>'only_duplicates','false')<>'true' or (nullif(r.data->>'content_hash','') is not null and exists(select 1 from public.platform_records d where d.entity='MasterPdfPage' and d.id<>r.id and d.data->>'content_hash'=r.data->>'content_hash')))
 order by r.id limit 51
 ), numbered as (select *,row_number() over(order by id) position from matched)
 select coalesce(jsonb_agg(data||jsonb_build_object('id',coalesce(data->>'_base44_legacy_id',id::text),'_record_id',id)) filter(where position<=50),'[]'),
 coalesce(bool_or(position>50),false),(array_agg(id order by id desc) filter(where position<=50))[1]
 into rows_json,more,cursor_id from numbered;
 select coalesce(jsonb_agg(r.data||jsonb_build_object('id',coalesce(r.data->>'_base44_legacy_id',r.id::text))),'[]') into books_json
 from public.platform_records r where r.entity='MasterPdfBook' and r.data->>'master_book_id' in (select p->>'master_book_id' from jsonb_array_elements(rows_json) p);
 return jsonb_build_object('success',true,'pages',rows_json,'books',books_json,'has_more',more,'next_cursor',cursor_id);
end; $$;
revoke all on function public.owner_library_pages(jsonb) from public,anon;
grant execute on function public.owner_library_pages(jsonb) to authenticated;
