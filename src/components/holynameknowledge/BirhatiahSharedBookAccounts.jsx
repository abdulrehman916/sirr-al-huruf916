import { useState } from 'react';
import book from '@/data/birhatiahSharedBookAccounts.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

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

export default function BirhatiahSharedBookAccounts() {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const [query, setQuery] = useState('');
  const filtered = book.accounts.filter(entry => entry.translation[language].toLocaleLowerCase().includes(query.toLocaleLowerCase()));
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
        {entries.map(entry => <section key={entry.id} className="border-t border-white/10 pt-3 space-y-2">
          <p className="text-sm leading-loose text-white/90">{entry.translation[language]}</p>
          {entry.expanded_translation && <section className="space-y-3">
            <h3 className="text-yellow-100 text-sm">{ml ? 'ഈ പാഠഭാഗത്തിന്റെ വിപുലമായ അർഥം' : 'Expanded meaning of this passage'}</h3>
            {entry.expanded_translation.map((paragraph, index) => <p key={`${entry.id}-${index}`} className="text-sm leading-loose text-white/90">{paragraph[language]}</p>)}
          </section>}
          <p className="text-xs text-white/55">{book.source_title} · {ml ? 'പേജ്' : 'Page'} {entry.printed_pages}</p>
          {entry.edition_comparison && <section className="border-l-2 border-yellow-500/25 pl-3 space-y-2">
            <p className="text-sm leading-loose text-white/85">{entry.edition_comparison[language]}</p>
            <a href={entry.edition_comparison.image_path} target="_blank" rel="noreferrer" className="text-xs underline text-white/55">{entry.edition_comparison.source_title}</a>
          </section>}
        </section>)}
      </section>;
    })}
    {!filtered.length && <p className="text-sm text-white/60">{ml ? 'തിരഞ്ഞ വാക്ക് ഈ ഭാഗങ്ങളിൽ കണ്ടെത്തിയില്ല.' : 'No matching passage found.'}</p>}
    <section className="rounded-lg border border-white/15 p-3 space-y-4">
      <h3 className="text-yellow-100">{ml ? 'പുസ്തകത്തിൽനിന്നുള്ള വ്യക്തമായ സംയുക്ത ചിത്രങ്ങൾ' : 'Shared figures directly from the book'} ({book.figures.length})</h3>
      <p className="text-sm text-white/65">{ml ? 'അച്ചടിയിൽ ഉള്ള രൂപം തന്നെ. ഓരോ ചിത്രവും അതത് പേജിലെ ഭാഗവുമായി മാത്രം ബന്ധിപ്പിക്കുക. ഒഴിഞ്ഞ കളങ്ങൾ ഊഹിച്ച് നിറച്ചിട്ടില്ല.' : 'The printed forms are retained. Read each figure with the account on its own page. Empty cells are not filled by inference.'}</p>
      {book.figures.map(figure => <figure key={figure.printed_page} className="space-y-2">
        <a href={figure.image_path} target="_blank" rel="noreferrer"><img src={figure.image_path} loading="lazy" alt={`${ml ? 'സംയുക്ത ഗ്രന്ഥചിത്രം, പേജ്' : 'Shared book figure, page'} ${figure.printed_page}`} className="w-full max-w-xl mx-auto rounded-lg bg-white" /></a>
        <figcaption className="text-xs text-white/65">{book.source_title} · {ml ? 'പേജ്' : 'Page'} {figure.printed_page}</figcaption>
      </figure>)}
    </section>
  </section>;
}
