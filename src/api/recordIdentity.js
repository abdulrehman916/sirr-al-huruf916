// Preserve imported record identifiers so existing relationships stay intact.
// The database UUID remains internal; new records have no imported identifier.
/** @param {{id: string, data?: Record<string, any>, created_at?: string, updated_at?: string} | null} row */
export const toRecord = (row) => row ? ({
  ...(row.data || {}),
  id: row.data?._base44_legacy_id || row.id,
  created_date: row.created_at,
  updated_date: row.updated_at,
}) : null;

export const byRecordId = (query, id) => query.eq(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id))
    ? 'id' : 'data->>_base44_legacy_id',
  String(id),
);
