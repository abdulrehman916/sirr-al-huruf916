import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// SAVE PURPOSE DICTIONARY ENTRY — admin/owner only
// ═══════════════════════════════════════════════════════════════
// Stores a NEW PurposeDictionary record. Used by the "Approve & Save"
// action on an AI Suggested Meaning. Once saved, lookupPurposeIntent
// returns this entry — AI is bypassed on all future lookups.
// Never called automatically; always requires explicit admin action.
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
    const {
      purpose_phrase, arabic_keyword, malayalam_meaning, english_meaning,
      action, normalized_purpose_key, aliases, language, notes,
    } = body;

    if (!purpose_phrase || !normalized_purpose_key) {
      return Response.json({ success: false, error: 'purpose_phrase and normalized_purpose_key are required' });
    }

    const entry = await base44.entities.PurposeDictionary.create({
      purpose_phrase,
      arabic_keyword: arabic_keyword || '',
      malayalam_meaning: malayalam_meaning || '',
      english_meaning: english_meaning || '',
      action: action || 'other',
      normalized_purpose_key,
      language: language || 'ar',
      aliases: Array.isArray(aliases) ? aliases : [],
      source: 'AI Suggested — admin approved',
      is_active: true,
      notes: notes || `Approved by ${user.email || 'admin'}`,
    });

    return Response.json({ success: true, id: entry.id });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});