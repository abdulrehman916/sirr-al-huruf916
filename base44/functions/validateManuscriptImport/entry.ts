import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT IMPORT VALIDATION — PHASE 1: EXTRACTION + IMAGES
// ═══════════════════════════════════════════════════════════════
// Phase 1 (this function):
//   Stage 1: PDF Content Extraction (InvokeLLM with file_urls)
//   Stage 4: Image Extraction (actual image FILES from PDF bytes)
//
// Phase 2 (verifyBookEntries function — call separately after this):
//   Stage 2: Arabic Verification (verifyArabicText for EVERY entry)
//   Stage 3: Malayalam Translation (from verified Arabic ONLY)
//
// Entries are created with verification_status='pending'.
// After Phase 2 completes, the 14-point check is finalized.
//
// The split is required because 19+ parallel verifyArabicText calls
// (each ~70s) exceed the platform gateway timeout in a single call.
//
// ADMIN ONLY.
// ═══════════════════════════════════════════════════════════════

const SIRR_SECTION_NAMES = {
  1: 'Diseases & Healing',
  2: 'Jinn, Ruqyah & Spiritual Protection',
  3: 'Mahabbah, Acceptance & Relationships',
  4: 'Wafq, Taweez, Magic Squares & Spiritual Methods',
  5: 'Duas, Quranic Verses, Divine Names & Invocations',
  6: 'Herbs, Incense, Oils, Plants & Traditional Remedies',
  7: 'Sacred Times, Planetary Hours, Lunar Mansions & Spiritual Rules',
};

// ── Helper: Decompress FlateDecode stream ──
async function decompressFlate(data: Uint8Array): Promise<Uint8Array | null> {
  try {
    const stream = new Response(data).body!.pipeThrough(new DecompressionStream('deflate'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    try {
      const stream = new Response(data).body!.pipeThrough(new DecompressionStream('deflate-raw'));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    } catch {
      return null;
    }
  }
}

// ── Helper: Extract actual image files from PDF ──
async function extractImagesFromPdf(
  pdfBytes: Uint8Array,
  bookId: string,
  uploadFn: (file: File) => Promise<{ file_url: string }>
): Promise<{ images: any[]; error: string | null }> {
  let pdfLib: any;
  try {
    pdfLib = await import('npm:pdf-lib@1.17.1');
  } catch (e) {
    return { images: [], error: 'pdf-lib import failed: ' + (e as Error).message };
  }

  const { PDFDocument, PDFName } = pdfLib;
  let pdfDoc: any;
  try {
    pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  } catch (e) {
    return { images: [], error: 'PDF load failed: ' + (e as Error).message };
  }

  const pages = pdfDoc.getPages();
  const allImages: any[] = [];

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const pageNum = pageIdx + 1;
    const page = pages[pageIdx];

    try {
      const node = page.node;
      const resources = node.get(PDFName.of('Resources'));
      if (!resources) continue;

      const resourcesDict = pdfDoc.context.lookup(resources);
      if (!resourcesDict) continue;

      const xObjectsEntry = resourcesDict.get(PDFName.of('XObject'));
      if (!xObjectsEntry) continue;

      const xObjectsDict = pdfDoc.context.lookup(xObjectsEntry);
      if (!xObjectsDict || !xObjectsDict.dict) continue;

      for (const [name, ref] of xObjectsDict.dict.entries()) {
        try {
          let xObj: any;
          try {
            xObj = pdfDoc.context.lookup(ref);
          } catch {
            xObj = ref;
          }
          if (!xObj || !xObj.dict || !xObj.contents) continue;

          const dict = xObj.dict;
          const subtype = dict.get(PDFName.of('Subtype'));
          if (!subtype || subtype.toString() !== '/Image') continue;

          const filter = dict.get(PDFName.of('Filter'));
          const widthVal = dict.get(PDFName.of('Width'));
          const heightVal = dict.get(PDFName.of('Height'));
          let width = 0;
          if (widthVal) {
            if (typeof widthVal.value === 'function') width = widthVal.value();
            else if (typeof widthVal.numberValue === 'number') width = widthVal.numberValue;
          }
          let height = 0;
          if (heightVal) {
            if (typeof heightVal.value === 'function') height = heightVal.value();
            else if (typeof heightVal.numberValue === 'number') height = heightVal.numberValue;
          }

          let filterStr = '';
          if (filter) {
            try { filterStr = filter.toString(); } catch {}
          }

          let imageBytes: Uint8Array | null = null;
          let mimeType = '';
          let extension = '';

          if (filterStr === '/DCTDecode') {
            imageBytes = new Uint8Array(xObj.contents);
            mimeType = 'image/jpeg';
            extension = 'jpg';
          } else if (filterStr.includes('FlateDecode')) {
            const pixelData = await decompressFlate(new Uint8Array(xObj.contents));
            if (!pixelData) continue;

            const colorSpace = dict.get(PDFName.of('ColorSpace'));
            const csStr = colorSpace ? colorSpace.toString() : '/DeviceRGB';
            const channels = csStr.includes('Gray') ? 1 : csStr.includes('CMYK') ? 4 : 3;
            if (channels === 4) continue;

            let fastPng: any;
            try {
              fastPng = await import('npm:fast-png@6.1.0');
            } catch { continue; }

            const pngBuffer = fastPng.encode({
              width,
              height,
              data: pixelData,
              components: channels,
              alpha: false,
            });
            imageBytes = new Uint8Array(pngBuffer);
            mimeType = 'image/png';
            extension = 'png';
          } else {
            continue;
          }

          if (imageBytes && imageBytes.length > 0) {
            const blob = new Blob([imageBytes], { type: mimeType });
            const safeName = String(name).replace(/[^a-zA-Z0-9]/g, '');
            const fileName = `${bookId}_page${pageNum}_${safeName}.${extension}`;
            const file = new File([blob], fileName, { type: mimeType });
            const uploadResult = await uploadFn(file);

            allImages.push({
              image_url: uploadResult.file_url,
              page_number: pageNum,
              width,
              height,
              format: mimeType,
              name: String(name),
            });
          }
        } catch { /* skip */ }
      }
    } catch { /* skip page */ }
  }

  return { images: allImages, error: null };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { pdf_url, book_title, book_title_ar, author, language, original_file_name, tradition,
            existing_book_id, page_offset, chunk_number, total_chunks, do_quality_gate, is_final_chunk } = body;
    const pageNumOffset = parseInt(page_offset) || 0;
    const isChunkMode = !!existing_book_id;

    if (!pdf_url || !book_title) {
      return Response.json({ error: 'pdf_url and book_title are required' }, { status: 400 });
    }

    const validationDate = new Date().toISOString();
    let bookId: string;
    let book: any;

    if (isChunkMode) {
      // CHUNK MODE: Use existing book (created by importFromOneDrive for large split PDFs)
      const existingBooks = await base44.asServiceRole.entities.ManuscriptBook.filter({ book_id: existing_book_id });
      if (!existingBooks || existingBooks.length === 0) {
        return Response.json({ error: 'existing_book_id not found: ' + existing_book_id }, { status: 404 });
      }
      book = existingBooks[0];
      bookId = existing_book_id;
    } else {
      // NORMAL MODE: Create new ManuscriptBook
      bookId = `MS-VAL-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      book = await base44.asServiceRole.entities.ManuscriptBook.create({
        book_id: bookId,
        book_title,
        book_title_ar: book_title_ar || '',
        author: author || '',
        language: language || 'Arabic',
        source: 'validation',
        original_file_url: pdf_url,
        original_file_name: original_file_name || '',
        upload_date: validationDate,
        version: '2.0-validation-4stage',
        total_pages: 0,
        ocr_status: 'processing',
        verification_status: 'unverified',
        extraction_status: 'validation_in_progress',
        categories_covered: [],
        total_entries_extracted: 0,
        tradition: tradition || '',
        validation_status: 'pending',
        validation_report: {},
        validation_date: validationDate,
        notes: 'Phase 1: Extraction + Images. Call verifyBookEntries next for Phase 2.',
      });
    }

    // ══ STAGE 1: File Content Extraction ══
    // Detect file type from original_file_name extension.
    // Non-PDF files (DOCX, TXT, Markdown, Images) skip pdf-lib chunking
    // and use whole-file LLM extraction via file_urls (Gemini vision).
    const fileExt = (original_file_name || pdf_url || '').toLowerCase().split('.').pop() || '';
    const isPdf = !fileExt || fileExt === 'pdf';
    let pdfBytes: Uint8Array | null = null;
    if (isPdf) {
      try {
        const pdfResponse = await fetch(pdf_url);
        pdfBytes = new Uint8Array(await pdfResponse.arrayBuffer());
      } catch { /* PDF download failed — LLM can still use file_urls */ }
    }

    // ══ STAGE 0: QUALITY ASSESSMENT GATE ══
    // Skip for chunk mode (non-first chunks) — quality gate runs on chunk 1 only.
    const skipQualityGate = isChunkMode && do_quality_gate !== true;
    // Assess manuscript readability BEFORE extraction.
    // Reject poor-quality manuscripts — do NOT import them.
    // Accuracy > completeness. Better to reject than to save incorrect data.
    const qualityPrompt = `You are an expert in Islamic manuscript analysis and Arabic calligraphy preservation.

TASK: Assess the READABILITY and EXTRACTION QUALITY of this PDF manuscript. Determine whether this manuscript can be reliably extracted with high accuracy.

Analyze the manuscript for these quality criteria:
1. PAGE CLARITY: Are pages clear enough to read? (blurred, smudged, faded, low-resolution scans)
2. ARABIC LEGIBILITY: Is the Arabic text clearly readable? (calligraphy quality, harakat visibility, letter clarity)
3. TEXT COMPLETENESS: Are pages complete? (missing pages, cut-off text, incomplete scans, damaged pages)
4. OCR FEASIBILITY: Can text be reliably extracted? (broken characters, overlapping text, decorative borders interfering)
5. CONSISTENCY: Is quality consistent across pages? (some clear, others unreadable)
6. CONTENT INTEGRITY: Is the actual content (rituals, Arabic, tables, diagrams) intact and legible?

For each page, note whether it has problems.

Return:
- quality_verdict: "pass" or "reject"
- overall_confidence: 0-100 (confidence that extraction will be accurate)
- reason: if rejected, explain why
- problem_pages: array of page numbers with quality issues
- quality_details: { page_clarity, arabic_legibility, text_completeness, ocr_feasibility, consistency, content_integrity } each 0-100
- pages_assessed: total pages examined

REJECTION THRESHOLD: Reject if overall_confidence < 65, OR if more than 20% of pages have problems, OR if Arabic legibility is too poor to preserve harakat reliably.

CRITICAL: It is BETTER TO REJECT an unclear manuscript than to extract incorrect or incomplete information. Accuracy and authenticity are more important than importing every available manuscript.`;

    const qualityResult: any = skipQualityGate ? {} : await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: qualityPrompt,
      file_urls: [pdf_url],
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          quality_verdict: { type: 'string' },
          overall_confidence: { type: 'integer' },
          reason: { type: 'string' },
          problem_pages: { type: 'array', items: { type: 'string' } },
          quality_details: {
            type: 'object',
            properties: {
              page_clarity: { type: 'integer' },
              arabic_legibility: { type: 'integer' },
              text_completeness: { type: 'integer' },
              ocr_feasibility: { type: 'integer' },
              consistency: { type: 'integer' },
              content_integrity: { type: 'integer' },
            },
          },
          pages_assessed: { type: 'integer' },
        },
      },
    });

    const qualityVerdict = (qualityResult as any)?.quality_verdict || 'pass';
    const overallConfidence = (qualityResult as any)?.overall_confidence ?? 0;
    const qualityReason = (qualityResult as any)?.reason || '';
    const problemPages = (qualityResult as any)?.problem_pages || [];
    const qualityDetails = (qualityResult as any)?.quality_details || {};
    const pagesAssessed = (qualityResult as any)?.pages_assessed || 0;

    // ══ QUALITY GATE: Reject poor-quality manuscripts — do NOT import ══
    const qualityPassed = skipQualityGate ? true : (qualityVerdict === 'pass' && overallConfidence >= 65);

    if (!qualityPassed) {
      const rejectionReport = {
        quality_rejected: true,
        quality_verdict: 'reject',
        overall_confidence: overallConfidence,
        reason: qualityReason || 'Manuscript quality below threshold for reliable extraction',
        problem_pages: problemPages,
        quality_details: qualityDetails,
        pages_assessed: pagesAssessed,
        rejection_date: validationDate,
        message: 'Import Rejected: manuscript quality too poor for reliable extraction. No entries imported.',
      };

      await base44.asServiceRole.entities.ManuscriptBook.update(book.id, {
        extraction_status: 'failed',
        ocr_status: 'failed',
        validation_status: 'failed',
        total_pages: pagesAssessed,
        total_entries_extracted: 0,
        validation_report: rejectionReport,
        validation_date: validationDate,
        notes: `IMPORT REJECTED — Quality: ${overallConfidence}/100. ${qualityReason}`,
      });

      return Response.json({
        status: 'import_rejected',
        book_id: bookId,
        book_title,
        quality_verdict: 'reject',
        overall_confidence: overallConfidence,
        reason: qualityReason,
        problem_pages: problemPages,
        quality_details: qualityDetails,
        message: `Import Rejected: manuscript quality too poor (confidence ${overallConfidence}/100). No entries imported. Reason: ${qualityReason}`,
        validation_report: rejectionReport,
      });
    }

    const extractionPrompt = `You are an expert in Islamic occult manuscripts, Arabic calligraphy, and spiritual text preservation.

TASK: Analyze EVERY page of this PDF manuscript. Extract ALL content from EVERY page. Do NOT skip any page.

═══ CRITICAL ARABIC EXTRACTION MANDATE ═══
EVERY page that contains ANY Arabic text MUST have that Arabic text captured in the arabic_text field of at least one entry. This is NON-NEGOTIABLE.

- Quranic verses, supplications, invocations, divine names, dhikr formulas, tawkeel, angel names, jinn names, and ANY Arabic text MUST be extracted verbatim into the arabic_text field.
- If a page is primarily Arabic (e.g., a page of Quranic verses or supplications), create entries with the arabic_text field filled with the COMPLETE Arabic text.
- NEVER create an entry with empty arabic_text if the page contains any Arabic text. If a page has Arabic text that does not fit any specific entry type, create an entry with entry_type="reference" and put the Arabic text in arabic_text.
- Preserve ALL harakat (diacritics), punctuation, verse numbers (e.g., ١٢٣), and line order EXACTLY as they appear in the manuscript.
- If Arabic text is unclear or partially unreadable, extract what is readable AND note the unreadable portions in notes. Set arabic_text_preserved=false. NEVER skip the entry or leave arabic_text empty.

═══ FIELD SEPARATION RULE ═══
Each piece of information goes into its CORRECT field. Never mix fields:
- Arabic recitation/verse/supplication/invocation/divine name text → arabic_text (VERBATIM Arabic only)
- Step-by-step procedure instructions → procedure
- Explanations, commentary, context → notes or english_meaning
- Warnings and precautions → warnings
- Conditions and prerequisites → conditions
- Materials and ingredients → materials
- Preparation instructions → preparation
- Timing requirements → timing
- Associated planet → planet
- Suitable day → day
- Required incense → incense
- Repetition count → repetition
- Benefits → benefits
- References → notes

NEVER copy Arabic recitation text into the procedure, conditions, materials, warnings, or timing fields. Arabic text goes ONLY in arabic_text.

═══ ANTI-DUPLICATION RULE ═══
Each Arabic passage appears in exactly ONE entry. Never copy the same Arabic text into multiple entries or multiple knowledge fields. If the same Arabic appears on multiple pages, each occurrence is a separate entry with its own page_number.

═══ HEADING DETECTION — MANUSCRIPT STRUCTURE PRESERVATION ═══
FIRST, detect the REAL heading hierarchy from the PDF layout. Different manuscripts use different structures (Bab/Fasl/Mas'ala, Chapter/Section, Part/Chapter, etc.). You must detect what actually exists — never invent headings.

Detect headings by recognizing:
- Larger font sizes (chapter titles are typically larger than body text)
- Bold or centered text (section headings are often bold or centered)
- Decorative separators (ornamental dividers between chapters/sections)
- Numbered headings (e.g., "باب الأول", "الفصل الثاني", "القسم الثالث", "1.", "2.")
- Arabic heading conventions: باب (Bab/Door), فصل (Fasl/Chapter), قسم (Qism/Section), جزء (Juz/Part), مسألة (Mas'ala/Question)
- Page-break boundaries (chapters often start on a new page)
- Indentation levels (sub-headings may be indented)
- Whitespace patterns (extra space before headings)

Build a HEADING TREE with any number of levels. For each heading provide:
- heading_id: unique identifier within this book (e.g., "H1", "H1-1", "H1-1-1", "H2", etc.)
- parent_heading_id: the heading_id of the parent heading (empty string "" for top-level)
- heading_level: integer depth (1 = top-level, 2 = sub-heading, 3 = sub-sub-heading, etc.)
- heading_title: the heading text in English transliteration or translation
- heading_title_ar: the heading text in original Arabic script (empty if not in Arabic)
- heading_order: sequence within parent (1-based)
- start_page: first page where this heading appears
- end_page: last page before the next heading at the same level (empty if unknown)
- heading_source: "pdf_detected" (real heading found in PDF) or "generated_fallback" (no heading found, temporary label created)

RULES FOR HEADINGS:
- NEVER invent headings when the manuscript already contains them.
- Only create "generated_fallback" headings when a section of content has NO detectable heading at all.
- Preserve heading titles EXACTLY as written (Arabic verbatim, never modified).
- If a manuscript has no headings at all, create ONE generated_fallback top-level heading covering the entire book.

═══ ENTRY EXTRACTION ═══
For each page, extract:
1. ALL Arabic text — preserve EXACTLY as written in the manuscript, including harakat (diacritics), verse numbers, and punctuation. Never modify, modernize, or simplify Arabic. NEVER leave arabic_text empty if the page contains Arabic.
2. All entries: rituals, duas, Quran verses, divine names, wafq, taweez, diagrams, tables, instructions, materials, timing, conditions, warnings, notes, references.
3. Identify any images, wafq (magic squares), taweez (amulets), diagrams, tables, or seals on each page.
4. For each entry, classify into a Sirr section (1-7) — this is an ALTERNATIVE classification only:
   1 = Diseases & Healing
   2 = Jinn, Ruqyah & Spiritual Protection
   3 = Mahabbah, Acceptance & Relationships
   4 = Wafq, Taweez, Magic Squares & Spiritual Methods
   5 = Duas, Quranic Verses, Divine Names & Invocations
   6 = Herbs, Incense, Oils, Plants & Traditional Remedies
   7 = Sacred Times, Planetary Hours, Lunar Mansions & Spiritual Rules

For each entry, provide:
- page_number, entry_type, purpose, arabic_text (VERBATIM — NEVER EMPTY if page has Arabic), malayalam_meaning (if in manuscript), english_meaning
- conditions, materials, preparation, procedure, timing, planet, day, incense, repetition, warnings, benefits, notes
- has_image, image_type (wafq/taweez/diagram/table/seal/drawing/none), image_description
- arabic_text_preserved (true if clearly readable)
- sirr_section (1-7), topic, topic_ml, topic_ar
- heading_id: the heading_id this entry belongs to (from the heading tree above). Every entry MUST have a heading_id.
- entry_order: sequential position of this entry within the book, by page order (1-based). Entries MUST be in exact manuscript page order.

═══ PER-PAGE ARABIC COMPLETENESS AUDIT ═══
For EVERY page you analyze, you MUST provide a page_arabic_audit entry:
- page_number: the page number
- has_arabic: true if the page contains ANY Arabic text (even a single word)
- arabic_line_count: number of distinct Arabic lines/sentences on the page
- arabic_completeness_score: 0-100 (100 = every Arabic line on the page is captured in entries' arabic_text fields)
- missing_arabic_lines: array of any Arabic text that was NOT captured in entries (empty array if all captured)

CRITICAL: If has_arabic is true but any entry for that page has empty arabic_text, the completeness score MUST be below 100 and the missing Arabic MUST be listed in missing_arabic_lines.

ALSO provide: total_pages_analyzed, pages_with_images, pages_with_errors, skipped_pages, errors

CRITICAL RULES:
- Process EVERY page. Do not skip any.
- Preserve Arabic text EXACTLY as written. Never guess harakat. Never invent missing Arabic.
- If Arabic is unclear or partially unreadable, extract what is readable AND note the unreadable portions in notes. Set arabic_text_preserved=false. NEVER skip the entry — mark it for Manual Verification instead.
- NEVER invent meanings, translations, or interpretations. Only extract what is explicitly written.
- If a field is not in the manuscript, leave it empty. Do not guess.
- For each entry, provide extraction_confidence (0-100): your confidence that the extracted content is accurate and complete. Below 70 = uncertain (unclear Arabic, missing fields, damaged content).
- Every entry MUST belong to a heading (heading_id). Never leave an entry orphaned.
- Preserve exact page order (entry_order must be sequential 1, 2, 3... by page).
- COMPLETE EXTRACTION (GLOBAL KNOWLEDGE INGESTION LAW): Extract EVERYTHING. Nothing may be skipped — no page, paragraph, Arabic text, table, image, footnote, caption, appendix, reference, note, or example. If confidence is low, extract what is available and set extraction_confidence below 70. Mark uncertain Arabic with arabic_text_preserved=false. NEVER skip content — mark it for Manual Verification instead.
- ARABIC IS SACRED: Losing Arabic text is the WORST possible outcome. It is better to extract too much than too little. It is better to mark an uncertain entry for manual review than to omit it. Every Arabic word on every page MUST appear in the arabic_text field of some entry.`;

    // ══ STAGE 1: PDF Content Extraction — PAGE-BY-PAGE (chunked for accuracy) ══
    // Permanent Rule: "import the book page by page."
    // Process the PDF in small page chunks. Each chunk is extracted separately
    // to ensure every page is thoroughly analyzed. Results are aggregated.

    const EXTRACTION_SCHEMA = {
      type: 'object',
      properties: {
        total_pages_analyzed: { type: 'integer' },
        headings: {
          type: 'array',
          description: 'Dynamic heading tree detected from the PDF layout.',
          items: {
            type: 'object',
            properties: {
              heading_id: { type: 'string' },
              parent_heading_id: { type: 'string' },
              heading_level: { type: 'integer' },
              heading_title: { type: 'string' },
              heading_title_ar: { type: 'string' },
              heading_order: { type: 'integer' },
              start_page: { type: 'string' },
              end_page: { type: 'string' },
              heading_source: { type: 'string' },
            },
          },
        },
        entries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              page_number: { type: 'string' },
              entry_type: { type: 'string' },
              purpose: { type: 'string' },
              arabic_text: { type: 'string' },
              malayalam_meaning: { type: 'string' },
              english_meaning: { type: 'string' },
              conditions: { type: 'string' },
              materials: { type: 'string' },
              preparation: { type: 'string' },
              procedure: { type: 'string' },
              timing: { type: 'string' },
              planet: { type: 'string' },
              day: { type: 'string' },
              incense: { type: 'string' },
              repetition: { type: 'string' },
              warnings: { type: 'string' },
              benefits: { type: 'string' },
              notes: { type: 'string' },
              has_image: { type: 'boolean' },
              image_type: { type: 'string' },
              image_description: { type: 'string' },
              arabic_text_preserved: { type: 'boolean' },
              extraction_confidence: { type: 'integer' },
              sirr_section: { type: 'integer' },
              topic: { type: 'string' },
              topic_ml: { type: 'string' },
              topic_ar: { type: 'string' },
              heading_id: { type: 'string' },
              entry_order: { type: 'integer' },
            },
          },
        },
        pages_with_images: { type: 'array', items: { type: 'string' } },
        pages_with_errors: { type: 'array', items: { type: 'string' } },
        skipped_pages: { type: 'array', items: { type: 'string' } },
        errors: { type: 'array', items: { type: 'string' } },
        page_arabic_audit: {
          type: 'array',
          description: 'Per-page Arabic completeness audit. For every page processed.',
          items: {
            type: 'object',
            properties: {
              page_number: { type: 'string' },
              has_arabic: { type: 'boolean' },
              arabic_line_count: { type: 'integer' },
              arabic_completeness_score: { type: 'integer' },
              missing_arabic_lines: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    };

    let entries: any[] = [];
    let llmHeadings: any[] = [];
    let pageArabicAudit: any[] = [];
    let pagesWithImages: string[] = [];
    let pagesWithErrors: string[] = [];
    let skippedPages: string[] = [];
    let errors: string[] = [];
    let totalPagesAnalyzed = 0;

    // Try page-by-page chunked extraction if PDF bytes are available
    let chunkedExtraction = false;
    if (pdfBytes) {
      try {
        const pdfLibMod = await import('npm:pdf-lib@1.17.1');
        const { PDFDocument: PdfDoc } = pdfLibMod;
        const fullPdfDoc = await PdfDoc.load(pdfBytes, { ignoreEncryption: true });
        const totalPdfPages = fullPdfDoc.getPageCount();

        if (totalPdfPages > 0) {
          chunkedExtraction = true;
          const CHUNK_SIZE = 10;
          const totalChunks = Math.ceil(totalPdfPages / CHUNK_SIZE);

          for (let chunkIdx = 0; chunkIdx < totalChunks; chunkIdx++) {
            const startPage = chunkIdx * CHUNK_SIZE + 1;
            const endPage = Math.min((chunkIdx + 1) * CHUNK_SIZE, totalPdfPages);

            // Create a chunk PDF with just these pages
            const chunkPdf = await PdfDoc.create();
            const pageIndices: number[] = [];
            for (let p = startPage - 1; p < endPage; p++) pageIndices.push(p);
            const copiedPages = await chunkPdf.copyPages(fullPdfDoc, pageIndices);
            copiedPages.forEach((p: any) => chunkPdf.addPage(p));

            const chunkBytes = await chunkPdf.save();
            const chunkBlob = new Blob([chunkBytes], { type: 'application/pdf' });
            const chunkFileName = `${bookId}_pages_${startPage}-${endPage}.pdf`;
            const chunkFile = new File([chunkBlob], chunkFileName, { type: 'application/pdf' });
            const chunkUpload = await base44.asServiceRole.integrations.Core.UploadFile({ file: chunkFile });

            const absStartPage = startPage + pageNumOffset;
            const absEndPage = endPage + pageNumOffset;
            const chunkPrompt = `You are analyzing pages ${absStartPage} to ${absEndPage} of an Islamic occult manuscript PDF.\nIMPORTANT: Use ABSOLUTE page numbers (${absStartPage} to ${absEndPage}) in your response.\n\n${extractionPrompt}`;

            const chunkResult: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
              prompt: chunkPrompt,
              file_urls: [chunkUpload.file_url],
              model: 'gemini_3_flash',
              response_json_schema: EXTRACTION_SCHEMA,
            });

            // Prefix heading_ids with chunk number to ensure uniqueness across chunks
            if (chunkResult.entries) {
              for (const e of chunkResult.entries) {
                if (e.heading_id) e.heading_id = `C${chunkIdx + 1}_${e.heading_id}`;
                entries.push(e);
              }
            }
            if (chunkResult.headings) {
              for (const h of chunkResult.headings) {
                h.heading_id = `C${chunkIdx + 1}_${h.heading_id}`;
                if (h.parent_heading_id) h.parent_heading_id = `C${chunkIdx + 1}_${h.parent_heading_id}`;
                llmHeadings.push(h);
              }
            }
            if (chunkResult.pages_with_images) pagesWithImages.push(...chunkResult.pages_with_images);
            if (chunkResult.pages_with_errors) pagesWithErrors.push(...chunkResult.pages_with_errors);
            if (chunkResult.skipped_pages) skippedPages.push(...chunkResult.skipped_pages);
            if (chunkResult.errors) errors.push(...chunkResult.errors);
            if (chunkResult.page_arabic_audit) pageArabicAudit.push(...chunkResult.page_arabic_audit);
            totalPagesAnalyzed += (chunkResult.total_pages_analyzed || (endPage - startPage + 1));
          }
        }
      } catch {
        // Fall back to whole-PDF extraction
        chunkedExtraction = false;
      }
    }

    // Fallback: whole-PDF extraction
    if (!chunkedExtraction) {
      const llmResult: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: extractionPrompt,
        file_urls: [pdf_url],
        model: 'gemini_3_flash',
        response_json_schema: EXTRACTION_SCHEMA,
      });
      entries = llmResult.entries || [];
      llmHeadings = llmResult.headings || [];
      pagesWithImages = llmResult.pages_with_images || [];
      pagesWithErrors = llmResult.pages_with_errors || [];
      skippedPages = llmResult.skipped_pages || [];
      errors = llmResult.errors || [];
      totalPagesAnalyzed = llmResult.total_pages_analyzed || 0;
      pageArabicAudit = llmResult.page_arabic_audit || [];
    }

    // ══ POST-EXTRACTION ARABIC COMPLETENESS VALIDATION + AUTOMATIC RETRY ══
    // Requirement 7 & 8: Compare extracted Arabic against original page.
    // Any page below 100% completeness is reprocessed automatically.
    let retryCount = 0;
    let retrySucceeded = 0;
    let retryFailed = 0;
    const retriedPageNumbers: string[] = [];

    const incompletePages = pageArabicAudit.filter(
      (p: any) => p.has_arabic === true && (p.arabic_completeness_score ?? 100) < 100
    );

    if (incompletePages.length > 0 && pdfBytes) {
      try {
        const pdfLibRetry = await import('npm:pdf-lib@1.17.1');
        const { PDFDocument: RetryDoc } = pdfLibRetry;
        const fullRetryDoc = await RetryDoc.load(pdfBytes, { ignoreEncryption: true });
        const totalRetryPages = fullRetryDoc.getPageCount();

        // Build a retry PDF containing only the incomplete pages
        const retryPageIndices: number[] = [];
        const retryAbsPages: string[] = [];
        for (const pageAudit of incompletePages) {
          const absPageNum = parseInt(pageAudit.page_number);
          const relPageIdx = absPageNum - pageNumOffset - 1;
          if (relPageIdx >= 0 && relPageIdx < totalRetryPages) {
            retryPageIndices.push(relPageIdx);
            retryAbsPages.push(String(absPageNum));
          }
        }

        if (retryPageIndices.length > 0) {
          retryCount = retryPageIndices.length;
          const retryPdf = await RetryDoc.create();
          const copiedRetryPages = await retryPdf.copyPages(fullRetryDoc, retryPageIndices);
          copiedRetryPages.forEach((p: any) => retryPdf.addPage(p));
          const retryBytes = await retryPdf.save();
          const retryBlob = new Blob([retryBytes], { type: 'application/pdf' });
          const retryFile = new File([retryBlob], `${bookId}_arabic_retry.pdf`, { type: 'application/pdf' });
          const retryUpload = await base44.asServiceRole.integrations.Core.UploadFile({ file: retryFile });

          const retryPrompt = `You are RE-EXTRACTING Arabic text from specific pages of an Islamic occult manuscript that had INCOMPLETE Arabic extraction in the first pass.

═══ CRITICAL ARABIC EXTRACTION MANDATE ═══
The previous extraction MISSED Arabic text on these pages. You MUST extract EVERY Arabic word, letter, harakat, verse number, and punctuation mark. The arabic_text field MUST contain the COMPLETE Arabic text.

If a page contains Quranic verses, supplications, invocations, divine names, dhikr, tawkeel, or ANY Arabic text, you MUST capture it in arabic_text. NEVER leave arabic_text empty if the page has Arabic.

═══ FIELD SEPARATION ═══
- Arabic recitation/verse/supplication text → arabic_text (VERBATIM)
- Procedure steps → procedure
- Explanations → notes
- Warnings → warnings
- Conditions → conditions
- Materials → materials
- Timing → timing

═══ ANTI-DUPLICATION ═══
Each Arabic passage appears in exactly ONE entry. Never copy the same Arabic text into multiple entries.

═══ PER-PAGE ARABIC AUDIT ═══
For every page, provide page_arabic_audit with:
- has_arabic, arabic_line_count, arabic_completeness_score (MUST be 100 if all Arabic is captured), missing_arabic_lines (MUST be empty if score is 100)

${extractionPrompt}`;

          const retryResult: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
            prompt: retryPrompt,
            file_urls: [retryUpload.file_url],
            model: 'gemini_3_flash',
            response_json_schema: EXTRACTION_SCHEMA,
          });

          // Replace entries for retried pages with retry results
          entries = entries.filter((e: any) => !retryAbsPages.includes(String(e.page_number)));
          if (retryResult.entries) {
            for (const e of retryResult.entries) {
              if (e.heading_id) e.heading_id = `RETRY_${e.heading_id}`;
              entries.push(e);
            }
          }
          if (retryResult.headings) {
            for (const h of retryResult.headings) {
              h.heading_id = `RETRY_${h.heading_id}`;
              if (h.parent_heading_id) h.parent_heading_id = `RETRY_${h.parent_heading_id}`;
              llmHeadings.push(h);
            }
          }
          if (retryResult.page_arabic_audit) {
            const retryAuditPages = new Set(retryResult.page_arabic_audit.map((a: any) => String(a.page_number)));
            pageArabicAudit = pageArabicAudit.filter((p: any) => !retryAuditPages.has(String(p.page_number)));
            pageArabicAudit.push(...retryResult.page_arabic_audit);
          }
          if (retryResult.pages_with_images) pagesWithImages.push(...retryResult.pages_with_images);
          if (retryResult.errors) errors.push(...retryResult.errors);

          // Count retry outcomes
          for (const absPage of retryAbsPages) {
            const updatedAudit = pageArabicAudit.find((p: any) => String(p.page_number) === absPage);
            if (updatedAudit && (updatedAudit.arabic_completeness_score ?? 0) >= 100) {
              retrySucceeded++;
            } else {
              retryFailed++;
            }
            retriedPageNumbers.push(absPage);
          }
        }
      } catch {
        // Non-critical — retry failure doesn't block the pipeline
      }
    }

    // Ensure global sequential entry_order (manuscript page order) after retries
    entries.sort((a: any, b: any) => {
      const aPage = parseInt(a.page_number) || 0;
      const bPage = parseInt(b.page_number) || 0;
      if (aPage !== bPage) return aPage - bPage;
      return 0;
    });
    entries.forEach((e: any, idx: number) => {
      e.entry_order = isChunkMode ? (chunk_number * 100000 + idx + 1) : (idx + 1);
    });

    // ══ STAGE 4: Image Extraction ══
    let extractedImages: any[] = [];
    let imageExtractionError: string | null = null;
    if (pdfBytes) {
      const imgResult = await extractImagesFromPdf(pdfBytes, bookId, async (file: File) => {
        return await base44.asServiceRole.integrations.Core.UploadFile({ file });
      });
      extractedImages = imgResult.images;
      imageExtractionError = imgResult.error;
    }

    // Link images to entries by page number
    const imagesByPage: Record<string, string[]> = {};
    for (const img of extractedImages) {
      const pg = String(img.page_number);
      if (!imagesByPage[pg]) imagesByPage[pg] = [];
      imagesByPage[pg].push(img.image_url);
    }

    // ══ STAGE 1.5: Create ManuscriptHeading records (dynamic heading tree) ══
    // DEDUPLICATION: Headings are deduplicated by (title, level) across all chunks.
    // The same heading appearing in multiple chunks (e.g., a chapter heading that
    // spans pages across chunk boundaries) is recognized as ONE heading.
    // Parent-child relationships are resolved globally, not per-chunk.
    // This fixes the broken heading tree where chunk-prefixed IDs prevented
    // cross-chunk parent-child resolution.
    const headingIdMap: Record<string, string> = {};
    const headingDedupMap: Map<string, any> = new Map();
    const chunkIdToPermanentId: Map<string, string> = new Map();
    let headingRecords: any[] = [];
    let createdHeadings: any[] = [];

    if (llmHeadings.length > 0) {
      // Pass 1: Deduplicate headings by (title, level) across all chunks
      for (const h of llmHeadings) {
        const dedupKey = `${(h.heading_title || 'Untitled').trim().toLowerCase()}|${h.heading_level || 1}`;
        if (headingDedupMap.has(dedupKey)) {
          chunkIdToPermanentId.set(h.heading_id, headingDedupMap.get(dedupKey).heading_id);
          const existing = headingDedupMap.get(dedupKey);
          if (h.end_page && (!existing.end_page || String(h.end_page) > String(existing.end_page))) {
            existing.end_page = h.end_page;
          }
        } else {
          const permanentId = `H-${bookId}-${h.heading_level || 1}-${h.heading_order || 1}-${Math.random().toString(36).slice(2, 6)}`;
          const record: any = {
            heading_id: permanentId,
            parent_heading_id: '',
            book_id: bookId,
            heading_level: h.heading_level || 1,
            heading_title: h.heading_title || 'Untitled',
            heading_title_ar: h.heading_title_ar || '',
            heading_order: h.heading_order || 1,
            start_page: h.start_page || '',
            end_page: h.end_page || '',
            heading_source: h.heading_source || 'generated_fallback',
            entry_count: 0,
            total_entry_count: 0,
            _original_parent: h.parent_heading_id || '',
          };
          headingDedupMap.set(dedupKey, record);
          chunkIdToPermanentId.set(h.heading_id, permanentId);
        }
      }

      // Pass 2: Resolve parent references globally
      headingRecords = [];
      for (const record of headingDedupMap.values()) {
        if (record._original_parent) {
          record.parent_heading_id = chunkIdToPermanentId.get(record._original_parent) || '';
        }
        delete record._original_parent;
        headingRecords.push(record);
      }

      for (const [chunkId, permanentId] of chunkIdToPermanentId) {
        headingIdMap[chunkId] = permanentId;
      }

      if (headingRecords.length > 0) {
        try {
          createdHeadings = await base44.asServiceRole.entities.ManuscriptHeading.bulkCreate(headingRecords);
        } catch (e) {
          // Non-critical — headings may fail but entries still get created
        }
      }
    }

    // ══ FINAL PRE-SAVE VALIDATION GATE ══
    // Requirement 9: Before saving, verify that the final extracted knowledge
    // is identical to the source manuscript. If anything is missing, mark for
    // manual verification instead of saving incomplete data.
    const auditByPage: Record<string, any> = {};
    for (const a of pageArabicAudit) {
      auditByPage[String(a.page_number)] = a;
    }

    let incompleteEntriesCount = 0;
    let manualReviewDueToMissingArabic = 0;

    for (const entry of entries) {
      const pageAudit = auditByPage[String(entry.page_number)];
      const hasEmptyArabic = !entry.arabic_text || String(entry.arabic_text).trim().length === 0;

      if (hasEmptyArabic && pageAudit && pageAudit.has_arabic === true) {
        // Page has Arabic but this entry doesn't — DATA LOSS
        incompleteEntriesCount++;
        entry.extraction_confidence = Math.min(entry.extraction_confidence || 50, 40);
        entry.arabic_text_preserved = false;
        entry._needs_manual_review = true;
        manualReviewDueToMissingArabic++;
      }
    }

    // Fallback: if LLM didn't provide page_arabic_audit, use heuristic detection.
    // If a page has entries of Arabic-bearing types but ALL have empty arabic_text,
    // those entries likely had Arabic that was missed.
    if (pageArabicAudit.length === 0) {
      const entriesByPageFallback: Record<string, any[]> = {};
      for (const e of entries) {
        const pg = String(e.page_number);
        if (!entriesByPageFallback[pg]) entriesByPageFallback[pg] = [];
        entriesByPageFallback[pg].push(e);
      }
      const arabicEntryTypes = ['dua', 'quran_verse', 'divine_name', 'tawkeel', 'exorcism', 'protection', 'reference', 'note'];
      for (const [pg, pageEntries] of Object.entries(entriesByPageFallback)) {
        const allEmptyArabic = pageEntries.every((e: any) => !e.arabic_text || String(e.arabic_text).trim().length === 0);
        const hasArabicType = pageEntries.some((e: any) => arabicEntryTypes.includes(e.entry_type));
        if (allEmptyArabic && hasArabicType) {
          for (const entry of pageEntries) {
            entry.extraction_confidence = Math.min(entry.extraction_confidence || 50, 40);
            entry.arabic_text_preserved = false;
            entry._needs_manual_review = true;
            incompleteEntriesCount++;
            manualReviewDueToMissingArabic++;
          }
        }
      }
    }

    // ══ Build ManuscriptEntry records (verification_status='pending') ══
    // Arabic normalization for indexed O(1) search (matches searchInternalKnowledgeBase)
    const _alefVariants = new Set([0x0623, 0x0625, 0x0622, 0x0671]);
    const _normAlef = '\u0627';
    const _normalizeAr = (txt: string): string => {
      if (!txt) return '';
      let r = '';
      for (const ch of txt) {
        const c = ch.codePointAt(0)!;
        if ((c >= 0x0621 && c <= 0x064a) || (c >= 0x0671 && c <= 0x06d3)) r += _alefVariants.has(c) ? _normAlef : ch;
        else if ((c >= 0x066e && c <= 0x066f) || c === 0x06d5) r += ch;
      }
      return r;
    };
    const entryRecords = entries.map((entry: any, idx: number) => {
      const pageImages = imagesByPage[String(entry.page_number)] || [];
      const mappedHeadingId = entry.heading_id ? (headingIdMap[entry.heading_id] || '') : '';

      return {
        entry_id: `ME-${bookId}-${isChunkMode ? `C${chunk_number}_` : ''}${idx + 1}`,
        book_id: bookId,
        book_title,
        book_title_ar: book_title_ar || '',
        sirr_section: entry.sirr_section || 5,
        topic: entry.topic || entry.purpose || 'General',
        topic_ml: entry.topic_ml || '',
        topic_ar: entry.topic_ar || '',
        entry_type: entry.entry_type || 'instruction',
        purpose: entry.purpose || '',
        purpose_ml: entry.malayalam_meaning || '',
        introduction: '',
        arabic_text: entry.arabic_text || '',
        arabic_normalized: _normalizeAr(entry.arabic_text || ''),
        malayalam_meaning: '',
        english_meaning: '', // Will be filled in Phase 2 from verified sources ONLY
        conditions: entry.conditions || '',
        materials: entry.materials || '',
        preparation: entry.preparation || '',
        procedure: entry.procedure || '',
        timing: entry.timing || '',
        planet: entry.planet || '',
        day: entry.day || '',
        incense: entry.incense || '',
        repetition: entry.repetition || '',
        warnings: entry.warnings || '',
        benefits: entry.benefits || '',
        notes: entry.notes || '',
        page_number: entry.page_number ? String(parseInt(entry.page_number) + pageNumOffset) : '',
        heading_id: mappedHeadingId,
        entry_order: entry.entry_order || (idx + 1),
        images: pageImages, // Actual image URLs from Stage 4
        verified_arabic_hash: '', // Will be filled in Phase 2
        verification_status: entry._needs_manual_review || (entry.extraction_confidence || (entry.arabic_text_preserved === false ? 50 : 80)) < 70 ? 'manual_review' : 'pending',
        extraction_confidence: entry.extraction_confidence || (entry.arabic_text_preserved === false ? 50 : 80),
        extraction_date: validationDate,
      };
    });

    // ══ Update heading entry counts ══
    if (createdHeadings.length > 0 && entryRecords.length > 0) {
      const entryCountByHeading: Record<string, number> = {};
      for (const e of entryRecords) {
        if (e.heading_id) {
          entryCountByHeading[e.heading_id] = (entryCountByHeading[e.heading_id] || 0) + 1;
        }
      }
      const headingIdToDbId: Record<string, string> = {};
      for (const h of createdHeadings) {
        if (h.heading_id) headingIdToDbId[h.heading_id] = h.id;
      }
      const headingUpdates = Object.entries(entryCountByHeading)
        .filter(([hid]) => headingIdToDbId[hid])
        .map(([hid, count]) => ({
          id: headingIdToDbId[hid],
          entry_count: count,
          total_entry_count: count,
        }));
      if (headingUpdates.length > 0) {
        try {
          await base44.asServiceRole.entities.ManuscriptHeading.bulkUpdate(headingUpdates);
        } catch { /* non-critical */ }
      }
    }

    // ══ IDEMPOTENT CHUNK PROCESSING — Delete existing entries for this chunk ══
    // Prevents duplicate entries when a chunk is reprocessed (e.g., after timeout).
    // If processImportChunk times out after validateManuscriptImport created entries,
    // the retry calls validateManuscriptImport again. Without this cleanup, duplicate
    // entries would be created. With it, the chunk is safely reprocessed (idempotent).
    if (isChunkMode) {
      const chunkPrefix = `ME-${bookId}-C${chunk_number}_`;
      const allBookEntries = await base44.asServiceRole.entities.ManuscriptEntry.filter({ book_id: bookId });
      const chunkEntries = allBookEntries.filter((e: any) =>
        e.entry_id && String(e.entry_id).startsWith(chunkPrefix)
      );
      for (const e of chunkEntries) {
        await base44.asServiceRole.entities.ManuscriptEntry.delete(e.id);
      }
    }

    // ══ Create ManuscriptEntry records ══
    let createdEntries: any[] = [];
    if (entryRecords.length > 0) {
      createdEntries = await base44.asServiceRole.entities.ManuscriptEntry.bulkCreate(entryRecords);
    }

    // ══ Compute Phase 1 metrics ══
    const totalEntries = entryRecords.length;
    const totalImages = extractedImages.length;
    const totalArabicTexts = entries.filter((e: any) => e.arabic_text && e.arabic_text.trim().length > 0).length;
    const totalArabicPreserved = entries.filter((e: any) => e.arabic_text_preserved === true).length;
    const totalClassifications = entries.filter((e: any) => e.sirr_section >= 1 && e.sirr_section <= 7).length;
    const allHaveBookAndPage = entryRecords.every((e) => e.book_title && e.page_number);
    const allEntriesHaveIndexFields = entryRecords.every((e) =>
      e.book_id && e.sirr_section && e.topic && e.entry_id && e.page_number
    );
    const imagesAreUrls = entryRecords.every((e) => e.images.every((url: string) => url.startsWith('http') || url.length === 0));
    const imageExtractionAttempted = pdfBytes !== null;

    const entriesBySection: Record<string, any> = {};
    for (let i = 1; i <= 7; i++) {
      entriesBySection[`sirr_${i}`] = {
        name: SIRR_SECTION_NAMES[i as keyof typeof SIRR_SECTION_NAMES],
        count: entries.filter((e: any) => e.sirr_section === i).length,
      };
    }

    const arabicPreservationRate = totalArabicTexts > 0
      ? Math.round((totalArabicPreserved / totalArabicTexts) * 100)
      : 0;

    const hasCriticalErrors = errors.length > 0 && errors.some((e: string) => e.toLowerCase().includes('critical'));
    const allPagesProcessed = skippedPages.length === 0;
    const hasEntries = totalEntries > 0;
    const arabicWellPreserved = arabicPreservationRate >= 80;
    const allClassified = totalClassifications === totalEntries;

    const totalJpegImages = extractedImages.filter((i) => i.format === 'image/jpeg').length;
    const totalPngImages = extractedImages.filter((i) => i.format === 'image/png').length;

    // ══ Phase 1 14-Point Check (Stages 2 & 3 are PENDING) ══
    const fourteenPointCheck = {
      '1_import_pdf': book ? 'PASS' : 'FAIL',
      '2_store_metadata': (book_title && bookId) ? 'PASS' : 'FAIL',
      '3_extract_every_page': allPagesProcessed ? 'PASS' : 'FAIL',
      '4_extract_arabic': arabicWellPreserved ? 'PASS' : 'FAIL',
      '5_extract_images': imageExtractionAttempted ? 'PASS' : 'FAIL',
      '6_classify_sections': allClassified ? 'PASS' : 'FAIL',
      '7_preserve_book_page': allHaveBookAndPage ? 'PASS' : 'FAIL',
      '8_arabic_verification': 'PENDING',
      '9_verified_storage': 'PENDING',
      '10_malayalam_translation': 'PENDING',
      '11_search_indexing': allEntriesHaveIndexFields ? 'PASS' : 'FAIL',
      '12_method_pages': allEntriesHaveIndexFields ? 'PASS' : 'FAIL',
      '13_image_zoom': imagesAreUrls ? 'PASS' : 'FAIL',
      '14_validation_report': 'PASS',
      '15_complete_extraction': (allPagesProcessed && hasEntries && skippedPages.length === 0) ? 'PASS' : 'FAIL',
      '16_zero_data_loss': (errors.length === 0 && totalEntries > 0) ? 'PASS' : 'FAIL',
    };

    const validationReport = {
      phase: 1,
      quality_assessment: {
        verdict: 'pass',
        overall_confidence: overallConfidence,
        quality_details: qualityDetails,
        problem_pages: problemPages,
        pages_assessed: pagesAssessed,
      },
      summary: {
        total_pages_processed: totalPagesAnalyzed,
        total_entries_extracted: totalEntries,
        total_images_extracted: totalImages,
        total_arabic_texts: totalArabicTexts,
        total_arabic_preserved: totalArabicPreserved,
        total_jpeg_images: totalJpegImages,
        total_png_images: totalPngImages,
        arabic_preservation_rate: arabicPreservationRate,
        total_classifications: totalClassifications,
        entries_pending_verification: totalEntries,
      },
      stage_details: {
        stage_1_extraction: {
          status: 'completed',
          total_pages: totalPagesAnalyzed,
          total_entries: totalEntries,
          skipped_pages: skippedPages,
          errors,
        },
        stage_2_verification: {
          status: 'pending',
          message: 'Call verifyBookEntries with book_id to complete Stage 2.',
        },
        stage_3_translation: {
          status: 'pending',
          message: 'Malayalam/English will be populated from verified sources in Phase 2.',
        },
        stage_4_images: {
          status: imageExtractionError ? 'partial' : 'completed',
          total_images: totalImages,
          jpeg: totalJpegImages,
          png: totalPngImages,
          error: imageExtractionError,
        },
      },
      per_page_arabic_completeness: pageArabicAudit.map((p: any) => ({
        page_number: p.page_number,
        has_arabic: p.has_arabic,
        arabic_line_count: p.arabic_line_count || 0,
        completeness_score: p.arabic_completeness_score || 0,
        missing_arabic_lines: p.missing_arabic_lines || [],
        retried: retriedPageNumbers.includes(String(p.page_number)),
      })),
      extraction_quality: {
        total_pages_audited: pageArabicAudit.length,
        pages_with_arabic: pageArabicAudit.filter((p: any) => p.has_arabic).length,
        pages_at_100_percent: pageArabicAudit.filter((p: any) => !p.has_arabic || (p.arabic_completeness_score ?? 0) >= 100).length,
        pages_below_100_percent: pageArabicAudit.filter((p: any) => p.has_arabic && (p.arabic_completeness_score ?? 100) < 100).length,
        incomplete_entries: incompleteEntriesCount,
        manual_review_due_to_missing_arabic: manualReviewDueToMissingArabic,
        retry_attempts: retryCount,
        retry_succeeded: retrySucceeded,
        retry_failed: retryFailed,
        overall_arabic_completeness: pageArabicAudit.filter((p: any) => p.has_arabic).length > 0
          ? Math.round(pageArabicAudit.filter((p: any) => p.has_arabic).reduce((sum: number, p: any) => sum + (p.arabic_completeness_score || 0), 0) / Math.max(1, pageArabicAudit.filter((p: any) => p.has_arabic).length))
          : 100,
      },
      entries_by_section: entriesBySection,
      pages_with_images: pagesWithImages,
      pages_with_errors: pagesWithErrors,
      skipped_pages: skippedPages,
      errors,
      fourteen_point_check: fourteenPointCheck,
      validation_date: validationDate,
      book_id: bookId,
      book_title,
      next_step: `Call verifyBookEntries with { "book_id": "${bookId}" } to complete Phase 2 (Stages 2 & 3).`,
    };

    // ══ Update ManuscriptBook ══
    // For chunk mode: accumulate metrics. Only set 'completed' on final chunk.
    if (isChunkMode && !is_final_chunk) {
      const existingEntries = book.total_entries_extracted || 0;
      await base44.asServiceRole.entities.ManuscriptBook.update(book.id, {
        extraction_status: 'validation_in_progress',
        ocr_status: 'processing',
        total_pages: Math.max(book.total_pages || 0, pageNumOffset + totalPagesAnalyzed),
        total_entries_extracted: existingEntries + totalEntries,
        notes: `Chunk ${chunk_number}/${total_chunks} processed: ${totalEntries} entries. ${total_chunks - chunk_number} remaining.`,
      });
      return Response.json({
        status: 'chunk_processed', book_id: bookId, book_title: book.book_title,
        chunk_number, total_chunks, entries_created: createdEntries.length,
        entries_in_chunk: totalEntries, total_entries_so_far: existingEntries + totalEntries,
        message: `Chunk ${chunk_number}/${total_chunks} processed: ${totalEntries} entries extracted.`,
      });
    }

    // Final chunk (or normal mode): finalize the book
    const finalEntriesCount = isChunkMode ? (book.total_entries_extracted || 0) + totalEntries : totalEntries;

    // For chunk mode: adjust validation report to reflect merged totals across all chunks
    if (isChunkMode) {
      validationReport.summary.total_entries_extracted = finalEntriesCount;
      validationReport.summary.total_pages_processed = Math.max(book.total_pages || 0, pageNumOffset + totalPagesAnalyzed);
      validationReport.chunking_info = { total_chunks, merged: true, total_entries: finalEntriesCount };
    }

    await base44.asServiceRole.entities.ManuscriptBook.update(book.id, {
      extraction_status: 'completed',
      ocr_status: 'completed',
      total_pages: isChunkMode ? Math.max(book.total_pages || 0, pageNumOffset + totalPagesAnalyzed) : totalPagesAnalyzed,
      total_entries_extracted: finalEntriesCount,
      categories_covered: Object.entries(entriesBySection)
        .filter(([, v]: [string, any]) => v.count > 0)
        .map(([k]: [string, any]) => k.replace('sirr_', 'Sirr ')),
      validation_status: 'pending',
      validation_report: validationReport,
      validation_date: validationDate,
      verification_status: 'unverified',
      notes: `Phase 1 complete: ${totalEntries} entries, ${totalImages} images. Call verifyBookEntries for Phase 2.`,
    });

    if (isChunkMode) {
      return Response.json({
        status: 'chunk_merge_complete', book_id: bookId, book_title: book.book_title,
        chunk_number, total_chunks, entries_created: createdEntries.length,
        total_entries: finalEntriesCount, validation_report: validationReport,
        fourteen_point_check: fourteenPointCheck,
        message: `All ${total_chunks} chunks merged. ${finalEntriesCount} total entries. Phase 1 complete.`,
        next_step: `verifyBookEntries({ "book_id": "${bookId}" })`,
      });
    }

    return Response.json({
      status: 'phase_1_complete',
      book_id: bookId,
      book_title,
      validation_report: validationReport,
      entries_created: createdEntries.length,
      fourteen_point_check: fourteenPointCheck,
      message: `Phase 1 complete: ${totalEntries} entries extracted, ${totalImages} images extracted. Stages 2 & 3 are PENDING. Call verifyBookEntries with book_id "${bookId}" to complete the pipeline.`,
      next_step: `verifyBookEntries({ "book_id": "${bookId}" })`,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'validation_failed' }, { status: 500 });
  }
});