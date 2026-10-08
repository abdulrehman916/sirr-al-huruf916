// Presentation-only scope and deduplication. Never modify stored manuscripts, values or source rows.
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
  const text = String(entry.text ?? entry.arabic_text ?? entry.verbatim_text ?? '').trim();
  if (!text) return null;
  return JSON.stringify([field, text, String(entry.source_reference ?? ''), String(entry.source_page ?? '')]);
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
