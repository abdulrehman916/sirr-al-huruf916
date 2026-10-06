// ═══════════════════════════════════════════════════════════════
// SECTION 6 — BEST TIMES
// Shows a table of next suitable times: Next Suitable Time, Saat,
// Planetary Hour, Day, Best Combination. Multiple upcoming times
// sorted from nearest to latest.
// ═══════════════════════════════════════════════════════════════
import { CalendarClock } from "lucide-react";
import ReportSection from "./ReportSection";
import { G, T, translatePlanet, translateDay, saatDisplayNum } from "./shared";

function TimeRow({ label, value, lang, highlight }) {
  return (
    <div
      className="flex items-center justify-between rounded-lg p-2.5"
      style={{
        background: highlight ? "rgba(74,222,128,0.06)" : G.bg,
        border: `1px solid ${highlight ? "rgba(74,222,128,0.20)" : G.border}`,
      }}
    >
      <span
        className="font-inter text-[10px] uppercase tracking-wider font-bold"
        style={{ color: G.dim }}
      >
        {label}
      </span>
      <span
        className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"}
        style={{ color: highlight ? "#4ADE80" : "#fff" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function SectionBestTimes({ analysis, lang }) {
  const nextOpp = analysis?.nextOpportunity || null;
  const betterSaats = analysis?.betterAlternatives?.betterSaats || [];
  const nextLayl = analysis?.betterAlternatives?.nextLayl || null;
  const bestWindows = analysis?.bestWindowsToday || [];
  const ranked = analysis?.rankedWindows || [];

  // Build a combined list of all upcoming suitable times, sorted nearest first
  const allTimes = [];

  // 1. Remaining suitable saats today
  for (const s of betterSaats) {
    allTimes.push({
      type: "saat_today",
      day: T("Today", "ഇന്ന്", lang),
      saat: `#${s.saatNum}`,
      planet: translatePlanet(s.planet, lang),
      period: s.period === "night" ? T("Night", "രാത്രി", lang) : T("Day", "പകൽ", lang),
      time: `${s.startTime}–${s.endTime}`,
      isToday: true,
    });
  }

  // 2. Today's best windows
  for (const w of bestWindows) {
    const sNum = saatDisplayNum(w.hourNumber, w.period);
    allTimes.push({
      type: "window_today",
      day: T("Today", "ഇന്ന്", lang),
      saat: `#${sNum}`,
      planet: translatePlanet(w.planet, lang),
      period: w.period === "night" ? T("Night", "രാത്രി", lang) : T("Day", "പകൽ", lang),
      time: `${w.startTime}–${w.endTime}`,
      isToday: true,
    });
  }

  // 3. Next Layl/Nahar opportunity
  if (nextLayl) {
    allTimes.push({
      type: "next_layl",
      day: translateDay(nextLayl.dayName, lang),
      saat: `#${nextLayl.saatNum}`,
      planet: translatePlanet(nextLayl.planet, lang),
      period: nextLayl.period === "night" ? T("Night", "രാത്രി", lang) : T("Day", "പകൽ", lang),
      time: `${nextLayl.startTime}–${nextLayl.endTime}`,
      isToday: nextLayl.isToday,
      daysAhead: nextLayl.daysAhead,
    });
  }

  // 4. Next valid opportunity (from findEarliestValidTime)
  if (nextOpp) {
    allTimes.push({
      type: "next_opportunity",
      day: translateDay(nextOpp.dayName, lang),
      saat: `#${saatDisplayNum(nextOpp.hour, nextOpp.period)}`,
      planet: translatePlanet(nextOpp.planet, lang),
      period: nextOpp.period === "night" ? T("Night", "രാത്രി", lang) : T("Day", "പകൽ", lang),
      time: `${nextOpp.startTime}–${nextOpp.endTime}`,
      isToday: nextOpp.isToday,
      daysAhead: nextOpp.daysAhead,
    });
  }

  // Dedup by time string
  const seen = new Set();
  const uniqueTimes = allTimes.filter((t) => {
    const key = `${t.day}-${t.time}-${t.saat}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return (
    <ReportSection
      number={6}
      title="Best Times"
      titleMl="മികച്ച സമയങ്ങൾ"
      icon={CalendarClock}
      lang={lang}
      accent="#4ADE80"
    >
      {uniqueTimes.length === 0 ? (
        <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p
            className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"}
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            {T(
              "No suitable times found within the next 14 days.",
              "അടുത്ത 14 ദിവസത്തിനുള്ളിൽ അനുയോജ്യമായ സമയങ്ങളൊന്നുമില്ല.",
              lang
            )}
          </p>
        </div>
      ) : (
        <>
          {/* Next Best Combination — summary */}
          {uniqueTimes[0] && (
            <div
              className="rounded-xl p-3 mb-2"
              style={{
                background: "rgba(74,222,128,0.08)",
                border: "1px solid rgba(74,222,128,0.30)",
              }}
            >
              <p
                className="font-inter text-[10px] uppercase tracking-wider font-bold mb-2"
                style={{ color: "#4ADE80" }}
              >
                {T("Next Best Combination", "അടുത്ത മികച്ച കോമ്പിനേഷൻ", lang)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <TimeRow label={T("Day", "ദിവസം", lang)} value={uniqueTimes[0].day} lang={lang} highlight />
                <TimeRow label={T("Saat", "സഅാത്", lang)} value={uniqueTimes[0].saat} lang={lang} highlight />
                <TimeRow label={T("Planet", "ഗ്രഹം", lang)} value={uniqueTimes[0].planet} lang={lang} highlight />
                <TimeRow label={T("Period", "സമയം", lang)} value={uniqueTimes[0].period} lang={lang} highlight />
              </div>
              <div className="mt-2">
                <TimeRow label={T("Time Window", "സമയ ജാലകം", lang)} value={uniqueTimes[0].time} lang={lang} highlight />
              </div>
            </div>
          )}

          {/* All upcoming suitable times table */}
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${G.border}` }}>
            <div
              className="grid grid-cols-5 gap-1 p-2"
              style={{ background: G.bgHi, borderBottom: `1px solid ${G.border}` }}
            >
              <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>
                {T("Day", "ദിവസം", lang)}
              </span>
              <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>
                {T("Saat", "സഅാത്", lang)}
              </span>
              <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>
                {T("Planet", "ഗ്രഹം", lang)}
              </span>
              <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>
                {T("Period", "സമയം", lang)}
              </span>
              <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>
                {T("Time", "സമയം", lang)}
              </span>
            </div>
            {uniqueTimes.map((t, idx) => (
              <div
                key={`time-${idx}`}
                className="grid grid-cols-5 gap-1 p-2"
                style={{
                  background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                  borderBottom: idx < uniqueTimes.length - 1 ? `1px solid ${G.border}` : "none",
                }}
              >
                <span className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: "#fff" }}>
                  {t.day}
                </span>
                <span className="font-inter text-[11px]" style={{ color: "#fff" }}>{t.saat}</span>
                <span className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: "#fff" }}>
                  {t.planet}
                </span>
                <span className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: "rgba(255,255,255,0.70)" }}>
                  {t.period}
                </span>
                <span className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.70)" }}>{t.time}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </ReportSection>
  );
}