import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown } from "lucide-react";

const G = {
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.14)",
};

export default function FaqSection({ faqs = [] }) {
  const [openIdx, setOpenIdx] = useState(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <div className="flex items-center gap-2">
        <HelpCircle className="w-4 h-4" style={{ color: G.text }} />
        <h2 className="font-inter text-xs font-bold uppercase tracking-widest" style={{ color: G.text }}>
          Frequently Asked Questions
        </h2>
      </div>
      <div className="space-y-1.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl overflow-hidden"
              style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${G.faint}` }}
            >
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <span className="font-inter text-xs font-semibold pr-2" style={{ color: "rgba(255,255,255,0.85)" }}>
                  {faq.question}
                </span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: G.dim }} />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="font-inter text-xs leading-relaxed px-4 pb-3" style={{ color: "rgba(255,255,255,0.60)" }}>
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}