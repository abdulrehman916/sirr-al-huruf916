// ═══════════════════════════════════════════════════════════════
// AI PURPOSE SUGGESTION — Client-side helpers (isolated)
// ═══════════════════════════════════════════════════════════════
// Calls the backend aiPurposeSuggestion (read-only AI fallback) and
// savePurposeDictionaryEntry (admin approve-and-save) functions.
// The dictionary (lookupPurposeIntent) ALWAYS has highest priority;
// AI is invoked ONLY when the dictionary returns no match.
// ═══════════════════════════════════════════════════════════════
import { base44 } from "@/api/base44Client";

export async function getAIPurposeSuggestion({ middleWord, fullText, actionArabic, cardKey, lang }) {
  try {
    const res = await base44.functions.invoke("aiPurposeSuggestion", {
      middleWord, fullText, actionArabic, cardKey, lang,
    });
    return res.data || { success: false };
  } catch {
    return { success: false };
  }
}

export async function savePurposeDictionaryEntry(entry) {
  try {
    const res = await base44.functions.invoke("savePurposeDictionaryEntry", entry);
    return res.data || { success: false };
  } catch (e) {
    return { success: false, error: e?.message || "Save failed" };
  }
}