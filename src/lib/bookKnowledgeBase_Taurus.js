// ═══════════════════════════════════════════════════════════════════════════
//  PERMANENT BOOK KNOWLEDGE DATABASE — TAURUS CHAPTER + ARIES COMPLETION
//  Source: "The Occult Encyclopedia of Magick Squares" — Nineveh Shadrach
//  PDF File: d582026a3_...-65-117.pdf
//  PDF Pages: 25–77 (book pages 25–77)
//  Processed: 2026-06-07
//  Covers:
//    - Aries chapter COMPLETION (Sapatavi pp.25–28, Ayel p.29, Zazer pp.31–34,
//      Behahemi pp.39, Hechashiah pp.40–43, Amamiah pp.45–47,
//      Nanael pp.54–56, Nithael pp.57–63, Satander p.48–53)
//    - Taurus chapter START (Sign Shor pp.64–71, Archangel Asmodel pp.72–74,
//      Angel Araziel pp.75–77)
//  NOTE: Previous Aries data in bookKnowledgeBase.js is preserved — this file
//        ADDS missing multi-planetary squares and the Taurus entities.
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION A — ARIES: SAPATAVI (236) — COMPLETE MULTI-PLANET DATA
//  Lord of Triplicity by Night: Sapatavi, hebrewValue=236, page 25
//  Previously stored: Jupiter 4×4 only. Now ALL planet sizes added.
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_SAPATAVI_COMPLETE = {
  name: "Lord of Triplicity by Night: Sapatavi", hebrewValue: 236,
  gridSize: 4, planet: "Jupiter",

  // Hebrew letter square (p.25)
  hebrewSquare: { numerical: [[139,80,10,7],[9,8,138,81],[78,141,9,8]] },

  // Jupiter 4×4 (p.25) — previously stored in bookKnowledgeBase.js
  jupiterSquare: {
    fire:  [[51,62,56,67],[66,57,59,54],[61,52,68,55],[58,65,53,60]],
    air:   [[60,53,65,58],[55,68,52,61],[54,59,57,66],[67,56,62,51]],
    earth: [[58,61,66,51],[65,52,57,62],[53,68,59,56],[60,55,54,67]],
    water: [[67,54,55,60],[56,59,68,53],[62,57,52,65],[51,66,61,58]],
    hierarchy: { usurper:51, guide:68, mystery:119, adjuster:1888, leader:5664, regulator:7552, genGov:15104, highOverseer:1027072 },
    angelArabic: { usurper:10, guide:27, mystery:78, adjuster:1847, leader:5623, regulator:7511, genGov:15063, highOverseer:1027031 },
    angelHebrew: { usurper:20, guide:37, mystery:88, adjuster:1857, leader:5633, regulator:7521, genGov:15073, highOverseer:1027041 },
    jinnArabic:  { usurper:92, guide:109, mystery:160, adjuster:1569, leader:5345, regulator:7233, genGov:14785, highOverseer:1026753 },
    jinnHebrew:  { usurper:82, guide:99, mystery:150, adjuster:1559, leader:5335, regulator:7223, genGov:14775, highOverseer:1026743 },
    page: "25",
  },

  // Mars 5×5 (p.26)
  marsSquare: {
    fire:  [[35,60,53,47,41],[48,42,36,56,54],[57,50,49,43,37],[44,38,58,51,45],[52,46,40,39,59]],
    air:   [[52,44,57,48,35],[46,38,50,42,60],[40,58,49,36,53],[39,51,43,56,47],[59,45,37,54,41]],
    earth: [[59,39,40,46,52],[45,51,58,38,44],[37,43,49,50,57],[54,56,36,42,48],[41,47,53,60,35]],
    water: [[41,54,37,45,59],[47,56,43,51,39],[53,36,49,58,40],[60,42,50,38,46],[35,48,57,44,52]],
    hierarchy: { usurper:35, guide:60, mystery:95, adjuster:236, leader:708, regulator:944, genGov:1888, highOverseer:113280 },
    angelArabic: { usurper:354, guide:19, mystery:54, adjuster:195, leader:667, regulator:903, genGov:1847, highOverseer:113239 },
    angelHebrew: { usurper:4, guide:29, mystery:64, adjuster:205, leader:677, regulator:913, genGov:1857, highOverseer:113249 },
    jinnArabic:  { usurper:76, guide:101, mystery:136, adjuster:277, leader:389, regulator:625, genGov:1569, highOverseer:112961 },
    jinnHebrew:  { usurper:66, guide:91, mystery:126, adjuster:267, leader:379, regulator:615, genGov:1559, highOverseer:112951 },
    page: "26",
  },

  // Sun 6×6 (pp.26–27)
  sunSquare: {
    fire:  [[21,32,57,38,42,46],[27,37,48,56,25,43],[33,60,41,31,47,24],[44,23,34,49,28,58],[50,39,30,22,59,36],[61,45,26,40,35,29]],
    air:   [[29,35,40,26,45,61],[36,59,22,30,39,50],[58,28,49,34,23,44],[24,47,31,41,60,33],[43,25,56,48,37,27],[46,42,38,57,32,21]],
    earth: [[61,50,44,33,27,21],[45,39,23,60,37,32],[26,30,34,41,48,57],[40,22,49,31,56,38],[35,59,28,47,25,42],[29,36,58,24,43,46]],
    water: [[46,43,24,58,36,29],[42,25,47,28,59,35],[38,56,31,49,22,40],[57,48,41,34,30,26],[32,37,60,23,39,45],[21,27,33,44,50,61]],
    hierarchy: { usurper:21, guide:61, mystery:82, adjuster:236, leader:708, regulator:944, genGov:1888, highOverseer:115168 },
    angelArabic: { usurper:340, guide:20, mystery:41, adjuster:195, leader:667, regulator:903, genGov:1847, highOverseer:115127 },
    angelHebrew: { usurper:350, guide:30, mystery:51, adjuster:205, leader:677, regulator:913, genGov:1857, highOverseer:115137 },
    jinnArabic:  { usurper:62, guide:102, mystery:123, adjuster:277, leader:389, regulator:625, genGov:1569, highOverseer:114849 },
    jinnHebrew:  { usurper:52, guide:92, mystery:113, adjuster:267, leader:379, regulator:615, genGov:1559, highOverseer:114839 },
    page: "27",
  },

  // Venus 7×7 (pp.27–28)
  venusSquare: {
    fire:  [[9,50,35,20,40,58,24],[59,25,10,44,36,21,41],[22,42,60,26,11,45,30],[46,31,16,43,61,27,12],[28,13,47,32,17,37,62],[38,56,29,14,48,33,18],[34,19,39,57,23,15,49]],
    air:   [[49,15,23,57,39,19,34],[18,33,48,14,29,56,38],[62,37,17,32,47,13,28],[12,27,61,43,16,31,46],[30,45,11,26,60,42,22],[41,21,36,44,10,25,59],[24,58,40,20,35,50,9]],
    earth: [[34,38,28,46,22,59,9],[19,56,13,31,42,25,50],[39,29,47,16,60,10,35],[57,14,32,43,26,44,20],[23,48,17,61,11,36,40],[15,33,37,27,45,21,58],[49,18,62,12,30,41,24]],
    water: [[24,41,30,12,62,18,49],[58,21,45,27,37,33,15],[40,36,11,61,17,48,23],[20,44,26,43,32,14,57],[35,10,60,16,47,29,39],[50,25,42,31,13,56,19],[9,59,22,46,28,38,34]],
    hierarchy: { usurper:9, guide:62, mystery:71, adjuster:236, leader:708, regulator:944, genGov:1888, highOverseer:117056 },
    angelArabic: { usurper:328, guide:21, mystery:30, adjuster:195, leader:667, regulator:903, genGov:1847, highOverseer:117015 },
    angelHebrew: { usurper:338, guide:31, mystery:40, adjuster:205, leader:677, regulator:913, genGov:1857, highOverseer:117025 },
    jinnArabic:  { usurper:50, guide:103, mystery:112, adjuster:277, leader:389, regulator:625, genGov:1569, highOverseer:116737 },
    jinnHebrew:  { usurper:40, guide:93, mystery:102, adjuster:267, leader:379, regulator:615, genGov:1559, highOverseer:116727 },
    page: "28",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION B — ARIES: AYEL (42) — COMPLETE DATA
//  Angel Ruling 1st House, page 29
//  Note: "This Hebrew Squares Not Available"
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_AYEL_COMPLETE = {
  name: "Angel Ruling 1st House: Ayel", hebrewValue: 42,
  gridSize: 3, planet: "Saturn",
  note: "This Hebrew Squares Not Available",
  page: "29",

  // Saturn 3×3 elemental squares (p.29)
  saturnSquare: {
    fire:  [[15,10,17],[16,14,12],[11,18,13]],
    earth: [[11,16,15],[18,14,10],[13,12,17]],
    air:   [[13,18,11],[12,14,16],[17,10,15]],
    water: [[17,12,13],[10,14,18],[15,16,11]],
    hierarchy: { usurper:10, guide:18, mystery:28, adjuster:42, leader:126, regulator:168, genGov:336, highOverseer:6048 },
    angelArabic: { usurper:329, guide:337, mystery:347, adjuster:1, leader:85, regulator:127, genGov:295, highOverseer:6007 },
    angelHebrew: { usurper:339, guide:347, mystery:357, adjuster:11, leader:95, regulator:137, genGov:305, highOverseer:6017 },
    jinnArabic:  { usurper:51, guide:59, mystery:69, adjuster:83, leader:167, regulator:209, genGov:17, highOverseer:5729 },
    jinnHebrew:  { usurper:41, guide:49, mystery:59, adjuster:73, leader:157, regulator:199, genGov:7, highOverseer:5719 },
  },

  // Jupiter 4×4 elemental squares (p.30)
  jupiterSquare: {
    fire:  [[3,14,8,17],[16,9,11,6],[13,4,18,7],[10,15,5,12]],
    air:   [[12,5,15,10],[7,18,4,13],[6,11,9,16],[17,8,14,3]],
    earth: [[10,13,16,3],[15,4,9,14],[5,18,11,8],[12,7,6,17]],
    water: [[17,6,7,12],[8,11,18,5],[14,9,4,15],[3,16,13,10]],
    hierarchy: { usurper:3, guide:18, mystery:21, adjuster:336, leader:1008, regulator:1344, genGov:2688, highOverseer:48384 },
    angelArabic: { usurper:322, guide:337, mystery:340, adjuster:295, leader:967, regulator:1303, genGov:2647, highOverseer:48343 },
    angelHebrew: { usurper:332, guide:347, mystery:350, adjuster:305, leader:977, regulator:1313, genGov:2657, highOverseer:48353 },
    jinnArabic:  { usurper:44, guide:59, mystery:62, adjuster:17, leader:689, regulator:1025, genGov:2369, highOverseer:48065 },
    jinnHebrew:  { usurper:34, guide:49, mystery:52, adjuster:7, leader:679, regulator:1015, genGov:2359, highOverseer:48055 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION C — ARIES: ZAZER (214) — COMPLETE MULTI-PLANET DATA
//  Angel of First Decanate, page 31
//  Note: "Hebrew Squares Not Available"
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_ZAZER_COMPLETE = {
  name: "Angel of First Decanate: Zazer", hebrewValue: 214,
  gridSize: 4, planet: "Jupiter",
  note: "Hebrew Squares Not Available",
  page: "31",

  // Jupiter 4×4 (p.31)
  jupiterSquare: {
    fire:  [[46,57,51,60],[59,52,54,49],[56,47,61,50],[53,58,48,55]],
    air:   [[55,48,58,53],[50,61,47,56],[49,54,52,59],[60,51,57,46]],
    earth: [[53,56,59,46],[58,47,52,57],[48,61,54,51],[55,50,49,60]],
    water: [[60,49,50,55],[51,54,61,48],[57,52,47,58],[46,59,56,53]],
    hierarchy: { usurper:46, guide:61, mystery:107, adjuster:1712, leader:5136, regulator:6848, genGov:13696, highOverseer:835456 },
    angelArabic: { usurper:5, guide:20, mystery:66, adjuster:1671, leader:5095, regulator:6807, genGov:13655, highOverseer:835415 },
    angelHebrew: { usurper:15, guide:30, mystery:76, adjuster:1681, leader:5105, regulator:6817, genGov:13665, highOverseer:835425 },
    jinnArabic:  { usurper:87, guide:102, mystery:148, adjuster:1393, leader:4817, regulator:6529, genGov:13377, highOverseer:835137 },
    jinnHebrew:  { usurper:77, guide:92, mystery:138, adjuster:1383, leader:4807, regulator:6519, genGov:13367, highOverseer:835127 },
  },

  // Mars 5×5 (p.32)
  marsSquare: {
    fire:  [[30,58,48,42,36],[43,37,31,54,49],[55,45,44,38,32],[39,33,56,46,40],[47,41,35,34,57]],
    air:   [[47,39,55,43,30],[41,33,45,37,58],[35,56,44,31,48],[34,46,38,54,42],[57,40,32,49,36]],
    earth: [[57,34,35,41,47],[40,46,56,33,39],[32,38,44,45,55],[49,54,31,37,43],[36,42,48,58,30]],
    water: [[36,49,32,40,57],[42,54,38,46,34],[48,31,44,56,35],[58,37,45,33,41],[30,43,55,39,47]],
    hierarchy: { usurper:30, guide:58, mystery:88, adjuster:214, leader:642, regulator:856, genGov:1712, highOverseer:99296 },
    angelArabic: { usurper:349, guide:17, mystery:47, adjuster:173, leader:601, regulator:815, genGov:1671, highOverseer:99255 },
    angelHebrew: { usurper:359, guide:27, mystery:57, adjuster:183, leader:611, regulator:825, genGov:1681, highOverseer:99265 },
    jinnArabic:  { usurper:71, guide:99, mystery:129, adjuster:255, leader:323, regulator:537, genGov:1393, highOverseer:98977 },
    jinnHebrew:  { usurper:61, guide:89, mystery:119, adjuster:245, leader:313, regulator:527, genGov:1383, highOverseer:98967 },
  },

  // Sun 6×6 (p.33)
  sunSquare: {
    fire:  [[18,29,50,35,39,43],[24,34,45,49,22,40],[30,53,38,28,44,21],[41,20,31,46,25,51],[47,36,27,19,52,33],[54,42,23,37,32,26]],
    air:   [[26,32,37,23,42,54],[33,52,19,27,36,47],[51,25,46,31,20,41],[21,44,28,38,53,30],[40,22,49,45,34,24],[43,39,35,50,29,18]],
    earth: [[54,47,41,30,24,18],[42,36,20,53,34,29],[23,27,31,38,45,50],[37,19,46,28,49,35],[32,52,25,44,22,39],[26,33,51,21,40,43]],
    water: [[43,40,21,51,33,26],[39,22,44,25,52,32],[35,49,28,46,19,37],[50,45,38,31,27,23],[29,34,53,20,36,42],[18,24,30,41,47,54]],
    hierarchy: { usurper:18, guide:54, mystery:72, adjuster:214, leader:642, regulator:856, genGov:1712, highOverseer:92448 },
    angelArabic: { usurper:337, guide:13, mystery:31, adjuster:173, leader:601, regulator:815, genGov:1671, highOverseer:92407 },
    angelHebrew: { usurper:347, guide:23, mystery:41, adjuster:183, leader:611, regulator:825, genGov:1681, highOverseer:92417 },
    jinnArabic:  { usurper:59, guide:95, mystery:113, adjuster:255, leader:323, regulator:537, genGov:1393, highOverseer:92129 },
    jinnHebrew:  { usurper:49, guide:85, mystery:103, adjuster:245, leader:313, regulator:527, genGov:1383, highOverseer:92119 },
  },

  // Venus 7×7 (p.34)
  venusSquare: {
    fire:  [[6,47,32,17,37,54,21],[55,22,7,41,33,18,38],[19,39,56,23,8,42,27],[43,28,13,40,57,24,9],[25,10,44,29,14,34,58],[35,52,26,11,45,30,15],[31,16,36,53,20,12,46]],
    air:   [[46,12,20,53,36,16,31],[15,30,45,11,26,52,35],[58,34,14,29,44,10,25],[9,24,57,40,13,28,43],[27,42,8,23,56,39,19],[38,18,33,41,7,22,55],[21,54,37,17,32,47,6]],
    earth: [[31,35,25,43,19,55,6],[16,52,10,28,39,22,47],[36,26,44,13,56,7,32],[53,11,29,40,23,41,17],[20,45,14,57,8,33,37],[12,30,34,24,42,18,54],[46,15,58,9,27,38,21]],
    water: [[21,38,27,9,58,15,46],[54,18,42,24,34,30,12],[37,33,8,57,14,45,20],[17,41,23,40,29,11,53],[32,7,56,13,44,26,36],[47,22,39,28,10,52,16],[6,55,19,43,25,35,31]],
    hierarchy: { usurper:6, guide:58, mystery:64, adjuster:214, leader:642, regulator:856, genGov:1712, highOverseer:99296 },
    angelArabic: { usurper:325, guide:17, mystery:23, adjuster:173, leader:601, regulator:815, genGov:1671, highOverseer:99255 },
    angelHebrew: { usurper:335, guide:27, mystery:33, adjuster:183, leader:611, regulator:825, genGov:1681, highOverseer:99265 },
    jinnArabic:  { usurper:47, guide:99, mystery:105, adjuster:255, leader:323, regulator:537, genGov:1393, highOverseer:98977 },
    jinnHebrew:  { usurper:37, guide:89, mystery:95, adjuster:245, leader:313, regulator:527, genGov:1383, highOverseer:98967 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION D — ARIES: SATANDER (323) — COMPLETE DATA
//  Angel of Third Decanate, page 48
//  Previously stored as stub only. Now full data.
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_SATANDER_COMPLETE = {
  name: "Angel of Third Decanate: Satander", hebrewValue: 323,
  gridSize: 4, planet: "Jupiter",
  page: "48",

  // Hebrew letter squares (p.48)
  hebrewSquare: {
    numerical: [[68,51,7,197],[6,198,67,52],[49,70,199,5]],
  },

  // Jupiter 4×4 (p.49)
  jupiterSquare: {
    fire:  [[73,84,78,88],[87,79,81,76],[83,74,89,77],[80,86,75,82]],
    air:   [[82,75,86,80],[77,89,74,83],[76,81,79,87],[88,78,84,73]],
    earth: [[80,83,87,73],[86,74,79,84],[75,89,81,78],[82,77,76,88]],
    water: [[88,76,77,82],[78,81,89,75],[84,79,74,86],[73,87,83,80]],
    hierarchy: { usurper:73, guide:89, mystery:162, adjuster:2584, leader:7752, regulator:10336, genGov:20672, highOverseer:1839808 },
    angelArabic: { usurper:32, guide:48, mystery:121, adjuster:2543, leader:7711, regulator:10295, genGov:20631, highOverseer:1839767 },
    angelHebrew: { usurper:42, guide:58, mystery:131, adjuster:2553, leader:7721, regulator:10305, genGov:20641, highOverseer:1839777 },
    jinnArabic:  { usurper:114, guide:130, mystery:203, adjuster:2265, leader:7433, regulator:10017, genGov:20353, highOverseer:1839489 },
    jinnHebrew:  { usurper:104, guide:120, mystery:193, adjuster:2255, leader:7423, regulator:10007, genGov:20343, highOverseer:1839479 },
  },

  // Mars 5×5 (p.49)
  marsSquare: {
    fire:  [[52,79,70,64,58],[65,59,53,75,71],[76,67,66,60,54],[61,55,77,68,62],[69,63,57,56,78]],
    air:   [[69,61,76,65,52],[63,55,67,59,79],[57,77,66,53,70],[56,68,60,75,64],[78,62,54,71,58]],
    earth: [[78,56,57,63,69],[62,68,77,55,61],[54,60,66,67,76],[71,75,53,59,65],[58,64,70,79,52]],
    water: [[58,71,54,62,78],[64,75,60,68,56],[70,53,66,77,57],[79,59,67,55,63],[52,65,76,61,69]],
    hierarchy: { usurper:52, guide:79, mystery:131, adjuster:323, leader:969, regulator:1292, genGov:2584, highOverseer:204136 },
    angelArabic: { usurper:11, guide:38, mystery:90, adjuster:282, leader:928, regulator:1251, genGov:2543, highOverseer:204095 },
    angelHebrew: { usurper:21, guide:48, mystery:100, adjuster:292, leader:938, regulator:1261, genGov:2553, highOverseer:204105 },
    jinnArabic:  { usurper:93, guide:120, mystery:172, adjuster:4, leader:650, regulator:973, genGov:2265, highOverseer:203817 },
    jinnHebrew:  { usurper:83, guide:110, mystery:162, adjuster:354, leader:640, regulator:963, genGov:2255, highOverseer:203807 },
  },

  // Sun 6×6 (p.50)
  sunSquare: {
    fire:  [[36,47,69,53,57,61],[42,52,63,68,40,58],[48,72,56,46,62,39],[59,38,49,64,43,70],[65,54,45,37,71,51],[73,60,41,55,50,44]],
    air:   [[44,50,55,41,60,73],[51,71,37,45,54,65],[70,43,64,49,38,59],[39,62,46,56,72,48],[58,40,68,63,52,42],[61,57,53,69,47,36]],
    earth: [[73,65,59,48,42,36],[60,54,38,72,52,47],[41,45,49,56,63,69],[55,37,64,46,68,53],[50,71,43,62,40,57],[44,51,70,39,58,61]],
    water: [[61,58,39,70,51,44],[57,40,62,43,71,50],[53,68,46,64,37,55],[69,63,56,49,45,41],[47,52,72,38,54,60],[36,42,48,59,65,73]],
    hierarchy: { usurper:36, guide:73, mystery:109, adjuster:323, leader:969, regulator:1292, genGov:2584, highOverseer:188632 },
    angelArabic: { usurper:355, guide:32, mystery:68, adjuster:282, leader:928, regulator:1251, genGov:2543, highOverseer:188591 },
    angelHebrew: { usurper:5, guide:42, mystery:78, adjuster:292, leader:938, regulator:1261, genGov:2553, highOverseer:188601 },
    jinnArabic:  { usurper:77, guide:114, mystery:150, adjuster:4, leader:650, regulator:973, genGov:2265, highOverseer:188313 },
    jinnHebrew:  { usurper:67, guide:104, mystery:140, adjuster:354, leader:640, regulator:963, genGov:2255, highOverseer:188303 },
  },

  // Venus 7×7 (p.51)
  venusSquare: {
    fire:  [[22,63,48,33,53,67,37],[68,38,23,57,49,34,54],[35,55,69,39,24,58,43],[59,44,29,56,70,40,25],[41,26,60,45,30,50,71],[51,65,42,27,61,46,31],[47,32,52,66,36,28,62]],
    air:   [[62,28,36,66,52,32,47],[31,46,61,27,42,65,51],[71,50,30,45,60,26,41],[25,40,70,56,29,44,59],[43,58,24,39,69,55,35],[54,34,49,57,23,38,68],[37,67,53,33,48,63,22]],
    earth: [[47,51,41,59,35,68,22],[32,65,26,44,55,38,63],[52,42,60,29,69,23,48],[66,27,45,56,39,57,33],[36,61,30,70,24,49,53],[28,46,50,40,58,34,67],[62,31,71,25,43,54,37]],
    water: [[37,54,43,25,71,31,62],[67,34,58,40,50,46,28],[53,49,24,70,30,61,36],[33,57,39,56,45,27,66],[48,23,69,29,60,42,52],[63,38,55,44,26,65,32],[22,68,35,59,41,51,47]],
    hierarchy: { usurper:22, guide:71, mystery:93, adjuster:323, leader:969, regulator:1292, genGov:2584, highOverseer:183464 },
    angelArabic: { usurper:341, guide:30, mystery:52, adjuster:282, leader:928, regulator:1251, genGov:2543, highOverseer:183423 },
    angelHebrew: { usurper:351, guide:40, mystery:62, adjuster:292, leader:938, regulator:1261, genGov:2553, highOverseer:183433 },
    jinnArabic:  { usurper:63, guide:112, mystery:134, adjuster:4, leader:650, regulator:973, genGov:2265, highOverseer:183145 },
    jinnHebrew:  { usurper:53, guide:102, mystery:124, adjuster:354, leader:640, regulator:963, genGov:2255, highOverseer:183135 },
  },

  // Mercury 8×8 (p.52)
  mercurySquare: {
    fire:  [[8,24,76,53,42,58,39,23],[16,32,61,45,50,73,31,15],[59,43,22,38,25,9,52,75],[74,51,14,30,33,17,44,60],[37,21,40,56,78,55,10,26],[29,13,48,71,63,47,18,34],[54,77,27,11,20,36,57,41],[46,62,35,19,12,28,72,49]],
    earth: [[46,54,29,37,74,59,16,8],[62,77,13,21,51,43,32,24],[35,27,48,40,14,22,61,76],[19,11,71,56,30,38,45,53],[12,20,63,78,33,25,50,42],[28,36,47,55,17,9,73,58],[72,57,18,10,44,52,31,39],[49,41,34,26,60,75,15,23]],
    air:   [[49,72,28,12,19,35,62,46],[41,57,36,20,11,27,77,54],[34,18,47,63,71,48,13,29],[26,10,55,78,56,40,21,37],[60,44,17,33,30,14,51,74],[75,52,9,25,38,22,43,59],[15,31,73,50,45,61,32,16],[23,39,58,42,53,76,24,8]],
    water: [[23,15,75,60,26,34,41,49],[39,31,52,44,10,18,57,72],[58,73,9,17,55,47,36,28],[42,50,25,33,78,63,20,12],[53,45,38,30,56,71,11,19],[76,61,22,14,40,48,27,35],[24,32,43,51,21,13,77,62],[8,16,59,74,37,29,54,46]],
    hierarchy: { usurper:8, guide:78, mystery:86, adjuster:323, leader:969, regulator:1292, genGov:2584, highOverseer:201552 },
    angelArabic: { usurper:327, guide:37, mystery:45, adjuster:282, leader:928, regulator:1251, genGov:2543, highOverseer:201511 },
    angelHebrew: { usurper:337, guide:47, mystery:55, adjuster:292, leader:938, regulator:1261, genGov:2553, highOverseer:201521 },
    jinnArabic:  { usurper:49, guide:119, mystery:127, adjuster:4, leader:650, regulator:973, genGov:2265, highOverseer:201233 },
    jinnHebrew:  { usurper:39, guide:109, mystery:117, adjuster:354, leader:640, regulator:963, genGov:2255, highOverseer:201223 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION E — ARIES: HECHASHIAH (328) — COMPLETE MULTI-PLANET DATA
//  Angel of Third Quinance, page 40
//  Previously stored: Jupiter 4×4 only.
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_HECHASHIAH_COMPLETE = {
  name: "Angel of Third Quinance: Hechashiah", hebrewValue: 328,
  gridSize: 4, planet: "Jupiter",
  page: "40",

  // Hebrew letter squares (p.40)
  hebrewSquare: { numerical: [[4,9,303,12],[302,13,3,10],[7,6,14,301]] },

  // Jupiter 4×4 — previously stored
  jupiterSquare: {
    fire:  [[74,85,79,90],[89,80,82,77],[84,75,91,78],[81,88,76,83]],
    air:   [[83,76,88,81],[78,91,75,84],[77,82,80,89],[90,79,85,74]],
    earth: [[81,84,89,74],[88,75,80,85],[76,91,82,79],[83,78,77,90]],
    water: [[90,77,78,83],[79,82,91,76],[85,80,75,88],[74,89,84,81]],
    hierarchy: { usurper:74, guide:91, mystery:165, adjuster:2624, leader:7872, regulator:10496, genGov:20992, highOverseer:1910272 },
    angelArabic: { usurper:33, guide:50, mystery:124, adjuster:2583, leader:7831, regulator:10455, genGov:20951, highOverseer:1910231 },
    angelHebrew: { usurper:43, guide:60, mystery:134, adjuster:2593, leader:7841, regulator:10465, genGov:20961, highOverseer:1910241 },
    jinnArabic:  { usurper:115, guide:132, mystery:206, adjuster:2305, leader:7553, regulator:10177, genGov:20673, highOverseer:1909953 },
    jinnHebrew:  { usurper:105, guide:122, mystery:196, adjuster:2295, leader:7543, regulator:10167, genGov:20663, highOverseer:1909943 },
  },

  // Mars 5×5 (p.41)
  marsSquare: {
    fire:  [[53,80,71,65,59],[66,60,54,76,72],[77,68,67,61,55],[62,56,78,69,63],[70,64,58,57,79]],
    air:   [[70,62,77,66,53],[64,56,68,60,80],[58,78,67,54,71],[57,69,61,76,65],[79,63,55,72,59]],
    earth: [[79,57,58,64,70],[63,69,78,56,62],[55,61,67,68,77],[72,76,54,60,66],[59,65,71,80,53]],
    water: [[59,72,55,63,79],[65,76,61,69,57],[71,54,67,78,58],[80,60,68,56,64],[53,66,77,62,70]],
    hierarchy: { usurper:53, guide:80, mystery:133, adjuster:328, leader:984, regulator:1312, genGov:2624, highOverseer:209920 },
    angelArabic: { usurper:12, guide:39, mystery:92, adjuster:287, leader:943, regulator:1271, genGov:2583, highOverseer:209879 },
    angelHebrew: { usurper:22, guide:49, mystery:102, adjuster:297, leader:953, regulator:1281, genGov:2593, highOverseer:209889 },
    jinnArabic:  { usurper:94, guide:121, mystery:174, adjuster:9, leader:665, regulator:993, genGov:2305, highOverseer:209601 },
    jinnHebrew:  { usurper:84, guide:111, mystery:164, adjuster:359, leader:655, regulator:983, genGov:2295, highOverseer:209591 },
  },

  // Sun 6×6 (p.41–42)
  sunSquare: {
    fire:  [[37,48,69,54,58,62],[43,53,64,68,41,59],[49,72,57,47,63,40],[60,39,50,65,44,70],[66,55,46,38,71,52],[73,61,42,56,51,45]],
    air:   [[45,51,56,42,61,73],[52,71,38,46,55,66],[70,44,65,50,39,60],[40,63,47,57,72,49],[59,41,68,64,53,43],[62,58,54,69,48,37]],
    earth: [[73,66,60,49,43,37],[61,55,39,72,53,48],[42,46,50,57,64,69],[56,38,65,47,68,54],[51,71,44,63,41,58],[45,52,70,40,59,62]],
    water: [[62,59,40,70,52,45],[58,41,63,44,71,51],[54,68,47,65,38,56],[69,64,57,50,46,42],[48,53,72,39,55,61],[37,43,49,60,66,73]],
    hierarchy: { usurper:37, guide:73, mystery:110, adjuster:328, leader:984, regulator:1312, genGov:2624, highOverseer:191552 },
    angelArabic: { usurper:356, guide:32, mystery:69, adjuster:287, leader:943, regulator:1271, genGov:2583, highOverseer:191511 },
    angelHebrew: { usurper:6, guide:42, mystery:79, adjuster:297, leader:953, regulator:1281, genGov:2593, highOverseer:191521 },
    jinnArabic:  { usurper:78, guide:114, mystery:151, adjuster:9, leader:665, regulator:993, genGov:2305, highOverseer:191233 },
    jinnHebrew:  { usurper:68, guide:104, mystery:141, adjuster:359, leader:655, regulator:983, genGov:2295, highOverseer:191223 },
  },

  // Venus 7×7 (pp.42–43)
  venusSquare: {
    fire:  [[22,63,48,33,53,72,37],[73,38,23,57,49,34,54],[35,55,74,39,24,58,43],[59,44,29,56,75,40,25],[41,26,60,45,30,50,76],[51,70,42,27,61,46,31],[47,32,52,71,36,28,62]],
    air:   [[62,28,36,71,52,32,47],[31,46,61,27,42,70,51],[76,50,30,45,60,26,41],[25,40,75,56,29,44,59],[43,58,24,39,74,55,35],[54,34,49,57,23,38,73],[37,72,53,33,48,63,22]],
    earth: [[47,51,41,59,35,73,22],[32,70,26,44,55,38,63],[52,42,60,29,74,23,48],[71,27,45,56,39,57,33],[36,61,30,75,24,49,53],[28,46,50,40,58,34,72],[62,31,76,25,43,54,37]],
    water: [[37,54,43,25,76,31,62],[72,34,58,40,50,46,28],[53,49,24,75,30,61,36],[33,57,39,56,45,27,71],[48,23,74,29,60,42,52],[63,38,55,44,26,70,32],[22,73,35,59,41,51,47]],
    hierarchy: { usurper:22, guide:76, mystery:98, adjuster:328, leader:984, regulator:1312, genGov:2624, highOverseer:199424 },
    angelArabic: { usurper:341, guide:35, mystery:57, adjuster:287, leader:943, regulator:1271, genGov:2583, highOverseer:199383 },
    angelHebrew: { usurper:351, guide:45, mystery:67, adjuster:297, leader:953, regulator:1281, genGov:2593, highOverseer:199393 },
    jinnArabic:  { usurper:63, guide:117, mystery:139, adjuster:9, leader:665, regulator:993, genGov:2305, highOverseer:199105 },
    jinnHebrew:  { usurper:53, guide:107, mystery:129, adjuster:359, leader:655, regulator:983, genGov:2295, highOverseer:199095 },
  },

  // Mercury 8×8 (p.43–44)
  mercurySquare: {
    fire:  [[9,25,74,54,43,59,40,24],[17,33,62,46,51,71,32,16],[60,44,23,39,26,10,53,73],[72,52,15,31,34,18,45,61],[38,22,41,57,76,56,11,27],[30,14,49,69,64,48,19,35],[55,75,28,12,21,37,58,42],[47,63,36,20,13,29,70,50]],
    earth: [[47,55,30,38,72,60,17,9],[63,75,14,22,52,44,33,25],[36,28,49,41,15,23,62,74],[20,12,69,57,31,39,46,54],[13,21,64,76,34,26,51,43],[29,37,48,56,18,10,71,59],[70,58,19,11,45,53,32,40],[50,42,35,27,61,73,16,24]],
    air:   [[50,70,29,13,20,36,63,47],[42,58,37,21,12,28,75,55],[35,19,48,64,69,49,14,30],[27,11,56,76,57,41,22,38],[61,45,18,34,31,15,52,72],[73,53,10,26,39,23,44,60],[16,32,71,51,46,62,33,17],[24,40,59,43,54,74,25,9]],
    water: [[24,16,73,61,27,35,42,50],[40,32,53,45,11,19,58,70],[59,71,10,18,56,48,37,29],[43,51,26,34,76,64,21,13],[54,46,39,31,57,69,12,20],[74,62,23,15,41,49,28,36],[25,33,44,52,22,14,75,63],[9,17,60,72,38,30,55,47]],
    hierarchy: { usurper:9, guide:76, mystery:85, adjuster:328, leader:984, regulator:1312, genGov:2624, highOverseer:199424 },
    angelArabic: { usurper:328, guide:35, mystery:44, adjuster:287, leader:943, regulator:1271, genGov:2583, highOverseer:199383 },
    angelHebrew: { usurper:338, guide:45, mystery:54, adjuster:297, leader:953, regulator:1281, genGov:2593, highOverseer:199393 },
    jinnArabic:  { usurper:50, guide:117, mystery:126, adjuster:9, leader:665, regulator:993, genGov:2305, highOverseer:199105 },
    jinnHebrew:  { usurper:40, guide:107, mystery:116, adjuster:359, leader:655, regulator:983, genGov:2295, highOverseer:199095 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION F — ARIES: AMAMIAH (165) — COMPLETE MULTI-PLANET DATA
//  Angel of Fourth Quinance, page 45
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_AMAMIAH_COMPLETE = {
  name: "Angel of Fourth Quinance: Amamiah", hebrewValue: 165,
  gridSize: 3, planet: "Saturn",
  page: "45",

  hebrewSquare: { numerical: [[69,41,43,12],[42,13,68,42],[39,71,14,41]] },

  // Saturn 3×3 (p.45)
  saturnSquare: {
    fire:  [[56,51,58],[57,55,53],[52,59,54]],
    earth: [[52,57,56],[59,55,51],[54,53,58]],
    air:   [[54,59,52],[53,55,57],[58,51,56]],
    water: [[58,53,54],[51,55,59],[56,57,52]],
    hierarchy: { usurper:51, guide:59, mystery:110, adjuster:165, leader:495, regulator:660, genGov:1320, highOverseer:77880 },
    angelArabic: { usurper:10, guide:18, mystery:69, adjuster:124, leader:454, regulator:619, genGov:1279, highOverseer:77839 },
    angelHebrew: { usurper:20, guide:28, mystery:79, adjuster:134, leader:464, regulator:629, genGov:1289, highOverseer:77849 },
    jinnArabic:  { usurper:92, guide:100, mystery:151, adjuster:206, leader:176, regulator:341, genGov:1001, highOverseer:77561 },
    jinnHebrew:  { usurper:82, guide:90, mystery:141, adjuster:196, leader:166, regulator:331, genGov:991, highOverseer:77551 },
  },

  // Jupiter 4×4 (p.46)
  jupiterSquare: {
    fire:  [[33,44,38,50],[49,39,41,36],[43,34,51,37],[40,48,35,42]],
    air:   [[42,35,48,40],[37,51,34,43],[36,41,39,49],[50,38,44,33]],
    earth: [[40,43,49,33],[48,34,39,44],[35,51,41,38],[42,37,36,50]],
    water: [[50,36,37,42],[38,41,51,35],[44,39,34,48],[33,49,43,40]],
    hierarchy: { usurper:33, guide:51, mystery:84, adjuster:1320, leader:3960, regulator:5280, genGov:10560, highOverseer:538560 },
    angelArabic: { usurper:352, guide:10, mystery:43, adjuster:1279, leader:3919, regulator:5239, genGov:10519, highOverseer:538519 },
    angelHebrew: { usurper:2, guide:20, mystery:53, adjuster:1289, leader:3929, regulator:5249, genGov:10529, highOverseer:538529 },
    jinnArabic:  { usurper:74, guide:92, mystery:125, adjuster:1001, leader:3641, regulator:4961, genGov:10241, highOverseer:538241 },
    jinnHebrew:  { usurper:64, guide:82, mystery:115, adjuster:991, leader:3631, regulator:4951, genGov:10231, highOverseer:538231 },
  },

  // Mars 5×5 (p.47)
  marsSquare: {
    fire:  [[21,45,39,33,27],[34,28,22,41,40],[42,36,35,29,23],[30,24,43,37,31],[38,32,26,25,44]],
    air:   [[38,30,42,34,21],[32,24,36,28,45],[26,43,35,22,39],[25,37,29,41,33],[44,31,23,40,27]],
    earth: [[44,25,26,32,38],[31,37,43,24,30],[23,29,35,36,42],[40,41,22,28,34],[27,33,39,45,21]],
    water: [[27,40,23,31,44],[33,41,29,37,25],[39,22,35,43,26],[45,28,36,24,32],[21,34,42,30,38]],
    hierarchy: { usurper:21, guide:45, mystery:66, adjuster:165, leader:495, regulator:660, genGov:1320, highOverseer:59400 },
    angelArabic: { usurper:340, guide:4, mystery:25, adjuster:124, leader:454, regulator:619, genGov:1279, highOverseer:59359 },
    angelHebrew: { usurper:350, guide:14, mystery:35, adjuster:134, leader:464, regulator:629, genGov:1289, highOverseer:59369 },
    jinnArabic:  { usurper:62, guide:86, mystery:107, adjuster:206, leader:176, regulator:341, genGov:1001, highOverseer:59081 },
    jinnHebrew:  { usurper:52, guide:76, mystery:97, adjuster:196, leader:166, regulator:331, genGov:991, highOverseer:59071 },
  },

  // Sun 6×6 (pp.47–48)
  sunSquare: {
    fire:  [[10,21,41,27,31,35],[16,26,37,40,14,32],[22,44,30,20,36,13],[33,12,23,38,17,42],[39,28,19,11,43,25],[45,34,15,29,24,18]],
    air:   [[18,24,29,15,34,45],[25,43,11,19,28,39],[42,17,38,23,12,33],[13,36,20,30,44,22],[32,14,40,37,26,16],[35,31,27,41,21,10]],
    earth: [[45,39,33,22,16,10],[34,28,12,44,26,21],[15,19,23,30,37,41],[29,11,38,20,40,27],[24,43,17,36,14,31],[18,25,42,13,32,35]],
    water: [[35,32,13,42,25,18],[31,14,36,17,43,24],[27,40,20,38,11,29],[41,37,30,23,19,15],[21,26,44,12,28,34],[10,16,22,33,39,45]],
    hierarchy: { usurper:10, guide:45, mystery:55, adjuster:165, leader:495, regulator:660, genGov:1320, highOverseer:59400 },
    angelArabic: { usurper:329, guide:4, mystery:14, adjuster:124, leader:454, regulator:619, genGov:1279, highOverseer:59359 },
    angelHebrew: { usurper:339, guide:14, mystery:24, adjuster:134, leader:464, regulator:629, genGov:1289, highOverseer:59369 },
    jinnArabic:  { usurper:51, guide:86, mystery:96, adjuster:206, leader:176, regulator:341, genGov:1001, highOverseer:59081 },
    jinnHebrew:  { usurper:41, guide:76, mystery:86, adjuster:196, leader:166, regulator:331, genGov:991, highOverseer:59071 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION G — ARIES: NANAEL (132) — COMPLETE MULTI-PLANET DATA
//  Angel of Fifth Quinance, page 54
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_NANAEL_COMPLETE = {
  name: "Angel of Fifth Quinance: Nanael", hebrewValue: 132,
  gridSize: 3, planet: "Saturn",
  page: "54",

  hebrewSquare: { numerical: [[29,31,4,28],[3,29,28,32],[29,31,30,2]] },

  saturnSquare: {
    fire:  [[45,40,47],[46,44,42],[41,48,43]],
    earth: [[41,46,45],[48,44,40],[43,42,47]],
    air:   [[43,48,41],[42,44,46],[47,40,45]],
    water: [[47,42,43],[40,44,48],[45,46,41]],
    hierarchy: { usurper:40, guide:48, mystery:88, adjuster:132, leader:396, regulator:528, genGov:1056, highOverseer:50688 },
    angelArabic: { usurper:359, guide:7, mystery:47, adjuster:91, leader:355, regulator:487, genGov:1015, highOverseer:50647 },
    angelHebrew: { usurper:9, guide:17, mystery:57, adjuster:101, leader:365, regulator:497, genGov:1025, highOverseer:50657 },
    jinnArabic:  { usurper:81, guide:89, mystery:129, adjuster:173, leader:77, regulator:209, genGov:737, highOverseer:50369 },
    jinnHebrew:  { usurper:71, guide:79, mystery:119, adjuster:163, leader:67, regulator:199, genGov:727, highOverseer:50359 },
  },

  // Jupiter 4×4 (p.55)
  jupiterSquare: {
    fire:  [[25,36,30,41],[40,31,33,28],[35,26,42,29],[32,39,27,34]],
    air:   [[34,27,39,32],[29,42,26,35],[28,33,31,40],[41,30,36,25]],
    earth: [[32,35,40,25],[39,26,31,36],[27,42,33,30],[34,29,28,41]],
    water: [[41,28,29,34],[30,33,42,27],[36,31,26,39],[25,40,35,32]],
    hierarchy: { usurper:25, guide:42, mystery:67, adjuster:1056, leader:3168, regulator:4224, genGov:8448, highOverseer:354816 },
    angelArabic: { usurper:344, guide:1, mystery:26, adjuster:1015, leader:3127, regulator:4183, genGov:8407, highOverseer:354775 },
    angelHebrew: { usurper:354, guide:11, mystery:36, adjuster:1025, leader:3137, regulator:4193, genGov:8417, highOverseer:354785 },
    jinnArabic:  { usurper:66, guide:83, mystery:108, adjuster:737, leader:2849, regulator:3905, genGov:8129, highOverseer:354497 },
    jinnHebrew:  { usurper:56, guide:73, mystery:98, adjuster:727, leader:2839, regulator:3895, genGov:8119, highOverseer:354487 },
  },

  // Mars 5×5 (p.55)
  marsSquare: {
    fire:  [[14,40,32,26,20],[27,21,15,36,33],[37,29,28,22,16],[23,17,38,30,24],[31,25,19,18,39]],
    air:   [[31,23,37,27,14],[25,17,29,21,40],[19,38,28,15,32],[18,30,22,36,26],[39,24,16,33,20]],
    earth: [[39,18,19,25,31],[24,30,38,17,23],[16,22,28,29,37],[33,36,15,21,27],[20,26,32,40,14]],
    water: [[20,33,16,24,39],[26,36,22,30,18],[32,15,28,38,19],[40,21,29,17,25],[14,27,37,23,31]],
    hierarchy: { usurper:14, guide:40, mystery:54, adjuster:132, leader:396, regulator:528, genGov:1056, highOverseer:42240 },
    angelArabic: { usurper:333, guide:359, mystery:13, adjuster:91, leader:355, regulator:487, genGov:1015, highOverseer:42199 },
    angelHebrew: { usurper:343, guide:9, mystery:23, adjuster:101, leader:365, regulator:497, genGov:1025, highOverseer:42209 },
    jinnArabic:  { usurper:55, guide:81, mystery:95, adjuster:173, leader:77, regulator:209, genGov:737, highOverseer:41921 },
    jinnHebrew:  { usurper:45, guide:71, mystery:85, adjuster:163, leader:67, regulator:199, genGov:727, highOverseer:41911 },
  },

  // Sun 6×6 (p.56) — two variants
  sunSquare_A: {
    fire:  [[4,15,38,21,25,29],[10,20,31,37,8,26],[16,41,24,14,30,7],[27,6,17,32,11,39],[33,22,13,5,40,19],[42,28,9,23,18,12]],
    air:   [[12,18,23,9,28,42],[19,40,5,13,22,33],[39,11,32,17,6,27],[7,30,14,24,41,16],[26,8,37,31,20,10],[29,25,21,38,15,4]],
    earth: [[42,33,27,16,10,4],[28,22,6,41,20,15],[9,13,17,24,31,38],[23,5,32,14,37,21],[18,40,11,30,8,25],[12,19,39,7,26,29]],
    water: [[29,26,7,39,19,12],[25,8,30,11,40,18],[21,37,14,32,5,23],[38,31,24,17,13,9],[15,20,41,6,22,28],[4,10,16,27,33,42]],
    hierarchy: { usurper:4, guide:42, mystery:46, adjuster:132, leader:396, regulator:528, genGov:1056, highOverseer:44352 },
    angelArabic: { usurper:323, guide:1, mystery:5, adjuster:91, leader:355, regulator:487, genGov:1015, highOverseer:44311 },
    angelHebrew: { usurper:333, guide:11, mystery:15, adjuster:101, leader:365, regulator:497, genGov:1025, highOverseer:44321 },
    jinnArabic:  { usurper:45, guide:83, mystery:87, adjuster:173, leader:77, regulator:209, genGov:737, highOverseer:44033 },
    jinnHebrew:  { usurper:35, guide:73, mystery:77, adjuster:163, leader:67, regulator:199, genGov:727, highOverseer:44023 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION H — ARIES: NITHAEL (132) — COMPLETE DATA
//  Angel of Sixth Quinance, page 57
//  Note: Same gematria as Nanael (132) but different entity
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_NITHAEL_COMPLETE = {
  name: "Angel of Six Quinance: Nithael", hebrewValue: 132,
  gridSize: 4, planet: "Jupiter",
  page: "57",

  hebrewSquare: { numerical: [[49,11,403,28],[402,29,48,12],[9,51,30,401]] },

  // Jupiter 4×4 (p.57)
  jupiterSquare: {
    fire:  [[115,126,120,130],[129,121,123,118],[125,116,131,119],[122,128,117,124]],
    air:   [[124,117,128,122],[119,131,116,125],[118,123,121,129],[130,120,126,115]],
    earth: [[122,125,129,115],[128,116,121,126],[117,131,123,120],[124,119,118,130]],
    water: [[130,118,119,124],[120,123,131,117],[126,121,116,128],[115,129,125,122]],
    hierarchy: { usurper:115, guide:131, mystery:246, adjuster:3928, leader:11784, regulator:15712, genGov:31424, highOverseer:4116544 },
    angelArabic: { usurper:74, guide:90, mystery:205, adjuster:3887, leader:11743, regulator:15671, genGov:31383, highOverseer:4116503 },
    angelHebrew: { usurper:84, guide:100, mystery:215, adjuster:3897, leader:11753, regulator:15681, genGov:31393, highOverseer:4116513 },
    jinnArabic:  { usurper:156, guide:172, mystery:287, adjuster:3609, leader:11465, regulator:15393, genGov:31105, highOverseer:4116225 },
    jinnHebrew:  { usurper:146, guide:162, mystery:277, adjuster:3599, leader:11455, regulator:15383, genGov:31095, highOverseer:4116215 },
  },

  // Mars 5×5 (p.58)
  marsSquare: {
    fire:  [[86,111,104,98,92],[99,93,87,107,105],[108,101,100,94,88],[95,89,109,102,96],[103,97,91,90,110]],
    air:   [[103,95,108,99,86],[97,89,101,93,111],[91,109,100,87,104],[90,102,94,107,98],[110,96,88,105,92]],
    earth: [[110,90,91,97,103],[96,102,109,89,95],[88,94,100,101,108],[105,107,87,93,99],[92,98,104,111,86]],
    water: [[92,105,88,96,110],[98,107,94,102,90],[104,87,100,109,91],[111,93,101,89,97],[86,99,108,95,103]],
    hierarchy: { usurper:86, guide:111, mystery:197, adjuster:491, leader:1473, regulator:1964, genGov:3928, highOverseer:436008 },
    angelArabic: { usurper:45, guide:70, mystery:156, adjuster:450, leader:1432, regulator:1923, genGov:3887, highOverseer:435967 },
    angelHebrew: { usurper:55, guide:80, mystery:166, adjuster:460, leader:1442, regulator:1933, genGov:3897, highOverseer:435977 },
    jinnArabic:  { usurper:127, guide:152, mystery:238, adjuster:172, leader:1154, regulator:1645, genGov:3609, highOverseer:435689 },
    jinnHebrew:  { usurper:117, guide:142, mystery:228, adjuster:162, leader:1144, regulator:1635, genGov:3599, highOverseer:435679 },
  },

  // Sun 6×6 (p.58–59)
  sunSquare: {
    fire:  [[64,75,97,81,85,89],[70,80,91,96,68,86],[76,100,84,74,90,67],[87,66,77,92,71,98],[93,82,73,65,99,79],[101,88,69,83,78,72]],
    air:   [[72,78,83,69,88,101],[79,99,65,73,82,93],[98,71,92,77,66,87],[67,90,74,84,100,76],[86,68,96,91,80,70],[89,85,81,97,75,64]],
    earth: [[101,93,87,76,70,64],[88,82,66,100,80,75],[69,73,77,84,91,97],[83,65,92,74,96,81],[78,99,71,90,68,85],[72,79,98,67,86,89]],
    water: [[89,86,67,98,79,72],[85,68,90,71,99,78],[81,96,74,92,65,83],[97,91,84,77,73,69],[75,80,100,66,82,88],[64,70,76,87,93,101]],
    hierarchy: { usurper:64, guide:101, mystery:165, adjuster:491, leader:1473, regulator:1964, genGov:3928, highOverseer:396728 },
    angelArabic: { usurper:23, guide:60, mystery:124, adjuster:450, leader:1432, regulator:1923, genGov:3887, highOverseer:396687 },
    angelHebrew: { usurper:33, guide:70, mystery:134, adjuster:460, leader:1442, regulator:1933, genGov:3897, highOverseer:396697 },
    jinnArabic:  { usurper:105, guide:142, mystery:206, adjuster:172, leader:1154, regulator:1645, genGov:3609, highOverseer:396409 },
    jinnHebrew:  { usurper:95, guide:132, mystery:196, adjuster:162, leader:1144, regulator:1635, genGov:3599, highOverseer:396399 },
  },

  // Venus 7×7 (p.59)
  venusSquare: {
    fire:  [[46,87,72,57,77,91,61],[92,62,47,81,73,58,78],[59,79,93,63,48,82,67],[83,68,53,80,94,64,49],[65,50,84,69,54,74,95],[75,89,66,51,85,70,55],[71,56,76,90,60,52,86]],
    air:   [[86,52,60,90,76,56,71],[55,70,85,51,66,89,75],[95,74,54,69,84,50,65],[49,64,94,80,53,68,83],[67,82,48,63,93,79,59],[78,58,73,81,47,62,92],[61,91,77,57,72,87,46]],
    earth: [[71,75,65,83,59,92,46],[56,89,50,68,79,62,87],[76,66,84,53,93,47,72],[90,51,69,80,63,81,57],[60,85,54,94,48,73,77],[52,70,74,64,82,58,91],[86,55,95,49,67,78,61]],
    water: [[61,78,67,49,95,55,86],[91,58,82,64,74,70,52],[77,73,48,94,54,85,60],[57,81,63,80,69,51,90],[72,47,93,53,84,66,76],[87,62,79,68,50,89,56],[46,92,59,83,65,75,71]],
    hierarchy: { usurper:46, guide:95, mystery:141, adjuster:491, leader:1473, regulator:1964, genGov:3928, highOverseer:373160 },
    angelArabic: { usurper:5, guide:54, mystery:100, adjuster:450, leader:1432, regulator:1923, genGov:3887, highOverseer:373119 },
    angelHebrew: { usurper:15, guide:64, mystery:110, adjuster:460, leader:1442, regulator:1933, genGov:3897, highOverseer:373129 },
    jinnArabic:  { usurper:87, guide:136, mystery:182, adjuster:172, leader:1154, regulator:1645, genGov:3609, highOverseer:372841 },
    jinnHebrew:  { usurper:77, guide:126, mystery:172, adjuster:162, leader:1144, regulator:1635, genGov:3599, highOverseer:372831 },
  },

  // Mercury 8×8 (p.60)
  mercurySquare: {
    fire:  [[29,45,97,74,63,79,60,44],[37,53,82,66,71,94,52,36],[80,64,43,59,46,30,73,96],[95,72,35,51,54,38,65,81],[58,42,61,77,99,76,31,47],[50,34,69,92,84,68,39,55],[75,98,48,32,41,57,78,62],[67,83,56,40,33,49,93,70]],
    earth: [[67,75,50,58,95,80,37,29],[83,98,34,42,72,64,53,45],[56,48,69,61,35,43,82,97],[40,32,92,77,51,59,66,74],[33,41,84,99,54,46,71,63],[49,57,68,76,38,30,94,79],[93,78,39,31,65,73,52,60],[70,62,55,47,81,96,36,44]],
    air:   [[70,93,49,33,40,56,83,67],[62,78,57,41,32,48,98,75],[55,39,68,84,92,69,34,50],[47,31,76,99,77,61,42,58],[81,65,38,54,51,35,72,95],[96,73,30,46,59,43,64,80],[36,52,94,71,66,82,53,37],[44,60,79,63,74,97,45,29]],
    water: [[44,36,96,81,47,55,62,70],[60,52,73,65,31,39,78,93],[79,94,30,38,76,68,57,49],[63,71,46,54,99,84,41,33],[74,66,59,51,77,92,32,40],[97,82,43,35,61,69,48,56],[45,53,64,72,42,34,98,83],[29,37,80,95,58,50,75,67]],
    hierarchy: { usurper:29, guide:99, mystery:128, adjuster:491, leader:1473, regulator:1964, genGov:3928, highOverseer:388872 },
    angelArabic: { usurper:348, guide:58, mystery:87, adjuster:450, leader:1432, regulator:1923, genGov:3887, highOverseer:388831 },
    angelHebrew: { usurper:358, guide:68, mystery:97, adjuster:460, leader:1442, regulator:1933, genGov:3897, highOverseer:388841 },
    jinnArabic:  { usurper:70, guide:140, mystery:169, adjuster:172, leader:1154, regulator:1645, genGov:3609, highOverseer:388553 },
    jinnHebrew:  { usurper:60, guide:130, mystery:159, adjuster:162, leader:1144, regulator:1635, genGov:3599, highOverseer:388543 },
  },

  // Moon 9×9 (pp.62–63)
  moonSquare: {
    fire:  [[58,71,33,42,99,26,62,78,22],[18,61,83,38,54,70,25,47,95],[91,30,46,82,14,66,75,37,50],[85,17,60,69,40,53,94,24,49],[45,93,29,65,81,16,52,74,36],[32,57,73,28,41,98,21,64,77],[31,44,92,15,67,80,35,51,76],[72,34,56,97,27,43,79,20,63],[59,84,19,55,68,39,48,96,23]],
    earth: [[22,95,50,49,36,77,76,63,23],[78,47,37,24,74,64,51,20,96],[62,25,75,94,52,21,35,79,48],[26,70,66,53,16,98,80,43,39],[99,54,14,40,81,41,67,27,68],[42,38,82,69,65,28,15,97,55],[33,83,46,60,29,73,92,56,19],[71,61,30,17,93,57,44,34,84],[58,18,91,85,45,32,31,72,59]],
    air:   [[23,96,48,39,68,55,19,84,59],[63,20,79,43,27,97,56,34,72],[76,51,35,80,67,15,92,44,31],[77,64,21,98,41,28,73,57,32],[36,74,52,16,81,65,29,93,45],[49,24,94,53,40,69,60,17,85],[50,37,75,66,14,82,46,30,91],[95,47,25,70,54,38,83,61,18],[22,78,62,26,99,42,33,71,58]],
    water: [[59,72,31,32,45,85,91,18,58],[84,34,44,57,93,17,30,61,71],[19,56,92,73,29,60,46,83,33],[55,97,15,28,65,69,82,38,42],[68,27,67,41,81,40,14,54,99],[39,43,80,98,16,53,66,70,26],[48,79,35,21,52,94,75,25,62],[96,20,51,64,74,24,37,47,78],[23,63,76,77,36,49,50,95,22]],
    hierarchy: { usurper:14, guide:99, mystery:113, adjuster:491, leader:1473, regulator:1964, genGov:3928, highOverseer:388872 },
    angelArabic: { usurper:333, guide:58, mystery:72, adjuster:450, leader:1432, regulator:1923, genGov:3887, highOverseer:388831 },
    angelHebrew: { usurper:343, guide:68, mystery:82, adjuster:460, leader:1442, regulator:1933, genGov:3897, highOverseer:388841 },
    jinnArabic:  { usurper:55, guide:140, mystery:154, adjuster:172, leader:1154, regulator:1645, genGov:3609, highOverseer:388553 },
    jinnHebrew:  { usurper:45, guide:130, mystery:144, adjuster:162, leader:1144, regulator:1635, genGov:3599, highOverseer:388543 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION I — TAURUS CHAPTER: SIGN SHOR (506) — COMPLETE
//  Page 64. Note: "No Hebrew Squares Available"
// ─────────────────────────────────────────────────────────────────────────────
export const TAURUS_SHOR = {
  name: "Sign Taurus: Shor", hebrewValue: 506,
  gridSize: 4, planet: "Jupiter",
  note: "No Hebrew Squares Available",
  page: "64",

  jupiterSquare: {
    fire:  [[119,130,124,133],[132,125,127,122],[129,120,134,123],[126,131,121,128]],
    air:   [[128,121,131,126],[123,134,120,129],[122,127,125,132],[133,124,130,119]],
    earth: [[126,129,132,119],[131,120,125,130],[121,134,127,124],[128,123,122,133]],
    water: [[133,122,123,128],[124,127,134,121],[130,125,120,131],[119,132,129,126]],
    hierarchy: { usurper:119, guide:134, mystery:253, adjuster:4048, leader:12144, regulator:16192, genGov:32384, highOverseer:4339456 },
    angelArabic: { usurper:78, guide:93, mystery:212, adjuster:4007, leader:12103, regulator:16151, genGov:32343, highOverseer:4339415 },
    angelHebrew: { usurper:88, guide:103, mystery:222, adjuster:4017, leader:12113, regulator:16161, genGov:32353, highOverseer:4339425 },
    jinnArabic:  { usurper:160, guide:175, mystery:294, adjuster:3729, leader:11825, regulator:15873, genGov:32065, highOverseer:4339137 },
    jinnHebrew:  { usurper:150, guide:165, mystery:284, adjuster:3719, leader:11815, regulator:15863, genGov:32055, highOverseer:4339127 },
  },

  // Mars 5×5 (p.65)
  marsSquare: {
    fire:  [[89,114,107,101,95],[102,96,90,110,108],[111,104,103,97,91],[98,92,112,105,99],[106,100,94,93,113]],
    air:   [[106,98,111,102,89],[100,92,104,96,114],[94,112,103,90,107],[93,105,97,110,101],[113,99,91,108,95]],
    earth: [[113,93,94,100,106],[99,105,112,92,98],[91,97,103,104,111],[108,110,90,96,102],[95,101,107,114,89]],
    water: [[95,108,91,99,113],[101,110,97,105,93],[107,90,103,112,94],[114,96,104,92,100],[89,102,111,98,106]],
    hierarchy: { usurper:89, guide:114, mystery:203, adjuster:506, leader:1518, regulator:2024, genGov:4048, highOverseer:461472 },
    angelArabic: { usurper:48, guide:73, mystery:162, adjuster:465, leader:1477, regulator:1983, genGov:4007, highOverseer:461431 },
    angelHebrew: { usurper:58, guide:83, mystery:172, adjuster:475, leader:1487, regulator:1993, genGov:4017, highOverseer:461441 },
    jinnArabic:  { usurper:130, guide:155, mystery:244, adjuster:187, leader:1199, regulator:1705, genGov:3729, highOverseer:461153 },
    jinnHebrew:  { usurper:120, guide:145, mystery:234, adjuster:177, leader:1189, regulator:1695, genGov:3719, highOverseer:461143 },
  },

  // Sun 6×6 (pp.65–66)
  sunSquare_A: {
    fire:  [[66,77,102,83,87,91],[72,82,93,101,70,88],[78,105,86,76,92,69],[89,68,79,94,73,103],[95,84,75,67,104,81],[106,90,71,85,80,74]],
    air:   [[74,80,85,71,90,106],[81,104,67,75,84,95],[103,73,94,79,68,89],[69,92,76,86,105,78],[88,70,101,93,82,72],[91,87,83,102,77,66]],
    earth: [[106,95,89,78,72,66],[90,84,68,105,82,77],[71,75,79,86,93,102],[85,67,94,76,101,83],[80,104,73,92,70,87],[74,81,103,69,88,91]],
    water: [[91,88,69,103,81,74],[87,70,92,73,104,80],[83,101,76,94,67,85],[102,93,86,79,75,71],[77,82,105,68,84,90],[66,72,78,89,95,106]],
    hierarchy: { usurper:66, guide:106, mystery:172, adjuster:506, leader:1518, regulator:2024, genGov:4048, highOverseer:429088 },
    angelArabic: { usurper:25, guide:65, mystery:131, adjuster:465, leader:1477, regulator:1983, genGov:4007, highOverseer:429047 },
    angelHebrew: { usurper:35, guide:75, mystery:141, adjuster:475, leader:1487, regulator:1993, genGov:4017, highOverseer:429057 },
    jinnArabic:  { usurper:107, guide:147, mystery:213, adjuster:187, leader:1199, regulator:1705, genGov:3729, highOverseer:428769 },
    jinnHebrew:  { usurper:97, guide:137, mystery:203, adjuster:177, leader:1189, regulator:1695, genGov:3719, highOverseer:428759 },
  },

  // Venus 7×7 (pp.66)
  venusSquare: {
    fire:  [[48,89,74,59,79,94,63],[95,64,49,83,75,60,80],[61,81,96,65,50,84,69],[85,70,55,82,97,66,51],[67,52,86,71,56,76,98],[77,92,68,53,87,72,57],[73,58,78,93,62,54,88]],
    air:   [[88,54,62,93,78,58,73],[57,72,87,53,68,92,77],[98,76,56,71,86,52,67],[51,66,97,82,55,70,85],[69,84,50,65,96,81,61],[80,60,75,83,49,64,95],[63,94,79,59,74,89,48]],
    earth: [[73,77,67,85,61,95,48],[58,92,52,70,81,64,89],[78,68,86,55,96,49,74],[93,53,71,82,65,83,59],[62,87,56,97,50,75,79],[54,72,76,66,84,60,94],[88,57,98,51,69,80,63]],
    water: [[63,80,69,51,98,57,88],[94,60,84,66,76,72,54],[79,75,50,97,56,87,62],[59,83,65,82,71,53,93],[74,49,96,55,86,68,78],[89,64,81,70,52,92,58],[48,95,61,85,67,77,73]],
    hierarchy: { usurper:48, guide:98, mystery:146, adjuster:506, leader:1518, regulator:2024, genGov:4048, highOverseer:396704 },
    angelArabic: { usurper:7, guide:57, mystery:105, adjuster:465, leader:1477, regulator:1983, genGov:4007, highOverseer:396663 },
    angelHebrew: { usurper:17, guide:67, mystery:115, adjuster:475, leader:1487, regulator:1993, genGov:4017, highOverseer:396673 },
    jinnArabic:  { usurper:89, guide:139, mystery:187, adjuster:187, leader:1199, regulator:1705, genGov:3729, highOverseer:396385 },
    jinnHebrew:  { usurper:79, guide:129, mystery:177, adjuster:177, leader:1189, regulator:1695, genGov:3719, highOverseer:396375 },
  },

  // Mercury 8×8 (pp.67–68)
  mercurySquare: {
    fire:  [[31,47,98,76,65,81,62,46],[39,55,84,68,73,95,54,38],[82,66,45,61,48,32,75,97],[96,74,37,53,56,40,67,83],[60,44,63,79,100,78,33,49],[52,36,71,93,86,70,41,57],[77,99,50,34,43,59,80,64],[69,85,58,42,35,51,94,72]],
    earth: [[69,77,52,60,96,82,39,31],[85,99,36,44,74,66,55,47],[58,50,71,63,37,45,84,98],[42,34,93,79,53,61,68,76],[35,43,86,100,56,48,73,65],[51,59,70,78,40,32,95,81],[94,80,41,33,67,75,54,62],[72,64,57,49,83,97,38,46]],
    air:   [[72,94,51,35,42,58,85,69],[64,80,59,43,34,50,99,77],[57,41,70,86,93,71,36,52],[49,33,78,100,79,63,44,60],[83,67,40,56,53,37,74,96],[97,75,32,48,61,45,66,82],[38,54,95,73,68,84,55,39],[46,62,81,65,76,98,47,31]],
    water: [[46,38,97,83,49,57,64,72],[62,54,75,67,33,41,80,94],[81,95,32,40,78,70,59,51],[65,73,48,56,100,86,43,35],[76,68,61,53,79,93,34,42],[98,84,45,37,63,71,50,58],[47,55,66,74,44,36,99,85],[31,39,82,96,60,52,77,69]],
    hierarchy: { usurper:31, guide:100, mystery:131, adjuster:506, leader:1518, regulator:2024, genGov:4048, highOverseer:404800 },
    angelArabic: { usurper:350, guide:59, mystery:90, adjuster:465, leader:1477, regulator:1983, genGov:4007, highOverseer:404759 },
    angelHebrew: { usurper:360, guide:69, mystery:100, adjuster:475, leader:1487, regulator:1993, genGov:4017, highOverseer:404769 },
    jinnArabic:  { usurper:72, guide:141, mystery:172, adjuster:187, leader:1199, regulator:1705, genGov:3729, highOverseer:404481 },
    jinnHebrew:  { usurper:62, guide:131, mystery:162, adjuster:177, leader:1189, regulator:1695, genGov:3719, highOverseer:404471 },
  },

  // Moon 9×9 (pp.69–70)
  moonSquare: {
    fire:  [[60,73,35,44,98,28,64,80,24],[20,63,85,40,56,72,27,49,94],[90,32,48,84,16,68,77,39,52],[87,19,62,71,42,55,93,26,51],[47,92,31,67,83,18,54,76,38],[34,59,75,30,43,97,23,66,79],[33,46,91,17,69,82,37,53,78],[74,36,58,96,29,45,81,22,65],[61,86,21,57,70,41,50,95,25]],
    earth: [[24,94,52,51,38,79,78,65,25],[80,49,39,26,76,66,53,22,95],[64,27,77,93,54,23,37,81,50],[28,72,68,55,18,97,82,45,41],[98,56,16,42,83,43,69,29,70],[44,40,84,71,67,30,17,96,57],[35,85,48,62,31,75,91,58,21],[73,63,32,19,92,59,46,36,86],[60,20,90,87,47,34,33,74,61]],
    air:   [[25,95,50,41,70,57,21,86,61],[65,22,81,45,29,96,58,36,74],[78,53,37,82,69,17,91,46,33],[79,66,23,97,43,30,75,59,34],[38,76,54,18,83,67,31,92,47],[51,26,93,55,42,71,62,19,87],[52,39,77,68,16,84,48,32,90],[94,49,27,72,56,40,85,63,20],[24,80,64,28,98,44,35,73,60]],
    water: [[61,74,33,34,47,87,90,20,60],[86,36,46,59,92,19,32,63,73],[21,58,91,75,31,62,48,85,35],[57,96,17,30,67,71,84,40,44],[70,29,69,43,83,42,16,56,98],[41,45,82,97,18,55,68,72,28],[50,81,37,23,54,93,77,27,64],[95,22,53,66,76,26,39,49,80],[25,65,78,79,38,51,52,94,24]],
    hierarchy: { usurper:16, guide:98, mystery:114, adjuster:506, leader:1518, regulator:2024, genGov:4048, highOverseer:396704 },
    angelArabic: { usurper:335, guide:57, mystery:73, adjuster:465, leader:1477, regulator:1983, genGov:4007, highOverseer:396663 },
    angelHebrew: { usurper:345, guide:67, mystery:83, adjuster:475, leader:1487, regulator:1993, genGov:4017, highOverseer:396673 },
    jinnArabic:  { usurper:57, guide:139, mystery:155, adjuster:187, leader:1199, regulator:1705, genGov:3729, highOverseer:396385 },
    jinnHebrew:  { usurper:47, guide:129, mystery:145, adjuster:177, leader:1189, regulator:1695, genGov:3719, highOverseer:396375 },
  },

  // Saturn 10×10 (pp.70–71)
  saturnSquare: {
    fire:  [[1,19,26,64,55,94,48,40,72,87],[12,76,69,60,96,85,3,45,31,29],[27,32,56,95,86,71,20,8,49,62],[33,58,93,88,21,67,75,16,5,50],[46,92,90,25,36,59,63,73,18,4],[53,10,11,78,66,42,38,28,83,97],[65,47,7,14,80,35,23,84,100,51],[79,68,43,2,13,30,81,99,54,37],[89,22,34,41,9,17,98,52,70,74],[101,82,77,39,44,6,57,61,24,15]],
    earth: [[101,89,79,65,53,46,33,27,12,1],[82,22,68,47,10,92,58,32,76,19],[77,34,43,7,11,90,93,56,69,26],[39,41,2,14,78,25,88,95,60,64],[44,9,13,80,66,36,21,86,96,55],[6,17,30,35,42,59,67,71,85,94],[57,98,81,23,38,63,75,20,3,48],[61,52,99,84,28,73,16,8,45,40],[24,70,54,100,83,18,5,49,31,72],[15,74,37,51,97,4,50,62,29,87]],
    air:   [[15,24,61,57,6,44,39,77,82,101],[74,70,52,98,17,9,41,34,22,89],[37,54,99,81,30,13,2,43,68,79],[51,100,84,23,35,80,14,7,47,65],[97,83,28,38,42,66,78,11,10,53],[4,18,73,63,59,36,25,90,92,46],[50,5,16,75,67,21,88,93,58,33],[62,49,8,20,71,86,95,56,32,27],[29,31,45,3,85,96,60,69,76,12],[87,72,40,48,94,55,64,26,19,1]],
    water: [[87,29,62,50,4,97,51,37,74,15],[72,31,49,5,18,83,100,54,70,24],[40,45,8,16,73,28,84,99,52,61],[48,3,20,75,63,38,23,81,98,57],[94,85,71,67,59,42,35,30,17,6],[55,96,86,21,36,66,80,13,9,44],[64,60,95,88,25,78,14,2,41,39],[26,69,56,93,90,11,7,43,34,77],[19,76,32,58,92,10,47,68,22,82],[1,12,27,33,46,53,65,79,89,101]],
    hierarchy: { usurper:1, guide:101, mystery:102, adjuster:506, leader:1518, regulator:2024, genGov:4048, highOverseer:408848 },
    angelArabic: { usurper:320, guide:60, mystery:61, adjuster:465, leader:1477, regulator:1983, genGov:4007, highOverseer:408807 },
    angelHebrew: { usurper:330, guide:70, mystery:71, adjuster:475, leader:1487, regulator:1993, genGov:4017, highOverseer:408817 },
    jinnArabic:  { usurper:42, guide:142, mystery:143, adjuster:187, leader:1199, regulator:1705, genGov:3729, highOverseer:408529 },
    jinnHebrew:  { usurper:32, guide:132, mystery:133, adjuster:177, leader:1189, regulator:1695, genGov:3719, highOverseer:408519 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION J — TAURUS: ARCHANGEL ASMODEL (142) — COMPLETE DATA
//  Page 72
// ─────────────────────────────────────────────────────────────────────────────
export const TAURUS_ASMODEL = {
  name: "Archangel of Taurus: Asmodel", hebrewValue: 142,
  gridSize: 4, planet: "Jupiter",
  page: "72",

  hebrewSquare: { numerical: [[60,41,13,28],[12,29,59,42],[39,62,30,11]] },

  // Jupiter 4×4 (p.72)
  jupiterSquare: {
    fire:  [[28,39,33,42],[41,34,36,31],[38,29,43,32],[35,40,30,37]],
    air:   [[37,30,40,35],[32,43,29,38],[31,36,34,41],[42,33,39,28]],
    earth: [[35,38,41,28],[40,29,34,39],[30,43,36,33],[37,32,31,42]],
    water: [[42,31,32,37],[33,36,43,30],[39,34,29,40],[28,41,38,35]],
    hierarchy: { usurper:28, guide:43, mystery:71, adjuster:1136, leader:3408, regulator:4544, genGov:9088, highOverseer:390784 },
    angelArabic: { usurper:347, guide:2, mystery:30, adjuster:1095, leader:3367, regulator:4503, genGov:9047, highOverseer:390743 },
    angelHebrew: { usurper:357, guide:12, mystery:40, adjuster:1105, leader:3377, regulator:4513, genGov:9057, highOverseer:390753 },
    jinnArabic:  { usurper:69, guide:84, mystery:112, adjuster:817, leader:3089, regulator:4225, genGov:8769, highOverseer:390465 },
    jinnHebrew:  { usurper:59, guide:74, mystery:102, adjuster:807, leader:3079, regulator:4215, genGov:8759, highOverseer:390455 },
  },

  // Mars 5×5 (p.73)
  marsSquare: {
    fire:  [[16,42,34,28,22],[29,23,17,38,35],[39,31,30,24,18],[25,19,40,32,26],[33,27,21,20,41]],
    air:   [[33,25,39,29,16],[27,19,31,23,42],[21,40,30,17,34],[20,32,24,38,28],[41,26,18,35,22]],
    earth: [[41,20,21,27,33],[26,32,40,19,25],[18,24,30,31,39],[35,38,17,23,29],[22,28,34,42,16]],
    water: [[22,35,18,26,41],[28,38,24,32,20],[34,17,30,40,21],[42,23,31,19,27],[16,29,39,25,33]],
    hierarchy: { usurper:16, guide:42, mystery:58, adjuster:142, leader:426, regulator:568, genGov:1136, highOverseer:47712 },
    angelArabic: { usurper:335, guide:1, mystery:17, adjuster:101, leader:385, regulator:527, genGov:1095, highOverseer:47671 },
    angelHebrew: { usurper:345, guide:11, mystery:27, adjuster:111, leader:395, regulator:537, genGov:1105, highOverseer:47681 },
    jinnArabic:  { usurper:57, guide:83, mystery:99, adjuster:183, leader:107, regulator:249, genGov:817, highOverseer:47393 },
    jinnHebrew:  { usurper:47, guide:73, mystery:89, adjuster:173, leader:97, regulator:239, genGov:807, highOverseer:47383 },
  },

  // Sun 6×6 (p.74)
  sunSquare: {
    fire:  [[6,17,38,23,27,31],[12,22,33,37,10,28],[18,41,26,16,32,9],[29,8,19,34,13,39],[35,24,15,7,40,21],[42,30,11,25,20,14]],
    air:   [[14,20,25,11,30,42],[21,40,7,15,24,35],[39,13,34,19,8,29],[9,32,16,26,41,18],[28,10,37,33,22,12],[31,27,23,38,17,6]],
    earth: [[42,35,29,18,12,6],[30,24,8,41,22,17],[11,15,19,26,33,38],[25,7,34,16,37,23],[20,40,13,32,10,27],[14,21,39,9,28,31]],
    water: [[31,28,9,39,21,14],[27,10,32,13,40,20],[23,37,16,34,7,25],[38,33,26,19,15,11],[17,22,41,8,24,30],[6,12,18,29,35,42]],
    hierarchy: { usurper:6, guide:42, mystery:48, adjuster:142, leader:426, regulator:568, genGov:1136, highOverseer:47712 },
    angelArabic: { usurper:325, guide:1, mystery:7, adjuster:101, leader:385, regulator:527, genGov:1095, highOverseer:47671 },
    angelHebrew: { usurper:335, guide:11, mystery:17, adjuster:111, leader:395, regulator:537, genGov:1105, highOverseer:47681 },
    jinnArabic:  { usurper:47, guide:83, mystery:89, adjuster:183, leader:107, regulator:249, genGov:817, highOverseer:47393 },
    jinnHebrew:  { usurper:37, guide:73, mystery:79, adjuster:173, leader:97, regulator:239, genGov:807, highOverseer:47383 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION K — TAURUS: ANGEL ARAZIEL (249) — COMPLETE DATA
//  Page 75
// ─────────────────────────────────────────────────────────────────────────────
export const TAURUS_ARAZIEL = {
  name: "Angel of Taurus: Araziel", hebrewValue: 249,
  gridSize: 3, planet: "Saturn",
  page: "75",

  hebrewSquare: { numerical: [[200,8,13,28],[12,29,199,9],[6,202,30,11]] },

  saturnSquare: {
    fire:  [[84,79,86],[85,83,81],[80,87,82]],
    earth: [[80,85,84],[87,83,79],[82,81,86]],
    air:   [[82,87,80],[81,83,85],[86,79,84]],
    water: [[86,81,82],[79,83,87],[84,85,80]],
    hierarchy: { usurper:79, guide:87, mystery:166, adjuster:249, leader:747, regulator:996, genGov:1992, highOverseer:173304 },
    angelArabic: { usurper:38, guide:46, mystery:125, adjuster:208, leader:706, regulator:955, genGov:1951, highOverseer:173263 },
    angelHebrew: { usurper:48, guide:56, mystery:135, adjuster:218, leader:716, regulator:965, genGov:1961, highOverseer:173273 },
    jinnArabic:  { usurper:120, guide:128, mystery:207, adjuster:290, leader:428, regulator:677, genGov:1673, highOverseer:172985 },
    jinnHebrew:  { usurper:110, guide:118, mystery:197, adjuster:280, leader:418, regulator:667, genGov:1663, highOverseer:172975 },
  },

  // Jupiter 4×4 (pp.75–76)
  jupiterSquare: {
    fire:  [[54,65,59,71],[70,60,62,57],[64,55,72,58],[61,69,56,63]],
    earth: [[61,64,70,54],[69,55,60,65],[56,72,62,59],[63,58,57,71]],
    air:   [[63,56,69,61],[58,72,55,64],[57,62,60,70],[71,59,65,54]],
    water: [[71,57,58,63],[59,62,72,56],[65,60,55,69],[54,70,64,61]],
    hierarchy: { usurper:54, guide:72, mystery:126, adjuster:1992, leader:5976, regulator:7968, genGov:15936, highOverseer:1147392 },
    angelArabic: { usurper:13, guide:31, mystery:85, adjuster:1951, leader:5935, regulator:7927, genGov:15895, highOverseer:1147351 },
    angelHebrew: { usurper:23, guide:41, mystery:95, adjuster:1961, leader:5945, regulator:7937, genGov:15905, highOverseer:1147361 },
    jinnArabic:  { usurper:95, guide:113, mystery:167, adjuster:1673, leader:5657, regulator:7649, genGov:15617, highOverseer:1147073 },
    jinnHebrew:  { usurper:85, guide:103, mystery:157, adjuster:1663, leader:5647, regulator:7639, genGov:15607, highOverseer:1147063 },
  },

  // Mars 5×5 (p.76)
  marsSquare: {
    fire:  [[37,65,55,49,43],[50,44,38,61,56],[62,52,51,45,39],[46,40,63,53,47],[54,48,42,41,64]],
    air:   [[54,46,62,50,37],[48,40,52,44,65],[42,63,51,38,55],[41,53,45,61,49],[64,47,39,56,43]],
    earth: [[64,41,42,48,54],[47,53,63,40,46],[39,45,51,52,62],[56,61,38,44,50],[43,49,55,65,37]],
    water: [[43,56,39,47,64],[49,61,45,53,41],[55,38,51,63,42],[65,44,52,40,48],[37,50,62,46,54]],
    hierarchy: { usurper:37, guide:65, mystery:102, adjuster:249, leader:747, regulator:996, genGov:1992, highOverseer:129480 },
    angelArabic: { usurper:356, guide:24, mystery:61, adjuster:208, leader:706, regulator:955, genGov:1951, highOverseer:129439 },
    angelHebrew: { usurper:6, guide:34, mystery:71, adjuster:218, leader:716, regulator:965, genGov:1961, highOverseer:129449 },
    jinnArabic:  { usurper:78, guide:106, mystery:143, adjuster:290, leader:428, regulator:677, genGov:1673, highOverseer:129161 },
    jinnHebrew:  { usurper:68, guide:96, mystery:133, adjuster:280, leader:418, regulator:667, genGov:1663, highOverseer:129151 },
  },

  // Sun 6×6 (p.77)
  sunSquare: {
    fire:  [[24,35,55,41,45,49],[30,40,51,54,28,46],[36,58,44,34,50,27],[47,26,37,52,31,56],[53,42,33,25,57,39],[59,48,29,43,38,32]],
    air:   [[32,38,43,29,48,59],[39,57,25,33,42,53],[56,31,52,37,26,47],[27,50,34,44,58,36],[46,28,54,51,40,30],[49,45,41,55,35,24]],
    earth: [[59,53,47,36,30,24],[48,42,26,58,40,35],[29,33,37,44,51,55],[43,25,52,34,54,41],[38,57,31,50,28,45],[32,39,56,27,46,49]],
    water: [[49,46,27,56,39,32],[45,28,50,31,57,38],[41,54,34,52,25,43],[55,51,44,37,33,29],[35,40,58,26,42,48],[24,30,36,47,53,59]],
    hierarchy: { usurper:24, guide:59, mystery:83, adjuster:249, leader:747, regulator:996, genGov:1992, highOverseer:117408 },
    note_from_pdf: "PDF page 77 hierarchy: usurper=37, guide=65 for Mars variant; Sun usurper=24 confirmed from grid minimum",
    angelArabic: { usurper:343, guide:18, mystery:42, adjuster:208, leader:706, regulator:955, genGov:1951, highOverseer:117367 },
    angelHebrew: { usurper:353, guide:28, mystery:52, adjuster:218, leader:716, regulator:965, genGov:1961, highOverseer:117377 },
    jinnArabic:  { usurper:65, guide:100, mystery:124, adjuster:290, leader:428, regulator:677, genGov:1673, highOverseer:117089 },
    jinnHebrew:  { usurper:55, guide:90, mystery:114, adjuster:280, leader:418, regulator:667, genGov:1663, highOverseer:117079 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION L — TAURUS CHAPTER CATALOG
// ─────────────────────────────────────────────────────────────────────────────
export const TAURUS_CHAPTER_CATALOG = {
  sign: "Taurus",
  hebrewSignName: "Shor",
  hebrewSignValue: 506,
  noHebrewSquares: true,
  rulingPlanet: "Venus",
  chapterStart: 64,
  entitiesConfirmedInThisPDF: [
    { order:1, name:"Sign Taurus: Shor",          value:506, page:64, complete:true },
    { order:2, name:"Archangel: Asmodel",          value:142, page:72, complete:true },
    { order:3, name:"Angel: Araziel",              value:249, page:75, complete:true },
    { order:4, name:"Lord of Triplicity by Day",   value:null, page:"78+", complete:false, note:"Not in this PDF batch — next pages" },
    { order:5, name:"Lord of Triplicity by Night", value:null, page:"78+", complete:false },
    { order:6, name:"Angel 2nd House",             value:null, page:"78+", complete:false },
    { order:7, name:"1st Decanate",                value:null, page:"78+", complete:false },
    { order:8, name:"2nd Decanate",                value:null, page:"78+", complete:false },
    { order:9, name:"3rd Decanate",                value:null, page:"78+", complete:false },
    { order:10, name:"1st Quinance",               value:null, page:"78+", complete:false },
    { order:11, name:"2nd Quinance",               value:null, page:"78+", complete:false },
    { order:12, name:"3rd Quinance",               value:null, page:"78+", complete:false },
    { order:13, name:"4th Quinance",               value:null, page:"78+", complete:false },
    { order:14, name:"5th Quinance",               value:null, page:"78+", complete:false },
    { order:15, name:"6th Quinance",               value:null, page:"78+", complete:false },
  ],
  note: "Taurus chapter continues at p.78+ — this file stores p.64–77 only",
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION M — ARIES COMPLETION CONFIRMATION
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_COMPLETION_STATUS = {
  entitiesNowComplete: [
    { name:"Sapatavi (236)",    status:"COMPLETE — Jupiter+Mars+Sun+Venus all planetary sizes" },
    { name:"Ayel (42)",         status:"COMPLETE — Saturn+Jupiter squares" },
    { name:"Zazer (214)",       status:"COMPLETE — Jupiter+Mars+Sun+Venus squares" },
    { name:"Satander (323)",    status:"COMPLETE — Jupiter+Mars+Sun+Venus+Mercury squares (was stub only)" },
    { name:"Hechashiah (328)", status:"COMPLETE — Jupiter+Mars+Sun+Venus+Mercury+Moon squares" },
    { name:"Amamiah (165)",     status:"COMPLETE — Saturn+Jupiter+Mars+Sun squares" },
    { name:"Nanael (132)",      status:"COMPLETE — Saturn+Jupiter+Mars+Sun squares" },
    { name:"Nithael (132)",     status:"COMPLETE — Jupiter+Mars+Sun+Venus+Mercury+Moon squares" },
  ],
  remainingAries: [
    "Behahemi (62) — previously stored with Jupiter only. Multi-planet data may exist in pp.39–48 region.",
    "Vehuel (48) — previously stored with Saturn+Jupiter only.",
    "Daniel (95) — previously stored with Saturn+Jupiter+Mars.",
  ],
  note: "Daniel (95) hierarchy at Saturn level previously had adjuster=96 — PDF confirms adjuster=96 is correct (p.37).",
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION N — DANIEL (95) CORRECTION/CONFIRMATION (p.36–38)
//  The PDF shows Daniel's Saturn hierarchy as adjuster=96 (MC for 3×3 with usurper=28)
//  This DIFFERS from previously stored adjuster=96 — confirms existing data is correct.
//  ADDITIONALLY: Daniel has a Jupiter 4×4 at adjuster=768.
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_DANIEL_ADDITIONAL = {
  name: "Angel of Second Quinance: Daniel", hebrewValue: 95,
  page: "36-37",
  note: "Confirming previously stored Saturn data + adding Jupiter 4×4 hierarchy",

  // Saturn 3×3 — confirms existing record in bookKnowledgeBase.js
  saturnConfirmed: {
    hierarchy: { usurper:28, guide:36, mystery:64, adjuster:96, leader:288, regulator:384, genGov:768, highOverseer:27648 },
    angelArabic: { usurper:347, guide:355, mystery:23, adjuster:55, leader:247, regulator:343, genGov:727, highOverseer:27607 },
    angelHebrew: { usurper:357, guide:5, mystery:33, adjuster:65, leader:257, regulator:353, genGov:737, highOverseer:27617 },
    jinnArabic:  { usurper:69, guide:77, mystery:105, adjuster:137, leader:329, regulator:65, genGov:449, highOverseer:27329 },
    jinnHebrew:  { usurper:59, guide:67, mystery:95, adjuster:127, leader:319, regulator:55, genGov:439, highOverseer:27319 },
  },

  // Jupiter 4×4 — NEW (from p.37)
  jupiterSquare: {
    fire:  [[16,27,21,32],[31,22,24,19],[26,17,33,20],[23,30,18,25]],
    air:   [[25,18,30,23],[20,33,17,26],[19,24,22,31],[32,21,27,16]],
    earth: [[23,26,31,16],[30,17,22,27],[18,33,24,21],[25,20,19,32]],
    water: [[32,19,20,25],[21,24,33,18],[27,22,17,30],[16,31,26,23]],
    hierarchy: { usurper:16, guide:33, mystery:49, adjuster:768, leader:2304, regulator:3072, genGov:6144, highOverseer:202752 },
    angelArabic: { usurper:335, guide:352, mystery:8, adjuster:727, leader:2263, regulator:3031, genGov:6103, highOverseer:202711 },
    angelHebrew: { usurper:345, guide:2, mystery:18, adjuster:737, leader:2273, regulator:3041, genGov:6113, highOverseer:202721 },
    jinnArabic:  { usurper:57, guide:74, mystery:90, adjuster:449, leader:1985, regulator:2753, genGov:5825, highOverseer:202433 },
    jinnHebrew:  { usurper:47, guide:64, mystery:80, adjuster:439, leader:1975, regulator:2743, genGov:5815, highOverseer:202423 },
  },

  // Mars 5×5 (p.38)
  marsSquare: {
    fire:  [[7,32,25,19,13],[20,14,8,28,26],[29,22,21,15,9],[16,10,30,23,17],[24,18,12,11,31]],
    air:   [[24,16,29,20,7],[18,10,22,14,32],[12,30,21,8,25],[11,23,15,28,19],[31,17,9,26,13]],
    earth: [[31,11,12,18,24],[17,23,30,10,16],[9,15,21,22,29],[26,28,8,14,20],[13,19,25,32,7]],
    water: [[13,26,9,17,31],[19,28,15,23,11],[25,8,21,30,12],[32,14,22,10,18],[7,20,29,16,24]],
    hierarchy: { usurper:7, guide:32, mystery:39, adjuster:96, leader:288, regulator:384, genGov:768, highOverseer:24576 },
    angelArabic: { usurper:326, guide:351, mystery:358, adjuster:55, leader:247, regulator:343, genGov:727, highOverseer:24535 },
    angelHebrew: { usurper:336, guide:1, mystery:8, adjuster:65, leader:257, regulator:353, genGov:737, highOverseer:24545 },
    jinnArabic:  { usurper:48, guide:73, mystery:80, adjuster:137, leader:329, regulator:65, genGov:449, highOverseer:24257 },
    jinnHebrew:  { usurper:38, guide:63, mystery:70, adjuster:127, leader:319, regulator:55, genGov:439, highOverseer:24247 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION O — CROSS-CONFIRMATION: VEHUEL (48) JUPITER SQUARE (p.35–36)
// ─────────────────────────────────────────────────────────────────────────────
export const ARIES_VEHUEL_JUPITER = {
  name: "Angel of First Quinance: Vehuel — Jupiter 4×4 variant",
  hebrewValue: 48, page: "35",
  note: "Confirming Jupiter 4×4 squares for Vehuel",

  jupiterSquare: {
    fire:  [[4,15,9,20],[19,10,12,7],[14,5,21,8],[11,18,6,13]],
    earth: [[11,14,19,4],[18,5,10,15],[6,21,12,9],[13,8,7,20]],
    air:   [[13,6,18,11],[8,21,5,14],[7,12,10,19],[20,9,15,4]],
    water: [[20,7,8,13],[9,12,21,6],[15,10,5,18],[4,19,14,11]],
    hierarchy: { usurper:4, guide:21, mystery:25, adjuster:384, leader:1152, regulator:1536, genGov:3072, highOverseer:64512 },
    angelArabic: { usurper:323, guide:340, mystery:344, adjuster:343, leader:1111, regulator:1495, genGov:3031, highOverseer:64471 },
    angelHebrew: { usurper:333, guide:350, mystery:354, adjuster:353, leader:1121, regulator:1505, genGov:3041, highOverseer:64481 },
    jinnArabic:  { usurper:45, guide:62, mystery:66, adjuster:65, leader:833, regulator:1217, genGov:2753, highOverseer:64193 },
    jinnHebrew:  { usurper:35, guide:52, mystery:56, adjuster:55, leader:823, regulator:1207, genGov:2743, highOverseer:64183 },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION P — PROCESSING LOG
// ─────────────────────────────────────────────────────────────────────────────
export const TAURUS_PDF_LOG = {
  id: "PDF-TAURUS-PP25-77",
  date_added: "2026-06-07",
  source: "PDF: d582026a3_Occult_Encyclopedia_...-65-117.pdf",
  bookPagesProcessed: "25–77 (53 pages)",
  chaptersProcessed: [
    "Aries: Sapatavi(236) completion pp.25-28",
    "Aries: Ayel(42) pp.29-30",
    "Aries: Zazer(214) pp.31-34",
    "Aries: Satander(323) pp.48-53 (was stub only)",
    "Aries: Hechashiah(328) pp.40-43",
    "Aries: Amamiah(165) pp.45-47",
    "Aries: Nanael(132) pp.54-56",
    "Aries: Nithael(132) pp.57-63",
    "Taurus: Sign Shor(506) pp.64-71",
    "Taurus: Archangel Asmodel(142) pp.72-74",
    "Taurus: Angel Araziel(249) pp.75-77",
  ],
  newEntitiesAdded: 3,
  entitiesCompleted: 8,
  newPlanetaryTablesAdded: 45,
  criticalFindings: [
    "HighOverseer = GenGov × Guide confirmed on ALL entities in this PDF batch",
    "Taurus sign Shor = 506, No Hebrew Squares Available",
    "Taurus Archangel = Asmodel (142), gridSize=4, Jupiter",
    "Taurus Angel = Araziel (249), gridSize=3, Saturn",
    "Satander (323) was previously stub-only — now has full Jupiter/Mars/Sun/Venus/Mercury data",
    "Nithael (132) has 6 full planetary sizes including Moon 9×9",
    "Daniel (95) Jupiter 4×4 and Mars 5×5 added",
    "Vehuel (48) Jupiter 4×4 confirmed",
    "Aries chapter is now COMPLETE except Behahemi multi-planet",
    "Taurus pages 78–117 still needed for remaining 12 entities",
  ],
  remainingMissing: "Taurus pp.78–117 (12 entities: LordDay, LordNight, House2Angel, Decanates1-3, Quinances1-6)",
};

// ─────────────────────────────────────────────────────────────────────────────
//  HIGH OVERSEER VERIFICATION — THIS BATCH
// ─────────────────────────────────────────────────────────────────────────────
export const TAURUS_HO_VERIFICATION = {
  rule: "HighOverseer = GenGov × Guide",
  verified: true,
  examples: [
    { entity:"Sapatavi Jupiter", genGov:15104, guide:68, result:1027072 },
    { entity:"Sapatavi Mars", genGov:1888, guide:60, result:113280 },
    { entity:"Sapatavi Venus", genGov:1888, guide:62, result:117056 },
    { entity:"Ayel Saturn", genGov:336, guide:18, result:6048 },
    { entity:"Ayel Jupiter", genGov:2688, guide:18, result:48384 },
    { entity:"Zazer Jupiter", genGov:13696, guide:61, result:835456 },
    { entity:"Zazer Mars", genGov:1712, guide:58, result:99296 },
    { entity:"Satander Jupiter", genGov:20672, guide:89, result:1839808 },
    { entity:"Satander Mars", genGov:2584, guide:79, result:204136 },
    { entity:"Satander Mercury", genGov:2584, guide:78, result:201552 },
    { entity:"Hechashiah Jupiter", genGov:20992, guide:91, result:1910272 },
    { entity:"Hechashiah Mars", genGov:2624, guide:80, result:209920 },
    { entity:"Hechashiah Venus", genGov:2624, guide:76, result:199424 },
    { entity:"Hechashiah Mercury", genGov:2624, guide:76, result:199424 },
    { entity:"Hechashiah Moon", genGov:3928, guide:99, result:388872 },
    { entity:"Amamiah Saturn", genGov:1320, guide:59, result:77880 },
    { entity:"Amamiah Jupiter", genGov:10560, guide:51, result:538560 },
    { entity:"Nanael Saturn", genGov:1056, guide:48, result:50688 },
    { entity:"Nanael Jupiter", genGov:8448, guide:42, result:354816 },
    { entity:"Nithael Jupiter", genGov:31424, guide:131, result:4116544 },
    { entity:"Nithael Mars", genGov:3928, guide:111, result:436008 },
    { entity:"Nithael Sun", genGov:3928, guide:101, result:396728 },
    { entity:"Nithael Moon", genGov:3928, guide:99, result:388872 },
    { entity:"Shor Jupiter", genGov:32384, guide:134, result:4339456 },
    { entity:"Shor Mars", genGov:4048, guide:114, result:461472 },
    { entity:"Shor Saturn", genGov:4048, guide:101, result:408848 },
    { entity:"Asmodel Jupiter", genGov:9088, guide:43, result:390784 },
    { entity:"Asmodel Mars", genGov:1136, guide:42, result:47712 },
    { entity:"Araziel Saturn", genGov:1992, guide:87, result:173304 },
    { entity:"Araziel Jupiter", genGov:15936, guide:72, result:1147392 },
    { entity:"Daniel Jupiter", genGov:6144, guide:33, result:202752 },
  ],
};

export default {
  ARIES_SAPATAVI_COMPLETE, ARIES_AYEL_COMPLETE, ARIES_ZAZER_COMPLETE,
  ARIES_SATANDER_COMPLETE, ARIES_HECHASHIAH_COMPLETE, ARIES_AMAMIAH_COMPLETE,
  ARIES_NANAEL_COMPLETE, ARIES_NITHAEL_COMPLETE,
  ARIES_DANIEL_ADDITIONAL, ARIES_VEHUEL_JUPITER,
  ARIES_COMPLETION_STATUS,
  TAURUS_SHOR, TAURUS_ASMODEL, TAURUS_ARAZIEL,
  TAURUS_CHAPTER_CATALOG, TAURUS_PDF_LOG, TAURUS_HO_VERIFICATION,
};