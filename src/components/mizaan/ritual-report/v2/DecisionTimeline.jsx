// ═══════════════════════════════════════════════════════════════
// DECISION TIMELINE — chronological recommendation flow
// Replaces the single-recommendation sections with a step-by-step
// timeline: Current → Upcoming Today → Tomorrow → Next Available →
// future days, each marked with a status label.
//
// Uses ONLY already-calculated analysis data + collectAllValidTimes
// (additive collector reusing the engine's existing req checks).
// Does NOT change the compatibility engine or any calculation.
// Compatibility % comes from the existing database-driven computeCompat.
// ═══════════════════════════════════════════════════════════════
import { useMemo } from "react";
import {
  Clock, Calendar, CalendarClock, Sun, Moon, CheckCircle2, XCircle,
  ArrowDown, AlertTriangle, TrendingUp,
} from "lucide-react";
import { G, T, translatePlanet, translateDay, saatDisplayNum, DAY_KEY_BY_INDEX } from "../shared";
import { computeCompat, compatColor } from "./compatibility";
import { collectAllValidTimes } from "@/lib/ritualTimingEngineV3";

function cleanReason(text) {
  if (!text) return "";
  return String(text).replace(/Source\s*:.*?(\.|$)/gi, "").replace(/Astrology Clock\s*:/gi, "").split(/\n/)[0].trim();
}

// Map a collected time to a computeCompat override
function compatForTime(analysis, t) {
  const weekdayIdx = DAY_KEY_BY_INDEX.indexOf(t.dayKey);
  return computeCompat(analysis, {
    weekday: weekdayIdx >= 0 ? weekdayIdx : undefined,
    dayKey: t.dayKey,
    period: t.period,
    saatNumber: t.hour,
    planetLC: String(t.planet || "").toLowerCase(),
  }).final;
}

export default function DecisionTimeline({ analysis, lang }) {
  const req = analysis?.req || {};
  const liveNow = analysis?.liveNow || {};
  const matchingRules = analysis?.matchingRules || [];
  const currentSuitable = analysis?.currentSaatAnalysis?.suitable === true;
  const passedWindows = analysis?.passedWindowsToday || [];

  // ── Collect ALL valid future opportunities (today remaining + 14 days) ──
  const allTimes = useMemo(() => {
    if (!req || (!req.days && !req.hours && !req.worstDays && !req.worstHours &&
      !(req.enemyPlanets && req.enemyPlanets.length) && req.nightRequired !== true)) return [];
    return collectAllValidTimes(req, new Date(), 14);
  }, [req]);

  // Compute compat for each collected time
  const ranked = useMemo(() => allTimes.map(t => ({
    ...t,
    compat: compatForTime(analysis, t),
  })), [allTimes, analysis]);

  // Split by day
  const todayRemaining = ranked.filter(t => t.isToday);
  const future = ranked.filter(t => !t.isToday);

  // Group future by daysAhead (chronological)
  const futureByDay = useMemo(() => {
    const map = new Map();
    for (const t of future) {
      if (!map.has(t.daysAhead)) map.set(t.daysAhead, []);
      map.get(t.daysAhead).push(t);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [future]);

  // Best overall (highest compat across all collected times)
  const bestOverall = ranked.length > 0
    ? ranked.reduce((best, t) => (t.compat > best.compat ? t : best), ranked[0])
    : null;

  // Current saat context + compat
  const currentPeriod = liveNow.laylNahar === "Layl" ? "night" : "day";
  const currentHourNum = (liveNow.saat || 1) + (currentPeriod === "night" ? 12 : 0);
  const currentCompat = computeCompat(analysis).final;
  const currentColor = compatColor(currentCompat);

  // Current saat time window — search collected today times for the matching hour
  const currentWindow = todayRemaining.find(t => t.hour === currentHourNum && t.period === currentPeriod)
    || passedWindows.find(w => w.hourNumber === currentHourNum && w.period === currentPeriod)
    || null;

  const noData = ranked.length === 0 && !currentSuitable && passedWindows.length === 0;

  // ── Status label for a time entry ──
  function labelFor(t) {
    if (t === bestOverall && t.compat === Math.max(...ranked.map(r => r.compat))) {
      return { text: T("Best Overall", "ഏറ്റവും മികച്ചത്", lang), color: "#4ADE80" };
    }
    if (t.isToday) return { text: T("Upcoming Today", "ഇന്ന് വരാനുള്ളത്", lang), color: "#FBBF24" };
    if (t.daysAhead === 1) return { text: T("Tomorrow", "നാളെ", lang), color: "#60A5FA" };
    return { text: T("Next Available", "അടുത്ത ലഭ്യമായത്", lang), color: "#A78BFA" };
  }

  // ── Render a single time row ──
  function TimeRow({ t, isBest }) {
    const c = compatColor(t.compat);
    const label = labelFor(t);
    const saatNum = saatDisplayNum(t.hour, t.period);
    const reasonRule = matchingRules.find(r => r.saat_number === t.hour && r.period === t.period);
    const reason = reasonRule ? cleanReason(lang === "ml" && reasonRule.text_ml ? reasonRule.text_ml : reasonRule.text_en) : "";

    return (
      <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${isBest ? G.borderHi : G.border}` }}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-inter text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ background: `${label.color}18`, color: label.color, border: `1px solid ${label.color}40` }}>
            {label.text}
          </span>
          <span className="font-inter text-sm font-bold" style={{ color: c }}>{t.compat}%</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          {t.period === "night" ? <Moon className="w-3.5 h-3.5" style={{ color: G.dim }} /> : <Sun className="w-3.5 h-3.5" style={{ color: G.dim }} />}
          <span className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Saat", "സഅാത്", lang)} #{saatNum}
          </span>
          <span className="font-inter text-xs" style={{ color: G.dim }}>·</span>
          <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{translatePlanet(t.planet, lang)}</span>
        </div>
        {t.startTime && t.endTime && (
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>{t.startTime} – {t.endTime}</p>
        )}
        {reason && (
          <p className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed mt-1.5" : "font-inter text-[11px] leading-relaxed mt-1.5"} style={{ color: "rgba(255,255,255,0.65)" }}>
            {reason}
          </p>
        )}
      </div>
    );
  }

  function StepHeader({ num, icon: Icon, title, titleMl }) {
    return (
      <div className="flex items-center gap-2 mb-2">
        <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>{num}</span>
        <Icon className="w-4 h-4" style={{ color: G.text }} />
        <h3 className={lang === "ml" ? "font-malayalam text-xs font-bold uppercase tracking-wider" : "font-inter text-xs font-bold uppercase tracking-wider"} style={{ color: G.dim }}>
          {T(title, titleMl, lang)}
        </h3>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <CalendarClock className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Ritual Timing Timeline", "ആചാര സമയ ടൈംലൈൻ", lang)}
          </h3>
          <p className="font-inter text-[10px]" style={{ color: G.dim }}>
            {T("Chronological decision flow", "കാലിക തീരുമാന പ്രവാഹം", lang)}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {noData && (
          <div className="rounded-lg p-4 text-center" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <AlertTriangle className="w-5 h-5 mx-auto mb-2" style={{ color: "#FBBF24" }} />
            <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.60)" }}>
              {T("No timing data found for this purpose in the database.", "ഡാറ്റാബേസിൽ ഈ ലക്ഷ്യത്തിനായി സമയ ഡാറ്റായില്ല.", lang)}
            </p>
          </div>
        )}

        {/* ── STEP 1: Current Saat ── */}
        <div>
          <StepHeader num={1} icon={Clock} title="Current Saat" titleMl="നിലവിലെ സഅാത്" />
          <div className="rounded-xl p-3" style={{ background: `${currentColor}08`, border: `1px solid ${currentColor}30` }}>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-inter text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ background: `${currentColor}18`, color: currentColor, border: `1px solid ${currentColor}40` }}>
                {T("Current", "നിലവിൽ", lang)}
              </span>
              {currentSuitable ? <CheckCircle2 className="w-4 h-4" style={{ color: "#4ADE80" }} /> : <XCircle className="w-4 h-4" style={{ color: "#F87171" }} />}
            </div>
            <div className="flex items-center gap-2 mb-1">
              {currentPeriod === "night" ? <Moon className="w-4 h-4" style={{ color: G.dim }} /> : <Sun className="w-4 h-4" style={{ color: G.dim }} />}
              <span className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
                {translateDay(liveNow.day, lang)} · {T("Saat", "സഅാത്", lang)} #{liveNow.saat || "—"}
              </span>
              <span className="font-inter text-xs" style={{ color: G.dim }}>·</span>
              <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{translatePlanet(liveNow.kawkab || liveNow.planetaryHour, lang)}</span>
            </div>
            {currentWindow && (
              <p className="font-inter text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>{currentWindow.startTime} – {currentWindow.endTime}</p>
            )}
            <div className="flex items-center justify-between gap-2 mt-2">
              <span className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: currentSuitable ? "#4ADE80" : "#F87171" }}>
                {currentSuitable
                  ? T("Recommended now", "ഇപ്പോൾ ശുപാർശ ചെയ്യുന്നു", lang)
                  : T("Not suitable — see next steps", "അനുയോജ്യമല്ല — അടുത്ത ഘട്ടങ്ങൾ കാണുക", lang)}
              </span>
              <span className="font-inter text-sm font-bold" style={{ color: currentColor }}>{currentCompat}%</span>
            </div>
          </div>
          {!currentSuitable && (todayRemaining.length > 0 || future.length > 0) && (
            <div className="flex justify-center my-2">
              <ArrowDown className="w-4 h-4" style={{ color: G.dim }} />
            </div>
          )}
        </div>

        {/* ── STEP 2: Upcoming Today ── */}
        {todayRemaining.length > 0 && (
          <div>
            <StepHeader num={2} icon={Sun} title="Upcoming Today" titleMl="ഇന്ന് വരാനുള്ളത്" />
            <div className="space-y-2">
              {todayRemaining.map((t, i) => (
                <TimeRow key={`today-${i}`} t={t} isBest={t === bestOverall} />
              ))}
            </div>
          </div>
        )}

        {/* No suitable Saat remains today */}
        {todayRemaining.length === 0 && !currentSuitable && (future.length > 0 || passedWindows.length > 0) && (
          <div className="rounded-lg p-3 text-center" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "#FBBF24" }}>
              {T("No suitable Saat remains today.", "ഇന്ന് അനുയോജ്യ സഅാത് ബാക്കിയില്ല.", lang)}
            </p>
          </div>
        )}

        {/* ── STEP 3-5: Future days (chronological, grouped) ── */}
        {futureByDay.length > 0 && (
          <div>
            <StepHeader num={3} icon={Calendar} title="Next Available Saat" titleMl="അടുത്ത ലഭ്യ സഅാത്" />
            <div className="space-y-3">
              {futureByDay.map(([daysAhead, times]) => (
                <div key={daysAhead}>
                  <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: G.dim }}>
                    {daysAhead === 1 ? T("Tomorrow", "നാളെ", lang) : translateDay(times[0].dayName, lang)}
                  </p>
                  <div className="space-y-2">
                    {times.map((t, i) => (
                      <TimeRow key={`future-${daysAhead}-${i}`} t={t} isBest={t === bestOverall} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No future opportunity at all */}
        {future.length === 0 && todayRemaining.length === 0 && !currentSuitable && passedWindows.length === 0 && !noData && (
          <div className="rounded-lg p-3 text-center" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.60)" }}>
              {T("No suitable opportunity found within 14 days.", "14 ദിവസത്തിനുള്ളിൽ അനുയോജ്യ അവസരമൊന്നുമില്ല.", lang)}
            </p>
          </div>
        )}

        {/* ── STEP 6: Expired Today ── */}
        {passedWindows.length > 0 && (
          <div>
            <StepHeader num={6} icon={XCircle} title="Expired Today" titleMl="ഇന്ന് കഴിഞ്ഞവ" />
            <div className="space-y-2">
              {passedWindows.map((w, i) => (
                <div key={`passed-${i}`} className="rounded-lg p-3 opacity-50" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-inter text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(248,113,113,0.18)", color: "#F87171", border: "1px solid rgba(248,113,113,0.40)" }}>
                      {T("Expired", "കഴിഞ്ഞു", lang)}
                    </span>
                    <span className="font-inter text-[10px]" style={{ color: G.dim }}>{w.startTime} – {w.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-inter text-xs font-bold" style={{ color: "rgba(255,255,255,0.60)" }}>
                      {T("Saat", "സഅാത്", lang)} #{saatDisplayNum(w.hourNumber, w.period)} · {translatePlanet(w.planet, lang)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Best Overall callout */}
        {bestOverall && (
          <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.30)" }}>
            <TrendingUp className="w-4 h-4 flex-shrink-0" style={{ color: "#4ADE80" }} />
            <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.80)" }}>
              {T("Best overall", "ഏറ്റവും മികച്ചത്", lang)}: {translateDay(bestOverall.dayName, lang)} · {T("Saat", "സഅാത്", lang)} #{saatDisplayNum(bestOverall.hour, bestOverall.period)} ({translatePlanet(bestOverall.planet, lang)}) — {bestOverall.compat}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}