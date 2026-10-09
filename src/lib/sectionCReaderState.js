const meaningFields = {
  ml: ['malayalam_meaning', 'meaning_ml', 'exact_meaning_ml', 'exact_meaning'],
  en: ['english_meaning', 'meaning_en', 'exact_meaning_en', 'exact_meaning'],
};

export function sectionCMeaning(card, language) {
  return meaningFields[language].map(key => String(card?.[key] || '').trim())
    .find(text => language === 'ml'
      ? /[\u0D00-\u0D7F]/.test(text) && !/[çğıöşüÇĞİÖŞÜ]/.test(text)
      : /[A-Za-z]/.test(text) && !/[\u0D00-\u0D7F\u0600-\u06FFçğıöşüÇĞİÖŞÜ]/.test(text)) || '';
}

// Ignore Arabic reading vowels for search only; preserve the source spelling.
export const normalizeSectionCSearch = value => String(value || '').normalize('NFC')
  .replace(/[\u064B-\u065F\u0670\u0640]/g, '').trim().toLowerCase();

export function matchesSectionCSearch(card, query) {
  const needle = normalizeSectionCSearch(query);
  if (!needle) return true;
  return ['arabic_name', 'canonical_arabic_name', 'arabic_normalized', 'name_id',
    'transliteration', 'english_transliteration', 'malayalam_transliteration',
    ...meaningFields.ml, ...meaningFields.en]
    .some(key => normalizeSectionCSearch(card?.[key]).includes(needle));
}
