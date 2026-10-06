import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// backupHolyNamesLibrary — ONE-SHOT safety backup of the entire
// Holy Names Library to private storage. Admin-only. READ-ONLY
// on the library: creates no card/section, changes nothing.
//
// Captures: every HolyOnePDFName card, every HolyNameImportedSection,
// every HolyNameTranscriptionCache page, plus integrity hashes.
// Uploads a single JSON snapshot via UploadPrivateFile and verifies
// it by re-fetching through a signed URL. Returns the file_uri.
// ═══════════════════════════════════════════════════════════════

async function sha256Hex(s: string): Promise<string> {
  const data = new TextEncoder().encode(s);
  const h = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden — admin only" }, { status: 403 });

    const cards = await base44.asServiceRole.entities.HolyOnePDFName.list(null, 1000);
    const sections = await base44.asServiceRole.entities.HolyNameImportedSection.list(null, 5000);
    const cache = await base44.asServiceRole.entities.HolyNameTranscriptionCache.list(null, 2000);
    const knowledge = await base44.asServiceRole.entities.HolyNameKnowledge.list(null, 2000);

    const cards_hash = await sha256Hex(JSON.stringify((cards || []).map((c: any) => c.id).sort()));
    const sections_hash = await sha256Hex(JSON.stringify((sections || []).map((s: any) => s.id).sort()));
    const knowledge_hash = await sha256Hex(JSON.stringify((knowledge || []).map((k: any) => k.name_id).sort()));
    const content_hashes = (sections || []).map((s: any) => s.content_hash).sort();

    const snapshot: any = {
      backup_id: "HNL-BACKUP-" + Date.now(),
      exported_at: new Date().toISOString(),
      reason: "Pre-Phase-1 canonicalization safety backup",
      counts: { cards: (cards || []).length, sections: (sections || []).length, cache: (cache || []).length, knowledge: (knowledge || []).length },
      cards_hash,
      sections_hash,
      knowledge_hash,
      content_hashes,
      cards: cards || [],
      sections: sections || [],
      cache: cache || [],
      knowledge: knowledge || [],
    };

    const json = JSON.stringify(snapshot);
    const bytes = new TextEncoder().encode(json);
    // UploadPrivateFile expects a File/Blob upload
    const blob = new Blob([bytes], { type: "application/json" });
    // Some SDKs key on a filename; wrap into a File when available
    let fileObj: any = blob;
    try {
      // @ts-ignore File exists in Deno
      fileObj = new File([bytes], "holy_names_library_backup.json", { type: "application/json" });
    } catch { /* fall back to Blob */ }

    const upload: any = await base44.asServiceRole.integrations.Core.UploadPrivateFile({ file: fileObj });
    const file_uri = upload?.file_uri || upload?.file_url || upload?.uri || (typeof upload === "string" ? upload : "");

    // VERIFY — re-fetch through a signed URL and confirm counts + hashes
    let verified = false, vErr: string | null = null, vCounts: any = null;
    try {
      const signed: any = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri, expires_in: 600 });
      const surl = signed?.signed_url || signed?.url;
      const r = await fetch(surl);
      const txt = await r.text();
      const parsed = JSON.parse(txt);
      vCounts = { cards: parsed.cards?.length, sections: parsed.sections?.length, cache: parsed.cache?.length, knowledge: parsed.knowledge?.length };
      const vCardsHash = await sha256Hex(JSON.stringify((parsed.cards || []).map((c: any) => c.id).sort()));
      const vSecHash = await sha256Hex(JSON.stringify((parsed.sections || []).map((s: any) => s.id).sort()));
      const vKnowHash = await sha256Hex(JSON.stringify((parsed.knowledge || []).map((k: any) => k.name_id).sort()));
      verified = vCounts.cards === snapshot.counts.cards
        && vCounts.sections === snapshot.counts.sections
        && vCounts.cache === snapshot.counts.cache
        && vCounts.knowledge === snapshot.counts.knowledge
        && vCardsHash === cards_hash
        && vSecHash === sections_hash
        && vKnowHash === knowledge_hash;
    } catch (e: any) { vErr = String(e?.message || e); }

    return Response.json({
      status: verified ? "verified" : "verification_failed",
      backup_id: snapshot.backup_id,
      file_uri,
      exported_at: snapshot.exported_at,
      bytes: bytes.length,
      counts: snapshot.counts,
      cards_hash,
      sections_hash,
      verification: { verified, fetched_counts: vCounts, error: vErr },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});