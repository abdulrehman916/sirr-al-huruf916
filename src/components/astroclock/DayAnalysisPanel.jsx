import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Star, Heart, Briefcase, Plane, Shield, BookOpen, Info } from "lucide-react";
import { DAY_INFO, PLANET_INFO } from "@/lib/astroClockLiveEngine";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { useAstroData } from "./dashboard/useAstroData";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  success: "rgba(34,197,94,0.60)",
  danger: "rgba(239,68,68,0.60)"
};

const WEEKDAYS = [
  { id: 0, name: "Sunday", arabic: "الأحد", malayalam: "ഞായറാഴ്ച", planet: "Sun" },
  { id: 1, name: "Monday", arabic: "الاثنين", malayalam: "തിങ്കളാഴ്ച", planet: "Moon" },
  { id: 2, name: "Tuesday", arabic: "الثلاثاء", malayalam: "ചൊവ്വാഴ്ച", planet: "Mars" },
  { id: 3, name: "Wednesday", arabic: "الأربعاء", malayalam: "ബുധനാഴ്ച", planet: "Mercury" },
  { id: 4, name: "Thursday", arabic: "الخميس", malayalam: "വ്യാഴാഴ്ച", planet: "Jupiter" },
  { id: 5, name: "Friday", arabic: "الجمعة", malayalam: "വെള്ളിയാഴ്ച", planet: "Venus" },
  { id: 6, name: "Saturday", arabic: "السبت", malayalam: "ശനിയാഴ്ച", planet: "Saturn" }
];

const PLANET_ML = {
  Sun: "സൂര്യൻ", Moon: "ചന്ദ്രൻ", Mars: "ചൊവ്വ", Mercury: "ബുധൻ",
  Jupiter: "ഗുരു", Venus: "ശുക്രൻ", Saturn: "ശനി"
};
const DAY_EN_ML = {
  Sunday: "ഞായർ", Monday: "തിങ്കൾ", Tuesday: "ചൊവ്വ", Wednesday: "ബുധൻ",
  Thursday: "വ്യാഴം", Friday: "വെള്ളി", Saturday: "ശനി"
};

export default function DayAnalysisPanel() {
  // Default to the active manuscript weekday (sunset boundary, same rule as
  // getActiveWeekday via useAstroData) — not the browser's civil getDay().
  const { activeDayIndex } = useAstroData();
  const [selectedDay, setSelectedDay] = useState(activeDayIndex);
  const { language } = useAstroClockLanguage();

  const dayData = DAY_INFO[selectedDay];
  const dayInfo = WEEKDAYS.find(d => d.id === selectedDay);

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-5"
        style={{
          background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
          borderColor: G.borderHi,
          boxShadow: `0 0 40px ${G.glow}`
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6" style={{ color: G.text }} />
          <h2 className="font-inter text-xl font-bold uppercase tracking-widest" style={{ color: G.text }}>
            ദിവസ വിശകലനം
          </h2>
        </div>

        {/* Day Selector */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {(WEEKDAYS || []).map((day) => (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className="p-2 rounded-lg text-center border transition-all"
              style={{
                background: selectedDay === day.id ? G.bgHi : "rgba(255,255,255,0.02)",
                borderColor: selectedDay === day.id ? G.border : "rgba(255,255,255,0.08)",
                opacity: selectedDay === day.id ? 1 : 0.6
              }}
            >
              <p className="font-inter text-[8px] uppercase tracking-wider mb-1" style={{ color: G.dim }}>
                {PLANET_ML[day.planet] || day.planet}
              </p>
              <p className="font-inter text-[9px] font-bold text-white">{day.malayalam}</p>
            </button>
          ))}
        </div>

        {/* Selected Day Details */}
        {dayData && dayInfo && (
          <div className="space-y-4">
            {/* Day Header */}
            <div className="p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    ദിനത്തിന്റെ ഗ്രഹം
                  </p>
                  <p className="font-inter text-lg font-bold" style={{ color: getPlanetColor(dayInfo.planet) }}>
                    {PLANET_ML[dayInfo.planet] || dayInfo.planet}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-amiri text-2xl font-bold mb-1" style={{ color: G.text }}>
                    {dayInfo.arabic}
                  </p>
                  <p className="font-inter text-xs text-white/60">{dayInfo.malayalam}</p>
                </div>
              </div>

              {/* Relationships */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.05)" }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.success }}>
                    അനുകൂല ദിനങ്ങൾ
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(dayData.friendlyDays || []).map((d, idx) => (
                      <span key={idx} className="px-2 py-1 rounded text-[10px]" style={{ background: G.bg, color: G.text }}>
                        {DAY_EN_ML[d] || d}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.05)" }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.danger }}>
                    പ്രതികൂല ദിനങ്ങൾ
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(dayData.enemyDays || []).map((d, idx) => (
                      <span key={idx} className="px-2 py-1 rounded text-[10px]" style={{ background: G.bg, color: G.text }}>
                        {DAY_EN_ML[d] || d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Activities Grid */}
            {language === "en" && (
            <div className="grid grid-cols-2 gap-3">
              <ActivityCard
                icon={Briefcase}
                title="വ്യാപാരം"
                content={dayData.business}
                color={G.success}
              />
              <ActivityCard
                icon={Heart}
                title="പ്രണയവും വിവാഹവും"
                content={`${dayData.love} • ${dayData.marriage}`}
                color={G.text}
              />
              <ActivityCard
                icon={Plane}
                title="യാത്ര"
                content={dayData.travel}
                color={G.dim}
              />
              <ActivityCard
                icon={Shield}
                title="ചികിത്സ"
                content={dayData.healing}
                color={G.success}
              />
            </div>
            )}

            {/* Good & Bad Works */}
            {language === "en" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.05)" }}>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.success }}>
                  ചെയ്യാൻ അനുയോജ്യമായ കാര്യങ്ങൾ
                </p>
                <ul className="space-y-1">
                  {(dayData.goodWorks || []).map((work, idx) => (
                    <li key={idx} className="font-inter text-xs text-white/70">• {work}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.05)" }}>
                <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.danger }}>
                  ഒഴിവാക്കേണ്ട കാര്യങ്ങൾ
                </p>
                <ul className="space-y-1">
                  {(dayData.badWorks || []).map((work, idx) => (
                    <li key={idx} className="font-inter text-xs text-white/70">• {work}</li>
                  ))}
                </ul>
              </div>
            </div>
            )}

            {/* Spiritual Operations */}
            {language === "en" && (
            <div className="p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4" style={{ color: G.dim }} />
                <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                  ആത്മീയ പ്രവർത്തനങ്ങൾ
                </p>
              </div>
              <p className="font-inter text-sm text-white/80 mb-2">{dayData.spiritual}</p>
              <p className="font-inter text-[10px] text-white/40">സ്രോതസ്സ്: {dayData.source}</p>
            </div>
            )}

            {/* Malayalam Explanation */}
            {language === "ml" && (
            <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="font-amiri text-base font-bold mb-2" style={{ color: G.text }}>
                മലയാളം വിശദീകരണം:
              </p>
              <p className="font-inter text-sm text-white/70">{dayData.malayalam}</p>
            </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function ActivityCard({ icon: Icon, title, content, color }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color }}>
          {title}
        </p>
      </div>
      <p className="font-inter text-xs text-white/80">{content || "പ്രത്യേക നിർദ്ദേശമില്ല"}</p>
    </div>
  );
}

function getPlanetColor(planet) {
  const colors = {
    Sun: '#FDB813',
    Moon: '#C0C0C0',
    Mercury: '#A0A0A0',
    Venus: '#E0B0FF',
    Mars: '#FF4500',
    Jupiter: '#DAA520',
    Saturn: '#8B4513'
  };
  return colors[planet] || '#FFFFFF';
}