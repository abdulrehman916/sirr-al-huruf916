import { useState } from 'react';
import guides from '@/data/birhatiahReaderGuide.json';
import additionalOutsideMethods from '@/data/birhatiahOutsideMethods2023.json';
import newlyCheckedOutsideMethods from '@/data/birhatiahOutsideMethods2020.json';
import methodVerses from '@/data/birhatiahMethodVerses.json';
import meaningReadings from '@/data/birhatiahMeaningReadings.json';
import externalSources from '@/data/holyNamesExternalSources.json';
import collectiveText from '@/data/birhatiahCollectiveVersion.json';
import BirhatiahConciseReferences from './BirhatiahConciseReferences';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';
import { BirhatiahOnlineNameComparison } from './BirhatiahOnlineNumericalComparison';

const letters = value => String(value || '').replace(/[\u064B-\u065F\u0670\u0640\s،؛؟,.]/g, '');
const safeReading = (reading, original) => reading && letters(reading) === letters(original) ? reading : original;
const Arabic = ({ children }) => children && <p className="font-amiri text-3xl text-right text-yellow-100 leading-[2.2] whitespace-pre-wrap" dir="rtl" lang="ar">{String(children).replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))}</p>;

function PurposeMethod({ method, name, language, chapter, index, children, collective = false }) {
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  const verses = methodVerses[method.verse_group];
  const quotes = method.include_chapter_quotes ? (chapter.source_notes || []).flatMap(note => note.quote_blocks || []) : [];
  const entryQuotes = (chapter.edition_accounts || [])
    .filter(entry => method.quote_entry_ids?.includes(entry.id))
    .flatMap(entry => entry.quote_blocks || []);
  const externalVerses = externalSources.filter(source => method.external_verse_ids?.includes(source.id));
  const seenVerses = new Set();
  const verseQuotes = [...entryQuotes, ...quotes, ...externalVerses].filter(quote => {
    const arabic = safeReading(quote.arabic_reading, quote.arabic_original || quote.arabic) || quote.arabic || '';
    const key = String(arabic).replace(/[\u064B-\u065F\u0670\u0640\s]/g, '') + ':' + (quote.source_location || '');
    if (!arabic || seenVerses.has(key)) return false;
    seenVerses.add(key);
    return true;
  });
  const linked = ['practices', 'edition_accounts', 'source_notes'].flatMap(group => chapter[group] || []).find(entry => entry.id === method.source_entry);
  const sourceTitle = method.external_source?.title || (method.source_name_id && method.source_name_id !== chapter.name_id ? '' : (linked?.source_title || chapter.source_title));
  const sourcePage = linked?.printed_page || (linked ? chapter.printed_page : null);
  const sourceTime = linked?.timing?.[language] || method.timing?.[language] || '';
  const sourceCount = linked?.count ?? method.count;
  return <details id={method.method_id} className="rounded-xl border border-yellow-500/25 bg-yellow-500/[0.035] scroll-mt-24 overflow-hidden" data-reader-section="method" data-source-entry={method.source_entry} open={index === 1 ? true : undefined}>
    <summary className="cursor-pointer px-4 py-3 space-y-1 hover:bg-yellow-500/5">
      <span className="block text-lg font-semibold text-yellow-200">{index}. {t(method.title)}</span>
      <span className="block text-sm leading-relaxed text-white/65">{t(method.benefit)}</span>
    </summary>
    <div className="space-y-4 px-4 pb-5 pt-3 border-t border-yellow-500/15">
    <h4 className="text-yellow-100">{ml ? 'ഉപയോഗിക്കേണ്ട നാമം / പാഠം' : 'Name / text used in this method'}</h4>
    {!collective && <Arabic>{method.formula_arabic || name}</Arabic>}
    {method.source_form_arabic && <details className="text-xs text-white/55"><summary className="cursor-pointer">{ml ? 'പുറംരേഖയിൽ അച്ചടിച്ച ഹറകത്തില്ലാത്ത നാമരൂപം' : 'Unvowelled spelling in the outside source'}</summary><Arabic>{method.source_form_arabic}</Arabic></details>}
    {(collective || method.include_all_names) && <section className="space-y-3" data-reader-section="all-names-text"><h4 className="text-yellow-100">{ml ? '28 നാമങ്ങളുടെ പൂർണ്ണ പാഠം' : 'Complete text of the twenty-eight names'}</h4><Arabic>{collectiveText.names.map(entry => entry.reader_form || entry.arabic_original).join('، ')}</Arabic></section>}
    {method.include_collective_formula && <details className="rounded-xl border border-yellow-500/20 p-3 space-y-3" data-reader-section="inline-collective-formula"><summary className="cursor-pointer text-yellow-100">{ml ? 'ഇവിടെ വായിക്കേണ്ട പൂർണ്ണ സംയുക്ത മന്ത്രം' : 'Complete collective formula to read here'}</summary><Arabic>{collectiveText.names.flatMap(entry => [entry.reader_form || entry.arabic_original, entry.reader_form || entry.arabic_original]).join('، ')}{'\n'}{collectiveText.arabic_short_continuation}</Arabic><p className="text-white/85 leading-loose">{t(collectiveText.continuation_translation)}</p></details>}
    {method.written_text && <section className="space-y-3"><h4 className="text-yellow-100">{ml ? 'എഴുതേണ്ട പാഠവും അർഥവും' : 'Text to write and its meaning'}</h4><Arabic>{method.written_text.arabic}</Arabic><p className="text-white/85 leading-loose">{t(method.written_text.translation)}</p></section>}
    {verseQuotes.length > 0 && <section className="space-y-4" data-reader-section="method-verses">
      <h4 className="text-yellow-100">{ml ? 'ബന്ധപ്പെട്ട ആയത്തുകൾ — അറബി പാഠവും അർത്ഥവും' : 'Related verses — Arabic text and meaning'}</h4>
      {verseQuotes.map((quote, i) => <section key={quote.id || i} className="space-y-2">
        <Arabic>{safeReading(quote.arabic_reading, quote.arabic_original || quote.arabic) || quote.arabic}</Arabic>
        {t(quote.translation) && <p className="text-white/90 leading-loose">{t(quote.translation)}</p>}
        {quote.source_location && <p className="text-xs text-yellow-100/60">{quote.source_location}</p>}
      </section>)}
    </section>}
    {method.spoken_request && <div className="space-y-3"><h4 className="text-yellow-100">{ml ? 'പറയേണ്ട അഭ്യർഥനയും അർഥവും' : 'Spoken request and meaning'}</h4><Arabic>{safeReading(method.spoken_request.arabic_reading, method.spoken_request.arabic)}</Arabic><p className="text-white/90 leading-loose">{t(method.spoken_request.translation)}</p>{method.spoken_request.arabic_reading && <details className="text-xs text-white/55"><summary className="cursor-pointer">{ml ? 'ഹറകത്ത് ചേർക്കാത്ത മൂലവാക്യം' : 'Original wording without editorial vowels'}</summary><Arabic>{method.spoken_request.arabic}</Arabic></details>}{method.spoken_request.source_url && <details className="text-xs text-white/55"><summary className="cursor-pointer">{ml ? 'റഫറൻസ്' : 'Reference'}</summary><a href={method.spoken_request.source_url} target="_blank" rel="noreferrer" className="underline">{ml ? 'പരമ്പരാഗത രീതിയുടെ വെബ് പരാമർശം' : 'Traditional web account'}</a></details>}</div>}
    {verses && <details className="rounded-xl border border-yellow-500/20 p-3 space-y-4"><summary className="cursor-pointer text-yellow-200">{t(verses.title)}</summary><Arabic>{verses.opening_arabic}</Arabic>{verses.verses.map(verse => <section key={verse.reference} className="space-y-2"><Arabic>{verse.arabic}</Arabic><p className="text-white/85 leading-loose">{t(verse.translation)}</p><p className="text-xs text-yellow-100/60">{verse.reference}</p></section>)}<a href={verses.source_url} target="_blank" rel="noreferrer" className="text-xs underline text-white/55">Quran.com</a></details>}
    {(sourceCount != null || sourceTime) && <div className="flex flex-wrap gap-2 text-sm">
      {sourceCount != null && <span className="rounded-lg border border-yellow-500/25 px-3 py-2 text-yellow-100">{ml ? 'ഗ്രന്ഥത്തിൽ പറഞ്ഞ എണ്ണം' : 'Count in the source'}: {sourceCount}</span>}
      {sourceTime && <span className="rounded-lg border border-yellow-500/25 px-3 py-2 text-yellow-100">{ml ? 'സമയം' : 'Time'}: {sourceTime}</span>}
    </div>}
    <h4 className="text-yellow-100">{ml ? 'രീതി — ക്രമമായി' : 'Method — in order'}</h4>
    <ol className="list-decimal pl-6 space-y-3 text-white/90 leading-loose">{method.steps[language].map((step, index) => <li key={index}>{step}</li>)}</ol>
    {method.figure?.image_path?.startsWith('/figures/') && <figure className="space-y-2"><a href={method.figure.image_path} target="_blank" rel="noreferrer"><img src={method.figure.image_path} alt={t(method.figure.caption)} loading="lazy" className="max-w-full w-96 rounded-lg mx-auto" /></a><figcaption className="text-sm text-white/70 leading-loose">{t(method.figure.caption)}</figcaption></figure>}
    {method.source_pages?.length > 0 && <details className="rounded-xl border border-yellow-500/20 p-3 space-y-3"><summary className="cursor-pointer text-yellow-100">{t(method.scan_caption) || (ml ? 'ഈ രീതിയുടെ പൂർണ്ണ മൂലപാഠം' : 'Complete original page for this method')}</summary>{method.source_pages.map(page => <a key={page} href={`/figures/birhatiah-manba-p${page}.png`} target="_blank" rel="noreferrer" className="block"><img src={`/figures/birhatiah-manba-p${page}.png`} loading="lazy" alt={`Arabic original ${page}`} className="w-full max-w-xl mx-auto rounded-lg" /></a>)}</details>}
    {method.external_source && <details className="text-xs text-white/60"><summary className="cursor-pointer">{ml ? 'ഈ രീതിയുടെ ഉറവിടം' : 'Source for this method'}</summary><a className="block underline pt-2" href={method.external_source.url} target="_blank" rel="noreferrer">{method.external_source.title}</a></details>}
    {method.inline_tijan && <details className="rounded-xl border border-yellow-500/20 p-4 space-y-4" data-reader-section="tijan-text"><summary className="cursor-pointer text-yellow-200">{ml ? 'തിജാൻ ദുആ — ഹറകത്തോടുകൂടിയ പൂർണ്ണ അറബി പാഠം' : 'Tijan prayer — complete Arabic text with printed vowels'}</summary>{[88, 89].map(page => <a key={page} href={`/figures/birhatiah-manba-p${page}.png`} target="_blank" rel="noreferrer" className="block"><img src={`/figures/birhatiah-manba-p${page}.png`} loading="lazy" alt={`Tijan ${page}`} className="w-full max-w-xl mx-auto rounded-lg" /></a>)}</details>}
    {linked?.arabic_original && <details className="border-t border-white/10 pt-2">
      <summary className="cursor-pointer text-xs text-white/60">{ml ? 'ഗ്രന്ഥത്തിലെ മൂല അറബി വാക്യം' : 'Original Arabic source wording'}</summary>
      <Arabic>{safeReading(linked.arabic_reading, linked.arabic_original)}</Arabic>
    </details>}
    {(sourceTitle || sourcePage || method.source_name_id) && <p className="text-xs text-white/45 break-words">
      {sourceTitle || (ml ? 'ബന്ധപ്പെട്ട ഇസ്മിന്റെ ഗ്രന്ഥഭാഗം' : 'Related name source')}
      {sourcePage ? ` · ${ml ? 'പേജ്' : 'p.'} ${sourcePage}` : ''}
    </p>}
    {children}
    </div>
  </details>;
}

export default function HolyNameSourceChapter({ chapter, nameId, currentAbjad }) {
  const { language } = useHolyNamesLanguage();
  const [topicQuery, setTopicQuery] = useState('');
  if (!chapter || chapter.name_id !== nameId || chapter.review_status !== 'checked_against_scan') return null;
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  const guide = guides[nameId];
  const readings = chapter.edition_accounts?.find(entry => entry.id === 'english-reading-correspondence-review');
  const name = chapter.source_name_form || safeReading(readings?.arabic_reading, readings?.arabic_original);
  const methods = guide ? [guide, ...(guide.other_methods || []), ...additionalOutsideMethods.methods.filter(method => method.related_name_ids.includes(nameId)), ...newlyCheckedOutsideMethods.methods.filter(method => method.related_name_ids.includes(nameId))] : [];
  const usedSourceIds = new Set(methods.filter(method => !method.source_name_id || method.source_name_id === nameId).map(method => method.source_entry).filter(Boolean));
  const supplementary = ['practices', 'edition_accounts', 'source_notes']
    .flatMap(group => (chapter[group] || []).filter(entry => !usedSourceIds.has(entry.id)).map(entry => ({ ...entry, group })));
  const normalizedQuery = topicQuery.trim().toLocaleLowerCase();
  const hasMatch = entry => !normalizedQuery || [entry.title?.[language], entry.benefit?.[language], entry.translation?.[language], entry.steps?.[language]?.join(' ')].filter(Boolean).join(' ').toLocaleLowerCase().includes(normalizedQuery);
  const visibleMethods = methods.filter(hasMatch);
  const visibleSupplementary = supplementary.filter(hasMatch);
  const correspondence = readings?.translation?.[language] || '';
  const linkedLetter = correspondence.match(/അക്ഷരം\s+([^;]+)|with letter\s+([^ ]+)/);
  const linkedMansion = correspondence.match(/മൻസിൽ\s+([^.]+)|lunar mansion\s+([^.]+)/);
  return <section className={`rounded-xl border border-yellow-500/30 p-4 space-y-6 ${ml ? 'font-malayalam' : 'font-inter'}`} data-testid="birhatiah-reader-guide">
    <section className="space-y-3" data-reader-section="formula">
      <h2 className="text-lg text-yellow-200">{ml ? 'മന്ത്രവും അർഥവും' : 'Formula and meaning'}</h2>
      <Arabic>{name}</Arabic>
      <Arabic>{safeReading(meaningReadings[nameId], chapter.meaning_arabic)}</Arabic>
      <p className="text-white/90 leading-loose">{t(chapter.meaning_translation).replace(/^ഗ്രന്ഥം നൽകുന്ന അറബി അർഥം\s*/, '').replace(/^ഗ്രന്ഥത്തിലെ അറബി അർഥം:\s*/, '').replace(/^The source gives\s*/, '').replace(/^The source’s Arabic meaning is\s*/, '')}</p>
    </section>
    <BirhatiahOnlineNameComparison nameId={nameId} currentAbjad={currentAbjad} />
    <section className="space-y-3" data-reader-section="name-details"><h3 className="text-yellow-200">{ml ? 'നാമത്തിന്റെ അക്ഷരങ്ങളും ബന്ധങ്ങളും' : 'Letters and correspondences'}</h3><p className="font-amiri text-2xl text-right text-yellow-100" dir="rtl">{[...letters(name)].join(' · ')}</p>{linkedLetter && <p className="text-white/85">{ml ? 'ബന്ധിപ്പിച്ച അക്ഷരം: ' : 'Associated letter: '}{linkedLetter[1] || linkedLetter[2]}</p>}{linkedMansion && <p className="text-white/85">{ml ? 'മൻസിൽ: ' : 'Lunar mansion: '}{linkedMansion[1] || linkedMansion[2]}</p>}</section>
    <div className="space-y-3" data-reader-section="topics">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-yellow-200">{ml ? 'ആവശ്യങ്ങളും ദിക്റിന്റെ രീതികളും' : 'Purposes and reading methods'}</h3>
        <p className="text-sm text-white/60">{ml ? 'ഒരു വിഷയം തുറന്ന് അറബി പാഠവും അർത്ഥവും ചെയ്യേണ്ട ക്രമവും വായിക്കുക.' : 'Open a topic to read the Arabic wording, meaning and method.'}</p>
      </div>
      <input type="search" value={topicQuery} onChange={event => setTopicQuery(event.target.value)}
        placeholder={ml ? 'ഉപജീവനം, സംരക്ഷണം, മനസ്സമാധാനം… വിഷയങ്ങൾ തിരയുക' : 'Search livelihood, protection, peace of mind…'}
        aria-label={ml ? 'ഈ ഇസ്മിന്റെ വിഷയങ്ങൾ തിരയുക' : 'Search topics for this name'}
        className="w-full rounded-xl border border-yellow-500/25 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-yellow-500/60" />
      <nav className="rounded-xl border border-yellow-500/20 p-4 space-y-3" aria-label={ml ? 'ഈ കാർഡിലെ ആവശ്യങ്ങൾ' : 'Purposes in this card'}>
        <h3 className="text-yellow-200">{ml ? 'വിഷയസൂചിക' : 'Topic index'}</h3>
        <ol className="list-decimal pl-6 space-y-2">
          {visibleMethods.map(method => <li key={method.method_id}><a href={`#${nameId}-${method.method_id}`} className="text-white/85 underline underline-offset-4">{t(method.title)}</a></li>)}
          {visibleSupplementary.map(entry => <li key={entry.group + ':' + entry.id}><a href={`#${nameId}-extra-${entry.group}-${entry.id}`} className="text-white/85 underline underline-offset-4">{t(entry.title)}</a></li>)}
        </ol>
        {!visibleMethods.length && !visibleSupplementary.length && <p className="text-sm text-white/60">{ml ? 'ഈ വാക്കിനുള്ള വിഷയം കണ്ടെത്തിയില്ല.' : 'No matching topic in this name.'}</p>}
      </nav>
      {visibleMethods.map((method, i) => <PurposeMethod key={method.method_id}
        method={{...method, method_id: `${nameId}-${method.method_id}`}}
        name={name} language={language} chapter={chapter} index={methods.indexOf(method) + 1}
        collective={nameId === 'HNK-MHC-028' && methods.indexOf(method) === 0} />)}
      {visibleSupplementary.map(entry => <details key={entry.group + ':' + entry.id}
        id={`${nameId}-extra-${entry.group}-${entry.id}`}
        className="rounded-xl border border-yellow-500/25 bg-yellow-500/[0.025] scroll-mt-24 overflow-hidden"
        data-reader-section="source-topic">
        <summary className="cursor-pointer px-4 py-3 text-yellow-100 font-semibold">{t(entry.title)}</summary>
        <div className="space-y-3 border-t border-yellow-500/15 px-4 py-4">
          {entry.arabic_original && <Arabic>{safeReading(entry.arabic_reading, entry.arabic_original)}</Arabic>}
          {t(entry.translation) && <p className="leading-loose text-white/85 whitespace-pre-wrap">{t(entry.translation)}</p>}
          {entry.count != null && <p className="text-sm text-white/85">{ml ? 'എണ്ണം' : 'Count'}: {entry.count}</p>}
          {t(entry.timing) && <p className="text-sm text-white/85">{ml ? 'സമയം' : 'Time'}: {t(entry.timing)}</p>}
          {(entry.quote_blocks || []).map((quote, j) => <div key={j} className="space-y-2 border-t border-white/10 pt-3"><Arabic>{safeReading(quote.arabic_reading, quote.arabic_original || quote.arabic) || quote.arabic}</Arabic><p className="leading-loose text-white/85">{t(quote.translation)}</p><p className="text-xs text-white/55">{quote.source_location}</p></div>)}
          {entry.source_title && <p className="text-xs text-white/45">{entry.source_title}{entry.printed_page ? ` · ${ml ? 'പേജ്' : 'p.'} ${entry.printed_page}` : ''}</p>}
        </div>
      </details>)}
    </div>
    <details className="rounded-xl border border-white/15 p-4 space-y-4" data-reader-section="references"><summary className="cursor-pointer text-yellow-200">{ml ? 'മൂലഗ്രന്ഥപേജുകളും പാഠഭേദങ്ങളും' : 'Original pages and textual variants'}</summary><BirhatiahConciseReferences chapter={chapter} nameId={nameId} /></details>
  </section>;
}
