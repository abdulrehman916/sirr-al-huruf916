// ═══════════════════════════════════════════════════════════════
// KASHF SAAT DATA — single source of truth for the Saat cards
// Source: كشف الحقائق لمن جهل الطرائق (Omani compilation, 364 pp.)
// Every value below carries the book page it came from.
// Only everyday choices (travel, marriage, trade …) are encoded —
// no azaim, talismans, jinn work or harm-related timings.
// ═══════════════════════════════════════════════════════════════

export const BOOK = {
  ar: "كشف الحقائق لمن جهل الطرائق",
  ml: "കശ്ഫുൽ ഹഖാഇഖ്",
};

// ── Activities shown on every card ─────────────────────────────
export const ACTIVITIES = [
  { id: "needs",     ml: "ആവശ്യങ്ങൾ / ദുആ",       en: "Needs & du'a",         icon: "🤲" },
  { id: "travel",    ml: "യാത്ര",                  en: "Travel",               icon: "🧳" },
  { id: "marriage",  ml: "വിവാഹം / നിക്കാഹ്",       en: "Nikah (marriage)",     icon: "💍" },
  { id: "trade",     ml: "കച്ചവടം / വാങ്ങൽ-വിൽക്കൽ", en: "Trade",                icon: "🛒" },
  { id: "officials", ml: "അധികാരികളെ കാണൽ",         en: "Meeting officials",    icon: "🏛️" },
  { id: "building",  ml: "കെട്ടിടം / തറക്കല്ല്",     en: "Building",             icon: "🧱" },
  { id: "farming",   ml: "കൃഷി / നടീൽ",             en: "Farming & planting",   icon: "🌱" },
  { id: "clothes",   ml: "പുതുവസ്ത്രം",              en: "New clothes",          icon: "👕" },
  { id: "medicine",  ml: "ചികിത്സ / ഹിജാമ",         en: "Medicine & hijama",    icon: "💊" },
  { id: "learning",  ml: "പഠനം / എഴുത്ത്",          en: "Learning & writing",   icon: "📖" },
];
export const ALL = ACTIVITIES.map(a => a.id);

// ── Planets ────────────────────────────────────────────────────
// Chaldean order (book p.14-15): زحل مشتري مريخ شمس زهرة عطارد قمر
export const PLANET_ORDER = ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"];

// Nature — book p.266: المشتري السعد الأكبر، الزهرة السعد الأصغر، زحل النحس الأكبر،
// المريخ النحس الأصغر، الشمس سعد أوسط، عطارد والقمر ممتزجان
export const PLANETS = {
  saturn:  { tr_ml: "സുഹൽ", tr_en: "Zuhal", ar: "زحل",    ml: "ശനി",    en: "Saturn",  symbol: "♄", nature: "nahs_akbar",  base: 20, metal_ml: "ഈയം", metal_en: "Lead" },
  jupiter: { tr_ml: "മുശ്തരി", tr_en: "Mushtari", ar: "المشتري", ml: "വ്യാഴം",  en: "Jupiter", symbol: "♃", nature: "saad_akbar",  base: 95, metal_ml: "വെള്ളീയം", metal_en: "Tin" },
  mars:    { tr_ml: "മിർരീഖ്", tr_en: "Mirrikh", ar: "المريخ",  ml: "ചൊവ്വ",   en: "Mars",    symbol: "♂", nature: "nahs_asghar", base: 30, metal_ml: "ഇരുമ്പ്", metal_en: "Iron" },
  sun:     { tr_ml: "ശംസ്", tr_en: "Shams", ar: "الشمس",   ml: "സൂര്യൻ",  en: "Sun",     symbol: "☉", nature: "saad_awsat",  base: 75, metal_ml: "സ്വർണ്ണം", metal_en: "Gold" },
  venus:   { tr_ml: "സുഹ്റ", tr_en: "Zuhra", ar: "الزهرة",  ml: "ശുക്രൻ",  en: "Venus",   symbol: "♀", nature: "saad_asghar", base: 85, metal_ml: "ചെമ്പ്", metal_en: "Copper" },
  mercury: { tr_ml: "ഉത്വാരിദ്", tr_en: "Utarid", ar: "عطارد",  ml: "ബുധൻ",   en: "Mercury", symbol: "☿", nature: "mixed",       base: 60, metal_ml: "രസം", metal_en: "Quicksilver" },
  moon:    { tr_ml: "ഖമർ", tr_en: "Qamar", ar: "القمر",   ml: "ചന്ദ്രൻ",  en: "Moon",    symbol: "☽", nature: "mixed",       base: 60, metal_ml: "വെള്ളി", metal_en: "Silver" },
};

export const NATURE_LABEL = {
  saad_akbar:  { ar: "السعد الأكبر", ml: "സഅ്ദ് അക്ബർ — ഏറ്റവും വലിയ ശുഭം", en: "Sa'd Akbar — greater benefic" },
  saad_asghar: { ar: "السعد الأصغر", ml: "സഅ്ദ് അസ്ഗർ — ചെറിയ ശുഭം",       en: "Sa'd Asghar — lesser benefic" },
  saad_awsat:  { ar: "سعد أوسط",    ml: "സഅ്ദ് ഔസത്ത് — ഇടത്തരം ശുഭം",     en: "Sa'd Awsat — middle benefic" },
  mixed:       { ar: "ممتزج",       ml: "മുംതസിജ് — കലർന്നത്",              en: "Mumtazij — mixed" },
  nahs_asghar: { ar: "النحس الأصغر", ml: "നഹ്സ് അസ്ഗർ — ചെറിയ അശുഭം",       en: "Nahs Asghar — lesser malefic" },
  nahs_akbar:  { ar: "النحس الأكبر", ml: "നഹ്സ് അക്ബർ — ഏറ്റവും വലിയ അശുഭം", en: "Nahs Akbar — greater malefic" },
};

// Hour-planet affinity — only where the book links a planet hour to an everyday aim.
//   officials: Sun hour, Sunday 1st hour (p.26) · needs/rizq: Jupiter, Thursday 1st hour (p.27)
//   marriage/love: Venus hour (p.13)
export const PLANET_AFFINITY = {
  sun: ["officials"],
  jupiter: ["needs", "trade"],
  venus: ["marriage"],
};

// ── Weekdays (0 = Sunday) ──────────────────────────────────────
// good: Khamis al-Abri (p.59) + al-Ma'wali poem (p.66)
// clothes: poem p.67 · avoidDir: Kharusi poem p.57
export const WEEKDAYS = [
  { tr_ml: "അഹദ്", tr_en: "Ahad", clothesNote_en: "New clothes: brings sorrow", avoidDir_en: "West", ar: "الأحد",   ml: "ഞായർ",   en: "Sunday",    planet: "sun",
    good: ["building"], clothes: "bad", clothesNote_ml: "പുതുവസ്ത്രം: സങ്കടം വരും", avoidDir_ml: "പടിഞ്ഞാറ്" },
  { tr_ml: "ഇഥ്നൈൻ", tr_en: "Ithnayn", clothesNote_en: "New clothes: honour and peace", avoidDir_en: "East", ar: "الإثنين", ml: "തിങ്കൾ",  en: "Monday",    planet: "moon",
    good: ["travel"], clothes: "good", clothesNote_ml: "പുതുവസ്ത്രം: ആദരവ്, സമാധാനം", avoidDir_ml: "കിഴക്ക്" },
  { tr_ml: "ഥുലാഥാഅ്", tr_en: "Thulatha", clothesNote_en: "New clothes: theft / fear of water", avoidDir_en: "North", note_en: "A day for hijama", ar: "الثلاثاء", ml: "ചൊവ്വ",  en: "Tuesday",   planet: "mars",
    good: ["medicine"], clothes: "bad", clothesNote_ml: "പുതുവസ്ത്രം: മോഷണം/വെള്ളപ്പേടി", avoidDir_ml: "വടക്ക്", note_ml: "ഹിജാമയ്ക്കുള്ള ദിവസം" },
  { tr_ml: "അർബിആഅ്", tr_en: "Arbi'a", clothesNote_en: "New clothes: rizq", avoidDir_en: "North", note_en: "Nikah may be on Wednesday night (Tuesday evening), not Wednesday daytime", ar: "الأربعاء", ml: "ബുധൻ",  en: "Wednesday", planet: "mercury",
    good: ["medicine"], clothes: "good", clothesNote_ml: "പുതുവസ്ത്രം: റിസ്ഖ്", avoidDir_ml: "വടക്ക്",
    note_ml: "നിക്കാഹ് ബുധൻ രാത്രിയിൽ (ചൊവ്വ വൈകുന്നേരം) ആകാം, ബുധൻ പകലിൽ വേണ്ട" },
  { tr_ml: "ഖമീസ്", tr_en: "Khamis", clothesNote_en: "New clothes: knowledge", avoidDir_en: "South", ar: "الخميس",  ml: "വ്യാഴം",  en: "Thursday",  planet: "jupiter",
    good: ["needs", "clothes", "learning"], clothes: "good", clothesNote_ml: "പുതുവസ്ത്രം: അറിവ്", avoidDir_ml: "തെക്ക്" },
  { tr_ml: "ജുമുഅ", tr_en: "Jumu'a", clothesNote_en: "New clothes: long life", avoidDir_en: "West", ar: "الجمعة",  ml: "വെള്ളി",  en: "Friday",    planet: "venus",
    good: ["marriage"], clothes: "good", clothesNote_ml: "പുതുവസ്ത്രം: ആയുസ്സ് നീളും", avoidDir_ml: "പടിഞ്ഞാറ്" },
  { tr_ml: "സബ്ത്", tr_en: "Sabt", clothesNote_en: "New clothes: illness", avoidDir_en: "East", note_en: "A day for hunting", ar: "السبت",   ml: "ശനി",    en: "Saturday",  planet: "saturn",
    good: ["travel"], clothes: "bad", clothesNote_ml: "പുതുവസ്ത്രം: അസുഖം", avoidDir_ml: "കിഴക്ക്", note_ml: "വേട്ടയ്ക്കുള്ള ദിവസം" },
];

// ── Hour tables (day hours only) ───────────────────────────────
// Ijaba & mughalaba, p.53 · hour number of the DAY (1-12)
export const IJABA_HOUR = { 0: 3, 1: 3, 2: 4, 3: 4, 4: 4, 5: 4, 6: 2 };
export const MUGHALABA_HOUR = { 0: 3, 1: 4, 2: 5, 3: 6, 4: 7, 5: 6, 6: 5 };
// "Great masters": 1st and 8th hours of Sun, Mon, Thu, Fri (p.13)
export const MASTERS_HOURS = { days: [0, 1, 4, 5], hours: [1, 8] };
// Sheikh Jaad al-Kharusi table (p.54) — planet per day
export const JAAD = {
  0: { saad: "saturn",  ghalaba: "mercury", ijaba: "venus",   baraka: "venus" },
  1: { saad: "venus",   ghalaba: "mars",    ijaba: "jupiter", baraka: "mercury" },
  2: { saad: "mars",    ghalaba: "moon",    ijaba: "mercury", baraka: "jupiter" },
  3: { saad: "jupiter", ghalaba: "sun",     ijaba: "jupiter", baraka: "saturn" },
  4: { saad: "moon",    ghalaba: "saturn",  ijaba: "venus",   baraka: "venus" },
  5: { saad: "sun",     ghalaba: "mars",    ijaba: "saturn",  baraka: "moon" },
  6: { saad: "mercury", ghalaba: "venus",   ijaba: "jupiter", baraka: "sun" },
};
// Moon-in-sign → hour for needs (p.54). Sign index 0 = Aries.
export const MOON_SIGN_NEEDS_HOUR = ["mars", "venus", "mercury", "moon", "sun", "mercury", "venus", "mars", "jupiter", "saturn", "saturn", "jupiter"];

// ── Lunar month ────────────────────────────────────────────────
// Seven kawamil days (p.57-58)
export const KAWAMIL = [3, 5, 13, 16, 21, 24, 25];
export const KAWAMIL_AVOID = ["trade", "travel", "marriage", "clothes", "farming", "building", "officials"];
// One nahs day per Hijri month — al-Khalili (p.59). Month 1 = Muharram.
export const KHALILI_NAHS = { 1: 12, 2: 10, 3: 4, 4: 8, 5: 2, 6: 2, 7: 2, 8: 23, 9: 24, 10: 8, 11: 28, 12: 8 };
export const HIJRI_MONTHS_ML = ["മുഹർറം", "സഫർ", "റബീഉൽ അവ്വൽ", "റബീഉൽ ആഖിർ", "ജുമാദൽ ഊലാ", "ജുമാദൽ ആഖിറ", "റജബ്", "ശഅ്ബാൻ", "റമദാൻ", "ശവ്വാൽ", "ദുൽഖഅ്ദ", "ദുൽഹിജ്ജ"];

// Day-by-day (p.60-65). nature: good | bad | mixed
export const MONTH_DAYS = {
  1:  { nature: "good",  good: ["needs", "trade", "farming", "travel", "learning", "marriage", "officials"], avoid: [], note_ml: "ആദം(അ) സൃഷ്ടിക്കപ്പെട്ട ദിവസം" },
  2:  { nature: "good",  good: ["travel", "marriage", "building", "needs"], avoid: [], note_ml: "ഹവ്വ(അ) സൃഷ്ടിക്കപ്പെട്ട ദിവസം" },
  3:  { nature: "bad",   good: [], avoid: ALL, note_ml: "നഹ്സ് മുസ്തമിർ — വീട്ടിൽ ഇരിക്കുക" },
  4:  { nature: "good",  good: ["marriage", "farming", "building"], avoid: ["travel"], note_ml: "ഹാബീൽ ജനിച്ച ദിവസം" },
  5:  { nature: "bad",   good: [], avoid: ALL, note_ml: "പുതിയ കാര്യം തുടങ്ങരുത്" },
  6:  { nature: "good",  good: ["marriage", "needs", "travel"], avoid: [], note_ml: "യാത്രക്കാരൻ സന്തോഷത്തോടെ മടങ്ങും" },
  7:  { nature: "good",  good: ["needs", "learning", "building", "farming", "trade", "marriage"], avoid: [], note_ml: "എല്ലാത്തിനും നല്ലത്" },
  8:  { nature: "good",  good: ["trade", "officials", "needs"], avoid: ["travel"], note_ml: "കടൽയാത്രയും കരാറും വേണ്ട" },
  9:  { nature: "good",  good: ["travel", "needs", "farming"], avoid: [], note_ml: "യാത്രയിൽ ധനം കിട്ടും" },
  10: { nature: "good",  good: ["trade", "travel", "needs", "medicine"], avoid: ["officials"], note_ml: "നൂഹ്(അ) ജനിച്ച ദിവസം; രോഗി സുഖപ്പെടും" },
  11: { nature: "good",  good: ["trade", "travel", "needs"], avoid: ["officials"], note_ml: "ശീസ്(അ) ജനിച്ച ദിവസം" },
  12: { nature: "good",  good: ["marriage", "trade", "needs"], avoid: [], note_ml: "കട തുറക്കാൻ നല്ലത്; മധ്യസ്ഥത വേണ്ട" },
  13: { nature: "bad",   good: [], avoid: ALL, note_ml: "നഹ്സ് മുസ്തമിർ — തർക്കം, മുടി വെട്ടൽ വേണ്ട" },
  14: { nature: "good",  good: ["learning", "trade", "needs", "travel"], avoid: [], note_ml: "അറിവ്, വാങ്ങൽ-വിൽക്കൽ, കടം വാങ്ങലും കൊടുക്കലും, കടൽയാത്ര" },
  15: { nature: "good",  good: ["needs"], avoid: [], note_ml: "ചിലർ: കടമൊഴികെ ശ്രദ്ധിക്കുക" },
  16: { nature: "bad",   good: ["trade", "building"], avoid: ["travel", "officials"], note_ml: "യാത്ര വളരെ അപകടം" },
  17: { nature: "good",  good: ["marriage", "trade", "farming", "building", "officials"], avoid: [], note_ml: "ആവശ്യങ്ങൾ നടക്കും; ചിലർ: ഇടത്തരം — തർക്കം ഒഴിവാക്കുക, കടം തിരിച്ചുകിട്ടില്ല" },
  18: { nature: "good",  good: ["travel", "needs", "trade", "farming"], avoid: [], note_ml: "എതിരാളിയെ ജയിക്കും" },
  19: { nature: "good",  good: ["learning", "travel", "needs", "trade"], avoid: [], note_ml: "ഇസ്ഹാഖ്(അ) ജനിച്ച ദിവസം" },
  20: { nature: "good",  good: ["travel", "building", "marriage", "farming", "officials", "needs"], avoid: [], note_ml: "ആവശ്യങ്ങൾ, യാത്ര, കെട്ടിടം, നടീൽ" },
  21: { nature: "bad",   good: [], avoid: ALL, note_ml: "നഹ്സ് മുസ്തമിർ" },
  22: { nature: "good",  good: ["trade", "officials", "travel", "needs"], avoid: [], note_ml: "സ്വദഖ സ്വീകാര്യം" },
  23: { nature: "good",  good: ["marriage", "trade", "officials", "travel"], avoid: [], note_ml: "യൂസുഫ്(അ) ജനിച്ച ദിവസം" },
  24: { nature: "bad",   good: [], avoid: ALL, note_ml: "ഫിർഔൻ ജനിച്ച ദിവസം" },
  25: { nature: "bad",   good: [], avoid: ALL, note_ml: "സ്വയം സൂക്ഷിക്കുക" },
  26: { nature: "mixed", good: ["needs"], avoid: ["marriage", "travel"], note_ml: "സ്വദഖ ചെയ്യുക; മൂസ(അ) കടൽ പിളർന്ന ദിവസം" },
  27: { nature: "good",  good: ["needs", "officials", "trade"], avoid: [], note_ml: "ആവശ്യങ്ങൾക്കും കൂടിക്കാഴ്ചയ്ക്കും നല്ലത്" },
  28: { nature: "mixed", good: [], avoid: [], note_ml: "യഅ്ഖൂബ്(അ) ജനിച്ച ദിവസം" },
  29: { nature: "good",  good: ["travel", "needs", "medicine"], avoid: [], note_ml: "വസ്വിയ്യത്ത് എഴുതരുത്" },
  30: { nature: "good",  good: ["trade", "farming", "marriage", "medicine"], avoid: [], note_ml: "ചിലർ: യാത്ര വേണ്ട" },
};

// ── 28 mansions (Kashf division: starts at 0° Aries, p.127-128) ─
// nature: Kharusi (p.55-56) · travel: al-Nabhani poem (p.68-69)
// good/avoid: Hermes section (p.115-124) · lists: Dhu al-Ghabra (p.75-77)
export const TRAVEL_GOOD_MANSIONS = [1, 5, 8, 13, 20, 24, 27, 28];
export const MARRIAGE_GOOD_MANSIONS = [3, 5, 6, 7, 11, 13, 15, 18, 20, 24, 26, 28];

export const MANSIONS = [
  null,
  { ar: "الشرطين", ml: "ശറത്വൈൻ",    nature: "nahs",  travel_ml: "ധാരാളം നന്മ", good: ["marriage", "farming", "building"], avoid: ["clothes", "officials", "trade", "travel"] },
  { ar: "البطين",  ml: "ബുത്വൈൻ",    nature: "nahs",  travel_ml: "ദാരിദ്ര്യം കൂടും", good: ["officials"], avoid: ["marriage", "trade", "clothes", "farming"] },
  { ar: "الثريا",  ml: "ഥുറയ്യ",      nature: "saad",  travel_ml: "ധാരാളം നന്മ", good: ["travel", "marriage", "building", "farming", "clothes", "officials", "trade"], avoid: [] },
  { ar: "الدبران", ml: "ദബറാൻ",      nature: "nahs",  travel_ml: "മരണഭയം", good: [], avoid: ALL },
  { ar: "الهقعة",  ml: "ഹഖ്അ",        nature: "nahs",  travel_ml: "ആവശ്യം നിറവേറും", good: ["officials", "trade", "clothes", "travel"], avoid: ["farming", "building", "marriage"] },
  { ar: "الهنعة",  ml: "ഹൻഅ",        nature: "mixed", travel_ml: "കൊള്ളഭയം", good: ["marriage", "farming", "building", "officials", "trade"], avoid: [] },
  { ar: "الذراع",  ml: "ദിറാഅ്",      nature: "saad",  travel_ml: "കൊള്ള/കൊല ഭയം", good: ["officials", "farming", "marriage", "trade", "clothes"], avoid: [] },
  { ar: "النثرة",  ml: "നഥ്റ",        nature: "saad",  travel_ml: "ബഹുമതി, ലക്ഷ്യം നേടും", good: ["travel", "officials", "farming"], avoid: ["clothes", "marriage", "trade"] },
  { ar: "الطرفة",  ml: "ത്വർഫ്",      nature: "nahs",  travel_ml: "നേട്ടം", good: [], avoid: ALL },
  { ar: "الجبهة",  ml: "ജബ്ഹ",        nature: "saad",  travel_ml: "പദവി, ധനം", good: ["officials", "farming", "marriage", "trade", "travel"], avoid: [] },
  { ar: "الزبرة",  ml: "സുബ്റ",       nature: "saad",  travel_ml: "ദുരന്ത ഭയം", good: ["officials", "farming", "marriage", "trade", "clothes"], avoid: [] },
  { ar: "الصرفة",  ml: "സ്വർഫ",       nature: "nahs",  travel_ml: "യാത്ര മാറ്റിവെക്കുക", good: [], avoid: ["farming", "officials", "marriage", "trade", "clothes"] },
  { ar: "العواء",  ml: "അവ്വാഅ്",      nature: "nahs",  travel_ml: "നേട്ടം", good: ["farming", "officials", "clothes", "marriage", "trade", "travel"], avoid: [] },
  { ar: "السماك",  ml: "സിമാക്",       nature: "nahs",  travel_ml: "മുങ്ങിമരണ ഭയം", good: [], avoid: ALL, note_ml: "ഖറൂസി: ശുഭം; ഹെർമിസ്, ആമിലി: അശുഭം" },
  { ar: "الغفر",   ml: "ഗഫ്ർ",        nature: "saad",  travel_ml: "ബഹുമതി", good: ["travel", "marriage", "trade", "farming", "clothes", "officials"], avoid: [] },
  { ar: "الزبانا", ml: "സുബാന",       nature: "nahs",  travel_ml: "ധനനഷ്ടം", good: ["farming", "officials", "marriage", "trade"], avoid: ["travel", "clothes"] },
  { ar: "الإكليل", ml: "ഇക്‌ലീൽ",     nature: "nahs",  travel_ml: "ഉപദ്രവ ഭയം", good: [], avoid: ALL },
  { ar: "القلب",   ml: "ഖൽബ്",        nature: "saad",  travel_ml: "ഏറ്റവും മോശം", good: ["officials", "farming", "marriage", "trade", "clothes"], avoid: ["travel"] },
  { ar: "الشولة",  ml: "ശൗല",         nature: "nahs",  travel_ml: "മരണഭയം", good: ["farming"], avoid: ["travel", "marriage", "clothes", "officials"] },
  { ar: "النعائم", ml: "നആഇം",        nature: "saad",  travel_ml: "ലാഭം (അസുഖത്തോടെ)", good: ["travel", "marriage", "building", "trade", "farming", "clothes", "officials"], avoid: [] },
  { ar: "البلدة",  ml: "ബൽദ",         nature: "nahs",  travel_ml: "ഇടത്തരം", good: [], avoid: ALL, note_ml: "ഖറൂസി: ശുഭം; ഹെർമിസ്: അശുഭം" },
  { ar: "سعد الذابح", ml: "സഅ്ദുദ്ദാബിഹ്", nature: "nahs", travel_ml: "ഏറ്റവും മോശം", good: ["farming"], avoid: ["travel", "clothes", "officials", "marriage"] },
  { ar: "سعد بلع", ml: "സഅ്ദു ബുലഅ്",  nature: "saad",  travel_ml: "ശുഭം, കണ്ണുരോഗ ഭയം", good: ["travel", "officials", "farming", "clothes"], avoid: ["marriage", "trade"] },
  { ar: "سعد السعود", ml: "സഅ്ദുസ്സുഊദ്", nature: "saad", travel_ml: "ലാഭവും സന്തോഷവും", good: ALL, avoid: [] },
  { ar: "سعد الأخبية", ml: "സഅ്ദുൽ അഖ്ബിയ", nature: "nahs", travel_ml: "വ്യക്തമല്ല", good: [], avoid: ALL, note_ml: "ഖറൂസി: ശുഭം; ഹെർമിസ്, ആമിലി: അശുഭം" },
  { ar: "فرغ المقدم", ml: "ഫർഗുൽ മുഖദ്ദം", nature: "saad", travel_ml: "പണമില്ലാതെ മടങ്ങും", good: ALL.filter(a => a !== "travel"), avoid: [] },
  { ar: "فرغ المؤخر", ml: "ഫർഗുൽ മുഅഖ്ഖർ", nature: "saad", travel_ml: "നന്മ", good: ["travel", "officials", "farming", "clothes"], avoid: ["marriage", "trade"] },
  { ar: "بطن الحوت", ml: "ബത്വ്നുൽ ഹൂത്", nature: "saad", travel_ml: "നേട്ടം", good: ALL, avoid: [] },
];

export const SIGNS_ML = ["മേടം", "ഇടവം", "മിഥുനം", "കർക്കടകം", "ചിങ്ങം", "കന്നി", "തുലാം", "വൃശ്ചികം", "ധനു", "മകരം", "കുംഭം", "മീനം"];
export const SIGNS_AR = ["الحمل", "الثور", "الجوزاء", "السرطان", "الأسد", "العذراء", "الميزان", "العقرب", "القوس", "الجدي", "الدلو", "الحوت"];

// Weights for the % score. The moon is deliberately the lightest factor.
export const WEIGHTS = { day: 0.45, hour: 0.35, moon: 0.20 };

// ── English companions (same order/keys as the Malayalam data above) ──
export const HIJRI_MONTHS_EN = ["Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Akhir", "Jumada al-Ula", "Jumada al-Akhira", "Rajab", "Sha'ban", "Ramadan", "Shawwal", "Dhu al-Qa'da", "Dhu al-Hijja"];
export const HIJRI_MONTHS_AR = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة", "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
// Arabic sign names in Malayalam / English script
export const SIGNS_TR_ML = ["ഹമൽ", "ഥൗർ", "ജൗസാഅ്", "സരത്വാൻ", "അസദ്", "അദ്റാഅ്", "മീസാൻ", "അഖ്റബ്", "ഖൗസ്", "ജദ്‌യ്", "ദൽവ്", "ഹൂത്"];
export const SIGNS_TR_EN = ["Hamal", "Thawr", "Jawza", "Saratan", "Asad", "Adhra", "Mizan", "Aqrab", "Qaws", "Jady", "Dalw", "Hut"];
export const SIGNS_EN = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
export const MONTH_DAY_NOTE_EN = {
  1: "Day Adam (AS) was created", 2: "Day Hawwa (AS) was created", 3: "Nahs mustamirr — stay at home",
  4: "Day Habil was born", 5: "Do not begin anything new", 6: "The traveller returns happy",
  7: "Good for everything", 8: "No sea travel or contracts", 9: "Wealth comes on a journey",
  10: "Nuh (AS) was born; the sick recover", 11: "Shith (AS) was born", 12: "Good to open a shop; no mediation",
  13: "Nahs mustamirr — no disputes, no haircut", 14: "Knowledge, buying and selling, borrowing and lending, going to sea", 15: "Some say: be careful except for debts",
  16: "Travel is very dangerous", 17: "Needs are granted; some call it middling — avoid disputes, a loan is not returned", 18: "You will overcome an opponent",
  19: "Ishaq (AS) was born", 20: "Needs, travel, building and planting", 21: "Nahs mustamirr",
  22: "Sadaqa is accepted", 23: "Yusuf (AS) was born", 24: "Day Fir'awn was born",
  25: "Guard yourself", 26: "Give sadaqa; day Musa (AS) parted the sea", 27: "Good for needs and for meeting someone",
  28: "Ya'qub (AS) was born", 29: "Do not write a will", 30: "Some say: no travel",
};
export const MANSIONS_EN = [
  null,
  { name: "Sharatayn", travel: "much good" }, { name: "Butayn", travel: "poverty increases" },
  { name: "Thurayya", travel: "much good" }, { name: "Dabaran", travel: "fear of death" },
  { name: "Haq'a", travel: "need fulfilled" }, { name: "Han'a", travel: "fear of robbery" },
  { name: "Dhira'", travel: "fear of robbery / killing" }, { name: "Nathra", travel: "honour, goal reached" },
  { name: "Tarf", travel: "gain" }, { name: "Jabha", travel: "rank, wealth" },
  { name: "Zubra", travel: "fear of calamity" }, { name: "Sarfa", travel: "postpone the journey" },
  { name: "Awwa'", travel: "gain" }, { name: "Simak", travel: "fear of drowning", note: "Kharusi: benefic; Hermes, Amili: malefic" },
  { name: "Ghafr", travel: "honour" }, { name: "Zubana", travel: "loss of wealth" },
  { name: "Iklil", travel: "fear of harm" }, { name: "Qalb", travel: "the worst" },
  { name: "Shawla", travel: "fear of death" }, { name: "Na'a'im", travel: "profit (with illness)" },
  { name: "Balda", travel: "middling", note: "Kharusi: benefic; Hermes: malefic" }, { name: "Sa'd al-Dhabih", travel: "the worst" },
  { name: "Sa'd Bula'", travel: "benefic, fear of eye illness" }, { name: "Sa'd al-Su'ud", travel: "profit and joy" },
  { name: "Sa'd al-Akhbiya", travel: "unclear", note: "Kharusi: benefic; Hermes, Amili: malefic" }, { name: "Fargh al-Muqaddam", travel: "returns without money" },
  { name: "Fargh al-Mu'akhkhar", travel: "good" }, { name: "Batn al-Hut", travel: "gain" },
];

// ── Manazil: best hours (al-Khalili's commentary, "خير ساعاته") ──
// Planet keys; mansions the commentary gives no hours for are absent.
export const MANSION_BEST_HOURS = {
  2: ["mars", "venus"], 3: ["venus", "mars"], 5: ["mercury"], 6: ["venus"], 7: ["venus", "mars"],
  8: ["mercury", "moon"], 9: ["saturn", "jupiter"], 10: ["mercury"], 11: ["venus"], 12: ["venus", "mercury", "moon"],
  13: ["saturn", "moon", "jupiter"], 14: ["mercury"], 15: ["saturn", "sun"], 16: ["saturn"], 17: ["saturn", "jupiter"],
  18: ["saturn", "jupiter"], 19: ["mars"], 20: ["mars"], 21: ["jupiter", "mars"], 22: ["sun", "moon"],
};
// Mansions whose commentary names only works against others — no "best hour" is offered for them.
export const MANSION_HOURS_WITHHELD = [9, 14, 22];

// ── Manazil: purpose from the book's table "جدول الأعمال للمنازل" (beneficial entries) ──
export const MANSION_PURPOSE = {
  2: { ar: "للمحبة", ml: "സ്നേഹത്തിന്", en: "for love" },
  3: { ar: "للألفة", ml: "ഇണക്കത്തിന്", en: "for harmony" },
  4: { ar: "للوصول", ml: "ലക്ഷ്യത്തിലെത്താൻ", en: "for reaching (a goal)" },
  6: { ar: "للاجتماع", ml: "ഒത്തുചേരലിന്", en: "for gathering together" },
  7: { ar: "للنصر", ml: "വിജയത്തിന്", en: "for victory" },
  11: { ar: "للقبول", ml: "സ്വീകാര്യതയ്ക്ക്", en: "for acceptance" },
  15: { ar: "للأمن", ml: "സുരക്ഷയ്ക്ക്", en: "for safety" },
  17: { ar: "لإزالة الحمى", ml: "പനി മാറാൻ", en: "for removing fever" },
  18: { ar: "للنصر", ml: "വിജയത്തിന്", en: "for victory" },
  19: { ar: "لخلاص المسجون", ml: "തടവുകാരന്റെ മോചനത്തിന്", en: "for freeing a prisoner" },
  20: { ar: "للفتح", ml: "തുറവിക്ക് (ഫത്ഹ്)", en: "for opening (fath)" },
  23: { ar: "للشفاء", ml: "ശിഫയ്ക്ക് (രോഗശമനം)", en: "for healing" },
  24: { ar: "لحفظ النفس", ml: "സ്വയം സംരക്ഷണത്തിന്", en: "for self-protection" },
  26: { ar: "للعمل", ml: "പ്രവൃത്തിക്ക്", en: "for work" },
  28: { ar: "لقضاء الحاجات", ml: "ആവശ്യങ്ങൾ നിറവേറാൻ", en: "for fulfilling needs" },
};

// ═══════════════════════════════════════════════════════════════
// What each lunar mansion is worked for — Kashf al-Haqa'iq,
// printed pp.54–55, "معرفة منازل القمر وأعمالها", from Shaykh
// Nasir bin Jaa'id al-Kharusi.
//
// The book's own words for all twenty-eight, set down whole. Some
// of what it records is destructive — هلاك العدو, الشر والعداوة,
// الفرقة, التهييج — and those entries are kept and marked `harm`
// rather than quietly dropped, because a reference that prints only
// the pleasant half of a page is not a reference.
//
// Marking them lets the interface show them for what they are. It
// does not make them into a plan: nothing here schedules a working
// against anyone.
// ═══════════════════════════════════════════════════════════════

export const MANSION_WORK = {
  1:  { nature: "نحسة",              face: null,      ar: "يعمل فيها للفرقة",                 ml: "ഫുർഖത്തിന് (വേർപിരിയലിന്) പ്രവർത്തിക്കുന്നു",        en: "worked for separation", harm: true },
  2:  { nature: "نحس",               face: null,      ar: "للعطف والجمع",                     ml: "ഇണക്കത്തിനും ഒരുമിപ്പിക്കലിനും",                      en: "for affection and joining" },
  3:  { nature: "سعد",               face: "الزهرة",  ar: "للمحبة وجمع الاثنين",              ml: "സ്നേഹത്തിനും രണ്ടുപേരെ ഒരുമിപ്പിക്കാനും",             en: "for love, and joining two" },
  4:  { nature: "نحس أحمر",          face: "عطارد",   ar: "لهلاك العدو",                      ml: "⚠ ശത്രുവിന്റെ നാശത്തിന്",                              en: "⚠ for the ruin of an enemy", harm: true },
  5:  { nature: "نحس",               face: "القمر",   ar: "للشر والعداوة",                    ml: "⚠ ദ്രോഹത്തിനും ശത്രുതയ്ക്കും",                        en: "⚠ for harm and enmity", harm: true },
  6:  { nature: "نحس مختلط",         face: null,      ar: "للصلاح وكل ما تريد",               ml: "നന്മയ്ക്കും നീ ഉദ്ദേശിക്കുന്നതിനെല്ലാം",               en: "for good, and whatever you wish" },
  7:  { nature: "سعد",               face: "زحل",     ar: "اعمل فيه ما تريد من الصلاح",       ml: "നന്മയിൽ നീ ഉദ്ദേശിക്കുന്നത് ചെയ്യുക",                  en: "work in it whatever good you wish" },
  8:  { nature: "سعد مختلط أبيض وأحمر", face: null,   ar: "اعمل فيه للخير والتجارة",          ml: "നന്മയ്ക്കും കച്ചവടത്തിനും",                            en: "for good and for trade" },
  9:  { nature: "نحس",               face: "المريخ",  ar: "اعمل فيه للطيور والدواب",          ml: "പക്ഷികൾക്കും മൃഗങ്ങൾക്കും",                            en: "for birds and beasts" },
  10: { nature: "سعد أبيض",          face: "الشمس",   ar: "للسباع والوحوش",                   ml: "ഹിംസ്രജന്തുക്കൾക്കും കാട്ടുമൃഗങ്ങൾക്കും",             en: "for predators and wild beasts",
        note_ar: "ذكرها في السر العلي بأنها نحس", note_ml: "അസ്സിർറുൽ ആലിയിൽ ഇത് നഹ്സ് എന്ന് പറയുന്നു", note_en: "al-Sirr al-'Ali calls this one nahs" },
  11: { nature: "سعد",               face: "الزهرة",  ar: "المحبة للنساء",                    ml: "സ്ത്രീകളുടെ സ്നേഹത്തിന്",                              en: "for the love of women" },
  12: { nature: "نحس",               face: "عطارد",   ar: "للمحبة وكل ما تريد",               ml: "സ്നേഹത്തിനും നീ ഉദ്ദേശിക്കുന്നതിനെല്ലാം",              en: "for love, and whatever you wish" },
  13: { nature: "نحس",               face: "القمر",   ar: "للخير كله",                        ml: "എല്ലാ നന്മയ്ക്കും",                                     en: "for all good" },
  14: { nature: "سعد صالح",          face: "زحل",     ar: "للعطف والمحبة وتأليف ما أردت",     ml: "ഇണക്കത്തിനും സ്നേഹത്തിനും, നീ ഉദ്ദേശിച്ചത് കൂട്ടിയിണക്കാനും", en: "for affection, love, and joining what you wish" },
  15: { nature: "سعد أبيض",          face: "المشتري", ar: "للخير كله",                        ml: "എല്ലാ നന്മയ്ക്കും",                                     en: "for all good" },
  16: { nature: "نحس",               face: "المريخ",  ar: "للفرقة",                           ml: "⚠ വേർപിരിയലിന്",                                       en: "⚠ for separation", harm: true },
  17: { nature: "نحس",               face: "الشمس",   ar: "للخير وعقد الألسنة",               ml: "നന്മയ്ക്കും നാവ് കെട്ടാനും",                            en: "for good, and for binding tongues" },
  18: { nature: "سعد",               face: null,      ar: "سعد",                              ml: "സഅ്ദ്",                                                  en: "sa'd — fortunate" },
  19: { nature: "نحس",               face: "عطارد",   ar: "للتهييج والمحبة",                  ml: "⚠ ഇളക്കിവിടാനും സ്നേഹത്തിനും",                        en: "⚠ for stirring up, and for love", harm: true },
  20: { nature: "سعد",               face: null,      ar: "للخير",                            ml: "നന്മയ്ക്ക്",                                            en: "for good" },
  21: { nature: "سعد",               face: "زحل",     ar: "للطلسمات",                         ml: "ത്വിൽസമുകൾക്ക്",                                        en: "for talismans" },
  22: { nature: "نحس",               face: "المشتري", ar: "الطلسمات للمريض والعقد",           ml: "രോഗിക്കുള്ള ത്വിൽസമിനും കെട്ടിനും",                    en: "talismans for the sick, and binding" },
  23: { nature: "سعد",               face: "المريخ",  ar: "الطلسمات للخير كله",               ml: "എല്ലാ നന്മയ്ക്കുമുള്ള ത്വിൽസമുകൾ",                     en: "talismans for all good" },
  24: { nature: "سعد",               face: "الشمس",   ar: "للخير",                            ml: "നന്മയ്ക്ക്",                                            en: "for good" },
  25: { nature: "سعد",               face: "الزهرة",  ar: "للخير",                            ml: "നന്മയ്ക്ക്",                                            en: "for good" },
  26: { nature: "سعد أبيض",          face: "عطارد",   ar: "للمحبات والتأليف والتهييج",        ml: "സ്നേഹങ്ങൾക്കും കൂട്ടിയിണക്കലിനും ⚠ ഇളക്കിവിടലിനും",  en: "for loves, joining, and ⚠ stirring up" },
  27: { nature: "سعد",               face: null,      ar: "سعد",                              ml: "സഅ്ദ്",                                                  en: "sa'd — fortunate" },
  28: { nature: "سعد",               face: "المشتري", ar: "للخير والسفر والتجارة",            ml: "നന്മയ്ക്കും യാത്രയ്ക്കും കച്ചവടത്തിനും",               en: "for good, travel and trade" },
};

export const MANSION_WORK_SOURCE = {
  ar: "معرفة منازل القمر وأعمالها — للشيخ ناصر بن جاعد الخروصي",
  ml: "ചന്ദ്രന്റെ മൻസിലുകളും അവയുടെ പ്രവൃത്തികളും — ശൈഖ് നാസ്വിർ ബിൻ ജാഇദ് അൽ-ഖറൂസ്വി",
  en: "The Moon's mansions and their works — Shaykh Nasir bin Jaa'id al-Kharusi",
  page: "54–55",
};

// ═══════════════════════════════════════════════════════════════
// "سعود الكواكب من الأيام السبعة" — Kashf, printed p.56, found in
// the hand of Shaykh Zahir bin Muhammad bin Sa'id al-Isma'ili.
//
// Two tables the page had been missing. Kashf p.253 says the work
// is begun by looking to the hour, THE ASCENDANT and the khadim —
// so the ascendant belongs on the day card beside the rest.
// Index 0 = Sunday.
// ═══════════════════════════════════════════════════════════════

/** The planet whose fortune (سعد) falls on each day. */
export const DAY_SAAD = ["saturn", "venus", "mars", "jupiter", "moon", "sun", "mercury"];

/** The day's ascendant (طالع). */
export const DAY_TALI = ["moon", "venus", "jupiter", "saturn", "mars", "mercury", "sun"];

export const DAY_SAAD_SOURCE = {
  ar: "سعود الكواكب من الأيام السبعة — بخط الشيخ زاهر بن محمد بن سعيد الإسماعيلي",
  ml: "ഏഴ് ദിവസങ്ങളിലെ ഗ്രഹങ്ങളുടെ സഅ്ദ് — ശൈഖ് സാഹിർ ബിൻ മുഹമ്മദ് ബിൻ സഈദ് അൽ-ഇസ്മാഈലിയുടെ കൈപ്പടയിൽ",
  en: "The planets' fortune across the seven days — in the hand of Shaykh Zahir bin Muhammad bin Sa'id al-Isma'ili",
  page: "56",
};

// ═══════════════════════════════════════════════════════════════
// What the book dislikes — Kashf, printed pp.65–66.
//
// Three rules the page had been missing. They are not about the
// planetary hour at all, which is why they slipped past: they fall
// on the lunar date and on the Moon's SIGN (burj, not manzil).
// ═══════════════════════════════════════════════════════════════

/** العقد — the contract, the binding. The book dislikes it: */
export const MAKRUH_AQD = {
  // "the last three days of every month … they are the dark of the Moon"
  lastThreeDays: {
    ar: "الأيام الثلاث الأخيرة من كل شهر يكره العقد فيها ولا ينبغي العقد فيها لكونها محاق",
    ml: "ഓരോ മാസത്തിന്റെയും അവസാനത്തെ മൂന്ന് ദിവസം അഖ്ദ് കറാഹത്താണ് — അത് മിഹാഖ് (ചന്ദ്രന്റെ ഇരുട്ട്) ആയതിനാൽ",
    en: "In the last three days of any month the contract is disliked — they are the dark of the Moon",
    page: "65",
  },
  // "when the Moon is in the sign of Scorpio — the sign is meant here, not the mansion"
  moonInScorpio: {
    sign: 7,
    ar: "يكره العقد عندما يكون القمر في برج العقرب ولا يقصد هنا المنازل بل البرج نفسه",
    ml: "ചന്ദ്രൻ വൃശ്ചികം രാശിയിലായിരിക്കുമ്പോൾ അഖ്ദ് കറാഹത്ത് — ഇവിടെ ഉദ്ദേശിക്കുന്നത് മൻസിലല്ല, രാശി തന്നെ",
    en: "The contract is disliked while the Moon is in Scorpio — the sign is meant, not the mansion",
    page: "65",
  },
  // Wednesday: the night is allowed, the daytime disliked
  wednesdayDaytime: {
    wd: 3,
    ar: "ليلة الأربعاء فقط أي مساء الثلاثاء لا نهار الأربعاء لكراهة العقد نهار الأربعاء",
    ml: "ബുധൻ രാത്രി മാത്രം — അതായത് ചൊവ്വ വൈകുന്നേരം, ബുധൻ പകലല്ല; ബുധൻ പകലിൽ അഖ്ദ് കറാഹത്ത്",
    en: "Wednesday night only — Tuesday evening — not Wednesday daytime, where the contract is disliked",
    page: "64–65",
  },
};

/**
 * Planting — Shaykh Muhammad bin Abdullah al-Ma'wali's lines, p.66.
 * Palms are not planted on the 9th, 19th or 29th; cutting on those
 * days is good.
 */
export const PLANTING_AVOID_DATES = {
  dates: [9, 19, 29],
  ar: "تجنب غرس النخل في يوم تاسع وتاسع عشر والتاسع والعشرين … ولكن يقال القطع فيهن جيد",
  ml: "ഒമ്പത്, പത്തൊമ്പത്, ഇരുപത്തൊമ്പത് — ഈ ദിവസങ്ങളിൽ ഈന്തപ്പന നടരുത്. വെട്ടുന്നത് നല്ലതാണെന്ന് പറയുന്നു",
  en: "Do not plant palms on the 9th, 19th or 29th — though cutting on them is said to be good",
  page: "66",
};

// ═══════════════════════════════════════════════════════════════
// Hâvâss'ın Derinlikleri I, "ZAMANLAMADA DİĞER ETKENLER", pp.160–161.
//
// The second book sets out the ORDER in which the time is settled,
// and two conditions it calls unchangeable. Neither was in the app:
// the Astro Clock weighed day, hour and Moon together, where the
// book ranks them, and puts two gates before all of it.
// ═══════════════════════════════════════════════════════════════

/** The two the book calls "değişmez ve şart" — unchangeable and required. */
export const HAVASS_GATES = {
  // positive work while the Moon waxes, negative while it wanes
  moonPhase: {
    tr: "Olumlu çalışmalar Ay büyürken, olumsuz çalışmalar Ay küçülürken yapılmalıdır",
    ml: "നല്ല കർമ്മങ്ങൾ ചന്ദ്രൻ വളരുമ്പോൾ, മോശം കർമ്മങ്ങൾ ചന്ദ്രൻ ക്ഷയിക്കുമ്പോൾ",
    en: "Constructive work while the Moon waxes; destructive work while it wanes",
    page: "160",
  },
  // Sun and Moon in one sign — no wafq is made at all
  conjunction: {
    tr: "Güneş ve Ay aynı burçtayken, yani Birleşim halinde, genel kural olarak hiçbir konu hakkında vefk yapılmaz",
    ml: "സൂര്യനും ചന്ദ്രനും ഒരേ രാശിയിലായിരിക്കുമ്പോൾ — ഇജ്തിമാഅ് — പൊതുനിയമമായി ഒരു കാര്യത്തിനും വഫ്ഖ് ഉണ്ടാക്കില്ല",
    en: "While Sun and Moon stand in one sign — in conjunction — as a general rule no wafq is made for anything",
    page: "160",
    note_ml: "⚠ ഈ നിയമത്തിന് വിരുദ്ധമായി, ഇജ്തിമാഇലും പ്രത്യേകിച്ച് കറുത്ത വാവിലും ചെയ്യുന്ന ചില പ്രത്യേക കർമ്മങ്ങളുണ്ടെന്ന് കിതാബ് പറയുന്നു — അവയെ \"വളരെ ശർറായവ\" എന്നാണ് വിശേഷിപ്പിക്കുന്നത്.",
    note_en: "⚠ The book notes that certain workings are nonetheless done at conjunction, and especially at the dark Moon; it calls them workings held to be very evil.",
  },
};

/**
 * The order the book settles the time in — p.161. It is a ranking,
 * not a weighting: the first two are gates, the rest are worked
 * down in turn.
 */
export const HAVASS_TIMING_ORDER = [
  { n: 1, tr: "Güneş ve Ay'ın açısı",        ml: "സൂര്യ–ചന്ദ്ര കോൺ — ഏത് തരം വഫ്ഖ് എന്ന് ഇത് നിശ്ചയിക്കുന്നു", en: "The Sun–Moon angle, which settles what kind of wafq" },
  { n: 2, tr: "Ay'ın büyüme / küçülme",      ml: "ചന്ദ്രൻ വളരുന്നോ ക്ഷയിക്കുന്നോ — കർമ്മം മൃദുവോ കഠിനമോ എന്നതനുസരിച്ച്", en: "Waxing or waning, by whether the work is soft or hard" },
  { n: 3, tr: "Ay'ın menzili",               ml: "ആ ഘട്ടത്തിൽ ചന്ദ്രൻ ഏത് മൻസിലിൽ — കർമ്മത്തിന്റെ സ്വഭാവത്തിന് ചേരുന്നത്", en: "Which mansion the Moon is in, fitting the work's character" },
  { n: 4, tr: "Vefkin yıldızının günü",      ml: "വഫ്ഖിന്റെ ഗ്രഹത്തിന്റെ ദിവസം — ആ പകലോ രാത്രിയോ", en: "The day of the wafq's own planet — that day or its night" },
  { n: 5, tr: "Vefkin yıldızının saati",     ml: "ഒടുവിൽ ആ ദിവസത്തെ സാഅത്തുകളിൽ ആ ഗ്രഹത്തിന്റേത്", en: "Last, that planet's hour within the day" },
];

export const HAVASS_TIMING_NOTE = {
  tr: "Bazı durumlarda en uygun zamanın gelmesi iki veya üç ay sürebilir; bu yüzden gereken yıldızın günü ihmal edilebilir, ya da Ay menazilleri fazla dikkate alınmayabilir — fakat en ideali her şeyin yerine oturmasıdır.",
  ml: "ചിലപ്പോൾ എല്ലാം ഒത്തുവരാൻ രണ്ടോ മൂന്നോ മാസമെടുക്കാം. അതുകൊണ്ട് ഗ്രഹത്തിന്റെ ദിവസം വിട്ടുകളയാം, അല്ലെങ്കിൽ മൻസിലിന് അധികം ഭാരം കൊടുക്കാതിരിക്കാം — പക്ഷേ എല്ലാം ഒത്തുവരുന്നതാണ് ഏറ്റവും ഉത്തമം.",
  en: "The right moment can be two or three months away, so the planet's day may be let go, or the mansions not weighed too heavily — but the ideal is that everything falls into place.",
  page: "161",
};

/** Incense by planet — Hâvâss I p.201, "YILDIZLARIN TÜTSÜLERİ". */
export const HAVASS_INCENSE = {
  sun:     { tr: "Günlük veya Sendrus",        ml: "കുന്തിരിക്കം അല്ലെങ്കിൽ സന്ദറൂസ്" },
  moon:    { tr: "Günlük veya Ağaç sakızı",    ml: "കുന്തിരിക്കം അല്ലെങ്കിൽ മരക്കറ" },
  mercury: { tr: "Mahleb kabuğu",              ml: "മഹ്‌ലബിന്റെ തൊലി" },
  venus:   { tr: "Masteki (Hindistan sakızı)", ml: "മസ്തകി" },
  mars:    { tr: "Kıst (Toplak otu)",          ml: "ഖുസ്ത്" },
  jupiter: { tr: "Ödağacı ve Kafur",           ml: "ഊദും കർപ്പൂരവും" },
  saturn:  { tr: "Yere dökülmüş ıslak nesne",  ml: "നിലത്ത് വീണ നനഞ്ഞ വസ്തു" },
};

export const HAVASS_INCENSE_NOTE = {
  tr: "Genel amaçlı olarak sadece Buhurotu veya Günlük yakılabilir.",
  ml: "പൊതുവായ ആവശ്യത്തിന് ബുഖൂറോ കുന്തിരിക്കമോ മാത്രം പുകയ്ക്കാം.",
  en: "For a general purpose, plain buhur or frankincense alone may be burned.",
  page: "201",
};

// ═══════════════════════════════════════════════════════════════
// The day and the hour taken together — Hâvâss I, pp. 40-42,
// "SAATLERİN KULLANILIŞ MANTIĞI".
//
// The book's point is that a planet's hour comes round 24 times in a
// week, and they are not interchangeable. The hour's planet sets what
// kind of work it is; the planet of the day it falls in colours that
// work. So the reader is told to combine the two deliberately rather
// than wait for the one obvious hour.
//
// It then works this through for Venus hours only, and for the other
// six planets it teaches the method and leaves the combining to the
// reader. So only the Venus examples are recorded here. Nothing is
// filled in for the rest: a table of forty-nine cells would be ours,
// not the book's.
// ═══════════════════════════════════════════════════════════════

export const HAVASS_DAY_HOUR_RULE = {
  tr: "Yıldızların etkilerini birbirlerine kombine ederek yapmalısınız. Yapmak istediğiniz işe uyan yıldızı bulduktan sonra onu hangi yıldızın günü veya gecesi ile birleştireceğinize karar vermek oldukça kolaydır.",
  ml: "ഗ്രഹങ്ങളുടെ സ്വാധീനങ്ങൾ പരസ്പരം കൂട്ടിച്ചേർത്താണ് ചെയ്യേണ്ടത്. ചെയ്യാനുദ്ദേശിക്കുന്ന കാര്യത്തിന് ചേരുന്ന ഗ്രഹം ഏതെന്ന് കണ്ടെത്തിയ ശേഷം, അതിനെ ഏത് ഗ്രഹത്തിന്റെ പകലുമായോ രാത്രിയുമായോ ചേർക്കണമെന്ന് തീരുമാനിക്കുക എളുപ്പമാണ്.",
  en: "You should work by combining the planets' influences with one another. Once you have found the planet that suits the work you mean to do, deciding which planet's day or night to join it with is quite easy.",
  page: "42",
};

export const HAVASS_DAY_HOUR_BASE = {
  ml: "ഏത് ഗ്രഹത്തിന്റെയും കർമ്മത്തിന് ഏറ്റവും അനുയോജ്യമായ സമയം ആ ഗ്രഹത്തിന്റെ ദിവസത്തിലെ ഒന്നാം സാഅത്താണ് — സുഹ്റയ്ക്ക് വെള്ളിയാഴ്ചയിലെ ഒന്നാം സാഅത്ത്. കൂട്ടുകൾ അതിനു പുറമെ, കർമ്മത്തിന് പ്രത്യേകമായ ഒരു നിറം ചേർക്കാനാണ്.",
  en: "The plainest best time for any planet's work is the first hour of that planet's own day — for Venus, the first hour of Friday. The combinations below are for adding something particular on top of that.",
  page: "41",
};

/**
 * The book's worked examples, all of them Venus hours. `day` is the
 * planet whose day (or night) the Venus hour falls inside.
 * `harm: true` marks what the book itself describes as breaking a
 * person or a bond; it is kept because the book says it, and it is
 * marked because of what it is.
 */
export const HAVASS_DAY_HOUR_VENUS = [
  {
    day: "venus", page: "41",
    tr: "Cuma gününün ilk saati",
    ml: "വെള്ളിയാഴ്ചയിലെ ഒന്നാം സാഅത്ത് — ഏത് സുഹ്റ കർമ്മത്തിനും അടിസ്ഥാന ഉത്തമം",
    en: "The first hour of Friday — the plain best for any Venus work",
  },
  {
    day: "mars", page: "41",
    tr: "Salı günü veya Mars gecesi içindeki Venüs saatleri — Venüs ve Mars etkilerinin karışımı",
    ml: "ചൊവ്വാഴ്ചയിലോ മിർരീഖിന്റെ രാത്രിയിലോ ഉള്ള സുഹ്റ സാഅത്ത് — സുഹ്റയുടെയും മിർരീഖിന്റെയും സ്വാധീനങ്ങൾ കലർന്ന പ്രഭാവം; വികാരത്തെക്കാൾ ശാരീരികമായ വശം പ്രകടിപ്പിക്കുന്ന ഗ്രഹം മിർരീഖാണ്",
    en: "Venus hours inside Tuesday or a Mars night — a mixture of the Venus and Mars influences; Mars is the planet that expresses the physical side rather than the feeling",
  },
  {
    day: "mars", page: "42",
    tr: "Bir düşman veya rakibinizle ya da dargın, kavgalı olduğunuz birisi ile barışmak",
    ml: "ഒരു ശത്രുവുമായോ എതിരാളിയുമായോ, അല്ലെങ്കിൽ പിണങ്ങിയോ വഴക്കിട്ടോ നിൽക്കുന്ന ഒരാളുമായോ ഇണങ്ങാൻ — ചൊവ്വാഴ്ചയിലെ സുഹ്റ സാഅത്ത്",
    en: "To make peace with an enemy or rival, or with someone you have quarrelled or fallen out with — Venus hours inside Tuesday",
  },
  {
    day: "sun", page: "42",
    tr: "Önemli bir kimsenin teveccühünü, desteğini, dostluğunu kazanmak",
    ml: "പ്രധാനപ്പെട്ട ഒരാളുടെ പ്രീതിയും പിന്തുണയും സൗഹൃദവും നേടാൻ — ഞായറാഴ്ച, അതായത് ശംസിന്റെ ദിവസത്തിലെ സുഹ്റ സാഅത്ത്",
    en: "To win the favour, support and friendship of an important person — Venus hours inside Sunday, the Sun's day",
  },
  {
    day: "jupiter", page: "42",
    tr: "Mahkeme, hâkimin desteği ve teveccühü, devlet dairelerinde halledilmesi gereken iş",
    ml: "കോടതിക്കാര്യം, ജഡ്ജിയുടെ പിന്തുണയും പ്രീതിയും, സർക്കാർ ഓഫീസുകളിൽ തീർക്കേണ്ട കാര്യം — മുശ്തരിയുടെ പകലിലോ രാത്രിയിലോ ഉള്ള സുഹ്റ സാഅത്ത്",
    en: "A court case, the judge's support and favour, business to be settled in government offices — Venus hours inside Jupiter's day or night",
  },
  {
    day: "saturn", page: "42", harm: true,
    tr: "Bir kadının ahlaksızlaştırılması, her türlü ahlak ve namus anlayışının kırılması, onun kötü yola düşürülmesi",
    ml: "⚠ ഒരു സ്ത്രീയെ വഴിതെറ്റിക്കൽ, അവളുടെ സദാചാരബോധം തകർക്കൽ — സുഹലിന്റെ പകലിലോ രാത്രിയിലോ ഉള്ള സുഹ്റ സാഅത്ത് എന്ന് കിതാബ് പറയുന്നു",
    en: "⚠ The book names this one too: corrupting a woman, breaking every sense of morals and honour in her, leading her astray — Venus hours inside Saturn's day or night",
  },
  {
    day: "saturn", page: "42", harm: true,
    tr: "İki sevgilinin veya karı kocanın ya da iki arkadaşın, ortağın aralarını bozmak",
    ml: "⚠ രണ്ട് കാമുകരുടെയോ ഭാര്യാഭർത്താക്കന്മാരുടെയോ രണ്ട് കൂട്ടുകാരുടെയോ പങ്കാളികളുടെയോ ഇടയിൽ പിരിവുണ്ടാക്കാൻ — അതേ സുഹലിന്റെ പകലിലെയും രാത്രിയിലെയും സുഹ്റ സാഅത്ത്",
    en: "⚠ Breaking apart two lovers, a husband and wife, or two friends or partners — the same Venus hours inside Saturn's day and night",
  },
];

// ═══════════════════════════════════════════════════════════════
// Where each planet is strong and where it is harmed —
// Kashf al-Haqa'iq p. 244,
// "جدول الكواكب بيوتها، شرفها، وبالها، أفراحها، إجرامها، طبيعتها".
//
// This is the book's own account of a planet's friendly and hostile
// ground: بيت (its house) and شرف (its exaltation) are where it is
// at full strength; وبال (detriment) and هبوط (fall) are where it is
// undone. The book uses it directly when choosing an hour — at
// p. 79 it requires of a marriage hour that neither the hour's lord
// nor the Moon carry "نحوس الشهر والاحتراق والهبوط والوبال".
//
// Signs are given as indices into SIGNS_AR (0 = الحمل).
// ═══════════════════════════════════════════════════════════════

export const PLANET_DIGNITY = {
  sun: {
    bayt: [4], sharaf: { sign: 0, deg: 19 }, hubut: { sign: 6, deg: 19 }, wabal: [10],
    farah: 9, jurm: 15, tabia_ar: "سعيد",
    note_ar: "خاصة عند وجود الشمس في زوايا من برج التثليث أو التسديس",
    note_ml: "വിശേഷിച്ച് ശംസ് തസ്‌ലീസിന്റെയോ തസ്ദീസിന്റെയോ കോണുകളിൽ നിൽക്കുമ്പോൾ",
    note_en: "especially when the Sun stands in the angles of a trine or sextile",
  },
  moon: {
    bayt: [3], sharaf: { sign: 1, deg: 3 }, hubut: { sign: 7, deg: 3 }, wabal: [9],
    farah: 3, jurm: 12, tabia_ar: "سعيد",
  },
  mars: {
    bayt: [0, 7], sharaf: { sign: 9, deg: 28 }, hubut: { sign: 3, deg: 28 }, wabal: [6, 1],
    farah: 6, jurm: 8, tabia_ar: "نحس أصغر",
  },
  mercury: {
    bayt: [2, 5], sharaf: { sign: 5, deg: 15 }, hubut: { sign: 11, deg: 15 }, wabal: [11],
    farah: 1, jurm: 7, tabia_ar: "معتدل",
    note_ar: "سعيد إذا قارن سعداً والعكس صحيح",
    note_ml: "സഅ്ദിനോട് ചേർന്നാൽ സഅ്ദ്, നഹ്സിനോട് ചേർന്നാൽ നഹ്സ്",
    note_en: "benefic when joined to a benefic, and the reverse",
  },
  jupiter: {
    bayt: [8, 11], sharaf: { sign: 3, deg: 15 }, hubut: { sign: 9, deg: 15 }, wabal: [2, 5],
    farah: 11, jurm: 9, tabia_ar: "سعيد (سعد أكبر)",
  },
  venus: {
    bayt: [1, 6], sharaf: { sign: 11, deg: 27 }, hubut: { sign: 5, deg: 27 }, wabal: [0, 7],
    farah: 5, jurm: 7, tabia_ar: "سعيد (سعد أصغر)",
  },
  saturn: {
    bayt: [9, 10], sharaf: { sign: 6, deg: 21 }, hubut: { sign: 0, deg: 21 }, wabal: [3, 4],
    farah: 12, jurm: 9, tabia_ar: "نحس أكبر",
  },
};

export const DIGNITY_LABEL = {
  bayt:   { ar: "بيته",    ml: "അതിന്റെ ഭവനം — പൂർണ്ണ ശക്തി",       en: "its house — full strength" },
  sharaf: { ar: "شرفه",    ml: "ശറഫ് — ഉയർച്ച",                     en: "exaltation" },
  hubut:  { ar: "هبوطه",   ml: "ഹുബൂത്വ് — വീഴ്ച",                   en: "fall" },
  wabal:  { ar: "وباله",   ml: "വബാൽ — കേട്",                       en: "detriment" },
  farah:  { ar: "فرحه",    ml: "ഫറഹ് — സന്തോഷിക്കുന്ന ഭവനം",         en: "its joy (house)" },
  jurm:   { ar: "جرمه",    ml: "ജിർമ് — ഡിഗ്രി",                     en: "body, in degrees" },
};

export const PLANET_DIGNITY_SOURCE = {
  page: "243-244",
  ar: "جدول الكواكب بيوتها، شرفها، وبالها، أفراحها، إجرامها، طبيعتها",
  ml: "ഗ്രഹങ്ങളുടെ ഭവനം, ശറഫ്, വബാൽ, ഫറഹ്, ജിർമ്, സ്വഭാവം എന്നിവയുടെ പട്ടിക",
  en: "Table of the planets: their houses, exaltation, detriment, joys, bodies and nature",
};

/** p.79 — the book applying the table when it chooses an hour. */
export const DIGNITY_IN_USE = {
  ar: "والساعة واليوم مسعودان لا مدخل فيهما من نحوس الشهر والاحتراق والهبوط والوبال",
  ml: "സാഅത്തും ദിവസവും സഅ്ദായിരിക്കണം — മാസത്തിന്റെ നഹ്സോ ഇഹ്തിറാഖോ ഹുബൂത്വോ വബാലോ അതിൽ കടക്കരുത്. അതായത് ഒരു ഗ്രഹം അതിന്റെ ഹുബൂത്വിലോ വബാലിലോ നിൽക്കുന്ന സമയം ആ കർമ്മത്തിന് ഒഴിവാക്കണം എന്ന് കിതാബ് തന്നെ പ്രയോഗിക്കുന്നു.",
  en: "The hour and the day must both be fortunate, with nothing of the month's nahs, combustion, fall or detriment entering them — the book applying this table to the choice of an hour.",
  page: "79",
};

export const HAVASS_DAY_HOUR_GAP = {
  ml: "ബാക്കി ആറ് ഗ്രഹങ്ങൾക്ക് കിതാബ് ഇങ്ങനെ പട്ടിക തരുന്നില്ല. രീതി പഠിപ്പിച്ചിട്ട് കൂട്ടിച്ചേർക്കൽ വായനക്കാരന് വിടുകയാണ് ചെയ്യുന്നത്. അതുകൊണ്ട് ഇവിടെ അവ നിറച്ചിട്ടില്ല — നിറച്ചാൽ അത് കിതാബിന്റേതാവില്ല. ഓരോ ഗ്രഹത്തിന്റെയും സ്വഭാവവും കർമ്മങ്ങളും മുകളിലെ കവാകിബ് പട്ടികയിൽ ഉണ്ട്; അതുവെച്ച് മുകളിലെ നിയമം സ്വയം പ്രയോഗിക്കാം.",
  en: "The book gives no such table for the other six planets. It teaches the method and leaves the combining to the reader, so nothing is filled in for them here — filling it in would make it ours, not the book's. Each planet's nature and works are in the Kawakib table above; apply the rule above with those.",
  page: "40-42",
};
