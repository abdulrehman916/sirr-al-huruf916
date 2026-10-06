// ═══════════════════════════════════════════════════════════════
// CONFIGURATION ADVISOR — Compares current Mizan selections vs manuscript
// recommendations. Renders Current / Recommended / Reason per field.
// Read-only: never changes Mizan — only explains what to change and why.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, CheckCircle2, AlertCircle, ArrowRight,
  Target, Scale, Calendar, Orbit, Clock, Flame, Sunset, Timer, Sparkles, Star,
} from "lucide-react";
import { tStr, RITUAL_LANGS } from "../../lib/ritualTimingI18n";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

const FIELD_ICONS = {
  target: Target,
  scale: Scale,
  calendar: Calendar,
  orbit: Orbit,
  clock: Clock,
  flame: Flame,
  sunset: Sunset,
  timer: Timer,
  sparkles: Sparkles,
  star: Star,
};

export default function ConfigurationAdvisor({ advice, lang = "ml", setLang, purposeLookup }) {
  const [expanded, setExpanded] = useState(true);
  // EXACT text from the Purpose Meaning box — never rebuilt or re-translated.
  // purposeLookup is passed from RitualDecisionEngine (resolved by PurposeInterpretationCard).
  const semanticPhrase = lang === "ml"
    ? (purposeLookup?.interpretation_ml || "")
    : (purposeLookup?.interpretation_en || "");

  if (!advice || !advice.recommendations) return null;

  const { recommendations, allOptimal } = advice;
  const improvements = recommendations.filter(r => !r.isOptimal);

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: "linear-gradient(145deg, rgba(10,22,48,0.98) 0%, rgba(6,14,32,0.99) 100%)",
      border: `1px solid ${G.borderHi}`,
      boxShadow: "0 4px 40px rgba(0,0,0,0.50), inset 0 1px 0 rgba(212,175,55,0.12), 0 0 24px rgba(212,175,55,0.10)",
    }}>
      {/* ── Header ── */}
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4" style={{ borderBottom: expanded ? `1px solid ${G.border}` : "none" }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{
            background: "linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(212,175,55,0.08) 100%)",
            border: `1px solid ${G.borderHi}`,
            boxShadow: "0 0 24px rgba(212,175,55,0.20)",
          }}>
            <Target className="w-5 h-5" style={{ color: G.text }} />
          </div>
          <div className="text-left">
            <h3 className="font-inter text-base font-bold tracking-wide" style={{ color: "#fff" }}>
              {tStr("advisorTitle", lang)}
            </h3>
            <p className="font-amiri text-sm" style={{ color: G.dim }}>
              مراجع تكوين الميزان
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {allOptimal ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.40)" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: "#4ADE80" }} />
              <span className="font-inter text-xs font-bold" style={{ color: "#4ADE80" }}>{tStr("optimal", lang)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.40)" }}>
              <AlertCircle className="w-4 h-4" style={{ color: "#FBBF24" }} />
              <span className="font-inter text-xs font-bold" style={{ color: "#FBBF24" }}>{improvements.length} {tStr("improvements", lang)}</span>
            </div>
          )}
          <ChevronDown className="w-4 h-4 transition-transform" style={{ color: G.dim, transform: expanded ? "rotate(180deg)" : "none" }} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="p-4 space-y-3">
              {/* ── Language toggle (English / Malayalam) ── */}
              {setLang && (
                <div className="flex items-center justify-end gap-1.5">
                  <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>Lang</span>
                  {RITUAL_LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className="px-2 py-0.5 rounded-md font-inter text-[10px] font-bold transition"
                      style={{
                        background: lang === l.code ? "rgba(212,175,55,0.18)" : "transparent",
                        border: `1px solid ${lang === l.code ? G.borderHi : G.border}`,
                        color: lang === l.code ? G.text : "rgba(255,255,255,0.45)",
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              )}
              {/* ── Intro statement ── */}
              <div className="rounded-xl p-3" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02))", border: `1px solid ${G.border}` }}>
                <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                  {allOptimal ? tStr("advisorIntroOptimal", lang) : tStr("advisorIntro", lang)}
                </p>
              </div>

              {/* ── Optimal banner ── */}
              {allOptimal && (
                <div className="rounded-xl p-4 text-center" style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.30)" }}>
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: "#4ADE80" }} />
                  <p className="font-inter text-sm font-bold" style={{ color: "#4ADE80" }}>
                    {tStr("optimalBanner", lang)}
                  </p>
                  <p className="font-inter text-xs mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>
                    {tStr("optimalSub", lang)}
                  </p>
                </div>
              )}

              {/* ── Per-field recommendations ── */}
              <div className="space-y-2">
                {improvements.map((rec, idx) => (
                  <AdvisorRow
                    key={idx}
                    rec={rec.field === "Ritual Purpose" && semanticPhrase
                      ? {
                          ...rec,
                          current: semanticPhrase,
                          recommended: semanticPhrase,
                          reason: lang === "ml"
                            ? `ഈ കർമ്മത്തിന്റെ ഉദ്ദേശം ${semanticPhrase} എന്നതാണ്.`
                            : `The intent of this ritual is: ${semanticPhrase}.`,
                        }
                      : rec}
                    lang={lang}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Single advisor row ──
function AdvisorRow({ rec, lang = "ml" }) {
  const Icon = FIELD_ICONS[rec.icon] || Target;
  const optimal = rec.isOptimal;

  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: optimal ? "rgba(74,222,128,0.04)" : "rgba(251,191,36,0.04)",
      border: `1px solid ${optimal ? "rgba(74,222,128,0.20)" : "rgba(251,191,36,0.25)"}`,
    }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3" style={{ borderBottom: `1px solid ${optimal ? "rgba(74,222,128,0.12)" : "rgba(251,191,36,0.15)"}` }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{
          background: optimal ? "rgba(74,222,128,0.10)" : "rgba(251,191,36,0.10)",
          border: `1px solid ${optimal ? "rgba(74,222,128,0.30)" : "rgba(251,191,36,0.35)"}`,
        }}>
          <Icon className="w-3.5 h-3.5" style={{ color: optimal ? "#4ADE80" : "#FBBF24" }} />
        </div>
        <h4 className="font-inter text-xs font-bold uppercase tracking-wider flex-1" style={{ color: "#fff" }}>
          {rec.field}
        </h4>
        {optimal
          ? <CheckCircle2 className="w-4 h-4" style={{ color: "#4ADE80" }} />
          : <AlertCircle className="w-4 h-4" style={{ color: "#FBBF24" }} />}
      </div>

      {/* Current → Recommended */}
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <span className="font-inter text-[9px] uppercase tracking-wider font-bold flex-shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.40)", minWidth: 64 }}>{tStr("current", lang)}</span>
          <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>{rec.current}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="font-inter text-[9px] uppercase tracking-wider font-bold flex-shrink-0 mt-0.5" style={{ color: optimal ? "#4ADE80" : "#FBBF24", minWidth: 64 }}>{tStr("recommend", lang)}</span>
          <div className="flex items-center gap-1.5 flex-1">
            {optimal && <ArrowRight className="w-3 h-3 flex-shrink-0" style={{ color: "#4ADE80" }} />}
            <p className="font-inter text-sm font-bold" style={{ color: optimal ? "#4ADE80" : "#FBBF24" }}>{rec.recommended}</p>
          </div>
        </div>

        {/* Reason */}
        <div className="rounded-lg p-2.5 mt-1" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>
            {rec.reason}
          </p>
        </div>
      </div>
    </div>
  );
}