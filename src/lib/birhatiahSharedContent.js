// Presentation-only scope and deduplication. Never modify stored manuscripts, values or source rows.
import legacyTranslations from '../data/birhatiahLegacyAmalTranslations.js';
const legacyTranslationKey = entry => JSON.stringify([entry?.source_reference, entry?.source_page, sectionCOriginal(entry)]);
const checkedLegacyTranslations = new Map(legacyTranslations.entries.map(entry => [legacyTranslationKey(entry), entry.translation]));
export const BIRHATIAH_ADVANCED_FIELDS = [
  'invocation_wazifa', 'complete_birhatiyya_text', 'related_conjurations',
  'related_azaim', 'related_ruhaniyyat', 'related_talismans',
  'related_magic_squares', 'khawass', 'amal', 'mujarrabat', 'khatam',
  'dairah', 'talisman_images', 'ritual_procedure', 'conditions',
  'number_of_recitations', 'timing', 'planet', 'lunar_mansion',
  'zodiac', 'incense', 'colors', 'elements', 'angels', 'jinn',
  'servitors', 'benefits', 'warnings', 'scholarly_discussions',
  'historical_notes', 'manuscript_variants', 'related_books', 'cross_references'
];

export const BIRHATIAH_FIELD_LABELS = {
  invocation_wazifa: ['വസീഫകളും ദിക്റുകളും', 'Invocations and dhikr'],
  related_magic_squares: ['വെഫ്കുകളും കളങ്ങളും', 'Awfaq and squares'],
  related_talismans: ['താലിസ്മാനുകളും ചിത്രങ്ങളും', 'Talismans and figures'],
  talisman_images: ['മൂലചിത്രങ്ങൾ', 'Original figures'],
  khawass: ['ഖവാസ്സ്', 'Khawass'],
  amal: ['അമൽ', 'Amal'],
  mujarrabat: ['മുജർറബാത്ത്', 'Mujarrabat'],
  servitors: ['സേവകപരാമർശങ്ങൾ', 'Servitor accounts']
};

// Includes the source and page: similar words from different printed editions
// must remain separate, while exact repeated imports should show only once.
export function sectionCEntryKey(field, entry) {
  if (!entry || typeof entry !== 'object') return null;
  const fields = ['text', 'arabic_text', 'arabic', 'verbatim_text', 'arabic_original',
    'malayalam_translation', 'english_translation', 'text_ml', 'text_en',
    'meaning_ml', 'meaning_en', 'translation', 'source_reference', 'source_page',
    'source_book', 'citation', 'name_id', 'related_name_id', 'image_path'];
  const contentFields = fields.slice(0, 12).concat('image_path');
  if (!contentFields.some(key => entry[key] != null && String(entry[key]).trim())) return null;
  // Keep translated-only rows and distinct source readings. Import IDs are
  // deliberately excluded, but content, provenance and explicit scope remain.
  return JSON.stringify([field, fields.map(key => entry[key] ?? null)]);
}

export function sectionCEntriesForCard(entries, field, sharedKeys = new Set()) {
  const seen = new Set();
  return (Array.isArray(entries) ? entries : []).filter(entry => {
    const key = sectionCEntryKey(field, entry);
    if (!key || sharedKeys.has(key) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Only a source row present in ALL 28 different name records is recognized
// as shared. An explicit name_id always stays on its own name card.
export function collectSectionCShared(cards) {
  const byField = {};
  const keys = new Set();
  if (!Array.isArray(cards) || cards.length !== 28 ||
    new Set(cards.map(card => card.name_id)).size !== 28) return { byField, keys };
  const counts = new Map();
  const examples = new Map();
  for (const card of cards) {
    const perCard = new Set();
    for (const field of BIRHATIAH_ADVANCED_FIELDS) {
      for (const entry of Array.isArray(card[field]) ? card[field] : []) {
        if (entry?.name_id || entry?.related_name_id) continue;
        const key = sectionCEntryKey(field, entry);
        if (!key || perCard.has(key)) continue;
        perCard.add(key);
        counts.set(key, (counts.get(key) || 0) + 1);
        if (!examples.has(key)) examples.set(key, { field, entry });
      }
    }
  }
  for (const [key, count] of counts) {
    if (count !== 28) continue;
    keys.add(key);
    const { field, entry } = examples.get(key);
    (byField[field] ||= []).push(entry);
  }
  return { byField, keys };
}

// Display the actual imported wording, including mixed-language annotations.
// A missing translation must never make an original source entry disappear.
export function sectionCOriginal(entry) {
  return ['arabic_text', 'arabic_original', 'arabic', 'verbatim_text', 'text']
    .map(key => entry?.[key]).find(value => typeof value === 'string' && value.trim()) || '';
}

export function sectionCTranslation(entry, language) {
  const candidates = language === 'ml'
    ? [entry?.malayalam_translation, entry?.text_ml, entry?.meaning_ml, entry?.translation?.ml]
    : [entry?.english_translation, entry?.text_en, entry?.meaning_en, entry?.translation?.en];
  if (entry?.language === language) candidates.push(entry.text);
  // Match the exact source label, page AND wording. Preserve spelling variants
  // and prefer owner-supplied translations over this non-mutating fallback.
  candidates.push(checkedLegacyTranslations.get(legacyTranslationKey(entry))?.[language]);
  return candidates.find(value => typeof value === 'string' && value.trim()) || '';
}
