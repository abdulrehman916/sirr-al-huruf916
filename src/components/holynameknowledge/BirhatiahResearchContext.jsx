import research from '@/data/birhatiahResearchContext.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

export default function BirhatiahResearchContext({ nameId }) {
  const { language } = useHolyNamesLanguage();
  const entries = research.entries.filter(entry => !entry.name_ids.length || entry.name_ids.includes(nameId));
  return <details className="rounded-xl border border-yellow-500/25 p-4 space-y-3">
    <summary className="cursor-pointer text-yellow-200 font-semibold">{language === 'ml' ? 'പുറത്തെ ഗവേഷകരുടെ വ്യാഖ്യാനങ്ങളും പതിപ്പുവ്യത്യാസങ്ങളും' : 'Outside author interpretations and recension differences'}</summary>
    <p className="text-sm text-white/65 leading-loose">{research.scope[language]}</p>
    {entries.map(entry => <article key={entry.id} className="border-t border-white/10 pt-3 space-y-2">
      {entry.arabic_original && <p className="font-amiri text-xl text-right leading-loose text-white/85" dir="rtl" lang="ar">{entry.arabic_original}</p>}
      <p className="text-sm text-white/85 leading-loose">{entry.translation[language]}</p>
      <a href={entry.source_url} target="_blank" rel="noreferrer" className="text-xs underline text-white/55">{entry.source_title}</a>
    </article>)}
  </details>;
}
