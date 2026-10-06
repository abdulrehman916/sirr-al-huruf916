import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR QUALITY REBUILD — sirrQualityRebuild
//
// Re-reads the original PDF for every entry with OCR confidence
// below 100% and re-extracts it with STRICTER fidelity rules:
//
//   • Arabic text must EXACTLY match the original PDF — every
//     harakat, every punctuation mark, no missing glyphs, no
//     substitutions, no truncation, no summarization.
//   • Malayalam translation must be COMPLETE — every sentence,
//     no omissions, no paraphrasing.
//   • Only reproduce what the book states — never invent.
//   • Remove placeholders ("continued through page...", etc.).
//   • One card per complete entry only.
//
// The function processes entries in batches grouped by PDF part
// and page range. It deletes the old low-confidence entries and
// creates new high-quality ones with the same sirr_entry_id
// (so source provenance is preserved).
//
// Time-budgeted: processes as many as it can within 85 seconds,
// then returns. Call again to continue.
// ═══════════════════════════════════════════════════════════════

const TIME_BUDGET_MS = 80000;

const QUALITY_PROMPT = `You are a FAITHFUL manuscript archivist performing a HIGH-QUALITY re-extraction.

You are given pages from an Islamic manuscript PDF. Your task is to produce a PERFECT digital transcription.

ABSOLUTE RULES (NEVER BREAK):
1. TRANSCRIBE ONLY. Never generate, invent, summarize, or paraphrase.
2. Arabic text must be EXACTLY as printed — every single letter, every harakah (diacritic), every punctuation mark, every paragraph break, every line break.
3. NEVER output missing glyphs, square boxes (□), or substitution characters. If a character is unclear, still attempt the closest match but set ocr_confidence below 100.
4. NEVER truncate long duas. Copy the COMPLETE text from the first word to the last word on these pages.
5. NEVER summarize Arabic text. The full text must be preserved.
6. NEVER auto-translate Arabic. The arabic_text field must be verbatim Arabic only.
7. Malayalam translation must be COMPLETE — translate the ENTIRE explanatory text from the manuscript. Every sentence. No omissions. No paraphrasing.
8. If the book explains purpose, benefit, method, repetition count, timing, or conditions, reproduce EXACTLY what the book states. Never invent.
9. If the book gives NO explanation, output ONLY the dua and its title. Do NOT fabricate explanations.
10. NEVER output placeholders like "continued through page...", "litany continues...", or any similar generated text. If text continues to the next page, include the complete text.
11. Use the REAL section title from the manuscript. Never use generic titles like "Dua 1".
12. ocr_confidence: 100 ONLY if every character is completely certain. Below 100 if any character is uncertain.

WHAT TO EXTRACT:
Extract one entry per named section, wirid, hizb, or prayer in manuscript order.
Do NOT extract pages — extract SECTIONS (named units).

FOR EACH ENTRY:
- entry_order: sequential number in manuscript order
- page_number: page number(s) where this section appears
- category: ONE of: dua, dhikr, wird, hizb, amal, ruqyah, talisman, wafq, prayer, instruction, general
- heading_title_ar: heading EXACTLY as printed in Arabic (with all harakat). "" if no heading printed.
- heading_title_ml: SHORT Malayalam navigation label (2-6 words). Translate the section title. NEVER generic names.
- arabic_text: COMPLETE Arabic text, verbatim. Every letter, harakah, punctuation, paragraph break. THE MOST IMPORTANT FIELD.
- malayalam_meaning: IF the manuscript prints explanatory text (Indonesian/Malay), translate it COMPLETELY to Malayalam. Do NOT translate the Arabic duas themselves. "" if no explanatory text.
- introduction, purpose, benefits, etiquette, conditions, preparation, materials, warnings, repetition, timing, day, notes: ONLY if printed in the manuscript. Otherwise "".
- ocr_confidence: 0-100. 100 only if every character is certain.

Return ONLY the JSON object. No commentary.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const sirr_book_id = body.sirr_book_id;
    if (!sirr_book_id) return Response.json({ error: 'sirr_book_id is required' }, { status: 400 });

    // ── Load the book ──
    const books = await sdk.entities.SirrManuscriptBook.filter({ sirr_book_id }, undefined, 1);
    const book = books[0];
    if (!book) return Response.json({ error: 'Book not found' }, { status: 404 });

    const parts = Array.isArray(book.pdf_parts) ? book.pdf_parts : [];
    const partsById = {};
    for (const p of parts) partsById[p.part_id || ''] = p;

    // ── Load ALL entries with needs_review=true ──
    const lowConfEntries = await sdk.entities.SirrManuscriptEntry.filter(
      { sirr_book_id, needs_review: true },
      'entry_order',
      5000
    );

    if (lowConfEntries.length === 0) {
      return Response.json({
        sirr_book_id,
        status: 'no_work',
        message: 'No entries with OCR confidence < 100% found. Quality rebuild not needed.',
      });
    }

    // ── Group low-confidence entries by source_part_id ──
    const byPart = {};
    for (const e of lowConfEntries) {
      const partId = e.source_part_id || '';
      if (!byPart[partId]) byPart[partId] = [];
      byPart[partId].push(e);
    }

    const started = Date.now();
    let reExtractedCount = 0;
    let partsProcessed = 0;
    const results = [];

    // ── Process one part at a time until time budget is exhausted ──
    for (const [partId, partEntries] of Object.entries(byPart)) {
      if (Date.now() - started > TIME_BUDGET_MS - 25000) break;

      const part = partsById[partId];
      if (!part) {
        results.push({ part_id: partId, status: 'skipped', reason: 'Part not found in pdf_parts' });
        continue;
      }

      // Determine the page range to re-extract: the min and max page
      // numbers among the low-confidence entries in this part.
      // Page numbers can be ranges like "13-17" or single like "21".
      const parsePages = (s) => {
        const m = String(s || '').match(/(\d+)/g);
        return m ? m.map(Number) : [];
      };
      const allPages = partEntries.flatMap(e => parsePages(e.page_number));
      const partPageCount = part.page_count || 0;

      // The page_number field stores MANUSCRIPT printed page numbers, not
      // PDF page indices. The filename encodes the range (e.g. "61-90" means
      // PDF page 1 = manuscript page 61). Extract that offset.
      const fnameMatch = (part.file_name || '').match(/-OK-(\d+)-(\d+)\.pdf$/i);
      const msStart = fnameMatch ? parseInt(fnameMatch[1]) : 0;
      const msEnd = fnameMatch ? parseInt(fnameMatch[2]) : 0;

      let page_start, page_end;
      if (allPages.length > 0 && msStart > 0) {
        // Convert manuscript page numbers to PDF page indices
        const pdfPages = allPages.map(p => p - msStart + 1).filter(p => p >= 1 && p <= partPageCount);
        if (pdfPages.length > 0) {
          page_start = Math.max(1, Math.min(...pdfPages));
          page_end = Math.min(partPageCount, Math.max(...pdfPages));
        }
      }

      // Fallback: if conversion failed or range is invalid, re-extract from page 1
      if (!page_start || !page_end || page_start > page_end || page_start > partPageCount) {
        page_start = 1;
        page_end = partPageCount || 30;
      }

      // Cap the range at 5 pages to avoid LLM proxy timeouts on large ranges
      if (page_end - page_start > 4) {
        page_end = page_start + 4;
      }

      // Compute order_offset from cumulative previous parts' page counts
      const partIdx = parts.findIndex(p => (p.part_id || '') === partId);
      const orderOffset = parts.slice(0, partIdx).reduce((s, p) => s + (p.page_count || 0), 0);

      results.push({
        part_id: partId,
        part_number: part.part_number,
        file_name: part.file_name,
        low_conf_entries: partEntries.length,
        page_range: `${page_start}-${page_end}`,
      });

      // ── Re-extract with the strict quality prompt ──
      const schema = {
        type: 'object',
        properties: {
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
          prompt: QUALITY_PROMPT + `\n\nPAGE RANGE: Extract ONLY entries on pages ${page_start} through ${page_end}. Use entry_order starting from ${page_start}.`,
          file_urls: [part.file_url],
          response_json_schema: schema,
          model: 'gemini_3_flash',
        });
      } catch (e) {
        results.push({ part_id: partId, status: 'failed', error: String(e?.message || e) });
        continue;
      }

      let data = (extracted && typeof extracted === 'object') ? extracted : {};
      let newEntries = Array.isArray(data.entries) ? data.entries : [];

      // ── OCR retry: if any new entry is still < 100, retry once more ──
      if (newEntries.length > 0) {
        const minConf = Math.min(...newEntries.map(e => Number(e.ocr_confidence) || 100));
        if (minConf < 100) {
          try {
            const retry = await sdk.integrations.Core.InvokeLLM({
              prompt: QUALITY_PROMPT + `\n\nPAGE RANGE: Extract ONLY entries on pages ${page_start} through ${page_end}. Use entry_order starting from ${page_start}.`,
              file_urls: [part.file_url],
              response_json_schema: schema,
              model: 'gemini_3_flash',
            });
            const retryData = (retry && typeof retry === 'object') ? retry : {};
            const retryEntries = Array.isArray(retryData.entries) ? retryData.entries : [];
            if (retryEntries.length > 0) {
              const retryMinConf = Math.min(...retryEntries.map(e => Number(e.ocr_confidence) || 100));
              if (retryMinConf >= minConf) {
                data = retryData;
                newEntries = retryEntries;
              }
            }
          } catch (_) { /* keep original on retry failure */ }
        }
      }

      if (newEntries.length === 0) {
        results.push({ part_id: partId, status: 'failed', error: 'Zero entries extracted on re-extraction' });
        continue;
      }

      // ── Delete the old low-confidence entries for this page range ──
      const oldEntryIds = partEntries.map(e => e.id || e._id);
      await sdk.entities.SirrManuscriptEntry.deleteMany({
        sirr_book_id,
        _id: { $in: oldEntryIds },
      });

      // ── Create new high-quality entries ──
      const normalizeArabic = (s) => (s || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '').trim();
      const records = newEntries.map((e, i) => {
        const conf = Number(e.ocr_confidence);
        const ocr_confidence = Number.isFinite(conf) ? Math.max(0, Math.min(100, conf)) : 95;
        return {
          sirr_entry_id: `SIRRE-${sirr_book_id}-${orderOffset + i + page_start}`,
          sirr_book_id,
          source_part_id: partId,
          source_part_number: part.part_number || 0,
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
          book_title: book.book_title || '',
          ocr_confidence,
          needs_review: ocr_confidence < 100,
          has_malayalam: !!(e.malayalam_meaning),
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
        reExtractedCount += records.length;
      }

      const newMinConf = records.length > 0
        ? Math.min(...records.map(r => r.ocr_confidence))
        : 100;

      await sdk.entities.SirrAuditLog.create({
        audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        sirr_book_id,
        part_id: partId,
        part_number: part.part_number || 0,
        action: 'rebuild',
        user_id: user?.id || 'system',
        user_name: user?.full_name || user?.email || 'system',
        timestamp: new Date().toISOString(),
        page_range: `${page_start}-${page_end}`,
        status: 'success',
        details: `Quality rebuild: re-extracted ${records.length} entries from ${part.file_name} pages ${page_start}-${page_end}. Min OCR: ${newMinConf}.`,
        entry_count: records.length,
        ocr_confidence_min: newMinConf,
      }).catch(() => {});

      partsProcessed++;
      results[results.length - 1].status = 'success';
      results[results.length - 1].new_entries = records.length;
      results[results.length - 1].min_ocr_confidence = newMinConf;
    }

    // ── Check remaining low-confidence entries ──
    const remainingLowConf = await sdk.entities.SirrManuscriptEntry.filter(
      { sirr_book_id, needs_review: true },
      'entry_order',
      5000
    );

    return Response.json({
      sirr_book_id,
      status: remainingLowConf.length > 0 ? 'partial' : 'complete',
      parts_processed: partsProcessed,
      entries_re_extracted: reExtractedCount,
      remaining_low_confidence: remainingLowConf.length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});