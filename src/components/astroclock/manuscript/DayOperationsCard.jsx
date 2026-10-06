// FIXED DAY LAYER · Day Operations card
// Day-ruler's day-level suitable + unsuitable operations.
// Sources: Havâss'ın Derinlikleri PDF2 p.50-62 (via manuscriptRuleEngine), PDF1 p.49-50.
import { useAstroData, PLANET_AR } from "../dashboard/useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import DashboardSection from "../dashboard/DashboardSection";
import { SourceTag, ChipList } from "./shared";

export default function DayOperationsCard() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const ruler = d.dayRuler.planet;
  const good = d.weekdayAnalysis?.goodWorks || [];
  const bad = d.weekdayAnalysis?.badWorks || [];
  const rulerName = language === "ar" ? PLANET_AR[ruler] : d.planetInfo[ruler]?.name_en;

  return (
    <DashboardSection icon="🪐" title={txt("ദിന പ്രവൃത്തികൾ", "Day Operations", "أعمال اليوم")} subtitle={`${txt("ദിന ഗ്രഹം", "Day ruler", "كوكب اليوم")}: ${rulerName}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-lg p-2.5" style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.15)" }}>
          <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "#4ADE80" }}>{txt("അനുയോജ്യം", "Suitable", "صالح")}</p>
          <ChipList items={good} color="#4ADE80" />
        </div>
        <div className="rounded-lg p-2.5" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)" }}>
          <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "#F87171" }}>{txt("അനുചിതം", "Unsuitable", "غير صالح")}</p>
          <ChipList items={bad} color="#F87171" />
        </div>
      </div>
      <SourceTag>Havâss'ın Derinlikleri, PDF2 p.50-62 (via manuscriptRuleEngine) · PDF1 p.49-50</SourceTag>
    </DashboardSection>
  );
}