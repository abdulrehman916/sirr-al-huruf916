/**
 * HadimKasem — Kasem / Invocation Section
 * Book-accurate order:
 *  1. Final Grand Hadim Name (large)
 *  2. All hadim names × 2 (grand first, then individuals)
 *  3. Invocation line
 *  4. Hajath textarea + live display
 *  5. Final closing phrases
 */
import { useState } from "react";
import { motion } from "framer-motion";

const ENDING_LINES = [
  "الْوَاحًا الْوَاحًا الْوَاحًا",
  "الْعَجَلْ الْعَجَلْ الْعَجَلْ",
  "السَّاعَةُ السَّاعَةُ السَّاعَةُ",
];

const ACCENTS = {
  ULVI: {
    glow:        "rgba(212,175,55,0.65)",
    border:      "rgba(212,175,55,0.35)",
    text:        "#F5D060",
    dim:         "rgba(212,175,55,0.50)",
    inputBorder: "rgba(212,175,55,0.40)",
    endingGlow:  "rgba(212,175,55,0.80)",
    endingColor: "#FFE07A",
    bg:          "rgba(212,175,55,0.05)",
  },
  SUFLI: {
    glow:        "rgba(220,38,38,0.65)",
    border:      "rgba(220,38,38,0.40)",
    text:        "#FCA5A5",
    dim:         "rgba(220,38,38,0.55)",
    inputBorder: "rgba(220,38,38,0.40)",
    endingGlow:  "rgba(220,38,38,0.80)",
    endingColor: "#FCA5A5",
    bg:          "rgba(220,38,38,0.05)",
  },
  SHERLI: {
    glow:        "rgba(168,85,247,0.65)",
    border:      "rgba(168,85,247,0.35)",
    text:        "#D8B4FE",
    dim:         "rgba(168,85,247,0.50)",
    inputBorder: "rgba(168,85,247,0.40)",
    endingGlow:  "rgba(139,40,180,0.80)",
    endingColor: "#C084FC",
    bg:          "rgba(168,85,247,0.05)",
  },
};

function Divider({ accent }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${accent.border})` }} />
      <div className="w-1 h-1 rounded-full" style={{ background: accent.border }} />
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${accent.border})` }} />
    </div>
  );
}

export default function HadimKasem({ hadimMode, individuals, grandTypes }) {
  const [hajath, setHajath] = useState("");

  const accent = ACCENTS[hadimMode] || ACCENTS.ULVI;
  const activeKey = hadimMode.toLowerCase();

  const grandName = grandTypes[activeKey].istintaq.hadimName;
  const individualNames = individuals
    .map(item => item.types[activeKey].istintaq.hadimName)
    .filter(Boolean);

  const allNames = [grandName, ...individualNames];

  const invocationLine = hadimMode === "ULVI"
    ? "يا روحانية هذه الأسماء"
    : "يا خدام هذه الأسماء";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-2xl border p-5 space-y-6"
      style={{
        background: "rgba(4,8,22,0.98)",
        borderColor: accent.border,
        boxShadow: `0 0 56px ${accent.glow}, 0 4px 32px rgba(0,0,0,0.70)`,
      }}
    >
      {/* ── Section title ── */}
      <div className="text-center space-y-1">
        <Divider accent={accent} />
        <p className="font-inter text-[8px] uppercase tracking-[0.3em] pt-1" style={{ color: accent.dim }}>
          Kasem Invocation
        </p>
        <p className="font-amiri text-xl font-bold" style={{ color: accent.text }} dir="rtl">
          قسم النداء
        </p>
        <Divider accent={accent} />
      </div>

      {/* ══ 1 — FINAL GRAND HADIM NAME ══ */}
      <div className="text-center space-y-1">
        <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: accent.dim }}>
          Final Grand Hadim
        </p>
        <motion.p
          dir="rtl"
          className="font-amiri font-bold leading-loose"
          style={{
            fontSize: "clamp(2rem, 9vw, 3.4rem)",
            color: accent.text,
          }}
          animate={{
            textShadow: [
              `0 0 20px ${accent.glow}, 0 0 50px ${accent.glow.replace("0.65","0.20")}`,
              `0 0 42px ${accent.glow}, 0 0 90px ${accent.glow.replace("0.65","0.38")}`,
              `0 0 20px ${accent.glow}, 0 0 50px ${accent.glow.replace("0.65","0.20")}`,
            ],
          }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {grandName}
        </motion.p>
      </div>

      <Divider accent={accent} />

      {/* ══ 2 — ALL NAMES × 2 ══ */}
      <div className="space-y-3">
        <p className="font-inter text-[8px] uppercase tracking-widest text-center" style={{ color: accent.dim }}>
          All Names (Grand + Individual) × 2
        </p>
        <div className="rounded-xl border p-4 text-center space-y-2"
          style={{ background: accent.bg, borderColor: accent.border }}>
          <p className="font-amiri text-lg leading-loose" dir="rtl" style={{ color: accent.text }}>
            {allNames.join(' ')}
          </p>
          <p className="font-amiri text-lg leading-loose" dir="rtl" style={{ color: accent.text, opacity: 0.75 }}>
            {allNames.join(' ')}
          </p>
        </div>
      </div>

      {/* ══ 3 — INVOCATION LINE ══ */}
      <div className="text-center">
        <p className="font-amiri text-base" dir="rtl" style={{ color: `${accent.text}CC` }}>{invocationLine}</p>
      </div>

      <Divider accent={accent} />

      {/* ══ 4 — HAJATH TEXTAREA ══ */}
      <div className="space-y-2">
        <p className="font-inter text-[8px] uppercase tracking-widest text-center" style={{ color: accent.dim }}>
          Enter Hajath (Need/Request)
        </p>
        <textarea
          dir="rtl"
          value={hajath}
          onChange={e => setHajath(e.target.value)}
          rows={3}
          placeholder="اذكر حاجتك هنا..."
          className="w-full rounded-xl px-4 py-3 font-amiri text-lg text-white leading-relaxed resize-none focus:outline-none caret-white placeholder:text-white/30"
          style={{ background: "rgba(6,12,32,0.98)", border: `1px solid ${accent.inputBorder}` }}
        />
        {hajath.trim() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border p-3 text-center"
            style={{ background: accent.bg, borderColor: accent.border }}
          >
            <p className="font-amiri text-base" dir="rtl" style={{ color: accent.text }}>{hajath}</p>
          </motion.div>
        )}
      </div>

      <Divider accent={accent} />

      {/* ══ 5 — CLOSING PHRASES ══ */}
      <div className="space-y-3 text-center">
        {ENDING_LINES.map((line, i) => (
          <motion.p
            key={i}
            dir="rtl"
            className="font-amiri text-xl font-bold"
            style={{ color: accent.endingColor }}
            animate={{
              textShadow: [
                `0 0 12px ${accent.endingGlow.replace("0.80","0.30")}`,
                `0 0 28px ${accent.endingGlow}`,
                `0 0 12px ${accent.endingGlow.replace("0.80","0.30")}`,
              ]
            }}
            transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}