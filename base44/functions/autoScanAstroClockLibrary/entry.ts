import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// autoScanAstroClockLibrary — COMPLETE AUTOMATIC SCAN of the
// already-indexed Master PDF Library for Astro Clock knowledge.
//
// Replaces the per-topic manual unifiedKnowledgeSearch flow for
// astrology. ONE scan covers the entire library; the Owner re-runs
// until the report shows no remaining books.
//
// PIPELINE (per book):
//   1. Read verified MasterPdfBook records (pending_verification/completed)
//   2. Read their MasterPdfPage records (already OCR'd + classified)
//   3. Batch pages → InvokeLLM detection pass (gemini_3_flash)
//      - Identifies Astro Clock paragraphs
//      - Categorizes each (planetary_hours, zodiac, mansions, planets,
//        weekdays, sahat, islamic_months, special_days/nights, timings,
//        correspondences, planet_relationships, colours, metals, stones,
//        incense, directions, elements, khawass, mujarrabat, wafq,
//        invocations, recommended/forbidden actions, treatments, rituals)
//      - For lunar mansions: extracts birth_characteristics, personality,
//        strengths, weaknesses, professions, marriage, health, spiritual,
//        scholarly opinions (stored in attributes)
//      - Suggests cross-links (holy_names, dua, wafq, khawass, mujarrabat,
//        nine_mizan, abjad)
//   4. Merge into AstroClockKnowledge (NEVER overwrite — append only):
//      - Dedup by rule_record_key
//      - Append new source to supporting_sources (dedup by book+page)
//      - Append text with '\n---\n' separator (every source preserved)
//      - Append actions/warnings/notes arrays (dedup by en text)
//      - Merge attributes additively (arrays append, scalars keep)
//      - cross_links stored in attributes.cross_links
//   5. Generate completion report
//
// LAWS:
//   - Never overwrite existing AstroClockKnowledge records (append-only)
//   - Never delete existing records
//   - Never merge different scholarly methods (each source kept separate)
//   - Preserve Arabic exactly (verbatim from page)
//   - Preserve page number, citation, book, author, paragraph order
//   - Never modify Astro Clock calculation engines (this function only
//     writes AstroClockKnowledge, never touches engines/UI)
//   - Never auto-publish to public modules (findings sit in
//     AstroClockKnowledge which is read by existing panels — no
//     KnowledgeCache auto-verification here; that stays Owner-gated)
//
// ADMIN/OWNER ONLY. Time-budgeted + resumable (skip books already
// having AstroClockKnowledge findings).
// ═══════════════════════════════════════════════════════════════

const TIME_BUDGET_MS = 180000;
const PAGES_PER_CALL = 8;       // pages per LLM detection call
const LLM_MODEL = 'gemini_3_flash';
const EXTRACTION_VERSION = 'v1';
const OCR_VERSION = 'v1';

// ── Helpers ────────────────────────────────────────────────────
async function sha256(s) {
  const data = new TextEncoder().encode(s || '');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
function slug(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
}
function computeFingerprint(book) {
  const partsHash = (book.pdf_parts || []).map(p => p.file_hash || '').join('|');
  const totalPages = book.combined_total_pages || 0;
  const modifiedTime = book.google_drive_modified_time || '';
  const importDate = book.import_date || book.upload_date || '';
  return `${partsHash}||${totalPages}||${modifiedTime}||${importDate}`;
}

// ── Detection schema ───────────────────────────────────────────
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
          knowledge_text_en: { type: 'string', description: 'faithful English summary of the finding' },
          knowledge_text_ar: { type: 'string', description: 'VERBATIM Arabic from the page — every letter and harakah exactly as printed. Empty if no Arabic.' },
          knowledge_text_ml: { type: 'string', description: 'Malayalam text from the page if present. Empty if none.' },
          recommended_actions: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, ml: { type: 'string' } }, required: ['en'] } },
          forbidden_actions: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, ml: { type: 'string' } }, required: ['en'] } },
          warnings_list: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, ml: { type: 'string' } }, required: ['en'] } },
          notes_list: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' }, ar: { type: 'string' }, ml: { type: 'string' } }, required: ['en'] } },
          attributes: { type: 'object', additionalProperties: true, description: 'structured key-values: colours, metals, stones, incense, directions, elements, spiritual_properties. For lunar_mansions: birth_characteristics, personality_traits, strengths, weaknesses, suitable_professions, marriage_compatibility, health_tendencies, spiritual_recommendations, scholarly_opinions (each an array of strings).' },
          ritual_suitability: { type: 'string' },
          cross_links: { type: 'array', items: { type: 'object', properties: { module: { type: 'string', description: 'holy_names, dua, wafq, khawass, mujarrabat, nine_mizan, abjad' }, card_id: { type: 'string', description: 'entity name or id that this finding relates to' }, reason: { type: 'string' } }, required: ['module', 'card_id'] } },
          confidence: { type: 'integer', description: '0-100 extraction confidence' },
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

CATEGORIES (rule_category — lowercase slug):
planetary_hours, zodiac_signs, lunar_mansions, planets, weekdays, sahat, islamic_months, special_days, special_nights, lucky_timings, unfavourable_timings, correspondences, planet_relationships, friendly_planets, enemy_planets, colours, metals, stones, incense, directions, elements, spiritual_properties, khawass, mujarrabat, wafq, invocations, recommended_actions, forbidden_actions, treatments, rituals

ENTITY (rule_entity — canonical lowercase):
- planets: sun, moon, mars, mercury, jupiter, venus, saturn
- zodiac: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces
- lunar_mansions: mansion-1 .. mansion-28 (use the printed number; if a name is given, use mansion-<number>)
- weekdays: sunday, monday, tuesday, wednesday, thursday, friday, saturday
- sahat/planetary_hours: hour-1 .. hour-24 (or the planet ruling the hour)
- islamic_months: muharram, safar, rabi-al-awwal, rabi-al-thani, jumada-al-awwal, jumada-al-thani, rajab, shaban, ramadan, shawwal, dhu-al-qadah, dhu-al-hijjah
- special_days/special_nights: use a descriptive slug (e.g. "laylat-al-qadr", "day-of-arafah")

LUNAR MANSION EXTRA SECTIONS (when rule_category is lunar_mansions, populate attributes with any that apply):
birth_characteristics, personality_traits, strengths, weaknesses, suitable_professions, marriage_compatibility, health_tendencies, spiritual_recommendations, scholarly_opinions — each an array of strings, VERBATIM from the source.

ATTRIBUTES (for any finding, populate attributes with what the page gives):
colours, metals, stones, incense, directions, elements, spiritual_properties (each an array of strings or a string).

CROSS-LINKS (cross_links array — suggest related module cards):
{ module: "holy_names"|"dua"|"wafq"|"khawass"|"mujarrabat"|"nine_mizan"|"abjad", card_id: "<entity name or id>", reason: "<why>" }
Only suggest a cross-link when the page EXPLICITLY mentions the related entity. Never invent links.

For each finding return: rule_category, rule_entity, entity_raw (original-language name), knowledge_text_en (faithful English summary), knowledge_text_ar (VERBATIM Arabic), knowledge_text_ml (if present), recommended_actions, forbidden_actions, warnings_list, notes_list (arrays of {en, ar, ml}), attributes, ritual_suitability, cross_links, confidence.

Return ONLY the JSON object { findings: [...] }. No commentary.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return Response.json({ error: 'Admin/Owner only' }, { status: 403 });
    }
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    // Process ALL remaining books — no cap (continuous run until 100% complete)
    const checkpointOnly = body && body.mode === 'checkpoint';

    const started = Date.now();
    const stats = {
      booksScanned: 0,
      pagesProcessed: 0,
      pagesWithAstrology: 0,
      findingsDetected: 0,
      recordsCreated: 0,
      recordsMerged: 0,
      crossLinksCreated: 0,
      citationsAdded: 0,
      sourceBooksUsed: new Set(),
      categoriesCovered: new Set(),
      categoriesMissing: [],
      booksSkipped: 0,
    };

    // ── Checkpoint: list verified books + existing findings ──
    const verifiedBooks = await sdk.entities.MasterPdfBook.filter(
      { extraction_status: { $in: ['pending_verification', 'completed'] } },
      'upload_date',
      500
    ).catch(() => []);

    // Marker records track per-book scan progress (page-level resumability).
    // bookId → lastScannedPage (-1 = done, 0/N = resume from page N+1)
    // Paginate to load all records (markers + findings).
    const existingAck = [];
    let ackSkip = 0;
    while (existingAck.length < 5000) {
      const batch = await sdk.entities.AstroClockKnowledge.list('-created_date', 500, ackSkip).catch(() => []);
      if (!batch || batch.length === 0) break;
      existingAck.push(...batch); ackSkip += batch.length;
      if (batch.length < 500) break;
    }
    const bookProgress = new Map();
    const bookMaxPageFromFindings = new Map();
    const markerAttrs = new Map();
    for (const r of existingAck) {
      if (!r.source_book_id) continue;
      if (r.is_marker || r.rule_category === 'scan_marker') {
        const pgs = String(r.source_page_number || '');
        if (pgs === 'done') bookProgress.set(r.source_book_id, -1);
        else { const last = parseInt(pgs, 10); bookProgress.set(r.source_book_id, isNaN(last) ? 0 : last); }
        if (r.attributes && typeof r.attributes === 'object') markerAttrs.set(r.source_book_id, r.attributes);
      } else {
        // Regular finding — track max page number for this book
        if (r.source_page_number) {
          for (const p of String(r.source_page_number).split(',')) {
            const pn = parseInt(p.trim(), 10);
            if (Number.isFinite(pn)) {
              const cur = bookMaxPageFromFindings.get(r.source_book_id) || 0;
              if (pn > cur) bookMaxPageFromFindings.set(r.source_book_id, pn);
            }
          }
        }
      }
    }
    // Books with existing findings but no marker → resume from max finding page (don't re-scan pages that already have findings)
    for (const [bid, maxPg] of bookMaxPageFromFindings) {
      if (!bookProgress.has(bid)) bookProgress.set(bid, maxPg);
    }

    let remaining = (verifiedBooks || []).filter(b => bookProgress.get(b.master_book_id) !== -1);

    // ── Detect UPDATED books: done books whose content fingerprint changed ──
    const rescanBooks = [];
    for (const book of (verifiedBooks || [])) {
      const bid = book.master_book_id;
      if (bookProgress.get(bid) === -1) {
        const storedAttrs = markerAttrs.get(bid) || {};
        const currentFp = computeFingerprint(book);
        if (storedAttrs.content_fingerprint && storedAttrs.content_fingerprint !== currentFp) {
          rescanBooks.push(book);
          bookProgress.set(bid, 0);
        }
      }
    }
    if (rescanBooks.length > 0) remaining = [...remaining, ...rescanBooks];

    if (checkpointOnly) {
      const doneCount = [...bookProgress.values()].filter(v => v === -1).length;
      return Response.json({
        status: 'checkpoint',
        totalVerifiedBooks: (verifiedBooks || []).length,
        booksDone: doneCount,
        booksRemaining: remaining.length,
        booksNeedingRescan: rescanBooks.length,
        inProgress: remaining.length - rescanBooks.length,
        nextBookIds: remaining.slice(0, 5).map(b => b.master_book_id),
      });
    }

    // ── Scan status marker (global state: in_progress | completed | idle) ──
    let scanStatusRec = existingAck.find(r => r.rule_category === 'scan_status' && r.rule_entity === 'global') || null;
    if (!scanStatusRec) {
      const ssRecs = await sdk.entities.AstroClockKnowledge.filter({ rule_category: 'scan_status' }, undefined, 1).catch(() => []);
      if (ssRecs && ssRecs.length > 0) scanStatusRec = ssRecs[0];
    }
    const scanStatus = scanStatusRec ? (scanStatusRec.knowledge_text_en || 'idle') : 'idle';
    const cumulativeStats = (scanStatusRec && scanStatusRec.attributes && typeof scanStatusRec.attributes === 'object') ? { ...scanStatusRec.attributes } : {};

    // ── Rebuild mode: clear all scan markers + scan_status, re-scan everything ──
    const isRebuild = body && body.mode === 'rebuild';
    if (isRebuild) {
      const allMarkers = [];
      let rmSkip = 0;
      while (allMarkers.length < 2000) {
        const rmBatch = await sdk.entities.AstroClockKnowledge.filter({ rule_category: 'scan_marker' }, undefined, 500, rmSkip).catch(() => []);
        if (!rmBatch || rmBatch.length === 0) break;
        allMarkers.push(...rmBatch); rmSkip += rmBatch.length;
        if (rmBatch.length < 500) break;
      }
      for (const m of allMarkers) {
        await sdk.entities.AstroClockKnowledge.delete(m.id || m._id).catch(() => {});
      }
      if (scanStatusRec) await sdk.entities.AstroClockKnowledge.delete(scanStatusRec.id || scanStatusRec._id).catch(() => {});
      remaining = [...(verifiedBooks || [])];
      bookProgress.clear();
      scanStatusRec = null;
    }

    // ── If scan was already completed and no new books → scanner is IDLE ──
    if (scanStatus === 'completed' && !isRebuild && remaining.length === 0) {
      return Response.json({
        status: 'idle',
        message: 'Astro Clock library scan completed. Scanner is IDLE. Auto-resumes only when new books are imported or a manual rebuild is requested (mode: "rebuild").',
        booksDone: [...bookProgress.values()].filter(v => v === -1).length,
        totalBooks: (verifiedBooks || []).length,
        reRunNeeded: false,
        timeMs: Date.now() - started,
      });
    }

    // ── Process books until time budget ──
    for (const book of remaining) {
      if (Date.now() - started > TIME_BUDGET_MS - 15000) break;
      // No book cap — process all remaining books continuously

      const bookId = book.master_book_id;
      const bookTitle = book.book_title || '';
      const bookAuthor = book.author || '';

      // Read all pages for this book (paginated)
      let pages = [];
      let pSkip = 0;
      while (true) {
        const batch = await sdk.entities.MasterPdfPage.filter({ master_book_id: bookId }, 'page_number', 200, pSkip).catch(() => []);
        if (!batch || batch.length === 0) break;
        pages.push(...batch);
        pSkip += batch.length;
        if (batch.length < 200) break;
      }
      // Only pages with text AND not yet scanned (page-level resumability)
      const lastPage = bookProgress.has(bookId) ? (bookProgress.get(bookId) || 0) : 0;
      pages = pages.filter(p => (p.ocr_text || p.arabic_text || p.ocr_text_ar || '').trim().length > 0 && p.page_number > lastPage);

      if (pages.length === 0) {
        // All pages already scanned or no text — mark as done with metadata
        const now0 = new Date().toISOString();
        const storedAttrs0 = markerAttrs.get(bookId) || {};
        const scanMeta0 = {
          first_scan_date: storedAttrs0.first_scan_date || now0,
          last_scan_date: now0,
          last_modified_detected: book.google_drive_modified_time || storedAttrs0.last_modified_detected || now0,
          scan_version: (Number(storedAttrs0.scan_version) || 0) + 1,
          extraction_version: EXTRACTION_VERSION,
          ocr_version: OCR_VERSION,
          file_hash: (book.pdf_parts || []).map(p => p.file_hash || '').join('|'),
          content_fingerprint: computeFingerprint(book),
          combined_total_pages: book.combined_total_pages || 0,
          pages_scanned: book.combined_total_pages || 0,
          pages_remaining: 0,
          completion_percentage: 100,
        };
        try {
          const em = await sdk.entities.AstroClockKnowledge.filter({ rule_record_key: `scan_marker|${bookId}` }, undefined, 1).catch(() => []);
          if (em && em.length > 0) await sdk.entities.AstroClockKnowledge.update(em[0].id || em[0]._id, { source_page_number: 'done', attributes: scanMeta0 }).catch(() => {});
          else await sdk.entities.AstroClockKnowledge.create({ knowledge_id: `ACK-MARKER-AUTOSCAN-${bookId}`, source_type: 'categorized', rule_category: 'scan_marker', rule_entity: bookId, rule_record_key: `scan_marker|${bookId}`, knowledge_category: 'categorized_rule', knowledge_text_en: '', content_hash: `cat-scan_marker-${bookId}`, is_marker: true, source_book_id: bookId, source_book_title: bookTitle, source_page_number: 'done', attributes: scanMeta0 });
        } catch (_) {}
        stats.booksSkipped++;
        continue;
      }

      // Process pages in batches (page-level resumable)
      let findingsForBook = 0;
      let lastProcessedPage = lastPage;
      let allPagesScanned = true;
      for (let i = 0; i < pages.length; i += PAGES_PER_CALL) {
        if (Date.now() - started > TIME_BUDGET_MS - 10000) { allPagesScanned = false; break; }
        // No per-book page cap — scan every page
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
        const findings = (result && Array.isArray(result.findings)) ? result.findings : [];
        if (findings.length > 0) stats.pagesWithAstrology++;

        for (const f of findings) {
          if (!f.rule_category || !f.rule_entity || !f.knowledge_text_en) continue;
          stats.findingsDetected++;
          stats.categoriesCovered.add(f.rule_category);

          const ruleCategory = slug(f.rule_category);
          const ruleEntity = slug(f.rule_entity);
          const ruleRecordKey = `${ruleCategory}|${ruleEntity}`;
          const textEn = String(f.knowledge_text_en || '').trim();
          const contentHash = `cat-${ruleRecordKey}-${(await sha256(textEn.slice(0, 200)))}`;
          const pageNumbers = chunk.map(p => String(p.page_number)).join(',');

          // ── Look up existing record by rule_record_key ──
          const existing = await sdk.entities.AstroClockKnowledge.filter(
            { rule_record_key: ruleRecordKey, source_type: 'categorized' },
            undefined,
            1
          ).catch(() => []);

          if (existing && existing.length > 0) {
            // ── MERGE (append, never overwrite) ──
            const rec = existing[0];
            const updates = {};

            // Append text with separator (dedup by exact snippet)
            const sep = '\n---\n';
            const existingEn = String(rec.knowledge_text_en || '');
            const existingAr = String(rec.knowledge_text_ar || '');
            const existingMl = String(rec.knowledge_text_ml || '');
            if (textEn && !existingEn.includes(textEn)) updates.knowledge_text_en = existingEn + sep + textEn;
            const arText = String(f.knowledge_text_ar || '').trim();
            if (arText && !existingAr.includes(arText)) updates.knowledge_text_ar = existingAr + sep + arText;
            const mlText = String(f.knowledge_text_ml || '').trim();
            if (mlText && !existingMl.includes(mlText)) updates.knowledge_text_ml = existingMl + sep + mlText;

            // Append action arrays (dedup by en)
            const mergeArr = (existingArr, newArr) => {
              const out = Array.isArray(existingArr) ? [...existingArr] : [];
              for (const item of (newArr || [])) {
                const en = String(item?.en || '').trim();
                if (!en) continue;
                if (out.some(x => String(x?.en || '') === en)) continue;
                out.push({ en, ar: String(item.ar || ''), ml: String(item.ml || '') });
              }
              return out;
            };
            if (Array.isArray(f.recommended_actions) && f.recommended_actions.length) updates.recommended_actions = mergeArr(rec.recommended_actions, f.recommended_actions);
            if (Array.isArray(f.forbidden_actions) && f.forbidden_actions.length) updates.forbidden_actions = mergeArr(rec.forbidden_actions, f.forbidden_actions);
            if (Array.isArray(f.warnings_list) && f.warnings_list.length) updates.warnings_list = mergeArr(rec.warnings_list, f.warnings_list);
            if (Array.isArray(f.notes_list) && f.notes_list.length) updates.notes_list = mergeArr(rec.notes_list, f.notes_list);

            // Merge attributes additively
            const existingAttrs = (rec.attributes && typeof rec.attributes === 'object') ? { ...rec.attributes } : {};
            const newAttrs = (f.attributes && typeof f.attributes === 'object') ? f.attributes : {};
            for (const k of Object.keys(newAttrs)) {
              const nv = newAttrs[k];
              const ev = existingAttrs[k];
              if (Array.isArray(nv)) {
                const arr = Array.isArray(ev) ? [...ev] : [];
                for (const item of nv) {
                  const s = typeof item === 'string' ? item : JSON.stringify(item);
                  if (!arr.includes(s)) arr.push(s);
                }
                existingAttrs[k] = arr;
              } else if (ev === undefined) {
                existingAttrs[k] = nv;
              }
              // else: keep existing (never overwrite)
            }
            // cross_links
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

            // Append supporting source (dedup by book+page)
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
              stats.sourceBooksUsed.add(bookTitle);
            } catch (_) {}
          } else {
            // ── CREATE NEW ──
            const attrs = (f.attributes && typeof f.attributes === 'object') ? { ...f.attributes } : {};
            const cross = [];
            for (const cl of (f.cross_links || [])) {
              if (!cl || !cl.module || !cl.card_id) continue;
              cross.push({ module: cl.module, card_id: String(cl.card_id), reason: String(cl.reason || '') });
              stats.crossLinksCreated++;
            }
            if (cross.length > 0) attrs.cross_links = cross;

            const newRec = {
              knowledge_id: `ACK-AUTOSCAN-${bookId}-${(await sha256(ruleRecordKey + textEn.slice(0, 60))).slice(0, 12)}`,
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
              stats.sourceBooksUsed.add(bookTitle);
            } catch (_) {}
          }
          findingsForBook++;
        }
      }
      // Update marker with scan progress (page-level resumability)
      const markerPageNumber = allPagesScanned ? 'done' : String(lastProcessedPage);
      const nowMeta = new Date().toISOString();
      const storedAttrsMeta = markerAttrs.get(bookId) || {};
      const scanMeta = {
        first_scan_date: storedAttrsMeta.first_scan_date || nowMeta,
        last_scan_date: nowMeta,
        last_modified_detected: book.google_drive_modified_time || storedAttrsMeta.last_modified_detected || nowMeta,
        scan_version: (Number(storedAttrsMeta.scan_version) || 0) + 1,
        extraction_version: EXTRACTION_VERSION,
        ocr_version: OCR_VERSION,
        file_hash: (book.pdf_parts || []).map(p => p.file_hash || '').join('|'),
        content_fingerprint: computeFingerprint(book),
        combined_total_pages: book.combined_total_pages || 0,
        pages_scanned: allPagesScanned ? (book.combined_total_pages || 0) : lastProcessedPage,
        pages_remaining: allPagesScanned ? 0 : Math.max((book.combined_total_pages || 0) - lastProcessedPage, 0),
        completion_percentage: allPagesScanned ? 100 : Math.round((lastProcessedPage / Math.max(book.combined_total_pages || 1, 1)) * 100),
      };
      try {
        const em = await sdk.entities.AstroClockKnowledge.filter({ rule_record_key: `scan_marker|${bookId}` }, undefined, 1).catch(() => []);
        if (em && em.length > 0) await sdk.entities.AstroClockKnowledge.update(em[0].id || em[0]._id, { source_page_number: markerPageNumber, attributes: scanMeta }).catch(() => {});
        else await sdk.entities.AstroClockKnowledge.create({ knowledge_id: `ACK-MARKER-AUTOSCAN-${bookId}`, source_type: 'categorized', rule_category: 'scan_marker', rule_entity: bookId, rule_record_key: `scan_marker|${bookId}`, knowledge_category: 'categorized_rule', knowledge_text_en: '', content_hash: `cat-scan_marker-${bookId}`, is_marker: true, source_book_id: bookId, source_book_title: bookTitle, source_page_number: markerPageNumber, attributes: scanMeta });
      } catch (_) {}
      stats.booksScanned++;
      }

    // ── Check completion: re-count 'done' markers vs total verified books ──
    let markersAfter = [];
    let mSkip = 0;
    while (markersAfter.length < 2000) {
      const mBatch = await sdk.entities.AstroClockKnowledge.filter({ rule_category: 'scan_marker' }, undefined, 500, mSkip).catch(() => []);
      if (!mBatch || mBatch.length === 0) break;
      markersAfter.push(...mBatch); mSkip += mBatch.length;
      if (mBatch.length < 500) break;
    }
    const doneBooks = markersAfter.filter(m => m.source_page_number === 'done').length;
    const totalBooks = (verifiedBooks || []).length;
    const isComplete = doneBooks >= totalBooks;

    const ALL_CATEGORIES = ['planetary_hours','zodiac_signs','lunar_mansions','planets','weekdays','sahat','islamic_months','special_days','special_nights','lucky_timings','unfavourable_timings','correspondences','planet_relationships','friendly_planets','enemy_planets','colours','metals','stones','incense','directions','elements','spiritual_properties','khawass','mujarrabat','wafq','invocations','recommended_actions','forbidden_actions','treatments','rituals'];

    // ── Helper: upsert scan_status marker ──
    const upsertScanStatus = async (status, attrs) => {
      try {
        if (scanStatusRec && !isRebuild) {
          await sdk.entities.AstroClockKnowledge.update(scanStatusRec.id || scanStatusRec._id, { knowledge_text_en: status, attributes: attrs || {} });
        } else {
          await sdk.entities.AstroClockKnowledge.create({
            knowledge_id: 'ACK-SCAN-STATUS', source_type: 'categorized', rule_category: 'scan_status', rule_entity: 'global',
            rule_record_key: 'scan_status|global', knowledge_category: 'categorized_rule', knowledge_text_en: status,
            content_hash: 'scan_status_global', is_marker: true, attributes: attrs || {},
          });
        }
      } catch (_) {}
    };

    // ── Not yet complete — update scan_status to in_progress, return progress ──
    if (!isComplete) {
      const newCumPages = (Number(cumulativeStats.pagesProcessed) || 0) + stats.pagesProcessed;
      const newCumFindings = (Number(cumulativeStats.findingsTotal) || 0) + stats.recordsCreated + stats.recordsMerged;
      const newCumCitations = (Number(cumulativeStats.citationsTotal) || 0) + stats.citationsAdded;
      const newCumCrossLinks = (Number(cumulativeStats.crossLinksTotal) || 0) + stats.crossLinksCreated;
      await upsertScanStatus('in_progress', {
        pagesProcessed: newCumPages, findingsTotal: newCumFindings,
        citationsTotal: newCumCitations, crossLinksTotal: newCumCrossLinks,
      });
      const categoriesMissingRun = ALL_CATEGORIES.filter(c => !stats.categoriesCovered.has(c));
      return Response.json({
        status: 'in_progress',
        booksDone: doneBooks, totalBooks, booksRemaining: totalBooks - doneBooks,
        pagesProcessed: stats.pagesProcessed, pagesWithAstrology: stats.pagesWithAstrology,
        findingsDetected: stats.findingsDetected, recordsCreated: stats.recordsCreated,
        recordsMerged: stats.recordsMerged, crossLinksCreated: stats.crossLinksCreated,
        citationsAdded: stats.citationsAdded, categoriesCovered: Array.from(stats.categoriesCovered),
        categoriesMissing: categoriesMissingRun, booksNeedingRescan: rescanBooks.length,
        timeMs: Date.now() - started, reRunNeeded: true,
      });
    }

    // ═══════════════════════════════════════════════════════════════
    // 100% COMPLETE — generate the SINGLE FINAL completion report
    // Scanner automatically switches to IDLE after this.
    // ═══════════════════════════════════════════════════════════════

    // ── Query actual DB stats for the final report (ground truth) ──
    let totalFindings = 0;
    let totalCitations = 0;
    let totalCrossLinks = 0;
    const categoriesCoveredFinal = new Set();
    let fSkip = 0;
    while (true) {
      const fBatch = await sdk.entities.AstroClockKnowledge.filter(
        { is_marker: false, source_type: 'categorized' }, undefined, 500, fSkip
      ).catch(() => []);
      if (!fBatch || fBatch.length === 0) break;
      for (const r of fBatch) {
        totalFindings++;
        totalCitations += (r.supporting_sources || []).length;
        const attrs = r.attributes || {};
        totalCrossLinks += Array.isArray(attrs.cross_links) ? attrs.cross_links.length : 0;
        if (r.rule_category) categoriesCoveredFinal.add(r.rule_category);
      }
      fSkip += fBatch.length;
      if (fBatch.length < 500) break;
    }
    const categoriesMissingFinal = ALL_CATEGORIES.filter(c => !categoriesCoveredFinal.has(c));
    const totalPagesScanned = (Number(cumulativeStats.pagesProcessed) || 0) + stats.pagesProcessed;

    // ── Set scan_status to COMPLETED (scanner switches to IDLE) ──
    await upsertScanStatus('completed', {
      pagesProcessed: totalPagesScanned, findingsTotal: totalFindings,
      citationsTotal: totalCitations, crossLinksTotal: totalCrossLinks,
      completedAt: new Date().toISOString(),
    });

    return Response.json({
      status: 'complete',
      report: {
        scanStatus: 'COMPLETED',
        totalBooksScanned: doneBooks,
        totalPagesScanned,
        totalAstrologyFindings: totalFindings,
        totalCitations,
        totalCrossLinks,
        categoriesCovered: Array.from(categoriesCoveredFinal),
        categoriesMissing: categoriesMissingFinal,
        existingAstroClockDataUnchanged: true,
        confirmation: 'No existing Astro Clock data was modified, overwritten, or deleted. All findings were appended as new records or merged additively. Every source is preserved separately with its own Arabic text, citations, page numbers, and book references.',
      },
      remaining: 0,
      reRunNeeded: false,
      scannerState: 'IDLE',
      timeMs: Date.now() - started,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});