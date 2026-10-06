import { Sparkles } from "lucide-react";
import { G, T, saatDisplayNum, translatePlanet, translateDay, computeCompat, compatColor } from "./shared";

// FINAL DECISION — one clear, actionable sentence that follows the
// auto-advancing recommendation:
//   • Perform now — when the current Saat is suitable and still active.
//   • Wait until today's next Saat — when today still has a remaining suitable Saat.
//   • Wait until tomorrow / [weekday] — when today's suitable Saats have passed.
//   • Avoid — when forbidden or no opportunity exists.
export default function FinalDecision({ analysis, liveRecommendation, lang }) {
  const suitable = analysis?.selectionAnalysis?.suitable || false;
  const compat = computeCompat(analysis).final;
  const cColor = compatColor(compat);
  const r = liveRecommendation;

  // Are we currently inside the recommended Saat? If the live recommendation
  // is today AND its hour matches the current Saat, the current moment is the
  // recommendation → "Perform now." Once that Saat passes, the recommendation
  // advances and this becomes false → "Wait until…".
  const liveNow = analysis?.liveNow || {};
  const currentSaat = liveNow.saat;
  const currentPeriod = liveNow.laylNahar === "Layl" ? "night" : "day";
  const currentHourNumber = currentPeriod === "night" ? (currentSaat || 1) + 12 : (currentSaat || 1);
  const inCurrentSaat = !!(r && r.isToday && r.hour === currentHourNumber && r.period === currentPeriod);

  let actionEn, actionMl;
  if (suitable && inCurrentSaat) {
    actionEn = "Perform now."; actionMl = "ഇപ്പോൾ ചെയ്യുക.";
  } else if (r) {
    const saatStr = `#${saatDisplayNum(r.hour, r.period)} · ${translatePlanet(r.planet, lang)}`;
    if (r.isToday) {
      actionEn = `Wait until today's next Saat (${saatStr}).`;
      actionMl = `ഇന്നത്തെ അടുത്ത സഅാത്തിനായി കാത്തിരിക്കുക (${saatStr}).`;
    } else if (r.daysAhead === 1) {
      actionEn = `Wait until tomorrow — Saat ${saatStr}.`;
      actionMl = `നാളെ വരെ കാത്തിരിക്കുക — സഅാത് ${saatStr}.`;
    } else {
      actionEn = `Wait until ${translateDay(r.dayName, lang)} — Saat ${saatStr}.`;
      actionMl = `${translateDay(r.dayName, lang)} വരെ കാത്തിരിക്കുക — സഅാത് ${saatStr}.`;
    }
  } else if (analysis?.selectionAnalysis?.forbidden) {
    actionEn = "Avoid this planetary hour."; actionMl = "ഈ ഗ്രഹ മണിക്കൂർ ഒഴിവാക്കുക.";
  } else {
    actionEn = "Avoid today."; actionMl = "ഇന്ന് ഒഴിവാക്കുക.";
  }

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${cColor}`,
        boxShadow: `0 0 32px ${cColor}22, inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}>
      <div className="flex items-center gap-3 p-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cColor}14`, border: `1px solid ${cColor}40` }}>
          <Sparkles className="w-6 h-6" style={{ color: cColor }} />
        </div>
        <div className="flex-1">
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Final Decision", "അന്തിമ തീരുമാനം", lang)}</p>
          <p className={lang === "ml" ? "font-malayalam text-sm font-bold leading-snug" : "font-inter text-sm font-bold leading-snug"} style={{ color: "#fff" }}>
            {lang === "ml" ? actionMl : actionEn}
          </p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="font-inter text-2xl font-bold" style={{ color: cColor }}>{compat}%</p>
        </div>
      </div>
    </div>
  );
}