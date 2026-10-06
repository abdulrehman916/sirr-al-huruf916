# GLOBAL KNOWLEDGE INGESTION & VERIFICATION RULE (PERMANENT)

**Status:** PERMANENT — applies to the entire SIRR AL-HURUF system.  
**Scope:** All manuscript imports, all knowledge modules, all extraction/verification/routing/merge operations.  
**Date:** 2026-07-09  

---

## PURPOSE

The goal is NOT to extract selected information from manuscripts.  
The goal is to absorb the COMPLETE manuscript into the structured knowledge base **without losing a single piece of knowledge**.

---

## 1. COMPLETE EXTRACTION

Read and process **EVERYTHING**.

- Every page
- Every heading
- Every paragraph
- Every Arabic text
- Every explanation
- Every footnote
- Every table
- Every image (OCR)
- Every caption
- Every appendix
- Every reference
- Every note
- Every example

**Nothing may be skipped.**

No sentence, word, Arabic letter, harakah, repetition count, material, warning, condition, timing, planetary rule, weekday rule, lunar mansion, ritual, dua, dhikr, divine name, plant, medicine, waqf, bast, faal, jinn, astrology, or spiritual instruction may be ignored.

### ENFORCEMENT

The extraction prompt in `validateManuscriptImport` MUST instruct the LLM to:
- Process EVERY page. Do not skip any.
- Extract ALL content from EVERY page.
- If Arabic is unclear, extract what is readable AND note unreadable portions. Never skip the entry.
- Mark uncertain content with `extraction_confidence < 70` and `arabic_text_preserved=false`.
- **Never skip content — mark it for Manual Verification instead.**

The previous "ACCURACY OVER COMPLETENESS" principle is **REPEALED**.  
The new principle is: **COMPLETE EXTRACTION with confidence marking.**  
Every piece of knowledge is extracted. Uncertain pieces are marked, not skipped.

---

## 2. AUTOMATIC KNOWLEDGE ROUTING

Every extracted knowledge item MUST automatically go to its correct canonical module.

### Current Routing (implemented in `routeManuscriptKnowledge`)

| Knowledge Type | Routes To | Entity |
|---|---|---|
| Planetary Hour / Weekday Rule / Sahath / Timing | Astro Clock | `AstroClockKnowledge` |
| Dua / Dhikr / Wird / Quran Verse / Divine Name / Invocation | Dua | `DuaKnowledge` |
| Amal / Ritual / Procedure / Exorcism / Protection | Ritual | `RitualKnowledge` |
| Wafq / Magic Square / Letter Diagram / Taweez / Numeric Diagram | Wafq | `WafqKnowledge` |
| Material / Herb / Incense / Note / Reference | Other | Not routed (preserved in ManuscriptEntry) |

### Target Routing (future expansion — modules not yet built as separate entities)

| Knowledge Type | Target Module | Status |
|---|---|---|
| Lunar Mansion | Lunar Mansion Module | Future — currently in AstroClockKnowledge or ManuscriptEntry |
| Planet | Planet Module | Future — currently in AstroClockKnowledge or ManuscriptEntry |
| Plants | Plants Module | Future — currently in ManuscriptEntry (sirr_section=6) |
| Medicine | Medicine Module | Future — currently in ManuscriptEntry (sirr_section=6) or Preparation |
| Bast | Bast Module | Future — currently in ManuscriptEntry (sirr_section=4) |
| Faal | Faal Module | Future — currently in ManuscriptEntry |
| Jinn | Jinn Module | Future — currently in ManuscriptEntry (sirr_section=2) |

**RULE:** Every subject MUST automatically reach its correct module. No knowledge is left orphaned.

---

## 3. NO DUPLICATES

Never create duplicate knowledge.

If the same knowledge already exists:
- Detect duplicates (via `searchInternalKnowledgeBase` + `detectManuscriptDuplicates`).
- Merge intelligently (via canonical merge with LLM classification).
- Preserve existing verified knowledge.
- Add only genuinely new information.
- Preserve every source.
- Preserve every page reference.
- Preserve manuscript identity.

**Never duplicate the same knowledge across modules.**  
**Only one canonical knowledge record may exist.**

### Enforcement

- `searchInternalKnowledgeBase`: 5-tier search (exact hash → normalized → indexed library → semantic metadata → image type). Finds existing knowledge BEFORE creating new records.
- `detectManuscriptDuplicates`: 3-stage duplicate detection (exact Arabic → structure match → semantic match). Links duplicates, never merges away sources.
- Canonical merge: LLM classifies new vs existing as Complementary / Equivalent / Context-Specific / Conflicting. Only Complementary and Equivalent are merged. Context-Specific and Conflicting are preserved separately.

---

## 4. ARABIC VERIFICATION

Arabic accuracy is **mandatory**.

Never guess:
- Arabic spelling
- Harakat
- Qur'an verses
- Hadith
- Dua
- Dhikr
- Divine Names

### Verification Priority (highest first)

1. Existing verified SIRR AL-HURUF knowledge (`VerifiedArabic` entity).
2. Previously imported manuscripts (`ManuscriptEntry` with `verification_status='verified'`).
3. Other pages in the same manuscript.
4. Trusted internal references.
5. Only if still uncertain, use a powerful AI verification process with authoritative Arabic references.

### Never invent corrections.

If confidence is low:
- **Do NOT modify the text.**
- **Keep the original manuscript text.**
- **Mark: Manual Verification Required** (`verification_status='manual_review'`).

### Enforcement

- `verifyArabicText`: Multi-source verification with confidence levels (HIGH/MEDIUM/LOW/UNVERIFIED).
- `verifyBookEntries`: Batch verification that searches internal knowledge first, only uses external verification for new entries.
- `searchInternalKnowledgeBase`: Tier 1/2/3 search finds existing verified Arabic before any external verification.
- Original manuscript text is ALWAYS preserved in `original_manuscript_text` field on `VerifiedArabic`. Never overwritten.

---

## 5. MULTIPLE VERIFIED OPINIONS

If verified books disagree:
- **Never overwrite.**
- **Keep every verified opinion.**
- **Store every source separately.**
- **Mark: Multiple Verified Opinions** (stored in `conflicting_opinions` array with `conflict_flags`).

### Enforcement

- All canonical knowledge stores (`AstroClockKnowledge`, `DuaKnowledge`, `RitualKnowledge`, `WafqKnowledge`) have `conflicting_opinions` and `conflict_flags` fields.
- The LLM conflict resolver classifies disagreements as CONFLICTING (not COMPLEMENTARY) when sources genuinely disagree on the same point under the same conditions.
- Conflicting opinions are preserved with their supporting sources and confidence levels.
- Future manuscripts can strengthen one opinion through additional supporting sources.

---

## 6. ZERO DATA LOSS

The original manuscript MUST always remain preserved.

Knowledge extraction MUST never delete or replace original content.

### Enforcement

- `ManuscriptEntry.arabic_text`: Original Arabic text verbatim from the manuscript. Never modified.
- `ManuscriptEntry.arabic_normalized`: Normalized for search only. Never replaces the original.
- `VerifiedArabic.original_manuscript_text`: Exact original text, stored separately from the verified version. Never overwritten.
- `VerifiedArabic` revisions: New revisions create new records. Previous revisions are preserved permanently.
- `ManuscriptBook.original_file_url`: Original PDF always remains the master source. Never copied or modified.
- Canonical knowledge stores append sources (`supporting_sources`), never overwrite.
- `cleanupFailedImport` and `cleanupMarkerRecords` only remove FAILED or OBSOLETE data. Never remove verified knowledge.

---

## 7. FINAL VALIDATION

Import is complete **ONLY IF** ALL of the following are true:

| Criterion | Checked By | Field |
|---|---|---|
| 100% pages processed | `validateManuscriptImport` | `fourteen_point_check.3_extract_every_page` + `15_complete_extraction` |
| 100% OCR processed | `validateManuscriptImport` | `fourteen_point_check.5_extract_images` |
| 100% Arabic processed | `validateManuscriptImport` + `verifyBookEntries` | `fourteen_point_check.4_extract_arabic` + `8_arabic_verification` |
| 100% routing completed | `routeManuscriptKnowledge` | `status='routing_complete'` |
| 100% duplicate detection completed | `detectManuscriptDuplicates` | All entries have `duplicate_status != 'pending_detection'` |
| 100% canonical merge completed | `enrichAstro/Dua/Ritual/WafqFromManuscript` | `status='enrichment_complete'` for all modules |
| No skipped pages | `validateManuscriptImport` | `skipped_pages.length === 0` |
| No skipped paragraphs | `validateManuscriptImport` | `15_complete_extraction = PASS` |
| No skipped Arabic | `validateManuscriptImport` | `16_zero_data_loss = PASS` |
| No orphan knowledge | `routeManuscriptKnowledge` | Every routing record has `knowledge_ids` or `is_marker=true` |
| No duplicate records | `detectManuscriptDuplicates` + canonical merge | `content_hash` uniqueness verified |
| No data corruption | Module verification | Zero duplicate hashes, zero orphan entries |

**The manuscript is considered successfully imported ONLY when the complete knowledge has been absorbed into the SIRR AL-HURUF knowledge system without losing even a single piece of information.**

---

## ENFORCEMENT SUMMARY

### Extraction (`validateManuscriptImport`)
- Extraction prompt MUST say "COMPLETE EXTRACTION" not "ACCURACY OVER COMPLETENESS".
- Every page MUST be processed. `skipped_pages` MUST be empty.
- Every entry MUST have a `heading_id`. No orphan entries.
- Low-confidence entries are marked, not skipped.
- 14-point check now includes `15_complete_extraction` and `16_zero_data_loss`.

### Routing (`routeManuscriptKnowledge`)
- LLM classifies every verified entry by primary purpose.
- Every entry gets a `KnowledgeRouting` record.
- Entries without module-specific knowledge get marker records (not skipped).

### Duplicate Detection (`detectManuscriptDuplicates` + `searchInternalKnowledgeBase`)
- 5-tier internal search BEFORE any external verification.
- 3-stage duplicate detection links duplicates, never merges away sources.
- `content_hash` and `canonical_key` prevent duplicate knowledge records.

### Arabic Verification (`verifyArabicText` + `verifyBookEntries`)
- Internal knowledge search first (free, instant).
- External verification only for new entries.
- Original text never modified. Low confidence → manual review.
- Revisions create new records, never overwrite.

### Canonical Merge (`enrichAstro/Dua/Ritual/WafqFromManuscript`)
- LLM classifies new vs existing: Complementary / Equivalent / Context-Specific / Conflicting.
- Only Complementary and Equivalent are merged.
- Context-Specific stored under conditions.
- Conflicting preserved as Multiple Verified Opinions.
- Sources always appended, never overwritten.

### Data Preservation
- Original PDF: `ManuscriptBook.original_file_url` (master source, never modified).
- Original Arabic: `ManuscriptEntry.arabic_text` (verbatim, never modified).
- Original manuscript Arabic: `VerifiedArabic.original_manuscript_text` (separate from verified version).
- Revisions: new records, previous preserved.
- Sources: appended to `supporting_sources`, never removed.

---

*This law is PERMANENT and applies to all current and future manuscript imports, knowledge modules, and pipeline operations in the SIRR AL-HURUF system.*