// FIXED DAY LAYER · Planetary Day card
// Active weekday, day ruler, day Sa'd/Nahs, Golden Day status, friendly/enemy weekdays.
// Sources: Havâss PDF1 p.49-50, PDF2 p.50-62 & 88-92; Kashf p.57-65; Taha p.57-59.
import { useAstroData, DAY_AR, PLANET_AR } from "../dashboard/useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import DashboardSection, { MiniCard } from "../dashboard/DashboardSection";
import { PLANETARY_HOUR_RULES } from "@/lib/manuscriptRuleEngine";
import { getKashfNahsStatus } from "@/lib/astroClockManuscriptMerger";
import { SourceTag, ChipList } from "./shared";

export default function PlanetaryDayCard() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  if (!d.currentHour) return null;
  const idx = d.activeDayIndex;
  const ruler = d.dayRuler.planet;
  const hr = PLANETARY_HOUR_RULES[ruler];
  const dayName = language === "ar" ? DAY_AR[idx] : language === "ml" ? d.dayInfo?.name_ml : d.dayInfo?.name_en;
  const rulerName = language === "ar" ? PLANET_AR[ruler] : d.planetInfo[ruler]?.name_en;
  const friendly = d.weekdayAnalysis?.friendlyDays || [];
  const enemy = d.weekdayAnalysis?.enemyDays || [];
  const nahs = getKashfNahsStatus(d.lunarDay);
  const isScorpio = (d.moonPosition?.zodiacSign?.name_en || "").toLowerCase() === "scorpio";
  const goldenFree = !nahs?.isNahs && !isScorpio;

  return (
    <DashboardSection icon="📅" title={txt("ഗ്രഹ ദിനം", "Planetary Day", "يوم الكوكب")} subtitle={txt("സ്ഥിര ദിന വിധി", "Fixed day judgement", "حكم اليوم الثابت")}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <MiniCard icon="🗓" label={txt("ദിവസം", "Weekday", "اليوم")} value={dayName} color="#F5D060" />
        <MiniCard icon={d.planetInfo[ruler]?.symbol || "☉"} label={txt("ദിന ഗ്രഹം", "Day Ruler", "كوكب اليوم")} value={rulerName} color="#F5D060" />
        <MiniCard icon="✦" label={txt("ദിന സഅദ്/നഹ്സ്", "Day Sa'd/Nahs", "سعد/نحس اليوم")} value={hr?.nature || "—"} color="#F5D060" />
      </div>
      {language !== "ar" && hr?.nature_ml && <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>{hr.nature_ml}</p>}

      <div className="mt-2 rounded-lg p-2" style={{ background: goldenFree ? "rgba(74,222,128,0.04)" : "rgba(248,113,113,0.04)", border: `1px solid ${goldenFree ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"}` }}>
        <p className="font-inter text-[10px] font-bold" style={{ color: goldenFree ? "#4ADE80" : "#F87171" }}>
          {txt("സ്വർണ്ണ ദിനം (روز طلائی)", "Golden Day (روز طلائی)", "روز ذهبي")}: {goldenFree ? txt("നഹ്സ് സൂചകങ്ങളൊന്നുമില്ല", "No nahs indicators today", "لا مؤشرات نحس اليوم") : txt("നഹ്സ് സൂചകങ്ങളുണ്ട്", "Nahs indicators present", "يوجد مؤشرات نحس")}
        </p>
        <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("നഹ്സ് ഇല്ലാത്ത ദിനം സ്വർണ്ണ ദിനം (താഹ p.57-59)", "A day with no nahs is Golden (Taha p.57-59)", "اليوم الخالي من النحس ذهبي")}</p>
      </div>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <p className="font-inter text-[10px] font-bold mb-1" style={{ color: "#4ADE80" }}>{txt("സൗഹൃദ ദിനങ്ങൾ", "Friendly weekdays", "أيام الصداقة")}</p>
          <ChipList items={friendly} color="#4ADE80" />
        </div>
        <div>
          <p className="font-inter text-[10px] font-bold mb-1" style={{ color: "#F87171" }}>{txt("ശത്രു ദിനങ്ങൾ", "Enemy weekdays", "أيام العداوة")}</p>
          <ChipList items={enemy} color="#F87171" />
        </div>
      </div>

      <SourceTag>Havâss'ın Derinlikleri, PDF1 p.49-50 · PDF2 p.50-62, 88-92 · Kashf p.57-65 · Taha p.57-59</SourceTag>
    </DashboardSection>
  );
}