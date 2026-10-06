// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT PRESERVATION LAW — ENFORCEMENT MODULE
// ═══════════════════════════════════════════════════════════════
//
// PRIORITY: CRITICAL — EQUAL HIGHEST PRIORITY IN CODEBASE
// STATUS: IMMUTABLE — CANNOT BE DISABLED BY FUTURE UPDATES
// LIFETIME: PERMANENT — FOR THE LIFETIME OF THE PROJECT
//
// This module codifies the 10 preservation rules from
// MANUSCRIPT_PRESERVATION_LAW.md as JS constants and validation
// functions. It supplements (does not replace) the Manuscript
// Integration Law.
//
// KEY DISTINCTION:
//   Integration Law = HOW manuscripts merge into the UI
//   Preservation Law = WHY manuscripts can never be removed
//
// This module is defensive — it logs violations but never crashes.
// ═══════════════════════════════════════════════════════════════

// ── THE 10 PRESERVATION RULES ──
export const PRESERVATION_RULES = {
  RULE_1: "Every imported manuscript is permanent — cannot be removed or deprecated.",
  RULE_2: "Nothing from any manuscript may ever be deleted — no record, no field, no quotation.",
  RULE_3: "Conflicting information: keep BOTH, never overwrite, never replace.",
  RULE_4: "Every opinion shows its original source — book, page, scholar, language.",
  RULE_5: "Every page supports unlimited future manuscript additions without structural change.",
  RULE_6: "References, quotations, page numbers, source names remain permanently attached.",
  RULE_7: "Manuscript encyclopedia, not single-opinion system — all opinions have equal right to appear.",
  RULE_8: "UI may change; knowledge must never change — display is temporary, substance endures.",
  RULE_9: "Calculation engines remain completely independent from manuscript storage.",
  RULE_10: "The preservation law is permanent and cannot be disabled by future updates.",
};

// ── PROTECTED DATA FILES (Rule 2 — never delete from these) ──
export const PROTECTED_MANUSCRIPT_FILES = [
  "src/lib/astroClockKashfData.js",
  "src/lib/astroClockTahaData.js",
  "src/lib/astroClockKnowledgeBase.js",
  "src/lib/astroClockPlanetaryHourRules.js",
  "src/lib/astroClockData.js",
  "src/lib/astroClockMoonPosition.js",
  "src/lib/astroClockManuscriptMerger.js",
];

// ── PROTECTED ENTITY NAMES (Rule 2 — never deleteMany on these) ──
export const PROTECTED_ENTITIES = [
  "ManuscriptRule",
  "ManuscriptLibrary",
];

// ── REQUIRED SOURCE ATTRIBUTION FIELDS (Rule 4 + Rule 6) ──
export const REQUIRED_ATTRIBUTION_FIELDS = [
  "source",      // Book name
  "page",        // Page number(s)
  "scholar",     // Author/scholar (if known)
  "language",    // Language of origin
];

// ── Validate that an item has source attribution (Rule 4) ──
export function validateAttribution(item) {
  const violations = [];
  if (!item) {
    violations.push("Item is null/undefined.");
    return { valid: false, violations };
  }
  if (!item.source) violations.push("Missing source (book name) — Rule 4 violation.");
  if (!item.page && !item.source?.includes("p.")) {
    violations.push("Missing page reference — Rule 4 violation.");
  }
  return { valid: violations.length === 0, violations };
}

// ── Validate that a conflict preserves both opinions (Rule 3) ──
export function validateConflictResolution(existingOpinion, newOpinion) {
  const violations = [];
  if (!existingOpinion || !newOpinion) {
    return { valid: true, violations: [] }; // No conflict if one is missing
  }
  // If the opinions differ, BOTH must be retained — no overwrite
  if (JSON.stringify(existingOpinion) !== JSON.stringify(newOpinion)) {
    // This is a conflict — the merger must keep both, not replace
    // This function is a reminder/check: the caller must NOT have
    // replaced existingOpinion with newOpinion
    return {
      valid: true,
      violations: [],
      isConflict: true,
      guidance: "Conflict detected — both opinions must be preserved (Rule 3). Do not overwrite.",
    };
  }
  return { valid: true, violations: [], isConflict: false };
}

// ── Check if a file is protected from deletion (Rule 2) ──
export function isProtectedFile(filePath) {
  return PROTECTED_MANUSCRIPT_FILES.includes(filePath);
}

// ── Check if an entity is protected from deleteMany (Rule 2) ──
export function isProtectedEntity(entityName) {
  return PROTECTED_ENTITIES.includes(entityName);
}

// ── Defensive violation logger (never crashes) ──
export function logPreservationViolation(ruleKey, details) {
  const rule = PRESERVATION_RULES[ruleKey];
  if (!rule) {
    console.warn(`[PreservationLaw] Unknown rule key: ${ruleKey}`);
    return;
  }
  console.error(`[PreservationLaw] CRITICAL VIOLATION — ${ruleKey}: ${rule}`);
  if (details) console.error(`[PreservationLaw] Details:`, details);
  console.error(`[PreservationLaw] This violation must be reverted immediately. See MANUSCRIPT_PRESERVATION_LAW.md`);
}

// ── Law metadata ──
export const PRESERVATION_LAW_METADATA = {
  established: "2026-07-08",
  status: "IMMUTABLE",
  priority: "CRITICAL",
  lifetime: "PERMANENT",
  document: "src/docs/MANUSCRIPT_PRESERVATION_LAW.md",
  rules_count: 10,
  can_be_disabled: false,
  supplements: "MANUSCRIPT_INTEGRATION_LAW.md",
  core_principle: "The Astro Clock is a manuscript encyclopedia. Knowledge is permanent. UI is temporary.",
};