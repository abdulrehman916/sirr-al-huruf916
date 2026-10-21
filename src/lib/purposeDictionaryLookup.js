// ═══════════════════════════════════════════════════════════════
// PURPOSE DICTIONARY LOOKUP — Client-side reader and session-only suggestions
// ═══════════════════════════════════════════════════════════════
// Calls one indexed, read-only backend match and returns at most one purpose.
// A user-selected suggestion applies to this session only; only the Owner
// management page may write PurposeDictionary.
//
// ── PERMANENT ISOLATION LAW ──
// This helper is the ONLY client-side reader of PurposeDictionary.
// It is READ ONLY, returns at most ONE normalized key or {matched:false},
// and must NEVER modify any workflow, trigger any calculation, or
// influence any Mizan other than injecting a purpose key into the
// existing 7th-Mizan selections. See purposeDictionaryIsolationLaw.js.
// ═══════════════════════════════════════════════════════════════
import { platform } from "@/api/platformClient";
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
  const promise = platform.functions.invoke("autoLearnPurpose", {
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
// This helper remains available to refresh a lookup after an admin edit.
export function clearLookupCache(customPurpose, selectedAction) {
  if (customPurpose) {
    const cacheKey = `${customPurpose}::${selectedAction || ""}`;
    lookupCache.delete(cacheKey);
  } else {
    lookupCache.clear();
  }
}

// A chosen candidate is a display/session selection, never a database write.
export function confirmPurposeMeaning({ mainPurpose, english_meaning, malayalam_meaning, normalized_purpose_key }) {
  const allowedKeys = ["celb", "tard", "sihhat", "sekam", "tarfet", "rizq", "knowledge", "travel", "sultan", "haybah"];
  if (!allowedKeys.includes(normalized_purpose_key)) return Promise.resolve({ matched: false, error: "Unknown purpose key" });
  return Promise.resolve({
    matched: true,
    ritualIntent: normalized_purpose_key,
    normalized_purpose_key,
    matchedPhrase: String(mainPurpose || ""),
    english_meaning: String(english_meaning || ""),
    malayalam_meaning: String(malayalam_meaning || ""),
    source: "Selected suggestion (this session only)",
    auto_learned: false,
  });
}
