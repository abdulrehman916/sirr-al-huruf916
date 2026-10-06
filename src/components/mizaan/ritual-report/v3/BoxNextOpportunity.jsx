import { CalendarClock } from "lucide-react";
import { G, T, Box, translatePlanet, translateDay, saatDisplayNum, computeCompat, compatColor } from "./shared";

// BOX 5 — NEXT OPPORTUNITY (conclusion-first, live navigation)
// Conclusion: "Wait until:" + Date / Weekday / Saat / Planet / Compatibility.
// Then supporting details: time window, reason, supporting book.
export default function BoxNextOpportunity({ analysis, liveRecommendation, lang }) {
  const matchingRules = analysis?.matchingRules || [];

  if (!liveRecommendation) {
    return (
      <Box number={5} titleEn="Next Opportunity" titleMl="അടുത്ത അവസരം" icon={CalendarClock} lang={lang}>
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
  const rule = matchingRules.find(rr => rr.saat_number === r.hour && rr.period === r.period);
  const reason = rule ? (lang === "ml" && rule.text_ml ? rule.text_ml : rule.text_en) : "";
  const book = rule ? (rule.page ? `${rule.source} (p.${rule.page})` : (rule.source || "")) : "";
  const whenLabel = r.isToday ? T("Today", "ഇന്ന്", lang) : r.daysAhead === 1 ? T("Tomorrow", "നാളെ", lang) : translateDay(r.dayName, lang);

  const conclRows = [
    { k: T("Date", "തീയതി", lang), v: r.date },
    { k: T("Weekday", "ദിവസം", lang), v: `${whenLabel} · ${translateDay(r.dayName, lang)}` },
    { k: T("Day / Night", "പകൽ / രാത്രി", lang), v: r.period === "night" ? T("Night (Layl)", "രാത്രി (ലൈൽ)", lang) : T("Day (Nahar)", "പകൽ (നഹർ)", lang) },
    { k: T("Saat", "സഅാത്", lang), v: `#${saatDisplayNum(r.hour, r.period)} · ${translatePlanet(r.planet, lang)}` },
    { k: T("Compatibility", "പൊരുത്തം", lang), v: `${c}%` },
  ];

  return (
    <Box number={5} titleEn="Next Opportunity" titleMl="അടുത്ത അവസരം" icon={CalendarClock} lang={lang}>
      {/* CONCLUSION FIRST */}
      <div className="rounded-xl p-3 mb-3" style={{ background: `${cColor}12`, border: `1px solid ${cColor}50` }}>
        <p className="font-inter text-sm font-bold mb-2" style={{ color: cColor }}>{T("Wait until:", "വരെ കാത്തിരിക്കുക:", lang)}</p>
        <div className="space-y-1">
          {conclRows.map((row, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{row.k}</span>
              <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{row.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SUPPORTING DETAILS */}
      {r.startTime && r.endTime && <p className="font-inter text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>{r.startTime} – {r.endTime}</p>}
      {reason && <p className={lang === "ml" ? "font-malayalam text-[11px] leading-relaxed mb-1" : "font-inter text-[11px] leading-relaxed mb-1"} style={{ color: "rgba(255,255,255,0.72)" }}>{String(reason).split(/\n/)[0]}</p>}
      {book && <p className="font-inter text-[9px]" style={{ color: G.dim }}>{T("Supporting Book", "പിന്തുണയ്ക്കുന്ന പുസ്തകം", lang)}: {book}</p>}
      <p className={lang === "ml" ? "font-malayalam text-[10px] mt-2" : "font-inter text-[10px] mt-2"} style={{ color: "rgba(255,255,255,0.45)" }}>
        {T("Searched forward automatically: today → tomorrow → next days, until the first suitable opportunity.",
           "സ്വയമേവ മുന്നോട്ട് തിരഞ്ഞു: ഇന്ന് → നാളെ → അടുത്ത ദിവസങ്ങൾ, ആദ്യത്തെ അനുയോജ്യ അവസരം കണ്ടെത്തുന്നതുവരെ.", lang)}
      </p>
    </Box>
  );
}