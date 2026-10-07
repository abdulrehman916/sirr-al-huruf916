import { useHolyNamesLanguage } from "./HolyNamesLanguageContext";

export default function HolyNameSourceChapter({ chapter, nameId }) {
  const { language } = useHolyNamesLanguage();
  if (!chapter || chapter.name_id !== nameId || chapter.review_status !== "checked_against_scan") return null;
  const ml = language === "ml";
  const cls = ml ? "font-malayalam" : "font-inter";
  const translated = value => value?.[language] || "";
  return (
    <section className="rounded-xl border border-yellow-500/30 p-4 space-y-5 holy-name-reader">
      <h2 className={`${cls} text-lg text-yellow-200`}>{ml ? "ഗ്രന്ഥത്തിലെ വിശദീകരണം" : "Explanation in the source"}</h2>
      <p className={`${cls} text-sm text-white/60 leading-relaxed`}>{translated(chapter.scope_note)}</p>
      <div>
        <p className="font-amiri text-3xl text-yellow-200 text-right leading-loose" lang="ar" dir="rtl">{chapter.source_name_form}</p>
        <p className={`${cls} text-sm text-white/70 leading-relaxed`}>{translated(chapter.name_note)}</p>
      </div>
      {chapter.meaning_arabic && <div className="space-y-2"><p className="font-amiri text-2xl text-right leading-loose text-yellow-200" lang="ar" dir="rtl">{chapter.meaning_arabic}</p><p className={`${cls} text-sm text-white/85 leading-loose`}>{translated(chapter.meaning_translation)}</p></div>}
      {(chapter.practices || []).map(practice => (
        <article key={practice.id} className="border-t border-yellow-500/20 pt-4 space-y-3">
          <h3 className={`${cls} text-base text-yellow-200`}>{translated(practice.title)}</h3>
          <p className="font-amiri text-xl text-right leading-loose text-white/90" dir="rtl" lang="ar">{practice.arabic_original}</p>
          <p className={`${cls} text-sm text-white/85 leading-loose whitespace-pre-wrap`}>{translated(practice.translation)}</p>
          <dl className={`${cls} text-sm space-y-2 text-white/75`}>
            {[[ml ? "എണ്ണം" : "Count", practice.count == null ? "" : String(practice.count)], [ml ? "സമയം" : "Timing", translated(practice.timing)], [ml ? "ഗ്രന്ഥം പറയുന്ന ഫലം" : "Outcome claimed in the source", translated(practice.claim)]].map(([label, value]) => value && (
              <div key={label}><dt className="text-yellow-200/70">{label}</dt><dd className="leading-relaxed mt-1">{value}</dd></div>
            ))}
          </dl>
        </article>
      ))}
      {chapter.figure?.image_path?.startsWith("/figures/") && <figure className="space-y-2"><img src={chapter.figure.image_path} alt={translated(chapter.figure.caption)} loading="lazy" className="max-w-full w-80 rounded-lg mx-auto" /><figcaption className={`${cls} text-sm text-white/70 leading-relaxed`}>{translated(chapter.figure.caption)}</figcaption></figure>}
      {chapter.edition_note && <p className={`${cls} text-sm text-white/65 leading-relaxed`}>{translated(chapter.edition_note)}</p>}
      <details className={`${cls} text-xs text-white/50 border-t border-white/10 pt-3`}>
        <summary className="cursor-pointer">{ml ? "സ്രോതസ്സ്" : "Source"}</summary>
        <p className="pt-2">{chapter.source_title} · {ml ? "അച്ചടിച്ച പേജ്" : "Printed page"} {chapter.printed_page}</p>
      </details>
    </section>
  );
}
