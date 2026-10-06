// ═══════════════════════════════════════════════════════════════
// 24-HOUR MANUSCRIPT PLANETARY HOUR CHART
// Complete planetary hour system from uploaded manuscripts
// Shows all 24 hours (12 day + 12 night) with full manuscript citations
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Sun, Moon, Calendar, Book, FileText, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle, Star, Zap } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { getAllPlanetaryHours, DAY_INFO, PLANET_INFO } from "@/lib/astroClockLiveEngine.js";
import { calculateSunriseSunset, formatDecimalTime } from "@/lib/astroClockSunriseSunset.js";
import { getPlanetFriendships } from "@/lib/astroClockPlanetFriendships.js";
import { getPlanetHourRules } from "@/lib/astroClockPlanetaryHourRules.js";
import { safeFormatTime } from "@/lib/astroClockDateUtils.js";
import ErrorBoundary from "@/components/ErrorBoundary";
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
  current: "rgba(34,197,94,0.20)",
  currentBorder: "rgba(34,197,94,0.70)",
  next: "rgba(59,130,246,0.15)",
  nextBorder: "rgba(59,130,246,0.60)",
  best: "rgba(34,197,94,0.15)",
  bestBorder: "rgba(34,197,94,0.60)",
  adverse: "rgba(239,68,68,0.15)",
  adverseBorder: "rgba(239,68,68,0.60)"
};

function decimalEndToCountdown(endDecimal) {
  if (endDecimal == null) return "";
  let ed = endDecimal >= 24 ? endDecimal - 24 : endDecimal;
  const endH = Math.floor(ed);
  const endMinFrac = (ed - endH) * 60;
  const endM = Math.floor(endMinFrac);
  const endS = Math.floor((endMinFrac - endM) * 60);
  const endDate = new Date();
  endDate.setHours(endH, endM, endS, 0);
  const diffMs = endDate - new Date();
  if (diffMs <= 0) return "Ended";
  const mins = Math.floor(diffMs / 60000);
  const secs = Math.floor((diffMs % 60000) / 1000);
  return `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
}

export default function Full24HourPlanetaryChart() {
  const { isMalayalam } = useAstroClockLanguage();
  const { location } = usePersistedLocation();
  const [allHours, setAllHours] = useState([]);
  const [currentHour, setCurrentHour] = useState(null);
  const [sunData, setSunData] = useState(null);
  const [expandedHour, setExpandedHour] = useState(null);
  const [tick, setTick] = useState(0);
  const hoursRef = useRef([]);

  useEffect(() => {
    if (!location) return;
    const today = new Date();
    const sunTimes = calculateSunriseSunset(today, location.lat, location.lng, location.timezone);
    setSunData(sunTimes);
    const hours = getAllPlanetaryHours(today, sunTimes.sunrise, sunTimes.sunset);
    hoursRef.current = hours;
    setAllHours(hours);
    setCurrentHour(hours.find(h => h.status === 'current') || null);
  }, [location]);

  // FIX 3: ONE shared interval — updates current hour detection + tick for countdowns
  useEffect(() => {
    const interval = setInterval(() => {
      const hours = hoursRef.current;
      if (hours.length > 0) {
        // FIX 1: always use status field
        setCurrentHour(hours.find(h => h.status === 'current') || null);
      }
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const countdown = currentHour ? decimalEndToCountdown(currentHour.endTimeDecimal) : "";

  const dayHours = allHours.filter(h => h.period === "day");
  const nightHours = allHours.filter(h => h.period === "night");

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-7 h-7" style={{ color: G.text }} />
          <div>
            <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
              {isMalayalam ? "24 മണിക്കൂർ ഗ്രഹ ചാർട്ട്" : "24-Hour Planetary Chart"}
            </h2>
            <p className="font-malayalam-sm" style={{ color: G.dim }}>
              {isMalayalam ? "12 പകൽ + 12 രാത്രി മണിക്കൂറുകൾ" : "12 Day + 12 Night Hours"}
            </p>
          </div>
        </div>
        
        {currentHour && (
          <div className="text-right">
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
              {isMalayalam ? "നിലവിലെ മണിക്കൂർ" : "Current Hour"}
            </p>
            <p className="font-malayalam-md font-bold text-white">
              {currentHour.planetInfo?.name_ml_equivalent || currentHour.planetInfo?.name_en}
            </p>
            <p className="font-inter text-xs" style={{ color: G.text }}>{countdown}</p>
          </div>
        )}
      </div>

      {/* Location & Sun Data */}
      {location && sunData && (
        <div className="mb-6 p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                {isMalayalam ? "സ്ഥാനം" : "Location"}
              </p>
              <p className="font-malayalam-sm text-white">
                Lat: {location.lat.toFixed(2)}, Lng: {location.lng.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                {isMalayalam ? "സൂര്യോദയം" : "Sunrise"}
              </p>
              <p className="font-malayalam-sm font-bold text-white">{formatDecimalTime(sunData.sunrise)}</p>
            </div>
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                {isMalayalam ? "സൂര്യാസ്തമയം" : "Sunset"}
              </p>
              <p className="font-malayalam-sm font-bold text-white">{formatDecimalTime(sunData.sunset)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Day Hours Table */}
      <DayHoursSection 
        hours={dayHours} 
        currentHour={currentHour} 
        expandedHour={expandedHour}
        setExpandedHour={setExpandedHour}
        isMalayalam={isMalayalam}
        tick={tick}
      />

      {/* Night Hours Table */}
      <NightHoursSection 
        hours={nightHours} 
        currentHour={currentHour} 
        expandedHour={expandedHour}
        setExpandedHour={setExpandedHour}
        isMalayalam={isMalayalam}
        tick={tick}
      />

      {/* Manuscript Source */}
      <ManuscriptSource isMalayalam={isMalayalam} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DAY HOURS SECTION
// ─────────────────────────────────────────────────────────────────────────────

function DayHoursSection({ hours, currentHour, expandedHour, setExpandedHour, isMalayalam, tick }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Sun className="w-6 h-6" style={{ color: G.text }} />
        <h3 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
          {isMalayalam ? "പകൽ 12 മണിക്കൂറുകൾ" : "12 Day Hours (Sunrise → Sunset)"}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: G.border }}>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>#</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "സമയം" : "Time"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "ഗ്രഹം" : "Planet"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "മൂലകം" : "Element"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "നില" : "Status"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "വിവരങ്ങൾ" : "Details"}</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, idx) => (
              <HourRow
                key={idx}
                hour={hour}
                index={idx}
                isCurrent={currentHour?.hourNumber === hour.hourNumber}
                isNext={currentHour && currentHour.hourNumber + 1 === hour.hourNumber}
                expanded={expandedHour === idx}
                onToggle={() => setExpandedHour(expandedHour === idx ? null : idx)}
                isMalayalam={isMalayalam}
                tick={tick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NIGHT HOURS SECTION
// ─────────────────────────────────────────────────────────────────────────────

function NightHoursSection({ hours, currentHour, expandedHour, setExpandedHour, isMalayalam, tick }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Moon className="w-6 h-6" style={{ color: G.text }} />
        <h3 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
          {isMalayalam ? "രാത്രി 12 മണിക്കൂറുകൾ" : "12 Night Hours (Sunset → Sunrise)"}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: G.border }}>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>#</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "സമയം" : "Time"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "ഗ്രഹം" : "Planet"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "മൂലകം" : "Element"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "നില" : "Status"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "വിവരങ്ങൾ" : "Details"}</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, idx) => (
              <HourRow
                key={idx}
                hour={hour}
                index={12 + idx}
                isCurrent={currentHour?.hourNumber === hour.hourNumber}
                isNext={currentHour && currentHour.hourNumber + 1 === hour.hourNumber}
                expanded={expandedHour === (12 + idx)}
                onToggle={() => setExpandedHour(expandedHour === (12 + idx) ? null : (12 + idx))}
                isMalayalam={isMalayalam}
                tick={tick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOUR ROW
// ─────────────────────────────────────────────────────────────────────────────

// FIX 3: No per-row setInterval. tick prop from parent drives re-render every second.
function HourRow({ hour, index, isCurrent, isNext, expanded, onToggle, isMalayalam, tick }) {
  const planetRules = getPlanetHourRules(hour.planet);
  const friendships = getPlanetFriendships(hour.planet);
  // Derived directly from tick — no state, no interval
  const hourCountdown = (isCurrent || expanded) ? decimalEndToCountdown(hour.endTimeDecimal) : "";
  const status = isCurrent ? "current" : isNext ? "next" : hour.planetInfo?.nature === "benefic" ? "best" : "adverse";
  
  const statusConfig = {
    current: { bg: G.current, border: G.currentBorder, icon: CheckCircle, color: "#22c55e", label: isMalayalam ? "നിലവിലെത്" : "Current" },
    next: { bg: G.next, border: G.nextBorder, icon: Clock, color: "#3b82f6", label: isMalayalam ? "അടുത്തത്" : "Next" },
    best: { bg: G.best, border: G.bestBorder, icon: Star, color: "#22c55e", label: isMalayalam ? "ഉത്തമം" : "Best" },
    adverse: { bg: G.adverse, border: G.adverseBorder, icon: AlertCircle, color: "#ef4444", label: isMalayalam ? "അനുചിതം" : "Adverse" }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <>
      <tr 
        className={`border-b cursor-pointer transition-all ${expanded ? 'bg-opacity-20' : ''}`}
        style={{ 
          background: config.bg, 
          borderColor: config.border,
        }}
        onClick={onToggle}
      >
        <td className="py-3 px-3">
          <span className="font-malayalam-sm font-bold text-white">#{index + 1}</span>
        </td>
        <td className="py-3 px-3">
          <div className="font-malayalam-sm text-white">
            {hour.startTime} - {hour.endTime}
          </div>
          <div className="font-inter text-[9px]" style={{ color: G.dim }}>
            {typeof hour.durationMinutes === 'number' && Number.isFinite(hour.durationMinutes) ? `${hour.durationMinutes.toFixed(1)} min` : hour.duration || '--'}
          </div>
          {hourCountdown && (
            <div className={`font-inter text-[8px] font-bold ${isCurrent ? 'text-green-400' : isNext ? 'text-blue-400' : ''}`} style={{ color: isCurrent ? '#22c55e' : isNext ? '#3b82f6' : G.dim }}>
              {hourCountdown}
            </div>
          )}
        </td>
        <td className="py-3 px-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">{hour.planetInfo?.symbol}</span>
            <div>
              <p className="font-malayalam-sm font-bold text-white">{hour.planetInfo?.name_ml_equivalent || hour.planetInfo?.name_en}</p>
              <p className="font-amiri text-xs" style={{ color: G.text }}>{hour.planetInfo?.name_ar}</p>
            </div>
          </div>
        </td>
        <td className="py-3 px-3">
          <span className="font-malayalam-sm text-white/80">{hour.planetInfo?.element}</span>
        </td>
        <td className="py-3 px-3">
          <div className="flex items-center gap-2">
            <StatusIcon className="w-4 h-4" style={{ color: config.color }} />
            <span className="font-inter text-[9px]" style={{ color: config.color }}>{config.label}</span>
          </div>
        </td>
        <td className="py-3 px-3">
          <button className="p-2 rounded-lg hover:bg-white/5">
            {expanded ? <ChevronUp className="w-4 h-4" style={{ color: G.dim }} /> : <ChevronDown className="w-4 h-4" style={{ color: G.dim }} />}
          </button>
        </td>
      </tr>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <td colSpan={6} className="p-0">
              <ErrorBoundary fallbackMessage="Could not load hour details. Please try again.">
                <HourDetails 
                  hour={hour} 
                  index={index}
                  planetRules={planetRules}
                  friendships={friendships}
                  isMalayalam={isMalayalam}
                />
              </ErrorBoundary>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HOUR DETAILS
// ─────────────────────────────────────────────────────────────────────────────

function HourDetails({ hour, index, planetRules, friendships, isMalayalam }) {
  const dayIndex = new Date().getDay();
  const dayInfo = DAY_INFO[dayIndex];

  return (
    <div className="p-6" style={{ background: "rgba(0,0,0,0.30)" }}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Hour Info */}
        <div>
          <h4 className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
            {isMalayalam ? "മണിക്കൂർ വിവരങ്ങൾ" : "Hour Information"}
          </h4>
          <div className="space-y-2 text-sm">
            <DetailRow label={isMalayalam ? "മണിക്കൂർ നമ്പർ" : "Hour Number"} value={`#${index + 1}`} />
            <DetailRow label={isMalayalam ? "ആരംഭം" : "Start"} value={hour.startTime} />
            <DetailRow label={isMalayalam ? "അവസാനം" : "End"} value={hour.endTime} />
            <DetailRow label={isMalayalam ? "ദൈർഘ്യം" : "Duration"} value={`${typeof hour.durationMinutes === 'number' && Number.isFinite(hour.durationMinutes) ? hour.durationMinutes.toFixed(1) : '--'} min`} />
            <DetailRow label={isMalayalam ? "ഗ്രഹം" : "Planet Ruler"} value={hour.planetInfo?.name_en} symbol={hour.planetInfo?.symbol} />
            <DetailRow label={isMalayalam ? "ദിവസ നാഥൻ" : "Day Ruler"} value={dayInfo?.ruler ? (isMalayalam ? (PLANET_INFO[dayInfo.ruler]?.name_ml_equivalent) : PLANET_INFO[dayInfo.ruler]?.name_en) : '--'} symbol={dayInfo?.ruler ? PLANET_INFO[dayInfo.ruler]?.symbol : ''} />
          </div>
        </div>

        {/* Friendships */}
        <div>
          <h4 className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
            {isMalayalam ? "ഗ്രഹ ബന്ധങ്ങൾ" : "Planetary Relationships"}
          </h4>
          <div className="space-y-3">
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: "#22c55e" }}>
                {isMalayalam ? "സുഹൃത്തുക്കൾ" : "Friends"}
              </p>
              <div className="flex flex-wrap gap-2">
                {friendships?.friends?.map((f, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg text-xs" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: "#ef4444" }}>
                {isMalayalam ? "ശത്രുക്കൾ" : "Enemies"}
              </p>
              <div className="flex flex-wrap gap-2">
                {friendships?.enemies?.map((e, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg text-xs" style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}>
                    {e}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                {isMalayalam ? "നിഷ്പക്ഷർ" : "Neutral"}
              </p>
              <div className="flex flex-wrap gap-2">
                {friendships?.neutral?.map((n, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-lg text-xs" style={{ background: G.bg, color: G.text }}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <h4 className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
            {isMalayalam ? "പ്രവർത്തനങ്ങൾ" : "Recommended Actions"}
          </h4>
          <div className="space-y-3">
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: "#22c55e" }}>
                {isMalayalam ? "ശുഭകരം" : "Recommended"}
              </p>
              <ul className="text-sm text-white/80 space-y-1">
                {(planetRules?.suitableActions?.en || planetRules?.suitable || []).slice(0, 5).map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 mt-0.5" style={{ color: "#22c55e" }} />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: "#ef4444" }}>
                {isMalayalam ? "നിഷിദ്ധം" : "Prohibited"}
              </p>
              <ul className="text-sm text-white/80 space-y-1">
                {(planetRules?.unsuitableActions?.en || planetRules?.unsuitable || []).slice(0, 5).map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <XCircle className="w-3 h-3 mt-0.5" style={{ color: "#ef4444" }} />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Manuscript Citation */}
      <div className="mt-6 pt-6 border-t" style={{ borderColor: G.faint }}>
        <h4 className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
          {isMalayalam ? "ഹസ്തലിഖിത സ്രോതസ്സ്" : "Manuscript Source"}
        </h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <Book className="w-4 h-4" style={{ color: G.text }} />
              <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "പുസ്തകം" : "Book"}</p>
            </div>
            <p className="font-malayalam-sm font-bold text-white">Havâss'ın Derinlikleri</p>
            <p className="font-inter text-xs" style={{ color: G.dim }}>Bülent Kısa</p>
          </div>
          
          <div className="p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" style={{ color: G.text }} />
              <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "പേജ്" : "Page"}</p>
            </div>
            <p className="font-malayalam-sm font-bold text-white">{planetRules?.pdf_pages || planetRules?.source_pages || "PDF2 p.50-62"}</p>
          </div>

          {planetRules?.original_text && (
            <div className="md:col-span-2 p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
                {isMalayalam ? "യഥാർത്ഥ വാചകം" : "Original Text"}
              </p>
              <p className="font-amiri text-lg text-right" style={{ color: G.text }}>{planetRules.original_text}</p>
            </div>
          )}

          {planetRules?.malayalam_translation && (
            <div className="md:col-span-2 p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: `1px solid rgba(34,197,94,0.40)` }}>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
                {isMalayalam ? "മലയാളം" : "Malayalam Translation"}
              </p>
              <p className="font-malayalam-sm text-white/90">{planetRules.malayalam_translation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUSCRIPT SOURCE
// ─────────────────────────────────────────────────────────────────────────────

function ManuscriptSource({ isMalayalam }) {
  return (
    <div className="mt-6 p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <div className="flex items-center gap-3 mb-4">
        <Book className="w-6 h-6" style={{ color: G.text }} />
        <h3 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
          {isMalayalam ? "ഹസ്തലിഖിത സ്രോതസ്സ്" : "Manuscript Source"}
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            {isMalayalam ? "പുസ്തക പേര്" : "Book Name"}
          </p>
          <p className="font-malayalam-md font-bold text-white">Havâss'ın Derinlikleri</p>
          <p className="font-inter text-xs" style={{ color: G.dim }}>Bülent Kısa</p>
        </div>

        <div>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            {isMalayalam ? "പേജ് നമ്പറുകൾ" : "Page Numbers"}
          </p>
          <p className="font-malayalam-sm text-white">PDF2: p.49-62, p.72-92</p>
        </div>

        <div className="md:col-span-2">
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
            {isMalayalam ? "യഥാർത്ഥ വാചകം" : "Original Manuscript Text"}
          </p>
          <div className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-amiri text-xl text-right leading-relaxed" style={{ color: G.text }}>
              ساعات الكواكب السبعة تبدأ من شروق الشمس إلى غروبها للنهار، ومن غروبها إلى شروقها لليل
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
            {isMalayalam ? "മലയാളം തർജ്ജമ" : "Malayalam Translation"}
          </p>
          <div className="p-4 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: `1px solid rgba(34,197,94,0.40)` }}>
            <p className="font-malayalam-sm text-white/90">
              ഏഴ് ഗ്രഹങ്ങളുടെ മണിക്കൂറുകൾ സൂര്യോദയം മുതൽ സൂര്യാസ്തമയം വരെ പകലും, സൂര്യാസ്തമയം മുതൽ സൂര്യോദയം വരെ രാത്രിയും ആയിരിക്കുന്നു.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t" style={{ borderColor: G.faint }}>
        <p className="font-inter text-[8px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
          {isMalayalam ? "എല്ലാ നിയമങ്ങളും അപ്‌ലോഡ് ചെയ്ത PDF കളിൽ നിന്ന് മാത്രം" : "All rules from uploaded PDF manuscripts only"}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Removed - using safeFormatTime from astroClockDateUtils

function DetailRow({ label, value, symbol }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</span>
      <div className="flex items-center gap-2">
        {symbol && <span className="text-sm">{symbol}</span>}
        <span className="font-malayalam-sm text-white">{value}</span>
      </div>
    </div>
  );
}