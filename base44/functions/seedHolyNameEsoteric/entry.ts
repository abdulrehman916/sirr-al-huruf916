import { createClientFromRequest } from "npm:@base44/sdk@0.8.38";

// ═══════════════════════════════════════════════════════════════
// seedHolyNameEsoteric — admin-only, idempotent seed for Section C
// (Birhatīya / Esoteric Invocation Names).
//
// Source #1: N Wahid Azal, "The Birhatīya Conjuration Oath and the
// meaning of its first 28 names" (Revised © 2014), based on Aḥmad
// al-Būnī (d. 1225), Manbaʿ Uṣūl al-Ḥikma, Beirut, n.d., pp. 67–74.
//
// Creates 28 EMPTY scholarly cards (HNK-MHC-001..028) with:
//   - PRIMARY INFORMATION filled from Source #1 (Arabic name,
//     transliteration, exact verbatim meaning, abjad value, source
//     citation) — these come directly from the owner's PDF.
//   - Individual letter values + full abjad calculation computed
//     mechanically (deterministic, NOT fabrication) from the Arabic
//     name using the standard Abjad table.
//   - ALL advanced sections EMPTY (awaiting owner approval + future
//     source uploads).
//
// Idempotent: skips names whose arabic_normalized already exists.
// Never overwrites existing records.
//
// Input (optional): { names: [{ arabic_name, transliteration,
//   exact_meaning, abjad, source_reference, source_page }] }
// If no names supplied, uses the built-in Source #1 list of 28.
//
// ISOLATED — touches ONLY HolyNameEsotericKnowledge.
// ═══════════════════════════════════════════════════════════════

// Standard Abjad (Mashriqi) values.
const ABJAD: Record<string, number> = {
  "ا": 1, "أ": 1, "إ": 1, "آ": 1, "ٱ": 1,
  "ب": 2, "ج": 3, "د": 4, "ه": 5, "ة": 5,
  "و": 6, "ؤ": 6, "ز": 7, "ح": 8, "ط": 9,
  "ي": 10, "ى": 10, "ئ": 10, "ك": 20, "ل": 30,
  "م": 40, "ن": 50, "س": 60, "ع": 70, "ف": 80,
  "ص": 90, "ق": 100, "ر": 200, "ش": 300, "ت": 400,
  "ث": 500, "خ": 600, "ذ": 700, "ض": 800, "ظ": 900, "غ": 1000,
};

// Harakat + tatweel to strip when isolating letters.
const HARAKAT = /[\u064B-\u065F\u0670\u0640\u0651\u0652\u0653\u0654\u0655]/g;

function normalizeArabic(s: string): string {
  if (!s) return "";
  return String(s)
    .replace(HARAKAT, "")
    .replace(/\u0622/g, "\u0627").replace(/\u0623/g, "\u0627")
    .replace(/\u0625/g, "\u0627").replace(/\u0624/g, "\u0648")
    .replace(/\u0626/g, "\u064A").replace(/\u0649/g, "\u064A")
    .replace(/\u0629/g, "\u0647").trim();
}

// Compute the per-letter Abjad breakdown for an Arabic name.
// Returns { letters: [{letter, value}], sum, calculation }.
function computeAbjad(arabic: string) {
  if (!arabic) return { letters: [], sum: 0, calculation: "" };
  // Strip harakat to get the bare letter sequence.
  const bare = String(arabic).replace(HARAKAT, "");
  const letters: { letter: string; value: number }[] = [];
  let sum = 0;
  for (const ch of bare) {
    const v = ABJAD[ch];
    if (v === undefined) continue; // skip non-Abjad chars (spaces, etc.)
    letters.push({ letter: ch, value: v });
    sum += v;
  }
  const calculation = letters.map(l => `${l.letter}(${l.value})`).join(" + ") + ` = ${sum}`;
  return { letters, sum, calculation };
}

// Source #1 reference (the owner's uploaded PDF).
const SRC_REF = "N Wahid Azal, The Birhatīya Conjuration Oath and the meaning of its first 28 names (Revised © 2014), based on Aḥmad al-Būnī (d. 1225), Manbaʿ Uṣūl al-Ḥikma, Beirut, n.d.";
const SRC_PAGES = "67–74";

// The 28 Birhatīya names + exact verbatim meanings from Source #1.
const SOURCE_1: { a: string; t: string; m: string; v: number }[] = [
  { a: "بِرْهَتِيَة", t: "Birhatya", m: "'Holy' and some say 'Glorified'", v: 622 },
  { a: "كَرِير", t: "Karīr", m: "'God of all-things' and some say 'O God'", v: 430 },
  { a: "تَتْلِيَه", t: "Tatlīyah", m: "'the Holy, the Powerful/the Powerfully Holy' and it is also said 'Glorified, Holy' and some say 'The Well-Informed' and it is said 'The Protector from Oppression'", v: 845 },
  { a: "طَوْرَان", t: "Ṭawrān", m: "'O Alive/Living' and some say 'O Revivifier'", v: 266 },
  { a: "مَزْجَل", t: "Mazjal", m: "'O Peerless/Self-Subsistent' and some say 'O Ariser'", v: 80 },
  { a: "بَزْجَل", t: "Bazjal", m: "'O Adored One' and some say 'O God' and it is said 'O Victorious' and some say 'O One/Primary' and it is said 'O One/First'", v: 42 },
  { a: "تَرْقَب", t: "Tarqab", m: "'O Peace'", v: 702 },
  { a: "بَرْهَش", t: "Barhash", m: "'O God, thy servant. Respond to him' and some say 'O Powerful/Capable'", v: 507 },
  { a: "غَلْمَش", t: "Ghalmash", m: "'O Praised One, O Glorious One' and some say 'O Sovereign'", v: 1370 },
  { a: "خَوْطِيْر", t: "Khawtayr", m: "'O Powerful' and it is said 'O Impregnable, O Knowing, O Wise'", v: 825 },
  { a: "قَلْنَهُود", t: "Qalnahuwd", m: "'O Impregnable' and it is said 'O Hearer, O Seer' and it is said 'O Hearing, O Wondrous/Fashioner' and some say 'O Self-Sufficient' and it is said 'O All-Encompassing'", v: 195 },
  { a: "بَرْشَان", t: "Barshān", m: "'O All-Encompassing' and it is said 'O Godhead, O Dearly Precious/Grandiose'", v: 553 },
  { a: "كَظْهِير", t: "Katẓīr", m: "'Glory be to God' and it is said 'O Powerful, O Impregnable' and some say 'O Merciful'", v: 1135 },
  { a: "نَمُوشَلَخ", t: "Namūshalakh", m: "'O God, O Dearly Precious/Grandiose/Tremendous' and it is said 'I Am God, the refuge of the fearful' And it is also said its meaning denotes 'O Dearly Precious/Grandiose/ Thou art God' and others say 'O God, O Powerful, O Impregnable' and it is said 'O God, O It/he'", v: 1026 },
  { a: "بَرْهَيُولَا", t: "Barhayūlā", m: "'Glory be to God' and some say 'I Am God, the refuge of the fearful' and others say 'O Sufficient, O Hearer' and it is said 'O God, may my soul be raised by Thy Spirit to Thy Will'", v: 254 },
  { a: "بَشْكِيلَخ", t: "Bashkīlakh", m: "'O Protector of Faith' and it is said 'Lofty be God, the Compassionate, the Merciful'", v: 962 },
  { a: "قَزْمَز", t: "Qazmaz", m: "'O Protector' and it is said 'Lofty be God, the Compassionate, the Merciful'", v: 154 },
  { a: "أَنْغَلَّلِيط", t: "Anghalalīt", m: "'O Mighty, O Judge/Wise' and it is said 'O Judge/Wise, O Well-Informed, O Magnanimous' and others say 'the Compassionate, the Merciful'", v: 1130 },
  { a: "قَبَرَات", t: "Qabarāt", m: "'O Dearly Precious/Grandiose' and it is said 'O Subsistent' and others say 'O Clement' and it is said 'O Judge/Wise' and some say 'O Sufficient, O Munificent' and it is said 'Lofty be the Godhead, the Sufficient, the Munificent'", v: 703 },
  { a: "غَيَاهَا", t: "Ghayāhā", m: "'O Munificent, O Victorious' and it is also said 'O Munificent, O Adjudicator/Judge' and others say 'O Dearly Precious/Grandiose, O Omnipotent'", v: 1017 },
  { a: "كَيْدَهُولَا", t: "Kaydhūlā", m: "'The Powerful/Capable, It/He is God' and it is said 'O Ancient, O Victorious, O Powerful/Capable over all-things' and some say 'O speedy/swift One'", v: 76 },
  { a: "سِمَاخِر", t: "Simākhir", m: "'Elevated art Thou, O High, O Knowing'", v: 901 },
  { a: "شِمْخَاهِير", t: "Shimkhāhīr", m: "'O Adjudicator/Judge' and it is said 'O It/he, O It/he' and others say 'O Lord, O Lord'", v: 1156 },
  { a: "شِمْهَاهِير", t: "Shimhāhīr", m: "'O Powerful, O Capable' and it is said 'O Sufficient, O Dearly Precious/Grandiose, O Omnipotent'", v: 561 },
  { a: "بَكْهَطُونِيَه", t: "Bakhaṭūnīya", m: "'O Ancient' and it is said 'O Constant/Perpetual'", v: 107 },
  { a: "بَشَارِش", t: "Bashārish", m: "'O Capable/Powerful over all-things'", v: 803 },
  { a: "طَوْنِش", t: "Ṭawnish", m: "'O Praiseworthy' and it is said 'It is God, the Munificent'", v: 365 },
  { a: "شَمْخَابَارُوخ", t: "Shamkhābārūkh", m: "'O Capable/Powerful, He is God, the Munificent'", v: 1750 },
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
    if (user.role !== "admin") return Response.json({ error: "Forbidden — admin only" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    // Use supplied names if provided, else the built-in Source #1 list.
    const supplied: any[] = Array.isArray(body?.names) ? body.names : SOURCE_1.map((n, i) => ({
      arabic_name: n.a, transliteration: n.t, exact_meaning: n.m, abjad: n.v,
      source_reference: SRC_REF, source_page: SRC_PAGES, order_index: i + 1,
    }));

    if (supplied.length === 0) {
      return Response.json({ status: "ok", message: "no names supplied", created: 0 });
    }

    // Load existing to skip duplicates (idempotent).
    const existing = await base44.asServiceRole.entities.HolyNameEsotericKnowledge.list("-created_date", 2000);
    const existingNorm = new Set((existing || []).map((r: any) => (r.arabic_normalized || "").trim()).filter(Boolean));

    const now = new Date().toISOString();

    // Sequential numbering: continue from highest existing number.
    let nextSeq = 1;
    for (const r of (existing || [])) {
      const m = /^HNK-MHC-(\d+)$/.exec(String(r.name_id || ""));
      if (m) nextSeq = Math.max(nextSeq, parseInt(m[1], 10) + 1);
    }

    const toCreate: any[] = [];
    let skipped = 0;

    for (let i = 0; i < supplied.length; i++) {
      const n = supplied[i] || {};
      const arabic = String(n.arabic_name || "").trim();
      if (!arabic) { skipped++; continue; }
      const norm = normalizeArabic(arabic);
      if (existingNorm.has(norm)) { skipped++; continue; }
      existingNorm.add(norm);

      const id = `HNK-MHC-${String(nextSeq).padStart(3, "0")}`;
      nextSeq++;

      const abjadFromSource = Number(n.abjad || n.total_abjad_value || 0);
      const { letters, sum, calculation } = computeAbjad(arabic);
      const abjadVerified = abjadFromSource > 0 && sum === abjadFromSource;
      const letterCount = letters.length;
      const srcRef = String(n.source_reference || SRC_REF);
      const srcPage = String(n.source_page || SRC_PAGES);
      const srcNotes = abjadVerified ? "" : `Mechanically computed Abjad sum = ${sum}; source-stated value = ${abjadFromSource}. Discrepancy flagged for review.`;

      toCreate.push({
        name_id: id,
        order_index: Number(n.order_index || (i + 1)),
        original_static_id: Number(n.order_index || (i + 1)),
        is_active: true,
        seeded: true,
        arabic_name: arabic,
        arabic_normalized: norm,
        canonical_arabic_name: "",
        transliteration: String(n.transliteration || ""),
        malayalam_transliteration: "",
        english_transliteration: "",
        exact_meaning: String(n.exact_meaning || ""),
        letter_count: letterCount,
        individual_letter_values: letters,
        full_abjad_calculation: calculation,
        total_abjad_value: abjadFromSource,
        abjad_verified: abjadVerified,
        verification_status: "unverified",
        source_reference: srcRef,
        source_page_number: srcPage,
        source_notes: srcNotes,
        scholarly_data: [{
          source_reference: srcRef,
          source_page: srcPage,
          verbatim_text: String(n.exact_meaning || ""),
          exact_meaning: String(n.exact_meaning || ""),
          arabic_text: arabic,
          transliteration: String(n.transliteration || ""),
          notes: "Source #1 — primary extraction",
          imported_at: now,
        }],
        sources: [{ reference: srcRef, page: srcPage, imported_at: now, notes: "Source #1" }],
        alternate_spellings: [],
        alternate_pronunciations: [],
        alternate_meanings: [],
        alternate_abjad_values: [],
        invocation_wazifa: [], complete_birhatiyya_text: [], related_conjurations: [],
        related_azaim: [], related_ruhaniyyat: [], related_talismans: [],
        related_magic_squares: [], khawass: [], amal: [], mujarrabat: [],
        khatam: [], dairah: [], talisman_images: [], ritual_procedure: [],
        conditions: [], number_of_recitations: [], timing: [], planet: [],
        lunar_mansion: [], zodiac: [], incense: [], colors: [], elements: [],
        angels: [], jinn: [], servitors: [], benefits: [], warnings: [],
        scholarly_discussions: [], historical_notes: [], manuscript_variants: [],
        related_books: [], cross_references: [],
      });
    }

    const created = toCreate.length > 0
      ? await base44.asServiceRole.entities.HolyNameEsotericKnowledge.bulkCreate(toCreate)
      : [];

    return Response.json({
      status: "ok",
      supplied: supplied.length,
      created: Array.isArray(created) ? created.length : 0,
      skipped_duplicate: skipped,
      created_ids: (Array.isArray(created) ? created : []).map((r: any) => r.name_id),
      abjad_verified_count: toCreate.filter(c => c.abjad_verified).length,
      abjad_discrepancy_count: toCreate.filter(c => !c.abjad_verified).length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});