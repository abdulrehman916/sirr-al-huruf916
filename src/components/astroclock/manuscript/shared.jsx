// Shared helpers for the manuscript-compliant Dashboard cards.
// No calculations — display helpers only. Every card shows its manuscript source.

export const DAY_EN_MAP = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const ZODIAC_EN_MAP = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

export function SourceTag({ children }) {
  return (
    <p className="font-inter text-[9px] mt-2 pt-2 flex items-center gap-1" style={{ color: "rgba(212,175,55,0.45)", borderTop: "1px solid rgba(212,175,55,0.10)" }}>
      <span>📖</span><span>{children}</span>
    </p>
  );
}

export function LayerLabel({ children }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-1.5 first:mt-0">
      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.30))" }} />
      <span className="font-inter text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "rgba(212,175,55,0.65)" }}>{children}</span>
      <span className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(212,175,55,0.30), transparent)" }} />
    </div>
  );
}

export function ArabicLine({ children }) {
  if (!children) return null;
  return <p className="font-amiri text-[11px] mt-1" style={{ color: "rgba(212,175,55,0.55)", direction: "rtl", textAlign: "right", lineHeight: 1.8 }}>{children}</p>;
}

export function ChipList({ items, color = "#F5D060" }) {
  if (!items || items.length === 0) return <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.30)" }}>—</p>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((a, i) => (
        <span key={i} className="font-inter text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${color}14`, color: `${color}cc`, border: `1px solid ${color}22` }}>{a}</span>
      ))}
    </div>
  );
}