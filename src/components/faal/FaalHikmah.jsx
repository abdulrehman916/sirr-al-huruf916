import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { FAAL_CHOB_ENTRIES } from "../../lib/faalChobData";

// Grid cards only: fixed standard order ا ا ا → د د د
const GRID_ENTRIES = FAAL_CHOB_ENTRIES
  .filter(e => e.gridPos !== null && e.status !== "invalid")
  .sort((a, b) => a.gridPos - b.gridPos);
import { FAAL_CHOB_ML, FAAL_CHOB_AR } from "../../lib/faalChobTranslations";
import { usePageState } from "../../context/PageStateContext";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
};

const PAGE_KEY = "faalChob";

// Derive the standard 64-combination code from gridPos (1-based)
// Letters: ا=0, ب=1, ج=2, د=3
const LETTERS = ["ا", "ب", "ج", "د"];
function getCombinationCode(gridPos) {
  const idx = (gridPos - 1); // 0-based
  const l1 = LETTERS[Math.floor(idx / 16) % 4];
  const l2 = LETTERS[Math.floor(idx / 4) % 4];
  const l3 = LETTERS[idx % 4];
  return l1 + " " + l2 + " " + l3;
}

const instructions = [
  {
    ar: "نالو قطع چوب لے کر آئیں۔",
    ml: "നാല് കഷണം മരം എടുക്കുക.",
  },
  {
    ar: "پہلے چوب پر الف لکھیں۔",
    ml: "ഒന്നാമത്തെ മരത്തിൽ الف (അലിഫ്) എഴുതുക.",
  },
  {
    ar: "دوسرے چوب پر باء لکھیں۔",
    ml: "രണ്ടാമത്തെ മരത്തിൽ باء (ബാ) എഴുതുക.",
  },
  {
    ar: "تیسرے چوب پر جيم لکھیں۔",
    ml: "മൂന്നാമത്തെ മരത്തിൽ جيم (ജീം) എഴുതുക.",
  },
  {
    ar: "چوتھے چوب پر دال لکھیں۔",
    ml: "നാലാമത്തെ മരത്തിൽ دال (ദാൽ) എഴുതുക.",
  },
  {
    ar: "طہارت سے بیٹھیں اور سورہ الحمد پڑھیں۔",
    ml: "ശുദ്ധിയോടെ (വുദൂ) ഇരിക്കുക. സൂറത്ത് അൽ-ഹംദ് (ഫാതിഹ) പാരായണം ചെയ്യുക.",
  },
  {
    ar: "نبی ﷺ پر درود پڑھیں اور یہ دعا کریں: سُبْحَانَکَ لَا عِلْمَ لَنَا إِلَّا مَا عَلَّمْتَنَا إِنَّکَ أَنْتَ الْعَلِیمُ الْحَکِیمُ",
    ml: "നബി ﷺ യുടെ മേൽ ദുറൂദ് ചൊല്ലുക. ഈ ദുഅ ചൊല്ലുക: سُبْحَانَكَ لَا عِلْمَ لَنَا إِلَّا مَا عَلَّمْتَنَا إِنَّكَ أَنْتَ الْعَلِيمُ الْحَكِيمُ",
  },
  {
    ar: "دل میں نیت کریں، آنکھیں بند کریں اور چوب پھینکیں۔",
    ml: "മനസ്സിൽ ഉദ്ദേശ്യം (നിയ്യത്ത്) വെക്കുക. കണ്ണുകൾ അടച്ച് മരം എറിയുക.",
  },
  {
    ar: "آنے والے اکثر سے کتاب میں اس کے فل کو دیکھیں۔",
    ml: "ലഭിക്കുന്ന അക്ഷരസംയോജനം അനുസരിച്ച് പുസ്തകത്തിലെ ഫലം നോക്കുക.",
  },
];

export default function FaalHikmah() {
  const { getPageState, setPageState, clearPageState } = usePageState();

  const init = getPageState(PAGE_KEY, { selected: null });

  const [selected, setSelected] = useState(init.selected);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [lang, setLang] = useState("ar"); // 'ar' = Arabic only, 'ar-ml' = Arabic + Malayalam

  const persist = useCallback((sel) => {
    setPageState(PAGE_KEY, { selected: sel });
  }, [setPageState]);

  const handleSelect = (entry) => {
    setSelected(entry);
    persist(entry);
  };

  const handleBack = () => {
    setSelected(null);
    persist(null);
  };

  const handleClear = () => {
    clearPageState(PAGE_KEY);
    setSelected(null);
  };

  const isAr = lang === "ar";
  const isArMl = lang === "ar-ml";
  // For cards with id:null, use gridPos as the translation key
  const cardKey = selected?.gridPos;
  const ml = selected && cardKey ? FAAL_CHOB_ML[cardKey] : null;
  const ar = selected && cardKey ? FAAL_CHOB_AR[cardKey] : null;
  
  // Ensure selected card has all required fields by finding it in GRID_ENTRIES
  // This handles cases where stale state from page state may be incomplete
  const selectedCard = selected 
    ? (GRID_ENTRIES.find(e => e.gridPos === selected.gridPos) || selected)
    : null;

  return (
    <div className="space-y-4" style={{ minHeight: 0, height: "auto", overflow: "visible" }}>

      {/* ── Language Switcher ── */}
      <div className="flex gap-2 justify-center flex-wrap">
        {[
          { id: "ar", flag: "🇸🇦", label: "العربية" },
          { id: "ar-ml", flag: "🇸🇦+🇮🇳", label: "العربية + മലയാളം" },
        ].map(opt => {
          const active = lang === opt.id;
          return (
            <motion.button
              key={opt.id}
              onClick={() => setLang(opt.id)}
              whileTap={{ scale: 0.96 }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-inter font-bold text-xs border transition-all"
              style={{
                background: active
                  ? "linear-gradient(145deg, rgba(212,175,55,0.20) 0%, rgba(212,175,55,0.07) 100%)"
                  : "rgba(4,12,34,0.90)",
                borderColor: active ? G.borderHi : "rgba(255,255,255,0.10)",
                color: active ? G.text : "rgba(255,255,255,0.45)",
                boxShadow: active ? `0 0 18px ${G.glow}` : "none",
              }}
            >
              <span>{opt.flag}</span>
              <span>{opt.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* ── Instructions ── */}
      <SectionCard>
        <div className="flex items-center justify-between mb-1">
          <SectionLabel>
            {isAr ? "📜 طریقهٔ ساخت چوب — روش فال" : "📜 ഫാൽ ചോബ് — നിർദ്ദേശ രീതി"}
          </SectionLabel>
          <motion.button
            onClick={() => setInstructionsOpen(!instructionsOpen)}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-inter font-bold text-[10px]"
            style={{ background: "rgba(212,175,55,0.10)", border: "1px solid rgba(212,175,55,0.25)", color: G.text }}
          >
            {instructionsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {instructionsOpen
              ? (isAr ? "بستن" : "അടക്കുക")
              : (isAr ? "خواندن" : "വായിക്കുക")}
          </motion.button>
        </div>
        <motion.div
          initial={false}
          animate={{ height: instructionsOpen ? "auto" : 0, opacity: instructionsOpen ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="space-y-4 pt-3 pb-2">
            {instructions.map((step, i) => (
              <div key={i} className="rounded-xl border p-4"
                style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.12)" }}>
                <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                  {isAr ? `مرحله ${i + 1}` : `ഘട്ടം ${i + 1}`}
                </p>
                {isAr ? (
                   <p className="font-amiri text-[1.25rem] leading-[2.2] text-white/95" dir="rtl" style={{ fontWeight: 600 }}>
                     <span className="font-bold" style={{ color: G.text }}>{i + 1}.</span> {step.ar}
                   </p>
                 ) : (
                   <p className="font-inter text-[1.1rem] leading-[2.0] text-white/90" style={{ fontWeight: 600 }}>
                     {step.ml}
                   </p>
                 )}
              </div>
            ))}
          </div>
        </motion.div>
      </SectionCard>

      <AnimatePresence mode="wait">
        {!selected ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <SectionCard glow>
              <SectionLabel>
                {isAr ? "✨ یک کارت انتخاب کنید — فال چوب" : "✨ ഒരു കാർഡ് തിരഞ്ഞെടുക്കുക — ഫാൽ ചോബ്"}
              </SectionLabel>
              <p className={`text-sm text-white/60 text-center mb-3 ${isAr ? "font-amiri" : "font-inter text-xs"}`} dir={isAr ? "rtl" : "ltr"}>
                {isAr ? "نیت کنید و یک کارت را انتخاب نمایید" : "നിയ്യത്ത് ചെയ്ത് ഒരു കാർഡ് തിരഞ്ഞെടുക്കുക"}
              </p>
              <div className="grid grid-cols-4 gap-2.5 mt-2">
                {GRID_ENTRIES.map((entry, idx) => (
                  <motion.button
                    key={entry.id}
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.01, duration: 0.3, ease: "easeOut" }}
                    onClick={() => handleSelect(entry)}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="aspect-square rounded-xl border flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: "linear-gradient(145deg, rgba(212,175,55,0.14) 0%, rgba(6,14,32,0.98) 100%)",
                      borderColor: "rgba(212,175,55,0.38)",
                      boxShadow: "0 0 20px rgba(212,175,55,0.14), inset 0 1px 0 rgba(212,175,55,0.10)",
                    }}
                  >
                    <div className="absolute inset-0" style={{
                      background: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(212,175,55,0.03) 8px, rgba(212,175,55,0.03) 16px)"
                    }} />
                    <div className="relative z-10 flex flex-col items-center gap-0.5 px-1">
                      <span className="font-amiri font-bold text-center leading-tight" dir="rtl"
                        style={{ color: G.text, fontSize: "13px", letterSpacing: "0.06em" }}>
                        {entry.gridPos ? getCombinationCode(entry.gridPos) : entry.symbol}
                      </span>
                    </div>
                    <div className="absolute top-1 left-1 w-1 h-1 rounded-full" style={{ background: "rgba(212,175,55,0.25)" }} />
                    <div className="absolute top-1 right-1 w-1 h-1 rounded-full" style={{ background: "rgba(212,175,55,0.25)" }} />
                    <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full" style={{ background: "rgba(212,175,55,0.25)" }} />
                    <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full" style={{ background: "rgba(212,175,55,0.25)" }} />
                  </motion.button>
                ))}
              </div>
              <p className="font-inter text-[7px] uppercase tracking-widest text-center mt-3" style={{ color: G.dim }}>
                {GRID_ENTRIES.length} Cards — فال چوب
              </p>
            </SectionCard>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-4"
          >
            <SectionCard glow>
              <SectionLabel>
                {isAr ? "✨ نتیجهٔ فال چوب" : "✨ ഫാൽ ചോബ് ഫലം"}
              </SectionLabel>

              {/* Symbol header */}
              <div className="text-center py-3">
                {/* Combination code label */}
                <div className="mb-2">
                  <span
                    className="font-amiri font-bold tracking-widest"
                    dir="rtl"
                    style={{ color: G.dim, fontSize: "13px", letterSpacing: "0.12em" }}
                  >
                    {isAr ? "التركيبة" : "കോഡ്"}
                  </span>
                  <div
                    className="font-amiri font-bold mt-0.5"
                    dir="rtl"
                    style={{ color: G.text, fontSize: "22px", letterSpacing: "0.08em" }}
                  >
                    {selectedCard?.gridPos ? getCombinationCode(selectedCard.gridPos) : ""}
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center justify-center px-5 py-2 rounded-2xl border mb-2"
                  style={{
                    background: "linear-gradient(145deg, rgba(212,175,55,0.20) 0%, rgba(212,175,55,0.05) 100%)",
                    borderColor: "rgba(212,175,55,0.40)",
                    boxShadow: "0 0 28px rgba(212,175,55,0.25), inset 0 1px 0 rgba(212,175,55,0.15)",
                  }}
                >
                  <span className="font-amiri text-3xl font-bold tracking-widest" style={{ color: G.text }} dir="rtl">
                    {selectedCard?.symbol}
                  </span>
                </motion.div>
                <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                  Card #{selectedCard?.id ?? selectedCard?.gridPos} — فال چوب
                </p>
              </div>

              {/* Verse — always Arabic, shown in both modes */}
              {selectedCard?.verse && (
                <div className="rounded-xl border p-4"
                  style={{ background: "rgba(212,175,55,0.07)", borderColor: "rgba(212,175,55,0.22)" }}>
                  <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                    {isAr ? "آیه / حدیث" : "ആയത്ത് / ഹദീഥ്"}
                  </p>
                  <p className="font-amiri text-[1.5rem] leading-[2.4] text-center" style={{ color: G.text, fontWeight: 700 }} dir="rtl">
                    {selectedCard.verse}
                  </p>
                </div>
              )}

              {/* Main text */}
              {(selectedCard?.text || ml?.text || ar?.text) && (
                <div className="rounded-xl border p-4"
                  style={{ background: "rgba(8,16,38,0.95)", borderColor: "rgba(212,175,55,0.18)" }}>
                  <p className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>
                    {isAr ? "فال" : "ഫാൽ"}
                  </p>
                  {isAr ? (
                    <>
                      {ar?.text ? (
                        <p className="font-amiri text-[1.35rem] leading-[2.2] text-white/95" dir="rtl" style={{ fontWeight: 600 }}>{ar.text}</p>
                      ) : (
                        <p className="font-amiri text-[1.35rem] leading-[2.2] text-white/95" dir="rtl" style={{ fontWeight: 600 }}>{selectedCard?.text}</p>
                      )}
                      {selectedCard?.continuation && (
                        <p className="font-amiri text-[1.35rem] leading-[2.2] text-white/95 mt-4" dir="rtl" style={{ fontWeight: 600 }}>{selectedCard.continuation}</p>
                      )}
                    </>
                  ) : (
                    <>
                      {ar?.text && (
                        <div className="mb-4 pb-4 border-b" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
                          <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>Arabic</p>
                          <p className="font-amiri text-[1.35rem] leading-[2.2] text-white/95" dir="rtl" style={{ fontWeight: 600 }}>{ar.text}</p>
                        </div>
                      )}
                      {ml?.text && (
                        <div className="mb-3">
                          <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>Malayalam</p>
                          <p className="font-inter text-[1.15rem] leading-[2.0] text-white/90" style={{ fontWeight: 600 }}>
                            {ml.text}
                          </p>
                        </div>
                      )}
                      {!ar?.text && !ml?.text && selectedCard?.text && (
                        <p className="font-amiri text-[1.35rem] leading-[2.2] text-white/95" dir="rtl" style={{ fontWeight: 600 }}>
                          {selectedCard.text}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Danyal */}
              {isAr ? (
                ar?.danyal && (
                  <div className="rounded-xl border p-4"
                    style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.14)" }}>
                    <p className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>
                      حضرت دانیال نبی علیه‌السلام
                    </p>
                    <p className="font-amiri text-[1.3rem] leading-[2.2] text-white/95" dir="rtl" style={{ fontWeight: 600 }}>{ar.danyal}</p>
                  </div>
                )
              ) : (
                (ar?.danyal || ml?.danyal) && (
                  <div className="rounded-xl border p-4"
                    style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.14)" }}>
                    <p className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>
                      ഹസ്രത്ത് ദാനിയ്യൽ നബി (അ.സ.)
                    </p>
                    {ar?.danyal && (
                      <div className="mb-3 pb-3 border-b" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
                        <p className="font-inter text-[8px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>Arabic</p>
                        <p className="font-amiri text-[1.35rem] leading-[2.2] text-white/95" dir="rtl" style={{ fontWeight: 600 }}>{ar.danyal}</p>
                      </div>
                    )}
                    {ml?.danyal && (
                      <div>
                        {ar?.danyal && (
                          <p className="font-inter text-[8px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>Malayalam</p>
                        )}
                        <p className="font-inter text-[1.15rem] leading-[2.0] text-white/90" style={{ fontWeight: 600 }}>
                          {ml.danyal}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Sadiq */}
              {isAr ? (
                ar?.sadiq && (
                  <div className="rounded-xl border p-4"
                    style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.14)" }}>
                    <p className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>
                      حضرت امام جعفر صادق علیه‌السلام
                    </p>
                    <p className="font-amiri text-[1.3rem] leading-[2.2] text-white/95" dir="rtl" style={{ fontWeight: 600 }}>{ar.sadiq}</p>
                  </div>
                )
              ) : (
                (ar?.sadiq || ml?.sadiq) && (
                  <div className="rounded-xl border p-4"
                    style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.14)" }}>
                    <p className="font-inter text-[9px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>
                      ഇമാം ജഅ്ഫർ സ്വാദിഖ് (അ.സ.)
                    </p>
                    {ar?.sadiq && (
                      <div className="mb-3 pb-3 border-b" style={{ borderColor: "rgba(212,175,55,0.15)" }}>
                        <p className="font-inter text-[8px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>Arabic</p>
                        <p className="font-amiri text-[1.35rem] leading-[2.2] text-white/95" dir="rtl" style={{ fontWeight: 600 }}>{ar.sadiq}</p>
                      </div>
                    )}
                    {ml?.sadiq && (
                      <div>
                        {ar?.sadiq && (
                          <p className="font-inter text-[8px] uppercase tracking-widest mb-1.5" style={{ color: G.dim }}>Malayalam</p>
                        )}
                        <p className="font-inter text-[1.15rem] leading-[2.0] text-white/90" style={{ fontWeight: 600 }}>
                          {ml.sadiq}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}

              <motion.button
                onClick={handleBack}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 rounded-xl font-inter font-bold text-sm text-[#0d1b2a] tracking-wide mt-2"
                style={{
                  background: "linear-gradient(135deg,#f6d860 0%,#e0a820 50%,#c98a14 100%)",
                  boxShadow: `0 0 32px ${G.glowHi}, 0 2px 12px rgba(0,0,0,0.40)`,
                }}
              >
                {isAr ? "← بازگشت به کارت‌ها" : "← കാർഡുകളിലേക്ക് മടങ്ങുക"}
              </motion.button>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear */}
      <motion.button
        onClick={handleClear}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-inter font-bold text-sm text-white border transition-all"
        style={{ background: "rgba(4,12,34,0.97)", borderColor: "rgba(255,255,255,0.12)" }}
      >
        <Trash2 className="w-4 h-4" />
        {isAr ? "پاک کردن همه" : "എല്ലാം മായ്ക്കുക"}
      </motion.button>
    </div>
  );
}

function SectionCard({ children, glow = false }) {
  return (
    <div className="rounded-2xl border p-4 space-y-3"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        borderColor: "rgba(212,175,55,0.22)",
        boxShadow: glow
          ? `0 8px 48px rgba(0,0,0,0.62), 0 0 32px rgba(212,175,55,0.22), inset 0 1px 0 rgba(212,175,55,0.12)`
          : `0 4px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
      {children}
    </p>
  );
}