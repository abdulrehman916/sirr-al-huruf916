import source from '@/data/birhatiahArabicSinglePage.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

export default function BirhatiahArabicSinglePage({ nameId }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const entries = source.accounts.filter(entry => nameId ? entry.name_ids?.includes(nameId) : !entry.name_ids?.length);
  if (!entries.length) return null;
  return <details className="rounded-xl border border-yellow-500/25 p-4 space-y-4">
    <summary className="cursor-pointer text-yellow-200 font-semibold">{ml ? 'വേറിട്ട അറബി പേജിലെ പരിശോധിച്ച വിവരങ്ങൾ' : 'Checked accounts from a separate Arabic page'} ({entries.length})</summary>
    <p className="text-sm leading-loose text-white/70">{source.scope[language]}</p>
    {entries.map(entry => <article key={entry.id} className="border-t border-white/15 pt-3 space-y-3">
      <h3 className="text-yellow-100">{entry.title[language]}</h3>
      <p className="font-amiri text-xl text-right leading-loose text-white/90" lang="ar" dir="rtl">{entry.arabic_original}</p>
      <p className="text-sm leading-loose text-white/85">{entry.translation[language]}</p>
      <p className="text-xs text-white/55">{source.source_title} · {ml ? 'PDF പേജ്' : 'PDF page'} {entry.pdf_page}</p>
    </article>)}
    <details className="space-y-3">
      <summary className="cursor-pointer text-sm text-white/70">{ml ? 'പരിശോധിച്ച മൂലപേജ് തുറക്കുക' : 'Open the checked original page'}</summary>
      <a href={source.image_path} target="_blank" rel="noreferrer"><img src={source.image_path} loading="lazy" alt={source.source_title} className="w-full max-w-2xl mx-auto bg-white rounded-lg" /></a>
      <a href={source.source_url} target="_blank" rel="noreferrer" className="text-xs text-white/65 underline">{source.source_title}</a>
    </details>
  </details>;
}
