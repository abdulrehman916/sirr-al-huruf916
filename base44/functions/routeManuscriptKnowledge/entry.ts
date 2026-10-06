import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// UNIVERSAL KNOWLEDGE ROUTING — CANONICAL SYSTEM ORCHESTRATOR
//
// GLOBAL ARCHITECTURE RULE:
// Every verified manuscript entry is automatically classified by
// its PRIMARY PURPOSE and routed to exactly ONE canonical module
// knowledge store:
//
//   astro_timing      → AstroClockKnowledge (via enrichAstroClockFromManuscript)
//   planet_info..general_astro → AstroClockKnowledge (via enrichAstroClockCategorizedFromManuscript)
//   dua               → DuaKnowledge         (via enrichDuaFromManuscript)
//   ritual            → RitualKnowledge      (via enrichRitualFromManuscript)
//   wafq              → WafqKnowledge        (via enrichWafqFromManuscript)
//   other             → none (materials, herbs, notes — not routed)
//
// ALL astrology knowledge (timing + entity properties) now flows into the
// single permanent AstroClockKnowledge store. EntityKnowledge is no longer
// written to by the astrology ingestion pipeline.
//
// CANONICAL STORAGE RULE:
// - ONE canonical location per knowledge piece.
// - Never duplicate complete records across modules.
// - Modules may create lightweight references (timing_reference field).
// - Duplicate protection: search existing, merge sources, never overwrite.
//
// This function is called automatically by the SirrAnalyzeModal
// pipeline after verification + duplicate detection complete.
// Batch-processed — caller re-invokes until all entries routed.
// ═══════════════════════════════════════════════════════════════

// Entry type → primary purpose routing map
const ENTRY_TYPE_TO_ROUTE: Record<string, string> = {
  // Astro Clock — timing-related ONLY
  timing: 'astro_timing',
  // Dua module
  dua: 'dua',
  quran_verse: 'dua',
  divine_name: 'dua',
  // Ritual module — conditions, warnings, instructions are most often ritual-related.
  // Timing-related conditions/warnings are captured by the Ritual LLM as timing_reference
  // (a lightweight cross-module reference to Astro Clock), so nothing is lost.
  ritual: 'ritual',
  exorcism: 'ritual',
  protection: 'ritual',
  instruction: 'ritual',
  condition: 'ritual',
  warning: 'ritual',
  // Wafq module — images in these manuscripts are almost always wafq/taweez/diagrams
  wafq: 'wafq',
  taweez: 'wafq',
  diagram: 'wafq',
  table: 'wafq',
  image: 'wafq',
  // Other — not routed to a specific module
  material: 'other',
  herb: 'other',
  incense: 'other',
  note: 'other',
  reference: 'other',
};

const ROUTE_TO_ENTITY: Record<string, string> = {
  astro_timing: 'AstroClockKnowledge',
  dua: 'DuaKnowledge',
  ritual: 'RitualKnowledge',
  wafq: 'WafqKnowledge',
  // ALL astrology entity knowledge → AstroClockKnowledge (single permanent store)
  planet_info: 'AstroClockKnowledge',
  zodiac_info: 'AstroClockKnowledge',
  mansion_info: 'AstroClockKnowledge',
  element_info: 'AstroClockKnowledge',
  house_info: 'AstroClockKnowledge',
  weekday_info: 'AstroClockKnowledge',
  general_astro: 'AstroClockKnowledge',
  other: 'none',
};

const ROUTE_TO_FUNCTION: Record<string, string> = {
  astro_timing: 'enrichAstroClockFromManuscript',
  dua: 'enrichDuaFromManuscript',
  ritual: 'enrichRitualFromManuscript',
  wafq: 'enrichWafqFromManuscript',
  // Astrology entity knowledge → categorized records in AstroClockKnowledge
  planet_info: 'enrichAstroClockCategorizedFromManuscript',
  zodiac_info: 'enrichAstroClockCategorizedFromManuscript',
  mansion_info: 'enrichAstroClockCategorizedFromManuscript',
  element_info: 'enrichAstroClockCategorizedFromManuscript',
  house_info: 'enrichAstroClockCategorizedFromManuscript',
  weekday_info: 'enrichAstroClockCategorizedFromManuscript',
  general_astro: 'enrichAstroClockCategorizedFromManuscript',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { book_id, batch_size } = body;
    if (!book_id) return Response.json({ error: 'book_id is required' }, { status: 400 });

    const BATCH = Math.min(batch_size || 5, 8);
    const books = await base44.asServiceRole.entities.ManuscriptBook.filter({ book_id });
    if (!books?.length) return Response.json({ error: 'Book not found' }, { status: 404 });
    const book = books[0];

    const entries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id }, '-created_date', 500);
    if (!entries?.length) return Response.json({ error: 'No entries found' }, { status: 404 });

    // Only verified or manual_review entries
    const verified = entries.filter((e: any) =>
      e.verification_status === 'verified' || e.verification_status === 'manual_review'
    );

    if (!verified.length) {
      return Response.json({
        status: 'routing_complete', book_id, book_title: book.book_title,
        total_entries: entries.length, verified_entries: 0, total_routed: 0,
        by_route: {}, message: 'No verified entries to route.'
      });
    }

    // Get existing routing records to skip already-routed entries
    const existingRoutes = await base44.asServiceRole.entities.KnowledgeRouting.filter({ book_id });
    const routedEntryIds = new Set(existingRoutes.map((r: any) => r.entry_id));
    const unrouted = verified.filter((e: any) => !routedEntryIds.has(e.entry_id));

    if (!unrouted.length) {
      // All routed — summarize
      const byRoute: Record<string, number> = {};
      for (const r of existingRoutes) {
        byRoute[r.primary_purpose] = (byRoute[r.primary_purpose] || 0) + 1;
      }
      return Response.json({
        status: 'routing_complete', book_id, book_title: book.book_title,
        total_entries: entries.length, verified_entries: verified.length,
        total_routed: existingRoutes.length, by_route: byRoute,
        message: `Knowledge routing complete. ${existingRoutes.length} entries routed.`
      });
    }

    // Take a batch
    const batch = unrouted.slice(0, BATCH);

    // Classify each entry by PRIMARY PURPOSE using LLM content analysis.
    // Falls back to entry_type-based routing if LLM classification fails.
    // This fixes Bug #10: type-based routing misroutes entries whose content
    // doesn't match their entry_type (e.g., a dua stored as 'instruction').
    const entryRouteMap: Record<string, string> = {};
    let classificationMethod = 'llm_content';

    try {
      const classifyPrompt = `You are classifying Islamic occult manuscript entries by their PRIMARY PURPOSE.

ENTRIES:
${batch.map((e: any, i: number) => `Entry ${i + 1} (ID: ${e.entry_id}, Type: ${e.entry_type}):
- Purpose: ${(e.purpose || 'N/A').substring(0, 150)}
- Topic: ${(e.topic || 'N/A').substring(0, 100)}
- Arabic: ${(e.arabic_text || '').substring(0, 200)}
- English: ${(e.english_meaning || '').substring(0, 200)}
- Procedure: ${(e.procedure || '').substring(0, 200)}
- Materials: ${(e.materials || '').substring(0, 100)}
- Timing: ${(e.timing || 'N/A').substring(0, 100)}`).join('\n\n')}

TASK: For each entry, determine its PRIMARY PURPOSE — what is the entry MOSTLY about?
- "astro_timing" — PRIMARILY about timing/planetary hours/when to perform
- "dua" — PRIMARILY a supplication/invocation/dhikr/quran verse/divine name
- "ritual" — PRIMARILY an amal/procedure/exorcism/protection method with steps
- "wafq" — PRIMARILY a magic square/letter diagram/taweez/numeric grid
- "planet_info" — PRIMARILY about a specific planet's properties/traits/nature/relationships
- "zodiac_info" — PRIMARILY about a specific zodiac sign's properties/rulership/health
- "mansion_info" — PRIMARILY about a specific lunar mansion (1-28)
- "element_info" — PRIMARILY about fire/earth/air/water elements
- "house_info" — PRIMARILY about one of the 12 astrological houses
- "weekday_info" — PRIMARILY about a specific weekday's properties
- "general_astro" — PRIMARILY general astrological theory not specific to one entity
- "other" — PRIMARILY about materials/herbs/incense/notes

RULES:
- A dua that mentions timing → "dua" (the dua is primary)
- A ritual with a wafq → classify by what is primary
- A timing rule → "astro_timing"
- When in doubt: "ritual" for procedures, "dua" for recitations

Return JSON: { "classifications": [{ "entry_id": "...", "primary_purpose": "astro_timing"|"dua"|"ritual"|"wafq"|"other" }] }`;

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
                  entry_id: { type: "string" },
                  primary_purpose: { type: "string", enum: ["astro_timing", "dua", "ritual", "wafq", "planet_info", "zodiac_info", "mansion_info", "element_info", "house_info", "weekday_info", "general_astro", "other"] }
                },
                required: ["entry_id", "primary_purpose"]
              }
            }
          },
          required: ["classifications"]
        }
      });

      const classifyData: any = (classifyRes as any).data || classifyRes;
      const classifications: any[] = Array.isArray(classifyData.classifications) ? classifyData.classifications : [];
      for (const c of classifications) {
        if (c.entry_id && c.primary_purpose) {
          entryRouteMap[c.entry_id] = c.primary_purpose;
        }
      }
    } catch {
      classificationMethod = 'type_fallback';
    }

    // Fill missing entries with type-based fallback
    for (const entry of batch) {
      if (!entryRouteMap[entry.entry_id]) {
        entryRouteMap[entry.entry_id] = ENTRY_TYPE_TO_ROUTE[entry.entry_type] || 'other';
      }
    }

    // Build route groups from classification
    const routeGroups: Record<string, string[]> = {};
    for (const entry of batch) {
      const route = entryRouteMap[entry.entry_id];
      if (!routeGroups[route]) routeGroups[route] = [];
      routeGroups[route].push(entry.entry_id);
    }

    // Call enrichment functions in PARALLEL to prevent Deno timeout
    // (sequential calls for 4 route groups × ~30s each = ~120s → timeout)
    const routingResults: Record<string, any> = {};
    const now = new Date().toISOString();

    const routePromises = Object.entries(routeGroups).map(async ([route, entryIds]: [string, string[]]) => {
      if (route === 'other' || !ROUTE_TO_FUNCTION[route]) {
        return [route, { status: 'skipped', entry_count: entryIds.length }];
      }
      try {
        const fnName = ROUTE_TO_FUNCTION[route];
        const fnRes = await base44.functions.invoke(fnName, {
          book_id,
          batch_size: BATCH,
          entry_ids: entryIds,
        });
        return [route, (fnRes as any).data || fnRes];
      } catch (err) {
        return [route, { status: 'error', error: err.message, entry_count: entryIds.length }];
      }
    });

    const routeResults = await Promise.all(routePromises);
    for (const [route, result] of routeResults) {
      routingResults[route] = result;
    }

    // Create KnowledgeRouting records — SKIP entries where enrichment FAILED
    // so they can be retried on the next call instead of being permanently orphaned
    let routedCount = 0;
    let skippedForRetry = 0;
    for (const entry of batch) {
      const route = entryRouteMap[entry.entry_id];
      const routedTo = ROUTE_TO_ENTITY[route] || 'none';

      // RETRY SAFETY: If enrichment failed for this route group, skip this entry.
      // It will be retried on the next routeManuscriptKnowledge call.
      const routeResult = routingResults[route];
      if (routedTo !== 'none' && routeResult?.status === 'error') {
        skippedForRetry++;
        continue;
      }

      let knowledgeIds: string[] = [];
      let isMarker = false;

      if (routedTo !== 'none') {
        try {
          const kRecords = await base44.asServiceRole.entities[routedTo].filter({ source_entry_id: entry.entry_id });
          if (kRecords?.length > 0) {
            knowledgeIds = kRecords.filter((k: any) => !k.is_marker).map((k: any) => k.knowledge_id);
            isMarker = knowledgeIds.length === 0 && kRecords.some((k: any) => k.is_marker);
          }
        } catch { /* non-critical */ }
      }

      const routingId = `KR-${entry.entry_id}`;
      await base44.asServiceRole.entities.KnowledgeRouting.create({
        routing_id: routingId,
        entry_id: entry.entry_id,
        book_id,
        primary_purpose: route,
        routed_to: routedTo,
        knowledge_ids: knowledgeIds,
        is_marker: isMarker,
        routed_at: now,
      });
      routedCount++;
    }

    const remaining = unrouted.length - batch.length;

    if (remaining > 0) {
      return Response.json({
        status: 'batch_complete', book_id, book_title: book.book_title,
        batch_processed: batch.length, remaining, entries_routed: routedCount,
        skipped_for_retry: skippedForRetry,
        route_groups: Object.fromEntries(Object.entries(routeGroups).map(([k, v]) => [k, v.length])),
        routing_results: routingResults,
        message: `Batch: ${routedCount} entries routed${skippedForRetry > 0 ? `, ${skippedForRetry} skipped for retry` : ''}. ${remaining} remaining.`,
      });
    }

    // Final report — all entries routed
    const allRoutes = await base44.asServiceRole.entities.KnowledgeRouting.filter({ book_id });
    const byRoute: Record<string, number> = {};
    for (const r of allRoutes) {
      byRoute[r.primary_purpose] = (byRoute[r.primary_purpose] || 0) + 1;
    }

    return Response.json({
      status: 'routing_complete', book_id, book_title: book.book_title,
      total_entries: entries.length, verified_entries: verified.length,
      total_routed: allRoutes.length, by_route: byRoute,
      routing_results: routingResults,
      message: `Knowledge routing complete. ${allRoutes.length} entries routed across ${Object.keys(byRoute).length} modules.`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'routing_failed' }, { status: 500 });
  }
});