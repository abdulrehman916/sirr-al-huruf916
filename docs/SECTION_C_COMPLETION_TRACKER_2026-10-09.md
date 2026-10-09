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
