// ╔══════════════════════════════════════════════════════════════════════════╗
// ║          SIRR AL-HURUF — CORE ENGINE PROTECTION LAYER                  ║
// ║          Version: 1.0.0  |  Sealed: 2026-06-02                        ║
// ║                                                                         ║
// ║  This file defines the immutable integrity manifest for all calculation ║
// ║  engines. It contains:                                                  ║
// ║    1. PROTECTION_MANIFEST  — sealed registry of every engine            ║
// ║    2. verifyEngineIntegrity() — runtime cross-check function            ║
// ║    3. generateDeploymentReport() — deployment audit report generator    ║
// ║                                                                         ║
// ║  RULES (enforced by this layer):                                        ║
// ║    R1. Each engine is completely independent — no cross-engine imports  ║
// ║    R2. No page may read or modify another page's calculation rules      ║
// ║    R3. No cross-system result sharing unless explicitly designed        ║
// ║    R4. No accidental imports between independent engines                ║
// ║    R5. UI/styling/animation/SW/caching must never modify calc logic     ║
// ║    R6. Changes allowed ONLY when explicitly requested by developer      ║
// ║    R7. Deployment report generated on every audit run                   ║
// ║                                                                         ║
// ║  DO NOT IMPORT this file into any engine or page component.             ║
// ║  This file is AUDIT-ONLY. Zero runtime dependency on any engine.        ║
// ╚══════════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 1: PROTECTION MANIFEST
// Sealed registry of every protected engine.
// Each entry captures: source files, owned exports, allowed importers,
// forbidden cross-imports, dataset fingerprints, and formula signatures.
// ─────────────────────────────────────────────────────────────────────────────

export const PROTECTION_MANIFEST = {

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINE 1: ABJAD (Ebced-i Kebir / Saghir / Cümeli / Bast)
  // ══════════════════════════════════════════════════════════════════════════
  ABJAD: {
    id: 'ABJAD',
    sealed: '2026-06-02',
    description: 'Abjad Numerology — Kabir, Saghir, Cümeli Kebir, and Bast-i Huruf calculation engines',
    sourceFiles: [
      'lib/abjadModes.js',
      'lib/abjadValues.js',
    ],
    pageFile: 'pages/AbjadKabirPage.jsx',
    route: '/abjad',
    ownedExports: [
      // lib/abjadModes.js
      'KABIR_MAP', 'SAGHIR_MAP', 'LETTER_NAMES', 'BAST_TABLE',
      'normalize', 'calcKebir', 'calcSaghir', 'calcCumeli', 'calcBast',
      // lib/abjadValues.js
      'ABJAD_MAP', 'normalizeArabicLetter', 'getAbjadValue', 'isArabicLetter', 'processText',
    ],
    allowedImporters: [
      'pages/AbjadKabirPage.jsx',
      'components/AbjadReferenceTable.jsx',
      'components/LetterGrid.jsx',
      'components/LetterAnalysis.jsx',
      'components/ResultsSummary.jsx',
    ],
    // CRITICAL: These engines MUST NOT import from ABJAD source files
    forbiddenCrossImports: [
      'lib/bastHuroofEngine.js',
      'lib/bastHuroofData.js',
      'lib/mizaan9Engine.js',
      'lib/mizaan9Data.js',
      'lib/anasirEngine.js',
      'lib/anasirValues.js',
      'lib/faalHasrathData.js',
      'lib/faalLuqmanData.js',
      'pages/HadimPage.jsx',
      'pages/Mizaan9Page.jsx',
      'pages/MagicSqayerPage.jsx',
      'pages/VefkinYapilisiPage.jsx',
      'pages/BastHuroofPage.jsx',
      'pages/FaalHasrathPage.jsx',
    ],
    formulaSignatures: {
      // Kabir: sum of KABIR_MAP[normalize(ch)] for each Arabic letter
      KABIR_FORMULA: 'sum(KABIR_MAP[normalize(ch)] for ch in extractLetters(text))',
      // Saghir: sum of SAGHIR_MAP values, sakit (=0) letters excluded
      SAGHIR_FORMULA: 'sum(SAGHIR_MAP[normalize(ch)] for ch in extractLetters(text) if SAGHIR_MAP[ch] !== 0)',
      // Cümeli: expand each letter to its full name, sum all kabir values of name letters
      CUMELI_FORMULA: 'sum(sum(KABIR_MAP[nl] for nl in LETTER_NAMES[ch]) for ch in extractLetters(text))',
      // Bast: direct lookup from BAST_TABLE[letter][level]
      BAST_FORMULA:   'sum(BAST_TABLE[normalize(ch)][bastLevel] for ch in extractLetters(text))',
    },
    datasetFingerprints: {
      // KABIR_MAP: classical Abjad — ا=1 through غ=1000 (28 letters)
      KABIR_RANGE: '1–1000, 28 letters, Ebced-i Kebir order',
      KABIR_FIRST: 'ا=1, ب=2, ج=3, د=4, ه=5, و=6, ز=7, ح=8, ط=9, ي=10',
      KABIR_LAST:  'ق=100, ر=200, ش=300, ت=400, ث=500, خ=600, ذ=700, ض=800, ظ=900, غ=1000',
      // SAGHIR_MAP: cyclic reduction — sakit letters: س=0, ش=0, خ=0, ظ=0
      SAGHIR_SAKIT_LETTERS: ['س', 'ش', 'خ', 'ظ'],
      // BAST_TABLE: 5 levels per letter, 28 letters — SEALED values below
      BAST_SPOT_CHECKS: {
        'ا_L1': 16,  'ا_L5': 991,
        'غ_L1': 991, 'غ_L5': 16,   // note: ا and غ are mirror-inverted across levels
        'ش_L1': 337, 'ش_L3': 3963,
        'ب_L1': 616, 'ح_L1': 539,
      },
      NORMALIZE_MAP: { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ئ':'ي','ؤ':'و','ة':'ه' },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINE 2: ANASIR (Elemental Analysis)
  // ══════════════════════════════════════════════════════════════════════════
  ANASIR: {
    id: 'ANASIR',
    sealed: '2026-06-02',
    description: 'Elemental Analysis — assigns Arabic letters to Fire/Water/Air/Earth and calculates elemental balance',
    sourceFiles: [
      'lib/anasirEngine.js',
      'lib/anasirValues.js',
    ],
    pageFile: 'pages/AnasirPage.jsx',
    route: '/anasir',
    ownedExports: [
      'ELEMENT_MAP', 'ELEMENT_META', 'analyzeAnasir',
    ],
    allowedImporters: [
      'pages/AnasirPage.jsx',
      'pages/AnasirCalculator.jsx',
      'pages/AnasirDomination.jsx',
      'components/AnasirLetterGrid.jsx',
      'components/ElementInsight.jsx',
      'components/AnasirResultsSummary.jsx',
    ],
    forbiddenCrossImports: [
      'lib/abjadModes.js',
      'lib/abjadValues.js',
      'lib/bastHuroofEngine.js',
      'lib/mizaan9Engine.js',
      'lib/faalHasrathData.js',
      'lib/faalLuqmanData.js',
    ],
    formulaSignatures: {
      ANASIR_FORMULA: 'assign each Arabic letter to element group, count per element, derive dominant',
    },
    datasetFingerprints: {
      ELEMENTS: ['fire', 'water', 'air', 'earth'],
      NOTE: 'Element letter assignments defined in lib/anasirValues.js — sealed to that file only',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINE 3: HADIM (Name Generator — Ulvi / Sufli / Sherli)
  // ══════════════════════════════════════════════════════════════════════════
  HADIM: {
    id: 'HADIM',
    sealed: '2026-06-02',
    description: 'Hadim Name Generator — Abjad-based positional extraction with type-specific subtraction rules',
    sourceFiles: [
      'pages/HadimPage.jsx',   // all logic self-contained in the page
    ],
    pageFile: 'pages/HadimPage.jsx',
    route: '/hadim',
    ownedExports: [],  // all logic is internal to the page — no shared exports
    allowedImporters: [
      'pages/HadimKasem.jsx',       // sub-page, same system
      'components/HadimTypePanel.jsx',
      'components/HadimKasem.jsx',
      'components/HadimZikr.jsx',
    ],
    forbiddenCrossImports: [
      'lib/bastHuroofEngine.js',
      'lib/bastHuroofData.js',
      'lib/mizaan9Engine.js',
      'lib/mizaan9Data.js',
      'lib/anasirEngine.js',
      'lib/faalHasrathData.js',
      'lib/faalLuqmanData.js',
    ],
    formulaSignatures: {
      // Positional extraction: extract units/tens/hundreds digit of abjad value
      UNITS_RULE:    'value % 10 → lookup in UNITS_MAP (1-9)',
      TENS_RULE:     'Math.floor(value / 10) % 10 → lookup in TENS_MAP (10-90)',
      HUNDREDS_RULE: 'Math.floor(value / 100) → lookup in HUNDREDS_MAP (100-900)',
      // Type rules (Ulvi/Sufli/Sherli): subtract predefined constant, then mod
      ULVI_FORMULA:  'if total > subtractor: result = total - subtractor; else result = total',
      SUFLI_FORMULA: 'independent subtractor constant, same logic',
      SHERLI_FORMULA:'independent subtractor constant, same logic',
      // Thousands slot rule: values ≥ 1000 use special cycling through place values
      THOUSANDS_RULE: 'cycle: units → tens → hundreds per each 1000 block',
    },
    datasetFingerprints: {
      NOTE: 'All lookup maps (UNITS_MAP, TENS_MAP, HUNDREDS_MAP) and type subtractor values are sealed within pages/HadimPage.jsx',
      SEALED_TO_FILE: 'pages/HadimPage.jsx — NO external data file',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINE 4: MIZAAN 9 (Sacred Numerology — Elemental + Planetary)
  // ══════════════════════════════════════════════════════════════════════════
  MIZAAN: {
    id: 'MIZAAN',
    sealed: '2026-06-02',
    description: 'Mizaan 9 — Elemental analysis with own independent Bast-1 table, planetary, day/night, and suitability mappings',
    sourceFiles: [
      'lib/mizaan9Engine.js',
      'lib/mizaan9Data.js',
    ],
    pageFile: 'pages/Mizaan9Page.jsx',
    route: '/mizaan9',
    ownedExports: [
      // lib/mizaan9Engine.js
      'MIZAAN_ELEMENTS', 'MIZAAN_RANK_NAMES', 'MIZAAN_BAST2',
      'MIZAAN_PLANETS', 'MIZAAN_DAYNIGHT', 'MIZAAN_SUITABILITY',
      'getMizaanInterpretation', 'mizaanAnalyze', 'mizaanAnalyzeAsync',
      // lib/mizaan9Data.js
      'MIZAAN_KHAYR_SHARR', 'MIZAAN_HOURS', 'MIZAAN_DAYS',
      'MIZAAN_PLANETS_ALL', 'DAY_PLANET_MAP', 'MIZAAN_PURPOSES',
      'MIZAAN_DAYNIGHT_FULL', 'MIZAAN_ELEMENT_DEGREES',
      'getDominantDayNight', 'getDominantPurpose', 'getBestHour',
      'getBestDay', 'getDominantPlanet',
    ],
    allowedImporters: [
      'pages/Mizaan9Page.jsx',
      'components/Mizaan9Results.jsx',
      'components/mizaan/Mizaan1.jsx',
      'components/mizaan/Mizaan2.jsx',
      'components/mizaan/Mizaan3.jsx',
      'components/mizaan/Mizaan4.jsx',
      'components/mizaan/Mizaan5.jsx',
      'components/mizaan/Mizaan6.jsx',
      'components/mizaan/Mizaan7.jsx',
      'components/mizaan/Mizaan8.jsx',
      'components/mizaan/Mizaan9Final.jsx',
      'components/mizaan/MizaanFinalSummary.jsx',
      'components/mizaan/MizaanHeader.jsx',
    ],
    forbiddenCrossImports: [
      'lib/abjadModes.js',
      'lib/abjadValues.js',
      'lib/bastHuroofEngine.js',
      'lib/bastHuroofData.js',
      'lib/anasirEngine.js',
      'lib/faalHasrathData.js',
      'lib/faalLuqmanData.js',
    ],
    formulaSignatures: {
      // Mizaan uses its OWN Bast-1 table (MIZAAN_BAST1) — NOT bastHuroofData
      BAST1_FORMULA:  'sum(MIZAAN_BAST1[mNorm(ch)] for ch in mClean(text))',
      ELEMENT_FORMULA:'count letters per element group, dominant = max count; tie → Mertebe rank',
      TIEBREAK_RULE:  'mResolveTie: compare rankIndex (position in element.letters array), lower index wins',
      BAST2_VALUE:    'fixed per dominant element: fire=3550, earth=4015, air=3757, water=3342',
    },
    datasetFingerprints: {
      // MIZAAN_BAST1 — own independent table (NOT bastHuroofData.js)
      MIZAAN_BAST1_SPOT_CHECKS: {
        'ا': 16, 'ب': 616, 'ج': 1041, 'غ': 991,
        'ك': 1097, 'ل': 339, 'م': 765, 'ف': 657,
      },
      ELEMENT_LETTERS: {
        fire:  ['ا','ه','ط','م','ف','ش','ذ'],
        earth: ['ب','و','ي','ن','ص','ت','ض'],
        air:   ['ج','ز','ك','س','ق','ث','ظ'],
        water: ['د','ح','ل','ع','ر','خ','غ'],
      },
      BAST2_TABLE: { fire: 3550, earth: 4015, air: 3757, water: 3342 },
      KHAYR_BAST:  1416,
      SHARR_BAST:  501,
      HOURS_COUNT: 12,
      DAYS_COUNT:  7,
      PLANETS_COUNT: 7,
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINE 5: MAGIC SQAYER (Magic Square / Vefk Construction)
  // ══════════════════════════════════════════════════════════════════════════
  MAGIC_SQAYER: {
    id: 'MAGIC_SQAYER',
    sealed: '2026-06-02',
    description: 'Magic Square — constructs N×N magic squares using Siamese, doubly-even, and singly-even methods with affine-shift and elemental transformation',
    sourceFiles: [
      'pages/MagicSqayerPage.jsx',   // all engine logic self-contained
    ],
    pageFile: 'pages/MagicSqayerPage.jsx',
    route: '/magic-sqayer',
    ownedExports: [],   // self-contained page — no shared exports
    allowedImporters: [
      'components/AnaVefk.jsx',
    ],
    forbiddenCrossImports: [
      'lib/abjadModes.js',
      'lib/abjadValues.js',
      'lib/bastHuroofEngine.js',
      'lib/bastHuroofData.js',
      'lib/mizaan9Engine.js',
      'lib/mizaan9Data.js',
      'lib/faalHasrathData.js',
      'lib/faalLuqmanData.js',
    ],
    formulaSignatures: {
      // Odd-order (Siamese): start center-top, step (+1 col, -1 row), col-wrap + row-wrap
      SIAMESE_FORMULA: 'start=(0, n÷2), step=(row-1, col+1) mod n; on conflict: step=(row+1, col)',
      // Doubly-even (n%4===0): fill 1..n², flip cells where (i%4<2)===((j%4<2) || i%4===j%4)
      DOUBLY_EVEN_FORMULA: 'fill sequential, swap cells on diagonal pattern',
      // Singly-even (n%4===2): split into 4 odd quadrants, swap specific columns
      SINGLY_EVEN_FORMULA: 'construct odd sub-squares, apply column-swap pattern',
      // Affine shift: add (base - 1) to every cell so magic constant = target
      AFFINE_SHIFT: 'cell_final = cell_base + (inputValue - 1)',
      // Magic constant: n*(n²+1)/2 for base; base + n*(inputValue-1) after shift
      MAGIC_CONSTANT: 'n*(n²+1)/2 + n*(inputValue-1)',
    },
    datasetFingerprints: {
      SUPPORTED_SIZES: [3, 4, 5, 6, 7, 8, 9],
      NOTE: 'Elemental transformation (rotation/mirror) and planetary associations sealed to pages/MagicSqayerPage.jsx',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINE 6: VEFKİN YAPILIŞI (Ottoman Manuscript Vefk Method)
  // ══════════════════════════════════════════════════════════════════════════
  VEFKIN: {
    id: 'VEFKIN',
    sealed: '2026-06-02',
    description: 'Vefkin Yapilisi — Ottoman manuscript Vefk construction with session management and export',
    sourceFiles: [
      'pages/VefkinYapilisiPage.jsx',
      'context/VefkSessionContext.jsx',
      'lib/vefkExport.js',
    ],
    pageFile: 'pages/VefkinYapilisiPage.jsx',
    route: '/vefkin-yapilisi',
    ownedExports: [
      'VefkSessionContext', 'VefkSessionProvider',   // context/VefkSessionContext.jsx
    ],
    allowedImporters: [
      'pages/VefkinYapilisiPage.jsx',
      'components/TanzimVefki.jsx',
      'components/VefkSessionManager.jsx',
      'components/AkramCard.jsx',
    ],
    forbiddenCrossImports: [
      'lib/abjadModes.js',
      'lib/abjadValues.js',
      'lib/bastHuroofEngine.js',
      'lib/bastHuroofData.js',
      'lib/mizaan9Engine.js',
      'lib/mizaan9Data.js',
      'lib/faalHasrathData.js',
      'lib/faalLuqmanData.js',
    ],
    formulaSignatures: {
      NOTE: 'Ottoman manuscript Vefk construction rules sealed to pages/VefkinYapilisiPage.jsx and associated components',
    },
    datasetFingerprints: {
      NOTE: 'All Vefk construction rules, session data, and export logic are isolated to the Vefkin system files',
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINE 7: BASTHUL HUROOF 2 (5-Level Bast Expansion — Manuscript Source)
  // ══════════════════════════════════════════════════════════════════════════
  BAST_HUROOF: {
    id: 'BAST_HUROOF',
    sealed: '2026-06-02',
    description: 'Basthul Huroof — 5-level Bast expansion using the dedicated manuscript table from "Harflerin Bastı Cetveli"',
    sourceFiles: [
      'lib/bastHuroofEngine.js',
      'lib/bastHuroofData.js',
    ],
    pageFile: 'pages/BastHuroofPage.jsx',
    route: '/basthul-huroof-2',
    ownedExports: [
      // lib/bastHuroofEngine.js
      'BAST_LEVELS', 'calcBastHuroof',
      // lib/bastHuroofData.js
      'BAST_DATA', 'BAST_FIELD_MAP', 'BAST_LOOKUP',
    ],
    allowedImporters: [
      'pages/BastHuroofPage.jsx',
    ],
    forbiddenCrossImports: [
      'lib/abjadModes.js',
      'lib/abjadValues.js',
      'lib/mizaan9Engine.js',
      'lib/mizaan9Data.js',
      'lib/anasirEngine.js',
      'lib/faalHasrathData.js',
      'lib/faalLuqmanData.js',
    ],
    formulaSignatures: {
      BAST_FORMULA:    'sum(BAST_LOOKUP[normalize(ch)][BAST_FIELD_MAP[level]] for ch in extractArabicLetters(text))',
      NORMALIZE_RULE:  'NORM_MAP: أ→ا, إ→ا, آ→ا, ٱ→ا, ء→ا, ى→ي, ئ→ي, ؤ→و, ة→ه',
    },
    datasetFingerprints: {
      // Source: "Harflerin Bastı Cetveli" — Bastların Usulü Vefklerin Sırrı ve Havassı, p.93
      // 28 letters × 5 levels = 140 values — SEALED spot checks:
      BAST_SPOT_CHECKS: {
        'ا_Evvel': 16,      'ا_Hamis': 156119,
        'ب_Evvel': 616,     'ب_Hamis': 292178,
        'ج_Evvel': 1041,    'ج_Hamis': 316523,
        'ش_Evvel': 1095,    'ش_Hamis': 473597,
        'غ_Evvel': 114,     'غ_Hamis': 182227,
        'ل_Evvel': 1097,    'ل_Hamis': 387380,
      },
      // NOTE: These values are from the manuscript source and differ from
      // the BAST_TABLE in lib/abjadModes.js — they are NOT the same dataset.
      // bastHuroofData.js is the AUTHORITATIVE source for BastHuroofPage.
      LEVEL_FIELDS: {
        1: 'bastEvvel', 2: 'bastSani', 3: 'bastSalis', 4: 'bastRabi', 5: 'bastHamis',
      },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINE 8: FAAL ALI (16-Cell Heart Divination)
  // ══════════════════════════════════════════════════════════════════════════
  FAAL_ALI: {
    id: 'FAAL_ALI',
    sealed: '2026-06-02',
    description: 'Faal Ali — 16-cell heart-symbol divination system with bilingual Malayalam/English results',
    sourceFiles: [
      'lib/faalHasrathData.js',   // FAAL_CELLS (16 entries, id 1–16)
      'pages/FaalHasrathPage.jsx',
    ],
    pageFile: 'pages/FaalHasrathPage.jsx',
    route: '/faal-hasrath',
    ownedExports: [
      'FAAL_CELLS',   // lib/faalHasrathData.js — 16 heart-mark results
    ],
    allowedImporters: [
      'pages/FaalHasrathPage.jsx',
    ],
    forbiddenCrossImports: [
      'lib/abjadModes.js',
      'lib/abjadValues.js',
      'lib/bastHuroofEngine.js',
      'lib/bastHuroofData.js',
      'lib/mizaan9Engine.js',
      'lib/mizaan9Data.js',
      'lib/anasirEngine.js',
      'lib/faalLuqmanData.js',    // Faal Ali and Faal Luqman do NOT share data
    ],
    formulaSignatures: {
      SELECTION_RULE: 'user selects 1 of 16 cells; result = FAAL_CELLS[id-1]; no calculation applied',
    },
    datasetFingerprints: {
      CELL_COUNT: 16,
      ID_RANGE: '1–16',
      INNER_MARKS: [
        'dot', 'two-dots', 'arc-up', 'three-dots', 'line-h', 'eye',
        'x-cross', 'line-v', 'circle', 'arc-down', 'cross', 'spiral',
        'double-arc', 'star3', 'zigzag', 'line-diag',
      ],
      LANGUAGES: ['ml', 'en'],
      // Spot checks — first and last cells sealed:
      CELL_1: { innerMark: 'dot',      ml_shortTitle: 'അനുഗ്രഹമുണ്ട്',  en_shortTitle: "Allah's Blessing" },
      CELL_16:{ innerMark: 'line-diag',ml_shortTitle: 'ഉത്തമം',          en_shortTitle: 'Excellent Omen'   },
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ENGINE 9: FAAL LUQMAN (28-Cell Arabic Letter Divination)
  // ══════════════════════════════════════════════════════════════════════════
  FAAL_LUQMAN: {
    id: 'FAAL_LUQMAN',
    sealed: '2026-06-02',
    description: 'Faalul Luqman — 28-cell Arabic letter divination system with bilingual Malayalam/English results',
    sourceFiles: [
      'lib/faalLuqmanData.js',    // LUQMAN_CELLS (28 entries, lq_id 101–128)
      'pages/FaalHasrathPage.jsx',
    ],
    pageFile: 'pages/FaalHasrathPage.jsx',
    route: '/faal-hasrath',
    ownedExports: [
      'LUQMAN_CELLS',   // lib/faalLuqmanData.js — 28 Arabic letter results
    ],
    allowedImporters: [
      'pages/FaalHasrathPage.jsx',
    ],
    forbiddenCrossImports: [
      'lib/abjadModes.js',
      'lib/abjadValues.js',
      'lib/bastHuroofEngine.js',
      'lib/bastHuroofData.js',
      'lib/mizaan9Engine.js',
      'lib/mizaan9Data.js',
      'lib/anasirEngine.js',
      'lib/faalHasrathData.js',   // Faal Luqman and Faal Ali do NOT share data
    ],
    formulaSignatures: {
      SELECTION_RULE: 'user selects 1 of 28 cells; result = LUQMAN_CELLS[lq_id-101]; no calculation applied',
    },
    datasetFingerprints: {
      CELL_COUNT: 28,
      ID_RANGE: '101–128',
      SYMBOLS: ['ا','ب','ج','د','ه','و','ز','ح','ط','ي','ك','ل','م','ن','س','ع','ف','ص','ق','ر','ش','ت','ث','خ','ذ','ض','ظ','غ'],
      LANGUAGES: ['ml', 'en'],
      // Spot checks — first and last cells sealed:
      CELL_101: { symbol: 'ا', symbolName: 'Alif',  ml_shortTitle: 'ഉയർച്ച',    en_shortTitle: 'Rise & Elevation' },
      CELL_128: { symbol: 'غ', symbolName: 'Ghain', ml_shortTitle: 'ഗൈബ്',       en_shortTitle: 'Unseen Help'      },
    },
  },

};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: PROTECTED FILE REGISTRY
// Authoritative list of all files that contain calculation logic.
// These files must NEVER be modified by UI, styling, animation,
// service worker, or performance optimization changes.
// ─────────────────────────────────────────────────────────────────────────────

export const PROTECTED_FILES = [
  // Core data maps & engines
  { path: 'lib/abjadValues.js',       engine: 'ABJAD',       type: 'data+engine', critical: true  },
  { path: 'lib/abjadModes.js',        engine: 'ABJAD',       type: 'engine',      critical: true  },
  { path: 'lib/anasirValues.js',      engine: 'ANASIR',      type: 'data',        critical: true  },
  { path: 'lib/anasirEngine.js',      engine: 'ANASIR',      type: 'engine',      critical: true  },
  { path: 'lib/bastHuroofData.js',    engine: 'BAST_HUROOF', type: 'data',        critical: true  },
  { path: 'lib/bastHuroofEngine.js',  engine: 'BAST_HUROOF', type: 'engine',      critical: true  },
  { path: 'lib/mizaan9Data.js',       engine: 'MIZAAN',      type: 'data',        critical: true  },
  { path: 'lib/mizaan9Engine.js',     engine: 'MIZAAN',      type: 'engine',      critical: true  },
  { path: 'lib/faalHasrathData.js',   engine: 'FAAL_ALI',    type: 'data',        critical: true  },
  { path: 'lib/faalLuqmanData.js',    engine: 'FAAL_LUQMAN', type: 'data',        critical: true  },
  { path: 'lib/vefkExport.js',        engine: 'VEFKIN',      type: 'utility',     critical: false },
  // Pages (contain self-contained engines)
  { path: 'pages/HadimPage.jsx',      engine: 'HADIM',       type: 'engine+page', critical: true  },
  { path: 'pages/MagicSqayerPage.jsx',engine: 'MAGIC_SQAYER',type: 'engine+page', critical: true  },
  { path: 'pages/VefkinYapilisiPage.jsx', engine: 'VEFKIN',  type: 'engine+page', critical: true  },
  { path: 'pages/FaalHasrathPage.jsx',engine: 'FAAL_ALI+FAAL_LUQMAN', type: 'page', critical: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: CROSS-MODULE DEPENDENCY RULES
// Defines what is EXPLICITLY ALLOWED between engines.
// Anything not listed here is FORBIDDEN.
// ─────────────────────────────────────────────────────────────────────────────

export const ALLOWED_CROSS_MODULE_DEPENDENCIES = [
  // Faal Ali and Faal Luqman share the same PAGE component (FaalHasrathPage.jsx)
  // but use completely separate data files with NO shared data or logic.
  {
    from:     'pages/FaalHasrathPage.jsx',
    imports:  ['lib/faalHasrathData.js', 'lib/faalLuqmanData.js'],
    reason:   'Single page hosts two independent divination subsystems. Data files remain separate.',
    approved: '2026-06-02',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4: SAFE MODIFICATION ZONES
// Files that UI/animation/performance changes ARE ALLOWED to modify
// without protection review.
// ─────────────────────────────────────────────────────────────────────────────

export const SAFE_MODIFICATION_ZONES = [
  // Layout & navigation
  'components/PageLayout.jsx',
  'components/StickyNav.jsx',
  'components/MysticalBackground.jsx',
  'components/HeroSection.jsx',
  'components/SacredWheel.jsx',
  'components/SplashScreen.jsx',
  'components/PWAInstallPrompt.jsx',
  'components/OfflineNotice.jsx',
  'components/PageTitle.jsx',
  // Animation & hooks
  'hooks/useMouseParallax.js',
  'hooks/useIsMobile.js',
  'hooks/use-mobile.jsx',
  // Context (non-calculation)
  'context/NavigationContext.jsx',
  // SW & PWA
  'public/sw.js',
  'public/manifest.json',
  'index.html',
  // Style
  'index.css',
  'tailwind.config.js',
  // App shell
  'App.jsx',
  'main.jsx',
  // Auth
  'lib/AuthContext.jsx',
  'lib/app-params.js',
  'lib/PageNotFound.jsx',
  'lib/query-client.js',
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: RUNTIME INTEGRITY VERIFIER
// Call verifyEngineIntegrity() to perform a runtime spot-check of sealed
// dataset values. Pass an object of { engineId: { exportedData } } pairs.
// Returns a report with PASS/FAIL per check.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify that sealed dataset spot-check values match what is currently loaded.
 *
 * @param {Object} engines - map of loaded engine data
 *   {
 *     ABJAD:       { KABIR_MAP, SAGHIR_MAP, BAST_TABLE },
 *     MIZAAN:      { MIZAAN_ELEMENTS, MIZAAN_BAST2 },
 *     BAST_HUROOF: { BAST_LOOKUP },
 *     FAAL_ALI:    { FAAL_CELLS },
 *     FAAL_LUQMAN: { LUQMAN_CELLS },
 *   }
 * @returns {{ passed: number, failed: number, checks: Array }}
 */
export function verifyEngineIntegrity(engines = {}) {
  const checks = [];
  let passed = 0;
  let failed = 0;

  function check(engineId, label, actual, expected) {
    const ok = actual === expected;
    checks.push({ engineId, label, actual, expected, status: ok ? 'PASS' : 'FAIL' });
    if (ok) passed++; else failed++;
  }

  // ── ABJAD checks ──
  if (engines.ABJAD) {
    const { KABIR_MAP, SAGHIR_MAP, BAST_TABLE } = engines.ABJAD;
    if (KABIR_MAP) {
      check('ABJAD', 'KABIR_MAP[ا]',  KABIR_MAP['ا'],  1);
      check('ABJAD', 'KABIR_MAP[ب]',  KABIR_MAP['ب'],  2);
      check('ABJAD', 'KABIR_MAP[غ]',  KABIR_MAP['غ'],  1000);
      check('ABJAD', 'KABIR_MAP[ق]',  KABIR_MAP['ق'],  100);
      check('ABJAD', 'KABIR_MAP[ر]',  KABIR_MAP['ر'],  200);
    }
    if (SAGHIR_MAP) {
      check('ABJAD', 'SAGHIR_MAP[س]=0 (sakit)', SAGHIR_MAP['س'], 0);
      check('ABJAD', 'SAGHIR_MAP[ش]=0 (sakit)', SAGHIR_MAP['ش'], 0);
      check('ABJAD', 'SAGHIR_MAP[ا]=1',          SAGHIR_MAP['ا'], 1);
    }
    if (BAST_TABLE) {
      check('ABJAD', 'BAST_TABLE[ا][1]=16',   BAST_TABLE['ا']?.[1], 16);
      check('ABJAD', 'BAST_TABLE[ا][5]=991',  BAST_TABLE['ا']?.[5], 991);
      check('ABJAD', 'BAST_TABLE[غ][1]=991',  BAST_TABLE['غ']?.[1], 991);
      check('ABJAD', 'BAST_TABLE[غ][5]=16',   BAST_TABLE['غ']?.[5], 16);
      check('ABJAD', 'BAST_TABLE[ش][1]=337',  BAST_TABLE['ش']?.[1], 337);
      check('ABJAD', 'BAST_TABLE[ش][3]=3963', BAST_TABLE['ش']?.[3], 3963);
    }
  }

  // ── MIZAAN checks ──
  if (engines.MIZAAN) {
    const { MIZAAN_ELEMENTS, MIZAAN_BAST2 } = engines.MIZAAN;
    if (MIZAAN_ELEMENTS) {
      check('MIZAAN', 'MIZAAN_ELEMENTS.fire.bast2=3550',  MIZAAN_ELEMENTS.fire?.bast2,  3550);
      check('MIZAAN', 'MIZAAN_ELEMENTS.earth.bast2=4015', MIZAAN_ELEMENTS.earth?.bast2, 4015);
      check('MIZAAN', 'MIZAAN_ELEMENTS.air.bast2=3757',   MIZAAN_ELEMENTS.air?.bast2,   3757);
      check('MIZAAN', 'MIZAAN_ELEMENTS.water.bast2=3342', MIZAAN_ELEMENTS.water?.bast2, 3342);
      // Verify element letter assignments
      check('MIZAAN', 'fire first letter=ا',   MIZAAN_ELEMENTS.fire?.letters?.[0],  'ا');
      check('MIZAAN', 'earth first letter=ب',  MIZAAN_ELEMENTS.earth?.letters?.[0], 'ب');
      check('MIZAAN', 'air first letter=ج',    MIZAAN_ELEMENTS.air?.letters?.[0],   'ج');
      check('MIZAAN', 'water first letter=د',  MIZAAN_ELEMENTS.water?.letters?.[0], 'د');
    }
  }

  // ── BAST_HUROOF checks ──
  if (engines.BAST_HUROOF) {
    const { BAST_LOOKUP } = engines.BAST_HUROOF;
    if (BAST_LOOKUP) {
      check('BAST_HUROOF', 'BAST_LOOKUP[ا].bastEvvel=16',      BAST_LOOKUP['ا']?.bastEvvel, 16);
      check('BAST_HUROOF', 'BAST_LOOKUP[ا].bastHamis=156119',  BAST_LOOKUP['ا']?.bastHamis, 156119);
      check('BAST_HUROOF', 'BAST_LOOKUP[ب].bastEvvel=616',     BAST_LOOKUP['ب']?.bastEvvel, 616);
      check('BAST_HUROOF', 'BAST_LOOKUP[ش].bastHamis=473597',  BAST_LOOKUP['ش']?.bastHamis, 473597);
      check('BAST_HUROOF', 'BAST_LOOKUP[غ].bastEvvel=114',     BAST_LOOKUP['غ']?.bastEvvel, 114);
      check('BAST_HUROOF', 'BAST_LOOKUP[غ].bastHamis=182227',  BAST_LOOKUP['غ']?.bastHamis, 182227);
    }
  }

  // ── FAAL_ALI checks ──
  if (engines.FAAL_ALI) {
    const { FAAL_CELLS } = engines.FAAL_ALI;
    if (FAAL_CELLS) {
      check('FAAL_ALI', 'FAAL_CELLS.length=16',          FAAL_CELLS.length, 16);
      check('FAAL_ALI', 'FAAL_CELLS[0].id=1',            FAAL_CELLS[0]?.id, 1);
      check('FAAL_ALI', 'FAAL_CELLS[0].innerMark=dot',   FAAL_CELLS[0]?.innerMark, 'dot');
      check('FAAL_ALI', 'FAAL_CELLS[15].id=16',          FAAL_CELLS[15]?.id, 16);
      check('FAAL_ALI', 'FAAL_CELLS[15].innerMark=line-diag', FAAL_CELLS[15]?.innerMark, 'line-diag');
    }
  }

  // ── FAAL_LUQMAN checks ──
  if (engines.FAAL_LUQMAN) {
    const { LUQMAN_CELLS } = engines.FAAL_LUQMAN;
    if (LUQMAN_CELLS) {
      check('FAAL_LUQMAN', 'LUQMAN_CELLS.length=28',            LUQMAN_CELLS.length, 28);
      check('FAAL_LUQMAN', 'LUQMAN_CELLS[0].lq_id=101',         LUQMAN_CELLS[0]?.lq_id, 101);
      check('FAAL_LUQMAN', 'LUQMAN_CELLS[0].symbol=ا',          LUQMAN_CELLS[0]?.symbol, 'ا');
      check('FAAL_LUQMAN', 'LUQMAN_CELLS[27].lq_id=128',        LUQMAN_CELLS[27]?.lq_id, 128);
      check('FAAL_LUQMAN', 'LUQMAN_CELLS[27].symbol=غ',         LUQMAN_CELLS[27]?.symbol, 'غ');
    }
  }

  return { passed, failed, total: passed + failed, checks };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: DEPLOYMENT REPORT GENERATOR
// Call generateDeploymentReport() to produce a human-readable integrity report.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a full deployment integrity report.
 *
 * @param {Object} options
 *   engines       — same shape as verifyEngineIntegrity input (optional)
 *   changedFiles  — array of file paths changed in this deploy (optional)
 *   deployVersion — version string (optional)
 * @returns {string} formatted report
 */
export function generateDeploymentReport({ engines = {}, changedFiles = [], deployVersion = 'unknown' } = {}) {
  const ts   = new Date().toISOString();
  const lines = [];

  lines.push('╔══════════════════════════════════════════════════════════════════╗');
  lines.push('║          SIRR AL-HURUF — DEPLOYMENT INTEGRITY REPORT            ║');
  lines.push('╚══════════════════════════════════════════════════════════════════╝');
  lines.push(`  Generated : ${ts}`);
  lines.push(`  Version   : ${deployVersion}`);
  lines.push('');

  // ── 1. Formula Changes ──
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('  SECTION 1 — FORMULA CHANGES');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const engineFiles = PROTECTED_FILES.filter(f => f.critical).map(f => f.path);
  const touchedEngines = changedFiles.filter(f => engineFiles.includes(f));
  if (touchedEngines.length === 0) {
    lines.push('  ✅ No formula files modified in this deployment.');
  } else {
    lines.push('  ⚠️  FORMULA FILES MODIFIED — manual review required:');
    touchedEngines.forEach(f => lines.push(`       • ${f}`));
  }
  lines.push('');

  // ── 2. Rule Changes ──
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('  SECTION 2 — RULE CHANGES');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const ruleFiles = ['pages/HadimPage.jsx', 'pages/MagicSqayerPage.jsx', 'pages/VefkinYapilisiPage.jsx'];
  const touchedRules = changedFiles.filter(f => ruleFiles.includes(f));
  if (touchedRules.length === 0) {
    lines.push('  ✅ No self-contained engine pages modified.');
  } else {
    lines.push('  ⚠️  ENGINE PAGES MODIFIED — verify no calculation rule changes:');
    touchedRules.forEach(f => lines.push(`       • ${f}`));
  }
  lines.push('');

  // ── 3. Dataset Changes ──
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('  SECTION 3 — DATASET CHANGES');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const dataFiles = PROTECTED_FILES.filter(f => f.type === 'data' || f.type === 'data+engine').map(f => f.path);
  const touchedData = changedFiles.filter(f => dataFiles.includes(f));
  if (touchedData.length === 0) {
    lines.push('  ✅ No dataset files modified.');
  } else {
    lines.push('  ⚠️  DATASET FILES MODIFIED — verify manuscript source values:');
    touchedData.forEach(f => lines.push(`       • ${f}`));
  }
  lines.push('');

  // ── 4. Cross-Module Dependency Check ──
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('  SECTION 4 — CROSS-MODULE DEPENDENCIES');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('  Approved cross-module dependencies:');
  ALLOWED_CROSS_MODULE_DEPENDENCIES.forEach(dep => {
    lines.push(`    ✅ [${dep.approved}] ${dep.from}`);
    dep.imports.forEach(i => lines.push(`         imports: ${i}`));
    lines.push(`         reason: ${dep.reason}`);
  });
  lines.push('');
  lines.push('  Forbidden cross-imports summary:');
  Object.values(PROTECTION_MANIFEST).forEach(engine => {
    if (engine.forbiddenCrossImports?.length) {
      lines.push(`    ${engine.id}: ${engine.forbiddenCrossImports.length} forbidden import rules sealed`);
    }
  });
  lines.push('');

  // ── 5. Route Conflicts ──
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('  SECTION 5 — ROUTE CONFLICTS');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const routes = Object.values(PROTECTION_MANIFEST).map(e => e.route).filter(Boolean);
  const routeSet = new Set(routes);
  if (routeSet.size === routes.length) {
    lines.push('  ✅ No route conflicts detected. All routes are unique:');
    routes.forEach(r => lines.push(`       ${r}`));
  } else {
    lines.push('  ❌ ROUTE CONFLICTS DETECTED:');
    const seen = {};
    routes.forEach(r => { seen[r] = (seen[r] || 0) + 1; });
    Object.entries(seen).filter(([,v]) => v > 1).forEach(([r]) => lines.push(`       CONFLICT: ${r}`));
  }
  lines.push('');

  // ── 6. Integrity Spot-Check Results ──
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('  SECTION 6 — DATASET INTEGRITY SPOT-CHECKS');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (Object.keys(engines).length === 0) {
    lines.push('  ℹ️  No engine data passed to report — skip runtime checks.');
    lines.push('  To run checks, call generateDeploymentReport({ engines: { ABJAD: {...}, ... } })');
  } else {
    const result = verifyEngineIntegrity(engines);
    lines.push(`  Total: ${result.total} | Passed: ${result.passed} | Failed: ${result.failed}`);
    lines.push('');
    result.checks.forEach(c => {
      const icon = c.status === 'PASS' ? '✅' : '❌';
      lines.push(`  ${icon} [${c.engineId}] ${c.label}`);
      if (c.status === 'FAIL') {
        lines.push(`       expected: ${JSON.stringify(c.expected)}`);
        lines.push(`       actual:   ${JSON.stringify(c.actual)}`);
      }
    });
  }
  lines.push('');

  // ── 7. Safe/Unsafe file classification ──
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('  SECTION 7 — FILE CHANGE CLASSIFICATION');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (changedFiles.length === 0) {
    lines.push('  ℹ️  No changed files provided. Pass changedFiles[] for classification.');
  } else {
    const safe   = changedFiles.filter(f => SAFE_MODIFICATION_ZONES.includes(f));
    const unsafe = changedFiles.filter(f => engineFiles.includes(f) || ruleFiles.includes(f) || dataFiles.includes(f));
    const other  = changedFiles.filter(f => !safe.includes(f) && !unsafe.includes(f));
    if (safe.length) {
      lines.push('  ✅ SAFE changes (UI/styling/SW/animation only):');
      safe.forEach(f => lines.push(`       ${f}`));
    }
    if (unsafe.length) {
      lines.push('  ⚠️  PROTECTED files changed — developer review required:');
      unsafe.forEach(f => lines.push(`       ${f}`));
    }
    if (other.length) {
      lines.push('  ℹ️  UNCLASSIFIED files changed (not in protection manifest):');
      other.forEach(f => lines.push(`       ${f}`));
    }
  }
  lines.push('');

  // ── Footer ──
  lines.push('╔══════════════════════════════════════════════════════════════════╗');
  lines.push('║  END OF REPORT — Sirr al-Huruf Core Engine Protection Layer     ║');
  lines.push('╚══════════════════════════════════════════════════════════════════╝');

  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 7: QUICK ACCESS HELPERS
// Convenience functions for checking if a file is protected / safe.
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true if the given file path is a protected calculation file */
export function isProtectedFile(filePath) {
  return PROTECTED_FILES.some(f => f.path === filePath || filePath.endsWith(f.path));
}

/** Returns true if the given file path is in the safe modification zone */
export function isSafeFile(filePath) {
  return SAFE_MODIFICATION_ZONES.some(f => filePath === f || filePath.endsWith(f));
}

/** Returns the engine entry for a given file path, or null */
export function getEngineForFile(filePath) {
  const entry = PROTECTED_FILES.find(f => f.path === filePath || filePath.endsWith(f.path));
  if (!entry) return null;
  // handle compound engine strings like 'FAAL_ALI+FAAL_LUQMAN'
  const ids = entry.engine.split('+');
  return ids.map(id => PROTECTION_MANIFEST[id]).filter(Boolean);
}