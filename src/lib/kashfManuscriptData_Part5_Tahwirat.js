// ═══════════════════════════════════════════════════════════════
// KASHF AL-HAQA'IQ — PART 5: TAHWIRAT + NAQADAT (pp.213-238)
// Source: PDFs pp.213-238 of the Omani manuscript
// Includes:
//   - التحويرات (Tahwirat) — Returning stolen goods/lost items (13 formulas)
//   - النقضات / المغابير (Naqadat) — Herbal incense formulas for magic/jinn treatment (11 recipes)
// ALL Arabic text is verbatim from the manuscript PDFs.
// ═══════════════════════════════════════════════════════════════

const SOURCE_AR = "كشف الحقائق";
const SOURCE_EN = "Kashf al-Haqa'iq";

// ══════════════════════════════════════════════════════════════════
// TAHWIRAT (التحويرات) — Returning Stolen/Lost Items
// Multiple formulas from Omani scholars for recovering theft/lost property
// ══════════════════════════════════════════════════════════════════

export const TAHWIRAT = [
  {
    id: "tahwira_01_umair",
    title_ar: "حورة لإعادة المسروقات — الشيخ سالم (عمير) بن محمد بن شيحان الربيعي",
    title_en: "Returning Stolen Goods — Sheikh Salim (Umair) bin Muhammad al-Rubi'i",
    scholar: "الشيخ سالم (عمير) بن محمد بن شيحان الربيعي رحمه الله",
    page: 213,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 213 },
    purpose_ml: "കളവ് തിരികെ കൊണ്ടുവരൽ — 7 ഉരുളൻ കല്ലുകൾ (അവസാനത്തേത് വെളുത്തത്). ഓരോ കല്ലിലും 1, 3, അല്ലെങ്കിൽ 7 തവണ ആഭിചാരം ചൊല്ലുക. കളവ് പോയ സ്ഥലത്ത് വെക്കുക; വെളുത്ത കല്ല് പോക്കറ്റിൽ സൂക്ഷിക്കുക. കള്ളൻ സാധനം തിരികെ നൽകും.",
    purpose_en: "Return stolen goods. Use 7 pebbles (last one white). Read azimah on each pebble 1, 3, or 7 times. Place in the stolen-from location; keep white pebble in pocket. Thief returns items.",
    materials: "سبع حصيات والسابعة تكون بيضاء والبقية من أي لون",
    warning: "بعد رجوع المسروقات اخرج الحصوات من مكانها واقرأ عليها آيات التبطيل واغسلها بالماء — وإلا قد يختل عقل السارق أو يجن",
    arabic_text: `بسم الله الرحمن الرحيم وَالسَّمَاءِ وَالطَّارِقِ وَمَا أَدْرَاكَ مَا الطَّارِقُ النَّجْمُ الثَّاقِبُ إِن كُلُّ نَفْسٍ لَّمَّا عَلَيْهَا حَافِظٌ فَلْيَنظُرِ الْإِنسَانُ مِمَّ خُلِقَ خُلِقَ مِن مَّاءٍ دَافِقٍ يَخْرُجُ مِن بَيْنِ الصُّلْبِ وَالتَّرَائِبِ إِنَّهُ عَلَىٰ رَجْعِهِ لَقَادِرٌ اللهم كما رددت يوسف لأبيه يعقوب وموسى لأمه اردد ضالة فلان بن فلانة وَإِن كَانَ مِثْقَالَ حَبَّةٍ مِّنْ خَرْدَلٍ أَتَيْنَا بِهَا وَكَفَىٰ بِنَا حَاسِبِينَ إِنَّهَا إِن تَكُ مِثْقَالَ حَبَّةٍ مِّنْ خَرْدَلٍ فَتَكُن فِي صَخْرَةٍ أَوْ فِي السَّمَاوَاتِ أَوْ فِي الْأَرْضِ يَأْتِ بِهَا اللَّهُ إِنَّ اللَّهَ لَطِيفٌ خَبِيرٌ إن الله على كل شيء قدير اللهم يا راد ما ذهب بحرمة النبي المنتخب اردد علي ما ذهب إنك على كل شيء قدير`
  },
  {
    id: "tahwira_02_omani_stones",
    title_ar: "حورة لإرجاع المسروقات — من المشايخ العمانيين (7 حصوات)",
    title_en: "Returning Stolen Goods — Omani Scholars (7 Pebbles Method)",
    scholar: "المشايخ العمانيون",
    page: 213,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 213 },
    purpose_ml: "7 ഉരുളൻ കല്ലുകൾ — 5 വെളുത്തതിൽ അജ്ഹസത്ത്, 4 പച്ചയിൽ ബദൂഹ് എഴുതുക. സൂറ അത്താരിഖ് 40 തവണ പാരായണം ചെയ്യുക — ഓരോ തവണയും 'അല്ലാഹുമ്മ ഇർജിഅ്ഹു ഇന്നക അലാ റജ്അഹി ലഖാദിർ' എന്ന് പറയുക. തിരികെ കിട്ടുന്നതുവരെ ദിവസവും ആവർത്തിക്കുക.",
    purpose_en: "7 pebbles (white + colored). Write اجهزط on 5 white, بدوح on 4 green pebbles. Recite Surah al-Tariq 40 times saying each time 'اللهم ارجعه إنك على رجعه لقادر'. Repeat daily until returned.",
    materials: "خمس حصيات صغار بيضات يكتب (اجهزط) + أربع حصايات خضرات يكتب (بدوح)",
    repetition: "أربعين مرة يقول في كل مرة: اللهم ارجعه إنك على رجعه لقادر — مع تكرار القراءة يومياً إلى أن يرجع"
  },
  {
    id: "tahwira_03_duha",
    title_ar: "حورة لرجوع الضالة — سورة الضحى",
    title_en: "Return of Lost Item — Surah al-Duha",
    scholar: "غير منسوب",
    page: 215,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 215 },
    purpose_ml: "സൂറ അദ്ദുഹാ പാരായണം ചെയ്ത ശേഷം 'ലാ ഇലാഹ ഇല്ലാ അല്ലാഹു ബിഹാ ഖാമത് അൽ-അംവാത്... ബിഹാ യർദു മാ ഫാത്' ചൊല്ലുക. 7 തവണ ആവർത്തിച്ച് ഓരോ തവണയും നൂൽ കെട്ട് ഇടുക — 7 മുട്ടുകൾ വരെ. ഇരുണ്ട സ്ഥലത്തോ കല്ലിനടിയിലോ വെക്കുക.",
    purpose_en: "Recite Surah al-Duha then 'لا إله إلا الله بها قامت الأموات... بها يرد ما فات' then dua for gathering. 7 repetitions with a thread knotting one knot each time until 7 knots. Place in dark or under stone.",
    arabic_text: `لا إله إلا الله بها قامت الأموات لا إله إلا الله بها يكشف البليات لا إله إلا الله بها يرد ما فات الله خير حافظاً وهو أرحم الراحمين اللهم يا جامع الناس ليوم لا ريب فيه اجمع بين فلان بن فلانة (تذكر الضالة) وبين صاحبها فإنك تعلم ما لا أعلم بحرمة النبي المنتخب محمد سيد العجم والعرب إنك على كل شيء قدير`,
    materials: "خيط — يعقد عقدة كلما قرأت حتى تتم سبع عقد",
    placement: "في مكان مظلم أو تجعله تحت حجر"
  },
  {
    id: "tahwira_04_rad_mardud",
    title_ar: "حورة لرد المسروق",
    title_en: "Returning the Stolen",
    scholar: "غير منسوب",
    page: 215,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 215 },
    purpose_ml: "കടലാസിൽ എഴുതി കളവ് പോയ സ്ഥലത്ത് കുഴിച്ചിടുക. സൂറ യൂസുഫ് (യൂസഫിന്റെ സാധനങ്ങൾ തിരികെ കിട്ടി), സൂറ അൽ-ഫലഖ്, പ്രത്യേക പ്രാർഥന എന്നിവ ഉൾപ്പെടുന്നു.",
    purpose_en: "Write on paper and bury at the place of theft. Combines Surah Yusuf (Joseph's goods returned), Surah al-Falaq, then specific petition.",
    arabic_text: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ وَلَمَّا فَتَحُوا مَتَاعَهُمْ وَجَدُوا بِضَاعَتَهُمْ رُدَّتْ إِلَيْهِمْ قَالُوا يَا أَبَانَا مَا نَبْغِي هَٰذِهِ بِضَاعَتُنَا رُدَّتْ إِلَيْنَا وَنَمِيرُ أَهْلَنَا وَنَحْفَظُ أَخَانَا وَنَزْدَادُ كَيْلَ بَعِيرٍ ذَٰلِكَ كَيْلٌ يَسِيرٌ قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِن شَرِّ مَا خَلَقَ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ اللهم واللأنبياء وبحرمة هذه الأسماء والآيات وبحرمة الملائكة المقربين والمرسلين وبحرمة اللوح والقلم أسألك أن ترد متاع فلان بن فلانة`,
    surah_solomon: `إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ أَلَّا تَعْلُوا عَلَيَّ وَأْتُونِي مُسْلِمِينَ`
  },
  {
    id: "tahwira_05_black_cloth",
    title_ar: "حورة لرد الضالة (خرقة سوداء)",
    title_en: "Return of Lost Item (Black Cloth Method)",
    scholar: "غير منسوب",
    page: 216,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 216 },
    purpose_ml: "കറുത്ത കഴുകിയ തുണി, 7 മുട്ടുകൾ കെട്ടുക. ഓരോ മുട്ടിനും പ്രത്യേക ഖുർആൻ വചനം. 7 മുട്ടുകളും കെട്ടിയ ശേഷം തുണി പിടിച്ച് വീണ്ടും പാരായണം ചെയ്ത് ഇരുണ്ട സ്ഥലത്ത് തൂക്കിയിടുക.",
    purpose_en: "Black washed cloth, tied 7 knots each over the other. Specific Quran verses per knot. After completing all 7, hold cloth and recite again, hang in dark place.",
    materials: "خرقة سوداء مغسولة طاهرة",
    knot_verses: [
      { knot: 1, verse: "يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ" },
      { knot: 2, verse: "أَوْ كَظُلُمَاتٍ فِي بَحْرٍ لُّجِّيٍّ..." },
      { knot: 3, verse: "يَا بُنَيَّ إِنَّهَا إِن تَكُ مِثْقَالَ حَبَّةٍ..." },
      { knot: 4, verse: "وَجَعَلْنَا مِن بَيْنِ أَيْدِيهِمْ سَدًّا وَمِنْ خَلْفِهِمْ سَدًّا..." },
      { knot: 5, verse: "أَفَرَأَيْتَ مَنِ اتَّخَذَ إِلَهَهُ هَوَاهُ..." },
      { knot: 6, verse: "وَالسَّمَاءِ وَالطَّارِقِ..." },
      { knot: 7, verse: "وَالضُّحَىٰ وَاللَّيْلِ إِذَا سَجَىٰ..." }
    ]
  },
  {
    id: "tahwira_06_habis_nawm",
    title_ar: "حورة لعقد نوم السارق",
    title_en: "Binding the Thief's Sleep",
    scholar: "غير منسوب",
    page: 226,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 226 },
    purpose_ml: "കള്ളന് ഉറങ്ങാൻ കഴിയാതെ തടയുക — കളവ് തിരികെ നൽകുന്നതുവരെ. ധൂപക്കരിയിൽ 7 ലുബ്ബാൻ കഷ്ണങ്ങൾ. ഓരോ കഷ്ണത്തിലും 7 തവണ പാരായണം ചെയ്യുക. ആളുകൾ ഉറങ്ങുമ്പോൾ ചെയ്യുക.",
    purpose_en: "Prevent the thief from sleeping until they return the stolen goods. Use 7 pieces of frankincense or gum resin in a brazier. Recite on each piece 7 times.",
    materials: "مجمرة + سبع حصيات لبان ذكر أو جاوي",
    timing: "إذا رقد الناس (at bedtime)",
    arabic_text: `اقسمت عليك يا عنقود بحق الأيمان والعهود وذوائب السود وبحق الرب المعبود الذي أجرى الماء في العمود وأنبع الماء من الجلمود أتٍ كوتٍ كوتٍ هيوتٍ ثاهيوثا شلموت سلموت سمه لمه اجب يا عنقود بحق هذه الاسماء عليك وطاعتها لديك إلا ما عقدت فلان بن فلانة عن النوم حتى يرجع ما سرقه الوحا الوحا العجل العجل الساعة الساعة`
  },
  {
    id: "tahwira_07_ibra_sorcery",
    title_ar: "حورة عزيمة الإبرة لرد السرقة (3 صيغ)",
    title_en: "Needle Azimah for Returning Theft (3 Versions)",
    scholar: "الشيخ سليمان بن إبراهيم العوفي وآخرون",
    page: 218,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 218 },
    purpose_ml: "സൂചി ഉപയോഗിച്ചുള്ള കളവ് തിരികെ കൊണ്ടുവരൽ. ഫാതിഹ + ഇഖ്ലാസ് + ഇന്നാ അൻസൽനാഹു + അവസാന ഹശ്റ് + ആയത്തുൽ കുർസി പാരായണം ചെയ്ത് 7 തവണ സൂചി തിരുമ്മുക. ഇബ്രാഹീം തീ ഫോർമുല ഉപയോഗിച്ച് വേദനയില്ലാതെ സൂചി ഇറക്കുക.",
    purpose_en: "Use a needle. Read Fatiha + Ikhlas + Inna Anzalnahu + last Hashr + Ayat al-Kursi. Rub needle between fingers while reciting 7 times. Insert needle without pain using Ibrahim fire formula.",
    versions: [
      {
        number: 1,
        scholar: "غير منسوب",
        arabic: "بسم الله الرحمن الرحيم عزمت عليك يا حديد الماس امسلش امسلش امسلش امسلش امسلش امسلش امسلش كما ملست عصا موسى وحجر عيسى عليهما السلام طيموس طيموس طيموس طيموس طيموس طيموس ادخلي بسلام واخرجي بسلام فلا تهرفي له دماً ولا تمزقي جلداً ولا تشري لحماً ولا تكسري عظماً وكوني برداً وسلاماً كما بردت النار على إبراهيم خليل الرحمن بألف ألف لا حول ولا قوة إلا بالله العلي العظيم"
      },
      {
        number: 2,
        scholar: "غير منسوب",
        arabic: "أيتها الإبرة املسي املسي كما ملست عصا موسى وحجر عيسى عليهما السلام ادخلي بسلام واخرجي بسلام ولا تكسري عظماً ولا تهرقي دماً ولا تهرشي لحماً إلا من سرق متاع فلان بن فلانة بحق طمير طمير طمير أهيا شراهيا أذوناي اصباوت آل شداي"
      },
      {
        number: 3,
        scholar: "الشيخ سليمان بن إبراهيم العوفي رحمه الله تعالى",
        arabic: "بسم الله الرحمن الرحيم عزمت عليك يا حديد المال امسلش امسلش امسلش امسلش امسلش امسلش كما ملس موسى من حجر عيسى طيموس طيموس طيموس طمر طمر طمر ادخلي بسلام واخرجي بسلام فلا تهرقي دماً ولا تمزقي جلداً ولا تشري لحماً ولا تكسري عظماً وكوني برداً وسلاماً كما بردت النار على إبراهيم خليل الرحمن بألف ألف لا حول ولا قوة إلا بالله العلي العظيم"
      }
    ]
  },
  {
    id: "tahwira_08_habis_bawl",
    title_ar: "حورة لحبس بول وغائط السارق",
    title_en: "Binding the Thief's Bladder and Bowel",
    scholar: "غير منسوب",
    page: 221,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 221 },
    purpose_ml: "സൂറ അൽ-ഫീൽ വിച്ഛിന്ന അക്ഷരങ്ങളിൽ എഴുതി ദൈവിക നാമങ്ങളും പ്രാർഥനയും ചേർക്കുക. മൺപാത്രത്തിൽ (ഗുർശ) ഇട്ട് മെഴുക് പൂശി ഭാരിയ കല്ലുമായി ഇരുണ്ട സ്ഥലത്ത് കുഴിച്ചിടുക. കള്ളന് കളവ് തിരികെ നൽകുന്നതുവരെ മൂത്രയും മലവും പോകില്ല.",
    purpose_en: "Write Surah al-Fil in disconnected letters then divine names, and petition. Bury in clay bottle (gurshe) with heavy stone on top in a dark place. Thief cannot urinate or defecate until they return stolen goods.",
    arabic_text: `تكتب سورة الفيل أحرف مقطعة ثم تكتب بعدها يا علي يا كريم يا علي يا حليم يا عليم يا حي يا قيوم يا حي قبل كل حي ويا حي بعد كل حي اللهم اسدد واربط واحبس بول وغائط سارق متاع فلان بن فلانة أخذاً وسداً واضرب في الأرض اضْرِبْ لَهُمْ طَرِيقًا فِي الْبَحْرِ يَبَسًا كذلك يبس وحبس بول وغائط سارق متاع فلان بن فلانة حتى يرد ما سرق`,
    materials: "قنينة (غرشة) ذات عنق طويل — تختمها بشمع ثم تدفنها في مكان مظلم مع حجر ثقيل"
  },
  {
    id: "tahwira_09_dhahiba",
    title_ar: "حورة لرد الذهيبة (الضائعة)",
    title_en: "Returning Lost Gold/Livestock",
    scholar: "غير منسوب",
    page: 221,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 221 },
    purpose_ml: "ബുധനാഴ്ച 7 ഉരുളൻ കല്ലുകൾ (ഒന്ന് വെളുത്തത്). ജ്ഞ രാജാക്കന്മാരെ (മൈമൂൻ, മഖ്സൂം, മുതലായവ) വിളിച്ച് നഷ്ടപ്പെട്ട വ്യക്തി/മൃഗ/സ്വർണം എല്ലാ ദിശയിൽ നിന്നും കൊണ്ടുവരാൻ കല്പിക്കുക.",
    purpose_en: "7 pebbles (one white) taken on Wednesday. Invoke jinn kings (Maymun, Makhzum, etc.) to bring the missing person/animal/gold from all directions.",
    timing: "يوم الأربعاء",
    arabic_text: `يا دهيش دهيش يا ميمون ميمون اجيبوا أيها الخدام يا مخزوم الأرمسي يا أبا عرابة يا ساكن الاظلمي يا ميمون الهندي يا أبا عرابة يا ساكن السحابة يا برقان المتوج اجيبوا واجلبوا فلان بن أو ضالة فلان بن فلانة من مشارق الأرض ومغاربها وسهلها وجبلها وجاهها ونعشها وبرها وبحرها وبعيدها وقريبها من كل فج عميق`
  },
  {
    id: "tahwira_10_mawashi",
    title_ar: "تحويرة لرد المواشي (الهوش)",
    title_en: "Returning Lost Livestock",
    scholar: "غير منسوب",
    page: 220,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 220 },
    purpose_ml: "നഷ്ടപ്പെട്ട കന്നുകാലികളെ തിരികെ കൊണ്ടുവരൽ. ആഹ്യാ ശരാഹ്യാ അദൂനായ് അസ്ബാഉത് ആൽ ശദായ് ഉപയോഗിച്ച് എല്ലാ ദിശയിൽ നിന്നും കന്നുകാലികളെ വിളിച്ചുവരുത്തുക.",
    purpose_en: "Return lost livestock from all directions. Invokes using آهيا شراهيا أدوناي اصباؤت آل شداي.",
    arabic_text: `اللهم يا هو يا هو يا هو اللهم يا راد الفوت بعد الفوت ويا محيي العالم بعد الموت ويا راد يوسف إلى أبيه ويا راد يونس من بطن الحوت اللهم اردد هوش فلان بن فلانة من مشارق الأرض ومغاربها الأرض بها ترجف والسماء بها تقذف والريح بها تعصف يأتي بها الله كلمح البصر أهيا شراهيا أدوناي اصباؤت آل شداي الوحا الوحا العجل العجل الساعة الساعة وال حول ولا قوة إلا بالله العلي العظيم`
  },
  {
    id: "tahwira_11_saqm_sariq",
    title_ar: "حورة لسقم السارق — الشيخ جاعد بن خميس الخروصي",
    title_en: "Making the Thief Fall Ill — Sheikh Ja'ad al-Khurosi",
    scholar: "الشيخ جاعد بن خميس الخروصي رحمه الله تعالى",
    page: 227,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 227 },
    purpose_ml: "ചൊവ്വാഴ്ച (അല്ലെങ്കിൽ അതിന്റെ 8-ാം സഅാത്ത്) മുടിക്കയർ എടുക്കുക. ഫാതിഹ + മഅവ്വിദതൈൻ + ഇഖ്ലാസ് പാരായണം ചെയ്ത് കയർ പിന്നുക. തീ/നരക വചനം ചൊല്ലുക. കയർ വെള്ളത്തിൽ മുക്കി ഭാരിയ കല്ലുമായി ഇരുണ്ട സ്ഥലത്ത് വെക്കുക. കള്ളൻ രോഗിയാകും.",
    purpose_en: "Take a rope of hair on a Tuesday (or its 8th hour). Read Fatiha + Ma'awwidhatain + Ikhlas while braiding. Then read fire/Hellfire verse. Soak rope in water and place heavy stone on it in dark place.",
    timing: "يوم الثلاثاء أو ساعة أو ثامن ساعة منه",
    materials: "حبال من شعر",
    arabic_text: `مِن مَّاءٍ صَدِيدٍ يَتَجَرَّعُهُ وَلَا يَكَادُ يُسِيغُهُ وَيَأْتِيهِ الْمَوْتُ مِن كُلِّ مَكَانٍ وَمَا هُوَ بِمَيِّتٍ وَمِن وَرَائِهِ عَذَابٌ غَلِيظٌ فَلَوْلَا إِذَا بَلَغَتِ الْحُلْقُومَ وَأَنتُمْ حِينَئِذٍ تَنظُرُونَ نَارُ اللَّهِ الْمُوقَدَةُ الَّتِي تَطَّلِعُ عَلَى الْأَفْئِدَةِ`
  },
  {
    id: "tahwira_12_powerful_salim",
    title_ar: "حورة قوية — الشيخ سالم بن عامر الحارثي",
    title_en: "Powerful Formula — Sheikh Salim bin Amer al-Harthi",
    scholar: "الشيخ سالم بن عامر الحارثي",
    page: 224,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 224 },
    purpose_ml: "ശക്തമായ ഫോർമുല — 7 ഗ്രഹ രാജാക്കന്മാരെ വിളിച്ച് നഷ്ടപ്പെട്ട സാധനം തിരികെ കൊണ്ടുവരൽ. ഹയ്യാ ഹയ്യാ ശരാഹ്യാ ശരാഹ്യാ ബരാഹ്യാ കൽകാലഹ്യാ സൽസലാഹാ ഉപയോഗിക്കുന്നു.",
    purpose_en: "Powerful formula invoking 7 planetary kings for the return of lost property. Uses هيا هيا شراهيا شراهيا براهيا كلكالهيا سلسلاها.",
    arabic_text: `بسم الله الرحمن الرحيم لا إله إلا الله بها قامت السموات لا إله إلا الله بها يرد ما فات لا إله إلا الله بها تكشف البليات لا إله إلا الله والله فاللَّهُ خَيْرٌ حَافِظًا وَهُوَ أَرْحَمُ الرَّاحِمِينَ هيا هيا شراهيا شراهيا براهيا براهيا سلسلاها سلسلاها كلكالهيا كلكالهيا اللهم حيرت وجلبت باسمك العظيم ونورك الكريم اللهم يا مسبب كل سبب ويا معطي النبي محمد صلى الله عليه وسلم خير ما طلب ويا راد ما ذهب`,
    planetary_call: "اجب يا ميمون بحق عزرائيل اجب يا مذهب بحق روقيائيل اجب يا برقان بحق ميكائيل اجب يا شمهورش بحق إسرافيل اجب يا زوبعة بحق ضفيائيل اجيبوا داعي الله واجلبوا ضالة فلان بن فلانة"
  },
  {
    id: "tahwira_13_nufukh_ayn_sariq",
    title_ar: "حورة لنفخ عين السارق (حمص)",
    title_en: "Swelling the Thief's Eyes (Chickpeas Method)",
    scholar: "غير منسوب",
    page: 225,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 225 },
    purpose_ml: "48 കടല പരിപ്പ്. സൂറ തബ്ബത് (ബിസ്മില്ലാഹ് ഇല്ലാതെ) ഓരോ കടലയിലും ഒരു തവണ പാരായണം ചെയ്യുക. പൂർത്തിയായപ്പോൾ വെള്ളത്തിൽ എറിയുക — കടല വീർക്കും = കള്ളന്റെ കണ്ണ് വീർക്കും, പിടിക്കപ്പെടും.",
    purpose_en: "48 chickpeas. Recite Surah Tabbat (without Bismillah) once on each chickpea. When done, throw in water — chickpeas swell in water = thief's eyes swell and he is caught.",
    materials: "ثمانية وأربعون حبة دنجو (حمص)",
    arabic_text: "تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ مَا أَغْنَى عَنْهُ مَالُهُ وَمَا كَسَبَ سَيَصْلَى نَارًا ذَاتَ لَهَبٍ وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ",
    petition: "اللهم انفخ عيني سارق متاع فلان بن فلانة كما تنفخ هذه الحبات الماء انتفخت أعين السارق"
  }
];

// ══════════════════════════════════════════════════════════════════
// NAQADAT / MAQHABIR (النقضات / المغابير)
// Herbal incense formulas for treating magic, evil eye, and jinn
// All quantities in grams (200g or 100g per ingredient)
// ══════════════════════════════════════════════════════════════════

export const NAQADAT = [
  {
    id: "naqda_01_all_magic_eye",
    title_ar: "نقضة لعلاج جميع الأسحار والعين وأم الصبيان",
    title_en: "Powder 1 — For Magic, Evil Eye, and Om al-Sibyan",
    page: 229,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 229 },
    purpose_en: "Incense powder for magic, evil eye, and infant afflictions (Om al-Sibyan).",
    ingredients: [
      "200 جرام حلتيت (خيل) / Asafoetida",
      "200 جرام شيح بلدي / Wild wormwood",
      "200 جرام بذر كرافس / Celery seeds",
      "200 جرام بذر فجل / Radish seeds",
      "200 جرام بذر بصل / Onion seeds",
      "200 جرام شذاب / Rue",
      "200 جرام كف مريم / Mary's Hand (Rose of Jericho)",
      "200 جرام ميعة ناشفة / Dry styrax",
      "200 جرام ميعة سائلة / Liquid styrax"
    ],
    preparation: "يخلط الجميع بعد الطحن ويعجن بعصير الفجل الأخضر ويكور ثم يترك في الظل 7 أيام ويستعمل بعده كبخور",
    usage: "incense"
  },
  {
    id: "naqda_02_magic_envy_jinn_home",
    title_ar: "نقضة لعلاج السحر والحسد ومس الجان (بخور للمنزل والأنسان)",
    title_en: "Powder 2 — Magic, Envy, Jinn Touch (Home & Person Incense)",
    page: 229,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 229 },
    purpose_en: "Incense for home and person against magic, envy, and jinn.",
    ingredients: [
      "200 جرام حرمل / Harmal (Wild rue)",
      "200 جرام لبان ذكر / Male frankincense",
      "200 جرام سذاب يابس / Dry rue (sezab)",
      "200 جرام ملح جريش / Coarse salt"
    ],
    preparation: "يطحن ثم يخلط ويعجن بماء الورد ثم يكور ويترك في الظل لمدة 3 أيام يبخر بها المريض والمنزل"
  },
  {
    id: "naqda_03_magic_jinn_general",
    title_ar: "نقضة لعلاج جميع الأسحار والجان",
    title_en: "Powder 3 — General Magic and Jinn Treatment",
    page: 230,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 230 },
    purpose_en: "For humans, animals, and the home.",
    ingredients: [
      "200 جرام كف مريم", "200 جرام حب حرمل", "200 جرام محلب",
      "200 جرام شيح", "200 جرام زعتر", "200 جرام لبان ذكر",
      "200 جرام ملح جريش", "200 جرام شبه", "200 جرام حبة سوداء",
      "200 جرام كزبرة"
    ],
    preparation: "يخلط ويبخر به الانسان والحيوان والمنزل"
  },
  {
    id: "naqda_04_magic_envy_jinn_home_person",
    title_ar: "نقضة لعلاج السحر والحسد ومس الجان للمنزل والانسان",
    title_en: "Powder 4 — Magic, Envy, Jinn (Home and Person)",
    page: 230,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 230 },
    purpose_en: "Formed into olive-sized balls, dried 3 days in shade.",
    ingredients: [
      "200 جرام حرمل", "200 جرام لبان ذكر", "200 جرام سذاب يابس",
      "200 جرام قسط هندي", "200 جرام ملح خشن"
    ],
    preparation: "تطحن جميعاً ثم يخلط مع ماء الورد ويشكل عجيناً ويكور ويترك في الظلال على شكل حبيبات الزيتون أو البندق لمدة 3 أيام يستعمل بعد بخوراً"
  },
  {
    id: "naqda_05_magic_jinn_general_2",
    title_ar: "نقضة لعلاج جميع الأسحار والجان (مسك وعطر)",
    title_en: "Powder 5 — Magic and Jinn with Musk",
    page: 232,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 232 },
    purpose_en: "Mixed with sesame oil, heated, read Mu'awwidhatain + Ayat al-Kursi, used as ointment.",
    ingredients: [
      "تولة من المسك أسود أو أبيض", "روح الورد قدر فنجان",
      "ملعقة كبيرة ورق زعتر مطحون", "ملعقة كبيرة كف مريم مطحون",
      "ملعقة كبيرة قسط هندي مطحون", "كيلو قرنفل مطحون"
    ],
    preparation: "يخلط الجميع بزيت السمسم ويغلى على النار ثم يترك ليبرد ويقرأ عليه المعوذتان وآية الكرسي ويستعمل بعدها دهاناً"
  },
  {
    id: "naqda_06_magic_jinn_large",
    title_ar: "نقضة لعلاج جميع الأسحار والجان (تركيبة كبيرة)",
    title_en: "Powder 6 — Comprehensive Magic and Jinn (Large Formula)",
    page: 232,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 232 },
    purpose_en: "Large 20-ingredient formula. Ground, kneaded with salty water, formed into balls, dried 3 days.",
    ingredients: [
      "200 جرام لبان ذكر", "200 جرام زعتر", "200 جرام بذور الخروب",
      "200 جرام سذاب", "200 جرام زعفران", "200 جرام جاوي",
      "200 جرام ميعة سائلة", "200 جرام حلتيت", "200 جرام سندروس",
      "200 جرام خردل", "200 جرام بذر حنظل", "200 جرام بذر حرمل",
      "200 جرام سدر", "200 جرام مر", "200 جرام عود صليب",
      "200 جرام صبر", "200 جرام قسط", "200 جرام قشر رمان",
      "200 جرام زنجبيل", "200 جرام فاسوخ",
      "200 جرام ماء الفجل", "200 جرام ماء ورد", "200 جرام كف مريم"
    ],
    preparation: "يطحن ويعجن بماء مالح ويكور ويترك 3 أيام ثم يستعمل للتبخير"
  },
  {
    id: "naqda_07_sidr_magic_eye",
    title_ar: "نقضة السدر لفك السحر والعين",
    title_en: "Sidr Powder — Breaking Magic and Evil Eye",
    page: 234,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 234 },
    purpose_en: "Sidr (lote tree) roots for breaking magic; Sidr leaves for evil eye. Drunk as infusion, bathed in, and used as incense.",
    ingredients: [
      "عروق السدر — لفك السحر (sidr roots)",
      "أوراق السدر — لفك العين (sidr leaves)"
    ],
    usage_modes: "شرباً واستحماماً وبخوراً"
  },
  {
    id: "naqda_08_magic_jinn_talasim",
    title_ar: "نقضة لفك السحر والجان والطلاسم",
    title_en: "Powder 8 — Breaking Magic, Jinn, and Talismans",
    page: 234,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 234 },
    purpose_en: "Use before Maghrib once a month.",
    timing: "قبل المغرب بنصف ساعة أو خمسة دقائق — تستعمل مرة في الشهر",
    ingredients: [
      "100 جرام لبان", "100 جرام سذاب", "100 جرام حلتيت",
      "100 جرام حبة سوداء", "100 جرام سنوت", "100 جرام سندروس",
      "100 جرام مقل", "100 جرام فاسوخ", "100 جرام عرق العفريت"
    ],
    preparation: "تخلط ويبخر بها قبل المغرب بنصف ساعة أو خمسة دقائق"
  },
  {
    id: "naqda_09_eye_envy",
    title_ar: "نقضة لفك وأبطال العين والحسد",
    title_en: "Powder 9 — Breaking Evil Eye and Envy",
    page: 235,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 235 },
    purpose_en: "Burn 7 days at sunset.",
    timing: "7 أيام وقت الغروب",
    ingredients: [
      "100 جرام كف مريم", "100 جرام شبه", "100 جرام كزبرة",
      "100 جرام حبة سوداء", "100 جرام ملح خشن"
    ]
  },
  {
    id: "naqda_10_powerful_eye_jinn",
    title_ar: "نقضة قوية لإبطال العين القوية والقديمة ونظرة الجان",
    title_en: "Powder 10 — Strong Old Evil Eye and Jinn Look",
    page: 235,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 235 },
    ingredients: [
      "100 جرام حرمل", "100 جرام سدر", "100 جرام زعتر",
      "100 جرام كزبرة", "شوك قنفذ / Hedgehog spines", "100 جرام حلتيت",
      "100 جرام قرنفل", "100 جرام حبة سوداء"
    ],
    preparation: "تخلط ويبخر بها البيت والانسان"
  },
  {
    id: "naqda_11_home_protection",
    title_ar: "نقضة قوية لذهاب المشاكل الروحية من المنازل وفوضى الأطفال والنكد",
    title_en: "Powder 11 — Powerful Home Purification (Fear, Discord, Jinn)",
    page: 237,
    source: { book: SOURCE_AR, book_en: SOURCE_EN, page: 237 },
    purpose_en: "For fear, frenzy, chaos, marital problems, curses — burn 3-4 times/month. Read Fatiha + Ayat al-Kursi + Mu'awwidhatain (7x each) + Nullification verses on the mix before using.",
    recitation_before_use: "سورة الفاتحة + آية الكرسي + المعوذتين — كل سورة 7 مرات",
    timing: "3-4 مرات في الشهر قبل غروب الشمس أو بعد العشاء",
    large_formula: {
      ingredients: [
        "500 جرام لبان ذكر", "500 جرام حرمل ورق أو مطحون",
        "500 جرام بذر الحرمل", "500 جرام ملح البحر الخشن"
      ],
      quran_recitation: "سورة الفاتحة 7 مرات + آية الكرسي 7 مرات + سورة قاف مرة + سورة الرحمن مرة + سورة الجن مرة + سورة الفلق 3 مرات + سورة الناس 3 مرات + الصلاة الإبراهيمية أو النارية 7 مرات"
    },
    notes: "يطرد جميع البلايا والأسحار والنحوسات والعوارض والأمراض النفسية ذات الأسباب الروحية — وأيضاً تحصين للبيت من كل شر وسحر وشياطين بإذن الله"
  }
];

export default { TAHWIRAT, NAQADAT };