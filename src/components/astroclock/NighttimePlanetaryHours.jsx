// ═══════════════════════════════════════════════════════════════
// NIGHTTIME PLANETARY HOURS — ENHANCED WITH PDF RULES
// Real sunrise/sunset based calculations with detailed PDF-sourced info
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Clock, MapPin, Book } from "lucide-react";
import { getAllPlanetaryHours } from "@/lib/astroClockLiveEngine";
import { calculateSunriseSunset, formatDecimalTime } from "@/lib/astroClockSunriseSunset";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import ExpandedPlanetaryHourCard from "./ExpandedPlanetaryHourCard";
import { usePersistedLocation } from "@/lib/usePersistedLocation.js";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
  excellent: "rgba(34,197,94,0.15)",
  excellentBorder: "rgba(34,197,94,0.60)",
  avoid: "rgba(239,68,68,0.15)",
  avoidBorder: "rgba(239,68,68,0.60)"
};

export default function NighttimePlanetaryHours() {
  const { isMalayalam } = useAstroClockLanguage();
  const { location } = usePersistedLocation();
  const [hours, setHours] = useState([]);
  const [sunData, setSunData] = useState(null);

  useEffect(() => {
    const loc = location || { lat: 25.2048, lng: 55.2708, timezone: 4, name: "Dubai, UAE (Default)" };
    const today = new Date();
    const sunTimes = calculateSunriseSunset(today, loc.lat, loc.lng, loc.timezone);
    setSunData(sunTimes);
    if (sunTimes.sunrise && sunTimes.sunset) {
      const allHours = getAllPlanetaryHours(today, sunTimes.sunrise, sunTimes.sunset);
      setHours(allHours.filter(h => h.period === "night"));
    }
  }, [location]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 relative overflow-x-hidden w-full"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Moon className="w-7 h-7" style={{ color: G.text }} />
          <div>
            <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
              {isMalayalam ? "രാത്രി 12 ഗ്രഹ മണിക്കൂറുകൾ" : "Nighttime 12 Planetary Hours"}
            </h2>
            <p className="font-malayalam-sm" style={{ color: G.dim }}>
              {isMalayalam ? "സൂര്യാസ്തമയം മുതൽ സൂര്യോദയം വരെ" : "From Sunset to Sunrise"}
            </p>
          </div>
        </div>
        
        {location && sunData && (
          <div className="text-right hidden md:block">
            <div className="flex items-center gap-2 justify-end mb-1">
              <MapPin className="w-4 h-4" style={{ color: G.dim }} />
              <p className="font-malayalam-sm text-white/70">{location.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-malayalam-sm" style={{ color: G.dim }}>
                {isMalayalam ? "സൂര്യാസ്തമയം:" : "Sunset:"} <span className="text-white font-bold">{formatDecimalTime(sunData.sunset)}</span>
              </span>
              <span className="font-malayalam-sm" style={{ color: G.dim }}>
                {isMalayalam ? "സൂര്യോദയം:" : "Sunrise:"} <span className="text-white font-bold">{formatDecimalTime(sunData.sunrise)}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="space-y-4">
        {(hours || []).map((hour) => (
          <ExpandedPlanetaryHourCard key={hour.hourNumber} hour={hour} isMalayalam={isMalayalam} />
        ))}
      </div>

      {/* Notes */}
      <div className="mt-6 p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
        <div className="flex items-start gap-3">
          <Book className="w-5 h-5 mt-0.5" style={{ color: G.text }} />
          <div>
            <p className="font-malayalam-sm uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "സ്രോതസ്സ്" : "Source"}
            </p>
            <p className="font-malayalam-md text-white/70">
              ഗ്രഹ മണിക്കൂറുകളുടെ സവിശേഷതകൾ ഹവാസ്സിൻ്റെ ഡെപ്ത്ലിക്ലറിൽ നിന്നും മറ്റ് അപ്‌ലോഡ് ചെയ്ത PDF പുസ്തകങ്ങളിൽ നിന്നും മാത്രം.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}