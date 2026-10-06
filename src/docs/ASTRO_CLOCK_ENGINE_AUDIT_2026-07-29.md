# Astro Clock Engine Audit Report
**Date:** 2026-07-29
**Scope:** Live engine, manuscript engine, database integrity, intelligent search
**Method:** Static code review of `astroClockLiveEngine.js`, `astroClockSunriseSunset.js`, `astroClockGeolocation.js`, `astroClockMoonPosition.js`, `astroClockDecisionEngine.js`, `astroClockManuscriptMerger.js`, `astroClockSearch.js`, `semanticKnowledgeGraph.js`, `useAstroData.js` + a 200-record sample of the live `AstroClockKnowledge` entity.
**Rule:** No UI changes. No invented manuscript logic. Findings only.

---

## Severity Scale
- **CRITICAL** — wrong output shown to users now.
- **HIGH** — wrong output in a core manuscript layer.
- **MEDIUM** — correctness gap with bounded impact.
- **LOW** — hygiene / future-proofing.

---

## PRIORITY 1 — LIVE ENGINE AUDIT

### 1.1 CRITICAL — Lunar day is computed from the wrong quantity
`useAstroData.js:106`
```js
const lunarDay = moonPosition ? Math.floor(parseFloat(moonPosition.longitude) / (360 / 29.53)) + 1 : null;
```
`moonPosition.longitude` is the Moon's **absolute geocentric ecliptic longitude** (0–360° from the vernal equinox). The lunar (Hijri) day is the Moon's **age in days since the last conjunction**, which is a function of the **mean elongation `D`** (Moon longitude minus Sun longitude), not the Moon's absolute longitude.

The same file already computes `D` correctly in `calculateMoonPosition` (used for `isWaxing` and `phase`). It is never used for `lunarDay`.

**Impact:** Every lunar-day-derived recommendation is wrong:
- `getKashfLunarDayInfo(lunarDay)` → wrong day nature (saad/nahs/mixed)
- `getKashfNahsStatus(lunarDay)` → wrong "Kamil unlucky day" flag
- `KASHF_MONTH_DAYS` day-by-day guide → wrong summary
- Decision engine `sLunar` score and `lunarDay` layer → wrong
- "Avoid" list may surface a spurious Kamil warning or miss a real one.

**Fix:** `lunarDay = Math.floor((D_normalized / 360) * 29.53) + 1`, with `D` already available in `calculateMoonPosition`. Verify against a known Hijri date before shipping.

---

### 1.2 HIGH — Moon transit times are fixed-spacing approximations, not calculations
`astroClockMoonPosition.js:190-260`
```js
const moonSpeed = 0.5; // degrees per hour (average)
const hoursToNextSign = degreesToNextSign / moonSpeed;
// next 5 mansions: i * 0.9 days
// next 5 signs:   i * 2.5 days
```
"Live transitions" (Priority 12) for the Moon are estimated by constant spacing, not by re-evaluating the Moon's position at future instants. Countdowns drift over days and can be off by many hours near perigee/apogee.

**Fix:** Compute each transit by iterating `calculateMoonPosition` forward (hourly then bisection) until the boundary is crossed. Same ephemeris, exact instants.

---

### 1.3 MEDIUM — `calculateSunriseSunset` derives day-of-year from the browser-local date
`astroClockSunriseSunset.js:125-130`
```js
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  return Math.floor(diff / oneDay);
}
```
`date.getFullYear()` is the **browser** timezone's year, and the midnight reference is the browser's. `useAstroData` passes raw `now` (not `localNow`) to `calculateSunriseSunset`. For a user whose device timezone ≠ selected location, the day-of-year can be off by 1 around midnight, shifting sunrise/sunset by one calendar day.

**Fix:** Pass `localNow` (the location-shifted date) to `calculateSunriseSunset`, or compute day-of-year from the UTC instant + location offset. Then the NOAA algorithm runs against the location's civil day.

---

### 1.4 MEDIUM — Stored numeric `timezone` can disagree with `tz` for GPS records
`astroClockGeolocation.js:100-108`
```js
return {
  timezone: deviceTimezone(),           // device offset (DST-aware)
  tz: ianaFromCoords(latitude, longitude) || deviceIana(),
  ...
};
```
For GPS, the numeric `timezone` is the **device** offset while `tz` is resolved from the **coordinates**. `useAstroData` correctly prefers the IANA `tz` via `getTzOffsetHours`, so the numeric field is harmless today — but it is semantically wrong and any legacy consumer reading `loc.timezone` directly would get the device offset, not the location's.

**Fix:** Set `timezone` to `getTzOffsetHours(tz, now)` (or drop the numeric field entirely in favour of the IANA path).

---

### 1.5 LOW — `getCurrentPlanetaryHour` has no timezone guard
`astroClockLiveEngine.js:276` uses `date.getHours()`. It is only correct when the caller passes a **location-shifted** date. `useAstroData` does this; any future direct caller passing `new Date()` would silently compute in browser time.
**Fix:** Document the contract on the function, or accept an explicit decimal-hour input.

---

### 1.6 LOW (known) — Moon mansions use tropical-equal division, not sidereal boundaries
`astroClockMoonPosition.js:130-139` divides 360° into 28 equal 12.857° slices from the vernal equinox. Traditional Arabic manāzil are sidereal with specific star-referenced boundaries. Already tracked as a known gap; flagged here for completeness.

---

### 1.7 LOW — Moon ephemeris is a truncated series
`calculateMoonPosition` uses a small set of perturbation terms (~1–2° typical error). Adequate for mansion/zodiac identification away from boundaries; can mis-assign by one mansion near edges. A higher-precision path (`astroClockJPLHorizons.js` / `getLiveMoonPosition`) exists but is not wired into the live hook.

---

## PRIORITY 2 — MANUSCRIPT ENGINE AUDIT

### 2.1 HIGH — Conflicts are never detected or recorded
The `AstroClockKnowledge` schema has `conflict_flags` and `conflicting_opinions` fields. A 200-record sample shows **0 records** with either populated. The ingestion functions merge by `canonical_key` / `rule_record_key` and append to `supporting_sources`, but nothing compares field values across sources to detect disagreements and write `conflicting_opinions`.

**Impact:** The standing rule *"Never merge conflicting manuscripts; display each opinion separately with its source"* is not enforced at the data layer. Two manuscripts disagreeing on a planet's nature would both be appended without a conflict flag, and the display layer has no signal to render them as "different manuscript opinion".

**Fix:** Add a conflict-detection pass in the ingestion path: when a new source is appended to an existing `rule_record_key`, compare each shared field (nature, element, suitable/unsuitable actions, etc.); on disagreement, push to `conflicting_opinions` and add the field to `conflict_flags` instead of overwriting. Then the UI can render a "Different manuscript opinion" subsection.

---

### 2.2 MEDIUM — Special-operation detection is English-keyword only
`astroClockDecisionEngine.js:64-76` `isSpecial()` matches an English keyword list. Arabic-only manuscript operations (e.g. `mansionInfo.operation_ar`) are passed through `isSpecial` but the Arabic text won't contain English keywords, so they never classify as special.
**Fix:** Add Arabic + Malayalam keyword lists, or match against a normalized concept id.

---

### 2.3 MEDIUM — Decision engine reads static JS modules, not the `AstroClockKnowledge` DB
`astroClockDecisionEngine.js` imports `PLANETARY_HOUR_RULES`, `KASHF_*` from hardcoded JS files. It does **not** query the verified `AstroClockKnowledge` entity. Manuscript rules ingested into the database are not reflected in live recommendations until they are also coded into the static modules.
**Impact:** Limits the "millions of rules" goal — the DB can grow but the engine won't use it. (See Priority 3.)

---

### 2.4 LOW — `dedupOps` keys on English text only
`astroClockDecisionEngine.js:107-117` dedups operations by `op.en.toLowerCase()`. Operations with identical meaning but different wording across manuscripts are kept separate — which is **correct** per the no-merge rule. Documented here as intentional, not a defect.

---

## PRIORITY 3 — DATABASE INTEGRITY

### 3.1 PASS (sample) — No duplicate keys or content hashes
200-record sample: `0` duplicate `rule_record_key`/`full_context_key`, `0` duplicate `content_hash`. Dedup at insert is working on the sampled set. A full scan (>200 records exist; `hasMore=true`) is recommended before sign-off.

### 3.2 PASS (design) — Append-only merge fields exist
`AstroClockKnowledge` supports `supporting_sources`, `conflicting_opinions`, `context_specific`, and `SectionDKnowledge` supports `additional_sources`. Append-only architecture is in place. Whether every ingestion function honours it requires a per-function review (not in this audit's scope).

### 3.3 MEDIUM — Engine–DB disconnect (see 2.3)
The DB can scale safely, but the live engine does not consume it. New books ingested into `AstroClockKnowledge` do not influence the dashboard until manually transcribed into a static module.

### 3.4 LOW — Indexes are declared on the schema
`idx_content_hash`, `idx_canonical_key`, `idx_rule_record_key`, `idx_full_context_key` etc. are declared. Verify they are physically created in production (run `verifyDatabaseIndexes`).

---

## PRIORITY 4 — INTELLIGENT SEARCH ENGINE

### 4.1 HIGH — Search is literal substring only; no semantic / synonym / root matching
`astroClockSearch.js:88` `matches = matches && searchText.includes(queryLower)`.
Searching "exile", "banish", "deport", "imprisonment", "separation", "lawsuit", "destroy", "illness" will **not** return rules that use different wording for the same concept. The requirement "search by meaning, not only by exact words" is unmet.

### 4.2 HIGH — `semanticKnowledgeGraph.js` exists but is NOT used by the search
A full synonym/concept graph (ml/ar/en) already exists with `synonyms`, `equivalent`, `manuscript_keywords`, `preferred_planets`, etc. The search function does not import or consult it. The SmartSearch UI uses a separate path. Two parallel semantic systems.

**Fix:** Wire `searchAstroClockKnowledge` to (a) expand the query through `SEMANTIC_GRAPH` synonyms/equivalents in ml/ar/en, (b) match on `manuscript_keywords`, (c) fall back to Arabic-root normalization, (d) Malayalam + Turkish synonym matching.

### 4.3 HIGH — Search does not query the `AstroClockKnowledge` DB
`astroClockSearch.js` builds `ALL_KNOWLEDGE` from local hardcoded arrays (`KNOWLEDGE_DAYS_ML`, `ASTEROID_*`, etc.). It never calls `base44.entities.AstroClockKnowledge.filter(...)`. The verified, sourced, scalable knowledge store is invisible to search.

**Fix:** Search must hit `AstroClockKnowledge` (and eventually `KnowledgeCache` verified entries) server-side, with the semantic expansion above, to scale to millions of rules.

### 4.4 MEDIUM — No Arabic root matching
`arabic_normalized` exists on several entities but search does not stem or normalize the query. "محبة" won't match "المحبة" / "حب" without normalization.

### 4.5 MEDIUM — `PURPOSE_KEYWORDS` in the merger is minimal and English-only
`astroClockManuscriptMerger.js:66-77` has ~6 keywords per purpose, English only. `getKashfOperationsForPurpose` won't find Arabic/ML operations by intent.

### 4.6 LOW — Search results do not include required astronomical conditions
The requirement lists planetary day, hour, lunar day, mansion, zodiac, directions, practice rules, references in each result. The current `searchAstroClockKnowledge` returns rule objects that lack a normalized "required conditions" view; the caller must infer.

---

## PRIORITY 5 — PROFESSIONAL AUDIT REPORT (this document)

---

## Summary Table

| # | Priority | Severity | Finding | Module |
|---|----------|----------|---------|--------|
| 1.1 | 1 | CRITICAL | Lunar day computed from absolute longitude, not elongation | useAstroData.js |
| 1.2 | 1/12 | HIGH | Moon transit times are fixed-spacing, not calculated | astroClockMoonPosition.js |
| 1.3 | 1 | MEDIUM | day-of-year from browser-local date in sunrise/sunset | astroClockSunriseSunset.js |
| 1.4 | 1 | MEDIUM | GPS numeric timezone can disagree with IANA tz | astroClockGeolocation.js |
| 1.5 | 1 | LOW | getCurrentPlanetaryHour has no timezone guard | astroClockLiveEngine.js |
| 1.6 | 1/9 | LOW (known) | Mansions tropical-equal, not sidereal | astroClockMoonPosition.js |
| 1.7 | 1 | LOW | Moon ephemeris truncated; higher-precision path unused | astroClockMoonPosition.js |
| 2.1 | 2/3 | HIGH | Conflicts never detected/recorded; merge happens without flagging | ingestion / AstroClockKnowledge |
| 2.2 | 2/5 | MEDIUM | Special-op detection English-keyword only | astroClockDecisionEngine.js |
| 2.3 | 2/3 | MEDIUM | Decision engine reads static JS, not the DB | astroClockDecisionEngine.js |
| 2.4 | 2 | LOW (intentional) | dedupOps keys on English text | astroClockDecisionEngine.js |
| 3.1 | 3 | PASS (sample) | No duplicate keys/hashes in 200-record sample | AstroClockKnowledge |
| 3.2 | 3 | PASS (design) | Append-only merge fields present | schema |
| 3.3 | 3 | MEDIUM | Engine–DB disconnect limits scalability | architecture |
| 4.1 | 4 | HIGH | Search is literal substring only | astroClockSearch.js |
| 4.2 | 4 | HIGH | Semantic graph exists but unused by search | astroClockSearch.js / semanticKnowledgeGraph.js |
| 4.3 | 4 | HIGH | Search does not query AstroClockKnowledge DB | astroClockSearch.js |
| 4.4 | 4 | MEDIUM | No Arabic root matching | astroClockSearch.js |
| 4.5 | 4 | MEDIUM | PURPOSE_KEYWORDS minimal, English-only | astroClockManuscriptMerger.js |
| 4.6 | 4 | LOW | Results lack normalized required-conditions view | astroClockSearch.js |

---

## Recommended Fix Order (by leverage)
1. **1.1** Lunar day from elongation `D` — single-line fix, fixes the entire lunar-day layer and Kashf day rules.
2. **4.1 + 4.2 + 4.3** Wire semantic search to the DB — unblocks Priority 4 end-to-end.
3. **2.1** Conflict-detection pass in ingestion — enforces the no-merge rule permanently.
4. **1.3 + 1.4** Sunrise/sunset day-of-year + GPS tz consistency — cross-timezone correctness.
5. **1.2** Real Moon transit times by iteration.
6. **2.3 / 3.3** Route the decision engine to the DB (longer-term; needs a DB-backed rule lookup).
7. **4.4 / 4.5 / 2.2** Arabic root matching, multilingual purpose keywords, multilingual special-op detection.

All recommendations preserve existing logic, calculations, Arabic text, and translations. No UI changes. No invented manuscript content.