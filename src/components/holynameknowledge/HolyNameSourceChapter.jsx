import externalSources from "@/data/holyNamesExternalSources.json";
import meaningReadings from "@/data/birhatiahMeaningReadings.json";
import { useHolyNamesLanguage } from "./HolyNamesLanguageContext";

const originalLetters = text => String(text || "").replace(/[\u064B-\u065F\u0670\u0640\s،؛؟,.]/g, "");

export default function HolyNameSourceChapter({ chapter, nameId }) {
  const { language } = useHolyNamesLanguage();
  if (!chapter || chapter.name_id !== nameId || chapter.review_status !== "checked_against_scan") return null;
  const ml = language === "ml";
  const cls = ml ? "font-malayalam" : "font-inter";
  const translated = value => value?.[language] || "";
  const meaningReading = meaningReadings[nameId] && originalLetters(meaningReadings[nameId]) === originalLetters(chapter.meaning_arabic) ? meaningReadings[nameId] : null;
  const relatedExternalSources = externalSources.filter(source => source.review_status === "checked_against_digital_text" && source.related_name_ids.includes(nameId));
  return (
    <section className="rounded-xl border border-yellow-500/30 p-4 space-y-5 holy-name-reader">
      <h2 className={`${cls} text-lg text-yellow-200`}>{ml ? "ഗ്രന്ഥത്തിലെ വിശദീകരണം" : "Explanation in the source"}</h2>
      <p className={`${cls} text-sm text-white/60 leading-relaxed`}>{translated(chapter.scope_note)}</p>
      <div>
        <p className="font-amiri text-3xl text-yellow-200 text-right leading-loose" lang="ar" dir="rtl">{chapter.source_name_form}</p>
        <p className={`${cls} text-sm text-white/70 leading-relaxed`}>{translated(chapter.name_note)}</p>
      </div>
      {chapter.meaning_arabic && <div className="space-y-2"><p className="font-amiri text-2xl text-right leading-loose text-yellow-200" lang="ar" dir="rtl">{meaningReading || chapter.meaning_arabic}</p><p className={`${cls} text-sm text-white/85 leading-loose`}>{translated(chapter.meaning_translation)}</p>{meaningReading && <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "വായനയ്ക്കായി ഹറകത്ത് ചേർത്തത്; മൂലപാഠം" : "Editorial reading vowels; original wording"}</summary><p className="font-amiri text-lg text-right leading-loose pt-2" lang="ar" dir="rtl">{chapter.meaning_arabic}</p></details>}</div>}
      {(chapter.practices || []).map(practice => (
        <article key={practice.id} className="border-t border-yellow-500/20 pt-4 space-y-3">
          <h3 className={`${cls} text-base text-yellow-200`}>{translated(practice.title)}</h3>
          <p className="font-amiri text-xl text-right leading-loose text-white/90" dir="rtl" lang="ar">{practice.arabic_reading || practice.arabic_original}</p>
          {practice.arabic_reading && <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "ഹറകത്ത് ചേർത്ത വായന; അച്ചടിയിലെ മൂലപാഠം" : "Vowelled reading; original printed wording"}</summary><p className="font-amiri text-lg leading-loose text-right pt-2" dir="rtl" lang="ar">{practice.arabic_original}</p></details>}
          <p className={`${cls} text-sm text-white/85 leading-loose whitespace-pre-wrap`}>{translated(practice.translation)}</p>
          <dl className={`${cls} text-sm space-y-2 text-white/75`}>
            {[[ml ? "എണ്ണം" : "Count", practice.count == null ? "" : String(practice.count)], [ml ? "സമയം" : "Timing", translated(practice.timing)], [ml ? "ഗ്രന്ഥം പറയുന്ന ഫലം" : "Outcome claimed in the source", translated(practice.claim)]].map(([label, value]) => value && (
              <div key={label}><dt className="text-yellow-200/70">{label}</dt><dd className="leading-relaxed mt-1">{value}</dd></div>
            ))}
          </dl>
        </article>
      ))}
      {(chapter.edition_accounts || []).map(account => <article key={account.id} className="border-t border-yellow-500/20 pt-4 space-y-3">
        <h3 className={`${cls} text-base text-yellow-200`}>{translated(account.title)}</h3>
        <p className={`${cls} text-sm text-white/85 leading-loose`}>{translated(account.translation)}</p>
        <p className={`${cls} text-sm text-white/65 leading-relaxed`}>{translated(account.scope_note)}</p>
        <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "ഈ പതിപ്പിലെ മൂലപാഠം" : "Original in this edition"}</summary><p className="font-inter text-sm leading-relaxed pt-2" lang="en">{account.original_text}</p><p className="pt-2">{account.source_title} · {ml ? "അച്ചടിച്ച പേജ്" : "Printed page"} {account.printed_page}</p></details>
      </article>)}
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
      <details className={`${cls} text-xs text-white/50 border-t border-white/10 pt-3`}>
        <summary className="cursor-pointer">{ml ? "സ്രോതസ്സ്" : "Source"}</summary>
        <p className="pt-2">{chapter.source_title} · {ml ? "അച്ചടിച്ച പേജ്" : "Printed page"} {chapter.printed_page}</p>
      </details>
    </section>
  );
}
