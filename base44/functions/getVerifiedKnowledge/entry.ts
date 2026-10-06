import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// getVerifiedKnowledge — PUBLIC READ PATH for the Knowledge Cache.
//
// Every module (Holy Names, Du'a, Ayat, Wafq, Khawas, Mujarrabat,
// Abjad, Methods, Nine Mizan, Astro Clock, Sirr, etc.) calls THIS
// function to retrieve already-verified scholarly knowledge.
//
// ZERO AI. ZERO CREDITS. ZERO RE-INDEXING.
//   - Reads ONLY KnowledgeCache entries with verification_status='verified'.
//   - Never calls InvokeLLM, never searches PDFs, never touches cloud.
//   - If a verified cache entry exists for the query+mode → instant return.
//   - If none exists → returns { found: false } so the module can fall
//     back to its own data or prompt the Owner to run unifiedKnowledgeSearch.
//
// SECURITY:
//   - Any authenticated user may call this (modules are public-read).
//   - Uses service-role to read the admin-only KnowledgeCache entity,
//     then returns ONLY verified entries — pending/rejected/needs_revision
//     entries are NEVER exposed to non-owners.
//   - Owners see their own pending entries via unifiedKnowledgeSearch /
//     the Owner Pending Reviews page, not here.
//
// This is the "Knowledge Cache" (req 7): repeated requests always use
// stored verified data instead of AI. Every serve increments serve_count
// (proving AI calls avoided).
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    // Any authenticated user (modules are public-read). Anonymous callers
    // still get verified knowledge — it is published, approved content.
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const query = String(body.query || '').trim();
    const mode = String(body.mode || 'harakat_insensitive');
    const requestingModule = String(body.requesting_module || 'unknown');
    const limit = Math.min(Math.max(parseInt(body.limit, 10) || 1, 1), 5);
    if (!query) return Response.json({ found: false, reason: 'no_query', served_from_cache: false });

    // ── Normalize the query to the cache key (must match unifiedKnowledgeSearch) ──
    const stripHarakat = (s) => (s || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '').replace(/[\u0622\u0623\u0625\u0649]/g, '\u0627').trim();
    const queryNormalized = `${stripHarakat(query).toLowerCase()}|${mode}`;

    // ── Read ONLY verified cache entries for this query+mode ──
    const candidates = await sdk.entities.KnowledgeCache.filter(
      { query_normalized: queryNormalized, verification_status: 'verified' },
      '-approved_at',
      limit
    ).catch(() => []);

    if (!candidates || candidates.length === 0) {
      return Response.json({
        found: false,
        reason: 'no_verified_cache_entry',
        query,
        mode,
        served_from_cache: false,
        hint: 'No verified knowledge cached for this query. The Owner can run unifiedKnowledgeSearch to generate and approve it.',
      });
    }

    const entry = candidates[0];

    // ── Bump serve count + last_served_at (best-effort; never blocks the read) ──
    const now = new Date().toISOString();
    sdk.entities.KnowledgeCache.update(entry.id || entry._id, {
      last_served_at: now,
      serve_count: (entry.serve_count || 0) + 1,
    }).catch(() => {});

    return Response.json({
      found: true,
      served_from_cache: true,
      cache_id: entry.cache_id,
      query: entry.query,
      mode: entry.mode,
      requesting_module: requestingModule,
      confidence_score: entry.confidence_score || 0,
      ocr_confidence_min: entry.ocr_confidence_min ?? 100,
      ai_was_used_once: entry.ai_was_used === true,
      llm_model: entry.llm_model || '',
      approved_at: entry.approved_at || '',
      approved_by_name: entry.approved_by_name || '',
      serve_count: (entry.serve_count || 0) + 1,
      // The verified knowledge card payload:
      scholarly_entries: entry.scholarly_entries || {},
      db_results_summary: entry.db_results_summary || [],
      source_books: entry.source_books || [],
      linked_cards: entry.linked_cards || [],
      created_at: entry.created_at || '',
      version_count: (entry.version_history || []).length,
      // Provenance for every fact (req 8):
      provenance: {
        source_books: entry.source_books || [],
        date_indexed: entry.created_at || '',
        verification_status: 'verified',
        approved_at: entry.approved_at || '',
        approved_by: entry.approved_by_name || '',
        approval_history: entry.approval_history || [],
      },
    });
  } catch (error) {
    return Response.json({ error: error.message, found: false, served_from_cache: false }, { status: 500 });
  }
});