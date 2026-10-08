import guides from '@/data/birhatiahReaderGuide.json';
import methodVerses from '@/data/birhatiahMethodVerses.json';
import meaningReadings from '@/data/birhatiahMeaningReadings.json';
import externalSources from '@/data/holyNamesExternalSources.json';
import collectiveText from '@/data/birhatiahCollectiveVersion.json';
import HolyNameReferenceChapter from './HolyNameReferenceChapter';
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
  const entryQuotes = (chapter.edition_accounts || []).filter(entry => method.quote_entry_ids?.includes(entry.id));
  const externalVerses = externalSources.filter(source => method.external_verse_ids?.includes(source.id));
  return <article id={method.method_id} className="space-y-4 border-t border-yellow-500/20 pt-4 scroll-mt-24" data-reader-section="method" data-source-entry={method.source_entry}>
    <h3 className="text-lg text-yellow-200">{index}. {t(method.title)}</h3>
    <h4 className="text-yellow-100">{ml ? 'ഉപയോഗിക്കേണ്ട നാമം / പാഠം' : 'Name / text used in this method'}</h4>
    {!collective && <Arabic>{method.formula_arabic || name}</Arabic>}
    {(collective || method.include_all_names) && <section className="space-y-3" data-reader-section="all-names-text"><h4 className="text-yellow-100">{ml ? '28 നാമങ്ങളുടെ പൂർണ്ണ പാഠം' : 'Complete text of the twenty-eight names'}</h4><Arabic>{collectiveText.names.map(entry => entry.reader_form || entry.arabic_original).join('، ')}</Arabic></section>}
    {method.include_collective_formula && <details className="rounded-xl border border-yellow-500/20 p-3 space-y-3" data-reader-section="inline-collective-formula"><summary className="cursor-pointer text-yellow-100">{ml ? 'ഇവിടെ വായിക്കേണ്ട പൂർണ്ണ സംയുക്ത മന്ത്രം' : 'Complete collective formula to read here'}</summary><Arabic>{collectiveText.names.flatMap(entry => [entry.reader_form || entry.arabic_original, entry.reader_form || entry.arabic_original]).join('، ')}{'\n'}{collectiveText.arabic_short_continuation}</Arabic><p className="text-white/85 leading-loose">{t(collectiveText.continuation_translation)}</p></details>}
    {method.written_text && <section className="space-y-3"><h4 className="text-yellow-100">{ml ? 'എഴുതേണ്ട പാഠവും അർഥവും' : 'Text to write and its meaning'}</h4><Arabic>{method.written_text.arabic}</Arabic><p className="text-white/85 leading-loose">{t(method.written_text.translation)}</p></section>}
    {entryQuotes.map(quote => <section key={quote.id} className="space-y-3" data-reader-section="method-verses"><h4 className="text-yellow-100">{ml ? 'ഈ രീതിയിൽ എഴുതേണ്ട ആയത്തിന്റെ ഭാഗം' : 'Verse excerpt to write in this method'}</h4><Arabic>{safeReading(quote.arabic_reading, quote.arabic_original)}</Arabic><p className="text-xs text-yellow-100/60">5:64</p><p className="text-white/85 leading-loose">{ml ? 'അവർക്കിടയിൽ അന്ത്യനാൾവരെ വൈരവും വിദ്വേഷവും നാം ഇട്ടു.' : 'We cast enmity and hatred between them until the Day of Resurrection.'}</p></section>)}
    {[...quotes, ...externalVerses].length > 0 && <section className="space-y-4" data-reader-section="method-verses"><h4 className="text-yellow-100">{ml ? 'ഈ രീതിയിൽ ഉപയോഗിക്കേണ്ട ആയത്തും അർഥവും' : 'Verse text and meaning for this method'}</h4>{[...quotes, ...externalVerses].map((quote, i) => <section key={i} className="space-y-2"><Arabic>{safeReading(quote.arabic_reading, quote.arabic_original) || quote.arabic}</Arabic><p className="text-white/90 leading-loose">{t(quote.translation)}</p><p className="text-xs text-yellow-100/60">{quote.source_location}</p></section>)}</section>}
    {method.spoken_request && <div className="space-y-3"><h4 className="text-yellow-100">{ml ? 'പറയേണ്ട അഭ്യർഥനയും അർഥവും' : 'Spoken request and meaning'}</h4><Arabic>{safeReading(method.spoken_request.arabic_reading, method.spoken_request.arabic)}</Arabic><p className="text-white/90 leading-loose">{t(method.spoken_request.translation)}</p>{method.spoken_request.arabic_reading && <details className="text-xs text-white/55"><summary className="cursor-pointer">{ml ? 'ഹറകത്ത് ചേർക്കാത്ത മൂലവാക്യം' : 'Original wording without editorial vowels'}</summary><Arabic>{method.spoken_request.arabic}</Arabic></details>}{method.spoken_request.source_url && <details className="text-xs text-white/55"><summary className="cursor-pointer">{ml ? 'റഫറൻസ്' : 'Reference'}</summary><a href={method.spoken_request.source_url} target="_blank" rel="noreferrer" className="underline">{ml ? 'പരമ്പരാഗത രീതിയുടെ വെബ് പരാമർശം' : 'Traditional web account'}</a></details>}</div>}
    {verses && <details className="rounded-xl border border-yellow-500/20 p-3 space-y-4"><summary className="cursor-pointer text-yellow-200">{t(verses.title)}</summary><Arabic>{verses.opening_arabic}</Arabic>{verses.verses.map(verse => <section key={verse.reference} className="space-y-2"><Arabic>{verse.arabic}</Arabic><p className="text-white/85 leading-loose">{t(verse.translation)}</p><p className="text-xs text-yellow-100/60">{verse.reference}</p></section>)}<a href={verses.source_url} target="_blank" rel="noreferrer" className="text-xs underline text-white/55">Quran.com</a></details>}
    <div className="rounded-lg bg-yellow-500/5 p-3 space-y-2"><h4 className="text-yellow-100">{ml ? 'പരമ്പരാഗതമായി പറയുന്ന ഗുണം' : 'Traditionally claimed benefit'}</h4><p className="leading-loose text-white/90">{t(method.benefit)}</p></div>
    <h4 className="text-yellow-100">{ml ? 'രീതി — ക്രമമായി' : 'Method — in order'}</h4>
    <ol className="list-decimal pl-6 space-y-3 text-white/90 leading-loose">{method.steps[language].map((step, index) => <li key={index}>{step}</li>)}</ol>
    {method.figure?.image_path?.startsWith('/figures/') && <figure className="space-y-2"><a href={method.figure.image_path} target="_blank" rel="noreferrer"><img src={method.figure.image_path} alt={t(method.figure.caption)} loading="lazy" className="max-w-full w-96 rounded-lg mx-auto" /></a><figcaption className="text-sm text-white/70 leading-loose">{t(method.figure.caption)}</figcaption></figure>}
    {method.source_pages?.length > 0 && <details className="rounded-xl border border-yellow-500/20 p-3 space-y-3"><summary className="cursor-pointer text-yellow-100">{t(method.scan_caption) || (ml ? 'ഈ രീതിയുടെ പൂർണ്ണ മൂലപാഠം' : 'Complete original page for this method')}</summary>{method.source_pages.map(page => <a key={page} href={`/figures/birhatiah-manba-p${page}.png`} target="_blank" rel="noreferrer" className="block"><img src={`/figures/birhatiah-manba-p${page}.png`} loading="lazy" alt={`Arabic original ${page}`} className="w-full max-w-xl mx-auto rounded-lg" /></a>)}</details>}
    {method.external_source && <details className="text-xs text-white/60"><summary className="cursor-pointer">{ml ? 'ഈ രീതിയുടെ ഉറവിടം' : 'Source for this method'}</summary><a className="block underline pt-2" href={method.external_source.url} target="_blank" rel="noreferrer">{method.external_source.title}</a></details>}
    {method.inline_tijan && <details className="rounded-xl border border-yellow-500/20 p-4 space-y-4" data-reader-section="tijan-text"><summary className="cursor-pointer text-yellow-200">{ml ? 'തിജാൻ ദുആ — ഹറകത്തോടുകൂടിയ പൂർണ്ണ അറബി പാഠം' : 'Tijan prayer — complete Arabic text with printed vowels'}</summary>{[88, 89].map(page => <a key={page} href={`/figures/birhatiah-manba-p${page}.png`} target="_blank" rel="noreferrer" className="block"><img src={`/figures/birhatiah-manba-p${page}.png`} loading="lazy" alt={`Tijan ${page}`} className="w-full max-w-xl mx-auto rounded-lg" /></a>)}</details>}
    {children}
  </article>;
}

export default function HolyNameSourceChapter({ chapter, nameId, currentAbjad }) {
  const { language } = useHolyNamesLanguage();
  if (!chapter || chapter.name_id !== nameId || chapter.review_status !== 'checked_against_scan') return null;
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  const guide = guides[nameId];
  const readings = chapter.edition_accounts?.find(entry => entry.id === 'english-reading-correspondence-review');
  const name = chapter.source_name_form || safeReading(readings?.arabic_reading, readings?.arabic_original);
  const methods = guide ? [guide, ...(guide.other_methods || [])] : [];
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
    <nav className="rounded-xl border border-yellow-500/20 p-4 space-y-3" aria-label={ml ? 'ഈ കാർഡിലെ ആവശ്യങ്ങൾ' : 'Purposes in this card'}><h3 className="text-yellow-200">{ml ? 'ആവശ്യങ്ങൾ — തിരഞ്ഞെടുക്കുക' : 'Choose a purpose'}</h3><ol className="list-decimal pl-6 space-y-2">{methods.map(method => <li key={method.method_id}><a href={`#${nameId}-${method.method_id}`} className="text-white/85 underline underline-offset-4">{t(method.title)}</a></li>)}</ol></nav>
    {methods.map((method, i) => <PurposeMethod key={method.method_id} method={{...method, method_id: `${nameId}-${method.method_id}`}} name={name} language={language} chapter={chapter} index={i + 1} collective={nameId === 'HNK-MHC-028' && i === 0} />)}
    <details className="rounded-xl border border-white/15 p-4 space-y-4" data-reader-section="references"><summary className="cursor-pointer text-yellow-200">{ml ? 'റഫറൻസുകളും പാഠഭേദങ്ങളും പൂർണ്ണ മൂലപേജുകളും' : 'References, variants and complete source pages'}</summary><HolyNameReferenceChapter chapter={chapter} nameId={nameId} /></details>
  </section>;
}
