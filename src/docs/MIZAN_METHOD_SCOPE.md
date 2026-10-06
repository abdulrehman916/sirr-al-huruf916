# MIZAN METHOD — SCOPE DECLARATION

**Effective Date:** 2026-06-12  
**Authority:** Usûlül Bast fi Sirril Evfâk vel Havas — İdris Çelebi

---

## ✓ IN SCOPE: 4×4 RUBAI VEFKS

The following construction rules are **FULLY VERIFIED** and **PRODUCTION-READY** for 4×4 grids ONLY:

### Verified Components

| Component | Manuscript Source | Status |
|-----------|------------------|--------|
| Fire Template | Pages 68, 314, 316 | ✓ Verified |
| Earth Template | Page 68 | ✓ Verified |
| Air Template | Page 68 | ✓ Verified |
| Water Template | Page 68 | ✓ Verified |
| Sequential Continuation | Pages 314, 316 | ✓ Verified |
| Remainder Corrections | Pages 314, 316 | ✓ Verified |
| Elemental Selection Rule | Page 68 | ✓ Verified |

### Implementation

**File:** `lib/mizaanPostEngine.js`  
**Function:** `buildVefk(S, element)`  
**Grid Size:** 4×4 ONLY  
**Status:** ✓ Production-ready

---

## ✗ OUT OF SCOPE: OTHER GRID SIZES

The following grid sizes are **NOT IMPLEMENTED** and **NOT VERIFIED**:

| Grid Size | Name | Status | Reason |
|-----------|------|--------|--------|
| 3×3 | Musallas | ✗ Not Implemented | No manuscript evidence |
| 5×5 | Humasi | ✗ Not Implemented | No manuscript evidence |
| 6×6 | Sudasi | ✗ Not Implemented | No manuscript evidence |
| 7×7 | Suba'i | ✗ Not Implemented | No manuscript evidence |
| 8×8 | Sumani | ✗ Not Implemented | No manuscript evidence |

### Prohibited Actions

**DO NOT:**
- Apply Rubai (4×4) construction rules to other grid sizes
- Assume sequential continuation method works for other sizes
- Use elemental templates for non-4×4 grids
- Extrapolate remainder correction rules to other sizes
- Implement any grid size without explicit manuscript evidence

**REQUIRES:**
- Independent manuscript evidence for each grid size
- Separate validation per grid size
- Manuscript-derived construction rules (not Rubai extrapolation)

---

## MANUSCRIPT AUTHORITY REQUIREMENT

### For Current 4×4 Implementation

✓ Pages 68, 314, 316 provide explicit authority  
✓ Cell-by-cell verification completed  
✓ Algorithm reproduces manuscript exactly

### For Future Grid Sizes (3×3, 5×5, 6×6, 7×7, 8×8)

**Required Evidence:**
1. Manuscript page number (clear reference)
2. Source number (S) from manuscript text
3. Complete grid (all cells, row by row)
4. Construction method (if described)
5. Elemental correspondence (if applicable)

**Validation Steps:**
1. Extract manuscript grid exactly
2. Calculate actual Magic Constant from manuscript
3. Compare with Source Number (may differ)
4. Derive construction rules FROM manuscript
5. Implement algorithm that reproduces manuscript
6. Validate against ALL found examples

---

## CRITICAL PRINCIPLES

### 1. No Cross-Application

**Rubai (4×4) rules DO NOT APPLY to other grid sizes.**

Each grid size is independent and requires:
- Separate manuscript evidence
- Independent validation
- Size-specific construction rules

### 2. Manuscript is Authority

**Mathematical theory is secondary to manuscript evidence.**

If manuscript contradicts formula:
- Follow manuscript, not formula
- Document the discrepancy
- Do not "fix" manuscript to match theory

### 3. Empirical Observations

**MC = Source Number is empirical, not universal.**

Verified for: Fire (4×4) examples on Pages 314, 316  
Unknown for: Other elements, other grid sizes  
Status: Observation, not mathematical law

### 4. Independent Validation

**Each grid size stands or falls on its own manuscript evidence.**

No assumptions from 4×4 to other sizes.
No extrapolation of Rubai rules.
No implementation without manuscript.

---

## DEVELOPMENT CHECKLIST

### Before Implementing Any Grid Size

- [ ] Manuscript page number identified
- [ ] Complete grid extracted (all cells)
- [ ] Source number documented
- [ ] Construction method described (if available)
- [ ] Elemental correspondence (if applicable)
- [ ] Algorithm reproduces manuscript exactly
- [ ] Cell-by-cell verification completed
- [ ] Magic Constant calculated from manuscript
- [ ] MC vs Source relationship documented
- [ ] All found examples validated

### Current Status: 4×4 Rubai

- [x] All checklist items completed
- [x] Production-ready implementation
- [x] Manuscript-verified algorithm

### Future Grid Sizes

- [ ] 3×3 Musallas — Awaiting manuscript
- [ ] 5×5 Humasi — Awaiting manuscript
- [ ] 6×6 Sudasi — Awaiting manuscript
- [ ] 7×7 Suba'i — Awaiting manuscript
- [ ] 8×8 Sumani — Awaiting manuscript

---

**SCOPE LOCK: 4×4 RUBAI ONLY**

No extensions to other grid sizes without explicit manuscript authority.
No cross-application of Rubai construction rules.
Independent validation required for each grid size.