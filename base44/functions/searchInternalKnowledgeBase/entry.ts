import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// INTERNAL KNOWLEDGE BASE SEARCH — SELF-LEARNING ENGINE
// ═══════════════════════════════════════════════════════════════
// PERMANENT BACKEND ARCHITECTURE.
//
// Before creating or verifying any new record, search the entire
// internal knowledge base first. If a verified record already exists,
// reuse it instead of creating a duplicate. Never perform external
// verification when verified information already exists internally.
//
// SEARCH TIERS (highest confidence first):
//   Tier 1 (100%): Exact text_hash match in VerifiedArabic
//   Tier 2 (95%):  Normalized Arabic match in VerifiedArabic
//                  (catches harakat variations, OCR differences, alef normalization)
//   Tier 3 (90%):  Exact normalized match in verified ManuscriptEntry library
//                  (same text found in a different book — reuse)
//   Tier 3b (85%): Partial/substring match in verified ManuscriptEntry
//                  (Quran verse within a longer dua, partial text overlap)
//   Tier 4 (80%):  Semantic metadata match — purpose + topic + timing + day + planet
//                  + conditions + materials + procedure (full semantic comparison)
//   Tier 5 (75%):  Wafq/diagram type match — same entry_type + same purpose
//                  (image/diagram reuse without downloading or generating)
//
// Each verified record becomes permanent reusable knowledge.
// As the database grows, more entries are found internally,
// continuously reducing external searches, AI usage, and cost.
//
// ADMIN ONLY.
// ═══════════════════════════════════════════════════════════════

// ── Arabic normalization — MUST match verifyArabicText exactly ──
const ARABIC_LETTER_RANGES = [[0x0621, 0x064a], [0x066e, 0x066f], [0x0671, 0x06d3], [0x06d5, 0x06d5]];
const ALEF_VARIANTS = new Set([0x0623, 0x0625, 0x0622, 0x0671]);
const PLAIN_ALEF = '\u0627';

function isInRange(code: number, ranges: number[][]): boolean {
  return ranges.some(([s, e]) => code >= s && code <= e);
}

function normalizeArabic(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let result = '';
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (isInRange(code, ARABIC_LETTER_RANGES)) {
      result += ALEF_VARIANTS.has(code) ? PLAIN_ALEF : ch;
    }
  }
  return result;
}

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── Calculate semantic metadata similarity between two entries ──
// Compares: timing, day, planet, conditions, materials, procedure, warnings, benefits
// Returns a percentage (0-100) of matching fields.
function calculateMetadataSimilarity(entry1: any, entry2: any): number {
  const fields = ['timing', 'day', 'planet', 'conditions', 'materials', 'procedure', 'warnings', 'benefits'];
  let totalFields = 0;
  let matchingFields = 0;

  for (const field of fields) {
    const v1 = (entry1[field] || '').toString().trim();
    const v2 = (entry2[field] || '').toString().trim();

    // Only count fields where at least one entry has data
    if (v1.length > 0 || v2.length > 0) {
      totalFields++;

      if (v1 === v2 && v1.length > 0) {
        // Exact match
        matchingFields++;
      } else if (v1.length > 0 && v2.length > 0) {
        // For text fields, check word overlap
        const words1 = new Set(v1.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3));
        const words2 = new Set(v2.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3));
        if (words1.size > 0 && words2.size > 0) {
          let common = 0;
          for (const w of words1) {
            if (words2.has(w)) common++;
          }
          const overlap = common / Math.min(words1.size, words2.size);
          if (overlap >= 0.8) matchingFields++;
        }
      }
    }
  }

  if (totalFields === 0) return 0;
  return Math.round((matchingFields / totalFields) * 100);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { arabic_text, purpose, topic, entry_type, book_name, page_number,
            timing, day, planet, conditions, materials, procedure, warnings, benefits,
            has_images } = body;

    if (!arabic_text || arabic_text.trim().length === 0) {
      return Response.json({
        match_found: false,
        reason: 'no_arabic_text',
        skip_external_verification: false,
      });
    }

    const normalized = normalizeArabic(arabic_text);
    if (normalized.length === 0) {
      return Response.json({
        match_found: false,
        reason: 'normalization_failed',
        skip_external_verification: false,
      });
    }

    const textHash = await sha256Hex(normalized);

    // ══ TIER 1: Exact text_hash match in VerifiedArabic (confidence: 100) ══
    // The strongest match — same Arabic text already verified and stored.
    try {
      const exactMatches = await base44.asServiceRole.entities.VerifiedArabic.filter(
        { text_hash: textHash, verification_status: 'verified' },
        '-revision_number',
        5
      );
      if (exactMatches && exactMatches.length > 0) {
        const best = exactMatches[0];
        return Response.json({
          match_found: true,
          match_type: 'exact_hash',
          confidence: 100,
          verified_arabic: best.arabic_text,
          text_hash: best.text_hash,
          malayalam_meaning: best.malayalam_meaning || '',
          english_meaning: best.english_meaning || '',
          primary_source: best.primary_source || '',
          verification_confidence: best.verification_confidence || 'HIGH',
          verification_method: 'internal_reuse',
          skip_external_verification: true,
          message: 'Exact match found in verified database. Reusing record — zero credits.',
        });
      }
    } catch { /* continue to next tier */ }

    // ══ TIER 2: Normalized Arabic match in VerifiedArabic (confidence: 95) ══
    // Catches harakat variations, OCR differences, alef variant normalization.
    // Same Arabic text with different harakat or OCR artifacts normalizes to the same string.
    try {
      const normalizedMatches = await base44.asServiceRole.entities.VerifiedArabic.filter(
        { arabic_text_normalized: normalized, verification_status: 'verified' },
        '-revision_number',
        5
      );
      if (normalizedMatches && normalizedMatches.length > 0) {
        const best = normalizedMatches[0];
        return Response.json({
          match_found: true,
          match_type: 'normalized_match',
          confidence: 95,
          verified_arabic: best.arabic_text,
          text_hash: best.text_hash,
          malayalam_meaning: best.malayalam_meaning || '',
          english_meaning: best.english_meaning || '',
          primary_source: best.primary_source || '',
          verification_confidence: best.verification_confidence || 'HIGH',
          verification_method: 'internal_reuse',
          skip_external_verification: true,
          message: 'Normalized Arabic match (harakat/OCR variation). Reusing record — zero credits.',
        });
      }
    } catch { /* continue to next tier */ }

    // ══ TIER 3: Exact normalized match in verified ManuscriptEntry library (confidence: 90) ══
    // Database-side indexed search on arabic_normalized field.
    // Catches same Arabic text found in a different book — reuse canonical record.
    // O(1) via idx_arabic_normalized_verified composite index.
    // Replaces the old O(n²) in-memory scan that loaded 300 entries per call.
    try {
      const libraryMatches = await base44.asServiceRole.entities.ManuscriptEntry.filter(
        { arabic_normalized: normalized, verification_status: 'verified', is_primary_method_entry: true },
        '-created_date',
        10
      );
      if (libraryMatches && libraryMatches.length > 0) {
        const best = libraryMatches[0];
        return Response.json({
          match_found: true,
          match_type: 'library_normalized',
          confidence: 90,
          verified_arabic: best.arabic_text || '',
          text_hash: best.verified_arabic_hash || textHash,
          malayalam_meaning: best.malayalam_meaning || '',
          english_meaning: best.english_meaning || '',
          primary_source: best.verification_source || (best.book_title + ' p.' + (best.page_number || '?')),
          verification_confidence: 'HIGH',
          verification_method: 'internal_reuse',
          skip_external_verification: true,
          message: 'Normalized Arabic match in verified library (different book). Reusing — zero credits.',
          matched_entry_id: best.entry_id,
        });
      }
    } catch { /* continue to next tier */ }

    // ══ TIER 4: Semantic metadata match (confidence: 80) ══
    // Full semantic comparison: purpose + topic + timing + day + planet + conditions
    // + materials + procedure + warnings + benefits.
    // If enough metadata fields match (>= 80% similarity), it's the same knowledge — reuse.
    if (purpose || topic) {
      try {
        const filterQuery: any = { verification_status: 'verified', is_primary_method_entry: true };
        if (purpose) filterQuery.purpose = purpose;
        if (topic) filterQuery.topic = topic;

        const metadataMatches = await base44.asServiceRole.entities.ManuscriptEntry.filter(
          filterQuery,
          '-created_date',
          50
        );

        if (metadataMatches && metadataMatches.length > 0) {
          for (const entry of metadataMatches) {
            const similarity = calculateMetadataSimilarity(
              { timing, day, planet, conditions, materials, procedure, warnings, benefits },
              { timing: entry.timing, day: entry.day, planet: entry.planet,
                conditions: entry.conditions, materials: entry.materials,
                procedure: entry.procedure, warnings: entry.warnings, benefits: entry.benefits }
            );

            if (similarity >= 80) {
              return Response.json({
                match_found: true,
                match_type: 'semantic_metadata',
                confidence: 80,
                verified_arabic: entry.arabic_text || '',
                text_hash: entry.verified_arabic_hash || textHash,
                malayalam_meaning: entry.malayalam_meaning || '',
                english_meaning: entry.english_meaning || '',
                primary_source: entry.verification_source || (entry.book_title + ' p.' + (entry.page_number || '?')),
                verification_confidence: 'MEDIUM',
                verification_method: 'internal_reuse',
                skip_external_verification: true,
                message: `Semantic metadata match (${similarity}% similarity). Reusing canonical record — zero credits.`,
                matched_entry_id: entry.entry_id,
              });
            }
          }
        }
      } catch { /* continue to next tier */ }
    }

    // ══ TIER 5: Wafq/diagram type match (confidence: 75) ══
    // For entries with images (wafq, taweez, diagrams, tables), match by type + purpose.
    // If the same type of diagram with the same purpose exists, reuse the verified image
    // instead of downloading or generating another one.
    if (has_images && (entry_type === 'wafq' || entry_type === 'taweez' || entry_type === 'diagram' || entry_type === 'table' || entry_type === 'image')) {
      try {
        const imageTypeMatches = await base44.asServiceRole.entities.ManuscriptEntry.filter(
          { entry_type: entry_type, verification_status: 'verified', is_primary_method_entry: true },
          '-created_date',
          50
        );

        if (imageTypeMatches && imageTypeMatches.length > 0) {
          for (const entry of imageTypeMatches) {
            // If purpose also matches, high confidence — same diagram
            if (purpose && entry.purpose === purpose) {
              return Response.json({
                match_found: true,
                match_type: 'image_type_match',
                confidence: 75,
                verified_arabic: entry.arabic_text || '',
                text_hash: entry.verified_arabic_hash || textHash,
                malayalam_meaning: entry.malayalam_meaning || '',
                english_meaning: entry.english_meaning || '',
                primary_source: entry.verification_source || (entry.book_title + ' p.' + (entry.page_number || '?')),
                verification_confidence: 'MEDIUM',
                verification_method: 'internal_reuse',
                skip_external_verification: true,
                message: `Image/diagram type match (${entry_type} + same purpose). Reusing verified image — zero credits.`,
                matched_entry_id: entry.entry_id,
                reuse_images: entry.images || [],
              });
            }
          }
        }
      } catch { /* continue to no match */ }
    }

    // ══ NO MATCH FOUND — External verification required ══
    return Response.json({
      match_found: false,
      match_type: 'no_match',
      confidence: 0,
      text_hash: textHash,
      normalized_text: normalized,
      skip_external_verification: false,
      message: 'No internal match found. External verification required.',
    });
  } catch (error) {
    return Response.json({
      error: error.message,
      match_found: false,
      skip_external_verification: false,
    }, { status: 500 });
  }
});