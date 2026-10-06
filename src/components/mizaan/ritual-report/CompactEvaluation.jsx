// ═══════════════════════════════════════════════════════════════
// COMPACT EVALUATION — Selected Time Evaluation
// Each factor: Status icon + Label + Value + ONE short reason
// No source citations, no database IDs, no Turkish.
// ═══════════════════════════════════════════════════════════════
import { CheckCircle2, XCircle, MinusCircle, Clock } from "lucide-react";
import { G, T, translatePlanet, translateDay } from "./shared";

// Strip Turkish text, source citations, and database references
function cleanReason(text, lang) {
  if (!text) return "";
  let cleaned = String(text)
    .replace(/Source\s*:.*?(\.|$)/gi, "")
    .replace(/Havâss[^\s]*\s*Derinlikleri[^\n]*/gi, "")
    .replace(/Astrology Clock\s*:/gi, "")
    .replace(/\n---\n/g, "\n")
    .split(/\n/)[0] // First line only — no long paragraphs
    .trim();
  return cleaned;
}

function EvalRow({ label, value, status, reason, reasonMl, lang }) {
  const isPass = status === "pass";
  const isFail = status === "fail";
  const color = isPass ? "#4ADE80" : isFail ? "#F87171" : G.dim;
  const Icon = isPass ? CheckCircle2 : isFail ? XCircle : MinusCircle;
  const statusText = isPass
    ? T("Compatible", "അനുയോജ്യം", lang)
    : isFail
    ? T("Not Compatible", "അനുയോജ്യമല്ല", lang)
    : T("Neutral", "നിഷ്പക്ഷം", lang);

  const displayReason = lang === "ml" && reasonMl ? reasonMl : reason;
  const cleanedReason = cleanReason(displayReason, lang);

  return (
    <div
      className="rounded-lg p-3"
      style={{
        background: isPass
          ? "rgba(74,222,128,0.05)"
          : isFail
          ? "rgba(248,113,113,0.05)"
          : G.bg,
        border: `1px solid ${
          isPass
            ? "rgba(74,222,128,0.20)"
            : isFail
            ? "rgba(248,113,113,0.20)"
            : G.border
        }`,
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
        <span
          className="font-inter text-[10px] uppercase tracking-wider font-bold truncate"
          style={{ color: G.dim }}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className={
            lang === "ml"
              ? "font-malayalam text-xs font-bold"
              : "font-inter text-xs font-bold"
          }
          style={{ color: "#fff" }}
        >
          {value}
        </span>
        <span
          className="font-inter text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0"
          style={{ background: `${color}20`, color, border: `1px solid ${color}40` }}
        >
          {statusText}
        </span>
      </div>
      {cleanedReason && (
        <p
          className={
            lang === "ml"
              ? "font-malayalam text-[11px] leading-relaxed"
              : "font-inter text-[11px] leading-relaxed"
          }
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          {T("Reason", "കാരണം", lang)}: {cleanedReason}
        </p>
      )}
    </div>
  );
}

export default function CompactEvaluation({ analysis, lang }) {
  const breakdown = analysis?.selectionAnalysis?.decisionBreakdown || [];
  const liveNow = analysis?.liveNow || {};
  const moonPhase = analysis?.moonPhase || {};
  const verdict = analysis?.verdict || "Not Suitable";

  // Only show factors that the user has selected (skip "Not selected" / neutral)
  const factors = [];

  for (const b of breakdown) {
    // Skip neutral factors with no selection
    if (b.status === "neutral" && (!b.currentValue || b.currentValue === "Not selected"))
      continue;

    let label = b.label;
    // Rename "Current" → "Selected" per user requirement
    label = label.replace(/^Current\s+/, "Selected ");

    factors.push({
      label: T(label, label, lang), // Will be translated below
      rawLabel: label,
      value: b.currentValue,
      status: b.status,
      reason: b.reason,
      reasonMl: b.reasonMl,
    });
  }

  // Translate labels
  const labelMap = {
    "Weekday": { en: "Selected Day", ml: "തിരഞ്ഞെടുത്ത ദിവസം" },
    "Planetary Hour (Saat)": { en: "Selected Hour", ml: "തിരഞ്ഞെടുത്ത സഅാത്" },
    "Layl / Nahar": { en: "Selected Day/Night", ml: "തിരഞ്ഞെടുത്ത പകൽ/രാത്രി" },
    "Enemy Relationship": { en: "Enemy Relationship", ml: "ശത്രു ബന്ധം" },
    "Forbidden Timing": { en: "Forbidden Timing", ml: "നിരോധിത സമയം" },
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${G.border}`,
      }}
    >
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}
        >
          <Clock className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <h3
          className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"}
          style={{ color: "#fff" }}
        >
          {T("Selected Time Evaluation", "തിരഞ്ഞെടുത്ത സമയ വിലയിരുത്തൽ", lang)}
        </h3>
      </div>
      <div className="p-4 space-y-2">
        {factors.length === 0 ? (
          <p
            className={lang === "ml" ? "font-malayalam text-xs" : "font-inter text-xs"}
            style={{ color: "rgba(255,255,255,0.60)" }}
          >
            {T(
              "No time factors selected.",
              "സമയ ഘടകങ്ങളൊന്നും തിരഞ്ഞെടുത്തിട്ടില്ല.",
              lang
            )}
          </p>
        ) : (
          factors.map((f, idx) => {
            const translatedLabel = labelMap[f.rawLabel]
              ? (lang === "ml" ? labelMap[f.rawLabel].ml : labelMap[f.rawLabel].en)
              : f.rawLabel;
            // Translate value if it's a planet or day
            let displayValue = f.value;
            if (f.rawLabel === "Weekday") displayValue = translateDay(f.value, lang);
            if (f.rawLabel === "Planetary Hour (Saat)") {
              // Value is like "Saat #3 (Jupiter)" — translate the planet part
              displayValue = f.value.replace(/\(([^)]+)\)/, (match, planet) =>
                `(${translatePlanet(planet, lang)})`
              );
            }
            return (
              <EvalRow
                key={`eval-${idx}`}
                label={translatedLabel}
                value={displayValue}
                status={f.status}
                reason={f.reason}
                reasonMl={f.reasonMl}
                lang={lang}
              />
            );
          })
        )}
      </div>
    </div>
  );
}