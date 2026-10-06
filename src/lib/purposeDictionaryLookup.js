// ═══════════════════════════════════════════════════════════════
// PURPOSE DICTIONARY LOOKUP — Client-side helper
// ═══════════════════════════════════════════════════════════════
// Calls the backend autoLearnPurpose function: checks the dictionary first,
// and if no match exists, auto-generates + saves a new entry (self-learning).
// Returns { matched: boolean, ritualIntent?: string, auto_learned?: boolean }.
// Never exposes dictionary contents to the client.
//
// ── PERMANENT ISOLATION LAW ──
// This helper is the ONLY client-side reader of PurposeDictionary.
// It is READ ONLY, returns at most ONE normalized key or {matched:false},
// and must NEVER modify any workflow, trigger any calculation, or
// influence any Mizan other than injecting a purpose key into the
// existing 7th-Mizan selections. See purposeDictionaryIsolationLaw.js.
// ═══════════════════════════════════════════════════════════════
import { base44 } from "@/api/base44Client";
import "@/lib/purposeDictionaryIsolationLaw";

// In-memory lookup cache with Promise sharing — guarantees exactly ONE
// network request per unique input, even when multiple components
// (PurposeInterpretationCard, useRitualSemanticPhrase, etc.) call
// concurrently or React re-renders fire repeatedly. Cleared on page reload.
const lookupCache = new Map();

export function lookupPurposeIntent(customPurpose, selectedAction) {
  if (!customPurpose || !customPurpose.trim()) {
    return Promise.resolve({ matched: false });
  }
  const cacheKey = `${customPurpose}::${selectedAction || ""}`;
  if (lookupCache.has(cacheKey)) {
    return lookupCache.get(cacheKey);
  }
  const promise = base44.functions.invoke("autoLearnPurpose", {
    customPurpose,
    selectedAction,
  })
    .then((response) => response.data || { matched: false })
    .catch((err) => {
      lookupCache.delete(cacheKey);
      return { matched: false, _debug: { error: err?.message || "Request failed", lookupPath: "frontend_error" } };
    });
  lookupCache.set(cacheKey, promise);
  return promise;
}

// Clear the lookup cache so the next lookup re-queries the dictionary.
// Called after a user confirms a meaning (the new dictionary entry must
// be found on the next lookup, not the stale needsConfirmation result).
export function clearLookupCache(customPurpose, selectedAction) {
  if (customPurpose) {
    const cacheKey = `${customPurpose}::${selectedAction || ""}`;
    lookupCache.delete(cacheKey);
  } else {
    lookupCache.clear();
  }
}

// Confirm a user-selected candidate meaning. Saves to PurposeDictionary
// and returns the confirmed result in the same shape as lookupPurposeIntent.
export function confirmPurposeMeaning({ mainPurpose, english_meaning, malayalam_meaning, normalized_purpose_key, synonyms, ai_confidence }) {
  return base44.functions.invoke("confirmPurposeMeaning", {
    mainPurpose,
    english_meaning,
    malayalam_meaning,
    normalized_purpose_key,
    synonyms,
    ai_confidence,
  })
    .then((response) => response.data || { matched: false })
    .catch((err) => {
      return { matched: false, error: err?.message || "Confirmation failed" };
    });
}