# Astro Clock — Complete Module Audit (READ-ONLY)

**Generated:** 2026-07-21
**Status:** READ-ONLY. No record was added, removed, quarantined, or modified. No calculation was changed. Waiting for owner approval before any modification.

---

## A. Permanent-rule enforcement status

| Rule | Status |
|---|---|
| 1. Astro Clock uses ONLY owner-approved Islamic astrology sources | **Partially violated** — see §B. The owner's curated Master PDF Library provides 1,662 records from approved Islamic/esoteric manuscripts, but the module also contains 214 records from 5 Western-occult titles (flagged) + ~245 records from additional Western-occult titles not yet flagged (see §B-3). |
| 2. Holy Names A/B/C/D never receive astrology data | **Enforced at schema level** — Holy Name entities have no astrology fields populated; cross-reference is link-only. No ACK data flows into Holy Names. (Not re-verified record-by-record this pass.) |
| 3. Never mix data between modules | **Held** — ACK, SectionD, HolyName*, Sirr* are separate entities; no cross-write detected in this read-only scan. |
| 4. Never use Western / Wicca / Hermetic / Greco-Egyptian / Witchcraft / internet rules | **Violated** — 214 flagged records from 5 Western-occult titles are present in `AstroClockKnowledge` (see prior audit doc). An additional ~245 records from 5 more Western-occult titles are also present but not yet flagged (§B-3). |
| 5. Never infer or invent data | **Cannot be re-verified this pass** — verifying text fidelity / Malayalam correctness needs the vision LLM, which is unavailable (workspace out of integration credits until 2026-07-30). Structural completeness checks done instead (§D). |

---

## B. Provenance of all 2,922 AstroClockKnowledge records

- **Total records:** 2,922 (2,700 real + 222 `scan_marker` end-of-book markers)
- **Master PDF Library:** 268 books — **all `owner_review_status = pending_review`** (the formal approval flag is unused; approval is effectively "presence in the owner's curated library").

| Provenance | Records | Notes |
|---|---|---|
| From library, non-flagged Islamic/esoteric manuscripts | 1,662 | Approved Islamic sources (e.g. مهج الدعوات, مجربات باقر, ديوان الأوفاق, sumusul-envar tilimsani, Berhatiah) |
| From library, flagged (de Lafayette) | 58 | Western occult, present in Drive live-index but never owner-approved |
| Not in library — flagged Western occult (other 4) | 156 | Greco-Egyptian 57, Hedgewitch 52, Real Witches 24, Magia experimental 23 |
| Not in library — owner-uploaded screenshots | 393 | Approved channel (owner screenshots) |
| Not in library — other titles | ~651 | Mix of Islamic manuscripts ingested outside the library + additional Western occult + test/debug |
| No source title | 2 | — |

### B-3. Additional Western-occult sources NOT in the original 5 flagged
These appear in Astro Clock but were not part of the original 5 flagged. Recommend the owner review them next (do NOT remove without approval):
| Title | Records |
|---|---|
| Frances Harrison Nineveh Shadrach — Magic That Works (Practical Training) | 54 |
| QLIPOTH | 53 |
| Nineveh Shadrach — Love Healing Prosperity Through Occult Powers | 41 |
| Sciences of Antiquity — Tamysn Barton — Ancient Astrology (2002/1994) | 39 |
| Flower Magic of the Druids — Jon G. Hughes | 18 |
| **Subtotal additional Western-occult** | **~205** |

### B-4. Likely test / debug records in production Astro Clock
These look like test/validation artifacts and should be reviewed for removal (do NOT remove without approval):
| Title | Records |
|---|---|
| `Architecture Test - p18 REPEAT` | 16 |
| `Sirr al-Huruf 4-Stage Validation` | 23 |

---

## C. Is Astro Clock still working per the rule system you provided?

- **Engine files exist and are wired per the constitution:** `astroClockEngine.js`, `ritualTimingEngineV3.js`, `astroClockPlanetaryHourRules.js`, `mizaanSaatCalculator.js`, `astroClockSunriseSunset.js` (live sunrise/sunset), `astroClockMoonPosition.js`. Per the constitution, calculations use live astronomy + approved manuscript rules only.
- **Are all calculations following only your approved rules?** The engine reads `AstroClockKnowledge` by `rule_category` / `rule_record_key` / `full_context_key`. **Risk:** the 38 calc-affecting flagged records (categories `planet`, `planets`, `planetary_hours`, `sahat`, `zodiac_signs`, `lucky_timings`, `unfavourable_timings`, `special_nights`, `special_days`, `recommended_actions`, `forbidden_actions`) **can currently be read by the timing engine** and may pollute timing recommendations. These 38 are the highest-priority subset for your review. **No calc-affecting record will be modified until you approve.**
- **Logic bugs / incorrect calculations:** A full numerical re-verification requires running the engine against known inputs and (for Malayalam/text fidelity) the vision LLM, which is unavailable until 2026-07-30 (integration credits exhausted). No logic change was made or is proposed here. Recommend a dedicated numerical re-verification pass after credits reset.

---

## D. Data completeness & quality

### D-1. Malayalam translation gap
- **2,458 of 2,700 real records (91%) have English text but NO Malayalam translation** (`knowledge_text_ml` empty). Per the constitution, missing Malayalam should be labeled "Malayalam translation pending" — currently the field is simply empty (no label). Auto-generating faithful Malayalam needs the LLM (blocked until 2026-07-30).
- **0 records** have Malayalam but no English. **0 records** have both text fields empty (no empty/incomplete cards beyond markers).

### D-2. Duplicates
- Duplicate `content_hash` groups: **1** (near-zero true duplicates — good).
- Duplicate `rule_record_key`: 0. Duplicate `full_context_key`: 0.

### D-3. Category data-quality issues (malformed categories from LLM extraction)
Categories containing underscores between every letter — extraction artifacts, ~10 records total:
`i_n_v_o_c_a_t_i_o_n_s` (2), `m_u_j_a_r_r_a_b_a_t` (1), `r_i_t_u_a_l_s` (1), `l_u_c_k_y_t_i_m_i_n_g_s` (2), `s_p_e_c_i_a_l_n_i_g_h_t_s` (1), `c_o_r_r_e_s_p_o_n_d_e_n_c_e_s` (1). These records exist but won't match engine category lookups (harmless but messy).

### D-4. Missing category (incomplete cards)
- **302 records have no `rule_category` ("(none)")** — incomplete classification. These won't be reachable by category-based engine queries or category filters.

### D-5. Misplaced records
- The 214 flagged Western-occult records and the ~205 additional Western-occult records (§B-3) are misplaced in an Islamic-astrology-only module per the constitution.
- The ~39 test/debug records (§B-4) are misplaced in production.

### D-6. Missing approved knowledge
- **0 books in the Master PDF Library are marked `owner_review_status = approved`** — so formally, no library source has been owner-approved. Practically, 1,662 records come from the owner's curated Islamic manuscripts (treated as approved by presence). To make approval explicit, the owner should set `owner_review_status = approved` on the approved Islamic manuscript books in the Master PDF Library.

---

## E. Owner Approval Queue (the 214 flagged records)

A read-only, admin-gated review page is now live at **`/admin/astro-approval-queue`**.
For every flagged record it shows: Record ID, Card title, Source book, Source page, Category, Exact extracted text (EN/AR/ML where present), and a badge classifying it as **Affects calculations** (38) or **Descriptive only** (176). Filterable by book, calc-affecting-only, and free-text search. No edit / delete / quarantine controls — read-only.

---

## F. Recommended actions (awaiting owner approval — nothing will change until then)

1. **Review the 38 calc-affecting flagged records first** at `/admin/astro-approval-queue` (filter: calc-affecting). These are the ones that can reach the timing engine.
2. **Decide per record:** keep as general-esoteric note, or remove. No removal will happen without your explicit approval.
3. **Expand the flag scope** to the ~205 additional Western-occult records (§B-3) — same read-only audit, on your request.
4. **Review the ~39 test/debug records** (§B-4) for removal.
5. **Malayalam gap (91%):** schedule faithful Malayalam translation after integration credits reset (2026-07-30). Until then, label empty ML as "Malayalam translation pending" (display-layer only — no record change proposed here).
6. **Formalize library approval:** set `owner_review_status = approved` on the approved Islamic manuscript books so approval is explicit, not implicit by presence.

**Nothing in this audit modified any record or any calculation. Awaiting your approval.**