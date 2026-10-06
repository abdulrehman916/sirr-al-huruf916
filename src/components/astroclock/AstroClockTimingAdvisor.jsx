import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Clock, Calendar, Star, Moon, Shield, Zap, BookOpen, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { getTimingAdvice, findSimilarActions } from "@/lib/astroClockTimingAdvisor";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
  success:  "rgba(34,197,94,0.60)",
  danger:   "rgba(239,68,68,0.60)",
  warning:  "rgba(234,179,8,0.60)",
};

const QUICK_ACTIONS = [
  "Business", "Love", "Marriage", "Travel", "Spiritual Work",
  "Protection", "Wealth", "Vefk Writing", "Invocation", "Healing"
];

export default function AstroClockTimingAdvisor() {
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

  const handleQuickAction = (quickAction) => {
    setAction(quickAction);
    const result = getTimingAdvice(quickAction);
    setAdvice(result);
  };

  const renderSection = (title, items, IconComponent, color) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4" style={{ color }} />
          <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color }}>
            {title}
          </h3>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="p-3 rounded-lg border" style={{ background: G.bg, borderColor: G.faint }}>
              <p className="font-inter text-sm font-semibold text-white/90 mb-1">
                {item.name || item.hour || item.condition || item.ruling}
              </p>
              {item.planet && <p className="font-inter text-xs text-white/50">Planet: {item.planet}</p>}
              {item.ruler && <p className="font-inter text-xs text-white/50">Ruler: {item.ruler}</p>}
              {item.zodiacSign && <p className="font-inter text-xs text-white/50">Zodiac: {item.zodiacSign}</p>}
              {item.arabicLetter && <p className="font-amiri text-lg text-gold mt-1" dir="rtl">{item.arabicLetter}</p>}
              {item.malayalamExplanation && <p className="font-inter text-xs text-white/60 mt-2">{item.malayalamExplanation}</p>}
              {item.operations && item.operations.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {item.operations.map((op, i) => (
                    <li key={i} className="font-inter text-xs text-white/50">• {op}</li>
                  ))}
                </ul>
              )}
              {item.source && (
                <div className="mt-2 flex items-center gap-2 text-[10px] text-white/30">
                  <BookOpen className="w-3 h-3" />
                  <span>{item.source.book}, Page {item.source.page}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="rounded-2xl border p-4"
        style={{
          background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
          borderColor: G.borderHi,
          boxShadow: `0 0 40px ${G.glow}, 0 4px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(212,175,55,0.10)`,
        }}>
        
        <h2 className="font-inter text-lg font-bold uppercase tracking-widest mb-4" style={{ color: G.text }}>
          ⏰ Timing Advisor
        </h2>

        <div className="relative mb-4">
          <input
            type="text"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setShowSuggestions(e.target.value.length >= 2);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter your action (Business, Love, Travel...)"
            className="w-full px-4 py-3 rounded-xl font-inter text-sm focus:outline-none"
            style={{ background: "rgba(4,12,34,0.97)", border: `1px solid ${G.border}`, color: "#fff" }}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg"
            style={{ background: G.bg, border: `1px solid ${G.faint}` }}
          >
            <Search className="w-4 h-4" style={{ color: G.text }} />
          </button>

          {showSuggestions && similarActions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border p-2 z-50"
              style={{
                background: "rgba(4,12,34,0.99)",
                borderColor: G.border,
                boxShadow: "0 4px 20px rgba(0,0,0,0.60)"
              }}>
              {similarActions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => { setAction(suggestion); handleSearch(); }}
                  className="w-full text-left px-3 py-2 rounded-lg font-inter text-xs hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.70)" }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((quickAction) => (
            <button
              key={quickAction}
              onClick={() => handleQuickAction(quickAction)}
              className="px-3 py-1.5 rounded-lg font-inter text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.60)",
                border: `1px solid rgba(255,255,255,0.15)`
              }}>
              {quickAction}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {advice && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {!advice.found ? (
            <div className="rounded-2xl border p-6 text-center" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="font-inter text-sm text-white/50 mb-4">{advice.message}</p>
              {advice.suggestions && (
                <div className="space-y-3">
                  {advice.suggestions.suggestions.map((s, idx) => (
                    <div key={idx} className="p-3 rounded-lg" style={{ background: G.bg }}>
                      <p className="font-inter text-xs font-bold uppercase tracking-widest mb-1" style={{ color: G.dim }}>{s.category}</p>
                      <p className="font-inter text-sm text-white/70">{s.advice}</p>
                      <p className="font-inter text-[10px] text-white/40 mt-1">Source: {s.source}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-xl border p-4" style={{ background: G.bg, borderColor: G.faint }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>Action</p>
                    <p className="font-inter text-lg font-bold text-white">{advice.action}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>Rules Found</p>
                    <p className="font-inter text-lg font-bold" style={{ color: G.text }}>{advice.totalRulesFound}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border p-5 space-y-4"
                style={{ background: "linear-gradient(145deg, rgba(8,18,44,0.98) 0%, rgba(4,10,28,0.99) 100%)", borderColor: G.border }}>
                
                {renderSection("Best Days", advice.bestDays, Calendar, G.success)}
                {renderSection("Best Planets", advice.bestPlanets, Star, G.success)}
                {renderSection("Best Planetary Hours", advice.bestHours, Clock, G.success)}
                {renderSection("Best Lunar Mansions", advice.bestMansions, Moon, G.success)}
                {renderSection("Suitable Conditions", advice.suitableConditions, CheckCircle, G.success)}
                {renderSection("Unsuitable Conditions", advice.unsuitableConditions, AlertTriangle, G.danger)}
                {renderSection("Enemy Days (Avoid)", advice.enemyDays, XCircle, G.danger)}
                {renderSection("Enemy Hours (Avoid)", advice.enemyHours, Clock, G.danger)}

                {advice.disagreements && advice.disagreements.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" style={{ color: G.warning }} />
                      <h3 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.warning }}>
                        Source Disagreements
                      </h3>
                    </div>
                    {advice.disagreements.map((dis, idx) => (
                      <div key={idx} className="p-4 rounded-lg border" style={{ background: "rgba(234,179,8,0.05)", borderColor: G.warning }}>
                        <p className="font-inter text-sm font-bold text-white/80 mb-3">{dis.type} — {dis.category}</p>
                        <div className="grid grid-cols-1 gap-3">
                          {dis.opinion1 && (
                            <div className="p-3 rounded" style={{ background: "rgba(34,197,94,0.10)" }}>
                              <p className="font-inter text-xs font-bold text-green-400 mb-2">Opinion 1: {dis.opinion1.ruling}</p>
                              {dis.opinion1.sources && dis.opinion1.sources.map((s, i) => (
                                <p key={i} className="font-inter text-xs text-white/60">{s.text} — {s.book}, p.{s.page}</p>
                              ))}
                            </div>
                          )}
                          {dis.opinion2 && (
                            <div className="p-3 rounded" style={{ background: "rgba(239,68,68,0.10)" }}>
                              <p className="font-inter text-xs font-bold text-red-400 mb-2">Opinion 2: {dis.opinion2.ruling}</p>
                              {dis.opinion2.sources && dis.opinion2.sources.map((s, i) => (
                                <p key={i} className="font-inter text-xs text-white/60">{s.text} — {s.book}, p.{s.page}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {advice.sources && advice.sources.length > 0 && (
                  <div className="pt-4 border-t" style={{ borderColor: G.faint }}>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4" style={{ color: G.dim }} />
                      <h4 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.dim }}>
                        Source References
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {advice.sources.map((source, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div>
                            <p className="font-inter text-sm text-white/70">{source.book}</p>
                            {source.originalText && <p className="font-inter text-xs text-white/40 mt-1">{source.originalText}</p>}
                          </div>
                          <span className="font-inter text-xs font-bold" style={{ color: G.text }}>Page {source.page}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {advice.sources && advice.sources.some(s => s.malayalamExplanation) && (
                  <div className="p-4 rounded-xl" style={{ background: G.bg, border: `1px solid ${G.faint}` }}>
                    <h4 className="font-amiri text-lg font-bold mb-3" style={{ color: G.text }}>മലയാളം സംഗ്രഹം:</h4>
                    {advice.sources.filter(s => s.malayalamExplanation).slice(0, 3).map((source, idx) => (
                      <div key={idx} className="mb-3 last:mb-0">
                        <p className="font-inter text-sm text-white/80 mb-1">{source.malayalamTitle}</p>
                        <p className="font-inter text-xs text-white/60">{source.malayalamExplanation}</p>
                        <p className="font-inter text-[10px] text-white/40 mt-1">— {source.book}, Page {source.page}</p>
                      </div>
                    ))}
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