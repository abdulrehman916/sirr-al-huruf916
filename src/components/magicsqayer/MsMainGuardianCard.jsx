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

const SUFFIX_LABELS = {
  "ar-angel": "Arabic Angel · −٤١",
  "ar-jinn": "Arabic Jinn · −٣١٩",
  "ar-sufli-hadim": "Sufli Hadim · −٣١٦",
  "heb-angel": "Hebrew Angel · −٣١",
  "heb-jinn": "Hebrew Jinn · −٣٢٩",
};

export default function MsMainGuardianCard({ name, suffix }) {
  if (!name) return null;

  return (
    <div className="rounded-xl border p-4 space-y-3"
      style={{ background: "rgba(79,227,255,0.04)", borderColor: "rgba(79,227,255,0.25)" }}>
      <p className="font-inter text-[10px] uppercase tracking-[0.25em] text-center"
        style={{ color: G.dim, letterSpacing: "0.25em" }}>
        SELECTED MAIN GUARDIAN
      </p>
      <SectionDivider />
      <p className="font-amiri text-2xl font-bold text-center" dir="rtl"
        style={{ color: "#4FE3FF", textShadow: "0 0 16px rgba(79,227,255,0.30)" }}>
        {name}
      </p>
      <p className="font-inter text-[8px] uppercase tracking-widest text-center"
        style={{ color: "rgba(79,227,255,0.35)" }}>
        {SUFFIX_LABELS[suffix] || ""}
      </p>
    </div>
  );
}