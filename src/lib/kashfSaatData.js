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
  14: { nature: "good",  good: ["learning", "trade", "needs", "travel"], avoid: [], note_ml: "" },
  15: { nature: "good",  good: ["needs"], avoid: [], note_ml: "ചിലർ: കടമൊഴികെ ശ്രദ്ധിക്കുക" },
  16: { nature: "bad",   good: ["trade", "building"], avoid: ["travel", "officials"], note_ml: "യാത്ര വളരെ അപകടം" },
  17: { nature: "good",  good: ["marriage", "trade", "farming", "building", "officials"], avoid: [], note_ml: "" },
  18: { nature: "good",  good: ["travel", "needs", "trade", "farming"], avoid: [], note_ml: "എതിരാളിയെ ജയിക്കും" },
  19: { nature: "good",  good: ["learning", "travel", "needs", "trade"], avoid: [], note_ml: "ഇസ്ഹാഖ്(അ) ജനിച്ച ദിവസം" },
  20: { nature: "good",  good: ["travel", "building", "marriage", "farming", "officials", "needs"], avoid: [], note_ml: "" },
  21: { nature: "bad",   good: [], avoid: ALL, note_ml: "നഹ്സ് മുസ്തമിർ" },
  22: { nature: "good",  good: ["trade", "officials", "travel", "needs"], avoid: [], note_ml: "സ്വദഖ സ്വീകാര്യം" },
  23: { nature: "good",  good: ["marriage", "trade", "officials", "travel"], avoid: [], note_ml: "യൂസുഫ്(അ) ജനിച്ച ദിവസം" },
  24: { nature: "bad",   good: [], avoid: ALL, note_ml: "ഫിർഔൻ ജനിച്ച ദിവസം" },
  25: { nature: "bad",   good: [], avoid: ALL, note_ml: "സ്വയം സൂക്ഷിക്കുക" },
  26: { nature: "mixed", good: ["needs"], avoid: ["marriage", "travel"], note_ml: "സ്വദഖ ചെയ്യുക; മൂസ(അ) കടൽ പിളർന്ന ദിവസം" },
  27: { nature: "good",  good: ["needs", "officials", "trade"], avoid: [], note_ml: "" },
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
  13: "Nahs mustamirr — no disputes, no haircut", 14: "", 15: "Some say: be careful except for debts",
  16: "Travel is very dangerous", 17: "", 18: "You will overcome an opponent",
  19: "Ishaq (AS) was born", 20: "", 21: "Nahs mustamirr",
  22: "Sadaqa is accepted", 23: "Yusuf (AS) was born", 24: "Day Fir'awn was born",
  25: "Guard yourself", 26: "Give sadaqa; day Musa (AS) parted the sea", 27: "",
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
