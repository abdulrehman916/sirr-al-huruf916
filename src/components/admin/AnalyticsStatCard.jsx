/**
 * AnalyticsStatCard — Reusable stat card for the analytics dashboard.
 */
export default function AnalyticsStatCard({ icon: Icon, label, value, color, sublabel }) {
  const G = {
    text: "#F5D060",
    dim: "rgba(212,175,55,0.55)",
  };

  return (
    <div
      className="rounded-xl border p-3 flex items-center gap-3"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: (color || G.text) + "15", border: "1px solid " + (color || G.text) + "30" }}
      >
        <Icon className="w-4 h-4" style={{ color: color || G.text }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-lg font-bold text-white leading-tight">{value}</p>
        <p className="text-[10px] text-white/40 leading-tight truncate">{label}</p>
        {sublabel && <p className="text-[9px] text-white/25 truncate">{sublabel}</p>}
      </div>
    </div>
  );
}