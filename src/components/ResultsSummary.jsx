import { Hash, Sigma } from "lucide-react";
import { motion } from "framer-motion";

export default function ResultsSummary({ count, total }) {
  if (!count) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(255,255,255,0.07)" }}
        transition={{ duration: 0.35 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl hover:border-white/20 transition-colors duration-200 cursor-default"
      >
        <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center">
          <Hash className="w-5 h-5 text-white/60" />
        </div>
        <span className="font-inter text-xs text-white/40 uppercase tracking-widest">
          Total Letters
        </span>
        <span className="font-amiri text-4xl font-bold text-white">
          {count}
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(234,179,8,0.18)" }}
        transition={{ duration: 0.35, delay: 0.08 }}
        className="bg-yellow-500/10 backdrop-blur-sm border border-yellow-500/25 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-xl shadow-yellow-500/5 hover:border-yellow-500/40 transition-colors duration-200 cursor-default"
      >
        <div className="w-11 h-11 rounded-xl bg-yellow-500/20 flex items-center justify-center">
          <Sigma className="w-5 h-5 text-yellow-400" />
        </div>
        <span className="font-inter text-xs text-yellow-400/60 uppercase tracking-widest">
          Abjad Value
        </span>
        <span className="font-amiri text-4xl font-bold text-yellow-400">
          {total.toLocaleString()}
        </span>
      </motion.div>
    </div>
  );
}