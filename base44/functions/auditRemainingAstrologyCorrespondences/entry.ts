/**
 * AUDIT REMAINING ASTROLOGY CORRESPONDENCES
 * Estimates records for: Lunar Mansions, Saad/Nahs, Letters, Numbers, Colors, Elements, Metals, Stones, Incense, Animals, Plants, Zodiac, Conjunctions, Elections, Planetary Strength
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

    console.log('Auditing remaining astrology correspondences');

    const auditPrompt = `Audit this Elbuni manuscript for remaining astrology correspondences.

Count pages containing:

1. LUNAR MANSIONS (28 manazil/ay menzilleri) - names, timings, properties
2. SAAD/NAHS - benefic/malefic, uğurlu/uğursuz classifications
3. PLANETARY LETTERS - huruf associations with planets
4. PLANETARY NUMBERS - ebced values, numerical correspondences
5. PLANETARY COLORS - renk associations
6. PLANETARY ELEMENTS - ateş/toprak/hava/su
7. PLANETARY METALS - demir/altın/gümüş/bakır etc.
8. PLANETARY STONES - akik/mercan/incu etc.
9. INCENSE ASSOCIATIONS - buhur/tütsü for planets
10. ANIMAL ASSOCIATIONS - hayvan correspondences
11. PLANT ASSOCIATIONS - bitki/ot correspondences
12. ZODIAC CORRESPONDENCES - burç properties beyond timing
13. CONJUNCTION RULES - kavuşum aspects
14. ELECTIONAL TIMING - seçim rules
15. PLANETARY STRENGTH - kuvvetli/zayıf dignities

For each category, estimate page count and rule count.

Return JSON:
{
  "lunar_mansions": {"pages": X, "estimated_rules": Y},
  "saad_nahs": {"pages": X, "estimated_rules": Y},
  ...
  "total_estimated_rules": N
}`;

    let auditResults = {};
    let totalEstimatedRules = 0;

    for (const pdfUrl of pdf_urls) {
      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: auditPrompt,
          file_urls: [pdfUrl],
          model: 'claude_sonnet_4_6'
        });

        try {
          let parsed;
          if (typeof result === 'string') {
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
          } else {
            parsed = result;
          }

          if (parsed) {
            for (const [key, value] of Object.entries(parsed)) {
              if (typeof value === 'object' && value.pages) {
                if (!auditResults[key]) auditResults[key] = { pages: 0, estimated_rules: 0 };
                auditResults[key].pages += value.pages;
                auditResults[key].estimated_rules += value.estimated_rules;
              }
              if (key === 'total_estimated_rules') {
                totalEstimatedRules += value;
              }
            }
          }
        } catch (e) {
          console.log('Parse failed');
        }
      } catch (pdfErr) {
        console.error('PDF error:', pdfErr.message);
      }
    }

    // Get existing database counts
    const existingRules = await base44.asServiceRole.entities.ManuscriptRule.filter({});
    const existingCategories = new Set(existingRules.map(r => r.category));

    return Response.json({
      audit_complete: {
        manuscript: "Sems'ul-Maarif'ul-Kubra (Vol. 3)",
        pdfs_audited: pdf_urls.length,
        remaining_categories_audit: auditResults,
        total_estimated_new_rules: totalEstimatedRules,
        existing_database: {
          total_rules: existingRules.length,
          existing_categories: Array.from(existingCategories),
          existing_categories_count: existingCategories.size
        },
        ingestion_recommendation: `Proceed with ingestion of ~${totalEstimatedRules} new records across ${Object.keys(auditResults).length} categories`
      }
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});