# MIZAAN_LOCKED_FINAL

**Lock Date:** 2026-06-19  
**Status:** ✅ LOCKED AND FINALIZED

---

## Protected Files — DO NOT MODIFY

| File | Description |
|------|-------------|
| `pages/Mizaan9Page` | Main Mizaan page — M1–M9 inputs, section switching, pipeline orchestration |
| `lib/mizaanPostEngine.js` | FIRST_BAST, BAST_TABLE, istintak, getBastLevel, buildVefk, validateVefk, generateEsmaLevel, expandAllSeedLetters, runMizaanPostPipeline |
| `lib/mizaan9Engine.js` | M1 text analysis, dominant element, mizaanAnalyzeAsync, mizaanCalcBast |
| `lib/mizaan9Data.js` | Dataset A constants — planets, hours, days, purposes, dayNight, elements, degrees |
| `lib/mizaan9DataB.js` | Dataset B constants — Section 2 Bast tables, getBastLevelB |
| `lib/mizaanDataSets.js` | DATASET_A, DATASET_B, getDataSet() router |
| `components/mizaan/MizaanPipelineFull` | Section 1 — Esma-i Kitabet + Vefk |
| `components/mizaan/EsmaAvanSection` | Section 2 — Esma-i A'van + Vefk |
| `components/mizaan/EsmaKasemSection` | Section 3 — Esma-i Kasem + Vefk |
| `components/mizaan/FinalVefkSummary` | Three-Vefk summary + Writing Assistant (Arabic-Indic numerals) |
| `components/mizaan/SatrVahidGrouping` | Seed letter derivation chain UI |
| `components/mizaan/MizaanFinalSummary` | Grand total / sacred value calculation display |
| `components/mizaan/KasamSection` | Kasam invocation section |
| `components/mizaan/ConclusionRulesPanel.jsx` | Conclusion A (rules 1–7) + Conclusion B (Malayalam) |
| `components/mizaan/Mizaan1` | M1 — input text analysis |
| `components/mizaan/Mizaan2` | M2 — element selection |
| `components/mizaan/Mizaan3` | M3 — day/night selection |
| `components/mizaan/Mizaan4` | M4 — hour selection |
| `components/mizaan/Mizaan5` | M5 — day selection |
| `components/mizaan/Mizaan6` | M6 — planet selection |
| `components/mizaan/Mizaan7` | M7 — purpose selection |
| `components/mizaan/Mizaan8` | M8 — khayr/sharr selection |
| `components/mizaan/Mizaan9Final` | M9 — element degree selection |

---

## Locked Constants

- `FIRST_BAST` — Pages 42–43, manuscript-locked
- `BAST_TABLE` — 5-level Bast values, pages 42–43, manuscript-locked
- `BAST_TABLE_B` — Section 2 alternative Bast values
- `VEFK_TEMPLATES` — fire/earth/air/water position templates, page 68
- `GALIB_ANASIR_VALUES` — fire 3550, earth 4015, air 3757, water 3342
- `ELEMENT_LETTERS` — element-to-letter mappings, pages 15–16, 44
- `istintak()` — digit-positional letter extraction, verified against p.38–40
- `buildVefk()` — Rubai engine, verified against p.316 (100% cell match)
- `validateVefk()` — magic square validator, all rows/cols/diags

---

## Locked Pipelines

### Section 1 — Esma-i Kitabet
1. Grand Bast + Grand Letters → Satr-i Vahid Total
2. Istintak → Seed Letters
3. Expand seed letters (4th or 5th Bast per Zevc/Ferd) in reverse order → All Expanded Letters
4. Sum expanded letters' First Bast → Vefk Source Number
5. buildVefk(source, element) → 4×4 Magic Square

### Section 2 — Esma-i A'van
- Input: Section 1 allExpandedLetters (read-only, never modified)
- Formula: avanBastTotal + avanLetterCount → Istintak → new seed → same pipeline

### Section 3 — Esma-i Kasem
- Input: Section 2 allExpandedLetters (read-only, never modified)
- Same pipeline as Sections 1 & 2

---

## Section Switching

- Section 1 uses `BAST_TABLE` (Dataset A) via `getBastLevel()`
- Section 2 uses `BAST_TABLE_B` (Dataset B) via `getBastLevelB()`
- `getBastLevelFn` prop passed through all pipeline components
- Zero state bleed between sections confirmed

---

## Writing Assistant

- Cells reveal in ascending numeric order
- Display uses Arabic-Indic numerals via `toArabicIndic()` (٠١٢٣٤٥٦٧٨٩)
- Internal sort and stored values use original integers — unchanged
- Per-section isolated state

---

## Vefk Engine Self-Test

Self-test runs at module load in `mizaanPostEngine.js`.  
Tests: S=80/81/82/83 (fire), S=100 (earth), S=200 (air), S=300 (water).  
Any invariant failure throws immediately — never ships silently.

---

## Confirmation Checklist

- [x] Mizaan locked
- [x] Section 1 protected
- [x] Section 2 protected
- [x] Section 3 protected
- [x] Dataset A protected
- [x] Dataset B protected
- [x] All BAST tables locked
- [x] Vefk engine locked
- [x] Final Summary locked
- [x] Writing Assistant locked (Arabic-Indic display)
- [x] Conclusion A locked
- [x] Conclusion B locked
- [x] Build PASS
- [x] Lint PASS
- [x] No pending Mizaan modifications

---

## Change Policy

Any future modification to a file in the protected list above requires:

1. **Explicit written approval** from the project owner
2. **Specific identification** of the exact change (formula / constant / UI)
3. **Confirmation** that no other Mizaan files are affected

Automatic refactoring, optimization passes, and style cleanups are **prohibited** on all protected files.

---

*Checkpoint: MIZAAN_LOCKED_FINAL — 2026-06-19*