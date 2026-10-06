/**
 * GalibAnasirIstintak — Displays full Istintak derivation for Galib Anasir values
 * Shows numeric breakdown and resulting letters step by step
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { getGalibAnasirData, GALIB_ANASIR_VALUES } from "../../lib/mizaanPostEngine";
import { istintak } from "../../lib/mizaanPostEngine";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.60)",
  bg: "rgba(212,175,55,0.06)",
  green: "#4ADE80",
  purple: "#C4B5FD",
};

const AR = {
  fontFamily: "'Noto Naskh Arabic','Amiri','Scheherazade New',serif",
};

const ELEMENT_META = {
  fire:  { arabic: "النار",  icon: "🔥", color: "#FF6B35" },
  earth: { arabic: "التراب", icon: "🌍", color: "#A5C880" },
  air:   { arabic: "الهواء", icon: "🌪",  color: "#B2EBF2" },
  water: { arabic: "الماء",  icon: "💧", color: "#4FC3F7" },
};

const LetterChip = ({ letter, size = "1.4rem", color }) => (
  <span
    dir="rtl"
    lang="ar"
    style={{
      fontFamily: AR.fontFamily,
      fontSize: size,
      color: color || G.text,
      fontWeight: "600",
      padding: "6px 10px",
      borderRadius: "6px",
      background: `${color || G.text}15`,
      border: `1px solid ${color || G.text}30`,
      display: "inline-block",
      minWidth: "2.5rem",
      textAlign: "center",
    }}
  >
    {letter}
  </span>
);

const ElementCard = ({ element, data, isSelected, onClick }) => {
  const meta = ELEMENT_META[element];
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-xl border p-4 cursor-pointer"
      style={{
        background: isSelected ? `${meta.color}15` : `${G.bg}`,
        borderColor: isSelected ? `${meta.color}50` : G.border,
        boxShadow: isSelected ? `0 0 20px ${meta.color}30` : "none",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "1.5rem" }}>{meta.icon}</span>
          <div>
            <div className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: meta.color }}>
              {element}
            </div>
            <div className="font-amiri text-sm" style={{ color: G.text }}>{meta.arabic}</div>
          </div>
        </div>
        <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.text }}>
          {data.value.toLocaleString()}
        </div>
      </div>
      
      {/* Istintak breakdown */}
      <div className="space-y-2">
        <div className="text-xs" style={{ color: G.dim }}>
          <span className="font-inter uppercase tracking-wider">Istintak Result:</span>
        </div>
        <div className="flex flex-wrap gap-1" style={{ direction: "ltr" }}>
          {data.letters.map((l, i) => (
            <LetterChip key={i} letter={l} color={meta.color} size="1.2rem" />
          ))}
        </div>
        <div className="text-xs font-inter" style={{ color: G.dim }}>
          {data.letters.length} letters: {data.letters.join(" ")}
        </div>
      </div>
    </motion.div>
  );
};

export default function GalibAnasirIstintak({ selectedElement, onElementSelect }) {
  const elements = useMemo(() => {
    return Object.keys(GALIB_ANASIR_VALUES).map(el => ({
      element: el,
      data: getGalibAnasirData(el),
    }));
  }, []);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{
        background: "rgba(3,6,20,0.99)",
        borderColor: G.borderHi,
        boxShadow: `0 0 40px ${G.glow}, inset 0 1px 0 ${G.text}10`,
      }}
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="font-inter text-[9px] uppercase tracking-[0.25em]" style={{ color: G.dim }}>
          ✦ Galib Anasir Istintak Derivation ✦
        </p>
        <h2 className="font-amiri text-xl font-bold" style={{ color: G.text }}>
          استنطاق العناصر الغالبة
        </h2>
        <div className="h-px w-20 mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${G.borderHi}, transparent)` }} />
      </div>
      
      {/* Element cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {elements.map(({ element, data }) => (
          <ElementCard
            key={element}
            element={element}
            data={data}
            isSelected={selectedElement === element}
            onClick={() => onElementSelect?.(element)}
          />
        ))}
      </div>
      
      {/* Selected element detail */}
      {selectedElement && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl border p-4"
          style={{
            background: `${ELEMENT_META[selectedElement].color}10`,
            borderColor: `${ELEMENT_META[selectedElement].color}50`,
          }}
        >
          <h3 className="font-inter text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ELEMENT_META[selectedElement].color }}>
            Selected: {ELEMENT_META[selectedElement].arabic} ({selectedElement})
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>Numeric Value</span>
              <span className="font-inter text-lg font-bold tabular-nums" style={{ color: G.text }}>
                {getGalibAnasirData(selectedElement).value.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>Istintak Letters</span>
              <div className="flex gap-1" style={{ direction: "ltr" }}>
                {getGalibAnasirData(selectedElement).letters.map((l, i) => (
                  <LetterChip key={i} letter={l} color={ELEMENT_META[selectedElement].color} />
                ))}
              </div>
            </div>
            <div className="text-xs" style={{ color: G.dim }}>
              These letters are used for remainder completion in Esma-i Kitabet generation
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}