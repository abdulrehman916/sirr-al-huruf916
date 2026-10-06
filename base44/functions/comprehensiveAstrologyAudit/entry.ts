/**
 * COMPREHENSIVE ASTROLOGY CORRESPONDENCES AUDIT — Chunked Processing
 * Processes each PDF separately to avoid timeout
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

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

    console.log('Running chunked comprehensive astrology audit');

    const categories = [
      'LUNAR_MANSIONS', 'SAAD_NAHS', 'PLANETARY_LETTERS', 'PLANETARY_NUMBERS',
      'PLANETARY_COLORS', 'PLANETARY_ELEMENTS', 'PLANETARY_METALS', 'PLANETARY_STONES',
      'INCENSE_ASSOCIATIONS', 'ANIMAL_ASSOCIATIONS', 'PLANT_ASSOCIATIONS',
      'ZODIAC_CORRESPONDENCES', 'CONJUNCTION_RULES', 'ELECTIONAL_TIMING', 'PLANETARY_STRENGTH'
    ];

    const allCorrespondences = [];
    const categoriesDetected = {};
    const pagesWithContent = new Set();

    // Process each PDF
    for (const pdfUrl of pdf_urls) {
      console.log(`Processing ${pdfUrl}`);
      
      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `List ALL astrology correspondences. Return JSON array:
[{"page_number":5,"category":"PLANETARY_METALS","subcategory":"gold","planet":"Sun","original_turkish_text":"quote","rule_summary":"summary"},...]

Categories: ${categories.join(', ')}`,
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
          
          if (Array.isArray(parsed)) {
            allCorrespondences.push(...parsed);
            parsed.forEach(c => {
              if (c.category) {
                categoriesDetected[c.category] = (categoriesDetected[c.category] || 0) + 1;
              }
              if (c.page_number) {
                pagesWithContent.add(c.page_number);
              }
            });
          }
        } catch (e) {
          console.log('Parse failed for this PDF');
        }
      } catch (pdfErr) {
        console.error('PDF error:', pdfErr.message);
      }
    }

    console.log(`Total: ${allCorrespondences.length} correspondences`);

    // Get existing database
    const existingRules = await base44.asServiceRole.entities.ManuscriptRule.filter({});
    const existingCategories = new Set(existingRules.map(r => r.category));

    // Analyze
    let estimatedNew = 0;
    let estimatedOverlap = 0;

    allCorrespondences.forEach(c => {
      const overlap = existingRules.some(r => r.category === c.category && r.page_number === c.page_number);
      if (overlap) estimatedOverlap++;
      else estimatedNew++;
    });

    const categoryReport = Object.entries(categoriesDetected).map(([cat, count]) => ({
      category: cat,
      estimated_records: count,
      is_new: !existingCategories.has(cat),
      existing_count: existingRules.filter(r => r.category === cat).length
    })).sort((a, b) => b.estimated_records - a.estimated_records);

    return Response.json({
      audit: {
        manuscript: "Sems'ul-Maarif'ul-Kubra (Vol. 3)",
        pdfs_scanned: pdf_urls.length,
        total_correspondences: allCorrespondences.length,
        unique_pages: pagesWithContent.size,
        categories_detected: Object.keys(categoriesDetected).length,
        estimated_new_records: estimatedNew,
        estimated_overlaps: estimatedOverlap,
        category_breakdown: categoryReport,
        existing_total_rules: existingRules.length,
        sample: allCorrespondences.slice(0, 15).map(c => ({
          page: c.page_number,
          category: c.category,
          subcategory: c.subcategory,
          summary: c.rule_summary?.substring(0, 80)
        })),
        ready_to_ingest: allCorrespondences.length > 0
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});