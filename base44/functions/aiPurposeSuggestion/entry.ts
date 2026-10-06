import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// AI PURPOSE SUGGESTION — Read-only fallback (admin/owner only)
// ═══════════════════════════════════════════════════════════════
// Called ONLY when lookupPurposeIntent returns { matched: false }.
// Does NOT write to PurposeDictionary. Returns a structured
// suggestion that the Owner/Admin can approve, edit, or reject.
// Once approved via savePurposeDictionaryEntry, future lookups
// use the dictionary entry — AI is never the source of truth.
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ success: false, error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await req.json();
    const { middleWord, fullText, actionArabic, cardKey } = body;
    const purpose = String(middleWord || '').trim();
    if (!purpose) {
      return Response.json({ success: false, error: 'No purpose portion provided' });
    }

    const prompt = [
      'You are an expert in Arabic occult manuscripts (Sirr al-Huruf, Islamic esotericism).',
      'A user entered a ritual purpose phrase in Arabic. Infer the SEMANTIC MEANING of the PURPOSE portion ONLY.',
      '',
      'STRICT RULES:',
      '- IGNORE the Action word: جلب (bring), طرد (repel), الصحة (improve health), السقم (cause illness).',
      '- IGNORE the Ending phrase: طرفة العين (before the blink of an eye).',
      '- Analyze ONLY the Purpose portion given below.',
      '- If the purpose portion contains prepositions/articles (في, من, على, الـ), extract the core noun.',
      '- Meanings must describe the PURPOSE only, never the action or ending.',
      '',
      `Purpose portion (Arabic, action/ending already stripped): "${purpose}"`,
      `Full original text: "${fullText || ''}"`,
      `Detected action: ${actionArabic || 'none'}`,
      '',
      'Return JSON with exactly these fields:',
      '- arabic_purpose: core purpose keyword in Arabic (no action/ending, no prepositions). e.g. الرزق, البدن, المحبة',
      '- english_meaning: concise English (1-3 words). e.g. "Provision / Sustenance"',
      '- malayalam_meaning: concise Malayalam. e.g. "ഉപജീവനം"',
      '- confidence: "High" | "Medium" | "Low"',
      '- suggested_normalized_key: one of [celb, tard, sihhat, sekam, tarfet, rizq, knowledge, travel, sultan, haybah] — the 7th Mizan purpose card this purpose maps to (الرزق→rizq, البدن→sihhat, المحبة→celb, المرض→sihhat, السقم→sekam, etc.)',
      '',
      'Return ONLY the JSON object.',
    ].join('\n');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          arabic_purpose: { type: 'string' },
          english_meaning: { type: 'string' },
          malayalam_meaning: { type: 'string' },
          confidence: { type: 'string', enum: ['High', 'Medium', 'Low'] },
          suggested_normalized_key: {
            type: 'string',
            enum: ['celb', 'tard', 'sihhat', 'sekam', 'tarfet', 'rizq', 'knowledge', 'travel', 'sultan', 'haybah'],
          },
        },
        required: ['arabic_purpose', 'english_meaning', 'malayalam_meaning', 'confidence', 'suggested_normalized_key'],
      },
    });

    return Response.json({
      success: true,
      arabic_purpose: result.arabic_purpose || purpose,
      english_meaning: result.english_meaning || '',
      malayalam_meaning: result.malayalam_meaning || '',
      confidence: result.confidence || 'Medium',
      suggested_normalized_key: result.suggested_normalized_key || cardKey || 'celb',
      source_input: purpose,
    });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});