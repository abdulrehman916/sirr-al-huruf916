/**
 * MplReviewDrawer — Owner review detail panel for a single MasterPdfPage.
 * Displays every required field and wires all Owner actions to the
 * Owner-only reviewMasterPdfPage backend. Append-only: original OCR is
 * never overwritten; corrections append to ocr_corrections.
 */
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  X, CheckCircle2, XCircle, RotateCcw, Edit3, StickyNote, HelpCircle,
  RefreshCw, GitMerge, ExternalLink, ImageIcon, Scale, Loader2, AlertTriangle,
  BookOpen, Hash, Clock, Tag, FileText, Languages, Shield, History,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const G = {
  border: "rgba(212,175,55,0.40)", borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060", dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)", bgHi: "rgba(212,175,55,0.14)",
};

function Field({ label, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: "0 0 3px 0", display: "flex", alignItems: "center", gap: 5 }}>
        {Icon && <Icon style={{ width: 11, height: 11 }} />}{label}
      </p>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.82)", wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{children}</div>
    </div>
  );
}

export default function MplReviewDrawer({ page, book, dupCount, allBooks, allPages, onClose, onChanged }) {
  const p = page || {};
  const b = book || {};
  const [busy, setBusy] = useState("");
  const [audit, setAudit] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [modal, setModal] = useState(null); // {type, ...}
  const [compareId, setCompareId] = useState("");

  // Verification history + notes for this page (SirrAuditLog, page_range === page number).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const logs = await base44.entities.SirrAuditLog.filter({ sirr_book_id: p.master_book_id }, "-timestamp", 100);
        if (!active) return;
        const mine = (logs || []).filter((l) => String(l.page_range || "") === String(p.page_number));
        setAudit(mine);
      } catch { /* ignore */ } finally { if (active) setLoadingAudit(false); }
    })();
    return () => { active = false; };
  }, [p.master_book_id, p.page_number]);

  // Sibling pages sharing the same content_hash (duplicate detection / related books).
  const siblings = useMemo(() => {
    if (!p.content_hash) return [];
    return (allPages || []).filter((x) => x.content_hash === p.content_hash && x.id !== p.id);
  }, [p.content_hash, allPages, p.id]);

  const siblingBooks = useMemo(() => {
    const bm = {};
    (allBooks || []).forEach((bk) => { bm[bk.master_book_id] = bk; });
    return siblings.map((s) => ({ page: s, book: bm[s.master_book_id] })).filter((s) => s.book);
  }, [siblings, allBooks]);

  // The originating PDF part (for "Open original PDF").
  const part = useMemo(() => {
    const parts = Array.isArray(b.pdf_parts) ? b.pdf_parts : [];
    return parts.find((pt) => pt.part_id === p.source_part_id) || parts[0] || null;
  }, [b, p.source_part_id]);

  const cls = p.ai_classification || {};
  const clsKeys = Object.keys(cls).filter((k) => Array.isArray(cls[k]) && cls[k].length > 0);
  const qf = p.quality_flags || {};
  const qfKeys = Object.keys(qf).filter((k) => qf[k] === true);

  async function run(mode, payload = {}) {
    setBusy(mode);
    try {
      const res = await base44.functions.invoke("reviewMasterPdfPage", { mode, page_id: p.id, ...payload });
      const data = res?.data || res;
      if (data?.error) throw new Error(data.error);
      onChanged && onChanged();
    } catch (e) {
      alert("Action failed: " + (e?.message || e));
    } finally {
      setBusy("");
      setModal(null);
    }
  }

  const statusColor = p.review_status === "approved" ? "#86efac" : p.review_status === "rejected" || p.review_status === "ignored" ? "#f87171" : "#fca5a5";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.70)", zIndex: 1000, display: "flex", justifyContent: "flex-end", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ x: 480 }} animate={{ x: 0 }} exit={{ x: 480 }} transition={{ type: "spring", stiffness: 280, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(560px, 100vw)", height: "100%", background: "linear-gradient(180deg, #060c1c 0%, #020710 100%)", borderLeft: `1px solid ${G.border}`, overflowY: "auto", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div style={{ position: "sticky", top: 0, zIndex: 2, background: "rgba(2,7,16,0.96)", borderBottom: `1px solid ${G.border}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, backdropFilter: "blur(8px)" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.50)", padding: 0 }}><X style={{ width: 18, height: 18 }} /></button>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>Page {p.page_number}{p.page_label ? ` (${p.page_label})` : ""}</span>
          <span style={{ fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, color: statusColor, border: `1px solid ${statusColor}55`, background: `${statusColor}15`, textTransform: "capitalize", marginLeft: "auto" }}>{(p.review_status || "").replace(/_/g, " ")}</span>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 18px 24px", flex: 1 }}>
          {/* Action toolbar */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
            <ActBtn icon={CheckCircle2} label="Approve" color="#86efac" onClick={() => run("approve")} busy={busy === "approve"} disabled={p.review_status === "approved"} />
            <ActBtn icon={XCircle} label="Reject" color="#f87171" onClick={() => setModal({ type: "reject" })} busy={busy === "reject"} disabled={p.review_status === "rejected"} />
            <ActBtn icon={Edit3} label="Correct" color={G.text} onClick={() => setModal({ type: "correct" })} busy={busy === "correct"} />
            <ActBtn icon={StickyNote} label="Note" color={G.text} onClick={() => setModal({ type: "note" })} busy={busy === "note"} />
            <ActBtn icon={HelpCircle} label="Uncertain" color="#fbbf24" onClick={() => run("uncertain")} busy={busy === "uncertain"} />
            <ActBtn icon={RefreshCw} label="Reprocess" color="#60a5fa" onClick={() => setModal({ type: "reprocess" })} busy={busy === "reprocess"} disabled={p.review_status === "approved" || p.review_status === "verified"} />
            <ActBtn icon={GitMerge} label="Merge" color="#c084fc" onClick={() => setModal({ type: "merge" })} busy={busy === "merge"} disabled={p.review_status === "approved"} />
            {p.review_status === "rejected" || p.review_status === "ignored" ? (
              <ActBtn icon={RotateCcw} label="Re-review" color="#86efac" onClick={() => run("re_review")} busy={busy === "re_review"} />
            ) : null}
            {part?.file_url && <ActBtn icon={ExternalLink} label="Open PDF" color={G.dim} onClick={() => window.open(part.file_url, "_blank")} />}
            {p.original_scan_url && <ActBtn icon={ImageIcon} label="Page image" color={G.dim} onClick={() => window.open(p.original_scan_url, "_blank")} />}
            {siblings.length > 0 && <ActBtn icon={Scale} label={`Compare (${siblings.length})`} color={G.dim} onClick={() => setModal({ type: "compare" })} />}
          </div>

          {/* Confidence + quality (heatmap) */}
          <div style={{ padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 14 }}>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(255,255,255,0.40)", margin: "0 0 8px 0" }}>OCR Confidence</p>
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${p.ocr_confidence ?? 100}%`, background: (p.ocr_confidence ?? 100) >= 90 ? "#86efac" : (p.ocr_confidence ?? 100) >= 70 ? "#fbbf24" : "#f87171", transition: "width 0.3s" }} />
            </div>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: G.text, margin: "6px 0 0 0", fontWeight: 700 }}>{p.ocr_confidence ?? 100}%</p>
            {qfKeys.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
                {qfKeys.map((k) => (
                  <span key={k} style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.35)" }}>
                    <AlertTriangle style={{ width: 9, height: 9, verticalAlign: "middle", marginRight: 3 }} />{k.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Source / citation block */}
          <div style={{ padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 14 }}>
            <Field label="Original PDF name" icon={FileText}>{part?.file_name || b.book_title || p.master_book_id}</Field>
            <Field label="Cloud source" icon={Cloud2Icon}>{cloudSource(b, p)}</Field>
            <Field label="Book title" icon={BookOpen}>{b.book_title || "—"}{b.book_title_ar ? ` · ${b.book_title_ar}` : ""}</Field>
            <Field label="Source author" icon={Shield}>{b.author || "—"}</Field>
            <Field label="Volume" icon={BookOpen}>{b.volume || "—"}</Field>
            <Field label="Page" icon={FileText}>{p.page_number}{p.page_label ? ` (${p.page_label})` : ""}</Field>
            <Field label="Publisher" icon={BookOpen}>{b.publisher || "—"}</Field>
            <Field label="Edition" icon={BookOpen}>{b.edition || "—"}</Field>
            <Field label="Language" icon={Languages}>{b.language || "—"}</Field>
            <Field label="Processing date" icon={Clock}>{p.indexed_at ? new Date(p.indexed_at).toLocaleString() : "—"}</Field>
          </div>

          {/* Text content */}
          <div style={{ padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 14 }}>
            <Field label="Arabic text (verified)" icon={BookOpen}>
              <span className="font-amiri" style={{ direction: "rtl", textAlign: "right", display: "block", color: G.text, fontSize: 16, lineHeight: 1.9 }}>{p.arabic_text || "—"}</span>
            </Field>
            <Field label="OCR text (original — immutable)" icon={FileText}>
              <pre style={{ fontFamily: "Inter, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.65)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 180, overflowY: "auto", margin: 0 }}>{p.ocr_text || "—"}</pre>
            </Field>
            <Field label="Arabic OCR (original)" icon={BookOpen}>
              <span className="font-amiri" style={{ direction: "rtl", textAlign: "right", display: "block", color: G.dim, fontSize: 14 }}>{p.ocr_text_ar || "—"}</span>
            </Field>
            <Field label="English" icon={Languages}>{p.english_text || p.ocr_text_en || "—"}</Field>
            <Field label="Malayalam" icon={Languages}><span className="font-malayalam" style={{ fontSize: 13 }}>{p.malayalam_text || p.ocr_text_ml || "—"}</span></Field>
          </div>

          {/* Duplicate / related / citations */}
          <div style={{ padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 14 }}>
            <Field label="Duplicate status" icon={GitMerge}>{dupCount > 1 ? `Supported by ${dupCount} sources (same content hash)` : "Unique (single source)"}</Field>
            <Field label="Content hash" icon={Hash}><code style={{ fontFamily: "monospace", fontSize: 10, color: G.dim }}>{p.content_hash || "—"}</code></Field>
            {siblingBooks.length > 0 && (
              <Field label="Related books (same content)" icon={BookOpen}>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {siblingBooks.map((s, i) => (
                    <li key={i} style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.70)", marginBottom: 3 }}>
                      {s.book.book_title} · p.{s.page.page_number}{s.book.author ? ` · ${s.book.author}` : ""}
                    </li>
                  ))}
                </ul>
              </Field>
            )}
            <Field label="All citations" icon={FileText}>
              {[{ bk: b, pg: p.page_number }].concat(siblingBooks.map((s) => ({ bk: s.book, pg: s.page.page_number }))).map((c, i) => (
                <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.70)", marginBottom: 5 }}>
                  {c.bk.author ? `${c.bk.author}, ` : ""}<em>{c.bk.book_title || "Untitled"}</em>{c.bk.edition ? `, ${c.bk.edition}` : ""}{c.bk.publisher ? `, ${c.bk.publisher}` : ""}{c.bk.publication_year ? `, ${c.bk.publication_year}` : ""} — p.{c.pg}
                </div>
              ))}
            </Field>
          </div>

          {/* AI classification (AI notes / content category) */}
          <div style={{ padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 14 }}>
            <Field label="Content category" icon={Tag}>
              {clsKeys.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {clsKeys.map((k) => <span key={k} style={{ fontFamily: "Inter, sans-serif", fontSize: 9, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: "rgba(212,175,55,0.12)", color: G.text, border: `1px solid ${G.border}` }}>{k} ({cls[k].length})</span>)}
                </div>
              ) : "—"}
            </Field>
            {clsKeys.map((k) => (
              <Field key={k} label={`AI notes · ${k}`} icon={Tag}>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {cls[k].slice(0, 8).map((it, i) => <li key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 2 }}>{typeof it === "string" ? it : it?.text || JSON.stringify(it)}</li>)}
                </ul>
              </Field>
            ))}
            {(p.extracted_images || []).length > 0 && (
              <Field label="Extracted images" icon={ImageIcon}>
                {(p.extracted_images || []).map((im, i) => (
                  <div key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>
                    <span style={{ color: G.text, fontWeight: 600 }}>{im.image_type}</span>{im.caption ? ` — ${im.caption}` : ""}
                  </div>
                ))}
              </Field>
            )}
          </div>

          {/* Version + verification history */}
          <div style={{ padding: 12, borderRadius: 9, background: "rgba(255,255,255,0.03)", border: `1px solid ${G.border}`, marginBottom: 14 }}>
            <Field label="Corrections (append-only)" icon={Edit3}>
              {(p.ocr_corrections || []).length === 0 ? "None" : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {(p.ocr_corrections || []).map((c, i) => (
                    <li key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>
                      <span style={{ color: G.text }}>{c.field}</span> · {c.timestamp ? new Date(c.timestamp).toLocaleString() : ""}<br />
                      <span style={{ color: "#f87171" }}>− {c.original_snippet?.slice(0, 60)}</span><br />
                      <span style={{ color: "#86efac" }}>+ {c.corrected_snippet?.slice(0, 60)}</span>
                      {c.reason ? <div style={{ color: "rgba(255,255,255,0.45)" }}>· {c.reason}</div> : null}
                    </li>
                  ))}
                </ul>
              )}
            </Field>
            <Field label="Version history (book)" icon={History}>
              {(b.version_history || []).length === 0 ? "None" : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {(b.version_history || []).slice(-8).reverse().map((v, i) => (
                    <li key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 3 }}>
                      {v.change_summary}{v.timestamp ? ` · ${new Date(v.timestamp).toLocaleString()}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </Field>
            <Field label="Verification history" icon={History}>
              {loadingAudit ? <span style={{ color: G.dim }}>Loading…</span> : audit.length === 0 ? "None" : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {audit.map((a, i) => (
                    <li key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginBottom: 3 }}>
                      <span style={{ color: a.status === "failed" ? "#f87171" : a.status === "info" ? "#60a5fa" : "#86efac" }}>{a.status}</span> · {a.details}{a.timestamp ? ` · ${new Date(a.timestamp).toLocaleString()}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </Field>
          </div>
        </div>

        {/* ── Modals ── */}
        <AnimateModal open={modal?.type === "reject"}>
          <RejectForm onCancel={() => setModal(null)} onSubmit={(reason) => run("reject", { reason })} busy={busy === "reject"} />
        </AnimateModal>
        <AnimateModal open={modal?.type === "correct"}>
          <CorrectForm fields={["arabic_text", "english_text", "malayalam_text"]} current={p} onCancel={() => setModal(null)} onSubmit={(field, value, reason) => run("correct", { field, corrected_value: value, reason })} busy={busy === "correct"} />
        </AnimateModal>
        <AnimateModal open={modal?.type === "note"}>
          <NoteForm onCancel={() => setModal(null)} onSubmit={(note) => run("note", { note })} busy={busy === "note"} />
        </AnimateModal>
        <AnimateModal open={modal?.type === "reprocess"}>
          <ReprocessForm onCancel={() => setModal(null)} onSubmit={() => run("reprocess")} busy={busy === "reprocess"} />
        </AnimateModal>
        <AnimateModal open={modal?.type === "merge"}>
          <MergeForm siblings={siblings} books={allBooks} onCancel={() => setModal(null)} onSubmit={(canonical) => run("merge", { canonical_page_record_id: canonical })} busy={busy === "merge"} />
        </AnimateModal>
        <AnimateModal open={modal?.type === "compare"}>
          <CompareForm page={p} siblings={siblings} books={allBooks} onCancel={() => setModal(null)} />
        </AnimateModal>
      </motion.div>
    </motion.div>
  );
}

function cloudSource(b, p) {
  if (b.import_source === "onedrive" || b.onedrive_file_id) return `OneDrive · ${b.onedrive_file_path || b.onedrive_file_id || ""}`;
  if (b.import_source === "adobe" || b.adobe_file_id) return `Adobe Document Cloud · ${b.adobe_file_path || b.adobe_file_id || ""}`;
  if (b.import_source === "upload" || b.import_source === "multi_upload") return `Uploaded · ${b.source_label || "local upload"}`;
  return b.import_source || b.source_label || "—";
}

// Inline icon to avoid extra import aliasing in the JSX above
function Cloud2Icon(props) { return <ExternalLink {...props} />; }

function ActBtn({ icon: Icon, label, color, onClick, busy, disabled }) {
  return (
    <button onClick={onClick} disabled={busy || disabled} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 10px", borderRadius: 7, cursor: disabled ? "not-allowed" : "pointer", background: busy ? G.bgHi : "rgba(255,255,255,0.04)", border: `1px solid ${G.border}`, color: disabled ? "rgba(255,255,255,0.25)" : color, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600, opacity: disabled && !busy ? 0.5 : 1 }}>
      {busy ? <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} /> : <Icon style={{ width: 12, height: 12 }} />}
      {label}
    </button>
  );
}

function AnimateModal({ open, children }) {
  if (!open) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, padding: 20 }} onClick={(e) => e.stopPropagation()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ width: "min(420px, 100%)", background: "#0a1428", border: `1px solid ${G.borderHi}`, borderRadius: 12, padding: 18 }} onClick={(e) => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ width: "100%", padding: "9px 11px", borderRadius: 8, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif", resize: "vertical" }} />;
}

function RejectForm({ onCancel, onSubmit, busy }) {
  const [reason, setReason] = useState("");
  return (
    <div>
      <h3 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 14, margin: "0 0 10px 0" }}>Reject this page</h3>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "0 0 10px 0" }}>The page is kept in history and can be re-opened later. It will never enter the knowledge base.</p>
      <Textarea value={reason} onChange={setReason} placeholder="Reason for rejection (optional)" />
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
        <button onClick={() => onSubmit(reason)} disabled={busy} style={btnDanger}>{busy ? "Rejecting…" : "Reject"}</button>
      </div>
    </div>
  );
}

function CorrectForm({ fields, current, onCancel, onSubmit, busy }) {
  const [field, setField] = useState("arabic_text");
  const [value, setValue] = useState(current.arabic_text || "");
  const [reason, setReason] = useState("");
  useEffect(() => { setValue(current[field] || ""); }, [field, current]);
  const isArabic = field === "arabic_text";
  return (
    <div>
      <h3 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 14, margin: "0 0 10px 0" }}>Correct verified text</h3>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "0 0 10px 0" }}>Original OCR is preserved forever. This updates the verified field and appends a correction record.</p>
      <select value={field} onChange={(e) => setField(e.target.value)} style={{ width: "100%", marginBottom: 8, padding: "8px 10px", borderRadius: 8, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif" }}>
        {fields.map((f) => <option key={f} value={f} style={{ background: "#0a1428" }}>{f.replace(/_/g, " ")}</option>)}
      </select>
      <textarea value={value} onChange={(e) => setValue(e.target.value)} dir={isArabic ? "rtl" : "ltr"} rows={4} className={isArabic ? "font-amiri" : ""} style={{ width: "100%", padding: "10px", borderRadius: 8, fontSize: isArabic ? 16 : 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: isArabic ? "var(--font-amiri)" : "Inter, sans-serif", resize: "vertical", lineHeight: isArabic ? 1.9 : 1.5, textAlign: isArabic ? "right" : "left" }} />
      <Textarea value={reason} onChange={setReason} placeholder="Reason / source for this correction (optional)" rows={2} />
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
        <button onClick={() => onSubmit(field, value, reason)} disabled={busy} style={btnPrimary}>{busy ? "Saving…" : "Save correction"}</button>
      </div>
    </div>
  );
}

function NoteForm({ onCancel, onSubmit, busy }) {
  const [note, setNote] = useState("");
  return (
    <div>
      <h3 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 14, margin: "0 0 10px 0" }}>Add owner note</h3>
      <Textarea value={note} onChange={setNote} placeholder="Note for this page (recorded permanently in the audit log)" rows={4} />
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
        <button onClick={() => onSubmit(note)} disabled={busy || !note.trim()} style={btnPrimary}>{busy ? "Saving…" : "Save note"}</button>
      </div>
    </div>
  );
}

function ReprocessForm({ onCancel, onSubmit, busy }) {
  return (
    <div>
      <h3 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 14, margin: "0 0 10px 0" }}>Request re-processing</h3>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "0 0 10px 0" }}>This deletes the unverified draft and re-runs the pipeline for this page. Approved pages cannot be reprocessed. The old draft remains in the audit history.</p>
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
        <button onClick={onSubmit} disabled={busy} style={btnPrimary}>{busy ? "Requesting…" : "Reprocess"}</button>
      </div>
    </div>
  );
}

function MergeForm({ siblings, books, onCancel, onSubmit, busy }) {
  const bm = {}; (books || []).forEach((bk) => { bm[bk.master_book_id] = bk; });
  const [canonical, setCanonical] = useState(siblings[0]?.id || "");
  return (
    <div>
      <h3 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 14, margin: "0 0 10px 0" }}>Merge into canonical</h3>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.55)", margin: "0 0 10px 0" }}>Mark this page a duplicate. It is kept in history (never deleted) but the selected canonical page becomes the publishable record.</p>
      {siblings.length === 0 ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#fca5a5" }}>No pages share this content hash. Merge is for true duplicates only.</p>
      ) : (
        <select value={canonical} onChange={(e) => setCanonical(e.target.value)} style={{ width: "100%", marginBottom: 8, padding: "8px 10px", borderRadius: 8, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif" }}>
          {siblings.map((s) => <option key={s.id} value={s.id} style={{ background: "#0a1428" }}>{bm[s.master_book_id]?.book_title || s.master_book_id} · p.{s.page_number}</option>)}
        </select>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={btnSecondary}>Cancel</button>
        <button onClick={() => onSubmit(canonical)} disabled={busy || !canonical} style={btnPrimary}>{busy ? "Merging…" : "Merge"}</button>
      </div>
    </div>
  );
}

function CompareForm({ page, siblings, books, onCancel }) {
  const bm = {}; (books || []).forEach((bk) => { bm[bk.master_book_id] = bk; });
  const [sel, setSel] = useState(siblings[0]?.id || "");
  const other = siblings.find((s) => s.id === sel);
  return (
    <div style={{ maxWidth: 460 }}>
      <h3 style={{ fontFamily: "Inter, sans-serif", color: "#fff", fontSize: 14, margin: "0 0 10px 0" }}>Compare with another book</h3>
      {siblings.length === 0 ? (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>No duplicate pages to compare.</p>
      ) : (
        <>
          <select value={sel} onChange={(e) => setSel(e.target.value)} style={{ width: "100%", marginBottom: 10, padding: "8px 10px", borderRadius: 8, fontSize: 12, color: "#fff", background: "rgba(255,255,255,0.05)", border: `1px solid ${G.border}`, outline: "none", fontFamily: "Inter, sans-serif" }}>
            {siblings.map((s) => <option key={s.id} value={s.id} style={{ background: "#0a1428" }}>{bm[s.master_book_id]?.book_title || s.master_book_id} · p.{s.page_number}</option>)}
          </select>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: G.text, textTransform: "uppercase", marginBottom: 4 }}>This page</p>
              <pre style={{ fontSize: 10, color: "rgba(255,255,255,0.70)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 200, overflowY: "auto", margin: 0, padding: 8, background: "rgba(255,255,255,0.03)", borderRadius: 6, border: `1px solid ${G.border}` }}>{page.ocr_text || "—"}</pre>
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 700, color: G.text, textTransform: "uppercase", marginBottom: 4 }}>Other</p>
              <pre style={{ fontSize: 10, color: "rgba(255,255,255,0.70)", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 200, overflowY: "auto", margin: 0, padding: 8, background: "rgba(255,255,255,0.03)", borderRadius: 6, border: `1px solid ${G.border}` }}>{other?.ocr_text || "—"}</pre>
            </div>
          </div>
        </>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={btnSecondary}>Close</button>
      </div>
    </div>
  );
}

const btnPrimary = { padding: "8px 14px", borderRadius: 7, cursor: "pointer", background: "linear-gradient(135deg, #f6d860 0%, #c98a14 100%)", border: "none", color: "#0d1b2a", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700 };
const btnSecondary = { padding: "8px 14px", borderRadius: 7, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: `1px solid ${G.border}`, color: "rgba(255,255,255,0.70)", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600 };
const btnDanger = { padding: "8px 14px", borderRadius: 7, cursor: "pointer", background: "linear-gradient(135deg, rgba(239,68,68,0.5) 0%, rgba(239,68,68,0.3) 100%)", border: "1px solid rgba(239,68,68,0.6)", color: "#fff", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 700 };