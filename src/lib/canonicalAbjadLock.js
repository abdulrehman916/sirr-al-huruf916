// ═══════════════════════════════════════════════════════════════
// CANONICAL MANUSCRIPT LOCK - ABJAD PAGE ONLY
// ═══════════════════════════════════════════════════════════════
// IMMUTABLE DATA SOURCE - DO NOT MODIFY
// Source: Manuscript pages 13, 14, 15, 41, 42, 43
// 
// This file contains the CANONICAL AUTHORITY for all Abjad calculations.
// 
// PROTECTION RULES:
// 1. These values are READ-ONLY and must NEVER be modified programmatically
// 2. No AI-generated updates may overwrite these values
// 3. No automatic migrations may overwrite these values
// 4. No synchronization processes may overwrite these values
// 5. Any attempt to modify these values must be blocked and logged
// 6. This lock applies ONLY to the Abjad page
// 7. Other engines (Mizan, Hadim, Vefk, Esma, Faal, Anasir) are NOT affected
// ═══════════════════════════════════════════════════════════════

export const CANONICAL_METADATA = {
  sourcePages: [13, 14, 15, 41, 42, 43],
  locked: true,
  lockDate: "2026-06-12",
  lockType: "CANONICAL_MANUSCRIPT_LOCK",
  scope: "ABJAD_PAGE_ONLY",
  immutable: true,
  note: "Locked to manuscript source pages 13, 14, 15, 41, 42, 43. These values are READ-ONLY REFERENCE DATA. Any modification attempts must be blocked and logged.",
};

// ═══════════════════════════════════════════════════════════════
// 1. EBCEDİ KEBİR (Ebcedi Kebir) - Page 15
// ═══════════════════════════════════════════════════════════════
export const CANONICAL_KEBIR = Object.freeze({
  'ا': 1,
  'ب': 2,
  'ج': 3,
  'د': 4,
  'ه': 5,
  'و': 6,
  'ز': 7,
  'ح': 8,
  'ط': 9,
  'ي': 10,
  'ك': 20,
  'ل': 30,
  'م': 40,
  'ن': 50,
  'س': 60,
  'ع': 70,
  'ف': 80,
  'ص': 90,
  'ق': 100,
  'ر': 200,
  'ش': 300,
  'ت': 400,
  'ث': 500,
  'خ': 600,
  'ذ': 700,
  'ض': 800,
  'ظ': 900,
  'غ': 1000,
});

// ═══════════════════════════════════════════════════════════════
// 2. EBCEDİ SAĞİR (Ebcedi Sağir) - Page 14
// ═══════════════════════════════════════════════════════════════
export const CANONICAL_SAGHIR = Object.freeze({
  'ا': 1,
  'ب': 2,
  'ج': 3,
  'د': 4,
  'ه': 5,
  'و': 6,
  'ز': 7,
  'ح': 8,
  'ط': 9,
  'ي': 10,
  'ك': 8,
  'ل': 6,
  'م': 40,
  'ن': 2,
  'س': 0,   // Sakıt (silent)
  'ع': 10,
  'ف': 8,
  'ص': 6,
  'ق': 4,
  'ر': 8,
  'ش': 0,   // Sakıt (silent)
  'ت': 4,
  'ث': 8,
  'خ': 0,   // Sakıt (silent)
  'ذ': 4,
  'ض': 8,
  'ظ': 0,   // Sakıt (silent)
  'غ': 4,
});

export const CANONICAL_SAKIT_LETTERS = Object.freeze(['س', 'ش', 'خ', 'ظ']);

// ═══════════════════════════════════════════════════════════════
// 3. HARFLERİN BASTI CETVELİ (1st-5th Bast) - Pages 41, 42, 43
// ═══════════════════════════════════════════════════════════════
export const CANONICAL_BAST = Object.freeze({
  'ا': { kebir: 1,   bast1: 16,   bast2: 1047, bast3: 594,  bast4: 1941, bast5: 991 },
  'ب': { kebir: 2,   bast1: 616,  bast2: 1569, bast3: 1940, bast4: 1046, bast5: 921 },
  'ج': { kebir: 3,   bast1: 1041, bast2: 469,  bast3: 1400, bast4: 451,  bast5: 1118 },
  'د': { kebir: 4,   bast1: 283,  bast2: 2215, bast3: 2535, bast4: 3299, bast5: 2806 },
  'ه': { kebir: 5,   bast1: 709,  bast2: 734,  bast3: 1575, bast4: 1783, bast5: 2007 },
  'و': { kebir: 6,   bast1: 468,  bast2: 1473, bast3: 1689, bast4: 1832, bast5: 2482 },
  'ز': { kebir: 7,   bast1: 141,  bast2: 415,  bast3: 1625, bast4: 1980, bast5: 1364 },
  'ح': { kebir: 8,   bast1: 612,  bast2: 1717, bast3: 1029, bast4: 1288, bast5: 1900 },
  'ط': { kebir: 9,   bast1: 539,  bast2: 2399, bast3: 2959, bast4: 2627, bast5: 2028 },
  'ي': { kebir: 10,  bast1: 579,  bast2: 1499, bast3: 1585, bast4: 2243, bast5: 2627 },
  'ك': { kebir: 20,  bast1: 635,  bast2: 2328, bast3: 3072, bast4: 1968, bast5: 1843 },
  'ل': { kebir: 30,  bast1: 1097, bast2: 850,  bast3: 1420, bast4: 1086, bast5: 1239 },
  'م': { kebir: 40,  bast1: 339,  bast2: 2731, bast3: 2038, bast4: 2439, bast5: 2703 },
  'ن': { kebir: 50,  bast1: 765,  bast2: 1428, bast3: 1698, bast4: 1843, bast5: 2149 },
  'س': { kebir: 60,  bast1: 524,  bast2: 1681, bast3: 1309, bast4: 1748, bast5: 1260 },
  'ع': { kebir: 70,  bast1: 197,  bast2: 796,  bast3: 1258, bast4: 2008, bast5: 1342 },
  'ف': { kebir: 80,  bast1: 657,  bast2: 1428, bast3: 1698, bast4: 1843, bast5: 2149 },
  'ص': { kebir: 90,  bast1: 595,  bast2: 2067, bast3: 1395, bast4: 2513, bast5: 3113 },
  'ق': { kebir: 100, bast1: 60,   bast2: 524,  bast3: 1681, bast4: 1309, bast5: 1748 },
  'ر': { kebir: 200, bast1: 517,  bast2: 1483, bast3: 2149, bast4: 1668, bast5: 1772 },
  'ش': { kebir: 300, bast1: 1095, bast2: 1418, bast3: 1642, bast4: 1591, bast5: 1488 },
  'ت': { kebir: 400, bast1: 337,  bast2: 2333, bast3: 3963, bast4: 3313, bast5: 3870 },
  'ث': { kebir: 500, bast1: 763,  bast2: 1760, bast3: 883,  bast4: 2793, bast5: 2561 },
  'خ': { kebir: 600, bast1: 522,  bast2: 2014, bast3: 1592, bast4: 2088, bast5: 1991 },
  'ذ': { kebir: 700, bast1: 195,  bast2: 1364, bast3: 2016, bast4: 1777, bast5: 647 },
  'ض': { kebir: 800, bast1: 655,  bast2: 1996, bast3: 1770, bast4: 506,  bast5: 1231 },
  'ظ': { kebir: 900, bast1: 593,  bast2: 2399, bast3: 2959, bast4: 2627, bast5: 2028 },
  'غ': { kebir: 1000,bast1: 114,  bast2: 822,  bast3: 1906, bast4: 1175, bast5: 1080 },
});

// ═══════════════════════════════════════════════════════════════
// 4. LETTER NAMES (Cümeli Kebir) - Page 15
// ═══════════════════════════════════════════════════════════════
export const CANONICAL_LETTER_NAMES = Object.freeze({
  'ا': 'الف',
  'ب': 'با',
  'ج': 'جيم',
  'د': 'دال',
  'ه': 'ها',
  'و': 'واو',
  'ز': 'زاي',
  'ح': 'حا',
  'ط': 'طا',
  'ي': 'يا',
  'ك': 'كاف',
  'ل': 'لام',
  'م': 'ميم',
  'ن': 'نون',
  'س': 'سين',
  'ع': 'عين',
  'ف': 'فا',
  'ص': 'صاد',
  'ق': 'قاف',
  'ر': 'را',
  'ش': 'شين',
  'ت': 'تا',
  'ث': 'ثا',
  'خ': 'خا',
  'ذ': 'ذال',
  'ض': 'ضاد',
  'ظ': 'ظا',
  'غ': 'غين',
});

// ═══════════════════════════════════════════════════════════════
// PROTECTION FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Validates current values against canonical manuscript values
 * Returns validation report with any mismatches
 */
export function validateCanonicalValues(currentValues) {
  const mismatches = [];
  
  // Validate Kebir
  if (currentValues.kebir) {
    for (const [letter, canonicalValue] of Object.entries(CANONICAL_KEBIR)) {
      if (currentValues.kebir[letter] !== canonicalValue) {
        mismatches.push({
          type: 'KEBIR',
          letter,
          expected: canonicalValue,
          actual: currentValues.kebir[letter],
          severity: 'CRITICAL',
        });
      }
    }
  }
  
  // Validate Saghir
  if (currentValues.saghir) {
    for (const [letter, canonicalValue] of Object.entries(CANONICAL_SAGHIR)) {
      if (currentValues.saghir[letter] !== canonicalValue) {
        mismatches.push({
          type: 'SAGHIR',
          letter,
          expected: canonicalValue,
          actual: currentValues.saghir[letter],
          severity: 'CRITICAL',
        });
      }
    }
  }
  
  // Validate Bast levels
  if (currentValues.bast) {
    for (const [letter, canonicalBast] of Object.entries(CANONICAL_BAST)) {
      const currentBast = currentValues.bast[letter];
      if (currentBast) {
        for (let level = 1; level <= 5; level++) {
          const canonicalValue = canonicalBast[`bast${level}`];
          const currentValue = currentBast[level];
          if (currentValue !== canonicalValue) {
            mismatches.push({
              type: `BAST_${level}`,
              letter,
              expected: canonicalValue,
              actual: currentValue,
              severity: 'CRITICAL',
            });
          }
        }
      }
    }
  }
  
  return {
    valid: mismatches.length === 0,
    mismatches,
    timestamp: new Date().toISOString(),
    canonicalSource: CANONICAL_METADATA.sourcePages,
  };
}

/**
 * Gets canonical value for a specific letter and type
 * Prevents any runtime modifications
 */
export function getCanonicalValue(type, letter, bastLevel = null) {
  switch (type) {
    case 'KEBIR':
      return CANONICAL_KEBIR[letter] || 0;
    case 'SAGHIR':
      return CANONICAL_SAGHIR[letter] !== undefined ? CANONICAL_SAGHIR[letter] : 0;
    case 'BAST':
      if (bastLevel && bastLevel >= 1 && bastLevel <= 5) {
        return CANONICAL_BAST[letter]?.[`bast${bastLevel}`] || 0;
      }
      return CANONICAL_BAST[letter] || null;
    case 'LETTER_NAME':
      return CANONICAL_LETTER_NAMES[letter] || letter;
    default:
      console.warn(`[CANONICAL LOCK] Invalid type requested: ${type}`);
      return null;
  }
}

/**
 * Logs any attempt to modify canonical values
 * This function should be called by any protection layer
 */
export function logModificationAttempt(details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: 'CANONICAL_VIOLATION_ATTEMPT',
    scope: 'ABJAD_PAGE',
    ...details,
  };
  
  // Log to console for development
  console.error('[CANONICAL MANUSCRIPT LOCK] Modification attempt blocked:', logEntry);
  
  // In production, this could send to monitoring service
  // For now, we just log it
  return logEntry;
}

/**
 * Attempts to restore canonical values if corruption detected
 */
export function restoreCanonicalValues() {
  console.warn('[CANONICAL MANUSCRIPT LOCK] Restoration triggered. Values protected by Object.freeze().');
  console.warn('[CANONICAL MANUSCRIPT LOCK] No runtime modifications possible. Manual code review required if mismatches persist.');
  
  return {
    restored: true,
    message: 'Canonical values are immutable (Object.freeze). If mismatches exist, source code was modified - manual review required.',
    canonicalSource: CANONICAL_METADATA.sourcePages,
  };
}

// Freeze all exported objects to prevent runtime modifications
Object.freeze(CANONICAL_METADATA);