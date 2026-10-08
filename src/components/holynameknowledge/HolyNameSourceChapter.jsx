import externalSources from "@/data/holyNamesExternalSources.json";
import meaningReadings from "@/data/birhatiahMeaningReadings.json";
import { useHolyNamesLanguage } from "./HolyNamesLanguageContext";
import SourceSubjects from './SourceSubjects';
import BirhatiahSharedBookAccounts from './BirhatiahSharedBookAccounts';
import BirhatiahOutsideVariants from './BirhatiahOutsideVariants';
import BirhatiahArabicSinglePage from './BirhatiahArabicSinglePage';
import BirhatiahArabicInvocationSources from './BirhatiahArabicInvocationSources';
import BirhatiahFullSourceChapter from './BirhatiahFullSourceChapter';
import BirhatiahResearchContext from './BirhatiahResearchContext';
import BirhatiahExpandedVersions from './BirhatiahExpandedVersions';

const originalLetters = text => String(text || "").replace(/[\u064B-\u065F\u0670\u0640\s،؛؟,.]/g, "");

export default function HolyNameSourceChapter({ chapter, nameId }) {
  const { language } = useHolyNamesLanguage();
  if (!chapter || chapter.name_id !== nameId || chapter.review_status !== "checked_against_scan") return null;
  const ml = language === "ml";
  const cls = ml ? "font-malayalam" : "font-inter";
  const translated = value => (value?.[language] || "").replace(/\\n/g, '\n');
  const meaningReading = meaningReadings[nameId] && originalLetters(meaningReadings[nameId]) === originalLetters(chapter.meaning_arabic) ? meaningReadings[nameId] : null;
  const relatedExternalSources = externalSources.filter(source => source.review_status === "checked_against_digital_text" && source.related_name_ids.includes(nameId));
  return (
    <section className="rounded-xl border border-yellow-500/30 p-4 space-y-5 holy-name-reader">
      <h2 className={`${cls} text-lg text-yellow-200`}>{ml ? "ഗ്രന്ഥത്തിലെ വിശദീകരണം" : "Explanation in the source"}</h2>
      <SourceSubjects chapter={chapter} />
      <p className={`${cls} text-sm text-white/60 leading-relaxed`}>{translated(chapter.scope_note)}</p>
      <div>
        <p className="font-amiri text-3xl text-yellow-200 text-right leading-loose" lang="ar" dir="rtl">{chapter.source_name_form}</p>
        <p className={`${cls} text-sm text-white/70 leading-relaxed`}>{translated(chapter.name_note)}</p>
      </div>
      {chapter.meaning_arabic && <div className="space-y-2"><p className="font-amiri text-2xl text-right leading-loose text-yellow-200" lang="ar" dir="rtl">{meaningReading || chapter.meaning_arabic}</p><p className={`${cls} text-sm text-white/85 leading-loose`}>{translated(chapter.meaning_translation)}</p>{meaningReading && <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "വായനയ്ക്കായി ഹറകത്ത് ചേർത്തത്; മൂലപാഠം" : "Editorial reading vowels; original wording"}</summary><p className="font-amiri text-lg text-right leading-loose pt-2" lang="ar" dir="rtl">{chapter.meaning_arabic}</p></details>}</div>}
      {(chapter.practices || []).map(practice => (
        <article id={`source-${nameId}-practices-${practice.id}`} key={practice.id} className="border-t border-yellow-500/20 pt-4 space-y-3 scroll-mt-6">
          <h3 className={`${cls} text-base text-yellow-200`}>{translated(practice.title)}</h3>
          <p className="font-amiri text-xl text-right leading-loose text-white/90" dir="rtl" lang="ar">{practice.arabic_reading && originalLetters(practice.arabic_reading) === originalLetters(practice.arabic_original) ? practice.arabic_reading : practice.arabic_original}</p>
          {practice.arabic_reading && <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "ഹറകത്ത് ചേർത്ത വായന; അച്ചടിയിലെ മൂലപാഠം" : "Vowelled reading; original printed wording"}</summary><p className="font-amiri text-lg leading-loose text-right pt-2" dir="rtl" lang="ar">{practice.arabic_original}</p></details>}
          <p className={`${cls} text-sm text-white/85 leading-loose whitespace-pre-wrap`}>{translated(practice.translation)}</p>
          <dl className={`${cls} text-sm space-y-2 text-white/75`}>
            {[[ml ? "എണ്ണം" : "Count", practice.count == null ? "" : String(practice.count)], [ml ? "സമയം" : "Timing", translated(practice.timing)], [ml ? "ഗ്രന്ഥം പറയുന്ന ഫലം" : "Outcome claimed in the source", translated(practice.claim)]].map(([label, value]) => value && (
              <div key={label}><dt className="text-yellow-200/70">{label}</dt><dd className="leading-relaxed mt-1">{value}</dd></div>
            ))}
          </dl>
          <p className={`${cls} text-xs text-white/50`}>{practice.source_title || chapter.source_title} · {ml ? 'പേജ്' : 'Page'} {practice.printed_page || chapter.printed_page}</p>
        </article>
      ))}
      {(chapter.edition_accounts || []).map(account => <article id={`source-${nameId}-edition_accounts-${account.id}`} key={account.id} className="border-t border-yellow-500/20 pt-4 space-y-3 scroll-mt-6">
        <h3 className={`${cls} text-base text-yellow-200`}>{translated(account.title)}</h3>
        {account.arabic_original && <p className="font-amiri text-2xl text-right leading-loose text-yellow-200" dir="rtl" lang="ar">{account.arabic_reading && originalLetters(account.arabic_reading) === originalLetters(account.arabic_original) ? account.arabic_reading : account.arabic_original}</p>}
        <p className={`${cls} text-sm text-white/85 leading-loose`}>{translated(account.translation)}</p>
        {(account.count != null || account.timing) && <dl className={`${cls} text-sm space-y-2 text-white/75`}>
          {account.count != null && <div><dt className="text-yellow-200/70">{ml ? "എണ്ണം" : "Count"}</dt><dd>{account.count}</dd></div>}
          {account.timing && <div><dt className="text-yellow-200/70">{ml ? "സമയം" : "Timing"}</dt><dd className="leading-relaxed">{translated(account.timing)}</dd></div>}
        </dl>}
        <p className={`${cls} text-sm text-white/65 leading-relaxed`}>{translated(account.scope_note)}</p>
        <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "ഈ പതിപ്പിലെ മൂലപാഠം" : "Original in this edition"}</summary><p className="font-inter text-sm leading-relaxed pt-2" lang="en">{account.original_text}</p><p className="pt-2">{account.source_title} · {ml ? "അച്ചടിച്ച പേജ്" : "Printed page"} {account.printed_page}</p></details>
      </article>)}
      {(chapter.source_notes || []).map(note => <article id={`source-${nameId}-source_notes-${note.id}`} key={note.id} className="border-t border-yellow-500/20 pt-4 space-y-3 scroll-mt-6">
        <h3 className={`${cls} text-base text-yellow-200`}>{translated(note.title)}</h3>
        <p className={`${cls} text-sm text-white/85 leading-loose whitespace-pre-wrap`}>{translated(note.translation)}</p>
        {(note.quote_blocks || []).map((quote, index) => <div key={`${note.id}-quote-${index}`} className="space-y-2">
          <p className="font-amiri text-2xl text-right leading-loose text-yellow-200" dir="rtl" lang="ar">{quote.arabic}</p>
          <p className={`${cls} text-sm text-white/85 leading-loose`}>{translated(quote.translation)}</p>
          <p className={`${cls} text-xs text-white/50`}>{quote.source_location}</p>
        </div>)}
        <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "സ്രോതസ്സ്" : "Source"}</summary><p className="pt-2">{note.source_title} · {ml ? "അച്ചടിച്ച പേജ്" : "Printed page"} {note.printed_page}</p></details>
      </article>)}
      {(chapter.edition_figures || []).filter(figure => figure.image_path?.startsWith('/figures/')).map(figure => <figure key={figure.image_path} className="space-y-2 border-t border-yellow-500/20 pt-4"><img src={figure.image_path} alt={translated(figure.caption)} loading="lazy" className="max-w-full w-96 rounded-lg mx-auto" /><figcaption className={`${cls} text-sm text-white/70 leading-relaxed`}>{translated(figure.caption)}</figcaption><p className={`${cls} text-xs text-white/50`}>{figure.source_title} · {ml ? 'പേജ്' : 'Page'} {figure.printed_page}</p></figure>)}
      {chapter.figure?.image_path?.startsWith("/figures/") && <figure className="space-y-2"><img src={chapter.figure.image_path} alt={translated(chapter.figure.caption)} loading="lazy" className="max-w-full w-80 rounded-lg mx-auto" /><figcaption className={`${cls} text-sm text-white/70 leading-relaxed`}>{translated(chapter.figure.caption)}</figcaption></figure>}
      {chapter.edition_note && <p className={`${cls} text-sm text-white/65 leading-relaxed`}>{translated(chapter.edition_note)}</p>}
      {relatedExternalSources.map(source => (
        <article key={source.id} className="border-t border-yellow-500/20 pt-4 space-y-3">
          <h3 className={`${cls} text-base text-yellow-200`}>{translated(source.title)}</h3>
          <p className="font-amiri text-xl text-right leading-loose text-white/90" lang="ar" dir="rtl">{source.context_arabic}</p>
          <p className={`${cls} text-sm text-white/85 leading-loose`}>{translated(source.context_translation)}</p>
          <p className="font-amiri text-xl text-right leading-loose text-white/90" lang="ar" dir="rtl">{source.arabic_reading || source.arabic_original}</p>
          <p className={`${cls} text-sm text-white/85 leading-loose`}>{translated(source.translation)}</p>
          {source.arabic_reading && <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "വായനയ്ക്കായി ഹറകത്ത് ചേർത്തത്; മൂലപാഠം" : "Editorial reading vowels; original wording"}</summary><p className="font-amiri text-lg text-right leading-loose pt-2" lang="ar" dir="rtl">{source.arabic_original}</p></details>}
          <p className={`${cls} text-sm text-white/65 leading-relaxed`}>{translated(source.scope_note)}</p>
          <details className={`${cls} text-xs text-white/50`}>
            <summary className="cursor-pointer">{ml ? "സ്രോതസ്സ്" : "Source"}</summary>
            <p className="pt-2">{source.source_title}{source.source_author && ` · ${source.source_author}`}{source.source_volume && ` · ${ml ? "വാല്യം" : "Volume"} ${source.source_volume}`}{source.source_pages && ` · ${ml ? "പേജുകൾ" : "Pages"} ${source.source_pages}`}{source.source_location && ` · ${source.source_location}`}</p>
          </details>
        </article>
      ))}
      <BirhatiahSharedBookAccounts />
      <BirhatiahOutsideVariants nameId={nameId} />
      <BirhatiahArabicSinglePage nameId={nameId} />
      <BirhatiahArabicInvocationSources />
      <BirhatiahFullSourceChapter nameId={nameId} />
      <BirhatiahResearchContext nameId={nameId} />
      <BirhatiahExpandedVersions />
      <details className={`${cls} text-xs text-white/50 border-t border-white/10 pt-3`}>
        <summary className="cursor-pointer">{ml ? "സ്രോതസ്സ്" : "Source"}</summary>
        <p className="pt-2">{chapter.source_title} · {ml ? "അച്ചടിച്ച പേജ്" : "Printed page"} {chapter.printed_page}</p>
      </details>
    </section>
  );
}
