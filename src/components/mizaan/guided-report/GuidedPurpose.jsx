// ═══ SECTION 1 — PURPOSE ═══
// Displays only the selected purpose. Nothing more.
import { Target } from "lucide-react";
import GuidedCard from "./GuidedCard";
import { G, T } from "../ritual-report/shared";

export default function GuidedPurpose({ analysis, lang }) {
  const purposeEn = analysis?.ritualType || "";
  const purposeMl = analysis?.ritualSemanticMl || purposeEn;
  const purpose = lang === "ml" ? purposeMl : purposeEn;

  if (!purpose) return null;

  return (
    <GuidedCard>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}
        >
          <Target className="w-4 h-4" style={{ color: G.text }} />
        </div>
        <div>
          <p
            className="font-inter text-[10px] uppercase tracking-wider"
            style={{ color: G.dim }}
          >
            {T("Purpose", "ലക്ഷ്യം", lang)}
          </p>
          <p
            className={
              lang === "ml"
                ? "font-malayalam text-base font-bold"
                : "font-inter text-base font-bold"
            }
            style={{ color: "#fff" }}
          >
            {purpose}
          </p>
        </div>
      </div>
    </GuidedCard>
  );
}