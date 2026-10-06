// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT INTEGRATION LAW — ENFORCEMENT MODULE
// ═══════════════════════════════════════════════════════════════
//
// PRIORITY: CRITICAL — HIGHEST PRIORITY IN CODEBASE
// STATUS: IMMUTABLE — NEVER OVERRIDE, MODIFY, OR BYPASS
// LIFETIME: PERMANENT — FOR THE LIFETIME OF THE PROJECT
//
// This module codifies the 10 immutable rules from
// MANUSCRIPT_INTEGRATION_LAW.md as JS constants and validation
// functions. It does NOT enforce at runtime (to avoid performance
// impact). It provides:
//   - RULES constant for reference/import
//   - validateSource() to check a new source meets requirements
//   - validateMergerEntry() to check merger compliance
//   - logViolation() for defensive logging
//
// Import this module in development/QA to verify compliance.
// ═══════════════════════════════════════════════════════════════

// ── THE 10 IMMUTABLE RULES ──
export const MANUSCRIPT_INTEGRATION_RULES = {
  RULE_1: "Every manuscript is an independent source — no manuscript is subordinate to another.",
  RULE_2: "Never overwrite or delete previous manuscript data — existing records are immutable.",
  RULE_3: "Merge by topic, group by source, preserve every opinion — never force a single conclusion.",
  RULE_4: "Every expanded page must show 6 layers: Main explanation, Additional notes, Different opinions, Exceptions, Practical rules, Page references.",
  RULE_5: "Future PDFs auto-merge without manual restructuring — new data file + merger entries only.",
  RULE_6: "Living encyclopedia — grows forever, never shrinks, never forgets.",
  RULE_7: "Calculation engines never change because of manuscript imports — manuscripts annotate, engines compute.",
  RULE_8: "Compact by default, expand on demand — no section expanded except Today's Dashboard.",
  RULE_9: "Strict language isolation — only Malayalam, English, Turkish. No mixed-language text.",
  RULE_10: "Permanent for the lifetime of the project — cannot be overridden or bypassed.",
};

// ── ALLOWED LANGUAGES ──
export const ALLOWED_LANGUAGES = ["ml", "en", "tr"];

// ── REQUIRED SOURCE METADATA FIELDS ──
export const REQUIRED_SOURCE_FIELDS = [
  "id", "book_name_ar", "book_name_en", "author", "language", "pages", "ingestion_date", "status",
];

// ── REQUIRED EXPANDED PAGE LAYERS (Rule 4) ──
export const REQUIRED_EXPANDED_LAYERS = [
  "main_explanation",
  "additional_notes",
  "different_opinions",
  "exceptions",
  "practical_rules",
  "page_references",
];

// ── PROTECTED CALCULATION ENGINES (Rule 7) ──
export const PROTECTED_ENGINES = [
  "astroClockLiveEngine",
  "astroClockMoonPosition",
  "astroClockPlanetaryHourRules",
  "ritualTimingEngineV3",
  "mizaanSaatCalculator",
  "astroClockEngine",
  "astroClockTimingEngine",
];

// ── DEFAULT-OPEN SECTIONS (Rule 8) ──
export const DEFAULT_OPEN_SECTIONS = ["TodayDashboard"];

// ── Validate a new source meets Rule 1 requirements ──
export function validateSource(sourceMetadata) {
  const violations = [];
  if (!sourceMetadata) {
    violations.push("Source metadata is null/undefined.");
    return { valid: false, violations };
  }
  for (const field of REQUIRED_SOURCE_FIELDS) {
    if (!sourceMetadata[field]) {
      violations.push(`Missing required field: ${field}`);
    }
  }
  if (sourceMetadata.language && !ALLOWED_LANGUAGES.includes(sourceMetadata.language.toLowerCase())) {
    // Arabic is allowed as the original manuscript language (not a UI language)
    if (sourceMetadata.language.toLowerCase() !== "arabic" && sourceMetadata.language.toLowerCase() !== "ar") {
      violations.push(`Disallowed language: ${sourceMetadata.language}. Only ML/EN/TR for UI, Arabic for original text.`);
    }
  }
  return { valid: violations.length === 0, violations };
}

// ── Validate merger entries don't overwrite (Rule 2) ──
export function validateMergerEntry(newEntry, existingEntries = []) {
  const violations = [];
  if (!newEntry?.id) {
    violations.push("Merger entry missing id.");
    return { valid: false, violations };
  }
  const duplicate = existingEntries.find(e => e.id === newEntry.id);
  if (duplicate) {
    violations.push(`Source ID "${newEntry.id}" already exists — cannot overwrite (Rule 2). Use a different ID or append data.`);
  }
  return { valid: violations.length === 0, violations };
}

// ── Defensive violation logger (never crashes) ──
export function logViolation(ruleKey, details) {
  const rule = MANUSCRIPT_INTEGRATION_RULES[ruleKey];
  if (!rule) {
    console.warn(`[ManuscriptIntegrationLaw] Unknown rule key: ${ruleKey}`);
    return;
  }
  console.warn(`[ManuscriptIntegrationLaw] VIOLATION — ${ruleKey}: ${rule}`);
  if (details) console.warn(`[ManuscriptIntegrationLaw] Details:`, details);
}

// ── Law metadata ──
export const LAW_METADATA = {
  established: "2026-07-08",
  status: "IMMUTABLE",
  priority: "CRITICAL",
  lifetime: "PERMANENT",
  document: "src/docs/MANUSCRIPT_INTEGRATION_LAW.md",
  rules_count: 10,
  current_sources: [
    { id: "havass", name: "Havâss'ın Derinlikleri", language: "Turkish", pages: "1-100" },
    { id: "taha", name: "Taha Judicial Astrology", language: "Farsi/Arabic", pages: "1-80" },
    { id: "kashf", name: "Kashf al-Haqa'iq", language: "Arabic", pages: "1-90" },
  ],
};