// ═══════════════════════════════════════════════════════════════
// SECTION 11 — DECISION SUMMARY
// Displays: Current Status, Why, Next Best Time, Things to Avoid,
// Best Alternative
// ═══════════════════════════════════════════════════════════════
import { CheckCircle2, XCircle, AlertCircle, Sunset, Ban } from "lucide-react";
import ReportSection from "./ReportSection";
import { G, T, translatePlanet, translateDay, saatDisplayNum } from "./shared";

// Strip source citations and Turkish book references from text
const cleanText = (text) => {
  if (!text) return "";
  return text
    .replace(/\s*Source:.*?(\.|$)/gi, "")
    .replace(/\s*Source\s*:.*$/gi, "")
    .replace(/Havâss[^\s]*\s*Derinlikleri[^\n]*/gi, "")
    .replace(/\s*—\s*Source.*$/gi, "")
    .trim();
};

export default function SectionDecisionSummary({ analysis, lang }) {
  const verdict = analysis?.verdict || "Not Suitable";
  const verdictReason = cleanText(analysis?.verdictReason || "");
  const explanationMl = cleanText(analysis?.selectionAnalysis?.originalExplanationMl || "");
  const nextOpp = analysis?.nextOpportunity || null;
  const betterAlternatives = analysis?.betterAlternatives || {};
  const bestAlt = betterAlternatives.betterSaats?.[0] || betterAlternatives.nextLayl || null;
  const enemyAnalysis = analysis?.enemyAnalysis || {};
  const req = analysis?.req || {};

  const verdictSuitable = verdict === "Suitable";
  const verdictColor = verdictSuitable ? "#4ADE80" : "#F87171";
  const VerdictIcon = verdictSuitable ? CheckCircle2 : XCircle;

  // Things to avoid
  const thingsToAvoid = [];
  if (req.worstDays?.length > 0) {
    thingsToAvoid.push(`${T("Forbidden Days", "നിരോധിത ദിവസങ്ങൾ", lang)}: ${req.worstDays.map((d) => translateDay(d, lang)).join(", ")}`);
  }
  if (req.worstHours?.length > 0) {
    thingsToAvoid.push(`${T("Forbidden Saat", "നിരോധിത സഅാത്", lang)}: ${req.worstHours.map((p) => translatePlanet(p, lang)).join(", ")}`);
  }
  if (req.enemyPlanets?.length > 0) {
    thingsToAvoid.push(`${T("Enemy Planets", "ശത്രു ഗ്രഹങ്ങൾ", lang)}: ${req.enemyPlanets.map((p) => translatePlanet(p, lang)).join(", ")}`);
  }
  if (req.nightRequired === true) {
    thingsToAvoid.push(T("Daytime (Nahar) — Night required", "പകൽ (നഹർ) — രാത്രി ആവശ്യം", lang));
  }

  return (
    <ReportSection
      number={11}
      title="Decision Summary"
      titleMl="തീരുമാന സംഗ്രഹം"
      icon={AlertCircle}
      lang={lang}
      accent={verdictColor}
    >
      {/* Current Status */}
      <div
        className="rounded-xl p-4"
        style={{
          background: `${verdictColor}08`,
          border: `1px solid ${verdictColor}30`,
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <VerdictIcon className="w-6 h-6 flex-shrink-0" style={{ color: verdictColor }} />
          <span
            className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"}
            style={{ color: "#fff" }}
          >
            {T("Current Status", "നിലവിലെ അവസ്ഥ", lang)}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="font-inter text-lg font-bold px-4 py-1.5 rounded-lg"
            style={{
              background: `${verdictColor}20`,
              border: `1px solid ${verdictColor}50`,
              color: verdictColor,
            }}
          >
            {verdictSuitable ? T("Suitable", "അനുയോജ്യം", lang) : T("Not Suitable", "അനുയോജ്യമല്ല", lang)}
          </span>
        </div>
        {verdictReason && (
          <p
            className={
              lang === "ml" && analysis?.selectionAnalysis?.originalExplanationMl
                ? "font-malayalam text-xs leading-relaxed"
                : "font-inter text-xs leading-relaxed"
            }
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {lang === "ml" && explanationMl
              ? explanationMl
              : verdictReason}
          </p>
        )}
      </div>

      {/* Why */}
      <div className="rounded-xl p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: G.dim }}>
          {T("Why", "കാരണം", lang)}
        </p>
        <p
          className={lang === "ml" ? "font-malayalam text-xs leading-relaxed" : "font-inter text-xs leading-relaxed"}
          style={{ color: "rgba(255,255,255,0.75)" }}
        >
          {verdictReason || T(
            "See the detailed analysis above.",
            "മുകളിലെ വിശദമായ വിശകലനം കാണുക.",
            lang
          )}
        </p>
      </div>

      {/* Next Best Time */}
      <div className="rounded-xl p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: G.dim }}>
          {T("Next Best Time", "അടുത്ത മികച്ച സമയം", lang)}
        </p>
        {nextOpp ? (
          <p className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: "#4ADE80" }}>
            {translateDay(nextOpp.dayName, lang)}, {T("Saat", "സഅാത്", lang)} #{saatDisplayNum(nextOpp.hour, nextOpp.period)} ({translatePlanet(nextOpp.planet, lang)})
            <span className="font-inter text-[10px] ml-1" style={{ color: G.dim }}>
              {nextOpp.startTime}–{nextOpp.endTime}
              {!nextOpp.isToday && ` (${nextOpp.daysAhead} ${T("days away", "ദിവസം അകലെ", lang)})`}
            </span>
          </p>
        ) : (
          <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.60)" }}>
            {T("No suitable time within 14 days.", "14 ദിവസത്തിനുള്ളിൽ അനുയോജ്യമായ സമയമില്ല.", lang)}
          </p>
        )}
      </div>

      {/* Things to Avoid */}
      <div className="rounded-xl p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <div className="flex items-center gap-2 mb-2">
          <Ban className="w-4 h-4" style={{ color: "#F87171" }} />
          <p className="font-inter text-[10px] uppercase tracking-wider font-bold" style={{ color: "#F87171" }}>
            {T("Things to Avoid", "ഒഴിവാക്കേണ്ടവ", lang)}
          </p>
        </div>
        {thingsToAvoid.length === 0 ? (
          <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.60)" }}>
            {T("No specific things to avoid found.", "ഒഴിവാക്കേണ്ട പ്രത്യേകമായതൊന്നുമില്ല.", lang)}
          </p>
        ) : (
          thingsToAvoid.map((item, idx) => (
            <p key={`avoid-${idx}`} className="font-inter text-[11px] mb-1" style={{ color: "rgba(255,255,255,0.70)" }}>
              ✗ {item}
            </p>
          ))
        )}
      </div>

      {/* Best Alternative */}
      {bestAlt && !verdictSuitable && (
        <div
          className="rounded-xl p-3"
          style={{
            background: "rgba(74,222,128,0.06)",
            border: "1px solid rgba(74,222,128,0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sunset className="w-4 h-4" style={{ color: "#4ADE80" }} />
            <p className="font-inter text-[10px] uppercase tracking-wider font-bold" style={{ color: "#4ADE80" }}>
              {T("Best Alternative", "മികച്ച ബദൽ", lang)}
            </p>
          </div>
          {bestAlt.startTime ? (
            <p className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: "#fff" }}>
              {T("Saat", "സഅാത്", lang)} #{bestAlt.saatNum} ({translatePlanet(bestAlt.planet, lang)})
              <span className="font-inter text-[10px] ml-1" style={{ color: G.dim }}>
                {bestAlt.startTime}–{bestAlt.endTime}
              </span>
            </p>
          ) : (
            <p className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: "#fff" }}>
              {translateDay(bestAlt.dayName, lang)}, {T("Saat", "സഅാത്", lang)} #{bestAlt.saatNum} ({translatePlanet(bestAlt.planet, lang)})
            </p>
          )}
        </div>
      )}
    </ReportSection>
  );
}