import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// ingestSectionCManuscript — Section C (Birhatīya) PDF ingestion.
//
// Recreated (the prior runtime/source was lost). Reuses the
// project's proven PDF→vision pattern (InvokeLLM file_urls +
// gemini_3_flash + flat JSON schema), the same mechanism used by
// ingestSirrManuscript.
//
// PURPOSE: Enrich ONLY the existing 28 Birhatīya cards
// (HolyNameEsotericKnowledge, HNK-MHC-001..028) from a scholarly
// PDF that has already been uploaded into project storage.
//
// RULES (from the owner):
//   - Never create new cards. Match content to the EXISTING 28.
//   - Append-only. Never overwrite existing data.
//   - Verbatim transcription. Never summarize / simplify / invent /
//     guess. Every Arabic letter & harakah copied exactly as printed.
//   - No internet search. No AI knowledge. No external books. ONLY
//     the supplied PDF.
//   - Everything except Arabic is rendered in faithful Malayalam.
//   - If a field is not documented in the PDF, leave it empty (the
//     UI marks undocumented fields with the Malayalam placeholder).
//   - Multiple PDFs on the same card merge while preserving every
//     source separately.
//
// TWO MODES:
//   probe_only=true  → reads pages page_start..page_end (default
//     1..4), returns { book_title, total_pages, birhatiah_detected,
//     sample } WITHOUT writing anything. Used to identify which
//     uploaded PDF actually contains the Birhatīya conjuration.
//   probe_only=false → full extraction. Appends per-name content
//     to the matching cards (HNK-MHC-001..028). General whole-
//     conjuration content goes to card #1's complete_birhatiyya_text.
//
// INPUT:
//   pdf_url (required), source_label (e.g. book title), page_start,
//   page_end (0 = whole PDF), probe_only (bool).
//
// ISOLATED — touches ONLY HolyNameEsotericKnowledge.
// ═══════════════════════════════════════════════════════════════

// The 28 Birhatīya names (Arabic + transliteration) for matching.
const NAMES_28 = [
  { id: "HNK-MHC-001", ar: "برهتية", tr: "Birhatya" },
  { id: "HNK-MHC-002", ar: "كريم", tr: "Karīr" },
  { id: "HNK-MHC-003", ar: "تتليه", tr: "Tatlīyah" },
  { id: "HNK-MHC-004", ar: "طوران", tr: "Ṭawrān" },
  { id: "HNK-MHC-005", ar: "مزجل", tr: "Mazjal" },
  { id: "HNK-MHC-006", ar: "بزجل", tr: "Bazjal" },
  { id: "HNK-MHC-007", ar: "ترقب", tr: "Tarqab" },
  { id: "HNK-MHC-008", ar: "برهش", tr: "Barhash" },
  { id: "HNK-MHC-009", ar: "غلمش", tr: "Ghalmash" },
  { id: "HNK-MHC-010", ar: "خوطير", tr: "Khawtayr" },
  { id: "HNK-MHC-011", ar: "قلنهود", tr: "Qalnahuwd" },
  { id: "HNK-MHC-012", ar: "برشان", tr: "Barshān" },
  { id: "HNK-MHC-013", ar: "كظيمر", tr: "Katẓīr" },
  { id: "HNK-MHC-014", ar: "نموشلخ", tr: "Namūshalakh" },
  { id: "HNK-MHC-015", ar: "برهيولا", tr: "Barhayūlā" },
  { id: "HNK-MHC-016", ar: "بشكيلخ", tr: "Bashkīlakh" },
  { id: "HNK-MHC-017", ar: "قزمز", tr: "Qazmaz" },
  { id: "HNK-MHC-018", ar: "انغلليط", tr: "Anghalalīt" },
  { id: "HNK-MHC-019", ar: "قبرات", tr: "Qabarāt" },
  { id: "HNK-MHC-020", ar: "غياها", tr: "Ghayāhā" },
  { id: "HNK-MHC-021", ar: "كيدهولا", tr: "Kaydhūlā" },
  { id: "HNK-MHC-022", ar: "سماخر", tr: "Simākhir" },
  { id: "HNK-MHC-023", ar: "شمحاهيمر", tr: "Shimkhāhīr" },
  { id: "HNK-MHC-024", ar: "شمحاهيمر", tr: "Shimhāhīr" },
  { id: "HNK-MHC-025", ar: "بكهطونيه", tr: "Bakhaṭūnīya" },
  { id: "HNK-MHC-026", ar: "بشارش", tr: "Bashārish" },
  { id: "HNK-MHC-027", ar: "طونش", tr: "Ṭawnish" },
  { id: "HNK-MHC-028", ar: "شمخاباروخ", tr: "Shamkhābārūkh" },
];

const SECTION_FIELDS = [
  "meaning","explanation","origin","research_notes","usage_method",
  "invocation_wazifa","mujarrabat","khawass","amal","magic_square",
  "talisman_image","table","recitations","timing","conditions",
  "benefits","warnings","related_names","related_mantras","related_info",
  "historical_note","scholarly_discussion","servitors","angels",
  "related_books","complete_text","general",
];

// Map the LLM's flat `section` tag → entity advanced-section array field.
const SECTION_TO_FIELD = {
  invocation_wazifa: "invocation_wazifa",
  mujarrabat: "mujarrabat",
  khawass: "khawass",
  amal: "amal",
  magic_square: "related_magic_squares",
  talisman_image: "talisman_images",
  recitations: "number_of_recitations",
  timing: "timing",
  conditions: "conditions",
  benefits: "benefits",
  warnings: "warnings",
  related_names: "cross_references",
  related_mantras: "related_conjurations",
  related_info: "related_books",
  historical_note: "historical_notes",
  scholarly_discussion: "scholarly_discussions",
  servitors: "servitors",
  angels: "angels",
  related_books: "related_books",
  complete_text: "complete_birhatiyya_text",
  general: "complete_birhatiyya_text",
  meaning: "scholarly_discussions",
  explanation: "scholarly_discussions",
  origin: "historical_notes",
  research_notes: "scholarly_discussions",
  usage_method: "amal",
  table: "scholarly_discussions",
};

function stripHarakat(s) {
  return String(s || "").replace(/[\u064B-\u0652\u0670\u0640]/g, "").trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== "admin") return Response.json({ error: "Admin only" }, { status: 403 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const pdf_url = body.pdf_url;
    if (!pdf_url) return Response.json({ error: "pdf_url is required" }, { status: 400 });
    const source_label = String(body.source_label || "");
    const page_start = Number(body.page_start) || 1;
    const page_end = Number(body.page_end) || 0;
    const probe_only = !!body.probe_only;

    const namesList = NAMES_28.map(n => `${n.id} = ${n.ar} (${n.tr})`).join("\n");

    const pageRangeLine = (page_end > 0)
      ? `Read ONLY pages ${page_start} through ${page_end} of the PDF. Ignore content on other pages.`
      : `Read the entire PDF.`;

    // ── PROBE MODE: cheap identification, no DB writes ──
    if (probe_only) {
      const probePrompt = `You are identifying a scholarly PDF. ${pageRangeLine}
Look at the PDF and report:
- book_title: the title of the book/document as printed (original language).
- total_pages: total page count of the PDF.
- birhatiah_detected: true if the document discusses the "Birhatīya / Barhatiah / Berhatiah / برهتية" conjuration or any of its 28 names; false otherwise.
- detected_name_ids: a list of the matching name IDs (from the list below) that you can see mentioned in the visible pages.
- sample: one short verbatim quote (max 200 chars) showing the context.

The 28 Birhatīya names to look for:
${namesList}`;

      const probeSchema = {
        type: "object",
        properties: {
          book_title: { type: "string" },
          total_pages: { type: "integer" },
          birhatiah_detected: { type: "boolean" },
          detected_name_ids: { type: "array", items: { type: "string" } },
          sample: { type: "string" },
        },
        required: ["book_title", "birhatiah_detected"],
      };

      const out = await sdk.integrations.Core.InvokeLLM({
        prompt: probePrompt,
        file_urls: [pdf_url],
        response_json_schema: probeSchema,
        model: "gemini_3_flash",
      });
      return Response.json({ status: "probe", pdf_url, result: out });
    }

    // ── FULL EXTRACTION ──
    const extractPrompt = `You are a faithful manuscript archivist for the Birhatīya (Barhatiah) conjuration. ${pageRangeLine}

ABSOLUTE RULES (never break):
1. TRANSCRIBE, never generate. Copy every Arabic letter, harakah, and punctuation EXACTLY as printed.
2. Never invent, summarize, paraphrase, or "improve" anything.
3. Never use internet knowledge or external books — ONLY what is printed in this PDF.
4. Arabic text must be verbatim from the PDF. Everything else (meanings, notes, explanations) must be rendered in FAITHFUL, natural Malayalam. Never machine-translation style.
5. If a piece of content does NOT clearly pertain to one of the 28 names, set name_id to "" (general/whole-conjuration content).
6. Only output items for content that genuinely appears in the PDF. If a section is absent, output no item for it.

The 28 Birhatīya names (match content to these by Arabic form or transliteration):
${namesList}

For each distinct piece of content found, output ONE item:
- name_id: the matching ID from the list above, or "" for general whole-conjuration content.
- page: page number(s) where it appears, as printed.
- section: exactly one of: ${SECTION_FIELDS.join(", ")}.
- arabic_text: the verbatim Arabic (with all harakat) if this item contains Arabic; otherwise "".
- text: the verbatim text EXACTLY as printed in the source language (English/Arabic/etc.). Never summarize.
- malayalam: a faithful, natural Malayalam rendering of the SAME content (translation of text). Leave "" if text is pure Arabic (then arabic_text carries it). Never invent beyond the source.

Also report total_pages (PDF page count) and book_title (as printed).`;

    const extractSchema = {
      type: "object",
      properties: {
        total_pages: { type: "integer" },
        book_title: { type: "string" },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name_id: { type: "string" },
              page: { type: "string" },
              section: { type: "string" },
              arabic_text: { type: "string" },
              text: { type: "string" },
              malayalam: { type: "string" },
            },
            required: ["name_id", "section", "text"],
          },
        },
      },
      required: ["items"],
    };

    let out;
    try {
      out = await sdk.integrations.Core.InvokeLLM({
        prompt: extractPrompt,
        file_urls: [pdf_url],
        response_json_schema: extractSchema,
        model: "gemini_3_flash",
      });
    } catch (e) {
      return Response.json({ error: "Extraction failed", details: String(e?.message || e) }, { status: 500 });
    }

    const data = (out && typeof out === "object") ? out : {};
    const items = Array.isArray(data.items) ? data.items : [];
    const resolvedSource = source_label || data.book_title || "Section C PDF";
    const now = new Date().toISOString();

    // Load the 28 cards once (by name_id).
    const allCards = await sdk.entities.HolyNameEsotericKnowledge.list("order_index", 60);
    const cardById = {};
    for (const c of (allCards || [])) cardById[c.name_id] = c;
    const card1 = cardById["HNK-MHC-001"];

    // Helper: append-only to an advanced-section array, dedup by (text+source+page).
    const appendSection = (card, fieldName, entry) => {
      if (!entry || !entry.text) return false;
      const arr = Array.isArray(card[fieldName]) ? [...card[fieldName]] : [];
      const key = `${entry.text}||${entry.source_reference}||${entry.source_page}`;
      if (arr.some(e => `${e.text}||${e.source_reference}||${e.source_page}` === key)) return false;
      arr.push(entry);
      card[fieldName] = arr;
      return true;
    };

    // Helper: append-only to scholarly_data, dedup by (verbatim_text+source+page).
    const appendScholarly = (card, entry) => {
      const arr = Array.isArray(card.scholarly_data) ? [...card.scholarly_data] : [];
      const key = `${entry.verbatim_text}||${entry.source_reference}||${entry.source_page}`;
      if (arr.some(e => `${e.verbatim_text}||${e.source_reference}||${e.source_page}` === key)) return false;
      arr.push(entry);
      card.scholarly_data = arr;
      return true;
    };

    // Tally changes per card.
    const changed = {}; // name_id -> { sections: {}, scholarly: n }
    let generalCount = 0;

    for (const it of items) {
      const nid = String(it.name_id || "").trim();
      const section = String(it.section || "general").trim();
      const field = SECTION_TO_FIELD[section] || "complete_birhatiyya_text";
      const arabic = String(it.arabic_text || "").trim();
      const text = String(it.text || "").trim();
      const ml = String(it.malayalam || "").trim();
      const page = String(it.page || "").trim();
      if (!text && !arabic) continue;

      // General content → card #1 only (whole conjuration).
      let card;
      if (nid && cardById[nid]) card = cardById[nid];
      else if (card1) { card = card1; generalCount++; }
      if (!card) continue;

      const sourceRef = resolvedSource;
      const entry = { text: arabic || text, source_reference: sourceRef, source_page: page };

      const changedEntry = changed[card.name_id] || { sections: {}, scholarly: 0 };
      if (appendSection(card, field, entry)) {
        changedEntry.sections[field] = (changedEntry.sections[field] || 0) + 1;
      }
      // Also append to scholarly_data (verbatim record + Malayalam).
      const sch = {
        source_reference: sourceRef,
        source_page: page,
        verbatim_text: text,
        exact_meaning: ml,
        arabic_text: arabic,
        transliteration: "",
        notes: `Section: ${section}`,
        imported_at: now,
      };
      if (appendScholarly(card, sch)) changedEntry.scholarly++;
      changed[card.name_id] = changedEntry;
    }

    // Persist updates (one update per changed card).
    const updatedCards = [];
    for (const nid of Object.keys(changed)) {
      const c = cardById[nid];
      if (!c) continue;
      const update = {
        scholarly_data: c.scholarly_data,
        sources: Array.isArray(c.sources) ? c.sources : [],
      };
      for (const f of Object.keys(changed[nid].sections)) update[f] = c[f];
      // Ensure the source is recorded in the sources[] list (append-only, dedup by reference+page).
      const srcList = Array.isArray(update.sources) ? [...update.sources] : [];
      const srcKey = `${resolvedSource}`;
      if (!srcList.some(s => (s.reference || "") === srcKey)) {
        srcList.push({ reference: resolvedSource, page: "", imported_at: now, notes: "Section C ingestion" });
        update.sources = srcList;
      }
      await sdk.entities.HolyNameEsotericKnowledge.update(c.id, update);
      updatedCards.push(nid);
    }

    const sectionCounts = {};
    for (const nid of Object.keys(changed)) {
      sectionCounts[nid] = changed[nid];
    }

    return Response.json({
      status: "ok",
      pdf_url,
      source_label: resolvedSource,
      total_pages: Number(data.total_pages) || 0,
      items_extracted: items.length,
      general_items: generalCount,
      cards_updated: updatedCards,
      section_counts: sectionCounts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});