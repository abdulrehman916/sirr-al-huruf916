// LIVE HOUR LAYER · Current Planetary Hour card
// Hour #, day/night, hour ruler, hour Sa'd/Nahs, hour suitable/unsuitable actions,
// hour-ruler × day-ruler relationship. Updates every planetary hour.
// Sources: Havâss PDF2 p.50-62 (hour rules), p.88-92 (friendships).
import { useAstroData, PLANET_AR } from "../dashboard/useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import DashboardSection, { MiniCard } from "../dashboard/DashboardSection";
import { PLANETARY_HOUR_RULES, PLANET_FRIENDSHIPS } from "@/lib/manuscriptRuleEngine";
import { SourceTag, ChipList } from "./shared";

export default function CurrentHourCard() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const ch = d.currentHour;
  if (!ch) return null;
  const hr = PLANETARY_HOUR_RULES[ch.planet];
  const dayRuler = d.dayRuler.planet;
  const fr = PLANET_FRIENDSHIPS[ch.planet] || {};
  const rel = fr.friends?.includes(dayRuler) ? "friend" : fr.enemies?.includes(dayRuler) ? "enemy" : "neutral";
  const relColor = rel === "friend" ? "#4ADE80" : rel === "enemy" ? "#F87171" : "#FBBF24";
  const relText = rel === "friend" ? txt("മിത്രം", "Friend", "صديق") : rel === "enemy" ? txt("ശത്രു", "Enemy", "عدو") : txt("നിരപേക്ഷം", "Neutral", "محايد");
  const hourName = language === "ar" ? PLANET_AR[ch.planet] : d.planetInfo[ch.planet]?.name_en;
  const suitable = hr?.suitableActions?.en || [];
  const unsuitable = hr?.unsuitableActions?.en || [];

  return (
    <DashboardSection icon="⏰" title={txt("നിലവിലെ ഗ്രഹ മണിക്കൂർ", "Current Planetary Hour", "الساعة الكوكبية الحالية")}       subtitle={txt("തത്സമയ ഘടിക പാളി", "Live hour layer", "طبقة الساعة الحية")}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <MiniCard icon="#️⃣" label={txt("ഘടിക #", "Hour #", "الساعة")} value={`#${ch.hourNumber}`} color="#F5D060" />
        <MiniCard icon={ch.isDay ? "☀" : "🌙"} label={txt("പകൽ/രാത്രി", "Day/Night", "نهار/ليل")} value={ch.isDay ? txt("പകൽ", "Day", "نهار") : txt("രാത്രി", "Night", "ليل")} color={ch.isDay ? "#FBBF24" : "#818CF8"} />
        <MiniCard icon={d.planetInfo[ch.planet]?.symbol || "☉"} label={txt("ഘടിക ഗ്രഹം", "Hour ruler", "كوكب الساعة")} value={hourName} color="#F5D060" />
        <MiniCard icon="✦" label={txt("ഘടിക സഅദ്/നഹ്സ്", "Hour Sa'd/Nahs", "سعد/نحس الساعة")} value={hr?.nature || "—"} color={relColor} />
      </div>

      <div className="mt-2 rounded-lg p-2 flex items-center gap-2" style={{ background: `${relColor}10`, border: `1px solid ${relColor}40` }}>
        <span className="font-inter text-[10px] font-bold" style={{ color: relColor }}>{txt("ഘടിക ഗ്രഹം × ദിന ഗ്രഹം", "Hour × Day ruler", "الساعة × كوكب اليوم")}: {relText}</span>
      </div>

      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-lg p-2.5" style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.15)" }}>
          <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "#4ADE80" }}>{txt("അനുയോജ്യം", "Suitable", "صالح")}</p>
          <ChipList items={suitable} color="#4ADE80" />
        </div>
        <div className="rounded-lg p-2.5" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)" }}>
          <p className="font-inter text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "#F87171" }}>{txt("അനുചിതം", "Unsuitable", "غير صالح")}</p>
          <ChipList items={unsuitable} color="#F87171" />
        </div>
      </div>

      <SourceTag>Havâss'ın Derinlikleri, PDF2 p.50-62 (hour rules) · p.88-92 (friendships)</SourceTag>
    </DashboardSection>
  );
}