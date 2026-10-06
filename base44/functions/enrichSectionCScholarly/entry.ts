import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// enrichSectionCScholarly — Phase 2: Scholarly Research.
//
// For ONE Birhatīya name (HolyNameEsotericKnowledge), searches the
// internet for authentic classical & scholarly sources and APPENDS
// the findings to the card. Append-only — never overwrites prior
// PDF-extracted data; never deletes; dedups by content hash.
//
// RULES (from the owner):
//   - Internet search is now PERMITTED (this is the research phase).
//   - Collect ONLY from authentic classical sources and reputable
//     scholarly references.
//   - Do not stop at one source — collect from as many reliable
//     sources as possible.
//   - Never merge different opinions into one paragraph. Every
//     source stays independently readable (one scholarly_data entry
//     per source-statement).
//   - Every entry carries: exact source, book name, author, page,
//     URL, language, confidence level.
//   - Never overwrite previous PDF information. Always append.
//   - Arabic du'as / invocations / mantras / awfāq / talismans stay
//     in original Arabic exactly as printed by the source.
//   - Malayalam rendering for explanations/meanings (faithful).
//
// INPUT:
//   name_id  (required) — e.g. "HNK-MHC-001"
//
// OUTPUT: summary of appended entries + sources consulted.
// ISOLATED — touches ONLY HolyNameEsotericKnowledge.
// ═══════════════════════════════════════════════════════════════

const NAMES_28 = [
  { id: "HNK-MHC-001", ar: "برهتية", tr: "Birhatya", ml: "ബർഹതിയ" },
  { id: "HNK-MHC-002", ar: "كريم", tr: "Karīr", ml: "കരീം" },
  { id: "HNK-MHC-003", ar: "تتليه", tr: "Tatlīyah", ml: "തത്ലിയ" },
  { id: "HNK-MHC-004", ar: "طوران", tr: "Ṭawrān", ml: "തൗറാൻ" },
  { id: "HNK-MHC-005", ar: "مزجل", tr: "Mazjal", ml: "മസ്ജൽ" },
  { id: "HNK-MHC-006", ar: "بزجل", tr: "Bazjal", ml: "ബസ്ജൽ" },
  { id: "HNK-MHC-007", ar: "ترقب", tr: "Tarqab", ml: "തർഖബ്" },
  { id: "HNK-MHC-008", ar: "برهش", tr: "Barhash", ml: "ബർഹശ്" },
  { id: "HNK-MHC-009", ar: "غلمش", tr: "Ghalmash", ml: "ഗൽമശ്" },
  { id: "HNK-MHC-010", ar: "خوطير", tr: "Khawtayr", ml: "ഖൗതൈർ" },
  { id: "HNK-MHC-011", ar: "قلنهود", tr: "Qalnahuwd", ml: "ഖൽനഹൂദ്" },
  { id: "HNK-MHC-012", ar: "برشان", tr: "Barshān", ml: "ബർശാൻ" },
  { id: "HNK-MHC-013", ar: "كظيمر", tr: "Katẓīr", ml: "കസ്വീർ" },
  { id: "HNK-MHC-014", ar: "نموشلخ", tr: "Namūshalakh", ml: "നമൂശലഖ്" },
  { id: "HNK-MHC-015", ar: "برهيولا", tr: "Barhayūlā", ml: "ബർഹയൂലാ" },
  { id: "HNK-MHC-016", ar: "بشكيلخ", tr: "Bashkīlakh", ml: "ബശ്കീലഖ്" },
  { id: "HNK-MHC-017", ar: "قزمز", tr: "Qazmaz", ml: "ഖസ്മസ്" },
  { id: "HNK-MHC-018", ar: "انغلليط", tr: "Anghalalīt", ml: "അൻഗ്ലലീത്" },
  { id: "HNK-MHC-019", ar: "قبرات", tr: "Qabarāt", ml: "ഖബറാത്" },
  { id: "HNK-MHC-020", ar: "غياها", tr: "Ghayāhā", ml: "ഗയാഹാ" },
  { id: "HNK-MHC-021", ar: "كيدهولا", tr: "Kaydhūlā", ml: "കൈദ്ഹൂലാ" },
  { id: "HNK-MHC-022", ar: "سماخر", tr: "Simākhir", ml: "സിമാഖിർ" },
  { id: "HNK-MHC-023", ar: "شمحاهيمر", tr: "Shimkhāhīr", ml: "ശിംഖാഹീർ" },
  { id: "HNK-MHC-024", ar: "شمحاهيمر", tr: "Shimhāhīr", ml: "ശിംഹാഹീർ" },
  { id: "HNK-MHC-025", ar: "بكهطونيه", tr: "Bakhaṭūnīya", ml: "ബഖതൂനിയ" },
  { id: "HNK-MHC-026", ar: "بشارش", tr: "Bashārish", ml: "ബശാരിശ്" },
  { id: "HNK-MHC-027", ar: "طونش", tr: "Ṭawnish", ml: "തൗനിശ്" },
  { id: "HNK-MHC-028", ar: "شمخاباروخ", tr: "Shamkhābārūkh", ml: "ശംഖബാരൂഖ്" },
];

// Category → entity advanced-section array field.
const CAT_TO_FIELD = {
  dua: "invocation_wazifa",
  invocation: "invocation_wazifa",
  mantra: "invocation_wazifa",
  mujarrab: "mujarrabat",
  khawass: "khawass",
  amal: "amal",
  awfaq: "related_magic_squares",
  magic_square: "related_magic_squares",
  talisman: "talisman_images",
  khadim: "servitors",
  servitor: "servitors",
  benefits: "benefits",
  conditions: "conditions",
  recitation_method: "number_of_recitations",
  repetitions: "number_of_recitations",
  days: "timing",
  times: "timing",
  timing: "timing",
  incense: "incense",
  planet: "planet",
  hour: "planet",
  warnings: "warnings",
  scholarly_disagreement: "scholarly_discussions",
  historical_note: "historical_notes",
  classical_reference: "scholarly_discussions",
  meaning: "scholarly_data",
  other: "scholarly_data",
};

// Categories that ONLY go to scholarly_data (not a section array).
const SCHOLARLY_ONLY = new Set(["meaning", "classical_reference", "other"]);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || user.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const name_id = String(body.name_id || "").trim();
    if (!name_id) return Response.json({ error: "name_id is required" }, { status: 400 });
    const nameInfo = NAMES_28.find(n => n.id === name_id);
    if (!nameInfo) return Response.json({ error: "Unknown name_id" }, { status: 400 });

    // Load the card.
    const cards = await sdk.entities.HolyNameEsotericKnowledge.filter({ name_id }, null, 1);
    const card = (cards && cards[0]) || null;
    if (!card) return Response.json({ error: "Card not found for " + name_id }, { status: 404 });

    const prompt = `You are a meticulous Islamic-occult scholarly researcher building the largest scholarly Birhatīya (Barhatiah / برهتية) reference library.

Research the Birhatīya name: **${nameInfo.ar}** (transliteration: ${nameInfo.tr}).
This is name #${name_id.replace("HNK-MHC-", "")} of the 28-name Birhatīya conjuration oath, from the al-Būnī tradition (Manbaʿ Uṣūl al-Ḥikma and Shams al-Maʿārif).

SEARCH THE INTERNET and consult authentic classical lexicons, manuscript studies, academic papers, and reputable scholarly references (e.g. Aḥmad al-Būnī's works, N Wahid Azal's revision, Ishtar Publishing edition, academic studies of Islamic occultism, classical Arabic lexicons like Lisān al-ʿArab, Tāj al-ʿArūs, and manuscript databases).

For THIS name, collect and return as many DISTINCT source-statements as you can find. DO NOT stop at one source. If 10 authentic sources exist, return all 10. Categories to look for:
- Arabic meanings from classical lexicons
- Variant spellings
- Classical references
- Every authentic duʿāʾ
- Every invocation
- Every mantra
- Every mujarrab (tested efficacy)
- Every khāṣṣa (specific property)
- Every ʿamal (ritual work)
- Every wafq / awfāq (magic square)
- Every talisman
- Every khādim (servitor) reference
- Recitation methods
- Benefits mentioned
- Conditions of use
- Number of repetitions
- Days
- Times
- Incense
- Planet / hour if mentioned
- Warnings
- Scholarly disagreements
- Historical notes

ABSOLUTE RULES:
1. NEVER merge different opinions/sources into one entry. Each entry = ONE source's ONE statement.
2. Every entry MUST carry full attribution: source_book, author, page (if available), url (when from internet), language, confidence (HIGH / MEDIUM / LOW).
3. Arabic duʿās, invocations, mantras, awfāq, talismans must be copied EXACTLY in original Arabic (arabic_text), letter-for-letter, never transliterated away.
4. text = the content exactly as the source states it (original language). malayalam = a faithful, natural Malayalam rendering of the SAME content (translate the meaning faithfully; do not invent).
5. category = exactly one of: dua, invocation, mantra, mujarrab, khawass, amal, awfaq, magic_square, talisman, khadim, servitor, benefits, conditions, recitation_method, repetitions, days, times, timing, incense, planet, hour, warnings, scholarly_disagreement, historical_note, classical_reference, meaning, other.
6. Only return entries you genuinely found in a source. Never fabricate. If you cannot find information for a category, return no entry for it.
7. Keep different scholars' disagreements as SEPARATE entries (category "scholarly_disagreement"), each with its own source.

Also return:
- variant_spellings: every alternate Arabic spelling attested (arabic, note, source_book, url).
- variant_meanings: every alternate meaning attested (meaning, note, source_book, url).
- variant_pronunciations: every alternate pronunciation/transliteration attested (pronunciation, note, source_book, url).
- sources_consulted: list of all source names/URLs you consulted.`;

    const schema = {
      type: "object",
      properties: {
        entries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              arabic_text: { type: "string" },
              text: { type: "string" },
              malayalam: { type: "string" },
              source_book: { type: "string" },
              author: { type: "string" },
              page: { type: "string" },
              url: { type: "string" },
              language: { type: "string" },
              confidence: { type: "string" },
            },
            required: ["category", "text", "source_book"],
          },
        },
        variant_spellings: {
          type: "array",
          items: {
            type: "object",
            properties: { arabic: { type: "string" }, note: { type: "string" }, source_book: { type: "string" }, url: { type: "string" } },
            required: ["arabic"],
          },
        },
        variant_meanings: {
          type: "array",
          items: {
            type: "object",
            properties: { meaning: { type: "string" }, note: { type: "string" }, source_book: { type: "string" }, url: { type: "string" } },
            required: ["meaning"],
          },
        },
        variant_pronunciations: {
          type: "array",
          items: {
            type: "object",
            properties: { pronunciation: { type: "string" }, note: { type: "string" }, source_book: { type: "string" }, url: { type: "string" } },
            required: ["pronunciation"],
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
      return Response.json({ error: "Research LLM call failed", details: String(e?.message || e) }, { status: 500 });
    }

    const data = (out && typeof out === "object") ? out : {};
    const entries = Array.isArray(data.entries) ? data.entries : [];
    const vSpell = Array.isArray(data.variant_spellings) ? data.variant_spellings : [];
    const vMean = Array.isArray(data.variant_meanings) ? data.variant_meanings : [];
    const vPron = Array.isArray(data.variant_pronunciations) ? data.variant_pronunciations : [];
    const sourcesConsulted = Array.isArray(data.sources_consulted) ? data.sources_consulted : [];
    const now = new Date().toISOString();

    // Fresh load to avoid stale-field overwrite.
    const fresh = (await sdk.entities.HolyNameEsotericKnowledge.filter({ name_id }, null, 1))[0] || card;

    const appendSection = (arrName, entry) => {
      const arr = Array.isArray(fresh[arrName]) ? [...fresh[arrName]] : [];
      const key = `${entry.text}||${entry.source_reference}||${entry.source_page}`;
      if (arr.some(e => `${e.text}||${e.source_reference}||${e.source_page}` === key)) return false;
      arr.push({ text: entry.text, source_reference: entry.source_reference, source_page: entry.source_page });
      fresh[arrName] = arr;
      return true;
    };
    const appendScholarly = (entry) => {
      const arr = Array.isArray(fresh.scholarly_data) ? [...fresh.scholarly_data] : [];
      const key = `${entry.verbatim_text}||${entry.source_reference}||${entry.source_page}`;
      if (arr.some(e => `${e.verbatim_text}||${e.source_reference}||${e.source_page}` === key)) return false;
      arr.push(entry);
      fresh.scholarly_data = arr;
      return true;
    };

    const sectionCounts = {};
    let scholarlyAdded = 0;
    for (const it of entries) {
      const cat = String(it.category || "other").trim();
      const arabic = String(it.arabic_text || "").trim();
      const text = String(it.text || "").trim();
      const ml = String(it.malayalam || "").trim();
      if (!text && !arabic) continue;
      const book = String(it.source_book || "Internet scholarly source").trim();
      const author = String(it.author || "").trim();
      const page = String(it.page || "").trim();
      const url = String(it.url || "").trim();
      const lang = String(it.language || "").trim();
      const conf = String(it.confidence || "MEDIUM").trim();
      const sourceRef = author ? `${book} — ${author}` : book;
      const notes = `URL: ${url || "n/a"} | Language: ${lang || "n/a"} | Confidence: ${conf} | Category: ${cat} | (Internet scholarly research)`;

      // scholarly_data entry (rich attribution).
      const sch = {
        source_reference: sourceRef,
        source_page: page,
        verbatim_text: text,
        exact_meaning: ml,
        arabic_text: arabic,
        transliteration: "",
        notes,
        imported_at: now,
      };
      if (appendScholarly(sch)) scholarlyAdded++;

      // Section array (unless scholarly-only category).
      if (!SCHOLARLY_ONLY.has(cat)) {
        const field = CAT_TO_FIELD[cat] || "scholarly_discussions";
        if (field !== "scholarly_data") {
          const secEntry = { text: arabic || text, source_reference: sourceRef, source_page: page };
          if (appendSection(field, secEntry)) sectionCounts[field] = (sectionCounts[field] || 0) + 1;
        }
      }
    }

    // Variants — append-only.
    const mergeVariants = (arrName, list, buildEntry) => {
      if (!list.length) return 0;
      const arr = Array.isArray(fresh[arrName]) ? [...fresh[arrName]] : [];
      let added = 0;
      for (const v of list) {
        const e = buildEntry(v);
        const key = JSON.stringify(e);
        if (arr.some(x => JSON.stringify({ arabic: x.arabic || x.pronunciation || x.meaning, note: x.note, source_reference: x.source_reference, source_page: x.source_page }) === JSON.stringify({ arabic: e.arabic || e.pronunciation || e.meaning, note: e.note, source_reference: e.source_reference, source_page: e.source_page }))) continue;
        arr.push(e);
        added++;
      }
      fresh[arrName] = arr;
      return added;
    };
    const spellAdded = mergeVariants("alternate_spellings", vSpell, v => ({ arabic: String(v.arabic||""), source_reference: String(v.source_book||"Internet source"), source_page: String(v.url||""), note: String(v.note||"") }));
    const meanAdded = mergeVariants("alternate_meanings", vMean, v => ({ meaning: String(v.meaning||""), source_reference: String(v.source_book||"Internet source"), source_page: String(v.url||""), note: String(v.note||"") }));
    const pronAdded = mergeVariants("alternate_pronunciations", vPron, v => ({ pronunciation: String(v.pronunciation||""), source_reference: String(v.source_book||"Internet source"), source_page: String(v.url||""), note: String(v.note||"") }));

    // Sources list — append consulted sources (dedup by reference).
    const srcList = Array.isArray(fresh.sources) ? [...fresh.sources] : [];
    for (const s of sourcesConsulted) {
      const ref = String(s || "").trim();
      if (!ref) continue;
      if (!srcList.some(x => (x.reference || "") === ref)) {
        srcList.push({ reference: ref, page: "", imported_at: now, notes: "Internet scholarly research" });
      }
    }
    fresh.sources = srcList;

    // Persist.
    const update = {
      scholarly_data: fresh.scholarly_data,
      sources: fresh.sources,
      alternate_spellings: fresh.alternate_spellings,
      alternate_meanings: fresh.alternate_meanings,
      alternate_pronunciations: fresh.alternate_pronunciations,
    };
    for (const f of Object.keys(sectionCounts)) update[f] = fresh[f];
    await sdk.entities.HolyNameEsotericKnowledge.update(fresh.id, update);

    return Response.json({
      status: "ok",
      name_id,
      arabic: nameInfo.ar,
      entries_found: entries.length,
      scholarly_added: scholarlyAdded,
      sections_added: sectionCounts,
      variant_spellings_added: spellAdded,
      variant_meanings_added: meanAdded,
      variant_pronunciations_added: pronAdded,
      sources_consulted: sourcesConsulted.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});