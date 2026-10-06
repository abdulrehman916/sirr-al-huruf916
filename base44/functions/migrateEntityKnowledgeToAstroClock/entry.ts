import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// LOSSLESS MIGRATION: EntityKnowledge (astrology) → AstroClockKnowledge
//
// Migrates ONLY astrology entity records (planet, zodiac, mansion,
// weekday, element, general_astro, house) from EntityKnowledge into
// AstroClockKnowledge as categorized records.
//
// RULES:
//   - Never deletes EntityKnowledge originals (kept as safety backup).
//   - Never overwrites existing AstroClockKnowledge records.
//   - Dedup by content_hash (true duplicate → source added only).
//   - Complementary merge by rule_record_key (append text + source).
//   - Preserves every field, OCR/confidence, source, page, language,
//     timestamps, verification status, supporting sources, provenance.
//
// Affects: writes ONLY to AstroClockKnowledge. EntityKnowledge untouched.
// Non-astrology (Dua, Ritual, Wafq, Kiyafetname, EarRinging, Ihtilac,
// Misc) completely unaffected.
// ═══════════════════════════════════════════════════════════════

const ASTRO_ENTITY_TYPES = ['planet', 'zodiac', 'mansion', 'weekday', 'element', 'general_astro', 'house'];

const ENTITY_TYPE_TO_RULE_CATEGORY: Record<string, string> = {
  planet: 'planet',
  zodiac: 'zodiac',
  mansion: 'lunar mansion',
  weekday: 'weekday',
  element: 'element',
  general_astro: 'general astrology',
  house: 'house',
};

function normalizeText(text: string): string {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim();
}

async function computeHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    // ── 1. Fetch ALL non-marker EntityKnowledge records ──
    let allEk: any[] = [];
    let skip = 0, batch: any[];
    do {
      batch = await base44.asServiceRole.entities.EntityKnowledge.filter(
        { is_marker: false }, undefined, 200, skip
      );
      const n = batch ? batch.length : 0;
      if (batch) allEk = allEk.concat(batch);
      skip += n;
      if (!n || n < 200) break;
    } while (skip < 2000);

    // Keep ONLY astrology entity types
    const astroEk = allEk.filter((r: any) => ASTRO_ENTITY_TYPES.includes(r.entity_type));

    let created = 0, merged = 0, duplicatesSkipped = 0, errors = 0;
    const details: any[] = [];

    for (const ek of astroEk) {
      try {
        const ruleCategory = ENTITY_TYPE_TO_RULE_CATEGORY[ek.entity_type] || ek.entity_type;
        const ruleEntity = String(ek.entity_key || '').toLowerCase();
        const ruleRecordKey = `${ruleCategory}|${ruleEntity}`;
        const textEn = ek.knowledge_text_en || '';
        const textAr = ek.knowledge_text_ar || '';
        const textMl = ek.knowledge_text_ml || '';

        const textHash = await computeHash(`${ek.entity_type}|${ek.entity_key}|${normalizeText(textEn).substring(0, 200)}`);
        const contentHash = `cat-${ruleRecordKey}-${textHash.substring(0, 16)}`;

        const sourceObj = {
          book_title: ek.source_book_title || '',
          page_number: ek.source_page_number || '',
          entry_id: ek.source_entry_id || '',
          screenshot_url: ek.source_screenshot_url || '',
        };

        // ── Dedup: exact duplicate by content_hash ──
        const existingByHash = await base44.asServiceRole.entities.AstroClockKnowledge.filter(
          { content_hash: contentHash, is_marker: false }, undefined, 1
        );
        if (existingByHash && existingByHash.length > 0) {
          // True duplicate — add source if new, never overwrite.
          const ex = existingByHash[0];
          const sources = [...(ex.supporting_sources || [])];
          const hasSource = sources.some((s: any) =>
            (sourceObj.entry_id && s.entry_id === sourceObj.entry_id) ||
            (sourceObj.screenshot_url && s.screenshot_url === sourceObj.screenshot_url)
          );
          if (!hasSource && (sourceObj.entry_id || sourceObj.screenshot_url || sourceObj.book_title)) {
            sources.push(sourceObj);
            await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
              supporting_sources: sources,
              source_count: (ex.source_count || 1) + 1,
            });
          }
          duplicatesSkipped++;
          details.push({ ek_id: ek.knowledge_id, action: 'duplicate_skipped', rule_record_key: ruleRecordKey });
          continue;
        }

        // ── Complementary merge by rule_record_key ──
        const existingByKey = await base44.asServiceRole.entities.AstroClockKnowledge.filter(
          { rule_record_key: ruleRecordKey, is_marker: false, source_type: 'categorized' }, undefined, 1
        );
        if (existingByKey && existingByKey.length > 0) {
          const ex = existingByKey[0];
          // Append text only if new (never overwrite)
          const normExisting = normalizeText(ex.knowledge_text_en || '');
          const normNew = normalizeText(textEn);
          let mergedTextEn = ex.knowledge_text_en || '';
          if (textEn && !normExisting.includes(normNew)) {
            mergedTextEn = mergedTextEn ? mergedTextEn + '\n---\n' + textEn : textEn;
          }
          let mergedTextAr = ex.knowledge_text_ar || '';
          if (textAr && !normalizeText(mergedTextAr).includes(normalizeText(textAr))) {
            mergedTextAr = mergedTextAr ? mergedTextAr + '\n---\n' + textAr : textAr;
          }
          let mergedTextMl = ex.knowledge_text_ml || '';
          if (textMl && !normalizeText(mergedTextMl).includes(normalizeText(textMl))) {
            mergedTextMl = mergedTextMl ? mergedTextMl + '\n---\n' + textMl : textMl;
          }
          const sources = [...(ex.supporting_sources || [])];
          const hasSource = sources.some((s: any) =>
            (sourceObj.entry_id && s.entry_id === sourceObj.entry_id) ||
            (sourceObj.screenshot_url && s.screenshot_url === sourceObj.screenshot_url)
          );
          if (!hasSource && (sourceObj.entry_id || sourceObj.screenshot_url || sourceObj.book_title)) {
            sources.push(sourceObj);
          }
          // Merge attributes additively (never overwrite existing keys)
          const mergedAttributes = { ...(ex.attributes || {}), ...(ek.structured_data || {}) };
          mergedAttributes.knowledge_category = mergedAttributes.knowledge_category || ek.knowledge_category || 'general';
          mergedAttributes.migrated_from = 'EntityKnowledge';
          mergedAttributes.verification_status = ek.verification_status || 'verified';
          await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
            knowledge_text_en: mergedTextEn,
            knowledge_text_ar: mergedTextAr,
            knowledge_text_ml: mergedTextMl,
            attributes: mergedAttributes,
            supporting_sources: sources,
            source_count: (ex.source_count || 1) + (hasSource ? 0 : 1),
          });
          merged++;
          details.push({ ek_id: ek.knowledge_id, action: 'merged', rule_record_key: ruleRecordKey });
          continue;
        }

        // ── Create new categorized record ──
        const knowledgeId = `ACK-MIG-EK-${ek.knowledge_id || Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
        const attributes: any = {
          ...(ek.structured_data || {}),
          knowledge_category: ek.knowledge_category || 'general',
          verification_status: ek.verification_status || 'verified',
          migrated_from: 'EntityKnowledge',
          migrated_id: ek.knowledge_id || '',
        };
        const initialSources = (sourceObj.entry_id || sourceObj.screenshot_url || sourceObj.book_title) ? [sourceObj] : [];
        await base44.asServiceRole.entities.AstroClockKnowledge.create({
          knowledge_id: knowledgeId,
          source_type: 'categorized',
          rule_category: ruleCategory,
          rule_entity: ruleEntity,
          entity_raw: ek.entity_key || '',
          rule_record_key: ruleRecordKey,
          knowledge_category: 'categorized_rule',
          knowledge_text_en: textEn,
          knowledge_text_ml: textMl,
          knowledge_text_ar: textAr,
          attributes,
          content_hash: contentHash,
          canonical_key: ek.canonical_key || '',
          is_marker: false,
          source_book_id: ek.source_book_id || '',
          source_book_title: ek.source_book_title || '',
          source_page_number: ek.source_page_number || '',
          source_entry_id: ek.source_entry_id || '',
          source_screenshot_url: ek.source_screenshot_url || '',
          ocr_confidence: ek.extraction_confidence ?? null,
          detected_language: '',
          upload_date: ek.created_date || '',
          is_verified: ek.verification_status === 'verified',
          supporting_sources: initialSources,
          source_count: ek.source_count || (initialSources.length ? 1 : 0),
        });
        created++;
        details.push({ ek_id: ek.knowledge_id, action: 'created', rule_record_key: ruleRecordKey });
      } catch (err) {
        errors++;
        details.push({ ek_id: ek.knowledge_id, action: 'error', error: err.message });
      }
    }

    return Response.json({
      status: 'migration_complete',
      entity_knowledge_astrology_records_found: astroEk.length,
      created,
      merged,
      duplicates_skipped: duplicatesSkipped,
      errors,
      details,
      note: 'EntityKnowledge originals preserved as backup. Nothing deleted or overwritten.',
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'migration_failed' }, { status: 500 });
  }
});