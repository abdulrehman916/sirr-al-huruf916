/**
 * IstintakSteps — Shows full step-by-step decomposition of a number into Arabic letters.
 * Manuscript-compliant: every step shows number, slot, letter, reason.
 */
import { useMemo } from "react";

const UNITS_MAP    = {1:'ا',2:'ب',3:'ج',4:'د',5:'ه',6:'و',7:'ز',8:'ح',9:'ط'};
const TENS_MAP     = {10:'ي',20:'ك',30:'ل',40:'م',50:'ن',60:'س',70:'ع',80:'ف',90:'ص'};
const HUNDREDS_MAP = {100:'ق',200:'ر',300:'ش',400:'ت',500:'ث',600:'خ',700:'ذ',800:'ض',900:'ظ'};
// NOTE: thousands marker must be confirmed via manuscript cross-check
// Current software uses غ — manuscript (p.60) shows ع for ist(41487)
// Both values shown for transparency
const THOUSAND_MARK_SW  = 'غ'; // software
const THOUSAND_MARK_MS  = 'ع'; // manuscript (p.60–69 evidence)

const G = {
  text:   "#F5D060",
  dim:    "rgba(212,175,55,0.55)",
  border: "rgba(212,175,55,0.30)",
  bg:     "rgba(212,175,55,0.06)",
};

function getSteps(n, useManuscript = false) {
  if (!n || n <= 0) return [];
  n = Math.floor(n);
  const digits = [];
  let tmp = n;
  while (tmp > 0) { digits.push(tmp % 10); tmp = Math.floor(tmp / 10); }

  const MARK = useManuscript ? THOUSAND_MARK_MS : THOUSAND_MARK_SW;
  const steps = [];
  let slot = 0;
  let remaining = n;

  for (let i = 0; i < digits.length; i++) {
    const d = digits[i];
    if (slot === 0) {
      const l = d !== 0 ? UNITS_MAP[d] : null;
      steps.push({ digit: d, placeValue: d, slot: 'Units', slotAr: 'آحاد', letter: l, reason: l ? `${d} → آحاد → ${l}` : '0 → skip' });
      slot = 1;
    } else if (slot === 1) {
      const v = d * 10;
      const l = d !== 0 ? TENS_MAP[v] : null;
      steps.push({ digit: d, placeValue: v, slot: 'Tens', slotAr: 'عشرات', letter: l, reason: l ? `${d}×10=${v} → عشرات → ${l}` : '0 → skip' });
      slot = 2;
    } else if (slot === 2) {
      const v = d * 100;
      const l = d !== 0 ? HUNDREDS_MAP[v] : null;
      steps.push({ digit: d, placeValue: v, slot: 'Hundreds', slotAr: 'مئات', letter: l, reason: l ? `${d}×100=${v} → مئات → ${l}` : '0 → skip' });
      slot = 3;
    } else {
      // Thousands marker
      steps.push({ digit: d, placeValue: 1000, slot: 'Thousands Marker', slotAr: 'علامة الآلاف', letter: MARK, reason: `علامة آلاف → ${MARK}`, isMarker: true });
      const ul = (d !== 0) ? UNITS_MAP[d] : null;
      if (ul) {
        steps.push({ digit: d, placeValue: d, slot: 'Thousands Unit', slotAr: 'وحدة الآلاف', letter: ul, reason: `${d} → آحاد → ${ul}` });
      }
      slot = 1;
    }
  }
  return steps;
}

export default function IstintakSteps({ n, msMarker = false, compact = false }) {
  const steps = useMemo(() => getSteps(n, msMarker), [n, msMarker]);
  const letters = steps.filter(s => s.letter).map(s => s.letter);

  if (!n || n <= 0) return null;

  return (
    <div className="space-y-1.5">
      {/* Input number */}
      <div className="flex items-center justify-between rounded-lg border px-3 py-1.5"
        style={{ borderColor: G.border, background: G.bg }}>
        <span className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.dim }}>
          استنطاق
        </span>
        <span className="font-inter text-sm font-bold tabular-nums" style={{ color: G.text }}>
          {n.toLocaleString()}
        </span>
      </div>

      {/* Steps */}
      {!compact && steps.map((s, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg"
          style={{ background: s.isMarker ? "rgba(250,204,21,0.06)" : "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
          <span className="font-inter text-[7px] tabular-nums w-4" style={{ color: "rgba(255,255,255,0.25)" }}>{i+1}</span>
          <span className="font-inter text-[7px] w-12 text-right tabular-nums" style={{ color: "rgba(255,255,255,0.30)" }}>
            {s.placeValue > 0 ? s.placeValue : '—'}
          </span>
          <span className="font-inter text-[7px] flex-1" style={{ color: s.isMarker ? "rgba(250,204,21,0.55)" : "rgba(255,255,255,0.30)" }}>
            {s.slotAr}
          </span>
          <span className="font-amiri text-xl px-1.5 rounded"
            dir="rtl" lang="ar"
            style={{ fontFamily: "'Noto Naskh Arabic','Amiri','Scheherazade New',serif", color: s.letter ? G.text : "rgba(255,255,255,0.15)", background: s.letter ? G.bg : "transparent", minWidth: "1.6rem", textAlign: "center" }}>
            {s.letter || '—'}
          </span>
          <span className="font-inter text-[7px]" style={{ color: "rgba(255,255,255,0.20)" }}>
            {s.reason}
          </span>
        </div>
      ))}

      {/* Result — single RTL string, never split into flex children (flex+dir=rtl reverses visual order) */}
      <div className="rounded-lg border px-3 py-2 mt-1 space-y-1"
        style={{ borderColor: "rgba(74,222,128,0.40)", background: "rgba(74,222,128,0.06)" }}>
        <span className="font-inter text-[8px] uppercase tracking-widest block" style={{ color: "rgba(74,222,128,0.70)" }}>
          النتيجة ({letters.length} حرف)
        </span>
        {/* Reversed array + LTR flex: last extracted is leftmost, first extracted (index 0) is rightmost.
            Manuscript rule: 1st extracted letter must appear on the far right. */}
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "4px", direction: "ltr" }}>
          {[...letters].reverse().map((l, i) => (
            <span key={i}
              style={{
                fontFamily: "'Noto Naskh Arabic','Amiri','Scheherazade New',serif",
                fontSize: "1.3rem",
                color: "#4ADE80",
                border: "1px solid rgba(74,222,128,0.35)",
                background: "rgba(74,222,128,0.08)",
                borderRadius: "6px",
                padding: "0 6px",
              }}>
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export { getSteps };