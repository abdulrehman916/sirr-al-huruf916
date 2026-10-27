// Subject cards for «مجربات أهل عمان الكبير».
// Every item of the book is filed under one subject; inside a subject the
// items are split into tabs by kind.
export const OMAN_BOOK = {
  ar: "مجربات أهل عمان الكبير",
  ml: "ഉമാനി മുജർറബാത്ത്",
  note: "ഉമാനിലെ ഒരു പണ്ഡിതൻ ശേഖരിച്ച പരീക്ഷിച്ചറിഞ്ഞ (മുജർറബ്) ദുആകളും മരുന്നുകളും ത്വൽസമാത്തും ഔഫാഖും.",
};

export const OMAN_TOPICS = [
  { id: "sihr", icon: "🔥", ml: "സിഹ്റ് അഴിക്കൽ, ബാത്വിലാക്കൽ", ar: "فك وإبطال الأسحار والعوارض" },
  { id: "ayn", icon: "🧿", ml: "കണ്ണേറ്, ഹസദ്", ar: "العين والحسد" },
  { id: "rabt", icon: "🪢", ml: "റബ്ത്വ് (കെട്ട്) അഴിക്കൽ", ar: "حل الربط والعقد" },
  { id: "qarin", icon: "🌀", ml: "ഖരീൻ, വസ്‌വാസ്", ar: "لجم القرين والوسواس" },
  { id: "hisn", icon: "🛡", ml: "കാവൽ, തഹ്സീൻ, ഹിജാബ്", ar: "التحصين والحفظ والتحجيب" },
  { id: "health", icon: "💧", ml: "രോഗശമനം", ar: "علاج الأمراض" },
  { id: "birth", icon: "👶", ml: "ഗർഭം, പ്രസവം, ദാമ്പത്യം", ar: "الحمل والولادة والجماع" },
  { id: "marriage", icon: "💍", ml: "വിവാഹം, രഞ്ജിപ്പ്", ar: "الزواج والصلح" },
  { id: "rizq", icon: "💰", ml: "രിസ്ഖ്, ധനം, കച്ചവടം", ar: "الرزق والمال والتجارة" },
  { id: "needs", icon: "🗝", ml: "ആവശ്യങ്ങൾ നിറവേറൽ", ar: "قضاء الحوائج وتيسير الأمور" },
  { id: "ilm", icon: "📖", ml: "അറിവ്, ഓർമ്മ, ബുദ്ധി", ar: "العلم والحفظ والفهم" },
  { id: "istiqama", icon: "🕊", ml: "തിന്മകളിൽ നിന്ന് അകറ്റൽ", ar: "الاستقامة والصرف عن المعاصي" },
  { id: "lost", icon: "🔎", ml: "കളവുമുതൽ, കാണാതായവർ", ar: "المسروق والضالة والغائب" },
  { id: "animals", icon: "🐍", ml: "ജീവികൾ, പ്രാണികൾ, കന്നുകാലികൾ", ar: "الدواب والحشرات والمواشي" },
  { id: "dream", icon: "🌙", ml: "സ്വപ്നം വഴി അറിയൽ", ar: "طلب الرؤيا والتوريق" },
  { id: "salawat", icon: "✨", ml: "സ്വലാത്തുകൾ", ar: "الصلوات على النبي ﷺ" },
  { id: "misc", icon: "•", ml: "പലവക", ar: "متفرقات" },
];

export const OMAN_HEALTH_SUBS = [
  { id: "all", ml: "എല്ലാ രോഗങ്ങൾക്കും" },
  { id: "head", ml: "തലവേദന, പനി, ജലദോഷം" },
  { id: "belly", ml: "വയർ, മൂത്രം, പൈൽസ്" },
  { id: "eye", ml: "കണ്ണ്, കാഴ്ച" },
  { id: "ent", ml: "ചെവി, പല്ല്, വായ, തൊണ്ട" },
  { id: "skin", ml: "ത്വക്ക്, കുരുക്കൾ" },
  { id: "joints", ml: "നടുവ്, സന്ധികൾ" },
  { id: "heart", ml: "ഹൃദയം" },
  { id: "paralysis", ml: "തളർവാതം" },
  { id: "blood", ml: "രക്തസ്രാവം, മുറിവ്" },
  { id: "hair", ml: "മുടി" },
  { id: "sleep", ml: "ഉറക്കമില്ലായ്മ" },
  { id: "food", ml: "ഔഷധ ഭക്ഷണങ്ങൾ" },
  { id: "other", ml: "മറ്റു രോഗങ്ങൾ" },
];

export const OMAN_KINDS = [
  { id: "dua", ml: "ദുആ, മന്ത്രം", ar: "أدعية وعزائم" },
  { id: "remedy", ml: "മരുന്ന്", ar: "أدوية" },
  { id: "both", ml: "മരുന്നും മന്ത്രവും", ar: "دواء وعزيمة" },
  { id: "tilsam", ml: "ത്വൽസം", ar: "طلاسم" },
  { id: "wafq", ml: "വഫ്ഖ്", ar: "أوفاق" },
];

// Loaded on demand, one file per subject.
const loaders = import.meta.glob("../data/oman/*.json");

export async function loadOmanTopic(id) {
  const fn = loaders[`../data/oman/${id}.json`];
  if (!fn) return [];
  const mod = await fn();
  return mod.default || mod;
}

export async function loadOmanQuran() {
  return loadOmanTopic("quran");
}
