# SECTION C — LIVING LIBRARY LAW
## The 28 Birhatīya (Barhatiah) Cards · Permanent Policy

**Established:** 2026-07-19 (Asia/Dubai)
**Scope:** `HolyNameEsotericKnowledge` (records HNK-MHC-001 … HNK-MHC-028), the Section C ingestion function (`ingestSectionCManuscript`), the scholarly enrichment function (`enrichSectionCScholarly`), and the Section C UI (`HolyNameEsotericResearchProfile`, `SectionCNames`).
**Status:** This law is PERMANENT and supersedes any prior "complete / frozen" status. Section C is a **living scholarly knowledge base** — it is never finished.

---

## 1. Core Principle

The current dataset is **Version 1** — a verified baseline, not the final version.

Section C must grow forever. Whenever new authentic information is found — from books, manuscripts, archives, or reliable scholarly websites — it is **appended** to the corresponding card. Nothing is ever overwritten. Nothing is ever deleted. Every source is kept separate. Differing scholarly opinions and differing ritual methods are displayed **independently**, each with its own full citation.

The goal: the world's most comprehensive Birhatīya knowledge library.

---

## 2. The Append-Only Rule (Absolute)

- **Never overwrite** any existing field, entry, or value.
- **Never delete** any existing record or source.
- **Never merge** differing opinions, methods, or alternate forms into a single entry.
- New findings **append** to the existing arrays (`scholarly_data`, `amal`, `khawass`, `mujarrabat`, `related_magic_squares`, `related_talismans`, `servitors`, `angels`, `invocation_wazifa`, `benefits`, `warnings`, etc.) as **new entries**, each carrying its own `source_reference` + `source_page` (+ `url` when from the internet).
- Deduplication is by **exact `(text + source_reference + source_page)`** — only byte-identical content from the same source+page is skipped. Semantically similar but differently-sourced content is **always kept**.
- The original `arabic_name`, `canonical_arabic_name`, `total_abjad_value`, `letter_count`, and `individual_letter_values` from Version 1 are the **seed baseline**; alternate spellings, pronunciations, meanings, and Abjad values go into the dedicated `alternate_*` arrays (append-only), never replacing the primary.

---

## 3. Per-Source Independence (Absolute)

If Book A and Book B give two different ritual methods for the same name, **both** are stored as separate entries in the same field, each with its own citation. The UI displays them as independent, side-by-side items — never combined, never summarized into one.

This applies to every multi-valued field: invocations, duʿās, mujarrabāt, khawāṣṣ, amal, awfāq, magic squares, talismans, khādim references, related servant invocations, conditions, repetitions, timings, days, planetary hours, incense, benefits, warnings, scholarly discussions, historical notes, and manuscript variants.

---

## 4. The Full Field Checklist (Target Per Card)

Each of the 28 cards should eventually contain, accumulated over time:

**Identity & Calculation**
- Complete Arabic name (with harakat, verbatim)
- Natural Malayalam meaning
- Exact Arabic text of every cited passage
- Letter count
- Individual Abjad value per letter (Mashriqi Great Abjad)
- Full Abjad calculation string
- Total Abjad value
- Meaning of every Arabic letter (when an authentic source provides it)

**Scholarly Context**
- Classical explanations
- Linguistic explanations
- All known variant spellings (`alternate_spellings`)
- Pronunciations (`alternate_pronunciations`)
- Historical references
- Contradicting scholarly opinions (kept separate, each attributed)

**Ritual Content** (every authentic instance, each with its source)
- Every authentic duʿā
- Every authentic invocation (wazīfah)
- Every mujarrab
- Every khawāṣṣ
- Every amal
- Every awfāq / magic square
- Every talisman
- Every khādim reference
- Every related servant invocation
- Conditions
- Number of repetitions
- Time
- Day
- Planetary hour — **only when found in authentic sources** (never invented)
- Incense
- Method of use
- Benefits
- Warnings
- Images of authentic awfāq and talismans (whenever available)

**Citation (mandatory on every entry)**
- Original Arabic exactly as printed
- Natural Malayalam explanation
- Complete source citation: book name · author · edition · publisher · page number
- URL (when from the internet)
- Confidence level (HIGH / MEDIUM / LOW)

Sections a source does not document stay empty and display the Malayalam placeholder — never filled by guesswork.

---

## 5. Acceptable Sources (in priority order)

1. **Classical manuscripts** (e.g. Aḥmad al-Būnī, *Manbaʿ ʾUṣūl al-Ḥikma*; *Shams al-Maʿārif*; *al-ʿAẓama* — authenticated critical editions).
2. **Printed scholarly books** with full bibliographic data (author, edition, publisher, page).
3. **Academic archives** and digitized manuscript libraries (archive.org, etc.).
4. **Reliable scholarly websites** — only when the owner explicitly authorizes an internet-research pass, and only with a working URL + confidence level.

Fabricated, AI-guessed, or unsourced content is **never** appended. When a source's authenticity is uncertain, it is stored with `confidence: LOW` and a note — never presented as established fact.

---

## 6. Internet-Research Gate

Internet-based enrichment runs **only** when the owner explicitly authorizes it ("now search the internet"). The `enrichSectionCScholarly` function is the sole path for this, and it:
- appends (never overwrites),
- keeps every new source separate,
- records the URL and confidence level on each appended entry,
- never invents content beyond what the source actually states.

PDF ingestion (`ingestSectionCManuscript`) is **vision-based verbatim transcription only** — no internet search, no AI knowledge.

---

## 7. Versioning

- **Version 1** (2026-07-19): the 28-card verified baseline — Abjad, letters, Malayalam meanings, and the first round of scholarly + ritual content. Certified by `SECTION_C_QUALITY_AUDIT_2026-07-19.md`.
- **Version 2, 3, …**: every future ingestion/enrichment pass that appends new authentic content. Each pass is logged; the per-card audit function (`auditSectionCQuality`) can be re-run at any time to verify integrity. The audit never deletes — it only verifies and (when the owner allows) translates English-only entries into natural Malayalam.

A card's `verification_status` may move between `unverified → verified → needs_review` as new conflicting sources arrive; it is never frozen.

---

## 8. Compliance (verified 2026-07-19)

| Component | Append-only | Per-source | No overwrite | Compliant |
|---|---|---|---|---|
| `ingestSectionCManuscript` | ✅ dedup by `text+source+page`, never deletes | ✅ each entry carries `source_reference`+`source_page` | ✅ only `.push` | ✅ |
| `enrichSectionCScholarly` | ✅ appends to arrays + `alternate_*` | ✅ URL + confidence per entry | ✅ never replaces primary fields | ✅ |
| `auditSectionCQuality` | ✅ translate-only on `exact_meaning`, never deletes | ✅ | ✅ | ✅ |
| `HolyNameEsotericResearchProfile` (UI) | n/a | ✅ each `scholarly_data` entry rendered separately with its source; each advanced-section entry shows its own `source_reference` | n/a | ✅ |
| `HolyNameEsotericKnowledge` schema | ✅ `FUTURE MERGE` + `alternate_*` arrays + per-entry `source_reference` | ✅ | ✅ | ✅ |

All components already comply with this law. No code change was required to enforce it — the law codifies the existing architecture as permanent policy.

---

## 9. What This Law Forbids

- ❌ Overwriting an existing Abjad value, letter count, or meaning with a "better" one (use the `alternate_*` arrays instead).
- ❌ Merging two sources' methods into one combined entry.
- ❌ Deleting an older entry because a newer source "corrects" it.
- ❌ Filling an undocumented section by inference or AI knowledge.
- ❌ Running internet enrichment without explicit owner authorization.
- ❌ Treating Version 1 as the final version.

---

*This document is the authoritative policy for Section C. It overrides any earlier "complete / frozen / final" statement, including the closing certification line of `SECTION_C_QUALITY_AUDIT_2026-07-19.md`.*