import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT IMPORT ENGINE — PDF → KNOWLEDGE EXTRACTION
// ═══════════════════════════════════════════════════════════════
// Analyzes every page of a PDF and extracts:
//   Rituals, Duas, Quran verses, Divine Names, Wafq, Taweez,
//   Diagrams, Images, Tables, Instructions, Materials, Timing,
//   Conditions, Warnings, Notes, References
//
// Auto-classifies every entry into the correct Sirr section (1-7).
// Creates ManuscriptBook + ManuscriptEntry records.
// The original PDF always remains the master source.
//
// ADMIN ONLY.
// ═══════════════════════════════════════════════════════════════

const SIRR_SECTIONS = {
  1: "Diseases & Healing",
  2: "Jinn, Ruqyah & Spiritual Protection",
  3: "Mahabbah, Acceptance & Relationships",
  4: "Wafq, Taweez, Magic Squares & Spiritual Methods",
  5: "Duas, Quranic Verses, Divine Names & Invocations",
  6: "Herbs, Incense, Oils, Plants & Traditional Remedies",
  7: "Sacred Times, Planetary Hours, Lunar Mansions & Spiritual Rules",
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { pdf_url, book_title, book_title_ar, author, language, source, original_file_name, tradition } = body;

    if (!pdf_url || !book_title) {
      return Response.json({ error: 'pdf_url and book_title are required' }, { status: 400 });
    }

    // ── Generate permanent book_id ──
    const bookId = `MS-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const uploadDate = new Date().toISOString();

    // ── Create ManuscriptBook record (status: processing) ──
    const book = await base44.asServiceRole.entities.ManuscriptBook.create({
      book_id: bookId,
      book_title,
      book_title_ar: book_title_ar || '',
      author: author || '',
      language: language || 'Arabic',
      source: source || 'onedrive',
      original_file_url: pdf_url,
      original_file_name: original_file_name || '',
      upload_date: uploadDate,
      version: '1.0',
      total_pages: 0,
      ocr_status: 'processing',
      verification_status: 'unverified',
      extraction_status: 'processing',
      categories_covered: [],
      total_entries_extracted: 0,
      tradition: tradition || '',
      notes: '',
    });

    // ── Extract content from PDF using ExtractDataFromUploadedFile ──
    const extractionSchema = {
      type: 'object',
      properties: {
        entries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              entry_type: { type: 'string', description: 'Type: ritual, dua, quran_verse, divine_name, wafq, taweez, diagram, instruction, material, timing, condition, warning, note, reference, exorcism, protection, incense, herb' },
              purpose: { type: 'string', description: 'Purpose or goal' },
              arabic_text: { type: 'string', description: 'Original Arabic text verbatim from the manuscript' },
              malayalam_meaning: { type: 'string', description: 'Malayalam translation' },
              english_meaning: { type: 'string', description: 'English translation' },
              conditions: { type: 'string', description: 'Conditions or prerequisites' },
              materials: { type: 'string', description: 'Materials required' },
              preparation: { type: 'string', description: 'Preparation instructions' },
              procedure: { type: 'string', description: 'Procedure steps' },
              timing: { type: 'string', description: 'Timing requirements' },
              planet: { type: 'string', description: 'Associated planet' },
              day: { type: 'string', description: 'Suitable day' },
              incense: { type: 'string', description: 'Required incense' },
              repetition: { type: 'string', description: 'Repetition count' },
              warnings: { type: 'string', description: 'Warnings' },
              benefits: { type: 'string', description: 'Benefits or expected results' },
              notes: { type: 'string', description: 'Additional notes' },
              page_number: { type: 'string', description: 'Page number in the PDF' },
            },
          },
        },
      },
    };

    const extractResult = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url: pdf_url,
      json_schema: extractionSchema,
    });

    if (extractResult.status !== 'success' || !extractResult.output) {
      // Update book status to failed
      await base44.asServiceRole.entities.ManuscriptBook.update(book.id, {
        extraction_status: 'failed',
        ocr_status: 'failed',
        notes: `Extraction failed: ${extractResult.details || 'Unknown error'}`,
      });
      return Response.json({ error: 'Extraction failed', details: extractResult.details, book_id: bookId }, { status: 500 });
    }

    const rawEntries = Array.isArray(extractResult.output)
      ? extractResult.output
      : (extractResult.output.entries || []);

    if (rawEntries.length === 0) {
      await base44.asServiceRole.entities.ManuscriptBook.update(book.id, {
        extraction_status: 'completed',
        ocr_status: 'completed',
        total_entries_extracted: 0,
        notes: 'No entries found in PDF.',
      });
      return Response.json({ status: 'completed', book_id: bookId, entries_extracted: 0, message: 'No entries found in PDF.' });
    }

    // ── Classify entries into Sirr sections using InvokeLLM ──
    const classificationPrompt = `You are an expert in Islamic occult manuscripts, spiritual texts, and traditional healing systems.

TASK: Classify each extracted entry into the correct Sirr section (1-7) and assign a concise topic name.

SIRR SECTIONS:
1 = Diseases & Healing (physical/spiritual diseases, treatments, remedies, medicine)
2 = Jinn, Ruqyah & Spiritual Protection (jinn, exorcism, spiritual warfare, evil eye, protection from spirits)
3 = Mahabbah, Acceptance & Relationships (love, attraction, marriage, relationships, acceptance)
4 = Wafq, Taweez, Magic Squares & Spiritual Methods (written amulets, seals, diagrams, magic squares, spiritual methods)
5 = Duas, Quranic Verses, Divine Names & Invocations (prayers, supplications, Quran verses, divine names, invocations)
6 = Herbs, Incense, Oils, Plants & Traditional Remedies (herbal medicine, incense recipes, oils, natural remedies)
7 = Sacred Times, Planetary Hours, Lunar Mansions & Spiritual Rules (timing, astrology, planetary hours, lunar mansions, rules, conditions, fasting)

ENTRIES TO CLASSIFY:
${JSON.stringify(rawEntries.map((e, i) => ({ index: i, type: e.entry_type, purpose: e.purpose, arabic_text: (e.arabic_text || '').slice(0, 200) })), null, 2)}

RULES:
- Assign exactly ONE Sirr section (1-7) to each entry.
- Assign a concise topic name (e.g., "Stomach Pain", "Love Attraction", "Ayat al-Kursi Protection").
- If the entry is a general rule/condition/timing, classify as section 7.
- If the entry is a dua/prayer/quran verse, classify as section 5.
- If the entry is about jinn/exorcism, classify as section 2.
- If the entry is a written amulet/seal/taweez, classify as section 4.
- If the entry is about herbs/incense, classify as section 6.
- If the entry is about love/relationships, classify as section 3.
- If the entry is about disease/healing, classify as section 1.
- Provide topic_ml (Malayalam) and topic_ar (Arabic) when possible.`;

    const classificationResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: classificationPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          classifications: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                index: { type: 'integer' },
                sirr_section: { type: 'integer', enum: [1, 2, 3, 4, 5, 6, 7] },
                topic: { type: 'string' },
                topic_ml: { type: 'string' },
                topic_ar: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const classifications = classificationResult.classifications || [];

    // ── Build ManuscriptEntry records ──
    const entryRecords = [];
    const sectionsCovered = new Set();

    rawEntries.forEach((rawEntry, idx) => {
      const classification = classifications.find((c) => c.index === idx) || {};
      const sirrSection = classification.sirr_section || 5; // Default to Duas
      sectionsCovered.add(`Sirr ${sirrSection}`);

      entryRecords.push({
        entry_id: `ME-${bookId}-${idx + 1}`,
        book_id: bookId,
        book_title: book_title,
        book_title_ar: book_title_ar || '',
        sirr_section: sirrSection,
        topic: classification.topic || rawEntry.purpose || 'General',
        topic_ml: classification.topic_ml || '',
        topic_ar: classification.topic_ar || '',
        entry_type: rawEntry.entry_type || 'instruction',
        purpose: rawEntry.purpose || '',
        purpose_ml: rawEntry.malayalam_meaning || '',
        introduction: rawEntry.introduction || '',
        arabic_text: rawEntry.arabic_text || '',
        malayalam_meaning: rawEntry.malayalam_meaning || '',
        english_meaning: rawEntry.english_meaning || '',
        conditions: rawEntry.conditions || '',
        materials: rawEntry.materials || '',
        preparation: rawEntry.preparation || '',
        procedure: rawEntry.procedure || '',
        timing: rawEntry.timing || '',
        planet: rawEntry.planet || '',
        day: rawEntry.day || '',
        incense: rawEntry.incense || '',
        repetition: rawEntry.repetition || '',
        warnings: rawEntry.warnings || '',
        benefits: rawEntry.benefits || '',
        notes: rawEntry.notes || '',
        page_number: rawEntry.page_number || '',
        images: [],
        verified_arabic_hash: '',
        verification_status: 'unverified',
        extraction_confidence: 80,
        extraction_date: uploadDate,
      });
    });

    // ── Bulk create entries ──
    const createdEntries = await base44.asServiceRole.entities.ManuscriptEntry.bulkCreate(entryRecords);

    // ── Update ManuscriptBook with completion status ──
    await base44.asServiceRole.entities.ManuscriptBook.update(book.id, {
      extraction_status: 'completed',
      ocr_status: 'completed',
      total_entries_extracted: entryRecords.length,
      categories_covered: Array.from(sectionsCovered),
      verification_status: 'partially_verified',
    });

    return Response.json({
      status: 'import_complete',
      book_id: bookId,
      book_title: book_title,
      total_entries: entryRecords.length,
      sections_covered: Array.from(sectionsCovered),
      entries: createdEntries,
    });
  } catch (error) {
    return Response.json({ error: error.message, status: 'import_failed' }, { status: 500 });
  }
});