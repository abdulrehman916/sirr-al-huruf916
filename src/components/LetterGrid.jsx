import { motion } from "framer-motion";

export default function LetterGrid({ letters }) {
  if (!letters.length) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
      {letters.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.018, duration: 0.25, ease: "easeOut" }}
          className="flex flex-col items-center group cursor-default"
        >
          <motion.div
            whileHover={{ scale: 1.12, y: -3 }}
            transition={{ type: "spring", stiffness: 350, damping: 18 }}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-sm hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-colors duration-200">
            <span className="font-amiri text-xl sm:text-2xl text-white group-hover:text-yellow-300 transition-colors">
              {item.original}
            </span>
            </motion.div>
          <span className="font-inter text-[11px] text-yellow-400/80 font-semibold mt-1.5">
            {item.value}
          </span>
        </motion.div>
      ))}
    </div>
  );
}