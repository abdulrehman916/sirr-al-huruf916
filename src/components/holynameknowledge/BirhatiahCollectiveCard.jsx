import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useHolyNamesLanguage } from "./HolyNamesLanguageContext";
import externalSources from "@/data/holyNamesExternalSources.json";

// The collective text has its own card; never attach it as an individual
// name's prayer or silently substitute the current card list for a manuscript.
export default function BirhatiahCollectiveCard({ cards }) {
  const [open, setOpen] = useState(false);
  const { language } = useHolyNamesLanguage();
  const ml = language === "ml";
  const cls = ml ? "font-malayalam" : "font-inter";
  const ordered = [...cards].sort((a, b) => Number(a.order_index) - Number(b.order_index));
  const completeList = ordered.length === 28 && new Set(ordered.map(c => c.name_id)).size === 28;
  const source = externalSources.find(s => s.id === "mundhiri-collective-241-242" && s.review_status === "checked_against_digital_text");
  return <section className="rounded-2xl border border-yellow-500/40 bg-yellow-500/5 overflow-hidden" data-testid="birhatiah-collective-card">
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open} className="w-full p-4 flex items-center justify-between gap-3 text-left">
      <span className="space-y-1"><span className="block font-amiri text-2xl text-yellow-200" lang="ar" dir="rtl">الدعوة البرهتية</span><span className={`block ${cls} text-base text-white`}>{ml ? "ബർഹത്തിയ മന്ത്രം / സംയുക്ത ദുആ" : "Birhatiah invocation / collective prayer"}</span></span>
      <ChevronDown className={`w-5 h-5 text-yellow-200 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="border-t border-yellow-500/20 p-4 space-y-5">
      <p className={`${cls} text-sm text-white/80 leading-loose`}>{ml ? "ഇത് വ്യക്തിഗത നാമങ്ങളുടെ കാർഡുകളിൽനിന്ന് വേർതിരിച്ച സംയുക്ത പാഠത്തിനുള്ള കാർഡാണ്. ഇപ്പോൾ ഒത്തുനോക്കിയ സമാപനഭാഗം താഴെ നൽകിയിരിക്കുന്നു. നീണ്ട മന്ത്രത്തിന്റെ മുഴുവൻ പതിപ്പുകളുടെ അക്ഷരപരിശോധനയും വിവർത്തനവും പൂർത്തിയായിട്ടില്ല; ഈ ഭാഗത്തെ പൂർണ്ണ മന്ത്രമെന്ന് വിളിക്കുന്നില്ല." : "This card separates collective material from the individual names. A checked closing passage is provided below. Letter-by-letter review and translation of the full long versions remain incomplete; this passage is not labelled the complete invocation."}</p>
      {completeList && <div className="space-y-3">
        <h3 className={`${cls} text-yellow-200`}>{ml ? "നിലവിലെ 28 നാമങ്ങളുടെ ക്രമം" : "Order of the current 28 name cards"}</h3>
        <p className="font-amiri text-2xl text-right leading-loose text-white/90" dir="rtl" lang="ar">{ordered.map(c => c.canonical_arabic_name || c.arabic_name).join(" · ")}</p>
        <p className={`${cls} text-xs text-white/60 leading-relaxed`}>{ml ? "ഇത് നിലവിലെ കാർഡുകളിലെ പേരുകളുടെ പട്ടികയാണ്. ഒരു പുസ്തകത്തിലെ പൂർണ്ണ മന്ത്രത്തിന്റെ അക്ഷരാർഥ പകർപ്പല്ല. മന്ത്രത്തിലെ ഇരട്ട ആവർത്തനമോ നിശ്ചിത ഓതൽഎണ്ണമോ ഇതിൽനിന്ന് അനുമാനിക്കരുത്." : "This lists the names in the current cards; it is not a verbatim transcription of a book’s complete invocation. It does not establish doubled repetitions or a recitation count."}</p>
      </div>}
      {source && <article className="space-y-3">
        <h3 className={`${cls} text-yellow-200`}>{source.title[language]}</h3>
        <p className="font-amiri text-xl text-right leading-loose text-yellow-200" lang="ar" dir="rtl">{source.context_arabic}</p>
        <p className={`${cls} text-sm text-white/85 leading-loose`}>{source.context_translation[language]}</p>
        <p className="font-amiri text-2xl text-right leading-loose text-white/90" lang="ar" dir="rtl">{source.arabic_reading || source.arabic_original}</p>
        <p className={`${cls} text-sm text-white/85 leading-loose`}>{source.translation[language]}</p>
        {source.arabic_reading && <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "വായനയ്ക്കായി ഹറകത്ത് ചേർത്തത്; മൂലപാഠം" : "Editorial reading vowels; original wording"}</summary><p className="font-amiri text-lg text-right leading-loose pt-2" lang="ar" dir="rtl">{source.arabic_original}</p></details>}
        <p className={`${cls} text-sm text-white/65 leading-relaxed`}>{ml ? "ഈ ഭാഗം പ്രത്യേക സമയം, ഓതൽഎണ്ണം, കളത്തിന്റെ സംഖ്യകൾ എന്നിവ നൽകുന്നില്ല. പേരുകൾക്കുള്ള മുഴുവൻ സംയുക്ത നിർദേശമായി ഇത് ഉപയോഗിച്ചിട്ടില്ല." : "This passage supplies no specific time, repetition count or square values. It is not used as a complete collective prescription."}</p>
        <details className={`${cls} text-xs text-white/50`}><summary className="cursor-pointer">{ml ? "സ്രോതസ്സ്" : "Source"}</summary><p className="pt-2">{source.source_title} · {source.source_author} · {source.source_volume} · {source.source_pages}</p></details>
      </article>}
      <p className={`${cls} text-sm text-white/65 leading-relaxed`}>{ml ? "പകർപ്പുകളുടെ എണ്ണം സ്വതന്ത്ര സ്ഥിരീകരണങ്ങളുടെ എണ്ണമല്ല. ആരൊക്കെ ഉദ്ധരിച്ചുവെന്ന് കൃത്യമായ ഗ്രന്ഥപരാമർശത്തോടെ രേഖപ്പെടുത്തും; സ്ഥിരീകരിക്കാത്ത വ്യക്തികളുടെ എണ്ണം നൽകിയിട്ടില്ല." : "Copy counts are not counts of independent attestations. Attributions require precise book references; no unsupported number of authorities is supplied."}</p>
    </div>}
  </section>;
}
