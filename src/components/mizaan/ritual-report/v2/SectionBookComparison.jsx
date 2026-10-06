import { BookOpen, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { G, T, translatePlanet, translateDay, MIZAN_DAY_NAMES, DAY_KEY_BY_INDEX, saatDisplayNum } from "../shared";
import { computeCompat, compatColor } from "./compatibility";

function cleanReason(text) {
  if (!text) return "";
  return String(text).replace(/Source\s*:.*?(\.|$)/gi, "").replace(/Astrology Clock\s*:/gi, "").split(/\n/)[0].trim();
}

export default function SectionBookComparison({ analysis, lang }) {
  const matchingRules = analysis?.matchingRules || [];
  const conflictingRules = analysis?.conflictingRules || [];
  const allRules = [...matchingRules, ...conflictingRules];
  const astro = analysis?.astroClockStatus || {};
  const liveNow = analysis?.liveNow || {};

  // Group by source (book name) — never merge books
  const byBook = {};
  for (const rule of allRules) {
    const book = rule.source || "Unknown";
    if (!byBook[book]) byBook[book] = { matching: [], conflicting: [] };
    if (rule.field === "recommended_actions" || rule.field === "friendship_actions") {
      byBook[book].matching.push(rule);
    } else {
      byBook[book].conflicting.push(rule);
    }
  }
  const books = Object.keys(byBook);

  if (books.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
        <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
            <BookOpen className="w-5 h-5" style={{ color: G.text }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>6</span>
            <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
              {T("Book Comparison", "പുസ്തക താരതം", lang)}
            </h3>
          </div>
        </div>
        <div className="p-4">
          <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.60)" }}>
            {T("No book rules found for this purpose.", "ഈ ലക്ഷ്യത്തിനായി പുസ്തക നിയമങ്ങളൊന്നുമില്ല.", lang)}
          </p>
        </div>
      </div>
    );
  }

  const currentWeekday = astro.activeWeekday;
  const currentFullSaat = (liveNow.saat || 1) + (liveNow.laylNahar === "Layl" ? 12 : 0);
  const currentPeriod = liveNow.laylNahar === "Layl" ? "night" : "day";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <BookOpen className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>6</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Book Comparison", "പുസ്തക താരതം", lang)}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {books.map((book, idx) => {
          const data = byBook[book];
          const hasMatch = data.matching.length > 0;
          const hasConflict = data.conflicting.length > 0;

          // Per-book verdict for current context
          const contextRules = [...data.matching, ...data.conflicting].filter(r =>
            r.weekday === currentWeekday && r.period === currentPeriod && r.saat_number === currentFullSaat
          );
          const ctxHasMatch = contextRules.some(r => r.field === "recommended_actions" || r.field === "friendship_actions");
          const ctxHasConflict = contextRules.some(r => r.field === "forbidden_actions" || r.field === "enemy_actions" || r.field === "warnings_list");

          let verdict, vColor, VIcon;
          if (ctxHasConflict) { verdict = T("Not Suitable", "അനുയോജ്യമല്ല", lang); vColor = "#F87171"; VIcon = XCircle; }
          else if (ctxHasMatch) { verdict = T("Suitable", "അനുയോജ്യം", lang); vColor = "#4ADE80"; VIcon = CheckCircle2; }
          else { verdict = T("No direct rule", "നേരിട്ട നിയമമില്ല", lang); vColor = "#FBBF24"; VIcon = AlertCircle; }

          // Per-book compat: use only this book's rules
          const bookAnalysis = { ...analysis, matchingRules: data.matching, conflictingRules: data.conflicting };
          const bookCompat = computeCompat(bookAnalysis).final;
          const bcColor = compatColor(bookCompat);

          // Reason from this book's rules (context-specific first, then any)
          const ruleText = (contextRules.length > 0 ? contextRules : [...data.matching, ...data.conflicting])
            .map(r => cleanReason(lang === "ml" && r.text_ml ? r.text_ml : r.text_en))
            .filter(Boolean)
            .slice(0, 1)
            .join(" ");

          return (
            <div key={`book-${idx}`} className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              {/* Book name — original language preserved */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{book}</span>
                <VIcon className="w-4 h-4 flex-shrink-0" style={{ color: vColor }} />
              </div>

              {/* Recommendation + Compat */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Recommendation", "ശുപാർശ", lang)}</p>
                  <p className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: vColor }}>{verdict}</p>
                </div>
                <div className="text-right">
                  <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Compatibility", "പൊരുത്തം", lang)}</p>
                  <p className="font-inter text-sm font-bold" style={{ color: bcColor }}>{bookCompat}%</p>
                </div>
              </div>

              {/* Reason */}
              {ruleText && (
                <p className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed" : "font-inter text-[11px] leading-relaxed"} style={{ color: "rgba(255,255,255,0.70)" }}>
                  {ruleText}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}