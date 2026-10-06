import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// DEEP REPROCESS MISSING FIELDS — TARGETED PAGE-LEVEL RE-EXTRACTION
// ═══════════════════════════════════════════════════════════════
// For each entry with missing fields, re-examines the specific page
// in the PDF and either fills in the field with exact text OR marks
// it as "NOT_IN_MANUSCRIPT" if the information genuinely doesn't exist.
//
// Uses gemini_3_1_pro (stronger model) for thorough page-level analysis.
// Produces a detailed audit with page numbers and reasons.
//
// ADMIN ONLY.
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { book_id, batch_offset, batch_size, model } = body;

    if (!book_id) {
      return Response.json({ error: 'book_id is required' }, { status: 400 });
    }

    // ── Fetch the book record ──
    const books = await base44.asServiceRole.entities.ManuscriptBook.filter({ book_id });
    if (!books || books.length === 0) {
      return Response.json({ error: 'Book not found: ' + book_id }, { status: 404 });
    }
    const book = books[0];
    const pdfUrl = book.original_file_url;

    if (!pdfUrl) {
      return Response.json({ error: 'No original PDF URL found for this book' }, { status: 400 });
    }

    // ── Fetch all entries for this book ──
    const allEntries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id }, '-created_date', 200);

    // ── Define all content fields ──
    const CONTENT_FIELDS = [
      'arabic_text', 'malayalam_meaning', 'english_meaning', 'introduction',
      'purpose', 'purpose_ml', 'procedure', 'benefits', 'conditions',
      'warnings', 'notes', 'timing', 'repetition', 'materials', 'preparation',
      'malayalam_pronunciation', 'planet', 'day', 'incense', 'references',
    ];

    // ── Identify entries with missing fields (EXCLUDE already-audited entries) ──
    // Entries marked with [DEEP_AUDIT_COMPLETE] in notes have been fully audited —
    // all missing fields confirmed as NOT_IN_MANUSCRIPT. Skip them to avoid re-processing.
    const entriesWithMissing = allEntries.filter((e: any) => {
      const hasMissing = CONTENT_FIELDS.some((f: string) => !e[f] || String(e[f] || '').trim().length === 0);
      if (!hasMissing) return false;
      const notesStr = String(e.notes || '');
      return !notesStr.includes('[DEEP_AUDIT_COMPLETE]');
    });

    if (entriesWithMissing.length === 0) {
      return Response.json({
        status: 'complete',
        book_id,
        book_title: book.book_title,
        message: 'All entries have been fully audited. Every field is either populated or confirmed as NOT_IN_MANUSCRIPT.',
        total_entries: allEntries.length,
        fields_filled: 0,
        fields_not_in_manuscript: 0,
        fields_still_missing: 0,
        audit: [],
      });
    }

    // ── Batch processing — always start from offset 0 ──
    // Entries that get filled or marked [DEEP_AUDIT_COMPLETE] are removed from
    // the missing list on the next call, so offset 0 always points to unprocessed entries.
    const size = batch_size || 20;
    const batch = entriesWithMissing.slice(0, size);
    const hasMore = entriesWithMissing.length > size;

    // ── Build entries list for the LLM ──
    const entriesToReexamine = batch.map((e: any) => {
      const missingFields = CONTENT_FIELDS.filter((f: string) =>
        !e[f] || String(e[f] || '').trim().length === 0
      );
      return {
        entry_id: e.entry_id,
        page_number: String(e.page_number || 'unknown'),
        topic: e.topic || 'General',
        purpose: e.purpose || '',
        existing_arabic_preview: e.arabic_text ? String(e.arabic_text).slice(0, 60) : '',
        existing_malayalam_preview: e.malayalam_meaning ? String(e.malayalam_meaning).slice(0, 60) : '',
        missing_fields: missingFields,
      };
    });

    // ══ DEEP EXTRACTION PROMPT ══
    const prompt = `You are an expert Islamic manuscript archivist, Arabic calligrapher, and Malayalam/Turkish scholar.

MANUSCRIPT: "${book.book_title}"
LANGUAGE: ${book.language || 'mixed'}

TASK: Below are ${batch.length} entries from this manuscript that have MISSING fields. For EACH entry, go to the specified page in the PDF and re-examine it carefully. Extract the missing fields.

ABSOLUTE RULES:
1. For EACH missing field, you MUST respond with exactly ONE of:
   - The EXACT text from the page (copied VERBATIM — every word, every character)
   - "NOT_IN_MANUSCRIPT" (only if the information genuinely does NOT exist anywhere on that page)

2. NEVER leave a field empty. NEVER use null. Always provide either exact text or "NOT_IN_MANUSCRIPT".

3. Do NOT summarize. Do NOT abbreviate. Do NOT paraphrase. Copy text EXACTLY as printed.

4. If Arabic text exists on the page, copy it character-by-character with ALL harakat/diacritics preserved. Never add or remove harakat.

5. If Malayalam text exists on the page, copy it completely — every sentence, every word.

6. If the page lists MULTIPLE benefits, conditions, warnings, or materials — capture ALL of them, not just one.

7. If the page has step-by-step instructions, capture EVERY step in the procedure/preparation field.

8. If the manuscript is in Turkish and has no Arabic/Malayalam text on a page, mark arabic_text and malayalam_meaning as "NOT_IN_MANUSCRIPT".

9. If the page mentions a planet, day, incense, or timing — extract it even if it's a brief mention.

10. "NOT_IN_MANUSCRIPT" means the information truly does not appear on that page. If you're unsure, re-read the page.

11. For "references" field: extract any source citations, book references, or scholarly attributions mentioned on the page.

ENTRIES TO RE-EXAMINE (page numbers refer to the PDF page numbers):
${JSON.stringify(entriesToReexamine, null, 2)}

Return a JSON object with this EXACT structure:
{
  "results": [
    {
      "entry_id": "<the entry_id from above>",
      "page_number": "<the page number>",
      "field_results": [
        { "field": "arabic_text", "value": "<exact Arabic text from page>", "status": "FOUND" },
        { "field": "malayalam_meaning", "value": "NOT_IN_MANUSCRIPT", "status": "NOT_IN_MANUSCRIPT" },
        { "field": "procedure", "value": "<exact procedure text>", "status": "FOUND" },
        ...one object for EACH missing field...
      ],
      "audit_reason": "<brief explanation: what was found, or why fields are not in the manuscript>"
    }
  ]
}

CRITICAL RULES FOR field_results:
- Include ONE object in field_results for EACH missing field listed for that entry.
- "status" must be "FOUND" if you extracted text, or "NOT_IN_MANUSCRIPT" if it doesn't exist on the page.
- "value" must contain the EXACT text from the page (when FOUND) or the string "NOT_IN_MANUSCRIPT" (when not found).
- NEVER leave "value" as empty string. If status is NOT_IN_MANUSCRIPT, value must be "NOT_IN_MANUSCRIPT".
- Include ONE result object for EACH entry listed above.`;

    // ══ Call InvokeLLM with stronger model ══
    // Using array-based field results for reliable schema enforcement
    const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [pdfUrl],
      model: model || 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                entry_id: { type: 'string' },
                page_number: { type: 'string' },
                field_results: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string' },
                      value: { type: 'string' },
                      status: { type: 'string', enum: ['FOUND', 'NOT_IN_MANUSCRIPT'] },
                    },
                    required: ['field', 'value', 'status'],
                  },
                },
                audit_reason: { type: 'string' },
              },
              required: ['entry_id', 'field_results', 'audit_reason'],
            },
          },
        },
        required: ['results'],
      },
    });

    // ══ Process results — update entries with newly found data ══
    const results = llmResult.results || [];
    const updates: any[] = [];
    const auditReport: any[] = [];
    let totalFilled = 0;
    let totalNotInManuscript = 0;
    let totalStillMissing = 0;

    for (const result of results) {
      const entry = batch.find((e: any) => e.entry_id === result.entry_id);
      if (!entry) continue;

      const updateData: any = { id: entry.id };
      const filledFields: string[] = [];
      const notInManuscript: string[] = [];
      const stillMissing: string[] = [];
      const processedFields = new Set<string>();

      for (const fr of (result.field_results || [])) {
        const field = String(fr.field || '').trim();
        const rawValue = String(fr.value || '').trim();
        const status = String(fr.status || '').trim().toUpperCase();
        if (!field) continue;
        processedFields.add(field);

        // Determine if this is NOT_IN_MANUSCRIPT
        const isNotInMs = status === 'NOT_IN_MANUSCRIPT' ||
          rawValue === 'NOT_IN_MANUSCRIPT' ||
          rawValue.toUpperCase().includes('NOT_IN_MANUSCRIPT') ||
          rawValue.toUpperCase().includes('NOT IN MANUSCRIPT') ||
          rawValue.toUpperCase().includes('NOT PRESENT') ||
          rawValue.toUpperCase().includes('NOT FOUND') ||
          rawValue.toUpperCase().includes('NOT MENTIONED') ||
          rawValue.toUpperCase().includes('DOES NOT EXIST') ||
          rawValue.toUpperCase() === 'N/A' || rawValue.toUpperCase() === 'NA';

        if (isNotInMs) {
          notInManuscript.push(field);
        } else if (rawValue.length > 0) {
          // Only update if the field is currently empty (don't overwrite existing data)
          const currentValue = String(entry[field] || '').trim();
          if (!currentValue) {
            updateData[field] = rawValue;
            filledFields.push(field);
          } else {
            // Already has a value — skip
          }
        } else {
          stillMissing.push(field);
        }
      }

      // Check for fields the LLM didn't mention at all
      const expectedMissing = entriesToReexamine.find((e: any) => e.entry_id === result.entry_id)?.missing_fields || [];
      for (const field of expectedMissing) {
        if (!processedFields.has(field)) {
          stillMissing.push(field);
        }
      }

      // ── Mark entry as fully audited if no fields are still missing ──
      // This prevents re-processing on subsequent calls
      if (stillMissing.length === 0) {
        const existingNotes = String(entry.notes || '').trim();
        if (!existingNotes.includes('[DEEP_AUDIT_COMPLETE]')) {
          updateData.notes = existingNotes
            ? `${existingNotes} [DEEP_AUDIT_COMPLETE]`
            : '[DEEP_AUDIT_COMPLETE]';
        }
      }

      if (Object.keys(updateData).length > 1) {
        updates.push(updateData);
      }

      totalFilled += filledFields.length;
      totalNotInManuscript += notInManuscript.length;
      totalStillMissing += stillMissing.length;

      auditReport.push({
        entry_id: entry.entry_id,
        page: entry.page_number,
        topic: entry.topic,
        fields_filled: filledFields,
        fields_not_in_manuscript: notInManuscript,
        fields_still_missing: stillMissing,
        audit_reason: result.audit_reason || '',
      });
    }

    // ══ Execute updates ──
    if (updates.length > 0) {
      await base44.asServiceRole.entities.ManuscriptEntry.bulkUpdate(updates);
    }

    return Response.json({
      status: hasMore ? 'batch_complete' : 'complete',
      book_id,
      book_title: book.book_title,
      total_entries: allEntries.length,
      total_with_missing: entriesWithMissing.length,
      entries_in_batch: batch.length,
      entries_processed: results.length,
      fields_filled: totalFilled,
      fields_not_in_manuscript: totalNotInManuscript,
      fields_still_missing: totalStillMissing,
      has_more: hasMore,
      updates_applied: updates.length,
      audit: auditReport,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'deep_reprocess_failed' }, { status: 500 });
  }
});