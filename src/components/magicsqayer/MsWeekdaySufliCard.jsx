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

export default function MsWeekdaySufliCard({ name, dayName }) {
  return (
    <div className="rounded-xl border p-4 space-y-3"
      style={{ background: "rgba(255,159,90,0.03)", borderColor: "rgba(255,159,90,0.18)" }}>
      <p className="font-inter text-[10px] uppercase tracking-[0.25em] text-center"
        style={{ color: G.dim, letterSpacing: "0.25em" }}>
        SELECTED SUFLI
      </p>
      <SectionDivider />
      <p className="font-amiri text-xl font-bold text-center" dir="rtl"
        style={{ color: "rgba(255,159,90,0.85)", textShadow: "0 0 10px rgba(255,159,90,0.20)" }}>
        {name}
      </p>
      <p className="font-inter text-[8px] uppercase tracking-widest text-center"
        style={{ color: "rgba(255,159,90,0.30)" }}>
        {dayName}
      </p>
    </div>
  );
}