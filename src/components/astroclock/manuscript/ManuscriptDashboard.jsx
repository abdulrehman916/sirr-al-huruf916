// MANUSCRIPT-COMPLIANT DASHBOARD
// Two independent layers (FIXED DAY · LIVE HOUR) + KASHF HOUR TABLES.
// 24-hour grid remains the existing SaatGrid section on the page.
// No scores, no percentages, no AI judgement — only manuscript display.
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { LayerLabel } from "./shared";
import PlanetaryDayCard from "./PlanetaryDayCard";
import LunarDayCard from "./LunarDayCard";
import MoonPositionCard from "./MoonPositionCard";
import DirectionsCard from "./DirectionsCard";
import DayOperationsCard from "./DayOperationsCard";
import PracticeRulesCard from "./PracticeRulesCard";
import CurrentHourCard from "./CurrentHourCard";
import KashfHourTablesCard from "./KashfHourTablesCard";

export default function ManuscriptDashboard() {
  const { txt } = useAstroClockLanguage();
  return (
    <div className="space-y-3">
      <LayerLabel>{txt("സ്ഥിര ദിന പാളി", "FIXED DAY LAYER", "طبقة اليوم الثابت")}</LayerLabel>
      <PlanetaryDayCard />
      <LunarDayCard />
      <MoonPositionCard />
      <DirectionsCard />
      <DayOperationsCard />
      <PracticeRulesCard />

      <LayerLabel>{txt("തത്സമയ ഘടിക പാളി", "LIVE HOUR LAYER", "طبقة الساعة الحية")}</LayerLabel>
      <CurrentHourCard />

      <LayerLabel>{txt("കശ്ഫ് ഘടിക പട്ടികകൾ", "KASHF HOUR TABLES", "جداول الساعات (كشف)")}</LayerLabel>
      <KashfHourTablesCard />
    </div>
  );
}