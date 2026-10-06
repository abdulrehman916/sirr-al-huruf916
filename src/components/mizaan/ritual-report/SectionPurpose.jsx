// ═══════════════════════════════════════════════════════════════
// SECTION 1 — PURPOSE ANALYSIS
// Displays: Selected Purpose, Purpose description, Purpose category
// ═══════════════════════════════════════════════════════════════
import { Target } from "lucide-react";
import ReportSection from "./ReportSection";
import { G, T } from "./shared";

export default function SectionPurpose({ analysis, resolvedPurpose, lang }) {
  const purposeText =
    (lang === "ml"
      ? resolvedPurpose?.interpretation_ml
      : resolvedPurpose?.interpretation_en) || analysis?.ritualType || "";

  const description =
    (lang === "ml"
      ? resolvedPurpose?.malayalam_meaning
      : resolvedPurpose?.english_meaning) || "";

  const category = analysis?.ritualCategory || analysis?.ritualType || "";

  return (
    <ReportSection
      number={1}
      title="Purpose Analysis"
      titleMl="ലക്ഷ്യ വിശകലനം"
      icon={Target}
      lang={lang}
    >
      <div
        className="rounded-xl p-3"
        style={{
          background: "linear-gradient(135deg, rgba(212,175,55,0.10) 0%, rgba(212,175,55,0.03) 100%)",
          border: `1px solid ${G.border}`,
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4" style={{ color: G.text }} />
          <span
            className="font-inter text-[10px] uppercase tracking-[0.2em] font-bold"
            style={{ color: G.text }}
          >
            {T("Selected Purpose", "തിരഞ്ഞെടുത്ത ലക്ഷ്യം", lang)}
          </span>
        </div>
        <p
          className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"}
          style={{ color: "#fff" }}
        >
          {purposeText}
        </p>
      </div>

      {description && (
        <div className="rounded-xl p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <p
            className="font-inter text-[10px] uppercase tracking-wider mb-1 font-bold"
            style={{ color: G.dim }}
          >
            {T("Purpose Description", "ലക്ഷ്യ വിവരണം", lang)}
          </p>
          <p
            className={lang === "ml" ? "font-malayalam text-xs leading-relaxed" : "font-inter text-xs leading-relaxed"}
            style={{ color: "rgba(255,255,255,0.75)" }}
          >
            {description}
          </p>
        </div>
      )}

      <div className="rounded-xl p-3" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <p
          className="font-inter text-[10px] uppercase tracking-wider mb-1 font-bold"
          style={{ color: G.dim }}
        >
          {T("Purpose Category", "ലക്ഷ്യ വിഭാഗം", lang)}
        </p>
        <p
          className={lang === "ml" ? "font-malayalam text-xs font-bold" : "font-inter text-xs font-bold"}
          style={{ color: "#fff" }}
        >
          {category}
        </p>
      </div>
    </ReportSection>
  );
}