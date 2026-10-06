/**
 * CitationExplorer — opens a citation as Book → Volume → Page →
 * Original PDF page → highlighted source text. Pure frontend using
 * data already present in the search/db results.
 *
 * Props: { citation, ocr_text, arabic_text, original_scan_url,
 *          pdf_file_url, query, onClose }
 */
import { motion } from "framer-motion";
import { X, BookOpen, Layers, FileText, ExternalLink, ImageIcon, Highlighter } from "lucide-react";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)", bg: "rgba(212,175,55,0.07)",
};

function escapeReg(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export default function CitationExplorer({ citation = {}, ocr_text = "", arabic_text = "", original_scan_url = "", pdf_file_url = "", query = "", onClose }) {
  const c = citation;
  const q = (query || "").trim();

  // Highlight query occurrences in the source text (Arabic + OCR).
  const highlight = (text) => {
    if (!text) return "—";
    if (!q) return text;
    let normQ = q;
    // Harakat-insensitive highlight: strip diacritics for matching, but show original.
    const stripped = (s) => s.replace(/[\u064B-\u0652\u0670\u0640]/g, "");
    const hay = text;
    const hayStripped = stripped(hay);
    const qStripped = stripped(q);
    if (!qStripped) return hay;
    const parts = [];
    let last = 0;
    // search in stripped, map back to original indices is complex; fall back to direct includes for highlight.
    const re = new RegExp(escapeReg(q), "gi");
    let m;
    let idx = 0;
    const direct = hay.match(re);
    if (direct) {
      re.lastIndex = 0;
      while ((m = re.exec(hay)) !== null) {
        parts.push(hay.slice(last, m.index));
        parts.push(<mark key={idx++} style={{ background: "rgba(212,175,55,0.30)", color: "#fff", borderRadius: 2, padding: "0 1px" }}>{m[0]}</mark>);
        last = m.index + m[0].length;
        if (m.index === re.lastIndex) re.lastIndex++;
      }
      parts.push(hay.slice(last));
      return parts;
    }
    // Fallback: harakat-insensitive by scanning stripped window
    if (hayStripped.includes(qStripped)) {
      const start = hayStripped.indexOf(qStripped);
      // approximate highlight: mark a window in original of similar length
      const approxEnd = Math.min(hay.length, start + qStripped.length + 8);
      parts.push(hay.slice(0, start));
      parts.push(<mark key={idx++} style={{ background: "rgba(212,175,55,0.25)", borderRadius: 2 }}>{hay.slice(start, approxEnd)}</mark>);
      parts.push(hay.slice(approxEnd));
      return parts;
    }
    return hay;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.70)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: 16, backdropFilter: "blur(4px)" }}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}
        style={{ width: "min(680px, 100%)", maxHeight: "88vh", overflowY: "auto", background: "linear-gradient(180deg, #060c1c 0%, #020710 100%)", border: `1px solid ${G.borderHi}`, borderRadius: 14, padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Highlighter style={{ width: 18, height: 18, color: G.text }} />
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 14, fontWeight: 700, color: "#fff" }}>Citation Explorer</span>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.50)" }}><X style={{ width: 18, height: 18 }} /></button>
        </div>

        {/* Trail: Book → Volume → Page → Original PDF page → highlighted source text */}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginBottom: 14, padding: 10, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}` }}>
          <Trail icon={BookOpen} label="Book" value={c.book_title || "—"} />
          <Sep />
          <Trail icon={Layers} label="Volume" value={c.volume || "—"} />
          <Sep />
          <Trail icon={FileText} label="Page" value={String(c.page ?? "—")} />
          {pdf_file_url && (<><Sep /><a href={pdf_file_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}><Trail icon={ExternalLink} label="Original PDF" value="open" link /></a></>)}
        </div>

        {/* Author / publisher / edition / language */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <Meta label="Author" value={c.author} />
          <Meta label="Publisher" value={c.publisher} />
          <Meta label="Edition" value={c.edition} />
          <Meta label="Language" value={c.language} />
        </div>

        {/* Original page image */}
        {original_scan_url && (
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: "0 0 6px 0" }}>Original page image</p>
            <a href={original_scan_url} target="_blank" rel="noreferrer" style={{ display: "inline-block" }}>
              <img src={original_scan_url} alt="page scan" style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 8, border: `1px solid ${G.border}` }} />
            </a>
          </div>
        )}

        {/* Highlighted source text */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: "0 0 6px 0", display: "flex", alignItems: "center", gap: 5 }}>
            <ImageIcon style={{ width: 11, height: 11 }} /> Highlighted source text {q ? `· matching "${q}"` : ""}
          </p>
          {arabic_text && (
            <p className="font-amiri" style={{ direction: "rtl", textAlign: "right", color: G.text, fontSize: 16, lineHeight: 2, background: "rgba(255,255,255,0.02)", padding: 10, borderRadius: 8, border: `1px solid ${G.border}`, marginBottom: 8 }}>
              {highlight(arabic_text)}
            </p>
          )}
          <pre style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.75)", whiteSpace: "pre-wrap", wordBreak: "break-word", background: "rgba(255,255,255,0.02)", padding: 10, borderRadius: 8, border: `1px solid ${G.border}`, maxHeight: 280, overflowY: "auto", margin: 0, lineHeight: 1.6 }}>
            {highlight(ocr_text)}
          </pre>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Trail({ icon: Icon, label, value, link }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <Icon style={{ width: 12, height: 12, color: G.dim }} />
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)" }}>{label}</span>
      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, color: link ? "#60a5fa" : "#fff" }}>{value}</span>
    </span>
  );
}
function Sep() { return <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 11 }}>→</span>; }
function Meta({ label, value }) {
  return (
    <div style={{ padding: 9, borderRadius: 7, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}` }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: "0 0 2px 0" }}>{label}</p>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.82)", margin: 0 }}>{value || "—"}</p>
    </div>
  );
}