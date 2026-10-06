// ═══════════════════════════════════════════════════════════════
// BUHUR (INCENSE) REFERENCE
// Shows incense for each weekday with uses and notes
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Flame, CheckCircle, XCircle, Info } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
  success:  "rgba(34,197,94,0.60)",
  danger:   "rgba(239,68,68,0.60)"
};

const BUHUR_DATA = {
  sunday: {
    en: {
      day: "Sunday",
      incense: "Frankincense (Luban)",
      goodUses: ["Spiritual purification", "Sun rituals", "Authority matters", "Leadership activities"],
      avoidUses: ["Hidden matters", "Secret operations", "Night work"],
      notes: "Associated with the Sun. Best burned during daytime hours for maximum effect."
    },
    ml: {
      day: "ഞായർ",
      incense: "കുന്തിരിക്കം (ലുബാൻ)",
      goodUses: ["ആത്മീയ ശുദ്ധീകരണം", "സൂര്യ കർമ്മങ്ങൾ", "അധികാര കാര്യങ്ങൾ", "നേതൃത്വ പ്രവർത്തനങ്ങൾ"],
      avoidUses: ["രഹസ്യ കാര്യങ്ങൾ", "ഗുപ്ത പ്രവർത്തനങ്ങൾ", "രാത്രി കർമ്മങ്ങൾ"],
      notes: "സൂര്യനുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു. പരമാവധി ഫലത്തിന് പകൽ സമയത്ത് കത്തിക്കുക."
    },
    arabic: "لبان",
    planet: "sun"
  },
  monday: {
    en: {
      day: "Monday",
      incense: "Camphor (Karpur)",
      goodUses: ["Moon rituals", "Emotional healing", "Dream work", "Intuition development"],
      avoidUses: ["Aggressive actions", "Fire rituals", "Confrontation"],
      notes: "Associated with the Moon. Best burned during nighttime or evening hours."
    },
    ml: {
      day: "തിങ്കൾ",
      incense: "കർപ്പൂരം",
      goodUses: ["ചന്ദ്ര കർമ്മങ്ങൾ", "ഭാവപരമായ ചികിത്സ", "സ്വപ്ന പ്രവർത്തനങ്ങൾ", "അന്തർജ്ഞാന വികസനം"],
      avoidUses: ["ആക്രമണ പ്രവർത്തനങ്ങൾ", "അഗ്നി കർമ്മങ്ങൾ", "നേരിട്ടുള്ള ഏറ്റുമുട്ടലുകൾ"],
      notes: "ചന്ദ്രനുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു. രാത്രി അല്ലെങ്കിൽ വൈകുന്നേര സമയത്ത് കത്തിക്കുക."
    },
    arabic: "كافور",
    planet: "moon"
  },
  tuesday: {
    en: {
      day: "Tuesday",
      incense: "Dragon's Blood",
      goodUses: ["Mars rituals", "Protection", "Courage enhancement", "Victory operations"],
      avoidUses: ["Peace negotiations", "Gentle work", "Passive activities"],
      notes: "Associated with Mars. Powerful for protection and strength. Use with caution."
    },
    ml: {
      day: "ചൊവ്വ",
      incense: "ഡ്രാഗൺസ് ബ്ലഡ്",
      goodUses: ["ചൊവ്വ കർമ്മങ്ങൾ", "സംരക്ഷണം", "ധൈര്യ വർദ്ധനവ്", "വിജയ പ്രവർത്തനങ്ങൾ"],
      avoidUses: ["സമാധാന ചർച്ചകൾ", "മൃദുവായ പ്രവർത്തനങ്ങൾ", "നിഷ്ക്രിയ പ്രവർത്തനങ്ങൾ"],
      notes: "ചൊവ്വയുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു. സംരക്ഷണത്തിനും ശക്തിക്കും ശക്തം. ശ്രദ്ധയോടെ ഉപയോഗിക്കുക."
    },
    arabic: "دم الأخوين",
    planet: "mars"
  },
  wednesday: {
    en: {
      day: "Wednesday",
      incense: "Mastic (Mustaki)",
      goodUses: ["Mercury rituals", "Communication", "Learning", "Business dealings"],
      avoidUses: ["Silent retreats", "Non-verbal work", "Isolation"],
      notes: "Associated with Mercury. Excellent for intellectual and commercial activities."
    },
    ml: {
      day: "ബുധൻ",
      incense: "മസ്റ്റിക്കി (മുസ്തകി)",
      goodUses: ["ബുധൻ കർമ്മങ്ങൾ", "ആശയവിനിമയം", "പഠനം", "ബിസിനസ് ഇടപാടുകൾ"],
      avoidUses: ["മൗന വ്രതങ്ങൾ", "അവാചിക പ്രവർത്തനങ്ങൾ", "ഏകാന്തവാസം"],
      notes: "ബുധനുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു. ബൗദ്ധികവും വാണിജ്യപരവുമായ പ്രവർത്തനങ്ങൾക്ക് മികച്ചത്."
    },
    arabic: "مصطكا",
    planet: "mercury"
  },
  thursday: {
    en: {
      day: "Thursday",
      incense: "Sandalwood (Chandan)",
      goodUses: ["Jupiter rituals", "Wisdom seeking", "Spiritual growth", "Prosperity work"],
      avoidUses: ["Frivolous activities", "Wasteful spending", "Disrespect"],
      notes: "Associated with Jupiter. Sacred and purifying. Best for Thursday morning rituals."
    },
    ml: {
      day: "വ്യാഴം",
      incense: "ചന്ദനം",
      goodUses: ["ഗുരു കർമ്മങ്ങൾ", "ജ്ഞാന അന്വേഷണം", "ആത്മീയ വളർച്ച", "സമൃദ്ധി പ്രവർത്തനങ്ങൾ"],
      avoidUses: ["നിസ്സാര പ്രവർത്തനങ്ങൾ", "പാഴ്ചിലവ്", "അനാദരവ്"],
      notes: "ഗുരുവുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു. വിശുദ്ധവും ശുദ്ധീകരിക്കുന്നതും. വ്യാഴാഴ്ച രാവിലത്തെ കർമ്മങ്ങൾക്ക് മികച്ചത്."
    },
    arabic: "صندل",
    planet: "jupiter"
  },
  friday: {
    en: {
      day: "Friday",
      incense: "Rose (Gulab)",
      goodUses: ["Venus rituals", "Love work", "Beauty enhancements", "Harmony operations"],
      avoidUses: ["Conflict", "Harsh actions", "Ugliness"],
      notes: "Associated with Venus. Pleasing and harmonious. Perfect for Friday evening rituals."
    },
    ml: {
      day: "വെള്ളി",
      incense: "റോസ് (ഗുലാബ്)",
      goodUses: ["ശുക്രൻ കർമ്മങ്ങൾ", "പ്രണയ പ്രവർത്തനങ്ങൾ", "സൗന്ദര്യ വർദ്ധനവ്", "സാമരസ്യ പ്രവർത്തനങ്ങൾ"],
      avoidUses: ["പോരാട്ടം", "കഠിന പ്രവർത്തനങ്ങൾ", "അസുന്ദരത"],
      notes: "ശുക്രനുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു. സന്തോഷകരവും സാമരസ്യപൂർണ്ണവും. വെള്ളിയാഴ്ച വൈകുന്നേര കർമ്മങ്ങൾക്ക് തികച്ചും അനുയോജ്യം."
    },
    arabic: "ورد",
    planet: "venus"
  },
  saturday: {
    en: {
      day: "Saturday",
      incense: "Myrrh (Mur)",
      goodUses: ["Saturn rituals", "Banishing", "Protection from evil", "Discipline work"],
      avoidUses: ["Celebrations", "New beginnings", "Risk-taking"],
      notes: "Associated with Saturn. Heavy and grounding. Use for serious spiritual work only."
    },
    ml: {
      day: "ശനി",
      incense: "മുറ (മിർ)",
      goodUses: ["ശനി കർമ്മങ്ങൾ", "നീക്കം ചെയ്യൽ", "ദുഷ്ട ശക്തികളിൽ നിന്നുള്ള സംരക്ഷണം", "ശിക്ഷാ പ്രവർത്തനങ്ങൾ"],
      avoidUses: ["ആഘോഷങ്ങൾ", "പുതുതുടക്കങ്ങൾ", "സാഹസിക പ്രവർത്തനങ്ങൾ"],
      notes: "ശനിയുമായി ബന്ധപ്പെട്ടിരിക്കുന്നു. ഭാരമേറിയതും നിലനിർത്തുന്നതും. ഗൗരവതരമായ ആത്മീയ പ്രവർത്തനങ്ങൾക്ക് മാത്രം ഉപയോഗിക്കുക."
    },
    arabic: "مر",
    planet: "saturn"
  }
};

export default function BuhurReference() {
  const { isMalayalam } = useAstroClockLanguage();
  const [selectedDay, setSelectedDay] = useState(null);

  const days = [
    { key: "sunday", symbol: "☉" },
    { key: "monday", symbol: "☽" },
    { key: "tuesday", symbol: "♂" },
    { key: "wednesday", symbol: "☿" },
    { key: "thursday", symbol: "♃" },
    { key: "friday", symbol: "♀" },
    { key: "saturday", symbol: "♄" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(8,20,52,0.98) 0%, rgba(4,12,34,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Flame className="w-7 h-7" style={{ color: G.text }} />
        <div>
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "ബുഹൂർ (ധൂപവർഗ്ഗങ്ങൾ)" : "Buhur (Incense) Reference"}
          </h2>
          <p className="font-malayalam-sm" style={{ color: G.dim }}>
            {isMalayalam ? "ഓരോ ആഴ്ച ദിവസത്തെയും ധൂപവർഗ്ഗങ്ങൾ" : "Incense for each weekday"}
          </p>
        </div>
      </div>

      {/* Day Selector */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((day) => (
          <button
            key={day.key}
            onClick={() => setSelectedDay(day.key)}
            className={`p-3 rounded-lg border text-center transition-all ${
              selectedDay === day.key ? "scale-105" : "hover:scale-105"
            }`}
            style={{
              background: selectedDay === day.key ? G.bgHi : G.bg,
              borderColor: selectedDay === day.key ? G.borderHi : G.border
            }}
          >
            <span className="text-xl block mb-1">{day.symbol}</span>
            <span className="font-inter text-[9px] uppercase tracking-wider text-white/70">
              {isMalayalam ? BUHUR_DATA[day.key].ml.day.slice(0, 3) : BUHUR_DATA[day.key].en.day.slice(0, 3)}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Incense Name */}
          <div className="p-5 rounded-xl border" style={{ background: G.bgHi, borderColor: G.borderHi }}>
            <div className="text-center mb-3">
              <p className="font-amiri text-4xl font-bold mb-2" style={{ color: G.text }} dir="rtl">
                {BUHUR_DATA[selectedDay].arabic}
              </p>
              <p className="font-malayalam-md font-bold text-white">
                {isMalayalam ? BUHUR_DATA[selectedDay].ml.incense : BUHUR_DATA[selectedDay].en.incense}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{days.find(d => d.key === selectedDay)?.symbol}</span>
              <span className="font-inter text-xs text-white/60">
                {isMalayalam ? BUHUR_DATA[selectedDay].ml.day : BUHUR_DATA[selectedDay].en.day}
              </span>
            </div>
          </div>

          {/* Good Uses */}
          <div className="p-5 rounded-xl border" style={{ background: "rgba(34,197,94,0.05)", borderColor: G.success }}>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5" style={{ color: G.success }} />
              <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.success }}>
                {isMalayalam ? "ഉചിത ഉപയോഗങ്ങൾ" : "Good Uses"}
              </p>
            </div>
            <div className="space-y-2">
              {(isMalayalam ? BUHUR_DATA[selectedDay].ml.goodUses : BUHUR_DATA[selectedDay].en.goodUses).map((use, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: G.success }} />
                  <span className="font-malayalam-sm text-white/80">{use}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Avoid Uses */}
          <div className="p-5 rounded-xl border" style={{ background: "rgba(239,68,68,0.05)", borderColor: G.danger }}>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5" style={{ color: G.danger }} />
              <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.danger }}>
                {isMalayalam ? "ഒഴിവാക്കേണ്ടവ" : "Avoid Uses"}
              </p>
            </div>
            <div className="space-y-2">
              {(isMalayalam ? BUHUR_DATA[selectedDay].ml.avoidUses : BUHUR_DATA[selectedDay].en.avoidUses).map((use, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: G.danger }} />
                  <span className="font-malayalam-sm text-white/80">{use}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Traditional Notes */}
          <div className="p-5 rounded-xl border" style={{ background: "rgba(255,255,255,0.02)", borderColor: G.faint }}>
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 mt-0.5" style={{ color: G.dim }} />
              <div>
                <p className="font-inter text-[10px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
                  {isMalayalam ? "പാരമ്പര്യ കുറിപ്പുകൾ" : "Traditional Notes"}
                </p>
                <p className="font-malayalam-sm text-white/70">
                  {isMalayalam ? BUHUR_DATA[selectedDay].ml.notes : BUHUR_DATA[selectedDay].en.notes}
                </p>
              </div>
            </div>
          </div>

          {/* PDF Reference */}
          <div className="p-4 rounded-xl border" style={{ background: G.bg, borderColor: G.faint }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4" style={{ color: G.dim }} />
              <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: G.dim }}>
                {isMalayalam ? "ഗ്രന്ഥങ്ങൾ" : "Sources"}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-inter text-xs text-white/70">Havâss'ın Derinlikleri</span>
              <span className="font-inter text-[10px] font-bold" style={{ color: G.text }}>
                {isMalayalam ? "പുറം" : "Page"} 156-162
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Usage Instructions */}
      <div className="mt-6 p-4 rounded-xl border" style={{ background: "rgba(255,255,255,0.02)", borderColor: G.faint }}>
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 mt-0.5" style={{ color: G.dim }} />
          <div>
            <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
              {isMalayalam ? "ഉപയോഗ രീതി" : "Usage Instructions"}
            </p>
            <p className="font-malayalam-sm text-white/70">
              {isMalayalam 
                ? "ധൂപവർഗ്ഗങ്ങൾ ശുദ്ധമായ മനസ്സോടെയും ഉദ്ദേശ്യത്തോടെയും ഉപയോഗിക്കുക. നല്ല വായുസഞ്ചാരമുള്ള സ്ഥലത്ത് കത്തിക്കുക. ചാർകോൾ ഡിസ്ക്കിൽ അല്ലെങ്കിൽ ധൂപവർഗ്ഗ ബർണറിൽ ഉപയോഗിക്കാവുന്നതാണ്."
                : "Use incense with pure intention and focus. Burn in well-ventilated areas. Can be used on charcoal discs or in dedicated incense burners."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}