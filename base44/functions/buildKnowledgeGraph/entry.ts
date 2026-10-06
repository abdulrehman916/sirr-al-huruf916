import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE RELATIONSHIP / GRAPH ENGINE
//
// Given a Holy Name, Ayah, Dua, Word, Letter or Topic plus the already
// matched Master PDF Library content, the AI builds the complete
// relationship graph across every connected book:
//   • related Names of Allah · related verses · related hadith
//   • related formulas (wafq / talisman / dua)
//   • related books
// plus the organized scholarly collection (meanings, tafsir, khawass,
// mujarrabat, wazifa, hizb, dua, amal, magic squares, talismans,
// benefits, repetitions, timings, conditions, warnings).
//
// STRICT RULES: never fabricate (use only the provided matched
// content); never merge conflicting opinions (each carries its own
// citation, conflicts surfaced separately).
//
// SECURITY: Owner-only. The frontend passes `matched_content` (the
// db_results it already has from unifiedKnowledgeSearch), so this
// function does NOT duplicate the search/connector logic (DRY).
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
      const profile = (profiles || []).find((p) => (p.user_id && p.user_id === user.id) || (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase()));
      isOwner = profile?.is_owner === true;
    } catch {}
    if (!isOwner) return Response.json({ error: 'Only the Owner can build the knowledge graph' }, { status: 403 });

    const sdk = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const query = String(body.query || '').trim();
    const matched = Array.isArray(body.matched) ? body.matched : [];
    if (!query) return Response.json({ error: 'query is required' }, { status: 400 });
    if (matched.length === 0) return Response.json({ error: 'No matched content provided. Run a Unified Knowledge Search first.' }, { status: 400 });

    const context = matched.slice(0, 25).map((r, i) => (
      `--- SOURCE ${i + 1} ---\nBook: ${r.citation?.book_title || ''}\nAuthor: ${r.citation?.author || ''}\nPage: ${r.citation?.page || ''}\nLanguage: ${r.citation?.language || ''}\nArabic:\n${r.arabic || r.verified_arabic || '(none)'}\nOCR:\n${(r.ocr_text || '').slice(0, 900)}\nMalayalam:\n${r.malayalam || '(none)'}\nEnglish:\n${r.english || '(none)'}`
    )).join('\n\n');

    const prompt = `You are a faithful scholarly relationship builder for the Sirr al-Huruf project. The user searched for: "${query}".

Below are ${matched.length} matched sources. Build the COMPLETE relationship graph for "${query}" using ONLY this content.

ABSOLUTE RULES:
1. Use ONLY the content provided. Never fabricate. Never use outside knowledge or the internet.
2. Never merge conflicting opinions — each related entry carries its OWN citation; record disagreements in "conflicts".
3. Preserve Arabic VERBATIM (every letter and harakat).
4. Each node entry: {text, arabic (if applicable), citation (book · author · page), confidence 0-100}.

Build:
- related_names: Names of Allah / divine names connected to this entity.
- related_verses: Quran verses connected.
- related_hadith: hadith connected.
- related_formulas: wafq / talisman / dua / invocation formulas connected.
- related_books: books in the matched set that contain this entity.
- scholarly: organized collection {meanings, tafsir, khawass, mujarrabat, wazifa, hizb, dua, amal, magic_squares, talismans, benefits, repetitions, timings, conditions, warnings} — each an array of node entries, EMPTY [] when no supporting content.
- edges: [{from, to, relationship, citation}] linking the entity to related nodes.
- conflicts: [{topic, opinion_a:{text,citation}, opinion_b:{text,citation}}].

Return ONLY the JSON object per schema.`;

    const nodeProps = {
      text: { type: 'string' },
      arabic: { type: 'string', default: '' },
      citation: { type: 'string' },
      confidence: { type: 'integer', default: 0 },
    };
    const nodeSchema = { type: 'object', properties: nodeProps, required: ['text', 'citation'] };
    const scholarlyProps = {};
    ['meanings','tafsir','khawass','mujarrabat','wazifa','hizb','dua','amal','magic_squares','talismans','benefits','repetitions','timings','conditions','warnings'].forEach((k) => {
      scholarlyProps[k] = { type: 'array', items: nodeSchema, default: [] };
    });
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
        entity: { type: 'string' },
        summary: { type: 'string' },
        related_names: { type: 'array', items: nodeSchema, default: [] },
        related_verses: { type: 'array', items: nodeSchema, default: [] },
        related_hadith: { type: 'array', items: nodeSchema, default: [] },
        related_formulas: { type: 'array', items: nodeSchema, default: [] },
        related_books: { type: 'array', items: nodeSchema, default: [] },
        scholarly: { type: 'object', properties: scholarlyProps, required: [] },
        edges: { type: 'array', items: { type: 'object', properties: { from: { type: 'string' }, to: { type: 'string' }, relationship: { type: 'string' }, citation: { type: 'string' } }, required: ['from', 'to', 'relationship'] }, default: [] },
        conflicts: { type: 'array', items: conflictSchema, default: [] },
      },
      required: ['entity', 'summary', 'scholarly', 'edges', 'conflicts'],
    };

    let out;
    try {
      out = await sdk.integrations.Core.InvokeLLM({ prompt, response_json_schema: schema, model: 'gemini_3_flash' });
    } catch (e) {
      return Response.json({ error: 'Graph build failed: ' + String(e?.message || e) }, { status: 502 });
    }
    return Response.json({ success: true, query, graph: out });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});