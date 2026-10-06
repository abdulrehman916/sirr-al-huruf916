import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Trash2, Star, ChevronDown, ChevronUp } from "lucide-react";
import { LUQMAN_CELLS } from "../../lib/faalLuqmanData";
import { usePageState } from "../../context/PageStateContext";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
};

function shuffleArray(array) {
  const arr = [...array];
  let currentIndex = arr.length, randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
  }
  return arr;
}

const PAGE_KEY = 'faalLuqman';

export default function FaalLuqman() {
  const { getPageState, setPageState, clearPageState } = usePageState();
  const createShuffled = useCallback(() => shuffleArray(LUQMAN_CELLS), []);
  
  const initialShuffled = useMemo(() => createShuffled(), []);
  const initialState = getPageState(PAGE_KEY, {
    lang: "en",
    shuffled: initialShuffled,
    selectedCell: null,
    hasShuffledOnce: false,
  });
  
  const [lang, setLang] = useState("en");
  const [shuffled, setShuffled] = useState(initialState.shuffled);
  const [selectedCell, setSelectedCell] = useState(initialState.selectedCell);
  const [hasShuffledOnce, setHasShuffledOnce] = useState(initialState.hasShuffledOnce);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  const luqmanInstructionsML = [
    "റസൂൽ ﷺ യുടെ പേരിൽ ഒരു ഫാതിഹ ഓതുക.",
    "അഹ്‌ലുൽ ബൈത്തിന്റെ പേരിൽ ഒരു ഫാതിഹ ഓതുക.",
    "സഹാബാക്കളുടെ പേരിൽ ഒരു ഫാതിഹ ഓതുക.",
    "ഹസ്രത്ത് അലി (റ) യുടെ പേരിൽ ഒരു ഫാതിഹ ഓതുക.",
    "ഹസ്രത്ത് ലുഖ്മാൻ (റ) യുടെ പേരിൽ ഒരു ഫാതിഹ കൂടി ഓതുക.",
    "ഇവർക്കെല്ലാം സവാബ് ഹദിയ ചെയ്യുക.",
    "കലിമാവിരൽ ഉയർത്തി മൂന്ന് കുൽ സൂറത്തുകൾ ഓതുക.",
    "ഉദ്ദേശ്യം മനസ്സിൽ വെച്ച് ഒരു കാർഡ് തിരഞ്ഞെടുക്കുക.",
  ];

  const luqmanInstructionsEN = [
    "Recite Al-Fatiha in the name of Prophet Muhammad ﷺ.",
    "Recite Al-Fatiha in the name of Ahlul Bayt (the Prophet's family).",
    "Recite Al-Fatiha in the name of the Sahaba (companions).",
    "Recite Al-Fatiha in the name of Hazrat Ali (RA).",
    "Recite an additional Al-Fatiha in the name of Hazrat Luqman (RA).",
    "Dedicate the reward (Sawab) to all of them.",
    "Raise your index finger and recite the three Qul surahs (Ikhlas, Falaq, Nas).",
    "Keep your intention in mind and select one card.",
  ];

  const currentInstructions = lang === 'ml' ? luqmanInstructionsML : luqmanInstructionsEN;

  useEffect(() => {
    setPageState(PAGE_KEY, { lang, shuffled, selectedCell, hasShuffledOnce });
  }, [lang, shuffled, selectedCell, hasShuffledOnce, setPageState]);

  // Auto-shuffle once on mount for fresh reading
  useEffect(() => {
    if (!hasShuffledOnce) {
      const timer = setTimeout(() => {
        setShuffled(createShuffled());
        setHasShuffledOnce(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasShuffledOnce, createShuffled]);

  const handleClear = () => {
    clearPageState(PAGE_KEY);
    setLang("en");
    setShuffled(createShuffled());
    setSelectedCell(null);
    setHasShuffledOnce(false);
  };

  const handleSelectCell = (cell) => {
    setSelectedCell(cell);
  };

  const handleBack = () => {
    setShuffled(createShuffled());
    setSelectedCell(null);
  };

  return (
    <div 
      className="space-y-4"
      style={{
        minHeight: 0,
        height: "auto",
        maxHeight: "none",
        overflow: "visible",
      }}
    >
      {/* Language Toggle */}
      <SectionCard>
        <SectionLabel>🌐 Language</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <motion.button
            onClick={() => setLang('ml')}
            whileHover={{ scale: lang === 'ml' ? 1 : 1.02 }}
            whileTap={{ scale: lang === 'ml' ? 1 : 0.98 }}
            className="rounded-xl py-3.5 font-inter font-bold text-xs border transition-all relative overflow-hidden"
            style={{
              background: lang === 'ml'
                ? "linear-gradient(145deg, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.06) 100%)"
                : "rgba(4,12,34,0.97)",
              borderColor: lang === 'ml' ? G.borderHi : "rgba(255,255,255,0.08)",
              color: lang === 'ml' ? G.text : "rgba(255,255,255,0.38)",
              boxShadow: lang === 'ml' ? `0 0 18px ${G.glow}, inset 0 1px 0 rgba(212,175,55,0.15)` : "none",
            }}>
            {lang === 'ml' && <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)` }} />}
            Malayalam
          </motion.button>
          <motion.button
            onClick={() => setLang('en')}
            whileHover={{ scale: lang === 'en' ? 1 : 1.02 }}
            whileTap={{ scale: lang === 'en' ? 1 : 0.98 }}
            className="rounded-xl py-3.5 font-inter font-bold text-xs border transition-all relative overflow-hidden"
            style={{
              background: lang === 'en'
                ? "linear-gradient(145deg, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.06) 100%)"
                : "rgba(4,12,34,0.97)",
              borderColor: lang === 'en' ? G.borderHi : "rgba(255,255,255,0.08)",
              color: lang === 'en' ? G.text : "rgba(255,255,255,0.38)",
              boxShadow: lang === 'en' ? `0 0 18px ${G.glow}, inset 0 1px 0 rgba(212,175,55,0.15)` : "none",
            }}>
            {lang === 'en' && <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.45), transparent)` }} />}
            English
          </motion.button>
        </div>
      </SectionCard>

      <AnimatePresence mode="wait">
        {!selectedCell ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Reading Instructions Card */}
            <SectionCard>
              <div className="flex items-center justify-between mb-2">
                <SectionLabel>📜 {lang === 'ml' ? 'ഫാൽ ലുഖ്മാൻ എടുക്കുന്ന വിധം' : 'How to Perform Faal Luqman'}</SectionLabel>
                <motion.button
                  onClick={() => setInstructionsExpanded(!instructionsExpanded)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-inter font-bold text-[10px]"
                  style={{
                    background: "rgba(212,175,55,0.10)",
                    border: "1px solid rgba(212,175,55,0.25)",
                    color: G.text,
                  }}
                >
                  {instructionsExpanded ? (
                    <>
                      <ChevronUp className="w-3 h-3" />
                      {lang === 'ml' ? 'ചുരുക്കുക' : 'Collapse'}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      {lang === 'ml' ? 'വായിക്കുക' : 'Read'}
                    </>
                  )}
                </motion.button>
              </div>
              <motion.div
                initial={false}
                animate={{ height: instructionsExpanded ? 'auto' : 0, opacity: instructionsExpanded ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
                style={{ touchAction: 'auto' }}
              >
                <div 
                  className="space-y-1.5 pt-2 pb-1"
                  style={{ 
                    touchAction: 'auto',
                    overscrollBehavior: 'contain'
                  }}
                >
                  {currentInstructions.map((text, idx) => (
                    <p key={idx} className="font-inter text-[1rem] text-white/90 leading-[1.9]" style={{ fontWeight: 500 }}>
                      <span className="font-bold text-[#F5D060]">{idx + 1}.</span> {text}
                    </p>
                  ))}
                </div>
              </motion.div>
            </SectionCard>

            <SectionCard glow>
              <SectionLabel>📜 Select Your Omen — Choose a Card</SectionLabel>
              <p className="font-inter text-[8px] text-white/60 text-center mb-3">
                Focus on your question and select one card from the sacred grid
              </p>
              
              <div className="grid grid-cols-7 sm:grid-cols-7 md:grid-cols-7 lg:grid-cols-7 xl:grid-cols-7 gap-2 mt-2">
                {shuffled.map((cell, idx) => (
                  <motion.button
                    key={cell.lq_id}
                    initial={{ opacity: 0, scale: 0.75, rotate: -3 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ delay: idx * 0.012, duration: 0.35, ease: "easeOut" }}
                    onClick={() => handleSelectCell(cell)}
                    whileHover={{ scale: 1.06, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                    className="aspect-square rounded-xl border flex items-center justify-center relative overflow-hidden"
                    style={{
                      background: "linear-gradient(145deg, rgba(212,175,55,0.14) 0%, rgba(6,14,32,0.98) 100%)",
                      borderColor: "rgba(212,175,55,0.38)",
                      boxShadow: "0 0 20px rgba(212,175,55,0.14), inset 0 1px 0 rgba(212,175,55,0.10)",
                      maxWidth: "90px",
                    }}
                  >
                    <div className="absolute inset-0" style={{ 
                      background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,175,55,0.08) 0%, transparent 60%),
                                   repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(212,175,55,0.03) 8px, rgba(212,175,55,0.03) 16px)`
                    }} />
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(145deg, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0.06) 100%)",
                          border: "1px solid rgba(212,175,55,0.30)",
                          boxShadow: "0 0 16px rgba(212,175,55,0.20), inset 0 1px 0 rgba(212,175,55,0.15)"
                        }}>
                        <span className="font-amiri text-xs" style={{ color: G.text }}>📜</span>
                      </div>
                    </div>
                    <div className="absolute top-1 left-1 w-1 h-1 rounded-full" style={{ background: "rgba(212,175,55,0.25)" }} />
                    <div className="absolute top-1 right-1 w-1 h-1 rounded-full" style={{ background: "rgba(212,175,55,0.25)" }} />
                    <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full" style={{ background: "rgba(212,175,55,0.25)" }} />
                    <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full" style={{ background: "rgba(212,175,55,0.25)" }} />
                  </motion.button>
                ))}
              </div>

              <p className="font-inter text-[7px] uppercase tracking-widest text-center mt-3" style={{ color: G.dim }}>
                28 Cards Total — Nakshatra Sulamani
              </p>
            </SectionCard>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            <SectionCard glow>
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl border mb-3"
                  style={{
                    background: "linear-gradient(145deg, rgba(212,175,55,0.20) 0%, rgba(212,175,55,0.05) 100%)",
                    borderColor: "rgba(212,175,55,0.40)",
                    boxShadow: "0 0 28px rgba(212,175,55,0.25)",
                  }}
                >
                  <span className="font-amiri text-3xl" style={{ color: G.text }} dir="rtl">
                    {selectedCell.symbol}
                  </span>
                </motion.div>
                <h3 className="font-amiri text-2xl font-bold mb-1" style={{ color: G.text }} dir="rtl">
                  {selectedCell[lang]?.shortTitle}
                </h3>
                <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                  {selectedCell.symbolName} · {selectedCell[lang]?.title}
                </p>
              </div>

              <div className="rounded-xl border p-4 space-y-3"
                style={{
                  background: "rgba(212,175,55,0.04)",
                  borderColor: "rgba(212,175,55,0.20)",
                }}>
                <div>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    Result — ഫലം
                  </p>
                  <p className="font-inter text-[1.05rem] text-white/95 leading-[2.0]" style={{ fontWeight: 500 }}>
                    {selectedCell[lang]?.result}
                  </p>
                </div>
                <div className="h-px" style={{ background: "rgba(212,175,55,0.15)" }} />
                <div>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    Interpretation — വ്യാഖ്യാനം
                  </p>
                  <p className="font-inter text-[1.05rem] text-white/90 leading-[2.0]" style={{ fontWeight: 500 }}>
                    {selectedCell[lang]?.body}
                  </p>
                  </div>
                  <div className="h-px" style={{ background: "rgba(212,175,55,0.15)" }} />
                <div>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    Remedy — പരിഹാരം
                  </p>
                  <p className="font-inter text-[1.05rem] text-white/90 leading-[2.0]" style={{ fontWeight: 500 }}>
                    {selectedCell[lang]?.remedy}
                  </p>
                  </div>
                  </div>
                  </SectionCard>

            <motion.button
              onClick={handleBack}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3.5 rounded-xl font-inter font-bold text-sm text-white border transition-all"
              style={{
                background: "rgba(4,12,34,0.97)",
                borderColor: "rgba(212,175,55,0.30)",
              }}
            >
              ← Select Another Card
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Button */}
      <motion.button
        onClick={handleClear}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl font-inter font-bold text-sm text-white border transition-all"
        style={{
          background: "rgba(4,12,34,0.97)",
          borderColor: "rgba(255,255,255,0.12)",
        }}
      >
        <Trash2 className="w-4 h-4" />
        Clear All
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
          ? `0 8px 48px rgba(0,0,0,0.62), 0 0 32px ${G.glow}, inset 0 1px 0 rgba(212,175,55,0.12)`
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