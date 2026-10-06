-- Move owner-published legacy ManagedPage records into the normalized resource
-- catalogue. This is idempotent and leaves the source records untouched.

insert into public.resources (
  slug, resource_type, title, summary, body, status, access_mode,
  price_minor, currency, validity_days, lifetime_access, asset_path,
  cover_url, metadata, owner_id, created_at, updated_at
)
select
  r.data ->> 'slug',
  'PAGE',
  jsonb_build_object(
    'ml', coalesce(r.data ->> 'title_ml', ''),
    'en', coalesce(r.data ->> 'title_en', ''),
    'ar', coalesce(r.data ->> 'title_ar', '')
  ),
  jsonb_build_object(
    'ml', coalesce(r.data ->> 'excerpt_ml', ''),
    'en', coalesce(r.data ->> 'excerpt_en', ''),
    'ar', coalesce(r.data ->> 'excerpt_ar', '')
  ),
  jsonb_build_object(
    'ml', coalesce(r.data ->> 'body_ml', ''),
    'en', coalesce(r.data ->> 'body_en', ''),
    'ar', coalesce(r.data ->> 'body_ar', '')
  ),
  case when r.data ->> 'status' in ('DRAFT','PUBLISHED','ARCHIVED')
    then r.data ->> 'status' else 'DRAFT' end,
  case r.data ->> 'access_mode'
    when 'PUBLIC' then 'FREE'
    when 'LOGIN' then 'LOGIN'
    when 'PAID' then 'PAID'
    when 'PREMIUM' then 'PAID'
    when 'SELECTED_CUSTOMERS' then 'SELECTED'
    else 'FREE'
  end,
  case when coalesce(r.data ->> 'price_amount', '') ~ '^\d+(\.\d+)?$'
    then round((r.data ->> 'price_amount')::numeric * 100)::bigint else 0 end,
  coalesce(nullif(r.data ->> 'price_currency', ''), 'AED'),
  case when coalesce(r.data ->> 'validity_days', '') ~ '^\d+$'
    then (r.data ->> 'validity_days')::integer else null end,
  lower(coalesce(r.data ->> 'lifetime_access', 'false')) = 'true',
  nullif(r.data ->> 'attachment_url', ''),
  nullif(r.data ->> 'featured_image_url', ''),
  jsonb_build_object(
    'category', coalesce(r.data ->> 'category', 'general'),
    'is_featured', lower(coalesce(r.data ->> 'is_featured', 'false')) = 'true',
    'seo_title', coalesce(r.data ->> 'seo_title', ''),
    'seo_description', coalesce(r.data ->> 'seo_description', ''),
    'version', coalesce(r.data ->> 'version', '1'),
    'published_at', r.data ->> 'published_at',
    'last_published_by', r.data ->> 'last_published_by',
    'legacy_record_id', r.id
  ),
  r.owner_id,
  r.created_at,
  r.updated_at
from public.platform_records r
where r.entity = 'ManagedPage'
  and nullif(r.data ->> 'slug', '') is not null
on conflict (slug) do nothing;

insert into public.legacy_imports (
  source_name, source_entity, source_record_id, destination_table,
  destination_id, checksum, status
)
select
  'platform_records', 'ManagedPage', p.id::text, 'resources', n.id,
  md5(p.data::text), 'IMPORTED'
from public.platform_records p
join public.resources n on n.slug = p.data ->> 'slug'
where p.entity = 'ManagedPage'
on conflict (source_name, source_entity, source_record_id) do nothing;
