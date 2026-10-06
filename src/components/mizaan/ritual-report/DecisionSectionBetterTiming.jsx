// ═══════════════════════════════════════════════════════════════
// SECTION 4 — BEST TIMING (FULLY CONTEXTUAL)
// Answers practical questions from uploaded database only:
//   1. Can I perform this ritual now?
//   2. Is DAY or NIGHT stronger?
//   3. Which Saats are suitable TODAY (all remaining)?
//   4. Which Saat should never be used?
//   5. If no suitable Saat remains today, which day?
//   6. If unsuitable: why + what to change
// Every recommendation includes compatibility %, book source, reason.
// ═══════════════════════════════════════════════════════════════
import { CalendarClock, TrendingUp, CheckCircle2, AlertTriangle, Sun, Moon, XCircle, Clock } from "lucide-react";
import { G, T, translatePlanet, translateDay, MIZAN_DAY_NAMES, DAY_KEY_BY_INDEX, saatDisplayNum } from "./shared";

function cleanReason(text) {
  if (!text) return "";
  return String(text).replace(/Source\s*:.*?(\.|$)/gi, "").replace(/Astrology Clock\s*:/gi, "").split(/\n/)[0].trim();
}

function compatColor(pct) {
  return pct >= 70 ? "#4ADE80" : pct >= 50 ? "#FBBF24" : pct > 0 ? "#FB923C" : "#F87171";
}

export default function DecisionSectionBetterTiming({ analysis, lang }) {
  const verdict = analysis?.verdict || "Not Suitable";
  const canPerform = analysis?.canPerformToday || "No";
  const currentMomentSuitable = analysis?.currentMomentSuitable || false;
  const breakdown = analysis?.selectionAnalysis?.decisionBreakdown || [];
  const failedItems = breakdown.filter((b) => b.status === "fail");
  const isSuitable = (verdict === "Suitable" && failedItems.length === 0) || (verdict === "Suitable" && canPerform === "Yes");

  const bestWindows = analysis?.bestWindowsToday || [];
  const avoidWindows = analysis?.avoidWindowsToday || [];
  const passedWindows = analysis?.passedWindowsToday || [];
  const nextOpp = analysis?.nextOpportunity || null;
  const matchingRules = analysis?.matchingRules || [];
  const req = analysis?.req || {};
  const liveNow = analysis?.liveNow || {};
  const astro = analysis?.astroClockStatus || {};
  const rejectionReasons = analysis?.currentSaatAnalysis?.rejectionReasons || [];

  // ── 1. Can I perform now? ──
  const canNow = currentMomentSuitable;
  const canNowReason = rejectionReasons.length > 0
    ? cleanReason(lang === "ml" && rejectionReasons[0].text_ml ? rejectionReasons[0].text_ml : rejectionReasons[0].text_en)
    : (matchingRules.length > 0
      ? cleanReason(lang === "ml" && matchingRules[0].text_ml ? matchingRules[0].text_ml : matchingRules[0].text_en)
      : "");

  // ── 2. Day vs Night analysis (from database rules) ──
  const dayRules = matchingRules.filter((r) => r.period === "day");
  const nightRules = matchingRules.filter((r) => r.period === "night");
  let dayNightRec;
  if (req.nightRequired === true) {
    dayNightRec = { period: "night", label: T("Night", "രാത്രി", lang), reason: T("Night is required for this purpose per the database.", "ഡാറ്റാബേസ് പ്രകാരം ഈ ലക്ഷ്യത്തിന് രാത്രി ആവശ്യമാണ്.", lang) };
  } else if (dayRules.length > nightRules.length && nightRules.length === 0) {
    dayNightRec = { period: "day", label: T("Day", "പകല്", lang), reason: T("Day is stronger — all database rules recommend day.", "പകല് കൂടുതൽ അനുയോജ്യം — ഡാറ്റാബേസ് പകല് ശുപാർശ ചെയ്യുന്നു.", lang) };
  } else if (nightRules.length > dayRules.length && dayRules.length === 0) {
    dayNightRec = { period: "night", label: T("Night", "രാത്രി", lang), reason: T("Night is stronger — all database rules recommend night.", "രാത്രി കൂടുതൽ അനുയോജ്യം — ഡാറ്റാബേസ് രാത്രി ശുപാർശ ചെയ്യുന്നു.", lang) };
  } else if (dayRules.length > nightRules.length) {
    dayNightRec = { period: "day", label: T("Day", "പകല്", lang), reason: T("Day has more suitable Saats in the database.", "ഡാറ്റാബേസിൽ പകലിൽ കൂടുതൽ അനുയോജ്യ സഅാത്തുകളുണ്ട്.", lang) };
  } else if (nightRules.length > dayRules.length) {
    dayNightRec = { period: "night", label: T("Night", "രാത്രി", lang), reason: T("Night has more suitable Saats in the database.", "ഡാറ്റാബേസിൽ രാത്രിയിൽ കൂടുതൽ അനുയോജ്യ സഅാത്തുകളുണ്ട്.", lang) };
  } else {
    dayNightRec = { period: "both", label: T("Both", "രണ്ടും", lang), reason: T("Both Day and Night are suitable per the database.", "ഡാറ്റാബേസ് പ്രകാരം പകലും രാത്രിയും അനുയോജ്യമാണ്.", lang) };
  }

  // ── 3. All remaining suitable Saats today (sorted by score) ──
  const remainingSaats = bestWindows.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
  const hasRemaining = remainingSaats.length > 0;

  // ── 4. Forbidden Saats today ──
  const forbiddenSaats = avoidWindows || [];

  // ── Passed Saat detection ──
  const hasPassedStrongest = passedWindows.length > 0 && (
    !hasRemaining || Math.max(...passedWindows.map(w => w.score || 0)) >= Math.max(...remainingSaats.map(w => w.score || 0))
  );

  // ── 5. Next available day (if no suitable Saat remains today) ──
  const nextDay = (!hasRemaining && nextOpp) ? nextOpp : null;
  const nextDayCompat = nextDay ? Math.round(
    ((req.days?.includes(nextDay.dayKey || "") ? 100 : 50) +
     (req.hours?.some(p => p.toLowerCase() === String(nextDay.planet || "").toLowerCase()) ? 100 : 50)) / 2
  ) : 0;

  // ── 6. Unsuitable: which dimensions to change ──
  const currentDayKey = DAY_KEY_BY_INDEX[astro.activeWeekday];
  const currentPlanetLC = String(liveNow.kawkab || liveNow.planetaryHour || "").toLowerCase();
  const dayFailed = !!req.days && !req.days.includes(currentDayKey);
  const saatFailed = !!req.hours && !req.hours.some((p) => p.toLowerCase() === currentPlanetLC);
  const planetEnemy = (!!req.worstHours && req.worstHours.some((p) => p.toLowerCase() === currentPlanetLC)) ||
    (!!req.enemyPlanets && req.enemyPlanets.some((p) => p.toLowerCase() === currentPlanetLC));
  const dayForbidden = !!req.worstDays && req.worstDays.includes(currentDayKey);
  const rejectRule = rejectionReasons.map((r) => cleanReason(lang === "ml" && r.text_ml ? r.text_ml : r.text_en)).filter(Boolean).slice(0, 1).join(" ");

  // Find the book source for a given saat
  function findBookForSaat(saatNum, period) {
    const fullSaat = period === "night" ? saatNum + 12 : saatNum;
    const rule = matchingRules.find(r => r.saat_number === fullSaat && r.period === period);
    return rule?.source || "";
  }
  function findReasonForSaat(saatNum, period) {
    const fullSaat = period === "night" ? saatNum + 12 : saatNum;
    const rule = matchingRules.find(r => r.saat_number === fullSaat && r.period === period);
    return rule ? cleanReason(lang === "ml" && rule.text_ml ? rule.text_ml : rule.text_en) : "";
  }

  function ChangeRow({ label, current, recommended, isFailed }) {
    if (!isFailed || !recommended) return null;
    return (
      <div className="flex items-center justify-between gap-2 py-1.5 border-b last:border-0" style={{ borderColor: G.border }}>
        <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.50)" }}>{current}</span>
          <span className="font-inter text-[10px]" style={{ color: G.dim }}>→</span>
          <span className={lang === "ml" ? "font-malayalam text-[11px] font-bold" : "font-inter text-[11px] font-bold"} style={{ color: "#4ADE80" }}>{recommended}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <CalendarClock className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>4</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Best Timing", "മികച്ച സമയം", lang)}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {/* ── 1. Can I perform now? ── */}
        <div className="rounded-xl p-3 flex items-center gap-3" style={{
          background: canNow ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)",
          border: `1px solid ${canNow ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
        }}>
          {canNow ? <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: "#4ADE80" }} />
                  : <XCircle className="w-6 h-6 flex-shrink-0" style={{ color: "#F87171" }} />}
          <div className="flex-1 min-w-0">
            <p className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: canNow ? "#4ADE80" : "#F87171" }}>
              {canNow
                ? T("Yes — you can perform this ritual now.", "അതെ — നിങ്ങൾക്ക് ഇപ്പോൾ ഈ ആചാരം അനുഷ്ഠിക്കാം.", lang)
                : T("No — not at this moment.", "അല്ല — ഈ നിമിഷത്തിൽ അല്ല.", lang)}
            </p>
            {!canNow && canNowReason && (
              <p className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed mt-0.5" : "font-inter text-[11px] leading-relaxed mt-0.5"} style={{ color: "rgba(255,255,255,0.60)" }}>
                {canNowReason}
              </p>
            )}
          </div>
        </div>

        {/* ── 2. Day or Night ── */}
        <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: G.dim }}>
            {T("Day or Night", "പകല് അതോ രാത്രി", lang)}
          </p>
          <div className="flex items-center gap-2 mb-1.5">
            {dayNightRec.period === "day" && <Sun className="w-5 h-5" style={{ color: "#FBBF24" }} />}
            {dayNightRec.period === "night" && <Moon className="w-5 h-5" style={{ color: "#60A5FA" }} />}
            {dayNightRec.period === "both" && <Sun className="w-5 h-5" style={{ color: "#FBBF24" }} />}
            <span className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
              {dayNightRec.label}
            </span>
          </div>
          <p className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed" : "font-inter text-[11px] leading-relaxed"} style={{ color: "rgba(255,255,255,0.65)" }}>
            {dayNightRec.reason}
          </p>
        </div>

        {/* ── Passed Saat message ── */}
        {hasPassedStrongest && (
          <div className="rounded-lg p-3 flex items-center gap-2" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.20)" }}>
            <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "#FBBF24" }} />
            <p className={lang === "ml" ? "font-malayalam text-[11px] font-bold" : "font-inter text-[11px] font-bold"} style={{ color: "#FBBF24" }}>
              {T("The strongest Saat today has already passed — see next best below.", "ഇന്നത്തെ ഏറ്റവും ശക്ത സഅാത് കഴിഞ്ഞു — താഴെ അടുത്ത മികച്ചത് കാണുക.", lang)}
            </p>
          </div>
        )}

        {/* ── 3. Remaining suitable Saats today ── */}
        <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: G.dim }}>
            {T("Suitable Saats remaining today", "ഇന്ന് ബാക്കിയുള്ള അനുയോജ്യ സഅാത്തുകൾ", lang)}
          </p>
          {hasRemaining ? (
            <div className="space-y-1.5">
              {remainingSaats.map((w, idx) => {
                const sn = saatDisplayNum(w.hourNumber, w.period);
                const bookRef = findBookForSaat(sn, w.period);
                const reason = findReasonForSaat(sn, w.period);
                const c = compatColor(w.score || 0);
                const isStrongest = idx === 0;
                const rankLabel = idx === 0 ? T("Best Today", "ഇന്നത്തെ മികച്ചത്", lang)
                  : idx === 1 ? T("Second Best", "രണ്ടാമത്തെ മികച്ചത്", lang)
                  : idx === 2 ? T("Third Best", "മൂന്നാമത്തെ മികച്ചത്", lang)
                  : null;
                return (
                  <div key={`saat-${idx}`} className="rounded-lg p-2.5" style={{
                    background: isStrongest ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isStrongest ? "rgba(74,222,128,0.20)" : G.border}`,
                  }}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {isStrongest && <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4ADE80" }} />}
                        {rankLabel && (
                          <span className="font-inter text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{
                            background: isStrongest ? "rgba(74,222,128,0.15)" : "rgba(212,175,55,0.10)",
                            color: isStrongest ? "#4ADE80" : G.dim,
                            border: `1px solid ${isStrongest ? "rgba(74,222,128,0.20)" : G.border}`,
                          }}>
                            {rankLabel}
                          </span>
                        )}
                        <span className="font-inter text-xs font-bold flex-shrink-0" style={{ color: "#fff" }}>
                          {T("Saat", "സഅാത്", lang)} #{sn}
                        </span>
                        <span className="font-inter text-[10px]" style={{ color: G.dim }}>·</span>
                        <span className="font-inter text-[11px] font-bold" style={{ color: "#fff" }}>{translatePlanet(w.planet, lang)}</span>
                        <span className="font-inter text-[10px]" style={{ color: G.dim }}>·</span>
                        <span className="font-inter text-[10px]" style={{ color: G.dim }}>
                          {w.period === "night" ? T("Night", "രാത്രി", lang) : T("Day", "പകല്", lang)}
                        </span>
                      </div>
                      <span className="font-inter text-xs font-bold flex-shrink-0" style={{ color: c }}>{w.score || 0}%</span>
                    </div>
                    {w.startTime && w.endTime && (
                      <p className="font-inter text-[10px] mb-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>
                        {w.startTime} – {w.endTime}
                      </p>
                    )}
                    {bookRef && (
                      <p className={lang === "ml" ? "font-malayalam text-[10px]" : "font-inter text-[10px]"} style={{ color: G.dim }}>
                        {T("Book", "പുസ്തകം", lang)}: {bookRef}
                      </p>
                    )}
                    {reason && (
                      <p className={lang === "ml" ? "font-malayalam text-[10px] leading-relaxed" : "font-inter text-[10px] leading-relaxed"} style={{ color: "rgba(255,255,255,0.55)" }}>
                        {reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: "rgba(255,255,255,0.50)" }}>
              {T("No suitable Saat remaining today.", "ഇന്ന് അനുയോജ്യ സഅാത് ബാക്കിയില്ല.", lang)}
            </p>
          )}
        </div>

        {/* ── 4. Forbidden Saats today ── */}
        {forbiddenSaats.length > 0 && (
          <div className="rounded-lg p-3" style={{ background: "rgba(248,113,113,0.03)", border: "1px solid rgba(248,113,113,0.15)" }}>
            <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#F87171" }}>
              {T("Never use these Saats today", "ഇന്ന് ഈ സഅാത്തുകൾ ഒരിക്കലും ഉപയോഗിക്കരുത്", lang)}
            </p>
            <div className="space-y-1">
              {forbiddenSaats.map((w, idx) => {
                const sn = saatDisplayNum(w.hourNumber, w.period);
                return (
                  <div key={`forbid-${idx}`} className="flex items-center justify-between gap-2 py-1 border-b last:border-0" style={{ borderColor: "rgba(248,113,113,0.10)" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#F87171" }} />
                      <span className="font-inter text-[11px] font-bold flex-shrink-0" style={{ color: "#fff" }}>
                        {T("Saat", "സഅാത്", lang)} #{sn}
                      </span>
                      <span className="font-inter text-[10px]" style={{ color: G.dim }}>·</span>
                      <span className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.70)" }}>{translatePlanet(w.planet, lang)}</span>
                      {w.startTime && w.endTime && (
                        <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>{w.startTime}–{w.endTime}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className={lang === "ml" ? "font-malayalam text-[10px] leading-relaxed mt-1.5" : "font-inter text-[10px] leading-relaxed mt-1.5"} style={{ color: "rgba(248,113,113,0.70)" }}>
              {T("These Saats are forbidden for your purpose per the uploaded books.", "അപ്ലോഡ് ചെയ്ത പുസ്തകങ്ങൾ പ്രകാരം ഈ സഅാത്തുകൾ നിങ്ങളുടെ ലക്ഷ്യത്തിന് വിലക്കപ്പെട്ടിരിക്കുന്നു.", lang)}
            </p>
          </div>
        )}

        {/* ── 5. Next available day (if no suitable Saat remains today) ── */}
        {nextDay && (
          <div className="rounded-xl p-3" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.25)" }}>
            <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#FBBF24" }}>
              {T("Next available day", "അടുത്ത ലഭ്യ ദിവസം", lang)}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Day", "ദിവസം", lang)}</p>
                <p className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: "#fff" }}>
                  {translateDay(nextDay.dayName, lang)} ({nextDay.daysAhead} {T("d", "ദി", lang)})
                </p>
              </div>
              <div>
                <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Saat", "സഅാത്", lang)}</p>
                <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>#{saatDisplayNum(nextDay.hour, nextDay.period)} ({translatePlanet(nextDay.planet, lang)})</p>
              </div>
              <div>
                <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Compat", "പൊരുത്തം", lang)}</p>
                <p className="font-inter text-xs font-bold" style={{ color: compatColor(nextDayCompat) }}>{nextDayCompat}%</p>
              </div>
              {nextDay.startTime && nextDay.endTime && (
                <div>
                  <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Time", "സമയം", lang)}</p>
                  <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{nextDay.startTime} – {nextDay.endTime}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 6. If unsuitable: why + what to change ── */}
        {!isSuitable && rejectRule && (
          <div className="rounded-lg p-3" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.20)" }}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#F87171" }} />
              <p className="font-inter text-[10px] uppercase tracking-wider font-bold" style={{ color: "#F87171" }}>
                {T("Why it failed", "പരാജയപ്പെട്ടതിന്റെ കാരണം", lang)}
              </p>
            </div>
            <p className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed" : "font-inter text-[11px] leading-relaxed"} style={{ color: "rgba(255,255,255,0.70)" }}>{rejectRule}</p>
          </div>
        )}

        {!isSuitable && (dayFailed || saatFailed || planetEnemy || dayForbidden) && (
          <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: G.dim }}>
              {T("What to change", "മാറ്റേണ്ടത്", lang)}
            </p>
            <ChangeRow
              label={T("Day", "ദിവസം", lang)}
              current={translateDay(liveNow.day, lang)}
              recommended={req.days?.length > 0 ? translateDay(MIZAN_DAY_NAMES[req.days[0]], lang) : null}
              isFailed={dayFailed || dayForbidden}
            />
            <ChangeRow
              label={T("Saat", "സഅാത്", lang)}
              current={`#${liveNow.saat || "—"}`}
              recommended={hasRemaining ? `#${saatDisplayNum(remainingSaats[0].hourNumber, remainingSaats[0].period)}` : null}
              isFailed={saatFailed}
            />
            <ChangeRow
              label={T("Planet", "ഗ്രഹം", lang)}
              current={translatePlanet(liveNow.kawkab || liveNow.planetaryHour, lang)}
              recommended={req.hours?.length > 0 ? translatePlanet(req.hours[0], lang) : (hasRemaining ? translatePlanet(remainingSaats[0].planet, lang) : null)}
              isFailed={saatFailed || planetEnemy}
            />
          </div>
        )}

        {/* ── Already strongest ── */}
        {isSuitable && !hasRemaining && (
          <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.25)" }}>
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: "#4ADE80" }} />
            <p className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#4ADE80" }}>
              {T("This is already the strongest available timing today.", "ഇത് ഇന്ന് ലഭ്യമായ ഏറ്റവും ശക്തമായ സമയമാണ്.", lang)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}