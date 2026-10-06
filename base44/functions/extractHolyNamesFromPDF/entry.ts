import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { pdf_url, start_index = 0, batch_size = 10 } = await req.json();
    if (!pdf_url) return Response.json({ error: 'pdf_url required' }, { status: 400 });

    // Use AI to extract Holy Names from the PDF with full Malayalam translations
    const extraction = await base44.integrations.Core.InvokeLLM({
      prompt: `You are extracting ALL Holy Names (أسماء إلهية) from the Islamic book "معاني الأسماء الإلهية" (Ma'ani al-Asma' al-Ilahiyya) by Sheikh Afif al-Din al-Tilimsani.

TASK: Extract EVERY SINGLE Holy Name from this PDF, starting from index ${start_index}, up to ${batch_size} names.

For EACH name, provide:
1. arabic_name: The exact Arabic name as written
2. arabic_transliteration: Latin script transliteration
3. malayalam_pronunciation: The pronunciation written in Malayalam script
4. meaning_malayalam: The meaning in natural Malayalam (NOT English translation)
5. explanation_malayalam: The COMPLETE explanation from the PDF translated into natural Malayalam - include EVERY paragraph, EVERY sentence. Do NOT summarize. Do NOT omit anything.
6. virtues_benefits: All virtues and benefits mentioned, in Malayalam
7. islamic_information: All Islamic information, Quranic verses referenced, hadith, scholarly opinions - in Malayalam
8. authentic_notes: Any authentic notes, warnings, conditions, references - in Malayalam
9. source_page: Page number in PDF where this name appears
10. source_reference: The Surah name and name heading in Arabic
11. order_index: Sequential number starting from ${start_index + 1}

The book covers these names in this ORDER (from the table of contents):
Surah Al-Fatiha: الله، الرحمن، الرب، الرحيم، الملك
Surah Al-Baqara: المحيط، القدير، العليم، الحكيم، التواب، المفضل، البصير، ذو الفضل، الولي، النصير، الواسع، البديع، المبتلي، السميع، العزيز، الكافي، الرؤوف، الإله الواحد، الشديد العذاب، الغفور، القريب، المجيب، السريع الحساب، الحليم، الخبير، القابض، الباسط، الحي، القيوم، العلي، العظيم، الغني، الحميد
Surah Al-Imran: المنتقم
And so on for all remaining surahs...

IMPORTANT RULES:
- Translate EVERYTHING into clean, natural Malayalam (Kerala dialect)
- NEVER summarize - include every sentence from the original text
- Arabic text must remain exactly as written
- Only translate the explanations/meaning into Malayalam
- If a name has multiple paragraphs of explanation, include ALL of them
- Include page numbers accurately

Return JSON with array "names" containing all extracted names.`,
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
                malayalam_pronunciation: { type: "string" },
                meaning_malayalam: { type: "string" },
                explanation_malayalam: { type: "string" },
                virtues_benefits: { type: "string" },
                islamic_information: { type: "string" },
                authentic_notes: { type: "string" },
                source_page: { type: "integer" },
                source_reference: { type: "string" },
                order_index: { type: "integer" }
              }
            }
          },
          total_found: { type: "integer" },
          extraction_notes: { type: "string" }
        }
      },
      model: "claude_sonnet_4_6"
    });

    if (!extraction || !extraction.names) {
      return Response.json({ error: 'Extraction failed', details: extraction }, { status: 500 });
    }

    const names = extraction.names;
    const results = [];
    const errors = [];

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const nameId = `HN-${String(start_index + i + 1).padStart(3, '0')}`;
      
      try {
        const existing = await base44.entities.HolyOneName.filter({ name_id: nameId });
        if (existing && existing.length > 0) {
          await base44.entities.HolyOneName.update(existing[0].id, {
            arabic_name: name.arabic_name || '',
            arabic_transliteration: name.arabic_transliteration || '',
            malayalam_pronunciation: name.malayalam_pronunciation || '',
            meaning_malayalam: name.meaning_malayalam || '',
            explanation_malayalam: name.explanation_malayalam || '',
            virtues_benefits: name.virtues_benefits || '',
            islamic_information: name.islamic_information || '',
            authentic_notes: name.authentic_notes || '',
            source_page: name.source_page || null,
            source_reference: name.source_reference || '',
            order_index: name.order_index || (start_index + i + 1),
          });
          results.push({ name_id: nameId, arabic_name: name.arabic_name, status: 'updated' });
        } else {
          await base44.entities.HolyOneName.create({
            name_id: nameId,
            arabic_name: name.arabic_name || '',
            arabic_transliteration: name.arabic_transliteration || '',
            malayalam_pronunciation: name.malayalam_pronunciation || '',
            meaning_malayalam: name.meaning_malayalam || '',
            explanation_malayalam: name.explanation_malayalam || '',
            virtues_benefits: name.virtues_benefits || '',
            islamic_information: name.islamic_information || '',
            authentic_notes: name.authentic_notes || '',
            source_page: name.source_page || null,
            source_reference: name.source_reference || '',
            order_index: name.order_index || (start_index + i + 1),
            is_favorite: false,
            view_count: 0,
            created_by: user.id,
            created_date: new Date().toISOString(),
            archived: false
          });
          results.push({ name_id: nameId, arabic_name: name.arabic_name, status: 'created' });
        }
      } catch (err) {
        errors.push({ name_id: nameId, error: err.message });
      }
    }

    return Response.json({
      success: true,
      processed: names.length,
      created: results.filter(r => r.status === 'created').length,
      updated: results.filter(r => r.status === 'updated').length,
      errors: errors.length,
      results,
      error_details: errors,
      extraction_notes: extraction.extraction_notes
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});