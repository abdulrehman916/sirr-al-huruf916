import expanded from '@/data/birhatiahExpandedVersions.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

export default function BirhatiahExpandedVersions() {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  return <details className="rounded-xl border border-yellow-500/25 p-4 space-y-4">
    <summary className="cursor-pointer text-yellow-200 font-semibold">{ml ? 'ആറ് സംയുക്തപതിപ്പുകളുടെ വിപുലമായ അർഥം' : 'Expanded meanings of six collective recensions'}</summary>
    <p className="text-sm text-white/70 leading-loose">{expanded.scope[language]}</p>
    {expanded.versions.map(version => <details key={version.id} className="rounded-lg border border-white/15 p-3 space-y-3">
      <summary className="cursor-pointer text-yellow-100">{version.title[language]}</summary>
      <p className="text-xs text-white/55">{ml ? 'നൽകിയ ഇംഗ്ലീഷ് പതിപ്പ് · അച്ചടിച്ച പേജുകൾ' : 'Supplied English edition · printed pages'} {version.english_pages}</p>
      {version.paragraphs.map((paragraph, index) => <p key={`${version.id}-${index}`} className="text-sm text-white/90 leading-loose">{paragraph[language]}</p>)}
      <details className="space-y-3">
        <summary className="cursor-pointer text-white/65 text-sm">{ml ? 'താരതമ്യത്തിനുള്ള അറബി പതിപ്പിന്റെ പാഠവും ഹറകത്തും' : 'Arabic-edition text and printed vowels for comparison'}</summary>
        {version.arabic_pages.map(number => <figure key={number} className="space-y-2">
          <a href={`/figures/birhatiah-manba-p${number}.png`} target="_blank" rel="noreferrer"><img src={`/figures/birhatiah-manba-p${number}.png`} loading="lazy" alt={`Manba · ${number}`} className="w-full max-w-2xl mx-auto bg-white rounded-lg" /></a>
          <figcaption className="text-xs text-white/55">منبع أصول الحكمة · {number}</figcaption>
        </figure>)}
      </details>
    </details>)}
  </details>;
}
