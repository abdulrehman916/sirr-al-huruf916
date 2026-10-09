// Apply narrow, visually reviewed source corrections to older imported chapters.
// Preserve all unrelated live entries and all stored calculation/name fields.
export function collateBirhatiahChapter(chapter, collation) {
  if (!chapter) return chapter;
  const corrections = collation.practice_provenance_corrections.filter(entry => entry.name_id === chapter.name_id);
  const notes = collation.notes.filter(entry => entry.related_name_ids.includes(chapter.name_id));
  if (!corrections.length && !notes.length) return chapter;
  return {
    ...chapter,
    practices: (chapter.practices || []).map(practice => {
      const correction = corrections.find(entry => entry.practice_id === practice.id);
      if (!correction) return practice;
      // An earlier paraphrase is not evidence of verbatim source wording.
      const { arabic_original: _original, arabic_reading: _reading, ...rest } = practice;
      return {...rest, source_title: correction.source_title, printed_page: correction.printed_page,
        count_kind: correction.count_kind, scope_note: correction.scope_note};
    }),
    source_notes: [
      ...(chapter.source_notes || []).filter(entry => !notes.some(note => note.id === entry.id)),
      ...notes,
    ],
  };
}
