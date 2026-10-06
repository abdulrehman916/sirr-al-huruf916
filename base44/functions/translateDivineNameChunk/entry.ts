import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Translates a short Arabic text chunk into Malayalam and saves/updates one HolyOneName record.
// Designed for fast calls — accepts pre-extracted Arabic text, no PDF processing.

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      name_id,
      arabic_name,
      arabic_transliteration,
      surah_name,
      surah_number,
      source_page,
      order_index,
      arabic_text,      // Full Arabic commentary text
      dry_run = false
    } = body;

    if (!name_id || !arabic_name || !arabic_text) {
      return Response.json({ error: 'name_id, arabic_name, arabic_text required' }, { status: 400 });
    }

    const tr = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Translate this Arabic commentary from "معاني الأسماء الإلهية" (al-Tilimsani) into clear, natural Malayalam (മലയാളം).

Divine Name: ${arabic_name} (${arabic_transliteration || ''})
Surah: ${surah_name || ''}

ARABIC TEXT:
"""
${arabic_text}
"""

STRICT RULES:
1. Translate EVERY sentence — zero omissions, zero summarization.
2. Preserve paragraph breaks with blank lines between paragraphs.
3. Quranic verses: keep Arabic in ﴿﴾, then Malayalam translation in quotes.
   Example: ﴿بِسْمِ اللَّهِ﴾ "അല്ലാഹുവിന്റെ നാമത്തിൽ"
4. Technical Sufi/philosophical terms — transliterate + brief parenthetical explanation (first use only):
   وجود = വജൂദ് (അസ്തിത്വം), ذات = ദ്ദാത് (ദൈവിക സത്ത), حضرة = ഹദ്‌റ (ദൈവിക സന്നിധി), تجلي = തജ‌ല്ലി (ദൈവ പ്രകടനം), مشتق = മുശ്‌തഖ്‌ഖ് (ഉൽപ്പന്ന നാമം), مصدر = മസ്‌ദർ (ഭാവ നാമം), مرتبة = മർതബ (അദ്ധ്യാത്മിക പദവി), إنسانية = ഇൻസാനിയ്യ (ആദർശ മനുഷ്യ ജ്ഞാനം)
5. Scholar names: keep Arabic name + Malayalam pronunciation in parentheses.
6. DO NOT add your own explanations or footnotes.
7. DO NOT skip any sentence, clause, or list item.

Also provide:
- meaning_malayalam: 1-3 sentences — the direct meaning of this Divine Name.
- virtues_benefits: any spiritual benefits, effects, or practical guidance mentioned (empty string if none).
- islamic_information: all Quranic verses mentioned with translations (empty string if none).
- authentic_notes: any warnings, conditions, or guidance for practitioners (empty string if none).

Return valid JSON only:
{
  "meaning_malayalam": "...",
  "explanation_malayalam": "...complete translation...",
  "virtues_benefits": "...",
  "islamic_information": "...",
  "authentic_notes": "..."
}`,
      model: "gpt_5_mini",
      response_json_schema: {
        type: "object",
        properties: {
          meaning_malayalam: { type: "string" },
          explanation_malayalam: { type: "string" },
          virtues_benefits: { type: "string" },
          islamic_information: { type: "string" },
          authentic_notes: { type: "string" }
        },
        required: ["meaning_malayalam", "explanation_malayalam"]
      }
    });

    if (dry_run) {
      return Response.json({
        success: true,
        dry_run: true,
        name_id,
        arabic_name,
        explanation_length: tr?.explanation_malayalam?.length || 0,
        preview: (tr?.explanation_malayalam || '').substring(0, 500)
      });
    }

    const existing = await base44.asServiceRole.entities.HolyOneName.filter({ name_id });

    const recordData = {
      name_id,
      arabic_name,
      arabic_transliteration: arabic_transliteration || '',
      malayalam_pronunciation: '',
      meaning_malayalam: tr?.meaning_malayalam || '',
      explanation_malayalam: tr?.explanation_malayalam || '',
      virtues_benefits: tr?.virtues_benefits || '',
      islamic_information: tr?.islamic_information || '',
      authentic_notes: tr?.authentic_notes || '',
      source_page: source_page || 0,
      source_reference: `${surah_name || ''} — معاني الأسماء الإلهية، الشيخ عفيف الدين التلمساني`,
      order_index: order_index || 0,
      created_by: user.id,
      created_date: new Date().toISOString(),
      archived: false
    };

    let record;
    if (existing && existing.length > 0) {
      record = await base44.asServiceRole.entities.HolyOneName.update(existing[0].id, recordData);
    } else {
      record = await base44.asServiceRole.entities.HolyOneName.create(recordData);
    }

    return Response.json({
      success: true,
      id: record.id,
      name_id,
      arabic_name,
      explanation_length: tr?.explanation_malayalam?.length || 0
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});