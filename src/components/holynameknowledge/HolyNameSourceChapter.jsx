import guides from '@/data/birhatiahReaderGuide.json';
import methodVerses from '@/data/birhatiahMethodVerses.json';
import meaningReadings from '@/data/birhatiahMeaningReadings.json';
import externalSources from '@/data/holyNamesExternalSources.json';
import singlePage from '@/data/birhatiahArabicSinglePage.json';
import HolyNameReferenceChapter from './HolyNameReferenceChapter';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

const letters = value => String(value || '').replace(/[\u064B-\u065F\u0670\u0640\s،؛؟,.]/g, '');
const safeReading = (reading, original) => reading && letters(reading) === letters(original) ? reading : original;
const Arabic = ({ children }) => children && <p className="font-amiri text-3xl text-right text-yellow-100 leading-[2.2] whitespace-pre-wrap" dir="rtl" lang="ar">{String(children).replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))}</p>;

function PurposeMethod({ method, name, language, children, collective = false }) {
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  const verses = methodVerses[method.verse_group];
  return <article className="space-y-4 border-t border-yellow-500/20 pt-4" data-reader-section="method" data-source-entry={method.source_entry}>
    <h3 className="text-lg text-yellow-200">{t(method.title)}</h3>
    {!collective && <Arabic>{method.formula_arabic || name}</Arabic>}
    {collective && <a href="#birhatiah-mantra-029" className="text-yellow-100 underline">{ml ? '29-ാം കാർഡിലെ പൂർണ്ണ സംയുക്ത മന്ത്രം' : 'Complete collective formula in card 29'}</a>}
    <div className="rounded-lg bg-yellow-500/5 p-3 space-y-2"><h4 className="text-yellow-100">{ml ? 'പരമ്പരാഗതമായി പറയുന്ന ഗുണം' : 'Traditionally claimed benefit'}</h4><p className="leading-loose text-white/90">{t(method.benefit)}</p></div>
    <h4 className="text-yellow-100">{ml ? 'രീതി — ക്രമമായി' : 'Method — in order'}</h4>
    <ol className="list-decimal pl-6 space-y-3 text-white/90 leading-loose">{method.steps[language].map((step, index) => <li key={index}>{step}</li>)}</ol>
    {method.spoken_request && <div className="space-y-3"><h4 className="text-yellow-100">{ml ? 'പറയേണ്ട അഭ്യർഥനയും അർഥവും' : 'Spoken request and meaning'}</h4><Arabic>{method.spoken_request.arabic}</Arabic><p className="text-white/90 leading-loose">{t(method.spoken_request.translation)}</p>{method.spoken_request.source_url && <details className="text-xs text-white/55"><summary className="cursor-pointer">{ml ? 'റഫറൻസ്' : 'Reference'}</summary><a href={method.spoken_request.source_url} target="_blank" rel="noreferrer" className="underline">{ml ? 'പരമ്പരാഗത രീതിയുടെ വെബ് പരാമർശം' : 'Traditional web account'}</a></details>}</div>}
    {verses && <details className="rounded-xl border border-yellow-500/20 p-3 space-y-4"><summary className="cursor-pointer text-yellow-200">{t(verses.title)}</summary>{verses.verses.map(verse => <section key={verse.reference} className="space-y-2"><Arabic>{verse.arabic}</Arabic><p className="text-white/85 leading-loose">{t(verse.translation)}</p><p className="text-xs text-yellow-100/60">{verse.reference}</p></section>)}<a href={verses.source_url} target="_blank" rel="noreferrer" className="text-xs underline text-white/55">Quran.com</a></details>}
    {method.figure?.image_path?.startsWith('/figures/') && <figure className="space-y-2"><a href={method.figure.image_path} target="_blank" rel="noreferrer"><img src={method.figure.image_path} alt={t(method.figure.caption)} loading="lazy" className="max-w-full w-96 rounded-lg mx-auto" /></a><figcaption className="text-sm text-white/70 leading-loose">{t(method.figure.caption)}</figcaption></figure>}
    {children}
  </article>;
}

export default function HolyNameSourceChapter({ chapter, nameId }) {
  const { language } = useHolyNamesLanguage();
  if (!chapter || chapter.name_id !== nameId || chapter.review_status !== 'checked_against_scan') return null;
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  const guide = guides[nameId];
  const readings = chapter.edition_accounts?.find(entry => entry.id === 'english-reading-correspondence-review');
  const name = chapter.source_name_form || safeReading(readings?.arabic_reading, readings?.arabic_original);
  const quotes = (chapter.source_notes || []).flatMap(note => note.quote_blocks || []);
  const related = externalSources.filter(source => source.review_status === 'checked_against_digital_text' && source.related_name_ids.includes(nameId) && source.id !== 'mundhiri-collective-241-242');
  return <section className={`rounded-xl border border-yellow-500/30 p-4 space-y-6 ${ml ? 'font-malayalam' : 'font-inter'}`} data-testid="birhatiah-reader-guide">
    <section className="space-y-3" data-reader-section="formula">
      <h2 className="text-lg text-yellow-200">{ml ? 'മന്ത്രവും അർഥവും' : 'Formula and meaning'}</h2>
      <Arabic>{name}</Arabic>
      <Arabic>{safeReading(meaningReadings[nameId], chapter.meaning_arabic)}</Arabic>
      <p className="text-white/90 leading-loose">{t(chapter.meaning_translation).replace(/^ഗ്രന്ഥം നൽകുന്ന അറബി അർഥം\s*/, '').replace(/^ഗ്രന്ഥത്തിലെ അറബി അർഥം:\s*/, '').replace(/^The source gives\s*/, '').replace(/^The source’s Arabic meaning is\s*/, '')}</p>
    </section>
    {guide && <PurposeMethod method={guide} name={name} language={language} collective={nameId === 'HNK-MHC-028'} />}
    {(guide?.other_methods || []).map(method => <PurposeMethod key={method.source_entry} method={method} name={name} language={language} />)}
    {nameId === 'HNK-MHC-021' && <article className="border-t border-yellow-500/20 pt-4 space-y-3"><h3 className="text-yellow-200">{ml ? 'ഗയാഹാ–കൈദഹൂലാ സംയുക്ത വായന' : 'Ghayaha–Kaydahula paired reading'}</h3><Arabic>غَيَاهَا كَيْدَهُولَا</Arabic><ol className="list-decimal pl-6 leading-loose space-y-2 text-white/85"><li>{ml ? 'ഖൽവത്തിൽ ശരീരവും വസ്ത്രവും പരിസരവും ശുദ്ധമായി സൂക്ഷിച്ച് ഈ രണ്ടു പേരുകളും തുടർച്ചയായി വായിക്കുക.' : 'Keep the body, clothing and surroundings clean during seclusion and read these two names continuously.'}</li><li>{ml ? 'ഓരോ നൂറ് ആവർത്തനത്തിനുശേഷവും തിജാൻ നാമങ്ങൾ ഒരുതവണ വായിക്കുക. താഴെയുള്ള തിജാൻ പാഠം തുറന്ന് വായിക്കാം.' : 'After every hundred repetitions, read the Names of the Tijan once. Open the Tijan text below to read it.'}</li></ol><details className="rounded-xl border border-yellow-500/20 p-4 space-y-4" data-reader-section="tijan-text"><summary className="cursor-pointer text-yellow-200">{ml ? 'തിജാൻ ദുആ — ഹറകത്തോടുകൂടിയ പൂർണ്ണ അറബി പാഠം' : 'Tijan prayer — complete Arabic text with printed vowels'}</summary>{[88, 89].map(page => <a key={page} href={`/figures/birhatiah-manba-p${page}.png`} target="_blank" rel="noreferrer" className="block"><img src={`/figures/birhatiah-manba-p${page}.png`} loading="lazy" alt={ml ? `തിജാൻ പാഠം — പേജ് ${page}` : `Tijan text — page ${page}`} className="w-full max-w-xl mx-auto rounded-lg" /></a>)}</details></article>}
    {quotes.length > 0 && <section className="border-t border-yellow-500/20 pt-4 space-y-4" data-reader-section="verses"><h3 className="text-lg text-yellow-200">{ml ? 'രീതിയുമായി ബന്ധപ്പെട്ട ആയത്തുകൾ' : 'Verses connected with the method'}</h3>{quotes.map((quote, index) => <article key={index} className="space-y-2"><Arabic>{quote.arabic}</Arabic><p className="text-white/90 leading-loose">{t(quote.translation)}</p><p className="text-xs text-yellow-100/70">{quote.source_location}</p></article>)}</section>}
    {related.length > 0 && <section className="border-t border-yellow-500/20 pt-4 space-y-4" data-reader-section="duas"><h3 className="text-lg text-yellow-200">{ml ? 'ബന്ധപ്പെട്ട ദുആകളും അർഥവുമായി ബന്ധപ്പെട്ട വചനങ്ങളും' : 'Related prayers and passages connected with the meaning'}</h3>{related.map(source => <article key={source.id} className="space-y-2"><h4 className="text-yellow-100">{t(source.title)}</h4><Arabic>{safeReading(source.arabic_reading, source.arabic_original)}</Arabic><p className="text-white/90 leading-loose">{t(source.translation)}</p><details className="text-xs text-white/60"><summary className="cursor-pointer">{ml ? 'ബന്ധവും റഫറൻസും' : 'Connection and reference'}</summary><p className="pt-2 leading-loose">{t(source.scope_note)}</p><p>{source.source_title} · {source.source_location || source.source_pages}</p></details></article>)}</section>}
    {singlePage.accounts.some(entry => entry.name_ids.includes(nameId)) && <details className="rounded-xl border border-yellow-500/20 p-4 space-y-4"><summary className="cursor-pointer text-yellow-200">{ml ? 'അനുബന്ധ അറബി പാഠത്തിലെ രീതികൾ' : 'Methods in the supplementary Arabic text'}</summary>{singlePage.accounts.filter(entry => entry.name_ids.includes(nameId)).map(entry => <article key={entry.id} className="space-y-2 border-t border-white/10 pt-3"><h4 className="text-yellow-100">{t(entry.title)}</h4><Arabic>{entry.arabic_original}</Arabic><p className="text-white/85 leading-loose">{t(entry.translation)}</p></article>)}</details>}
    <details className="rounded-xl border border-white/15 p-4 space-y-4" data-reader-section="references"><summary className="cursor-pointer text-yellow-200">{ml ? 'റഫറൻസുകളും പാഠഭേദങ്ങളും പൂർണ്ണ മൂലപേജുകളും' : 'References, variants and complete source pages'}</summary><HolyNameReferenceChapter chapter={chapter} nameId={nameId} /></details>
  </section>;
}
