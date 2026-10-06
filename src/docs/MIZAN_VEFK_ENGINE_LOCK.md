# MIZAN VEFK ENGINE — VERIFIED, STABLE, COMPLETE

**Status: LOCKED — DO NOT MODIFY**
**Locked on: 2026-06-12**

---

## What Is Locked

The following functions in `lib/mizaanPostEngine.js` are permanently locked:

- `buildVefk(S, element)` — core 4×4 Rubai magic square generation
- `validateVefk(grid, mc)` — row / column / diagonal verification
- `VEFK_TEMPLATES` — all four elemental position templates (Fire, Earth, Air, Water)

---

## Verified Invariants (must ALL hold for every input)

| Rule | Requirement |
|------|-------------|
| MC = Source | `grid[0].sum === S` |
| All 4 rows | Each row sum === MC |
| All 4 columns | Each column sum === MC |
| Both diagonals | Main diagonal === MC, Anti-diagonal === MC |
| Remainder (Kesr) | Distributed via balanced transversal — no row/col/diag is disturbed |

### Algorithm (DO NOT CHANGE)

```
C = floor((S - 34) / 4)
extra = S - (4C + 34)          →  always 0, 1, 2, or 3

value[p] = C + p               base value for template position p (1..16)

extra = 0 → no adjustment
extra = 1 → +1 to 4 upper-half positions forming one balanced transversal
             (1 per row, 1 per col, 1 per each diagonal)
extra = 2 → +1 to ALL 8 upper-half positions (9..16)
extra = 3 → +1 to ALL 8 upper-half + 4 lower-half balanced transversal
```

**Verified against manuscript pages 314, 316 — 100% cell match.**

---

## Elemental Templates (Page 68 — Manuscript Authority)

### Fire
```
 8 11 14  1
13  2  7 12
 3 16  9  6
10  5  4 15
```

### Earth
```
15  4  5 10
 6  9 16  3
12  7  2 13
 1 14 11  8
```

### Air
```
 1 14 11  8
12  7  2 13
 6  9 16  3
15  4  5 10
```

### Water
```
10  5  4 15
 3 16  9  6
13  2  7 12
 8 11 14  1
```

---

## Validation Gate — Required Before Any Future Mizan Change

Before merging ANY modification to `lib/mizaanPostEngine.js` or any component
that calls `buildVefk`, run the following mental (or code) checklist:

```
TEST_CASES = [
  { S: 80,   element: 'fire',  expected_mc: 80   },
  { S: 1696, element: 'fire',  expected_mc: 1696 },
  { S: 100,  element: 'earth', expected_mc: 100  },
  { S: 200,  element: 'air',   expected_mc: 200  },
  { S: 300,  element: 'water', expected_mc: 300  },
]

For each test case:
  result = buildVefk(S, element)
  assert result.grid[0].sum === S           // row 1
  assert result.grid[1].sum === S           // row 2
  assert result.grid[2].sum === S           // row 3
  assert result.grid[3].sum === S           // row 4
  assert col(0).sum === S                   // col 1
  assert col(1).sum === S                   // col 2
  assert col(2).sum === S                   // col 3
  assert col(3).sum === S                   // col 4
  assert main diagonal === S
  assert anti diagonal === S
```

**If ANY assertion fails → REJECT the modification.**

---

## What Is NOT Locked (Safe to Modify)

- UI styling, colors, fonts, layout
- Labels and section headers
- Audit table display (show/hide)
- Expanded letter values display
- Source pipeline (Mizan grand total → seed letters → expansion)
- Esma-i Kitabet / Avan / Kasem grouping logic
- Adding new display sections AROUND the Vefk grid

---

## Change Log

| Date       | Change | Author |
|------------|--------|--------|
| 2026-06-12 | Initial lock — engine verified against p.314, 316 | System |