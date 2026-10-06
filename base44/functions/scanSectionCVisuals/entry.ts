import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// scanSectionCVisuals — Section C Visual Content Scanner
//
// Sends a source PDF to the vision LLM (Gemini 3 Flash) and
// identifies EVERY page that contains visual content related to
// the Birhatīya (Barhatiah) conjuration:
//   - Magic Squares (Wafq / Awfaq)
//   - Tables
//   - Symbols
//   - Seals
//   - Diagrams
//   - Geometric drawings
//   - Grids
//   - Handwritten figures
//   - Any visual illustration
//
// For each identified visual, reports:
//   - page_number (in the PDF)
//   - name_id (which of the 28 Birhatīya names it relates to, or "" for general)
//   - visual_type (magic_square / wafq / table / symbol / seal / diagram / figure / grid / handwritten_chart / other)
//   - description (brief description of the visual content)
//
// This function ONLY scans — it does NOT render or upload images.
// The frontend SectionCVisualIntegrator renders the identified
// pages (using browser-side pdfjs-dist), uploads them, and calls
// attachSectionCVisual to persist the image URLs.
//
// RULES:
//   - Admin/Owner only
//   - Never fabricate visuals — only report what is actually visible
//   - Never overwrite existing data
//   - Match visuals to the correct Birhatīya name by context
//
// INPUT:
//   pdf_url (required) — URL of the source PDF
//   source_label (optional) — book title for citation
//   page_start, page_end (optional) — page range to scan (0 = whole PDF)
//
// ISOLATED — reads ONLY from HolyNameEsotericKnowledge for matching.
// ═══════════════════════════════════════════════════════════════

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

const VISUAL_TYPES = [
  "magic_square", "wafq", "table", "symbol", "seal",
  "diagram", "figure", "grid", "handwritten_chart", "other",
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || (user.role !== "admin" && user.role !== "owner")) {
      return Response.json({ error: "Admin/Owner only" }, { status: 403 });
    }
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const pdf_url = String(body.pdf_url || "").trim();
    if (!pdf_url) return Response.json({ error: "pdf_url is required" }, { status: 400 });
    const source_label = String(body.source_label || "");
    const page_start = Number(body.page_start) || 1;
    const page_end = Number(body.page_end) || 0;

    const namesList = NAMES_28.map((n) => `${n.id} = ${n.ar} (${n.tr})`).join("\n");
    const pageRangeLine = page_end > 0
      ? `Scan ONLY pages ${page_start} through ${page_end} of the PDF. Ignore all other pages.`
      : `Scan the ENTIRE PDF, every page.`;

    const prompt = `You are a meticulous manuscript archivist scanning a scholarly PDF for VISUAL CONTENT related to the Birhatīya (Barhatiah / برهتية) conjuration oath.

${pageRangeLine}

For EVERY page, carefully examine it for VISUAL CONTENT. Visual content includes ANY of these:
- Magic Square (Wafq / Awfaq — a grid of letters or numbers, typically 3x3, 4x4, 5x5, etc.)
- Wafq (letter grid / magic square variant)
- Table (structured rows and columns of text or data)
- Symbol (a drawn symbol, sigil, or mark)
- Seal (Khatam — a circular or geometric seal design)
- Diagram (any explanatory diagram or schematic)
- Figure (a drawn figure or illustration)
- Grid (any grid layout — letters, numbers, or symbols)
- Handwritten chart (handwritten numerical or letter chart)
- Any other visual illustration, drawing, or mark

The 28 Birhatīya names to match visuals to:
${namesList}

For EACH page that contains visual content, output ONE item:
- page_number: the PDF page number (1-based) where the visual appears
- name_id: the matching Birhatīya name ID from the list above. Use "" (empty string) if the visual is general/whole-conjuration content not specific to one name.
- visual_type: exactly one of: ${VISUAL_TYPES.join(", ")}
- description: a brief description of the visual content (what it shows, e.g. "3x3 magic square with Arabic letters for the name Birhatya", "circular seal with the name Karir in the center", "table of Abjad values for all 28 names")

ABSOLUTE RULES:
1. ONLY report visuals that are ACTUALLY VISIBLE on the page. Never fabricate or guess.
2. If a page has NO visual content (only text), do NOT output an item for it.
3. If a page has MULTIPLE distinct visuals, output ONE item per distinct visual (they can share the same page_number).
4. Match each visual to the correct Birhatīya name by examining the surrounding text context (headings, labels, chapter titles).
5. If you cannot determine which name a visual relates to, set name_id to "" and describe it as general.

Also report:
- total_pages: total page count of the PDF
- book_title: the title of the book/document as printed`;

    const schema = {
      type: "object",
      properties: {
        total_pages: { type: "integer" },
        book_title: { type: "string" },
        visuals: {
          type: "array",
          items: {
            type: "object",
            properties: {
              page_number: { type: "integer" },
              name_id: { type: "string" },
              visual_type: { type: "string" },
              description: { type: "string" },
            },
            required: ["page_number", "visual_type", "description"],
          },
        },
      },
      required: ["visuals"],
    };

    let out;
    try {
      out = await sdk.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [pdf_url],
        response_json_schema: schema,
        model: "gemini_3_flash",
      });
    } catch (e) {
      return Response.json({ error: "Scan LLM call failed", details: String(e?.message || e) }, { status: 500 });
    }

    const data = out && typeof out === "object" ? out : {};
    const visuals = Array.isArray(data.visuals) ? data.visuals : [];
    const resolvedSource = source_label || data.book_title || "Section C PDF";

    // Validate and filter
    const validVisuals = visuals.filter((v) => {
      const pn = Number(v.page_number);
      return pn > 0 && v.visual_type && v.description;
    }).map((v) => ({
      page_number: Number(v.page_number),
      name_id: String(v.name_id || "").trim(),
      visual_type: VISUAL_TYPES.includes(v.visual_type) ? v.visual_type : "other",
      description: String(v.description || "").trim(),
    }));

    // Group by page for summary
    const byPage = {};
    for (const v of validVisuals) {
      const key = v.page_number;
      if (!byPage[key]) byPage[key] = [];
      byPage[key].push(v);
    }

    return Response.json({
      status: "scan_complete",
      pdf_url,
      source_label: resolvedSource,
      total_pages: Number(data.total_pages) || 0,
      book_title: data.book_title || "",
      total_visuals_found: validVisuals.length,
      pages_with_visuals: Object.keys(byPage).length,
      visuals: validVisuals,
      by_page: byPage,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
// Scan PDF for visual content — identifies pages with magic squares, wafq, tables, symbols, seals, diagrams.