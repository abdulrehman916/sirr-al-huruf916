# ═══════════════════════════════════════════════════════════════
# MANUSCRIPT PRESERVATION LAW — PERMANENT & IMMUTABLE
# ═══════════════════════════════════════════════════════════════
#
# PRIORITY: CRITICAL — EQUAL HIGHEST PRIORITY IN CODEBASE
# STATUS: IMMUTABLE — CANNOT BE DISABLED BY FUTURE UPDATES
# LIFETIME: PERMANENT — FOR THE LIFETIME OF THE PROJECT
#
# ESTABLISHED: 2026-07-08
# SUPPLEMENTS: MANUSCRIPT_INTEGRATION_LAW.md
#
# ═══════════════════════════════════════════════════════════════
# CORE PRINCIPLE
# ═══════════════════════════════════════════════════════════════
#
# The Astro Clock is a MANUSCRIPT ENCYCLOPEDIA, not a single-opinion
# system. Knowledge is permanent. UI is temporary. This law protects
# the knowledge layer from any change, deletion, or overwrite —
# forever.
#
# ═══════════════════════════════════════════════════════════════

## THE 10 PRESERVATION RULES

### RULE 1 — EVERY IMPORTED MANUSCRIPT IS PERMANENT
Once a manuscript PDF is ingested into the knowledge base, it becomes
a permanent resident. It cannot be removed, archived, or marked as
"deprecated." The source metadata, all extracted rules, all page
references, and all quotations are permanently stored. Future code
changes, refactors, or UI redesigns cannot cause the loss of any
ingested manuscript data.

### RULE 2 — NOTHING FROM ANY MANUSCRIPT MAY EVER BE DELETED
No record, no field, no quotation, no page reference, no scholarly
opinion, no Arabic text, no translation, no rule, no table entry
extracted from any manuscript may be deleted — ever. This applies to:
  - Source metadata files (astroClock*Data.js)
  - Merger lookup entries (astroClockManuscriptMerger.js)
  - Entity records (ManuscriptRule, ManuscriptLibrary)
  - Reference library entries
  - Any future storage mechanism
Deletion is a CRITICAL BUG. The only acceptable response to a
deletion request is: "This is forbidden by the Preservation Law."

### RULE 3 — CONFLICTING INFORMATION: KEEP BOTH, NEVER OVERWRITE
If new information from a new manuscript conflicts with older
information from an existing manuscript:
  - BOTH versions are kept.
  - NEITHER is overwritten.
  - NEITHER is replaced.
  - Each version retains its original source attribution.
  - The conflict is displayed to the user as "different scholarly
    opinions" — not resolved, not reconciled, not merged into one.
  Example: If Havâss says Mansion 10 is Sa'd and Kashf says Mansion
  10 is Nahs, BOTH opinions are shown, each with its source. The
  user sees the disagreement, not a single "correct" answer.

### RULE 4 — EVERY OPINION SHOWS ITS ORIGINAL SOURCE
Every piece of manuscript information displayed in the UI must carry
its source attribution:
  - Book name (e.g., "Kashf al-Haqa'iq", "Havâss'ın Derinlikleri")
  - Page number(s)
  - Scholar/author (if attributed in the manuscript)
  - Language of origin
  No opinion appears without its source. No source is detached from
  its opinion. This binding is permanent and inseparable.

### RULE 5 — EVERY PAGE SUPPORTS UNLIMITED FUTURE ADDITIONS
Every topic page (Planet, Saat, Zodiac, Mansion, Moon, etc.) is
architected to accept unlimited future manuscript additions without
structural change. The ManuscriptSourcePanel component accepts an
array of sources — adding a 4th, 5th, or 50th source requires only
a new data file and merger entries. No existing component is
modified. No existing source is displaced.

### RULE 6 — REFERENCES, QUOTATIONS, PAGE NUMBERS, SOURCE NAMES
  REMAIN PERMANENTLY ATTACHED
Every quotation, page number, and source name extracted from a
manuscript is permanently bound to that manuscript. These bindings
cannot be:
  - Detached (a quotation cannot lose its source)
  - Reassigned (a page reference cannot be moved to another book)
  - Stripped (source names cannot be removed for "cleaner UI")
  - Aggregated (individual page references cannot be merged into a
    generic "various sources" label)
  The source attribution travels with the data, always.

### RULE 7 — MANUSCRIPT ENCYCLOPEDIA, NOT SINGLE-OPINION SYSTEM
The Astro Clock presents ALL scholarly opinions on a topic, not one
"correct" opinion. When a user opens a Planet, they see what Havâss
says, what Taha says, what Kashf says — all side by side, grouped by
source. The system never:
  - Picks a "winner" among conflicting opinions
  - Hides a minority opinion
  - Merges opinions into a consensus
  - Suppresses an opinion because it's "less authoritative"
  Every opinion has equal right to appear.

### RULE 8 — UI MAY CHANGE; KNOWLEDGE MUST NEVER CHANGE
The UI layer (components, styling, layout, animations, navigation)
may change at any time for any reason. The knowledge layer
(manuscript data, rules, quotations, references, opinions) must
never change due to a UI change. Specifically:
  - Redesigning a component does not delete its data source.
  - Removing a UI section does not delete the manuscript data it
    displayed — the data remains in the knowledge base.
  - Refactoring a data file does not remove any records.
  - Changing the language system does not remove any translations.
  UI is the display. Knowledge is the substance. Display changes.
  Substance endures.

### RULE 9 — CALCULATION ENGINES REMAIN INDEPENDENT
Existing calculation engines (astroClockLiveEngine, moonPosition,
planetaryHourRules, ritualTimingEngineV3, mizaanSaatCalculator,
etc.) remain completely independent from manuscript storage. The
engines compute astronomical positions and planetary hours. The
manuscripts provide textual knowledge and rules. These two layers
never merge:
  - A manuscript cannot alter a calculation formula.
  - A calculation engine cannot delete a manuscript rule.
  - Engine updates do not touch manuscript data files.
  - Manuscript imports do not touch engine code.
  (This rule mirrors Rule 7 of MANUSCRIPT_INTEGRATION_LAW.md and
  is restated here for emphasis — both laws apply simultaneously.)

### RULE 10 — THE PRESERVATION LAW IS PERMANENT
This law cannot be disabled, suspended, overridden, or deprecated
by any future update, feature, refactor, or instruction. It applies
to:
  - All current developers and AI agents
  - All future developers and AI agents
  - All code changes, past, present, and future
  - All UI redesigns, large and small
  - All performance optimizations
  - All data migrations
  Any code change that violates this law is a CRITICAL BUG that must
  be reverted immediately. This rule is self-reinforcing: the law
  cannot be removed because removing the law would violate the law.

# ═══════════════════════════════════════════════════════════════
# ENFORCEMENT
# ═══════════════════════════════════════════════════════════════
#
# The JS enforcement module at src/lib/manuscriptPreservationLaw.js
# exports constants and validation functions. These are defensive —
# they log violations but never crash the app.
#
# ═══════════════════════════════════════════════════════════════
# RELATIONSHIP TO OTHER LAWS
# ═══════════════════════════════════════════════════════════════
#
# This law supplements (does not replace):
#   - MANUSCRIPT_INTEGRATION_LAW.md (10 integration rules)
#   - MASTER_ARCHITECTURE_LAW.md (Abjad/Mizan isolation)
#   - ASTRO_CLOCK_PERMANENT_LOCK.md (engine freeze)
#
# All laws apply simultaneously. A violation of any law is a
# critical bug. When laws overlap, the STRICTER interpretation
# applies.
# ═══════════════════════════════════════════════════════════════