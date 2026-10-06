import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, Calendar, Star, Moon, AlertTriangle, CheckCircle, XCircle, BookOpen, Info } from "lucide-react";
import { getTimingAdvice, findSimilarActions } from "@/lib/astroClockTimingAdvisor";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  glowHi: "rgba(212,175,55,0.55)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  success: "rgba(34,197,94,0.60)",
  danger: "rgba(239,68,68,0.60)",
  warning: "rgba(234,179,8,0.60)"
};

const QUICK_ACTIONS = [
  "Marriage", "Love", "Travel", "Business", "Vefk", "Healing",
  "Study", "Court", "Buy House", "Sell House", "Spiritual Work", "Photography"
];

export default function AdvancedTimingAdvisor() {
  const [action, setAction] = useState("");
  const [advice, setAdvice] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const similarActions = action.length >= 2 ? findSimilarActions(action) : [];

  const handleSearch = () => {
    if (!action.trim()) return;
    const result = getTimingAdvice(action);
    setAdvice(result);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border p-5"
        style={{
          background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
          borderColor: G.borderHi,
          boxShadow: `0 0 40px ${G.glow}, 0 4px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(212,175,55,0.10)`
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Search className="w-6 h-6" style={{ color: G.text }} />
          <h2 className="font-inter text-xl font-bold uppercase tracking-widest" style={{ color: G.text }}>
            ⏰ Advanced Timing Advisor
          </h2>
        </div>

        {/* Input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setShowSuggestions(e.target.value.length >= 2);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter your action (Marriage, Business, Travel, Vefk...)"
            className="w-full px-4 py-3 rounded-xl font-inter text-sm focus:outline-none"
            style={{
              background: "rgba(4,12,34,0.97)",
              border: `1px solid ${G.border}`,
              color: "#fff"
            }}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-inter text-xs font-semibold"
            style={{ background: G.bgHi, color: G.text, border: `1px solid ${G.border}` }}
          >
            Analyze
          </button>

          {/* Suggestions Dropdown */}
          {showSuggestions && similarActions.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-xl border p-2 z-50"
              style={{
                background: "rgba(4,12,34,0.99)",
                borderColor: G.border,
                boxShadow: "0 4px 20px rgba(0,0,0,0.60)"
              }}
            >
              {(similarActions || []).map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setAction(suggestion);
                    const result = getTimingAdvice(suggestion);
                    setAdvice(result);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg font-inter text-xs hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.70)" }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          {(QUICK_ACTIONS || []).map((quickAction) => (
            <button
              key={quickAction}
              onClick={() => {
                setAction(quickAction);
                const result = getTimingAdvice(quickAction);
                setAdvice(result);
              }}
              className="px-3 py-1.5 rounded-lg font-inter text-xs font-semibold transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.60)",
                border: `1px solid rgba(255,255,255,0.15)`
              }}
            >
              {quickAction}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Results */}
      {advice && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {!advice.found ? (
            <div className="rounded-2xl border p-6 text-center" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="font-inter text-sm text-white/50 mb-4">{advice.message}</p>
              {advice.suggestions && (
                <div className="space-y-3">
                  {(advice.suggestions?.suggestions || []).map((s, idx) => (
                    <div key={idx} className="p-3 rounded-lg" style={{ background: G.bg }}>
                      <p className="font-inter text-xs font-bold uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                        {s.category}
                      </p>
                      <p className="font-inter text-sm text-white/70">{s.advice}</p>
                      <p className="font-inter text-[10px] text-white/40 mt-1">Source: {s.source}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="rounded-xl border p-4" style={{ background: G.bg, borderColor: G.faint }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                      Action
                    </p>
                    <p className="font-inter text-lg font-bold text-white">{advice.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                      Rules Found
                    </p>
                    <p className="font-inter text-2xl font-bold" style={{ color: G.text }}>
                      {advice.totalRulesFound}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="rounded-2xl border p-5 space-y-4"
                style={{
                  background: "linear-gradient(145deg, rgba(8,18,44,0.98) 0%, rgba(4,10,28,0.99) 100%)",
                  borderColor: G.border
                }}
              >
                {/* Best Times */}
                <div className="grid grid-cols-2 gap-3">
                  <TimingCard
                    icon={Calendar}
                    title="Best Day"
                    value={advice.bestDay}
                    color={G.success}
                  />
                  <TimingCard
                    icon={Star}
                    title="Best Planet"
                    value={advice.bestPlanet}
                    color={G.success}
                  />
                  <TimingCard
                    icon={Clock}
                    title="Best Hour"
                    value={advice.bestHour}
                    color={G.success}
                  />
                  <TimingCard
                    icon={Moon}
                    title="Best Mansion"
                    value={advice.bestMansion}
                    color={G.success}
                  />
                </div>

                {/* Enemy Times */}
                {advice.enemyDay && (
                  <div className="p-4 rounded-xl border" style={{ background: "rgba(239,68,68,0.05)", borderColor: G.danger }}>
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-4 h-4" style={{ color: G.danger }} />
                      <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.danger }}>
                        Avoid These Times
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.danger }}>
                          Enemy Day
                        </p>
                        <p className="font-inter text-sm text-white/70">{advice.enemyDay}</p>
                      </div>
                      <div>
                        <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.danger }}>
                          Enemy Hour
                        </p>
                        <p className="font-inter text-sm text-white/70">{advice.enemyHour}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sources */}
                {advice.sources && advice.sources.length > 0 && (
                  <div className="p-4 rounded-xl border" style={{ background: G.bg, borderColor: G.faint }}>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4" style={{ color: G.dim }} />
                      <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.dim }}>
                        Source References
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {(advice.sources || []).map((source, idx) => (
                        <div key={idx} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <p className="font-inter text-sm text-white/70 mb-1">{source.book}</p>
                          {source.originalText && (
                            <p className="font-inter text-xs text-white/40 mb-2">{source.originalText}</p>
                          )}
                          {source.malayalamExplanation && (
                            <div className="p-2 rounded" style={{ background: "rgba(255,255,255,0.02)" }}>
                              <p className="font-inter text-xs text-white/60 mb-1">{source.malayalamTitle}</p>
                              <p className="font-inter text-xs text-white/50">{source.malayalamExplanation}</p>
                            </div>
                          )}
                          <p className="font-inter text-[10px] text-white/40 mt-2">Page {source.page}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

function TimingCard({ icon: Icon, title, value, color }) {
  if (!value) return null;
  return (
    <div className="p-3 rounded-lg border" style={{ background: "rgba(255,255,255,0.02)", borderColor: color }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3 h-3" style={{ color }} />
        <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>{title}</p>
      </div>
      <p className="font-inter text-sm font-bold text-white">{value}</p>
    </div>
  );
}