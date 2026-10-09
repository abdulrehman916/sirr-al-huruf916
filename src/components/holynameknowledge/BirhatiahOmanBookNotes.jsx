import notes from '@/data/birhatiahOmanBook2026.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

const countLabels = {
  collective_recitation: { ml: 'സംയുക്ത ദഅ്‌വത്ത് വായന', en: 'Collective invocation readings' },
  qalnahud_recitation: { ml: 'കൽനഹൂദ് നാമത്തിന്റെ വായന', en: 'Qalnahud name readings' },
  khutir_name_recitation: { ml: 'ഖൂതീർ നാമത്തിന്റെ വായന', en: 'Khutir name readings' },
  quran_ten_verses_reading: { ml: 'സൂറത്തുസ്സ്വാഫ്ഫാത്തിലെ പത്ത് ആയത്തുകളുടെ വായന', en: 'Ten verses from Sūrat al-Ṣāffāt' },
  session_repetition: { ml: 'ഒരു ഇരിപ്പിലെ ആവർത്തനം', en: 'In-session repetitions' },
};

export default function BirhatiahOmanBookNotes() {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  return <details className="rounded-xl border border-yellow-500/25 p-4" data-testid="birhatiah-oman-book-notes">
    <summary className="cursor-pointer text-yellow-200 font-semibold">
      {ml ? 'ഒമാൻ ഗ്രന്ഥത്തിലെ പരിശോധിച്ച നാല് ഭാഗങ്ങളും മറ്റ് പേജ് സൂചികയും' : 'Four checked Oman-book passages and further page index'}
    </summary>
    <div className="space-y-4 pt-4">
      {notes.notes.map(note => <article key={note.id} className="rounded-lg border border-white/15 p-3 space-y-3" data-source-note={note.id}>
        <h3 className={`font-semibold text-yellow-100 ${ml ? 'font-malayalam' : 'font-inter'}`}>{note.title[language]}</h3>
        <p className="font-amiri text-xl text-right text-white/90 leading-loose" dir="rtl" lang="ar">{note.arabic_excerpt}</p>
        {note.additional_excerpts?.map((line, index) => <p key={index} className="font-amiri text-lg text-right text-white/75 leading-loose" dir="rtl" lang="ar">{line}</p>)}
        <p className={`text-sm text-white/85 leading-loose ${ml ? 'font-malayalam' : 'font-inter'}`}>{note.meaning[language]}</p>
        <div className="flex flex-wrap gap-2">
          {note.counts.map((count, index) => <span key={index} className="rounded-lg border border-yellow-500/25 px-2 py-1 text-xs text-yellow-100">
            {countLabels[count.kind]?.[language] || count.kind}: {count.value}
          </span>)}
        </div>
        {note.review_note && <p className={`text-xs text-white/60 leading-relaxed ${ml ? 'font-malayalam' : 'font-inter'}`}>{note.review_note[language]}</p>}
        <p className="text-xs text-white/50">{notes.source_title_ar} · {ml ? 'അച്ചടിച്ച പേജ്' : 'printed p.'} {note.printed_page}{note.continuation_printed_page ? `–${note.continuation_printed_page}` : ''}</p>
      </article>)}
      {notes.indexed_pending_visual_review?.length > 0 && <details className="rounded-lg border border-white/15 p-3 space-y-3" data-source-index-status="needs-image-review">
        <summary className="cursor-pointer text-yellow-100 text-sm">{ml ? 'കണ്ടെത്തിയ മറ്റ് പേജുകൾ — മൂലചിത്ര പരിശോധന ബാക്കി' : 'Additional indexed pages — original image review pending'} ({notes.indexed_pending_visual_review.length})</summary>
        <ul className="space-y-3 pt-3">{notes.indexed_pending_visual_review.map(item => <li key={item.pdf_page} className="border-t border-white/10 pt-2 space-y-1">
          <p className="text-xs text-yellow-100">{ml ? 'അച്ചടിച്ച പേജ്' : 'Printed page'} {item.printed_page} · PDF {item.pdf_page}</p>
          <p className="text-sm text-white/80 leading-relaxed">{item.summary[language]}</p>
          <p className="text-xs text-white/50">{ml ? 'ഇത് തിരച്ചിലിൽ കണ്ടെത്തിയ സൂചിക മാത്രം; അക്ഷരങ്ങളും ചിത്രങ്ങളും ഇനിയും സ്ഥിരീകരിച്ചിട്ടില്ല.' : 'Text-search index only: wording and figures not yet visually verified.'}</p>
        </li>)}</ul>
      </details>}
      <p className={`text-xs text-white/55 leading-relaxed ${ml ? 'font-malayalam' : 'font-inter'}`}>{ml
        ? 'ഇവ വ്യത്യസ്ത ഭാഗങ്ങളിലെ രേഖകളാണ്; ഒന്നിലെ എണ്ണം മറ്റൊന്നിലേക്ക് മാറ്റിയിട്ടില്ല. ഗ്രന്ഥത്തിലെ ആചാരാവകാശവാദങ്ങൾ ചരിത്രപരമായി രേഖപ്പെടുത്തുന്നതാണ്; സ്വതന്ത്രമായി ഫലം ഉറപ്പിച്ചിട്ടില്ല.'
        : 'These are separate book passages, not one combined method. The recorded ritual claims are historical attributions, not independently verified effects.'}</p>
    </div>
  </details>;
}
