# MANUSCRIPT DATABASE STRUCTURE

## 📊 DATABASE TABLES/ENTITIES

### 1. **ManuscriptRule** Entity
**Purpose:** Stores all individual rules extracted from manuscripts

**Total Records:** 632+ records (as of June 14, 2026)

**Schema:**
```json
{
  "rule_id": "unique_identifier",
  "manuscript_id": "FK_to_ManuscriptLibrary",
  "book_name": "Book title",
  "author": "Author name",
  "page_number": 42,
  "chapter": "Chapter/section",
  "category": "PLANETARY_HOURS | LUNAR_MANSIONS | ZODIAC | etc.",
  "subcategory": "Specific subcategory",
  "original_text": "Verbatim text from manuscript",
  "rule_summary": "English summary",
  "rule_summary_ml": "Malayalam summary",
  "data_json": "{\"planet_arabic\":\"شمس\",\"letter\":\"ح\",...}",
  "verified": false
}
```

**Categories:**
- PLANETARY_HOURS
- LUNAR_MANSIONS
- ZODIAC
- PLANETS
- FRIENDSHIP_RULES
- INCENSE_RULES
- LETTER_RULES
- TIMING_RULES
- DAY_RULERS
- SAAD_NAHS
- SPIRITUAL_WORKS
- PROTECTION_WORKS
- LOVE_WORKS
- WEALTH_WORKS
- TRAVEL_WORKS
- ELEMENT_RULES
- COSMOLOGY
- ELECTIONAL_TIMING
- PLANETARY_STONES
- PLANETARY_METALS
- PLANETARY_COLORS
- ANIMAL_ASSOCIATIONS

---

### 2. **ManuscriptLibrary** Entity
**Purpose:** Metadata about each manuscript/PDF source

**Total Records:** 5+ manuscripts

**Schema:**
```json
{
  "book_id": "unique_book_identifier",
  "book_name": "Full title",
  "author": "Author",
  "language": "Turkish/Arabic",
  "tradition": "Islamic Occult Sciences",
  "pages_ingested": "1-100",
  "pdf_filename": "original.pdf",
  "pdf_url": "https://...",
  "total_rules_extracted": 180,
  "categories_covered": ["PLANETARY_HOURS", "ZODIAC", ...],
  "ingestion_status": "FULLY_INGESTED | PARTIAL | PENDING",
  "ingestion_date": "2026-06-14"
}
```

---

## 🔍 HOW TO BROWSE RECORDS

### Option 1: In-App Browser (Recommended)

**URL:** `/manuscript-browser`

**Features:**
- ✅ View all 632+ records
- ✅ Search by category, planet, zodiac, mansion, letter, page, manuscript
- ✅ Expandable cards with full details
- ✅ Arabic-primary display
- ✅ Real-time filtering

**Access:** Navigate to "Manuscript Browser" in the app

---

### Option 2: Direct Entity Access (Dashboard)

**Dashboard Path:** Code → Entities → ManuscriptRule

**Features:**
- View raw JSON data
- Filter by any field
- Export data

---

## 🔎 SEARCH CAPABILITIES

### 1. **By Planet**
```
Search: زحل (Saturn), مشتری (Jupiter), مریخ (Mars)
Returns: All records mentioning that planet
```

### 2. **By Zodiac Sign**
```
Search: الحمل (Aries), الثور (Taurus), الجوزاء (Gemini)
Returns: All records with that zodiac sign
```

### 3. **By Lunar Mansion**
```
Search: الشرطين (Al-Sharatain), البطين (Al-Butain)
Returns: All records with that mansion
```

### 4. **By Arabic Letter**
```
Search: ا, ب, ت, ث, ج, ح, خ
Returns: All records with that letter
```

### 5. **By Page Number**
```
Search: 42, 50, 100
Returns: All records from that page
```

### 6. **By Manuscript Name**
```
Search: Elbuni, Taha, Havass
Returns: All records from that manuscript
```

---

## 📋 EXAMPLE RECORDS

### Planetary Hours Record
```json
{
  "rule_id": "havass_vol2_p55_PLANETARY_HOURS_001",
  "manuscript_id": "havass_derinlikleri_vol2",
  "book_name": "Havâss'ın Derinlikleri — II. Kitap",
  "page_number": 55,
  "category": "PLANETARY_HOURS",
  "original_text": "Zühre saati muhabbet ve sevgi işleri için uygundur",
  "rule_summary": "Venus hour is suitable for love and affection works",
  "data_json": {
    "planet": "Venus",
    "planet_arabic": "زهره",
    "planet_malayalam": "ശുക്രൻ",
    "hour_type": "planetary"
  }
}
```

### Lunar Mansion Record
```json
{
  "rule_id": "havass_vol2_p60_LUNAR_MANSIONS_003",
  "manuscript_id": "havass_derinlikleri_vol2",
  "book_name": "Havâss'ın Derinlikleri — II. Kitap",
  "page_number": 60,
  "category": "LUNAR_MANSIONS",
  "original_text": "Süreyya menzili su işleri ve seyahat için uygundur",
  "rule_summary": "Al-Thuraya mansion is suitable for water works and travel",
  "data_json": {
    "lunar_mansion": "Al-Thuraya",
    "lunar_mansion_arabic": "الثريا",
    "lunar_mansion_malayalam": "അൽ-തുറയ",
    "mansion_number": 3
  }
}
```

### Zodiac Record
```json
{
  "rule_id": "taha_p45_ZODIAC_0017",
  "manuscript_id": "taha_judicial_astrology",
  "book_name": "Taha Judicial Astrology",
  "page_number": 45,
  "category": "ZODIAC",
  "original_text": "الحمل نارى حار يابس ذكرى",
  "rule_summary": "Aries is fire, hot, dry, masculine",
  "data_json": {
    "zodiac": "Aries",
    "zodiac_arabic": "الحمل",
    "zodiac_malayalam": "അൽ-ഹമൽ",
    "element": "Fire",
    "nature": "Hot/Dry"
  }
}
```

---

## 🗂 DATA ORGANIZATION

### Arabic Preservation Standard

All records follow the **Arabic Preservation Rule**:

**Primary Fields (Arabic):**
- `letter` — Arabic glyph (e.g., "ح")
- `lunar_mansion_arabic` — Arabic name (e.g., "البطين")
- `zodiac_arabic` — Arabic name (e.g., "العقرب")
- `planet_arabic` — Arabic name (e.g., "زهره")

**Secondary Fields (Malayalam):**
- `letter_malayalam` — Transliteration (e.g., "ഹാ")
- `lunar_mansion_malayalam` — Transliteration
- `zodiac_malayalam` — Transliteration
- `planet_malayalam` — Transliteration

**Metadata:**
- `page_number` — Exact page citation
- `manuscript_id` — Source manuscript
- `original_text` — Verbatim manuscript text

---

## 📊 STATISTICS (Current)

| Entity | Count | Description |
|--------|-------|-------------|
| **ManuscriptRule** | 632+ | Individual rules extracted |
| **ManuscriptLibrary** | 5+ | Source manuscripts |
| **Categories** | 22+ | Rule categories |
| **Pages Covered** | 200+ | Unique pages indexed |

---

## 🛠 API ACCESS

### Via SDK (Frontend)
```javascript
import { base44 } from "@/api/base44Client";

// List all rules
const rules = await base44.entities.ManuscriptRule.list();

// Filter by category
const planetaryRules = await base44.entities.ManuscriptRule.filter({
  category: "PLANETARY_HOURS"
});

// List manuscripts
const manuscripts = await base44.entities.ManuscriptLibrary.list();
```

### Via Backend Function
```javascript
const result = await base44.functions.invoke('queryManuscriptLibrary', {
  category: "LUNAR_MANSIONS",
  search_term: "Venus",
  include_conflicts: true
});
```

---

## 📖 MANUSCRIPT SOURCES

### Currently Ingested:

1. **Havâss'ın Derinlikleri Vol. 1** (pp.1-50)
   - Author: Bülent Kısa
   - Rules: 180
   - Status: FULLY_INGESTED

2. **Havâss'ın Derinlikleri Vol. 2** (pp.51-100)
   - Author: Bülent Kısa
   - Rules: 229
   - Status: FULLY_INGESTED

3. **Sems'ul-Maarif'ul-Kubra Vol. 3** (Multiple ingestions)
   - Author: Imam Ahmed Elbuni
   - Rules: 34+
   - Status: PARTIAL

4. **Taha Judicial Astrology**
   - Author: Taha
   - Rules: Various
   - Status: PARTIAL

---

## ✅ VERIFICATION

To verify records:

1. **Browse:** Go to `/manuscript-browser`
2. **Search:** Use filters (category, planet, mansion, etc.)
3. **Expand:** Click any record to see full details
4. **Verify:** Check Arabic text, page citations, manuscript source

---

## 🔒 DATA INTEGRITY

- ✅ All records have `page_number` citations
- ✅ All records have `manuscript_id` references
- ✅ Arabic glyphs preserved as primary values
- ✅ Original manuscript text stored
- ✅ No deletions (additive-only policy)
- ✅ Conflicts marked with `conflict_with` field

---

**Last Updated:** June 14, 2026
**Total Records:** 632+ rules from 5+ manuscripts