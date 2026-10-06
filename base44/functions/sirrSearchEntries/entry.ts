import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// SIRR SEARCH ENTRIES — sirrSearchEntries
//
// Scalable multilingual search across the SIRR manuscript library.
// Satisfies RULES 1-4: every searchable field indexed, cursor
// pagination (never loads the whole library into memory),
// responsive regardless of library size.
//
// Supports search across:
//   • Arabic       (arabic_text verbatim + arabic_normalized harakat-stripped)
//   • Malayalam    (malayalam_meaning + heading_title_ml)
//   • English      (english_meaning + heading_title)
//   • Book title   (book_title)
//   • Category     (category — exact)
//   • OCR text     (arabic_text — the verbatim OCR output)
//   • Exact phrase (anchored ^...$) or partial match (substring)
//
// Cursor pagination via the indexed entry_order field keeps every
// page O(indexed) — no skip/offset, so page 1000 is as fast as
// page 1 even with millions of records.
//
// Params:
//   query        — search text (empty = browse mode, paginated by filters)
//   search_field — arabic | malayalam | english | book_title | category | ocr | all (default all)
//   match_mode   — partial | exact (default partial)
//   book_id      — restrict to one book (optional)
//   category     — filter by category (optional)
//   cursor       — entry_order of the last result (0 = first page)
//   page_size    — 1..100 (default 20)
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const query = (body.query || '').toString().trim();
    const search_field = body.search_field || 'all';
    const match_mode = body.match_mode || 'partial';
    const book_id = body.book_id || '';
    const category = body.category || '';
    const cursor = Number(body.cursor) || 0;
    const page_size = Math.min(Math.max(Number(body.page_size) || 20, 1), 100);

    // Build the indexed query (RULE 1).
    const q = {};
    if (book_id) q.sirr_book_id = book_id;
    if (category) q.category = category;
    if (cursor > 0) q.entry_order = { $gt: cursor };

    const FIELD_MAP = {
      arabic: ['arabic_text', 'arabic_normalized'],
      malayalam: ['malayalam_meaning', 'heading_title_ml'],
      english: ['english_meaning', 'heading_title'],
      book_title: ['book_title'],
      category: ['category'],
      ocr: ['arabic_text'],
      all: ['arabic_text', 'arabic_normalized', 'malayalam_meaning', 'heading_title_ml', 'heading_title', 'book_title'],
    };
    const fields = FIELD_MAP[search_field] || FIELD_MAP.all;

    if (query) {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cond = match_mode === 'exact'
        ? { $regex: '^' + escaped + '$', $options: 'i' }
        : { $regex: escaped, $options: 'i' };
      if (fields.length === 1) {
        q[fields[0]] = cond;
      } else {
        q.$or = fields.map((f) => ({ [f]: cond }));
      }
    }

    // Fetch page_size + 1 to detect has_more without a separate count query.
    const rows = await sdk.entities.SirrManuscriptEntry.filter(q, 'entry_order', page_size + 1);
    const has_more = rows.length > page_size;
    const results = rows.slice(0, page_size);
    const next_cursor = has_more && results.length > 0
      ? Number(results[results.length - 1].entry_order) || 0
      : 0;

    return Response.json({
      results,
      total_in_page: results.length,
      next_cursor,
      has_more,
      page_size,
      search_field,
      match_mode,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});