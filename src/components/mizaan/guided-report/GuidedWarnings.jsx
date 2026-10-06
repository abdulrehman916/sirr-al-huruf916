// ═══ SECTION 6 — WARNINGS ═══
// Displays only warnings that actually apply. Hides if none.
import { AlertTriangle } from "lucide-react";
import GuidedCard from "./GuidedCard";
import { T } from "../ritual-report/shared";

export default function GuidedWarnings({ analysis, lang }) {
  const originalWarnings = analysis?.selectionAnalysis?.originalWarnings || [];
  const conflictingRules = analysis?.conflictingRules || [];

  // Collect applicable warnings
  const warnings = [];

  // From original warnings (have en and ml fields)
  for (const w of originalWarnings) {
    const text = lang === "ml" && w.ml ? w.ml : w.en;
    if (text) warnings.push(text);
  }

  // From conflicting rules that are warnings/enemy
  for (const r of conflictingRules) {
    if (r.field === "warnings_list" || r.field === "enemy_actions") {
      const text = lang === "ml" && r.text_ml ? r.text_ml : r.text_en;
      if (text) warnings.push(text);
    }
  }

  // Dedup
  const uniqueWarnings = [...new Set(warnings)];

  if (uniqueWarnings.length === 0) return null;

  return (
    <GuidedCard accent="rgba(248,113,113,0.30)">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4" style={{ color: "#F87171" }} />
        <h3
          className={
            lang === "ml"
              ? "font-malayalam text-sm font-bold"
              : "font-inter text-sm font-bold"
          }
          style={{ color: "#F87171" }}
        >
          {T("Warnings", "മുന്നറിയിപ്പുകൾ", lang)}
        </h3>
      </div>
      <div className="space-y-2">
        {uniqueWarnings.map((warning, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2 rounded-lg p-2"
            style={{ background: "rgba(248,113,113,0.06)" }}
          >
            <AlertTriangle
              className="w-3 h-3 flex-shrink-0 mt-0.5"
              style={{ color: "#F87171" }}
            />
            <p
              className={
                lang === "ml"
                  ? "font-malayalam text-xs leading-relaxed"
                  : "font-inter text-xs leading-relaxed"
              }
              style={{ color: "rgba(255,255,255,0.80)" }}
            >
              {warning}
            </p>
          </div>
        ))}
      </div>
    </GuidedCard>
  );
}