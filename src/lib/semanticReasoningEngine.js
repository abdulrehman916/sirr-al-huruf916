// ═══════════════════════════════════════════════════════════════
// SEMANTIC REASONING ENGINE
// The core Knowledge Reasoning Engine for the Astro Clock.
//
// Unlike keyword search, this engine UNDERSTANDS the meaning of
// the user's action by:
//   1. Resolving any input (ML/AR/EN) to a canonical action via
//      a reverse index of ALL synonyms in the knowledge graph
//   2. Expanding the canonical action to ALL related terms
//      (synonyms + children + related + equivalent + manuscript keywords)
//   3. Enabling dynamic knowledge matching against ANY text
//      using the full expanded term set
//
// PERFORMANCE:
//   - Reverse index built once, cached (O(1) exact match lookup)
//   - Action expansion cached per canonicalId
//   - Resolution cached per normalized input
//   - No duplicate searches — identical inputs return cached results
//
// EXTENSIBILITY:
//   - Adding new synonyms to semanticKnowledgeGraph.js automatically
//     makes them searchable — no code changes needed
//   - The reverse index is rebuilt from data on first use
//
// ISOLATED — does NOT modify timing engine, calculation engine,
// OCR, translation, schema, or any existing module.
// ═══════════════════════════════════════════════════════════════
import { SEMANTIC_GRAPH } from "./semanticKnowledgeGraph";

// ── Caches (module-level, persist across hook re-renders) ──
const _expansionCache = new Map();   // canonicalId → expansion object
const _resolutionCache = new Map();  // normalizedInput → resolution object
let _reverseIndex = null;             // Map<normalizedSynonym, canonicalId>

// ── Text normalization ──
// Removes Arabic harakat, lowercases, trims, collapses whitespace
function normalize(text) {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .trim()
    // Remove Arabic diacritics (harakat)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    // Remove leading/trailing spaces again after collapse
    .trim();
}

// ── Build reverse index: normalizedSynonym → canonicalId ──
// Built once on first use, then cached. O(1) exact match lookup.
function getReverseIndex() {
  if (_reverseIndex) return _reverseIndex;

  _reverseIndex = new Map();

  for (const [id, action] of Object.entries(SEMANTIC_GRAPH)) {
    // Index the canonical id itself
    _reverseIndex.set(id, id);

    // Index all synonyms across all languages
    for (const lang of ["ml", "en", "ar"]) {
      for (const syn of action.synonyms[lang] || []) {
        const n = normalize(syn);
        if (n && n.length >= 2 && !_reverseIndex.has(n)) {
          _reverseIndex.set(n, id);
        }
      }
    }
  }

  return _reverseIndex;
}

// ── Resolve user input to a canonical action ──
// Uses exact match first (O(1)), then partial/contains matching.
// Results are cached per normalized input.
//
// @param {string} userInput - User's action text (any language)
// @returns {{ canonicalId: string, confidence: number, matchedTerm: string, matchType: string } | null}
export function resolveAction(userInput) {
  if (!userInput || !userInput.trim()) return null;

  const normalized = normalize(userInput);

  // Check cache
  if (_resolutionCache.has(normalized)) {
    return _resolutionCache.get(normalized);
  }

  const index = getReverseIndex();

  // ── 1. Exact match (O(1)) ──
  if (index.has(normalized)) {
    const result = {
      canonicalId: index.get(normalized),
      confidence: 100,
      matchedTerm: userInput,
      matchType: "exact",
    };
    _resolutionCache.set(normalized, result);
    return result;
  }

  // ── 2. Partial match — input contains a synonym ──
  let bestMatch = null;
  let bestScore = 0;
  let bestTerm = "";

  for (const [synonym, canonicalId] of index.entries()) {
    if (synonym.length < 3) continue;

    // User input contains a full synonym → high confidence
    if (normalized.includes(synonym)) {
      const score = Math.min(95, 55 + synonym.length * 3);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = canonicalId;
        bestTerm = synonym;
      }
    }
    // A synonym contains the user input → medium confidence (user typed partial)
    else if (synonym.includes(normalized) && normalized.length >= 3) {
      const score = Math.min(75, 35 + normalized.length * 3);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = canonicalId;
        bestTerm = normalized;
      }
    }
  }

  if (!bestMatch || bestScore < 30) {
    _resolutionCache.set(normalized, null);
    return null;
  }

  const result = {
    canonicalId: bestMatch,
    confidence: bestScore,
    matchedTerm: bestTerm,
    matchType: "partial",
  };
  _resolutionCache.set(normalized, result);
  return result;
}

// ── Expand a canonical action to ALL related terms ──
// Collects synonyms from the action itself + all children, related,
// and equivalent topics (if they exist as graph entries).
// Also collects manuscript keywords for knowledge base querying.
//
// Results are cached per canonicalId.
//
// @param {string} canonicalId
// @returns {object|null} expansion object
export function expandAction(canonicalId) {
  if (!canonicalId) return null;
  if (_expansionCache.has(canonicalId)) return _expansionCache.get(canonicalId);

  const action = SEMANTIC_GRAPH[canonicalId];
  if (!action) return null;

  const allTerms = new Set();
  const allManuscriptKeywords = new Set();
  const relatedTopics = [];
  const equivalentTopics = [];
  const childTopics = [];

  // ── Collect from a single action entry ──
  const collectFromAction = (act) => {
    if (!act) return;
    // Synonyms (all languages)
    for (const lang of ["ml", "en", "ar"]) {
      for (const syn of act.synonyms[lang] || []) {
        const n = normalize(syn);
        if (n && n.length >= 2) allTerms.add(n);
      }
      // Manuscript keywords
      if (act.manuscript_keywords && act.manuscript_keywords[lang]) {
        for (const kw of act.manuscript_keywords[lang]) {
          const n = normalize(kw);
          if (n && n.length >= 2) allManuscriptKeywords.add(n);
        }
      }
    }
  };

  // Collect from the main action
  collectFromAction(action);

  // Collect child topic labels
  for (const child of action.children || []) {
    childTopics.push(child);
    // Check if child is a graph entry
    const childEntry = SEMANTIC_GRAPH[child.toLowerCase().replace(/\s+/g, "_")];
    if (childEntry) collectFromAction(childEntry);
  }

  // Collect related topic labels
  for (const rel of action.related || []) {
    relatedTopics.push(rel);
    const relEntry = SEMANTIC_GRAPH[rel.toLowerCase().replace(/\s+/g, "_")];
    if (relEntry) collectFromAction(relEntry);
  }

  // Collect equivalent topic labels
  for (const equiv of action.equivalent || []) {
    equivalentTopics.push(equiv);
    const equivEntry = SEMANTIC_GRAPH[equiv.toLowerCase().replace(/\s+/g, "_")];
    if (equivEntry) collectFromAction(equivEntry);
  }

  // Also add manuscript keywords from the main action to allTerms
  // so text matching can find knowledge records containing them
  for (const kw of allManuscriptKeywords) {
    if (kw.length >= 3) allTerms.add(kw);
  }

  const expansion = {
    canonicalId,
    canonicalLabel: action.label,
    allTerms: Array.from(allTerms),
    manuscriptKeywords: Array.from(allManuscriptKeywords),
    relatedTopics,
    equivalentTopics,
    childTopics,
    supportingConcepts: action.supporting_concepts || [],
    blockingConcepts: action.blocking_concepts || [],
    preferredPlanets: action.preferred_planets || [],
    avoidPlanets: action.avoid_planets || [],
    preferredDays: action.preferred_days || [],
    parentCategory: action.parent || "",
  };

  _expansionCache.set(canonicalId, expansion);
  return expansion;
}

// ── Check if a text matches any term in the expansion ──
// Used for dynamic knowledge matching — works on any text, any language.
// Checks if the text contains any of the expanded terms (synonyms,
// related terms, manuscript keywords).
//
// @param {string} text - Text to check
// @param {object} expansion - Expansion object from expandAction()
// @returns {boolean}
export function textMatchesExpansion(text, expansion) {
  if (!text || !expansion || !expansion.allTerms) return false;
  const textLC = normalize(text);
  if (!textLC) return false;

  for (const term of expansion.allTerms) {
    if (term.length < 3) continue;
    if (textLC.includes(term)) return true;
  }
  return false;
}

// ── Generate a human-readable reasoning summary ──
// Explains the reasoning process: what was detected, what it resolved to,
// what related topics were found, how many rules were used.
//
// @param {object} params - { resolution, expansion, knowledgeRuleCount, suitable, language }
// @returns {string} Multi-line reasoning summary
export function generateReasoningSummary({ resolution, expansion, knowledgeRuleCount, suitable, preferredPlanets, avoidPlanets }) {
  if (!resolution || !expansion) return "";

  const lines = [];

  // Detected action
  lines.push(`Detected: "${resolution.matchedTerm}"`);

  // Canonical action
  lines.push(`Resolved to: ${expansion.canonicalLabel.en}`);

  // Related topics
  if (expansion.relatedTopics.length > 0) {
    lines.push(`Related topics: ${expansion.relatedTopics.slice(0, 5).join(", ")}`);
  }

  // Equivalent meanings
  if (expansion.equivalentTopics.length > 0) {
    lines.push(`Equivalent meanings: ${expansion.equivalentTopics.slice(0, 3).join(", ")}`);
  }

  // Knowledge rules
  lines.push(`Knowledge rules applied: ${knowledgeRuleCount}`);

  // Timing assessment
  if (suitable) {
    lines.push(`Assessment: Favorable — ${preferredPlanets.join(", ")} hours recommended`);
  } else {
    lines.push(`Assessment: Not ideal — ${avoidPlanets.join(", ")} hours should be avoided`);
  }

  return lines.join("\n");
}

// ── Clear all caches (for testing or manual refresh) ──
export function clearCaches() {
  _expansionCache.clear();
  _resolutionCache.clear();
  _reverseIndex = null;
}

export default {
  resolveAction,
  expandAction,
  textMatchesExpansion,
  generateReasoningSummary,
  clearCaches,
};