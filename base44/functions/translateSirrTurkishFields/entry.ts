import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// SIRR TURKISH TRANSLATION — GLOBAL LANGUAGE RULE
// ═══════════════════════════════════════════════════════════════
// Scans ManuscriptEntry content fields for Turkish text.
// Translates ALL Turkish content fields to BOTH English AND Malayalam.
//   - English: overwrites the original field (replacing Turkish)
//   - Malayalam: saves to _ml field (topic_ml, purpose_ml) OR
//     content_translations_ml JSON (for fields without _ml variants)
// Book titles, Arabic text, and harakat are NEVER touched.
// ═══════════════════════════════════════════════════════════════

const TURKISH_CHARS = /[çşğğıİöüÇŞĞĞ]/;

// Turkish function/content words. "ve" is included but does NOT trigger
// alone (it is Arabic/Persian "and" و, used in all Islamic transliterations).
const TURKISH_WORDS = [
  // Function words
  've','ile','bir','bu','şu','için','gibi','kadar','ancak','veya',
  'sonra','önce','değil','vardır','yoktur','olarak','üzere','rağmen',
  'dolayı','nedeniyle','tarafından','maksadıyla','gayesiyle','amacıyla',
  'cihetle','itibaren','bahisle','dair','edilir','yapılır','alınır',
  'yazılır','okunur','söylenir','denenmiştir','bildirilmiştir',
  'belirtilmiştir','anlatılmıştır','açıklanmıştır','nakledilmiştir',
  'rivayet','methal','beyan',
  // Common verbs / postpositions (manuscript instruction language)
  'eder','olur','yapar','gelir','verir','alır','koyar','yazar','okur',
  'söyler','yakar','yakarsın','yazıp','okuyup','yakıp','konur','gerekir',
  'üzerine','içine','altına','üstüne','şekilde','biçimde','halde','lazım'
];

// Word boundary that treats Turkish letters as word characters.
// JavaScript's \b only works with ASCII [a-zA-Z0-9_], so "önce" and
// "üzere" (starting with non-ASCII) are never matched by \bönce\b.
// This custom boundary fixes that.
const WORD_CHARS = 'a-z0-9_ığüşçöıİĞÜŞÇÖ';

function hasTurkish(text: any): boolean {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (t.length === 0) return false;

  const lower = t.toLowerCase();

  let matchCount = 0;
  let hasNonVe = false;
  for (const w of TURKISH_WORDS) {
    const regex = new RegExp(`(?:^|[^${WORD_CHARS}])${w}(?:[^${WORD_CHARS}]|$)`, 'gi');
    if (regex.test(lower)) {
      matchCount++;
      if (w !== 've') hasNonVe = true;
    }
  }

  // Any non-"ve" Turkish word = Turkish
  if (hasNonVe) return true;
  // 2+ Turkish words = Turkish
  if (matchCount >= 2) return true;
  // "ve" alone = Arabic "and", NOT Turkish
  return false;
}

// Content fields to check and translate
const CONTENT_FIELDS = [
  'topic', 'purpose', 'introduction', 'conditions', 'materials',
  'preparation', 'procedure', 'timing', 'planet', 'day', 'incense',
  'repetition', 'warnings', 'benefits', 'notes'
];

// Fields that have dedicated _ml variants in the entity schema
const FIELDS_WITH_ML_VARIANT = new Set(['topic', 'purpose']);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const batchSize = Math.min(body.batch_size || 5, 8);

    // Fetch all entries
    const allEntries = await base44.asServiceRole.entities.ManuscriptEntry.list('-created_date', 500);

    // Find entries with Turkish in content fields
    const entriesWithTurkish = allEntries.filter((e: any) =>
      CONTENT_FIELDS.some((f: string) => hasTurkish(e[f]))
    );

    const totalTurkishFields = entriesWithTurkish.reduce((count: number, e: any) =>
      count + CONTENT_FIELDS.filter((f: string) => hasTurkish(e[f])).length, 0
    );

    // Take the next batch
    const batch = entriesWithTurkish.slice(0, batchSize);

    if (batch.length === 0) {
      return Response.json({
        status: 'complete',
        total_entries: allEntries.length,
        total_with_turkish: 0,
        total_turkish_fields: 0,
        remaining: 0,
        has_more: false,
        audit: {
          entries_scanned: allEntries.length,
          turkish_fields_corrected: 0,
          remaining_turkish: 0
        }
      });
    }

    // Collect all Turkish fields to translate
    const fieldsToTranslate: any[] = [];

    batch.forEach((entry: any) => {
      CONTENT_FIELDS.forEach((field: string) => {
        if (hasTurkish(entry[field])) {
          fieldsToTranslate.push({
            id: `${entry.entry_id}__${field}`,
            text: entry[field]
          });
        }
      });
    });

    // Build LLM prompt for batch translation
    const itemsJson = JSON.stringify(fieldsToTranslate);

    const prompt = `You are a professional translator for an Islamic occult manuscript encyclopedia (Sirr al-Huruf).

GLOBAL MEANING PRESERVATION RULE — SIRR PAGE (FINAL — PERMANENT):
Meaning preservation is ALWAYS more important than removing Turkish.
Never sacrifice accuracy for translation.
This rule is GLOBAL and PERMANENT for the entire SIRR application.

For each Turkish text below, follow these rules STRICTLY:

1. NEVER guess. Never invent meanings. Never approximate. Never hallucinate translations.

2. RESEARCH the exact meaning using authoritative sources in this PRIORITY ORDER:
   Priority 1: Official Turkish dictionaries (TDK or equivalent authoritative Turkish lexical references).
   Priority 2: Botanical, scientific, pharmacological, zoological, mineralogical, and incense reference databases (for plants, herbs, resins, incense, animals, minerals, natural materials).
   Priority 3: Classical Islamic manuscript references, Ottoman references, Arabic manuscript terminology, and historical manuscript sources (for manuscript-specific terms).
   Priority 4: Standard English scholarly equivalent.
   Priority 5: Standard Malayalam equivalent.

3. CONFIDENCE POLICY:
   - "high": Verified by authoritative sources (Priority 1-3).
   - "medium": Multiple reliable sources agree (Priority 4-5).
   - "low": Source conflict or uncertainty. LOW confidence items MUST remain unchanged.

4. If confidence is "high" or "medium":
   - If exact English meaning is verified: use the verified English meaning. Create a natural Malayalam translation from that verified English meaning.
   - If a standard Malayalam name officially exists: use the official Malayalam name. Do NOT create a literal translation.
   - If Malayalam does NOT have an official word but English does: keep the verified English technical name and add a natural Malayalam explanation based on the English meaning.
   - Arabic phrases or names within the Turkish text must remain in Arabic script in both translations.
   - Numbers, measurements, and proper names should be preserved.

5. SCIENTIFIC TERMS (plants, herbs, medicines, incense, minerals, animals, ritual materials, rare manuscript terminology):
   - Research until an exact identification is found.
   - If an official Malayalam equivalent exists: use it.
   - Otherwise: keep the verified English scientific/common name and provide a Malayalam explanation.

6. If confidence is "low":
   - DO NOT translate. DO NOT remove the Turkish word.
   - Return the ORIGINAL text unchanged.
   - Set english and malayalam to empty strings.
   - Mark as "Meaning Not Verified".

7. PRESERVE EXACTLY AS ORIGINAL (NEVER translate or modify):
   Book titles, author names, manuscript names, proper nouns, Arabic text, Quranic text, talismans, harakat, Abjad letters, magic squares, Vefk diagrams, Arabic transliterations, historical references.

8. TRANSLATION QUALITY:
   - Malayalam must be natural Malayalam. Never mix Turkish into Malayalam.
   - English must be natural English. Never mix Turkish into English.
   - Arabic must remain authentic Arabic.

9. FINAL SAFETY RULE: If ANY doubt exists about the meaning, KEEP THE ORIGINAL TURKISH. Never replace a Turkish word with an uncertain translation. Accuracy is ALWAYS more important than language cleanup.

Return a JSON object with a "translations" array. Each item must have:
  - id: the original id string
  - english: the English translation (empty string if confidence is "low")
  - malayalam: the Malayalam translation (empty string if confidence is "low")
  - confidence: "high" | "medium" | "low"
  - meaning_identified: brief description of the identified meaning (or "Meaning Not Verified" if low)

Items to process:
${itemsJson}`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          translations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                english: { type: 'string' },
                malayalam: { type: 'string' },
                confidence: { type: 'string' },
                meaning_identified: { type: 'string' }
              }
            }
          }
        }
      }
    });

    // Build translation lookup — includes confidence per GLOBAL MEANING PRESERVATION RULE
    const translations: any = {};
    const transArray = (llmResponse as any)?.translations || [];
    if (Array.isArray(transArray)) {
      for (const t of transArray) {
        if (t.id) {
          translations[t.id] = {
            english: t.english || '',
            malayalam: t.malayalam || '',
            confidence: t.confidence || 'low',
            meaning_identified: t.meaning_identified || 'unverified'
          };
        }
      }
    }

    // Apply translations to entries
    const audit: any[] = [];
    let totalCorrected = 0;
    const updates: any[] = [];

    for (const entry of batch) {
      const updateData: any = {};
      const entryAudit: any = { entry_id: entry.entry_id, topic: entry.topic, fields_translated: [] };

      // Preserve existing content_translations_ml
      const existingTranslationsMl = entry.content_translations_ml || {};
      updateData.content_translations_ml = { ...existingTranslationsMl };

      let hasUpdates = false;

      for (const field of CONTENT_FIELDS) {
        if (hasTurkish(entry[field])) {
          const translationId = `${entry.entry_id}__${field}`;
          const translation = translations[translationId];

          // GLOBAL MEANING PRESERVATION RULE:
          // Only apply translation if confidence is "high" or "medium".
          // If confidence is "low", KEEP the original Turkish text unchanged.
          if (translation && translation.english && translation.malayalam && translation.confidence !== 'low') {
            // Save English to original field (overwrites Turkish)
            updateData[field] = translation.english;

            // Save Malayalam
            if (FIELDS_WITH_ML_VARIANT.has(field)) {
              updateData[`${field}_ml`] = translation.malayalam;
            } else {
              updateData.content_translations_ml[field] = translation.malayalam;
            }

            entryAudit.fields_translated.push(`${field}→EN+ML (${translation.confidence})`);
            totalCorrected++;
            hasUpdates = true;
          } else if (translation && translation.confidence === 'low') {
            // MEANING UNVERIFIED — keep original Turkish text unchanged
            entryAudit.fields_translated.push(`${field}→KEPT_UNVERIFIED (${translation.meaning_identified})`);
          } else {
            entryAudit.fields_translated.push(`${field}→SKIPPED`);
          }
        }
      }

      if (hasUpdates) {
        updates.push({ id: entry.id, ...updateData });
        audit.push(entryAudit);
      }
    }

    // Bulk update
    if (updates.length > 0) {
      await base44.asServiceRole.entities.ManuscriptEntry.bulkUpdate(updates);
    }

    // Count remaining
    const remaining = Math.max(0, entriesWithTurkish.length - batch.length);

    return Response.json({
      status: remaining > 0 ? 'batch_complete' : 'complete',
      total_entries: allEntries.length,
      total_with_turkish: entriesWithTurkish.length,
      total_turkish_fields: totalTurkishFields,
      entries_in_batch: batch.length,
      entries_translated: audit.length,
      fields_corrected: totalCorrected,
      remaining: remaining,
      has_more: remaining > 0,
      audit: audit
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});