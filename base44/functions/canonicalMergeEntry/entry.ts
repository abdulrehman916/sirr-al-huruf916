import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// CANONICAL MERGE ENTRY — SINGLE CANONICAL RECORD SYSTEM
// ═══════════════════════════════════════════════════════════════
// PERMANENT BACKEND ARCHITECTURE.
//
// When an internal match is found, this function:
//   1. Reuses the existing verified canonical record.
//   2. Merges ONLY genuinely new information (fields the canonical
//      record doesn't have). Never overwrites verified data.
//   3. Adds the new manuscript as another source reference.
//   4. Preserves complete source history.
//   5. Never overwrites verified information with lower-confidence info.
//
// CANONICAL RULE: Every verified entry is THE single canonical record
//   for that knowledge. No duplicate verified copies are ever created.
//   All sources are merged into one record with full provenance.
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
    const { matched_entry_id, new_entry_data, book_title, page_number } = body;

    if (!matched_entry_id) {
      return Response.json({
        merged: false,
        reason: 'matched_entry_id is required',
      });
    }

    // ══ Find the canonical (primary) entry ══
    const entries = await base44.asServiceRole.entities.ManuscriptEntry.filter(
      { entry_id: matched_entry_id, is_primary_method_entry: true },
      '-created_date',
      5
    );

    if (!entries || entries.length === 0) {
      return Response.json({
        merged: false,
        reason: 'Canonical entry not found: ' + matched_entry_id,
      });
    }

    const canonical = entries[0];
    const updateData: any = {};
    const newFieldsAdded: string[] = [];

    // ══ MERGE GENUINELY NEW INFORMATION ══
    // Only add fields that the canonical record DOESN'T have.
    // Never overwrite verified info with lower-confidence info.
    // If canonical has data in a field, it stays — verified data is authoritative.
    const mergeFields = [
      'conditions', 'materials', 'preparation', 'procedure',
      'timing', 'planet', 'day', 'incense', 'repetition',
      'warnings', 'benefits', 'notes', 'introduction',
    ];

    for (const field of mergeFields) {
      const canonicalValue = (canonical[field] || '').toString().trim();
      const newValue = (new_entry_data[field] || '').toString().trim();

      // Only merge if canonical is empty AND new entry has data
      if (canonicalValue.length === 0 && newValue.length > 0) {
        updateData[field] = newValue;
        newFieldsAdded.push(field);
      }
    }

    // ══ ADD NEW SOURCE REFERENCE ══
    // Add the new manuscript as another source in the canonical record.
    // This preserves complete source history — every book that contains
    // this knowledge is recorded as a source.
    const supportingSources = canonical.supporting_sources || [];
    const newSource = {
      book_title: book_title || new_entry_data.book_title || '',
      author: new_entry_data.author || '',
      page_number: page_number || new_entry_data.page_number || '',
      pdf_url: new_entry_data.pdf_url || '',
      edition: new_entry_data.edition || '',
      year: new_entry_data.year || '',
      entry_id: new_entry_data.entry_id || '',
    };

    // Check if this source is already in the list (avoid duplicates)
    const sourceExists = supportingSources.some((s: any) =>
      s.book_title === newSource.book_title && s.page_number === newSource.page_number
    );

    if (!sourceExists) {
      supportingSources.push(newSource);
      updateData.supporting_sources = supportingSources;
      updateData.source_count = (canonical.source_count || 1) + 1;
    }

    // ══ UPDATE CANONICAL RECORD ══
    if (Object.keys(updateData).length > 0) {
      await base44.asServiceRole.entities.ManuscriptEntry.update(canonical.id, updateData);
    }

    return Response.json({
      merged: true,
      canonical_entry_id: canonical.entry_id,
      new_fields_added: newFieldsAdded,
      source_added: !sourceExists,
      source_count: updateData.source_count || canonical.source_count || 1,
      verified_arabic: canonical.arabic_text || '',
      text_hash: canonical.verified_arabic_hash || '',
      malayalam_meaning: canonical.malayalam_meaning || '',
      english_meaning: canonical.english_meaning || '',
      primary_source: canonical.verification_source || '',
      verification_status: 'verified',
      verification_confidence: (canonical.extraction_confidence || 80) >= 90 ? 'HIGH' : 'MEDIUM',
      message: `Canonical record reused. ${newFieldsAdded.length} new field(s) merged. Source ${sourceExists ? 'already exists' : 'added'}. Total sources: ${updateData.source_count || canonical.source_count || 1}.`,
    });
  } catch (error) {
    return Response.json({
      error: error.message,
      merged: false,
    }, { status: 500 });
  }
});