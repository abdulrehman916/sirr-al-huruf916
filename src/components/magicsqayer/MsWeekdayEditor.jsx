import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { ARABIC_WEEKDAYS, WEEKDAY_ULVI, WEEKDAY_SUFLI } from "./MsQasam";

const G = {
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
};

export default function MsWeekdayEditor({ open, onClose, overrides, onSave, selectedDay, onSelectDay }) {
  const [edits, setEdits] = useState({});

  useEffect(() => {
    if (!open) return;
    const init = {};
    for (let i = 0; i < 7; i++) {
      init[i] = {
        ulvi: overrides[i]?.ulvi || "",
        sufli: overrides[i]?.sufli || "",
      };
    }
    setEdits(init);
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.85)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="rounded-2xl border w-full max-w-lg max-h-[85vh] overflow-y-auto"
          style={{
            background: "linear-gradient(145deg, rgba(8,16,38,0.99) 0%, rgba(4,10,24,0.99) 100%)",
            borderColor: G.borderHi,
            boxShadow: "0 0 40px rgba(212,175,55,0.18)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4"
            style={{
              background: "linear-gradient(180deg, rgba(8,16,38,1) 0%, rgba(8,16,38,0.95) 100%)",
              borderBottom: "1px solid rgba(212,175,55,0.15)",
            }}>
            <h3 className="font-inter font-bold text-sm tracking-widest uppercase" style={{ color: G.text }}>
              Edit Weekday Names
            </h3>
            <button onClick={onClose} className="p-1.5 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Day tabs */}
          <div className="flex overflow-x-auto gap-1 p-3 scrollbar-none"
            style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
            {ARABIC_WEEKDAYS.map((name, idx) => {
              const active = selectedDay === idx;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectDay(idx)}
                  className="flex-shrink-0 px-3 py-2 rounded-xl font-amiri text-sm font-bold transition-all"
                  style={{
                    background: active ? "rgba(212,175,55,0.14)" : "transparent",
                    border: `1px solid ${active ? G.borderHi : "rgba(255,255,255,0.06)"}`,
                    color: active ? G.text : "rgba(255,255,255,0.40)",
                  }}>
                  {name}
                </button>
              );
            })}
          </div>

          {/* Edit form */}
          <div className="p-4 space-y-4">
            <div className="rounded-xl border p-3 space-y-3"
              style={{ borderColor: "rgba(212,175,55,0.18)", background: "rgba(212,175,55,0.03)" }}>
              <p className="font-amiri text-lg font-bold text-center" style={{ color: G.text }}>
                {ARABIC_WEEKDAYS[selectedDay]}
              </p>

              <div className="space-y-2">
                <label className="font-inter text-[9px] uppercase tracking-widest block"
                  style={{ color: G.dim }}>
                  Ulvi (Angel)
                </label>
                <input
                  type="text"
                  value={edits[selectedDay]?.ulvi || ""}
                  onChange={(e) => setEdits(prev => ({
                    ...prev,
                    [selectedDay]: { ...prev[selectedDay], ulvi: e.target.value }
                  }))}
                  placeholder={WEEKDAY_ULVI[selectedDay]}
                  className="w-full rounded-lg px-3 py-2.5 font-amiri text-base text-center focus:outline-none"
                  dir="rtl"
                  style={{
                    background: "rgba(4,12,34,0.97)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(245,235,210,0.85)",
                    fontSize: "16px",
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="font-inter text-[9px] uppercase tracking-widest block"
                  style={{ color: G.dim }}>
                  Sufli (Jinn)
                </label>
                <input
                  type="text"
                  value={edits[selectedDay]?.sufli || ""}
                  onChange={(e) => setEdits(prev => ({
                    ...prev,
                    [selectedDay]: { ...prev[selectedDay], sufli: e.target.value }
                  }))}
                  placeholder={WEEKDAY_SUFLI[selectedDay]}
                  className="w-full rounded-lg px-3 py-2.5 font-amiri text-base text-center focus:outline-none"
                  dir="rtl"
                  style={{
                    background: "rgba(4,12,34,0.97)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "rgba(255,159,90,0.85)",
                    fontSize: "16px",
                  }}
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onSave(edits);
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-inter font-bold text-sm text-[#0d1b2a] tracking-wide"
              style={{
                background: "linear-gradient(135deg, #f6d860 0%, #e0a820 50%, #c98a14 100%)",
                boxShadow: "0 0 24px rgba(212,175,55,0.35)",
              }}>
              <Check className="w-4 h-4" />
              Save All Changes
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}