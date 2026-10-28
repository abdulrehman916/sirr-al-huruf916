// Search helpers for the Sirr cards.
// Arabic is compared without harakat, tatweel or Quranic marks, and with
// the alef / hamza / ya / ta-marbuta forms folded together, so a query typed
// on a plain phone keyboard still finds fully vocalised text. Malayalam is
// compared without zero-width joiners. Every word of the query must appear.

const AR_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ࣓-ࣿ]/g;
const JOINERS = /[​-‍⁠﻿]/g;

export function normalizeForSearch(text) {
  return String(text ?? "")
    .normalize("NFC")
    .replace(AR_MARKS, "")
    .replace(JOINERS, "")
    // Malayalam: spelling variants typed for the same word (സിഹ്റ് / സിഹർ /
    // സിഹ്ർ, കണ്ണേറ് / കണ്ണേർ) fold together: no virama, chillu → base
    // letter, റ → ര.
    .replace(/\u0D4D/g, "")
    .replace(/[\u0D7C\u0D31]/g, "ര")
    .replace(/\u0D7D/g, "ല")
    .replace(/\u0D7E/g, "ള")
    .replace(/\u0D7A/g, "ണ")
    .replace(/\u0D7B/g, "ന")
    .replace(/[أإآٱٲٳ]/g, "ا")
    .replace(/[ىیۍ]/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ک/g, "ك")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, " ")
    .trim();
}

export function queryWords(query) {
  return normalizeForSearch(query).split(" ").filter(Boolean);
}

// Flatten any value (strings, arrays, nested objects) into one string.
function flatten(v, out) {
  if (v == null) return out;
  if (typeof v === "string" || typeof v === "number") out.push(String(v));
  else if (Array.isArray(v)) v.forEach((x) => flatten(x, out));
  else if (typeof v === "object") Object.values(v).forEach((x) => flatten(x, out));
  return out;
}

export function buildHaystack(...parts) {
  return normalizeForSearch(flatten(parts, []).join(" "));
}

export function matchesAll(haystack, words) {
  return words.length > 0 && words.every((w) => haystack.includes(w));
}
