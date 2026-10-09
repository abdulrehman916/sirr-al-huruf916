import source from '@/data/birhatiahArabicInvocationSources.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

export default function BirhatiahArabicInvocationSources() {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  return <section className="rounded-xl border border-yellow-500/25 p-4 space-y-4">
    <h3 className="text-yellow-200 font-semibold">{ml ? 'കൂടുതൽ അറബി സംയുക്തപതിപ്പുകളും പൂർണ മൂലപേജുകളും' : 'Additional Arabic collective variants and complete source pages'}</h3>
    <p className="text-sm text-white/70 leading-loose">{source.scope[language]}</p>
    <section className="rounded-lg border border-white/15 p-3 space-y-4">
      <h3 className="text-yellow-100">{ml ? 'പൂർണ അറബി വായനാപകർപ്പും വിഷയമനുസരിച്ചുള്ള അർഥവും' : 'Full Arabic reading transcription and meaning by subject'}</h3>
      <p className="text-sm leading-loose text-white/65">{source.transcription_scope[language]}</p>
      {source.transcription.map(entry => <article key={entry.id} className="border-t border-white/10 pt-3 space-y-3">
        <h3 className="text-yellow-100">{entry.title[language]}</h3>
        <p className="font-amiri text-xl text-right leading-loose whitespace-pre-wrap text-white/90" lang="ar" dir="rtl">{entry.arabic}</p>
        <p className="text-sm leading-loose text-white/85">{entry.translation[language]}</p>
        <p className="text-xs text-white/60">{ml ? 'താഴെ കാർഡിനുള്ളിൽ അച്ചടിച്ച മൂലപേജ്' : 'Printed original page displayed below in this card'}: {entry.pdf_page}</p>
      </article>)}
    </section>
    {source.accounts.map(entry => <article key={entry.id} className="border-t border-white/15 pt-3 space-y-3">
      <h3 className="text-yellow-100">{entry.title[language]}</h3>
      {entry.arabic_original && <p className="font-amiri text-xl text-right leading-loose text-white/90" dir="rtl" lang="ar">{entry.arabic_original}</p>}
      <p className="text-sm leading-loose text-white/85">{entry.translation[language]}</p>
      <p className="text-xs text-white/60">{entry.source_title || source.source_title} · {ml ? 'PDF പേജുകൾ' : 'PDF pages'} {entry.pdf_pages}</p>
      {entry.image_path && <figure className="space-y-2" data-source-image="inline-edition">
        <img src={entry.image_path} loading="lazy" alt={`${entry.source_title} · ${entry.pdf_pages}`} className="block w-full max-w-2xl mx-auto bg-white rounded-lg" />
        <figcaption className="text-xs text-white/60">{ml ? 'ഗ്രന്ഥത്തിന്റെ യഥാർത്ഥ പേജ് — കാർഡിനുള്ളിൽ' : 'Original source page — displayed within the card'}</figcaption>
      </figure>}
    </article>)}
    <p className="text-xs text-white/60">{ml ? 'പാഠത്തിൽ പരാമർശിച്ച ഖുർആൻ ആയത്ത് നമ്പറുകൾ' : 'Quran verse references cited in the text'}</p>
    <div className="flex flex-wrap gap-2">{source.quran_refs.map(ref => <span key={ref.reference} className="rounded-lg border border-white/20 px-3 py-1 text-sm text-yellow-100">{ref.reference}</span>)}</div>
    <section className="space-y-3">
      <h3 className="text-white/70">{ml ? 'മൂന്നു പേജുകളിലെ മുഴുവൻ അച്ചടിച്ച പാഠം' : 'Complete printed text on all three pages'}</h3>
      {source.pages.map(page => <figure key={page.pdf_page} className="space-y-2">
        <img src={page.image_path} loading="lazy" alt={`${source.source_title} · ${page.pdf_page}`} className="block w-full max-w-2xl mx-auto bg-white rounded-lg" />
        <figcaption className="text-xs text-white/55">{source.source_title} · {ml ? 'PDF പേജ്' : 'PDF page'} {page.pdf_page}</figcaption>
      </figure>)}
    </section>
    <footer className="border-t border-white/15 pt-3 space-y-2 text-xs text-white/60" data-reader-section="optional-source-links">
      <p>{ml ? 'അധിക റഫറൻസുകൾ മാത്രം — വായിക്കാൻ ലിങ്ക് തുറക്കേണ്ടതില്ല' : 'Optional references only — no link required to read the material'}</p>
      <a href={source.source_url} target="_blank" rel="noopener noreferrer" className="block underline break-all">{source.source_title}</a>
      {source.accounts.filter(entry => entry.source_url && entry.source_url !== source.source_url).map(entry => <a key={entry.id} href={entry.source_url} target="_blank" rel="noopener noreferrer" className="block underline break-all">{entry.source_title || entry.title[language]}</a>)}
      {source.quran_refs.map(ref => <a key={ref.reference} href={ref.url} target="_blank" rel="noopener noreferrer" className="inline-block mr-3 underline">{ref.reference}</a>)}
    </footer>
  </section>;
}
