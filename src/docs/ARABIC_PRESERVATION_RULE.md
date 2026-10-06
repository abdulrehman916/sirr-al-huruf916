# ARABIC PRESERVATION RULE — PERMANENT DATABASE STANDARD

## ✅ CORE PRINCIPLE

**Arabic script is the primary and authoritative value.**

Malayalam transliterations serve ONLY as secondary learning aids.

---

## 📜 RULES

### 1. ORIGINAL ARABIC PRESERVATION

✅ Preserve original Arabic text exactly as found in manuscripts
✅ Preserve all Arabic letters in Arabic script
✅ Never replace Arabic with Malayalam, Turkish, or English transliterations
✅ Arabic is the authoritative source

### 2. DATA STORAGE REQUIREMENTS

For ALL astrology records, store:

1. **Original Arabic Name** — `*_arabic` fields
2. **Original Arabic Letter(s)** — `letter`, `letters` arrays
3. **Original Manuscript Text** — `original_arabic_text`
4. **Malayalam Explanation** — `*_malayalam` fields (secondary)
5. **Exact Page Citation** — `page_number`
6. **Source Manuscript ID** — `manuscript_id`

### 3. DISPLAY FORMAT

**Primary Display:** Arabic Script (large, prominent, gold)
**Secondary Display:** Malayalam Explanation (smaller, below, green)

**Example:**
```
Arabic Letter: ه
Malayalam Meaning: ഹാ

Arabic Name: سعد الذابح
Malayalam Name: സഅ്ദ് അൽ-ദാബിഹ്
```

---

## 📊 AFFECTED CATEGORIES

- Zodiac Signs (12 Burj)
- Lunar Mansions (28 Manazil)
- Planets (7 Classical)
- Planetary Letters (28 Huruf)
- Planetary Numbers
- Planetary Elements
- Planetary Colors
- Planetary Metals
- Planetary Stones
- Saad/Nahs Classifications
- Planetary Hours
- Electional Timing
- Astrological Vefks
- Astrological Talismans

---

## 🛠 IMPLEMENTATION

### DATABASE UPGRADE STATUS

**Function:** `upgradeDatabaseArabicPreservation`

**Results:**
- ✅ Total Processed: **632 records**
- ✅ Updated: **200 records**
- ✅ Already Correct: **432 records**

**Upgrades Applied:**
- Converted Malayalam letters → Arabic glyphs
- Added Arabic names for mansions/zodiac/planets
- Preserved original Arabic text
- Ensured page citations
- Ensured manuscript IDs

### REFERENCE LIBRARY

**File:** `lib/arabicPreservationStandard.js`

Contains:
- 28 Arabic letters with Malayalam transliterations
- 28 Lunar Mansions with Arabic names
- 12 Zodiac signs with Arabic names
- 7 Planets with Arabic names
- Helper functions for formatting

### DISPLAY COMPONENTS

**File:** `components/astroclock/ArabicLetterDisplay.jsx`

Components:
- `ArabicLetterDisplay` — Letters with Arabic primary
- `LunarMansionDisplay` — Mansions with Arabic primary
- `ZodiacSignDisplay` — Signs with Arabic primary
- `ArabicTextWithTranslation` — Text with Arabic primary

---

## 🔒 PERMANENT ENFORCEMENT

### For Existing Records

✅ All 632 astrology records reindexed
✅ Arabic glyphs preserved/restored
✅ Malayalam stored as secondary descriptions
✅ Original manuscript text preserved
✅ Page citations verified

### For Future Ingestions

All manuscript ingestion functions MUST:

1. Extract Arabic text from manuscripts
2. Store Arabic as primary value
3. Store Malayalam as secondary (optional)
4. Never substitute transliterations for Arabic
5. Include page citations
6. Include manuscript ID

---

## 📋 EXAMPLES

### ✅ CORRECT STORAGE

```json
{
  "letter": "ح",
  "letter_malayalam": "ഹാ",
  "lunar_mansion_arabic": "البطين",
  "lunar_mansion": "Al-Butain",
  "lunar_mansion_malayalam": "അൽ-ബുതൈൻ",
  "planet_arabic": "زهره",
  "planet": "Venus",
  "planet_malayalam": "ശുക്രൻ",
  "page_number": 42,
  "manuscript_id": "elbuni_semsul_maarif"
}
```

### ❌ WRONG STORAGE (NEVER USE)

```json
{
  "letter": "ഹാ",  // Malayalam instead of Arabic ❌
  "lunar_mansion": "Al-Butain",  // No Arabic ❌
  "planet": "Venus"  // No Arabic ❌
}
```

---

## 🎯 DISPLAY EXAMPLES

### Letter Display
```
ح  ← Arabic (large, gold)
ഹാ ← Malayalam (small, green)
```

### Mansion Display
```
البطين  ← Arabic (large, gold)
Al-Butain / അൽ-ബുതൈൻ ← Secondary
```

### Zodiac Display
```
العقرب  ← Arabic (large, gold)
Scorpio / അൽ-അഖറബ് ← Secondary
```

---

## 📚 REFERENCE TABLES

### 28 Arabic Letters (Huruf)

| Arabic | Name | Malayalam |
|--------|------|-----------|
| ا | Alif | അലിഫ് |
| ب | Ba | ബാ |
| ت | Ta | താ |
| ث | Tha | സാ |
| ج | Jim | ജീം |
| ح | Ha | ഹാ |
| خ | Kha | ഖാ |
| د | Dal | ദാൽ |
| ذ | Dhal | ദാൽ |
| ر | Ra | റാ |
| ز | Zay | സായ് |
| س | Sin | സീൻ |
| ش | Shin | ശീൻ |
| ص | Sad | സ്വാദ് |
| ض | Dad | ദ്വാദ് |
| ط | Ta | ത്വാ |
| ظ | Za | ലാ |
| ع | Ayn | ഐൻ |
| غ | Ghayn | ഗൈൻ |
| ف | Fa | ഫാ |
| ق | Qaf | ഖാഫ് |
| ك | Kaf | കാഫ് |
| ل | Lam | ലാം |
| م | Mim | മീം |
| ن | Nun | നൂൻ |
| ه | Ha | ഹാ |
| و | Waw | വാവ് |
| ي | Ya | യാ |

### 28 Lunar Mansions (Manazil)

| # | Arabic | Name | Malayalam |
|---|--------|------|-----------|
| 1 | الشرطين | Al-Sharatain | അൽ-ശരതൈൻ |
| 2 | البطين | Al-Butain | അൽ-ബുതൈൻ |
| 3 | الثريا | Al-Thuraya | അൽ-തുറയ |
| 4 | الدبران | Al-Dabaran | അൽ-ദബറാൻ |
| 5 | الهقعة | Al-Haq'ah | അൽ-ഹഖഅ |
| 6 | الهنعة | Al-Han'ah | അൽ-ഹനഅ |
| 7 | الذراع | Al-Dhira | അൽ-ദിറാ |
| 8 | النثرة | Al-Nathrah | അൽ-നസ്റ |
| 9 | الطرف | Al-Tarf | അൽ-തർഫ് |
| 10 | الجبهة | Al-Jabhah | അൽ-ജഭ |
| 11 | الزبرة | Al-Zubrah | അൽ-സുബ്ര |
| 12 | الصرفة | Al-Sarfah | അൽ-സർഫ |
| 13 | العواء | Al-Awwa | അൽ-അവ്വ |
| 14 | السماك | Al-Simak | അൽ-സിമാക് |
| 15 | الغفر | Al-Ghafr | അൽ-ഗഫ്ർ |
| 16 | الزبانا | Al-Zubana | അൽ-സുബാന |
| 17 | الإكليل | Al-Iklil | അൽ-ഇക്ലീൽ |
| 18 | القلب | Al-Qalb | അൽ-ഖൽബ് |
| 19 | الشولة | Al-Shawlah | അൽ-ഷൗല |
| 20 | النعائم | Al-Na'im | അൽ-നയീം |
| 21 | البلدة | Al-Baldah | അൽ-ബലദ |
| 22 | سعد الذابح | Sa'd al-Dhabih | സഅദ് അൽ-ദാബിഹ് |
| 23 | سعد بلع | Sa'd Bula | സഅദ് ബുല |
| 24 | سعد السعود | Sa'd al-Su'ud | സഅദ് അൽ-സുഊദ് |
| 25 | سعد الأخبية | Sa'd al-Akhibah | സഅദ് അൽ-അഖിബ |
| 26 | الفرغ المقدم | Al-Fargh al-Muqaddam | അൽ-ഫർഗ് അൽ-മുഖദ്ദം |
| 27 | الفرغ المؤخر | Al-Fargh al-Mu'akhar | അൽ-ഫർഗ് അൽ-മുഅഖർ |
| 28 | الرشا | Al-Risha | അൽ-റിശ |

### 12 Zodiac Signs (Burj)

| # | Arabic | Name | Malayalam | Element |
|---|--------|------|-----------|---------|
| 1 | الحمل | Al-Hamal | അൽ-ഹമൽ (Aries) | Fire |
| 2 | الثور | Al-Thawr | അൽ-തൗർ (Taurus) | Earth |
| 3 | الجوزاء | Al-Jawza | അൽ-ജൗസ (Gemini) | Air |
| 4 | السرطان | Al-Saratan | അൽ-സറതാൻ (Cancer) | Water |
| 5 | الأسد | Al-Asad | അൽ-അസദ് (Leo) | Fire |
| 6 | السنبلة | Al-Sunbulah | അൽ-സുൻബുല (Virgo) | Earth |
| 7 | الميزان | Al-Mizan | അൽ-മീസാൻ (Libra) | Air |
| 8 | العقرب | Al-Aqrab | അൽ-അഖറബ് (Scorpio) | Water |
| 9 | القوس | Al-Qaws | അൽ-ഖൗസ് (Sagittarius) | Fire |
| 10 | الجدى | Al-Jadi | അൽ-ജദി (Capricorn) | Earth |
| 11 | الدلو | Al-Dalw | അൽ-ദൽവ് (Aquarius) | Air |
| 12 | الحوت | Al-Hut | അൽ-ഹൂത് (Pisces) | Water |

---

## ✅ VERIFICATION

**Database Status:** ✅ All 632 records upgraded

**Display Components:** ✅ Arabic-primary displays implemented

**Reference Library:** ✅ Complete with 28 letters + 28 mansions + 12 signs + 7 planets

**Ingestion Standards:** ✅ Future records will follow Arabic preservation rule

---

## 🔐 PERMANENT RULE

This standard is **permanent and non-negotiable** for the entire Sirr al-Huruf database.

**Arabic script is the authoritative source.**

Malayalam serves only as a learning aid — never as a replacement.