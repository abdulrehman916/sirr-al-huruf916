/**
 * INGEST REMAINING ASTROLOGY CORRESPONDENCES
 * Extracts: Lunar Mansions, Saad/Nahs, Letters, Numbers, Colors, Elements, Metals, Stones, Incense, Animals, Plants, Zodiac, Conjunctions, Elections, Planetary Strength
 * Additive-only: no deletions, no overwrites
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MANUSCRIPT_ID = 'elbuni_semsul_maarif_remaining_astro';
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

    console.log(`Ingesting remaining astrology correspondences from ${pdf_urls.length} PDFs`);

    const extractionPrompt = `Extract ALL astrology correspondences from this Elbuni manuscript.

Focus on these categories:

1. LUNAR_MANSIONS - 28 manazil names, properties, timings
2. SAAD_NAHS - benefic/malefic, uğurlu/uğursuz
3. PLANETARY_LETTERS - huruf associations
4. PLANETARY_NUMBERS - ebced values
5. PLANETARY_COLORS - renk
6. PLANETARY_ELEMENTS - ateş/toprak/hava/su
7. PLANETARY_METALS - demir/altın/gümüş
8. PLANETARY_STONES - akik/mercan
9. INCENSE_ASSOCIATIONS - buhur/tütsü
10. ANIMAL_ASSOCIATIONS - hayvan
11. PLANT_ASSOCIATIONS - bitki/ot
12. ZODIAC_CORRESPONDENCES - burç properties
13. CONJUNCTION_RULES - kavuşum/aspects
14. ELECTIONAL_TIMING - seçim rules
15. PLANETARY_STRENGTH - kuvvetli/zayıf

For each correspondence:
{
  "page_number": <number>,
  "category": "<category from above>",
  "planet": "<planet if applicable>",
  "correspondence": "<specific item: e.g., 'red color', 'agate stone', 'letter Alif'>",
  "original_text": "<exact Turkish/Arabic quote>",
  "rule_summary": "<English summary>"
}

Return JSON array. Extract EVERY correspondence.`;

    const allCorrespondences = [];

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
          if (Array.isArray(parsed)) allCorrespondences.push(...parsed);
        } catch (e) {
          console.log('Parse failed');
        }
      } catch (pdfErr) {
        console.error('PDF error:', pdfErr.message);
      }
    }

    console.log(`Extracted ${allCorrespondences.length} correspondences`);

    // Get existing data
    const existingRules = await base44.asServiceRole.entities.ManuscriptRule.filter({});
    const existingManuscripts = await base44.asServiceRole.entities.ManuscriptLibrary.filter({});

    // Create rules
    const rulesToCreate = [];
    const categoriesCovered = new Set();
    let alternateSourceCount = 0;

    for (const corr of allCorrespondences) {
      if (!corr.page_number || !corr.category) continue;

      const ruleId = `${MANUSCRIPT_ID}_p${corr.page_number}_${corr.category}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      // Check overlap
      const similar = existingRules.filter(r => 
        r.category === corr.category && 
        r.page_number === corr.page_number
      );

      let subcategory = corr.correspondence || '';
      let conflictWith = null;
      let conflictNote = null;

      if (similar.length > 0) {
        subcategory += ' [ALTERNATE_SOURCE]';
        conflictWith = similar[0].rule_id;
        conflictNote = `Alt from ${similar[0].book_name}`;
        alternateSourceCount++;
      }

      rulesToCreate.push({
        rule_id: ruleId,
        manuscript_id: MANUSCRIPT_ID,
        book_name: BOOK_NAME,
        author: AUTHOR,
        page_number: corr.page_number,
        chapter: '',
        category: corr.category,
        subcategory: subcategory,
        original_text: corr.original_text || `Page ${corr.page_number}: ${corr.correspondence || 'Correspondence'}`,
        rule_summary: corr.rule_summary || `${corr.category}: ${corr.correspondence || 'Astrological correspondence'} on page ${corr.page_number}`,
        rule_summary_ml: '',
        data_json: JSON.stringify({
          page: corr.page_number,
          category: corr.category,
          planet: corr.planet || null,
          correspondence: corr.correspondence || null,
          original_text: corr.original_text || null
        }),
        conflict_with: conflictWith,
        conflict_note: conflictNote,
        verified: false
      });

      categoriesCovered.add(corr.category);
    }

    // Bulk create
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
        notes: 'Remaining astrology correspondences ingestion'
      });
    }

    return Response.json({
      ingestion_complete: {
        status: 'success',
        manuscript_id: MANUSCRIPT_ID,
        book_name: BOOK_NAME,
        extraction_summary: {
          correspondences_extracted: allCorrespondences.length,
          records_created: createdCount,
          alternate_source_entries: alternateSourceCount
        },
        categories_added: Array.from(categoriesCovered),
        category_breakdown: Array.from(categoriesCovered).map(cat => ({
          category: cat,
          count: rulesToCreate.filter(r => r.category === cat).length
        })),
        sample_rules: rulesToCreate.slice(0, 5).map(r => ({
          rule_id: r.rule_id,
          page: r.page_number,
          category: r.category,
          correspondence: r.subcategory
        }))
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});