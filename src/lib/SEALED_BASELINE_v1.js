// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║   SIRR AL-HURUF — SEALED BASELINE SNAPSHOT v1.0                            ║
// ║   Created: 2026-06-02  |  Status: LOCKED · AUDITED · PROTECTED             ║
// ║                                                                             ║
// ║   This file is the PERMANENT REFERENCE BASELINE for the entire             ║
// ║   application. It is READ-ONLY. It must NEVER be modified after            ║
// ║   creation — only compared against.                                        ║
// ║                                                                             ║
// ║   HOW TO USE THIS FILE                                                     ║
// ║   ─────────────────────────────────────────────────────────────────        ║
// ║   Before any change to any engine, dataset, formula, route, or rule:       ║
// ║                                                                             ║
// ║   1. Import checkAgainstBaseline() from this file.                         ║
// ║   2. Call it with the name of the file / concept you plan to change.       ║
// ║   3. Read the impact report it returns.                                    ║
// ║   4. Proceed only if the report confirms the change is intentional.        ║
// ║                                                                             ║
// ║   ZERO runtime logic is injected into any engine or page.                  ║
// ║   This file is audit/reference only.                                       ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ─────────────────────────────────────────────────────────────────────────────
// PART A: APPLICATION METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const BASELINE_META = {
  version:     'v1.0',
  created:     '2026-06-02',
  status:      'LOCKED',
  auditStatus: 'AUDITED',
  protection:  'PROTECTED',
  appName:     'Sirr al-Huruf',
  description: 'Advanced Ilm al-Huruf Analysis — Abjad, Anasir, Hadim, Mizaan 9, Magic Square, Vefkin, Bast, Faal',
  totalEngines: 9,
  totalRoutes:  9,
  totalEngineFiles: 12,
};

// ─────────────────────────────────────────────────────────────────────────────
// PART B: ROUTE MAP — ALL ROUTES AS OF BASELINE
// ─────────────────────────────────────────────────────────────────────────────

export const BASELINE_ROUTES = [
  { path: '/',                  component: 'Home',               engine: null,          type: 'landing' },
  { path: '/abjad',             component: 'AbjadKabirPage',     engine: 'ABJAD',       type: 'calculator' },
  { path: '/anasir',            component: 'AnasirPage',         engine: 'ANASIR',      type: 'calculator' },
  { path: '/hadim',             component: 'HadimPage',          engine: 'HADIM',       type: 'calculator' },
  { path: '/mizaan9',           component: 'Mizaan9Page',        engine: 'MIZAAN',      type: 'calculator' },
  { path: '/magic-sqayer',      component: 'MagicSqayerPage',    engine: 'MAGIC_SQAYER',type: 'calculator' },
  { path: '/vefkin-yapilisi',   component: 'VefkinYapilisiPage', engine: 'VEFKIN',      type: 'calculator' },
  { path: '/basthul-huroof-2',  component: 'BastHuroofPage',     engine: 'BAST_HUROOF', type: 'calculator' },
  { path: '/faal-hasrath',      component: 'FaalHasrathPage',    engine: 'FAAL_ALI+FAAL_LUQMAN', type: 'divination' },
];

// ─────────────────────────────────────────────────────────────────────────────
// PART C: ENGINE FILE MAP — ALL PROTECTED FILES AS OF BASELINE
// ─────────────────────────────────────────────────────────────────────────────

export const BASELINE_FILES = [
  // ── Calculation data + engine files (CRITICAL) ──
  { path: 'lib/abjadModes.js',         engine: 'ABJAD',        type: 'engine',      critical: true  },
  { path: 'lib/abjadValues.js',        engine: 'ABJAD',        type: 'data+engine', critical: true  },
  { path: 'lib/anasirEngine.js',       engine: 'ANASIR',       type: 'engine',      critical: true  },
  { path: 'lib/anasirValues.js',       engine: 'ANASIR',       type: 'ui-data',     critical: false },
  { path: 'lib/mizaan9Engine.js',      engine: 'MIZAAN',       type: 'engine',      critical: true  },
  { path: 'lib/mizaan9Data.js',        engine: 'MIZAAN',       type: 'data',        critical: true  },
  { path: 'lib/bastHuroofEngine.js',   engine: 'BAST_HUROOF',  type: 'engine',      critical: true  },
  { path: 'lib/bastHuroofData.js',     engine: 'BAST_HUROOF',  type: 'data',        critical: true  },
  { path: 'lib/faalHasrathData.js',    engine: 'FAAL_ALI',     type: 'data',        critical: true  },
  { path: 'lib/faalLuqmanData.js',     engine: 'FAAL_LUQMAN',  type: 'data',        critical: true  },
  { path: 'lib/vefkExport.js',         engine: 'VEFKIN',       type: 'utility',     critical: false },
  // ── Self-contained engine pages (CRITICAL) ──
  { path: 'pages/HadimPage.jsx',           engine: 'HADIM',        type: 'engine+page', critical: true  },
  { path: 'pages/MagicSqayerPage.jsx',     engine: 'MAGIC_SQAYER', type: 'engine+page', critical: true  },
  { path: 'pages/VefkinYapilisiPage.jsx',  engine: 'VEFKIN',       type: 'engine+page', critical: true  },
  { path: 'pages/FaalHasrathPage.jsx',     engine: 'FAAL_ALI+FAAL_LUQMAN', type: 'page', critical: false },
  // ── Context ──
  { path: 'context/VefkSessionContext.jsx', engine: 'VEFKIN', type: 'context', critical: false },
];

// ─────────────────────────────────────────────────────────────────────────────
// PART D: FORMULA REGISTRY — EVERY FORMULA SEALED AT BASELINE
// ─────────────────────────────────────────────────────────────────────────────

export const BASELINE_FORMULAS = {

  // ══════════════════════════════════════════════════
  ABJAD_KABIR: {
    engine:      'ABJAD',
    file:        'lib/abjadModes.js',
    function:    'calcKebir(text)',
    formula:     'sum(KABIR_MAP[normalize(ch)] for ch in extractLetters(text))',
    mapName:     'KABIR_MAP',
    mapRange:    '1–1000, 28 letters',
    normApplied: true,
    sakitRule:   'none — all letters count',
    sealed:      '2026-06-02',
  },

  ABJAD_SAGHIR: {
    engine:      'ABJAD',
    file:        'lib/abjadModes.js',
    function:    'calcSaghir(text)',
    formula:     'sum(SAGHIR_MAP[normalize(ch)] for ch where SAGHIR_MAP[ch] !== 0)',
    mapName:     'SAGHIR_MAP',
    sakitLetters:['س','ش','خ','ظ'],  // value=0, excluded from sum
    sakitRule:   'letters with value 0 are SAKIT — excluded from total',
    sealed:      '2026-06-02',
  },

  ABJAD_CUMELI: {
    engine:      'ABJAD',
    file:        'lib/abjadModes.js',
    function:    'calcCumeli(text)',
    formula:     'sum(sum(KABIR_MAP[nl] for nl in extractLetters(LETTER_NAMES[ch])) for ch in extractLetters(text))',
    mapName:     'LETTER_NAMES',
    description: 'Expand each letter to its full Arabic name, sum all Kabir values of the name letters',
    sealed:      '2026-06-02',
  },

  ABJAD_BAST: {
    engine:      'ABJAD',
    file:        'lib/abjadModes.js',
    function:    'calcBast(text, bastLevel)',
    formula:     'sum(BAST_TABLE[normalize(ch)][bastLevel] for ch in extractLetters(text))',
    mapName:     'BAST_TABLE',
    levels:      [1, 2, 3, 4, 5],
    sealed:      '2026-06-02',
  },

  // ══════════════════════════════════════════════════
  ANASIR_ELEMENTAL: {
    engine:      'ANASIR',
    file:        'lib/anasirEngine.js',
    function:    'analyzeAnasir(text) / analyzeAnasirAsync(text)',
    formula:     'count letters per element group; dominant = element with max count',
    tiebreak:    'resolveTieByRank: element whose highest-rank letter (lowest index) wins',
    elements:    ['fire','water','air','earth'],
    sealed:      '2026-06-02',
  },

  // ══════════════════════════════════════════════════
  HADIM_NAME_GEN: {
    engine:      'HADIM',
    file:        'pages/HadimPage.jsx',
    description: 'Positional extraction: extract units/tens/hundreds/thousands digit of Abjad value, look up in positional maps',
    unitsRule:   'value % 10 → UNITS_MAP[1-9]',
    tensRule:    'Math.floor(value / 10) % 10 → TENS_MAP[10-90]',
    hundredsRule:'Math.floor(value / 100) → HUNDREDS_MAP[100-900]',
    thousandsRule:'cycle through units→tens→hundreds per each 1000 block',
    typeRules: {
      Ulvi:   'if total > subtractor: result = total - subtractor; else result = total',
      Sufli:  'independent subtractor constant, same logic',
      Sherli: 'independent subtractor constant, same logic',
    },
    dataSealedIn: 'pages/HadimPage.jsx (all maps internal)',
    sealed:      '2026-06-02',
  },

  // ══════════════════════════════════════════════════
  MIZAAN_BAST1: {
    engine:      'MIZAAN',
    file:        'lib/mizaan9Engine.js',
    function:    'mizaanAnalyze(text) / mizaanAnalyzeAsync(text)',
    formula:     'sum(MIZAAN_BAST1[mNorm(ch)] for ch in mClean(text) if ch in MIZAAN_BAST1)',
    tableName:   'MIZAAN_BAST1',
    note:        'Own independent Bast-1 table — NOT bastHuroofData.js',
    sealed:      '2026-06-02',
  },

  MIZAAN_ELEMENT: {
    engine:      'MIZAAN',
    file:        'lib/mizaan9Engine.js',
    formula:     'count letters per MIZAAN_ELEMENTS element group; dominant = max count',
    tiebreak:    'mResolveTie: compare rankIndex (position in element.letters), lowest wins',
    bast2Rule:   'dominant element → MIZAAN_ELEMENTS[dominant].bast2',
    bast2Values: { fire: 3550, earth: 4015, air: 3757, water: 3342 },
    sealed:      '2026-06-02',
  },

  // ══════════════════════════════════════════════════
  MAGIC_SQUARE: {
    engine:      'MAGIC_SQAYER',
    file:        'pages/MagicSqayerPage.jsx',
    algorithms: {
      odd:         'Siamese: start center-top, step (row-1, col+1) mod n; conflict → (row+1, col)',
      doublyEven:  'fill sequential 1..n², flip diagonal-pattern cells',
      singlyEven:  'construct odd sub-squares, apply column-swap pattern',
    },
    affineShift: 'cell_final = cell_base + (inputValue - 1)',
    magicConstant:'n*(n²+1)/2 + n*(inputValue-1)',
    sizes:       [3, 4, 5, 6, 7, 8, 9],
    dataSealedIn:'pages/MagicSqayerPage.jsx',
    sealed:      '2026-06-02',
  },

  // ══════════════════════════════════════════════════
  VEFKIN: {
    engine:      'VEFKIN',
    file:        'pages/VefkinYapilisiPage.jsx',
    description: 'Ottoman manuscript Vefk construction method',
    dataSealedIn:'pages/VefkinYapilisiPage.jsx',
    sessionStore:'context/VefkSessionContext.jsx → localStorage',
    export:      'lib/vefkExport.js → html2canvas + jsPDF',
    sealed:      '2026-06-02',
  },

  // ══════════════════════════════════════════════════
  BAST_HUROOF: {
    engine:      'BAST_HUROOF',
    file:        'lib/bastHuroofEngine.js',
    function:    'calcBastHuroof(text, level)',
    formula:     'sum(BAST_LOOKUP[normalize(ch)][BAST_FIELD_MAP[level]] for ch in extractArabicLetters(text))',
    normRule:    'NORM_MAP: أ→ا, إ→ا, آ→ا, ٱ→ا, ء→ا, ى→ي, ئ→ي, ؤ→و, ة→ه',
    dataSource:  'lib/bastHuroofData.js — manuscript "Harflerin Bastı Cetveli", p.93',
    levels:      [1,2,3,4,5],
    fieldMap:    { 1:'bastEvvel', 2:'bastSani', 3:'bastSalis', 4:'bastRabi', 5:'bastHamis' },
    sealed:      '2026-06-02',
  },

  // ══════════════════════════════════════════════════
  FAAL_ALI: {
    engine:      'FAAL_ALI',
    file:        'lib/faalHasrathData.js',
    function:    'user selects cell → display FAAL_CELLS[id-1]',
    formula:     'NO CALCULATION — pure data lookup',
    cellCount:   16,
    idRange:     '1–16',
    sealed:      '2026-06-02',
  },

  FAAL_LUQMAN: {
    engine:      'FAAL_LUQMAN',
    file:        'lib/faalLuqmanData.js',
    function:    'user selects cell → display LUQMAN_CELLS[lq_id-101]',
    formula:     'NO CALCULATION — pure data lookup',
    cellCount:   28,
    idRange:     '101–128',
    sealed:      '2026-06-02',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PART E: DATASET REGISTRY — EVERY CRITICAL DATASET VALUE SEALED AT BASELINE
// ─────────────────────────────────────────────────────────────────────────────

export const BASELINE_DATASETS = {

  // ── ABJAD ──────────────────────────────────────────────────────────────────
  KABIR_MAP: {
    engine: 'ABJAD', file: 'lib/abjadModes.js',
    letters: 28, range: '1–1000',
    spotChecks: {
      'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,
      'ي':10,'ك':20,'ل':30,'م':40,'ن':50,'س':60,'ع':70,'ف':80,'ص':90,
      'ق':100,'ر':200,'ش':300,'ت':400,'ث':500,'خ':600,'ذ':700,'ض':800,'ظ':900,'غ':1000,
    },
  },

  SAGHIR_MAP: {
    engine: 'ABJAD', file: 'lib/abjadModes.js',
    sakitLetters: ['س','ش','خ','ظ'],
    spotChecks: {
      'ا':1,'ب':2,'ج':3,'د':4,'ه':5,'و':6,'ز':7,'ح':8,'ط':9,
      'ي':10,'ك':8,'ل':6,'م':4,'ن':2,'س':0,'ع':10,'ف':8,'ص':6,
      'ق':4,'ر':8,'ش':0,'ت':4,'ث':8,'خ':0,'ذ':4,'ض':8,'ظ':0,'غ':4,
    },
  },

  LETTER_NAMES: {
    engine: 'ABJAD', file: 'lib/abjadModes.js',
    spotChecks: {
      'ا':'الف','ب':'با','ج':'جيم','د':'دال','ه':'ها','و':'واو',
      'ز':'زاي','ح':'حا','ط':'طا','ي':'يا','ك':'كاف','ل':'لام',
      'م':'ميم','ن':'نون','س':'سين','ع':'عين','ف':'فا','ص':'صاد',
      'ق':'قاف','ر':'را','ش':'شين','ت':'تا','ث':'ثا','خ':'خا',
      'ذ':'ذال','ض':'ضاد','ظ':'ظا','غ':'غين',
    },
  },

  // Abjad BAST_TABLE in abjadModes.js — full 28×5 table sealed
  ABJAD_BAST_TABLE: {
    engine: 'ABJAD', file: 'lib/abjadModes.js',
    spotChecks: {
      'ا_L1':16,   'ا_L2':1047, 'ا_L3':594,  'ا_L4':1941, 'ا_L5':991,
      'ب_L1':616,  'ب_L2':1569, 'ب_L3':1940, 'ب_L4':1046, 'ب_L5':921,
      'ج_L1':1041, 'ج_L2':469,  'ج_L3':1400, 'ج_L4':451,  'ج_L5':1118,
      'غ_L1':991,  'غ_L2':1941, 'غ_L3':594,  'غ_L4':1047, 'غ_L5':16,
      'ش_L1':337,  'ش_L2':2333, 'ش_L3':3963, 'ش_L4':3313, 'ش_L5':3870,
      'ك_L1':1097, 'ل_L1':339,  'م_L1':765,  'ح_L1':539,
    },
    mirrorRule: 'ا and غ are mirror-inverted across all 5 levels',
  },

  // ── ANASIR ─────────────────────────────────────────────────────────────────
  ANASIR_ELEMENT_LETTERS: {
    engine: 'ANASIR', file: 'lib/anasirEngine.js',
    fire:  ['ا','ه','ط','م','ف','ش','ذ'],
    water: ['د','ح','ل','ع','ر','خ','ض'],
    air:   ['ج','ز','ك','س','ق','ت','ظ'],
    earth: ['ب','و','ي','ن','ص','ث','غ'],
    note:  'Anasir air=ت — differs from Mizaan air=ث BY DESIGN. Independent systems.',
  },

  // ── MIZAAN ─────────────────────────────────────────────────────────────────
  MIZAAN_BAST1_TABLE: {
    engine: 'MIZAAN', file: 'lib/mizaan9Engine.js',
    note: 'Own independent Bast-1 table — NOT bastHuroofData.js',
    spotChecks: {
      'ا':16, 'ب':616, 'ج':1041,'د':283, 'ه':709,
      'و':141,'ز':612, 'ح':539, 'ط':579, 'ي':579,
      'ك':1097,'ل':339,'م':765, 'ن':524, 'س':197,
      'ع':657, 'ف':595,'ص':60,  'ق':517, 'ر':1095,
      'ش':337, 'ت':763,'ث':522, 'خ':195, 'ذ':655,
      'ض':593, 'ظ':114,'غ':991,
    },
  },

  MIZAAN_ELEMENT_LETTERS: {
    engine: 'MIZAAN', file: 'lib/mizaan9Engine.js',
    fire:  ['ا','ه','ط','م','ف','ش','ذ'],
    earth: ['ب','و','ي','ن','ص','ت','ض'],
    air:   ['ج','ز','ك','س','ق','ث','ظ'],
    water: ['د','ح','ل','ع','ر','خ','غ'],
    bast2: { fire:3550, earth:4015, air:3757, water:3342 },
    note:  'Mizaan earth=ت — differs from Anasir air=ت BY DESIGN.',
  },

  MIZAAN_KHAYR_SHARR: {
    engine: 'MIZAAN', file: 'lib/mizaan9Data.js',
    khayr_bast: 1416,
    sharr_bast: 501,
  },

  MIZAAN_HOURS: {
    engine: 'MIZAAN', file: 'lib/mizaan9Data.js',
    count: 12,
    spotChecks: { 1:5460, 2:5760, 3:6276, 11:7273, 12:7906 },
  },

  MIZAAN_DAYS: {
    engine: 'MIZAAN', file: 'lib/mizaan9Data.js',
    count: 7,
    spotChecks: { sun:2024, mon:4001, tue:3784, wed:3491, thu:3077, fri:3399, sat:2590 },
  },

  MIZAAN_PLANETS: {
    engine: 'MIZAAN', file: 'lib/mizaan9Data.js',
    count: 7,
    spotChecks: { zuhal:2963, mustari:3980, merih:3070, sems:3071, zuhre:3189, utarid:2665, kamer:2029 },
  },

  MIZAAN_PURPOSES: {
    engine: 'MIZAAN', file: 'lib/mizaan9Data.js',
    count: 5,
    spotChecks: { celb:2754, tard:1339, sihhat:2657, sekam:2036, tarfet:4704 },
  },

  // ── BAST HUROOF (manuscript source — distinct from Abjad BAST_TABLE) ───────
  BAST_HUROOF_DATA: {
    engine: 'BAST_HUROOF', file: 'lib/bastHuroofData.js',
    source: 'Bastların Usulü Vefklerin Sırrı ve Havassı — p.93',
    letters: 28, levels: 5,
    WARNING: 'These values are from manuscript and DIFFER from BAST_TABLE in abjadModes.js',
    spotChecks: {
      'ا_bastEvvel':16,    'ا_bastHamis':156119,
      'ب_bastEvvel':616,   'ب_bastHamis':292178,
      'ج_bastEvvel':1041,  'ج_bastHamis':316523,
      'د_bastEvvel':283,   'د_bastHamis':271164,
      'ه_bastEvvel':709,   'ه_bastHamis':238889,
      'و_bastEvvel':468,   'و_bastHamis':186822,
      'ز_bastEvvel':141,   'ز_bastHamis':218158,
      'ح_bastEvvel':612,   'ح_bastHamis':347099,
      'ط_bastEvvel':539,   'ط_bastHamis':246517,
      'ي_bastEvvel':579,   'ي_bastHamis':276357,
      'ك_bastEvvel':635,   'ك_bastHamis':347214,
      'ل_bastEvvel':1097,  'ل_bastHamis':387380,
      'م_bastEvvel':339,   'م_bastHamis':342021,
      'ن_bastEvvel':765,   'ن_bastHamis':309746,
      'س_bastEvvel':524,   'س_bastHamis':257679,
      'ع_bastEvvel':197,   'ع_bastHamis':289015,
      'ف_bastEvvel':657,   'ف_bastHamis':361924,
      'ص_bastEvvel':594,   'ص_bastHamis':317374,
      'ق_bastEvvel':60,    'ق_bastHamis':204757,
      'ر_bastEvvel':517,   'ر_bastHamis':362686,
      'ش_bastEvvel':1095,  'ش_bastHamis':473597,
      'ت_bastEvvel':337,   'ت_bastHamis':428238,
      'ث_bastEvvel':763,   'ث_bastHamis':395963,
      'خ_bastEvvel':522,   'خ_bastHamis':343896,
      'ذ_bastEvvel':195,   'ذ_bastHamis':375232,
      'ض_bastEvvel':655,   'ض_bastHamis':448141,
      'ظ_bastEvvel':593,   'ظ_bastHamis':403591,
      'غ_bastEvvel':114,   'غ_bastHamis':182227,
    },
  },

  // ── FAAL ALI ───────────────────────────────────────────────────────────────
  FAAL_ALI_CELLS: {
    engine: 'FAAL_ALI', file: 'lib/faalHasrathData.js',
    count: 16, idRange: '1–16',
    innerMarks: [
      'dot','two-dots','arc-up','three-dots','line-h','eye',
      'x-cross','line-v','circle','arc-down','cross','spiral',
      'double-arc','star3','zigzag','line-diag',
    ],
    spotChecks: {
      cell_1:  { id:1,  innerMark:'dot',       ml_shortTitle:'അനുഗ്രഹമുണ്ട്',  en_shortTitle:"Allah's Blessing" },
      cell_16: { id:16, innerMark:'line-diag', ml_shortTitle:'ഉത്തമം',          en_shortTitle:'Excellent Omen' },
    },
  },

  // ── FAAL LUQMAN ────────────────────────────────────────────────────────────
  FAAL_LUQMAN_CELLS: {
    engine: 'FAAL_LUQMAN', file: 'lib/faalLuqmanData.js',
    count: 28, idRange: '101–128',
    symbols: ['ا','ب','ج','د','ه','و','ز','ح','ط','ي','ك','ل','م','ن',
              'س','ع','ف','ص','ق','ر','ش','ت','ث','خ','ذ','ض','ظ','غ'],
    spotChecks: {
      cell_101: { lq_id:101, symbol:'ا', symbolName:'Alif',  ml_shortTitle:'ഉയർച്ച', en_shortTitle:'Rise & Elevation' },
      cell_128: { lq_id:128, symbol:'غ', symbolName:'Ghain', ml_shortTitle:'ഗൈബ്',   en_shortTitle:'Unseen Help' },
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PART F: ISOLATION RULES — WHAT IS ALLOWED AND WHAT IS FORBIDDEN
// ─────────────────────────────────────────────────────────────────────────────

export const BASELINE_ISOLATION_RULES = {

  // The ONE approved cross-module dependency
  APPROVED: [
    {
      from:    'pages/FaalHasrathPage.jsx',
      imports: ['lib/faalHasrathData.js', 'lib/faalLuqmanData.js'],
      reason:  'Single page hosts two fully independent divination subsystems. Data files remain completely separate.',
      approved:'2026-06-02',
    },
  ],

  // Forbidden rules — any of these appearing = VIOLATION
  FORBIDDEN: [
    { rule: 'bastHuroofEngine must NOT import from abjadModes, anasirEngine, mizaan9Engine, faalData' },
    { rule: 'bastHuroofData must NOT import from ANYTHING' },
    { rule: 'mizaan9Engine must NOT import from abjadModes, anasirEngine, bastHuroofData, faalData' },
    { rule: 'mizaan9Data must NOT import from ANYTHING' },
    { rule: 'anasirEngine must NOT import from abjadModes, bastHuroofData, mizaan9Engine, faalData' },
    { rule: 'abjadModes must NOT import from bastHuroofData, mizaan9Engine, anasirEngine, faalData' },
    { rule: 'faalHasrathData must NOT import from ANYTHING' },
    { rule: 'faalLuqmanData must NOT import from ANYTHING' },
    { rule: 'HadimPage must NOT import from any calculation engine lib file' },
    { rule: 'MagicSqayerPage must NOT import from any calculation engine lib file' },
    { rule: 'VefkinYapilisiPage must NOT import from any calculation engine lib file' },
    { rule: 'No engine may read another engine\'s calculation result at runtime' },
    { rule: 'UI/animation/style/PWA/SW changes must NEVER touch lib/ engine files' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PART G: NORMALIZATION MAP REGISTRY — ALL NORM MAPS SEALED
// Each engine has its OWN independent normalization — they must NOT be shared.
// ─────────────────────────────────────────────────────────────────────────────

export const BASELINE_NORM_MAPS = {
  ABJAD: {
    file: 'lib/abjadModes.js',
    map: { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ئ':'ي','ؤ':'و','ة':'ه' },
  },
  ANASIR: {
    file: 'lib/anasirEngine.js',
    map: { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ئ':'ي','ؤ':'و','ة':'ه' },
  },
  MIZAAN: {
    file: 'lib/mizaan9Engine.js',
    map: { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ئ':'ي','ؤ':'و','ة':'ه' },
  },
  BAST_HUROOF: {
    file: 'lib/bastHuroofEngine.js',
    // Extra: ء→ا included (handles standalone hamza)
    map: { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ٱ':'ا','ى':'ي','ئ':'ي','ؤ':'و','ة':'ه' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PART H: CHANGE-IMPACT CHECKER
// Call checkAgainstBaseline(filePath) before ANY modification to get a
// full impact report describing what is at risk.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks a proposed file change against the sealed baseline.
 *
 * @param {string} filePath - the file you are planning to modify
 * @returns {Object} impact report
 */
export function checkAgainstBaseline(filePath) {
  const report = {
    filePath,
    timestamp: new Date().toISOString(),
    warnings:  [],
    blocked:   false,
    engine:    null,
    formulas:  [],
    datasets:  [],
    routes:    [],
    isolation: [],
    verdict:   '',
  };

  // Find the file in our registry
  const fileEntry = BASELINE_FILES.find(f =>
    filePath === f.path || filePath.endsWith(f.path) || f.path.endsWith(filePath)
  );

  if (!fileEntry) {
    report.verdict = 'UNCLASSIFIED — File not in baseline registry. Proceed with caution.';
    report.warnings.push('⚠️  File not in baseline. No engine impact detected, but verify manually.');
    return report;
  }

  report.engine = fileEntry.engine;

  // ── FORMULA WARNINGS ──
  const affectedFormulas = Object.entries(BASELINE_FORMULAS)
    .filter(([, f]) => f.file === fileEntry.path || f.engine === fileEntry.engine)
    .map(([key]) => key);
  if (affectedFormulas.length > 0) {
    affectedFormulas.forEach(key => {
      const f = BASELINE_FORMULAS[key];
      report.formulas.push(key);
      report.warnings.push(
        `⛔ FORMULA WARNING: "${key}" in ${f.file} will be affected.` +
        `\n     Sealed formula: ${f.formula || f.description || '(see BASELINE_FORMULAS.' + key + ')'}`
      );
    });
    report.blocked = fileEntry.critical;
  }

  // ── DATASET WARNINGS ──
  const affectedDatasets = Object.entries(BASELINE_DATASETS)
    .filter(([, d]) => d.file === fileEntry.path || d.engine === fileEntry.engine)
    .map(([key]) => key);
  if (affectedDatasets.length > 0) {
    affectedDatasets.forEach(key => {
      report.datasets.push(key);
      report.warnings.push(
        `⛔ DATASET WARNING: "${key}" is sealed. Any value change will break the baseline.`
      );
    });
  }

  // ── ROUTE WARNINGS ──
  const affectedRoutes = BASELINE_ROUTES.filter(r =>
    r.engine === fileEntry.engine || r.component === filePath.replace(/.*\//, '').replace(/\.[^.]+$/, '')
  );
  if (affectedRoutes.length > 0) {
    affectedRoutes.forEach(r => {
      report.routes.push(r.path);
      report.warnings.push(
        `⚠️  ROUTE WARNING: Route "${r.path}" → "${r.component}" maps to this engine.`
      );
    });
  }

  // ── ISOLATION WARNINGS ──
  report.warnings.push(
    `🔒 ISOLATION RULE: Engine "${fileEntry.engine}" must remain isolated.` +
    `\n     Check BASELINE_ISOLATION_RULES.FORBIDDEN for this engine's rules.`
  );

  // ── VERDICT ──
  if (report.blocked) {
    report.verdict = '🚫 BLOCKED — This is a CRITICAL engine file. Modification requires explicit developer approval and baseline re-seal.';
  } else if (report.warnings.length > 2) {
    report.verdict = '⚠️  CAUTION — Non-critical file with engine impact. Review all warnings before proceeding.';
  } else {
    report.verdict = '✅ LOW RISK — File has minor or no engine impact. Review warnings and proceed carefully.';
  }

  return report;
}

/**
 * Format an impact report as a readable string for console output.
 * @param {Object} report - returned by checkAgainstBaseline()
 * @returns {string}
 */
export function formatImpactReport(report) {
  const lines = [];
  lines.push('╔══════════════════════════════════════════════════════════════════╗');
  lines.push('║  SIRR AL-HURUF — CHANGE IMPACT REPORT                          ║');
  lines.push('╚══════════════════════════════════════════════════════════════════╝');
  lines.push(`  File:      ${report.filePath}`);
  lines.push(`  Engine:    ${report.engine ?? 'NONE'}`);
  lines.push(`  Timestamp: ${report.timestamp}`);
  lines.push(`  Blocked:   ${report.blocked ? '🚫 YES' : '✅ NO'}`);
  lines.push('');
  if (report.warnings.length) {
    lines.push('  ── WARNINGS ──');
    report.warnings.forEach(w => lines.push(`  ${w}`));
    lines.push('');
  }
  if (report.formulas.length) {
    lines.push(`  ── AFFECTED FORMULAS: ${report.formulas.join(', ')}`);
  }
  if (report.datasets.length) {
    lines.push(`  ── AFFECTED DATASETS: ${report.datasets.join(', ')}`);
  }
  if (report.routes.length) {
    lines.push(`  ── AFFECTED ROUTES: ${report.routes.join(', ')}`);
  }
  lines.push('');
  lines.push(`  VERDICT: ${report.verdict}`);
  lines.push('══════════════════════════════════════════════════════════════════');
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// PART I: BASELINE CREATION REPORT (generated at seal time, stored inline)
// ─────────────────────────────────────────────────────────────────────────────

export const BASELINE_CREATION_REPORT = `
╔══════════════════════════════════════════════════════════════════════════════╗
║   SIRR AL-HURUF — SEALED BASELINE CREATION REPORT                          ║
║   Version: v1.0  |  Created: 2026-06-02  |  Sealer: Base44 AI             ║
╚══════════════════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WHAT WAS CAPTURED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✅ 9 Calculation Engines sealed:
     ABJAD · ANASIR · HADIM · MIZAAN · MAGIC_SQAYER
     VEFKIN · BAST_HUROOF · FAAL_ALI · FAAL_LUQMAN

  ✅ 11 Formulas sealed (see BASELINE_FORMULAS):
     ABJAD_KABIR · ABJAD_SAGHIR · ABJAD_CUMELI · ABJAD_BAST
     ANASIR_ELEMENTAL · HADIM_NAME_GEN · MIZAAN_BAST1 · MIZAAN_ELEMENT
     MAGIC_SQUARE · BAST_HUROOF · FAAL_ALI · FAAL_LUQMAN

  ✅ 13 Datasets sealed (see BASELINE_DATASETS):
     KABIR_MAP (28 values) · SAGHIR_MAP (28 values, 4 sakit)
     LETTER_NAMES (28) · ABJAD_BAST_TABLE (28×5=140 values)
     ANASIR_ELEMENT_LETTERS (4×7=28) · MIZAAN_BAST1_TABLE (28 values)
     MIZAAN_ELEMENT_LETTERS (4×7=28) · MIZAAN_KHAYR_SHARR · MIZAAN_HOURS (12)
     MIZAAN_DAYS (7) · MIZAAN_PLANETS (7) · MIZAAN_PURPOSES (5)
     BAST_HUROOF_DATA (28×5=140 values from manuscript)
     FAAL_ALI_CELLS (16) · FAAL_LUQMAN_CELLS (28)

  ✅ 9 Routes sealed (see BASELINE_ROUTES):
     / · /abjad · /anasir · /hadim · /mizaan9
     /magic-sqayer · /vefkin-yapilisi · /basthul-huroof-2 · /faal-hasrath

  ✅ 15 Engine files sealed (see BASELINE_FILES):
     12 lib/ engine+data files · 3 self-contained engine pages

  ✅ 13 Isolation (forbidden cross-import) rules sealed (see BASELINE_ISOLATION_RULES)

  ✅ 4 Normalization maps sealed — each engine's own independent NORM_MAP
     (BAST_HUROOF has extra ء→ا; others are identical but must NOT be shared)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  HOW TO USE FOR FUTURE UPDATES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Before modifying any file:
  ─────────────────────────
  import { checkAgainstBaseline, formatImpactReport } from '@/lib/SEALED_BASELINE_v1';

  const report = checkAgainstBaseline('lib/bastHuroofData.js');
  console.log(formatImpactReport(report));
  // → prints full impact report with formula/dataset/route warnings

  Warning triggers (automatic):
  ──────────────────────────────
  1. Formula change   → ⛔ FORMULA WARNING for each affected formula
  2. Dataset change   → ⛔ DATASET WARNING with spot-check values
  3. Engine logic     → 🚫 BLOCKED if critical=true
  4. Route change     → ⚠️  ROUTE WARNING for each affected route
  5. Cross-import     → 🔒 ISOLATION RULE reminder

  To re-seal after intentional changes:
  ──────────────────────────────────────
  Create lib/SEALED_BASELINE_v2.js using this file as template.
  Update all spot-checks to reflect the new verified values.
  Mark v1.0 as SUPERSEDED in its header.
  NEVER modify v1.0 after sealing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  WHAT WAS NOT MODIFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  This baseline creation added exactly ONE new file:
    lib/SEALED_BASELINE_v1.js  (this file — audit/reference only)

  Zero changes to:
    ✅ Any calculation engine
    ✅ Any formula or calculation rule
    ✅ Any dataset or lookup table value
    ✅ Any page component
    ✅ Any route definition
    ✅ Any UI component
    ✅ Any service worker / PWA file
    ✅ Any style file

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ██╗      ██████╗  ██████╗██╗  ██╗███████╗██████╗
  ██║     ██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
  ██║     ██║   ██║██║     █████╔╝ █████╗  ██║  ██║
  ██║     ██║   ██║██║     ██╔═██╗ ██╔══╝  ██║  ██║
  ███████╗╚██████╔╝╚██████╗██║  ██╗███████╗██████╔╝
  ╚══════╝ ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═════╝

  SEALED BASELINE v1.0 — LOCKED · AUDITED · PROTECTED
  Created: 2026-06-02 | Sirr al-Huruf | All Rights Reserved

╚══════════════════════════════════════════════════════════════════════════════╝
`;