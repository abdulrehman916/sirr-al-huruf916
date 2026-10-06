import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { KNOWLEDGE_DAYS, KNOWLEDGE_LUNAR_MANSIONS } from "@/lib/astroClockKnowledgeBase.js";
import { AY_MANAZILLERI, PLANETARY_DAY_RULERS } from "@/lib/astroClockData.js";
import { Sun, Moon, Star, Clock, AlertCircle, CheckCircle } from "lucide-react";

export default function TodayAnalysis() {
  const { isMalayalam, t } = useAstroClockLanguage();
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calculate today's astrological data
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // Console trace for debugging
    console.log("[TodayAnalysis] Day of week:", dayOfWeek, ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayOfWeek]);
    console.log("[TodayAnalysis] PLANETARY_DAY_RULERS loaded:", PLANETARY_DAY_RULERS?.length || 0);
    
    // Get planetary ruler for today
    const dayRuler = PLANETARY_DAY_RULERS.find(d => {
      const dayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(d.day_name_en);
      return dayIndex === dayOfWeek;
    });
    
    console.log("[TodayAnalysis] Day ruler found:", dayRuler ? dayRuler.day_name_en : "NOT FOUND");

    // Get current hour's planetary ruler (simplified)
    const currentHour = now.getHours();
    const hourRulerIndex = (dayOfWeek + currentHour) % 7;
    const planetarySequence = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
    const currentPlanet = planetarySequence[hourRulerIndex];

    // Get moon mansion (simplified - would need real calculation)
    const moonMansion = AY_MANAZILLERI[0]; // Placeholder

    // Defensive checks - show fallback if data unavailable
    if (!dayRuler) {
      console.error("TodayAnalysis: Day ruler not found for day", dayOfWeek);
      setTodayData(null);
      setLoading(false);
      return;
    }

    if (!moonMansion) {
      console.error("TodayAnalysis: Moon mansion data not available");
      setTodayData(null);
      setLoading(false);
      return;
    }

    setTodayData({
      date: now,
      dayOfWeek: dayRuler.day_name_en || "Unknown",
      dayRuler: dayRuler.planet_tr || "Unknown",
      dayRulerSymbol: dayRuler.symbol || "",
      currentPlanet,
      currentHour,
      moonMansion: moonMansion.name || "Unknown",
      moonMansionNo: moonMansion.no || 0,
      moonPhase: "Waxing", // Placeholder
      zodiacSign: "Aries", // Placeholder
      star: "Ashwini" // Placeholder
    });
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border p-6" style={{
        background: "rgba(8,18,44,0.95)",
        borderColor: "rgba(212,175,55,0.20)"
      }}>
        <div className="animate-pulse h-6 bg-white/10 rounded w-32 mb-4"></div>
        <div className="space-y-2">
          <div className="animate-pulse h-4 bg-white/10 rounded w-full"></div>
          <div className="animate-pulse h-4 bg-white/10 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!todayData) {
    return (
      <div className="rounded-xl border p-6 text-center" style={{
        background: "rgba(8,18,44,0.95)",
        borderColor: "rgba(212,175,55,0.20)"
      }}>
        <AlertCircle className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(255,255,255,0.40)" }} />
        <p className="font-inter text-sm mb-1" style={{ color: "rgba(255,255,255,0.70)" }}>
          {isMalayalam ? "ഇന്നത്തെ വിശകലനം ലഭ്യമല്ല" : "Today's Analysis Not Available"}
        </p>
        <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>
          {isMalayalam ? "ഇന്നത്തെ ഉറവിട ഡാറ്റ ലഭ്യമല്ല" : "Today's reference data not available"}
        </p>
      </div>
    );
  }

  // Generate GOOD FOR / AVOID / NEUTRAL lists from book data
  const dayRuler = todayData.dayRuler || "Unknown";
  const goodFor = dayRuler === "Güneş" 
    ? ["Leadership", "Success", "Authority meetings", "Friendship"]
    : dayRuler === "Ay"
    ? ["Travel", "Water activities", "Love", "Dreams"]
    : dayRuler === "Mars"
    ? ["Competition", "Sports", "Courage"]
    : dayRuler === "Merkür"
    ? ["Business", "Communication", "Learning"]
    : dayRuler === "Jüpiter"
    ? ["Wealth", "Knowledge", "Friendship"]
    : dayRuler === "Venüs"
    ? ["Love", "Beauty", "Entertainment"]
    : ["Discipline", "Long-term planning"];

  const avoid = dayRuler === "Güneş"
    ? ["Hidden activities", "Solitude"]
    : dayRuler === "Ay"
    ? ["Confrontations", "Major decisions"]
    : dayRuler === "Mars"
    ? ["Peace negotiations", "Romance"]
    : dayRuler === "Merkür"
    ? ["Physical labor"]
    : dayRuler === "Jüpiter"
    ? ["Short-term thinking"]
    : dayRuler === "Venüs"
    ? ["Serious business", "Conflict"]
    : ["New beginnings", "Social events"];

  const neutral = ["Routine work", "Rest", "Observation"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border p-5 space-y-4"
      style={{
        background: "linear-gradient(145deg, rgba(8,18,44,0.98) 0%, rgba(4,10,28,0.99) 100%)",
        borderColor: "rgba(212,175,55,0.25)"
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
        <Sun className="w-5 h-5" style={{ color: "#D4AF37" }} />
        <h3 className="font-inter text-sm font-bold uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.80)" }}>
          {isMalayalam ? "ഇന്നത്തെ വിശകലനം" : "Today's Analysis"}
        </h3>
      </div>

      {/* Current Influences Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Day Ruler */}
        <div className="p-3 rounded-lg" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.20)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
            <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.60)" }}>
              {isMalayalam ? "ദിവസ നാഥൻ" : "Day Ruler"}
            </span>
          </div>
          <p className="font-amiri text-base font-bold" style={{ color: "#F5D060" }}>
            {todayData.dayRuler}
          </p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            {todayData.dayOfWeek}
          </p>
        </div>

        {/* Current Planet */}
        <div className="p-3 rounded-lg" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.20)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />
            <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: "rgba(96,165,250,0.60)" }}>
              {isMalayalam ? "നിലവിലെ ഗ്രഹം" : "Current Planet"}
            </span>
          </div>
          <p className="font-inter text-base font-bold" style={{ color: "#93c5fd" }}>
            {todayData.currentPlanet}
          </p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            {isMalayalam ? `${todayData.currentHour}:00 മണി` : `Hour ${todayData.currentHour}`}
          </p>
        </div>

        {/* Moon Mansion */}
        <div className="p-3 rounded-lg" style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.20)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-3.5 h-3.5" style={{ color: "#a855f7" }} />
            <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: "rgba(168,85,247,0.60)" }}>
              {isMalayalam ? "ചന്ദ്ര മൻസിൽ" : "Moon Mansion"}
            </span>
          </div>
          <p className="font-inter text-base font-bold" style={{ color: "#d8b4fe" }}>
            {todayData.moonMansion}
          </p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            #{todayData.moonMansionNo}
          </p>
        </div>

        {/* Moon Phase */}
        <div className="p-3 rounded-lg" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.20)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Moon className="w-3.5 h-3.5" style={{ color: "#4ade80" }} />
            <span className="font-inter text-[10px] uppercase tracking-wider" style={{ color: "rgba(74,222,128,0.60)" }}>
              {isMalayalam ? "ചന്ദ്ര കല" : "Moon Phase"}
            </span>
          </div>
          <p className="font-inter text-base font-bold" style={{ color: "#86efac" }}>
            {todayData.moonPhase}
          </p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            {isMalayalam ? "വളരുന്നു" : "Waxing"}
          </p>
        </div>
      </div>

      {/* GOOD FOR Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4" style={{ color: "#4ade80" }} />
          <span className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.80)" }}>
            {isMalayalam ? "ഉത്തമം" : "GOOD FOR"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {goodFor.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: "rgba(74,222,128,0.10)",
                color: "#4ade80",
                border: "1px solid rgba(74,222,128,0.20)"
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* AVOID Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4" style={{ color: "#f87171" }} />
          <span className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.80)" }}>
            {isMalayalam ? "ഒഴിവാക്കുക" : "AVOID"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {avoid.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: "rgba(248,113,113,0.10)",
                color: "#f87171",
                border: "1px solid rgba(248,113,113,0.20)"
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* NEUTRAL Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sun className="w-4 h-4" style={{ color: "#fbbf24" }} />
          <span className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.80)" }}>
            {isMalayalam ? "സാധാരണം" : "NEUTRAL"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {neutral.map((item, idx) => (
            <span
              key={idx}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: "rgba(251,191,36,0.10)",
                color: "#fbbf24",
                border: "1px solid rgba(251,191,36,0.20)"
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Source Reference */}
      <div className="pt-3 border-t" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
        <div className="flex items-start gap-2">
          <Star className="w-3.5 h-3.5 mt-0.5" style={{ color: "rgba(212,175,55,0.60)" }} />
          <div>
            <p className="font-inter text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(212,175,55,0.50)" }}>
              {isMalayalam ? "സ്രോതസ്സ്" : "Source Reference"}
            </p>
            <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>
              Havâss'ın Derinlikleri p.50-51
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}