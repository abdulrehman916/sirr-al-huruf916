import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK AUTO-ENRICHMENT — Extracts timing knowledge from
// verified manuscript entries and merges it into AstroClockKnowledge.
//
// GLOBAL RULE:
// 1. Only process verified entries (verification_status='verified'
//    or 'manual_review').
// 2. Extract ONLY timing-related knowledge — not complete records.
// 3. Never overwrite verified knowledge — only add new pieces or
//    merge sources via supporting_sources.
// 4. Duplicate detection by content_hash — same knowledge from
//    different sources is merged, not duplicated.
// 5. Marker records (is_marker=true) prevent reprocessing entries
//    that contained no timing knowledge.
// 6. Batch processing — caller re-invokes until all entries processed.
// 7. NEVER use labels: Avoid, Do Not Do, Forbidden. Use: Suitable,
//    Less Suitable, Caution, Warning.
// ═══════════════════════════════════════════════════════════════

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
    .trim();
}

async function computeHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { book_id, batch_size, entry_ids } = body;

    if (!book_id) {
      return Response.json({ error: 'book_id is required' }, { status: 400 });
    }

    const BATCH_SIZE = Math.min(batch_size || 5, 8);

    // ══ 1. Fetch ManuscriptBook ══
    const books = await base44.asServiceRole.entities.ManuscriptBook.filter({ book_id });
    if (!books || books.length === 0) {
      return Response.json({ error: 'Book not found: ' + book_id }, { status: 404 });
    }
    const book = books[0];

    // ══ 2. Fetch all entries for this book ══
    const entries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id });
    if (!entries || entries.length === 0) {
      return Response.json({ error: 'No entries found for book: ' + book_id }, { status: 404 });
    }

    // ══ 3. Only process verified or manual_review entries ══
    const verifiedEntries = entries.filter((e: any) => {
      const isVerified = e.verification_status === 'verified' || e.verification_status === 'manual_review';
      if (!isVerified) return false;
      if (entry_ids && Array.isArray(entry_ids) && entry_ids.length > 0) {
        return entry_ids.includes(e.entry_id);
      }
      return true;
    });

    if (verifiedEntries.length === 0) {
      return Response.json({
        status: 'enrichment_complete',
        book_id,
        book_title: book.book_title,
        total_entries: entries.length,
        verified_entries: 0,
        timing_pieces_extracted: 0,
        message: 'No verified entries to enrich.',
      });
    }

    // ══ 4. Fetch existing AstroClockKnowledge to find processed entries ══
    const existingKnowledge = await base44.asServiceRole.entities.AstroClockKnowledge.filter({ source_book_id: book_id });
    const processedEntryIds = new Set(existingKnowledge.map((k: any) => k.source_entry_id));

    // ══ 5. Filter out already-processed entries ══
    const unprocessedEntries = verifiedEntries.filter((e: any) => !processedEntryIds.has(e.entry_id));

    if (unprocessedEntries.length === 0) {
      const realKnowledge = existingKnowledge.filter((k: any) => !k.is_marker && k.knowledge_text_en && k.knowledge_text_en.length > 0);
      const byType: Record<string, number> = {};
      for (const k of realKnowledge) {
        byType[k.source_type] = (byType[k.source_type] || 0) + 1;
      }
      return Response.json({
        status: 'enrichment_complete',
        book_id,
        book_title: book.book_title,
        total_entries: entries.length,
        verified_entries: verifiedEntries.length,
        entries_analyzed: processedEntryIds.size,
        timing_pieces_extracted: realKnowledge.length,
        by_type: byType,
        message: `Astro Clock enrichment complete. ${realKnowledge.length} timing pieces extracted.`,
      });
    }

    // ══ 6. Take a batch ══
    const batch = unprocessedEntries.slice(0, BATCH_SIZE);

    // ══ 7. Build LLM prompt for timing knowledge extraction ══
    const entrySummaries = batch.map((e: any, i: number) => {
      return `Entry ${i + 1}:
- Entry ID: ${e.entry_id}
- Page: ${e.page_number || 'N/A'}
- Topic: ${e.topic || e.purpose || 'N/A'}
- Purpose: ${e.purpose || 'N/A'}
- Entry type: ${e.entry_type || 'N/A'}
- Day: ${e.day || 'N/A'}
- Planet: ${e.planet || 'N/A'}
- Timing: ${e.timing || 'N/A'}
- Arabic text: ${(e.arabic_text || '').substring(0, 500)}
- English meaning: ${(e.english_meaning || '').substring(0, 500)}
- Malayalam meaning: ${(e.malayalam_meaning || '').substring(0, 500)}
- Conditions: ${(e.conditions || '').substring(0, 300)}
- Warnings: ${(e.warnings || '').substring(0, 300)}
- Notes: ${(e.notes || '').substring(0, 300)}`;
    }).join('\n\n---\n\n');

    const prompt = `You are analyzing verified manuscript entries from an Islamic occult text for TIMING-RELATED knowledge only.

MANUSCRIPT: ${book.book_title}

ENTRIES TO ANALYZE:
${entrySummaries}

TASK:
For each entry, determine if it contains TIME-RELATED knowledge. Time-related knowledge includes:
- Day or weekday references (Sunday, Monday, Thursday night, etc.)
- Sahath (planetary hour) references (Saat 1, Saat 8, etc.)
- Planetary hour references (hour of Sun, hour of Mars, etc.)
- Sunrise/sunset references
- Kawkab (ruling planet) references
- Suitable time / less suitable time recommendations
- Timing conditions or prerequisites
- Timing warnings
- Special timing rules

If an entry contains timing knowledge, extract ONLY the timing-related intelligence as separate pieces. Do NOT copy complete records — extract only the timing information.

For each extracted piece, classify it:
- source_type: "weekday" (specific weekday), "day_period" (daytime general), "night_period" (nighttime general), "sahath" (specific Sahath number), "planetary_hour" (specific planet's hour)
- weekday: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday (only if applicable, else null)
- period: "day" or "night" (only if applicable, else null)
- sahath_number: 1-12 (only if source_type is sahath, else null)
- planet: "sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn" (only if applicable, else null)
- knowledge_category: one of "recommendation", "rule", "warning", "condition", "timing_rule", "suitable_time", "unsuitable_time", "special_timing"
- knowledge_text_en: concise English text of the timing knowledge
- knowledge_text_ml: Malayalam translation if available, else empty string
- knowledge_text_ar: original Arabic if the timing text is in Arabic, else empty string
- source_entry_id: the entry ID this piece was extracted from

RULES:
1. Never invent knowledge. Only extract what is explicitly stated.
2. If an entry has NO timing knowledge, do not include any pieces for it.
3. Keep each piece concise — extract the timing intelligence, not the full ritual/dua.
4. If an entry contains both timing knowledge AND other content (duas, wafq, rituals), extract ONLY the timing knowledge.
5. Classify carefully — "Thursday night" → weekday=4, period="night". "Saat 8" → source_type="sahath", sahath_number=8.
6. NEVER use labels: Avoid, Do Not Do, Forbidden, Bad Time. Use: Suitable, Less Suitable, Caution, Warning.

Return a JSON object with this exact schema:
{
  "entries_analyzed": <number>,
  "timing_pieces": [
    {
      "source_entry_id": "...",
      "source_type": "weekday" | "day_period" | "night_period" | "sahath" | "planetary_hour",
      "weekday": null or 0-6,
      "period": null or "day" or "night",
      "sahath_number": null or 1-12,
      "planet": null or "sun"/"moon"/"mars"/"mercury"/"jupiter"/"venus"/"saturn",
      "knowledge_category": "recommendation" | "rule" | "warning" | "condition" | "timing_rule" | "suitable_time" | "unsuitable_time" | "special_timing",
      "knowledge_text_en": "...",
      "knowledge_text_ml": "...",
      "knowledge_text_ar": "..."
    }
  ]
}`;

    // ══ 8. Call InvokeLLM with JSON schema ══
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          entries_analyzed: { type: "number" },
          timing_pieces: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source_entry_id: { type: "string" },
                source_type: { type: "string" },
                weekday: { type: "number" },
                period: { type: "string" },
                sahath_number: { type: "number" },
                planet: { type: "string" },
                knowledge_category: { type: "string" },
                knowledge_text_en: { type: "string" },
                knowledge_text_ml: { type: "string" },
                knowledge_text_ar: { type: "string" }
              },
              required: ["source_entry_id", "source_type", "knowledge_category", "knowledge_text_en"]
            }
          }
        },
        required: ["entries_analyzed", "timing_pieces"]
      }
    });

    const result: any = llmResponse.data || llmResponse;
    const timingPieces: any[] = Array.isArray(result.timing_pieces) ? result.timing_pieces : [];

    // ══ 9. Process each extracted piece ══
    let newRecordsCreated = 0;
    let sourcesAdded = 0;
    let duplicatesSkipped = 0;
    let canonicalMerged = 0;
    let conflictsDetected = 0;
    let contextSpecificAdded = 0;
    const entriesWithTimingSet = new Set<string>();

    for (const piece of timingPieces) {
      if (!piece.knowledge_text_en || String(piece.knowledge_text_en).trim().length === 0) continue;
      if (!piece.source_entry_id) continue;

      const textEn = String(piece.knowledge_text_en).trim();
      const normalized = normalizeText(textEn);
      const contentHash = await computeHash(normalized);

      // Check if this knowledge already exists (by content_hash)
      const existing = await base44.asServiceRole.entities.AstroClockKnowledge.filter({ content_hash: contentHash }, undefined, 1);
      const sourceEntry = batch.find((e: any) => e.entry_id === piece.source_entry_id);
      const isVerified = sourceEntry?.verification_status === 'verified';

      if (existing && existing.length > 0) {
        // Knowledge exists — add source, NEVER overwrite text
        const existingRecord = existing[0];
        const existingSources = existingRecord.supporting_sources || [];
        const alreadyHasSource = existingSources.some((s: any) => s.entry_id === piece.source_entry_id) ||
                                  existingRecord.source_entry_id === piece.source_entry_id;

        if (!alreadyHasSource) {
          await base44.asServiceRole.entities.AstroClockKnowledge.update(existingRecord.id, {
            supporting_sources: [...existingSources, {
              book_title: book.book_title,
              page_number: sourceEntry?.page_number || '',
              entry_id: piece.source_entry_id
            }],
            source_count: (existingRecord.source_count || 1) + 1
          });
          sourcesAdded++;
        } else {
          duplicatesSkipped++;
        }
      } else {
        // CANONICAL KEY CHECK — field-level knowledge evolution
        const canonicalKey = `${piece.source_type || 'planetary_hour'}|${piece.weekday ?? ''}|${piece.period ?? ''}|${piece.sahath_number ?? ''}|${piece.planet ?? ''}`;
        const canonicalMatches = await base44.asServiceRole.entities.AstroClockKnowledge.filter({ canonical_key: canonicalKey, is_marker: false }, undefined, 1);

        if (canonicalMatches?.length > 0) {
          const ex = canonicalMatches[0];
          // ══ CONFLICT RESOLUTION: Classify before merging ══
          const classifyRes = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a KNOWLEDGE CONFLICT RESOLVER for Islamic occult manuscript timing knowledge.

CLASSIFICATION TYPES:
1. COMPLEMENTARY — New information that adds to the existing record without contradicting it.
   → Merge into resolved text. Return merged_text_en.
2. EQUIVALENT — Same meaning expressed differently.
   → Merge into resolved text as one normalized statement. Return merged_text_en.
3. CONTEXT_SPECIFIC — Valid only under certain conditions (weekday, Sahath, planet, season, intention, method).
   → Store under matching condition. Do NOT affect other conditions. Return context_entry.
4. CONFLICTING — Genuinely disagrees with existing knowledge on the same point under the same conditions.
   → Preserve BOTH statements. Do NOT overwrite either. Return conflict_entry.
5. IMPROVED — The new knowledge provides a BETTER quality version of the same knowledge:
   - Better wording (clearer, more precise, more complete phrasing)
   - Better Arabic (more accurate Arabic text, correct spelling)
   - Better Harakat (more complete/accurate diacritics)
   - Better source references (additional or more authoritative sources)
   → Update canonical text with improved version. Return improved_text_en and improvement_note.
   → The previous version is preserved in context_specific under condition "previous_version".
   → Use this ONLY when the new knowledge is a better quality version of the SAME knowledge, not when it adds new information.

EXISTING RESOLVED KNOWLEDGE:
${ex.knowledge_text_en || '(empty)'}

EXISTING CONTEXT-SPECIFIC ENTRIES:
${JSON.stringify(ex.context_specific || [])}

EXISTING CONFLICTING OPINIONS:
${JSON.stringify(ex.conflicting_opinions || [])}

NEW KNOWLEDGE:
${textEn}

TASK: Compare NEW against EXISTING. Classify the relationship. Return the appropriate action.

RULES:
- Never lose verified information.
- If unsure whether something conflicts, lean toward CONTEXT_SPECIFIC rather than CONFLICTING.
- Only classify as CONFLICTING when two sources genuinely disagree on the same point under the same conditions.
- For COMPLEMENTARY/EQUIVALENT: produce merged_text_en organizing all knowledge by category (Recommended Activities:, Activities Requiring Caution:, Conditions:, Warnings:). Use bullet points. Never remove existing. Add only genuinely new. Do not duplicate.
- For CONTEXT_SPECIFIC: identify the precise condition (e.g., "weekday:Thursday", "sahath:8", "planet:Mars").
- For CONFLICTING: identify the specific field that conflicts (e.g., "timing", "best_suited_activity", "method").
- NEVER use labels: Avoid, Do Not Do, Forbidden. Use: Suitable, Less Suitable, Caution, Warning.

Return JSON: { "classification": "complementary"|"equivalent"|"context_specific"|"conflicting"|"improved", "merged_text_en": "...", "improved_text_en": "...", "improvement_note": "...", "context_entry": { "condition": "...", "text_en": "...", "text_ml": "...", "text_ar": "..." }, "conflict_entry": { "field": "...", "opinion_text_en": "...", "opinion_text_ml": "...", "opinion_text_ar": "..." }, "conflict_field": "..." }`,
            response_json_schema: {
              type: "object",
              properties: {
                classification: { type: "string", enum: ["complementary", "equivalent", "context_specific", "conflicting", "improved"] },
                merged_text_en: { type: "string" },
                improved_text_en: { type: "string" },
                improvement_note: { type: "string" },
                context_entry: { type: "object", properties: { condition: { type: "string" }, text_en: { type: "string" }, text_ml: { type: "string" }, text_ar: { type: "string" } } },
                conflict_entry: { type: "object", properties: { field: { type: "string" }, opinion_text_en: { type: "string" }, opinion_text_ml: { type: "string" }, opinion_text_ar: { type: "string" } } },
                conflict_field: { type: "string" }
              },
              required: ["classification"]
            }
          });
          const classifyData: any = (classifyRes as any).data || classifyRes;
          const classification = classifyData.classification || 'complementary';
          const newSource = { book_title: book.book_title, page_number: sourceEntry?.page_number || '', entry_id: piece.source_entry_id };

          if (classification === 'conflicting') {
            const existingConflicts = ex.conflicting_opinions || [];
            const conflictField = classifyData.conflict_field || classifyData.conflict_entry?.field || 'general';
            existingConflicts.push({
              field: conflictField,
              opinion_text_en: classifyData.conflict_entry?.opinion_text_en || textEn,
              opinion_text_ml: classifyData.conflict_entry?.opinion_text_ml || piece.knowledge_text_ml || '',
              opinion_text_ar: classifyData.conflict_entry?.opinion_text_ar || piece.knowledge_text_ar || '',
              sources: [newSource],
              source_count: 1
            });
            const existingFlags = ex.conflict_flags || [];
            if (!existingFlags.includes(conflictField)) existingFlags.push(conflictField);

            await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
              conflicting_opinions: existingConflicts,
              conflict_flags: existingFlags,
              supporting_sources: [...(ex.supporting_sources || []), newSource],
              source_count: (ex.source_count || 1) + 1,
              is_verified: ex.is_verified || isVerified
            });
            conflictsDetected++;
          } else if (classification === 'context_specific') {
            const existingContext = ex.context_specific || [];
            existingContext.push({
              condition: classifyData.context_entry?.condition || 'unspecified',
              text_en: classifyData.context_entry?.text_en || textEn,
              text_ml: classifyData.context_entry?.text_ml || piece.knowledge_text_ml || '',
              text_ar: classifyData.context_entry?.text_ar || piece.knowledge_text_ar || '',
              sources: [newSource],
              source_count: 1
            });

            await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
              context_specific: existingContext,
              supporting_sources: [...(ex.supporting_sources || []), newSource],
              source_count: (ex.source_count || 1) + 1,
              is_verified: ex.is_verified || isVerified
            });
            contextSpecificAdded++;
          } else if (classification === 'improved') {
            // IMPROVED: Update canonical text with better version, preserve old in context_specific
            const existingContext = ex.context_specific || [];
            existingContext.push({
              condition: 'previous_version',
              text_en: ex.knowledge_text_en || '',
              text_ml: ex.knowledge_text_ml || '',
              text_ar: ex.knowledge_text_ar || '',
              sources: [newSource],
              source_count: 1
            });
            await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
              knowledge_text_en: classifyData.improved_text_en || textEn,
              knowledge_text_ar: piece.knowledge_text_ar || ex.knowledge_text_ar || '',
              context_specific: existingContext,
              supporting_sources: [...(ex.supporting_sources || []), newSource],
              source_count: (ex.source_count || 1) + 1,
              is_verified: ex.is_verified || isVerified
            });
            canonicalMerged++;
          } else {
            const mergedEn = classifyData.merged_text_en || textEn;
            const appendedAr = ex.knowledge_text_ar && piece.knowledge_text_ar ? ex.knowledge_text_ar + '\n---\n' + piece.knowledge_text_ar : (piece.knowledge_text_ar || ex.knowledge_text_ar || '');
            const appendedMl = ex.knowledge_text_ml && piece.knowledge_text_ml ? ex.knowledge_text_ml + '\n---\n' + piece.knowledge_text_ml : (piece.knowledge_text_ml || ex.knowledge_text_ml || '');

            await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
              knowledge_text_en: mergedEn,
              knowledge_text_ml: appendedMl,
              knowledge_text_ar: appendedAr,
              supporting_sources: [...(ex.supporting_sources || []), newSource],
              source_count: (ex.source_count || 1) + 1,
              is_verified: ex.is_verified || isVerified
            });
            canonicalMerged++;
          }
        } else {
          // No canonical match — create new record
          const knowledgeId = `ACK-${piece.source_entry_id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          await base44.asServiceRole.entities.AstroClockKnowledge.create({
            knowledge_id: knowledgeId,
            source_type: piece.source_type || 'planetary_hour',
            weekday: (piece.source_type === 'weekday' || piece.source_type === 'day_period' || piece.source_type === 'night_period') && piece.weekday !== undefined && piece.weekday !== null ? Number(piece.weekday) : null,
            period: piece.period || null,
            sahath_number: piece.source_type === 'sahath' && piece.sahath_number !== undefined && piece.sahath_number !== null && piece.sahath_number > 0 ? Number(piece.sahath_number) : null,
            planet: piece.planet || null,
            knowledge_category: piece.knowledge_category || 'timing_rule',
            canonical_key: canonicalKey,
            knowledge_text_en: textEn,
            knowledge_text_ml: piece.knowledge_text_ml || '',
            knowledge_text_ar: piece.knowledge_text_ar || '',
            content_hash: contentHash,
            is_marker: false,
            source_book_id: book_id,
            source_book_title: book.book_title,
            source_page_number: sourceEntry?.page_number || '',
            source_entry_id: piece.source_entry_id,
            is_verified: isVerified,
            supporting_sources: [],
            source_count: 1
          });
          newRecordsCreated++;
        }
      }

      entriesWithTimingSet.add(piece.source_entry_id);
    }

    // ══ 10. Create marker records for entries with no timing knowledge ══
    for (const entry of batch) {
      if (!entriesWithTimingSet.has(entry.entry_id)) {
        const markerHash = await computeHash(`no-timing-${entry.entry_id}`);
        await base44.asServiceRole.entities.AstroClockKnowledge.create({
          knowledge_id: `ACK-MARKER-${entry.entry_id}`,
          source_type: 'planetary_hour',
          weekday: null,
          period: null,
          sahath_number: null,
          planet: null,
          knowledge_category: 'timing_rule',
          knowledge_text_en: '',
          knowledge_text_ml: '',
          knowledge_text_ar: '',
          content_hash: markerHash,
          is_marker: true,
          source_book_id: book_id,
          source_book_title: book.book_title,
          source_page_number: entry.page_number || '',
          source_entry_id: entry.entry_id,
          is_verified: entry.verification_status === 'verified',
          supporting_sources: [],
          source_count: 0
        });
      }
    }

    const remaining = unprocessedEntries.length - batch.length;

    if (remaining > 0) {
      return Response.json({
        status: 'batch_complete',
        book_id,
        book_title: book.book_title,
        batch_processed: batch.length,
        remaining,
        new_pieces_extracted: newRecordsCreated,
        sources_added: sourcesAdded,
        duplicates_skipped: duplicatesSkipped,
        conflicts_detected: conflictsDetected,
        context_specific_added: contextSpecificAdded,
        message: `Batch: ${batch.length} entries analyzed. ${newRecordsCreated} new timing pieces, ${sourcesAdded} sources merged, ${conflictsDetected} conflicts, ${contextSpecificAdded} context-specific. ${remaining} remaining.`,
        next_step: `enrichAstroClockFromManuscript({ "book_id": "${book_id}" })`,
      });
    }

    // ══ 11. Final report ══
    const allKnowledge = await base44.asServiceRole.entities.AstroClockKnowledge.filter({ source_book_id: book_id });
    const realKnowledge = allKnowledge.filter((k: any) => !k.is_marker && k.knowledge_text_en && k.knowledge_text_en.length > 0);
    const byType: Record<string, number> = {};
    for (const k of realKnowledge) {
      byType[k.source_type] = (byType[k.source_type] || 0) + 1;
    }

    return Response.json({
      status: 'enrichment_complete',
      book_id,
      book_title: book.book_title,
      total_entries: entries.length,
      verified_entries: verifiedEntries.length,
      entries_analyzed: verifiedEntries.length,
      timing_pieces_extracted: realKnowledge.length,
      by_type: byType,
      sources_merged: sourcesAdded,
      conflicts_detected: conflictsDetected,
      context_specific_added: contextSpecificAdded,
      message: `Astro Clock enrichment complete. ${realKnowledge.length} timing pieces extracted, ${conflictsDetected} conflicts preserved, ${contextSpecificAdded} context-specific.`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'enrichment_failed' }, { status: 500 });
  }
});