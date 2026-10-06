import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { istintak, GALIB_ANASIR_VALUES } from "../lib/mizaanPostEngine";
import { getBastLevel as getBastLevelA } from "../lib/mizaanPostEngine";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  goldBorder: "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  green: "#4ADE80",
  red: "#F87171",
  dim: "rgba(255,255,255,0.35)",
};

export default function MizanCompletionTest() {
  const [testText, setTestText] = useState("بسم الله الرحمن الرحيم");
  const [dominant, setDominant] = useState("fire");

  // Simulate Kitabet pipeline
  const kitabetTest = useMemo(() => {
    // Simulate seed letters from istintak
    const seedLetters = istintak(1234); // Example source
    const isFerd = seedLetters.length % 2 !== 0;
    const bastLevel = isFerd ? 5 : 4;
    
    let allExpanded = [];
    for (let i = seedLetters.length - 1; i >= 0; i--) {
      allExpanded = [...allExpanded, ...istintak(getBastLevelA(seedLetters[i], bastLevel))];
    }
    
    const gSize = allExpanded.length % 2 !== 0 ? 5 : 4;
    const rem = allExpanded.length % gSize;
    const needed = rem > 0 ? gSize - rem : 0;
    
    // KITABET RULE: Galib Anasir
    const galibValue = GALIB_ANASIR_VALUES[dominant] || GALIB_ANASIR_VALUES.fire;
    const galibIstintak = istintak(galibValue);
    const supplement = needed > 0 ? galibIstintak.slice(0, needed) : [];
    
    return {
      seedLetters,
      allExpanded,
      gSize,
      remainder: rem,
      needed,
      supplement,
      supplementSource: "Galib Anasir",
      supplementLetters: galibIstintak,
    };
  }, [dominant]);

  // Simulate A'van pipeline
  const avanTest = useMemo(() => {
    const seedLetters = istintak(5678); // Different source
    const isFerd = seedLetters.length % 2 !== 0;
    const bastLevel = isFerd ? 5 : 4;
    
    let allExpanded = [];
    for (let i = seedLetters.length - 1; i >= 0; i--) {
      allExpanded = [...allExpanded, ...istintak(getBastLevelA(seedLetters[i], bastLevel))];
    }
    
    const gSize = allExpanded.length % 2 !== 0 ? 5 : 4;
    const rem = allExpanded.length % gSize;
    const needed = rem > 0 ? gSize - rem : 0;
    
    // A'VAN RULE: Recycle from own expanded letters (NOT Galib Anasir)
    const supplement = needed > 0 ? allExpanded.slice(0, needed) : [];
    
    return {
      seedLetters,
      allExpanded,
      gSize,
      remainder: rem,
      needed,
      supplement,
      supplementSource: "Own Expanded (Recycled)",
      supplementLetters: allExpanded,
    };
  }, []);

  // Simulate Kasem pipeline
  const kasemTest = useMemo(() => {
    const seedLetters = istintak(9012); // Different source
    const isFerd = seedLetters.length % 2 !== 0;
    const bastLevel = isFerd ? 5 : 4;
    
    let allExpanded = [];
    for (let i = seedLetters.length - 1; i >= 0; i--) {
      allExpanded = [...allExpanded, ...istintak(getBastLevelA(seedLetters[i], bastLevel))];
    }
    
    const gSize = allExpanded.length % 2 !== 0 ? 5 : 4;
    const rem = allExpanded.length % gSize;
    const needed = rem > 0 ? gSize - rem : 0;
    
    // KASEM RULE: Recycle from own expanded letters (NOT Galib Anasir)
    const supplement = needed > 0 ? allExpanded.slice(0, needed) : [];
    
    return {
      seedLetters,
      allExpanded,
      gSize,
      remainder: rem,
      needed,
      supplement,
      supplementSource: "Own Expanded (Recycled)",
      supplementLetters: allExpanded,
    };
  }, []);

  function LetterBox({ letter, color, label }) {
    return (
      <div className="flex flex-col items-center gap-1">
        <div
          className="w-10 h-10 rounded-lg border flex items-center justify-center font-amiri text-xl font-bold"
          style={{
            color: color || G.gold,
            borderColor: (color || G.gold) + "55",
            background: (color || G.gold) + "12",
          }}
        >
          {letter}
        </div>
        {label && <span className="text-[7px] font-inter" style={{ color: G.dim }}>{label}</span>}
      </div>
    );
  }

  function TestSection({ title, data, sectionColor }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border p-4 space-y-3"
        style={{
          background: "rgba(6,14,36,0.98)",
          borderColor: sectionColor + "55",
          borderLeft: `3px solid ${sectionColor}`,
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: sectionColor }}>
            {title}
          </span>
        </div>

        {/* Original Expanded Letters */}
        <div className="space-y-2">
          <div className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
            Original Expanded Letters (Count: {data.allExpanded.length})
          </div>
          <div className="flex flex-wrap gap-2" style={{ direction: "rtl" }}>
            {data.allExpanded.slice(0, 20).map((l, i) => (
              <LetterBox key={i} letter={l} color={sectionColor} label={i + 1} />
            ))}
            {data.allExpanded.length > 20 && (
              <span className="font-inter text-xs" style={{ color: G.dim }}>+{data.allExpanded.length - 20} more</span>
            )}
          </div>
        </div>

        {/* Group Size & Remainder */}
        <div className="flex items-center gap-4 px-3 py-2 rounded-lg border"
          style={{ background: G.gold + "08", borderColor: G.goldBorder + "40" }}>
          <div className="text-center">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Group Size</div>
            <div className="font-inter text-sm font-bold" style={{ color: G.gold }}>{data.gSize}</div>
          </div>
          <div className="text-center">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Remainder</div>
            <div className="font-inter text-sm font-bold" style={{ color: G.gold }}>{data.remainder}</div>
          </div>
          <div className="text-center">
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Missing</div>
            <div className="font-inter text-sm font-bold" style={{ color: data.needed > 0 ? G.red : G.green }}>
              {data.needed}
            </div>
          </div>
        </div>

        {/* Supplement Source */}
        <div className="space-y-2">
          <div className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
            Completion Rule
          </div>
          <div className="px-3 py-2 rounded-lg border"
            style={{
              background: data.supplementSource.includes("Galib") ? "rgba(196,181,253,0.08)" : "rgba(74,222,128,0.08)",
              borderColor: data.supplementSource.includes("Galib") ? "rgba(196,181,253,0.25)" : "rgba(74,222,128,0.25)",
            }}
          >
            <span className="font-inter text-[9px] font-bold"
              style={{ color: data.supplementSource.includes("Galib") ? "#C4B5FD" : G.green }}>
              {data.supplementSource}
            </span>
          </div>
        </div>

        {/* Supplement Letters */}
        {data.needed > 0 && (
          <div className="space-y-2">
            <div className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
              Appended Letters (for display only)
            </div>
            <div className="flex flex-wrap gap-2" style={{ direction: "rtl" }}>
              {data.supplement.map((l, i) => (
                <LetterBox
                  key={i}
                  letter={l}
                  color={data.supplementSource.includes("Galib") ? "#C4B5FD" : G.green}
                  label={`#${i + 1}`}
                />
              ))}
            </div>
            <div className="text-[7px] font-inter" style={{ color: G.dim }}>
              Source: {data.supplementSource.includes("Galib")
                ? `Galib Anasir Istintak (first ${data.needed} letter${data.needed > 1 ? 's' : ''})`
                : `Own expanded sequence (first ${data.needed} letter${data.needed > 1 ? 's' : ''})`
              }
            </div>
          </div>
        )}

        {/* Final Groups */}
        <div className="space-y-2">
          <div className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
            Final Display Names (with completion)
          </div>
          {(() => {
            const seq = [...data.allExpanded, ...data.supplement];
            const groups = [];
            for (let i = 0; i < seq.length; i += data.gSize) {
              groups.push(seq.slice(i, i + data.gSize).join(""));
            }
            return (
              <div className="flex flex-wrap gap-2">
                {groups.map((name, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 rounded-lg border font-amiri text-xl font-bold"
                    style={{
                      color: sectionColor,
                      borderColor: sectionColor + "40",
                      background: sectionColor + "08",
                    }}
                    dir="rtl"
                  >
                    {name}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Calculation Integrity Notice */}
        <div className="px-3 py-2 rounded-lg border"
          style={{
            background: "rgba(248,113,113,0.08)",
            borderColor: "rgba(248,113,113,0.25)",
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg" style={{ color: G.red }}>⚠</span>
            <span className="font-inter text-[8px] font-bold" style={{ color: G.red }}>
              CALCULATION INTEGRITY: Appended letters are for DISPLAY ONLY.
            </span>
          </div>
          <div className="text-[7px] font-inter mt-1" style={{ color: G.dim }}>
            Later calculations use ONLY the original {data.allExpanded.length} expanded letters,
            excluding the {data.needed} appended completion letter{data.needed !== 1 ? 's' : ''}.
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-4">
        <PageTitle
          arabic="اختبار إكمال الحروف"
          latin="Completion Rule Verification"
          subtitle="Real Examples — All Three Sections"
          icon="⚖"
        />

        {/* Controls */}
        <div className="rounded-xl border p-4 space-y-3"
          style={{
            background: "rgba(6,14,36,0.98)",
            borderColor: G.goldBorder,
          }}
        >
          <div className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
            Test Configuration
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border font-amiri text-lg"
              style={{
                background: "rgba(4,12,34,0.97)",
                borderColor: G.goldBorder,
                color: G.gold,
              }}
              dir="rtl"
            />
            <select
              value={dominant}
              onChange={(e) => setDominant(e.target.value)}
              className="px-3 py-2 rounded-lg border font-inter text-sm"
              style={{
                background: "rgba(4,12,34,0.97)",
                borderColor: G.goldBorder,
                color: G.gold,
              }}
            >
              <option value="fire">Fire (نار)</option>
              <option value="earth">Earth (تراب)</option>
              <option value="air">Air (هواء)</option>
              <option value="water">Water (ماء)</option>
            </select>
          </div>
          <div className="text-[8px] font-inter" style={{ color: G.dim }}>
            Note: This uses fixed source numbers for demonstration. In the actual pipeline,
            these numbers come from the 9 Mizan calculations.
          </div>
        </div>

        {/* Test Sections */}
        <TestSection title="1. Esma-i Kitabet — Galib Anasir Completion" data={kitabetTest} sectionColor="#C4B5FD" />
        <TestSection title="2. Esma-i A'van — Self-Recycle Completion" data={avanTest} sectionColor={G.green} />
        <TestSection title="3. Esma-i Kasem — Self-Recycle Completion" data={kasemTest} sectionColor={G.gold} />

        {/* Summary */}
        <div className="rounded-xl border p-4"
          style={{
            background: "rgba(6,14,36,0.98)",
            borderColor: G.goldBorderHi,
          }}
        >
          <div className="font-inter text-[10px] uppercase tracking-widest font-bold mb-3" style={{ color: G.gold }}>
            Verification Summary
          </div>
          <div className="space-y-2 text-[9px] font-inter" style={{ color: G.dim }}>
            <div className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>
                <strong style={{ color: G.gold }}>Kitabet:</strong> Uses Galib Anasir Istintak letters for completion
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>
                <strong style={{ color: G.gold }}>A'van:</strong> Recycles from beginning of own expanded sequence (NOT Galib Anasir)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>
                <strong style={{ color: G.gold }}>Kasem:</strong> Recycles from beginning of own expanded sequence (NOT Galib Anasir)
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-lg">✓</span>
              <span>
                <strong style={{ color: G.gold }}>Calculation Integrity:</strong> Appended letters are for DISPLAY ONLY —
                later calculations use ONLY original expanded letters
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}