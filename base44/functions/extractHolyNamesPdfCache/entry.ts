import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// extractHolyNamesPdfCache — ONE-TIME vision transcription cache.
// ═══════════════════════════════════════════════════════════════
// Transcribes a page range of the Holy Names PDF via vision EXACTLY
// ONCE and stores one permanent record per page in
// HolyNameTranscriptionCache. Each page is never re-extracted — a
// fully-cached range is skipped with no vision call. This produces
// the single stable text representation the importer reads from, so
// the whole import is deterministic (no repeated vision).
//
// TOC detection: a page with >= 4 line-start "اسمه" heading lines is
// flagged is_toc=true (TOC lists many names/page; content has 1-2).
// The caller may also pass toc_page_end to force pages <= that number
// as TOC. TOC pages are stored but excluded from chapter detection.
//
// Admin-only. Isolated to the Holy Names module.
// ═══════════════════════════════════════════════════════════════

function stripHarakat(s: string): string {
  return String(s).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "");
}
function normHamza(s: string): string {
  return s.replace(/[\u0622\u0623\u0625]/g, "\u0627").replace(/\u0621/g, "");
}
function normLine(s: string): string {
  return normHamza(stripHarakat(s)).replace(/\s+/g, " ").trim();
}
// Count line-start "اسمه" heading lines on a page (TOC detection).
function countIsmehHeadings(text: string): number {
  let n = 0;
  for (const ln of String(text || "").split("\n")) {
    const t = normLine(ln);
    if (t.startsWith("اسمه") || t.startsWith("اسما")) n++;
  }
  return n;
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
    const source_pdf_file = String(body?.source_pdf_file || "");
    const source_pdf_url = String(body?.source_pdf_url || "");
    const page_start = Number(body?.page_start) || 1;
    const page_end = Number(body?.page_end) || page_start;
    const toc_page_end = Number(body?.toc_page_end || 0); // pages <= this forced TOC
    if (!source_pdf_file || !source_pdf_url) return Response.json({ error: "source_pdf_file and source_pdf_url required" }, { status: 400 });
    if (page_end < page_start) return Response.json({ error: "page_end must be >= page_start" }, { status: 400 });

    // ── Which pages in [start,end] are already cached? ──
    const existing: any[] = await base44.asServiceRole.entities.HolyNameTranscriptionCache.filter({ source_pdf_file }, null, 2000);
    const cachedPages = new Set<number>();
    for (const c of existing || []) {
      const pn = Number(c.page_number) || 0;
      if (pn) cachedPages.add(pn);
    }
    const requestedPages: number[] = [];
    for (let p = page_start; p <= page_end; p++) requestedPages.push(p);
    const missing = requestedPages.filter((p) => !cachedPages.has(p));

    if (missing.length === 0) {
      return Response.json({
        status: "already_cached",
        source_pdf_file,
        range: { start: page_start, end: page_end },
        pages_in_range: requestedPages.length,
        already_cached: requestedPages.length,
        newly_cached: 0,
        vision_ran: false,
      });
    }

    // ── ONE vision call for the whole requested range ──
    let pages: { page_number: number; text: string }[] = [];
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
              description: `Verbatim text content of pages ${page_start} through ${page_end} of the PDF, one entry per page IN ORDER, page_number matching the PDF's physical page. Transcribe ALL Arabic text exactly as printed (every letter, harakat, verse, paragraph, table, line break). Preserve each "اسمه X" heading on its own line. Do not summarize, reorder, or skip anything.`,
            },
          },
          required: ["pages"],
        },
      });
      const arr = Array.isArray(vis?.output?.pages) ? vis.output.pages : (Array.isArray(vis?.pages) ? vis.pages : []);
      for (const p of arr) pages.push({ page_number: Number(p?.page_number) || 0, text: String(p?.text || "") });
    } catch (e) {
      return Response.json({ error: "vision extraction failed: " + (e?.message || String(e)) }, { status: 500 });
    }

    // ── Insert ONLY uncached pages (never overwrite an existing page) ──
    const fileHash = await sha256(source_pdf_file);
    const now = new Date().toISOString();
    const toCreate: any[] = [];
    let newly = 0;
    let tocCount = 0;
    let contentCount = 0;
    const seenInThisCall = new Set<number>();
    for (const p of pages) {
      const pn = p.page_number;
      if (!pn) continue;
      if (cachedPages.has(pn) || seenInThisCall.has(pn)) continue; // never overwrite
      seenInThisCall.add(pn);
      const ismhCount = countIsmehHeadings(p.text);
      const is_toc = (toc_page_end > 0 && pn <= toc_page_end) || ismhCount >= 4;
      toCreate.push({
        cache_id: "HNTC-" + fileHash.slice(0, 12) + "-p" + pn,
        source_pdf_file,
        source_pdf_url,
        page_number: pn,
        page_text: p.text,
        is_toc,
        has_ismeh_heading: ismhCount > 0,
        ismeh_heading_count: ismhCount,
        extracted_at: now,
        extraction_method: "vision_once",
        char_count: (p.text || "").length,
      });
      newly++;
      if (is_toc) tocCount++; else contentCount++;
    }
    if (toCreate.length > 0) {
      try { await base44.asServiceRole.entities.HolyNameTranscriptionCache.bulkCreate(toCreate); } catch (e) { return Response.json({ error: "cache write failed: " + (e?.message || String(e)) }, { status: 500 }); }
    }

    return Response.json({
      status: "ok",
      source_pdf_file,
      range: { start: page_start, end: page_end },
      pages_in_range: requestedPages.length,
      already_cached: requestedPages.length - newly,
      newly_cached: newly,
      toc_pages: tocCount,
      content_pages: contentCount,
      vision_ran: true,
      missing_before: missing.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});