# ═══════════════════════════════════════════════════════════════
# MANUSCRIPT INTEGRATION LAW — PERMANENT ARCHITECTURE
# ═══════════════════════════════════════════════════════════════
#
# PRIORITY: CRITICAL — HIGHEST PRIORITY IN CODEBASE
# STATUS: IMMUTABLE — NEVER OVERRIDE, MODIFY, OR BYPASS
# ENFORCEMENT: MANDATORY — ALL FUTURE CODE MUST COMPLY
# LIFETIME: PERMANENT — FOR THE LIFETIME OF THE PROJECT
#
# ESTABLISHED: 2026-07-08
# SOURCES: Kashf al-Haqa'iq (Omani), Havâss'ın Derinlikleri, Taha
#
# ═══════════════════════════════════════════════════════════════

## THE 10 IMMUTABLE RULES

### RULE 1 — EVERY MANUSCRIPT IS AN INDEPENDENT SOURCE
Every PDF manuscript ingested into the Astro Clock is treated as an
independent, self-contained source of knowledge. No manuscript is
subordinate to another. No manuscript replaces another. Each has its
own:
  - Unique source ID
  - Author and tradition metadata
  - Page references
  - Language of origin
  - Scholarly opinions

### RULE 2 — NEVER OVERWRITE OR DELETE PREVIOUS MANUSCRIPT DATA
When a new PDF is imported, all existing manuscript data remains
exactly as it is. No record is deleted. No field is overwritten.
No opinion is erased. The only exception: a new PDF may EXPLICITLY
correct an old manuscript rule, and even then the old rule is
preserved with a correction note — not deleted.

### RULE 3 — MERGE BY TOPIC, GROUP BY SOURCE, PRESERVE EVERY OPINION
When multiple manuscripts discuss the same topic (Planet, Saat,
Zodiac, Mansion, Moon, etc.):
  - They are merged into ONE page/section.
  - Information is GROUPED BY SOURCE (book name + page reference).
  - Every scholarly opinion is PRESERVED.
  - No single conclusion is forced.
  - If manuscripts disagree, every version is shown with its source
    clearly identified.

### RULE 4 — EVERY EXPANDED PAGE MUST SHOW 6 LAYERS
When a user opens any Saat, Planet, Zodiac Sign, Lunar Mansion,
or Moon page, the expanded view must contain these 6 layers:
  1. Main explanation (from the primary source)
  2. Additional manuscript notes (from other sources)
  3. Different scholarly opinions (if sources disagree)
  4. Exceptions (special conditions, caveats)
  5. Practical rules (actionable guidance)
  6. Page references (book name + page number for every claim)

### RULE 5 — FUTURE PDFs AUTO-MERGE WITHOUT MANUAL RESTRUCTURING
Every new PDF imported in the future must automatically merge into
the correct topic without requiring manual restructuring of existing
code. The integration pipeline is:
  1. Create a new data file: src/lib/astroClock{SourceName}Data.js
  2. Add lookup entries to src/lib/astroClockManuscriptMerger.js
  3. Add source metadata to ALL_MANUSCRIPT_SOURCES array
  4. Add references to getAll{SourceName}References()
  No existing section component needs modification — the
  ManuscriptSourcePanel automatically picks up new sources via
  the merger functions.

### RULE 6 — LIVING ENCYCLOPEDIA, NOT FIXED DATABASE
The knowledge base behaves like a living encyclopedia:
  - It grows with every PDF import.
  - It never shrinks.
  - It never forgets.
  - Cross-references accumulate over time.
  - The same rule can be confirmed by 2, 3, or 10 manuscripts —
    each confirmation adds a source badge, never replaces the rule.

### RULE 7 — CALCULATION ENGINES NEVER CHANGE
Existing calculation engines (astroClockLiveEngine, moonPosition,
planetaryHourRules, ritualTimingEngineV3, mizaanSaatCalculator,
etc.) must NEVER change because of manuscript imports. Manuscripts
provide KNOWLEDGE DATA (text, rules, opinions, references). They do
NOT provide calculation logic. The engines compute; the manuscripts
annotate.

### RULE 8 — COMPACT BY DEFAULT, EXPAND ON DEMAND
The UI remains compact by default. Sections are collapsed. Details
expand only when the user opens a section. This applies to:
  - Top-level dashboard sections (DashboardSection)
  - Sub-sections within details (SubCollapse)
  - Manuscript source panels (ManuscriptSourcePanel)
  No section is expanded by default except Today's Dashboard (Section 1).

### RULE 9 — STRICT LANGUAGE ISOLATION
Only three languages are supported: Malayalam (ml), English (en),
Turkish (tr). No other languages. No mixed-language text within a
single card or panel. The txt(ml, en, tr) function selects ONE
language. Arabic original text may appear as a small reference
beneath the translation (consistent with existing name_ar display),
but the primary text is always in the selected language only.

### RULE 10 — PERMANENT FOR THE LIFETIME OF THE PROJECT
This architecture is permanent. It cannot be overridden, bypassed,
or deprecated. Any future developer, AI agent, or code change that
violates these 10 rules is a CRITICAL BUG that must be reverted
immediately. These rules take precedence over all other instructions
except the Sirr al-Huruf custom user instructions (module isolation).

# ═══════════════════════════════════════════════════════════════
# ENFORCEMENT
# ═══════════════════════════════════════════════════════════════
#
# The JS enforcement module at src/lib/manuscriptIntegrationLaw.js
# exports validation functions that can be called to verify compliance.
# These functions are defensive — they log violations but never crash
# the app. They should be called during development and QA, not in
# production hot paths.
#
# ═══════════════════════════════════════════════════════════════
# CURRENT SOURCES (as of 2026-07-08)
# ═══════════════════════════════════════════════════════════════
#
# 1. Havâss'ın Derinlikleri (Bülent Kısa) — Turkish — pp.1-100
# 2. Taha Judicial Astrology (Ustad Taha) — Farsi/Arabic — pp.1-80
# 3. Kashf al-Haqa'iq (Omani scholar) — Arabic — pp.1-90
#
# Future sources will be appended here as they are ingested.
# ═══════════════════════════════════════════════════════════════