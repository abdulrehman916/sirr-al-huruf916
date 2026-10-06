# Astro Clock — Flagged Western-Source Audit (READ-ONLY)

**Generated:** 2026-07-21
**Status:** READ-ONLY. No Astro Clock record was added, removed, quarantined, or modified. Owner review only.
**Audit scope:** Every `AstroClockKnowledge` record whose `source_book_title` matches one of the flagged Western-occult / Hermetic titles.

---

## 1. Summary

- **Total flagged records:** 214 (209 knowledge records + 5 `scan_marker` end-of-book markers)
- **Flagged books:** 5
- **Why flagged:** Each record's source is a **Western occult / Hermetic title**, not an approved Islamic manuscript. Under the Project Constitution, Astro Clock must operate **only** from approved astrology sources (your approved books, OneDrive, Google Drive, screenshots, approved manuscripts) — **no Western astrology, no internet rules, no AI-generated rules**. These records were ingested by `autoScanAstroClockLibrary`, which routed them into Astro Clock because the ingestion LLM classified their content as astrology-related. They are flagged here so the Owner can decide, per record, whether the content is an acceptable general-esoteric/ritual note or a Western-astrology rule that must be removed.

### Per-book counts
| Book | Records |
|---|---|
| `1 - How to Summon and Command ... by de Lafayette (2010).pdf` | 58 |
| `The_Greco_Egyptian_Magical_Formularies_by_Christopher_Faraone_and.pdf` | 57 |
| `The_Hedgewitch's_Little_Book_of_Spells,_Charms_&_Brews_by_Tudorbeth.pdf` | 52 |
| `The_Real_Witches'_Book_of_Spells_and_Rituals_by_Kate_West.pdf` | 24 |
| `Magia experimental práctica - Gian Piero Bona.pdf` | 23 |
| **Total** | **214** |

---

## 2. Category distribution (flagged set)

| Category | Count | Category | Count |
|---|---|---|---|
| rituals | 42 | correspondences | 27 |
| stones | 25 | spiritual_properties | 24 |
| invocations | 18 | special_days | 9 |
| incense | 9 | unfavourable_timings | 7 |
| khawass | 7 | lucky_timings | 6 |
| treatments | 6 | scan_marker | 5 |
| zodiac_signs | 3 | special_nights | 3 |
| metals | 3 | wafq | 3 |
| directions | 3 | sahat | 2 |
| abjad | 2 | forbidden_actions | 2 |
| planets | 2 | recommended_actions | 2 |
| planetary_hours | 1 | planet | 1 |
| colours | 1 | elements | 1 |

**Observation:** The flagged content is mostly **ritual/correspondence/stones/invocations** (Wiccan Sabbats, Hermetic seals, Greco-Egyptian spells, de Lafayette spirit-summoning). A small subset touches **planetary / zodiac / sahat / planetary_hours** categories — those are the most likely to be genuine *Western astrology rules* and deserve closest review:
- `planet` (1), `planets` (2), `planetary_hours` (1), `sahat` (2), `zodiac_signs` (3), `lucky_timings` (6), `unfavourable_timings` (7), `special_nights` (3), `special_days` (9)

---

## 3. Per-book category breakdown

### `1 - How to Summon and Command ... by de Lafayette (2010).pdf` (58)
rituals=14, invocations=13, spiritual_properties=10, correspondences=3, khawass=3, wafq=3, unfavourable_timings=2, sahat=1, planets=1, planet=1, planetary_hours=1, recommended_actions=1, treatments=1, stones=1, incense=1, lucky_timings=1, scan_marker=1

### `The_Greco_Egyptian_Magical_Formularies_by_Christopher_Faraone_and.pdf` (57)
rituals=21, stones=5, invocations=4, treatments=4, correspondences=4, khawass=3, zodiac_signs=3, lucky_timings=3, spiritual_properties=2, unfavourable_timings=2, special_days=1, special_nights=1, metals=1, sahat=1, recommended_actions=1, scan_marker=1

### `The_Hedgewitch's_Little_Book_of_Spells,_Charms_&_Brews_by_Tudorbeth.pdf` (52)
stones=15, correspondences=12, spiritual_properties=7, incense=5, special_days=3, rituals=2, forbidden_actions=2, special_nights=1, treatments=1, planets=1, unfavourable_timings=1, directions=1, scan_marker=1

### `The_Real_Witches'_Book_of_Spells_and_Rituals_by_Kate_West.pdf` (24)
special_days=5, correspondences=5, stones=2, incense=3, abjad=1, khawass=1, unfavourable_timings=1, lucky_timings=1, special_nights=1, rituals=1, directions=1, elements=1, scan_marker=1

### `Magia experimental práctica - Gian Piero Bona.pdf` (23)
spiritual_properties=5, rituals=4, correspondences=3, stones=2, metals=2, invocations=1, directions=1, abjad=1, unfavourable_timings=1, lucky_timings=1, colours=1, scan_marker=1

---

## 4. Representative sample (one per book) — exact extracted text

### Magia experimental práctica — `seal_of_solomon` · correspondences · p.82,83,84,85,86,87,88,89
> "The Seal of Solomon is utilized as a symbol representing the duality and relationship between Heaven and Earth."

### The Hedgewitch's Little Book — `angelica` · spiritual_properties · p.248,251,252,253,254,255,256,257
> "Angelica is a plant valued for its ability to attract angelic presence and banish demonic entities."

### The Real Witches' Book — `sabbats` · special_days · p.266,267,268,269,270,271,272,273
> "The Witches' calendar consists of eight festivals known as the Wheel of the Year, marking seasonal changes and divine stories."

### The Greco-Egyptian Magical Formularies — `thoth` · special_days · p.554,555,556,558,559,560,561,562
> "Index entry for the Egyptian month Thoth, used as a temporal marker in traditional rituals, referring to page 300."

### How to Summon and Command (de Lafayette) — `sebitti` · planet · p.100,101,102,103,104,105,106,107
> "The Sebitti, meaning 'The Seven', are seven demons created by the Anunnaki god Anu. In mythology, they manifest at night, alter their shapes, and trap people in dark places."

---

## 5. Per-record fields shown for every record (full listing)

For every flagged record, the full entry shows:
- **Source book name** (`source_book_title`)
- **Card name** (`rule_entity` / `entity_raw`)
- **Module** — Astro Clock (Astrology)
- **Category** (`rule_category` + `knowledge_category`)
- **Source page** (`source_page_number`)
- **Exact extracted text** (`knowledge_text_en`, plus `knowledge_text_ar` / `knowledge_text_ml` where present)
- **Why classified as astrology** — `rule_category` value + ingested by `autoScanAstroClockLibrary`
- **Why flagged** — sourced from a Western occult title, not an approved Islamic manuscript

### How to view the complete 214-record listing
The full per-record dump (~75 KB) is produced by the **read-only** backend function `auditAstroClockFlaggedSources` (pages 0–47, ~48 chunks). Nothing it does writes to any entity. Two options to review it:

1. **In-app read-only review page** (recommended) — a new admin-gated page that queries the 5 flagged books client-side and lists every record with the 7 fields, filterable by book/category. No record is editable.
2. **Full markdown dump** — page through `auditAstroClockFlaggedSources` (48 calls) and assemble into one `.md` file here.

**No action will be taken on any record until the Owner reviews and approves.**

---

## 6. Source validation (2026-07-21) — approved-library check

**Method:** each flagged title was matched (title-normalized) against the Master PDF Library (`MasterPdfBook`, 268 books — the central index that mirrors approved OneDrive + Google Drive live-index). Approval is decided **only** by owner approval (`owner_review_status = "approved"`) on the matching library record. Book title alone is never sufficient.

| # | Flagged source | In Master Library? | Library approval | Records affected | Verdict |
|---|---|---|---|---|---|
| 1 | de Lafayette — "How to Summon and Command" (2010) | Yes (Google Drive live-index) | `pending_review` (NOT approved) | 58 | **Not Approved** |
| 2 | Greco-Egyptian Magical Formularies (Faraone) | No | — | 57 | **Not Approved** |
| 3 | Hedgewitch's Little Book of Spells (Tudorbeth) | No | — | 52 | **Not Approved** |
| 4 | Real Witches' Book of Spells and Rituals (Kate West) | No | — | 24 | **Not Approved** |
| 5 | Magia experimental práctica (Gian Piero Bona) | No | — | 23 | **Not Approved** |

### Approved sources
**None.** Zero of the 5 flagged sources carry owner approval. (Source #1 exists in the Drive live-index but is still `pending_review` — never approved.)

### Not approved sources
All 5 flagged sources are **Not Approved**:
1. de Lafayette — present in Master PDF Library as a Google Drive live-index book, but `owner_review_status = pending_review` → never owner-approved.
2. Greco-Egyptian Magical Formularies — not in Master PDF Library at all.
3. Hedgewitch's Little Book of Spells — not in Master PDF Library at all.
4. Real Witches' Book of Spells and Rituals — not in Master PDF Library at all.
5. Magia experimental práctica — not in Master PDF Library at all.

### Records affected by each source
| Source | Records (AstroClockKnowledge) |
|---|---|
| de Lafayette | 58 |
| Greco-Egyptian Magical Formularies | 57 |
| Hedgewitch's Little Book of Spells | 52 |
| Real Witches' Book of Spells and Rituals | 24 |
| Magia experimental práctica | 23 |
| **Total affected** | **214** |

### Recommended action
- **No warning flag is removed** — zero sources were approved, so nothing is un-flagged.
- **No record is deleted, quarantined, moved, disabled, or modified.** All 214 records remain exactly as they are, pending owner review.
- Because all 5 sources are **Not Approved**, every flagged record stays flagged for owner decision. The owner may choose, per record: keep as a general-esoteric/ritual note, or remove.
- Per constitution: Astro Clock must operate ONLY from approved astrology sources. None of these 5 qualify as approved.

**No change will be made until the owner reviews and explicitly approves an action.**

## 7. Permanent-rule compliance note

This audit changes nothing. The following remain enforced:
1. Astro Clock works ONLY from approved astrology sources.
2. Holy Names contains ONLY Holy Names data.
3. Never mix modules.
4. Never use internet rules.
5. Never invent Malayalam.
6. Never overwrite approved data.
7. Append only.