// ═══════════════════════════════════════════════════════════════
// RITUAL TIMING ANALYSIS — Expert Panel (Read-only)
// Attached at the bottom of Mizaan9Page. NEVER modifies Mizan logic.
// Full i18n: English / Malayalam via shared useRitualLang() state.
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, Clock, Moon, Compass, AlertTriangle, BookOpen,
  Sparkles, Sun, Sunset, Star, Zap, Shield, Globe,
  CheckCircle2, XCircle, AlertCircle,
} from "lucide-react";
import { analyzeRitualTiming } from "../../lib/ritualTimingEngineV3";
import { localizeAnalysis, tStr, tPlanet, tDay, tStatus, useRitualLang, RITUAL_LANGS } from "../../lib/ritualTimingI18n";
import { useAstroClockKnowledgeAll } from "../../hooks/useAstroClockKnowledgeAll";
import { usePurposeActionKeywords } from "../../hooks/usePurposeActionKeywords";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

// ── Normalize V3 engine output → shape expected by the original stacked-card UI ──
function normalizeForUI(v3) {
  if (!v3) return v3;
  return {
    ...v3,
    canPerformTodayReason: v3.canPerformTodayReason || "",
    recommendedStartReason: v3.recommendedStartReason || v3.bestWindowsToday?.[0]?.reason || "",
    zodiacSuitability: {
      ...v3.zodiacSuitability,
      bestSigns: (v3.zodiacSuitability?.bestSigns || []).map(s =>
        typeof s === "string" ? { sign: s, hour: [] } : s
      ),
    },
    elementCompatibility: {
      ...v3.elementCompatibility,
      element: v3.elementCompatibility?.element || "",
      elementNature: v3.elementCompatibility?.elementNature || "",
      citation: v3.elementCompatibility?.citation || "",
    },
    elementDirection: v3.elementDirection ? { ...v3.elementDirection, ar: v3.elementDirection.ar || "" } : null,
    elementPlacement: v3.elementPlacement || { placement: "", ar: "" },
  };
}

// ── Inline translation helpers for RitualTimingAnalysis ──
const ML_KHAYR = { "Not selected": "തിരഞ്ഞെടുത്തിട്ടില്ല", "khayr": "ഖൈർ", "sharr": "ശർ" };
const ML_KHAYR_M = { "Benevolence": "ഐശ്വര്യം", "Power/Banishment": "ശക്തി/നിരസനം", "Not determined": "നിർണ്ണയിച്ചിട്ടില്ല", "Not selected": "തിരഞ്ഞെടുത്തിട്ടില്ല" };
const ML_DN_STATUS = {
  optimal: "ഉത്തമം (രാത്രി)",
  good: "നല്ലത് (രാത്രി)",
  acceptable: "സ്വീകാര്യം (പകൽ)",
  forbidden: "നിരോധിതം (പകൽ)",
  neutral: "നിഷ്പക്ഷം",
};
const ML_DN_REASON = {
  "Night, as required.": "രാത്രി, ആവശ്യപ്പെട്ടതുപോലെ.",
  "Day, but night required.": "പകൽ, എന്നാൽ രാത്രി ആവശ്യം.",
  "No night restriction in manuscripts.": "ഗ്രന്ഥങ്ങളിൽ രാത്രി നിർബന്ധമില്ല.",
};
const ML_ELEM_STATUS = { aligned: "യോജിച്ചത്", neutral: "നിഷ്പക്ഷം" };
const ML_ELEM_NATURE = { hot: "ചൂട്", cold: "തണുപ്പ്", dry: "വരണ്ടത്", wet: "നനഞ്ഞത്", hot_dry: "ചൂട്-വരണ്ടത്", hot_wet: "ചൂട്-നനഞ്ഞത്", cold_dry: "തണുപ്പ്-വരണ്ടത്", cold_wet: "തണുപ്പ്-നനഞ്ഞത്" };
const ML_ELEM_REASON = {
  "No element restriction in manuscripts for this ritual.": "ഈ കർമ്മത്തിന് ഗ്രന്ഥങ്ങളിൽ മൂലക നിർബന്ധമില്ല.",
  "Your element matches the manuscript.": "നിങ്ങളുടെ മൂലകം ഗ്രന്ഥവുമായി യോജിക്കുന്നു.",
};
const ML_ZODIAC_NOTE = {
  "No zodiac restriction in manuscripts.": "ഗ്രന്ഥങ്ങളിൽ രാശി നിർബന്ധമില്ല.",
};
const ML_INCENSE = { "Aloe wood (Oud)": "ഉദ് (കരിങ്കാറ്റിൽ)", "Frankincense": "കുന്തുരുവം", "Mastic": "മസ്റ്റിക്", "Saffron": "കുങ്കുമപ്പൂവ്", "Sandalwood": "ചന്ദനം" };
const ML_DIRECTION = { North: "വടക്ക്", South: "തെക്ക്", East: "കിഴക്ക്", West: "പടിഞ്ഞാറ്", "North-East": "വടക്ക്-കിഴക്ക്", "North-West": "വടക്ക്-പടിഞ്ഞാറ്", "South-East": "തെക്ക്-കിഴക്ക്", "South-West": "തെക്ക്-പടിഞ്ഞാറ്" };
const ML_PLACEMENT = {
  "Above threshold": "തിരശ്ശീലയ്ക്ക് മുകളിൽ",
  "Below threshold": "തിരശ്ശീലയ്ക്ക് താഴെ",
  "Right of threshold": "തിരശ്ശീലയ്ക്ക് വലതുഭാഗത്ത്",
  "Left of threshold": "തിരശ്ശീലയ്ക്ക് ഇടതുഭാഗത്ത്",
};

export default function RitualTimingAnalysis({ result, selections, customPurpose, activeMethod, purposeLookup }) {
  const [expanded, setExpanded] = useState(false);
  const [lang, setLang] = useRitualLang();
  const { astroClockKnowledge } = useAstroClockKnowledgeAll();
  const { purposeKeywords } = usePurposeActionKeywords();

  // purposeLookup comes from the Purpose Interpretation card (single source of truth).
  // Ritual Timing NEVER analyzes Arabic — it consumes the interpreted meaning directly.
  const resolvedPurpose = purposeLookup || { matched: false };

  const effectiveSelections = useMemo(() => {
    if (resolvedPurpose.matched && resolvedPurpose.ritualIntent) {
      const hasCard = Array.isArray(selections?.purposes) && selections.purposes.length > 0;
      if (!hasCard) return { ...selections, purposes: [resolvedPurpose.ritualIntent] };
    }
    return selections;
  }, [selections, resolvedPurpose]);

  const rawAnalysis = useMemo(() => {
    if (!result) return null;
    const raw = analyzeRitualTiming({ result, selections: effectiveSelections, customPurpose, activeMethod, astroClockKnowledge, purposeLookup: resolvedPurpose, purposeKeywords });
    return normalizeForUI(raw);
  }, [result, effectiveSelections, customPurpose, activeMethod, astroClockKnowledge, resolvedPurpose, purposeKeywords]);

  const analysis = useMemo(() => rawAnalysis ? localizeAnalysis(rawAnalysis, lang) : null, [rawAnalysis, lang]);

  if (!analysis) return null;

  // Inline translation helper
  const t = (en, ml) => lang === "ml" ? ml : en;
  const tVal = (val, map) => lang === "ml" ? (map[val] || val) : val;

  const canPerformColor = rawAnalysis.canPerformToday === 'Yes' ? '#4ADE80' : rawAnalysis.canPerformToday === 'Limited' ? '#FBBF24' : '#F87171';
  const CanPerformIcon = rawAnalysis.canPerformToday === 'Yes' ? CheckCircle2 : rawAnalysis.canPerformToday === 'Limited' ? AlertCircle : XCircle;

  // Translate long sentence fields inline
  // verdictReason is ORIGINAL Astro Clock text — never translated or overridden
  const tDNReason = (val) => lang === "ml" ? (ML_DN_REASON[val] || val) : val;
  const tElemReason = (val) => {
    if (lang !== "ml") return val;
    if (ML_ELEM_REASON[val]) return ML_ELEM_REASON[val];
    if (val && val.startsWith("The manuscripts recommend the")) {
      return val.replace("The manuscripts recommend the", "ഗ്രന്ഥങ്ങൾ ശുപാർശ ചെയ്യുന്നത്")
        .replace("element for this work", "മൂലകമാണ് ഈ കർമ്മത്തിന്");
    }
    return val;
  };
  const tZodiacNote = (val) => {
    if (lang !== "ml") return val;
    if (ML_ZODIAC_NOTE[val]) return ML_ZODIAC_NOTE[val];
    if (val && val.startsWith("The manuscripts prescribe zodiac")) {
      return val.replace("The manuscripts prescribe zodiac", "ഗ്രന്ഥങ്ങൾ നിർദ്ദേശിക്കുന്ന രാശി")
        .replace("sign(s):", "(ങ്ങൾ):");
    }
    return val;
  };
  const tHourReason = (val) => {
    if (lang !== "ml") return val;
    if (!val) return val;
    if (val.startsWith("No hour restriction")) return "ഗ്രന്ഥങ്ങളിൽ മണിക്കൂർ നിർബന്ധമില്ല.";
    if (val.startsWith("Manuscript prescribes")) return val.replace("Manuscript prescribes", "ഗ്രന്ഥങ്ങൾ നിർദ്ദേശിക്കുന്നത്").replace("hour(s)", "മണിക്കൂർ(ങ്ങൾ)");
    return val;
  };
  const tDayReason = (val) => {
    if (lang !== "ml") return val;
    if (!val) return val;
    if (val.startsWith("No day restriction")) return "ഗ്രന്ഥങ്ങളിൽ ദിവസ നിർബന്ധമില്ല.";
    if (val.startsWith("Manuscript prescribes")) return val.replace("Manuscript prescribes", "ഗ്രന്ഥങ്ങൾ നിർദ്ദേശിക്കുന്നത്");
    return val;
  };
  const tIncense = (val) => lang === "ml" ? (ML_INCENSE[val] || val) : val;
  const tDirection = (val) => lang === "ml" ? (ML_DIRECTION[val] || val) : val;
  const tPlacement = (val) => lang === "ml" ? (ML_PLACEMENT[val] || val) : val;
  const tAstroSummary = (val) => {
    if (lang !== "ml") return val;
    // "Today is X, ruled by Y. Current hour #Z (P), day/night, T left. Moon: day D (phase)."
    return val
      .replace("Today is", "ഇന്ന്")
      .replace("ruled by", "ഭരണം")
      .replace("Current hour #", "നിലവിലെ മണിക്കൂർ #")
      .replace("left", "ബാക്കി")
      .replace("Moon: day", "ചന്ദ്രൻ: ദിവസം")
      .replace("day", "പകൽ")
      .replace("night", "രാത്രി");
  };

  return (
    <div className="mt-4">
      <div className="rounded-2xl overflow-hidden" style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${G.border}`,
        boxShadow: "0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.08)",
      }}>

        {/* ── Header ── */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4"
          style={{ borderBottom: expanded ? `1px solid ${G.border}` : "none" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
              background: G.bgHi, border: `1px solid ${G.borderHi}`,
            }}>
              <Sparkles className="w-5 h-5" style={{ color: G.text }} />
            </div>
            <div className="text-left">
              <h3 className="font-inter text-sm font-bold" style={{ color: "#fff" }}>
                {tStr("timingTitle", lang)}
              </h3>
              <p className="font-inter text-[10px]" style={{ color: G.dim }}>
                تحليل توقيت العمل الروحاني
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {RITUAL_LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className="px-1.5 py-0.5 rounded font-inter text-[9px] font-bold transition"
                  style={{
                    background: lang === l.code ? "rgba(212,175,55,0.18)" : "transparent",
                    border: `1px solid ${lang === l.code ? G.borderHi : "rgba(212,175,55,0.25)"}`,
                    color: lang === l.code ? G.text : "rgba(255,255,255,0.40)",
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{
              background: `${analysis.verdictColor}15`, border: `1px solid ${analysis.verdictColor}50`,
            }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: analysis.verdictColor }} />
              <span className="font-inter text-xs font-bold" style={{ color: analysis.verdictColor }}>
                {analysis.verdict}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 transition-transform" style={{ color: G.dim, transform: expanded ? "rotate(180deg)" : "none" }} />
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-4">

                {/* ── No Purpose Selected Notice ── */}
                {analysis.noPurposeSelected && (
                  <div className="rounded-xl p-3 flex items-start gap-2.5" style={{
                    background: "rgba(251,191,36,0.06)",
                    border: "1px solid rgba(251,191,36,0.30)",
                  }}>
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#FBBF24" }} />
                    <div>
                      <p className="font-inter text-xs font-bold" style={{ color: "#FBBF24" }}>
                        {tStr("noPurposeNotice", lang)}
                      </p>
                      <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                        {tStr("noPurposeDesc", lang)}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Configuration Check: Is your current selection suitable? ── */}
                {analysis.selectionAnalysis && (
                  <div className="rounded-xl p-4" style={{
                    background: analysis.selectionAnalysis.suitable
                      ? "linear-gradient(135deg, rgba(74,222,128,0.08) 0%, rgba(74,222,128,0.02) 100%)"
                      : analysis.selectionAnalysis.purposeRequired
                        ? "rgba(251,191,36,0.06)"
                        : "linear-gradient(135deg, rgba(248,113,113,0.08) 0%, rgba(248,113,113,0.02) 100%)",
                    border: `1px solid ${analysis.selectionAnalysis.suitable ? "rgba(74,222,128,0.30)" : analysis.selectionAnalysis.purposeRequired ? "rgba(251,191,36,0.30)" : "rgba(248,113,113,0.30)"}`,
                  }}>
                    {/* Header: YES/NO */}
                    <div className="flex items-center gap-3 mb-3">
                      {analysis.selectionAnalysis.purposeRequired ? (
                        <AlertTriangle className="w-5 h-5" style={{ color: "#FBBF24" }} />
                      ) : analysis.selectionAnalysis.suitable ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: "#4ADE80" }} />
                      ) : (
                        <XCircle className="w-5 h-5" style={{ color: "#F87171" }} />
                      )}
                      <div className="flex-1">
                        <h4 className="font-inter text-sm font-bold" style={{ color: "#fff" }}>
                          {tStr("configCheck", lang)}
                        </h4>
                        <p className="font-inter text-xs" style={{
                          color: analysis.selectionAnalysis.suitable ? "#4ADE80" : analysis.selectionAnalysis.purposeRequired ? "#FBBF24" : "#F87171",
                        }}>
                          {analysis.selectionAnalysis.purposeRequired
                            ? tStr("purposeRequiredMsg", lang)
                            : `${tStr("currentSelectionQ", lang)} — ${analysis.selectionAnalysis.suitable ? tStr("yes", lang) : tStr("no", lang)}`
                          }
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    {!analysis.selectionAnalysis.purposeRequired && (
                      <p className="font-inter text-xs mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {analysis.selectionAnalysis.summary}
                      </p>
                    )}

                    {/* Decision Breakdown */}
                    {!analysis.selectionAnalysis.purposeRequired && analysis.selectionAnalysis.decisionBreakdown.length > 0 && (
                      <div className="space-y-1.5">
                        {analysis.selectionAnalysis.decisionBreakdown.map((item, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg p-2.5" style={{
                            background: item.status === "pass" ? "rgba(74,222,128,0.05)"
                              : item.status === "fail" ? "rgba(248,113,113,0.05)"
                              : "rgba(255,255,255,0.02)",
                            border: `1px solid ${item.status === "pass" ? "rgba(74,222,128,0.20)" : item.status === "fail" ? "rgba(248,113,113,0.20)" : "rgba(255,255,255,0.06)"}`,
                          }}>
                            <div className="flex-shrink-0 mt-0.5">
                              {item.status === "pass" ? (
                                <CheckCircle2 className="w-4 h-4" style={{ color: "#4ADE80" }} />
                              ) : item.status === "fail" ? (
                                <XCircle className="w-4 h-4" style={{ color: "#F87171" }} />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center" style={{ borderColor: "rgba(255,255,255,0.20)" }}>
                                  <div className="w-1 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.30)" }} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-inter text-xs font-bold" style={{ color: "#fff" }}>{item.label}</span>
                                <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
                                  {item.currentValue}
                                </span>
                              </div>
                              <p className="font-inter text-[11px]" style={{
                                color: item.status === "pass" ? "rgba(74,222,128,0.70)" : item.status === "fail" ? "rgba(248,113,113,0.70)" : "rgba(255,255,255,0.45)",
                              }}>
                                {item.reason}
                              </p>
                              {item.source && (
                                <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(212,175,55,0.45)" }}>
                                  {tStr("manuscriptSource", lang)}: {item.source}
                                </p>
                              )}
                              {item.recommended && (
                                <p className="font-inter text-[10px] mt-0.5 font-semibold" style={{ color: "#FBBF24" }}>
                                  {tStr("recommendedLbl", lang)}: {item.recommended}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Best Alternative */}
                    {!analysis.selectionAnalysis.purposeRequired && analysis.selectionAnalysis.bestAlternative && (
                      <div className="mt-3 rounded-lg p-3" style={{
                        background: "rgba(74,222,128,0.06)",
                        border: "1px solid rgba(74,222,128,0.25)",
                      }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="w-4 h-4" style={{ color: "#4ADE80" }} />
                          <span className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: "#4ADE80" }}>
                            {tStr("bestAlt", lang)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {analysis.selectionAnalysis.bestAlternative.day && (
                            <div>
                              <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{tStr("bestDayLbl", lang)}</p>
                              <p className="font-inter text-sm font-bold" style={{ color: "#4ADE80" }}>{analysis.selectionAnalysis.bestAlternative.day}</p>
                            </div>
                          )}
                          {analysis.selectionAnalysis.bestAlternative.hour && (
                            <div>
                              <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{tStr("bestHour", lang)}</p>
                              <p className="font-inter text-sm font-bold" style={{ color: "#4ADE80" }}>{analysis.selectionAnalysis.bestAlternative.hour}</p>
                            </div>
                          )}
                          {analysis.selectionAnalysis.bestAlternative.planet && (
                            <div>
                              <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{tStr("bestPlanet", lang)}</p>
                              <p className="font-inter text-sm font-bold" style={{ color: "#4ADE80" }}>{analysis.selectionAnalysis.bestAlternative.planet}</p>
                            </div>
                          )}
                          {analysis.selectionAnalysis.bestAlternative.timeWindow && (
                            <div>
                              <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{tStr("bestTime", lang)}</p>
                              <p className="font-inter text-sm font-bold" style={{ color: "#4ADE80" }}>{analysis.selectionAnalysis.bestAlternative.timeWindow}</p>
                            </div>
                          )}
                        </div>
                        {analysis.selectionAnalysis.bestAlternative.dayName && (
                          <p className="font-inter text-[10px] mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>
                            {analysis.selectionAnalysis.bestAlternative.dayName}
                            {analysis.selectionAnalysis.bestAlternative.isToday ? ` (${lang === "ml" ? "ഇന്ന്" : "today"})` : ""}
                          </p>
                        )}
                        <p className="font-inter text-[10px]" style={{ color: "rgba(74,222,128,0.65)" }}>
                          {analysis.selectionAnalysis.bestAlternative.reason}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Expert Narrative ── */}
                <div className="rounded-xl p-4" style={{
                  background: "linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(212,175,55,0.02) 100%)",
                  border: `1px solid ${G.border}`,
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-4 h-4" style={{ color: G.text }} />
                    <h4 className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: G.text }}>
                      {tStr("expertAssessment", lang)}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {analysis.expertNarrative.map((line, i) => (
                      <p key={i} className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                {/* ── Ritual Type & Khayr/Sharr ── */}
                <div className="grid grid-cols-2 gap-2">
                  <InfoCard icon={<Zap className="w-4 h-4" />} label={tStr("ritualType", lang)} value={analysis.ritualType} sub={analysis.ritualTypeDescription} />
                  <InfoCard icon={<Shield className="w-4 h-4" />} label={tStr("khayrSharr", lang)} value={tVal(analysis.khayrSharr, ML_KHAYR)} sub={tVal(analysis.khayrSharrMeaning, ML_KHAYR_M)} />
                </div>

                {/* ── Verdict ── */}
                <div className="rounded-xl p-4" style={{
                  background: `${analysis.verdictColor}08`, border: `1px solid ${analysis.verdictColor}30`,
                }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" style={{ color: analysis.verdictColor }} />
                    <span className="font-inter text-sm font-bold" style={{ color: "#fff" }}>
                      {tStr("verdict", lang)}: {analysis.verdict}
                    </span>
                  </div>
                  <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
                    {analysis.verdictReason}
                  </p>
                </div>

                {/* ── Can Perform Today? ── */}
                <SectionRow icon={<CanPerformIcon className="w-4 h-4" />} title={tStr("canPerformQ", lang)}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: canPerformColor }} />
                    <span className="font-inter text-sm font-bold" style={{ color: canPerformColor }}>
                      {analysis.canPerformToday}
                    </span>
                  </div>
                  <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
                    {analysis.canPerformTodayReason}
                  </p>
                </SectionRow>

                {/* ── Recommended Start / End Time ── */}
                {analysis.recommendedStart && (
                  <SectionRow icon={<Clock className="w-4 h-4" />} title={tStr("recWindow", lang)}>
                    <div className="rounded-lg px-3 py-2.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-inter text-lg font-bold" style={{ color: G.text }}>
                          {analysis.recommendedStart} – {analysis.recommendedEnd}
                        </span>
                        {analysis.bestWindowsToday.length > 0 && (
                          <span className="font-inter text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.10)", color: "#4ADE80" }}>
                            {analysis.bestWindowsToday[0].planet} {tStr("hour", lang)}
                          </span>
                        )}
                      </div>
                      <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>
                        {tHourReason(analysis.recommendedStartReason)}
                      </p>
                    </div>
                  </SectionRow>
                )}

                {/* ── Best Planetary Hour & Ruling Planet ── */}
                <div className="grid grid-cols-2 gap-2">
                  <InfoCard icon={<Clock className="w-4 h-4" />} label={tStr("bestHour", lang)} value={analysis.bestPlanetaryHour || tStr("notSpecified", lang)} sub={tHourReason(analysis.bestHourReason)} />
                  <InfoCard icon={<Star className="w-4 h-4" />} label={tStr("bestPlanet", lang)} value={analysis.bestRulingPlanet || tStr("notSpecified", lang)} sub={tDayReason(analysis.bestDayReason)} />
                </div>
                {analysis.bestDay && (
                  <div className="text-center">
                    <span className="font-inter text-xs" style={{ color: G.dim }}>
                      {tStr("bestDayLbl", lang)}: <span style={{ color: G.text, fontWeight: 600 }}>{analysis.bestDay}</span>
                      {analysis.altDay && <> · {tStr("altLbl", lang)}: <span style={{ color: G.text }}>{analysis.altDay}</span></>}
                    </span>
                  </div>
                )}

                {/* ── Moon Phase ── */}
                <SectionRow icon={<Moon className="w-4 h-4" />} title={tStr("moonCond", lang)}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">
                      {analysis.moonPhase.isFullMoon ? "🌕" : analysis.moonPhase.isNewMoon ? "🌑" : analysis.moonPhase.isWaxing ? "🌒" : "🌘"}
                    </div>
                    <div>
                      <p className="font-inter text-sm font-bold" style={{ color: "#fff" }}>
                        {tStr("lunarDay", lang)} {analysis.moonPhase.lunarDay} — {analysis.moonPhase.phaseName}
                      </p>
                      <p className="font-inter text-[10px]" style={{ color: G.dim }}>
                        {analysis.moonPhase.citation}
                      </p>
                    </div>
                  </div>
                  <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
                    {analysis.moonPhase.assessment}
                  </p>
                </SectionRow>

                {/* ── Day/Night Suitability ── */}
                <SectionRow icon={analysis.dayNightSuitability.status === 'forbidden' ? <AlertTriangle className="w-4 h-4" /> : <Sun className="w-4 h-4" />} title={tStr("dayNightSuit", lang)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-inter text-sm font-bold" style={{
                      color: analysis.dayNightSuitability.status === 'optimal' ? '#4ADE80'
                        : analysis.dayNightSuitability.status === 'good' ? '#86EFAC'
                        : analysis.dayNightSuitability.status === 'acceptable' ? '#FBBF24'
                        : '#F87171',
                    }}>
                      {tVal(analysis.dayNightSuitability.status, ML_DN_STATUS)}
                    </span>
                  </div>
                  <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
                    {tDNReason(analysis.dayNightSuitability.reason)}
                  </p>
                  <p className="font-inter text-[10px] mt-1" style={{ color: G.dim }}>
                    {analysis.dayNightSuitability.citation}
                  </p>
                </SectionRow>

                {/* ── Zodiac Suitability ── */}
                {analysis.zodiacSuitability.assessed && (
                  <SectionRow icon={<Globe className="w-4 h-4" />} title={tStr("zodiacSuit", lang)}>
                    <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
                      {tZodiacNote(analysis.zodiacSuitability.note)}
                    </p>
                    {analysis.zodiacSuitability.bestSigns.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.zodiacSuitability.bestSigns.map((z, i) => (
                          <span key={i} className="font-inter text-[10px] px-2 py-1 rounded" style={{
                            background: G.bgHi, border: `1px solid ${G.border}`, color: G.text,
                          }}>
                            {z.sign} → {z.hour.join('/')}
                          </span>
                        ))}
                      </div>
                    )}
                  </SectionRow>
                )}

                {/* ── Element Compatibility ── */}
                {analysis.elementCompatibility.assessed && (
                  <SectionRow icon={<Compass className="w-4 h-4" />} title={tStr("elementCompat", lang)}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-inter text-sm font-bold" style={{
                        color: analysis.elementCompatibility.status === 'aligned' ? '#4ADE80' : '#FBBF24',
                      }}>
                        {tVal(analysis.elementCompatibility.status, ML_ELEM_STATUS)}
                      </span>
                      <span className="font-inter text-[10px] px-2 py-0.5 rounded" style={{ background: G.bg, color: G.dim, border: `1px solid ${G.border}` }}>
                        {analysis.elementCompatibility.element} ({tVal(analysis.elementCompatibility.elementNature, ML_ELEM_NATURE)})
                      </span>
                    </div>
                    <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.60)" }}>
                      {tElemReason(analysis.elementCompatibility.reason)}
                    </p>
                    <p className="font-inter text-[10px] mt-1" style={{ color: G.dim }}>
                      {analysis.elementCompatibility.citation}
                    </p>
                    {analysis.elementCompatibility.elementDirection && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="rounded-lg px-2.5 py-2" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{tStr("faceDir", lang)}</p>
                          <p className="font-inter text-sm font-bold" style={{ color: G.text }}>{tDirection(analysis.elementDirection.dir)}</p>
                          <p className="font-amiri text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>{analysis.elementDirection.ar}</p>
                        </div>
                        <div className="rounded-lg px-2.5 py-2" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                          <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{tStr("talismanPlace", lang)}</p>
                          <p className="font-inter text-xs font-bold" style={{ color: G.text }}>{tPlacement(analysis.elementPlacement.placement)}</p>
                          <p className="font-amiri text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>{analysis.elementPlacement.ar}</p>
                        </div>
                      </div>
                    )}
                  </SectionRow>
                )}

                {/* ── Current Astro Clock Status ── */}
                <SectionRow icon={<Sun className="w-4 h-4" />} title={tStr("currentAstro", lang)}>
                  <p className="font-inter text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {tAstroSummary(analysis.astroClockStatus.summary)}
                  </p>
                </SectionRow>

                {/* ── Best Windows Today ── */}
                {analysis.bestWindowsToday.length > 0 && (
                  <SectionRow icon={<Clock className="w-4 h-4" />} title={tStr("optimalHoursToday", lang)}>
                    <div className="space-y-1.5">
                      {analysis.bestWindowsToday.map((w, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{
                          background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.25)",
                        }}>
                          <div className="flex items-center gap-2">
                            <span className="font-inter text-sm font-bold" style={{ color: "#4ADE80" }}>
                              {w.startTime} – {w.endTime}
                            </span>
                            <span className="font-inter text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.10)", color: "#4ADE80" }}>
                              {w.planet}
                            </span>
                          </div>
                          <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                            {tStr("hour", lang)} #{w.hourNumber} · {w.period}
                          </span>
                        </div>
                      ))}
                    </div>
                  </SectionRow>
                )}

                {/* ── Avoid Windows ── */}
                {analysis.avoidWindowsToday.length > 0 && (
                  <SectionRow icon={<AlertTriangle className="w-4 h-4" />} title={tStr("avoidHoursToday", lang)}>
                    <div className="space-y-1.5">
                      {analysis.avoidWindowsToday.map((w, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2" style={{
                          background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.25)",
                        }}>
                          <div className="flex items-center gap-2">
                            <span className="font-inter text-sm font-bold" style={{ color: "#F87171" }}>
                              {w.startTime} – {w.endTime}
                            </span>
                            <span className="font-inter text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(248,113,113,0.10)", color: "#F87171" }}>
                              {w.planet}
                            </span>
                          </div>
                          <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                            {w.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </SectionRow>
                )}

                {/* ── Next Best Opportunity ── */}
                {analysis.nextOpportunity && (
                  <SectionRow icon={<Sunset className="w-4 h-4" />} title={tStr("nextBestTime", lang)}>
                    <div className="rounded-lg px-3 py-2.5" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-inter text-sm font-bold" style={{ color: G.text }}>
                          {analysis.nextOpportunity.dayName}
                        </span>
                        {!analysis.nextOpportunity.isToday && (
                          <span className="font-inter text-[10px] px-1.5 py-0.5 rounded" style={{ background: G.bgHi, color: G.dim }}>
                            {analysis.nextOpportunity.daysAhead} {tStr("daysAway", lang)}
                          </span>
                        )}
                      </div>
                      <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>
                        {analysis.nextOpportunity.startTime} – {analysis.nextOpportunity.endTime}
                      </p>
                      <p className="font-inter text-[10px] mt-1" style={{ color: G.dim }}>
                        {analysis.nextOpportunity.planet} {tStr("hour", lang)} · {tStr("hour", lang)} #{analysis.nextOpportunity.hour}
                      </p>
                    </div>
                  </SectionRow>
                )}

                {/* ── Warnings ── */}
                {analysis.warnings.length > 0 && (
                  <SectionRow icon={<AlertTriangle className="w-4 h-4" />} title={tStr("warningsForbidden", lang)}>
                    <div className="space-y-1.5">
                      {analysis.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg px-3 py-2" style={{
                          background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.25)",
                        }}>
                          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#F87171" }} />
                          <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.70)" }}>{w}</p>
                        </div>
                      ))}
                    </div>
                  </SectionRow>
                )}

                {/* ── Conflicting Rules ── */}
                {analysis.conflicts.length > 0 && (
                  <SectionRow icon={<AlertTriangle className="w-4 h-4" />} title={tStr("msConflicts", lang)}>
                    <div className="space-y-2">
                      {analysis.conflicts.map((c, i) => (
                        <div key={i} className="rounded-lg px-3 py-2" style={{
                          background: "rgba(249,168,212,0.06)", border: "1px solid rgba(249,168,212,0.25)",
                        }}>
                          <p className="font-inter text-[11px] mb-1" style={{ color: "#F9A8D4" }}>⚔ {tStr("conflict", lang)} {i + 1}</p>
                          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>Rule A: {c.rule1}</p>
                          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>Rule B: {c.rule2}</p>
                          <p className="font-inter text-[11px] mt-1.5 font-semibold" style={{ color: G.text }}>→ {c.resolution}</p>
                        </div>
                      ))}
                    </div>
                  </SectionRow>
                )}

                {/* ── Astrology Clock Context Records ── */}
                {analysis.rulesApplied.length > 0 && (
                  <SectionRow icon={<BookOpen className="w-4 h-4" />} title={lang === "ml" ? "ആസ്ട്രോ ക്ലോക്ക് കോൺടെക്സ്റ്റ്" : "Astrology Clock Context"}>
                    <div className="space-y-1">
                      {analysis.rulesApplied.map((r, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="font-inter text-[9px] font-mono px-1.5 py-0.5 rounded flex-shrink-0" style={{
                            background: G.bgHi, color: G.dim, border: `1px solid ${G.border}`,
                          }}>
                            {r.id}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.60)" }}>{r.desc}</p>
                            <p className="font-inter text-[9px]" style={{ color: G.dim }}>{r.source}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SectionRow>
                )}

                {/* ── Debug: Reasoning ── */}
                <details className="rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <summary className="cursor-pointer px-3 py-2 font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                    {tStr("reasoningLog", lang)} ({analysis.reasoning.length} {tStr("steps", lang)})
                  </summary>
                  <div className="px-3 pb-3 space-y-0.5">
                    {analysis.reasoning.map((r, i) => (
                      <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {i + 1}. {r}
                      </p>
                    ))}
                  </div>
                </details>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Collapsed Summary ── */}
        {!expanded && (
          <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
            <MiniBadge label={tStr("ritual", lang)} value={analysis.ritualType} color={G.text} />
            <MiniBadge label={tStr("today", lang)} value={analysis.canPerformToday} color={canPerformColor} />
            <MiniBadge label={tStr("hour", lang)} value={`#${analysis.astroClockStatus.currentHour.number} ${analysis.astroClockStatus.currentHour.planet}`} color={G.text} />
            <MiniBadge label={tStr("moon", lang)} value={`${tStr("lunarDay", lang)} ${analysis.moonPhase.lunarDay}`} color={G.text} />
            {analysis.elementDirection && <MiniBadge label={tStr("face", lang)} value={tDirection(analysis.elementDirection.dir)} color={G.text} />}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──
function SectionRow({ icon, title, children }) {
  return (
    <div className="rounded-xl p-3" style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.15)",
    }}>
      <div className="flex items-center gap-2 mb-2">
        <div style={{ color: G.dim }}>{icon}</div>
        <h4 className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: G.text }}>{title}</h4>
      </div>
      {children}
    </div>
  );
}

function InfoCard({ icon, label, value, sub }) {
  return (
    <div className="rounded-xl p-3" style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.15)",
    }}>
      <div className="flex items-center gap-1.5 mb-1">
        <div style={{ color: G.dim }}>{icon}</div>
        <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dim }}>{label}</p>
      </div>
      <p className="font-inter text-sm font-bold" style={{ color: "#fff" }}>{value}</p>
      {sub && <p className="font-inter text-[10px] mt-1 leading-tight" style={{ color: "rgba(255,255,255,0.40)" }}>{sub}</p>}
    </div>
  );
}

function MiniBadge({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.30)" }}>{label}:</span>
      <span className="font-inter text-[11px] font-bold" style={{ color }}>{value}</span>
    </div>
  );
}