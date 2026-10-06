import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// UNIFIED KNOWLEDGE INGESTION PIPELINE
//
// ONE entry point for ALL knowledge ingestion: screenshots, PDF
// documents, page images, OCR pages, and future manuscript images.
// QUALITY CONTROL: rejects garbled OCR, broken Arabic, low confidence,
// and hallucinated entries before they reach entity pages.
//
// PIPELINE:
//   1. Vision LLM classifies content into entity_type + entity_key
//   2. Vision LLM extracts structured knowledge
//   3. Routes to correct knowledge store:
//      - planet/zodiac/mansion/house/element/weekday/general_astro → AstroClockKnowledge (categorized)
//      - planetary_hour (timing rules) → AstroClockKnowledge (full_context)
//      - ritual → EntityKnowledge (non-astrology, unchanged)
//   4. Merges with dedup (content_hash) + rule_record_key merge
//   5. Never overwrites, never deletes, preserves every source
//
// FUTURE-PROOF: No code changes needed for new uploads.
// The LLM automatically detects the entity and routes correctly.
// ═══════════════════════════════════════════════════════════════

function normalizeText(text: string): string {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim();
}

async function computeHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ══ QUALITY CONTROL — reject garbled OCR, broken Arabic, low confidence, hallucinations ══
const VALID_ENTITY_KEYS: Record<string, string[]> = {
  planet: ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'],
  zodiac: ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'],
  element: ['fire', 'earth', 'air', 'water'],
  weekday: ['0', '1', '2', '3', '4', '5', '6'],
  house: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
};

function validateArabicText(text: string): boolean {
  if (!text || text.trim().length === 0) return true;
  const arabicChars = (text.match(/[\u0600-\u06FF\u0750-\u077F]/g) || []).length;
  const nonSpaceTotal = text.replace(/\s/g, '').length;
  if (nonSpaceTotal === 0) return true;
  if (arabicChars < 3) return false;
  if (arabicChars / nonSpaceTotal < 0.3) return false;
  if (/(.)\1{4,}/.test(text)) return false;
  return true;
}

function validateEnglishText(text: string): boolean {
  if (!text || text.trim().length < 15) return false;
  const alphaNums = (text.match(/[a-zA-Z0-9]/g) || []).length;
  const nonSpaceTotal = text.replace(/\s/g, '').length;
  if (nonSpaceTotal === 0) return false;
  if (alphaNums / nonSpaceTotal < 0.5) return false;
  if (/(.)\1{4,}/.test(text)) return false;
  return true;
}

function validateEntryQuality(entry: any): { valid: boolean; reason: string } {
  const confidence = Number(entry.confidence || 80);
  if (confidence < 50) return { valid: false, reason: `Low confidence (${confidence})` };
  if (!validateEnglishText(String(entry.knowledge_text_en || ''))) return { valid: false, reason: 'Garbled or too-short English text' };
  if (!validateArabicText(String(entry.knowledge_text_ar || ''))) return { valid: false, reason: 'Garbled or broken Arabic text' };
  const et = String(entry.entity_type || '').toLowerCase();
  const ek = String(entry.entity_key || '').toLowerCase();
  if (VALID_ENTITY_KEYS[et] && !VALID_ENTITY_KEYS[et].includes(ek)) return { valid: false, reason: `Invalid entity key: ${et}/${ek}` };
  return { valid: true, reason: '' };
}

const PLANET_KEYS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { file_url, source_label, source_type } = body;
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    const bookTitle = source_label || (source_type === 'pdf_page' ? 'PDF Page' : 'Screenshot Upload');

    // ══ Step 1: Vision LLM — classify + extract ══
    const prompt = `You are an expert analyst of Islamic occult manuscripts about astrology (Saat, Kawkab, Buruj, Manazil).

Analyze the provided image or PDF VERY CAREFULLY. It contains manuscript text (possibly in Arabic, Malayalam, Turkish, or transliterated English) about planets, zodiac signs, lunar mansions, planetary hours, elements, houses, or general astrological knowledge. The input may be a single screenshot image OR a multi-page PDF document — if it is a PDF, analyze ALL pages and extract knowledge from every page.

For EVERY distinct piece of knowledge found in the image, extract:

1. entity_type — ONE of:
   - "planet" — about a specific planet (its nature, properties, traits, relationships, incense, etc.)
   - "zodiac" — about a specific zodiac sign (its properties, rulership, health, colors, etc.)
   - "mansion" — about a specific lunar mansion (1-28)
   - "planetary_hour" — about specific timing rules (weekday + saat number + kawkab + actions)
   - "weekday" — about a specific day of the week (day ruler properties, auspiciousness)
   - "house" — about one of the 12 astrological houses
   - "element" — about fire, earth, air, or water
   - "ritual" — about a specific ritual or spiritual practice (not a timing rule)
   - "general_astro" — general astrological theory not specific to one entity

2. entity_key — the specific entity identifier (LOWERCASE):
   - planet: "sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"
   - zodiac: "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
   - mansion: "1" through "28" (as string)
   - planetary_hour: "" (timing data goes in weekday/period/saat_number/kawkab fields below)
   - weekday: "0" through "6" (0=Sunday, as string)
   - house: "1" through "12" (as string)
   - element: "fire", "earth", "air", "water"
   - ritual: short ritual name (lowercase, no spaces)
   - general_astro: "general"

MULTILINGUAL ENTITY RECOGNITION — The manuscript text may be in Arabic, Malayalam, English, or Turkish. ALL of these names resolve to the SAME entity_key:

PLANETS: sun(الشمس,Shams,Sun,സൂര്യൻ,Güneş) moon(القمر,Qamar,Moon,ചന്ദ്രൻ,Ay) mars(المريخ,Mirrikh,Mars,കുജൻ,Merih) mercury(عطارد,Utarid,Mercury,ബുധൻ,Utarit) jupiter(المشتري,Mushtari,Jupiter,വ്യാഴം,Müşteri) venus(الزهرة,Zuhra,Venus,ശുക്രൻ,Zühre) saturn(زحل,Zuhal,Saturn,ശനി,Zühal)

ZODIAC: aries(الحمل,Hamal,Aries,മേടം,Koç) taurus(الثور,Thawr,Taurus,ഇടം,Boğa) gemini(الجوزاء,Jawza',Gemini,മിഥുനം,İkizler) cancer(السرطان,Saratan,Cancer,കടകം,Yengeç) leo(الأسد,Asad,Leo,ചിങ്ങം,Aslan) virgo(العذراء,Adhra',Virgo,കന്നി,Başak) libra(الميزان,Mizan,Libra,തുലാം,Terazi) scorpio(العقرب,Aqrab,Scorpio,വൃശ്ചികം,Akrep) sagittarius(القوس,Qaws,Sagittarius,ധനു,Yay) capricorn(الجدي,Jady,Capricorn,മകരം,Oğlak) aquarius(الدلو,Dalw,Aquarius,കുംഭം,Kova) pisces(الحوت,Hut,Pisces,മീനം,Balık)

ELEMENTS: fire(نار,Nar,Fire,അഗ്നി,Ateş) earth(تراب,Turab,Earth,ഭൂമി,Toprak) air(هواء,Hawa',Air,വായു,Hava) water(ماء,Ma',Water,ജലം,Su)

WEEKDAYS (0=Sunday): 0(الأحد,Ahad,Sunday,ഞായർ,Pazar) 1(الاثنين,Ithnayn,Monday,തിങ്കൾ,Pazartesi) 2(الثلاثاء,Thulatha',Tuesday,ചൊവ്വ,Salı) 3(الأربعاء,Arbi'a',Wednesday,ബുധൻ,Çarşamba) 4(الخميس,Khamis,Thursday,വ്യാഴം,Perşembe) 5(الجمعة,Jumu'ah,Friday,വെള്ളി,Cuma) 6(السبت,Sabt,Saturday,ശനി,Cumartesi)

MANSIONS 1-28: 1:الشرطين 2:البطين 3:الثريا 4:الدبران 5:الهقعة 6:الهنعة 7:الذراع 8:النثرة 9:الطرفة 10:الجبهة 11:الزبرة 12:الصرفة 13:العوا 14:السماك 15:الغفر 16:الزبانا 17:الإكليل 18:القلب 19:الشولة 20:النعائم 21:البلدة 22:سعد الذابح 23:سعد بلع 24:سعد السعود 25:سعد الأخبية 26:الفرغ المقدم 27:الفرغ المؤخر 28:الرشاء

When you see ANY of these names in ANY language, resolve to the corresponding entity_key.

3. knowledge_category — ONE of: "properties", "traits", "relationships", "timing_rules", "ritual_instructions", "warnings", "incense", "health", "general"

4. knowledge_text_en — English summary of the knowledge (be detailed and specific)
5. knowledge_text_ar — Original Arabic text if visible (verbatim, never modified, never AI-generated)
6. structured_data — JSON object with any structured data (e.g., {"colors": ["red"], "metals": ["iron"], "actions": ["protection"], "traits": ["hot", "dry"]})
7. confidence — Your confidence level (0-100) that: (a) entity_type and entity_key are correctly identified, (b) knowledge_text_en accurately represents the manuscript, (c) the text is not garbled OCR. Set below 70 if the image is unclear, partially visible, or you are uncertain about the entity identification.

For planetary_hour entity_type ONLY, also extract:
- weekday: 0-6 (0=Sunday)
- period: "day" or "night"
- saat_number: 1-24 (1-12 daytime, 13-24 nighttime)
- kawkab: "sun"/"moon"/"mars"/"mercury"/"jupiter"/"venus"/"saturn"
- recommended_actions: array of {en, ar}
- forbidden_actions: array of {en, ar}
- warnings_list: array of {en, ar}

CRITICAL RULES:
- If the image shows info about Mars (e.g., "Mars rules Aries, Mars is hot and dry, Mars incense is benzoin"), extract as entity_type=planet, entity_key=mars.
- If the image shows info about Aries (e.g., "Aries is a fire sign, ruled by Mars"), extract as entity_type=zodiac, entity_key=aries.
- If the image shows timing rules (e.g., "Sunday Saat 1 Sun is good for wealth"), extract as entity_type=planetary_hour with weekday/period/saat_number/kawkab.
- If the image shows info about Mansion 1 (e.g., "Al-Sharatain is auspicious for new beginnings"), extract as entity_type=mansion, entity_key=1.
- Extract ALL distinct pieces of knowledge — one image may contain multiple entities.
- If the image does NOT contain any valid astrological knowledge, return entries_found=0.

Return JSON with this exact schema:
{
  "entries_found": <number>,
  "entries": [
    {
      "entity_type": "planet"|"zodiac"|"mansion"|"planetary_hour"|"weekday"|"house"|"element"|"ritual"|"general_astro",
      "entity_key": "...",
      "knowledge_category": "...",
      "knowledge_text_en": "...",
      "knowledge_text_ar": "...",
      "structured_data": {},
      "weekday": 0,
      "period": "",
      "saat_number": 0,
      "kawkab": "",
      "recommended_actions": [{"en":"","ar":""}],
      "forbidden_actions": [{"en":"","ar":""}],
      "warnings_list": [{"en":"","ar":""}]
    }
  ]
}`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [file_url],
      response_json_schema: {
        type: "object",
        properties: {
          entries_found: { type: "number" },
          entries: {
            type: "array",
            items: {
              type: "object",
              properties: {
                entity_type: { type: "string", enum: ["planet", "zodiac", "mansion", "planetary_hour", "weekday", "house", "element", "ritual", "general_astro"] },
                entity_key: { type: "string" },
                knowledge_category: { type: "string" },
                knowledge_text_en: { type: "string" },
                knowledge_text_ar: { type: "string" },
                structured_data: { type: "object", additionalProperties: true },
                confidence: { type: "number" },
                weekday: { type: "number" },
                period: { type: "string" },
                saat_number: { type: "number" },
                kawkab: { type: "string" },
                recommended_actions: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ar: { type: "string" } } } },
                forbidden_actions: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ar: { type: "string" } } } },
                warnings_list: { type: "array", items: { type: "object", properties: { en: { type: "string" }, ar: { type: "string" } } } }
              },
              required: ["entity_type", "entity_key", "knowledge_text_en"]
            }
          }
        },
        required: ["entries_found", "entries"]
      }
    });

    const result: any = (llmResponse as any).data || llmResponse;
    const entries: any[] = Array.isArray(result.entries) ? result.entries : [];

    if (entries.length === 0) {
      return Response.json({
        status: 'no_knowledge_found',
        message: 'The image did not contain valid astrological knowledge for any entity.',
        entries_found: 0, records_created: 0, records_merged: 0,
      });
    }

    // ══ Step 2: Process each entry — route to correct knowledge store ══
    const sourceObj = { book_title: bookTitle, page_number: '', entry_id: '', screenshot_url: file_url };
    let recordsCreated = 0;
    let recordsMerged = 0;
    let rejectedCount = 0;
    const details: any[] = [];

    for (const entry of entries) {
      const entityType = String(entry.entity_type || '').toLowerCase();
      const entityKey = String(entry.entity_key || '').toLowerCase();
      const textEn = String(entry.knowledge_text_en || '').trim();
      const textAr = String(entry.knowledge_text_ar || '').trim();
      const category = String(entry.knowledge_category || 'general').toLowerCase();

      if (!entityType || !textEn) continue;

      // ── QUALITY CONTROL — reject garbled OCR, broken Arabic, low confidence, hallucinations ──
      const qualityCheck = validateEntryQuality(entry);
      if (!qualityCheck.valid) {
        rejectedCount++;
        details.push({ entity_type: entityType, entity_key: entityKey, action: 'rejected', reason: qualityCheck.reason });
        continue;
      }

      // ── Route planetary_hour entries to AstroClockKnowledge (full_context) ──
      if (entityType === 'planetary_hour') {
        if (entry.weekday === undefined || !entry.saat_number || !entry.kawkab) continue;
        if (!PLANET_KEYS.includes(String(entry.kawkab).toLowerCase())) continue;

        const weekday = Number(entry.weekday);
        const period = String(entry.period || 'day');
        const saatNumber = Number(entry.saat_number);
        const kawkab = String(entry.kawkab).toLowerCase();
        const fullContextKey = `${weekday}|${period}|${saatNumber}|${kawkab}|`;

        const existing = await base44.asServiceRole.entities.AstroClockKnowledge.filter(
          { full_context_key: fullContextKey, is_marker: false }, undefined, 1
        );

        if (existing && existing.length > 0) {
          const ex = existing[0];
          const supportingSources = [...(ex.supporting_sources || [])];
          if (!supportingSources.some((s: any) => s.screenshot_url === file_url)) {
            supportingSources.push(sourceObj);
          }
          const normExisting = normalizeText(ex.knowledge_text_en || '');
          const normNew = normalizeText(textEn);
          let mergedText = ex.knowledge_text_en || '';
          if (!normExisting.includes(normNew)) {
            mergedText = mergedText ? mergedText + '\n---\n' + textEn : textEn;
          }
          await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
            supporting_sources: supportingSources,
            source_count: (ex.source_count || 1) + (supportingSources.some((s: any) => s.screenshot_url === file_url) ? 1 : 0),
            knowledge_text_en: mergedText,
          });
          recordsMerged++;
          details.push({ entity_type: entityType, weekday, saat: saatNumber, kawkab, action: 'merged' });
        } else {
          const knowledgeId = `ACK-SCR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const contentHash = await computeHash(`scr-${fullContextKey}-${normalizeText(textEn)}`);
          const initActions = (items: any[]) => (items || []).filter((i: any) => i.en && String(i.en).trim()).map((i: any) => ({
            en: String(i.en).trim(), ml: '', ar: String(i.ar || '').trim(), sources: [sourceObj]
          }));
          await base44.asServiceRole.entities.AstroClockKnowledge.create({
            knowledge_id: knowledgeId, source_type: 'full_context', weekday, period,
            saat_number: saatNumber, sahath_number: period === 'night' ? saatNumber - 12 : saatNumber,
            planet: kawkab, nakshatra: '', full_context_key: fullContextKey,
            knowledge_category: 'full_context_rule',
            recommended_actions: initActions(entry.recommended_actions),
            forbidden_actions: initActions(entry.forbidden_actions),
            enemy_actions: [], friendship_actions: [],
            warnings_list: initActions(entry.warnings_list),
            notes_list: [], ritual_suitability: '',
            knowledge_text_en: textEn, knowledge_text_ml: '', knowledge_text_ar: textAr,
            content_hash: contentHash, canonical_key: `full_context|${fullContextKey}`,
            is_marker: false, source_book_title: bookTitle,
            source_screenshot_url: file_url, is_verified: false,
            supporting_sources: [], source_count: 1
          });
          recordsCreated++;
          details.push({ entity_type: entityType, weekday, saat: saatNumber, kawkab, action: 'created' });
        }
        continue;
      }

      // ── Route astrology entity entries to AstroClockKnowledge (single store) ──
      // Ritual entity stays in EntityKnowledge (non-astrology module — untouched).
      const ASTRO_RULE_CATEGORY: Record<string, string> = {
        planet: 'planet', zodiac: 'zodiac', mansion: 'lunar mansion',
        weekday: 'weekday', house: 'house', element: 'element', general_astro: 'general astrology',
      };
      const isAstroEntity = !!ASTRO_RULE_CATEGORY[entityType];

      if (isAstroEntity) {
        const ruleCategory = ASTRO_RULE_CATEGORY[entityType];
        const ruleEntity = entityKey;
        const ruleRecordKey = `${ruleCategory}|${ruleEntity}`;
        const textHash = await computeHash(`${entityType}|${entityKey}|${normalizeText(textEn).substring(0, 200)}`);
        const contentHash = `cat-${ruleRecordKey}-${textHash.substring(0, 16)}`;

        // Dedup by content_hash (exact duplicate)
        const existingByHash = await base44.asServiceRole.entities.AstroClockKnowledge.filter(
          { content_hash: contentHash, is_marker: false }, undefined, 1
        );
        if (existingByHash && existingByHash.length > 0) {
          const ex = existingByHash[0];
          const sources = [...(ex.supporting_sources || [])];
          if (!sources.some((s: any) => s.screenshot_url === file_url)) {
            sources.push(sourceObj);
            await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
              supporting_sources: sources, source_count: (ex.source_count || 1) + 1
            });
          }
          recordsMerged++;
          details.push({ entity_type: entityType, entity_key: entityKey, action: 'merged_exact', store: 'AstroClockKnowledge' });
          continue;
        }

        // Complementary merge by rule_record_key
        const existingByKey = await base44.asServiceRole.entities.AstroClockKnowledge.filter(
          { rule_record_key: ruleRecordKey, is_marker: false, source_type: 'categorized' }, undefined, 1
        );
        if (existingByKey && existingByKey.length > 0) {
          const ex = existingByKey[0];
          const normExisting = normalizeText(ex.knowledge_text_en || '');
          const normNew = normalizeText(textEn);
          let mergedText = ex.knowledge_text_en || '';
          if (!normExisting.includes(normNew)) {
            mergedText = mergedText ? mergedText + '\n---\n' + textEn : textEn;
          }
          let mergedAr = ex.knowledge_text_ar || '';
          if (textAr && !normalizeText(mergedAr).includes(normalizeText(textAr))) {
            mergedAr = mergedAr ? mergedAr + '\n---\n' + textAr : textAr;
          }
          const sources = [...(ex.supporting_sources || [])];
          const hasNewSource = !sources.some((s: any) => s.screenshot_url === file_url);
          if (hasNewSource) sources.push(sourceObj);
          const mergedAttributes: any = { ...(ex.attributes || {}), ...(entry.structured_data || {}) };
          mergedAttributes.knowledge_category = mergedAttributes.knowledge_category || category || 'general';
          mergedAttributes.verification_status = (Number(entry.confidence || 80) >= 70) ? 'verified' : 'pending_review';
          mergedAttributes.migrated_from = 'screenshot';
          await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
            knowledge_text_en: mergedText, knowledge_text_ar: mergedAr,
            attributes: mergedAttributes, supporting_sources: sources,
            source_count: (ex.source_count || 1) + (hasNewSource ? 1 : 0)
          });
          recordsMerged++;
          details.push({ entity_type: entityType, entity_key: entityKey, action: 'merged_complementary', store: 'AstroClockKnowledge' });
        } else {
          const knowledgeId = `ACK-CAT-SCR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const confidence = Number(entry.confidence || 80);
          const attributes: any = {
            ...(entry.structured_data || {}),
            knowledge_category: category || 'general',
            verification_status: confidence >= 70 ? 'verified' : 'pending_review',
            migrated_from: 'screenshot',
          };
          await base44.asServiceRole.entities.AstroClockKnowledge.create({
            knowledge_id: knowledgeId, source_type: 'categorized',
            rule_category: ruleCategory, rule_entity: ruleEntity, entity_raw: entityKey,
            rule_record_key: ruleRecordKey, knowledge_category: 'categorized_rule',
            knowledge_text_en: textEn, knowledge_text_ml: '', knowledge_text_ar: textAr,
            attributes, content_hash: contentHash,
            canonical_key: `categorized|${ruleRecordKey}`,
            is_marker: false, source_book_title: bookTitle,
            source_screenshot_url: file_url, ocr_confidence: confidence,
            upload_date: new Date().toISOString(), is_verified: false,
            supporting_sources: [], source_count: 1
          });
          recordsCreated++;
          details.push({ entity_type: entityType, entity_key: entityKey, action: 'created', store: 'AstroClockKnowledge' });
        }
        continue;
      }

      // ── Non-astrology entity (ritual) → EntityKnowledge (unchanged) ──
      const canonicalKey = `${entityType}|${entityKey}|${category}`;
      const contentHash = await computeHash(`${entityType}|${entityKey}|${normalizeText(textEn).substring(0, 200)}`);

      const existingByHash = await base44.asServiceRole.entities.EntityKnowledge.filter(
        { content_hash: contentHash, is_marker: false }, undefined, 1
      );
      if (existingByHash && existingByHash.length > 0) {
        const ex = existingByHash[0];
        const sources = [...(ex.supporting_sources || [])];
        if (!sources.some((s: any) => s.screenshot_url === file_url)) {
          sources.push(sourceObj);
          await base44.asServiceRole.entities.EntityKnowledge.update(ex.id, {
            supporting_sources: sources, source_count: (ex.source_count || 1) + 1
          });
        }
        recordsMerged++;
        details.push({ entity_type: entityType, entity_key: entityKey, action: 'merged_exact', store: 'EntityKnowledge' });
        continue;
      }
      const existingByCanonical = await base44.asServiceRole.entities.EntityKnowledge.filter(
        { canonical_key: canonicalKey, is_marker: false }, undefined, 1
      );
      if (existingByCanonical && existingByCanonical.length > 0) {
        const ex = existingByCanonical[0];
        const normExisting = normalizeText(ex.knowledge_text_en || '');
        const normNew = normalizeText(textEn);
        let mergedText = ex.knowledge_text_en || '';
        if (!normExisting.includes(normNew)) {
          mergedText = mergedText ? mergedText + '\n---\n' + textEn : textEn;
        }
        const sources = [...(ex.supporting_sources || [])];
        const hasNewSource = !sources.some((s: any) => s.screenshot_url === file_url);
        if (hasNewSource) sources.push(sourceObj);
        const mergedData = { ...(ex.structured_data || {}), ...(entry.structured_data || {}) };
        let mergedAr = ex.knowledge_text_ar || '';
        if (textAr && !normalizeText(mergedAr).includes(normalizeText(textAr))) {
          mergedAr = mergedAr ? mergedAr + '\n---\n' + textAr : textAr;
        }
        await base44.asServiceRole.entities.EntityKnowledge.update(ex.id, {
          knowledge_text_en: mergedText, knowledge_text_ar: mergedAr,
          structured_data: mergedData, supporting_sources: sources,
          source_count: (ex.source_count || 1) + (hasNewSource ? 1 : 0)
        });
        recordsMerged++;
        details.push({ entity_type: entityType, entity_key: entityKey, action: 'merged_complementary', store: 'EntityKnowledge' });
      } else {
        const knowledgeId = `EK-SCR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const confidence = Number(entry.confidence || 80);
        await base44.asServiceRole.entities.EntityKnowledge.create({
          knowledge_id: knowledgeId, entity_type: entityType, entity_key: entityKey,
          knowledge_category: category, knowledge_text_en: textEn,
          knowledge_text_ml: '', knowledge_text_ar: textAr,
          structured_data: entry.structured_data || {},
          content_hash: contentHash, canonical_key: canonicalKey,
          is_marker: false, source_book_title: bookTitle,
          source_screenshot_url: file_url, is_verified: false,
          extraction_confidence: confidence,
          verification_status: confidence >= 70 ? 'verified' : 'pending_review',
          supporting_sources: [], source_count: 1
        });
        recordsCreated++;
        details.push({ entity_type: entityType, entity_key: entityKey, action: 'created', store: 'EntityKnowledge' });
      }
    }

    return Response.json({
      status: 'ingestion_complete', screenshot_url: file_url,
      entries_found: entries.length, records_created: recordsCreated,
      records_merged: recordsMerged, rejected: rejectedCount, details,
      message: `Analyzed: ${entries.length} knowledge entries found. ${recordsCreated} new records created, ${recordsMerged} existing records merged, ${rejectedCount} rejected by quality control. All sources preserved.`
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'ingestion_failed' }, { status: 500 });
  }
});