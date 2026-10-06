// ═══════════════════════════════════════════════════════════════
// KARMA TIMING ADVISOR — PDF KNOWLEDGE BASE RULES ONLY
// Evaluates current moment for specific action categories
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, XCircle, AlertCircle, Book, ChevronDown, ChevronUp } from "lucide-react";
import { calculateMoonPosition } from "@/lib/astroClockMoonPosition.js";
import { getCurrentPlanetaryHour, DAY_INFO } from "@/lib/astroClockLiveEngine.js";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { getRulesForTopic, getAllTopics } from "@/lib/astroClockKnowledgeBaseFramework.js";

const ACTION_CATEGORIES = [
  { id: "marriage", name: "Marriage", arabic: "النكاح", icon: "💍" },
  { id: "love", name: "Love / Muhabbah", arabic: "المحبة", icon: "💕" },
  { id: "separation", name: "Separation / Tafriq", arabic: "التفريق", icon: "💔" },
  { id: "rizq", name: "Rizq", arabic: "الرزق", icon: "💰" },
  { id: "healing", name: "Healing", arabic: "الشفاء", icon: "🌿" },
  { id: "spiritual", name: "Spiritual Work", arabic: "العمل الروحي", icon: "📿" },
  { id: "vefk", name: "Vefk Creation", arabic: "وفق", icon: "📜" },
  { id: "talisman", name: "Talisman Creation", arabic: "طلسم", icon: "🔮" },
  { id: "hadim", name: "Hadim Work", arabic: "خادم", icon: "👁" },
  { id: "ism", name: "Ism Work", arabic: "اسم", icon: "✍" },
  { id: "travel", name: "Travel", arabic: "السفر", icon: "✈" },
  { id: "business", name: "Business", arabic: "التجارة", icon: "💼" },
  { id: "construction", name: "Construction", arabic: "البناء", icon: "🏗" },
  { id: "purchase", name: "Purchase", arabic: "الشراء", icon: "🛒" },
  { id: "conflict", name: "Conflict", arabic: "النزاع", icon: "⚔" }
];

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  suitable: "rgba(34,197,94,0.15)",
  suitableBorder: "rgba(34,197,94,0.60)",
  notSuitable: "rgba(239,68,68,0.15)",
  notSuitableBorder: "rgba(239,68,68,0.60)",
  wait: "rgba(251,191,36,0.15)",
  waitBorder: "rgba(251,191,36,0.60)"
};

export default function KarmaTimingAdvisor() {
  const { isMalayalam } = useAstroClockLanguage();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedRule, setExpandedRule] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      evaluateCategory(selectedCategory);
      const interval = setInterval(() => evaluateCategory(selectedCategory), 60000);
      return () => clearInterval(interval);
    }
  }, [selectedCategory]);

  function evaluateCategory(categoryId) {
    setLoading(true);
    const now = new Date();
    const moonPos = calculateMoonPosition(now);
    const planetHour = getCurrentPlanetaryHour(now, 6.5, 18.25);
    const dayIndex = now.getDay();
    const dayInfo = DAY_INFO[dayIndex];

    const rules = getRulesForTopic(categoryId);
    const result = evaluateRules(rules, moonPos, planetHour, dayInfo);

    setEvaluation({
      category: categoryId,
      timestamp: now,
      result,
      moonPos,
      planetHour,
      dayInfo,
      rules
    });
    setLoading(false);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border p-6 relative overflow-hidden" style={{ background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)", borderColor: G.borderHi, boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)` }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      <div className="flex items-center gap-3 mb-6">
        <Clock className="w-7 h-7" style={{ color: G.text }} />
        <div>
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>{isMalayalam ? "കർമ്മ ടൈമിംഗ് അഡ്വൈസർ" : "Karma Timing Advisor"}</h2>
          <p className="font-malayalam-sm" style={{ color: G.dim }}>{isMalayalam ? "PDF നിയമങ്ങൾ മാത്രം" : "PDF Knowledge Base Rules Only"}</p>
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-6">
        <p className="font-inter text-[10px] uppercase tracking-widest mb-3" style={{ color: G.dim }}>{isMalayalam ? "പ്രവർത്തന വിഭാഗം തിരഞ്ഞെടുക്കുക" : "Select Action Category"}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {ACTION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="p-3 rounded-lg border transition-all text-left"
              style={{
                background: selectedCategory === cat.id ? G.bgHi : G.bg,
                borderColor: selectedCategory === cat.id ? G.text : G.faint
              }}
            >
              <span className="text-xl mb-1 block">{cat.icon}</span>
              <p className="font-amiri text-sm font-bold" style={{ color: G.text }}>{cat.arabic}</p>
              <p className="font-malayalam-sm text-white/70 truncate">{cat.name}</p>
            </button>
          ))}
        </div>
      </div>

      {loading && !evaluation && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: G.text, borderTopColor: "transparent" }} />
          <p className="mt-4 font-inter text-sm" style={{ color: G.dim }}>{isMalayalam ? "വിലയിരുത്തുന്നു..." : "Evaluating..."}</p>
        </div>
      )}

      {evaluation && !loading && (
        <>
          <StatusDisplay evaluation={evaluation} isMalayalam={isMalayalam} />
          <CurrentFactors evaluation={evaluation} isMalayalam={isMalayalam} />
          <PDFRuleDisplay evaluation={evaluation} expanded={expandedRule} onToggle={() => setExpandedRule(!expandedRule)} isMalayalam={isMalayalam} />
          <NextSuitableTime evaluation={evaluation} isMalayalam={isMalayalam} />
        </>
      )}
    </motion.div>
  );
}

function StatusDisplay({ evaluation, isMalayalam }) {
  const { result } = evaluation;
  
  // FINAL MANUSCRIPT RULE: Check if any rules match
  if (result.no_manuscript_match) {
    return (
      <div className="mb-6 p-6 rounded-xl border text-center" style={{ background: G.notSuitable, borderColor: G.notSuitableBorder }}>
        <XCircle className="w-12 h-12 mx-auto mb-3" style={{ color: "#ef4444" }} />
        <p className="font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: "#ef4444" }}>
          {isMalayalam ? "ഹസ്തലിഖിത നിയമമില്ല" : "No Manuscript Rule"}
        </p>
        <p className="font-malayalam-lg font-bold text-white mb-2">
          {isMalayalam ? "ഹസ്തലിഖിതത്തിൽ യോജിക്കുന്ന നിയമമില്ല" : "No matching manuscript rule found"}
        </p>
        <p className="font-malayalam-sm text-white/70">
          {isMalayalam 
            ? "നിലവിലെ സമയത്തിന് PDF നിയമങ്ങളിൽ യോജിക്കുന്ന വിധി കണ്ടെത്തിയില്ല" 
            : "No manuscript rule matches the current astrological configuration"}
        </p>
      </div>
    );
  }
  
  let statusConfig;
  if (result.suitable) {
    statusConfig = { bg: G.suitable, border: G.suitableBorder, icon: CheckCircle, text: "#22c55e", label: isMalayalam ? "ഇപ്പോൾ അനുയോജ്യം" : "Suitable Now" };
  } else if (result.wait) {
    statusConfig = { bg: G.wait, border: G.waitBorder, icon: AlertCircle, text: "#fbbf24", label: isMalayalam ? "കാത്തിരിക്കുക" : "Wait" };
  } else {
    statusConfig = { bg: G.notSuitable, border: G.notSuitableBorder, icon: XCircle, text: "#ef4444", label: isMalayalam ? "ഇപ്പോൾ അനുയോജ്യമല്ല" : "Not Suitable Now" };
  }

  const StatusIcon = statusConfig.icon;

  return (
    <div className="mb-6 p-6 rounded-xl border text-center" style={{ background: statusConfig.bg, borderColor: statusConfig.border }}>
      <StatusIcon className="w-12 h-12 mx-auto mb-3" style={{ color: statusConfig.text }} />
      <p className="font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: statusConfig.text }}>{statusConfig.label}</p>
      <p className="font-malayalam-lg font-bold text-white">{evaluation.rules?.action || ""}</p>
    </div>
  );
}

function CurrentFactors({ evaluation, isMalayalam }) {
  const { moonPos, planetHour, dayInfo } = evaluation;

  return (
    <div className="mb-6 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
      <FactorCard label={isMalayalam ? "ചാന്ദ്ര മൻസിൽ" : "Lunar Mansion"} value={isMalayalam ? (moonPos.mansion?.name_ar || "—") : moonPos.mansion?.name_en} arabic={isMalayalam ? undefined : moonPos.mansion?.name_ar} icon="🌙" />
      <FactorCard label={isMalayalam ? "രാശി" : "Zodiac Sign"} value={isMalayalam ? moonPos.zodiacSign?.name_ml : moonPos.zodiacSign?.name_en} symbol={moonPos.zodiacSign?.symbol} icon="⭐" />
      <FactorCard label={isMalayalam ? "മൂലകം" : "Element"} value={moonPos.zodiacSign?.element} icon="🔥" />
      <FactorCard label={isMalayalam ? "ഗ്രഹ മണിക്കൂർ" : "Planetary Hour"} value={isMalayalam ? planetHour.planetInfo?.name_ml_equivalent : planetHour.planetInfo?.name_en} symbol={planetHour.planetInfo?.symbol} icon="🪐" />
      <FactorCard label={isMalayalam ? "ആഴ്ച" : "Day Ruler"} value={isMalayalam ? dayInfo.ruler_ml : dayInfo.ruler_en} symbol={dayInfo.symbol} icon="📅" />
      <FactorCard label={isMalayalam ? "മാനസികാവസ്ഥ" : "Moon Phase"} value={moonPos.phaseDescription} icon="🌓" />
    </div>
  );
}

function FactorCard({ label, value, arabic, symbol, icon }) {
  return (
    <div className="p-4 rounded-lg border" style={{ background: G.bg, borderColor: G.faint }}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</p>
      </div>
      {arabic ? (
        <>
          <p className="font-amiri text-2xl font-bold text-right mb-1" style={{ color: G.text }}>{arabic}</p>
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

function PDFRuleDisplay({ evaluation, expanded, onToggle, isMalayalam }) {
  const { rules, result } = evaluation;

  // If no manuscript match, show enforcement notice
  if (result.no_manuscript_match) {
    return (
      <div className="mb-6 p-5 rounded-xl border text-center" style={{ background: G.bg, borderColor: G.border }}>
        <Book className="w-6 h-6 mx-auto mb-3" style={{ color: G.text }} />
        <p className="font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
          {isMalayalam ? "ഹസ്തലിഖിത നിയമങ്ങൾ" : "Manuscript Rules Enforcement"}
        </p>
        <p className="font-malayalam-sm text-white/70 mb-4">
          {isMalayalam 
            ? "നിലവിലെ ഗ്രഹനിലകൾക്ക് അനുയോജ്യമായ PDF നിയമങ്ങൾ കണ്ടെത്തിയില്ല" 
            : "No PDF manuscript rules match the current planetary configuration"}
        </p>
        <div className="text-left p-4 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            {isMalayalam ? "ആവശ്യമായ ഉറവിട വിവരങ്ങൾ" : "Required Source Information (Not Found)"}
          </p>
          <div className="space-y-1 text-xs text-white/60">
            <p>✗ {isMalayalam ? "പുസ്തക പേര്" : "Book name"} — Not found in manuscripts</p>
            <p>✗ {isMalayalam ? "പേജ് നമ്പർ" : "Page number"} — Not found in manuscripts</p>
            <p>✗ {isMalayalam ? "യഥാർത്ഥ വാചകം" : "Original text"} — Not found in manuscripts</p>
            <p>✗ {isMalayalam ? "മലയാളം തർജ്ജമ" : "Malayalam translation"} — Not found in manuscripts</p>
            <p>✗ {isMalayalam ? "ബാധകമാകാൻ കാരണം" : "Why applies"} — Not found in manuscripts</p>
          </div>
        </div>
      </div>
    );
  }

  // Show matching rules with full 5-part citation
  return (
    <div className="mb-6 border rounded-xl" style={{ borderColor: G.faint }}>
      <button onClick={onToggle} className="w-full p-4 flex items-center justify-between gap-3" style={{ color: G.dim }}>
        <div className="flex items-center gap-3">
          <Book className="w-5 h-5" />
          <span className="font-inter text-[9px] uppercase tracking-widest">{isMalayalam ? "PDF നിയമങ്ങൾ" : "PDF Rules Applied"}</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="p-4 border-t space-y-3" style={{ borderColor: G.faint }}>
              {(result.matchingRules || []).map((rule, idx) => (
                <div key={idx} className="p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                  {/* 1. Book Name */}
                  <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "പുസ്തകം" : "Book"}</p>
                  <p className="font-malayalam-sm font-bold text-white mb-2">{rule.book_name}</p>
                  
                  {/* 2. Page Number */}
                  <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "പേജ്" : "Page"}</p>
                  <p className="font-malayalam-sm font-bold text-white mb-2">{rule.page_number}</p>
                  
                  {/* 3. Original Text */}
                  {rule.original_text && (
                    <>
                      <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{isMalayalam ? "യഥാർത്ഥ വാചകം" : "Original Text"}</p>
                      <p className="font-amiri text-lg font-bold text-right mb-2" style={{ color: G.text }}>{rule.original_text}</p>
                    </>
                  )}
                  
                  {/* 4. Malayalam Translation */}
                  {rule.malayalam_translation && (
                    <>
                      <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: "#22c55e" }}>{isMalayalam ? "മലയാളം" : "Malayalam"}</p>
                      <p className="font-malayalam-sm text-white/80 mb-2">{rule.malayalam_translation}</p>
                    </>
                  )}
                  
                  {/* 5. Why Applies */}
                  <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: "#22c55e" }}>{isMalayalam ? "കാരണം" : "Why Applies"}</p>
                  <p className="font-malayalam-sm text-white/90">{rule.why_applies}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NextSuitableTime({ evaluation, isMalayalam }) {
  const { result } = evaluation;

  if (result.suitable) {
    return (
      <div className="p-4 rounded-xl border text-center" style={{ background: G.suitable, borderColor: G.suitableBorder }}>
        <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "#22c55e" }} />
        <p className="font-malayalam-md font-bold text-white">{isMalayalam ? "ഈ സമയം അനുയോജ്യമാണ്" : "This moment is suitable"}</p>
        <p className="font-inter text-[9px] mt-1" style={{ color: "#22c55e" }}>{isMalayalam ? "ഇപ്പോൾ ആരംഭിക്കാം" : "You may proceed now"}</p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border" style={{ background: result.wait ? G.wait : G.notSuitable, borderColor: result.wait ? G.waitBorder : G.notSuitableBorder }}>
      <div className="flex items-center gap-3 mb-3">
        {result.wait ? <AlertCircle className="w-6 h-6" style={{ color: "#fbbf24" }} /> : <XCircle className="w-6 h-6" style={{ color: "#ef4444" }} />}
        <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: result.wait ? "#fbbf24" : "#ef4444" }}>{isMalayalam ? "അടുത്ത ഉചിത സമയം" : "Next Suitable Time"}</p>
      </div>
      {result.nextSuitable ? (
        <>
          <p className="font-malayalam-lg font-bold text-white mb-1">{result.nextSuitable.time}</p>
          <p className="font-inter text-sm" style={{ color: result.wait ? "#fbbf24" : "#ef4444" }}>{isMalayalam ? "കൗണ്ട്ഡൗൺ:" : "Countdown:"} {result.nextSuitable.countdown}</p>
        </>
      ) : (
        <p className="font-malayalam-sm text-white/60">{isMalayalam ? "ഇന്ന് ഉചിത സമയമില്ല" : "No suitable time today"}</p>
      )}
    </div>
  );
}

function evaluateRules(rules, moonPos, planetHour, dayInfo) {
  let score = 0;
  let totalChecks = 0;
  const matchingRules = [];

  // Extract rules from PDF knowledge base - FINAL MANUSCRIPT RULE
  const bestDays = [];
  const suitableMansions = [];

  rules.forEach(rule => {
    if (rule.ruleType === "day_ruler") {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      days.forEach(day => {
        if (rule.ruleText.includes(day) && !bestDays.includes(day)) {
          bestDays.push(day);
          if (dayInfo.ruler_en === day) {
            matchingRules.push({
              type: "day_match",
              book_name: rule.book || "Havâss'ın Derinlikleri",
              page_number: rule.pages || "PDF2",
              original_text: rule.ruleText,
              malayalam_translation: rule.malayalamTranslation || null,
              why_applies: `Current day (${dayInfo.ruler_en}) matches manuscript rule`
            });
          }
        }
      });
    }
    if (rule.ruleType === "lunar_mansion") {
      const numbers = rule.ruleText.match(/\d+/g);
      if (numbers) {
        numbers.forEach(n => {
          const num = parseInt(n);
          if (num >= 1 && num <= 28 && !suitableMansions.includes(num)) {
            suitableMansions.push(num);
            if (moonPos.mansion?.number === num) {
              matchingRules.push({
                type: "mansion_match",
                book_name: rule.book || "Havâss'ın Derinlikleri",
                page_number: rule.pages || "PDF2",
                original_text: rule.ruleText,
                malayalam_translation: rule.malayalamTranslation || null,
                why_applies: `Current mansion (${moonPos.mansion?.number}) matches manuscript rule`
              });
            }
          }
        });
      }
    }
  });

  // Check day ruler
  totalChecks++;
  if (bestDays.length > 0 && bestDays.includes(dayInfo.ruler_en)) score++;

  // Check lunar mansion
  totalChecks++;
  if (suitableMansions.length > 0 && suitableMansions.includes(moonPos.mansion?.number)) score++;

  // Calculate ratio
  const ratio = totalChecks > 0 ? score / totalChecks : 0;
  let suitable = false;
  let wait = false;

  // FINAL MANUSCRIPT RULE: No recommendation without matching rules
  if (ratio >= 0.5 && matchingRules.length > 0) {
    suitable = true;
  } else if (ratio >= 0.25 && matchingRules.length > 0) {
    wait = true;
  }

  return {
    suitable,
    wait,
    score,
    totalChecks,
    ratio,
    matchingRules,
    no_manuscript_match: matchingRules.length === 0,
    nextSuitable: calculateNextSuitable(rules, moonPos, planetHour, dayInfo)
  };
}

function calculateNextSuitable(rules, currentMoonPos, currentPlanetHour, currentDayInfo) {
  const now = new Date();
  for (let h = now.getHours() + 1; h < 24; h++) {
    const future = new Date(now);
    future.setHours(h, 0, 0, 0);
    
    const moonPos = calculateMoonPosition(future);
    const planetHour = getCurrentPlanetaryHour(future, 6.5, 18.25);
    const dayIndex = future.getDay();
    const dayInfo = DAY_INFO[dayIndex];
    
    // Re-evaluate for future time
    const bestDays = [];
    const suitableMansions = [];
    
    rules.forEach(rule => {
      if (rule.ruleType === "day_ruler") {
        if (rule.ruleText.includes("Monday")) bestDays.push("Monday");
        if (rule.ruleText.includes("Tuesday")) bestDays.push("Tuesday");
        if (rule.ruleText.includes("Wednesday")) bestDays.push("Wednesday");
        if (rule.ruleText.includes("Thursday")) bestDays.push("Thursday");
        if (rule.ruleText.includes("Friday")) bestDays.push("Friday");
        if (rule.ruleText.includes("Saturday")) bestDays.push("Saturday");
        if (rule.ruleText.includes("Sunday")) bestDays.push("Sunday");
      }
      if (rule.ruleType === "lunar_mansion") {
        const numbers = rule.ruleText.match(/\d+/g);
        if (numbers) numbers.forEach(n => suitableMansions.push(parseInt(n)));
      }
    });
    
    let score = 0;
    let totalChecks = 0;
    
    if (bestDays.length > 0 && bestDays.includes(dayInfo.ruler_en)) score++;
    totalChecks++;
    
    if (suitableMansions.length > 0 && suitableMansions.includes(moonPos.mansion?.number)) score++;
    totalChecks++;
    
    const ratio = totalChecks > 0 ? score / totalChecks : 0;
    
    if (ratio >= 0.5) {
      return {
        time: formatTime(future),
        countdown: formatCountdown(future, now)
      };
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
  const diff = future.getTime() - now.getTime();
  const minutes = Math.floor(diff / 60000);
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}
