import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// CLEANUP MARKER RECORDS — Safely removes obsolete marker records
// from the 4 canonical knowledge stores.
//
// MARKER LIFECYCLE:
// 1. When an entry is routed to a module, the enrichment function
//    analyzes it. If no module-specific knowledge is found, a marker
//    record (is_marker=true) is created to prevent reprocessing.
// 2. A KnowledgeRouting record is also created for the entry.
// 3. The marker is OBSOLETE when:
//    a. The entry's KnowledgeRouting record exists (entry was successfully routed)
//    b. The marker is older than 30 days (no longer needed for retry)
//
// SAFETY RULES:
// - Never delete markers for entries without a KnowledgeRouting record
//   (these entries haven't been routed yet — markers are still needed)
// - Never delete non-marker records (real knowledge)
// - Keep retry logic intact (only delete markers for successfully routed entries)
// - Report all deletions for audit trail
//
// ADMIN ONLY.
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { older_than_days, dry_run } = body;
    const MIN_AGE_DAYS = older_than_days || 30;
    const cutoffDate = new Date(Date.now() - MIN_AGE_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Get all KnowledgeRouting records — these tell us which entries have been routed
    const routingRecords = await base44.asServiceRole.entities.KnowledgeRouting.list('-created_date', 500);
    const routedEntryIds = new Set(routingRecords.map((r: any) => r.entry_id));

    const results: { entity: string; total_markers: number; obsolete: number; deleted: number; retained: number }[] = [];

    const knowledgeEntities = [
      { name: 'AstroClockKnowledge', entity: 'AstroClockKnowledge' },
      { name: 'DuaKnowledge', entity: 'DuaKnowledge' },
      { name: 'RitualKnowledge', entity: 'RitualKnowledge' },
      { name: 'WafqKnowledge', entity: 'WafqKnowledge' },
    ];

    for (const { name, entity } of knowledgeEntities) {
      try {
        // Get all marker records for this entity
        const markers = await base44.asServiceRole.entities[entity].filter(
          { is_marker: true },
          '-created_date',
          200
        );

        if (!markers || markers.length === 0) {
          results.push({ entity: name, total_markers: 0, obsolete: 0, deleted: 0, retained: 0 });
          continue;
        }

        // Classify markers: obsolete vs retained
        const obsolete: any[] = [];
        const retained: any[] = [];

        for (const marker of markers) {
          const entryId = marker.source_entry_id;
          const hasRouting = entryId && routedEntryIds.has(entryId);
          const markerDate = marker.created_date || marker.updated_date || '';
          const isOldEnough = !markerDate || markerDate < cutoffDate;

          // Obsolete = entry has been routed AND marker is old enough
          if (hasRouting && isOldEnough) {
            obsolete.push(marker);
          } else {
            retained.push(marker);
          }
        }

        let deleted = 0;
        if (!dry_run && obsolete.length > 0) {
          // Delete obsolete markers individually (safe — each is a specific marker record)
          for (const marker of obsolete) {
            try {
              await base44.asServiceRole.entities[entity].delete(marker.id);
              deleted++;
            } catch { /* continue on individual delete error */ }
          }
        } else if (dry_run) {
          deleted = 0; // dry run — don't actually delete
        }

        results.push({
          entity: name,
          total_markers: markers.length,
          obsolete: obsolete.length,
          deleted: dry_run ? 0 : deleted,
          retained: retained.length,
        });
      } catch (e: any) {
        results.push({ entity: name, total_markers: 0, obsolete: 0, deleted: 0, retained: 0 });
      }
    }

    const totalMarkers = results.reduce((s, r) => s + r.total_markers, 0);
    const totalObsolete = results.reduce((s, r) => s + r.obsolete, 0);
    const totalDeleted = results.reduce((s, r) => s + r.deleted, 0);
    const totalRetained = results.reduce((s, r) => s + r.retained, 0);

    return Response.json({
      status: dry_run ? 'dry_run_complete' : 'cleanup_complete',
      older_than_days: MIN_AGE_DAYS,
      cutoff_date: cutoffDate,
      results,
      summary: {
        total_markers: totalMarkers,
        obsolete: totalObsolete,
        deleted: dry_run ? 0 : totalDeleted,
        retained: totalRetained,
      },
      message: dry_run
        ? `Dry run: ${totalObsolete} of ${totalMarkers} markers are obsolete (would delete). ${totalRetained} retained.`
        : `Cleanup complete: ${totalDeleted} obsolete markers deleted, ${totalRetained} retained (entries not yet routed or too recent).`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'cleanup_failed' }, { status: 500 });
  }
});