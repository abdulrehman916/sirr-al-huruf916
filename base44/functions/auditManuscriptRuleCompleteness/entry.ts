import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const allRules = await base44.entities.ManuscriptRule.filter({});
    
    const audit = {
      total_records: allRules.length,
      with_original_arabic: 0,
      with_malayalam_translation: 0,
      with_arabic_letter: 0,
      with_planet: 0,
      with_zodiac: 0,
      with_lunar_mansion: 0,
      with_element: 0,
      with_saad_nahs: 0,
      with_metal: 0,
      with_color: 0,
      by_category: {},
      by_manuscript: {},
      completeness_score: 0
    };

    allRules.forEach((rule) => {
      const ruleId = rule.rule_id || rule.id;
      const category = rule.category || 'UNKNOWN';
      const manuscript = rule.manuscript_id || 'UNKNOWN';

      if (!audit.by_category[category]) audit.by_category[category] = { total: 0, with_arabic: 0, with_malayalam: 0, with_letter: 0, with_planet: 0, with_zodiac: 0, with_mansion: 0, with_element: 0, with_saad_nahs: 0, with_metal: 0, with_color: 0 };
      audit.by_category[category].total++;

      if (!audit.by_manuscript[manuscript]) audit.by_manuscript[manuscript] = { total: 0, with_arabic: 0, with_malayalam: 0, with_letter: 0, with_planet: 0, with_zodiac: 0, with_mansion: 0, with_element: 0, with_saad_nahs: 0, with_metal: 0, with_color: 0 };
      audit.by_manuscript[manuscript].total++;

      let parsedData = {};
      try { parsedData = rule.data_json ? JSON.parse(rule.data_json) : {}; } catch (e) {}

      const hasArabic = rule.original_text && rule.original_text.trim().length > 0;
      if (hasArabic) { audit.with_original_arabic++; audit.by_category[category].with_arabic++; audit.by_manuscript[manuscript].with_arabic++; }

      const hasMalayalam = rule.rule_summary_ml && rule.rule_summary_ml.trim().length > 0;
      if (hasMalayalam) { audit.with_malayalam_translation++; audit.by_category[category].with_malayalam++; audit.by_manuscript[manuscript].with_malayalam++; }

      const hasLetter = parsedData.letter || parsedData.arabic_letter || parsedData.harf || (parsedData.letters && parsedData.letters.length > 0);
      if (hasLetter) { audit.with_arabic_letter++; audit.by_category[category].with_letter++; audit.by_manuscript[manuscript].with_letter++; }

      const hasPlanet = parsedData.planet || parsedData.ruling_planet || (parsedData.planets && parsedData.planets.length > 0) || (category === 'PLANETS');
      if (hasPlanet) { audit.with_planet++; audit.by_category[category].with_planet++; audit.by_manuscript[manuscript].with_planet++; }

      const hasZodiac = parsedData.zodiac || parsedData.zodiac_sign || parsedData.sign || (parsedData.zodiac_signs && parsedData.zodiac_signs.length > 0) || (category === 'ZODIAC');
      if (hasZodiac) { audit.with_zodiac++; audit.by_category[category].with_zodiac++; audit.by_manuscript[manuscript].with_zodiac++; }

      const hasMansion = parsedData.mansion || parsedData.lunar_mansion || parsedData.manazil || (parsedData.mansions && parsedData.mansions.length > 0) || (category === 'LUNAR_MANSIONS');
      if (hasMansion) { audit.with_lunar_mansion++; audit.by_category[category].with_mansion++; audit.by_manuscript[manuscript].with_mansion++; }

      const hasElement = parsedData.element || (parsedData.elements && parsedData.elements.length > 0);
      if (hasElement) { audit.with_element++; audit.by_category[category].with_element++; audit.by_manuscript[manuscript].with_element++; }

      const hasSaadNahs = parsedData.saad_nahs;
      if (hasSaadNahs) { audit.with_saad_nahs++; audit.by_category[category].with_saad_nahs++; audit.by_manuscript[manuscript].with_saad_nahs++; }

      const hasMetal = parsedData.metal || (parsedData.metals && parsedData.metals.length > 0);
      if (hasMetal) { audit.with_metal++; audit.by_category[category].with_metal++; audit.by_manuscript[manuscript].with_metal++; }

      const hasColor = parsedData.color || (parsedData.colors && parsedData.colors.length > 0);
      if (hasColor) { audit.with_color++; audit.by_category[category].with_color++; audit.by_manuscript[manuscript].with_color++; }
    });

    const total = audit.total_records || 1;
    const rates = [
      audit.with_original_arabic / total,
      audit.with_malayalam_translation / total,
      audit.with_arabic_letter / total,
      audit.with_planet / total,
      audit.with_zodiac / total,
      audit.with_lunar_mansion / total,
      audit.with_element / total,
      audit.with_saad_nahs / total,
      audit.with_metal / total,
      audit.with_color / total
    ];
    audit.completeness_score = Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100);

    return Response.json({ success: true, audit });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});