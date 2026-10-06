# Astro Clock — Complete Engine Verification Report
**Date:** 2026-07-29
**Scope:** ENTIRE engine — live astronomy, manuscript rules, search, database, performance
**Method:** Full source review of every core module + a **complete** scan of all 200 `AstroClockKnowledge` records (not a sample).
**Rule:** No UI changes. No invented manuscript logic. No engine modifications. Verification only.

Modules audited: `astroClockLiveEngine.js`, `astroClockSunriseSunset.js`, `astroClockGeolocation.js`, `astroClockMoonPosition.js`, `astroClockDecisionEngine.js`, `astroClockManuscriptMerger.js`, `astroClockSearch.js`, `semanticKnowledgeGraph.js`, `semanticReasoningEngine.js`, `astroClockPlanetaryHourRules.js`, `manuscriptRuleEngine.js`, `astroClockLiveAstronomy.js`, `astroClockJPLHorizons.js`, `astroClockData.js`, `useAstroData.js`, `SmartSearch.jsx`.

---

## Severity Scale
- **CRITICAL** — wrong output shown to users now, in a core layer.
- **HIGH** — correctness/integrity gap with real manuscript or scale impact.
- **MEDIUM** — bounded impact / hygiene.
- **LOW** — minor / future-proofing.

---

## ═══════════════════════════════════════════
## PRIORITY 1 — LIVE ASTRONOMICAL ENGINE
## ═══════════════════════════════════════════

### 1.1 CRITICAL — Lunar day computed from the wrong quantity
- **File:** `src/lib/astroClockMoonPosition.js` (returns `longitude`), `src/components/astroclock/dashboard/useAstroData.js:106`
- **Function:** `useAstroData` → `lunarDay`
- **Reason:** `lunarDay = Math.floor(parseFloat(moonPosition.longitude) / (360 / 29.53)) + 1`. `longitude` is the Moon's **absolute geocentric ecliptic longitude** (0–360° from the vernal equinox). The Hijri/tithi lunar day is the Moon's **age in days since the last conjunction** = function of the **mean elongation `D`** (Moon longitude − Sun longitude), not the Moon's absolute longitude. `D` is already computed in `calculateMoonPosition` (used for `isWaxing`/`phase`) but never used for `lunarDay`.
- **Manuscript impact:** `getKashfLunarDayInfo(lunarDay)`, `getKashfNahsStatus(lunarDay)`, the `KASHF_MONTH_DAYS` day-by-day guide, and the decision engine `sLunar` score + `lunarDay` layer are ALL fed a wrong day → wrong saad/nahs nature, wrong "Kamil unlucky day" flag, wrong avoid-list entries.
- **Astronomical impact:** The value is a 1–30 number but it is not the lunar day; it drifts continuously with the Moon's absolute longitude through the zodiac, not with the phase cycle.
- **Fix:** `lunarDay = Math.floor((D_normalized / 360) * 29.53) + 1`, with `D` exposed from `calculateMoonPosition`. Validate against a known Hijri date before shipping.
- **Difficulty:** Low (one line + expose `D`).

### 1.2 CRITICAL — Lunar mansion boundaries start at 0°, but the manuscript starts them at Aries 25°
- **File:** `src/lib/astroClockMoonPosition.js:130-139` (`findLunarMansion`), `src/lib/astroClockLiveAstronomy.js:107-127` (`getLiveLunarMansion`)
- **Function:** `findLunarMansion(longitude)` → `Math.floor(longitude / (360/28))`
- **Reason:** `AY_MANAZILLERI` (in `astroClockData.js`) gives explicit start degrees: mansion 1 (Sheratayn) = "Koç burcunun 25. Derecesi" (Aries 25°); mansion 2 (Buteyn) = Taurus 8°; etc. These start at **absolute 25° Aries**, each 12.857° wide, wrapping. The code instead divides 360° into 28 equal slices **from 0°**, so `findLunarMansion(25)` returns index 1 (Buteyn) when the manuscript says 25° = Sheratayn (index 0). The entire mansion assignment is offset by ~2 mansions for every longitude.
- **Manuscript impact:** The current mansion shown to users is wrong by ~2 mansions. Every mansion-dependent output — `mansionInfo`, `sMansion` score, special operations keyed to mansions, the Mansions Reference card's "current" highlight, Kashf Omani mansion operations — is against the wrong mansion.
- **Astronomical impact:** Equal-division-from-0 also ignores the sidereal reference (traditional manāzil are sidereal, not tropical). Two compounding errors: wrong origin (0° vs 25° Aries) and wrong frame (tropical vs sidereal).
- **Fix:** Add an origin offset (= 25° absolute, or the manuscript's sidereal reference point) and compute `mansionIndex = Math.floor(((longitude - ORIGIN) % 360 + 360) % 360 / (360/28))`. Decide tropical-vs-sidereal per manuscript policy and document it.
- **Difficulty:** Medium (needs a policy decision on tropical/sidereal + verification against a reference ephemeris).

### 1.3 HIGH — Moon transit times are fixed-spacing approximations, not calculations
- **File:** `src/lib/astroClockMoonPosition.js:190-260`
- **Function:** `calculateMoonTransits`
- **Reason:** Uses `moonSpeed = 0.5` deg/hour (average) and estimates next mansions as `i * 0.9 days`, next signs as `i * 2.5 days`. These are constants, not re-evaluations of the Moon's position at future instants.
- **Manuscript impact:** "Next mansion in X" / "next sign in Y" countdowns drift by many hours near perigee/apogee; users planning around a transit get wrong times.
- **Astronomical impact:** The Moon's speed varies 0.45–0.55°/h; fixed 0.5 accumulates ~±12h over a month.
- **Fix:** Iterate `calculateMoonPosition` forward (hourly, then bisection) until the boundary is crossed. Same ephemeris, exact instants.
- **Difficulty:** Low-Medium.

### 1.4 HIGH — JPL Horizons integration is broken; "arcsecond precision" is never delivered
- **File:** `src/lib/astroClockJPLHorizons.js:102-156` (`parseJPLResponse`), `:21-61` (`buildHorizonsUrl`)
- **Function:** `fetchFromJPLHorizons` / `parseJPLResponse` / `getEnhancedMoonPosition`
- **Reason:** (a) `CENTER: 'coord@399'` requires observer coordinates but none are passed in the params, so the API errors. (b) `parseJPLResponse` reads `jplData.data?.ephemeris?.data?.[0].RA` etc., but JPL Horizons returns ephemeris as a **text string** in `result`, not a structured JSON with `RA`/`DEC` fields. So `ephemeris.RA` is always undefined → returns null → `getEnhancedMoonPosition` always falls back to the local simplified calc. The "NASA JPL Horizons / arcsecond" status claims are false in practice.
- **Manuscript impact:** None directly (manuscripts don't require JPL), but the higher-precision path that *would* fix 1.2/1.8 is non-functional.
- **Astronomical impact:** Live moon longitude is always the truncated-series local value (~1–2° error), never arcsecond.
- **Fix:** Either (a) parse the JPL text ephemeris correctly and pass observer coords, or (b) remove the dead JPL path and explicitly label the local calc as the source of truth, or (c) wire the existing `getLiveMoonPosition` **backend** function (which may use a server-side ephemeris) into `useAstroData`.
- **Difficulty:** Medium (correct JPL text parsing is fiddly; backend ephemeris is cleaner).

### 1.5 MEDIUM — Sunrise/sunset day-of-year derived from browser-local date
- **File:** `src/lib/astroClockSunriseSunset.js:125-130` (`getDayOfYear`)
- **Function:** `getDayOfYear` (called by `calculateSunriseSunset`)
- **Reason:** `new Date(date.getFullYear(), 0, 0)` uses the **browser** timezone's year/midnight. `useAstroData` passes raw `now` (not `localNow`). For a user whose device timezone ≠ selected location, the day-of-year can be off by 1 around midnight, shifting sunrise/sunset by one calendar day.
- **Manuscript impact:** Wrong sunrise/sunset → wrong planetary hour boundaries → wrong day/night, wrong active weekday near sunset, wrong hour planet.
- **Astronomical impact:** Up to ~1 day error in sunrise/sunset for cross-timezone users.
- **Fix:** Pass `localNow` (location-shifted date) to `calculateSunriseSunset`, or compute day-of-year from the UTC instant + location offset.
- **Difficulty:** Low.

### 1.6 MEDIUM — GPS numeric `timezone` field can disagree with the IANA `tz`
- **File:** `src/lib/astroClockGeolocation.js:100-108` (`buildGpsLoc`)
- **Function:** `buildGpsLoc`
- **Reason:** `timezone: deviceTimezone()` (device offset, DST-aware) but `tz: ianaFromCoords(...)`. `useAstroData` correctly prefers the IANA `tz` via `getTzOffsetHours`, so the numeric field is harmless today — but it is semantically wrong and any legacy consumer reading `loc.timezone` gets the device offset, not the location's.
- **Manuscript impact:** None (IANA wins).
- **Astronomical impact:** None currently; latent bug if any consumer reads `timezone`.
- **Fix:** Set `timezone` to `getTzOffsetHours(tz, now)`, or drop the numeric field in favour of the IANA path.
- **Difficulty:** Low.

### 1.7 LOW — `getCurrentPlanetaryHour` has no timezone guard
- **File:** `src/lib/astroClockLiveEngine.js:276`
- **Function:** `getCurrentPlanetaryHour`
- **Reason:** Uses `date.getHours()`. Only correct when the caller passes a location-shifted date. `useAstroData` does this; any future direct caller passing `new Date()` would silently compute in browser time.
- **Fix:** Document the contract or accept an explicit decimal-hour input.
- **Difficulty:** Low.

### 1.8 LOW — Moon ephemeris is a truncated series; higher-precision path unused/broken
- **File:** `src/lib/astroClockMoonPosition.js` (truncated ELP), `astroClockJPLHorizons.js` (broken, see 1.4)
- **Reason:** ~1–2° typical error. Adequate away from mansion/zodiac boundaries; can mis-assign by one mansion near edges (compounds 1.2).
- **Fix:** Resolve 1.4 to get a real high-precision path; until then document the approximation.
- **Difficulty:** Medium (depends on 1.4 fix).

### 1.9 LOW (known) — Mansions tropical-equal, not sidereal
- **File:** `astroClockMoonPosition.js:130`, `astroClockLiveAstronomy.js:113`
- **Reason:** Traditional Arabic manāzil are sidereal (star-referenced); code uses tropical longitude from the vernal equinox. Already tracked; folded into 1.2's fix.
- **Difficulty:** Medium (policy decision).

---

## ═══════════════════════════════════════════
## PRIORITY 2 — MANUSCRIPT ENGINE
## ═══════════════════════════════════════════

### 2.1 HIGH — Conflicts are never detected or recorded
- **File:** Ingestion functions (`unifiedIngestKnowledge`, `classifyAndIngestScreenshot`, `enrichAstroClockFromManuscript`, etc.) — not populating `conflict_flags` / `conflicting_opinions`.
- **Evidence:** Full DB scan: **0 records** with `conflict_flags`, **0** with `conflicting_opinions`, **0** with `context_specific`.
- **Reason:** The schema supports per-field conflict detection, but no ingestion path compares field values across sources when merging by `canonical_key`/`rule_record_key`. Disagreements are appended to `supporting_sources` without flagging.
- **Manuscript impact:** Violates "never merge conflicting manuscripts; display each opinion separately". Two manuscripts disagreeing on a planet's nature would both be stored with no signal for the UI to render a "different manuscript opinion" subsection.
- **Fix:** Add a conflict-detection pass: when appending a new source to an existing key, compare shared fields (nature, element, suitable/unsuitable actions, etc.); on disagreement, push to `conflicting_opinions` and add the field to `conflict_flags` instead of overwriting. Then the UI renders them separately.
- **Difficulty:** Medium.

### 2.2 HIGH — Western occult source present in the Astro Clock knowledge base
- **Evidence:** Full DB scan — 23 of 200 records (12% of non-marker records) have `source_book_title = "Magia experimental practica - Gian Piero Bona.pdf"` (a Spanish/Western ceremonial magic text). Category breakdown includes `lucky_timings` (16), `rituals` (7), `khawass` (6), `mujarrabat` (3), `stones` (3) etc. populated partly from this source.
- **Reason:** Ingestion accepted a non-manuscript (Western esoteric) book into `AstroClockKnowledge`, violating the strict manuscript-only rule.
- **Manuscript impact:** Western occult rulings are presented alongside Havâss/Kashf with no separation; users may receive non-manuscript guidance as if it were manuscript-derived.
- **Fix:** Quarantine the 23 records (flag `verification_status` / move to a separate review queue); add a source-whitelist gate in the ingestion path (only approved manuscript books may write to `AstroClockKnowledge`).
- **Difficulty:** Low (gate) + Medium (review of the 23 records).

### 2.3 HIGH — 200/200 records are unverified (`is_verified = false`)
- **Evidence:** Full scan — `unverified: 200, verified: 0`.
- **Reason:** The `is_verified` gate exists on the schema but no verification pass has ever flipped a record to true. The decision engine doesn't read this entity yet, but for the DB-driven future every served record must be verified.
- **Manuscript impact:** No verified knowledge can be served by a future DB-backed engine without a verification pass first.
- **Fix:** Run the existing `verifyKnowledgeEntry` / `verifyManuscriptDatabase` functions over `AstroClockKnowledge`; gate all DB reads on `is_verified = true`.
- **Difficulty:** Low-Medium.

### 2.4 MEDIUM — Decision engine reads static JS modules, not the `AstroClockKnowledge` DB
- **File:** `src/lib/astroClockDecisionEngine.js` imports `PLANETARY_HOUR_RULES`, `KASHF_*` from hardcoded JS.
- **Reason:** Manuscript rules ingested into the DB are not reflected in live recommendations until manually transcribed into the static modules.
- **Manuscript impact:** New books ingested into the DB do not influence the dashboard. Limits the "hundreds of manuscripts" goal.
- **Fix:** Route the decision engine through a DB-backed rule lookup (server-side, indexed by `rule_record_key` / `full_context_key`).
- **Difficulty:** Medium-High (needs a backend rule resolver + caching).

### 2.5 MEDIUM — Special-operation detection is English-keyword only
- **File:** `src/lib/astroClockDecisionEngine.js:64-76` (`isSpecial`)
- **Reason:** Matches an English keyword list. Arabic-only manuscript operations (e.g. `mansionInfo.operation_ar`) are passed through `isSpecial` but Arabic text won't contain English keywords, so they never classify as special.
- **Manuscript impact:** Arabic/Kashf special operations are under-surfaced.
- **Fix:** Add Arabic + Malayalam keyword lists, or match against a normalized concept id.
- **Difficulty:** Low.

### 2.6 LOW (intentional) — `dedupOps` keys on English text only
- **File:** `astroClockDecisionEngine.js:107-117`
- **Reason:** Operations with identical meaning but different wording across manuscripts are kept separate — correct per the no-merge rule. Documented as intentional.

---

## ═══════════════════════════════════════════
## PRIORITY 3 — DATABASE INTEGRITY
## ═══════════════════════════════════════════

### 3.1 PASS — No duplicate keys or content hashes across the entire DB
- **Evidence:** Full scan of all 200 records: `duplicateRecordKeys: 0`, `duplicateFullCtx: 0`, `duplicateHashes: 0`, `duplicateCanonical: 0`. Insert-time dedup is working.

### 3.2 PASS (design) — Append-only merge fields present
- `supporting_sources`, `conflicting_opinions`, `context_specific` exist on the schema. Whether every ingestion function honours them needs a per-function review (not in this audit's scope).

### 3.3 MEDIUM — 52/200 records (26%) are markers (no knowledge)
- **Evidence:** `markers: 52`, top category `scan_marker: 52`.
- **Reason:** `is_marker` records are "entry analyzed but no knowledge found, never displayed". They consume 26% of the collection. As the library grows to millions, markers will dominate storage.
- **Fix:** Exclude markers from ingestion (don't write them), or prune existing markers, or move to a separate low-priority store.
- **Difficulty:** Low.

### 3.4 MEDIUM — Zero `full_context` timing records in the DB
- **Evidence:** `sourceTypeBreakdown: { categorized: 200 }`. No `full_context` / `planetary_hour` timing records exist.
- **Reason:** The schema's class (B) timing records (indexed by `weekday|period|saat_number|planet|nakshatra`) are absent. The Ritual Timing Engine is documented to read these, but none exist — so a DB-backed timing engine has no data.
- **Fix:** Migrate the `PLANETARY_HOUR_RULES` / `KASHF_OPERATION_TIMING` timing data into `full_context` records, or document that the timing engine will remain static-JS-backed.
- **Difficulty:** Medium.

### 3.5 LOW — Indexes declared; verify physically created
- The schema declares `idx_content_hash`, `idx_canonical_key`, `idx_rule_record_key`, `idx_full_context_key`, etc. Run `verifyDatabaseIndexes` to confirm they exist in production.

---

## ═══════════════════════════════════════════
## PRIORITY 4 — INTELLIGENT SEARCH ENGINE
## ═══════════════════════════════════════════

### 4.1 HIGH — Semantic graph lacks harmful/negative canonical actions
- **File:** `src/lib/semanticKnowledgeGraph.js` (+ `semanticKnowledgeGraphV2.js`)
- **Reason:** The graph has 12 V1 + 24 V2 entries — almost all positive/neutral (construction, travel, marriage, business, medical, love, protection, wealth, knowledge, spiritual, courage, buying, selling, surgery, education, exams, employment, promotion, trade, partnership, contracts, house_building, planting, harvesting, ruqyah, prayer, dhikr, charity, hajj, umrah). **Missing as canonical actions:** separation, divorce, exile, banish, expel, deport, punishment, torture, imprisonment, enemy-work, destroy, curse, binding, silencing, fire-operations, hatred, repelling, strife/war.
- **Manuscript impact:** The Kashf data *does* contain these (e.g. `kashf_timing_009` "Separation, hatred, repelling enemies", `kashf_timing_010` "Fire operations", `kashf_timing_011` "Permanent binding", `kashf_timing_012` "Causing war") but they are not reachable through semantic search. Searching "exile", "banish", "deport", "punishment", "imprisonment", "destroy" resolves to nothing. Violates "users must be able to discover harmful, neutral and beneficial operations equally well".
- **Fix:** Add canonical entries for the harmful/specialised operations attested in Kashf, with ml/ar/en synonyms, and wire them to the Kashf operation records.
- **Difficulty:** Medium (data work + multilingual synonyms).

### 4.2 HIGH — Duplicate/dead literal search path (`astroClockSearch.js`)
- **File:** `src/lib/astroClockSearch.js`
- **Reason:** `searchAstroClockKnowledge` is literal `includes()` over hardcoded local arrays (`KNOWLEDGE_DAYS_ML`, `ASTEROID_*`, etc.). It does **not** query the `AstroClockKnowledge` DB. The active SmartSearch UI uses `useKnowledgeIntelligenceSearch` (a different, semantic/DB-backed path) instead — so `astroClockSearch.js` is either dead code or used only by legacy components (`AdvancedKnowledgeSearch`).
- **Fix:** Confirm consumers; retire `astroClockSearch.js` if unused, or route it through the same DB-backed semantic path.
- **Difficulty:** Low.

### 4.3 MEDIUM — Semantic engine does synonym + harakat normalization but no Arabic root extraction
- **File:** `src/lib/semanticReasoningEngine.js:37-48` (`normalize`)
- **Reason:** `normalize` strips harakat, lowercases, collapses whitespace — good. But no Arabic root (ishtiqaq) extraction, no Levenshtein/fuzzy. "محبة" matches "المحبة" (harakat stripped) but not "حب" (different root form).
- **Fix:** Add a light Arabic stemmer/root normalizer for the query and the indexed text.
- **Difficulty:** Medium.

### 4.4 MEDIUM — `PURPOSE_KEYWORDS` minimal and English-only
- **File:** `src/lib/astroClockManuscriptMerger.js:66-77`
- **Reason:** ~6 English keywords per purpose. `getKashfOperationsForPurpose` won't find Arabic/ML operations by intent.
- **Fix:** Multilingual keyword sets per purpose, or reuse the semantic graph.
- **Difficulty:** Low.

### 4.5 LOW — Search results lack a normalized "required conditions" view
- The requirement lists planetary day, hour, lunar day, mansion, zodiac, directions, practice rules, references in each result. SmartSearch's `result` object has most of these (recommendedHours, sources, kashfOps, manuscript refs) but no single normalized "conditions" object.
- **Fix:** Add a `requiredConditions` summary to each result.
- **Difficulty:** Low.

---

## ═══════════════════════════════════════════
## PRIORITY 5 — PERFORMANCE / SCALE
## ═══════════════════════════════════════════

### 5.1 MEDIUM — Per-client recompute every 60s is acceptable; server-side ephemeris is the bottleneck at scale
- `useAstroData` recomputes sunrise/sunset, moon position, all 24 hours, and transits every 60s + on location change. This is client-side per user — fine for millions of users. The risk is if a **server-side** ephemeris (fix for 1.4) is called per-user per-tick: that would rate-limit/cost at scale.
- **Fix:** Any server ephemeris must be cached (per (lat,lng,date-day)) and shared across users.
- **Difficulty:** Medium.

### 5.2 MEDIUM — No backend aggregation for duplicate/conflict scanning at scale
- The full DB scan in this audit paged 200 records in <120s. At millions of records, a client/admin scan would be infeasible.
- **Fix:** Add server-side aggregation functions (e.g. `auditAstroClockDuplicates`, `detectAstroConflicts`) that use indexes + `group` aggregation rather than pulling all records.
- **Difficulty:** Medium.

### 5.3 LOW — `astroClockSearch.js` builds `ALL_KNOWLEDGE` at module load
- Concatenates all hardcoded arrays into one in-memory array at import. Moot if 4.2 retires it.
- **Difficulty:** Low.

### 5.4 LOW — JPL fetch of 7 planets in parallel per user would rate-limit
- Moot while 1.4 is broken; if fixed, must be server-cached.

### 5.5 LOW — semanticReasoningEngine caches are module-level
- Fine — they're read-only and shared. No per-user isolation needed.

---

## ═══════════════════════════════════════════
## SUMMARY TABLE
## ═══════════════════════════════════════════

| # | Pri | Sev | Finding | File / Function | Difficulty |
|---|-----|-----|---------|-----------------|------------|
| 1.1 | 1 | CRITICAL | Lunar day from absolute longitude, not elongation `D` | useAstroData.js:106 | Low |
| 1.2 | 1 | CRITICAL | Mansion boundaries start at 0°, manuscript starts at Aries 25° | astroClockMoonPosition.js:130 | Medium |
| 1.3 | 1 | HIGH | Moon transit times are fixed-spacing, not calculated | astroClockMoonPosition.js:190 | Low-Med |
| 1.4 | 1 | HIGH | JPL Horizons integration broken; never returns data | astroClockJPLHorizons.js:102 | Medium |
| 1.5 | 1 | MEDIUM | Sunrise/sunset day-of-year from browser-local date | astroClockSunriseSunset.js:125 | Low |
| 1.6 | 1 | MEDIUM | GPS numeric timezone can disagree with IANA tz | astroClockGeolocation.js:103 | Low |
| 1.7 | 1 | LOW | getCurrentPlanetaryHour has no timezone guard | astroClockLiveEngine.js:276 | Low |
| 1.8 | 1 | LOW | Moon ephemeris truncated; high-precision path broken | astroClockMoonPosition.js | Medium |
| 1.9 | 1 | LOW (known) | Mansions tropical, not sidereal | astroClockMoonPosition.js | Medium |
| 2.1 | 2 | HIGH | Conflicts never detected/recorded (0 in full DB) | ingestion layer | Medium |
| 2.2 | 2 | HIGH | Western occult source in DB (23 records) | AstroClockKnowledge data | Low-Med |
| 2.3 | 2 | HIGH | 200/200 records unverified | AstroClockKnowledge data | Low-Med |
| 2.4 | 2 | MEDIUM | Decision engine reads static JS, not DB | astroClockDecisionEngine.js | Med-High |
| 2.5 | 2 | MEDIUM | Special-op detection English-only | astroClockDecisionEngine.js:64 | Low |
| 2.6 | 2 | LOW (intentional) | dedupOps keys on English | astroClockDecisionEngine.js:107 | — |
| 3.1 | 3 | PASS | No duplicate keys/hashes in full DB | AstroClockKnowledge | — |
| 3.2 | 3 | PASS (design) | Append-only merge fields present | schema | — |
| 3.3 | 3 | MEDIUM | 26% of records are markers (bloat) | AstroClockKnowledge data | Low |
| 3.4 | 3 | MEDIUM | Zero full_context timing records in DB | AstroClockKnowledge data | Medium |
| 3.5 | 3 | LOW | Verify indexes physically created | DB | Low |
| 4.1 | 4 | HIGH | Semantic graph lacks harmful canonical actions | semanticKnowledgeGraph.js | Medium |
| 4.2 | 4 | HIGH | Dead literal search path (astroClockSearch.js) | astroClockSearch.js | Low |
| 4.3 | 4 | MEDIUM | No Arabic root extraction in semantic engine | semanticReasoningEngine.js:37 | Medium |
| 4.4 | 4 | MEDIUM | PURPOSE_KEYWORDS minimal, English-only | astroClockManuscriptMerger.js:66 | Low |
| 4.5 | 4 | LOW | Results lack normalized "required conditions" view | SmartSearch result shape | Low |
| 5.1 | 5 | MEDIUM | Server ephemeris must be cached at scale | (future fix for 1.4) | Medium |
| 5.2 | 5 | MEDIUM | No backend aggregation for scale audits | (new backend functions) | Medium |
| 5.3 | 5 | LOW | ALL_KNOWLEDGE built at module load | astroClockSearch.js | Low |
| 5.4 | 5 | LOW | JPL 7-planet parallel fetch per user | astroClockJPLHorizons.js | Low |
| 5.5 | 5 | LOW (ok) | semantic caches module-level | semanticReasoningEngine.js | — |

---

## ═══════════════════════════════════════════
## RECOMMENDED IMPLEMENTATION ORDER
## (by correctness leverage, not by priority number)
## ═══════════════════════════════════════════

1. **1.1** Lunar day from elongation `D` — one line, fixes the entire lunar-day layer + Kashf day rules.
2. **1.2** Mansion origin offset (Aries 25°) + tropical/sidereal policy — fixes every mansion output.
3. **2.2** Quarantine the 23 Western-source records + add a source whitelist gate.
4. **2.1** Conflict-detection pass in ingestion — enforces no-merge permanently.
5. **1.4 / 1.8** Resolve the high-precision moon path (fix JPL or wire backend ephemeris, cached).
6. **1.3** Real Moon transit times by iteration.
7. **1.5 / 1.6** Sunrise/sunset day-of-year + GPS tz consistency — cross-timezone correctness.
8. **4.1** Add harmful canonical actions to the semantic graph.
9. **4.2** Retire/redirect the dead literal search path.
10. **2.4 / 3.4** Route the decision engine + timing records into the DB.
11. **2.3** Verify the 200 records (run verification pass).
12. **3.3** Prune markers.
13. **4.3 / 4.4 / 2.5** Arabic root matching, multilingual purpose keywords, multilingual special-op detection.
14. **5.x** Server-side aggregation + ephemeris caching for scale.

All recommendations preserve existing calculations, formulas, Arabic text, and translations. No UI changes. No invented manuscript content. Every recommendation keeps traceability to manuscript sources.