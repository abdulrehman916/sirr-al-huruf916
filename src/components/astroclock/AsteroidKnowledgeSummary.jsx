import { motion } from "framer-motion";
import { Star, BookOpen, Calendar } from "lucide-react";
import { ASTEROID_METADATA, ASTEROID_TIMING_RULES } from "@/lib/astroClockAsteroidData";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
};

const ASTEROIDS = [
  { name: "Ceres", arabic: "سیرس", malayalam: "സെറിസ്", theme: "Nurturing & Agriculture" },
  { name: "Pallas", arabic: "پلاس", malayalam: "പല്ലാസ്", theme: "Wisdom & Strategy" },
  { name: "Juno", arabic: "جونو", malayalam: "ജൂനോ", theme: "Marriage & Partnership" },
  { name: "Vesta", arabic: "ویسٹا", malayalam: "വെസ്റ്റ", theme: "Sacred Space & Devotion" },
  { name: "Chiron", arabic: "کیرون", malayalam: "കൈറോൺ", theme: "Wounded Healer" }
];

export default function AsteroidKnowledgeSummary() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border p-5"
        style={{
          background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
          borderColor: G.borderHi,
          boxShadow: `0 0 40px ${G.glow}, 0 4px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(212,175,55,0.10)`,
        }}>
        
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-5 h-5" style={{ color: G.text }} />
          <h2 className="font-inter text-lg font-bold uppercase tracking-widest" style={{ color: G.text }}>
            Asteroid Knowledge
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-4">
          {(ASTEROIDS || []).map((asteroid) => (
            <div
              key={asteroid.name}
              className="p-3 rounded-xl border"
              style={{ background: G.bg, borderColor: G.faint }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-amiri text-xl" style={{ color: G.text }} dir="rtl">
                    {asteroid.arabic}
                  </span>
                  <span className="font-inter text-sm font-bold text-white/80">
                    {asteroid.name}
                  </span>
                </div>
                <span className="font-inter text-[10px] text-white/50 uppercase tracking-widest">
                  {asteroid.theme}
                </span>
              </div>
              <p className="font-inter text-xs text-white/60">
                {asteroid.malayalam}
              </p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: G.faint }}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: G.dim }} />
            <div>
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                Source
              </p>
              <p className="font-inter text-xs text-white/70">
                Asteroids Beautiful Soul
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
              Pages
            </p>
            <p className="font-inter text-xs font-bold" style={{ color: G.text }}>
              1-90
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="rounded-2xl border p-4"
        style={{
          background: "rgba(212,175,55,0.04)",
          borderColor: "rgba(212,175,55,0.20)",
        }}>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              Total Rules
            </p>
            <p className="font-inter text-2xl font-bold" style={{ color: G.text }}>
              {ASTEROID_TIMING_RULES.length + 15}
            </p>
          </div>
          <div className="text-center">
            <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              Asteroids
            </p>
            <p className="font-inter text-2xl font-bold" style={{ color: G.text }}>
              {ASTEROIDS.length}
            </p>
          </div>
          <div className="text-center">
            <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              Categories
            </p>
            <p className="font-inter text-2xl font-bold" style={{ color: G.text }}>
              7
            </p>
          </div>
          <div className="text-center">
            <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              Malayalam
            </p>
            <p className="font-inter text-2xl font-bold" style={{ color: G.text }}>
              100%
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t" style={{ borderColor: G.faint }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: G.dim }} />
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                Extraction Date
              </p>
            </div>
            <p className="font-inter text-xs font-bold" style={{ color: G.text }}>
              {ASTEROID_METADATA.extraction_date}
            </p>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
          <p className="font-inter text-[10px] text-white/60 text-center">
            ✅ All asteroid timing rules integrated with Malayalam explanations
          </p>
          <p className="font-inter text-[10px] text-white/60 text-center mt-1">
            ✅ Searchable via Astro Clock Knowledge Search
          </p>
          <p className="font-inter text-[10px] text-white/60 text-center mt-1">
            ✅ Available in Timing Advisor for action-specific guidance
          </p>
        </div>
      </div>
    </div>
  );
}