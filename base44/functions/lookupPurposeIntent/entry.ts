import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// PURPOSE DICTIONARY LOOKUP — Read-only backend function
// ═══════════════════════════════════════════════════════════════
// ── PERMANENT ISOLATION CONTRACT (immutable) ──
// This is the ONLY code permitted to READ the PurposeDictionary.
//   • READ ONLY. Never writes.
//   • Returns exactly ONE normalized_purpose_key, or {matched:false}.
//   • Must NEVER modify any workflow, trigger any calculation,
//     perform scoring/timing/AI/semantic inference, or influence
//     any Mizan, engine, Ebced, Bast, Kasam, or Astro Clock output.
//   • Must use indexed database queries with small bounded limits
//     (never load the full dictionary) and select the LONGEST matching
//     entry so a specific phrase always beats a generic parent. Must
//     stay fast at 1M+ records.
//   • On no match → return {matched:false} and let the existing
//     workflow continue exactly as before.
// Caller: src/lib/purposeDictionaryLookup.js (7th Mizan custom purpose).
// No other file, function, engine, page, or component may read this DB.
// See src/lib/purposeDictionaryIsolationLaw.js for the full contract.
//
// ── STABLE / PRODUCTION-READY — LOCKED CORE INFRASTRUCTURE ──
// This lookup engine is a STABLE SHARED CORE component. It is feature-
// complete and must NOT be modified for individual ritual purposes.
//
//   • To support a NEW ritual purpose → add/edit a PurposeDictionary
//     record ONLY. Never edit this function. Never add per-purpose
//     branches, special cases, or hard-coded keywords here.
//   • The lookup pipeline is permanently frozen in this order:
//       1. Exact purpose_phrase match
//       2. Most specific dictionary match (overlap → key length →
//          phrase length → field priority)
//       3. arabic_keyword  (batched $in over all normalized probes)
//       4. aliases         (batched $in; skipped if already matched
//          via arabic_keyword)
//       5. AI fallback — ONLY when no dictionary match exists, and
//          only to SUGGEST a new entry. AI may never override or
//          replace an existing dictionary entry.
//   • Normalization rules are frozen: recursive Arabic prefix
//     stripping (و، ف، ب، ك، ل, ال, and ل+ال→لل assimilation), harakat
//     + tatweel removal, conservative ≥3-char stem guard. The
//     original UI Arabic text is never modified — only internal query
//     probes are normalized.
//   • Modify this file ONLY to fix a critical bug, and only if the
//     fix preserves the frozen pipeline + normalization above.
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { customPurpose } = body;

    if (!customPurpose || !customPurpose.trim()) {
      return Response.json({ matched: false });
    }

    // Basic normalize: strip harakat, tatweel, lowercase, trim
    const normalize = (text) => {
      return String(text)
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '') // harakat
        .replace(/\u0640/g, '')                               // tatweel
        .toLowerCase()
        .trim();
    };

    // Deep normalize: Alif forms (أإآ→ا), Hamza (ؤ→و, ئ→ي, ء removed),
    // NFC/NFKC, invisible Unicode — stage-2 probe variants
    const normalizeDeep = (text) => {
      return String(text)
        .normalize('NFKC')
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '') // harakat
        .replace(/\u0640/g, '')                               // tatweel
        .replace(/[\u0622\u0623\u0625]/g, '\u0627')          // آ أ إ → ا
        .replace(/\u0624/g, '\u0648')                         // ؤ → و
        .replace(/\u0626/g, '\u064A')                         // ئ → ي
        .replace(/\u0621/g, '')                               // ء removed
        .replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '') // invisible
        .toLowerCase()
        .trim();
    };

    const normalizedInput = normalize(customPurpose);
    if (!normalizedInput) {
      return Response.json({ matched: false });
    }

    // Probes array — initialized with normalized input, extended in stage 2
    const probes = [normalizedInput];

    // Build the standard single-result response from an entry
    const buildResp = (entry, lookupPath) => ({
      matched: true,
      ritualIntent: entry.normalized_purpose_key,
      matchedPhrase: entry.purpose_phrase,
      source: entry.source || null,
      malayalam_meaning: entry.malayalam_meaning || "",
      english_meaning: entry.english_meaning || "",
      _debug: {
        normalizedKey: normalizedInput,
        deepNormalizedKey: normalizeDeep(customPurpose),
        probesUsed: probes.slice(0, 10),
        probesCount: probes.length,
        matchFound: true,
        entryId: entry.id || null,
        source: entry.source || null,
        lookupPath,
      },
    });

    // ── STEP 1: Exact purpose_phrase match (highest priority) ──
    // If the dictionary stores the exact full phrase, return it immediately.
    const phraseHits = await base44.asServiceRole.entities.PurposeDictionary.filter(
      { is_active: true, purpose_phrase: normalizedInput },
      null,
      1
    );
    if (phraseHits && phraseHits.length > 0) {
      return Response.json(buildResp(phraseHits[0], "exact_phrase"));
    }

    // ── STEP 2: Longest-match selection across aliases + arabic_keyword ──
    // Gather candidates from the full input AND each word (longest first),
    // querying aliases and arabic_keyword (indexed, small bounded limit).
    // Then pick the candidate with the LONGEST matched key — this ensures a
    // specific entry like "الصحة في الدواب" always beats the generic "الصحة".
    // Tie-break: longer normalized purpose_phrase, then field priority
    // (arabic_keyword > aliases). Never loads the full dictionary.
    const wordList = normalizedInput
      .split(/\s+/)
      .filter((w) => w.length >= 3)
      .sort((a, b) => b.length - a.length)
      .slice(0, 5);
    // Generic Arabic normalization: generate probe variants by stripping
    // common attached prefixes (و، ف، ب، ك، ل) and the definite article (ال)
    // in any combination. Conservative: only strip while the remaining stem
    // stays >= 3 chars, so real words like "كتاب" or "الله" are preserved.
    // Lets "وبالصحة" → "صحة", "فللبدن" → "بدن", "وللرزق" → "رزق", etc.
    // Applies to every token — no per-word special cases.
    const PREFIX_CHARS = "وفبكل";
    const variantsOf = (word) => {
      const seen = new Set();
      const queue = [word];
      while (queue.length) {
        const w = queue.shift();
        if (seen.has(w)) continue;
        seen.add(w);
        if (w.length > 3 && PREFIX_CHARS.includes(w[0])) queue.push(w.slice(1));
        if (w.length > 4 && w.startsWith("ال")) queue.push(w.slice(2));
        // Assimilation: ل + ال → لل. Un-assiminate "لل"+stem → "ال"+stem
        // so "للدواب" also reaches "الدواب" → "دواب".
        if (w.length > 4 && w.startsWith("لل")) queue.push("ال" + w.slice(2));
      }
      return [...seen];
    };
    for (const w of wordList) {
      for (const v of variantsOf(w)) {
        if (v !== normalizedInput && !probes.includes(v)) probes.push(v);
      }
    }

    // ── Deep-normalized probes (Alif/Hamza/NFC/invisible) — stage 2 ──
    // MANDATORY: generates deep-normalized variant of every probe so entries
    // stored with any Alif/Hamza form are found in the same batched query.
    const basicProbes = [...probes];
    for (const p of basicProbes) {
      const dp = normalizeDeep(p);
      if (dp !== p && !probes.includes(dp)) probes.push(dp);
    }

    const FIELD_RANK = { arabic_keyword: 0, aliases: 1 };
    const candidates = new Map(); // id -> { entry, field, key }

    // ── Batched lookup: ONE query per field ($in over all probes) ──
    // Replaces the previous per-probe loop (2 queries × N probes) with
    // exactly 2 queries total. Same priority, normalization, and scoring.
    const candId = (h) => h.id || (h.purpose_phrase + "|" + (h.arabic_keyword || ""));

    // 1) arabic_keyword — higher field priority, added first so it wins ties
    const kHits = await base44.asServiceRole.entities.PurposeDictionary.filter(
      { is_active: true, arabic_keyword: { $in: probes } },
      null,
      50
    );
    if (kHits && kHits.length) {
      for (const h of kHits) {
        candidates.set(candId(h), { entry: h, field: "arabic_keyword", key: h.arabic_keyword || "" });
      }
    }

    // 2) aliases — only for entries not already present via arabic_keyword
    const aHits = await base44.asServiceRole.entities.PurposeDictionary.filter(
      { is_active: true, aliases: { $in: probes } },
      null,
      50
    );
    if (aHits && aHits.length) {
      for (const h of aHits) {
        const id = candId(h);
        if (candidates.has(id)) continue; // arabic_keyword already won
        // longest matching alias probe = key (used for specificity scoring)
        const matched = (h.aliases || []).filter((a) => probes.includes(a));
        const key = matched.length ? matched.sort((a, b) => b.length - a.length)[0] : "";
        candidates.set(id, { entry: h, field: "aliases", key });
      }
    }

    if (candidates.size > 0) {
      // Specificity: count how many words of the entry's purpose_phrase
      // (ال-prefix stripped) appear in the input. Higher overlap = more
      // specific to the typed phrase, so a specific entry (e.g. "صحة البدن")
      // beats a generic action-prefixed one (e.g. "جلب الصحة") on input
      // "الصحة في البدن". Tie-break: matched-key length, purpose_phrase
      // length, then field priority (arabic_keyword > aliases).
      const stripAl = (w) => w.replace(/^ال/, "");
      const inputWords = new Set(normalizedInput.split(/\s+/).filter(Boolean).map(stripAl));
      let best = null;
      for (const c of candidates.values()) {
        const keyLen = (c.key || "").length;
        const ppNorm = normalize(c.entry.purpose_phrase || "");
        const ppLen = ppNorm.length;
        const overlap = ppNorm.split(/\s+/).filter(Boolean).filter((w) => inputWords.has(stripAl(w))).length;
        const fieldRank = FIELD_RANK[c.field];
        const score = { overlap, keyLen, ppLen, fieldRank };
        if (
          !best ||
          score.overlap > best.score.overlap ||
          (score.overlap === best.score.overlap && score.keyLen > best.score.keyLen) ||
          (score.overlap === best.score.overlap && score.keyLen === best.score.keyLen && score.ppLen > best.score.ppLen) ||
          (score.overlap === best.score.overlap && score.keyLen === best.score.keyLen && score.ppLen === best.score.ppLen && score.fieldRank < best.score.fieldRank)
        ) {
          best = { entry: c.entry, score };
        }
      }
      if (best) return Response.json(buildResp(best.entry, best.field));
    }

    return Response.json({
      matched: false,
      _debug: {
        normalizedKey: normalizedInput,
        deepNormalizedKey: normalizeDeep(customPurpose),
        probesUsed: probes.slice(0, 10),
        probesCount: probes.length,
        matchFound: false,
        entryId: null,
        source: null,
        lookupPath: "none",
      },
    });
  } catch (error) {
    return Response.json({ matched: false, error: error.message }, { status: 500 });
  }
});