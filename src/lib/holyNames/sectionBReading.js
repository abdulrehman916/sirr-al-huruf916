import quranMeanings from '@/data/holyNamesQuranMeanings.json';
import structuredMethods from '@/data/holyNamesSectionBMethods.json';
import shamsBrief from '@/data/holyNamesShamsBrief.json';

export const SECTION_B_FIELDS = ['scholarly_entries', 'mujarrabat', 'amal', 'dua', 'wazifa', 'khawass', 'wafq', 'talisman', 'servitor', 'benefits', 'warnings', 'conditions', 'timings', 'repetitions', 'methods'];
const CHECKED = new Set(['checked_against_scan', 'checked_against_primary_text', 'checked_against_digital_text']);
export const isSourceChecked = entry => CHECKED.has(entry?.review_status);

// Only explicitly public URLs and known public primary-text hosts are displayed.
// Imported storage URLs remain inside the existing authenticated API boundary.
function publicUrl(entry) {
  const value = entry.public_source_url || entry.source_url || entry.url;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['tanzil.net', 'quran.ksu.edu.sa', 'sunnah.com', 'archive.org'].includes(url.hostname) ? value : null;
  } catch { return null; }
}

function normalize(entry, field, index) {
  const verse = /Tanzil/.test(entry.source_book || '') ? quranMeanings.verses[entry.source_page] : null;
  const arabic = entry.arabic_text || entry.arabic_original || '';
  const matchedVerse = verse && (!arabic || arabic === verse.arabic) ? verse : null;
  const multipleVerses = /Tanzil/.test(entry.source_book || '') && !arabic && String(entry.source_page).includes(';')
    ? entry.source_page.split(';').map(ref => ({ ref: ref.trim(), ...quranMeanings.verses[ref.trim()] })).filter(item => item.arabic) : [];
  return {
    id: entry.id || `${field}-${index}`,
    title: { ml: entry.title_ml || 'സ്രോതസ്സിലെ പരാമർശം', en: entry.title_en || 'Source account' },
    translation: { ml: entry.malayalam_text || entry.malayalam_translation || entry.malayalam || '', en: entry.english_text || entry.english_translation || entry.english || '' },
    arabic_original: arabic || matchedVerse?.arabic || '',
    verse_meaning: matchedVerse,
    multiple_verses: multipleVerses,
    translation_note: matchedVerse || multipleVerses.length ? quranMeanings.translation_note : null,
    review_status: entry.review_status,
    source_kind: entry.source_kind,
    related_visual_id: entry.related_visual_id,
    source_notice: entry.source_notice || (matchedVerse || multipleVerses.length ? quranMeanings.source_notice : null),
    count: entry.repetitions ?? entry.count,
    timing: typeof entry.timing === 'string' ? { ml: entry.timing, en: entry.timing } : entry.timing,
    conditions: typeof entry.conditions === 'string' ? { ml: entry.conditions, en: entry.conditions } : entry.conditions,
    construction: entry.construction_method,
    steps: entry.steps,
    source_passage: null,
    passage_translation: null,
    source_scope: null,
    purpose: entry.purpose,
    references: [{ book: entry.source_book || entry.source_reference || entry.book || '', author: entry.author || '', page: entry.source_page || entry.page || '', url: publicUrl(entry) }],
    field,
  };
}

export function sectionBReading(card, nameId) {
  if (!card || card.pdf_name_id !== nameId) return { evidence: [], scholarly: [], topics: [], pending: 0 };
  const result = { evidence: [], scholarly: [], topics: [], pending: 0 };
  const seen = new Map();
  for (const field of SECTION_B_FIELDS) {
    for (const [index, original] of (Array.isArray(card[field]) ? card[field] : []).entries()) {
      if (!isSourceChecked(original)) { result.pending++; continue; }
      const entry = normalize(original, field, index);
      const structured = structuredMethods[nameId]?.[entry.id];
      if (structured && structured.source_book === entry.references[0].book && structured.source_page === entry.references[0].page) {
        for (const key of ['steps', 'count', 'timing', 'conditions']) entry[key] = structured[key];
      }
      const brief = shamsBrief.accounts[entry.id];
      if (brief && entry.references[0].book === shamsBrief.source_title && String(entry.references[0].page) === brief.source_page) {
        entry.source_passage = brief.arabic_original;
        entry.passage_translation = brief.translation || null;
        entry.source_scope = shamsBrief.scope;
        entry.references[0].url = shamsBrief.source_url;
        for (const key of ['steps', 'count', 'timing', 'conditions', 'purpose']) entry[key] = brief[key];
        const figure = { 'الرحمن': 'b-shams-early-rahman', 'الرحيم': 'b-shams-early-rahim', 'السلام': 'b-shams-early-salam', 'النور': 'b-shams-early-nur-nafi', 'النافع': 'b-shams-early-nur-nafi' }[entry.id.split('-').slice(4).join('-')];
        if (!entry.related_visual_id && figure) entry.related_visual_id = figure;
      }
      const isQuran = /tanzil\.net|القرآن الكريم/.test(`${entry.references[0].url || ''} ${entry.references[0].book}`);
      const group = isQuran ? 'evidence' : field === 'scholarly_entries' ? 'scholarly' : 'topics';
      // Preserve different wordings, counts, timings and figures as separate accounts.
      const fingerprint = JSON.stringify([group, entry.arabic_original, entry.source_passage, entry.translation, entry.count, entry.timing, entry.conditions, entry.construction, entry.related_visual_id]);
      const duplicate = seen.get(fingerprint);
      if (duplicate) {
        for (const reference of entry.references) if (!duplicate.references.some(ref => JSON.stringify(ref) === JSON.stringify(reference))) duplicate.references.push(reference);
      } else { seen.set(fingerprint, entry); result[group].push(entry); }
    }
  }
  const methods = result.topics.filter(entry => entry.field !== 'dua' && entry.related_visual_id);
  result.topics = result.topics.filter(entry => {
    const method = entry.field === 'dua' && entry.related_visual_id && methods.find(item => item.related_visual_id === entry.related_visual_id);
    if (!method) return true;
    (method.supplications ||= []).push(entry);
    return false;
  });
  return result;
}

export function unlinkedSectionBVisuals(card) {
  const reading = sectionBReading(card, card?.pdf_name_id);
  const linked = new Set(reading.topics.map(entry => entry.related_visual_id).filter(Boolean));
  return (Array.isArray(card?.attached_visuals) ? card.attached_visuals : []).filter(visual => !linked.has(visual.id));
}
