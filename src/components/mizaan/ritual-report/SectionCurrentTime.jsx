// ═══════════════════════════════════════════════════════════════
// SECTION 2 — CURRENT TIME ANALYSIS
// Displays every factor individually with ✓/✗ and database reason:
//   Current Day, Planetary Hour, Planet, Zodiac, Saat, Context
// ═══════════════════════════════════════════════════════════════
import { Clock, CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import ReportSection from "./ReportSection";
import { G, T, translatePlanet, translateDay } from "./shared";

function FactorRow({ label, value, status, reason, reasonMl, lang }) {
  const isPass = status === "pass";
  const isFail = status === "fail";
  const color = isPass ? "#4ADE80" : isFail ? "#F87171" : G.dim;
  const Icon = isPass ? CheckCircle2 : isFail ? XCircle : MinusCircle;

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: isPass ? "rgba(74,222,128,0.05)" : isFail ? "rgba(248,113,113,0.05)" : G.bg,
        border: `1px solid ${isPass ? "rgba(74,222,128,0.20)" : isFail ? "rgba(248,113,113,0.20)" : G.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
          <span
            className="font-inter text-[10px] uppercase tracking-wider font-bold"
            style={{ color: G.dim }}
          >
            {label}
          </span>
        </div>
        <span
          className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"}
          style={{ color: "#fff" }}
        >
          {value}
        </span>
      </div>
      {reason && (
        <p
          className={
            lang === "ml" && reasonMl
              ? "font-malayalam text-[11px] leading-relaxed mt-1"
              : "font-inter text-[11px] leading-relaxed mt-1"
          }
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          {lang === "ml" && reasonMl ? reasonMl : reason}
        </p>
      )}
    </div>
  );
}

export default function SectionCurrentTime({ analysis, lang }) {
  const liveNow = analysis?.liveNow || {};
  const moonPhase = analysis?.moonPhase || {};
  const breakdown = analysis?.selectionAnalysis?.decisionBreakdown || [];

  const getDim = (dim) => breakdown.find((b) => b.dimension === dim);

  const dayDim = getDim("weekday");
  const hourDim = getDim("hour");
  const dayNightDim = getDim("dayNight");
  const enemyDim = getDim("enemyPlanet");
  const forbiddenDim = getDim("forbidden");

  const verdictSuitable = analysis?.verdict === "Suitable";

  return (
    <ReportSection
      number={2}
      title="Current Time Analysis"
      titleMl="നിലവിലെ സമയ വിശകലനം"
      icon={Clock}
      lang={lang}
    >
      {/* Current Day */}
      <FactorRow
        label={T("Current Day", "നിലവിലെ ദിവസം", lang)}
        value={translateDay(liveNow.day, lang)}
        status={dayDim?.status || "neutral"}
        reason={dayDim?.reason}
        reasonMl={dayDim?.reasonMl}
        lang={lang}
      />

      {/* Current Planetary Hour */}
      <FactorRow
        label={T("Current Planetary Hour", "നിലവിലെ ഗ്രഹ മണിക്കൂർ", lang)}
        value={`Saat #${liveNow.saat} (${translatePlanet(liveNow.kawkab, lang)})`}
        status={hourDim?.status || "neutral"}
        reason={hourDim?.reason}
        reasonMl={hourDim?.reasonMl}
        lang={lang}
      />

      {/* Current Planet */}
      <FactorRow
        label={T("Current Planet", "നിലവിലെ ഗ്രഹം", lang)}
        value={translatePlanet(liveNow.kawkab, lang)}
        status={hourDim?.status || "neutral"}
        reason={hourDim?.reason}
        reasonMl={hourDim?.reasonMl}
        lang={lang}
      />

      {/* Current Zodiac */}
      <FactorRow
        label={T("Current Zodiac", "നിലവിലെ രാശി", lang)}
        value={moonPhase.moonSign ? `${moonPhase.moonSignSymbol || ""} ${moonPhase.moonSign}` : "—"}
        status="neutral"
        reason={T(
          "Zodiac analysis is optional — assessed via Moon Analysis.",
          "രാശി വിശകലനം ഓപ്ഷണൽ ആണ് — ചന്ദ്ര വിശകലനം വഴി വിലയിരുത്തുന്നു.",
          lang
        )}
        lang={lang}
      />

      {/* Current Saat */}
      <FactorRow
        label={T("Current Saat", "നിലവിലെ സഅാത്", lang)}
        value={`#${liveNow.saat}`}
        status={hourDim?.status || "neutral"}
        reason={hourDim?.reason}
        reasonMl={hourDim?.reasonMl}
        lang={lang}
      />

      {/* Current Context (Day/Night + overall) */}
      <FactorRow
        label={T("Current Context", "നിലവിലെ സന്ദർഭം", lang)}
        value={
          liveNow.laylNahar === "Layl"
            ? T("Night (Layl)", "രാത്രി (ലൈൽ)", lang)
            : T("Day (Nahar)", "പകൽ (നഹർ)", lang)
        }
        status={verdictSuitable ? "pass" : forbiddenDim ? "fail" : dayNightDim?.status || "neutral"}
        reason={
          forbiddenDim?.reason ||
          dayNightDim?.reason ||
          (analysis?.verdictReason && analysis.verdictReason !== "No timing data found for this purpose in the Astrology Clock."
            ? analysis.verdictReason
            : "")
        }
        reasonMl={forbiddenDim?.reasonMl || dayNightDim?.reasonMl}
        lang={lang}
      />

      {/* Enemy relationship (if present) */}
      {enemyDim && (
        <FactorRow
          label={T("Enemy Relationship", "ശത്രു ബന്ധം", lang)}
          value={enemyDim.currentValue}
          status={enemyDim.status}
          reason={enemyDim.reason}
          reasonMl={enemyDim.reasonMl}
          lang={lang}
        />
      )}
    </ReportSection>
  );
}