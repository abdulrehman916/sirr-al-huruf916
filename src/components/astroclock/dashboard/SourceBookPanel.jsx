// ═══════════════════════════════════════════════════════════════
// SOURCE BOOK PANEL — reusable renderer for source-book knowledge
// Arabic is the AUTHORITATIVE master. ml/en fields render only when
// non-empty (left empty for future addition — no placeholder text).
// ═══════════════════════════════════════════════════════════════
import { SOURCE_BOOK_TOPICS } from "@/lib/astroClockSourceBookData";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.18)",
  arText: "rgba(255,255,255,0.85)",
  mlText: "#4ADE80",
  enText: "rgba(255,255,255,0.55)",
};

function LangLine({ label, value, color }) {
  if (!value || !value.trim()) return null;
  return (
    <div className="mt-1.5">
      <span className="font-inter text-[8px] uppercase tracking-wider font-bold mr-1.5" style={{ color: G.dim }}>{label}</span>
      <span className="font-inter text-[11px] leading-relaxed" style={{ color }}>{value}</span>
    </div>
  );
}

function Block({ block }) {
  const ar = block.ar || "";
  const ml = block.ml || "";
  const en = block.en || "";

  if (block.kind === "table") {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] border-collapse" dir="rtl">
          <thead>
            <tr>
              {block.columns.map((c, i) => (
                <th key={i} className="font-amiri font-bold px-2 py-1.5 text-right"
                  style={{ color: G.text, borderBottom: `1px solid ${G.border}` }}>{c.ar}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((r, i) => (
              <tr key={i} style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                <td className="font-amiri px-2 py-1.5 text-right align-top" style={{ color: G.arText, width: "42%" }}>{r[0]}</td>
                <td className="font-amiri px-2 py-1.5 text-right align-top" style={{ color: "rgba(255,255,255,0.70)" }}>{r[1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (block.kind === "list") {
    return (
      <div className="space-y-1.5">
        {(block.items || []).map((it, i) => (
          <div key={i} className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${G.border}` }}>
            <p className="font-amiri text-[12px] leading-loose text-right" style={{ color: G.arText, direction: "rtl" }}>{it.ar}</p>
            <LangLine label="ML" value={it.ml} color={G.mlText} />
            <LangLine label="EN" value={it.en} color={G.enText} />
          </div>
        ))}
      </div>
    );
  }

  // heading | prose | poetry | dua
  const isHeading = block.kind === "heading";
  const isPoetry = block.kind === "poetry";
  const isDua = block.kind === "dua";

  return (
    <div className="rounded-lg p-3" style={{
      background: isDua ? "rgba(129,140,248,0.05)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isDua ? "rgba(129,140,248,0.18)" : G.border}`,
    }}>
      {isHeading ? (
        <p className="font-amiri text-[13px] font-bold text-right leading-relaxed" style={{ color: G.text, direction: "rtl" }}>{ar}</p>
      ) : isPoetry ? (
        <p className="font-amiri text-[12px] leading-loose text-center whitespace-pre-line" style={{ color: G.arText, direction: "rtl" }}>{ar}</p>
      ) : isDua ? (
        <p className="font-amiri text-[14px] leading-loose text-center" style={{ color: G.arText, direction: "rtl" }}>{ar}</p>
      ) : (
        <p className="font-amiri text-[12px] leading-loose text-right" style={{ color: G.arText, direction: "rtl" }}>{ar}</p>
      )}
      <LangLine label="ML" value={ml} color={G.mlText} />
      <LangLine label="EN" value={en} color={G.enText} />
    </div>
  );
}

export default function SourceBookPanel({ topicId }) {
  const topic = SOURCE_BOOK_TOPICS[topicId];
  if (!topic) return null;

  return (
    <div className="space-y-2 mt-2">
      {/* Source attribution */}
      <div className="flex items-center gap-2 px-1">
        <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.15)" }} />
        <span className="font-amiri text-[10px]" style={{ color: G.dim, direction: "rtl" }}>📖 {topic.source.ar}</span>
        <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.15)" }} />
      </div>

      {/* Blocks */}
      {topic.blocks.map((b, i) => <Block key={i} block={b} />)}
    </div>
  );
}