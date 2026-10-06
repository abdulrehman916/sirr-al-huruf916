import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import jpeg from 'npm:jpeg-js@0.4.4';
import { PNG } from 'npm:pngjs@7.0.0';

// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK — PHASE 2: VISUAL EXTRACTION & ATTACHMENT
//
// For ONE uploaded screenshot (already ingested into AstroClockKnowledge
// by analyzeScreenshotAndMergeAstro), this function:
//   1. Detects every embedded visual (wafq, magic square, seal, symbol,
//      sigil, table, diagram, planetary figure, talisman) via vision LLM,
//      with a normalized bounding box for each.
//   2. Crops each visual from the original screenshot WITHOUT quality
//      loss (PNG) using pure-JS jpeg-js (decode) + pngjs (encode).
//   3. Uploads every crop via UploadFile.
//   4. Appends each crop to the attached_visuals array of the
//      AstroClockKnowledge records that came from this screenshot —
//      never overwrites, dedup by visual_url.
//   5. Returns a per-visual report (type, card updated, manual review).
//
// The original full screenshot stays preserved in source_screenshot_url.
// ═══════════════════════════════════════════════════════════════

const ALLOWED_TYPES = ['magic_square', 'wafq', 'table', 'symbol', 'seal', 'diagram', 'figure', 'grid', 'handwritten_chart', 'talisman', 'other'];

function clamp01(n) { const v = Number(n); if (isNaN(v)) return 0; return Math.max(0, Math.min(1, v)); }

// Decode JPEG or PNG bytes into RGBA {width,height,data}
function decodeImage(buf) {
  const isJpeg = buf[0] === 0xFF && buf[1] === 0xD8;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50;
  if (isJpeg) {
    const raw = jpeg.decode(buf, { useTArray: true });
    return { width: raw.width, height: raw.height, data: raw.data };
  }
  if (isPng) {
    const png = PNG.sync.read(Buffer.from(buf));
    return { width: png.width, height: png.height, data: png.data };
  }
  throw new Error('unsupported image format (not JPEG/PNG)');
}

// Crop an RGBA buffer to a sub-rectangle and return pngjs PNG bytes
function cropToPngBytes(raw, x, y, w, h) {
  const out = Buffer.alloc(w * h * 4);
  for (let row = 0; row < h; row++) {
    const srcRow = (y + row) * raw.width;
    for (let col = 0; col < w; col++) {
      const si = (srcRow + (x + col)) * 4;
      const di = (row * w + col) * 4;
      out[di] = raw.data[si];
      out[di + 1] = raw.data[si + 1];
      out[di + 2] = raw.data[si + 2];
      out[di + 3] = raw.data[si + 3];
    }
  }
  const png = new PNG({ width: w, height: h });
  png.data = out;
  return PNG.sync.write(png, { colorType: 6 });
}

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json();
    const { file_url, source_label } = body;
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    // ── 1. Fetch + decode the source screenshot ──
    const imgResp = await fetch(file_url);
    if (!imgResp.ok) return Response.json({ error: `fetch failed: ${imgResp.status}` }, { status: 502 });
    const imgBuf = new Uint8Array(await imgResp.arrayBuffer());

    let raw;
    try {
      raw = decodeImage(imgBuf);
    } catch (e) {
      return Response.json({ error: `image decode failed: ${e.message}` }, { status: 500 });
    }
    const imgW = raw.width, imgH = raw.height;
    if (!imgW || !imgH) return Response.json({ error: 'invalid image dimensions' }, { status: 422 });

    // ── 2. Vision LLM — detect every visual + normalized bbox ──
    const prompt = `You are an expert analyst of Islamic occult astrology manuscripts (Astro Clock / Saat / Kawkab / Nakshatra / planetary hours).

Analyze the provided page image CAREFULLY. Detect EVERY embedded VISUAL element — do not skip any. Visuals include: wafq (letter grids), magic squares (number grids), seals (khatam), symbols, sigils, tables, diagrams, planetary figures, talismans, and any illustration/drawing.

For EACH visual, return:
- visual_type: one of "magic_square","wafq","table","symbol","seal","diagram","figure","grid","handwritten_chart","talisman","other".
- description: a short English description of what the visual depicts (e.g. "3x3 magic square for Sun, totals 66").
- description_ar: any Arabic/Ottoman caption printed on or beside the visual, copied VERBATIM with harakat. Empty string if none.
- bbox: { x, y, w, h } — the bounding box of the visual as NORMALIZED fractions (0 to 1) of the image width and height, top-left origin. Be precise: the box must tightly enclose only that visual, not the whole page.
- page_number: if a page number is printed on the page, as a string; else "".

Return JSON: { "visuals": [ ... ], "ocr_confidence": 0-100, "page_number": "" }.
If the page contains NO visuals (pure text), return { "visuals": [], "ocr_confidence": <n>, "page_number": "" }.
Never invent visuals. Never invent bounding boxes. Only report visuals that are actually drawn on the page.`;

    const llmResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          ocr_confidence: { type: 'number' },
          page_number: { type: 'string' },
          visuals: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                visual_type: { type: 'string' },
                description: { type: 'string' },
                description_ar: { type: 'string' },
                bbox: {
                  type: 'object',
                  properties: {
                    x: { type: 'number' },
                    y: { type: 'number' },
                    w: { type: 'number' },
                    h: { type: 'number' }
                  },
                  required: ['x', 'y', 'w', 'h']
                }
              },
              required: ['visual_type', 'description', 'bbox']
            }
          }
        },
        required: ['visuals', 'ocr_confidence']
      }
    });

    const result: any = (llmResponse as any).data || llmResponse;
    const visuals = Array.isArray(result.visuals) ? result.visuals : [];
    const ocrConfidence = Number(result.ocr_confidence || 0);
    const pageNum = String(result.page_number || '');

    // ── 3. Find the AstroClockKnowledge records from THIS screenshot ──
    const pageRecords = await base44.asServiceRole.entities.AstroClockKnowledge.filter(
      { source_screenshot_url: file_url, is_marker: false },
      null, 200
    );

    const byType: Record<string, number> = {};
    let extracted = 0, attached = 0, skippedNoBox = 0, skippedTiny = 0, uploadFail = 0;
    const needsReview: any[] = [];
    const attachedLog: any[] = [];

    // ── 4. Crop + upload + append each visual ──
    for (let i = 0; i < visuals.length; i++) {
      const v = visuals[i];
      let vtype = String(v.visual_type || 'other').toLowerCase();
      if (!ALLOWED_TYPES.includes(vtype)) vtype = 'other';
      const bbox = v.bbox || {};
      if (bbox.x === undefined || bbox.y === undefined || bbox.w === undefined || bbox.h === undefined) {
        skippedNoBox++; needsReview.push({ index: i, reason: 'missing bbox', visual_type: vtype, description: v.description }); continue;
      }
      // Auto-detect pixel vs normalized coords. Values > 1.5 are pixels.
      let bx = Number(bbox.x), by = Number(bbox.y), bw = Number(bbox.w), bh = Number(bbox.h);
      if (bx > 1.5) bx = bx / imgW; else bx = clamp01(bx);
      if (bw > 1.5) bw = bw / imgW; else bw = clamp01(bw);
      if (by > 1.5) by = by / imgH; else by = clamp01(by);
      if (bh > 1.5) bh = bh / imgH; else bh = clamp01(bh);
      bw = Math.max(0.01, Math.min(1 - bx, bw));
      bh = Math.max(0.01, Math.min(1 - by, bh));
      if (bw < 0.015 || bh < 0.015) { skippedTiny++; needsReview.push({ index: i, reason: 'tiny bbox', visual_type: vtype, description: v.description }); continue; }

      const cropX = Math.round(bx * imgW);
      const cropY = Math.round(by * imgH);
      const cropW = Math.max(8, Math.round(bw * imgW));
      const cropH = Math.max(8, Math.round(bh * imgH));
      // Clamp to image bounds
      const x2 = Math.min(imgW, cropX + cropW);
      const y2 = Math.min(imgH, cropY + cropH);
      const w2 = Math.max(8, x2 - cropX);
      const h2 = Math.max(8, y2 - cropY);

      let cropUrl = '';
      try {
        const pngBytes = cropToPngBytes(raw, cropX, cropY, w2, h2);
        const fileName = `astro_visual_${Date.now()}_${i}.png`;
        const fileObj = new File([pngBytes], fileName, { type: 'image/png' });
        const up: any = await base44.integrations.Core.UploadFile({ file: fileObj });
        cropUrl = up?.file_url || up?.data?.file_url || '';
        if (!cropUrl) throw new Error('no file_url returned');
      } catch (e) {
        uploadFail++; needsReview.push({ index: i, reason: `upload failed: ${e.message}`, visual_type: vtype, description: v.description }); continue;
      }

      extracted++;
      byType[vtype] = (byType[vtype] || 0) + 1;
      const importedAt = new Date().toISOString();
      const visualEntry = {
        visual_url: cropUrl,
        visual_type: vtype,
        description: String(v.description || '').trim(),
        description_ar: String(v.description_ar || '').trim(),
        source_screenshot_url: file_url,
        source_page: pageNum,
        imported_at: importedAt,
      };

      let cardsAttached = 0;
      for (const rec of (pageRecords || [])) {
        const existing = Array.isArray(rec.attached_visuals) ? rec.attached_visuals : [];
        if (existing.some((x: any) => x.visual_url === cropUrl)) continue;
        existing.push(visualEntry);
        try {
          await base44.asServiceRole.entities.AstroClockKnowledge.update(rec.id, { attached_visuals: existing });
          attached++; cardsAttached++;
        } catch (e) {
          needsReview.push({ index: i, reason: `attach failed on ${rec.id}: ${e.message}`, visual_type: vtype });
        }
      }
      attachedLog.push({ visual_type: vtype, description: v.description, cards_attached: cardsAttached, crop_url: cropUrl });
    }

    const report = {
      status: 'visual_extraction_complete',
      screenshot_url: file_url,
      image_dimensions: { width: imgW, height: imgH },
      ocr_confidence: ocrConfidence,
      page_number: pageNum,
      visuals_detected: visuals.length,
      visuals_extracted: extracted,
      visuals_attached: attached,
      by_type: byType,
      skipped_no_bbox: skippedNoBox,
      skipped_tiny: skippedTiny,
      upload_failures: uploadFail,
      cards_on_page: (pageRecords || []).length,
      needs_manual_review: needsReview,
      attached_log: attachedLog,
      processing_time_ms: Date.now() - t0,
    };
    return Response.json(report);
  } catch (error) {
    return Response.json({ error: error.message, status: 'visual_extraction_failed' }, { status: 500 });
  }
});