import version from "@/data/birhatiahCollectiveVersion.json";
import { useHolyNamesLanguage } from "./HolyNamesLanguageContext";

export default function BirhatiahCollectiveVersion() {
  const { language } = useHolyNamesLanguage();
  const ml = language === "ml";
  const cls = ml ? "font-malayalam" : "font-inter";
  if (version.review_status !== "checked_against_supplied_scan" || version.names.length !== 28) return null;
  return <article className="border-t border-yellow-500/20 pt-4 space-y-4">
    <h3 className={`${cls} text-lg text-yellow-200`}>{version.title[language]}</h3>
    <p className={`${cls} text-sm text-white/85 leading-loose`}>{version.introduction[language]}</p>
    <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {version.names.map(name => <li key={name.order} className="flex items-center gap-3 rounded-lg border border-yellow-500/15 px-3 py-2">
        <span className="font-inter text-xs text-white/50">{String(name.order).padStart(2, "0")}</span>
        <span className="flex-1 font-amiri text-2xl text-yellow-200 text-right leading-loose" dir="rtl" lang="ar">{name.arabic_original}</span>
        <span className="font-inter text-sm text-white/70">×{name.repetitions}</span>
      </li>)}
    </ol>
    <h4 className={`${cls} text-yellow-200`}>{ml ? "തുടർന്ന് വരുന്ന പദങ്ങൾ — അച്ചടിയിലെ അറബി രൂപം" : "Following words — printed Arabic forms"}</h4>
    <p className="font-amiri text-2xl text-right text-white/90 leading-loose" dir="rtl" lang="ar">{version.continuation_words.join(" · ")}</p>
    <p className={`${cls} text-sm text-white/85 leading-loose`}>{version.continuation_translation[language]}</p>
    <p className="font-amiri text-2xl text-right text-yellow-200 leading-loose" dir="rtl" lang="ar">{version.closing_arabic}</p>
    <p className={`${cls} text-sm text-white/85 leading-loose`}>{version.closing_translation[language]}</p>
    <details className={`${cls} text-sm text-white/65`}><summary className="cursor-pointer">{ml ? "പതിപ്പിനെക്കുറിച്ചുള്ള കുറിപ്പ്" : "Edition note"}</summary><p className="pt-2 leading-loose">{version.scope_note[language]}</p></details>
    <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "സ്രോതസ്സും ഇംഗ്ലീഷ് മൂലപാഠവും" : "Source and original English text"}</summary><div className="pt-2 space-y-3"><p>{version.source_title} · {ml ? "അച്ചടിച്ച പേജ്" : "Printed page"} {version.printed_page}</p><p className="font-inter leading-relaxed" lang="en">{version.introduction_original}</p><p className="font-inter leading-relaxed" lang="en">{version.continuation_original}</p></div></details>
  </article>;
}
