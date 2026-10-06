// Standard 12-hour AM/PM time formatter for all user-facing Astro Clock displays.
// Internal engine calculations keep 24-hour decimals; only user-facing display uses this.
// Accepts a decimal hour (e.g. 13.5 -> "1:30 PM", 5.7 -> "5:42 AM", 0 -> "12:00 AM").
export function formatDecimalHour12h(decimalHour, lang) {
  if (typeof decimalHour !== "number" || !isFinite(decimalHour)) return "—";
  let h = decimalHour;
  while (h < 0) h += 24;
  while (h >= 24) h -= 24;
  let hh = Math.floor(h);
  let mm = Math.round((h - hh) * 60);
  if (mm >= 60) { mm -= 60; hh += 1; }
  if (hh >= 24) hh -= 24;
  const display = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh;
  const isPM = hh >= 12 && hh < 24;
  const ampm = lang === "ar" ? (isPM ? "م" : "ص") : (isPM ? "PM" : "AM");
  return `${display}:${mm.toString().padStart(2, "0")} ${ampm}`;
}