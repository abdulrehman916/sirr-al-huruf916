import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// seedHolyOneNamesFromContents — build Section B cards from a PDF's
// Table of Contents (المحتويات / الفهرس). Admin-only.
// ═══════════════════════════════════════════════════════════════
// Reads the Contents page(s) (image screenshots or a PDF) with a vision
// LLM and transcribes EVERY Holy Name entry VERBATIM — the exact Arabic
// text as printed, including the "اسمه"/"اسم" prefix and all honorifics.
// Surah headings (سورة ...) are GROUP LABELS, not names: they set the
// surah_name for the names that follow.
//
// Creates ONE HolyOnePDFName record per name, with:
//   • arabic_name        — verbatim from the Contents (never renamed/
//                          normalized/translated/skipped)
//   • surah_name         — the Surah heading preceding it
//   • source_pdf_page    — the page number printed beside the name
//   • source_pdf_file    — the label the admin provides
//   • global_order       — sequential across all Section B names
//   • meaning/explanation — EMPTY (no AI-generated content; all real
//                          content arrives later via importHolyNamesPDF,
//                          which appends HolyNameImportedSection records)
//
// Idempotent: re-running on the same Contents skips names that already
// exist (matched by exact arabic_name + source_pdf_file). Future PDF
// imports append to the matching card without overwriting.
//
// Affects ONLY Section B (HolyOnePDFName). Section A is untouched.
// ═══════════════════════════════════════════════════════════════

function parsePageNumber(s: any): number {
  if (typeof s === "number") return s;
  if (!s) return 0;
  const map: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
    "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
    "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };
  let out = "";
  for (const ch of String(s)) out += map[ch] ?? ch;
  const n = parseInt(out.replace(/[^\d]/g, ""), 10);
  return isNaN(n) ? 0 : n;
}

function normalizeArabic(s: string): string {
  if (!s) return "";
  return String(s)
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Honorific phrases that follow the core divine name (e.g. "تبارك وتعالى",
// "سبحانه", "جلّ وعلا"). The first token after the core name that is one of
// these marks where the core ends — used to extract the CORE Holy Name for
// master-database dedup, so the same Name from different PDFs (printed with
// different honorifics) maps to ONE card.
const HONORIFIC_STARTERS = new Set([
  "تبارك", "سبحانه", "سبحان", "سبحانة", "جل", "عز", "تعالى", "تعالي",
  "عمت", "عم", "شمل", "شملت", "دام", "اليه", "تقدس", "عزت", "جلت", "به",
]);

function coreKeyOf(arabic_name: string): string {
  let s = normalizeArabic(arabic_name);
  // Unify hamza forms for dedup (أ/إ/آ → ا, ء removed, ؤ → و, ئ → ي)
  s = s.replace(/[\u0622\u0623\u0625]/g, "\u0627").replace(/\u0621/g, "").replace(/\u0624/g, "\u0648").replace(/\u0626/g, "\u064A");
  // Strip the leading "اسمه"/"اسم" prefix (the framing, not the name)
  s = s.replace(/^اسمه\s+/, "").replace(/^اسم\s+/, "");
  const tokens = s.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "";
  // "ذو X" names are two-word cores (ذو الفضل, ذو الجلال, ذو المعارج, ذو الطول, ذو العرش)
  if (tokens[0] === "ذو" && tokens.length >= 2) return "ذو " + tokens[1];
  // If the 2nd token is an honorific starter, the core is just the 1st token
  if (tokens.length >= 2 && HONORIFIC_STARTERS.has(tokens[1])) return tokens[0];
  // Otherwise the core is the first two tokens (الشديد العذاب, الإله الواحد, السريع الحساب)
  if (tokens.length >= 2) return tokens[0] + " " + tokens[1];
  return tokens[0];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const body = await req.json();
    const file_urls: string[] = Array.isArray(body?.file_urls)
      ? body.file_urls.filter((u: any) => typeof u === "string" && u)
      : [];
    const source_pdf_file = String(body?.source_pdf_file || "contents");
    if (file_urls.length === 0) {
      return Response.json({ error: "file_urls required (Contents page images or PDF)" }, { status: 400 });
    }

    // ── Transcribe the Contents verbatim via vision LLM ──
    const res: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a FAITHFUL TRANSCRIBER of an Arabic manuscript's Table of Contents (المحتويات / الفهرس). Read the attached Contents page(s) and output an ORDERED list of every Holy Name entry exactly as printed.

STRICT RULES:
- For EACH line that is a Holy Name entry (typically beginning with "اسم" or "اسمه" followed by a name of Allah and optional honorifics such as "تبارك وتعالى", "سبحانه", "جلّ وعلا", "تعالى", "عزّ وجلّ"), output ONE entry with:
  - arabic_name: the EXACT text of that name line, VERBATIM, including the "اسمه"/"اسم" prefix and ALL honorifics exactly as printed. Do NOT rename, normalize, translate, transliterate, or skip any word.
  - page_number: the page number printed beside that name line, exactly as shown (any numeral system).
  - surah_name: the most recent Surah heading (a line beginning with "سورة ...") that precedes this name. Empty string if none.
- Surah headings themselves (lines beginning with "سورة") are GROUP LABELS, NOT names — do NOT output them as entries; only use them as the surah_name for the names that follow.
- Ignore the page header "المحتويات", page footers, standalone roman/numeric page numbers with no name, and any UI chrome.
- Preserve the EXACT original printed order top-to-bottom across all pages.
- Do NOT invent, guess, merge, or split names. If a line is ambiguous, still transcribe it verbatim.
- Return ONLY a JSON object: {"names": [{"arabic_name": "<verbatim>", "page_number": "<as printed>", "surah_name": "<surah or empty>"}]}`,
      file_urls,
      response_json_schema: {
        type: "object",
        properties: {
          names: {
            type: "array",
            items: {
              type: "object",
              properties: {
                arabic_name: { type: "string" },
                page_number: { type: "string" },
                surah_name: { type: "string" },
              },
              required: ["arabic_name"],
            },
          },
        },
      },
    });

    const extracted: any[] = Array.isArray(res?.names) ? res.names : [];
    if (extracted.length === 0) {
      return Response.json({ error: "No Holy Names found in the Contents pages." }, { status: 400 });
    }

    // ── Dedup against existing Section B names + compute next global_order ──
    const existing = await base44.asServiceRole.entities.HolyOnePDFName.list(null, 1000);
    // Master dedup key: the CORE Holy Name (prefix stripped, harakat + hamza
    // insensitive, honorifics ignored) across ALL PDFs. A Holy Name is a
    // permanent master record — re-appearing in a new PDF's Contents (even
    // with different honorifics like "تبارك وتعالى" vs "سبحانه") does NOT
    // create a new card; the new PDF's content appends to the existing card.
    const existKeys = new Set<string>();
    let maxOrder = 0;
    for (const r of existing || []) {
      existKeys.add(coreKeyOf(String(r.arabic_name || "")));
      const o = Number(r.global_order || 0);
      if (o > maxOrder) maxOrder = o;
    }

    const toCreate: any[] = [];
    let skipped = 0;
    let order = maxOrder;
    for (const n of extracted) {
      const arabic_name = String(n?.arabic_name || "").trim();
      if (!arabic_name) continue;
      const normKey = coreKeyOf(arabic_name);
      if (normKey && existKeys.has(normKey)) { skipped++; continue; } // exists — content will append to the existing card
      if (normKey) existKeys.add(normKey);
      order += 1;
      toCreate.push({
        pdf_name_id: "PDF-HN-" + String(order).padStart(4, "0"),
        surah_name: String(n?.surah_name || "").trim(),
        arabic_name,
        arabic_transliteration: "",
        malayalam_pronunciation: "",
        meaning_malayalam: "",
        source_pdf_page: parsePageNumber(n?.page_number),
        source_pdf_file,
        global_order: order,
        verification_status: "pending",
        is_favorite: false,
        view_count: 0,
        archived: false,
      });
    }

    let created = 0;
    if (toCreate.length > 0) {
      const r: any = await base44.asServiceRole.entities.HolyOnePDFName.bulkCreate(toCreate);
      created = Array.isArray(r) ? r.length : (r?.length || 0);
    }

    return Response.json({
      status: "ok",
      source_pdf_file,
      pages_sent: file_urls.length,
      names_transcribed: extracted.length,
      created,
      skipped_duplicates: skipped,
      total_in_db: (existing?.length || 0) + created,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});