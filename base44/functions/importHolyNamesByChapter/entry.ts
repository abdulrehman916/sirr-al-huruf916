import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";
import { extractText, getDocumentProxy } from "npm:unpdf@1.6.2";

// ═══════════════════════════════════════════════════════════════
// importHolyNamesByChapter — CHAPTER-BASED Section B importer.
// ═══════════════════════════════════════════════════════════════
// Isolated to the Holy Names module. Does NOT touch importHolyNamesPDF
// or Section A. Admin-only.
//
// Logic (per the Owner's chapter-based rule):
//   1. The caller sends the PDF's per-page text (`pages`) and the
//      book's own ordered Table-of-Contents headings (`chapter_headings`).
//   2. Each Section B card (HolyOnePDFName) is normalized to a core
//      Name (harakat/hamza/letter-forms stripped, "اسمه" prefix and
//      honorifics removed).
//   3. The function locates every chapter heading in the body text IN
//      TOC ORDER (advancing a cursor past each found heading), so a
//      Name referenced in prose before its own chapter is not mis-bound.
//   4. For each "اسمه X" heading:
//        • Match X to an existing card by core. If matched → APPEND to
//          that card (never overwrite).
//        • If no existing card represents that chapter → CREATE a new
//          Section B card (the only time a new card is made).
//        • The chapter content = everything from just after the heading
//          phrase (including its honorific) until the NEXT chapter
//          heading — every paragraph, Qur'an verse, Hadith, explanation,
//          benefit, warning, table, image, reference. Stored VERBATIM as
//          one HolyNameImportedSection record per chapter (nothing
//          skipped, order preserved).
//   5. Surah labels ("سورة X") and "مقدمة" are separators only — they
//      end the previous chapter but never create a card.
//   6. Duplicate chapters are skipped by content_hash. Existing records
//      are never deleted or overwritten.
//   7. Malayalam translation is generated in a separate `mode:"translate"`
//      pass (faithful, verbatim meaning, batched + time-boxed).
//
// Affects ONLY Section B (HolyOnePDFName + HolyNameImportedSection).
// ═══════════════════════════════════════════════════════════════

// ── Normalization (shared with seed/import logic) ──
function stripHarakat(s: string): string {
  return String(s).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "");
}
function normHamza(s: string): string {
  return s.replace(/[\u0622\u0623\u0625]/g, "\u0627").replace(/\u0621/g, "").replace(/\u0624/g, "\u0648").replace(/\u0626/g, "\u064A");
}
function normForms(s: string): string {
  return s.replace(/\u0649/g, "\u064A").replace(/\u0629/g, "\u0647");
}
// Honorific tokens that follow the core Name in a heading (e.g. "اسمه الرحمن عز وجل").
const HONORIFIC = new Set([
  "تبارك", "وتعالى", "تعالى", "وتعالي", "تعالي", "عز", "وجل", "جل", "وعلا",
  "سبحانه", "سبحان", "قدسه", "جلت", "قدرته", "شأنه", "وتقدس", "شانه", "عمت", "عم",
]);
// Strip honorifics FROM A NORMALIZED (no-harakat) token stream.
function stripHonorificTokens(tokens: string[]): string[] {
  const out: string[] = [];
  for (const t of tokens) {
    if (!t) continue;
    if (HONORIFIC.has(t)) continue;
    out.push(t);
  }
  return out;
}
function normalizeWithMap(raw: string): { norm: string; map: number[] } {
  // Build normalized string + index map (normIdx -> rawIdx of the raw char that produced it).
  // Collapses any run of whitespace (space/newline/tab) into a single space so probes
  // with single spaces match regardless of how the PDF text layer separated lines.
  let norm = "";
  const map: number[] = [];
  let lastWasSpace = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    // harakat / tatweel / zero-width → removed, no map entry
    if (/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u200B-\u200F\u202A-\u202E\uFEFF]/.test(ch)) continue;
    let mapped = ch;
    if (/\s/.test(ch)) {
      // collapse any whitespace to a single space (map to first whitespace index in the run)
      if (lastWasSpace) continue;
      mapped = " ";
      lastWasSpace = true;
      norm += mapped;
      map.push(i);
      continue;
    }
    lastWasSpace = false;
    if (ch === "\u0622" || ch === "\u0623" || ch === "\u0625") mapped = "\u0627";
    else if (ch === "\u0621") { continue; }
    else if (ch === "\u0624") mapped = "\u0648";
    else if (ch === "\u0626") mapped = "\u064A";
    else if (ch === "\u0649") mapped = "\u064A";
    else if (ch === "\u0629") mapped = "\u0647";
    norm += mapped;
    map.push(i);
  }
  return { norm, map };
}
function coreOfHeading(h: string): string {
  // For a TOC heading like "اسمه الرحمن عز وجل" → core "الرحمن" (no harakat, no honorifics, no اسمه prefix)
  let x = stripHarakat(h);
  x = normHamza(x);
  x = normForms(x);
  x = x.replace(/^اسمه\s+/, "").replace(/^اسم\s+/, "");
  const toks = x.split(/\s+/).filter(Boolean);
  const kept = stripHonorificTokens(toks);
  return kept.join(" ").trim();
}
function isSurahLabel(h: string): boolean {
  const x = stripHarakat(h).trim();
  return x.startsWith("سورة") || x.startsWith("سوره");
}
function isIntro(h: string): boolean {
  return stripHarakat(h).trim() === "مقدمة" || stripHarakat(h).trim() === "مقدمه";
}

function detectLang(text: string): string {
  const hasAr = /[\u0600-\u06FF]/.test(text);
  const hasMl = /[\u0D00-\u0D7F]/.test(text);
  if (hasAr && hasMl) return "mixed";
  if (hasMl) return "ml";
  if (hasAr) return "ar";
  return "en";
}
async function sha256(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden — admin only" }, { status: 403 });

    const body = await req.json();
    const mode = String(body?.mode || "import");
    const import_batch = String(body?.import_batch || "HNC-" + Date.now());
    const source_pdf_file = String(body?.source_pdf_file || "");
    const source_pdf_url = String(body?.source_pdf_url || "");
    const now = new Date().toISOString();

    // ─────────────────────────────────────────────────────────────
    // MODE: translate — generate faithful Malayalam for existing records
    // ─────────────────────────────────────────────────────────────
    if (mode === "translate") {
      const limit = Number(body?.translate_limit || 30);
      const timeBudgetMs = Number(body?.time_budget_ms || 85000);
      const startedAt = Date.now();
      // Records from this batch (or all section_b) with arabic but no malayalam
      const filter: any = { source_section: "section_b" };
      if (body?.import_batch) filter.import_batch = import_batch;
      const recs = await base44.asServiceRole.entities.HolyNameImportedSection.filter(filter, null, 500);
      const need = (recs || []).filter((r: any) => r.arabic_text && r.arabic_text.trim() && !(r.malayalam_translation || "").trim());
      let translated = 0;
      let idx = 0;
      const CHUNK = 1800;
      // split a long Arabic chapter into <=CHUNK pieces at newline boundaries,
      // translate each chunk faithfully, then merge all chunks back into the
      // SAME card record — nothing truncated, nothing lost.
      const chunkText = (s: string): string[] => {
        const parts: string[] = [];
        let cur = "";
        for (const ln of String(s || "").split("\n")) {
          if ((cur ? cur + "\n" + ln : ln).length > CHUNK && cur) { parts.push(cur); cur = ln; }
          else cur = cur ? cur + "\n" + ln : ln;
        }
        if (cur) parts.push(cur);
        return parts;
      };
      while (idx < need.length && translated < limit && (Date.now() - startedAt) < timeBudgetMs) {
        const rec = need[idx]; idx++;
        const chunks = chunkText(String(rec.arabic_text || ""));
        let mlFull = "";
        let allOk = true;
        for (let ci = 0; ci < chunks.length; ci++) {
          if ((Date.now() - startedAt) >= timeBudgetMs) { allOk = false; break; }
          try {
            const trRes: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: `You are a FAITHFUL Arabic-to-Malayalam translator. Translate the Arabic text below into faithful, literal Malayalam that preserves the EXACT meaning — nothing more, nothing less.

STRICT RULES:
- Translate ONLY the Arabic text provided.
- Output ONLY the Malayalam translation in Malayalam script.
- Do NOT summarize, paraphrase, explain, add commentary, or skip any part.
- Preserve Qur'an verses, Hadith, Names of God/angels/prophets, repetition counts, and ritual instructions exactly.
- This is chunk ${ci + 1} of ${chunks.length} of one chapter; translate it fully and faithfully.

Arabic text (chunk ${ci + 1}/${chunks.length}):
${chunks[ci]}`,
              response_json_schema: { type: "object", properties: { malayalam: { type: "string" } }, required: ["malayalam"] },
            });
            const ml = String((trRes && trRes.malayalam) || "").trim();
            if (ml) mlFull += (mlFull ? "\n" : "") + ml; else allOk = false;
          } catch { allOk = false; }
        }
        if (mlFull.trim() && allOk) {
          await base44.asServiceRole.entities.HolyNameImportedSection.update(rec.id, { malayalam_translation: mlFull });
          translated++;
        }
      }
      return Response.json({
        status: "ok",
        mode: "translate",
        records_needing_translation: need.length,
        translated_this_call: translated,
        remaining: Math.max(0, need.length - translated),
        time_elapsed_ms: Date.now() - startedAt,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // MODE: import — chapter-based Section B import
    // ─────────────────────────────────────────────────────────────
    const pages: any[] = Array.isArray(body?.pages) ? body.pages : [];
    const chapter_headings: string[] = Array.isArray(body?.chapter_headings) ? body.chapter_headings : [];
    const pageImagesMap = new Map<number, { image_url: string; has_visual: boolean }>();
    for (const pi of Array.isArray(body?.page_images) ? body.page_images : []) {
      const pn = Number(pi?.page_number) || 0;
      if (pn && pi?.image_url) pageImagesMap.set(pn, { image_url: String(pi.image_url), has_visual: pi?.has_visual !== false });
    }

    // ── CACHE MODE: read the ONE-TIME permanent transcription cache.
    //   No vision, no re-extraction — fully deterministic. TOC pages
    //   (is_toc=true) are excluded, so chapter detection runs only on
    //   real body pages. This is the deterministic import path. ──
    if (mode === "import_cached" && source_pdf_file) {
      const cached: any[] = await base44.asServiceRole.entities.HolyNameTranscriptionCache.filter({ source_pdf_file }, null, 2000);
      const sorted = (cached || []).filter((c: any) => !c.is_toc).sort((a: any, b: any) => (a.page_number || 0) - (b.page_number || 0));
      for (const c of sorted) pages.push({ page_number: Number(c.page_number) || 0, text: String(c.page_text || "") });
    }
    // ── Self-extraction via VISION (ExtractDataFromUploadedFile) for a page range.
    //   Used when the PDF's text layer is custom-encoded (pdfjs returns garbled
    //   Arabic); the vision model reads the rendered pages cleanly. ──
    if (pages.length === 0 && body?.vision_page_range && source_pdf_url) {
      const vr = body.vision_page_range;
      const ps = Number(vr?.start) || 1;
      const pe = Number(vr?.end) || ps;
      try {
        const vis: any = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
          file_url: source_pdf_url,
          json_schema: {
            type: "object",
            properties: {
              pages: {
                type: "array",
                items: {
                  type: "object",
                  properties: { page_number: { type: "integer" }, text: { type: "string" } },
                  required: ["page_number", "text"],
                },
                description: `Verbatim text content of pages ${ps} through ${pe} of the PDF, one entry per page, in order. Transcribe ALL Arabic text exactly as printed (every letter, harakat, verse, paragraph). Do not summarize or skip anything.`,
              },
            },
            required: ["pages"],
          },
        });
        const arr = Array.isArray(vis?.output?.pages) ? vis.output.pages : (Array.isArray(vis?.pages) ? vis.pages : []);
        for (const p of arr) {
          pages.push({ page_number: Number(p?.page_number) || 0, text: String(p?.text || "") });
        }
      } catch (e) {
        return Response.json({ error: "vision page extraction failed: " + (e?.message || String(e)) }, { status: 500 });
      }
    }

    // ── Self-extraction: if the caller did not supply per-page text, fetch +
    //   extract it server-side via unpdf (Deno-friendly pdfjs). ──
    if (pages.length === 0 && source_pdf_url) {
      const resp = await fetch(source_pdf_url);
      if (!resp.ok) return Response.json({ error: "Failed to fetch source PDF: " + resp.status }, { status: 502 });
      const buf = new Uint8Array(await resp.arrayBuffer());
      try {
        const pdf = await getDocumentProxy(buf);
        const { totalPages, text } = await extractText(pdf, { mergePages: false });
        for (let i = 0; i < (text || []).length; i++) {
          pages.push({ page_number: i + 1, text: String(text[i] || "") });
        }
        void totalPages;
      } catch (e) {
        return Response.json({ error: "unpdf extraction failed: " + (e?.message || String(e)) }, { status: 500 });
      }
    }
    // ── Self-extraction: if the caller did not supply the TOC headings,
    //   extract them from the PDF via the vision/LLM extractor. ──
    if (mode !== "import_cached" && chapter_headings.length === 0 && source_pdf_url) {
      try {
        const toc: any = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
          file_url: source_pdf_url,
          json_schema: {
            type: "object",
            properties: {
              all_chapter_headings: {
                type: "array",
                items: { type: "string" },
                description: "Complete ordered list of every chapter/section heading in the book's Table of Contents (المحتويات), verbatim Arabic, including surah labels (سورة X) and the 'اسمه X' name headings and 'مقدمة'.",
              },
            },
            required: ["all_chapter_headings"],
          },
        });
        const arr = Array.isArray(toc?.output?.all_chapter_headings) ? toc.output.all_chapter_headings : (Array.isArray(toc?.all_chapter_headings) ? toc.all_chapter_headings : []);
        for (const h of arr) chapter_headings.push(String(h || "").trim());
      } catch (e) {
        return Response.json({ error: "TOC extraction failed: " + (e?.message || String(e)) }, { status: 500 });
      }
    }
    if (pages.length === 0) return Response.json({ error: "pages (per-page text) required" }, { status: 400 });
    if (chapter_headings.length === 0 && mode !== "import_cached") return Response.json({ error: "chapter_headings (ordered TOC) required" }, { status: 400 });

    // ── 1. Build Section B card matchers ──
    const existingCards: any[] = await base44.asServiceRole.entities.HolyOnePDFName.list(null, 1000);
    const cardByCore = new Map<string, any>();       // normalized core -> card
    const cardByCoreNoAl = new Map<string, any>();   // core without leading ال -> card
    let maxOrder = 0;
    for (const c of existingCards || []) {
      const core = coreOfHeading(String(c.arabic_name || ""));
      if (!core) continue;
      if (!cardByCore.has(core)) cardByCore.set(core, c);
      const noAl = core.replace(/^ال/, "");
      if (noAl && noAl.length >= 3 && !cardByCoreNoAl.has(noAl)) cardByCoreNoAl.set(noAl, c);
      const o = Number(c.global_order || 0);
      if (o > maxOrder) maxOrder = o;
    }

    // ── 2. Build body text + normalized map + page boundaries ──
    let bodyRaw = "";
    const pageBounds: { page_number: number; start: number; end: number }[] = [];
    for (const p of pages) {
      const t = String(p?.text || "");
      const start = bodyRaw.length;
      bodyRaw += t + "\n";
      pageBounds.push({ page_number: Number(p?.page_number) || 0, start, end: bodyRaw.length });
    }
    const { norm: bodyNorm, map: normToRaw } = normalizeWithMap(bodyRaw);

    if (body?.debug) {
      const idx = bodyNorm.indexOf("اسمه");
      const probes = chapter_headings.slice(0, 8).map((h: string) => "اسمه " + coreOfHeading(h));
      return Response.json({
        pages_count: pages.length,
        sample_p100: String(pages[99]?.text || "").slice(0, 600),
        bodyNorm_len: bodyNorm.length,
        first_ismeh_idx: idx,
        bodyNorm_around_ismeh: idx >= 0 ? bodyNorm.slice(Math.max(0, idx - 20), idx + 80) : "(اسمه not found)",
        bodyNorm_sample_start: bodyNorm.slice(0, 300),
        first_8_headings: chapter_headings.slice(0, 8),
        first_8_cores: chapter_headings.slice(0, 8).map((h: string) => coreOfHeading(h)),
        first_8_probes: probes,
        probe_results: probes.map((p: string) => bodyNorm.indexOf(p)),
      });
    }

    // page lookup by raw index
    const pageOf = (rawIdx: number): number => {
      for (let i = 0; i < pageBounds.length; i++) {
        if (rawIdx < pageBounds[i].end) return pageBounds[i].page_number;
      }
      return pageBounds.length ? pageBounds[pageBounds.length - 1].page_number : 0;
    };

    // ── 2b. TOC-skip: the book's first pages are a Table of Contents that
    //   lists every "اسمه X" name packed close together (gaps < ~100 chars).
    //   Binding to TOC entries produces tiny fake "chapters". The first real
    //   chapter heading is the first "اسمه" whose gap to the NEXT "اسمه" is
    //   >= MIN_CHAPTER_GAP (real chapters span hundreds+ chars). Start the
    //   cursor there so every heading binds to its real chapter, not the TOC.
    const MIN_CHAPTER_GAP = 200;
    let contentStartNorm = 0;
    {
      const positions: number[] = [];
      let from = 0;
      while (true) {
        const i = bodyNorm.indexOf("اسمه", from);
        if (i === -1) break;
        positions.push(i);
        from = i + 4;
      }
      for (let k = 0; k < positions.length - 1; k++) {
        if (positions[k + 1] - positions[k] >= MIN_CHAPTER_GAP) { contentStartNorm = positions[k]; break; }
      }
    }

    // ── 3. Body-driven heading detection (robust, no ordered search) ──
    // Scan the body (after TOC-skip) for actual "اسمه X" HEADING LINES and
    // separator lines (سورة / مقدمة). A line is a heading only if "اسمه"
    // sits at the START of a line (preceded by a newline), never mid-sentence
    // — so a Name mentioned in prose is never mistaken for a chapter start.
    // Each اسمه heading → one chapter; content runs from just after the
    // heading line until the NEXT heading/separator line. This binds to real
    // chapter headings in the body with no fragile ordered search.
    type Pos = { kind: "name" | "sep"; normPos: number; headingOrig: string; core: string; contentStartRaw: number; page: number };
    const positions: Pos[] = [];
    const atLineStart = (rawStart: number): boolean => {
      if (rawStart === 0) return true;
      let p = rawStart - 1;
      while (p >= 0 && (bodyRaw[p] === " " || bodyRaw[p] === "\t")) p--;
      return p < 0 || bodyRaw[p] === "\n";
    };
    // 3a. All "اسمه" heading lines after contentStart
    {
      let from = contentStartNorm;
      while (true) {
        const i = bodyNorm.indexOf("اسمه", from);
        if (i === -1) break;
        from = i + 4;
        const rawStart = normToRaw[i] ?? 0;
        if (!atLineStart(rawStart)) continue; // mid-sentence mention → not a heading
        let nl = bodyRaw.indexOf("\n", rawStart);
        if (nl === -1) nl = bodyRaw.length;
        const headingLine = bodyRaw.slice(rawStart, nl).trim();
        const core = coreOfHeading(headingLine);
        if (!core || core.length < 2) continue;
        positions.push({ kind: "name", normPos: i, headingOrig: headingLine, core, contentStartRaw: nl + 1 <= bodyRaw.length ? nl + 1 : bodyRaw.length, page: pageOf(rawStart) });
      }
    }
    // 3b. Separator lines (سورة X / مقدمة) after contentStart
    {
      let from = contentStartNorm;
      while (true) {
        const s = bodyNorm.indexOf("سورة", from);
        if (s === -1) break;
        from = s + 5;
        const rawStart = normToRaw[s] ?? 0;
        if (!atLineStart(rawStart)) continue;
        let nl = bodyRaw.indexOf("\n", rawStart);
        if (nl === -1) nl = bodyRaw.length;
        const line = bodyRaw.slice(rawStart, nl).trim();
        if (isSurahLabel(line)) positions.push({ kind: "sep", normPos: s, headingOrig: line, core: "", contentStartRaw: nl + 1, page: pageOf(rawStart) });
      }
      let from2 = contentStartNorm;
      while (true) {
        const m = bodyNorm.indexOf("مقدمة", from2);
        if (m === -1) break;
        from2 = m + 5;
        const rawStart = normToRaw[m] ?? 0;
        if (!atLineStart(rawStart)) continue;
        positions.push({ kind: "sep", normPos: m, headingOrig: "مقدمة", core: "", contentStartRaw: rawStart, page: pageOf(rawStart) });
      }
    }
    positions.sort((a, b) => a.normPos - b.normPos);
    const nameHeadings = positions.filter((p) => p.kind === "name");
    const allStarts = positions;

    // ── 4. Build chapters: content from this heading's contentStart until the next heading/separator ──
    const chapters: { headingOrig: string; core: string; contentStartRaw: number; contentEndRaw: number; startPage: number; endPage: number; truncated: boolean }[] = [];
    for (let i = 0; i < nameHeadings.length; i++) {
      const cur = nameHeadings[i];
      let endRaw = bodyRaw.length;
      let endPage = pageOf(bodyRaw.length - 1);
      for (const l of allStarts) {
        if (l === cur) continue;
        if (l.normPos > cur.normPos) {
          const lRaw = normToRaw[l.normPos] ?? bodyRaw.length;
          if (lRaw < endRaw) { endRaw = lRaw; endPage = l.page; }
        }
      }
      if (endRaw <= cur.contentStartRaw) endRaw = cur.contentStartRaw + 1;
      const truncated = endRaw >= bodyRaw.length - 1;
      chapters.push({ headingOrig: cur.headingOrig, core: cur.core, contentStartRaw: cur.contentStartRaw, contentEndRaw: endRaw, startPage: cur.page, endPage, truncated });
    }

    // ── 5. Resolve each chapter to a card (match existing or create new) ──
    const rangeStart = Number(body?.range_start || 0);
    const rangeCount = Number(body?.range_count || 0); // 0 = all
    const slice = rangeCount > 0 ? chapters.slice(rangeStart, rangeStart + rangeCount) : chapters.slice(rangeStart);

    const toCreateSections: any[] = [];
    const newCardsToCreate: any[] = [];
    const newCardCores = new Map<string, any>(); // core -> pending new card
    const usedExisting = new Set<string>();
    const hashesSeen = new Set<string>();
    const perChapter: any[] = [];
    let duplicates = 0;
    let emptyChapters = 0;

    // helper: get-or-create card for a core
    const resolveCard = (core: string, headingOrig: string, page: number) => {
      const exist = cardByCore.get(core) || cardByCoreNoAl.get(core.replace(/^ال/, ""));
      if (exist) { usedExisting.add(String(exist.pdf_name_id)); return { card: exist, isNew: false }; }
      // pending new?
      if (newCardCores.has(core)) return { card: newCardCores.get(core), isNew: true };
      maxOrder += 1;
      const id = "PDF-HN-" + String(maxOrder).padStart(4, "0");
      const nc: any = {
        pdf_name_id: id,
        surah_name: "",
        arabic_name: headingOrig.replace(/^اسمه\s+/, "").replace(/^اسم\s+/, "").trim() || core,
        arabic_transliteration: "",
        malayalam_pronunciation: "",
        meaning_malayalam: "",
        source_pdf_page: page,
        source_pdf_file,
        global_order: maxOrder,
        verification_status: "pending",
        is_favorite: false,
        view_count: 0,
        archived: false,
      };
      newCardCores.set(core, nc);
      newCardsToCreate.push(nc);
      return { card: nc, isNew: true };
    };

    let truncatedSkipped = 0;
    for (const ch of slice) {
      // Truncated by range boundary (no next heading in this range) → skip;
      // the overlapping next range captures it whole. The final range is
      // allowed to store its last chapter (is_last_range=true).
      if (ch.truncated && !body?.is_last_range) {
        truncatedSkipped++;
        perChapter.push({ heading: ch.headingOrig, core: ch.core, status: "truncated_range", char_count: bodyRaw.slice(ch.contentStartRaw, ch.contentEndRaw).length, page_start: ch.startPage, page_end: ch.endPage });
        continue;
      }
      const rawChapter = bodyRaw.slice(ch.contentStartRaw, ch.contentEndRaw).trim();
      if (!rawChapter) { emptyChapters++; perChapter.push({ heading: ch.headingOrig, core: ch.core, status: "empty", char_count: 0 }); continue; }
      const { card, isNew } = resolveCard(ch.core, ch.headingOrig, ch.startPage);
      const hash = await sha256("section_b|" + String(card.pdf_name_id) + "|" + stripHarakat(rawChapter).replace(/\s+/g, " ").trim());
      if (hashesSeen.has(hash)) { duplicates++; perChapter.push({ heading: ch.headingOrig, core: ch.core, card_id: card.pdf_name_id, new_card: isNew, status: "duplicate", char_count: rawChapter.length, page_start: ch.startPage, page_end: ch.endPage }); continue; }
      hashesSeen.add(hash);
      // duplicate check against DB
      const exist = await base44.asServiceRole.entities.HolyNameImportedSection.filter(
        { source_section: "section_b", source_name_key: String(card.pdf_name_id), content_hash: hash }, null, 1
      );
      if (exist && exist.length > 0) { duplicates++; perChapter.push({ heading: ch.headingOrig, core: ch.core, card_id: card.pdf_name_id, new_card: isNew, status: "duplicate_in_db", char_count: rawChapter.length, page_start: ch.startPage, page_end: ch.endPage }); continue; }

      // collect images for pages in [startPage, endPage]
      const imgs: string[] = [];
      for (let pg = ch.startPage; pg <= ch.endPage; pg++) {
        const pi = pageImagesMap.get(pg);
        if (pi) imgs.push(pi.image_url);
      }
      toCreateSections.push({
        section_id: "HNIS-" + hash.slice(0, 24),
        source_section: "section_b",
        source_name_key: String(card.pdf_name_id),
        name_id: String(card.pdf_name_id),
        section_type: "other",
        text_content: rawChapter,
        arabic_text: rawChapter,
        malayalam_translation: "",
        language: detectLang(rawChapter),
        images: imgs,
        has_visual: imgs.length > 0,
        match_confidence: 100,
        needs_review: false,
        source_heading: ch.headingOrig,
        paragraph_order: 1,
        source_pdf_file,
        source_pdf_url,
        source_pdf_page: ch.startPage,
        import_date: now,
        content_hash: hash,
        import_batch,
      });
      perChapter.push({ heading: ch.headingOrig, core: ch.core, card_id: card.pdf_name_id, new_card: isNew, status: "imported", char_count: rawChapter.length, page_start: ch.startPage, page_end: ch.endPage });
    }

    // ── 6. Create new cards first (so sections can reference them) ──
    let newCardsCreated = 0;
    if (newCardsToCreate.length > 0) {
      try {
        const r: any = await base44.asServiceRole.entities.HolyOnePDFName.bulkCreate(newCardsToCreate);
        newCardsCreated = Array.isArray(r) ? r.length : (r?.length || 0);
      } catch (e) {
        return Response.json({ error: "Failed to create new cards: " + (e?.message || String(e)) }, { status: 500 });
      }
    }

    // ── 7. Create section records ──
    let sectionsAdded = 0;
    if (toCreateSections.length > 0) {
      const r: any = await base44.asServiceRole.entities.HolyNameImportedSection.bulkCreate(toCreateSections);
      sectionsAdded = Array.isArray(r) ? r.length : (r?.length || 0);
    }

    return Response.json({
      status: "ok",
      mode: "import",
      source_pdf_file,
      pages_received: pages.length,
      chapter_headings_received: chapter_headings.length,
      name_headings_located: nameHeadings.length,
      chapters_in_range: slice.length,
      cards_matched_existing: usedExisting.size,
      new_cards_created: newCardsCreated,
      sections_added: sectionsAdded,
      duplicates_skipped: duplicates,
      empty_chapters: emptyChapters,
      truncated_skipped: truncatedSkipped,
      per_chapter: perChapter,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});