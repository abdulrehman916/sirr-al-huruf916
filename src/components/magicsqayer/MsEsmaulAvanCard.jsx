import { useMemo } from "react";
import { numToArabic } from "./msEngine";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  dim: "rgba(212,175,55,0.55)",
};

function SectionDivider() {
  return (
    <div className="mx-auto" style={{
      width: 48, height: 1,
      background: `linear-gradient(90deg, transparent, ${G.borderHi}, transparent)`,
    }} />
  );
}

export default function MsEsmaulAvanCard({ grid }) {
  const names = useMemo(() => {
    if (!grid || !grid.grid) return [];
    return grid.grid.flat().map(v => numToArabic(v) + 'طاطيل');
  }, [grid]);

  if (names.length === 0) return null;

  return (
    <div className="rounded-xl border p-4 space-y-3"
      style={{ background: "rgba(212,175,55,0.04)", borderColor: "rgba(212,175,55,0.18)" }}>
      <p className="font-inter text-[10px] uppercase tracking-[0.25em] text-center"
        style={{ color: G.dim, letterSpacing: "0.25em" }}>
        ESMAUL AVAN
      </p>
      <SectionDivider />
      <div className="flex flex-wrap gap-2 justify-center">
        {names.map((name, i) => (
          <span key={i} className="font-amiri font-bold px-2.5 py-1 rounded-lg text-sm"
            dir="rtl"
            style={{
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.20)",
              color: "rgba(245,235,210,0.85)",
            }}>
            {name}
          </span>
        ))}
      </div>
      <p className="font-inter text-[8px] uppercase tracking-widest text-center"
        style={{ color: "rgba(212,175,55,0.30)" }}>
        {names.length} {names.length === 1 ? "NAME" : "NAMES"} · N²
      </p>
    </div>
  );
}