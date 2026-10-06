// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT RITUAL GUIDE DATA — KASHF AL-HAQA'IQ REGISTRATION
// ═══════════════════════════════════════════════════════════════
// Builds comprehensive instruction entries for all 37 recitations
// from Kashf al-Haqa'iq and registers them in the law module.
//
// FUTURE MANUSCRIPTS: Create a new data module, import
// registerManuscriptInstructions from manuscriptRitualGuideLaw,
// build instruction entries, and call registerManuscriptInstructions.
// The cross-manuscript search automatically includes the new source.
// No changes to this file or existing code needed.
// ═══════════════════════════════════════════════════════════════
import { registerManuscriptInstructions, autoClassifyEntry } from "./manuscriptRitualGuideLaw";
import {
  KASHF_AZAYIM_BY_DAY,
  KASHF_AQSAM_BY_DAY,
  KASHF_UNIVERSAL_SUPPLICATIONS,
  KASHF_ISTIKHARA_DUAS,
  KASHF_QURAN_RECITATIONS,
  KASHF_OPENING_SECRETS_DUAS,
  KASHF_TANZIL_DUAS,
  KASHF_DIVINE_NAMES,
  KASHF_TAWKEEL,
  WEEKDAY_PLANET_META,
  MANUSCRIPT_PERFORMANCE_RULES,
  RECITATION_RELATIONSHIPS,
  QURAN_VERIFICATION_NOTES,
} from "./astroClockDailyMantrasData";

const SOURCE = "Kashf al-Haqa'iq";
const rules = MANUSCRIPT_PERFORMANCE_RULES;

// Helper: derive Malayalam title from type + day (display label)
function deriveTitleMl(mantra, weekdayMeta) {
  if (weekdayMeta) {
    if (mantra.type === 'azimah') return `${weekdayMeta.day_ml} ദിവസത്തെ ആഹ്വാനം`;
    if (mantra.type === 'qasam') return `${weekdayMeta.day_ml} ദിവസത്തെ ശപഥം`;
  }
  if (mantra.id === 'kashf_istikhara') return 'ഇസ്തിഖാറ ദു‌ആ';
  if (mantra.id === 'kashf_opening_secrets') return 'രഹസ്യങ്ങൾ തുറക്കാനുള്ള ദു‌ആ';
  if (mantra.id === 'kashf_istighfar') return 'ഇസ്തിഗ്ഫാർ';
  if (mantra.id === 'kashf_tanzil_dua') return 'തൻസീൽ ദു‌ആ';
  if (mantra.id === 'kashf_ism_alim') return 'ദൈവ നാമം: യാ അലീം';
  if (mantra.id === 'kashf_tawkeel_love') return 'സ്നേഹ തവ്കീൽ';
  if (mantra.id === 'kashf_supplication_post_qasam') return 'സർവ ദു‌ആ';
  if (mantra.id === 'kashf_supplication_ilahi') return 'ആത്മ കൃത്യ ദു‌ആ';
  if (mantra.type === 'quran_recitation') {
    const note = QURAN_VERIFICATION_NOTES[mantra.id];
    return note ? `ഖുർആൻ വചനം (${note.quran_ref})` : 'ഖുർആൻ വചനം';
  }
  return mantra.purpose_ml?.slice(0, 40) || mantra.id;
}

// Helper: derive when to perform from manuscript timing rules
function deriveWhenToPerform(mantra) {
  const parts = [{ text: 'നിശ്ചിത ഗ്രഹ ഘടികയിൽ', page: 11 }];
  if (mantra.type === 'azimah') {
    parts.push({ text: 'രാത്രി ഉത്തമം', page: 39 });
    parts.push({ text: 'ഖസത്തിന് മുമ്പ് ചൊല്ലുക', page: '27-31' });
  } else if (mantra.type === 'qasam') {
    parts.push({ text: 'അസീം-ന് ശേഷം ചൊല്ലുക', page: '27-31' });
  } else if (mantra.id === 'kashf_istikhara') {
    return [{ text: 'എല്ലാ കൃത്യങ്ങൾക്ക് മുമ്പ് ചൊല്ലുക', page: 43 }];
  } else if (mantra.id === 'kashf_supplication_post_qasam') {
    return [{ text: 'എല്ലാ കൃത്യങ്ങൾക്ക് ശേഷം ചൊല്ലുക', page: 31 }];
  } else if (mantra.id === 'kashf_istighfar') {
    return [{ text: 'തൻസീലിന് മുമ്പ് ചൊല്ലുക', page: 51 }];
  } else if (mantra.id === 'kashf_tanzil_dua') {
    return [{ text: 'ഇസ്തിഗ്ഫാറിന് ശേഷം ചൊല്ലുക', page: 51 }];
  } else if (mantra.id === 'kashf_opening_secrets') {
    parts.push({ text: 'രഹസ്യങ്ങൾ തുറക്കാൻ', page: 47 });
  } else if (mantra.id === 'kashf_ism_alim') {
    return [{ text: 'രഹസ്യങ്ങൾ തുറക്കാൻ 15 തവണ ആവർത്തിക്കുക', page: 47 }];
  } else if (mantra.id === 'kashf_tawkeel_love') {
    parts.push({ text: 'സ്നേഹ കൃത്യത്തിൽ', page: 52 });
  }
  return parts;
}

// Build a comprehensive instruction entry from verified manuscript data.
// Only uses data actually present in the manuscripts — never invents.
function buildEntry(mantra) {
  const entry = {};
  const page = mantra.source?.page;
  const weekdayMeta = mantra.day_index !== null && mantra.day_index !== undefined
    ? WEEKDAY_PLANET_META.find(d => d.day_index === mantra.day_index)
    : null;

  // Category (auto-classified)
  entry.category = [{ text: autoClassifyEntry(mantra), page }];

  // Malayalam Title (display label derived from type + day)
  entry.title_ml = [{ text: deriveTitleMl(mantra, weekdayMeta), page }];

  // Purpose
  if (mantra.purpose_ml) {
    entry.purpose = [{ text: mantra.purpose_ml, page }];
  }

  // Introduction (what this practice is used for — from purpose)
  if (mantra.purpose_ml) {
    entry.introduction = [{ text: mantra.purpose_ml, page }];
  }

  // When to perform (from manuscript timing rules)
  entry.when_to_perform = deriveWhenToPerform(mantra);

  // Expected result (from purpose — manuscript states expected outcome)
  if (mantra.purpose_ml) {
    entry.expected_result = [{ text: mantra.purpose_ml, page }];
  }

  // Suitable weekday + planet + angel (from weekday metadata, pp.27-31)
  if (weekdayMeta) {
    entry.suitable_weekday = [{ text: `${weekdayMeta.day_ml} (${weekdayMeta.day_en})`, page }];
    entry.suitable_planet = [{ text: `${weekdayMeta.planet_ml} (${weekdayMeta.planet_en})`, page }];
    entry.required_angel = [{ text: `${weekdayMeta.angel_en} (${weekdayMeta.angel_ml})`, page }];
  }

  // Required Jinn (king for Azimah, servant for Qasam)
  if (mantra.king_en) {
    entry.required_jinn = [{ text: `${mantra.king_en} (${mantra.king})`, page }];
  } else if (mantra.servant_en) {
    entry.required_jinn = [{ text: `${mantra.servant_en} (${mantra.servant})`, page }];
  }

  // Repetition count
  if (mantra.repetition) {
    entry.repetition_count = [{ text: `${mantra.repetition} തവണ`, page }];
  }

  // General performance rules (apply to all recitations, from Kashf pp.11,20,39,42,65)
  entry.suitable_saat = [{ text: rules.timing.rule_ml, page: 11 }];
  entry.suitable_moon_phase = [{ text: rules.moon.rule_ml, page: 20 }];
  entry.required_direction = [{ text: rules.direction.default_ml, page: 42 }];
  entry.during_recitation_rules = [{ text: rules.night_preference.rule_ml, page: 39 }];
  entry.warnings = [{ text: rules.night_preference.rule_ml, page: 39 }];
  entry.additional_notes = [{ text: rules.day_boundary.rule_ml, page: 65 }];

  // Type-specific before/after rules (from manuscript structure pp.27-31)
  if (mantra.type === "azimah") {
    entry.before_recitation_steps = [{ text: "ആഹ്വാനം (അസീം) ചൊല്ലുക, ശേഷം ഖസം ചൊല്ലുക", page: "27-31" }];
    entry.after_recitation_rules = [{ text: "സർവ ദു‌ആ ചൊല്ലുക", page: 31 }];
    entry.azimah = [{ text: "ആഹ്വാന പാഠം മുകളിൽ കാണാം", page }];
  } else if (mantra.type === "qasam") {
    entry.before_recitation_steps = [{ text: "ഖസം ചൊല്ലുക (അസീമ-ന് ശേഷം)", page: "27-31" }];
    entry.after_recitation_rules = [{ text: "സർവ ദു‌ആ ചൊല്ലുക", page: 31 }];
    entry.qasam = [{ text: "ശപഥ പാഠം മുകളിൽ കാണാം", page }];
  }

  // Related rituals (from RECITATION_RELATIONSHIPS)
  const relatedIds = RECITATION_RELATIONSHIPS[mantra.id] || [];
  if (relatedIds.length > 0) {
    entry.related_rituals = relatedIds.map(id => ({ text: id, page }));
  }

  // Quran verses (for quran_recitation type)
  if (mantra.type === "quran_recitation") {
    const note = QURAN_VERIFICATION_NOTES[mantra.id];
    if (note) {
      entry.quran_verses = [{ text: note.quran_ref, page }];
    }
  }

  // Specific recitation details (from manuscript)
  if (mantra.id === "kashf_istikhara") {
    entry.conditions = [{ text: "كذا وكذا-ൽ ആവശ്യം പ്രസ്താവിക്കുക", page: 43 }];
    entry.before_recitation_steps = [{ text: "എല്ലാ ആത്മ കൃത്യങ്ങൾക്ക് മുമ്പ് ചൊല്ലുക", page: 43 }];
  }

  if (mantra.id === "kashf_opening_secrets") {
    entry.salawat = [{ text: "സലാവത്ത് ഉൾപ്പെടുന്നു", page: 47 }];
    entry.required_divine_names = [{ text: "യാ ഹയ്യ് യാ ഖയ്യൂം", page: 47 }];
  }

  if (mantra.id === "kashf_ism_alim") {
    entry.ism = [{ text: "യാ അലീം", page: 47 }];
  }

  if (mantra.id === "kashf_istighfar") {
    entry.before_recitation_steps = [{ text: "തൻസീലിന് മുമ്പ് ചൊല്ലുക", page: 51 }];
  }

  if (mantra.id === "kashf_tanzil_dua") {
    entry.before_recitation_steps = [{ text: "ഇസ്തിഗ്ഫാർ ചൊല്ലിയ ശേഷം ചൊല്ലുക", page: 51 }];
  }

  if (mantra.id === "kashf_tawkeel_love") {
    entry.tawkeel = [{ text: "തവ്കീൽ പാഠം മുകളിൽ കാണാം", page: 52 }];
    entry.conditions = [{ text: "فلان بن فلانة-ൽ ലക്ഷ്യസ്ഥാനയുടെ പേരും അമ്മയുടെ പേരും നൽകുക", page: 52 }];
  }

  if (mantra.id === "kashf_supplication_post_qasam") {
    entry.quran_verses = [{ text: "Quran 31:27", page: 31 }];
    entry.after_recitation_rules = [{ text: "എല്ലാ ആത്മ കൃത്യങ്ങൾ ചെയ്ത ശേഷം ചൊല്ലുക", page: 31 }];
  }

  if (mantra.id === "kashf_supplication_ilahi") {
    entry.before_recitation_steps = [{ text: "ആത്മ കൃത്യങ്ങൾക്കും ത്വിലസ്മ പ്രവർത്തനത്തിനും മുമ്പ്", page: 37 }];
  }

  return entry;
}

// Build instruction entries for all 37 recitations
const allRecitations = [
  ...KASHF_AZAYIM_BY_DAY,
  ...KASHF_AQSAM_BY_DAY,
  ...KASHF_UNIVERSAL_SUPPLICATIONS,
  ...KASHF_ISTIKHARA_DUAS,
  ...KASHF_QURAN_RECITATIONS,
  ...KASHF_OPENING_SECRETS_DUAS,
  ...KASHF_TANZIL_DUAS,
  ...KASHF_DIVINE_NAMES,
  ...KASHF_TAWKEEL,
];

const instructions = {};
for (const mantra of allRecitations) {
  instructions[mantra.id] = buildEntry(mantra);
}

// Register in the law module — search now includes Kashf al-Haqa'iq
registerManuscriptInstructions("kashf_alhaqa_iq", SOURCE, instructions);

// Re-export search functions for convenience
export {
  getMergedRitualInstructions,
  getFieldInstructions,
  isFieldSpecified,
  getRegisteredSources,
  RITUAL_INSTRUCTION_FIELDS,
  MANUSCRIPT_RITUAL_GUIDE_LAW,
  MANUSCRIPT_CATEGORIES,
  autoClassifyEntry,
} from "./manuscriptRitualGuideLaw";