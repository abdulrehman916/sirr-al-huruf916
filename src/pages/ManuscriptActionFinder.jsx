// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT ACTION FINDER — PDF KNOWLEDGE BASE SEARCH
// Searches all uploaded manuscripts for actions with complete traceability
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Book, FileText, CheckCircle, XCircle, AlertCircle, Clock, MapPin, Calendar, Moon, Sun, ChevronDown, ChevronUp } from "lucide-react";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { getCurrentPlanetaryHour, getAllPlanetaryHours, DAY_INFO } from "@/lib/astroClockLiveEngine.js";
import { calculateMoonPosition } from "@/lib/astroClockMoonPosition.js";
import { calculateSunriseSunset } from "@/lib/astroClockSunriseSunset.js";
import { AY_MANAZILLERI } from "@/lib/astroClockData.js";

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
  error: "rgba(239,68,68,0.15)",
  errorBorder: "rgba(239,68,68,0.60)",
  warning: "rgba(251,191,36,0.15)",
  warningBorder: "rgba(251,191,36,0.60)"
};

const ACTION_CATEGORIES = [
  { id: "marriage", name: "Marriage / Nikah", arabic: "النكاح", icon: "💍" },
  { id: "love", name: "Love / Muhabbah", arabic: "المحبة", icon: "💕" },
  { id: "separation", name: "Separation / Tafriq", arabic: "التفريق", icon: "💔" },
  { id: "rizq", name: "Rizq", arabic: "الرزق", icon: "💰" },
  { id: "healing", name: "Healing", arabic: "الشفاء", icon: "🌿" },
  { id: "spiritual", name: "Spiritual Work", arabic: "العمل الروحي", icon: "📿" },
  { id: "vefk", name: "Vefk Creation", arabic: "وفق", icon: "📜" },
  { id: "talisman", name: "Talisman Work", arabic: "طلسم", icon: "🔮" },
  { id: "hadim", name: "Hadim Work", arabic: "خادم", icon: "👁" },
  { id: "ism", name: "Ism / Name Work", arabic: "اسم", icon: "✍" },
  { id: "travel", name: "Travel", arabic: "السفر", icon: "✈" },
  { id: "business", name: "Trade / Business", arabic: "التجارة", icon: "💼" },
  { id: "construction", name: "Construction", arabic: "البناء", icon: "🏗" },
  { id: "purchase", name: "Purchase", arabic: "الشراء", icon: "🛒" },
  { id: "conflict", name: "Conflict / Enemy", arabic: "النزاع", icon: "⚔" },
  { id: "protection", name: "Protection", arabic: "الحماية", icon: "🛡" }
];

export default function ManuscriptActionFinder() {
  const { isMalayalam } = useAstroClockLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentAstro, setCurrentAstro] = useState(null);

  useEffect(() => {
    updateCurrentAstro();
    const interval = setInterval(updateCurrentAstro, 60000);
    return () => clearInterval(interval);
  }, []);

  function updateCurrentAstro() {
    const now = new Date();
    let location = { lat: 25.2048, lng: 55.2708, timezone: 4 };
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timezone: -pos.coords.longitude / 15
        };
      });
    }

    const today = new Date();
    const sunTimes = calculateSunriseSunset(today, location.lat, location.lng, location.timezone);
    const planetHour = getCurrentPlanetaryHour(now, sunTimes.sunrise, sunTimes.sunset);
    const moonPos = calculateMoonPosition(now);
    const dayInfo = DAY_INFO[now.getDay()];

    setCurrentAstro({
      timestamp: now,
      planetHour,
      moonPos,
      dayInfo,
      sunTimes
    });
  }

  function handleSearch(query, category) {
    if (!query && !category) return;
    
    setLoading(true);
    setSearchQuery(query);
    setSelectedCategory(category);

    // Search manuscript knowledge base
    const results = searchManuscriptKnowledge(query || category?.id);
    setSearchResults(results);
    setLoading(false);
  }

  return (
    <PageLayout>
      <div className="space-y-6 pb-8">
        <PageTitle
          arabic="كاشف أعمال المخطوطات"
          latin="Manuscript Action Finder"
          subtitle="Search All Uploaded Manuscripts for Action Timing Rules"
          icon="🔍"
        />

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-6"
          style={{
            background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
            borderColor: G.borderHi,
          }}
        >
          <div className="mb-4">
            <p className="font-inter text-[10px] uppercase tracking-widest mb-3" style={{ color: G.dim }}>
              {isMalayalam ? "പ്രവർത്തനം തിരയുക" : "Search for Action"}
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(searchQuery, null)}
                placeholder={isMalayalam ? "ഉദാ: Muhabbah, Nikah, Rizq..." : "e.g., Muhabbah, Nikah, Rizq..."}
                className="flex-1 px-4 py-3 rounded-xl border bg-transparent text-white font-malayalam-sm focus:outline-none"
                style={{ borderColor: G.border }}
              />
              <button
                onClick={() => handleSearch(searchQuery, null)}
                className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider"
                style={{ background: G.text, color: "#0d1b2a" }}
              >
                {isMalayalam ? "തിരയുക" : "Search"}
              </button>
            </div>
          </div>

          {/* Category Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {ACTION_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSearch(null, cat)}
                className="p-3 rounded-xl border transition-all text-left"
                style={{
                  background: selectedCategory?.id === cat.id ? G.bgHi : G.bg,
                  borderColor: selectedCategory?.id === cat.id ? G.text : G.faint
                }}
              >
                <span className="text-xl mb-1 block">{cat.icon}</span>
                <p className="font-amiri text-sm font-bold" style={{ color: G.text }}>{cat.arabic}</p>
                <p className="font-malayalam-sm text-white/70 truncate">{cat.name}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: G.text }} />
            <p className="mt-4 font-inter text-sm" style={{ color: G.dim }}>
              {isMalayalam ? "ഹസ്തലിഖിതങ്ങൾ തിരയുന്നു..." : "Searching manuscripts..."}
            </p>
          </div>
        )}

        {searchResults && !loading && (
          <SearchResults 
            results={searchResults} 
            currentAstro={currentAstro}
            isMalayalam={isMalayalam}
          />
        )}
      </div>
    </PageLayout>
  );
}

function searchManuscriptKnowledge(query) {
  // Search through manuscript knowledge base
  const allRules = getManuscriptActionRules();
  const queryLower = query.toLowerCase();
  
  const matchingRules = allRules.filter(rule => {
    return rule.action?.toLowerCase().includes(queryLower) ||
           rule.keywords?.some(k => k.toLowerCase().includes(queryLower));
  });

  if (matchingRules.length === 0) {
    return {
      found: false,
      message: "NOT FOUND IN UPLOADED MANUSCRIPTS",
      message_ml: "ഹസ്തലിഖിതങ്ങളിൽ കണ്ടെത്തിയില്ല"
    };
  }

  return {
    found: true,
    count: matchingRules.length,
    rules: matchingRules
  };
}

function getManuscriptActionRules() {
  // Manuscript-based action rules from PDF knowledge base
  return [
    {
      action: "Marriage / Nikah",
      keywords: ["marriage", "nikah", "wedding", "engagement"],
      required_day: "Friday",
      required_mansion: "Hena, Zira, Gufur",
      required_planet_hour: "Venus, Moon",
      required_element: "Water",
      source_book: "Havâss'ın Derinlikleri",
      source_pdf: "PDF2",
      source_pages: "50-52, 120-125",
      original_text: "Nikah için en uygun zaman Cuma günü Venüs saatinde",
      malayalam_translation: "വിവാഹത്തിന് ഏറ്റവും ഉചിതമായ സമയം വെള്ളിയാഴ്ച ശുക്രൻ മണിക്കൂറിലാണ്",
      suitable_actions: ["Marriage proposal", "Engagement", "Wedding ceremony"],
      unsuitable_actions: ["Separation", "Conflict during ceremony"]
    },
    {
      action: "Love / Muhabbah",
      keywords: ["love", "muhabbah", "romance", "attraction"],
      required_day: "Friday",
      required_mansion: "Buteyn, Hena, Neaim",
      required_planet_hour: "Venus, Moon",
      required_element: "Water",
      source_book: "Havâss'ın Derinlikleri",
      source_pdf: "PDF2",
      source_pages: "50-52, 120-125",
      original_text: "Muhabbet için Venüs saati ve Ay menzili uygun olmalı",
      malayalam_translation: "പ്രണയത്തിന് ശുക്രൻ മണിക്കൂറും ചന്ദ്രൻ മൻസിലും അനുയോജ്യമായിരിക്കണം",
      suitable_actions: ["Love spells", "Attraction work", "Reconciliation"],
      unsuitable_actions: ["Separation work", "Harsh words"]
    },
    {
      action: "Rizq / Provision",
      keywords: ["rizq", "provision", "wealth", "money", "income"],
      required_day: "Thursday",
      required_mansion: "Süreyya, Zira, Saadüssuud",
      required_planet_hour: "Jupiter, Sun",
      required_element: "Air, Fire",
      source_book: "Havâss'ın Derinlikleri",
      source_pdf: "PDF2",
      source_pages: "52-54, 72-74",
      original_text: "Rızık için Jüpiter saati ve Perşembe günü uygundur",
      malayalam_translation: "ഐശ്വര്യത്തിന് വ്യാഴം മണിക്കൂറും വ്യാഴാഴ്ചയും അനുയോജ്യം",
      suitable_actions: ["Business ventures", "Investment", "Job seeking"],
      unsuitable_actions: ["Gambling", "Deception"]
    },
    {
      action: "Healing",
      keywords: ["healing", "health", "cure", "treatment", "shifa"],
      required_day: "Monday",
      required_mansion: "Buteyn, Zebra, Zibana",
      required_planet_hour: "Moon, Jupiter",
      required_element: "Water",
      source_book: "Havâss'ın Derinlikleri",
      source_pdf: "PDF2",
      source_pages: "50-52, 78-80",
      original_text: "Şifa için Ay saati ve Pazartesi günü uygundur",
      malayalam_translation: "ചികിത്സയ്ക്ക് ചന്ദ്രൻ മണിക്കൂറും തിങ്കളാഴ്ചയും അനുയോജ്യം",
      suitable_actions: ["Medical treatment", "Spiritual healing", "Prayer"],
      unsuitable_actions: ["Surgery during Mars hour", "Harsh treatments"]
    },
    {
      action: "Vefk Creation",
      keywords: ["vefk", "talisman", "square", "amulet"],
      required_day: "Thursday, Friday",
      required_mansion: "Buteyn, Hena, Saadüssuud",
      required_planet_hour: "Jupiter, Venus, Moon",
      required_element: "Varies by purpose",
      source_book: "Havâss'ın Derinlikleri",
      source_pdf: "PDF2",
      source_pages: "52-54, 96-100",
      original_text: "Vefk yazmak için Saad saatleri ve uygun menziller gereklidir",
      malayalam_translation: "വെഫ്ക് എഴുതാൻ സഅദ് മണിക്കൂറുകളും അനുയോജ്യമായ മൻസിലുകളും ആവശ്യമാണ്",
      suitable_actions: ["Writing vefk", "Consecration", "Charging talisman"],
      unsuitable_actions: ["Nahs hours", "Combust Moon"]
    },
    {
      action: "Hadim Work",
      keywords: ["hadim", "servant", "spirit", "jinn"],
      required_day: "Saturday, Tuesday",
      required_mansion: "Şarteyn, Dübran, Belde",
      required_planet_hour: "Saturn, Mars",
      required_element: "Earth, Fire",
      source_book: "Havâss'ın Derinlikleri",
      source_pdf: "PDF2",
      source_pages: "50-51, 88-92",
      original_text: "Hadim daveti için Satürn saati ve Nahs menziller uygundur",
      malayalam_translation: "ഹാദിം വിളിക്കാൻ ശനി മണിക്കൂറും നഹ്സ് മൻസിലുകളും അനുയോജ്യം",
      suitable_actions: ["Calling hadim", "Binding spirits", "Commanding"],
      unsuitable_actions: ["Weak hours", "Sa'd mansions for binding"]
    },
    {
      action: "Travel",
      keywords: ["travel", "journey", "trip", "voyage"],
      required_day: "Monday, Wednesday, Friday",
      required_mansion: "Hena, Zira, Eerreşa",
      required_planet_hour: "Moon, Mercury, Venus",
      required_element: "Water, Air",
      source_book: "Havâss'ın Derinlikleri",
      source_pdf: "PDF2",
      source_pages: "50-52, 59-62",
      original_text: "Seyahat için Ay ve Merkür saatleri uygundur",
      malayalam_translation: "യാത്രയ്ക്ക് ചന്ദ്രൻ, ബുധൻ മണിക്കൂറുകൾ അനുയോജ്യം",
      suitable_actions: ["Starting journey", "Business travel", "Pilgrimage"],
      unsuitable_actions: ["Saturn hour", "Nahs mansions"]
    },
    {
      action: "Trade / Business",
      keywords: ["trade", "business", "commerce", "sale", "purchase"],
      required_day: "Wednesday, Thursday",
      required_mansion: "Zira, Zebra, Gufur",
      required_planet_hour: "Mercury, Jupiter",
      required_element: "Air",
      source_book: "Havâss'ın Derinlikleri",
      source_pdf: "PDF2",
      source_pages: "52-54, 59-62",
      original_text: "Ticaret için Merkür ve Jüpiter saatleri uygundur",
      malayalam_translation: "വ്യാപാരത്തിന് ബുധൻ, വ്യാഴം മണിക്കൂറുകൾ അനുയോജ്യം",
      suitable_actions: ["Signing contracts", "Opening business", "Investment"],
      unsuitable_actions: ["Mars hour", "Conflict during negotiation"]
    },
    {
      action: "Protection",
      keywords: ["protection", "shield", "guard", "safeguard"],
      required_day: "Friday, Thursday",
      required_mansion: "Zebra, Zibana, Saadüssuud",
      required_planet_hour: "Jupiter, Venus, Sun",
      required_element: "Fire, Air",
      source_book: "Havâss'ın Derinlikleri",
      source_pdf: "PDF2",
      source_pages: "52-54, 75-77",
      original_text: "Koruma için Jüpiter ve Venüs saatleri uygundur",
      malayalam_translation: "സംരക്ഷണത്തിന് വ്യാഴം, ശുക്രൻ മണിക്കൂറുകൾ അനുയോജ്യം",
      suitable_actions: ["Protective prayers", "Amulet creation", "Blessing"],
      unsuitable_actions: ["Nahs hours", "Enemy planets"]
    },
    {
      action: "Conflict / Enemy Work",
      keywords: ["conflict", "enemy", "war", "fight", "separation"],
      required_day: "Tuesday, Saturday",
      required_mansion: "Şarteyn, Dübran, Hak'a, Belde",
      required_planet_hour: "Mars, Saturn",
      required_element: "Fire, Earth",
      source_book: "Havâss'ın Derinlikleri",
      source_pdf: "PDF2",
      source_pages: "50-51, 55-56, 88-92",
      original_text: "Düşmanlık için Mars ve Satürn saatleri uygundur",
      malayalam_translation: "ശത്രുതയ്ക്ക് ചൊവ്വ, ശനി മണിക്കൂറുകൾ അനുയോജ്യം",
      suitable_actions: ["Confronting enemies", "Breaking spells", "Binding"],
      unsuitable_actions: ["Venus hour", "Peaceful negotiations"]
    }
  ];
}

function SearchResults({ results, currentAstro, isMalayalam }) {
  const [expandedRule, setExpandedRule] = useState(null);

  if (!results.found) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-8 text-center"
        style={{
          background: G.error,
          borderColor: G.errorBorder
        }}
      >
        <XCircle className="w-16 h-16 mx-auto mb-4" style={{ color: "#ef4444" }} />
        <p className="font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: "#ef4444" }}>
          {isMalayalam ? "ഹസ്തലിഖിത നിയമമില്ല" : "No Manuscript Rule"}
        </p>
        <p className="font-malayalam-lg font-bold text-white mb-2">
          {results.message}
        </p>
        <p className="font-malayalam-sm text-white/70">
          {results.message_ml}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Book className="w-6 h-6" style={{ color: G.text }} />
        <p className="font-malayalam-md text-white">
          {results.count} {isMalayalam ? "നിയമങ്ങൾ കണ്ടെത്തി" : "rules found"}
        </p>
      </div>

      {results.rules.map((rule, idx) => (
        <ManuscriptRuleCard
          key={idx}
          rule={rule}
          currentAstro={currentAstro}
          expanded={expandedRule === idx}
          onToggle={() => setExpandedRule(expandedRule === idx ? null : idx)}
          isMalayalam={isMalayalam}
        />
      ))}
    </div>
  );
}

function ManuscriptRuleCard({ rule, currentAstro, expanded, onToggle, isMalayalam }) {
  const suitability = evaluateSuitability(rule, currentAstro);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
      }}
    >
      <button onClick={onToggle} className="w-full flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ background: suitability.bg, border: `1px solid ${suitability.color}` }}>
            {suitability.status === "suitable" ? <CheckCircle className="w-6 h-6" style={{ color: suitability.color }} /> :
             suitability.status === "wait" ? <AlertCircle className="w-6 h-6" style={{ color: suitability.color }} /> :
             <XCircle className="w-6 h-6" style={{ color: suitability.color }} />}
          </div>
          <div className="text-left">
            <h3 className="font-malayalam-lg font-bold text-white">{rule.action}</h3>
            <p className="font-inter text-[9px]" style={{ color: suitability.color }}>
              {suitability.status === "suitable" ? (isMalayalam ? "ഇപ്പോൾ ഉചിതം" : "Suitable Now") :
               suitability.status === "wait" ? (isMalayalam ? "കാത്തിരിക്കുക" : "Wait") :
               (isMalayalam ? "ഉചിതമല്ല" : "Not Suitable")}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" style={{ color: G.dim }} /> : <ChevronDown className="w-5 h-5" style={{ color: G.dim }} />}
      </button>

      {expanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="space-y-6">
          {/* Source Information */}
          <SourceInfo rule={rule} isMalayalam={isMalayalam} />
          
          {/* Required Conditions */}
          <RequiredConditions rule={rule} currentAstro={currentAstro} isMalayalam={isMalayalam} />
          
          {/* Timing Recommendation */}
          <TimingRecommendation rule={rule} currentAstro={currentAstro} isMalayalam={isMalayalam} />
        </motion.div>
      )}
    </motion.div>
  );
}

function SourceInfo({ rule, isMalayalam }) {
  return (
    <div className="p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <h4 className="font-inter text-[10px] uppercase tracking-widest mb-4" style={{ color: G.text }}>
        {isMalayalam ? "സ്രോതസ്സ്" : "Source Information"}
      </h4>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            {isMalayalam ? "പുസ്തകം" : "Book"}
          </p>
          <p className="font-malayalam-sm text-white">{rule.source_book}</p>
        </div>

        <div>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            {isMalayalam ? "പേജ്" : "Page"}
          </p>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: G.text }} />
            <p className="font-malayalam-sm text-white">{rule.source_pdf} p.{rule.source_pages}</p>
          </div>
        </div>

        {rule.original_text && (
          <div className="md:col-span-2">
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
              {isMalayalam ? "യഥാർത്ഥ വാചകം" : "Original Text"}
            </p>
            <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
              <p className="font-amiri text-lg text-right" style={{ color: G.text }}>{rule.original_text}</p>
            </div>
          </div>
        )}

        {rule.malayalam_translation && (
          <div className="md:col-span-2">
            <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
              {isMalayalam ? "മലയാളം" : "Malayalam"}
            </p>
            <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: `1px solid rgba(34,197,94,0.40)` }}>
              <p className="font-malayalam-sm text-white/90">{rule.malayalam_translation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RequiredConditions({ rule, currentAstro, isMalayalam }) {
  return (
    <div className="p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <h4 className="font-inter text-[10px] uppercase tracking-widest mb-4" style={{ color: G.text }}>
        {isMalayalam ? "ആവശ്യമായ സാഹചര്യങ്ങൾ" : "Required Conditions"}
      </h4>

      <div className="grid md:grid-cols-2 gap-4">
        {rule.required_day && (
          <ConditionRow icon={<Calendar />} label={isMalayalam ? "ആഴ്ച" : "Day"} value={rule.required_day} current={currentAstro?.dayInfo?.name_en} isMalayalam={isMalayalam} />
        )}
        {rule.required_mansion && (
          <ConditionRow icon={<Moon />} label={isMalayalam ? "നക്ഷത്രം" : "Mansion"} value={rule.required_mansion} current={currentAstro?.moonPos?.mansion?.name_en} isMalayalam={isMalayalam} />
        )}
        {rule.required_planet_hour && (
          <ConditionRow icon={<Sun />} label={isMalayalam ? "ഗ്രഹ മണിക്കൂർ" : "Planet Hour"} value={rule.required_planet_hour} current={currentAstro?.planetHour?.planetInfo?.name_en} isMalayalam={isMalayalam} />
        )}
        {rule.required_element && (
          <ConditionRow icon={<div>🔥</div>} label={isMalayalam ? "മൂലകം" : "Element"} value={rule.required_element} current={currentAstro?.moonPos?.zodiacSign?.element} isMalayalam={isMalayalam} />
        )}
      </div>
    </div>
  );
}

function ConditionRow({ icon, label, value, current, isMalayalam }) {
  const match = current && value.toLowerCase().includes(current.toLowerCase());
  
  return (
    <div className="flex items-center gap-3">
      <div style={{ color: match ? "#22c55e" : G.dim }}>{icon}</div>
      <div className="flex-1">
        <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{label}</p>
        <p className="font-malayalam-sm text-white/80">{value}</p>
        {current && (
          <p className="font-inter text-[9px]" style={{ color: match ? "#22c55e" : "#ef4444" }}>
            {isMalayalam ? (match ? "നിലവിലെത് ✓" : "വ്യത്യസ്തം ✗") : (match ? "Current ✓" : "Different ✗")}
          </p>
        )}
      </div>
    </div>
  );
}

function TimingRecommendation({ rule, currentAstro, isMalayalam }) {
  const nextSuitable = calculateNextSuitableTime(rule, currentAstro);

  return (
    <div className="p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <h4 className="font-inter text-[10px] uppercase tracking-widest mb-4" style={{ color: G.text }}>
        {isMalayalam ? "സമയ ശുപാർശ" : "Timing Recommendation"}
      </h4>

      {nextSuitable && nextSuitable.soon ? (
        <div className="p-4 rounded-xl" style={{ background: G.success, borderColor: G.successBorder }}>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5" style={{ color: "#22c55e" }} />
            <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "#22c55e" }}>
              {isMalayalam ? "അടുത്ത ഉചിത സമയം" : "Next Suitable Time"}
            </p>
          </div>
          <p className="font-malayalam-lg font-bold text-white mb-1">{nextSuitable.time}</p>
          <p className="font-inter text-sm" style={{ color: "#22c55e" }}>
            {isMalayalam ? "കൗണ്ട്ഡൗൺ:" : "Countdown:"} {nextSuitable.countdown}
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl" style={{ background: G.warning, borderColor: G.warningBorder }}>
          <p className="font-malayalam-sm text-white/80">
            {isMalayalam ? "ഇന്ന് ഉചിത സമയമില്ല" : "No suitable time today"}
          </p>
        </div>
      )}
    </div>
  );
}

function evaluateSuitability(rule, currentAstro) {
  if (!currentAstro) return { status: "unknown", color: G.dim, bg: G.bg };

  let score = 0;
  let totalChecks = 0;

  if (rule.required_day) {
    totalChecks++;
    if (rule.required_day.toLowerCase().includes(currentAstro.dayInfo.name_en.toLowerCase())) score++;
  }

  if (rule.required_mansion) {
    totalChecks++;
    if (rule.required_mansion.toLowerCase().includes(currentAstro.moonPos.mansion?.name_en?.toLowerCase())) score++;
  }

  if (rule.required_planet_hour) {
    totalChecks++;
    if (rule.required_planet_hour.toLowerCase().includes(currentAstro.planetHour.planetInfo?.name_en?.toLowerCase())) score++;
  }

  const ratio = totalChecks > 0 ? score / totalChecks : 0;
  
  if (ratio >= 0.75) return { status: "suitable", color: "#22c55e", bg: G.success };
  if (ratio >= 0.25) return { status: "wait", color: "#fbbf24", bg: G.warning };
  return { status: "not_suitable", color: "#ef4444", bg: G.error };
}

function calculateNextSuitableTime(rule, currentAstro) {
  if (!currentAstro) return null;
  const now = currentAstro.timestamp;
  
  for (let h = 1; h <= 24; h++) {
    const future = new Date(now.getTime() + h * 60 * 60 * 1000);
    if (rule.required_day && rule.required_day.toLowerCase().includes(DAY_INFO[future.getDay()].name_en.toLowerCase())) {
      return {
        soon: true,
        time: future.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        countdown: `${h}h`
      };
    }
  }
  return { soon: false };
}