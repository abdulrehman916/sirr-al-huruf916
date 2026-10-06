import { useState } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { G, T, Box, translatePlanet, translateDay, saatDisplayNum, computeCompat, compatColor } from "../v3/shared";

// CARD 6 — COMPLETE FUTURE CALENDAR (next 29 days, collapsed by default)
// Header "Future Opportunities (Next 29 Days)". Expanded shows every suitable
// opportunity grouped by date, strength-sorted within each day, with Date,
// Weekday, Day/Night, Planetary Hour, Strength % and an Apply button. No
// reasoning text (lives on Card 1) and no source lists (live on Card 3/5).
export default function Card6FutureOpportunities({ analysis, onApply, lang }) {
  const [open, setOpen] = useState(false);
  const timeline = (analysis?.allowedTimeline || []).map(o => {
    const pct = computeCompat(analysis, { weekday: o.weekday, dayKey: o.dayKey, period: o.period, saatNumber: o.hour, planetLC: String(o.planet || "").toLowerCase() }).final;
    return { ...o, pct };
  });

  const groups = [];
  const seen = new Set();
  for (const o of timeline) {
    if (!seen.has(o.date)) { seen.add(o.date); groups.push({ date: o.date, dayName: o.dayName, isToday: o.isToday, daysAhead: o.daysAhead, items: [] }); }
    groups[groups.length - 1].items.push(o);
  }
  for (const g of groups) g.items.sort((a, b) => b.pct - a.pct);
  const dayLabel = (g) => g.isToday ? T("Today", "ഇന്ന്", lang) : g.daysAhead === 1 ? T("Tomorrow", "നാളെ", lang) : `${T("Day +", "ദിവസം +", lang)}${g.daysAhead}`;
  const applyItem = (o) => onApply && onApply({ days: o.dayKey, hour: saatDisplayNum(o.hour, o.period), dayNight: o.period === "night" ? "gece" : "gunduz", planet: "" });

  return (
    <Box number={6} titleEn="Future Opportunities" titleMl="ഭാവി അവസരങ്ങൾ" icon={Calendar} lang={lang}>
      <button onClick={() => setOpen(o => !o)} className="w-full rounded-xl p-3 flex items-center justify-between" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <span className="font-inter text-xs font-bold" style={{ color: G.text }}>{T("Future Opportunities (Next 29 Days)", "ഭാവി അവസരങ്ങൾ (അടുത്ത 29 ദിവസം)", lang)}</span>
        <span className="flex items-center gap-2">
          <span className="font-inter text-[10px]" style={{ color: G.dim }}>{timeline.length} {T("hours", "സമയങ്ങൾ", lang)}</span>
          <ChevronDown className="w-4 h-4" style={{ color: G.dim, transform: open ? "rotate(180deg)" : "none" }} />
        </span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {timeline.length === 0 ? (
            <p className={lang === "ml" ? "font-malayalam text-sm" : "font-inter text-sm"} style={{ color: "rgba(255,255,255,0.60)" }}>{T("No matching rule found in the imported sources within 29 days.", "29 ദിവസത്തിനുള്ളിൽ ഇറക്കുമതി ചെയ്ത സ്രോതസ്സുകളിൽ പൊരുത്തപ്പെടുന്ന നിയമമൊന്നുമില്ല.", lang)}</p>
          ) : groups.map((g, gi) => (
            <div key={gi}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>{dayLabel(g)}</span>
                <span className="font-inter text-[10px]" style={{ color: G.dim }}>{g.date} · {translateDay(g.dayName, lang)}</span>
              </div>
              <div className="space-y-1">
                {g.items.map((o, i) => {
                  const c = compatColor(o.pct);
                  return (
                    <div key={i} className="rounded-lg p-2 flex items-center justify-between" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                      <div className="min-w-0">
                        <p className="font-inter text-[11px] font-bold" style={{ color: "#fff" }}>#{saatDisplayNum(o.hour, o.period)} {translatePlanet(o.planet, lang)} · {o.period === "night" ? T("Night", "രാത്രി", lang) : T("Day", "പകൽ", lang)}</p>
                        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>{o.startTime}–{o.endTime}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-inter text-xs font-bold" style={{ color: c }}>{o.pct}%</span>
                        {onApply && (
                          <button onClick={() => applyItem(o)} className="rounded-lg px-2 py-1 font-inter text-[10px] font-bold flex items-center gap-1" style={{ background: "rgba(212,175,55,0.15)", color: G.text, border: `1px solid ${G.border}` }}>
                            <Check className="w-3 h-3" />{T("Apply", "പ്രയോഗിക്കുക", lang)}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Box>
  );
}