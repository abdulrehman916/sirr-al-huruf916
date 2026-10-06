// ═══════════════════════════════════════════════════
// LIVE MOON CENTER
// Moon phase, sign, mansion, and actions
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, Star, Info } from "lucide-react";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
};

const MOON_PHASES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
];

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

export default function LiveMoonCenter() {
  const [moonData, setMoonData] = useState({
    phase: "Loading",
    sign: "Loading",
    mansion: "Loading",
    illumination: 0
  });

  useEffect(() => {
    const updateMoon = () => {
      const now = new Date();
      
      // Approximate moon phase (simplified)
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      
      let k = Math.floor((year - 1900) * 12.3685);
      k += Math.floor((month - 1) * 12);
      k += Math.floor(day / 29.53);
      
      const age = (now - new Date(1900, 0, 1)) / (24 * 60 * 60 * 1000);
      const phaseIndex = Math.floor((age % 29.53) / 29.53 * 8);
      
      // Approximate zodiac sign (simplified)
      const signIndex = Math.floor((age % 27.32) / 27.32 * 12);
      
      // Approximate mansion (simplified - 28 mansions)
      const mansionIndex = Math.floor((age % 27.32) / 27.32 * 28);
      
      // Approximate illumination
      const illumination = Math.abs(Math.cos((age % 29.53) / 29.53 * Math.PI)) * 100;
      
      setMoonData({
        phase: MOON_PHASES[phaseIndex] || "Unknown",
        sign: ZODIAC_SIGNS[signIndex] || "Unknown",
        mansion: `Al-${mansionIndex + 1}`,
        illumination: Math.round(illumination)
      });
    };
    
    updateMoon();
    const interval = setInterval(updateMoon, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: 0.15 }}
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
        <Moon className="w-5 h-5" style={{ color: G.text }} />
        <h2 className="font-inter text-lg font-bold uppercase tracking-widest" style={{ color: G.text }}>
          🌙 ചന്ദ്രൻ
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4" style={{ color: G.text }} />
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>Phase</p>
          </div>
          <p className="font-inter text-sm font-bold text-white">{moonData.phase}</p>
          <p className="font-inter text-[10px] mt-1" style={{ color: G.dim }}>
            {moonData.illumination}% illuminated
          </p>
        </div>

        <div className="p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4" style={{ color: G.text }} />
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>Zodiac Sign</p>
          </div>
          <p className="font-inter text-sm font-bold text-white">{moonData.sign}</p>
          <p className="font-inter text-[10px] mt-1" style={{ color: G.dim }}>Current transit</p>
        </div>

        <div className="p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4" style={{ color: G.text }} />
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>Lunar Mansion</p>
          </div>
          <p className="font-inter text-sm font-bold text-white">{moonData.mansion}</p>
          <p className="font-inter text-[10px] mt-1" style={{ color: G.dim }}>Manzil position</p>
        </div>

        <div className="p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-4 h-4" style={{ color: G.text }} />
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>Best Actions</p>
          </div>
          <p className="font-inter text-xs text-white/70">
            {moonData.illumination > 50 ? "Increasing activities" : "Decreasing activities"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}