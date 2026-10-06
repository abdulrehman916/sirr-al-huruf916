// ═══════════════════════════════════════════════════
// LUNAR MANSIONS PANEL
// 28 Manazil with detailed information
// ═══════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Star, Info } from "lucide-react";

const G = {
  border:   "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow:     "rgba(212,175,55,0.22)",
  text:     "#F5D060",
  dim:      "rgba(212,175,55,0.55)",
  faint:    "rgba(212,175,55,0.22)",
  bg:       "rgba(212,175,55,0.07)",
  bgHi:     "rgba(212,175,55,0.14)",
};

const LUNAR_MANSIONS = [
  { number: 1, arabic: "الشرطين", latin: "Al-Sharatain", meaning: "The Two Signs", activity: "Good for travel, new beginnings" },
  { number: 2, arabic: "البطين", latin: "Al-Butayn", meaning: "The Little Belly", activity: "Good for construction, building" },
  { number: 3, arabic: "الثريا", latin: "Al-Thurayya", meaning: "The Pleiades", activity: "Good for spiritual work, protection" },
  { number: 4, arabic: "الدبران", latin: "Al-Dabaran", meaning: "The Follower", activity: "Good for marriage, partnerships" },
  { number: 5, arabic: "الهقعة", latin: "Al-Haq'ah", meaning: "The White Spot", activity: "Good for healing, medicine" },
  { number: 6, arabic: "الهنعة", latin: "Al-Han'ah", meaning: "The Brand", activity: "Good for business, trade" },
  { number: 7, arabic: "الذراع", latin: "Al-Dhira'", meaning: "The Forearm", activity: "Good for travel, movement" },
  { number: 8, arabic: "النسرة", latin: "Al-Nasrah", meaning: "The Nest", activity: "Good for home, family matters" },
  { number: 9, arabic: "الطرف", latin: "Al-Tarf", meaning: "The Eye", activity: "Good for vision, insight" },
  { number: 10, arabic: "الجبهة", latin: "Al-Jabhah", meaning: "The Forehead", activity: "Good for leadership, authority" },
  { number: 11, arabic: "الزبرة", latin: "Al-Zubrah", meaning: "The Mane", activity: "Good for strength, power" },
  { number: 12, arabic: "الصرفة", latin: "Al-Sarfah", meaning: "The Turner", activity: "Good for change, transformation" },
  { number: 13, arabic: "العواء", latin: "Al-Awwa'", meaning: "The Barker", activity: "Good for communication" },
  { number: 14, arabic: "السماك", latin: "Al-Simak", meaning: "The Spinal Cord", activity: "Good for support, stability" },
  { number: 15, arabic: "الغفر", latin: "Al-Ghafr", meaning: "The Cover", activity: "Good for concealment, privacy" },
  { number: 16, arabic: "الزبانا", latin: "Al-Zubana", meaning: "The Claws", activity: "Good for justice, balance" },
  { number: 17, arabic: "الإكليل", latin: "Al-Iklil", meaning: "The Crown", activity: "Good for success, achievement" },
  { number: 18, arabic: "القلب", latin: "Al-Qalb", meaning: "The Heart", activity: "Good for love, emotions" },
  { number: 19, arabic: "الشولة", latin: "Al-Shawlah", meaning: "The Sting", activity: "Good for defense, protection" },
  { number: 20, arabic: "النعائم", latin: "Al-Na'a'im", meaning: "The Ostriches", activity: "Good for comfort, luxury" },
  { number: 21, arabic: "البلدة", latin: "Al-Baldah", meaning: "The Town", activity: "Good for community, gathering" },
  { number: 22, arabic: "سعد الذابح", latin: "Sa'd al-Dhabih", meaning: "Luck of the Slaughterer", activity: "Good for sacrifice, offering" },
  { number: 23, arabic: "سعد بلع", latin: "Sa'd Bula'", meaning: "Luck of the Swallower", activity: "Good for consumption, intake" },
  { number: 24, arabic: "سعد السعود", latin: "Sa'd al-Su'ud", meaning: "Luck of Luck", activity: "Good for fortune, success" },
  { number: 25, arabic: "سعد الأخبية", latin: "Sa'd al-Akhibah", meaning: "Luck of the Tents", activity: "Good for shelter, rest" },
  { number: 26, arabic: "الفرغ المقدم", latin: "Al-Fargh al-Muqaddam", meaning: "The Forward Spout", activity: "Good for beginnings" },
  { number: 27, arabic: "الفرغ المؤخر", latin: "Al-Fargh al-Mu'akhar", meaning: "The Backward Spout", activity: "Good for endings" },
  { number: 28, arabic: "الرشا", latin: "Al-Risha'", meaning: "The Rope", activity: "Good for connection, binding" }
];

export default function LunarMansionsPanel() {
  const [selectedMansion, setSelectedMansion] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: 0.25 }}
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />
      
      <div className="flex items-center gap-3 mb-4">
        <Moon className="w-5 h-5" style={{ color: G.text }} />
        <h2 className="font-inter text-lg font-bold uppercase tracking-widest" style={{ color: G.text }}>
          🌙 28 ലൂണാർ മാൻഷനുകൾ
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
        {(LUNAR_MANSIONS || []).map((mansion) => (
          <button
            key={mansion.number}
            onClick={() => setSelectedMansion(selectedMansion === mansion.number ? null : mansion.number)}
            className="p-3 rounded-xl border text-left transition-all"
            style={{
              background: selectedMansion === mansion.number ? G.bgHi : G.bg,
              borderColor: selectedMansion === mansion.number ? G.border : G.faint,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-inter text-[10px] font-bold text-white/60">#{mansion.number}</span>
              <Star className="w-3 h-3" style={{ color: G.text }} />
            </div>
            <p className="font-amiri text-sm font-bold mb-1" style={{ color: G.text }} dir="rtl">
              {mansion.arabic}
            </p>
            <p className="font-inter text-xs text-white/70">{mansion.latin}</p>
          </button>
        ))}
      </div>

      {selectedMansion && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 rounded-xl border"
          style={{ background: G.bgHi, borderColor: G.border }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4" style={{ color: G.text }} />
            <h3 className="font-inter text-sm font-bold uppercase tracking-widest" style={{ color: G.text }}>
              Details
            </h3>
          </div>
          
          {(() => {
            const m = LUNAR_MANSIONS.find(x => x.number === selectedMansion);
            if (!m) return null;
            return (
              <div className="space-y-3">
                <div>
                  <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    Arabic Name
                  </p>
                  <p className="font-amiri text-xl font-bold" style={{ color: G.text }} dir="rtl">
                    {m.arabic}
                  </p>
                </div>
                <div>
                  <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    Latin Name
                  </p>
                  <p className="font-inter text-sm font-bold text-white">{m.latin}</p>
                </div>
                <div>
                  <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    Meaning
                  </p>
                  <p className="font-inter text-sm text-white/80">{m.meaning}</p>
                </div>
                <div>
                  <p className="font-inter text-[9px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
                    Suitable Activities
                  </p>
                  <p className="font-inter text-sm text-white/70">{m.activity}</p>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
}