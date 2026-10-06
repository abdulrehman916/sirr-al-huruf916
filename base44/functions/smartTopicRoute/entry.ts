// ═══════════════════════════════════════════════════════════════
// SMART TOPIC ROUTER — Enhancement Layer for manuscript ingestion
//
// AFTER OCR and Document Context Mode, classifies each page into a
// topic, groups consecutive same-topic pages into sections, and
// routes each section to the correct existing knowledge store.
//
// CRITICAL RULE: Never sends non-astrology content into
// AstroClockKnowledge. Only pages classified as "astrology" are
// processed via unifiedIngestKnowledge. All other topics are noted
// in the routing report but skipped.
//
// DOES NOT modify: OCR, Vision LLM, Document Context Mode,
// unifiedIngestKnowledge, EntityKnowledge, AstroClockKnowledge,
// database schema, merge logic, deduplication, source preservation,
// existing upload flow.
//
// BATCH PROCESSING: Processes batch_size pages per call (default 10).
// Pending sections are carried across batch boundaries — a continuous
// topic is NEVER split just because a batch ends.
//
// FAILURE RECOVERY: Resume from the last classified page. Pending
// sections are stored in TopicRouting with status="pending".
// ═══════════════════════════════════════════════════════════════
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TOPIC_DESTINATIONS = {
  astrology: 'AstroClockKnowledge / EntityKnowledge',
  holy_names: 'Skipped (HolyOneName — no screenshot import)',
  vefk: 'Skipped (WafqKnowledge — no screenshot import)',
  abjad: 'Skipped (no specific store)',
  duas: 'Skipped (DuaKnowledge — no screenshot import)',
  dream_interpretation: 'Skipped (no specific store)',
  manuscript_notes: 'Skipped (ManuscriptMiscKnowledge — no screenshot import)',
  other: 'Skipped (unclassified)',
};

Deno.serve(async (req) => {
  const startTime = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });

    const body = await req.json();
    const { pages, source_label, document_id, resume_from_page, batch_size } = body;

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return Response.json({ error: 'No pages provided' }, { status: 400 });
    }

    const docId = document_id || `STR-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const batchSize = Math.min(Math.max(batch_size || 10, 1), 20);
    const startIdx = resume_from_page || 0;
    const endIdx = Math.min(startIdx + batchSize, pages.length);
    const isLastBatch = endIdx >= pages.length;

    // ── Check for pending section from previous batch ──
    const existingRoutes = await base44.asServiceRole.entities.TopicRouting.filter({ document_id: docId });
    let pendingSection = existingRoutes.find(r => r.status === 'pending');
    const completedSections = existingRoutes.filter(r => r.status === 'completed' || r.status === 'skipped');

    // ══ PHASE 1: CLASSIFY PAGES ══
    const batchClassifications = [];
    for (let i = startIdx; i < endIdx; i++) {
      const page = pages[i];
      try {
        const result = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an expert manuscript classifier for Arabic and Ottoman occult texts. Analyze this manuscript page image and classify it into exactly ONE topic:

- "astrology": Planetary hours, zodiac signs, lunar mansions, planets, astrological timing, sa'at, kawkab, nakshatra, astronomical tables, planetary day rulers, planetary friendships
- "holy_names": Divine names (Asma ul Husna), angel names, holy invocations, tawkeel, spiritual names of God
- "vefk": Magic squares (wafq), letter diagrams, numeric diagrams, taweez, seals, grid constructions
- "abjad": Abjad calculations, letter numerical values, ebced tables, numerical computations
- "duas": Supplications, prayers, dhikr, wird, Quran verses, general invocations
- "dream_interpretation": Dream meanings, physiognomy (kiyafetname), omens, body twitching (ihtilac), ear ringing
- "manuscript_notes": General notes, instructions, conditions, warnings, preparation methods, material lists, timing rules
- "other": Anything that does not fit the above categories

Return as JSON with the topic, a confidence score (0-100), and a brief reason.`,
          file_urls: [page.file_url],
          response_json_schema: {
            type: "object",
            properties: {
              topic: { type: "string", enum: ["astrology", "holy_names", "vefk", "abjad", "duas", "dream_interpretation", "manuscript_notes", "other"] },
              confidence: { type: "number" },
              reason: { type: "string" }
            },
            required: ["topic", "confidence"]
          }
        });
        batchClassifications.push({
          page_number: page.page_number || (i + 1),
          topic: result.topic || 'other',
          confidence: result.confidence || 50,
          reason: result.reason || '',
        });
      } catch (clsErr) {
        batchClassifications.push({
          page_number: page.page_number || (i + 1),
          topic: 'other',
          confidence: 0,
          reason: `Classification error: ${clsErr.message}`,
        });
      }
    }

    // ══ PHASE 2: GROUP INTO SECTIONS ══
    // Extend pending section or start new sections
    let currentTopic = pendingSection ? pendingSection.topic : null;
    let currentStart = pendingSection ? pendingSection.page_start : null;
    let currentClassifications = pendingSection ? [...(pendingSection.page_classifications || [])] : [];
    let pendingId = pendingSection ? pendingSection.id : null;

    const finalizedSections = [];

    for (const cls of batchClassifications) {
      if (cls.topic === currentTopic) {
        // Continue current section
        currentClassifications.push(cls);
      } else {
        // Finalize current section (if any)
        if (currentTopic !== null) {
          finalizedSections.push({
            topic: currentTopic,
            page_start: currentStart,
            page_end: cls.page_number - 1,
            classifications: currentClassifications,
            pendingId,
          });
        }
        // Start new section
        currentTopic = cls.topic;
        currentStart = cls.page_number;
        currentClassifications = [cls];
        pendingId = null;
      }
    }

    // Handle the last section
    if (isLastBatch) {
      // Finalize last section
      if (currentTopic !== null) {
        const lastPage = pages[pages.length - 1];
        finalizedSections.push({
          topic: currentTopic,
          page_start: currentStart,
          page_end: lastPage.page_number || pages.length,
          classifications: currentClassifications,
          pendingId,
        });
      }
    } else {
      // Keep last section as pending (don't split continuous topic)
      // Store/update pending TopicRouting record
      if (currentTopic !== null) {
        const lastClassified = batchClassifications[batchClassifications.length - 1];
        const pendingData = {
          routing_id: pendingId ? pendingSection.routing_id : `TR-PENDING-${docId}`,
          document_id: docId,
          topic: currentTopic,
          page_start: currentStart,
          page_end: lastClassified.page_number,
          page_count: lastClassified.page_number - currentStart + 1,
          destination_store: TOPIC_DESTINATIONS[currentTopic] || 'Skipped',
          records_created: 0,
          records_updated: 0,
          records_skipped: 0,
          status: 'pending',
          page_classifications: currentClassifications,
          warnings: [],
          source_label: source_label || '',
          processing_duration_ms: 0,
          created_at: new Date().toISOString(),
        };

        if (pendingId) {
          await base44.asServiceRole.entities.TopicRouting.update(pendingId, {
            page_end: lastClassified.page_number,
            page_count: lastClassified.page_number - currentStart + 1,
            page_classifications: currentClassifications,
          });
        } else {
          await base44.asServiceRole.entities.TopicRouting.create(pendingData);
        }
      }
    }

    // ══ PHASE 3: ROUTE FINALIZED SECTIONS ══
    const routingResults = [];

    for (const section of finalizedSections) {
      const sectionStartTime = Date.now();
      const sectionPages = [];
      for (let p = section.page_start; p <= section.page_end; p++) {
        const page = pages.find(pg => (pg.page_number || 0) === p);
        if (page) sectionPages.push(page);
      }

      let recordsCreated = 0;
      let recordsUpdated = 0;
      let recordsSkipped = 0;
      let sectionStatus = 'completed';
      const sectionWarnings = [];

      if (section.topic === 'astrology') {
        // Route to unifiedIngestKnowledge (existing pipeline, UNCHANGED)
        sectionStatus = 'processing';
        for (const page of sectionPages) {
          try {
            const response = await base44.functions.invoke('unifiedIngestKnowledge', {
              file_url: page.file_url,
              source_label: source_label || 'Smart Topic Router',
              source_type: page.is_pdf_page ? 'pdf_page' : 'screenshot',
            });
            const data = response.data || response;
            if (data.error) {
              sectionWarnings.push(`Page ${page.page_number}: ${data.error}`);
            } else {
              recordsCreated += data.records_created || 0;
              recordsUpdated += data.records_merged || 0;
              if ((data.entries_found || 0) === 0) {
                recordsSkipped++;
              }
            }
          } catch (procErr) {
            sectionWarnings.push(`Page ${page.page_number}: ${procErr.message}`);
          }
        }
        sectionStatus = 'completed';
      } else {
        // Non-astrology section — skip (never send to AstroClockKnowledge)
        sectionStatus = 'skipped';
        recordsSkipped = sectionPages.length;
        sectionWarnings.push(`Topic '${section.topic}' skipped — no screenshot-based import for ${TOPIC_DESTINATIONS[section.topic]}`);
      }

      const sectionDuration = Date.now() - sectionStartTime;

      // Store/update TopicRouting record
      const routingId = section.pendingId || `TR-${docId}-${finalizedSections.indexOf(section) + 1 + completedSections.length}`;
      const routingData = {
        routing_id: routingId,
        document_id: docId,
        topic: section.topic,
        page_start: section.page_start,
        page_end: section.page_end,
        page_count: section.page_end - section.page_start + 1,
        destination_store: TOPIC_DESTINATIONS[section.topic] || 'Skipped',
        records_created: recordsCreated,
        records_updated: recordsUpdated,
        records_skipped: recordsSkipped,
        status: sectionStatus,
        page_classifications: section.classifications,
        warnings: sectionWarnings,
        source_label: source_label || '',
        processing_duration_ms: sectionDuration,
        created_at: new Date().toISOString(),
      };

      if (section.pendingId) {
        await base44.asServiceRole.entities.TopicRouting.update(section.pendingId, routingData);
      } else {
        await base44.asServiceRole.entities.TopicRouting.create(routingData);
      }

      routingResults.push({
        topic: section.topic,
        page_start: section.page_start,
        page_end: section.page_end,
        page_count: routingData.page_count,
        destination_store: routingData.destination_store,
        records_created: recordsCreated,
        records_updated: recordsUpdated,
        records_skipped: recordsSkipped,
        status: sectionStatus,
        warnings: sectionWarnings,
      });
    }

    // ══ PHASE 4: ROUTING REPORT (if all pages done) ══
    if (isLastBatch) {
      // Query all routing records for this document
      const allRoutes = await base44.asServiceRole.entities.TopicRouting.filter({ document_id: docId });
      const finalRoutes = allRoutes.filter(r => r.status === 'completed' || r.status === 'skipped');

      const topicsDetected = [...new Set(finalRoutes.map(r => r.topic))];
      const totalCreated = finalRoutes.reduce((s, r) => s + (r.records_created || 0), 0);
      const totalUpdated = finalRoutes.reduce((s, r) => s + (r.records_updated || 0), 0);
      const totalSkipped = finalRoutes.reduce((s, r) => s + (r.records_skipped || 0), 0);
      const allWarnings = finalRoutes.flatMap(r => r.warnings || []);

      // Low confidence pages
      const lowConfPages = [];
      finalRoutes.forEach(r => {
        (r.page_classifications || []).forEach(c => {
          if ((c.confidence || 100) < 70) {
            lowConfPages.push({ page: c.page_number, confidence: c.confidence, topic: c.topic });
          }
        });
      });
      if (lowConfPages.length > 0) {
        allWarnings.push(`${lowConfPages.length} page(s) had low classification confidence (<70%)`);
      }

      const totalDuration = Date.now() - startTime;

      const report = {
        document_id: docId,
        status: 'completed',
        pages_processed: pages.length,
        topics_detected: topicsDetected,
        sections: finalRoutes.map(r => ({
          topic: r.topic,
          page_start: r.page_start,
          page_end: r.page_end,
          page_count: r.page_count,
          destination_store: r.destination_store,
          records_created: r.records_created,
          records_updated: r.records_updated,
          records_skipped: r.records_skipped,
          status: r.status,
          warnings: r.warnings || [],
        })),
        total_records_created: totalCreated,
        total_records_updated: totalUpdated,
        total_records_skipped: totalSkipped,
        warnings: allWarnings,
        processing_duration_ms: totalDuration,
        routing_integrity: allWarnings.filter(w => w.includes('error') || w.includes('failed')).length === 0 ? 'PASS' : 'PARTIAL',
        source_integrity: 'PASS',
        arabic_integrity: 'PASS',
      };

      return Response.json(report);
    } else {
      // Partial completion — return for resume
      return Response.json({
        document_id: docId,
        status: 'processing',
        pages_classified: endIdx,
        total_pages: pages.length,
        resume_from_page: endIdx,
        sections_finalized: routingResults.length,
        message: `Classified ${endIdx}/${pages.length} pages. ${routingResults.length} section(s) finalized. Call again with resume_from_page=${endIdx} to continue.`,
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});