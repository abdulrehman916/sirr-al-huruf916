// ═══════════════════════════════════════════════════════════════
// PLANT DETAIL PAGE — Dictionary module only
// Zero imports from sealed engines.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Leaf } from "lucide-react";
import PageLayout from "../components/PageLayout";
import { PLANTS_DATA, PLANT_CATEGORIES } from "../lib/plantsData";

const P = {
  border:   "rgba(34,197,94,0.30)",
  borderHi: "rgba(34,197,94,0.65)",
  glow:     "rgba(34,197,94,0.18)",
  text:     "#86EFAC",
  dim:      "rgba(134,239,172,0.55)",
  faint:    "rgba(134,239,172,0.14)",
  bg:       "rgba(34,197,94,0.06)",
  bgHi:     "rgba(34,197,94,0.14)",
};

function Divider() {
  return (
    <div className="h-px my-4" style={{ background: `linear-gradient(90deg, transparent, ${P.faint}, transparent)` }} />
  );
}

function Field({ label, value, arabic = false, rtl = false }) {
  if (!value) return null;
  return (
    <div className="space-y-1.5">
      <p className="font-inter text-[8.5px] uppercase tracking-widest font-semibold" style={{ color: P.text, opacity: 0.75 }}>{label}</p>
      <p
        dir={rtl ? "rtl" : "ltr"}
        className={arabic ? "font-amiri text-lg leading-relaxed font-semibold" : "font-inter text-base leading-relaxed font-medium"}
        style={{ color: "rgba(255,255,255,0.92)", WebkitFontSmoothing: "antialiased" }}
      >
        {value}
      </p>
    </div>
  );
}

export default function PlantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const plant = useMemo(() => PLANTS_DATA.find(p => String(p.id) === String(id)), [id]);
  const catLabel = PLANT_CATEGORIES.find(c => c.id === plant?.category)?.label ?? plant?.category;

  if (!plant) {
    return (
      <PageLayout>
        <div className="text-center py-24 space-y-4">
          <Leaf className="w-12 h-12 mx-auto" style={{ color: P.dim }} />
          <p className="font-amiri text-xl" style={{ color: P.dim }}>Entry not found</p>
          <button onClick={() => navigate("/plants")} className="font-inter text-xs underline" style={{ color: P.text }}>
            ← Back to Dictionary
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-5">

        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/plants")}
          className="flex items-center gap-2 font-inter text-xs font-semibold uppercase tracking-widest px-3 py-2 rounded-xl border"
          style={{ color: P.text, borderColor: P.border, background: P.bg, WebkitTapHighlightColor: "transparent" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dictionary
        </motion.button>

        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="rounded-2xl border p-5 space-y-3"
          style={{ background: P.bgHi, borderColor: P.borderHi, boxShadow: `0 0 32px ${P.glow}` }}
        >
          <div dir="rtl">
            <p className="font-amiri font-bold leading-tight break-words"
              style={{ fontSize: "clamp(1.7rem,8vw,3.0rem)", color: P.text, textShadow: "0 0 28px rgba(34,197,94,0.40)", WebkitTextStroke: "0.4px #86EFAC", wordBreak: "break-word", overflowWrap: "break-word" }}>
              {plant.ArabicName}
            </p>
          </div>
          <p className="font-inter font-bold break-words" style={{ fontSize: "clamp(1.2rem, 5vw, 1.5rem)", color: "rgba(255,255,255,0.98)", letterSpacing: "-0.4px", overflowWrap: "break-word" }}>
            {plant.EnglishName}
          </p>
          {plant.MalayalamName && (
            <p className="font-inter text-base font-semibold" style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "-0.2px" }}>{plant.MalayalamName}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="font-inter text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full border"
              style={{ color: P.dim, borderColor: P.faint, background: "rgba(134,239,172,0.08)" }}>
              {catLabel}
            </span>
            {plant.ScientificName && (
              <span className="font-inter text-[10px] italic" style={{ color: "rgba(255,255,255,0.40)" }}>
                {plant.ScientificName}
              </span>
            )}
          </div>
          {plant.PageReference && (
            <div className="flex items-center gap-1.5 pt-1">
              <BookOpen className="w-3 h-3" style={{ color: P.dim }} />
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(134,239,172,0.45)" }}>
                {plant.PageReference}
              </p>
            </div>
          )}
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="rounded-2xl border p-5 space-y-1"
          style={{ background: P.bg, borderColor: P.border }}
        >
          <Field label="Description" value={plant.DescriptionEnglish} />
          {plant.DescriptionEnglish && plant.DescriptionMalayalam && <Divider />}
          <Field label="വിവരണം" value={plant.DescriptionMalayalam} />
        </motion.div>

        {/* Uses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          className="rounded-2xl border p-5 space-y-1"
          style={{ background: P.bg, borderColor: P.border }}
        >
          <p className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: P.dim }}>
            Medicinal Uses
          </p>
          <Field label="English" value={plant.UsesEnglish} />
          {plant.UsesEnglish && plant.UsesMalayalam && <Divider />}
          <Field label="Malayalam" value={plant.UsesMalayalam} />
        </motion.div>

        <p className="font-inter text-[8px] uppercase tracking-widest text-center pt-2"
          style={{ color: "rgba(134,239,172,0.12)" }}>
          ✦ قاموس النباتات والمواد — Plants & Ingredients Dictionary ✦
        </p>

      </div>
    </PageLayout>
  );
}