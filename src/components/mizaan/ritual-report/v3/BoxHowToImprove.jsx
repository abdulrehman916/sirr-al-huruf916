import { TrendingUp, ArrowDown } from "lucide-react";
import { G, T, Box, translatePlanet, translateDay, saatDisplayNum, computeCompat, compatColor, DAY_KEY_BY_INDEX, MIZAN_DAY_NAMES } from "./shared";

// BOX 7 — HOW TO IMPROVE (step-by-step GPS progression)
// Shows the path from Current → Change weekday → Change Saat → Change Planet
// → Best possible result, with the compatibility % after EACH step.
// Every % comes from the existing computeCompat with overrides (read-only).
export default function BoxHowToImprove({ analysis, lang }) {
  const req = analysis?.req || {};
  const current = computeCompat(analysis).final;
  const bestWindows = analysis?.bestWindowsToday || [];
  const nextOpp = analysis?.nextOpportunity || null;
  const liveNow = analysis?.liveNow || {};

  // ── Resolve the best target day / saat / planet from existing data ──
  const bestDay = req.days?.[0]
    || (bestWindows[0] ? DAY_KEY_BY_INDEX[analysis?.astroClockStatus?.activeWeekday] : null)
    || (nextOpp ? nextOpp.dayKey : null);
  const bestPeriod = bestWindows[0]?.period || nextOpp?.period || null;
  const bestSaat = bestWindows[0]?.hourNumber || nextOpp?.hour || null;
  const bestPlanet = bestWindows[0]?.planet || nextOpp?.planet || null;

  if (!bestDay && !bestSaat) {
    return (
      <Box number={7} titleEn="How to Improve" titleMl="എങ്ങനെ മെച്ചപ്പെടുത്താം" icon={TrendingUp} lang={lang}>
        <p className={lang === "ml" ? "font-malayalam text-sm" : "font-inter text-sm"} style={{ color: "rgba(255,255,255,0.60)" }}>
          {T("No improvement opportunity found in the uploaded books.", "അപ്‌ലോഡ് ചെയ്ത പുസ്തകങ്ങളിൽ മെച്ചപ്പെടൽ അവസരമൊന്നുമില്ല.", lang)}
        </p>
      </Box>
    );
  }

  // ── Compute compatibility after each step (read-only overrides) ──
  const curDayKey = DAY_KEY_BY_INDEX[analysis?.astroClockStatus?.activeWeekday];
  const afterDay = bestDay ? computeCompat(analysis, { dayKey: bestDay }).final : current;
  const afterSaat = (bestDay && bestPeriod && bestSaat)
    ? computeCompat(analysis, { dayKey: bestDay, period: bestPeriod, saatNumber: bestSaat }).final
    : afterDay;
  const afterPlanet = (bestDay && bestPeriod && bestSaat && bestPlanet)
    ? computeCompat(analysis, { dayKey: bestDay, period: bestPeriod, saatNumber: bestSaat, planetLC: String(bestPlanet).toLowerCase() }).final
    : afterSaat;

  const best = afterPlanet;
  const bestColor = compatColor(best);
  const increase = best - current;

  // ── Build the step list ──
  const steps = [];
  if (bestDay && bestDay !== curDayKey && req.days) {
    steps.push({ labelEn: "Change weekday", labelMl: "ദിവസം മാറ്റുക", value: translateDay(MIZAN_DAY_NAMES[bestDay] || bestDay, lang), pct: afterDay });
  }
  if (bestSaat) {
    steps.push({ labelEn: "Change Saat", labelMl: "സഅാത് മാറ്റുക", value: `#${saatDisplayNum(bestSaat, bestPeriod)} · ${translatePlanet(bestPlanet, lang)}`, pct: afterSaat });
  }
  if (bestPlanet) {
    steps.push({ labelEn: "Change Planet", labelMl: "ഗ്രഹം മാറ്റുക", value: translatePlanet(bestPlanet, lang), pct: afterPlanet });
  }

  return (
    <Box number={7} titleEn="How to Improve" titleMl="എങ്ങനെ മെച്ചപ്പെടുത്താം" icon={TrendingUp} lang={lang}>
      {/* CONCLUSION FIRST */}
      <div className="rounded-xl p-3 mb-3 flex items-center justify-between" style={{ background: `${bestColor}12`, border: `1px solid ${bestColor}50` }}>
        <div>
          <p className="font-inter text-sm font-bold" style={{ color: bestColor }}>{T("Best possible result", "മികച്ച ഫലം", lang)}: {best}%</p>
          {increase > 0 && <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>+{increase}% {T("from current", "നിലവിൽ നിന്ന്", lang)}</p>}
        </div>
        <div className="text-center">
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Current", "നിലവിൽ", lang)}</p>
          <p className="font-inter text-xl font-bold" style={{ color: compatColor(current) }}>{current}%</p>
        </div>
      </div>

      {/* STEP-BY-STEP PATH */}
      <div>
        <div className="rounded-lg p-2.5 text-center" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Current", "നിലവിൽ", lang)}</p>
          <p className="font-inter text-base font-bold" style={{ color: compatColor(current) }}>{current}%</p>
        </div>
        {steps.map((s, i) => (
          <div key={i}>
            <div className="flex justify-center py-1"><ArrowDown className="w-4 h-4" style={{ color: G.dim }} /></div>
            <div className="rounded-lg p-2.5 flex items-center justify-between" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <div>
                <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T(s.labelEn, s.labelMl, lang)}</p>
                {s.value && <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{s.value}</p>}
              </div>
              <p className="font-inter text-sm font-bold" style={{ color: compatColor(s.pct) }}>{s.pct}%</p>
            </div>
          </div>
        ))}
        <div className="flex justify-center py-1"><ArrowDown className="w-4 h-4" style={{ color: bestColor }} /></div>
        <div className="rounded-lg p-2.5 text-center" style={{ background: `${bestColor}12`, border: `1px solid ${bestColor}50` }}>
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Best possible result", "മികച്ച ഫലം", lang)}</p>
          <p className="font-inter text-lg font-bold" style={{ color: bestColor }}>{best}% {increase > 0 ? `(+${increase}%)` : ""}</p>
        </div>
      </div>
    </Box>
  );
}