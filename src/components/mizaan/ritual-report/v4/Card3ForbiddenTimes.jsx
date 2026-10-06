import { Ban } from "lucide-react";
import { G, T, translatePlanet, translateDay, saatDisplayNum, computeCompat } from "../v3/shared";
import CollapsibleBox from "./CollapsibleBox";
import SourcesCollapse from "./SourcesCollapse";

function gradeOf(status, pct) {
  if (status === "forbidden") return { c: "#F87171", en: "Forbidden", ml: "നിരോധിതം" };
  if (status === "neutral") return { c: "#94A3B8", en: "No rule", ml: "നിയമമില്ല" };
  if (pct >= 70) return { c: "#4ADE80", en: "Strong", ml: "ശക്തം" };
  if (pct >= 40) return { c: "#A3E635", en: "Allowed", ml: "അനുവദനീയം" };
  return { c: "#FBBF24", en: "Weak", ml: "ദുർബലം" };
}

// CARD 3 — FORBIDDEN TIMES
// Two sections, both from imported book rules only (per-hour, every weekday):
//  1. Forbidden Weekdays — only weekdays where EVERY planetary hour is forbidden.
//     "No weekday is completely forbidden." if none.
//  2. Partially Forbidden Hours — for every weekday, the forbidden hours and the
//     allowed hours listed separately, each with the imported book-rule reason.
// The whole day is never blanket-forbidden unless every hour is forbidden.
export default function Card3ForbiddenTimes({ analysis, lang }) {
  const week = analysis?.weekBreakdown || [];

  const completelyForbidden = week.filter(d => {
    const f = d.hours.filter(h => h.status === "forbidden");
    const a = d.hours.filter(h => h.status === "allowed");
    const n = d.hours.filter(h => h.status === "neutral");
    return f.length > 0 && a.length === 0 && n.length === 0;
  });

  const HourLine = ({ h, tone }) => {
    const pct = h.status === "allowed" ? computeCompat(analysis, { weekday: h.weekday, dayKey: h.dayKey, period: h.period, saatNumber: h.hourNumber, planetLC: String(h.planet || "").toLowerCase() }).final : 0;
    const gr = gradeOf(h.status, pct);
    return (
      <div className="rounded-lg p-2 mb-1.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <div className="flex items-center justify-between">
          <p className="font-inter text-[11px] font-bold" style={{ color: "#fff" }}>#{saatDisplayNum(h.hourNumber, h.period)} {translatePlanet(h.planet, lang)} · {h.startTime}–{h.endTime} · {h.period === "night" ? T("Night", "രാത്രി", lang) : T("Day", "പകൽ", lang)}</p>
          <span className="font-inter text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: gr.c, border: `1px solid ${gr.c}55`, background: `${gr.c}12` }}>{lang === "ml" ? gr.ml : gr.en}</span>
        </div>
        <p className={lang === "ml" ? "font-malayalam text-[10px] mt-0.5" : "font-inter text-[10px] mt-0.5"} style={{ color: "rgba(255,255,255,0.62)" }}>
          {lang === "ml" && h.reasonMl ? h.reasonMl : (h.reasonEn || T("No matching rule found in the imported sources.", "ഇറക്കുമതി ചെയ്ത സ്രോതസ്സുകളിൽ പൊരുത്തപ്പെടുന്ന നിയമമൊന്നുമില്ല.", lang))}
        </p>
        <SourcesCollapse sources={h.rules} lang={lang} />
      </div>
    );
  };

  return (
    <CollapsibleBox number={3} titleEn="Forbidden Times" titleMl="നിരോധിത സമയങ്ങൾ" icon={Ban} lang={lang}>
      {/* 1. Forbidden Weekdays */}
      <p className="font-inter text-[9px] uppercase tracking-wider mb-1.5" style={{ color: G.dim }}>{T("Forbidden Weekdays", "നിരോധിത ദിവസങ്ങൾ", lang)}</p>
      {completelyForbidden.length === 0 ? (
        <div className="rounded-lg p-2.5 mb-3" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.40)" }}>
          <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "#4ADE80" }}>{T("No weekday is completely forbidden.", "ഒരു ദിവസവും പൂർണ്ണമായി നിരോധിതമല്ല.", lang)}</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {completelyForbidden.map((d, i) => (
            <span key={i} className="font-inter text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: "#F87171", border: "1px solid rgba(248,113,113,0.50)", background: "rgba(248,113,113,0.10)" }}>{translateDay(d.dayName, lang)}</span>
          ))}
        </div>
      )}

      {/* 2. Partially Forbidden Hours — every weekday */}
      <p className="font-inter text-[9px] uppercase tracking-wider mb-1.5" style={{ color: G.dim }}>{T("Partially Forbidden Hours", "ഭാഗികമായി നിരോധിത സമയങ്ങൾ", lang)}</p>
      <div className="space-y-2">
        {week.length === 0 ? (
          <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "#94A3B8" }}>{T("No matching rule found in the imported sources.", "ഇറക്കുമതി ചെയ്ത സ്രോതസ്സുകളിൽ പൊരുത്തപ്പെടുന്ന നിയമമൊന്നുമില്ല.", lang)}</p>
        ) : week.map((d, i) => {
          const forbidden = d.hours.filter(h => h.status === "forbidden");
          const allowed = d.hours.filter(h => h.status === "allowed");
          const allForbidden = forbidden.length > 0 && allowed.length === 0 && d.hours.filter(h => h.status === "neutral").length === 0;
          const noRules = forbidden.length === 0 && allowed.length === 0;
          return (
            <details key={i} className="rounded-xl overflow-hidden" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
              <summary className="cursor-pointer p-2.5 flex items-center justify-between">
                <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{translateDay(d.dayName, lang)}</span>
                <span className="font-inter text-[10px]" style={{ color: G.dim }}>
                  {allForbidden ? <span style={{ color: "#F87171" }}>{T("All hours forbidden", "എല്ലാ സമയവും നിരോധിതം", lang)}</span>
                    : noRules ? T("No rule", "നിയമമില്ല", lang)
                      : <>{T("Forbidden", "നിരോധിതം", lang)}: {forbidden.length} · {T("Allowed", "അനുവദനീയം", lang)}: {allowed.length}</>}
                </span>
              </summary>
              <div className="p-2.5 pt-1">
                {allForbidden && <p className={lang === "ml" ? "font-malayalam text-xs mb-1.5" : "font-inter text-xs mb-1.5"} style={{ color: "#F87171" }}>{T("All planetary hours on this day are forbidden for this purpose.", "ഈ ദിവസത്തിലെ എല്ലാ ഗ്രഹ സമയങ്ങളും ഈ ലക്ഷ്യത്തിന് നിരോധിതമാണ്.", lang)}</p>}
                {forbidden.length > 0 && (
                  <div className="mb-1.5">
                    <p className="font-inter text-[10px] font-bold mb-1" style={{ color: "#F87171" }}>{T("Forbidden", "നിരോധിതം", lang)}</p>
                    {forbidden.map((h, j) => <HourLine key={`f${j}`} h={h} tone="forbid" />)}
                  </div>
                )}
                {allowed.length > 0 && (
                  <div>
                    <p className="font-inter text-[10px] font-bold mb-1" style={{ color: "#4ADE80" }}>{T("Allowed", "അനുവദനീയം", lang)}</p>
                    {allowed.map((h, j) => <HourLine key={`a${j}`} h={h} tone="allow" />)}
                  </div>
                )}
                {noRules && <p className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: "#94A3B8" }}>{T("No matching rule found in the imported sources.", "ഇറക്കുമതി ചെയ്ത സ്രോതസ്സുകളിൽ പൊരുത്തപ്പെടുന്ന നിയമമൊന്നുമില്ല.", lang)}</p>}
              </div>
            </details>
          );
        })}
      </div>
    </CollapsibleBox>
  );
}