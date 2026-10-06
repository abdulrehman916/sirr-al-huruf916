import { useState } from "react";
import { motion } from "framer-motion";
import { ARABIC_ABJAD, HEBREW_GEMATRIA, numToArabic, numToHebrew } from "./msEngine";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
};

export default function MsLetterTables({ mc, L }) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");

  const resultAr = inputVal ? numToArabic(parseInt(inputVal) || 0) : (mc ? numToArabic(mc) : "");
  const resultHeb = inputVal ? numToHebrew(parseInt(inputVal) || 0) : (mc ? numToHebrew(mc) : "");
  const displayNum = parseInt(inputVal) || mc || 0;

  return (
    <div className="rounded-2xl border space-y-0 overflow-hidden"
      style={{ background:"rgba(4,8,24,0.99)", borderColor:"rgba(212,175,55,0.22)" }}>
      
      {/* Toggle header */}
      <button onClick={() => setOpen(o=>!o)}
        className="w-full flex items-center justify-between px-4 py-3 transition-all"
        style={{ background: open ? "rgba(212,175,55,0.10)" : "rgba(212,175,55,0.04)" }}>
        <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
          {L.letterTable}
        </p>
        <span className="font-inter text-xs" style={{ color: G.dim }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="p-4 space-y-4">

          {/* Name constructor input */}
          <div className="space-y-2">
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
              {L.nameConstruct}
            </p>
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value.replace(/[^\d]/g,""))}
              placeholder={mc ? mc.toString() : "Enter number..."}
              className="w-full rounded-xl px-3 py-2 font-amiri text-xl text-center text-white font-bold focus:outline-none"
              style={{ background:"rgba(4,12,34,0.97)", border:`1px solid rgba(212,175,55,0.30)`, fontSize:"16px" }}
            />
            {displayNum > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl p-3 text-center" style={{ background:"rgba(212,175,55,0.08)", border:"1px solid rgba(212,175,55,0.20)" }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>{L.arabicTable}</p>
                  <p className="font-amiri text-2xl font-bold" dir="rtl" style={{ color: G.text, letterSpacing:"0.1em" }}>{resultAr}</p>
                  <p className="font-inter text-[8px] mt-1" style={{ color:"rgba(255,255,255,0.30)" }}>{displayNum.toLocaleString()}</p>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ background:"rgba(165,139,255,0.08)", border:"1px solid rgba(165,139,255,0.20)" }}>
                  <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color:"rgba(165,139,255,0.70)" }}>{L.hebrewTable}</p>
                  <p className="font-amiri text-2xl font-bold" dir="rtl" style={{ color:"#A78BFA", letterSpacing:"0.1em" }}>{resultHeb}</p>
                  <p className="font-inter text-[8px] mt-1" style={{ color:"rgba(255,255,255,0.30)" }}>{displayNum.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Arabic Abjad table */}
          <div>
            <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>{L.arabicTable}</p>
            <div className="grid grid-cols-4 gap-1">
              {ARABIC_ABJAD.map(({letter,name,val}) => (
                <div key={name} className="rounded-lg p-1.5 text-center" style={{ background:"rgba(212,175,55,0.06)", border:"1px solid rgba(212,175,55,0.10)" }}>
                  <p className="font-amiri text-xl font-bold" dir="rtl" style={{ color: G.text }}>{letter}</p>
                  <p className="font-inter" style={{ fontSize:"8px", color:"rgba(255,255,255,0.35)" }}>{name}</p>
                  <p className="font-amiri font-bold text-xs" style={{ color:"rgba(212,175,55,0.70)" }}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hebrew Gematria table */}
          <div>
            <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color:"rgba(165,139,255,0.70)" }}>{L.hebrewTable}</p>
            <div className="grid grid-cols-4 gap-1">
              {HEBREW_GEMATRIA.map(({letter,name,val}) => (
                <div key={name} className="rounded-lg p-1.5 text-center" style={{ background:"rgba(165,139,255,0.06)", border:"1px solid rgba(165,139,255,0.12)" }}>
                  <p className="font-amiri text-xl font-bold" dir="rtl" style={{ color:"#A78BFA" }}>{letter}</p>
                  <p className="font-inter" style={{ fontSize:"8px", color:"rgba(255,255,255,0.35)" }}>{name}</p>
                  <p className="font-amiri font-bold text-xs" style={{ color:"rgba(165,139,255,0.70)" }}>{val}</p>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}