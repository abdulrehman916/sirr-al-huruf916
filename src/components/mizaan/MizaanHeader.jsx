import { motion } from "framer-motion";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
};

export default function MizaanHeader({ number, titleAR, titleTR }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center"
        style={{ background: "rgba(212,175,55,0.12)", borderColor: G.borderHi }}>
        <span className="font-inter text-xs font-bold" style={{ color: G.text }}>{number}</span>
      </motion.div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-amiri text-base font-bold text-white">{titleAR}</span>
          <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>{titleTR}</span>
        </div>
        <div className="h-px mt-1" style={{ background: `linear-gradient(to right, ${G.faint}, transparent)` }} />
      </div>
    </div>
  );
}