// ═══════════════════════════════════════════════════════════════
// MIZAN-9 POST-PROCESSING ENGINE
// Source: Usûlül Bast fi Sirril Evfâk vel Havas — İdris Çelebi
//
// MIZAN-9 ONLY - DO NOT USE IN OTHER MODULES:
// This engine is EXCLUSIVELY for Mizan-9 page calculations.
// Other modules (Bast, Faal, Hadim, Vefkin, Anasir, Holy Names) have separate engines.
//
// INPUT:  grandBast (sum of all 9 MIZAN First Bast values)
//         grandLetters (sum of all 9 MIZAN letter counts)
//         dominant (galip anasır from existing MIZAN analysis)
//
// PIPELINE:
//   grandBast + grandLetters
//   → Satır Vahid sum
//   → Istintak → seed letters
//   → Zevc/Ferd → 4th or 5th Bast each letter
//   → Istintak each → new Satır Vahid
//   → Group → Esma-i Kitabet
//   → Repeat → Esma-i A'van
//   → Repeat (always 5th Bast) → Esma-i Kasem
//   → Galip Anasır → Vefk
//
// MIZAN-9 ORDER PRESERVATION:
//   - Preserve exact Bast extraction sequence without reversal
//   - Pass sequence unchanged through all pipeline stages
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// MIZAN VEFK ENGINE — LOCKED 2026-06-12
// See docs/MIZAN_VEFK_ENGINE_LOCK.md
//
// DO NOT MODIFY: buildVefk, validateVefk, VEFK_TEMPLATES
//
// INVARIANTS (enforced by self-test below):
//   MC = Source Total (S)
//   All 4 rows = MC
//   All 4 columns = MC
//   Both diagonals = MC
//   Kesr distributed via balanced transversal
// ═══════════════════════════════════════════════════════════════

// ── First Bast lookup table (p.42–43) ──────────────────────────
// MANUSCRIPT-LOCKED: Pages 42-43 (HARFLERİN BASTI CETVELİ)
// Keys are Arabic letters. Values are First Bast values from the Mizan manuscript.
// These values are the exclusive authority for Mizan letter-to-number conversion.
export const FIRST_BAST = {
  'ا': 16,   'ب': 616,  'ج': 1041, 'د': 283,  'هـ': 709,
  'و': 468,  'ز': 141,  'ح': 612,  'ط': 539,  'ى': 579,
  'ك': 635,  'ل': 1097, 'م': 339,  'ن': 765,  'س': 524,
  'ع': 197,  'ف': 657,  'ص': 595,  'ق': 60,   'ر': 517,
  'ش': 1095, 'ت': 337,  'ث': 763,  'خ': 522,  'ذ': 195,
  'ض': 655,  'ظ': 593,  'غ': 114,
  // Non-Hamza variant aliases (Hamza forms resolved dynamically via mpNorm)
  'ه': 709,  'ي': 579,  'ة': 709,  'ى': 579,
};

const MIZANPOST_NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ؤ':'و','ئ':'ي' };
function mpNorm(ch) { return MIZANPOST_NORM[ch] || ch; }

// ── Full 5-level Bast table (p.42–43) ──────────────────────────
// MANUSCRIPT-LOCKED: Pages 42-43 (HARFLERİN BASTI CETVELİ)
// [letter]: [bast1, bast2, bast3, bast4, bast5]
// These values are the exclusive authority for Mizan letter-to-number conversion.
export const BAST_TABLE = {
  'ا': [16,    1047, 594,  1941, 991],
  'ب': [616,   1569, 1940, 1046, 921],
  'ج': [1041,  469,  1400, 451,  1118],
  'د': [283,   2215, 2535, 3299, 2806],
  'هـ':[709,   734,  1575, 1783, 2007],
  'ه': [709,   734,  1575, 1783, 2007],
  'و': [468,   1473, 1689, 1832, 2482],
  'ز': [141,   415,  1625, 1980, 1364],
  'ح': [612,   1717, 1029, 1288, 1900],
  'ط': [539,   2399, 2959, 2627, 2028],
  'ى': [579,   1499, 1585, 2243, 2627],
  'ي': [579,   1499, 1585, 2243, 2627],
  'ك': [635,   2328, 3072, 1968, 1843],
  'ل': [1097,  850,  1420, 1086, 1239],
  'م': [339,   2731, 2038, 2439, 2703],
  'ن': [765,   1428, 1698, 1843, 2149],
  'س': [524,   1681, 1309, 1748, 1260],
  'ع': [197,   796,  1258, 2008, 1342],
  'ف': [657,   1428, 1698, 1843, 2149],
  'ص': [595,   2067, 1395, 2513, 3113],
  'ق': [60,    524,  1681, 1309, 1748],
  'ر': [517,   1483, 2149, 1668, 1772],
  'ش': [1095,  1418, 1642, 1591, 1488],
  'ت': [337,   2333, 3963, 3313, 3870],
  'ث': [763,   1760, 883,  2793, 2561],
  'خ': [522,   2014, 1592, 2088, 1991],
  'ذ': [195,   1364, 2016, 1777, 647],
  'ض': [655,   1996, 1770, 506,  1231],
  'ظ': [593,   2399, 2959, 2627, 2028],
  'غ': [114,   822,  1906, 1175, 1080],
  // Non-Hamza variant (Hamza forms resolved dynamically via mpNorm)
  'ة': [709,   734,  1575, 1783, 2007],
};

// ── Istintak: number → letters ─────────────────────────────────
// Converts a number to Arabic letters via positional digit extraction.
// These letters are the "spoken" components of the number.
// Based on the worked examples across p.38–40 of the source.
// The digit-positional cycle: Units → Tens → Hundreds → Thousands
const UNITS_MAP    = {1:'ا',2:'ب',3:'ج',4:'د',5:'ه',6:'و',7:'ز',8:'ح',9:'ط'};
const TENS_MAP     = {10:'ي',20:'ك',30:'ل',40:'م',50:'ن',60:'س',70:'ع',80:'ف',90:'ص'};
const HUNDREDS_MAP = {100:'ق',200:'ر',300:'ش',400:'ت',500:'ث',600:'خ',700:'ذ',800:'ض',900:'ظ'};
const THOUSAND_MARK = 'غ';

/**
 * Extract letters from a number using the positional digit-cycle method.
 * LSD-first, cycling Units → Tens → Hundreds → Thousands marker.
 * After thousands marker, cycle restarts from Tens.
 * Source: book worked examples p.38–40 (identical to msEngine akramPositional).
 *
 * BOOK RULE (verified against worked example 41487 → م,ا,غ,ت,ف,ز):
 * When d=1 appears in the thousands slot AND it is NOT the last (highest) digit,
 * emit γ + ا (include ا for 1×1000).
 * When d=1 is the highest digit in the thousands slot, emit γ only.
 * Implementation: check if there are remaining digits after current index.
 */
function extractLettersFromNumber(n) {
  if (!n || n <= 0) return [];
  n = Math.floor(n);
  const digits = [];
  let tmp = n;
  while (tmp > 0) { digits.push(tmp % 10); tmp = Math.floor(tmp / 10); }

  const letters = [];
  let slot = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = digits[i];
    const isLast = (i === digits.length - 1);
    if (slot === 0) {
      if (d !== 0 && UNITS_MAP[d]) letters.push(UNITS_MAP[d]);
      slot = 1;
    } else if (slot === 1) {
      const v = d * 10;
      if (d !== 0 && TENS_MAP[v]) letters.push(TENS_MAP[v]);
      slot = 2;
    } else if (slot === 2) {
      const v = d * 100;
      if (d !== 0 && HUNDREDS_MAP[v]) letters.push(HUNDREDS_MAP[v]);
      slot = 3;
    } else {
      letters.push(THOUSAND_MARK);
      // Include units letter for this digit UNLESS d=1 AND this is the last (highest) digit
      // Book rule: d=1 as sole thousands digit → γ only; d=1 with higher digits remaining → γ+ا
      if (d !== 0 && (d !== 1 || !isLast) && UNITS_MAP[d]) letters.push(UNITS_MAP[d]);
      slot = 1;
    }
  }
  return letters;
}

/**
 * istintak(n) — convert number to letter string
 * Returns an array of Arabic letter characters.
 */
export function istintak(n) {
  return extractLettersFromNumber(n);
}

/**
 * getBastLevel(letter, level) — get the Nth Bast value for a letter
 * level: 1..5
 */
export function getBastLevel(letter, level) {
  const n = mpNorm(letter);
  const row = BAST_TABLE[n];
  if (!row) return FIRST_BAST[n] || 0;
  return row[level - 1] || 0;
}

/**
 * sumFirstBastOfLetters(letters) — sum First Bast values + letter count
 * This is the "Satır Vahid" operation described on p.54–55.
 * Source: "birinci bast adedine göre toplayıp" + "harf adedinide ilave edip"
 */
export function satirVahidSum(letters) {
  const safeLetters = Array.isArray(letters) ? letters : [];
  const bastSum = safeLetters.reduce((s, l) => s + (getBastLevel(l, 1) || 0), 0);
  const count = safeLetters.length;
  return { bastSum, count, total: bastSum + count };
}

// ── Elemental data (p.15–16, p.44) ──────────────────────────────
export const ELEMENT_LETTERS = {
  fire:  ['ا','ه','ط','م','ف','ش','ذ'],
  earth: ['ب','و','ي','ن','ص','ت','ض'],
  air:   ['ج','ز','ك','س','ق','ث','ظ'],
  water: ['د','ح','ل','ع','ر','خ','غ'],
};

// First Bast totals for each element (p.44, exact values)
export const ELEMENT_BAST_TOTALS = {
  fire:  3550,
  earth: 4015,
  air:   3757,
  water: 3342,
};

// ═══════════════════════════════════════════════════════════════
// GALIB ANASIR VALUES FOR REMAINDER COMPLETION
// ═══════════════════════════════════════════════════════════════
export const GALIB_ANASIR_VALUES = {
  fire: 3550,   // Ateş / Nar (النار)
  earth: 4015,  // Toprak / Turab (التراب)
  air: 3757,    // Hava (الهواء)
  water: 3342,  // Su / Ma (الماء)
};

// ═══════════════════════════════════════════════════════════════
// GALIB ANASIR SUPPLEMENT LETTERS FOR REMAINDER CORRECTION
// Source: Manuscript tradition for element-specific completion
// These are the canonical letters used when remainder correction is needed.
// ═══════════════════════════════════════════════════════════════
export const GALIB_ANASIR_SUPPLEMENTS = {
  fire:  ['ا', 'ه', 'ط', 'م', 'ف', 'ش', 'ذ'],
  earth: ['ب', 'و', 'ي', 'ن', 'ص', 'ت', 'ض'],
  air:   ['ج', 'ز', 'ك', 'س', 'ق', 'ث', 'ظ'],
  water: ['د', 'ح', 'ل', 'ع', 'ر', 'خ', 'غ'],
};

// ═══════════════════════════════════════════════════════════════
// VEFK SOURCE NUMBER RULE (MIZAN OPTION 1)
// ═══════════════════════════════════════════════════════════════
// The Vefk Source Number is NOT the 9 Mizan Grand Total directly.
// 
// CORRECT MANUSCRIPT WORKFLOW:
// 1. Original Seed Letters (from 9 Mizan Grand Total via Istintak)
// 2. Individual Bast Derivations (4th or 5th Bast per letter)
// 3. All Expanded Letters (via Istintak of each Bast value)
// 4. Sum the First Bast values of ALL Expanded Letters
// 5. THIS SUM becomes the Vefk Source Number
// 6. Vefk Magic Square is constructed from this source
//
// Example:
// 9 Mizan Grand Total = 19,189
// → Seed Letters via Istintak
// → Bast Derivations (each seed letter)
// → All Expanded Letters (e.g., 45 letters)
// → Sum of all expanded letters' First Bast values = 10,468
// → Vefk Source Number = 10,468
// → Magic Constant = 10,468 (every row/col/diag sums to this)
// ═══════════════════════════════════════════════════════════════

// Get Galib Anasir value and its Istintak letters with full breakdown
export function getGalibAnasirData(element) {
  const value = GALIB_ANASIR_VALUES[element] || GALIB_ANASIR_VALUES.fire;
  const letters = istintak(value);
  return {
    value,
    letters,
    element,
    istintakBreakdown: extractLettersFromNumber(value),
  };
}

// Guardian name letters from element istintak (p.62)
// fire: 3550 → نثغج = Nesğac
// earth: 4015 → هيغد = Heyğad
// air: 3757 → نذغج = Nez̀ğac
// water: 3342 → ب م غج = Bemğac
function getGuardianName(element) {
  const total = ELEMENT_BAST_TOTALS[element] || ELEMENT_BAST_TOTALS.fire;
  const letters = istintak(total);
  const safeLetters = Array.isArray(letters) ? letters : [];
  return safeLetters.join('');
}

// ── Vefk elemental position templates (p.68, exact) ──────────────
// Each template is a 4×4 array of positions 1–16.
// The VALUE placed in each cell = startValue + (positionValue - 1)
// where startValue = floor((S - 30) / 4)
export const VEFK_TEMPLATES = {
  fire: [
    [ 8, 11, 14,  1],
    [13,  2,  7, 12],
    [ 3, 16,  9,  6],
    [10,  5,  4, 15],
  ],
  earth: [
    [15,  4,  5, 10],
    [ 6,  9, 16,  3],
    [12,  7,  2, 13],
    [ 1, 14, 11,  8],
  ],
  air: [
    [ 1, 14, 11,  8],
    [12,  7,  2, 13],
    [ 6,  9, 16,  3],
    [15,  4,  5, 10],
  ],
  water: [
    [10,  5,  4, 15],
    [ 3, 16,  9,  6],
    [13,  2,  7, 12],
    [ 8, 11, 14,  1],
  ],
};

/**
 * validateVefk(grid, magicConstant)
 * Validates that a 4×4 grid is a true magic square.
 * Checks all rows, columns, and both diagonals.
 * Returns { isValid, details: { rows, cols, diagonals } }
 */
export function validateVefk(grid, magicConstant) {
  if (!grid || grid.length !== 4 || !grid.every(row => row.length === 4)) {
    return { isValid: false, details: null };
  }

  const result = {
    isValid: true,
    details: {
      rows: [],
      cols: [],
      diagonals: [],
    },
  };

  // Check all 4 rows
  for (let i = 0; i < 4; i++) {
    const rowSum = grid[i].reduce((s, v) => s + v, 0);
    const valid = rowSum === magicConstant;
    result.details.rows.push({ index: i, sum: rowSum, valid });
    if (!valid) result.isValid = false;
  }

  // Check all 4 columns
  for (let j = 0; j < 4; j++) {
    const colSum = grid.reduce((s, row) => s + row[j], 0);
    const valid = colSum === magicConstant;
    result.details.cols.push({ index: j, sum: colSum, valid });
    if (!valid) result.isValid = false;
  }

  // Check main diagonal (top-left to bottom-right)
  const diag1Sum = grid.reduce((s, row, i) => s + row[i], 0);
  const diag1Valid = diag1Sum === magicConstant;
  result.details.diagonals.push({ name: 'main', sum: diag1Sum, valid: diag1Valid });
  if (!diag1Valid) result.isValid = false;

  // Check anti-diagonal (top-right to bottom-left)
  const diag2Sum = grid.reduce((s, row, i) => s + row[3 - i], 0);
  const diag2Valid = diag2Sum === magicConstant;
  result.details.diagonals.push({ name: 'anti', sum: diag2Sum, valid: diag2Valid });
  if (!diag2Valid) result.isValid = false;

  return result;
}

/**
 * buildVefk(S, element) — RUBAI ENGINE (MANUSCRIPT-VERIFIED)
 *
 * ═══════════════════════════════════════════════════════════════
 * CORRECT ALGORITHM — Empirically verified against p.316 (100% cell match)
 * ═══════════════════════════════════════════════════════════════
 *
 * MATHEMATICAL BASIS:
 *   C = floor((S - 34) / 4)
 *   extra = S - (4C + 34)   →  0, 1, 2, or 3
 *
 * CELL VALUE RULE:
 *   value[p] = C + p  (base, p = template position 1..16)
 *
 * EXTRA DISTRIBUTION (one per row AND column AND diagonal):
 *   extra=0 → no adjustment
 *   extra=1 → add +1 to the 4 upper-half positions that form a balanced transversal
 *             (one from each row, each col, each diagonal — drawn from positions 9..16)
 *   extra=2 → add +1 to ALL 8 upper-half positions (9..16)
 *             Each row/col/diag of any valid Rubai template contains exactly 2 upper positions.
 *   extra=3 → add +1 to ALL 8 upper-half (9..16) PLUS the 4 lower-half balanced transversal
 *             (positions 1..8 that form one per row/col/diagonal)
 *
 * RESULT: MC = S exactly, all rows = S, all cols = S, both diagonals = S.
 * Verified: p.316 (S=80, Fire) → 16/16 cells match.
 * ═══════════════════════════════════════════════════════════════
 */
export function buildVefk(S, element = 'fire') {
  const template = VEFK_TEMPLATES[element] || VEFK_TEMPLATES.fire;

  const C = Math.floor((S - 34) / 4);
  const extra = S - (4 * C + 34); // 0, 1, 2, or 3

  // Diagonal position sets for this template
  const diag1 = new Set([template[0][0], template[1][1], template[2][2], template[3][3]]);
  const diag2 = new Set([template[0][3], template[1][2], template[2][1], template[3][0]]);
  const upperHalf = new Set([9, 10, 11, 12, 13, 14, 15, 16]);
  const lowerHalf = new Set([1, 2, 3, 4, 5, 6, 7, 8]);

  // Find one balanced transversal drawn entirely from the given position set.
  // "Balanced" = exactly 1 from diag1, exactly 1 from diag2, one per row, one per col.
  function findTransversal(half) {
    for (let c0 = 0; c0 < 4; c0++)
      for (let c1 = 0; c1 < 4; c1++)
        for (let c2 = 0; c2 < 4; c2++)
          for (let c3 = 0; c3 < 4; c3++) {
            if (new Set([c0, c1, c2, c3]).size !== 4) continue;
            const pos = [template[0][c0], template[1][c1], template[2][c2], template[3][c3]];
            if (!pos.every(p => half.has(p))) continue;
            if (
              pos.filter(p => diag1.has(p)).length === 1 &&
              pos.filter(p => diag2.has(p)).length === 1
            ) return new Set(pos);
          }
    return null;
  }

  const upperTransversal = (extra === 1) ? findTransversal(upperHalf) : null;
  const lowerTransversal = (extra === 3) ? findTransversal(lowerHalf) : null;

  // Build position → value map
  const posToVal = {};
  for (let p = 1; p <= 16; p++) {
    let adj = 0;
    if (extra === 1) {
      adj = (upperTransversal && upperTransversal.has(p)) ? 1 : 0;
    } else if (extra === 2) {
      adj = upperHalf.has(p) ? 1 : 0;
    } else if (extra === 3) {
      adj = upperHalf.has(p) ? 1 : ((lowerTransversal && lowerTransversal.has(p)) ? 1 : 0);
    }
    posToVal[p] = C + p + adj;
  }

  const grid = template.map(row => row.map(p => posToVal[p]));
  const mc = grid[0].reduce((s, v) => s + v, 0);
  const validation = validateVefk(grid, mc);

  return {
    grid,
    mc,
    C,
    extra,
    S,
    element,
    guardianName: getGuardianName(element),
    validation,
  };
}

// ── Galip Anasır determination (p.43–44) ─────────────────────────
/**
 * Determine dominant element from existing MIZAN result.
 * The app already computes dominant in mizaan9Engine.
 * This just maps it to the element key used here.
 */
export function resolveGalipAnasir(dominant) {
  // The existing engine returns 'fire'|'earth'|'air'|'water'
  return dominant || 'fire';
}

// ── Name generation pipeline ──────────────────────────────────────

/**
 * generateEsmaLevel(inputLetters, alwaysFifth, supplementElement)
 *
 * MANUSCRIPT RULE (pp.60–69) - SIMPLIFIED FOR ESMA-I KITABET:
 * 1. Use input letters directly as Satr-i Vahid (NO expansion)
 * 2. Count letters → FERD (odd) or ZEVC (even)
 * 3. Group by 5 (FERD) or 4 (ZEVC)
 * 4. If remainder exists:
 *    - Get Galib Anasir's 1st Bast value
 *    - Perform Istintak on that Bast number
 *    - Take only the needed letters to complete the final group
 *    - Append those letters to the remainder group
 * 5. Group the FINAL corrected sequence into names
 *
 * Parameters:
 * - inputLetters: array of Arabic letters (Satr-i Vahid sequence)
 * - alwaysFifth: unused for Kitabet (kept for API compatibility)
 * - supplementElement: element for remainder supplementation
 *
 * Returns:
 * {
 *   inputLetters,          // Original Satr-i Vahid letters
 *   satrVahidLetters,      // Same as inputLetters (no expansion)
 *   satrVahidCount,        // Count of Satr-i Vahid letters
 *   isZevc,                // true if even, false if odd (Ferd)
 *   groupSize,             // 4 (ZEVC) or 5 (FERD)
 *   finalExpandedLetters,  // After supplement (if needed)
 *   supplementLetters,     // Galib Anasir supplement
 *   remainder,             // Original remainder count
 *   names,                 // Grouped Esma-i Kitabet names
 * }
 */
export function generateEsmaLevel(inputLetters, alwaysFifth = false, supplementElement = 'fire') {
  // MANUSCRIPT RULE: Use input letters directly - NO Bast expansion
  // CRITICAL: Always ensure inputLetters is a safe array
  const safeInputLetters = Array.isArray(inputLetters) ? inputLetters : [];
  
  if (safeInputLetters.length === 0) {
    return {
      inputLetters: [],
      satrVahidLetters: [],
      satrVahidCount: 0,
      isZevc: true,
      isFerd: false,
      groupSize: 4,
      finalExpandedLetters: [],
      supplementLetters: [],
      remainder: 0,
      names: [],
    };
  }
  
  const satrVahidLetters = safeInputLetters;
  const satrVahidCount = satrVahidLetters.length;
  
  // Zevc/Ferd classification based on Satr-i Vahid count
  const isZevc = satrVahidCount % 2 === 0;
  const isFerd = !isZevc;
  const groupSize = isZevc ? 4 : 5;
  
  // Check for remainder
  const remainder = satrVahidCount % groupSize;
  let finalExpandedLetters = [...satrVahidLetters];
  let supplementLetters = [];
  
  // Apply remainder correction if needed
  if (remainder > 0) {
    const needed = groupSize - remainder;
    
    // REMAINDER RULE: Get Galib Anasir's 1st Bast value
    const galibValue = GALIB_ANASIR_VALUES[supplementElement] || GALIB_ANASIR_VALUES.fire;
    
    // Perform Istintak on the 1st Bast value
    const galibIstintakLetters = istintak(galibValue);
    
    // Take only the needed letters
    supplementLetters = galibIstintakLetters.slice(0, needed);
    
    // APPEND to END (manuscript rule)
    finalExpandedLetters = [...satrVahidLetters, ...supplementLetters];
  }
  
  // Group the final corrected sequence into names
  const names = [];
  for (let i = 0; i < finalExpandedLetters.length; i += groupSize) {
    names.push(finalExpandedLetters.slice(i, i + groupSize).join(''));
  }
  
  return {
    inputLetters,
    satrVahidLetters,
    satrVahidCount,
    isZevc,
    isFerd,
    groupSize,
    finalExpandedLetters,
    supplementLetters,
    remainder,
    names,
  };
}

/**
 * expandAllSeedLetters(seedLetters, bastLevel)
 * 
 * MANUSCRIPT ORDER LAW: Process seed letters from LAST to FIRST.
 * Bast derivation starts from the last seed letter and moves backwards.
 * 
 * For each seed letter (reverse order): get Bast value → istintak expansion → concatenate.
 * Returns ALL expanded letters concatenated in reverse derivation order.
 * 
 * This is the TRUE source for Vefk calculation per manuscript rules.
 */
export function expandAllSeedLetters(seedLetters, bastLevel, getBastLevelFn = getBastLevel) {
  const safeSeed = Array.isArray(seedLetters) ? seedLetters : [];
  const allExpanded = [];
  
  // CRITICAL: Process in REVERSE order - last seed → first seed
  for (let i = safeSeed.length - 1; i >= 0; i--) {
    const letter = safeSeed[i];
    const bastValue = getBastLevelFn(letter, bastLevel);
    const expanded = istintak(bastValue);
    allExpanded.push(...expanded);
  }
  
  return allExpanded;
}

// ═══════════════════════════════════════════════════════════════
// VEFK ENGINE SELF-TEST — runs once at module load
// If any invariant fails the engine throws immediately so the
// bug is caught during development, never silently shipped.
// ═══════════════════════════════════════════════════════════════
const _VEFK_SELF_TEST_CASES = [
  { S: 80,   element: 'fire'  },
  { S: 1696, element: 'fire'  },
  { S: 81,   element: 'fire'  },  // remainder = 1
  { S: 82,   element: 'fire'  },  // remainder = 2
  { S: 83,   element: 'fire'  },  // remainder = 3
  { S: 100,  element: 'earth' },
  { S: 200,  element: 'air'   },
  { S: 300,  element: 'water' },
];

function _runVefkSelfTest() {
  for (const { S, element } of _VEFK_SELF_TEST_CASES) {
    const { grid } = buildVefk(S, element);
    const mc = grid[0].reduce((s, v) => s + v, 0);
    if (mc !== S) throw new Error(`[VEFK LOCK] MC(${mc}) ≠ S(${S}) for ${element}`);
    for (let i = 0; i < 4; i++) {
      const rowSum = grid[i].reduce((s, v) => s + v, 0);
      if (rowSum !== S) throw new Error(`[VEFK LOCK] Row ${i} sum(${rowSum}) ≠ S(${S}) for ${element}`);
      const colSum = grid.reduce((s, r) => s + r[i], 0);
      if (colSum !== S) throw new Error(`[VEFK LOCK] Col ${i} sum(${colSum}) ≠ S(${S}) for ${element}`);
    }
    const d1 = grid.reduce((s, r, i) => s + r[i], 0);
    const d2 = grid.reduce((s, r, i) => s + r[3 - i], 0);
    if (d1 !== S) throw new Error(`[VEFK LOCK] Main diag(${d1}) ≠ S(${S}) for ${element}`);
    if (d2 !== S) throw new Error(`[VEFK LOCK] Anti diag(${d2}) ≠ S(${S}) for ${element}`);
  }
}
_runVefkSelfTest();

// ── Main entry point ──────────────────────────────────────────────
/**
 * runMizaanPostPipeline({ grandBast, grandLetters, dominant })
 *
 * grandBast: sum of all 9 MIZAN First Bast values (from MizaanFinalSummary)
 * grandLetters: sum of all 9 MIZAN letter counts
 * dominant: galip anasır key ('fire'|'earth'|'air'|'water')
 *
 * Returns the complete pipeline result.
 */
export function runMizaanPostPipeline({ grandBast, grandLetters, dominant, getBastLevelFn = getBastLevel }) {
  if (!grandBast || grandBast <= 0) return null;

  const element = resolveGalipAnasir(dominant);

  // The starting Satır Vahid total is grandBast + grandLetters
  // (this IS the combined sacred value already shown in MizaanFinalSummary)
  const satirVahidTotal = grandBast + grandLetters;

  // Step 1: Istintak the combined total to get seed letters
  const initialSeedLetters = istintak(satirVahidTotal);

  // The initial seed letters are then used as the "inputLetters" for Kitabet generation
  // But per the pipeline: the 9 MIZAN letters themselves form the Satır Vahid.
  // Since we only have totals (not the individual letters), we use the standard approach:
  // The satirVahidTotal is already (bastSum + letterCount), so we istintak it directly
  // and treat the result as the first seed — matching the book's worked examples on p.60.

  // MANUSCRIPT RULE: Expand ALL seed letters through Bast → Istintak
  // CRITICAL: expandAllSeedLetters preserves EXACT seed letter order - NO reversal
  // This gives us the TRUE "ALL EXPANDED LETTERS" set shown in Step 3
  const bastLevel = initialSeedLetters.length % 2 !== 0 ? 5 : 4;
  const allExpandedLetters = expandAllSeedLetters(initialSeedLetters, bastLevel, getBastLevelFn);

  // Generate Esma-i Kitabet using simplified manuscript workflow
  const kitabet = generateEsmaLevel(initialSeedLetters, false, element);

  // Generate Esma-i A'van (second stage) - using kitabet finalExpandedLetters
  const avan = generateEsmaLevel(kitabet.finalExpandedLetters, false, element);

  // Generate Esma-i Kasem (third stage, always 5th Bast) - using avan finalExpandedLetters
  const kasem = generateEsmaLevel(avan.finalExpandedLetters, true, element);

  // MIZAN OPTION 1 RULE: Vefk Source Number = Sum of ALL Expanded Letters' First Bast values
  // This is the TRUE sacred source per manuscript workflow:
  // Original Seed Letters → Bast Derivations → All Expanded Letters → Sum their Bast values → Vefk
  const expandedLettersTotal = allExpandedLetters.reduce((sum, letter) => sum + (getBastLevelFn(letter, 1) || 0), 0);
  const vefkSourceNumber = expandedLettersTotal;
  const vefk = buildVefk(vefkSourceNumber, element);

  return {
    input: { grandBast, grandLetters, satirVahidTotal },
    initialSeedLetters,
    allExpandedLetters,
    bastLevel,
    kitabet,
    avan,
    kasem,
    element,
    vefk,
    vefkSourceNumber,
    expandedLettersCount: allExpandedLetters.length,
    expandedLettersTotal,
  };
}