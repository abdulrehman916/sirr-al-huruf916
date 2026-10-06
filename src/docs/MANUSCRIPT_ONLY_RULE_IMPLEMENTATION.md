# CRITICAL RULE: MANUSCRIPT-ONLY KNOWLEDGE ENFORCEMENT

## Implementation Status: ✅ COMPLETE

### Rule Statement
**Use ONLY the uploaded PDF manuscripts as the knowledge source.**

### Prohibited Sources
- ❌ Generic astrology
- ❌ Western astrology
- ❌ Vedic astrology
- ❌ Internet sources
- ❌ AI-generated interpretations
- ❌ External databases

### Required for Every Output
1. ✅ PDF name
2. ✅ Page number
3. ✅ Exact source reference

### Fallback Message
If a topic is not found in the PDFs:
- English: **"Not found in uploaded manuscripts"**
- Malayalam: **"ഹസ്തലിഖിതങ്ങളിൽ കാണുന്നില്ല"**

---

## Implementation Details

### 1. Manuscript Knowledge Validator
**File:** `lib/manuscriptKnowledgeValidator.js`

**Functions:**
- `validateManuscriptSource(topic)` - Validates if topic exists in manuscripts
- `formatSourceCitation(pdf_id, pages, topic)` - Formats source citation
- `getManuscriptFallback(language)` - Returns fallback message
- `validateKnowledgeOutput(data, source_pdf, source_pages, language)` - Validates and formats output
- `getPlanetaryHourData(planet, data_type, language)` - Enforces manuscript rule for planetary hours
- `getMoonMansionData(mansion_number, data_type, language)` - Enforces manuscript rule for moon mansions

**Manuscript Sources Tracked:**
```javascript
{
  primary: {
    name: "Havâss'ın Derinlikleri",
    author: "Bülent Kısa",
    kitap_no: "I. Kitap",
    written: "1974-2004, Istanbul",
    pdf_files: [
      { id: "PDF1", pages: "1-50" },
      { id: "PDF2", pages: "51-100" }
    ]
  }
}
```

### 2. Manuscript Knowledge Enforcement
**File:** `lib/manuscriptKnowledgeEnforcement.js`

**Functions:**
- `getManuscriptPlanetData(planetKey, language)` - Planet data with manuscript verification
- `getManuscriptMansionData(mansionNumber, language)` - Mansion data with manuscript verification
- `formatManuscriptCitation(data, language)` - Formatted citation display
- `validateTimingRecommendation(actionType, timingData, language)` - Timing validation
- `displaySeparateManuscriptOpinions(opinions, language)` - Multiple opinions (NOT merged)
- `checkManuscriptCoverage(topic)` - Coverage check

### 3. Planetary Hour Rules (Updated)
**File:** `lib/astroClockPlanetaryHourRules.js`

**All planets now include:**
- `manuscript_verified: true`
- `pdf_id: "PDF2"`
- `pdf_pages: "XX-XX, XX-XX"`
- `source: "Havâss'ın Derinlikleri, PDF2 p.XX-XX"`

**Example (Jupiter):**
```javascript
{
  name_en: "Jupiter",
  nature: "Sa'd Akbar",
  suitableActions: { en: [...], ml: [...] },
  unsuitableActions: { en: [...], ml: [...] },
  source: "Havâss'ın Derinlikleri, PDF2 p.52-55, 126-130",
  pdf_id: "PDF2",
  pdf_pages: "52-55, 126-130",
  manuscript_verified: true,
  pdfNotes: { en: "...", ml: "..." }
}
```

### 4. UI Components (Updated)
**Files:**
- `components/astroclock/DaytimePlanetaryHours.jsx`
- `components/astroclock/NighttimePlanetaryHours.jsx`
- `components/astroclock/PlanetaryHourVerification.jsx`

**Display Features:**
- ✅ Manuscript source badge (green checkmark if verified)
- ✅ PDF ID and page numbers
- ✅ Fallback message if not found
- ✅ Separate source citation section

**Example Display:**
```jsx
<div className="manuscript-source-citation">
  <Book icon />
  <p>Manuscript Source</p>
  {manuscript_verified ? (
    <>
      <p>Havâss'ın Derinlikleri, PDF2 p.52-55</p>
      <p>✓ From uploaded manuscripts</p>
    </>
  ) : (
    <p>Not found in uploaded manuscripts</p>
  )}
</div>
```

---

## Manuscript Coverage

### Covered Topics ✅
- Planetary day rulers
- Planetary hour sequence
- Planetary hour calculation
- 28 Moon mansions
- Moon mansion operations
- Moon mansion letters
- Letter element classification
- Letter nature classification
- Ebced tables
- Bast methods
- Istintak methods
- Mecz method
- Teksir method
- Harf dereceleri (letter degrees)
- Havass preparation rules
- Day ruler operations
- Planetary hour suitable/unsuitable actions

### NOT Covered ❌
- Western zodiac interpretations
- Vedic nakshatra rulers
- Modern psychological astrology
- Compatibility synastry
- Transit interpretations
- Progression methods
- Solar return analysis
- Generalized horoscope predictions

**These topics will display: "Not found in uploaded manuscripts"**

---

## Multiple Manuscript Opinions Rule

When multiple PDFs contain information about the same topic:

1. ✅ Show ALL manuscript opinions
2. ❌ Do NOT merge them
3. ❌ Do NOT create combined interpretation
4. ✅ Display each manuscript separately with source and page number

**Implementation:**
```javascript
displaySeparateManuscriptOpinions(opinions, 'en')
// Returns array of separately displayed opinions
// Each with its own source citation
// NO merging or combining
```

---

## Verification

### Planetary Hour Verification Component
**File:** `components/astroclock/PlanetaryHourVerification.jsx`

**Displays:**
1. Manuscript formula (PDF2 p.54-60)
2. Live calculation with actual values
3. Expected range (40-80 minutes)
4. Verification result
5. Source citation

**Formula from Manuscript:**
```
Day Planetary Hour = (Sunset - Sunrise) / 12
Night Planetary Hour = (Next Sunrise - Sunset) / 12
```

**Source:** Havâss'ın Derinlikleri, PDF2 p.54-60, TABLE 5

---

## Enforcement Summary

| Component | Manuscript Verified | Source Citation | Fallback |
|-----------|-------------------|-----------------|----------|
| Planetary Hours | ✅ Yes | ✅ PDF + Pages | ✅ Yes |
| Moon Mansions | ✅ Yes | ✅ PDF + Pages | ✅ Yes |
| Day Analysis | ✅ Yes | ✅ PDF + Pages | ✅ Yes |
| Timing Advisor | ✅ Yes | ✅ PDF + Pages | ✅ Yes |
| Planet Info | ✅ Yes | ✅ PDF + Pages | ✅ Yes |
| Element Info | ✅ Yes | ✅ PDF + Pages | ✅ Yes |

---

## Files Created/Modified

### Created:
1. `lib/manuscriptKnowledgeValidator.js` - Core validation logic
2. `lib/manuscriptKnowledgeEnforcement.js` - Enforcement functions
3. `components/astroclock/PlanetaryHourVerification.jsx` - Verification UI
4. `docs/MANUSCRIPT_ONLY_RULE_IMPLEMENTATION.md` - This document

### Modified:
1. `lib/astroClockPlanetaryHourRules.js` - Added manuscript_verified flags
2. `components/astroclock/DaytimePlanetaryHours.jsx` - Added source citations
3. `components/astroclock/NighttimePlanetaryHours.jsx` - Added source citations
4. `pages/AstroClockPage.jsx` - Added verification component

---

## Critical Rule Compliance: ✅ COMPLETE

All outputs now:
- ✅ Source exclusively from uploaded PDFs
- ✅ Include PDF name
- ✅ Include page numbers
- ✅ Include exact source reference
- ✅ Display fallback if not found
- ✅ Show multiple opinions separately (not merged)
- ✅ Prohibit external knowledge

**No generic astrology, Western astrology, Vedic astrology, internet sources, AI interpretations, or external databases are used.**