// ═══════════════════════════════════════════════════════════════
// RULE TEXT TRANSLATOR — UI Display Layer Only
//
// Batch-translates English rule text to Malayalam for the Astro Clock
// Smart Search rule sections (Supporting, Blocking, Conditional,
// Exceptions, Indirect).
//
// RULES:
//   - Keeps Arabic words / Islamic terminology / astrological terms
//     EXACTLY as they are (المريخ, زحل, الشمس, القمر, سعد, نحس...).
//   - Does NOT translate Arabic source quotations.
//   - Translates only the explanatory English text to natural Malayalam.
//   - Does NOT modify: database, LLM prompts, search engine, knowledge
//     graph, timing engine, or canonical records.
//   - Results are cached to avoid repeated LLM calls.
// ═══════════════════════════════════════════════════════════════
import { base44 } from "@/api/base44Client";

const cache = new Map();
const CACHE_MAX = 100;

/**
 * Batch-translate an array of English texts to Malayalam.
 * @param {string[]} texts — English texts to translate
 * @returns {Promise<Object>} — map of original text → Malayalam translation
 */
export async function batchTranslateToMalayalam(texts) {
  if (!texts || texts.length === 0) return {};

  const result = {};
  const uncached = [];

  for (const text of texts) {
    if (!text || typeof text !== "string") continue;
    const key = text.substring(0, 200);
    if (cache.has(key)) {
      result[text] = cache.get(key);
    } else if (!uncached.includes(text)) {
      uncached.push(text);
    }
  }

  // AI auto-translation DISABLED per project language-isolation rules (rule #4:
  // never auto-translate; use only owner-approved content). Returns only cached
  // entries (none, since the cache is never populated) so callers fall through
  // to approved Malayalam text or the approved placeholder.
  return result;
}