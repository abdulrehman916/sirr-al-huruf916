import { useState } from "react";
import { useVefkSession } from "../context/VefkSessionContext";
import { exportGridAsPNG, exportGridAsPDF } from "../lib/vefkExport";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
};

export function VefkActionButtons({ gridId, mode, hasResult }) {
  const { session, clearSession } = useVefkSession();
  const [exporting, setExporting] = useState(false);

  const handleDownloadPNG = async () => {
    setExporting(true);
    await exportGridAsPNG(gridId, mode);
    setExporting(false);
  };

  const handleDownloadPDF = async () => {
    setExporting(true);
    const title = mode === "ana" ? "Ana Vefk — الوفق الأصلي" : "Tanzim Vefki — تنظيم الوفق";
    await exportGridAsPDF(gridId, mode, title);
    setExporting(false);
  };

  if (!hasResult) return null;

  return (
    <div className="flex gap-2 flex-wrap justify-center mt-4">
      <button
        onClick={handleDownloadPNG}
        disabled={exporting}
        className="rounded-xl px-5 py-2.5 font-inter font-semibold text-[10px] uppercase tracking-[0.18em] border transition-all disabled:opacity-40"
        style={{
          background: "linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.06) 100%)",
          borderColor: G.borderHi,
          color: G.text,
          boxShadow: `0 0 16px ${G.glow}, inset 0 1px 0 rgba(212,175,55,0.12)`,
        }}
      >
        ↓ PNG
      </button>
      <button
        onClick={handleDownloadPDF}
        disabled={exporting}
        className="rounded-xl px-5 py-2.5 font-inter font-semibold text-[10px] uppercase tracking-[0.18em] border transition-all disabled:opacity-40"
        style={{
          background: "linear-gradient(135deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.06) 100%)",
          borderColor: G.borderHi,
          color: G.text,
          boxShadow: `0 0 16px ${G.glow}, inset 0 1px 0 rgba(212,175,55,0.12)`,
        }}
      >
        ↓ PDF
      </button>
    </div>
  );
}

export function VefkSessionIndicator() {
  const { session, clearSession } = useVefkSession();
  const hasData = session.anaData || session.tanzimData;

  if (!hasData) return null;

  return (
    <div className="flex items-center justify-between gap-2 rounded-xl px-4 py-2.5"
      style={{
        background: "linear-gradient(135deg, rgba(212,175,55,0.07) 0%, rgba(212,175,55,0.03) 100%)",
        border: `1px solid rgba(212,175,55,0.22)`,
        boxShadow: "inset 0 1px 0 rgba(212,175,55,0.08)",
      }}>
      <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.55)" }}>
        ✦ Session saved
      </span>
      <button
        onClick={clearSession}
        className="font-inter text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all"
        style={{
          background: "rgba(255,80,80,0.06)",
          borderColor: "rgba(255,80,80,0.25)",
          color: "rgba(255,110,110,0.75)",
        }}
      >
        Clear
      </button>
    </div>
  );
}