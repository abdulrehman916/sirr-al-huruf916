# MANUSCRIPT INGESTION PIPELINE — COMPLETE ARCHITECTURE AUDIT
**Date:** 2026-07-09  
**Auditor:** Base44 AI (Base 1)  
**Method:** Full source code review + production database state verification  
**Verdict:** ⚠ **CONDITIONALLY PRODUCTION-READY** — Core pipeline is architecturally sound but has 7 critical issues, 12 warnings, and 3 scalability blockers that must be addressed before scaling beyond 100 books.

---

## EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| Books in production | 11 |
| Books fully extracted | 6 (55%) |
| Books validation passed | 6 (55%) |
| Books validation failed | 1 (9%) |
| Books stuck in progress | 4 (36%) |
| Entries sampled | 100 |
| Entries verified | 30 (30%) |
| Entries manual_review | 46 (46%) |
| Entries unverified | 24 (24%) |
| AstroClockKnowledge (real) | 7 |
| DuaKnowledge (real) | 5 |
| RitualKnowledge (real) | 9 |
| WafqKnowledge (real) | 3 |
| KnowledgeRouting records | 11 |
| VerifiedArabic records | 50 |
| ManuscriptHeading records | 0 |
| BulkImportJob records | 1 |
| Preparation records | 0 |

**Overall Confidence: 72%**

---

## 1. ONEDRIVE CONNECTION

### 1.1 Authentication
**Status: ✅ PASS** | Confidence: 95%

- OneDrive connector is authorized with scopes: `Files.Read.All`, `offline_access`, `User.Read`
- All three functions (`browseOneDrive`, `importFromOneDrive`, `bulkImportOneDriveFolder`) use `base44.asServiceRole.connectors.getConnection('one_drive')` to get the OAuth access token
- Token is used in `Authorization: Bearer` header for Microsoft Graph API calls
- No password storage — OAuth only
- Admin-only access enforced (`user.role !== 'admin'` → 403)

### 1.2 Folder Discovery
**Status: ✅ PASS** | Confidence: 90%

- `browseOneDrive` lists folders and files for a given `folder_id` (or root)
- Uses Graph API: `GET /me/drive/items/{id}/children`
- Correctly separates folders vs files
- Identifies PDFs by `mimeType === 'application/pdf'`
- Returns etag, modified_date, size, path for each file

### 1.3 Nested Folders (Recursive Scan)
**Status: ✅ PASS** | Confidence: 90%

- `bulkImportOneDriveFolder` has `scanFolderRecursively()` that recurses into all subfolders
- Follows `item.folder` property to detect folders vs files
- Builds full path: `${path}/${item.name}`
- Handles pagination via `@odata.nextLink`
- `$top=1000` per page for efficiency

### 1.4 Large Libraries
**Status: ⚠ WARNING** | Confidence: 75%

- Pagination is handled in `scanFolderRecursively` via `@odata.nextLink` ✅
- BUT: `pdf_list` is stored entirely in the `BulkImportJob` entity — for 5000+ PDFs this could exceed entity field size limits
- Each PDF is processed one-at-a-time (1 per function call) to stay under Deno 70s timeout ✅
- Resume support via `current_index` ✅
- ⚠ No parallel processing — 1000 books × ~30s each = ~8 hours minimum

### 1.5 Incremental Sync
**Status: ⚠ WARNING** | Confidence: 70%

- `importFromOneDrive` checks `onedrive_file_id` for existing books
- If `onedrive_etag` matches → returns `duplicate` (skip) ✅
- If `onedrive_etag` differs → returns `changed` (await confirmation) ✅
- SHA-256 content hash stored for content-level dedup ✅
- ⚠ **No automated incremental sync** — admin must manually trigger re-import
- ⚠ **No webhook configured** — OneDrive supports `updated` webhook events but no automation is set up
- ⚠ No scheduled sync — relies entirely on manual admin action

### 1.6 Duplicate Detection
**Status: ✅ PASS** | Confidence: 90%

- Two-level dedup: (1) `onedrive_file_id` match, (2) `onedrive_etag` match
- SHA-256 content hash provides third level
- `force_reimport` flag allows override (creates new version, preserves old)
- Old versions are never overwritten — new `book_id` is generated

### 1.7 Deleted/Moved Files
**Status: ❌ FAIL** | Confidence: 85%

- **No deleted file detection** — if a file is deleted from OneDrive, the database book record remains indefinitely
- **No moved file detection** — `onedrive_file_path` is stored at import time but never re-verified
- **No orphan cleanup** — deleted OneDrive files leave orphaned book records, entries, and knowledge records
- No function exists to reconcile database state against OneDrive current state

### 1.8 Renamed Files
**Status: ⚠ WARNING** | Confidence: 80%

- File rename in OneDrive keeps the same `file_id` but changes `name`
- The etag may or may not change on rename
- If etag doesn't change → system treats it as `duplicate` (correct — same content)
- If etag changes → system treats it as `changed` (correct — but message says "file has changed" not "renamed")
- `original_file_name` is stored at import time and never updated
- ⚠ No rename-specific detection or notification

---

## 2. FILE IMPORT

### 2.1 Supported File Types

| Format | Status | Notes |
|--------|--------|-------|
| PDF | ✅ PASS | Full pipeline: download → hash → upload → extract |
| Images (JPG/PNG) | ❌ FAIL | Not supported — `importFromOneDrive` only processes `application/pdf` mimeType |
| DOCX | ❌ FAIL | Not supported |
| TXT | ❌ FAIL | Not supported |
| Markdown | ❌ FAIL | Not supported |
| Other formats | ❌ FAIL | Not supported |

**Status: ❌ FAIL** | Confidence: 95%

**Bug #1:** `browseOneDrive` identifies PDFs only (`is_pdf: !!(item.file && item.file.mimeType === 'application/pdf')`). Non-PDF files are listed but cannot be imported.

**Bug #2:** `bulkImportOneDriveFolder` `scanFolderRecursively` only collects PDFs: `else if (item.file && item.file.mimeType === 'application/pdf')`. All other file types are silently ignored.

**Bug #3:** `validateManuscriptImport` uses `InvokeLLM` with `file_urls` — this could theoretically process images, but the pipeline is hardcoded for PDF workflow (pdf-lib for chunking, image extraction, etc.).

**Recommended Fix:** Add format-specific import handlers. For images, use `InvokeLLM` with vision directly. For DOCX/TXT, use `ExtractDataFromUploadedFile`.

---

## 3. OCR

### 3.1 OCR Architecture
**Status: ⚠ WARNING** | Confidence: 65%

The pipeline has **no dedicated OCR engine**. It relies entirely on Google Gemini's vision capability via `InvokeLLM` with `file_urls` and `model: 'gemini_3_flash'`.

This means:
- Arabic "OCR" = Gemini reading the PDF page images
- Turkish "OCR" = Gemini reading the PDF page images
- Mixed pages = Gemini reading the PDF page images

**Strengths:**
- Gemini has strong multi-language vision capabilities
- No separate OCR service to configure or pay for
- Can handle mixed Arabic + Turkish on the same page

**Weaknesses:**
- No OCR accuracy metrics — we cannot measure character-level accuracy
- No fallback if Gemini vision fails on a specific page
- No confidence scoring at the OCR level (only extraction_confidence at the entry level)
- Quality gate (65 threshold) is the only protection against poor OCR

### 3.2 Arabic OCR
**Status: ⚠ WARNING** | Confidence: 70%

- Gemini 3 Flash can read Arabic script including harakat
- Quality gate checks `arabic_legibility` (0-100) before extraction
- `arabic_text_preserved` flag set per entry (true/false)
- Entries with `arabic_text_preserved=false` get `extraction_confidence=50` → `verification_status='manual_review'`
- ⚠ No harakat-specific accuracy measurement
- ⚠ No comparison against ground-truth Arabic text

### 3.3 Turkish OCR
**Status: ⚠ WARNING** | Confidence: 65%

- Turkish is an "internal manuscript language" per project rules
- `deepReprocessMissingFields` prompt mentions Turkish: "If the manuscript is in Turkish and has no Arabic/Malayalam text on a page, mark arabic_text and malayalam_meaning as NOT_IN_MANUSCRIPT"
- Turkish sources are translated to Malayalam via `translateSirrTurkishFields` (separate function)
- ⚠ No Turkish-specific OCR validation in the main pipeline

### 3.4 Mixed Arabic + Turkish Pages
**Status: ⚠ WARNING** | Confidence: 60%

- Gemini handles mixed-language pages implicitly
- No explicit mixed-page detection logic
- No language tagging per entry (language field is at the book level only)
- ⚠ Entries from mixed pages may have Arabic and Turkish text mixed in the same field

### 3.5 Tables
**Status: ⚠ WARNING** | Confidence: 55%

- No dedicated table detection or extraction logic
- `entry_type` includes `table` as an option
- LLM prompt says "Identify any images, wafq (magic squares), taweez (amulets), diagrams, tables, or seals on each page"
- ⚠ Tables are extracted as text descriptions, not structured data
- ⚠ No table-to-grid conversion — magic square tables lose their spatial structure

### 3.6 Multi-column Pages
**Status: ⚠ WARNING** | Confidence: 60%

- No multi-column detection logic
- Gemini handles multi-column pages implicitly (reads left-to-right, top-to-bottom)
- ⚠ Reading order may be incorrect for right-to-left Arabic multi-column layouts
- ⚠ No column-aware text extraction

### 3.7 Rotated Pages
**Status: ❌ FAIL** | Confidence: 90%

- **No rotated page detection or correction**
- `pdf-lib` is used for chunking but no page rotation check is performed
- Gemini may or may not handle rotated pages correctly
- ⚠ Rotated pages will likely produce garbage text or be marked as `arabic_text_preserved=false`

### 3.8 Low-quality Scans
**Status: ✅ PASS** | Confidence: 80%

- Quality gate in `validateManuscriptImport`:
  - Rejects if `overall_confidence < 65`
  - Rejects if > 20% of pages have problems
  - Rejects if Arabic legibility too poor for harakat preservation
- Quality details: page_clarity, arabic_legibility, text_completeness, ocr_feasibility, consistency, content_integrity
- Rejected books get `extraction_status='failed'`, `validation_status='failed'`
- Production: 1 book rejected ("Awrod ShadatushShufiyyah Juz 1 - OK" — extraction failed)

### 3.9 OCR Accuracy Report
**Status: ⚠ WARNING** | Confidence: 50%

- **No OCR accuracy measurement system exists**
- No ground-truth comparison
- No character error rate (CER) calculation
- No word error rate (WER) calculation
- The only proxy is `arabic_preservation_rate` (percentage of entries with `arabic_text_preserved=true`)
- Production arabic_preservation_rate is not explicitly tracked in the summary but is part of the 14-point check

---

## 4. MANUSCRIPT EXTRACTION

### 4.1 Metadata Extraction
**Status: ✅ PASS** | Confidence: 85%

- Book metadata captured: `book_title`, `book_title_ar`, `author`, `language`, `tradition`, `original_file_name`, `original_file_url`
- OneDrive metadata: `onedrive_file_id`, `onedrive_file_path`, `onedrive_etag`, `onedrive_file_hash`, `onedrive_modified_date`
- `upload_date`, `version`, `edition`, `publication_year` preserved
- `categories_covered` derived from extracted Sirr sections

### 4.2 Chapter/Heading Detection
**Status: ⚠ WARNING** | Confidence: 65%

- LLM prompt detects headings by: font size, bold/centered text, decorative separators, numbered headings, Arabic conventions (باب/فصل/قسم), page breaks, indentation, whitespace
- Dynamic heading tree with any number of levels
- `heading_source: "pdf_detected"` vs `"generated_fallback"`
- **CRITICAL BUG #4:** Heading IDs are prefixed with chunk number (`C1_H1`, `C2_H1`) to ensure uniqueness across chunks, but parent-child relationships across chunks are **broken** — a sub-heading in chunk 2 referencing a parent in chunk 1 will have `parent_heading_id: "C2_C1_H1-1"` which doesn't exist in the map.

**CRITICAL BUG #5:** Production database shows **0 ManuscriptHeading records** despite 6 completed books. This means either:
- (a) Heading creation is silently failing, OR
- (b) All books were imported before the heading system was added, OR
- (c) The `bulkCreate` call is failing without being caught

The code at line 621:
```typescript
await base44.asServiceRole.entities.ManuscriptHeading.bulkCreate(headingRecords);
```
has no try/catch — if it fails, the entire function fails. But the function returns success in production, so either headings are empty (LLM returns no headings) or the bulkCreate succeeds but records aren't persisted.

### 4.3 Entry Detection
**Status: ✅ PASS** | Confidence: 85%

- Page-by-page chunked extraction (10 pages per chunk)
- Each chunk is a separate LLM call for accuracy
- Entries include: `entry_type`, `purpose`, `arabic_text`, `malayalam_meaning`, `english_meaning`, `conditions`, `materials`, `preparation`, `procedure`, `timing`, `planet`, `day`, `incense`, `repetition`, `warnings`, `benefits`, `notes`
- `entry_order` is globally re-sequenced across all chunks (line 571-573)
- `extraction_confidence` (0-100) per entry
- `arabic_text_preserved` boolean per entry

### 4.4 Page References
**Status: ✅ PASS** | Confidence: 90%

- `page_number` stored as string (preserves "45a", "46-47" etc.)
- `book_id` + `page_number` + `entry_order` form a complete reference
- Images linked to entries by `page_number` match
- Index `idx_book_entry_order` enables page-order queries

### 4.5 Source References
**Status: ✅ PASS** | Confidence: 85%

- `book_title` and `book_title_ar` denormalized on every entry
- `book_id` is the FK to ManuscriptBook
- In `detectManuscriptDuplicates`, `buildSourceObject` captures: `book_title`, `author`, `page_number`, `pdf_url`, `edition`, `year`, `entry_id`
- `primary_source` and `supporting_sources` on primary method entries

### 4.6 Duplicate Prevention
**Status: ✅ PASS** | Confidence: 80%

- **3-stage duplicate detection** in `detectManuscriptDuplicates`:
  - Stage 1: Exact Arabic match (normalized comparison, alef variant normalization)
  - Stage 2: Same method (all structure fields match — no field where BOTH have values and they differ)
  - Stage 3: Equivalent method (LLM semantic comparison with practical-differences safety net)
- Linked duplicates preserve their `book_id`, `book_title`, `page_number` — never merged
- `is_primary_method_entry` distinguishes primary from duplicate
- `method_id` groups all entries describing the same method

**BUG #6:** `detectManuscriptDuplicates` Stage 2 and Stage 3 query `sirr_section` + `is_primary_method_entry: true` with limit 50. If there are more than 50 primary entries in the same section, matches beyond #50 are never found.

---

## 5. KNOWLEDGE CLASSIFICATION

### 5.1 Classification System
**Status: ⚠ WARNING** | Confidence: 70%

Classification is done by `routeManuscriptKnowledge` using a **static entry_type → route map**:

```typescript
const ENTRY_TYPE_TO_ROUTE = {
  timing: 'astro_timing',
  condition: 'astro_timing',
  dua: 'dua',
  quran_verse: 'dua',
  divine_name: 'dua',
  ritual: 'ritual',
  exorcism: 'ritual',
  protection: 'ritual',
  instruction: 'ritual',
  wafq: 'wafq',
  taweez: 'wafq',
  diagram: 'wafq',
  table: 'wafq',
  material: 'other',
  herb: 'other',
  incense: 'other',
  image: 'other',
  warning: 'other',
  note: 'other',
  reference: 'other',
};
```

**Issues:**

**BUG #7:** `condition` is routed to `astro_timing` — but many conditions are ritual conditions (e.g., "must be in a state of wudu"), not timing conditions. This causes ritual conditions to be sent to the Astro Clock enrichment, which will either:
- (a) Be rejected by the LLM (no timing knowledge found → marker), OR
- (b) Be incorrectly classified as timing knowledge

**BUG #8:** `warning` is routed to `other` (not routed) — but warnings can contain timing warnings (e.g., "do not perform during Mars hour") that should go to Astro Clock.

**BUG #9:** `image` is routed to `other` — but images of wafq/taweez should go to Wafq module. The entry_type `image` is too generic.

**BUG #10:** No content-based classification — routing is purely type-based. An entry typed as `instruction` that contains dua text will be routed to Ritual instead of Dua.

### 5.2 Module Routing Accuracy

| Module | Route | Correct? | Notes |
|--------|-------|----------|-------|
| Astro Clock | astro_timing | ⚠ Partial | `condition` over-routes; no Manzil/Kawkab extraction |
| Dua | dua | ✅ Good | `dua`, `quran_verse`, `divine_name` correctly routed |
| Ritual | ritual | ⚠ Partial | `instruction` may contain non-ritual content |
| Wafq | wafq | ✅ Good | `wafq`, `taweez`, `diagram`, `table` correctly routed |
| Other | none | ⚠ Partial | `material`, `herb`, `incense` not routed to any knowledge store |

**Production verification:** 11 routing records exist for ~100 entries — only verified entries are routed (30 verified + some manual_review). This is correct per the architecture.

### 5.3 Routing Isolation
**Status: ✅ PASS** | Confidence: 85%

- Each enrichment function extracts ONLY its module-specific knowledge
- LLM prompts explicitly say "Extract ONLY [module] knowledge. Do NOT extract timing rules, dua texts, or wafq structures."
- `KnowledgeRouting` entity tracks every routed entry with `primary_purpose` and `routed_to`
- Prevents reprocessing via routing record check
- `is_marker` flag for entries that were routed but had no module-specific knowledge

---

## 6. ASTRO CLOCK ENRICHMENT

### 6.1 Extraction Scope
**Status: ⚠ WARNING** | Confidence: 70%

The `enrichAstroClockFromManuscript` LLM prompt extracts:
- ✅ Weekday references (Sunday-Saturday)
- ✅ Day/night period references
- ✅ Sahath (planetary hour) references (Saat 1-12)
- ✅ Planetary hour references (hour of Sun, Mars, etc.)
- ✅ Sunrise/sunset references
- ✅ Kawkab (ruling planet) references
- ✅ Suitable/less suitable time recommendations
- ✅ Timing conditions and warnings
- ✅ Special timing rules

**MISSING:**
- ❌ **Manzil (lunar mansion) extraction** — no mention of lunar mansions in the prompt
- ❌ **Kawkab-Saat integration** — Kawkab is mentioned but not linked to specific Saat numbers
- ❌ **Tahwilat (planetary transitions)** — not extracted
- ❌ **Azayim (planetary intentions per day)** — not extracted

### 6.2 Knowledge Categories
**Status: ✅ PASS** | Confidence: 85%

Categories correctly defined: `recommendation`, `rule`, `warning`, `condition`, `timing_rule`, `suitable_time`, `unsuitable_time`, `special_timing`

### 6.3 Canonical Key Format
**Status: ✅ PASS** | Confidence: 90%

`canonical_key: 'source_type|weekday|period|sahath_number|planet'`

Example: `sahath|4|null|null|mars` → Sahath 4 ruled by Mars

### 6.4 Conflict Resolution
**Status: ✅ PASS** | Confidence: 85%

4-tier classification via LLM:
- Complementary → merge into resolved text
- Equivalent → normalize-merge
- Context-specific → store under condition (e.g., "weekday:Thursday")
- Conflicting → preserve both as "Multiple Verified Opinions"

### 6.5 Timing Knowledge Isolation
**Status: ✅ PASS** | Confidence: 85%

- Only timing-related knowledge is extracted
- LLM prompt: "extract ONLY the timing-related intelligence, not the full ritual/dua"
- Non-timing entries get marker records
- Production: 7 real + 4 markers = 11 total (from 11 routed entries)

### 6.6 Production Yield
**Status: ⚠ WARNING** | Confidence: 65%

Only 7 real AstroClockKnowledge records from 11 books. This is low because:
- Most manuscript entries are duas/rituals, not timing rules
- Timing knowledge is concentrated in specific books (Havâss'ın Derinlikleri)
- The Kashf al-Haqa'iq manuscript has timing data in static JS files, not in the database

---

## 7. DUA ENRICHMENT

### 7.1 Extraction Scope
**Status: ✅ PASS** | Confidence: 85%

Extracts: dua texts, dhikr formulas (with repetition counts), wird sequences, Quran verse recitations, divine name dhikr, invocation texts

Categories: `dua_text`, `dhikr_formula`, `wird_sequence`, `quran_recitation`, `divine_name_dhikr`, `invocation_text`, `protection_dua`, `healing_dua`, `love_dua`, `wealth_dua`

### 7.2 Arabic Text Preservation
**Status: ✅ PASS** | Confidence: 90%

- `text_ar` field stores original Arabic verbatim
- Prompt: "Preserve Arabic text verbatim — never modify or invent"
- Arabic text is appended with `\n---\n` separator when merging

### 7.3 Repetition Counts
**Status: ✅ PASS** | Confidence: 80%

- `repetition_count` extracted as string (preserves "100x", "after every prayer", etc.)
- When merging, repetition counts are appended with `; ` separator

### 7.4 Intention/Purpose
**Status: ⚠ WARNING** | Confidence: 70%

- Purpose is passed to the LLM prompt but NOT stored as a dedicated field in DuaKnowledge
- The `knowledge_category` field captures the type (protection_dua, healing_dua, love_dua, wealth_dua) but not the specific intention
- ⚠ No link to the PurposeDictionary system

### 7.5 References
**Status: ✅ PASS** | Confidence: 85%

- `source_book_id`, `source_book_title`, `source_page_number`, `source_entry_id` on every record
- `supporting_sources` array for multi-source records
- `source_count` tracks total sources

### 7.6 Non-Dua Rejection
**Status: ✅ PASS** | Confidence: 80%

- LLM prompt: "Extract ONLY dua knowledge. Do NOT extract timing rules, ritual procedures, or wafq structures."
- Entries with no dua knowledge get marker records (`is_marker: true`)
- Production: 5 real + 4 markers = 9 total — markers correctly prevent reprocessing

### 7.7 Production Yield
**Status: ⚠ WARNING** | Confidence: 60%

Only 5 real DuaKnowledge records from 11 books. This is unexpectedly low given that many manuscript entries are duas. Possible causes:
- Many dua entries are `manual_review` (not verified) → not routed
- LLM may be conservative in extracting dua knowledge
- Some duas are in the static JS data files (KASHF_FULL_MANTRAS) not the database

---

## 8. RITUAL ENRICHMENT

### 8.1 Extraction Scope
**Status: ✅ PASS** | Confidence: 85%

Extracts: amal (spiritual works), ritual procedures (step-by-step), exorcism methods, protection methods, sequences of actions, preparation and closing procedures

### 8.2 Materials
**Status: ✅ PASS** | Confidence: 80%

- `materials_summary` field captures lightweight summary (e.g., "frankincense, rose water")
- When merging, materials are appended with `; ` separator

### 8.3 Preparation
**Status: ⚠ WARNING** | Confidence: 70%

- Preparation steps are part of the `text_en` description, not a dedicated field
- ⚠ No structured preparation step extraction — steps are embedded in the knowledge text

### 8.4 Timing References
**Status: ✅ PASS** | Confidence: 85%

- `timing_reference` field captures lightweight timing notes (e.g., "perform after Fajr")
- Cross-module reference to Astro Clock (not a full timing rule)

### 8.5 Procedures
**Status: ✅ PASS** | Confidence: 80%

- `text_en` contains the procedure description
- When merging, text is resolved via LLM (complementary/equivalent merge)

### 8.6 Production Yield
**Status: ✅ PASS** | Confidence: 75%

9 real RitualKnowledge records, 0 markers — good yield. This suggests most verified entries contained ritual knowledge.

---

## 9. WAFQ ENRICHMENT

### 9.1 Grids
**Status: ⚠ WARNING** | Confidence: 70%

- `grid_size` field captures dimensions (e.g., "3x3", "4x4")
- ⚠ Grid size is extracted as a string, not validated
- ⚠ No actual grid data extraction — only the description of the grid

### 9.2 Dimensions
**Status: ✅ PASS** | Confidence: 80%

- `grid_size` is part of the canonical key: `source_type|category|grid_size`
- This means a 3x3 wafq and a 4x4 wafq with the same type+category are separate canonical records

### 9.3 Divine Names
**Status: ✅ PASS** | Confidence: 80%

- `associated_divine_name` field captures the divine name linked to the wafq
- When merging, divine names are appended with `; ` separator

### 9.4 Symbols
**Status: ❌ FAIL** | Confidence: 85%

- **No symbol extraction** — the LLM prompt does not ask for symbols, seals, or symbolic content
- No field in WafqKnowledge entity for symbols
- Images of wafq/taweez are stored on ManuscriptEntry but not linked to WafqKnowledge

### 9.5 Production Yield
**Status: ⚠ WARNING** | Confidence: 65%

3 real + 7 markers = 10 total. High marker count (70%) suggests most entries routed to Wafq don't actually contain wafq knowledge — likely misclassified `table` or `diagram` entries.

---

## 10. CANONICAL MERGE

### 10.1 canonical_key Generation
**Status: ✅ PASS** | Confidence: 85%

Each module generates canonical keys consistently:
- AstroClockKnowledge: `source_type|weekday|period|sahath_number|planet`
- DuaKnowledge: `source_type|category`
- RitualKnowledge: `source_type|category`
- WafqKnowledge: `source_type|category|grid_size`

### 10.2 content_hash
**Status: ✅ PASS** | Confidence: 90%

- SHA-256 of normalized English text
- Normalization: lowercase, collapse whitespace, strip punctuation
- Exact duplicate detection: same `content_hash` → merge sources, never create duplicate
- Marker records use unique hashes: `no-timing-{entry_id}`, `no-dua-{entry_id}`, etc.

### 10.3 Duplicate Prevention
**Status: ✅ PASS** | Confidence: 85%

Three-level duplicate prevention:
1. `content_hash` match → exact same knowledge text → merge sources only
2. `canonical_key` match → same topic, different text → conflict resolution via LLM
3. `source_entry_id` check → prevent same entry from being processed twice

### 10.4 Knowledge Evolution
**Status: ✅ PASS** | Confidence: 80%

- New knowledge is classified (complementary/equivalent/context_specific/conflicting) before merging
- Complementary/equivalent: merged into `knowledge_text_en` via LLM
- Context-specific: stored under `context_specific` array with condition
- Conflicting: stored under `conflicting_opinions` array with field
- `conflict_flags` array tracks which fields have conflicts
- Source count incremented for each new source

### 10.5 Source Merging
**Status: ✅ PASS** | Confidence: 85%

- `supporting_sources` array: `{ book_title, page_number, entry_id }`
- Source deduplication: checks `book_title + page_number` before adding
- `source_count` tracks total sources
- Arabic/Malayalam text appended with `\n---\n` separator (never overwritten)

### 10.6 canonicalMergeEntry Function
**Status: ⚠ WARNING** | Confidence: 70%

**BUG #11:** `canonicalMergeEntry` operates on `ManuscriptEntry` entity (not the knowledge stores). It merges fields like `conditions`, `materials`, `procedure` into the primary ManuscriptEntry. This is a separate merge system from the knowledge store canonical merge. The two systems are:
1. ManuscriptEntry-level merge (canonicalMergeEntry) — merges entry fields into the primary method entry
2. Knowledge-store-level merge (enrichXxxFromManuscript) — merges knowledge into AstroClock/Dua/Ritual/WafqKnowledge

These are architecturally separate and don't interfere, but the naming is confusing.

---

## 11. CONFLICT RESOLUTION

### 11.1 Four-Tier Classification
**Status: ✅ PASS** | Confidence: 85%

All four enrichment functions implement the same 4-tier system:

| Tier | Behavior | Storage |
|------|----------|---------|
| Complementary | Merge into resolved text | `knowledge_text_en` (LLM-merged) |
| Equivalent | Normalize-merge | `knowledge_text_en` (LLM-merged) |
| Context-specific | Store under condition | `context_specific[]` array |
| Conflicting | Preserve both | `conflicting_opinions[]` array |

### 11.2 Classification Quality
**Status: ⚠ WARNING** | Confidence: 65%

- Classification is done by `InvokeLLM` (default model, no `model` parameter specified)
- ⚠ Default model may be less accurate for nuanced conflict detection
- ⚠ No human review mechanism — all classifications are automatic
- ⚠ No confidence score on the classification itself
- ⚠ The LLM sees existing context_specific and conflicting_opinions arrays as JSON — large arrays may exceed context window

### 11.3 Conflict Preservation
**Status: ✅ PASS** | Confidence: 85%

- Conflicting opinions are never overwritten
- Each opinion has its own `sources` array and `source_count`
- `conflict_flags` array lists fields with conflicts for quick querying
- Future manuscripts can strengthen one opinion by adding sources to it

### 11.4 Context-Specific Isolation
**Status: ✅ PASS** | Confidence: 80%

- Context-specific knowledge stored under its matching condition
- Conditions are free-text strings (e.g., "weekday:Thursday", "sahath:8", "planet:Mars")
- ⚠ No validation on condition format — could lead to inconsistent condition naming

---

## 12. KNOWLEDGE EVOLUTION

### 12.1 Non-Overwriting Rule
**Status: ✅ PASS** | Confidence: 90%

- `knowledge_text_en` is only overwritten when classification is complementary or equivalent (LLM-merged)
- `knowledge_text_ar` is NEVER overwritten — only appended with `\n---\n`
- `knowledge_text_ml` is NEVER overwritten — only appended with `\n---\n`
- Context-specific and conflicting opinions are preserved separately
- `is_verified` flag is OR'd: `ex.is_verified || isVer` — once true, stays true

### 12.2 Source Attribution
**Status: ✅ PASS** | Confidence: 85%

- Every knowledge record has `source_book_id`, `source_book_title`, `source_page_number`, `source_entry_id`
- `supporting_sources` array tracks additional sources
- `source_count` is incremented for each new source
- Source deduplication prevents same source being added twice

### 12.3 Evolution Verification
**Status: ✅ PASS** | Confidence: 75%

- Importing a newer manuscript enriches existing knowledge:
  - If content_hash matches → source added, no text change
  - If canonical_key matches → conflict resolution → merge or preserve
  - If no match → new record created
- Older verified information is preserved in all cases
- Marker records prevent reprocessing of already-analyzed entries

---

## 13. ERROR HANDLING

### 13.1 Crashes
**Status: ✅ PASS** | Confidence: 85%

- All functions have `try/catch` wrapping the entire handler body
- Errors return `Response.json({ error: error.message }, { status: 500 })`
- `bulkImportOneDriveFolder` has a 60s timeout wrapper to prevent gateway kills

### 13.2 Timeouts
**Status: ⚠ WARNING** | Confidence: 70%

- `bulkImportOneDriveFolder`: 60s timeout per PDF ✅
- `validateManuscriptImport`: No explicit timeout — relies on Deno 70s limit
- `verifyBookEntries`: Parallel `Promise.all` of 5-8 `verifyArabicText` calls — each ~70s = total ~70s (parallel) ✅
- `enrichXxxFromManuscript`: LLM call per batch of 5-8 entries — no explicit timeout
- `detectManuscriptDuplicates`: Stage 3 LLM call per entry — no explicit timeout
- ⚠ **BUG #12:** `routeManuscriptKnowledge` calls enrichment functions via `base44.functions.invoke()` in a sequential `for...of` loop — if 4 route groups exist, that's 4 sequential function invocations. Each can take ~30s. Total: ~120s → exceeds Deno timeout.

### 13.3 Missing Data
**Status: ⚠ WARNING** | Confidence: 70%

- If LLM returns empty `entries` array → `validateManuscriptImport` creates book with 0 entries, returns `phase_1_complete`
- If LLM returns empty `timing_pieces` → all entries get marker records ✅
- If `pdfBytes` download fails → falls back to whole-PDF LLM extraction ✅
- ⚠ If `pdf-lib` import fails → chunked extraction falls back to whole-PDF ✅
- ⚠ If `InvokeLLM` itself fails (network error, rate limit) → uncaught, function returns 500

### 13.4 Malformed OCR
**Status: ⚠ WARNING** | Confidence: 60%

- No OCR validation — LLM output is trusted as-is
- If LLM returns malformed JSON → `response_json_schema` enforcement should handle it
- If LLM returns Arabic text with incorrect harakat → `arabic_text_preserved=true` but text is wrong
- Quality gate is the only protection — but it runs before extraction, not after

### 13.5 Invalid Routing
**Status: ⚠ WARNING** | Confidence: 75%

- If `entry_type` is not in `ENTRY_TYPE_TO_ROUTE` map → defaults to `'other'` (not routed)
- If enrichment function fails → `routingResults[route] = { status: 'error', error: err.message }` but routing record is still created
- ⚠ **BUG #13:** If enrichment function fails but routing record is created, the entry is marked as routed. On next call, it's skipped. The entry is permanently orphaned — never enriched, never retried.

### 13.6 Broken Merge
**Status: ⚠ WARNING** | Confidence: 70%

- `canonicalMergeEntry` has no retry logic
- If merge fails, the entry continues with `internal_reuse: true` but `canonical_merged: false`
- The verification result still uses the reused data — so the entry is "verified" but the canonical record wasn't updated
- ⚠ Non-critical but leads to incomplete source attribution

### 13.7 Orphan Records
**Status: ⚠ WARNING** | Confidence: 65%

- **Orphaned knowledge records:** If `routeManuscriptKnowledge` creates routing records but enrichment fails, knowledge records may not exist for the routing record
- **Orphaned marker records:** If an entry is deleted, its marker records remain in the knowledge store
- **Orphaned book records:** If OneDrive file is deleted, book + entries + knowledge remain
- ⚠ No cleanup function exists for any orphan type

### 13.8 Duplicate Records
**Status: ⚠ WARNING** | Confidence: 70%

- `content_hash` prevents exact duplicate knowledge text ✅
- `canonical_key` prevents same-topic duplicate records ✅
- BUT: if two different LLM calls produce slightly different English text for the same knowledge, both records are created (different `content_hash`, same `canonical_key` → conflict resolution handles it)
- ⚠ Marker records use `no-{type}-{entry_id}` hash — if entry_id changes (re-import), old markers remain

### 13.9 Performance Bottlenecks
**Status: ❌ FAIL** | Confidence: 80%

**BUG #14:** `searchInternalKnowledgeBase` Tier 3 loads **300 verified entries** into memory and does an O(n) normalized Arabic comparison for EACH new entry. For 1000 books × ~50 entries each = 50,000 verified entries, this is:
- 50,000 entries loaded per search call
- 50,000 string comparisons per search call
- Called for EVERY entry being verified → 50,000 × 50,000 = 2.5 billion comparisons

**BUG #15:** `detectManuscriptDuplicates` Stage 2 and Stage 3 query `sirr_section + is_primary_method_entry: true` with limit 50. For large libraries, most primaries are never checked.

**BUG #16:** `routeManuscriptKnowledge` loads ALL entries for a book (`base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id })`) — no pagination. For a book with 500+ entries, this loads all into memory.

### 13.10 Memory Leaks
**Status: ⚠ WARNING** | Confidence: 60%

- `validateManuscriptImport` loads entire PDF into memory (`pdfBytes = new Uint8Array(await pdfResponse.arrayBuffer())`)
- For a 100MB PDF, this is 100MB in memory
- Chunked extraction creates new PDF documents per chunk — memory is freed between chunks (Deno GC)
- ⚠ No explicit memory management — relies on Deno GC
- ⚠ Large PDFs (500MB+) could cause OOM

---

## 14. SCALABILITY

### 14.1 100 Books
**Status: ✅ PASS** | Confidence: 80%

- ~5000 entries total (50 per book average)
- `searchInternalKnowledgeBase` Tier 3: 300 entries in memory — feasible
- `detectManuscriptDuplicates`: 50 primaries per section — feasible
- Knowledge stores: ~500 records per module — indexed queries are fast
- Batch processing: 5-8 entries per batch → ~1000 batches total — manageable

### 14.2 500 Books
**Status: ⚠ WARNING** | Confidence: 65%

- ~25,000 entries total
- `searchInternalKnowledgeBase` Tier 3: still 300 entries (capped) — feasible
- BUT: Tier 4 loads 50 metadata matches per search — 25,000 × 50 = 1.25M comparisons
- `detectManuscriptDuplicates`: 50 primaries per section — will miss matches beyond #50
- Knowledge stores: ~2500 records per module — still indexed, still fast
- Marker records: ~10,000+ — `is_marker` index helps but queries still scan
- ⚠ **BulkImportJob.pdf_list** could exceed entity size for folders with 500+ PDFs

### 14.3 1000 Books
**Status: ⚠ WARNING** | Confidence: 55%

- ~50,000 entries total
- `searchInternalKnowledgeBase` Tier 3: 300 entries loaded per search call → 50,000 searches × 300 = 15M comparisons
- Knowledge stores: ~5000 records per module — queries still fast with indexes
- ⚠ **Marker record accumulation:** ~20,000+ markers across all modules — no cleanup
- ⚠ **Routing records:** ~30,000+ — `KnowledgeRouting.filter({ book_id })` per book is fine, but `filter({ entry_id })` without index on entry_id... wait, `idx_entry_id` exists. OK.
- ⚠ **supporting_sources array growth:** records with 10+ sources will have large arrays — entity field size limits

### 14.4 5000 Books
**Status: ❌ FAIL** | Confidence: 75%

- ~250,000 entries total
- **`searchInternalKnowledgeBase` Tier 3 is the critical bottleneck:** 300 entries × 250,000 searches = 75M comparisons. At ~1ms per comparison = 75,000 seconds = ~21 hours of pure comparison time.
- **`detectManuscriptDuplicates`** is equally broken: 50 primaries × 250,000 entries = 12.5M comparisons, AND most matches are missed due to the 50-item limit.
- **Knowledge stores:** ~25,000 records per module — `content_hash` index queries are fine, but `canonical_key` queries with `is_marker: false` filter may slow down.
- **Marker records:** ~100,000+ — significant storage waste, no cleanup.
- **`supporting_sources` arrays:** some records may have 50+ sources — entity field size could exceed limits.
- **No caching layer:** every search hits the database.
- **No database-level joins:** all filtering is in application code.
- **`ManuscriptEntry.filter({ book_id })`** without pagination loads all entries for a book into memory — for a 500-entry book, this is manageable, but the function is called in multiple places (routing, enrichment, verification, duplicate detection).

**Recommended Fixes for 5000+ Books:**
1. Replace in-memory Arabic comparison with database-side regex or trigram index
2. Increase `detectManuscriptDuplicates` limit from 50 to 500, or use database-side filtering
3. Add marker record cleanup function
4. Add pagination to all `filter({ book_id })` calls
5. Add Redis or in-memory cache for frequently accessed records
6. Consider splitting knowledge stores by book or section for smaller indexes

---

## 15. SECURITY

### 15.1 OneDrive Permissions
**Status: ✅ PASS** | Confidence: 90%

- Scopes: `Files.Read.All`, `offline_access`, `User.Read` — read-only, no write access
- OAuth token used only in backend functions (never exposed to frontend)
- `base44.asServiceRole.connectors.getConnection('one_drive')` — service role only
- Admin-only access on all OneDrive functions

### 15.2 Duplicate Processing Protection
**Status: ✅ PASS** | Confidence: 85%

- OneDrive file_id + etag dedup in `importFromOneDrive`
- SHA-256 content hash dedup
- `content_hash` dedup in all knowledge stores
- `KnowledgeRouting` prevents reprocessing of already-routed entries
- Marker records prevent reprocessing of already-analyzed entries

### 15.3 Unauthorized Imports
**Status: ✅ PASS** | Confidence: 90%

- All pipeline functions check `user.role === 'admin'`
- Non-admins get 403 Forbidden
- OneDrive connector is shared (builder's account) — app users cannot trigger imports
- No public endpoints — all require authentication

### 15.4 Corrupted Files
**Status: ⚠ WARNING** | Confidence: 70%

- `validateManuscriptImport` handles PDF load failure: `pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true })` — ignores encryption
- If PDF is corrupted → `pdf-lib` load fails → falls back to whole-PDF LLM extraction
- If LLM extraction fails → returns 500 error
- ⚠ No file type validation — a non-PDF file with .pdf extension could cause issues
- ⚠ No file size limit — a 1GB "PDF" could exhaust memory
- ⚠ No virus/malware scanning

### 15.5 RLS (Row-Level Security)
**Status: ✅ PASS** | Confidence: 85%

All entities have proper RLS:
- `create`: admin only
- `read`: public (for knowledge stores) or admin only (for routing/jobs)
- `update`: admin only
- `delete`: admin only

---

## 16. BUGS SUMMARY

### Critical Bugs (Must Fix Before Production Scale)

| # | Bug | Location | Impact |
|---|-----|----------|--------|
| 4 | Heading IDs prefixed with chunk number break parent-child relationships across chunks | `validateManuscriptImport` line 529 | Heading tree is fragmented — sub-headings can't reference parents in other chunks |
| 5 | 0 ManuscriptHeading records in production despite 6 completed books | `validateManuscriptImport` line 621 | Heading tree is silently failing or empty — navigation structure is broken |
| 12 | `routeManuscriptKnowledge` sequential enrichment calls can exceed Deno timeout | `routeManuscriptKnowledge` line 138-155 | Routing fails for books with entries in multiple route groups |
| 13 | Enrichment failure + routing record creation = permanently orphaned entry | `routeManuscriptKnowledge` line 179 | Entry is marked as routed but never enriched; never retried |
| 14 | `searchInternalKnowledgeBase` Tier 3 loads 300 entries into memory per search | `searchInternalKnowledgeBase` line 192 | O(n²) scaling — 5000 books = 75M comparisons |
| 15 | `detectManuscriptDuplicates` limit 50 misses matches in large libraries | `detectManuscriptDuplicates` line 236, 257, 279 | Duplicates beyond #50 in each section are never detected |

### High-Severity Bugs

| # | Bug | Location | Impact |
|---|-----|----------|--------|
| 1 | Only PDF files supported — no DOCX, TXT, Markdown, images | `importFromOneDrive`, `bulkImportOneDriveFolder` | Many manuscript formats are silently ignored |
| 7 | `condition` entry_type routes to `astro_timing` incorrectly | `routeManuscriptKnowledge` line 32 | Ritual conditions sent to Astro Clock |
| 8 | `warning` entry_type routes to `other` (not routed) | `routeManuscriptKnowledge` line 53 | Timing warnings are lost |
| 10 | No content-based classification — routing is purely type-based | `routeManuscriptKnowledge` line 129 | Misclassified entries go to wrong module |
| 16 | `routeManuscriptKnowledge` loads ALL entries for a book without pagination | `routeManuscriptKnowledge` line 88 | Memory issues for books with 500+ entries |

### Medium-Severity Bugs

| # | Bug | Location | Impact |
|---|-----|----------|--------|
| 2 | `browseOneDrive` only identifies PDFs | `browseOneDrive` line 45 | Non-PDF files listed but not importable |
| 3 | `validateManuscriptImport` hardcoded for PDF workflow | `validateManuscriptImport` | Cannot process images or other formats |
| 6 | `detectManuscriptDuplicates` Stage 2/3 limit 50 | `detectManuscriptDuplicates` | Misses duplicates in large sections |
| 9 | `image` entry_type routes to `other` instead of `wafq` | `routeManuscriptKnowledge` line 52 | Wafq images not routed to Wafq module |
| 11 | `canonicalMergeEntry` naming confusion with knowledge store merge | `canonicalMergeEntry` | Developers may confuse the two merge systems |

---

## 17. ARCHITECTURAL WEAKNESSES

1. **No webhook-based incremental sync** — OneDrive supports `updated` webhook events but no automation is configured. All sync is manual.

2. **No file format flexibility** — pipeline is hardcoded for PDF. Adding DOCX or image support requires architectural changes.

3. **No OCR accuracy measurement** — cannot verify extraction quality beyond the quality gate.

4. **No human review queue** — `manual_review` entries are stored but no UI workflow exists to review and promote them to `verified`.

5. **No marker record cleanup** — marker records accumulate permanently. For 5000 books, this could be 100,000+ records.

6. **No knowledge store pruning** — if knowledge is found to be incorrect, there's no function to remove or correct it (only add new revisions).

7. **No cross-module consistency check** — no function verifies that knowledge in Astro Clock doesn't contradict knowledge in Dua or Ritual.

8. **No batch rollback** — if a bulk import partially fails, there's no way to roll back the partially imported data.

9. **No audit trail for knowledge changes** — when knowledge is merged or conflict-resolved, the change is made but no audit log records who/what/when.

10. **No version pinning for LLM models** — `model: 'gemini_3_flash'` is hardcoded. If the model is deprecated, extraction quality changes silently.

---

## 18. SCALABILITY ISSUES

| Scale | Status | Primary Blocker |
|-------|--------|-----------------|
| 100 books | ✅ PASS | None — current architecture handles this |
| 500 books | ⚠ WARNING | `detectManuscriptDuplicates` limit 50; marker accumulation |
| 1000 books | ⚠ WARNING | `searchInternalKnowledgeBase` O(n²) scaling; marker cleanup needed |
| 5000 books | ❌ FAIL | `searchInternalKnowledgeBase` 75M comparisons; `detectManuscriptDuplicates` broken; no caching |

---

## 19. MISSING FEATURES

1. **Deleted file detection** — no reconciliation between OneDrive and database
2. **Renamed file detection** — no rename-specific handling
3. **Webhook-based real-time sync** — supported but not configured
4. **Non-PDF file support** — DOCX, TXT, Markdown, images
5. **OCR accuracy metrics** — CER, WER, ground-truth comparison
6. **Table structure extraction** — tables extracted as text, not grids
7. **Rotated page correction** — no detection or fix
8. **Manzil (lunar mansion) extraction** in Astro Clock enrichment
9. **Wafq symbol extraction** — no symbol/seal content captured
10. **Human review queue** for `manual_review` entries
11. **Marker record cleanup** function
12. **Knowledge correction/revision** function
13. **Cross-module consistency validation**
14. **Batch rollback** for failed imports
15. **Audit trail** for knowledge changes
16. **Caching layer** for frequently accessed records
17. **Rate limiting** on LLM calls
18. **File size validation** before download
19. **Parallel processing** in bulk import (currently 1 PDF per call)
20. **Content-based classification** (currently type-based only)

---

## 20. RECOMMENDED FIXES (Priority Order)

### Immediate (Before Next Import)
1. **Fix heading tree:** Remove chunk prefix from heading_ids; use global heading map across chunks
2. **Investigate 0 headings in production:** Add logging to `bulkCreate` call; check if LLM returns empty headings
3. **Fix routing timeout:** Make enrichment calls in `routeManuscriptKnowledge` parallel (Promise.all) instead of sequential
4. **Fix orphaned entries:** Don't create routing record if enrichment fails; or add retry mechanism

### Short-Term (Before 100+ Books)
5. **Add pagination to all `filter({ book_id })` calls** — use limit + skip loops
6. **Increase `detectManuscriptDuplicates` limit** from 50 to 500, or use database-side filtering
7. **Fix `condition` routing:** Route to `ritual` not `astro_timing` (or use content-based classification)
8. **Add webhook automation** for OneDrive `updated` events
9. **Add marker cleanup function** (delete markers for deleted entries)
10. **Add file size validation** (reject PDFs > 100MB)

### Medium-Term (Before 500+ Books)
11. **Replace `searchInternalKnowledgeBase` Tier 3** with database-side Arabic normalized text search
12. **Add caching layer** for VerifiedArabic text_hash lookups
13. **Add DOCX/TXT support** via `ExtractDataFromUploadedFile`
14. **Add human review queue** UI for `manual_review` entries
15. **Add audit trail** for all knowledge store changes

### Long-Term (Before 1000+ Books)
16. **Implement content-based classification** using LLM classification before routing
17. **Add parallel processing** in bulk import (2-3 PDFs simultaneously)
18. **Add cross-module consistency validation**
19. **Add knowledge revision system** (correct incorrect knowledge with new revision)
20. **Consider splitting knowledge stores** by book or section for smaller indexes

---

## FINAL CERTIFICATION

| Category | Status | Confidence |
|----------|--------|------------|
| OneDrive Connection | ✅ PASS | 85% |
| File Import | ❌ FAIL | 95% |
| OCR | ⚠ WARNING | 65% |
| Manuscript Extraction | ⚠ WARNING | 70% |
| Knowledge Classification | ⚠ WARNING | 70% |
| Astro Clock Enrichment | ⚠ WARNING | 70% |
| Dua Enrichment | ✅ PASS | 80% |
| Ritual Enrichment | ✅ PASS | 80% |
| Wafq Enrichment | ⚠ WARNING | 70% |
| Canonical Merge | ✅ PASS | 85% |
| Conflict Resolution | ✅ PASS | 85% |
| Knowledge Evolution | ✅ PASS | 85% |
| Error Handling | ⚠ WARNING | 70% |
| Scalability (100 books) | ✅ PASS | 80% |
| Scalability (500 books) | ⚠ WARNING | 65% |
| Scalability (1000 books) | ⚠ WARNING | 55% |
| Scalability (5000 books) | ❌ FAIL | 75% |
| Security | ✅ PASS | 85% |

**OVERALL VERDICT: ⚠ CONDITIONALLY PRODUCTION-READY**

The pipeline is architecturally sound for small-scale use (< 100 books). The core flow (import → extract → verify → route → enrich → merge) works correctly end-to-end. However, 5 critical bugs, 6 high-severity bugs, and O(n²) scaling in the internal search system must be fixed before scaling beyond 100 books.

**Confidence in this audit: 85%** — based on full source code review of all 16 pipeline functions, production database state verification (11 books, 100 entries, 39 knowledge records), and architectural analysis of all 4 knowledge stores, 3 routing systems, and 2 merge systems.

---

*End of Audit Report*