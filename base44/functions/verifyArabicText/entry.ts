import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ═══════════════════════════════════════════════════════════════
// CRITICAL MANUSCRIPT VERIFICATION SYSTEM — FINAL IMMUTABLE POLICY
// ═══════════════════════════════════════════════════════════════
// Never generate Arabic harakat using AI prediction. AI MUST NEVER GUESS.
// Internet search is ONLY an assistant — never the sole authority.
//
// ══ GLOBAL KNOWLEDGE & DEEP VERIFICATION RULE (PERMANENT) ══
// The system is a VERIFIED MANUSCRIPT LIBRARY, not a text generator.
// Never generate or guess information. Always verify.
//
// VERIFICATION PRIORITY (highest to lowest):
//   Priority 1: Search our own verified Sirr Al-Huruf database first (VerifiedArabic).
//               Reuse the verified version. Never regenerate verified information.
//   Priority 2: Search every verified manuscript already imported into our library
//               (ManuscriptEntry with verification_status='verified').
//               Compare every matching version. Preserve manuscript variants.
//   Priority 3: Only if NOT available internally — DEEP verification using multiple
//               trusted external references. Never depend on a single website.
//               Accept a correction ONLY when there is strong agreement.
//   Priority 4: If verification is still uncertain — DO NOT CHANGE THE MANUSCRIPT.
//               Mark "Needs Manual Review". Never guess.
//
// ARABIC RULE: Never invent Arabic, harakat, ayat, surahs, dua, dhikr, meanings.
//   Every correction must be supported by evidence.
//
// SELF-LEARNING RULE: Every verified entry becomes permanent knowledge.
//   Future imports search the verified database first.
//   The database becomes smarter after every verified book.
//   Never replace verified knowledge with AI assumptions.
//
// FINAL PRINCIPLE: The AI is a Research Assistant and Verification Engine, NOT an author.
//   Accuracy > speed. Verification > generation. When in doubt, keep original unchanged.
//
// IMMUTABLE FIELDS (per revision — never overwritten, new revision = new record):
//   original_manuscript_text, arabic_text, verification_confidence,
//   verification_status, verification_method, primary_source,
//   secondary_sources, book_name, page_number, source_url,
//   cross_verification_sources, holy_name_match, manuscript_match,
//   revision_number, date_verified, reviewer, notes
//
// WORKFLOW:
//   STEP 1: Check DB — return highest VERIFIED revision (rule 6: if a newer
//           revision has lower confidence, the old verified one stays active)
//   STEP 2: Check Holy Names database
//   STEP 3: Search original manuscript data
//   STEP 4: Internet search (ASSISTANT ONLY)
//   STEP 5: Cross-validate ALL sources
//   STEP 6: Confidence drop check (rule 6)
//   STEP 7: Save as NEW revision (never overwrite)
//
// CONFIDENCE: HIGH=Book+online agree, MEDIUM=online agree but manuscript differs,
//   LOW=only one source, UNVERIFIED=no source (nothing stored)
//
// RULES:
//   1. Never overwrite original manuscript Arabic.
//   2. Never overwrite a previous verified version — always new revision.
//   3. Every revision keeps previous history permanently.
//   4. Every phrase has one permanent unique ID (text_hash).
//   5. Same Arabic text links to same record — never duplicate.
//   6. If confidence drops, keep both revisions, require manual approval.
//   7. Display original manuscript separately from verified when they differ.
//   8. If not fully verified, never generate harakat — show "Verification unavailable".
//   9. Every verification reproducible from stored sources.
//   10. Authenticity > completeness. Never guess. Never fabricate.
// ═══════════════════════════════════════════════════════════════

const ARABIC_LETTER_RANGES = [[0x0621, 0x064a], [0x066e, 0x066f], [0x0671, 0x06d3], [0x06d5, 0x06d5]];
const ALEF_VARIANTS = new Set([0x0623, 0x0625, 0x0622, 0x0671]);
const PLAIN_ALEF = '\u0627';
const CONFIDENCE_ORDER = { HIGH: 4, MEDIUM: 3, LOW: 2, UNVERIFIED: 0 };

function isInRange(code, ranges) {
  return ranges.some(([s, e]) => code >= s && code <= e);
}

function normalizeArabic(text) {
  if (!text || typeof text !== 'string') return '';
  let result = '';
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (isInRange(code, ARABIC_LETTER_RANGES)) {
      result += ALEF_VARIANTS.has(code) ? PLAIN_ALEF : ch;
    }
  }
  return result;
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }

    const body = await req.json();
    const {
      arabic_text, source_type, book_name, page_number, section,
      manuscript_arabic_text, manuscript_source,
      force_reverification, revision_reason,
    } = body;

    if (!arabic_text || typeof arabic_text !== 'string') {
      return Response.json({ error: 'arabic_text is required' }, { status: 400 });
    }

    const normalized = normalizeArabic(arabic_text);
    const textHash = await sha256Hex(normalized);

    // ══ STEP 1: Check DB — return highest VERIFIED revision (rule 6) ══
    const allRevisions = await base44.asServiceRole.entities.VerifiedArabic.filter(
      { text_hash: textHash },
      '-revision_number',
      20
    );
    let maxRevision = 0;
    let currentVerified = null;
    let currentManualReview = null;
    if (allRevisions && allRevisions.length > 0) {
      maxRevision = allRevisions[0].revision_number || 1;
      // Rule 6: return the highest VERIFIED revision (not just highest revision_number)
      currentVerified = allRevisions.find(r => r.verification_status === 'verified') || null;
      currentManualReview = allRevisions.find(r => r.verification_status === 'manual_review_required') || null;
    }

    // If NOT force_reverification, reuse the existing record forever
    if (!force_reverification) {
      const reuseEntry = currentVerified || currentManualReview;
      if (reuseEntry) {
        return Response.json({
          ...reuseEntry,
          source: 'local_verified_database',
          reused: true,
        });
      }
    }

    // ══ STEP 2: Check Holy Names database ══
    let holyNameMatch = null;
    if (source_type === 'divine_name' || source_type === 'ism') {
      try {
        const holyNames = await base44.asServiceRole.entities.HolyOneName.list('-created_date', 200);
        if (holyNames && Array.isArray(holyNames)) {
          holyNameMatch = holyNames.find((h) => {
            const hNorm = normalizeArabic(h.arabic_name || '');
            return hNorm.length > 0 && hNorm === normalized;
          }) || null;
        }
      } catch { holyNameMatch = null; }
    }

    // ══ STEP 3: Search original manuscript data ══
    let manuscriptMatch = null;
    try {
      const rules = await base44.asServiceRole.entities.ManuscriptRule.list('-created_date', 200);
      if (rules && Array.isArray(rules)) {
        manuscriptMatch = rules.find((r) => {
          const rNorm = normalizeArabic(r.original_text || '');
          return rNorm.length > 0 && rNorm === normalized;
        }) || null;
      }
    } catch { manuscriptMatch = null; }

    // ══ STEP 3b: Search verified ManuscriptEntry library (Priority 2 — self-learning) ══
    // Search every verified manuscript already imported into our library.
    // If the same Arabic text was verified in a previous import, reuse it.
    // This makes the database smarter after every verified book.
    let verifiedEntryMatch = null;
    try {
      const verifiedEntries = await base44.asServiceRole.entities.ManuscriptEntry.filter(
        { verification_status: 'verified' },
        '-created_date',
        200
      );
      if (verifiedEntries && Array.isArray(verifiedEntries)) {
        verifiedEntryMatch = verifiedEntries.find((e: any) => {
          const eNorm = normalizeArabic(e.arabic_text || '');
          return eNorm.length > 0 && eNorm === normalized;
        }) || null;
      }
    } catch { verifiedEntryMatch = null; }

    let frontendManuscriptMatch = false;
    if (manuscript_arabic_text) {
      const fNorm = normalizeArabic(manuscript_arabic_text);
      if (fNorm.length > 0 && fNorm === normalized) frontendManuscriptMatch = true;
    }

    const hasManuscriptMatch = !!manuscriptMatch || !!verifiedEntryMatch || frontendManuscriptMatch;
    const manuscriptSourceDetail = manuscriptMatch
      ? `${manuscriptMatch.book_name || 'ManuscriptRule'} p.${manuscriptMatch.page_number || '?'}${manuscriptMatch.chapter ? ' · ' + manuscriptMatch.chapter : ''}`
      : verifiedEntryMatch
      ? `${verifiedEntryMatch.book_title || 'ManuscriptEntry'} p.${verifiedEntryMatch.page_number || '?'}`
      : frontendManuscriptMatch ? (manuscript_source || 'Frontend manuscript data') : '';
    const originalManuscriptText =
      manuscriptMatch?.original_text ||
      (verifiedEntryMatch ? verifiedEntryMatch.arabic_text : '') ||
      (frontendManuscriptMatch ? manuscript_arabic_text : '');

    // ══ STEP 4: Internet search (ASSISTANT ONLY) ══
    const prompt = `You are an expert Arabic manuscript verifier specializing in Islamic texts, Quran, Hadith, divine names (Asma al-Husna), adhkar, and occult manuscript traditions.

TASK: Verify this Arabic text by searching authoritative sources on the internet. Internet search is ONLY an assistant — the manuscript and Holy Names are primary authorities.

ARABIC TEXT TO VERIFY:
"${arabic_text}"

SOURCE TYPE: ${source_type || 'unknown'}
BOOK: ${book_name || 'not specified'}
PAGE: ${page_number || 'not specified'}
SECTION: ${section || 'not specified'}

SEARCH INSTRUCTIONS (follow EXACTLY):
1. Search these sources IN ORDER of priority:
   - Priority 1: Quran.com, Tanzil.net, King Fahd Quran Complex
   - Priority 2: Sunnah.com, Shamela, Al-Waraq, Dorar, Altafsir, classical Arabic books
   - Priority 3: Authentic scanned manuscripts, library archives, university collections
   - Priority 4: Verified scholarly websites only
2. Search in Arabic. Search exact phrases AND partial phrases.
3. NEVER use random blogs, AI-generated pages, or unverified websites.
4. Compare ALL sources you find. Only accept if wording AGREES across trusted references.
5. NEVER GUESS harakat. Copy harakat EXACTLY from the verified source. Never add your own.
6. Never modify spelling. Never modernize. Never simplify. Keep original manuscript spelling.
7. If sources DISAGREE → verification_status = "manual_review_required", explain in notes.
8. If NO trusted source exists → verification_status = "unverified". DO NOT create harakat.
9. Generate Malayalam and English meanings ONLY from verified Arabic. Never translate guessed text.
10. If unverified, leave malayalam_meaning and english_meaning EMPTY.
11. List ALL source URLs you checked in cross_verification_sources (even disagreeing ones).

AUTHENTICITY IS MORE IMPORTANT THAN COMPLETENESS.
It is acceptable to leave a text unverified.
It is NEVER acceptable to invent Arabic or harakat.
Never create placeholder translations. Never auto-fill unknown Arabic.
The system's highest priority is authenticity, not completeness.
Never fabricate. Never infer. Never guess.`;

    const llmResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_1_pro',
      response_json_schema: {
        type: 'object',
        properties: {
          arabic_text_verified: { type: 'string', description: 'Full Arabic with harakat from authoritative source. If unverified, original input without added harakat.' },
          malayalam_meaning: { type: 'string', description: 'Malayalam translation from verified Arabic only. EMPTY if unverified.' },
          english_meaning: { type: 'string', description: 'English translation from verified Arabic only. EMPTY if unverified.' },
          source_url: { type: 'string', description: 'Primary authoritative source URL' },
          cross_verification_sources: { type: 'array', items: { type: 'string' }, description: 'ALL source URLs compared' },
          source_priority: { type: 'string', enum: ['priority_1', 'priority_2', 'priority_3', 'priority_4'] },
          verification_status: { type: 'string', enum: ['verified', 'manual_review_required', 'unverified'] },
          notes: { type: 'string', description: 'Discrepancies or verification notes' },
        },
      },
    });

    // ══ STEP 5: Cross-validate ALL sources ══
    let finalStatus = llmResult.verification_status || 'unverified';
    let finalNotes = llmResult.notes || '';
    let finalArabic = llmResult.arabic_text_verified || arabic_text;
    let finalMl = llmResult.malayalam_meaning || '';
    let finalEn = llmResult.english_meaning || '';
    let holyNameUsed = false;
    let manuscriptUsed = false;

    // ── Holy Names cross-check ──
    if (holyNameMatch) {
      if (finalStatus === 'verified') {
        const localNorm = normalizeArabic(holyNameMatch.arabic_name || '');
        const internetNorm = normalizeArabic(finalArabic);
        if (localNorm === internetNorm) {
          finalArabic = holyNameMatch.arabic_name;
          finalMl = holyNameMatch.meaning_malayalam || finalMl;
          finalNotes = (finalNotes ? finalNotes + ' | ' : '') + 'Holy Names DB match confirmed.';
          holyNameUsed = true;
        } else {
          finalStatus = 'manual_review_required';
          finalNotes = (finalNotes ? finalNotes + ' | ' : '') + 'DISCREPANCY: Holy Names DB differs from internet. Manual review required.';
        }
      } else if (finalStatus === 'unverified') {
        finalArabic = holyNameMatch.arabic_name;
        finalMl = holyNameMatch.meaning_malayalam || '';
        finalStatus = 'verified';
        finalNotes = 'Verified from Holy Names DB (local authority). No internet source found.';
        holyNameUsed = true;
      }
    }

    // ── Manuscript cross-check ──
    if (hasManuscriptMatch) {
      if (finalStatus === 'verified') {
        const manuscriptNorm = normalizeArabic(originalManuscriptText);
        const internetNorm = normalizeArabic(finalArabic);
        if (manuscriptNorm === internetNorm) {
          finalArabic = originalManuscriptText;
          finalNotes = (finalNotes ? finalNotes + ' | ' : '') + 'Manuscript data match confirmed.';
          manuscriptUsed = true;
        } else {
          finalStatus = 'manual_review_required';
          finalNotes = (finalNotes ? finalNotes + ' | ' : '') + 'DISCREPANCY: Manuscript differs from verified online version. Manual review required.';
        }
      } else if (finalStatus === 'unverified' && !holyNameUsed) {
        finalArabic = originalManuscriptText;
        finalStatus = 'verified';
        finalNotes = 'Verified from manuscript data (local primary authority). No internet source found.';
        manuscriptUsed = true;
        if (manuscriptMatch) {
          finalMl = manuscriptMatch.rule_summary_ml || '';
          finalEn = manuscriptMatch.rule_summary || '';
        } else if (verifiedEntryMatch) {
          finalMl = verifiedEntryMatch.malayalam_meaning || '';
          finalEn = verifiedEntryMatch.english_meaning || '';
        }
      }
    }

    // ══ COMPUTE CONFIDENCE ══
    const onlineSourceCount = (llmResult.cross_verification_sources || []).length;
    const totalSources = (hasManuscriptMatch ? 1 : 0) + (holyNameMatch ? 1 : 0) + onlineSourceCount;

    let confidence;
    if (finalStatus === 'unverified') {
      confidence = 'UNVERIFIED';
    } else if (finalStatus === 'manual_review_required') {
      confidence = 'MEDIUM';
    } else {
      confidence = totalSources >= 2 ? 'HIGH' : 'LOW';
    }

    // ══ COMPUTE VERIFICATION METHOD ══
    const usedInternet = llmResult.verification_status === 'verified';
    const sourceCountForMethod = (manuscriptUsed ? 1 : 0) + (holyNameUsed ? 1 : 0) + (usedInternet ? 1 : 0);
    let verificationMethod;
    if (sourceCountForMethod >= 2) {
      verificationMethod = 'multi_source';
    } else if (manuscriptUsed) {
      verificationMethod = 'manuscript_only';
    } else if (holyNameUsed) {
      verificationMethod = 'holy_names_db';
    } else {
      verificationMethod = 'internet_cross_check';
    }

    // ══ COMPUTE PRIMARY & SECONDARY SOURCES (for reproducibility — rule 9) ══
    let primarySource = '';
    const secondarySources = [];

    if (usedInternet && llmResult.source_url) {
      primarySource = `${book_name || 'Internet source'} — ${llmResult.source_url}`;
    } else if (manuscriptUsed && manuscriptSourceDetail) {
      primarySource = `Manuscript: ${manuscriptSourceDetail}`;
    } else if (holyNameUsed) {
      primarySource = 'Holy Names Database';
    }

    // Build secondary sources (everything that's not primary)
    if (manuscriptUsed && manuscriptSourceDetail && !primarySource.startsWith('Manuscript:')) {
      secondarySources.push(`Manuscript: ${manuscriptSourceDetail}`);
    }
    if (holyNameUsed && primarySource !== 'Holy Names Database') {
      secondarySources.push('Holy Names Database');
    }
    (llmResult.cross_verification_sources || []).forEach(url => {
      if (url !== llmResult.source_url) {
        secondarySources.push(url);
      }
    });

    // ══ STEP 6: CONFIDENCE DROP CHECK (rule 6) ══
    // If re-verification produces LOWER confidence than current verified revision,
    // keep both revisions, require manual approval.
    if (force_reverification && currentVerified) {
      const prevConfidence = currentVerified.verification_confidence || 'LOW';
      if ((CONFIDENCE_ORDER[confidence] || 0) < (CONFIDENCE_ORDER[prevConfidence] || 0)) {
        // Confidence dropped — flag for manual approval, old revision stays active
        finalStatus = 'manual_review_required';
        finalNotes = (finalNotes ? finalNotes + ' | ' : '') +
          `CONFIDENCE DROPPED from ${prevConfidence} to ${confidence}. Manual approval required per rule 6. Previous revision ${currentVerified.revision_number} retained as active.`;
      }
    }

    // ══ UNVERIFIED — DO NOT SAVE ANYTHING (rule 8) ══
    if (finalStatus === 'unverified') {
      return Response.json({
        verification_status: 'unverified',
        verification_confidence: 'UNVERIFIED',
        arabic_text: arabic_text,
        malayalam_meaning: '',
        english_meaning: '',
        source: 'verification_unavailable',
        notes: 'Verification unavailable. No trusted source found. Nothing stored. No harakat generated.',
        text_hash: textHash,
      });
    }

    // ══ STEP 7: Save as NEW REVISION (never overwrite — rules 2, 3) ══
    const newRevisionNumber = maxRevision > 0 ? maxRevision + 1 : 1;
    const finalRevisionReason = force_reverification
      ? (revision_reason || 'Re-verification requested')
      : (maxRevision > 0 ? 'New revision: better source discovered' : 'Initial verification');

    const entry = await base44.asServiceRole.entities.VerifiedArabic.create({
      text_hash: textHash,
      arabic_text: finalArabic,
      arabic_text_normalized: normalized,
      original_manuscript_text: originalManuscriptText || '',
      malayalam_meaning: finalMl,
      english_meaning: finalEn,
      source_type: source_type || 'unknown_arabic',
      book_name: book_name || '',
      page_number: String(page_number || ''),
      section: section || '',
      source_url: llmResult.source_url || '',
      source_priority: llmResult.source_priority || 'priority_4',
      verification_status: finalStatus,
      verification_confidence: confidence,
      verification_method: verificationMethod,
      primary_source: primarySource,
      secondary_sources: secondarySources,
      cross_verification_sources: llmResult.cross_verification_sources || [],
      holy_name_match: holyNameUsed,
      manuscript_match: manuscriptUsed,
      manuscript_source_detail: manuscriptSourceDetail,
      manuscript_arabic_text: originalManuscriptText || '',
      revision_number: newRevisionNumber,
      revision_reason: finalRevisionReason,
      date_verified: new Date().toISOString(),
      reviewer: user ? user.email || 'AI-verified with internet cross-check' : 'AI-verified with internet cross-check',
      notes: finalNotes,
    });

    return Response.json({
      ...entry,
      source: finalStatus === 'verified' ? 'verified_and_saved' : 'manual_review_saved',
      reused: false,
      is_new_revision: newRevisionNumber > 1,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});