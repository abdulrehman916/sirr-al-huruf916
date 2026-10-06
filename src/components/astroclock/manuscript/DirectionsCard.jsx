// FIXED DAY LAYER · Directions card
// Forbidden travel direction for today + facing direction by element (verbatim).
// Sources: Kashf al-Haqa'iq p.57 (travel nahs), p.42 (facing by element).
import { useAstroData } from "../dashboard/useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import DashboardSection, { MiniCard } from "../dashboard/DashboardSection";
import { KASHF_TRAVEL_DIRECTION_NAHS, KASHF_DIRECTION_RULES } from "@/lib/astroClockKashfData";
import { SourceTag, DAY_EN_MAP } from "./shared";

export default function DirectionsCard() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const dayName = DAY_EN_MAP[d.activeDayIndex];
  const travel = KASHF_TRAVEL_DIRECTION_NAHS.rules.find(r => r.days_en.split(",").map(s => s.trim()).includes(dayName));
  const facing = KASHF_DIRECTION_RULES.rules;

  return (
    <DashboardSection icon="🧭" title={txt("ദിശകൾ", "Directions", "الاتجاهات")} subtitle={txt("യാത്രാ നഹ്സ് + പ്രവർത്തന ദിശ", "Travel nahs + Facing direction", "نحس السفر واتجاه العمل")}>
      <MiniCard icon="⛔" label={txt("നിരുത്സാഹക യാത്രാ ദിശ", "Forbidden travel direction", "اتجاه السفر المنهي")} value={travel ? (language === "ar" ? travel.direction_ar : travel.direction_en) : "—"} color="#F87171" />
      {travel && <p className="font-inter text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("ഈ ദിനങ്ങളിൽ", "Applies on", "في هذه الأيام")}: {language === "ar" ? travel.days_ar : travel.days_en}</p>}

      <div className="mt-2">
        <p className="font-inter text-[10px] font-bold mb-1" style={{ color: "rgba(212,175,55,0.70)" }}>{txt("പ്രവർത്തന ദിശ (മൂലകം അനുസരിച്ച്)", "Facing direction by element", "اتجاه العمل حسب العنصر")}</p>
        <div className="grid grid-cols-2 gap-1">
          {facing.map((f, i) => (
            <div key={i} className="rounded p-1.5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.10)" }}>
              <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{language === "ar" ? f.element_ar : f.element_en} → {language === "ar" ? f.direction_ar : f.direction_en}</p>
            </div>
          ))}
        </div>
        <p className="font-inter text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.40)" }}>{KASHF_DIRECTION_RULES.default_en}</p>
      </div>

      <SourceTag>Kashf al-Haqa'iq, p.42 (facing) · p.57 (travel nahs)</SourceTag>
    </DashboardSection>
  );
}