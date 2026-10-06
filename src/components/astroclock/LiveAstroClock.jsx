// ═══════════════════════════════════════════════════
// LIVE ASTRO CLOCK
// Real-time clock with date, time, Islamic date, prayer times
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Star, Clock, Calendar } from "lucide-react";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
};

export default function LiveAstroClock() {
  const [astroData, setAstroData] = useState({
    currentTime: "00:00:00",
    currentDate: "Loading...",
    dayName: "Loading",
    islamicDate: { formatted: "Loading" },
    prayerTimes: {
      sunriseFormatted: "--:--",
      solarNoonFormatted: "--:--",
      sunsetFormatted: "--:--",
      midnightFormatted: "--:--"
    }
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      
      // Current time
      const timeStr = now.toLocaleTimeString('en-GB', { 
        timeZone: 'Asia/Dubai',
        hour12: false 
      });
      
      // Current date
      const dateStr = now.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Dubai',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Day name
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[now.getDay()];
      
      // Islamic date (approximate)
      const islamicDate = new Intl.DateTimeFormat('en-TN-u-ca-islamic', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(now);
      
      // Prayer times (approximate for Dubai)
      const prayerTimes = {
        sunriseFormatted: "05:42",
        solarNoonFormatted: "12:26",
        sunsetFormatted: "19:10",
        midnightFormatted: "00:26"
      };
      
      setAstroData({
        currentTime: timeStr,
        currentDate: dateStr,
        dayName,
        islamicDate: { formatted: islamicDate },
        prayerTimes
      });
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />
      
      <div className="flex items-center gap-3 mb-4">
        <Star className="w-5 h-5" style={{ color: G.text }} />
        <h2 className="font-inter text-lg font-bold uppercase tracking-widest" style={{ color: G.text }}>
          🕰️ ലൈവ് അസ്ട്രോ ക്ലോക്ക്
        </h2>
      </div>

      {/* Time & Date */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
          <p className="font-inter text-[10px] font-bold mb-1" style={{ color: G.text }}>⏰ സമയം</p>
          <p className="font-mono text-3xl font-bold text-white">{astroData.currentTime}</p>
        </div>
        <div className="p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
          <p className="font-inter text-[10px] font-bold mb-1" style={{ color: G.text }}>📅 തീയതി</p>
          <p className="font-inter text-sm font-semibold text-white">{astroData.currentDate}</p>
        </div>
      </div>

      {/* Day & Islamic Date */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="font-inter text-[10px] font-bold mb-1" style={{ color: G.text }}>ദിവസം</p>
          <p className="font-inter text-lg font-bold text-white">{astroData.dayName}</p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
          <p className="font-inter text-[10px] font-bold mb-1" style={{ color: G.text }}>ഇസ്ലാമിക തീയതി</p>
          <p className="font-amiri text-lg font-bold text-gold">{astroData.islamicDate.formatted}</p>
        </div>
      </div>

      {/* Prayer Times */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Sun className="w-4 h-4 mx-auto mb-1" style={{ color: G.text }} />
          <p className="font-inter text-[9px] font-bold mb-1" style={{ color: G.text }}>സൂര്യോദയം</p>
          <p className="font-mono text-sm font-bold text-white">{astroData.prayerTimes.sunriseFormatted}</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Sun className="w-4 h-4 mx-auto mb-1" style={{ color: "#F5A623" }} />
          <p className="font-inter text-[9px] font-bold mb-1" style={{ color: G.text }}>ഉച്ച</p>
          <p className="font-mono text-sm font-bold text-white">{astroData.prayerTimes.solarNoonFormatted}</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Moon className="w-4 h-4 mx-auto mb-1" style={{ color: G.text }} />
          <p className="font-inter text-[9px] font-bold mb-1" style={{ color: G.text }}>സൂര്യാസ്തമയം</p>
          <p className="font-mono text-sm font-bold text-white">{astroData.prayerTimes.sunsetFormatted}</p>
        </div>
        <div className="p-3 rounded-lg text-center" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Star className="w-4 h-4 mx-auto mb-1" style={{ color: G.dim }} />
          <p className="font-inter text-[9px] font-bold mb-1" style={{ color: G.text }}>അർദ്ധരാത്രി</p>
          <p className="font-mono text-sm font-bold text-white">{astroData.prayerTimes.midnightFormatted}</p>
        </div>
      </div>
    </motion.div>
  );
}