import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { 
      pdf_url, 
      pdf_file, // 'pdf1_pages_1_40', 'pdf2_pages_41_120', 'pdf3_pages_121_186'
      start_page,
      end_page,
      batch_number 
    } = await req.json();

    if (!pdf_url || !pdf_file) {
      return Response.json({ error: 'pdf_url and pdf_file required' }, { status: 400 });
    }

    // Use AI to extract Holy Names from this PDF batch
    const extraction = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract ALL Holy Names from pages ${start_page} to ${end_page} of this PDF.

This is from "معاني الأسماء الإلهية" (Ma'ani al-Asma' al-Ilahiyya) by Sheikh Afif al-Din al-Tilimsani.

For EACH Holy Name on these pages, extract:
1. surah_name: Which Surah this name appears under (in English, e.g., "Al-Fatiha", "Al-Baqara")
2. surah_number: Surah number (1-114)
3. arabic_name: EXACT Arabic text as written
4. arabic_transliteration: Latin script
5. malayalam_pronunciation: Malayalam script pronunciation
6. meaning_malayalam: Meaning in simple Malayalam
7. explanation_malayalam: COMPLETE explanation translated to Malayalam - EVERY paragraph, EVERY sentence, NOTHING omitted
8. virtues_benefits: All virtues/benefits in Malayalam
9. islamic_information: All Quranic references, hadith, scholarly opinions in Malayalam
10. authentic_notes: All notes, warnings, conditions in Malayalam
11. source_pdf_page: Exact page number
12. source_reference_arabic: Arabic heading from PDF
13. order_in_surah: Sequential order within this surah

RULES:
- Do NOT skip any name
- Do NOT skip any paragraph
- Do NOT summarize
- Translate explanations to clean Malayalam
- Keep Arabic text exactly as written
- Include EVERYTHING from the PDF

Return JSON: { "names": [...], "total_found": number, "extraction_notes": "any notes" }`,
      file_urls: [pdf_url],
      response_json_schema: {
        type: "object",
        properties: {
          names: {
            type: "array",
            items: {
              type: "object",
              properties: {
                surah_name: { type: "string" },
                surah_number: { type: "integer" },
                arabic_name: { type: "string" },
                arabic_transliteration: { type: "string" },
                malayalam_pronunciation: { type: "string" },
                meaning_malayalam: { type: "string" },
                explanation_malayalam: { type: "string" },
                virtues_benefits: { type: "string" },
                islamic_information: { type: "string" },
                authentic_notes: { type: "string" },
                source_pdf_page: { type: "integer" },
                source_reference_arabic: { type: "string" },
                order_in_surah: { type: "integer" }
              },
              required: ["arabic_name", "source_pdf_page"]
            }
          },
          total_found: { type: "integer" },
          extraction_notes: { type: "string" }
        }
      },
      model: "claude_sonnet_4_6"
    });

    if (!extraction || !extraction.names || extraction.names.length === 0) {
      return Response.json({ 
        error: 'No names extracted', 
        details: extraction 
      }, { status: 500 });
    }

    // Get current max global_order
    const allExisting = await base44.entities.HolyOnePDFName.list();
    const maxGlobalOrder = allExisting.length > 0 
      ? Math.max(...allExisting.map(n => n.global_order || 0))
      : 0;

    const results = [];
    const errors = [];

    for (let i = 0; i < extraction.names.length; i++) {
      const nameData = extraction.names[i];
      const pdfNameId = `PDF-HN-${String(maxGlobalOrder + i + 1).padStart(3, '0')}`;
      
      try {
        const existing = await base44.entities.HolyOnePDFName.filter({ pdf_name_id: pdfNameId });
        
        if (existing && existing.length > 0) {
          await base44.entities.HolyOnePDFName.update(existing[0].id, {
            ...nameData,
            source_pdf_file: pdf_file,
            global_order: maxGlobalOrder + i + 1,
            verification_status: 'pending',
            import_batch: batch_number || `batch-${Date.now()}`
          });
          results.push({ 
            pdf_name_id: pdfNameId, 
            arabic_name: nameData.arabic_name, 
            status: 'updated',
            page: nameData.source_pdf_page 
          });
        } else {
          await base44.entities.HolyOnePDFName.create({
            pdf_name_id: pdfNameId,
            ...nameData,
            source_pdf_file: pdf_file,
            global_order: maxGlobalOrder + i + 1,
            verification_status: 'pending',
            import_batch: batch_number || `batch-${Date.now()}`,
            is_favorite: false,
            view_count: 0,
            created_by: user.id,
            created_date: new Date().toISOString(),
            archived: false
          });
          results.push({ 
            pdf_name_id: pdfNameId, 
            arabic_name: nameData.arabic_name, 
            status: 'created',
            page: nameData.source_pdf_page 
          });
        }
      } catch (err) {
        errors.push({ 
          pdf_name_id: pdfNameId, 
          arabic_name: nameData?.arabic_name,
          error: err.message 
        });
      }
    }

    return Response.json({
      success: true,
      batch_number: batch_number,
      pdf_file: pdf_file,
      page_range: `${start_page}-${end_page}`,
      extracted: extraction.names.length,
      created: results.filter(r => r.status === 'created').length,
      updated: results.filter(r => r.status === 'updated').length,
      errors: errors.length,
      results,
      error_details: errors,
      extraction_notes: extraction.extraction_notes,
      total_in_database: maxGlobalOrder + extraction.names.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});