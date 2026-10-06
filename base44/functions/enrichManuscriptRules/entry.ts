import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const PATTERNS = {
  letters: [
    { ar: 'أ', en: 'Alif' }, { ar: 'ب', en: 'Ba' }, { ar: 'ت', en: 'Ta' },
    { ar: 'ث', en: 'Tha' }, { ar: 'ج', en: 'Jim' }, { ar: 'ح', en: 'Ha' },
    { ar: 'خ', en: 'Kha' }, { ar: 'د', en: 'Dal' }, { ar: 'ذ', en: 'Dhal' },
    { ar: 'ر', en: 'Ra' }, { ar: 'ز', en: 'Zay' }, { ar: 'س', en: 'Sin' },
    { ar: 'ش', en: 'Shin' }, { ar: 'ص', en: 'Sad' }, { ar: 'ض', en: 'Dad' },
    { ar: 'ط', en: 'Ta' }, { ar: 'ظ', en: 'Za' }, { ar: 'ع', en: 'Ayn' },
    { ar: 'غ', en: 'Ghayn' }, { ar: 'ف', en: 'Fa' }, { ar: 'ق', en: 'Qaf' },
    { ar: 'ك', en: 'Kaf' }, { ar: 'ل', en: 'Lam' }, { ar: 'م', en: 'Mim' },
    { ar: 'ن', en: 'Nun' }, { ar: 'ه', en: 'Ha' }, { ar: 'و', en: 'Waw' },
    { ar: 'ي', en: 'Ya' }
  ],
  mansions: ['Al-Sharatain', 'Al-Butayn', 'Al-Thurayya', 'Al-Dabaran', 'Al-Haqah', 
    'Al-Hanah', 'Al-Dhira', 'Al-Nathrah', 'Al-Tarf', 'Al-Jabhah', 'Al-Zubrah', 
    'Al-Sarfah', 'Al-Awwa', 'Al-Simak', 'Al-Ghafr', 'Al-Zubana', 'Al-Iklil', 
    'Al-Qalb', 'Al-Shawlah', 'Al-Naim', 'Al-Baldah', 'Sad al-Dhabih', 
    'Sad al-Bulah', 'Sad al-Suud', 'Sad al-Akhbiyah', 'Al-Fargh al-Muqaddam', 
    'Al-Fargh al-Muakhkhar', 'Al-Risha'],
  planets: [
    { ar: 'شمس', en: 'Sun' }, { ar: 'قمر', en: 'Moon' },
    { ar: 'عطارد', en: 'Mercury' }, { ar: 'زهرة', en: 'Venus' },
    { ar: 'مرّيخ', en: 'Mars' }, { ar: 'مشترى', en: 'Jupiter' },
    { ar: 'زحل', en: 'Saturn' }
  ],
  zodiacs: [
    { ar: 'حمل', en: 'Aries' }, { ar: 'ثور', en: 'Taurus' },
    { ar: 'جوزاء', en: 'Gemini' }, { ar: 'سرطان', en: 'Cancer' },
    { ar: 'أسد', en: 'Leo' }, { ar: 'سنبل', en: 'Virgo' },
    { ar: 'ميزان', en: 'Libra' }, { ar: 'عقرب', en: 'Scorpio' },
    { ar: 'قوس', en: 'Sagittarius' }, { ar: 'جدي', en: 'Capricorn' },
    { ar: 'دلو', en: 'Aquarius' }, { ar: 'حوت', en: 'Pisces' }
  ],
  elements: [
    { ar: 'نار', en: 'Fire' }, { ar: 'هواء', en: 'Air' },
    { ar: 'ماء', en: 'Water' }, { ar: 'تراب', en: 'Earth' }
  ],
  saadNahs: ['Saad', 'Nahs', 'سعد', 'نحس', 'سعيد', 'نحس'],
  metals: ['ذهب', 'فضة', 'نحاس', 'حديد', 'قصدير', 'رصاص', 'زئبق'],
  colors: ['أحمر', 'أبيض', 'أسود', 'أصفر', 'أخضر', 'أزرق']
};

function extractEntities(text) {
  if (!text || typeof text !== 'string') return {};
  const result = {};
  
  const foundLetters = PATTERNS.letters.filter(p => text.includes(p.ar)).map(p => p.en);
  if (foundLetters.length > 0) result.letters = foundLetters;
  
  const foundMansions = PATTERNS.mansions.filter(m => text.includes(m));
  if (foundMansions.length > 0) result.lunar_mansions = foundMansions;
  
  const foundPlanets = PATTERNS.planets.filter(p => text.includes(p.ar)).map(p => p.en);
  if (foundPlanets.length > 0) result.planets = foundPlanets;
  
  const foundZodiacs = PATTERNS.zodiacs.filter(z => text.includes(z.ar)).map(z => z.en);
  if (foundZodiacs.length > 0) result.zodiac_signs = foundZodiacs;
  
  const foundElements = PATTERNS.elements.filter(e => text.includes(e.ar)).map(e => e.en);
  if (foundElements.length > 0) result.elements = foundElements;
  
  const hasSaad = PATTERNS.saadNahs.some(s => text.includes(s));
  if (hasSaad) result.saad_nahs = PATTERNS.saadNahs.filter(s => text.includes(s))[0];
  
  const foundMetals = PATTERNS.metals.filter(m => text.includes(m));
  if (foundMetals.length > 0) result.metals = foundMetals;
  
  const foundColors = PATTERNS.colors.filter(c => text.includes(c));
  if (foundColors.length > 0) result.colors = foundColors;
  
  return result;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const payload = await req.json().catch(() => ({}));
    const { batchSize = 3, skip = 0 } = payload;

    const allRules = await base44.entities.ManuscriptRule.filter({}, '-created_date', 1000);
    const batch = allRules.slice(skip, skip + batchSize);
    
    if (batch.length === 0) {
      return Response.json({ 
        success: true, 
        done: true, 
        message: 'All records processed',
        enriched: 0,
        skipped: 0
      });
    }

    let enriched = 0;
    let skipped = 0;
    const updates = [];

    for (const rule of batch) {
      try {
        const existingData = rule.data_json ? JSON.parse(rule.data_json) : {};
        
        if (existingData.auto_extracted && 
            existingData.letters && existingData.lunar_mansions && 
            existingData.planets && existingData.zodiac_signs) {
          skipped++;
          continue;
        }

        const extracted = extractEntities(rule.original_text);
        
        if (Object.keys(extracted).length === 0) {
          skipped++;
          continue;
        }

        const newData = {
          ...existingData,
          ...extracted,
          auto_extracted: true,
          extraction_date: new Date().toISOString()
        };

        updates.push({
          id: rule.id,
          data_json: JSON.stringify(newData)
        });
        enriched++;
      } catch (e) {
        console.error(`Error processing rule ${rule.id}:`, e.message);
      }
    }

    if (updates.length > 0) {
      await Promise.all(
        updates.map(u => base44.entities.ManuscriptRule.update(u.id, { data_json: u.data_json }))
      );
    }

    return Response.json({
      success: true,
      done: skip + batchSize >= allRules.length,
      nextSkip: skip + batchSize,
      total: allRules.length,
      enriched,
      skipped,
      processed: skip + batch.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});