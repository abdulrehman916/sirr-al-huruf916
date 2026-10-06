import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// MIGRATE ARABIC NORMALIZED — Backfills arabic_normalized field
// for existing ManuscriptEntry records that pre-date the field.
//
// Processes entries in batches of 100. Idempotent — safe to run
// multiple times (skips entries that already have arabic_normalized).
//
// ADMIN ONLY.
// ═══════════════════════════════════════════════════════════════

const ALEF_VARIANTS = new Set([0x0623, 0x0625, 0x0622, 0x0671]);
const PLAIN_ALEF = '\u0627';

function normalizeArabic(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let result = '';
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if ((code >= 0x0621 && code <= 0x064a) || (code >= 0x0671 && code <= 0x06d3)) {
      result += ALEF_VARIANTS.has(code) ? PLAIN_ALEF : ch;
    } else if ((code >= 0x066e && code <= 0x066f) || code === 0x06d5) {
      result += ch;
    }
  }
  return result;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { book_id, batch_size, all_books } = body;
    const BATCH = Math.min(batch_size || 100, 200);

    // Get entries missing arabic_normalized
    let entries: any[];

    if (book_id) {
      entries = await base44.asServiceRole.entities.ManuscriptEntry.filter(
        { book_id },
        '-created_date',
        BATCH
      );
    } else {
      // Get entries across all books — paginate
      entries = await base44.asServiceRole.entities.ManuscriptEntry.list('-created_date', BATCH);
    }

    if (!entries || entries.length === 0) {
      return Response.json({
        status: 'migration_complete',
        message: 'No entries found to migrate.',
        migrated: 0,
        skipped: 0,
      });
    }

    // Filter to entries that have arabic_text but missing arabic_normalized
    const needsMigration = entries.filter(
      (e: any) => e.arabic_text && e.arabic_text.trim().length > 0 && !e.arabic_normalized
    );

    if (needsMigration.length === 0) {
      return Response.json({
        status: 'batch_complete',
        message: 'All entries in this batch already have arabic_normalized.',
        migrated: 0,
        skipped: entries.length,
        total_checked: entries.length,
      });
    }

    // Build bulk update records
    const updateRecords = needsMigration.map((e: any) => ({
      id: e.id,
      arabic_normalized: normalizeArabic(e.arabic_text),
    }));

    await base44.asServiceRole.entities.ManuscriptEntry.bulkUpdate(updateRecords);

    return Response.json({
      status: 'batch_complete',
      migrated: updateRecords.length,
      skipped: entries.length - needsMigration.length,
      total_checked: entries.length,
      remaining: 'Call again to process next batch (if more entries exist).',
      message: `Migrated ${updateRecords.length} entries with arabic_normalized field.`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'migration_failed' }, { status: 500 });
  }
});