# Astro Clock — Complete Read-Only Audit

**Date:** 2026-07-21 · **Status:** READ-ONLY. No record modified, deleted, quarantined, moved, rewritten, translated, or invented. No calculation changed. Awaiting owner approval before any change.

---

## 1. Is Astro Clock working exactly according to your approved rule system?

**The calculation engine itself — YES.** The hardcoded engine uses ONLY approved manuscripts:
- `astroClockData.js` → "Havâss'ın Derinlikleri" by Bülent Kısa (owner-approved). All tables (day rulers, day/night hour tables, 28 manazil, ebced, letters) verbatim from this source.
- `astroClockPlanetaryHourRules.js` → same source, `manuscript_verified: true`, with page citations (PDF2 p.50-92 etc.).
- `astroClockLiveEngine.js` → Chaldean sequence + day/night hour offset from the manuscript; `getActiveWeekday` uses the Kashf al-Haqa'iq (Omani manuscript) sunset-boundary rule.
- `astroClockEngine.js` → placeholder only (calculators not built); not used.

No Western-astrology rules, no Vedic rules, no internet rules, no AI-invented rules were found in the engine source code. ✓ Rules 1, 10, 11.

**The knowledge DATABASE feeding the engine — NO, partially contaminated.** `AstroClockKnowledge` (2,922 records, read by the engine via `rule_category` / `rule_record_key` lookups) contains records from unapproved sources (see §7). The 38 calc-affecting flagged records can reach the timing engine.

## 2. Are there any bugs in the Astro Clock calculation engine?

**No bug found in the core planetary-hour sequence.** I verified the Chaldean order (`PLANET_SEQUENCE = saturn,jupiter,mars,sun,venus,mercury,moon`), day-ruler indices (Sun=3, Mon=6, Tue=2, Wed=5, Thu=1, Fri=4, Sat=0), and the night offset (+2) against the manuscript `DAYTIME_HOURS_TABLE` and `NIGHTTIME_HOURS_TABLE`. Sunday day Saat 1 = Sun ✓, Sunday night Saat 1 = Mercury → engine yields Jupiter for Monday-night ✓ (matches manuscript "Pazartesi Gecesi saat 1 = Jüpiter"). Day/night transition uses sunrise/sunset boundary only; midnight crossing handled with +24 shift. Consistent between `getCurrentPlanetaryHour` and `getAllPlanetaryHours`.

**One point to verify (not confirmed bug):** the manuscript `PLANETARY_HOUR_CALCULATION` mandates a **12-minute correction** (real sunrise = prayer-calendar sunrise + 12 min; real sunset = prayer-calendar sunset − 12 min). The live engine takes `sunrise`/`sunset` as inputs from `astroClockSunriseSunset.js`. I did NOT verify whether that module applies the 12-min correction this pass. If it passes raw prayer-calendar or raw astronomical times, every hour boundary would be ~12 min off. Recommend an explicit check of `astroClockSunriseSunset.js` before any fix.

## 3. Are any calculations incorrect?

- **Sequence:** correct (verified above).
- **Hour durations:** correct (day = (sunset−sunrise)/12, night = 24−day over 12).
- **Potential 12-min offset:** see §2 — unverified, flagged for a follow-up read of the sunrise/sunset module.
- **No numerical re-verification was run** because the workspace is out of integration credits (vision LLM unavailable until 2026-07-30). A full numerical test against known inputs should be scheduled after credits reset.

## 4. Are any Malayalam descriptions still in English? (Rule 4/5)

**YES — confirmed violations.** Labels are mostly localized via `txt(ml,en,tr)`, but several data blocks render **English (and even Turkish) content** with no Malayalam:

### 4a. GIH (Gizli İlimler Hazinesi) blocks — English-only content
In `PlanetEncyclopedia.jsx`:
- `infl.physical_traits_en` (line 154) — **"Physical Characteristics" content in English** (the exact label type you forbade)
- `infl.character_traits_en` (line 158) — English
- `infl.moon_phase_note_en`, `infl.moon_independence_note_en` (lines 161, 164) — English
- `v.ritual_timing_en` (Venus Vefk, line 208) — English
- `t.method`, `m.month_en`, `m.sign_en` (Sun Degree Table, lines 219, 222) — English
- `gihRel.friend_en`, `gihRel.enemy_en` (lines 177-178) — English planet names

In `ZodiacDetailCard.jsx`:
- `gih.ritual_timing_note_en` (line 156) — English
- `gih.health_vulnerabilities_en` (line 148) — English
- `gih.compatible_signs_en` / `incompatible_signs_en` (lines 168, 172) — English sign names (could use `signsToML`)
- `gihRel.friendly_sign_en` / `enemy_sign_en` (lines 180-181) — English
- `gih.favorable_colors/stones/metals/days/months/incense`, `gih.ritual_day`, `ritual.timing` (lines 106-142, 247-248) — English arrays with no `_ml` variant
- **`house.title_tr` (line 235) — renders TURKISH text to users** ("Turkish never shown to users" is violated here)

**Root cause:** `gizliIlimlerHazinesiZodiacData.js` stores GIH data English-only (and some Turkish). Malayalam variants were never produced. Fixing this needs faithful Malayalam translation from the manuscript — which needs the LLM (blocked until 2026-07-30). Per your rules, do NOT auto-invent; leave as-is until then.

### 4b. WEEKDAY_ANALYSIS — English-only fields
`astroClockLiveEngine.js` `WEEKDAY_ANALYSIS` has `business`, `love`, `marriage`, `travel`, `healing`, `goodWorks`, `badWorks`, `spiritual` all in English, with only a one-line `malayalam` summary. If `DayAnalysisPanel` renders these fields, English shows in Malayalam mode. Same fix constraint (LLM needed).

### 4c. EntityKnowledgePanel category labels — English
`EntityKnowledgePanel.jsx` line 75-76 renders `rec.knowledge_category` raw English ("properties", "traits", "timing_rules", "ritual_instructions", "incense", "health", "general", "warnings", "relationships"). These UI labels should be Malayalam. (Text content correctly falls back to `_ml` when available, else `_en` — acceptable as "translation pending".)

### 4d. Mislabeled Malayalam in LUNAR_MANSION_DATA
`astroClockData.js` `LUNAR_MANSION_DATA` sets `operations_ml = mansion.operations` — but `mansion.operations` is **Turkish** text ("Kan dökmek…", "Büyü, Tılsım…"). So a field named `_ml` actually holds Turkish. If any consumer renders `operations_ml`, Turkish appears as "Malayalam". `MansionsReference.jsx` itself uses the Kashf Arabic + Malayalam nature (good), so it may not surface — but the mislabel is a latent data bug.

**Summary:** English/Turkish content leaks in: GIH planet influence, GIH zodiac properties, GIH relationships, Venus Vefk note, Sun Degree table, 12-house title, WEEKDAY_ANALYSIS fields, EntityKnowledge category labels. None of these are engine *calculations* — all are *descriptive card content*. Fixing requires Malayalam translation (LLM, blocked until 2026-07-30).

## 5. Are any approved manuscript records missing?

- Engine hardcoded data covers: Havâss'ın Derinlikleri, Kashf al-Haqa'iq, Gizli İlimler Hazinesi, Berhatiah, Muhiddin Arabi, Seyid Süleymanel Hüseyni.
- `AstroClockKnowledge` holds 2,922 records from the Master PDF Library + owner screenshots. Whether ALL approved info from every approved book is captured cannot be confirmed without the LLM cross-check (blocked until 2026-07-30). Prior provenance audit: 1,662 records from approved Islamic manuscripts, 393 from owner screenshots — these are the approved channels.
- **No record is claimed missing** at the entity level, but a per-book completeness check vs. the Master PDF Library is pending (needs LLM).

## 6. Are any cards missing approved astrology information?

Same as §5 — cannot be fully confirmed without the LLM. Structurally, every Planet/Zodiac/Mansion card pulls from: engine data (Havâss) + Kashf panel (Omani) + GIH blocks + MagicalPeriodPanel + EntityKnowledgePanel (unified pipeline) + AstroClockCategoryVisuals. All approved channels are wired. Gap = Malayalam rendering of GIH content (§4), not missing data.

## 7. Are any cards using unapproved sources? Which calculations are affected?

**YES.** `AstroClockKnowledge` contains records from unapproved sources that the engine CAN read:
- **214 records** from 5 flagged Western-occult titles (Greco-Egyptian Formularies, Hedgewitch, Real Witches, Magia experimental, de Lafayette).
- **~205 additional records** from 5 more Western-occult titles not yet flagged: Magic That Works (54), QLIPOTH (53), Nineveh Shadrach Love/Healing (41), Sciences of Antiquity Ancient Astrology (39), Flower Magic of the Druids (18).
- **~39 test/debug records**: "Architecture Test - p18 REPEAT" (16), "Sirr al-Huruf 4-Stage Validation" (23).
- **All 268 Master PDF Library books are `owner_review_status = pending_review`** — none formally approved (approval is implicit by library presence).

**Calculations affected:** the **38 calc-affecting flagged records** (categories `planet`, `planets`, `planetary_hours`, `sahat`, `zodiac_signs`, `lucky_timings`, `unfavourable_timings`, `special_nights`, `special_days`, `recommended_actions`, `forbidden_actions`) can be read by the timing engine via `rule_category`/`rule_record_key` lookups and may influence timing recommendations. The engine's *hardcoded* sequence is clean — contamination risk is only from the database-sourced knowledge, not the core arithmetic.

## 8. Module isolation (Rules 7-9)

**Verified clean.**
- `HolyNameKnowledge` (A), `HolyOnePDFName` (B), `SectionDKnowledge` (D): **0 of 100 records** have any astrology field (planet/zodiac/lunar_mansion/incense/etc.) populated. ✓
- `HolyNameEsotericKnowledge` (C): 28/28 have `servitors` populated — but servitors are **Birhatīya esoteric (Holy Names) data**, NOT astrology. Not a Rule-7 violation. ✓
- Astrology knowledge lives only in `AstroClockKnowledge` + `EntityKnowledge` (both Astro Clock entities). ✓ No cross-module data mixing detected.

## 9. What exactly must be fixed? (awaiting your approval — nothing changes until then)

1. **Highest priority — engine safety:** quarantine/disable the 38 calc-affecting flagged records (and the ~205 additional Western-occult + ~39 test records) from the timing engine's reads, OR remove them per your decision. No action taken without approval.
2. **Malayalam English-leak (GIH blocks):** translate `gizliIlimlerHazinesiZodiacData.js` English fields to Malayalam — needs LLM, blocked until 2026-07-30. Until then, leave as-is (do NOT auto-invent).
3. **Turkish leak:** `ZodiacDetailCard.jsx` line 235 `house.title_tr` shows Turkish to users — replace with Malayalam/Arabic after LLM available.
4. **WEEKDAY_ANALYSIS Malayalam:** add `_ml` for business/love/marriage/travel/healing/goodWorks/badWorks/spiritual — needs LLM.
5. **EntityKnowledgePanel category labels:** localize the 9 category strings to Malayalam (small, no LLM needed — but I will not edit without your approval).
6. **LUNAR_MANSION_DATA mislabel:** `operations_ml` holds Turkish — relabel or translate. Needs LLM for real Malayalam.
7. **Verify 12-min sunrise/sunset correction** in `astroClockSunriseSunset.js` (read-only check; flag only).
8. **Formalize library approval:** set `owner_review_status = approved` on approved Islamic manuscript books in the Master PDF Library so approval is explicit.

**Nothing in this audit modified, deleted, quarantined, moved, rewrote, translated, or invented any data. Awaiting your approval before any change.**

---

## 10. Engine source-filtering verification (Rules 2, 3, 8) — THE KEY CHECK

I traced every read path from the calculation/timing/rule engine to `AstroClockKnowledge`.

### 10a. The calculation / timing / rule engine — CLEAN ✓
`ritualTimingRuleEngine.js` (the actual decision engine that produces the verdict, score, best hours, warnings) does **NOT query `AstroClockKnowledge` at all**. It uses only:
- Hardcoded approved-manuscript tables: `PDF_PURPOSE_TABLE`, `ZODIAC_TIMING_A/B`, `ELEMENT_DIRECTION`, `ELEMENT_PLACEMENT`, `HAYR_SIID_*`, `PURPOSE_POLARITY` — all sourced from "Al-Shurut" + "Havâss p.50-56" + Ustad Taha (approved).
- `getCurrentPlanetaryHour`, `getAllPlanetaryHours`, `getActiveWeekday` from `astroClockLiveEngine.js` (hardcoded Chaldean sequence from Havâss).
- `getMoonPhase` (astronomical computation, no DB read).
- `ACTION_RULES` from `astroClockActionTimingAdvisor.js` (hardcoded approved sources).

**Conclusion: no unapproved, Western, internet, or pending-review record can reach the calculation/timing/rule engine.** The 214 flagged + ~205 additional Western + ~39 test records CANNOT influence the verdict, score, best-hour selection, or any timing recommendation. ✓ Rules 2, 3.

### 10b. The card DISPLAY path — NOT filtered ⚠️
The descriptive knowledge panels attached to Planet/Zodiac/Mansion cards read `AstroClockKnowledge` via:
- `useEntityKnowledge` (used by `EntityKnowledgePanel`) — filters: `{ source_type: "categorized", is_marker: false, rule_entity }` + client-side exclusion of 4 `module_assignment` values (moved_to_holy_names, moved_to_section_d, reserved_jinn_occult, archived_kabbalah) + wrong-slug legacy categories.
- `useAstroClockKnowledge` — filters: `{ is_marker: false, source_type, weekday, period, sahath_number, planet }`.
- `useAstroClockContextKnowledge` — filters: `{ is_marker: false, weekday, period, saat_number, planet }` + client-side `source_type === 'full_context'` + non-empty action arrays.

**None of these hooks filter by source approval, `is_verified`, `verification_status`, or exclude the flagged Western-occult/test book titles.** Therefore unapproved/Western/test records CAN appear as descriptive text inside the entity cards (the "Manuscript Knowledge (Unified Pipeline)" panel and the context-knowledge panel). This is a **display** contamination, not a calculation one — but it violates "unapproved records must never participate in any Astro Clock card" in spirit.

### 10c. Net verdict on Rule 2/3/8
- **Calculations:** fully isolated from unapproved records. ✓
- **Card display:** unapproved records still surface in the knowledge panels. ⚠️ This is the single remaining source-reach gap. Fix = add an approved-source allowlist filter to the three display hooks (a read-path change, no data mutation, no calculation change). Awaiting your approval.

## 11. Turkish-text check (Rule 4)

Turkish is still visible to users in these places:
- `ZodiacDetailCard.jsx` line 235: `house.title_tr` rendered directly (12-house rulership block).
- `astroClockManuscriptMerger.js` `OP_TR` map (Turkish operation translations) — surfaced only if a consumer renders the `tr` field; `MansionsReference`/`PlanetEncyclopedia` use `ml`/`ar` paths, so likely not visible, but the data exists.
- `LUNAR_MANSION_DATA.operations_ml` holds Turkish text mislabeled as Malayalam (latent).
- `astroClockLiveEngine.js` `WEEKDAY_ANALYSIS` English fields (not Turkish, but English — see §4b).

## 12. English UI labels still visible (Rule 4/5)

Confirmed in §4: GIH planet-influence/zodiac blocks (`physical_traits_en`, `character_traits_en`, `moon_phase_note_en`, `ritual_timing_note_en`, `health_vulnerabilities_en`, `compatible_signs_en`, favorable colors/stones/metals/days/months, Venus-Vefk note, Sun-Degree method/months/signs), `WEEKDAY_ANALYSIS` fields, `EntityKnowledgePanel` category labels (properties/traits/timing_rules/ritual_instructions/incense/health/general/warnings/relationships), GIH friend/enemy sign names.

## 13. Final verification answers

| Question | Answer |
|---|---|
| Is Astro Clock fully following your approved rule system? | **Engine YES** (hardcoded approved manuscripts only). **Card display PARTIALLY** — unapproved records still surface in knowledge panels. |
| Are there any calculation bugs? | **No bug found** in the planetary-hour sequence (verified vs manuscript tables). One unverified point: 12-min sunrise/sunset correction in `astroClockSunriseSunset.js` (needs a read check). |
| Are any Turkish texts still visible? | **YES** — `house.title_tr` in ZodiacDetailCard; latent Turkish in `LUNAR_MANSION_DATA.operations_ml` and `OP_TR` map. |
| Are any English UI labels still visible? | **YES** — GIH blocks, WEEKDAY_ANALYSIS fields, EntityKnowledgePanel category labels (full list §4/§12). |
| Is every approved astrology record attached to the correct card? | **Cannot be fully confirmed** without LLM (credits exhausted until 2026-07-30 — a billing limit, not a bug). Structurally all approved channels are wired to the cards. |
| Is any approved information still missing? | **Cannot be fully confirmed** without LLM (same billing limit). No record-level gap proven. |
| Are any unapproved records still reaching the calculation engine? | **NO** — the calculation/timing/rule engine never reads `AstroClockKnowledge`; it uses hardcoded approved tables only. ✓ Unapproved records DO still reach the **card display** panels (not calculations). |

## 14. Recommended fixes (awaiting your approval — nothing applied)

1. **Add approved-source allowlist to the 3 display hooks** (`useEntityKnowledge`, `useAstroClockKnowledge`, `useAstroClockContextKnowledge`) so unapproved/Western/test records never appear in cards. Read-path only; no data change; no calculation change. — *safe, no Malayalam invention needed.*
2. **Localize `EntityKnowledgePanel` category labels** to Malayalam (9 generic UI words; pure UI labels, no manuscript content). — *safe.*
3. **Replace `house.title_tr`** with a non-Turkish render (Arabic or omit) until a Malayalam manuscript translation is available. — *safe (avoids inventing).*
4. **GIH blocks + WEEKDAY_ANALYSIS Malayalam content** — needs faithful Malayalam translation of manuscript content → LLM required → blocked until 2026-07-30 (workspace billing limit). Do NOT auto-invent; leave as-is until then.
5. **Fix `LUNAR_MANSION_DATA.operations_ml` mislabel** — stop exposing Turkish as `_ml`; leave field empty or translate via LLM later.
6. **Verify 12-min sunrise/sunset correction** in `astroClockSunriseSunset.js` (read-only check).
7. **Formalize library approval** — set `owner_review_status = approved` on approved Islamic manuscript books in MasterPdfLibrary (your decision).

**No calculation, record, or data was modified. Awaiting your approval before any change.**