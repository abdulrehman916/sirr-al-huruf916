import notes from '@/data/birhatiahOmanBook2026.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

const countLabels = {
  collective_recitation: { ml: 'സംയുക്ത ദഅ്‌വത്ത് വായന', en: 'Collective invocation readings' },
  qalnahud_recitation: { ml: 'കൽനഹൂദ് നാമത്തിന്റെ വായന', en: 'Qalnahud name readings' },
  khutir_name_recitation: { ml: 'ഖൂതീർ നാമത്തിന്റെ വായന', en: 'Khutir name readings' },
  quran_ten_verses_reading: { ml: 'സൂറത്തുസ്സ്വാഫ്ഫാത്തിലെ പത്ത് ആയത്തുകളുടെ വായന', en: 'Ten verses from Sūrat al-Ṣāffāt' },
  session_repetition: { ml: 'ഒരു ഇരിപ്പിലെ ആവർത്തനം', en: 'In-session repetitions' },
  fatiha_reading: { ml: 'സൂറത്തുൽ ഫാതിഹയുടെ വായന', en: 'Readings of al-Fatiha' },
  separate_names_reading: { ml: 'വേറിട്ട നാമകൂട്ടത്തിന്റെ വായന', en: 'Readings of a separate name formula' },
  collective_recitation_option: { ml: 'ബദലായ സംയുക്ത പാരായണസംഖ്യ', en: 'Alternative collective recitation count' },
};

export default function BirhatiahOmanBookNotes() {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const sourceOrder = [...notes.notes].sort((a, b) => a.printed_page - b.printed_page);
  return <section className="rounded-xl border border-yellow-500/25 p-4" data-testid="birhatiah-oman-book-notes">
    <h3 className="text-yellow-200 font-semibold">
      {ml ? `ഒമാൻ ഗ്രന്ഥത്തിലെ പരിശോധിച്ച ${sourceOrder.length} ചരിത്രപരാമർശങ്ങൾ` : `${sourceOrder.length} historical Oman-book excerpts checked against source page images`}
    </h3>
    <p className="text-xs text-white/60 leading-relaxed pt-2">{ml ? 'ഓരോ പരാമർശവും അതിന്റെ അച്ചടിച്ച പേജ് ക്രമത്തിലാണ്. ഇവ മുഴുവൻ പുസ്തകത്തിന്റെയും അക്ഷരപരിശോധന പൂർത്തിയായെന്നർത്ഥമല്ല.' : 'Passages are ordered by printed page. Source excerpts have been checked; the entire book has not been fully transcribed.'}</p>
    <div className="space-y-4 pt-4">
      {sourceOrder.map(note => <article key={note.id} className="rounded-lg border border-white/15 p-3 space-y-3" data-source-note={note.id}>
        <h3 className={`font-semibold text-yellow-100 ${ml ? 'font-malayalam' : 'font-inter'}`}>{note.title[language]}</h3>
        <p className="font-amiri text-xl text-right text-white/90 leading-loose" dir="rtl" lang="ar">{note.arabic_excerpt}</p>
        {note.additional_excerpts?.map((line, index) => <p key={index} className="font-amiri text-lg text-right text-white/75 leading-loose" dir="rtl" lang="ar">{line}</p>)}
        <p className={`text-sm text-white/85 leading-loose ${ml ? 'font-malayalam' : 'font-inter'}`}>{note.meaning[language]}</p>
        {note.counts.some(count => count.kind === "collective_recitation_option") && <p className="font-semibold text-yellow-100 text-sm" data-source-count-relation="either-or">
          {ml ? "ബദലുകൾ: 3 അല്ലെങ്കിൽ 7 — 10 അല്ല" : "Alternatives: 3 OR 7 — NOT 10"}
        </p>}
        <div className="flex flex-wrap gap-2">
          {note.counts.map((count, index) => <span key={index} className="rounded-lg border border-yellow-500/25 px-2 py-1 text-xs text-yellow-100">
            {countLabels[count.kind]?.[language] || count.kind}: {count.value}
          </span>)}
        </div>
        {note.figure_present_in_source && <p className="text-xs text-white/60" data-source-figure-status={note.figure_reproduced_in_site ? 'present' : 'pending'}>
          {ml
            ? 'ഈ മൂലപേജിൽ ചിത്രം/കളം ഉണ്ട്. അതിന്റെ യഥാർത്ഥ ചിത്രം ഈ കാർഡിൽ ഇനിയും ചേർത്തിട്ടില്ല; രൂപവും സംഖ്യകളും ഊഹിച്ച് വരയ്ക്കുന്നില്ല.'
            : 'This printed page contains a diagram or figure. The authentic image has not yet been added to this card, and no substitute or numeric transcription has been invented.'}
        </p>}
        {note.review_note && <p className={`text-xs text-white/60 leading-relaxed ${ml ? 'font-malayalam' : 'font-inter'}`}>{note.review_note[language]}</p>}
        <p className="text-xs text-white/55">{notes.source_title_ar} · {notes.edition} · {ml ? "അച്ചടിച്ച പേജ്" : "printed page"} {note.printed_page}{note.continuation_printed_page ? `–${note.continuation_printed_page}` : ""} · PDF {note.pdf_page}{note.continuation_pdf_page ? `–${note.continuation_pdf_page}` : ""}</p>
      </article>)}
      {notes.indexed_pending_visual_review?.length > 0 && <section className="rounded-lg border border-white/15 p-3 space-y-3" data-source-index-status="needs-image-review">
        <h3 className="text-yellow-100 text-sm">{ml ? 'കണ്ടെത്തിയ മറ്റ് പേജുകൾ — മൂലചിത്ര പരിശോധന ബാക്കി' : 'Additional indexed pages — original image review pending'} ({notes.indexed_pending_visual_review.length})</h3>
        <ul className="space-y-3 pt-3">{notes.indexed_pending_visual_review.map(item => <li key={item.pdf_page} className="border-t border-white/10 pt-2 space-y-1">
          <p className="text-xs text-yellow-100">{ml ? 'അച്ചടിച്ച പേജ്' : 'Printed page'} {item.printed_page} · PDF {item.pdf_page}</p>
          <p className="text-sm text-white/80 leading-relaxed">{item.summary[language]}</p>
          <p className="text-xs text-white/50">{ml ? 'ഇത് തിരച്ചിലിൽ കണ്ടെത്തിയ സൂചിക മാത്രം; അക്ഷരങ്ങളും ചിത്രങ്ങളും ഇനിയും സ്ഥിരീകരിച്ചിട്ടില്ല.' : 'Text-search index only: wording and figures not yet visually verified.'}</p>
        </li>)}</ul>
      </section>}
      <p className={`text-xs text-white/55 leading-relaxed ${ml ? 'font-malayalam' : 'font-inter'}`}>{ml
        ? 'ഇവ വ്യത്യസ്ത ഭാഗങ്ങളിലെ രേഖകളാണ്; ഒന്നിലെ എണ്ണം മറ്റൊന്നിലേക്ക് മാറ്റിയിട്ടില്ല. ഗ്രന്ഥത്തിലെ ആചാരാവകാശവാദങ്ങൾ ചരിത്രപരമായി രേഖപ്പെടുത്തുന്നതാണ്; സ്വതന്ത്രമായി ഫലം ഉറപ്പിച്ചിട്ടില്ല.'
        : 'These are separate book passages, not one combined method. The recorded ritual claims are historical attributions, not independently verified effects.'}</p>
    </div>
  </section>;
}
