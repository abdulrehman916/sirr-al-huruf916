# BAST HUROOF MODULE — PERMANENT LOCK

## Status: STABLE RELEASE
**Version:** 1.0.0  
**Lock Date:** 2026-06-13  
**Classification:** LOGIC LOCKED | CALCULATIONS LOCKED | WORKFLOW LOCKED

---

## LOCKED COMPONENTS

The following components, logic, and data are **PERMANENTLY FROZEN**:

### 1. BAST Tables
- ✅ BAST Level 1 (Evvel) — All 28 letter values
- ✅ BAST Level 2 (Sani) — All 28 letter values
- ✅ BAST Level 3 (Salis) — All 28 letter values
- ✅ BAST Level 4 (Rabi) — All 28 letter values
- ✅ BAST Level 5 (Hamis) — All 28 letter values
- ✅ BAST_LOOKUP mapping
- ✅ BAST_FIELD_MAP mapping

### 2. Decomposition Logic
- ✅ Text input → letter extraction
- ✅ Letter normalization rules (hamza variants, etc.)
- ✅ Number input → direct Akram conversion
- ✅ AkramCard decomposition algorithm (toAkramPieces)
- ✅ Digit-to-letter mapping (UNITS, TENS, HUNDREDS)
- ✅ Thousand marker (غ) handling rules

### 3. Calculation Engines
- ✅ calcBastHuroof() function
- ✅ All 5 Bast level calculations
- ✅ Total value summation
- ✅ Letter count calculations
- ✅ Secondary Akram generation (transformAkramLetters)
- ✅ Primary → Secondary transformation pipeline

### 4. Letter Ordering & Sequencing
- ✅ Primary Akram letter order
- ✅ Secondary Akram letter order
- ✅ Breakdown tile display order
- ✅ Combined letters sequence

### 5. Data Flow
- ✅ Text input workflow
- ✅ Number input workflow
- ✅ All results aggregation
- ✅ State persistence via PageStateContext

---

## ALLOWED MODIFICATIONS

Future edits are **ONLY** permitted for:

- ✅ Styling (colors, gradients, shadows)
- ✅ Typography (font sizes, weights — visual only)
- ✅ Spacing (padding, margin, gap)
- ✅ Layout improvements (card arrangement, grid structure)
- ✅ Responsiveness (mobile/tablet/desktop adaptations)
- ✅ Visual design enhancements (animations, transitions)
- ✅ UI component structure (without changing data flow)

---

## PROHIBITED MODIFICATIONS

The following are **STRICTLY FORBIDDEN** unless explicitly unlocked:

- ❌ Any BAST value changes (Level 1-5)
- ❌ Decomposition algorithm modifications
- ❌ Akram conversion logic changes
- ❌ Letter sequencing/order alterations
- ❌ Calculation formula updates
- ❌ Total value computation changes
- ❌ Letter count logic modifications
- ❌ Data pipeline workflow changes
- ❌ BAST_LOOKUP or BAST_FIELD_MAP edits
- ❌ Normalization rule changes

---

## FILE LOCATIONS

### Core Logic
- `lib/bastHuroofEngine.js` — Calculation engine (LOCKED)
- `lib/bastHuroofData.js` — BAST tables (LOCKED)
- `components/AkramCard.jsx` — Akram decomposition (LOCKED)
- `components/SecondaryAkram.jsx` — Secondary transformation (LOCKED)

### UI Components
- `pages/BastHuroofPage.jsx` — Main page (UI edits allowed)
- `components/PageLayout.jsx` — Layout (UI edits allowed)
- `components/PageTitle.jsx` — Header (UI edits allowed)

---

## VERIFICATION CHECKLIST

Before any future edit to this module, verify:

- [ ] Does this change affect any BAST values? → REJECT
- [ ] Does this change modify decomposition logic? → REJECT
- [ ] Does this change alter letter ordering? → REJECT
- [ ] Does this change impact calculations? → REJECT
- [ ] Does this change modify the data pipeline? → REJECT
- [ ] Is this purely a visual/styling/layout change? → ALLOW

---

## UNLOCK PROCEDURE

To modify any locked component, the user must:

1. Explicitly state "UNLOCK BAST MODULE" or similar
2. Specify which locked component needs modification
3. Confirm understanding of the change impact
4. Approve the unlock before any code changes

---

## NOTES

- This module is production-stable and manuscript-verified
- All calculations follow the canonical Bast-1 manuscript values
- Secondary Akram logic is isolated and independent
- Number mode and text mode pipelines are decoupled
- No shared logic with other modules (MIZAN, FAAL, VEFK, etc.)

---

**LOCK STATUS:** ✅ ACTIVE  
**LAST VERIFIED:** 2026-06-13  
**NEXT REVIEW:** User-initiated unlock request only