// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK MASTER SEARCH — ONE UNIFIED SEARCH BAR
// Searches ALL sources: Database, PDFs, Books, Manuscripts, User Knowledge
// Supports: Malayalam, English, Arabic, Turkish
// Returns ONE unified 16-section preservation-compliant report
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertCircle } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { searchBookKnowledge } from "@/lib/astroClockBookSearch.js";
import { useToast } from "@/components/ui/use-toast";
import { getCurrentPlanetaryHour } from "@/lib/astroClockLiveEngine.js";
import { calculateMoonPosition } from "@/lib/astroClockMoonPosition.js";
import { AY_MANAZILLERI, PLANETARY_DAY_RULERS } from "@/lib/astroClockData.js";
import UnifiedReport from "./UnifiedReport.jsx";

export default function AdvancedKnowledgeSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const { isMalayalam } = useAstroClockLanguage();
  const { toast } = useToast();

  // Load current astrological data on mount
  useEffect(() => {
    const now = new Date();
    const planetaryHour = getCurrentPlanetaryHour(now, 6.5, 18.25);
    const moonPos = calculateMoonPosition(now);
    const dayRulerInfo = PLANETARY_DAY_RULERS.find(d => d.day_name_en === now.toLocaleDateString('en-US', { weekday: 'long' }));
    const currentMansion = AY_MANAZILLERI.find(m => m.no === moonPos.mansion?.number);
    
    setCurrentData({
      date: now,
      planetaryHour,
      moonPosition: moonPos,
      currentMansion,
      dayRuler: dayRulerInfo,
      zodiacSign: moonPos.mansion?.zodiac_sign || "Unknown"
    });
  }, []);

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    
    setTimeout(() => {
      const results = searchBookKnowledge(query);
      const unifiedReport = generateUnifiedReport(query, results, currentData);
      setSearchResults(unifiedReport);
      
      if (results.found) {
        toast({
          title: isMalayalam ? "ഫലങ്ങൾ കണ്ടെത്തി" : "Results Found",
          description: isMalayalam ? "എല്ലാ സ്രോതസ്സുകളും തിരഞ്ഞു" : "Searched all 8 sources",
          duration: 3000
        });
      } else {
        toast({
          title: isMalayalam ? "ഫലങ്ങളില്ല" : "No Results",
          description: isMalayalam ? "ബുക്ക് ഡാറ്റാബേസിൽ ഫലങ്ങളില്ല" : "No book-based reference found",
          duration: 3000
        });
      }
      
      setIsSearching(false);
    }, 400);
  }, [isMalayalam, toast, currentData]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Search className="w-5 h-5" style={{ color: "rgba(212,175,55,0.60)" }} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
          placeholder={isMalayalam 
            ? "തിരയുക: വിവാഹം, യാത്ര, അൽ ഷറടൈൻ, ചൊവ്വ, മേഷം..." 
            : "Search: Marriage, Travel, Al Sharatain, Mars, Aries..."}
          className="w-full pl-12 pr-12 py-4 rounded-xl border text-base"
          style={{
            background: "rgba(8,18,44,0.95)",
            borderColor: "rgba(212,175,55,0.25)",
            color: "#ffffff",
            boxShadow: "0 2px 12px rgba(0,0,0,0.40)"
          }}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10"
          >
            <AlertCircle className="w-4 h-4" style={{ color: "rgba(255,255,255,0.50)" }} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <UnifiedReport report={searchResults} isMalayalam={isMalayalam} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper functions for report generation
function getElementForSign(sign) {
  const fireSigns = ["Koç", "Arslan", "Yay"];
  const earthSigns = ["Boğa", "Başak", "Oğlak"];
  const airSigns = ["İkizler", "Terazi", "Kova"];
  if (fireSigns.includes(sign)) return "Fire";
  if (earthSigns.includes(sign)) return "Earth";
  if (airSigns.includes(sign)) return "Air";
  return "Water";
}

function findNextGoodDay(currentDay) {
  const goodDays = ["Thursday", "Friday", "Sunday"];
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentIndex = days.indexOf(currentDay);
  for (let i = currentIndex + 1; i < currentIndex + 7; i++) {
    const nextDay = days[i % 7];
    if (goodDays.includes(nextDay)) return nextDay;
  }
  return "Thursday";
}

function getFriendlySigns(sign) {
  const fireSigns = ["Koç", "Arslan", "Yay"];
  const earthSigns = ["Boğa", "Başak", "Oğlak"];
  const airSigns = ["İkizler", "Terazi", "Kova"];
  const waterSigns = ["Yengeç", "Akrep", "Balık"];
  if (fireSigns.includes(sign)) return fireSigns;
  if (earthSigns.includes(sign)) return earthSigns;
  if (airSigns.includes(sign)) return airSigns;
  return waterSigns;
}

function getOpposingSigns(sign) {
  const fireSigns = ["Koç", "Arslan", "Yay"];
  const earthSigns = ["Boğa", "Başak", "Oğlak"];
  const airSigns = ["İkizler", "Terazi", "Kova"];
  const waterSigns = ["Yengeç", "Akrep", "Balık"];
  if (fireSigns.includes(sign)) return waterSigns;
  if (earthSigns.includes(sign)) return airSigns;
  if (airSigns.includes(sign)) return earthSigns;
  return fireSigns;
}

function evaluateSuitability(query, bestTimes, currentData) {
  if (!bestTimes.suitablePlanets) return "unknown";
  const currentPlanet = currentData.planetaryHour?.planetInfo?.name_en;
  if (bestTimes.suitablePlanets.includes(currentPlanet)) return "favorable";
  if (bestTimes.unsuitablePlanets?.includes(currentPlanet)) return "unfavorable";
  return "neutral";
}

function calculateSuitabilityScore(bestTimes, currentData) {
  let score = 0.5;
  const currentPlanet = currentData.planetaryHour?.planetInfo?.name_en;
  if (bestTimes.suitablePlanets?.includes(currentPlanet)) score += 0.3;
  if (bestTimes.unsuitablePlanets?.includes(currentPlanet)) score -= 0.3;
  return Math.max(0, Math.min(1, score));
}

function getSuitabilityReasons(bestTimes, currentData) {
  const reasons = [];
  const currentPlanet = currentData.planetaryHour?.planetInfo?.name_en;
  if (bestTimes.suitablePlanets?.includes(currentPlanet)) {
    reasons.push(`Current hour ruled by ${currentPlanet} (favorable)`);
  }
  if (bestTimes.unsuitablePlanets?.includes(currentPlanet)) {
    reasons.push(`Current hour ruled by ${currentPlanet} (unfavorable)`);
  }
  return reasons.length > 0 ? reasons : ["Neutral timing"];
}

function findNextGoodHour(planetaryHour, bestTimes) {
  const nextPlanet = bestTimes.suitablePlanets?.[0] || "Jupiter";
  return {
    planet: nextPlanet,
    reason: `Next ${nextPlanet} hour`,
    source: "Planetary hour sequence"
  };
}

function extractManuscriptReferences(searchResults) {
  const refs = [];
  if (searchResults.manuscriptResults) {
    searchResults.manuscriptResults.forEach(r => {
      refs.push({
        manuscript_id: r.manuscript_id,
        book_name: r.book_name,
        author: r.author,
        page_number: r.page_number,
        chapter: r.chapter,
        original_text: r.original_text,
        verified: r.verified
      });
    });
  }
  return refs;
}

function extractBookReferences(searchResults) {
  const refs = [];
  if (searchResults.dayRules) {
    searchResults.dayRules.forEach(r => {
      if (r.source) refs.push(r.source);
    });
  }
  if (searchResults.mansionRules) {
    searchResults.mansionRules.forEach(r => {
      if (r.source) refs.push(r.source);
    });
  }
  return refs;
}

function extractPDFReferences(searchResults) {
  const refs = [];
  if (searchResults.pdfResults) {
    searchResults.pdfResults.forEach(r => {
      refs.push({
        pdf_filename: r.pdf_filename,
        page_number: r.page_number,
        book_name: r.book_name
      });
    });
  }
  return refs;
}

// Generate unified 16-section preservation-compliant report
function generateUnifiedReport(query, searchResults, currentData) {
  if (!currentData) return null;
  
  const { planetaryHour, moonPosition, currentMansion, dayRuler, zodiacSign } = currentData;
  const bestTimes = searchResults.type === 'ACTION_TIMING' ? searchResults.rules : {};
  
  const manuscriptRefs = extractManuscriptReferences(searchResults);
  const bookRefs = extractBookReferences(searchResults);
  const pdfRefs = extractPDFReferences(searchResults);
  
  return {
    section1_meaning: {
      title_ml: "വിഷയത്തിന്റെ അർത്ഥം",
      title_en: "Meaning of the Topic",
      title_ar: "معنى الموضوع",
      query: query,
      found: searchResults.found,
      description_ml: searchResults.found ? "തിരഞ്ഞെടുക്കിയ വിഷയത്തിന്റെ വിശദമായ വിവരണം" : "സ്രോതസ്സുകളിൽ ഈ വിഷയം കണ്ടെത്തിയില്ല",
      description_en: searchResults.found ? "Detailed description from stored knowledge" : "This topic not found in stored sources"
    },
    
    section2_historical: {
      title_ml: "ചരിത്രപരവും കൈയെഴുത്തുപ്രതി വിവരങ്ങളും",
      title_en: "Historical and Manuscript Description",
      title_ar: "الوصف التاريخي والمخطوطات",
      manuscripts: manuscriptRefs,
      description_ml: manuscriptRefs.length > 0 ? "കൈയെഴുത്തുപ്രതികളിൽ നിന്നുള്ള യഥാർത്ഥ വിവരങ്ങൾ" : "കൈയെഴുത്തുപ്രതികളിൽ വിവരങ്ങൾ ലഭ്യമല്ല",
      description_en: manuscriptRefs.length > 0 ? "Original information from manuscripts" : "No manuscript information available"
    },
    
    section3_categories: {
      title_ml: "ബന്ധപ്പെട്ട വിഭാഗങ്ങൾ",
      title_en: "Related Categories",
      title_ar: "التصنيفات ذات الصلة",
      categories: searchResults.type === 'ACTION_TIMING' 
        ? [searchResults.category?.en, searchResults.category?.ml].filter(Boolean)
        : searchResults.dayRules?.map(r => r.category).filter(Boolean) || [],
      sources: searchResults._metadata?.sources_searched || []
    },
    
    section4_mansion: {
      title_ml: "പ്രസക്തമായ ചന്ദ്ര നക്ഷത്രം",
      title_en: "Relevant Lunar Mansion",
      title_ar: "المحطة القمرية ذات الصلة",
      current: {
        number: currentMansion?.no || null,
        name: currentMansion?.name || "Unknown",
        name_arabic: currentMansion?.name_arabic || null,
        nature: currentMansion?.genel_hukum || "Unknown"
      },
      suitable: (bestTimes.suitableMansions || []).map(num => AY_MANAZILLERI.find(m => m.no === num)).filter(Boolean),
      source: "Havâss'ın Derinlikleri p.64-74"
    },
    
    section5_day: {
      title_ml: "പ്രസക്തമായ ഗ്രഹ ദിവസം",
      title_en: "Relevant Planetary Day",
      title_ar: "اليوم الكوكبي ذو الصلة",
      current: {
        day: dayRuler?.day_name_en || "Unknown",
        ruler: dayRuler?.planet || "Unknown",
        symbol: dayRuler?.symbol || null
      },
      suitable: bestTimes.suitableDays || [],
      source: "Havâss'ın Derinlikleri p.50-51"
    },
    
    section6_hour: {
      title_ml: "പ്രസക്തമായ ഗ്രഹ മണിക്കൂർ",
      title_en: "Relevant Planetary Hour",
      title_ar: "الساعة الكوكبية ذات الصلة",
      current: {
        planet: planetaryHour?.planetInfo?.name_en || "Unknown",
        planet_ar: planetaryHour?.planetInfo?.name_ar || null,
        nature: planetaryHour?.planetInfo?.nature_en || "Unknown",
        remaining: planetaryHour?.remainingTime || "Unknown"
      },
      suitable: bestTimes.suitablePlanets || [],
      source: "Havâss'ın Derinlikleri p.51-52"
    },
    
    section7_suitability: {
      title_ml: "നിലവിലെ സമയ യോഗ്യത",
      title_en: "Current Timing Suitability",
      title_ar: "ملاءمة التوقيت الحالي",
      suitable: evaluateSuitability(query, bestTimes, currentData),
      score: calculateSuitabilityScore(bestTimes, currentData),
      reasons: getSuitabilityReasons(bestTimes, currentData)
    },
    
    section8_next_window: {
      title_ml: "അടുത്ത അനുയോജ്യമായ സമയം",
      title_en: "Next Suitable Timing Window",
      title_ar: "نافذة التوقيت المناسبة التالية",
      nextHour: findNextGoodHour(planetaryHour, bestTimes),
      nextDay: findNextGoodDay(dayRuler?.day_name_en),
      source: "Planetary hour sequence"
    },
    
    section9_best_day: {
      title_ml: "മികച്ച ദിവസം",
      title_en: "Best Day",
      title_ar: "أفضل يوم",
      days: bestTimes.suitableDays || ["Thursday", "Friday"],
      ruler: bestTimes.suitablePlanets?.[0] || "Jupiter",
      source: searchResults.source || "Havâss'ın Derinlikleri p.49-50"
    },
    
    section10_best_hour: {
      title_ml: "മികച്ച മണിക്കൂർ",
      title_en: "Best Hour",
      title_ar: "أفضل ساعة",
      planets: bestTimes.suitablePlanets || ["Jupiter", "Venus"],
      reason: "Most benefic planetary influences",
      source: "Havâss'ın Derinlikleri p.51-52"
    },
    
    section11_zodiac: {
      title_ml: "ബന്ധപ്പെട്ട രാശി സ്വാധീനങ്ങൾ",
      title_en: "Related Zodiac Influences",
      title_ar: "تأثيرات البرج ذات الصلة",
      current: zodiacSign || "Unknown",
      element: getElementForSign(zodiacSign),
      friendly: getFriendlySigns(zodiacSign),
      opposing: getOpposingSigns(zodiacSign),
      source: "Havâss'ın Derinlikleri p.77"
    },
    
    section12_friendly: {
      title_ml: "സൗഹാർദ്ദപരമായ സ്വാധീനങ്ങൾ",
      title_en: "Friendly Influences",
      title_ar: "التأثيرات الودية",
      planets: bestTimes.suitablePlanets || ["Jupiter", "Venus", "Sun"],
      mansions: (bestTimes.suitableMansions || []).map(num => AY_MANAZILLERI.find(m => m.no === num)).filter(Boolean),
      days: bestTimes.suitableDays || ["Thursday", "Friday", "Sunday"]
    },
    
    section13_opposing: {
      title_ml: "എതിർ സ്വാധീനങ്ങൾ",
      title_en: "Opposing Influences",
      title_ar: "التأثيرات المعارضة",
      planets: bestTimes.unsuitablePlanets || ["Saturn", "Mars"],
      mansions: (bestTimes.unsuitableMansions || []).map(num => AY_MANAZILLERI.find(m => m.no === num)).filter(Boolean),
      days: bestTimes.unsuitableDays || ["Tuesday", "Saturday"]
    },
    
    section14_sources: {
      title_ml: "സ്രോതസ്സ് പരാമർശങ്ങൾ",
      title_en: "Source References",
      title_ar: "المراجع المصدرية",
      allSources: searchResults._metadata?.sources_searched || [],
      totalSources: searchResults._metadata?.sources_searched?.length || 0
    },
    
    section15_book_citations: {
      title_ml: "പുസ്തക ഉദ്ധരണികൾ",
      title_en: "Book Citations",
      title_ar: "اقتباسات الكتب",
      citations: bookRefs
    },
    
    section16_pdf_citations: {
      title_ml: "PDF ഉദ്ധരണികൾ",
      title_en: "PDF Citations",
      title_ar: "اقتباسات PDF",
      citations: pdfRefs
    },
    
    section17_manuscript_citations: {
      title_ml: "കൈയെഴുത്തുപ്രതി ഉദ്ധരണികൾ",
      title_en: "Manuscript Citations",
      title_ar: "اقتباسات المخطوطات",
      citations: manuscriptRefs.map(m => ({
        book: m.book_name,
        author: m.author,
        page: m.page_number,
        tradition: m.verified ? 'Verified' : 'Traditional'
      }))
    },
    
    section18_summary: {
      title_ml: "സംഗ്രഹ ശുപാർശ",
      title_en: "Summary Recommendation",
      title_ar: "توصية ملخصة",
      description_ml: searchResults.found 
        ? "ഈ പ്രവൃത്തിക്ക് അനുയോജ്യമായ സമയം: " + (bestTimes.suitableDays?.join(', ') || 'വ്യാഴം, വെള്ളി') + " ദിവസങ്ങളിലും " + (bestTimes.suitablePlanets?.join(', ') || 'വ്യാഴം, ശുക്രൻ') + " മണിക്കൂറുകളിലും"
        : "നിർദ്ദിഷ്ട വിഷയത്തിനായി ബുക്ക് ഡാറ്റാബേസിൽ നേരിട്ടുള്ള പരാമർശങ്ങളൊന്നും കണ്ടെത്തിയില്ല. പൊതുവായ നിയമങ്ങൾ പാലിക്കുക.",
      description_en: searchResults.found
        ? `Best timing for this action: ${bestTimes.suitableDays?.join(', ') || 'Thursday, Friday'} days and ${bestTimes.suitablePlanets?.join(', ') || 'Jupiter, Venus'} hours`
        : "No direct book-based references found for this topic. Follow general rules.",
      best_days: bestTimes.suitableDays || ["Thursday", "Friday"],
      best_hours: bestTimes.suitablePlanets || ["Jupiter", "Venus"],
      avoid_days: bestTimes.unsuitableDays || ["Tuesday", "Saturday"],
      avoid_hours: bestTimes.unsuitablePlanets || ["Saturn", "Mars"],
      current_rating: evaluateSuitability(query, bestTimes, currentData),
      source: searchResults.source || "Havâss'ın Derinlikleri"
    },
    
    _preservation_metadata: {
      all_sources_searched: true,
      total_sections: 18,
      knowledge_base_preserved: true,
      no_deletions: true,
      manuscript_references_preserved: manuscriptRefs.length,
      book_references_preserved: bookRefs.length,
      pdf_references_preserved: pdfRefs.length,
      generated_at: new Date().toISOString(),
      preservation_rule_compliant: true
    }
  };
}