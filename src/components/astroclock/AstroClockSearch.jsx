// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK SEARCH COMPONENT
// Search by activity/task/intention, day, or topic
// Uses existing ACTION_CATEGORIES data — no new data created
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { ACTION_CATEGORIES } from "@/lib/astroClockActionTimingRules.js";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  faint: "rgba(212,175,55,0.22)",
};

const SEARCHABLE_ACTIONS = Object.entries(ACTION_CATEGORIES).map(([key, data]) => ({
  key,
  ...data,
  searchableText: `${data.en.join(' ')} ${data.ml.join(' ')} ${data.arabic}`.toLowerCase()
}));

export default function AstroClockSearch({ onActionSelect }) {
  const { isMalayalam } = useAstroClockLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSearch = (input) => {
    setSearchInput(input);
    setShowResults(input.trim().length >= 2);
  };

  const filteredResults = searchInput.trim().length >= 2
    ? SEARCHABLE_ACTIONS.filter(action => action.searchableText.includes(searchInput.toLowerCase()))
    : [];

  const handleSelectAction = (action) => {
    setSelectedCategory(action.key);
    setSearchInput("");
    setShowResults(false);
    if (onActionSelect) onActionSelect(action.key);
  };

  const quickCategories = [
    { key: "MARRIAGE", icon: "💍", label: isMalayalam ? "വിവാഹം" : "Marriage" },
    { key: "BUSINESS", icon: "💼", label: isMalayalam ? "വ്യാപാരം" : "Business" },
    { key: "TRAVEL", icon: "✈️", label: isMalayalam ? "യാത്ര" : "Travel" },
    { key: "EDUCATION", icon: "📚", label: isMalayalam ? "പഠനം" : "Education" },
    { key: "HEALING", icon: "🌿", label: isMalayalam ? "ചികിത്സ" : "Healing" },
    { key: "LOVE", icon: "❤️", label: isMalayalam ? "പ്രണയം" : "Love" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 relative overflow-hidden mb-6"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`
      }}
    >
      <div className="flex items-center gap-3 mb-5">
        <Search className="w-6 h-6" style={{ color: G.text }} />
        <div>
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "തിരയുക" : "Search Astro Clock"}
          </h2>
          <p className="font-malayalam-sm" style={{ color: G.dim }}>
            {isMalayalam ? "പ്രവർത്തനം, ദിവസം, വിഷയം" : "Activity, Day, or Topic"}
          </p>
        </div>
      </div>

      <div className="mb-5">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: G.dim }} />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={isMalayalam ? "പ്രവർത്തനം ടൈപ്പ് ചെയ്യുക..." : "Type activity, day, or topic..."}
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

      <div>
        <p className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.dim }}>
          {isMalayalam ? "പെട്ടെന്ന് തിരഞ്ഞെടുക്കുക" : "Quick Select"}
        </p>
        <div className="flex flex-wrap gap-2">
          {quickCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => handleSelectAction(SEARCHABLE_ACTIONS.find(a => a.key === cat.key))}
              className="px-3 py-2 rounded-lg border text-xs font-bold transition-all hover:border-opacity-60"
              style={{
                background: selectedCategory === cat.key ? G.bgHi : G.bg,
                borderColor: selectedCategory === cat.key ? G.borderHi : G.faint,
                color: selectedCategory === cat.key ? G.text : "#fff"
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showResults && filteredResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 rounded-xl border overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
              borderColor: G.borderHi,
              maxHeight: "400px",
              overflowY: "auto"
            }}
          >
            {filteredResults.slice(0, 8).map((result, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectAction(result)}
                className="w-full px-4 py-3 text-left border-b last:border-0 hover:bg-white/5 transition-colors"
                style={{ borderColor: G.faint }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-amiri text-lg font-bold" style={{ color: G.text }}>{result.arabic}</p>
                    <p className="font-malayalam-sm text-white/80">{isMalayalam ? result.ml[0] : result.en[0]}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                      {result.source}
                    </p>
                    <p className="font-inter text-[8px]" style={{ color: G.dim }}>p.{result.pdf_pages}</p>
                  </div>
                </div>
              </button>
            ))}
            {filteredResults.length > 8 && (
              <div className="px-4 py-2 text-center text-xs" style={{ color: G.dim, background: G.bg }}>
                {filteredResults.length - 8} more results...
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}