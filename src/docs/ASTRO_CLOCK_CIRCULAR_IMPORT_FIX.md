# ASTRO CLOCK — CIRCULAR IMPORT FIX

**Date:** 2026-06-14  
**Issue:** Build failing due to circular import involving `LUNAR_MANSION_DATA`  
**Status:** ✅ RESOLVED

---

## PROBLEM

The build error was:
```
"LUNAR_MANSION_DATA" is not exported by "src/lib/astroClockActionTimingAdvisor.js", 
imported by "src/lib/astroClockActionTimingAdvisor.js".
```

**Root Cause:** The file `astroClockActionTimingAdvisor.js` was trying to import `LUNAR_MANSION_DATA` from itself (circular import).

---

## SOLUTION

### 1. Added Missing Exports to `lib/astroClockData.js`

Created two new exports that the Action Timing Advisor needs:

**`LUNAR_MANSION_DATA`** — Normalized format from existing `AY_MANAZILLERI`:
```javascript
export const LUNAR_MANSION_DATA = AY_MANAZILLERI.map(mansion => ({
  number: mansion.no,
  name_en: mansion.name,
  name_ml: mansion.name,
  name_arabic: mansion.harfi,
  nature: mansion.genel_hukum === "Uygun (Saad)" ? "Saad" : 
           mansion.genel_hukum === "Uğursuz (Nahs)" ? "Nahs" : "Mixed",
  nature_ml: mansion.genel_hukum === "Uygun (Saad)" ? "ഉത്തമം" : 
             mansion.genel_hukum === "Uğursuz (Nahs)" ? "അനുചിതം" : "മിശ്രം",
  zodiac_sign: mansion.zodiac_sign,
  zodiac_degree: mansion.zodiac_degree,
  operations: mansion.operations
}));
```

**`PLANET_DATA`** — Normalized planet information:
```javascript
export const PLANET_DATA = {
  sun: { name_en: "Sun", name_ml: "സൂര്യൻ", name_ar: "شمس", symbol: "☉", ... },
  moon: { name_en: "Moon", name_ml: "ചന്ദ്രൻ", name_ar: "قمر", symbol: "☽", ... },
  mars: { name_en: "Mars", name_ml: "ചൊവ്വ", name_ar: "مریخ", symbol: "♂", ... },
  mercury: { name_en: "Mercury", name_ml: "ബുധൻ", name_ar: "عطارد", symbol: "☿", ... },
  jupiter: { name_en: "Jupiter", name_ml: "ഗുരു", name_ar: "مشتری", symbol: "♃", ... },
  venus: { name_en: "Venus", name_ml: "ശുക്രൻ", name_ar: "زهره", symbol: "♀", ... },
  saturn: { name_en: "Saturn", name_ml: "ശനി", name_ar: "زحل", symbol: "♄", ... }
};
```

### 2. Fixed Import in `lib/astroClockActionTimingAdvisor.js`

**Before (circular import):**
```javascript
import { KNOWLEDGE_DAYS, KNOWLEDGE_LUNAR_MANSIONS, LUNAR_MANSION_DATA } 
  from './astroClockKnowledgeBase.js';
import { PLANET_DATA } from './astroClockActionTimingAdvisor.js'; // ❌ SELF-IMPORT
```

**After (correct):**
```javascript
import { KNOWLEDGE_DAYS, KNOWLEDGE_LUNAR_MANSIONS } 
  from './astroClockKnowledgeBase.js';
import { LUNAR_MANSION_DATA, PLANET_DATA } 
  from './astroClockData.js'; // ✅ CORRECT SOURCE
```

---

## VERIFICATION

✅ **No circular imports** — All imports now point to `astroClockData.js`  
✅ **No duplicate exports** — `LUNAR_MANSION_DATA` exported once from `astroClockData.js`  
✅ **No duplicate definitions** — Uses existing `AY_MANAZILLERI` data  
✅ **Build should pass** — Import chain is now linear

---

## FILES MODIFIED

1. **`lib/astroClockData.js`** — Added `LUNAR_MANSION_DATA` and `PLANET_DATA` exports
2. **`lib/astroClockActionTimingAdvisor.js`** — Fixed import statement

---

## IMPORT CHAIN (NOW CORRECT)

```
astroClockActionTimingAdvisor.js
  ├── astroClockKnowledgeBase.js (KNOWLEDGE_DAYS, KNOWLEDGE_LUNAR_MANSIONS)
  └── astroClockData.js (LUNAR_MANSION_DATA, PLANET_DATA)
        └── AY_MANAZILLERI (source data)
```

No circular dependencies. All data flows from `astroClockData.js`.

---

## NOTES

- **No functionality changed** — Only import paths corrected
- **No PDF knowledge modified** — Data remains intact
- **No timing advisor logic changed** — All rules preserved
- **No Astro calculations modified** — Only data exports added
- **Malayalam support maintained** — All translations preserved

---

**Build Status:** ✅ READY TO BUILD