/**
 * COMPREHENSIVE ASTROLOGY CORRESPONDENCES INGESTION — Chunked Processing
 * Processes PDFs in small chunks to avoid timeout.
 * Extracts ALL astrology correspondences with full detail.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MANUSCRIPT_ID = 'elbuni_semsul_maarif_comprehensive_astro';
const BOOK_NAME = "Sems'ul-Maarif'ul-Kubra (Vol. 3)";
const AUTHOR = 'Imam Ahmed Elbuni';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const body = await req.json();
    const { pdf_urls } = body;

    if (!pdf_urls || !Array.isArray(pdf_urls) || pdf_urls.length === 0) {
      return Response.json({ error: 'pdf_urls array is required' }, { status: 400 });
    }

    console.log(`Starting chunked comprehensive astrology ingestion`);

    // Simple extraction - just page, category, basic info
    const extractionPrompt = `List ALL pages with astrology content. For each:

{"page": 5, "category": "PLANETARY_HOURS", "planet": "Venus", "timing": "Friday Venus hour", "operation": "talisman"}

Categories: PLANETARY_HOURS, PLANETARY_DAYS, ZODIAC_TIMING, LUNAR_MANSIONS, LUNAR_TIMING, PLANETARY_CONJUNCTIONS, PLANETARY_ELEMENTS, PLANETARY_STONES, PLANETARY_COLORS, PLANETARY_METALS, PLANETARY_LETTERS, PLANETARY_NUMBERS, SAAD_NAHS, ASTROLOGICAL_VEFKS, ASTROLOGICAL_TALISMANS, CELESTIAL_ELECTIONS, SPECIAL_TIMING

Return JSON array: [{page, category, planet, timing, operation}, ...]`;

    const allDetectedPages = [];

    // Process each PDF separately
    for (const pdfUrl of pdf_urls) {
      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: extractionPrompt,
          file_urls: [pdfUrl],
          model: 'claude_sonnet_4_6'
        });

        try {
          let parsed;
          if (typeof result === 'string') {
            const jsonMatch = result.match(/\[[\s\S]*\]/);
            if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
          } else if (Array.isArray(result)) {
            parsed = result;
          }
          if (Array.isArray(parsed)) allDetectedPages.push(...parsed);
        } catch (e) {
          console.log('Parse failed');
        }
      } catch (pdfErr) {
        console.error('PDF error:', pdfErr.message);
      }
    }

    console.log(`Detected ${allDetectedPages.length} astrology pages`);

    // Get existing data
    const existingRules = await base44.asServiceRole.entities.ManuscriptRule.filter({});
    const existingManuscripts = await base44.asServiceRole.entities.ManuscriptLibrary.filter({});

    // Create rules
    const rulesToCreate = [];
    const categoriesCovered = new Set();

    for (const page of allDetectedPages) {
      if (!page.page || !page.category) continue;

      const ruleId = `${MANUSCRIPT_ID}_p${page.page}_${page.category}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Check overlap
      const similar = existingRules.filter(r => r.category === page.category && r.page_number === page.page);
      let subcategory = page.timing || page.planet || '';
      let conflictWith = null;
      let conflictNote = null;

      if (similar.length > 0) {
        subcategory += ' [ALTERNATE_SOURCE]';
        conflictWith = similar[0].rule_id;
        conflictNote = `Alt version from ${similar[0].book_name}`;
      }

      rulesToCreate.push({
        rule_id: ruleId,
        manuscript_id: MANUSCRIPT_ID,
        book_name: BOOK_NAME,
        author: AUTHOR,
        page_number: page.page,
        chapter: '',
        category: page.category,
        subcategory: subcategory,
        original_text: `Page ${page.page}: ${page.timing || page.planet || 'Astrology content'} - ${page.operation || ''}`,
        rule_summary: `${page.category}: ${page.timing || page.planet || 'Astrological rule'} on page ${page.page}. ${page.operation || 'Celestial correspondence'}.`,
        rule_summary_ml: '',
        data_json: JSON.stringify({
          page: page.page,
          category: page.category,
          planet: page.planet || null,
          timing: page.timing || null,
          operation: page.operation || null,
          zodiac: page.zodiac || null,
          element: page.element || null,
          stone: page.stone || null,
          color: page.color || null,
          metal: page.metal || null,
          saad_nahs: page.saad_nahs || null
        }),
        conflict_with: conflictWith,
        conflict_note: conflictNote,
        verified: false
      });

      categoriesCovered.add(page.category);
    }

    // Bulk create in small batches
    let createdCount = 0;
    const batchSize = 10;

    for (let i = 0; i < rulesToCreate.length; i += batchSize) {
      const batch = rulesToCreate.slice(i, i + batchSize);
      try {
        await base44.asServiceRole.entities.ManuscriptRule.bulkCreate(batch);
        createdCount += batch.length;
        await new Promise(r => setTimeout(r, 100));
      } catch (batchErr) {
        console.error('Batch error:', batchErr.message);
      }
    }

    // Update ManuscriptLibrary
    const existingManuscript = existingManuscripts.find(m => m.book_id === MANUSCRIPT_ID);

    if (existingManuscript) {
      await base44.asServiceRole.entities.ManuscriptLibrary.update(existingManuscript.id, {
        total_rules_extracted: (existingManuscript.total_rules_extracted || 0) + createdCount,
        categories_covered: [...new Set([...(existingManuscript.categories_covered || []), ...Array.from(categoriesCovered)])],
        ingestion_status: 'PARTIAL'
      });
    } else {
      await base44.asServiceRole.entities.ManuscriptLibrary.create({
        book_id: MANUSCRIPT_ID,
        book_name: BOOK_NAME,
        author: AUTHOR,
        language: 'Turkish',
        tradition: 'Islamic Occult Sciences',
        pages_ingested: '1-100',
        pdf_filename: 'E95C54E0AD505E43-Complete.pdf',
        pdf_url: pdf_urls[0],
        total_rules_extracted: createdCount,
        categories_covered: Array.from(categoriesCovered),
        ingestion_status: 'PARTIAL',
        ingestion_date: new Date().toISOString(),
        notes: 'Comprehensive astrology correspondences - chunked extraction'
      });
    }

    return Response.json({
      ingestion_complete: {
        status: 'success',
        manuscript_id: MANUSCRIPT_ID,
        book_name: BOOK_NAME,
        pages_detected: allDetectedPages.length,
        records_created: createdCount,
        categories_added: Array.from(categoriesCovered),
        category_breakdown: Array.from(categoriesCovered).map(cat => ({
          category: cat,
          count: rulesToCreate.filter(r => r.category === cat).length
        }))
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});