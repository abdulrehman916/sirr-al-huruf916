import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// CLEANUP FAILED IMPORT — ROLLBACK FOR MANUSCRIPT PIPELINE
// ═══════════════════════════════════════════════════════════════
// Deletes ALL pipeline data for a given book_id:
//   - ManuscriptEntry records
//   - ManuscriptHeading records
//   - KnowledgeRouting records
//   - AstroClockKnowledge records (by source_book_id)
//   - DuaKnowledge records (by source_book_id)
//   - RitualKnowledge records (by source_book_id)
//   - WafqKnowledge records (by source_book_id)
//   - ManuscriptBook record (if delete_book=true)
//
// Use this to roll back a partially-failed import or to completely
// remove a book and all its derived data from the pipeline.
//
// The original PDF file in Base44 storage and OneDrive is NOT deleted.
// The book can always be re-imported from scratch.
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
    const { book_id, delete_book } = body;

    if (!book_id) {
      return Response.json({ error: 'book_id is required' }, { status: 400 });
    }

    // Verify book exists
    const books = await base44.asServiceRole.entities.ManuscriptBook.filter({ book_id });
    if (!books || books.length === 0) {
      return Response.json({ error: 'Book not found: ' + book_id }, { status: 404 });
    }
    const book = books[0];

    const results: { entity: string; status: string; count: number }[] = [];

    // 1. Delete ManuscriptEntry records
    try {
      const entries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id }, '-created_date', 500);
      const count = entries.length;
      if (count > 0) {
        await base44.asServiceRole.entities.ManuscriptEntry.deleteMany({ book_id });
      }
      results.push({ entity: 'ManuscriptEntry', status: 'deleted', count });
    } catch (e: any) {
      results.push({ entity: 'ManuscriptEntry', status: 'error: ' + e.message, count: 0 });
    }

    // 2. Delete ManuscriptHeading records
    try {
      const headings = await base44.asServiceRole.entities.ManuscriptHeading.filter({ book_id }, '-created_date', 500);
      const count = headings.length;
      if (count > 0) {
        await base44.asServiceRole.entities.ManuscriptHeading.deleteMany({ book_id });
      }
      results.push({ entity: 'ManuscriptHeading', status: 'deleted', count });
    } catch (e: any) {
      results.push({ entity: 'ManuscriptHeading', status: 'error: ' + e.message, count: 0 });
    }

    // 3. Delete KnowledgeRouting records
    try {
      const routes = await base44.asServiceRole.entities.KnowledgeRouting.filter({ book_id }, '-created_date', 500);
      const count = routes.length;
      if (count > 0) {
        await base44.asServiceRole.entities.KnowledgeRouting.deleteMany({ book_id });
      }
      results.push({ entity: 'KnowledgeRouting', status: 'deleted', count });
    } catch (e: any) {
      results.push({ entity: 'KnowledgeRouting', status: 'error: ' + e.message, count: 0 });
    }

    // 4. Delete AstroClockKnowledge records
    try {
      const astro = await base44.asServiceRole.entities.AstroClockKnowledge.filter({ source_book_id: book_id }, '-created_date', 500);
      const count = astro.length;
      if (count > 0) {
        await base44.asServiceRole.entities.AstroClockKnowledge.deleteMany({ source_book_id: book_id });
      }
      results.push({ entity: 'AstroClockKnowledge', status: 'deleted', count });
    } catch (e: any) {
      results.push({ entity: 'AstroClockKnowledge', status: 'error: ' + e.message, count: 0 });
    }

    // 5. Delete DuaKnowledge records
    try {
      const dua = await base44.asServiceRole.entities.DuaKnowledge.filter({ source_book_id: book_id }, '-created_date', 500);
      const count = dua.length;
      if (count > 0) {
        await base44.asServiceRole.entities.DuaKnowledge.deleteMany({ source_book_id: book_id });
      }
      results.push({ entity: 'DuaKnowledge', status: 'deleted', count });
    } catch (e: any) {
      results.push({ entity: 'DuaKnowledge', status: 'error: ' + e.message, count: 0 });
    }

    // 6. Delete RitualKnowledge records
    try {
      const ritual = await base44.asServiceRole.entities.RitualKnowledge.filter({ source_book_id: book_id }, '-created_date', 500);
      const count = ritual.length;
      if (count > 0) {
        await base44.asServiceRole.entities.RitualKnowledge.deleteMany({ source_book_id: book_id });
      }
      results.push({ entity: 'RitualKnowledge', status: 'deleted', count });
    } catch (e: any) {
      results.push({ entity: 'RitualKnowledge', status: 'error: ' + e.message, count: 0 });
    }

    // 7. Delete WafqKnowledge records
    try {
      const wafq = await base44.asServiceRole.entities.WafqKnowledge.filter({ source_book_id: book_id }, '-created_date', 500);
      const count = wafq.length;
      if (count > 0) {
        await base44.asServiceRole.entities.WafqKnowledge.deleteMany({ source_book_id: book_id });
      }
      results.push({ entity: 'WafqKnowledge', status: 'deleted', count });
    } catch (e: any) {
      results.push({ entity: 'WafqKnowledge', status: 'error: ' + e.message, count: 0 });
    }

    // 8. Optionally delete the ManuscriptBook record
    if (delete_book) {
      try {
        await base44.asServiceRole.entities.ManuscriptBook.delete(book.id);
        results.push({ entity: 'ManuscriptBook', status: 'deleted', count: 1 });
      } catch (e: any) {
        results.push({ entity: 'ManuscriptBook', status: 'error: ' + e.message, count: 0 });
      }
    }

    const totalDeleted = results.reduce((sum, r) => sum + r.count, 0);

    return Response.json({
      status: 'cleanup_complete',
      book_id,
      book_title: book.book_title,
      results,
      total_deleted: totalDeleted,
      book_deleted: !!delete_book,
      message: `Cleanup complete. ${totalDeleted} records deleted across ${results.length} entities.${delete_book ? ' Book record also deleted.' : ' Book record preserved (delete_book=true to also remove it).'}`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'cleanup_failed' }, { status: 500 });
  }
});