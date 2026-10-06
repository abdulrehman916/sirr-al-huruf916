import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { screenshotUrls } = await req.json();

    if (!screenshotUrls || !Array.isArray(screenshotUrls) || screenshotUrls.length === 0) {
      return Response.json({ error: 'No screenshot URLs provided' }, { status: 400 });
    }

    const results = [];
    let updated = 0;
    let skipped = 0;

    for (const url of screenshotUrls) {
      try {
        // Extract text from screenshot
        const extraction = await base44.integrations.Core.InvokeLLM({
          prompt: `Extract ALL visible text from this FAAL CHOB divination card screenshot. Include:
1) The combination code (3 Arabic letters like ا ب د)
2) Any grid position number visible (1-64)
3) ALL Persian/Arabic text in the main content area
4) Any text labeled as Danyal (دانیال)
5) Any text labeled as Sadiq (صادق)
6) Any verse text at top

Return as JSON with fields: combination, gridPos, mainText, danyalText, sadiqText, verseText.
Extract EXACTLY what's visible - no summarization, no translation, no AI generation.`,
          file_urls: [url],
          model: "gemini_3_flash"
        });

        const extracted = typeof extraction === 'string' ? JSON.parse(extraction) : extraction;

        if (!extracted.gridPos || !extracted.combination) {
          results.push({
            url,
            success: false,
            error: 'Could not detect grid position or combination',
            extracted
          });
          skipped++;
          continue;
        }

        // Generate Arabic translation
        const arabicTranslation = await base44.integrations.Core.InvokeLLM({
          prompt: `Translate this Faal Chob divination text to Arabic (العربية). 
Keep the spiritual and traditional tone. Maintain the structure with separate sections for main text, Danyal, and Sadiq.

Original Persian text:
${extracted.mainText}

${extracted.danyalText ? 'Danyal: ' + extracted.danyalText : ''}
${extracted.sadiqText ? 'Sadiq: ' + extracted.sadiqText : ''}

Provide translation in JSON format:
{
  "text": "Arabic translation of main text",
  "danyal": "Arabic translation of Danyal text",
  "sadiq": "Arabic translation of Sadiq text"
}`,
          model: "gemini_3_flash"
        });

        const arabic = typeof arabicTranslation === 'string' ? JSON.parse(arabicTranslation) : arabicTranslation;

        // Generate Malayalam translation
        const malayalamTranslation = await base44.integrations.Core.InvokeLLM({
          prompt: `Translate this Faal Chob divination text to Malayalam (മലയാളം). 
Keep the spiritual and traditional tone. Maintain the structure with separate sections for main text, Danyal, and Sadiq.

Original Persian text:
${extracted.mainText}

${extracted.danyalText ? 'Danyal: ' + extracted.danyalText : ''}
${extracted.sadiqText ? 'Sadiq: ' + extracted.sadiqText : ''}

Provide translation in JSON format:
{
  "text": "Malayalam translation of main text",
  "danyal": "Malayalam translation of Danyal text",
  "sadiq": "Malayalam translation of Sadiq text"
}`,
          model: "gemini_3_flash"
        });

        const malayalam = typeof malayalamTranslation === 'string' ? JSON.parse(malayalamTranslation) : malayalamTranslation;

        // Update the translation files
        results.push({
          url,
          success: true,
          gridPos: extracted.gridPos,
          combination: extracted.combination,
          persian: {
            text: extracted.mainText,
            danyal: extracted.danyalText,
            sadiq: extracted.sadiqText,
            verse: extracted.verseText
          },
          arabic,
          malayalam,
          message: 'Successfully processed and translated'
        });
        updated++;

      } catch (error) {
        results.push({
          url,
          success: false,
          error: error.message
        });
        skipped++;
      }
    }

    return Response.json({
      results,
      summary: {
        total: screenshotUrls.length,
        updated,
        skipped
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});