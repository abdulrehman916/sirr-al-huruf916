import { motion } from "framer-motion";

const TABS = [
  { id: "abjad", label: "ABJAD", arabic: "أبجد" },
  { id: "anasir", label: "ANASIR", arabic: "عناصر" },
  { id: "hadim", label: "HADIM", arabic: "خادم" },
  { id: "mizaan", label: "MIZAAN 9", arabic: "ميزان" },
];

export default function StickyNav({ activeTab, onTabChange, scrollTargets }) {
  const scrollTo = (id) => {
    onTabChange(id);
    const el = scrollTargets?.[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="sticky top-0 z-50 w-full py-2.5 px-4"
      style={{
        background: "rgba(5,13,26,0.90)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,175,55,0.15)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div className="max-w-lg mx-auto">
        <div className="grid grid-cols-4 gap-1.5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => scrollTo(tab.id)}
                className="relative flex flex-col items-center py-2 px-1 rounded-xl transition-all duration-300"
                style={isActive ? {
                  background: "linear-gradient(135deg, rgba(212,175,55,0.28), rgba(212,175,55,0.12))",
                  border: "1px solid rgba(212,175,55,0.45)",
                  boxShadow: "0 0 14px rgba(212,175,55,0.20)",
                } : {
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <span
                  className="font-amiri text-sm font-bold"
                  style={{ color: isActive ? "#D4AF37" : "rgba(255,255,255,0.45)" }}
                >
                  {tab.arabic}
                </span>
                <span
                  className="font-inter font-bold"
                  style={{ fontSize: 8, letterSpacing: "0.08em", color: isActive ? "rgba(212,175,55,0.85)" : "rgba(255,255,255,0.25)" }}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-0.5 left-1/2 rounded-full"
                    style={{ width: 20, height: 2, background: "#D4AF37", transform: "translateX(-50%)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}