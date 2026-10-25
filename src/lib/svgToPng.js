// ═══════════════════════════════════════════════════════════════
// Turning the wafq sheet into a PNG the reader can print.
//
// An SVG rasterised through an <img> is rendered in its own context:
// the page's webfonts are not there, and Arabic would fall back to
// whatever the system happens to have — different letterforms, and
// the kashida stretching measured for one font sitting under another.
//
// So the font is fetched once and written into the copy as base64
// before it is rasterised. If that fails (offline, blocked), the
// drawing still exports; only the letterforms fall back.
// ═══════════════════════════════════════════════════════════════

const FONT_CSS =
  "https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;700&family=Amiri:wght@400;700&display=swap";

let fontCache = null;

/** Fetches the font files the page uses and returns them as @font-face CSS. */
async function inlineFontCss() {
  if (fontCache !== null) return fontCache;
  try {
    const css = await (await fetch(FONT_CSS)).text();
    const urls = [...css.matchAll(/url\((https:\/\/[^)]+\.woff2)\)/g)].map((m) => m[1]);
    const seen = new Map();
    await Promise.all(
      urls.map(async (u) => {
        if (seen.has(u)) return;
        const buf = await (await fetch(u)).arrayBuffer();
        let bin = "";
        const bytes = new Uint8Array(buf);
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
        seen.set(u, `data:font/woff2;base64,${btoa(bin)}`);
      })
    );
    fontCache = css.replace(/url\((https:\/\/[^)]+\.woff2)\)/g,
      (m, u) => (seen.has(u) ? `url(${seen.get(u)})` : m));
  } catch (_) {
    fontCache = "";          // export without it rather than not at all
  }
  return fontCache;
}

/**
 * Rasterises `svg` at `scale`× its viewBox and hands back a PNG blob URL.
 * `background` is painted first so the sheet prints on paper, not glass.
 */
export async function svgToPngUrl(svg, { scale = 3, background = "#ffffff" } = {}) {
  const vb = svg.viewBox.baseVal;
  const w = (vb && vb.width) || svg.clientWidth || 1000;
  const h = (vb && vb.height) || svg.clientHeight || 1000;

  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", w);
  clone.setAttribute("height", h);

  const css = await inlineFontCss();
  if (css) {
    const st = document.createElementNS("http://www.w3.org/2000/svg", "style");
    st.textContent = css;
    clone.insertBefore(st, clone.firstChild);
  }

  const src = "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(new XMLSerializer().serializeToString(clone));

  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });

  const cv = document.createElement("canvas");
  cv.width = Math.round(w * scale);
  cv.height = Math.round(h * scale);
  const g = cv.getContext("2d");
  if (background) { g.fillStyle = background; g.fillRect(0, 0, cv.width, cv.height); }
  g.drawImage(img, 0, 0, cv.width, cv.height);
  return cv.toDataURL("image/png");
}

/** Rasterises and saves it. */
export async function downloadSvgPng(svg, filename = "wafq.png", opts) {
  const url = await svgToPngUrl(svg, opts);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
