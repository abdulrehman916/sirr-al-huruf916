// ═══════════════════════════════════════════════════════════════
// RITUAL SEMANTIC PHRASE — Display-only purpose resolver
// ═══════════════════════════════════════════════════════════════
// Builds the complete ritual purpose phrase (ആചാര ലക്ഷ്യം) from:
//   1. Action   — fixed words: جلب / طرد / الصحة / السقم
//   2. Purpose  — middle word, resolved via Purpose Dictionary
//   3. Ending   — fixed: طرفة العين ("instantly / quickly")
//
// ISOLATED — display-only. Does NOT modify any Mizan calculation,
// Bast, Ebced, Method, engine, timing, Khayr/Sharr, or workflow.
// Reads Mizan state from PageStateContext and calls the existing
// lookupPurposeIntent (the only authorized PurposeDictionary reader).
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { usePageState } from "../context/PageStateContext";
import { lookupPurposeIntent } from "./purposeDictionaryLookup";

const MIZAAN_PAGE_KEY = "mizaan9";

// ── Fixed Action words → meanings (manuscript) ──
export const ACTION_MEANINGS = {
  "جلب":   { en: "Bring",      ml: "കൊണ്ടുവരുക" },
  "طرد":   { en: "Drive away", ml: "അകറ്റുക" },
  "الصحة": { en: "Restore",   ml: "വീണ്ടെടുക്കുക" },
  "السقم": { en: "Inflict",   ml: "ബാധിക്കുക" },
};

// Purpose card key → Action Arabic word (the card IS the Action)
export const CARD_TO_ACTION = {
  celb: "جلب",
  tard: "طرد",
  sihhat: "الصحة",
  sekam: "السقم",
};

// Purpose card key → Modifier Arabic phrase (the card IS the Modifier)
export const CARD_TO_MODIFIER = {
  tarfet: "طرفة العين",
};

// ── Common Ending (fixed, always appended) ──
export const ENDING_MEANING = { en: "Quickly", ml: "വേഗത്തിൽ" };

// ── Known modifier phrases (last N words of the phrase) ──
const MODIFIER_PHRASES = ["طرفة العين", "طرفه العين"];

// ── Arabic grammatical particles to strip before dictionary lookup ──
// Standalone particle words: في, من, إلى, على, عن (filtered out entirely)
// Attached prefixes: بـ, لـ, كـ, و, ف (stripped from word starts when followed by ال)
const STANDALONE_PARTICLES = ["في", "فى", "من", "إلى", "الى", "على", "علي", "عن"];
const PREFIX_PATTERN = /^([بلكوف])(ال.+)$/;

function stripArabicParticles(words) {
  return words
    .filter((w) => !STANDALONE_PARTICLES.includes(w))
    .map((w) => {
      const m = w.match(PREFIX_PATTERN);
      return m ? m[2] : w;
    });
}

// Normalize Arabic: strip harakat + tatweel
function normalizeArabic(text) {
  return String(text || "")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, "")
    .replace(/\u0640/g, "")
    .trim();
}

// ═══════════════════════════════════════════════════════════════
// POSITIONAL PARSER — extracts Action / Main Purpose / Modifier
// ═══════════════════════════════════════════════════════════════
// Structure: [Action Card] + [Main Purpose] + [Modifier]
//   Action = first word if it's جلب/طرد/الصحة/السقم
//   Modifier = last 2 words if they form "طرفة العين" (or variant)
//   Main Purpose = everything in between
//
// The Main Purpose is NEVER the Action Card or the Modifier.
export function parsePurposeStructure(text) {
  const norm = normalizeArabic(text);
  if (!norm) return { action: "", mainPurpose: "", modifier: "" };
  const words = norm.split(/\s+/).filter(Boolean);
  if (!words.length) return { action: "", mainPurpose: "", modifier: "" };

  // 1. Action = first word if it's an action card
  let action = "";
  let rest = [...words];
  if (ACTION_MEANINGS[rest[0]]) {
    action = rest[0];
    rest = rest.slice(1);
  }

  // 2. Modifier = last 2 words if they form a known modifier phrase
  let modifier = "";
  if (rest.length >= 2) {
    const lastTwo = rest.slice(-2).join(" ");
    if (MODIFIER_PHRASES.includes(lastTwo)) {
      modifier = lastTwo;
      rest = rest.slice(0, -2);
    }
  }

  // 3. Main Purpose = everything in between (grammatical particles removed)
  const purposeWords = stripArabicParticles(rest);
  return { action, rawMiddle: rest.join(" ").trim(), mainPurpose: purposeWords.join(" ").trim(), modifier };
}

// Detect action word from raw text (first word if it's an action card)
export function detectAction(text) {
  const parsed = parsePurposeStructure(text);
  return parsed.action || null;
}

// Isolate the middle (Main Purpose) word(s) using positional parsing.
// Strips the first word if it's an Action Card (جلب/طرد/الصحة/السقم)
// and the last 2 words if they form a Modifier (طرفة العين).
// Returns ONLY the Main Purpose for dictionary lookup.
export function extractMiddleWord(text, actionArabic) {
  return parsePurposeStructure(text).mainPurpose;
}

// ═══════════════════════════════════════════════════════════════
// PURE BUILDER — returns the complete semantic phrase
// ═══════════════════════════════════════════════════════════════
// Order: Action + Purpose + Modifier (en) / Modifier + Purpose + Action (ml)
//   en → "Bring Love Quickly"
//   ml → "വേഗത്തിൽ സ്നേഹം കൊണ്ടുവരുക"
export function buildRitualSemanticPhrase({ selections, customPurpose, purposeLookup, lang }) {
  const custom = (customPurpose || "").trim();
  if (!custom) return "";

  // 1. Action — from any selected action card, else detect from text
  let actionArabic = null;
  const actionCard = Array.isArray(selections?.purposes)
    ? selections.purposes.find((k) => CARD_TO_ACTION[k]) : null;
  if (actionCard) actionArabic = CARD_TO_ACTION[actionCard];
  if (!actionArabic) actionArabic = detectAction(custom);

  // 2. Purpose meaning — from dictionary lookup
  let purposeMeaning = "";
  if (purposeLookup?.matched) {
    // Strict language isolation: never fall back to the other language.
    // If the selected language's meaning is missing, leave empty (UI shows "Not Available").
    purposeMeaning = lang === "ml"
      ? (purposeLookup.malayalam_meaning || "")
      : (purposeLookup.english_meaning || "");
  }

  // 3. Modifier — from card selection OR text detection (unified for both modes)
  const parsed = parsePurposeStructure(custom);
  let hasModifier = !!parsed.modifier;
  if (!hasModifier) {
    const purposes = Array.isArray(selections?.purposes) ? selections.purposes : [];
    hasModifier = purposes.some((key) => CARD_TO_MODIFIER[key]);
  }
  const modifierMeaning = hasModifier
    ? (lang === "ml" ? ENDING_MEANING.ml : ENDING_MEANING.en)
    : "";

  // Build complete phrase (single source of truth: resolvedPurposePhrase)
  // Malayalam order:  Purpose + Action (+ Modifier)  → "സ്നേഹം കൊണ്ടുവരുക"
  // English order:    Action + Purpose (+ Modifier)  → "Bring Love"
  if (actionArabic && purposeMeaning) {
    const actionMeaning = lang === "ml"
      ? ACTION_MEANINGS[actionArabic].ml
      : ACTION_MEANINGS[actionArabic].en;
    if (lang === "ml") {
      return hasModifier
        ? `${purposeMeaning} ${actionMeaning} ${modifierMeaning}`
        : `${purposeMeaning} ${actionMeaning}`;
    }
    return hasModifier
      ? `${actionMeaning} ${purposeMeaning} ${modifierMeaning}`
      : `${actionMeaning} ${purposeMeaning}`;
  }
  // Partial: purpose matched but no action detected
  if (purposeMeaning) {
    return hasModifier ? `${purposeMeaning} ${modifierMeaning}` : purposeMeaning;
  }
  // No dictionary match — no semantic phrase
  return "";
}

// ═══════════════════════════════════════════════════════════════
// CANONICAL ARABIC PHRASE — Action + Purpose + Modifier
// Unified builder for both input modes (card selection + full sentence).
// MODE 1: Action from card + Purpose from text + Modifier from card
// MODE 2: All three detected from text
// Both modes produce identical canonical Arabic phrase.
// ═══════════════════════════════════════════════════════════════
export function buildCanonicalArabicPhrase({ selections, customPurpose }) {
  const custom = (customPurpose || "").trim();
  if (!custom) return "";

  const purposes = Array.isArray(selections?.purposes) ? selections.purposes : [];

  // 1. Action — from card, else detect from text
  let actionArabic = null;
  const actionCard = purposes.find((k) => CARD_TO_ACTION[k]);
  if (actionCard) actionArabic = CARD_TO_ACTION[actionCard];
  if (!actionArabic) actionArabic = detectAction(custom);

  // 2. Modifier — from card, else detect from text
  let modifierArabic = null;
  const modCard = purposes.find((k) => CARD_TO_MODIFIER[k]);
  if (modCard) modifierArabic = CARD_TO_MODIFIER[modCard];
  if (!modifierArabic) modifierArabic = parsePurposeStructure(custom).modifier || null;

  // 3. Main Purpose — from text (positional parser strips action + modifier)
  const mainPurpose = parsePurposeStructure(custom).mainPurpose || custom;

  // Build canonical: Action + Purpose + Modifier
  const parts = [];
  if (actionArabic) parts.push(actionArabic);
  if (mainPurpose) parts.push(mainPurpose);
  if (modifierArabic) parts.push(modifierArabic);
  return parts.join(" ");
}

// ═══════════════════════════════════════════════════════════════
// PURE HELPER — Build a display phrase from an AI-suggested meaning
// (display-only; used by AIPurposeSuggestionPanel + ConfigurationAdvisor)
// ═══════════════════════════════════════════════════════════════
export function buildPhraseFromAIMeaning({ actionArabic, englishMeaning, malayalamMeaning, lang }) {
  const purpose = lang === "ml"
    ? (malayalamMeaning || "")
    : (englishMeaning || "");
  if (!purpose) return "";
  const actionMeaning = actionArabic && ACTION_MEANINGS[actionArabic]
    ? (lang === "ml" ? ACTION_MEANINGS[actionArabic].ml : ACTION_MEANINGS[actionArabic].en)
    : "";
  const ending = lang === "ml" ? ENDING_MEANING.ml : ENDING_MEANING.en;
  if (actionMeaning) {
    if (lang === "ml") return `${ending} ${purpose} ${actionMeaning}`;
    return `${actionMeaning} ${purpose} ${ending}`;
  }
  if (lang === "ml") return `${ending} ${purpose}`;
  return `${purpose} ${ending}`;
}

// ═══════════════════════════════════════════════════════════════
// REACT HOOK — reads Mizan state from PageStateContext + dictionary
// ═══════════════════════════════════════════════════════════════
export function useRitualSemanticPhrase(lang, refreshKey = 0) {
  const { getPageState } = usePageState();
  const [phrase, setPhrase] = useState("");

  const state = getPageState(MIZAAN_PAGE_KEY, { selections: {}, customPurpose: "" });
  const selections = state.selections || {};
  const customPurpose = state.customPurpose || "";

  useEffect(() => {
    const custom = (customPurpose || "").trim();
    if (!custom) { setPhrase(""); return; }
    let cancelled = false;
    // Resolve the MIDDLE word only (strip Action + Ending tokens) so the
    // dictionary returns the purpose's stored semantic meaning, not a
    // literal translation of the whole typed phrase.
    let actionArabic = null;
    const purposes = Array.isArray(selections?.purposes) ? selections.purposes : [];
    const actionCard = purposes.find((k) => CARD_TO_ACTION[k]);
    if (actionCard) actionArabic = CARD_TO_ACTION[actionCard];
    if (!actionArabic) actionArabic = detectAction(custom);
    const middleWord = extractMiddleWord(custom, actionArabic);
    if (!middleWord) { setPhrase(""); return; }
    // Lookup ONLY the Main Purpose (middle segment) — never the full phrase.
    lookupPurposeIntent(middleWord, actionCard || null).then((res) => {
      if (!cancelled) {
        setPhrase(buildRitualSemanticPhrase({ selections, customPurpose, purposeLookup: res, lang }));
      }
    });
    return () => { cancelled = true; };
  }, [customPurpose, selections, lang, refreshKey]);

  return phrase;
}