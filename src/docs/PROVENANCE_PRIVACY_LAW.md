# PROVENANCE PRIVACY LAW — Sirr al-Huruf (Permanent Architecture Rule)

> Status: **PERMANENT.** This rule supersedes any earlier convention. It may only be relaxed by the Owner, in writing.

## 1. Principle
Every original-source / provenance artifact is **private**. It lives **only** inside the Owner-only library. Public scholarly entities contain **only** scholarly content + citation. No public user, guest, admin, moderator, or API consumer may ever see a source artifact.

## 2. Public entities MUST NEVER contain
- `source_pdf_url`
- `source_pdf_file`
- `source_screenshot_url`
- `google_drive_file_id`
- `onedrive_file_id` / `onedrive_file_path` / `onedrive_etag` / `onedrive_file_hash` / `onedrive_modified_date`
- Adobe identifiers (`adobe_file_id`, `adobe_file_path`, `adobe_modified_date`)
- Cloud paths / download URLs
- Rendered page-scan / preview image URLs (`images`, `original_scan_url`)
- Internal IDs exposed publicly (`source_book_id`, `source_entry_id`, `method_id`, `linked_method_id`, `verified_arabic_hash`, `part_id`)
- OCR metadata (`ocr_confidence`, `extraction_confidence`, `ocr_text`, `page_text`)
- Private library metadata (`processing_lock_until`, `verification_report`, `file_hash`, `file_size`)
- Any nested `url` / `screenshot_url` / `pdf_url` / `file_url` inside arrays (`invocations[].url`, `sources[].url`, `supporting_sources[].screenshot_url`, `primary_source.pdf_url`, `pdf_parts[].file_url`)

## 3. Public entities MAY contain (only)
- Scholarly content (Arabic text, translations, meanings, benefits, warnings, ritual text, headings)
- Citation: **Book title, Author, Volume, Edition, Publisher, Page number** — and only when the Owner explicitly marks that citation public.
- Display-only fields that carry no path to a source (order, language label, category, verification *status* without source refs).

## 4. Where the private source information lives
In the **`ScholarlyProvenance`** entity (Owner-only RLS + Owner-gated backends), keyed by
`source_entity + record_id + field_path`. This is the **sole** permanent home for moved provenance. The Owner can trace any public card back to its exact source through this store; no one else can.

The **Master PDF Library** (`MasterPdfBook`, `MasterPdfPage`) remains separately Owner-only and is the live research engine. `ScholarlyProvenance` is the archive of provenance removed from the public scholarly tables.

## 5. Writer rule (backend functions)
Any backend function that creates/updates a public scholarly entity MUST write provenance to `ScholarlyProvenance` (or to the Master PDF Library) — NEVER to a public entity field. New imports must not re-introduce a removed field onto a public record.

## 6. Reader rule (public pages/components)
Public pages read public entities directly (scholarly content + citation only). If a public page ever needs a source artifact (e.g. an Owner-only admin view), it MUST go through an Owner-gated backend that reads `ScholarlyProvenance` — never the public entity.

## 7. Migration record
- Phase 0 (this pass): created `ScholarlyProvenance`; backed up all existing provenance values from public entities into it (nothing cleared yet — safe backup).
- Phase 1+: clear the backed-up values from the public records + update writers to stop re-populating them + remove the fields from the public schemas. Functionally-coupled fields (read by active pipelines: `SirrManuscriptBook.pdf_parts[].file_url` by `sirrProcessNextChunk`; `HolyNameTranscriptionCache.page_text` by `importHolyNamesByChapter`; `ManuscriptBook.original_file_url`/`onedrive_*` by importers + `SirrBookCard` re-import; `AstroClockKnowledge.source_book_id`/`source_entry_id` by merge logic) are migrated first by updating the reading pipeline to pull from `ScholarlyProvenance`, THEN clearing.