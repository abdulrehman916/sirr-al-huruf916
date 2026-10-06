import { Target } from "lucide-react";
import { G, T } from "../shared";

export default function SectionPurpose({ analysis, resolvedPurpose, lang }) {
  const purposeText = (lang === "ml" ? resolvedPurpose?.interpretation_ml : resolvedPurpose?.interpretation_en)
    || analysis?.ritualType
    || "";
  const semanticMl = analysis?.ritualSemanticMl || resolvedPurpose?.malayalam_meaning || "";
  const semanticEn = resolvedPurpose?.english_meaning || analysis?.ritualType || "";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)", border: `1px solid ${G.border}`, boxShadow: "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)" }}>
      <div className="flex items-center gap-3 p-4" style={{ borderBottom: `1px solid ${G.border}` }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}>
          <Target className="w-5 h-5" style={{ color: G.text }} />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}>1</span>
          <h3 className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"} style={{ color: "#fff" }}>
            {T("Purpose", "ലക്ഷ്യം", lang)}
          </h3>
        </div>
      </div>
      <div className="p-4">
        <p className={lang === "ml" ? "font-malayalam text-base font-bold leading-relaxed" : "font-inter text-base font-bold leading-relaxed"} style={{ color: "#fff" }}>
          {lang === "ml" ? (semanticMl || purposeText) : purposeText}
        </p>
        {lang === "ml" && semanticEn && semanticEn !== purposeText && (
          <p className="font-inter text-xs mt-1" style={{ color: G.dim }}>{semanticEn}</p>
        )}
      </div>
    </div>
  );
}