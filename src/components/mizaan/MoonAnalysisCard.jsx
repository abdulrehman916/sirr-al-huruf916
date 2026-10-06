// ═══════════════════════════════════════════════════════════════
// MOON ANALYSIS CARD — User-controlled, 100% optional
// ═══════════════════════════════════════════════════════════════
// By default, the Ritual Timing Engine IGNORES Moon entirely.
// Moon analysis starts ONLY if the user explicitly selects one of:
//
//   ○ Show Current Moon Status  — display live Moon data + check
//                                  against manuscript rules (if any)
//
//   ○ Plan Ritual by Moon       — user picks desired Mansion/Zodiac/
//                                  Phase → engine finds when Moon
//                                  enters that condition → evaluates
//                                  ALL manuscript conditions at that
//                                  future moment
//
// Moon alone NEVER approves a ritual. A future time is valid ONLY
// when ALL required manuscript conditions are simultaneously satisfied.
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, ChevronDown, Check, X, Minus, CalendarClock, Search, AlertTriangle, Sparkles, BookOpen } from "lucide-react";
import {
  analyzeMoonCompatibility,
  planRitualByMoon,
  MOON_MANSIONS,
  ZODIAC_SIGNS,
} from "../../lib/ritualTimingEngineV3";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  pass: "#4ADE80",
  fail: "#F87171",
  neutral: "rgba(255,255,255,0.40)",
  blue: "rgba(96,165,250,0.90)",
  blueBorder: "rgba(96,165,250,0.35)",
};

// ── Engine check label/reason translators (Malayalam) ──
const ML_CHECK_LABEL = {
  "Day": "ദിവസം",
  "Saat": "സഅാത്",
  "Kawkab": "കവ്കബ്",
  "Nahas (Day)": "നഹാസ് (ദിവസം)",
  "Nahas (Hour)": "നഹാസ് (മണിക്കൂർ)",
  "Day / Night": "പകൽ / രാത്രി",
  "Manuscript Moon Phase": "കൈയെഴുത്തുപ്രതി ചന്ദ്രദശ",
  "Manuscript Moon Zodiac": "കൈയെഴുത്തുപ്രതി ചന്ദ്ര രാശി",
  "Manuscript Moon Mansion": "കൈയെഴുത്തുപ്രതി ചന്ദ്ര മാളിക",
  "Moon Phase": "ചന്ദ്രദശ",
  "Moon Zodiac": "ചന്ദ്ര രാശി",
  "Moon Mansion": "ചന്ദ്ര മാളിക",
};
const ML_DAY_MAP = { Sunday: "ഞായർ", Monday: "തിങ്കൾ", Tuesday: "ചൊവ്വ", Wednesday: "ബുധൻ", Thursday: "വ്യാഴം", Friday: "വെള്ളി", Saturday: "ശനി" };
const ML_PLANET_MAP = { Sun: "സൂര്യൻ", Moon: "ചന്ദ്രൻ", Mars: "ചൊവ്വ", Mercury: "ബുധൻ", Jupiter: "ഗുരു", Venus: "ശുക്രൻ", Saturn: "ശനി" };

function tCheckLabel(label, lang) {
  if (lang !== "ml" || !label) return label;
  return ML_CHECK_LABEL[label] || label;
}
function tCheckReason(reason, lang) {
  if (lang !== "ml" || !reason) return reason;
  let r = reason;
  for (const [en, ml] of Object.entries(ML_DAY_MAP)) r = r.split(en).join(ml);
  for (const [en, ml] of Object.entries(ML_PLANET_MAP)) r = r.split(en).join(ml);
  r = r.replace("Day is prescribed by manuscript.", "ദിവസം ഗ്രന്ഥപ്രകാരം നിർദ്ദേശിച്ചതാണ്.");
  r = r.replace("Day is not prescribed by manuscript.", "ദിവസം ഗ്രന്ഥപ്രകാരം നിർദ്ദേശിച്ചതല്ല.");
  r = r.replace("Nahas restriction exists.", "നഹാസ് നിർബന്ധം നിലവിലുണ്ട്.");
  r = r.replace("No Nahas on this day.", "ഈ ദിവസത്തിന് നഹാസ് ഇല്ല.");
  r = r.replace("Nahas restriction exists on this hour.", "ഈ മണിക്കൂറിന് നഹാസ് നിർബന്ധം നിലവിലുണ്ട്.");
  r = r.replace("No Nahas on this hour.", "ഈ മണിക്കൂറിന് നഹാസ് ഇല്ല.");
  r = r.replace("Saat is prescribed by manuscript.", "സഅാത് ഗ്രന്ഥപ്രകാരം നിർദ്ദേശിച്ചതാണ്.");
  r = r.replace("No suitable Saat found on this day.", "ഈ ദിവസത്തിൽ അനുയോജ്യമായ സഅാത് ഇല്ല.");
  r = r.replace("Kawkab matches manuscript prescription.", "കവ്കബ് ഗ്രന്ഥ നിർദ്ദേശവുമായി പൊരുത്തപ്പെടുന്നു.");
  r = r.replace("Kawkab does not match prescription.", "കവ്കബ് നിർദ്ദേശവുമായി പൊരുത്തപ്പെടുന്നില്ല.");
  r = r.replace("Night, as required by manuscript.", "രാത്രി, ഗ്രന്ഥപ്രകാരം ആവശ്യമുള്ളത്.");
  r = r.replace("Manuscript requires night but no night Saat available.", "ഗ്രന്ഥം രാത്രി ആവശ്യമാക്കുന്നു, എന്നാൽ രാത്രി സഅാത് ലഭ്യമല്ല.");
  r = r.replace("Manuscript Moon phase satisfied.", "കൈയെഴുത്തുപ്രതി ചന്ദ്രദശ പാലിക്കപ്പെട്ടു.");
  r = r.replace("Manuscript Moon phase NOT satisfied.", "കൈയെഴുത്തുപ്രതി ചന്ദ്രദശ പാലിക്കപ്പെട്ടില്ല.");
  r = r.replace("Manuscript Moon zodiac satisfied.", "കൈയെഴുത്തുപ്രതി ചന്ദ്ര രാശി പാലിക്കപ്പെട്ടു.");
  r = r.replace("Manuscript Moon zodiac NOT satisfied.", "കൈയെഴുത്തുപ്രതി ചന്ദ്ര രാശി പാലിക്കപ്പെട്ടില്ല.");
  r = r.replace("Manuscript Moon mansion satisfied.", "കൈയെഴുത്തുപ്രതി ചന്ദ്ര മാളിക പാലിക്കപ്പെട്ടു.");
  r = r.replace("Manuscript Moon mansion NOT satisfied.", "കൈയെഴുത്തുപ്രതി ചന്ദ്ര മാളിക പാലിക്കപ്പെട്ടില്ല.");
  r = r.replace("Selected Moon phase matched.", "തിരഞ്ഞെടുത്ത ചന്ദ്രദശ പൊരുത്തപ്പെട്ടു.");
  r = r.replace("Selected Moon phase NOT matched.", "തിരഞ്ഞെടുത്ത ചന്ദ്രദശ പൊരുത്തപ്പെട്ടില്ല.");
  r = r.replace("Selected Moon zodiac matched.", "തിരഞ്ഞെടുത്ത ചന്ദ്ര രാശി പൊരുത്തപ്പെട്ടു.");
  r = r.replace("Selected Moon zodiac NOT matched.", "തിരഞ്ഞെടുത്ത ചന്ദ്ര രാശി പൊരുത്തപ്പെട്ടില്ല.");
  r = r.replace("Selected Moon mansion matched.", "തിരഞ്ഞെടുത്ത ചന്ദ്ര മാളിക പൊരുത്തപ്പെട്ടു.");
  r = r.replace("Selected Moon mansion NOT matched.", "തിരഞ്ഞെടുത്ത ചന്ദ്ര മാളിക പൊരുത്തപ്പെട്ടില്ല.");
  r = r.replace("None available", "ലഭ്യമല്ല");
  r = r.replace("Any", "ഏതെങ്കിലും");
  r = r.replace("Avoid enemy/worst planets", "ശത്രു/മോശം ഗ്രഹങ്ങൾ ഒഴിവാക്കുക");
  r = r.replace("Night", "രാത്രി");
  r = r.replace("Day", "പകൽ");
  return r;
}
function tDayName(name, lang) {
  if (lang !== "ml" || !name) return name;
  return ML_DAY_MAP[name] || name;
}
function tMoonPhaseName(name, lang) {
  if (lang !== "ml" || !name) return name;
  if (name === "Waxing") return "വർദ്ധമാനം";
  if (name === "Waning") return "ക്ഷയം";
  return name;
}
const ML_MONTH_MAP = {
  January: "ജനുവരി", February: "ഫെബ്രുവരി", March: "മാർച്ച്", April: "ഏപ്രിൽ",
  May: "മേയ്", June: "ജൂൺ", July: "ജൂലൈ", August: "ഓഗസ്റ്റ്",
  September: "സെപ്റ്റംബർ", October: "ഒക്ടോബർ", November: "നവംബർ", December: "ഡിസംബർ",
};
function tPlanetName(name, lang) {
  if (lang !== "ml" || !name) return name;
  return ML_PLANET_MAP[name] || name;
}
function tMonthName(name, lang) {
  if (lang !== "ml" || !name) return name;
  return ML_MONTH_MAP[name] || name;
}
function tNahasStatus(status, lang) {
  if (lang !== "ml" || !status) return status;
  if (status.includes("blocked")) return "നഹാസ് നിർബന്ധം നിലവിലുണ്ട് — ഈ സമയം തടസ്സപ്പെട്ടു.";
  if (status.includes("No Nahas")) return "നഹാസ് നിർബന്ധമില്ല.";
  return status;
}

// ── Bilingual labels ──
const L = (lang) => ({
  title: lang === "ml" ? "ചന്ദ്ര പ്ലാനിംഗ് (ഐച്ഛികം)" : "Moon Planning (Optional)",
  subtitle: lang === "ml" ? "സ്ഥിരസ്ഥിതി: ചന്ദ്രനെ അവഗണിക്കുക" : "Default: Moon is ignored",
  defaultMsg: lang === "ml"
    ? "സ്ഥിരസ്ഥിതിയായി ആചാര സമയ യന്ത്രം ചന്ദ്രനെ അവഗണിക്കുന്നു. താഴെയുള്ള ഓപ്ഷനുകളിൽ ഒന്ന് തിരഞ്ഞെടുക്കുക."
    : "By default, the Ritual Timing Engine ignores Moon. Select an option below to begin.",
  opt1: lang === "ml" ? "നിലവിലെ ചന്ദ്ര നില കാണിക്കുക" : "Show Current Moon Status",
  opt2: lang === "ml" ? "ചന്ദ്രനെ അടിസ്ഥാനമാക്കി കർമ്മം ആസൂത്രണം ചെയ്യുക" : "Plan Ritual by Moon",
  // Option 1 labels
  currentMoon: lang === "ml" ? "നിലവിലെ ചന്ദ്രൻ" : "Current Moon",
  phase: lang === "ml" ? "ചന്ദ്ര ദശ" : "Moon Phase",
  waxWane: lang === "ml" ? "വർദ്ധമാനം / ക്ഷയം" : "Waxing / Waning",
  zodiacSign: lang === "ml" ? "രാശി" : "Zodiac Sign",
  mansion: lang === "ml" ? "ചാന്ദ്ര മാളിക (മൻസിൽ)" : "Moon Mansion (Manzil)",
  illumination: lang === "ml" ? "പ്രകാശിതർത്ഥം" : "Illumination",
  moonAge: lang === "ml" ? "ചന്ദ്രന്റെ പ്രായം" : "Age of Moon",
  waxing: lang === "ml" ? "വർദ്ധമാനം" : "Waxing",
  waning: lang === "ml" ? "ക്ഷയം" : "Waning",
  day: lang === "ml" ? "ദിവസം" : "Day",
  noRuleTitle: lang === "ml" ? "കൈയെഴുത്തുപ്രതി നിയമം ഇല്ല" : "No Moon Rule Required",
  noRuleMsg: lang === "ml"
    ? "നിലവിലെ ചന്ദ്ര വിവരം കൂടുതൽ അറിവിനായി മാത്രം കാണിക്കുന്നു. കൈയെഴുത്തുപ്രതി പ്രകാരം ഈ കർമ്മത്തിന് ചന്ദ്ര വ്യവസ്ഥകൾ ആവശ്യമില്ല."
    : "Current Moon information is shown for reference only. This ritual does not require Moon conditions according to the manuscript.",
  msRulesTitle: lang === "ml" ? "കൈയെഴുത്തുപ്രതി ചന്ദ്ര നിയമങ്ങൾ" : "Manuscript Moon Rules",
  evaluation: lang === "ml" ? "വിലയിരുത്തൽ" : "Evaluation",
  compatible: lang === "ml" ? "നിലവിലെ ചന്ദ്രൻ കൈയെഴുത്തുപ്രതി നിയമങ്ങളെ പാലിക്കുന്നു." : "Current Moon satisfies the manuscript rules.",
  notCompatible: lang === "ml" ? "നിലവിലെ ചന്ദ്രൻ കൈയെഴുത്തുപ്രതി നിയമങ്ങളെ പാലിക്കുന്നില്ല." : "Current Moon does NOT satisfy the manuscript rules.",
  moonMatchQuestion: lang === "ml"
    ? "നിലവിലെ ചന്ദ്രൻ തിരഞ്ഞെടുത്ത ആചാരവുമായി പൊരുത്തപ്പെടുന്നോ?"
    : "Does the current Moon match the selected ritual?",
  moonMatchYesShort: lang === "ml" ? "✓ പൊരുത്തപ്പെടുന്നു" : "✓ Matches",
  moonMatchNoShort: lang === "ml" ? "✗ പൊരുത്തപ്പെടുന്നില്ല" : "✗ Does not match",
  moonMatchNeverAffects: lang === "ml"
    ? "ഈ കാർഡ് ഒരിക്കലും ആചാര തീരുമാനത്തെ ബാധിക്കുന്നില്ല."
    : "This card never affects the ritual decision.",
  // Option 2 labels
  desiredMansion: lang === "ml" ? "ആഗ്രഹിക്കുന്ന മാളിക" : "Desired Moon Mansion",
  desiredZodiac: lang === "ml" ? "ആഗ്രഹിക്കുന്ന രാശി" : "Desired Moon Zodiac",
  desiredPhase: lang === "ml" ? "വർദ്ധമാനം / ക്ഷയം (ഐച്ഛികം)" : "Waxing / Waning (Optional)",
  anyMansion: lang === "ml" ? "ഏതെങ്കിലും" : "Any",
  anyZodiac: lang === "ml" ? "ഏതെങ്കിലും" : "Any",
  anyPhase: lang === "ml" ? "എതും" : "Any",
  planBtn: lang === "ml" ? "അടുത്ത പൊരുത്തമുള്ള ചന്ദ്ര സമയം കണ്ടെത്തുക" : "Find Next Matching Moon Time",
  planning: lang === "ml" ? "തിരയുന്നു..." : "Searching...",
  moonEnters: lang === "ml" ? "ചന്ദ്രൻ പ്രവേശിക്കുന്നു" : "Moon enters",
  fullEvaluation: lang === "ml" ? "പൂർണ്ണ വിലയിരുത്തൽ" : "Full Evaluation",
  recommended: lang === "ml" ? "✅ ശുപാർശ ചെയ്ത ആചാര സമയം" : "✅ Recommended Ritual Time",
  notRecommended: lang === "ml" ? "അനുയോജ്യമല്ലാത്ത സമയം" : "Not Fully Compatible",
  allPassMsg: lang === "ml"
    ? "ഈ ഭാവി സമയം തിരഞ്ഞെടുത്ത ആചാരം അനുഷ്ഠിക്കാൻ അനുയോജ്യമാണ്."
    : "This future time is compatible for performing the selected ritual.",
  notAllPassMsg: lang === "ml"
    ? "എല്ലാ കൈയെഴുത്തുപ്രതി വ്യവസ്ഥകളും ഒരേസമയം പാലിക്കപ്പെടുന്ന അടുത്ത ചന്ദ്ര അവസരത്തിനായി കാത്തിരിക്കുക."
    : "Wait for the next Moon occurrence where ALL manuscript conditions are satisfied.",
  searching: lang === "ml" ? "തിരയുന്നു..." : "Searching...",
  noResult: lang === "ml"
    ? "ഒരു വർഷത്തിനുള്ളിൽ എല്ലാ വ്യവസ്ഥകളും ഒരേസമയം പാലിക്കുന്ന സമയമില്ല."
    : "No fully compatible time found within one year of searching.",
  noMoonMatch: lang === "ml"
    ? "തിരഞ്ഞെടുത്ത ചന്ദ്ര അവസ്ഥ പാലിക്കുന്ന ദിവസമില്ല."
    : "No matching Moon condition found. Select at least one condition.",
  date: lang === "ml" ? "തീയതി" : "Date",
  time: lang === "ml" ? "സമയം" : "Time",
  month: lang === "ml" ? "മാസം" : "Month",
  dayName: lang === "ml" ? "ദിവസം" : "Day",
  saat: lang === "ml" ? "സഅാത്" : "Saat",
  kawkab: lang === "ml" ? "കവ്കബ്" : "Kawkab",
  moonStatus: lang === "ml" ? "ചന്ദ്രൻ" : "Moon",
  noData: lang === "ml" ? "ചന്ദ്ര വിവരം ലഭ്യമല്ല" : "Moon data unavailable",
  selectCondition: lang === "ml"
    ? "കുറഞ്ഞത് ഒരു ചന്ദ്ര അവസ്ഥയെങ്കിലും തിരഞ്ഞെടുക്കുക."
    : "Select at least one Moon condition to plan.",
  mandatorySection: lang === "ml" ? "നിർബന്ധ കൈയെഴുത്തുപ്രതി നിയമങ്ങൾ" : "Mandatory Manuscript Rules",
  moonPrefSection: lang === "ml" ? "ചന്ദ്ര മുൻഗണനകൾ" : "Moon Preferences",
  enhancementSection: lang === "ml" ? "പൊതു വർദ്ധധനകൾ" : "General Enhancements",
  manuscriptValid: lang === "ml" ? "കർമ്മം കൈയെഴുത്തുപ്രതി പ്രകാരം സാധുവാണ്." : "The ritual is manuscript-valid.",
  moonPrefNotSatisfied: lang === "ml"
    ? "എന്നാൽ, നിങ്ങളുടെ ഐച്ഛിക ചന്ദ്ര മുൻഗണന പൂർണ്ണമായി പാലിക്കപ്പെട്ടില്ല."
    : "However, your optional Moon preference was not fully satisfied.",
  findNextMatch: lang === "ml" ? "അടുത്ത പൊരുത്തമുള്ള സമയം കണ്ടെത്തുക" : "Find Next Matching Time",
  fullyRecommended: lang === "ml"
    ? "പൂർണ്ണമായി ശുപാർശ ചെയ്തു — എല്ലാ വ്യവസ്ഥകളും പാലിക്കപ്പെട്ടു"
    : "Fully Recommended — all conditions satisfied",
  moonPerfectFound: lang === "ml"
    ? "നിങ്ങളുടെ ചന്ദ്ര മുൻഗണനകളും പാലിക്കുന്ന പിന്നീടുള്ള സമയം:"
    : "A later time satisfies all your Moon preferences too:",
  noMoonPerfect: lang === "ml"
    ? "തിരയൽ കാലയളവിൽ നിങ്ങളുടെ ചന്ദ്ര മുൻഗണനകളും പാലിക്കുന്ന സമയമൊന്നും കണ്ടെത്തിയില്ല."
    : "No time found within the search period that also satisfies your Moon preference.",
  noMandatoryMatch: lang === "ml"
    ? "തിരയൽ കാലയളവിൽ കൈയെഴുത്തുപ്രതി പ്രകാരം സാധുവായ സമയമില്ല."
    : "No manuscript-valid time found within the search period.",
  manuscriptValidTime: lang === "ml" ? "കൈയെഴുത്തുപ്രതി പ്രകാരം സാധുവായ സമയം" : "Manuscript-Valid Time",
  invalidTime: lang === "ml" ? "സാധുവല്ലാത്ത സമയം" : "Invalid Time",
  timelineTitle: lang === "ml" ? "ശുപാർശ കാലരേഖ" : "Recommended Timeline",
  bestManuscriptTitle: lang === "ml" ? "✅ മികച്ച കൈയെഴുത്തുപ്രതി സമയം" : "✅ Best Manuscript Time",
  bestManuscriptDesc: lang === "ml"
    ? "ഇത് ഏറ്റവും പഴയ കൈയെഴുത്തുപ്രതി പ്രകാരം സാധുവായ ആചാര സമയമാണ്. കൈയെഴുത്തുപ്രതി ആവശ്യപ്പെടുന്നില്ലെങ്കിൽ ചന്ദ്രനെ അവഗണിക്കുന്നു."
    : "This is the earliest manuscript-valid ritual time. Moon is ignored unless the manuscript itself requires it.",
  bestMoonTitle: lang === "ml" ? "🌙 മികച്ച ചന്ദ്ര മുൻഗണന പൊരുത്തം" : "🌙 Best Moon Preference Match",
  bestMoonDesc: lang === "ml"
    ? "തിരഞ്ഞെടുത്ത ചന്ദ്ര മുൻഗണനകൾ പാലിക്കുന്ന ഏറ്റവും പഴയ സമയമാണിത്."
    : "This is the earliest time matching your selected Moon preferences.",
  bestAvailableTitle: lang === "ml" ? "⭐ മികച്ച ലഭ്യമായ സമയം" : "⭐ Best Available Time",
  bestAvailableBadge: "★★★★★ BEST AVAILABLE TIME",
  bestAvailableDesc: lang === "ml"
    ? "എല്ലാ നിർബന്ധ കൈയെഴുത്തുപ്രതി വ്യവസ്ഥകളും പാലിച്ചു. തിരഞ്ഞെടുത്ത ചന്ദ്ര മുൻഗണനകളും പാലിച്ചു. നഹാസ് നിരോധനമില്ല. കൈയെഴുത്തുപ്രതി നിരോധനമില്ല. എല്ലാ വ്യവസ്ഥകളും പാലിക്കുന്ന ഏറ്റവും പഴയ നിമിഷം."
    : "Every mandatory manuscript condition passed. Every selected Moon preference passed. No Nahas restriction. No manuscript prohibition. This is the earliest moment satisfying every enabled condition.",
  mergedNote: lang === "ml"
    ? "മികച്ച കൈയെഴുത്തുപ്രതി സമയവും മികച്ച ചന്ദ്ര മുൻഗണന പൊരുത്തവും ഒരേ സമയത്താണ് — ഒന്നായി ലയിപ്പിച്ചു."
    : "Best Manuscript Time and Best Moon Preference Match occur at the same moment — merged into one card.",
  explainWhy: lang === "ml" ? "കാരണം വിശദീകരിക്കുക" : "Explain Why",
  generalInfo: lang === "ml" ? "പൊതു വിവരം" : "General Information",
  currentMoonLabel: lang === "ml" ? "നിലവിലെ ചന്ദ്രൻ" : "Current Moon",
  nahasLabel: lang === "ml" ? "നഹാസ് നില" : "Nahas Status",
  nahasWarning: lang === "ml" ? "⚠ ഇന്ന് ഒരു നഹാസ് ദിവസമാണ്." : "⚠ Today is a Nahas day.",
  nahasWhyTitle: lang === "ml" ? "എന്തുകൊണ്ട് നഹാസ്?" : "Why it is Nahas",
  nahasScopeTitle: lang === "ml" ? "ബാധകമായ പരിധി" : "Scope of Nahas",
  nahasDestructiveTitle: lang === "ml" ? "നാശകരമായ കർമ്മങ്ങൾക്കുള്ള അനുമതി" : "Destructive Rituals Permitted",
  nahasAllRituals: lang === "ml" ? "എല്ലാ ആചാരങ്ങൾക്കും" : "All rituals",
  nahasSpecificOnly: lang === "ml" ? "പ്രത്യേക ആചാര വിഭാഗങ്ങൾക്ക് മാത്രം" : "Specific ritual categories only",
  nahasNotBlocked: lang === "ml" ? "ഈ നഹാസ് ഈ കർമ്മത്തിന് തടസ്സമല്ല." : "This Nahas does not block this ritual.",
  nahasBlocked: lang === "ml" ? "ഈ നഹാസ് ഈ കർമ്മം തടയുന്നു." : "This Nahas blocks this ritual.",
  nahasDestructiveYes: lang === "ml"
    ? "കൈയെഴുത്തുപ്രതി പ്രകാരം, ഈ നഹാസ് സമയത്ത് നാശകരമായതും വേർപിരിക്കൽ കർമ്മങ്ങളും അനുവദനീയമാണ്."
    : "Per the manuscript, destructive, separation, or harmful rituals are permitted during this Nahas.",
  nahasDestructiveNo: lang === "ml"
    ? "കൈയെഴുത്തുപ്രതി ഈ നഹാസ് സമയത്ത് നാശകരമായ കർമ്മങ്ങൾ പ്രത്യേകിച്ച് അനുവദിക്കുന്നില്ല."
    : "The manuscript does not specifically permit destructive rituals during this Nahas.",
  nahasCitationLabel: lang === "ml" ? "കൈയെഴുത്തുപ്രതി റഫറൻസ്" : "Manuscript Citation",
  nahasClean: lang === "ml" ? "നഹാസ് നിരോധനമില്ല — ഈ സമയം സുരക്ഷിതമാണ്." : "No Nahas restriction — this time is safe.",
  nahasGoodProhibited: lang === "ml" ? "✓ നല്ല ആചാരങ്ങൾ നിരോധിച്ചിരിക്കുന്നു" : "✓ Good rituals prohibited",
  nahasDestructivePermitted: lang === "ml"
    ? "കൈയെഴുത്തുപ്രതി പ്രകാരം, ഈ നഹാസ് ഈ ആചാര വിഭാഗങ്ങളെ അനുവദിക്കുന്നു."
    : "According to the manuscript, this Nahas permits these ritual categories.",
  nahasDayNameLabel: lang === "ml" ? "നഹാസ് ദിവസം" : "Nahas Day",
  moonMatchTitle: lang === "ml" ? "നിലവിലെ ചന്ദ്രൻ തിരഞ്ഞെടുത്ത ആചാരവുമായി പൊരുത്തപ്പെടുന്നോ?" : "Does the current Moon match the selected ritual?",
  moonMatchYes: lang === "ml" ? "✓ പൊരുത്തപ്പെടുന്നു" : "✓ Matches",
  moonMatchNo: lang === "ml" ? "✗ പൊരുത്തപ്പെടുന്നില്ല" : "✗ Does not match",
  moonMatchExplain: lang === "ml" ? "വിശദീകരണം" : "Explanation",
  // Transparency section headers (▼ collapsible)
  transMandatory: lang === "ml" ? "▼ നിർബന്ധ നിയമങ്ങൾ പാലിച്ചു" : "▼ Mandatory Rules Passed",
  transMoonPrefs: lang === "ml" ? "▼ ചന്ദ്ര മുൻഗണനകൾ" : "▼ Moon Preferences",
  transNahas: lang === "ml" ? "▼ നഹാസ് നില" : "▼ Nahas Status",
  transCurrentMoon: lang === "ml" ? "▼ നിലവിലെ ചന്ദ്രൻ" : "▼ Current Moon",
  transExplainWhy: lang === "ml" ? "▼ കാരണം വിശദീകരിക്കുക" : "▼ Explain Why",
  transCitations: lang === "ml" ? "▼ കൈയെഴുത്തുപ്രതി റഫറൻസുകൾ" : "▼ Manuscript Citations",
  manuscriptAuthority: lang === "ml"
    ? "കൈയെഴുത്തുപ്രതി എപ്പോഴും അന്തിമ അധികാരമാണ്."
    : "The manuscript is always the final authority.",
  // ── Complete Timeline labels ──
  todayMoonMatchTitle: lang === "ml" ? "✅ നിലവിലെ ചന്ദ്രൻ പൊരുത്തപ്പെടുന്നു" : "✅ Current Moon Already Matches",
  todayMoonMatchMsg: lang === "ml"
    ? "നിലവിലെ ചന്ദ്രൻ തിരഞ്ഞെടുത്ത ചന്ദ്ര മുൻഗണനയുമായി പൊരുത്തപ്പെടുന്നു. ഭാവി തിരയൽ ആവശ്യമില്ല."
    : "Current Moon already matches your selected Moon preference. No future search is required.",
  todayMoonManuscriptFail: lang === "ml"
    ? "നിലവിലെ ചന്ദ്രൻ പൊരുത്തപ്പെടുന്നു, പക്ഷേ ഇന്നത്തെ കൈയെഴുത്തുപ്രതി സമയം സാധുവല്ല. തിരയൽ തുടരുന്നു..."
    : "Current Moon matches your preference, but today's manuscript timing is not valid. Continuing search...",
  nextMoonTitle: lang === "ml" ? "⏳ അടുത്ത പൊരുത്തമുള്ള ചന്ദ്രൻ" : "⏳ Next Matching Moon",
  nextMoonOccurs: lang === "ml" ? "അടുത്ത പൊരുത്തമുള്ള ചന്ദ്രൻ പ്രവേശിക്കുന്നത്:" : "Next Matching Moon occurs on:",
  moonMatchManuscriptFail: lang === "ml"
    ? "❌ ചന്ദ്ര അവസ്ഥ ശരിയാണ്, പക്ഷേ കൈയെഴുത്തുപ്രതി സമയം സാധുവല്ല. സ്വയമേവ തിരയൽ തുടരുന്നു."
    : "❌ Moon condition is correct, but the manuscript timing is not valid. Continue searching automatically.",
  moonMatchManuscriptPass: lang === "ml"
    ? "കൈയെഴുത്തുപ്രതി സമയവും ഈ ചന്ദ്ര അവസരത്തിൽ സാധുവാണ്."
    : "Manuscript timing is also valid at this Moon occurrence.",
  finalRecommendedTitle: lang === "ml" ? "★★★★★ അന്തിമ ശുപാർശ ചെയ്ത ആചാര സമയം" : "★★★★★ FINAL RECOMMENDED RITUAL TIME",
  finalRecommendedDesc: lang === "ml"
    ? "എല്ലാ പ്രവർത്തനക്ഷമ വ്യവസ്ഥകളും പാലിക്കുന്ന ഏറ്റവും പഴയ തീയതിയാണിത്."
    : "This is the earliest date satisfying every enabled condition.",
  timelineExplTitle: lang === "ml" ? "കാലരേഖ വിശദീകരണം" : "Timeline Explanation",
  timelineExplDesc: lang === "ml"
    ? "മുൻപത്തെ തീയതികൾ എന്തുകൊണ്ട് നിരസിക്കപ്പെട്ടു എന്നതിന്റെ കാലക്രമ വിശദീകരണം."
    : "Chronological explanation of why earlier dates were rejected.",
  timelineRejected: lang === "ml" ? "നിരസിക്കപ്പെട്ടു" : "Rejected",
  timelineRecommended: lang === "ml" ? "★★★★★ ശുപാർശ ചെയ്തു" : "★★★★★ Recommended",
  localTime: lang === "ml" ? "പ്രാദേശിക സമയം" : "Local Time",
  manuscriptStatus: lang === "ml" ? "കൈയെഴുത്തുപ്രതി നില" : "Manuscript Status",
  manuscriptPass: lang === "ml" ? "സാധു" : "Valid",
  manuscriptFail: lang === "ml" ? "സാധുവല്ല" : "Not Valid",
  moonDistance: lang === "ml" ? "തിരഞ്ഞെടുത്ത ചന്ദ്രഅവസ്ഥയിൽ നിന്നുള്ള ദൂരം" : "Distance from Selected Moon",
  daysUntilMatch: lang === "ml" ? "ദിവസങ്ങൾ" : "days",
  // ── Confidence tier labels ──
  conf_perfectMatch_title: lang === "ml" ? "★★★★★ തികഞ്ഞ കൈയെഴുത്തുപ്രതി പൊരുത്തം" : "★★★★★ Perfect Manuscript Match",
  conf_perfectMatch_desc: lang === "ml"
    ? "എല്ലാ നിർബന്ധ കൈയെഴുത്തുപ്രതി നിയമങ്ങളും പാലിച്ചു. എല്ലാ ചന്ദ്ര മുൻഗണനകളും പാലിച്ചു."
    : "All mandatory manuscript rules passed. All enabled Moon preferences passed.",
  conf_perfectMatch_summary: lang === "ml"
    ? "ഈ സമയം എല്ലാ കൈയെഴുത്തുപ്രതി നിയമങ്ങളും ചന്ദ്ര മുൻഗണനകളും പാലിക്കുന്നു."
    : "This time satisfies every manuscript rule and all selected Moon preferences.",
  conf_strongMatch_title: lang === "ml" ? "★★★★☆ ശക്തമായ കൈയെഴുത്തുപ്രതി പൊരുത്തം" : "★★★★☆ Strong Manuscript Match",
  conf_strongMatch_desc: lang === "ml"
    ? "എല്ലാ നിർബന്ധ കൈയെഴുത്തുപ്രതി നിയമങ്ങളും പാലിച്ചു. ചില ചന്ദ്ര മുൻഗണനകൾ തിരഞ്ഞെടുത്തിട്ടില്ല."
    : "All mandatory manuscript rules passed. Some optional Moon preferences were not selected.",
  conf_strongMatch_summary: lang === "ml"
    ? "ഈ സമയം എല്ലാ കൈയെഴുത്തുപ്രതി നിയമങ്ങളും തിരഞ്ഞെടുത്ത ചന്ദ്ര മുൻഗണനകളും പാലിക്കുന്നു."
    : "This time satisfies every manuscript rule and your selected Moon preferences.",
  conf_manuscriptValid_title: lang === "ml" ? "★★★☆☆ കൈയെഴുത്തുപ്രതി സാധു" : "★★★☆☆ Manuscript Valid",
  conf_manuscriptValid_desc: lang === "ml"
    ? "എല്ലാ നിർബന്ധ കൈയെഴുത്തുപ്രതി നിയമങ്ങളും പാലിച്ചു. ചന്ദ്ര പ്ലാനിംഗ് പ്രവർത്തനക്ഷമമല്ലാത്തതിനാൽ ചന്ദ്രനെ അവഗണിച്ചു."
    : "All mandatory manuscript rules passed. Moon preferences were ignored because Moon Planning is disabled.",
  conf_manuscriptValid_summary: lang === "ml"
    ? "ഈ സമയം എല്ലാ കൈയെഴുത്തുപ്രതി നിയമങ്ങളും പാലിക്കുന്നു. ചന്ദ്ര പ്ലാനിംഗ് പ്രവർത്തനക്ഷമമല്ല."
    : "This time satisfies every manuscript rule. Moon Planning is not enabled.",
  conf_waitingForMoon_title: lang === "ml" ? "★★☆☆☆ ചന്ദ്ര മുൻഗണനയ്ക്കായി കാത്തിരിക്കുന്നു" : "★★☆☆☆ Waiting for Moon Preference",
  conf_waitingForMoon_desc: lang === "ml"
    ? "കൈയെഴുത്തുപ്രതി നിയമങ്ങൾ പാലിച്ചു. ചന്ദ്ര പ്ലാനിംഗ് പ്രവർത്തനക്ഷമമാണ്, പക്ഷേ തിരഞ്ഞെടുത്ത ചന്ദ്ര മുൻഗണന ഇതുവരെ സംഭവിച്ചിട്ടില്ല."
    : "Manuscript rules pass. Moon Planning is enabled but the selected Moon preference has not yet occurred.",
  conf_waitingForMoon_summary: lang === "ml"
    ? "കൈയെഴുത്തുപ്രതി നിയമങ്ങൾ സാധുവാണ്, പക്ഷേ തിരഞ്ഞെടുത്ത ചന്ദ്ര മുൻഗണന പിന്നീട് സംഭവിക്കും."
    : "Manuscript rules are valid, but your selected Moon preference will occur later.",
  conf_notRecommended_title: lang === "ml" ? "★☆☆☆☆ ശുപാർശ ചെയ്യുന്നില്ല" : "★☆☆☆☆ Not Recommended",
  conf_notRecommended_desc: lang === "ml"
    ? "ഒന്നോ അതിലധികമോ നിർബന്ധ കൈയെഴുത്തുപ്രതി നിയമങ്ങൾ പരാജയപ്പെട്ടു. ഈ സമയം ഒരിക്കലും ശുപാർശ ചെയ്യരുത്."
    : "One or more mandatory manuscript rules failed. Never recommend this time.",
  conf_notRecommended_summary: lang === "ml"
    ? "നിർബന്ധ കൈയെഴുത്തുപ്രതി വ്യവസ്ഥകൾ പാലിക്കപ്പെടാത്തതിനാൽ ഈ കർമ്മം ശുപാർശ ചെയ്യാൻ കഴിയില്ല."
    : "This ritual cannot be recommended because mandatory manuscript conditions are not satisfied.",
  confWhyTitle: lang === "ml" ? "എന്തുകൊണ്ട് ഈ ശുപാർശ?" : "Why this recommendation?",
  confMandatoryRules: lang === "ml" ? "നിർബന്ധ നിയമങ്ങൾ" : "Mandatory Rules",
  confMoonPrefs: lang === "ml" ? "ചന്ദ്ര മുൻഗണനകൾ" : "Moon Preferences",
  confMoonDisabled: lang === "ml" ? "ചന്ദ്ര പ്ലാനിംഗ് പ്രവർത്തനക്ഷമമല്ല" : "Moon Planning disabled",
  confNotSelected: lang === "ml" ? "തിരഞ്ഞെടുത്തിട്ടില്ല" : "Not selected",
});

export default function MoonAnalysisCard({ moonPhase, moonReq, moonCitations, req, lang = "ml", planningDate = null }) {
  const [expanded, setExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null); // null | "status" | "plan"
  const [desiredMansion, setDesiredMansion] = useState("");
  const [desiredZodiac, setDesiredZodiac] = useState("");
  const [desiredPhase, setDesiredPhase] = useState("");
  const [planResult, setPlanResult] = useState(null);
  const [planning, setPlanning] = useState(false);
  const t = L(lang);

  // ── Option 1: Current Moon compatibility (computed on demand) ──
  const moonCompat = useMemo(() => {
    if (selectedOption !== "status" || !moonPhase) return null;
    return analyzeMoonCompatibility({ moonReq, moonPhase, moonCitations });
  }, [selectedOption, moonReq, moonPhase, moonCitations]);

  // ── Option 2: Plan by Moon ──
  const handlePlan = () => {
    if (!desiredMansion && !desiredZodiac && !desiredPhase) return;
    setPlanning(true);
    setPlanResult(null);
    // Defer to next tick so UI can show "planning" state
    setTimeout(() => {
      const result = planRitualByMoon({
        req,
        moonReq,
        desiredMansion: desiredMansion || null,
        desiredZodiac: desiredZodiac || null,
        desiredPhase: desiredPhase || null,
        fromDate: planningDate || new Date(),
      });
      setPlanResult(result);
      setPlanning(false);
    }, 100);
  };

  if (!moonPhase) return null;

  const illumination = moonPhase.moonIllumination != null ? `${Math.round(moonPhase.moonIllumination)}%` : "—";
  const ageDisplay = `${moonPhase.lunarDay} ${t.day}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${G.border}`,
        boxShadow: "0 4px 40px rgba(0,0,0,0.50), inset 0 1px 0 rgba(96,165,250,0.08)",
      }}
    >
      {/* ── Header ── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4"
        style={{ borderBottom: expanded ? `1px solid ${G.border}` : "none" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
            background: "linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(96,165,250,0.05) 100%)",
            border: `1px solid ${G.blueBorder}`,
          }}>
            <Moon className="w-5 h-5" style={{ color: G.blue }} />
          </div>
          <div className="text-left">
            <h3 className="font-inter text-sm font-bold tracking-wide" style={{ color: "#fff" }}>
              {t.title}
            </h3>
            <p className="font-inter text-[10px]" style={{ color: G.dim }}>
              {t.subtitle}
            </p>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 transition-transform" style={{ color: G.dim, transform: expanded ? "rotate(180deg)" : "none" }} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">

              {/* ── Default message (no option selected) ── */}
              {!selectedOption && (
                <div className="rounded-xl p-4 text-center" style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <Moon className="w-6 h-6 mx-auto mb-2" style={{ color: G.dim }} />
                  <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {t.defaultMsg}
                  </p>
                </div>
              )}

              {/* ── Option Selector (radio-style) ── */}
              <div className="space-y-2">
                <OptionRadio
                  label={t.opt1}
                  icon={<Moon className="w-4 h-4" />}
                  selected={selectedOption === "status"}
                  onSelect={() => setSelectedOption(selectedOption === "status" ? null : "status")}
                  lang={lang}
                />
                <OptionRadio
                  label={t.opt2}
                  icon={<CalendarClock className="w-4 h-4" />}
                  selected={selectedOption === "plan"}
                  onSelect={() => setSelectedOption(selectedOption === "plan" ? null : "plan")}
                  lang={lang}
                />
              </div>

              {/* ── OPTION 1: Show Current Moon Status ── */}
              {selectedOption === "status" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Live Moon Data */}
                  <div className="rounded-xl p-3" style={{
                    background: "rgba(96,165,250,0.05)",
                    border: `1px solid ${G.blueBorder}`,
                  }}>
                    <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: "rgba(96,165,250,0.70)" }}>
                      {t.currentMoon}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <MoonDataRow label={t.phase} value={`Day ${moonPhase.lunarDay} (${moonPhase.isWaxing ? t.waxing : t.waning})`} />
                      <MoonDataRow label={t.waxWane} value={moonPhase.isWaxing ? t.waxing : t.waning} />
                      <MoonDataRow label={t.zodiacSign} value={moonPhase.moonSign ? `${moonPhase.moonSignSymbol || ""} ${moonPhase.moonSign}` : "—"} />
                      <MoonDataRow label={t.mansion} value={moonPhase.moonMansion ? (moonPhase.moonMansionArabic ? `${moonPhase.moonMansionArabic} (${moonPhase.moonMansion})` : moonPhase.moonMansion) : "—"} />
                      <MoonDataRow label={t.illumination} value={illumination} />
                      <MoonDataRow label={t.moonAge} value={ageDisplay} />
                    </div>
                  </div>

                  {/* Manuscript Moon Rule Evaluation */}
                  {moonCompat && (
                    <div className="rounded-xl p-3 space-y-2" style={{
                      background: moonCompat.hasMoonRules
                        ? (moonCompat.compatible ? "rgba(74,222,128,0.05)" : "rgba(248,113,113,0.05)")
                        : "rgba(255,255,255,0.02)",
                      border: moonCompat.hasMoonRules
                        ? `1px solid ${moonCompat.compatible ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`
                        : "1px solid rgba(255,255,255,0.08)",
                    }}>
                      {/* No Moon Rule */}
                      {!moonCompat.hasMoonRules && (
                        <div className="flex items-start gap-2">
                          <Minus className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: G.neutral }} />
                          <div>
                            <p className="font-inter text-sm font-bold mb-1" style={{ color: "#fff" }}>
                              {t.noRuleTitle}
                            </p>
                            <p className="font-inter text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                              {t.noRuleMsg}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Moon Rules Exist — show ✓/✗ */}
                      {moonCompat.hasMoonRules && (
                        <>
                          <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                            {t.msRulesTitle}
                          </p>
                          {moonCompat.checks.map((check, idx) => (
                            <MoonCheckRow key={idx} check={check} lang={lang} />
                          ))}
                          {/* Match question + ✓/✗ answer */}
                          <div className="rounded-lg p-2.5 mt-1 space-y-1.5" style={{
                            background: moonCompat.compatible ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
                            border: `1px solid ${moonCompat.compatible ? "rgba(74,222,128,0.30)" : "rgba(248,113,113,0.30)"}`,
                          }}>
                            <p className={`text-xs font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.80)" }}>
                              {t.moonMatchQuestion}
                            </p>
                            <div className="flex items-center gap-2">
                              {moonCompat.compatible
                                ? <Check className="w-4 h-4" style={{ color: G.pass }} />
                                : <X className="w-4 h-4" style={{ color: G.fail }} />}
                              <p className={`text-sm font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{
                                color: moonCompat.compatible ? G.pass : G.fail,
                              }}>
                                {moonCompat.compatible ? t.moonMatchYesShort : t.moonMatchNoShort}
                              </p>
                            </div>
                            <p className={`text-[11px] leading-snug ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.60)" }}>
                              {moonCompat.compatible ? t.compatible : t.notCompatible}
                            </p>
                          </div>
                          <p className="font-inter text-[10px] text-center" style={{ color: G.dim }}>
                            {t.moonMatchNeverAffects}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── OPTION 2: Plan Ritual by Moon ── */}
              {selectedOption === "plan" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Desired Condition Selectors */}
                  <div className="rounded-xl p-3 space-y-3" style={{
                    background: "rgba(96,165,250,0.05)",
                    border: `1px solid ${G.blueBorder}`,
                  }}>
                    {/* Desired Mansion */}
                    <div>
                      <label className="font-inter text-[9px] uppercase tracking-widest block mb-1" style={{ color: "rgba(96,165,250,0.70)" }}>
                        {t.desiredMansion}
                      </label>
                      <select
                        value={desiredMansion}
                        onChange={(e) => setDesiredMansion(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 font-inter text-xs"
                        style={{
                          background: "rgba(8,16,38,0.80)",
                          border: `1px solid ${G.blueBorder}`,
                          color: "#fff",
                        }}
                      >
                        <option value="">{t.anyMansion}</option>
                        {MOON_MANSIONS.map(m => (
                          <option key={m.no} value={m.no}>
                            #{m.no} — {m.name} ({m.harfi})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Desired Zodiac */}
                    <div>
                      <label className="font-inter text-[9px] uppercase tracking-widest block mb-1" style={{ color: "rgba(96,165,250,0.70)" }}>
                        {t.desiredZodiac}
                      </label>
                      <select
                        value={desiredZodiac}
                        onChange={(e) => setDesiredZodiac(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 font-inter text-xs"
                        style={{
                          background: "rgba(8,16,38,0.80)",
                          border: `1px solid ${G.blueBorder}`,
                          color: "#fff",
                        }}
                      >
                        <option value="">{t.anyZodiac}</option>
                        {ZODIAC_SIGNS.map(z => (
                          <option key={z.name_en} value={z.name_en}>
                            {z.symbol} {z.name_en} {lang === "ml" ? `(${z.name_ml})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Desired Phase */}
                    <div>
                      <label className="font-inter text-[9px] uppercase tracking-widest block mb-1" style={{ color: "rgba(96,165,250,0.70)" }}>
                        {t.desiredPhase}
                      </label>
                      <select
                        value={desiredPhase}
                        onChange={(e) => setDesiredPhase(e.target.value)}
                        className="w-full rounded-lg px-3 py-2 font-inter text-xs"
                        style={{
                          background: "rgba(8,16,38,0.80)",
                          border: `1px solid ${G.blueBorder}`,
                          color: "#fff",
                        }}
                      >
                        <option value="">{t.anyPhase}</option>
                        <option value="waxing">{t.waxing}</option>
                        <option value="waning">{t.waning}</option>
                      </select>
                    </div>
                  </div>

                  {/* Plan Button */}
                  <button
                    onClick={handlePlan}
                    disabled={planning || (!desiredMansion && !desiredZodiac && !desiredPhase)}
                    className="w-full rounded-xl py-3 font-inter text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg, rgba(96,165,250,0.20) 0%, rgba(96,165,250,0.08) 100%)",
                      border: `1px solid ${G.blueBorder}`,
                      color: G.blue,
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    {planning ? t.planning : t.planBtn}
                  </button>

                  {(!desiredMansion && !desiredZodiac && !desiredPhase) && (
                    <p className="font-inter text-[10px] text-center" style={{ color: G.dim }}>
                      {t.selectCondition}
                    </p>
                  )}

                  {/* Plan Result */}
                  {planResult && (
                    <PlanResultView
                      result={planResult}
                      t={t}
                      lang={lang}
                      moonCitations={moonCitations}
                      req={req}
                      planningDate={planningDate}
                    />
                  )}
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PLAN RESULT VIEW — Complete timing timeline with narrative flow
// ═══════════════════════════════════════════════════════════════
function PlanResultView({ result, t, lang, moonCitations, req, planningDate }) {
  const {
    found, recommendedTime, firstMoonPerfect, hasMoonPrefs,
    todayMoonMatches, todayManuscriptPass, todayResult,
    firstMoonMatch, rejectionTimeline, firstPerfectMatch,
  } = result;

  // No manuscript-valid time found at all
  if (!found || !recommendedTime) {
    if (hasMoonPrefs && !firstMoonMatch) {
      return (
        <div className="rounded-xl p-4 text-center" style={{
          background: "rgba(248,113,113,0.05)",
          border: "1px solid rgba(248,113,113,0.20)",
        }}>
          <AlertTriangle className="w-5 h-5 mx-auto mb-2" style={{ color: G.fail }} />
          <p className="font-inter text-xs" style={{ color: "rgba(248,113,113,0.80)" }}>
            {t.noMoonMatch}
          </p>
        </div>
      );
    }
    return (
      <div className="rounded-xl p-4 text-center" style={{
        background: "rgba(248,113,113,0.05)",
        border: "1px solid rgba(248,113,113,0.20)",
      }}>
        <AlertTriangle className="w-5 h-5 mx-auto mb-2" style={{ color: G.fail }} />
        <p className="font-inter text-xs" style={{ color: "rgba(248,113,113,0.80)" }}>
          {t.noMandatoryMatch}
        </p>
      </div>
    );
  }

  // Determine the final recommended time
  const finalTime = firstPerfectMatch || firstMoonPerfect || recommendedTime;

  // Compute Moon distance from selected condition
  let moonDistanceDays = null;
  if (hasMoonPrefs) {
    if (todayMoonMatches) moonDistanceDays = 0;
    else if (firstMoonMatch) moonDistanceDays = firstMoonMatch.daysAhead;
  }

  return (
    <div className="space-y-3">
      {/* Nahas Warning — if today is a Nahas day per manuscript */}
      <NahasWarning req={req} t={t} lang={lang} moonCitations={moonCitations} planningDate={planningDate} />

      {/* Step 1: Today's Moon Check */}
      {hasMoonPrefs && todayMoonMatches && (
        <div className="rounded-xl p-3" style={{
          background: todayManuscriptPass ? "rgba(74,222,128,0.06)" : "rgba(251,191,36,0.06)",
          border: `1px solid ${todayManuscriptPass ? "rgba(74,222,128,0.25)" : "rgba(251,191,36,0.25)"}`,
        }}>
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4" style={{ color: todayManuscriptPass ? G.pass : "#FBBF24" }} />
            <span className={`text-sm font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: todayManuscriptPass ? G.pass : "#FBBF24" }}>
              {t.todayMoonMatchTitle}
            </span>
          </div>
          <p className={`text-xs leading-snug ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.70)" }}>
            {todayManuscriptPass ? t.todayMoonMatchMsg : t.todayMoonManuscriptFail}
          </p>
        </div>
      )}

      {/* Step 2: Next Moon Match (if today doesn't match) */}
      {hasMoonPrefs && !todayMoonMatches && firstMoonMatch && (
        <div className="rounded-xl p-3 space-y-2" style={{
          background: firstMoonMatch.mandatoryPass ? "rgba(74,222,128,0.04)" : "rgba(96,165,250,0.04)",
          border: `1px solid ${firstMoonMatch.mandatoryPass ? "rgba(74,222,128,0.20)" : G.blueBorder}`,
        }}>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4" style={{ color: G.blue }} />
            <span className={`text-sm font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: G.blue }}>
              {t.nextMoonTitle}
            </span>
          </div>
          <p className={`text-xs ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.70)" }}>
            {t.nextMoonOccurs}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <MoonDataRow label={t.date} value={`${firstMoonMatch.dayNumber} ${tMonthName(firstMoonMatch.monthName, lang)} ${firstMoonMatch.year}`} />
            <MoonDataRow label={t.time} value={firstMoonMatch.timeStr} />
            <MoonDataRow label={t.dayName} value={tDayName(firstMoonMatch.dayName, lang)} />
            <MoonDataRow label={t.mansion} value={firstMoonMatch.moon?.moonMansion ? (firstMoonMatch.moon.moonMansionArabic ? `${firstMoonMatch.moon.moonMansionArabic} (${firstMoonMatch.moon.moonMansion})` : firstMoonMatch.moon.moonMansion) : "—"} />
            <MoonDataRow label={t.zodiacSign} value={firstMoonMatch.moon?.moonSign ? `${firstMoonMatch.moon.moonSignSymbol || ""} ${firstMoonMatch.moon.moonSign}` : "—"} />
            <MoonDataRow label={t.phase} value={firstMoonMatch.moon ? `Day ${firstMoonMatch.moon.lunarDay} (${tMoonPhaseName(firstMoonMatch.moon.phaseName, lang)})` : "—"} />
          </div>
          {/* Manuscript status at this moon match */}
          <div className="flex items-center gap-2 p-2 rounded-lg" style={{
            background: firstMoonMatch.mandatoryPass ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
            border: `1px solid ${firstMoonMatch.mandatoryPass ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
          }}>
            {firstMoonMatch.mandatoryPass
              ? <Check className="w-3.5 h-3.5" style={{ color: G.pass }} />
              : <X className="w-3.5 h-3.5" style={{ color: G.fail }} />}
            <span className={`text-xs ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{
              color: firstMoonMatch.mandatoryPass ? G.pass : G.fail,
            }}>
              {firstMoonMatch.mandatoryPass ? t.moonMatchManuscriptPass : t.moonMatchManuscriptFail}
            </span>
          </div>
        </div>
      )}

      {/* Step 3: Final Recommended Time (★★★★★) */}
      <FinalTimelineCard
        data={finalTime}
        t={t}
        lang={lang}
        moonCitations={moonCitations}
        hasMoonPrefs={hasMoonPrefs}
        moonDistanceDays={moonDistanceDays}
      />

      {/* Step 4: Timeline Explanation (expandable) */}
      {rejectionTimeline && rejectionTimeline.length > 0 && (
        <TimelineExplanation
          rejectionTimeline={rejectionTimeline}
          finalTime={finalTime}
          t={t}
          lang={lang}
          hasMoonPrefs={hasMoonPrefs}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FINAL TIMELINE CARD — Complete ritual time with all fields
// ═══════════════════════════════════════════════════════════════
function computeConfidence({ mandatoryPass, hasMoonPrefs, moonPrefPass, moonPrefChecks }) {
  if (!mandatoryPass) return { stars: 1, badge: "★☆☆☆☆", tier: "notRecommended" };
  if (!hasMoonPrefs) return { stars: 3, badge: "★★★☆☆", tier: "manuscriptValid" };
  if (!moonPrefPass) return { stars: 2, badge: "★★☆☆☆", tier: "waitingForMoon" };
  const hasMansion = moonPrefChecks?.some(c => c.dimension === "pref_mansion");
  const hasZodiac = moonPrefChecks?.some(c => c.dimension === "pref_zodiac");
  const hasPhase = moonPrefChecks?.some(c => c.dimension === "pref_phase");
  if (hasMansion && hasZodiac && hasPhase) return { stars: 5, badge: "★★★★★", tier: "perfectMatch" };
  return { stars: 4, badge: "★★★★☆", tier: "strongMatch" };
}

function FinalTimelineCard({ data: m, t, lang, moonCitations, hasMoonPrefs, moonDistanceDays }) {
  const [showChecklist, setShowChecklist] = useState(false);

  const conf = computeConfidence({ mandatoryPass: m.mandatoryPass, hasMoonPrefs, moonPrefPass: m.moonPrefPass, moonPrefChecks: m.moonPrefChecks });
  const confTitle = t[`conf_${conf.tier}_title`];
  const confDesc = t[`conf_${conf.tier}_desc`];
  const confSummary = t[`conf_${conf.tier}_summary`];
  const nahasActive = m.nahasStatus && m.nahasStatus.includes("blocked");
  const illumination = m.moon?.moonIllumination != null ? `${Math.round(m.moon.moonIllumination)}%` : "—";
  const moonAge = m.moon?.lunarDay != null ? `${m.moon.lunarDay} ${t.day}` : "—";

  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: "linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.04) 100%)",
      border: "1px solid rgba(212,175,55,0.45)",
      boxShadow: "0 0 24px rgba(212,175,55,0.18)",
    }}>
      {/* Header */}
      <div className="p-3" style={{ borderBottom: "1px solid rgba(212,175,55,0.15)" }}>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-base leading-none">{conf.stars >= 4 ? "⭐" : conf.stars >= 3 ? "✅" : conf.stars >= 2 ? "⏳" : "⚠"}</span>
          <span className={`text-sm font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: G.text }}>
            {confTitle}
          </span>
          <span className="font-inter text-[8px] px-2 py-0.5 rounded-full font-bold" style={{
            background: "rgba(212,175,55,0.15)", color: G.text,
            border: "1px solid rgba(212,175,55,0.30)", letterSpacing: "0.05em",
          }}>{conf.badge}</span>
        </div>
        <p className={`text-[11px] leading-snug ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.60)" }}>
          {confDesc}
        </p>
      </div>

      {/* Complete Details Grid */}
      <div className="p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <MoonDataRow label={t.date} value={`${m.dayNumber} ${tMonthName(m.monthName, lang)} ${m.year}`} />
          <MoonDataRow label={t.localTime} value={m.timeStr} />
          <MoonDataRow label={t.dayName} value={tDayName(m.dayName, lang)} />
          <MoonDataRow label={t.month} value={tMonthName(m.monthName, lang)} />
          <MoonDataRow label={t.saat} value={m.hourNumber ? `#${m.hourNumber} (${tPlanetName(m.hourPlanet, lang)})` : "—"} />
          <MoonDataRow label={t.kawkab} value={tPlanetName(m.hourPlanet, lang) || "—"} />
          {m.moon?.moonMansion && (
            <MoonDataRow label={t.mansion} value={m.moon.moonMansionArabic ? `${m.moon.moonMansionArabic} (${m.moon.moonMansion})` : m.moon.moonMansion} />
          )}
          {m.moon?.moonSign && (
            <MoonDataRow label={t.zodiacSign} value={`${m.moon.moonSignSymbol || ""} ${m.moon.moonSign}`} />
          )}
          <MoonDataRow label={t.phase} value={m.moon ? `Day ${m.moon.lunarDay} (${tMoonPhaseName(m.moon.phaseName, lang)})` : "—"} />
          <MoonDataRow label={t.waxWane} value={m.moon?.isWaxing ? t.waxing : t.waning} />
          <MoonDataRow label={t.illumination} value={illumination} />
          <MoonDataRow label={t.moonAge} value={moonAge} />
          <MoonDataRow label={t.nahasLabel} value={nahasActive ? (lang === "ml" ? "നഹാസ് ഉണ്ട്" : "Nahas Active") : t.nahasClean} />
          <MoonDataRow label={t.manuscriptStatus} value={m.mandatoryPass ? t.manuscriptPass : t.manuscriptFail} />
        </div>

        {/* Nahas Status */}
        <div className="flex items-center gap-2 p-2 rounded-lg" style={{
          background: nahasActive ? "rgba(248,113,113,0.06)" : "rgba(74,222,128,0.04)",
          border: `1px solid ${nahasActive ? "rgba(248,113,113,0.15)" : "rgba(74,222,128,0.12)"}`,
        }}>
          {nahasActive
            ? <AlertTriangle className="w-3.5 h-3.5" style={{ color: G.fail }} />
            : <Check className="w-3.5 h-3.5" style={{ color: G.pass }} />}
          <span className={`text-xs ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.75)" }}>
            {t.nahasLabel}: {nahasActive ? tNahasStatus(m.nahasStatus, lang) : t.nahasClean}
          </span>
        </div>

        {/* Manuscript Citations */}
        {moonCitations && moonCitations.length > 0 && (
          <div className="rounded-lg p-2" style={{
            background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.12)",
          }}>
            <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: "rgba(74,222,128,0.60)" }}>
              {lang === "ml" ? "കൈയെഴുത്തുപ്രതി റഫറൻസുകൾ" : "Manuscript Citations"}
            </p>
            <div className="space-y-0.5">
              {moonCitations.map((c, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="font-inter text-[9px] px-1 rounded flex-shrink-0" style={{
                    background: "rgba(74,222,128,0.10)", color: "rgba(74,222,128,0.60)",
                  }}>{c.source}</span>
                  <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{c.summary || c.category}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why this recommendation? — Confidence Checklist */}
        <div className="rounded-lg p-2.5 space-y-2" style={{
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <p className="font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: G.text }}>
            {t.confWhyTitle}
          </p>
          {/* Mandatory Rules */}
          <div className="space-y-1">
            <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.50)" }}>{t.confMandatoryRules}</p>
            {m.mandatoryChecks.map((mc, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {mc.status === "pass"
                  ? <Check className="w-3 h-3 flex-shrink-0" style={{ color: G.pass }} />
                  : <X className="w-3 h-3 flex-shrink-0" style={{ color: G.fail }} />}
                <span className={`text-[11px] ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: mc.status === "pass" ? "rgba(255,255,255,0.70)" : G.fail }}>
                  {tCheckLabel(mc.label, lang)}
                </span>
              </div>
            ))}
          </div>
          {/* Moon Preferences */}
          <div className="space-y-1">
            <p className="font-inter text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.50)" }}>{t.confMoonPrefs}</p>
            {hasMoonPrefs ? (
              [
                { dim: "pref_mansion", label: t.mansion },
                { dim: "pref_zodiac", label: t.zodiacSign },
                { dim: "pref_phase", label: t.waxWane },
              ].map(({ dim, label }) => {
                const check = m.moonPrefChecks?.find(c => c.dimension === dim);
                return (
                  <div key={dim} className="flex items-center gap-1.5">
                    {!check
                      ? <Minus className="w-3 h-3 flex-shrink-0" style={{ color: G.neutral }} />
                      : check.status === "pass"
                        ? <Check className="w-3 h-3 flex-shrink-0" style={{ color: G.pass }} />
                        : <X className="w-3 h-3 flex-shrink-0" style={{ color: G.fail }} />}
                    <span className={`text-[11px] ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: !check ? "rgba(255,255,255,0.40)" : check.status === "pass" ? "rgba(255,255,255,0.70)" : G.fail }}>
                      {label}{!check ? ` — ${t.confNotSelected}` : ""}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center gap-1.5">
                <Minus className="w-3 h-3 flex-shrink-0" style={{ color: G.neutral }} />
                <span className={`text-[11px] ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.40)" }}>
                  {t.confMoonDisabled}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Visual Checklist button */}
        <button onClick={() => setShowChecklist(!showChecklist)} className="w-full rounded-lg py-2 font-inter text-xs font-bold transition flex items-center justify-center gap-2" style={{
          background: showChecklist ? "rgba(212,175,55,0.10)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${showChecklist ? G.border : "rgba(255,255,255,0.08)"}`,
          color: showChecklist ? G.text : "rgba(255,255,255,0.60)",
        }}>
          <BookOpen className="w-3.5 h-3.5" />
          {t.explainWhy}
          <ChevronDown className="w-3 h-3 transition-transform" style={{ transform: showChecklist ? "rotate(180deg)" : "none" }} />
        </button>

        {/* Visual Checklist */}
        {showChecklist && (
          <ExplainWhy data={m} t={t} lang={lang} hasMoonPrefs={hasMoonPrefs} moonCitations={moonCitations} moonDistanceDays={moonDistanceDays} />
        )}

        {/* Final Summary */}
        <div className="rounded-lg p-2.5 text-center" style={{
          background: conf.stars >= 4 ? "rgba(212,175,55,0.08)" : conf.stars >= 3 ? "rgba(74,222,128,0.06)" : conf.stars >= 2 ? "rgba(96,165,250,0.06)" : "rgba(248,113,113,0.06)",
          border: `1px solid ${conf.stars >= 4 ? "rgba(212,175,55,0.20)" : conf.stars >= 3 ? "rgba(74,222,128,0.20)" : conf.stars >= 2 ? G.blueBorder : "rgba(248,113,113,0.20)"}`,
        }}>
          <p className={`text-xs font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{
            color: conf.stars >= 4 ? G.text : conf.stars >= 3 ? G.pass : conf.stars >= 2 ? G.blue : G.fail,
          }}>
            {confSummary}
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TIMELINE EXPLANATION — Chronological rejection history
// ═══════════════════════════════════════════════════════════════
function TimelineExplanation({ rejectionTimeline, finalTime, t, lang, hasMoonPrefs }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl overflow-hidden" style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" style={{ color: G.dim }} />
          <span className={`text-sm font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "#fff" }}>
            {t.timelineExplTitle}
          </span>
        </div>
        <ChevronDown className="w-4 h-4 transition-transform" style={{ color: G.dim, transform: expanded ? "rotate(180deg)" : "none" }} />
      </button>

      {expanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
          <div className="p-3 pt-0 space-y-2">
            <p className={`text-[11px] leading-snug ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.55)" }}>
              {t.timelineExplDesc}
            </p>

            {rejectionTimeline.map((entry, idx) => (
              <div key={idx} className="rounded-lg p-2.5 space-y-1" style={{
                background: "rgba(248,113,113,0.04)",
                border: "1px solid rgba(248,113,113,0.12)",
              }}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "#fff" }}>
                    {entry.dayNumber} {tMonthName(entry.monthName, lang)} {entry.year}
                  </span>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                    ({tDayName(entry.dayName, lang)})
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3" style={{ color: G.pass }} />
                  <span className={`text-[11px] ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.65)" }}>
                    {lang === "ml" ? "ചന്ദ്രൻ പൊരുത്തപ്പെട്ടു" : "Moon matched"}
                  </span>
                </div>
                {entry.failedChecks.map((fc, fci) => (
                  <div key={fci} className="flex items-start gap-1.5">
                    <X className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: G.fail }} />
                    <span className={`text-[11px] ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(248,113,113,0.70)" }}>
                      {tCheckLabel(fc.label, lang)}: {tCheckReason(fc.reason, lang)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <X className="w-3 h-3" style={{ color: G.fail }} />
                  <span className={`text-[11px] font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: G.fail }}>
                    {t.timelineRejected}
                  </span>
                </div>
              </div>
            ))}

            {/* Final recommended entry */}
            {finalTime && (
              <div className="rounded-lg p-2.5 space-y-1" style={{
                background: "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.25)",
              }}>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: G.text }}>
                    {finalTime.dayNumber} {tMonthName(finalTime.monthName, lang)} {finalTime.year}
                  </span>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
                    ({tDayName(finalTime.dayName, lang)})
                  </span>
                </div>
                {finalTime.mandatoryChecks.filter(c => c.status === "pass").map((mc, mci) => (
                  <div key={mci} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: G.pass }} />
                    <span className={`text-[11px] ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.65)" }}>
                      {tCheckLabel(mc.label, lang)}: {tCheckReason(mc.reason, lang)}
                    </span>
                  </div>
                ))}
                {hasMoonPrefs && finalTime.moonPrefChecks.filter(c => c.status === "pass").map((mc, mci) => (
                  <div key={`mp${mci}`} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: G.pass }} />
                    <span className={`text-[11px] ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.65)" }}>
                      {tCheckLabel(mc.label, lang)}: {tCheckReason(mc.reason, lang)}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-[11px] font-bold" style={{ color: G.text }}>★★★★★</span>
                  <span className={`text-[11px] font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: G.text }}>
                    {t.timelineRecommended}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// NAHAS WARNING — Shows if today is a manuscript Nahas day
// ═══════════════════════════════════════════════════════════════
function NahasWarning({ req, t, lang, moonCitations, planningDate }) {
  if (!req?.worstDays?.length) return null;

  const planningRefDate = planningDate || new Date();
  const todayKey = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][planningRefDate.getDay()];
  const isNahasDay = req.worstDays.includes(todayKey);
  if (!isNahasDay) return null;

  const dayNames = {
    sun: lang === "ml" ? "ഞായർ" : "Sunday",
    mon: lang === "ml" ? "തിങ്കൾ" : "Monday",
    tue: lang === "ml" ? "ചൊവ്വ" : "Tuesday",
    wed: lang === "ml" ? "ബുധൻ" : "Wednesday",
    thu: lang === "ml" ? "വ്യാഴം" : "Thursday",
    fri: lang === "ml" ? "വെള്ളി" : "Friday",
    sat: lang === "ml" ? "ശനി" : "Saturday",
  };

  // Find citation for worstDays if available
  const nahasCitation = moonCitations?.find(c => c.field === "day") || null;

  return (
    <div className="rounded-xl p-3 space-y-2" style={{
      background: "rgba(248,113,113,0.06)",
      border: "1px solid rgba(248,113,113,0.25)",
    }}>
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: G.fail }} />
        <p className={`text-sm font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: G.fail }}>
          {t.nahasWarning}
        </p>
      </div>

      {/* Why it is Nahas */}
      <div>
        <p className="font-inter text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(248,113,113,0.60)" }}>
          {t.nahasWhyTitle}
        </p>
        <p className={`text-xs leading-snug ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.70)" }}>
          {lang === "ml"
            ? `${dayNames[todayKey]} കൈയെഴുത്തുപ്രതി പ്രകാരം ഒരു നഹാസ് ദിവസമാണ്. ഈ ദിവസം ചില കർമ്മങ്ങൾക്ക് തടസ്സമാണ്.`
            : `${dayNames[todayKey]} is identified as a Nahas (inauspicious) day per the manuscript. This day obstructs certain rituals.`}
        </p>
      </div>

      {/* Manuscript Citation */}
      {nahasCitation && (
        <div>
          <p className="font-inter text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(248,113,113,0.60)" }}>
            {t.nahasCitationLabel}
          </p>
          <div className="flex items-start gap-1.5">
            <span className="font-inter text-[9px] px-1 rounded flex-shrink-0" style={{
              background: "rgba(248,113,113,0.10)",
              color: "rgba(248,113,113,0.60)",
            }}>{nahasCitation.source}</span>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>{nahasCitation.summary || nahasCitation.category}</p>
          </div>
        </div>
      )}

      {/* Nahas Day Name */}
      <div>
        <p className="font-inter text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(248,113,113,0.60)" }}>
          {t.nahasDayNameLabel}
        </p>
        <p className={`text-xs font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "#fff" }}>
          {dayNames[todayKey]}
        </p>
      </div>

      {/* Scope */}
      <div>
        <p className="font-inter text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(248,113,113,0.60)" }}>
          {t.nahasScopeTitle}
        </p>
        <p className={`text-xs leading-snug ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.70)" }}>
          {lang === "ml"
            ? "ഈ നഹാസ് എല്ലാ ആചാരങ്ങൾക്കും ബാധകമാണോ അതോ പ്രത്യേക ആചാര വിഭാഗങ്ങൾക്ക് മാത്രമോ എന്ന് കൈയെഴുത്തുപ്രതി വ്യക്തമാക്കുന്നു."
            : "The manuscript clarifies whether this Nahas applies to all rituals or only specific ritual categories."}
        </p>
      </div>

      {/* Good Rituals Prohibited */}
      <div className="flex items-center gap-2 p-2 rounded-lg" style={{
        background: "rgba(248,113,113,0.08)",
        border: "1px solid rgba(248,113,113,0.20)",
      }}>
        <X className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.fail }} />
        <span className={`text-xs font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: G.fail }}>
          {t.nahasGoodProhibited}
        </span>
      </div>

      {/* Destructive Rituals Permitted? — only if manuscript citation supports it */}
      {nahasCitation && (
        <div>
          <p className="font-inter text-[9px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(248,113,113,0.60)" }}>
            {t.nahasDestructiveTitle}
          </p>
          <p className={`text-xs leading-snug ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.70)" }}>
            {t.nahasDestructiveNo}
          </p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EXPLAIN WHY — Expandable rule breakdown for a timeline card
// ═══════════════════════════════════════════════════════════════
function ExplainWhy({ data, t, lang, hasMoonPrefs, moonCitations, moonDistanceDays }) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="space-y-3 overflow-hidden"
    >
      {/* ▼ Mandatory Rules Passed */}
      <div className="space-y-1.5">
        <p className="font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: G.text }}>
          {t.transMandatory}
        </p>
        {data.mandatoryChecks.map((check, idx) => (
          <MoonCheckRow key={idx} check={check} lang={lang} />
        ))}
      </div>

      {/* ▼ Moon Preferences */}
      {hasMoonPrefs && data.moonPrefChecks.length > 0 && (
        <div className="space-y-1.5">
          <p className="font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: G.blue }}>
            {t.transMoonPrefs}
          </p>
          {data.moonPrefChecks.map((check, idx) => (
            <MoonCheckRow key={idx} check={check} lang={lang} />
          ))}
        </div>
      )}

      {/* ▼ Nahas Status */}
      <div className="rounded-lg p-2.5" style={{
        background: "rgba(74,222,128,0.04)",
        border: "1px solid rgba(74,222,128,0.15)",
      }}>
        <p className="font-inter text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: G.pass }}>
          {t.transNahas}
        </p>
        <div className="flex items-center gap-2">
          <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.pass }} />
          <span className={`text-xs ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.75)" }}>
            {t.nahasClean}
          </span>
        </div>
      </div>

      {/* ▼ Current Moon */}
      <div className="rounded-xl p-3 space-y-1" style={{
        background: "rgba(96,165,250,0.04)",
        border: `1px solid ${G.blueBorder}`,
      }}>
        <p className="font-inter text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: G.blue }}>
          {t.transCurrentMoon}
        </p>
        <MoonDataRow label={t.currentMoonLabel} value={data.moon ? `Day ${data.moon.lunarDay} (${tMoonPhaseName(data.moon.phaseName, lang)})` : "—"} />
        <MoonDataRow label={t.mansion} value={data.moon?.moonMansion ? (data.moon.moonMansionArabic ? `${data.moon.moonMansionArabic} (${data.moon.moonMansion})` : data.moon.moonMansion) : "—"} />
        <MoonDataRow label={t.zodiacSign} value={data.moon?.moonSign ? `${data.moon.moonSignSymbol || ""} ${data.moon.moonSign}` : "—"} />
        <MoonDataRow label={t.phase} value={data.moon ? tMoonPhaseName(data.moon.phaseName, lang) : "—"} />
        <MoonDataRow label={t.illumination} value={data.moon?.moonIllumination != null ? `${Math.round(data.moon.moonIllumination)}%` : "—"} />
        <MoonDataRow label={t.moonAge} value={data.moon?.lunarDay != null ? `${data.moon.lunarDay} ${t.day}` : "—"} />
        {moonDistanceDays != null && (
          <MoonDataRow label={t.moonDistance} value={moonDistanceDays === 0 ? (lang === "ml" ? "പൊരുത്തപ്പെടുന്നു" : "Already matches") : `${moonDistanceDays} ${t.daysUntilMatch}`} />
        )}
      </div>

      {/* ▼ Manuscript Citations */}
      {moonCitations && moonCitations.length > 0 && (
        <div className="rounded-lg p-2.5" style={{
          background: "rgba(74,222,128,0.04)",
          border: "1px solid rgba(74,222,128,0.15)",
        }}>
          <p className="font-inter text-[9px] uppercase tracking-widest font-bold mb-1" style={{ color: "rgba(74,222,128,0.60)" }}>
            {t.transCitations}
          </p>
          <div className="space-y-0.5">
            {moonCitations.map((c, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="font-inter text-[9px] px-1 rounded flex-shrink-0" style={{
                  background: "rgba(74,222,128,0.10)",
                  color: "rgba(74,222,128,0.60)",
                }}>{c.source}</span>
                <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{c.summary || c.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manuscript authority footer */}
      <p className="font-inter text-[10px] text-center" style={{ color: G.dim }}>
        {t.manuscriptAuthority}
      </p>
    </motion.div>
  );
}

// ── Option Radio Button ──
function OptionRadio({ label, icon, selected, onSelect, lang }) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-3 rounded-xl transition text-left"
      style={{
        background: selected ? "rgba(96,165,250,0.08)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${selected ? G.blueBorder : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{
        border: `2px solid ${selected ? G.blue : G.dim}`,
        background: selected ? G.blue : "transparent",
      }}>
        {selected && <div className="w-2 h-2 rounded-full" style={{ background: "#fff" }} />}
      </div>
      <div style={{ color: selected ? G.blue : "rgba(255,255,255,0.70)" }}>
        {icon}
      </div>
      <span className={`text-sm font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{
        color: selected ? G.blue : "rgba(255,255,255,0.80)",
      }}>
        {label}
      </span>
    </button>
  );
}

// ── Moon Data Row ──
function MoonDataRow({ label, value }) {
  return (
    <div>
      <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: "rgba(96,165,250,0.50)" }}>
        {label}
      </p>
      <p className="font-inter text-xs font-bold" style={{ color: "rgba(255,255,255,0.85)" }}>
        {value}
      </p>
    </div>
  );
}

// ── Moon Check Row (✓/✗/neutral) ──
function MoonCheckRow({ check, lang }) {
  const isPass = check.status === "pass";
  const isFail = check.status === "fail";
  const isNeutral = check.status === "neutral";

  const icon = isPass ? <Check className="w-3.5 h-3.5" /> : isFail ? <X className="w-3.5 h-3.5" /> : <Minus className="w-3 h-3" />;
  const color = isPass ? G.pass : isFail ? G.fail : G.neutral;

  return (
    <div className="rounded-lg p-2" style={{
      background: isPass ? "rgba(74,222,128,0.04)" : isFail ? "rgba(248,113,113,0.04)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isPass ? "rgba(74,222,128,0.15)" : isFail ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.05)"}`,
    }}>
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5" style={{ color }}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-bold ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "#fff" }}>
              {tCheckLabel(check.label, lang)}
            </span>
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {check.currentValue || check.current}
            </span>
          </div>
          <p className={`text-[11px] leading-snug ${lang === "ml" ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.65)" }}>
            {tCheckReason(check.reason, lang)}
          </p>
        </div>
      </div>
    </div>
  );
}