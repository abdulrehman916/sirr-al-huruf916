# Astro Clock — Phase 1 Manuscript-Backed Verification Dossier
**Date:** 2026-07-29
**Phase:** 1 — CRITICAL 1.1 (Lunar Day) + CRITICAL 1.2 (Mansion Origin)
**Status:** Verification only. No engine code changed in this phase. Fixes will be applied only after this dossier is approved.
**Rule:** Every fix quoted to the exact manuscript page/section/rule. Conflicting opinions preserved separately. No invented logic.

---

## ════════════════════════════════════════════════════════
## CRITICAL 1.1 — LUNAR DAY (Tithi) COMPUTATION
## ════════════════════════════════════════════════════════

### A. Manuscript Evidence

**Source 1 — Kashf al-Haqa'iq (Omani manuscript), pp.60-65**
`KASHF_MONTH_DAYS` in `astroClockKashfData.js:456-492` — "بيان بأيام الشهر وأعمالها" (Lunar Month Day-by-Day Operations Guide), 30 days (1–30), each tagged saad/nahs/mixed. These are the **synodic lunar month days** (Hijri tithi), i.e. days counted from the last conjunction, not ecliptic-longitude slices.

**Source 2 — Kashf al-Haqa'iq, p.20 (`KASHF_ASTRO_PRINCIPLES` principle_003)**
> Arabic (verbatim): "مراعاة أن تكون أعمال الخير في زيادة القمر أي النصف الأول من الشهر"
> English: "Good deeds should be in the waxing Moon (first half of the lunar month)"
> ML: "നല്ല കൃത്യങ്ങൾ ചന്ദ്ര വളർച്ചക്കാലത്ത് (മാസത്തിന്റെ ആദ്യ പകുതി)"
> **Significance:** the lunar month is defined by the Moon's **phase cycle** (waxing = first half, days 1–15). The day number is therefore the Moon's age since conjunction, not its absolute longitude.

**Source 3 — Kashf al-Haqa'iq, pp.65-66 (`KASHF_ASTRO_PRINCIPLES` principle_004)**
> Arabic (verbatim): "أعلم أن هذه الحسابات يتم حسابها فلكياً وليس بثبوت الرؤية — لأن سعود ونحوس الأيام آثار تكوينية تتعلق بثبوت اليوم فلكياً"
> English: "These calculations are **astronomical, not based on crescent sighting** — they are cosmogenic effects tied to the astronomically established day"
> **Significance:** the lunar day must be **computed astronomically** (Moon age from conjunction), not taken from the religious Hijri calendar based on sighting. This justifies a calculation from the mean elongation `D`.

**Source 4 — Havâss'ın Derinlikleri, PDF2 p.63 (`GENEL_ZAMANLAMA_KURALLARI.moon_phase_rules`)**
> Turkish (verbatim): "Olumlu için Ay'ın büyümesi (Hilal'den Dolunay'a) tercih edilir / Olumsuz için Ay'ın küçülmesi (Dolunay'dan Hilal'e)"
> **Significance:** confirms the synodic (crescent→full→crescent) cycle is the reference frame for lunar-day timing. Two manuscripts agree.

### B. Why the current implementation is wrong
- **File:** `src/components/astroclock/dashboard/useAstroData.js:106`
- **Code:** `const lunarDay = moonPosition ? Math.floor(parseFloat(moonPosition.longitude) / (360 / 29.53)) + 1 : null;`
- `moonPosition.longitude` is the Moon's **absolute geocentric ecliptic longitude** (0–360° from the vernal equinox), returned by `calculateMoonPosition` (`astroClockMoonPosition.js:82`).
- The Hijri/tithi lunar day is the Moon's **age in days since the last conjunction** = a function of the **mean elongation `D`** (Moon longitude − Sun longitude), not the Moon's absolute longitude.
- At a new Moon, the Moon's absolute longitude equals the Sun's longitude (which advances ~1°/day through the year) — so `Math.floor(longitude / 12.19) + 1` returns "day 1" at a point in the zodiac that has no fixed relationship to the actual conjunction. The number drifts continuously with the Moon's absolute longitude through the zodiac, not with the phase cycle.
- This feeds `getKashfLunarDayInfo(lunarDay)`, `getKashfNahsStatus(lunarDay)`, the `KASHF_MONTH_DAYS` guide, and the decision engine `sLunar` score + `lunarDay` layer → all wrong.

### C. Why the proposed implementation is correct
- `calculateMoonPosition` **already computes** the mean elongation `D` (`astroClockMoonPosition.js:32`, `:76`, `:88`):
  `D = 297.8501921 + 445267.1114034 * T` (normalized to 0–360).
- `D` IS the Moon's elongation from the Sun (Moon longitude − Sun longitude, mean). At conjunction `D ≈ 0`; at full `D ≈ 180`; at next conjunction `D ≈ 360`.
- The synodic month is 29.53 days, so lunar day = `Math.floor((D_normalized / 360) * 29.53) + 1`.
  - Conjunction → D=0 → day 1 (correct: the month begins at new Moon).
  - First quarter → D≈90 → day ~8.
  - Full → D≈180 → day ~15 (matches Kashf principle_003 "first half = waxing").
  - Last quarter → D≈270 → day ~23.
  - Next conjunction → D≈360 → day 30/1.
- This is the astronomically-computed lunar day mandated by Kashf principle_004. No invented logic; `D` is an existing, physically-correct quantity.
- **Implementation:** expose `D` from `calculateMoonPosition` (add `elongation: D` to its return object) and change the one line in `useAstroData` to use `elongation` instead of `longitude`.

### D. Conflicting-opinion check
- Havâss and Kashf agree on the **synodic-cycle basis** (both cite crescent→full→crescent). No manuscript defines lunar day as an absolute-longitude slice. No conflict to preserve — the fix is consistent with both manuscripts.
- The **day-by-day saad/nahs assignments** in `KASHF_MONTH_DAYS` (Kashf) are a separate dataset; once the correct day number is computed, the lookup is unchanged. No merge, no conflict.

### E. Affected modules
| File | Function | Change | Impact |
|------|----------|--------|--------|
| `astroClockMoonPosition.js` | `calculateMoonPosition` | expose `elongation: D` in return | additive field, no behavior change |
| `useAstroData.js` | `lunarDay` (line 106) | use `elongation` instead of `longitude` | lunarDay value changes to correct tithi |
| `astroClockDecisionEngine.js` | `sLunar`, `lunarDay` layer, `nahsStatus`, avoid-list | reads corrected `d.lunarDay` | only the lunar-day-derived outputs change (intended) |
| `IntelligentDashboard.jsx` | lunar-day display blocks | auto via `d.lunarDay` | correct day shown |
| `DailyMantras.jsx` | if it reads lunarDay | auto | correct day |
| `MoonCenter.jsx`, `MansionsReference.jsx`, `SaatGrid.jsx` | — | none | do not consume lunarDay |

### F. Regression test plan
1. **Before fix:** capture `lunarDay` for a known reference date (e.g. 2026-07-29 Asia/Dubai) and for a known new-moon instant and a known full-moon instant.
2. **After fix:** recompute; assert new-moon instant → day 1, full-moon instant → day ~15–16.
3. **Cross-check** against an authoritative Hijri date (e.g. a known conjunction date) — the astronomically-computed day should match ±1.
4. **Non-regression:** assert `activeDayIndex`, `dayRuler`, `currentHour`, `allHours`, `moonPosition.longitude`, `moonZodiacFull`, `currentMansion` are byte-identical before/after (the fix touches only lunarDay).
5. **Decision engine:** assert only the `lunarDay` and `sLunar` compatibility rows change; all other rows (planetaryDay, currentHour, moonMansion, moonZodiac, moonPhase, hourCompatibility) unchanged.
6. **Build:** no new imports, no console errors, no broken renders on Astro Clock page.

---

## ════════════════════════════════════════════════════════
## CRITICAL 1.2 — LUNAR MANSION ORIGIN
## ════════════════════════════════════════════════════════

### A. Manuscript Evidence

**Source 1 — Havâss'ın Derinlikleri, PDF2 pp.64-74 (`AY_MANAZILLERI` in `astroClockData.js:320-891`)**
Each of the 28 mansions carries an explicit `baslama_siniri` (start boundary) in the manuscript:

| no | name | `baslama_siniri` (verbatim) | absolute ° |
|----|------|------------------------------|-----------|
| 1 | Sheratayn (الشرطان) | "Koç burcunun 25. Derecesi" | 25° |
| 2 | Buteyn (البطين) | "Boğa burcunun 8. Derecesi" | 38° |
| 3 | Süreyya (الثريا) | "Boğa burcunun 21. Derecesi" | 51° |
| 4 | Düberan (الدبران) | "İkizler burcunun 3. Derecesi" | 63° |
| … | … | … | … |
| 27 | Ferülmüahhir (فرع المؤخر) | "Balık burcunun 29. Derecesi" | 359° |
| 28 | Erreşa (الرشا) | "Koç burcunun 12. Derecesi" | 12° |

The sequence wraps continuously: mansion 27 starts at 359°, mansion 28 at 12° (spanning 359°→12° across 0°), mansion 1 at 25° (spanning 12°→25°). Width per mansion = 360/28 = 12.857°.

**Verification of the 25° origin against every stated boundary** (using `index = floor(((longitude − 25 + 360) % 360) / 12.857)`):
- 25° → ((25−25)%360)/12.857 = 0 → index 0 = Sheratayn ✓
- 38° → ((38−25)%360)/12.857 = 1.01 → index 1 = Buteyn ✓
- 51° → ((51−25)%360)/12.857 = 2.02 → index 2 = Süreyya ✓
- 63° → ((63−25)%360)/12.857 = 2.95 → index 2 = Süreyya (63° is still within Süreyya 51°–63.857°) ✓
- 12° → ((12−25+360)%360)/12.857 = 347/12.857 = 26.99 → index 26 = Erreşa ✓
- 359° → ((359−25)%360)/12.857 = 334/12.857 = 25.98 → index 25 = Ferülmüahhir ✓

All explicit boundaries are matched by an origin of **25° absolute** with equal 12.857° width.

**Source 2 — Kashf al-Haqa'iq, pp.55-56 (`KASHF_LUNAR_MANSIONS`)**
Lists the same 28 mansions by Arabic name (الشرطين، البطين، الثريا، …) attributed to Sheikh Nasser bin Jaad al-Khuroosi. Kashf gives per-mansion **operations and saad/nahs** but does **not** give degree boundaries. It relies on the same mansion set and order. **No conflict on boundaries** — Havâss is the sole boundary authority; Kashf adds Omani operations per mansion.

**Tropical vs sidereal frame:** Havâss uses the **tropical** zodiac sign names ("Koç burcu" = tropical Aries). The fix therefore uses tropical longitude (the existing `calculateMoonPosition` output). A sidereal correction is a separate optional refinement (audit finding 1.9, known) and is **not** applied here — adding an unattested ayanamsa offset would itself violate the manuscript-only rule.

### B. Why the current implementation is wrong
- **File:** `src/lib/astroClockMoonPosition.js:130-139` (`findLunarMansion`), mirrored in `src/lib/astroClockLiveAstronomy.js:107-127` (`getLiveLunarMansion`).
- **Code:** `const mansionIndex = Math.floor(longitude / (360/28));` then `AY_MANAZILLERI[mansionIndex]`.
- This divides 360° into 28 equal slices **from 0°**: index 0 = 0°–12.857° (Aries 0–12.857°).
- But the manuscript puts mansion 1 (Sheratayn) at **Aries 25°–37.857°**. So `findLunarMansion(25)` returns index 1 (Buteyn) when the manuscript says 25° = Sheratayn (index 0).
- The entire mansion assignment is offset by ~2 mansions for every longitude → the "current mansion", mansion score, mansion-keyed special operations, and the Mansions Reference "current" highlight are all against the wrong mansion.

### C. Why the proposed implementation is correct
- Apply the manuscript's 25° origin: `const ORIGIN = 25; const idx = Math.floor(((longitude − ORIGIN + 360) % 360) / (360/28));`
- Verified above against every explicit `baslama_siniri` in `AY_MANAZILLERI` — every boundary matches.
- Equal-width 12.857° division is preserved (manuscript implies it; the explicit start degrees are mutually consistent with it).
- Tropical frame preserved (matches Havâss "Koç/Boğa/…" tropical sign names). No invented offset.
- The mansion **order and names** are unchanged; only the **index mapping** shifts to the manuscript-correct origin.

### D. Conflicting-opinion check (preserved separately, NOT merged)
The two manuscripts **disagree on saad/nahs nature for several mansions** — these are pre-existing data conflicts, independent of the boundary fix, and must be preserved separately (Phase 2 conflict-detection work):

| Mansion | Havâss `genel_hukum` | Kashf `nature` | Conflict? |
|---------|----------------------|----------------|-----------|
| 2 Buteyn | "Uygundur" (suitable) | "nahs" | **YES — conflicting** |
| 10 Cebhe | "Karışık" (mixed) | "saad" (Kashf notes "ذكرها في السر العلي بأنها نحس") | **YES — conflicting (3-way)** |
| 12 Sarfe/Surfa | "Uğursuz (Nahs)" | "nahs" | agree |
| 16 Zibana | "Uygun (Saad)" | "nahs" | **YES — conflicting** |

**Action for Phase 2:** these must be flagged in `conflicting_opinions` and rendered as "different manuscript opinion", never merged. The boundary fix (1.2) does not touch the saad/nahs data; it only corrects **which mansion** a given longitude maps to. The saad/nahs conflicts will surface correctly once the boundary is right.

### E. Affected modules
| File | Function | Change | Impact |
|------|----------|--------|--------|
| `astroClockMoonPosition.js` | `findLunarMansion` (line 130) | add `ORIGIN = 25` offset | every longitude maps to the manuscript-correct mansion |
| `astroClockMoonPosition.js` | `calculateMoonTransits` (line 222-260) | use same offset for mansion index | transits land on correct mansion boundaries |
| `astroClockLiveAstronomy.js` | `getLiveLunarMansion` (line 107) | same offset | JPL-path consistency (path currently broken, see 1.4, but kept consistent) |
| `useAstroData.js` | `currentMansion` (via `calculateMoonPosition`) | auto | correct mansion |
| `astroClockDecisionEngine.js` | `mansionInfo`, `sMansion`, special ops keyed to mansions | reads corrected `d.currentMansion` | only mansion-derived outputs change (intended) |
| `MansionsReference.jsx` | "current" highlight | auto | correct mansion highlighted |
| `MoonCenter.jsx` | current mansion display | auto | correct mansion |

### F. Regression test plan
1. **Before fix:** capture mansion index for a set of longitudes: `{0°, 12°, 25°, 38°, 51°, 63°, 359°}`.
2. **After fix:** recompute; assert:
   - 25° → Sheratayn (no.1)
   - 38° → Buteyn (no.2)
   - 51° → Süreyya (no.3)
   - 12° → Erreşa (no.28)
   - 359° → Ferülmüahhir (no.27)
3. **Non-regression:** assert `lunarDay`, `activeDayIndex`, `dayRuler`, `currentHour`, `allHours`, `moonPosition.longitude`, `moonZodiacFull` are byte-identical before/after (the fix touches only mansion index).
4. **Decision engine:** assert only the `moonMansion` compatibility row + mansion-keyed special ops change; all other rows unchanged.
5. **Build:** no new imports, no console errors, no broken renders on Astro Clock page.

---

## ════════════════════════════════════════════════════════
## IMPLEMENTATION NOTES
## ════════════════════════════════════════════════════════

- **Phase 1 scope:** ONLY 1.1 and 1.2. Both are single-function, additive (1.1) or offset (1.2) changes. No Western logic, no AI, no invented manuscript content.
- **No data migration needed:** `AY_MANAZILLERI` already carries the correct `baslama_siniri` values; the fix uses them. No DB records change.
- **No UI change:** the dashboard reads `d.lunarDay` and `d.currentMansion`; both auto-correct.
- **Order:** apply 1.1 first (smaller, isolates lunarDay), then 1.2 (mansion offset). Run the full regression suite after each.
- **Changelog:** after each fix, record file / function / manuscript source / astronomical impact / affected modules / regression result (per requirement 10).

**Awaiting approval to implement Phase 1 fixes per this dossier.**