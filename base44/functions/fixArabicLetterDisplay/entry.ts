/**
 * FIX ARABIC LETTER DISPLAY IN DATABASE
 * Ensures all Arabic letters are stored as original glyphs
 * Malayalam transliterations only as secondary descriptions
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const allRules = await base44.asServiceRole.entities.ManuscriptRule.filter({});
    
    const relevantRules = allRules.filter(r => {
      const cats = ['PLANETARY_LETTERS', 'LUNAR_MANSIONS', 'ZODIAC', 'SAAD_NAHS', 'LETTER_RULES'];
      return cats.includes(r.category);
    });

    let updatedCount = 0;
    const updateLog = [];

    for (const rule of relevantRules) {
      let needsUpdate = false;
      let dataJson = {};
      
      try {
        dataJson = typeof rule.data_json === 'string' ? JSON.parse(rule.data_json) : rule.data_json;
      } catch {
        continue;
      }

      // Fix: Ensure Arabic letters are glyphs, not Malayalam
      const malayalamToArabic = {
        'ഹാ': 'ح', 'ത്വാ': 'ط', 'യാ': 'ي', 'കാഫ്': 'ك', 'ലാം': 'ل',
        'ഗൈൻ': 'غ', 'അലിഫ്': 'ا', 'ബാ': 'ب', 'താ': 'ت', 'സാ': 'ث',
        'ജീം': 'ج', 'ഖാ': 'خ', 'ദാൽ': 'د', 'റാ': 'ر', 'സായ്': 'ز',
        'സീൻ': 'س', 'ശീൻ': 'ش', 'സ്വാദ്': 'ص', 'ദ്വാദ്': 'ض', 'ഐൻ': 'ع',
        'ഫാ': 'ف', 'ഖാഫ്': 'ق', 'മീം': 'م', 'നൂൻ': 'ن', 'ഹാ': 'ه',
        'വാവ്': 'و'
      };

      if (dataJson.letter && malayalamToArabic[dataJson.letter]) {
        const arabic = malayalamToArabic[dataJson.letter];
        dataJson.letter_malayalam = dataJson.letter;
        dataJson.letter = arabic;
        needsUpdate = true;
        updateLog.push({ rule_id: rule.rule_id, fix: 'letter', from: malayalamToArabic[dataJson.letter], to: arabic });
      }

      // Fix: Ensure lunar mansions have Arabic
      if (dataJson.lunar_mansion && !/[\u0600-\u06FF]/.test(dataJson.lunar_mansion)) {
        const mansionMap = {
          'Sharatan': 'الشرطين', 'Butayn': 'البطين', 'Thuraya': 'الثريا',
          'Dabaran': 'الدبران', 'Haqah': 'هقعة', 'Hanah': 'هنعة',
          'Dira': 'الذراع', 'Nathrah': 'النثرة', 'Tarf': 'الطرف',
          'Jabhah': 'الجبهة', 'Zubrah': 'الزبرة', 'Sarfah': 'الصرفة',
          'Awwa': 'العواء', 'Simak': 'السماك', 'Ghafr': 'الغفر',
          'Zubana': 'الزبانا', 'Iklil': 'الإكليل', 'Qalb': 'القلب',
          'Shawlah': 'الشولة', 'Naim': 'النعائم', 'Baldah': 'البلدة',
          'Sad al Dhabih': 'سعد الذابح', 'Sad Bula': 'سعد بلع',
          'Sad al Suud': 'سعد السعود', 'Sad al Akhibah': 'سعد الأخبية'
        };
        for (const [en, ar] of Object.entries(mansionMap)) {
          if (dataJson.lunar_mansion.includes(en)) {
            dataJson.lunar_mansion_arabic = ar;
            needsUpdate = true;
            updateLog.push({ rule_id: rule.rule_id, fix: 'mansion_arabic', value: ar });
            break;
          }
        }
      }

      // Fix: Ensure zodiac has Arabic
      if (dataJson.zodiac && !/[\u0600-\u06FF]/.test(dataJson.zodiac)) {
        const zodiacMap = {
          'Aries': 'الحمل', 'Taurus': 'الثور', 'Gemini': 'الجوزاء',
          'Cancer': 'السرطان', 'Leo': 'الأسد', 'Virgo': 'السنبلة',
          'Libra': 'الميزان', 'Scorpio': 'العقرب', 'Sagittarius': 'القوس',
          'Capricorn': 'الجدى', 'Aquarius': 'الدلو', 'Pisces': 'الحوت'
        };
        for (const [en, ar] of Object.entries(zodiacMap)) {
          if (dataJson.zodiac.includes(en)) {
            dataJson.zodiac_arabic = ar;
            needsUpdate = true;
            updateLog.push({ rule_id: rule.rule_id, fix: 'zodiac_arabic', value: ar });
            break;
          }
        }
      }

      if (needsUpdate) {
        await base44.asServiceRole.entities.ManuscriptRule.update(rule.id, {
          data_json: JSON.stringify(dataJson)
        });
        updatedCount++;
      }
    }

    return Response.json({
      status: 'success',
      total_checked: relevantRules.length,
      updated: updatedCount,
      sample_fixes: updateLog.slice(0, 20)
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});