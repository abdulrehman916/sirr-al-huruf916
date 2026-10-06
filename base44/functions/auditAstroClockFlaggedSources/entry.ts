// ═══════════════════════════════════════════════════════════════
// auditAstroClockFlaggedSources — READ-ONLY audit report.
//
// Produces a markdown report of every AstroClockKnowledge record
// sourced from the flagged Western-occult titles, so the Owner can
// review them before deciding any action. NEVER modifies any record.
//
// CONTRACT
//   Input : { page?: number }   — 0-based chunk index (default 0)
//   Output: { page, totalChunks, totalRecords, perBook?(page0), chunk }
//
// RULES
//   - Admin/Owner only.
//   - Read-only. No create/update/delete on any entity.
//   - Paged so each response stays under transport limits.
// ═══════════════════════════════════════════════════════════════
import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

const FLAGGED_BOOKS = [
  "The_Greco_Egyptian_Magical_Formularies_by_Christopher_Faraone_and.pdf",
  "The_Hedgewitch\u2019s_Little_Book_of_Spells,_Charms_&_Brews_by_Tudorbeth.pdf",
  "The_Real_Witches'_Book_of_Spells_and_Rituals_by_Kate_West.pdf",
  "Magia experimental pr\u00e1ctica - Gian Piero Bona.pdf",
  "1 - How to Summon and Command ... by de Lafayette (2010).pdf",
];

const WHY_FLAGGED =
  "Western occult source title (not an approved Islamic manuscript). " +
  "Flagged for Owner review per constitution: no Western astrology / internet rules in Astro Clock.";

function esc(s) {
  return String(s == null ? "" : s).replace(/\|/g, "/").replace(/\n/g, " ");
}

function recordToMarkdown(r) {
  const book = esc(r.source_book_title);
  const entity = esc(r.rule_entity || r.entity_raw || "(none)");
  const cat = esc(r.rule_category);
  const kc = esc(r.knowledge_category);
  const page = esc(r.source_page_number);
  const te = String(r.knowledge_text_en || "").trim();
  const ta = String(r.knowledge_text_ar || "").trim();
  const tm = String(r.knowledge_text_ml || "").trim();
  const id = esc(r.knowledge_id);
  const lines = [];
  lines.push(`### ${entity} \u00b7 ${cat} \u00b7 p.${page || "?"}`);
  lines.push(`- ID: ${id}`);
  lines.push(`- Book: ${book}`);
  lines.push(`- Module: Astro Clock (Astrology) | kc: ${kc}`);
  lines.push(`- Text (EN): ${te ? te : "(empty)"}`);
  if (ta) lines.push(`- Arabic: ${ta}`);
  if (tm) lines.push(`- Malayalam: ${tm}`);
  lines.push(`- Why astrology: rule_category="${cat}", ingested by autoScan`);
  lines.push(`- Why flagged: ${WHY_FLAGGED}`);
  lines.push("");
  return lines.join("\n");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin" && user.role !== "owner") {
      return Response.json({ error: "Admin/Owner only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const page = Math.max(0, parseInt(body?.page ?? 0, 10) || 0);

    const all = [];
    for (const title of FLAGGED_BOOKS) {
      const recs = await base44.asServiceRole.entities.AstroClockKnowledge.filter(
        { source_book_title: title },
        "knowledge_id",
        300
      );
      for (const r of recs) all.push(r);
    }
    all.sort((a, b) =>
      String(a.source_book_title).localeCompare(String(b.source_book_title)) ||
      String(a.knowledge_id).localeCompare(String(b.knowledge_id))
    );

    const blocks = all.map(recordToMarkdown);

    const perBook = {};
    for (const r of all) {
      const b = r.source_book_title || "(none)";
      perBook[b] = (perBook[b] || 0) + 1;
    }

    const CHUNK_LIMIT = 3800;
    const chunks = [];
    let cur = "";
    for (const blk of blocks) {
      if (cur.length + blk.length + 1 > CHUNK_LIMIT && cur.length > 0) {
        chunks.push(cur);
        cur = "";
      }
      cur += (cur ? "\n" : "") + blk;
    }
    if (cur) chunks.push(cur);

    const header =
      `# Astro Clock \u2014 Flagged Western-Source Audit (READ-ONLY)\n` +
      `Generated: ${new Date().toISOString()}\n` +
      `Total flagged records: ${all.length}\n` +
      `Books: ${FLAGGED_BOOKS.length}\n` +
      `Per-book counts: ${Object.entries(perBook).map(([k, v]) => `${k}=${v}`).join(" | ")}\n` +
      `Note: NO record was added, removed, quarantined, or modified. Owner review only.\n\n---\n`;

    const out = {
      page,
      totalChunks: chunks.length,
      totalRecords: all.length,
      chunk: chunks[page] || "",
    };
    if (page === 0) { out.perBook = perBook; out.header = header; }

    return Response.json(out);
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});