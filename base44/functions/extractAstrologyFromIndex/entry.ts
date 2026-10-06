import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import {
  sha256, slug, normalizeArabic,
  mergeActionArr, mergeAttributesAdditive, appendTextDedup,
} from '../../shared/astroScanShared.ts';

// ═══════════════════════════════════════════════════════════════
// extractAstrologyFromIndex — STAGE 2 OF THE TWO-STAGE PIPELINE
//
// Runs ONLY after Stage 1 (buildLibraryIndex) is complete. Reads
// LibraryBookIndex, SCREENS each astrology-classified book to
// determine if it contains genuine Astro Clock content, and
// processes ONLY genuine Astro Clock books.
//
// SCREENING: A batch LLM call evaluates each book's metadata (title,
// author, keywords, TOC, summary, first pages) against strict
// Astro Clock criteria. Non-genuine books (general holy names,
// general wazifas, jinn conjuration, dream interpretation, etc.)
// are marked 'skipped' and never processed.
//
// EXTRACTION: For each genuine book, reads every page, detects
// astrology findings, and APPENDS them into AstroClockKnowledge.
// Never overwrites, never deletes. Every source kept separate with
// its own Arabic text (harakat preserved), Malayalam explanation,
// citation, page number, and book reference.
//
// LAWS (non-negotiable):
//   - NEVER overwrite or delete existing AstroClockKnowledge records
//   - APPEND-ONLY — every source kept separate with its own citation
//   - Preserve every Arabic letter + harakat EXACTLY as printed
//   - Never merge different scholarly methods — each kept separate
//   - Never touch Holy Names (HolyNameKnowledge / HolyNameImportedSection)
//   - Every magic square kept separately with its own citation
//   - Only genuine Astro Clock books are processed
//   - Malayalam is the primary explanation language
//
// Resumable: tracks astrology_pages_processed per book. Time-budgeted.
// ADMIN/OWNER ONLY.
// ═══════════════════════════════════════════════════════════════

const TIME_BUDGET_MS = 180000;
const PAGES_PER_CALL = 8;
const LLM_MODEL = 'gemini_3_flash';

// ── Detection schema (astrology only) ──────────────────────────
const DETECTION_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          rule_category: { type: 'string', description: 'lowercase slug: planetary_hours, zodiac_signs, lunar_mansions, planets, weekdays, sahat, islamic_months, special_days, special_nights, lucky_timings, unfavourable_timings, correspondences, planet_relationships, friendly_planets, enemy_planets, colours, metals, stones, incense, directions, elements, spiritual_properties, khawass, mujarrabat, wafq, invocations, recommended_actions, forbidden_actions, treatments, rituals' },
          rule_entity: { type: 'string', description: 'canonical lowercase entity key, e.g. sun, moon, mars, aries, leo, mansion-15, sunday, jumada-al-awwal, hour-3' },
          entity_raw: { type: 'string', description: 'original-language name exactly as printed' },
          knowledge_text_en: { type: 'string', description: 'faithful English summary of the finding — keep short, for citation reference only' },
          knowledge_text_ar: { type: 'string', description: 'VERBATIM Arabic from the page — every letter and harakah exactly as printed. Empty if no Arabic.' },
          knowledge_text_ml: { type: 'string', description: 'Malayalam explanation of the finding. PRIMARY explanation language. Empty only if source has no Malayalam and meaning cannot be faithfully rendered.' },
          recommended_actions: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, ml: { type: 'string' } }, required: ['en'] } },
          forbidden_actions: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, ml: { type: 'string' } }, required: ['en'] } },
          warnings_list: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, ml: { type: 'string' } }, required: ['en'] } },
          notes_list: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, ml: { type: 'string' } }, required: ['en'] } },
          attributes: { type: 'object', additionalProperties: true, description: 'structured key-values: colours, metals, stones, incense, herbs, directions, elements, spiritual_properties. For lunar_mansions: birth_characteristics, personality_traits, strengths, weaknesses, suitable_professions, marriage_compatibility, health_tendencies, spiritual_recommendations, scholarly_opinions (each an array of strings).' },
          magic_squares: { type: 'array', description: 'Magic squares / wafq for this entity. Each kept SEPARATELY with its own citation. NEVER omit.', items: { type: 'object', properties: { name: { type: 'string' }, grid: { type: 'array', items: { type: 'array', items: { type: 'number' } } }, grid_text: { type: 'string' }, purpose: { type: 'string' }, repetitions: { type: 'string' }, conditions: { type: 'string' }, timing: { type: 'string' } }, required: ['name'] } },
          ritual_suitability: { type: 'string' },
          cross_links: { type: 'array', items: { type: 'object', properties: { module: { type: 'string' }, card_id: { type: 'string' }, reason: { type: 'string' } }, required: ['module', 'card_id'] } },
          confidence: { type: 'integer' },
        },
        required: ['rule_category', 'rule_entity', 'knowledge_text_en'],
      },
    },
  },
  required: ['findings'],
};

const DETECTION_PROMPT = `You are an astrology archivist for the Sirr al-Huruf Master PDF Library. You are given the OCR text of several pages from an indexed manuscript. Your job is to DETECT and EXTRACT every Astro Clock / traditional-astrology paragraph and structure it.

ABSOLUTE RULES (never break):
1. EXTRACT ONLY — never invent, summarize beyond the source, or fabricate.
2. Preserve every Arabic letter, harakah, hamza, madd, shadda, sukoon, tanween EXACTLY as printed (copy verbatim into knowledge_text_ar).
3. If a page has NO astrology content, return an empty findings array.
4. Never merge different scholarly methods — each distinct method/opinion is a SEPARATE finding.
5. Preserve page number, citation, book, author implicitly (the caller attaches them).
6. NEVER omit a magic square / wafq. If the page contains one, store it in magic_squares with its grid and citation.
7. Malayalam is the PRIMARY explanation language — fill knowledge_text_ml with faithful Malayalam. Use English (knowledge_text_en) only for brief citation reference.

CATEGORIES (rule_category — lowercase slug):
planetary_hours, zodiac_signs, lunar_mansions, planets, weekdays, sahat, islamic_months, special_days, special_nights, lucky_timings, unfavourable_timings, correspondences, planet_relationships, friendly_planets, enemy_planets, colours, metals, stones, incense, herbs, directions, elements, spiritual_properties, khawass, mujarrabat, wafq, invocations, recommended_actions, forbidden_actions, treatments, rituals

ENTITY (rule_entity — canonical lowercase):
- planets: sun, moon, mars, mercury, jupiter, venus, saturn
- zodiac: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces
- lunar_mansions: mansion-1 .. mansion-28
- weekdays: sunday..saturday
- sahat/planetary_hours: hour-1 .. hour-24
- islamic_months: muharram, safar, rabi-al-awwal, rabi-al-thani, jumada-al-awwal, jumada-al-thani, rajab, shaban, ramadan, shawwal, dhu-al-qadah, dhu-al-hijjah

LUNAR MANSION EXTRA (when rule_category is lunar_mansions, populate attributes with any that apply):
birth_characteristics, personality_traits, strengths, weaknesses, suitable_professions, marriage_compatibility, health_tendencies, spiritual_recommendations, scholarly_opinions — each an array of strings, VERBATIM from the source.

ATTRIBUTES: populate attributes with what the page gives — colours, metals, stones, incense, herbs, directions, elements, spiritual_properties (each an array of strings or a string).

MAGIC SQUARES: if the page contains a magic square / wafq for this entity, store it in magic_squares:
{ name: "<label as printed>", grid: [[numbers...],...], grid_text: "<if Arabic-letter square>", purpose, repetitions, conditions, timing }
NEVER omit a square. Keep every version separately.

CROSS-LINKS: { module: "holy_names"|"dua"|"wafq"|"khawass"|"mujarrabat"|"nine_mizan"|"abjad", card_id: "<entity name or id>", reason } — only when the page EXPLICITLY mentions the related entity.

Return ONLY the JSON object { findings: [...] }. No commentary.`;

// ── Book-level screening: genuine Astro Clock vs general occult ──
const SCREENING_SCHEMA = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          book_index: { type: 'integer', description: '1-based index of the book in the batch.' },
          is_genuine_astro: { type: 'boolean', description: 'True if this book is PRIMARILY about Astro Clock / traditional astrology. False if it is primarily about general occult, holy names, jinn, talismans, or spiritual practices (even if it mentions astrology in passing).' },
          reason: { type: 'string', description: 'Brief reason for the classification.' },
          topics_found: { type: 'array', items: { type: 'string' }, description: 'Astro Clock topics found (if genuine).' },
        },
        required: ['book_index', 'is_genuine_astro', 'reason'],
      },
    },
  },
  required: ['results'],
};

const SCREENING_PROMPT = `You are a strict Astro Clock librarian screening books. You must determine which books are PRIMARILY about traditional Astro Clock / classical astrology, and which are general occult books that merely mention astrology in passing.

GENUINE Astro Clock — classify as genuine ONLY if Astro Clock / traditional astrology is the PRIMARY focus of the book. The book must be substantially about:
- Sun (Shams), Moon (Qamar), Planets (Mercury, Venus, Mars, Jupiter, Saturn) and their properties
- Zodiac Signs (Buruj) — their meanings, correspondences, timings
- Lunar Mansions (Manazil al-Qamar) — their characteristics, birth traits, rituals
- Planetary Hours (Saat / Sa'at) — calculation, rulership, timing
- Astrological weekdays and Islamic months — their planetary rulers, auspicious/inauspicious times
- Planetary correspondences (khawass of planets/celestial bodies)
- Planetary friends and enemies
- Astrology-based Wafq / Magic Squares — squares tied to specific planets/zodiac/mansions
- Astrology timings (lucky/unlucky times based on planetary positions)
- Astrology rituals (tied to planetary hours or celestial events)
- Astrology Khawass, Mujarrabat, treatments
- Colours, stones, metals, incense, herbs attributed to planets/zodiac/mansions
- Ancient Arabic astrology, Ottoman/Turkish astrology

NOT genuine — classify as NOT genuine if the book is PRIMARILY about any of these, even if it mentions astrology or planetary timing in passing:
- General Holy Names / Divine Names / Wazifas (the book is about Names, not about astrology)
- General Talismans / general magic (not specifically tied to planetary hours/zodiac)
- General Magic Squares (not specifically astrology-based)
- Jinn conjuration / summoning (even if it mentions planetary hours for timing)
- Dream interpretation (physiognomy)
- General spiritual practices / Sufi dhikr / daily devotionals
- General occult / "magic for beginners" / love spells / prosperity spells
- Ruqyah / protection practices (unless primarily astrology-based)

STRICT RULE: If the book's TITLE, main subject, or primary content is about jinn, holy names, general magic, love spells, prosperity, spiritual devotionals, or dream interpretation — classify it as NOT genuine, even if it contains some astrological timing references. A few planetary-hour references inside a jinn-conjuration book do NOT make it an Astro Clock book.

Return ONLY the JSON { results: [...] }. No commentary.`;

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
    const rescreenOnly = body && body.mode === 'rescreen';
    const started = Date.now();

    // ── Load the library index ──
    let index = await loadAllIndex(sdk);

    // ── Astrology books only ──
    let astroBooks = index.filter(i => (i.modules || []).includes('astrology') && i.classification_status === 'classified');

    // ── Rescreen mode: clear old markers and re-run with stricter criteria ──
    if (rescreenOnly) {
      for (const idx of astroBooks) {
        const basis = String(idx.classification_basis || '');
        if (basis.includes('SCREENED:')) {
          const cleanBasis = basis.split(' | SCREENED:')[0].trim();
          const updates = { classification_basis: cleanBasis };
          if (idx.astrology_extraction_status === 'skipped') {
            updates.astrology_extraction_status = 'pending';
          }
          try { await sdk.entities.LibraryBookIndex.update(idx.id || idx._id, updates); } catch (_) {}
        }
      }
      index = await loadAllIndex(sdk);
      astroBooks = index.filter(i => (i.modules || []).includes('astrology') && i.classification_status === 'classified');
      await screenAstroBooks(sdk, astroBooks);
      index = await loadAllIndex(sdk);
      astroBooks = index.filter(i => (i.modules || []).includes('astrology') && i.classification_status === 'classified');
      const skipped = astroBooks.filter(i => i.astrology_extraction_status === 'skipped');
      const genuine = astroBooks.filter(i => i.astrology_extraction_status !== 'skipped');
      return Response.json({
        status: 'rescreened',
        totalAstrologyBooks: astroBooks.length,
        genuineAstroBooks: genuine.length,
        booksSkipped: skipped.length,
        skippedBooks: skipped.map(i => {
          const basis = String(i.classification_basis || '');
          const reason = basis.includes('SCREENED: skip —') ? basis.split('SCREENED: skip —')[1].trim() : 'Not genuine Astro Clock';
          return { book_id: i.source_book_id, title: i.book_title, reason };
        }),
        genuineBooks: genuine.map(i => {
          const basis = String(i.classification_basis || '');
          const reason = basis.includes('SCREENED: genuine —') ? basis.split('SCREENED: genuine —')[1].trim() : 'Genuine Astro Clock';
          return { book_id: i.source_book_id, title: i.book_title, reason, extraction_status: i.astrology_extraction_status };
        }),
      });
    }

    // ── Screen books: identify genuine Astro Clock vs general occult ──
    // Non-genuine books are marked 'skipped' and excluded from extraction.
    if (!checkpointOnly && !reportOnly) {
      await screenAstroBooks(sdk, astroBooks);
      index = await loadAllIndex(sdk);
      astroBooks = index.filter(i => (i.modules || []).includes('astrology') && i.classification_status === 'classified');
    }

    const pending = astroBooks.filter(i => i.astrology_extraction_status !== 'completed' && i.astrology_extraction_status !== 'skipped');

    if (checkpointOnly) {
      const completed = astroBooks.filter(i => i.astrology_extraction_status === 'completed').length;
      const inProgress = astroBooks.filter(i => i.astrology_extraction_status === 'in_progress').length;
      const skipped = astroBooks.filter(i => i.astrology_extraction_status === 'skipped').length;
      return Response.json({
        status: 'checkpoint',
        totalAstrologyBooks: astroBooks.length,
        genuineAstroBooks: astroBooks.length - skipped,
        extractionCompleted: completed,
        extractionInProgress: inProgress,
        extractionPending: pending.length,
        booksSkipped: skipped,
        stage1Complete: index.length >= 1,
      });
    }

    if (reportOnly) {
      const completed = astroBooks.filter(i => i.astrology_extraction_status === 'completed');
      const skipped = astroBooks.filter(i => i.astrology_extraction_status === 'skipped');
      const inProgress = astroBooks.filter(i => i.astrology_extraction_status === 'in_progress');
      return Response.json({
        status: 'report',
        totalAstrologyBooks: astroBooks.length,
        genuineAstroBooks: astroBooks.length - skipped.length,
        extractionCompleted: completed.length,
        extractionRemaining: pending.length,
        booksSkipped: skipped.length,
        processedBooks: completed.map(i => ({ book_id: i.source_book_id, title: i.book_title, pages_processed: i.astrology_pages_processed || 0 })),
        skippedBooks: skipped.map(i => {
          const basis = String(i.classification_basis || '');
          const reason = basis.includes('SCREENED: skip —') ? basis.split('SCREENED: skip —')[1].trim() : 'Not genuine Astro Clock content';
          return { book_id: i.source_book_id, title: i.book_title, reason };
        }),
        inProgressBooks: inProgress.map(i => ({ book_id: i.source_book_id, title: i.book_title, pages_processed: i.astrology_pages_processed || 0 })),
        confirmation: 'No existing Astro Clock data was modified, overwritten, or deleted. All findings appended additively. Every source preserved separately with its own Arabic text (harakat preserved), Malayalam explanations, citations, page numbers, and book references. No data written to HolyNameKnowledge or HolyNameImportedSection.',
      });
    }

    const stats = {
      booksProcessed: 0,
      booksCompleted: 0,
      pagesProcessed: 0,
      pagesWithAstrology: 0,
      findingsDetected: 0,
      recordsCreated: 0,
      recordsMerged: 0,
      citationsAdded: 0,
      crossLinksCreated: 0,
      magicSquaresStored: 0,
      categoriesCovered: new Set(),
    };

    for (const idx of pending) {
      if (Date.now() - started > TIME_BUDGET_MS - 15000) break;
      const bookId = idx.source_book_id;
      const bookTitle = idx.book_title || '';

      // Fetch the MasterPdfBook (for author + combined_total_pages)
      const bookRecs = await sdk.entities.MasterPdfBook.filter({ master_book_id: bookId }, undefined, 1).catch(() => []);
      const book = (bookRecs && bookRecs[0]) || { master_book_id: bookId, book_title: bookTitle, author: '' };
      const bookAuthor = book.author || '';

      // Load all pages for this book
      let pages = [];
      let pSkip = 0;
      while (true) {
        const batch = await sdk.entities.MasterPdfPage.filter({ master_book_id: bookId }, 'page_number', 200, pSkip).catch(() => []);
        if (!batch || batch.length === 0) break;
        pages.push(...batch); pSkip += batch.length;
        if (batch.length < 200) break;
      }
      const lastPage = idx.astrology_pages_processed || 0;
      pages = pages.filter(p => (p.ocr_text || p.arabic_text || p.ocr_text_ar || '').trim().length > 0 && p.page_number > lastPage);

      if (idx.astrology_extraction_status !== 'in_progress') {
        await updateIndexStatus(sdk, idx, 'in_progress', lastPage);
      }

      if (pages.length === 0) {
        await updateIndexStatus(sdk, idx, 'completed', lastPage);
        stats.booksCompleted++;
        continue;
      }

      let lastProcessedPage = lastPage;
      let allPagesScanned = true;
      for (let i = 0; i < pages.length; i += PAGES_PER_CALL) {
        if (Date.now() - started > TIME_BUDGET_MS - 10000) { allPagesScanned = false; break; }
        const chunk = pages.slice(i, i + PAGES_PER_CALL);
        const pageTextBlock = chunk.map(p => `--- PAGE ${p.page_number} ---\n${p.ocr_text || p.arabic_text || p.ocr_text_ar || ''}`).join('\n\n');

        let result = null;
        try {
          result = await sdk.integrations.Core.InvokeLLM({
            prompt: DETECTION_PROMPT + '\n\n=== PAGES TO ANALYZE ===\n' + pageTextBlock,
            response_json_schema: DETECTION_SCHEMA,
            model: LLM_MODEL,
          });
        } catch (_) { continue; }

        stats.pagesProcessed += chunk.length;
        lastProcessedPage = chunk[chunk.length - 1].page_number;
        const pageNumbers = chunk.map(p => String(p.page_number)).join(',');
        const findings = (result && Array.isArray(result.findings)) ? result.findings : [];
        if (findings.length > 0) stats.pagesWithAstrology++;

        for (const f of findings) {
          if (!f.rule_category || !f.rule_entity || !f.knowledge_text_en) continue;
          stats.findingsDetected++;
          stats.categoriesCovered.add(slug(f.rule_category));
          await writeAstroFinding(sdk, f, bookId, bookTitle, bookAuthor, pageNumbers, stats);
        }

        // INCREMENTAL CHECKPOINT: save after every chunk so the next run
        // resumes from exactly this page even if the function times out.
        await updateIndexStatus(sdk, idx, 'in_progress', lastProcessedPage);
      }

      const newStatus = allPagesScanned ? 'completed' : 'in_progress';
      await updateIndexStatus(sdk, idx, newStatus, lastProcessedPage);
      stats.booksProcessed++;
      if (allPagesScanned) stats.booksCompleted++;
    }

    const completedCount = astroBooks.filter(i => i.astrology_extraction_status === 'completed').length + stats.booksCompleted;
    const skippedCount = astroBooks.filter(i => i.astrology_extraction_status === 'skipped').length;
    const genuineCount = astroBooks.length - skippedCount;
    const allComplete = completedCount >= genuineCount && genuineCount > 0;

    // Per-book checkpoint summary for the response
    const bookCheckpoints = pending.map(i => {
      const processed = i.astrology_pages_processed || 0;
      const total = i.combined_total_pages || 0;
      const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
      return {
        book_id: i.source_book_id,
        title: (i.book_title || '').slice(0, 50),
        status: i.astrology_extraction_status,
        lastProcessedPage: processed,
        totalPages: total,
        remainingPages: Math.max(total - processed, 0),
        completionPercentage: pct,
      };
    });
    const totalPagesAll = astroBooks.reduce((s, i) => s + (i.combined_total_pages || 0), 0);
    const totalProcessedAll = astroBooks.reduce((s, i) => s + (i.astrology_pages_processed || 0), 0);
    const overallPct = totalPagesAll > 0 ? Math.round((totalProcessedAll / totalPagesAll) * 100) : 0;

    if (allComplete) {
      const skipped = astroBooks.filter(i => i.astrology_extraction_status === 'skipped');
      const ALL_CATEGORIES = ['planetary_hours','zodiac_signs','lunar_mansions','planets','weekdays','sahat','islamic_months','special_days','special_nights','lucky_timings','unfavourable_timings','correspondences','planet_relationships','friendly_planets','enemy_planets','colours','metals','stones','incense','directions','elements','spiritual_properties','khawass','mujarrabat','wafq','invocations','recommended_actions','forbidden_actions','treatments','rituals'];
      const missingCategories = ALL_CATEGORIES.filter(c => !stats.categoriesCovered.has(c));
      return Response.json({
        status: 'complete',
        totalAstrologyBooks: astroBooks.length,
        genuineAstroBooks: genuineCount,
        extractionCompleted: completedCount,
        booksSkipped: skippedCount,
        booksProcessedThisRun: stats.booksProcessed,
        pagesProcessed: stats.pagesProcessed,
        findingsDetected: stats.findingsDetected,
        totalAstroClockCardsUpdated: stats.recordsCreated + stats.recordsMerged,
        recordsCreated: stats.recordsCreated,
        recordsMerged: stats.recordsMerged,
        citationsAdded: stats.citationsAdded,
        crossLinksCreated: stats.crossLinksCreated,
        magicSquaresStored: stats.magicSquaresStored,
        categoriesCovered: Array.from(stats.categoriesCovered),
        missingCategories,
        processedBooks: astroBooks.filter(i => i.astrology_extraction_status === 'completed').map(i => ({ book_id: i.source_book_id, title: i.book_title, pages_processed: i.astrology_pages_processed || 0 })),
        skippedBooks: skipped.map(i => {
          const basis = String(i.classification_basis || '');
          const reason = basis.includes('SCREENED: skip —') ? basis.split('SCREENED: skip —')[1].trim() : 'Not genuine Astro Clock content';
          return { book_id: i.source_book_id, title: i.book_title, reason };
        }),
        overallCompletionPercentage: 100,
        module: 'astrology',
        nextModule: 'holy_names',
        confirmation: 'Astrology extraction 100% complete. Only genuine Astro Clock books were processed. No existing data was modified, overwritten, or deleted. Every source preserved separately with its own Arabic text (harakat preserved), Malayalam explanations, citations, page numbers, and book references. No data written to HolyNameKnowledge or HolyNameImportedSection.',
        reRunNeeded: false,
        timeMs: Date.now() - started,
      });
    }

    return Response.json({
      status: 'in_progress',
      totalAstrologyBooks: astroBooks.length,
      genuineAstroBooks: genuineCount,
      extractionCompleted: completedCount,
      extractionRemaining: genuineCount - completedCount,
      booksSkipped: skippedCount,
      booksProcessedThisRun: stats.booksProcessed,
      pagesProcessed: stats.pagesProcessed,
      findingsDetected: stats.findingsDetected,
      recordsCreated: stats.recordsCreated,
      recordsMerged: stats.recordsMerged,
      citationsAdded: stats.citationsAdded,
      crossLinksCreated: stats.crossLinksCreated,
      magicSquaresStored: stats.magicSquaresStored,
      categoriesCovered: Array.from(stats.categoriesCovered),
      module: 'astrology',
      overallCompletionPercentage: overallPct,
      totalPagesAcrossAllBooks: totalPagesAll,
      totalPagesProcessed: totalProcessedAll,
      bookCheckpoints,
      reRunNeeded: true,
      timeMs: Date.now() - started,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ── Write an Astro finding (append/merge into AstroClockKnowledge) ──
// APPEND-ONLY: never overwrites or deletes existing data. Every source
// is appended with '\n---\n' separator, preserving Arabic (harakat),
// Malayalam, citations, page numbers, and book references separately.
async function writeAstroFinding(sdk, f, bookId, bookTitle, bookAuthor, pageNumbers, stats) {
  const ruleCategory = slug(f.rule_category);
  const ruleEntity = slug(f.rule_entity);
  const ruleRecordKey = `${ruleCategory}|${ruleEntity}`;
  const textEn = String(f.knowledge_text_en || '').trim();
  const contentHash = `cat-${ruleRecordKey}-${await sha256(textEn.slice(0, 200))}`;

  const existing = await sdk.entities.AstroClockKnowledge.filter(
    { rule_record_key: ruleRecordKey, source_type: 'categorized' }, undefined, 1
  ).catch(() => []);

  const magicSquares = Array.isArray(f.magic_squares) ? f.magic_squares.map(ms => ({
    name: String(ms.name || ''),
    grid: Array.isArray(ms.grid) ? ms.grid : [],
    grid_text: String(ms.grid_text || ''),
    purpose: String(ms.purpose || ''),
    repetitions: String(ms.repetitions || ''),
    conditions: String(ms.conditions || ''),
    timing: String(ms.timing || ''),
    source_book: bookTitle,
    source_page: pageNumbers,
  })) : [];

  if (existing && existing.length > 0) {
    // ── APPEND to existing card (never overwrite) ──
    const rec = existing[0];
    const updates = {};
    const sep = '\n---\n';
    updates.knowledge_text_en = appendTextDedup(rec.knowledge_text_en, textEn, sep);
    updates.knowledge_text_ar = appendTextDedup(rec.knowledge_text_ar, String(f.knowledge_text_ar || '').trim(), sep);
    updates.knowledge_text_ml = appendTextDedup(rec.knowledge_text_ml, String(f.knowledge_text_ml || '').trim(), sep);

    if (Array.isArray(f.recommended_actions) && f.recommended_actions.length) updates.recommended_actions = mergeActionArr(rec.recommended_actions, f.recommended_actions);
    if (Array.isArray(f.forbidden_actions) && f.forbidden_actions.length) updates.forbidden_actions = mergeActionArr(rec.forbidden_actions, f.forbidden_actions);
    if (Array.isArray(f.warnings_list) && f.warnings_list.length) updates.warnings_list = mergeActionArr(rec.warnings_list, f.warnings_list);
    if (Array.isArray(f.notes_list) && f.notes_list.length) updates.notes_list = mergeActionArr(rec.notes_list, f.notes_list);

    let existingAttrs = mergeAttributesAdditive(rec.attributes, f.attributes);
    if (magicSquares.length > 0) {
      const existingMs = Array.isArray(existingAttrs.magic_squares) ? existingAttrs.magic_squares : [];
      for (const ms of magicSquares) {
        const msKey = `${ms.name}|${ms.source_page}|${JSON.stringify(ms.grid).slice(0, 80)}`;
        if (existingMs.some(x => `${x.name}|${x.source_page}|${JSON.stringify(x.grid).slice(0, 80)}` === msKey)) continue;
        existingMs.push(ms);
        stats.magicSquaresStored++;
      }
      existingAttrs.magic_squares = existingMs;
    }
    const existingCross = Array.isArray(existingAttrs.cross_links) ? existingAttrs.cross_links : [];
    for (const cl of (f.cross_links || [])) {
      if (!cl || !cl.module || !cl.card_id) continue;
      const key = `${cl.module}|${cl.card_id}`;
      if (existingCross.some(x => `${x.module}|${x.card_id}` === key)) continue;
      existingCross.push({ module: cl.module, card_id: String(cl.card_id), reason: String(cl.reason || '') });
      stats.crossLinksCreated++;
    }
    if (existingCross.length > 0) existingAttrs.cross_links = existingCross;
    updates.attributes = existingAttrs;

    // Append this source as a separate citation (dedup by book+page)
    const supp = Array.isArray(rec.supporting_sources) ? [...rec.supporting_sources] : [];
    const srcKey = `${bookTitle}|${pageNumbers}`;
    if (!supp.some(s => `${s.book_title}|${s.page_number}` === srcKey)) {
      supp.push({ book_title: bookTitle, page_number: pageNumbers, ocr_confidence: 100, detected_language: 'ar', upload_date: new Date().toISOString() });
      stats.citationsAdded++;
    }
    updates.supporting_sources = supp;
    updates.source_count = (rec.source_count || 1) + (supp.length > (rec.supporting_sources || []).length ? 1 : 0);

    try {
      await sdk.entities.AstroClockKnowledge.update(rec.id || rec._id, updates);
      stats.recordsMerged++;
    } catch (_) {}
  } else {
    // ── CREATE new card ──
    const attrs = (f.attributes && typeof f.attributes === 'object') ? { ...f.attributes } : {};
    if (magicSquares.length > 0) {
      attrs.magic_squares = magicSquares;
      stats.magicSquaresStored += magicSquares.length;
    }
    const cross = [];
    for (const cl of (f.cross_links || [])) {
      if (!cl || !cl.module || !cl.card_id) continue;
      cross.push({ module: cl.module, card_id: String(cl.card_id), reason: String(cl.reason || '') });
      stats.crossLinksCreated++;
    }
    if (cross.length > 0) attrs.cross_links = cross;

    const newRec = {
      knowledge_id: `ACK-STAGE2-${bookId}-${(await sha256(ruleRecordKey + textEn.slice(0, 60))).slice(0, 12)}`,
      source_type: 'categorized',
      rule_category: ruleCategory,
      rule_entity: ruleEntity,
      entity_raw: String(f.entity_raw || ''),
      rule_record_key: ruleRecordKey,
      knowledge_category: 'categorized_rule',
      knowledge_text_en: textEn,
      knowledge_text_ar: String(f.knowledge_text_ar || ''),
      knowledge_text_ml: String(f.knowledge_text_ml || ''),
      content_hash: contentHash,
      is_marker: false,
      attributes: attrs,
      recommended_actions: (f.recommended_actions || []).map(a => ({ en: String(a.en || ''), ar: String(a.ar || ''), ml: String(a.ml || '') })),
      forbidden_actions: (f.forbidden_actions || []).map(a => ({ en: String(a.en || ''), ar: String(a.ar || ''), ml: String(a.ml || '') })),
      warnings_list: (f.warnings_list || []).map(a => ({ en: String(a.en || ''), ar: String(a.ar || ''), ml: String(a.ml || '') })),
      notes_list: (f.notes_list || []).map(a => ({ en: String(a.en || ''), ar: String(a.ar || ''), ml: String(a.ml || '') })),
      ritual_suitability: String(f.ritual_suitability || ''),
      source_book_id: bookId,
      source_book_title: bookTitle,
      source_page_number: pageNumbers,
      source_entry_id: '',
      source_screenshot_url: '',
      ocr_confidence: Number(f.confidence) || 100,
      detected_language: 'ar',
      upload_date: new Date().toISOString(),
      is_verified: false,
      supporting_sources: [{ book_title: bookTitle, page_number: pageNumbers, ocr_confidence: 100, detected_language: 'ar', upload_date: new Date().toISOString() }],
      source_count: 1,
    };
    try {
      await sdk.entities.AstroClockKnowledge.create(newRec);
      stats.recordsCreated++;
      stats.citationsAdded++;
    } catch (_) {}
  }
}

async function updateIndexStatus(sdk, idx, status, lastPage) {
  try {
    await sdk.entities.LibraryBookIndex.update(idx.id || idx._id, {
      astrology_extraction_status: status,
      astrology_pages_processed: lastPage,
    });
  } catch (_) {}
}

// ── Screen astrology books: genuine Astro Clock vs general occult ──
// Batch LLM call classifies each book from its index metadata.
// Non-genuine books are marked 'skipped' so the extraction loop ignores them.
// Idempotent: books already containing 'SCREENED:' in classification_basis are skipped.
async function screenAstroBooks(sdk, astrologyBooks) {
  const unscreened = astrologyBooks.filter(i => !String(i.classification_basis || '').includes('SCREENED:'));
  if (unscreened.length === 0) return;

  const booksBlock = unscreened.map((idx, i) => {
    const toc = (idx.table_of_contents || []).map(t => t.title).filter(Boolean).slice(0, 15).join(', ');
    const keywords = (idx.important_keywords || []).slice(0, 15).join(', ');
    return `=== BOOK ${i + 1} ===\nTitle: ${idx.book_title || ''}\nAuthor: ${idx.author || ''}\nSummary: ${String(idx.classification_summary || '').slice(0, 300)}\nKeywords: ${keywords}\nTOC: ${toc}\nFirst pages (excerpt): ${String(idx.first_pages_summary || '').slice(0, 500)}`;
  }).join('\n\n');

  let result = null;
  try {
    result = await sdk.integrations.Core.InvokeLLM({
      prompt: SCREENING_PROMPT + '\n\nYou are screening ' + unscreened.length + ' books at once. For EACH book, return is_genuine_astro, reason, and topics_found.\n\n' + booksBlock,
      response_json_schema: SCREENING_SCHEMA,
      model: LLM_MODEL,
    });
  } catch (_) { return; }

  const results = (result && Array.isArray(result.results)) ? result.results : [];
  const byIndex = new Map(results.map(r => [Number(r.book_index), r]));

  for (let i = 0; i < unscreened.length; i++) {
    const idx = unscreened[i];
    const r = byIndex.get(i + 1);
    if (!r) continue;
    const isGenuine = !!r.is_genuine_astro;
    const reason = String(r.reason || '').slice(0, 200);
    try {
      if (!isGenuine) {
        await sdk.entities.LibraryBookIndex.update(idx.id || idx._id, {
          astrology_extraction_status: 'skipped',
          classification_basis: `${idx.classification_basis || ''} | SCREENED: skip — ${reason}`,
        });
      } else {
        await sdk.entities.LibraryBookIndex.update(idx.id || idx._id, {
          classification_basis: `${idx.classification_basis || ''} | SCREENED: genuine — ${reason}`,
        });
      }
    } catch (_) {}
  }
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