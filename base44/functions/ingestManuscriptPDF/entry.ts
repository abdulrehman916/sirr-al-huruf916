/**
 * MANUSCRIPT PDF INGESTION FUNCTION
 * Ingests a new PDF, extracts all rules, and stores them in ManuscriptLibrary + ManuscriptRule entities.
 * ADDITIVE ONLY — never overwrites existing data.
 * Conflict detection: if same rule category/subcategory exists from another book, flags conflict.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const { pdf_url, book_name, author, language, tradition, pages_ingested, notes } = body;

    if (!pdf_url || !book_name) {
      return Response.json({ error: 'pdf_url and book_name are required' }, { status: 400 });
    }

    // 1. Check if this manuscript already exists (by book_name)
    const existingBooks = await base44.asServiceRole.entities.ManuscriptLibrary.filter({ book_name });
    if (existingBooks.length > 0) {
      return Response.json({
        error: 'DUPLICATE_MANUSCRIPT',
        message: `Manuscript "${book_name}" already exists in library. Use a different book_name if this is a different volume.`,
        existing: existingBooks[0]
      }, { status: 409 });
    }

    // 2. Generate unique book_id
    const book_id = `manuscript_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    // 3. Use LLM to extract all rules from the PDF
    const extractionPrompt = `
You are an expert in Islamic occult sciences, astrology, and manuscript analysis.

Analyze this manuscript PDF and extract EVERY rule, table, and piece of structured knowledge.

Extract rules for these categories (extract ALL you find, not just these):
1. PLANETARY_HOURS - Hour sequences, day rulers, night rulers, hour calculations
2. LUNAR_MANSIONS - All 28 mansions, their properties, timing, operations
3. ZODIAC - Zodiac signs, elements, properties, suitable operations
4. PLANETS - Planetary properties, natures, correspondences
5. FRIENDSHIP_RULES - Planet friendships, enmities, neutral relationships
6. INCENSE_RULES - Incense/buhur for each planet, day, hour
7. LETTER_RULES - Abjad values, letter-planet correspondences, letter elements
8. TIMING_RULES - Moon phase rules, day/night rules, seasonal rules
9. DAY_RULERS - Which planet rules each day
10. SAAD_NAHS - Lucky/unlucky timing classifications
11. SPIRITUAL_WORKS - Invocations, spiritual operations
12. PROTECTION_WORKS - Protection and warding operations
13. LOVE_WORKS - Love and attraction operations
14. WEALTH_WORKS - Wealth and prosperity operations
15. TRAVEL_WORKS - Travel timing and operations
16. ELEMENT_RULES - Fire, Earth, Air, Water correspondences
17. COSMOLOGY - Cosmological principles and structures

For EACH rule extracted, return:
- category (from list above)
- subcategory (specific type within category)
- page_number (integer, exact page)
- chapter (chapter/section name)
- original_text (verbatim quote from manuscript)
- rule_summary (concise English summary)
- data_json (structured data as JSON object)

Return as JSON: { rules: [...], total_categories: [...], summary: "..." }

PDF URL: ${pdf_url}

Book: ${book_name}
Author: ${author || 'Unknown'}
Pages: ${pages_ingested || 'All'}
`;

    let extractedRules = [];
    let extractionSummary = '';
    let categoriesCovered = [];

    try {
      const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: extractionPrompt,
        file_urls: [pdf_url],
        model: 'claude_sonnet_4_6',
        response_json_schema: {
          type: 'object',
          properties: {
            rules: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  category: { type: 'string' },
                  subcategory: { type: 'string' },
                  page_number: { type: 'integer' },
                  chapter: { type: 'string' },
                  original_text: { type: 'string' },
                  rule_summary: { type: 'string' },
                  data_json: { type: 'object' }
                }
              }
            },
            total_categories: { type: 'array', items: { type: 'string' } },
            summary: { type: 'string' }
          }
        }
      });

      extractedRules = llmResult.rules || [];
      extractionSummary = llmResult.summary || '';
      categoriesCovered = llmResult.total_categories || [];
    } catch (llmError) {
      console.error('LLM extraction failed:', llmError.message);
      // Still register the manuscript even if extraction fails
      extractionSummary = 'LLM extraction failed — manual ingestion required';
    }

    // 4. Register the manuscript in the library
    const manuscriptRecord = await base44.asServiceRole.entities.ManuscriptLibrary.create({
      book_id,
      book_name,
      author: author || 'Unknown',
      language: language || 'Arabic/Turkish',
      tradition: tradition || 'Islamic Occult Sciences',
      pages_ingested: pages_ingested || 'Unknown',
      pdf_filename: pdf_url.split('/').pop(),
      pdf_url,
      total_rules_extracted: extractedRules.length,
      categories_covered: categoriesCovered,
      ingestion_status: extractedRules.length > 0 ? 'FULLY_INGESTED' : 'PARTIAL',
      ingestion_date: new Date().toISOString().split('T')[0],
      notes: notes || extractionSummary
    });

    // 5. Fetch all existing rules for conflict detection
    const existingRules = await base44.asServiceRole.entities.ManuscriptRule.filter({});

    // 6. Store each extracted rule — ADDITIVE ONLY
    const storedRules = [];
    const conflicts = [];

    for (let i = 0; i < extractedRules.length; i++) {
      const rule = extractedRules[i];
      if (!rule.rule_summary) continue;

      const rule_id = `${book_id}_${rule.category}_${String(i + 1).padStart(3, '0')}`;

      // Check for conflicts: same category + subcategory from a different manuscript
      const potentialConflicts = existingRules.filter(r =>
        r.category === rule.category &&
        r.subcategory === rule.subcategory &&
        r.manuscript_id !== book_id
      );

      let conflict_with = null;
      let conflict_note = null;

      if (potentialConflicts.length > 0) {
        conflict_with = potentialConflicts[0].rule_id;
        conflict_note = `Conflicting rule found in "${potentialConflicts[0].book_name}" (${potentialConflicts[0].manuscript_id}). Both preserved separately.`;
        conflicts.push({
          new_rule: rule_id,
          existing_rule: potentialConflicts[0].rule_id,
          book: potentialConflicts[0].book_name,
          note: conflict_note
        });
      }

      try {
        const storedRule = await base44.asServiceRole.entities.ManuscriptRule.create({
          rule_id,
          manuscript_id: book_id,
          book_name,
          author: author || 'Unknown',
          page_number: rule.page_number || 0,
          chapter: rule.chapter || '',
          category: rule.category || 'OTHER',
          subcategory: rule.subcategory || '',
          original_text: rule.original_text || '',
          rule_summary: rule.rule_summary,
          data_json: typeof rule.data_json === 'object' ? JSON.stringify(rule.data_json) : (rule.data_json || '{}'),
          conflict_with,
          conflict_note,
          verified: false
        });
        storedRules.push(rule_id);
      } catch (storeError) {
        console.error(`Failed to store rule ${rule_id}:`, storeError.message);
      }
    }

    return Response.json({
      success: true,
      manuscript: {
        book_id,
        book_name,
        author,
        ingestion_status: manuscriptRecord.ingestion_status
      },
      extraction: {
        total_rules: extractedRules.length,
        stored_rules: storedRules.length,
        categories_covered: categoriesCovered,
        conflicts_detected: conflicts.length,
        conflicts
      },
      message: `Successfully ingested "${book_name}": ${storedRules.length} rules stored across ${categoriesCovered.length} categories.`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});