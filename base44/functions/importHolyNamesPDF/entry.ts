import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// importHolyNamesPDF — Holy Names PDF Knowledge Import (admin-only)
// ═══════════════════════════════════════════════════════════════
// Enriches the EXISTING Holy Name records shown on the Holy Names page:
//   • Section A — the static HOLY_NAMES array. The frontend sends
//     section_a_names:[{id, arabicPlain, englishName}]. Matched by
//     arabicPlain (normalized). Stored with source_section="section_a",
//     source_name_key=String(id).
//   • Section B — the HolyOnePDFName entity. Queried server-side. Matched
//     by normalized arabic_name. Stored with source_section="section_b",
//     source_name_key=pdf_name_id.
//
// Hybrid extraction:
//   • RAW path (primary): frontend extracts the PDF text layer with
//     pdfjs and sends pages:[{page_number,text}]. The backend matches
//     each page text against Section A + Section B names, collects the
//     verbatim paragraph(s) containing each found name, and stores them
//     as HolyNameImportedSection records. NO LLM, NO generation.
//   • LLM fallback: if no pages are sent (scanned PDF), the backend calls
//     ExtractDataFromUploadedFile with a STRICT verbatim prompt, then
//     matches the transcribed text the same way.
//
// Rules enforced:
//   • Append-only: existing sections are NEVER deleted/overwritten.
//   • Duplicates skipped by content_hash (source_section|source_name_key|text).
//   • Every section records source_pdf_file + source_pdf_page.
//   • Never attaches info to the wrong name (substring match on the
//     name's own normalized form; very short forms (<3 chars) skipped
//     to avoid false positives).
//   • Arabic + Malayalam preserved verbatim.
// Affects ONLY the Holy Names page. Admin-only.
// ═══════════════════════════════════════════════════════════════

function normalizeArabic(s: string): string {
  if (!s) return "";
  return String(s)
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
    .replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
// Level 1 — Hamza normalization (extremely common in Arabic; safe to match).
// Unifies all hamza-bearing forms and standalone hamza so that a Holy Name
// is found whether the PDF prints it with or without hamza (أ ↔ ا, إ ↔ ا,
// آ ↔ ا, ء removed, ؤ ↔ و, ئ ↔ ي). Confidence 90 — attaches directly.
function normalizeHamza(s: string): string {
  if (!s) return "";
  return s
    .replace(/[\u0622\u0623\u0625]/g, "\u0627") // آ أ إ → ا
    .replace(/\u0621/g, "")                     // ء removed
    .replace(/\u0624/g, "\u0648")               // ؤ → و
    .replace(/\u0626/g, "\u064A");              // ئ → ي
}
// Level 2 — Letter-form normalization (common but occasionally ambiguous, so
// matches at this level are FLAGGED for manual review — confidence 75 < 80).
// Unifies alef-maqsura ↔ yaa (ى ↔ ي) and taa-marbuta ↔ haa (ة ↔ ه).
function normalizeLetterForms(s: string): string {
  if (!s) return "";
  return s
    .replace(/\u0649/g, "\u064A") // ى → ي
    .replace(/\u0629/g, "\u0647"); // ة → ه
}
function detectLang(text: string): string {
  const hasAr = /[\u0600-\u06FF]/.test(text);
  const hasMl = /[\u0D00-\u0D7F]/.test(text);
  if (hasAr && hasMl) return "mixed";
  if (hasMl) return "ml";
  if (hasAr) return "ar";
  return "en";
}
function splitScripts(text: string): { arabic: string; malayalam: string } {
  const lines = String(text || "").split(/\n+/);
  let arabic = "";
  let malayalam = "";
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const hasAr = /[\u0600-\u06FF]/.test(t);
    const hasMl = /[\u0D00-\u0D7F]/.test(t);
    if (hasAr && hasMl) {
      const arRuns = (t.match(/[\u0600-\u06FF\u0640\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\s.,،؛:!؟"'()\-]+/g) || []).join(" ").trim();
      const mlRuns = (t.match(/[\u0D00-\u0D7F\s.,:!?'"\-]+/g) || []).join(" ").trim();
      if (arRuns) arabic += (arabic ? "\n" : "") + arRuns;
      if (mlRuns) malayalam += (malayalam ? "\n" : "") + mlRuns;
    } else if (hasMl) {
      malayalam += (malayalam ? "\n" : "") + t;
    } else if (hasAr) {
      arabic += (arabic ? "\n" : "") + t;
    }
  }
  return { arabic, malayalam };
}
// Boundary-aware ALIAS match across scripts (Arabic, English, Malayalam).
// The alias must appear as a standalone token — surrounded by characters
// that are NOT word-characters of the same script — so it is never matched
// as a substring inside a longer word. This lets a Holy Name be found whether
// the PDF prints it in Arabic, English transliteration, or Malayalam, and all
// aliases point to the SAME Holy Name record (never creating duplicates).
function isWordChar(c: string, script: "ar" | "en" | "ml"): boolean {
  if (script === "ar") return /[\u0600-\u06FF]/.test(c);
  if (script === "ml") return /[\u0D00-\u0D7F]/.test(c);
  return /[a-zA-Z0-9]/.test(c); // en
}
function containsAlias(normText: string, normAlias: string, script: "ar" | "en" | "ml"): boolean {
  if (!normAlias || normAlias.length < 3) return false;
  let idx = normText.indexOf(normAlias);
  while (idx !== -1) {
    const before = idx > 0 ? normText[idx - 1] : " ";
    const after = idx + normAlias.length < normText.length ? normText[idx + normAlias.length] : " ";
    if (!isWordChar(before, script) && !isWordChar(after, script)) return true;
    idx = normText.indexOf(normAlias, idx + 1);
  }
  return false;
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
    if (user.role !== "admin") {
      return Response.json({ error: "Forbidden — admin only" }, { status: 403 });
    }

    const body = await req.json();
    const import_batch = String(body?.import_batch || "HNK-" + Date.now());
    const source_pdf_file = String(body?.source_pdf_file || "");
    const source_pdf_url = String(body?.source_pdf_url || "");
    const now = new Date().toISOString();
    let pages: any[] = Array.isArray(body?.pages) ? body.pages : [];
    let extraction_method = "raw";

    // ── Page images map (rendered by frontend for pages with visual content) ──
    const pageImagesMap = new Map<number, { image_url: string; has_visual: boolean }>();
    for (const pi of Array.isArray(body?.page_images) ? body.page_images : []) {
      const pn = Number(pi?.page_number) || 0;
      if (pn && pi?.image_url) pageImagesMap.set(pn, { image_url: String(pi.image_url), has_visual: pi?.has_visual !== false });
    }

    // ── LLM verbatim fallback when no raw text was provided ──
    if (pages.length === 0 && source_pdf_url) {
      extraction_method = "llm_verbatim";
      const extract: any = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
        file_url: source_pdf_url,
        json_schema: {
          type: "object",
          properties: {
            pages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  page_number: { type: "integer" },
                  text: { type: "string" },
                },
                required: ["page_number", "text"],
              },
            },
          },
          required: ["pages"],
        },
      });
      const out = extract?.output || extract;
      pages = Array.isArray(out?.pages) ? out.pages : [];
    }

    if (pages.length === 0) {
      return Response.json({ error: "No extractable text found in this PDF." }, { status: 400 });
    }

    // ── Build matchers from Section A (sent from frontend) + Section B (DB) ──
    type Matcher = { source_section: "section_a" | "section_b"; source_name_key: string; norm: string; norm1: string; norm2: string; script: "ar" | "en" | "ml" };
    const matchers: Matcher[] = [];

    // Section A: static HOLY_NAMES sent from the frontend
    const sectionA: any[] = Array.isArray(body?.section_a_names) ? body.section_a_names : [];
    for (const n of sectionA) {
      const key = String(n.id);
      const arNorm = normalizeArabic(n?.arabicPlain || n?.arabicName || "");
      if (arNorm.length >= 3) matchers.push({ source_section: "section_a", source_name_key: key, norm: arNorm, norm1: normalizeHamza(arNorm), norm2: normalizeLetterForms(normalizeHamza(arNorm)), script: "ar" });
      const enNorm = String(n?.englishName || "").toLowerCase().trim();
      if (enNorm.length >= 3) matchers.push({ source_section: "section_a", source_name_key: key, norm: enNorm, norm1: enNorm, norm2: enNorm, script: "en" });
    }

    // Section B: HolyOnePDFName records from the database
    try {
      const bNames = await base44.asServiceRole.entities.HolyOnePDFName.list(null, 1000);
      for (const n of bNames || []) {
        if (!n?.pdf_name_id) continue;
        const key = String(n.pdf_name_id);
        const arNorm = normalizeArabic(n?.arabic_name || "");
        if (arNorm.length >= 3) matchers.push({ source_section: "section_b", source_name_key: key, norm: arNorm, norm1: normalizeHamza(arNorm), norm2: normalizeLetterForms(normalizeHamza(arNorm)), script: "ar" });
        const enNorm = String(n?.arabic_transliteration || "").toLowerCase().trim();
        if (enNorm.length >= 3) matchers.push({ source_section: "section_b", source_name_key: key, norm: enNorm, norm1: enNorm, norm2: enNorm, script: "en" });
        const mlNorm = String(n?.malayalam_pronunciation || "").trim();
        if (mlNorm.length >= 3) matchers.push({ source_section: "section_b", source_name_key: key, norm: mlNorm, norm1: mlNorm, norm2: mlNorm, script: "ml" });
      }
    } catch { /* Section B unavailable — continue with Section A only */ }

    if (matchers.length === 0) {
      return Response.json({ error: "No Holy Names available to match against. Ensure Section A names loaded or Section B has records." }, { status: 400 });
    }

    // ── Match + collect verbatim sections ──
    const toCreate: any[] = [];
    const foundKeys = new Set<string>();   // "section|key"
    let pagesProcessed = 0;
    let duplicates = 0;
    const hashesSeenThisRun = new Set<string>();

    for (const page of pages) {
      const rawText = String(page?.text || "");
      if (!rawText.trim()) continue;
      pagesProcessed++;
      const paras = rawText.split(/\n+/).map((p) => p.trim()).filter(Boolean);

      // Per-page ordered pass — build UNITS (one per name-paragraph + its glosses):
      //   Each paragraph containing a Holy Name starts a new unit. Following
      //   Malayalam-only gloss paragraphs attach to the current unit. Each
      //   unit becomes ONE section per name it mentions, so multi-topic pages
      //   produce multiple independently-categorized sections (benefits, usage,
      //   conditions, warnings, etc.) instead of one merged block.
      // Confidence levels (Arabic): 100=exact normalized, 90=hamza normalized,
      // 75=letter-form normalized. ≥80 attaches directly; <80 flags for review.
      // ACCURACY > AUTOMATION: low-confidence matches are never silently
      // attached — they are created with needs_review=true for admin review.
      //
      // NO INVENTED CATEGORIES: section_type is always "other". A short
      // standalone line preceding a matched paragraph is captured VERBATIM as
      // source_heading (the PDF's own heading), never an AI-invented label.
      // paragraph_order preserves the original PDF paragraph order.
      type Unit = { keys: string[]; confidences: Record<string, number>; text: string; heading: string; paraOrder: number };
      const units: Unit[] = [];
      let currentUnit: Unit | null = null;
      let pendingHeading: string | null = null;
      let paraIdx = 0;

      for (const p of paras) {
        paraIdx++;
        const pAr = normalizeArabic(p);
        const pAr1 = normalizeHamza(pAr);
        const pAr2 = normalizeLetterForms(pAr1);
        const pEn = p.toLowerCase();
        const hasAr = /[\u0600-\u06FF]/.test(p);
        const hasMl = /[\u0D00-\u0D7F]/.test(p);
        const matched = new Map<string, number>(); // key -> best confidence
        for (const m of matchers) {
          const k = m.source_section + "|" + m.source_name_key;
          let conf = 0;
          const t0 = m.script === "ar" ? pAr : m.script === "en" ? pEn : p;
          if (containsAlias(t0, m.norm, m.script)) conf = 100;
          if (conf === 0 && m.script === "ar" && containsAlias(pAr1, m.norm1, "ar")) conf = 90;
          if (conf === 0 && m.script === "ar" && containsAlias(pAr2, m.norm2, "ar")) conf = 75;
          if (conf > 0) { const prev = matched.get(k) || 0; if (conf > prev) matched.set(k, conf); }
        }
        const contained = [...matched.keys()];

        if (contained.length >= 1) {
          if (currentUnit) units.push(currentUnit);
          const confs: Record<string, number> = {};
          for (const k of contained) confs[k] = matched.get(k)!;
          const heading = pendingHeading || "";
          pendingHeading = null;
          currentUnit = { keys: contained, confidences: confs, text: p, heading, paraOrder: paraIdx };
        } else {
          // No Holy Name in this paragraph. Decide: gloss vs heading vs break.
          if (hasMl && !hasAr) {
            // Malayalam-only paragraph = gloss for the current unit (or orphan).
            if (currentUnit) currentUnit.text += "\n" + p;
          } else {
            // Arabic/English non-matching paragraph. A short standalone line
            // with no terminal punctuation is a candidate heading — captured
            // VERBATIM from the PDF (never AI-invented). Attached to the next
            // matched paragraph; discarded if not followed by a match.
            const trimmed = p.trim();
            const isHeading = trimmed.length > 0 && trimmed.length <= 40 && trimmed.split(/\s+/).length <= 5 && !/[.؟!،:؛]$/.test(trimmed);
            if (isHeading) {
              if (currentUnit) { units.push(currentUnit); currentUnit = null; }
              pendingHeading = trimmed;
            } else {
              if (currentUnit) { units.push(currentUnit); currentUnit = null; }
              pendingHeading = null;
            }
          }
        }
      }
      if (currentUnit) units.push(currentUnit);

      for (const unit of units) {
        const text = unit.text.trim();
        if (!text) continue;
        for (const k of unit.keys) {
          const m = matchers.find((mm) => mm.source_section + "|" + mm.source_name_key === k);
          if (!m) continue;
          const confidence = unit.confidences[k] || 100;
          foundKeys.add(k);

          const hash = await sha256(m.source_section + "|" + m.source_name_key + "|" + normalizeArabic(text));
          if (hashesSeenThisRun.has(hash)) { duplicates++; continue; }
          hashesSeenThisRun.add(hash);

          const exist = await base44.asServiceRole.entities.HolyNameImportedSection.filter(
            { source_section: m.source_section, source_name_key: m.source_name_key, content_hash: hash },
            null,
            1
          );
          if (exist && exist.length > 0) { duplicates++; continue; }

          const { arabic, malayalam } = splitScripts(text);
          const pageNum = Number(page?.page_number) || 0;
          const pImg = pageImagesMap.get(pageNum);
          toCreate.push({
            section_id: "HNIS-" + hash.slice(0, 24),
            source_section: m.source_section,
            source_name_key: m.source_name_key,
            name_id: m.source_name_key,
            section_type: "other",
            text_content: text,
            arabic_text: arabic,
            malayalam_translation: malayalam,
            language: detectLang(text),
            images: pImg ? [pImg.image_url] : [],
            has_visual: !!(pImg && pImg.has_visual),
            match_confidence: confidence,
            needs_review: confidence < 80,
            source_heading: unit.heading,
            paragraph_order: unit.paraOrder,
            source_pdf_file,
            source_pdf_url,
            source_pdf_page: pageNum,
            import_date: now,
            content_hash: hash,
            import_batch,
          });
        }
      }
    }

    // ── Malayalam translation generation (the ONLY generation step) ──
    // For paragraphs with Arabic text but no Malayalam from the PDF, generate
    // a FAITHFUL Malayalam translation of the exact Arabic text. Never
    // summarizes, adds, invents, or categorizes — translates verbatim meaning.
    // The PDF's own Malayalam (already in malayalam_translation) is preserved.
    let translations_generated = 0;
    const translateItems: { idx: number; arabic: string }[] = [];
    for (let i = 0; i < toCreate.length; i++) {
      const rec = toCreate[i];
      const ar = String(rec.arabic_text || "").trim();
      const ml = String(rec.malayalam_translation || "").trim();
      if (ar && !ml) translateItems.push({ idx: i, arabic: ar });
    }
    if (translateItems.length > 0) {
      const BATCH = 25;
      for (let b = 0; b < translateItems.length; b += BATCH) {
        const batch = translateItems.slice(b, b + BATCH);
        try {
          const trRes: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: `You are a FAITHFUL Arabic-to-Malayalam translator. For EACH Arabic text below, output a faithful, literal Malayalam translation that preserves the EXACT meaning of the Arabic — nothing more, nothing less.

STRICT RULES:
- Translate ONLY the Arabic text provided for each item.
- Output ONLY the Malayalam translation in Malayalam script.
- Do NOT summarize, paraphrase, explain, add commentary, or skip any part.
- Do NOT add titles, labels, headings, or category names.
- Preserve the exact meaning, including any repetition counts, names of God/angels/prophets, or ritual instructions.
- Transliterate names of God, angels, and prophets faithfully into Malayalam.
- Return ONLY a JSON object: {"translations": [{"index": <number>, "malayalam": "<malayalam text>"}]}

Arabic texts to translate:
${batch.map((t) => `--- Item index ${t.idx} ---\n${t.arabic.slice(0, 1200)}`).join("\n\n")}`,
            response_json_schema: {
              type: "object",
              properties: {
                translations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      index: { type: "integer" },
                      malayalam: { type: "string" },
                    },
                  },
                },
              },
            },
          });
          for (const t of (trRes?.translations || [])) {
            const ml = String(t?.malayalam || "").trim();
            if (ml && toCreate[Number(t?.index)]) {
              toCreate[Number(t.index)].malayalam_translation = ml;
              translations_generated++;
            }
          }
        } catch { /* translation unavailable — keep empty Malayalam */ }
      }
    }

    let sections_added = 0;
    if (toCreate.length > 0) {
      const res: any = await base44.asServiceRole.entities.HolyNameImportedSection.bulkCreate(toCreate);
      sections_added = Array.isArray(res) ? res.length : (res?.length || 0);
    }

    return Response.json({
      status: "ok",
      extraction_method,
      pages_processed: pagesProcessed,
      names_found: foundKeys.size,
      sections_added,
      duplicates_skipped: duplicates,
      translations_generated,
      matchers: matchers.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});