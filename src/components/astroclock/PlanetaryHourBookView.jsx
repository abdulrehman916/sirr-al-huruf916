// ═══════════════════════════════════════════════════════════════
// PLANETARY HOUR BOOK VIEW — MANUSCRIPT EXACT DISPLAY
// Shows all 24 hours with day ruler, sequence, friendships, Sa'd/Nahs
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Book, ChevronRight, Star } from "lucide-react";
import { getAllPlanetaryHours, DAY_INFO } from "@/lib/astroClockLiveEngine";
import { calculateSunriseSunset, formatDecimalTime } from "@/lib/astroClockSunriseSunset";
import { getCurrentPlanetaryHour } from "@/lib/astroClockLiveEngine";
import { getPlanetFriendships } from "@/lib/astroClockPlanetFriendships.js";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
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
  current: "rgba(34,197,94,0.15)",
  currentBorder: "rgba(34,197,94,0.60)",
  next: "rgba(59,130,246,0.15)",
  nextBorder: "rgba(59,130,246,0.60)"
};

export default function PlanetaryHourBookView() {
  const { isMalayalam } = useAstroClockLanguage();
  const { location } = usePersistedLocation();
  const [allHours, setAllHours] = useState([]);
  const [currentHour, setCurrentHour] = useState(null);
  const [nextHour, setNextHour] = useState(null);
  const [dayRuler, setDayRuler] = useState(null);
  const [sunData, setSunData] = useState(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    const today = new Date();
    const dayIndex = today.getDay();
    setDayRuler(DAY_INFO[dayIndex]);

    if (!location) return;
    const sunTimes = calculateSunriseSunset(today, location.lat, location.lng, location.timezone);
    setSunData(sunTimes);
    if (sunTimes.sunrise && sunTimes.sunset) {
      const hours = getAllPlanetaryHours(today, sunTimes.sunrise, sunTimes.sunset);
      setAllHours(hours);
      const current = getCurrentPlanetaryHour(today, sunTimes.sunrise, sunTimes.sunset);
      setCurrentHour(current);
      const nextIndex = hours.findIndex(h => h.hourNumber === (current?.hourNumber || 0) + 1);
      setNextHour(nextIndex >= 0 ? hours[nextIndex] : hours[0]);
    }
  }, [location]);

  useEffect(() => {
    if (currentHour && currentHour.endTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const [endH, endM] = currentHour.endTime.split(':').map(Number);
        const endDate = new Date(now);
        endDate.setHours(endH, endM, 0, 0);
        
        const diff = endDate - now;
        if (diff > 0) {
          const hrs = Math.floor(diff / 3600000);
          const mins = Math.floor((diff % 3600000) / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          setCountdown(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [currentHour]);

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
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Book className="w-7 h-7" style={{ color: G.text }} />
        <div>
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "ഗ്രഹ മണിക്കൂർ പുസ്തകം" : "Planetary Hour Book"}
          </h2>
          <p className="font-malayalam-sm" style={{ color: G.dim }}>
            {isMalayalam ? "ഹസ്തലിഖിതങ്ങളിൽ നിന്നുള്ള കൃത്യമായ വിവരങ്ങൾ" : "Exact Data from Manuscripts"}
          </p>
        </div>
      </div>

      {/* Day Ruler */}
      {dayRuler && (
        <div className="mb-6 p-4 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
          <div className="flex items-center gap-3 mb-3">
            <Star className="w-5 h-5" style={{ color: G.text }} />
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
              {isMalayalam ? "ദിനനാഥൻ" : "Day Ruler"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-3xl">{dayRuler.symbol}</span>
            <div>
              <p className="font-amiri text-2xl font-bold" style={{ color: G.text }}>{dayRuler.ruler_ar}</p>
              <p className="font-malayalam-md font-bold text-white">
                {isMalayalam ? dayRuler.ruler_ml : dayRuler.ruler_en}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current & Next Hour */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {currentHour && (
          <CurrentHourCard hour={currentHour} countdown={countdown} isMalayalam={isMalayalam} />
        )}
        {nextHour && (
          <NextHourCard hour={nextHour} isMalayalam={isMalayalam} />
        )}
      </div>

      {/* Full 24-Hour Sequence */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5" style={{ color: G.text }} />
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "24 മണിക്കൂർ ക്രമം" : "24-Hour Planetary Sequence"}
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {(allHours || []).map((hour, idx) => (
            <HourSequenceCard 
              key={idx} 
              hour={hour} 
              isCurrent={currentHour?.hourNumber === hour.hourNumber}
              isMalayalam={isMalayalam}
            />
          ))}
        </div>
      </div>

      {/* Manuscript Source */}
      <div className="p-4 rounded-xl border text-center" style={{ background: G.bg, borderColor: G.faint }}>
        <Book className="w-5 h-5 mx-auto mb-2" style={{ color: G.text }} />
        <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
          {isMalayalam ? "ഹസ്തലിഖിത സ്രോതസ്സ്" : "Manuscript Source"}
        </p>
        <p className="font-malayalam-sm text-white/70">
          Havâss'ın Derinlikleri, PDF2 — Planetary Hours & Friendships
        </p>
      </div>
    </motion.div>
  );
}

function CurrentHourCard({ hour, countdown, isMalayalam }) {
  const friendships = getPlanetFriendships(hour.planet);
  const isSaad = hour.planetInfo?.nature?.includes("Sa'd");

  return (
    <div className="p-5 rounded-xl border" style={{ background: G.current, borderColor: G.currentBorder }}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4" style={{ color: "#22c55e" }} />
        <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: "#22c55e" }}>
          {isMalayalam ? "നിലവിലെ മണിക്കൂർ" : "Current Hour"}
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{hour.planetInfo?.symbol}</span>
        <div>
          <p className="font-amiri text-3xl font-bold" style={{ color: "#22c55e" }}>
            {hour.planetInfo?.name_ar}
          </p>
          <p className="font-malayalam-md font-bold text-white">
            {isMalayalam ? hour.planetInfo?.name_ml_equivalent : hour.planetInfo?.name_en}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <InfoRow label={isMalayalam ? "മണിക്കൂർ" : "Hour"} value={`#${hour.hourNumber}`} />
        <InfoRow label={isMalayalam ? "സമയം" : "Time"} value={`${hour.startTime} → ${hour.endTime}`} />
        <InfoRow label={isMalayalam ? "കൗണ്ട്ഡൗൺ" : "Countdown"} value={countdown} highlight />
        <InfoRow 
          label={isMalayalam ? "സ്ഥിതി" : "Status"} 
          value={isMalayalam ? hour.planetInfo?.nature_ml : hour.planetInfo?.nature}
          status={isSaad ? "good" : "bad"}
        />
      </div>

      {friendships && (
        <div className="pt-3 border-t" style={{ borderColor: "rgba(34,197,94,0.30)" }}>
          <p className="font-inter text-[7px] uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
            {isMalayalam ? "ഗ്രഹ ബന്ധങ്ങൾ" : "Planet Relationships"}
          </p>
          {friendships.friends && (
            <p className="font-malayalam-sm text-white/80 mb-1">
              <span style={{ color: "#22c55e" }}>{isMalayalam ? "മിത്രങ്ങൾ:" : "Friends:"}</span>{" "}
              {isMalayalam ? friendships.friends_ml : friendships.friends_en}
            </p>
          )}
          {friendships.enemies && (
            <p className="font-malayalam-sm text-white/80">
              <span style={{ color: "#ef4444" }}>{isMalayalam ? "ശത്രുക്കൾ:" : "Enemies:"}</span>{" "}
              {isMalayalam ? friendships.enemies_ml : friendships.enemies_en}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function NextHourCard({ hour, isMalayalam }) {
  const friendships = getPlanetFriendships(hour.planet);
  const isSaad = hour.planetInfo?.nature?.includes("Sa'd");

  return (
    <div className="p-5 rounded-xl border" style={{ background: G.next, borderColor: G.nextBorder }}>
      <div className="flex items-center gap-2 mb-3">
        <ChevronRight className="w-4 h-4" style={{ color: "#3b82f6" }} />
        <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: "#3b82f6" }}>
          {isMalayalam ? "അടുത്ത മണിക്കൂർ" : "Next Hour"}
        </p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{hour.planetInfo?.symbol}</span>
        <div>
          <p className="font-amiri text-3xl font-bold" style={{ color: "#3b82f6" }}>
            {hour.planetInfo?.name_ar}
          </p>
          <p className="font-malayalam-md font-bold text-white">
            {isMalayalam ? hour.planetInfo?.name_ml_equivalent : hour.planetInfo?.name_en}
          </p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <InfoRow label={isMalayalam ? "മണിക്കൂർ" : "Hour"} value={`#${hour.hourNumber}`} />
        <InfoRow label={isMalayalam ? "സമയം" : "Time"} value={`${hour.startTime} → ${hour.endTime}`} />
        <InfoRow 
          label={isMalayalam ? "സ്ഥിതി" : "Status"} 
          value={isMalayalam ? hour.planetInfo?.nature_ml : hour.planetInfo?.nature}
          status={isSaad ? "good" : "bad"}
        />
      </div>

      {friendships && (
        <div className="pt-3 border-t" style={{ borderColor: "rgba(59,130,246,0.30)" }}>
          <p className="font-inter text-[7px] uppercase tracking-widest mb-2" style={{ color: "#3b82f6" }}>
            {isMalayalam ? "ഗ്രഹ ബന്ധങ്ങൾ" : "Planet Relationships"}
          </p>
          {friendships.friends && (
            <p className="font-malayalam-sm text-white/80 mb-1">
              <span style={{ color: "#3b82f6" }}>{isMalayalam ? "മിത്രങ്ങൾ:" : "Friends:"}</span>{" "}
              {isMalayalam ? friendships.friends_ml : friendships.friends_en}
            </p>
          )}
          {friendships.enemies && (
            <p className="font-malayalam-sm text-white/80">
              <span style={{ color: "#ef4444" }}>{isMalayalam ? "ശത്രുക്കൾ:" : "Enemies:"}</span>{" "}
              {isMalayalam ? friendships.enemies_ml : friendships.enemies_en}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function HourSequenceCard({ hour, isCurrent, isMalayalam }) {
  return (
    <div 
      className="p-3 rounded-lg border text-center"
      style={{
        background: isCurrent ? G.current : G.bg,
        borderColor: isCurrent ? G.currentBorder : G.faint
      }}
    >
      <p className="font-inter text-[7px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
        {isMalayalam ? `മണിക്കൂർ ${hour.hourNumber}` : `Hour ${hour.hourNumber}`}
      </p>
      <div className="flex items-center justify-center gap-2 mb-1">
        <span className="text-xl">{hour.planetInfo?.symbol}</span>
        <p className="font-amiri text-lg font-bold" style={{ color: G.text }}>
          {hour.planetInfo?.name_ar?.split(' ')[0]}
        </p>
      </div>
      <p className="font-malayalam-sm text-white/70 text-xs">
        {isMalayalam ? hour.planetInfo?.name_ml_equivalent : hour.planetInfo?.name_en}
      </p>
      {isCurrent && (
        <p className="font-inter text-[6px] uppercase tracking-widest mt-1" style={{ color: "#22c55e" }}>
          {isMalayalam ? "നിലവിലെത്" : "Current"}
        </p>
      )}
    </div>
  );
}

function InfoRow({ label, value, highlight, status }) {
  let valueColor = "text-white";
  if (highlight) valueColor = "#22c55e";
  if (status === "good") valueColor = "#22c55e";
  if (status === "bad") valueColor = "#ef4444";

  return (
    <div className="flex justify-between items-center">
      <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</p>
      <p className={`font-malayalam-sm font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}