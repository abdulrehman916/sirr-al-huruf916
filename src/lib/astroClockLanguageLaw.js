// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK LANGUAGE SYSTEM LAW — ENFORCEMENT MODULE
// ═══════════════════════════════════════════════════════════════
//
// PRIORITY: CRITICAL — EQUAL HIGHEST PRIORITY IN CODEBASE
// STATUS: IMMUTABLE — CANNOT BE DISABLED BY FUTURE UPDATES
// LIFETIME: PERMANENT — FOR THE LIFETIME OF THE PROJECT
//
// This module codifies the 10 language rules from
// LANGUAGE_SYSTEM_LAW.md as JS constants and validation functions.
//
// KEY PRINCIPLE:
//   The Astro Clock is completely language-independent.
//   The user selects ONE language and sees ONLY that language.
//   Arabic script is permanently preserved.
//   Original manuscript data is never edited.
//
// This module is defensive — it logs violations but never crashes.
// ═══════════════════════════════════════════════════════════════

// ── THE 10 LANGUAGE RULES ──
export const LANGUAGE_RULES = {
  RULE_1: "Supported languages: Malayalam, English, Turkish — closed set, no others.",
  RULE_2: "Malayalam mode: zero Turkish words anywhere in the UI (except Arabic script).",
  RULE_3: "English mode: zero Turkish words anywhere in the UI (except Arabic script).",
  RULE_4: "Turkish mode: show original manuscript text exactly as sourced.",
  RULE_5: "Arabic is the only exception — always in Arabic script, never romanized.",
  RULE_6: "Translation is display-layer only — original manuscript data never edited.",
  RULE_7: "Every manuscript record has original + ML + EN + TR fields.",
  RULE_8: "Never mix languages — one language per card/panel/section (except Arabic).",
  RULE_9: "Applies to every Astro Clock section, present and future.",
  RULE_10: "Permanent for all future manuscripts — cannot be disabled.",
};

// ── ALLOWED UI LANGUAGES (Rule 1) ──
export const ALLOWED_UI_LANGUAGES = ["ml", "en", "tr"];

// ── ARABIC IS THE ONLY EXCEPTION (Rule 5) ──
export const PRESERVED_SCRIPT = "ar";

// ── REQUIRED TRANSLATION FIELDS PER RECORD (Rule 7) ──
export const REQUIRED_TRANSLATION_FIELDS = [
  "name_ml", "name_en", "name_tr",
  "summary_ml", "summary_en", "summary_tr",
];

// ── ASTRO CLOCK SECTIONS THAT MUST COMPLY (Rule 9) ──
export const COMPLIANT_SECTIONS = [
  "TodayDashboard",
  "SmartSearch",
  "SaatGrid",
  "MoonCenter",
  "MoonZodiac",
  "MansionsReference",
  "ZodiacSigns",
  "PlanetEncyclopedia",
  "ReferenceLibrary",
];

// ── Validate a language is allowed (Rule 1) ──
export function validateLanguage(lang) {
  if (!ALLOWED_UI_LANGUAGES.includes(lang)) {
    return {
      valid: false,
      violation: `Language "${lang}" is not allowed. Only ml, en, tr are supported (Rule 1).`,
    };
  }
  return { valid: true, violation: null };
}

// ── Validate a record has all required translation fields (Rule 7) ──
export function validateRecordTranslations(record) {
  const violations = [];
  if (!record) {
    violations.push("Record is null/undefined.");
    return { valid: false, violations };
  }
  for (const field of REQUIRED_TRANSLATION_FIELDS) {
    // Only check if the field is expected for this record type
    // (not all records have name_* or summary_* — this is a best-effort check)
    if (record[field] === undefined) {
      // Field not present — this is acceptable if the record doesn't use it
      continue;
    }
    if (record[field] === null || record[field] === "") {
      violations.push(`Translation field "${field}" is empty (Rule 7).`);
    }
  }
  return { valid: violations.length === 0, violations };
}

// ── Check if text contains a forbidden language (Rule 2/3/8) ──
// Detects Turkish characters/words in ML or EN mode text.
// This is a heuristic — not perfect, but catches common violations.
export function detectLanguageMix(text, expectedLanguage) {
  if (!text || typeof text !== "string") return { mixed: false, found: [] };
  const found = [];

  if (expectedLanguage === "ml") {
    // Turkish-specific characters that don't appear in Malayalam
    const turkishChars = ["ı", "İ", "ş", "Ş", "ğ", "Ğ", "ç", "Ç", "ö", "Ö", "ü", "Ü"];
    for (const ch of turkishChars) {
      if (text.includes(ch)) {
        found.push(`Turkish character "${ch}" found in Malayalam text`);
      }
    }
  }

  if (expectedLanguage === "en") {
    // Turkish-specific characters that don't appear in English
    const turkishChars = ["ı", "İ", "ş", "Ş", "ğ", "Ğ", "ç", "Ç", "ö", "Ö", "ü", "Ü"];
    for (const ch of turkishChars) {
      if (text.includes(ch)) {
        found.push(`Turkish character "${ch}" found in English text`);
      }
    }
  }

  return { mixed: found.length > 0, found };
}

// ── Validate Arabic is not romanized (Rule 5) ──
export function validateArabicPreserved(arabicText, displayText) {
  // If the source is Arabic, the display should NOT be a romanized version
  // This is a light check — ensures Arabic script is present when expected
  if (!arabicText) return { valid: true, violations: [] };
  const hasArabicScript = /[\u0600-\u06FF\u0750-\u077F]/.test(arabicText);
  if (!hasArabicScript) {
    return {
      valid: false,
      violations: ["Arabic text does not contain Arabic script — may be romanized (Rule 5)."],
    };
  }
  return { valid: true, violations: [] };
}

// ── Defensive violation logger (never crashes) ──
export function logLanguageViolation(ruleKey, details) {
  const rule = LANGUAGE_RULES[ruleKey];
  if (!rule) {
    console.warn(`[LanguageLaw] Unknown rule key: ${ruleKey}`);
    return;
  }
  console.error(`[LanguageLaw] CRITICAL VIOLATION — ${ruleKey}: ${rule}`);
  if (details) console.error(`[LanguageLaw] Details:`, details);
  console.error(`[LanguageLaw] See LANGUAGE_SYSTEM_LAW.md — mixed-language text is a critical bug.`);
}

// ── Law metadata ──
export const LANGUAGE_LAW_METADATA = {
  established: "2026-07-08",
  status: "IMMUTABLE",
  priority: "CRITICAL",
  lifetime: "PERMANENT",
  document: "src/docs/LANGUAGE_SYSTEM_LAW.md",
  rules_count: 10,
  can_be_disabled: false,
  supported_languages: ALLOWED_UI_LANGUAGES,
  preserved_script: PRESERVED_SCRIPT,
  core_principle: "One language per view. Arabic always preserved. Original data never edited.",
};