import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// ENTERPRISE DUPLICATE DETECTION SYSTEM
// ═══════════════════════════════════════════════════════════════
// 3-Stage duplicate detection before creating any new method.
//
// Stage 1 — EXACT DUPLICATE:
//   Compare verified Arabic text after normalization.
//   Ignore harakat, punctuation, whitespace, and formatting.
//   If identical → mark as Exact Duplicate.
//
// Stage 2 — SAME METHOD:
//   Compare ritual structure:
//   Purpose, Required verses, Dua, Materials, Steps, Timing, Repetition count.
//   If everything matches (no field where BOTH have values and they differ)
//   → mark as Same Method.
//
// Stage 3 — EQUIVALENT METHOD:
//   Compare semantic meaning via LLM.
//   If two books describe exactly the same ritual using different wording
//   → mark as Equivalent Method.
//   BUT: any practical differences (repetition, verse, Divine Name, timing,
//   material, sequence, instruction) → NEW method, never merge.
//
// IF EXACT DUPLICATE OR SAME METHOD EXISTS:
//   - DO NOT create another Method.
//   - Link the new book as an additional source.
//   - Preserve: Book title, Author, Page number, PDF, Edition, Year.
//   - Increase source count.
//   - Show all supporting books under the same method.
//
// IF PRACTICAL DIFFERENCES EXIST:
//   - Create a NEW method under the same topic.
//   - Never merge methods with practical differences.
//
// EVERY METHOD CONTAINS:
//   - Primary Source (book_title, author, page_number, pdf_url, edition, year)
//   - Supporting Sources (array of additional sources)
//   - Source Count
//   - Verification Status
//   - Confidence Score
//
// BATCH-PROCESSED: Caller re-invokes until all entries are processed.
// ADMIN ONLY.
// ═══════════════════════════════════════════════════════════════

// ── Arabic normalization for Stage 1 comparison ──
// Strips harakat, punctuation, whitespace, formatting — keeps only Arabic letters.
// Normalizes alef variants (أ إ آ ٱ → ا).
const ARABIC_LETTER_RANGES = [[0x0621, 0x064a], [0x066e, 0x066f], [0x0671, 0x06d3], [0x06d5, 0x06d5]];
const ALEF_VARIANTS = new Set([0x0623, 0x0625, 0x0622, 0x0671]);
const PLAIN_ALEF = '\u0627';

function isInRange(code: number, ranges: number[][]): boolean {
  return ranges.some(([s, e]) => code >= s && code <= e);
}

function normalizeArabicForComparison(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let result = '';
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (isInRange(code, ARABIC_LETTER_RANGES)) {
      result += ALEF_VARIANTS.has(code) ? PLAIN_ALEF : ch;
    }
    // Ignore everything else: harakat, punctuation, whitespace, formatting
  }
  return result;
}

// ── General text normalization for Stage 2 structure comparison ──
function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ').trim();
}

// ── Stage 2: Compare ritual structure ──
// Returns match=true if NO field has differing values in BOTH entries.
// A field where only one entry has a value is NOT a difference (just missing info).
function compareRitualStructure(entry1: any, entry2: any): { match: boolean; differingField?: string } {
  const fields = [
    'purpose', 'materials', 'preparation', 'procedure',
    'timing', 'repetition', 'planet', 'day', 'incense', 'conditions',
  ];

  for (const field of fields) {
    const val1 = normalizeText(entry1[field] || '');
    const val2 = normalizeText(entry2[field] || '');

    // If BOTH have values and they differ → NOT the same method
    if (val1 && val2 && val1 !== val2) {
      return { match: false, differingField: field };
    }
  }

  return { match: true };
}

// ── Check for practical differences (safety net for Stage 3) ──
function hasPracticalDifferences(entry1: any, entry2: any): { hasDifferences: boolean; differences: string[] } {
  const criticalFields = [
    'repetition', 'timing', 'materials', 'incense',
    'planet', 'day', 'procedure',
  ];
  const differences: string[] = [];

  for (const field of criticalFields) {
    const val1 = normalizeText(entry1[field] || '');
    const val2 = normalizeText(entry2[field] || '');

    // Only flag as difference if BOTH have values and they differ
    if (val1 && val2 && val1 !== val2) {
      differences.push(field);
    }
  }

  return { hasDifferences: differences.length > 0, differences };
}

// ── Generate unique method_id ──
function generateMethodId(): string {
  return `METHOD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Build source object from entry and book metadata ──
function buildSourceObject(entry: any, book: any): any {
  return {
    book_title: entry.book_title || (book ? book.book_title : ''),
    author: book ? (book.author || '') : '',
    page_number: entry.page_number || '',
    pdf_url: book ? (book.original_file_url || '') : '',
    edition: book ? (book.edition || '') : '',
    year: book ? (book.publication_year || '') : '',
    entry_id: entry.entry_id || '',
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { book_id, batch_size } = body;

    if (!book_id) {
      return Response.json({ error: 'book_id is required' }, { status: 400 });
    }

    // Batch size: 3 default, max 5. Stage 3 LLM calls are slow (~10s each).
    const BATCH_SIZE = Math.min(batch_size || 3, 5);

    // ══ Fetch ManuscriptBook ══
    const books = await base44.asServiceRole.entities.ManuscriptBook.filter({ book_id });
    if (!books || books.length === 0) {
      return Response.json({ error: 'Book not found: ' + book_id }, { status: 404 });
    }
    const book = books[0];

    // ══ Fetch all entries for this book ══
    const allBookEntries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id });
    if (!allBookEntries || allBookEntries.length === 0) {
      return Response.json({ error: 'No entries found for book: ' + book_id }, { status: 404 });
    }

    // ══ Filter entries that still need duplicate detection ══
    const pendingEntries = allBookEntries.filter((e: any) =>
      !e.duplicate_status || e.duplicate_status === 'pending_detection'
    );

    // ══ If no pending entries, return final summary ══
    if (pendingEntries.length === 0) {
      const unique = allBookEntries.filter((e: any) => e.duplicate_status === 'unique').length;
      const exactDup = allBookEntries.filter((e: any) => e.duplicate_status === 'exact_duplicate').length;
      const sameMethod = allBookEntries.filter((e: any) => e.duplicate_status === 'same_method').length;
      const equivMethod = allBookEntries.filter((e: any) => e.duplicate_status === 'equivalent_method').length;
      const methodIds = new Set(allBookEntries.filter((e: any) => e.method_id).map((e: any) => e.method_id));

      return Response.json({
        status: 'complete',
        book_id,
        book_title: book.book_title,
        summary: {
          total_entries: allBookEntries.length,
          unique,
          exact_duplicate: exactDup,
          same_method: sameMethod,
          equivalent_method: equivMethod,
          total_methods: methodIds.size,
        },
        message: 'All entries have been processed for duplicate detection.',
      });
    }

    // ══ Process batch ══
    const batch = pendingEntries.slice(0, BATCH_SIZE);
    const results: any[] = [];

    for (const entry of batch) {
      const normalizedArabic = normalizeArabicForComparison(entry.arabic_text || '');
      const entryHash = entry.verified_arabic_hash || '';

      let matched = false;
      let matchType = '';
      let matchEntry: any = null;
      let matchConfidence = 0;

      // ══ STAGE 1: EXACT DUPLICATE — Compare verified Arabic text ══
      // Strategy A: Query by verified_arabic_hash (indexed, fast)
      if (!matched && entryHash) {
        const hashMatches = await base44.asServiceRole.entities.ManuscriptEntry.filter({
          verified_arabic_hash: entryHash,
        });

        const externalMatch = hashMatches.find((m: any) =>
          m.entry_id !== entry.entry_id &&
          m.is_primary_method_entry === true
        );

        if (externalMatch) {
          matched = true;
          matchType = 'exact_duplicate';
          matchEntry = externalMatch;
          matchConfidence = 100;
        }
      }

      // Strategy B: Normalized Arabic comparison (for entries without hash)
      if (!matched && normalizedArabic) {
        const sectionPrimaries = await base44.asServiceRole.entities.ManuscriptEntry.filter({
          sirr_section: entry.sirr_section,
          is_primary_method_entry: true,
        }, '-created_date', 50);

        const arabicMatch = sectionPrimaries.find((p: any) => {
          if (p.entry_id === entry.entry_id) return false;
          const pNorm = normalizeArabicForComparison(p.arabic_text || '');
          return pNorm.length > 0 && pNorm === normalizedArabic;
        });

        if (arabicMatch) {
          matched = true;
          matchType = 'exact_duplicate';
          matchEntry = arabicMatch;
          matchConfidence = 100;
        }
      }

      // ══ STAGE 2: SAME METHOD — Compare ritual structure (topic-filtered) ══
      // Query by sirr_section + topic to narrow the search space.
      // Falls back to sirr_section only if entry has no topic.
      if (!matched) {
        const stage2Filter: any = {
          sirr_section: entry.sirr_section,
          is_primary_method_entry: true,
        };
        if (entry.topic) stage2Filter.topic = entry.topic;

        const sectionPrimaries = await base44.asServiceRole.entities.ManuscriptEntry.filter(
          stage2Filter, '-created_date', 200
        );

        for (const candidate of sectionPrimaries) {
          if (candidate.entry_id === entry.entry_id) continue;

          const comparison = compareRitualStructure(entry, candidate);
          if (comparison.match) {
            // Safety: verify no practical differences
            const practicalDiff = hasPracticalDifferences(entry, candidate);
            if (!practicalDiff.hasDifferences) {
              matched = true;
              matchType = 'same_method';
              matchEntry = candidate;
              matchConfidence = 90;
              break;
            }
          }
        }
      }

      // ══ STAGE 3: EQUIVALENT METHOD — Semantic comparison via LLM (topic-filtered) ══
      if (!matched) {
        const stage3Filter: any = {
          sirr_section: entry.sirr_section,
          is_primary_method_entry: true,
        };
        if (entry.topic) stage3Filter.topic = entry.topic;

        const candidates = await base44.asServiceRole.entities.ManuscriptEntry.filter(
          stage3Filter, '-created_date', 50
        );

        // Filter out self and limit to 10 for LLM
        const llmCandidates = candidates.filter((c: any) => c.entry_id !== entry.entry_id).slice(0, 10);

        if (llmCandidates.length > 0) {
          const newEntrySummary = {
            purpose: entry.purpose || '',
            arabic_text: (entry.arabic_text || '').substring(0, 500),
            materials: entry.materials || '',
            procedure: entry.procedure || '',
            timing: entry.timing || '',
            repetition: entry.repetition || '',
            planet: entry.planet || '',
            day: entry.day || '',
            incense: entry.incense || '',
            conditions: entry.conditions || '',
          };

          const existingSummaries = llmCandidates.map((c: any, i: number) => ({
            index: i + 1,
            entry_id: c.entry_id,
            purpose: c.purpose || '',
            arabic_text: (c.arabic_text || '').substring(0, 500),
            materials: c.materials || '',
            procedure: c.procedure || '',
            timing: c.timing || '',
            repetition: c.repetition || '',
            planet: c.planet || '',
            day: c.day || '',
            incense: c.incense || '',
            conditions: c.conditions || '',
          }));

          const llmPrompt = `You are an expert in Islamic occult manuscripts, Arabic calligraphy, and spiritual ritual traditions.

TASK: Compare a NEW entry against EXISTING methods and determine if any are equivalent (describe exactly the same ritual using different wording).

NEW ENTRY:
${JSON.stringify(newEntrySummary, null, 2)}

EXISTING METHODS:
${existingSummaries.map((m) => `[${m.index}] ${JSON.stringify({
  purpose: m.purpose,
  materials: m.materials,
  procedure: m.procedure,
  timing: m.timing,
  repetition: m.repetition,
  planet: m.planet,
  day: m.day,
  incense: m.incense,
  conditions: m.conditions,
})}`).join('\n')}

COMPARISON RULES:
1. EQUIVALENT = describes EXACTLY the same ritual with different wording. The core action, purpose, and method are identical — only the phrasing differs.
2. If there are ANY practical differences, it is NOT equivalent — it should be a NEW method:
   - Different repetition count
   - Different verse or Quranic quotation
   - Different Divine Name (Asma al-Husna)
   - Different timing (planetary hour, day, moon phase)
   - Different material or ingredient
   - Different sequence or order of steps
   - Different instruction or procedure
3. Never merge methods that have practical differences.
4. Only mark as equivalent if they describe the same ritual with NO practical differences at all.
5. Authenticity > completeness. When in doubt, mark as NOT equivalent (create new method).

For each existing method, output:
- is_equivalent: true only if they describe exactly the same ritual with no practical differences
- has_practical_differences: true if any practical difference exists
- differences: list of specific differences found
- confidence: 0-100 (how confident you are in this assessment)

Then provide best_match_index (the method most likely to be equivalent, or null if none) and best_match_confidence.`;

          try {
            const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: llmPrompt,
              response_json_schema: {
                type: 'object',
                properties: {
                  comparisons: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        method_index: { type: 'integer' },
                        is_equivalent: { type: 'boolean' },
                        has_practical_differences: { type: 'boolean' },
                        differences: { type: 'array', items: { type: 'string' } },
                        confidence: { type: 'number' },
                      },
                    },
                  },
                  best_match_index: { type: 'integer' },
                  best_match_confidence: { type: 'number' },
                },
              },
            });

            if (llmResult.best_match_index && llmResult.best_match_confidence >= 70) {
              const matchIdx = llmResult.best_match_index - 1;
              if (matchIdx >= 0 && matchIdx < llmCandidates.length) {
                const comparison = (llmResult.comparisons || []).find(
                  (c: any) => c.method_index === llmResult.best_match_index
                );
                // Only link if equivalent AND no practical differences
                if (comparison && comparison.is_equivalent && !comparison.has_practical_differences) {
                  // Safety: also verify locally
                  const localCheck = hasPracticalDifferences(entry, llmCandidates[matchIdx]);
                  if (!localCheck.hasDifferences) {
                    matched = true;
                    matchType = 'equivalent_method';
                    matchEntry = llmCandidates[matchIdx];
                    matchConfidence = llmResult.best_match_confidence;
                  }
                }
              }
            }
          } catch {
            // LLM call failed — treat as no match (will be unique)
          }
        }
      }

      // ══ APPLY RESULT ══
      if (matched && matchEntry) {
        // ── LINK to existing method (DO NOT create new method) ──
        const methodId = matchEntry.method_id || matchEntry.entry_id;
        const sourceObj = buildSourceObject(entry, book);
        const detectionDate = new Date().toISOString();

        // Update this entry as a duplicate linked to the primary
        await base44.asServiceRole.entities.ManuscriptEntry.update(entry.id, {
          method_id: methodId,
          is_primary_method_entry: false,
          linked_method_id: matchEntry.entry_id,
          duplicate_status: matchType,
          confidence_score: matchConfidence,
          duplicate_detection_date: detectionDate,
        });

        // Update the primary entry's supporting_sources and source_count
        const currentSupporting = matchEntry.supporting_sources || [];
        const updatedSupporting = [...currentSupporting, sourceObj];
        const newSourceCount = (matchEntry.source_count || 1) + 1;

        await base44.asServiceRole.entities.ManuscriptEntry.update(matchEntry.id, {
          supporting_sources: updatedSupporting,
          source_count: newSourceCount,
        });

        results.push({
          entry_id: entry.entry_id,
          status: matchType,
          linked_to: matchEntry.entry_id,
          method_id: methodId,
          confidence: matchConfidence,
          source_count: newSourceCount,
        });
      } else {
        // ── CREATE NEW METHOD ──
        const methodId = generateMethodId();
        const sourceObj = buildSourceObject(entry, book);
        const detectionDate = new Date().toISOString();

        await base44.asServiceRole.entities.ManuscriptEntry.update(entry.id, {
          method_id: methodId,
          is_primary_method_entry: true,
          linked_method_id: '',
          duplicate_status: 'unique',
          primary_source: sourceObj,
          supporting_sources: [],
          source_count: 1,
          confidence_score: 100,
          duplicate_detection_date: detectionDate,
        });

        results.push({
          entry_id: entry.entry_id,
          status: 'unique',
          method_id: methodId,
          confidence: 100,
          source_count: 1,
        });
      }
    }

    // ══ Check if more pending entries remain ══
    const remainingPending = pendingEntries.length - batch.length;

    if (remainingPending > 0) {
      return Response.json({
        status: 'batch_complete',
        book_id,
        book_title: book.book_title,
        batch_processed: batch.length,
        remaining_pending: remainingPending,
        results,
        message: `Batch complete: ${batch.length} entries processed. ${remainingPending} remaining. Call detectManuscriptDuplicates again with the same book_id to continue.`,
        next_step: `detectManuscriptDuplicates({ "book_id": "${book_id}" })`,
      });
    }

    // ══ FINAL SUMMARY — all entries processed ══
    const finalEntries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id });

    const summary = {
      total_entries: finalEntries.length,
      unique: finalEntries.filter((e: any) => e.duplicate_status === 'unique').length,
      exact_duplicate: finalEntries.filter((e: any) => e.duplicate_status === 'exact_duplicate').length,
      same_method: finalEntries.filter((e: any) => e.duplicate_status === 'same_method').length,
      equivalent_method: finalEntries.filter((e: any) => e.duplicate_status === 'equivalent_method').length,
      total_methods: new Set(finalEntries.filter((e: any) => e.method_id).map((e: any) => e.method_id)).size,
      total_linked_sources: finalEntries.filter((e: any) =>
        e.duplicate_status === 'exact_duplicate' ||
        e.duplicate_status === 'same_method' ||
        e.duplicate_status === 'equivalent_method'
      ).length,
    };

    return Response.json({
      status: 'complete',
      book_id,
      book_title: book.book_title,
      summary,
      results,
      message: `Duplicate detection complete. ${summary.unique} unique methods, ${summary.total_linked_sources} linked sources across ${summary.total_methods} methods.`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'detection_failed' }, { status: 500 });
  }
});