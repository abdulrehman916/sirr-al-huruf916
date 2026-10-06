import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { pdf_urls } = payload;

    if (!pdf_urls || !Array.isArray(pdf_urls) || pdf_urls.length === 0) {
      return Response.json({ error: 'No PDF URLs provided' }, { status: 400 });
    }

    const allImportedNames = [];
    let globalOrder = 1;

    // Get current max global_order to continue from where we left off
    try {
      const existingNames = await base44.entities.HolyOnePDFName.list("-global_order", 1);
      if (existingNames && existingNames.length > 0) {
        globalOrder = existingNames[0].global_order + 1;
      }
    } catch (e) {
      console.log('No existing names, starting from 1');
    }

    // Process each PDF
    for (let pdfIndex = 0; pdfIndex < pdf_urls.length; pdfIndex++) {
      const pdfInfo = pdf_urls[pdfIndex];
      const pdfName = pdfInfo.name || `pdf${pdfIndex + 1}`;
      
      console.log(`Processing ${pdfName}...`);

      try {
        // Extract ALL Holy Names from PDF using vision-capable LLM
        const extraction = await base44.integrations.Core.InvokeLLM({
          prompt: `Extract ALL Holy Names from this PDF with COMPLETE content. For EACH name, extract EVERYTHING:

1. arabic_name: Exact Arabic name with full harakat (vowel marks)
2. arabic_transliteration: Latin script transliteration
3. malayalam_pronunciation: Pronunciation written in Malayalam script
4. meaning_malayalam: Complete meaning in Malayalam
5. explanation_malayalam: COMPLETE explanation - EVERY paragraph from PDF, nothing omitted, nothing summarized
6. virtues_benefits: ALL virtues, benefits, powers, spiritual effects mentioned in PDF
7. islamic_information: ALL Quranic verses, hadith, scholarly opinions from PDF
8. authentic_notes: ALL notes, warnings, conditions, prerequisites, references from PDF
9. source_pdf_page: Exact page number where this name appears
10. surah_name: Name of Surah where this name appears (if mentioned)
11. surah_number: Surah number 1-114 (if known)
12. order_in_surah: Sequential order within the surah

CRITICAL RULES:
- DO NOT summarize anything
- DO NOT omit any paragraphs
- DO NOT rewrite or paraphrase
- Translate everything to clean, readable Malayalam
- Preserve exact structure and order from PDF
- Extract EVERY word of content
- If content is in Arabic, translate fully to Malayalam
- Return ALL names found in the PDF

Format response as JSON array of name objects.`,
          file_urls: pdfInfo.url,
          response_json_schema: {
            type: "object",
            properties: {
              names: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    arabic_name: { type: "string", description: "Exact Arabic name with harakat" },
                    arabic_transliteration: { type: "string" },
                    malayalam_pronunciation: { type: "string" },
                    meaning_malayalam: { type: "string" },
                    explanation_malayalam: { type: "string" },
                    virtues_benefits: { type: "string" },
                    islamic_information: { type: "string" },
                    authentic_notes: { type: "string" },
                    source_pdf_page: { type: "integer" },
                    surah_name: { type: "string" },
                    surah_number: { type: "integer" },
                    order_in_surah: { type: "integer" }
                  },
                  required: ["arabic_name", "malayalam_pronunciation", "meaning_malayalam", "source_pdf_page"]
                }
              }
            },
            required: ["names"]
          },
          model: "gemini_3_1_pro" // Best for vision + translation + long context
        });

        if (extraction.names && extraction.names.length > 0) {
          console.log(`Found ${extraction.names.length} names in ${pdfName}`);

          // Process each extracted name
          for (const nameData of extraction.names) {
            const newRecord = {
              pdf_name_id: `PDF-${String(globalOrder).padStart(3, '0')}`,
              surah_name: nameData.surah_name || '',
              surah_number: nameData.surah_number || 0,
              arabic_name: nameData.arabic_name,
              arabic_transliteration: nameData.arabic_transliteration || '',
              malayalam_pronunciation: nameData.malayalam_pronunciation,
              meaning_malayalam: nameData.meaning_malayalam,
              explanation_malayalam: nameData.explanation_malayalam || '',
              virtues_benefits: nameData.virtues_benefits || '',
              islamic_information: nameData.islamic_information || '',
              authentic_notes: nameData.authentic_notes || '',
              source_pdf_page: nameData.source_pdf_page,
              source_pdf_file: pdfName,
              source_reference_arabic: '',
              order_in_surah: nameData.order_in_surah || globalOrder,
              global_order: globalOrder,
              verification_status: 'pending',
              import_batch: `auto_import_${new Date().toISOString().split('T')[0]}`,
              is_favorite: false,
              view_count: 0,
              archived: false
            };

            // Create record in database
            await base44.entities.HolyOnePDFName.create(newRecord);
            
            allImportedNames.push({
              ...newRecord,
              has_complete_content: !!(nameData.explanation_malayalam && nameData.virtues_benefits),
              content_length: {
                explanation: nameData.explanation_malayalam?.length || 0,
                virtues: nameData.virtues_benefits?.length || 0,
                islamic: nameData.islamic_information?.length || 0
              }
            });

            globalOrder++;
          }
        }
      } catch (error) {
        console.error(`Error processing ${pdfName}:`, error.message);
        allImportedNames.push({
          pdf_name: pdfName,
          error: error.message,
          status: 'failed'
        });
      }
    }

    return Response.json({
      message: `Successfully imported ${allImportedNames.filter(n => !n.error).length} names`,
      count: allImportedNames.filter(n => !n.error).length,
      global_order_reached: globalOrder,
      imported_names: allImportedNames,
      errors: allImportedNames.filter(n => n.error).map(n => ({ pdf: n.pdf_name, error: n.error }))
    });

  } catch (error) {
    console.error('Import function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});