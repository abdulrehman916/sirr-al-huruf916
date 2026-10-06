/**
 * ARABIC PRESERVATION RULE — PERMANENT DATABASE STANDARD
 * 
 * CORE PRINCIPLE: Arabic script is the primary and authoritative value.
 * Malayalam transliterations appear ONLY as secondary descriptions.
 * 
 * This standard applies to ALL existing records and ALL future ingestions.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. ARABIC LETTERS — 28 HURUF
// ─────────────────────────────────────────────────────────────────────────────

export const ARABIC_LETTERS = [
  { letter: 'ا', name: 'Alif', malayalam: 'അലിഫ്', transliteration: 'ā' },
  { letter: 'ب', name: 'Ba', malayalam: 'ബാ', transliteration: 'b' },
  { letter: 'ت', name: 'Ta', malayalam: 'താ', transliteration: 't' },
  { letter: 'ث', name: 'Tha', malayalam: 'സാ', transliteration: 'th' },
  { letter: 'ج', name: 'Jim', malayalam: 'ജീം', transliteration: 'j' },
  { letter: 'ح', name: 'Ha', malayalam: 'ഹാ', transliteration: 'ḥ' },
  { letter: 'خ', name: 'Kha', malayalam: 'ഖാ', transliteration: 'kh' },
  { letter: 'د', name: 'Dal', malayalam: 'ദാൽ', transliteration: 'd' },
  { letter: 'ذ', name: 'Dhal', malayalam: 'ദാൽ', transliteration: 'dh' },
  { letter: 'ر', name: 'Ra', malayalam: 'റാ', transliteration: 'r' },
  { letter: 'ز', name: 'Zay', malayalam: 'സായ്', transliteration: 'z' },
  { letter: 'س', name: 'Sin', malayalam: 'സീൻ', transliteration: 's' },
  { letter: 'ش', name: 'Shin', malayalam: 'ശീൻ', transliteration: 'sh' },
  { letter: 'ص', name: 'Sad', malayalam: 'സ്വാദ്', transliteration: 'ṣ' },
  { letter: 'ض', name: 'Dad', malayalam: 'ദ്വാദ്', transliteration: 'ḍ' },
  { letter: 'ط', name: 'Ta', malayalam: 'ത്വാ', transliteration: 'ṭ' },
  { letter: 'ظ', name: 'Za', malayalam: 'ളാ', transliteration: 'ẓ' },
  { letter: 'ع', name: 'Ayn', malayalam: 'ഐൻ', transliteration: 'ʿ' },
  { letter: 'غ', name: 'Ghayn', malayalam: 'ഗൈൻ', transliteration: 'gh' },
  { letter: 'ف', name: 'Fa', malayalam: 'ഫാ', transliteration: 'f' },
  { letter: 'ق', name: 'Qaf', malayalam: 'ഖാഫ്', transliteration: 'q' },
  { letter: 'ك', name: 'Kaf', malayalam: 'കാഫ്', transliteration: 'k' },
  { letter: 'ل', name: 'Lam', malayalam: 'ലാം', transliteration: 'l' },
  { letter: 'م', name: 'Mim', malayalam: 'മീം', transliteration: 'm' },
  { letter: 'ن', name: 'Nun', malayalam: 'നൂൻ', transliteration: 'n' },
  { letter: 'ه', name: 'Ha', malayalam: 'ഹാ', transliteration: 'h' },
  { letter: 'و', name: 'Waw', malayalam: 'വാവ്', transliteration: 'w' },
  { letter: 'ي', name: 'Ya', malayalam: 'യാ', transliteration: 'y' }
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. LUNAR MANSIONS — 28 MANAZIL
// ─────────────────────────────────────────────────────────────────────────────

export const LUNAR_MANSIONS = [
  { number: 1, arabic: 'الشرطان', name: 'Al-Sharatain', malayalam: 'അൽ-ശരതൈൻ' },
  { number: 2, arabic: 'البطين', name: 'Al-Butain', malayalam: 'അൽ-ബുതൈൻ' },
  { number: 3, arabic: 'الثريا', name: 'Al-Thuraya', malayalam: 'അൽ-തുറയ' },
  { number: 4, arabic: 'الدبران', name: 'Al-Dabaran', malayalam: 'അൽ-ദബറാൻ' },
  { number: 5, arabic: 'الهقعة', name: 'Al-Haq\'ah', malayalam: 'അൽ-ഹഖഅ' },
  { number: 6, arabic: 'الهنعة', name: 'Al-Han\'ah', malayalam: 'അൽ-ഹനഅ' },
  { number: 7, arabic: 'الذراع', name: 'Al-Dhira', malayalam: 'അൽ-ദിറാ' },
  { number: 8, arabic: 'النثرة', name: 'Al-Nathrah', malayalam: 'അൽ-നസ്റ' },
  { number: 9, arabic: 'الطرف', name: 'Al-Tarf', malayalam: 'അൽ-തർഫ്' },
  { number: 10, arabic: 'الجبهة', name: 'Al-Jabhah', malayalam: 'അൽ-ജഭ' },
  { number: 11, arabic: 'الزبرة', name: 'Al-Zubrah', malayalam: 'അൽ-സുബ്ര' },
  { number: 12, arabic: 'الصرفة', name: 'Al-Sarfah', malayalam: 'അൽ-സർഫ' },
  { number: 13, arabic: 'العواء', name: 'Al-Awwa', malayalam: 'അൽ-അവ്വ' },
  { number: 14, arabic: 'السماك', name: 'Al-Simak', malayalam: 'അൽ-സിമാക്' },
  { number: 15, arabic: 'الغفر', name: 'Al-Ghafr', malayalam: 'അൽ-ഗഫ്ർ' },
  { number: 16, arabic: 'الزبانا', name: 'Al-Zubana', malayalam: 'അൽ-സുബാന' },
  { number: 17, arabic: 'الإكليل', name: 'Al-Iklil', malayalam: 'അൽ-ഇക്ലീൽ' },
  { number: 18, arabic: 'القلب', name: 'Al-Qalb', malayalam: 'അൽ-ഖൽബ്' },
  { number: 19, arabic: 'الشولة', name: 'Al-Shawlah', malayalam: 'അൽ-ഷൗല' },
  { number: 20, arabic: 'النعائم', name: 'Al-Na\'aim', malayalam: 'അൽ-നയീം' },
  { number: 21, arabic: 'البلدة', name: 'Al-Baldah', malayalam: 'അൽ-ബലദ' },
  { number: 22, arabic: 'سعد الذابح', name: 'Sa\'d al-Dhabih', malayalam: 'സഅദ് അൽ-ദാബിഹ്' },
  { number: 23, arabic: 'سعد بلع', name: 'Sa\'d Bula', malayalam: 'സഅദ് ബുല' },
  { number: 24, arabic: 'سعد السعود', name: 'Sa\'d al-Su\'ud', malayalam: 'സഅദ് അൽ-സുഊദ്' },
  { number: 25, arabic: 'سعد الأخبية', name: 'Sa\'d al-Akhibah', malayalam: 'സഅദ് അൽ-അഖിബ' },
  { number: 26, arabic: 'الفرغ المقدم', name: 'Al-Fargh al-Muqaddam', malayalam: 'അൽ-ഫർഗ് അൽ-മുഖദ്ദം' },
  { number: 27, arabic: 'الفرغ المؤخر', name: 'Al-Fargh al-Mu\'akhar', malayalam: 'അൽ-ഫർഗ് അൽ-മുഅഖർ' },
  { number: 28, arabic: 'الرشا', name: 'Al-Risha', malayalam: 'അൽ-റിശ' }
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. ZODIAC SIGNS — 12 BURJ
// ─────────────────────────────────────────────────────────────────────────────

export const ZODIAC_SIGNS = [
  { number: 1, arabic: 'الحمل', name: 'Al-Hamal', malayalam: 'അൽ-ഹമൽ', english: 'Aries', element: 'Fire' },
  { number: 2, arabic: 'الثور', name: 'Al-Thawr', malayalam: 'അൽ-തൗർ', english: 'Taurus', element: 'Earth' },
  { number: 3, arabic: 'الجوزاء', name: 'Al-Jawza', malayalam: 'അൽ-ജൗസ', english: 'Gemini', element: 'Air' },
  { number: 4, arabic: 'السرطان', name: 'Al-Saratan', malayalam: 'അൽ-സറതാൻ', english: 'Cancer', element: 'Water' },
  { number: 5, arabic: 'الأسد', name: 'Al-Asad', malayalam: 'അൽ-അസദ്', english: 'Leo', element: 'Fire' },
  { number: 6, arabic: 'السنبلة', name: 'Al-Sunbulah', malayalam: 'അൽ-സുൻബുല', english: 'Virgo', element: 'Earth' },
  { number: 7, arabic: 'الميزان', name: 'Al-Mizan', malayalam: 'അൽ-മീസാൻ', english: 'Libra', element: 'Air' },
  { number: 8, arabic: 'العقرب', name: 'Al-Aqrab', malayalam: 'അൽ-അഖറബ്', english: 'Scorpio', element: 'Water' },
  { number: 9, arabic: 'القوس', name: 'Al-Qaws', malayalam: 'അൽ-ഖൗസ്', english: 'Sagittarius', element: 'Fire' },
  { number: 10, arabic: 'الجدى', name: 'Al-Jadi', malayalam: 'അൽ-ജദി', english: 'Capricorn', element: 'Earth' },
  { number: 11, arabic: 'الدلو', name: 'Al-Dalw', malayalam: 'അൽ-ദൽവ്', english: 'Aquarius', element: 'Air' },
  { number: 12, arabic: 'الحوت', name: 'Al-Hut', malayalam: 'അൽ-ഹൂത്', english: 'Pisces', element: 'Water' }
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. PLANETS — 7 CLASSICAL
// ─────────────────────────────────────────────────────────────────────────────

export const PLANETS = [
  { name: 'Saturn', arabic: 'زحل', malayalam: 'ശനി', nature: 'Nahs Akbar' },
  { name: 'Jupiter', arabic: 'مشتری', malayalam: 'വ്യാഴം', nature: 'Saad Akbar' },
  { name: 'Mars', arabic: 'مریخ', malayalam: 'ചൊവ്വ', nature: 'Nahs Asghar' },
  { name: 'Sun', arabic: 'شمس', malayalam: 'സൂര്യൻ', nature: 'Saad' },
  { name: 'Venus', arabic: 'زهره', malayalam: 'ശുക്രൻ', nature: 'Saad Asghar' },
  { name: 'Mercury', arabic: 'عطارد', malayalam: 'ബുധൻ', nature: 'Neutral' },
  { name: 'Moon', arabic: 'قمر', malayalam: 'ചന്ദ്രൻ', nature: 'Variable' }
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export function getLetterInfo(arabicChar) {
  return ARABIC_LETTERS.find(l => l.letter === arabicChar) || null;
}

export function getMansionInfo(arabicName) {
  return LUNAR_MANSIONS.find(m => m.arabic === arabicName) || null;
}

export function getZodiacInfo(arabicName) {
  return ZODIAC_SIGNS.find(z => z.arabic === arabicName) || null;
}

export function getPlanetInfo(arabicName) {
  return PLANETS.find(p => p.arabic === arabicName) || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY FORMATTING — ARABIC PRIMARY, MALAYALAM SECONDARY
// ─────────────────────────────────────────────────────────────────────────────

export function formatLetterDisplay(arabicChar) {
  const info = getLetterInfo(arabicChar);
  if (!info) return { primary: arabicChar, secondary: null };
  return {
    primary: info.letter,
    name: info.name,
    malayalam: info.malayalam,
    transliteration: info.transliteration
  };
}

export function formatMansionDisplay(arabicName) {
  const info = getMansionInfo(arabicName);
  if (!info) return { primary: arabicName, secondary: null };
  return {
    primary: info.arabic,
    number: info.number,
    name: info.name,
    malayalam: info.malayalam
  };
}

export function formatZodiacDisplay(arabicName) {
  const info = getZodiacInfo(arabicName);
  if (!info) return { primary: arabicName, secondary: null };
  return {
    primary: info.arabic,
    number: info.number,
    name: info.name,
    malayalam: info.malayalam,
    english: info.english,
    element: info.element
  };
}