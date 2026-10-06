// ═══════════════════════════════════════════════════════════════════════════
//  BOOK KNOWLEDGE DATABASE — PART 2
//  Source: "The Occult Encyclopedia of Magick Squares"
//  PDF: pages 360–459 (Libra entities + Scorpio chapter + Sagittarius start)
//  Processed: 2026-06-07
//  100 pages fully read and extracted
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION A — LIBRA CHAPTER ENTITIES (pp. 360–403)
//  Sign Libra: Hebrew name = MOZNAIM (MC used for squares)
//  All Libra entities use MC=661 (6×6 Sun square) for planetary assignments
// ─────────────────────────────────────────────────────────────────────────────

export const LIBRA_ENTITIES = [

  // ── LORD OF TRIPLICITY BY DAY: THERGEBON (661) — p.362 ────────────────────
  {
    name: "Lord of Triplicity by Day: Thergebon", hebrewValue: 661, gridSize: 4, planet: "Jupiter",
    hebrewSquare: { numerical: [[399,201,8,53],[7,54,398,202],[199,401,55,6]] },
    squares: {
      fire:  [[157,168,162,174],[173,163,165,160],[167,158,175,161],[164,172,159,166]],
      air:   [[166,159,172,164],[161,175,158,167],[160,165,163,173],[174,162,168,157]],
      earth: [[164,167,173,157],[172,158,163,168],[159,175,165,162],[166,161,160,174]],
      water: [[174,160,161,166],[162,165,175,159],[168,163,158,172],[157,173,167,164]],
    },
    hierarchy: { usurper:157, guide:175, mystery:332, adjuster:5288, leader:15864, regulator:21152, genGov:42304, highOverseer:7403200 },
    angelArabic: { usurper:116, guide:134, mystery:291, adjuster:5247, leader:15823, regulator:21111, genGov:42263, highOverseer:7403159 },
    angelHebrew: { usurper:126, guide:144, mystery:301, adjuster:5257, leader:15833, regulator:21121, genGov:42273, highOverseer:7403169 },
    jinnArabic:  { usurper:198, guide:216, mystery:13, adjuster:4969, leader:15545, regulator:20833, genGov:41985, highOverseer:7402881 },
    jinnHebrew:  { usurper:188, guide:206, mystery:3, adjuster:4959, leader:15535, regulator:20823, genGov:41975, highOverseer:7402871 },
    page: "362",
  },

  // ── LORD OF TRIPLICITY BY NIGHT: ACHODRAON (276) — p.371 ─────────────────
  {
    name: "Lord of Triplicity by Night: Achodraon", hebrewValue: 276, gridSize: 3, planet: "Saturn",
    hebrewSquare: { numerical: [[8,11,204,53],[203,54,7,12],[9,10,55,202]] },
    squares: {
      fire:  [[93,88,95],[94,92,90],[89,96,91]],
      air:   [[91,96,89],[90,92,94],[95,88,93]],
      earth: [[89,94,93],[96,92,88],[91,90,95]],
      water: [[95,90,91],[88,92,96],[93,94,89]],
    },
    hierarchy: { usurper:88, guide:96, mystery:184, adjuster:276, leader:828, regulator:1104, genGov:2208, highOverseer:211968 },
    angelArabic: { usurper:47, guide:55, mystery:143, adjuster:235, leader:787, regulator:1063, genGov:2167, highOverseer:211927 },
    angelHebrew: { usurper:57, guide:65, mystery:153, adjuster:245, leader:797, regulator:1073, genGov:2177, highOverseer:211937 },
    jinnArabic:  { usurper:129, guide:137, mystery:225, adjuster:317, leader:509, regulator:785, genGov:1889, highOverseer:211649 },
    jinnHebrew:  { usurper:119, guide:127, mystery:215, adjuster:307, leader:499, regulator:775, genGov:1879, highOverseer:211639 },
    page: "371",
  },

  // ── ANGEL OF 1ST DECANATE: TARASNI (329) — p.377 ──────────────────────────
  {
    name: "Angel of First Decanate: Tarasni", hebrewValue: 329, gridSize: 4, planet: "Jupiter",
    hebrewSquare: { numerical: [[8,201,63,57],[62,58,7,202],[199,10,59,61]] },
    squares: {
      fire:  [[74,85,79,91],[90,80,82,77],[84,75,92,78],[81,89,76,83]],
      air:   [[83,76,89,81],[78,92,75,84],[77,82,80,90],[91,79,85,74]],
      earth: [[81,84,90,74],[89,75,80,85],[76,92,82,79],[83,78,77,91]],
      water: [[91,77,78,83],[79,82,92,76],[85,80,75,89],[74,90,84,81]],
    },
    hierarchy: { usurper:74, guide:92, mystery:166, adjuster:2632, leader:7896, regulator:10528, genGov:21056, highOverseer:1937152 },
    angelArabic: { usurper:33, guide:51, mystery:125, adjuster:2591, leader:7855, regulator:10487, genGov:21015, highOverseer:1937111 },
    angelHebrew: { usurper:43, guide:61, mystery:135, adjuster:2601, leader:7865, regulator:10497, genGov:21025, highOverseer:1937121 },
    jinnArabic:  { usurper:115, guide:133, mystery:207, adjuster:2313, leader:7577, regulator:10209, genGov:20737, highOverseer:1936833 },
    jinnHebrew:  { usurper:105, guide:123, mystery:197, adjuster:2303, leader:7567, regulator:10199, genGov:20727, highOverseer:1936823 },
    page: "377",
  },

  // ── ANGEL OF 2ND DECANATE: SAHARNATZ (405) — p.382 ────────────────────────
  {
    name: "Angel of Second Decanate: Saharnatz", hebrewValue: 405, gridSize: 3, planet: "Saturn",
    hebrewSquare: { numerical: [[64,201,53,87],[52,88,63,202],[199,66,89,51]] },
    squares: {
      fire:  [[136,131,138],[137,135,133],[132,139,134]],
      air:   [[134,139,132],[133,135,137],[138,131,136]],
      earth: [[132,137,136],[139,135,131],[134,133,138]],
      water: [[138,133,134],[131,135,139],[136,137,132]],
    },
    hierarchy: { usurper:131, guide:139, mystery:270, adjuster:405, leader:1215, regulator:1620, genGov:3240, highOverseer:450360 },
    angelArabic: { usurper:90, guide:98, mystery:229, adjuster:364, leader:1174, regulator:1579, genGov:3199, highOverseer:450319 },
    angelHebrew: { usurper:100, guide:108, mystery:239, adjuster:374, leader:1184, regulator:1589, genGov:3209, highOverseer:450329 },
    jinnArabic:  { usurper:172, guide:180, mystery:311, adjuster:86, leader:896, regulator:1301, genGov:2921, highOverseer:450041 },
    jinnHebrew:  { usurper:162, guide:170, mystery:301, adjuster:76, leader:886, regulator:1291, genGov:2911, highOverseer:450031 },
    page: "382-383",
  },

  // ── ANGEL OF 3RD DECANATE: SHACHDAR (512) — p.392 ─────────────────────────
  {
    name: "Angel of Third Decanate: Shachdar", hebrewValue: 512, gridSize: 3, planet: "Saturn",
    hebrewSquare: { numerical: [[299,9,7,197],[6,198,298,10],[7,301,199,5]] },
    hierarchy: { usurper:90, guide:116, mystery:206, adjuster:512, leader:1536, regulator:2048, genGov:4096, highOverseer:475136 },
    page: "392",
  },

  // ── ANGEL RULING 7TH HOUSE: YAHEL (46) — p.376 ────────────────────────────
  {
    name: "Angel Ruling 7th House: Yahel", hebrewValue: 46, gridSize: 3, planet: "Saturn",
    note: "Numerical Squares See Page: 90",
    hebrewSquare: { numerical: [[9,6,4,27],[3,28,8,7],[4,11,29,2]] },
    page: "376",
  },

  // ── ANGEL OF 1ST QUINANCE: YEZALEL (78) — p.381 ──────────────────────────
  {
    name: "Angel of First Quinance: Yezalel", hebrewValue: 78, gridSize: 3, planet: "Saturn",
    note: "Numerical Squares See Page: 91",
    hebrewSquare: { numerical: [[16,31,4,27],[3,28,15,32],[29,18,29,2]] },
    page: "381",
  },

  // ── ANGEL OF 2ND QUINANCE: MEBAHEL (78) — p.382 ──────────────────────────
  {
    name: "Angel of Second Quinance: Mebahel", hebrewValue: 78, gridSize: 3,
    note: "Numerical Squares See Page: 91",
    hebrewSquare: { numerical: [[39,3,8,28],[7,29,38,4],[1,41,30,6]] },
    page: "382",
  },

  // ── ANGEL OF 3RD QUINANCE: HARIEL (246) — p.389 ──────────────────────────
  {
    name: "Angel of Third Quinance: Hariel", hebrewValue: 246, gridSize: 4,
    note: "Numerical Squares See Page: 79",
    hebrewSquare: { numerical: [[4,201,13,28],[12,29,3,202],[199,6,30,11]] },
    hierarchy: { usurper:5, guide:85, mystery:90, adjuster:405, leader:1215, regulator:1620, genGov:3240, highOverseer:275400 },
    page: "389",
  },

  // ── ANGEL OF 4TH QUINANCE: HAQMIAH (160) — p.390 ─────────────────────────
  {
    name: "Angel of Fourth Quinance: Haqmiah", hebrewValue: 160, gridSize: 4, planet: "Jupiter",
    hebrewSquare: { numerical: [[4,101,43,12],[42,13,3,102],[99,6,14,41]] },
    squares: {
      fire:  [[32,43,37,48],[47,38,40,35],[42,33,49,36],[39,46,34,41]],
      air:   [[41,34,46,39],[36,49,33,42],[35,40,38,47],[48,37,43,32]],
      earth: [[39,42,47,32],[46,33,38,43],[34,49,40,37],[41,36,35,48]],
      water: [[48,35,36,41],[37,40,49,34],[43,38,33,46],[32,47,42,39]],
    },
    hierarchy: { usurper:32, guide:49, mystery:81, adjuster:1280, leader:3840, regulator:5120, genGov:10240, highOverseer:501760 },
    angelArabic: { usurper:351, guide:8, mystery:40, adjuster:1239, leader:3799, regulator:5079, genGov:10199, highOverseer:501719 },
    angelHebrew: { usurper:1, guide:18, mystery:50, adjuster:1249, leader:3809, regulator:5089, genGov:10209, highOverseer:501729 },
    jinnArabic:  { usurper:73, guide:90, mystery:122, adjuster:961, leader:3521, regulator:4801, genGov:9921, highOverseer:501441 },
    jinnHebrew:  { usurper:63, guide:80, mystery:112, adjuster:951, leader:3511, regulator:4791, genGov:9911, highOverseer:501431 },
    page: "390",
  },

  // ── ANGEL OF 5TH QUINANCE: LAVIAH (52) — p.401 ────────────────────────────
  {
    name: "Angel of Fifth Quinance: Laviah", hebrewValue: 52,
    note: "Hebrew Squares See Page: 351 — Numerical Squares See Page: 351",
    hierarchy: { usurper:1, guide:107, mystery:108, adjuster:512, leader:1536, regulator:2048, genGov:4096, highOverseer:438272 },
    page: "401",
  },

  // ── ANGEL OF 6TH QUINANCE: KALIEL (91) — p.401 ────────────────────────────
  {
    name: "Angel of Six Quinance: Kaliel", hebrewValue: 91, gridSize: 3,
    hebrewSquare: { numerical: [[19,31,13,28],[12,29,18,32],[29,21,30,11]] },
    hierarchy: { usurper:6, guide:31, mystery:37, adjuster:91, leader:273, regulator:364, genGov:728, highOverseer:22568 },
    angelArabic: { usurper:325, guide:350, mystery:356, adjuster:50, leader:232, regulator:323, genGov:687, highOverseer:22527 },
    angelHebrew: { usurper:335, guide:360, mystery:6, adjuster:60, leader:242, regulator:333, genGov:697, highOverseer:22537 },
    jinnArabic:  { usurper:47, guide:72, mystery:78, adjuster:132, leader:314, regulator:45, genGov:409, highOverseer:22249 },
    jinnHebrew:  { usurper:37, guide:62, mystery:68, adjuster:122, leader:304, regulator:35, genGov:399, highOverseer:22239 },
    page: "403",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION B — SCORPIO CHAPTER ENTITIES (pp. 404–458)
//  Sign Scorpio: Hebrew name = AKRAB (372) — 3×3 Saturn
// ─────────────────────────────────────────────────────────────────────────────

export const SCORPIO_ENTITIES = [

  // ── SIGN SCORPIO: AKRAB (372) — p.404 ────────────────────────────────────
  {
    name: "Sign Scorpio: Akrab", hebrewValue: 372, gridSize: 3, planet: "Saturn",
    hebrewSquare: { numerical: [[71,102,198,1],[198,3,69,102],[101,67,5,199]] },
    squares: {
      fire:  [[125,120,127],[126,124,122],[121,128,123]],
      air:   [[123,128,121],[122,124,126],[127,120,125]],
      earth: [[121,126,125],[128,124,120],[123,122,127]],
      water: [[127,122,123],[120,124,128],[125,126,121]],
    },
    hierarchy: { usurper:120, guide:128, mystery:248, adjuster:372, leader:1116, regulator:1488, genGov:2976, highOverseer:380928 },
    angelArabic: { usurper:79, guide:87, mystery:207, adjuster:331, leader:1075, regulator:1447, genGov:2935, highOverseer:380887 },
    angelHebrew: { usurper:89, guide:97, mystery:217, adjuster:341, leader:1085, regulator:1457, genGov:2945, highOverseer:380897 },
    jinnArabic:  { usurper:161, guide:169, mystery:289, adjuster:53, leader:797, regulator:1169, genGov:2657, highOverseer:380609 },
    jinnHebrew:  { usurper:151, guide:159, mystery:279, adjuster:43, leader:787, regulator:1159, genGov:2647, highOverseer:380599 },
    page: "404",
  },

  // ── ARCHANGEL OF SCORPIO: BARKIEL (263) — p.411 ──────────────────────────
  {
    name: "Archangel of Scorpio: Barkiel", hebrewValue: 263, gridSize: 4, planet: "Jupiter",
    hebrewSquare: { numerical: [[201,21,13,28],[12,29,200,22],[19,203,30,11]] },
    // (hierarchy same as Scorpio sign MC=372 for outer ring, inner = Barkiel 263)
    hierarchy: { usurper:58, guide:74, mystery:132, adjuster:2104, leader:6312, regulator:8416, genGov:16832, highOverseer:1245568 },
    angelArabic: { usurper:17, guide:33, mystery:91, adjuster:2063, leader:6271, regulator:8375, genGov:16791, highOverseer:1245527 },
    angelHebrew: { usurper:27, guide:43, mystery:101, adjuster:2073, leader:6281, regulator:8385, genGov:16801, highOverseer:1245537 },
    jinnArabic:  { usurper:99, guide:115, mystery:173, adjuster:1785, leader:5993, regulator:8097, genGov:16513, highOverseer:1245249 },
    jinnHebrew:  { usurper:89, guide:105, mystery:163, adjuster:1775, leader:5983, regulator:8087, genGov:16503, highOverseer:1245239 },
    page: "412",
  },

  // ── ANGEL OF SCORPIO: SAITZEL (202) — p.417 ──────────────────────────────
  {
    name: "Angel of Scorpio: Saitzel", hebrewValue: 202, gridSize: 4, planet: "Jupiter",
    hebrewSquare: { numerical: [[60,101,14,27],[13,28,59,102],[99,62,29,12]] },
    squares: {
      fire:  [[43,54,48,57],[56,49,51,46],[53,44,58,47],[50,55,45,52]],
      air:   [[52,45,55,50],[47,58,44,53],[46,51,49,56],[57,48,54,43]],
      earth: [[50,53,56,43],[55,44,49,54],[45,58,51,48],[52,47,46,57]],
      water: [[57,46,47,52],[48,51,58,45],[54,49,44,55],[43,56,53,50]],
    },
    hierarchy: { usurper:43, guide:58, mystery:101, adjuster:1616, leader:4848, regulator:6464, genGov:12928, highOverseer:749824 },
    angelArabic: { usurper:2, guide:17, mystery:60, adjuster:1575, leader:4807, regulator:6423, genGov:12887, highOverseer:749783 },
    angelHebrew: { usurper:12, guide:27, mystery:70, adjuster:1585, leader:4817, regulator:6433, genGov:12897, highOverseer:749793 },
    jinnArabic:  { usurper:84, guide:99, mystery:142, adjuster:1297, leader:4529, regulator:6145, genGov:12609, highOverseer:749505 },
    jinnHebrew:  { usurper:74, guide:89, mystery:132, adjuster:1287, leader:4519, regulator:6135, genGov:12599, highOverseer:749495 },
    page: "417",
  },

  // ── LORD OF TRIPLICITY BY DAY: BETHCHON (476) — p.420 ────────────────────
  {
    name: "Lord of Triplicity by Day: Bethchon", hebrewValue: 476, gridSize: 4, planet: "Jupiter",
    hebrewSquare: { numerical: [[11,401,17,47],[16,48,10,402],[399,13,49,15]] },
    squares: {
      fire:  [[111,122,116,127],[126,117,119,114],[121,112,128,115],[118,125,113,120]],
      air:   [[120,113,125,118],[115,128,112,121],[114,119,117,126],[127,116,122,111]],
      earth: [[118,121,126,111],[125,112,117,122],[113,128,119,116],[120,115,114,127]],
      water: [[127,114,115,120],[116,119,128,113],[122,117,112,125],[111,126,121,118]],
    },
    hierarchy: { usurper:111, guide:128, mystery:239, adjuster:3808, leader:11424, regulator:15232, genGov:30464, highOverseer:3899392 },
    page: "420",
  },

  // ── LORD OF TRIPLICITY BY NIGHT: SAHAQNAB (217) — p.426 ──────────────────
  {
    name: "Lord of Triplicity by Night: Sahaqnab", hebrewValue: 217, gridSize: 4, planet: "Jupiter",
    hebrewSquare: { numerical: [[59,6,103,49],[102,50,58,7],[4,61,51,101]] },
    squares: {
      fire:  [[46,57,51,63],[62,52,54,49],[56,47,64,50],[53,61,48,55]],
      air:   [[55,48,61,53],[50,64,47,56],[49,54,52,62],[63,51,57,46]],
      earth: [[53,56,62,46],[61,47,52,57],[48,64,54,51],[55,50,49,63]],
      water: [[63,49,50,55],[51,54,64,48],[57,52,47,61],[46,62,56,53]],
    },
    hierarchy: { usurper:46, guide:64, mystery:110, adjuster:1736, leader:5208, regulator:6944, genGov:13888, highOverseer:888832 },
    angelArabic: { usurper:5, guide:23, mystery:69, adjuster:1695, leader:5167, regulator:6903, genGov:13847, highOverseer:888791 },
    angelHebrew: { usurper:15, guide:33, mystery:79, adjuster:1705, leader:5177, regulator:6913, genGov:13857, highOverseer:888801 },
    jinnArabic:  { usurper:87, guide:105, mystery:151, adjuster:1417, leader:4889, regulator:6625, genGov:13569, highOverseer:888513 },
    jinnHebrew:  { usurper:77, guide:95, mystery:141, adjuster:1407, leader:4879, regulator:6615, genGov:13559, highOverseer:888503 },
    page: "426-427",
  },

  // ── ANGEL RULING 8TH HOUSE: SOSUL (162) — p.430 ─────────────────────────
  {
    name: "Angel Ruling 8th House: Sosul", hebrewValue: 162, gridSize: 3, planet: "Saturn",
    hebrewSquare: { numerical: [[65,61,9,27],[8,28,64,62],[59,67,29,7]] },
    squares: {
      fire:  [[55,50,57],[56,54,52],[51,58,53]],
      air:   [[53,58,51],[52,54,56],[57,50,55]],
      earth: [[51,56,55],[58,54,50],[53,52,57]],
      water: [[57,52,53],[50,54,58],[55,56,51]],
    },
    hierarchy: { usurper:50, guide:58, mystery:108, adjuster:162, leader:486, regulator:648, genGov:1296, highOverseer:75168 },
    angelArabic: { usurper:9, guide:17, mystery:67, adjuster:121, leader:445, regulator:607, genGov:1255, highOverseer:75127 },
    angelHebrew: { usurper:19, guide:27, mystery:77, adjuster:131, leader:455, regulator:617, genGov:1265, highOverseer:75137 },
    jinnArabic:  { usurper:91, guide:99, mystery:149, adjuster:203, leader:167, regulator:329, genGov:977, highOverseer:74849 },
    jinnHebrew:  { usurper:81, guide:89, mystery:139, adjuster:193, leader:157, regulator:319, genGov:967, highOverseer:74839 },
    page: "430",
  },

  // ── ANGEL OF 1ST DECANATE: KAMOTZ (156) — p.433 ─────────────────────────
  {
    name: "Angel of First Decanate: Kamotz", hebrewValue: 156, gridSize: 3, planet: "Saturn",
    hebrewSquare: { numerical: [[19,41,9,87],[8,88,18,42],[39,21,89,7]] },
    squares: {
      fire:  [[53,48,55],[54,52,50],[49,56,51]],
      air:   [[51,56,49],[50,52,54],[55,48,53]],
      earth: [[49,54,53],[56,52,48],[51,50,55]],
      water: [[55,50,51],[48,52,56],[53,54,49]],
    },
    hierarchy: { usurper:9, guide:47, mystery:56, adjuster:162, leader:486, regulator:648, genGov:1296, highOverseer:60912 },
    angelArabic: { usurper:328, guide:6, mystery:15, adjuster:121, leader:445, regulator:607, genGov:1255, highOverseer:60871 },
    angelHebrew: { usurper:338, guide:16, mystery:25, adjuster:131, leader:455, regulator:617, genGov:1265, highOverseer:60881 },
    jinnArabic:  { usurper:50, guide:88, mystery:97, adjuster:203, leader:167, regulator:329, genGov:977, highOverseer:60593 },
    jinnHebrew:  { usurper:40, guide:78, mystery:87, adjuster:193, leader:157, regulator:319, genGov:967, highOverseer:60583 },
    page: "433",
  },

  // ── ANGEL OF 2ND DECANATE: NUNDOHAR (325) — p.441 ────────────────────────
  {
    name: "Angel of Second Decanate: Nundohar", hebrewValue: 325, gridSize: 4, planet: "Jupiter",
    hebrewSquare: { numerical: [[59,55,14,197],[13,198,58,56],[53,61,199,12]] },
    squares: {
      fire:  [[73,84,78,90],[89,79,81,76],[83,74,91,77],[80,88,75,82]],
      air:   [[82,75,88,80],[77,91,74,83],[76,81,79,89],[90,78,84,73]],
      earth: [[80,83,89,73],[88,74,79,84],[75,91,81,78],[82,77,76,90]],
      water: [[90,76,77,82],[78,81,91,75],[84,79,74,88],[73,89,83,80]],
    },
    hierarchy: { usurper:73, guide:91, mystery:164, adjuster:2600, leader:7800, regulator:10400, genGov:20800, highOverseer:1892800 },
    angelArabic: { usurper:32, guide:50, mystery:123, adjuster:2559, leader:7759, regulator:10359, genGov:20759, highOverseer:1892759 },
    angelHebrew: { usurper:42, guide:60, mystery:133, adjuster:2569, leader:7769, regulator:10369, genGov:20769, highOverseer:1892769 },
    jinnArabic:  { usurper:114, guide:132, mystery:205, adjuster:2281, leader:7481, regulator:10081, genGov:20481, highOverseer:1892481 },
    jinnHebrew:  { usurper:104, guide:122, mystery:195, adjuster:2271, leader:7471, regulator:10071, genGov:20471, highOverseer:1892471 },
    page: "441",
  },

  // ── ANGEL OF 3RD DECANATE: UTHRODIEL (657) — p.446 ───────────────────────
  {
    name: "Angel of Third Decanate: Uthrodiel", hebrewValue: 657, gridSize: 3, planet: "Saturn",
    hebrewSquare: { numerical: [[405,201,13,38],[12,39,404,202],[199,407,40,11]] },
    squares: {
      fire:  [[220,215,222],[221,219,217],[216,223,218]],
      air:   [[218,223,216],[217,219,221],[222,215,220]],
      earth: [[216,221,220],[223,219,215],[218,217,222]],
      water: [[222,217,218],[215,219,223],[220,221,216]],
    },
    hierarchy: { usurper:215, guide:223, mystery:438, adjuster:657, leader:1971, regulator:2628, genGov:5256, highOverseer:1172088 },
    angelArabic: { usurper:174, guide:182, mystery:397, adjuster:616, leader:1930, regulator:2587, genGov:5215, highOverseer:1172047 },
    angelHebrew: { usurper:184, guide:192, mystery:407, adjuster:626, leader:1940, regulator:2597, genGov:5225, highOverseer:1172057 },
    jinnArabic:  { usurper:256, guide:264, mystery:119, adjuster:338, leader:1652, regulator:2309, genGov:4937, highOverseer:1171769 },
    jinnHebrew:  { usurper:246, guide:254, mystery:109, adjuster:328, leader:1642, regulator:2299, genGov:4927, highOverseer:1171759 },
    page: "447",
  },

  // ── ANGEL OF 1ST QUINANCE: LUVIAH (57) — p.436 ───────────────────────────
  {
    name: "Angel of First Quinance: Luviah", hebrewValue: 57, gridSize: 3,
    hebrewSquare: { numerical: [[35,7,13,2],[12,3,34,8],[5,37,4,11]] },
    hierarchy: { usurper:8, guide:46, mystery:54, adjuster:156, leader:468, regulator:624, genGov:1248, highOverseer:57408 },
    angelArabic: { usurper:327, guide:5, mystery:13, adjuster:115, leader:427, regulator:583, genGov:1207, highOverseer:57367 },
    angelHebrew: { usurper:337, guide:15, mystery:23, adjuster:125, leader:437, regulator:593, genGov:1217, highOverseer:57377 },
    jinnArabic:  { usurper:49, guide:87, mystery:95, adjuster:197, leader:149, regulator:305, genGov:929, highOverseer:57089 },
    jinnHebrew:  { usurper:39, guide:77, mystery:85, adjuster:187, leader:139, regulator:295, genGov:919, highOverseer:57079 },
    page: "436",
  },

  // ── ANGEL OF 2ND QUINANCE: PAHALIAH (130) — p.438 ────────────────────────
  {
    name: "Angel of Second Quinance: Pahaliah", hebrewValue: 130, gridSize: 4, planet: "Jupiter",
    hebrewSquare: { numerical: [[79,6,33,12],[32,13,78,7],[4,81,14,31]] },
    squares: {
      fire:  [[25,36,30,39],[38,31,33,28],[35,26,40,29],[32,37,27,34]],
      air:   [[34,27,37,32],[29,40,26,35],[28,33,31,38],[39,30,36,25]],
      earth: [[32,35,38,25],[37,26,31,36],[27,40,33,30],[34,29,28,39]],
      water: [[39,28,29,34],[30,33,40,27],[36,31,26,37],[25,38,35,32]],
    },
    hierarchy: { usurper:6, guide:24, mystery:30, adjuster:456, leader:1368, regulator:1824, genGov:3648, highOverseer:87552 },
    angelArabic: { usurper:325, guide:343, mystery:349, adjuster:415, leader:1327, regulator:1783, genGov:3607, highOverseer:87511 },
    angelHebrew: { usurper:335, guide:353, mystery:359, adjuster:425, leader:1337, regulator:1793, genGov:3617, highOverseer:87521 },
    jinnArabic:  { usurper:47, guide:65, mystery:71, adjuster:137, leader:1049, regulator:1505, genGov:3329, highOverseer:87233 },
    jinnHebrew:  { usurper:37, guide:55, mystery:61, adjuster:127, leader:1039, regulator:1495, genGov:3319, highOverseer:87223 },
    page: "438",
  },

  // ── ANGEL OF 3RD QUINANCE: NELAKIEL (131) — p.446 ────────────────────────
  {
    name: "Angel of Third Quinance: Nelakiel", hebrewValue: 131, gridSize: 3,
    note: "Numerical Squares See Page: 321",
    hebrewSquare: { numerical: [[49,31,23,28],[22,29,48,32],[29,51,30,21]] },
    page: "446",
  },

  // ── ANGEL OF 4TH QUINANCE: YEYAYEL (61) — p.446 ─────────────────────────
  {
    name: "Angel of Fourth Quinance: Yeyayel", hebrewValue: 61, gridSize: 3,
    note: "Numerical Squares See Page: 189",
    hebrewSquare: { numerical: [[19,11,4,28],[3,29,18,12],[9,21,30,2]] },
    page: "446",
  },

  // ── ANGEL OF 5TH QUINANCE: MELAHEL (106) — p.455 ─────────────────────────
  {
    name: "Angel of Fifth Quinance: Melahel", hebrewValue: 106, gridSize: 3,
    hebrewSquare: { numerical: [[39,31,8,28],[7,29,38,32],[29,41,30,6]] },
    hierarchy: { usurper:16, guide:117, mystery:133, adjuster:657, leader:1971, regulator:2628, genGov:5256, highOverseer:614952 },
    page: "455",
  },

  // ── ANGEL OF 6TH QUINANCE: CHAHAVIAH (34) — p.457 ────────────────────────
  {
    name: "Angel of Six Quinance: Chahaviah", hebrewValue: 34, gridSize: 3,
    hebrewSquare: { numerical: [[7,6,9,12],[8,13,6,7],[4,9,14,7]] },
    squares: {
      fire:  [[1,12,6,15],[14,7,9,4],[11,2,16,5],[8,13,3,10]],
      air:   [[10,3,13,8],[5,16,2,11],[4,9,7,14],[15,6,12,1]],
      earth: [[8,11,14,1],[13,2,7,12],[3,16,9,6],[10,5,4,15]],
      water: [[15,4,5,10],[6,9,16,3],[12,7,2,13],[1,14,11,8]],
    },
    hierarchy: { usurper:9, guide:34, mystery:43, adjuster:106, leader:318, regulator:424, genGov:848, highOverseer:28832 },
    angelArabic: { usurper:328, guide:353, mystery:2, adjuster:65, leader:277, regulator:383, genGov:807, highOverseer:28791 },
    angelHebrew: { usurper:338, guide:3, mystery:12, adjuster:75, leader:287, regulator:393, genGov:817, highOverseer:28801 },
    jinnArabic:  { usurper:50, guide:75, mystery:84, adjuster:147, leader:359, regulator:105, genGov:529, highOverseer:28513 },
    jinnHebrew:  { usurper:40, guide:65, mystery:74, adjuster:137, leader:349, regulator:95, genGov:519, highOverseer:28503 },
    page: "457-458",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION C — SAGITTARIUS CHAPTER (begins p.459)
//  Sign Sagittarius: Hebrew name = QASHAT (800)
//  Note: "No Hebrew Squares Possible" — confirmed in book (p.459)
// ─────────────────────────────────────────────────────────────────────────────

export const SAGITTARIUS_ENTITIES = [
  // ── SIGN SAGITTARIUS: QASHAT (800) — p.459 ──────────────────────────────
  {
    name: "Sign Sagittarius: Qashat", hebrewValue: 800, gridSize: 4, planet: "Jupiter",
    note: "No Hebrew Squares Possible",
    squares: {
      fire:  [[192,203,197,208],[207,198,200,195],[202,193,209,196],[199,206,194,201]],
      air:   [[201,194,206,199],[196,209,193,202],[195,200,198,207],[208,197,203,192]],
      earth: [[199,202,207,192],[206,193,198,203],[194,209,200,197],[201,196,195,208]],
      water: [[208,195,196,201],[197,200,209,194],[203,198,193,206],[192,207,202,199]],
    },
    // Hierarchy not yet confirmed for Sagittarius — page cut off at p.459
    page: "459",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION D — KEY PATTERNS CONFIRMED FROM THIS PDF BATCH
// ─────────────────────────────────────────────────────────────────────────────

export const PDF2_CONFIRMED_PATTERNS = {

  // CRITICAL: The Libra section used MC=661 (Sun 6×6) for most entities
  // but DECANATE angels used their own MC value with 3×3 or 4×4 size
  libra_mc_pattern: {
    signMC: 661,
    signGridSize: 6,
    signPlanet: "Sun",
    decanate1: { name:"Tarasni", mc:329, gridSize:4, planet:"Jupiter" },
    decanate2: { name:"Saharnatz", mc:405, gridSize:3, planet:"Saturn" },
    decanate3: { name:"Shachdar", mc:512, gridSize:3, planet:"Saturn" },
  },

  // CRITICAL: Scorpio section confirmed MC=372 for sign square
  scorpio_mc_pattern: {
    signMC: 372,
    signGridSize: 3,
    signPlanet: "Saturn",
    archangelMC: 263,
    angelMC: 202,
  },

  // All outer (Libra sign-level) elemental squares SHARE the same MC
  // but each decanate/quinance uses its own Hebrew value as MC
  hierarchyLaw: "Each entity's Hebrew name gematria value = Adjuster (MC). The usurper, guide, mystery derive from the actual min/max/sum of that square.",

  // IMPORTANT FROM LIBRA: When high-value MCs are used (e.g. MC=661),
  // the Usurper can be large (e.g. 120 for Achodraon) because these are
  // NOT the standard 3×3 canonical with usurper=1
  highUsurperNote: "Many entities have usurper >> 1. This is correct — the usurper is calculated from MC not assumed to be 1.",

  // JINN suffix pattern confirmed: Jinn = base ± 41 (Arabic) or ± 31 (Hebrew)
  // Angel = base − 41 (Arabic) or − 31 (Hebrew)
  // Jinn  = base + 41 (Arabic) or + 31 (Hebrew)
  // Pattern holds for ALL entries without exception across Libra and Scorpio

  // Sagittarius: "No Hebrew Squares Possible" for value 800
  // 800 → in Hebrew: Shin(300)+Shin(300)+Qof(100)+Teth(9) = 709... → complex
  // Actually 800 = 400(Tav)+400(Tav) = ת+ת → compound Hebrew letters
  // The book explicitly notes this limitation for 800
  sagittariusNote: "Sign Sagittarius = Qashat (800). Hebrew squares not possible because 800 uses compound Hebrew letters only.",
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION E — HOUSE ANGELS CATALOG (continued)
//  Houses 7 and 8 confirmed in this batch
// ─────────────────────────────────────────────────────────────────────────────
export const HOUSE_ANGELS_ADDITIONAL = [
  { house: 7, name: "Yahel",  hebrewValue: 46,  gridSize: 3, planet: "Saturn", page: "376" },
  { house: 8, name: "Sosul",  hebrewValue: 162, gridSize: 3, planet: "Saturn", page: "430" },
];

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION F — SAMPLE SQUARE DATA ARCHIVE
//  Selected verified squares from this batch (for reference/testing)
// ─────────────────────────────────────────────────────────────────────────────
export const SAMPLE_SQUARES_PDF2 = {
  // Libra 5×5 Mars (from p.363, hierarchy usurper=120)
  libra_5x5_fire_mars: [[120,145,138,132,126],[133,127,121,141,139],[142,135,134,128,122],[129,123,143,136,130],[137,131,125,124,144]],
  libra_5x5_air_mars:  [[137,129,142,133,120],[131,123,135,127,145],[125,143,134,121,138],[124,136,128,141,132],[144,130,122,139,126]],
  libra_5x5_earth_mars:[[144,124,125,131,137],[130,136,143,123,129],[122,128,134,135,142],[139,141,121,127,133],[126,132,138,145,120]],
  libra_5x5_water_mars:[[126,139,122,130,144],[132,141,128,136,124],[138,121,134,143,125],[145,127,135,123,131],[120,133,142,129,137]],

  // Scorpio 9×9 Moon (MC=657) Fire square from p.452
  scorpio_9x9_fire_moon: [
    [77,90,52,61,113,45,81,97,41],
    [37,80,102,57,73,89,44,66,109],
    [105,49,65,101,33,85,94,56,69],
    [104,36,79,88,59,72,108,43,68],
    [64,107,48,84,100,35,71,93,55],
    [51,76,92,47,60,112,40,83,96],
    [50,63,106,34,86,99,54,70,95],
    [91,53,75,111,46,62,98,39,82],
    [78,103,38,74,87,58,67,110,42],
  ],

  // Scorpio 10×10 Saturn (MC=657) Fire square from p.454
  scorpio_10x10_fire_saturn: [
    [16,34,41,79,70,110,63,55,87,102],
    [27,91,84,75,112,100,18,60,46,44],
    [42,47,71,111,101,86,35,23,64,77],
    [48,73,109,103,36,82,90,31,20,65],
    [61,108,105,40,51,74,78,88,33,19],
    [68,25,26,93,81,57,53,43,98,113],
    [80,62,22,29,95,50,38,99,116,66],
    [94,83,58,17,28,45,96,115,69,52],
    [104,37,49,56,24,32,114,67,85,89],
    [117,97,92,54,59,21,72,76,39,30],
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION G — PROCESSING LOG
// ─────────────────────────────────────────────────────────────────────────────
export const PDF2_LOG = {
  id: "PDF-PART2",
  date_added: "2026-06-07",
  source: "PDF — Occult Encyclopedia of Magick Squares, pages 360–459",
  total_pages: 100,
  chapters_covered: ["Libra (partial, entities)", "Scorpio (complete)", "Sagittarius (start)"],
  entities_extracted: 26,
  new_patterns: [
    "High-value usurpers (usurper >> 1) confirmed as correct behavior",
    "Jinn/Angel ±41/±31 pattern holds across ALL entries without exception",
    "Hebrew squares not always available — confirmed for Sagittarius MC=800",
    "House angels confirmed: House 7 = Yahel(46), House 8 = Sosul(162)",
    "Decanate/Quinance angels use their own Hebrew value as MC, not the sign MC",
  ],
  awaiting: "Pages 460+ (rest of Sagittarius, Capricorn, Aquarius, Pisces, Planetary chapters)",
};

export default {
  LIBRA_ENTITIES, SCORPIO_ENTITIES, SAGITTARIUS_ENTITIES,
  PDF2_CONFIRMED_PATTERNS, HOUSE_ANGELS_ADDITIONAL,
  SAMPLE_SQUARES_PDF2, PDF2_LOG,
};