import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// AUTO-LEARN PURPOSE — Self-learning Purpose Dictionary entry
// ═══════════════════════════════════════════════════════════════
// PIPELINE (frozen):
//   1. Call lookupPurposeIntent (existing locked lookup) — if match,
//      return the stored meaning immediately. Never regenerate.
//   2. If NO match → use InvokeLLM to generate Malayalam + English
//      meanings from the Arabic phrase (action + purpose + modifier).
//   3. Save the new entry to PurposeDictionary (source: "AI Generated",
//      notes: "Needs Review") so future lookups find it instantly.
//   4. Return the result in the same shape as lookupPurposeIntent.
//
// LEARN ONCE — NEVER RECALCULATE:
//   After an entry is saved, every subsequent call finds it in step 1
//   and returns the stored meaning. The LLM is never asked again for
//   the same phrase. The dictionary grows smarter with every new purpose.
//
// ISOLATION COMPLIANCE:
//   • READS: delegates to lookupPurposeIntent (the only authorized reader).
//   • WRITES: creates new PurposeDictionary entries via asServiceRole.
//
// Caller: src/lib/purposeDictionaryLookup.js (replaces direct lookupPurposeIntent call).
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// PURPOSE PHRASE PARSER — Positional structure extraction
// ═══════════════════════════════════════════════════════════════
// Every custom purpose follows: [Action Card] + [Main Purpose] + [Modifier]
//   Action Cards:  جلب, طرد, الصحة, السقم  (first word)
//   Modifiers:     طرفة العين              (last 2 words)
//   Main Purpose:  everything in between   (ONLY this goes to the dictionary)
//
// The Main Purpose is NEVER the Action Card or the Modifier.
// Only the Main Purpose is searched in the Purpose Dictionary.
// ═══════════════════════════════════════════════════════════════
const ACTION_CARDS = ["جلب", "طرد", "الصحة", "السقم"];
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

function parsePurposePhrase(text) {
  const norm = String(text || "")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, "") // harakat
    .replace(/\u0640/g, "")                               // tatweel
    .trim();
  if (!norm) return { action: "", mainPurpose: "", modifier: "" };

  const words = norm.split(/\s+/).filter(Boolean);
  if (words.length === 0) return { action: "", mainPurpose: "", modifier: "" };

  // 1. Action = first word if it's an action card
  let action = "";
  let rest = [...words];
  if (ACTION_CARDS.includes(rest[0])) {
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
  const mainPurpose = purposeWords.join(" ").trim();
  return { action, mainPurpose, modifier };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { customPurpose, selectedAction } = body;

    if (!customPurpose || !customPurpose.trim()) {
      return Response.json({ matched: false });
    }

    // ── Parse phrase structure: [Action] + [Main Purpose] + [Modifier] ──
    const parsed = parsePurposePhrase(customPurpose);

    // ── STEP 1: Check dictionary using ONLY the Main Purpose ──
    // The Action Card and Modifier must NEVER be searched — only the
    // middle word(s) are the actual purpose. If no main purpose was
    // extracted (e.g., user typed only an action card), no lookup.
    if (!parsed.mainPurpose) {
      return Response.json({ matched: false });
    }
    const existingRes = await base44.functions.invoke('lookupPurposeIntent', {
      customPurpose: parsed.mainPurpose,
      selectedAction,
    });
    const existing = existingRes?.data || existingRes;
    if (existing && existing.matched) {
      // ── AUTO-BACKFILL missing translations ──
      // If the matched entry has empty malayalam_meaning or english_meaning,
      // generate the missing translation(s) via LLM and persist them to the
      // dictionary entry. This ensures every lookup returns complete bilingual
      // translations — no placeholders, no English fallback, no mixed-language UI.
      // The backfill runs ONCE per entry; subsequent lookups find the complete entry.
      const needsMl = !existing.malayalam_meaning || !existing.malayalam_meaning.trim();
      const needsEn = !existing.english_meaning || !existing.english_meaning.trim();
      if (needsMl || needsEn) {
        try {
          const backfill = await base44.integrations.Core.InvokeLLM({
            prompt: `You are an expert translator for Arabic occult manuscript terminology.
Translate this Arabic ritual purpose word into both Malayalam and English.

Arabic purpose: "${existing.matchedPhrase || parsed.mainPurpose}"

Instructions:
- malayalam_meaning: concise Malayalam translation of the PURPOSE word only (no action, no modifier)
- english_meaning: concise English translation of the PURPOSE word only

Return ONLY a JSON object.`,
            response_json_schema: {
              type: "object",
              properties: {
                malayalam_meaning: { type: "string", description: "Malayalam translation of the purpose" },
                english_meaning: { type: "string", description: "English translation of the purpose" },
              },
            },
          });
          const genMl = (backfill?.malayalam_meaning || "").trim();
          const genEn = (backfill?.english_meaning || "").trim();
          const finalMl = needsMl ? genMl : existing.malayalam_meaning;
          const finalEn = needsEn ? genEn : existing.english_meaning;
          if (finalMl || finalEn) {
            const entryId = existing._debug?.entryId;
            if (entryId) {
              const updates = {};
              if (needsMl && finalMl) updates.malayalam_meaning = finalMl;
              if (needsEn && finalEn) updates.english_meaning = finalEn;
              await base44.asServiceRole.entities.PurposeDictionary.update(entryId, updates);
            }
            return Response.json({ ...existing, malayalam_meaning: finalMl || existing.malayalam_meaning, english_meaning: finalEn || existing.english_meaning });
          }
        } catch (_e) {
          // Backfill failed — return entry as-is (existing behavior)
        }
      }
      return Response.json(existing);
    }

    // ── STEP 2: No match — generate CANDIDATE meanings via LLM ──
    // The LLM generates 2-5 possible meanings for the Arabic Main Purpose.
    // The user must confirm the intended meaning before it is used or saved.
    // No dictionary entry is saved until the user confirms (see
    // confirmPurposeMeaning function).
    const llmResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert in Arabic occult manuscripts and Islamic spirituality.

Analyze this Arabic MAIN PURPOSE word and generate 2-5 possible meanings.
This is the MAIN PURPOSE only — the Action (جلب/طرد/الصحة/السقم) and Modifier (طرفة العين) are handled separately.

Arabic Main Purpose: "${parsed.mainPurpose}"

Instructions:
1. Perform Arabic lexical analysis of the word (root, form, common usages).
2. Generate 2-5 candidate meanings, ordered by likelihood (most likely first).
3. Each candidate must include:
   - english_meaning: concise English translation of the MAIN PURPOSE only
   - malayalam_meaning: Malayalam translation of the MAIN PURPOSE only
   - normalized_purpose_key: one of "celb", "tard", "sihhat", "sekam", "tarfet", "rizq", "knowledge", "travel", "sultan", "haybah"
   - synonyms: array of 2-6 Arabic alternate spellings / root variants / common forms of this word (e.g. with/without ال, different hamza forms, singular/plural). These are saved so future lookups find any variant instantly without calling AI again.
   - confidence: integer 0-100 — how confident the AI is that this is the correct meaning (100 = certain, 50 = uncertain). First candidate should have the highest confidence.

Examples:
  "المال" → [Wealth (synonyms: [مال, الأموال, مالاً], confidence: 95), Money (synonyms: [نقود, دراهم], confidence: 70)]
  "المحبة" → [Love (synonyms: [محبة, مودة, وداد, حب], confidence: 95), Affection (synonyms: [عاطفة, ميل], confidence: 60)]

Return ONLY a JSON object.`,
      response_json_schema: {
        type: "object",
        properties: {
          candidates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                english_meaning: { type: "string", description: "English translation of the MAIN PURPOSE only" },
                malayalam_meaning: { type: "string", description: "Malayalam translation of the MAIN PURPOSE only" },
                normalized_purpose_key: { type: "string", description: "One of: celb, tard, sihhat, sekam, tarfet, rizq, knowledge, travel, sultan, haybah" },
                synonyms: {
                  type: "array",
                  items: { type: "string" },
                  description: "2-6 Arabic alternate spellings / root variants / common forms",
                },
                confidence: { type: "integer", description: "AI confidence score 0-100" },
              },
            },
            description: "2-5 candidate meanings, most likely first",
          },
        },
      },
    });

    const candidates = Array.isArray(llmResult?.candidates) ? llmResult.candidates : [];
    if (candidates.length === 0) {
      return Response.json({
        matched: false,
        needsConfirmation: false,
        _debug: { lookupPath: "ai_no_candidates", matchFound: false },
      });
    }

    // ── Return candidates for user confirmation (NO auto-save) ──
    return Response.json({
      matched: false,
      needsConfirmation: true,
      mainPurpose: parsed.mainPurpose,
      candidates: candidates.map((c, i) => ({
        english_meaning: (c.english_meaning || "").trim(),
        malayalam_meaning: (c.malayalam_meaning || "").trim(),
        normalized_purpose_key: c.normalized_purpose_key || "celb",
        synonyms: Array.isArray(c.synonyms)
          ? c.synonyms.map((s) => String(s || "").trim()).filter(Boolean)
          : [],
        confidence: typeof c.confidence === "number" ? Math.max(0, Math.min(100, Math.round(c.confidence))) : 50,
        rank: i + 1,
      })),
      _debug: {
        normalizedKey: parsed.mainPurpose,
        deepNormalizedKey: parsed.mainPurpose,
        matchFound: false,
        entryId: null,
        source: "AI Candidates (Needs Confirmation)",
        lookupPath: "ai_candidates",
        candidatesCount: candidates.length,
      },
    });
  } catch (error) {
    return Response.json({ matched: false, error: error.message }, { status: 500 });
  }
});