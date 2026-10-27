import translations from '@/data/holyNamesLegacyTranslations.json';

// Display-only additions. Match the card, field, verbatim text and citation;
// never overwrite stored text, citations, numbers or verification status.
export function withLegacyTranslations(entry, cardId, field) {
  const match = translations.find(row => row.card_id === cardId && row.field === field
    && row.source_text === entry?.text && row.source_reference === (entry.source_reference || entry.source_book || ''));
  if (!match) return entry;
  const hasMalayalam = ['malayalam_text', 'malayalam_translation', 'malayalam', 'exact_meaning']
    .some(key => typeof entry[key] === 'string' && entry[key].trim() && !/^(null|undefined)$/i.test(entry[key].trim()));
  return { ...entry, ...(!hasMalayalam ? { malayalam: match.malayalam } : {}),
    editorial_arabic_translation: /[\u0600-\u06ff]/.test(entry.arabic_text || entry.arabic_original || '') ? null : match.arabic_translation };
}
