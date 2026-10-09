import version from "@/data/birhatiahCollectiveVersion.json";
import bibliography from "@/data/birhatiahBibliography.json";
import { useHolyNamesLanguage } from "./HolyNamesLanguageContext";
import BirhatiahSharedBookAccounts from './BirhatiahSharedBookAccounts';
import BirhatiahArabicSinglePage from './BirhatiahArabicSinglePage';
import BirhatiahArabicInvocationSources from './BirhatiahArabicInvocationSources';
import BirhatiahFullSourceChapter from './BirhatiahFullSourceChapter';
import BirhatiahExpandedVersions from './BirhatiahExpandedVersions';
import BirhatiahResearchContext from './BirhatiahResearchContext';

export default function BirhatiahCollectiveReference() {
  const { language } = useHolyNamesLanguage();
  const ml = language === "ml";
  const cls = ml ? "font-malayalam" : "font-inter";
  const excerpt = version.arabic_source_excerpt;
  const account = version.collective_source_account;
  if (version.review_status !== "checked_against_supplied_scan" || version.names.length !== 28) return null;
  return <article className="border-t border-yellow-500/20 pt-4 space-y-4">
    <BirhatiahSharedBookAccounts />
    <BirhatiahResearchContext />
    <BirhatiahArabicSinglePage />
    <BirhatiahArabicInvocationSources />
    <BirhatiahFullSourceChapter />
    <BirhatiahExpandedVersions />
    {account?.review_status === "checked_against_scan" && <section className="rounded-xl border border-yellow-500/20 p-4 space-y-3">
      <h3 className={`${cls} text-lg text-yellow-200`}>{account.title[language]}</h3>
      <p className="font-amiri text-2xl sm:text-3xl text-right text-yellow-100 leading-[2.2]" dir="rtl" lang="ar">{account.reading}</p>
      <p className={`${cls} text-white/90 leading-loose`} lang={language}>{account.translation[language]}</p>
      <p className={`${cls} text-sm text-white/65 leading-loose`}>{account.scope_note[language]}</p>
      <section className={`${cls} text-xs text-white/50`}><h3 className="cursor-pointer">{ml ? "സ്രോതസ്സ്" : "Source"}</h3><p className="pt-2">{account.source_title} · {ml ? "പേജ്" : "Page"} {account.printed_page}</p></section>
    </section>}
    {bibliography.review_status === "checked_against_digital_text" && <section className="space-y-2">
      <h3 className={`${cls} text-base text-yellow-200`}>{ml ? "ഗ്രന്ഥത്തെക്കുറിച്ചുള്ള പുറംസ്രോതസ്സ്" : "External bibliographic context"}</h3>
      <p className={`${cls} text-sm text-white/85 leading-loose`}>{bibliography.translation[language]}</p>
      <section className={`${cls} text-xs text-white/50`}><h3 className="cursor-pointer">{ml ? "സ്രോതസ്സ്" : "Source"}</h3><p className="pt-2">{bibliography.source_title}</p></section>
    </section>}
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
    {excerpt?.review_status === "checked_against_scan" && <section className="rounded-xl border border-yellow-500/20 p-4 space-y-3">
      <h4 className={`${cls} text-yellow-200`}>{ml ? "അറബി ഗ്രന്ഥത്തിലെ അവസാന വാക്യം" : "Closing sentence in the Arabic source"}</h4>
      <p className="font-amiri text-2xl sm:text-3xl text-right text-yellow-100 leading-[2.2]" dir="rtl" lang="ar">{excerpt.reading}</p>
      <p className={`${cls} text-white/90 leading-loose`} lang={language}>{excerpt.translation[language]}</p>
      <section className={`${cls} text-sm text-white/65`}>
        <h3 className="cursor-pointer">{ml ? "ഗ്രന്ഥം പറയുന്ന പാഠപരമ്പര" : "Transmission attributed by the book"}</h3>
        <div className="pt-3 space-y-3">
          <p className="font-amiri text-xl leading-loose text-right" dir="rtl" lang="ar">{excerpt.attribution_original}</p>
          <p className="leading-loose" lang={language}>{excerpt.attribution_translation[language]}</p>
          <p className="leading-loose">{excerpt.scope_note[language]}</p>
          <p>{excerpt.source_title} · {ml ? "പേജ്" : "Page"} {excerpt.printed_page}</p>
        </div>
      </section>
    </section>}
    <section className={`${cls} text-sm text-white/65`}><h3 className="cursor-pointer">{ml ? "പതിപ്പിനെക്കുറിച്ചുള്ള കുറിപ്പ്" : "Edition note"}</h3><p className="pt-2 leading-loose">{version.scope_note[language]}</p></section>
    <section className={`${cls} text-xs text-white/50`}><h3 className="cursor-pointer">{ml ? "സ്രോതസ്സും ഇംഗ്ലീഷ് മൂലപാഠവും" : "Source and original English text"}</h3><div className="pt-2 space-y-3"><p>{version.source_title} · {ml ? "അച്ചടിച്ച പേജ്" : "Printed page"} {version.printed_page}</p><p className="font-inter leading-relaxed" lang="en">{version.introduction_original}</p><p className="font-inter leading-relaxed" lang="en">{version.continuation_original}</p></div></section>
  </article>;
}
