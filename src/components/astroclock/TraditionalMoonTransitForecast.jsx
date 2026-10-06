// ═══════════════════════════════════════════════════════════════
// TRADITIONAL MOON TRANSIT FORECAST
// Shows Moon sign and mansion transitions with live calculations
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Moon, ArrowRight, Clock, Calendar } from "lucide-react";
import { calculateMoonTransits } from "@/lib/astroClockMoonPosition.js";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)"
};

export default function TraditionalMoonTransitForecast() {
  const { isMalayalam } = useAstroClockLanguage();
  const [transitData, setTransitData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    updateTransitData();
    const interval = setInterval(updateTransitData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  function updateTransitData() {
    const now = new Date();
    const data = calculateMoonTransits(now);
    setTransitData(data);
    setLoading(false);
  }

  if (loading || !transitData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border p-8 text-center"
        style={{
          background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
          borderColor: G.border
        }}
      >
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: G.text, borderTopColor: "transparent" }} />
        <p className="mt-4 font-inter text-sm" style={{ color: G.dim }}>
          {isMalayalam ? "കണക്കാക്കുന്നു..." : "Calculating..."}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Moon Sign Transits */}
      <MoonSignTransits transitData={transitData} isMalayalam={isMalayalam} />
      
      {/* Lunar Mansion Transits */}
      <LunarMansionTransits transitData={transitData} isMalayalam={isMalayalam} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MOON SIGN TRANSITS
// ─────────────────────────────────────────────────────────────

function MoonSignTransits({ transitData, isMalayalam }) {
  const { signTransits } = transitData;
  const currentSign = signTransits[0];
  const nextSign = signTransits[1];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Moon className="w-7 h-7" style={{ color: G.text }} />
        <div>
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "ചന്ദ്ര രാശി സഞ്ചാരം" : "Moon Sign Transits"}
          </h2>
          <p className="font-malayalam-sm" style={{ color: G.dim }}>
            {isMalayalam ? "ചന്ദ്രന്റെ രാശി മാറ്റങ്ങൾ" : "Moon's zodiac sign transitions"}
          </p>
        </div>
      </div>

      {/* Current & Next Sign */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Current Sign */}
        <div className="p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5" style={{ color: G.dim }} />
            <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
              {isMalayalam ? "നിലവിലെ രാശി" : "Current Sign"}
            </p>
          </div>
          {currentSign && (
            <>
              <div className="text-4xl mb-2">{currentSign.symbol}</div>
              <p className="font-malayalam-md font-bold text-white">{currentSign.name}</p>
              <p className="font-inter text-xs" style={{ color: G.dim }}>
                {transitData.currentPosition?.longitude}° {isMalayalam ? "ദൈർഘ്യം" : "longitude"}
              </p>
            </>
          )}
        </div>

        {/* Next Sign */}
        <div className="p-5 rounded-xl border" style={{ background: G.bgHi, borderColor: G.borderHi }}>
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="w-5 h-5" style={{ color: G.text }} />
            <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.text }}>
              {isMalayalam ? "അടുത്ത രാശി" : "Next Sign"}
            </p>
          </div>
          {nextSign && (
            <>
              <div className="text-4xl mb-2">{nextSign.symbol}</div>
              <p className="font-malayalam-md font-bold text-white">{nextSign.name}</p>
              <p className="font-inter text-xs" style={{ color: G.dim }}>
                {isMalayalam ? "പ്രവേശന സമയം:" : "Entry time:"} <span className="text-white font-bold">{formatTime(nextSign.entryTime)}</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Remaining Time */}
      {currentSign && currentSign.remainingTime > 0 && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(212,175,55,0.05)", border: `1px solid ${G.faint}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" style={{ color: G.dim }} />
              <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
                {isMalayalam ? "ബാക്കി സമയം" : "Remaining Time"}
              </p>
            </div>
            <p className="font-malayalam-md font-bold text-white">{formatDuration(currentSign.remainingTime)}</p>
          </div>
        </div>
      )}

      {/* Next 5 Transits */}
      <div>
        <p className="font-inter text-[10px] uppercase tracking-widest mb-3" style={{ color: G.dim }}>
          {isMalayalam ? "അടുത്ത 5 രാശി മാറ്റങ്ങൾ" : "Next 5 Sign Changes"}
        </p>
        <div className="space-y-2">
          {(signTransits.slice(1, 6) || []).map((transit, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{transit.symbol}</span>
                <div>
                  <p className="font-malayalam-sm font-bold text-white">{transit.name}</p>
                  <p className="font-inter text-[10px]" style={{ color: G.dim }}>
                    {formatTime(transit.entryTime)}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" style={{ color: G.dim }} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// LUNAR MANSION TRANSITS
// ─────────────────────────────────────────────────────────────

function LunarMansionTransits({ transitData, isMalayalam }) {
  const { mansionTransits } = transitData;
  const current = mansionTransits.current;
  const next = mansionTransits.next;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(2,8,24,0.99) 0%, rgba(1,4,16,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Moon className="w-7 h-7" style={{ color: G.text }} />
        <div>
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "ചന്ദ്ര നക്ഷത്ര സഞ്ചാരം" : "Lunar Mansion Transits"}
          </h2>
          <p className="font-malayalam-sm" style={{ color: G.dim }}>
            {isMalayalam ? "28 ചന്ദ്ര നക്ഷത്രങ്ങളിലൂടെയുള്ള സഞ്ചാരം" : "Moon's journey through 28 lunar mansions"}
          </p>
        </div>
      </div>

      {/* Current & Next Mansion */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Current Mansion */}
        <div className="p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5" style={{ color: G.dim }} />
            <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
              {isMalayalam ? "നിലവിലെ നക്ഷത്രം" : "Current Mansion"}
            </p>
          </div>
          {current && (
            <>
              <p className="font-amiri text-3xl font-bold mb-2 text-right" style={{ color: G.text }} dir="rtl">{current.arabic}</p>
              <p className="font-malayalam-md font-bold text-white">{current.name}</p>
              <p className="font-inter text-xs" style={{ color: G.dim }}>
                {isMalayalam ? "നമ്പർ" : "No."} {current.number}
              </p>
            </>
          )}
        </div>

        {/* Next Mansion */}
        <div className="p-5 rounded-xl border" style={{ background: G.bgHi, borderColor: G.borderHi }}>
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="w-5 h-5" style={{ color: G.text }} />
            <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.text }}>
              {isMalayalam ? "അടുത്ത നക്ഷത്രം" : "Next Mansion"}
            </p>
          </div>
          {next && (
            <>
              <p className="font-amiri text-3xl font-bold mb-2 text-right" style={{ color: G.text }} dir="rtl">{next.arabic}</p>
              <p className="font-malayalam-md font-bold text-white">{next.name}</p>
              <p className="font-inter text-xs" style={{ color: G.dim }}>
                {isMalayalam ? "പ്രവേശന സമയം:" : "Entry time:"} <span className="text-white font-bold">{formatTime(next.entryTime)}</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Remaining Time */}
      {current && current.remainingTime > 0 && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(212,175,55,0.05)", border: `1px solid ${G.faint}` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" style={{ color: G.dim }} />
              <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
                {isMalayalam ? "ബാക്കി സമയം" : "Remaining Time"}
              </p>
            </div>
            <p className="font-malayalam-md font-bold text-white">{formatDuration(current.remainingTime)}</p>
          </div>
        </div>
      )}

      {/* Next 5 Transits */}
      <div>
        <p className="font-inter text-[10px] uppercase tracking-widest mb-3" style={{ color: G.dim }}>
          {isMalayalam ? "അടുത്ത 5 നക്ഷത്ര മാറ്റങ്ങൾ" : "Next 5 Mansion Changes"}
        </p>
        <div className="space-y-2">
          {(mansionTransits.upcoming || []).slice(0, 5).map((transit, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
              <div className="flex items-center gap-3">
                <div className="text-right min-w-[80px]">
                  <p className="font-amiri text-lg font-bold" style={{ color: G.text }} dir="rtl">{transit.arabic}</p>
                </div>
                <div>
                  <p className="font-malayalam-sm font-bold text-white">{transit.name}</p>
                  <p className="font-inter text-[10px]" style={{ color: G.dim }}>
                    {formatTime(transit.entryTime)}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4" style={{ color: G.dim }} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────

function formatTime(date) {
  if (!date) return "";
  return date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit",
    hour12: true 
  });
}

function formatDuration(ms) {
  if (!ms || ms <= 0) return "0h 0m";
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}