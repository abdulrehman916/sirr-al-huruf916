// ═══════════════════════════════════════════════════════════════
// CONCLUSION — Method 3 only. Display-only accordion, no calculations.
// Based on the Method 1 Conclusion, adapted for Method 3:
// manual Wafq construction/calculation paragraphs removed (Method 3
// generates the Wafq automatically), and the Kitabet/A'van/Kasem
// recitation instruction replaced with the Method 3 recitation rule.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";

const STEPS = [
  "Esma-i Kitabet, Esma-i A'van, Esma-i Kasem എന്നീ വഫ്ക് ക്രമപ്രകാരം പൂർത്തിയായശേഷം ചെമ്പിലോ പാത്രത്തിലോ മൺചട്ടി കഷണത്തിലോ എഴുതി, പ്രബലമായ അനാസിർ അഗ്നിയായതിനാൽ തീയുടെ സമീപത്തോ തീയുടെ അടിയിലോ കുഴിച്ചിടുക.",
  "Method 3-ൽ Esma-i Kitabet, Esma-i A'van, Esma-i Kasem എന്നിവ ഓതേണ്ടതില്ല. അവ വഖ്ഫ് തയ്യാറാക്കുന്നതിനായി മാത്രം ഉപയോഗിക്കുന്നതാണ്.",
  "Method 3-ൽ അവസാനം ലഭിച്ച അസ്മാഉൽ ഹുസ്നാ നാമങ്ങൾ ഒരുമിച്ച് ഒരു ഓത്തായി കണക്കാക്കണം. ഈ മുഴുവൻ നാമങ്ങളും തുടർച്ചയായി ഒരുമിച്ച് ചൊല്ലി, അവസാനം ലഭിച്ച മൊത്തം അബ്ജദ് സംഖ്യ (Final Abjad Total) എത്രയാണോ അത്ര പ്രാവശ്യം ദിവസേന ആവർത്തിക്കണം. ഓരോ നാമവും അതിന്റേതായ അബ്ജദ് എണ്ണമനുസരിച്ച് പ്രത്യേകം ഓതേണ്ടതല്ല.",
  "ഉദാഹരണത്തിന്, മൂന്ന് നാമങ്ങൾ ലഭിച്ചാൽ: ആദ്യം നാമം 1, പിന്നെ നാമം 2, പിന്നെ നാമം 3 — ഇവ മൂന്നും ഒരുമിച്ച് ചൊല്ലി, ഇത് തന്നെ മൊത്തം അബ്ജദ് എണ്ണത്തിന് തുല്യമായ തവണ ആവർത്തിക്കുക.",
  "കുറഞ്ഞത് ഏഴ് (7) ദിവസം തുടരണം.",
  "ആവശ്യത്തിന്റെ ഗൗരവമനുസരിച്ച് 11, 21, 41 അല്ലെങ്കിൽ അതിലധികം ദിവസങ്ങൾ വരെ തുടരാവുന്നതാണ്.",
  "വർദ്ധിപ്പിക്കേണ്ടത് ദിവസങ്ങളുടെ എണ്ണം മാത്രമാണ്. ദിവസേനയുള്ള ഓത്തുകളുടെ എണ്ണം മൊത്തം അബ്ജദ് സംഖ്യയ്ക്ക് തുല്യമായിരിക്കണം.",
  "വഫ്കുകൾ മത്‌ലൂബിന്റെ ദിവസത്തിലും സമയത്തിലും ചെയ്യേണ്ടത് പ്രധാനമാണ്.",
  "ഒരു കാര്യം ആരംഭിക്കുമ്പോൾ, മത്‌ലൂബിന്റെ ദിവസവും സമയവും നന്നായി അറിഞ്ഞിരിക്കണം. ഒരു മാസം നാല് ആഴ്ചകളാണ്. ഓരോ അനാസിറും നാല് വീതം ദർജ (ഘട്ടം) ആണ്. ചില പണ്ഡിതന്മാരുടെ അഭിപ്രായത്തിൽ ജല അനാസിർ അഞ്ച് ദർജയാണ്.",
  "ഒന്നാം ആഴ്ച: മുഹബ്ബത്ത് (സ്നേഹം), ആകർഷണം, കീഴ്പ്പെടുത്തൽ, സൗഹൃദം, ഉത്തേജനം, ആകർഷിച്ചുവരുത്തൽ എന്നിവയ്ക്കായി അനാസിറിന്റെ ഒന്നാം ദർജ ബസ്ത് ചെയ്യുക.",
  "രണ്ടാം ആഴ്ച: ആവശ്യനിവൃത്തി, ശിഫാ (രോഗശാന്തി), രോഗിയെ സുഖപ്പെടുത്തൽ എന്നിവയ്ക്കായി അനാസിറിന്റെ രണ്ടാം ദർജ ബസ്ത് ചെയ്യുക.",
  "മൂന്നാം ആഴ്ച: നാവ് ബന്ധനം, ഉറക്കബന്ധനം, സ്ത്രീകളെയും പുരുഷന്മാരെയും ബന്ധിക്കൽ, രോഗപ്പെടുത്തൽ, മറ്റ് ബന്ധനങ്ങൾ എന്നിവയ്ക്കായി അനാസിറിന്റെ മൂന്നാം ദർജ ബസ്ത് ചെയ്യുക.",
  "നാലാം ആഴ്ച: കഹ്ർ (ശിക്ഷ), നാശം, വേർപെടുത്തൽ, ശത്രുത എന്നിവയ്ക്കായി അനാസിറിന്റെ നാലാം ദർജ ബസ്ത് ചെയ്യുക.",
  "ഈ നിയമമനുസരിച്ച് അമൽ ചെയ്താൽ അല്ലാഹുവിന്റെ അനുമതിയോടെ വിജയിക്കും.",
  "മത്‌ലൂബിന്റെ അനാസിർ മണ്ണ്, വായു അല്ലെങ്കിൽ ജലം ആണെങ്കിൽ, അവയുമായി ബന്ധപ്പെട്ട അനാസിർ ദർജകൾ ഇതേ ക്രമത്തിൽ ബസ്ത് ചെയ്യുക.",
  "അമൽ ചെയ്യേണ്ട ദിവസങ്ങളും സമയങ്ങളും ശരിയായി തിരഞ്ഞെടുക്കണം.",
  "ഞായർ, വ്യാഴം, വെള്ളി ദിവസങ്ങളിൽ സൂര്യോദയ സമയത്തെ ഒന്നാം മണിക്കൂർ ഗുണകരമായ അമലുകൾക്കാണ്.",
  "തിങ്കൾ, ബുധൻ ദിവസങ്ങളിൽ സൂര്യോദയ സമയത്തെ ഒന്നാം മണിക്കൂർ നാവ് ബന്ധനം, ഉറക്കബന്ധനം, പുരുഷത്വ ബന്ധനം എന്നിവയ്ക്കാണ്.",
  "ചൊവ്വ, ശനി ദിവസങ്ങളിൽ സൂര്യോദയ സമയത്തെ ഒന്നാം മണിക്കൂർ വേർപെടുത്തൽ, കഹ്ർ, നശിപ്പിക്കൽ, നാശം, ശത്രുത എന്നിവയ്ക്കാണ്.",
  "നിബന്ധനകൾ പൂർണ്ണമായി പാലിക്കുക. കുറവോ തെറ്റോ വരുത്തിയാൽ അമൽ വൃഥാവിലാകും.",
  "ഈ പ്രവർത്തനങ്ങൾ പറയപ്പെട്ട ദിവസങ്ങളിൽ സൂര്യോദയ സമയത്തെ ഒന്നാം മണിക്കൂറിനുള്ളിൽ ചെയ്യണം.",
];

export default function Method3ConclusionAccordion() {
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
            Conclusion — Practical Application
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
            <div className="px-6 pb-5 space-y-3">
              {STEPS.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="font-inter text-[13px] font-bold flex-shrink-0" style={{ color: "#F5D060" }}>
                    {i + 1}.
                  </span>
                  <p className="font-inter text-[13px] leading-relaxed" style={{ color: "rgba(245,208,96,0.55)", lineHeight: 1.9 }}>
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.60) 40%, rgba(245,208,96,0.53) 50%, rgba(212,175,55,0.60) 60%, transparent 95%)" }} />
    </div>
  );
}