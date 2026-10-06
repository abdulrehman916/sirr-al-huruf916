// ═══════════════════════════════════════════════════════════════
// astroScanShared — shared helpers for Astro Clock / Holy Names
// library scanners. Plain module (no Deno.serve). Imported by:
//   - base44/functions/expandAstroHolyNamesLibrary/entry.ts
//   - base44/functions/autoScanAstroClockLibrary/entry.ts (may adopt later)
// ═══════════════════════════════════════════════════════════════

export async function sha256(s) {
  const data = new TextEncoder().encode(s || '');
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function slug(s) {
  return String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 60);
}

// Strip harakat + tatweel for indexed matching (same rule as HolyNameKnowledge)
export function normalizeArabic(ar) {
  if (!ar) return '';
  return String(ar)
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '') // harakat + tatweel
    .replace(/\u0622/g, '\u0627').replace(/\u0623/g, '\u0627').replace(/\u0625/g, '\u0627') // alef variants
    .replace(/\u0649/g, '\u064A') // alef maqsura → ya
    .replace(/\u0629/g, '\u0647') // ta marbuta → ha
    .trim();
}

export function computeFingerprint(book) {
  const partsHash = (book.pdf_parts || []).map(p => p.file_hash || '').join('|');
  const totalPages = book.combined_total_pages || 0;
  const modifiedTime = book.google_drive_modified_time || '';
  const importDate = book.import_date || book.upload_date || '';
  return `${partsHash}||${totalPages}||${modifiedTime}||${importDate}`;
}

// Merge action arrays deduping by `en` text
export function mergeActionArr(existingArr, newArr) {
  const out = Array.isArray(existingArr) ? [...existingArr] : [];
  for (const item of (newArr || [])) {
    const en = String(item?.en || '').trim();
    if (!en) continue;
    if (out.some(x => String(x?.en || '') === en)) continue;
    out.push({ en, ar: String(item.ar || ''), ml: String(item.ml || '') });
  }
  return out;
}

// Merge attributes additively (arrays append, scalars keep existing)
export function mergeAttributesAdditive(existingAttrs, newAttrs) {
  const out = (existingAttrs && typeof existingAttrs === 'object') ? { ...existingAttrs } : {};
  const incoming = (newAttrs && typeof newAttrs === 'object') ? newAttrs : {};
  for (const k of Object.keys(incoming)) {
    const nv = incoming[k];
    const ev = out[k];
    if (Array.isArray(nv)) {
      const arr = Array.isArray(ev) ? [...ev] : [];
      for (const item of nv) {
        const s = typeof item === 'string' ? item : JSON.stringify(item);
        if (!arr.includes(s)) arr.push(s);
      }
      out[k] = arr;
    } else if (ev === undefined) {
      out[k] = nv;
    }
    // else: keep existing (never overwrite)
  }
  return out;
}

// Append text with separator, dedup by exact snippet
export function appendTextDedup(existingText, newText, sep) {
  const ex = String(existingText || '');
  const nw = String(newText || '').trim();
  if (!nw) return ex;
  if (ex.includes(nw)) return ex;
  return ex ? (ex + sep + nw) : nw;
}

// Load all scan markers from AstroClockKnowledge (paginated)
export async function loadScanMarkers(sdk) {
  const bookProgress = new Map();
  const bookMaxPageFromFindings = new Map();
  const markerAttrs = new Map();
  const existingAck = [];
  let ackSkip = 0;
  while (existingAck.length < 5000) {
    const batch = await sdk.entities.AstroClockKnowledge.list('-created_date', 500, ackSkip).catch(() => []);
    if (!batch || batch.length === 0) break;
    existingAck.push(...batch); ackSkip += batch.length;
    if (batch.length < 500) break;
  }
  for (const r of existingAck) {
    if (!r.source_book_id) continue;
    if (r.is_marker || r.rule_category === 'scan_marker') {
      const pgs = String(r.source_page_number || '');
      if (pgs === 'done') bookProgress.set(r.source_book_id, -1);
      else { const last = parseInt(pgs, 10); bookProgress.set(r.source_book_id, isNaN(last) ? 0 : last); }
      if (r.attributes && typeof r.attributes === 'object') markerAttrs.set(r.source_book_id, r.attributes);
    } else if (r.source_page_number) {
      for (const p of String(r.source_page_number).split(',')) {
        const pn = parseInt(p.trim(), 10);
        if (Number.isFinite(pn)) {
          const cur = bookMaxPageFromFindings.get(r.source_book_id) || 0;
          if (pn > cur) bookMaxPageFromFindings.set(r.source_book_id, pn);
          }
        }
      }
    }
  for (const [bid, maxPg] of bookMaxPageFromFindings) {
    if (!bookProgress.has(bid)) bookProgress.set(bid, maxPg);
  }
  return { bookProgress, markerAttrs, existingAck };
}

// Upsert scan marker (shared by both scanners)
export async function upsertScanMarker(sdk, bookId, bookTitle, markerPage, storedAttrs, book, extractionVersion) {
  const now = new Date().toISOString();
  const scanMeta = {
    first_scan_date: (storedAttrs && storedAttrs.first_scan_date) || now,
    last_scan_date: now,
    last_modified_detected: (book.google_drive_modified_time) || (storedAttrs && storedAttrs.last_modified_detected) || now,
    scan_version: (Number(storedAttrs && storedAttrs.scan_version) || 0) + 1,
    extraction_version: extractionVersion || 'v1',
    ocr_version: 'v1',
    file_hash: (book.pdf_parts || []).map(p => p.file_hash || '').join('|'),
    content_fingerprint: computeFingerprint(book),
    combined_total_pages: book.combined_total_pages || 0,
    pages_scanned: markerPage === 'done' ? (book.combined_total_pages || 0) : parseInt(markerPage, 10) || 0,
    pages_remaining: markerPage === 'done' ? 0 : Math.max((book.combined_total_pages || 0) - (parseInt(markerPage, 10) || 0), 0),
    completion_percentage: markerPage === 'done' ? 100 : Math.round(((parseInt(markerPage, 10) || 0) / Math.max(book.combined_total_pages || 1, 1)) * 100),
  };
  try {
    const em = await sdk.entities.AstroClockKnowledge.filter({ rule_record_key: `scan_marker|${bookId}` }, undefined, 1).catch(() => []);
    if (em && em.length > 0) await sdk.entities.AstroClockKnowledge.update(em[0].id || em[0]._id, { source_page_number: markerPage, attributes: scanMeta }).catch(() => {});
    else await sdk.entities.AstroClockKnowledge.create({
      knowledge_id: `ACK-MARKER-${extractionVersion || 'v1'}-${bookId}`,
      source_type: 'categorized', rule_category: 'scan_marker', rule_entity: bookId,
      rule_record_key: `scan_marker|${bookId}`, knowledge_category: 'categorized_rule',
      knowledge_text_en: '', content_hash: `cat-scan_marker-${bookId}`, is_marker: true,
      source_book_id: bookId, source_book_title: bookTitle,
      source_page_number: markerPage, attributes: scanMeta,
    });
  } catch (_) {}
}

// Load HolyNameKnowledge match table (99 Names + 443 occult names)
export async function loadHolyNameTable(sdk) {
  const table = new Map(); // normalizedArabic → { name_id, arabic_name, record_class }
  let skip = 0;
  while (table.size < 2000) {
    const batch = await sdk.entities.HolyNameKnowledge.list('-created_date', 500, skip).catch(() => []);
    if (!batch || batch.length === 0) break;
    for (const hn of batch) {
      const norm = normalizeArabic(hn.arabic_name);
      if (norm && !table.has(norm)) {
        table.set(norm, { name_id: hn.name_id, arabic_name: hn.arabic_name, record_class: hn.record_class });
      }
      if (hn.arabic_normalized) {
        const n2 = String(hn.arabic_normalized).trim();
        if (n2 && !table.has(n2)) table.set(n2, { name_id: hn.name_id, arabic_name: hn.arabic_name, record_class: hn.record_class });
      }
    }
    skip += batch.length;
    if (batch.length < 500) break;
  }
  return table;
}

// Match an Arabic Holy Name to the HolyNameKnowledge table
export function matchHolyName(table, arabicName) {
  const norm = normalizeArabic(arabicName);
  const normNoYa = norm.replace(/^يا\s*/, '').replace(/^يَا\s*/, '').trim();
  const normWithAl = norm.startsWith('ال') ? norm : ('ال' + norm);
  return table.get(norm) || table.get(normNoYa) || table.get(normWithAl) || null;
}