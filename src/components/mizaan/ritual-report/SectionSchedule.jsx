// ═══════════════════════════════════════════════════════════════
// SECTION 7 — UPCOMING SCHEDULE
// Generates a schedule: Today, Tomorrow, Next 7 Days
// For each: Date, Day, Planet, Hour, Saat, Verdict, Reason
//
// Uses the req object (from the engine) + planetary hours functions
// to check each day. This is PRESENTATION logic — no new rules created.
// ═══════════════════════════════════════════════════════════════
import { CalendarDays } from "lucide-react";
import ReportSection from "./ReportSection";
import { G, T, translatePlanet, translateDay, MIZAN_DAY_NAMES, DAY_KEY_BY_INDEX, capitalize, saatDisplayNum } from "./shared";
import { getAllPlanetaryHours, getActiveWeekday } from "@/lib/astroClockLiveEngine";
import { calculateSunriseSunset, getUserLocation } from "@/lib/astroClockSunriseSunset";

function computeDaySchedule(req, date, planningContext) {
  const loc = planningContext?.location || getUserLocation();
  const sun = calculateSunriseSunset(date, loc.lat, loc.lng, loc.timezone);
  const sunrise = sun.sunrise != null ? sun.sunrise : 6.5;
  const sunset = sun.sunset != null ? sun.sunset : 18.25;
  const hours = getAllPlanetaryHours(date, sunrise, sunset);
  const dayIndex = getActiveWeekday(date, sunrise, sunset);
  const dayKey = DAY_KEY_BY_INDEX[dayIndex];
  const dayName = MIZAN_DAY_NAMES[dayKey] || "—";

  const hasTimingData = !!(
    req.hours || req.worstHours || req.worstDays ||
    (req.enemyPlanets && req.enemyPlanets.length > 0) ||
    req.days || req.nightRequired === true
  );

  if (!hasTimingData) {
    return {
      date: date.toISOString().split("T")[0],
      dayName,
      planet: "—",
      saatNum: "—",
      period: "—",
      verdict: "Not Suitable",
      reason: T("No timing data found.", "സമയ ഡാറ്റയില്ല.", "en"),
    };
  }

  const dayOk = !req.days || req.days.includes(dayKey);
  const dayForbidden = req.worstDays && req.worstDays.includes(dayKey);

  // Find best suitable hour
  const suitableHours = hours.filter((h) => {
    if (h.status === "past") return false;
    if (req.hours && !req.hours.map((p) => p.toLowerCase()).includes(h.planet)) return false;
    if (req.worstHours && req.worstHours.map((p) => p.toLowerCase()).includes(h.planet)) return false;
    if (req.enemyPlanets && req.enemyPlanets.map((p) => p.toLowerCase()).includes(h.planet)) return false;
    if (req.nightRequired === true && h.period !== "night") return false;
    return true;
  });

  const bestHour = suitableHours[0] || null;

  let verdict, reason;
  if (dayForbidden) {
    verdict = "Not Suitable";
    reason = T(`${dayName} is a forbidden day.`, `${dayName} നിരോധിത ദിവസമാണ്.`, "en");
  } else if (!dayOk) {
    verdict = "Not Suitable";
    const recDays = req.days ? req.days.map((d) => MIZAN_DAY_NAMES[d]).join(", ") : "";
    reason = T(
      `${dayName} is not recommended. Recommended: ${recDays}`,
      `${dayName} ശുപാര്ശയല്ല. ശുപാര്ശം: ${recDays}`,
      "en"
    );
  } else if (!bestHour) {
    verdict = "Not Suitable";
    reason = T("No suitable Saat on this day.", "ഈ ദിവസം അനുയോജ്യമായ സഅാത് ഇല്ല.", "en");
  } else {
    verdict = "Suitable";
    const sNum = saatDisplayNum(bestHour.hourNumber, bestHour.period);
    reason = T(
      `${dayName}, Saat #${sNum} (${capitalize(bestHour.planet)})`,
      `${dayName}, സഅാത് #${sNum} (${capitalize(bestHour.planet)})`,
      "en"
    );
  }

  return {
    date: date.toISOString().split("T")[0],
    dayName,
    planet: bestHour ? translatePlanet(capitalize(bestHour.planet), "en") : "—",
    saatNum: bestHour ? `#${saatDisplayNum(bestHour.hourNumber, bestHour.period)}` : "—",
    period: bestHour
      ? bestHour.period === "night"
        ? T("Night", "രാത്രി", "en")
        : T("Day", "പകൽ", "en")
      : "—",
    verdict,
    reason,
  };
}

function ScheduleRow({ entry, lang, isToday, isTomorrow }) {
  const isSuitable = entry.verdict === "Suitable";
  const color = isSuitable ? "#4ADE80" : "#F87171";

  const dayLabel = isToday
    ? T("Today", "ഇന്ന്", lang)
    : isTomorrow
    ? T("Tomorrow", "നാളെ", lang)
    : entry.dayName;

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: isSuitable ? "rgba(74,222,128,0.04)" : "rgba(248,113,113,0.04)",
        border: `1px solid ${isSuitable ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"}`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="font-inter text-[10px] uppercase tracking-wider font-bold"
            style={{ color: G.dim }}
          >
            {entry.date}
          </span>
          <span
            className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"}
            style={{ color: "#fff" }}
          >
            {translateDay(dayLabel, lang)}
          </span>
        </div>
        <span
          className="font-inter text-[10px] font-bold px-2 py-0.5 rounded"
          style={{
            background: `${color}20`,
            color,
            border: `1px solid ${color}40`,
          }}
        >
          {isSuitable ? T("Suitable", "അനുയോജ്യം", lang) : T("Not Suitable", "അനുയോജ്യമല്ല", lang)}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-2">
        <div>
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>
            {T("Planet", "ഗ്രഹം", lang)}
          </p>
          <p className={lang === "ml" ? "font-malayalam text-[11px] font-bold" : "font-inter text-[11px] font-bold"} style={{ color: "#fff" }}>
            {entry.planet !== "—" ? translatePlanet(entry.planet, lang) : "—"}
          </p>
        </div>
        <div>
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>
            {T("Saat", "സഅാത്", lang)}
          </p>
          <p className="font-inter text-[11px] font-bold" style={{ color: "#fff" }}>{entry.saatNum}</p>
        </div>
        <div>
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>
            {T("Period", "സമയം", lang)}
          </p>
          <p className={lang === "ml" ? "font-malayalam text-[11px] font-bold" : "font-inter text-[11px] font-bold"} style={{ color: "#fff" }}>
            {entry.period}
          </p>
        </div>
        <div>
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>
            {T("Verdict", "വിധി", lang)}
          </p>
          <p className="font-inter text-[11px] font-bold" style={{ color }}>{entry.verdict}</p>
        </div>
      </div>
      <p
        className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed" : "font-inter text-[11px] leading-relaxed"}
        style={{ color: "rgba(255,255,255,0.65)" }}
      >
        {T("Reason", "കാരണം", lang)}: {entry.reason}
      </p>
    </div>
  );
}

export default function SectionSchedule({ analysis, lang, planningContext }) {
  const req = analysis?.req || {};
  const now = planningContext?.date || new Date();

  const days = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    days.push({
      ...computeDaySchedule(req, date, planningContext),
      isToday: d === 0,
      isTomorrow: d === 1,
    });
  }

  return (
    <ReportSection
      number={7}
      title="Upcoming Schedule"
      titleMl="വരാനിരിക്കുന്ന ഷെഡ്യൂൾ"
      icon={CalendarDays}
      lang={lang}
    >
      <div className="space-y-2">
        {days.map((entry, idx) => (
          <ScheduleRow
            key={`sched-${idx}`}
            entry={entry}
            lang={lang}
            isToday={entry.isToday}
            isTomorrow={entry.isTomorrow}
          />
        ))}
      </div>
    </ReportSection>
  );
}