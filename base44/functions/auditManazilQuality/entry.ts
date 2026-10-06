import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const MANSION_NAMES_ARABIC = [
  'الشرطين', 'البطين', 'الثريا', 'الدبران', 'الهقعة',
  'الهعة', 'الذراع', 'النفثرة', 'الطرف', 'الجبهة',
  'الزبرة', 'الصرفة', 'العواء', 'السماك', 'الغفر',
  'الزبانا', 'الإكليل', 'القلب', 'الشولة', 'النعائم',
  'البلدة', 'سعد الذابح', 'سعد البلع', 'سعد السعود', 'سعد الأخبية',
  'الفرغ المقدم', 'الفرغ المؤخر', 'الرشا'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const allRules = await base44.entities.ManuscriptRule.filter({});
    
    const mansionData = MANSION_NAMES_ARABIC.map((arabicName, idx) => ({
      number: idx + 1,
      arabic_name: arabicName,
      records: [],
      fields: {
        has_arabic_name: false,
        has_letter: false,
        has_planet: false,
        has_zodiac: false,
        has_element: false,
        has_saad_nahs: false,
        has_metal: false,
        has_color: false,
        has_manuscript_citation: false
      },
      sources: []
    }));

    allRules.forEach(rule => {
      let parsedData = {};
      try { parsedData = rule.data_json ? JSON.parse(rule.data_json) : {}; } catch (e) {}

      const mansions = parsedData.lunar_mansions || parsedData.mansion || null;
      const mansionList = Array.isArray(mansions) ? mansions : (mansions ? [mansions] : []);

      mansionList.forEach(mansion => {
        if (!mansion || typeof mansion !== 'string') return;
        
        const mansionIdx = mansionData.findIndex(m => 
          m.arabic_name === mansion || 
          m.arabic_name.includes(mansion) ||
          mansion.includes(m.arabic_name) ||
          m.arabic_name.toLowerCase().includes(mansion.toLowerCase())
        );

        if (mansionIdx !== -1) {
          const m = mansionData[mansionIdx];
          m.records.push(rule);

          if (parsedData.letter || (Array.isArray(parsedData.letters) && parsedData.letters.length > 0)) m.fields.has_letter = true;
          if (parsedData.planet || (Array.isArray(parsedData.planets) && parsedData.planets.length > 0)) m.fields.has_planet = true;
          if (parsedData.zodiac || (Array.isArray(parsedData.zodiac_signs) && parsedData.zodiac_signs.length > 0)) m.fields.has_zodiac = true;
          if (parsedData.element || (Array.isArray(parsedData.elements) && parsedData.elements.length > 0)) m.fields.has_element = true;
          if (parsedData.saad_nahs) m.fields.has_saad_nahs = true;
          if (parsedData.metal || (Array.isArray(parsedData.metals) && parsedData.metals.length > 0)) m.fields.has_metal = true;
          if (parsedData.color || (Array.isArray(parsedData.colors) && parsedData.colors.length > 0)) m.fields.has_color = true;
          
          if (rule.book_name && rule.page_number) {
            m.fields.has_manuscript_citation = true;
            m.sources.push({
              book: rule.book_name,
              page: rule.page_number,
              author: rule.author
            });
          }
        }
      });
    });

    mansionData.forEach(m => {
      m.fields.has_arabic_name = true;
      m.completeness_score = Math.round(
        (Object.values(m.fields).filter(v => v).length / Object.values(m.fields).length) * 100
      );
      m.missing_fields = Object.entries(m.fields)
        .filter(([_, v]) => !v)
        .map(([k, _]) => k);
    });

    const summary = {
      total_mansions: 28,
      mansions_with_records: mansionData.filter(m => m.records.length > 0).length,
      mansions_complete: mansionData.filter(m => m.completeness_score === 100).length,
      mansions_partial: mansionData.filter(m => m.completeness_score > 0 && m.completeness_score < 100).length,
      mansions_empty: mansionData.filter(m => m.records.length === 0).length,
      average_completeness: Math.round(
        mansionData.reduce((sum, m) => sum + m.completeness_score, 0) / 28
      ),
      total_manuscript_citations: mansionData.reduce((sum, m) => sum + m.records.length, 0)
    };

    return Response.json({ success: true, mansionData, summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});