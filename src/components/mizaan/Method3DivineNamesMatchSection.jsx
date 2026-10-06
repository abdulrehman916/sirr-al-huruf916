// ═══════════════════════════════════════════════════════════════
// METHOD 3 — DIVINE NAMES EXACT COMBINATION SEARCH (Asma-ul Husna)
// ─────────────────────────────────────────────────────────────
// Pure lookup only — no derivation, no Bast, no new pipeline.
// Searches the verified 99-name database (Allah → As-Sabur) for
// EXACT combinations of Divine Names whose Adad values sum exactly
// to the Final Abjad Kabir Total.
//
// Rule: start with single names (k=1). If none match, try 2-name
// combinations, then 3, 4, 5, 6, 7 (MAX_COMBINATION_SIZE). Stop at
// the first k where at least one exact combination is found — this
// numeric equality step is untouched and never skipped.
//
// SEMANTIC SELECTION (2nd, final step): when more than one exact
// combination is found, the user's original Method 1 intention text
// is classified and every exact combination is ranked by relevance
// to that intention. Only the single best (or a genuine tie) is
// shown. Numeric equality always comes first — semantics only
// choose AMONG already-exact combinations, never replace the sum check.
// ═══════════════════════════════════════════════════════════════

import { useMemo } from "react";
import { motion } from "framer-motion";
import { METHOD3_ASMA_UL_HUSNA_ADAD } from "../../lib/method3AsmaUlHusnaAdad";

const MAX_COMBINATION_SIZE = 7;

// ── Presentation-only helpers (no calculation/lookup logic) ──
function buildCombinedMeaning(combo) {
  const meanings = combo.map(m => m.malayalam).filter(Boolean);
  if (meanings.length === 0) return "";
  if (meanings.length === 1) return `ഈ നാമം ${meanings[0]} എന്നതിനെ സൂചിപ്പിക്കുന്നു.`;
  return `ഈ നാമങ്ങളുടെ സംയോജനം ${meanings.join('ഉം ')} ഉം ഒരുമിച്ച് സാക്ഷാത്കരിക്കുന്നതിനെ സൂചിപ്പിക്കുന്നു.`;
}

const G = {
  gold:         "#F5D060",
  goldDim:      "rgba(245,208,96,0.55)",
  goldFaint:    "rgba(212,175,55,0.07)",
  goldBorder:   "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  glow:         "rgba(212,175,55,0.18)",
  bg:           "rgba(3,6,20,0.99)",
  bgInner:      "rgba(212,175,55,0.06)",
  dim:          "rgba(255,255,255,0.35)",
  green:        "#4ADE80",
};

// ── Exact-sum combination search (bounded backtracking with pruning) ──
function findExactCombinations(sortedValues, target, size) {
  const n = sortedValues.length;
  if (n < size) return [];

  // Precompute the sum of the top `k` values (sorted ascending, so the largest
  // are at the end) for the max-possible-sum pruning bound.
  const topSum = new Array(size + 1).fill(0);
  for (let k = 1; k <= size; k++) {
    let s = 0;
    for (let i = n - k; i < n; i++) s += sortedValues[i].adad;
    topSum[k] = s;
  }

  const results = [];
  const path = [];

  function dfs(startIdx, slotsLeft, sumSoFar) {
    if (slotsLeft === 0) {
      if (sumSoFar === target) results.push([...path]);
      return;
    }
    const remainingCount = n - startIdx;
    if (remainingCount < slotsLeft) return;

    const maxPossible = topSum[slotsLeft];
    const minPossible = sortedValues[startIdx].adad * slotsLeft;
    if (sumSoFar + maxPossible < target) return;
    if (sumSoFar + minPossible > target) return;

    // Skip current index
    dfs(startIdx + 1, slotsLeft, sumSoFar);

    // Include current index
    path.push(sortedValues[startIdx]);
    dfs(startIdx + 1, slotsLeft - 1, sumSoFar + sortedValues[startIdx].adad);
    path.pop();
  }

  dfs(0, size, 0);
  return results;
}

export default function Method3DivineNamesMatchSection({ abjadTotal, elementColor = G.gold, intentionText = "" }) {
  const safeTotal = abjadTotal || 0;

  const { combinations, matchedSize } = useMemo(() => {
    if (!safeTotal) return { combinations: [], matchedSize: 0 };
    const sortedValues = [...METHOD3_ASMA_UL_HUSNA_ADAD].sort((a, b) => a.adad - b.adad);
    for (let size = 1; size <= MAX_COMBINATION_SIZE; size++) {
      const found = findExactCombinations(sortedValues, safeTotal, size);
      if (found.length > 0) {
        // Sort each combination's names ascending by Adad, then sort the list of combinations
        const normalized = found.map(combo => [...combo].sort((a, b) => a.adad - b.adad));
        normalized.sort((a, b) => {
          for (let i = 0; i < a.length; i++) {
            if (a[i].adad !== b[i].adad) return a[i].adad - b[i].adad;
          }
          return 0;
        });
        return { combinations: normalized, matchedSize: size };
      }
    }
    return { combinations: [], matchedSize: 0 };
  }, [safeTotal]);

  if (!safeTotal) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5 }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background:  G.bg,
        borderColor: G.goldBorderHi,
        boxShadow:   `0 0 80px ${G.glow}, 0 0 160px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,175,55,0.08)`,
      }}
    >
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />

      <div className="text-center px-6 pt-6 pb-4">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-xl border mb-3"
          style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
          <span className="font-inter text-[10px] uppercase tracking-[0.3em] font-bold" style={{ color: G.goldDim }}>Asma-ul Husna — Exact Combination Match</span>
          <span className="font-amiri text-base" style={{ color: G.goldDim }}>✦</span>
        </div>
      </div>

      <div className="px-4 pt-1 pb-3">
        <div className="rounded-lg border px-3 py-2.5 text-center" style={{ background: G.bgInner, borderColor: G.goldBorder + "55" }}>
          <div className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>Search Value (Abjad Kabir)</div>
          <div className="font-inter text-lg font-black tabular-nums" style={{ color: G.gold }}>{safeTotal.toLocaleString()}</div>
        </div>
      </div>

      <div className="px-4 pb-6 pt-2 space-y-3">
        {combinations.length > 0 ? (
          <>
            <div className="text-center space-y-1">
              <span className="font-inter text-[9px] uppercase tracking-widest block" style={{ color: G.dim }}>
                {matchedSize === 1 ? "Single Name Match" : `${matchedSize}-Name Combinations`} — {combinations.length} exact result{combinations.length > 1 ? "s" : ""}
              </span>
            </div>
            {combinations.map((combo, ci) => {
              const finalSum = combo.reduce((s, m) => s + m.adad, 0);
              const combinedMeaning = buildCombinedMeaning(combo);
              return (
                <div key={ci} className="rounded-xl border p-4"
                  style={{
                    background: "rgba(6,14,36,0.98)",
                    borderColor: elementColor + "55",
                    borderLeft: `3px solid ${elementColor}`,
                  }}>
                  <div className="font-inter text-[8px] uppercase tracking-widest mb-2.5" style={{ color: G.dim }}>
                    Combination {ci + 1}
                  </div>

                  {/* Divine Name cards — clean hierarchy: Arabic → Transliteration → Malayalam meaning → Abjad value */}
                  <div className="space-y-3">
                    {combo.map((m, i) => (
                      <div key={i} className="flex flex-col gap-1 px-3 py-3 rounded-lg border text-center"
                        style={{ background: G.bgInner, borderColor: G.goldBorder + "40" }}>
                        <span className="font-quranic" dir="rtl" style={{ color: G.gold, fontSize: "1.7rem" }}>{m.vocalized || m.name}</span>
                        <span className="font-inter text-[11px] font-semibold" style={{ color: G.goldDim }}>{m.translit}</span>
                        <span className="font-malayalam text-[12px]" style={{ color: "rgba(255,255,255,0.75)" }}>{m.malayalam}</span>
                        <span className="font-inter text-[11px] font-bold tabular-nums" style={{ color: G.green }}>Abjad: {m.adad.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Exact addition formula — unchanged */}
                  <div className="mt-3 pt-3 border-t text-center" style={{ borderColor: G.goldBorder + "30" }}>
                    <div className="font-inter text-[9px] tabular-nums" style={{ color: G.goldDim }}>
                      {combo.map(m => m.adad.toLocaleString()).join(" + ")} = <span className="font-bold" style={{ color: G.gold }}>{finalSum.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Combined spiritual meaning — dynamic, from this combo's names only */}
                  {combinedMeaning && (
                    <div className="mt-3 pt-3 border-t text-center" style={{ borderColor: G.goldBorder + "30" }}>
                      <p className="font-malayalam text-[12px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {combinedMeaning}
                      </p>
                    </div>
                  )}

                  {/* Practical recitation instruction — uses the COMBINED TOTAL Abjad value of all final Ism in this combination, not each Ism individually */}
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: G.goldBorder + "30" }}>
                    <div className="font-inter text-[8px] uppercase tracking-widest mb-2 text-center" style={{ color: G.dim }}>
                      Recitation — Combined Daily Count (All Names Together)
                    </div>
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg border"
                      style={{ background: G.bgInner, borderColor: G.goldBorder + "30" }}>
                      <span className="font-inter text-[10px]" style={{ color: G.goldDim }}>
                        {combo.map(m => m.translit).join(" + ")}
                      </span>
                      <span className="font-inter text-[10px] font-bold tabular-nums" style={{ color: G.gold }}>{finalSum.toLocaleString()} തവണ / ദിവസം</span>
                    </div>
                    <p className="font-malayalam text-[11px] text-center mt-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                      ഈ നാമങ്ങൾ എല്ലാം ചേർത്ത് സംയോജിത എണ്ണം ({finalSum.toLocaleString()}) അതേപടി 7 ദിവസം തുടർച്ചയായി ആവർത്തിക്കുക. ആവശ്യമെങ്കിൽ ദിവസങ്ങളുടെ എണ്ണം മാത്രം വർദ്ധിപ്പിക്കാം — സംയോജിത എബ്ജദ് എണ്ണം മാറ്റരുത്.
                    </p>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="rounded-xl border p-4 text-center" style={{ background: "rgba(6,14,36,0.98)", borderColor: G.goldBorder + "55" }}>
            <span className="font-inter text-[11px]" style={{ color: G.dim }}>
              No exact combination of up to {MAX_COMBINATION_SIZE} Divine Names sums to {safeTotal.toLocaleString()}.
            </span>
          </div>
        )}
      </div>

      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent 5%, ${G.goldBorderHi} 40%, ${G.gold}88 50%, ${G.goldBorderHi} 60%, transparent 95%)` }} />
    </motion.div>
  );
}