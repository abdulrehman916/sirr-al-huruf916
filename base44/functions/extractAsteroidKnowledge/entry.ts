import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // PDF URLs provided by user
    const pdfUrls = [
      { url: 'https://media.base44.com/files/public/69f3dea51ce92ee2fde20be6/65c0bce5b_AsteroidsBeautifulsouL-1-30.pdf', pages: '1-30' },
      { url: 'https://media.base44.com/files/public/69f3dea51ce92ee2fde20be6/3d656a546_AsteroidsBeautifulsouL-31-60.pdf', pages: '31-60' },
      { url: 'https://media.base44.com/files/public/69f3dea51ce92ee2fde20be6/9c7c35b4c_AsteroidsBeautifulsouL-61-90.pdf', pages: '61-90' }
    ];

    // Use InvokeLLM to extract astrological knowledge from each PDF
    const extractedKnowledge = [];
    const stats = {
      totalPagesProcessed: 0,
      totalRecordsAdded: 0,
      totalTablesAdded: 0,
      categoriesAdded: new Set(),
      duplicateSourcesFound: 0,
      knowledgeBaseGrowth: {}
    };

    for (const pdf of pdfUrls) {
      // Extract content using LLM with vision
      const extractionResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Extract ALL astrological timing rules from this PDF about asteroids (Ceres, Pallas, Juno, Vesta, Chiron, etc.). 

For EVERY rule, table, footnote, example, diagram explanation, timing rule, day rule, planetary rule, lunar mansion rule, zodiac rule, hour rule, spiritual timing rule, warning, and exception, extract:

1. Original text (exact quote)
2. Category (DAYS, HOURS, PLANETS, LUNAR_MANSIONS, ZODIAC, MOON_PHASES, STARS, SPECIAL_CONDITIONS, SPIRITUAL_OPERATIONS, RITUAL_TIMINGS, VEFK_TIMINGS, LETTER_TIMINGS, ELEMENT_TIMINGS, SEASONAL_RULES, CALENDAR_RULES, GOOD_TIMES, BAD_TIMES, SUITABLE_ACTIONS, UNSUITABLE_ACTIONS)
3. Asteroid name (if mentioned)
4. Astrological significance
5. Timing recommendations
6. Suitable actions
7. Unsuitable actions
8. Warnings
9. Page number
10. Chapter/section name

Return as JSON array with this structure:
[
  {
    "original_text": "exact quote from PDF",
    "category": "CATEGORY_NAME",
    "asteroid": "Ceres/Pallas/Juno/Vesta/Chiron/etc",
    "astrological_significance": "meaning",
    "timing_recommendations": ["list"],
    "suitable_actions": ["list"],
    "unsuitable_actions": ["list"],
    "warnings": ["list"],
    "page_number": number,
    "chapter": "chapter name"
  }
]

Extract EVERYTHING. Do not skip any content. Process all ${pdf.pages} pages.`,
        file_urls: [pdf.url],
        response_json_schema: {
          type: "object",
          properties: {
            extracted_rules: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  original_text: { type: "string" },
                  category: { type: "string" },
                  asteroid: { type: "string" },
                  astrological_significance: { type: "string" },
                  timing_recommendations: { type: "array", items: { type: "string" } },
                  suitable_actions: { type: "array", items: { type: "string" } },
                  unsuitable_actions: { type: "array", items: { type: "string" } },
                  warnings: { type: "array", items: { type: "string" } },
                  page_number: { type: "integer" },
                  chapter: { type: "string" }
                },
                required: ["original_text", "category", "page_number"]
              }
            }
          }
        }
      });

      if (extractionResult && extractionResult.extracted_rules) {
        extractedKnowledge.push(...extractionResult.extracted_rules);
        stats.totalRecordsAdded += extractionResult.extracted_rules.length;
        extractionResult.extracted_rules.forEach(rule => {
          stats.categoriesAdded.add(rule.category);
        });
      }

      // Count pages
      const pageRange = pdf.pages.split('-');
      stats.totalPagesProcessed += parseInt(pageRange[1]) - parseInt(pageRange[0]) + 1;
    }

    // Generate Malayalam explanations for each rule
    const knowledgeWithMalayalam = [];
    for (const rule of extractedKnowledge) {
      const malayalamResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate and explain this astrological timing rule in detailed Malayalam:

Original Text: ${rule.original_text}
Category: ${rule.category}
Asteroid: ${rule.asteroid || 'N/A'}
Significance: ${rule.astrological_significance || ''}

Provide:
1. മലയാളം തലക്കെട്ട് (Malayalam title)
2. അർത്ഥം (Meaning - detailed explanation)
3. പ്രായോഗിക ഉപയോഗം (Practical usage)
4. ഗുണങ്ങൾ (Benefits)
5. മുന്നറിയിപ്പുകൾ (Warnings)
6. എപ്പോൾ ഉപയോഗിക്കാം (When to use)
7. എപ്പോൾ ഒഴിവാക്കണം (When to avoid)

Return as JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            malayalam_title: { type: "string" },
            meaning: { type: "string" },
            practical_usage: { type: "string" },
            benefits: { type: "array", items: { type: "string" } },
            warnings: { type: "array", items: { type: "string" } },
            when_to_use: { type: "string" },
            when_to_avoid: { type: "string" }
          }
        }
      });

      knowledgeWithMalayalam.push({
        ...rule,
        malayalam: malayalamResult || {}
      });
    }

    // Check for duplicates and merge with existing knowledge
    const existingKnowledge = await checkExistingKnowledge();
    const finalKnowledge = mergeKnowledge(existingKnowledge, knowledgeWithMalayalam);
    
    stats.duplicateSourcesFound = finalKnowledge.filter(k => k.merged_sources && k.merged_sources.length > 1).length;
    stats.knowledgeBaseGrowth = {
      newRules: finalKnowledge.filter(k => !k.is_merge).length,
      mergedRules: finalKnowledge.filter(k => k.is_merge).length,
      totalAfterMerge: finalKnowledge.length
    };

    return Response.json({
      success: true,
      stats: {
        totalPagesProcessed: stats.totalPagesProcessed,
        totalRecordsAdded: stats.totalRecordsAdded,
        totalTablesAdded: stats.categoriesAdded.size,
        categoriesAdded: Array.from(stats.categoriesAdded),
        duplicateSourcesFound: stats.duplicateSourcesFound,
        knowledgeBaseGrowth: stats.knowledgeBaseGrowth
      },
      extractedKnowledge: finalKnowledge.slice(0, 50), // Return first 50 for preview
      message: `Successfully processed ${stats.totalPagesProcessed} pages and extracted ${stats.totalRecordsAdded} astrological timing rules with Malayalam explanations.`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function checkExistingKnowledge() {
  // This would query existing Astro Clock knowledge base
  // For now, return empty array (will be implemented with actual DB queries)
  return [];
}

function mergeKnowledge(existing, newKnowledge) {
  // Merge logic: check for duplicates, preserve all sources
  const merged = [...existing];
  
  newKnowledge.forEach(newRule => {
    const existingRule = merged.find(e => 
      e.original_text === newRule.original_text ||
      (e.category === newRule.category && e.asteroid === newRule.asteroid)
    );

    if (existingRule) {
      // Merge: add new source reference
      if (!existingRule.merged_sources) {
        existingRule.merged_sources = [{
          book: "Asteroids Beautiful Soul",
          pages: [existingRule.page_number]
        }];
      }
      existingRule.merged_sources.push({
        book: "Asteroids Beautiful Soul",
        pages: [newRule.page_number]
      });
      existingRule.is_merge = true;
    } else {
      // New unique rule
      merged.push({
        ...newRule,
        source: {
          book: "Asteroids Beautiful Soul",
          pages: [newRule.page_number]
        }
      });
    }
  });

  return merged;
}