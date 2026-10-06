import { useState } from "react";
import { Sparkles, Check, ChevronDown } from "lucide-react";
import { G, T, Box, translatePlanet, translateDay, saatDisplayNum, computeCompat, compatColor } from "../v3/shared";
import SourcesCollapse from "./SourcesCollapse";

// CARD 5 — BEST RECOMMENDATION
// Finds the strongest combination from the per-hour allowed timeline (each hour
// evaluated independently by its exact imported-book-rule context). Recommends
// best weekday, day/night, planetary hour, moon condition and lunar mansion,
// shows WHY it is the strongest, and "Apply Recommendation" updates the top
// selectors so every card recalculates live. No invented rules — every reason
// cites only imported sources.
export default function Card5BestRecommendation({ analysis, onApply, lang }) {
  const [showSameDay, setShowSameDay] = useState(false);
  const timeline = analysis?.allowedTimeline || [];
  const moonReq = analysis?.moonReq || {};
  const week = analysis?.weekBreakdown || [];

  // Single BEST across the full 29-day window — first occurrence of the
  // highest-ranked hour whose EXACT context (weekday + period + saat + planet)
  // is explicitly recommended by an imported book rule. No inference, no
  // planet/day-only matching: only exact per-hour book rules are ranked.
  let best = null, bestPct = -1;
  for (const o of timeline) {
    const pct = computeCompat(analysis, { weekday: o.weekday, dayKey: o.dayKey, period: o.period, saatNumber: o.hour, planetLC: String(o.planet || "").toLowerCase() }).final;
    if (pct > bestPct) { bestPct = pct; best = o; }
  }
  const cColor = compatColor(bestPct > 0 ? bestPct : 0);
  const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const bestMansion = moonReq.suitableMansions?.length ? moonReq.suitableMansions.join(", ") : T("No Moon restriction", "ചന്ദ്ര നിയന്ത്രണമില്ല", lang);
  const bestMoonCondition = moonReq.moon ? cap(moonReq.moon) : T("No Moon restriction", "ചന്ദ്ര നിയന്ത്രണമില്ല", lang);

  const rows = best ? [
    { k: T("Weekday", "ദിവസം", lang), v: translateDay(best.dayName, lang) },
    { k: T("Date", "തീയതി", lang), v: best.date },
    { k: T("Day / Night", "പകൽ / രാത്രി", lang), v: best.period === "night" ? T("Night", "രാത്രി", lang) : T("Day", "പകൽ", lang) },
    { k: T("Planetary Hour", "ഗ്രഹ സമയം", lang), v: `#${saatDisplayNum(best.hour, best.period)} · ${best.startTime}–${best.endTime}` },
    { k: T("Ruling Planet", "ആധിപത്യ ഗ്രഹം", lang), v: translatePlanet(best.planet, lang) },
    { k: T("Strength", "ശക്തി", lang), v: `${bestPct}%` },
    { k: T("Moon Condition", "ചന്ദ്ര അവസ്ഥ", lang), v: bestMoonCondition },
    { k: T("Lunar Mansion", "ചന്ദ്ര നക്ഷത്രം", lang), v: bestMansion },
  ] : [];

  // Other Time Slots on the SAME day as the best — collapsible, closed by
  // default. Only the remaining-hour count shows in the header; the full list
  // is built only when expanded. Excludes the best hour (already shown above).
  // Each hour uses imported book-rule status + reason only — no invention.
  const NO_RULE_EN = "No matching rule exists in the imported sources.";
  const NO_RULE_ML = "ഇറക്കുമതി ചെയ്ത സ്രോതസ്സുകളിൽ പൊരുത്തപ്പെടുന്ന നിയമമൊന്നുമില്ല.";
  const firstSentence = (s) => { if (!s) return ""; const p = String(s).split(/[.;\n]| · /); return (p[0] || "").trim(); };
  const bestDay = best ? (week[best.daysAhead] || week.find(d => d.dayKey === best.dayKey)) : null;
  const sameDayRemaining = bestDay
    ? bestDay.hours.filter(h => !h.past && !(best && h.hourNumber === best.hour && h.period === best.period))
    : [];
  const sameDayCount = sameDayRemaining.length;
  const sameDaySlots = showSameDay ? sameDayRemaining.map(h => {
    const pct = computeCompat(analysis, { weekday: h.weekday, dayKey: h.dayKey, period: h.period, saatNumber: h.hourNumber, planetLC: String(h.planet || "").toLowerCase() }).final;
    let statusEn, statusMl, statusColor;
    if (h.status === "forbidden") { statusEn = "Not Suitable"; statusMl = "അനുചിതം"; statusColor = "#F87171"; }
    else if (h.status === "allowed" && pct >= 70) { statusEn = "Suitable"; statusMl = "ഉചിതം"; statusColor = "#4ADE80"; }
    else { statusEn = "Partially Suitable"; statusMl = "ഭാഗികമായി ഉചിതം"; statusColor = "#FBBF24"; }
    const reason = (lang === "ml" && h.reasonMl) ? firstSentence(h.reasonMl) : (firstSentence(h.reasonEn) || T(NO_RULE_EN, NO_RULE_ML, lang));
    return { h, pct, statusEn, statusMl, statusColor, reason };
  }) : [];

  const apply = () => {
    if (!best || !onApply) return;
    onApply({ days: best.dayKey, hour: saatDisplayNum(best.hour, best.period), dayNight: best.period === "night" ? "gece" : "gunduz", planet: "" });
  };

  return (
    <Box number={5} titleEn="Best Recommendation" titleMl="മികച്ച ശുപാർശ" icon={Sparkles} lang={lang}>
      {!best ? (
        <p className={lang === "ml" ? "font-malayalam text-sm" : "font-inter text-sm"} style={{ color: "rgba(255,255,255,0.60)" }}>{T("No matching rule exists in the imported sources.", "ഇറക്കുമതി ചെയ്ത സ്രോതസ്സുകളിൽ പൊരുത്തപ്പെടുന്ന നിയമമൊന്നുമില്ല.", lang)}</p>
      ) : (
        <>
          <div className="rounded-xl p-3 mb-3" style={{ background: `${cColor}12`, border: `1px solid ${cColor}50` }}>
            <p className="font-inter text-sm font-bold" style={{ color: cColor }}>{T("Strongest combination", "ഏറ്റവും ശക്തമായ കൂട്ടായ്മ", lang)}: {bestPct}%</p>
            <p className={lang === "ml" ? "font-malayalam text-[11px] mt-0.5" : "font-inter text-[11px] mt-0.5"} style={{ color: "rgba(255,255,255,0.65)" }}>
              {lang === "ml" && best.reasonMl ? best.reasonMl : (best.reasonEn || T("No matching rule exists in the imported sources.", "ഇറക്കുമതി ചെയ്ത സ്രോതസ്സുകളിൽ പൊരുത്തപ്പെടുന്ന നിയമമൊന്നുമില്ല.", lang))}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {rows.map((r, i) => (
              <div key={i} className="rounded-lg p-2.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                <p className="font-inter text-[9px] uppercase tracking-wider mb-0.5" style={{ color: G.dim }}>{r.k}</p>
                <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{r.v}</p>
              </div>
            ))}
          </div>
          <SourcesCollapse sources={best.rules} lang={lang} />
          <button onClick={apply} className="w-full rounded-xl p-3 font-inter text-sm font-bold mt-1" style={{ background: "linear-gradient(135deg,#f6d860,#c98a14)", color: "#0d1b2a", border: "none", boxShadow: "0 0 24px rgba(212,175,55,0.40)" }}>
            <Check className="w-4 h-4 inline mr-1.5" />{T("Apply Recommendation", "ശുപാർശ പ്രയോഗിക്കുക", lang)}
          </button>

          {/* Other Time Slots on This Day — collapsible, closed by default */}
          {bestDay && (
            <div className="mt-3">
              <button type="button" onClick={() => setShowSameDay(o => !o)} className="w-full flex items-center justify-between rounded-lg p-2.5 cursor-pointer" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Other Time Slots on This Day", "ഈ ദിവസത്തിലെ മറ്റ് സമയ സ്ലോട്ടുകൾ", lang)}</span>
                <span className="flex items-center gap-2">
                  <span className="font-inter text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>{sameDayCount}</span>
                  <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform duration-200" style={{ color: G.dim, transform: showSameDay ? "rotate(180deg)" : "rotate(0deg)" }} />
                </span>
              </button>
              {showSameDay && (
                <div className="mt-2 space-y-1.5">
                  {sameDaySlots.length === 0 ? (
                    <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.60)" }}>{T("No remaining planetary hours on this day.", "ഈ ദിവസത്തിൽ ബാക്കി ഗ്രഹ സമയങ്ങളില്ല.", lang)}</p>
                  ) : sameDaySlots.map((s, i) => {
                    const h = s.h;
                    return (
                      <div key={i} className="rounded-lg p-2" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="font-inter text-[11px] font-bold" style={{ color: "#fff" }}>{h.startTime}–{h.endTime} · #{h.saatNum} {translatePlanet(h.planet, lang)} · {h.period === "night" ? T("Night", "രാത്രി", lang) : T("Day", "പകൽ", lang)}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="font-inter text-xs font-bold" style={{ color: compatColor(s.pct) }}>{s.pct}%</span>
                            <span className="font-inter text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: s.statusColor, border: `1px solid ${s.statusColor}55`, background: `${s.statusColor}12` }}>{lang === "ml" ? s.statusMl : s.statusEn}</span>
                          </div>
                        </div>
                        <p className={lang === "ml" ? "font-malayalam text-[10px]" : "font-inter text-[10px]"} style={{ color: "rgba(255,255,255,0.62)" }}>{s.reason}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Box>
  );
}