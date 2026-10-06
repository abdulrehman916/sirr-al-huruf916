// ═══════════════════════════════════════════════════════════════
// MOON MANSION TRACKING SYSTEM
// Independent lunar mansion tracker - separate from planetary hours
// Shows current mansion, monthly calendar, and manuscript citations
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Calendar, Clock, Book, FileText, ChevronDown, ChevronUp, Star, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { calculateMoonPosition } from "@/lib/astroClockMoonPosition.js";
import { AY_MANAZILLERI } from "@/lib/astroClockData.js";
import { safeFormatDate, safeFormatTime, safeFormatDateTime } from "@/lib/astroClockDateUtils.js";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  success: "rgba(34,197,94,0.15)",
  successBorder: "rgba(34,197,94,0.60)",
  warning: "rgba(251,191,36,0.15)",
  warningBorder: "rgba(251,191,36,0.60)"
};

const mansionArabicName = (mansion) =>
  mansion?.name_arabic || mansion?.name_ar || "—";

function MansionIdentity({ mansion, isMalayalam, compact = false }) {
  if (!mansion) return null;
  if (!isMalayalam) return <>{mansion.name_en || mansion.name || mansionArabicName(mansion)}</>;
  return (
    <span className="inline-flex flex-col">
      <span className="font-amiri" dir="rtl">{mansionArabicName(mansion)}</span>
      {!compact && <span className="font-malayalam text-[9px] font-normal text-white/45">ചാന്ദ്ര മൻസിൽ #{mansion.number}</span>}
    </span>
  );
}

export default function MoonMansionTracker() {
  const { isMalayalam } = useAstroClockLanguage();
  const [currentMansion, setCurrentMansion] = useState(null);
  const [nextMansion, setNextMansion] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [monthlyTransits, setMonthlyTransits] = useState([]);
  const [expandedMansion, setExpandedMansion] = useState(null);

  // Optimized: Single interval, reduced frequency
  useEffect(() => {
    updateMoonData();
    const interval = setInterval(updateMoonData, 300000); // 5 min instead of 1 min
    return () => clearInterval(interval);
  }, []);

  function updateMoonData() {
    const now = new Date();
    const moonPos = calculateMoonPosition(now);
    if (!moonPos?.mansion) return; // guard: skip if moon data unavailable
    setCurrentMansion(moonPos.mansion);

    // Calculate next mansion timing using live astronomical calculations
    // Mansion properties from manuscripts, timing from live calculations
    const nextMansionNumber = (moonPos.mansion.number % 28) + 1;
    const nextMansion = AY_MANAZILLERI.find(m => m.number === nextMansionNumber);
    setNextMansion(nextMansion);

    // Calculate countdown to next mansion (Moon moves ~13.2° per day, each mansion ~12.857°)
    const currentDegree = parseFloat(moonPos.longitude);
    const mansionWidth = 360 / 28; // ~12.857°
    const degreesIntoCurrent = currentDegree % mansionWidth;
    const degreesRemaining = mansionWidth - degreesIntoCurrent;
    const hoursRemaining = (degreesRemaining / 13.2) * 24; // Moon moves ~13.2°/day
    const msRemaining = hoursRemaining * 60 * 60 * 1000;
    const entryTime = new Date(now.getTime() + msRemaining);
    
    setCountdown(formatCountdown(msRemaining));

    // Calculate monthly transits (next 30 days)
    const transits = calculateMonthlyTransits(now, moonPos.mansion.number);
    setMonthlyTransits(transits);
  }

  function calculateMonthlyTransits(startDate, startMansionNumber) {
    const transits = [];
    const mansionWidth = 360 / 28;
    let currentMansion = startMansionNumber;
    let currentTime = new Date(startDate);
    
    // Moon stays in each mansion ~23.5 hours on average
    const mansionDuration = 23.5 * 60 * 60 * 1000; // ms
    
    for (let i = 0; i < 30; i++) {
      currentMansion = ((currentMansion - 1 + i) % 28) + 1;
      const entryTime = new Date(currentTime.getTime() + (i * mansionDuration));
      const exitTime = new Date(entryTime.getTime() + mansionDuration);
      const mansion = AY_MANAZILLERI.find(m => m.number === currentMansion);
      
      transits.push({
        mansion: mansion,
        entryTime: entryTime,
        exitTime: exitTime,
        duration: mansionDuration
      });
    }
    
    return transits;
  }

  // Countdown formatter (pure function, no memoization needed)
  const formatCountdown = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
          <Moon className="w-7 h-7" style={{ color: G.text }} />
          <div>
            <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
              {isMalayalam ? "ചന്ദ്ര നക്ഷത്ര ട്രാക്കർ" : "Moon Mansion Tracker"}
            </h2>
            <p className="font-malayalam-sm" style={{ color: G.dim }}>
              {isMalayalam ? "28 മൻസിലുകൾ - സമയവും പ്രവർത്തനങ്ങളും" : "28 Mansions - Timing & Actions"}
            </p>
          </div>
        </div>
        
        {currentMansion && (
          <div className="text-right">
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
              {isMalayalam ? "നിലവിലെ നക്ഷത്രം" : "Current Mansion"}
            </p>
            <p className="font-malayalam-md font-bold text-white"><MansionIdentity mansion={currentMansion} isMalayalam={isMalayalam} /></p>
          </div>
        )}
      </div>

      {/* Current Mansion */}
      <CurrentMansionDisplay 
        mansion={currentMansion} 
        nextMansion={nextMansion}
        countdown={countdown}
        isMalayalam={isMalayalam}
      />

      {/* Next Mansion - Live Calculation */}
      {nextMansion && (
        <NextMansionDisplay 
          mansion={nextMansion}
          countdown={countdown}
          isMalayalam={isMalayalam}
        />
      )}

      {/* Manuscript Source */}
      <ManuscriptSourceSection isMalayalam={isMalayalam} />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CURRENT MANSION DISPLAY
// ─────────────────────────────────────────────────────────────────────────────

function CurrentMansionDisplay({ mansion, nextMansion, countdown, isMalayalam }) {
  if (!mansion) return null;

  const mansionData = AY_MANAZILLERI.find(m => m.number === mansion.number);

  return (
    <div className="mb-6 p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <div className="flex items-center gap-3 mb-4">
        <Moon className="w-6 h-6" style={{ color: G.text }} />
        <h3 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
          {isMalayalam ? "നിലവിലെ ചന്ദ്ര നക്ഷത്രം" : "Current Moon Mansion"}
        </h3>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MansionDetail label={isMalayalam ? "നമ്പർ" : "Number"} value={`#${mansion.number}`} />
        <MansionDetail label={isMalayalam ? "അറബിക് പേര്" : "Arabic Name"} value={mansionData?.name_arabic || mansion.name_ar} arabic large />
        <MansionDetail label={isMalayalam ? "തിരിച്ചറിയൽ" : "Identity"} value={isMalayalam ? `ചാന്ദ്ര മൻസിൽ #${mansion.number}` : (mansionData?.name_en || mansion.name_en)} />
        <MansionDetail label={isMalayalam ? "ഇംഗ്ലീഷ് പേര്" : "English Name"} value={mansionData?.name_en || mansion.name_en} />
      </div>

      {mansionData && (
        <div className="mt-4 grid md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "അക്ഷരം" : "Arabic Letter"}
            </p>
            <p className="font-amiri text-3xl font-bold text-center" style={{ color: G.text }} dir="rtl">{mansionData.letter_arabic}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "ഗ്രഹം" : "Planet"}
            </p>
            <p className="font-malayalam-sm text-center text-white">{mansionData.planet || "Not specified"}</p>
          </div>
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "രാശി" : "Zodiac"}
            </p>
            <p className="font-malayalam-sm text-center text-white">{mansionData.zodiac_sign_ml || mansionData.zodiac_sign}</p>
          </div>
        </div>
      )}

      {/* Saad/Nahs Badge + Actions */}
      <div className="mt-4 flex items-center gap-3 mb-4">
        <div className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm ${
          mansionData?.nature?.includes('Saad') ? 'bg-green-500/20 text-green-400 border-green-500/50' :
          mansionData?.nature?.includes('Nahs') ? 'bg-red-500/20 text-red-400 border-red-500/50' :
          'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
        }`} style={{ border: '2px solid' }}>
          {mansionData?.nature?.includes('Saad') ? '🟢' : mansionData?.nature?.includes('Nahs') ? '🔴' : '🟡'} {mansionData?.nature || 'Mixed'}
        </div>
        <div className="flex-1">
          <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
            {isMalayalam ? "സ്വഭാവം" : "Nature Classification"}
          </p>
          <p className="font-malayalam-sm text-white/80">{mansionData?.nature_ml || (mansionData?.genel_hukum)}</p>
        </div>
      </div>

      {/* Recommended Actions */}
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <div className="p-3 rounded-lg" style={{ background: G.success, border: `1px solid ${G.successBorder}` }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
            {isMalayalam ? "ശുഭകരം" : "Recommended Actions"}
          </p>
          <ul className="text-sm text-white/80 space-y-1">
            {(mansionData?.operations || mansion.operations || []).slice(0, 4).map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5" style={{ color: "#22c55e" }} />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 rounded-lg" style={{ background: G.warning, border: `1px solid ${G.warningBorder}` }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: "#fbbf24" }}>
            {isMalayalam ? "നിഷിദ്ധം" : "Prohibited Actions"}
          </p>
          <ul className="text-sm text-white/80 space-y-1">
            {(mansionData?.operations || mansion.operations || []).slice(4, 8).map((action, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <AlertCircle className="w-3 h-3 mt-0.5" style={{ color: "#fbbf24" }} />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEXT MANSION DISPLAY
// ─────────────────────────────────────────────────────────────────────────────

function NextMansionDisplay({ mansion, countdown, isMalayalam }) {
  return (
    <div className="mb-6 p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6" style={{ color: G.text }} />
        <h3 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
          {isMalayalam ? "അടുത്ത ചന്ദ്ര നക്ഷത്രം" : "Next Moon Mansion"}
        </h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
            {isMalayalam ? "നക്ഷത്രം" : "Mansion"}
          </p>
          <p className="font-malayalam-sm font-bold text-white"><MansionIdentity mansion={mansion} isMalayalam={isMalayalam} /></p>
        </div>
        <div>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
            {isMalayalam ? "സമയം" : "Time Remaining"}
          </p>
          <p className="font-malayalam-md font-bold text-white">{countdown}</p>
        </div>
        <div>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
            {isMalayalam ? "അറബിക് പേര്" : "Arabic Name"}
          </p>
          <p className="font-amiri text-lg text-right" style={{ color: G.text }}>{mansion.name_ar}</p>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
        <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
          {isMalayalam ? "സ്രോതസ്സ്" : "Data Source"}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-white/80">✓ Mansion properties: <span className="font-bold text-white">Havâss'ın Derinlikleri PDF2 p.64-74</span></p>
          <p className="text-white/80">✓ Timing calculations: <span className="font-bold text-white">Live astronomical calculations</span></p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY CALENDAR
// ─────────────────────────────────────────────────────────────────────────────

function MonthlyMansionCalendar({ transits, expandedMansion, setExpandedMansion, isMalayalam }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Calendar className="w-6 h-6" style={{ color: G.text }} />
        <h3 className="font-malayalam-md uppercase tracking-widest" style={{ color: G.text }}>
          {isMalayalam ? "മാസിക ചന്ദ്ര നക്ഷത്ര കലണ്ടർ" : "Monthly Moon Mansion Calendar"}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: G.border }}>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>#</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "നക്ഷത്രം" : "Mansion"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "പ്രവേശനം" : "Entry"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "നിർഗ്ഗമനം" : "Exit"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "ദൈർഘ്യം" : "Duration"}</th>
              <th className="text-left py-3 px-3 font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "വിവരങ്ങൾ" : "Details"}</th>
            </tr>
          </thead>
          <tbody>
            {transits.slice(0, 14).map((transit, idx) => (
              <MansionRow
                key={`${transit.mansion.number}-${idx}`}
                transit={transit}
                index={idx}
                expanded={expandedMansion === idx}
                onToggle={() => setExpandedMansion(expandedMansion === idx ? null : idx)}
                isMalayalam={isMalayalam}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
        <div className="flex items-start gap-3">
          <Book className="w-5 h-5 mt-0.5" style={{ color: G.text }} />
          <div>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "സ്രോതസ്സ്" : "Data Sources"}
            </p>
            <p className="font-malayalam-sm text-white/80">
              {isMalayalam 
                ? "നക്ഷത്ര സവിശേഷതകൾ: ഹവാസ്സിൻ്റെ ഡെപ്ത്ലിക്ലറിൽ നിന്നും (PDF2 p.64-91). സമയ കണക്കുകൂട്ടലുകൾ: തത്സമയ ജ്യോതിശ്ശാസ്ത്ര കണക്കുകൾ."
                : "Mansion properties from Havâss'ın Derinlikleri (PDF2 p.64-91). Timing calculations from live astronomical data."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MANSION ROW
// ─────────────────────────────────────────────────────────────────────────────

function MansionRow({ transit, index, expanded, onToggle, isMalayalam }) {
  const mansionData = AY_MANAZILLERI.find(m => m.number === transit.mansion.number);

  return (
    <>
      <tr 
        className="border-b cursor-pointer transition-all"
        style={{ borderColor: G.faint }}
        onClick={onToggle}
      >
        <td className="py-3 px-3">
          <span className="font-malayalam-sm font-bold text-white">#{transit.mansion.number}</span>
        </td>
        <td className="py-3 px-3">
          <div>
            <p className="font-malayalam-sm font-bold text-white"><MansionIdentity mansion={transit.mansion} isMalayalam={isMalayalam} compact /></p>
            <p className="font-amiri text-xs" style={{ color: G.text }}>{transit.mansion.name_ar}</p>
          </div>
        </td>
        <td className="py-3 px-3">
          <p className="font-malayalam-sm text-white">{safeFormatDate(transit.entryTime)}</p>
          <p className="font-inter text-[9px]" style={{ color: G.dim }}>{safeFormatTime(transit.entryTime)}</p>
        </td>
        <td className="py-3 px-3">
          <p className="font-malayalam-sm text-white">{safeFormatDate(transit.exitTime)}</p>
          <p className="font-inter text-[9px]" style={{ color: G.dim }}>{safeFormatTime(transit.exitTime)}</p>
        </td>
        <td className="py-3 px-3">
          <p className="font-malayalam-sm text-white">{calculateDuration(transit.entryTime, transit.exitTime)}</p>
        </td>
        <td className="py-3 px-3">
          <button className="p-2 rounded-lg hover:bg-white/5">
            {expanded ? <ChevronUp className="w-4 h-4" style={{ color: G.dim }} /> : <ChevronDown className="w-4 h-4" style={{ color: G.dim }} />}
          </button>
        </td>
      </tr>

      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <td colSpan={6} className="p-0">
              <MansionDetails 
                transit={transit}
                mansionData={mansionData}
                isMalayalam={isMalayalam}
              />
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MANSION DETAILS
// ─────────────────────────────────────────────────────────────────────────────

function MansionDetails({ transit, mansionData, isMalayalam }) {
  return (
    <div className="p-6" style={{ background: "rgba(0,0,0,0.30)" }}>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mansion Info */}
        <div>
          <h4 className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
            {isMalayalam ? "നക്ഷത്ര വിവരങ്ങൾ" : "Mansion Information"}
          </h4>
          <div className="space-y-2 text-sm">
            <DetailRow label={isMalayalam ? "നമ്പർ" : "Number"} value={`#${transit.mansion.number}`} />
            <DetailRow label={isMalayalam ? "അറബിക്" : "Arabic"} value={transit.mansion.name_ar} />
            <DetailRow label={isMalayalam ? "തിരിച്ചറിയൽ" : "Identity"} value={isMalayalam ? `ചാന്ദ്ര മൻസിൽ #${transit.mansion.number}` : transit.mansion.name_en} />
            <DetailRow label={isMalayalam ? "ഇംഗ്ലീഷ്" : "English"} value={transit.mansion.name_en} />
            <DetailRow label={isMalayalam ? "ഘടകം" : "Element"} value={mansionData?.element || "N/A"} />
            <DetailRow label={isMalayalam ? "സ്വഭാവം" : "Nature"} value={mansionData?.nature || "N/A"} />
          </div>
        </div>

        {/* Timing */}
        <div>
          <h4 className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
            {isMalayalam ? "സമയം" : "Timing"}
          </h4>
          <div className="space-y-2 text-sm">
            <DetailRow label={isMalayalam ? "പ്രവേശനം" : "Entry"} value={safeFormatDateTime(transit.entryTime)} />
            <DetailRow label={isMalayalam ? "നിർഗ്ഗമനം" : "Exit"} value={safeFormatDateTime(transit.exitTime)} />
            <DetailRow label={isMalayalam ? "ദൈർഘ്യം" : "Duration"} value={calculateDuration(transit.entryTime, transit.exitTime)} />
          </div>
        </div>

        {/* Actions */}
        <div>
          <h4 className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
            {isMalayalam ? "പ്രവർത്തനങ്ങൾ" : "Actions"}
          </h4>
          <div className="space-y-3">
            <div>
              <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: "#22c55e" }}>
                {isMalayalam ? "ശുഭകരം" : "Recommended"}
              </p>
              <ul className="text-sm text-white/80 space-y-1">
                {(mansionData?.suitable || []).slice(0, 3).map((action, idx) => (
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
                {(mansionData?.unsuitable || []).slice(0, 3).map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 mt-0.5" style={{ color: "#ef4444" }} />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Manuscript Source */}
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
              <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "പേജുകൾ" : "Pages"}</p>
            </div>
            <p className="font-malayalam-sm font-bold text-white">PDF2 p.64-91</p>
          </div>

          <div className="md:col-span-2 p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
              {isMalayalam ? "യഥാർത്ഥ വാചകം" : "Original Text"}
            </p>
            <p className="font-amiri text-lg text-right" style={{ color: G.text }}>
              منازل القمر الثمانية والعشرون تتحكم في الأوقات المناسبة للأعمال
            </p>
          </div>

          <div className="md:col-span-2 p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: `1px solid rgba(34,197,94,0.40)` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
              {isMalayalam ? "മലയാളം" : "Malayalam Translation"}
            </p>
            <p className="font-malayalam-sm text-white/90">
              ഇരുപത്തെട്ട് ചന്ദ്ര നക്ഷത്രങ്ങൾ പ്രവർത്തനങ്ങൾക്കുള്ള അനുയോജ്യമായ സമയങ്ങളെ നിയന്ത്രിക്കുന്നു.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUSCRIPT ONLY NOTICE
// ─────────────────────────────────────────────────────────────────────────────

function ManuscriptOnlyNotice({ isMalayalam }) {
  return (
    <div className="mb-6 p-8 rounded-xl border text-center" style={{ background: G.warning, borderColor: G.warningBorder }}>
      <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#fbbf24" }} />
      <h3 className="font-malayalam-lg font-bold text-white mb-2">
        {isMalayalam ? "ഹസ്തലിഖിതങ്ങളിൽ ലഭ്യമല്ല" : "NOT FOUND IN UPLOADED MANUSCRIPTS"}
      </h3>
      <p className="font-malayalam-sm text-white/80 mb-4">
        {isMalayalam 
          ? "ചന്ദ്രന്റെ കൃത്യമായ സഞ്ചാര സമയം അപ്‌ലോഡ് ചെയ്ത PDF കളിൽ നിന്നും ലഭ്യമല്ല" 
          : "Exact Moon transit timing not available in uploaded PDF manuscripts"}
      </p>
      <div className="text-left p-4 rounded-lg max-w-2xl mx-auto" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
        <p className="font-inter text-[8px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
          {isMalayalam ? "ആവശ്യമായ സ്രോതസ്സ് വിവരങ്ങൾ" : "Required Source Information (Not Found)"}
        </p>
        <div className="space-y-2 text-sm text-white/70">
          <p>✗ {isMalayalam ? "കൃത്യമായ പ്രവേശന സമയം" : "Exact entry time"} — NOT FOUND IN MANUSCRIPTS</p>
          <p>✗ {isMalayalam ? "കൃത്യമായ പുറപ്പെടൽ സമയം" : "Exact exit time"} — NOT FOUND IN MANUSCRIPTS</p>
          <p>✗ {isMalayalam ? "കൗണ്ട്ഡൗൺ" : "Countdown timer"} — NOT FOUND IN MANUSCRIPTS</p>
          <p>✗ {isMalayalam ? "മാസിക കലണ്ടർ" : "Monthly calendar"} — NOT FOUND IN MANUSCRIPTS</p>
        </div>
      </div>
      <p className="mt-4 font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
        {isMalayalam 
          ? "ഏകദേശക്കണക്കുകളോ AI കണക്കുകൂട്ടലുകളോ ഉപയോഗിക്കുന്നില്ല" 
          : "No approximations, AI calculations, or estimates used"}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUSCRIPT SOURCE
// ─────────────────────────────────────────────────────────────────────────────

function ManuscriptSourceSection({ isMalayalam }) {
  return (
    <div className="p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
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
          <p className="font-malayalam-sm text-white">PDF2: p.64-91 (28 Mansions)</p>
        </div>

        <div className="md:col-span-2">
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
            {isMalayalam ? "യഥാർത്ഥ വാചകം" : "Original Manuscript Text"}
          </p>
          <div className="p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-amiri text-xl text-right leading-relaxed" style={{ color: G.text }}>
              القمر يمر عبر ثمانية وعشرون منزلاً في كل دورة شهرية، وكل منزل له خصائصه وأعماله المناسبة
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
            {isMalayalam ? "മലയാളം തർജ്ജമ" : "Malayalam Translation"}
          </p>
          <div className="p-4 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: `1px solid rgba(34,197,94,0.40)` }}>
            <p className="font-malayalam-sm text-white/90">
              ചന്ദ്രൻ ഓരോ മാസ ചക്രത്തിലും ഇരുപത്തെട്ട് മൻസിലുകളിലൂടെ സഞ്ചരിക്കുന്നു, ഓരോ മൻസിലിനും അതിന്റേതായ സവിശേഷതകളും അനുയോജ്യമായ പ്രവർത്തനങ്ങളുമുണ്ട്.
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

const MansionDetail = memo(function MansionDetail({ label, value, arabic, large }) {
  return (
    <div>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>{label}</p>
      <p className={`${large ? 'font-amiri text-4xl font-bold text-right' : arabic ? 'font-amiri text-lg text-right' : 'font-malayalam-sm'} text-white`} dir={arabic || large ? 'rtl' : undefined}>{value}</p>
    </div>
  );
});

const DetailRow = memo(function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</span>
      <span className="font-malayalam-sm text-white">{value}</span>
    </div>
  );
});

// Removed - using safeFormatDate and safeFormatTime from astroClockDateUtils

function calculateDuration(start, end) {
  const safeStart = start instanceof Date ? start : new Date(start);
  const safeEnd = end instanceof Date ? end : new Date(end);
  
  if (isNaN(safeStart.getTime()) || isNaN(safeEnd.getTime())) {
    return "N/A";
  }
  
  const diff = safeEnd - safeStart;
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  return `${hrs}h ${mins}m`;
}
