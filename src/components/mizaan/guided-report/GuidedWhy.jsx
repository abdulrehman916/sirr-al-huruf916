// ═══ SECTION 3 — WHY? ═══
// Displays only the reasons that apply to the CURRENT selection.
import { CheckCircle2, XCircle } from "lucide-react";
import GuidedCard from "./GuidedCard";
import { G, T } from "../ritual-report/shared";

export default function GuidedWhy({ analysis, lang }) {
  const isSuitable = analysis?.verdict === "Suitable";
  const reasons = isSuitable
    ? analysis?.currentSaatAnalysis?.acceptanceReasons || []
    : analysis?.currentSaatAnalysis?.rejectionReasons || [];

  if (reasons.length === 0) return null;

  const color = isSuitable ? "#4ADE80" : "#F87171";
  const Icon = isSuitable ? CheckCircle2 : XCircle;

  return (
    <GuidedCard>
      <h3
        className={
          lang === "ml"
            ? "font-malayalam text-sm font-bold mb-3"
            : "font-inter text-sm font-bold mb-3"
        }
        style={{ color: "#fff" }}
      >
        {isSuitable
          ? T("Why Suitable", "എന്തുകൊണ്ട് അനുയോജ്യം", lang)
          : T("Why Not Suitable", "എന്തുകൊണ്ട് അനുയോജ്യമല്ല", lang)}
      </h3>
      <div className="space-y-2">
        {reasons.map((reason, idx) => {
          const text =
            lang === "ml" && reason.text_ml
              ? reason.text_ml
              : reason.text_en;
          if (!text) return null;
          return (
            <div key={idx} className="flex items-start gap-2">
              <Icon
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color }}
              />
              <p
                className={
                  lang === "ml" && reason.text_ml
                    ? "font-malayalam text-xs leading-relaxed"
                    : "font-inter text-xs leading-relaxed"
                }
                style={{ color: "rgba(255,255,255,0.80)" }}
              >
                {text}
              </p>
            </div>
          );
        })}
      </div>
    </GuidedCard>
  );
}