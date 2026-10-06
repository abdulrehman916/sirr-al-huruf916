/**
 * DATABASE STANDARD UPGRADE — ARABIC PRESERVATION RULE
 * Reindexes ALL astrology records to enforce Arabic script as primary authoritative value
 * Applies to: Zodiac, Mansions, Planets, Letters, Saad/Nahs, Timing, Vefks, Talismans
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    console.log('Starting Arabic Preservation Database Upgrade...');

    // Get ALL manuscript rules
    const allRules = await base44.asServiceRole.entities.ManuscriptRule.filter({});
    
    // Categories requiring Arabic preservation
    const astrologyCategories = [
      'ZODIAC', 'LUNAR_MANSIONS', 'PLANETARY_LETTERS', 'LETTER_RULES',
      'SAAD_NAHS', 'PLANETS', 'ELECTIONAL_TIMING', 'PLANETARY_HOURS',
      'TIMING_RULES', 'SPIRITUAL_WORKS', 'VEFK_RULES', 'TALISMAN_RULES'
    ];

    const relevantRules = allRules.filter(r => astrologyCategories.includes(r.category));
    console.log(`Processing ${relevantRules.length} astrology records`);

    let updatedCount = 0;
    let alreadyCorrect = 0;
    const upgradeLog = [];

    // Arabic letter mapping (Malayalam → Arabic)
    const malayalamToArabic = {
      'അലിഫ്': 'ا', 'ബാ': 'ب', 'താ': 'ت', 'സാ': 'ث', 'ജീം': 'ج',
      'ഹാ': 'ح', 'ഖാ': 'خ', 'ദാൽ': 'د', 'ദാ': 'ذ', 'റാ': 'ر',
      'സായ്': 'ز', 'സീൻ': 'س', 'ശീൻ': 'ش', 'സ്വാദ്': 'ص', 'ദ്വാദ്': 'ض',
      'ത്വാ': 'ط', 'ലാ': 'ظ', 'ഐൻ': 'ع', 'ഗൈൻ': 'غ', 'ഫാ': 'ف',
      'ഖാഫ്': 'ق', 'കാഫ്': 'ك', 'ലാം': 'ل', 'മീം': 'م', 'നൂൻ': 'ن',
      'ഹാഅ': 'ه', 'വാവ്': 'و', 'യാ': 'ي'
    };

    // Lunar mansion Arabic names
    const mansionArabicMap = {
      'Sharatan': 'الشرطين', 'Butayn': 'البطين', 'Thuraya': 'الثريا',
      'Dabaran': 'الدبران', 'Haqah': 'الهقعة', 'Hanah': 'الهنعة',
      'Dira': 'الذراع', 'Nathrah': 'النثرة', 'Tarf': 'الطرف',
      'Jabhah': 'الجبهة', 'Zubrah': 'الزبرة', 'Sarfah': 'الصرفة',
      'Awwa': 'العواء', 'Simak': 'السماك', 'Ghafr': 'الغفر',
      'Zubana': 'الزبانا', 'Iklil': 'الإكليل', 'Qalb': 'القلب',
      'Shawlah': 'الشولة', 'Naim': 'النعائم', 'Baldah': 'البلدة',
      'Sad al Dhabih': 'سعد الذابح', 'Sad Bula': 'سعد بلع',
      'Sad al Suud': 'سعد السعود', 'Sad al Akhibah': 'سعد الأخبية',
      'Fargh Muqaddam': 'الفرغ المقدم', 'Fargh Muakhar': 'الفرغ المؤخر',
      'Risha': 'الرشا'
    };

    // Zodiac Arabic names
    const zodiacArabicMap = {
      'Aries': 'الحمل', 'Taurus': 'الثور', 'Gemini': 'الجوزاء',
      'Cancer': 'السرطان', 'Leo': 'الأسد', 'Virgo': 'السنبلة',
      'Libra': 'الميزان', 'Scorpio': 'العقرب', 'Sagittarius': 'القوس',
      'Capricorn': 'الجدى', 'Aquarius': 'الدلو', 'Pisces': 'الحوت'
    };

    for (const rule of relevantRules) {
      let needsUpdate = false;
      let dataJson = {};
      let upgradeReasons = [];

      try {
        dataJson = typeof rule.data_json === 'string' ? JSON.parse(rule.data_json) : rule.data_json;

        // 1. Fix Arabic letters (convert Malayalam → Arabic)
        if (dataJson.letter && malayalamToArabic[dataJson.letter]) {
          const arabic = malayalamToArabic[dataJson.letter];
          dataJson.letter_malayalam = dataJson.letter_malayalam || dataJson.letter;
          dataJson.letter = arabic;
          needsUpdate = true;
          upgradeReasons.push(`letter: ${dataJson.letter}`);
        }

        // Fix letter arrays
        if (Array.isArray(dataJson.letters)) {
          const fixedLetters = dataJson.letters.map(l => malayalamToArabic[l] || l);
          if (JSON.stringify(fixedLetters) !== JSON.stringify(dataJson.letters)) {
            dataJson.letters_malayalam = dataJson.letters.map(l => malayalamToArabic[l] ? l : null).filter(Boolean);
            dataJson.letters = fixedLetters;
            needsUpdate = true;
            upgradeReasons.push('letters array fixed');
          }
        }

        // 2. Fix lunar mansion Arabic names
        if (dataJson.lunar_mansion && !/[\u0600-\u06FF]/.test(dataJson.lunar_mansion)) {
          for (const [en, ar] of Object.entries(mansionArabicMap)) {
            if (dataJson.lunar_mansion.includes(en)) {
              dataJson.lunar_mansion_arabic = ar;
              dataJson.lunar_mansion_malayalam = dataJson.lunar_mansion_malayalam || dataJson.lunar_mansion;
              needsUpdate = true;
              upgradeReasons.push(`mansion: ${ar}`);
              break;
            }
          }
        }

        // 3. Fix zodiac Arabic names
        if (dataJson.zodiac && !/[\u0600-\u06FF]/.test(dataJson.zodiac)) {
          for (const [en, ar] of Object.entries(zodiacArabicMap)) {
            if (dataJson.zodiac.includes(en)) {
              dataJson.zodiac_arabic = ar;
              dataJson.zodiac_malayalam = dataJson.zodiac_malayalam || dataJson.zodiac;
              needsUpdate = true;
              upgradeReasons.push(`zodiac: ${ar}`);
              break;
            }
          }
        }

        // 4. Ensure planet names have Arabic
        if (dataJson.planet && !/[\u0600-\u06FF]/.test(dataJson.planet)) {
          const planetArabicMap = {
            'Saturn': 'زحل', 'Jupiter': 'مشتری', 'Mars': 'مریخ',
            'Sun': 'شمس', 'Venus': 'زهره', 'Mercury': 'عطارد', 'Moon': 'قمر'
          };
          const arabic = planetArabicMap[dataJson.planet];
          if (arabic) {
            dataJson.planet_arabic = arabic;
            dataJson.planet_malayalam = dataJson.planet_malayalam || dataJson.planet;
            needsUpdate = true;
            upgradeReasons.push(`planet: ${arabic}`);
          }
        }

        // 5. Preserve original Arabic text
        if (rule.original_text && !dataJson.original_arabic_text) {
          if (/[\u0600-\u06FF]/.test(rule.original_text)) {
            dataJson.original_arabic_text = rule.original_text;
            needsUpdate = true;
            upgradeReasons.push('preserved Arabic text');
          }
        }

        // 6. Ensure page citation exists
        if (!dataJson.page_number && rule.page_number) {
          dataJson.page_number = rule.page_number;
          needsUpdate = true;
        }

        // 7. Ensure manuscript ID
        if (!dataJson.manuscript_id && rule.manuscript_id) {
          dataJson.manuscript_id = rule.manuscript_id;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await base44.asServiceRole.entities.ManuscriptRule.update(rule.id, {
            data_json: JSON.stringify(dataJson)
          });
          updatedCount++;
          upgradeLog.push({
            rule_id: rule.rule_id,
            category: rule.category,
            page: rule.page_number,
            upgrades: upgradeReasons
          });
        } else {
          alreadyCorrect++;
        }

      } catch (parseErr) {
        console.log(`Skip ${rule.rule_id}: ${parseErr.message}`);
      }
    }

    return Response.json({
      status: 'success',
      upgrade_complete: true,
      total_processed: relevantRules.length,
      updated: updatedCount,
      already_correct: alreadyCorrect,
      sample_upgrades: upgradeLog.slice(0, 30),
      categories_affected: [...new Set(relevantRules.map(r => r.category))]
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});