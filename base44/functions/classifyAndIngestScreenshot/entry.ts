import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ── Helpers ──
function normalizeText(text: string): string {
  return (text || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function genId(prefix: string): string {
  return `${prefix}-SCR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Generic merge: check hash → merge source if exists, create if not
async function mergeEntry(base44: any, entityName: string, hash: string, createData: any, bookTitle: string, fileUrl: string): Promise<'created' | 'merged' | 'duplicate_source'> {
  const existing = await base44.asServiceRole.entities[entityName].filter({ content_hash: hash, is_marker: false }, null, 1);
  if (existing.length > 0) {
    const rec = existing[0];
    const sources = rec.supporting_sources || [];
    if (!sources.some((s: any) => s.screenshot_url === fileUrl)) {
      sources.push({ book_title: bookTitle, screenshot_url: fileUrl });
      await base44.asServiceRole.entities[entityName].update(rec.id, {
        supporting_sources: sources,
        source_count: (rec.source_count || 1) + 1
      });
      return 'merged';
    }
    return 'duplicate_source';
  }
  await base44.asServiceRole.entities[entityName].create({
    ...createData,
    content_hash: hash,
    source_book_title: bookTitle,
    source_page_number: '',
    source_screenshot_url: fileUrl,
    is_marker: false,
    supporting_sources: [],
    source_count: 1
  });
  return 'created';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { file_url, source_label } = body;
    if (!file_url) return Response.json({ error: 'file_url required' }, { status: 400 });

    const bookTitle = source_label || 'Screenshot Upload';

    // ── Step 1: Classify + Extract via Vision LLM ──
    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a manuscript analysis AI specialized in Ottoman Turkish Islamic occult texts from books like Kenzül Havas and Havasul Kur'an.

Analyze this manuscript screenshot and do TWO things:

1. CLASSIFY the screenshot into exactly ONE domain:
   - "astro_clock": Contains planetary hour timing rules (specific Weekday + Saat number 1-24 + Kawkab/planet + recommended/forbidden actions)
   - "ihtilac": Contains body twitching/spasm interpretations (body part → omen, e.g., "right eye twitching means X")
   - "kiyafetname": Contains physiognomy (physical body trait → character, e.g., "tall stature means foolishness")
   - "ear_ringing": Contains ear ringing omens organized by weekday and day/night
   - "other": Any other manuscript content (prayers, ebced tables, planetary conjunctions, general theory, etc.)

2. EXTRACT all structured entries for the identified domain.

For IHTILAC entries, extract each body part and its interpretation:
- body_part_tr: Exact Turkish text (e.g., "Alnın sağ tarafının seğrimesi")
- body_part_en: English translation (e.g., "Right side of forehead twitching")
- interpretation_tr: Exact Turkish interpretation (e.g., "Mesrur olmaya ve zevke delâlet eder")
- interpretation_en: English translation (e.g., "Indicates joy and pleasure")
- source_system: "ibrahim_hakki" if from İbrahim Hakkı's ihtilâçname, "cafer_i_sadik" if from Cafer-i Sadık's ihtilâçname, "general" otherwise
- is_positive: true if the omen is positive (joy, wealth, good news), false if negative

For KIYAFETNAME entries, extract each physical trait and its character meaning:
- physical_trait_tr: Exact Turkish (e.g., "Uzun boy")
- physical_trait_en: English (e.g., "Tall stature")
- character_meaning_tr: Exact Turkish meaning
- character_meaning_en: English translation
- trait_category: One of: stature, hair, head, forehead, eyebrow, eye, ear, nose, mouth, voice, face, complexion, beard, neck, shoulder, arm, hand, finger, nail, chest, back, belly, leg, foot, other
- is_positive: true if positive (intelligence, generosity), false if negative

For EAR_RINGING entries, extract each weekday+period combination:
- weekday: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
- period: "day" or "night"
- weekday_name_tr: Turkish name (e.g., "Pazar günü", "Pazartesi gecesi")
- interpretation_tr: Exact Turkish text
- interpretation_en: English translation
- is_positive: true if positive omen, false if negative

For ASTRO_CLOCK rules, extract per planetary hour format:
- weekday (0-6), period ("day"/"night"), saat_number (1-24), kawkab (planet: sun/moon/mars/mercury/jupiter/venus/saturn)
- recommended_actions: array of {en: "action text"}
- forbidden_actions: array of {en: "action text"}
- warnings: array of {en: "warning text"}
- notes: array of {en: "note text"}
- summary: brief English summary of the rule

For OTHER content, extract:
- content_type: Brief description (e.g., "planetary_conjunction", "ebced_table", "prayer", "general_theory")
- raw_text_tr: Verbatim Turkish text
- raw_text_en: English translation/summary

If the screenshot is unreadable or contains no usable manuscript knowledge, return domain="other" with empty arrays.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          domain: { type: 'string', enum: ['astro_clock', 'ihtilac', 'kiyafetname', 'ear_ringing', 'other'] },
          ihtilac_entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                body_part_tr: { type: 'string' },
                body_part_en: { type: 'string' },
                interpretation_tr: { type: 'string' },
                interpretation_en: { type: 'string' },
                source_system: { type: 'string' },
                is_positive: { type: 'boolean' }
              },
              required: ['body_part_tr', 'interpretation_en']
            }
          },
          kiyafetname_entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                physical_trait_tr: { type: 'string' },
                physical_trait_en: { type: 'string' },
                character_meaning_tr: { type: 'string' },
                character_meaning_en: { type: 'string' },
                trait_category: { type: 'string' },
                is_positive: { type: 'boolean' }
              },
              required: ['physical_trait_tr', 'character_meaning_en']
            }
          },
          ear_ringing_entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                weekday: { type: 'integer' },
                period: { type: 'string' },
                weekday_name_tr: { type: 'string' },
                interpretation_tr: { type: 'string' },
                interpretation_en: { type: 'string' },
                is_positive: { type: 'boolean' }
              },
              required: ['weekday', 'period', 'interpretation_en']
            }
          },
          astro_clock_rules: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                weekday: { type: 'integer' },
                period: { type: 'string' },
                saat_number: { type: 'integer' },
                kawkab: { type: 'string' },
                recommended_actions: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' } }, required: ['en'] } },
                forbidden_actions: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' } }, required: ['en'] } },
                warnings: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' } }, required: ['en'] } },
                notes: { type: 'array', items: { type: 'object', properties: { en: { type: 'string' } }, required: ['en'] } },
                summary: { type: 'string' }
              }
            }
          },
          other_entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                content_type: { type: 'string' },
                raw_text_tr: { type: 'string' },
                raw_text_en: { type: 'string' }
              },
              required: ['content_type', 'raw_text_en']
            }
          },
          summary: { type: 'string' }
        },
        required: ['domain']
      }
    });

    const result: any = (llmResponse as any).data || llmResponse;
    const domain: string = result.domain || 'other';

    const mergeResult: any = {
      status: 'success',
      domain,
      screenshot_url: file_url,
      records_created: 0,
      records_merged: 0,
      details: []
    };

    // ── IHTILAC DOMAIN ──
    if (domain === 'ihtilac' && Array.isArray(result.ihtilac_entries)) {
      for (const entry of result.ihtilac_entries) {
        if (!entry.body_part_tr || !entry.interpretation_en) continue;
        const hash = await sha256(normalizeText(entry.body_part_en || entry.body_part_tr) + '|' + normalizeText(entry.interpretation_en));
        const action = await mergeEntry(base44, 'IhtilacKnowledge', hash, {
          knowledge_id: genId('IK'),
          body_part_tr: entry.body_part_tr,
          body_part_en: entry.body_part_en || '',
          body_part_ml: '',
          interpretation_tr: entry.interpretation_tr || '',
          interpretation_en: entry.interpretation_en,
          interpretation_ml: '',
          source_system: entry.source_system || 'general',
          is_positive: entry.is_positive || false
        }, bookTitle, file_url);
        if (action === 'created') mergeResult.records_created++;
        else if (action === 'merged') mergeResult.records_merged++;
        mergeResult.details.push({ body_part: entry.body_part_en || entry.body_part_tr, action });
      }
    }

    // ── KIYAFETNAME DOMAIN ──
    if (domain === 'kiyafetname' && Array.isArray(result.kiyafetname_entries)) {
      for (const entry of result.kiyafetname_entries) {
        if (!entry.physical_trait_tr || !entry.character_meaning_en) continue;
        const hash = await sha256(normalizeText(entry.physical_trait_en || entry.physical_trait_tr) + '|' + normalizeText(entry.character_meaning_en));
        const action = await mergeEntry(base44, 'KiyafetnameKnowledge', hash, {
          knowledge_id: genId('KK'),
          physical_trait_tr: entry.physical_trait_tr,
          physical_trait_en: entry.physical_trait_en || '',
          physical_trait_ml: '',
          character_meaning_tr: entry.character_meaning_tr || '',
          character_meaning_en: entry.character_meaning_en,
          character_meaning_ml: '',
          trait_category: entry.trait_category || 'other',
          is_positive: entry.is_positive || false
        }, bookTitle, file_url);
        if (action === 'created') mergeResult.records_created++;
        else if (action === 'merged') mergeResult.records_merged++;
        mergeResult.details.push({ trait: entry.physical_trait_en || entry.physical_trait_tr, action });
      }
    }

    // ── EAR RINGING DOMAIN ──
    if (domain === 'ear_ringing' && Array.isArray(result.ear_ringing_entries)) {
      for (const entry of result.ear_ringing_entries) {
        if (entry.weekday === undefined || !entry.period || !entry.interpretation_en) continue;
        const contextKey = `${entry.weekday}|${entry.period}`;
        const hash = await sha256(contextKey + '|' + normalizeText(entry.interpretation_en));
        const action = await mergeEntry(base44, 'EarRingingKnowledge', hash, {
          knowledge_id: genId('ERK'),
          weekday: entry.weekday,
          weekday_name_tr: entry.weekday_name_tr || '',
          period: entry.period,
          interpretation_tr: entry.interpretation_tr || '',
          interpretation_en: entry.interpretation_en,
          interpretation_ml: '',
          is_positive: entry.is_positive || false,
          full_context_key: contextKey
        }, bookTitle, file_url);
        if (action === 'created') mergeResult.records_created++;
        else if (action === 'merged') mergeResult.records_merged++;
        mergeResult.details.push({ weekday: entry.weekday, period: entry.period, action });
      }
    }

    // ── ASTRO CLOCK DOMAIN ──
    if (domain === 'astro_clock' && Array.isArray(result.astro_clock_rules)) {
      for (const rule of result.astro_clock_rules) {
        if (rule.weekday === undefined || rule.saat_number === undefined || !rule.kawkab) continue;
        const period = rule.period || 'day';
        const contextKey = `${rule.weekday}|${period}|${rule.saat_number}|${rule.kawkab}|`;
        const firstAction = rule.recommended_actions?.[0]?.en || rule.forbidden_actions?.[0]?.en || rule.summary || 'rule';
        const hash = await sha256('scr-' + contextKey + '-' + normalizeText(firstAction));
        const existing = await base44.asServiceRole.entities.AstroClockKnowledge.filter({ content_hash: hash, is_marker: false }, null, 1);
        if (existing.length > 0) {
          const rec = existing[0];
          const sources = rec.supporting_sources || [];
          if (!sources.some((s: any) => s.screenshot_url === file_url)) {
            sources.push({ book_title: bookTitle, screenshot_url: file_url });
            await base44.asServiceRole.entities.AstroClockKnowledge.update(rec.id, {
              supporting_sources: sources,
              source_count: (rec.source_count || 1) + 1
            });
            mergeResult.records_merged++;
          }
        } else {
          await base44.asServiceRole.entities.AstroClockKnowledge.create({
            knowledge_id: genId('ACK'),
            source_type: 'full_context',
            weekday: rule.weekday,
            period,
            saat_number: rule.saat_number,
            planet: rule.kawkab,
            full_context_key: contextKey,
            knowledge_category: 'full_context_rule',
            recommended_actions: rule.recommended_actions || [],
            forbidden_actions: rule.forbidden_actions || [],
            enemy_actions: [],
            friendship_actions: [],
            warnings_list: rule.warnings || [],
            notes_list: rule.notes || [],
            ritual_suitability: '',
            knowledge_text_en: rule.summary || '',
            knowledge_text_ml: '',
            knowledge_text_ar: '',
            content_hash: hash,
            canonical_key: `full_context|${rule.weekday}|${period}|${rule.saat_number}|${rule.kawkab}`,
            is_marker: false,
            source_book_title: bookTitle,
            source_screenshot_url: file_url,
            is_verified: false,
            supporting_sources: [],
            source_count: 1
          });
          mergeResult.records_created++;
        }
        mergeResult.details.push({ weekday: rule.weekday, saat: rule.saat_number, kawkab: rule.kawkab, action: existing.length > 0 ? 'merged' : 'created' });
      }
    }

    // ── OTHER DOMAIN ──
    if (domain === 'other' && Array.isArray(result.other_entries)) {
      for (const entry of result.other_entries) {
        if (!entry.content_type || !entry.raw_text_en) continue;
        const hash = await sha256(normalizeText(entry.content_type) + '|' + normalizeText(entry.raw_text_en).substring(0, 200));
        const action = await mergeEntry(base44, 'ManuscriptMiscKnowledge', hash, {
          knowledge_id: genId('MMK'),
          content_type: entry.content_type,
          raw_text_tr: entry.raw_text_tr || '',
          raw_text_en: entry.raw_text_en,
          raw_text_ml: ''
        }, bookTitle, file_url);
        if (action === 'created') mergeResult.records_created++;
        else if (action === 'merged') mergeResult.records_merged++;
        mergeResult.details.push({ content_type: entry.content_type, action });
      }
    }

    if (mergeResult.records_created === 0 && mergeResult.records_merged === 0) {
      mergeResult.status = 'no_knowledge_found';
      mergeResult.message = `No usable ${domain} knowledge could be extracted from this screenshot.`;
    }

    return Response.json(mergeResult);
  } catch (error) {
    return Response.json({ error: error.message, status: 'failed' }, { status: 500 });
  }
});