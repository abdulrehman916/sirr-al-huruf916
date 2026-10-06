import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { perfStore } from "./perfStore";

const ROWS = [
  { key: "gridClickTotal",  label: "Grid click → state update",     highlight: true },
  { key: "generateSquare",  label: "generateSquare(n×n)"                            },
  { key: "gridFlatVerify",  label: "Grid flat + verify"                             },
  { key: "buildHierarchy",  label: "buildHierarchy"                                 },
  { key: "angelJinnNames",  label: "Angel/Jinn names (8 rows)"                     },
];

function bar(ms, max) {
  const pct = max > 0 ? Math.min((ms / max) * 100, 100) : 0;
  const color = ms > 50 ? "#F87171" : ms > 10 ? "#FBBF24" : "#4ADE80";
  return { pct, color };
}

export default function MsPerfPanel() {
  const [timings, setTimings] = useState(perfStore.get());
  const [open, setOpen] = useState(true);

  useEffect(() => perfStore.subscribe(setTimings), []);

  const values = ROWS.map(r => timings[r.key] ?? null);
  const hasData = values.some(v => v !== null);
  const maxMs = Math.max(...values.filter(v => v !== null), 0.1);

  // Identify slowest
  let slowestKey = null, slowestMs = -1;
  ROWS.forEach(r => {
    const v = timings[r.key];
    if (v !== null && v > slowestMs) { slowestMs = v; slowestKey = r.key; }
  });

  return (
    <div className="rounded-2xl border overflow-hidden"
      style={{ background: "rgba(4,8,24,0.99)", borderColor: "rgba(212,175,55,0.22)" }}>

      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
        style={{ background: open ? "rgba(212,175,55,0.08)" : "rgba(212,175,55,0.03)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs">⚡</span>
          <p className="font-inter text-[10px] uppercase tracking-widest" style={{ color: "rgba(212,175,55,0.70)" }}>
            Performance Report
          </p>
          {hasData && (
            <span className="font-inter text-[9px] px-1.5 py-0.5 rounded-md"
              style={{ background: "rgba(212,175,55,0.12)", color: "rgba(212,175,55,0.60)" }}>
              live
            </span>
          )}
        </div>
        <span className="font-inter text-xs" style={{ color: "rgba(212,175,55,0.40)" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {!hasData ? (
                <p className="font-inter text-[10px] text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
                  Select a grid size to see timings
                </p>
              ) : (
                <>
                  {ROWS.map(row => {
                    const ms = timings[row.key];
                    if (ms === null || ms === undefined) return null;
                    const { pct, color } = bar(ms, maxMs);
                    const isSlowest = row.key === slowestKey && slowestMs > 0;

                    return (
                      <motion.div
                        key={row.key}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {isSlowest && (
                              <span className="font-inter text-[8px] px-1.5 py-0.5 rounded"
                                style={{ background: "rgba(248,113,113,0.15)", color: "#F87171" }}>
                                SLOWEST
                              </span>
                            )}
                            <span className="font-inter text-[10px]"
                              style={{ color: row.highlight ? "rgba(212,175,55,0.90)" : "rgba(255,255,255,0.55)", fontWeight: row.highlight ? 700 : 400 }}>
                              {row.label}
                            </span>
                          </div>
                          <span className="font-inter text-[11px] font-bold tabular-nums"
                            style={{ color }}>
                            {ms.toFixed(2)} ms
                          </span>
                        </div>
                        {/* Bar */}
                        <div className="rounded-full overflow-hidden h-1.5"
                          style={{ background: "rgba(255,255,255,0.06)" }}>
                          <motion.div
                            className="h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            style={{ background: color }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Legend */}
                  <div className="flex gap-3 pt-1 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    {[
                      { color: "#4ADE80", label: "< 10ms fast" },
                      { color: "#FBBF24", label: "10–50ms ok" },
                      { color: "#F87171", label: "> 50ms slow" },
                    ].map(l => (
                      <div key={l.label} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                        <span className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.30)" }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}