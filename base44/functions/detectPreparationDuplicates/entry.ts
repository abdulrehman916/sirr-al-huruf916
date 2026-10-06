import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// ENTERPRISE PREPARATION DUPLICATE DETECTION
// ═══════════════════════════════════════════════════════════════
// 3-Stage duplicate detection for preparations.
//
// Stage 1 — EXACT DUPLICATE:
//   Compare verified Arabic (name_ar + original_arabic) after normalization.
//   Ignore harakat, punctuation, whitespace, formatting.
//   If identical → Exact Duplicate.
//
// Stage 2 — SAME RECIPE:
//   Compare ingredients, quantities, preparation steps, timing, usage.
//   If everything matches → Same Recipe (link as source).
//
// Stage 3 — EQUIVALENT RECIPE:
//   Compare semantic meaning via LLM.
//   If same preparation with different wording → Equivalent Recipe.
//   BUT: any ingredient, quantity, step, timing, or usage differs
//   → NEW preparation version (never merge different recipes).
//
// IF EXACT DUPLICATE OR SAME RECIPE:
//   - DO NOT create another preparation.
//   - Link the new book as an additional source.
//   - Preserve: Book title, Author, Page number, PDF, Edition, Year.
//   - Increase source count.
//
// IF ANY PRACTICAL DIFFERENCE:
//   - Create a NEW preparation version (same group, different ID).
//   - Never merge different recipes.
//
// BATCH-PROCESSED. ADMIN ONLY.
// ═══════════════════════════════════════════════════════════════

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
  }
  return result;
}

function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text.trim().toLowerCase().replace(/\s+/g, ' ').trim();
}

// ── Compare ingredients arrays ──
function ingredientsMatch(ings1: any[], ings2: any[]): boolean {
  if (!ings1 && !ings2) return true;
  if (!ings1 || !ings2) return false;
  if (ings1.length !== ings2.length) return false;

  const norm1 = ings1.map((i: any) => ({
    name: normalizeText(i.name || ''),
    quantity: normalizeText(i.quantity || ''),
    unit: normalizeText(i.unit || ''),
  }));
  const norm2 = ings2.map((i: any) => ({
    name: normalizeText(i.name || ''),
    quantity: normalizeText(i.quantity || ''),
    unit: normalizeText(i.unit || ''),
  }));

  // Check if every ingredient in 1 has a match in 2
  for (const a of norm1) {
    const found = norm2.find((b) => b.name === a.name && b.quantity === a.quantity && b.unit === a.unit);
    if (!found) return false;
  }
  return true;
}

// ── Stage 2: Compare recipe structure ──
function compareRecipeStructure(p1: any, p2: any): { match: boolean; differingField?: string } {
  const fields = ['preparation_steps', 'required_tools', 'timing', 'usage_instructions', 'storage_instructions'];

  for (const field of fields) {
    const val1 = normalizeText(p1[field] || '');
    const val2 = normalizeText(p2[field] || '');
    if (val1 && val2 && val1 !== val2) {
      return { match: false, differingField: field };
    }
  }

  // Compare ingredients
  if (!ingredientsMatch(p1.ingredients || [], p2.ingredients || [])) {
    return { match: false, differingField: 'ingredients' };
  }

  return { match: true };
}

// ── Check for practical differences ──
function hasPracticalDifferences(p1: any, p2: any): { hasDifferences: boolean; differences: string[] } {
  const criticalFields = ['preparation_steps', 'timing', 'usage_instructions', 'required_tools'];
  const differences: string[] = [];

  for (const field of criticalFields) {
    const val1 = normalizeText(p1[field] || '');
    const val2 = normalizeText(p2[field] || '');
    if (val1 && val2 && val1 !== val2) {
      differences.push(field);
    }
  }

  // Check ingredients differences
  if (!ingredientsMatch(p1.ingredients || [], p2.ingredients || [])) {
    const ings1 = p1.ingredients || [];
    const ings2 = p2.ingredients || [];
    if (ings1.length > 0 && ings2.length > 0) {
      differences.push('ingredients');
    }
  }

  return { hasDifferences: differences.length > 0, differences };
}

function generatePreparationId(): string {
  return `PREP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateGroupId(): string {
  return `PREPGRP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildSourceObject(prep: any, book: any): any {
  return {
    book_title: prep.book_title || (book ? book.book_title : ''),
    author: book ? (book.author || '') : '',
    page_number: prep.page_number || '',
    pdf_url: book ? (book.original_file_url || '') : '',
    edition: book ? (book.edition || '') : '',
    year: book ? (book.publication_year || '') : '',
    preparation_id: prep.preparation_id || '',
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

    const BATCH_SIZE = Math.min(batch_size || 3, 5);

    const books = await base44.asServiceRole.entities.ManuscriptBook.filter({ book_id });
    if (!books || books.length === 0) {
      return Response.json({ error: 'Book not found: ' + book_id }, { status: 404 });
    }
    const book = books[0];

    const allPreps = await base44.asServiceRole.entities.Preparation.filter({ book_id });
    if (!allPreps || allPreps.length === 0) {
      return Response.json({
        status: 'complete',
        book_id,
        book_title: book.book_title,
        summary: { total_preparations: 0, unique: 0, duplicates: 0, total_recipes: 0 },
        message: 'No preparations found for this book.',
      });
    }

    const pendingPreps = allPreps.filter((p: any) =>
      !p.duplicate_status || p.duplicate_status === 'pending_detection'
    );

    if (pendingPreps.length === 0) {
      const unique = allPreps.filter((p: any) => p.duplicate_status === 'unique').length;
      const dups = allPreps.filter((p: any) =>
        p.duplicate_status === 'exact_duplicate' || p.duplicate_status === 'same_recipe' || p.duplicate_status === 'equivalent_recipe'
      ).length;
      const groups = new Set(allPreps.filter((p: any) => p.method_id).map((p: any) => p.method_id));

      return Response.json({
        status: 'complete',
        book_id,
        book_title: book.book_title,
        summary: { total_preparations: allPreps.length, unique, duplicates: dups, total_recipes: groups.size },
        message: 'All preparations processed.',
      });
    }

    const batch = pendingPreps.slice(0, BATCH_SIZE);
    const results: any[] = [];

    for (const prep of batch) {
      const normalizedArabic = normalizeArabicForComparison(
        (prep.name_ar || '') + ' ' + (prep.original_arabic || '')
      );
      const prepHash = prep.verified_arabic_hash || '';

      let matched = false;
      let matchType = '';
      let matchPrep: any = null;
      let matchConfidence = 0;

      // ══ STAGE 1: EXACT DUPLICATE ══
      if (!matched && prepHash) {
        const hashMatches = await base44.asServiceRole.entities.Preparation.filter({
          verified_arabic_hash: prepHash,
        });
        const externalMatch = hashMatches.find((m: any) =>
          m.preparation_id !== prep.preparation_id &&
          m.is_primary_preparation === true
        );
        if (externalMatch) {
          matched = true;
          matchType = 'exact_duplicate';
          matchPrep = externalMatch;
          matchConfidence = 100;
        }
      }

      if (!matched && normalizedArabic) {
        const sectionPrimaries = await base44.asServiceRole.entities.Preparation.filter({
          sirr_section: prep.sirr_section || 6,
          is_primary_preparation: true,
        }, '-created_date', 50);

        const arabicMatch = sectionPrimaries.find((p: any) => {
          if (p.preparation_id === prep.preparation_id) return false;
          const pNorm = normalizeArabicForComparison((p.name_ar || '') + ' ' + (p.original_arabic || ''));
          return pNorm.length > 0 && pNorm === normalizedArabic;
        });

        if (arabicMatch) {
          matched = true;
          matchType = 'exact_duplicate';
          matchPrep = arabicMatch;
          matchConfidence = 100;
        }
      }

      // ══ STAGE 2: SAME RECIPE ══
      if (!matched) {
        const sectionPrimaries = await base44.asServiceRole.entities.Preparation.filter({
          sirr_section: prep.sirr_section || 6,
          is_primary_preparation: true,
        }, '-created_date', 50);

        for (const candidate of sectionPrimaries) {
          if (candidate.preparation_id === prep.preparation_id) continue;
          const comparison = compareRecipeStructure(prep, candidate);
          if (comparison.match) {
            const practicalDiff = hasPracticalDifferences(prep, candidate);
            if (!practicalDiff.hasDifferences) {
              matched = true;
              matchType = 'same_recipe';
              matchPrep = candidate;
              matchConfidence = 90;
              break;
            }
          }
        }
      }

      // ══ STAGE 3: EQUIVALENT RECIPE (LLM) ══
      if (!matched) {
        const candidates = await base44.asServiceRole.entities.Preparation.filter({
          sirr_section: prep.sirr_section || 6,
          is_primary_preparation: true,
        }, '-created_date', 20);

        const llmCandidates = candidates.filter((c: any) => c.preparation_id !== prep.preparation_id).slice(0, 10);

        if (llmCandidates.length > 0) {
          const newPrepSummary = {
            name: prep.name || '',
            name_ar: prep.name_ar || '',
            purpose: prep.purpose || '',
            ingredients: (prep.ingredients || []).map((i: any) => `${i.name} ${i.quantity} ${i.unit}`),
            preparation_steps: (prep.preparation_steps || '').substring(0, 400),
            timing: prep.timing || '',
            usage: prep.usage_instructions || '',
          };

          const existingSummaries = llmCandidates.map((c: any, i: number) => ({
            index: i + 1,
            preparation_id: c.preparation_id,
            name: c.name || '',
            name_ar: c.name_ar || '',
            purpose: c.purpose || '',
            ingredients: (c.ingredients || []).map((i: any) => `${i.name} ${i.quantity} ${i.unit}`),
            preparation_steps: (c.preparation_steps || '').substring(0, 400),
            timing: c.timing || '',
            usage: c.usage_instructions || '',
          }));

          const llmPrompt = `You are an expert in Islamic occult manuscripts, traditional herbal medicine, and spiritual preparation recipes.

TASK: Compare a NEW preparation against EXISTING preparations and determine if any are equivalent (same recipe with different wording).

NEW PREPARATION:
${JSON.stringify(newPrepSummary, null, 2)}

EXISTING PREPARATIONS:
${existingSummaries.map((m) => `[${m.index}] ${JSON.stringify({ name: m.name, purpose: m.purpose, ingredients: m.ingredients, steps: m.preparation_steps, timing: m.timing, usage: m.usage })}`).join('\n')}

RULES:
1. EQUIVALENT = exactly the same recipe with different wording. Same ingredients, same quantities, same steps, same timing.
2. If ANY practical difference exists, it is NOT equivalent — create a NEW version:
   - Different ingredient
   - Different quantity
   - Different preparation step
   - Different timing
   - Different usage instruction
3. Never merge different recipes.
4. When in doubt, mark as NOT equivalent.

Output JSON with comparisons and best_match.`;

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
                if (comparison && comparison.is_equivalent && !comparison.has_practical_differences) {
                  const localCheck = hasPracticalDifferences(prep, llmCandidates[matchIdx]);
                  if (!localCheck.hasDifferences) {
                    matched = true;
                    matchType = 'equivalent_recipe';
                    matchPrep = llmCandidates[matchIdx];
                    matchConfidence = llmResult.best_match_confidence;
                  }
                }
              }
            }
          } catch { /* LLM failed — treat as unique */ }
        }
      }

      // ══ APPLY RESULT ══
      const detectionDate = new Date().toISOString();

      if (matched && matchPrep) {
        const methodId = matchPrep.method_id || matchPrep.preparation_id;
        const sourceObj = buildSourceObject(prep, book);

        await base44.asServiceRole.entities.Preparation.update(prep.id, {
          method_id: methodId,
          is_primary_preparation: false,
          linked_preparation_id: matchPrep.preparation_id,
          duplicate_status: matchType,
          confidence_score: matchConfidence,
          preparation_group_id: matchPrep.preparation_group_id || matchPrep.preparation_id,
        });

        const currentSupporting = matchPrep.supporting_sources || [];
        const updatedSupporting = [...currentSupporting, sourceObj];
        const newSourceCount = (matchPrep.source_count || 1) + 1;

        await base44.asServiceRole.entities.Preparation.update(matchPrep.id, {
          supporting_sources: updatedSupporting,
          source_count: newSourceCount,
        });

        results.push({
          preparation_id: prep.preparation_id,
          name: prep.name,
          status: matchType,
          linked_to: matchPrep.preparation_id,
          method_id: methodId,
          confidence: matchConfidence,
          source_count: newSourceCount,
        });
      } else {
        // NEW unique preparation
        const methodId = generatePreparationId();
        const groupId = prep.preparation_group_id || generateGroupId();
        const sourceObj = buildSourceObject(prep, book);

        await base44.asServiceRole.entities.Preparation.update(prep.id, {
          method_id: methodId,
          is_primary_preparation: true,
          linked_preparation_id: '',
          duplicate_status: 'unique',
          preparation_group_id: groupId,
          primary_source: sourceObj,
          supporting_sources: [],
          source_count: 1,
          confidence_score: 100,
        });

        results.push({
          preparation_id: prep.preparation_id,
          name: prep.name,
          status: 'unique',
          method_id: methodId,
          confidence: 100,
          source_count: 1,
        });
      }
    }

    const remainingPending = pendingPreps.length - batch.length;

    if (remainingPending > 0) {
      return Response.json({
        status: 'batch_complete',
        book_id,
        book_title: book.book_title,
        batch_processed: batch.length,
        remaining_pending: remainingPending,
        results,
        message: `Batch complete: ${batch.length} preparations processed. ${remainingPending} remaining.`,
        next_step: `detectPreparationDuplicates({ "book_id": "${book_id}" })`,
      });
    }

    // Final summary
    const finalPreps = await base44.asServiceRole.entities.Preparation.filter({ book_id });
    const summary = {
      total_preparations: finalPreps.length,
      unique: finalPreps.filter((p: any) => p.duplicate_status === 'unique').length,
      exact_duplicate: finalPreps.filter((p: any) => p.duplicate_status === 'exact_duplicate').length,
      same_recipe: finalPreps.filter((p: any) => p.duplicate_status === 'same_recipe').length,
      equivalent_recipe: finalPreps.filter((p: any) => p.duplicate_status === 'equivalent_recipe').length,
      total_recipes: new Set(finalPreps.filter((p: any) => p.method_id).map((p: any) => p.method_id)).size,
    };

    return Response.json({
      status: 'complete',
      book_id,
      book_title: book.book_title,
      summary,
      results,
      message: `Preparation duplicate detection complete. ${summary.unique} unique recipes, ${summary.exact_duplicate + summary.same_recipe + summary.equivalent_recipe} linked sources.`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'detection_failed' }, { status: 500 });
  }
});