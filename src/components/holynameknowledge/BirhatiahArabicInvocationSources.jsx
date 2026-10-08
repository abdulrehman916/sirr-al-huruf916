import source from '@/data/birhatiahArabicInvocationSources.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

export default function BirhatiahArabicInvocationSources() {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  return <details className="rounded-xl border border-yellow-500/25 p-4 space-y-4">
    <summary className="cursor-pointer text-yellow-200 font-semibold">{ml ? 'കൂടുതൽ അറബി സംയുക്തപതിപ്പുകളും പൂർണ മൂലപേജുകളും' : 'Additional Arabic collective variants and complete source pages'}</summary>
    <p className="text-sm text-white/70 leading-loose">{source.scope[language]}</p>
    {source.accounts.map(entry => <article key={entry.id} className="border-t border-white/15 pt-3 space-y-3">
      <h3 className="text-yellow-100">{entry.title[language]}</h3>
      {entry.arabic_original && <p className="font-amiri text-xl text-right leading-loose text-white/90" dir="rtl" lang="ar">{entry.arabic_original}</p>}
      <p className="text-sm leading-loose text-white/85">{entry.translation[language]}</p>
      <a href={entry.source_url || source.source_url} target="_blank" rel="noreferrer" className="text-xs underline text-white/55">{entry.source_title || source.source_title} · {ml ? 'PDF പേജുകൾ' : 'PDF pages'} {entry.pdf_pages}</a>
      {entry.image_path && <a href={entry.image_path} target="_blank" rel="noreferrer"><img src={entry.image_path} loading="lazy" alt={`${entry.source_title} · ${entry.pdf_pages}`} className="max-w-full bg-white rounded-lg" /></a>}
    </article>)}
    <p className="text-xs text-white/60">{ml ? 'ഉദ്ധരിച്ച ഖുർആൻ ഭാഗങ്ങളുടെ സ്രോതസ്സുകൾ' : 'Sources for quoted Quran passages'}</p>
    <div className="flex flex-wrap gap-3">{source.quran_refs.map(ref => <a key={ref.reference} href={ref.url} target="_blank" rel="noreferrer" className="text-sm underline text-yellow-100">{ref.reference}</a>)}</div>
    <details className="space-y-3">
      <summary className="cursor-pointer text-white/70">{ml ? 'മൂന്നു പേജുകളിലെ മുഴുവൻ അച്ചടിച്ച പാഠം' : 'Complete printed text on all three pages'}</summary>
      {source.pages.map(page => <figure key={page.pdf_page} className="space-y-2">
        <a href={page.image_path} target="_blank" rel="noreferrer"><img src={page.image_path} loading="lazy" alt={`${source.source_title} · ${page.pdf_page}`} className="w-full max-w-2xl mx-auto bg-white rounded-lg" /></a>
        <figcaption className="text-xs text-white/55">{source.source_title} · {ml ? 'PDF പേജ്' : 'PDF page'} {page.pdf_page}</figcaption>
      </figure>)}
    </details>
  </details>;
}
