# Astro Clock — Phase 1 Implementation & Verification Report
**Date:** 2026-07-29
**Phase:** 1 — CRITICAL 1.1 (Lunar Day) + CRITICAL 1.2 (28 Mansion Origin)
**Status:** ✅ Implemented, regression-audited, live-render-verified. No UI change. No manuscript logic invented.

---

## ════════════════════════════════════════════════════════
## 1. FILES CHANGED
## ════════════════════════════════════════════════════════

| File | Function | Lines changed | Change type |
|------|----------|---------------|------------|
| `src/lib/astroClockMoonPosition.js` | `calculateMoonPosition` (return) | +4 | additive: expose `elongation: D.toFixed(2)` |
| `src/lib/astroClockMoonPosition.js` | new `MANSION_START_DEGREES` + `mansionIndexFromLongitude` | +33 | additive: manuscript boundary lookup (exported) |
| `src/lib/astroClockMoonPosition.js` | `findLunarMansion` | -8 / +4 | rewrite: use `mansionIndexFromLongitude` |
| `src/lib/astroClockMoonPosition.js` | `calculateMoonTransits` (mansion index + width) | -2 / +6 | rewrite: use `mansionIndexFromLongitude` + per-mansion width |
| `src/components/astroclock/dashboard/useAstroData.js` | `lunarDay` (line 106) | -1 / +4 | rewrite: use `elongation` (D) instead of `longitude` |
| `src/lib/astroClockLiveAstronomy.js` | import + `getLiveLunarMansion` | +1 / -3 / +2 | rewrite: use shared `mansionIndexFromLongitude` |

**Total:** 3 files, 6 functions, ~28 lines modified. No other file touched.

---

## ════════════════════════════════════════════════════════
## 2. MANUSCRIPT EVIDENCE (traceability)
## ════════════════════════════════════════════════════════

### Fix 1.1 — Lunar Day
- **Kashf al-Haqa'iq principle_004 (pp.65-66):** "أعلم أن هذه الحسابات يتم حسابها فلكياً وليس بثبوت الرؤية" — lunar day computed **astronomically**, not by crescent sighting.
- **Kashf principle_003 (p.20):** "أعمال الخير في زيادة القمر أي النصف الأول من الشهر" — good deeds in waxing Moon = first half of month → month is the synodic cycle.
- **Havâss PDF2 p.63 (`GENEL_ZAMANLAMA_KURALLARI`):** "Olumlu için Ay'ın büyümesi (Hilal'den Dolunay'a)" — crescent→full→crescent cycle.
- **Implementation:** `lunarDay = floor((D / 360) * 29.53) + 1`, where `D` is the mean elongation (Moon longitude − Sun longitude) already computed in `calculateMoonPosition`. `D≈0`→day 1 (new moon), `D≈180`→day ~15 (full).

### Fix 1.2 — 28 Mansion Origin
- **Havâss'ın Derinlikleri, PDF2 pp.64-74 (`AY_MANAZILLERI[].baslama_siniri`):** explicit start degree for each of the 28 mansions (Sheratayn at Aries 25°, Buteyn at Taurus 8°, …, Erreşa at Aries 12°). The widths are **unequal** (mostly 13°, some 12°) — the manuscript does **not** use equal 360/28 division.
- **Kashf pp.55-56 (`KASHF_LUNAR_MANSIONS`):** same 28 mansions, same names/order; adds Omani operations, no boundary conflict.
- **Implementation:** explicit boundary array `MANSION_START_DEGREES` + `mansionIndexFromLongitude` lookup with wrap (m27 spans [359°,12°), m28 spans [12°,25°), m1 starts at 25°). Tropical frame preserved (Havâss uses tropical sign names).

---

## ════════════════════════════════════════════════════════
## 3. REGRESSION AUDIT RESULTS
## ════════════════════════════════════════════════════════

### 3a. Mansion boundary check — ALL 28 PASS
Every explicit `baslama_siniri` maps to its correct mansion:
```
25°→Sheratayn(1)  38°→Buteyn(2)   51°→Süreyya(3)  63°→Düberan(4)
76°→Hak'a(5)     89°→Hena(6)     102°→Zira(7)    115°→Nesre(8)
128°→Tarfe(9)     141°→Cebhe(10)  153°→Zebra(11)  166°→Surfa(12)
179°→Ava(13)      192°→Semmak(14) 205°→Gufur(15)  218°→Zibana(16)
231°→İklil(17)    243°→Kalp(18)   256°→Şevle(19)  269°→Neayim(20)
282°→Belde(21)    295°→Saadüzzabih(22) 308°→Saudbela(23) 321°→Saadüssuud(24)
333°→Saadülahbiyye(25) 346°→Ferülmukaddem(26) 359°→Ferülmüahhir(27) 12°→Erreşa(28)
```
**pass: 28 / 28, fail: 0**

### 3b. Lunar-day sanity (astronomical correctness)
- New-moon case (D = 12.83°, ~1 day past conjunction) → **lunar day 2** ✓
- Full-moon case (D = 176.76°) → **lunar day 15** ✓ (matches Kashf "first half = waxing, full ≈ mid-month")

### 3c. Non-regression — layers that must NOT change
Across 6 test dates spanning different phases/longitudes, these are **byte-identical** before vs after (they don't depend on the lunarDay or mansion-index formulas):
- ✅ Planetary Day (`getActiveWeekday`)
- ✅ Planetary Hour (`currentHour.hourNumber`, `currentHour.planet`)
- ✅ Day/Night boundary
- ✅ Moon Phase (`phase`, `isWaxing`)
- ✅ Moon Longitude
- ✅ Moon Zodiac
- ✅ Sunrise/Sunset (unchanged)
- ✅ Direction engine (unchanged)
- ✅ Practice Rules (unchanged)
- ✅ Best / Avoid / Special operations (non-mansion rows unchanged)
- ✅ Compatibility Summary (non-lunar / non-mansion rows unchanged)
- ✅ Search Results (search path untouched)
- ✅ Manuscript References (untouched)

### 3d. Layers that CHANGED (intended)
- **Lunar day** — changed in 5/6 test cases (was wrong: derived from absolute longitude; now correct: from elongation D).
- **Current mansion** — changed in 6/6 test cases (was offset ~2 mansions; now matches every manuscript boundary).
- **Mansion-keyed outputs** — `mansionInfo`, `sMansion` score, mansion-keyed special operations, Mansions Reference "current" highlight: all now reference the manuscript-correct mansion.
- **Lunar-day-keyed outputs** — `getKashfLunarDayInfo`, `getKashfNahsStatus`, `KASHF_MONTH_DAYS` guide, decision engine `sLunar` + `lunarDay` layer + avoid-list: all now reference the correct tithi.

### 3e. Live render verification
- `preview_execute_code` navigated to `/astro-clock`: **0 console errors**, dashboard renders, decision card shows Day / Lil-Nahar / Hour / Kawkab / Strong status / Best / Avoid / Special operations / next-change countdown. No build break.

---

## ════════════════════════════════════════════════════════
## 4. CONFLICT HANDLING (Havâss vs Kashf)
## ════════════════════════════════════════════════════════
Pre-existing saad/nahs disagreements between Havâss and Kashf (e.g. Buteyn: Havâss "Uygundur" vs Kashf "nahs"; Cebhe: Havâss "Karışık" vs Kashf "saad" with a 3-way note; Zibana: Havâss "Uygun" vs Kashf "nahs") are **preserved separately and untouched** by Phase 1. Phase 1 only corrects *which mansion* a longitude maps to; the per-mansion saad/nahs data is unchanged. Conflict-detection + transparent display is Phase 2 work (audit finding 2.1).

---

## ════════════════════════════════════════════════════════
## 5. SAFETY / ROLLBACK NOTES
## ════════════════════════════════════════════════════════
- An initial equal-division (360/28 from 25°) attempt **failed** the 28-boundary regression (14 fails) because the manuscript uses unequal widths. Per the safety rule, the implementation was corrected to explicit boundaries before continuing. No broken calculation shipped.
- All changes are localized to the two approved fixes. No Western logic, no AI, no invented manuscript content. Every value remains traceable to Havâss / Kashf.
- Rollback = revert the 6 function changes (original lines documented in the Phase 1 verification dossier, `src/docs/ASTRO_CLOCK_PHASE1_VERIFICATION_2026-07-29.md`).

---

## ════════════════════════════════════════════════════════
## 6. REMAINING ISSUES (from the full verification report)
## ════════════════════════════════════════════════════════
**CRITICAL — remaining:** none (1.1 and 1.2 resolved).
**HIGH — remaining:**
- 1.3 Moon transit times are fixed-spacing approximations (not calculated).
- 1.4 JPL Horizons integration broken; "arcsecond precision" never delivered.
- 2.1 Conflicts never detected/recorded (ingestion layer).
- 2.2 Western occult source present in the knowledge DB (23 records).
- 2.3 200/200 records unverified.
- 4.1 Semantic graph lacks harmful canonical actions.
- 4.2 Dead literal search path (`astroClockSearch.js`).
**MEDIUM/LOW:** see `src/docs/ASTRO_CLOCK_FULL_VERIFICATION_2026-07-29.md`.

---

## ════════════════════════════════════════════════════════
## 7. RECOMMENDATION FOR PHASE 2
## ════════════════════════════════════════════════════════
Per the agreed plan, Phase 2 covers:
1. **Moon transit precision (1.3)** — replace fixed spacing with iteration of `calculateMoonPosition` (bisection across boundaries). Uses the same `MANSION_START_DEGREES` array now in place.
2. **JPL precision path (1.4)** — fix the parsing (JPL returns text, not the JSON fields currently read) and observer-coord param, OR wire the existing `getLiveMoonPosition` backend function with caching. Requires manuscript/astronomical verification: confirm the higher-precision longitude still maps to the same mansion via `mansionIndexFromLongitude` for a sample of dates (regression).
3. **Conflict detection (2.1)** — add a per-field comparison pass in ingestion that writes `conflicting_opinions` + `conflict_flags` instead of overwriting; preserve Havâss vs Kashf disagreements (e.g. Buteyn, Cebhe, Zibana) as separate, transparently-displayed opinions.

Each Phase 2 fix should follow the same process: manuscript-backed verification dossier → minimal implementation → full regression audit → before/after comparison → this report format.

**Phase 1 is complete and verified.**