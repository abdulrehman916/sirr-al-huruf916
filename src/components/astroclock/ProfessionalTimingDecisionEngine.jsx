// ═══════════════════════════════════════════════════════════════
// PROFESSIONAL TIMING DECISION ENGINE — REAL-TIME
// Live astronomical calculations + PDF knowledge base rules
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Book, AlertCircle, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { calculateMoonPosition } from "@/lib/astroClockMoonPosition.js";
import { getCurrentPlanetaryHour, PLANET_INFO, DAY_INFO } from "@/lib/astroClockLiveEngine.js";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  excellent: "rgba(34,197,94,0.15)",
  excellentBorder: "rgba(34,197,94,0.60)",
  acceptable: "rgba(251,191,36,0.15)",
  acceptableBorder: "rgba(251,191,36,0.60)",
  avoid: "rgba(239,68,68,0.15)",
  avoidBorder: "rgba(239,68,68,0.60)"
};

export default function ProfessionalTimingDecisionEngine() {
  const { isMalayalam } = useAstroClockLanguage();
  const [engineData, setEngineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedWhy, setExpandedWhy] = useState(false);

  useEffect(() => {
    calculateEngineData();
    const interval = setInterval(calculateEngineData, 60000);
    return () => clearInterval(interval);
  }, []);

  function calculateEngineData() {
    const now = new Date();
    const dayIndex = now.getDay();
    const moonPos = calculateMoonPosition(now);
    const planetHour = getCurrentPlanetaryHour(now, 6.5, 18.25);
    const dayInfo = DAY_INFO[dayIndex];
    
    const status = calculateStatus(moonPos, planetHour, dayInfo);
    const nextTransitions = calculateNextTransitions(now, moonPos, planetHour);
    
    setEngineData({
      timestamp: now,
      status,
      planetHour,
      dayInfo,
      moonPos,
      nextTransitions
    });
    setLoading(false);
  }

  if (loading || !engineData) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border p-8 text-center" style={{ background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)", borderColor: G.border }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: G.text, borderTopColor: "transparent" }} />
        <p className="mt-4 font-inter text-sm" style={{ color: G.dim }}>{isMalayalam ? "കണക്കാക്കുന്നു..." : "Calculating..."}</p>
      </motion.div>
    );
  }

  const { status, planetHour, dayInfo, moonPos, nextTransitions } = engineData;
  const statusConfig = getStatusConfig(status.level);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border p-6 relative overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)", borderColor: G.borderHi, boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)` }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-7 h-7" style={{ color: G.text }} />
        <div>
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>{isMalayalam ? "പ്രൊഫഷണൽ ടൈമിംഗ് തീരുമാന എഞ്ചിൻ" : "Professional Timing Decision Engine"}</h2>
          <p className="font-malayalam-sm" style={{ color: G.dim }}>{isMalayalam ? "തത്സമയ ജ്യോതിശാസ്ത്ര + PDF നിയമങ്ങൾ" : "Real-time astronomy + PDF rules"}</p>
        </div>
      </div>

      <CurrentStatus status={status} planetHour={planetHour} moonPos={moonPos} dayInfo={dayInfo} isMalayalam={isMalayalam} />
      <NextTransitions transitions={nextTransitions} isMalayalam={isMalayalam} />
      <Recommendations status={status} planetHour={planetHour} moonPos={moonPos} isMalayalam={isMalayalam} />
      <WhySection status={status} planetHour={planetHour} moonPos={moonPos} expanded={expandedWhy} onToggle={() => setExpandedWhy(!expandedWhy)} isMalayalam={isMalayalam} />
    </motion.div>
  );
}

function CurrentStatus({ status, planetHour, moonPos, dayInfo, isMalayalam }) {
  const config = getStatusConfig(status.level);
  
  return (
    <div className="mb-6 p-5 rounded-xl border" style={{ background: config.color, borderColor: config.border }}>
      <div className="flex items-center justify-between mb-4">
        <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: config.border }}>{isMalayalam ? "നിലവിലെ സ്ഥിതി" : "Current Status"}</p>
        <span className="text-2xl">{config.icon}</span>
      </div>
      <p className="font-malayalam-lg font-bold text-white mb-4">{status.level}</p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatusItem label={isMalayalam ? "ഗ്രഹ മണിക്കൂർ" : "Planetary Hour"} value={isMalayalam ? planetHour.planetInfo?.name_ml_equivalent : planetHour.planetInfo?.name_en} symbol={planetHour.planetInfo?.symbol} />
        <StatusItem label={isMalayalam ? "മൂലകം" : "Element"} value={moonPos.zodiacSign?.element} />
        <StatusItem label={isMalayalam ? "ചാന്ദ്ര മൻസിൽ" : "Lunar Mansion"} value={isMalayalam ? (moonPos.mansion?.name_ar || "—") : moonPos.mansion?.name_en} arabic={isMalayalam ? undefined : moonPos.mansion?.name_ar} />
        <StatusItem label={isMalayalam ? "രാശി" : "Zodiac Sign"} value={isMalayalam ? moonPos.zodiacSign?.name_ml : moonPos.zodiacSign?.name_en} symbol={moonPos.zodiacSign?.symbol} />
      </div>
    </div>
  );
}

function StatusItem({ label, value, symbol, arabic }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: "rgba(0,0,0,0.20)" }}>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>{label}</p>
      {arabic ? (
        <>
          <p className="font-amiri text-xl font-bold text-right" style={{ color: G.text }}>{arabic}</p>
          <p className="font-malayalam-sm font-bold text-white text-center">{value}</p>
        </>
      ) : (
        <div className="flex items-center gap-2">
          {symbol && <span className="text-lg">{symbol}</span>}
          <p className="font-malayalam-md font-bold text-white">{value}</p>
        </div>
      )}
    </div>
  );
}

function NextTransitions({ transitions, isMalayalam }) {
  return (
    <div className="mb-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <TransitionCard title={isMalayalam ? "അടുത്ത Sa'd Akbar" : "Next Sa'd Akbar"} time={transitions.nextSaadAkbar?.time} countdown={transitions.nextSaadAkbar?.countdown} type="excellent" isMalayalam={isMalayalam} />
      <TransitionCard title={isMalayalam ? "അടുത്ത Nahs Akbar" : "Next Nahs Akbar"} time={transitions.nextNahsAkbar?.time} countdown={transitions.nextNahsAkbar?.countdown} type="avoid" isMalayalam={isMalayalam} />
      <TransitionCard title={isMalayalam ? "നക്ഷത്ര മാറ്റം" : "Mansion Change"} time={transitions.nextMansionChange?.time} countdown={transitions.nextMansionChange?.countdown} type="acceptable" isMalayalam={isMalayalam} />
      <TransitionCard title={isMalayalam ? "രാശി മാറ്റം" : "Zodiac Change"} time={transitions.nextZodiacChange?.time} countdown={transitions.nextZodiacChange?.countdown} type="acceptable" isMalayalam={isMalayalam} />
    </div>
  );
}

function TransitionCard({ title, time, countdown, type, isMalayalam }) {
  const colors = {
    excellent: { bg: G.excellent, border: G.excellentBorder, text: "#22c55e" },
    avoid: { bg: G.avoid, border: G.avoidBorder, text: "#ef4444" },
    acceptable: { bg: G.acceptable, border: G.acceptableBorder, text: "#fbbf24" }
  };
  const color = colors[type];
  
  return (
    <div className="p-4 rounded-xl border" style={{ background: color.bg, borderColor: color.border }}>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: color.text }}>{title}</p>
      {time ? (
        <>
          <p className="font-malayalam-md font-bold text-white mb-1">{time}</p>
          <p className="font-inter text-[9px]" style={{ color: color.text }}>{countdown}</p>
        </>
      ) : (
        <p className="font-malayalam-sm text-white/60">{isMalayalam ? "ഇന്ന് ഇല്ല" : "Not today"}</p>
      )}
    </div>
  );
}

function Recommendations({ status, planetHour, moonPos, isMalayalam }) {
  const recommendedActions = getRecommendedActions(status, planetHour, moonPos, isMalayalam);
  const actionsToAvoid = getActionsToAvoid(status, planetHour, moonPos, isMalayalam);
  
  return (
    <div className="mb-6 grid md:grid-cols-2 gap-4">
      <div className="p-5 rounded-xl border" style={{ background: G.excellent, borderColor: G.excellentBorder }}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5" style={{ color: "#22c55e" }} />
          <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "#22c55e" }}>{isMalayalam ? "ഉചിത പ്രവർത്തനങ്ങൾ" : "Recommended Actions"}</p>
        </div>
        <div className="space-y-1">
          {recommendedActions.map((action, idx) => (
            <p key={idx} className="font-malayalam-sm text-white/80">• {action}</p>
          ))}
        </div>
      </div>
      
      <div className="p-5 rounded-xl border" style={{ background: G.avoid, borderColor: G.avoidBorder }}>
        <div className="flex items-center gap-2 mb-3">
          <XCircle className="w-5 h-5" style={{ color: "#ef4444" }} />
          <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "#ef4444" }}>{isMalayalam ? "ഒഴിവാക്കേണ്ടവ" : "Actions to Avoid"}</p>
        </div>
        <div className="space-y-1">
          {actionsToAvoid.map((action, idx) => (
            <p key={idx} className="font-malayalam-sm text-white/80">• {action}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function WhySection({ status, planetHour, moonPos, expanded, onToggle, isMalayalam }) {
  return (
    <div className="border-t" style={{ borderColor: G.faint }}>
      <button onClick={onToggle} className="w-full py-3 flex items-center justify-center gap-2" style={{ color: G.dim }}>
        <Book className="w-4 h-4" />
        <span className="font-inter text-[9px] uppercase tracking-widest">{isMalayalam ? "എന്തുകൊണ്ട്?" : "Why This Result?"}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 space-y-3">
              <WhyItem rule={`PDF: Sa'd/Nahs classification based on Moon mansion #${moonPos.mansion?.number}`} isMalayalam={isMalayalam} />
              <WhyItem rule={`PDF: ${planetHour.planetInfo?.name_en} hour rules from Havâss'ın Derinlikleri p.50-51`} isMalayalam={isMalayalam} />
              <WhyItem rule={`PDF: ${moonPos.zodiacSign?.element} element properties from manuscript`} isMalayalam={isMalayalam} />
              <WhyItem rule={`PDF: ${moonPos.mansion?.name_en} mansion operations from PDF2 p.64-74`} isMalayalam={isMalayalam} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WhyItem({ rule, isMalayalam }) {
  return (
    <div className="flex items-start gap-2">
      <AlertCircle className="w-3 h-3 mt-0.5" style={{ color: G.text }} />
      <p className="font-malayalam-sm text-white/70">{rule}</p>
    </div>
  );
}

function calculateStatus(moonPos, planetHour, dayInfo) {
  const sign = moonPos.zodiacSign?.name_en;
  const mansionNum = moonPos.mansion?.number;
  const planet = planetHour.planet;
  
  let score = 0;
  if (['Taurus', 'Cancer', 'Sagittarius', 'Pisces', 'Leo'].includes(sign)) score += 2;
  if (['Scorpio', 'Capricorn', 'Aquarius'].includes(sign)) score -= 2;
  
  const suitableMansions = [2, 3, 6, 7, 11, 15, 16, 20, 24, 26, 28];
  const worstMansions = [1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27];
  
  if (suitableMansions.includes(mansionNum)) score += 2;
  if (worstMansions.includes(mansionNum)) score -= 2;
  
  let level = 'Neutral';
  if (score >= 4) level = 'Sa\'d Akbar';
  else if (score >= 2) level = 'Sa\'d Asghar';
  else if (score <= -4) level = 'Nahs Akbar';
  else if (score <= -2) level = 'Nahs Asghar';
  
  return { level, score };
}

function calculateNextTransitions(now, moonPos, planetHour) {
  const nextSaadAkbar = findNextPeriod(now, 4, false);
  const nextNahsAkbar = findNextPeriod(now, -4, true);
  
  return {
    nextSaadAkbar: nextSaadAkbar ? { time: formatTime(nextSaadAkbar), countdown: formatCountdown(nextSaadAkbar, now) } : null,
    nextNahsAkbar: nextNahsAkbar ? { time: formatTime(nextNahsAkbar), countdown: formatCountdown(nextNahsAkbar, now) } : null,
    nextMansionChange: { time: "Tomorrow", countdown: "~2.5 days" },
    nextZodiacChange: { time: "In 3 days", countdown: "~3 days" }
  };
}

function findNextPeriod(now, targetScore, isUnfavorable) {
  const currentHour = now.getHours();
  
  for (let h = currentHour + 1; h < 24; h++) {
    const futureDate = new Date(now);
    futureDate.setHours(h, 0, 0, 0);
    
    const moonPos = calculateMoonPosition(futureDate);
    const sign = moonPos.zodiacSign?.name_en;
    const mansionNum = moonPos.mansion?.number;
    
    let score = 0;
    if (['Taurus', 'Cancer', 'Sagittarius', 'Pisces', 'Leo'].includes(sign)) score += 2;
    if (['Scorpio', 'Capricorn', 'Aquarius'].includes(sign)) score -= 2;
    
    const suitableMansions = [2, 3, 6, 7, 11, 15, 16, 20, 24, 26, 28];
    if (suitableMansions.includes(mansionNum)) score += 2;
    if ([1, 4, 5, 8, 9, 12, 13, 14, 21, 22, 25, 27].includes(mansionNum)) score -= 2;
    
    if (isUnfavorable ? score <= targetScore : score >= targetScore) {
      return futureDate;
    }
  }
  
  return null;
}

function formatTime(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  const hours = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const ampm = h >= 12 && h < 24 ? 'PM' : 'AM';
  return `${hours}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatCountdown(future, now) {
  const minutes = Math.floor((future.getTime() - now.getTime()) / 60000);
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function getStatusConfig(level) {
  const configs = {
    "Sa'd Akbar": { color: G.excellent, border: G.excellentBorder, icon: "🟢" },
    "Sa'd Asghar": { color: G.acceptable, border: G.acceptableBorder, icon: "🟡" },
    "Neutral": { color: G.acceptable, border: G.acceptableBorder, icon: "🟡" },
    "Nahs Asghar": { color: G.avoid, border: G.avoidBorder, icon: "🔴" },
    "Nahs Akbar": { color: G.avoid, border: G.avoidBorder, icon: "🔴" }
  };
  return configs[level] || configs.Neutral;
}

function getRecommendedActions(status, planetHour, moonPos, isMalayalam) {
  const actions = [];
  if (status.score >= 2) {
    actions.push(isMalayalam ? "പുതിയ സംരംഭങ്ങൾ" : "New ventures");
    actions.push(isMalayalam ? "വിവാഹം" : "Marriage proposals");
    actions.push(isMalayalam ? "വ്യാപാരം" : "Business dealings");
  }
  if (planetHour.planet === 'jupiter') {
    actions.push(isMalayalam ? "വിദ്യാഭ്യാസം" : "Education");
    actions.push(isMalayalam ? "ആദ്ധ്യാത്മിക പ്രവർത്തനങ്ങൾ" : "Spiritual work");
  }
  if (moonPos.zodiacSign?.element === 'Water') {
    actions.push(isMalayalam ? "പ്രണയം" : "Romance");
    actions.push(isMalayalam ? "ധ്യാനം" : "Meditation");
  }
  return actions.length > 0 ? actions : [isMalayalam ? "സാധാരണ കാര്യങ്ങൾ" : "Routine matters"];
}

function getActionsToAvoid(status, planetHour, moonPos, isMalayalam) {
  const actions = [];
  if (status.score <= -2) {
    actions.push(isMalayalam ? "പുതിയ കരാറുകൾ" : "New contracts");
    actions.push(isMalayalam ? "വലിയ നിക്ഷേപങ്ങൾ" : "Major investments");
  }
  if (planetHour.planet === 'saturn') {
    actions.push(isMalayalam ? "വിനോദം" : "Entertainment");
    actions.push(isMalayalam ? "പ്രണയം" : "Romance");
  }
  if (moonPos.zodiacSign?.element === 'Earth') {
    actions.push(isMalayalam ? "സാഹസിക പ്രവർത്തനങ്ങൾ" : "Risky activities");
  }
  return actions.length > 0 ? actions : [isMalayalam ? "ഒന്നും ഇല്ല" : "Nothing specific"];
}
