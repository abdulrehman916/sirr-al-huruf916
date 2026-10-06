import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// MIGRATE LEGACY ASTRO CLOCK KNOWLEDGE → EntityKnowledge
//
// Migrates the 57 orphaned legacy AstroClockKnowledge records
// (source_type: planetary_hour, weekday, day_period, night_period,
// sahath, special_timing) that are NOT displayed by the
// useAstroClockContextKnowledge hook (which only queries
// source_type=full_context).
//
// These records contain valuable manuscript knowledge (incense rules,
// fixed star warnings, timing principles, planet auspiciousness) that
// exists only in hidden database tables.
//
// This function:
//   1. Queries all non-full_context, non-marker AstroClockKnowledge records
//   2. Batches them to LLM for entity_type + entity_key classification
//   3. Creates EntityKnowledge records for each
//   4. Preserves original knowledge_id in the new record for traceability
//
// After migration, the knowledge is displayed in entity detail pages
// via EntityKnowledgePanel.
// ═══════════════════════════════════════════════════════════════

function normalizeText(text: string): string {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim();
}

async function computeHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    // ══ Step 1: Query all legacy (non-full_context, non-marker) records ══
    const allLegacy = await base44.asServiceRole.entities.AstroClockKnowledge.filter(
      { is_marker: false, source_type: { $ne: 'full_context' } },
      '-created_date', 100
    );

    // Filter out full_context records (the $ne might not work on all backends)
    const legacy = (allLegacy || []).filter((r: any) => r.source_type !== 'full_context');

    if (!legacy.length) {
      return Response.json({
        status: 'migration_complete', migrated: 0, message: 'No legacy records to migrate.'
      });
    }

    // ══ Step 2: Batch-classify legacy records into entity_type + entity_key ══
    // Process in batches of 15 to avoid LLM token limits
    const BATCH_SIZE = 15;
    let totalMigrated = 0;
    let totalCreated = 0;
    let totalMerged = 0;
    const allDetails: any[] = [];

    for (let batchStart = 0; batchStart < legacy.length; batchStart += BATCH_SIZE) {
      const batch = legacy.slice(batchStart, batchStart + BATCH_SIZE);

      const classifyPrompt = `You are classifying legacy astro clock knowledge records for entity-aware migration.

Each record contains manuscript knowledge text (English). Classify each into entity_type + entity_key.

RECORDS:
${batch.map((r: any, i: number) => `Record ${i + 1} (ID: ${r.knowledge_id}, Source Type: ${r.source_type}):
- Planet: ${r.planet || 'N/A'}
- Weekday: ${r.weekday !== undefined ? r.weekday : 'N/A'}
- Saat: ${r.saat_number || 'N/A'}
- Text: ${(r.knowledge_text_en || '').substring(0, 400)}`).join('\n\n')}

TASK: For each record, classify into entity_type + entity_key:

entity_type options:
- "planet" — about a specific planet (if planet field is set and text is about that planet)
- "zodiac" — about a specific zodiac sign
- "mansion" — about a specific lunar mansion
- "weekday" — about a specific day of the week (if weekday is set and text is about that day)
- "house" — about one of the 12 houses
- "element" — about fire/earth/air/water
- "ritual" — about a specific ritual
- "general_astro" — general astrological theory/principle

entity_key (lowercase):
- planet: sun/moon/mars/mercury/jupiter/venus/saturn (use the planet field if available)
- zodiac: aries/taurus/etc.
- mansion: 1-28
- weekday: 0-6 (use the weekday field if available)
- house: 1-12
- element: fire/earth/air/water
- ritual: short name
- general_astro: "general"

Also extract:
- knowledge_category: properties/traits/relationships/timing_rules/ritual_instructions/warnings/incense/health/general
- knowledge_text_en: use the original text (you may clean it up slightly but preserve all information)

RULES:
- If a record has planet=sun and text about Sun properties, classify as planet/sun.
- If a record has weekday=0 and text about Sunday, classify as weekday/0.
- If a record is about planetary hour incense rules in general, classify as general_astro/general.
- If a record is about fixed stars, classify as general_astro/general.
- Preserve all original knowledge in knowledge_text_en.

Return JSON:
{
  "classifications": [
    {
      "record_id": "...",
      "entity_type": "...",
      "entity_key": "...",
      "knowledge_category": "...",
      "knowledge_text_en": "..."
    }
  ]
}`;

      const classifyRes = await base44.integrations.Core.InvokeLLM({
        prompt: classifyPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            classifications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  record_id: { type: "string" },
                  entity_type: { type: "string", enum: ["planet", "zodiac", "mansion", "weekday", "house", "element", "ritual", "general_astro"] },
                  entity_key: { type: "string" },
                  knowledge_category: { type: "string" },
                  knowledge_text_en: { type: "string" }
                },
                required: ["record_id", "entity_type", "entity_key"]
              }
            }
          },
          required: ["classifications"]
        }
      });

      const classifyData: any = (classifyRes as any).data || classifyRes;
      const classifications: any[] = Array.isArray(classifyData.classifications) ? classifyData.classifications : [];

      // ══ Step 3: Create EntityKnowledge records for each classification ══
      for (const cls of classifications) {
        const originalRecord = batch.find((r: any) => r.knowledge_id === cls.record_id);
        if (!originalRecord) continue;

        const entityType = String(cls.entity_type || 'general_astro').toLowerCase();
        const entityKey = String(cls.entity_key || 'general').toLowerCase();
        const textEn = String(cls.knowledge_text_en || originalRecord.knowledge_text_en || '').trim();
        const category = String(cls.knowledge_category || 'general').toLowerCase();

        if (!textEn) continue;

        const canonicalKey = `${entityType}|${entityKey}|${category}`;
        const contentHash = await computeHash(`${entityType}|${entityKey}|${normalizeText(textEn).substring(0, 200)}`);
        const sourceObj = {
          book_title: originalRecord.source_book_title || 'Kashf al-Haqa\'iq (Legacy Migration)',
          page_number: originalRecord.source_page_number || '',
          entry_id: originalRecord.source_entry_id || '',
          screenshot_url: originalRecord.source_screenshot_url || ''
        };

        // Check by content_hash
        const existingByHash = await base44.asServiceRole.entities.EntityKnowledge.filter(
          { content_hash: contentHash, is_marker: false }, undefined, 1
        );

        if (existingByHash && existingByHash.length > 0) {
          const ex = existingByHash[0];
          const sources = [...(ex.supporting_sources || [])];
          const hasNewSource = !sources.some((s: any) =>
            s.book_title === sourceObj.book_title && s.page_number === sourceObj.page_number
          );
          if (hasNewSource) {
            sources.push(sourceObj);
            await base44.asServiceRole.entities.EntityKnowledge.update(ex.id, {
              supporting_sources: sources, source_count: (ex.source_count || 1) + 1
            });
          }
          totalMerged++;
          allDetails.push({ original_id: cls.record_id, entity_type: entityType, entity_key: entityKey, action: 'merged_exact' });
          continue;
        }

        // Check by canonical_key
        const existingByCanonical = await base44.asServiceRole.entities.EntityKnowledge.filter(
          { canonical_key: canonicalKey, is_marker: false }, undefined, 1
        );

        if (existingByCanonical && existingByCanonical.length > 0) {
          const ex = existingByCanonical[0];
          const normExisting = normalizeText(ex.knowledge_text_en || '');
          const normNew = normalizeText(textEn);
          let mergedText = ex.knowledge_text_en || '';
          if (!normExisting.includes(normNew)) {
            mergedText = mergedText ? mergedText + '\n---\n' + textEn : textEn;
          }
          const sources = [...(ex.supporting_sources || [])];
          const hasNewSource = !sources.some((s: any) =>
            s.book_title === sourceObj.book_title && s.page_number === sourceObj.page_number
          );
          if (hasNewSource) sources.push(sourceObj);
          await base44.asServiceRole.entities.EntityKnowledge.update(ex.id, {
            knowledge_text_en: mergedText, supporting_sources: sources,
            source_count: (ex.source_count || 1) + (hasNewSource ? 1 : 0)
          });
          totalMerged++;
          allDetails.push({ original_id: cls.record_id, entity_type: entityType, entity_key: entityKey, action: 'merged_complementary' });
        } else {
          const knowledgeId = `EK-MIG-${originalRecord.knowledge_id}`;
          await base44.asServiceRole.entities.EntityKnowledge.create({
            knowledge_id: knowledgeId, entity_type: entityType, entity_key: entityKey,
            knowledge_category: category, knowledge_text_en: textEn,
            knowledge_text_ml: originalRecord.knowledge_text_ml || '',
            knowledge_text_ar: originalRecord.knowledge_text_ar || '',
            structured_data: {}, content_hash: contentHash, canonical_key: canonicalKey,
            is_marker: false,
            source_book_id: originalRecord.source_book_id || '',
            source_book_title: originalRecord.source_book_title || 'Kashf al-Haqa\'iq (Legacy Migration)',
            source_page_number: originalRecord.source_page_number || '',
            source_entry_id: originalRecord.source_entry_id || '',
            source_screenshot_url: originalRecord.source_screenshot_url || '',
            is_verified: originalRecord.is_verified || false,
            supporting_sources: [], source_count: 1
          });
          totalCreated++;
          allDetails.push({ original_id: cls.record_id, entity_type: entityType, entity_key: entityKey, action: 'created' });
        }
        totalMigrated++;
      }
    }

    return Response.json({
      status: 'migration_complete',
      total_legacy_records: legacy.length,
      total_migrated: totalMigrated,
      records_created: totalCreated,
      records_merged: totalMerged,
      details: allDetails,
      message: `Migration complete: ${totalMigrated}/${legacy.length} legacy records migrated to EntityKnowledge. ${totalCreated} new records created, ${totalMerged} merged into existing. All knowledge is now visible in entity detail pages.`
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'migration_failed' }, { status: 500 });
  }
});