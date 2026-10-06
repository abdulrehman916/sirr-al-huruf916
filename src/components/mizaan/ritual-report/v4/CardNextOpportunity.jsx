import { CalendarClock } from "lucide-react";
import { G, T, Box, translatePlanet, translateDay, saatDisplayNum, computeCompat, compatColor } from "../v3/shared";
import SourcesCollapse from "./SourcesCollapse";

// CARD 3 — NEXT AVAILABLE OPPORTUNITY (shown only when the ritual cannot be
// performed now). Auto-searches forward: remaining day Saat → remaining night
// Saat → tomorrow → future days, until the first fully-valid opportunity.
export default function CardNextOpportunity({ analysis, liveRecommendation, lang }) {
  const matchingRules = analysis?.matchingRules || [];

  if (!liveRecommendation) {
    return (
      <Box number={3} titleEn="Next Available Opportunity" titleMl="അടുത്ത അവസരം" icon={CalendarClock} lang={lang}>
        <p className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#F87171" }}>
          {T("No suitable opportunity found within 14 days.", "14 ദിവസത്തിനുള്ളിൽ അനുയോജ്യ അവസരമൊന്നുമില്ല.", lang)}
        </p>
      </Box>
    );
  }

  const r = liveRecommendation;
  const planetLC = String(r.planet || "").toLowerCase();
  const c = computeCompat(analysis, { dayKey: r.dayKey, period: r.period, saatNumber: r.hour, planetLC }).final;
  const cColor = compatColor(c);
  const rule = matchingRules.find(rr => rr.saat_number === r.hour && rr.period === r.period) || null;
  const whenLabel = r.isToday ? T("Today", "ഇന്ന്", lang) : r.daysAhead === 1 ? T("Tomorrow", "നാളെ", lang) : translateDay(r.dayName, lang);

  const rows = [
    { k: T("Date", "തീയതി", lang), v: r.date },
    { k: T("Weekday", "ദിവസം", lang), v: `${whenLabel} · ${translateDay(r.dayName, lang)}` },
    { k: T("Day / Night", "പകൽ / രാത്രി", lang), v: r.period === "night" ? T("Night (Layl)", "രാത്രി (ലൈൽ)", lang) : T("Day (Nahar)", "പകൽ (നഹർ)", lang) },
    { k: T("Saat", "സഅാത്", lang), v: `#${saatDisplayNum(r.hour, r.period)} · ${translatePlanet(r.planet, lang)}` },
    { k: T("Exact Time", "സമയം", lang), v: (r.startTime && r.endTime) ? `${r.startTime} – ${r.endTime}` : "—" },
    { k: T("Planet", "ഗ്രഹം", lang), v: translatePlanet(r.planet, lang) },
    { k: T("Compatibility", "പൊരുത്തം", lang), v: `${c}%` },
  ];

  return (
    <Box number={3} titleEn="Next Available Opportunity" titleMl="അടുത്ത അവസരം" icon={CalendarClock} lang={lang}>
      <div className="rounded-xl p-3 mb-3" style={{ background: `${cColor}12`, border: `1px solid ${cColor}50` }}>
        <p className="font-inter text-sm font-bold mb-2" style={{ color: cColor }}>{T("Wait until:", "വരെ കാത്തിരിക്കുക:", lang)}</p>
        <div className="space-y-1">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{row.k}</span>
              <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>
      <SourcesCollapse sources={rule ? [{ source: rule.source, page: rule.page }] : []} lang={lang} />
      <p className={lang === "ml" ? "font-malayalam text-[10px] mt-2" : "font-inter text-[10px] mt-2"} style={{ color: "rgba(255,255,255,0.45)" }}>
        {T("Searched forward automatically: remaining day Saat → remaining night Saat → tomorrow → future days.",
           "സ്വയമേവ മുന്നോട്ട് തിരഞ്ഞു: ശേഷിക്കുന്ന പകൽ സഅാത് → ശേഷിക്കുന്ന രാത്രി സഅാത് → നാളെ → ഭാവി ദിവസങ്ങൾ.", lang)}
      </p>
    </Box>
  );
}