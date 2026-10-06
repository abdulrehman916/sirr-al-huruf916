// ═══════════════════════════════════════════════════════════════
// SHARED UTILITIES FOR RITUAL REPORT SECTIONS
// Colors, translation helpers, maps — used by all section components
// ═══════════════════════════════════════════════════════════════

export const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

export const T = (en, ml, lang) => (lang === "ml" ? ml : en);

export const ML_DAY = {
  Sunday: "ഞായർ", Monday: "തിങ്കൾ", Tuesday: "ചൊവ്വ",
  Wednesday: "ബുധൻ", Thursday: "വ്യാഴം", Friday: "വെള്ളി", Saturday: "ശനി",
};

export const ML_PLANET = {
  Sun: "സൂര്യൻ", Moon: "ചന്ദ്രൻ", Mars: "ചൊവ്വ", Mercury: "ബുധൻ",
  Jupiter: "ഗുരു", Venus: "ശുക്രൻ", Saturn: "ശനി",
  sun: "സൂര്യൻ", moon: "ചന്ദ്രൻ", mars: "ചൊവ്വ", mercury: "ബുധൻ",
  jupiter: "ഗുരു", venus: "ശുക്രൻ", saturn: "ശനി",
};

export const MIZAN_DAY_NAMES = {
  sun: "Sunday", mon: "Monday", tue: "Tuesday", wed: "Wednesday",
  thu: "Thursday", fri: "Friday", sat: "Saturday",
};

export const DAY_KEY_BY_INDEX = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function translatePlanet(name, lang) {
  if (!name) return "";
  return ML_PLANET[name] || ML_PLANET[String(name).toLowerCase()] || name;
}

export function translateDay(name, lang) {
  if (!name) return "";
  return ML_DAY[name] || name;
}

export function capitalize(s) {
  if (!s) return s;
  return String(s).charAt(0).toUpperCase() + String(s).slice(1).toLowerCase();
}

export function saatDisplayNum(hourNumber, period) {
  return period === "night" ? hourNumber - 12 : hourNumber;
}