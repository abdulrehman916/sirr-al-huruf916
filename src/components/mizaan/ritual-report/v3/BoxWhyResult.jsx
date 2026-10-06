import { HelpCircle, Check, X, Minus } from "lucide-react";
import { G, T, Box, RuleSources } from "./shared";

// BOX 3 — WHY THIS RESULT? (conclusion-first)
// One conclusion first: supported / opposed / no rules. Then per-dimension
// breakdown below. Every reason comes only from uploaded database rules.
export default function BoxWhyResult({ analysis, lang }) {
  const breakdown = analysis?.selectionAnalysis?.decisionBreakdown || [];
  const matching = analysis?.matchingRules || [];
  const conflicting = analysis?.conflictingRules || [];
  const supportCount = matching.length;
  const opposeCount = conflicting.length;

  let conclEn, conclMl, conclColor;
  if (supportCount === 0 && opposeCount === 0) {
    conclEn = "No uploaded book rules apply to the current moment.";
    conclMl = "നിലവിലെ നിമിഷത്തിന് അപ്‌ലോഡ് ചെയ്ത പുസ്തക നിയമങ്ങളൊന്നുമില്ല.";
    conclColor = G.dim;
  } else if (supportCount >= opposeCount && supportCount > 0) {
    conclEn = `Supported by ${supportCount} rule(s)${opposeCount ? `, opposed by ${opposeCount}` : ""}.`;
    conclMl = `${supportCount} നിയമങ്ങൾ പിന്തുണയ്ക്കുന്നു${opposeCount ? `, ${opposeCount} എതിരാണ്` : ""}.`;
    conclColor = "#4ADE80";
  } else {
    conclEn = `Opposed by ${opposeCount} rule(s)${supportCount ? `, supported by ${supportCount}` : ""}.`;
    conclMl = `${opposeCount} നിയമങ്ങൾ എതിരാണ്${supportCount ? `, ${supportCount} പിന്തുണയ്ക്കുന്നു` : ""}.`;
    conclColor = "#F87171";
  }

  const iconFor = (status) => {
    if (status === "pass") return <Check className="w-4 h-4" style={{ color: "#4ADE80" }} />;
    if (status === "fail") return <X className="w-4 h-4" style={{ color: "#F87171" }} />;
    return <Minus className="w-4 h-4" style={{ color: G.dim }} />;
  };
  const FRIENDLY = { weekday: ["Friendly weekday", "സൗഹൃദ ദിവസം"], hour: ["Friendly Saat", "സൗഹൃദ സഅാത്"], enemyPlanet: ["Friendly planet", "സൗഹൃദ ഗ്രഹം"], dayNight: ["Friendly period", "സൗഹൃദ സമയം"], forbidden: ["Allowed", "അനുവദനീയം"] };
  const ENEMY = { weekday: ["Enemy weekday", "ശത്രു ദിവസം"], hour: ["Enemy Saat", "ശത്രു സഅാത്"], enemyPlanet: ["Enemy planet", "ശത്രു ഗ്രഹം"], dayNight: ["Enemy period", "ശത്രു സമയം"], forbidden: ["Forbidden combination", "നിരോധിത കൂട്ടായ്മ"] };
  const labelFor = (b) => {
    if (b.status === "pass") { const f = FRIENDLY[b.dimension] || ["Supports", "പിന്തുണയ്ക്കുന്നു"]; return T(f[0], f[1], lang); }
    if (b.status === "fail") { const e = ENEMY[b.dimension] || ["Opposes", "എതിരാണ്"]; return T(e[0], e[1], lang); }
    return T("Neutral", "നിഷ്പക്ഷം", lang);
  };

  return (
    <Box number={3} titleEn="Why This Result?" titleMl="ഈ ഫലം എന്തുകൊണ്ട്?" icon={HelpCircle} lang={lang}>
      {/* CONCLUSION FIRST */}
      <div className="rounded-xl p-3 mb-3" style={{ background: `${conclColor}12`, border: `1px solid ${conclColor}40` }}>
        <p className={lang === "ml" ? "font-malayalam text-sm font-bold leading-snug" : "font-inter text-sm font-bold leading-snug"} style={{ color: conclColor }}>
          {lang === "ml" ? conclMl : conclEn}
        </p>
      </div>

      {/* SUPPORTING DETAILS */}
      {breakdown.length > 0 && (
        <div className="space-y-2">
          {breakdown.map((b, i) => {
            const reason = lang === "ml" && b.reasonMl ? b.reasonMl : (b.reason || "");
            const clean = String(reason).split(/\n---\n/)[0].split(/\n/)[0].trim();
            return (
              <div key={i} className="rounded-lg p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                <div className="flex items-center gap-2 mb-1">
                  {iconFor(b.status)}
                  <p className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{b.label || b.dimension}</p>
                  <span className="font-inter text-[9px] uppercase tracking-wider ml-auto" style={{ color: G.dim }}>{labelFor(b)}</span>
                </div>
                {clean && <p className={lang === "ml" ? "font-malayalam text-xs leading-relaxed" : "font-inter text-xs leading-relaxed"} style={{ color: "rgba(255,255,255,0.72)" }}>{clean}</p>}
                {b.source && <p className="font-inter text-[9px] mt-1" style={{ color: G.dim }}>{T("Source", "ഉറവിടം", lang)}: {b.source}</p>}
              </div>
            );
          })}
        </div>
      )}
      {/* EVERY SOURCE — Book · Page · Title for all supporting & opposing rules */}
      {matching.length > 0 && (
        <div className="mt-3">
          <p className="font-inter text-[9px] uppercase tracking-wider mb-1.5" style={{ color: "#4ADE80" }}>{T("Supporting Sources", "പിന്തുണയ്ക്കുന്ന ഉറവിടങ്ങൾ", lang)}</p>
          <RuleSources rules={matching} lang={lang} tone="support" />
        </div>
      )}
      {conflicting.length > 0 && (
        <div className="mt-3">
          <p className="font-inter text-[9px] uppercase tracking-wider mb-1.5" style={{ color: "#F87171" }}>{T("Opposing Sources", "എതിർ ഉറവിടങ്ങൾ", lang)}</p>
          <RuleSources rules={conflicting} lang={lang} tone="oppose" />
        </div>
      )}
      <p className={lang === "ml" ? "font-malayalam text-[10px] mt-3" : "font-inter text-[10px] mt-3"} style={{ color: "rgba(255,255,255,0.45)" }}>
        {T("All explanations come from uploaded book rules.", "എല്ലാ വിശദീകരണങ്ങളും അപ്‌ലോഡ് ചെയ്ത പുസ്തക നിയമങ്ങളിൽ നിന്നാണ്.", lang)}
      </p>
    </Box>
  );
}