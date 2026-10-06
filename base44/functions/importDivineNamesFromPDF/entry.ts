import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { pdf_url, pdf_file_key, start_global_order = 1 } = body;

    if (!pdf_url) {
      return Response.json({ error: 'pdf_url required' }, { status: 400 });
    }

    // Call LLM to extract names from PDF
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: "gemini_3_1_pro",
      prompt: `You are extracting Divine Names (أسماء إلهية) from the Arabic Islamic book "معاني الأسماء الإلهية" by ʿAfīf al-Dīn al-Tilimsānī.

This book discusses the meanings of God's Names as found in the Quran, organized by Surah.

For EVERY Divine Name in this PDF, extract:
1. The exact Arabic name (e.g., "اسمه الله تبارك وتعالى" or "اسمه الرحمن عز وجل")
2. Which Surah it appears in
3. The Surah number (1=Fatiha, 2=Baqara, etc.)
4. The PDF page number where this name starts
5. The Arabic Quranic verse reference cited
6. Complete explanation from the book (every single paragraph, word for word - DO NOT SUMMARIZE)
7. All virtues and spiritual benefits mentioned
8. All Islamic information (Hadith, scholarly opinions cited)
9. All authentic notes, warnings, conditions

IMPORTANT: 
- Extract EVERY name discussed in this PDF
- Include the COMPLETE text for each name - do not shorten or summarize
- Translate ALL content to accurate Malayalam
- Keep Arabic text exactly as written

For Malayalam translation use proper Islamic Malayalam terminology.

Return as JSON:
{
  "names": [
    {
      "arabic_name": "اسمه الله تبارك وتعالى",
      "arabic_transliteration": "Allaah",
      "surah_name": "Al-Fatiha",
      "surah_name_arabic": "سورة الفاتحة",
      "surah_number": 1,
      "source_pdf_page": 18,
      "source_reference_arabic": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "malayalam_pronunciation": "അള്ളാഹ്",
      "meaning_malayalam": "ദൈവം - ആരാധനക്ക് അർഹൻ",
      "explanation_malayalam": "FULL explanation in Malayalam - all paragraphs",
      "virtues_benefits": "all virtues in Malayalam",
      "islamic_information": "Quran verses, Hadith references in Malayalam",
      "authentic_notes": "scholarly notes in Malayalam",
      "order_in_surah": 1,
      "global_order": 1
    }
  ]
}`,
      file_urls: [pdf_url],
      response_json_schema: {
        type: "object",
        properties: {
          names: {
            type: "array",
            items: {
              type: "object",
              properties: {
                arabic_name: { type: "string" },
                arabic_transliteration: { type: "string" },
                surah_name: { type: "string" },
                surah_name_arabic: { type: "string" },
                surah_number: { type: "integer" },
                source_pdf_page: { type: "integer" },
                source_reference_arabic: { type: "string" },
                malayalam_pronunciation: { type: "string" },
                meaning_malayalam: { type: "string" },
                explanation_malayalam: { type: "string" },
                virtues_benefits: { type: "string" },
                islamic_information: { type: "string" },
                authentic_notes: { type: "string" },
                order_in_surah: { type: "integer" },
                global_order: { type: "integer" }
              }
            }
          }
        }
      }
    });

    const names = result?.names || [];
    const imported = [];
    const failed = [];

    // Import each name into database
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const globalOrder = start_global_order + i;
      
      try {
        const pdfNameId = `PDF-HN-${String(globalOrder).padStart(3, '0')}`;
        
        // Check if already exists
        const existing = await base44.asServiceRole.entities.HolyOnePDFName.filter({ pdf_name_id: pdfNameId });
        
        const data = {
          pdf_name_id: pdfNameId,
          arabic_name: name.arabic_name || '',
          arabic_transliteration: name.arabic_transliteration || '',
          surah_name: name.surah_name || '',
          surah_number: name.surah_number || 0,
          source_pdf_page: name.source_pdf_page || 0,
          source_pdf_file: pdf_file_key || 'pdf1',
          source_reference_arabic: name.source_reference_arabic || '',
          malayalam_pronunciation: name.malayalam_pronunciation || '',
          meaning_malayalam: name.meaning_malayalam || '',
          explanation_malayalam: name.explanation_malayalam || '',
          virtues_benefits: name.virtues_benefits || '',
          islamic_information: name.islamic_information || '',
          authentic_notes: name.authentic_notes || '',
          global_order: globalOrder,
          order_in_surah: name.order_in_surah || 0,
          verification_status: 'verified',
          import_batch: `batch_${Date.now()}`,
          created_by: user.id
        };

        if (existing && existing.length > 0) {
          await base44.asServiceRole.entities.HolyOnePDFName.update(existing[0].id, data);
        } else {
          await base44.asServiceRole.entities.HolyOnePDFName.create(data);
        }
        
        imported.push(pdfNameId);
      } catch (err) {
        failed.push({ index: i, name: name.arabic_name, error: err.message });
      }
    }

    return Response.json({
      success: true,
      total_extracted: names.length,
      imported: imported.length,
      failed: failed.length,
      failed_details: failed,
      imported_ids: imported
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});