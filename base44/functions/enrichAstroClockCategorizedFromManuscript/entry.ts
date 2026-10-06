import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK CATEGORIZED ENRICHMENT — FROM MANUSCRIPT ENTRIES
//
// Called by routeManuscriptKnowledge for entries classified as
// planet_info, zodiac_info, mansion_info, element_info, house_info,
// weekday_info, or general_astro.
//
// Writes CATEGORIZED records directly into AstroClockKnowledge
// (source_type='categorized') — the single permanent store for all
// astrology knowledge. EntityKnowledge is NOT touched.
//
// Uses a multilingual LLM classification prompt (recognition of
// Arabic/Turkish/English/Malayalam entities → canonical keys).
//
// MERGE RULES (identical to AstroClockKnowledge global rule):
// - never overwrite, never delete.
// - dedup by content_hash (true duplicate → add source only).
// - complementary merge by rule_record_key (append text + attributes,
//   add source, increment source_count).
// - marker records (entity_type='none') prevent reprocessing.
// - every source preserved permanently.
// ═══════════════════════════════════════════════════════════════

function normalizeText(text: string): string {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '').trim();
}

async function computeHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const ENTITY_TYPE_TO_RULE_CATEGORY: Record<string, string> = {
  planet: 'planet',
  zodiac: 'zodiac',
  mansion: 'lunar mansion',
  weekday: 'weekday',
  house: 'house',
  element: 'element',
  general_astro: 'general astrology',
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { book_id, batch_size, entry_ids } = body;

    // Get entries — either by entry_ids or by book_id
    let entries: any[] = [];
    if (entry_ids && Array.isArray(entry_ids) && entry_ids.length > 0) {
      for (const eid of entry_ids.slice(0, 8)) {
        const recs = await base44.asServiceRole.entities.ManuscriptEntry.filter({ entry_id: eid }, undefined, 1);
        if (recs?.length) entries.push(recs[0]);
      }
    } else if (book_id) {
      entries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id }, '-created_date', Math.min(batch_size || 5, 8));
    }

    if (!entries?.length) {
      return Response.json({ status: 'no_entries', message: 'No entries to process', records_created: 0, records_merged: 0, markers_created: 0 });
    }

    let bookTitle = '';
    if (book_id) {
      const books = await base44.asServiceRole.entities.ManuscriptBook.filter({ book_id }, undefined, 1);
      if (books?.length) bookTitle = books[0].book_title || '';
    }
    if (!bookTitle && entries[0]?.book_title) bookTitle = entries[0].book_title;

    // ══ Step 1: LLM — classify each entry into entity_type + entity_key ══
    const classifyPrompt = `You are classifying Islamic occult manuscript entries for entity-aware routing.

ENTRIES:
${entries.map((e: any, i: number) => `Entry ${i + 1} (ID: ${e.entry_id}):
- Purpose: ${(e.purpose || 'N/A').substring(0, 200)}
- Topic: ${(e.topic || 'N/A').substring(0, 150)}
- Arabic: ${(e.arabic_text || '').substring(0, 300)}
- English: ${(e.english_meaning || '').substring(0, 300)}
- Procedure: ${(e.procedure || '').substring(0, 200)}
- Materials: ${(e.materials || '').substring(0, 150)}
- Timing: ${(e.timing || 'N/A').substring(0, 150)}
- Planet: ${(e.planet || 'N/A').substring(0, 80)}
- Day: ${(e.day || 'N/A').substring(0, 80)}
- Incense: ${(e.incense || 'N/A').substring(0, 80)}
- Notes: ${(e.notes || '').substring(0, 200)}`).join('\n\n')}

TASK: For each entry, classify it into entity_type + entity_key + extract knowledge.

entity_type options:
- "planet" — PRIMARILY about a specific planet's properties/traits/nature/relationships
- "zodiac" — PRIMARILY about a specific zodiac sign's properties/rulership/health
- "mansion" — PRIMARILY about a specific lunar mansion (1-28)
- "weekday" — PRIMARILY about a specific day of the week
- "house" — PRIMARILY about one of the 12 astrological houses
- "element" — PRIMARILY about fire/earth/air/water
- "general_astro" — general astrological theory not tied to one entity
- "none" — no astrological entity info

entity_key (lowercase):
- planet: sun/moon/mars/mercury/jupiter/venus/saturn
- zodiac: aries/taurus/gemini/cancer/leo/virgo/libra/scorpio/sagittarius/capricorn/aquarius/pisces
- mansion: 1-28 (string)
- weekday: 0-6 (string, 0=Sunday)
- house: 1-12 (string)
- element: fire/earth/air/water
- general_astro: "general"

MULTILINGUAL ENTITY RECOGNITION — Text may be in Arabic, Malayalam, English, or Turkish. ALL variants resolve to the SAME entity_key:

PLANETS: sun(الشمس,Shams,Sun,സൂര്യൻ,Güneş) moon(القمر,Qamar,Moon,ചന്ദ്രൻ,Ay) mars(المريخ,Mirrikh,Mars,കുജൻ,Merih) mercury(عطارد,Utarid,Mercury,ബുധൻ,Utarit) jupiter(المشتري,Mushtari,Jupiter,വ്യാഴം,Müşteri) venus(الزهرة,Zuhra,Venus,ശുക്രൻ,Zühre) saturn(زحل,Zuhal,Saturn,ശനി,Zühal)

ZODIAC: aries(الحمل,Hamal,Aries,മേടം,Koç) taurus(الثور,Thawr,Taurus,ഇടം,Boğa) gemini(الجوزاء,Jawza',Gemini,മിഥുനം,İkizler) cancer(السرطان,Saratan,Cancer,കടകം,Yengeç) leo(الأسد,Asad,Leo,ചിങ്ങം,Aslan) virgo(العذراء,Adhra',Virgo,കന്നി,Başak) libra(الميزان,Mizan,Libra,തുലാം,Terazi) scorpio(العقرب,Aqrab,Scorpio,വൃശ്ചികം,Akrep) sagittarius(القوس,Qaws,Sagittarius,ധനു,Yay) capricorn(الجدي,Jady,Capricorn,മകരം,Oğlak) aquarius(الدلو,Dalw,Aquarius,കുംഭം,Kova) pisces(الحوت,Hut,Pisces,മീനം,Balık)

ELEMENTS: fire(نار,Nar,Fire,അഗ്നി,Ateş) earth(تراب,Turab,Earth,ഭൂമി,Toprak) air(هواء,Hawa',Air,വായു,Hava) water(ماء,Ma',Water,ജലം,Su)

WEEKDAYS: 0(الأحد,Ahad,Sunday,ഞായർ,Pazar) 1(الاثنين,Ithnayn,Monday,തിങ്കൾ,Pazartesi) 2(الثلاثاء,Thulatha',Tuesday,ചൊവ്വ,Salı) 3(الأربعاء,Arbi'a',Wednesday,ബുധൻ,Çarşamba) 4(الخميس,Khamis,Thursday,വ്യാഴം,Perşembe) 5(الجمعة,Jumu'ah,Friday,വെള്ളി,Cuma) 6(السبت,Sabt,Saturday,ശനി,Cumartesi)

MANSIONS 1-28: 1:الشرطين 2:البطين 3:الثريا 4:الدبران 5:الهقعة 6:الهنعة 7:الذراع 8:النثرة 9:الطرفة 10:الجبهة 11:الزبرة 12:الصرفة 13:العوا 14:السماك 15:الغفر 16:الزبانا 17:الإكليل 18:القلب 19:الشولة 20:النعائم 21:البلدة 22:سعد الذابح 23:سعد بلع 24:سعد السعود 25:سعد الأخبية 26:الفرغ المقدم 27:الفرغ المؤخر 28:الرشاء

When you see ANY name in ANY language, resolve to the corresponding entity_key.

Also extract:
- knowledge_category: properties/traits/relationships/timing_rules/ritual_instructions/warnings/incense/health/general
- knowledge_text_en: concise English summary of the knowledge
- knowledge_text_ar: original Arabic text if available (verbatim)
- confidence: 0-100

RULES:
- If an entry has NO astrological entity info, return entity_type="none".

Return JSON:
{
  "classifications": [
    {
      "entry_id": "...",
      "entity_type": "planet"|"zodiac"|"mansion"|"weekday"|"house"|"element"|"general_astro"|"none",
      "entity_key": "...",
      "knowledge_category": "...",
      "knowledge_text_en": "...",
      "knowledge_text_ar": "..."
    }
  ]
}`;

    const classifyRes = await base44.integrations.Core.InvokeLLM({
      prompt: classifyPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          classifications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                entry_id: { type: "string" },
                entity_type: { type: "string", enum: ["planet", "zodiac", "mansion", "weekday", "house", "element", "general_astro", "none"] },
                entity_key: { type: "string" },
                knowledge_category: { type: "string" },
                knowledge_text_en: { type: "string" },
                knowledge_text_ar: { type: "string" },
                confidence: { type: "number" }
              },
              required: ["entry_id", "entity_type"]
            }
          }
        },
        required: ["classifications"]
      }
    });

    const classifyData: any = (classifyRes as any).data || classifyRes;
    const classifications: any[] = Array.isArray(classifyData.classifications) ? classifyData.classifications : [];

    let recordsCreated = 0;
    let recordsMerged = 0;
    let markersCreated = 0;
    const details: any[] = [];

    // ══ Step 2: Merge each classified entry into AstroClockKnowledge (categorized) ══
    for (const cls of classifications) {
      const entry = entries.find((e: any) => e.entry_id === cls.entry_id);
      if (!entry) continue;

      const entityType = String(cls.entity_type || '').toLowerCase();
      const entityKey = String(cls.entity_key || '').toLowerCase();
      const textEn = String(cls.knowledge_text_en || '').trim();
      const textAr = String(cls.knowledge_text_ar || entry.arabic_text || '').trim();
      const category = String(cls.knowledge_category || 'general').toLowerCase();

      // If no entity detected, create a marker to prevent reprocessing
      if (entityType === 'none' || !entityType || !textEn) {
        const markerId = `ACK-MARKER-${entry.entry_id}`;
        const markerHash = await computeHash(`no-astro-entity-${entry.entry_id}`);
        await base44.asServiceRole.entities.AstroClockKnowledge.create({
          knowledge_id: markerId,
          source_type: 'categorized',
          rule_category: 'general astrology',
          rule_entity: 'general',
          entity_raw: '',
          rule_record_key: 'general astrology|general',
          knowledge_category: 'categorized_rule',
          knowledge_text_en: '',
          knowledge_text_ml: '',
          knowledge_text_ar: '',
          content_hash: markerHash,
          canonical_key: `categorized|marker-${entry.entry_id}`,
          is_marker: true,
          source_book_id: entry.book_id || book_id || '',
          source_book_title: bookTitle,
          source_page_number: entry.page_number || '',
          source_entry_id: entry.entry_id,
          is_verified: entry.verification_status === 'verified',
          supporting_sources: [],
          source_count: 0,
        });
        markersCreated++;
        details.push({ entry_id: entry.entry_id, action: 'marker' });
        continue;
      }

      const ruleCategory = ENTITY_TYPE_TO_RULE_CATEGORY[entityType] || entityType;
      const ruleEntity = entityKey;
      const ruleRecordKey = `${ruleCategory}|${ruleEntity}`;
      const textHash = await computeHash(`${entityType}|${entityKey}|${normalizeText(textEn).substring(0, 200)}`);
      const contentHash = `cat-${ruleRecordKey}-${textHash.substring(0, 16)}`;

      const sourceObj = {
        book_title: bookTitle,
        page_number: entry.page_number || '',
        entry_id: entry.entry_id,
        screenshot_url: '',
      };

      // Dedup by content_hash (exact duplicate)
      const existingByHash = await base44.asServiceRole.entities.AstroClockKnowledge.filter(
        { content_hash: contentHash, is_marker: false }, undefined, 1
      );

      if (existingByHash && existingByHash.length > 0) {
        const ex = existingByHash[0];
        const sources = [...(ex.supporting_sources || [])];
        if (!sources.some((s: any) => s.entry_id === entry.entry_id)) {
          sources.push(sourceObj);
          await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
            supporting_sources: sources,
            source_count: (ex.source_count || 1) + 1,
          });
        }
        recordsMerged++;
        details.push({ entry_id: entry.entry_id, rule_category: ruleCategory, rule_entity: ruleEntity, action: 'merged_exact' });
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
        let mergedTextEn = ex.knowledge_text_en || '';
        if (!normExisting.includes(normNew)) {
          mergedTextEn = mergedTextEn ? mergedTextEn + '\n---\n' + textEn : textEn;
        }
        let mergedTextAr = ex.knowledge_text_ar || '';
        if (textAr && !normalizeText(mergedTextAr).includes(normalizeText(textAr))) {
          mergedTextAr = mergedTextAr ? mergedTextAr + '\n---\n' + textAr : textAr;
        }
        const sources = [...(ex.supporting_sources || [])];
        const hasNewSource = !sources.some((s: any) => s.entry_id === entry.entry_id);
        if (hasNewSource) sources.push(sourceObj);
        // Merge attributes additively — never overwrite existing keys
        const mergedAttributes: any = { ...(ex.attributes || {}) };
        mergedAttributes.knowledge_category = mergedAttributes.knowledge_category || category || 'general';
        mergedAttributes.verification_status = entry.verification_status || 'verified';
        mergedAttributes.migrated_from = 'manuscript';
        await base44.asServiceRole.entities.AstroClockKnowledge.update(ex.id, {
          knowledge_text_en: mergedTextEn,
          knowledge_text_ar: mergedTextAr,
          attributes: mergedAttributes,
          supporting_sources: sources,
          source_count: (ex.source_count || 1) + (hasNewSource ? 1 : 0),
        });
        recordsMerged++;
        details.push({ entry_id: entry.entry_id, rule_category: ruleCategory, rule_entity: ruleEntity, action: 'merged_complementary' });
      } else {
        const knowledgeId = `ACK-CAT-MAN-${entry.entry_id}-${Math.random().toString(36).substring(2, 5)}`;
        const confidence = Number(cls.confidence || 80);
        const attributes: any = {
          knowledge_category: category || 'general',
          verification_status: confidence >= 70 ? 'verified' : 'pending_review',
          migrated_from: 'manuscript',
        };
        await base44.asServiceRole.entities.AstroClockKnowledge.create({
          knowledge_id: knowledgeId,
          source_type: 'categorized',
          rule_category: ruleCategory,
          rule_entity: ruleEntity,
          entity_raw: entityKey,
          rule_record_key: ruleRecordKey,
          knowledge_category: 'categorized_rule',
          knowledge_text_en: textEn,
          knowledge_text_ml: '',
          knowledge_text_ar: textAr,
          attributes,
          content_hash: contentHash,
          canonical_key: `categorized|${ruleRecordKey}`,
          is_marker: false,
          source_book_id: entry.book_id || book_id || '',
          source_book_title: bookTitle,
          source_page_number: entry.page_number || '',
          source_entry_id: entry.entry_id,
          source_screenshot_url: '',
          ocr_confidence: confidence,
          detected_language: '',
          upload_date: new Date().toISOString(),
          is_verified: entry.verification_status === 'verified',
          supporting_sources: [],
          source_count: 1,
        });
        recordsCreated++;
        details.push({ entry_id: entry.entry_id, rule_category: ruleCategory, rule_entity: ruleEntity, action: 'created' });
      }
    }

    return Response.json({
      status: 'enrichment_complete',
      book_id: book_id || '',
      destination: 'AstroClockKnowledge',
      entries_processed: entries.length,
      records_created: recordsCreated,
      records_merged: recordsMerged,
      markers_created: markersCreated,
      details,
      message: `Enriched ${entries.length} entries into AstroClockKnowledge: ${recordsCreated} new categorized records, ${recordsMerged} merged, ${markersCreated} markers. EntityKnowledge untouched.`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'enrichment_failed' }, { status: 500 });
  }
});