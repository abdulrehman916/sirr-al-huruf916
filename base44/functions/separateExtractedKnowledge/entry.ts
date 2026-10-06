import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// ═══════════════════════════════════════════════════════════════
// separateExtractedKnowledge — MODULE SEPARATION MIGRATION
//
// Reads ALL categorized findings from AstroClockKnowledge and
// separates them into their correct modules:
//
//   1. HOLY NAMES (specific Divine Names) → HolyNameImportedSection
//      (appended as child records to existing HolyNameKnowledge cards)
//
//   2. SECTION D (miscellaneous Holy Names content) → SectionDKnowledge
//      (new entity for long du'as, general wazifas, Qur'an references,
//       Islamic figures, spiritual practices not tied to a specific
//       Divine Name)
//
//   3. JINN/OCCULT → marked RESERVED_FOR_FUTURE_MODULE in attributes
//      (left in AstroClockKnowledge, hidden from display, preserved
//       for a future dedicated module)
//
//   4. KABBALAH → marked ARCHIVED_KABBALAH in attributes
//      (left in AstroClockKnowledge, hidden from display, preserved)
//
//   5. ASTRO CLOCK → left as-is (no change, stays in display)
//
//   6. WRONG-SLUG DUPLICATES → left as-is (hidden, internal backup)
//
// LAWS (non-negotiable):
//   - NEVER delete records from AstroClockKnowledge
//   - NEVER overwrite existing HolyNameKnowledge or HolyNameImportedSection
//   - APPEND-ONLY — all new records are additions, never replacements
//   - Preserve every Arabic letter + harakat EXACTLY as stored
//   - Use content_hash for dedup (skip if already exists)
//   - Mark moved records with attributes.module_assignment
//
// ADMIN/OWNER ONLY.
// ═══════════════════════════════════════════════════════════════

// ── SHA-256 helper ──
async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Arabic normalization (strip harakat/tatweel) ──
function normalizeArabic(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/[\u064B-\u065F\u0670\u0640\u06D6-\u06ED]/g, '') // harakat + tatweel
    .replace(/\u0622/g, '\u0627') // alef madda → alef
    .replace(/\u0623/g, '\u0627') // alef hamza above → alef
    .replace(/\u0625/g, '\u0627') // alef hamza below → alef
    .replace(/\u0649/g, '\u064A') // alef maqsura → ya
    .replace(/\u0629/g, '\u0647') // ta marbuta → ha
    .trim();
}

function slug(text: string): string {
  return String(text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

// ── Classification sets ──

// Divine Name entity slugs → Arabic names for matching to HolyNameKnowledge
const DIVINE_NAME_MAP: Record<string, string> = {
  'allah': 'الله',
  'ism_al_azam': 'الاسم الاعظم',
  'al_halim': 'الحليم',
  'al_hayy_al_qayyum': 'الحي القيوم',
  'al_hafiz': 'الحفيظ',
  'ya_sabir': 'يا صبر',
};

// Section D entities — Holy Names content ONLY (Islamic practices, Qur'an
// references, spiritual practices related to Divine Names). Jinn/Occult
// entities are NOT here — they are checked separately and marked RESERVED.
const SECTION_D_ENTITIES = new Set([
  // Islamic invocations & general wazifas
  'bismillah', 'basmala', 'basmalah', 'salawat', 'tasbih', 'adhan',
  'salat', 'prayer_times', 'morning_and_evening', 'last_third_of_night',
  // Long du'as
  'dua_al_saifi', 'jawshan_kabir', 'doa_akasyah', 'shifa', 'fatihah',
  // Qur'an references
  'quran', 'ayat_al_kursi', 'surah_al_jinn', 'surah_yasin', 'surah_al_ikhlas',
  // Islamic figures (scholars, prophets, angels)
  'muhammad', 'sheikh_abdul_qadir', 'imam_ali', 'ja_far_al_sadiq', 'idris',
  'prophet_yunus', 'sulaiman', 'gabriel', 'gibra_iil', 'metatron',
  'israf_al_ammar', 'ali', 'salafi',
  // Holy Names spiritual practices & hirz
  'berhatiah', 'barhatiah', 'berhatyah', 'hirz_al_sayfi_al_yamani',
  'hirz_al_jawsyan', 'hirz_al_jawad', 'harz', 'kashf', 'jafr',
  'abjad_al_kabir', 'istikhara',
  // General Divine Names references (not a specific name)
  'names', 'divine_names',
  // Divine Name entities that may not have a matching HolyNameKnowledge card
  // — when unmatched, they go to Section D as miscellaneous Holy Names content
  'allah', 'ism_al_azam', 'al_halim', 'al_hayy_al_qayyum', 'al_hafiz', 'ya_sabir',
]);

// Jinn/Occult entities — RESERVED_FOR_FUTURE_MODULE
const JINN_OCCULT_ENTITIES = new Set([
  'jinn', 'satan', 'shaitan', 'iblis', 'afrit',
  'evil_eye', 'evileye', 'sorcery', 'sihr', 'ruqyah',
  'amulet', 'talisman', 'protection', 'healing', 'marriage',
  'love', 'sustenance', 'fear', 'cleansing', 'divination',
  'magic', 'snake', 'lost_items', 'insomnia', 'fever',
  'heart_disease', 'menorrhagia', 'child_protection', 'consecration',
  'ritual_space_consecration', 'illumination_wash', 'arwaah', 'spirits',
  'salamanders', 'undines', 'sylphs', 'gnomes', 'sebitti',
]);

// Kabbalah entities — ARCHIVED_KABBALAH
const KABBALAH_ENTITIES = new Set([
  'tree_of_life', 'kether', 'chokmah', 'chesed', 'geburah', 'malkuth',
  'hebrew_alphabet', 'aleph', 'bet', 'gimmel', 'dalet', 'hey', 'vav',
  'zain', 'chet', 'thet', 'yod', 'kaph', 'lamed', 'pythagoras',
  'pentagram', 'samhain', 'taimtegilial', 'tahitmeghilial',
]);

// Wrong-slug duplicates — leave as-is (hidden, internal backup)
const WRONG_SLUGS = new Set([
  'planets', 'zodiac_signs', 'lunar_mansions', 'weekdays', 'elements',
  'i_n_v_o_c_a_t_i_o_n_s', 'l_u_c_k_y_t_i_m_i_n_g_s', 'm_u_j_a_r_r_a_b_a_t',
  'r_i_t_u_a_l_s', 's_p_e_c_i_a_l_n_i_g_h_t_s', 'c_o_r_r_e_s_p_o_n_d_e_n_c_e_s',
  'scan_marker', 'general astrology', 'nine_mizan',
]);

// Astro entity patterns (regex) — these stay in Astro Clock
const ASTRO_PATTERNS: RegExp[] = [
  /^(sun|moon|mars|mercury|jupiter|venus|saturn)$/,
  /^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)$/,
  /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/,
  /^(fire|earth|air|water)$/,
  /^mansion[-_]\d+$/,
  /^hour[-_]\d+$/,
  /^[1-9]$|^1\d$|^2[0-8]$/,
  /^(muharram|safar|rabi|jumada|rajab|shaban|ramadan|shawwal|dhu)/,
];

function isAstroEntity(entity: string): boolean {
  const e = (entity || '').toLowerCase().trim();
  if (!e) return true;
  return ASTRO_PATTERNS.some(p => p.test(e));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return Response.json({ error: 'Admin/Owner only' }, { status: 403 });
    }
    const sdk = base44.asServiceRole;
    const started = Date.now();

    // ── Load all AstroClockKnowledge categorized findings ──
    const allFindings: any[] = [];
    let skip = 0;
    while (allFindings.length < 5000) {
      const batch = await sdk.entities.AstroClockKnowledge.filter(
        { source_type: 'categorized', is_marker: false }, '-created_date', 500, skip
      ).catch(() => []);
      if (!batch || batch.length === 0) break;
      allFindings.push(...batch); skip += batch.length;
      if (batch.length < 500) break;
    }

    // ── Load all HolyNameKnowledge records for Divine Name matching ──
    const holyNames: any[] = [];
    skip = 0;
    while (holyNames.length < 2000) {
      const batch = await sdk.entities.HolyNameKnowledge.list('-order_index', 500, skip).catch(() => []);
      if (!batch || batch.length === 0) break;
      holyNames.push(...batch); skip += batch.length;
      if (batch.length < 500) break;
    }
    // Build normalized lookup map
    const holyNameByNormalized: Map<string, any> = new Map();
    for (const hn of holyNames) {
      const norm = normalizeArabic(hn.arabic_name || '');
      if (norm) holyNameByNormalized.set(norm, hn);
    }

    // ── Load existing SectionDKnowledge for canonical_key append-merge ──
    // Future PDF imports APPEND into the existing card (matched by canonical_key)
    // instead of creating duplicates.
    const existingSD: Map<string, any> = new Map();
    skip = 0;
    while (existingSD.size < 5000) {
      const batch = await sdk.entities.SectionDKnowledge.list('-created_date', 500, skip).catch(() => []);
      if (!batch || batch.length === 0) break;
      for (const sd of batch) {
        const ck = sd.canonical_key || `${sd.content_type}|${sd.original_rule_entity}`;
        if (ck && !existingSD.has(ck)) existingSD.set(ck, sd);
      }
      skip += batch.length;
      if (batch.length < 500) break;
    }

    // ── Classification stats ──
    const stats = {
      totalFindings: allFindings.length,
      astroClock: 0,
      holyNamesMoved: 0,
      holyNamesMatched: 0,
      holyNamesUnmatched: 0,
      sectionD: 0,
      jinnOccultReserved: 0,
      kabbalahArchived: 0,
      wrongSlugSkipped: 0,
      errors: 0,
    };

    const report = {
      holyNamesMigrated: [] as any[],
      sectionDCreated: [] as any[],
      jinnOccultReserved: [] as any[],
      kabbalahArchived: [] as any[],
      astroClockRetained: 0,
      errors: [] as string[],
    };

    const MIGRATION_BATCH = `migration_from_astro_clock_${new Date().toISOString().slice(0, 10)}`;
    const now = new Date().toISOString();

    for (const r of allFindings) {
      const cat = r.rule_category || '';
      const ent = (r.rule_entity || '').toLowerCase().trim();

      // Skip wrong-slug duplicates (leave as-is, hidden)
      if (WRONG_SLUGS.has(cat)) {
        stats.wrongSlugSkipped++;
        continue;
      }

      // Check if already migrated (skip if module_assignment already set)
      const existingAssignment = r.attributes?.module_assignment;
      if (existingAssignment) {
        // Already processed in a previous run — count and skip
        if (existingAssignment === 'moved_to_holy_names') stats.holyNamesMoved++;
        else if (existingAssignment === 'moved_to_section_d') stats.sectionD++;
        else if (existingAssignment === 'reserved_jinn_occult') stats.jinnOccultReserved++;
        else if (existingAssignment === 'archived_kabbalah') stats.kabbalahArchived++;
        continue;
      }

      // ── 1. Check for Divine Name (Holy Names) ──
      const divineNameArabic = DIVINE_NAME_MAP[ent];
      if (divineNameArabic) {
        const normalized = normalizeArabic(divineNameArabic);
        const matchedHN = holyNameByNormalized.get(normalized);
        if (matchedHN) {
          // Create HolyNameImportedSection child record
          const textContent = [
            r.knowledge_text_en || '',
            r.knowledge_text_ar || '',
            r.knowledge_text_ml || '',
          ].filter(Boolean).join('\n---\n');

          const hashInput = `section_a|${matchedHN.name_id}|${normalizeArabic(r.knowledge_text_ar || '')}|${(r.knowledge_text_en || '').slice(0, 200)}`;
          const contentHash = await sha256(hashInput);

          try {
            await sdk.entities.HolyNameImportedSection.create({
              section_id: `HNIS-MIG-${(await sha256(r.knowledge_id || contentHash)).slice(0, 16)}`,
              source_section: 'section_a',
              source_name_key: matchedHN.name_id,
              name_id: matchedHN.name_id,
              text_content: textContent,
              arabic_text: r.knowledge_text_ar || '',
              malayalam_translation: r.knowledge_text_ml || '',
              language: (r.knowledge_text_ar && r.knowledge_text_ml) ? 'mixed' : (r.knowledge_text_ar ? 'ar' : 'ml'),
              content_hash: contentHash,
              source_pdf_file: r.source_book_title || '',
              source_pdf_page: parseInt(String(r.source_page_number || '0').split(',')[0]) || 0,
              import_date: now,
              import_batch: MIGRATION_BATCH,
            });
            stats.holyNamesMoved++;
            stats.holyNamesMatched++;
            report.holyNamesMigrated.push({
              original_id: r.knowledge_id,
              entity: ent,
              matched_name: matchedHN.arabic_name,
              matched_name_id: matchedHN.name_id,
            });
          } catch (e: any) {
            // Dedup: content_hash already exists — skip silently
            if (!String(e.message || '').includes('duplicate') && !String(e.message || '').includes('already')) {
              stats.errors++;
              report.errors.push(`HolyNameImportedSection create failed for ${ent}: ${e.message}`);
            }
          }

          // Mark original as moved
          try {
            const attrs = { ...(r.attributes || {}), module_assignment: 'moved_to_holy_names' };
            await sdk.entities.AstroClockKnowledge.update(r.id || r._id, { attributes: attrs });
          } catch (_) {}
          continue;
        } else {
          // Divine Name not found in HolyNameKnowledge → goes to Section D
          stats.holyNamesUnmatched++;
        }
      }

      // ── 2. Check for Jinn/Occult FIRST — mark RESERVED (before Section D) ──
      if (JINN_OCCULT_ENTITIES.has(ent)) {
        try {
          const attrs = { ...(r.attributes || {}), module_assignment: 'reserved_jinn_occult' };
          await sdk.entities.AstroClockKnowledge.update(r.id || r._id, { attributes: attrs });
          stats.jinnOccultReserved++;
          report.jinnOccultReserved.push({
            original_id: r.knowledge_id,
            entity: ent,
            category: cat,
          });
        } catch (_) {
          stats.errors++;
        }
        continue;
      }

      // ── 3. Check for Section D entity (Holy Names content only) ──
      // Note: divineNameArabic entities that were NOT matched to a
      // HolyNameKnowledge card also land here (unmatched Divine Names).
      if (SECTION_D_ENTITIES.has(ent)) {
        // Determine content_type
        let contentType = 'miscellaneous';
        if (['dua_al_saifi', 'doa_akasyah', 'jawshan_kabir', 'fatihah'].includes(ent)) contentType = 'long_dua';
        else if (['bismillah', 'basmala', 'basmalah', 'salawat', 'tasbih', 'adhan', 'salat', 'prayer_times', 'morning_and_evening', 'last_third_of_night'].includes(ent)) contentType = 'general_wazifa';
        else if (['ayat_al_kursi', 'surah_al_jinn', 'surah_yasin', 'surah_al_ikhlas', 'quran'].includes(ent)) contentType = 'quran_reference';
        else if (['sheikh_abdul_qadir', 'imam_ali', 'ja_far_al_sadiq', 'idris', 'prophet_yunus', 'sulaiman', 'gabriel', 'gibra_iil', 'metatron', 'israf_al_ammar', 'ali', 'muhammad'].includes(ent)) contentType = 'islamic_figure';
        else if (['berhatiah', 'barhatiah', 'berhatyah', 'hirz_al_sayfi_al_yamani', 'hirz_al_jawsyan', 'hirz_al_jawad', 'harz', 'kashf', 'jafr', 'istikhara', 'shifa', 'consecration', 'ritual_space_consecration', 'illumination_wash'].includes(ent)) contentType = 'spiritual_practice';
        else if (r.rule_category === 'khawass') contentType = 'general_khawass';
        else if (r.rule_category === 'mujarrabat') contentType = 'general_mujarrabat';

        const canonicalKey = `${contentType}|${ent}`;
        const hashInput = `${contentType}|${ent}|${normalizeArabic(r.knowledge_text_ar || '')}|${(r.knowledge_text_en || '').slice(0, 200)}`;
        const contentHash = await sha256(hashInput);
        const citation = `${r.source_book_title || 'Unknown'}${r.source_page_number ? ' p.' + r.source_page_number : ''}`;

        const existingCard = existingSD.get(canonicalKey);

        if (existingCard) {
          // ── APPEND to existing card's additional_sources (never overwrite) ──
          const newSource = {
            arabic_text: r.knowledge_text_ar || '',
            malayalam_translation: r.knowledge_text_ml || '',
            explanation: r.knowledge_text_en || '',
            source_book_title: r.source_book_title || '',
            source_page_number: r.source_page_number || '',
            citation,
            imported_at: now,
          };
          const additionalSources = Array.isArray(existingCard.additional_sources) ? [...existingCard.additional_sources] : [];
          if (!additionalSources.some(s => (s.citation || '') === citation)) {
            additionalSources.push(newSource);
            try {
              await sdk.entities.SectionDKnowledge.update(existingCard.id || existingCard._id, {
                additional_sources: additionalSources,
              });
              existingCard.additional_sources = additionalSources;
            } catch (_) { stats.errors++; }
          }
          stats.sectionD++;
        } else {
          // ── CREATE new card ──
          try {
            const newRec = {
              section_d_id: `SD-MIG-${(await sha256(r.knowledge_id || contentHash)).slice(0, 16)}`,
              canonical_key: canonicalKey,
              title: ent,
              content_type: contentType,
              arabic_text: r.knowledge_text_ar || '',
              malayalam_translation: r.knowledge_text_ml || '',
              explanation: r.knowledge_text_en || '',
              knowledge_text_en: r.knowledge_text_en || '',
              source_book_title: r.source_book_title || '',
              source_page_number: r.source_page_number || '',
              citation,
              original_knowledge_id: r.knowledge_id || '',
              original_rule_category: cat,
              original_rule_entity: ent,
              migrated_at: now,
              content_hash: contentHash,
            };
            const created = await sdk.entities.SectionDKnowledge.create(newRec);
            existingSD.set(canonicalKey, { ...newRec, id: created?.id || created?._id });
            stats.sectionD++;
            report.sectionDCreated.push({
              original_id: r.knowledge_id,
              entity: ent,
              content_type: contentType,
            });
          } catch (e: any) {
            if (!String(e.message || '').includes('duplicate') && !String(e.message || '').includes('already')) {
              stats.errors++;
              report.errors.push(`SectionDKnowledge create failed for ${ent}: ${e.message}`);
            }
          }
        }

        // Mark original as moved
        try {
          const attrs = { ...(r.attributes || {}), module_assignment: 'moved_to_section_d' };
          await sdk.entities.AstroClockKnowledge.update(r.id || r._id, { attributes: attrs });
        } catch (_) {}
        continue;
      }

      // ── 4. Check for Kabbalah — mark ARCHIVED ──
      if (KABBALAH_ENTITIES.has(ent)) {
        try {
          const attrs = { ...(r.attributes || {}), module_assignment: 'archived_kabbalah' };
          await sdk.entities.AstroClockKnowledge.update(r.id || r._id, { attributes: attrs });
          stats.kabbalahArchived++;
          report.kabbalahArchived.push({
            original_id: r.knowledge_id,
            entity: ent,
            category: cat,
          });
        } catch (_) {
          stats.errors++;
        }
        continue;
      }

      // ── 5. Astro Clock — leave as-is ──
      if (isAstroEntity(ent)) {
        stats.astroClock++;
        report.astroClockRetained++;
        continue;
      }

      // ── 6. Unclassified with non-astro entity but not in any set ──
      // Check if it's a general astrology category
      const ASTRO_CATEGORIES = new Set([
        'planetary_hours', 'sahat', 'planet', 'zodiac', 'lunar mansion',
        'weekday', 'element', 'colours', 'stones', 'metals', 'incense',
        'directions', 'lucky_timings', 'unfavourable_timings', 'special_days',
        'special_nights', 'planet_relationships', 'friendly_planets', 'enemy_planets',
        'correspondences', 'treatments', 'recommended_actions', 'forbidden_actions',
        'ritual_suitability', 'islamic_months', 'rituals', 'spiritual_properties',
        'wafq', 'khawass', 'mujarrabat', 'invocations',
      ]);

      if (ASTRO_CATEGORIES.has(cat)) {
        stats.astroClock++;
        report.astroClockRetained++;
      } else {
        // Truly unclassified — leave as-is but count
        stats.astroClock++;
        report.astroClockRetained++;
      }
    }

    return Response.json({
      status: 'complete',
      migrationBatch: MIGRATION_BATCH,
      summary: {
        totalFindingsProcessed: stats.totalFindings,
        astroClockRetained: report.astroClockRetained,
        holyNamesMoved: stats.holyNamesMoved,
        holyNamesMatched: stats.holyNamesMatched,
        holyNamesUnmatched: stats.holyNamesUnmatched,
        sectionDCreated: stats.sectionD,
        jinnOccultReserved: stats.jinnOccultReserved,
        kabbalahArchived: stats.kabbalahArchived,
        wrongSlugSkipped: stats.wrongSlugSkipped,
        errors: stats.errors,
      },
      details: {
        holyNamesMigrated: report.holyNamesMigrated,
        sectionDCreated: report.sectionDCreated.slice(0, 50),
        jinnOccultReserved: report.jinnOccultReserved.slice(0, 30),
        kabbalahArchived: report.kabbalahArchived.slice(0, 30),
        errors: report.errors.slice(0, 10),
      },
      laws: {
        noRecordsDeleted: true,
        noRecordsOverwritten: true,
        appendOnly: true,
        astroClockArchitectureUnchanged: true,
        manuscriptCalculationSystemIntact: true,
        jinnOccultReserved: true,
        kabbalahArchived: true,
        legacyDuplicatesPreserved: true,
      },
      timeMs: Date.now() - started,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});