// ═══════════════════════════════════════════════════════════════
// PROFESSIONAL ACTION TIMING ADVISOR — COMPREHENSIVE TIMING
// Uses Astro Clock knowledge base for detailed recommendations
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Calendar, Clock, Star, AlertTriangle, CheckCircle, XCircle, BookOpen, Info, Sun, Moon, Zap } from "lucide-react";
import { getActionTimingAdvice, findSimilarActions } from "@/lib/astroClockActionTimingAdvisor";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
  success:  "rgba(34,197,94,0.60)",
  danger:   "rgba(239,68,68,0.60)",
  warning:  "rgba(251,191,36,0.60)"
};

const QUICK_ACTIONS = [
  { en: "Business", ml: "വ്യാപാരം" },
  { en: "Marriage", ml: "വിവാഹം" },
  { en: "Love", ml: "പ്രണയം" },
  { en: "Travel", ml: "യാത്ര" },
  { en: "Job", ml: "ജോലി" },
  { en: "Trade", ml: "വ്യാപാര ഇടപാട്" },
  { en: "Spiritual Work", ml: "ആദ്ധ്യാത്മിക പ്രവർത്തനങ്ങൾ" },
  { en: "Talisman", ml: "തകിതം" },
  { en: "Wealth", ml: "സമ്പത്ത്" },
  { en: "Healing", ml: "ചികിത്സ" }
];

export default function ProfessionalActionTimingAdvisor() {
  const { isMalayalam } = useAstroClockLanguage();
  const [action, setAction] = useState("");
  const [results, setResults] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!action.trim()) return;
    
    setLoading(true);
    setTimeout(() => {
      const advice = getActionTimingAdvice(action, isMalayalam ? 'ml' : 'en');
      setResults(advice);
      setLoading(false);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setAction(suggestion.category);
    const advice = getActionTimingAdvice(suggestion.category, isMalayalam ? 'ml' : 'en');
    setResults(advice);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setAction(value);
    if (value.length >= 2) {
      const sims = findSimilarActions(value, isMalayalam);
      setSuggestions(sims);
    } else {
      setSuggestions([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-6"
        style={{
          background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
          borderColor: G.borderHi,
          boxShadow: `0 0 40px ${G.glow}`
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Search className="w-7 h-7" style={{ color: G.text }} />
            <div>
              <h2 className="font-inter text-2xl font-bold uppercase tracking-widest" style={{ color: G.text }}>
                {isMalayalam ? "പ്രൊഫഷണൽ പ്രവൃത്തി സമയ ഉപദേശം" : "Professional Action Timing Advisor"}
              </h2>
              <p className="font-inter text-xs" style={{ color: G.dim }}>
                {isMalayalam ? "12 വിഭാഗങ്ങളിൽ വിശദമായ സമയ വിശകലനം" : "Comprehensive timing analysis for 12 action categories"}
              </p>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={action}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={isMalayalam 
                ? "പ്രവൃത്തി നൽകുക (വിവാഹം, യാത്ര, വ്യാപാരം...)" 
                : "Enter action (Marriage, Travel, Business...)"}
              className="w-full px-5 py-4 rounded-xl border focus:outline-none focus:ring-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: G.border,
                color: "#fff",
                fontSize: "15px"
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !action.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
              style={{
                background: G.bgHi,
                color: G.text,
                border: `1px solid ${G.border}`
              }}
            >
              {loading ? (isMalayalam ? "ലോഡ്..." : "Loading...") : (isMalayalam ? "തിരയുക" : "Search")}
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="mt-3 p-4 rounded-xl border" style={{ background: G.bg, borderColor: G.faint }}>
              <p className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.dim }}>
                {isMalayalam ? "നിർദ്ദേശങ്ങൾ" : "Suggestions"}
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all hover:opacity-80"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      color: G.text,
                      border: `1px solid ${G.faint}`
                    }}
                  >
                    {suggestion.category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((qa, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAction(isMalayalam ? qa.ml : qa.en);
                const advice = getActionTimingAdvice(isMalayalam ? qa.ml : qa.en, isMalayalam ? 'ml' : 'en');
                setResults(advice);
              }}
              className="px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all hover:opacity-80"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.60)",
                border: `1px solid rgba(255,255,255,0.15)`
              }}
            >
              {isMalayalam ? qa.ml : qa.en}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {results.found ? (
            <>
              {/* Action Header */}
              <div className="p-5 rounded-xl border" style={{ background: G.bgHi, borderColor: G.border }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-inter text-xl font-bold" style={{ color: G.text }}>
                    {results.action}
                  </h3>
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.40)" }}>
                    {results.totalRulesFound} {isMalayalam ? "നിയമങ്ങൾ" : "Rules"} Found
                  </span>
                </div>
                <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.60)" }}>
                  {isMalayalam ? "വിഭാഗം" : "Category"}: {results.category}
                </p>
              </div>

              {/* 1. Current Status */}
              <TimingSection
                icon={Info}
                title={isMalayalam ? "നിലവിലെ നിലവാരം" : "Current Status"}
                color={G.text}
              >
                <CurrentStatusCard results={results} isMalayalam={isMalayalam} />
              </TimingSection>

              {/* 2. Best Day */}
              <TimingSection
                icon={Calendar}
                title={isMalayalam ? "ഉത്തമ ദിവസം" : "Best Day"}
                color={G.success}
              >
                <DayCards days={results.bestDays || []} isMalayalam={isMalayalam} />
              </TimingSection>

              {/* 3. Best Planetary Hour */}
              <TimingSection
                icon={Clock}
                title={isMalayalam ? "ഉത്തമ ഗ്രഹ മണിക്കൂർ" : "Best Planetary Hour"}
                color={G.success}
              >
                <HourCards hours={results.bestHours || []} isMalayalam={isMalayalam} />
              </TimingSection>

              {/* 4. Best Lunar Mansion */}
              <TimingSection
                icon={Star}
                title={isMalayalam ? "ഉത്തമ നക്ഷത്രം (മൻസിൽ)" : "Best Lunar Mansion"}
                color={G.success}
              >
                <MansionCards mansions={results.suitableMansions || []} isMalayalam={isMalayalam} isBest />
              </TimingSection>

              {/* 5. Worst Lunar Mansion */}
              <TimingSection
                icon={XCircle}
                title={isMalayalam ? "അനുചിത നക്ഷത്രം (മൻസിൽ)" : "Worst Lunar Mansion"}
                color={G.danger}
              >
                <MansionCards mansions={results.worstMansions || []} isMalayalam={isMalayalam} isBest={false} />
              </TimingSection>

              {/* 6. Suitable Planets */}
              <TimingSection
                icon={Sun}
                title={isMalayalam ? "ഉചിത ഗ്രഹങ്ങൾ" : "Suitable Planets"}
                color={G.success}
              >
                <PlanetCards planets={results.suitablePlanets || []} isMalayalam={isMalayalam} isSuitable />
              </TimingSection>

              {/* 7. Enemy Planets */}
              <TimingSection
                icon={AlertTriangle}
                title={isMalayalam ? "ശത്രു ഗ്രഹങ്ങൾ" : "Enemy Planets"}
                color={G.danger}
              >
                <PlanetCards planets={results.enemyPlanets || []} isMalayalam={isMalayalam} isSuitable={false} />
              </TimingSection>

              {/* 8. Current Recommendation */}
              <TimingSection
                icon={CheckCircle}
                title={isMalayalam ? "നിലവിലെ നിർദ്ദേശം" : "Current Recommendation"}
                color={G.success}
              >
                <RecommendationCard results={results} isMalayalam={isMalayalam} />
              </TimingSection>

              {/* 9. Next Best Time */}
              <TimingSection
                icon={Clock}
                title={isMalayalam ? "അടുത്ത ഉത്തമ സമയം" : "Next Best Time"}
                color={G.warning}
              >
                <NextBestTimeCard results={results} isMalayalam={isMalayalam} />
              </TimingSection>

              {/* 10. Avoid Times */}
              <TimingSection
                icon={AlertTriangle}
                title={isMalayalam ? "ഒഴിവാക്കേണ്ട സമയങ്ങൾ" : "Avoid Times"}
                color={G.danger}
              >
                <AvoidTimesCard results={results} isMalayalam={isMalayalam} />
              </TimingSection>

              {/* 11-12. Source Book & Page Reference */}
              {results.sources && results.sources.length > 0 && (
                <div className="p-5 rounded-xl border" style={{ background: "rgba(255,255,255,0.02)", borderColor: G.faint }}>
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-5 h-5" style={{ color: G.dim }} />
                    <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                      {isMalayalam ? "ഗ്രന്ഥങ്ങളും താളുകളും" : "Sources & Page References"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {results.sources.map((source, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg" style={{ background: G.bg }}>
                        <div>
                          <span className="font-inter text-sm font-bold text-white/80">{source.book}</span>
                          {source.author && (
                            <p className="font-inter text-[10px] text-white/50 mt-0.5">
                              {isMalayalam ? "രചയിതാവ്" : "Author"}: {source.author}
                            </p>
                          )}
                        </div>
                        <span className="font-inter text-xs font-bold px-3 py-1 rounded" style={{ background: G.bgHi, color: G.text }}>
                          {isMalayalam ? "പുറം" : "Page"} {source.page}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {results.benefits && results.benefits.length > 0 && (
                <TimingSection
                  icon={CheckCircle}
                  title={isMalayalam ? "ഗുണങ്ങൾ" : "Benefits"}
                  color={G.success}
                >
                  <ul className="space-y-2">
                    {results.benefits.map((benefit, idx) => (
                      <li key={idx} className="font-inter text-sm text-white/70 flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: G.success }} />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </TimingSection>
              )}

              {/* Warnings */}
              {results.warnings && results.warnings.length > 0 && (
                <TimingSection
                  icon={AlertTriangle}
                  title={isMalayalam ? "മുന്നറിയിപ്പുകൾ" : "Warnings"}
                  color={G.danger}
                >
                  <ul className="space-y-2">
                    {results.warnings.map((warning, idx) => (
                      <li key={idx} className="font-inter text-sm text-white/70 flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: G.danger }} />
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </TimingSection>
              )}
            </>
          ) : (
            <NoResults message={results.message} suggestions={results.suggestions} isMalayalam={isMalayalam} onSuggestionClick={handleSuggestionClick} />
          )}
        </motion.div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function TimingSection({ icon: Icon, title, color, children }) {
  return (
    <div className="p-5 rounded-xl border" style={{ background: "rgba(255,255,255,0.02)", borderColor: color }}>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5" style={{ color }} />
        <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

function CurrentStatusCard({ results, isMalayalam }) {
  const today = new Date();
  const dayNames = {
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    ml: ["ഞായർ", "തിങ്കൾ", "ചൊവ്വ", "ബുധൻ", "വ്യാഴം", "വെള്ളി", "ശനി"]
  };
  
  const currentDay = dayNames[isMalayalam ? 'ml' : 'en'][today.getDay()];
  const isBestDay = results.bestDays?.some(d => d.day === currentDay);
  
  return (
    <div className={`p-4 rounded-lg border ${isBestDay ? 'bg-green-900/20 border-green-500/40' : 'bg-yellow-900/20 border-yellow-500/40'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-inter text-xs text-white/60 mb-1">
            {isMalayalam ? "ഇന്ന്" : "Today"}
          </p>
          <p className="font-inter text-lg font-bold text-white">{currentDay}</p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${isBestDay ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
          <p className={`font-inter text-xs font-bold ${isBestDay ? 'text-green-400' : 'text-yellow-400'}`}>
            {isBestDay 
              ? (isMalayalam ? "ഉത്തമം" : "Favorable")
              : (isMalayalam ? "ശരാശരി" : "Neutral")}
          </p>
        </div>
      </div>
    </div>
  );
}

function DayCards({ days, isMalayalam }) {
  if (!days || days.length === 0) {
    return <p className="font-inter text-sm text-white/50">{isMalayalam ? "വിവരങ്ങൾ ലഭ്യമല്ല" : "No data available"}</p>;
  }
  
  return (
    <div className="grid grid-cols-1 gap-3">
      {days.map((day, idx) => (
        <div key={idx} className="p-4 rounded-lg border flex items-center justify-between" style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.30)" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{day.symbol}</span>
            <div>
              <p className="font-inter text-base font-bold" style={{ color: "#22c55e" }}>
                {day.day}
              </p>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.50)" }}>
                {isMalayalam ? "ഗ്രഹ നാഥൻ" : "Planet Ruler"}: {day.planet}
              </p>
            </div>
          </div>
          {day.reason && (
            <p className="font-inter text-xs text-white/60 max-w-[200px]">{day.reason}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function HourCards({ hours, isMalayalam }) {
  if (!hours || hours.length === 0) {
    return <p className="font-inter text-sm text-white/50">{isMalayalam ? "വിവരങ്ങൾ ലഭ്യമല്ല" : "No data available"}</p>;
  }
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {hours.map((hour, idx) => (
        <div key={idx} className="p-3 rounded-lg border text-center" style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.30)" }}>
          <p className="text-2xl mb-2">{hour.symbol}</p>
          <p className="font-inter text-sm font-bold" style={{ color: "#22c55e" }}>{hour.planet}</p>
          <p className="font-inter text-[10px] text-white/50 mt-1">{hour.day}</p>
        </div>
      ))}
    </div>
  );
}

function MansionCards({ mansions, isMalayalam, isBest }) {
  if (!mansions || mansions.length === 0) {
    return <p className="font-inter text-sm text-white/50">{isMalayalam ? "വിവരങ്ങൾ ലഭ്യമല്ല" : "No data available"}</p>;
  }
  
  const color = isBest ? "#22c55e" : "#ef4444";
  const bg = isBest ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)";
  const border = isBest ? "rgba(34,197,94,0.30)" : "rgba(239,68,68,0.30)";
  
  return (
    <div className="grid grid-cols-2 gap-3">
      {mansions.map((mansion, idx) => (
        <div key={idx} className="p-4 rounded-lg border" style={{ background: bg, borderColor: border }}>
          <p className="font-amiri text-lg font-bold mb-2 text-center" style={{ color }} dir="rtl">
            {mansion.arabic}
          </p>
          <p className="font-inter text-sm font-bold text-white text-center">{mansion.name}</p>
          <p className="font-inter text-[10px] text-white/50 text-center mt-1">
            {isMalayalam ? "സ്വഭാവം" : "Nature"}: {mansion.nature}
          </p>
        </div>
      ))}
    </div>
  );
}

function PlanetCards({ planets, isMalayalam, isSuitable }) {
  if (!planets || planets.length === 0) {
    return <p className="font-inter text-sm text-white/50">{isMalayalam ? "വിവരങ്ങൾ ലഭ്യമല്ല" : "No data available"}</p>;
  }
  
  const color = isSuitable ? "#22c55e" : "#ef4444";
  const bg = isSuitable ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)";
  const border = isSuitable ? "rgba(34,197,94,0.30)" : "rgba(239,68,68,0.30)";
  
  return (
    <div className="grid grid-cols-3 gap-3">
      {planets.map((planet, idx) => (
        <div key={idx} className="p-3 rounded-lg border text-center" style={{ background: bg, borderColor: border }}>
          <p className="text-2xl mb-1">{planet.symbol}</p>
          <p className="font-inter text-xs font-bold" style={{ color }}>{planet.name}</p>
        </div>
      ))}
    </div>
  );
}

function RecommendationCard({ results, isMalayalam }) {
  const isFavorable = results.bestDays?.some(d => {
    const today = new Date().getDay();
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return dayNames[today] === d.day;
  });
  
  return (
    <div className={`p-5 rounded-lg border ${isFavorable ? 'bg-green-900/20 border-green-500/40' : 'bg-yellow-900/20 border-yellow-500/40'}`}>
      <div className="flex items-start gap-3">
        {isFavorable ? (
          <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
        ) : (
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: "#fbbf24" }} />
        )}
        <div>
          <p className={`font-inter text-base font-bold mb-2 ${isFavorable ? 'text-green-400' : 'text-yellow-400'}`}>
            {isFavorable
              ? (isMalayalam ? "ഇന്ന് ഈ പ്രവൃത്തിക്ക് അനുയോജ്യമാണ്" : "Today is favorable for this action")
              : (isMalayalam ? "ഇന്ന് ശരാശരി ദിവസമാണ്" : "Today is neutral for this action")}
          </p>
          <p className="font-inter text-sm text-white/70">
            {isFavorable
              ? (isMalayalam ? "ഈ പ്രവൃത്തി ചെയ്യാൻ ഉത്തമ സമയമാണ് ഇപ്പോൾ" : "Current planetary hour is suitable for this action")
              : (isMalayalam ? "മികച്ച ദിവസത്തിനായി കാത്തിരിക്കുക" : "Wait for a more favorable day")}
          </p>
        </div>
      </div>
    </div>
  );
}

function NextBestTimeCard({ results, isMalayalam }) {
  const nextBestDay = results.bestDays?.[0];
  
  if (!nextBestDay) {
    return <p className="font-inter text-sm text-white/50">{isMalayalam ? "വിവരങ്ങൾ ലഭ്യമല്ല" : "No data available"}</p>;
  }
  
  return (
    <div className="p-4 rounded-lg border" style={{ background: "rgba(251,191,36,0.05)", borderColor: "rgba(251,191,36,0.30)" }}>
      <div className="flex items-center gap-3">
        <Clock className="w-5 h-5" style={{ color: G.warning }} />
        <div>
          <p className="font-inter text-sm font-bold" style={{ color: G.warning }}>
            {nextBestDay.day} {isMalayalam ? "ആഴ്ച" : "of the week"}
          </p>
          <p className="font-inter text-xs text-white/60 mt-1">
            {isMalayalam ? "അടുത്ത ഉത്തമ സമയം" : "Next best time for this action"}
          </p>
        </div>
      </div>
    </div>
  );
}

function AvoidTimesCard({ results, isMalayalam }) {
  const worstDays = results.worstDays || [];
  
  if (worstDays.length === 0) {
    return <p className="font-inter text-sm text-white/50">{isMalayalam ? "ഒഴിവാക്കേണ്ട ദിവസങ്ങൾ ഇല്ല" : "No days to avoid"}</p>;
  }
  
  return (
    <div className="space-y-2">
      {worstDays.map((day, idx) => (
        <div key={idx} className="p-3 rounded-lg border flex items-center gap-3" style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.30)" }}>
          <AlertTriangle className="w-4 h-4" style={{ color: G.danger }} />
          <span className="font-inter text-sm text-white/70">{day.day} — {day.reason}</span>
        </div>
      ))}
    </div>
  );
}

function NoResults({ message, suggestions, isMalayalam, onSuggestionClick }) {
  return (
    <div className="p-8 rounded-xl border text-center" style={{ background: "rgba(255,255,255,0.02)", borderColor: G.faint }}>
      <Info className="w-10 h-10 mx-auto mb-4" style={{ color: G.dim }} />
      <p className="font-inter text-base mb-6" style={{ color: "rgba(255,255,255,0.70)" }}>{message}</p>
      {suggestions && suggestions.suggestions && (
        <div>
          <p className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.dim }}>
            {isMalayalam ? "നിർദ്ദേശങ്ങൾ" : "Suggestions"}
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick(suggestion)}
                className="px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition-all hover:opacity-80"
                style={{ background: G.bg, color: G.text, border: `1px solid ${G.faint}` }}
              >
                {suggestion.category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}