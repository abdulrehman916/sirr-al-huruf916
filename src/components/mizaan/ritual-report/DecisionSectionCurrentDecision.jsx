// ═══════════════════════════════════════════════════════════════
// SECTION 1 — CURRENT DECISION
// Selections + Compatibility % + Verdict + WHY (2-4 lines)
// ═══════════════════════════════════════════════════════════════
import { CheckCircle2, XCircle, AlertCircle, Scale } from "lucide-react";
import { G, T, translatePlanet, translateDay, MIZAN_DAY_NAMES, DAY_KEY_BY_INDEX, saatDisplayNum } from "./shared";

function computeDimensionBreakdown(analysis) {
  const req = analysis?.req || {};
  const liveNow = analysis?.liveNow || {};
  const astro = analysis?.astroClockStatus || {};
  const matchingRules = analysis?.matchingRules || [];
  const planetLC = String(liveNow.kawkab || liveNow.planetaryHour || "").toLowerCase();
  const dayKey = DAY_KEY_BY_INDEX[astro.activeWeekday];

  const purposeMatch = analysis?.ritualType && analysis.ritualType !== "General Work" ? 100 : 0;
  const bookRuleMatch = matchingRules.length > 0 ? 100 : 0;
  let dayMatch = 50;
  if (req.days?.includes(dayKey)) dayMatch = 100;
  else if (req.worstDays?.includes(dayKey)) dayMatch = 0;
  else if (req.days?.length > 0) dayMatch = 40;
  let saatMatch = 50;
  if (req.hours?.some((p) => p.toLowerCase() === planetLC)) saatMatch = 100;
  else if (req.worstHours?.some((p) => p.toLowerCase() === planetLC)) saatMatch = 0;
  else if (req.hours?.length > 0) saatMatch = 40;
  let planetMatch = 50;
  if (req.hours?.some((p) => p.toLowerCase() === planetLC)) planetMatch = 100;
  else if (req.enemyPlanets?.some((p) => p.toLowerCase() === planetLC)) planetMatch = 10;
  else if (req.worstHours?.some((p) => p.toLowerCase() === planetLC)) planetMatch = 10;
  const final = Math.round((purposeMatch + bookRuleMatch + dayMatch + saatMatch + planetMatch) / 5);
  return { purposeMatch, bookRuleMatch, dayMatch, saatMatch, planetMatch, final };
}

function cleanReason(text) {
  if (!text) return "";
  return String(text).replace(/Source\s*:.*?(\.|$)/gi, "").replace(/Astrology Clock\s*:/gi, "").split(/\n/)[0].trim();
}

export default function DecisionSectionCurrentDecision({ analysis, resolvedPurpose, lang }) {
  const verdict = analysis?.verdict || "Not Suitable";
  const canPerform = analysis?.canPerformToday || "No";
  const breakdown = analysis?.selectionAnalysis?.decisionBreakdown || [];
  const failedItems = breakdown.filter((b) => b.status === "fail");
  const acceptanceReasons = analysis?.currentSaatAnalysis?.acceptanceReasons || [];
  const rejectionReasons = analysis?.currentSaatAnalysis?.rejectionReasons || [];

  const isExplicitlyForbidden = analysis?.selectionAnalysis?.forbidden === true;
  const dims = computeDimensionBreakdown(analysis);
  const compatPct = dims.final;
  let displayVerdict, verdictColor, VerdictIcon, emoji;
  if (isExplicitlyForbidden) {
    displayVerdict = "Forbidden"; verdictColor = "#F87171"; VerdictIcon = XCircle; emoji = "⛔";
  } else if (compatPct >= 85) {
    displayVerdict = "Very Strong"; verdictColor = "#4ADE80"; VerdictIcon = CheckCircle2; emoji = "✅";
  } else if (compatPct >= 70) {
    displayVerdict = "Strong"; verdictColor = "#4ADE80"; VerdictIcon = CheckCircle2; emoji = "✅";
  } else if (compatPct >= 50) {
    displayVerdict = "Moderate"; verdictColor = "#FBBF24"; VerdictIcon = AlertCircle; emoji = "⚠";
  } else {
    displayVerdict = "Weak"; verdictColor = "#FB923C"; VerdictIcon = AlertCircle; emoji = "⚠";
  }
  const labelMl = { "Very Strong": "വളരെ ശക്തം", "Strong": "ശക്തം", "Moderate": "മിതമായ", "Weak": "ദുർബലം", "Forbidden": "വിലക്കപ്പെട്ടത്" };
  const compatColor = compatPct >= 70 ? "#4ADE80" : compatPct >= 50 ? "#FBBF24" : "#F87171";
  const liveNow = analysis?.liveNow || {};
  const purposeText = (lang === "ml" ? resolvedPurpose?.interpretation_ml : resolvedPurpose?.interpretation_en) || analysis?.ritualType || "";

  // WHY — Purpose-first flow: Purpose → Book → Day → Saat → Planet → Verdict
  const matchingRules = analysis?.matchingRules || [];
  const firstMatch = matchingRules[0];
  const bookName = firstMatch?.source || "";
  const recDay = firstMatch?.weekday != null ? MIZAN_DAY_NAMES[DAY_KEY_BY_INDEX[firstMatch.weekday]] : null;
  const recSaat = firstMatch?.saat_number != null ? saatDisplayNum(firstMatch.saat_number, firstMatch.period) : null;
  const recPlanet = firstMatch?.planet || null;

  const whyLines = [];
  whyLines.push(`${T("Purpose", "ലക്ഷ്യം", lang)}: ${purposeText}`);
  if (bookName && recSaat) {
    const recStr = recDay ? `${translateDay(recDay, lang)} ${T("Saat", "സഅാത്", lang)} #${recSaat}` : `${T("Saat", "സഅാത്", lang)} #${recSaat}`;
    const planetStr = recPlanet ? ` (${translatePlanet(recPlanet, lang)})` : "";
    whyLines.push(`${bookName} ${T("recommends", "ശുപാർശ ചെയ്യുന്നു", lang)}: ${recStr}${planetStr}`);
  }
  const selDay = translateDay(liveNow.day, lang);
  const selSaat = liveNow.saat || "—";
  const selPlanet = translatePlanet(liveNow.kawkab || liveNow.planetaryHour, lang);
  whyLines.push(`${T("Your selection", "നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ്", lang)}: ${selDay} ${T("Saat", "സഅാത്", lang)} #${selSaat} (${selPlanet})`);
  const reasons = displayVerdict === "Suitable" ? acceptanceReasons : displayVerdict === "Partially Suitable" ? [...acceptanceReasons, ...rejectionReasons] : rejectionReasons;
  const dbReason = reasons.map((r) => cleanReason(lang === "ml" && r.text_ml ? r.text_ml : r.text_en)).filter(Boolean).slice(0, 1).join(" ");
  if (dbReason) whyLines.push(dbReason);

  function DimBar({ label, pct }) {
    const c = pct >= 70 ? "#4ADE80" : pct >= 50 ? "#FBBF24" : pct > 0 ? "#FB923C" : "#F87171";
    return (
      <div className="flex items-center justify-between gap-2">
        <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{label}</span>
        <div className="flex items-center gap-2 flex-1 max-w-[60%]">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c }} />
          </div>
          <span className="font-inter text-[10px] font-bold flex-shrink-0" style={{ color: c }}>{pct}%</span>
        </div>
      </div>
    );
  }

  function SelRow({ label, value }) {
    if (!value && value !== 0) return null;
    return (
      <div className="flex items-center justify-between gap-2 py-1.5 border-b last:border-0" style={{ borderColor: G.border }}>
        <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: G.dim }}>{label}</span>
        <span className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"} style={{ color: "#fff" }}>{value}</span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <Scale className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>1</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Current Decision", "നിലവിലെ തീരുമാനം", lang)}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {/* Selections + Compat */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <SelRow label={T("Purpose", "ലക്ഷ്യം", lang)} value={purposeText} />
            <SelRow label={T("Day", "ദിവസം", lang)} value={translateDay(liveNow.day, lang)} />
            <SelRow label={T("Saat", "സഅാത്", lang)} value={`#${liveNow.saat || "—"}`} />
            <SelRow label={T("Planet", "ഗ്രഹം", lang)} value={translatePlanet(liveNow.kawkab || liveNow.planetaryHour, lang)} />
          </div>
          <div className="rounded-xl p-3 text-center flex flex-col justify-center" style={{ background: `${compatColor}08`, border: `1px solid ${compatColor}30` }}>
            <p className="font-inter text-2xl font-bold" style={{ color: compatColor }}>{compatPct}%</p>
            <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Compat", "പൊരുത്തം", lang)}</p>
          </div>
        </div>

        {/* Per-dimension compatibility breakdown */}
        <div className="rounded-lg p-3 space-y-1.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <DimBar label={T("Purpose Match", "ലക്ഷ്യ പൊരുത്തം", lang)} pct={dims.purposeMatch} />
          <DimBar label={T("Book Rule Match", "പുസ്തക നിയമ പൊരുത്തം", lang)} pct={dims.bookRuleMatch} />
          <DimBar label={T("Day Match", "ദിവസ പൊരുത്തം", lang)} pct={dims.dayMatch} />
          <DimBar label={T("Saat Match", "സഅാത് പൊരുത്തം", lang)} pct={dims.saatMatch} />
          <DimBar label={T("Planet Match", "ഗ്രഹ പൊരുത്തം", lang)} pct={dims.planetMatch} />
          <div className="flex items-center justify-between gap-2 pt-1.5 mt-1 border-t" style={{ borderColor: G.border }}>
            <span className="font-inter text-[10px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>{T("Final Compatibility", "അന്തിമ പൊരുത്തം", lang)}</span>
            <span className="font-inter text-sm font-bold" style={{ color: compatColor }}>{dims.final}%</span>
          </div>
        </div>

        {/* Verdict */}
        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: `${verdictColor}08`, border: `1px solid ${verdictColor}30` }}>
          <VerdictIcon className="w-8 h-8 flex-shrink-0" style={{ color: verdictColor }} />
          <span className={lang === "ml" ? "font-malayalam text-lg font-bold" : "font-inter text-lg font-bold"} style={{ color: verdictColor }}>
            {emoji} {lang === "ml" ? labelMl[displayVerdict] : displayVerdict}
          </span>
        </div>

        {/* WHY */}
        <div className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          {whyLines.length > 0 ? (
            whyLines.map((line, idx) => (
              <p key={idx} className={lang === "ml" ? "font-malayalam text-xs leading-relaxed mb-1 last:mb-0" : "font-inter text-xs leading-relaxed mb-1 last:mb-0"} style={{ color: "rgba(255,255,255,0.75)" }}>
                {line}
              </p>
            ))
          ) : (
            <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.60)" }}>
              {T("No timing data found for this purpose in the uploaded database.", "അപ്ലോഡ് ചെയ്ത ഡാറ്റാബേസിൽ ഈ ലക്ഷ്യത്തിനായി സമയ ഡാറ്റായില്ല.", lang)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}