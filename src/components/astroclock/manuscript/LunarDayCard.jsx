// FIXED DAY LAYER · Lunar Day card
// Lunar day number, nature, verbatim judgement, monthly Kamil Nahs indicator.
// Sources: Kashf al-Haqa'iq pp.57-58 (Kamil days), pp.60-65 (day-by-day guide).
import { useAstroData } from "../dashboard/useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import DashboardSection, { MiniCard } from "../dashboard/DashboardSection";
import { getKashfLunarDayInfo, getKashfNahsStatus } from "@/lib/astroClockManuscriptMerger";
import { SourceTag, ArabicLine } from "./shared";

export default function LunarDayCard() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const lunarDay = d.lunarDay;
  if (!lunarDay) return null;
  const info = getKashfLunarDayInfo(lunarDay);
  const nahs = getKashfNahsStatus(lunarDay);
  const natureColor = info?.nature_en === "Auspicious" ? "#4ADE80" : info?.nature_en === "Inauspicious" ? "#F87171" : "#FBBF24";

  return (
    <DashboardSection icon="🌙" title={txt("ചാന്ദ്ര ദിനം", "Lunar Day", "يوم القمر")} subtitle={txt("ചാന്ദ്ര മാസ ദിന വിധി", "Lunar month day judgement", "حكم يوم الشهر القمري")}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <MiniCard icon="#️⃣" label={txt("ചാന്ദ്ര ദിനം", "Lunar Day #", "يوم قمري")} value={`#${lunarDay}`} color="#F5D060" />
        <MiniCard icon="✦" label={txt("സ്വഭാവം", "Nature", "الطبع")} value={info ? (language === "ml" ? info.nature_ml : info.nature_en) : "—"} color={natureColor} />
        <MiniCard icon="⚠" label={txt("കാമിൽ നഹ്സ്", "Kamil Nahs", "نحس كامل")} value={nahs?.isNahs ? txt("ഉണ്ട്", "Yes", "نعم") : txt("ഇല്ല", "No", "لا")} color={nahs?.isNahs ? "#F87171" : "#4ADE80"} />
      </div>

      {info && (
        <div className="mt-2">
          <p className="font-inter text-[10px] font-bold mb-0.5" style={{ color: "rgba(212,175,55,0.70)" }}>{txt("ദിന വിധി (കശ്ഫ് മൂലം)", "Day judgement (verbatim)", "حكم اليوم (حرفياً)")}</p>
          <ArabicLine>{info.summary_ar}</ArabicLine>
        </div>
      )}

      {nahs?.isNahs && (
        <div className="mt-2 rounded-lg p-2" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)" }}>
          <p className="font-inter text-[10px]" style={{ color: "#F87171" }}>{language === "ml" ? nahs.ml : nahs.en}</p>
        </div>
      )}

      <SourceTag>Kashf al-Haqa'iq, pp.57-58 (Kamil) · pp.60-65 (day guide)</SourceTag>
    </DashboardSection>
  );
}