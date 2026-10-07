import sources from "@/data/holyNamesLexicalSources.json";
import { useHolyNamesLanguage } from "./HolyNamesLanguageContext";

export default function HolyNameLexicalNotes({ nameId }) {
  const { language } = useHolyNamesLanguage();
  const related = sources.filter(source => source.review_status === "checked_against_digital_text" && source.name_ids.includes(nameId));
  if (!related.length) return null;
  const cls = language === "ml" ? "font-malayalam" : "font-inter";
  return <section className="rounded-xl border border-yellow-500/30 p-4 space-y-4 holy-name-reader">
    <h2 className={`${cls} text-lg text-yellow-200`}>{language === "ml" ? "ഭാഷാപരമായ വിശദീകരണം" : "Lexical explanation"}</h2>
    {related.map(source => <article key={source.id} className="space-y-3">
      <p className="font-amiri text-2xl text-yellow-200 leading-loose text-right" lang="ar" dir="rtl">{source.arabic_original}</p>
      <p className={`${cls} text-sm text-white/85 leading-loose`}>{source.translation[language]}</p>
      <p className={`${cls} text-sm text-white/65 leading-loose`}>{source.explanation[language]}</p>
      <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{language === "ml" ? "സ്രോതസ്സ്" : "Source"}</summary><p className="pt-2">{source.source_title}</p></details>
    </article>)}
  </section>;
}
