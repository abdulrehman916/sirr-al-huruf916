// ═══════════════════════════════════════════════════════════════
// REPORT SECTION — Reusable wrapper for each of the 11 sections
// ═══════════════════════════════════════════════════════════════
import { G } from "./shared";

export default function ReportSection({
  number, title, titleMl, icon: Icon, lang, accent, children,
}) {
  const accentColor = accent || G.text;
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${G.border}`,
        boxShadow:
          "0 4px 40px rgba(0,0,0,0.60), inset 0 1px 0 rgba(212,175,55,0.08)",
      }}
    >
      <div
        className="flex items-center gap-3 p-4"
        style={{ borderBottom: `1px solid ${G.border}` }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: G.bgHi, border: `1px solid ${G.borderHi}` }}
        >
          <Icon className="w-5 h-5" style={{ color: accentColor }} />
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-inter text-[10px] font-bold w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: G.bgHi, color: accentColor, border: `1px solid ${G.border}` }}
          >
            {number}
          </span>
          <h3
            className={lang === "ml" ? "font-malayalam text-sm font-bold" : "font-inter text-sm font-bold"}
            style={{ color: "#fff" }}
          >
            {lang === "ml" ? titleMl : title}
          </h3>
        </div>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}