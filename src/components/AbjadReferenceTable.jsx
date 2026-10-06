import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ABJAD_MAP } from "../lib/abjadValues";
import { motion, AnimatePresence } from "framer-motion";

const orderedLetters = [
  'ا','ب','ج','د','ه','و','ز','ح','ط',
  'ي','ك','ل','م','ن','س','ع',
  'ف','ص','ق','ر','ش','ت',
  'ث','خ','ذ','ض','ظ','غ'
];

export default function AbjadReferenceTable() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 mx-auto text-xs text-white/30 hover:text-white/60 transition-colors font-inter uppercase tracking-widest"
      >
        {open ? "Hide" : "Show"} Abjad Reference
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-5 bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 max-w-sm mx-auto" dir="rtl">
                {orderedLetters.map((letter) => (
                  <div
                    key={letter}
                    className="flex flex-col items-center bg-white/5 border border-white/10 rounded-lg py-2 px-1 hover:border-yellow-500/30 hover:bg-yellow-500/5 transition-all"
                  >
                    <span className="font-amiri text-lg text-white">{letter}</span>
                    <span className="font-inter text-[9px] text-yellow-400/70 font-semibold">
                      {ABJAD_MAP[letter]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}