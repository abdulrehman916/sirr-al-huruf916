// ═══════════════════════════════════════════════════════════════
// What a square is written on, what is burnt, and where it goes after.
// All from the first book (Kashf al-Haqa'iq):
//
//  - The table of the kings of the days (printed p. 254): each day's
//    planet, its metal, its colour and clothing, and its incense.
//  - The days' incense (p. 272), and the version "some scholars" give.
//  - The planets' metals and their substitutes (pp. 266-269): "if the
//    metal is not to be had, a substitute in keeping with the planet's
//    nature, colour, scent or matter".
//  - Condition 30: on metal, the weight is the side's number in grams
//    (three for a 3×3, four for a 4×4 ...); paper stands in for metal
//    when lasting is not wanted.
//  - "The incense of the work is the incense of the hour, not the day"
//    (p. 24) — the square is written in its own planet's hour on its own
//    planet's day, so the two are the same planet here.
//  - "Male frankincense stands in for all incense" (pp. 270-271); good
//    works take sweet scents, harmful ones foul (p. 271).
//  - Condition 11: where the finished work is put, by its ruling nature.
//  - p. 24 (11): a copy on paper is carried by the seeker — carrying is
//    for works of good only. p. 307: surround it, write it at a fitting
//    time, perfume it with incense, and carry it after.
//
// Photos: Wikimedia Commons files, shown by name (img); imgKind says
// whether it is the thing itself or its plant/tree/drawing.
//
// Malayalam names are given where the thing has one in common use; where
// it has none, the name it is sold under is given and that is said.
// ═══════════════════════════════════════════════════════════════

/** Each incense / material: Arabic as printed, Malayalam, English. */
export const SUBSTANCE = {
  "السندروس": { img: "Sandarac_tears.jpg", imgKind: "thing", ml: "ചന്ദ്രസ് / സന്ദ്രൂസ് — ഒരു മരത്തിന്റെ മഞ്ഞ നിറത്തിലുള്ള പശത്തരികൾ (sandarac). മലയാളത്തിൽ പ്രത്യേക പേരില്ല; അങ്ങാടിക്കടകളിൽ ചന്ദ്രസ് എന്ന പേരിൽ", en: "sandarac resin" },
  "سندروس": { img: "Sandarac_tears.jpg", imgKind: "thing", ml: "ചന്ദ്രസ് / സന്ദ്രൂസ് — മഞ്ഞ പശത്തരികൾ (sandarac)", en: "sandarac resin" },
  "اللبان الذكر": { img: "Frankinsence-oman-dhofar.JPG", imgKind: "thing", ml: "കുന്തിരിക്കം (ലുബാൻ) — ആൺ ഇനം, തെളിഞ്ഞ മണികൾ", en: "frankincense (the 'male', clear tears)" },
  "اللبان": { img: "Frankinsence-oman-dhofar.JPG", imgKind: "thing", ml: "കുന്തിരിക്കം (ലുബാൻ)", en: "frankincense" },
  "لبان": { img: "Frankinsence-oman-dhofar.JPG", imgKind: "thing", ml: "കുന്തിരിക്കം (ലുബാൻ)", en: "frankincense" },
  "الكندر": { img: "Frankinsence-oman-dhofar.JPG", imgKind: "thing", ml: "കുന്തിരിക്കം (കുന്ദുർ — ലുബാന്റെ മറ്റൊരു പേര്)", en: "frankincense (kundur)" },
  "القسط": { ml: "കൊട്ടം (ഖുസ്ത്)", en: "costus root (kuth)" },
  "قسط": { ml: "കൊട്ടം (ഖുസ്ത്)", en: "costus root (kuth)" },
  "قسط اسود": { ml: "കറുത്ത കൊട്ടം (ഖുസ്ത് ഹിന്ദി)", en: "black costus" },
  "قشر المحلب": { ml: "മഹ്‌ലബ് കുരുവിന്റെ തൊലി — മലയാളത്തിൽ പ്രത്യേക പേരില്ല; അറബി കടകളിൽ \"മഹ്‌ലബ്\"", en: "mahleb / mahaleb cherry husk" },
  "قشور المحلب": { ml: "മഹ്‌ലബ് കുരുവിന്റെ തൊലി — അറബി കടകളിൽ \"മഹ്‌ലബ്\"", en: "mahleb / mahaleb cherry husks" },
  "المقل الأزرق": { img: "Commiphora-wightii-resin.jpg", imgKind: "thing", ml: "ഗുഗ്ഗുലു (മുഖ്ൽ) — നീല ഇനം", en: "blue bdellium (guggul)" },
  "العنبر": { img: "Ambergris,_Skagway_Museum.JPG", imgKind: "thing", ml: "അംബർ (ആമ്പർഗ്രിസ്)", en: "ambergris" },
  "عنبر": { img: "Ambergris,_Skagway_Museum.JPG", imgKind: "thing", ml: "അംബർ (ആമ്പർഗ്രിസ്)", en: "ambergris" },
  "العود": { img: "Agarwood.jpg", imgKind: "thing", ml: "അകിൽ (ഊദ്)", en: "agarwood (oud)" },
  "عود": { img: "Agarwood.jpg", imgKind: "thing", ml: "അകിൽ (ഊദ്)", en: "agarwood (oud)" },
  "عود ابيض": { img: "Agarwood.jpg", imgKind: "thing", ml: "വെളുത്ത അകിൽ", en: "white agarwood" },
  "الكافور": { img: "Camphor_laurel-camphor.jpg", imgKind: "thing", ml: "കർപ്പൂരം", en: "camphor" },
  "المصطكي": { img: "Mastic.jpg", imgKind: "thing", ml: "മസ്തകി (റൂമി മസ്തകി) — ഒരു മരപ്പശ", en: "mastic" },
  "المستكة": { img: "Mastic.jpg", imgKind: "thing", ml: "മസ്തകി (റൂമി മസ്തകി)", en: "mastic" },
  "الشمع الأصفر": { img: "Pure_Natural_Beeswax_Blocks.jpg", imgKind: "thing", ml: "മഞ്ഞ മെഴുക് — തേനീച്ച മെഴുക്", en: "yellow beeswax" },
  "المايعة": { img: "Liquidambar_orientalis_-_Orto_botanico_-_Rome,_Italy_-_DSC09849.jpg", imgKind: "tree", ml: "മൈഅ — ഒരു മരത്തിൽ നിന്നുള്ള കട്ടിയുള്ള ദ്രാവകപ്പശ (storax). ആയുർവേദ കടകളിൽ സിലാരസം എന്ന പേരിൽ; അറബി കടകളിൽ \"മൈഅ\"", en: "liquid storax (may'a)" },
  "المايعة السائلة": { img: "Liquidambar_orientalis_-_Orto_botanico_-_Rome,_Italy_-_DSC09849.jpg", imgKind: "tree", ml: "ദ്രാവക മൈഅ (liquid storax) — ആയുർവേദ കടകളിൽ സിലാരസം", en: "liquid storax" },
  "مايعة": { img: "Liquidambar_orientalis_-_Orto_botanico_-_Rome,_Italy_-_DSC09849.jpg", imgKind: "tree", ml: "മൈഅ (storax) — ആയുർവേദ കടകളിൽ സിലാരസം", en: "storax" },
  "اللاذن": { img: "Cistus_ladanifer.JPG", imgKind: "plant", ml: "ലാദൻ — ഒരു ചെടിയുടെ പശ (labdanum). മലയാളത്തിൽ പ്രത്യേക പേരില്ല", en: "labdanum" },
  "زعفران": { img: "Iran_saffron_threads.jpg", imgKind: "thing", ml: "കുങ്കുമപ്പൂവ്", en: "saffron" },
  "صندل أحمر": { img: "Santali_rubri_lignum_050258.jpg", imgKind: "thing", ml: "രക്തചന്ദനം", en: "red sandalwood" },
  "صندل أبيض": { img: "Santalum_album_2.jpg", imgKind: "tree", ml: "വെള്ള ചന്ദനം", en: "white sandalwood" },
  "صندل": { img: "Santalum_album_2.jpg", imgKind: "tree", ml: "ചന്ദനം", en: "sandalwood" },
  "كبابة": { img: "Cubebae1.JPG", imgKind: "thing", ml: "വാൽമുളക് (കബാബ് ചീനി)", en: "cubeb" },
  "بسباس": { img: "Mace_of_nutmeg_-_ml-Jathi.jpg", imgKind: "thing", ml: "ജാതിപത്രി (ബഖൂറിൽ ഇതാണ്; ചില നാടുകളിൽ ബസ്ബാസ് എന്ന് പെരുംജീരകത്തിനും പറയും)", en: "mace (in some regions the word also means fennel)" },
  "قرنفل": { img: "Cloves-spice.jpg", imgKind: "thing", ml: "ഗ്രാമ്പൂ", en: "clove" },
  "سنبل": { img: "Indian_spikenard_Nardostachys_jatamansi_al-naridin_al-sunbul_al-hindi_fol_22v_NYPL.jpg", imgKind: "drawing", ml: "ജടാമാഞ്ചി", en: "spikenard" },
  "مسك": { ml: "കസ്തൂരി", en: "musk" },
};

/** The table of the kings of the days: 0 = Sunday … 6 = Saturday. */
export const DAY_TABLE = {
  0: { planet: "الشمس", metal: "ذهب", metal_ml: "സ്വർണ്ണം", colour: "أصفر", colour_ml: "മഞ്ഞ", incense: ["السندروس"],
       incense2: ["سندروس"], incense3: ["سندروس", "زعفران", "مايعة", "صندل أحمر"] },
  1: { planet: "القمر", metal: "فضة", metal_ml: "വെള്ളി", colour: "أبيض", colour_ml: "വെള്ള", incense: ["اللبان الذكر"],
       incense2: ["اللبان"], incense3: ["لبان", "قسط", "كبابة"] },
  2: { planet: "المريخ", metal: "حديد", metal_ml: "ഇരുമ്പ്", colour: "أحمر", colour_ml: "ചുവപ്പ്", incense: ["القسط", "قشر المحلب"],
       incense2: ["القسط"], incense3: ["صندل أحمر", "بسباس", "قرنفل"] },
  3: { planet: "عطارد", metal: "زئبق", metal_ml: "രസം (മെർക്കുറി)", colour: "أزرق", colour_ml: "നീല", incense: ["المقل الأزرق", "العنبر"],
       incense2: ["قشور المحلب"], incense3: ["صندل أبيض", "بسباس"] },
  4: { planet: "المشتري", metal: "قصدير", metal_ml: "വെളുത്തീയം (ടിൻ)", colour: "أخضر", colour_ml: "പച്ച", incense: ["العود", "الكافور"],
       incense2: ["العود", "الكافور"], incense3: ["صندل", "عود ابيض"] },
  5: { planet: "الزهرة", metal: "نحاس", metal_ml: "ചെമ്പ്", colour: "مشهب بحمرة", colour_ml: "ചുവപ്പ് കലർന്ന ചാരനിറം", incense: ["المصطكي"],
       incense2: ["المستكة"], incense3: ["المستكة", "عود", "لبان", "سنبل"] },
  6: { planet: "زحل", metal: "رصاص", metal_ml: "കറുത്തീയം (ലെഡ്)", colour: "أسود", colour_ml: "കറുപ്പ്", incense: ["الشمع الأصفر", "المايعة"],
       incense2: ["المايعة السائلة", "اللاذن"], incense3: ["قسط اسود", "اللاذن", "مسك", "عنبر"] },
};

/** Substitutes for each planet's metal, as the book lists them. */
export const METAL_SUBSTITUTES = {
  0: { ar: ["النحاس المطلي بالذهب", "الزعفران", "العود أو اللبان الفاخر", "حجر عين الشمس"],
       ml: ["സ്വർണ്ണം പൂശിയ ചെമ്പ്", "കുങ്കുമപ്പൂവ്", "അകിൽ അല്ലെങ്കിൽ നല്ല കുന്തിരിക്കം", "സൂര്യകാന്തക്കല്ല് (സൺസ്റ്റോൺ)"] },
  1: { ar: ["صدف أبيض", "اللؤلؤ الصناعي أو حجر القمر", "لبن أو ماء ورد نقي", "الزجاج الأبيض النقي"],
       ml: ["വെള്ള ചിപ്പി", "കൃത്രിമ മുത്ത് അല്ലെങ്കിൽ ചന്ദ്രകാന്തക്കല്ല്", "പാൽ അല്ലെങ്കിൽ ശുദ്ധമായ പനിനീർ", "തെളിഞ്ഞ വെള്ള ഗ്ലാസ്"] },
  2: { ar: ["الفولاذ", "حجر الدم", "الزنجبيل، الفلفل الأحمر", "اللون الأحمر القاني"],
       ml: ["ഉരുക്ക്", "രക്തക്കല്ല് (ബ്ലഡ്സ്റ്റോൺ)", "ഇഞ്ചി, ചുവന്ന മുളക്", "കടും ചുവപ്പ് നിറം"] },
  3: { ar: ["حجر العقيق الأخضر أو الفيروز", "أقلام رصاص نقي (رمزية)", "لون رمادي لامع", "نبات السذاب أو الحرمل"],
       ml: ["പച്ച അഖീഖ് അല്ലെങ്കിൽ ഫിറോസ (ടർക്വോയിസ്)", "പെൻസിൽ (ഗ്രാഫൈറ്റ്) — പ്രതീകമായി", "തിളങ്ങുന്ന ചാരനിറം", "അരൂത (സദാബ്) അല്ലെങ്കിൽ ഹർമൽ ചെടി"] },
  4: { ar: ["حجارة صفراء مثل التوباز", "ورق غار أو بخور اللبان", "القماش الأصفر الحريري", "الياقوت الأصفر"],
       ml: ["ടോപാസ് പോലുള്ള മഞ്ഞക്കല്ല്", "വയണയില (ബേ ലീഫ്) അല്ലെങ്കിൽ കുന്തിരിക്കം", "മഞ്ഞ പട്ടുതുണി", "മഞ്ഞ പുഷ്യരാഗം"] },
  5: { ar: ["ورد مجفف، مسك، عطر", "حجر الزمرد أو العقيق الوردي", "اللون الأخضر أو الزهري الفاتح", "قماش حرير ناعم"],
       ml: ["ഉണക്കിയ റോസാപ്പൂ, കസ്തൂരി, അത്തർ", "മരതകം അല്ലെങ്കിൽ പിങ്ക് അഖീഖ്", "പച്ച അല്ലെങ്കിൽ ഇളം പിങ്ക് നിറം", "മിനുസമുള്ള പട്ടുതുണി"] },
  6: { ar: ["أحجار داكنة كحجر العقيق الأسود", "خشب أسود أو بخور مر", "اللون الرمادي أو الأسود", "زيت الزيتون القديم"],
       ml: ["കറുത്ത അഖീഖ് പോലുള്ള ഇരുണ്ട കല്ലുകൾ", "കറുത്ത മരം അല്ലെങ്കിൽ മുർ (myrrh) ബഖൂർ", "ചാരനിറം അല്ലെങ്കിൽ കറുപ്പ്", "പഴയ ഒലിവെണ്ണ"] },
};

/** Condition 11: where the finished work is put, by its ruling nature. */
export const PLACE_BY_ELEMENT = {
  fire:  { ar: "فضع الطلسم قريب من النار", ml: "തീയിനടുത്ത് വെക്കുക.", en: "Put it near fire." },
  earth: { ar: "فيدفن في الأرض بعيدا عن موطئ الأقدام", ml: "ആളുകൾ ചവിട്ടി നടക്കാത്ത ഇടത്ത് മണ്ണിൽ കുഴിച്ചിടുക.", en: "Bury it in the ground, away from where feet tread." },
  air:   { ar: "ففي مكان تهب عليه الريح أو علقه عليك", ml: "കാറ്റ് വീശുന്ന ഇടത്ത് വെക്കുക, അല്ലെങ്കിൽ ദേഹത്ത് തൂക്കി (ധരിച്ച്) നടക്കുക.", en: "Put it where the wind blows on it, or hang it on yourself." },
  water: { ar: "فضعه قريبا من الماء", ml: "വെള്ളത്തിനടുത്ത് വെക്കുക.", en: "Put it near water." },
};

/** A Commons file shown at a small width. */
export const commonsImg = (file, w = 240) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;
export const commonsPage = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`;
