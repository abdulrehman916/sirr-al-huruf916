import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK KNOWLEDGE IMPORT — PERMANENT SINGLE-STORE PIPELINE
//
// ONE centralized knowledge database: AstroClockKnowledge.
// Every astrology rule (from a PDF page image or screenshot) is
// OCR'd by the vision model, extracted, NORMALIZED across
// Arabic/Turkish/English, CLASSIFIED into a category + entity,
// deduplicated, and MERGED — never deleted, never overwritten.
//
// Two record classes are produced from each image:
//   (A) full_context timing records  (source_type='full_context',
//       rule_category='planetary_hour') — indexed by
//       weekday|period|saat|kawkab|nakshatra. Read by the Ritual
//       Timing Engine (Cards 1-6).
//   (B) categorized entity records    (source_type='categorized',
//       rule_category = Planet/Weekday/Zodiac/Lunar Mansion/Moon
//       Phase/Ritual Purpose/General/...) — indexed by
//       rule_category|rule_entity.
//
// MERGE RULES (per user mandate):
//   1. Never overwrite previous knowledge.
//   2. Never delete existing knowledge.
//   3. Remove true duplicates (text-normalized dedup).
//   4. Preserve every unique recommendation / attribute / note.
//   5. Preserve every source reference (with OCR confidence,
//      language, upload date, page, book title, screenshot URL).
//   6. Timing dedup key  = full_context_key.
//   7. Category dedup key = rule_record_key (category|entity).
//
// Multilingual normalization is INTERNAL only — the original
// wording is always preserved in knowledge_text_ar and entity_raw.
// ═══════════════════════════════════════════════════════════════

function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\u0600-\u06FF]/g, '')
    .trim();
}

// Normalize an arbitrary key for alias matching: lowercase, strip
// Arabic harakat, fold Turkish diacritics, drop non-letters.
function normKey(s: string): string {
  if (!s) return '';
  return String(s)
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '') // Arabic harakat + tatweel
    .replace(/â/g, 'a').replace(/î/g, 'i').replace(/û/g, 'u')
    .replace(/ü/g, 'u').replace(/ö/g, 'o')
    .replace(/ş/g, 's').replace(/ç/g, 'c').replace(/ğ/g, 'g')
    .replace(/[^a-z0-9\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function computeHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PLANET_KEYS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

// ── MULTILINGUAL NORMALIZATION MAPS (internal only) ──
// Each map: canonical -> array of aliases. Matching is done on
// normKey() of both the input and every alias. Original wording is
// never lost (entity_raw preserves it).

const PLANET_MAP: Record<string, string[]> = {
  sun: ['sun', 'shams', 'sems', 'sems', 'gunes', 'gunes', 'الشمس', 'شمس', 'samis', 'shems'],
  moon: ['moon', 'qamar', 'kamer', 'qamr', 'القمر', 'قمر', 'ay'],
  mars: ['mars', 'merih', 'mirrikh', 'marrikh', 'marih', 'مريخ', 'مرّيخ', 'merrix'],
  mercury: ['mercury', 'utarid', 'utrid', 'utarit', 'عطارد', 'utârid', 'mercur'],
  venus: ['venus', 'zuhra', 'zuhrah', 'zohra', 'zuhre', 'زهرة', 'الزهرة', 'çühre'],
  jupiter: ['jupiter', 'mustari', 'müşteri', 'moshtari', 'mushtari', 'مشتري', 'المشتري', 'müştəri'],
  saturn: ['saturn', 'zuhal', 'zühal', 'zuhâl', 'زحل', 'zuhel'],
};

const WEEKDAY_MAP: Record<string, string[]> = {
  sunday: ['sunday', 'pazar', 'الأحد', 'احد', 'ahad', 'ahad'],
  monday: ['monday', 'pazartesi', 'الإثنين', 'الاثنين', 'اثنين', 'ithnayn'],
  tuesday: ['tuesday', 'sali', 'salı', 'الثلاثاء', 'ثلاثاء', 'thulatha', 'salı'],
  wednesday: ['wednesday', 'carsamba', 'çarşamba', 'الأربعاء', 'اربعاء', 'arbaa'],
  thursday: ['thursday', 'persembe', 'perşembe', 'الخميس', 'خميس', 'khamis'],
  friday: ['friday', 'cuma', 'الجمعة', 'جمعة', 'jumuah'],
  saturday: ['saturday', 'cumartesi', 'السبت', 'سبت', 'sabt'],
};

const ZODIAC_MAP: Record<string, string[]> = {
  aries: ['aries', 'hamal', 'koç', 'koç', 'الحمل', 'حمل'],
  taurus: ['taurus', 'sevr', 'boga', 'boğa', 'الثور', 'ثور'],
  gemini: ['gemini', 'cevza', 'ikizler', 'الجوزاء', 'توأم', 'twins'],
  cancer: ['cancer', 'seretan', 'yengec', 'yengeç', 'السرطان', 'سرطان'],
  leo: ['leo', 'esed', 'aslan', 'الأسد', 'اسد', 'الاسد'],
  virgo: ['virgo', 'sumbule', 'sümbüle', 'basak', 'başak', 'السنبلة', 'سنبلة', 'sünbüle'],
  libra: ['libra', 'mizan', 'terazi', 'الميزان', 'ميزان'],
  scorpio: ['scorpio', 'akrep', 'العقرب', 'عقرب'],
  sagittarius: ['sagittarius', 'kavs', 'yay', 'القوس', 'قوس'],
  capricorn: ['capricorn', 'cedy', 'oglak', 'oğlak', 'الجدي', 'جدي'],
  aquarius: ['aquarius', 'dalu', 'kova', 'الدلو', 'دلو'],
  pisces: ['pisces', 'hut', 'balik', 'balık', 'الحوت', 'حوت'],
};

const MOON_PHASE_MAP: Record<string, string[]> = {
  'new moon': ['new moon', 'new', 'hilal', 'hilâl', 'محقاق', 'محاق', 'new-moon'],
  'waxing crescent': ['waxing crescent', 'waxing-crescent', 'hilal', 'هلال', 'ilk hilal', 'büyüyen hilal'],
  'first quarter': ['first quarter', 'first-quarter', 'ilk dört', 'ilk dordun', 'rubayi evvel', 'ربع اول'],
  'waxing gibbous': ['waxing gibbous', 'waxing-gibbous', 'büyüyen şişkin'],
  'full moon': ['full moon', 'full', 'bedir', 'badr', 'بدر', 'مقتبس', 'dolunay', 'full-moon'],
  'waning gibbous': ['waning gibbous', 'waning-gibbous', 'azalan şişkin'],
  'last quarter': ['last quarter', 'last-quarter', 'son dört', 'rubayi ahir', 'ربع اخير', 'ربع آخر'],
  'waning crescent': ['waning crescent', 'waning-crescent', 'son hilal', 'azalan hilal', 'hilali muhakk'],
};

const MANSION_MAP: Record<string, string[]> = {
  'al-sharatain': ['al-sharatain', 'sheratan', 'sharatain', ' الشرطان', 'الشرطان', 'shartayn', '1'],
  'al-butain': ['al-butain', 'butain', 'botayn', 'البطين', 'butayn', '2'],
  'al-thurayya': ['al-thurayya', 'thurayya', 'suraya', 'الثريا', 'süreyya', '3'],
  'al-debaran': ['al-debaran', 'debaran', 'deberan', 'الدبران', 'dabaran', '4'],
  'al-hak a': ['al-hak a', 'haka', 'hak a', 'المقس', 'الهقعة', 'hak-a', '5'],
  'al-hana': ['al-hana', 'hana', 'hena', 'الهنعة', 'han-a', '6'],
  'al-dhira': ['al-dhira', 'dhira', 'dira', 'الذراع', 'dhira', '7'],
  'al-nathra': ['al-nathra', 'nathra', 'netre', 'النثرة', 'nathrah', '8'],
  'al-tarf': ['al-tarf', 'tarf', 'terf', 'الطرف', 'tarfah', '9'],
  'al-jabha': ['al-jabha', 'jabha', 'cebhe', 'الجبهة', 'jabhah', '10'],
  'al-zubra': ['al-zubra', 'zubra', 'zubre', 'الزبرة', 'zubrah', '11'],
  'al-sarfa': ['al-sarfa', 'sarfa', 'serfe', 'الصرفة', 'sarafah', '12'],
  'al-awwa': ['al-awwa', 'awwa', 'eva', 'العوا', 'awwa', '13'],
  'al-simak': ['al-simak', 'simak', 'semek', 'السماك', 'simak', '14'],
  'al-ghafr': ['al-ghafr', 'ghafr', 'gafr', 'الغفر', 'ghafr', '15'],
  'al-jabana': ['al-jabana', 'jabana', 'jabane', 'الجبّة', 'jabanah', '16'],
  'al-zubana': ['al-zubana', 'zubana', 'zubane', 'الزبانا', 'zubanah', '17'],
  'al-iklil': ['al-iklil', 'iklil', 'iklil', 'الإكليل', 'aklil', '18'],
  'al-qalb': ['al-qalb', 'qalb', 'kalb', 'القلب', 'qalb', '19'],
  'al-shaula': ['al-shaula', 'shaula', 'şevle', 'الشولة', 'shawlah', '20'],
  'al-naam': ['al-naam', 'naam', 'naam', 'النعايم', 'naayim', '21'],
  'al-baldah': ['al-baldah', 'baldah', 'balde', 'البلدة', 'balda', '22'],
  'saad al-dhabih': ['saad al-dhabih', 'saad dhabih', 'saad-dhabih', 'سعد الذابح', '23'],
  'saad al-bula': ['saad al-bula', 'saad bula', 'saad-bula', 'سعد بلع', '24'],
  'saad al-suud': ['saad al-suud', 'saad suud', 'saad-suud', 'سعد سود', '25'],
  'saad al-akhbiya': ['saad al-akhbiya', 'saad akhbiya', 'saad-akhbiya', 'سعد اخب', '26'],
  'al-fargh al-muqaddam': ['al-fargh al-muqaddam', 'fargh muqaddam', 'al-fargh al-mukaddam', 'الفرغ المقدم', '27'],
  'al-fargh al-muakhkhar': ['al-fargh al-muakhkhar', 'fargh muakhkhar', 'al-fargh al-muahhar', 'الفرغ المؤخر', '28'],
};

// Canonical category slug map. The LLM may return Title-Case categories;
// we fold them to a stable lowercase slug. Unknown categories pass
// through (slugified) so the store supports unlimited future categories.
const CATEGORY_SLUG: Record<string, string> = {
  'planet': 'planet',
  'planetary hour': 'planetary hour',
  'weekday': 'weekday',
  'zodiac': 'zodiac',
  'lunar mansion': 'lunar mansion',
  'nakshatra': 'lunar mansion',
  'manzil': 'lunar mansion',
  'moon phase': 'moon phase',
  'ritual purpose': 'ritual purpose',
  'purpose': 'ritual purpose',
  'general astrology rules': 'general astrology rules',
  'general rule': 'general astrology rules',
  'general': 'general astrology rules',
  'benefic rules': 'benefic rules',
  'benefic': 'benefic rules',
  'malefic rules': 'malefic rules',
  'malefic': 'malefic rules',
  'marriage rules': 'marriage rules',
  'marriage': 'marriage rules',
  'travel rules': 'travel rules',
  'travel': 'travel rules',
  'trade rules': 'trade rules',
  'trade': 'trade rules',
  'health rules': 'health rules',
  'health': 'health rules',
  'financial rules': 'financial rules',
  'financial': 'financial rules',
  'agricultural rules': 'agricultural rules',
  'agricultural': 'agricultural rules',
  'weather rules': 'weather rules',
  'weather': 'weather rules',
};

function slugify(s: string): string {
  return String(s || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function normalizeCategory(raw: string): string {
  const k = slugify(raw);
  return CATEGORY_SLUG[k] || k;
}

// Look up a value across an alias map; return the canonical key.
function matchAlias(input: string, map: Record<string, string[]>): string | null {
  const n = normKey(input);
  if (!n) return null;
  for (const [canonical, aliases] of Object.entries(map)) {
    for (const a of aliases) {
      if (normKey(a) === n) return canonical;
    }
  }
  return null;
}

// Normalize the entity based on its category.
function normalizeEntity(category: string, rawEntity: string): string {
  const e = String(rawEntity || '').trim();
  if (!e) return '';
  switch (category) {
    case 'planet': return matchAlias(e, PLANET_MAP) || slugify(e);
    case 'weekday': return matchAlias(e, WEEKDAY_MAP) || slugify(e);
    case 'zodiac': return matchAlias(e, ZODIAC_MAP) || slugify(e);
    case 'lunar mansion': return matchAlias(e, MANSION_MAP) || slugify(e);
    case 'moon phase': return matchAlias(e, MOON_PHASE_MAP) || slugify(e);
    default: return slugify(e);
  }
}

// ── MERGE HELPERS ── (never overwrite, never delete)

function mergeActionArray(existing: any[], newItems: any[], source: any) {
  const result: any[] = JSON.parse(JSON.stringify(existing || []));
  const seen = new Set(result.map((i: any) => normalizeText(i.en)));
  let added = 0, duplicates = 0;
  for (const it of newItems) {
    const en = String(it.en || '').trim();
    if (!en) continue;
    const norm = normalizeText(en);
    if (norm && !seen.has(norm)) {
      seen.add(norm);
      result.push({ en, ml: String(it.ml || '').trim(), ar: String(it.ar || '').trim(), sources: [source] });
      added++;
    } else {
      duplicates++;
      const ex = result.find((i: any) => normalizeText(i.en) === norm);
      if (ex) {
        const srcs = ex.sources || [];
        const has = srcs.some((s: any) => (s.screenshot_url && source.screenshot_url && s.screenshot_url === source.screenshot_url) || (s.book_title === source.book_title && s.page_number === source.page_number));
        if (!has) srcs.push(source);
      }
    }
  }
  return { array: result, added, duplicates };
}

function mergeTextField(existing: string, newText: string) {
  if (!newText || !newText.trim()) return { text: existing || '', added: false };
  const ne = normalizeText(existing), nn = normalizeText(newText);
  if (ne.includes(nn)) return { text: existing || '', added: false };
  if (!existing) return { text: newText, added: true };
  return { text: existing + '\n---\n' + newText, added: true };
}

function mergeAttributes(existing: any, incoming: any) {
  const out: any = { ...(existing || {}) };
  let added = 0;
  for (const [k, v] of Object.entries(incoming || {})) {
    if (v === null || v === undefined || v === '') continue;
    if (out[k] === undefined) { out[k] = v; added++; }
    else if (String(out[k]) !== String(v)) { out[k + '_alt'] = v; added++; }
  }
  return { attributes: out, added };
}

function pushSource(arr: any[], source: any) {
  const out = [...(arr || [])];
  const has = out.some((s: any) => (s.screenshot_url && source.screenshot_url && s.screenshot_url === source.screenshot_url) || (s.book_title === source.book_title && s.page_number === source.page_number));
  if (!has) out.push(source);
  return out;
}

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { file_url, source_label } = body;
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    // ══ 1. Vision LLM — OCR + extract ALL rule types from the image ══
    const prompt = `You are an expert analyst of Islamic occult manuscripts about the Astro Clock (Saat / Kawkab / planetary hours), planets, weekdays, zodiac, lunar mansions (Manzil / Nakshatra), moon phases, and ritual timing.

Analyze the provided image VERY CAREFULLY. It contains manuscript text, possibly in Arabic, Turkish, transliterated English, or mixed. Extract EVERY structured rule you can find — never skip any rule, table, or structured information.

Return JSON with TWO sections:

(A) "timing_combinations": every complete timing rule you find. For each, give the COMPLETE context:
  - weekday (0=Sunday ... 6=Saturday), period ("day"|"night"), saat_number (1-24; 1-12 day, 13-24 night), kawkab (sun|moon|mars|mercury|jupiter|venus|saturn — use the ENGLISH canonical key; if the text says Shams/Qamar/Merih/Zuhra/Mushtari/Utarid/Zuhal or their Arabic, map to the English key), nakshatra (lunar mansion name or ""), ritual_suitability, knowledge_text_en, knowledge_text_ar (verbatim Arabic if visible), and the six action arrays (recommended_actions, forbidden_actions, enemy_actions, friendship_actions, warnings_list, notes_list) — each item {en, ml, ar}.

(B) "categorized_rules": EVERY other astrology rule that is NOT a full Day+Saat+Kawkab timing combo. Classify each into a category and entity. For each rule give:
  - category: one of "Planet","Planetary Hour","Weekday","Zodiac","Lunar Mansion","Moon Phase","Ritual Purpose","General Astrology Rules","Benefic Rules","Malefic Rules","Marriage Rules","Travel Rules","Trade Rules","Health Rules","Financial Rules","Agricultural Rules","Weather Rules" (or any other category you discover — the system supports unlimited categories).
  - entity: the specific subject (e.g. "Sun","Moon","Mars","Leo","Al Sarfa","Tuesday","Waxing Crescent","Hour 3"). Use the name as written.
  - entity_raw: the original-language wording verbatim (Arabic/Turkish/transliteration) if different from entity.
  - rule_text_en, rule_text_ar (verbatim if visible).
  - recommended_actions / forbidden_actions arrays ({en,ml,ar}) if the rule lists actions.
  - attributes: an object of any structured key-value facts (e.g. {"nature":"hot/dry","benefic":true,"element":"fire","direction":"east","color":"red","metal":"gold","day_ruler":"Sunday","exaltation":"Aries","detriment":"Aquarius"}). Only include keys actually present.
  - page_number: if visible.

Also return top-level: ocr_success (boolean), ocr_confidence (0-100), detected_language ("ar"|"tr"|"en"|"ml"|mixed code), page_number.

CRITICAL RULES:
- Extract ALL rules — never summarize away a rule. If a page has 20 rules, return 20 entries.
- Preserve Arabic verbatim in *_ar fields; never modify it.
- For timing_combinations, index by the COMPLETE context (weekday+period+saat+kawkab+nakshatra), never by planet name alone.
- Do NOT invent information. If a field is not present, leave it empty. Never fabricate saat/kawkab to fit the schema.
- Map planet names in timing_combinations to English canonical keys (Shams->sun, Qamar->moon, Merih->mars, Utarid->mercury, Zuhra->venus, Mushtari->jupiter, Zuhal->saturn).
- The system supports unlimited future categories — if you find a category not listed, use a descriptive Title-Case name.`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          ocr_success: { type: "boolean" },
          ocr_confidence: { type: "number" },
          detected_language: { type: "string" },
          page_number: { type: "string" },
          timing_combinations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                weekday: { type: "number" },
                period: { type: "string" },
                saat_number: { type: "number" },
                kawkab: { type: "string" },
                nakshatra: { type: "string" },
                ritual_suitability: { type: "string" },
                knowledge_text_en: { type: "string" },
                knowledge_text_ar: { type: "string" },
                recommended_actions: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ml: { type: "string" }, ar: { type: "string" } } } },
                forbidden_actions: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ml: { type: "string" }, ar: { type: "string" } } } },
                enemy_actions: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ml: { type: "string" }, ar: { type: "string" } } } },
                friendship_actions: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ml: { type: "string" }, ar: { type: "string" } } } },
                warnings_list: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ml: { type: "string" }, ar: { type: "string" } } } },
                notes_list: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ml: { type: "string" }, ar: { type: "string" } } } }
              },
              required: ["weekday", "period", "saat_number", "kawkab", "knowledge_text_en"]
            }
          },
          categorized_rules: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                entity: { type: "string" },
                entity_raw: { type: "string" },
                rule_text_en: { type: "string" },
                rule_text_ar: { type: "string" },
                page_number: { type: "string" },
                recommended_actions: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ml: { type: "string" }, ar: { type: "string" } } } },
                forbidden_actions: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ml: { type: "string" }, ar: { type: "string" } } } },
                attributes: { type: "object", additionalProperties: true }
              },
              required: ["category", "entity", "rule_text_en"]
            }
          }
        },
        required: ["ocr_success", "ocr_confidence", "detected_language", "timing_combinations", "categorized_rules"]
      }
    });

    const result: any = (llmResponse as any).data || llmResponse;
    const timingRules: any[] = Array.isArray(result.timing_combinations) ? result.timing_combinations : [];
    const catRules: any[] = Array.isArray(result.categorized_rules) ? result.categorized_rules : [];
    const ocrSuccess = !!result.ocr_success;
    const ocrConfidence = Number(result.ocr_confidence || 0);
    const detectedLang = String(result.detected_language || '');
    const pageNum = String(result.page_number || '');

    const uploadDate = new Date().toISOString();
    const baseSource = {
      book_title: source_label || 'Screenshot Upload',
      page_number: pageNum,
      entry_id: '',
      screenshot_url: file_url,
      ocr_confidence: ocrConfidence,
      detected_language: detectedLang,
      upload_date: uploadDate,
    };

    const validationWarnings: string[] = [];
    let timingCreated = 0, timingMerged = 0, timingActionsAdded = 0, timingDups = 0;
    let catCreated = 0, catMerged = 0, catActionsAdded = 0, catDups = 0;
    const categoriesAffected = new Set<string>();
    const entitiesUpdated = new Set<string>();
    const mergeDetails: any[] = [];

    // ══ 2a. Process full_context timing records (Planetary Hour) ══
    for (const rule of timingRules) {
      if (rule.weekday === undefined || rule.weekday === null) continue;
      if (!rule.period) continue;
      if (!rule.saat_number && rule.saat_number !== 0) continue;
      const kawkabRaw = String(rule.kawkab || '');
      const kawkab = matchAlias(kawkabRaw, PLANET_MAP) || (PLANET_KEYS.includes(kawkabRaw.toLowerCase()) ? kawkabRaw.toLowerCase() : '');
      if (!kawkab) { validationWarnings.push(`Timing rule skipped: unmappable kawkab "${kawkabRaw}"`); continue; }

      const weekday = Number(rule.weekday);
      const period = String(rule.period);
      const saatNumber = Number(rule.saat_number);
      const nakshatra = String(rule.nakshatra || '');
      const fullContextKey = `${weekday}|${period}|${saatNumber}|${kawkab}|${nakshatra}`;

      const existing = await base44.asServiceRole.entities.AstroClockKnowledge.filter({ full_context_key: fullContextKey, is_marker: false }, undefined, 1);
      const textEn = String(rule.knowledge_text_en || '').trim();
      const textAr = String(rule.knowledge_text_ar || '').trim();

      categoriesAffected.add('planetary hour');
      entitiesUpdated.add(`hour-${saatNumber}-${kawkab}`);

      if (existing && existing.length > 0) {
        const ex = existing[0];
        const rec = mergeActionArray(ex.recommended_actions, rule.recommended_actions || [], baseSource);
        const forb = mergeActionArray(ex.forbidden_actions, rule.forbidden_actions || [], baseSource);
        const ene = mergeActionArray(ex.enemy_actions, rule.enemy_actions || [], baseSource);
        const fri = mergeActionArray(ex.friendship_actions, rule.friendship_actions || [], baseSource);
        const war = mergeActionArray(ex.warnings_list, rule.warnings_list || [], baseSource);
        const not = mergeActionArray(ex.notes_list, rule.notes_list || [], baseSource);
        let rs = ex.ritual_suitability || '';
        if (rule.ritual_suitability) { const r = normalizeText(rule.ritual_suitability); if (rs && !normalizeText(rs).includes(r)) rs = rs + '\n---\n' + rule.ritual_suitability; else if (!rs) rs = rule.ritual_suitability; }
        const tm = mergeTextField(ex.knowledge_text_en, textEn);
        const am = mergeTextField(ex.knowledge_text_ar, textAr);
        const ss = pushSource(ex.supporting_sources, baseSource);
        const added = rec.added + forb.added + ene.added + fri.added + war.added + not.added;
        const dups = rec.duplicates + forb.duplicates + ene.duplicates + fri.duplicates + war.duplicates + not.duplicates;

        await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
          recommended_actions: rec.array, forbidden_actions: forb.array, enemy_actions: ene.array,
          friendship_actions: fri.array, warnings_list: war.array, notes_list: not.array,
          ritual_suitability: rs, knowledge_text_en: tm.text, knowledge_text_ar: am.text,
          supporting_sources: ss, source_count: (ex.source_count || 1) + 1,
          ocr_confidence: ocrConfidence, detected_language: detectedLang, upload_date: uploadDate,
        });
        timingMerged++; timingActionsAdded += added; timingDups += dups;
        mergeDetails.push({ type: 'timing', action: 'merged', key: fullContextKey, actions_added: added, duplicates_skipped: dups });
      } else {
        const kid = `ACK-SCR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const hash = await computeHash(`scr-${fullContextKey}-${normalizeText(textEn)}`);
        const init = (items: any[]) => (items || []).filter((i: any) => i.en && String(i.en).trim()).map((i: any) => ({ en: String(i.en).trim(), ml: String(i.ml || '').trim(), ar: String(i.ar || '').trim(), sources: [baseSource] }));
        await base44.asServiceRole.entities.AstroClockKnowledge.create({
          knowledge_id: kid, source_type: 'full_context', rule_category: 'planetary hour', rule_entity: `hour-${saatNumber}-${kawkab}`, entity_raw: kawkabRaw,
          weekday, period, saat_number: saatNumber, sahath_number: period === 'night' ? saatNumber - 12 : saatNumber, planet: kawkab, nakshatra,
          full_context_key: fullContextKey, knowledge_category: 'full_context_rule',
          recommended_actions: init(rule.recommended_actions), forbidden_actions: init(rule.forbidden_actions), enemy_actions: init(rule.enemy_actions),
          friendship_actions: init(rule.friendship_actions), warnings_list: init(rule.warnings_list), notes_list: init(rule.notes_list),
          ritual_suitability: String(rule.ritual_suitability || ''), knowledge_text_en: textEn, knowledge_text_ml: '', knowledge_text_ar: textAr,
          content_hash: hash, canonical_key: `full_context|${fullContextKey}`, is_marker: false,
          source_book_title: source_label || 'Screenshot Upload', source_page_number: pageNum, source_screenshot_url: file_url,
          ocr_confidence: ocrConfidence, detected_language: detectedLang, upload_date: uploadDate,
          is_verified: false, supporting_sources: [], source_count: 1,
        });
        timingCreated++; timingActionsAdded += init(rule.recommended_actions).length + init(rule.forbidden_actions).length + init(rule.enemy_actions).length + init(rule.friendship_actions).length + init(rule.warnings_list).length + init(rule.notes_list).length;
        mergeDetails.push({ type: 'timing', action: 'created', key: fullContextKey });
      }
    }

    // ══ 2b. Process categorized entity records ══
    for (const rule of catRules) {
      const categoryRaw = String(rule.category || '').trim();
      if (!categoryRaw) { validationWarnings.push('Categorized rule skipped: missing category'); continue; }
      const category = normalizeCategory(categoryRaw);
      const entityRaw = String(rule.entity_raw || rule.entity || '').trim();
      const entity = normalizeEntity(category, String(rule.entity || ''));
      if (!entity) { validationWarnings.push(`Categorized rule skipped: unmappable entity in "${category}"`); continue; }
      const recordKey = `${category}|${entity}`;
      const textEn = String(rule.rule_text_en || '').trim();
      const textAr = String(rule.rule_text_ar || '').trim();
      if (!textEn && !(rule.recommended_actions?.length) && !(rule.forbidden_actions?.length) && !(rule.attributes && Object.keys(rule.attributes).length)) {
        validationWarnings.push(`Categorized rule skipped: no content for ${recordKey}`); continue;
      }

      categoriesAffected.add(category);
      entitiesUpdated.add(entity);

      const existing = await base44.asServiceRole.entities.AstroClockKnowledge.filter({ rule_record_key: recordKey, is_marker: false }, undefined, 1);

      if (existing && existing.length > 0) {
        const ex = existing[0];
        const rec = mergeActionArray(ex.recommended_actions, rule.recommended_actions || [], baseSource);
        const forb = mergeActionArray(ex.forbidden_actions, rule.forbidden_actions || [], baseSource);
        const tm = mergeTextField(ex.knowledge_text_en, textEn);
        const am = mergeTextField(ex.knowledge_text_ar, textAr);
        const att = mergeAttributes(ex.attributes, rule.attributes || {});
        const ss = pushSource(ex.supporting_sources, baseSource);
        const added = rec.added + forb.added + att.added;
        const dups = rec.duplicates + forb.duplicates;
        await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
          recommended_actions: rec.array, forbidden_actions: forb.array,
          knowledge_text_en: tm.text, knowledge_text_ar: am.text, attributes: att.attributes,
          supporting_sources: ss, source_count: (ex.source_count || 1) + 1,
          ocr_confidence: ocrConfidence, detected_language: detectedLang, upload_date: uploadDate,
        });
        catMerged++; catActionsAdded += added; catDups += dups;
        mergeDetails.push({ type: 'categorized', action: 'merged', key: recordKey, actions_added: added, duplicates_skipped: dups });
      } else {
        const kid = `ACK-CAT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const hash = await computeHash(`cat-${recordKey}-${normalizeText(textEn)}`);
        const init = (items: any[]) => (items || []).filter((i: any) => i.en && String(i.en).trim()).map((i: any) => ({ en: String(i.en).trim(), ml: String(i.ml || '').trim(), ar: String(i.ar || '').trim(), sources: [baseSource] }));
        const planetKey = category === 'planet' ? entity : '';
        await base44.asServiceRole.entities.AstroClockKnowledge.create({
          knowledge_id: kid, source_type: 'categorized', rule_category: category, rule_entity: entity, entity_raw: entityRaw,
          rule_record_key: recordKey, planet: planetKey, knowledge_category: 'categorized_rule',
          recommended_actions: init(rule.recommended_actions), forbidden_actions: init(rule.forbidden_actions),
          attributes: rule.attributes || {}, knowledge_text_en: textEn, knowledge_text_ml: '', knowledge_text_ar: textAr,
          content_hash: hash, canonical_key: `categorized|${recordKey}`, is_marker: false,
          source_book_title: source_label || 'Screenshot Upload', source_page_number: String(rule.page_number || pageNum), source_screenshot_url: file_url,
          ocr_confidence: ocrConfidence, detected_language: detectedLang, upload_date: uploadDate,
          is_verified: false, supporting_sources: [], source_count: 1,
        });
        catCreated++; catActionsAdded += init(rule.recommended_actions).length + init(rule.forbidden_actions).length + (Object.keys(rule.attributes || {}).length);
        mergeDetails.push({ type: 'categorized', action: 'created', key: recordKey });
      }
    }

    const rulesExtracted = timingRules.length + catRules.length;
    const recordsInserted = timingCreated + catCreated;
    const recordsMerged = timingMerged + catMerged;
    const duplicatesSkipped = timingDups + catDups;

    const report = {
      status: 'merge_complete',
      screenshot_url: file_url,
      ocr_success: ocrSuccess,
      ocr_confidence: ocrConfidence,
      detected_language: detectedLang,
      page_number: pageNum,
      pages_processed: 1,
      rules_extracted: rulesExtracted,
      rules_inserted: recordsInserted,
      rules_merged: recordsMerged,
      duplicate_rules_skipped: duplicatesSkipped,
      categories_affected: Array.from(categoriesAffected),
      entities_updated: Array.from(entitiesUpdated),
      source_references_attached: recordsMerged, // each merged record gained a source ref
      validation_warnings: validationWarnings,
      processing_time_ms: Date.now() - t0,
      timing_records_created: timingCreated,
      timing_records_merged: timingMerged,
      categorized_records_created: catCreated,
      categorized_records_merged: catMerged,
      total_actions_added: timingActionsAdded + catActionsAdded,
      total_duplicates_skipped: duplicatesSkipped,
      combinations_found: timingRules.length, // backward-compat with uploader
      records_created: recordsInserted,       // backward-compat
      records_merged: recordsMerged,           // backward-compat
      merge_details: mergeDetails,             // backward-compat
      engine_indexing: 'AstroClockKnowledge — new timing records available to Ritual Timing Engine on next session load; categorized records available to category queries immediately.',
      message: `Imported 1 page: ${rulesExtracted} rules extracted (${timingRules.length} timing, ${catRules.length} categorized). ${recordsInserted} inserted, ${recordsMerged} merged, ${duplicatesSkipped} duplicates skipped. Categories: ${Array.from(categoriesAffected).join(', ') || 'none'}.`,
    };
    return Response.json(report);
  } catch (error) {
    return Response.json({ error: error.message, status: 'analysis_failed' }, { status: 500 });
  }
});