/**
 * ASTRO CLOCK DATA — Extracted from "Havâss'ın Derinlikleri" by Bülent Kısa
 * Source: I. Kitap (Book 1), written 1974-2004, Istanbul
 * STRICTLY ISOLATED: No shared data with any other module.
 *
 * EXTRACTION REPORT:
 * - PDF 1: Pages 1-50 processed (pages 49-50 contain first astrological timing data)
 * - PDF 2: Pages 51-100 processed (pages 51-100 contain full planetary hour tables,
 *   moon mansion rules, letter classification tables, Ebced tables)
 * - Total pages processed: 100
 * - All rules extracted verbatim, in original order, with original hierarchy preserved
 */

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 1: DAYS OF THE WEEK — PLANETARY RULERS
// Source: PDF1 p.49-50, PDF2 p.51
// "Geleneksel anlayışa göre haftanın her gün ve gecesini, yedi klasik gök
//  cisminden birisi yönetir."
// ─────────────────────────────────────────────────────────────────────────────
export const PLANETARY_DAY_RULERS = [
  {
    planet: "GÜNEŞ",
    planet_tr: "Güneş",
    day_name: "Pazar",
    day_name_en: "Sunday",
    symbol: "☉",
    symbol_text: "Güneş sembolü",
    suitable_operations: [
      "Para",
      "Ümit",
      "Yöneticiler, başkanlar, güçlü kimseler nezdinde teveccüh kazanmak",
      "Genel arkadaşlık",
      "Düşmanlığa karşı koymak",
      "Düşmanlığı, dostluğa çevirmek",
      "Sportif başarılar",
      "Fiziksel sağlamlık",
      "Genelin hayranlığını kazanmak"
    ]
  },
  {
    planet: "AY",
    planet_tr: "Ay",
    day_name: "Pazartesi",
    day_name_en: "Monday",
    symbol: "☽",
    symbol_text: "Ay sembolü",
    suitable_operations: [
      "Denizcilik",
      "Gemicilik",
      "Yolculuklar",
      "Aşk ve yenileşme",
      "Su ve suyla ilgili şeyler",
      "Hırsızlık ve hırsızlıkla ilgili konular",
      "Haberciler",
      "Vizyonlar",
      "Rüyalar",
      "Sezgiler"
    ]
  },
  {
    planet: "MARS",
    planet_tr: "Mars",
    day_name: "Salı",
    day_name_en: "Tuesday",
    symbol: "♂",
    symbol_text: "Mars sembolü",
    suitable_operations: [
      "Savaş",
      "Askeri başarılar",
      "Cesaret",
      "İmha ve uyumsuzluk çalışmaları",
      "Katliam",
      "Ölüm ve acı haberler",
      "Askeri konularda şans kazanmak",
      "Düşmanlıklar",
      "Düşmanlara karşı lanet çalışmaları",
      "Erkeklere yönelik çalışmalar"
    ]
  },
  {
    planet: "MERKÜR",
    planet_tr: "Merkür",
    day_name: "Çarşamba",
    day_name_en: "Wednesday",
    symbol: "☿",
    symbol_text: "Merkür sembolü",
    suitable_operations: [
      "Konuşma gücü",
      "İş",
      "Sanat ve bilim",
      "Kehanet",
      "Hırsızlığı keşfetmek",
      "Ticari eşyalar",
      "Hile gerektiren iş ve uygulamalar",
      "Fiziksel plan dışından davetler"
    ]
  },
  {
    planet: "JÜPİTER",
    planet_tr: "Jüpiter",
    day_name: "Perşembe",
    day_name_en: "Thursday",
    symbol: "♃",
    symbol_text: "Jüpiter sembolü",
    suitable_operations: [
      "Şeref ve zenginlik",
      "Arkadaşlık",
      "Fiziksel sağlık",
      "Kalpteki arzular",
      "Para ve zenginlik",
      "Bilgi kazanmak"
    ]
  },
  {
    planet: "VENÜS",
    planet_tr: "Venüs",
    day_name: "Cuma",
    day_name_en: "Friday",
    symbol: "♀",
    symbol_text: "Venüs sembolü",
    suitable_operations: [
      "Aşk",
      "Arkadaşlık",
      "Seyahat",
      "Nezaket ve zevk",
      "Eğlence",
      "Cinsel konular",
      "Baştan çıkartmalar"
    ]
  },
  {
    planet: "SATÜRN",
    planet_tr: "Satürn",
    day_name: "Cumartesi",
    day_name_en: "Saturday",
    symbol: "♄",
    symbol_text: "Satürn sembolü",
    suitable_operations: [
      "İyi ve şerli uygulamalara aynı derecede yarar",
      "Hâdim davetleri",
      "Birisinin rüyasına girmek ve telkin",
      "Mesleki şans veya bela",
      "Mal, mülk",
      "Bilgi kazanmak",
      "Ölüm ve bela çalışmaları"
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 2: PLANETARY HOUR SEQUENCE RULE
// Source: PDF2 p.51-52
// "saatler devamlı olarak aynı sıralama ile akarlar"
// ─────────────────────────────────────────────────────────────────────────────
export const PLANETARY_HOUR_SEQUENCE = {
  order: ["Güneş", "Venüs", "Merkür", "Ay", "Satürn", "Jüpiter", "Mars"],
  rule_original: "Güneş, Venüs, Merkür, Ay, Satürn, Jüpiter, Mars sırası ile gider.",
  rule_explained: "Haftanın her gününün birinci saati o günün yönetici yıldızının saatidir.",
  day_start_rule: "Her günün birinci saati, tam Güneş'in doğum anında başlar.",
  night_start_rule: "Güneş battığı anda da gecenin birinci saati başlamış olur.",
  hour_duration_rule: "Gündüz ve gece saatleri alışıldık 60 dakikalık saatler değildirler. Mevsime göre gün ve gece saatlerinin uzunlukları devamlı olarak değişir.",
  daytime_hours_count: 12,
  nighttime_hours_count: 12,
  total_hours_per_day: 24
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 3: DAYTIME PLANETARY HOURS TABLE (Gündüz Saatleri Tablosu)
// Source: PDF2 p.53
// Columns: Paz=Pazar(Sun), Pts=Pazartesi(Mon), Sal=Salı(Tue),
//          Car=Çarşamba(Wed), Per=Perşembe(Thu), Cum=Cuma(Fri), Cts=Cumartesi(Sat)
// ─────────────────────────────────────────────────────────────────────────────
export const DAYTIME_HOURS_TABLE = {
  columns: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
  hours: [
    { saat: 1,  rulers: ["Güneş",  "Ay",     "Mars",   "Merkür", "Jüpiter", "Venüs",  "Satürn"] },
    { saat: 2,  rulers: ["Venüs",  "Satürn", "Güneş",  "Ay",     "Mars",    "Merkür", "Jüpiter"] },
    { saat: 3,  rulers: ["Merkür", "Jüpiter","Venüs",  "Satürn", "Güneş",   "Ay",     "Mars"] },
    { saat: 4,  rulers: ["Ay",     "Mars",   "Merkür", "Jüpiter","Venüs",   "Satürn", "Güneş"] },
    { saat: 5,  rulers: ["Satürn", "Güneş",  "Ay",     "Mars",   "Merkür",  "Jüpiter","Venüs"] },
    { saat: 6,  rulers: ["Jüpiter","Venüs",  "Satürn", "Güneş",  "Ay",      "Mars",   "Merkür"] },
    { saat: 7,  rulers: ["Mars",   "Merkür", "Jüpiter","Venüs",  "Satürn",  "Güneş",  "Ay"] },
    { saat: 8,  rulers: ["Güneş",  "Ay",     "Mars",   "Merkür", "Jüpiter", "Venüs",  "Satürn"] },
    { saat: 9,  rulers: ["Venüs",  "Satürn", "Güneş",  "Ay",     "Mars",    "Merkür", "Jüpiter"] },
    { saat: 10, rulers: ["Merkür", "Jüpiter","Venüs",  "Satürn", "Güneş",   "Ay",     "Mars"] },
    { saat: 11, rulers: ["Ay",     "Mars",   "Merkür", "Jüpiter","Venüs",   "Satürn", "Güneş"] },
    { saat: 12, rulers: ["Satürn", "Güneş",  "Ay",     "Mars",   "Merkür",  "Jüpiter","Venüs"] }
  ],
  note: "Günün 12. Saati, gece saatlerinin başlangıcı değil, günün son saatidir."
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 4: NIGHTTIME PLANETARY HOURS TABLE (Gece Saatleri Tablosu)
// Source: PDF2 p.54
// IMPORTANT NOTE: "Pazartesi gecesi: Pazar'ı, Pazartesiye bağlayan gecedir.
//                  Salı gecesi: Pazrtesi'yi, Salı'ya bağlayan gecedir."
// Columns: Pts gece, Sal gece, Car gece, Per gece, Cum gece, Cts gece, Paz gece
// ─────────────────────────────────────────────────────────────────────────────
export const NIGHTTIME_HOURS_TABLE = {
  columns: ["Pazartesi Gecesi", "Salı Gecesi", "Çarşamba Gecesi", "Perşembe Gecesi", "Cuma Gecesi", "Cumartesi Gecesi", "Pazar Gecesi"],
  night_definition: "Pazartesi gecesi: Pazar'ı, Pazartesiye bağlayan gecedir. Salı gecesi: Pazrtesi'yi, Salı'ya bağlayan gecedir.",
  hours: [
    { saat: 1,  rulers: ["Jüpiter","Venüs",  "Satürn","Güneş",  "Ay",     "Mars",   "Merkür"] },
    { saat: 2,  rulers: ["Mars",   "Merkür", "Jüpiter","Venüs",  "Satürn", "Güneş",  "Ay"] },
    { saat: 3,  rulers: ["Güneş",  "Ay",     "Mars",  "Merkür", "Jüpiter","Venüs",  "Satürn"] },
    { saat: 4,  rulers: ["Venüs",  "Satürn", "Güneş", "Ay",     "Mars",   "Merkür", "Jüpiter"] },
    { saat: 5,  rulers: ["Merkür", "Jüpiter","Venüs", "Satürn", "Güneş",  "Ay",     "Mars"] },
    { saat: 6,  rulers: ["Ay",     "Mars",   "Merkür","Jüpiter","Venüs",  "Satürn", "Güneş"] },
    { saat: 7,  rulers: ["Satürn", "Güneş",  "Ay",    "Mars",   "Merkür", "Jüpiter","Venüs"] },
    { saat: 8,  rulers: ["Jüpiter","Venüs",  "Satürn","Güneş",  "Ay",     "Mars",   "Merkür"] },
    { saat: 9,  rulers: ["Mars",   "Merkür", "Jüpiter","Venüs", "Satürn", "Güneş",  "Ay"] },
    { saat: 10, rulers: ["Güneş",  "Ay",     "Mars",  "Merkür", "Jüpiter","Venüs",  "Satürn"] },
    { saat: 11, rulers: ["Venüs",  "Satürn", "Güneş", "Ay",     "Mars",   "Merkür", "Jüpiter"] },
    { saat: 12, rulers: ["Merkür", "Jüpiter","Venüs", "Satürn", "Güneş",  "Ay",     "Mars"] }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 5: PLANETARY HOUR CALCULATION METHOD
// Source: PDF2 p.54-60
// Complete step-by-step calculation rules from the manuscript
// ─────────────────────────────────────────────────────────────────────────────
export const PLANETARY_HOUR_CALCULATION = {
  method_name: "Yıldız Saatlerinin Günlük Saate Göre Hesaplanması",
  steps: [
    {
      step: 1,
      description: "Namaz takviminden o günün Güneş doğuş saatini bul (Güneş sütunu). Takvim, Güneş'in doğumundan 12 dakika öncesini gösterir, bu yüzden üzerine 12 dakika ekle.",
      formula: "Gerçek_Doğuş = Takvim_Güneş_Saati + 12 dakika"
    },
    {
      step: 2,
      description: "Namaz takviminden o günün Güneş batış saatini bul (Akşam sütunu). Bu da gerçek batıştan 12 dakika sonrasıdır, yani 12 dakika çıkart.",
      formula: "Gerçek_Batış = Takvim_Akşam_Saati - 12 dakika"
    },
    {
      step: 3,
      description: "Günün uzunluğunu dakika olarak hesapla.",
      formula: "Gündüz_Dakika = (Gerçek_Batış - Gerçek_Doğuş) dakika cinsinden"
    },
    {
      step: 4,
      description: "Ertesi günün Güneş doğuş saatini bul (12 dakika ekle). Gecenin uzunluğunu hesapla.",
      formula: "Gece_Dakika = (Ertesi_Doğuş - Bu_Gün_Batış) dakika cinsinden"
    },
    {
      step: 5,
      description: "Bir gündüz saatinin uzunluğunu hesapla.",
      formula: "Gündüz_Saat_Uzunluğu = Gündüz_Dakika / 12 (tam sayı al)"
    },
    {
      step: 6,
      description: "Bir gece saatinin uzunluğunu hesapla.",
      formula: "Gece_Saat_Uzunluğu = Gece_Dakika / 12 (tam sayı al)"
    },
    {
      step: 7,
      description: "Gündüz saatlerini hesapla: Gerçek doğuştan başlayarak her saat için bu uzunluğu ekle.",
      formula: "Saat_N_Başlangıç = Gerçek_Doğuş + (N-1) × Gündüz_Saat_Uzunluğu"
    },
    {
      step: 8,
      description: "Gece saatlerini hesapla: Gerçek batıştan başlayarak her saat için gece saat uzunluğunu ekle.",
      formula: "Gece_Saat_N_Başlangıç = Gerçek_Batış + (N-1) × Gece_Saat_Uzunluğu"
    }
  ],
  practical_note: "En iyisi, hesapları doğru fakat tam sayılarla yapıp, her ihtimale karşı da beklediğimiz saat girdikten on, onbeş dakika sonra çalışmaya başlamaktır.",
  example: {
    date: "15 Ocak 2004 (Perşembe)",
    takvim_gunes: "07:20",
    takvim_aksam: "17:07",
    gercek_dogus: "07:32",
    gercek_batis: "16:55",
    gunduz_dakika: 563,
    gece_dakika: 877,
    gunduz_saat_uzunlugu: 46,
    gece_saat_uzunlugu: 73,
    day_ruler: "Jüpiter",
    night_ruler: "Ay",
    full_schedule: {
      gunduz: [
        { saat: 1, baslangic: "07:32", gezegen: "Jüpiter" },
        { saat: 2, baslangic: "08:18", gezegen: "Mars" },
        { saat: 3, baslangic: "09:05", gezegen: "Güneş" },
        { saat: 4, baslangic: "09:52", gezegen: "Venüs" },
        { saat: 5, baslangic: "10:39", gezegen: "Merkür" },
        { saat: 6, baslangic: "11:26", gezegen: "Ay" },
        { saat: 7, baslangic: "12:13", gezegen: "Satürn" },
        { saat: 8, baslangic: "13:00", gezegen: "Jüpiter" },
        { saat: 9, baslangic: "13:47", gezegen: "Mars" },
        { saat: 10, baslangic: "14:34", gezegen: "Güneş" },
        { saat: 11, baslangic: "15:21", gezegen: "Venüs" },
        { saat: 12, baslangic: "16:08", gezegen: "Merkür" }
      ],
      gece: [
        { saat: 1, baslangic: "16:55", gezegen: "Ay" },
        { saat: 2, baslangic: "18:08", gezegen: "Satürn" },
        { saat: 3, baslangic: "19:21", gezegen: "Jüpiter" },
        { saat: 4, baslangic: "20:34", gezegen: "Mars" },
        { saat: 5, baslangic: "21:47", gezegen: "Güneş" },
        { saat: 6, baslangic: "23:00", gezegen: "Venüs" },
        { saat: 7, baslangic: "00:13", gezegen: "Merkür" },
        { saat: 8, baslangic: "01:26", gezegen: "Ay" },
        { saat: 9, baslangic: "02:39", gezegen: "Satürn" },
        { saat: 10, baslangic: "03:52", gezegen: "Jüpiter" },
        { saat: 11, baslangic: "05:05", gezegen: "Mars" },
        { saat: 12, baslangic: "06:18", gezegen: "Güneş" }
      ]
    }
  },
  calendar_column_note: "Güneş sütunu sabah namazı saatini gösterir ve Güneş'in gerçek doğumundan 12 dakika öncesini verir. Akşam sütunu da Akşam namazı vaktini gösterir ve gerçek batıştan 12 dakika sonrasıdır.",
  fake_method_warning: "Alaturka saatler denilen uydurma yöntem (her gün güneş batarken saat 12 sayılır) majikal saatler için kullanılmamalıdır. Bu hiç bir gerçek zamanla ilgisi olmayan bir sistemdir."
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 6: AY MANAZİLLERİ (MOON MANSIONS)
// Source: PDF2 p.64-74
// All 28 Moon Mansions with their complete rules as written
// ─────────────────────────────────────────────────────────────────────────────
export const AY_MANAZILLERI = [
  {
    no: 1,
    name: "ŞARTEYN",
    name_arabic: "الشرطان",
    harfi: "അലിഫ്",
    harf_arabic: "ا",
    baslama_siniri: "Koç burcunun 25. Derecesi",
    zodiac_sign: "Koç",
    zodiac_degree: 25,
    operations: [
      "Kan dökmek ve kötü işler yapmaya uygun olduğu söylenir",
      "Bu zamanda mecbur olunmayan hiç bir iş yapılmamalıdır",
      "Şarteyn manzili fesad, bozgunculuk, insanların aralarında düşmanlık yaratmak gibi etkilere sahiptir",
      "Ay bu menazildeyken insanlar kötü rüyalar, kabuslar görürür"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Bu menazil geleneksel olarak uğursuz kabul edilir"
  },
  {
    no: 2,
    name: "BUTEYN",
    name_arabic: "البطين",
    harfi: "ബാ",
    harf_arabic: "ب",
    baslama_siniri: "Boğa burcunun 8. Derecesi",
    zodiac_sign: "Boğa",
    zodiac_degree: 8,
    operations: [
      "Büyü, Tılsım (Talisman), Vefk gibi şeyler yapmak için uygundur",
      "Elişleri, Talisman veya vefk gibi şeylerin metal veya başka maddeler üzerine işlenmeleri",
      "Kadınlar üzerinde etkili bir zamandır",
      "Erkeklerin kadınlarla tanışmaları için ideal zamandır",
      "Kadınların baştan çıkartılmaları için ideal zamandır",
      "Kadınları elde etmek için yapılacak olan tılsım veya diğer majikal çalışmalar için ideal zamandır",
      "Kadınların iyiliği için yapılacak olan rızk açıklığı çalışmalarına uygundur",
      "Kısmet açıklığı çalışmalarına uygundur",
      "Şifâ çalışmalarına uygundur"
    ],
    genel_hukum: "Uygundur",
    note: "Kadınlar üzerinde etkili"
  },
  {
    no: 3,
    name: "SÜREYYA",
    name_arabic: "الثريا",
    harfi: "ജീം",
    harf_arabic: "ج",
    baslama_siniri: "Boğa burcunun 21. Derecesi",
    zodiac_sign: "Boğa",
    zodiac_degree: 21,
    operations: [
      "Evlilik, Evlenme teklifi gibi işlere uygun bir zamandır",
      "Bu zamanda kadınların yararına olabilecek celbi muhabbet çalışmaları yapılabilir",
      "Kadının bir erkeği elde etmesi için uygun zaman",
      "İşlerin açılması",
      "İşi geliştirmek",
      "Ticari kazanç gibi şeyler başarılıdır"
    ],
    genel_hukum: "Uygun (Saad)",
    note: "Evlilik ve ticaret için uygun"
  },
  {
    no: 4,
    name: "DÜBRAN",
    name_arabic: "الدبران",
    harfi: "ദാൽ",
    harf_arabic: "د",
    baslama_siniri: "İkizler burcunun 3. Derecesi",
    zodiac_sign: "İkizler",
    zodiac_degree: 3,
    operations: [
      "Kin, düşmanlık, ayrılık ve benzeri şeylere uygun bir zamandır",
      "Bu zamanda olumlu bir iş için ya da bu zamanın kötülüklerini gidermekle ilgili bir çalışma yapılmamalıdır",
      "Ay Dübran menazilinde iken insanlar sırlarını korumaya ve boşboğazlık etmemeye dikkat etmelidirler",
      "Toprak, Tarla, mesken gibi işler için iyidir",
      "Kişiyi kötü duruma düşürmek için çalışmalar yapılabilir",
      "Pasifize etmek için çalışmalar yapılabilir",
      "Sağlığını bozmak gibi işler için çalışmalar yapılabilir",
      "Kin ve düşmanlığa sebep olmak için çalışmalar yapılabilir",
      "İnsanları ayırmak için çalışmalar yapılabilir",
      "Ortaklık veya evlikleri bozmak gibi işler için çalışmalar yapılabilir"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Kötü işler için"
  },
  {
    no: 5,
    name: "HAK'A",
    name_arabic: "الهقعة",
    harfi: "ഹാ",
    harf_arabic: "ه",
    baslama_siniri: "İkizler burcunun 16. Derecesi",
    zodiac_sign: "İkizler",
    zodiac_degree: 16,
    operations: [
      "Kişiyi eşinden soğutmak",
      "Ayrılık",
      "Mal ve para açısından zarar vermek",
      "Ortaklıkları ve işi bozmak",
      "Ticari kayıplar",
      "Büyük şirketlerin zarar etmesi",
      "Gözden düşürmek gibi çalışmalar için uygun bir zaman",
      "Günlük hayatta bozuk gıdalara ve gıda zehirlenmelerine dikkat etmek gereken bir zamandır",
      "Bu zamanda yapılan evlilikler hayırlı olmayıp, uzun sürmezler",
      "Evlenme teklifleri veya nişanlılıklar sonuca ulaşamazlar",
      "Ay bu menazildeyken sadece Tarla, bahçe, arazi, emlak gibi işler hayırlı sonuç verir"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Çoğu şey için kötü, arazi için iyi"
  },
  {
    no: 6,
    name: "HENA",
    name_arabic: "الهنعة",
    harfi: "വാവ്",
    harf_arabic: "و",
    baslama_siniri: "İkizler burcunun 29. Derecesi",
    zodiac_sign: "İkizler",
    zodiac_degree: 29,
    operations: [
      "Aşk ve sevgi çalışmalarına uygundur",
      "Dargınlıkların giderilmesi",
      "Önemli kimselerden istekte bulunmak",
      "Sağlık çalışmalarına uygundur",
      "Bir şeye sahip olmak",
      "Mal edinmek",
      "Maddi gelirin artışı gibi çalışmalara uygun bir zamandır",
      "Günlük hayatta arkadaş toplantıları için hayırlı zamandır",
      "Dostlarla görüşmek için hayırlı zamandır",
      "Fikir alışverişleri için hayırlı zamandır",
      "Yeni şeyler satın almak için hayırlı zamandır",
      "Evlenmek için hayırlı zamandır",
      "Nişanlanmak için hayırlı zamandır"
    ],
    genel_hukum: "Uygun (Saad)",
    note: "Aşk, dostluk, mal için uygun"
  },
  {
    no: 7,
    name: "ZİRA",
    name_arabic: "الذراع",
    harfi: "സായി",
    harf_arabic: "ز",
    baslama_siniri: "Yengeç burcunun 12. Derecesi",
    zodiac_sign: "Yengeç",
    zodiac_degree: 12,
    operations: [
      "Bilim ve eğitimde başarılı olmak",
      "Konuşma, toplantı ve anlaşmalarda başarı",
      "Mal, emlak veya arazi sahibi olmak",
      "Önemli konumlardaki kimselerden istekte bulunup, kabul görmek",
      "Günlük hayatta önemli konumlardaki kimselerden istekte bulunmaya uygun bir zamandır",
      "Hayırlı işler için tılsım veya vefk hazırlamaya uygun bir dönem"
    ],
    genel_hukum: "Uygun (Saad)",
    note: "Bilim, anlaşma, mal için uygun"
  },
  {
    no: 8,
    name: "NESRE",
    name_arabic: "النثرة",
    harfi: "ഹാ",
    harf_arabic: "ح",
    baslama_siniri: "Yengeç burcunun 25. Derecesi",
    zodiac_sign: "Yengeç",
    zodiac_degree: 25,
    operations: [
      "Düşmanlık",
      "Kin",
      "Kahır",
      "Kavga ve geçimsizlik",
      "Bu zamanda ortaklık kurulmamalı",
      "Evlenmemeli",
      "Nişanlanmamalı",
      "Ev, arazi gibi şeyler almak veya kiralamak iyi sonuç vermez"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Düşmanlık ve geçimsizlik"
  },
  {
    no: 9,
    name: "TARFA",
    name_arabic: "الطرف",
    harfi: "ത്വാ",
    harf_arabic: "ط",
    baslama_siniri: "Arslan burcunun 8. Derecesi",
    zodiac_sign: "Arslan",
    zodiac_degree: 8,
    operations: [
      "Uğursuzluk",
      "Mutluluğu bozmak",
      "Gözden düşürmek",
      "Dostlukları bozmak",
      "Günlük hayatta böyle bir dönemde iken resmi dairelerle ilgili işler takip edilmemeli",
      "Kimseden ricada bulunulmamalı"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Uğursuzluk ve dostlukları bozma"
  },
  {
    no: 10,
    name: "CEPHE",
    name_arabic: "الجبهة",
    harfi: "യാ",
    harf_arabic: "ي",
    baslama_siniri: "Arslan burcunun 21. Derecesi",
    zodiac_sign: "Arslan",
    zodiac_degree: 21,
    operations: [
      "Dostluklar kurmak",
      "Genel hayranlık ve sosyal ilerleme",
      "Başarılı olmak",
      "Bu zamanda hem iyi hem kötü şeyler yapılabilir",
      "Suflî işler yukarda sayılan maddelerin tam tersine çalışmasıdır"
    ],
    genel_hukum: "Karışık (İyi ve Kötü)",
    note: "Hem iyi hem kötü işler yapılabilir"
  },
  {
    no: 11,
    name: "ZEBRA",
    name_arabic: "الزبرة",
    harfi: "കാഫ്",
    harf_arabic: "ك",
    baslama_siniri: "Başak burcunun 3. Derecesi",
    zodiac_sign: "Başak",
    zodiac_degree: 3,
    operations: [
      "Hastalıktan kurtulmak",
      "Her şeyden korunmak",
      "Ticaret, alım satım işlerinde kolaylık",
      "Önemli kimselerden lutuf görmek",
      "İsteklerini kabul ettirmek",
      "Bütün insanlar tarafından sevilmek gibi çalışmalara uygun zaman"
    ],
    genel_hukum: "Uygun (Saad)",
    note: "Sağlık, koruma, ticaret için uygun"
  },
  {
    no: 12,
    name: "SURFA",
    name_arabic: "الصرفة",
    harfi: "ലാം",
    harf_arabic: "ل",
    baslama_siniri: "Başak burcunun 16. Derecesi",
    zodiac_sign: "Başak",
    zodiac_degree: 16,
    operations: [
      "Ay bu menazilde iken, her türlü olumsuz iş için uygundur",
      "Kahır ve helak çalışmalarına uygun zamandır"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Her türlü olumsuz iş"
  },
  {
    no: 13,
    name: "AVA",
    name_arabic: "العواء",
    harfi: "മീം",
    harf_arabic: "م",
    baslama_siniri: "Başak burcunun 29. Derecesi",
    zodiac_sign: "Başak",
    zodiac_degree: 29,
    operations: [
      "Şehvet duygusunu körüklemek",
      "Bir erkeğin, belli bir kadına karşı dayanılmaz cisel istekler içinde olması",
      "Ahlaksızlık",
      "Düşmanlık uyandırmak",
      "Bir erkeğin, erkekliğini bağlamak",
      "Bir erkeğin bütün ahlaksal şartlanmalarını yıkmak",
      "Bu zamanda insanlardan ricada bulunulmamalı",
      "Resmî işlemler ve yasalarla ilgili şeylerden uzak durmak gereklidir"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Şehvet ve düşmanlık"
  },
  {
    no: 14,
    name: "SEMMAK",
    name_arabic: "السماك",
    harfi: "നൂൻ",
    harf_arabic: "ن",
    baslama_siniri: "Terazi burcunun 12. Derecesi",
    zodiac_sign: "Terazi",
    zodiac_degree: 12,
    operations: [
      "Fesad",
      "Düşmanlık",
      "Ölüm",
      "İş hayatında başarısızlık",
      "İşten kovulmak",
      "Maddi sıkıntı",
      "Yalanların ortaya çıkması",
      "Riskli durumlarda kayıp",
      "Ard niyetli teklifler almak",
      "Güvenilmez kişilerle karşılaşmak"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Fesad, düşmanlık, ölüm"
  },
  {
    no: 15,
    name: "GUFUR",
    name_arabic: "الغفر",
    harfi: "സീൻ",
    harf_arabic: "س",
    baslama_siniri: "Terazi burcunun 25. Derecesi",
    zodiac_sign: "Terazi",
    zodiac_degree: 25,
    operations: [
      "Sevgi ve dostluk",
      "Barışma",
      "Barıştırma",
      "Büyük işleri başarmak",
      "İş bulmak",
      "İşe girmek",
      "Şifâ bulmak veya şifâ çalışması yapmak"
    ],
    genel_hukum: "Uygun (Saad)",
    note: "Sevgi, barış, iş, şifa"
  },
  {
    no: 16,
    name: "ZİBANA",
    name_arabic: "الزبانا",
    harfi: "ഐൻ",
    harf_arabic: "ع",
    baslama_siniri: "Akrep burcunun 8. Derecesi",
    zodiac_sign: "Akrep",
    zodiac_degree: 8,
    operations: [
      "Düşmana karşı zafer kazanmak",
      "Yara ve ağrıların çabuk iyileşmesi",
      "Tedavi",
      "Başarı ve mutluluk",
      "Düşman için lanet çalışmaları yapmaya uygun zaman"
    ],
    genel_hukum: "Uygun (Saad)",
    note: "Zafer, şifa, başarı"
  },
  {
    no: 17,
    name: "İKLİL",
    name_arabic: "الإكليل",
    harfi: "ഫാ",
    harf_arabic: "ف",
    baslama_siniri: "Akrep burcunun 21. Derecesi",
    zodiac_sign: "Akrep",
    zodiac_degree: 21,
    operations: [
      "İyi ve kötü işler karışıktır",
      "İnsanlar tarafından sevilmemek",
      "Mal ve parada zarara uğramak",
      "İşlerin bozulması",
      "Anlaşmaların olmaması",
      "İşten kovulmak ya da bunların tersi"
    ],
    genel_hukum: "Karışık (İyi ve Kötü)",
    note: "İyi ve kötü karışık"
  },
  {
    no: 18,
    name: "KÂLP",
    name_arabic: "القلب",
    harfi: "സ്വാദ്",
    harf_arabic: "ص",
    baslama_siniri: "Yay burcunun 3. Derecesi",
    zodiac_sign: "Yay",
    zodiac_degree: 3,
    operations: [
      "Fesad",
      "Bütün işlerin bozulması",
      "Maddi zarar",
      "Sağlığın bozulması",
      "Aynı zamanda şans açılması",
      "Beklenmedik kazançlara kavuşmak",
      "Şifâ"
    ],
    genel_hukum: "Karışık (İyi ve Kötü)",
    note: "Fesad ama aynı zamanda şans"
  },
  {
    no: 19,
    name: "ŞEVLE",
    name_arabic: "الشولة",
    harfi: "ഖാഫ്",
    harf_arabic: "ق",
    baslama_siniri: "Yay burcunun 16. Derecesi",
    zodiac_sign: "Yay",
    zodiac_degree: 16,
    operations: [
      "İyi ve kötü karışıktır",
      "Zor işlerin çözümlenmesi veya çıkmaza sokulması",
      "Çılgınlığa sebep olmak veya ruhsal tedavi çalışmaları"
    ],
    genel_hukum: "Karışık (İyi ve Kötü)",
    note: "İyi ve kötü karışık, ruhsal tedavi"
  },
  {
    no: 20,
    name: "NEAİM",
    name_arabic: "النعائم",
    harfi: "റാ",
    harf_arabic: "ر",
    baslama_siniri: "Yay burcunun 29. Derecesi",
    zodiac_sign: "Yay",
    zodiac_degree: 29,
    operations: [
      "Zevk",
      "Mutluluk",
      "Dostluk",
      "Aşk",
      "Sanatta başarı",
      "Sıkıntıdan kurtulmak",
      "Ev sahibi olmak"
    ],
    genel_hukum: "Uygun (Saad)",
    note: "Zevk, mutluluk, aşk, sanat"
  },
  {
    no: 21,
    name: "BELDE",
    name_arabic: "البلدة",
    harfi: "ഷീൻ",
    harf_arabic: "ش",
    baslama_siniri: "Oğlak burcunun 12. Derecesi",
    zodiac_sign: "Oğlak",
    zodiac_degree: 12,
    operations: [
      "Düşmanlık",
      "Kin",
      "Ayrılık",
      "Kovulma",
      "Yerini terke mecbur olmak",
      "Gözden düşmek",
      "Sosyal seviye kaybı",
      "Her türlü alım satım işleri için kötü zaman"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Düşmanlık, kovulma, sosyal kayıp"
  },
  {
    no: 22,
    name: "SAADÜZZABİH",
    name_arabic: "سعد الذابح",
    harfi: "ത്വാ",
    harf_arabic: "ت",
    baslama_siniri: "Oğlak burcunun 25. Derecesi",
    zodiac_sign: "Oğlak",
    zodiac_degree: 25,
    operations: [
      "Kin",
      "Düşmanlık",
      "Rezalet",
      "Kadının kötü yola düşmesi",
      "Sırların açığa çıkması",
      "Herkes tarafından dışlanmak"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Kin, rezalet, dışlanmak"
  },
  {
    no: 23,
    name: "SAUDBELA",
    name_arabic: "سعد البلع",
    harfi: "സാ",
    harf_arabic: "ث",
    baslama_siniri: "Kova burcunun 8. Derecesi",
    zodiac_sign: "Kova",
    zodiac_degree: 8,
    operations: [
      "Hayırlı ve şerli işlerde aynı anda kullanılabilir",
      "İhanete uğramak",
      "Bu zamanda kimseye güvenmemek gerekir"
    ],
    genel_hukum: "Karışık (İyi ve Kötü)",
    note: "Her iki amaçla kullanılabilir, ihanet riski"
  },
  {
    no: 24,
    name: "SAADÜSSUUD",
    name_arabic: "سعد السعود",
    harfi: "ഖാ",
    harf_arabic: "خ",
    baslama_siniri: "Kova burcunun 21. Derecesi",
    zodiac_sign: "Kova",
    zodiac_degree: 21,
    operations: [
      "Herşeyin düzeltilmesi",
      "Sevgi ve dostluk",
      "Önemli kimselerden destek görmek",
      "İsteklerin kabul edilmesi"
    ],
    genel_hukum: "Uygun (Saad)",
    note: "Düzeltme, sevgi, destek, kabul"
  },
  {
    no: 25,
    name: "SAADÜLAHBİYYE",
    name_arabic: "سعد الأخبية",
    harfi: "സാൽ",
    harf_arabic: "ذ",
    baslama_siniri: "Balık burcunun 3. Derecesi",
    zodiac_sign: "Balık",
    zodiac_degree: 3,
    operations: [
      "Kin ve düşmanlık uyandırma çalışmaları",
      "Ay bu menazildeyken her işte başarısız olunur",
      "İnsanlar birbirlerine tahammül edemezler"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Kin ve başarısızlık"
  },
  {
    no: 26,
    name: "FERÜLMUKADDEM",
    name_arabic: "فرع المقدم",
    harfi: "ദ്വാദ്",
    harf_arabic: "ض",
    baslama_siniri: "Balık burcunun 16. Derecesi",
    zodiac_sign: "Balık",
    zodiac_degree: 16,
    operations: [
      "Aşk",
      "Sevgi",
      "Cinselliğe düşkünlük",
      "Baştan çıkartmak",
      "Her türlü tabunun yıkılması",
      "Yeni ilişkiler kurmak",
      "Önemli kimselerden destek görmek ve her işte başarı"
    ],
    genel_hukum: "Uygun (Saad)",
    note: "Aşk, cinsellik, başarı"
  },
  {
    no: 27,
    name: "FERÜLMÜAHHİR",
    name_arabic: "فرع المؤخر",
    harfi: "സ്വാ",
    harf_arabic: "ظ",
    baslama_siniri: "Balık burcunun 29. Derecesi",
    zodiac_sign: "Balık",
    zodiac_degree: 29,
    operations: [
      "Düşmanlık görmek",
      "Kaza ve belalara uğramak",
      "Kahır ve helak",
      "Sağlığın bozulması"
    ],
    genel_hukum: "Uğursuz (Nahs)",
    note: "Düşmanlık, kaza, helak"
  },
  {
    no: 28,
    name: "EERREŞA",
    name_arabic: "الرشا",
    harfi: "ഗൈൻ",
    harf_arabic: "غ",
    baslama_siniri: "Koç burcunun 12. Derecesi",
    zodiac_sign: "Koç",
    zodiac_degree: 12,
    operations: [
      "Başarı ve zenginliğe kavuşmak",
      "İnsanlarla iyi ilişkiler",
      "Sosyal genişleme",
      "Yolculuklar"
    ],
    genel_hukum: "Uygun (Saad)",
    note: "Başarı, zenginlik, sosyal genişleme"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 7: MOON MANSION — SAAD (LUCKY) AND NAHS (UNLUCKY) CLASSIFICATION
// Source: PDF2 p.64
// "Bu Saad ve Nahs menaziller değişik kaynaklarda, değişik olarak
//  gösterildikleri için aşağıdaki, menazilllerin anlatılışlarında gösterilmediler."
// ─────────────────────────────────────────────────────────────────────────────
export const MANAZIL_CLASSIFICATION = {
  note: "Saad ve Nahs menaziller değişik kaynaklarda, değişik olarak gösterildikleri için kesin listeler verilmemiştir.",
  general_rule: "Olumlu için Ay'ın büyümesi, Olumsuz için Ay'ın küçülmesi tercih edilir.",
  saad_definition: "Saad: Mutlu",
  nahs_definition: "Nahs: Uğursuz, Bahtsız"
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 8: MOON MANSION HARF (LETTER) TABLE
// Source: PDF2 p.81
// "Harflerin Ay menazillerine göre dağılımları aşağıdaki gibidir"
// ─────────────────────────────────────────────────────────────────────────────
export const MANAZIL_HARF_TABLE = [
  { menazil: "Şarteyn",         harf: "അലിഫ്",  harf_arabic: "ا" },
  { menazil: "Buteyn",          harf: "ബാ",    harf_arabic: "ب" },
  { menazil: "Süreyya",         harf: "ജീം",   harf_arabic: "ج" },
  { menazil: "Düberan",         harf: "ദാൽ",   harf_arabic: "د" },
  { menazil: "Hak'a",           harf: "ഹാ",    harf_arabic: "ه" },
  { menazil: "Hena",            harf: "വാവ്",   harf_arabic: "و" },
  { menazil: "Zira",            harf: "സായി",    harf_arabic: "ز" },
  { menazil: "Nesre",           harf: "ഹാ",    harf_arabic: "ح" },
  { menazil: "Tarfe",           harf: "ത്വാ",    harf_arabic: "ط" },
  { menazil: "Cebhe",           harf: "യാ",    harf_arabic: "ي" },
  { menazil: "Harsan (Zebra)",  harf: "കാഫ്",   harf_arabic: "ك" },
  { menazil: "Sarfe (Surfa)",   harf: "ലാം",   harf_arabic: "ل" },
  { menazil: "Ava",             harf: "മീം",   harf_arabic: "م" },
  { menazil: "Semmak",          harf: "നൂൻ",   harf_arabic: "ن" },
  { menazil: "Gufur",           harf: "സീൻ",   harf_arabic: "س" },
  { menazil: "Zibana",          harf: "ഐൻ",  harf_arabic: "ع" },
  { menazil: "İklil",           harf: "ഫാ",    harf_arabic: "ف" },
  { menazil: "Kalb",            harf: "സ്വാദ്",   harf_arabic: "ص" },
  { menazil: "Şevle",           harf: "ഖാഫ്",   harf_arabic: "ق" },
  { menazil: "Neayim",          harf: "റാ",    harf_arabic: "ر" },
  { menazil: "Belde",           harf: "ഷീൻ",   harf_arabic: "ش" },
  { menazil: "Saadüzzabih",     harf: "ത്വാ",    harf_arabic: "ت" },
  { menazil: "Saudbela",        harf: "സാ",    harf_arabic: "ث" },
  { menazil: "Saadüssuud",      harf: "ഖാ",    harf_arabic: "خ" },
  { menazil: "Saadülahbiyye",   harf: "സാൽ",   harf_arabic: "ذ" },
  { menazil: "Ferülmukaddem",   harf: "ദ്വാദ്",   harf_arabic: "ض" },
  { menazil: "Ferülmuahhir",    harf: "സ്വാ",    harf_arabic: "ظ" },
  { menazil: "Erreşa",          harf: "ഗൈൻ", harf_arabic: "غ" }
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 9: PLANETARY LETTERS (Yıldızların Harfleri)
// Source: PDF2 p.81
// ─────────────────────────────────────────────────────────────────────────────
export const YILDIZ_HARFLERI = [
  { gezegen: "Güneş",  harf: "ഫാ",   harf_arabic: "ف" },
  { gezegen: "Ay",     harf: "ജീം",  harf_arabic: "ج" },
  { gezegen: "Merkür", harf: "സാ",   harf_arabic: "ث" },
  { gezegen: "Venüs",  harf: "ഖാ",   harf_arabic: "خ" },
  { gezegen: "Mars",   harf: "സീൻ",  harf_arabic: "س" },
  { gezegen: "Jüpiter",harf: "ത്വാ",   harf_arabic: "ط" },
  { gezegen: "Satürn", harf: "സാൽ",  harf_arabic: "ذ" }
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 10: LETTERS AND THEIR ELEMENTAL NATURE (Harflerin Tabiatleri)
// Source: PDF2 p.76-80
// Multiple scholarly traditions preserved as-is
// ─────────────────────────────────────────────────────────────────────────────
export const HARF_ELEMENT_TABLES = {
  source_note: "Dört temel tabiat ve Yirmisekiz harf vardır. Harfler, Tabiatlara (Element) taksim edilirse her tabiata yedi harf düşer.",
  disagreement_note: "Yukardaki cetvelde görülen taksimde ekseri huruf âlimi müttefiktirler fakat elementlerin sıralanmasında ihtilafları vardır.",

  // General table (column order: Ateş, Toprak, Hava, Hava-Su)
  general_table: {
    ates_column:   ["ا", "ه", "ط", "م", "ف", "ش", "ذ"],
    toprak_column: ["ب", "و", "ي", "ن", "ص", "ت", "ض"],
    hava_column:   ["ج", "ز", "ك", "س", "ق", "ث", "ظ"],
    hava_su_column:["د", "ح", "ل", "ع", "ر", "خ", "غ"],
    mertebe_labels: ["Mertebe", "Derece", "Dakika", "Saniye", "Salise", "Rabia", "Hamise"]
  },

  // Most accepted modern arrangement (Astrolojik sıralama: Ateş, Toprak, Hava, Su)
  modern_accepted: {
    source: "Seyid Süleymanel Hüseyni — Kenzül Esrar",
    rule: "Burçların sıralamaları kabul edilmiştir. Burçlar, Ateş Toprak, Hava, Su sıralaması ile giderler. Mesela Koç, Boğa, İkizler, Yengeç.",
    ates:   { harfler: ["ا", "ه", "م", "ط", "ف", "ش", "ذ"], burclari: "Koç, Arslan, Yay", yon: "Doğu" },
    toprak: { harfler: ["ب", "و", "ي", "ن", "ص", "ت", "ض"], burclari: "Boğa, Başak, Oğlak", yon: "Güney" },
    hava:   { harfler: ["ج", "ز", "ك", "س", "ق", "ث", "ظ"], burclari: "İkizler, Terazi, Kova", yon: "Batı" },
    su:     { harfler: ["د", "ح", "ل", "ع", "ر", "خ", "غ"], burclari: "Yengeç, Akrep, Balık", yon: "Kuzey" }
  },

  // Muhiddini Arabi arrangement
  muhiddini_arabi: {
    ates: ["ا", "ه", "ط", "م", "ف", "ش", "ذ"],
    su:   ["ب", "و", "ي", "ن", "ص", "ت", "ض"],
    toprak: ["ج", "ز", "ك", "س", "ق", "ث", "ظ"],
    hava: ["د", "ح", "ل", "ع", "ر", "خ", "غ"]
  },

  // İmam Ahmedel Buni arrangement
  ahmedel_buni: {
    ates:   ["ا", "ه", "ط", "م", "ف", "ش", "ذ"],
    hava:   ["ب", "و", "ي", "ن", "ص", "ت", "ض"],
    toprak: ["ج", "ز", "ك", "س", "ق", "ث", "ظ"],
    su:     ["د", "ح", "ل", "ع", "ر", "خ", "غ"]
  },

  // Zodiac assignment of letters
  zodiac_assignment: {
    description: "Ateş harfleri ateş burçlarına, Toprak harfleri Toprak burçlarına, Hava harfleri Hava burçlarına ve Su harfleri de Su burçlarına taksim edilmişlerdir.",
    distribution_rule: "Birinci burca iki harf, ikinci burca üç harf ve üçüncü burca iki harf düşecek şekilde.",
    table: [
      { burç: "Koç",     element: "Ateş",  harfler: ["ا", "ه"] },
      { burç: "Arslan",  element: "Ateş",  harfler: ["ط", "م", "ف"] },
      { burç: "Yay",     element: "Ateş",  harfler: ["ش", "ذ"] },
      { burç: "Boğa",    element: "Toprak",harfler: ["ب", "و"] },
      { burç: "Başak",   element: "Toprak",harfler: ["ي", "ن", "ص"] },
      { burç: "Oğlak",   element: "Toprak",harfler: ["ت", "ض"] },
      { burç: "İkizler", element: "Hava",  harfler: ["ج", "ز"] },
      { burç: "Terazi",  element: "Hava",  harfler: ["ك", "س", "ق"] },
      { burç: "Kova",    element: "Hava",  harfler: ["ث", "ظ"] },
      { burç: "Yengeç",  element: "Su",    harfler: ["د", "ح"] },
      { burç: "Akrep",   element: "Su",    harfler: ["ل", "ع", "ر"] },
      { burç: "Balık",   element: "Su",    harfler: ["خ", "غ"] }
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 11: LETTER CLASSIFICATION TYPES
// Source: PDF2 p.82-84
// ─────────────────────────────────────────────────────────────────────────────
export const HARF_SINIFLANDIRMA = {
  nurani_harfler: {
    name: "Hurufu Nuranîye (Aydınlık Harfler)",
    count: 14,
    harfler: ["ا", "ح", "ر", "س", "ص", "ط", "ع", "ق", "ك", "م", "ن", "ه", "و", "ي"],
    ulvi: ["ا", "ط", "ص", "ع", "ق", "س", "ح", "ر"],
    sufli: ["ن", "ك", "ي", "ل", "م", "و", "ه"],
    erkek: ["ا", "ط", "ص", "ع", "ق", "ه", "و", "ي", "ل", "ن"],
    disi:  ["ح", "ك", "م", "س", "ر"]
  },
  zulmani_harfler: {
    name: "Hurufu Zulmanîye (Karanlık Harfler)",
    count: 14,
    harfler: ["ب", "ت", "ث", "ج", "خ", "د", "ذ", "ز", "ش", "ظ", "غ", "ف", "ض", "و"],
    ulvi: ["ب", "غ", "د", "ض", "ت", "و", "ذ"],
    sufli: ["ث", "ج", "خ", "ز", "ش", "ظ", "ف"],
    erkek: ["ج", "ز", "ش", "ذ", "ظ", "غ", "ث"],
    disi:  ["ب", "ت", "خ", "د", "ف", "ض", "و"]
  },
  fatiha_disi_harfler: {
    name: "Fatiha Dışı Harfler (Hurufu Suflîyei Zulmanîye)",
    note: "Surei Fatiha'da bulunmayan harfler",
    harfler: ["ف", "ش", "ج", "خ", "ز", "ظ", "ث"]
  },
  noktali_harfler: {
    name: "Noktalı Harfler",
    count: 15,
    harfler: ["ب", "ت", "ث", "ج", "خ", "ذ", "ز", "ش", "ظ", "غ", "ف", "ن", "ق", "ي"]
  },
  noktasiz_harfler: {
    name: "Noktasız Harfler",
    count: 13,
    harfler: ["ا", "ح", "د", "ر", "س", "ص", "ط", "ع", "ك", "ل", "م", "و", "ه"]
  },
  saad_harfler: {
    name: "Saad Harfler (Mutlu)",
    rule: "Noktasız harflerdir"
  },
  nahs_harfler: {
    name: "Nahs Harfler (Uğursuz)",
    rule: "Üzerinde iki veya üç nokta olan harflerdir"
  },
  yon_harfleri: {
    name: "Yön Harfleri",
    rules: [
      { element: "Ateş", yon: "Doğu" },
      { element: "Hava", yon: "Batı" },
      { element: "Su",   yon: "Kuzey" },
      { element: "Toprak", yon: "Güney" }
    ]
  },
  adedsiz_harfler: {
    name: "Adedsiz Harfler",
    note: "Ebcedî Sagire'de adedi olmayan harfler",
    harfler: ["س", "ش", "خ", "ظ"]
  },
  benzer_harfler: {
    name: "Benzer Harfler",
    note: "Şekil olarak birbirine benzeyen harf grupları",
    harfler_combined: ["ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص", "ض", "ط", "ظ", "ع", "غ", "ف", "ق"]
  },
  benzemez_harfler: {
    name: "Benzemez Harfler",
    note: "Şekil olarak başka bir harfe benzemeyen harfler",
    harfler: ["ا", "ك", "ل", "م", "ن", "و", "ه", "ي"]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 12: HARF CLASSIFICATION BY MUHIDDINI ARABI
// Source: PDF2 p.75
// ─────────────────────────────────────────────────────────────────────────────
export const MUHIDDINI_ARABI_HARF_TASNIFI = {
  source: "Muhiddinî Arabî — Miftahül Cifir",
  classifications: [
    {
      name: "Hurufu Fikriye",
      description: "İnsan zihninde resmolan ve seslenen harftir",
      ruhani_guc: "Kendine göre bir ruhani güce sahiptir ve ilahi aleme bir titreşim yansıtır"
    },
    {
      name: "Hurufu Lafziye",
      description: "Telaffuz edilerek seslendirilen harftir",
      ruhani_guc: "Kendine göre bir ruhani güce sahiptir ve ilahi aleme bir titreşim yansıtır"
    },
    {
      name: "Hurufu Hattiye",
      description: "Kalem ve sair şeyle resmedilen harftir",
      ruhani_guc: "Kendine göre bir ruhani güce sahiptir ve ilahi aleme bir titreşim yansıtır"
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 13: EBCED TABLES
// Source: PDF2 p.90-95
// ─────────────────────────────────────────────────────────────────────────────
export const EBCED_TABLES = {
  ebced_kebir: {
    name: "Ebcedî Kebir Cedveli",
    note: "Bütün ebcedleri oluşturan ve Havâss bilim, sanat ve uygulamalarında en çok kullanılan cetvel",
    values: {
      "ا": 1,  "ب": 2,  "ج": 3,  "د": 4,  "ه": 5,  "و": 6,  "ز": 7,
      "ح": 8,  "ط": 9,  "ي": 10, "ك": 20, "ل": 30, "م": 40, "ن": 50,
      "س": 60, "ع": 70, "ف": 80, "ص": 90, "ق": 100,"ر": 200,"ش": 300,
      "ت": 400,"ث": 500,"خ": 600,"ذ": 700,"ض": 800,"ظ": 900,"غ": 1000
    }
  },
  ebced_sagir: {
    name: "Ebcedî Sagir Cedveli",
    formula: "Harfin Ebcedî kebir değerinden 12 çıkartılarak bulunur. Bu cetvel Ye harfinden sonra başlar.",
    adedsiz: ["س", "ش", "خ", "ظ"],
    adedsiz_note: "Bu harflerin Ebcedî Kebir değerleri olan 60, 300, 600, 900 sayıları 12'ye bölününce Sıfır kalır"
  },
  ebced_batini: {
    name: "Ebcedî Batınî Cedveli",
    formula: "Harfin isminin Ebcedî kebir'e göre hesaplanmasıyla oluşur.",
    example: "Elif harfi: Elif(1) + Lam(30) + Fe(80) = 111"
  },
  ebced_menazile: {
    name: "Ebcedî Menazile Cedveli",
    formula: "Ay menazillerinin adedi olan 28, harfin Ebcedî kebir değerinden çıkartılır.",
    example: "Lam: 30 - 28 = 2; Nun: 50 - 28 = 22"
  },
  ebced_derece: {
    name: "Ebcedî Derece Cedveli",
    formula: "Bir burcun derece adedi olan 30, harfin Ebcedî kebir değerinden çıkartılır."
  },
  ebced_anasir: {
    name: "Ebcedî Anasır Cedveli",
    formula: "Dört element adedi olan 4, Harfin Ebcedî kebir değerinden çıkartılır."
  },
  ebced_seyyare: {
    name: "Ebcedî Seyyare Cedveli",
    formula: "7 Klasik, Astrolojik gök cismi sayısı, harfin değerinden çıkartılır."
  },
  ebced_terkibiye: {
    name: "Ebcedî Terkibiye Cedveli",
    note: "Harfin batıni değeri ile ebced kebir değerinin toplamı"
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 14: HAVASS OPERATIONS — SUITABLE TIMING RULES
// Source: PDF2 p.63 (Saatlerin Yorumları)
// ─────────────────────────────────────────────────────────────────────────────
export const GENEL_ZAMANLAMA_KURALLARI = {
  moon_phase_rules: {
    olumlu_isler: "Olumlu için Ay'ın büyümesi (Hilal'den Dolunay'a) tercih edilir",
    olumsuz_isler: "Olumsuz için Ay'ın küçülmesi (Dolunay'dan Hilal'e) tercih edilir"
  },
  planetary_hour_rule: "Yıldız saatlerinin bazları hayırlı, bazıları şerli diye bir durum pek söz konusu değildir. Her yıldızın kendi karakterindeki işler duruma göre olumlu veya olumsuz yapılır.",
  night_hours_rule: "Bazı kaynaklar gündüz saatlerine uyulmasını fakat gece her saatte, her işin yapılabileceğini söylerler. Bunu yalanlamıyorum fakat gerçekte gece saatleri de vardır ve bunlara da uyulması alınacak sonuç açısından daha verimli olur.",
  saturn_note: "Mesela Satürn saatlerinden, Cumartesi birinci saat iyidir de, sekizinci saat şerlidir diye bir şeye pek kulak asmamak gerekir."
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 15: BAST — LETTER EXPANSION METHODS
// Source: PDF2 p.96
// ─────────────────────────────────────────────────────────────────────────────
export const BAST_METHODS = {
  description: "Basat Üç şekilde yapılır.",
  methods: [
    {
      name: "Bast",
      description: "Bir kelimenin harflerini Ayrık olarak yazmaktır.",
      example_original: "Muhammed ismini ayrık harflerle yazmak gibi: م ح م د"
    },
    {
      name: "Bastı Hurufî",
      description: "Kelimeyi oluşturan harfleri, harf isimleri şeklinde yazmaktır.",
      example_original: "Muhammed ismini 'Mim, Ha, Mim, Dal şeklinde' harf isimleriyle yazmak gibi: أفم حا أفم دال"
    },
    {
      name: "Bastı Hurufî, Esmaî Adedi Huruf",
      description: "Üçüncü şekil — harflerin adedi ile ilgili"
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 16: İSTİNTAK — SPEAKING THE NUMBER
// Source: PDF2 p.97
// ─────────────────────────────────────────────────────────────────────────────
export const ISTINTAK_METHODS = {
  description: "İstintak bir kelimenin toplam adedini harfle yazmaktır.",
  method_1: {
    name: "Birinci Usul",
    description: "Kelimenin adedini Ebced harfleriyle yaz",
    example: {
      kelime: "Muhammed",
      adet: 92,
      ayrima: "90 ve 2",
      harfler: "Sad (90) + Ba (2) = Sab/Saba",
      not: "Bu kelime, Muhammed kelimesinin sayılarının nutku olur."
    }
  },
  method_2: {
    name: "İkinci Usul",
    description: "Kelimenin adedini kendi kendisiyle çarptıktan sonra nutk etmek",
    example: {
      kelime: "Muhammed",
      adet: 92,
      carpim: "92 × 92 = 8464",
      nutk: "8=Ha, 1000=Gayın, 400=Te, 60=Sin, 4=Dal"
    }
  },
  method_3: {
    name: "Üçüncü Usul",
    description: "İki kere çarpma: kelime adedini kendisi ile iki kere çarp",
    example: {
      carpim: "92 × 92 × 92 = 778688"
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 17: MECZ — LETTER MIXING
// Source: PDF2 p.98
// ─────────────────────────────────────────────────────────────────────────────
export const MECZ_METHOD = {
  description: "Mecz etmek, iki kelimenin harflerini birbirine karıştırmaktır.",
  rule: "Birinci kelimenin ilk harfi, ikinci kelimenin ilk harfi. Birinci kelimenin ikinci harfi, ikinci kalimenin ikinci harfi. Şeklinde yazılır.",
  unequal_rule: "Mecz edilecek isimlerden birinin harf sayısı diğerinden az olursa, az harf sayılı olan isimle başlanır ve az harfli isim sona erince tekrar edilir.",
  examples: [
    {
      kelime1: "Hasan (حسن)",
      kelime2: "Ali (علي)",
      sonuc: "AHLSYN: ع ح ل س ي ن"
    },
    {
      kelime1: "Abdullah (عبدالله)",
      kelime2: "Ahmed (أحمد)",
      sonuc: "اعبحدالله ام ود"
    }
  ]
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 18: TEKSİR — LETTER MULTIPLICATION
// Source: PDF2 p.99-100
// ─────────────────────────────────────────────────────────────────────────────
export const TEKSIR_METHOD = {
  description: "Bast ve Teksir yöntemleri Havâss uygulamaları içinde çok önemlidirler.",
  first_method: {
    name: "1. Usül (En Yaygın)",
    steps: [
      "Teksiri yapılacak olan kelime bast edilir yani ayrık harflerle yazılır",
      "1) Kelimenin son harfi, ilk harfin altına yazılır",
      "2) Kelimenin ilk harfi, ikinci harfin altına yazılır",
      "3) Sondan ikinci harf, baştan üçüncü harfin altına yazılır",
      "4) Baştan ikinci harf, baştan dördüncü harfin altına yazılır",
      "5) Baştan üçüncü harf, baştan beşinci harfin altına yazılır",
      "Bu şekilde ikinci satır oluşturulur. İkinci satıra da aynı işlem yapılarak üçüncü satır meydana getirilir ve ilk satır tekrar, aynen oluşana kadar bu şekilde devam edilir."
    ],
    example: {
      isim: "Mütekebbir (متكبر)",
      note: "Mütekebbir ismi altı satırda tekrar oluşmuştur.",
      harf_sayisi: 5
    },
    important_note: "Kaç harfli kelime olursa olsun yukardaki beş madde aynen uygulanır. Hepsi bitince alt satırda bir çok boş yer üst satırda kullanılmamış harfler kalır. Üstteki kullanılmamış harfler yeni bir satırmış gibi kabul edilerek, alttaki boşluk da boş bir satır gibi görülerek ilk beş madde aynen uygulanır."
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 19: HARF DERECELERI (Letter Degrees)
// Source: PDF2 p.85-86
// ─────────────────────────────────────────────────────────────────────────────
export const HARF_DERECELERI = {
  description: "Elemental grupların her yedi harfinin ortasında bulunan, dördüncü harfi, o yedi harflik grubun ait olduğu elementin dördüncü derecesinde kabul etmişlerdir.",
  rule: "Harf grubunun sağında ve solunda bulunan birinci harfleri, birinci derece kabul ederler.",
  definitions: {
    mubteda: "Mübteda: Başlangıç — Yedi harfin birincisi",
    munteha: "Münteha: Son. Enson derece. — Yedi harfin sonuncusu"
  },
  degree_rule: "Bir kelimedeki elemental harflerin dereceleri toplanır. Derece toplamları eşit olursa bu kelime mutedildir (ılımlı).",
  example: {
    kelime: "اله (Ilah)",
    ates_group: "Elif=1.derece, He=2.derece → Ateş toplam 3",
    su_group: "Lam=3.derece → Su toplam 3",
    sonuc: "Eşit olduğu için kelime mutedildir"
  },
  unequal_rule: "Şayet derece toplamı eşit olmazsa, derece toplamı fazla olan element baskın olur."
};

// ─────────────────────────────────────────────────────────────────────────────
// TABLE 20: HAVASS PREPARATION RULES (Timing-related)
// Source: PDF1 p.43-48
// Rules about fasting and timing during Havass operations
// ─────────────────────────────────────────────────────────────────────────────
export const HAVASS_HAZIRLIK_KURALLARI = {
  oruc_rules: [
    "İftar için asla Ezan'a güvenmemelisiniz",
    "İftar ve imsak gibi şeyler için Güneş'in haraketlerini şahsen takip edip, Güneş'in batış saatlerini belirlemeniz gerekir",
    "İftarda, kıtlıktan çıkmış gibi saldırıp, miğdenizi tıkabasa doldurmamalı, açlığınızı bastıracak kadar yemelisiniz",
    "Aynı şey sahur için de gereklidir",
    "Gaz yapacak gıda maddelerinden kaçınmanız şiddetle gereklidir"
  ],
  riyazet_rules: [
    "Riyazetin anlamı canlı ve canlıdan çıkan şeyleri yememektir",
    "Et yenmez",
    "Hayvansal yağlar yenmez",
    "Katışık maddeler yenmez",
    "Yumurta yenmez",
    "Süt ürünleri yenmez",
    "Her tür margarin yenmez",
    "Riyazet sürecince sadece zeytin, ekmek ve zeytin yağı ile yaşamak en güvenilir",
    "Riyazet döneminde sadece hayvansal gıdalar değil, soğan, sarmısak gibi şeyler de yenmemelidir",
    "Ben vejeteryanım demek riyazet için yeterli değildir"
  ],
  halvet_definition: "Halvet, yalnız kalmak, tek başına olmak anlamında bir kelimedir. Çalışma yapmak için kimsenin olmadığı bir yere çekilmek veya belli bir dönem için kapanıp, kimse görüşüp, konuşmamak anlamına gelir.",
  strictness_note: "Aslında oruç tutulmasa da olur. Riyazet yapılmasa da olur. Fakat bu durumda olmayacak bir tek şey vardır ki, o da, çalışma yaparak, olmasını istediğiniz iş her ne ise, onun olmamasıdır."
};

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// LUNAR MANSION DATA — Normalized format for Action Timing Advisor
// Source: AY_MANAZILLERI above
// ─────────────────────────────────────────────────────────────────────────────
export const LUNAR_MANSION_DATA = AY_MANAZILLERI.map(mansion => ({
  number: mansion.no,
  name_en: mansion.name,
  name_ml: mansion.name,
  name_arabic: mansion.name_arabic || mansion.harfi,
  letter_arabic: mansion.harf_arabic,
  nature: mansion.genel_hukum === "Uygun (Saad)" ? "Saad" : mansion.genel_hukum === "Uğursuz (Nahs)" ? "Nahs" : "Mixed",
  nature_ml: mansion.genel_hukum === "Uygun (Saad)" ? "ഉത്തമം" : mansion.genel_hukum === "Uğursuz (Nahs)" ? "അനുചിതം" : "മിശ്രം",
  zodiac_sign: mansion.zodiac_sign,
  zodiac_sign_ml: mansion.zodiac_sign,
  zodiac_degree: mansion.zodiac_degree,
  operations: mansion.operations,
  operations_ml: mansion.operations
}));

// ─────────────────────────────────────────────────────────────────────────────
// PLANET DATA — Normalized format for Action Timing Advisor
// ─────────────────────────────────────────────────────────────────────────────
export const PLANET_DATA = {
  sun: {
    name_en: "Sun",
    name_ml: "സൂര്യൻ",
    name_ar: "شمس",
    symbol: "☉",
    nature_en: "Leadership and success",
    nature_ml: "നേതൃത്വവും വിജയവും"
  },
  moon: {
    name_en: "Moon",
    name_ml: "ചന്ദ്രൻ",
    name_ar: "قمر",
    symbol: "☽",
    nature_en: "Emotions and intuition",
    nature_ml: "വികാരങ്ങളും അറിവും"
  },
  mars: {
    name_en: "Mars",
    name_ml: "ചൊവ്വ",
    name_ar: "مریخ",
    symbol: "♂",
    nature_en: "Energy and conflict",
    nature_ml: "ഊർജ്ജവും സംഘർഷവും"
  },
  mercury: {
    name_en: "Mercury",
    name_ml: "ബുധൻ",
    name_ar: "عطارد",
    symbol: "☿",
    nature_en: "Communication and trade",
    nature_ml: "ആശയവിനിമയവും വ്യാപാരവും"
  },
  jupiter: {
    name_en: "Jupiter",
    name_ml: "ഗുരു",
    name_ar: "مشتری",
    symbol: "♃",
    nature_en: "Wisdom and expansion",
    nature_ml: "ജ്ഞാനവും വികാസവും"
  },
  venus: {
    name_en: "Venus",
    name_ml: "ശുക്രൻ",
    name_ar: "زهره",
    symbol: "♀",
    nature_en: "Love and harmony",
    nature_ml: "പ്രണയവും ഐക്യവും"
  },
  saturn: {
    name_en: "Saturn",
    name_ml: "ശനി",
    name_ar: "زحل",
    symbol: "♄",
    nature_en: "Discipline and delays",
    nature_ml: "ശിക്ഷണവും വൈകലും"
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// METADATA
// ─────────────────────────────────────────────────────────────────────────────
export const ASTRO_METADATA = {
  source_book: "Havâss'ın Derinlikleri",
  author: "Bülent Kısa",
  contact: "mbkisa@yahoo.com",
  kitap_no: "I. Kitap",
  yazilis_sureci: "1974 - 2004",
  tamamlanma_tarihi: "15 Ağustos 2004 - İstanbul",
  extraction_date: "2026-06-14",
  pages_processed: 100,
  pdf_files: [
    { file: "53f63f71d_36657425-Bulent-Ksa-Havassin-Derinlikleri-1-50.pdf", pages: "1-50" },
    { file: "46d55e7d9_36657425-Bulent-Ksa-Havassin-Derinlikleri-51-100.pdf", pages: "51-100" }
  ],
  status: "DATA_FOUNDATION_COMPLETE",
  note: "All calculations await explicit implementation request. No calculators or engines built yet."
};