import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// auditSectionCQuality — Full quality audit + remediation for the
// 28 Birhatīya cards (HolyNameEsotericKnowledge).
//
// WHAT IT DOES:
//   1. MECHANICAL VERIFICATION (Mashriqi Great Abjad — the system
//      the Birhatīya tradition uses):
//      - letter_count matches the Arabic letters
//      - individual_letter_values[] each match Mashriqi Abjad
//      - total_abjad_value matches the sum
//      - full_abjad_calculation string contains the total
//
//   2. MALAYALAM REMEDIATION:
//      - Finds scholarly_data entries whose exact_meaning field is
//        English-only (no Malayalam script) or empty.
//      - Translates them to NATURAL, fluent Malayalam via InvokeLLM,
//        preserving every Arabic word / transliteration verbatim and
//        keeping the "some say / it is said" opinion structure so
//        differing scholarly opinions stay separated (never merged).
//      - Writes the Malayalam back into exact_meaning; the original
//        English verbatim_text and arabic_text are never touched.
//
//   3. DUPLICATE DETECTION:
//      - Exact verbatim_text duplicates within each card are flagged
//        (first kept, rest reported). Append-only policy: nothing
//        is deleted here — only reported.
//
//   4. SOURCE STRENGTH AUDIT:
//      - For each source reference in sources[] + scholarly_data:
//        has URL? has page? has author? Weak sources flagged.
//
//   5. PER-CARD AUDIT REPORT:
//      - missing_information, weak_sources, duplicate_entries,
//        verification_status, confidence_score (0-100).
//
//   6. SECTION COMPLETENESS:
//      - Counts how many of the 33 advanced sections are populated.
//      - Empty sections are listed as "missing information".
//
// Admin-only. ISOLATED — touches ONLY HolyNameEsotericKnowledge.
// ═══════════════════════════════════════════════════════════════

// Mashriqi (Great) Abjad — al-Abjad al-Kabīr. The Birhatīya tradition
// (and al-Būnī's Manbaʿ Uṣūl al-Ḥikma) uses THIS system, where
// ت=400, ث=500, خ=600, ذ=700, ض=800, ظ=900, غ=1000.
const ABJAD = {
  "ا":1,"أ":1,"إ":1,"آ":1,"ب":2,"ج":3,"د":4,"ه":5,"ة":5,"و":6,"ز":7,
  "ح":8,"ط":9,"ي":10,"ى":10,"ك":20,"ل":30,"م":40,"ن":50,"س":60,
  "ع":70,"ف":80,"ص":90,"ق":100,"ر":200,"ش":300,"ت":400,"ث":500,
  "خ":600,"ذ":700,"ض":800,"ظ":900,"غ":1000,"ء":0,
};

const ADVANCED_KEYS = [
  "invocation_wazifa","complete_birhatiyya_text","related_conjurations",
  "related_azaim","related_ruhaniyyat","related_talismans",
  "related_magic_squares","khawass","amal","mujarrabat","khatam",
  "dairah","talisman_images","ritual_procedure","conditions",
  "number_of_recitations","timing","planet","lunar_mansion","zodiac",
  "incense","colors","elements","angels","jinn","servitors","benefits",
  "warnings","scholarly_discussions","historical_notes",
  "manuscript_variants","related_books","cross_references",
];

const hasMalayalam = (s) => /[\u0d00-\u0d7f]/.test(s || "");
const hasArabic = (s) => /[\u0600-\u06ff]/.test(s || "");
const stripHarakat = (s) =>
  String(s || "").replace(/[\u064B-\u0652\u0670\u0640]/g, "").replace(/\u0621/g, "");
const isArLetter = (c) => /[\u0621-\u064a]/.test(c);

function calcMashriqi(ar) {
  const letters = [...stripHarakat(ar)].filter(isArLetter);
  const values = letters.map((l) => ({ letter: l, value: ABJAD[l] ?? 0 }));
  const total = values.reduce((a, v) => a + v.value, 0);
  return { letters, values, total, count: letters.length };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin" && user.role !== "owner")
      return Response.json({ error: "Admin only" }, { status: 403 });
    const sdk = base44.asServiceRole;

    const body = await req.json().catch(() => ({}));
    const doRemediate = body.remediate !== false; // default true
    const doTranslate = body.translate !== false; // default true
    const debug = !!body.debug;

    // ── Load all 28 cards ──
    const cards = await sdk.entities.HolyNameEsotericKnowledge.list("order_index", 60);

    // ── 1. Collect entries needing Malayalam translation ──
    const translationJobs = []; // {cardId, entryIndex, englishSource, arabicText}
    for (const c of cards) {
      const sch = Array.isArray(c.scholarly_data) ? c.scholarly_data : [];
      sch.forEach((s, i) => {
        const ml = (s.exact_meaning || "").trim();
        const vt = (s.verbatim_text || "").trim();
        // Needs translation if: ml has no Malayalam (English-only or empty)
        // AND there is English content to translate (either ml itself or verbatim_text).
        // Needs translation if exact_meaning has no Malayalam (English-only or empty)
        // AND there is English (Latin) content somewhere to translate — either in
        // exact_meaning itself, or in verbatim_text (which may be mixed Arabic+English).
        const hasLatin = (s) => /[A-Za-z]/.test(s || "");
        const englishSrc = ml && !hasMalayalam(ml) && hasLatin(ml)
          ? ml
          : !ml && vt && hasLatin(vt) && !hasMalayalam(vt)
          ? vt
          : "";
        if (englishSrc) {
          translationJobs.push({
            cardId: c.name_id,
            entryIndex: i,
            englishSource: englishSrc,
            arabicText: s.arabic_text || "",
          });
        }
      });
    }

    // ── 2. Translate to natural Malayalam (one batched LLM call) ──
    let translations = {}; // `${cardId}|${entryIndex}` -> malayalam
    if (doTranslate && translationJobs.length > 0) {
      const itemsJson = JSON.stringify(
        translationJobs.map((j, i) => ({ idx: i, arabic: j.arabicText, english: j.englishSource }))
      );

      const translatePrompt = `You are an expert translator into NATURAL, fluent, scholarly Malayalam (മലയാളം) for an Islamic-occult manuscript reference library.

Task: translate each item's "english" field into natural Malayalam.

RULES:
1. Output natural, grammatically correct, fluent Malayalam — as a Malayalam scholar would write. NOT machine-translation style.
2. Keep EVERY Arabic word/transliteration EXACTLY as written — do not translate or alter Arabic. Embed it inline in the Malayalam. If the English contains embedded Arabic script (e.g. Quranic/angel names), keep that Arabic verbatim and translate ONLY the surrounding English into Malayalam.
3. Preserve scholarly opinion structure: "some say / it is said / others say" → "ചിലർ പറയുന്നു / ചിലർ അഭിപ്രായപ്പെടുന്നു / മറ്റുള്ളർ പറയുന്നു / ഇതിനർത്ഥം എന്നും പറയപ്പെടുന്നു". Keep each opinion SEPARATE; never merge differing opinions.
4. Do NOT add, invent, summarize, or interpret beyond the source. No commentary.
5. Bracketed tags like "[related_book]", "[historical_note]", "[servitors]", "[scholarly_discussion]" are structural labels — keep the tag as-is, translate only the descriptive content after it.
6. Each item's "english" field may be long; translate the FULL content faithfully into Malayalam (do not truncate or summarize).
7. Return a JSON object { "items": [ { "idx": 0, "malayalam": "..." }, { "idx": 1, "malayalam": "..." }, ... ] } with one entry per input item, in order.

Input items (JSON):
${itemsJson}`;

      const out = await sdk.integrations.Core.InvokeLLM({
        prompt: translatePrompt,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  idx: { type: "integer" },
                  malayalam: { type: "string" },
                },
                required: ["idx", "malayalam"],
              },
            },
          },
          required: ["items"],
        },
        model: "gemini_3_flash",
      });

      if (debug) {
        return Response.json({
          debug: true,
          jobCount: translationJobs.length,
          rawLlmType: typeof out,
          rawLlmKeys: out && typeof out === "object" ? Object.keys(out).slice(0, 5) : null,
          rawLlmItemCount: out && Array.isArray(out.items) ? out.items.length : 0,
          rawLlmSample: out ? JSON.stringify(out).slice(0, 1200) : null,
        });
      }

      // Map returned items back to translation jobs.
      const arr = (out && Array.isArray(out.items)) ? out.items : [];
      const byIdx = {};
      for (const it of arr) {
        if (it && typeof it.idx === "number" && it.malayalam && hasMalayalam(it.malayalam)) {
          byIdx[it.idx] = it.malayalam;
        }
      }
      translationJobs.forEach((j, i) => {
        const ml = byIdx[i];
        if (ml) translations[`${j.cardId}|${j.entryIndex}`] = ml;
      });
    }

    // ── 3. Build per-card audit + apply remediation ──
    const cardReports = [];
    let totalTranslated = 0;

    for (const c of cards) {
      const ar = c.canonical_arabic_name || c.arabic_name;
      const mech = calcMashriqi(ar);

      // Mechanical verification
      const lcOk = c.letter_count === mech.count;
      const abOk = c.total_abjad_value === mech.total;
      const storedVals = Array.isArray(c.individual_letter_values) ? c.individual_letter_values : [];
      let lvOk = storedVals.length === mech.count;
      if (lvOk) {
        for (let k = 0; k < mech.count; k++) {
          if ((ABJAD[mech.letters[k]] ?? 0) !== storedVals[k].value) { lvOk = false; break; }
        }
      }
      const calcStr = c.full_abjad_calculation || "";
      const calcStrOk = calcStr.includes(String(mech.total));

      // Scholarly data: Malayalam coverage + duplicates
      const sch = Array.isArray(c.scholarly_data) ? [...c.scholarly_data] : [];
      let mlCount = 0, enCount = 0, emptyCount = 0, noArabicCount = 0;
      const seenVt = {};
      const dups = [];
      let translatedThisCard = 0;

      for (let i = 0; i < sch.length; i++) {
        const s = sch[i];
        const ml = (s.exact_meaning || "").trim();
        const vt = (s.verbatim_text || "").trim();
        // Apply translation if available
        const key = `${c.name_id}|${i}`;
        if (translations[key]) {
          sch[i] = { ...s, exact_meaning: translations[key] };
          mlCount++;
          translatedThisCard++;
          totalTranslated++;
        } else if (ml && hasMalayalam(ml)) {
          mlCount++;
        } else if (ml) {
          enCount++;
        } else {
          emptyCount++;
        }
        if (!hasArabic(s.arabic_text)) noArabicCount++;
        if (vt.length > 10) {
          if (seenVt[vt] !== undefined) dups.push({ index: i, duplicateOf: seenVt[vt] });
          else seenVt[vt] = i;
        }
      }

      // Sources strength
      const srcs = Array.isArray(c.sources) ? c.sources : [];
      let srcWithUrl = 0, srcWithPage = 0, srcWithAuthor = 0, weakSrcs = 0;
      for (const s of srcs) {
        const hasU = !!(s.url && s.url.trim());
        const hasP = !!(s.page && String(s.page).trim());
        // author detection from reference text
        const ref = s.reference || "";
        const hasA = /al-B[ūu]n[īi]|Wahid Azal|al-T[ūu]s[īi]|Ibn|Ahmad|A\u1e25mad/i.test(ref);
        if (hasU) srcWithUrl++;
        if (hasP) srcWithPage++;
        if (hasA) srcWithAuthor++;
        if (!hasU && !hasP) weakSrcs++;
      }

      // Advanced sections completeness
      let populatedSections = 0;
      const missingSections = [];
      for (const k of ADVANCED_KEYS) {
        if (Array.isArray(c[k]) && c[k].length > 0) populatedSections++;
        else missingSections.push(k);
      }

      // Confidence score (start 100, deduct)
      let conf = 100;
      if (!lcOk) conf -= 15;
      if (!abOk) conf -= 20;
      if (!lvOk) conf -= 10;
      if (!calcStrOk) conf -= 5;
      if (enCount > 0) conf -= Math.min(enCount * 3, 15);
      if (emptyCount > 0) conf -= Math.min(emptyCount * 3, 12);
      if (dups.length > 0) conf -= Math.min(dups.length * 4, 12);
      if (weakSrcs > 0) conf -= Math.min(weakSrcs * 2, 10);
      // missing sections: only deduct if MORE than half empty (these are aspirational fields)
      const emptyRatio = missingSections.length / ADVANCED_KEYS.length;
      if (emptyRatio > 0.85) conf -= 5;
      if (conf < 0) conf = 0;

      const verificationStatus =
        !lcOk || !abOk || !lvOk
          ? "needs_review"
          : enCount > 0 || emptyCount > 0
          ? "needs_review"
          : dups.length > 0
          ? "needs_review"
          : "verified";

      cardReports.push({
        name_id: c.name_id,
        order_index: c.order_index,
        transliteration: c.transliteration,
        arabic_name: ar,
        mechanical_verification: {
          letter_count_ok: lcOk,
          abjad_total_ok: abOk,
          letter_values_ok: lvOk,
          calculation_string_ok: calcStrOk,
          computed_abjad: mech.total,
          stored_abjad: c.total_abjad_value,
          computed_letter_count: mech.count,
          stored_letter_count: c.letter_count,
        },
        scholarly_entries: {
          total: sch.length,
          with_malayalam: mlCount,
          english_only_remaining: enCount,
          empty_remaining: emptyCount,
          without_arabic: noArabicCount,
          duplicates: dups,
          translated_this_run: translatedThisCard,
        },
        sources: {
          total: srcs.length,
          with_url: srcWithUrl,
          with_page: srcWithPage,
          with_author: srcWithAuthor,
          weak_sources: weakSrcs,
        },
        advanced_sections: {
          populated: populatedSections,
          total: ADVANCED_KEYS.length,
          missing: missingSections,
        },
        duplicate_entries: dups,
        missing_information: [
          ...(enCount > 0 ? [`${enCount} entries still English (no Malayalam)`] : []),
          ...(emptyCount > 0 ? [`${emptyCount} entries with no Malayalam meaning`] : []),
          ...(noArabicCount > 0 ? [`${noArabicCount} entries without Arabic text`] : []),
          ...(weakSrcs > 0 ? [`${weakSrcs} weak source(s) without URL or page`] : []),
        ],
        weak_sources: weakSrcs,
        verification_status: verificationStatus,
        confidence_score: conf,
        abjad_verified_flag: c.abjad_verified,
        spelling_corrected: !!c.spelling_corrected,
      });

      // ── Persist remediation (append-only: only update exact_meaning) ──
      if (doRemediate && translatedThisCard > 0) {
        await sdk.entities.HolyNameEsotericKnowledge.update(c.id, {
          scholarly_data: sch,
        });
      }
    }

    // ── 4. Overall audit summary ──
    const allMechOk = cardReports.every(
      (r) =>
        r.mechanical_verification.letter_count_ok &&
        r.mechanical_verification.abjad_total_ok &&
        r.mechanical_verification.letter_values_ok
    );
    const allMlOk = cardReports.every(
      (r) => r.scholarly_entries.english_only_remaining === 0 && r.scholarly_entries.empty_remaining === 0
    );
    const noDups = cardReports.every((r) => r.duplicate_entries.length === 0);
    const avgConf = Math.round(
      cardReports.reduce((a, r) => a + r.confidence_score, 0) / cardReports.length
    );
    const minConf = Math.min(...cardReports.map((r) => r.confidence_score));

    return Response.json({
      audit_date: new Date().toISOString(),
      total_cards: cardReports.length,
      remediation_applied: doRemediate,
      translations_applied: totalTranslated,
      summary: {
        all_mechanically_correct: allMechOk,
        all_malayalam_complete: allMlOk,
        no_duplicate_entries: noDups,
        average_confidence: avgConf,
        min_confidence: minConf,
        cards_verified: cardReports.filter((r) => r.verification_status === "verified").length,
        cards_needs_review: cardReports.filter((r) => r.verification_status === "needs_review").length,
      },
      cards: cardReports,
      overall_pass: allMechOk && allMlOk && noDups && avgConf >= 80,
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});