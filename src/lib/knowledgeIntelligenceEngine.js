// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE INTELLIGENCE ENGINE
//
// A true knowledge-driven search engine — NOT a synonym matcher.
//
// ARCHITECTURE:
//   1. Collect ALL verified knowledge from database (no keyword filter)
//   2. Send user input + ALL knowledge to LLM for semantic analysis
//   3. LLM understands intent, finds canonical action, classifies every
//      relevant record, determines preferred/avoided planets, writes reasoning
//   4. Engine merges LLM classification with original database records
//   5. Hook combines with timing engine (read-only)
//
// AUTO-LEARNING:
//   No static synonym list. The LLM understands ANY term in ANY language
//   (ML, AR, EN). When new terms appear in the knowledge database, the
//   engine automatically understands them — zero code changes needed.
//
// ISOLATED:
//   Does NOT modify timing engine, calculation engine, database schema,
//   OCR, translation, Nine Mizan, Abjad, Bast, authentication, or navigation.
// ═══════════════════════════════════════════════════════════════
import { base44 } from "@/api/base44Client";
import { classifyAction, ACTION_CATEGORIES } from "./astroActionClassifier";

// ── Response cache (avoids duplicate LLM calls for same input+weekday) ──
const responseCache = new Map();
const CACHE_MAX = 30;

// ── LLM response JSON schema ──
const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: true,
  properties: {
    canonicalId: {
      type: "string",
      description: "Canonical action ID from: construction, travel, marriage, business, agriculture, medical, love, protection, wealth, knowledge, spiritual, courage, or unknown"
    },
    canonicalAction: {
      type: "object",
      properties: {
        ml: { type: "string" },
        en: { type: "string" },
        ar: { type: "string" }
      }
    },
    relatedConcepts: {
      type: "array",
      items: { type: "string" }
    },
    preferredPlanets: {
      type: "array",
      items: { type: "string" }
    },
    avoidPlanets: {
      type: "array",
      items: { type: "string" }
    },
    preferredDays: {
      type: "array",
      items: { type: "string" }
    },
    relevantRecords: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: true,
        properties: {
          recordId: { type: "string" },
          relevance: { type: "number" },
          classification: { type: "string" },
          reason: { type: "string" }
        }
      }
    },
    reasoningSummary: { type: "string" },
    confidence: { type: "number" }
  }
};

// ── Collect ALL verified knowledge from database (no keyword filter) ──
async function collectAllKnowledge(weekday) {
  // PERMANENT ARCHITECTURE: all astrology knowledge lives ONLY in
  // AstroClockKnowledge. Timing = full_context records; entity knowledge =
  // categorized records. EntityKnowledge is no longer read here.
  const [ackData, ekData] = await Promise.all([
    base44.entities.AstroClockKnowledge.filter(
      { weekday, is_marker: false },
      "-source_count",
      30
    ),
    base44.entities.AstroClockKnowledge.filter(
      { is_marker: false, source_type: "categorized" },
      "-source_count",
      50
    ),
  ]);
  return { ackRecords: ackData || [], ekRecords: ekData || [] };
}

// ── Format records into compact lines for LLM prompt ──
function formatRecordsForLLM(ackRecords, ekRecords) {
  const lines = [];

  ackRecords.forEach(r => {
    const rec = (r.recommended_actions || []).map(a => a.en).filter(Boolean).join("; ");
    const forb = (r.forbidden_actions || []).map(a => a.en).filter(Boolean).join("; ");
    const sum = (r.knowledge_text_en || "").substring(0, 150);
    const suit = (r.ritual_suitability || "").substring(0, 80);
    lines.push(
      `ACK|${r.knowledge_id}|saat:${r.saat_number || "?"}|period:${r.period || "?"}|planet:${r.planet || "?"}|recommended:[${rec}]|forbidden:[${forb}]|suitability:${suit}|summary:${sum}`
    );
  });

  ekRecords.forEach(r => {
    const text = (r.knowledge_text_en || "").substring(0, 150);
    const cat = (r.attributes && r.attributes.knowledge_category) || r.rule_category || "general";
    lines.push(
      `EK|${r.knowledge_id}|entity:${r.rule_category || r.entity_type}/${r.rule_entity || r.entity_key}|category:${cat}|text:${text}`
    );
  });

  return lines.join("\n");
}

// ── Build the LLM prompt ──
function buildPrompt(userInput, formattedRecords, weekdayName, weekdayIndex) {
  return `You are a Knowledge Intelligence Engine for an Islamic astrological timing system.

The system uses 7 planets (sun, moon, mars, mercury, jupiter, venus, saturn), 7 weekdays (sunday-saturday), and 24 planetary hours (12 day + 12 night). Each hour is governed by a planet. Certain actions are recommended or forbidden during specific planetary hours based on verified manuscript knowledge.

USER SEARCH: "${userInput}"
TODAY: ${weekdayName} (index ${weekdayIndex})

VERIFIED KNOWLEDGE RECORDS FROM MANUSCRIPT DATABASE:
${formattedRecords}

YOUR TASK:
1. INTENT: Understand what the user wants to do. Identify the canonical action in Malayalam (ml), English (en), and Arabic (ar). Also identify the canonical ID from: construction, travel, marriage, business, agriculture, medical, love, protection, wealth, knowledge, spiritual, courage, or "unknown".
2. EXPAND: List ALL related concepts, synonyms, and sub-actions in any language.
3. ANALYZE: For EACH knowledge record above, determine:
   - Is it relevant to the user's intent? (If yes, relevance score 1-100; if no, skip it)
   - Classification: "supporting" (recommends/supports the action), "blocking" (forbids/warns against), "conditional" (allowed only under specific conditions stated in the record), "exception" (exception to a general rule about this action), "indirect" (indirectly related — e.g., planet properties, general timing rules)
   - Reason: Brief explanation of why this record is relevant
4. PLANETS: Based on ALL relevant records, determine preferred planets (favorable for this action) and avoid planets (unfavorable). Use keys: sun, moon, mars, mercury, jupiter, venus, saturn.
5. DAYS: Determine preferred weekdays. Use keys: sunday, monday, tuesday, wednesday, thursday, friday, saturday.
6. REASONING: Write a detailed reasoning summary citing specific records by their ID.
7. CONFIDENCE: Overall confidence (0-100) based on how much verified knowledge supports the analysis.

CRITICAL RULES:
- Base your analysis ONLY on the verified records above. Do NOT use external knowledge or invent rules.
- If no records are relevant, set confidence to 0 and explain in reasoning.
- Include ALL relevant records, not just the top few.
- Consider indirect relationships (e.g., if a record mentions a planet's properties and that planet governs the action).
- The canonical action must reflect the user's TRUE intent, not just a keyword match.`;
}

// ── Collect all action arrays from an ACK record ──
function collectActions(record) {
  const actions = [];
  const collect = (arr, type) => {
    if (!Array.isArray(arr)) return;
    arr.forEach(a => {
      actions.push({ type, en: a.en || "", ml: a.ml || "", ar: a.ar || "" });
    });
  };
  collect(record.recommended_actions, "recommended");
  collect(record.forbidden_actions, "forbidden");
  collect(record.friendship_actions, "friendship");
  collect(record.enemy_actions, "enemy");
  return actions;
}

// ── Normalize arrays to lowercase strings ──
function normalizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr.map(s => String(s).toLowerCase().trim()).filter(Boolean);
}

// ── Merge LLM classification with original database records ──
function processResponse(llmResponse, ackRecords, ekRecords) {
  const resp = typeof llmResponse === "string" ? JSON.parse(llmResponse) : llmResponse;

  // Build lookup map: recordId → { type, record }
  const recordMap = new Map();
  ackRecords.forEach(r => recordMap.set(r.knowledge_id, { type: "ACK", record: r }));
  ekRecords.forEach(r => recordMap.set(r.knowledge_id, { type: "EK", record: r }));

  // Merge each LLM-classified record with its full database data
  const relevantRecords = (resp.relevantRecords || []).map(rr => {
    const entry = recordMap.get(rr.recordId);
    if (!entry) return null; // LLM hallucinated a record ID — skip
    const { type, record } = entry;

    if (type === "ACK") {
      return {
        recordId: rr.recordId,
        relevance: rr.relevance,
        classification: rr.classification,
        reason: rr.reason,
        recordType: "ACK",
        saat: record.saat_number,
        period: record.period,
        planet: record.planet,
        actions: collectActions(record),
        summary: record.knowledge_text_en || "",
        ritual_suitability: record.ritual_suitability || "",
        source: record.source_book_title || "Screenshot Upload",
        page: record.source_page_number,
        screenshot: record.source_screenshot_url,
        supporting_sources: record.supporting_sources || [],
        source_count: record.source_count || 1,
      };
    } else {
      return {
        recordId: rr.recordId,
        relevance: rr.relevance,
        classification: rr.classification,
        reason: rr.reason,
        recordType: "EK",
        text: record.knowledge_text_en || "",
        text_ml: record.knowledge_text_ml || "",
        text_ar: record.knowledge_text_ar || "",
        category: (record.attributes && record.attributes.knowledge_category) || record.rule_category || record.knowledge_category,
        entity_type: record.rule_category || record.entity_type,
        entity_key: record.rule_entity || record.entity_key,
        source: record.source_book_title || "Manuscript",
        page: record.source_page_number,
        screenshot: record.source_screenshot_url,
        supporting_sources: record.supporting_sources || [],
        source_count: record.source_count || 1,
      };
    }
  }).filter(Boolean);

  return {
    canonicalId: resp.canonicalId || "unknown",
    canonicalAction: resp.canonicalAction || { ml: "", en: "", ar: "" },
    relatedConcepts: resp.relatedConcepts || [],
    preferredPlanets: normalizeArray(resp.preferredPlanets),
    avoidPlanets: normalizeArray(resp.avoidPlanets),
    preferredDays: normalizeArray(resp.preferredDays),
    relevantRecords,
    reasoningSummary: resp.reasoningSummary || "",
    confidence: resp.confidence || 0,
  };
}

// ═══════════════════════════════════════════════════════════════
// DETERMINISTIC FALLBACK — classify verified DB records without an LLM
//
// When the LLM is unavailable (integration credits exhausted), this builds the
// SAME relevantRecords shape as processResponse from the already-collected
// verified AstroClockKnowledge records — zero credit cost, zero extra DB call.
// Each returned record carries source (book title) + page + chapter (category)
// + actions/text + supporting_sources, so the hook renders the full manuscript
// evidence package: source, title, page, chapter, lunar condition, planetary
// condition, references.
//
// Classification logic (manuscript-aligned, deterministic):
//   ACK timing records:
//     • planet ∈ avoidPlanets  + forbidden/keyword match → "blocking"
//     • planet ∈ preferredPlanets + recommended actions  → "supporting"
//     • keyword match in recommended/forbidden actions   → "supporting"/"blocking"
//     • keyword match only (no planet signal)             → "conditional"
//   EK categorized records:
//     • rule_category=Planet for a preferred/avoid planet  → "indirect" (planetary condition)
//     • rule_category=Moon/Mansion/Zodiac/Phase            → "indirect" (lunar condition)
//     • concept keyword in text (en/ml/ar)                 → "supporting"
// ═══════════════════════════════════════════════════════════════
function buildFallbackRecords(classified, ackRecords, ekRecords) {
  const category = ACTION_CATEGORIES[classified.category] || {};
  const preferred = (category.preferredPlanets || []).map(p => String(p).toLowerCase());
  const avoid = (category.avoidPlanets || []).map(p => String(p).toLowerCase());

  // Multilingual concept synonyms for text matching
  const synonyms = new Set();
  if (category.synonyms) {
    Object.values(category.synonyms).forEach(arr => {
      (arr || []).forEach(s => synonyms.add(String(s).toLowerCase()));
    });
  }
  if (category.label) {
    Object.values(category.label).forEach(s => { if (s) synonyms.add(String(s).toLowerCase()); });
  }
  const matchText = (t) => {
    if (!t || synonyms.size === 0) return false;
    const low = String(t).toLowerCase();
    for (const s of synonyms) if (low.includes(s)) return true;
    return false;
  };

  const relevant = [];

  // ── ACK timing records ──
  ackRecords.forEach(record => {
    const planet = String(record.planet || "").toLowerCase();
    const actions = collectActions(record);
    const actionText = actions.map(a => `${a.en} ${a.ml} ${a.ar}`).join(" ");
    const matchesSyn = matchText(actionText) || matchText(record.knowledge_text_en);
    const hasRecommended = actions.some(a => a.type === "recommended");
    const hasForbidden = actions.some(a => a.type === "forbidden");
    const isPreferred = preferred.includes(planet);
    const isAvoid = avoid.includes(planet);

    let classification = null;
    if (isAvoid && (hasForbidden || matchesSyn)) classification = "blocking";
    else if (isPreferred && hasRecommended) classification = "supporting";
    else if (matchesSyn && hasForbidden) classification = "blocking";
    else if (matchesSyn && hasRecommended) classification = "supporting";
    else if (matchesSyn) classification = "conditional";
    if (!classification) return;

    relevant.push({
      recordId: record.knowledge_id,
      relevance: classification === "supporting" ? 82 : classification === "blocking" ? 76 : 62,
      classification,
      reason: classification === "blocking"
        ? `Avoided planet (${planet || "n/a"}) for this action`
        : classification === "supporting"
          ? `Preferred planet (${planet || "n/a"}) with recommended actions`
          : `Concept keyword match in manuscript actions`,
      recordType: "ACK",
      saat: record.saat_number,
      period: record.period,
      planet: record.planet,
      actions,
      summary: record.knowledge_text_en || "",
      ritual_suitability: record.ritual_suitability || "",
      source: record.source_book_title || "Screenshot Upload",
      page: record.source_page_number,
      screenshot: record.source_screenshot_url,
      supporting_sources: record.supporting_sources || [],
      source_count: record.source_count || 1,
    });
  });

  // ── EK categorized records (planetary + lunar conditions, concept matches) ──
  const LUNAR_CATS = ["moon", "lunar mansion", "moon phase", "zodiac"];
  ekRecords.forEach(record => {
    const rcat = String(record.rule_category || "").toLowerCase();
    const rkey = String(record.rule_entity || "").toLowerCase();
    const text = record.knowledge_text_en || "";

    // Planetary condition: Planet-category record for a preferred/avoid planet
    if (rcat === "planet" && (preferred.includes(rkey) || avoid.includes(rkey))) {
      relevant.push({
        recordId: record.knowledge_id,
        relevance: 72,
        classification: "indirect",
        reason: `Planetary condition — ${rkey} (${avoid.includes(rkey) ? "avoided" : "preferred"})`,
        recordType: "EK",
        text, text_ml: record.knowledge_text_ml || "", text_ar: record.knowledge_text_ar || "",
        category: (record.attributes && record.attributes.knowledge_category) || record.rule_category || record.knowledge_category,
        entity_type: record.rule_category, entity_key: record.rule_entity,
        source: record.source_book_title || "Manuscript",
        page: record.source_page_number,
        screenshot: record.source_screenshot_url,
        supporting_sources: record.supporting_sources || [],
        source_count: record.source_count || 1,
      });
      return;
    }

    // Lunar condition: Moon / Mansion / Zodiac / Phase
    if (LUNAR_CATS.includes(rcat)) {
      relevant.push({
        recordId: record.knowledge_id,
        relevance: 56,
        classification: "indirect",
        reason: `Lunar condition — ${rcat}`,
        recordType: "EK",
        text, text_ml: record.knowledge_text_ml || "", text_ar: record.knowledge_text_ar || "",
        category: (record.attributes && record.attributes.knowledge_category) || record.rule_category || record.knowledge_category,
        entity_type: record.rule_category, entity_key: record.rule_entity,
        source: record.source_book_title || "Manuscript",
        page: record.source_page_number,
        screenshot: record.source_screenshot_url,
        supporting_sources: record.supporting_sources || [],
        source_count: record.source_count || 1,
      });
      return;
    }

    // Concept keyword in any categorized record text
    if (matchText(text) || matchText(record.knowledge_text_ml) || matchText(record.knowledge_text_ar)) {
      relevant.push({
        recordId: record.knowledge_id,
        relevance: 66,
        classification: "supporting",
        reason: "Manuscript rule references this action",
        recordType: "EK",
        text, text_ml: record.knowledge_text_ml || "", text_ar: record.knowledge_text_ar || "",
        category: (record.attributes && record.attributes.knowledge_category) || record.rule_category || record.knowledge_category,
        entity_type: record.rule_category, entity_key: record.rule_entity,
        source: record.source_book_title || "Manuscript",
        page: record.source_page_number,
        screenshot: record.source_screenshot_url,
        supporting_sources: record.supporting_sources || [],
        source_count: record.source_count || 1,
      });
    }
  });

  return relevant;
}

// ═══════════════════════════════════════════════════════════════
// MAIN ENTRY POINT
//
// 1. Collect ALL verified knowledge (no keyword filter)
// 2. Send user input + ALL knowledge to LLM
// 3. LLM understands intent, classifies records, determines planets
// 4. Return complete knowledge package for the hook
// ═══════════════════════════════════════════════════════════════
export async function runKnowledgeIntelligenceSearch(userInput, weekday, weekdayName) {
  // Check cache first
  const cacheKey = `${userInput}|${weekday}`;
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  // 1. Collect ALL verified knowledge
  const { ackRecords, ekRecords } = await collectAllKnowledge(weekday);

  // 2. Format records for LLM
  const formattedRecords = formatRecordsForLLM(ackRecords, ekRecords);

  // 3. Build prompt
  const prompt = buildPrompt(userInput, formattedRecords, weekdayName, weekday);

  // 4. Call LLM (automatic model — fast, multilingual, cost-efficient)
  //    FALLBACK: if the LLM call fails (e.g. integration credits exhausted),
  //    resolve the concept deterministically via classifyAction (which now
  //    includes the multilingual semantic concept resolver) and build the
  //    result from ACTION_CATEGORIES — zero credits, zero external calls.
  let processed;
  try {
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: RESPONSE_SCHEMA,
    });
    processed = processResponse(llmResponse, ackRecords, ekRecords);
  } catch (llmErr) {
    const classified = classifyAction(userInput);
    if (classified && ACTION_CATEGORIES[classified.category]) {
      const cat = ACTION_CATEGORIES[classified.category];
      const relevantRecords = buildFallbackRecords(classified, ackRecords, ekRecords);
      processed = {
        canonicalId: classified.category,
        canonicalAction: cat.label,
        relatedConcepts: [],
        preferredPlanets: cat.preferredPlanets || [],
        avoidPlanets: cat.avoidPlanets || [],
        preferredDays: cat.preferredDays || [],
        relevantRecords,
        reasoningSummary: relevantRecords.length
          ? `Concept resolved deterministically; ${relevantRecords.length} verified manuscript record(s) attached (semantic concept resolver — LLM unavailable).`
          : "Concept resolved deterministically (semantic concept resolver; LLM unavailable).",
        confidence: classified.confidence,
      };
    } else {
      throw llmErr;
    }
  }

  // 6. Cache and return
  responseCache.set(cacheKey, processed);
  if (responseCache.size > CACHE_MAX) {
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }

  return processed;
}

// Clear cache (for testing)
export function clearKnowledgeCache() {
  responseCache.clear();
}