import { CalendarClock, Clock, TrendingUp } from "lucide-react";
import { G, T, translatePlanet, translateDay, saatDisplayNum } from "../shared";
import { computeCompat, compatColor, findStrongestWindow } from "./compatibility";

function cleanReason(text) {
  if (!text) return "";
  return String(text).replace(/Source\s*:.*?(\.|$)/gi, "").replace(/Astrology Clock\s*:/gi, "").split(/\n/)[0].trim();
}

export default function SectionNextBest({ analysis, lang }) {
  const bestWindows = analysis?.bestWindowsToday || [];
  const passedWindows = analysis?.passedWindowsToday || [];
  const nextOpp = analysis?.nextOpportunity || null;
  const matchingRules = analysis?.matchingRules || [];

  // The strongest available now (shown in Section 2 — excluded here to avoid repetition)
  const strongest = findStrongestWindow(analysis, bestWindows);

  // Next best = remaining windows AFTER the strongest (never repeat the same Saat)
  const remaining = strongest
    ? bestWindows.filter(w => !(w.hourNumber === strongest.hourNumber && w.period === strongest.period))
    : bestWindows;
  const nextBestToday = remaining.length > 0 ? findStrongestWindow(analysis, remaining) : null;

  // If no second-best Saat remains today, show the next suitable day
  const nextDay = (!nextBestToday && nextOpp) ? nextOpp : null;

  if (!nextBestToday && !nextDay) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
        <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
            <CalendarClock className="w-5 h-5" style={{ color: G.text }} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>3</span>
            <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
              {T("Next Best Opportunity", "അടുത്ത മികച്ച അവസരം", lang)}
            </h3>
          </div>
        </div>
        <div className="p-4">
          <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.60)" }}>
            {T("No suitable opportunity found within 14 days.", "14 ദിവസത്തിനുള്ളിൽ അനുയോജ്യ അവസരമൊന്നുമില്ല.", lang)}
          </p>
        </div>
      </div>
    );
  }

  // Database-driven compat for the next best context
  const nextCompat = nextBestToday
    ? computeCompat(analysis, {
        period: nextBestToday.period,
        saatNumber: nextBestToday.hourNumber,
        planetLC: String(nextBestToday.planet || "").toLowerCase(),
      }).final
    : nextDay
      ? computeCompat(analysis, {
          dayKey: nextDay.dayKey,
          period: nextDay.period,
          saatNumber: nextDay.hour,
          planetLC: String(nextDay.planet || "").toLowerCase(),
        }).final
      : 0;

  const cColor = compatColor(nextCompat);
  const hasPassed = passedWindows.length > 0;

  // Reason from the database rule for this exact context (traceable to uploaded books)
  const reasonRule = nextBestToday
    ? matchingRules.find(r => r.saat_number === nextBestToday.hourNumber && r.period === nextBestToday.period)
    : null;
  const reason = reasonRule
    ? cleanReason(lang === "ml" && reasonRule.text_ml ? reasonRule.text_ml : reasonRule.text_en)
    : nextDay
      ? T("No suitable Saat remains today — this is the next fully compatible opportunity per the database.", "ഇന്ന് അനുയോജ്യ സഅാത് ബാക്കിയില്ല — ഡാറ്റാബേസ് പ്രകാരം അടുത്ത പൂർണ്ണ പൊരുത്തമുള്ള അവസരമാണിത്.", lang)
      : "";

  const nextLabel = nextBestToday
    ? T("Next best Saat today", "ഇന്നത്തെ അടുത്ത മികച്ച സഅാത്", lang)
    : T("Next suitable day", "അടുത്ത അനുയോജ്യ ദിവസം", lang);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <CalendarClock className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>3</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Next Best Opportunity", "അടുത്ത മികച്ച അവസരം", lang)}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {hasPassed && (
          <p className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: "#FBBF24" }}>
            {T("The strongest Saat today has already passed.", "ഇന്നത്തെ ഏറ്റവും ശക്ത സഅാത് കഴിഞ്ഞു.", lang)}
          </p>
        )}

        <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: G.dim }}>{nextLabel}</p>
          {nextBestToday && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" style={{ color: "#4ADE80" }} />
                <span className="font-inter text-sm font-bold" style={{ color: "#fff" }}>
                  {T("Saat", "സഅാത്", lang)} #{saatDisplayNum(nextBestToday.hourNumber, nextBestToday.period)}
                </span>
                <span className="font-inter text-xs" style={{ color: G.dim }}>·</span>
                <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{translatePlanet(nextBestToday.planet, lang)}</span>
              </div>
              {nextBestToday.startTime && nextBestToday.endTime && (
                <p className="font-inter text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>
                  {nextBestToday.startTime} – {nextBestToday.endTime}
                </p>
              )}
            </>
          )}
          {nextDay && (
            <>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" style={{ color: "#FBBF24" }} />
                <span className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
                  {translateDay(nextDay.dayName, lang)} ({nextDay.daysAhead} {T("d", "ദി", lang)})
                </span>
              </div>
              <p className="font-inter text-xs" style={{ color: "#fff" }}>
                {T("Saat", "സഅാത്", lang)} #{saatDisplayNum(nextDay.hour, nextDay.period)} ({translatePlanet(nextDay.planet, lang)})
              </p>
              {nextDay.startTime && nextDay.endTime && (
                <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>{nextDay.startTime} – {nextDay.endTime}</p>
              )}
            </>
          )}
        </div>

        {/* Expected compat — database-driven */}
        <div className="rounded-xl p-3 text-center" style={{ background: `${cColor}08`, border: `1px solid ${cColor}30` }}>
          <p className="font-inter text-xl font-bold" style={{ color: cColor }}>{nextCompat}%</p>
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Expected Compatibility", "പ്രതീക്ഷിത പൊരുത്തം", lang)}</p>
        </div>

        {/* Reason — from uploaded books only */}
        {reason && (
          <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <p className={lang === "ml" ? "font-malayalam text-xs leading-relaxed" : "font-inter text-xs leading-relaxed"} style={{ color: "rgba(255,255,255,0.75)" }}>
              {reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}