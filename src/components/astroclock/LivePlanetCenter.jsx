// ═══════════════════════════════════════════════════
// LIVE PLANET CENTER
// 7 planets with positions and properties
// ═══════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Info } from "lucide-react";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
};

const PLANETS = [
  { name: "Sun", arabic: "الشمس", malayalam: "സൂര്യൻ", color: "#FDB813", day: "Sunday" },
  { name: "Moon", arabic: "القمر", malayalam: "ചന്ദ്രൻ", color: "#C0C0C0", day: "Monday" },
  { name: "Mercury", arabic: "عطارد", malayalam: "ബുധൻ", color: "#A0A0A0", day: "Wednesday" },
  { name: "Venus", arabic: "الزهرة", malayalam: "ശുക്രൻ", color: "#E0B0FF", day: "Friday" },
  { name: "Mars", arabic: "المريخ", malayalam: "ചൊവ്വ", color: "#FF4500", day: "Tuesday" },
  { name: "Jupiter", arabic: "المشتري", malayalam: "ഗുരു", color: "#DAA520", day: "Thursday" },
  { name: "Saturn", arabic: "زحل", malayalam: "ശനി", color: "#8B4513", day: "Saturday" }
];

export default function LivePlanetCenter() {
  const [planetPositions, setPlanetPositions] = useState(
    PLANETS.map(p => ({ ...p, sign: "Loading", degree: 0 }))
  );

  useEffect(() => {
    const updatePlanets = () => {
      const now = new Date();
      const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / (24 * 60 * 60 * 1000));
      
      const updated = PLANETS.map((planet, idx) => {
        // Simplified position calculation
        const orbitPeriod = [365, 27, 88, 225, 687, 4333, 10759][idx];
        const position = ((dayOfYear % orbitPeriod) / orbitPeriod) * 360;
        const signIndex = Math.floor(position / 30);
        const degree = Math.floor(position % 30);
        
        const signs = [
          "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
          "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ];
        
        return {
          ...planet,
          sign: signs[signIndex] || "Unknown",
          degree
        };
      });
      
      setPlanetPositions(updated);
    };
    
    updatePlanets();
    const interval = setInterval(updatePlanets, 3600000); // Update hourly
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: 0.2 }}
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
          🪐 ഗ്രഹങ്ങൾ
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {(planetPositions || []).map((planet) => (
          <div
            key={planet.name}
            className="p-3 rounded-xl border flex items-center justify-between"
            style={{ background: G.bg, borderColor: G.faint }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ 
                  background: planet.color,
                  boxShadow: `0 0 12px ${planet.color}60`
                }}
              />
              <div>
                <p className="font-inter text-sm font-bold text-white">{planet.name}</p>
                <p className="font-amiri text-xs" style={{ color: G.dim }}>{planet.arabic}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-inter text-xs font-bold text-white">{planet.sign}</p>
              <p className="font-inter text-[10px]" style={{ color: G.dim }}>{planet.degree}°</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4" style={{ color: G.dim }} />
          <p className="font-inter text-[10px] text-white/60">
            Planetary positions are approximate. For precise calculations, refer to ephemeris data.
          </p>
        </div>
      </div>
    </motion.div>
  );
}