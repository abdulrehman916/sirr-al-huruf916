import source from '@/data/birhatiahFullSourceChapter.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

// Original page scans already bundled with the independent website.
// All pages relevant to this name render within the card, without opening a new site.
export default function BirhatiahFullSourceChapter({ nameId }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const related = nameId ? (source.name_pages[nameId] || []) : source.pages.map(page => page.printed_page);
  const pages = related.map(number => source.pages.find(page => page.printed_page === number)).filter(Boolean);
  if (!pages.length) return null;
  return <section className="rounded-xl border border-yellow-500/25 p-4 space-y-4" data-testid="birhatiah-inline-book-pages">
    <h3 className="text-yellow-200 font-semibold">
      {ml ? 'മൻബഅ് ഉസൂൽ അൽ-ഹിക്മ — ഈ കാർഡിലെ യഥാർത്ഥ അറബി പേജുകൾ' : 'Manba Usul al-Hikma — original Arabic pages inside this card'} ({pages.length})
    </h3>
    <p className="text-sm leading-loose text-white/70">{source.scope[language]}</p>
    {pages.map(page => <figure key={page.printed_page} className="space-y-3 border-t border-white/10 pt-3" data-source-page={page.printed_page}>
      <figcaption className="space-y-1">
        <h4 className="text-yellow-100 font-medium">{page.title[language]}</h4>
        <p className="text-sm text-white/80 leading-loose">{page.description[language]}</p>
        <p className="text-xs text-white/55">{source.source_title} · {ml ? 'അച്ചടിച്ച പേജ്' : 'Printed page'} {page.printed_page}</p>
      </figcaption>
      <img src={page.image_path} loading="lazy" alt={`${source.source_title} — original page ${page.printed_page}`} className="block w-full max-w-2xl mx-auto bg-white rounded-lg" />
    </figure>)}
    <footer className="border-t border-white/10 pt-3 text-xs text-white/55 space-y-1">
      <p>{ml ? 'മുകളിൽ മൂലപേജുകൾ മുഴുവനായി കാണാം; പുറംസ്രോതസ്സ് അധിക റഫറൻസ് മാത്രം.' : 'The relevant source pages are displayed above; the external link is only an optional reference.'}</p>
      <a href={source.source_url} target="_blank" rel="noopener noreferrer" className="underline">{ml ? 'ഗ്രന്ഥത്തിന്റെ അധിക റഫറൻസ്' : 'Optional book source'}</a>
    </footer>
  </section>;
}
