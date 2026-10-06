// ═══════════════════════════════════════════════════════════════
// SECTION 2 — EVIDENCE (PER-BOOK VERDICT)
// For each book: per-book verdict (✅/❌/⚠) for current selection,
// which exact rule caused it, short explanation.
// Never merge different books.
// ═══════════════════════════════════════════════════════════════
import { BookOpen, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { G, T, translatePlanet, translateDay, MIZAN_DAY_NAMES, DAY_KEY_BY_INDEX, saatDisplayNum } from "./shared";

function cleanReason(text) {
  if (!text) return "";
  return String(text).replace(/Source\s*:.*?(\.|$)/gi, "").replace(/Astrology Clock\s*:/gi, "").split(/\n/)[0].trim();
}

export default function DecisionSectionEvidence({ analysis, lang }) {
  const matchingRules = analysis?.matchingRules || [];
  const conflictingRules = analysis?.conflictingRules || [];
  const allRules = [...matchingRules, ...conflictingRules];
  const liveNow = analysis?.liveNow || {};
  const astro = analysis?.astroClockStatus || {};

  const currentWeekday = astro.activeWeekday;
  const currentFullSaat = (liveNow.saat || 1) + (liveNow.laylNahar === "Layl" ? 12 : 0);
  const currentPeriod = liveNow.laylNahar === "Layl" ? "night" : "day";

  // Group by source (book name)
  const byBook = {};
  for (const rule of allRules) {
    const book = rule.source || "Unknown";
    if (!byBook[book]) byBook[book] = [];
    byBook[book].push(rule);
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
            <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>2</span>
            <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
              {T("Evidence", "തെളിവ്", lang)}
            </h3>
          </div>
        </div>
        <div className="p-4">
          <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.60)" }}>
            {T("No matching rules found in the uploaded database for this purpose.", "ഈ ലക്ഷ്യത്തിനായി അപ്ലോഡ് ചെയ്ത ഡാറ്റാബേസിൽ പൊരുത്തമുള്ള നിയമങ്ങളൊന്നുമില്ല.", lang)}
          </p>
        </div>
      </div>
    );
  }

  // Per-book verdict for current selection
  function bookVerdict(rules) {
    const contextRules = rules.filter((r) =>
      r.weekday === currentWeekday && r.period === currentPeriod && r.saat_number === currentFullSaat
    );
    if (contextRules.length === 0) return "neutral";
    const hasRecommended = contextRules.some((r) => r.field === "recommended_actions" || r.field === "friendship_actions");
    const hasForbidden = contextRules.some((r) => r.field === "forbidden_actions" || r.field === "enemy_actions" || r.field === "warnings_list");
    if (hasForbidden) return "forbidden";
    if (hasRecommended) return "suitable";
    return "neutral";
  }

  const verdictMap = {
    suitable: { color: "#4ADE80", Icon: CheckCircle2, label: T("Suitable", "അനുയോജ്യം", lang), emoji: "✅" },
    forbidden: { color: "#F87171", Icon: XCircle, label: T("Not Suitable", "അനുയോജ്യമല്ല", lang), emoji: "❌" },
    neutral: { color: "#FBBF24", Icon: AlertCircle, label: T("No direct rule", "നേരിട്ട നിയമമില്ല", lang), emoji: "⚠" },
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <BookOpen className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>2</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Evidence", "തെളിവ്", lang)}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {books.map((book, idx) => {
          const rules = byBook[book];
          const bv = bookVerdict(rules);
          const vd = verdictMap[bv];
          const contextRules = rules.filter((r) =>
            r.weekday === currentWeekday && r.period === currentPeriod && r.saat_number === currentFullSaat
          );
          const ruleText = (contextRules.length > 0 ? contextRules : rules)
            .map((r) => cleanReason(lang === "ml" && r.text_ml ? r.text_ml : r.text_en))
            .filter(Boolean)
            .slice(0, 1)
            .join(" ");

          return (
            <div key={`evidence-${idx}`} className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <div className="mb-1.5">
                <span className="font-inter text-[10px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>{T("Source", "ഉറവിടം", lang)}: </span>
                <span className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: "#fff" }}>{book}</span>
              </div>
              {ruleText && (
                <div>
                  <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Rule", "നിയമം", lang)}: </span>
                  <span className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed" : "font-inter text-[11px] leading-relaxed"} style={{ color: "rgba(255,255,255,0.75)" }}>{ruleText}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}