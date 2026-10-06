import { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { PLANETS, SIZE_PLANET_MAP, PLANET_EN, buildHierarchy, triangle, toArabicIndic } from "./msEngine";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
};

const MsPlanetReport = memo(function MsPlanetReport({ mc, gridSize, lang, L }) {
  const hier = useMemo(() => (mc && gridSize) ? buildHierarchy(mc, gridSize) : null, [mc, gridSize]);

  const planetKey = hier ? SIZE_PLANET_MAP[gridSize] : null;
  const pl = planetKey ? PLANETS.find(p => p.key === planetKey) : null;

  if (!mc || !gridSize || !hier || !pl) return null;

  const planetName = lang === "en" ? PLANET_EN[planetKey] : pl.arabic;

  const items = [
    { label: L.mcLabel,    val: lang === "ar" ? toArabicIndic(hier.adjuster.toLocaleString()) : hier.adjuster.toLocaleString() },
    { label: L.totalCells, val: lang === "ar" ? toArabicIndic((gridSize * gridSize).toLocaleString()) : (gridSize * gridSize).toLocaleString() },
    { label: L.totalValue, val: lang === "ar" ? toArabicIndic(hier.leader.toLocaleString()) : hier.leader.toLocaleString() },
    { label: L.regulator,  val: lang === "ar" ? toArabicIndic(hier.regulator.toLocaleString()) : hier.regulator.toLocaleString() },
    { label: L.genGov,     val: lang === "ar" ? toArabicIndic(hier.genGov.toLocaleString()) : hier.genGov.toLocaleString() },
    { label: L.highOver,   val: lang === "ar" ? toArabicIndic(hier.highOver.toLocaleString()) : hier.highOver.toLocaleString() },
  ];

  return (
    <motion.div
      key={`planet-${mc}-${gridSize}`}
      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.35 }}
      className="rounded-2xl border p-4 space-y-3"
      style={{ background:"rgba(4,8,24,0.99)", borderColor: pl.border, boxShadow:`0 0 28px ${pl.glow}` }}
    >
      <p className="font-inter text-[10px] uppercase tracking-widest text-center" style={{ color: G.dim }}>
        {L.planetReport}
      </p>
      <div className="h-px w-full" style={{ background:`linear-gradient(90deg,transparent,${pl.color}55,transparent)` }} />

      {/* Planet identity */}
      <div className="flex items-center gap-4">
        <motion.span style={{ fontSize:"2.5rem" }}
          animate={{ textShadow:[`0 0 12px ${pl.glow}`,`0 0 28px ${pl.color}`,`0 0 12px ${pl.glow}`] }}
          transition={{ duration:2.5, repeat:Infinity, ease:"easeInOut" }}>
          {pl.icon}
        </motion.span>
        <div>
          <p className="font-amiri" dir="rtl" style={{ color: pl.color, fontSize:"28px", fontWeight:700, letterSpacing:0 }}>{pl.arabic}</p>
          <p className="font-inter text-sm font-bold uppercase tracking-widest" style={{ color:`${pl.color}aa` }}>
            {planetName} — {gridSize}×{gridSize}
          </p>
        </div>
      </div>

      {/* Report grid */}
      <div className="grid grid-cols-2 gap-2">
        {items.map(item => (
          <div key={item.label} className="rounded-xl px-3 py-2"
            style={{ background:`rgba(4,8,24,0.80)`, border:`1px solid ${pl.border}44` }}>
            <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color:"rgba(255,255,255,0.30)" }}>{item.label}</p>
            <p className="font-amiri font-bold tabular-nums text-base" style={{ color: pl.color }}>{item.val}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
});

export default MsPlanetReport;