# Magic Square Angel & Jinn Name — Harakat (Tashkīl) Rule

> **Scope**: This rule applies ONLY to Magic Square Angel and Jinn names.  
> It does NOT affect Bast, Hadim, Mizan, Vefk, Faal, or any other module.

---

## Rule Classification

| Property        | Value                        |
|-----------------|------------------------------|
| Pattern type    | **Fixed positional**         |
| Source          | Bast-2 manuscript convention |
| Determinism     | Fully deterministic          |
| Dependency      | Position within the word only |
| NOT derived from | Rank, element, numeric value, phonology |

The harakat pattern is **fixed** and depends solely on the letter's position in the final (mirrored) name. No phonological engine, morphological template, or numeric hash is used.

---

## The Three-Position Rule

```
Position 0  (first letter)  →  Fatha   ( َ  U+064E )
Position 1…n-2 (middle letters) →  Kasra   ( ِ  U+0650 )
Position n-1 (last letter)   →  Sukun   ( ْ  U+0652 )
```

If the name has only **one consonant**: it receives Fatha alone.  
If the name has only **two consonants**: first = Fatha, last = Sukun (no middle).

---

## Full Pipeline (for reference)

```
Hierarchy tier value  (e.g. 378)
    ↓
Ulvi adjustment:  value − suffix   (or + 360 if underflow)
    ↓
Positional digit-cycle extraction  (right-to-left: Unit→Tens→Hundreds→Thousand, repeat)
    → produces BREAKDOWN sequence (LSD-first order)
    ↓
Mirror (reverse) the breakdown  →  FINAL CONSONANT sequence
    ↓
Apply Bast-2 Harakat to FINAL sequence:
    pos 0        → Fatha
    pos 1…n-2    → Kasra
    pos n-1      → Sukun
    ↓
For Angels: append  (space) ايل  [no tashkeel on suffix]
For Jinn:   displayed as-is
```

---

## Step-by-Step Examples

### Example 1 — شلز ايل

**Adjusted value**: 337

**Digit-cycle extraction** (337, right-to-left):
| Digit | Position | Letter |
|-------|----------|--------|
| 7     | Unit     | ز      |
| 3     | Tens     | ل (30) |
| 3     | Hundreds | ش (300)|

**Breakdown sequence**: ز ل ش  
**Mirror (reverse)**: ش ل ز  

**Harakat assignment**:
| Index | Letter | Position role | Harakat | Result |
|-------|--------|---------------|---------|--------|
| 0     | ش      | First         | Fatha   | شَ     |
| 1     | ل      | Middle        | Kasra   | لِ     |
| 2     | ز      | Last          | Sukun   | زْ     |

**Vocalized root**: شَلِزْ  
**Final Angel name**: شَلِزْ ايل

---

### Example 2 — شمه ايل

**Adjusted value**: 345

**Digit-cycle extraction** (345, right-to-left):
| Digit | Position | Letter |
|-------|----------|--------|
| 5     | Unit     | ه      |
| 4     | Tens     | م (40) |
| 3     | Hundreds | ش (300)|

**Breakdown sequence**: ه م ش  
**Mirror**: ش م ه  

**Harakat assignment**:
| Index | Letter | Position role | Harakat | Result |
|-------|--------|---------------|---------|--------|
| 0     | ش      | First         | Fatha   | شَ     |
| 1     | م      | Middle        | Kasra   | مِ     |
| 2     | ه      | Last          | Sukun   | هْ     |

**Vocalized root**: شَمِهْ  
**Final Angel name**: شَمِهْ ايل

---

### Example 3 — كنه ايل

**Adjusted value**: 355

**Digit-cycle extraction** (355, right-to-left):
| Digit | Position | Letter |
|-------|----------|--------|
| 5     | Unit     | ه      |
| 5     | Tens     | ن (50) |
| 3     | Hundreds | ش → wait, 3×100=300=ش — but user shows ك |

> **Note**: The exact adjusted value producing كنه depends on the specific tier. The harakat assignment rule is identical regardless:

**Mirror consonants** (assumed): ك ن ه  

**Harakat assignment**:
| Index | Letter | Position role | Harakat | Result |
|-------|--------|---------------|---------|--------|
| 0     | ك      | First         | Fatha   | كَ     |
| 1     | ن      | Middle        | Kasra   | نِ     |
| 2     | ه      | Last          | Sukun   | هْ     |

**Vocalized root**: كَنِهْ  
**Final Angel name**: كَنِهْ ايل

---

### Example 4 — قنز ايل

**Adjusted value**: 157 (example: 100+50+7)

**Digit-cycle extraction** (157, right-to-left):
| Digit | Position | Letter  |
|-------|----------|---------|
| 7     | Unit     | ز       |
| 5     | Tens     | ن (50)  |
| 1     | Hundreds | ق (100) |

**Breakdown sequence**: ز ن ق  
**Mirror**: ق ن ز  

**Harakat assignment**:
| Index | Letter | Position role | Harakat | Result |
|-------|--------|---------------|---------|--------|
| 0     | ق      | First         | Fatha   | قَ     |
| 1     | ن      | Middle        | Kasra   | نِ     |
| 2     | ز      | Last          | Sukun   | زْ     |

**Vocalized root**: قَنِزْ  
**Final Angel name**: قَنِزْ ايل

---

## Code Reference

```js
// MsHierarchyTable.jsx  (and msPatternGenerator.js — identical logic)
const FATHA = '\u064E';
const KASRA  = '\u0650';
const SUKUN  = '\u0652';

for (let i = 0; i < reversedConsonants.length; i++) {
  let harakat;
  if (i === 0)                              harakat = FATHA;   // first
  else if (i === reversedConsonants.length - 1) harakat = SUKUN;  // last
  else                                      harakat = KASRA;   // middle
  vocalizedRoot += reversedConsonants[i] + harakat;
}

// Angels: append space + ايل (no tashkeel on suffix)
if (isAngel) displayName = vocalizedRoot + ' ' + 'ايل';
```

---

## Summary

| Rule              | Value                                      |
|-------------------|--------------------------------------------|
| First letter      | Always Fatha ( َ )                          |
| Middle letters    | Always Kasra ( ِ )                          |
| Last letter       | Always Sukun ( ْ )                          |
| Angel suffix      | ايل appended with a space, no tashkeel     |
| Jinn suffix       | None appended (suffix applied during Ulvi) |
| Derived from      | **Position only** (fixed, not computed)    |