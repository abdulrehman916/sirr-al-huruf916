// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT-LOCKED ABJAD/BAST DATA
// ═══════════════════════════════════════════════════════════════
// Source: Manuscript pages 13, 14, 15, 41, 42, 43
// This data is LOCKED and must not be modified without manual unlock.
// These values are the CANONICAL AUTHORITY for the Abjad Bast Audit page.
// ═══════════════════════════════════════════════════════════════

export const MANUSCRIPT_METADATA = {
  sourcePages: [13, 14, 15, 41, 42, 43],
  locked: true,
  lockDate: "2026-06-12",
  note: "Locked to manuscript source pages 13, 14, 15, 41, 42, 43. Future edits must not overwrite these values unless manually unlocked.",
};

// ═══════════════════════════════════════════════════════════════
// 1. EBCEDİ KEBİR (Ebcedi Kebir) - Page 15
// ═══════════════════════════════════════════════════════════════
export const EBCEDI_KEBIR = {
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
};

// ═══════════════════════════════════════════════════════════════
// 2. EBCEDİ SAĞİR (Ebcedi Sağir) - Page 14
// ═══════════════════════════════════════════════════════════════
export const EBCEDI_SAGHIR = {
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
};

export const SAKIT_LETTERS = ['س', 'ش', 'خ', 'ظ'];

// ═══════════════════════════════════════════════════════════════
// 3. HARFLERİN BASTI CETVELİ (1st-5th Bast) - Pages 41, 42, 43
// ═══════════════════════════════════════════════════════════════
export const BAST_MANUSCRIPT = {
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
};

// ═══════════════════════════════════════════════════════════════
// 4. LETTER NAMES (for Cümeli Kebir display) - Page 15
// ═══════════════════════════════════════════════════════════════
export const LETTER_NAMES_CUMELI = {
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
};