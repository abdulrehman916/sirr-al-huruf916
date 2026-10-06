import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// REPROCESS BOOK ENTRIES — FULL MANUSCRIPT RE-EXTRACTION
// ═══════════════════════════════════════════════════════════════
// Reprocesses a previously imported ManuscriptBook by re-reading
// the original PDF and extracting ALL information from every page.
//
// Key improvements over the original extraction:
//   1. malayalam_meaning is POPULATED (not left empty)
//   2. introduction, references are captured
//   3. Prompt explicitly forbids summarizing/skipping
//   4. Every field is extracted verbatim from the manuscript
//
// PRESERVES:
//   - verified_arabic_hash (never overwritten)
//   - verification_status (never overwritten)
//   - images (existing image URLs preserved)
//   - method_id, duplicate_status, primary_source, supporting_sources
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
    const { book_id } = body;

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

    // ── Fetch existing entries (to preserve verified data) ──
    const existingEntries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id }, '-created_date', 200);

    // ══ IMPROVED EXTRACTION PROMPT ══
    const extractionPrompt = `You are an expert Islamic manuscript archivist, Arabic calligrapher, and Malayalam scholar.

TASK: Analyze EVERY page of this PDF manuscript. Extract ALL content from EVERY page.

ABSOLUTE RULES:
- Do NOT skip any page.
- Do NOT summarize. Do NOT abbreviate. Do NOT paraphrase.
- Extract EVERY word from EVERY page exactly as printed.
- If a field has content on the page, it MUST be captured — never leave it empty.
- Only leave a field as empty string ("") if that information truly does NOT exist anywhere on the page.

For each entry on each page, capture ALL of these fields:
- page_number: the page number as printed
- entry_type: one of: ritual, dua, quran_verse, divine_name, wafq, taweez, diagram, image, table, instruction, material, timing, condition, warning, note, reference, exorcism, protection, incense, herb
- topic: the main topic/subject in English (short phrase)
- topic_ml: the topic in Malayalam if printed in the manuscript (short phrase)
- topic_ar: the topic in Arabic if printed
- purpose: what this entry is for — short English description
- purpose_ml: what this entry is for — short Malayalam description (if in manuscript)
- arabic_text: ALL Arabic text VERBATIM from the manuscript. Preserve every harakat exactly. Never modify, modernize, or simplify.
- malayalam_meaning: the COMPLETE Malayalam explanation or translation as printed in the manuscript. Capture EVERY sentence, EVERY word. If the manuscript has Malayalam text explaining the Arabic, capture it ALL here. This is NOT a summary — it is the full text.
- english_meaning: the English text if printed in the manuscript (full, not summarized)
- introduction: any introductory text before the main content
- conditions: ALL conditions or prerequisites mentioned (full text, every condition)
- materials: ALL materials, ingredients, or items required (full list, every item)
- preparation: ALL preparation steps or instructions (full text, every step)
- procedure: ALL procedure steps — the complete method of use (full text, every step, never summarized)
- timing: ALL timing information (time of day, planetary hour, season, etc.)
- planet: the associated planet if mentioned
- day: the suitable day(s) if mentioned
- incense: the required incense if mentioned
- repetition: the exact repetition count or number of recitations
- warnings: ALL warnings, precautions, and restrictions (full text, every warning)
- benefits: EVERY benefit or expected result mentioned (full text, every benefit — never skip one)
- notes: any additional notes, remarks, or commentary
- references: any references, citations, or source attributions mentioned
- has_image: true if the page has an image/diagram/wafq/taweez
- image_type: wafq, taweez, diagram, table, seal, drawing, or none
- image_description: description of any image on the page
- arabic_text_preserved: true if Arabic is clearly readable, false if unclear
- sirr_section: integer 1-7:
  1 = Diseases & Healing
  2 = Jinn, Ruqyah & Spiritual Protection
  3 = Mahabbah, Acceptance & Relationships
  4 = Wafq, Taweez, Magic Squares & Spiritual Methods
  5 = Duas, Quranic Verses, Divine Names & Invocations
  6 = Herbs, Incense, Oils, Plants & Traditional Remedies
  7 = Sacred Times, Planetary Hours, Lunar Mansions & Spiritual Rules

CRITICAL EXTRACTION RULES:
- If the manuscript contains Malayalam text, you MUST capture it COMPLETELY in malayalam_meaning. Every sentence. Every word. Never summarize.
- If the manuscript contains Arabic, preserve it VERBATIM in arabic_text. Never guess harakat. Never add missing harakat.
- If the manuscript lists multiple benefits, capture ALL of them — never skip any.
- If the manuscript lists multiple conditions, capture ALL of them — never skip any.
- If the manuscript has step-by-step instructions, capture EVERY step.
- If a page has multiple entries (e.g., two duas on one page), extract each as a separate entry.
- Never invent information. If a field does not exist on the page, use empty string "".

ALSO provide:
- total_pages_analyzed: total pages processed
- pages_with_images: array of page numbers that have images
- pages_with_errors: array of page numbers with extraction errors
- skipped_pages: array of any skipped pages (should be empty)
- errors: array of any error messages`;

    // ══ Call InvokeLLM with improved prompt ══
    const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: extractionPrompt,
      file_urls: [pdfUrl],
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          total_pages_analyzed: { type: 'integer' },
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                page_number: { type: 'string' },
                entry_type: { type: 'string' },
                topic: { type: 'string' },
                topic_ml: { type: 'string' },
                topic_ar: { type: 'string' },
                purpose: { type: 'string' },
                purpose_ml: { type: 'string' },
                arabic_text: { type: 'string' },
                malayalam_meaning: { type: 'string' },
                english_meaning: { type: 'string' },
                introduction: { type: 'string' },
                conditions: { type: 'string' },
                materials: { type: 'string' },
                preparation: { type: 'string' },
                procedure: { type: 'string' },
                timing: { type: 'string' },
                planet: { type: 'string' },
                day: { type: 'string' },
                incense: { type: 'string' },
                repetition: { type: 'string' },
                warnings: { type: 'string' },
                benefits: { type: 'string' },
                notes: { type: 'string' },
                references: { type: 'string' },
                has_image: { type: 'boolean' },
                image_type: { type: 'string' },
                image_description: { type: 'string' },
                arabic_text_preserved: { type: 'boolean' },
                sirr_section: { type: 'integer' },
              },
            },
          },
          pages_with_images: { type: 'array', items: { type: 'string' } },
          pages_with_errors: { type: 'array', items: { type: 'string' } },
          skipped_pages: { type: 'array', items: { type: 'string' } },
          errors: { type: 'array', items: { type: 'string' } },
        },
      },
    });

    const newEntries = llmResult.entries || [];
    const reprocessDate = new Date().toISOString();

    if (newEntries.length === 0) {
      return Response.json({
        status: 'no_entries',
        book_id,
        book_title: book.book_title,
        message: 'No entries extracted from the PDF. The file may be unreadable or contain no extractable content.',
      });
    }

    // ══ Match new entries to existing entries and prepare updates ══
    const updates: any[] = [];
    const creates: any[] = [];
    const matchReport: any[] = [];
    const matchedEntryIds = new Set<string>(); // Track matched entries to prevent duplicates
    let updatedCount = 0;
    let createdCount = 0;

    for (const newEntry of newEntries) {
      const newTopic = (newEntry.topic || newEntry.purpose || 'General').trim();
      const newPage = String(newEntry.page_number || '').trim();
      const newArabicPrefix = (newEntry.arabic_text || '').slice(0, 40).trim();

      // Find matching existing entry: match by page_number + topic, fallback to page_number + arabic prefix
      // Only match entries that haven't been matched yet
      let match = existingEntries.find((e: any) =>
        !matchedEntryIds.has(e.id) &&
        String(e.page_number || '').trim() === newPage &&
        (e.topic || '').trim() === newTopic
      );

      if (!match && newArabicPrefix) {
        match = existingEntries.find((e: any) =>
          !matchedEntryIds.has(e.id) &&
          String(e.page_number || '').trim() === newPage &&
          (e.arabic_text || '').slice(0, 40).trim() === newArabicPrefix
        );
      }

      if (!match && newPage) {
        // Last resort: match by page number only if there's only one unmatched entry on that page
        const samePageEntries = existingEntries.filter((e: any) =>
          !matchedEntryIds.has(e.id) && String(e.page_number || '').trim() === newPage
        );
        if (samePageEntries.length === 1) {
          match = samePageEntries[0];
        }
      }

      // Mark this entry as matched to prevent duplicate matching
      if (match) {
        matchedEntryIds.add(match.id);
      }

      if (match) {
        // ── Update existing entry — PRESERVE verified fields ──
        updates.push({
          id: match.id,
          // Update all content fields with new extraction data
          purpose: newEntry.purpose || match.purpose || '',
          purpose_ml: newEntry.purpose_ml || match.purpose_ml || '',
          topic: newEntry.topic || match.topic || 'General',
          topic_ml: newEntry.topic_ml || match.topic_ml || '',
          topic_ar: newEntry.topic_ar || match.topic_ar || '',
          arabic_text: newEntry.arabic_text || match.arabic_text || '',
          malayalam_meaning: newEntry.malayalam_meaning || match.malayalam_meaning || '',
          english_meaning: newEntry.english_meaning || match.english_meaning || '',
          introduction: newEntry.introduction || match.introduction || '',
          conditions: newEntry.conditions || match.conditions || '',
          materials: newEntry.materials || match.materials || '',
          preparation: newEntry.preparation || match.preparation || '',
          procedure: newEntry.procedure || match.procedure || '',
          timing: newEntry.timing || match.timing || '',
          planet: newEntry.planet || match.planet || '',
          day: newEntry.day || match.day || '',
          incense: newEntry.incense || match.incense || '',
          repetition: newEntry.repetition || match.repetition || '',
          warnings: newEntry.warnings || match.warnings || '',
          benefits: newEntry.benefits || match.benefits || '',
          notes: newEntry.notes || match.notes || '',
          entry_type: newEntry.entry_type || match.entry_type || 'instruction',
          sirr_section: newEntry.sirr_section || match.sirr_section || 5,
          extraction_confidence: newEntry.arabic_text_preserved === false ? 50 : 85,
          extraction_date: reprocessDate,
          // PRESERVE these fields — never overwrite
          // verified_arabic_hash, verification_status, images,
          // method_id, is_primary_method_entry, linked_method_id,
          // duplicate_status, primary_source, supporting_sources, source_count,
          // confidence_score, duplicate_detection_date
        });
        updatedCount++;
        matchReport.push({ entry_id: match.entry_id, status: 'updated', page: newPage, topic: newTopic });
      } else {
        // ── Create new entry ──
        creates.push({
          entry_id: `ME-${book_id}-R${Date.now()}-${createdCount + 1}`,
          book_id: book_id,
          book_title: book.book_title,
          book_title_ar: book.book_title_ar || '',
          sirr_section: newEntry.sirr_section || 5,
          topic: newEntry.topic || newEntry.purpose || 'General',
          topic_ml: newEntry.topic_ml || '',
          topic_ar: newEntry.topic_ar || '',
          entry_type: newEntry.entry_type || 'instruction',
          purpose: newEntry.purpose || '',
          purpose_ml: newEntry.purpose_ml || '',
          introduction: newEntry.introduction || '',
          arabic_text: newEntry.arabic_text || '',
          malayalam_meaning: newEntry.malayalam_meaning || '',
          english_meaning: newEntry.english_meaning || '',
          conditions: newEntry.conditions || '',
          materials: newEntry.materials || '',
          preparation: newEntry.preparation || '',
          procedure: newEntry.procedure || '',
          timing: newEntry.timing || '',
          planet: newEntry.planet || '',
          day: newEntry.day || '',
          incense: newEntry.incense || '',
          repetition: newEntry.repetition || '',
          warnings: newEntry.warnings || '',
          benefits: newEntry.benefits || '',
          notes: newEntry.notes || '',
          page_number: newPage,
          images: [],
          verified_arabic_hash: '',
          verification_status: 'pending',
          extraction_confidence: newEntry.arabic_text_preserved === false ? 50 : 85,
          extraction_date: reprocessDate,
        });
        createdCount++;
        matchReport.push({ entry_id: 'NEW-' + createdCount, status: 'created', page: newPage, topic: newTopic });
      }
    }

    // ══ Execute updates ──
    if (updates.length > 0) {
      await base44.asServiceRole.entities.ManuscriptEntry.bulkUpdate(updates);
    }

    // ══ Execute creates ──
    if (creates.length > 0) {
      await base44.asServiceRole.entities.ManuscriptEntry.bulkCreate(creates);
    }

    // ══ Update book record ──
    await base44.asServiceRole.entities.ManuscriptBook.update(book.id, {
      total_entries_extracted: existingEntries.length + createdCount,
      extraction_status: 'completed',
      notes: `Reprocessed on ${reprocessDate}. ${updatedCount} entries updated, ${createdCount} new entries created. All fields re-extracted from original PDF.`,
    });

    // ══ Build field population report ─═
    const fieldReport: Record<string, number> = {};
    const fieldsToCount = ['malayalam_meaning', 'english_meaning', 'introduction', 'conditions', 'materials', 'preparation', 'procedure', 'timing', 'repetition', 'warnings', 'benefits', 'notes', 'references', 'purpose', 'purpose_ml'];
    for (const field of fieldsToCount) {
      fieldReport[field] = newEntries.filter((e: any) => e[field] && String(e[field]).trim().length > 0).length;
    }

    return Response.json({
      status: 'success',
      book_id: book_id,
      book_title: book.book_title,
      total_pages_analyzed: llmResult.total_pages_analyzed || 0,
      entries_before: existingEntries.length,
      entries_extracted: newEntries.length,
      entries_updated: updatedCount,
      entries_created: createdCount,
      fields_now_populated: fieldReport,
      pages_with_errors: llmResult.pages_with_errors || [],
      skipped_pages: llmResult.skipped_pages || [],
      errors: llmResult.errors || [],
      match_report: matchReport.slice(0, 20),
      reprocess_date: reprocessDate,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'reprocess_failed' }, { status: 500 });
  }
});