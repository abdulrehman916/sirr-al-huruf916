import source from '@/data/birhatiahArabicSinglePage.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

export default function BirhatiahArabicSinglePage({ nameId }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const entries = source.accounts.filter(entry => nameId ? entry.name_ids?.includes(nameId) : !entry.name_ids?.length);
  if (!entries.length) return null;
  return <section className="rounded-xl border border-yellow-500/25 p-4 space-y-4" data-reader-section="inline-arabic-edition">
    <h3 className="text-yellow-200 font-semibold">{ml ? 'വേറിട്ട അറബി പേജിലെ പരിശോധിച്ച വിവരങ്ങൾ' : 'Checked accounts from a separate Arabic page'} ({entries.length})</h3>
    <p className="text-sm leading-loose text-white/70">{source.scope[language]}</p>
    {entries.map(entry => <article key={entry.id} className="border-t border-white/15 pt-3 space-y-3">
      <h3 className="text-yellow-100">{entry.title[language]}</h3>
      <p className="font-amiri text-xl text-right leading-loose text-white/90" lang="ar" dir="rtl">{entry.arabic_original}</p>
      <p className="text-sm leading-loose text-white/85">{entry.translation[language]}</p>
      <p className="text-xs text-white/55">{source.source_title} · {ml ? 'PDF പേജ്' : 'PDF page'} {entry.pdf_page}</p>
    </article>)}
    <figure className="space-y-3 border-t border-white/15 pt-3" data-reader-section="inline-source-image">
      <figcaption className="text-sm text-white/70">{ml ? 'പരിശോധിച്ച അറബി മൂലപേജ്' : 'Checked original Arabic page'}</figcaption>
      <img src={source.image_path} loading="lazy" alt={source.source_title} className="block w-full max-w-2xl mx-auto bg-white rounded-lg" />
    </figure>
    <footer className="border-t border-white/10 pt-2 text-xs text-white/60">{ml ? 'അധിക റഫറൻസ്' : 'Optional reference'}: <a href={source.source_url} target="_blank" rel="noopener noreferrer" className="underline">{source.source_title}</a></footer>
  </section>;
}
