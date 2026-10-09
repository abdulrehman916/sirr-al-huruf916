import notes from '@/data/birhatiahOmanBook2026.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

// Displays only name-specific source mentions. A count embedded in a collective
// invocation must not be promoted to an independent single-name ritual.
export default function BirhatiahOmanNameReferences({ nameId }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const matches = notes.notes.flatMap(note => (note.counts || [])
    .filter(row => row.name_id === nameId)
    .map(row => ({ note, row })));
  if (!matches.length) return null;
  return <details className="rounded-xl border border-yellow-500/25 p-3 space-y-3" data-testid="birhatiah-oman-name-references">
    <summary className="cursor-pointer text-yellow-200 font-semibold">
      {ml ? 'ഒമാൻ ഗ്രന്ഥത്തിൽ ഈ നാമത്തെക്കുറിച്ചുള്ള പരാമർശം' : 'This name in the Oman source volume'}
    </summary>
    <div className="space-y-4 pt-3">
      {matches.map(({ note, row }) => {
        const isCollective = note.source_scope?.startsWith('collective_');
        const arabic = nameId === 'HNK-MHC-010'
          ? note.additional_excerpts?.find(line => line.includes('خوطير'))
          : note.arabic_excerpt;
        return <article key={note.id + ':' + row.kind} data-source-note={note.id}
          className="rounded-lg border border-white/15 p-3 space-y-2">
          <p className="font-amiri text-xl text-right text-yellow-100 leading-loose" dir="rtl" lang="ar">{arabic}</p>
          <p className="text-white/85 text-sm leading-relaxed">
            {nameId === 'HNK-MHC-010'
              ? (ml
                  ? 'ഇത് മുഴുവൻ ബൃഹത്തീയ്യ ദഅ്‌വത്തിന്റെ ഭാഗമായുള്ള ഖൂതീർ നാമത്തിന്റെ 11 തവണ എന്ന സൂചനയാണ്; ഖൂതീർ മാത്രം സ്വതന്ത്രമായി 11 തവണ ചൊല്ലണമെന്ന നിയമമല്ല.'
                  : 'The elevenfold Khutir reference is embedded in a collective Birhatiah account. It is not an independent elevenfold instruction for that name.')
              : (ml
                  ? 'കൽനഹൂദ് എന്ന നാമത്തിന് ഈ പ്രത്യേക ചരിത്രരേഖയിൽ 195 തവണ എന്ന് അച്ചടിച്ചിട്ടുണ്ട്. ആരോഗ്യബന്ധമായ പഴയ അവകാശവാദം സ്ഥിരീകരിച്ച ചികിത്സയല്ല.'
                  : 'This specific historical passage prints 195 readings for Qalnahud. Its health-related claim is not a medically validated treatment.')}
          </p>
          {isCollective && <p className="text-xs text-white/60">{ml ? 'സംയുക്ത ദഅ്‌വത്തിലെ ഭാഗം; വ്യക്തിഗത നിയമമല്ല.' : 'Part of a collective invocation, not a standalone rule.'}</p>}
          <p className="text-white/55 text-xs">
            {notes.source_title_ar} · {notes.edition} · {ml ? 'അച്ചടിച്ച പേജ്' : 'printed page'} {note.printed_page}
            {' · '}{ml ? 'PDF പേജ്' : 'PDF page'} {note.pdf_page}
          </p>
        </article>;
      })}
    </div>
  </details>;
}
