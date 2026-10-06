// ═══════════════════════════════════════════════════════════════
// ROLLBACK: EntityKnowledge verification_status migration
//
// Reverses the migration that set verification_status and extraction_confidence
// on all EntityKnowledge records. This function:
//   1. $unset verification_status from ALL records (reverts to pre-migration state)
//   2. $unset extraction_confidence from ALL records (reverts to pre-migration state)
//
// SAFETY:
//   - Admin-only (verifies user.role === 'admin')
//   - Does NOT modify any content fields (knowledge_text_en, knowledge_text_ar,
//     knowledge_text_ml, structured_data, content_hash, canonical_key, etc.)
//   - Does NOT delete any records
//   - Does NOT change entity mappings, IDs, or source references
//   - Only removes the two metadata fields added during the migration
//
// After rollback, the useEntityKnowledge hook will need to be updated to
// stop filtering by verification_status (otherwise no records will display).
// ═══════════════════════════════════════════════════════════════
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    // Step 1: Count records before rollback
    const allRecords = await base44.asServiceRole.entities.EntityKnowledge.list('-created_date', 200);
    const recordsWithVerification = allRecords.filter(r => r.verification_status !== undefined && r.verification_status !== null);
    const recordsWithConfidence = allRecords.filter(r => r.extraction_confidence !== undefined && r.extraction_confidence !== null);

    // Step 2: $unset both fields from ALL records
    // This is fully reversible — it only removes the metadata fields,
    // never touches content, IDs, or source references.
    const rollbackResult = await base44.asServiceRole.entities.EntityKnowledge.updateMany(
      {},
      { $unset: { verification_status: "", extraction_confidence: "" } }
    );

    return Response.json({
      status: "rollback_complete",
      rollback_date: new Date().toISOString(),
      records_total: allRecords.length,
      records_that_had_verification_status: recordsWithVerification.length,
      records_that_had_extraction_confidence: recordsWithConfidence.length,
      updateMany_result: rollbackResult,
      message: " verification_status and extraction_confidence have been removed from all EntityKnowledge records. No content, IDs, or source references were modified. To restore display, update useEntityKnowledge hook to remove the verification_status filter.",
      note: "This rollback is permanent for the metadata fields. If you need to re-apply the migration, run the migration updateMany again.",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});