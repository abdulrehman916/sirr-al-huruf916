import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// RITUAL MODULE AUTO-ENRICHMENT — Extracts amal/ritual/procedure
// knowledge from verified manuscript entries and stores in
// RitualKnowledge. Called by routeManuscriptKnowledge.
// ═══════════════════════════════════════════════════════════════

function normalizeText(text: string): string {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim();
}

async function computeHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { book_id, batch_size, entry_ids } = body;
    if (!book_id) return Response.json({ error: 'book_id is required' }, { status: 400 });

    const BATCH = Math.min(batch_size || 5, 8);
    const books = await base44.asServiceRole.entities.ManuscriptBook.filter({ book_id });
    if (!books?.length) return Response.json({ error: 'Book not found' }, { status: 404 });
    const book = books[0];

    const entries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id });
    if (!entries?.length) return Response.json({ error: 'No entries found' }, { status: 404 });

    const idFilter: string[] | undefined = entry_ids;
    const verified = entries.filter((e: any) => {
      const ok = e.verification_status === 'verified' || e.verification_status === 'manual_review';
      if (!ok) return false;
      if (idFilter && Array.isArray(idFilter) && idFilter.length > 0) return idFilter.includes(e.entry_id);
      return true;
    });

    if (!verified.length) {
      return Response.json({ status: 'enrichment_complete', book_id, total_entries: entries.length, verified_entries: 0, ritual_pieces_extracted: 0, message: 'No verified entries.' });
    }

    const existing = await base44.asServiceRole.entities.RitualKnowledge.filter({ source_book_id: book_id });
    const processed = new Set(existing.map((k: any) => k.source_entry_id));
    const unprocessed = verified.filter((e: any) => !processed.has(e.entry_id));

    if (!unprocessed.length) {
      const real = existing.filter((k: any) => !k.is_marker && k.knowledge_text_en?.length > 0);
      return Response.json({ status: 'enrichment_complete', book_id, total_entries: entries.length, verified_entries: verified.length, ritual_pieces_extracted: real.length, message: `Ritual enrichment complete. ${real.length} pieces.` });
    }

    const batch = unprocessed.slice(0, BATCH);

    const summaries = batch.map((e: any, i: number) => `Entry ${i + 1}:
- Entry ID: ${e.entry_id}
- Page: ${e.page_number || 'N/A'}
- Topic: ${e.topic || e.purpose || 'N/A'}
- Entry type: ${e.entry_type || 'N/A'}
- Purpose: ${e.purpose || 'N/A'}
- Arabic text: ${(e.arabic_text || '').substring(0, 500)}
- English meaning: ${(e.english_meaning || '').substring(0, 400)}
- Malayalam meaning: ${(e.malayalam_meaning || '').substring(0, 300)}
- Conditions: ${(e.conditions || '').substring(0, 300)}
- Materials: ${(e.materials || '').substring(0, 300)}
- Preparation: ${(e.preparation || '').substring(0, 300)}
- Procedure: ${(e.procedure || '').substring(0, 500)}
- Timing: ${e.timing || 'N/A'}
- Repetition: ${e.repetition || 'N/A'}
- Duration: ${e.timing || 'N/A'}
- Warnings: ${(e.warnings || '').substring(0, 200)}
- Benefits: ${(e.benefits || '').substring(0, 200)}`).join('\n\n---\n\n');

    const prompt = `You are analyzing verified Islamic manuscript entries for RITUAL-RELATED knowledge only.

MANUSCRIPT: ${book.book_title}

ENTRIES:
${summaries}

TASK: For each entry, extract ONLY ritual-related knowledge:
- Amal (spiritual works)
- Ritual procedures (step-by-step)
- Exorcism methods
- Protection methods
- Sequences of actions
- Preparation and closing procedures

For each piece, provide:
- source_entry_id: the entry ID
- source_type: "amal" | "ritual" | "procedure" | "exorcism" | "protection" | "instruction"
- category: "ritual_procedure" | "spiritual_practice" | "exorcism_method" | "protection_method" | "sequence_of_actions" | "preparation_step" | "closing_procedure" | "opening_procedure"
- text_en: concise English description of the ritual knowledge
- text_ml: Malayalam translation if available, else empty string
- text_ar: original Arabic text verbatim if present, else empty string
- materials_summary: lightweight summary of required materials (e.g., "frankincense, rose water"), else empty string
- timing_reference: lightweight timing note if mentioned, else empty string
- duration: ritual duration if specified (e.g., "7 days"), else empty string

RULES:
1. Extract ONLY ritual knowledge. Do NOT extract timing rules, dua texts, or wafq structures.
2. Preserve Arabic text verbatim — never modify or invent.
3. If an entry has NO ritual knowledge, do not include pieces for it.
4. Keep each piece concise — extract the ritual intelligence, not the full entry.

Return JSON: { "entries_analyzed": <number>, "ritual_pieces": [ { ... } ] }`;

    const llmRes = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          entries_analyzed: { type: "number" },
          ritual_pieces: {
            type: "array",
            items: {
              type: "object",
              properties: {
                source_entry_id: { type: "string" },
                source_type: { type: "string" },
                category: { type: "string" },
                text_en: { type: "string" },
                text_ml: { type: "string" },
                text_ar: { type: "string" },
                materials_summary: { type: "string" },
                timing_reference: { type: "string" },
                duration: { type: "string" }
              },
              required: ["source_entry_id", "source_type", "category", "text_en"]
            }
          }
        },
        required: ["entries_analyzed", "ritual_pieces"]
      }
    });

    const result: any = (llmRes as any).data || llmRes;
    const pieces: any[] = Array.isArray(result.ritual_pieces) ? result.ritual_pieces : [];

    let created = 0, merged = 0, canonicalMerged = 0, conflictsDetected = 0, contextSpecificAdded = 0;
    const withRitual = new Set<string>();

    for (const p of pieces) {
      if (!p.text_en || !String(p.text_en).trim()) continue;
      if (!p.source_entry_id) continue;
      const textEn = String(p.text_en).trim();
      const hash = await computeHash(normalizeText(textEn));
      const existingRecs = await base44.asServiceRole.entities.RitualKnowledge.filter({ content_hash: hash }, undefined, 1);
      const srcEntry = batch.find((e: any) => e.entry_id === p.source_entry_id);
      const isVer = srcEntry?.verification_status === 'verified';

      if (existingRecs?.length > 0) {
        const ex = existingRecs[0];
        const sources = ex.supporting_sources || [];
        const has = sources.some((s: any) => s.entry_id === p.source_entry_id) || ex.source_entry_id === p.source_entry_id;
        if (!has) {
          await base44.asServiceRole.entities.RitualKnowledge.update(ex.id, {
            supporting_sources: [...sources, { book_title: book.book_title, page_number: srcEntry?.page_number || '', entry_id: p.source_entry_id }],
            source_count: (ex.source_count || 1) + 1
          });
          merged++;
        }
      } else {
        // CANONICAL KEY CHECK — field-level knowledge evolution
        const canonicalKey = `${p.source_type || 'ritual'}|${p.category || 'ritual_procedure'}`;
        const canonicalMatches = await base44.asServiceRole.entities.RitualKnowledge.filter({ canonical_key: canonicalKey, is_marker: false }, undefined, 1);

        if (canonicalMatches?.length > 0) {
          const ex = canonicalMatches[0];
          // ══ CONFLICT RESOLUTION: Classify before merging ══
          const classifyRes = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a KNOWLEDGE CONFLICT RESOLVER for Islamic occult manuscript knowledge.

CLASSIFICATION TYPES:
1. COMPLEMENTARY — New information that adds to the existing record without contradicting it.
   → Merge into resolved text. Return merged_text_en.
2. EQUIVALENT — Same meaning expressed differently.
   → Merge into resolved text as one normalized statement. Return merged_text_en.
3. CONTEXT_SPECIFIC — Valid only under certain conditions (weekday, Sahath, planet, season, intention, material, method).
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
Materials: ${p.materials_summary || 'N/A'}
Timing reference: ${p.timing_reference || 'N/A'}
Duration: ${p.duration || 'N/A'}

TASK: Compare NEW against EXISTING. Classify the relationship. Return the appropriate action.

RULES:
- Never lose verified information.
- If unsure whether something conflicts, lean toward CONTEXT_SPECIFIC rather than CONFLICTING.
- Only classify as CONFLICTING when two sources genuinely disagree on the same point under the same conditions.
- For COMPLEMENTARY/EQUIVALENT: produce merged_text_en organizing all knowledge by category with bullet points. Never remove existing. Add only genuinely new. Do not duplicate.
- For CONTEXT_SPECIFIC: identify the precise condition (e.g., "weekday:Thursday", "sahath:8", "planet:Mars", "intention:love", "material:silver").
- For CONFLICTING: identify the specific field that conflicts (e.g., "timing", "method", "materials", "duration").

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
          const newSource = { book_title: book.book_title, page_number: srcEntry?.page_number || '', entry_id: p.source_entry_id };

          if (classification === 'conflicting') {
            const existingConflicts = ex.conflicting_opinions || [];
            const conflictField = classifyData.conflict_field || classifyData.conflict_entry?.field || 'general';
            existingConflicts.push({
              field: conflictField,
              opinion_text_en: classifyData.conflict_entry?.opinion_text_en || textEn,
              opinion_text_ml: classifyData.conflict_entry?.opinion_text_ml || p.text_ml || '',
              opinion_text_ar: classifyData.conflict_entry?.opinion_text_ar || p.text_ar || '',
              sources: [newSource],
              source_count: 1
            });
            const existingFlags = ex.conflict_flags || [];
            if (!existingFlags.includes(conflictField)) existingFlags.push(conflictField);

            await base44.asServiceRole.entities.RitualKnowledge.update(ex.id, {
              conflicting_opinions: existingConflicts,
              conflict_flags: existingFlags,
              supporting_sources: [...(ex.supporting_sources || []), newSource],
              source_count: (ex.source_count || 1) + 1,
              is_verified: ex.is_verified || isVer
            });
            conflictsDetected++;
          } else if (classification === 'context_specific') {
            const existingContext = ex.context_specific || [];
            existingContext.push({
              condition: classifyData.context_entry?.condition || 'unspecified',
              text_en: classifyData.context_entry?.text_en || textEn,
              text_ml: classifyData.context_entry?.text_ml || p.text_ml || '',
              text_ar: classifyData.context_entry?.text_ar || p.text_ar || '',
              sources: [newSource],
              source_count: 1
            });

            await base44.asServiceRole.entities.RitualKnowledge.update(ex.id, {
              context_specific: existingContext,
              supporting_sources: [...(ex.supporting_sources || []), newSource],
              source_count: (ex.source_count || 1) + 1,
              is_verified: ex.is_verified || isVer
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
            await base44.asServiceRole.entities.RitualKnowledge.update(ex.id, {
              knowledge_text_en: classifyData.improved_text_en || textEn,
              knowledge_text_ar: p.text_ar || ex.knowledge_text_ar || '',
              context_specific: existingContext,
              supporting_sources: [...(ex.supporting_sources || []), newSource],
              source_count: (ex.source_count || 1) + 1,
              is_verified: ex.is_verified || isVer
            });
            canonicalMerged++;
          } else {
            const mergedEn = classifyData.merged_text_en || textEn;
            const appendedAr = ex.knowledge_text_ar && p.text_ar ? ex.knowledge_text_ar + '\n---\n' + p.text_ar : (p.text_ar || ex.knowledge_text_ar || '');
            const appendedMl = ex.knowledge_text_ml && p.text_ml ? ex.knowledge_text_ml + '\n---\n' + p.text_ml : (p.text_ml || ex.knowledge_text_ml || '');
            const appendedMat = ex.materials_summary && p.materials_summary ? ex.materials_summary + '; ' + p.materials_summary : (p.materials_summary || ex.materials_summary || '');
            const appendedTiming = ex.timing_reference && p.timing_reference ? ex.timing_reference + '; ' + p.timing_reference : (p.timing_reference || ex.timing_reference || '');
            const appendedDur = ex.duration && p.duration ? ex.duration + '; ' + p.duration : (p.duration || ex.duration || '');

            await base44.asServiceRole.entities.RitualKnowledge.update(ex.id, {
              knowledge_text_en: mergedEn, knowledge_text_ml: appendedMl, knowledge_text_ar: appendedAr,
              materials_summary: appendedMat, timing_reference: appendedTiming, duration: appendedDur,
              supporting_sources: [...(ex.supporting_sources || []), newSource],
              source_count: (ex.source_count || 1) + 1, is_verified: ex.is_verified || isVer
            });
            canonicalMerged++;
          }
        } else {
          const kid = `RK-${p.source_entry_id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          await base44.asServiceRole.entities.RitualKnowledge.create({
            knowledge_id: kid, source_type: p.source_type || 'ritual', knowledge_category: p.category || 'ritual_procedure',
            canonical_key: canonicalKey,
            knowledge_text_en: textEn, knowledge_text_ml: p.text_ml || '', knowledge_text_ar: p.text_ar || '',
            content_hash: hash, is_marker: false,
            materials_summary: p.materials_summary || '', timing_reference: p.timing_reference || '', duration: p.duration || '',
            source_book_id: book_id, source_book_title: book.book_title, source_page_number: srcEntry?.page_number || '',
            source_entry_id: p.source_entry_id, is_verified: isVer, supporting_sources: [], source_count: 1
          });
          created++;
        }
      }
      withRitual.add(p.source_entry_id);
    }

    for (const e of batch) {
      if (!withRitual.has(e.entry_id)) {
        const mhash = await computeHash(`no-ritual-${e.entry_id}`);
        await base44.asServiceRole.entities.RitualKnowledge.create({
          knowledge_id: `RK-MARKER-${e.entry_id}`,
          source_type: 'ritual',
          knowledge_category: 'ritual_procedure',
          knowledge_text_en: '',
          knowledge_text_ml: '',
          knowledge_text_ar: '',
          content_hash: mhash,
          is_marker: true,
          materials_summary: '',
          timing_reference: '',
          duration: '',
          source_book_id: book_id,
          source_book_title: book.book_title,
          source_page_number: e.page_number || '',
          source_entry_id: e.entry_id,
          is_verified: e.verification_status === 'verified',
          supporting_sources: [],
          source_count: 0
        });
      }
    }

    const remaining = unprocessed.length - batch.length;
    if (remaining > 0) {
      return Response.json({ status: 'batch_complete', book_id, batch_processed: batch.length, remaining, new_pieces: created, sources_merged: merged, conflicts_detected: conflictsDetected, context_specific_added: contextSpecificAdded, message: `Batch: ${created} new, ${merged} merged, ${conflictsDetected} conflicts, ${contextSpecificAdded} context-specific. ${remaining} remaining.` });
    }

    const all = await base44.asServiceRole.entities.RitualKnowledge.filter({ source_book_id: book_id });
    const real = all.filter((k: any) => !k.is_marker && k.knowledge_text_en?.length > 0);
    return Response.json({ status: 'enrichment_complete', book_id, total_entries: entries.length, verified_entries: verified.length, ritual_pieces_extracted: real.length, sources_merged: merged, conflicts_detected: conflictsDetected, context_specific_added: contextSpecificAdded, message: `Ritual enrichment complete. ${real.length} pieces, ${conflictsDetected} conflicts preserved, ${contextSpecificAdded} context-specific.` });
  } catch (error) {
    return Response.json({ error: error.message, status: 'enrichment_failed' }, { status: 500 });
  }
});