-- Search only the independently stored index; source text is never rewritten.
create function private.library_search_text(d jsonb) returns text
language sql immutable security invoker set search_path='' as $$
 select lower(translate(regexp_replace(coalesce(nullif(d->>'search_text',''),
   coalesce(d->>'ocr_text','')||' '||coalesce(d->>'arabic_text','')||' '||coalesce(d->>'malayalam_text','')||' '||coalesce(d->>'english_text','')),
   '[ـًٌٍَُِّْٰۖ-ۭ]','','g'),'أإآٱى','ااااي'));
$$;
revoke all on function private.library_search_text(jsonb) from public,anon;
grant execute on function private.library_search_text(jsonb) to authenticated;
create index master_pdf_text_lookup on public.platform_records using gin(private.library_search_text(data) extensions.gin_trgm_ops) where entity='MasterPdfPage';
create index master_pdf_book_lookup on public.platform_records((data->>'master_book_id')) where entity='MasterPdfPage';

create function public.owner_library_search(p_query text,p_mode text default 'harakat_insensitive',p_after uuid default null,p_limit integer default 30)
returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare needle text; rows_json jsonb; more boolean; cursor_id uuid; n integer:=least(greatest(coalesce(p_limit,30),1),100);
begin
 if public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 if length(trim(coalesce(p_query,''))) not between 2 and 200 then raise exception 'Enter between 2 and 200 characters'; end if;
 if p_mode not in ('harakat_insensitive','arabic','exact','malayalam','english') then raise exception 'This search mode needs an additional search service'; end if;
 needle:=case when p_mode='exact' then lower(trim(p_query)) else private.library_search_text(jsonb_build_object('search_text',trim(p_query))) end;
 with matched as (
   select r.* from public.platform_records r where r.entity='MasterPdfPage' and (p_after is null or r.id>p_after)
   and case when p_mode='exact' then position(needle in lower(coalesce(r.data->>'search_text',r.data->>'ocr_text',''))) > 0
     else private.library_search_text(r.data) like '%'||replace(replace(replace(needle,'\','\\'),'%','\%'),'_','\_')||'%' end
   order by r.id limit n+1
 ), numbered as (select *,row_number() over(order by id) position from matched), projected as (
   select r.id,r.position,jsonb_build_object('page_id',coalesce(r.data->>'_base44_legacy_id',r.id::text),'page_number',r.data->'page_number',
    'arabic',coalesce(r.data->>'arabic_text',r.data->>'ocr_text_ar',''),'ocr_text',coalesce(r.data->>'ocr_text',''),
    'malayalam',coalesce(r.data->>'malayalam_text',r.data->>'ocr_text_ml',''),'english',coalesce(r.data->>'english_text',r.data->>'ocr_text_en',''),
    'ocr_confidence',r.data->'ocr_confidence','review_status',r.data->'review_status','cloud_source','Independent index','duplicate_status','Not assessed',
    'original_scan_url',r.data->'original_scan_url','pdf_file_url',coalesce(b.data#>'{pdf_parts,0,file_url}',b.data#>'{pdf_parts,0,pdf_url}'),
    'citation',jsonb_build_object('book_title',b.data->>'book_title','book_title_ar',b.data->>'book_title_ar','author',b.data->>'author','page_number',r.data->'page_number','master_book_id',r.data->'master_book_id')) item
   from numbered r left join lateral (select data from public.platform_records where entity='MasterPdfBook' and (data->>'master_book_id'=r.data->>'master_book_id' or id::text=r.data->>'master_book_id' or data->>'_base44_legacy_id'=r.data->>'master_book_id') order by created_at limit 1) b on true
 ) select coalesce(jsonb_agg(item order by id) filter(where position<=n),'[]'),coalesce(bool_or(position>n),false),(array_agg(id order by id desc) filter(where position<=n))[1] into rows_json,more,cursor_id from projected;
 return jsonb_build_object('success',true,'query',p_query,'mode',p_mode,'db_results',rows_json,'has_more',more,'next_cursor',cursor_id,
   'counts',jsonb_build_object('db',jsonb_array_length(rows_json)),'source_scope','independent_index','ai_was_used',false);
end; $$;
revoke all on function public.owner_library_search(text,text,uuid,integer) from public,anon;
grant execute on function public.owner_library_search(text,text,uuid,integer) to authenticated;

create function public.owner_library_status() returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare books_json jsonb; totals jsonb; processed bigint;
begin
 if public.current_role()<>'owner' then raise exception 'Owner access required' using errcode='42501'; end if;
 with pages as (select data->>'master_book_id' book_id,count(*) pages_scanned from public.platform_records where entity='MasterPdfPage' group by 1), books as (
  select r.id,r.data,coalesce(p.pages_scanned,0) scanned,
   case when r.data->>'total_pages'~'^[0-9]+$' then (r.data->>'total_pages')::bigint else 0 end expected,
   case lower(coalesce(r.data->>'extraction_status','pending')) when 'pending_verification' then 'needs_review' when 'cloud_deleted' then 'source_unavailable' else lower(coalesce(r.data->>'extraction_status','pending')) end status
  from public.platform_records r left join pages p on p.book_id=coalesce(r.data->>'master_book_id',r.data->>'_base44_legacy_id',r.id::text) where r.entity='MasterPdfBook'
 ) select coalesce(jsonb_agg(jsonb_build_object('book_id',coalesce(data->>'master_book_id',id::text),'book_title',data->>'book_title','status',status,
   'pages_scanned',scanned,'pages_remaining',greatest(expected-scanned,0),'completion_percentage',case when expected>0 then least(100,round(100.0*scanned/expected)) else null end,
   'last_scan_date',data->'last_verified_at') order by data->>'book_title',id),'[]'),
   jsonb_build_object('total_books',count(*),'completed',count(*) filter(where status='completed'),'in_progress',count(*) filter(where status in ('in_progress','processing')),
   'needs_rescan',count(*) filter(where status='needs_rescan'),'needs_review',count(*) filter(where status='needs_review'),'source_unavailable',count(*) filter(where status='source_unavailable'),
   'failed',count(*) filter(where status='failed'),'corrupt',count(*) filter(where status='corrupt'),'newly_imported',count(*) filter(where status in ('pending','newly_imported')))
 into books_json,totals from books;
 select count(*) into processed from public.platform_records where entity='MasterPdfPage';
 return jsonb_build_object('success',true,'library_status',totals,'books',books_json,'scan_status','recorded_status',
   'scan_metadata',jsonb_build_object('pagesProcessed',processed),'books_needing_rescan',coalesce((select jsonb_agg(b) from jsonb_array_elements(books_json) b where b->>'status'='needs_rescan'),'[]'));
end; $$;
revoke all on function public.owner_library_status() from public,anon;
grant execute on function public.owner_library_status() to authenticated;
