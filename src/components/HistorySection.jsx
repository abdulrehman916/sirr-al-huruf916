import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Clock } from "lucide-react";

export default function HistorySection({ history, onClear, onSelect }) {
  if (!history.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/40" />
          <span className="font-inter text-xs text-white/40 uppercase tracking-widest">Recent Calculations</span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs text-white/30 hover:text-red-400 transition-colors font-inter"
        >
          <Trash2 className="w-3 h-3" />
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {history.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelect(item)}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 cursor-pointer transition-all"
              style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg flex-shrink-0">{item.dominantIcon || "◈"}</span>
                <span className="font-amiri text-base text-white truncate">{item.text}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className="font-inter text-xs text-white/40">{item.abjadTotal}</span>
                <span className="font-inter text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{ color: item.dominantColor, borderColor: item.dominantColor + "40", background: item.dominantColor + "10" }}>
                  {item.dominantName}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}