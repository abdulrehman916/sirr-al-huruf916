import { useState } from 'react';
import source from '@/data/birhatiahFullSourceChapter.json';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

export default function BirhatiahFullSourceChapter({ nameId }) {
  const { language } = useHolyNamesLanguage();
  const ml = language === 'ml';
  const [pageNumber, setPageNumber] = useState(source.name_pages[nameId]?.[0] || 75);
  const page = source.pages.find(entry => entry.printed_page === pageNumber);
  const related = source.name_pages[nameId] || [];
  return <details className="rounded-xl border border-yellow-500/25 p-4 space-y-4">
    <summary className="cursor-pointer text-yellow-200 font-semibold">{ml ? 'മൻബഅിലെ പൂർണ അറബി അധ്യായം — എല്ലാ മൂലപേജുകളും രൂപങ്ങളും' : 'Complete Arabic Manba chapter — all original pages and figures'} (24)</summary>
    <p className="text-sm leading-loose text-white/70">{source.scope[language]}</p>
    {!!related.length && <div className="space-y-2">
      <p className="text-xs text-white/60">{ml ? 'ഈ നാമവുമായി ബന്ധപ്പെട്ട പേജുകൾ' : 'Pages related to this name'}</p>
      <div className="flex flex-wrap gap-2">{related.map(number => <button type="button" key={number} onClick={() => setPageNumber(number)} aria-pressed={number === pageNumber} className="rounded border border-yellow-500/30 px-3 py-2 text-yellow-100">{number}</button>)}</div>
    </div>}
    <label className="block text-sm text-white/70 space-y-2">
      <span>{ml ? 'അധ്യായത്തിലെ ഏതു പേജും തുറക്കാം' : 'Open any page in the chapter'}</span>
      <select value={pageNumber} onChange={event => setPageNumber(Number(event.target.value))} className="w-full rounded-lg border border-white/20 bg-slate-950 p-3 text-white">
        {source.pages.map(entry => <option key={entry.printed_page} value={entry.printed_page}>{entry.printed_page} — {entry.title[language]}</option>)}
      </select>
    </label>
    <article className="space-y-3">
      <h3 className="text-yellow-100">{page.title[language]}</h3>
      <p className="text-sm leading-loose text-white/80">{page.description[language]}</p>
      <a href={page.image_path} target="_blank" rel="noreferrer"><img src={page.image_path} key={page.image_path} loading="lazy" alt={`${source.source_title} · ${page.printed_page}`} className="w-full max-w-2xl mx-auto bg-white rounded-lg" /></a>
      <p className="text-xs text-white/55">{source.source_title} · {ml ? 'അച്ചടിച്ച പേജ്' : 'Printed page'} {page.printed_page}</p>
    </article>
    <a href={source.source_url} target="_blank" rel="noreferrer" className="text-xs underline text-white/60">{ml ? 'പൂർണ ഗ്രന്ഥത്തിന്റെ പുറംസ്രോതസ്സ്' : 'External source of the complete book'}</a>
  </details>;
}
