// FIXED DAY LAYER · Practice Rules card
// Night-vs-Day preference (Hermetic rule preserved in Kashf) + manuscript exception.
// Source: Kashf al-Haqa'iq, p.39 (هرمس).
import { useAstroData } from "../dashboard/useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import DashboardSection, { MiniCard } from "../dashboard/DashboardSection";
import { getKashfNightDayRule } from "@/lib/astroClockManuscriptMerger";
import { SourceTag, ArabicLine } from "./shared";

export default function PracticeRulesCard() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const rule = getKashfNightDayRule();

  return (
    <DashboardSection icon="🌙" title={txt("അഭ്യാസ നിയമങ്ങൾ", "Practice Rules", "قواعد العمل")} subtitle={txt("രാത്രി vs പകൽ", "Night vs Day", "الليل والنهار")}>
      <MiniCard icon={d.isNight ? "🌙" : "☀"} label={txt("നിലവിലെ കാലം", "Current period", "الوقت الحالي")} value={language === "ar" ? (d.isNight ? "ليل" : "نهار") : (d.isNight ? txt("രാത്രി", "Night", "ليل") : txt("പകൽ", "Day", "نهار"))} color="#818CF8" />
      <div className="mt-2 rounded-lg p-2" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.15)" }}>
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{language === "ar" ? rule.ar : language === "ml" ? rule.ml : rule.en}</p>
        <ArabicLine>{rule.ar}</ArabicLine>
      </div>
      <div className="mt-2 rounded-lg p-2" style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.15)" }}>
        <p className="font-inter text-[10px] font-bold mb-0.5" style={{ color: "#4ADE80" }}>{txt("അപവാദം", "Exception", "استثناء")}</p>
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>{language === "ar" ? rule.exception_ar : rule.exception_en}</p>
      </div>
      <SourceTag>{rule.source}</SourceTag>
    </DashboardSection>
  );
}