-- Allow short-lived signed downloads only for published FREE books.
-- Paid and selected-customer documents remain private.
drop policy if exists "published_free_book_download" on storage.objects;
create policy "published_free_book_download" on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'private-documents'
  and exists (
    select 1
    from public.platform_records r
    where r.entity = 'BookPublication'
      and r.data ->> 'pdf_path' = storage.objects.name
      and r.data ->> 'status' = 'PUBLISHED'
      and r.data ->> 'access_mode' = 'FREE'
  )
);
