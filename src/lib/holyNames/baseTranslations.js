import translations from '@/data/holyNamesBaseEnglishTranslations.json';

const byCard = new Map();
for (const entry of translations) {
  const rows = byCard.get(entry.card_id) || [];
  rows.push(entry);
  byCard.set(entry.card_id, rows);
}

// These are failed-import status messages, not religious or scholarly content.
const failedImportMessages = new Set([
  'ക്ഷമിക്കണം, താങ്കൾ നൽകിയ പിഡിഎഫ് ഫയൽ ലഭ്യമായില്ല. അതിനാൽ വിവരങ്ങൾ വേർതിരിച്ചെടുക്കാൻ കഴിഞ്ഞില്ല.',
  'ഫയൽ ലഭ്യമല്ലാത്തതിനാൽ വിവരങ്ങൾ ഇല്ല.',
]);

export function withSectionBBaseTranslations(card) {
  if (!card?.pdf_name_id) return card;
  const result = { ...card };
  const archived = [];
  for (const entry of byCard.get(card.pdf_name_id) || []) {
    if (card[entry.source_field] !== entry.source_text) continue;
    const existing = card[entry.target_field] || (entry.alternate_field && card[entry.alternate_field]);
    if (!existing?.trim()) result[entry.target_field] = entry.english;
    if (failedImportMessages.has(entry.source_text)) {
      archived.push({ field: entry.source_field, text: entry.source_text, english: result[entry.target_field] });
      result[entry.source_field] = '';
      result[entry.target_field] = '';
    }
  }
  if (archived.length) result.archived_import_errors = archived;
  return result;
}
