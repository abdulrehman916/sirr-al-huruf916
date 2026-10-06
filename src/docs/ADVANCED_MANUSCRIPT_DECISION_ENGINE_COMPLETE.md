# ADVANCED MANUSCRIPT DECISION ENGINE - COMPLETE ✅

## OVERVIEW

Comprehensive manuscript-based timing guidance system that:
1. Searches ALL uploaded manuscripts for action-related rules
2. Checks current live astrological conditions
3. Compares manuscript rules against conditions
4. Displays best time, next suitable time, and full manuscript evidence

## 6-STEP PROCESS

### STEP 1: Search All Manuscripts
- User selects or enters custom action (marriage, muhabbah, rizq, travel, etc.)
- System searches PDF knowledge base framework
- Groups rules by manuscript source
- Returns: "No manuscript guidance found" if nothing exists

### STEP 2: Check Current Live Conditions
- Current planetary hour (planet, nature, time period)
- Current lunar mansion (number, name, nature)
- Current moon sign (zodiac, element)
- Current day/night period
- Current day ruler

### STEP 3: Compare Manuscript Rules Against Conditions
- Extract suitable mansions from rule text
- Extract suitable planets from rule text
- Extract suitable days from rule text
- Extract day/night requirements
- Score each match:
  - Mansion match: +3 points
  - Planet match: +2 points
  - Day match: +2 points
  - Day/night match: +1 point

### STEP 4: Display Comprehensive Timing Guidance

**Best Time Now:**
- ✓ Suitable now (score >= 3)
- 🟡 Wait (score 1-2)
- ✗ Not suitable (score 0)

**Next Suitable Time:**
- Calculate next 24 hours
- Find first matching configuration
- Display countdown

**Best Day:**
- Extract from manuscript rules
- Display with source citation

**Best Night Period:**
- Daytime or nighttime preference
- From manuscript requirements

**Suitable Mansions:**
- List all mansions mentioned in rules
- With manuscript citations

**Unsuitable Mansions:**
- Forbidden mansions from rules

**Suitable Planetary Hours:**
- Best planets for action

**Unsuitable Planetary Hours:**
- Forbidden planets

### STEP 5: Show Manuscript Evidence

For EVERY rule display:

1. **Book Name**
   - Havâss'ın Derinlikleri
   - Or other manuscript source

2. **Page Number**
   - PDF2 p.52-55
   - Or specific page range

3. **Original Manuscript Text**
   - Arabic text in Amiri font
   - Direct from PDF

4. **Malayalam Translation**
   - Full translation
   - In Malayalam font

5. **Why This Rule Applies Now**
   - "Current mansion (5) matches manuscript rule"
   - "Current Jupiter hour matches manuscript requirement"
   - etc.

### STEP 6: Multiple Manuscripts Handling

**If multiple manuscripts discuss same action:**
- ✓ Display each manuscript separately
- ✓ Show all rules from each source
- ✓ Never merge rules
- ✓ Never invent new rules
- ✓ Never use external knowledge

**If no manuscript rule exists:**
- Display: "No manuscript guidance found for this action."
- Display: "ഹസ്തലിഖിതത്തിൽ ഈ പ്രവർത്തനത്തിന് മാർഗ്ഗനിർദ്ദേശമില്ല."
- Do NOT generate recommendations

## SUPPORTED ACTIONS

Examples:
- Muhabbah / Love
- Marriage
- Rizq / Wealth
- Travel
- Healing
- Enemy work
- Hadim work
- Ism work
- Wafq creation
- Spiritual retreat
- Any custom action

## FILES CREATED

### 1. Decision Engine Library
**File:** `lib/advancedManuscriptDecisionEngine.js`

**Functions:**
- `searchManuscriptsForAction(action)` - Search all manuscripts
- `getCurrentLiveConditions(now, sunrise, sunset)` - Live astro data
- `compareRulesAgainstConditions(rules, conditions)` - Compare & score
- `calculateNextSuitableTime(rules, now, sunrise, sunset)` - Next best time
- `getComprehensiveTimingGuidance(action, conditions, comparison)` - Full guidance

### 2. Main UI Component
**File:** `components/astroclock/AdvancedManuscriptDecisionEngine.jsx`

**Sub-components:**
- `DecisionResults` - Main results display
- `CurrentStatusDisplay` - Suitable/Wait/Not suitable
- `LiveConditionsDisplay` - Current astro conditions
- `TimingGuidanceDisplay` - Suitable/Unsuitable lists
- `NextSuitableTimeDisplay` - Next best time
- `ManuscriptEvidenceDisplay` - Full citations

### 3. Integration
**File:** `pages/AstroClockPage.jsx`

- Added import for AdvancedManuscriptDecisionEngine
- Integrated as Section 14
- Positioned between Action Timing Advisor and Birth Profile Analyzer

## UI STRUCTURE

```
┌─────────────────────────────────────────────┐
│ Advanced Manuscript Decision Engine         │
│ Search Input                                │
│ Example Action Buttons                      │
├─────────────────────────────────────────────┤
│ CURRENT STATUS                              │
│ ✓ Suitable Now / 🟡 Wait / ✗ Not Suitable  │
├─────────────────────────────────────────────┤
│ LIVE CONDITIONS                             │
│ [Planetary Hour] [Lunar Mansion]            │
│ [Moon Sign] [Day Ruler]                     │
├─────────────────────────────────────────────┤
│ TIMING GUIDANCE                             │
│ Suitable        │ Unsuitable                │
│ - Mansions      │ - Mansions                │
│ - Planets       │ - Planets                 │
│ - Days          │ - Days                    │
│ - Period        │                           │
├─────────────────────────────────────────────┤
│ NEXT SUITABLE TIME                          │
│ 3:45 PM (in 2 hours)                        │
├─────────────────────────────────────────────┤
│ MANUSCRIPT EVIDENCE                         │
│ ┌─────────────────────────────────────────┐ │
│ │ Book: Havâss'ın Derinlikleri            │ │
│ │ Page: PDF2 p.52-55                      │ │
│ │ Original: [Arabic text]                 │ │
│ │ Malayalam: [മലയാളം തർജ്ജമ]           │ │
│ │ Why: Current mansion matches rule       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## ENFORCEMENT RULES

### ✓ Must Have:
- Manuscript source for every recommendation
- Complete 5-part citation (book, page, Arabic, ML, why)
- Separate display for multiple manuscripts
- "No manuscript guidance" message when nothing found

### ✗ Prohibited:
- Undefined recommendations
- Estimated interpretations
- AI-generated rules
- Generic astrology
- External knowledge sources
- Merged manuscript opinions

## SCORING SYSTEM

| Factor | Points |
|--------|--------|
| Mansion match | +3 |
| Planet match | +2 |
| Day match | +2 |
| Day/night match | +1 |

**Results:**
- Score >= 3: ✓ Suitable Now
- Score 1-2: 🟡 Wait
- Score 0: ✗ Not Suitable
- No matching rules: "No manuscript guidance found"

## TESTING SCENARIOS

### Scenario 1: Marriage Action Found
**Input:** User selects "Marriage"
**Output:**
- ✓ Manuscript found
- ✓ Live conditions displayed
- ✓ Suitable mansions: 5, 10, 15
- ✓ Suitable planets: Venus, Jupiter
- ✓ Suitable days: Thursday, Friday
- ✓ Best period: Nighttime
- ✓ Next suitable: 3:45 PM (in 2 hours)
- ✓ Full manuscript evidence with citations

### Scenario 2: Custom Action Not Found
**Input:** User types "Business merger"
**Output:**
- ✗ No manuscript guidance found
- Message in English & Malayalam
- No recommendations generated
- Clean fallback UI

### Scenario 3: Multiple Manuscripts
**Input:** User selects "Muhabbah"
**Output:**
- Manuscript 1: Havâss'ın Derinlikleri (3 rules)
- Manuscript 2: [Other PDF] (2 rules)
- Each displayed separately
- No merging of opinions

## INTEGRATION STATUS: ✅ COMPLETE

Advanced Manuscript Decision Engine is fully integrated into Astro Clock as Section 14.

All outputs strictly manuscript-driven with complete 5-part citations.