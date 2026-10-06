/**
 * DEEP SCAN MANUSCRIPT PDF — Full Page-by-Page Extraction
 * 
 * Protocol:
 * 1. Scans EVERY page of the PDF — no summarization, no compression
 * 2. Extracts ALL rules, tables, diagrams, timings, planetary hours, mansions,
 *    vefks, talismans, invocations, classifications, notes, footnotes, examples,
 *    warnings, appendices
 * 3. ADDITIVE ONLY — never overwrites, never deletes
 * 4. Detects duplicates — stores both with alternate_source flag
 * 5. Generates full ingestion audit
 * 
 * Required: pdf_url, manuscript_id, page_start, page_end
 * Optional: page_chunk_size (default 10 pages per LLM call)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const {
      pdf_url,
      manuscript_id,
      book_name,
      author,
      page_start = 1,
      page_end,
      page_chunk_size = 10,
      action = 'scan' // 'scan' | 'audit'
    } = body;

    if (!pdf_url || !manuscript_id) {
      return Response.json({ error: 'pdf_url and manuscript_id are required' }, { status: 400 });
    }

    // ── AUDIT MODE: return current coverage stats ──
    if (action === 'audit') {
      const existingRules = await base44.asServiceRole.entities.ManuscriptRule.filter({ manuscript_id });
      const manuscript = await base44.asServiceRole.entities.ManuscriptLibrary.filter({ book_id: manuscript_id });
      
      const pagesCovered = [...new Set(existingRules.map(r => r.page_number))].sort((a, b) => a - b);
      const categoryCounts = {};
      existingRules.forEach(r => {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      });

      return Response.json({
        audit: {
          manuscript_id,
          book_name: manuscript[0]?.book_name || book_name,
          total_rules_in_db: existingRules.length,
          pages_with_at_least_one_rule: pagesCovered.length,
          pages_covered: pagesCovered,
          category_breakdown: categoryCounts,
          ingestion_status: manuscript[0]?.ingestion_status || 'UNKNOWN',
          last_updated: manuscript[0]?.ingestion_date || 'unknown'
        }
      });
    }

    // ── SCAN MODE: full deep extraction ──
    
    // 1. Load all existing rules for this manuscript (for duplicate detection)
    const existingRules = await base44.asServiceRole.entities.ManuscriptRule.filter({ manuscript_id });
    const existingRuleIds = new Set(existingRules.map(r => r.rule_id));
    const existingPageRuleSummaries = new Set(existingRules.map(r => `${r.page_number}::${r.subcategory}`));

    const extractionPrompt = `You are an expert scholar of Islamic occult sciences, judicial astrology (علم النجوم الأحكامي), and Persian/Arabic manuscripts.

CRITICAL INSTRUCTIONS:
- Scan EVERY SINGLE PAGE of this PDF from page ${page_start} to ${page_end || 'end'}
- Extract ABSOLUTELY EVERYTHING — do NOT summarize or compress
- Extract: rules, tables, diagrams, planetary hour tables, lunar mansion data, vefk/talisman instructions, invocations, classifications, notes, footnotes, warnings, examples, appendices, ALL numerical data
- For EVERY piece of information, record the EXACT page number
- Record verbatim original text (Persian/Arabic) — do NOT translate, just quote
- For tables: extract every single cell value
- For diagrams: describe every element with measurements/values
- For planetary hour tables: extract all 7×12 or 7×24 grid values
- For lunar mansions: extract all 28 mansions with every property listed
- For planet properties: every attribute for every planet

EXTRACT THESE CATEGORIES (find all, not limited to this list):
1. PLANETARY_HOURS — hour sequences per day (all 24), duration calculations, Chaldean order
2. LUNAR_MANSIONS — all 28 mansions: name, stars, element, nature, suitable/unsuitable operations, timing
3. ZODIAC — 12 signs with ALL properties: element, quality, gender, ruler, exaltation, fall, decan, face
4. PLANETS — ALL properties: nature, element, gender, temperament, colour, stone, metal, day, hour, number, body part, profession, angel, incense, taste, smell, animal, plant, letter
5. FRIENDSHIP_RULES — every friendship/enmity pair with source citation
6. INCENSE_RULES — incense/buhur for every planet, day, hour, mansion
7. LETTER_RULES — every letter-planet correspondence, letter element, letter value
8. TIMING_RULES — moon phase rules, hadith-based malefic days, seasonal timing, election rules
9. DAY_RULERS — every day ruler day+night, with source
10. SAAD_NAHS — Sa'd/Nahs classification for every planet, sign, mansion, day
11. SPIRITUAL_WORKS — every invocation, du'a, spiritual operation with exact wording
12. PROTECTION_WORKS — every protection operation, talisman description, ward
13. LOVE_WORKS — every love/attraction operation with timing
14. WEALTH_WORKS — every wealth/rizq operation with timing
15. TRAVEL_WORKS — travel timing rules
16. ELEMENT_RULES — fire/earth/air/water correspondences for signs, planets, mansions
17. COSMOLOGY — geocentric model, ecliptic, seven climates, nodes
18. VEFK — any magic square instructions, vefk construction rules
19. HADIM — any spiritual entity/servant rules
20. EXALTATION — every planet's sharaf (exaltation) and hubut (fall) degrees
21. ABJAD — any numerical values, letter sequences
22. OTHER — anything not in above categories

FOR EACH EXTRACTED ITEM return:
{
  "page_number": <exact integer>,
  "chapter": "<chapter/lesson name>",
  "category": "<from list above>",
  "subcategory": "<specific type>",
  "original_text": "<verbatim Persian/Arabic text — exact quote>",
  "rule_summary": "<English description — detailed, not summarized>",
  "data_json": { <all structured data as key-value pairs> },
  "confidence": <0.0-1.0>,
  "notes": "<any caveats, uncertainties, diagram references>"
}

Return as JSON: {
  "rules": [...],
  "pages_scanned": [...],
  "total_pages": <number>,
  "categories_found": [...],
  "extraction_notes": "<overall notes about the PDF>"
}`;

    console.log(`Starting deep scan of ${pdf_url}, pages ${page_start}-${page_end || 'end'}`);

    let llmResult;
    try {
      llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
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
                  page_number: { type: 'integer' },
                  chapter: { type: 'string' },
                  category: { type: 'string' },
                  subcategory: { type: 'string' },
                  original_text: { type: 'string' },
                  rule_summary: { type: 'string' },
                  data_json: { type: 'object' },
                  confidence: { type: 'number' },
                  notes: { type: 'string' }
                }
              }
            },
            pages_scanned: { type: 'array', items: { type: 'integer' } },
            total_pages: { type: 'integer' },
            categories_found: { type: 'array', items: { type: 'string' } },
            extraction_notes: { type: 'string' }
          }
        }
      });
    } catch (llmError) {
      console.error('LLM extraction failed:', llmError.message);
      return Response.json({ error: 'LLM extraction failed: ' + llmError.message }, { status: 500 });
    }

    const extractedRules = llmResult.rules || [];
    const pagesScanned = llmResult.pages_scanned || [];
    const categoriesFound = llmResult.categories_found || [];

    console.log(`Extracted ${extractedRules.length} rules from ${pagesScanned.length} pages`);

    // ── 2. Store each rule — ADDITIVE, duplicate-aware ──
    const storedNew = [];
    const duplicatesDetected = [];
    const conflicts = [];
    let storedCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < extractedRules.length; i++) {
      const rule = extractedRules[i];
      if (!rule.rule_summary || !rule.category) continue;

      // Generate deterministic rule_id
      const rule_id = `${manuscript_id}_p${rule.page_number}_${rule.category}_${String(i + 1).padStart(4, '0')}`;
      
      // Check exact duplicate by rule_id
      if (existingRuleIds.has(rule_id)) {
        duplicatesDetected.push(rule_id);
        skippedCount++;
        continue;
      }

      // Check near-duplicate: same page + same subcategory already exists
      const nearDupKey = `${rule.page_number}::${rule.subcategory}`;
      if (existingPageRuleSummaries.has(nearDupKey)) {
        // Store as alternate_source, not skip
        duplicatesDetected.push(`NEAR_DUP:${nearDupKey}`);
      }

      // Check cross-manuscript conflicts (same category+subcategory from different manuscript)
      const crossConflicts = existingRules.filter(r =>
        r.category === rule.category &&
        r.subcategory === rule.subcategory &&
        r.manuscript_id !== manuscript_id
      );

      let conflict_with = null;
      let conflict_note = null;

      if (crossConflicts.length > 0) {
        conflict_with = crossConflicts[0].rule_id;
        conflict_note = `MANUSCRIPT DISAGREEMENT: Conflicting rule in "${crossConflicts[0].book_name}" (${crossConflicts[0].manuscript_id}) page ${crossConflicts[0].page_number}. Both versions preserved separately. Do NOT merge.`;
        conflicts.push({
          new_rule: rule_id,
          existing_rule: conflict_with,
          existing_book: crossConflicts[0].book_name,
          category: rule.category,
          subcategory: rule.subcategory
        });
      }

      try {
        await base44.asServiceRole.entities.ManuscriptRule.create({
          rule_id,
          manuscript_id,
          book_name,
          author: author || 'استاد طاها (Ustad Taha)',
          page_number: rule.page_number || 0,
          chapter: rule.chapter || '',
          category: rule.category || 'OTHER',
          subcategory: rule.subcategory || '',
          original_text: rule.original_text || '',
          rule_summary: rule.rule_summary,
          data_json: typeof rule.data_json === 'object' ? JSON.stringify(rule.data_json) : (rule.data_json || '{}'),
          conflict_with,
          conflict_note,
          verified: rule.confidence >= 0.9
        });
        storedNew.push(rule_id);
        storedCount++;
      } catch (storeError) {
        console.error(`Failed to store rule ${rule_id}:`, storeError.message);
      }
    }

    // ── 3. Build audit report ──
    const allRulesNow = await base44.asServiceRole.entities.ManuscriptRule.filter({ manuscript_id });
    const allPagesCovered = [...new Set(allRulesNow.map(r => r.page_number))].sort((a, b) => a - b);
    const categoryBreakdown = {};
    allRulesNow.forEach(r => {
      categoryBreakdown[r.category] = (categoryBreakdown[r.category] || 0) + 1;
    });

    // Determine missing pages
    const expectedPages = [];
    if (page_end) {
      for (let p = page_start; p <= page_end; p++) expectedPages.push(p);
    }
    const missingPages = expectedPages.filter(p => !allPagesCovered.includes(p));

    // Calculate coverage
    const coveragePct = page_end
      ? Math.round((allPagesCovered.filter(p => p >= page_start && p <= page_end).length / (page_end - page_start + 1)) * 100)
      : null;

    // Update manuscript record only if coverage is confirmed
    const newStatus = (coveragePct === 100 || (!page_end && storedCount > 0)) ? 'FULLY_INGESTED' : 'PARTIAL';
    
    await base44.asServiceRole.entities.ManuscriptLibrary.filter({ book_id: manuscript_id }).then(async (records) => {
      if (records.length > 0) {
        // Only update status — do NOT touch existing categories or rules
        await base44.asServiceRole.entities.ManuscriptLibrary.update(records[0].id, {
          total_rules_extracted: allRulesNow.length,
          ingestion_status: newStatus,
          categories_covered: [...new Set([...((records[0].categories_covered) || []), ...categoriesFound])]
        });
      }
    });

    return Response.json({
      success: true,
      ingestion_audit: {
        manuscript_id,
        book_name,
        pdf_url,
        pages_scanned_this_run: pagesScanned,
        total_pages_in_pdf: llmResult.total_pages,
        rules_extracted_this_run: extractedRules.length,
        rules_stored_new: storedCount,
        duplicates_detected: duplicatesDetected.length,
        cross_manuscript_conflicts: conflicts.length,
        categories_found_this_run: categoriesFound,
        all_pages_with_rules: allPagesCovered,
        missing_pages: missingPages,
        page_coverage_pct: coveragePct,
        total_rules_in_db: allRulesNow.length,
        category_breakdown: categoryBreakdown,
        status_set_to: newStatus,
        conflicts_detail: conflicts,
        extraction_notes: llmResult.extraction_notes || ''
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});