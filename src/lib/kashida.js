// ═══════════════════════════════════════════════════════════════
// Kashida — stretching an Arabic word so one of its letters is drawn
// out into a long stroke.
//
// This is how the writing around a wafq is built:
//
//   • on each side of the square a cluster of letters stands outside
//     one corner, one letter is drawn out to make the side itself,
//     and the rest of the word ends past the far corner —
//        بس ـــــــــ م   ·   الل ـــــــــ ه
//        الرح ـــــــــ من   ·   الرح ـــــــــ يم
//
//   • at each corner the verse is written the same way, stretched on
//     its FIRST letter, so the qaf's tail is the stroke that lies
//     across the corner — ق ـــــــــ وله
//
// Arabic does this with the tatweel ـ (U+0640): a real joining glyph,
// so the letters stay connected and the word stays readable.
// ═══════════════════════════════════════════════════════════════

export const TATWEEL = "ـ";

/** Letters that never join to what follows, so no tatweel after them. */
const NON_JOINING_AFTER = new Set([
  "ا", "أ", "إ", "آ", "د", "ذ", "ر", "ز", "و", "ؤ", "ة", "ى", "ء", " ",
]);

/** Indices in `word` where a tatweel may be inserted. */
export function kashidaSlots(word) {
  const ch = [...word];
  const out = [];
  for (let i = 0; i < ch.length - 1; i++) {
    if (NON_JOINING_AFTER.has(ch[i])) continue;
    if (ch[i + 1] === " ") continue;
    out.push(i);
  }
  return out;
}

/** Inserts `n` tatweels straight after character index `at`. */
export function stretchAt(word, n, at) {
  if (!n || n < 1) return word;
  let out = "";
  [...word].forEach((c, i) => {
    out += c;
    if (i === at) out += TATWEEL.repeat(n);
  });
  return out;
}

/** Stretches on the word's first joining letter (the corner verse). */
export function stretchFirst(word, n) {
  const s = kashidaSlots(word);
  return s.length ? stretchAt(word, n, s[0]) : word;
}

/**
 * Stretches `word` at `at` until it is as near `target` px as the
 * glyphs allow without overshooting. `measure(text) -> width`.
 */
export function fitAt(word, at, target, measure, max = 240) {
  if (measure(word) >= target) return word;
  let lo = 0, hi = max;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (measure(stretchAt(word, mid, at)) <= target) lo = mid;
    else hi = mid - 1;
  }
  return stretchAt(word, lo, at);
}

/** The same, stretching on the word's first joining letter. */
export function fitFirst(word, target, measure, max = 240) {
  const s = kashidaSlots(word);
  if (!s.length) return word;
  return fitAt(word, s[0], target, measure, max);
}
