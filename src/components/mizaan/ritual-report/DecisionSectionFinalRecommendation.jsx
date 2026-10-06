// ═══════════════════════════════════════════════════════════════
// SECTION 8 — FINAL RECOMMENDATION
// One practical recommendation + evidence. Short.
// ═══════════════════════════════════════════════════════════════
import { Sparkles } from "lucide-react";
import { G, T, translatePlanet, translateDay, saatDisplayNum, DAY_KEY_BY_INDEX } from "./shared";

function computeCompatibility(analysis) {
  const req = analysis?.req || {};
  const liveNow = analysis?.liveNow || {};
  const astro = analysis?.astroClockStatus || {};
  const planetLC = String(liveNow.kawkab || liveNow.planetaryHour || "").toLowerCase();
  const dayKey = DAY_KEY_BY_INDEX[astro.activeWeekday];
  let s = 50;
  if (req.days?.includes(dayKey)) s += 20;
  if (req.hours?.some((p) => p.toLowerCase() === planetLC)) s += 20;
  if (req.nightRequired === true && liveNow.laylNahar === "Layl") s += 10;
  if (req.enemyPlanets?.some((p) => p.toLowerCase() === planetLC)) s -= 25;
  if (req.worstHours?.some((p) => p.toLowerCase() === planetLC)) s -= 15;
  if (req.worstDays?.includes(dayKey)) s -= 15;
  return Math.max(0, Math.min(100, s));
}

export default function DecisionSectionFinalRecommendation({ analysis, resolvedPurpose, lang }) {
  const verdict = analysis?.verdict || "Not Suitable";
  const canPerform = analysis?.canPerformToday || "No";
  const breakdown = analysis?.selectionAnalysis?.decisionBreakdown || [];
  const failedItems = breakdown.filter((b) => b.status === "fail");
  const isSuitable = (verdict === "Suitable" && failedItems.length === 0) || (verdict === "Suitable" && canPerform === "Yes");

  const compatPct = computeCompatibility(analysis);
  const liveNow = analysis?.liveNow || {};
  const purposeText = (lang === "ml" ? resolvedPurpose?.interpretation_ml : resolvedPurpose?.interpretation_en) || analysis?.ritualType || "";

  const betterSaats = analysis?.betterAlternatives?.betterSaats || [];
  const nextOpp = analysis?.nextOpportunity || null;
  const matchingRules = analysis?.matchingRules || [];
  const evidenceBook = matchingRules[0]?.source || "";

  // Build recommendation
  let recommendation = "";
  if (isSuitable) {
    recommendation = T(
      `Your selected Purpose is ${purposeText}. Current compatibility is ${compatPct}%. Proceed now.`,
      `നിങ്ങളുടെ ലക്ഷ്യം ${purposeText}. നിലവിലെ പൊരുത്തം ${compatPct}%. ഇപ്പോൾ തുടരുക.`,
      lang
    );
  } else {
    const bestSaat = betterSaats[0];
    if (bestSaat) {
      const sn = bestSaat.saatNum || saatDisplayNum(bestSaat.hourNumber || bestSaat.hour, bestSaat.period);
      recommendation = T(
        `Your selected Purpose is ${purposeText}. Current compatibility is only ${compatPct}%. Change to Saat #${sn} today for stronger compatibility.`,
        `നിങ്ങളുടെ ലക്ഷ്യം ${purposeText}. നിലവിലെ പൊരുത്തം ${compatPct}% മാത്രം. കൂടുതൽ പൊരുത്തത്തിനായി ഇന്ന് സഅാത് #${sn} ഉപയോഗിക്കുക.`,
        lang
      );
    } else if (nextOpp) {
      const sn = saatDisplayNum(nextOpp.hour, nextOpp.period);
      recommendation = T(
        `Your selected Purpose is ${purposeText}. Current compatibility is only ${compatPct}%. Use ${nextOpp.dayName} Saat #${sn} (${nextOpp.planet}).`,
        `നിങ്ങളുടെ ലക്ഷ്യം ${purposeText}. നിലവിലെ പൊരുത്തം ${compatPct}% മാത്രം. ${translateDay(nextOpp.dayName, lang)} സഅാത് #${sn} (${translatePlanet(nextOpp.planet, lang)}) ഉപയോഗിക്കുക.`,
        lang
      );
    } else {
      recommendation = T(
        `Your selected Purpose is ${purposeText}. Current compatibility is only ${compatPct}%. No better timing found within 14 days.`,
        `നിങ്ങളുടെ ലക്ഷ്യം ${purposeText}. നിലവിലെ പൊരുത്തം ${compatPct}% മാത്രം. 14 ദിവസത്തിനുള്ളിൽ മികച്ച സമയമില്ല.`,
        lang
      );
    }
  }

  // Fallback evidence
  const fallbackEvidence = evidenceBook || T("Uploaded database", "അപ്ലോഡ് ചെയ്ത ഡാറ്റാബേസ്", lang);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.borderHi}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <Sparkles className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>8</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Final Recommendation", "അന്തിമ ശുപാർശ", lang)}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="rounded-xl p-4" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
          <p className={lang === "ml" ? "font-malayalam text-sm leading-relaxed font-bold" : "font-inter text-sm leading-relaxed font-bold"} style={{ color: "#fff" }}>
            {recommendation}
          </p>
        </div>
        <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <span className="font-inter text-[10px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>
            {T("Evidence", "തെളിവ്", lang)}:{" "}
          </span>
          <span className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: G.text }}>
            {fallbackEvidence}
          </span>
        </div>
      </div>
    </div>
  );
}