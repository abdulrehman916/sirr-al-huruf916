import expanded from '@/data/birhatiahExpandedVersions.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

export default function BirhatiahExpandedVersions() {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  return <section className="rounded-xl border border-yellow-500/25 p-4 space-y-4">
    <h3 className="text-yellow-200 font-semibold">{ml ? 'ആറ് സംയുക്തപതിപ്പുകളുടെ വിപുലമായ അർഥം' : 'Expanded meanings of six collective recensions'}</h3>
    <p className="text-sm text-white/70 leading-loose">{expanded.scope[language]}</p>
    {expanded.versions.map(version => <section key={version.id} className="rounded-lg border border-white/15 p-3 space-y-3">
      <h3 className="text-yellow-100">{version.title[language]}</h3>
      <p className="text-xs text-white/55">{ml ? 'നൽകിയ ഇംഗ്ലീഷ് പതിപ്പ് · അച്ചടിച്ച പേജുകൾ' : 'Supplied English edition · printed pages'} {version.english_pages}</p>
      {version.reading_translation?.[language] && <section className="space-y-3" data-reading-translation={version.id}>
        <h4 className="text-yellow-100">{ml ? 'ദുആയിലെ വാക്യക്രമത്തിലുള്ള മലയാള വിവർത്തനം' : 'Translation following the invocation sequence'}</h4>
        {version.reading_translation[language].map((paragraph,index) => <p key={`${version.id}-reading-${index}`} className="text-sm text-white/90 leading-loose">{paragraph}</p>)}
        <p className="text-xs text-white/65">{ml ? 'അപരിചിത നാമങ്ങളുടെ മുഴുവൻ അക്ഷരരൂപവും അച്ചടിയിലെ ഹറകത്തും താഴെയുള്ള മൂലപേജുകളിൽ കാണാം. അവയ്ക്ക് ഊഹിച്ച പദാർത്ഥങ്ങൾ ചേർത്തിട്ടില്ല.' : 'The original pages below retain the complete unfamiliar name strings and printed vowels; no lexical meanings are inferred.'}</p>
      </section>}
      <h4 className="text-yellow-100 text-sm">{ml ? 'പാഠഭേദവും ഗ്രന്ഥപരാമർശവും' : 'Edition context and source explanation'}</h4>
      {version.paragraphs.map((paragraph, index) => <p key={`${version.id}-${index}`} className="text-sm text-white/90 leading-loose">{paragraph[language]}</p>)}
      <section className="space-y-3">
        <h3 className="text-white/65 text-sm">{ml ? 'താരതമ്യത്തിനുള്ള അറബി പതിപ്പിന്റെ പാഠവും ഹറകത്തും' : 'Arabic-edition text and printed vowels for comparison'}</h3>
        {version.arabic_pages.map(number => <figure key={number} className="space-y-2">
          <img src={`/figures/birhatiah-manba-p${number}.png`} loading="lazy" alt={`Manba · ${number}`} className="block w-full max-w-2xl mx-auto bg-white rounded-lg" />
          <figcaption className="text-xs text-white/55">منبع أصول الحكمة · {number}</figcaption>
        </figure>)}
      </section>
    </section>)}
  </section>;
}
