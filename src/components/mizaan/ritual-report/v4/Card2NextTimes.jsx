import { CalendarClock, Check, ArrowRight } from "lucide-react";
import { G, T, translatePlanet, translateDay, saatDisplayNum, MIZAN_DAY_NAMES, computeCompat, compatColor } from "../v3/shared";
import CollapsibleBox from "./CollapsibleBox";

// CARD 2 — NEXT AVAILABLE PLANETARY HOURS (current cycle only)
// Shows the remaining planetary hours of the CURRENT day/night cycle
// (max 12), each evaluated independently by its exact imported-book-rule
// context. No future dates here — Card 6 owns the long-term calendar.
// Every conclusion comes only from the Astrology Clock / book rules.
function statusOf(h, pct) {
  if (h.status === "forbidden") return { en: "Not Recommended", ml: "ശുപാർശില്ല", c: "#F87171" };
  if (h.status === "allowed" && pct >= 70) return { en: "Recommended", ml: "ശുപാർശ", c: "#4ADE80" };
  if (h.status === "allowed") return { en: "Allowed", ml: "അനുവദനീയം", c: "#A3E635" };
  return { en: "Weak", ml: "ദുർബലം", c: "#FBBF24" }; // neutral = no matching rule
}

const NO_RULE_EN = "No matching rule found in the imported sources.";
const NO_RULE_ML = "ഇറക്കുമതി ചെയ്ത സ്രോതസ്സുകളിൽ പൊരുത്തപ്പെടുന്ന നിയമമൊന്നുമില്ല.";

function firstSentence(s) {
  if (!s) return "";
  const parts = String(s).split(/[.;\n]| · /);
  return (parts[0] || "").trim();
}

// Build a short reason naming ONLY the relationships that actually conflict
// for this hour, derived strictly from imported book rules (req) + the
// per-hour forbidden context text. Never invents a relationship.
function unsuitableReason(h, req, lang) {
  const parts = [];
  if (req?.worstDays?.includes(h.dayKey)) {
    parts.push(`${T("Selected purpose vs weekday", "തിരഞ്ഞെടുത്ത ലക്ഷ്യം vs വാരദിനം", lang)} (${translateDay(h.dayName, lang)})`);
  }
  if (req?.nightRequired === true && h.period === "day") {
    parts.push(`${T("Selected purpose vs day/night", "തിരഞ്ഞെടുത്ത ലക്ഷ്യം vs പകൽ/രാത്രി", lang)} (${T("night required", "രാത്രി ആവശ്യം", lang)})`);
  }
  const planetLC = String(h.planet || "").toLowerCase();
  const isWorstPlanet = req?.worstHours?.map(p => p.toLowerCase()).includes(planetLC);
  const isEnemyPlanet = req?.enemyPlanets?.map(p => p.toLowerCase()).includes(planetLC);
  if (isWorstPlanet || isEnemyPlanet) {
    parts.push(`${T("Selected purpose vs ruling planet", "തിരഞ്ഞെടുത്ത ലക്ഷ്യം vs ഗ്രഹം", lang)} (${translatePlanet(h.planet, lang)})`);
  }
  if (parts.length === 0) {
    parts.push(T("Selected purpose vs current astrological condition", "തിരഞ്ഞെടുത്ത ലക്ഷ്യം vs നിലവിലെ ജ്യോതിഷ വ്യവസ്ഥ", lang));
  }
  const bookText = lang === "ml" && h.reasonMl ? firstSentence(h.reasonMl) : firstSentence(h.reasonEn);
  return bookText ? parts.join("; ") + " — " + bookText : parts.join("; ");
}

export default function Card2NextTimes({ analysis, onApply, lang }) {
  // ── No data for this purpose at all → show only the no-rule message ──
  const hasData = (analysis?.matchingRules?.length > 0) || (analysis?.conflictingRules?.length > 0);
  if (!hasData) {
    return (
      <CollapsibleBox number={2} titleEn="Next Available Planetary Hours" titleMl="അടുത്ത ലഭ്യമായ ഗ്രഹ മണിക്കൂറുകൾ" icon={CalendarClock} lang={lang}>
        <p className={lang === "ml" ? "font-malayalam text-sm" : "font-inter text-sm"} style={{ color: "rgba(255,255,255,0.60)" }}>
          {T(NO_RULE_EN, NO_RULE_ML, lang)}
        </p>
      </CollapsibleBox>
    );
  }

  const breakdown = analysis?.dayHourBreakdown || [];
  const liveNow = analysis?.liveNow || {};
  const currentPeriod = liveNow.laylNahar === "Layl" ? "night" : "day";
  const currentSaat = liveNow.saat || 1;

  // Remaining hours of the current cycle (same period, saat >= current, max 12)
  const remaining = breakdown
    .filter(h => h.period === currentPeriod && h.saatNum >= currentSaat)
    .slice(0, 12);

  // Score each remaining hour with the same book-rule compatibility used elsewhere
  const scored = remaining.map(h => {
    const pct = computeCompat(analysis, {
      weekday: h.weekday, dayKey: h.dayKey, period: h.period,
      saatNumber: h.hourNumber, planetLC: String(h.planet || "").toLowerCase(),
    }).final;
    return { h, pct, status: statusOf(h, pct) };
  });

  const current = scored.find(s => s.h.saatNum === currentSaat) || scored[0] || null;
  const currentAllowed = current?.h.status === "allowed";

  // Next better opportunity: a later allowed hour strictly stronger than current
  let better = null;
  for (const s of scored) {
    if (s.h.saatNum === currentSaat) continue;
    if (s.h.status !== "allowed") continue;
    if (current && s.pct <= current.pct) continue;
    if (!better || s.pct > better.pct) better = s;
  }

  const anyAllowed = scored.some(s => s.h.status === "allowed");
  const periodLabel = currentPeriod === "night" ? T("Tonight", "ഇരുളുകാലം", lang) : T("Today", "പകൽ", lang);

  const applyItem = (h) => onApply && onApply({
    days: h.dayKey,
    hour: h.saatNum,
    dayNight: h.period === "night" ? "gece" : "gunduz",
    planet: "",
  });

  return (
    <CollapsibleBox number={2} titleEn="Next Available Planetary Hours" titleMl="അടുത്ത ലഭ്യമായ ഗ്രഹ മണിക്കൂറുകൾ" icon={CalendarClock} lang={lang}>
      {/* ── Current-moment verdict (compact) ── */}
      {currentAllowed ? (
        <div className="rounded-xl p-2.5 mb-2" style={{ background: "rgba(74,222,128,0.10)", border: "1px solid rgba(74,222,128,0.45)" }}>
          <p className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: "#4ADE80" }}>
            {T("You may perform the ritual now.", "നിങ്ങൾക്ക് ഇപ്പോൾ കർമ്മം ചെയ്യാം.", lang)}
          </p>
        </div>
      ) : better ? (
        <div className="rounded-xl p-2.5 mb-2" style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.40)" }}>
          <div className="flex items-center gap-1.5">
            <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: G.text }} />
            <p className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: G.text }}>
              {T("Next better opportunity", "അടുത്ത മികച്ച അവസരം", lang)}: #{better.h.saatNum} {translatePlanet(better.h.planet, lang)} · {better.h.startTime}–{better.h.endTime} · {better.pct}%
            </p>
          </div>
        </div>
      ) : null}

      {!anyAllowed && (
        <div className="rounded-xl p-2.5 mb-2" style={{ background: "rgba(248,113,113,0.10)", border: "1px solid rgba(248,113,113,0.45)" }}>
          <p className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: "#F87171" }}>
            {T("No suitable planetary hour remains today. Please refer to the Future Opportunities card.", "ഇന്ന് ഉചിതമായ ഗ്രഹ മണിക്കൂർ ബാക്കിയില്ല. ഭാവി അവസരങ്ങൾ കാർഡ് കാണുക.", lang)}
          </p>
        </div>
      )}

      {/* ── Remaining hours of the current cycle ── */}
      {scored.length === 0 ? (
        <p className={lang === "ml" ? "font-malayalam text-sm" : "font-inter text-sm"} style={{ color: "rgba(255,255,255,0.60)" }}>
          {T(NO_RULE_EN, NO_RULE_ML, lang)}
        </p>
      ) : (
        <div className="space-y-1.5">
          <p className="font-inter text-[10px] uppercase tracking-wider mb-1" style={{ color: G.dim }}>
            {periodLabel} · {T("remaining hours", "ബാക്കി മണിക്കൂറുകൾ", lang)}
          </p>
          {scored.map((s, i) => {
            const { h, pct, status: st } = s;
            const c = compatColor(pct);
            const isCurrent = h.saatNum === currentSaat;
            const reason = h.status === "neutral" && !firstSentence(h.reasonEn)
              ? T(NO_RULE_EN, NO_RULE_ML, lang)
              : (lang === "ml" && h.reasonMl ? firstSentence(h.reasonMl) : firstSentence(h.reasonEn)) || T(NO_RULE_EN, NO_RULE_ML, lang);
            return (
              <div key={i} className="rounded-lg p-2.5" style={{
                background: isCurrent ? G.bgHi : G.bg,
                border: `1px solid ${isCurrent ? G.borderHi : G.border}`,
              }}>
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>
                    {isCurrent && <span className="mr-1.5 px-1.5 py-0.5 rounded-full text-[8px]" style={{ background: G.text, color: "#0d1b2a" }}>{T("Now", "ഇപ്പോൾ", lang)}</span>}
                    {h.startTime}–{h.endTime} · #{h.saatNum} {translatePlanet(h.planet, lang)}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="font-inter text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: st.c, border: `1px solid ${st.c}55`, background: `${st.c}12` }}>{lang === "ml" ? st.ml : st.en}</span>
                    <span className="font-inter text-xs font-bold" style={{ color: c }}>{pct}%</span>
                  </div>
                </div>
                <p className={lang === "ml" ? "font-malayalam text-[10px]" : "font-inter text-[10px]"} style={{ color: "rgba(255,255,255,0.62)" }}>{reason}</p>
                {onApply && !isCurrent && (
                  <button onClick={() => applyItem(h)} className="mt-1.5 w-full rounded-lg py-1.5 font-inter text-[11px] font-bold flex items-center justify-center gap-1" style={{ background: "rgba(212,175,55,0.15)", color: G.text, border: `1px solid ${G.border}` }}>
                    <Check className="w-3 h-3" />{T("Apply", "പ്രയോഗിക്കുക", lang)}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Today's Unsuitable Planetary Hours ── */}
      <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${G.border}` }}>
        <p className="font-inter text-[10px] uppercase tracking-wider mb-2" style={{ color: "#F87171" }}>
          {T("Today's Unsuitable Planetary Hours", "ഇന്നത്തെ അനുചിതമായ ഗ്രഹ മണിക്കൂറുകൾ", lang)}
        </p>
        {(() => {
          const bad = scored.filter(s => s.h.status === "forbidden");
          if (bad.length === 0) {
            return (
              <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "#4ADE80" }}>
                {T("All remaining planetary hours today are suitable.", "ഇന്ന് ബാക്കിയുള്ള എല്ലാ ഗ്രഹ മണിക്കൂറുകളും ഉചിതമാണ്.", lang)}
              </p>
            );
          }
          return (
            <div className="space-y-1.5">
              {bad.map((s, i) => {
                const h = s.h;
                return (
                  <div key={i} className="rounded-lg p-2.5" style={{ background: "rgba(153,27,27,0.12)", border: "1px solid rgba(248,113,113,0.45)" }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>
                        {h.startTime}–{h.endTime} · #{h.saatNum} {translatePlanet(h.planet, lang)}
                      </p>
                      <span className="font-inter text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: "#F87171", border: "1px solid #F8717155", background: "#F8717112" }}>
                        {T("Not Suitable", "അനുചിതം", lang)}
                      </span>
                    </div>
                    <p className={lang === "ml" ? "font-malayalam text-[10px]" : "font-inter text-[10px]"} style={{ color: "rgba(255,255,255,0.62)" }}>
                      {unsuitableReason(h, analysis?.req, lang)}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </CollapsibleBox>
  );
}