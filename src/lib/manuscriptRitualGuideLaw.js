// ═══════════════════════════════════════════════════════════════
// PERMANENT ARCHITECTURE LAW — MANUSCRIPT RITUAL GUIDE
// ═══════════════════════════════════════════════════════════════
// Every ritual guide must be built ONLY from original manuscripts.
//
// LAW:
//   1. Search ALL imported manuscripts before showing "Not specified"
//   2. Merge every instruction — never discard, never duplicate
//   3. Preserve original manuscript order
//   4. Every instruction includes source + page number
//   5. Future manuscripts auto-participate via registry — no code changes
//   6. Never invent, summarize, or modify manuscript instructions
//   7. "Not specified in any imported manuscript" only after ALL searched
//
// FUTURE MANUSCRIPTS: Call registerManuscriptInstructions(sourceId,
// sourceName, instructions) from a new data module. The search
// automatically includes the new source — no changes to existing code.
// ═══════════════════════════════════════════════════════════════

// Comprehensive instruction schema — all possible ritual guide fields
export const RITUAL_INSTRUCTION_FIELDS = [
  'purpose',
  'benefits',
  'suitable_weekday',
  'suitable_saat',
  'suitable_planet',
  'suitable_lunar_mansion',
  'suitable_moon_phase',
  'suitable_zodiac',
  'required_angel',
  'required_jinn',
  'required_divine_names',
  'required_incense',
  'required_clothing',
  'required_direction',
  'required_fasting',
  'required_purification',
  'required_intention',
  'repetition_count',
  'before_recitation_steps',
  'during_recitation_rules',
  'after_recitation_rules',
  'warnings',
  'notes',
  'conditions',
  'exceptions',
  'related_rituals',
  'quran_verses',
  'salawat',
  'dhikr',
  'ism',
  'qasam',
  'azimah',
  'tawkeel',
  'title_ml',
  'introduction',
  'when_to_perform',
  'category',
  'required_herbs',
  'required_plants',
  'required_medicines',
  'required_powders',
  'required_oils',
  'required_materials',
  'required_preparation',
  'arabic_word_explanations',
  'avoidances',
  'expected_result',
  'additional_notes',
];

// Registry of manuscript instruction sources
// Each: { sourceId, sourceName, instructions: { recitationId: { field: [{text, page}] } } }
const _registry = [];

// Register a manuscript instruction source.
// Future manuscripts call this to auto-participate in the cross-manuscript search.
export function registerManuscriptInstructions(sourceId, sourceName, instructions) {
  if (_registry.find(s => s.sourceId === sourceId)) return;
  _registry.push({ sourceId, sourceName, instructions });
}

// Get all registered sources (for verification that ALL were searched)
export function getRegisteredSources() {
  return _registry.map(s => ({ sourceId: s.sourceId, sourceName: s.sourceName }));
}

// Search ALL registered manuscripts for instructions about a recitation.
// Returns merged instructions: { field: [{ text, source, page }] }
// Merges without discarding or duplicating. Preserves manuscript order.
export function getMergedRitualInstructions(recitationId) {
  const merged = {};
  for (const field of RITUAL_INSTRUCTION_FIELDS) {
    merged[field] = [];
  }

  for (const source of _registry) {
    const entry = source.instructions[recitationId];
    const generalEntry = source.instructions['_general'];
    const entriesToSearch = [entry, generalEntry].filter(Boolean);
    if (entriesToSearch.length === 0) continue;
    for (const field of RITUAL_INSTRUCTION_FIELDS) {
      for (const ent of entriesToSearch) {
        const instructions = ent[field];
        if (!instructions || !Array.isArray(instructions)) continue;
        for (const instr of instructions) {
          const exists = merged[field].some(m =>
            m.text === instr.text &&
            m.source === source.sourceName &&
            m.page === instr.page
          );
          if (!exists) {
            merged[field].push({
              text: instr.text,
              source: source.sourceName,
              page: instr.page,
            });
          }
        }
      }
    }
  }

  return merged;
}

// Get instructions for a single field with source+page attribution.
// Returns null if not found in ANY registered manuscript (after searching ALL).
export function getFieldInstructions(recitationId, fieldName) {
  const merged = getMergedRitualInstructions(recitationId);
  const instructions = merged[fieldName];
  if (!instructions || instructions.length === 0) return null;
  return instructions;
}

// Check if a field is specified in ANY registered manuscript
export function isFieldSpecified(recitationId, fieldName) {
  return getFieldInstructions(recitationId, fieldName) !== null;
}

// Manuscript entry categories — auto-classification system
export const MANUSCRIPT_CATEGORIES = [
  'Dua', 'Azimah', 'Qasam', 'Tawkeel', 'Dhikr', 'Quran Verse', 'Salawat',
  'Istighfar', 'Healing Method', 'Herbal Medicine', 'Plant Uses', 'Oils',
  'Powders', 'Incense', 'Talisman', 'Vefk', 'Spiritual Treatment',
  'Physical Treatment', 'Protection', 'Love Works', 'Rizq', 'Business',
  'Enemy Protection', 'Jinn Related', 'Angel Related', 'Planet Related',
  'Saat Related', 'Lunar Mansion Related', 'Moon Related', 'Zodiac Related',
  'Dream', 'Istikhara', 'Purification', 'Fasting', 'Clothing', 'Direction',
  'Timing', 'Conditions', 'Warnings', 'Notes', 'Other',
];

const TYPE_TO_CATEGORY = {
  azimah: 'Azimah',
  qasam: 'Qasam',
  universal_supplication: 'Dua',
  dua: 'Dua',
  prayer: 'Istikhara',
  quran_recitation: 'Quran Verse',
  istighfar: 'Istighfar',
  tawkeel: 'Tawkeel',
  ism: 'Dhikr',
  conditions: 'Conditions',
  protection: 'Protection',
  jinn_related: 'Jinn Related',
  incense: 'Incense',
  timing: 'Timing',
  warnings: 'Warnings',
  fasting: 'Fasting',
  materials: 'Powders',
  lunar_mansion: 'Lunar Mansion Related',
  lunar_day: 'Timing',
  nahs_days: 'Warnings',
  poetry: 'Notes',
};

// Auto-classify a manuscript entry into a category based on its type
export function autoClassifyEntry(mantra) {
  return TYPE_TO_CATEGORY[mantra.type] || 'Other';
}

// The permanent law constant
export const MANUSCRIPT_RITUAL_GUIDE_LAW = {
  law_en: "Every ritual guide must be built ONLY from original manuscripts. Search ALL imported manuscripts completely before displaying 'Not specified in any imported manuscript.' Merge every manuscript instruction. Never discard or duplicate information. Preserve original manuscript order. Every displayed instruction must include its manuscript source and page number. Future imported manuscripts must automatically participate in this search without modifying existing code.",
  law_ml: "ഓരോ ആചാര ഗൈഡും മൂല ഗ്രന്ഥങ്ങളിൽ നിന്ന് മാത്രം നിർമ്മിക്കണം. 'ഇറക്കുമതി ചെയ്ത ഒരു ഗ്രന്ഥത്തിലും പറയാത്തത്' എന്ന് കാണിക്കുന്നതിന് മുമ്പ് എല്ലാ ഗ്രന്ഥങ്ങളും പൂർണ്ണമായി തിരയണം. ഭാവി ഗ്രന്ഥങ്ങൾ സ്വയമേവ ഈ തിരച്ചിലിൽ പങ്കെടുക്കണം.",
  principles: [
    "Search ALL imported manuscripts before showing 'Not specified'",
    "Merge instructions from multiple manuscripts without discarding or duplicating",
    "Preserve original manuscript order",
    "Every instruction includes source + page number",
    "Future manuscripts auto-participate via registry — no code changes needed",
    "Never invent, summarize, or modify manuscript instructions",
    "'Not specified in any imported manuscript' only after ALL manuscripts searched",
  ],
  field_schema: RITUAL_INSTRUCTION_FIELDS,
};