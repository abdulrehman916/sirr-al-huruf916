import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";

export default function FavoritesSection({ favorites, onRemove }) {
  if (!favorites.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-yellow-400/60" />
        <span className="font-inter text-xs text-white/40 uppercase tracking-widest">Favorites</span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {favorites.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-yellow-500/15 transition-all"
              style={{ background: "linear-gradient(180deg, rgba(234,179,8,0.06) 0%, rgba(234,179,8,0.02) 100%)" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Star className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
                <span className="font-amiri text-base text-white truncate">{item.text}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className="font-inter text-xs text-yellow-400/60">{item.abjadTotal}</span>
                <span className="font-inter text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border"
                  style={{ color: item.dominantColor, borderColor: item.dominantColor + "40", background: item.dominantColor + "10" }}>
                  {item.dominantName}
                </span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-white/20 hover:text-red-400 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}