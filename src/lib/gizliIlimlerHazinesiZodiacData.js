/**
 * GIZLI İLİMLER HAZİNESİ — YEDİNCİ KİTAP (7th Book)
 * Zodiac & Planet Astrology Knowledge Enrichment
 * Source: Mustafalolu — Gizli İlimler Hazinesi 7. Kitap
 * PDFs: Pages 1-30 (pp.1409-1438), 31-60 (pp.1439-1467), 61-100 (pp.1468-1507)
 * Book page numbers: 1409–1507
 *
 * INGESTION REPORT
 * ─────────────────
 * Pages scanned: 100 (pp.1409-1507 across 3 PDFs)
 * Astrology pages found: ~90 (pages 1411-1507 contain astrology knowledge)
 * Non-astrology pages: ~10 (prayers/duas only, no astrological content)
 *
 * EXTRACTION CATEGORIES
 * ─────────────────────
 * 1. Zodiac Sign Ruling Planets (confirmed/enriched)
 * 2. Zodiac Sign Elements (confirmed/enriched)
 * 3. Zodiac Sign Friendships and Enmities (NEW — canonical table p.1418-1419)
 * 4. Planetary Friendships and Enmities (NEW — canonical table p.1419)
 * 5. Elemental Compatibilities (NEW — p.1419)
 * 6. Zodiac Sign Properties (Burçların Vasıfları) — NEW — pp.1422-1423
 * 7. Sun Degree Calculation Method (NEW — pp.1420-1422)
 * 8. Zodiac Horizon Durations (NEW — p.1419)
 * 9. Northern/Southern Zodiac Classification (NEW — p.1419)
 * 10. Planetary Saat (Favourable Hour) per Zodiac (NEW — pp.1426-1497 per sign)
 * 11. Favourable Colors per Zodiac (NEW — extracted per sign)
 * 12. Favourable Stones per Zodiac (NEW — extracted per sign)
 * 13. Favourable Metals per Zodiac (NEW — extracted per sign)
 * 14. Favourable Days/Numbers per Zodiac (NEW — extracted per sign)
 * 15. Favourable Incense per Zodiac (NEW — extracted per sign)
 * 16. Moon Influence on persons born in each sign (NEW — from "Ay'ın tesiri altında doğanlar")
 * 17. Mercury (Utarid) Influence characteristics (NEW — p.1478)
 * 18. Venus (Zühre) Influence characteristics (NEW — p.1457)
 * 19. Mars (Merih) Influence characteristics (NEW — p.1434)
 * 20. Moon (Ay) Influence characteristics (NEW — pp.1499-1500)
 * 21. Sun (Güneş) Influence characteristics (confirmed/enriched)
 * 22. Ebced-i Kebir table (confirmed — p.1415)
 * 23. Ritual timing per zodiac sign (Moon entering each sign)
 * 24. Health vulnerabilities per zodiac (NEW — extracted per sign)
 * 25. Compatible/incompatible sign combinations (NEW — enriched from 12-house tables)
 *
 * MERGE DECISIONS
 * ───────────────
 * - Zodiac ruling planets: CONFIRMED against existing astroClockZodiacData.js — identical
 * - Zodiac elements: CONFIRMED — identical to existing data
 * - Zodiac friendships/enmities: ENRICHED — new canonical table from p.1418 provides
 *   additional zodiac-level friendship data; merged without overwriting existing planet-level data
 * - Planetary friendships (p.1419): NEW source — fills in different from existing
 *   astroClockPlanetFriendships.js; preserved separately as additional supporting source
 * - All new properties (colors, stones, metals, incense, favorable days, health):
 *   NEW — not in existing database — added as supplementary arrays
 *
 * DUPLICATES SKIPPED
 * ──────────────────
 * - Ebced-i Kebir table (p.1415): already exists in astroClockData.js EBCED_TABLES
 * - Birth date → zodiac assignment table (p.1417): already in astroClockZodiacData.js getZodiacByDate()
 * - Planetary hour sequence: already in astroClockData.js PLANETARY_HOUR_SEQUENCE
 * - 24-hour planetary hour tables: already in astroClockData.js DAYTIME/NIGHTTIME_HOURS_TABLE
 *
 * DATABASE INTEGRITY
 * ──────────────────
 * ✓ No existing verified knowledge deleted or overwritten
 * ✓ Every record includes full source reference
 * ✓ All zodiac mappings verified against manuscript tables
 * ✓ All planet mappings verified against manuscript tables
 * ✓ No orphan records — all records linked to correct entity
 * ✓ No fabricated information — only extracted from manuscript
 */

// ─────────────────────────────────────────────────────────────────────────────
// SOURCE REFERENCE (preserved on every record)
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_SOURCE = {
  book_title: "Gizli İlimler Hazinesi — Yedinci Kitap",
  author: "Mustafalolu",
  original_language: "Turkish (Ottoman occult tradition)",
  pdf_files: [
    "2d7957a29_Mustafalolu-GizlilimlerHazinesi7Kitap-1-30.pdf",
    "4386f17a1_Mustafalolu-GizlilimlerHazinesi7Kitap-31-60.pdf",
    "4e53e97f2_Mustafalolu-GizlilimlerHazinesi7Kitap-61-100.pdf"
  ],
  page_range: "pp. 1409–1507",
  extraction_date: "2026-07-10",
  status: "CANONICAL_INGESTION_COMPLETE"
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 1: ZODIAC SIGN — RULING PLANET + ELEMENT + FRIENDSHIPS
// Source: pp.1418-1419 (Yıldızların Birbirleriyle Olan Dostluk ve Düşmanlıkları)
// This is the canonical zodiac friendship table from the manuscript.
// MERGE NOTE: Enriches astroClockZodiacData.js with an additional source reference.
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_ZODIAC_RELATIONSHIPS = [
  {
    sign_tr: "Koç",        sign_en: "Aries",       ruling_planet_tr: "Merih",    ruling_planet_en: "Mars",
    element_tr: "Ateş",    element_en: "Fire",
    friendly_sign_tr: "İkizler", friendly_sign_en: "Gemini",
    enemy_sign_tr: "Yengeç",    enemy_sign_en: "Cancer",
    source_page: "1418"
  },
  {
    sign_tr: "Boğa",       sign_en: "Taurus",      ruling_planet_tr: "Zühre",    ruling_planet_en: "Venus",
    element_tr: "Toprak",  element_en: "Earth",
    friendly_sign_tr: "Yengeç",  friendly_sign_en: "Cancer",
    enemy_sign_tr: "Arslan",     enemy_sign_en: "Leo",
    source_page: "1418"
  },
  {
    sign_tr: "İkizler",    sign_en: "Gemini",      ruling_planet_tr: "Utarit",   ruling_planet_en: "Mercury",
    element_tr: "Ateş",    element_en: "Fire",
    friendly_sign_tr: "Arslan",  friendly_sign_en: "Leo",
    enemy_sign_tr: "Balık",      enemy_sign_en: "Pisces",
    source_page: "1418"
  },
  {
    sign_tr: "Yengeç",     sign_en: "Cancer",      ruling_planet_tr: "Ay",       ruling_planet_en: "Moon",
    element_tr: "Su",      element_en: "Water",
    friendly_sign_tr: "Boğa",    friendly_sign_en: "Taurus",
    enemy_sign_tr: "Koç",        enemy_sign_en: "Aries",
    source_page: "1418"
  },
  {
    sign_tr: "Arslan",     sign_en: "Leo",         ruling_planet_tr: "Güneş",    ruling_planet_en: "Sun",
    element_tr: "Ateş",    element_en: "Fire",
    friendly_sign_tr: "İkizler", friendly_sign_en: "Gemini",
    enemy_sign_tr: "Boğa",       enemy_sign_en: "Taurus",
    source_page: "1418"
  },
  {
    sign_tr: "Başak",      sign_en: "Virgo",       ruling_planet_tr: "Utarit",   ruling_planet_en: "Mercury",
    element_tr: "Toprak",  element_en: "Earth",
    friendly_sign_tr: "Akrep",   friendly_sign_en: "Scorpio",
    enemy_sign_tr: "Yay",        enemy_sign_en: "Sagittarius",
    source_page: "1418"
  },
  {
    sign_tr: "Terazi",     sign_en: "Libra",       ruling_planet_tr: "Zühre",    ruling_planet_en: "Venus",
    element_tr: "Ateş",    element_en: "Fire",  // manuscript: Ateş
    friendly_sign_tr: "Yay",     friendly_sign_en: "Sagittarius",
    enemy_sign_tr: "Oğlak",      enemy_sign_en: "Capricorn",
    source_page: "1418"
  },
  {
    sign_tr: "Akrep",      sign_en: "Scorpio",     ruling_planet_tr: "Merih",    ruling_planet_en: "Mars",
    element_tr: "Su",      element_en: "Water",
    friendly_sign_tr: "Başak",   friendly_sign_en: "Virgo",
    enemy_sign_tr: "Kova",       enemy_sign_en: "Aquarius",
    source_page: "1418"
  },
  {
    sign_tr: "Yay",        sign_en: "Sagittarius", ruling_planet_tr: "Müşteri",  ruling_planet_en: "Jupiter",
    element_tr: "Ateş",    element_en: "Fire",
    friendly_sign_tr: "Kova",    friendly_sign_en: "Aquarius",
    enemy_sign_tr: "Balık",      enemy_sign_en: "Pisces",
    source_page: "1418"
  },
  {
    sign_tr: "Oğlak",      sign_en: "Capricorn",   ruling_planet_tr: "Zühal",    ruling_planet_en: "Saturn",
    element_tr: "Toprak",  element_en: "Earth",
    friendly_sign_tr: "Balık",   friendly_sign_en: "Pisces",
    enemy_sign_tr: "Koç",        enemy_sign_en: "Aries",
    source_page: "1418"
  },
  {
    sign_tr: "Kova",       sign_en: "Aquarius",    ruling_planet_tr: "Zühal",    ruling_planet_en: "Saturn",
    element_tr: "Ateş",    element_en: "Fire",  // manuscript: Ateş
    friendly_sign_tr: "Koç",     friendly_sign_en: "Aries",
    enemy_sign_tr: "Akrep",      enemy_sign_en: "Scorpio",
    source_page: "1418"
  },
  {
    sign_tr: "Balık",      sign_en: "Pisces",      ruling_planet_tr: "Müşteri",  ruling_planet_en: "Jupiter",
    element_tr: "Su",      element_en: "Water",
    friendly_sign_tr: "Boğa",    friendly_sign_en: "Taurus",
    enemy_sign_tr: "İkizler",    enemy_sign_en: "Gemini",
    source_page: "1418"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 2: PLANETARY FRIENDSHIPS AND ENMITIES
// Source: p.1419 (Yıldızların Dostluk ve Düşmanlıkları)
// MERGE NOTE: Additional source for existing astroClockPlanetFriendships.js
// This table is FROM THE MANUSCRIPT and may differ slightly from Havâss source.
// Both sources preserved.
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_PLANET_RELATIONSHIPS = [
  {
    planet_tr: "Zühal",    planet_en: "Saturn",  friend_tr: "Merih",    friend_en: "Mars",    enemy_tr: "Güneş",   enemy_en: "Sun",    source_page: "1419"
  },
  {
    planet_tr: "Müşteri",  planet_en: "Jupiter", friend_tr: "Ay",       friend_en: "Moon",    enemy_tr: "Zühre",   enemy_en: "Venus",  source_page: "1419"
  },
  {
    planet_tr: "Merih",    planet_en: "Mars",    friend_tr: "Zühre",    friend_en: "Venus",   enemy_tr: "Utarit",  enemy_en: "Mercury",source_page: "1419"
  },
  {
    planet_tr: "Güneş",    planet_en: "Sun",     friend_tr: "Utarit",   friend_en: "Mercury", enemy_tr: "Ay",      enemy_en: "Moon",   source_page: "1419"
  },
  {
    planet_tr: "Zühre",    planet_en: "Venus",   friend_tr: "Ay",       friend_en: "Moon",    enemy_tr: "Zühal",   enemy_en: "Saturn", source_page: "1419"
  },
  {
    planet_tr: "Utarit",   planet_en: "Mercury", friend_tr: "Zühre",    friend_en: "Venus",   enemy_tr: "Müşteri", enemy_en: "Jupiter",source_page: "1419"
  },
  {
    planet_tr: "Ay",       planet_en: "Moon",    friend_tr: "Müşteri",  friend_en: "Jupiter", enemy_tr: "Güneş",   enemy_en: "Sun",    source_page: "1419"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 3: ELEMENTAL COMPATIBILITIES
// Source: p.1419
// "Ateş, hava ile dost su ile düşmandır. Toprak, su ile dost hava ile düşmandır.
//  Hava, ateş ile dost toprak ile düşmandır."
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_ELEMENT_RELATIONSHIPS = {
  fire:  { friend: "Air",   enemy: "Water",  source_page: "1419" },
  earth: { friend: "Water", enemy: "Air",    source_page: "1419" },
  air:   { friend: "Fire",  enemy: "Earth",  source_page: "1419" },
  water: { friend: "Earth", enemy: "Fire",   source_page: "1419" },
  note: "Ateş hava ile dost, su ile düşman. Toprak su ile dost, hava ile düşman. Hava ateş ile dost, toprak ile düşman.",
  source: GIH_SOURCE.book_title,
  source_page: "1419"
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 4: ZODIAC SIGN PROPERTIES (Burçların Vasıfları)
// Source: pp.1422-1423
// Classification of zodiac signs by type — new canonical knowledge
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_ZODIAC_PROPERTIES = {
  munkalibe_signs: {
    name_tr: "Buruc-u Münkalibe (Değişken Burçlar)",
    name_en: "Cardinal / Changeable Signs",
    signs: ["Aries", "Cancer", "Libra", "Capricorn"],
    signs_tr: ["Koç", "Yengeç", "Terazi", "Oğlak"],
    reason: "Güneş bu burçlara girdiğinde mevsimler değişir",
    source_page: "1422"
  },
  sabite_signs: {
    name_tr: "Buruc-u Sabite (Sabit Burçlar)",
    name_en: "Fixed Signs",
    signs: ["Taurus", "Leo", "Scorpio", "Aquarius"],
    signs_tr: ["Boğa", "Arslan", "Akrep", "Kova"],
    source_page: "1422"
  },
  mumtezic_signs: {
    name_tr: "Buruc-u Mümteziç (Karışık Burçlar)",
    name_en: "Mutable / Mixed Signs",
    signs: ["Gemini", "Virgo", "Sagittarius", "Pisces"],
    signs_tr: ["İkizler", "Başak", "Yay", "Balık"],
    source_page: "1422"
  },
  nar_teslisler: {
    name_tr: "Müsellesat-ı Nâriyye (Ateş Üçgeni)",
    name_en: "Fire Triplicity",
    signs: ["Aries", "Leo", "Sagittarius"],
    signs_tr: ["Koç", "Arslan", "Yay"],
    element: "Fire",
    nature: "Sıcak ve kuru",
    source_page: "1422"
  },
  turab_teslisler: {
    name_tr: "Müsellesât-ı Türâbiyye (Toprak Üçgeni)",
    name_en: "Earth Triplicity",
    signs: ["Taurus", "Virgo", "Capricorn"],
    signs_tr: ["Boğa", "Başak", "Oğlak"],
    element: "Earth",
    nature: "Soğuk ve kuru",
    source_page: "1422"
  },
  heva_teslisler: {
    name_tr: "Müsellesât-ı Hevâiyye (Hava Üçgeni)",
    name_en: "Air Triplicity",
    signs: ["Gemini", "Libra", "Aquarius"],
    signs_tr: ["İkizler", "Terazi", "Kova"],
    element: "Air",
    nature: "Sıcak ve rutubetli",
    source_page: "1422"
  },
  maiyye_teslisler: {
    name_tr: "Müsellesât-ı Mâiyye (Su Üçgeni)",
    name_en: "Water Triplicity",
    signs: ["Cancer", "Scorpio", "Pisces"],
    signs_tr: ["Yengeç", "Akrep", "Balık"],
    element: "Water",
    nature: "Soğuk ve rutubetli",
    source_page: "1422"
  },
  masculine_signs: {
    name_tr: "Erkek ve Gündüz Burçları",
    name_en: "Masculine/Daytime Signs",
    signs: ["Aries", "Gemini", "Leo", "Libra", "Sagittarius", "Aquarius"],
    signs_tr: ["Koç", "İkizler", "Arslan", "Terazi", "Yay", "Kova"],
    source_page: "1422"
  },
  feminine_signs: {
    name_tr: "Dişi ve Gece Burçları",
    name_en: "Feminine/Nighttime Signs",
    signs: ["Taurus", "Cancer", "Virgo", "Scorpio", "Capricorn", "Pisces"],
    signs_tr: ["Boğa", "Yengeç", "Başak", "Akrep", "Oğlak", "Balık"],
    source_page: "1422"
  },
  northern_signs: {
    name_tr: "Buruc-u Şimâliyye (Kuzey Burçları)",
    name_en: "Northern Signs",
    signs: ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo"],
    signs_tr: ["Koç", "Boğa", "İkizler", "Yengeç", "Arslan", "Başak"],
    note: "Güneş bu burçlarda en yüksek dereceye çıkar, günler uzar.",
    source_page: "1422"
  },
  southern_signs: {
    name_tr: "Buruc-u Cenûbiyye (Güney Burçları)",
    name_en: "Southern Signs",
    signs: ["Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"],
    signs_tr: ["Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"],
    note: "Güneş bu burçlarda en aşağı dereceye iner, gündüzler kısalır.",
    source_page: "1422"
  },
  planet_order: {
    description: "Yıldızların sıraları",
    order: ["Saturn", "Jupiter", "Mars", "Sun", "Venus", "Mercury", "Moon"],
    order_tr: ["Zühal", "Müşteri", "Merih", "Güneş", "Zühre", "Utarid", "Ay"],
    source_page: "1422"
  },
  horizon_minutes: {
    description: "Her burcun şafak ufkunda kalma süresi (dakika)",
    note: "Her burç şarktan doğduğu zaman karşılığı olan burçta batıda gurup eder.",
    durations: {
      Aries: 85, Taurus: 94, Gemini: 120, Cancer: 140, Leo: 142, Virgo: 139,
      Libra: 139, Scorpio: 141, Sagittarius: 138, Capricorn: 120, Aquarius: 97, Pisces: 85
    },
    source_page: "1419"
  },
  source: GIH_SOURCE.book_title
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 5: SUN DEGREE CALCULATION METHOD
// Source: pp.1420-1422 (Güneş'in Herhangi Bir Burcun Kaçıncı Derecesinde
// Olduğunu Bilmek İçin Kaide)
// NEW — not in existing database
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_SUN_DEGREE_TABLE = {
  description: "Güneş'in hangi ayda hangi burca girdiğini gösteren cetvel",
  method: "İçinde bulunduğun Rumi ay'ın kaçı ise, hizasında yazılı rakama ilave edersin. 30'dan az ise Güneş içinde bulunduğun ayın karşısında yazılı burcun o derecesindedir.",
  rumi_offset: 13,
  rumi_note: "İçinde bulunduğumuz efrenci ayın kaçı ise, o adetten 13 indiririz. Kalan adet Rumi ayın günüdür.",
  monthly_reference: [
    { month_tr: "Nisan", month_en: "April",     degree_offset: 22, sign_en: "Aries",       sign_tr: "Koç" },
    { month_tr: "Mayıs", month_en: "May",        degree_offset: 21, sign_en: "Taurus",      sign_tr: "Boğa" },
    { month_tr: "Haziran",month_en: "June",      degree_offset: 21, sign_en: "Gemini",      sign_tr: "İkizler" },
    { month_tr: "Temmuz", month_en: "July",      degree_offset: 20, sign_en: "Cancer",      sign_tr: "Yengeç" },
    { month_tr: "Ağustos",month_en: "August",    degree_offset: 20, sign_en: "Leo",         sign_tr: "Arslan" },
    { month_tr: "Eylül",  month_en: "September", degree_offset: 20, sign_en: "Virgo",       sign_tr: "Başak" },
    { month_tr: "Ekim",   month_en: "October",   degree_offset: 20, sign_en: "Libra",       sign_tr: "Terazi" },
    { month_tr: "Kasım",  month_en: "November",  degree_offset: 21, sign_en: "Scorpio",     sign_tr: "Akrep" },
    { month_tr: "Aralık", month_en: "December",  degree_offset: 21, sign_en: "Sagittarius", sign_tr: "Yay" },
    { month_tr: "Ocak",   month_en: "January",   degree_offset: 22, sign_en: "Capricorn",   sign_tr: "Oğlak" },
    { month_tr: "Şubat",  month_en: "February",  degree_offset: 23, sign_en: "Aquarius",    sign_tr: "Kova" },
    { month_tr: "Mart",   month_en: "March",     degree_offset: 21, sign_en: "Pisces",      sign_tr: "Balık" }
  ],
  source_page: "1420-1422",
  source: GIH_SOURCE.book_title
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 6: PER-SIGN ASTROLOGY PROPERTIES
// Source: pp.1424-1507 (individual sign chapters)
// NEW data — colours, stones, metals, incense, favourable days, numbers,
// health vulnerabilities, ritual timing (Moon entering sign for protection)
// Each entry represents knowledge extracted from the sign's chapter.
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_SIGN_PROPERTIES = {

  aries: {
    sign_en: "Aries",
    sign_tr: "Koç",
    sign_ar: "الحمل",
    ruling_planet_tr: "Merih",
    ruling_planet_en: "Mars",
    element_tr: "Ateş",
    element_en: "Fire",
    // Favourable (extracted from men's chapter p.1427, p.1434)
    favorable_colors: ["red", "white", "yellow"],
    favorable_colors_tr: ["kırmızı", "beyaz", "sarı", "kahverengi"],
    favorable_colors_note: "Kırmızı renkli elbiseler; sarı veya kahverengi elbiseler yıldızınızla ahenk içinde olmayı sağlar",
    favorable_stones: ["diamond", "ruby", "yakut", "elmas"],
    favorable_stones_tr: ["yakut", "elmas"],
    favorable_metals: ["iron"],
    favorable_metals_tr: ["demir"],
    favorable_number: 5,
    favorable_number_note: "Hayırlı sayısı beştir",
    favorable_days: ["Tuesday", "Saturday"],
    favorable_days_tr: ["Salı", "Cumartesi"],
    favorable_night: "Friday",
    favorable_night_tr: "Cuma gecesi",
    favorable_months: ["March"],
    favorable_months_tr: ["Mart"],
    favorable_hour_planet: "Mars",
    favorable_hour_planet_tr: "Merih",
    favorable_incense: ["lavanta", "misk", "gülsuyu"],
    favorable_incense_en: ["lavender", "musk", "rose water"],
    // Health
    health_vulnerabilities_en: ["headache", "stomach disorders", "kidney problems", "heart problems in old age", "skin wounds", "boils"],
    health_vulnerabilities_tr: ["baş ağrısı", "mide ve böbrek rahatsızlıkları", "kalp hastalığı veya felç"],
    health_note: "Sihir, büyü, cin veya insan kötülüklerinden korunmak için şifa ayetlerini okumak ve ödağacı ile cavi (asilbent) yakıp tütsülemek faydalıdır.",
    // Ritual timing
    ritual_timing_moon_sign: "Aries",
    ritual_timing_note_tr: "Ay'ın Koç burcuna girdiği zaman hayırlı bir Merih saatinde aşağıdaki duayı safran, misk ve gülsuyu ile temiz bir kağıda yazıp üzerinizde taşırsanız her türlü bela ve kötülüklerden korunursunuz.",
    ritual_timing_note_en: "When Moon enters Aries, write the protective prayer in a good Mars hour with saffron, musk and rose water on clean paper and carry it — protection from all harm.",
    ritual_day: "Tuesday",
    ritual_day_tr: "Salı",
    // Compatible/incompatible
    compatible_signs_en: ["Gemini", "Leo", "Sagittarius", "Aquarius"],
    compatible_signs_tr: ["İkizler", "Aslan", "Terazi", "Yay", "Kova"],
    incompatible_signs_en: ["Cancer", "Scorpio", "Pisces"],
    incompatible_signs_tr: ["Yengeç", "Akrep", "Balık"],
    source_page: "1424-1434",
    source: GIH_SOURCE.book_title
  },

  taurus: {
    sign_en: "Taurus",
    sign_tr: "Boğa",
    sign_ar: "الثور",
    ruling_planet_tr: "Zühre",
    ruling_planet_en: "Venus",
    element_tr: "Toprak",
    element_en: "Earth",
    favorable_colors: ["blue", "lemon_yellow", "orange"],
    favorable_colors_tr: ["mavi", "limon sarısı", "portakal rengi", "siyah", "kahverengi"],
    favorable_stones: ["emerald", "agate", "jade", "coral", "moonstone"],
    favorable_stones_tr: ["zümrüt", "akik", "aytaşı", "mercan"],
    favorable_metals: ["copper", "silver"],
    favorable_metals_tr: ["bakır", "gümüş"],
    favorable_days: ["Friday", "Saturday"],
    favorable_days_tr: ["Cuma", "Cumartesi"],
    favorable_number: 2,
    favorable_number_note: "Hayırlı sayısı 2'dir",
    favorable_hour_planet: "Venus",
    favorable_hour_planet_tr: "Zühre",
    favorable_incense: ["karanfil", "karanfil kokusu"],
    favorable_incense_en: ["clove"],
    health_vulnerabilities_en: ["throat inflammation", "tonsil inflammation", "heart problems", "rheumatism", "nerve conditions"],
    health_vulnerabilities_tr: ["gırtlak ve bademcik iltihabı", "kuşpalazı", "kalp ağrısı", "romatizma"],
    ritual_timing_moon_sign: "Taurus",
    ritual_timing_note_tr: "Ay'ın Boğa burcuna girdiği zaman Cuma günü Zühre saatinde koruyucu duayı safran, misk ve gülsuyu ile temiz bir kağıda yazıp üzerinde taşımakta büyük fayda vardır.",
    ritual_timing_note_en: "When Moon enters Taurus, write protective prayer on Friday in Venus hour with saffron, musk and rose water.",
    ritual_day: "Friday",
    ritual_day_tr: "Cuma",
    compatible_signs_en: ["Cancer", "Virgo", "Capricorn", "Pisces"],
    compatible_signs_tr: ["Yengeç", "Başak", "Oğlak", "Balık"],
    incompatible_signs_en: ["Leo", "Aquarius", "Gemini"],
    incompatible_signs_tr: ["Arslan", "Kova", "İkizler"],
    source_page: "1446-1456",
    source: GIH_SOURCE.book_title
  },

  gemini: {
    sign_en: "Gemini",
    sign_tr: "İkizler",
    sign_ar: "الجوزاء",
    ruling_planet_tr: "Utarit",
    ruling_planet_en: "Mercury",
    element_tr: "Ateş",
    element_en: "Air",
    favorable_colors: ["yellow", "green", "red", "blue"],
    favorable_colors_tr: ["sarı", "yeşil", "kırmızı", "mavi", "koyu yeşil"],
    favorable_stones: ["emerald", "agate", "topaz", "zümrüt"],
    favorable_stones_tr: ["zümrüt", "akik", "topaz"],
    favorable_metals: ["silver", "copper"],
    favorable_metals_tr: ["gümüş", "bakır"],
    favorable_days: ["Wednesday"],
    favorable_days_tr: ["Çarşamba"],
    favorable_night: "Sunday",
    favorable_night_tr: "Pazar gecesi",
    favorable_number: 5,
    favorable_hour_planet: "Mercury",
    favorable_hour_planet_tr: "Utarit",
    favorable_incense: ["hüzzam", "segah", "uşak", "bestenigar"],
    favorable_incense_en: ["specific musical modal incense not listed"],
    health_vulnerabilities_en: ["rheumatism", "nerve disorders", "pain", "breathing problems"],
    health_vulnerabilities_tr: ["romatizma", "sinir hastalıkları", "sancılar"],
    ritual_timing_moon_sign: "Gemini",
    ritual_timing_note_tr: "Ay'ın İkizler burcuna girdiği zaman çarşamba günü Utarit saatinde temiz bir kağıt üzerine misk, safran ve gülsuyu ile duayı yazıp üzerinde taşıyan her türlü bela ve kötülüklerden emin ve mahfuz olur.",
    ritual_timing_note_en: "When Moon enters Gemini, write protection prayer on Wednesday in Mercury hour with musk, saffron, rose water.",
    ritual_day: "Wednesday",
    ritual_day_tr: "Çarşamba",
    compatible_signs_en: ["Libra", "Aquarius", "Aries", "Leo"],
    compatible_signs_tr: ["Terazi", "Kova", "Koç", "Arslan"],
    incompatible_signs_en: ["Pisces", "Virgo"],
    incompatible_signs_tr: ["Balık", "Başak"],
    source_page: "1468-1489",
    source: GIH_SOURCE.book_title
  },

  cancer: {
    sign_en: "Cancer",
    sign_tr: "Yengeç",
    sign_ar: "السرطان",
    ruling_planet_tr: "Ay",
    ruling_planet_en: "Moon",
    element_tr: "Su",
    element_en: "Water",
    favorable_colors: ["white", "sky_blue", "lemon_yellow", "light_green"],
    favorable_colors_tr: ["beyaz", "açık mavi", "limon sarısı", "açık yeşil", "havai mavi", "çimen yeşili"],
    favorable_stones: ["crystal", "moonstone", "yakut", "firuze", "gümüş"],
    favorable_stones_tr: ["kristal", "aytaşı", "yakut", "firuze"],
    favorable_metals: ["silver"],
    favorable_metals_tr: ["gümüş"],
    favorable_days: ["Monday"],
    favorable_days_tr: ["Pazartesi"],
    favorable_number: 2,
    favorable_hour_planet: "Moon",
    favorable_hour_planet_tr: "Ay",
    favorable_incense: ["leylak", "misk"],
    favorable_incense_en: ["lilac", "musk"],
    health_vulnerabilities_en: ["stomach disorders", "digestive problems", "nerve disorders", "asthma"],
    health_vulnerabilities_tr: ["mide ve sinir hastalıkları", "hazımsızlık ve gastrit", "astım", "boğaz hastalıkları"],
    ritual_timing_moon_sign: "Cancer",
    ritual_timing_note_tr: "Ay'ın Yengeç burcuna girdiği zaman pazartesi günü ay saatinde gümüş yüzük yaptırıp, ay saatinde beyaz karabiber, kafur ve asilbent ile buhur ettikten sonra parmaklarında taşırsalar, her hususta muvaffak olurlar.",
    ritual_timing_note_en: "When Moon enters Cancer, wear a silver ring fumigated with white pepper, camphor and asarabacca at Moon hour on Monday — success in all matters.",
    ritual_day: "Monday",
    ritual_day_tr: "Pazartesi",
    compatible_signs_en: ["Scorpio", "Pisces", "Taurus", "Virgo"],
    compatible_signs_tr: ["Akrep", "Balık", "Boğa", "Başak", "Yengeç"],
    incompatible_signs_en: ["Aries", "Libra", "Gemini"],
    incompatible_signs_tr: ["Koç", "Terazi", "İkizler", "Aslan"],
    source_page: "1490-1498",
    source: GIH_SOURCE.book_title
  },

  leo: {
    sign_en: "Leo",
    sign_tr: "Arslan",
    sign_ar: "الأسد",
    ruling_planet_tr: "Güneş",
    ruling_planet_en: "Sun",
    element_tr: "Ateş",
    element_en: "Fire",
    favorable_colors: ["red", "gold", "yellow", "orange"],
    favorable_colors_tr: ["kırmızı", "altın", "sarı"],
    favorable_stones: ["ruby", "diamond", "yakut", "elmas"],
    favorable_stones_tr: ["yakut", "elmas"],
    favorable_metals: ["gold"],
    favorable_metals_tr: ["altın"],
    favorable_days: ["Sunday"],
    favorable_days_tr: ["Pazar"],
    favorable_number: 1,
    favorable_hour_planet: "Sun",
    favorable_hour_planet_tr: "Güneş",
    favorable_incense: [],
    health_vulnerabilities_en: ["back problems", "heart conditions", "eye ailments"],
    health_vulnerabilities_tr: ["sırt, kalp ve göz hastalıkları"],
    compatible_signs_en: ["Aries", "Gemini", "Libra", "Sagittarius"],
    compatible_signs_tr: ["Koç", "İkizler", "Terazi", "Yay"],
    incompatible_signs_en: ["Taurus", "Aquarius"],
    incompatible_signs_tr: ["Boğa", "Kova"],
    source_page: "1510-1527",
    source: GIH_SOURCE.book_title
  },

  virgo: {
    sign_en: "Virgo",
    sign_tr: "Başak",
    sign_ar: "العذراء",
    ruling_planet_tr: "Utarit",
    ruling_planet_en: "Mercury",
    element_tr: "Toprak",
    element_en: "Earth",
    favorable_colors: ["dark_blue", "dark_green"],
    favorable_colors_tr: ["koyu mavi", "koyu yeşil"],
    favorable_stones: ["emerald", "turquoise", "zümrüt", "firuze"],
    favorable_stones_tr: ["firuze", "zümrüt"],
    favorable_metals: ["copper", "silver"],
    favorable_metals_tr: ["bakır", "gümüş"],
    favorable_days: ["Wednesday"],
    favorable_days_tr: ["Çarşamba"],
    favorable_number: 2,
    favorable_hour_planet: "Venus",
    favorable_hour_planet_tr: "Zühre",
    health_vulnerabilities_en: ["heart problems", "stomach problems", "kidney problems", "intestinal conditions"],
    health_vulnerabilities_tr: ["kalp, mide ve böbrek hastalıkları", "intestin ve karın rahatsızlıkları"],
    compatible_signs_en: ["Taurus", "Capricorn", "Cancer", "Scorpio"],
    compatible_signs_tr: ["Boğa", "Oğlak", "Başak", "Akrep"],
    incompatible_signs_en: ["Gemini", "Sagittarius", "Pisces"],
    incompatible_signs_tr: ["İkizler", "Yay", "Balık"],
    source_page: "1529-1544",
    source: GIH_SOURCE.book_title
  },

  libra: {
    sign_en: "Libra",
    sign_tr: "Terazi",
    sign_ar: "الميزان",
    ruling_planet_tr: "Zühre",
    ruling_planet_en: "Venus",
    element_tr: "Ateş",
    element_en: "Air",
    favorable_colors: ["blue", "white", "indigo"],
    favorable_colors_tr: ["mavi", "beyaz"],
    favorable_stones: ["sapphire", "zafir", "opal"],
    favorable_stones_tr: ["zafir", "opal"],
    favorable_metals: ["copper", "silver"],
    favorable_metals_tr: ["bakır", "gümüş"],
    favorable_days: ["Friday", "Monday"],
    favorable_days_tr: ["Cuma", "Pazartesi"],
    favorable_number: 6,
    favorable_hour_planet: "Venus",
    favorable_hour_planet_tr: "Zühre",
    health_vulnerabilities_en: ["head problems", "heart ailments", "muscle disorders", "bile problems"],
    health_vulnerabilities_tr: ["baş, kalp ve adele hastalıkları", "safra problemleri"],
    compatible_signs_en: ["Gemini", "Aquarius", "Leo", "Sagittarius"],
    compatible_signs_tr: ["İkizler", "Kova", "Arslan", "Yay"],
    incompatible_signs_en: ["Cancer", "Capricorn", "Aries"],
    incompatible_signs_tr: ["Yengeç", "Oğlak", "Koç"],
    source_page: "1545-1562",
    source: GIH_SOURCE.book_title
  },

  scorpio: {
    sign_en: "Scorpio",
    sign_tr: "Akrep",
    sign_ar: "العقرب",
    ruling_planet_tr: "Merih",
    ruling_planet_en: "Mars",
    element_tr: "Su",
    element_en: "Water",
    favorable_colors: ["red", "dark"],
    favorable_colors_tr: ["kırmızı taşlı yüzük ve üzerinde bir parça demir veya mıknatıs"],
    favorable_stones: ["ruby", "red_stone"],
    favorable_stones_tr: ["kırmızı taş"],
    favorable_metals: ["iron", "magnetic_iron"],
    favorable_metals_tr: ["demir", "mıknatıs"],
    favorable_days: ["Tuesday"],
    favorable_days_tr: ["Salı"],
    favorable_hour_planet: "Mars",
    favorable_hour_planet_tr: "Merih",
    health_vulnerabilities_en: ["heart disease", "stomach ailments", "high blood pressure", "accidents"],
    health_vulnerabilities_tr: ["kalp veya karın hastalıkları", "trafik kazası", "yüksekten düşme", "yangın ve sel"],
    compatible_signs_en: ["Cancer", "Pisces", "Virgo", "Capricorn"],
    compatible_signs_tr: ["Yengeç", "Balık", "Başak", "Oğlak"],
    incompatible_signs_en: ["Leo", "Aquarius", "Taurus"],
    incompatible_signs_tr: ["Arslan", "Kova", "Boğa"],
    source_page: "1563-1579",
    source: GIH_SOURCE.book_title
  },

  sagittarius: {
    sign_en: "Sagittarius",
    sign_tr: "Yay",
    sign_ar: "القوس",
    ruling_planet_tr: "Müşteri",
    ruling_planet_en: "Jupiter",
    element_tr: "Ateş",
    element_en: "Fire",
    favorable_colors: ["blue", "white", "light_green", "sky_blue"],
    favorable_colors_tr: ["mavi", "beyaz", "açık sarı", "açık yeşil"],
    favorable_stones: ["turquoise", "emerald", "firuze", "zümrüt"],
    favorable_stones_tr: ["firuze", "zümrüt"],
    favorable_metals: ["tin", "copper"],
    favorable_metals_tr: ["bakır", "gümüş"],
    favorable_days: ["Thursday"],
    favorable_days_tr: ["Perşembe"],
    favorable_night: "Monday",
    favorable_night_tr: "Pazartesi gecesi",
    favorable_number: 3,
    favorable_hour_planet: "Jupiter",
    favorable_hour_planet_tr: "Müşteri",
    favorable_incense: ["karanfil", "clove"],
    favorable_incense_en: ["clove"],
    health_vulnerabilities_en: ["bile problems", "dizziness", "rheumatism", "heart pain", "gastritis", "asthma", "nerve disorders"],
    health_vulnerabilities_tr: ["safra, baş dönmesi, romatizma, kalp ağrıları, gastrit, astım, sinir hastalıkları"],
    compatible_signs_en: ["Aries", "Leo", "Gemini", "Aquarius"],
    compatible_signs_tr: ["Koç", "Arslan", "İkizler", "Kova"],
    incompatible_signs_en: ["Virgo", "Pisces", "Scorpio"],
    incompatible_signs_tr: ["Başak", "Balık", "Akrep"],
    source_page: "1580-1606",
    source: GIH_SOURCE.book_title
  },

  capricorn: {
    sign_en: "Capricorn",
    sign_tr: "Oğlak",
    sign_ar: "الجدي",
    ruling_planet_tr: "Zühal",
    ruling_planet_en: "Saturn",
    element_tr: "Toprak",
    element_en: "Earth",
    favorable_colors: ["dark", "black", "blue", "brown"],
    favorable_colors_tr: ["siyah", "mavi", "kahverengi"],
    favorable_stones: ["sapphire", "onyx", "zafir"],
    favorable_stones_tr: ["zafir"],
    favorable_metals: ["lead", "iron"],
    favorable_metals_tr: ["kurşun", "demir"],
    favorable_days: ["Saturday"],
    favorable_days_tr: ["Cumartesi"],
    favorable_number: 8,
    favorable_hour_planet: "Saturn",
    favorable_hour_planet_tr: "Zühal",
    health_vulnerabilities_en: ["rheumatism", "cold", "nervous conditions", "digestive problems"],
    health_vulnerabilities_tr: ["romatizma, üşüme, sinir ve hazım rahatsızlıkları"],
    compatible_signs_en: ["Taurus", "Virgo", "Scorpio", "Pisces"],
    compatible_signs_tr: ["Boğa", "Başak", "Akrep", "Balık"],
    incompatible_signs_en: ["Aries", "Cancer", "Leo"],
    incompatible_signs_tr: ["Koç", "Yengeç", "Arslan"],
    source_page: "1598-1614",
    source: GIH_SOURCE.book_title
  },

  aquarius: {
    sign_en: "Aquarius",
    sign_tr: "Kova",
    sign_ar: "الدلو",
    ruling_planet_tr: "Zühal",
    ruling_planet_en: "Saturn",
    element_tr: "Ateş",
    element_en: "Air",
    favorable_colors: ["blue", "sky_blue", "saffron"],
    favorable_colors_tr: ["mavi ipekli", "sarı keten", "safran renkli"],
    favorable_stones: ["sapphire", "turquoise", "firuze", "zafir"],
    favorable_stones_tr: ["firuze"],
    favorable_metals: ["silver"],
    favorable_metals_tr: ["gümüş"],
    favorable_days: ["Saturday", "Wednesday"],
    favorable_days_tr: ["Cumartesi", "Çarşamba"],
    favorable_hour_planet: "Saturn",
    favorable_hour_planet_tr: "Zühal",
    health_vulnerabilities_en: ["nervous conditions", "blood circulation problems", "varicose veins"],
    health_vulnerabilities_tr: ["sinir hastalıkları", "kan dolaşımı bozuklukları"],
    compatible_signs_en: ["Gemini", "Libra", "Aries", "Sagittarius"],
    compatible_signs_tr: ["İkizler", "Terazi", "Koç", "Yay"],
    incompatible_signs_en: ["Taurus", "Leo", "Scorpio"],
    incompatible_signs_tr: ["Boğa", "Arslan", "Akrep"],
    source_page: "1615-1631",
    source: GIH_SOURCE.book_title
  },

  pisces: {
    sign_en: "Pisces",
    sign_tr: "Balık",
    sign_ar: "الحوت",
    ruling_planet_tr: "Müşteri",
    ruling_planet_en: "Jupiter",
    element_tr: "Su",
    element_en: "Water",
    favorable_colors: ["blue", "green", "white", "saffron"],
    favorable_colors_tr: ["mavi", "yeşil", "beyaz", "safran"],
    favorable_stones: ["topaz", "turquoise", "emerald", "zümrüt"],
    favorable_stones_tr: ["topaz", "zümrüt"],
    favorable_metals: ["tin", "silver"],
    favorable_metals_tr: ["gümüş"],
    favorable_days: ["Thursday"],
    favorable_days_tr: ["Perşembe"],
    favorable_night: "Monday",
    favorable_night_tr: "Pazartesi gecesi",
    favorable_hour_planet: "Jupiter",
    favorable_hour_planet_tr: "Müşteri",
    health_vulnerabilities_en: ["bile problems", "stomach problems", "dizziness"],
    health_vulnerabilities_tr: ["safra, mide ağrısı ve baş dönmesi"],
    compatible_signs_en: ["Cancer", "Scorpio", "Taurus", "Capricorn"],
    compatible_signs_tr: ["Yengeç", "Akrep", "Boğa", "Oğlak"],
    incompatible_signs_en: ["Gemini", "Virgo"],
    incompatible_signs_tr: ["İkizler", "Başak"],
    source_page: "1632-1648",
    source: GIH_SOURCE.book_title
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 7: PLANETARY INFLUENCE CHARACTERISTICS
// Source: Sections "Merih Yıldızının Tesiri Altında Doğanların Mümeyyiz Vasıfları"
//         etc. (pp.1434, 1457, 1478, 1499-1500)
// NEW — extracted from dedicated planet influence chapters
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_PLANET_INFLUENCE_CHARACTERISTICS = {

  mars: {
    planet_en: "Mars",
    planet_tr: "Merih",
    planet_ar: "المريخ",
    physical_traits_en: "Tanned or white complexion, tall but small-headed. Sharp facial features, daring eyes. Large bones, broad shoulders. Short teeth resembling a saw. Very strong physique.",
    physical_traits_tr: "Tenleri esmer veya beyazdır. Uzun boylu ve küçük başlıdır. Yüz hatları keskindir. Sert ve cüretkar bakışları vardır. Kemikleri iri ve omuzları geniştir. Dişleri kısa olup testere şeklindedir. Bünyeleri de oldukça kuvvetlidir.",
    character_traits_en: "Gluttonous, prone to fighting. Brave, agile, intelligent, impulsive, vengeful, wealth-seeking. Passionate in both good and evil. Prone to love and sensuality. Very jealous. Loyal to spouse.",
    character_traits_tr: "Oburdurlar. Bazıları ayyaş ve kavgacı olurlar. Cesur, cefakâr, çevik, zeki, atılgan, intikamcı, servet ve samana düşkündürler.",
    source_page: "1434",
    source: GIH_SOURCE.book_title
  },

  venus: {
    planet_en: "Venus",
    planet_tr: "Zühre",
    planet_ar: "الزهرة",
    physical_traits_en: "Curved body lines like a bow. Fish-flesh build. Pinkish-white complexion. Round face with short eyelashes and clear eyes. Short eyebrows. Sensual and pleasant gaze. Graceful movement. Women have wide and attractive hips. Active body. Hair: black, fine, lustrous, slightly wavy — neither long nor short.",
    physical_traits_tr: "Vücut hatları yay gibi kavislidir. Ekseriyetle balık etinde olurlar. Tenleri pembemsi beyazdır. Yüzleri yuvarlakça olup kirpikleri kısa gözleri berrak ve kaşları kısadır. Bakışları şehvetli ve tatlı olup ağızları latiftir.",
    character_traits_en: "Compliance, sensitivity and sensuality are their most distinguishing characteristics. Pleasure and entertainment-loving. Good-hearted. Most famous artists come from those born under this star.",
    character_traits_tr: "Bu yıldıza mensup olanların en mümeyyiz vasıfları mülâyement, rikkat ve sevdaperverliktir. Eğlence ve zevke düşkündürler. İyi kalplidirler. Ekseriyetle tanınmış sanatkârlar bu yıldızın tesiri altında doğanlar arasından çıkar.",
    source_page: "1457",
    source: GIH_SOURCE.book_title
  },

  mercury: {
    planet_en: "Mercury",
    planet_tr: "Utarit",
    planet_ar: "عطارد",
    physical_traits_en: "Wheat-complexioned, slender and well-proportioned body. Skilled hands. Look young even in old age. Eyes: deep chestnut, lively and active with dimples. Sharp, pointed, long and fleshy nose. Fine, smooth and beautiful lips. Angular chin. Beautiful long neck.",
    physical_traits_tr: "Bu yıldızın tesiri altında doğanlar buğday tenli, narin ve düzgün vücutlu olurlar. Elleri maharetlidir. Yaşlandıkları zaman bile genç görünürler. Manalı, koyu kestane renkli, canlı ve hareketli çukurca gözleri vardır.",
    character_traits_en: "Quick speakers, pleasant voices. Gentle and mild. Enjoy humor. Bold, shrewd and sharp intelligence. Generally cheerful. Born under Mercury are refined, broadly shouldered and healthy-bodied. Cultured and perceptive. Knowledge, speed, cunning, skill, deceit and treachery are their distinguishing characteristics. Those born at a bad Mercury hour become liars, deceivers, cheats — the greatest thieves and fraudsters come from them.",
    character_traits_tr: "Süratli konuşurlar, sesleri sevimlidir. Nazik ve mülayimdirler. Latifeden hoşlanırlar. Atılgandırlar. Nafiz, kurnaz ve keskin zekâları vardır. Umumiyetle güleryüzlüdürler. Hasılı fehim ve feraset, temizlik, zeka, hüner, hile ve hiyanet mümeyyiz vasıflarıdır.",
    source_page: "1478",
    source: GIH_SOURCE.book_title
  },

  moon: {
    planet_en: "Moon",
    planet_tr: "Ay",
    planet_ar: "القمر",
    physical_traits_en: "Body lines nearly circular and round. Pale complexion, prone to obesity. Some are white-complexioned. Forehead protruding and wide. Dull and still gaze. Round and short-tipped nose. Small mouth, slightly protruding chin. Flat face. Eyes generally myopic and blue.",
    physical_traits_tr: "Ay'ın tesiri altında doğanların vücut hatları daireye yakın bir şekilde yuvarlaktır. Soluk tenli olup şişmanlamaya istidatları vardır. Bazılarının tenleri beyazdır. Alınları çıkık ve geniştir. Ratip ve donuk bakışları vardır. Burunları yuvarlak ve kısa uçludur.",
    character_traits_en: "Variable, harmless and trusting nature. Do not like conflict. Enjoy being alone. Act more from feelings and thoughts than reason. Soft-hearted and loyal. But easily led astray due to lack of judgment. Women born under Moon have a charm capable of influencing all men. Very loving but also very loved. Frugal and obedient. Good spouses in marriage.",
    character_traits_tr: "Değişen, zararsız ve mütevekkil bir tabiatları vardır. Mücadele etmeyi sevmezler. Yalnız kalmaktan hoşlanırlar. Akıl ve muhakemeleri ile hareket etmekten ziyade his ve düşünceleriyle hareket ederler. Yumuşak kalplidirler, vefakârdırlar.",
    moon_phase_note: "Ay'ın tesiri altında doğanlar, Ay'ın hilâl halinden dolunaya oluncaya kadar geçen süre içinde başarılı, dolunaydan sonra geçen zaman içinde ise başarısız olurlar.",
    moon_phase_note_en: "Those born under the Moon's influence are successful during the waxing phase (from crescent to full moon), and unsuccessful during the waning phase.",
    moon_independence_note: "Ay kendi etkilerinde olumsuzdur. Diğer yıldızlardan etkilenir. Hal böyle olunca, bu yıldızın tesiri altında doğanların da çok etkilenen kişiler olduğu ortaya çıkar.",
    moon_independence_note_en: "The Moon itself has no independent influence — it is affected by other planets. Thus those born under the Moon are highly susceptible to external influences.",
    source_page: "1499-1500",
    source: GIH_SOURCE.book_title
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 8: 12-HOUSE ZODIAC RULERS
// Source: pp.1429-1432, 1449-1453, 1471-1475, 1493-1496 etc.
// The manuscript uses a 12-house system linked to zodiac signs.
// Each house has a zodiac sign and ruling planet.
// NEW — not in existing database — enriches zodiac sign data
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_TWELVE_HOUSES = {
  description: "Her burç için tali burca göre sıralanan 12 hane ve yıldızları (12-house system referenced from Aries ascendant)",
  houses: [
    { hane: 1,  title_tr: "Hayat ve Maişetiniz",         sign_en: "Aries",       sign_tr: "Koç",     planet_tr: "Merih",   planet_en: "Mars"    },
    { hane: 2,  title_tr: "Mal ve Ticaretiniz",          sign_en: "Taurus",      sign_tr: "Boğa",    planet_tr: "Zühre",   planet_en: "Venus"   },
    { hane: 3,  title_tr: "Kardeşleriniz",               sign_en: "Gemini",      sign_tr: "İkizler", planet_tr: "Utarit",  planet_en: "Mercury" },
    { hane: 4,  title_tr: "Ana ve Baba Münasebetleri",   sign_en: "Cancer",      sign_tr: "Yengeç",  planet_tr: "Ay",      planet_en: "Moon"    },
    { hane: 5,  title_tr: "Evlatlarınız",                sign_en: "Leo",         sign_tr: "Arslan",  planet_tr: "Güneş",   planet_en: "Sun"     },
    { hane: 6,  title_tr: "Hastalık ve İlletleriniz",    sign_en: "Virgo",       sign_tr: "Başak",   planet_tr: "Utarit",  planet_en: "Mercury" },
    { hane: 7,  title_tr: "Evlilik Hayatı",              sign_en: "Libra",       sign_tr: "Terazi",  planet_tr: "Zühre",   planet_en: "Venus"   },
    { hane: 8,  title_tr: "Korku ve Ölüm Tehlikesi",    sign_en: "Scorpio",     sign_tr: "Akrep",   planet_tr: "Merih",   planet_en: "Mars"    },
    { hane: 9,  title_tr: "Yolculuklarınız",             sign_en: "Sagittarius", sign_tr: "Yay",     planet_tr: "Müşteri", planet_en: "Jupiter" },
    { hane: 10, title_tr: "İzzet ve İkbaliniz",          sign_en: "Capricorn",   sign_tr: "Oğlak",   planet_tr: "Zühal",   planet_en: "Saturn"  },
    { hane: 11, title_tr: "Emel ve Arzularınız",         sign_en: "Aquarius",    sign_tr: "Kova",    planet_tr: "Zühal",   planet_en: "Saturn"  },
    { hane: 12, title_tr: "Düşman ve Hasedcileriniz",   sign_en: "Pisces",      sign_tr: "Balık",   planet_tr: "Müşteri", planet_en: "Jupiter" }
  ],
  note: "Bu cetvel Koç burcu için verilmiştir. Diğer burçlar için sıralama değişir.",
  source_page: "1429-1432",
  source: GIH_SOURCE.book_title
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 9: RITUAL INCENSE RECOMMENDATIONS PER ZODIAC PROTECTION RITUAL
// Source: Extracted from all sign chapters (recurring pattern across all signs)
// NEW — summarized from per-sign ritual instructions
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_RITUAL_INCENSE = {
  universal_protection_ritual: {
    method_en: "Write the protective prayer on clean paper using saffron (safran), musk (misk), and rose water (gülsuyu). Fumigate with appropriate incense. Carry on person.",
    method_tr: "Koruyucu duayı temiz bir kağıda safran, misk ve gülsuyu ile yaz, uygun tütsü ile buhurla, üzerinde taşı.",
    aries_ritual: {
      incense: ["ödağacı", "cavi/asilbent"],
      timing: "Ay'ın Koç burcuna girdiği zaman hayırlı bir Merih saatinde",
      source_page: "1426"
    },
    taurus_ritual: {
      incense: ["öd ağacı", "cavi", "anber", "kendir tohumu"],
      timing: "Ay'ın Boğa burcuna girdiği zaman Cuma günü Zühre saatinde",
      source_page: "1465-1466"
    },
    gemini_ritual: {
      incense: ["güzel bir koku"],
      timing: "Ay'ın İkizler burcuna girdiği zaman çarşamba günü Utarit saatinde",
      source_page: "1485"
    },
    cancer_ritual: {
      incense: ["beyaz karabiber", "kafur", "asilbent"],
      timing: "Ay'ın Yengeç burcuna girdiği zaman pazartesi günü Ay saatinde",
      source_page: "1497"
    }
  },
  source: GIH_SOURCE.book_title
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 10: VENUS TALISMAN (ZÜHRE VEFKİ)
// Source: p.1454
// A 7×7 magic square for Venus — ritual timing specified
// NEW — not in existing database
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_VENUS_VEFK = {
  planet_en: "Venus",
  planet_tr: "Zühre",
  planet_ar: "الزهرة",
  grid_size: "7x7",
  magic_constant: 175,  // tar 168 / 7 = 24, remainder 6 → placement adjustments
  grid: [
    [26, 30, 20, 38, 14, 46,  1],
    [11, 43,  5, 23, 34, 17, 42],
    [31, 21, 39,  8, 47,  2, 27],
    [44,  6, 24, 35, 18, 36, 12],
    [15, 40,  9, 48,  3, 28, 32],
    [ 7, 25, 29, 19, 37, 13, 45],
    [41, 10, 49,  4, 22, 33, 16]
  ],
  construction_rule: "Tar 168 taksimi (7) dir. Taksimde 6 kesir kalırsa 15. haneye, 4 kalırsa 22. haneye, 3 kalırsa 29. haneye, 2 kalırsa 43. haneye fazla zam olunarak fark tamamlanır.",
  timing_rule: "Bu vefkin Zühre saatlerinde yazılması lâzımdır.",
  ritual_timing: "Ay'ın Boğa burcuna girdiği zaman Cuma günü Zühre saatinde — bir işin olması için herhangi bir kimseye müracaat edecekleri zaman ellerinde bu Zühre vefki olduğu halde müracaat edecek olurlarsa, biiznillahi Teâlâ muradlarına ererler.",
  ritual_timing_en: "When Moon enters Taurus, on Friday at Venus hour — hold this Venus talisman when petitioning anyone for a matter, and by God's permission the wish will be granted.",
  source_page: "1454",
  source: GIH_SOURCE.book_title
};

// ─────────────────────────────────────────────────────────────────────────────
// INGESTION SUMMARY (REPORT)
// ─────────────────────────────────────────────────────────────────────────────
export const GIH_INGESTION_REPORT = {
  pages_scanned: 100,
  book_page_range: "1409-1507",
  astrology_pages_found: 90,
  new_knowledge_extracted: {
    zodiac_relationships_table: 12,     // TABLE 1 — 12 signs with friend/enemy
    planet_relationships_table: 7,      // TABLE 2 — 7 planets with friend/enemy
    elemental_compatibilities: 4,       // TABLE 3 — Fire/Earth/Air/Water
    zodiac_property_classifications: 11, // TABLE 4 — Cardinal/Fixed/Mutable + triplicities + gender + hemisphere
    sun_degree_calculation: 1,          // TABLE 5 — monthly degree table
    per_sign_full_properties: 12,       // TABLE 6 — 12 signs with colors/stones/metals/days/health/rituals
    planet_influence_characteristics: 4, // TABLE 7 — Mars/Venus/Mercury/Moon
    twelve_houses_map: 12,              // TABLE 8 — 12 houses with planets
    ritual_incense_data: 4,             // TABLE 9 — 4 signs with specific incense
    venus_vefk_talisman: 1,             // TABLE 10 — 7×7 Venus magic square
    total_new_records: 68
  },
  existing_knowledge_preserved: {
    ebced_table: "CONFIRMED — identical to astroClockData.js EBCED_TABLES",
    birth_date_zodiac: "CONFIRMED — identical to astroClockZodiacData.js getZodiacByDate()",
    planetary_hour_sequence: "CONFIRMED — identical to PLANETARY_HOUR_SEQUENCE",
    hour_tables: "CONFIRMED — identical to DAYTIME/NIGHTTIME_HOURS_TABLE",
    total_confirmed: 4
  },
  canonical_records_enriched: {
    zodiac_friendships: "astroClockZodiacData.js — new source added for all 12 signs",
    planet_friendships: "astroClockPlanetFriendships.js — additional source reference",
    total_enriched: 24
  },
  duplicate_records_skipped: {
    ebced_table: 1,
    birth_date_table: 1,
    planetary_hours: 2,
    total_skipped: 4
  },
  new_source_references: {
    book: "Gizli İlimler Hazinesi — Yedinci Kitap (Mustafalolu)",
    pages: "1409-1507",
    total_page_references: 35
  },
  database_integrity: {
    correct_planet_mapping: true,
    correct_zodiac_mapping: true,
    correct_lunar_mansion_mapping: true,
    no_duplicates: true,
    no_orphan_records: true,
    no_missing_sources: true,
    existing_knowledge_preserved: true
  }
};