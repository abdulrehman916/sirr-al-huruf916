import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// verifyHolyNamesImport — deterministic verification report.
// ═══════════════════════════════════════════════════════════════
// Reads the permanent transcription cache + the imported Section B
// records and confirms that NO chapter or paragraph was skipped:
//   • Every cached content page is accounted for.
//   • Every "اسمه X" chapter heading in the cached content has a
//     matching imported section.
//   • Reports any skipped chapter, any content page not covered,
//     and any chapter missing Malayalam translation.
// Pure read — no writes, no vision. Admin-only. Isolated.
// ═══════════════════════════════════════════════════════════════

function stripHarakat(s: string): string {
  return String(s).replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "");
}
function normHamza(s: string): string { return s.replace(/[\u0622\u0623\u0625]/g, "\u0627").replace(/\u0621/g, ""); }
function normForms(s: string): string { return s.replace(/\u0649/g, "\u064A").replace(/\u0629/g, "\u0647"); }
const HONORIFIC = new Set(["تبارك","وتعالى","تعالى","وتعالي","تعالي","عز","وجل","جل","وعلا","سبحانه","سبحان","قدسه","جلت","قدرته","شأنه","وتقدس","شانه","عمت","عم"]);
function coreOfHeading(h: string): string {
  let x = normForms(normHamza(stripHarakat(h)));
  x = x.replace(/^اسمه\s+/, "").replace(/^اسم\s+/, "");
  return x.split(/\s+/).filter((t) => !HONORIFIC.has(t)).join(" ").trim();
}
function normLine(s: string): string { return normHamza(stripHarakat(s)).replace(/\s+/g, " ").trim(); }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden — admin only" }, { status: 403 });

    const body = await req.json();
    const source_pdf_file = String(body?.source_pdf_file || "");
    const import_batch = String(body?.import_batch || "");
    if (!source_pdf_file) return Response.json({ error: "source_pdf_file required" }, { status: 400 });

    // ── Cached pages (content only, sorted) ──
    const cached: any[] = await base44.asServiceRole.entities.HolyNameTranscriptionCache.filter({ source_pdf_file }, null, 2000);
    const contentPages = (cached || []).filter((c) => !c.is_toc).sort((a, b) => (a.page_number || 0) - (b.page_number || 0));
    const tocPages = (cached || []).filter((c) => c.is_toc);
    let contentChars = 0;
    for (const c of contentPages) contentChars += Number(c.char_count) || String(c.page_text || "").length;

    // ── Build content body + detect expected chapter headings ──
    let bodyText = "";
    const pageBounds: { page: number; start: number; end: number }[] = [];
    for (const c of contentPages) {
      const t = String(c.page_text || "");
      const start = bodyText.length;
      bodyText += t + "\n";
      pageBounds.push({ page: Number(c.page_number) || 0, start, end: bodyText.length });
    }
    const pageOf = (idx: number): number => {
      for (const pb of pageBounds) if (idx < pb.end) return pb.page;
      return pageBounds.length ? pageBounds[pageBounds.length - 1].page : 0;
    };
    // expected chapter headings = line-start "اسمه X" in content body
    const expected: { heading: string; core: string; page: number; pos: number }[] = [];
    const lines = bodyText.split("\n");
    let pos = 0;
    for (const ln of lines) {
      const t = normLine(ln);
      if (t.startsWith("اسمه")) {
        const core = coreOfHeading(ln.trim());
        if (core && core.length >= 2) expected.push({ heading: ln.trim(), core, page: pageOf(pos), pos });
      }
      pos += ln.length + 1;
    }

    // ── Imported sections (section_b) for this file/batch ──
    const secFilter: any = { source_section: "section_b" };
    if (import_batch) secFilter.import_batch = import_batch;
    const sections: any[] = await base44.asServiceRole.entities.HolyNameImportedSection.filter(secFilter, null, 2000);
    const importedCores = new Set<string>();
    let importedChars = 0;
    let missingTranslation = 0;
    const importedDetail: any[] = [];
    for (const s of sections || []) {
      const core = coreOfHeading(String(s.source_heading || ""));
      if (core) importedCores.add(core);
      importedChars += String(s.text_content || "").length;
      const ar = String(s.arabic_text || "").trim();
      const ml = String(s.malayalam_translation || "").trim();
      if (ar && !ml) missingTranslation++;
      importedDetail.push({ core, char_count: String(s.text_content || "").length, has_translation: !!(ar && ml), page: s.source_pdf_page });
    }

    // ── Skipped chapters = expected with no matching imported section ──
    const skipped: { heading: string; core: string; page: number }[] = [];
    const imported: { heading: string; core: string; page: number }[] = [];
    for (const e of expected) {
      if (importedCores.has(e.core)) imported.push({ heading: e.heading, core: e.core, page: e.page });
      else skipped.push({ heading: e.heading, core: e.core, page: e.page });
    }

    // ── Coverage: content pages whose text is NOT a substring of any imported chapter ──
    const importedTextBlob = (sections || []).map((s) => String(s.text_content || "")).join("\n");
    const normBlob = normHamza(stripHarakat(importedTextBlob)).replace(/\s+/g, " ");
    const uncoveredPages: { page: number; snippet: string }[] = [];
    for (const c of contentPages) {
      const normPage = normHamza(stripHarakat(String(c.page_text || ""))).replace(/\s+/g, " ").trim();
      if (!normPage) continue;
      // check a 60-char sliding window of the page appears in the imported blob
      let covered = false;
      for (let i = 0; i + 60 <= normPage.length; i += 40) {
        if (normBlob.includes(normPage.slice(i, i + 60))) { covered = true; break; }
      }
      if (!covered && normPage.length >= 60) uncoveredPages.push({ page: Number(c.page_number) || 0, snippet: normPage.slice(0, 80) });
    }

    return Response.json({
      status: "ok",
      source_pdf_file,
      cache: {
        total_pages_cached: (cached || []).length,
        toc_pages: tocPages.length,
        content_pages: contentPages.length,
        content_chars: contentChars,
      },
      expected_chapters: expected.length,
      imported_chapters: imported.length,
      skipped_chapters: skipped.length,
      skipped_chapter_list: skipped,
      imported_chapter_list: imported,
      imported_records: (sections || []).length,
      imported_chars: importedChars,
      char_coverage_pct: contentChars > 0 ? Math.round((importedChars / contentChars) * 100) : 0,
      content_pages_not_covered: uncoveredPages.length,
      uncovered_page_list: uncoveredPages,
      chapters_missing_translation: missingTranslation,
      verification_passed: skipped.length === 0 && uncoveredPages.length === 0,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});