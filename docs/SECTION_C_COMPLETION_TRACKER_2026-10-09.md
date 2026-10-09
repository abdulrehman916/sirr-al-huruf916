# Sirr al-Huruf 916 — Holy Names Section C completion tracker

Snapshot: 2026-10-09. Repository `abdulrehman916/sirr-al-huruf916` only. No Base44 dependence.

## Current independently checked milestones

| Gate | Status | Basis |
| --- | --- | --- |
| Correct independent project | Confirmed | GitHub repository, Supabase project and Vercel production all identified |
| 28 Birhatīya record shells | 28/28 present | Supabase `public.platform_records` entity `HolyNameEsotericKnowledge` |
| Attached source-checked chapter field | 28/28 present | `source_checked_chapter.review_status = checked_against_scan` |
| Structured source-chapter notes | 97 records | 26 practices + 48 edition accounts + 23 source notes across 28 records; NOT an exhaustive claim or all distinct instructions |
| Translated structured source-chapter notes | 97/97 include both `translation.ml` and `translation.en` | Audit of these 97 entries only, not the whole archive |
| Arabic primary transcription in structured notes | 57/97 have `arabic_original` | 26 practices + 31 edition accounts. Other notes may summarize sourced original scans; original Arabic not silently invented |
| Full Arabic `منبع أصول الحكمة` source images | Source images provided for printed pp. 67–90 | See existing `docs/holy-names-research-order.md`; page scans do not establish complete typed transcription |
| Frontend source-first topic sheets | Built | Existing Malayalam/English toggle, Arabic text, count, conditions, linked source, collective card |
| Recent Vercel production build | READY for commit `cfd03465bfb29c491a399f3f2e3654aa68d1ca0d` | Vercel deployment status checked 2026-10-09; this is a compile/build check, not live acceptance for every card |
| Exhaustive reviewed transcription of all known book passages | **Incomplete** | 24 source pages and collective recensions require remaining line-by-line work |
| All distinct linked figures, names, counts and original du'a variants | **Incomplete** | Source-by-source validation required |
| Every outside source on the internet | **Unbounded** | Never claim internet-wide exhaustiveness |

## Working sequence — no simultaneous editing of separate sections

1. **Section C**: complete source-by-source transcription and translation. Check all 28 name-specific records and existing scan pages, full prayers, distinct practices, source counts/timings, figures, printed variants and deduplication. Preserve the original text and book/page/source attribution. Language output: Arabic source, Malayalam below in Malayalam mode; Arabic source, English below in English mode. No Turkish output or extra language button.
2. Test all 28 cards on both languages, find omissions and unwanted repeated blocks, validate numerical calculations without altering the engines, run automated Vite build and inspect Vercel production **READY** before checking off Section C.
3. **Next after C:** review and complete Holy Names **Section D**, one page or dataset at a time, without mixing Section C. Then audit Sections A and B individually, preserving their separate schemas and user-specific requirements.
4. After the Holy Names modules, walk other existing site pages in recorded route-manifest order, checking missing content, language, duplicated sections and broken functionality one page at a time. Do not silently overwrite anything functional.
5. Notify the user when each full section's verified coverage is complete, and identify any original source pages still unread. Do not equate mere GitHub commits or a successful Vercel build with full corpus completion.

## Time and evidence policy

No trustworthy completion date can be provided before a bounded manifest of the user's complete books and other source texts is made. There are potentially unlimited external sources; promises to find "all" internet documents or thousands of as-yet-unlocated methods would be ungrounded. Work through the known, accessible corpus in incremental reviewable batches and keep this file updated with the number of newly validated entries and unresolved pages after each batch. Priority is source fidelity and preserving the existing site, not fabricating fast completion.

Keep all facts, pages and content scoped to the cited printed edition. The terms "recitation", "written copies", "Abjad value" and "square entries" must not be conflated.

## Per-name source-chapter inventory (Supabase, 2026-10-09)

This table is **only** an inventory of source-chapter excerpts already in the live database. It is not a completion score, does not include full manuscript scans or the other method/guide files, and gives no permission to fill zeros with imagined material.

| Name ID | Source page | Practices | Edition accounts | Source notes | Full content review |
|---|---:|---:|---:|---:|---|
| HNK-MHC-001 | 67 | 3 | 3 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-002 | 68 | 3 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-003 | 68 | 2 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-004 | 68 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-005 | 68 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-006 | 69 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-007 | 69 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-008 | 69 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-009 | 70 | 0 | 2 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-010 | 70 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-011 | 70 | 0 | 2 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-012 | 70 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-013 | 71 | 0 | 2 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-014 | 71 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-015 | 71 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-016 | 71 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-017 | 72 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-018 | 72 | 0 | 2 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-019 | 72 | 1 | 1 | 1 | Pending exhaustive scan/variant pass |
| HNK-MHC-020 | 72 | 0 | 1 | 2 | Pending exhaustive scan/variant pass |
| HNK-MHC-021 | 72 | 0 | 1 | 2 | Pending exhaustive scan/variant pass |
| HNK-MHC-022 | 73 | 1 | 2 | 0 | Pending exhaustive scan/variant pass |
| HNK-MHC-023 | 73 | 1 | 2 | 0 | Pending exhaustive scan/variant pass |
| HNK-MHC-024 | 73 | 1 | 4 | 0 | Pending exhaustive scan/variant pass |
| HNK-MHC-025 | 73 | 0 | 3 | 0 | Pending exhaustive scan/variant pass |
| HNK-MHC-026 | 73 | 1 | 3 | 0 | Pending exhaustive scan/variant pass |
| HNK-MHC-027 | 73 | 1 | 5 | 0 | Pending exhaustive scan/variant pass |
| HNK-MHC-028 | 74 | 1 | 2 | 0 | Pending exhaustive scan/variant pass |

Priority: inspect every original Arabic page, then related edition passages and outside sources for each name, preserving all distinct complete prayers and any genuine source figure. Do not equate an empty structured field with absence of a practice in books.


## Source review batch — 2026-10-09: two online methods + independent Oman book square

- Independently checked the 29 February 2020 Arabic blog article `تصريفات مجربة ومفيدة لأسماء الدعوة البرهتية` (https://barhatiya.blogspot.com/2020/02/blog-post_88.html). The blog reports **622 readings for Birhatiah (name 1)** with an Arabic request following prayer and fasting, and **340 readings for Karir (name 2)** with a separate Arabic request following prayer and fasting. These are *distinct online accounts*, not substitutes for the established book methods or Abjad values. Exact fasting duration, prayer identity and clock hour are not specified. Only the printed unvowelled Arabic requests are reproduced, with the existing source-checked vowelled name forms. The blog also mentions a **24-name** grouping; do not change the site's 28-name ordering. Two attributed bilingual method records are in `src/data/birhatiahOutsideMethods2020.json`, displayed only on the corresponding names. The 2020 source is an online blog, not an independently dated or confirmed manuscript.
- Newly identified and directly reviewed another supplied book, **`مجربات أهل عُمان الكبير`, النسخة 2**, 837-page PDF. It contains a fully printed **4×4 square of the Birhatiah names** on **printed page 561 / PDF page 565**. Visually transcribed the sixteen large Arabic-Indic numbers and the sixteen smaller positional indices, preserving their left-to-right locations in the printed figure. The numbers in `src/data/birhatiahOmanSquareP561.json` sum to **18,587 for all 4 rows, 4 columns and both diagonals**. Those exact numbers differ from the flawed 2011 forum version; the two sources remain independently displayed and are not combined or silently rewritten. `BirhatiahOmanSquare.jsx` shows the data as a readable Arabic-Indic grid in collective Card 29 only, with small book/page credit, not the full private scan.
- The printed page's **subsequent paragraphs belong to a separately headed method** and are NOT reassigned to the Birhatiah 4×4 square. Likewise the printed claim of repelling sorcery is attributed to the source, not introduced as an independently verified effect. Do not invent a unique per-name magic square, or treat square values as recitation instructions.
- The supplied Oman book also indexes Birhatiah material at PDF pp. 40, 87 and 91 (among other occurrences); these sections require visual inspection and source-by-source indexing before publication. This book's **remaining 836 pages have not been exhaustively reviewed** for Section C. Track it as a newly discovered substantial source, not complete coverage.
- New regression coverage verifies uniqueness and language of the 2020 source methods, Arabic letter fidelity, and exact mathematical consistency/position indices of the 4×4 Oman figure in the collective card. Recheck latest Vercel production state before declaring the batch live.

**Status remains incomplete**: current 28-name cards exist and have structured material but full typed Arabic/English/Malayalam source corpus, all full-length prayers and all accessible external/social-source accounts are not exhaustively reviewed. Next work should continue the user's original books and newly indexed Oman pages, then external sources and publicly accessible Facebook material (without assuming access to private posts).

## Additional source review — 2026-10-09: 2012 blog interpretation list (staged)

- Reviewed **Hesham Mamdouh, “معانى الاسماء ال 28 من البرهتيه باللغة العربيه,” 16 January 2012**, https://heshammamdouh.blogspot.com/2012/01/28.html. The article supplies an author's alternative Arabic-language gloss for each of the 28 named positions. This is an **online author's claim, not independent Syriac/Arabic philological validation** and not a verified manuscript reading. Its claims about meanings must never replace any existing scan-checked gloss or Arabic.
- Staged **28 additional bilingual Malayalam/English interpretive gloss entries**, one per existing `HNK-MHC-001..028`, in `src/data/birhatiahOutsideGlosses2012.json`. The viewer displays them inside a **collapsed, source-linked, explicitly unverified** subsection next to the source-checked reading on each Section C name card. No original name, harakat, Abjad value, recitation count, timing or database record was changed.
- The article does not give separate per-name recitation counts, timings, diagrams or medical evidence. No unsupported claim is inferred. An unrelated blog comment or unrelated ritual must not be included in these entries.
- The source-first reader verification was extended to check the new entries and both display languages across the full 28-name set. Branch-stage changes remain separate from `main` until an actual successful build and review; an older successful build is not proof of the new branch's runtime.
- **Still incomplete:** line-by-line original book transcription, remaining Oman book pages, source-backed name-specific methods/figures, reliable bibliographic comparison, genuinely working independent recitation timer, and exhaustive external discovery.


## Section C session tooling and numeric-source safeguards — 2026-10-09

- A **per-method optional manual reading counter** and a **personal configurable countdown (1–180 minutes)** have been developed for the 28 name cards, with Malayalam/English labels. Counter values are saved only to this browser/device under a unique per-method key; the clock is reset when the card closes. The countdown uses a wall-clock deadline, so tab suspension does not count as paused time. This is *not* a prescription of an auspicious hour or guaranteed spiritual/medical effect.
- An automatic suggested reading target appears **only when the source data explicitly marks a number as `count_kind: "recitation"`**. Abjad totals, square entries, writing/inscription counts, and untyped values cannot become automated reading targets. The corresponding source-value label distinguishes these types or clearly says the type is not yet verified.
- Three existing 2023 forum methods which explicitly describe **combined reading 100 times** are marked `count_kind: "recitation"`, without changing their original Arabic words or the 28 canonical name values; these are still forum claims, not authenticated manuscript efficacy.
- The formerly named **"Abjad Square"** display is now explicitly **"Abjad Value Squared (not a magic square)"**: `Abjad × Abjad` is only arithmetic. Actual manuscript awfāq and source-backed diagrams remain separate, and no synthetic talisman or unsupported grid was added.
- Added the independent `verify-birhatiah-session.mjs` regression tests, plus per-name bilingual static-reader checks, to the production `prebuild` path. Build READY only verifies code/test packaging, not manual device interaction or entire textual source accuracy.
- **Unresolved corpus work remains**: every line of all supplied original Arabic and parallel editions, missing per-name source methods and diagrams, new book metadata, medical/safety source classifications, full visual checks of the Oman volume, reliable external research provenance, and a manually exercised stopwatch/counter on real devices. Do not mark the entire library COMPLETE on the strength of a build.


### Additional live-data audit and public citation fix

- Independent Supabase SELECT rechecked 28/28 `HolyNameEsotericKnowledge` rows and 28/28 `checked_against_scan` source chapters. The structured chapters hold **26 practices, 48 edition accounts, 23 source notes**; an older scholarly array holds **292 entries**. These are entry counts, not 292 independently distinct proven rituals.
- The legacy `timing` advanced-section array is still **empty for all 28 cards**. There are **28 count entries on 27 cards**, but they are not all recitation targets; other source-chapter passages may state times within methods. Do not auto-populate blanks by using Abjad or astronomy.
- Seven cards have no items in their structured `practices` array: C009, C011, C013, C018, C020, C021, C025. This is **not proof no methods exist**, since edition accounts and separate guide/source files may still hold applicable material; each should get a source-by-source review.
- Card-level source names/pages and `sources[]` bibliographies now render to general Section C visitors rather than only the owner. Private `source_notes` and internal entry notes remain owner-only. A displayed citation identifies where a claim comes from; it does not independently establish that a historical healing/wealth claim is effective.

## Oman source manuscript visual review, indexing and cards — 9 October 2026

- Revisited the user's original private 837-page **مجربات أهل عُمان الكبير**, النسخة 2, reading source **PDF pages 40, 87, 91, 92 and 94** with page images. Corresponding printed numbers: **36, 83, 87–88 and 90**. Existing notes in `src/data/birhatiahOmanBook2026.json` for the first three were corrected/scoped, and a fourth visually checked p90 reference was added.
- **Printed 36 / PDF 40:** the collective invocation is named with one reading at the conclusion of a separate historical protective formula. The single count belongs to that account, **not to all 28 names individually**.
- **Printed 83 / PDF 87:** the source explicitly prints **`قلنهود` 195 times** in an attributed historical practice. A separate line mentions **all Birhatiah names** without making 195 the whole invocation's count. The personal/medical efficacy claim is unverified. This is linked exclusively to **C11** as a page-attributed historical reference, not as an endorsed treatment.
- **Printed 87–88 / PDF 91–92:** one collective method prints **21 collective readings**, a separate **11 marker for `خوطير`** embedded in that context, **11 for ten verses from al-Ṣāffāt**, and **threefold in-session repetition** on the following page. Distinct counting types are preserved. The `خوطير` mention appears on **C10** as *collective context*, **never a standalone C10 rule**. Historical punitive/health claims are not asserted as efficacious.
- **Printed 90 / PDF 94:** a different palm/diagnostic account mentions Birhatiah recitation without giving its own exact number. Its alleged magical diagnosis must **not** be treated as medical diagnosis.
- Text-index searches also found leads on **PDF 264, 282, 454, 491** (printed 260, 278, 450, 487). **They are indexed for later image and figure verification, not marked as original-scan-verified and not turned into actionable methods.** Their categories include historical bleeding/healing assertions and talisman references. Additional keyword matches include **PDF 565** (the separately checked 4×4 collective square) and **PDF 825** (table-of-contents reference), not newly certified methods.
- The source-notes component is now mounted in **collective card 29**; historical name-specific notes appear only in the matching **C10/C11 reference drawers**. No private book PDF scan was uploaded to the public site.
- The new regression checks enforce **four visually reviewed source passages**, four pending source-page candidates, C10/C11 associations and exclusion from the other 26 name cards. Passing these checks or a production build cannot establish exhaustive verification of the other ~830 PDF pages or the rest of the user's manuscript corpus.
