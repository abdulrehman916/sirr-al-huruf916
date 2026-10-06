import { useMemo } from "react";
import { motion } from "framer-motion";
import { buildHierarchy, numToArabic } from "./msEngine";
import { buildAngelName, buildJinnName, buildSufliHadimName, buildHebrewAngelName, buildHebrewJinnName } from "./msHarakat";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
};

// ── Positional digit-cycle letter extraction (Arabic) ───────────
const AR_UNITS    = { 1:'ا',2:'ب',3:'ج',4:'د',5:'ه',6:'و',7:'ز',8:'ح',9:'ط' };
const AR_TENS     = { 10:'ي',20:'ك',30:'ل',40:'م',50:'ن',60:'س',70:'ع',80:'ف',90:'ص' };
const AR_HUNDREDS = { 100:'ق',200:'ر',300:'ش',400:'ت',500:'ث',600:'خ',700:'ذ',800:'ض',900:'ظ' };
const AR_THOUSAND = 'غ';

function extractArabicLetters(value) {
  if (!value || value <= 0) return [];
  const letters = [];
  let n = Math.floor(value);
  const digits = [];
  while (n > 0) { digits.push(n % 10); n = Math.floor(n / 10); }
  let slot = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = digits[i];
    if (slot === 0) {
      if (d !== 0 && AR_UNITS[d]) letters.push(AR_UNITS[d]);
      slot = 1;
    } else if (slot === 1) {
      if (d !== 0 && AR_TENS[d * 10]) letters.push(AR_TENS[d * 10]);
      slot = 2;
    } else if (slot === 2) {
      if (d !== 0 && AR_HUNDREDS[d * 100]) letters.push(AR_HUNDREDS[d * 100]);
      slot = 3;
    } else {
      letters.push(AR_THOUSAND);
      if (d !== 0 && d !== 1 && AR_UNITS[d]) letters.push(AR_UNITS[d]);
      slot = 1;
    }
  }
  return letters;
}

// ── Hebrew positional digit-cycle letter extraction ─────────────
const HE_UNITS    = { 1:'א',2:'ב',3:'ג',4:'ד',5:'ה',6:'ו',7:'ז',8:'ח',9:'ט' };
const HE_TENS     = { 10:'י',20:'כ',30:'ל',40:'מ',50:'נ',60:'ס',70:'ע',80:'פ',90:'צ' };
const HE_HUNDREDS = { 100:'ק',200:'ר',300:'ש',400:'ת',500:'ך',600:'ם',700:'ן',800:'ף',900:'ץ' };
const HE_THOUSAND = 'א';

function extractHebrewLetters(value) {
  if (!value || value <= 0) return [];
  const letters = [];
  let n = Math.floor(value);
  const digits = [];
  while (n > 0) { digits.push(n % 10); n = Math.floor(n / 10); }
  let slot = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = digits[i];
    if (slot === 0) {
      if (d !== 0 && HE_UNITS[d]) letters.push(HE_UNITS[d]);
      slot = 1;
    } else if (slot === 1) {
      if (d !== 0 && HE_TENS[d * 10]) letters.push(HE_TENS[d * 10]);
      slot = 2;
    } else if (slot === 2) {
      if (d !== 0 && HE_HUNDREDS[d * 100]) letters.push(HE_HUNDREDS[d * 100]);
      slot = 3;
    } else {
      letters.push(HE_THOUSAND);
      if (d !== 0 && d !== 1 && HE_UNITS[d]) letters.push(HE_UNITS[d]);
      slot = 1;
    }
  }
  return letters;
}

// ── Suffix-dispatched name generators ────────────────────────────
const ULV_SUFFIXES = { angelAr: 41, angelHeb: 31 };
const SFL_SUFFIXES = { jinnAr: 319, jinnHeb: 329 };

// Underflow rule: if value < suffix, add 360 first, then subtract
function adjustedValue(value, suffix) {
  if (!value || value <= 0) return 0;
  return value < suffix ? value + 360 - suffix : value - suffix;
}

function generateUlviNameSuffixed(value, suffix) {
  if (!value || value <= 0) return "...";
  if (suffix === "heb-angel") {
    const adj = adjustedValue(value, ULV_SUFFIXES.angelHeb);
    if (adj <= 0) return "...";
    const consonants = extractHebrewLetters(adj);
    return buildHebrewAngelName([...consonants].reverse());
  }
  // Default: Arabic Angel (-41)
  const adj = adjustedValue(value, ULV_SUFFIXES.angelAr);
  if (adj <= 0) return "...";
  const consonants = extractArabicLetters(adj);
  return buildAngelName([...consonants].reverse());
}

function generateSufliNameSuffixed(value, suffix) {
  if (!value || value <= 0) return "...";
  if (suffix === "ar-jinn") {
    const adj = adjustedValue(value, SFL_SUFFIXES.jinnAr);
    if (adj <= 0) return "...";
    const consonants = extractArabicLetters(adj);
    return buildJinnName([...consonants].reverse());
  }
  if (suffix === "heb-jinn") {
    const adj = adjustedValue(value, SFL_SUFFIXES.jinnHeb);
    if (adj <= 0) return "...";
    const consonants = extractHebrewLetters(adj);
    return buildHebrewJinnName([...consonants].reverse());
  }
  // Default: Arabic Sufli Hadim (-316, applied after angel -41)
  const angelVal = adjustedValue(value, ULV_SUFFIXES.angelAr);
  const adj = angelVal < 316 ? angelVal + 360 - 316 : angelVal - 316;
  if (adj <= 0) return "...";
  const consonants = extractArabicLetters(adj);
  return buildSufliHadimName([...consonants].reverse());
}

// ── Weekday computation ─────────────────────────────────────────
const ARABIC_WEEKDAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

const WEEKDAY_ULVI = {
  0: 'روقيائيل',   // Sunday — Sun
  1: 'جبرائيل',    // Monday — Moon
  2: 'سمسمائيل',   // Tuesday — Mars
  3: 'ميخائيل',    // Wednesday — Mercury
  4: 'صرفيائيل',   // Thursday — Jupiter
  5: 'عينائيل',    // Friday — Venus
  6: 'كسفيائيل',   // Saturday — Saturn
};

const WEEKDAY_SUFLI = {
  0: 'مذهب',       // Sunday — Mezheb
  1: 'أبيض',       // Monday — Ebyad
  2: 'أحمر',       // Tuesday — Ahmer
  3: 'بركان',      // Wednesday — Bürkan
  4: 'شمهورش',     // Thursday — Şemhureş
  5: 'زوبعة',      // Friday — Zubea
  6: 'ميمون',      // Saturday — Meymun
};

function getWeekdayInfo() {
  const d = new Date().getDay();
  return {
    name: ARABIC_WEEKDAYS[d],
    ulvi: WEEKDAY_ULVI[d],
    sufli: WEEKDAY_SUFLI[d],
  };
}

function joinArabicNames(names) {
  if (!names || names.length === 0) return "";
  if (names.length === 1) return names[0];
  return names.join(' و ');
}

// ── Generate the primary guardian name from MC using selected suffix ──
function generateGuardianName(value, suffix) {
  if (!value || value <= 0) return "...";
  // Angel-type suffixes: generate an angel name
  if (suffix === "ar-angel") {
    return generateUlviNameSuffixed(value, suffix);
  }
  if (suffix === "heb-angel") {
    return generateUlviNameSuffixed(value, suffix);
  }
  // Jinn-type suffixes: generate a jinn/hadim name
  // ar-jinn, ar-sufli-hadim, heb-jinn all go to sufli path
  return generateSufliNameSuffixed(value, suffix);
}

// ── Section divider atom ─────────────────────────────────────────
function SectionDivider() {
  return (
    <div className="mx-auto" style={{
      width: 48, height: 1,
      background: `linear-gradient(90deg, transparent, ${G.borderHi}, transparent)`,
    }} />
  );
}

function SectionTitle({ label }) {
  return (
    <p className="font-inter text-[10px] uppercase tracking-[0.25em] text-center"
      style={{ color: G.dim, letterSpacing: "0.25em" }}>
      {label}
    </p>
  );
}

/**
 * MsQasam — Dynamic Arabic QASAM with structured guardian sections.
 */
export { WEEKDAY_ULVI, WEEKDAY_SUFLI, ARABIC_WEEKDAYS, generateGuardianName };

export default function MsQasam({ mc, gridSize, grid, userPurpose, targetName, suffix = "ar-angel", customWeekdayName, customWeekdayUlvi, customWeekdaySufli }) {
  const weekday = useMemo(() => getWeekdayInfo(), []);

  const hier = useMemo(() => {
    if (!mc || !gridSize) return null;
    return buildHierarchy(mc, gridSize);
  }, [mc, gridSize]);

  // Esmaul Avan — one name per cell: numToArabic(cell) + طاطيل
  const esmaulAvanNames = useMemo(() => {
    if (!grid || !grid.grid) return [];
    return grid.grid.flat().map(v => numToArabic(v) + 'طاطيل');
  }, [grid]);

  const hierValues = useMemo(() => {
    if (!hier) return [];
    return [hier.usurper, hier.guide, hier.mystery, hier.adjuster,
            hier.leader, hier.regulator, hier.genGov, hier.highOver];
  }, [hier]);

  // Selected Main Guardian — single name from Adjuster (MC) using selected suffix
  const mainGuardian = useMemo(() => {
    if (!hier) return null;
    return generateGuardianName(hier.adjuster, suffix);
  }, [hier, suffix]);

  // Ulvi names for QASAM guardian position — all 8 hierarchy rows (−41 angel), fixed per vefk
  const ulviNames = useMemo(() => hierValues.map(v => generateUlviNameSuffixed(v, suffix)), [hierValues, suffix]);
  // Sufli names for QASAM invocation — all 8 hierarchy rows, suffix-dispatched
  const sufliNames = useMemo(() => hierValues.map(v => generateSufliNameSuffixed(v, suffix)), [hierValues, suffix]);

  const qasamText = useMemo(() => {
    if (!mc) return null;

    const purpose = userPurpose || '...';
    const esmaulAvanStr = joinArabicNames(esmaulAvanNames);
    const ulviStr = joinArabicNames(ulviNames);
    const sufliStr = joinArabicNames(sufliNames);
    const archangels = 'جبرائيل و إسرافيل و ميكائيل و عزرائيل';
    const wkName = customWeekdayName || weekday.name;
    const wkUlvi = customWeekdayUlvi || weekday.ulvi;
    const wkSufli = customWeekdaySufli || weekday.sufli;

    return `بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ

عَزِيمَةٌ مِنَ اللَّهِ وَرَسُولِهِ سُلَيْمَانَ بْنِ دَاوُدَ عَلَيْهِمَا السَّلَامُ. إِلَى مُلُوكِ الْجِنِّ وَالشَّيَاطِينِ وَالْمَرَدَةِ وَالْعَفَارِيتِ جُنُودِ إِبْلِيسَ أَجْمَعِينَ. أَقْسَمْتُ عَلَيْكُمْ أَيَّتُهَا الْأَرْوَاحُ الرُّوحَانِيَّةُ وَالْأَعْوَانُ الْأَرْضِيَّةُ أَنْ تُجِيبُوا دَعْوَتِي وَتَحْضُرُوا مَقَامِي وَتَشُمُّوا دُخَانِي وَتَقْضُوا حَوَائِجِي وَهِيَ ${purpose}. بِعِزَّةِ بَرْهَتِيه بَرْهَتِيه. كَرِير كَرِير. تَتْلِيه تَتْلِيه. طُورَان طُورَان. مَزْجَل مَزْجَل. بَرْجَل بَرْجَل. تَرْقَب تَرْقَب. بَرْهَش بَرْهَش. غَلْمَش غَلْمَش. خُوطِير خُوطِير. قَلْنَهُود قَلْنَهُود. بَرْشَان بَرْشَان. كَظْهِير كَظْهِير. نَمُوشَلَخ نَمُوشَلَخ. بَرْهَيُولَا بَرْهَيُولَا. بَشْكَيْلَخ بَشْكَيْلَخ. قَزْمَز قَزْمَز. أَنْغَلْلِيط أَنْغَلْلِيط. قَبَرَات قَبَرَات. غَيَاهَا غَيَاهَا. كَيْدَهُولَا كَيْدَهُولَا. شَمْخَاهَر شَمْخَاهَر. شَمْهَاهَر شَمْهَاهَر. شَمْخَاهِير شَمْخَاهِير.

بَكَهْطَهُونِيه بَكَهْطَهُونِيه. بَشَارِش بَشَارِش. طُونُش طُونُش. شَمْخَابَارُوح شَمْخَابَارُوح. اللَّهُمَّ بِحَقِّ كَهْكَهَيَج يَغْتَشَى بَلْطَشْغَشْغَوِيل أَمْوِيل جَلَد مَهْجَمَا هَلْمَج وَرُودِيه مَهْفِيَاج بِعِزَّتِكَ الَّامَا أَخَذْتَ سَمْعَهُمْ وَأَبْصَارَهُمْ سُبْحَانَ مَنْ لَيْسَ كَمِثْلِهِ شَيْءٌ وَهُوَ السَّمِيعُ الْبَصِيرُ أَقْسَمْتُ عَلَيْكُمْ وَأَدْعُوكُمْ مَعَاشِرَ الْأَرْوَاحِ الرُّوحَانِيَّةِ بِالِاسْمِ الَّذِي تَكَلَّمَ بِهِ مَلِكُ الْأَرْوَاحِ فَتَسَاقَطَتْ مِنْهُ رُؤُسُ الْمَلَائِكَةِ الرُّوحَانِيَّةِ وَالْكَرُوبِيِّينَ وَالصَّافِّينَ سُجَّدًا تَحْتَ عَرْشِ رَبِّ الْعَالَمِينَ وَهُوَ يَانْكِير يَانْكِير هُورَيْن هُورَيْن هُورَش هُورَش بَارُوح بَارُوح أَبْرَاخ أَبْرَاخ أَبْدَاخ أَبْدَاخ وَبِحَقِّ أَشْمَخ شَمَاخ الْعَالِي عَلَى كُلِّ بَرَاخ وَبِحَقِّ طَشْطِيش طَشْطِيش بَانْطِيطَيْون بَانْطِيطَيْون بَانْطِيطَيْوه بَانْطِيطَيْوه وَبِحَقِّ شَلْشَلِيش شَلْشَلِيش شَلْش شَلْش بَاكِرًا كَرُوك آلْ قُدُّوس عَلَى قَوِيٍّ عَزِيزٍ وَبِحَقِّ ${esmaulAvanStr} أَجِبْ أَيُّهَا الْمُلُوكُ وَالْأَعْوَانُ بِحَقِّ هَذِهِ الْأَسْمَاءِ عَلَيْكُمْ وَطَاعَتِهَا لَدَيْكُمْ وَبِحَقِّ مَنْ قَالَ لِلسَّمَاوَاتِ وَالْأَرْضِ ائْتِيَا طَوْعًا أَوْ كَرْهًا قَالَتَا أَتَيْنَا طَائِعِينَ لِلَّهِ رَبِّ الْعَالَمِينَ. أَجِبْ وَاسْمَعْ وَأَطِعْ وَلَا تَكُنْ مِنَ الَّذِينَ قَالُوا سَمِعْنَا وَأَطَعْنَا وَهُمْ لَا يَسْمَعُونَ. أَجِبْ يَا ${archangels} عَلَيْهِ السَّلَامُ وَأَنْتَ يَا أَمْلَاكَ الْمُوَكَّلِينَ بِهَذَا الْوَفْقِ ${ulviStr}. أَقْسَمْتُ عَلَيْكُمْ بِالْمَلِكِ الْعَظِيمِ مُنَزِّلِ الْوَحْيِ عَلَى الرَّسُولِ مِنْ مُرَادِقَاتِ الْعَظَمَةِ إِلَى اللَّوْحِ الْمَحْفُوظِ. إِلَّا مَا أَجَبْتُمْ عَزِيمَتِي هَذِهِ وَأَحْضَرْتُمْ خَادِمِي هَذَا الْيَوْمَ الْمُوَكَّلِينَ بِيَوْمِ ${wkName} ${wkUlvi} وَخَادِمَهُ ${wkSufli} وَخُدَّامَ هَذَا الْوَفْقِ ${sufliStr} بِحَقِّ مَا فِيهَا مِنْ سِرِّ الْأَسْرَارِ وَنُورِ الْأَنْوَارِ. هَيَّا هَيَّا. الْوَحَا الْوَحَا. الْعَجَلَ الْعَجَلَ. السَّاعَةَ السَّاعَةَ.`;
  }, [mc, userPurpose, weekday, ulviNames, sufliNames, esmaulAvanNames, customWeekdayName, customWeekdayUlvi, customWeekdaySufli]);

  const malayalamText = useMemo(() => {
    if (!mc) return null;
    const purpose = userPurpose || '...';
    const wkName = customWeekdayName || weekday.name;
    return `بسم الله الرحمن الرحيم

അല്ലാഹുവിന്റെ നാമത്തിൽ, പരമകാരുണികനും കരുണാനിധിയുമായവന്റെ.

അല്ലാഹുവിൽ നിന്നും അവന്റെ ദൂതൻ സുലൈമാൻ ബിൻ ദാവൂദ് (അ) യിൽ നിന്നുമുള്ള ഒരു ശക്തമായ ആജ്ഞ. ജിന്നുകളുടെ രാജാക്കന്മാർക്കും, പിശാചുക്കൾക്കും, വിമതന്മാർക്കും, ഇഫ്രീത്തുകൾക്കും, ഇബ്ലീസിന്റെ എല്ലാ സൈന്യങ്ങൾക്കും. ഓ ആത്മീയ ശക്തികളേ, ഓ ഭൗമിക സഹായികളേ, നിങ്ങളോട് ഞാൻ ആണയിടുന്നു — എന്റെ വിളിക്ക് ഉത്തരം നൽകുക, എന്റെ സന്നിധിയിൽ ഹാജരാകുക, എന്റെ ധൂപം മണക്കുക, എന്റെ ആവശ്യം നിറവേറ്റുക, അതായത്: ${purpose}. ബിര്‍ഹത്തീഹീൻ, കരീരീൻ, തത്‌ലഹീൻ, ത്വൂറാനീൻ, മസ്‌ജലീൻ, ബിസ്‌ജലീൻ, തർകാബീൻ, ബർഹശീൻ, ഗുൽമശീൻ, ഹത്വൂരീൻ, കാല്‍നഹൂദീൻ, ബർശാനീൻ, കസ്‌ഹീരീൻ, നമൂശ്‌ലഹീൻ, ബർഹായൂലീൻ, ബശ്‌കീലാഹീൻ, കസ്‌മജീൻ, അൻഗലാലീത്തീൻ, കബ്റാത്തീൻ, ഗായാഹീൻ, കൈദഹൂലീൻ, ശംഹാഹീരീൻ (മൂന്ന് പ്രാവശ്യം) എന്നീ നാമങ്ങളുടെ പ്രതാപത്താൽ.

ബകഹ്‌തഹൂനഹീൻ (രണ്ട് പ്രാവശ്യം), ബശാരിശീൻ, ത്വനീശീൻ, ശംഹബ്‌റൂഹീൻ. അല്ലാഹുവേ, കഹ്‌കഹീജീൻ, യഗ്‌തശീൻ, ബൽത്വ് സഗ് ശഗ്‌വീലീൻ എന്നിവയുടെ അവകാശത്താൽ... അവരുടെ കേൾവിയും കാഴ്ചകളും തട്ടിയെടുക്കുക. അവനു തുല്യമായി യാതൊന്നുമില്ലാത്തവൻ എത്ര പരിശുദ്ധൻ! അവൻ എല്ലാം കേൾക്കുന്നവനും കാണുന്നവനുമാണ്. ഈ വഫ്‌ഖിന്റെ പേരുകളുടെ (${esmaulAvanNames.length} നാമങ്ങൾ) അവകാശത്താൽ — ഓ രാജാക്കന്മാരേ, സഹായികളേ, ഉത്തരം നൽകുക. ആകാശത്തോടും ഭൂമിയോടും "സ്വമേധയാ അല്ലെങ്കിൽ നിർബന്ധിതമായി വരുവിൻ" എന്ന് പറഞ്ഞവന്റെ അവകാശത്താൽ. അവർ പറഞ്ഞു: "ഞങ്ങൾ അനുസരണയോടെ വന്നിരിക്കുന്നു." ജിബ്രീൽ, ഇസ്‌റാഫീൽ, മീകാഈൽ, അസ്‌റാഈൽ (അ) എന്നിവരേ, ഉത്തരം നൽകുക. ഈ വഫ്‌ഖിന്റെ ചുമതലയുള്ള മലക്കുകളേ, ഉത്തരം നൽകുക. മഹത്തായ രാജാവിന്റെ പേരിൽ ഞാൻ നിങ്ങളോട് ആണയിടുന്നു, വഹ്‌യ് ഇറക്കിയവന്റെ, സംരക്ഷിത ഫലകത്തിലേക്ക് മഹത്വത്തിന്റെ തിരശ്ശീലകളിൽ നിന്ന്... ${wkName} ദിവസത്തിന്റെ ചുമതലയുള്ള ഈ ദിവസത്തെ ഖാദിമിനെ ഹാജരാക്കുക. രഹസ്യങ്ങളുടെ രഹസ്യവും പ്രകാശങ്ങളുടെ പ്രകാശവും ഇതിൽ അടങ്ങിയിരിക്കുന്നതിന്റെ അവകാശത്താൽ. വേഗം വേഗം. ഉടൻ ഉടൻ. ഈ നിമിഷം ഈ നിമിഷം.`;
  }, [mc, userPurpose, weekday, esmaulAvanNames, customWeekdayName, customWeekdayUlvi, customWeekdaySufli]);

  if (!mc) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border p-6 space-y-5"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 28px ${G.glow}`,
      }}
    >
      {/* Master Title */}
      <div className="text-center space-y-2">
        <h2 className="font-inter font-bold tracking-[0.25em] uppercase"
          style={{ color: G.text, fontSize: "1.1rem", letterSpacing: "0.25em" }}>
          QASAM
        </h2>
        <SectionDivider />
      </div>

      {/* Arabic QASAM */}
      <div className="rounded-xl p-5"
        style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
        <SectionTitle label="ARABIC QASAM" />
        <div className="mt-3">
          <p className="font-amiri text-center" dir="rtl"
            style={{
              color: "rgba(245,235,210,0.92)",
              whiteSpace: "pre-wrap",
              textShadow: "0 0 10px rgba(212,175,55,0.10)",
              fontFamily: '"Scheherazade New", "Amiri", "Noto Naskh Arabic", serif',
              fontSize: "1.45rem",
              lineHeight: 4.2,
              letterSpacing: "0.06em",
              wordSpacing: "0.28em",
              fontWeight: 400,
              textRendering: "optimizeLegibility",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              fontFeatureSettings: '"kern" 1, "liga" 1, "calt" 1',
              unicodeBidi: "bidi-override",
            }}>
            {qasamText}
          </p>
        </div>
      </div>

      {/* Malayalam Translation */}
      {malayalamText && (
        <div className="rounded-xl p-5"
          style={{ background: "rgba(212,175,55,0.02)", border: "1px solid rgba(212,175,55,0.10)" }}>
          <p className="font-inter text-[9px] uppercase tracking-widest text-center mb-3"
            style={{ color: "rgba(212,175,55,0.40)" }}>
            മലയാളം · Malayalam Translation
          </p>
          <p className="text-sm leading-[2.2] text-left"
            style={{ color: "rgba(220,220,220,0.80)", whiteSpace: "pre-wrap" }}>
            {malayalamText}
          </p>
        </div>
      )}
    </motion.div>
  );
}