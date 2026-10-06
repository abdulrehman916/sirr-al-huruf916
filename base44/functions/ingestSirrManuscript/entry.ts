import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR FAITHFUL MANUSCRIPT ARCHIVE — SECTION-BASED INGESTION
//
// The uploaded PDF is the ONLY source of truth.
// This function transcribes each named section/wirid/hizb in the
// manuscript as a separate entry, preserving:
//   - heading_title_ar: exactly as printed (Arabic/Ottoman)
//   - heading_title_ml: Malayalam nav label ONLY (translated title,
//     never content); never "Dua 1" etc.
//   - arabic_text: complete Arabic text verbatim, every letter,
//     harakah, punctuation, paragraph, line break
//   - malayalam_meaning: faithful Malayalam translation of the
//     explanatory text (Indonesian in this book → translate to
//     Malayalam faithfully). Leave empty if no explanation exists.
//   - introduction, purpose, etiquette, conditions, preparation,
//     warnings, repetition, timing, notes: only if manuscript prints
//     these; leave empty otherwise. Never fabricate.
//   - page_number: page(s) where this section appears
//
// RULES:
//   - Never generate, invent, summarize, or paraphrase content
//   - Never auto-translate Arabic
//   - One entry per named section/wirid/hizb in manuscript order
//   - OCR confidence < 100 → needs_review = true
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Allow admin-triggered calls AND internal calls from sirrProcessNextChunk / scheduled automation (no user).
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const pdf_file_url = body.pdf_file_url;
    if (!pdf_file_url) return Response.json({ error: 'pdf_file_url is required' }, { status: 400 });
    const original_file_name = body.original_file_name || '';
    const provided_malayalam_name = body.malayalam_book_name || '';
    const existing_book_id = body.existing_book_id || '';

    // Page range for chunked processing (1-based, inclusive)
    const page_start = Number(body.page_start) || 1;
    const page_end = Number(body.page_end) || 0; // 0 = process entire PDF

    // Optional manual entry_order offset (for multi-PDF books where PDF 2
    // continues from PDF 1 but uses its own page numbers)
    const manual_order_offset = Number(body.order_offset) || 0;

    // Permanent source provenance: the originating PDF part
    const source_part_id = body.source_part_id || '';
    const source_part_number = Number(body.source_part_number) || 0;

    const now = new Date().toISOString();
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const sirr_book_id = existing_book_id || `SIRRB-${stamp}-${rand}`;

    const isChunked = page_end > 0;

    // Resolve the built-in record ID for the book (SDK update/delete use _id, not custom fields)
    let bookRecordId = '';

    if (existing_book_id) {
      const existingBooks = await sdk.entities.SirrManuscriptBook.filter({ sirr_book_id: existing_book_id }, undefined, 1);
      bookRecordId = existingBooks[0]?.id || existingBooks[0]?._id || '';
      if (!bookRecordId) return Response.json({ error: 'Book not found: ' + existing_book_id }, { status: 404 });

      if (!isChunked && manual_order_offset === 0) {
        await sdk.entities.SirrManuscriptEntry.deleteMany({ sirr_book_id: existing_book_id });
      } else if (isChunked) {
        // Only delete entries within the current chunk's order range
        const delStart = manual_order_offset > 0
          ? manual_order_offset + (page_start - 1)
          : (page_start - 1) * 100;
        const delEnd = manual_order_offset > 0
          ? manual_order_offset + page_end + 99
          : page_end * 100 + 99;
        await sdk.entities.SirrManuscriptEntry.deleteMany({
          sirr_book_id: existing_book_id,
          entry_order: { $gte: delStart, $lte: delEnd },
        });
      }
      await sdk.entities.SirrManuscriptBook.update(bookRecordId, {
        extraction_status: 'processing', extraction_error: ''
      });
    } else {
      const created = await sdk.entities.SirrManuscriptBook.create({
        sirr_book_id,
        book_title: original_file_name || 'Sirr Manuscript',
        malayalam_book_name: provided_malayalam_name,
        original_file_url: pdf_file_url,
        original_file_name,
        source: 'sirr_upload',
        upload_date: now,
        extraction_status: 'processing',
        total_pages: 0,
        total_entries: 0,
      });
      bookRecordId = created.id || created._id || '';
    }

    const pageRangeInstruction = isChunked
      ? `\n\nPAGE RANGE: Extract ONLY entries that appear on pages ${page_start} through ${page_end} of the PDF. Skip any entry that starts before page ${page_start} or after page ${page_end}. If a section spans across the boundary, include it only if it STARTS within pages ${page_start}-${page_end}. Use entry_order starting from ${page_start} (the first entry found on page ${page_start} gets entry_order ${page_start}, the next gets ${page_start+1}, etc.).`
      : '';

    const prompt = `You are a faithful manuscript archivist. You are given a PDF of an Islamic manuscript.

ABSOLUTE RULES (HIGHEST PRIORITY — never break these):
1. TRANSCRIBE, never generate. Copy text EXACTLY as printed.
2. Never invent, summarize, paraphrase, or "improve" any content.
3. Never auto-translate Arabic text. arabic_text must be verbatim from the manuscript.
4. Never fabricate introductions, benefits, warnings, or explanations.
5. Preserve every Arabic letter, every harakah (diacritic), every punctuation mark, every line break.
6. If OCR confidence is not 100% for any character, set ocr_confidence below 100. Never guess unclear text.
7. Use the REAL section title printed in the manuscript. Never use generic titles like "Dua 1" or "Section 2".

WHAT TO EXTRACT:
Extract one entry per named section, wirid, hizb, or prayer in manuscript order.
Do NOT extract pages — extract SECTIONS (named units). Each section gets one entry.
Do NOT merge sections. Do NOT split a section unless the manuscript itself separates it.${pageRangeInstruction}

FOR EACH ENTRY:
- entry_order: sequential number (1, 2, 3...) in manuscript order
- page_number: page number(s) where this section starts
- category: classify this section into ONE of: dua, dhikr, wird, hizb, amal, ruqyah, talisman, wafq, prayer, instruction, general. Use "general" only if the section gives no clue to classify it.
- heading_title_ar: the heading EXACTLY as printed in Arabic (with all harakat). Only if a heading is printed. Otherwise "".
- heading_title_ml: a SHORT Malayalam navigation label for this section (2-6 words). This is ONLY for navigation. Translate the section title into Malayalam. NEVER use generic names like "ദുആ 1" or "Prayer 1". Use the actual section name translated into Malayalam. If the section is "الصلاة العظيمة" the label is "അസ്സ്വലാത്തുൽ അദ്വീമ" or its Malayalam equivalent.
- arabic_text: the COMPLETE Arabic text of this section, verbatim. Every letter, harakah, punctuation, paragraph break. This is the most important field.
- malayalam_meaning: IF the manuscript prints explanatory text (in this book it will be in Indonesian/Malay), translate that explanation faithfully into Malayalam. Do NOT translate the Arabic duas themselves. Do NOT invent explanations. If there is no explanatory text for this section, leave empty "".
- introduction: if the manuscript prints an introduction for this section, copy it faithfully (translate from Indonesian/Malay to Malayalam if needed). Otherwise "".
- purpose: if printed in manuscript. Otherwise "".
- benefits: virtues/benefits (فضائل/keutamaan) if printed. Otherwise "".
- etiquette: etiquette/manners (آداب) if printed. Otherwise "".
- conditions: conditions (شروط) if printed. Otherwise "".
- preparation: preparation steps if printed. Otherwise "".
- materials: materials required (الآلات/perlengkapan) if printed. Otherwise "".
- warnings: if printed. Otherwise "".
- repetition: if the manuscript specifies how many times to recite (e.g. "500x", "3x"). Otherwise "".
- timing: best time if the manuscript specifies a time. Otherwise "".
- day: best day if the manuscript specifies a particular day. Otherwise "".
- notes: any other manuscript notes for this section. Otherwise "".
- ocr_confidence: 0-100. Use 100 ONLY if every character is completely certain. Lower if any character is unclear.

BOOK METADATA (extract from title pages):
- book_title: original book title as printed
- book_title_ar: Arabic title as printed
- author: if mentioned
- edition, volume, publication_year: if mentioned
- book_language: primary language (ar, id, ml, etc.)
- malayalam_book_name: Malayalam name for the book (translate title to Malayalam if no Malayalam title exists)
- total_pages: total PDF pages

Return ONLY the JSON object. No commentary.`;

    const schema = {
      type: 'object',
      properties: {
        total_pages: { type: 'integer' },
        book_title: { type: 'string' },
        book_title_ar: { type: 'string' },
        author: { type: 'string' },
        edition: { type: 'string' },
        volume: { type: 'string' },
        publication_year: { type: 'string' },
        book_language: { type: 'string' },
        malayalam_book_name: { type: 'string' },
        entries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entry_order: { type: 'integer' },
              page_number: { type: 'string' },
              category: { type: 'string' },
              heading_title_ar: { type: 'string' },
              heading_title_ml: { type: 'string' },
              arabic_text: { type: 'string' },
              malayalam_meaning: { type: 'string' },
              introduction: { type: 'string' },
              purpose: { type: 'string' },
              benefits: { type: 'string' },
              etiquette: { type: 'string' },
              conditions: { type: 'string' },
              preparation: { type: 'string' },
              materials: { type: 'string' },
              warnings: { type: 'string' },
              repetition: { type: 'string' },
              timing: { type: 'string' },
              day: { type: 'string' },
              notes: { type: 'string' },
              ocr_confidence: { type: 'integer' },
            },
            required: ['entry_order'],
          },
        },
      },
      required: ['entries'],
    };

    let extracted;
    try {
      extracted = await sdk.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [pdf_file_url],
        response_json_schema: schema,
        model: 'gemini_3_flash',
      });
    } catch (e) {
      if (bookRecordId) {
        await sdk.entities.SirrManuscriptBook.update(bookRecordId, {
          extraction_status: 'failed',
          extraction_error: String(e?.message || e),
        });
      }
      return Response.json({ error: 'Extraction failed', details: String(e?.message || e) }, { status: 500 });
    }

    let data = (extracted && typeof extracted === 'object') ? extracted : {};
    let entries = Array.isArray(data.entries) ? data.entries : [];

    // ── OCR RETRY: if any entry has low confidence, re-extract once and keep the better result ──
    const minConf = entries.length > 0 ? Math.min(...entries.map(e => Number(e.ocr_confidence) || 100)) : 100;
    if (entries.length > 0 && minConf < 100) {
      try {
        const retryExtracted = await sdk.integrations.Core.InvokeLLM({
          prompt, file_urls: [pdf_file_url], response_json_schema: schema, model: 'gemini_3_flash',
        });
        const retryData = (retryExtracted && typeof retryExtracted === 'object') ? retryExtracted : {};
        const retryEntries = Array.isArray(retryData.entries) ? retryData.entries : [];
        if (retryEntries.length > 0) {
          const retryMinConf = Math.min(...retryEntries.map(e => Number(e.ocr_confidence) || 100));
          if (retryMinConf >= minConf) {
            data = retryData;
            entries = retryEntries;
          }
        }
      } catch (_) { /* keep original extraction on retry failure */ }
    }

    const total_pages = Number(data.total_pages) || 0;
    const malayalam_book_name = provided_malayalam_name || data.malayalam_book_name || '';

    // Harakat/tatweel stripping for indexed partial Arabic search (RULES 1, 3, 4).
    const normalizeArabic = (s) => (s || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '').trim();
    const records = entries.map((e, i) => {
      const conf = Number(e.ocr_confidence);
      const ocr_confidence = Number.isFinite(conf) ? Math.max(0, Math.min(100, conf)) : 95;
      // For chunked processing, use page-range-based offset to avoid collisions.
      // Manual offset (for multi-PDF books) takes priority when provided.
      const orderOffset = manual_order_offset > 0
        ? manual_order_offset + (isChunked ? (page_start - 1) : 0)
        : (isChunked ? (page_start - 1) * 100 : 0);
      return {
        sirr_entry_id: `SIRRE-${sirr_book_id}-${orderOffset + i + 1}`,
        sirr_book_id,
        source_part_id,
        source_part_number,
        entry_order: orderOffset + (Number(e.entry_order) || (i + 1)),
        category: e.category || '',
        heading_title_ml: e.heading_title_ml || '',
        heading_title_ar: e.heading_title_ar || '',
        heading_title: '',
        arabic_text: e.arabic_text || '',
        arabic_normalized: normalizeArabic(e.arabic_text || ''),
        malayalam_meaning: e.malayalam_meaning || '',
        english_meaning: '',
        images: [],
        page_number: e.page_number ? String(e.page_number) : '',
        book_title: data.book_title || original_file_name || '',
        ocr_confidence,
        needs_review: ocr_confidence < 100,
        has_malayalam: !!(e.malayalam_meaning),
        // Store structured fields in notes as JSON for display
        notes: JSON.stringify({
          introduction: e.introduction || '',
          purpose: e.purpose || '',
          benefits: e.benefits || '',
          etiquette: e.etiquette || '',
          conditions: e.conditions || '',
          preparation: e.preparation || '',
          materials: e.materials || '',
          warnings: e.warnings || '',
          repetition: e.repetition || '',
          timing: e.timing || '',
          day: e.day || '',
          notes: e.notes || '',
        }),
      };
    });

    if (records.length > 0) {
      for (let i = 0; i < records.length; i += 100) {
        await sdk.entities.SirrManuscriptEntry.bulkCreate(records.slice(i, i + 100));
      }
    }

    const review_count = records.filter((r) => r.needs_review).length;

    // For chunked processing, count ALL entries for this book
    let allEntriesCount = records.length;
    if (isChunked) {
      const allEntries = await sdk.entities.SirrManuscriptEntry.filter({ sirr_book_id });
      allEntriesCount = allEntries.length;
    }

    const isLastChunk = isChunked && total_pages > 0 && page_end >= total_pages;
    let extraction_status;
    if (allEntriesCount === 0) extraction_status = 'failed';
    else if (!isChunked || isLastChunk) extraction_status = 'pending_verification';
    else extraction_status = 'processing';

    const bookUpdate = {
      total_pages: total_pages || (isChunked ? undefined : 0),
      total_entries: allEntriesCount,
      extraction_status,
      last_processed_page: isChunked ? page_end : (total_pages || 0),
    };

    // Only set book metadata from the first chunk or non-chunked call
    if (!isChunked || page_start === 1) {
      bookUpdate.book_title = data.book_title || original_file_name || '';
      bookUpdate.book_title_ar = data.book_title_ar || '';
      bookUpdate.author = data.author || '';
      bookUpdate.language = data.book_language || '';
      bookUpdate.edition = data.edition || '';
      bookUpdate.volume = data.volume || '';
      bookUpdate.publication_year = data.publication_year || '';
      if (malayalam_book_name) bookUpdate.malayalam_book_name = malayalam_book_name;
    }

    // Remove undefined values
    Object.keys(bookUpdate).forEach(k => bookUpdate[k] === undefined && delete bookUpdate[k]);

    await sdk.entities.SirrManuscriptBook.update(bookRecordId, bookUpdate);

    const chunkMinConf = records.length > 0
      ? Math.min(...records.map((r) => r.ocr_confidence))
      : 100;
    await sdk.entities.SirrAuditLog.create({
      audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sirr_book_id,
      part_id: source_part_id,
      part_number: source_part_number,
      action: extraction_status === 'completed' ? 'extract_complete' : 'extract_chunk',
      user_id: user?.id || 'system',
      user_name: user?.full_name || user?.email || 'system',
      timestamp: now,
      page_range: isChunked ? `${page_start}-${page_end}` : 'all',
      status: 'success',
      details: `Extracted ${records.length} entries (${review_count} flagged for review).`,
      entry_count: records.length,
      ocr_confidence_min: chunkMinConf,
    }).catch(() => {});

    return Response.json({
      sirr_book_id,
      total_entries: records.length,
      total_entries_all: allEntriesCount,
      total_pages,
      review_count,
      page_range: isChunked ? `${page_start}-${page_end}` : 'all',
      status: bookUpdate.extraction_status,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});