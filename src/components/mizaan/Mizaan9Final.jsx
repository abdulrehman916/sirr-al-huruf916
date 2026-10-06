import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MizaanHeader from "./MizaanHeader";
import { MIZAAN_ELEMENT_DEGREES } from "../../lib/mizaan9Data";
import { MIZAAN_ELEMENTS } from "../../lib/mizaan9Engine";

const G = { borderHi: "rgba(212,175,55,0.65)", glow: "rgba(212,175,55,0.22)", text: "#F5D060", dim: "rgba(212,175,55,0.55)", bg: "rgba(212,175,55,0.07)" };

const ELEMENT_ORDER = ['fire', 'earth', 'air', 'water'];

// Malayalam meanings for each degree (UI display only — no calculation impact)
const DEGREE_ML = {
  f1: "ഉപയോഗത്തിലുള്ള തീ",
  f2: "തീ തിന്നുകയും കുടിക്കുകയും ചെയ്യുന്നു",
  f3: "തീ തിന്നുകയുമില്ല, കുടിക്കുകയുമില്ല",
  f4: "തണുത്ത തീ",
  e1: "വിത്തുകളെ ഉണർത്തുന്ന മണ്ണ്",
  e2: "എല്ലാ ലോഹങ്ങളുടെയും മണ്ണ്",
  e3: "നിർമ്മാണത്തിന് ഉപയോഗിക്കുന്ന മണ്ണ്",
  e4: "സസ്യങ്ങളൊന്നും മുളക്കാത്ത പഴയ മണ്ണ്",
  a1: "ജനങ്ങൾക്ക് ഗുണം ചെയ്യുന്നത് വീശുന്ന കാറ്റ്",
  a2: "പ്രണയവും സ്നേഹവും നിറഞ്ഞ കാറ്റ്",
  a3: "എല്ലാ പക്ഷികൾക്കുമുള്ള കാറ്റ്",
  a4: "നാശം വരുത്തുന്ന തണുത്ത കാറ്റ്",
  w1: "മധുരവും രുചികരവുമായ ശുദ്ധജലം",
  w2: "കയ്പുള്ളതും ദുർഗന്ധമുള്ളതുമായ വെള്ളം",
  w3: "ഉപ്പുരസമുള്ള കയ്പൻ വെള്ളം",
  w4: "രുചിയില്ലാത്ത നിശ്ചലജലം",
  w5: "മനുഷ്യന് ഗുണം ചെയ്യുന്ന ശുദ്ധജലം",
};

function DegreeCard({ degree, isSelected, col, glow, bg, border, onToggle }) {
  return (
    <motion.button
      onClick={() => onToggle(degree.key)}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isSelected ? 1 : 0.35,
        boxShadow: isSelected
          ? [`0 0 16px ${glow}`, `0 0 32px ${glow}`, `0 0 16px ${glow}`]
          : "none",
      }}
      transition={{
        opacity: { duration: 0.3 },
        boxShadow: isSelected ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 },
      }}
      whileTap={{ scale: 0.96 }}
      className="w-full rounded-xl border p-3 flex items-center justify-between gap-2 text-right cursor-pointer"
      style={{
        background: isSelected ? bg : "rgba(255,255,255,0.02)",
        borderColor: isSelected ? border : "rgba(255,255,255,0.07)",
        borderWidth: isSelected ? 2 : 1,
      }}>
      <div className="flex flex-col items-end gap-0.5 flex-1">
        <div className="flex flex-col sm:flex-row-reverse sm:items-center gap-0.5 sm:gap-2 justify-end w-full">
          <p className="font-amiri text-base leading-snug"
            style={{ color: isSelected ? col : `${col}77` }}
            dir="rtl">
            {degree.arabic}
          </p>
          {DEGREE_ML[degree.key] && (
            <p className="font-malayalam text-[11px] leading-snug"
              style={{ color: isSelected ? "rgba(255,255,255,0.70)" : "rgba(255,255,255,0.35)" }}>
              {DEGREE_ML[degree.key]}
            </p>
          )}
        </div>
        <p className="font-inter text-[9px] font-bold tabular-nums"
          style={{ color: isSelected ? G.dim : "rgba(255,255,255,0.20)" }}>
          Bast: {degree.bast.toLocaleString()}
        </p>
      </div>
      {isSelected && (
        <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
          className="font-inter text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full border flex-shrink-0"
          style={{ color: col, borderColor: border, background: bg }}>
          ✓
        </motion.span>
      )}
    </motion.button>
  );
}

function ElementSection({ elKey, isOpen, onToggle, selectedDegree, onSelectDegree, degreesMap }) {
  const el = degreesMap[elKey];
  if (!el) return null;
  const { arabic, icon, color: col, glow, bg, border, degrees } = el;

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ borderColor: isOpen ? border : "rgba(255,255,255,0.07)", background: "rgba(4,10,28,0.97)" }}>
      {/* Header / toggle */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
        style={{ background: isOpen ? bg : "transparent" }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: "1.4rem" }}>{icon}</span>
          <span className="font-amiri text-lg font-bold" style={{ color: isOpen ? col : `${col}88` }}>{arabic}</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedDegree && (
            <span className="font-inter text-[8px] uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{ color: col, borderColor: border, background: bg }}>
              ✓ Selected
            </span>
          )}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="font-inter text-xs"
            style={{ color: isOpen ? col : "rgba(255,255,255,0.30)" }}>
            ▼
          </motion.span>
        </div>
      </button>

      {/* Degree cards */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="degrees"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}>
            <div className="px-4 pb-4 space-y-2 pt-1">
              {degrees.map((deg) => (
                <DegreeCard
                  key={deg.key}
                  degree={deg}
                  isSelected={selectedDegree === deg.key}
                  col={col} glow={glow} bg={bg} border={border}
                  onToggle={(k) => onSelectDegree(elKey, selectedDegree === k ? null : k)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Mizaan9Final({ result, selections, degreeSels = {}, onDegreeSels, degrees9Data }) {
  const { dominant } = result ?? {};
  const degreesSource = degrees9Data ?? MIZAAN_ELEMENT_DEGREES;

  const [openSections, setOpenSections] = useState(
    () => Object.fromEntries(ELEMENT_ORDER.map(e => [e, false]))
  );

  if (!dominant) return null;

  const primaryElement = (selections.elements?.[0] ?? dominant) || 'fire';

  // Ordered sections: dominant element first
  const orderedElements = [
    primaryElement,
    ...ELEMENT_ORDER.filter(e => e !== primaryElement),
  ];

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  const selectDegree = (elKey, degKey) => onDegreeSels?.(prev => ({ ...prev, [elKey]: degKey }));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
      className="rounded-2xl border p-5 space-y-4"
      style={{ background: "rgba(6,14,36,0.98)", borderColor: G.borderHi, boxShadow: `0 0 40px ${G.glow}` }}>
      <MizaanHeader number="٩" titleAR="الميزان التاسع — درجات العناصر" titleTR="Ninth Mizan · Element Degrees" />
      <p className="font-inter text-[9px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
        Select a degree for each element
      </p>

      <div className="space-y-2">
        {orderedElements.map((elKey, idx) => (
          <ElementSection
            key={elKey}
            elKey={elKey}
            isOpen={openSections[elKey] !== undefined ? !!openSections[elKey] : idx === 0}
            onToggle={() => toggleSection(elKey)}
            selectedDegree={degreeSels?.[elKey] ?? null}
            onSelectDegree={selectDegree}
            degreesMap={degreesSource}
          />
        ))}
      </div>

      {/* Sacred seal */}
      <div className="text-center pt-2">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border"
          style={{ background: G.bg, borderColor: G.borderHi }}>
          <span className="font-amiri text-lg" style={{ color: G.text }}>☽</span>
          <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>9 Mizaan Complete</span>
          <span className="font-amiri text-lg" style={{ color: G.text }}>☽</span>
        </div>
      </div>
    </motion.div>
  );
}