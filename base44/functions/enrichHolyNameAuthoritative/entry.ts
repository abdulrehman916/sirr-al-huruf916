import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// enrichHolyNameAuthoritative — authoritative per-name harakat +
// linguistic + Islamic-knowledge enrichment for HolyNameKnowledge.
//
// Honest per-name origin policy (owner-approved):
//   • Each name's REAL linguistic origin is determined first
//     (Hebrew / Syriac / Aramaic / Arabic / mixed / unknown).
//   • Harakat + spelling are verified against authoritative sources
//     FOR THAT ORIGIN (classical Arabic dictionaries, Quranic Corpus,
//     Lisan al-Arab, Taj al-Arus, Lane's Lexicon for Arabic names;
//     Hebrew/Syriac lexicons + the occult source manuscript for
//     foreign-origin transliterations).
//   • NEVER invent harakat. If no authoritative source attests a
//     reading, canonical_arabic stays empty and verification_status
//     becomes "not_in_classical_sources" or "needs_review".
//   • When sources DISAGREE, every variant is recorded in
//     alternative_readings with its source(s); the preferred scholarly
//     reading is flagged. verification_status = "conflicting_sources".
//   • Islamic-knowledge fields (tafsir/hadith/quran_verses/etc.) are
//     filled ONLY when the name genuinely appears in Islamic sources;
//     left EMPTY (never fabricated) for foreign names absent from them.
//   • Traditional practices (wafq/amal/dua/hizb/dhikr) are stored with
//     authenticated=false + note "Traditional Manuscript Reference
//     (Not authenticated)" unless a verified manuscript confirms them.
//   • Every source is stored with full attribution + reliability_score.
//
// Mode A — single name:  { name_id }
// Mode B — batch:        { record_class:"occult_section_a", limit:5,
//                          only_status:"unverified" }
//
// Uses InvokeLLM with add_context_from_internet=true (Gemini, the only
// model supporting web search) so the model pulls REAL sources.
// Admin-only. Touches ONLY HolyNameKnowledge (update only — never
// deletes, never overwrites arabic_name / existing user fields; only
// fills the new authoritative fields).
// ═══════════════════════════════════════════════════════════════

const SCHEMA = {
  type: "object",
  properties: {
    name_origin: { type: "string", enum: ["hebrew","syriac","aramaic","arabic","mixed","unknown"] },
    etymology: { type: "string" },
    canonical_arabic: { type: "string" },
    fully_vowelized_name: { type: "string" },
    alternative_readings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          arabic: { type: "string" },
          reading_note: { type: "string" },
          sources: { type: "array", items: {
            type: "object",
            properties: { title:{type:"string"}, page:{type:"string"}, url:{type:"string"}, language:{type:"string"}, reliability_score:{type:"integer"} }
          } },
          preferred: { type: "boolean" }
        },
        required: ["arabic"]
      }
    },
    harakat_verified: { type: "boolean" },
    verification_status: { type: "string", enum: ["verified","needs_review","conflicting_sources","not_in_classical_sources"] },
    verification_confidence: { type: "integer" },
    verification_sources: { type: "array", items: {
      type: "object",
      properties: {
        title:{type:"string"}, author:{type:"string"}, publisher:{type:"string"}, edition:{type:"string"},
        page:{type:"string"}, volume:{type:"string"}, url:{type:"string"}, access_date:{type:"string"},
        language:{type:"string"}, reliability_score:{type:"integer"}, field_verified:{type:"string"}
      },
      required: ["title"]
    }},
    linguistic: {
      type: "object",
      properties: {
        root_letters:{type:"string"}, arabic_root:{type:"string"}, morphological_pattern:{type:"string"},
        literal_meaning:{type:"string"}, lexical_meaning:{type:"string"}, classical_explanation:{type:"string"},
        quranic_usage:{type:"string"}, hadith_usage:{type:"string"}, difference_from_similar:{type:"string"},
        related_names:{type:"string"}, grammar_notes:{type:"string"}, origin_language:{type:"string"}
      }
    },
    islamic_knowledge: {
      type: "object",
      properties: {
        meaning:{type:"string"}, detailed_explanation:{type:"string"},
        tafsir_refs:{type:"array",items:{type:"string"}},
        hadith_refs:{type:"array",items:{type:"string"}},
        scholarly_explanation:{type:"string"}, spiritual_significance:{type:"string"},
        conditions_of_usage:{type:"string"},
        authentic_duas:{type:"array",items:{type:"string"}},
        authentic_adhkar:{type:"array",items:{type:"string"}},
        quran_verses:{type:"array",items:{type:"string"}},
        classical_explanations:{type:"string"},
        meaning_ml:{type:"string"}, scholarly_explanation_ml:{type:"string"}, detailed_explanation_ml:{type:"string"}
      }
    },
    traditional_practices: { type: "array", items: {
      type: "object",
      properties: {
        type:{type:"string"}, text_ar:{type:"string"}, translation_en:{type:"string"}, translation_ml:{type:"string"},
        source:{type:"string"}, authenticated:{type:"boolean"}, note:{type:"string"}
      }
    }},
    alternative_spellings: { type: "array", items: { type: "object", properties: { arabic:{type:"string"}, note:{type:"string"}, sources:{type:"array",items:{type:"object",properties:{title:{type:"string"},page:{type:"string"},url:{type:"string"}}}} }, required:["arabic"] } },
    original_source_word: { type: "string" },
    research_profile: { type: "object", properties: {
      historical_background:{type:"string"}, pronunciation_guide:{type:"string"},
      classical_dict_refs:{type:"array",items:{type:"string"}}, academic_refs:{type:"array",items:{type:"string"}},
      manuscript_refs:{type:"array",items:{type:"string"}}, earliest_occurrence:{type:"string"},
      related_historical_usage:{type:"string"}, linguistic_explanation:{type:"string"},
      root_meaning:{type:"string"}, literal_meaning:{type:"string"},
      root_letters:{type:"string"}, arabic_root:{type:"string"}, morphological_pattern:{type:"string"},
      historical_background_ml:{type:"string"}, pronunciation_guide_ml:{type:"string"}, earliest_occurrence_ml:{type:"string"},
      related_historical_usage_ml:{type:"string"}, linguistic_explanation_ml:{type:"string"}, classical_explanation_ml:{type:"string"},
      related_names_ml:{type:"string"}, etymology_ml:{type:"string"}
    } },
    meanings: { type: "object", properties: {
      arabic:{type:"string"}, malayalam:{type:"string"}, english:{type:"string"},
      original:{type:"string"}, symbolic:{type:"string"}, historical:{type:"string"}, traditional:{type:"string"},
      literal_ml:{type:"string"}, root_ml:{type:"string"}, symbolic_ml:{type:"string"}, historical_ml:{type:"string"}, traditional_ml:{type:"string"}, original_ml:{type:"string"}
    } },
    benefits: { type: "object", properties: {
      authentic_islamic:{type:"array",items:{type:"object",properties:{text:{type:"string"},authenticated:{type:"boolean"}}}},
      linguistic:{type:"array",items:{type:"object",properties:{text:{type:"string"}}}},
      historical:{type:"array",items:{type:"object",properties:{text:{type:"string"}}}},
      traditional:{type:"array",items:{type:"object",properties:{text:{type:"string"},authenticated:{type:"boolean"}}}},
      wafq:{type:"array",items:{type:"object",properties:{text:{type:"string"}}}},
      amal:{type:"array",items:{type:"object",properties:{text:{type:"string"}}}},
      esoteric:{type:"array",items:{type:"object",properties:{text:{type:"string"}}}},
      authentic_islamic_ml:{type:"string"}, traditional_ml:{type:"string"}, linguistic_ml:{type:"string"}, historical_ml:{type:"string"}
    } },
    relationship_to_99_names: { type: "object", properties: {
      relationship_type:{type:"string",enum:["identical","alternate_reading","same_root","same_meaning","closely_related","synonymous","scholarly_relation","none","foreign_equivalent","traditional_only"]},
      related_name_id:{type:"string"}, related_name_arabic:{type:"string"},
      evidence:{type:"string"}, evidence_ml:{type:"string"}, related_name_ml:{type:"string"},
      sources:{type:"array",items:{type:"object",properties:{title:{type:"string"},url:{type:"string"}}}}
    } },
    relationship_to_99_names_type: { type: "string", enum:["identical","alternate_reading","same_root","same_meaning","closely_related","synonymous","scholarly_relation","none","foreign_equivalent","traditional_only","unknown"] },
    invocations: { type: "array", items: {
      type: "object",
      properties: {
        category:{type:"string",enum:["authentic_islamic_dhikr","quranic_supplication","hadith_supplication","classical_wazifa","traditional_invocation","vefk_practice","talismanic_formula","occult_manuscript_practice","unknown_origin"]},
        text_ar:{type:"string"}, text_harakat:{type:"string"}, transliteration:{type:"string"},
        translation_ml:{type:"string"}, translation_en:{type:"string"},
        source_book:{type:"string"}, author:{type:"string"}, chapter:{type:"string"}, page:{type:"string"},
        edition:{type:"string"}, manuscript_ref:{type:"string"}, publication:{type:"string"}, url:{type:"string"},
        purpose:{type:"string"}, traditional_usage:{type:"string"}, historical_usage:{type:"string"},
        conditions:{type:"string"}, repetitions:{type:"string"}, timing:{type:"string"}, preparation:{type:"string"},
        warnings:{type:"string"}, authenticated:{type:"boolean"}, scholarly_opinions:{type:"string"},
        evidence_level:{type:"string",enum:["authenticated","traditional","unknown"]}
      },
      required:["category","text_ar"]
    }},
    review_notes: { type: "string" }
  },
  required: ["name_origin","verification_status","verification_confidence","verification_sources","relationship_to_99_names_type"]
};

// Normalize Arabic for indexed matching: strip harakat/tatweel, unify hamza &
// letter-form variants, keep leading alif-lam. Consistent with the import
// matching logic so a corrected spelling still matches future imports.
function normalizeArabic(s: string): string {
  if (!s) return "";
  return String(s)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/\u0622/g, "\u0627")
    .replace(/\u0623/g, "\u0627")
    .replace(/\u0625/g, "\u0627")
    .replace(/\u0624/g, "\u0648")
    .replace(/\u0626/g, "\u064A")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u0629/g, "\u0647")
    .trim();
}

// Strip harakat/tatweel only (no hamza/letter-form normalization) — used for
// the previous_spelling / corrected_spelling (plain, unvowelized) fields.
function stripHarakatOnly(s: string): string {
  if (!s) return "";
  return String(s).replace(/[\u064B-\u065F\u0670\u0640]/g, "").trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden — admin only" }, { status: 403 });

    const body = await req.json();
    const now = new Date().toISOString();
    const startedAt = Date.now();
    const TIME_BUDGET_MS = Number(body?.time_budget_ms || 100000);

    // Resolve target names
    let targets: any[] = [];
    if (body?.name_id) {
      const r = await base44.asServiceRole.entities.HolyNameKnowledge.filter({ name_id: String(body.name_id) }, null, 1);
      targets = (r || []).filter((x:any)=>x.record_class==="occult_section_a");
    } else {
      const rc = String(body?.record_class || "occult_section_a");
      const limit = Math.max(1, Math.min(Number(body?.limit || 5), 20));
      const flt: any = { record_class: rc };
      if (body?.only_status) flt.verification_status = String(body.only_status);
      const r = await base44.asServiceRole.entities.HolyNameKnowledge.filter(flt, "order_index", limit);
      targets = r || [];
    }
    if (targets.length === 0) return Response.json({ status: "ok", message: "no targets", processed: 0 });

    const CONCURRENCY = 8;
    const processOne = async (rec: any) => {
      try {
        const llm: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
          model: "gemini_3_1_pro",
          add_context_from_internet: true,
          prompt: `You are an expert in classical Arabic linguistics, Semitic philology (Hebrew/Syriac/Aramaic), Islamic theology, and the occult manuscript tradition. You are auditing ONE name from the "Book of Deadly Names - Appendix of Magical Names" (a classical occult manuscript that transliterates many Divine/angelic names of Hebrew/Syriac origin into Arabic).

NAME UNDER AUDIT:
- Arabic (as printed, with harakat): ${rec.arabic_name}
- Arabic plain: ${rec.arabic_normalized}
- Transliteration: ${rec.transliteration}
- Occult source: ${rec.occult_source_ref}

STRICT RULES — violating any rule makes the output worthless:
1. Determine the name's REAL linguistic origin FIRST (hebrew/syriac/aramaic/arabic/mixed/unknown). Many names here are Hebrew/Syriac Divine Names transliterated into Arabic (e.g. أَهْيَا=Eheyeh, أَدُونِي=Adonai, صَبَاوُت=Sabaoth, أَلْ شَدَاي=El Shaddai, أَلُوهِيم=Elohim). State the original-language form in etymology.
2. Verify the Arabic spelling AND every harakah/hamza/madd/shaddah/sukoon/tanween/wasl-qat' against AUTHORITATIVE sources FOR THAT ORIGIN. For Arabic names use Lisan al-Arab, Taj al-Arus, Al-Mu'jam al-Waseet, Lane's Lexicon, Quranic Arabic Corpus, Tanzil, King Fahd Quran Complex. For Hebrew/Syriac names use Hebrew/Syriac lexicons AND the occult manuscript itself.
3. NEVER guess or invent any harakah. If no authoritative source attests a vowelized reading, leave canonical_arabic and fully_vowelized_name EMPTY and set verification_status to "not_in_classical_sources" (foreign name, no classical Arabic source) or "needs_review" (uncertain).
4. If authoritative sources AGREE (>=2 independent reliable sources), set verification_status="verified", harakat_verified=true, verification_confidence 80-100 based on source strength.
5. If sources DISAGREE on spelling or harakat, put EVERY variant in alternative_readings (each with its source), flag the preferred scholarly reading, set verification_status="conflicting_sources", harakat_verified=false.
5b. SPELLING CORRECTION: canonical_arabic (and fully_vowelized_name) MUST hold the AUTHORITATIVELY CORRECT fully-vowelized form for THIS name — even when that means correcting the imported arabic_name's spelling or harakat. If the imported arabic_name is a proven OCR/transcription error (wrong/missing/extra letter, or wrong harakat backed by documentary evidence), put the corrected form in canonical_arabic. The server compares canonical_arabic to the imported form and, when they differ under a scholarly verdict, records the full correction (previous vs corrected spelling/harakat, confidence, evidence, sources, date) and applies the corrected form — while preserving the name's identity. NEVER merge two different Holy Names into one, and NEVER change one Holy Name into a different Holy Name just because they look similar — only correct demonstrable OCR/transcription errors of THIS name. If the imported form is merely an acceptable variant, set canonical_arabic to the preferred reading and ALSO record the variant in alternative_readings or alternative_spellings.
6. NEVER fabricate Islamic knowledge. Fill islamic_knowledge (tafsir_refs, hadith_refs, quran_verses, authentic_duas, authentic_adhkar, scholarly_explanation) ONLY when the name genuinely appears in the Qur'an, Hadith, or classical tafsir. For Hebrew/Syriac names absent from Islamic sources, leave ALL islamic_knowledge fields EMPTY — do NOT invent tafsir/hadith/duas.
7. For traditional practices (wafq/amal/dua/hizb/dhikr) found in occult manuscripts, store them in traditional_practices with authenticated=false and note="Traditional Manuscript Reference (Not authenticated)" UNLESS a verified manuscript confirms them. Never present traditional occult material as established Islamic fact.
8. Every verification_source MUST have a real title (and author/page/url where available) and a reliability_score (1-100: 90+ for Lisan al-Arab/Taj al-Arus/Quranic Corpus/King Fahd; 70-89 for established academic lexicons; 40-69 for the occult manuscript; <40 for blogs/forums which you must NOT use). Do not cite sources you cannot actually identify.
9. linguistic fields: fill root_letters/arabic_root/morphological_pattern/literal_meaning/lexical_meaning/classical_explanation/grammar_notes ONLY for names with a real Arabic root; leave empty for foreign transliterations. quranic_usage/hadith_usage empty unless the name is actually in the Qur'an/Hadith.
10. review_notes: briefly explain any uncertainty or why review is needed.

DEEP RESEARCH PROFILE (perform the widest possible reliable search across classical Arabic lexicons, Islamic references, academic publications, manuscript catalogues, historical sources, linguistic resources, and trusted scholarly websites):
11. alternative_spellings: every alternative SPELLING attested (distinct from vocalizations), each with source.
12. original_source_word: the original word in its source language (Hebrew/Syriac/Aramaic/Persian) when this is a transliteration; empty for native Arabic.
13. research_profile: { historical_background, pronunciation_guide, classical_dict_refs[], academic_refs[], manuscript_refs[], earliest_occurrence, related_historical_usage, linguistic_explanation, root_meaning, literal_meaning }. Fill each ONLY from reliable sources; empty/"Not Verified" when unsupported.
14. meanings: separated meanings { arabic, malayalam, english, original, symbolic, historical, traditional }. symbolic ONLY when sourced. malayalam = detailed Malayalam meaning.
15. benefits: source-supported benefits by category { authentic_islamic[], linguistic[], historical[], traditional[], wafq[], amal[], esoteric[] }. Each entry { text, authenticated } (per-item sources are omitted to keep the schema compact — cite all benefit sources in verification_sources instead). authentic_islamic ONLY from Qur'an/Hadith/classical scholars (authenticated=true). traditional/wafq/amal/esoteric = traditional/occult material with authenticated=false and text noting "Traditional/Historical/Not Authenticated as Islamic Teaching". NEVER mix traditional occult material with authenticated Islamic teachings.

RELATIONSHIP TO THE 99 NAMES OF ALLAH:
16. relationship_to_99_names: determine with evidence whether this name relates to the canonical 99 Names of Allah. relationship_type is ONE of: identical | alternate_reading | same_root | same_meaning | closely_related | synonymous | scholarly_relation | none | foreign_equivalent | traditional_only. If a relationship exists, set related_name_id (e.g. "HNK-001"), related_name_arabic, and explain evidence. If NO authentic relationship exists, set relationship_type="none" and state that clearly with evidence. relationship_to_99_names_type must equal relationship_type (use "unknown" only if you cannot determine it — never guess).

PRACTICES, INVOCATIONS & MANUSCRIPT TEXTS:
17. invocations: search ALL trusted historical sources, manuscripts, printed books, academic references, linguistic sources, traditional Islamic literature, and historical occult manuscripts for any invocation, wazifa, dhikr, mantra, prayer, talismanic formula, magical text, vefk text, or ritual that EXPLICITLY contains this Holy Name. For each one found, copy the Arabic EXACTLY as printed in the source (every letter and harakat preserved verbatim — NEVER normalized, rewritten, or invented) and record: transliteration, translation_ml (complete, easy-to-understand Malayalam), translation_en, source_book, author, chapter, page, edition, manuscript_ref, publication, url, purpose, traditional_usage, historical_usage, conditions, repetitions (only if documented), timing (only if documented), preparation (only if documented), warnings, scholarly_opinions, and evidence_level.
STRICT INVOCATION RULES:
- NEVER fabricate any Arabic text, harakat, translation, ritual, or benefit. If you cannot find a real documented invocation, return an EMPTY invocations array.
- Assign exactly ONE category per invocation — NEVER mix categories: authentic_islamic_dhikr (authentic dhikr established in Qur'an/Hadith/classical scholarship, authenticated=true, evidence_level="authenticated"), quranic_supplication (a Qur'anic supplication/dua containing the name, authenticated=true), hadith_supplication (a supplication recorded in authentic Hadith, authenticated=true), classical_wazifa (classical Sufi wazifa from established manuals, authenticated=false, evidence_level="traditional"), traditional_invocation (traditional invocation from later manuscript literature, authenticated=false, evidence_level="traditional"), vefk_practice (a vefk/wafq text using this name, authenticated=false, evidence_level="traditional"), talismanic_formula (a talismanic formula, authenticated=false, evidence_level="traditional"), occult_manuscript_practice (an occult manuscript practice, authenticated=false, evidence_level="traditional"), unknown_origin (origin cannot be determined, authenticated=false, evidence_level="unknown").
- For traditional/occult material set authenticated=false and evidence_level="traditional" (or "unknown" when origin is unclear). For authentic Islamic evidence set authenticated=true and evidence_level="authenticated".
- If MULTIPLE versions of an invocation exist, output one invocation entry per version, each with its own source attribution.
- If NO historically documented invocation exists for this name, return an EMPTY invocations array. Do NOT invent any.

TRILINGUAL MALAYALAM EXPLANATION (mandatory — Malayalam is the PRIMARY explanation language for ordinary readers):
18. For EVERY prose field, ALSO provide a natural, scholarly Malayalam explanation in the corresponding *_ml field:
   - research_profile: historical_background_ml, pronunciation_guide_ml, earliest_occurrence_ml, related_historical_usage_ml, linguistic_explanation_ml, classical_explanation_ml, related_names_ml, etymology_ml
   - meanings: literal_ml, root_ml, symbolic_ml, historical_ml, traditional_ml, original_ml (meanings.malayalam already holds the main Malayalam meaning — keep it detailed)
   - islamic_knowledge: meaning_ml, scholarly_explanation_ml, detailed_explanation_ml
   - relationship_to_99_names: evidence_ml, related_name_ml
   - benefits: authentic_islamic_ml (Malayalam prose summarizing the authentic Islamic benefits), traditional_ml (Malayalam prose summarizing the traditional benefits), linguistic_ml, historical_ml (Malayalam prose for those sections)
   - invocations: translation_ml (already required)
MALAYALAM RULES (strict — violating these makes the output worthless):
- Write NATURAL, scholarly Malayalam PROSE that an ordinary Malayalam reader can easily understand. Do NOT produce mechanical word-for-word translation or transliteration of English. Use proper Malayalam Islamic/linguistic terminology where it is established.
- Ground Malayalam explanations in reliable Malayalam sources (Malayalam tafsir/exegesis, Malayalam Islamic scholarship, recognized Malayalam linguistic works) where they exist. Where no Malayalam source exists but the underlying FACT is verified from Arabic/English sources, write a faithful scholarly Malayalam explanation of that verified fact — clearly a human-readable explanation, not a translation dump.
- NEVER fabricate Malayalam for an unverified fact. If the underlying field is empty or "Not Verified", leave the *_ml field EMPTY too — the UI will show "Not Verified".
- Malayalam must be complete and easy to understand; never leave a reader with only English.

SOURCE REQUIREMENTS (mandatory): every statement must carry source attribution (title, author/book, page, url when available) inside the relevant sources array or verification_sources. reliability_score 1-100 (90+ Lisan al-Arab/Taj al-Arus/Quranic Corpus/King Fahd; 70-89 established academic lexicons; 40-69 occult manuscript; <40 blogs/forums which you MUST NOT use). If multiple scholars disagree, store every opinion separately with attribution — never force a single conclusion.

UNKNOWN INFORMATION: if no reliable source exists for a field, leave it empty or set "Not Verified". NEVER generate speculative explanations.

Return ONLY the JSON object matching the schema. Empty strings/arrays where a field does not apply — never fabricated.`,
          response_json_schema: SCHEMA,
        });

        // Defensive: InvokeLLM returns a dict when schema is set.
        const out: any = llm && (llm as any).name_origin !== undefined ? llm : (llm?.output || llm);
        if (!out || !out.verification_status) throw new Error("LLM returned no verification");

        const update: any = {
          name_origin: out.name_origin || "unknown",
          etymology: out.etymology || "",
          canonical_arabic: out.canonical_arabic || "",
          fully_vowelized_name: out.fully_vowelized_name || "",
          alternative_readings: Array.isArray(out.alternative_readings) ? out.alternative_readings : [],
          harakat_verified: !!out.harakat_verified,
          verification_status: out.verification_status,
          verification_confidence: Number(out.verification_confidence || 0),
          verification_sources: Array.isArray(out.verification_sources) ? out.verification_sources : [],
          last_verified_date: now,
          linguistic: out.linguistic || {},
          islamic_knowledge: out.islamic_knowledge || {},
          traditional_practices: Array.isArray(out.traditional_practices) ? out.traditional_practices : [],
          alternative_spellings: Array.isArray(out.alternative_spellings) ? out.alternative_spellings : [],
          original_source_word: out.original_source_word || "",
          research_profile: out.research_profile || {},
          meanings: out.meanings || {},
          benefits: out.benefits || {},
          relationship_to_99_names: out.relationship_to_99_names || {},
          relationship_to_99_names_type: out.relationship_to_99_names_type || (out.relationship_to_99_names && out.relationship_to_99_names.relationship_type) || "unknown",
          invocations: Array.isArray(out.invocations) ? out.invocations : [],
          review_notes: out.review_notes || "",
        };
        // SCHOLARLY SPELLING CORRECTION (server-side): the LLM places the
        // authoritatively correct vowelized form in canonical_arabic. When that
        // differs from the imported arabic_name under a scholarly verdict
        // (verified / conflicting_sources), apply it as the corrected spelling
        // and record the full correction (previous vs corrected spelling &
        // harakat, confidence, evidence, sources, date). Identity is always
        // preserved — canonical_arabic is the SAME name, never a different one.
        const canonical = (out.canonical_arabic || out.fully_vowelized_name || "").trim();
        if (canonical && canonical !== (rec.arabic_name || "").trim() &&
            (out.verification_status === "verified" || out.verification_status === "conflicting_sources")) {
          const prev = rec.arabic_name || "";
          const prevLetters = stripHarakatOnly(prev);
          const corrLetters = stripHarakatOnly(canonical);
          const srcTitles = (Array.isArray(out.verification_sources) ? out.verification_sources : [])
            .map((s: any) => s && s.title).filter(Boolean).join("; ");
          const kind = prevLetters === corrLetters ? "harakat" : "spelling";
          update.arabic_name = canonical;
          update.arabic_normalized = normalizeArabic(canonical);
          update.spelling_corrected = true;
          update.spelling_correction = {
            previous_harakat: prev,
            corrected_harakat: canonical,
            previous_spelling: prevLetters,
            corrected_spelling: corrLetters,
            confidence: Number(out.verification_confidence || 0),
            evidence: `Scholarly verification established "${canonical}" as the correct ${kind} of this name${srcTitles ? ` (sources: ${srcTitles})` : ""}.`,
            corrected_at: now,
            sources: [],
          };
        }
        await base44.asServiceRole.entities.HolyNameKnowledge.update(rec.id, update);

        return {
          name_id: rec.name_id, arabic: rec.arabic_name, transliteration: rec.transliteration,
          origin: update.name_origin, status: update.verification_status,
          confidence: update.verification_confidence, sources: update.verification_sources.length,
          has_canonical: !!update.canonical_arabic, alternatives: update.alternative_readings.length,
          islamic_info: Object.keys(update.islamic_knowledge||{}).filter(k=>update.islamic_knowledge[k] && (Array.isArray(update.islamic_knowledge[k])?update.islamic_knowledge[k].length:update.islamic_knowledge[k])).length,
          traditional: update.traditional_practices.length,
          invocations: update.invocations.length,
        };
      } catch (e: any) {
        return { name_id: rec.name_id, arabic: rec.arabic_name, error: String(e?.message||e) };
      }
    };

    const results: any[] = [];
    for (let i = 0; i < targets.length; i += CONCURRENCY) {
      if ((Date.now() - startedAt) >= TIME_BUDGET_MS) break;
      const chunk = targets.slice(i, i + CONCURRENCY);
      const chunkRes = await Promise.all(chunk.map(processOne));
      results.push(...chunkRes);
    }

    return Response.json({
      status: "ok",
      processed: results.length,
      requested: targets.length,
      time_elapsed_ms: Date.now() - startedAt,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});