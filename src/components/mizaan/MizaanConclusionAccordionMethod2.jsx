// ═══════════════════════════════════════════════════════════════
// CONCLUSION — Method 2 only. Display-only accordion, no calculations.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";

const PARAGRAPHS = [
  "ഇതിനുശേഷം, Esma-i A'van, Esma-i Kasem എന്നിവ അസീമത്തിൽ ചേർക്കുന്നു. Esma-i Kitabet അസീമത്തിൽ ചേർക്കില്ല. ഈ ഒമ്പത് മിസാനുകളിൽ നിന്ന് ലഭിക്കുന്ന Esma-i A'van, Esma-i Kasem എന്നിവ ഈ ക്രമപ്രകാരം അസീമത്തിൽ ചേർക്കുന്നു. അമൽ മുഹബ്ബത്തിനു (സ്നേഹത്തിനു) വേണ്ടിയാണെങ്കിൽ ഈ അസീമത്തിലേക്ക് പേരുകൾ ചേർക്കുന്നു.",
  "ശൈഖ് തംതം സമൂർ ഹിന്ദി (റഹ്മത്തുള്ളാഹി അലൈഹി) യുടെ വാക്കനുസരിച്ച് അസീമത്ത് ചേർക്കാൻ: Esma-i A'van ന്റെ മുമ്പിൽ \"യാ\" എന്ന വിളിയും, Esma-i Kasem ന്റെ മുമ്പിൽ \"ബി ഹക്കി\" എന്ന വാക്കും ചേർക്കുന്നു. Esma-i Kitabet അസീമത്തിൽ ഉൾപ്പെടുത്തുകയോ ചേർക്കുകയോ ചെയ്യില്ല.",
  "അസീമത്ത് ചേർക്കുന്നതിൽ വഫ്ക് വയ്ക്കേണ്ടതില്ല.",
  "നീ ഓതാൻ പോകുന്ന അസീമത്തിന്റെ എണ്ണം, മത്‌ലൂബിന്റെ പേരിന്റെ എബ്ജദ്-ഇ കബീർ മൂല്യത്തിന്റെ ആകെത്തുകയ്ക്ക് തുല്യമായിരിക്കണം.",
  "അമൽ ആരംഭിക്കുമ്പോഴും അസീമത്ത് ഓതുമ്പോഴും, നീ ചെയ്യുന്ന അമലിന് അനുയോജ്യമായ ഖൈർ (നല്ല) അല്ലെങ്കിൽ ശർ (ദുഷിച്ച) ധൂപങ്ങൾ (ബുഖൂർ) കത്തിക്കണം.",
  "വഫ്ക് ഉണ്ടാക്കണമെന്ന് ആഗ്രഹിക്കുന്നുവെങ്കിൽ:",
  "ഒമ്പത് മിസാനുകളുടെ ആകെത്തുക എടുക്കുക.",
  "ഇത് നീ നിശ്ചയിച്ച സമയത്ത് നാല്-അക്ക വഫ്ക് അല്ലെങ്കിൽ മൂന്ന്-അക്ക വഫ്ക് ആയി എഴുതുക.",
  "പിന്നീട് ഈ വഫ്ക് നിന്റെ ശരീരത്തിൽ കൊണ്ടുനടക്കുക, അല്ലെങ്കിൽ അസീമത്ത് ഓതുമ്പോൾ വഫ്കിലേക്ക് നോക്കിക്കൊണ്ട് ഓതുക.",
];

export default function MizaanConclusionAccordionMethod2() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{
        background: "rgba(3,6,20,0.99)",
        borderColor: "rgba(212,175,55,0.60)",
        boxShadow: "0 0 80px rgba(212,175,55,0.14), 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)",
      }}>
      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.60) 40%, rgba(245,208,96,0.53) 50%, rgba(212,175,55,0.60) 60%, transparent 95%)" }} />

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-6 py-5"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📖</span>
          <span className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: "#F5D060" }}>
            Conclusion
          </span>
        </div>
        {isOpen
          ? <ChevronDown className="w-4 h-4" style={{ color: "#F5D060" }} />
          : <ChevronRight className="w-4 h-4" style={{ color: "#F5D060" }} />}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 pb-5 space-y-4">
              {PARAGRAPHS.map((para, i) => (
                <p key={i} className="font-inter text-[13px] leading-relaxed" style={{ color: "rgba(245,208,96,0.55)", lineHeight: 1.9 }}>
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.60) 40%, rgba(245,208,96,0.53) 50%, rgba(212,175,55,0.60) 60%, transparent 95%)" }} />
    </div>
  );
}