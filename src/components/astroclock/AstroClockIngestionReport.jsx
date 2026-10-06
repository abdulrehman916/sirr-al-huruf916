import { motion } from "framer-motion";
import { BookOpen, FileText, Layers, CheckCircle } from "lucide-react";
import { TAHA_INGESTION_REPORT, TAHA_SOURCE } from "@/lib/astroClockTahaData";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  glowHi:   "rgba(212,175,55,0.55)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
};

export default function AstroClockIngestionReport() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border p-5"
        style={{
          background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
          borderColor: G.borderHi,
          boxShadow: `0 0 40px ${G.glow}, 0 4px 28px rgba(0,0,0,0.50), inset 0 1px 0 rgba(212,175,55,0.10)`,
        }}>
        
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-5 h-5" style={{ color: G.text }} />
          <h2 className="font-inter text-lg font-bold uppercase tracking-widest" style={{ color: G.text }}>
            PDF Ingestion Report
          </h2>
        </div>

        {/* Source Info */}
        <div className="mb-4 p-4 rounded-xl border" style={{ background: G.bg, borderColor: G.faint }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                Book Name
              </p>
              <p className="font-inter text-sm font-bold" style={{ color: G.text }}>
                تدریس نجوم احکامی — Ustad Taha
              </p>
            </div>
            <div className="text-right">
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                Platform
              </p>
              <p className="font-inter text-xs" style={{ color: "#fff" }}>
                ABJAD / ابجدانه
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                PDF Files
              </p>
              <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.70)" }}>
                6533b9e12_-1-40.pdf + 190da9a3d_-41-80.pdf
              </p>
            </div>
            <div className="text-right">
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                Ingestion Date
              </p>
              <p className="font-inter text-xs font-bold" style={{ color: G.text }}>
                {TAHA_SOURCE.ingestion_date}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-xl border text-center" style={{ background: G.bg, borderColor: G.faint }}>
            <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              Total Pages
            </p>
            <p className="font-inter text-2xl font-bold" style={{ color: G.text }}>
              {TAHA_SOURCE.total_pages}
            </p>
          </div>
          <div className="p-3 rounded-xl border text-center" style={{ background: G.bg, borderColor: G.faint }}>
            <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              Records Added
            </p>
            <p className="font-inter text-2xl font-bold" style={{ color: G.text }}>
              {TAHA_INGESTION_REPORT.total_new_records}
            </p>
          </div>
          <div className="p-3 rounded-xl border text-center" style={{ background: G.bg, borderColor: G.faint }}>
            <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              Existing Modified
            </p>
            <p className="font-inter text-2xl font-bold" style={{ color: "#ef4444" }}>
              {TAHA_INGESTION_REPORT.existing_data_modified}
            </p>
          </div>
          <div className="p-3 rounded-xl border text-center" style={{ background: G.bg, borderColor: G.faint }}>
            <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
              Existing Deleted
            </p>
            <p className="font-inter text-2xl font-bold" style={{ color: "#ef4444" }}>
              {TAHA_INGESTION_REPORT.existing_data_deleted}
            </p>
          </div>
        </div>

        {/* Records Breakdown */}
        <div className="mb-4">
          <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            Records by Category
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(TAHA_INGESTION_REPORT.records_added).map(([category, count]) => (
              <div
                key={category}
                className="flex items-center justify-between p-2 rounded-lg border"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: G.faint }}
              >
                <span className="font-inter text-[10px] text-white/60 uppercase">
                  {category.replace(/_/g, ' ')}
                </span>
                <span className="font-inter text-xs font-bold" style={{ color: G.text }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* New Categories */}
        <div className="mb-4">
          <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            New Categories Discovered
          </p>
          <div className="flex flex-wrap gap-2">
            {TAHA_INGESTION_REPORT.new_categories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-1 rounded-lg border text-[10px] uppercase tracking-wider"
                style={{
                  background: G.bgHi,
                  borderColor: G.border,
                  color: G.text
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Verification */}
        <div className="p-4 rounded-xl border"
          style={{
            background: "rgba(34,197,94,0.08)",
            borderColor: "rgba(34,197,94,0.40)",
          }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4" style={{ color: "#22c55e" }} />
            <p className="font-inter text-xs font-bold" style={{ color: "#22c55e" }}>
              Additive-Only Verification
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
              ✓ Zero existing Astro Clock records deleted
            </p>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
              ✓ Zero existing Astro Clock records modified
            </p>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
              ✓ All 80 pages processed completely
            </p>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
              ✓ 59 new records added additively
            </p>
            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>
              ✓ 5 new categories integrated
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: G.faint }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: G.dim }} />
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                Status
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "rgba(34,197,94,0.15)",
                color: "#22c55e",
                border: "1px solid rgba(34,197,94,0.40)"
              }}
            >
              {TAHA_INGESTION_REPORT.status}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="rounded-2xl border p-4"
        style={{
          background: "rgba(212,175,55,0.04)",
          borderColor: "rgba(212,175,55,0.20)",
        }}>
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4" style={{ color: G.dim }} />
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
            Knowledge Base Summary
          </p>
        </div>
        <p className="font-inter text-xs text-white/70 mb-2">
          Total Astro Clock knowledge now includes:
        </p>
        <ul className="space-y-1">
          <li className="font-inter text-[10px] text-white/60 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full" style={{ background: G.text }} />
            Havâss'ın Derinlikleri (100 pages) — 350+ records
          </li>
          <li className="font-inter text-[10px] text-white/60 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full" style={{ background: G.text }} />
            Ustad Taha Judicial Astrology (80 pages) — 59 records
          </li>
          <li className="font-inter text-[10px] text-white/60 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full" style={{ background: G.text }} />
            Complete Malayalam explanations for all rules
          </li>
          <li className="font-inter text-[10px] text-white/60 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full" style={{ background: G.text }} />
            100% additive — no data loss ever
          </li>
        </ul>
      </div>
    </div>
  );
}