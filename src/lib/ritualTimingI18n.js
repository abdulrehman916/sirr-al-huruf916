// ═══════════════════════════════════════════════════════════════
// RITUAL TIMING I18N — Astrology Clock Interpreter presentation layer
// Malayalam (default) + English. NO engine/logic changes.
//
// ARCHITECTURE: The engine is an Astrology Clock interpreter. The
// explanations come directly from the AstroClockKnowledge dataset.
// This I18n layer passes through the ORIGINAL Astro Clock text and
// only translates UI labels and section titles. It NEVER translates
// or overrides the Astro Clock's original explanations.
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";

export const RITUAL_LANGS = [
  { code: "ml", label: "Malayalam" },
  { code: "en", label: "English" },
];

const STORAGE_KEY = "ritualTimingLang";

export function useRitualLang() {
  const [lang, setLang] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      return "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    try { sessionStorage.setItem(STORAGE_KEY, lang); } catch {}
  }, [lang]);

  return [lang, setLang];
}

// ── Day / planet / element Malayalam names ──
const ML_DAY = {
  Sunday: "ഞായർ", Monday: "തിങ്കൾ", Tuesday: "ചൊവ്വ",
  Wednesday: "ബുധൻ", Thursday: "വ്യാഴം", Friday: "വെള്ളി", Saturday: "ശനി",
};
const ML_PLANET = {
  sun: "സൂര്യൻ", moon: "ചന്ദ്രൻ", mars: "ചൊവ്വ", mercury: "ബുധൻ",
  jupiter: "ഗുരു", venus: "ശുക്രൻ", saturn: "ശനി",
  Sun: "സൂര്യൻ", Moon: "ചന്ദ്രൻ", Mars: "ചൊവ്വ", Mercury: "ബുധൻ",
  Jupiter: "ഗുരു", Venus: "ശുക്രൻ", Saturn: "ശനി",
};
const ML_ELEMENT = { fire: "അഗ്നി", water: "ജലം", air: "വായു", earth: "ഭൂമി" };
const ML_PERIOD = { day: "പകൽ", night: "രാത്രി" };

// ── Ritual type labels ("X Work" → Malayalam) ──
const ML_RITUAL_TYPE = {
  "Love Work": "പ്രണയ കർമ്മം",
  "Separation Work": "വേർപിരിക്കൽ കർമ്മം",
  "Healing Work": "രോഗശാന്തി കർമ്മം",
  "Enemy Work": "ശത്രു കർമ്മം",
  "Protection Work": "സംരക്ഷണ കർമ്മം",
  "Wealth Work": "പണം നേടാനുള്ള കർമ്മം",
  "Knowledge Work": "ജ്ഞാന കർമ്മം",
  "Travel Work": "യാത്രാ കർമ്മം",
  "Planetary Work": "ഗ്രഹ കർമ്മം",
  "General Work": "പൊതുവായ ആധ്യാത്മിക കർമ്മം",
};

export function tRitualType(val, lang) {
  if (lang !== "ml" || !val) return val;
  return ML_RITUAL_TYPE[val] || val;
}

const ML_STATUS = {
  Yes: "അതെ", No: "ഇല്ല", Limited: "പരിമിതം",
  Suitable: "അനുയോജ്യം", "Not suitable": "അനുയോജ്യമല്ല",
  Excellent: "അത്യുത്തം", Good: "നല്ലത്", Acceptable: "സ്വീകാര്യം",
  Weak: "ദുർബലം", "Not Recommended": "ശുപാർശിക്കുന്നില്ല", Forbidden: "നിരോധിതം",
  "None remaining": "ബാക്കിയില്ല", "None identified": "ഒന്നുമില്ല",
};

const ML_VERDICT = {
  Suitable: "അനുയോജ്യം", "Not Suitable": "അനുയോജ്യമല്ല", Forbidden: "നിരോധിതം",
  Excellent: "അത്യുത്തം", Good: "നല്ലത്", Acceptable: "സ്വീകാര്യം",
  Weak: "ദുർബലം", "Not Recommended": "ശുപാർശിക്കുന്നില്ല",
};

const ML_SECTION_TITLE = {
  "TODAY ANALYSIS": "ഇന്നത്തെ അവസ്ഥ",
  "CURRENT MOMENT": "നിലവിലെ സമയം",
  "TODAY'S WINDOWS": "ഇന്നത്തെ അനുയോജ്യമായ സമയങ്ങൾ",
  "BEST TIME": "ഏറ്റവും ഉത്തമമായ സമയം",
  "BAD TIMES": "ഒഴിവാക്കേണ്ട സമയങ്ങൾ",
  "IF TODAY IS NOT GOOD": "ഇന്ന് അനുയോജ്യമല്ലെങ്കിൽ",
  "ASTRO ANALYSIS": "ജ്യോതിശാസ്ത്ര വിശകലനം",
  "MANUSCRIPT EXPLANATION": "ഗ്രന്ഥനിയമങ്ങളുടെ വിശദീകരണം",
  "WARNING SECTION": "മുന്നറിയിപ്പുകൾ",
  "FINAL DECISION": "അന്തിമ വിലയിരുത്തൽ",
};

// ── Static UI strings ──
export const STR = {
  panelTitle: { en: "Ritual Decision Engine", ml: "ആചാര തീരുമാന യന്ത്രം" },
  understanding: { en: "Understanding Your Ritual", ml: "നിങ്ങളുടെ ആചാരം മനസ്സിലാക്കൽ" },
  ritualPurpose: { en: "Purpose of this ritual", ml: "ഈ കർമ്മത്തിന്റെ ഉദ്ദേശം" },
  complianceChecklist: { en: "Manuscript Compliance Checklist", ml: "കൈയെഴുത്തുപ്രതി നിയമ പരിശോധന" },
  overallCompatibility: { en: "Overall compatibility", ml: "മൊത്തം അനുയോജ്യത" },
  successPotential: { en: "Success potential", ml: "വിജയ സാധ്യത" },
  weakness: { en: "Weakness", ml: "ദുർബലത" },
  estimatedAfter: { en: "Estimated compatibility after changes", ml: "മാറ്റങ്ങൾക്ക് ശേഷം കണക്കാക്കിയ അനുയോജ്യത" },
  ritualBelongs: { en: "This ritual belongs to", ml: "ഈ കർമ്മം പെടുന്ന വിഭാഗം" },
  noManuscriptRule: { en: "No manuscript rule exists for this condition.", ml: "ഈ അവസ്ഥയ്ക്ക് കൈയെഴുത്തുപ്രതിയിൽ നിയമമില്ല." },
  matchesManuscript: { en: "Matches manuscript rule", ml: "കൈയെഴുത്തുപ്രതി നിയമവുമായി പൊരുത്തപ്പെടുന്നു" },
  notMatchManuscript: { en: "Does not match manuscript rule", ml: "കൈയെഴുത്തുപ്രതി നിയമവുമായി പൊരുത്തപ്പെടുന്നില്ല" },
  recommendation: { en: "Recommendation", ml: "നിർദ്ദേശം" },
  changeTo: { en: "Change to", ml: "ഇതിലേക്ക് മാറ്റുക" },
  ritual: { en: "Ritual", ml: "ആചാരം" },
  today: { en: "Today", ml: "ഇന്ന്" },
  hour: { en: "Hour", ml: "മണിക്കൂർ" },
  moon: { en: "Moon", ml: "ചന്ദ്രൻ" },
  msRefs: { en: "Manuscript References", ml: "ഗ്രന്ഥ റഫറൻസുകൾ" },
  reasoningLog: { en: "Full Reasoning Log", ml: "പൂർണ്ണ വിശദീകരണ രേഖ" },
  steps: { en: "steps", ml: "ഘട്ടങ്ങൾ" },
  verdict: { en: "Verdict", ml: "വിധി" },
  confidence: { en: "Confidence", ml: "ആത്മവിശ്വാസം" },
  source: { en: "Source", ml: "ഉറവിടം" },
  ifIgnored: { en: "If ignored", ml: "അവഗണിച്ചാൽ" },
  conflict: { en: "Conflict", ml: "ഭിന്നത" },
  resolution: { en: "Resolution", ml: "പരിഹാരം" },
  nextHour: { en: "Next hour", ml: "അടുത്ത മണിക്കൂർ" },
  nextMoon: { en: "Next moon", ml: "അടുത്ത ചന്ദ്രദശ" },
  best: { en: "🥇 Best", ml: "🥇 മികച്ചത്" },
  second: { en: "🥈 Second", ml: "🥈 രണ്ടാമത്" },
  third: { en: "🥉 Third", ml: "🥉 മൂന്നാമത്" },
  daytime: { en: "Daytime", ml: "പകൽ" },
  nighttime: { en: "Nighttime", ml: "രാത്രി" },
  enemyHours: { en: "Enemy Hours", ml: "ശത്രു മണിക്കൂറുകൾ" },
  enemyDays: { en: "Enemy Days", ml: "ശത്രു ദിവസങ്ങൾ" },
  enemyMoon: { en: "Enemy Moon", ml: "ശത്രു ചന്ദ്രദശകൾ" },
  enemyRulers: { en: "Enemy Rulers", ml: "ശത്രു ഗ്രഹങ്ങൾ" },
  availableNow: { en: "available now", ml: "ഇപ്പോൾ ലഭ്യം" },
  dAway: { en: "d away", ml: "ദിവസം അകലെ" },
  toWait: { en: "to wait", ml: "കാത്തിരിക്കാൻ" },
  available: { en: "available", ml: "ലഭ്യം" },
  ranked: { en: "ranked", ml: "റാങ്ക് ചെയ്തത്" },
  rulesApplied: { en: "rules applied", ml: "നിയമങ്ങൾ പ്രയോഗിച്ചു" },
  warningsCount: { en: "warnings", ml: "മുന്നറിയിപ്പുകൾ" },
  noWarnings: { en: "No warnings", ml: "മുന്നറിയിപ്പുകളൊന്നുമില്ല" },
  advisorTitle: { en: "Mizan Configuration Advisor", ml: "മിസാൻ ക്രമീകരണ ഉപദേഷ്ടാവ്" },
  optimal: { en: "Optimal", ml: "ഏറ്റവും ഉത്തമം" },
  improvements: { en: "improvements", ml: "മെച്ചപ്പെടുത്തലുകൾ" },
  current: { en: "Current", ml: "നിലവിൽ" },
  recommend: { en: "Recommend", ml: "ശുപാർശ" },
  advisorIntroOptimal: { en: "Your current Mizan configuration is already optimal. No changes are recommended. Every selection aligns with the manuscript prescriptions for your ritual purpose.", ml: "നിങ്ങളുടെ നിലവിലെ മിസാൻ ക്രമീകരണം ഏറ്റവും ഉത്തമമാണ്. മാറ്റങ്ങളൊന്നും ആവശ്യമില്ല. ഓരോ തിരഞ്ഞെടുപ്പും നിങ്ങളുടെ ആചാര ലക്ഷ്യത്തിനുള്ള ഗ്രന്ഥ നിർദ്ദേശങ്ങളുമായി യോജിക്കുന്നു." },
  advisorIntro: { en: "This advisor compares your current Mizan selections against all imported manuscript rules. For each field where an improvement is possible, the recommended value and the manuscript reason are shown below. Go back to the Mizan selections above and adjust manually — the engine never changes Mizan for you.", ml: "ഈ ഉപദേഷ്ടാവ് നിങ്ങളുടെ നിലവിലെ മിസാൻ തിരഞ്ഞെടുപ്പുകളെ ഇറക്കുമതി ചെയ്ത എല്ലാ ഗ്രന്ഥ നിയമങ്ങളുമായി താരതമ്യം ചെയ്യുന്നു. മെച്ചപ്പെടുത്താൻ കഴിയുന്ന ഓരോ മണ്ഡലത്തിലും, ശുപാർശ ചെയ്യുന്ന മൂല്യവും ഗ്രന്ഥ കാരണവും താഴെ കാണിക്കുന്നു. മുകളിലുള്ള മിസാൻ തിരഞ്ഞെടുപ്പുകളിലേക്ക് മടങ്ങി സ്വയം ക്രമീകരിക്കുക — യന്ത്രം മിസാന് മാറ്റങ്ങളൊന്നും വരുത്തുന്നില്ല." },
  optimalBanner: { en: "Your current Mizan configuration is already optimal.", ml: "നിങ്ങളുടെ നിലവിലെ മിസാൻ ക്രമീകരണം ഏറ്റവും ഉത്തമമാണ്." },
  optimalSub: { en: "No changes are recommended — proceed with the full decision report below.", ml: "മാറ്റങ്ങളൊന്നും ആവശ്യമില്ല — താഴെയുള്ള പൂർണ്ണ തീരുമാന റിപ്പോർട്ടിലൂടെ മുന്നോട്ടുപോകുക." },
  langLabel: { en: "Malayalam", ml: "Malayalam" },
  langWord: { en: "Language", ml: "Language" },
  footerNote: { en: "This analysis is read-only and does not modify any Mizan calculation. All recommendations are derived from existing manuscript rules and live astronomical data.", ml: "ഈ വിശകലനം റീഡ്-ഒൺലി ആണ്; മിസാൻ കണക്കുകളൊന്നും മാറ്റുന്നില്ല. എല്ലാ ശുപാർശകളും നിലവിലുള്ള ഗ്രന്ഥ നിയമങ്ങളിൽ നിന്നും തത്സമയ ജ്യോതിശാസ്ത്ര വിവരങ്ങളിൽ നിന്നും ഉരുത്തിരിച്ചതാണ്." },
  // ── RitualTimingAnalysis UI labels ──
  timingTitle: { en: "Expert Ritual Timing Analysis", ml: "ആചാര സമയ വിശകലനം" },
  noPurposeNotice: { en: "No Purpose Selected", ml: "ലക്ഷ്യം തിരഞ്ഞെടുത്തിട്ടില്ല" },
  noPurposeDesc: { en: "Purpose-specific recommendations are marked as \"Not Available\". The timing chart below uses available Mizan, astro, and manuscript data.", ml: "ലക്ഷ്യം അനുസരിച്ചുള്ള ശുപാർശകൾ \"ലഭ്യമല്ല\" എന്ന് അടയാളപ്പെടുത്തിയിരിക്കുന്നു. താഴെയുള്ള സമയ ചാർട്ട് ലഭ്യമായ മിസാൻ, ജ്യോതിശാസ്ത്ര, ഗ്രന്ഥ വിവരങ്ങൾ ഉപയോഗിക്കുന്നു." },
  expertAssessment: { en: "Expert Assessment", ml: "വിദഗ്ദ്ധ വിലയിരുത്തൽ" },
  ritualType: { en: "Ritual Type", ml: "ആചാര തരം" },
  khayrSharr: { en: "Khayr / Sharr", ml: "ഖൈർ / ശർ" },
  overallStrength: { en: "Overall Ritual Strength", ml: "മൊത്തത്തിലുള്ള ആചാര ശക്തി" },
  canPerformQ: { en: "Can This Ritual Be Performed Today?", ml: "ഈ കർമ്മം ഇന്ന് അനുഷ്ഠിക്കാമോ?" },
  recWindow: { en: "Recommended Time Window", ml: "ശുപാർശ ചെയ്ത സമയ ജാലകം" },
  bestHour: { en: "Best Planetary Hour", ml: "ഏറ്റവും ഉത്തമ ഗ്രഹ മണിക്കൂർ" },
  bestPlanet: { en: "Best Ruling Planet", ml: "ഏറ്റവും ഉത്തമ ഭരണ ഗ്രഹം" },
  bestDayLbl: { en: "Best day", ml: "മികച്ച ദിവസം" },
  altLbl: { en: "Alternative", ml: "ബദൽ" },
  moonCond: { en: "Moon Phase Condition", ml: "ചന്ദ്രദശാ വ്യവസ്ഥ" },
  lunarDay: { en: "Lunar Day", ml: "ചാന്ദ്ര ദിവസം" },
  dayNightSuit: { en: "Day / Night Suitability", ml: "പകൽ / രാത്രി അനുയോജ്യത" },
  zodiacSuit: { en: "Zodiac Suitability", ml: "രാശി അനുയോജ്യത" },
  elementCompat: { en: "Element Compatibility", ml: "മൂലക അനുയോജ്യത" },
  faceDir: { en: "Face Direction", ml: "ദിശ" },
  talismanPlace: { en: "Talisman Placement", ml: "തായ്ത്താന്ത്രിക സ്ഥാപനം" },
  currentAstro: { en: "Current Astro Clock Status", ml: "നിലവിലെ ആസ്ട്രോ ക്ലോക്ക് അവസ്ഥ" },
  optimalHoursToday: { en: "Available Optimal Hours Today", ml: "ഇന്നത്തെ ലഭ്യമായ ഉത്തമ മണിക്കൂറുകൾ" },
  avoidHoursToday: { en: "Hours to Avoid Today", ml: "ഇന്ന് ഒഴിവാക്കേണ്ട മണിക്കൂറുകൾ" },
  nextBestTime: { en: "Next Best Available Time", ml: "അടുത്ത മികച്ച ലഭ്യമായ സമയം" },
  daysAway: { en: "day(s) away", ml: "ദിവസം അകലെ" },
  recIncense: { en: "Recommended Incense", ml: "ശുപാർശ ചെയ്ത ധൂപം" },
  incenseNote: { en: "The incense follows the Sa'at (planetary hour), NOT the day — Al-Shurut p.11, 20", ml: "ധൂപം സഅാത് (ഗ്രഹ മണിക്കൂർ) അനുസരിക്കുന്നു, ദിവസം അല്ല — അൽ-ഷുരൂത് p.11, 20" },
  warningsForbidden: { en: "Warnings & Forbidden Conditions", ml: "മുന്നറിയിപ്പുകളും നിരോധിത വ്യവസ്ഥകളും" },
  msConflicts: { en: "Manuscript Rule Conflicts (Resolved)", ml: "ഗ്രന്ഥ നിയമ ഭിന്നതകൾ (പരിഹരിച്ചത്)" },
  msRulesApplied: { en: "Manuscript Rules Applied", ml: "പ്രയോഗിച്ച ഗ്രന്ഥ നിയമങ്ങൾ" },
  face: { en: "Face", ml: "ദിശ" },
  notSpecified: { en: "Not specified", ml: "നിർദ്ദേശിച്ചിട്ടില്ല" },
  notAvailable: { en: "Not Available", ml: "ലഭ്യമല്ല" },
  // ── Selection Analysis (Configuration Check) labels ──
  configCheck: { en: "Your Configuration Check", ml: "നിങ്ങളുടെ ക്രമീകരണ പരിശോധന" },
  currentSelectionQ: { en: "Is your current selection suitable?", ml: "നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ് അനുയോജ്യമാണോ?" },
  yes: { en: "Yes", ml: "അതെ" },
  no: { en: "No", ml: "ഇല്ല" },
  bestAlt: { en: "Recommended Alternative", ml: "ശുപാർശ ചെയ്ത ബദൽ" },
  bestTime: { en: "Best Time", ml: "മികച്ച സമയം" },
  manuscriptSource: { en: "Manuscript Source", ml: "ഗ്രന്ഥ ഉറവിടം" },
  recommendedLbl: { en: "Recommended", ml: "ശുപാർശ" },
  purposeRequiredMsg: { en: "Purpose not selected — ritual-specific recommendations cannot be generated.", ml: "ലക്ഷ്യം തിരഞ്ഞെടുത്തിട്ടില്ല — ലക്ഷ്യം അനുസരിച്ചുള്ള ശുപാർശകൾ നൽകാൻ കഴിയില്ല." },
};

// Advisor field labels
const ML_FIELD_LABEL = {
  "Ritual Purpose": "ആചാര ലക്ഷ്യം",
  "Khayr / Sharr (Mizan 8)": "ഖൈർ / ശർ (മിസാൻ 8)",
  "Selected Weekday (Mizan 5)": "തിരഞ്ഞെടുത്ത ദിവസം (മിസാൻ 5)",
  "Selected Planet (Mizan 6)": "തിരഞ്ഞെടുത്ത ഗ്രഹം (മിസാൻ 6)",
  "Selected Planetary Hour (Mizan 4)": "തിരഞ്ഞെടുത്ത ഗ്രഹ മണിക്കൂർ (മിസാൻ 4)",
  "Selected Element (Mizan 2)": "തിരഞ്ഞെടുത്ത മൂലകം (മിസാൻ 2)",
  "Day / Night (Mizan 3)": "പകൽ / രാത്രി (മിസാൻ 3)",
  "Best Time to Perform (Today)": "അനുഷ്ഠിക്കാനുള്ള ഏറ്റവും ഉത്തമ സമയം (ഇന്ന്)",
  "Zodiac Sign": "രാശി",
  "Star / Nakshatra": "നക്ഷത്രം",
};

const ML_FIELD_VALUE = {
  "Not selected": "തിരഞ്ഞെടുത്തിട്ടില്ല",
  "Not selected in Mizan": "മിസാനിൽ തിരഞ്ഞെടുത്തിട്ടില്ല",
  "Not available in Mizan": "മിസാനിൽ ലഭ്യമല്ല",
  "Not detected": "കണ്ടെത്തിയിട്ടില്ല",
  "Based on purpose prescription": "ലക്ഷ്യത്തിന്റെ നിർദ്ദേശത്തിലൂടെ",
  "Based on your input text": "നിങ്ങളുടെ ഇൻപുട്ട് വാചകത്തിൽ നിന്ന്",
  "Any suitable day (no specific prescription)": "ഏത് അനുയോജ്യ ദിവസവും (പ്രത്യേക നിർദ്ദേശമില്ല)",
  "See live Astro Clock": "തത്സമയ ആസ്ട്രോ ക്ലോക്ക് കാണുക",
  "Consult the Astro Clock module": "ആസ്ട്രോ ക്ലോക്ക് മൊഡ്യൂൾ കാണുക",
  "No optimal time today": "ഇന്ന് ഉത്തമ സമയമില്ല",
  "Either (Night preferred)": "രണ്ടും (രാത്രി മുൻഗണന)",
  "Night (Gece) — preferred": "രാത്രി (ഗെസെ) — മുൻഗണന",
  "Night (Gece)": "രാത്രി (ഗെസെ)",
  "Day (Gunduz)": "പകൽ (ഗുൻദുസ്)",
  "Khayr (Benevolent)": "ഖൈർ (ഐശ്വര്യം)",
  "Sharr (Banishment)": "ശർ (നിരസനം)",
  "Select Khayr or Sharr in Mizan 8": "മിസാൻ 8-ൽ ഖൈർ അല്ലെങ്കിൽ ശർ തിരഞ്ഞെടുക്കുക",
  "Select a purpose in Mizan 7 (or type a custom purpose)": "മിസാൻ 7-ൽ ഒരു ലക്ഷ്യം തിരഞ്ഞെടുക്കുക (അല്ലെങ്കിൽ ഇഷ്ടാനുസൃത ലക്ഷ്യം ടൈപ്പ് ചെയ്യുക)",
};

// ── Helper translators ──
export function tDay(name, lang) {
  if (lang === "ml" && name && ML_DAY[name]) return ML_DAY[name];
  return name;
}
export function tPlanet(name, lang) {
  if (lang === "ml" && name && ML_PLANET[name]) return ML_PLANET[name];
  return name;
}
export function tElement(name, lang) {
  if (lang === "ml" && name && ML_ELEMENT[name]) return ML_ELEMENT[name];
  return name;
}
export function tStatus(val, lang) {
  if (lang !== "ml") return val;
  if (ML_STATUS[val]) return ML_STATUS[val];
  return val;
}
export function tVerdict(val, lang) {
  if (lang !== "ml") return val;
  return ML_VERDICT[val] || val;
}
export function tSection(val, lang) {
  if (lang !== "ml") return val;
  return ML_SECTION_TITLE[val] || val;
}
export function tFieldLabel(val, lang) {
  if (lang !== "ml") return val;
  return ML_FIELD_LABEL[val] || val;
}
export function tFieldValue(val, lang) {
  if (lang !== "ml") return val;
  if (ML_FIELD_VALUE[val]) return ML_FIELD_VALUE[val];
  // Day names / planet names inside values
  if (ML_DAY[val]) return ML_DAY[val];
  if (ML_PLANET[val]) return ML_PLANET[val];
  return val;
}
export function tStr(key, lang) {
  const e = STR[key];
  return e ? (e[lang] || e.en) : key;
}

// ── Translate a planetary-hour window reason (Today's Windows / Best Time) ──
function tWindowReason(reason, planet, pdfName, lang) {
  if (lang !== "ml" || !reason) return reason;
  const p = tPlanet(planet, lang);
  const base = `${p} മണിക്കൂർ —`;
  if (/ideal for/.test(reason)) return `${base} ${pdfName || "ഈ കർമ്മത്തിന്"} ഏറ്റവും അനുയോജ്യം`;
  if (/benefic planet, suitable for Khayr/.test(reason)) return `${base} ഉപകാര ഗ്രഹം; ഖൈർ കർമ്മത്തിന് അനുയോജ്യം`;
  if (/hour matches manuscript prescription/.test(reason)) return `${base} ഗ്രന്ഥ നിർദ്ദേശവുമായി പൊരുത്തപ്പെടുന്നു`;
  if (/night hour as required/.test(reason)) return `${base} ഗ്രന്ഥപ്രകാരം രാത്രി മണിക്കൂർ`;
  if (/available hour/.test(reason)) return `${base} ലഭ്യമായ മണിക്കൂർ`;
  return reason;
}

// ── Translate ranked window reason ──
function tRankedReason(reason, rank, lang) {
  if (lang !== "ml" || !reason) return reason;
  if (rank === 1) return "ഇന്നത്തെ ഏറ്റവും ശക്തമായ സമയാവസരം. ഗ്രന്ഥ നിർദ്ദേശപ്രകാരം ഈ മണിക്കൂറാണ് കർമ്മത്തിന് ഏറ്റവും അനുയോജ്യം.";
  if (rank === 2) return "രണ്ടാമത്തെ മികച്ച സമയം. ഒന്നാമത്തേത് നഷ്ടപ്പെട്ടാൽ മാത്രം ഉപയോഗിക്കുക.";
  return "മൂന്നാമത്തെ മികച്ച സമയം. ആദ്യത്തെ രണ്ടും ലഭ്യമല്ലെങ്കിൽ ഉപയോഗിക്കാവുന്ന ഒരു പിൻതിരിക്കൽ സമയം.";
}

// ── Translate avoid-window reason ──
function tAvoidReason(reason, lang) {
  if (lang !== "ml" || !reason) return reason;
  if (/enemy planet for/.test(reason)) {
    const m = reason.match(/enemy planet for (.+)/);
    return `ശത്രു ഗ്രഹം — ${m ? m[1] : "ഈ കർമ്മത്തിന്"} പ്രതികൂലം`;
  }
  if (/malefic planet, weakens Khayr/.test(reason)) return "പാപഗ്രഹം — ഖൈർ കർമ്മങ്ങളെ ദുർബലമാക്കും";
  if (/enemy\/worst planet per manuscript/.test(reason)) return "ഗ്രന്ഥപ്രകാരം ശത്രു/മോശം ഗ്രഹം";
  return reason;
}

// ── Translate warning string (pattern-based) ──
function tWarning(w, lang, analysis) {
  if (lang !== "ml" || !w) return w;
  const day = analysis?.astroClockStatus?.day;
  const mlDay = tDay(day, lang);
  const bestDay = analysis?.bestDay ? tDay(analysis.bestDay, lang) : "";
  const altDay = analysis?.altDay ? tDay(analysis.altDay, lang) : "";
  const planet = analysis?.astroClockStatus?.currentHour?.planet;
  const mlPlanet = tPlanet(planet, lang);
  const hourNum = analysis?.astroClockStatus?.currentHour?.number;

  if (/NOT a Sa'idat hour/.test(w))
    return `നിലവിലെ മണിക്കൂർ (#${hourNum}, ${mlPlanet}) സഅീദാത് മണിക്കൂറല്ല; ${mlPlanet} ഉപകാര ഗ്രഹവുമല്ല — ഖൈർ കർമ്മങ്ങൾക്ക് അനുയോജ്യമല്ല (LCK_003)`;
  if (/Khayr works should be done in the waxing phase/.test(w)) {
    const ld = analysis?.moonPhase?.lunarDay;
    return `ചന്ദ്രൻ ക്ഷയദശയിലാണ് (ദിവസം ${ld}). ഖൈർ കർമ്മങ്ങൾ വർദ്ധമാന ദശയിൽ അനുഷ്ഠിക്കണം (MN_001)`;
  }
  if (/Sharr works are better in the waning phase/.test(w))
    return "ചന്ദ്രൻ വർദ്ധമാന ദശയിലാണ്. ശർ കർമ്മങ്ങൾ ക്ഷയദശയിൽ, പ്രത്യേകിച്ച് അമാവാസയിൽ ചെയ്യുന്നതാണ് ഉത്തമം (MN_002)";
  if (/MUST be performed at night/.test(w))
    return "ഈ കർമ്മം രാത്രിയിൽ അനുഷ്ഠിക്കണം — പകലിൽ സൂര്യൻ ജ്വലനങ്ങളെ തടയുന്നു (NGT_002)";
  if (/Today is .* but the recommended day is/.test(w))
    return `ഇന്ന് ${mlDay} ആണ്, എന്നാൽ ശുപാർശ ചെയ്ത ദിവസം ${bestDay}${altDay ? ` അല്ലെങ്കിൽ ${altDay}` : ""} ആണ്`;
  if (/Today is the correct day but all .* hours have passed/.test(w))
    return `ഇന്ന് ശരിയായ ദിവസമാണെങ്കിലും ഉത്തമ മണിക്കൂറുകളെല്ലാം കഴിഞ്ഞു. ഭാഗികമായ മണിക്കൂറിൽ തുടരാമെങ്കിലും കർമ്മം ദുർബലമാകും.`;
  return w;
}

// ── Translate conflict objects ──
function tConflict(c, lang, analysis) {
  if (lang !== "ml") return c;
  return {
    ...c,
    rule1: c.rule1,
    rule2: c.rule2,
    resolution: "മിസാൻ ലക്ഷ്യത്തിന് മുൻഗണന (തലം 4). ഇഷ്ടാനുസൃത ലക്ഷ്യം ദ്വിതീയമായി രേഖപ്പെടുത്തി.",
  };
}

// ── Translate manuscript rule desc (lightweight) ──
function tRule(r, lang) {
  if (lang !== "ml") return r;
  // Keep id + source; translate common desc fragments minimally
  return r;
}

// ── Malayalam body templates per section ──
function mlBody(section, analysis) {
  const a = analysis;
  const day = tDay(a?.astroClockStatus?.day, "ml");
  const dayRuler = tPlanet(a?.astroClockStatus?.dayRuler, "ml");
  const curHour = a?.astroClockStatus?.currentHour?.number;
  const curPlanet = tPlanet(a?.astroClockStatus?.currentHour?.planet, "ml");
  const remaining = a?.astroClockStatus?.hourRemaining;
  const moonDay = a?.moonPhase?.lunarDay;
  const phaseName = a?.moonPhase?.phaseName === "Waxing (مقبل)" ? "വർദ്ധമാനം" : "ക്ഷയം";
  const isNight = a?.astroClockStatus?.isDaytime === false;
  const bestDay = a?.bestDay ? tDay(a.bestDay, "ml") : "";
  const altDay = a?.altDay ? tDay(a.altDay, "ml") : "";
  const bestPlanet = a?.bestPlanetaryHour ? tPlanet(a.bestPlanetaryHour, "ml") : "";
  const ritualType = tRitualType(a?.ritualType, "ml") || "";
  const incense = a?.recommendedIncense ? tPlanet(a.astroClockStatus?.currentHour?.planet, "ml") + " ധൂപം" : "";
  const windows = a?.bestWindowsToday || [];
  const ranked = a?.rankedWindows || [];
  const avoid = a?.avoidWindowsToday || [];
  const nextOp = a?.nextOpportunity;
  const nextMoon = a?.nextMoonPhase;
  const verdict = tVerdict(a?.verdict, "ml");

  switch (section.section) {
    case "TODAY ANALYSIS": {
      const r = a?.canPerformTodayReason || "";
      if (a.canPerformToday === "Yes")
        return `അതെ — ഇന്ന് അനുയോജ്യമാണ്. ആകാശം ഈ കർമ്മത്തിന് അനുകൂലമാണ്; താഴെ പറയുന്ന ഉത്തമ മണിക്കൂറുകളിൽ ആത്മവിശ്വാസത്തോടെ മുന്നോട്ടുപോകാം. (${r})`;
      if (a.canPerformToday === "Limited")
        return `ഇന്ന് ഭാഗികമായി മാത്രം അനുയോജ്യം. മുന്നോട്ടുപോകാമെങ്കിലും കർമ്മം ദുർബലമാകും. അത്യാവശ്യമെങ്കിൽ തുടരുക; അല്ലെങ്കിൽ അടുത്ത പൂർണ്ണ അനുകൂല ദിവസത്തിനായി കാത്തിരിക്കുക. (${r})`;
      return `ഇല്ല — ഇന്ന് അനുയോജ്യമല്ല. ഇന്ന് ഈ കർമ്മം അനുഷ്ഠിക്കുന്നത് ഖഗോളധാരയ്ക്ക് വിരുദ്ധമായി പ്രവർത്തിക്കുന്നതായിരിക്കും; ഗ്രന്ഥങ്ങൾ ഇതിനെ മുന്നറിയിപ്പ് നൽകുന്നു. (${r})`;
    }
    case "CURRENT MOMENT": {
      if (a.currentMomentSuitable)
        return `നിലവിൽ അനുയോജ്യമായ സമയമാണ്. നിലവിലെ ഗ്രഹ മണിക്കൂർ #${curHour} (${curPlanet}), ${isNight ? "രാത്രി" : "പകൽ"}, ${remaining} ബാക്കി. ഉടനെ പ്രവർത്തിക്കുക — ഈ സന്ദർഭം അധികനേരം തുറന്നിരിക്കില്ല.`;
      const wt = a?.waitTime?.waitText;
      const waitPlanet = a?.waitTime?.hour ? tPlanet(a.waitTime.hour.planet, "ml") : "";
      const waitStart = a?.waitTime?.hour?.startTime;
      return `നിലവിലെ സമയം അനുയോജ്യമല്ല. നിലവിലെ മണിക്കൂർ #${curHour} (${curPlanet}), ${isNight ? "രാത്രി" : "പകൽ"}. ${wt ? `അടുത്ത അനുയോജ്യ മണിക്കൂറിനായി ഏകദേശം ${wt} കാത്തിരിക്കുക (${waitPlanet}, ${waitStart}-ൽ തുടങ്ങും).` : "ഇന്ന് അനുയോജ്യ മണിക്കൂറുകളൊന്നും ബാക്കിയില്ല — അടുത്ത ശുപാർശ ദിവസത്തിനായി കാത്തിരിക്കുക."}`;
    }
    case "TODAY'S WINDOWS":
      return windows.length > 0
        ? "താഴെ പറയുന്ന സമയങ്ങൾ ഇന്ന് ഈ കർമ്മത്തിന് അനുയോജ്യമാണ്. ഓരോ സമയത്തിന്റെയും ശക്തി നക്ഷത്രങ്ങളാൽ മൂല്യനിർണ്ണയം ചെയ്യുന്നു (★★★★★ = പൂർണ്ണ യോജനം, ★ = അതിവായന ഉപയോഗ്യം). ശക്തി എന്നത് ഗ്രഹ മണിക്കൂർ നിർദ്ദേശവുമായുള്ള യോജനം, ചന്ദ്രദശ, പകൽ/രാത്രി നിർബന്ധം എന്നിവ അടിസ്ഥാനമാക്കിയുള്ളതാണ്."
        : "ഇന്ന് അനുകൂലമായ സമയങ്ങങ്ങളൊന്നും ബാക്കിയില്ല — നിർദ്ദേശിച്ച മണിക്കൂറുകളെല്ലാം കഴിഞ്ഞു. അടുത്ത അവസരത്തിനായി കാത്തിരിക്കുക.";
    case "BEST TIME":
      return ranked.length > 0
        ? "ഇന്നത്തെ ഏറ്റവും മികച്ച, രണ്ടാമത്തെ, മൂന്നാമത്തെ മണിക്കൂറുകൾ മുകളിൽ കാണാം. റാങ്കിങ് ഗ്രഹ മണിക്കൂറിന്റെ നിർദ്ദേശിത ഗ്രഹവുമായുള്ള യോജനം, ചന്ദ്രദശ, പകൽ/രാത്രി നിർബന്ധം എന്നിവ അടിസ്ഥാനമാക്കിയുള്ളതാണ്."
        : "ഇന്ന് റാങ്ക് ചെയ്ത സമയങ്ങങ്ങളൊന്നുമില്ല. അടുത്ത അവസരത്തിനായി താഴെയുള്ള \"ഇന്ന് അനുയോജ്യമല്ലെങ്കിൽ\" ഭാഗം കാണുക.";
    case "BAD TIMES":
      return avoid.length > 0
        ? `താഴെ പറയുന്ന സമയങ്ങൾ ഒഴിവാക്കണം. ${avoid.map(w => `${w.startTime}–${w.endTime} (${tPlanet(w.planet, "ml")})`).join("; ")}. ${a.enemyAnalysis?.note ? a.enemyAnalysis.note : ""}`
        : `ഇന്ന് പ്രത്യേകം അപകടകരമായ മണിക്കൂറുകളൊന്നും കണ്ടെത്തിയില്ല. എങ്കിലും, ${a.enemyAnalysis?.note || ""}`;
    case "IF TODAY IS NOT GOOD":
      return nextOp
        ? `ഇന്നത്തെ അവസരം കഴിഞ്ഞതോ അനുയോജ്യമല്ലെങ്കിൽ, അടുത്ത ഉത്തമ സമയം: ${tDay(nextOp.dayName, "ml")}${nextOp.isToday ? " (ഇന്ന്)" : ` (${nextOp.daysAhead} ദിവസം അകലെ)`}, ${nextOp.startTime}–${nextOp.endTime} (${tPlanet(nextOp.planet, "ml")} മണിക്കൂർ, #${nextOp.hour}). ${nextMoon ? `ചന്ദ്രദശ: ${nextMoon.phase} — ${nextMoon.reason}${nextMoon.waitDays > 0 ? ` (ഏകദേശം ${nextMoon.waitDays} ദിവസം കാത്തിരിക്കാൻ).` : " (ഇപ്പോൾ ലഭ്യം)."}` : ""}`
        : `അടുത്ത 7 ദിവസത്തിനുള്ളിൽ ഭാവി അവസരമൊന്നും കണ്ടെത്തിയില്ല. ${nextMoon ? `ചന്ദ്രദശ: ${nextMoon.phase} — ${nextMoon.reason}` : ""} ബദൽ ദിവസങ്ങൾക്കായി ഗ്രന്ഥങ്ങൾ കാണുക.`;
    case "ASTRO ANALYSIS":
      return `ഇന്ന് ${day}, ഭരണം ${dayRuler}. നിലവിലെ ഗ്രഹ മണിക്കൂർ #${curHour} (${curPlanet}), ${isNight ? "രാത്രി" : "പകൽ"}, ${remaining} ബാക്കി. ചന്ദ്രൻ ദിവസം ${moonDay} (${phaseName}). മൊത്തത്തിലുള്ള ഖഗോള വിലയിരുത്തൽ: ${verdict}.`;
    case "MANUSCRIPT EXPLANATION":
      // ── ORIGINAL Astro Clock text — pass through, never generate ──
      return a.selectionAnalysis?.originalExplanationMl || a.selectionAnalysis?.originalExplanation || a.body || "";
    case "WARNING SECTION":
      return (a.warnings?.length > 0)
        ? a.warnings.map(w => "⚠ " + tWarning(w, "ml", a)).join(" ")
        : `മുന്നറിയിപ്പുകളൊന്നുമില്ല — പരിശോധിച്ച എല്ലാ വ്യവസ്ഥകളും അനുകൂലമാണ്.${a.conflicts?.length > 0 ? ` എന്നാൽ ${a.conflicts.length} ഗ്രന്ഥ ഭിന്നത കണ്ടെത്തി പരിഹരിച്ചു.` : ""}`;
    case "FINAL DECISION":
      return `${a.verdictStarsString} ${verdict}. ഏത് സമയത്താണ് കർമ്മം അനുഷ്ഠിക്കേണ്ടതെന്നതിന്റെ ഖഗോള വിലയിരുത്തൽ ഇതാണ്. ${a.canPerformToday === "Yes" ? "ഇന്ന് മുകളിൽ പറഞ്ഞ ഉത്തമ മണിക്കൂറുകളിൽ മുന്നോട്ടുപോകാം." : a.canPerformToday === "Limited" ? "ശ്രദ്ധയോടെ മുന്നോട്ടുപോകാം, എന്നാൽ കർമ്മം ഉത്തമ സമയത്തേക്കാൾ ദുർബലമായിരിക്കും." : "പൂർണ്ണ ശക്തിക്കായി അടുത്ത ശുപാർശ ദിവസത്തിനും മണിക്കൂറിനുമായി കാത്തിരിക്കുക."} ${incense ? `കർമ്മത്തിനിടയിൽ ${incense} ധൂപിക്കുക (അൽ-ഷുരൂത് p.11, 20).` : ""}`;
    default:
      return section.body;
  }
}

// ── Translate consequence (lightweight, common patterns) ──
function tConsequence(c, section, analysis, lang) {
  if (lang !== "ml" || !c) return c;
  const sec = section.section;
  const map = {
    "TODAY ANALYSIS": analysis.canPerformToday === "Yes" ? "അപായമില്ല — മുന്നോട്ടുപോകുക." : "തെറ്റായ ദിവസം കർമ്മം ചെയ്യുന്നത് അതിനെ ദുർബലമാക്കും; ജ്വലനങ്ങൾ അപേക്ഷ നിരസിച്ചേക്കാം.",
    "CURRENT MOMENT": "ഇപ്പോൾ പ്രവർത്തിക്കുന്നത് പരിശ്രമം പാഴാക്കും; കർമ്മം പരാജയപ്പെടുകയോ പ്രതിഫലിക്കുകയോ ചെയ്തേക്കാം.",
    "TODAY'S WINDOWS": "ഇവയാണ് നിങ്ങളുടെ ശക്തി സന്ദർഭങ്ങൾ. നഷ്ടപ്പെടുത്തിയാൽ അടുത്ത അവസരത്തിനായി കാത്തിരിക്കണം.",
    "BEST TIME": "തെറ്റായ മണിക്കൂറിൽ ആരംഭിച്ചാൽ ഗ്രഹാധിപൻ അപേക്ഷ ഭരിക്കില്ല.",
    "BAD TIMES": "അപകടകരമായ മണിക്കൂറിൽ പ്രവർത്തിച്ചാൽ കർമ്മം പ്രതിഫലിച്ചേക്കാം — ശത്രു മണിക്കൂറുകളിൽ പ്രവർത്തിച്ചവർ രോഗബാധിതരായതായി ഗ്രന്ഥങ്ങൾ രേഖപ്പെടുത്തുന്നു.",
    "IF TODAY IS NOT GOOD": "അടുത്ത അനുകൂല സമയത്തിനായി കാത്തിരിക്കുന്നത് കർമ്മത്തിന് പൂർണ്ണ ശക്തി ഉറപ്പാക്കും.",
    "ASTRO ANALYSIS": "മൊത്തത്തിലുള്ള ഖഗോള ശക്തി എല്ലാ വ്യവസ്ഥകളുടെയും — ദിവസം, മണിക്കൂർ, ചന്ദ്രൻ, മൂലകം, രാശി — സംയോജനമാണ്.",
    "MANUSCRIPT EXPLANATION": "ഓരോ നിയമവും അതിന്റെ ഉറവിട ഗ്രന്ഥത്തിന്റെ അധികാരം വഹിക്കുന്നു. അവഗണിക്കുന്നത് പാരമ്പര്യത്തിന് വിരുദ്ധമാണ്; പണ്ഡിതർ ഇത് പരാജയത്തിനോ പ്രതിഫലനത്തിനോ കാരണമാകുമെന്ന് മുന്നറിയിക്കുന്നു.",
    "WARNING SECTION": "ഓരോ മുന്നറിയിപ്പും അവഗണിച്ചാൽ കർമ്മത്തിന്റെ ശക്തി കുറയ്ക്കുകയോ തിരിച്ചു വിടുകയോ ചെയ്യുന്ന ഒരു വ്യവസ്ഥയെ സൂചിപ്പിക്കുന്നു.",
    "FINAL DECISION": a => a?.verdict === "Suitable" ? "കർമ്മം ശക്തമാണ് — ആത്മവിശ്വാസത്തോടെ മുന്നോട്ടുപോകുക." : a?.verdict === "Forbidden" ? "ഈ സമയം ഗ്രന്ഥപ്രകാരം വിലക്കപ്പെട്ടതാണ് — മാറ്റിവെക്കുക." : "കർമ്മം ദുർബലമാണ് — സാധ്യമെങ്കിൽ മാറ്റിവെക്കുക.",
  };
  const v = map[sec];
  if (typeof v === "function") return v(analysis);
  return v || c;
}

// ── Translate decision breakdown reason (pattern-based) ──
function mlDecisionReason(reason) {
  if (!reason) return reason;
  if (reason === "No manuscript rule exists for this condition.")
    return "ഈ വ്യവസ്ഥയ്ക്ക് ഗ്രന്ഥങ്ങളിൽ നിയമമില്ല.";
  let r = reason;
  // Translate planet names (both cases)
  for (const [en, ml] of Object.entries(ML_PLANET)) r = r.split(en).join(ml);
  // Translate day names
  for (const [en, ml] of Object.entries(ML_DAY)) r = r.split(en).join(ml);
  // Translate element names
  for (const [en, ml] of Object.entries(ML_ELEMENT)) r = r.split(en).join(ml);
  // Common phrase replacements
  r = r.replace("The manuscript prescribes", "ഗ്രന്ഥങ്ങൾ നിർദ്ദേശിക്കുന്നത്");
  r = r.replace("Your selection matches.", "നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ് യോജിക്കുന്നു.");
  r = r.replace(" only.", " മാത്രം.");
  r = r.replace("hour(s).", "മണിക്കൂർ(ങ്ങൾ).");
  r = r.replace(" hour.", " മണിക്കൂർ.");
  r = r.replace("Select an hour to verify.", "പരിശോധിക്കാൻ ഒരു മണിക്കൂർ തിരഞ്ഞെടുക്കുക.");
  r = r.replace("Your selected hour is ruled by", "നിങ്ങൾ തിരഞ്ഞെടുത്ത മണിക്കൂർ ഭരിക്കുന്നത്");
  r = r.replace(", which does not match.", " ആണ്, ഇത് യോജിക്കുന്നില്ല.");
  r = r.replace("The manuscript requires", "ഗ്രന്ഥങ്ങൾ ആവശ്യമാക്കുന്നത്");
  r = r.replace("moon. Current moon satisfies this.", "ചന്ദ്രദശയാണ്. നിലവിലെ ചന്ദ്രൻ ഇത് പാലിക്കുന്നു.");
  r = r.replace("moon. Current moon does not satisfy this.", "ചന്ദ്രദശയാണ്. നിലവിലെ ചന്ദ്രൻ ഇത് പാലിക്കുന്നില്ല.");
  r = r.replace("night. Your selection matches.", "രാത്രി ആണ്. നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ് യോജിക്കുന്നു.");
  r = r.replace("this work be performed at night.", "ഈ കർമ്മം രാത്രിയിൽ അനുഷ്ഠിക്കണം.");
  r = r.replace("element. Your selection matches.", "മൂലകമാണ്. നിങ്ങളുടെ തിരഞ്ഞെടുപ്പ് യോജിക്കുന്നു.");
  r = r.replace("element for this work.", "മൂലകമാണ് ഈ കർമ്മത്തിന്.");
  r = r.replace("element.", "മൂലകമാണ്.");
  r = r.replace("is an enemy planet for this ritual per the manuscript.", "ഈ കർമ്മത്തിനുള്ള ശത്രു ഗ്രഹമാണ് (ഗ്രന്ഥപ്രകാരം).");
  r = r.replace("Your selected planet is not an enemy planet for this ritual.", "നിങ്ങൾ തിരഞ്ഞെടുത്ത ഗ്രഹം ഈ കർമ്മത്തിനുള്ള ശത്രു ഗ്രഹമല്ല.");
  r = r.replace("The manuscript prescribes zodiac:", "ഗ്രന്ഥങ്ങൾ നിർദ്ദേശിക്കുന്ന രാശി:");
  r = r.replace("This is not selectable in Mizan — verify manually.", "ഇത് മിസാനിൽ തിരഞ്ഞെടുക്കാൻ കഴിയില്ല — സ്വയം പരിശോധിക്കുക.");
  r = r.replace(" or ", " അല്ലെങ്കിൽ ");
  r = r.replace(" and ", ", ");
  return r;
}

// ── Localize the selection analysis object ──
function localizeSelectionAnalysis(sa, lang) {
  if (lang !== "ml" || !sa) return sa;
  if (sa.purposeRequired) {
    return { ...sa, summary: "ലക്ഷ്യം തിരഞ്ഞെടുത്തിട്ടില്ല — ലക്ഷ്യം അനുസരിച്ചുള്ള ശുപാർശകൾ നൽകാൻ കഴിയില്ല." };
  }
  const ML_DIM_LABEL = {
    "Weekday": "ദിവസം", "Planetary Hour": "ഗ്രഹ മണിക്കൂർ", "Planet": "ഗ്രഹം",
    "Element": "മൂലകം", "Day / Night": "പകൽ / രാത്രി", "Moon Phase": "ചന്ദ്രദശ",
    "Enemy Planet Check": "ശത്രു ഗ്രഹ പരിശോധന", "Zodiac": "രാശി",
  };
  const tCV = (val) => {
    if (!val) return val;
    if (val === "Not selected") return "തിരഞ്ഞെടുത്തിട്ടില്ല";
    if (val === "Day") return "പകൽ";
    if (val === "Night") return "രാത്രി";
    if (val === "Not selectable in Mizan") return "മിസാനിൽ തിരഞ്ഞെടുക്കാൻ കഴിയില്ല";
    if (ML_DAY[val]) return ML_DAY[val];
    if (ML_PLANET[val]) return ML_PLANET[val];
    let r = val.replace("Hour #", "മണിക്കൂർ #").replace(/^Day (\d+)/, "ദിവസം $1")
      .replace("Waxing", "വർദ്ധമാനം").replace("Waning", "ക്ഷയം");
    for (const [en, ml] of Object.entries(ML_PLANET)) r = r.split(en).join(ml);
    return r;
  };
  const tRec = (val) => {
    if (!val) return val;
    if (val === "Night (Gece)") return "രാത്രി (ഗെസെ)";
    let r = val;
    for (const [en, ml] of Object.entries(ML_DAY)) r = r.split(en).join(ml);
    for (const [en, ml] of Object.entries(ML_PLANET)) r = r.split(en).join(ml);
    for (const [en, ml] of Object.entries(ML_ELEMENT)) r = r.split(en).join(ml);
    r = r.replace(" or ", " അല്ലെങ്കിൽ ");
    return r;
  };
  const decisionBreakdown = (sa.decisionBreakdown || []).map(b => ({
    ...b,
    label: ML_DIM_LABEL[b.label] || b.label,
    currentValue: tCV(b.currentValue),
    // ── ORIGINAL Astro Clock text — use reasonMl when available, else pass through ──
    // The engine provides reasonMl from the AstroClockKnowledge record's knowledge_text_ml.
    // Never pattern-match or translate the original English text.
    reason: (lang === "ml" && b.reasonMl) ? b.reasonMl : b.reason,
    recommended: tRec(b.recommended),
  }));
  const bestAlternative = sa.bestAlternative ? {
    ...sa.bestAlternative,
    day: sa.bestAlternative.day ? (ML_DAY[sa.bestAlternative.day] || sa.bestAlternative.day) : null,
    altDay: sa.bestAlternative.altDay ? (ML_DAY[sa.bestAlternative.altDay] || sa.bestAlternative.altDay) : null,
    hour: sa.bestAlternative.hour ? (ML_PLANET[sa.bestAlternative.hour] || sa.bestAlternative.hour) : null,
    planet: sa.bestAlternative.planet ? (ML_PLANET[sa.bestAlternative.planet] || sa.bestAlternative.planet) : null,
    element: sa.bestAlternative.element ? (ML_ELEMENT[sa.bestAlternative.element] || sa.bestAlternative.element) : null,
    dayNight: sa.bestAlternative.dayNight === "Night (Gece)" ? "രാത്രി (ഗെസെ)" : sa.bestAlternative.dayNight,
    dayName: sa.bestAlternative.dayName ? (ML_DAY[sa.bestAlternative.dayName] || sa.bestAlternative.dayName) : null,
    reason: sa.bestAlternative.reason === "Matches all manuscript conditions for this ritual."
      ? "ഈ കർമ്മത്തിനുള്ള എല്ലാ ഗ്രന്ഥ വ്യവസ്ഥകളും യോജിക്കുന്നു."
      : sa.bestAlternative.reason,
  } : null;
  return {
    ...sa,
    summary: sa.suitable
      ? "നിങ്ങളുടെ നിലവിലെ ക്രമീകരണം സാധുവാണ് — എല്ലാ ഗ്രന്ഥ വ്യവസ്ഥകളും പാലിക്കപ്പെട്ടിരിക്കുന്നു."
      : `നിങ്ങളുടെ നിലവിലെ ക്രമീകരണത്തിൽ ${decisionBreakdown.filter(b => b.status === "fail").length} പ്രശ്നം(ങ്ങൾ) തിരുത്തേണ്ടതുണ്ട്.`,
    decisionBreakdown,
    bestAlternative,
  };
}

// ── Extra translation maps for analysis-level fields ──
// ── Verdict reason is now dynamic manuscript text from the engine ──
// No static override — the engine's verdictReason cites specific manuscript rules.
// This map is retained only for backward compatibility but no longer overrides.
const ML_VERDICT_REASON = {};
const ML_KHAYR_SHARR = {
  "khayr": "ഖൈർ",
  "sharr": "ശർ",
  "Not selected": "തിരഞ്ഞെടുത്തിട്ടില്ല",
};
const ML_KHAYR_SHARR_MEANING = {
  "khayr": "ഐശ്വര്യം",
  "sharr": "ശക്തി/നിരസനം",
  "Not selected": "നിർണ്ണയിച്ചിട്ടില്ല",
  "Not determined": "നിർണ്ണയിച്ചിട്ടില്ല",
};
const ML_DAY_NIGHT_REASON = {
  optimal: "രാത്രി, ഗ്രന്ഥപ്രകാരം ആവശ്യമുള്ളത്.",
  forbidden: "പകലാണ്, എന്നാൽ ഗ്രന്ഥം രാത്രി ആവശ്യമാക്കുന്നു.",
  neutral: "ഗ്രന്ഥങ്ങളിൽ രാത്രി നിർബന്ധമില്ല.",
};
function mlBestReason(analysis, type) {
  if (type === "day") {
    return analysis.bestDay
      ? `ഗ്രന്ഥം നിർദ്ദേശിക്കുന്നത് ${analysis.bestDay}`
      : "ഗ്രന്ഥങ്ങളിൽ ദിവസ നിർബന്ധമില്ല.";
  }
  return analysis.bestPlanetaryHour
    ? `ഗ്രന്ഥം നിർദ്ദേശിക്കുന്നത് ${analysis.bestPlanetaryHour} മണിക്കൂർ(ങ്ങൾ)`
    : "ഗ്രന്ഥങ്ങളിൽ മണിക്കൂർ നിർബന്ധമില്ല.";
}
function mlElementReason(analysis) {
  const el = analysis.req?.element;
  if (!el) return "ഗ്രന്ഥങ്ങളിൽ മൂലക നിർബന്ധമില്ല.";
  return `ഗ്രന്ഥം നിർദ്ദേശിക്കുന്ന മൂലകം: ${ML_ELEMENT[el] || el}`;
}
function mlEnemyNote(analysis) {
  const enemies = analysis.enemyAnalysis?.enemyRulers;
  if (enemies && enemies.length > 0) {
    const mlEnemies = enemies.map(e => ML_PLANET[e] || e).join(", ");
    return `ഗ്രന്ഥം ${mlEnemies} നെ ഈ കർമ്മത്തിനുള്ള ശത്രു ഗ്രഹങ്ങളായി തിരിച്ചറിഞ്ഞിരിക്കുന്നു.`;
  }
  return "ഈ കർമ്മത്തിന് ഗ്രന്ഥങ്ങളിൽ ശത്രു ഗ്രഹങ്ങളൊന്നും നിർദ്ദേശിച്ചിട്ടില്ല.";
}

const ML_SCORE_REASON = {
  "Correct day per manuscript (+20)": "ഗ്രന്ഥപ്രകാരം ശരിയായ ദിവസം (+20)",
  "Wrong day per manuscript (-15)": "ഗ്രന്ഥപ്രകാരം തെറ്റായ ദിവസം (-15)",
  "Current hour matches manuscript (+25)": "നിലവിലെ മണിക്കൂർ ഗ്രന്ഥവുമായി പൊരുത്തപ്പെടുന്നു (+25)",
  "Current hour not prescribed (-10)": "നിലവിലെ മണിക്കൂർ നിർദ്ദേശിച്ചതല്ല (-10)",
  "Night requirement met (+10)": "രാത്രി നിർബന്ധം പാലിച്ചു (+10)",
  "Not enemy hour (+5)": "ശത്രു മണിക്കൂറല്ല (+5)",
};

// ── Localize the full analysis object's report + supporting fields ──
export function localizeAnalysis(analysis, lang) {
  if (lang !== "ml") return analysis;
  const report = (analysis.report || []).map(sec => {
    const title = tSection(sec.section, lang);
    let status = sec.status;
    // regenerate count-bearing statuses from structured data
    if (sec.section === "TODAY'S WINDOWS") status = sec.windows?.length > 0 ? `${sec.windows.length} ${tStr("available", lang)}` : tStatus("None remaining", lang);
    if (sec.section === "BEST TIME") status = sec.ranked?.length > 0 ? `${sec.ranked.length} ${tStr("ranked", lang)}` : tStatus("None", lang);
    if (sec.section === "BAD TIMES") status = sec.avoid?.length > 0 ? `${sec.avoid.length} ${lang === "ml" ? "ഒഴിവാക്കാൻ" : "to avoid"}` : tStatus("None identified", lang);
    if (sec.section === "MANUSCRIPT EXPLANATION") status = `${analysis.rulesApplied?.length || 0} ${tStr("rulesApplied", lang)}`;
    if (sec.section === "WARNING SECTION") status = analysis.warnings?.length > 0 ? `${analysis.warnings.length} ${tStr("warningsCount", lang)}` : tStr("noWarnings", lang);
    if (sec.section === "FINAL DECISION") status = tVerdict(sec.status, lang);
    if (sec.section === "ASTRO ANALYSIS") status = `${tDay(analysis.astroClockStatus?.day, lang)} / ${tPlanet(analysis.astroClockStatus?.currentHour?.planet, lang)}`;
    if (sec.section === "IF TODAY IS NOT GOOD") status = analysis.nextOpportunity ? `${lang === "ml" ? "അടുത്തത്" : "Next"}: ${tDay(analysis.nextOpportunity.dayName, lang)}` : (lang === "ml" ? "ഭാവി സമയമില്ല" : "No future window found");
    if (sec.section === "CURRENT MOMENT") status = tStatus(sec.status, lang);
    if (sec.section === "TODAY ANALYSIS") status = tStatus(sec.status, lang);

    const body = mlBody(sec, analysis);
    const consequence = tConsequence(sec.consequence, sec, analysis, lang);

    const windows = sec.windows ? sec.windows.map(w => ({
      ...w,
      reason: tWindowReason(w.reason, w.planet, analysis.ritualType, lang),
      strengthReason: `${w.stars} — ${tWindowReason(w.reason, w.planet, analysis.ritualType, lang)}`,
    })) : sec.windows;

    const ranked = sec.ranked ? sec.ranked.map(w => ({
      ...w,
      planet: tPlanet(w.planet, lang),
      reason: tRankedReason(w.reason, w.rank, lang),
    })) : sec.ranked;

    const avoid = sec.avoid ? sec.avoid.map(w => ({
      ...w,
      planet: tPlanet(w.planet, lang),
      reason: tAvoidReason(w.reason, lang),
    })) : sec.avoid;

    const enemyAnalysis = sec.enemyAnalysis ? {
      ...sec.enemyAnalysis,
      enemyHours: sec.enemyAnalysis.enemyHours?.map(p => tPlanet(p, lang)),
      enemyDays: sec.enemyAnalysis.enemyDays?.map(d => ML_DAY[Object.keys(ML_DAY).find(k => k.startsWith(d.charAt(0).toUpperCase() + d.slice(1))) || d] || d),
    } : sec.enemyAnalysis;

    const warnings = sec.warnings ? sec.warnings.map(w => tWarning(w, lang, analysis)) : sec.warnings;
    const conflicts = sec.conflicts ? sec.conflicts.map(c => tConflict(c, lang, analysis)) : sec.conflicts;

    const nextHour = sec.nextHour ? {
      ...sec.nextHour,
      day: tDay(sec.nextHour.day, lang),
      planet: tPlanet(sec.nextHour.planet, lang),
    } : sec.nextHour;

    return { ...sec, section: title, status, body, consequence, windows, ranked, avoid, enemyAnalysis, warnings, conflicts, nextHour };
  });

  const expertNarrative = analysis.expertNarrative?.map((line, i) => mlNarrative(line, i, analysis, lang));

  return {
    ...analysis,
    report,
    expertNarrative,
    verdict: tVerdict(analysis.verdict, lang),
    ritualType: lang === "ml"
      ? (analysis.ritualSemanticMl || ML_RITUAL_TYPE[analysis.ritualType] || analysis.ritualType)
      : analysis.ritualType,
    ritualCategory: lang === "ml"
      ? (analysis.ritualSemanticMl || ML_RITUAL_TYPE[analysis.ritualCategory] || analysis.ritualCategory)
      : analysis.ritualCategory,
    // ── verdictReason: ORIGINAL Astro Clock text — never translated or overridden ──
    // The Astrology Clock is the only authority. The engine's verdictReason
    // contains the original Astro Clock explanation. This I18n layer passes
    // it through unchanged — the user sees the exact Astro Clock text.
    verdictReason: analysis.verdictReason,
    khayrSharr: ML_KHAYR_SHARR[analysis.khayrSharr] || analysis.khayrSharr,
    khayrSharrMeaning: ML_KHAYR_SHARR_MEANING[analysis.khayrSharr] || analysis.khayrSharrMeaning,
    bestDayReason: mlBestReason(analysis, "day"),
    bestHourReason: mlBestReason(analysis, "hour"),
    dayNightSuitability: analysis.dayNightSuitability ? {
      ...analysis.dayNightSuitability,
      reason: ML_DAY_NIGHT_REASON[analysis.dayNightSuitability.status] || analysis.dayNightSuitability.reason,
    } : analysis.dayNightSuitability,
    elementCompatibility: analysis.elementCompatibility ? {
      ...analysis.elementCompatibility,
      reason: mlElementReason(analysis),
    } : analysis.elementCompatibility,
    zodiacSuitability: analysis.zodiacSuitability ? {
      ...analysis.zodiacSuitability,
      note: "രാശി വിശകലനം ഐച്ഛികമാണ് — ചന്ദ്ര വിശകലന കാർഡ് ഉപയോഗിക്കുക.",
    } : analysis.zodiacSuitability,
    enemyAnalysis: analysis.enemyAnalysis ? {
      ...analysis.enemyAnalysis,
      note: mlEnemyNote(analysis),
    } : analysis.enemyAnalysis,
    canPerformToday: tStatus(analysis.canPerformToday, lang),
    astroClockStatus: {
      ...analysis.astroClockStatus,
      day: tDay(analysis.astroClockStatus?.day, lang),
      dayRuler: tPlanet(analysis.astroClockStatus?.dayRuler, lang),
      currentHour: {
        ...analysis.astroClockStatus?.currentHour,
        planet: tPlanet(analysis.astroClockStatus?.currentHour?.planet, lang),
      },
      moonPhase: analysis.astroClockStatus?.moonPhase,
    },
    moonPhase: {
      ...analysis.moonPhase,
      phaseName: analysis.moonPhase?.phaseName === "Waxing" ? "വർദ്ധമാനം" : analysis.moonPhase?.phaseName === "Waning" ? "ക്ഷയം" : analysis.moonPhase?.phaseName,
      assessment: mlMoonAssessment(analysis),
    },
    bestDay: analysis.bestDay ? tDay(analysis.bestDay, lang) : null,
    altDay: analysis.altDay ? tDay(analysis.altDay, lang) : null,
    bestPlanetaryHour: analysis.bestPlanetaryHour ? tPlanet(analysis.bestPlanetaryHour, lang) : null,
    bestRulingPlanet: analysis.bestRulingPlanet ? tPlanet(analysis.bestRulingPlanet, lang) : null,
    bestWindowsToday: analysis.bestWindowsToday?.map(w => ({ ...w, planet: tPlanet(w.planet, lang), period: w.period === "day" ? "പകൽ" : w.period === "night" ? "രാത്രി" : w.period, reason: tWindowReason(w.reason, w.planet, analysis.ritualType, lang) })),
    avoidWindowsToday: analysis.avoidWindowsToday?.map(w => ({ ...w, planet: tPlanet(w.planet, lang), reason: tAvoidReason(w.reason, lang) })),
    rankedWindows: analysis.rankedWindows?.map(w => ({ ...w, planet: tPlanet(w.planet, lang) })),
    topThree: analysis.topThree?.map(w => ({ ...w, planet: tPlanet(w.planet, lang) })),
    nextOpportunity: analysis.nextOpportunity ? {
      ...analysis.nextOpportunity,
      dayName: tDay(analysis.nextOpportunity.dayName, lang),
      planet: tPlanet(analysis.nextOpportunity.planet, lang),
    } : null,
    warnings: analysis.warnings?.map(w => tWarning(w, lang, analysis)),
    liveNow: analysis.liveNow ? {
      ...analysis.liveNow,
      day: tDay(analysis.liveNow.day, lang),
      dayRuler: tPlanet(analysis.liveNow.dayRuler, lang),
      laylNahar: analysis.liveNow.laylNahar === "Layl" ? (lang === "ml" ? "ലൈൽ" : "Layl") : analysis.liveNow.laylNahar === "Nahar" ? (lang === "ml" ? "നഹർ" : "Nahar") : analysis.liveNow.laylNahar,
      kawkab: tPlanet(analysis.liveNow.kawkab, lang),
      planetaryHour: tPlanet(analysis.liveNow.planetaryHour, lang),
      currentHour: { ...analysis.liveNow.currentHour, planet: tPlanet(analysis.liveNow.currentHour?.planet, lang) },
    } : analysis.liveNow,
    selectionAnalysis: localizeSelectionAnalysis(analysis.selectionAnalysis, lang),
    reasoning: analysis.reasoning?.map(r => mlReasoning(r, analysis, lang)),
  };
}

// ── Translate moon phase assessment for RitualTimingAnalysis ──
function mlMoonAssessment(analysis) {
  const a = analysis;
  const ld = a?.moonPhase?.lunarDay;
  const phaseName = a?.moonPhase?.phaseName;
  const assessment = a?.moonPhase?.assessment || "";
  if (assessment.includes("No moon restriction")) {
    return `ഗ്രന്ഥങ്ങളിൽ ചന്ദ്രദശ നിർബന്ധമില്ല (ദിവസം ${ld}).`;
  }
  if (assessment.includes("NOT satisfied")) {
    return `ചന്ദ്രദശാ വ്യവസ്ഥ പാലിക്കപ്പെട്ടില്ല (ദിവസം ${ld}).`;
  }
  if (assessment.includes("satisfied")) {
    return `ചന്ദ്രദശാ വ്യവസ്ഥ പാലിക്കപ്പെട്ടു (ദിവസം ${ld}).`;
  }
  return assessment;
}

// ── Translate reasoning log entries (pattern-based) ──
function mlReasoning(line, analysis, lang) {
  if (lang !== "ml" || !line) return line;
  const a = analysis;
  let m;

  // "Ritual identified as "X" via Y."
  if ((m = line.match(/^Ritual identified as "(.+?)" via (.+)\.$/))) {
    const rt = a?.ritualSemanticMl || tRitualType(m[1], "ml") || m[1];
    return `കർമ്മം "${rt}" ആയി തിരിച്ചറിഞ്ഞു — അടിസ്ഥാനം: ${tMatchedOn(m[2])}.`;
  }
  // "ManuscriptRule DB: N matching rule(s). JS fallback: ..."
  if ((m = line.match(/^ManuscriptRule DB: (\d+) matching rule\(s\)\. JS fallback: (.+)\.$/))) {
    const fallback = m[2].includes("disabled")
      ? "പ്രവർത്തനരഹിതം (ലക്ഷ്യം തിരഞ്ഞെടുത്തിട്ടുണ്ട് — കൈയെഴുത്തുപ്രതി നിയമങ്ങൾ മാത്രം)"
      : "പ്രവർത്തനക്ഷമം (ലക്ഷ്യം തിരഞ്ഞെടുത്തിട്ടില്ല)";
    return `കൈയെഴുത്തുപ്രതി ഡാറ്റാബേസ്: ${m[1]} നിയമം(ങ്ങൾ) പൊരുത്തപ്പെട്ടു. JS ബാക്കപ്: ${fallback}.`;
  }
  // "Current: Day, hour #N (Planet), moon day N, day/night."
  if ((m = line.match(/^Current: (\w+), hour #(\d+) \((\w+)\), moon day (\d+), (day|night)\.$/))) {
    const day = tDay(m[1], "ml");
    const planet = tPlanet(m[3], "ml");
    const period = m[5] === "night" ? "രാത്രി" : "പകൽ";
    return `നിലവിൽ: ${day}, മണിക്കൂർ #${m[2]} (${planet}), ചാന്ദ്ര ദിവസം ${m[4]}, ${period}.`;
  }
  return line;
}

// ── Malayalam expert narrative lines ──
// Pattern-based: the engine pushes up to 9 conditional narrative lines, so the
// final array index is NOT stable. We match by the English content pattern and
// rebuild the line in Malayalam, extracting dynamic values (ritual type, day
// names, planet names, counts, times) and translating them via the t* helpers.
function mlNarrative(line, idx, analysis, lang) {
  if (lang !== "ml" || !line) return line;
  const a = analysis;
  let m;

  // 0 — "This ritual has been identified as "X" from your Mizan results and custom purpose (Y)."
  if ((m = line.match(/^This ritual has been identified as "(.+?)" from your Mizan results and custom purpose \((.+?)\)\.$/))) {
    const rt = a?.ritualSemanticMl || tRitualType(m[1], "ml") || m[1];
    const matched = tMatchedOn(m[2]);
    return `നിങ്ങളുടെ മിസാൻ ഫലങ്ങളിൽ നിന്നും ഇഷ്ടാനുസൃത ലക്ഷ്യത്തിൽ നിന്നും (${matched}) ഈ കർമ്മം "${rt}" ആയി തിരിച്ചറിഞ്ഞിരിക്കുന്നു — ശരിയായ സമയത്ത് അനുഷ്ഠിക്കേണ്ട ഒരു ആധ്യാത്മിക പ്രവർത്തനം. ഇത് ${tRitualType(a?.ritualCategory, "ml") || "പൊതുവായ ആധ്യാത്മിക കർമ്മം"} വിഭാഗത്തിൽ പെടുന്നു.`;
  }
  // 1 — "N manuscript rule(s) were found in the database for this ritual, supplemented by the JS knowledge base."
  if ((m = line.match(/^(\d+) manuscript rule\(s\) were found in the database for this ritual, supplemented by the JS knowledge base\.$/))) {
    return `ഈ കർമ്മത്തിനായി ഡാറ്റാബേസിൽ ${m[1]} ഗ്രന്ഥ നിയമം(ങ്ങൾ) കണ്ടെത്തി; JS വിജ്ഞാനകോശം കൂടി ഉപയോഗിച്ചു.`;
  }
  // 2 — "No matching rules were found in the ManuscriptRule database; recommendations fall back to the existing JS knowledge base (X)."
  if (/^No matching rules were found in the ManuscriptRule database/.test(line)) {
    return `ഗ്രന്ഥനിയമ ഡാറ്റാബേസിൽ പൊരുത്തമുള്ള നിയമങ്ങളൊന്നും കണ്ടെത്തിയില്ല; ശുപാർശകൾ നിലവിലുള്ള JS വിജ്ഞാനകോശത്തിലേക്ക് പിൻതിരിയുന്നു.`;
  }
  // 3 — "The manuscripts prescribe day(s): X."
  if ((m = line.match(/^The manuscripts prescribe day\(s\): (.+)\.$/))) {
    const days = m[1].split(",").map(d => tDay(d.trim(), "ml")).join(", ");
    return `ഗ്രന്ഥങ്ങൾ നിർദ്ദേശിക്കുന്ന ദിവസം(ങ്ങൾ): ${days}.`;
  }
  // 4 — "The manuscripts prescribe hour(s) ruled by: X."
  if ((m = line.match(/^The manuscripts prescribe hour\(s\) ruled by: (.+)\.$/))) {
    const planets = m[1].split(",").map(p => tPlanet(p.trim(), "ml")).join(", ");
    return `ഗ്രന്ഥങ്ങൾ നിർദ്ദേശിക്കുന്ന മണിക്കൂർ(ങ്ങൾ) ഭരിക്കുന്നത്: ${planets}.`;
  }
  // 5 — "The manuscripts require a X moon."
  if ((m = line.match(/^The manuscripts require a (.+) moon\.$/))) {
    return `ഗ്രന്ഥങ്ങൾ ${tMoonPhase(m[1])} ചന്ദ്രദശ ആവശ്യമാക്കുന്നു.`;
  }
  // 6 — "The manuscripts require this work be performed at night."
  if (/^The manuscripts require this work be performed at night\.$/.test(line)) {
    return `ഗ്രന്ഥങ്ങൾ ഈ കർമ്മം രാത്രിയിൽ അനുഷ്ഠിക്കാൻ ആവശ്യമാക്കുന്നു.`;
  }
  // 7 — "The earliest fully valid opportunity is X (today) / (N day(s) away) at TIME–TIME."
  if ((m = line.match(/^The earliest fully valid opportunity is (.+?)(?: \(today\)| \((\d+) day\(s\) away\)) at (.+?)–(.+?)\.$/))) {
    const day = tDay(m[1], "ml");
    const when = m[2] ? `(${m[2]} ദിവസം അകലെ)` : "(ഇന്ന്)";
    return `ഏറ്റവും നേരത്തെ പൂർണ്ണമായും സാധുവായ അവസരം ${day} ${when}, ${m[3]}–${m[4]}-ഓട്.`;
  }
  // 8 — "No specific day, hour, or moon restriction was found in the manuscripts for this ritual — timing is guided by the general planetary conditions only."
  if (/^No specific day, hour, or moon restriction was found/.test(line)) {
    return `ഈ കർമ്മത്തിന് ഗ്രന്ഥങ്ങളിൽ പ്രത്യേക ദിവസം, മണിക്കൂർ, അല്ലെങ്കിൽ ചന്ദ്രദശ നിർബന്ധമൊന്നും കണ്ടെത്തിയില്ല — സമയനിർണ്ണയം പൊതുവായ ഗ്രഹ അവസ്ഥകൾ മാത്രം അടിസ്ഥാനമാക്കിയുള്ളതാണ്.`;
  }
  return line;
}

// ── Translate the "matchedOn" fragment in narrative line 0 ──
function tMatchedOn(val) {
  if (!val) return "";
  const ML = {
    "purpose card": "ലക്ഷ്യ കാർഡ്",
    "Mizan purpose card": "മിസാൻ ലക്ഷ്യ കാർഡ്",
    "custom purpose": "ഇഷ്ടാനുസൃത ലക്ഷ്യം",
    "custom purpose text": "ഇഷ്ടാനുസൃത ലക്ഷ്യ വാചകം",
    "Mizan results": "മിസാൻ ഫലങ്ങൾ",
  };
  if (ML[val]) return ML[val];
  // Try substring matches for composite phrases
  let out = val;
  for (const [en, ml] of Object.entries(ML)) out = out.replace(en, ml);
  return out;
}

// ── Translate moon-phase word in narrative line 5 ──
function tMoonPhase(val) {
  if (!val) return "";
  const ML = {
    "waxing": "വർദ്ധമാന (مقبل)",
    "waning": "ക്ഷയ (مدبر)",
    "full": "പൗർണ്ണമി (بدر)",
    "new": "അമാവാസ (محاق)",
    "waxing (مقبل)": "വർദ്ധമാന (مقبل)",
    "waning (مدبر)": "ക്ഷയ (مدبر)",
  };
  return ML[val.toLowerCase()] || val;
}

// ── Localize ConfigurationAdvisor recommendations ──
export function localizeAdvice(advice, lang) {
  if (lang !== "ml" || !advice) return advice;
  const base = advice.base ? localizeAnalysis(advice.base, lang) : advice.base;
  const recommendations = (advice.recommendations || []).map(r => ({
    ...r,
    field: tFieldLabel(r.field, lang),
    current: tAdvisorCurrent(r, lang),
    recommended: tAdvisorRecommended(r, lang),
    reason: tAdvisorReason(r, lang),
  }));
  return { ...advice, recommendations, base };
}

function tAdvisorCurrent(r, lang) {
  if (lang !== "ml") return r.current;
  const v = r.current;
  if (ML_FIELD_VALUE[v]) return ML_FIELD_VALUE[v];
  if (ML_DAY[v]) return ML_DAY[v];
  if (ML_PLANET[v]) return ML_PLANET[v];
  if (ML_ELEMENT[v]) return ML_ELEMENT[v];
  if (ML_RITUAL_TYPE[v]) return ML_RITUAL_TYPE[v];
  if (/^Hour #/.test(v)) return v.replace("Hour #", "മണിക്കൂർ #");
  if (/^Now:/.test(v)) return v.replace("Now:", "ഇപ്പോൾ:");
  if (/^Not selected \(auto-inferred:/.test(v)) return v.replace("Not selected (auto-inferred:", "തിരഞ്ഞെടുത്തിട്ടില്ല (സ്വയമേവ നിർണ്ണയിച്ചത്:").replace("Khayr", "ഖൈർ").replace("Sharr", "ശർ");
  if (/^"(.*)"$/.test(v)) return v; // custom purpose quoted
  return v;
}

function tAdvisorRecommended(r, lang) {
  if (lang !== "ml") return r.recommended;
  const v = r.recommended;
  if (ML_FIELD_VALUE[v]) return ML_FIELD_VALUE[v];
  if (ML_DAY[v]) return ML_DAY[v];
  if (ML_PLANET[v]) return ML_PLANET[v];
  if (ML_ELEMENT[v]) return ML_ELEMENT[v];
  if (ML_RITUAL_TYPE[v]) return ML_RITUAL_TYPE[v];
  // "Friday or Tuesday (alternative)" pattern
  const orMatch = v.match(/^(\w+) or (\w+) \(alternative\)$/);
  if (orMatch) return `${ML_DAY[orMatch[1]] || orMatch[1]} അല്ലെങ്കിൽ ${ML_DAY[orMatch[2]] || orMatch[2]} (ബദൽ)`;
  if (/^Hour #/.test(v)) return v.replace(/Hour #(\d+)/g, "മണിക്കൂർ #$1").replace(/ or /g, " അല്ലെങ്കിൽ ");
  if (/^Best for targets born under:/.test(v)) return v.replace("Best for targets born under:", "ലക്ഷ്യ വ്യക്തി ഈ രാശികളിൽ ജനിച്ചവരാണെങ്കിൽ ഉത്തമം:");
  return v;
}

function tAdvisorReason(r, lang) {
  if (lang !== "ml") return r.reason;
  // Field-specific natural Malayalam reasons built from structured data
  const f = r.field;
  const optimal = r.isOptimal;
  const cur = r.current;
  const rec = r.recommended;

  // Ritual Purpose
  if (/Ritual Purpose|ആചാര ലക്ഷ്യം/.test(f)) {
    return optimal
      ? `നിങ്ങളുടെ ലക്ഷ്യം തിരിച്ചറിഞ്ഞിട്ടുണ്ട്. ഈ കർമ്മത്തിന് ഗ്രന്ഥങ്ങൾ നിർദ്ദിഷ്ട സമയങ്ങൾ നൽകുന്നു — താഴെയുള്ള മണ്ഡലങ്ങൾ കാണുക.`
      : `ലക്ഷ്യം തിരഞ്ഞെടുത്തിട്ടില്ല അല്ലെങ്കിൽ പൊരുത്തപ്പെട്ടിട്ടില്ല. ആചാര ലക്ഷ്യം അറിയാതെ യന്ത്രത്തിന് സമയം നിർദ്ദേശിക്കാൻ കഴിയില്ല. മിസാൻ 7-ൽ ഒരു ലക്ഷ്യം തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ പ്രണയം, രോഗശാന്തി, ഐശ്വര്യം, സംരക്ഷണം, വേർപിരിക്കൽ തുടങ്ങിയ ലക്ഷ്യം ടൈപ്പ് ചെയ്യുക.`;
  }
  if (/Khayr|ഖൈർ/.test(f)) {
    if (/\(auto-inferred/.test(cur)) {
      const pol = /Khayr/.test(cur) ? "ഖൈർ" : "ശർ";
      return `മിസാൻ 8-ൽ ഖൈർ/ശർ തിരഞ്ഞെടുത്തിട്ടില്ലാത്തതിനാൽ യന്ത്രം ലക്ഷ്യ വിഭാഗത്തിൽ നിന്ന് ${pol} അനുമാനിച്ചു. ഇത് സ്പഷ്ടമാക്കി സമയ നിയമങ്ങൾ ഉറപ്പിക്കാൻ മിസാൻ 8-ൽ ${pol} തിരഞ്ഞെടുക്കുക. അൽ-ഷുരൂത് p.13 ഓരോ ധ്രുവതലത്തിനും വ്യത്യസ്ത മണിക്കൂർ-ചന്ദ്ര നിയന്ത്രണങ്ങൾ നൽകുന്നു.`;
    }
    return optimal ? `നിങ്ങൾ സ്പഷ്ടമായി ഖൈർ/ശർ തിരഞ്ഞെടുത്തിട്ടുണ്ട്, ഇത് ലക്ഷ്യ വിഭാഗവുമായി യോജിക്കുന്നു. ഇത് ഉത്തമമാണ്.` : `മിസാൻ 8-ൽ ഖൈർ അല്ലെങ്കിൽ ശർ തിരഞ്ഞെടുത്ത് ധ്രുവതല-നിർദ്ദിഷ്ട സമയ നിയമങ്ങൾ സജീവമാക്കുക.`;
  }
  if (/Weekday|ദിവസം/.test(f)) {
    if (optimal) return `തിരഞ്ഞെടുത്ത ദിവസം ഈ കർമ്മത്തിനുള്ള ഗ്രന്ഥ നിർദ്ദേശവുമായി യോജിക്കുന്നു. ഇത് ഉത്തമമാണ്.`;
    return `തിരഞ്ഞെടുത്ത ദിവസത്തിന്റെ ഭരണ ഗ്രഹം ഈ തരം കർമ്മത്തെ ഭരിക്കുന്നില്ല — ശുപാർശ ചെയ്ത ദിവസത്തിലേക്ക് മാറ്റുന്നത് ദിവസത്തിന്റെ ഗ്രഹോർജസ്സിനെ ആചാര ലക്ഷ്യവുമായി യോജിപ്പിക്കും.`;
  }
  if (/Planet|ഗ്രഹം/.test(f) && !/Hour/.test(f)) {
    if (optimal) return `തിരഞ്ഞെടുത്ത ഗ്രഹം നിർദ്ദേശിത ഗ്രഹവുമായി യോജിക്കുന്നു. ഇത് ഉത്തമമാണ്.`;
    return `ഗ്രഹാധിപൻ ഏത് ജ്വലനങ്ങൾക്കാണ് മറുപടി നൽകുന്നതെന്ന് നിയന്ത്രിക്കുന്നു — ശുപാർശ ചെയ്ത ഗ്രഹം തിരഞ്ഞെടുക്കുന്നത് ശരിയായ ആധ്യാത്മിക മണ്ഡലം സജീവമാക്കും.`;
  }
  if (/Planetary Hour|ഗ്രഹ മണിക്കൂർ/.test(f)) {
    if (optimal) return `തിരഞ്ഞെടുത്ത മണിക്കൂർ നിർദ്ദേശിത ഗ്രഹത്താൽ ഭരിക്കപ്പെടുന്നു. ഇത് ഉത്തമമാണ്.`;
    return `ശുപാർശ ചെയ്ത ഗ്രഹ മണിക്കൂറിലേക്ക് മാറുന്നത് ഗ്രഹ ശക്തിയെ ആചാരവുമായി യോജിപ്പിക്കും.`;
  }
  if (/Element|മൂലകം/.test(f)) {
    if (optimal) return `പ്രധാന മൂലകം ഈ കർമ്മത്തിന് ശുപാർശ ചെയ്ത മൂലകവുമായി യോജിക്കുന്നു. ഇത് ഉത്തമമാണ്.`;
    return `മൂലകം താൻത്രിക രേഖയുടെ ആധ്യാത്മിക സ്വഭാവം, ദിശ (അൽ-ഷുരൂത് p.42), സ്ഥാപനം (അൽ-ഷുരൂത് p.37) എന്നിവ നിർണ്ണയിക്കുന്നു. ശുപാർശ മൂലകം ഉപയോഗിക്കുന്നത് കർമ്മത്തിന്റെ ലക്ഷ്യവുമായുള്ള അനുരണനം ശക്തിപ്പെടുത്തും.`;
  }
  if (/Day \/ Night|പകൽ \/ രാത്രി/.test(f)) {
    if (/MUST be performed at night|രാത്രിയിൽ അനുഷ്ഠിക്കണം/.test(r.reason) && !optimal)
      return `ഈ കർമ്മം രാത്രിയിൽ അനുഷ്ഠിക്കണം — പകലിൽ സൂര്യൻ എല്ലാ ജ്വലനങ്ങളെയും തടയുന്നു (അൽ-ഷുരൂത് p.39-40, NGT_002). മിസാൻ 3-ൽ രാത്രി (ഗെസെ) ആയി മാറ്റുക.`;
    if (optimal) return `പകൽ/രാത്രി തിരഞ്ഞെടുപ്പ് ഈ കർമ്മത്തിനുള്ള ഗ്രന്ഥ നിർബന്ധം പാലിക്കുന്നു. ഇത് ഉത്തമമാണ്.`;
    return `എല്ലാ ആധ്യാത്മിക കർമ്മങ്ങൾക്കും രാത്രി പകലിനേക്കാൾ ഉത്തമമാണെന്ന് ഗ്രന്ഥങ്ങൾ പറയുന്നു, കാരണം പകലിൽ സൂര്യൻ ജ്വലനങ്ങളെ തടയുന്നു (അൽ-ഷുരൂത് p.39). ശക്തമായ ഫലത്തിനായി രാത്രി (ഗെസെ) പരിഗണിക്കുക.`;
  }
  if (/Best Time|ഏറ്റവും ഉത്തമ സമയം/.test(f)) {
    if (optimal) return `നിലവിലെ സമയം ഒരു ഉത്തമ ഗ്രഹ മണിക്കൂറിനുള്ളിലാണ്. ഇപ്പോൾ കർമ്മം അനുഷ്ഠിക്കാം.`;
    return `നിലവിലെ സമയം അനുയോജ്യമല്ല; ഇന്നത്തെ ഉത്തമ സമയത്തിനായി കാത്തിരിക്കുക. ഇത് ഇന്നത്തെ യഥാർത്ഥ ഗ്രഹ മണിക്കൂറുകളും നിലവിലെ ചന്ദ്രദശയും അടിസ്ഥാനമാക്കിയുള്ള തത്സമയ ശുപാർശയാണ്.`;
  }
  if (/Zodiac|രാശി/.test(f)) return `രാശി മിസാൻ തിരഞ്ഞെടുപ്പുകളുടെ ഭാഗമല്ല. ലക്ഷ്യ വ്യക്തിയുടെ ജന്മ രാശി അറിഞ്ഞാൽ, അവരുടെ രാശിയുമായി യോജിക്കുന്ന ദിവസത്തിൽ കർമ്മം അനുഷ്ഠിക്കുന്നത് ഫലം ശക്തിപ്പെടുത്തും (അൽ-ഷുരൂത് p.18-19). ഇത് വിവരപരമാണ് — മിസാൻ മാറ്റമൊന്നും ആവശ്യമില്ല.`;
  if (/Nakshatra|നക്ഷത്രം/.test(f)) return `നക്ഷത്രം (ചാന്ദ്ര മാളിക) ഒമ്പത് മിസാനിൽ ഉൾപ്പെടുന്നില്ല. ആസ്ട്രോ ക്ലോക്ക് മൊഡ്യൂൾ നിലവിലെ ചാന്ദ്ര മാളിക തത്സമയം പിന്തുടരുന്നു. ഇത് വിവരപരമാണ് — മിസാൻ മാറ്റമൊന്നും ആവശ്യമില്ല.`;
  return r.reason;
}