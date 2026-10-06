# KNOWLEDGE BASE EXPANSION RULE

## Core Principles

### 1. ADDITIVE ONLY
- **NEVER** replace existing PDF knowledge
- **NEVER** overwrite previous books
- **NEVER** delete existing rules
- **ALWAYS** keep all existing books active
- **ALWAYS** merge new knowledge with existing

### 2. SOURCE ATTRIBUTION
Every rule MUST record:
- **Book Name** (e.g., "PDF2", "HAVALSS", "TAHA")
- **Chapter / Section** (e.g., "Lunar Mansions p.64-74")
- **Rule Text** (exact text from source)
- **Rule Type** (e.g., "lunar_mansion", "day_ruler", "planetary_hour")
- **Confidence Level** ("high", "medium", "low")
- **Topic** (e.g., "marriage", "love", "healing")

### 3. MULTIPLE OPINIONS
When multiple books discuss the same topic:
- ✅ Show ALL available opinions
- ✅ Identify agreements between books
- ✅ Identify contradictions between books
- ✅ **NEVER** discard any source
- ✅ Display source attribution for every rule

### 4. SOURCE DISPLAY FORMAT
```
Book A (PDF2):
- Rule: Mansions 2, 3, 6, 7, 11 are suitable for marriage
- Chapter: Lunar Mansions p.64-74
- Confidence: High

Book B (Havâss'ın Derinlikleri):
- Rule: Monday, Wednesday, Thursday, Friday are favorable
- Chapter: p.50-51
- Confidence: High

Book C (Taha Manuscript):
- Rule: Taurus, Cancer, Pisces are favorable signs
- Chapter: p.120-125
- Confidence: Medium
```

### 5. CONTRADICTION HANDLING
If different books give different rulings:
- Display ALL of them
- Clearly identify their source
- Show confidence levels
- **NEVER** invent missing information
- **NEVER** choose one over another

### 6. AUTHORITY HIERARCHY
**Uploaded PDF books are the HIGHEST authority**
- No external astrological interpretations
- No internet-based astrology
- No generic interpretations
- Only PDF-sourced rules

### 7. FUTURE PDF UPLOADS
When new PDFs are uploaded:
1. **EXTEND** the knowledge base
2. **DO NOT REPLACE** existing books
3. Add new rules to existing topics
4. Create new topics if needed
5. Maintain all source attributions

## Implementation

### File: `lib/astroClockKnowledgeBaseFramework.js`

```javascript
export const SOURCE_BOOKS = {
  PDF2: { /* metadata */ },
  HAVALSS: { /* metadata */ },
  TAHA: { /* metadata */ }
  // Future books added here, never replacing
};

export const ACTION_TIMING_RULES = {
  marriage: [
    {
      id: "marriage_001",
      book: "PDF2",
      chapter: "Lunar Mansions p.64-74",
      ruleText: "Mansions 2, 3, 6, 7, 11, 15, 16, 20, 24, 26 are suitable",
      ruleType: "lunar_mansion",
      confidence: "high",
      topic: "marriage"
    },
    {
      id: "marriage_002",
      book: "HAVALSS",
      chapter: "p.50-51",
      ruleText: "Monday, Wednesday, Thursday, Friday are favorable",
      ruleType: "day_ruler",
      confidence: "high",
      topic: "marriage"
    }
    // New rules appended, never replacing
  ]
};
```

### Usage in Components

```javascript
import { getRulesForTopic } from "@/lib/astroClockKnowledgeBaseFramework.js";

const rules = getRulesForTopic("marriage");
// Returns ALL rules from ALL books for marriage
// Each rule has full source attribution
```

## Knowledge Base Validation

Run validation to ensure integrity:

```javascript
import { validateKnowledgeBase } from "@/lib/astroClockKnowledgeBaseFramework.js";

const report = validateKnowledgeBase();
// Returns: { valid, issues, stats, mode, version }
```

## Current Status

**Mode:** ADDITIVE_ONLY  
**Version:** 1.0.0  
**Total Books:** 3 (PDF2, HAVALSS, TAHA)  
**Total Topics:** 15  
**Total Rules:** 30+ (2+ per topic)

## Topics Covered

1. Marriage (النكاح)
2. Love / Muhabbah (المحبة)
3. Separation / Tafriq (التفريق)
4. Rizq (الرزق)
5. Healing (الشفاء)
6. Spiritual Work (العمل الروحي)
7. Vefk Creation (وفق)
8. Talisman Creation (طلسم)
9. Hadim Work (خادم)
10. Ism Work (اسم)
11. Travel (السفر)
12. Business (التجارة)
13. Construction (البناء)
14. Purchase (الشراء)
15. Conflict (النزاع)

## Future Expansion

When ingesting new PDFs:
1. Add book to `SOURCE_BOOKS` registry
2. Extract rules by topic
3. Add rules to `ACTION_TIMING_RULES` with full attribution
4. Run validation
5. Update documentation

**NEVER** modify existing rules — only append new ones.

---

**Last Updated:** 2024-01-15  
**Status:** Active  
**Mode:** Locked (Additive Only)