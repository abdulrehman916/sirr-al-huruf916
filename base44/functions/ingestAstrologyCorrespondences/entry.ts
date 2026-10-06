/**
 * INGEST ASTROLOGY CORRESPONDENCES — Optimized for Speed
 * Extracts astrology-correspondence content from Elbuni manuscript PDFs.
 * Creates ManuscriptRule records with page citations.
 * Additive-only: never overwrites, stores overlaps as alternate_source.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MANUSCRIPT_ID = 'elbuni_semsul_maarif_astro_correspondences';
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

    console.log(`Starting astrology correspondences ingestion from ${pdf_urls.length} PDFs`);

    // Simple extraction prompt
    const extractionPrompt = `Extract ALL astrology-correspondence content from this Elbuni manuscript.

For EACH page with astrology content, return:
{
  "page": <number>,
  "category": "PLANETARY_HOURS"|"PLANETARY_DAYS"|"ZODIAC_TIMING"|"LUNAR_TIMING"|"PLANETARY_CONJUNCTIONS"|"SAAD_NAHS_TIMING"|"PLANETARY_METALS_AND_STONES"|"VEFK_WITH_CELESTIAL_TIMING"|"TALISMAN_UNDER_CELESTIAL_CONDITIONS"|"LUNAR_CALENDAR_TIMING"|"SOLAR_TIMING"|"PLANETARY_LETTERS"|"PLANETARY_NUMBERS"|"ELEMENT_CORRESPONDENCES",
  "summary": "<brief English summary>",
  "original_text": "<Turkish/Arabic quote if any>"
}

Return as JSON array: [{page, category, summary, original_text}, ...]`;

    const allDetectedPages = [];
    
    for (const pdfUrl of pdf_urls) {
      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: extractionPrompt,
          file_urls: [pdfUrl],
          model: 'claude_sonnet_4_6'
        });
        
        // Parse result
        try {
          let parsed;
          if (typeof result === 'string') {
            const jsonMatch = result.match(/\[[\s\S]*\]/);
            if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
          } else {
            parsed = result;
          }
          
          if (Array.isArray(parsed)) {
            allDetectedPages.push(...parsed);
          }
        } catch (parseErr) {
          console.error('Parse error:', parseErr.message);
        }
      } catch (pdfErr) {
        console.error('PDF error:', pdfErr.message);
      }
    }

    console.log(`Detected ${allDetectedPages.length} pages with astrology content`);

    // Get existing rules for overlap detection
    const existingRules = await base44.asServiceRole.entities.ManuscriptRule.filter({});
    const categoriesCovered = new Set();
    const rulesToCreate = [];

    for (const page of allDetectedPages) {
      if (!page.page || !page.category) continue;

      const ruleId = `${MANUSCRIPT_ID}_p${page.page}_${page.category}_${Date.now()}`;
      
      // Check for overlaps
      const similar = existingRules.filter(r => 
        r.category === page.category && 
        r.page_number === page.page
      );
      
      let subcategory = page.summary || '';
      let conflictWith = null;
      let conflictNote = null;

      if (similar.length > 0) {
        subcategory += ' [ALTERNATE_SOURCE]';
        conflictWith = similar[0].rule_id;
        conflictNote = `Alternative version from ${similar[0].book_name} p.${similar[0].page_number}`;
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
        original_text: page.original_text || `Page ${page.page} - ${page.summary || 'Astrology content'}`,
        rule_summary: page.summary || `Astrology rule from page ${page.page}`,
        rule_summary_ml: '',
        data_json: JSON.stringify({ page: page.page, detected: true }),
        conflict_with: conflictWith,
        conflict_note: conflictNote,
        verified: false
      });

      categoriesCovered.add(page.category);
    }

    // Bulk create in batches
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

    // Update or create ManuscriptLibrary entry
    const existingManuscripts = await base44.asServiceRole.entities.ManuscriptLibrary.filter({});
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
        notes: 'Astrology-correspondences ingestion'
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