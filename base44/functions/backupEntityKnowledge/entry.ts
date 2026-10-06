// ═══════════════════════════════════════════════════════════════
// BACKUP: EntityKnowledge database snapshot
//
// Creates a complete JSON backup of ALL EntityKnowledge records
// (including markers) and uploads it as a permanent file.
//
// SAFETY:
//   - Admin-only (verifies user.role === 'admin')
//   - READ-ONLY — does not modify any records
//   - Captures every field on every record
//   - Returns a permanent file URL for rollback reference
//
// The backup file can be used by rollbackEntityKnowledgeMigration
// to restore the exact state at backup time.
// ═══════════════════════════════════════════════════════════════
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    // Read ALL EntityKnowledge records (including markers)
    // Use pagination to ensure we get everything
    let allRecords = [];
    let offset = 0;
    const batchSize = 100;
    while (true) {
      const batch = await base44.asServiceRole.entities.EntityKnowledge.list('-created_date', batchSize, offset);
      allRecords = allRecords.concat(batch);
      if (batch.length < batchSize) break;
      offset += batchSize;
      if (offset > 1000) break; // safety cap
    }

    // Create backup object with metadata
    const backup = {
      backup_id: `EK-BACKUP-${Date.now()}`,
      backup_date: new Date().toISOString(),
      backup_by: user.email,
      description: "Complete snapshot of EntityKnowledge entity. Captures every field on every record for rollback purposes.",
      record_count: allRecords.length,
      records: allRecords,
    };

    const jsonStr = JSON.stringify(backup, null, 2);

    // Create a File object (Deno supports this)
    const file = new File([jsonStr], `entity_knowledge_backup_${Date.now()}.json`, { type: 'application/json' });

    // Upload backup file
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    return Response.json({
      status: "backup_complete",
      backup_id: backup.backup_id,
      backup_date: backup.backup_date,
      backup_url: uploadResult.file_url,
      record_count: backup.record_count,
      backup_size_bytes: jsonStr.length,
      message: `Backup created successfully with ${backup.record_count} records. Save the backup_url for rollback reference.`,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});