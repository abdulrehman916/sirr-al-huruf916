import { useMemo } from "react";
import EsmaAvanSection from "./EsmaAvanSection";
import { GALIB_ANASIR_VALUES, getBastLevel as getBastLevelA } from "../../lib/mizaanPostEngine";

// ═══════════════════════════════════════════════════════════════
// METHOD 3 — ESMA-I A'VAN STARTING VALUE OVERRIDE
// ─────────────────────────────────────────────────────────────
// Formula (per book instructions):
//   1. First Bast of the LAST (remainder-completed) Esma-i Kitabet name
//   2. + First Bast of the selected Galib Anasir
//   3. + Original Nine Mizan Total
// The resulting total replaces the normal Section-1-based A'van source.
// Everything downstream (Istintak, odd/even, 4th/5th Bast, expansion,
// grouping) reuses the EXACT SAME EsmaAvanSection engine — unchanged.
// ═══════════════════════════════════════════════════════════════
export default function Method3AvanSection({ kitabetNames, kitabetOriginalNames, dominant, nineMizanTotal, onVefkReady, getBastLevelFn = getBastLevelA }) {
  const { sourceTotal, breakdown } = useMemo(() => {
    // METHOD 3 RULE: Use ORIGINAL name (before supplementation) for calculation
    const lastName = Array.isArray(kitabetOriginalNames) && kitabetOriginalNames.length ? kitabetOriginalNames[kitabetOriginalNames.length - 1] : "";
    const lastNameBast = [...lastName].reduce((s, l) => s + (getBastLevelFn(l, 1) || 0), 0);
    const galibAnasirBast = GALIB_ANASIR_VALUES[dominant] || GALIB_ANASIR_VALUES.fire;
    const total = lastNameBast + galibAnasirBast + (nineMizanTotal || 0);
    return {
      sourceTotal: total,
      breakdown: { lastName, lastNameBast, galibAnasirBast, nineMizanTotal: nineMizanTotal || 0 },
    };
  }, [kitabetOriginalNames, dominant, nineMizanTotal, getBastLevelFn]);

  if (!sourceTotal || sourceTotal <= 0) return null;

  return (
    <EsmaAvanSection
      sourceOverride={sourceTotal}
      sourceBreakdown={breakdown}
      dominant={dominant}
      onVefkReady={onVefkReady}
      getBastLevelFn={getBastLevelFn}
    />
  );
}