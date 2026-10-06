# ═══════════════════════════════════════════════════════════════
# OPTION 2 — TECHNICAL IMPLEMENTATION MAP
# Esma-i Kitabet Pipeline (Manuscript-Locked)
# ═══════════════════════════════════════════════════════════════

**VERSION:** 1.0  
**STATUS:** READY FOR IMPLEMENTATION  
**AUTHORITY:** Usûlül Bast fi Sirril Evfâk vel Havas (pp.54–69)  
**SCOPE:** Pipeline Input → Esma-i Kitabet Names + Vefki MC

---

## SECTION 1: INPUTS (from OPTION 1)

### 1.1 Required Inputs

```typescript
interface Option2Inputs {
  // From MizaanFinalSummary
  grandBast: number;           // Sum of 9 Mizan Bast values
  grandLetters: number;        // Sum of 9 Mizan letter counts
  dominant: 'fire' | 'earth' | 'air' | 'water';  // From Mizaan1
  
  // Derived (calculated in Mizaan9Page)
  satirVahidTotal: number;     // grandBast + grandLetters
}
```

### 1.2 Validation Rules

| Field | Constraint | Error Condition |
|-------|------------|-----------------|
| `grandBast` | `> 0`, integer | If ≤ 0 → Skip OPTION 2 |
| `grandLetters` | `≥ 0`, integer | Always valid if grandBast > 0 |
| `dominant` | One of 4 element keys | Default to `'fire'` if invalid |
| `satirVahidTotal` | `> 0` | Auto-calculated, always valid |

---

## SECTION 2: PROCESSING STAGES

### STAGE 0: Pipeline Initialization
**Location:** `Mizaan9Page.jsx` lines 324-327  
**Function:** `runMizaanPostPipeline({ grandBast, grandLetters, dominant })`

**Processing:**
```javascript
const satirVahidTotal = grandBast + grandLetters;
const initialSeedLetters = istintak(satirVahidTotal);
const kitabet = generateEsmaLevel(initialSeedLetters, false, dominant);
const vefk = buildVefk(grandBast, dominant);
```

**Outputs:**
- `initialSeedLetters: string[]`
- `kitabet: KitabetResult`
- `vefk: VefkResult`

**Validation:**
- ✅ `satirVahidTotal > 0`
- ✅ `initialSeedLetters.length > 0`
- ✅ `kitabet.names.length > 0`

---

### STAGE A: Original Seed Letters
**Component:** `SatrVahidGrouping.jsx` — Section A (lines 209-227)  
**Input:** `initialSeedLetters` (from Stage 0)

**Display:**
- RTL letter chips with count badge
- FERD/ZEVC classification badge

**Validation:**
```javascript
const totalSeed = safeSeed.length;
const isSeedFerd = totalSeed % 2 !== 0;  // FERD if odd
```

**Expected Output:**
- Letters displayed in RTL order
- Count badge: `Count: {totalSeed}`
- Parity badge: `FERD (فرد)` or `ZEVC (زوج)`

---

### STAGE C: Individual Bast Derivations
**Component:** `SatrVahidGrouping.jsx` — Section C (lines 229-287)  
**Input:** `safeSeed[]`, `bastLevel` (4 or 5)

**Processing Logic:**
```javascript
// LAST → FIRST iteration order (manuscript rule)
for (let i = safeSeed.length - 1; i >= 0; i--) {
  const letter = safeSeed[i];
  const bastValue = getBastLevel(letter, bastLevel);
  const extracted = istintak(bastValue);
  derivations.push({ letter, bastValue, extracted, originalIndex: i });
}
```

**Validation:**
```javascript
// Every letter must have Bast value > 0
derivations.forEach(d => {
  if (d.bastValue <= 0) throw Error('Invalid Bast value');
  if (d.extracted.length === 0) throw Error('No letters extracted');
});

// Concatenated count = sum of extracted
const concatenatedCount = derivations.reduce((sum, d) => sum + d.extracted.length, 0);
```

**Expected Output:**
- Step-by-step derivation cards
- Each card shows: Letter → Bast Value → Extracted Letters
- First card = LAST seed letter (manuscript order)

---

### STAGE D: Combined Sequence — Satr-i Vahid
**Component:** `SatrVahidGrouping.jsx` — Section D (lines 289-310)  
**Input:** `concatenated` (from Stage C)

**Processing:**
```javascript
const satrCount = concatenated.length;
const isSatrFerd = satrCount % 2 !== 0;
const groupSize = isSatrFerd ? 5 : 4;
```

**Validation:**
```javascript
// Count must match
if (satrCount !== concatenated.length) throw Error('Count mismatch');

// Group size must be 4 or 5
if (groupSize !== 4 && groupSize !== 5) throw Error('Invalid group size');
```

**Expected Output:**
- RTL letter chips for concatenated sequence
- Count badge: `Count: {satrCount}`
- Parity badge: `FERD` or `ZEVC`
- Group size badge: `Group Size: {groupSize}`

---

### STAGE I: Esma-i Kitabet Grouping
**Component:** `SatrVahidGrouping.jsx` — Section I (lines 312-379)  
**Input:** `concatenated`, `groupSize`, `dominant`

**Processing Logic:**
```javascript
const remainder = concatenated.length % groupSize;
let finalSequence = [...concatenated];
let supplement = [];

if (remainder > 0) {
  const needed = groupSize - remainder;
  const galibValue = GALIB_ANASIR_VALUES[dominant];  // e.g., 3550 for fire
  const galibLetters = istintak(galibValue);
  supplement = galibLetters.slice(0, needed);
  finalSequence = [...concatenated, ...supplement];  // APPEND to END
}

// Group into names
const groups = [];
for (let i = 0; i < finalSequence.length; i += groupSize) {
  const groupLetters = finalSequence.slice(i, i + groupSize);
  groups.push({
    letters: groupLetters,
    name: groupLetters.join(''),
    groupNumber: Math.floor(i / groupSize) + 1
  });
}
```

**Validation:**
```javascript
// Final sequence must be divisible by groupSize
if (finalSequence.length % groupSize !== 0) {
  throw Error('Final sequence not divisible by group size');
}

// Every group must have exactly groupSize letters
groups.forEach(g => {
  if (g.letters.length !== groupSize) {
    throw Error(`Group ${g.groupNumber} has wrong letter count`);
  }
});

// Supplement must come from Galib Anasir
if (supplement.length > 0) {
  const galibLetters = istintak(GALIB_ANASIR_VALUES[dominant]);
  supplement.forEach((letter, i) => {
    if (letter !== galibLetters[i]) {
      throw Error('Supplement letter mismatch');
    }
  });
}
```

**Expected Output:**
- Remainder correction notice (if remainder > 0)
- Group cards showing: Group Number → Letters → Name
- Each group has exactly `groupSize` letters

---

### STAGE J: Esma-i Kitabet Names
**Component:** `SatrVahidGrouping.jsx` — Section J (lines 381-419)  
**Input:** `groups[]` (from Stage I)

**Display:**
- Sequential name list (Group 1, Group 2, ...)
- Letter count per name
- Total names count

**Validation:**
```javascript
// Names must be in order
groups.forEach((g, i) => {
  if (g.groupNumber !== i + 1) {
    throw Error('Group numbering out of sequence');
  }
});

// Total must match
if (groups.length !== totalNames) {
  throw Error('Total names count mismatch');
}
```

**Expected Output:**
- Ordered name list with badges
- Total count badge at bottom

---

### STAGE K: Esma-i Kitabet Vefki
**Component:** `EsmaVefkiSection.jsx`  
**Input:** `satrVahidLetters` (concatenated from Stage D), `groups[]`, `dominant`

**Processing Logic:**
```javascript
// CRITICAL: MC from Section D letters ONLY (not group totals)
const magicConstant = concatenated.reduce((sum, letter) => {
  return sum + (FIRST_BAST[letter] || 0);
}, 0);

// Build 4×4 Vefk
const vefk = buildVefk(magicConstant, dominant);
```

**Validation:**
```javascript
// MC must equal sum of First Bast values
const expectedMC = concatenated.reduce((sum, l) => sum + (FIRST_BAST[l] || 0), 0);
if (vefk.mc !== expectedMC) {
  throw Error(`Magic Constant mismatch: ${vefk.mc} !== ${expectedMC}`);
}

// Vefk must be magic (all rows/cols/diagonals sum to MC)
const isMagic = validateMagicSquare(vefk.grid, vefk.mc);
if (!isMagic) {
  throw Error('Vefk grid is not a magic square');
}
```

**Expected Output:**
- Magic Constant display (large, prominent)
- 4×4 Vefk grid with numbers
- Guardian name display
- Elemental template indicator

---

## SECTION 3: INTERMEDIATE STORAGE (for OPTION 3)

### 3.1 State Structure in `Mizaan9Page.jsx`

```javascript
const [option2State, setOption2State] = useState(null);

// Structure:
{
  // Stage 0 outputs
  satirVahidTotal: number,
  initialSeedLetters: string[],
  
  // Stage C outputs
  derivations: Derivation[],
  concatenated: string[],
  
  // Stage I outputs (kitabet)
  kitabet: {
    groups: Group[],
    finalExpandedLetters: string[],
    satrVahidCount: number,
    isFerd: boolean,
    isZevc: boolean,
    groupSize: 4 | 5,
    names: string[],
    remainder: number,
    supplementLetters: string[]
  },
  
  // Stage K outputs (vefk)
  vefk: {
    magicConstant: number,
    grid: number[][],
    guardianName: string,
    element: string,
    Q: number,  // Quotient from buildVefk
    R: number   // Remainder from buildVefk
  },
  
  // Validation results
  validation: {
    stageA: boolean,
    stageC: boolean,
    stageD: boolean,
    stageI: boolean,
    stageJ: boolean,
    stageK: boolean,
    allPassed: boolean
  }
}
```

### 3.2 Persistence Strategy

```javascript
// Save to page state on every calculation
useEffect(() => {
  if (kitabet && vefk) {
    setOption2State({
      satirVahidTotal,
      initialSeedLetters,
      derivations,
      concatenated,
      kitabet,
      vefk,
      validation: {
        stageA: true,
        stageC: true,
        stageD: true,
        stageI: true,
        stageJ: true,
        stageK: true,
        allPassed: true
      }
    });
  }
}, [kitabet, vefk]);
```

---

## SECTION 4: VALIDATION CHECKPOINTS

### Checkpoint 0: Pipeline Init
- [ ] `grandBast > 0`
- [ ] `grandLetters ≥ 0`
- [ ] `dominant` is valid element key
- [ ] `satirVahidTotal = grandBast + grandLetters`
- [ ] `initialSeedLetters.length > 0`

### Checkpoint A: Seed Letters
- [ ] `safeSeed` is non-empty array
- [ ] All characters are valid Arabic letters
- [ ] `totalSeed === safeSeed.length`
- [ ] FERD/ZEVC classification is correct

### Checkpoint C: Bast Derivations
- [ ] Every `bastValue > 0`
- [ ] Every `extracted.length ≥ 1`
- [ ] `concatenated.length === sum(extracted.lengths)`
- [ ] Iteration order is LAST → FIRST

### Checkpoint D: Combined Sequence
- [ ] `satrCount === concatenated.length`
- [ ] `groupSize` is 4 or 5
- [ ] Zevc/Ferd matches parity

### Checkpoint I: Grouping
- [ ] `finalSequence.length % groupSize === 0`
- [ ] Every group has `groupSize` letters
- [ ] Supplement letters match Galib Anasir Istintak
- [ ] Supplement appended to END (not beginning)

### Checkpoint J: Names
- [ ] Names in sequential order (1, 2, 3...)
- [ ] `totalNames === groups.length`
- [ ] Each name = concatenation of group letters

### Checkpoint K: Vefki MC
- [ ] MC = sum of FIRST_BAST values (Section D letters only)
- [ ] Vefk grid rows sum to MC
- [ ] Vefk grid columns sum to MC
- [ ] Vefk grid diagonals sum to MC
- [ ] Correct elemental template used

---

## SECTION 5: FINAL OPTION 2 OUTPUTS

### 5.1 Stored for OPTION 3

```javascript
{
  // Kitabet results (needed for A'van generation)
  kitabetGroups: Group[],
  kitabetFinalLetters: string[],
  kitabetGroupSize: 4 | 5,
  
  // Vefk constants (needed for final Vefk)
  vefkMagicConstant: number,
  vefkGrid: number[][],
  vefkGuardianName: string,
  
  // Pipeline metadata
  satrVahidTotal: number,
  dominant: string
}
```

### 5.2 Displayed to User

```javascript
{
  // All Sections A-K rendered in SatrVahidGrouping
  // Section A: Seed letters
  // Section C: Derivations
  // Section D: Concatenated sequence
  // Section I: Groups with remainder
  // Section J: Names list
  // Section K: Vefki MC + grid
}
```

---

## SECTION 6: IMPLEMENTATION ORDER

**Phase 1: Validation (Current State Audit)**
1. Read `SatrVahidGrouping.jsx` — verify all stages exist
2. Read `EsmaVefkiSection.jsx` — verify MC calculation
3. Read `mizaanPostEngine.js` — verify pipeline functions
4. Compare against manuscript rules
5. Document any discrepancies

**Phase 2: Fixes (If Needed)**
1. Fix any calculation errors
2. Add missing validation
3. Ensure manuscript compliance

**Phase 3: Storage (OPTION 3 Preparation)**
1. Add `option2State` to `Mizaan9Page.jsx`
2. Store all required intermediate values
3. Persist via `useEffect`

**Phase 4: Verification**
1. Test with sample input
2. Verify all checkpoints pass
3. Confirm OPTION 3 data is ready

---

## SECTION 7: MANUSCRIPT COMPLIANCE RULES

### Rule 1: Bast Extraction Order
> "Process letters from LAST to FIRST" — p.54

✅ Implementation: `for (let i = safeSeed.length - 1; i >= 0; i--)`

### Rule 2: Remainder Supplementation
> "Append Galib Anasir letters to complete the final group" — p.55

✅ Implementation: `finalSequence = [...concatenated, ...supplement]`

### Rule 3: Group Size Determination
> "Ferd groups by 5, Zevc groups by 4" — p.56

✅ Implementation: `groupSize = isFerd ? 5 : 4`

### Rule 4: Magic Constant Source
> "MC from Birinci Bast of Satr-i Vahid letters only" — p.68

✅ Implementation: `MC = Σ FIRST_BAST[letter]` for concatenated letters

### Rule 5: Galib Anasir Values
> "Use dynamic Galib Anasir values derived through Istintak" — p.55

✅ Implementation: `galibValue = GALIB_ANASIR_VALUES[dominant]`

---

# ═══════════════════════════════════════════════════════════════
# END OF OPTION 2 TECHNICAL MAP
# ═══════════════════════════════════════════════════════════════

**NEXT STEP:** Await approval of this map, then implement Phase 1 (Validation).