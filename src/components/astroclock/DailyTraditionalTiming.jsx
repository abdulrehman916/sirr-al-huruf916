// ═══════════════════════════════════════════════════════════════
// DAILY TRADITIONAL TIMING
// Shows planetary hours, ruler, and suitable/unsuitable actions
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Clock, CheckCircle, XCircle, BookOpen } from "lucide-react";
import { DAY_INFO, PLANET_INFO, getAllPlanetaryHours } from "@/lib/astroClockLiveEngine";
import { calculateSunriseSunset, formatDecimalTime } from "@/lib/astroClockSunriseSunset";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
  success:  "rgba(34,197,94,0.60)",
  danger:   "rgba(239,68,68,0.60)"
};

export default function DailyTraditionalTiming() {
  const { isMalayalam } = useAstroClockLanguage();
  const [dayData, setDayData] = useState(null);
  const [planetaryHours, setPlanetaryHours] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const today = new Date();
    const dayIndex = today.getDay();
    
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timezone: -position.coords.longitude / 15
          };
          setLocation(loc);
          
          const sunTimes = calculateSunriseSunset(today, loc.lat, loc.lng, loc.timezone);
          if (sunTimes.sunrise && sunTimes.sunset) {
            const hours = getAllPlanetaryHours(today, sunTimes.sunrise, sunTimes.sunset);
            setPlanetaryHours(hours);
          }
        },
        () => {
          // Default to Dubai
          const loc = { lat: 25.2048, lng: 55.2708, timezone: 4 };
          setLocation(loc);
          const sunTimes = calculateSunriseSunset(today, loc.lat, loc.lng, loc.timezone);
          if (sunTimes.sunrise && sunTimes.sunset) {
            const hours = getAllPlanetaryHours(today, sunTimes.sunrise, sunTimes.sunset);
            setPlanetaryHours(hours);
          }
        }
      );
    } else {
      const loc = { lat: 25.2048, lng: 55.2708, timezone: 4 };
      setLocation(loc);
      const sunTimes = calculateSunriseSunset(today, loc.lat, loc.lng, loc.timezone);
      if (sunTimes.sunrise && sunTimes.sunset) {
        const hours = getAllPlanetaryHours(today, sunTimes.sunrise, sunTimes.sunset);
        setPlanetaryHours(hours);
      }
    }
    
    setDayData(DAY_INFO[dayIndex]);
  }, []);

  if (!dayData) return null;

  const planetInfo = PLANET_INFO[dayData.ruler];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-7 h-7" style={{ color: G.text }} />
        <div>
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "ദൈനംദിന പാരമ്പര്യ സമയം" : "Daily Traditional Timing"}
          </h2>
          <p className="font-malayalam-sm" style={{ color: G.dim }}>
            {isMalayalam ? "ഗ്രഹ മണിക്കൂറുകളും ഉചിത പ്രവർത്തനങ്ങളും" : "Planetary hours and suitable actions"}
          </p>
        </div>
      </div>

      {/* Day Ruler */}
      <div className="mb-6 p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "ദിവസ നാഥൻ" : "Day Ruler"}
            </p>
            <p className="font-malayalam-lg font-bold text-white">
              {isMalayalam ? dayData.name_ml : dayData.name_en}
            </p>
          </div>
          <div className="text-right">
            <p className="font-amiri text-4xl font-bold mb-2" style={{ color: G.text }} dir="rtl">
              {planetInfo.name_ar}
            </p>
            <p className="font-inter text-sm" style={{ color: G.dim }}>
              {isMalayalam ? planetInfo.name_ml_equivalent : planetInfo.name_en}
            </p>
          </div>
        </div>
      </div>

      {/* Planetary Hours Summary */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Day Hours */}
        <div className="p-5 rounded-xl border" style={{ background: "rgba(255,193,7,0.05)", borderColor: "rgba(255,193,7,0.30)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sun className="w-5 h-5" style={{ color: "#ffc107" }} />
            <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "#ffc107" }}>
              {isMalayalam ? "പകൽ മണിക്കൂറുകൾ (1-12)" : "Daytime Hours (1-12)"}
            </p>
          </div>
          <div className="space-y-2">
            {(planetaryHours.filter(h => h.period === "day") || []).slice(0, 4).map((hour, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-white/70">{hour.hourNumber}.</span>
                <span className="text-white/90 font-bold">{hour.planetInfo?.name_en}</span>
                <span className="text-white/50">{hour.startTime}</span>
              </div>
            ))}
            {planetaryHours.filter(h => h.period === "day").length > 4 && (
              <p className="text-[10px] text-white/40 italic">+ more...</p>
            )}
          </div>
        </div>

        {/* Night Hours */}
        <div className="p-5 rounded-xl border" style={{ background: "rgba(100,181,246,0.05)", borderColor: "rgba(100,181,246,0.30)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="w-5 h-5" style={{ color: "#64b5f6" }} />
            <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "#64b5f6" }}>
              {isMalayalam ? "രാത്രി മണിക്കൂറുകൾ (1-12)" : "Nighttime Hours (1-12)"}
            </p>
          </div>
          <div className="space-y-2">
            {(planetaryHours.filter(h => h.period === "night") || []).slice(0, 4).map((hour, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="text-white/70">{hour.hourNumber}.</span>
                <span className="text-white/90 font-bold">{hour.planetInfo?.name_en}</span>
                <span className="text-white/50">{hour.startTime}</span>
              </div>
            ))}
            {planetaryHours.filter(h => h.period === "night").length > 4 && (
              <p className="text-[10px] text-white/40 italic">+ more...</p>
            )}
          </div>
        </div>
      </div>

      {/* Suitable Actions */}
      <div className="mb-6 p-5 rounded-xl border" style={{ background: "rgba(34,197,94,0.05)", borderColor: G.success }}>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5" style={{ color: G.success }} />
          <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.success }}>
            {isMalayalam ? "ഉചിത പ്രവർത്തനങ്ങൾ" : "Suitable Actions"}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {(isMalayalam ? dayData.benefits_ml : dayData.benefits_en).map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: G.success }} />
              <span className="font-malayalam-sm text-white/80">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unsuitable Actions */}
      {dayData.warnings_en.length > 0 && (
        <div className="mb-6 p-5 rounded-xl border" style={{ background: "rgba(239,68,68,0.05)", borderColor: G.danger }}>
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5" style={{ color: G.danger }} />
            <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.danger }}>
              {isMalayalam ? "അനുചിത പ്രവർത്തനങ്ങൾ" : "Unsuitable Actions"}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {(isMalayalam ? dayData.warnings_ml : dayData.warnings_en).map((warning, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: G.danger }} />
                <span className="font-malayalam-sm text-white/80">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Reference */}
      <div className="p-4 rounded-xl border" style={{ background: "rgba(255,255,255,0.02)", borderColor: G.faint }}>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5" style={{ color: G.dim }} />
          <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
            {isMalayalam ? "ഗ്രന്ഥങ്ങൾ" : "Sources"}
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: G.bg }}>
            <span className="font-inter text-xs text-white/70">Havâss'ın Derinlikleri</span>
            <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>
              {isMalayalam ? "പുറം" : "Page"} 45-52
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg" style={{ background: G.bg }}>
            <span className="font-inter text-xs text-white/70">Taha Astrology</span>
            <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>
              {isMalayalam ? "പുറം" : "Page"} 78-85
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}