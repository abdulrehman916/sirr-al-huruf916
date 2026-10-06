import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// UNIFIED KNOWLEDGE SEARCH ENGINE — the permanent knowledge gateway
// for the entire Sirr al-Huruf project. Every future module obtains
// knowledge ONLY through this engine.
//
// Searches ACROSS every connected source at the same time:
//   • Indexed Master PDF Library (MasterPdfPage — uploaded + cloud-imported)
//   • Google Drive   (connector fullText index — files not yet indexed)
//   • OneDrive       (Microsoft Graph $search — files not yet indexed)
//   • Adobe Document Cloud (no public full-text API → reported unavailable)
//
// The AI COMPARES all matched books before returning results and
// auto-collects every authentic scholarly entry (meanings, tafsir,
// khawass, mujarrabat, wazifa, hizb, dua, amal, wafq, talismans,
// repetitions, timings, conditions, warnings, benefits, related
// verses/hadith/names, classical references) from the matched content.
//
// STRICT RULES (project law):
//   - NEVER fabricate. The LLM uses ONLY the provided matched content.
//     No internet. Empty array when a category has no supporting content.
//   - NEVER merge conflicting scholarly opinions. Each opinion is a
//     separate entry carrying its OWN citation. Conflicts are surfaced
//     in `conflicts`.
//   - Every entry is source-attributed (book, author, page, edition,
//     publisher, language, confidence).
//
// SEARCH MODES:
//   arabic | harakat_insensitive (normalized match), exact, malayalam,
//   english, semantic (broad text), root (Arabic consonant root), fuzzy
//
// SECURITY: Owner-only (AdminProfile.is_owner === true). Cloud connector
// tokens never leave the backend.
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    let isOwner = false;
    try {
      const profiles = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
      const profile = (profiles || []).find(
        (p) => (p.user_id && p.user_id === user.id) ||
          (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
      );
      isOwner = profile?.is_owner === true;
    } catch { isOwner = false; }
    if (!isOwner) return Response.json({ error: 'Only the Owner can use the Unified Knowledge Search' }, { status: 403 });

    const sdk = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || '').trim();
    const mode = String(body.mode || 'harakat_insensitive');
    const limit = Math.min(Math.max(parseInt(body.limit, 10) || 40, 1), 80);
    if (!query) return Response.json({ error: 'query is required' }, { status: 400 });

    // ── Arabic normalization (harakat/tatweel strip) ──
    const stripHarakat = (s) => (s || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '').replace(/[\u0622\u0623\u0625\u0649]/g, '\u0627').trim();
    const normQ = stripHarakat(query);

    // ══════════════════════════════════════════════════════════════
    // KNOWLEDGE CACHE — verified-hit fast path (zero AI, zero credits).
    // Before any search/AI, check if the Owner has already verified
    // knowledge for this exact (query, mode). If so, return it
    // instantly. This is req 3 + req 7: retrieve instantly, never
    // re-run AI for the same query.
    // ══════════════════════════════════════════════════════════════
    const queryNormalized = `${normQ.toLowerCase()}|${mode}`;
    let contentHash = '';
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(queryNormalized));
      contentHash = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (_) {}
    const cacheId = `KC-${contentHash}`;

    if (contentHash) {
      try {
        const cached = await sdk.entities.KnowledgeCache.filter(
          { cache_id: cacheId, verification_status: 'verified' },
          '-approved_at',
          1
        );
        if (cached && cached.length > 0) {
          const c = cached[0];
          // Bump serve count (best-effort) — every serve = one AI run avoided.
          sdk.entities.KnowledgeCache.update(c.id || c._id, {
            last_served_at: new Date().toISOString(),
            serve_count: (c.serve_count || 0) + 1,
          }).catch(() => {});
          // Reconstruct the SAME response shape the page expects, from the cache.
          const cachedDb = (c.db_results_summary || []).map((p) => ({
            page_id: '', master_book_id: p.master_book_id, page_number: p.page_number, page_label: p.page_label || '',
            original_pdf_name: p.book_title || '', cloud_source: 'Indexed',
            arabic: '', verified_arabic: '', english: '', malayalam: '', ocr_text: '',
            ocr_confidence: p.ocr_confidence ?? 100,
            duplicate_status: p.duplicate_status || 'Unique', related_books: [],
            citation: {
              author: p.author || '', book_title: p.book_title || '', volume: p.volume || '',
              page: p.page_number, publisher: p.publisher || '', edition: p.edition || '',
              language: p.language || '', year: p.publication_year || '',
            },
            content_hash: p.content_hash || '', ai_classification: {}, processing_date: '', review_status: 'verified',
            original_scan_url: '', pdf_file_url: '',
          }));
          return Response.json({
            query, mode,
            counts: { db: cachedDb.length, googleDrive: 0, oneDrive: 0, adobe: 0 },
            db_results: cachedDb,
            cloud_matches: { googleDrive: [], oneDrive: [], adobe: { available: false, note: 'Served from verified cache.' } },
            scholarly_entries: c.scholarly_entries || null,
            llm_ran: false,
            served_from_cache: true,
            cache_id: cacheId,
            pending_owner_review: false,
            confidence_score: c.confidence_score || 0,
            serve_count: (c.serve_count || 0) + 1,
            approved_at: c.approved_at || '',
          });
        }
      } catch (_) { /* cache miss → fall through to normal search */ }
    }
    const arabicRoot = (s) => {
      const n = (s || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '');
      return n.replace(/[\u0627\u0623\u0625\u0622\u0648\u064a\u0649\u0621\u0651]/g, '').trim();
    };
    const rootQ = arabicRoot(query);

    // ── 1. Indexed Master PDF Library (uploaded + cloud-imported) ──
    const [pages, books] = await Promise.all([
      sdk.entities.MasterPdfPage.list('-indexed_at', 500),
      sdk.entities.MasterPdfBook.list('-upload_date', 200),
    ]);
    const bookMap = {};
    (books || []).forEach((b) => { bookMap[b.master_book_id] = b; });

    const lower = query.toLowerCase();
    const matched = (pages || []).filter((p) => {
      const an = p.arabic_normalized || stripHarakat(p.arabic_text || '');
      const st = (p.search_text || '').toLowerCase();
      const ar = p.arabic_text || '';
      if (mode === 'exact') return ar === query || an === normQ || st.includes(lower);
      if (mode === 'arabic' || mode === 'harakat_insensitive') return an.includes(normQ);
      if (mode === 'root') { const r = arabicRoot(p.arabic_text || ''); return r.includes(rootQ) || an.includes(normQ); }
      if (mode === 'malayalam' || mode === 'english') return st.includes(lower);
      if (mode === 'semantic') {
        const words = lower.split(/\s+/).filter((w) => w.length > 2);
        return words.length === 0 || words.some((w) => st.includes(w)) || an.includes(normQ);
      }
      if (mode === 'fuzzy') {
        let i = 0; const hay = st;
        for (const ch of lower) { const idx = hay.indexOf(ch, i); if (idx === -1) return an.includes(normQ); i = idx + 1; }
        return true;
      }
      return an.includes(normQ) || st.includes(lower);
    });

    const hashCount = {};
    (pages || []).forEach((p) => { if (p.content_hash) hashCount[p.content_hash] = (hashCount[p.content_hash] || 0) + 1; });

    const dbResults = matched.slice(0, limit).map((p) => {
      const b = bookMap[p.master_book_id] || {};
      const part = (Array.isArray(b.pdf_parts) ? b.pdf_parts : []).find((pt) => pt.part_id === p.source_part_id) || null;
      const dupCount = p.content_hash ? hashCount[p.content_hash] : 0;
      const siblings = matched.filter((s) => s.content_hash && s.content_hash === p.content_hash && s.id !== p.id).map((s) => ({
        book_title: (bookMap[s.master_book_id] || {}).book_title || '',
        page_number: s.page_number,
        author: (bookMap[s.master_book_id] || {}).author || '',
      }));
      const citation = {
        author: b.author || '', book_title: b.book_title || '', volume: b.volume || '',
        page: p.page_number, publisher: b.publisher || '', edition: b.edition || '',
        language: b.language || '', year: b.publication_year || '',
      };
      return {
        page_id: p.id || p._id, master_book_id: p.master_book_id, page_number: p.page_number, page_label: p.page_label || '',
        original_pdf_name: part?.file_name || b.book_title || '',
        cloud_source: b.import_source === 'onedrive' || b.onedrive_file_id ? 'OneDrive'
          : b.import_source === 'adobe' || b.adobe_file_id ? 'Adobe Document Cloud'
          : (b.import_source === 'upload' || b.import_source === 'multi_upload') ? 'Uploaded'
          : b.import_source || 'Indexed',
        arabic: p.arabic_text || '', verified_arabic: p.arabic_text || '',
        english: p.english_text || p.ocr_text_en || '',
        malayalam: p.malayalam_text || p.ocr_text_ml || '',
        ocr_text: p.ocr_text || '',
        ocr_confidence: p.ocr_confidence ?? 100,
        duplicate_status: dupCount > 1 ? `Supported by ${dupCount} sources` : 'Unique',
        related_books: siblings,
        citation,
        content_hash: p.content_hash || '',
        ai_classification: p.ai_classification || {},
        processing_date: p.indexed_at || '',
        review_status: p.review_status || '',
        original_scan_url: p.original_scan_url || '',
        pdf_file_url: part?.file_url || '',
      };
    });

    // ── 2. Cloud sources (files not yet indexed) ──
    const cloudMatches = { googleDrive: [], oneDrive: [], adobe: { available: false, note: 'Adobe Document Cloud has no public full-text search API. Use the Master PDF Library → Cloud Search to extract a specific Adobe file.' } };

    try {
      const conn = await sdk.connectors.getConnection('googledrive');
      if (conn?.accessToken) {
        const escaped = query.replace(/'/g, "\\'");
        const q = `mimeType='application/pdf' and trashed=false and fullText contains '${escaped}'`;
        const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,mimeType,modifiedTime,size,webViewLink)&pageSize=25&orderBy=modifiedTime desc`, {
          headers: { Authorization: `Bearer ${conn.accessToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          cloudMatches.googleDrive = (data.files || []).map((f) => ({ id: f.id, name: f.name, modified_time: f.modifiedTime, size_bytes: Number(f.size) || 0, view_link: f.webViewLink || '' }));
        }
      }
    } catch (_) {}

    try {
      const conn = await sdk.connectors.getConnection('one_drive');
      if (conn?.accessToken) {
        const url = `https://graph.microsoft.com/v1.0/me/drive/root/microsoft.graph.search(q='${encodeURIComponent(query)}')?$select=name,id,size,lastModifiedDateTime,file,folder&$top=25`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${conn.accessToken}` } });
        if (res.ok) {
          const data = await res.json();
          cloudMatches.oneDrive = (data.value || [])
            .filter((it) => it.file && it.file.mimeType === 'application/pdf')
            .map((it) => ({ id: it.id, name: it.name, modified_time: it.lastModifiedDateTime, size_bytes: it.size || 0 }));
        }
      }
    } catch (_) {}

    // ── 3. AI comparison across all matched books (no fabrication, no merging) ──
    let scholarly = null;
    let llmRan = false;
    if (dbResults.length > 0) {
      const context = dbResults.slice(0, 25).map((r, i) => (
        `--- SOURCE ${i + 1} ---\nBook: ${r.citation.book_title}\nAuthor: ${r.citation.author}\nEdition: ${r.citation.edition}\nPublisher: ${r.citation.publisher}\nVolume: ${r.citation.volume}\nPage: ${r.citation.page}\nLanguage: ${r.citation.language}\nConfidence: ${r.ocr_confidence}%\nArabic (verified):\n${r.verified_arabic || '(none)'}\nOCR text:\n${(r.ocr_text || '').slice(0, 1200)}\nMalayalam:\n${r.malayalam || '(none)'}\nEnglish:\n${r.english || '(none)'}`
      )).join('\n\n');

      const prompt = `You are a FAITHFUL scholarly archivist for the Sirr al-Huruf project. The user searched for: "${query}".

Below are ${dbResults.length} matched sources from the Master PDF Library (uploaded + cloud-imported books). Your job is to COMPARE them and collect every authentic scholarly entry present in this content.

ABSOLUTE RULES:
1. Use ONLY the content provided below. Do NOT use any outside knowledge. Do NOT use the internet.
2. NEVER fabricate. If a category has no supporting content in the sources below, return an empty array [] for it.
3. NEVER merge conflicting scholarly opinions. If two sources give different meanings/khawass/benefits/etc., keep them as SEPARATE entries, each carrying its OWN citation. Record the disagreement in "conflicts".
4. Every entry MUST carry its source citation (book_title, author, page, edition, language) and a confidence score (0-100) based on OCR confidence and source authority.
5. Preserve Arabic text VERBATIM (every letter and harakat). Never translate Arabic into another language inside an Arabic entry.

COLLECT into these categories (only those with supporting content):
meanings, explanations, tafsir, khawass, mujarrabat, wazifa, hizb, dua, amal, magic_squares, talismans, repetitions, timings, conditions, warnings, benefits, related_verses, related_hadith, related_names, classical_references.

Return ONLY the JSON object per the schema. No commentary.

MATCHED SOURCES:
${context}`;

      const entryProps = {
        text: { type: 'string' },
        arabic: { type: 'string', default: '' },
        citation: { type: 'string' },
        source_book: { type: 'string', default: '' },
        source_page: { type: 'string', default: '' },
        language: { type: 'string', default: '' },
        confidence: { type: 'integer', default: 0 },
      };
      const entrySchema = { type: 'object', properties: entryProps, required: ['text', 'citation'] };
      const conflictSchema = {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          opinion_a: { type: 'object', properties: { text: { type: 'string' }, citation: { type: 'string' } }, required: ['text', 'citation'] },
          opinion_b: { type: 'object', properties: { text: { type: 'string' }, citation: { type: 'string' } }, required: ['text', 'citation'] },
        },
        required: ['topic', 'opinion_a', 'opinion_b'],
      };

      const schema = {
        type: 'object',
        properties: {
          comparison_summary: { type: 'string' },
          conflicts: { type: 'array', items: conflictSchema, default: [] },
          meanings: { type: 'array', items: entrySchema, default: [] },
          explanations: { type: 'array', items: entrySchema, default: [] },
          tafsir: { type: 'array', items: entrySchema, default: [] },
          khawass: { type: 'array', items: entrySchema, default: [] },
          mujarrabat: { type: 'array', items: entrySchema, default: [] },
          wazifa: { type: 'array', items: entrySchema, default: [] },
          hizb: { type: 'array', items: entrySchema, default: [] },
          dua: { type: 'array', items: entrySchema, default: [] },
          amal: { type: 'array', items: entrySchema, default: [] },
          magic_squares: { type: 'array', items: entrySchema, default: [] },
          talismans: { type: 'array', items: entrySchema, default: [] },
          repetitions: { type: 'array', items: entrySchema, default: [] },
          timings: { type: 'array', items: entrySchema, default: [] },
          conditions: { type: 'array', items: entrySchema, default: [] },
          warnings: { type: 'array', items: entrySchema, default: [] },
          benefits: { type: 'array', items: entrySchema, default: [] },
          related_verses: { type: 'array', items: entrySchema, default: [] },
          related_hadith: { type: 'array', items: entrySchema, default: [] },
          related_names: { type: 'array', items: entrySchema, default: [] },
          classical_references: { type: 'array', items: entrySchema, default: [] },
        },
        required: ['comparison_summary', 'conflicts'],
      };

      try {
        const out = await sdk.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: schema,
          model: 'gemini_3_flash',
        });
        scholarly = out && typeof out === 'object' ? out : null;
        llmRan = !!scholarly;
      } catch (e) {
        scholarly = { comparison_summary: 'AI reconciliation unavailable: ' + String(e?.message || e), conflicts: [] };
      }
    }

    // ══════════════════════════════════════════════════════════════
    // SAVE-PENDING — store the AI findings as a PENDING KnowledgeCache
    // entry so the Owner can review + approve. NEVER auto-published.
    // Idempotent: if a pending entry already exists for this query,
    // refresh its payload + last_repopulated_at + version_history
    // (append-only — previous payload hash preserved). If a verified
    // entry exists, do NOT overwrite it (req 9); instead create a new
    // pending entry so the Owner can compare and re-approve (the old
    // verified entry is later marked 'superseded' on re-approval).
    // ══════════════════════════════════════════════════════════════
    let pendingSaved = false;
    let pendingCacheId = '';
    if (contentHash && (dbResults.length > 0 || scholarly)) {
      try {
        const dbSummary = dbResults.map((r) => ({
          master_book_id: r.master_book_id, book_title: r.citation?.book_title || r.original_pdf_name || '',
          author: r.citation?.author || '', page_number: r.page_number, page_label: r.page_label || '',
          edition: r.citation?.edition || '', publisher: r.citation?.publisher || '',
          volume: r.citation?.volume || '', language: r.citation?.language || '',
          publication_year: r.citation?.year || '', ocr_confidence: r.ocr_confidence ?? 100,
          content_hash: r.content_hash || '', duplicate_status: r.duplicate_status || '',
        }));
        const sourceBooks = dbResults.map((r) => ({
          book_title: r.citation?.book_title || r.original_pdf_name || '',
          author: r.citation?.author || '', page: String(r.page_number || ''),
          pdf_page: r.page_number || 0,
          citation: `${r.citation?.author ? r.citation.author + ', ' : ''}${r.citation?.book_title || ''}${r.citation?.edition ? ', ' + r.citation.edition : ''}${r.citation?.publisher ? ', ' + r.citation.publisher : ''}${r.page_number ? ', p.' + r.page_number : ''}`,
          edition: r.citation?.edition || '', publisher: r.citation?.publisher || '', language: r.citation?.language || '',
        }));
        const minConf = dbResults.length > 0 ? Math.min(...dbResults.map((r) => r.ocr_confidence ?? 100)) : 100;
        const now = new Date().toISOString();

        const existing = await sdk.entities.KnowledgeCache.filter(
          { cache_id: cacheId, verification_status: 'pending_review' }, undefined, 1
        ).catch(() => []);
        if (existing && existing.length > 0) {
          // Refresh the pending payload (append-only version trail of the pending state).
          const ex = existing[0];
          let prevHash = '';
          try {
            const pb = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(ex.scholarly_entries || {})));
            prevHash = Array.from(new Uint8Array(pb)).map((b) => b.toString(16).padStart(2, '0')).join('');
          } catch (_) {}
          const vh = Array.isArray(ex.version_history) ? [...ex.version_history] : [];
          vh.push({ version: vh.length + 1, timestamp: now, action: 'repopulated', changed_by: user?.id || '', changed_by_name: user?.full_name || user?.email || '', summary: 'New AI run refreshed the pending payload before re-approval.', previous_status: 'pending_review', previous_payload_hash: prevHash });
          await sdk.entities.KnowledgeCache.update(ex.id || ex._id, {
            scholarly_entries: scholarly || {}, db_results_summary: dbSummary, source_books: sourceBooks,
            ocr_confidence_min: minConf, ai_was_used: true, llm_model: 'gemini_3_flash',
            last_repopulated_at: now, version_history: vh, query, mode,
          }).catch(() => {});
          pendingSaved = true; pendingCacheId = cacheId;
        } else {
          // No pending entry yet — create one. (If a verified entry exists for this
          // query, it is left untouched per req 9; the Owner reviews the new pending
          // entry and may re-approve, which supersedes the old verified one.)
          const vh = [{ version: 1, timestamp: now, action: 'created', changed_by: user?.id || '', changed_by_name: user?.full_name || user?.email || '', summary: 'Created from unifiedKnowledgeSearch AI run — awaiting Owner review.', previous_status: '', previous_payload_hash: '' }];
          await sdk.entities.KnowledgeCache.create({
            cache_id: cacheId, query, mode, query_normalized: queryNormalized, content_hash: contentHash,
            requesting_module: 'unified_search',
            scholarly_entries: scholarly || {}, db_results_summary: dbSummary, source_books: sourceBooks,
            linked_cards: [], verification_status: 'pending_review',
            confidence_score: minConf, ocr_confidence_min: minConf,
            ai_was_used: true, llm_model: 'gemini_3_flash',
            approved_by: '', approved_by_name: '', approved_at: '',
            approval_history: [], version_history: vh,
            created_at: now, last_served_at: '', serve_count: 0, last_repopulated_at: now,
          }).catch(() => {});
          pendingSaved = true; pendingCacheId = cacheId;
        }
      } catch (_) { /* save-pending failure never blocks the response */ }
    }

    return Response.json({
      query,
      mode,
      counts: {
        db: dbResults.length,
        googleDrive: cloudMatches.googleDrive.length,
        oneDrive: cloudMatches.oneDrive.length,
        adobe: cloudMatches.adobe.available ? cloudMatches.adobe.note : 0,
      },
      db_results: dbResults,
      cloud_matches: cloudMatches,
      scholarly_entries: scholarly,
      llm_ran: llmRan,
      served_from_cache: false,
      pending_owner_review: pendingSaved,
      cache_id: pendingCacheId || cacheId,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});