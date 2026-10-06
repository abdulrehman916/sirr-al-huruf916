/**
 * SAMUR HİNDİ KNOWLEDGE INDEX
 * Source: Risale-i Samur Hindi, Sheikh İdris Çelebi, 15 Kasım 1994, Karaman
 * Compiled from 85 pages — all content extracted directly from the book.
 * DO NOT use any knowledge outside this book.
 */

export const BOOK_META = {
  title: "Risale-i Samur Hindi",
  author: "Sheikh İdris Çelebi (İdris Çelebi)",
  compiler: "Elmünazzem İdris Çelebi",
  source_book: "Sütülü Nâm (Ahmed el-Bûni, Rahmetullahi Aleyh)",
  date: "15 Kasım 1994",
  place: "Karaman",
  total_pages: 85,
  cuz_count: 2,
  language: "Ottoman Turkish / Arabic",
};

/**
 * Full chapter/section index with page ranges
 */
export const CHAPTERS = [
  { id: "one", name: "BİRİNCİ CÜZ", pages: [7, 30] },
  { id: "preface", name: "MÜELLİF'İN ÖNSÖZÜ", pages: [5, 5] },
  { id: "anasir", name: "ANASIRI ERBAA'NIN TABİATLARI (Four Elements)", pages: [7, 9] },
  { id: "galip_maglup", name: "GALİP VE MAĞLUP TABLOSU (Dominant/Dominated Table)", pages: [10, 10] },
  { id: "burclar", name: "BURÇLAR (Zodiac Signs)", pages: [10, 11] },
  { id: "gezegenler", name: "GEZEGENLER (Planets)", pages: [12, 16] },
  { id: "saatler", name: "SAATLER (Planetary Hours)", pages: [13, 15] },
  { id: "amel_saatleri", name: "AMEL YAPILACAK SAATLER (Hours for Amal)", pages: [14, 15] },
  { id: "gezegenlerin_buhurlari", name: "GEZEGENLERİN BUHURLARI (Planetary Incenses)", pages: [15, 15] },
  { id: "gezegenlerin_serefi", name: "GEZEGENLERİN ŞEREFİ (Planetary Exaltations)", pages: [15, 16] },
  { id: "gezegenlerin_said_nahis", name: "GEZEGENLERİN SAİD VE NAHİSLARI (Fortunate/Unfortunate Planets)", pages: [16, 16] },
  { id: "gezegenlerin_sanati", name: "GEZEGENLERİN SANATI VE DOĞUŞU (Nature & Rising of Planets)", pages: [16, 16] },
  { id: "ebcedi_cemlu_kebir", name: "EBCEDİ CEMLÜ KEBİR (Grand Abjad)", pages: [16, 17] },
  { id: "ebcedi_cemlu_sagir", name: "EBCEDİ CEMLÜ SAĞİR (Small Abjad)", pages: [17, 18] },
  { id: "harflerin_anasiri", name: "HARFLERİN ANASIRI (Elements of Letters)", pages: [18, 19] },
  { id: "vefk_yapma_kaideleri", name: "VEFK YAPMA KAİDELERİ (Rules of Making Vefk)", pages: [19, 29] },
  { id: "uclu_vefk", name: "ÜÇLÜ VEFK (3×3 Magic Square)", pages: [19, 20] },
  { id: "dortlu_vefk", name: "DÖRTLÜ VEFK (4×4 Magic Square)", pages: [20, 21] },
  { id: "besli_vefk", name: "BEŞLİ VEFK (5×5 Magic Square)", pages: [21, 21] },
  { id: "altili_vefk", name: "ALTILI VEFK (6×6 Magic Square)", pages: [22, 22] },
  { id: "yedili_vefk", name: "YEDİLİ VEFK (7×7 Magic Square)", pages: [22, 23] },
  { id: "sekizli_vefk", name: "SEKİZLİ VEFK (8×8 Magic Square)", pages: [24, 24] },
  { id: "dokuzlu_vefk", name: "DOKUZLU VEFK (9×9 Magic Square)", pages: [24, 25] },
  { id: "vefk_yapmanin_temeli", name: "VEFK YAPMANIN TEMELİ (Foundation of Vefk Making)", pages: [26, 29] },
  { id: "bu_ilmin_sartlari", name: "BU İLMİN ŞARTLARI (Conditions of This Science)", pages: [29, 29] },
  { id: "vefklerin_levhasi", name: "VEFKLERİN LEVHASI (Vefk Diagram)", pages: [30, 30] },
  { id: "two", name: "İKİNCİ CÜZ", pages: [31, 85] },
  { id: "anasiri_erbaa_2", name: "ANASIRI ERBAA (Second Cüz — Elements)", pages: [31, 32] },
  { id: "dokuz_mizan", name: "DOKUZ MİZAN (Nine Scales)", pages: [32, 45] },
  { id: "basti_adedi", name: "BASTI ADEDİ İLE DOKUZ MİZAN (Dokuz Mizan with Bast Numbers)", pages: [38, 85] },
  { id: "ates_anasir_dereceleri", name: "ATEŞ ANASIRI DERECELERİ (Degrees of Fire Element)", pages: [35, 35] },
  { id: "toprak_anasir_dereceleri", name: "TOPRAK ANASIRI DERECELERİ (Degrees of Earth Element)", pages: [36, 36] },
  { id: "hava_anasir_dereceleri", name: "HAVA ANASIRI DERECELERİ (Degrees of Air Element)", pages: [36, 36] },
  { id: "su_anasir_dereceleri", name: "SU ANASIRI DERECELERİ (Degrees of Water Element)", pages: [37, 37] },
  { id: "anasira_gore_basti", name: "ANASIRA GÖRE BASTI ADEDİ (Bast Number by Element)", pages: [49, 53] },
  { id: "esmai_kitabet", name: "ESMÂ-İ KİTABET (Esma of Writing)", pages: [45, 57] },
  { id: "esmai_avan", name: "ESMÂ-İ AVAN (Esma of Helpers)", pages: [47, 57] },
  { id: "esmai_kasem", name: "ESMÂ-İ KASEM (Esma of Oath/Qasam)", pages: [49, 84] },
];

/**
 * MAIN KNOWLEDGE DATABASE
 * Every topic searchable — indexed by page with exact text from book.
 */
export const KNOWLEDGE_INDEX = [

  // ═══════════════════════════════════════════════════════
  // ELEMENTS (ANASIR)
  // ═══════════════════════════════════════════════════════
  {
    topic: "anasir", keywords: ["anasır", "unsur", "element", "four elements", "ateş", "toprak", "hava", "su"],
    page: 7, chapter: "ANASIRI ERBAA'NIN TABİATLARI",
    text: "Ey Talib! Sen bilki; Anasırı erbaa (dört unsur) Ateş, Toprak, Hava ve Su'dur. Bunlarında her birisinin tabiatları vardır. Ateşin tabiatı kuru sıcaktır. Toprağın tabiatı kuru soğuktur. Hava nın tabiatı nemli sıcaktır. Suyun tabiatı ise nemli soğuktur.",
    related_pages: [8, 9, 18, 31, 35, 36, 37]
  },
  {
    topic: "anasir_compatibility", keywords: ["barışırlar", "barışmazlar", "uyuşma", "compatibility", "talib", "matlub"],
    page: 7, chapter: "ANASIRI ERBAA'NIN TABİATLARI",
    text: "Eğer, talibin anasırı ateş, matlubun anasırında toprak olsa, ateşin harareti toprağın soğukluğu ile mu'tedil olur. İki derece kuruluk kalır. Barışmazlar. Eğer talibin anasırı ateş, matlubun anasırında hava olsa, ateşin kuruluğu havanın rutübeti ile mu'tedil olur. İki derece ateş kalır. Barışırlar.",
    related_pages: [8, 9]
  },
  {
    topic: "anasir_degrees_fire", keywords: ["ateş derecesi", "nar", "fire degrees"],
    page: 35, chapter: "ATEŞ ANASIRI DERECELERİ",
    text: "1. Ateşin birinci derecesi: النَّارُ الْمُسْتَعْمَلْ (Kullanılmış ateş). 2. Ateşin ikinci derecesi: النَّارُ تَأْكُلُ وَتَشْرَبُ (Ateş yer ve içer). 3. Ateşin üçüncü derecesi: النَّارُ لَاتَأْكُلُ وَلَا تَشْرَبُ (Ateş ne yer ve nede içer). 4. Ateşin dördüncü derecesi: النَّارُ بَارِدَةٌ (Ateş soğuktur).",
    related_pages: [36, 37, 38]
  },
  {
    topic: "anasir_degrees_earth", keywords: ["toprak derecesi", "earth degrees", "turab"],
    page: 36, chapter: "TOPRAK ANASIRI DERECELERİ",
    text: "1. Toprağın birinci derecesi: التُّرَابُ الْقَابِلُ يَهْوِى الزَّرْعَ (Toprak bitkiyi kabul eder). 2. Toprağın ikinci derecesi: التُّرَابُ جَمِيعُ الْمَعَادِنُ (Toprak madenlerin tamamıdır). 3. Toprağın üçüncü derecesi: (Toprak imaretler yapıcıdır; Bina v.b. gibi). 4. Toprağın dördüncü derecesi: (Üzerinde bitki yetişmeyen yaşlı toprak).",
    related_pages: [35, 37, 38]
  },
  {
    topic: "anasir_degrees_air", keywords: ["hava derecesi", "air degrees", "hewa"],
    page: 36, chapter: "HAVA ANASIRI DERECELERİ",
    text: "1. Hava nın birinci derecesi: الْهَوَاءُ يَهُبُّ بِمَايَنْفَعُ النَّاسَ (Hava insanların faydalanacakları ile eser). 2. Havanın ikinci derecesi: الْهَوَاءُ عِشْقٌ وَمَحَبَّةٌ (Hava aşk ve muhabbettir). 3. Havanın üçüncü derecesi: الْهَوَاءُ لِجَمِيعِ الطُّيُورُ (Hava tüm uçucular içindir). 4. Havanın dördüncü derecesi: الْهَوَاءُ الْبَارِدُ الْمُفْسِدُ (Bozucu soğuk hava).",
    related_pages: [35, 37]
  },
  {
    topic: "anasir_degrees_water", keywords: ["su derecesi", "water degrees", "ma"],
    page: 37, chapter: "SU ANASIRI DERECELERİ",
    text: "1. Suyun birinci derecesi: الْمَاءُ الْجُلْوَالْعِذْبُ الْفُرَاتُ (Tatlı, lezzetli ve tayyib su). 2. Suyun ikinci derecesi: (Acı ve kokmuş su). 3. Suyun üçüncü derecesi: (Tuzlu ve köpüklü su). 4. Suyun dördüncü derecesi: (Tadı olmayan çökmüş su). 5. Suyun beşinci derecesi: الْمَاءُ النَّقِيُّ عَلَى الْإِنْسَانَ (İnsana berrak olan su).",
    related_pages: [35, 36, 38]
  },

  // ═══════════════════════════════════════════════════════
  // VEFK (MAGIC SQUARES)
  // ═══════════════════════════════════════════════════════
  {
    topic: "vefk_overview", keywords: ["vefk", "vefik", "magic square", "tılsım"],
    page: 19, chapter: "VEFK YAPMA KAİDELERİ",
    text: "Vefk yapmanın birçok kaileleri vardır. Şeyh ekber (Rahmetullahi aleyh) in sözüne göre, bu kaideler önce dört mizanı bast etmektir. Birinci mizan: Matlub ismi. İkinci mizan: Matlubun anasır harfleri. Üçüncü mizan: Maksut olan her ne ise (Celb, tard, muhabbet, adavet, tefrik gibi). Dördüncü mizan: Talib olan kişinin ismidir.",
    related_pages: [20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]
  },
  {
    topic: "uclu_vefk", keywords: ["üçlü vefk", "3x3", "üç", "zühal", "cumartesi"],
    page: 19, chapter: "ÜÇLÜ VEFK",
    text: "Üçlü vefk yedi gezegenden zühal e mensub olup, günü Cumartesi dir. Üçlü vefkin dil-i ve kutru adedi onbeştir (15). Üçlü vefk yapmak için onbeşten (15) üç (3) sayısını çıkarırız. Baki oniki (12) kalır. Asıl adetten oniki (12) rakamını çıkarıp, kalan adedi üçe (3) böleriz. Bölümü birinci (1.) haneye yazarak, birer zamla vefki tamamlarız.",
    related_pages: [20]
  },
  {
    topic: "dortlu_vefk", keywords: ["dörtlü vefk", "4x4", "müşteri", "perşembe"],
    page: 20, chapter: "DÖRTLÜ VEFK",
    text: "Dörtlü vefk, yedi gezegenden müşteri ye mensub olup, günü Perşembe dir. Dörtlü vefkin dil-i ve kutru adedi otuzdörttür (34). Dörtlü vefk yapmak için, otuzdörtten (34) dört (4) sayısını çıkarırız. Baki otuz (30) kalır.",
    related_pages: [21]
  },
  {
    topic: "besli_vefk", keywords: ["beşli vefk", "5x5", "merih", "salı"],
    page: 21, chapter: "BEŞLİ VEFK",
    text: "Beşli vefk, yedi gezegenden merihe mensub olup, günü Salı dır. Beşli vefkin dil-i ve kutru adedi altmışbeş tir (65). Beşli vefk yapmak için 65 ten beş (5) sayısını çıkarırız. Baki altmış (60) kalır.",
    related_pages: [22]
  },
  {
    topic: "altili_vefk", keywords: ["altılı vefk", "6x6", "güneş", "şems", "pazar"],
    page: 22, chapter: "ALTILI VEFK",
    text: "Altılı vefk, yedi gezegenden güneşe mensub olup, günü Pazar dır. Altılı vefkin dil-i ve kutru adedi yüzonbir (111) dir. Altılı vefk yapmak için 111 den 6 sayısını çıkarırız. Baki 105 kalır.",
    related_pages: [23]
  },
  {
    topic: "yedili_vefk", keywords: ["yedili vefk", "7x7", "zühre", "cuma"],
    page: 22, chapter: "YEDİLİ VEFK",
    text: "Yedili vefk, yedi gezegenden Zühre ye mensub olup, günü Cuma dır. Yedili vefkin dil-i ve kutru adedi yüzyetmişbeş tir (175). Yedili vefk yapmak için yüzyetmişbeş (175) ten yedi (7) sayısını çıkarırız. Baki yüzaltmışsekiz (168) kalır.",
    related_pages: [23]
  },
  {
    topic: "sekizli_vefk", keywords: ["sekizli vefk", "8x8", "utarid", "çarşamba"],
    page: 24, chapter: "SEKİZLİ VEFK",
    text: "Sekizli vefk, yedi gezegenden Utarid e mensub olup, günü Çarşamba dır. Sekizli vefkin dil-i ve kutru adedi ikiyüzaltmış (260) tır. Sekizli vefk yapmak için, ikiyüzaltmış (260) tan sekiz (8) sayısını çıkarırız. Baki ikiyüzelliiki (252) kalır.",
    related_pages: [25]
  },
  {
    topic: "dokuzlu_vefk", keywords: ["dokuzlu vefk", "9x9", "kamer", "ay", "pazartesi"],
    page: 24, chapter: "DOKUZLU VEFK",
    text: "Dokuzlu vefk, yedi gezegenden Kamer e mensub olup, günü Pazartesi dir. Dokuzlu vefkin dil-i ve kutru adedi üçyüzaltmışdokuz (369) dur. Dokuzlu vefk yapmak için 369 dan dokuz (9) sayısını çıkarırız. Baki üçyüzaltmış (360) kalır.",
    related_pages: [25]
  },

  // ═══════════════════════════════════════════════════════
  // VEFK CONDITIONS (BU İLMİN ŞARTLARI)
  // ═══════════════════════════════════════════════════════
  {
    topic: "vefk_conditions", keywords: ["şartlar", "conditions", "taharet", "temizlik", "purity", "niyet"],
    page: 29, chapter: "BU İLMİN ŞARTLARI",
    text: "Ey Talib! Bilki; Bu vefk ilminin şartları çoktur. Önce, vefk yapacak olan kişi daima taharet üzere olmalıdır. Elbiseleri ve mekanı temiz vede güzel kokulu olması gerekir. Kalbini ve düşüncelerini kütürden ve şirkten arındırması gerekir. Allah (celle celâlüh) tan daima havf (korku) üzere olmalıdır. Helal ve haramlara karşı çok dikkatli ve özenli olması gerekir. Bu şartları yerine getirdikten sonra ameline başlamalıdır. Yaptığın amel gerek hayır, gerek şer, gerek celb ve gerek tard her ne ise yerinde ve müstehakıyla yapmalıdır. Vefkin hanelerini eşit bir şekilde çizmek ve güzel yazı ile yazmak gerekir. Vefki gününe ve saatine göre (Yani matlubun gezegeninin gününde ve amele münasib saatte) yapmalıdır. Vefk yaptığın kağıtta iğne yurdu kadar bile olsa, delik olmaması gerekir. Vefki yazarken gezegenine münasib buhurlardan tebhir etmen gerekir. Eline kalemi (kamışı) alıp, kesmeye başlarsın. Kesme bitinceye kadar, Euzu Besmele ile, Sûre-i Fatiha ve Sûre-i İhlas'ı okusun. Vefkin kutup hanelerini yazarken, ihlaslı niyet ile yazarsın.",
    related_pages: [26, 27, 28, 30]
  },

  // ═══════════════════════════════════════════════════════
  // AMAL (SPIRITUAL WORKS)
  // ═══════════════════════════════════════════════════════
  {
    topic: "amal_hours", keywords: ["amel", "amal", "saatler", "yapılacak", "work hours"],
    page: 14, chapter: "AMEL YAPILACAK SAATLER",
    text: "Zühal saati; Bu saatte, tefrik, buğz, harab etmek ve erkeklik bağlamak gibi ameller yapılır. Müşteri saati; Bu saatte, muhabbet, erkeklerin ve kadınların yanında sevilmek, insanların gözlerine şirin görünmek gibi ameller yapılır. Merih saati; Bu saatte, taslit, tefrik, buğz, adavet ve mekandan çıkarmak gibi ameller yapılır. Şems saati; Bu saatte, muhabbet, şirinlik, heybetli görünmek ve büyükler yanında hacetin kabul olması gibi ameller yapılır. Zühre saati; Bu saatte, ateş, heyecanlandırmak, kadınları ve çocukları teshir etmek gibi ameller yapılır. Utârid saati; Bu saatte, dil bağlamak, hastalandırmak ve alimlerin yanında hacetin reva olması gibi ameller yapılır. Kamer saati; Bu saatte, dil bağlamak, bağlıyı çözmek, sihir ve tılsım bozmak gibi ameller yapılır.",
    related_pages: [13, 15]
  },
  {
    topic: "amal_celb_tard", keywords: ["celb", "tard", "getirtmek", "göndermek", "amal celb", "celb amal"],
    page: 35, chapter: "DOKUZ MİZAN",
    text: "Hangi amel olursa olsun, muradına uygun olan mizanlardan birisini bast edersin. Birşeyi getirtmek celb göndermek ise tard dır. Göndermek için tard kelimesini, getirtmek için celb kelimesini bast edersin. Ama her ikisindede (Celb, tard) Tarfetül ayn (طَرْفَةُالْعَيْنَ) kelimesini ekleyerek bast edersin.",
    related_pages: [34, 36, 37, 38]
  },
  {
    topic: "amal_muhabbet", keywords: ["muhabbet", "love", "sevgi", "muhabbet amal", "celb muhabbet"],
    page: 34, chapter: "DOKUZ MİZAN — 7. MİZAN",
    text: "Bir kimseye muhabbet yapmak istersen; جَلْبُ الْمَحَبَّةِ طَرْفَةُ الْعَيْنَ diye bast edersin.",
    related_pages: [26, 37, 43]
  },
  {
    topic: "amal_dusmanlik", keywords: ["düşmanlık", "adavet", "enmity", "tefrik", "buğz"],
    page: 34, chapter: "DOKUZ MİZAN — 7. MİZAN",
    text: "Bir kimseye düşmanlık yapmak istersen; طَرْدُ الْمَحَبَّةِ طَرْفَةُ الْعَيْنَ diye bast edersin.",
    related_pages: [14, 37]
  },
  {
    topic: "amal_hastalandirma", keywords: ["hastalandırmak", "hastane", "sickness", "disease"],
    page: 34, chapter: "DOKUZ MİZAN — 7. MİZAN",
    text: "Bir kimseyi hastalandırmak istersen; جَلْبُ السَّقَمِ طَرْفَةُ الْعَيْنَ diye bast edersin.",
    related_pages: [15, 37]
  },
  {
    topic: "amal_hastaiyi", keywords: ["iyileştirmek", "şifa", "healing", "cure", "hastayı iyileştirme"],
    page: 34, chapter: "DOKUZ MİZAN — 7. MİZAN",
    text: "Eğer hastayı iyileştirmek istersen; جَلْبُ الصِّحَّةِ طَرْفَةُ الْعَيْنَ diye bast edersin.",
    related_pages: [15, 37]
  },
  {
    topic: "amal_sihir_iptal", keywords: ["sihir iptali", "sihir bozma", "tılsım bozma", "cancel magic"],
    page: 73, chapter: "BASTI ADEDİ İLE DOKUZ MİZAN",
    text: "Yedinci bast; Amel sihir iptal etmek olduğundan, Tardis sihir tarfetül ayn ın harflerini bast ettik: طَرْدَالسِّحْرِطَرْفَتَالْعَيْنَ (8526)",
    related_pages: [72, 74, 75]
  },

  // ═══════════════════════════════════════════════════════
  // QASAM (OATH/CONJURATION)
  // ═══════════════════════════════════════════════════════
  {
    topic: "qasam_esmai_kasem", keywords: ["kasem", "qasam", "esmâ-i kasem", "oath", "yemin", "names of oath"],
    page: 49, chapter: "ESMÂ-İ KASEM",
    text: "Toplam oniki isim oldu. Bu isimlere Esmâ-i Kasem denir. Üç harf baki (شَ غَ صَ) kaldı. Esmâ-i kasemin evvelinden iki harf (مَ دَ) alır, bakide kalan harflerin sonuna ekleriz. Şu isim شُعْصَدَمْ olur. Böylece Esmâ-i Kasemi tamamlarsın.",
    related_pages: [57, 63, 66, 71, 72, 76, 77, 84]
  },
  {
    topic: "qasam_esmai_kasem_page57", keywords: ["kasem ismi", "qasam names", "esmai kasem list"],
    page: 57, chapter: "ESMÂ-İ KASEM",
    text: "Dokuz isim oldu. Bu isimlere Esmâ-i Kasem denir. İki harf baki kaldı (قَ نَ). Esmâ-i Kasemin ilk üç harfinden (قَ مَ ا) alır ve kalan iki harfin sonuna ekleriz. İsim şu şekilde نُقَامَقَ olur. Böylece Esmâ-i Kasem on isim oldu ve tamamlandı.",
    related_pages: [49, 63, 66, 71, 72, 84]
  },
  {
    topic: "qasam_dua_formula", keywords: ["qasam dua", "kasem duası", "celb", "muhabbet kasem", "çekme kasem"],
    page: 28, chapter: "VEFK YAPMANIN TEMELİ",
    text: "Ey Talib! Üçüncü mizandaki maksatlardan bazılarını bast edelimki taliblere kolaylık olsun: الْجَلْبُ - التَّشِيرُ - الْمَوَدَّةُ - جَلْبُ الْقُلُوبِ (204, 481, 481, 1301, 66). طَلَبُ الْمَالِ - طَلَبُ الْجَاهِ - طَلَبُ الْمَنْصِبِ - عَقْدِالِّلسَانَ (346, 224, 81, 143). عَقِدُالذِّكَرَ - حَلِّالذِّكَرَ - خَرَابُ الْمَكَانَ - الْأَخَرَاجَ الْمَكَانَ (1068, 945, 989, 1115). اَلطَّرَدَ - اَلْبُغَضَ - الْعَدَاوَةُ - اَلسَّقَمَ (231, 512, 1833, 244).",
    related_pages: [34, 35, 43]
  },

  // ═══════════════════════════════════════════════════════
  // DOKUZ MİZAN (NINE SCALES)
  // ═══════════════════════════════════════════════════════
  {
    topic: "dokuz_mizan_overview", keywords: ["dokuz mizan", "nine scales", "mizan", "9 mizan"],
    page: 32, chapter: "DOKUZ MİZAN",
    text: "Rumuzu künüz (Hazinelerin işareti) ve harflerin esrarı, dokuz mizan ile terkib edilmiştir. Bu dokuz mizan şu şekildedir. Birinci mizan; Talib ve matlub isimlerini hurufu mukatta' olarak bast etmektir. Eğer amelin iki kişi arasında muhabbet olmayıp, başka bir maksat içinse, o zaman maksadın her ne ise maksadını bast etmektir.",
    related_pages: [33, 34, 35, 38, 43, 67, 68, 73, 80, 81]
  },
  {
    topic: "mizan_1", keywords: ["birinci mizan", "first scale", "talib ismi", "matlub ismi", "isim bast"],
    page: 32, chapter: "DOKUZ MİZAN — 1. MİZAN",
    text: "Birinci mizan; Talib ve matlub isimlerini hurufu mukatta' olarak bast etmektir.",
    related_pages: [38, 41, 67]
  },
  {
    topic: "mizan_2", keywords: ["ikinci mizan", "second scale", "galip anasır", "dominant element"],
    page: 33, chapter: "DOKUZ MİZAN — 2. MİZAN",
    text: "İkinci mizan; Talib ve matlub isimlerini veya matlubun olan amelin harflerine bakıp, hangi anasır galip ise, o anasır harflerini bast edersin.",
    related_pages: [42, 43]
  },
  {
    topic: "mizan_3", keywords: ["üçüncü mizan", "third scale", "gündüz gece", "ennahar alleil"],
    page: 33, chapter: "DOKUZ MİZAN — 3. MİZAN",
    text: "Üçüncü mizan; Amel gündüz ise gündüz (اَلنَّهَارُ) gece ise gece (اَللَّيْلُ) kelimesinin harflerini bast edersin.",
    related_pages: [43, 67]
  },
  {
    topic: "mizan_4", keywords: ["dördüncü mizan", "fourth scale", "saat", "hour letters"],
    page: 33, chapter: "DOKUZ MİZAN — 4. MİZAN",
    text: "Dördüncü mizan; İçinde bulunduğumuz saat kaçıncı saat ise o saatin harflerini bast edersin. Oniki saatin yazılışı ve birinci bast adetleri şöyledir.",
    related_pages: [43, 67]
  },
  {
    topic: "mizan_5", keywords: ["beşinci mizan", "fifth scale", "günün harfleri", "day letters"],
    page: 33, chapter: "DOKUZ MİZAN — 5. MİZAN",
    text: "Beşinci mizan; İçinde bulunduğumuz gün hangi gün ise, o günün harflerini bast etmektir. Günlerin yazılışı ve birinci bast adetleri şöyledir: Pazar (الأَحَدُ - 2024), Pazartesi (الْإِثْنَيْنَ - 4001), Salı (الثَّلَاثَاءُ - 3784), Çarşamba (الْأَرْبَعَاءُ - 3491), Perşembe (الْخَمِيسُ - 3077), Cuma (الْجُمُعَةُ - 3399), Cumartesi (السَّبَّتُ - 2590).",
    related_pages: [43, 67]
  },
  {
    topic: "mizan_6", keywords: ["altıncı mizan", "sixth scale", "gezegen", "planet letters"],
    page: 34, chapter: "DOKUZ MİZAN — 6. MİZAN",
    text: "Altıncı mizan; O güne mensub olan gezegenin harflerini bast edersin. Yedi gezegenin yazılışı ve birinci bast adetleri şöyledir: (Zühal 2963, Müşteri 3189, Merih 3071, Şems 3071, Zühre 3070, Utarid 2029, Kamer 2665).",
    related_pages: [43, 67]
  },
  {
    topic: "mizan_7", keywords: ["yedinci mizan", "seventh scale", "hacet", "need", "want"],
    page: 34, chapter: "DOKUZ MİZAN — 7. MİZAN",
    text: "Yedinci mizan; Hacetin her ne ise, dört mizandan birini bast edersin. Dört mizan budur: 1. Mizan: جَلْبٌ (Kendine çekmek, getirtmek). 2. Mizan: طَرْدٌ (Kovmak, göndermek). 3. Mizan: صِحَّتٌ (Sağlık iyileştirmek). 4. Mizan: سُقْمٌ (Hastalandırmak).",
    related_pages: [35, 43]
  },
  {
    topic: "mizan_8", keywords: ["sekizinci mizan", "eighth scale", "hayır şer", "good evil", "elhayr elşer"],
    page: 35, chapter: "DOKUZ MİZAN — 8. MİZAN",
    text: "Sekizinci mizan; Amelin hayır ise hayır (اَلْخَيْرُ - 2731) şer ise şer (اَلشَّرُّ - 2725) kelimesini bast edersin.",
    related_pages: [43]
  },
  {
    topic: "mizan_9", keywords: ["dokuzuncu mizan", "ninth scale", "anasır derecesi", "element degree"],
    page: 35, chapter: "DOKUZ MİZAN — 9. MİZAN",
    text: "Dokuzuncu mizan; Hacetinle ilgili anasır derecelerini bast edersin. Her anasırın dört derecesi vardır. Bazı erbabı kulüb yanında su anasırının beş derecesi vardır.",
    related_pages: [35, 36, 37, 38]
  },

  // ═══════════════════════════════════════════════════════
  // SURAH (SÛRE)
  // ═══════════════════════════════════════════════════════
  {
    topic: "surah_fatiha", keywords: ["fatiha", "sûre-i fatiha", "surah fatiha"],
    page: 29, chapter: "BU İLMİN ŞARTLARI",
    text: "Eline kalemi (kamışı) alıp, kesmeye başlarsın. Kesme bitinceye kadar, Euzu Besmele ile, Sûre-i Fatiha ve Sûre-i İhlas'ı okusun. Vefkin kutup hanelerini yazarken, ihlaslı niyet ile yazarsın.",
    related_pages: [29]
  },
  {
    topic: "surah_ikhlas", keywords: ["ihlas", "sûre-i ihlas", "surah ikhlas"],
    page: 29, chapter: "BU İLMİN ŞARTLARI",
    text: "Kesme bitinceye kadar, Euzu Besmele ile, Sûre-i Fatiha ve Sûre-i İhlas'ı okusun.",
    related_pages: [29]
  },

  // ═══════════════════════════════════════════════════════
  // DUA
  // ═══════════════════════════════════════════════════════
  {
    topic: "dua_celb_qulub", keywords: ["dua celb kalb", "dua celb qulub", "قلوب", "heart attraction"],
    page: 28, chapter: "VEFK YAPMANIN TEMELİ",
    text: "جَلْبُ الْقُلُوبِ (1301) — Celb ul-Qulub (Drawing of Hearts) Amel value: 1301",
    related_pages: [34, 35]
  },
  {
    topic: "dua_protection", keywords: ["koruma duası", "himaye", "protection dua"],
    page: 29, chapter: "BU İLMİN ŞARTLARI",
    text: "Allah (celle celâlüh) tan daima havf (korku) üzere olmalıdır. Bu şartlara riayet edersen, amelin dürüst olup, istediğin muradında hasil olur. Allah (celle celâlüh) ın yardımıyla.",
    related_pages: [29, 30]
  },

  // ═══════════════════════════════════════════════════════
  // HADIM (SPIRITUAL SERVANT)
  // ═══════════════════════════════════════════════════════
  {
    topic: "hadim_esmai_avan", keywords: ["hadim", "esmâ-i avan", "yardımcı", "helper spirits", "avan"],
    page: 47, chapter: "ESMÂ-İ AVAN",
    text: "Toplam onbeş (15) isim oldu. Bu isimlere Esmâ-i A'van denir. Harf artmadı. Eğer, Esmâ-i A'vanda bir (1) veya daha fazla harf artarsa, bu artan harflere galip olan anasırın harflerin ekleyip, istintak ederiz. Harf artmadığı için Esmâ-i A'vanın son ismi olan Kaghamet isminin harflerine galip olan anasır toprak harflerini ekleriz.",
    related_pages: [46, 48, 55, 56, 62, 63, 65, 70, 76, 83]
  },
  {
    topic: "hadim_celb", keywords: ["celb hadim", "hadim celb", "ruhani hadim", "celbül mal"],
    page: 28, chapter: "VEFK YAPMANIN TEMELİ",
    text: "طَلَبُ الْمَالِ (346) — Taleb ul-Mal (Seeking Wealth). طَلَبُ الْجَاهِ (224) — Taleb ul-Jah (Seeking Status). طَلَبُ الْمَنْصِبِ (81) — Taleb ul-Mansib (Seeking Position).",
    related_pages: [34, 43]
  },

  // ═══════════════════════════════════════════════════════
  // PLANETS (GEZEGENLER)
  // ═══════════════════════════════════════════════════════
  {
    topic: "planets_overview", keywords: ["gezegenler", "planets", "yedi gezegen", "seven planets"],
    page: 12, chapter: "GEZEGENLER",
    text: "Yıldızlar sayılamayacak kadar çoktur. Ama itibar olunan yedi gezegen vardır. Bunlar; Zühal, Müşteri, Merih, Şems, Zühre, Utarid ve Kamer dir. Bu yedi gezegen, oniki (12) burca mensuptur.",
    related_pages: [13, 14, 15, 16]
  },
  {
    topic: "planets_incense", keywords: ["buhur", "tütsü", "incense", "gezegen buhuru"],
    page: 15, chapter: "GEZEGENLERİN BUHURLARI",
    text: "Zühal gezegeninin buhuru; Günlük ve Kizbere. Müşteri nin buhuru; Aslibent ve Buhuru meryem. Merih in buhuru; Meya, Senderus ve Mastaki. Şems in buhuru; Haslüban, Zaferan, Ud ve Beyazbiber. Zühre nin buhuru; Zaferan, Mastaki ve Haslüban. Utarid in buhuru; Muklil ezrak, Senderus ve Karanfil. Kamer in buhuru; Kündür, Ud ve Beyaz karanfil dir.",
    related_pages: [16]
  },
  {
    topic: "planets_days", keywords: ["günler", "days", "gezegen günü", "planet day"],
    page: 13, chapter: "SAATLER",
    text: "Şems; Pazar gününe, Kamer; Pazartesi gününe, Merih; Salı gününe, Utârid; Çarşamba gününe, Müşteri; Perşembe gününe, Zühre; Cuma gününe, Zühal; Cumartesi gününe mahsustur.",
    related_pages: [14, 15]
  },
  {
    topic: "planets_exaltation", keywords: ["şeref", "exaltation", "gezegen şerefi"],
    page: 15, chapter: "GEZEGENLERİN ŞEREFİ",
    text: "Güneş in şerefi Hamel burcundadır. Kamer in şerefi Sevr burcundadır. Utarid in şerefi Sünbüle burcundadır. Zühre nin şerefi Hût burcundadır. Merih in şerefi Cedi burcundadır. Müşteri nin şerefi Seretan burcundadır. Zühal in şerefi Mizan burcundadır.",
    related_pages: [16]
  },
  {
    topic: "planets_fortunate_unfortunate", keywords: ["said", "nahis", "fortunate", "unfortunate", "iyi kötü"],
    page: 16, chapter: "GEZEGENLERİN SAİD VE NAHİSLARI",
    text: "Gezegenler said (iyi) ve nahis (kötü) diye ikiye ayrılmıştır. 1. Zühal gezegeni nahıstır. 2. Müşteri gezegeni saidtir. 3. Merih gezegeni nahıstır. 4. Şems gezegeni saidtir. 5. Zühre gezegeni saidtir. 6. Utarid gezegeni mümtezic (birleşik) tir. İyi ile iyi kötü ilede kötü olur. 7. Kamer gezegeni saidtir.",
    related_pages: [15, 17]
  },
  {
    topic: "planets_sky_positions", keywords: ["kat gökte", "seventh heaven", "sky rank", "gökyüzü"],
    page: 16, chapter: "GEZEGENLERİN SANATI VE DOĞUŞU",
    text: "Zühal gezegeni yedinci kat gökte doğar ve göğün cellatıdır. Müşteri, altıncı kat gökte doğar ve göğün kadısı dır. Merih, beşinci kat gökte doğar ve göğün beyi dir. Şems, dördüncü kat gökte doğar ve göğün sultanıdır. Zühre, üçüncü kat gökte doğar ve göğün dansözüdür. Utarid ikinci kat gökte doğar ve göğün katibidir. Kamer, birinci kat gökte doğar ve göğün tabibidir.",
    related_pages: [12, 15]
  },

  // ═══════════════════════════════════════════════════════
  // ZODIAC (BURÇLAR)
  // ═══════════════════════════════════════════════════════
  {
    topic: "zodiac", keywords: ["burçlar", "zodiac", "burc", "12 burç"],
    page: 10, chapter: "BURÇLAR",
    text: "Burçlar oniki (12) adet olup sırasıyla söyledir; 1. burç Hamel (Koç), 2. burç Sevir (Boğa), 3. burç Cevza (İkizler), 4. burç Seretan (Yengeç), 5. burç Esed (Arslan), 6. burç Sünbüle (Başak), 7. burç Mizan (Terazi), 8. burç Akreb (Akrep), 9. burç Kavs (Yay), 10. burç Cedi (Oğlak), 11. burç Deliv (Kova) ve 12. burç Hut (Balık) burcudur.",
    related_pages: [11, 12, 15]
  },
  {
    topic: "zodiac_elements", keywords: ["burç anasır", "zodiac element", "ateş burcu", "toprak burcu"],
    page: 11, chapter: "BURÇLAR",
    text: "Hamel, Esed ve Kavs burçları ateş unsuruna mensubtur. Sevr, Sünbüle ve Cedi burçları ise toprak unsuruna mensubtur. Cevza, Mizan ve Deliv burçları ise, hava unsuruna mensubtur. Seretan, Akreb ve Hut burçları ise su unsuruna mensubtur.",
    related_pages: [12]
  },

  // ═══════════════════════════════════════════════════════
  // ABJAD / EBCED
  // ═══════════════════════════════════════════════════════
  {
    topic: "abjad_kebir", keywords: ["ebced", "abjad", "cemlü kebir", "büyük ebced", "ebcedi kebir"],
    page: 16, chapter: "EBCEDİ CEMLÜ KEBİR",
    text: "Ey Talib! Bilki; Bu ebced hesabında rakamlar ona (10) kadar birer birer (1), onla (10) yüz (100) arası onar onar (10) artar, yüzle (100) bin (1000) arası ise yüzer yüzer (100) artar. Cemlü kebir (Büyük ebced) hesabı aşağıdaki Cedveldeki gibidir.",
    related_pages: [17, 18]
  },
  {
    topic: "abjad_sagir", keywords: ["cemlü sağır", "küçük ebced", "ebcedi sagir"],
    page: 17, chapter: "EBCEDİ CEMLÜ SAĞİR",
    text: "Bilki; Bu ebcede Cemlü sağır (Küçük ebced) denir. Bu küçük ebced büyük ebced ten çıkmıştır. Yani ebcedi kebirdeki her harfin adedinden oniki oniki (12) çıkarılıp, baki kalan rakam o harfin karşılığıdır.",
    related_pages: [18]
  },
  {
    topic: "harflerin_anasiri", keywords: ["harflerin anasırı", "letter elements", "fire letters", "earth letters"],
    page: 18, chapter: "HARFLERİN ANASIRI",
    text: "Yirmisekiz (28) harf yediğerli olarak dört unsur (Ateş, toprak, hava ve su) dan birine mensup tur. Ateşe mensup olan harfler: أَطْهَفَشَذ — Ateşe mensub harflerin sayısal karşılığı 1135 tir. Toprağa mensub olan harfler: بُوِيصَنَتَضَ — Toprağa mensub harflerin sayısal karşılığı 1358 dir. Havaya mensub olan harfler: جَزَلَسَقَثَظَ — Havaya mensub harflerin sayısal karşılığı 1590 dır. Suya mensub olan harfler: دَخَلَعَوَرَخَغَ — Suya mensub harflerin sayısal karşılığı 1912 dir.",
    related_pages: [19, 31, 32]
  },

  // ═══════════════════════════════════════════════════════
  // DOMINANT / DOMINATED TABLE
  // ═══════════════════════════════════════════════════════
  {
    topic: "galip_maglup", keywords: ["galip", "mağlup", "dominant", "subdued", "galip mağlup"],
    page: 10, chapter: "GALİP VE MAĞLUP TABLOSU",
    text: "Ey Talib! Bilki; Akıl çift ve tekte galiptir. Çifte örnek verirsek; İki (2) dörde (4) galiptir. Teke örnek verirsek; Bir (1) üçe (3) galiptir. Muhalitte ise; Yani biri çift diğeri tek olursa, büyük sayı galiptir. Mesela; Üç (3) ikiye (2) galiptir.",
    related_pages: [11]
  },

  // ═══════════════════════════════════════════════════════
  // BAST / ISTINTAK
  // ═══════════════════════════════════════════════════════
  {
    topic: "bast_overview", keywords: ["bast", "bast harfleri", "açılmış", "yayılmış", "letter expansion"],
    page: 38, chapter: "BASTI ADEDİ İLE DOKUZ MİZAN",
    text: "Birinci mizan; Matlub olan harfleri hurufu mukatta' olarak bast ettik.",
    related_pages: [39, 40, 41, 42, 43, 44, 45, 49, 50, 51, 52, 53]
  },
  {
    topic: "bast_table", keywords: ["bast adedi cedveli", "bast table", "anasıra göre bast"],
    page: 52, chapter: "ANASIRA GÖRE BASTI ADEDİ CETVELİ",
    text: "Yirmişekiz (28) harf anasırı erbaa ya göre, birinci, ikinci, üçüncü, dördüncü ve beşinci bastları bu Basti adedi Cedvelinde gösterilmiştir. Sen iyi anla!",
    related_pages: [53]
  },
  {
    topic: "istintak", keywords: ["istintak", "extraction", "çıkarma"],
    page: 32, chapter: "ANASIRI ERBAA (İKİNCİ CÜZ)",
    text: "Bu harflerin ebcedi kebir karşılığı 1135 tir. Bu sayıyı istintak edersek; غَ قَ لَ هَ bu harfler olur.",
    related_pages: [33, 44, 45, 46]
  },

  // ═══════════════════════════════════════════════════════
  // ESMA (DIVINE NAMES)
  // ═══════════════════════════════════════════════════════
  {
    topic: "esmaullah", keywords: ["esmaullah", "esmâullah", "divine names", "allah isimleri", "esma"],
    page: 69, chapter: "BASTI ADEDİ İLE DOKUZ MİZAN",
    text: "Altı isim oldu. Bu isimlere Esmâ-i Kitabet denir. Meharicin toplamı ise 88 dir. Bu rakama münasib Esmaul Hüsna'dan isim veya isimler buluruz. حَلِيمٌ — Halim isminin ebced karşılığı 88 dir. Anla!",
    related_pages: [57, 61, 64, 65, 66, 70, 71, 72, 75, 76, 77, 84, 85]
  },
  {
    topic: "esma_final_85", keywords: ["esmâullah son", "final esma", "zülcelalil vikram", "gani", "mucni"],
    page: 85, chapter: "İKİNCİ CÜZ — SON",
    text: "Zülcelâli vel ikram ismi şerifi 1100, Gani ismi şerifi 1060, Muğni ismi şerifi 1100, Dâr ismi şerifi 1001, Hâfid ismi şerifi 1481, Gafur ismi şerifi 1286, Latif ismi şerifi 129, Kuddüs ismi şerifi 170, Veli ismi şerifi 46 ve Vâcid ismi şerifi 14 tür. Toplam 7387 dir.",
    related_pages: [84]
  },

  // ═══════════════════════════════════════════════════════
  // SPECIAL AMAL EXAMPLES FROM BOOK
  // ═══════════════════════════════════════════════════════
  {
    topic: "amal_sihir_bozma", keywords: ["sihir bozma", "tılsım bozma", "counter magic", "sihir iptal"],
    page: 72, chapter: "BASTI ADEDİ İLE DOKUZ MİZAN",
    text: "Birinci bast; Matlub sihir iptal etmek içindir. Matlub olan harfleri hurufu mukatta' olarak bast ettik (61.739). (Benim İstanbul da olan evlerim revac (kıymetli) olup, her can beden müşteriler zuhur edip, yirmibin (20.000) akçeye sattım. Alel tacil (acele) üzerinde sihir dahi var ise batıl olsun. Biiznillah).",
    related_pages: [73, 74, 75]
  },
  {
    topic: "amal_mal_celb", keywords: ["mal celbi", "zenginlik", "wealth", "money", "celbül mal"],
    page: 58, chapter: "BASTI ADEDİ İLE DOKUZ MİZAN",
    text: "Yedinci bast; Amel «Celbül mal» olduğu için, bu cümlenin harflerinde hurufu mukatta olarak bast ettik. جَلْبَالسِّعُهَبُالَّيْنَ (10.023) — Celb-ül mal tarfetül ayn.",
    related_pages: [67, 68, 73]
  },
  {
    topic: "amal_taslit_tefrik", keywords: ["taslit", "tefrik", "separation", "düşman", "split"],
    page: 14, chapter: "AMEL YAPILACAK SAATLER",
    text: "Merih saati; Bu saatte, taslit, tefrik, buğz, adavet ve mekandan çıkarmak gibi ameller yapılır. Zühal saati; Bu saatte, tefrik, buğz, harab etmek ve erkeklik bağlamak gibi ameller yapılır.",
    related_pages: [15, 26, 34]
  },

  // ═══════════════════════════════════════════════════════
  // BOOK COMPLETION
  // ═══════════════════════════════════════════════════════
  {
    topic: "book_end", keywords: ["kitap sonu", "son", "bitiş", "completion"],
    page: 85, chapter: "SON",
    text: "Allah (Celle celâlüh) ın yardımıyla Risale-i Samur Hindi isimli bu risale bitti. Sadeleştirmeye başlama tarihi: 17. Eylül.1994. Sadeleştirmenin bitiş tarihi: 15. Kasım.1994.",
    related_pages: [84]
  },
];

/**
 * Search the Samur Hindi index
 * @param {string} query - search term
 * @returns {Array} matching results sorted by relevance
 */
export function searchSamurHindi(query) {
  if (!query || query.trim().length < 2) return [];

  const q = query.toLowerCase().trim();
  const qArabic = query.trim();

  const results = [];

  for (const entry of KNOWLEDGE_INDEX) {
    let score = 0;

    // Check topic match
    if (entry.topic.toLowerCase().includes(q)) score += 10;

    // Check keywords
    for (const kw of entry.keywords) {
      if (kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase())) score += 5;
    }

    // Check text content
    if (entry.text.toLowerCase().includes(q)) score += 8;
    if (entry.text.includes(qArabic)) score += 8;

    // Check chapter
    if (entry.chapter.toLowerCase().includes(q)) score += 4;

    if (score > 0) {
      results.push({ ...entry, score });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get all entries for a specific page
 */
export function getPageEntries(pageNum) {
  return KNOWLEDGE_INDEX.filter(e => e.page === pageNum);
}

/**
 * Get chapter for a page number
 */
export function getChapterForPage(pageNum) {
  for (const ch of CHAPTERS) {
    if (pageNum >= ch.pages[0] && pageNum <= ch.pages[1]) return ch;
  }
  return null;
}

export default { searchSamurHindi, getPageEntries, getChapterForPage, KNOWLEDGE_INDEX, CHAPTERS, BOOK_META };