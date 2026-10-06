// ═══════════════════════════════════════════════════════════════
// SIRR TURKISH GUARD — GLOBAL LANGUAGE RULE ENFORCEMENT
// ═══════════════════════════════════════════════════════════════
// Enforces the SIRR page language rule:
//   - Book titles/references: remain in original language (TR/AR/EN)
//   - All user-visible content: follows selected UI language (ML/EN/AR)
//   - Turkish NEVER appears in content fields
//   - Arabic manuscripts, talismans, harakat, Quranic text: untouched
//
// ══ GLOBAL MEANING PRESERVATION RULE — SIRR PAGE (FINAL — PERMANENT) ══
// Meaning preservation is ALWAYS more important than removing Turkish.
// Never sacrifice accuracy for translation. This rule is GLOBAL and PERMANENT.
//
// 1. NEVER guess. Never invent. Never approximate. Never hallucinate.
// 2. Research exact meaning using PRIORITY ORDER:
//    P1: TDK/authoritative Turkish dictionaries.
//    P2: Botanical/scientific/pharmacological/mineralogical references (plants/herbs/incense/minerals/animals).
//    P3: Classical Islamic/Ottoman/Arabic manuscript references.
//    P4: Standard English scholarly equivalent.
//    P5: Standard Malayalam equivalent.
// 3. Confidence: HIGH=verified by authoritative sources. MEDIUM=multiple sources agree. LOW=conflict/uncertainty.
//    LOW confidence items MUST remain unchanged.
// 4. If verified English meaning exists → use it → create natural Malayalam from English.
// 5. If official Malayalam name exists → use it (do NOT literal-translate).
// 6. If no Malayalam but English exists → keep English + Malayalam explanation → remove Turkish.
// 7. If meaning cannot be verified (LOW confidence) → DO NOT translate, DO NOT remove, keep Turkish, mark "Meaning Not Verified".
// 8. PRESERVE EXACTLY: book titles, author names, manuscript names, proper nouns, Arabic text, Quranic text,
//    talismans, harakat, Abjad letters, magic squares, Vefk diagrams, Arabic transliterations, historical references.
// 9. Scientific terms (plants/herbs/incense/minerals/animals/ritual materials): research until exact identification.
//    If official Malayalam exists → use it. Otherwise → English name + Malayalam explanation.
// 10. FINAL SAFETY RULE: If ANY doubt → KEEP ORIGINAL TURKISH. Accuracy > language cleanup.
//
// UI GUARD FALLBACK: If a field still contains Turkish (meaning not verified),
// show the original text rather than hiding it. Content IS in the manuscript.
// ═══════════════════════════════════════════════════════════════

// Turkish-specific characters (not found in English, Malayalam, or Arabic)
const TURKISH_CHARS = /[çşğğıİöüÇŞĞĞ]/;

// Turkish function/content words. "ve" is included but does NOT trigger
// alone (it is Arabic/Persian "and" و, used in all Islamic transliterations).
const TURKISH_WORDS = [
  // Function words
  've', 'ile', 'bir', 'bu', 'şu', 'için', 'gibi', 'kadar', 'ancak',
  'veya', 'sonra', 'önce', 'değil', 'vardır', 'yoktur', 'olarak',
  'üzere', 'rağmen', 'dolayı', 'nedeniyle', 'tarafından', 'maksadıyla',
  'gayesiyle', 'amacıyla', 'cihetle', 'itibaren', 'bahisle', 'dair',
  'edilir', 'yapılır', 'alınır', 'yazılır', 'okunur', 'söylenir',
  'denenmiştir', 'bildirilmiştir', 'belirtilmiştir', 'anlatılmıştır',
  'açıklanmıştır', 'nakledilmiştir', 'rivayet', 'methal', 'beyan',
  // Common verbs / postpositions (manuscript instruction language)
  'eder', 'olur', 'yapar', 'gelir', 'verir', 'alır', 'koyar', 'yazar',
  'okur', 'söyler', 'yakar', 'yakarsın', 'yazıp', 'okuyup', 'yakıp',
  'konur', 'gerekir', 'üzerine', 'içine', 'altına', 'üstüne', 'şekilde',
  'biçimde', 'halde', 'lazım'
];

// Word boundary that treats Turkish letters as word characters.
// JavaScript's \b only works with ASCII, so "önce" and "üzere" (starting
// with non-ASCII) are never matched by \bönce\b. This custom boundary
// includes Turkish letters as word characters.
const WORD_CHARS = 'a-z0-9_ığüşçöıİĞÜŞÇÖ';

// Check if text contains Turkish
// RULE: "ve" alone does NOT trigger — it is Arabic/Persian "and" (و),
// universally used in transliterated Islamic terms like "Celb ve İrsal"
// (جلب و ارسال). Only non-"ve" words or 2+ words = Turkish.
export function hasTurkish(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (t.length === 0) return false;

  const lowerT = t.toLowerCase();

  let matchCount = 0;
  let hasNonVe = false;
  for (const word of TURKISH_WORDS) {
    const regex = new RegExp(`(?:^|[^${WORD_CHARS}])${word}(?:[^${WORD_CHARS}]|$)`, 'gi');
    if (regex.test(lowerT)) {
      matchCount++;
      if (word !== 've') hasNonVe = true;
    }
  }

  // Any non-"ve" Turkish word = Turkish
  if (hasNonVe) return true;
  // 2+ Turkish words = Turkish
  if (matchCount >= 2) return true;
  // "ve" alone = Arabic "and", NOT Turkish
  return false;
}

// Book reference fields — NEVER filtered, always shown in original language
const BOOK_REFERENCE_FIELDS = new Set([
  'book_title', 'book_title_ar', 'book_name', 'book_name_ar',
  'source_scholar', 'author', 'edition', 'publication_year'
]);

export function isBookReferenceField(fieldName) {
  return BOOK_REFERENCE_FIELDS.has(fieldName);
}

// Arabic text fields — NEVER filtered, always shown as-is
const ARABIC_TEXT_FIELDS = new Set([
  'arabic_text', 'verified_arabic', 'topic_ar', 'book_title_ar', 'book_name_ar'
]);

// Malayalam Unicode range checker
const MALAYALAM_RANGE = /[\u0D00-\u0D7F]/;

// ═══════════════════════════════════════════════════════════════
// getLanguageContent — returns the correct language value for a field
// ═══════════════════════════════════════════════════════════════
// Returns: string (the value) or null (show "Not specified")
//
// Priority for Malayalam (ml):
//   1. method[field_ml]           — dedicated _ml field (topic_ml, purpose_ml)
//   2. method.content_translations_ml[field]  — JSON translations for fields without _ml
//   3. method[field]              — if already Malayalam (not Turkish)
//
// Priority for English (en):
//   1. method[field]              — if not Turkish
//   2. method[field_en]           — fallback _en variant
//
// Priority for Arabic (ar):
//   1. method[field_ar]           — dedicated _ar field
//   2. method.arabic_text         — for the arabic_text field
// ═══════════════════════════════════════════════════════════════
export function getLanguageContent(method, field, language) {
  if (!method) return null;

  // Book reference fields: always return as-is (original language preserved)
  if (isBookReferenceField(field)) {
    return method[field] || null;
  }

  // Arabic text fields: always return as-is (never filtered)
  if (ARABIC_TEXT_FIELDS.has(field)) {
    return method[field] || null;
  }

  const isMl = language === 'ml';
  const isAr = language === 'ar';

  // ── Malayalam mode: 100% Malayalam, no English, no Turkish ──
  if (isMl) {
    // 1. Dedicated _ml field (topic_ml, purpose_ml)
    const mlField = method[`${field}_ml`];
    if (mlField && !hasTurkish(mlField) && MALAYALAM_RANGE.test(mlField)) {
      return mlField;
    }

    // 2. content_translations_ml JSON (for fields without _ml variants)
    const translationsMl = method.content_translations_ml;
    if (translationsMl && typeof translationsMl === 'object') {
      const mlTranslation = translationsMl[field];
      if (mlTranslation && !hasTurkish(mlTranslation) && MALAYALAM_RANGE.test(mlTranslation)) {
        return mlTranslation;
      }
    }

    // 3. malayalam_meaning special case
    if (field === 'malayalam_meaning' || field === 'meaning') {
      const mm = method.malayalam_meaning;
      if (mm && !hasTurkish(mm) && MALAYALAM_RANGE.test(mm)) return mm;
    }

    // 4. Original field if already Malayalam (not Turkish)
    const original = method[field];
    if (original && !hasTurkish(original) && MALAYALAM_RANGE.test(original)) {
      return original;
    }

    // GLOBAL MEANING PRESERVATION RULE:
    // If no verified Malayalam translation exists, show the original text (even if Turkish)
    // rather than hiding it. Showing the original is better than showing "Not specified".
    if (original && original.trim().length > 0) {
      return original;
    }
    return null;
  }

  // ── Arabic mode: 100% Arabic where available ──
  if (isAr) {
    const arField = method[`${field}_ar`];
    if (arField && !hasTurkish(arField)) return arField;

    if (field === 'arabic_text') return method[field] || null;

    // For content fields, check if original is Arabic script
    const original = method[field];
    if (original && /[\u0600-\u06FF]/.test(original) && !hasTurkish(original)) {
      return original;
    }

    return null;
  }

  // ── English mode (default): show English, never Turkish ──
  // GLOBAL MEANING PRESERVATION RULE: If no verified English translation exists,
  // show the original text (even if Turkish) — meaning preservation > Turkish removal.
  const original = method[field];
  if (original && !hasTurkish(original)) {
    return original;
  }

  // Fallback to _en variant
  const enField = method[`${field}_en`];
  if (enField && !hasTurkish(enField)) {
    return enField;
  }

  // LAST RESORT: Show original text (may contain Turkish) if no verified translation exists.
  // This is better than showing "Not specified" — the content IS in the manuscript.
  if (original && original.trim().length > 0) {
    return original;
  }

  return null;
}

// Count Turkish fields in a method (for audit)
export function getTurkishFieldCount(method) {
  if (!method) return 0;
  const contentFields = [
    'topic', 'topic_ml', 'purpose', 'purpose_ml',
    'introduction', 'conditions', 'materials', 'preparation',
    'procedure', 'timing', 'planet', 'day', 'incense',
    'repetition', 'warnings', 'benefits', 'notes',
    'malayalam_meaning', 'english_meaning'
  ];
  let count = 0;
  for (const field of contentFields) {
    if (hasTurkish(method[field])) count++;
  }
  return count;
}