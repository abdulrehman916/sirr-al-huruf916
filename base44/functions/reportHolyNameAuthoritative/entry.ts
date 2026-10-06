import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// reportHolyNameAuthoritative — read-only validation report for the
// authoritative harakat + knowledge enrichment of HolyNameKnowledge
// (record_class="occult_section_a" by default).
//
// Returns: totals, verification status breakdown, origin breakdown,
// harakat_verified count, avg confidence, unique sources consulted,
// names needing manual review, and a per-name summary for flagged
// records. Admin-only. Touches NOTHING (read-only).
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden — admin only" }, { status: 403 });

    const body = await req.json().catch(()=>({}));
    const rc = String(body?.record_class || "occult_section_a");

    const recs: any[] = await base44.asServiceRole.entities.HolyNameKnowledge.filter({ record_class: rc }, "order_index", 2000);

    const total = recs.length;
    const byStatus: Record<string, number> = {};
    const byOrigin: Record<string, number> = {};
    let verified = 0, harakatVerified = 0, confSum = 0, confCount = 0;
    const sourceTitles = new Set<string>();
    let totalSources = 0;
    let totalAlternatives = 0;
    let withCanonical = 0;
    let withIslamicInfo = 0;
    let withTraditional = 0;
    const needsReview: any[] = [];

    const hasContent = (v: any) => v && (Array.isArray(v) ? v.length > 0 : String(v).trim() !== "");

    for (const r of recs) {
      byStatus[r.verification_status||"unverified"] = (byStatus[r.verification_status||"unverified"]||0)+1;
      byOrigin[r.name_origin||"unknown"] = (byOrigin[r.name_origin||"unknown"]||0)+1;
      if (r.verification_status === "verified") verified++;
      if (r.harakat_verified) harakatVerified++;
      if (r.verification_confidence>0) { confSum += r.verification_confidence; confCount++; }
      const srcs = Array.isArray(r.verification_sources)?r.verification_sources:[];
      totalSources += srcs.length;
      for (const s of srcs) if (s?.title) sourceTitles.add(s.title);
      totalAlternatives += Array.isArray(r.alternative_readings)?r.alternative_readings.length:0;
      if (r.canonical_arabic) withCanonical++;
      const ik = r.islamic_knowledge||{};
      if (Object.values(ik).some(hasContent)) withIslamicInfo++;
      if (Array.isArray(r.traditional_practices) && r.traditional_practices.length) withTraditional++;
      if (r.verification_status === "needs_review" || r.verification_status === "conflicting_sources" || r.verification_status === "not_in_classical_sources") {
        needsReview.push({
          name_id: r.name_id, original_static_id: r.original_static_id,
          arabic: r.arabic_name, transliteration: r.transliteration,
          origin: r.name_origin, status: r.verification_status,
          confidence: r.verification_confidence, sources: (Array.isArray(r.verification_sources)?r.verification_sources:[]).length,
          review_notes: r.review_notes || "",
        });
      }
    }

    return Response.json({
      status: "ok",
      record_class: rc,
      total_cards_audited: total,
      verification_status_breakdown: byStatus,
      origin_breakdown: byOrigin,
      harakat_verified_count: harakatVerified,
      verified_count: verified,
      avg_confidence: confCount ? Math.round(confSum/confCount) : 0,
      unique_sources_consulted: sourceTitles.size,
      total_source_citations: totalSources,
      total_alternative_readings: totalAlternatives,
      cards_with_canonical_arabic: withCanonical,
      cards_with_islamic_info: withIslamicInfo,
      cards_with_traditional_practices: withTraditional,
      cards_needing_manual_review: needsReview.length,
      needs_review_sample: needsReview.slice(0, 50),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});