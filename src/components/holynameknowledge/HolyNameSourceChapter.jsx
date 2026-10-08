import guides from '@/data/birhatiahReaderGuide.json';
import meaningReadings from '@/data/birhatiahMeaningReadings.json';
import externalSources from '@/data/holyNamesExternalSources.json';
import singlePage from '@/data/birhatiahArabicSinglePage.json';
import HolyNameReferenceChapter from './HolyNameReferenceChapter';
import { useHolyNamesLanguage } from './HolyNamesLanguageContext';

const letters = value => String(value || '').replace(/[\u064B-\u065F\u0670\u0640\s،؛؟,.]/g, '');
const safeReading = (reading, original) => reading && letters(reading) === letters(original) ? reading : original;
const Arabic = ({ children }) => children && <p className="font-amiri text-3xl text-right text-yellow-100 leading-[2.2] whitespace-pre-wrap" dir="rtl" lang="ar">{children}</p>;

export default function HolyNameSourceChapter({ chapter, nameId }) {
  const { language } = useHolyNamesLanguage();
  if (!chapter || chapter.name_id !== nameId || chapter.review_status !== 'checked_against_scan') return null;
  const ml = language === 'ml';
  const t = value => value?.[language] || '';
  const guide = guides[nameId];
  const readings = chapter.edition_accounts?.find(entry => entry.id === 'english-reading-correspondence-review');
  const name = chapter.source_name_form || safeReading(readings?.arabic_reading, readings?.arabic_original);
  const quotes = (chapter.source_notes || []).flatMap(note => note.quote_blocks || []);
  const related = externalSources.filter(source => source.review_status === 'checked_against_digital_text' && source.related_name_ids.includes(nameId));
  const entries = [...(chapter.practices || []), ...(chapter.edition_accounts || [])];
  const extra = entries.filter(entry => entry.id !== guide?.source_entry && entry.id !== 'source-correspondences' && !/reading|correspondence|name-and|variants|name-specific-and-collective/.test(entry.id));
  return <section className={`rounded-xl border border-yellow-500/30 p-4 space-y-6 ${ml ? 'font-malayalam' : 'font-inter'}`} data-testid="birhatiah-reader-guide">
    <section className="space-y-3" data-reader-section="formula">
      <h2 className="text-lg text-yellow-200">{ml ? 'മന്ത്രവും അർഥവും' : 'Formula and meaning'}</h2>
      <Arabic>{name}</Arabic>
      <Arabic>{safeReading(meaningReadings[nameId], chapter.meaning_arabic)}</Arabic>
      <p className="text-white/90 leading-loose">{t(chapter.meaning_translation).replace(/^ഗ്രന്ഥം നൽകുന്ന അറബി അർഥം\s*/, '').replace(/^ഗ്രന്ഥത്തിലെ അറബി അർഥം:\s*/, '').replace(/^The source gives\s*/, '').replace(/^The source’s Arabic meaning is\s*/, '')}</p>
    </section>
    {guide && <article className="space-y-4 border-t border-yellow-500/20 pt-4" data-reader-section="method">
      <h3 className="text-lg text-yellow-200">{t(guide.title)}</h3>
      <div className="rounded-lg bg-yellow-500/5 p-3 space-y-2"><h4 className="text-yellow-100">{ml ? 'പരമ്പരാഗതമായി പറയുന്ന ഗുണം' : 'Traditionally claimed benefit'}</h4><p className="leading-loose text-white/90">{t(guide.benefit)}</p></div>
      <h4 className="text-yellow-100">{ml ? 'രീതി — ക്രമമായി' : 'Method — in order'}</h4>
      <ol className="list-decimal pl-6 space-y-3 text-white/90 leading-loose">{guide.steps[language].map((step, index) => <li key={index}>{step}</li>)}</ol>
      {nameId === 'HNK-MHC-015' && <div className="space-y-2"><Arabic>توكلوا يا خدام هذا الاسم الشريف وأروني كذا وكذا</Arabic><p className="leading-loose text-white/85">{ml ? 'ഈ മഹത്തായ നാമത്തിന്റെ സേവകരേ, ചുമതല ഏറ്റെടുക്കുകയും ഇന്ന കാര്യം എനിക്ക് കാണിച്ചുതരുകയും ചെയ്യുക. “ഇന്ന കാര്യം” എന്നിടത്ത് ആവശ്യപ്പെടുന്ന കാര്യം വ്യക്തമാക്കുന്നു.' : 'Servants of this noble name, undertake the task and show me such-and-such. Specify the requested matter in place of “such-and-such”.'}</p></div>}
      {chapter.figure?.image_path?.startsWith('/figures/') && <figure className="space-y-2"><a href={chapter.figure.image_path} target="_blank" rel="noreferrer"><img src={chapter.figure.image_path} alt={t(chapter.figure.caption)} loading="lazy" className="max-w-full w-96 rounded-lg mx-auto" /></a><figcaption className="text-sm text-white/70 leading-loose">{t(chapter.figure.caption)}</figcaption></figure>}
    </article>}
    {nameId === 'HNK-MHC-021' && <article className="border-t border-yellow-500/20 pt-4 space-y-3"><h3 className="text-yellow-200">{ml ? 'ഗയാഹാ–കൈദഹൂലാ സംയുക്ത വായന' : 'Ghayaha–Kaydahula paired reading'}</h3><Arabic>غَيَاهَا كَيْدَهُولَا</Arabic><ol className="list-decimal pl-6 leading-loose space-y-2 text-white/85"><li>{ml ? 'ഖൽവത്തിന്റെ നിബന്ധനകളോടെ ഈ രണ്ടു പേരുകളും തുടർച്ചയായി വായിക്കുന്ന വേറിട്ട പരാമർശമാണിത്.' : 'A separate account describes continuously reading this pair under the conditions of seclusion.'}</li><li>{ml ? 'ഓരോ നൂറ് ആവർത്തനത്തിനുശേഷവും തിജാൻ നാമങ്ങൾ ഒരുതവണ വായിക്കുന്നു. തിജാൻ അനുബന്ധം റഫറൻസിലെ പൂർണ്ണ അറബി പേജുകളിൽ ലഭ്യമാണ്.' : 'After every hundred repetitions, read the Names of the Tijan once. The Tijan supplement is available in the complete Arabic pages in the references.'}</li></ol></article>}
    {quotes.length > 0 && <section className="border-t border-yellow-500/20 pt-4 space-y-4" data-reader-section="verses"><h3 className="text-lg text-yellow-200">{ml ? 'രീതിയുമായി ബന്ധപ്പെട്ട ആയത്തുകൾ' : 'Verses connected with the method'}</h3>{quotes.map((quote, index) => <article key={index} className="space-y-2"><Arabic>{quote.arabic}</Arabic><p className="text-white/90 leading-loose">{t(quote.translation)}</p><p className="text-xs text-yellow-100/70">{quote.source_location}</p></article>)}</section>}
    {related.length > 0 && <section className="border-t border-yellow-500/20 pt-4 space-y-4" data-reader-section="duas"><h3 className="text-lg text-yellow-200">{ml ? 'ബന്ധപ്പെട്ട ദുആകളും വചനങ്ങളും' : 'Related prayers and passages'}</h3>{related.map(source => <article key={source.id} className="space-y-2"><h4 className="text-yellow-100">{t(source.title)}</h4><Arabic>{safeReading(source.arabic_reading, source.arabic_original)}</Arabic><p className="text-white/90 leading-loose">{t(source.translation)}</p><details className="text-xs text-white/60"><summary className="cursor-pointer">{ml ? 'ബന്ധവും റഫറൻസും' : 'Connection and reference'}</summary><p className="pt-2 leading-loose">{t(source.scope_note)}</p><p>{source.source_title} · {source.source_location || source.source_pages}</p></details></article>)}</section>}
    {extra.length > 0 && <details className="rounded-xl border border-yellow-500/20 p-4 space-y-4" data-reader-section="alternatives"><summary className="cursor-pointer text-yellow-200">{ml ? 'ഇതേ നാമത്തിന്റെ മറ്റു രീതികൾ' : 'Other methods for this name'} ({extra.length})</summary>{extra.map(entry => <article key={entry.id} className="border-t border-white/10 pt-3 space-y-2"><h4 className="text-yellow-100">{t(entry.title).replace(/ — ഗ്രന്ഥത്തിലെ പരാമർശം| — ഗ്രന്ഥപരാമർശം|^ഇംഗ്ലീഷ് പതിപ്പ്: /g, '')}</h4><p className="leading-loose text-white/85 whitespace-pre-wrap">{t(entry.translation)}</p><details className="text-xs text-white/55"><summary className="cursor-pointer">{ml ? 'റഫറൻസ്' : 'Reference'}</summary><p className="pt-2">{entry.source_title || chapter.source_title} · {entry.printed_page || chapter.printed_page}</p></details></article>)}</details>}
    {singlePage.accounts.some(entry => entry.name_ids.includes(nameId)) && <details className="rounded-xl border border-yellow-500/20 p-4 space-y-4"><summary className="cursor-pointer text-yellow-200">{ml ? 'അനുബന്ധ അറബി പാഠത്തിലെ രീതികൾ' : 'Methods in the supplementary Arabic text'}</summary>{singlePage.accounts.filter(entry => entry.name_ids.includes(nameId)).map(entry => <article key={entry.id} className="space-y-2 border-t border-white/10 pt-3"><h4 className="text-yellow-100">{t(entry.title)}</h4><Arabic>{entry.arabic_original}</Arabic><p className="text-white/85 leading-loose">{t(entry.translation)}</p></article>)}</details>}
    <details className="rounded-xl border border-white/15 p-4 space-y-4" data-reader-section="references"><summary className="cursor-pointer text-yellow-200">{ml ? 'റഫറൻസുകളും പാഠഭേദങ്ങളും പൂർണ്ണ മൂലപേജുകളും' : 'References, variants and complete source pages'}</summary><HolyNameReferenceChapter chapter={chapter} nameId={nameId} /></details>
  </section>;
}
