// KASHF HOUR TABLES card
// Answer Hour, Dominance Hour, Sheikh Jaad table (الأدق), Moon-in-Zodiac best saat,
// 1st/8th hour rule. All from Kashf al-Haqa'iq.
// Sources: Kashf p.53 (answer/dominance), p.54 (Jaad, moon-zodiac), p.20 (1st/8th rule).
import { useAstroData } from "../dashboard/useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import DashboardSection from "../dashboard/DashboardSection";
import { KASHF_ANSWER_HOURS, KASHF_DOMINANCE_HOURS, KASHF_JAAD_HOUR_TABLE, KASHF_MOON_ZODIAC_HOURS, KASHF_ASTRO_PRINCIPLES } from "@/lib/astroClockKashfData";
import { SourceTag, DAY_EN_MAP, ZODIAC_EN_MAP } from "./shared";

export default function KashfHourTablesCard() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const dayName = DAY_EN_MAP[d.activeDayIndex];
  const answer = KASHF_ANSWER_HOURS.table.find(t => t.day_en === dayName);
  const dominance = KASHF_DOMINANCE_HOURS.table.find(t => t.day_en === dayName);
  const jaad = KASHF_JAAD_HOUR_TABLE.table[d.activeDayIndex];
  const zodiacEn = d.moonPosition?.zodiacSign?.name_en;
  const zIdx = ZODIAC_EN_MAP.indexOf(zodiacEn);
  const moonHour = zIdx >= 0 ? KASHF_MOON_ZODIAC_HOURS.table[zIdx] : null;
  const principle = KASHF_ASTRO_PRINCIPLES.find(p => p.id === "kashf_principle_002");
  const isAnswerNow = answer && d.currentHour?.hourNumber === answer.hour_number && d.currentHour?.isDay;
  const isDomNow = dominance && d.currentHour?.hourNumber === dominance.hour_number && d.currentHour?.isDay;

  return (
    <DashboardSection icon="📋" title={txt("കശ്ഫ് ഘടിക പട്ടികകൾ", "Kashf Hour Tables", "جداول الساعات (كشف)")}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-lg p-2.5" style={{ background: isAnswerNow ? "rgba(74,222,128,0.10)" : "rgba(255,255,255,0.02)", border: `1px solid ${isAnswerNow ? "rgba(74,222,128,0.30)" : "rgba(212,175,55,0.10)"}` }}>
          <p className="font-inter text-[10px] font-bold mb-1" style={{ color: "#4ADE80" }}>{txt("ഉത്തര ഘടിക (ساعات الإجابة)", "Answer Hour", "ساعة الإجابة")}</p>
          {answer && <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{answer.planet_ar} · #{answer.hour_number}{isAnswerNow ? ` · ${txt("ഇപ്പോൾ", "NOW", "الآن")}` : ""}</p>}
        </div>
        <div className="rounded-lg p-2.5" style={{ background: isDomNow ? "rgba(251,191,36,0.10)" : "rgba(255,255,255,0.02)", border: `1px solid ${isDomNow ? "rgba(251,191,36,0.30)" : "rgba(212,175,55,0.10)"}` }}>
          <p className="font-inter text-[10px] font-bold mb-1" style={{ color: "#FBBF24" }}>{txt("ജയ ഘടിക (ساعات المغالبات)", "Dominance Hour", "ساعة المغالبة")}</p>
          {dominance && <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{dominance.planet_ar} · #{dominance.hour_number}{isDomNow ? ` · ${txt("ഇപ്പോൾ", "NOW", "الآن")}` : ""}</p>}
        </div>
      </div>

      {jaad && (
        <div className="mt-2 rounded-lg p-2.5" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
          <p className="font-inter text-[10px] font-bold mb-1" style={{ color: "rgba(212,175,55,0.80)" }}>{txt("ശൈഖ് ജാദ് പട്ടിക (الأدق)", "Sheikh Jaad table (الأدق)", "جدول الشيخ جاعد")}</p>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-inter" style={{ color: "rgba(255,255,255,0.65)" }}>
            <span>{txt("സഅദ്", "Sa'd", "سعد")}: {jaad.saad_planet}</span>
            <span>{txt("ജയം", "Dominance", "غلبة")}: {jaad.dominance_planet}</span>
            <span>{txt("ഉത്തരം", "Answer", "إجابة")}: {jaad.answer_planet}</span>
            <span>{txt("അനുഗ്രഹം", "Blessing", "بركة")}: {jaad.blessing_planet}</span>
          </div>
        </div>
      )}

      {moonHour && (
        <div className="mt-2 rounded-lg p-2.5" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.15)" }}>
          <p className="font-inter text-[10px] font-bold mb-0.5" style={{ color: "#818CF8" }}>{txt("ചന്ദ്ര രാശിയിലെ മികച്ച ഘടിക", "Best saat for Moon's zodiac", "أفضل ساعة لبرج القمر")}</p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{moonHour.zodiac_ar} → {moonHour.planet_ar} ({moonHour.planet_en})</p>
        </div>
      )}

      {principle && (
        <div className="mt-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.10)" }}>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>{language === "ar" ? principle.rule_ar : language === "ml" ? principle.rule_ml : principle.rule_en}</p>
        </div>
      )}

      <SourceTag>Kashf al-Haqa'iq, p.53 (answer/dominance) · p.54 (Jaad, moon-zodiac) · p.20 (1st/8th rule)</SourceTag>
    </DashboardSection>
  );
}