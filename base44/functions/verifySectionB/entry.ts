import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";
import {
  ARRAY_FIELDS, CAT_TO_FIELD, appendUnique, buildEntry, checkSections,
  ENTRY_SCHEMA_PROPERTIES,
} from "../../shared/sectionBShared.ts";

// ═══════════════════════════════════════════════════════════════
// verifySectionB — Final verification pass for ONE Section B card.
//
// Searches the internet for additional authentic scholarly sources,
// mujarrabat, amal, du'as, wazifas, khawass, awfaq, magic squares,
// talismans, historical/manuscript/Archive.org/academic references.
// APPEND-ONLY — never overwrites existing PDF seed data. Dedups by
// text + source + page. Keeps contradictory opinions separate.
//
// INPUT:  pdf_name_id (required) — e.g. "PDF-HN-001"
// OUTPUT: verification report with pre/post analysis + verdict.
// ISOLATED — touches ONLY HolyOnePDFName.
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Admin only" }, { status: 403 });
    }
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const pdf_name_id = String(body.pdf_name_id || "").trim();
    if (!pdf_name_id) {
      return Response.json({ error: "pdf_name_id is required" }, { status: 400 });
    }

    // Load the card.
    const cards = await sdk.entities.HolyOnePDFName.filter({ pdf_name_id }, null, 1);
    const card = (cards && cards[0]) || null;
    if (!card) {
      return Response.json({ error: "Card not found for " + pdf_name_id }, { status: 404 });
    }

    // ── Pre-verification ──
    const preCheck = checkSections(card);

    // ── Build research prompt ──
    const arabicName = card.arabic_name || "";
    const transliteration = card.arabic_transliteration || "";
    const meaning = card.meaning_malayalam || "";
    const surah = card.surah_name || "";

    const missingList = preCheck.missing.length > 0
      ? preCheck.missing.join(", ")
      : "(none — all sections populated)";
    const weakList = preCheck.weak.map((w) => `${w.key}(${w.count})`).join(", ") || "(none)";

    const prompt = `You are a meticulous Islamic-occult scholarly researcher building the largest Asma' al-Husna / Qur'anic Divine Names scholarly reference library.

Research the Divine Name: **${arabicName}** (transliteration: ${transliteration}).
Section B ID: ${pdf_name_id}. Surah: ${surah}. Known meaning: ${meaning}.

This is a Divine Name from the Qur'an / Asma' al-Husna tradition. SEARCH THE INTERNET thoroughly and consult authentic classical lexicons, manuscript studies, academic papers, Archive.org manuscripts, and reputable scholarly references.

Sources to consult: classical Arabic lexicons (Lisān al-ʿArab, Tāj al-ʿArūs), tafsir works, Aḥmad al-Būnī's Shams al-Maʿārif and Manbaʿ Uṣūl al-Ḥikma, Ibn al-ʿArabī's al-Futūḥāt al-Makkiyya, al-Ghazālī's al-Maqaṣid al-Asnā, Qurṭubī's tafsir, academic studies of Islamic occultism, Archive.org manuscript scans, and any other authentic source.

Currently MISSING sections for this card: ${missingList}
Currently WEAK sections (only 1 entry): ${weakList}

For THIS name, collect as many DISTINCT source-statements as you can find. DO NOT stop at one source. If 10 authentic sources exist, return all 10. Search specifically for:
- Scholarly meanings and explanations from classical lexicons
- Authentic Mujarrabāt (tested efficacious practices)
- Authentic A'mal (ritual works) — include conditions, repetitions, timing, purpose, warnings
- Authentic Du'as — Arabic kept verbatim
- Authentic Wazifas / Wird / Hizb — Arabic kept verbatim
- Authentic Khawāṣṣ (specific spiritual properties)
- Authentic Awfāq / Magic Squares — MUST include construction_method and source
- Authentic Talismans
- Historical references
- Manuscript references (with library/collection/folio if known)
- Archive.org references (with URL)
- Academic references (with author, title, year)

ABSOLUTE RULES:
1. NEVER merge different opinions/sources into one entry. Each entry = ONE source's ONE statement.
2. Every entry MUST carry full attribution: source_book, author, page, url, language, confidence (HIGH/MEDIUM/LOW).
3. Arabic du'as, invocations, mantras, awfāq, talismans must be copied EXACTLY in original Arabic (arabic_text), letter-for-letter.
4. text = the content exactly as the source states it. malayalam = a faithful, natural Malayalam rendering.
5. category = one of: mujarrab, amal, dua, wazifa, khawass, wafq, magic_square, talisman, khadim, servitor, benefits, warnings, conditions, timing, days, times, repetitions, recitation_method, methods, scholarly_entry, meaning, explanation, historical_reference, academic_reference, manuscript_reference, archive_reference.
6. For magic squares: construction_method MUST be filled (how the square is built, letter placement, abjad values used).
7. For rituals (amal, mujarrab, wazifa): fill conditions, repetitions, timing, purpose, warnings.
8. Only return entries you genuinely found in a source. NEVER fabricate.
9. Keep different scholars' disagreements as SEPARATE entries, each with its own source.

Also return:
- variant_spellings: every alternate Arabic spelling attested (arabic, note, source_book, url).
- variant_meanings: every alternate meaning attested (text, note, source_book, url).
- variant_pronunciations: every alternate pronunciation/transliteration attested (text, note, source_book, url).
- sources_consulted: list of all source names/URLs you consulted.`;

    const schema = {
      type: "object",
      properties: {
        entries: {
          type: "array",
          items: {
            type: "object",
            properties: ENTRY_SCHEMA_PROPERTIES,
            required: ["category", "text", "source_book"],
          },
        },
        variant_spellings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              arabic: { type: "string" },
              note: { type: "string" },
              source_book: { type: "string" },
              url: { type: "string" },
            },
            required: ["arabic"],
          },
        },
        variant_meanings: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              note: { type: "string" },
              source_book: { type: "string" },
              url: { type: "string" },
            },
            required: ["text"],
          },
        },
        variant_pronunciations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              note: { type: "string" },
              source_book: { type: "string" },
              url: { type: "string" },
            },
            required: ["text"],
          },
        },
        sources_consulted: { type: "array", items: { type: "string" } },
      },
      required: ["entries"],
    };

    let out;
    try {
      out = await sdk.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: schema,
        model: "gemini_3_flash",
      });
    } catch (e) {
      return Response.json(
        { error: "Research LLM call failed", details: String(e?.message || e) },
        { status: 500 },
      );
    }

    const data = (out && typeof out === "object") ? out : {};
    const entries = Array.isArray(data.entries) ? data.entries : [];
    const vSpell = Array.isArray(data.variant_spellings) ? data.variant_spellings : [];
    const vMean = Array.isArray(data.variant_meanings) ? data.variant_meanings : [];
    const vPron = Array.isArray(data.variant_pronunciations) ? data.variant_pronunciations : [];
    const sourcesConsulted = Array.isArray(data.sources_consulted) ? data.sources_consulted : [];
    const now = new Date().toISOString();

    // Fresh load to avoid stale-field overwrite.
    const fresh = (await sdk.entities.HolyOnePDFName.filter({ pdf_name_id }, null, 1))[0] || card;

    const sectionCounts: Record<string, number> = {};
    let totalAdded = 0;
    let contradictionsAdded = 0;

    for (const it of entries) {
      const cat = String(it.category || "scholarly_entry").trim().toLowerCase();
      const field = CAT_TO_FIELD[cat] || "scholarly_entries";
      const entry = buildEntry(it, now);
      if (!entry.text && !entry.arabic_text) continue;
      const { added, newArr } = appendUnique(fresh[field], entry);
      fresh[field] = newArr;
      if (added) {
        sectionCounts[field] = (sectionCounts[field] || 0) + 1;
        totalAdded++;
        // Detect potential contradictions (same category, different text)
        if (newArr.length > 1) contradictionsAdded++;
      }
    }

    // Variants — append-only.
    const mergeVariants = (arrName: string, list: any[], buildFn: (v: any) => Record<string, any>): number => {
      if (!list.length) return 0;
      let added = 0;
      for (const v of list) {
        const e = buildFn(v);
        const { added: a, newArr } = appendUnique(fresh[arrName], e);
        fresh[arrName] = newArr;
        if (a) added++;
      }
      return added;
    };
    const spellAdded = mergeVariants("variant_spellings", vSpell, (v) => ({
      arabic: String(v.arabic || ""),
      note: String(v.note || ""),
      source_book: String(v.source_book || ""),
      url: String(v.url || ""),
      added_at: now,
    }));
    const meanAdded = mergeVariants("variant_meanings", vMean, (v) => ({
      text: String(v.text || ""),
      note: String(v.note || ""),
      source_book: String(v.source_book || ""),
      url: String(v.url || ""),
      added_at: now,
    }));
    const pronAdded = mergeVariants("variant_pronunciations", vPron, (v) => ({
      text: String(v.text || ""),
      note: String(v.note || ""),
      source_book: String(v.source_book || ""),
      url: String(v.url || ""),
      added_at: now,
    }));

    // Sources list — append consulted sources (dedup).
    const srcList = Array.isArray(fresh.sources) ? [...fresh.sources] : [];
    for (const s of sourcesConsulted) {
      const ref = String(s || "").trim();
      if (!ref) continue;
      if (!srcList.some((x) => String(x.reference || x.source_book || "") === ref)) {
        srcList.push({ reference: ref, url: "", added_at: now });
      }
    }
    fresh.sources = srcList;

    // Enrichment history — append.
    const history = Array.isArray(fresh.enrichment_history) ? [...fresh.enrichment_history] : [];
    history.push({
      event: "verification_pass",
      timestamp: now,
      entries_added: totalAdded,
      sections_added: sectionCounts,
      pre_missing: preCheck.missing,
      pre_weak: preCheck.weak,
      sources_consulted: sourcesConsulted.length,
    });
    fresh.enrichment_history = history;

    // Build update object — only array fields + sources + history + variants.
    const update: Record<string, any> = {};
    for (const field of ARRAY_FIELDS) update[field] = fresh[field];
    update.sources = fresh.sources;
    update.enrichment_history = fresh.enrichment_history;
    update.variant_spellings = fresh.variant_spellings;
    update.variant_meanings = fresh.variant_meanings;
    update.variant_pronunciations = fresh.variant_pronunciations;

    await sdk.entities.HolyOnePDFName.update(fresh.id, update);

    // ── Post-verification ──
    const postCheck = checkSections(fresh);
    const verdict = postCheck.missing.length === 0 ? "VERIFIED" : "NEEDS_REVIEW";

    return Response.json({
      status: "ok",
      pdf_name_id,
      arabic: arabicName,
      pre_verification: {
        missing_sections: preCheck.missing,
        weak_sections: preCheck.weak,
        weak_sources: preCheck.weakSources,
        duplicates: preCheck.duplicates,
      },
      new_entries_added: totalAdded,
      sections_added: sectionCounts,
      contradictions_added: contradictionsAdded,
      variant_spellings_added: spellAdded,
      variant_meanings_added: meanAdded,
      variant_pronunciations_added: pronAdded,
      sources_consulted: sourcesConsulted.length,
      post_verification: {
        still_missing_sections: postCheck.missing,
        still_weak_sections: postCheck.weak,
      },
      verdict,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});