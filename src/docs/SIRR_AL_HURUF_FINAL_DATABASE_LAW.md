# SIRR AL-HURUF — FINAL DATABASE LAW
## The Permanent Digital Scholarly Library

**Established:** 2026-07-19 (Asia/Dubai)
**Declaration:** This database is no longer an application. It is a **permanent digital scholarly library**.
**Scope:** Every entity, function, page, and component of the Sirr al-Huruf project — and every future update, in every version, without expiration. This law works together with, and never relaxes, `SIRR_AL_HURUF_RESEARCH_LAW.md` and `SECTION_C_LIVING_LIBRARY_LAW.md`. Where they overlap, the strictest rule applies.

---

## The 13 Laws

**1. Every uploaded PDF must be permanently indexed.**
No uploaded PDF is ephemeral. Each PDF is recorded with its filename, upload date, book title, author, edition, publisher, language, and permanent storage URL. The index survives across all versions. A PDF is never "processed and discarded" — its provenance is permanent.

**2. Every extracted paragraph must be linked to its full provenance.**
Each extracted paragraph carries: **Book · Author · Edition · Publisher · Language · Page number · PDF filename · Upload date · Card ID**. A paragraph without this link is not stored. The link is the paragraph's permanent identity — it never changes, even when the paragraph is later enriched or cross-referenced.

**3. Every card must have a complete "Sources" section.**
Each card exposes a "Sources" section where every consulted source is listed independently and fully cited — book name, author, edition, publisher, page, URL (if any), upload date, and confidence level. Users can see, at a glance, every source behind a card, with no source hidden or merged.

**4. Every card must have a chronological history.**
Each card keeps a chronological record of when each source was added — every ingestion, enrichment, and translation event timestamped and traceable. The history shows the card's growth over time so additions from future sources are auditable.

**5. Future uploads must automatically compare against existing data and append only genuinely new information.**
Before storing content from a new PDF, the system compares it against the card's existing entries (deduplication by exact `text + source + page`). Only genuinely new content is appended. Semantically similar but differently-sourced content is always kept — only byte-identical duplicates from the same source+page are skipped.

**6. Never delete information automatically.**
No ingestion, enrichment, audit, or cleanup routine deletes an existing record, entry, field, source, or image. Deletion is a manual, owner-authorized act only — never an automatic one.

**7. Never replace older information with newer information.**
Older entries are preserved verbatim forever. A newer source does not overwrite an older one. When a newer source differs, it is appended as a new, independent entry; the older entry stays alongside it with its original citation.

**8. If two authentic sources disagree, preserve both separately with their citations.**
Disagreement is scholarly truth, not an error to be resolved. Two conflicting methods, meanings, Abjad values, or pronunciations are both stored, each with its full citation, and displayed as independent entries. The user sees the disagreement and the sources — the system never arbitrates it away.

**9. Every future research session must first search the existing database before searching the internet.**
Internet research is additive, not redundant. Before any internet-research pass, the system reviews what the card already holds, so it only searches for what is genuinely missing. Duplicate work — re-finding what is already stored — is avoided.

**10. Internet research must only enrich missing knowledge and must never replace verified PDF knowledge.**
PDF-extracted, verbatim, source-cited knowledge is the authoritative base. Internet research fills the gaps PDFs leave; it never overwrites, "corrects," or supersedes a verified PDF entry. When an internet source contradicts a PDF source, both are kept separately (Law 8).

**11. Every research addition must be traceable back to its original source.**
No addition is anonymous. Every appended entry records its source (book/website), author, page or URL, upload/research date, and confidence level. An addition that cannot be traced is not stored.

**12. If an image, awfāq, talisman, manuscript page, or diagram is found, preserve the original image together with its complete citation.**
Images are original scans only — never redrawn or AI-recreated. Each image is stored with its source book, page, manuscript reference, and upload date. An image without a complete citation is not stored. The image and its citation are inseparable.

**13. Every card should continue evolving throughout the lifetime of this project.**
A card is never finished. It grows for as long as the project exists, accumulating every authentic source the owner supplies. The endpoint of each card is to be the definitive, fully-cited, multi-source, verbatim-accurate scholarly reference for its subject.

---

## Goal

To build the **world's most complete scholarly digital library for Sirr al-Huruf** — permanent, append-only, source-traceable, never-deleting, never-rewriting, with every statement cited and every disagreement preserved.

---

## Compliance Status (verified 2026-07-19)

| Law | Current compliance | Notes |
|---|---|---|
| 1 — PDF permanently indexed | ✅ | PDFs stored with permanent URL; book metadata recorded. |
| 2 — Per-paragraph full provenance | ◐ | Paragraphs carry Book (source_reference), Page, Upload date (imported_at), Card ID. Author/Edition/Publisher/Language/PDF-filename are carried within the source citation and the card's `sources[]` list; the schema should grow toward making each a first-class per-paragraph field. |
| 3 — Complete Sources section per card | ✅ | `sources[]` array on every card; UI renders the sources list. |
| 4 — Chronological history | ◐ | `imported_at` timestamps on each entry; a dedicated chronological history view is a future enhancement. |
| 5 — Compare before append | ✅ | Dedup by exact `text + source + page` in ingestion + enrichment. |
| 6 — Never delete automatically | ✅ | All functions are append-only; no auto-deletion. |
| 7 — Never replace older with newer | ✅ | Append-only; alternates go to `alternate_*` arrays. |
| 8 — Disagreeing sources preserved separately | ✅ | Per-source independent entries; never merged. |
| 9 — Search existing DB before internet | ✅ | Enrichment reads the card first; PDF knowledge is the base. |
| 10 — Internet enriches, never replaces PDF | ✅ | `enrichSectionCScholarly` appends only, never overwrites. |
| 11 — Every addition traceable | ✅ | Each entry carries source + page (+ URL) + timestamp. |
| 12 — Images keep citation | ✅ | Image arrays carry source references; original scans only. |
| 13 — Cards evolve forever | ✅ | Living-library architecture; no terminal version. |

✅ = fully compliant today · ◐ = compliant in principle, schema/UI should grow toward the fuller form described in the law.

---

## What This Law Forbids

- ❌ Treating the database as an application with disposable state.
- ❌ Storing a paragraph without its full provenance link.
- ❌ Deleting or rewriting existing entries automatically.
- ❌ Letting a newer source overwrite an older one.
- ❌ Merging disagreeing sources into one statement.
- ❌ Internet research that replaces verified PDF knowledge.
- ❌ Storing an image without its complete citation.
- ❌ Declaring any card "finished."

---

*This is the final permanent database law for the Sirr al-Huruf project. It applies to every future update, in every version, without expiration. Together with `SIRR_AL_HURUF_RESEARCH_LAW.md` and `SECTION_C_LIVING_LIBRARY_LAW.md`, it defines the permanent scholarly-library constitution of this project.*