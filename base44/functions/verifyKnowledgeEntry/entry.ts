import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// AI VERIFICATION — compare a MasterPdfPage's stored OCR + harakat
// against the ORIGINAL PDF page (re-extracted by vision), compare
// every scholarly source, generate confidence scores, and separate
// conflicting scholarly opinions. Never fabricate.
//
// Inputs: { page_id }  (a MasterPdfPage record id).
// SECURITY: Owner-only.
// ═══════════════════════════════════════════════════════════════
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
    let isOwner = false;
    try {
      const profiles = await base44.asServiceRole.entities.AdminProfile.list(null, 500);
      const profile = (profiles || []).find((p) => (p.user_id && p.user_id === user.id) || (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase()));
      isOwner = profile?.is_owner === true;
    } catch {}
    if (!isOwner) return Response.json({ error: 'Only the Owner can run AI verification' }, { status: 403 });

    const sdk = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const pageId = String(body.page_id || '');
    if (!pageId) return Response.json({ error: 'page_id is required' }, { status: 400 });

    const page = await sdk.entities.MasterPdfPage.get(pageId);
    if (!page) return Response.json({ error: 'Page not found' }, { status: 404 });

    const books = await sdk.entities.MasterPdfBook.filter({ master_book_id: page.master_book_id }, undefined, 1);
    const book = books[0];
    const part = (Array.isArray(book?.pdf_parts) ? book.pdf_parts : []).find((pt) => pt.part_id === page.source_part_id) || (Array.isArray(book?.pdf_parts) ? book.pdf_parts[0] : null);
    if (!part?.file_url) return Response.json({ error: 'Original PDF not available for this page' }, { status: 400 });

    // Re-extract the page verbatim via vision (compare against original PDF).
    const pageNum = Number(page.page_number) || 1;
    const prompt = `You are a faithful verifier. Transcribe page ${pageNum} of this PDF VERBATIM — every Arabic letter, every harakat, every punctuation mark, exactly as printed. Output ONLY the verbatim text of page ${pageNum}. Do not add commentary.`;
    let reExtracted = '';
    try {
      const out = await sdk.integrations.Core.InvokeLLM({ prompt, file_urls: [part.file_url], model: 'gemini_3_flash' });
      reExtracted = typeof out === 'string' ? out : (out?.text || JSON.stringify(out));
    } catch (e) {
      return Response.json({ error: 'Re-extraction failed: ' + String(e?.message || e) }, { status: 502 });
    }

    // ── Compare OCR (stored vs re-extracted) ──
    const norm = (s) => (s || '').replace(/\s+/g, ' ').replace(/[\u064B-\u0652\u0670\u0640]/g, '').trim();
    const storedNorm = norm(page.ocr_text || '');
    const reNorm = norm(reExtracted);
    const ratio = similarity(storedNorm, reNorm); // 0..1
    const ocrMatchScore = Math.round(ratio * 100);

    // ── Harakat comparison ──
    const harakatRe = /[\u064B-\u0652\u0670]/g;
    const storedHarakat = ((page.ocr_text || '').match(harakatRe) || []).length;
    const reHarakat = (reExtracted.match(harakatRe) || []).length;
    const harakatMatch = storedHarakat > 0 && reHarakat > 0
      ? Math.round(Math.min(storedHarakat / Math.max(reHarakat, 1), reHarakat / Math.max(storedHarakat, 1)) * 100)
      : (storedHarakat === 0 && reHarakat === 0 ? 100 : 0);

    // ── Scholarly source comparison + conflicts ──
    // Gather sibling pages with the same content_hash (other books).
    let conflicts = [];
    let sourceComparison = [];
    try {
      const siblings = await sdk.entities.MasterPdfPage.filter({ content_hash: page.content_hash }, undefined, 20);
      const others = (siblings || []).filter((s) => s.id !== page.id && (s.arabic_text || s.ocr_text));
      if (others.length > 0) {
        const sBooks = await sdk.entities.MasterPdfBook.list('-upload_date', 100);
        const bm = {}; sBooks.forEach((b) => { bm[b.master_book_id] = b; });
        sourceComparison = others.slice(0, 10).map((s) => {
          const b = bm[s.master_book_id] || {};
          const sameArabic = norm(s.arabic_text || s.ocr_text || '') === storedNorm;
          return {
            book: b.book_title || s.master_book_id,
            author: b.author || '',
            page: s.page_number,
            arabic_matches: sameArabic,
            ocr_confidence: s.ocr_confidence ?? 100,
          };
        });
        // Detect conflicting arabic among sources
        const arabs = others.map((s) => norm(s.arabic_text || s.ocr_text || '')).filter(Boolean);
        const uniq = new Set(arabs);
        if (uniq.size > 1) {
          const arr = [...uniq];
          conflicts.push({
            topic: 'Arabic text differs across sources',
            opinion_a: { text: arr[0].slice(0, 160), citation: (bm[others[0]?.master_book_id]?.book_title || '') + ' p.' + others[0]?.page_number },
            opinion_b: { text: arr[1]?.slice(0, 160) || '', citation: (bm[others[1]?.master_book_id]?.book_title || '') + ' p.' + others[1]?.page_number },
          });
        }
      }
    } catch (_) {}

    const verification_confidence = Math.round((ocrMatchScore * 0.6) + (harakatMatch * 0.4));

    // Audit
    await sdk.entities.SirrAuditLog.create({
      audit_id: `SA-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      sirr_book_id: page.master_book_id,
      part_id: page.source_part_id || '',
      action: 'integrity_check',
      user_id: user.id, user_name: user.full_name || user.email,
      timestamp: new Date().toISOString(),
      page_range: String(page.page_number),
      status: verification_confidence >= 80 ? 'success' : 'partial',
      details: `AI verification: OCR ${ocrMatchScore}% · Harakat ${harakatMatch}% · confidence ${verification_confidence}%${conflicts.length ? ' · ' + conflicts.length + ' conflict(s)' : ''}`,
    }).catch(() => {});

    return Response.json({
      success: true,
      page_id: pageId,
      page_number: page.page_number,
      re_extracted_text: reExtracted.slice(0, 3000),
      stored_ocr_text: (page.ocr_text || '').slice(0, 3000),
      ocr_match_score: ocrMatchScore,
      harakat_match: harakatMatch,
      verification_confidence,
      source_comparison: sourceComparison,
      conflicts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// Simple similarity ratio (Levenshtein-based, 0..1).
function similarity(a, b) {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const max = Math.max(a.length, b.length);
  if (max === 0) return 1;
  const d = lev(a, b);
  return 1 - d / max;
}
function lev(a, b) {
  const m = a.length, n = b.length;
  if (Math.abs(m - n) > Math.max(m, n) * 0.8 && Math.max(m, n) > 200) {
    // Very different lengths — approximate cheaply to avoid huge cost.
    return Math.max(m, n);
  }
  const prev = new Array(n + 1);
  const cur = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = cur[j];
  }
  return prev[n];
}