import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// BULK IMPORT — Purpose Dictionary (Admin only)
// ═══════════════════════════════════════════════════════════════
// ── ISOLATION CONTRACT ──
// This function ONLY reads/writes PurposeDictionary records.
// It never touches any Mizan, Ritual, Calculation, Timing, Astro,
// GatherRules, lookup logic, or UI component.
// Caller: src/components/admin/purposeDict/ImportExportBar.jsx
// ═══════════════════════════════════════════════════════════════
//
// Smart batch import with:
//   • Empty-row skipping
//   • Within-batch dedup (canonical record per Arabic keyword)
//   • Existing-record dedup (indexed $in query)
//   • Automatic alias merging (union, never duplicate)
//   • Never overwrites existing data — only fills missing fields
//     and appends new aliases. ritualKey (normalized_purpose_key)
//     is NEVER overwritten.
//   • Per-row validation
//   • Full import report
//
// Scales to millions via chunked client calls (≤500 rows per call).

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { entries } = body;
    if (!Array.isArray(entries)) {
      return Response.json({ error: 'entries must be an array' }, { status: 400 });
    }

    const VALID_KEYS = ['celb', 'tard', 'sihhat', 'sekam', 'tarfet', 'rizq', 'knowledge', 'travel', 'sultan', 'haybah'];
    const VALID_ACTIONS = ['jalb', 'tard', 'tafriq', 'jam', 'sihhat', 'sekam', 'tarfet', 'other'];

    const normalize = (text) =>
      String(text || '')
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '') // harakat
        .replace(/\u0640/g, '')                               // tatweel
        .toLowerCase()
        .trim();

    const parseAliases = (raw) => {
      if (Array.isArray(raw)) return raw.map((a) => String(a).trim()).filter(Boolean);
      if (typeof raw === 'string' && raw) return raw.split('|').map((a) => a.trim()).filter(Boolean);
      return [];
    };

    // ── Phase 1: Validate + deduplicate within batch ──
    const canonicalMap = new Map(); // normKeyword -> merged entry
    let skipped = 0;
    let batchDuplicatesMerged = 0;
    const errors = [];

    for (let i = 0; i < entries.length; i++) {
      const row = entries[i] || {};
      const rowNum = i + 1;

      // Skip completely empty rows
      const hasAny = row.purpose_phrase || row.arabic_keyword || row.normalized_purpose_key || row.english_meaning;
      if (!hasAny) {
        skipped++;
        continue;
      }

      const purposePhrase = String(row.purpose_phrase || '').trim();
      const arabicKeyword = String(row.arabic_keyword || '').trim();
      const ritualKey = String(row.normalized_purpose_key || '').trim();

      if (!purposePhrase) {
        errors.push(`Row ${rowNum}: missing purpose_phrase`);
        skipped++;
        continue;
      }
      if (!ritualKey) {
        errors.push(`Row ${rowNum}: missing normalized_purpose_key`);
        skipped++;
        continue;
      }
      if (!VALID_KEYS.includes(ritualKey)) {
        errors.push(`Row ${rowNum}: invalid normalized_purpose_key "${ritualKey}" (allowed: ${VALID_KEYS.join(', ')})`);
        skipped++;
        continue;
      }

      const normKeyword = normalize(arabicKeyword || purposePhrase);
      if (!normKeyword) {
        errors.push(`Row ${rowNum}: could not derive keyword`);
        skipped++;
        continue;
      }

      const action = VALID_ACTIONS.includes(row.action) ? row.action : 'jalb';
      const aliases = parseAliases(row.aliases);

      const existing = canonicalMap.get(normKeyword);
      if (existing) {
        // Merge within batch — first non-empty value wins, aliases union
        if (!existing.malayalam_meaning && row.malayalam_meaning) {
          existing.malayalam_meaning = String(row.malayalam_meaning).trim();
        }
        if (!existing.english_meaning && row.english_meaning) {
          existing.english_meaning = String(row.english_meaning).trim();
        }
        if (!existing.source && row.source) {
          existing.source = String(row.source).trim();
        }
        if (!existing.notes && row.notes) {
          existing.notes = String(row.notes).trim();
        }
        for (const a of aliases) {
          if (!existing.aliases.includes(a)) existing.aliases.push(a);
        }
        batchDuplicatesMerged++;
      } else {
        canonicalMap.set(normKeyword, {
          purpose_phrase: purposePhrase,
          arabic_keyword: arabicKeyword,
          malayalam_meaning: String(row.malayalam_meaning || '').trim(),
          english_meaning: String(row.english_meaning || '').trim(),
          action,
          normalized_purpose_key: ritualKey,
          language: ['ar', 'ml', 'en', 'mixed'].includes(row.language) ? row.language : 'mixed',
          aliases,
          source: String(row.source || '').trim(),
          is_active: row.is_active !== false && row.is_active !== 'false',
          notes: String(row.notes || '').trim(),
          _normKeyword: normKeyword,
        });
      }
    }

    const canonicalEntries = Array.from(canonicalMap.values());

    // ── Phase 2: Query existing records by arabic_keyword (indexed) ──
    // Query by raw keyword forms. Chunk to keep query sizes reasonable.
    const rawKeywords = canonicalEntries
      .map((e) => e.arabic_keyword)
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i);

    const existingRecords = [];
    const CHUNK = 100;
    for (let i = 0; i < rawKeywords.length; i += CHUNK) {
      const slice = rawKeywords.slice(i, i + CHUNK);
      const found = await base44.asServiceRole.entities.PurposeDictionary.filter(
        { is_active: true, arabic_keyword: { $in: slice } },
        null,
        500
      );
      if (found && found.length) existingRecords.push(...found);
    }

    // Build existing map by normalized keyword
    const existingMap = new Map();
    for (const rec of existingRecords) {
      const nk = normalize(rec.arabic_keyword || rec.purpose_phrase);
      if (nk && !existingMap.has(nk)) existingMap.set(nk, rec);
    }

    // ── Phase 3: Merge with existing or prepare create ──
    const toCreate = [];
    const toUpdate = [];
    let imported = 0;
    let updated = 0;
    let existingDuplicatesMerged = 0;

    for (const entry of canonicalEntries) {
      const existing = existingMap.get(entry._normKeyword);
      if (existing) {
        // Merge — never overwrite existing data, only add new info
        const updateData = { id: existing.id };
        let changed = false;

        // Aliases: union (append only new ones)
        const existingAliases = Array.isArray(existing.aliases) ? existing.aliases : [];
        const newAliases = entry.aliases.filter((a) => !existingAliases.includes(a));
        if (newAliases.length > 0) {
          updateData.aliases = [...existingAliases, ...newAliases];
          changed = true;
          existingDuplicatesMerged++;
        }

        // Fill missing fields (never overwrite)
        if (!existing.malayalam_meaning && entry.malayalam_meaning) {
          updateData.malayalam_meaning = entry.malayalam_meaning;
          changed = true;
        }
        if (!existing.english_meaning && entry.english_meaning) {
          updateData.english_meaning = entry.english_meaning;
          changed = true;
        }
        if (!existing.source && entry.source) {
          updateData.source = entry.source;
          changed = true;
        }
        if (!existing.notes && entry.notes) {
          updateData.notes = entry.notes;
          changed = true;
        }
        // purpose_phrase, normalized_purpose_key (ritualKey), action,
        // language, is_active — NEVER overwritten.

        if (changed) {
          toUpdate.push(updateData);
          updated++;
        } else {
          skipped++;
        }
      } else {
        // New record — strip internal field
        const { _normKeyword, ...clean } = entry;
        toCreate.push(clean);
        imported++;
      }
    }

    // ── Phase 4: Bulk create + update ──
    if (toCreate.length > 0) {
      await base44.asServiceRole.entities.PurposeDictionary.bulkCreate(toCreate);
    }
    if (toUpdate.length > 0) {
      await base44.asServiceRole.entities.PurposeDictionary.bulkUpdate(toUpdate);
    }

    return Response.json({
      total: entries.length,
      imported,
      updated,
      skipped,
      duplicatesMerged: batchDuplicatesMerged + existingDuplicatesMerged,
      errors,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});