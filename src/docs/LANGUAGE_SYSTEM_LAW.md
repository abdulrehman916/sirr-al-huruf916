# ═══════════════════════════════════════════════════════════════
# ASTRO CLOCK LANGUAGE SYSTEM LAW — PERMANENT & IMMUTABLE
# ═══════════════════════════════════════════════════════════════
#
# PRIORITY: CRITICAL — EQUAL HIGHEST PRIORITY IN CODEBASE
# STATUS: IMMUTABLE — CANNOT BE DISABLED BY FUTURE UPDATES
# LIFETIME: PERMANENT — FOR THE LIFETIME OF THE PROJECT
#
# ESTABLISHED: 2026-07-08
# SUPPLEMENTS: MANUSCRIPT_INTEGRATION_LAW.md, MANUSCRIPT_PRESERVATION_LAW.md
#
# ═══════════════════════════════════════════════════════════════
# CORE PRINCIPLE
# ═══════════════════════════════════════════════════════════════
#
# The Astro Clock is completely language-independent. The user
# selects one language and sees ONLY that language. The original
# Turkish manuscript data is preserved internally and never edited.
# Arabic script is permanently preserved and never transliterated.
#
# ═══════════════════════════════════════════════════════════════

## THE 10 LANGUAGE RULES

### RULE 1 — SUPPORTED LANGUAGES
The Astro Clock supports exactly three languages:
  - Malayalam (ml)
  - English (en)
  - Turkish (tr)
No other languages may be added. No other languages may appear in
the UI. This is a closed set.

### RULE 2 — MALAYALAM MODE: ZERO TURKISH WORDS
When Malayalam is selected, ALL Turkish content must be translated
into natural, fluent Malayalam. There must not be a single Turkish
word visible anywhere in the UI. This applies to:
  - Buttons and navigation labels
  - Descriptions and explanations
  - Warnings and alerts
  - Activities (suitable operations, avoided operations)
  - References (book names, page references)
  - Properties (planet attributes, zodiac attributes)
  - Tooltips and helper text
  - Section headers and sub-headers
  - Status badges and labels
  - Empty states and loading text
  The only exception is Arabic script (see Rule 5).
  A stray Turkish word in Malayalam mode is a CRITICAL BUG.

### RULE 3 — ENGLISH MODE: ZERO TURKISH WORDS
When English is selected, ALL Turkish content must be translated
into English. No Turkish words should remain anywhere in the UI.
The same exhaustive list from Rule 2 applies. Arabic script is the
only exception. A stray Turkish word in English mode is a CRITICAL
BUG.

### RULE 4 — TURKISH MODE: ORIGINAL MANUSCRIPT TEXT
When Turkish is selected, show the original Turkish manuscript text
exactly as it appears in the source PDFs. No translation. No
modernization. No paraphrasing. The user sees what the author wrote.
Arabic script within the Turkish text is preserved as-is.

### RULE 5 — ARABIC IS THE ONLY EXCEPTION
Arabic content is permanently preserved in Arabic script and is
NEVER translated into Latin letters. This applies to:
  - Arabic names (Divine Names, angel names, spirit names)
  - Arabic letters (the 28 Abjad letters)
  - Talismanic words and invocations
  - Zodiac sign names in Arabic (e.g., الحمل, الثور)
  - Lunar mansion names in Arabic (e.g., الشرطان, البطين)
  - Quranic text and verses
  - Manuscript Arabic quotations
  Arabic appears in Arabic script regardless of the selected UI
  language. It may appear as a small reference beneath the
  translation, or inline where Arabic is the primary content
  (e.g., a Divine Name display). Arabic is never romanized.

### RULE 6 — TRANSLATION IS DISPLAY-LAYER ONLY
Translation applies ONLY to the display layer. The original Turkish
manuscript data must remain unchanged in the data files and
database. Specifically:
  - astroClockKashfData.js — Arabic original, never edited
  - astroClockTahaData.js — Farsi/Arabic original, never edited
  - KNOWLEDGE_DAYS in astroClockKnowledgeBase.js — Turkish original,
    never edited
  - No data file is modified to "replace" Turkish with translations
  - Translations are stored alongside the original, not instead of it
  This rule protects the source of truth (see Preservation Law).

### RULE 7 — EVERY MANUSCRIPT RECORD HAS 3 TRANSLATIONS
Every manuscript record that contains displayable text should
contain:
  - The original text (Turkish / Arabic / Farsi as sourced)
  - Malayalam translation (name_ml / summary_ml / etc.)
  - English translation (name_en / summary_en / etc.)
  - Turkish translation (name_tr / summary_tr / etc.) — for Arabic
    sources, this is the Turkish rendering of the Arabic; for
    Turkish sources, this is the original text itself
  The UI displays only the currently selected language field. If a
  translation field is missing, the UI shows a placeholder or
  falls back gracefully — but NEVER shows a different language's
  text in place of the missing translation.

### RULE 8 — NEVER MIX LANGUAGES
Within a single card, panel, or section, the UI displays text in
exactly ONE language:
  - Malayalam UI = 100% Malayalam (except preserved Arabic script)
  - English UI = 100% English (except preserved Arabic script)
  - Turkish UI = 100% Turkish (except preserved Arabic script)
  Mixed-language text (e.g., a Malayalam sentence with Turkish
  words, or an English paragraph with Turkish labels) is a CRITICAL
  BUG. The txt(ml, en, tr) function is the canonical way to select
  one language. Every displayable string must pass through txt() or
  a language-specific field selector.

### RULE 9 — APPLIES TO EVERY ASTRO CLOCK SECTION
This law applies to every Astro Clock section, present and future:
  - Today's Dashboard (Section 1)
  - Smart Search (Section 2)
  - Planetary Hours / Saat Grid (Section 3)
  - Moon Center (Section 4)
  - Moon in Zodiac (Section 5)
  - 28 Lunar Mansions (Section 6)
  - Zodiac Signs (Section 7)
  - Planet Encyclopedia (Section 8)
  - Reference Library (Section 9)
  - Any future section added to the Astro Clock
  - Any future manuscript integration
  No section is exempt. No section may "opt out" of trilingual
  support. If a section cannot be fully translated, it is
  INCOMPLETE and must be completed before release.

### RULE 10 — PERMANENT FOR ALL FUTURE MANUSCRIPTS
This is a permanent architecture rule. It must be enforced for all
future manuscripts. When a new PDF is imported:
  - Its data file must include ml, en, and tr fields for every
    displayable string (or use the txt() pattern)
  - Arabic original text is preserved in Arabic script
  - The merger functions must expose all three languages
  - No new manuscript may introduce a 4th language
  - No new manuscript may bypass the txt() pattern
  This rule cannot be disabled, suspended, or deprecated by any
  future update.

# ═══════════════════════════════════════════════════════════════
# IMPLEMENTATION PATTERN
# ═══════════════════════════════════════════════════════════════
#
# The canonical translation function is provided by the Astro Clock
# language context:
#
#   const { txt, language } = useAstroClockLanguage();
#   txt("മലയാളം ടെക്സ്റ്റ്", "English text", "Türkçe metin")
#
# txt() returns exactly ONE string based on the current language.
# Arabic original text is rendered separately, not through txt().
#
# For data-driven fields, use language-specific field selectors:
#
#   const name = language === "ml" ? data.name_ml
#              : language === "tr" ? data.name_tr
#              : data.name_en;
#
# ═══════════════════════════════════════════════════════════════
# ENFORCEMENT
# ═══════════════════════════════════════════════════════════════
#
# The JS enforcement module at src/lib/astroClockLanguageLaw.js
# exports constants and validation functions. These are defensive —
# they log violations but never crash the app.
#
# ═══════════════════════════════════════════════════════════════
# RELATIONSHIP TO OTHER LAWS
# ═══════════════════════════════════════════════════════════════
#
# This law supplements (does not replace):
#   - MANUSCRIPT_INTEGRATION_LAW.md (10 integration rules)
#   - MANUSCRIPT_PRESERVATION_LAW.md (10 preservation rules)
#   - MASTER_ARCHITECTURE_LAW.md (Abjad/Mizan isolation)
#
# All laws apply simultaneously. When laws overlap, the STRICTER
# interpretation applies.
# ═══════════════════════════════════════════════════════════════