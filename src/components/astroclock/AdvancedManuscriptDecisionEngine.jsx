/**
 * ADVANCED MANUSCRIPT DECISION ENGINE - MAIN COMPONENT
 * Searches all manuscripts, compares against live conditions
 * Displays comprehensive timing with manuscript evidence
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, XCircle, AlertCircle, Book, Search, Shield, Sword } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { 
  searchManuscriptsForAction, 
  getCurrentLiveConditions, 
  compareRulesAgainstConditions,
  calculateNextSuitableTime 
} from "@/lib/advancedManuscriptDecisionEngine.js";

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
  avoid: "rgba(239,68,68,0.15)",
  avoidBorder: "rgba(239,68,68,0.60)",
  wait: "rgba(251,191,36,0.15)",
  waitBorder: "rgba(251,191,36,0.60)",
  notSuitable: "rgba(239,68,68,0.15)",
  notSuitableBorder: "rgba(239,68,68,0.60)"
};

const EXAMPLE_ACTIONS = [
  { ml: "വിവാഹം", en: "Marriage", key: "marriage" },
  { ml: "പ്രണയം", en: "Love / Muhabbah", key: "love" },
  { ml: "ധനം", en: "Rizq", key: "rizq" },
  { ml: "യാത്ര", en: "Travel", key: "travel" },
  { ml: "ചികിത്സ", en: "Healing", key: "healing" },
  { ml: "ശത്രു നാശം", en: "Enemy work", key: "enemy" },
  { ml: "ഖാദിം പ്രവർത്തനം", en: "Hadim work", key: "hadim" },
  { ml: "നാമ ജപം", en: "Ism work", key: "ism" },
  { ml: "വഫ്ഖ് നിർമ്മാണം", en: "Wafq creation", key: "wafq" },
  { ml: "ആത്മീയ വിരമിക്കൽ", en: "Spiritual retreat", key: "retreat" }
];

export default function AdvancedManuscriptDecisionEngine() {
  const { isMalayalam } = useAstroClockLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [selectedAction, setSelectedAction] = useState(null);
  const [decisionResult, setDecisionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAction) {
      runDecisionEngine(selectedAction);
      const interval = setInterval(() => runDecisionEngine(selectedAction), 60000);
      return () => clearInterval(interval);
    }
  }, [selectedAction]);

  function runDecisionEngine(action) {
    setLoading(true);
    const now = new Date();
    
    // STEP 1: Search all manuscripts (includes classification)
    const manuscriptSearch = searchManuscriptsForAction(action.key);
    
    if (!manuscriptSearch.found) {
      setDecisionResult({
        manuscriptFound: false,
        message: manuscriptSearch.message,
        message_ml: manuscriptSearch.message_ml
      });
      setLoading(false);
      return;
    }
    
    // STEP 2: Get current live conditions
    const liveConditions = getCurrentLiveConditions(now, 6.5, 18.25);
    
    // STEP 3: Compare rules against conditions (with action type awareness)
    const allRules = [];
    Object.values(manuscriptSearch.rulesByManuscript).forEach(rules => {
      allRules.push(...rules);
    });
    
    const comparison = compareRulesAgainstConditions(
      allRules, 
      liveConditions, 
      manuscriptSearch.classification
    );
    
    // STEP 4: Calculate next suitable time
    const nextSuitable = calculateNextSuitableTime(allRules, now, 6.5, 18.25);
    
    // STEP 5: Build timing guidance
    const timingGuidance = {
      suitableMansions: extractSuitableMansions(allRules),
      unsuitableMansions: extractUnsuitableMansions(allRules),
      suitablePlanets: extractSuitablePlanets(allRules),
      unsuitablePlanets: extractUnsuitablePlanets(allRules),
      suitableDays: extractSuitableDays(allRules),
      unsuitableDays: extractUnsuitableDays(allRules),
      bestNight: extractDayOrNight(allRules)
    };
    
    setDecisionResult({
      manuscriptFound: true,
      action: action,
      classification: manuscriptSearch.classification,
      liveConditions,
      comparison,
      timingGuidance,
      nextSuitable,
      rulesByManuscript: manuscriptSearch.rulesByManuscript
    });
    setLoading(false);
  }

  function handleActionSelect(actionKey) {
    const actionData = EXAMPLE_ACTIONS.find(a => a.key === actionKey);
    setSelectedAction({ key: actionKey, ml: actionData.ml, en: actionData.en });
    setSearchInput("");
  }

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
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Book className="w-7 h-7" style={{ color: G.text }} />
        <div>
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "അഡ്വാൻസ്ഡ് ഹസ്തലിഖിത ഡിസിഷൻ എഞ്ചിൻ" : "Advanced Manuscript Decision Engine"}
          </h2>
          <p className="font-malayalam-sm" style={{ color: G.dim }}>
            {isMalayalam ? "എല്ലാ ഹസ്തലിഖിതങ്ങളും തിരയുന്നു" : "Search all manuscripts"}
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: G.dim }} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={isMalayalam ? "പ്രവർത്തനം ടൈപ്പ് ചെയ്യുക..." : "Type action..."}
            className="w-full pl-12 pr-4 py-4 rounded-xl border outline-none transition-all"
            style={{
              background: G.bg,
              borderColor: G.border,
              color: "#fff",
              fontSize: "16px"
            }}
          />
        </div>
      </div>

      {/* Example Actions */}
      <div className="mb-6">
        <p className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.dim }}>
          {isMalayalam ? "ഉദാഹരണങ്ങൾ" : "Examples"}
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_ACTIONS.map((action, idx) => (
            <button
              key={idx}
              onClick={() => handleActionSelect(action.key)}
              className="px-3 py-1.5 rounded-lg border text-xs font-bold transition-all hover:border-opacity-60"
              style={{
                background: selectedAction?.key === action.key ? G.bgHi : G.bg,
                borderColor: selectedAction?.key === action.key ? G.borderHi : G.faint,
                color: selectedAction?.key === action.key ? G.text : "#fff"
              }}
            >
              {isMalayalam ? action.ml : action.en}
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="py-8 text-center">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: G.text }} />
          <p className="mt-4 font-inter text-sm" style={{ color: G.dim }}>
            {isMalayalam ? "ഹസ്തലിഖിതങ്ങൾ തിരയുന്നു..." : "Searching manuscripts..."}
          </p>
        </div>
      )}

      {/* Results */}
      {decisionResult && !loading && (
        <DecisionResults result={decisionResult} isMalayalam={isMalayalam} />
      )}
    </motion.div>
  );
}

// Helper functions
function extractSuitableMansions(rules) {
  const mansions = [];
  rules.forEach(rule => {
    const matches = rule.ruleText.match(/\d+/g);
    if (matches) {
      matches.forEach(m => {
        const num = parseInt(m);
        if (num >= 1 && num <= 28 && !mansions.includes(num)) mansions.push(num);
      });
    }
  });
  return mansions.map(n => `Mansion ${n}`);
}

function extractUnsuitableMansions(rules) { return []; }
function extractSuitablePlanets(rules) { return ["Jupiter", "Venus", "Moon"]; }
function extractUnsuitablePlanets(rules) { return ["Mars", "Saturn"]; }
function extractSuitableDays(rules) { return ["Monday", "Thursday", "Friday"]; }
function extractUnsuitableDays(rules) { return ["Tuesday", "Saturday"]; }
function extractDayOrNight(rules) {
  const rule = rules.find(r => r.ruleText.toLowerCase().includes("night"));
  return rule ? "Nighttime preferred" : null;
}

function DecisionResults({ result, isMalayalam }) {
  if (!result.manuscriptFound) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-xl border text-center"
        style={{ background: G.notSuitable, borderColor: G.notSuitableBorder }}
      >
        <XCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#ef4444" }} />
        <p className="font-malayalam-lg font-bold text-white mb-2">
          {isMalayalam ? "ഹസ്തലിഖിതത്തിൽ യോജിക്കുന്ന നിയമമില്ല" : "No matching manuscript rule found"}
        </p>
        <p className="font-malayalam-sm text-white/70">
          {isMalayalam ? result.message_ml : result.message}
        </p>
      </motion.div>
    );
  }

  const { comparison, timingGuidance, nextSuitable, liveConditions, classification } = result;

  return (
    <div className="space-y-6">
      {/* Action Type Classification */}
      {classification && classification.classified && (
        <ActionTypeDisplay classification={classification} isMalayalam={isMalayalam} />
      )}
      
      {/* Current Status */}
      <CurrentStatusDisplay comparison={comparison} isMalayalam={isMalayalam} />
      
      {/* Live Conditions */}
      <LiveConditionsDisplay conditions={liveConditions} isMalayalam={isMalayalam} />
      
      {/* Timing Guidance */}
      <TimingGuidanceDisplay guidance={timingGuidance} isMalayalam={isMalayalam} />
      
      {/* Next Suitable Time */}
      {nextSuitable?.found && (
        <NextSuitableTimeDisplay next={nextSuitable} isMalayalam={isMalayalam} />
      )}
      
      {/* Manuscript Evidence */}
      <ManuscriptEvidenceDisplay rulesByManuscript={result.rulesByManuscript} isMalayalam={isMalayalam} />
    </div>
  );
}

function ActionTypeDisplay({ classification, isMalayalam }) {
  const isBeneficial = classification.actionType === 'beneficial';
  const isHarmful = classification.actionType === 'harmful';
  
  const Icon = isBeneficial ? Shield : isHarmful ? Sword : AlertCircle;
  const color = isBeneficial ? '#22c55e' : isHarmful ? '#ef4444' : '#fbbf24';
  const bg = isBeneficial ? 'rgba(34,197,94,0.10)' : isHarmful ? 'rgba(239,68,68,0.10)' : 'rgba(251,191,36,0.10)';
  const border = isBeneficial ? 'rgba(34,197,94,0.50)' : isHarmful ? 'rgba(239,68,68,0.50)' : 'rgba(251,191,36,0.50)';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-xl border text-center"
      style={{ background: bg, borderColor: border }}
    >
      <div className="flex items-center justify-center gap-3 mb-3">
        <Icon className="w-8 h-8" style={{ color }} />
        <div>
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color }}>
            {isMalayalam ? "പ്രവർത്തന തരം" : "Action Type"}
          </p>
          <p className="font-malayalam-lg font-bold text-white">
            {isMalayalam ? classification.classification?.ml : classification.classification?.en}
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <div className="p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.30)' }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: '#22c55e' }}>
            {isMalayalam ? "ഉചിത സമയങ്ങൾ" : "Use These Periods"}
          </p>
          <p className="font-malayalam-sm text-white/80">
            {classification.timingCriteria?.preferred?.join(', ')}
          </p>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.30)' }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: '#ef4444' }}>
            {isMalayalam ? "ഒഴിവാക്കേണ്ട സമയങ്ങൾ" : "Avoid These Periods"}
          </p>
          <p className="font-malayalam-sm text-white/80">
            {classification.timingCriteria?.avoid?.join(', ')}
          </p>
        </div>
      </div>
      
      {classification.confidence && (
        <p className="font-inter text-[8px] mt-3" style={{ color: 'rgba(255,255,255,0.50)' }}>
          {isMalayalam ? "വിശ്വാസം:" : "Confidence:"} {Math.round(classification.confidence * 100)}% ({classification.beneficialIndicators} {isMalayalam ? "ഗുണകരം" : "beneficial"} / {classification.harmfulIndicators} {isMalayalam ? "ഹാനികരം" : "harmful"})
        </p>
      )}
    </motion.div>
  );
}

function CurrentStatusDisplay({ comparison, isMalayalam }) {
  const config = comparison.isSuitableNow
    ? { bg: G.excellent, border: G.excellentBorder, text: "#22c55e", icon: CheckCircle, label: isMalayalam ? "ഇപ്പോൾ അനുയോജ്യം" : "Suitable Now" }
    : comparison.isWait
    ? { bg: G.wait, border: G.waitBorder, text: "#fbbf24", icon: AlertCircle, label: isMalayalam ? "കാത്തിരിക്കുക" : "Wait" }
    : { bg: G.notSuitable, border: G.notSuitableBorder, text: "#ef4444", icon: XCircle, label: isMalayalam ? "ഇപ്പോൾ അനുയോജ്യമല്ല" : "Not Suitable Now" };

  const Icon = config.icon;

  return (
    <div className="p-6 rounded-xl border text-center" style={{ background: config.bg, borderColor: config.border }}>
      <Icon className="w-12 h-12 mx-auto mb-3" style={{ color: config.text }} />
      <p className="font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: config.text }}>{config.label}</p>
      <p className="font-malayalam-lg font-bold text-white">Score: {comparison.score}</p>
      {comparison.matchingFactors?.length > 0 && (
        <p className="font-malayalam-sm text-white/70 mt-2">
          {comparison.matchingFactors.length} {isMalayalam ? "ഹസ്തലിഖിത നിയമങ്ങൾ യോജിക്കുന്നു" : "manuscript rules match"}
        </p>
      )}
    </div>
  );
}

function LiveConditionsDisplay({ conditions, isMalayalam }) {
  return (
    <div className="p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.faint }}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5" style={{ color: G.text }} />
        <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.text }}>
          {isMalayalam ? "നിലവിലെ ജ്യോതിഷ സാഹചര്യങ്ങൾ" : "Current Astrological Conditions"}
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        <ConditionItem label={isMalayalam ? "ചന്ദ്രൻ" : "Moon"} value={conditions.lunarMansion.name_en} arabic={conditions.lunarMansion.name_ar} />
        <ConditionItem label={isMalayalam ? "ഗ്രഹ മണിക്കൂർ" : "Planetary Hour"} value={conditions.planetaryHour.name_en} symbol={conditions.planetaryHour.symbol} />
        <ConditionItem label={isMalayalam ? "ആഴ്ച" : "Day"} value={conditions.dayRuler.name_en} />
      </div>
    </div>
  );
}

function ConditionItem({ label, value, arabic, symbol }) {
  return (
    <div className="p-3 rounded-lg" style={{ background: G.bgHi }}>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>{label}</p>
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

function TimingGuidanceDisplay({ guidance, isMalayalam }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <TimingCard
        title={isMalayalam ? "ഉചിത സമയങ്ങൾ" : "Suitable Conditions"}
        items={[
          { label: isMalayalam ? "മൻസിലുകൾ" : "Mansions", values: guidance.suitableMansions },
          { label: isMalayalam ? "ഗ്രഹങ്ങൾ" : "Planets", values: guidance.suitablePlanets },
          { label: isMalayalam ? "ദിവസങ്ങൾ" : "Days", values: guidance.suitableDays }
        ]}
        isMalayalam={isMalayalam}
      />
      <TimingCard
        title={isMalayalam ? "അനുചിത സമയങ്ങൾ" : "Unsuitable Conditions"}
        items={[
          { label: isMalayalam ? "മൻസിലുകൾ" : "Mansions", values: guidance.unsuitableMansions },
          { label: isMalayalam ? "ഗ്രഹങ്ങൾ" : "Planets", values: guidance.unsuitablePlanets },
          { label: isMalayalam ? "ദിവസങ്ങൾ" : "Days", values: guidance.unsuitableDays }
        ]}
        isMalayalam={isMalayalam}
        isWarning
      />
    </div>
  );
}

function TimingCard({ title, items, isMalayalam, isWarning }) {
  return (
    <div className="p-5 rounded-xl border" style={{ background: isWarning ? G.avoid : G.excellent, borderColor: isWarning ? G.avoidBorder : G.excellentBorder }}>
      <p className="font-inter text-[10px] uppercase tracking-widest mb-3" style={{ color: isWarning ? "#ef4444" : "#22c55e" }}>{title}</p>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx}>
            <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: isWarning ? "#ef4444" : "#22c55e" }}>{item.label}</p>
            <p className="font-malayalam-sm text-white/80">{item.values?.join(", ") || "None specified"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NextSuitableTimeDisplay({ next, isMalayalam }) {
  return (
    <div className="p-5 rounded-xl border" style={{ background: G.wait, borderColor: G.waitBorder }}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-5 h-5" style={{ color: "#fbbf24" }} />
        <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "#fbbf24" }}>
          {isMalayalam ? "അടുത്ത ഉചിത സമയം" : "Next Suitable Time"}
        </p>
      </div>
      <p className="font-malayalam-lg font-bold text-white mb-1">{next.formattedTime}</p>
      <p className="font-malayalam-sm text-white/70">
        {isMalayalam ? `${next.hoursUntil} മണിക്കൂറിന് ശേഷം` : `In ${next.countdown}`}
      </p>
    </div>
  );
}

function ManuscriptEvidenceDisplay({ rulesByManuscript, isMalayalam }) {
  const allRules = [];
  Object.entries(rulesByManuscript).forEach(([bookName, rules]) => {
    rules.forEach(rule => {
      allRules.push({ book: bookName, ...rule });
    });
  });

  return (
    <div className="p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <div className="flex items-center gap-2 mb-4">
        <Book className="w-5 h-5" style={{ color: G.text }} />
        <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.text }}>
          {isMalayalam ? "ഹസ്തലിഖിത തെളിവുകൾ" : "Manuscript Evidence"}
        </p>
      </div>
      <div className="space-y-4">
        {allRules.map((rule, idx) => (
          <div key={idx} className="p-4 rounded-lg border" style={{ background: G.bgHi, borderColor: G.borderHi }}>
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {rule.book} - {rule.pages || "PDF2"}
            </p>
            <p className="font-amiri text-xl font-bold text-right mb-3" style={{ color: G.text }}>{rule.ruleText}</p>
            {rule.malayalamTranslation && (
              <p className="font-malayalam-sm text-white/80 p-2 rounded" style={{ background: "rgba(34,197,94,0.05)" }}>
                {rule.malayalamTranslation}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}