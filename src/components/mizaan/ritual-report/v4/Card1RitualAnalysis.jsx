import { Target } from "lucide-react";
import { G, T, Box, computeCompat, compatColor, DAY_KEY_BY_INDEX } from "../v3/shared";
import { analyzeMoonCompatibility } from "@/lib/ritualTimingEngineV3";

// CARD 1 — CURRENT DECISION (compact)
// Only: current purpose, current decision, current strength, short reason
// (per-relationship ✓/✗ from imported book rules), final verdict. No context
// grid — weekday / planet / moon / mansion details live on their own cards.
export default function Card1RitualAnalysis({ analysis, lang }) {
  const live = analysis?.liveNow || {};
  const moon = analysis?.moonPhase || {};
  const moonReq = analysis?.moonReq || {};
  const req = analysis?.req || {};
  const astro = analysis?.astroClockStatus || {};
  const suitable = !!analysis?.selectionAnalysis?.suitable;
  const compat = computeCompat(analysis).final;
  const cColor = compatColor(compat);

  const purposeEn = analysis?.ritualType || T("General Work", "പൊതു കർമ്മം", lang);
  const purposeMl = analysis?.ritualSemanticMl || "";
  const purposeLabel = (lang === "ml" && purposeMl) ? purposeMl : purposeEn;

  const currentDayKey = DAY_KEY_BY_INDEX[astro.activeWeekday];
  const currentPlanetLC = String(live.kawkab || "").toLowerCase();
  const mc = analyzeMoonCompatibility({ moonReq, moonPhase: moon, moonCitations: analysis?.moonCitations || [] });
  const mansionCheck = (mc.checks || []).find(c => c.dimension === "mansion");

  // Each line is a DISTINCT relationship — never duplicated in different wording.
  // A check is only shown when an imported book rule exists for that dimension.
  const chk = [];
  if (req.days?.length) chk.push({
    pass: req.days.includes(currentDayKey),
    passLabel: T("Purpose ↔ Weekday — compatible", "ലക്ഷ്യം ↔ ദിവസം — അനുയോജ്യം", lang),
    failLabel: T("Purpose is not compatible with today's weekday.", "ലക്ഷ്യം ഇന്നത്തെ ദിവസവുമായി അനുയോജ്യമല്ല.", lang),
  });
  if (req.hours?.length) chk.push({
    pass: req.hours.map(p => p.toLowerCase()).includes(currentPlanetLC),
    passLabel: T("Purpose ↔ Planetary Hour — compatible", "ലക്ഷ്യം ↔ ഗ്രഹ സമയം — അനുയോജ്യം", lang),
    failLabel: T("Purpose is not compatible with this planetary hour.", "ലക്ഷ്യം ഈ ഗ്രഹ സമയവുമായി അനുയോജ്യമല്ല.", lang),
  });
  if (req.enemyPlanets?.length || req.worstHours?.length) {
    const enemyHit = (req.enemyPlanets || []).map(p => p.toLowerCase()).includes(currentPlanetLC) || (req.worstHours || []).map(p => p.toLowerCase()).includes(currentPlanetLC);
    chk.push({
      pass: !enemyHit,
      passLabel: T("Purpose ↔ Current Planet — compatible", "ലക്ഷ്യം ↔ നിലവിലെ ഗ്രഹം — അനുയോജ്യം", lang),
      failLabel: T("Purpose is not compatible with the current planet.", "ലക്ഷ്യം നിലവിലെ ഗ്രഹവുമായി അനുയോജ്യമല്ല.", lang),
    });
  }
  if (mc.hasMoonRules) chk.push({
    pass: mc.compatible,
    passLabel: T("Purpose ↔ Moon Condition — compatible", "ലക്ഷ്യം ↔ ചന്ദ്ര അവസ്ഥ — അനുയോജ്യം", lang),
    failLabel: T("Purpose is not compatible with the current moon condition.", "ലക്ഷ്യം നിലവിലെ ചന്ദ്ര അവസ്ഥയുമായി അനുയോജ്യമല്ല.", lang),
  });
  if (mansionCheck) chk.push({
    pass: mansionCheck.status === "pass",
    passLabel: T("Purpose ↔ Lunar Mansion — compatible", "ലക്ഷ്യം ↔ ചന്ദ്ര നക്ഷത്രം — അനുയോജ്യം", lang),
    failLabel: T("Purpose is not compatible with the current lunar mansion.", "ലക്ഷ്യം നിലവിലെ ചന്ദ്ര നക്ഷത്രവുമായി അനുയോജ്യമല്ല.", lang),
  });

  const passes = chk.filter(c => c.pass).length;
  const fails = chk.filter(c => !c.pass).length;
  const finalResult = chk.length === 0 ? T("No matching rule found in the imported sources.", "ഇറക്കുമതി ചെയ്ത സ്രോതസ്സുകളിൽ പൊരുത്തപ്പെടുന്ന നിയമമൊന്നുമില്ല.", lang)
    : fails === 0 ? T("Fully compatible", "പൂർണ്ണമായി അനുയോജ്യം", lang)
      : fails >= passes ? T("Not suitable", "അനുയോജ്യമല്ല", lang) : T("Strong but not perfect", "ശക്തമെങ്കിലും പൂർണ്ണമല്ല", lang);
  const frColor = chk.length === 0 ? "#94A3B8" : fails === 0 ? "#4ADE80" : fails >= passes ? "#F87171" : "#FBBF24";

  const verdict = analysis?.verdict || (suitable ? "Suitable" : "Not Suitable");
  const verdictColor = analysis?.verdictColor || (suitable ? "#4ADE80" : "#F87171");

  return (
    <Box number={1} titleEn="Current Decision" titleMl="നിലവിലെ തീരുമാനം" icon={Target} lang={lang}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Purpose", "ലക്ഷ്യം", lang)}</p>
          <p className={lang === "ml" ? "font-malayalam text-sm font-bold truncate" : "font-inter text-sm font-bold truncate"} style={{ color: "#fff" }}>{purposeLabel}</p>
        </div>
        <div className="text-center flex-shrink-0">
          <p className="font-inter text-xl font-bold" style={{ color: cColor }}>{compat}%</p>
          <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Strength", "ശക്തി", lang)}</p>
        </div>
      </div>

      <div className="rounded-xl p-2.5 mb-2" style={{ background: `${verdictColor}12`, border: `1px solid ${verdictColor}50` }}>
        <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Decision", "തീരുമാനം", lang)}</p>
        <p className="font-inter text-base font-bold" style={{ color: verdictColor }}>{verdict}</p>
      </div>

      <p className="font-inter text-[9px] uppercase tracking-wider mb-1" style={{ color: G.dim }}>{T("Why", "കാരണം", lang)}</p>
      <div className="space-y-0.5 mb-2">
        {chk.length === 0 ? (
          <p className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: "#94A3B8" }}>{T("No matching rule found in the imported sources.", "ഇറക്കുമതി ചെയ്ത സ്രോതസ്സുകളിൽ പൊരുത്തപ്പെടുന്ന നിയമമൊന്നുമില്ല.", lang)}</p>
        ) : chk.map((c, i) => (
          <p key={i} className={lang === "ml" ? "font-malayalam text-[11px]" : "font-inter text-[11px]"} style={{ color: c.pass ? "rgba(74,222,128,0.90)" : "rgba(248,113,113,0.90)" }}>{c.pass ? "✓ " : "✗ "}{c.pass ? c.passLabel : c.failLabel}</p>
        ))}
      </div>

      <div className="rounded-lg p-2" style={{ background: `${frColor}12`, border: `1px solid ${frColor}45` }}>
        <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{T("Final Verdict", "അന്തിമ വിധി", lang)}</p>
        <p className="font-inter text-sm font-bold" style={{ color: frColor }}>{finalResult}</p>
      </div>
    </Box>
  );
}