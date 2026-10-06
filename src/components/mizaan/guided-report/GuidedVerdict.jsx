// ═══ SECTION 2 — CURRENT RITUAL ANALYSIS ═══
// Shows only: ✔ Suitable or ✘ Not Suitable
import { CheckCircle2, XCircle } from "lucide-react";
import GuidedCard from "./GuidedCard";
import { G, T } from "../ritual-report/shared";

export default function GuidedVerdict({ analysis, lang }) {
  const isSuitable = analysis?.verdict === "Suitable";
  const color = isSuitable ? "#4ADE80" : "#F87171";
  const Icon = isSuitable ? CheckCircle2 : XCircle;

  return (
    <GuidedCard accent={`${color}50`} style={{ padding: "1.5rem" }}>
      <div className="flex items-center gap-4">
        <Icon className="w-10 h-10 flex-shrink-0" style={{ color }} />
        <div>
          <p
            className="font-inter text-[10px] uppercase tracking-wider"
            style={{ color: G.dim }}
          >
            {T(
              "Current Ritual Analysis",
              "നിലവിലെ ലക്ഷ്യ വിശകലനം",
              lang
            )}
          </p>
          <p
            className={
              lang === "ml"
                ? "font-malayalam text-2xl font-bold"
                : "font-inter text-2xl font-bold"
            }
            style={{ color }}
          >
            {isSuitable
              ? T("Suitable", "അനുയോജ്യം", lang)
              : T("Not Suitable", "അനുയോജ്യമല്ല", lang)}
          </p>
        </div>
      </div>
    </GuidedCard>
  );
}