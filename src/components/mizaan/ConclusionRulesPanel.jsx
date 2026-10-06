// ═══════════════════════════════════════════════════════════════
// CONCLUSION & RULES PANEL — MANUSCRIPT USAGE INSTRUCTIONS ONLY
// No calculations. No state changes. No pipeline. Display only.
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

const G = {
  gold:         "#F5D060",
  goldDim:      "rgba(245,208,96,0.55)",
  goldFaint:    "rgba(245,208,96,0.08)",
  goldBorder:   "rgba(212,175,55,0.35)",
  goldBorderHi: "rgba(212,175,55,0.60)",
  glow:         "rgba(212,175,55,0.14)",
  bg:           "rgba(3,6,20,0.99)",
  bgCard:       "rgba(8,16,40,0.98)",
  bgInner:      "rgba(212,175,55,0.05)",
  dim:          "rgba(255,255,255,0.38)",
  dimLo:        "rgba(255,255,255,0.22)",
};

const RULES = [
  {
    number: 1,
    title: "Order of Use — ترتیب استعمال",
    english: "The three sections must be used in strict sequential order: First, Esma-i Kitabet (Section 1) for the primary Vefk. Second, Esma-i A'van (Section 2) for assistance and support. Third, Esma-i Kasem (Section 3) for division and allocation. Each section serves a distinct spiritual purpose and must not be skipped or reordered.",
    malayalam: "മൂന്ന് സെക്ഷനുകളും കർശനമായ ക്രമത്തിൽ ഉപയോഗിക്കണം: ആദ്യം Esma-i Kitabet (സെക്ഷൻ 1) പ്രാഥമിക Vefk-നായി. രണ്ടാമത് Esma-i A'van (സെക്ഷൻ 2) സഹായത്തിനും പിന്തുണയ്ക്കും. മൂന്നാമത് Esma-i Kasem (സെക്ഷൻ 3) വിഭജനത്തിനും വിതരണത്തിനും. ഓരോ സെക്ഷനും വ്യത്യസ്തമായ ആത്മീക ഉദ്ദേശ്യമുണ്ട്, ഒഴിവാക്കാനോ ക്രമം മാറ്റാനോ പാടില്ല.",
  },
  {
    number: 2,
    title: "Writing Method — طریقہ لکھنا",
    english: "Write the Vefk with pure ink on clean paper. Hold the pen in your right hand. Begin with Bismillah. Write each cell with full concentration and presence of heart. Do not speak during writing. Complete the entire grid in one sitting if possible. After writing, recite the guardian name of the Vefk 3 times over the completed grid.",
    malayalam: "ശുദ്ധമായ മഷി ഉപയോഗിച്ച് വൃത്തിയുള്ള കടലാസിൽ Vefk എഴുതുക. പേന വലതുകയ്യിൽ പിടിക്കുക. ബിസ്മില്ലാഹ് ചൊല്ലി ആരംഭിക്കുക. ഓരോ സെല്ലും പൂർണ്ണ ശ്രദ്ധയോടെയും ഹൃദയ സാന്നിധ്യത്തോടെയും എഴുതുക. എഴുതുമ്പോൾ സംസാരിക്കരുത്. സാധ്യമെങ്കിൽ മുഴുവൻ ഗ്രിഡും ഒരൊറ്റ ഇരിപ്പിൽ പൂർത്തിയാക്കുക. എഴുതി ശേഷം, പൂർത്തിയാക്കിയ ഗ്രിഡിന് മേൽ Vefk-ന്റെ ഗാർഡിയൻ നാമം 3 പ്രാവശ്യം ചൊല്ലുക.",
  },
  {
    number: 3,
    title: "Dominant Element (Galib Anasir) — غالب عناصر",
    english: "The dominant element determined from the 9-Mizan analysis governs all three sections and cannot be changed. Fire dominant: use for leadership, energy, transformation, authority. Earth dominant: use for stability, material gains, grounding, permanence. Air dominant: use for communication, travel, intellectual pursuits, change. Water dominant: use for emotions, healing, purification, relationships. The dominant element determines placement direction and wrapping cloth color.",
    malayalam: "9-Mizan വിശകലനത്തിൽ നിന്ന് നിർണ്ണയിക്കുന്ന പ്രബല മൂലകം മൂന്ന് സെക്ഷനുകളെയും നിയന്ത്രിക്കുന്നു, മാറ്റാൻ കഴിയില്ല. അഗ്നി പ്രബലം: നേതൃത്വത്തിനും ഊർജ്ജത്തിനും പരിവർത്തനത്തിനും അധികാരത്തിനും ഉപയോഗിക്കുക. ഭൂമി പ്രബലം: സ്ഥിരതയ്ക്കും ഭൗതിക നേട്ടങ്ങൾക്കും ദൃഢതയ്ക്കും നിലനിൽപ്പിനും ഉപയോഗിക്കുക. വായു പ്രബലം: ആശയവിനിമയത്തിനും യാത്രയ്ക്കും ബൗദ്ധിക പ്രവർത്തനങ്ങൾക്കും മാറ്റത്തിനും ഉപയോഗിക്കുക. ജലം പ്രബലം: വികാരങ്ങൾക്കും ചികിത്സയ്ക്കും ശുദ്ധീകരണത്തിനും ബന്ധങ്ങൾക്കും ഉപയോഗിക്കുക. പ്രബല മൂലകം സ്ഥാപന ദിശയും തുണിയുടെ നിറവും നിർണ്ണയിക്കുന്നു.",
  },
  {
    number: 4,
    title: "Placement Method According To Element — رکھنے کا طریقہ",
    english: "Fire: Place in elevated positions — high shelves, upper walls, mountain tops. Wrap in red or golden cloth. Face East or South. Earth: Place in stable grounded locations — buried in clean soil, on stone slabs, in wooden boxes. Wrap in green or brown cloth. Face North or center. Air: Place in open ventilated areas — near windows, balconies, hanging from ceilings. Wrap in light blue or white cloth. Face East or West. Water: Place near water sources — rivers, wells, fountains, containers with clean water. Wrap in dark blue or silver cloth. Face North.",
    malayalam: "അഗ്നി: ഉയർന്ന സ്ഥലങ്ങളിൽ വയ്ക്കുക — ഉയർന്ന അലമാരകൾ, മതിലുകളുടെ മുകൾഭാഗം, മലമുകളിൽ. ചുവപ്പ് അല്ലെങ്കിൽ സ്വർണ്ണ തുണിയിൽ പൊതിയുക. കിഴക്ക് അല്ലെങ്കിൽ തെക്ക് അഭിമുഖം. ഭൂമി: ദൃഢമായ സ്ഥലങ്ങളിൽ വയ്ക്കുക — ശുദ്ധമായ മണ്ണിൽ കുഴിച്ചിടുക, കല്ല് പലകകളിൽ, മരപ്പെട്ടികളിൽ. പച്ച അല്ലെങ്കിൽ തവിട്ട് തുണിയിൽ പൊതിയുക. വടക്ക് അല്ലെങ്കിൽ മധ്യഭാഗം അഭിമുഖം. വായു: തുറന്ന കാറ്റുള്ള സ്ഥലങ്ങളിൽ — ജനലുകൾക്ക് സമീപം, ബാൽക്കണികളിൽ, മേൽക്കൂരയിൽ തൂക്കിയിടുക. ഇളം നീല അല്ലെങ്കിൽ വെള്ള തുണിയിൽ പൊതിയുക. കിഴക്ക് അല്ലെങ്കിൽ പടിഞ്ഞാറ് അഭിമുഖം. ജലം: ജല സ്രോതസ്സുകൾക്ക് സമീപം — നദികൾ, കിണറുകൾ, ഉറവകൾ, ശുദ്ധജലമുള്ള പാത്രങ്ങൾ. ഇരുണ്ട നീല അല്ലെങ്കിൽ വെള്ളി തുണിയിൽ പൊതിയുക. വടക്ക് അഭിമുഖം.",
  },
  {
    number: 5,
    title: "Day Selection Rules — انتخاب روز",
    english: "Sunday: Solar works, authority, success, leadership. Monday: Lunar works, emotions, relationships, dreams. Tuesday: Martial works, courage, protection, urgent matters only. Wednesday: Mercurial works, knowledge, communication, business. Thursday: Jovian works, wisdom, prosperity, spiritual growth, most auspicious. Friday: Venusian works, love, harmony, spiritual blessings. Saturday: Saturnine works, binding, restriction, discipline. Avoid Tuesday for general works. Thursday and Sunday are most favorable for beginning Vefk operations.",
    malayalam: "ഞായർ: സൗര പ്രവർത്തനങ്ങൾ, അധികാരം, വിജയം, നേതൃത്വം. തിങ്കൾ: ചാന്ദ്ര പ്രവർത്തനങ്ങൾ, വികാരങ്ങൾ, ബന്ധങ്ങൾ, സ്വപ്നങ്ങൾ. ചൊവ്വ: കുജ പ്രവർത്തനങ്ങൾ, ധൈര്യം, സംരക്ഷണം, അടിയന്തര കാര്യങ്ങൾ മാത്രം. ബുധൻ: ബുധ പ്രവർത്തനങ്ങൾ, ജ്ഞാനം, ആശയവിനിമയം, വ്യാപാരം. വ്യാഴം: വ്യാഴ പ്രവർത്തനങ്ങൾ, വിജ്ഞാനം, സമൃദ്ധി, ആത്മീക വളർച്ച, ഏറ്റവും ശുഭകരം. വെള്ളി: ശുക്ര പ്രവർത്തനങ്ങൾ, സ്നേഹം, സാമരസ്യം, ആത്മീക അനുഗ്രഹങ്ങൾ. ശനി: ശനി പ്രവർത്തനങ്ങൾ, ബന്ധനം, നിയന്ത്രണം, ശിക്ഷണം. പൊതുവായ പ്രവർത്തനങ്ങൾക്ക് ചൊവ്വ ഒഴിവാക്കുക. Vefk പ്രവർത്തനങ്ങൾ ആരംഭിക്കാൻ വ്യാഴാഴ്ചയും ഞായറാഴ്ചയും ഏറ്റവും അനുയോജ്യം.",
  },
  {
    number: 6,
    title: "Hour Selection Rules — انتخاب ساعت",
    english: "The first hour after sunrise is most powerful for all operations. Planetary hours must align with purpose: Sun hours for authority and success. Moon hours for emotions and relationships. Mars hours for courage and protection. Mercury hours for knowledge and communication. Jupiter hours for wisdom and prosperity. Venus hours for love and harmony. Saturn hours for binding and restriction. Avoid the last hour before sunset for important works. The selected hour from 9-Mizan is fixed and locked once analysis begins.",
    malayalam: "സൂര്യോദയത്തിന് ശേഷമുള്ള ആദ്യ മണിക്കൂർ എല്ലാ പ്രവർത്തനങ്ങൾക്കും ഏറ്റവും ശക്തമാണ്. ഗ്രഹ മണിക്കൂറുകൾ ഉദ്ദേശ്യത്തിനനുസരിച്ച് യോജിപ്പിക്കണം: സൂര്യൻ - അധികാരത്തിനും വിജയത്തിനും. ചന്ദ്രൻ - വികാരങ്ങൾക്കും ബന്ധങ്ങൾക്കും. ചൊവ്വ - ധൈര്യത്തിനും സംരക്ഷണയ്ക്കും. ബുധൻ - ജ്ഞാനത്തിനും ആശയവിനിമയത്തിനും. വ്യാഴം - വിജ്ഞാനത്തിനും സമൃദ്ധിക്കും. ശുക്രൻ - സ്നേഹത്തിനും സാമരസ്യത്തിനും. ശനി - ബന്ധനത്തിനും നിയന്ത്രണത്തിനും. പ്രധാനപ്പെട്ട ജോലികൾക്ക് സൂര്യാസ്തമയത്തിന് മുൻപുള്ള അവസാന മണിക്കൂർ ഒഴിവാക്കുക. 9-Mizan-ൽ നിന്ന് തിരഞ്ഞെടുത്ത മണിക്കൂർ Analysis ആരംഭിച്ചാൽ സ്ഥിരമാണ്, ലോക്ക് ചെയ്യപ്പെടും.",
  },
  {
    number: 7,
    title: "Practical Usage Instructions — عملی ہدایات",
    english: "Before using any Vefk: Perform ablution (wudu) and face Qibla. Recite Bismillah three times. Hold Vefk in right hand and state intention clearly. Keep Vefk with you or in designated location for prescribed period. After purpose is fulfilled: Respectfully dispose by burying in clean soil or immersing in flowing water. Maintain purity of body, clothing, and location during all operations. Do not place Vefk on floor or in impure locations. Keep away from negative influences and impure persons.",
    malayalam: "ഏതൊരു Vefk ഉപയോഗിക്കുന്നതിന് മുൻപ്: വുളു ചെയ്ത് ഖിബ്ലയ്ക്ക് നേരെ തിരിയുക. മൂന്ന് പ്രാവശ്യം ബിസ്മില്ലാഹ് ചൊല്ലുക. Vefk വലതുകയ്യിൽ പിടിച്ച് ഉദ്ദേശ്യം വ്യക്തമായി പ്രസ്താവിക്കുക. നിശ്ചിത കാലയളവ് Vefk നിങ്ങളോടൊപ്പം സൂക്ഷിക്കുക അല്ലെങ്കിൽ നിയുക്ത സ്ഥലത്ത് വയ്ക്കുക. ഉദ്ദേശ്യം പൂർത്തിയായ ശേഷം: ബഹുമാനപൂർവ്വം ശുദ്ധമായ മണ്ണിൽ കുഴിച്ചിടുകയോ ഒഴുകുന്ന വെള്ളത്തിൽ മുക്കുകയോ ചെയ്ത് നിർമ്മാർജ്ജനം ചെയ്യുക. എല്ലാ പ്രവർത്തനങ്ങളിലും ശരീരത്തിന്റെയും വസ്ത്രത്തിന്റെയും സ്ഥലത്തിന്റെയും ശുദ്ധി പാലിക്കുക. Vefk നിലത്തോ അശുദ്ധമായ സ്ഥലങ്ങളിലോ വയ്ക്കരുത്. നെഗറ്റീവ് പ്രഭാവങ്ങളിൽ നിന്നും അശുദ്ധ വ്യക്തികളിൽ നിന്നും അകറ്റി സൂക്ഷിക്കുക.",
  },
];

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-2 py-1.5">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${G.goldBorder})` }} />
      <span style={{ color: G.goldDim, fontSize: 10 }}>✦</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${G.goldBorder})` }} />
    </div>
  );
}

export default function ConclusionRulesPanel() {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  G.bg,
        borderColor: G.goldBorderHi,
        boxShadow:   `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      {/* Top accent */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-6 py-5 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: G.goldFaint, border: `1px solid ${G.goldBorder}` }}>
            <BookOpen className="w-5 h-5" style={{ color: G.gold }} />
          </div>
          <div className="flex flex-col">
            <span className="font-inter text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: G.gold }}>
              Conclusion & Rules
            </span>
            <span className="font-amiri text-lg font-bold leading-relaxed" style={{ color: G.goldDim, lineHeight: 1.7, textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }} dir="rtl">
              النتيجة والقواعد
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-inter text-[9px] uppercase tracking-wider" style={{ color: G.dimLo }}>
            {open ? "Collapse" : "Expand"}
          </span>
          <div className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: G.gold + "22", border: `1px solid ${G.gold}44` }}>
            {open
              ? <ChevronUp className="w-4 h-4" style={{ color: G.gold }} />
              : <ChevronDown className="w-4 h-4" style={{ color: G.gold }} />}
          </div>
        </div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <OrnamentalDivider />

            <div className="px-6 pb-6 space-y-4">

              {/* Rules List */}
              {RULES.map((rule, idx) => (
                <div key={idx}
                  className="rounded-xl border p-4 space-y-3"
                  style={{
                    background: G.bgCard,
                    borderColor: G.goldBorder + "40",
                    boxShadow: `0 1px 8px rgba(0,0,0,0.3)`,
                  }}>

                  {/* Rule Header */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md font-inter text-[10px] font-black"
                      style={{ background: G.gold + "22", color: G.gold, border: `1px solid ${G.gold}44` }}>
                      {rule.number}
                    </div>
                    <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: G.gold }}>
                      {rule.title}
                    </span>
                  </div>

                  {/* English */}
                  <div className="space-y-1.5">
                    <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>
                      English
                    </span>
                    <p className="font-inter text-[11px] leading-relaxed" style={{ color: G.gold, lineHeight: 1.7 }}>
                      {rule.english}
                    </p>
                  </div>

                  {/* Malayalam */}
                  <div className="space-y-1.5 pt-2 border-t" style={{ borderColor: G.goldBorder + "30" }}>
                    <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: G.dim }}>
                      Malayalam
                    </span>
                    <p className="font-amiri text-[15px] leading-relaxed" style={{ color: G.goldDim, lineHeight: 1.7, textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased" }} dir="rtl">
                      {rule.malayalam}
                    </p>
                  </div>

                </div>
              ))}

              {/* Final Note */}
              <div className="rounded-xl border p-4 text-center"
                style={{
                  background: G.goldFaint,
                  borderColor: G.goldBorder,
                }}>
                <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
                  Manuscript Usage Guide
                </span>
                <p className="font-inter text-[11px] mt-1.5" style={{ color: G.goldDim, lineHeight: 1.6 }}>
                  Traditional instructions for practical application of the Vefk squares.
                </p>
              </div>

              {/* ── CONCLUSION B ── */}
              <div className="rounded-xl border p-4 space-y-3"
                style={{
                  background: G.bgCard,
                  borderColor: G.goldBorder + "55",
                  boxShadow: `0 1px 8px rgba(0,0,0,0.3)`,
                }}>
                {/* Header */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md font-inter text-[10px] font-black"
                    style={{ background: G.gold + "22", color: G.gold, border: `1px solid ${G.gold}44` }}>
                    B
                  </div>
                  <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color: G.gold }}>
                    Conclusion B
                  </span>
                </div>
                {/* Malayalam body */}
                <p className="font-inter text-[13px] leading-relaxed" style={{ color: G.goldDim, lineHeight: 1.9 }}>
                  Esma-i Kitabet, Esma-i A'van, Esma-i Kasem എന്നീ വഫ്കുകൾ ഈ ക്രമത്തിൽ ചെമ്പിലോ പാത്രത്തിലോ മൺചട്ടി കഷണത്തിലോ എഴുതി, ഈ ഉദാഹരണത്തിൽ പ്രബല ഘടകം അഗ്നിയായതിനാൽ തീയുടെ സമീപത്തോ അടിയിലോ കുഴിച്ചിടണം. അതിന് ശേഷം Esma-i Kitabet, Esma-i A'van, Esma-i Kasem എന്നീ പേരുകൾ അവയുടെ സംഖ്യാനുസരിച്ച് വായിക്കണം. താഴെ കൊടുക്കുന്ന നാലുകോണ വഫ്കുകൾ നാല് മൂലഘടകങ്ങളുമായി ബന്ധപ്പെട്ടവയാണ്. വഫ്കിന്റെ ഒന്നാം ഖാനം താക്കോലും തുടക്കവുമാണ്; അതിനുള്ളിൽ അബ്ജദ് കണക്ക് ഒളിഞ്ഞിരിക്കുന്നു. പ്രധാനമായത് വഫ്ക് അതിന്റെ ഉദ്ദേശ്യത്തിന് അനുയോജ്യമായ ദിവസത്തിലും സമയത്തിലും ചെയ്യുക എന്നതാണ്. നാലാം ഖാനമാണ് വഫ്കിന്റെ രഹസ്യം. ഒരു പ്രവർത്തനം തുടങ്ങുമ്പോൾ അതിന് അനുയോജ്യമായ ദിവസവും സമയവും അറിയണം. ഒരു മാസം നാല് ആഴ്ചകളാണ്; ഓരോ ഘടകത്തിനും നാല് ഘട്ടങ്ങളുണ്ട് (ചിലരുടെ അഭിപ്രായത്തിൽ ജലഘടകത്തിന് അഞ്ച് ഘട്ടങ്ങൾ). ഒന്നാം ആഴ്ച മുഹബ്ബത്ത്, ആകർഷണം, സൗഹൃദം എന്നിവയ്ക്കും, രണ്ടാം ആഴ്ച ആവശ്യസിദ്ധി, ശിഫാ, രോഗശാന്തി എന്നിവയ്ക്കും, മൂന്നാം ആഴ്ച നാവ് ബന്ധനം, ഉറക്കബന്ധനം, പുരുഷന്മാരെയും സ്ത്രീകളെയും ബന്ധിക്കൽ, രോഗപ്പെടുത്തൽ എന്നിവയ്ക്കും, നാലാം ആഴ്ച കഹ്ർ, നാശം, വേർപെടുത്തൽ, ശത്രുത എന്നിവയ്ക്കുമായി ഉപയോഗിക്കണമെന്ന് പുസ്തകം പറയുന്നു. പ്രബല ഘടകം ഭൂമിയോ വായുവോ ജലമോ ആണെങ്കിൽ അതനുസരിച്ചുള്ള ഘട്ടങ്ങൾ ഉപയോഗിക്കണം. ഞായർ, വ്യാഴം, വെള്ളി ദിവസങ്ങളിലെ സൂര്യോദയത്തിന് ശേഷമുള്ള ആദ്യ മണിക്കൂർ നല്ല കാര്യങ്ങൾക്കായി, തിങ്കളും ബുധനും നാവ് ബന്ധനം, ഉറക്കബന്ധനം തുടങ്ങിയവയ്ക്കായി, ചൊവ്വയും ശനിയും വേർപെടുത്തൽ, കഹ്ർ, നാശം, ശത്രുത എന്നിവയ്ക്കായി ഉപയോഗിക്കണമെന്ന് പറയുന്നു. എല്ലാ നിബന്ധനകളും പൂർണ്ണമായി പാലിക്കണം; തെറ്റായി ചെയ്താൽ അമൽ ഫലമില്ലാതെയാകുമെന്നും, പറഞ്ഞിരിക്കുന്ന ദിവസങ്ങളിലും സൂര്യോദയ സമയത്തും ആദ്യ മണിക്കൂറിലും ചെയ്യണമെന്നും ഗ്രന്ഥം പറയുന്നു.
                </p>
                {/* Footer note */}
                <div className="pt-3 border-t" style={{ borderColor: G.goldBorder + "30" }}>
                  <p className="font-inter text-[12px] font-bold" style={{ color: G.gold, lineHeight: 1.7 }}>
                    Kasam ഓതി ചെയ്യുമ്പോൾ മുകളിലെ Conclusion A വായിക്കുക.
                  </p>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom accent */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}