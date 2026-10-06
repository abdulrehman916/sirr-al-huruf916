// ═══════════════════════════════════════════════════════════════
// LIVE PLANETARY HOURS — CURRENT HOUR WITH COUNTDOWN
// Real-time display with countdown timer
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Timer, Sun, Moon } from "lucide-react";
import { getCurrentPlanetaryHour, getAllPlanetaryHours, PLANET_INFO } from "@/lib/astroClockLiveEngine";
import { calculateSunriseSunset } from "@/lib/astroClockSunriseSunset";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { safeFormatTime } from "@/lib/astroClockDateUtils.js";
import { usePersistedLocation } from "@/lib/usePersistedLocation.js";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  success: "rgba(34,197,94,0.60)"
};

export default function LivePlanetaryHours() {
  const { isMalayalam } = useAstroClockLanguage();
  const { location } = usePersistedLocation();
  const [currentHour, setCurrentHour] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [sunData, setSunData] = useState(null);

  useEffect(() => {
    const loc = location || { lat: 25.2048, lng: 55.2708, timezone: 4, name: "Dubai, UAE (Default)" };
    const today = new Date();
    const sunTimes = calculateSunriseSunset(today, loc.lat, loc.lng, loc.timezone);
    setSunData(sunTimes);

    const interval = setInterval(() => {
      const now = new Date();
      if (sunTimes?.sunrise && sunTimes?.sunset) {
        updateCurrentHour(now, sunTimes);
      }
    }, 1000);
    // initial call
    if (sunTimes.sunrise && sunTimes.sunset) {
      updateCurrentHour(today, sunTimes);
    }

    return () => clearInterval(interval);
  }, [location]);

  const updateCurrentHour = (date, sunTimes) => {
    const hour = getCurrentPlanetaryHour(date, sunTimes.sunrise, sunTimes.sunset);
    setCurrentHour(hour);
    
    // Calculate countdown from remainingTime
    if (hour.remainingTime) {
      setCountdown(hour.remainingTime);
    }
  };

  if (!currentHour || !currentHour.planetInfo) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border p-8 text-center"
        style={{
          background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
          borderColor: G.border
        }}
      >
        <div className="w-8 h-8 border-4 border-t-gold border-r-transparent border-b-gold border-l-transparent rounded-full animate-spin mx-auto" />
        <p className="font-inter text-sm mt-4" style={{ color: G.dim }}>
          {isMalayalam ? "കണക്കുകൂട്ടുന്നു..." : "Calculating..."}
        </p>
      </motion.div>
    );
  }

  const isDay = currentHour.isDay;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        background: isDay 
          ? "linear-gradient(145deg, rgba(255,200,100,0.08) 0%, rgba(255,150,50,0.05) 100%)"
          : "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}`
      }}
    >
      {/* Header */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="flex items-center gap-3">
          {isDay ? <Sun className="w-6 h-6 flex-shrink-0" style={{ color: G.text }} /> : <Moon className="w-6 h-6 flex-shrink-0" style={{ color: G.text }} />}
          <div className="min-w-0">
            <h2 className="font-malayalam-md uppercase tracking-widest truncate" style={{ color: G.text }}>
              {isMalayalam ? "നിലവിലെ ഗ്രഹ മണിക്കൂർ" : "Current Planetary Hour"}
            </h2>
            <p className="font-malayalam-sm" style={{ color: G.dim }}>
              {isMalayalam ? "ലൈവ് കൗണ്ടൗൺ" : "Live Countdown"}
            </p>
          </div>
        </div>
        
        {sunData && (
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {(location?.name) && (
              <p className="font-inter text-[9px]" style={{ color: G.dim }}>{location.name}</p>
            )}
            <p className="font-inter text-[10px] text-white/60">
              {isMalayalam ? "സൂര്യോദയം:" : "Sunrise:"} {safeFormatTime(sunData.sunrise)}
            </p>
            <p className="font-inter text-[10px] text-white/60">
              {isMalayalam ? "സൂര്യാസ്തമയം:" : "Sunset:"} {safeFormatTime(sunData.sunset)}
            </p>
          </div>
        )}
      </div>

      {/* Current Hour Display */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Left: Planet & Countdown */}
        <div className="space-y-4">
          {/* Planet Card */}
          <div className="p-6 rounded-xl border text-center" style={{ background: G.bgHi, borderColor: G.border }}>
            <p className="font-malayalam-sm uppercase tracking-widest mb-3" style={{ color: G.dim }}>
              {isMalayalam ? "ഗ്രഹ നാഥൻ" : "Ruling Planet"}
            </p>
            <p className="text-7xl mb-3">{currentHour.planetInfo.symbol}</p>
            <p className="font-amiri text-5xl md:text-6xl font-bold mb-3 leading-tight" style={{ color: G.text, textShadow: "0 0 30px rgba(212,175,55,0.3)" }}>
              {currentHour.planetInfo.name_ar}
            </p>
            <p className="font-malayalam-lg text-white font-bold">
              {isMalayalam ? currentHour.planetInfo.name_ml_equivalent : currentHour.planetInfo.name_en}
            </p>
            <p className="font-malayalam-sm mt-2" style={{ color: G.dim }}>
              {isMalayalam ? currentHour.planetInfo.nature_ml : currentHour.planetInfo.nature_en}
            </p>
          </div>

          {/* Countdown */}
          <div className="p-5 rounded-xl border text-center" style={{ background: "rgba(34,197,94,0.08)", borderColor: G.success }}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Timer className="w-5 h-5" style={{ color: G.success }} />
              <p className="font-malayalam-sm uppercase tracking-widest" style={{ color: G.success }}>
                {isMalayalam ? "അടുത്ത മണിക്കൂറിലേക്ക്" : "Until Next Hour"}
              </p>
            </div>
            <p className="font-mono text-4xl md:text-5xl font-bold text-white tracking-wider">{countdown}</p>
          </div>
        </div>

        {/* Right: Hour Details */}
        <div className="space-y-3">
          <InfoRow 
            label={isMalayalam ? "മണിക്കൂർ" : "Hour Number"} 
            value={`#${currentHour.hourNumber}`} 
            isMalayalam={isMalayalam} 
          />
          <InfoRow 
            label={isMalayalam ? "സമയം" : "Time Period"} 
            value={`${currentHour.hourStart} - ${currentHour.hourEnd}`} 
            isMalayalam={isMalayalam} 
          />
          <InfoRow 
            label={isMalayalam ? "ദിവസ നാഥൻ" : "Day Ruler"} 
            value={isMalayalam ? PLANET_INFO[currentHour.dayRuler]?.name_ml_equivalent : PLANET_INFO[currentHour.dayRuler]?.name_en}
            symbol={PLANET_INFO[currentHour.dayRuler]?.symbol}
            isMalayalam={isMalayalam} 
          />
          <InfoRow 
            label={isMalayalam ? "അടുത്ത ഗ്രഹം" : "Next Planet"} 
            value={isMalayalam ? PLANET_INFO[currentHour.nextPlanet]?.name_ml_equivalent : PLANET_INFO[currentHour.nextPlanet]?.name_en}
            symbol={PLANET_INFO[currentHour.nextPlanet]?.symbol}
            isMalayalam={isMalayalam} 
          />
          <InfoRow 
            label={isMalayalam ? "മണിക്കൂർ ദൈർഘ്യം" : "Hour Duration"} 
            value={currentHour.duration} 
            isMalayalam={isMalayalam} 
          />
          <InfoRow 
            label={isMalayalam ? "കാലം" : "Period"} 
            value={isDay ? (isMalayalam ? "പകൽ" : "Daytime") : (isMalayalam ? "രാത്രി" : "Nighttime")} 
            isMalayalam={isMalayalam} 
          />
        </div>
      </div>

      {/* Actions for Current Hour */}
      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border" style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.30)" }}>
          <p className="font-malayalam-md font-bold uppercase tracking-widest mb-3" style={{ color: "#22c55e" }}>
            {isMalayalam ? "ഉചിത പ്രവർത്തനങ്ങൾ" : "Suitable Actions"}
          </p>
          <ul className="space-y-2">
            {((isMalayalam ? currentHour.planetInfo.goodActions_ml : currentHour.planetInfo.goodActions_en) || []).slice(0, 4).map((action, idx) => (
              <li key={idx} className="font-malayalam-sm text-white/80 flex items-start gap-2">
                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#22c55e" }} />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-xl border" style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.30)" }}>
          <p className="font-malayalam-md font-bold uppercase tracking-widest mb-3" style={{ color: "#ef4444" }}>
            {isMalayalam ? "അനുചിത പ്രവർത്തനങ്ങൾ" : "Avoid These"}
          </p>
          <ul className="space-y-2">
            {((isMalayalam ? currentHour.planetInfo.badActions_ml : currentHour.planetInfo.badActions_en) || []).slice(0, 4).map((action, idx) => (
              <li key={idx} className="font-malayalam-sm text-white/80 flex items-start gap-2">
                <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#ef4444" }} />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function InfoRow({ label, value, symbol, isMalayalam }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg" style={{ background: G.bg }}>
      <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</span>
      <div className="flex items-center gap-2 min-w-0">
        {symbol && <span className="text-lg flex-shrink-0">{symbol}</span>}
        <span className="font-malayalam-md font-bold text-white break-words">{value}</span>
      </div>
    </div>
  );
}

// Removed - using safeFormatTime from astroClockDateUtils