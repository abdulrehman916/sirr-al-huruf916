import { useState } from 'react';
import book from '@/data/birhatiahSharedBookAccounts.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';
import { useIsOwner } from "@/hooks/useIsOwner";

const labels = {
  selection: ['നാമതിരഞ്ഞെടുപ്പും അക്ഷരമൂല്യങ്ങളും', 'Selection and numerical values'],
  poem: ['നാമങ്ങളുടെ കവിത', 'Poem of the names'],
  versions: ['മന്ത്രത്തിന്റെ വ്യത്യസ്ത പതിപ്പുകൾ', 'Different invocation versions'],
  conditions: ['പൊതുനിബന്ധനകളും ഖൽവയും', 'General conditions and discipline'],
  incense: ['ദിവസമനുസരിച്ചുള്ള ധൂപങ്ങൾ', 'Incense by day'],
  spirits: ['രൂഹാനി ആഹ്വാനപരാമർശങ്ങൾ', 'Spirit-evocation accounts'],
  attraction: ['ആകർഷണത്തെക്കുറിച്ചുള്ള ഭാഗങ്ങൾ', 'Attraction accounts'],
  protection: ['സംരക്ഷണവും ബന്ധനമോചനവും', 'Protection and unbinding'],
  livelihood: ['കടയും ഉപജീവനവും', 'Store and livelihood'],
  historical_health: ['ചരിത്രപരമായ ചികിത്സാവകാശവാദങ്ങൾ', 'Historical healing claims'],
  objects: ['വസ്തുക്കളെക്കുറിച്ചുള്ള അവകാശവാദങ്ങൾ', 'Claims about objects'],
  adversarial: ['എതിരാളിയെക്കുറിച്ചുള്ള ഗ്രന്ഥഭാഗങ്ങൾ', 'Adversarial source accounts'],
  scrying: ['മൻദലും ദർശനവും', 'Mandal and scrying'],
  treasure: ['നിധിയെക്കുറിച്ചുള്ള ഭാഗങ്ങൾ', 'Treasure accounts'],
  retreat: ['അല്ലാഹ് നാമത്തിന്റെ പ്രത്യേക ഖൽവ', 'Special Allah-name retreat'],
  supplication: ['അനുബന്ധ ദുആ', 'Supplementary supplication'],
  dismissal: ['പിരിച്ചയക്കലിന്റെ വ്യത്യസ്ത പാഠങ്ങൾ', 'Different dismissals'],
  quran: ['ഖുർആൻ പരാമർശങ്ങൾ', 'Quran references'],
  tijan: ['തിജാൻ — വേറിട്ട അനുബന്ധം', 'Tijan — separate supplement'],
  tahatil: ['തഹാതീൽ — വേറിട്ട അനുബന്ധം', 'Tahatil — separate supplement'],
};

export default function BirhatiahSharedBookAccounts({ initialQuery = '' }) {
  const isOwner = useIsOwner();
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const [query, setQuery] = useState(initialQuery);
  const filtered = book.accounts.filter(entry => entry.translation[language].toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const allFigures = [...book.figures, ...(book.source_figures || [])];
  const figurePlacement = new Map(allFigures.map(figure => {
    const related = filtered.filter(entry => figure.related_account_ids.includes(entry.id));
    return [figure.id, related.find(entry => entry.id === figure.owner_account_id)?.id || related[0]?.id];
  }));
  const visibleFigures = allFigures.filter(figure => figurePlacement.get(figure.id));
  return <section className="rounded-xl border border-yellow-500/25 p-4 space-y-4">
    <h3 className="text-yellow-200 font-semibold">{ml ? '28 പേരുകൾക്കുള്ള സംയുക്തവും അനുബന്ധവുമായ ഗ്രന്ഥവിവരങ്ങൾ' : 'Collective and supplementary book material'} ({book.accounts.length})</h3>
    <p className="text-sm leading-loose text-white/75">{book.scope[language]}</p>
    <input type="search" value={query} onChange={event => setQuery(event.target.value)} aria-label={ml ? 'ഗ്രന്ഥവിവരങ്ങളിൽ തിരയുക' : 'Search book accounts'} placeholder={ml ? 'വിഷയം, എണ്ണം, ദിവസം, വസ്തു എന്നിവ തിരയുക…' : 'Search topics, counts, days or materials…'} className="w-full rounded-lg border border-white/20 bg-slate-950 p-3 text-white" />
    <p className="text-xs text-white/60">{book.source_title} · {ml ? 'അച്ചടിച്ച പേജുകൾ' : 'Printed pages'} 140–194</p>
    {Object.entries(labels).map(([subject, names]) => {
      const entries = filtered.filter(entry => entry.subject === subject);
      if (!entries.length) return null;
      return <section key={subject} className="rounded-lg border border-white/15 p-3 space-y-3">
        <h3 className="text-yellow-100">{names[ml ? 0 : 1]} ({entries.length})</h3>
        {entries.map(entry => <section key={entry.id} data-shared-account={entry.id} className="border-t border-white/10 pt-3 space-y-2">
          <p className="text-sm leading-loose text-white/90">{entry.translation[language]}</p>
          {entry.reading_translation?.[language] && <section className="space-y-3" data-reading-translation={entry.id}>
            <h4 className="text-yellow-100 text-sm">{ml ? 'ദുആയിലെ വാക്യക്രമത്തിലുള്ള മലയാള വിവർത്തനം' : 'Translation following the invocation sequence'}</h4>
            {entry.reading_translation[language].map((paragraph,index) => <p key={`${entry.id}-reading-${index}`} className="text-sm text-white/90 leading-loose">{paragraph}</p>)}
            {entry.reading_translation_source?.arabic_pages?.map(page => <figure key={page} className="space-y-2" data-reading-source-page={page}>
              <img src={`/figures/birhatiah-manba-p${page}.png`} loading="lazy" alt={`منبع أصول الحكمة · ${page}`} className="block w-full max-w-2xl mx-auto rounded-lg bg-white" />
              <figcaption className="text-xs text-white/65">{isOwner && <>منبع أصول الحكمة · {ml ? 'പേജ്' : 'Page'} {page}</>}</figcaption>
            </figure>)}
          </section>}
          {entry.expanded_translation && <section className="space-y-3">
            <h3 className="text-yellow-100 text-sm">{ml ? 'ഈ പാഠഭാഗത്തിന്റെ വിപുലമായ അർഥം' : 'Expanded meaning of this passage'}</h3>
            {entry.expanded_translation.map((paragraph, index) => <p key={`${entry.id}-${index}`} className="text-sm leading-loose text-white/90">{paragraph[language]}</p>)}
          </section>}
          {isOwner && <p className="text-xs text-white/55">{book.source_title} · {ml ? 'പേജ്' : 'Page'} {entry.printed_pages}</p>}
          {entry.source_word_note && <p className="text-sm text-white/75" data-source-word-note={entry.id}>{entry.source_word_note[language]}{isOwner && <> · {entry.source_word_note.source_title} · {ml ? 'പേജ്' : 'Page'} {entry.source_word_note.printed_page}</>}</p>}
          {allFigures.filter(figure => figure.related_account_ids.includes(entry.id)).map(figure => figurePlacement.get(figure.id) === entry.id ? <section key={figure.id} id={figure.id} data-shared-figure={figure.id} className="rounded-lg border border-yellow-500/20 p-3 space-y-4">
            <h4 className="text-yellow-100 text-sm">{figure.caption[language]}</h4>
            <figure className="space-y-2" data-source-image="inline-shared-account">
              {figure.crop ? <svg role="img" aria-label={figure.caption[language]} viewBox={figure.crop.view_box} className="block w-full max-w-2xl mx-auto rounded-lg bg-white">
                <title>{figure.caption[language]}</title>
                <image href={figure.image_path} width={figure.crop.source_width} height={figure.crop.source_height} />
              </svg> : <img src={figure.image_path} loading="lazy" alt={figure.caption[language]} className="block w-full max-w-xl mx-auto rounded-lg bg-white" />}
              <figcaption className="text-xs text-white/65">{isOwner && <>{figure.source_title || book.source_title} · {ml ? 'പേജ്' : 'Page'} {figure.printed_page}</>}</figcaption>
            </figure>
            {figure.arabic_comparison?.review_status === 'checked_against_scan' && <figure className="space-y-2" data-source-image="inline-arabic-shared-account">
              <svg role="img" aria-label={figure.caption[language]} viewBox={figure.arabic_comparison.crop.view_box} className="block w-full max-w-xl mx-auto rounded-lg bg-white">
                <title>{figure.caption[language]}</title>
                <image href={figure.arabic_comparison.image_path} width={figure.arabic_comparison.crop.source_width} height={figure.arabic_comparison.crop.source_height} />
              </svg>
              <figcaption className="text-xs text-white/65">{isOwner && <>{figure.arabic_comparison.source_title} · {ml ? 'പേജ്' : 'Page'} {figure.arabic_comparison.printed_page} · </>}{ml ? 'അതേ മൂലചിത്രത്തിന്റെ വലുതാക്കിയ ഭാഗം; അക്ഷരങ്ങളും അക്കങ്ങളും ഒഴിഞ്ഞ കളങ്ങളും മാറ്റിയിട്ടില്ല.' : 'Enlarged original image region; letters, numbers and empty cells are unchanged.'}</figcaption>
            </figure>}
          </section> : <p key={figure.id} className="text-sm text-white/75"><a href={`#${figure.id}`} className="underline text-yellow-100">{ml ? 'ഈ ഭാഗത്ത് പരാമർശിക്കുന്ന അതേ ചിത്രം ഈ കാർഡിൽ കാണുക' : 'View the same referenced figure in this card'} · {figure.printed_page}</a></p>)}
          {entry.edition_comparison && <section className="border-l-2 border-yellow-500/25 pl-3 space-y-2">
            <p className="text-sm leading-loose text-white/85">{entry.edition_comparison[language]}</p>
            {entry.edition_comparison.image_path?.startsWith('/figures/') && <figure className="space-y-2" data-source-image="inline-comparison">
              <img src={entry.edition_comparison.image_path} loading="lazy" alt={entry.edition_comparison.source_title} className="block w-full max-w-2xl mx-auto rounded-lg bg-white" />
              <figcaption className="text-xs text-white/65">{entry.edition_comparison.source_title}</figcaption>
            </figure>}
          </section>}
        </section>)}
      </section>;
    })}
    {!filtered.length && <p className="text-sm text-white/60">{ml ? 'തിരഞ്ഞ വാക്ക് ഈ ഭാഗങ്ങളിൽ കണ്ടെത്തിയില്ല.' : 'No matching passage found.'}</p>}
    <section className="rounded-lg border border-white/15 p-3 space-y-4">
      <h3 className="text-yellow-100">{ml ? 'ഈ കാർഡിലെ മൂലചിത്രങ്ങളുടെ പട്ടിക' : 'Original-figure index in this card'} ({visibleFigures.length})</h3>
      <p className="text-sm text-white/65">{ml ? 'അച്ചടിയിൽ ഉള്ള രൂപം തന്നെ. ഓരോ ചിത്രവും അതത് പേജിലെ ഭാഗവുമായി മാത്രം ബന്ധിപ്പിക്കുക. ഒഴിഞ്ഞ കളങ്ങൾ ഊഹിച്ച് നിറച്ചിട്ടില്ല.' : 'The printed forms are retained. Read each figure with the account on its own page. Empty cells are not filled by inference.'}</p>
      {visibleFigures.map(figure => <p key={figure.id} className="text-sm text-white/75"><a href={`#${figure.id}`} className="underline text-yellow-100">{figure.caption[language]} · {ml ? 'പേജ്' : 'Page'} {figure.printed_page}</a></p>)}
    </section>
  </section>;
}
