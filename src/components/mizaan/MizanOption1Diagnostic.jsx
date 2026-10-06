import { useMemo } from "react";
import { motion } from "framer-motion";
import { runMizaanPostPipeline, istintak, getBastLevel } from "../../lib/mizaanPostEngine";

const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  goldFaint: "rgba(245,208,96,0.07)",
  goldBorder: "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  green: "#4ADE80",
  greenDim: "rgba(74,222,128,0.15)",
  red: "#F87171",
  redDim: "rgba(248,113,113,0.15)",
  bg: "rgba(3,6,20,0.99)",
  bgCard: "rgba(8,16,40,0.98)",
  dim: "rgba(255,255,255,0.35)",
};

function Card({ children, accent }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        background: G.bgCard,
        borderColor: accent ? accent + "55" : G.goldBorder,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ label, step, color = G.gold }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-xs font-black flex-shrink-0"
        style={{ background: color + "22", border: `1px solid ${color}55`, color }}>
        {step}
      </div>
      <div className="flex-1">
        <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color }}>{label}</span>
      </div>
      <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
    </div>
  );
}

export default function MizanOption1Diagnostic({ grandBast, grandLetters, dominant }) {
  const pipeline = useMemo(() => {
    if (!grandBast || grandBast <= 0) return null;
    return runMizaanPostPipeline({ grandBast, grandLetters, dominant });
  }, [grandBast, grandLetters, dominant]);

  if (!pipeline) return null;

  const { input, initialSeedLetters, kitabet, vefk } = pipeline;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: G.bg,
        borderColor: G.goldBorderHi,
        boxShadow: `0 0 80px rgba(212,175,55,0.18), 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.50) 40%, rgba(212,175,55,0.70) 50%, rgba(212,175,55,0.50) 60%, transparent 95%)` }} />

      {/* Title Banner */}
      <div className="text-center px-6 py-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-2"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-inter text-[9px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>
            🔍 OPTION 1 — DIAGNOSTIC AUDIT
          </span>
        </div>
        <p className="font-inter text-[8px] uppercase tracking-[0.2em]" style={{ color: G.dim }}>
          Cross-Device Consistency Verification
        </p>
      </div>

      <div className="px-4 pb-6 space-y-4 pt-4">

        {/* INPUT VALUES */}
        <Card accent={G.gold}>
          <SectionHeader step="0" label="Input Values" />
          <div className="grid grid-cols-2 gap-3">
            <div className="px-3 py-2 rounded-lg border" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Grand Bast</div>
              <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{input.grandBast.toLocaleString()}</div>
            </div>
            <div className="px-3 py-2 rounded-lg border" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Grand Letters</div>
              <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{input.grandLetters}</div>
            </div>
            <div className="px-3 py-2 rounded-lg border" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Combined Total</div>
              <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{input.satirVahidTotal.toLocaleString()}</div>
            </div>
            <div className="px-3 py-2 rounded-lg border" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Dominant Element</div>
              <div className="font-inter text-lg font-bold" style={{ color: G.gold }}>{dominant}</div>
            </div>
          </div>
        </Card>

        {/* SEED LETTERS */}
        <Card accent={G.gold}>
          <SectionHeader step="1" label="Seed Letters (Istintak of Combined Total)" />
          <div className="mb-3">
            <div className="flex flex-wrap gap-2 justify-center" style={{ direction: "rtl" }}>
              {initialSeedLetters.map((l, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="font-amiri text-2xl font-bold px-3 py-2 rounded-lg border"
                    style={{ color: G.gold, borderColor: G.goldBorder, background: G.gold + "12" }}>
                    {l}
                  </span>
                  <span className="font-inter text-[8px]" style={{ color: G.dim }}>{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-center">
            <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
              Seed Count: <span style={{ color: G.gold, fontWeight: "bold" }}>{initialSeedLetters.length}</span>
            </span>
            <span className="font-inter text-[8px] uppercase tracking-wider ml-3" style={{ color: G.dim }}>
              Zevc/Ferd: <span style={{ color: initialSeedLetters.length % 2 === 0 ? G.green : G.red, fontWeight: "bold" }}>
                {initialSeedLetters.length % 2 === 0 ? "ZEVC (زوج)" : "FERD (فرد)"}
              </span>
            </span>
            <span className="font-inter text-[8px] uppercase tracking-wider ml-3" style={{ color: G.dim }}>
              Bast Level: <span style={{ color: G.gold, fontWeight: "bold" }}>
                {initialSeedLetters.length % 2 === 0 ? "4th" : "5th"}
              </span>
            </span>
          </div>
        </Card>

        {/* EXPANDED LETTERS */}
        <Card accent={G.gold}>
          <SectionHeader step="2" label="All Expanded Letters" />
          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5 justify-center" style={{ direction: "rtl" }}>
              {kitabet.finalExpandedLetters.map((l, i) => (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <span className="font-amiri text-xl font-bold px-2.5 py-1.5 rounded-lg border"
                    style={{ color: G.gold, borderColor: G.goldBorder, background: G.gold + "12" }}>
                    {l}
                  </span>
                  <span className="font-inter text-[7px]" style={{ color: G.dim }}>{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="px-2 py-1.5 rounded border" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Total Expanded</div>
              <div className="font-inter text-sm font-bold tabular-nums" style={{ color: G.gold }}>{kitabet.finalExpandedLetters.length}</div>
            </div>
            <div className="px-2 py-1.5 rounded border" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Zevc/Ferd</div>
              <div className="font-inter text-sm font-bold" style={{ color: kitabet.isFerd ? G.red : G.green }}>
                {kitabet.isFerd ? "FERD" : "ZEVC"}
              </div>
            </div>
            <div className="px-2 py-1.5 rounded border" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Group Size</div>
              <div className="font-inter text-sm font-bold tabular-nums" style={{ color: G.gold }}>{kitabet.groupSize}</div>
            </div>
          </div>
        </Card>

        {/* VEFK SOURCE CALCULATION */}
        <Card accent={G.green}>
          <SectionHeader step="3" label="Vefk Source Calculation" color={G.green} />
          <div className="space-y-3">
            <div className="px-4 py-3 rounded-xl border"
              style={{ background: G.greenDim, borderColor: G.green + "40" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: G.green }}>
                  Expanded Letters First Value Total (Σ Level 1)
                </span>
                <span className="font-inter text-xl font-bold tabular-nums" style={{ color: G.green }}>
                  {vefk.S.toLocaleString()}
                </span>
              </div>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.green + "80" }}>
                Formula: Sum of First Bast (Level 1) of every expanded letter
              </div>
            </div>

            {/* Breakdown */}
            <div className="px-3 py-2 rounded-lg border text-xs"
              style={{ background: G.bgCard, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider mb-2" style={{ color: G.dim }}>
                Calculation Breakdown (First 10 letters):
              </div>
              <div className="grid grid-cols-5 gap-1 text-center">
                {kitabet.finalExpandedLetters.slice(0, 10).map((l, i) => {
                  const v1 = getBastLevel(l, 1);
                  return (
                    <div key={i} className="px-1 py-1 rounded" style={{ background: G.goldFaint, border: `1px solid ${G.goldBorder}` }}>
                      <div className="font-amiri text-sm" style={{ color: G.gold }}>{l}</div>
                      <div className="font-inter text-[7px] tabular-nums" style={{ color: G.dim }}>{v1}</div>
                    </div>
                  );
                })}
                {kitabet.finalExpandedLetters.length > 10 && (
                  <div className="col-span-5 text-center font-inter text-[7px]" style={{ color: G.dim }}>
                    ... + {kitabet.finalExpandedLetters.length - 10} more letters
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* GENERATED NAMES */}
        <Card accent={G.gold}>
          <SectionHeader step="4" label="Generated Esma-i Kitabet Names" />
          <div className="space-y-2">
            {kitabet.names.map((name, idx) => (
              <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-lg border"
                style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
                <div className="w-6 h-6 rounded flex items-center justify-center font-inter text-[9px] font-black"
                  style={{ background: G.bgCard, color: G.gold, border: `1px solid ${G.goldBorder}` }}>
                  {idx + 1}
                </div>
                <span className="font-amiri text-xl font-bold flex-1" style={{ color: G.gold }} dir="rtl">
                  {name}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center mt-3">
            <span className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
              Total Names Generated: <span style={{ color: G.gold, fontWeight: "bold" }}>{kitabet.names.length}</span>
            </span>
          </div>
        </Card>

        {/* SUMMARY */}
        <Card accent={G.gold}>
          <SectionHeader step="✓" label="Consistency Check Summary" />
          <div className="grid grid-cols-2 gap-3">
            <div className="px-3 py-2 rounded-lg border text-center" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Expanded Letters</div>
              <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{kitabet.finalExpandedLetters.length}</div>
            </div>
            <div className="px-3 py-2 rounded-lg border text-center" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Group Size</div>
              <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{kitabet.groupSize}</div>
            </div>
            <div className="px-3 py-2 rounded-lg border text-center" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Total Names</div>
              <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{kitabet.names.length}</div>
            </div>
            <div className="px-3 py-2 rounded-lg border text-center" style={{ background: G.goldFaint, borderColor: G.goldBorder }}>
              <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>Vefk Source</div>
              <div className="font-inter text-lg font-bold tabular-nums" style={{ color: G.gold }}>{vefk.S.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-3 px-3 py-2 rounded-lg border text-center"
            style={{ background: G.bgCard, borderColor: G.goldBorder }}>
            <div className="font-inter text-[7px] uppercase tracking-wider" style={{ color: G.dim }}>
              These 4 values MUST be identical on all devices for the same input
            </div>
          </div>
        </Card>

      </div>

      {/* Bottom accent line */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, rgba(212,175,55,0.50) 40%, rgba(212,175,55,0.70) 50%, rgba(212,175,55,0.50) 60%, transparent 95%)` }} />
    </motion.div>
  );
}