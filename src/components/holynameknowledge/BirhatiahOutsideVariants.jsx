import variants from '@/data/birhatiahOutsideVariants.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

export default function BirhatiahOutsideVariants({ nameId }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const entry = variants.entries.find(row => row.name_id === nameId);
  if (!entry) return null;
  return <section className="border-t border-yellow-500/20 pt-4 space-y-3">
    <h3 className="text-yellow-200">{ml ? 'പുറംചർച്ചയിലെ വ്യത്യസ്ത അർഥം' : 'Alternative meaning in an outside discussion'}</h3>
    <p className="font-amiri text-2xl text-right text-white/90" dir="rtl" lang="ar">{entry.arabic_original}</p>
    <p className="text-sm leading-loose text-white/85">{entry.translation[language]}</p>
    <p className="text-sm leading-loose text-white/65">{variants.context[language]}</p>
    <a href={variants.source_url} target="_blank" rel="noreferrer" className="text-xs underline text-white/65">{variants.source_title}</a>
  </section>;
}
