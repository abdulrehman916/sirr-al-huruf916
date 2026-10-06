// ═══════════════════════════════════════════════════════════════
// KASHF AL-HAQA'IQ — MASTER REGISTRATION
// Registers all 3 new data files into the cross-manuscript search
// ═══════════════════════════════════════════════════════════════
import { registerManuscriptInstructions } from "./manuscriptRitualGuideLaw";
import { MANSIONS_LAYER1, MANSION_OPERATIONS_TABLE, ZODIAC_MANSION_TABLE } from "./kashfManuscriptData_Part1_Mansions";
import { TAHSEEN_LIST } from "./kashfManuscriptData_Part2_Tahseen";
import { SARF_FORMULAS, AZIMA_SHAJARA, AZIMA_IDRIS, SARF_AMMAR_INTRO } from "./kashfManuscriptData_Part3_SarfExorcism";
import { ALL_NEW_AZAYIM, DAWAH_RASHIDIYYA, AZIMAH_BURHATIYYA, DAWAT_ASMA_QAMAR } from "./kashfManuscriptData_Part4_Azayim";
import { TAHWIRAT, NAQADAT } from "./kashfManuscriptData_Part5_Tahwirat";
import { KEYS_TO_SUCCESS, LETTER_NATURE_TABLE, LETTER_PROPERTIES_TABLE, ANGELS_OF_LETTERS, PLANETARY_DAYS_TABLE, PLANET_DETAILS_TABLE, ASCENDANT_TABLE, ABJAD_TABLES, SOLOMON_CARPET, DAWAT_NOORANIYYA, PLANET_METAL_SUBSTITUTES } from "./kashfManuscriptData_Part6_Tables";

const SOURCE = "Kashf al-Haqa'iq";
const SOURCE_AR = "كشف الحقائق";

// Build instructions for mansions
const mansionInstructions = { _general: {} };
MANSIONS_LAYER1.forEach(m => {
  mansionInstructions[`mansion_${m.id}`] = {
    title_ml: [{ text: `المنزلة ${m.number}: ${m.name_ar}`, page: m.page }],
    purpose: [{ text: m.purpose_ml || `Lunar Mansion ${m.name_en}`, page: m.page }],
    suitable_lunar_mansion: [{ text: m.name_ar, page: m.page }],
    suitable_operations: m.suitable ? [{ text: m.suitable, page: m.page }] : [],
    warnings: m.forbidden ? [{ text: m.forbidden, page: m.page }] : [],
    expected_result: m.marriage_rule ? [{ text: `Marriage: ${m.marriage_rule}`, page: m.page }] : [],
    timing: m.best_saat ? [{ text: `Best Saat: ${m.best_saat}`, page: m.page }] : [],
  };
});

// Build instructions for tahseen
const tahseenInstructions = { _general: {} };
TAHSEEN_LIST.forEach(t => {
  tahseenInstructions[`tahseen_${t.id}`] = {
    title_ml: [{ text: t.title_ar, page: t.page }],
    purpose: [{ text: t.purpose_en, page: t.page }],
    required_purification: t.timing ? [{ text: t.timing, page: t.page }] : [],
    repetition_count: t.repetition ? [{ text: t.repetition, page: t.page }] : [],
    expected_result: [{ text: t.purpose_en, page: t.page }],
    additional_notes: t.source_scholar ? [{ text: `By: ${t.source_scholar}`, page: t.page }] : [],
  };
});

// Build instructions for sarf + exorcisms
const sarfInstructions = { _general: {} };
SARF_FORMULAS.forEach(s => {
  sarfInstructions[s.id] = {
    title_ml: [{ text: s.title_ar, page: s.page }],
    purpose: [{ text: s.purpose_en, page: s.page }],
    required_incense: [{ text: "لبان (Frankincense/Luban) — burn before reciting", page: 153 }],
    repetition_count: s.repetition ? [{ text: s.repetition, page: s.page }] : [],
    before_recitation_steps: [
      { text: "Burn frankincense (luban) first", page: 153 },
      { text: "Stand facing the space you want to clear", page: 153 }
    ],
    expected_result: [{ text: s.purpose_en, page: s.page }],
    warnings: [{ text: "Must be done before ALL spiritual work. Skipping causes complete failure.", page: 153 }]
  };
});

sarfInstructions["azima_shajara"] = {
  title_ml: [{ text: AZIMA_SHAJARA.title_ar, page: AZIMA_SHAJARA.page }],
  purpose: [{ text: AZIMA_SHAJARA.purpose_en, page: AZIMA_SHAJARA.page }],
  how_to_use: AZIMA_SHAJARA.how_to_use.map((h, i) => ({ text: h, page: AZIMA_SHAJARA.page })),
  expected_result: [{ text: "First reading: abolishes magic. Second: burns jinn. Third: kills them.", page: AZIMA_SHAJARA.page }]
};

sarfInstructions["azima_idris"] = {
  title_ml: [{ text: AZIMA_IDRIS.title_ar, page: AZIMA_IDRIS.page }],
  purpose: [{ text: AZIMA_IDRIS.purpose_en, page: AZIMA_IDRIS.page }],
  expected_result: [{ text: "1st reading: abolishes magic. 2nd: burns jinn. 3rd: kills them.", page: AZIMA_IDRIS.page }]
};

// Build instructions for Part 4 — New Azayim
const azayimInstructions = { _general: {} };
ALL_NEW_AZAYIM.forEach(a => {
  azayimInstructions[a.id] = {
    title_ml: [{ text: a.title_ar, page: a.page }],
    purpose: [{ text: a.purpose_en, page: a.page }],
    repetition_count: a.repetition ? [{ text: a.repetition, page: a.page }] : [],
    expected_result: [{ text: a.purpose_en, page: a.page }],
    additional_notes: a.scholar ? [{ text: `By: ${a.scholar}`, page: a.page }] : [],
  };
});

// Build instructions for Part 5 — Tahwirat + Naqadat
const tahwiratInstructions = { _general: {} };
TAHWIRAT.forEach(t => {
  tahwiratInstructions[t.id] = {
    title_ml: [{ text: t.title_ar, page: t.page }],
    purpose: [{ text: t.purpose_en, page: t.page }],
    required_materials: t.materials ? [{ text: t.materials, page: t.page }] : [],
    expected_result: [{ text: t.purpose_en, page: t.page }],
    warnings: t.warning ? [{ text: t.warning, page: t.page }] : [],
  };
});
NAQADAT.forEach(n => {
  tahwiratInstructions[n.id] = {
    title_ml: [{ text: n.title_ar, page: n.page }],
    purpose: [{ text: n.purpose_en, page: n.page }],
    required_materials: n.ingredients ? n.ingredients.map((i, idx) => ({ text: i, page: n.page })) : [],
    expected_result: [{ text: n.purpose_en, page: n.page }],
  };
});

// Build instructions for Part 6 — Tables & Science
const tablesInstructions = {
  _general: {},
  keys_to_success: {
    title_ml: [{ text: "كيفية نجاح العمل الروحاني", page: 239 }],
    purpose: [{ text: "9 essential rules for spiritual work success from the manuscript", page: 239 }],
    conditions: KEYS_TO_SUCCESS.rules.map(r => ({ text: r.rule_en, page: 239 })),
  },
  letter_nature: {
    title_ml: [{ text: "جدول طبائع الحروف", page: 239 }],
    purpose: [{ text: "4-element letter nature system: fire/earth/air/water letters with compatibility rules", page: 239 }],
  },
  planetary_days: {
    title_ml: [{ text: "جدول ملوك الأيام العلوية والسفلية", page: 254 }],
    purpose: [{ text: "Complete 7-day planetary table: angels, kings, servants, metals, incense, colors, zodiac", page: 254 }],
  },
  abjad_tables: {
    title_ml: [{ text: "جداول حساب الجمل الأربعة", page: 242 }],
    purpose: [{ text: "All 4 Abjad systems: Kabir, Saghir, Tabi'i, Maqta' + Indian pen encoding", page: 242 }],
  },
  solomon_carpet: {
    title_ml: [{ text: "بساط سليمان — الأسماء الأربعة العبرانية", page: 255 }],
    purpose: [{ text: "4 Hebrew names on Solomon's carpet that stunned jinn: Kalmuwaiyat, Shaqiq, Hadlmaj, Shuwal", page: 255 }],
  },
};

// Register all six in the cross-manuscript search registry
registerManuscriptInstructions("kashf_mansions", SOURCE, mansionInstructions);
registerManuscriptInstructions("kashf_tahseen", SOURCE, tahseenInstructions);
registerManuscriptInstructions("kashf_sarf_exorcism", SOURCE, sarfInstructions);
registerManuscriptInstructions("kashf_azayim_pp181_212", SOURCE, azayimInstructions);
registerManuscriptInstructions("kashf_tahwirat_naqadat", SOURCE, tahwiratInstructions);
registerManuscriptInstructions("kashf_tables_science", SOURCE, tablesInstructions);

export const KASHF_TOTAL_ENTRIES = {
  mansions: MANSIONS_LAYER1.length,
  tahseen: TAHSEEN_LIST.length,
  sarf_formulas: SARF_FORMULAS.length,
  exorcisms: 2,
  new_azayim: ALL_NEW_AZAYIM.length,
  tahwirat: TAHWIRAT.length,
  naqadat: NAQADAT.length,
  science_tables: 14,
  operations_table: MANSION_OPERATIONS_TABLE.purpose_to_mansion.length,
  total: MANSIONS_LAYER1.length + TAHSEEN_LIST.length + SARF_FORMULAS.length + 2
    + ALL_NEW_AZAYIM.length + TAHWIRAT.length + NAQADAT.length + 14
};

export { MANSIONS_LAYER1, MANSION_OPERATIONS_TABLE, ZODIAC_MANSION_TABLE, TAHSEEN_LIST, SARF_FORMULAS, AZIMA_SHAJARA, AZIMA_IDRIS, SARF_AMMAR_INTRO, ALL_NEW_AZAYIM, TAHWIRAT, NAQADAT, KEYS_TO_SUCCESS, LETTER_NATURE_TABLE, LETTER_PROPERTIES_TABLE, ANGELS_OF_LETTERS, PLANETARY_DAYS_TABLE, PLANET_DETAILS_TABLE, ASCENDANT_TABLE, ABJAD_TABLES, SOLOMON_CARPET, DAWAT_NOORANIYYA, PLANET_METAL_SUBSTITUTES };