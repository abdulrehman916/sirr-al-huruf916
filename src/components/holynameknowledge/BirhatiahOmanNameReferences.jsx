import notes from '@/data/birhatiahOmanBook2026.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

// Source references are linked only to the names explicitly printed on a
// page. A four-name grouping is not four independent recitation methods.
export default function BirhatiahOmanNameReferences({ nameId }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const matches = notes.notes.filter(note =>
    (note.related_name_ids || []).includes(nameId)
    || (note.counts || []).some(count => count.name_id === nameId)
  );
  if (!matches.length) return null;
  return <section className="rounded-xl border border-yellow-500/25 p-3 space-y-3" data-testid="birhatiah-oman-name-references">
    <h3 className="text-yellow-200 font-semibold">
      {ml ? 'ഒമാൻ ഗ്രന്ഥത്തിൽ ഈ നാമത്തെക്കുറിച്ചുള്ള സ്ഥിരീകരിച്ച പരാമർശങ്ങൾ' : 'Visually checked references to this name in the Oman volume'}
    </h3>
    <div className="space-y-4 pt-2">
      {matches.map(note => {
        const count = (note.counts || []).find(item => item.name_id === nameId);
        const isCollective = note.source_scope?.startsWith('collective_');
        const isGroup = (note.related_name_ids || []).length > 1;
        const arabic = note.id === 'oman-p87-88' && nameId === 'HNK-MHC-010'
          ? note.additional_excerpts?.find(line => line.includes('خوطير')) : note.arabic_excerpt;
        return <article key={note.id} data-source-note={note.id} className="rounded-lg border border-white/15 p-3 space-y-3">
          <h4 className="font-semibold text-yellow-100 text-sm">{note.title[language]}</h4>
          <p className="font-amiri text-xl sm:text-2xl text-right text-yellow-100 leading-loose whitespace-pre-wrap" dir="rtl" lang="ar">{arabic}</p>
          <p className="text-sm text-white/85 leading-relaxed">{note.meaning[language]}</p>
          {count && <p className="text-sm text-white/80">
            {ml ? 'ഈ മൂലവാക്യത്തിലെ ബന്ധപ്പെട്ട എണ്ണം' : 'Relevant count in this source context'}: {count.value}
          </p>}
          {(isCollective || isGroup) && <p className="text-xs text-white/65">
            {ml
              ? 'ഇത് സംയുക്ത ഗ്രന്ഥപരാമർശമാണ്; ഈ ഇസ്മിനു മാത്രം പ്രത്യേകമായ ആചാരനിയമമോ ഉറപ്പുള്ള ഫലമോ അല്ല.'
              : 'A collective historical context, not a standalone prescription or verified effect for this name.'}
          </p>}
          {note.review_note && <p className="text-xs text-white/60 leading-relaxed">{note.review_note[language]}</p>}
          <p className="text-xs text-white/55">
            {notes.source_title_ar} · {notes.edition} · {ml ? 'അച്ചടിച്ച പേജ്' : 'printed page'} {note.printed_page}
            {' · '}PDF {note.pdf_page}
          </p>
        </article>;
      })}
    </div>
  </section>;
}
