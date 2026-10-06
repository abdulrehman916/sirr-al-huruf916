import { TrendingUp, RotateCcw } from "lucide-react";
import { G, T, Box, translatePlanet, translateDay, saatDisplayNum, computeCompat, compatColor, DAY_KEY_BY_INDEX, MIZAN_DAY_NAMES } from "../v3/shared";

// CARD 4 — HOW TO MAKE THIS RITUAL STRONGER (interactive)
// Recommendations come ONLY from uploaded book rules (req.days / req.hours /
// nightRequired). Each recommendation is a clickable button. Selecting one
// overrides the corresponding Mizan field locally; the engine re-runs with the
// new value and the ENTIRE report (all 6 cards) recalculates live. No engine
// or calculation change — only the input selections change.
export default function CardHowToImprove({ analysis, override, onApply, onReset, lang }) {
  const req = analysis?.req || {};
  const current = computeCompat(analysis).final;
  const bestWindows = analysis?.bestWindowsToday || [];
  const nextOpp = analysis?.nextOpportunity || null;
  const liveNow = analysis?.liveNow || {};
  const curDayKey = DAY_KEY_BY_INDEX[analysis?.astroClockStatus?.activeWeekday];

  const bestDay = req.days?.[0] || nextOpp?.dayKey || null;
  const bestPeriod = bestWindows[0]?.period || nextOpp?.period || null;
  const bestSaat = bestWindows[0]?.hourNumber || nextOpp?.hour || null;
  const bestPlanet = bestWindows[0]?.planet || nextOpp?.planet || null;

  const bestPct = (bestDay && bestPeriod && bestSaat)
    ? computeCompat(analysis, { dayKey: bestDay, period: bestPeriod, saatNumber: bestSaat, planetLC: String(bestPlanet || "").toLowerCase() }).final
    : computeCompat(analysis, { dayKey: bestDay }).final;
  const bestColor = compatColor(bestPct);

  // Each recommendation shows the target % it reaches (computed read-only via
  // computeCompat) and appears ONLY if it improves on the current %. Clicking
  // applies the override → the engine re-runs → the report recomputes live, so
  // the next recommendation's target is computed on the new (higher) base.
  const dayAfter = bestDay ? computeCompat(analysis, { dayKey: bestDay }).final : current;
  const saatAfter = (bestPeriod && bestSaat)
    ? computeCompat(analysis, { period: bestPeriod, saatNumber: bestSaat, planetLC: String(bestPlanet || "").toLowerCase() }).final
    : -1;
  const nightAfter = req.nightRequired === true ? computeCompat(analysis, { period: "night" }).final : -1;

  const recs = [];
  if (bestDay && dayAfter > current) {
    recs.push({ id: "day", labelEn: "Change Weekday", labelMl: "ദിവസം മാറ്റുക", value: translateDay(MIZAN_DAY_NAMES[bestDay] || bestDay, lang), apply: { days: bestDay }, targetPct: dayAfter });
  }
  if (bestPeriod && bestSaat && saatAfter > current) {
    recs.push({ id: "saat", labelEn: "Change Saat", labelMl: "സഅാത് മാറ്റുക", value: `#${saatDisplayNum(bestSaat, bestPeriod)} · ${translatePlanet(bestPlanet, lang)}`, apply: { hour: saatDisplayNum(bestSaat, bestPeriod), dayNight: bestPeriod === "night" ? "gece" : "gunduz", planet: "" }, targetPct: saatAfter });
  }
  if (req.nightRequired === true && liveNow.laylNahar !== "Layl" && nightAfter > current) {
    recs.push({ id: "night", labelEn: "Switch to Night", labelMl: "രാത്രിയിലേക്ക് മാറുക", value: T("Night (Layl)", "രാത്രി (ലൈൽ)", lang), apply: { dayNight: "gece", planet: "" }, targetPct: nightAfter });
  }

  const hasOverride = !!override;

  return (
    <Box number={4} titleEn="How to Make This Ritual Stronger" titleMl="ഈ കർമ്മം ശക്തമാക്കാൻ" icon={TrendingUp} lang={lang}>
      <div className="rounded-xl p-3 mb-3 flex items-center justify-between" style={{ background: `${bestColor}12`, border: `1px solid ${bestColor}50` }}>
        <div>
          <p className="font-inter text-sm font-bold" style={{ color: bestColor }}>{T("Best possible", "മികച്ച ഫലം", lang)}: {bestPct}%</p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{T("Current", "നിലവിൽ", lang)}: {current}%</p>
        </div>
        {hasOverride && (
          <button onClick={onReset} className="font-inter text-[10px] px-2.5 py-1 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}`, color: G.dim }}>
            <RotateCcw className="w-3 h-3 inline mr-1" />{T("Reset", "പുനഃസജ്ജമാക്കുക", lang)}
          </button>
        )}
      </div>

      {recs.length === 0 ? (
        <p className={lang === "ml" ? "font-malayalam text-sm" : "font-inter text-sm"} style={{ color: "rgba(255,255,255,0.60)" }}>
          {T("No improvement found in the uploaded books.", "അപ്‌ലോഡ് ചെയ്ത പുസ്തകങ്ങളിൽ മെച്ചപ്പെടൽ കണ്ടെത്തിയില്ല.", lang)}
        </p>
      ) : (
        <div className="space-y-2">
          {recs.map((r) => {
            const active = override && (
              (r.id === "day" && override.days === r.apply.days) ||
              (r.id === "saat" && override.hour === r.apply.hour) ||
              (r.id === "night" && override.dayNight === "gece")
            );
            return (
              <button key={r.id} onClick={() => onApply(r.apply)}
                className="w-full rounded-xl p-3 text-left transition-opacity hover:opacity-90"
                style={{
                  background: active ? `${bestColor}14` : G.bg,
                  border: `1px solid ${active ? bestColor : G.border}`,
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T(r.labelEn, r.labelMl, lang)}</p>
                    <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{r.value}</p>
                  </div>
                  {active
                    ? <span className="font-inter text-[10px] font-bold" style={{ color: bestColor }}>✓ {T("Applied", "പ്രയോഗിച്ചു", lang)}</span>
                    : <span className="font-inter text-sm font-bold" style={{ color: bestColor }}>→ {r.targetPct}%</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}
      <p className={lang === "ml" ? "font-malayalam text-[10px] mt-2" : "font-inter text-[10px] mt-2"} style={{ color: "rgba(255,255,255,0.45)" }}>
        {T("Tap a recommendation — the whole report recalculates live.", "ഒരു ശുപാർശ തിരഞ്ഞെടുക്കുക — മുഴുവൻ റിപ്പോർട്ടും തത്സമയം പുനഃകണക്കാക്കും.", lang)}
      </p>
    </Box>
  );
}