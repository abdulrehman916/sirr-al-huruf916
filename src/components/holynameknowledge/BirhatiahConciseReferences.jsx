import BirhatiahOutsideVariants from './BirhatiahOutsideVariants';
import BirhatiahFullSourceChapter from './BirhatiahFullSourceChapter';
import BirhatiahArabicSinglePage from './BirhatiahArabicSinglePage';
import BirhatiahResearchContext from './BirhatiahResearchContext';
import BirhatiahOmanNameReferences from './BirhatiahOmanNameReferences';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

// Source content and existing source images are displayed in the card.
// External links are optional bibliography; never the sole way to view an excerpt.
export default function BirhatiahConciseReferences({ chapter, nameId }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const sourceTitles = new Set();
  if (chapter.source_title) sourceTitles.add(chapter.source_title);
  for (const section of ['practices', 'edition_accounts', 'source_notes']) {
    for (const entry of chapter[section] || []) if (entry.source_title) sourceTitles.add(entry.source_title);
  }
  const figures = [
    ...(chapter.figure ? [chapter.figure] : []),
    ...(chapter.edition_figures || []),
  ].filter(figure => figure.image_path?.startsWith('/figures/'));
  const uniqueFigures = [...new Map(figures.map(figure => [figure.image_path, figure])).values()];
  return <div className="space-y-5 pt-3" data-reader-content="inline-source-material">
    {sourceTitles.size > 0 && <section className="space-y-2">
      <h3 className="text-sm text-yellow-200">{ml ? 'ഉപയോഗിച്ച ഗ്രന്ഥങ്ങൾ' : 'Books consulted'}</h3>
      <ul className="space-y-1 text-xs text-white/70">
        {[...sourceTitles].map(name => <li key={name}>{name}</li>)}
      </ul>
    </section>}
    {uniqueFigures.length > 0 && <section className="rounded-xl border border-yellow-500/20 p-3 space-y-4" data-reader-section="inline-original-figures">
      <h3 className="text-yellow-200">{ml ? 'ഗ്രന്ഥത്തിലെ യഥാർത്ഥ ചിത്രങ്ങളും കളങ്ങളും' : 'Original source figures and squares'} ({uniqueFigures.length})</h3>
      {uniqueFigures.map(figure => <figure key={figure.image_path} className="space-y-2 pt-3">
        <img src={figure.image_path} loading="lazy" alt={figure.caption?.[language] || (ml ? 'മൂലഗ്രന്ഥത്തിലെ ചിത്രം' : 'Original source figure')} className="block max-w-full w-96 rounded-lg bg-white mx-auto" />
        {figure.caption?.[language] && <figcaption className="text-sm text-white/80 leading-loose">{figure.caption[language]}</figcaption>}
        <p className="text-xs text-white/55">{figure.source_title || chapter.source_title}{figure.printed_page ? ` · ${ml ? 'പേജ്' : 'p.'} ${figure.printed_page}` : ''}</p>
      </figure>)}
    </section>}
    <BirhatiahOmanNameReferences nameId={nameId} />
    <BirhatiahOutsideVariants nameId={nameId} />
    <BirhatiahArabicSinglePage nameId={nameId} />
    <BirhatiahResearchContext nameId={nameId} />
    <BirhatiahFullSourceChapter nameId={nameId} />
  </div>;
}
