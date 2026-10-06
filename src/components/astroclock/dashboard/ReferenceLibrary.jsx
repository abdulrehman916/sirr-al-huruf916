// ═══════════════════════════════════════════════════════════════
// SECTION 8 — REFERENCE LIBRARY (MASTER MANUSCRIPT CATALOG)
// Every uploaded manuscript with full metadata, page-by-page breakdown,
// missing pages, records per page, and linked destinations.
// Clicking a page shows every knowledge record extracted from it.
// Read-only — consumes ManuscriptBook + AstroClockKnowledge. No engine/data changes.
// ═══════════════════════════════════════════════════════════════
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, BookOpen, FileText, Globe, Calendar, Link2, Layers, CheckCircle2, AlertTriangle, Trash2 } from "lucide-react";
import { useManuscriptCatalog, refreshCatalog } from "@/hooks/useManuscriptCatalog";
import { base44 } from "@/api/base44Client";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";

function parsePageNum(p) {
  if (!p) return null;
  const m = String(p).match(/(\d+)/);
  return m ? parseInt(m[1]) : null;
}

function fmtDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch (_) { return String(iso).slice(0, 10); }
}

function categoryLabel(cat, txt) {
  const map = {
    planet: txt("ഗ്രഹം", "Planet", "Gezegen"),
    weekday: txt("ദിവസം", "Weekday", "Gün"),
    "lunar mansion": txt("നക്ഷത്രം", "Mansion", "Menzil"),
    zodiac: txt("രാശി", "Zodiac", "Burç"),
    "planetary hour": txt("സഅാത്", "Planetary Hour", "Saat"),
    ritual: txt("ആചാരം", "Ritual", "Ritüel"),
    "moon phase": txt("ചാന്ദ്ര ഘട്ടം", "Moon Phase", "Ay Evresi"),
  };
  return map[cat] || cat || "—";
}

function toRanges(nums) {
  if (!nums.length) return [];
  const sorted = [...nums].sort((a, b) => a - b);
  const ranges = [];
  let s = sorted[0], e = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === e + 1) e = sorted[i];
    else { ranges.push([s, e]); s = sorted[i]; e = sorted[i]; }
  }
  ranges.push([s, e]);
  return ranges;
}

function MetaItem({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="font-inter text-[8px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: "rgba(255,255,255,0.35)" }}>
        <Icon className="w-2.5 h-2.5" style={{ color: color || "rgba(212,175,55,0.50)" }} />{label}
      </span>
      <span className="font-inter text-[10px] font-bold truncate" style={{ color: "rgba(255,255,255,0.80)" }} title={typeof value === "string" ? value : undefined}>{value ?? "—"}</span>
    </div>
  );
}

function PageRecord({ rec, txt, language }) {
  const [open, setOpen] = useState(false);
  const cat = rec.rule_category || "—";
  const entity = rec.rule_entity || "—";
  const text = rec.knowledge_text_en || "";
  const ar = rec.knowledge_text_ar || "";
  const recCount = (rec.recommended_actions?.length || 0) + (rec.forbidden_actions?.length || 0) + (rec.enemy_actions?.length || 0) + (rec.warnings_list?.length || 0);
  return (
    <div className="rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.10)" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-start gap-2 p-2 text-left">
        <Link2 className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "rgba(129,140,248,0.60)" }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-inter text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(129,140,248,0.10)", color: "#818CF8" }}>{categoryLabel(cat, txt)}</span>
            <span className="font-inter text-[10px] font-bold truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{entity}</span>
          </div>
          <p className="font-inter text-[10px] mt-0.5 line-clamp-1" style={{ color: "rgba(255,255,255,0.45)" }}>{text.slice(0, 120)}{text.length > 120 ? "…" : ""}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {recCount > 0 && <span className="font-inter text-[8px] px-1 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.08)", color: "rgba(74,222,128,0.60)" }}>{recCount} {txt("പ്രവൃത്തികൾ", "actions", "eylem")}</span>}
          <ChevronDown className="w-3 h-3 transition-transform" style={{ color: "rgba(212,175,55,0.40)", transform: open ? "rotate(180deg)" : "none" }} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="px-2 pb-2 space-y-1.5">
              {ar && (
                <p className="font-amiri text-[11px]" style={{ color: "rgba(212,175,55,0.50)", direction: "rtl" }}>{ar}</p>
              )}
              {text && (
                <p className="font-inter text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>{text}</p>
              )}
              {rec.recommended_actions?.length > 0 && (
                <div>
                  <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(74,222,128,0.60)" }}>{txt("ഉദ്ദേശിക്കുന്നവ", "Recommended", "Önerilen")}</span>
                  {rec.recommended_actions.map((a, i) => <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>• {language === "ml" ? (a.ml || a.en) : a.en}</p>)}
                </div>
              )}
              {rec.forbidden_actions?.length > 0 && (
                <div>
                  <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(248,113,113,0.60)" }}>{txt("നിരോധിതം", "Forbidden", "Yasak")}</span>
                  {rec.forbidden_actions.map((a, i) => <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>• {language === "ml" ? (a.ml || a.en) : a.en}</p>)}
                </div>
              )}
              {rec.warnings_list?.length > 0 && (
                <div>
                  <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(251,191,36,0.60)" }}>{txt("മുന്നറിയിപ്പുകൾ", "Warnings", "Uyarılar")}</span>
                  {rec.warnings_list.map((a, i) => <p key={i} className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.60)" }}>• {language === "ml" ? (a.ml || a.en) : a.en}</p>)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BookCard({ book, knowledge, txt, language, onDelete }) {
  const [open, setOpen] = useState(false);
  const [activePage, setActivePage] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const bookRecords = useMemo(() => knowledge.filter(k => k.source_book_id === book.book_id), [book.book_id, knowledge]);

  const pageMap = useMemo(() => {
    const m = new Map();
    for (const k of bookRecords) {
      const pn = k.source_page_number ? String(k.source_page_number) : null;
      if (!pn) continue;
      if (!m.has(pn)) m.set(pn, []);
      m.get(pn).push(k);
    }
    return m;
  }, [bookRecords]);

  const pages = useMemo(() => Array.from(pageMap.keys()).sort((a, b) => (parsePageNum(a) ?? 9999) - (parsePageNum(b) ?? 9999)), [pageMap]);

  const covered = useMemo(() => {
    const planets = new Set(), weekdays = new Set(), mansions = new Set(), zodiacs = new Set(), cats = new Set();
    for (const k of bookRecords) {
      cats.add(k.rule_category);
      if (k.rule_category === "planet") planets.add(k.rule_entity);
      else if (k.rule_category === "weekday") weekdays.add(k.rule_entity);
      else if (k.rule_category === "lunar mansion") mansions.add(k.rule_entity);
      else if (k.rule_category === "zodiac") zodiacs.add(k.rule_entity);
    }
    return { cats: Array.from(cats).filter(Boolean), planets: planets.size, weekdays: weekdays.size, mansions: mansions.size, zodiacs: zodiacs.size };
  }, [bookRecords]);

  // Actual linked entity names per category — for expandable detail view
  const linked = useMemo(() => {
    const byCat = {};
    for (const k of bookRecords) {
      const c = k.rule_category;
      if (!c || !k.rule_entity) continue;
      if (!byCat[c]) byCat[c] = new Set();
      byCat[c].add(k.rule_entity);
    }
    return Object.fromEntries(Object.entries(byCat).map(([c, s]) => [c, Array.from(s).filter(Boolean).sort()]));
  }, [bookRecords]);

  const totalPages = book.total_pages || 0;
  const importedPageNums = useMemo(() => pages.map(parsePageNum).filter(n => n != null), [pages]);
  const importedPages = importedPageNums.length;
  const missing = useMemo(() => {
    if (totalPages <= 0) return [];
    const imp = new Set(importedPageNums);
    const out = [];
    for (let i = 1; i <= totalPages; i++) if (!imp.has(i)) out.push(i);
    return out;
  }, [totalPages, importedPageNums]);

  const statusColor = book.extraction_status === "completed" ? "#4ADE80" : book.extraction_status === "failed" ? "#F87171" : "#FBBF24";
  const sourceAvailable = !!book.original_file_url;

  const activeRecords = activePage ? (pageMap.get(activePage) || []) : [];

  // Deletable only when the book is a placeholder: 0 imported pages OR 0 records.
  // Books that already contain imported manuscript knowledge can never be deleted.
  const canDelete = importedPages === 0 || bookRecords.length === 0;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await base44.entities.ManuscriptBook.delete(book.book_id || book._id);
      refreshCatalog();
    } catch (e) {
      console.error("Delete book failed:", e);
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
      setOpen(false);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.12)" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 p-2.5 text-left">
        <BookOpen className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(212,175,55,0.50)" }} />
        <div className="flex-1 min-w-0">
          <span className="font-inter text-xs font-bold block truncate" style={{ color: "rgba(255,255,255,0.85)" }}>{book.book_title || book.book_id}</span>
          <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
            {book.author ? `${book.author} · ` : ""}{importedPages}/{totalPages || "?"} {txt("പേജുകൾ", "pages", "sayfa")} · {bookRecords.length} {txt("രേഖകൾ", "records", "kayıt")}
          </span>
        </div>
        <span className="font-inter text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}40` }}>{book.extraction_status || "—"}</span>
        <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0" style={{ color: "rgba(212,175,55,0.40)", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="px-2.5 pb-2.5 space-y-2">
              {/* Full metadata grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.08)" }}>
                <MetaItem icon={BookOpen} label={txt("ഗ്രന്ഥം", "Book Title", "Kitap Adı")} value={book.book_title} color="#F5D060" />
                <MetaItem icon={BookOpen} label={txt("മൂല ശീർഷകം", "Original Title", "Orijinal Başlık")} value={book.book_title_ar} color="rgba(212,175,55,0.50)" />
                <MetaItem icon={BookOpen} label={txt("രചയിതാവ്", "Author", "Yazar")} value={book.author} />
                <MetaItem icon={Globe} label={txt("ഭാഷ", "Language", "Dil")} value={book.language} color="#818CF8" />
                <MetaItem icon={FileText} label={txt("മൊത്തം പേജുകൾ", "Total Pages", "Toplam Sayfa")} value={totalPages || "—"} />
                <MetaItem icon={FileText} label={txt("ഇറക്കുമതി ചെയ്തത്", "Imported Pages", "İçe Aktarılan")} value={importedPages} color="#4ADE80" />
                <MetaItem icon={Layers} label={txt("രേഖകൾ", "Records", "Kayıt")} value={bookRecords.length} color="#818CF8" />
                <MetaItem icon={Globe} label={txt("ഗ്രഹങ്ങൾ", "Planets", "Gezegenler")} value={covered.planets} color="#F5D060" />
                <MetaItem icon={Calendar} label={txt("ദിവസങ്ങൾ", "Weekdays", "Günler")} value={covered.weekdays} color="#F5D060" />
                <MetaItem icon={Layers} label={txt("നക്ഷത്രങ്ങൾ", "Mansions", "Menziller")} value={covered.mansions} color="#818CF8" />
                <MetaItem icon={Layers} label={txt("രാശികൾ", "Zodiac Signs", "Burçlar")} value={covered.zodiacs} color="#F5D060" />
                <MetaItem icon={Calendar} label={txt("ഇറക്കുമതി തീയതി", "Import Date", "İçe Aktarma Tarihi")} value={fmtDate(book.upload_date)} />
                <MetaItem icon={CheckCircle2} label={txt("ഇറക്കുമതി നില", "Import Status", "Durum")} value={book.extraction_status} color={statusColor} />
                <MetaItem icon={FileText} label={txt("സ്രോതസ്സ്", "Source", "Kaynak")} value={sourceAvailable ? txt("ലഭ്യം", "Available", "Mevcut") : txt("ലഭ്യമല്ല", "Missing", "Yok")} color={sourceAvailable ? "#4ADE80" : "#F87171"} />
                <MetaItem icon={Calendar} label={txt("അവസാന പുതുക്കൽ", "Last Updated", "Son Güncelleme")} value={fmtDate(book.updated_date)} />
              </div>

              {/* Delete placeholder book — only allowed when 0 pages OR 0 records */}
              {canDelete && (
                <div className="rounded-lg p-2" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)" }}>
                  {!confirmDelete ? (
                    <button onClick={() => setConfirmDelete(true)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-inter text-[10px] font-bold uppercase tracking-wider"
                      style={{ background: "rgba(248,113,113,0.06)", color: "rgba(248,113,113,0.75)", border: "1px solid rgba(248,113,113,0.25)" }}>
                      <Trash2 className="w-3 h-3" />{txt("ഒഴിവാക്കൽ ഗ്രന്ഥം നീക്കം ചെയ്യുക", "Delete Placeholder Book", "حذف الكتاب")}
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <p className="font-inter text-[10px] text-center" style={{ color: "rgba(248,113,113,0.80)" }}>
                        {txt(
                          "ഈ ഗ്രന്ഥത്തിൽ ഇറക്കുമതി ചെയ്ത വിവരങ്ങളില്ല. നീക്കം ചെയ്യണോ?",
                          "This book has no imported knowledge. Delete it permanently?",
                          "هذا الكتاب لا يحتوي على بيانات. حذف نهائي؟"
                        )}
                      </p>
                      <div className="flex gap-1.5">
                        <button onClick={handleDelete} disabled={deleting}
                          className="flex-1 py-1.5 rounded-lg font-inter text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: "rgba(248,113,113,0.15)", color: "#F87171", border: "1px solid rgba(248,113,113,0.40)", opacity: deleting ? 0.5 : 1 }}>
                          {deleting ? txt("നീക്കുന്നു...", "Deleting...", "جارٍ الحذف...") : txt("സ്ഥിരീകരിക്കുക", "Confirm Delete", "تأكيد الحذف")}
                        </button>
                        <button onClick={() => setConfirmDelete(false)}
                          className="flex-1 py-1.5 rounded-lg font-inter text-[10px] font-bold uppercase tracking-wider"
                          style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.12)" }}>
                          {txt("റദ്ദാക്കുക", "Cancel", "إلغاء")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Imported page ranges */}
              {importedPageNums.length > 0 && (
                <div>
                  <span className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(212,175,55,0.55)" }}>{txt("ഇറക്കുമതി ചെയ്ത പേജ് പരിധികൾ", "Imported Page Ranges", "İçe Aktarılan Sayfa Aralıkları")}</span>
                  <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                    {toRanges(importedPageNums).map(([s, e]) => s === e ? `${s}` : `${s}-${e}`).join(", ") || "—"}
                  </p>
                </div>
              )}

              {/* Missing pages */}
              {missing.length > 0 && (
                <div className="rounded-lg p-2" style={{ background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.12)" }}>
                  <span className="font-inter text-[8px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: "rgba(248,113,113,0.60)" }}>
                    <AlertTriangle className="w-2.5 h-2.5" />{txt("കാണാത്ത പേജുകൾ", "Missing Pages", "Eksik Sayfalar")} ({missing.length})
                  </span>
                  <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                    {missing.slice(0, 24).join(", ")}{missing.length > 24 ? ` … +${missing.length - 24}` : ""}
                  </p>
                </div>
              )}

              {/* Page list — clickable */}
              {pages.length > 0 ? (
                <div>
                  <span className="font-inter text-[8px] uppercase tracking-wider font-bold block mb-1.5" style={{ color: "rgba(212,175,55,0.55)" }}>
                    {txt("പേജ് പട്ടിക", "Page List", "Sayfa Listesi")} — {txt("ക്ലിക്ക് ചെയ്ത് രേഖകൾ കാണുക", "click to view records", "kayıtları görmek için tıklayın")}
                  </span>
                  <div className="flex flex-wrap gap-1 max-h-[160px] overflow-y-auto scrollbar-none">
                    {pages.map(pn => {
                      const recs = pageMap.get(pn) || [];
                      const destCats = Array.from(new Set(recs.map(r => r.rule_category).filter(Boolean)));
                      const isActive = activePage === pn;
                      return (
                        <button key={pn} onClick={() => setActivePage(isActive ? null : pn)}
                          className="font-inter text-[9px] px-1.5 py-1 rounded flex items-center gap-1"
                          style={{
                            background: isActive ? "rgba(212,175,55,0.20)" : "rgba(212,175,55,0.06)",
                            color: isActive ? "#F5D060" : "rgba(212,175,55,0.70)",
                            border: `1px solid ${isActive ? "rgba(212,175,55,0.50)" : "rgba(212,175,55,0.15)"}`,
                          }}>
                          {txt("പേജ്", "p", "s")}.{pn}
                          <span style={{ color: "rgba(255,255,255,0.45)" }}>·{recs.length}</span>
                          {destCats.slice(0, 2).map((c, i) => (
                            <span key={i} className="text-[7px] px-1 rounded" style={{ background: "rgba(129,140,248,0.10)", color: "rgba(129,140,248,0.60)" }}>{categoryLabel(c, txt)}</span>
                          ))}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="font-inter text-[10px] text-center py-2" style={{ color: "rgba(255,255,255,0.30)" }}>{txt("ഈ ഗ്രന്ഥത്തിൽ ഇറക്കുമതി ചെയ്ത പേജുകളില്ല", "No imported pages for this book", "Bu kitap için içe aktarılan sayfa yok")}</p>
              )}

              {/* Linked destinations overview */}
              {covered.cats.length > 0 && (
                <div>
                  <span className="font-inter text-[8px] uppercase tracking-wider font-bold block mb-1" style={{ color: "rgba(212,175,55,0.55)" }}>{txt("ബന്ധിത ലക്ഷ്യങ്ങൾ", "Linked Destinations", "Bağlı Hedefler")}</span>
                  <div className="flex flex-wrap gap-1">
                    {covered.cats.map((c, i) => (
                      <span key={i} className="font-inter text-[8px] px-1.5 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.06)", color: "rgba(74,222,128,0.55)", border: "1px solid rgba(74,222,128,0.12)" }}>{categoryLabel(c, txt)}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Linked entities — actual planet/weekday/zodiac/mansion names per category */}
              {Object.keys(linked).length > 0 && (
                <div>
                  <span className="font-inter text-[8px] uppercase tracking-wider font-bold block mb-1" style={{ color: "rgba(212,175,55,0.55)" }}>{txt("ബന്ധിത വിഭവങ്ങൾ", "Linked Entities", "الكيانات المرتبطة")}</span>
                  <div className="space-y-1">
                    {Object.entries(linked).map(([cat, ents]) => (
                      <div key={cat}>
                        <span className="font-inter text-[8px] font-bold" style={{ color: "rgba(129,140,248,0.55)" }}>{categoryLabel(cat, txt)}:</span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {ents.map((e, i) => (
                            <span key={i} className="font-inter text-[8px] px-1 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(212,175,55,0.10)" }}>{e}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active page records */}
              <AnimatePresence>
                {activePage && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                    <div className="rounded-lg p-2 space-y-1.5" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
                      <span className="font-inter text-[9px] uppercase tracking-wider font-bold block" style={{ color: "rgba(212,175,55,0.65)" }}>
                        {txt("പേജ്", "Page", "Sayfa")} {activePage} — {activeRecords.length} {txt("രേഖകൾ", "records", "kayıt")}
                      </span>
                      <div className="max-h-[300px] overflow-y-auto scrollbar-none space-y-1.5">
                        {activeRecords.map((rec, i) => (
                          <PageRecord key={rec.knowledge_id || i} rec={rec} txt={txt} language={language} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReferenceLibrary() {
  const { books, knowledge, loading, error } = useManuscriptCatalog();
  const { txt, language } = useAstroClockLanguage();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return books;
    const q = query.toLowerCase();
    return books.filter(b => [b.book_title, b.book_title_ar, b.author, b.book_id, b.language].some(v => (v || "").toLowerCase().includes(q)));
  }, [books, query]);

  const importedPageSet = useMemo(() => {
    const s = new Set();
    for (const k of knowledge) { if (k.source_page_number && k.source_book_id) s.add(`${k.source_book_id}|${k.source_page_number}`); }
    return s;
  }, [knowledge]);

  if (loading) return <p className="font-inter text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("ലഭ്യമാക്കുന്നു...", "Loading catalog...", "Yükleniyor...")}</p>;
  if (error) return <p className="font-inter text-xs text-center py-4" style={{ color: "#F87171" }}>{error}</p>;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
        <BookOpen className="w-3.5 h-3.5" style={{ color: "rgba(212,175,55,0.50)" }} />
        <span>{books.length} {txt("ഗ്രന്ഥങ്ങൾ", "books", "kitap")} · {importedPageSet.size} {txt("ഇറക്കുമതി ചെയ്ത പേജുകൾ", "imported pages", "içe aktarılan sayfa")} · {knowledge.length} {txt("രേഖകൾ", "records", "kayıt")}</span>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={txt("ഗ്രന്ഥം തിരയുക...", "Search books...", "Kitap ara...")}
        className="w-full px-2.5 py-1.5 rounded-lg font-inter text-[10px]"
        style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.80)", border: "1px solid rgba(212,175,55,0.15)", colorScheme: "dark" }}
      />

      {filtered.length === 0 ? (
        <p className="font-inter text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.30)" }}>{txt("ഗ്രന്ഥങ്ങളൊന്നുമില്ല", "No manuscripts found", "El yazması bulunamadı")}</p>
      ) : (
        filtered.map(book => (
          <BookCard key={book.book_id || book._id} book={book} knowledge={knowledge} txt={txt} language={language} onDelete />
        ))
      )}
    </div>
  );
}