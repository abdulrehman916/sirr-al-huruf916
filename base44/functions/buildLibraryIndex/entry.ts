import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// buildLibraryIndex — STAGE 1 OF THE TWO-STAGE PIPELINE
//
// Fast library-wide classification. Scans EVERY verified book in
// the Master PDF Library (which already mirrors Google Drive
// live-index and OneDrive imports) and classifies each book into
// one or more modules:
//   astrology, holy_names, wafq, khawass, mujarrabat, abjad,
//   nine_mizan, general_esoteric
//
// NO knowledge cards are populated here. This stage ONLY builds a
// complete index (LibraryBookIndex) so Stage 2 can process ONLY the
// books classified as astrology — fast, safe, no missed books, no
// module mixing.
//
// Time-budgeted + resumable (skips books already indexed).
// ADMIN/OWNER ONLY.
// ═══════════════════════════════════════════════════════════════

const TIME_BUDGET_MS = 180000;
const SAMPLE_PAGES = 3;      // FAST PASS 1: first 3 pages only
const TEXT_SLICE = 300;       // tiny text sample per page (~1KB total)
const LOAD_FIRST_N = 8;       // load only first 8 pages (1 DB call)
const BOOKS_PER_CALL = 10;    // batch 10 books per LLM call (10x throughput)
const LLM_MODEL = 'gemini_3_flash';

const CLASSIFICATION_SCHEMA = {
  type: 'object',
  properties: {
    modules: {
      type: 'array',
      description: 'Modules this book contains content for. Empty array if the sampled text shows no relevant content.',
      items: { type: 'string', enum: ['astrology', 'holy_names', 'wafq', 'khawass', 'mujarrabat', 'abjad', 'nine_mizan', 'general_esoteric'] }
    },
    module_confidence: {
      type: 'object',
      description: 'Per-module confidence 0-1. Only include modules that are in the modules array.',
      additionalProperties: { type: 'number' }
    },
    classification_summary: { type: 'string', description: '1-2 sentence summary of what the book contains.' },
    table_of_contents: {
      type: 'array',
      description: 'Chapter / section headings detected on the first pages, verbatim. Empty if no headings detected.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Heading text verbatim as printed (Arabic/English).' },
          page_number: { type: 'integer', description: 'Page number where the heading appears (0 if unknown).' }
        },
        required: ['title']
      }
    },
    important_keywords: {
      type: 'array',
      description: 'Important keywords / topics detected on the first pages (Arabic + English terms). 5-15 keywords. Empty if none.',
      items: { type: 'string' }
    }
  },
  required: ['modules', 'classification_summary', 'table_of_contents', 'important_keywords']
};

const PROMPT = `You are a librarian classifying occult/esoteric manuscripts for the Sirr al-Huruf project. You are given the title, author, and a sample of OCR text from several pages of a book. Classify which modules the book contains content for.

MODULES:
- astrology: planetary hours, zodiac signs, lunar mansions, planets, weekdays, sahat/planetary hours, astrological timings, astrological correspondences, khawass of planets/celestial bodies, moon phases, zodiacal properties.
- holy_names: Divine Names (Asma al-Husna / Asma' Allah), invocations of Names, wazifas of Names, properties of specific Holy Names, Birhatiyya/esoteric Names.
- wafq: magic squares (awfaq), wafq construction, talismans, seals (khatam), numerical grids, da'irah.
- khawass: specific properties (khawass) of Quran verses, surahs, Holy Names (as a distinct topic from Holy Names invocations).
- mujarrabat: tested/efficacious practices (mujarrabat), amal, ritual procedures, ruqyah, conditions/timings for practices.
- abjad: abjad/ebced numerical calculations, letter values, numerical methods, bast al-huroof calculations.
- nine_mizan: the Nine Mizan system, ruba'i, bast huroof methods, mizaan calculation pipeline.
- general_esoteric: general occult, jinn, spirits, ruqyah not fitting other modules, dream interpretation, spiritual development, prayers/dhikr not tied to a specific module.

RULES:
1. A book may belong to MULTIPLE modules — include every module the sampled text clearly supports.
2. Only include a module if the sampled text clearly contains content for it. Do not guess from the title alone if the text contradicts.
3. module_confidence: 0-1 per included module (how confident the sampled text supports it).
4. classification_summary: 1-2 sentences describing the book's actual content.
5. table_of_contents: list every chapter / section heading you can detect on the sampled first pages, verbatim (Arabic or English as printed). Include the page_number where the heading appears (from the sampled pages). Empty array if the first pages have no headings.
6. important_keywords: 5-15 important keywords / topics from the first pages (Arabic terms preserved verbatim, plus English equivalents if present). These help fast module filtering.

Return ONLY the JSON object { modules, module_confidence, classification_summary, table_of_contents, important_keywords }. No commentary.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return Response.json({ error: 'Admin/Owner only' }, { status: 403 });
    }
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const checkpointOnly = body && body.mode === 'checkpoint';
    const reportOnly = body && body.mode === 'report';
    const forceReclassify = !!(body && body.mode === 'reclassify');
    const started = Date.now();

    // ── Load all verified Master Library books ──
    const books = await loadAllBooks(sdk);

    // ── Load existing index ──
    const existingIndex = await loadAllIndex(sdk);
    const indexedMap = new Map(existingIndex.map(i => [i.source_book_id, i]));

    if (checkpointOnly) {
      const astroBooks = existingIndex.filter(i => (i.modules || []).includes('astrology'));
      return Response.json({
        status: 'checkpoint',
        totalBooks: books.length,
        booksIndexed: existingIndex.length,
        booksRemaining: books.length - existingIndex.length,
        astrologyBooks: astroBooks.length,
        moduleBreakdown: moduleBreakdown(existingIndex),
      });
    }

    if (reportOnly) {
      return Response.json({
        status: 'report',
        totalBooks: books.length,
        booksIndexed: existingIndex.length,
        coverageComplete: existingIndex.length >= books.length,
        moduleBreakdown: moduleBreakdown(existingIndex),
        astrologyBooks: existingIndex.filter(i => (i.modules || []).includes('astrology')).map(i => ({
          book_id: i.source_book_id, title: i.book_title, modules: i.modules,
          extraction_status: i.astrology_extraction_status,
        })),
      });
    }

    // ── Determine remaining books to classify ──
    // Skip 'classified' and 'not_applicable'. RETRY 'failed' books with the faster approach.
    const remaining = forceReclassify
      ? books
      : books.filter(b => {
          const idx = indexedMap.get(b.master_book_id);
          if (!idx) return true;                       // never indexed
          if (idx.classification_status === 'failed') return true;  // retry failed
          return false;                                // classified / not_applicable -> skip
        });

    const stats = { classified: 0, failed: 0, skipped: 0, batchesRun: 0 };

    // ── BATCH MODE: classify BOOKS_PER_CALL books in one LLM call ──
    for (let bi = 0; bi < remaining.length; bi += BOOKS_PER_CALL) {
      if (Date.now() - started > TIME_BUDGET_MS - 20000) break;
      const batch = remaining.slice(bi, bi + BOOKS_PER_CALL);

      // Pre-fetch first pages for each book in the batch (parallel)
      const bookPreviews = [];
      await Promise.all(batch.map(async (book) => {
        const bookId = book.master_book_id;
        let pages = await sdk.entities.MasterPdfPage.filter({ master_book_id: bookId }, 'page_number', LOAD_FIRST_N, 0).catch(() => []);
        if (!pages) pages = [];
        const textPages = pages.filter(p => (p.ocr_text || p.arabic_text || p.ocr_text_ar || '').trim().length > 0);
        const sample = samplePages(textPages, SAMPLE_PAGES);
        const textBlock = sample.map(p => String(p.ocr_text || p.arabic_text || p.ocr_text_ar || '').slice(0, TEXT_SLICE)).join('\n');
        // First-pages summary: longer concatenation of the first 2-3 pages (capped 2000 chars) for the index record
        const firstPagesSummary = sample.map(p => String(p.ocr_text || p.arabic_text || p.ocr_text_ar || '')).join('\n').slice(0, 2000);
        bookPreviews.push({
          book,
          hasText: sample.length > 0,
          samplePages: sample.map(p => p.page_number).join(','),
          textBlock: textBlock.slice(0, 1000),
          firstPagesSummary,
          folderPath: deriveFolderPath(book),
        });
      }));

      // Separate: books with no OCR text → mark not_applicable immediately (no LLM)
      const withText = [];
      for (const pv of bookPreviews) {
        if (!pv.hasText) {
          await upsertIndex(sdk, indexedMap, pv.book, [], {}, 'Book has no OCR text to sample.', 'none', 'not_applicable', [], pv.firstPagesSummary, pv.folderPath);
          stats.skipped++;
        } else {
          withText.push(pv);
        }
      }

      if (withText.length === 0) { stats.batchesRun++; continue; }

      // Build ONE batch prompt
      const batchSchema = {
        type: 'object',
        properties: {
          results: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                book_index: { type: 'integer', description: 'The 1-based index of the book in the batch.' },
                modules: { type: 'array', items: { type: 'string', enum: ['astrology', 'holy_names', 'wafq', 'khawass', 'mujarrabat', 'abjad', 'nine_mizan', 'general_esoteric'] } },
                module_confidence: { type: 'object', additionalProperties: { type: 'number' } },
                classification_summary: { type: 'string' },
                table_of_contents: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, page_number: { type: 'integer' } }, required: ['title'] } },
                important_keywords: { type: 'array', items: { type: 'string' } },
              },
              required: ['book_index', 'modules', 'classification_summary', 'table_of_contents', 'important_keywords'],
            },
          },
        },
        required: ['results'],
      };

      const booksBlock = withText.map((pv, i) => {
        return `=== BOOK ${i + 1} ===\nTitle: ${pv.book.book_title || ''}\nAuthor: ${pv.book.author || ''}\nSource: ${pv.book.import_source || ''}\n--- FIRST PAGES ---\n${pv.textBlock}`;
      }).join('\n\n');
      const BATCH_PROMPT_SUFFIX = `\n\nFor EACH book, also extract:\n- table_of_contents: every chapter/section heading visible on the first pages, verbatim, with page_number\n- important_keywords: 5-15 key terms (Arabic preserved verbatim + English if present)\nReturn each book's full result in the results array.`;

      let result = null;
      try {
        result = await sdk.integrations.Core.InvokeLLM({
          prompt: PROMPT + '\n\nYou are classifying ' + withText.length + ' books at once. For EACH book, return its classification in the results array with the matching book_index.' + BATCH_PROMPT_SUFFIX + '\n\n' + booksBlock,
          response_json_schema: batchSchema,
          model: LLM_MODEL,
        });
      } catch (_) {
        // Whole batch failed — mark each as failed
        for (const pv of withText) {
          await upsertIndex(sdk, indexedMap, pv.book, [], {}, 'LLM batch classification call failed.', pv.samplePages, 'failed');
          stats.failed++;
        }
        stats.batchesRun++;
        continue;
      }

      const results = (result && Array.isArray(result.results)) ? result.results : [];
      const byIndex = new Map(results.map(r => [Number(r.book_index), r]));
      for (let i = 0; i < withText.length; i++) {
        const pv = withText[i];
        const r = byIndex.get(i + 1);
        if (!r) {
          await upsertIndex(sdk, indexedMap, pv.book, [], {}, 'No classification returned for this book in batch.', pv.samplePages, 'failed');
          stats.failed++;
          continue;
        }
        const modules = Array.isArray(r.modules) ? r.modules.filter(m => typeof m === 'string') : [];
        const summary = String(r.classification_summary || '').slice(0, 1000);
        const confidence = (r.module_confidence && typeof r.module_confidence === 'object') ? r.module_confidence : {};
        const toc = Array.isArray(r.table_of_contents)
          ? r.table_of_contents.filter(t => t && t.title).map(t => ({ title: String(t.title).slice(0, 300), page_number: Number(t.page_number) || 0 }))
          : [];
        const keywords = Array.isArray(r.important_keywords) ? r.important_keywords.map(k => String(k || '')).filter(Boolean).slice(0, 20) : [];
        await upsertIndex(sdk, indexedMap, pv.book, modules, confidence, summary, pv.samplePages, 'classified', toc, pv.firstPagesSummary, pv.folderPath, keywords);
        stats.classified++;
      }
      stats.batchesRun++;
    }

    const totalIndexed = existingIndex.length + stats.classified;
    return Response.json({
      status: 'in_progress',
      totalBooks: books.length,
      booksIndexed: totalIndexed,
      booksRemaining: books.length - totalIndexed,
      classifiedThisRun: stats.classified,
      failedThisRun: stats.failed,
      skippedThisRun: stats.skipped,
      moduleBreakdown: moduleBreakdown([...existingIndex, ...recentlyClassified(remaining, indexedMap)]),
      reRunNeeded: totalIndexed < books.length,
      timeMs: Date.now() - started,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ── Helpers ────────────────────────────────────────────────────
async function loadAllBooks(sdk) {
  const all = [];
  let skip = 0;
  while (all.length < 2000) {
    const batch = await sdk.entities.MasterPdfBook.filter(
      { extraction_status: { $in: ['pending_verification', 'completed'] } },
      'upload_date', 500, skip
    ).catch(() => []);
    if (!batch || batch.length === 0) break;
    all.push(...batch); skip += batch.length;
    if (batch.length < 500) break;
  }
  return all;
}

async function loadAllIndex(sdk) {
  const all = [];
  let skip = 0;
  while (all.length < 2000) {
    const batch = await sdk.entities.LibraryBookIndex.list('-indexed_at', 500, skip).catch(() => []);
    if (!batch || batch.length === 0) break;
    all.push(...batch); skip += batch.length;
    if (batch.length < 500) break;
  }
  return all;
}

function samplePages(pages, n) {
  if (pages.length <= n) return pages;
  const sorted = [...pages].sort((a, b) => a.page_number - b.page_number);
  const out = [];
  // first few + evenly spread
  const headCount = Math.min(3, n);
  for (let i = 0; i < headCount; i++) out.push(sorted[i]);
  const rest = sorted.slice(headCount);
  const restNeeded = n - headCount;
  if (rest.length > 0 && restNeeded > 0) {
    const step = Math.max(1, Math.floor(rest.length / restNeeded));
    for (let i = 0; i < rest.length && out.length < n; i += step) out.push(rest[i]);
  }
  // dedup by page_number
  const seen = new Set();
  return out.filter(p => (p.page_number != null && !seen.has(p.page_number) && seen.add(p.page_number)));
}

async function upsertIndex(sdk, indexedMap, book, modules, confidence, summary, basis, status, toc, firstPagesSummary, folderPath, keywords) {
  const bookId = book.master_book_id;
  const indexId = `LBI-ML-${bookId}`;
  const existing = indexedMap.get(bookId);
  const payload = {
    source: 'master_library',
    source_book_id: bookId,
    book_title: book.book_title || '',
    author: book.author || '',
    import_source: book.import_source || '',
    folder_path: folderPath || '',
    combined_total_pages: book.combined_total_pages || 0,
    modules,
    module_confidence: confidence,
    classification_summary: summary,
    classification_basis: `Sampled pages: ${basis}`,
    classification_status: status,
    indexed_at: new Date().toISOString(),
    table_of_contents: Array.isArray(toc) ? toc : [],
    first_pages_summary: firstPagesSummary || '',
    important_keywords: Array.isArray(keywords) ? keywords : [],
    astrology_extraction_status: modules.includes('astrology') ? 'pending' : 'skipped',
  };
  try {
    if (existing) {
      await sdk.entities.LibraryBookIndex.update(existing.id || existing._id, payload);
      indexedMap.set(bookId, { ...payload, index_id: indexId, id: existing.id });
    } else {
      await sdk.entities.LibraryBookIndex.create({ index_id: indexId, ...payload });
      indexedMap.set(bookId, { ...payload, index_id: indexId });
    }
  } catch (_) {}
}

function moduleBreakdown(indexRecords) {
  const counts = {};
  for (const i of indexRecords) {
    for (const m of (i.modules || [])) counts[m] = (counts[m] || 0) + 1;
  }
  return counts;
}

function recentlyClassified(remaining, indexedMap) {
  // Returns the freshly classified records that are now in indexedMap
  return remaining.map(b => indexedMap.get(b.master_book_id)).filter(Boolean);
}

function deriveFolderPath(book) {
  // Derive the original folder/location from MasterPdfBook provenance fields.
  if (book.onedrive_file_path) {
    const parts = String(book.onedrive_file_path).split('/');
    parts.pop();
    return parts.join('/');
  }
  if (book.google_drive_parent_id) return `gdrive_folder:${book.google_drive_parent_id}`;
  if (book.adobe_file_path) {
    const parts = String(book.adobe_file_path).split('/');
    parts.pop();
    return parts.join('/');
  }
  return '';
}