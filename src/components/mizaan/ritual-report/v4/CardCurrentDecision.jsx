import { CheckCircle2, XCircle } from "lucide-react";
import { G, T, Box } from "../v3/shared";
import SourcesCollapse from "./SourcesCollapse";

// CARD 2 — CURRENT DECISION
// One verdict: ✅ Can Perform Now / ❌ Do Not Perform Now.
// The "why" comes ONLY from uploaded book rules (Astrology Clock knowledge +
// manuscript rules) matching the current context, plus the Astro Clock's own
// suitability text. Never invents reasons.
export default function CardCurrentDecision({ analysis, lang }) {
  const suitable = !!analysis?.selectionAnalysis?.suitable;
  const verdictReason = analysis?.verdictReason || "";

  const ctxWeekday = analysis?.astroClockStatus?.activeWeekday;
  const ctxPeriod = analysis?.liveNow?.laylNahar === "Layl" ? "night" : "day";
  const ctxSaat = analysis?.liveNow?.saat || 1;
  const ctxSaatNum = ctxPeriod === "night" ? ctxSaat + 12 : ctxSaat;

  // Context-specific rules carry weekday/period/saat_number; manuscript rules
  // are general (weekday == null) and always relevant. Both come from the DB.
  const inCtx = (r) => r.weekday == null || (r.weekday === ctxWeekday && r.period === ctxPeriod && r.saat_number === ctxSaatNum);
  const rules = suitable
    ? (analysis?.matchingRules || []).filter(inCtx)
    : (analysis?.conflictingRules || []).filter(inCtx);

  return (
    <Box number={2} titleEn="Current Decision" titleMl="നിലവിലെ തീരുമാനം" icon={suitable ? CheckCircle2 : XCircle} lang={lang}>
      <div className="rounded-xl p-4 mb-3" style={{
        background: suitable ? "rgba(74,222,128,0.10)" : "rgba(248,113,113,0.10)",
        border: `1px solid ${suitable ? "rgba(74,222,128,0.50)" : "rgba(248,113,113,0.50)"}`,
      }}>
        <p className="font-inter text-xl font-bold" style={{ color: suitable ? "#4ADE80" : "#F87171" }}>
          {suitable ? "✅ " + T("Can Perform Now", "ഇപ്പോൾ ചെയ്യാം", lang) : "❌ " + T("Do Not Perform Now", "ഇപ്പോൾ ചെയ്യരുത്", lang)}
        </p>
      </div>

      <p className="font-inter text-[9px] uppercase tracking-wider mb-1.5" style={{ color: G.dim }}>{T("Why", "കാരണം", lang)}</p>
      {verdictReason && (
        <p className={lang === "ml" ? "font-malayalam text-xs leading-relaxed mb-2" : "font-inter text-xs leading-relaxed mb-2"} style={{ color: "rgba(255,255,255,0.78)" }}>
          {String(verdictReason).split(/\n/)[0]}
        </p>
      )}
      {!verdictReason && (
        <p className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"} style={{ color: "rgba(255,255,255,0.55)" }}>
          {suitable
            ? T("Current weekday, Saat, and planetary relationship support this ritual.", "നിലവിലെ ദിവസവും സഅാത്തും ഗ്രഹ ബന്ധവും ഈ കർമ്മത്തെ പിന്തുണയ്ക്കുന്നു.", lang)
            : T("No supporting book rule found for the current moment.", "നിലവിലെ നിമിഷത്തിന് പിന്തുണയുള്ള പുസ്തക നിയമമൊന്നുമില്ല.", lang)}
        </p>
      )}
      <SourcesCollapse sources={rules} lang={lang} />
    </Box>
  );
}