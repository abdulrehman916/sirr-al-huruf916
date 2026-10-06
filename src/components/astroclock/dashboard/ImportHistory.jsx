// ═══════════════════════════════════════════════════════════════
// IMPORT HISTORY — aggregate manuscript ingestion stats
// Read-only: consumes ManuscriptBook + AstroClockKnowledge via the catalog hook.
// ═══════════════════════════════════════════════════════════════
import { useManuscriptCatalog } from "@/hooks/useManuscriptCatalog";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { BookOpen, FileText, Database, CheckCircle2, AlertTriangle, Clock, ShieldCheck } from "lucide-react";

function Stat({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl p-2.5 flex flex-col gap-1" style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.12)",
    }}>
      <span className="font-inter text-[9px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: "rgba(255,255,255,0.40)" }}>
        <Icon className="w-3 h-3" style={{ color: color || "rgba(212,175,55,0.55)" }} />{label}
      </span>
      <span className="font-inter text-base font-bold tabular-nums" style={{ color: color || "rgba(255,255,255,0.85)" }}>{value}</span>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }); }
  catch (_) { return String(iso).slice(0, 10); }
}

export default function ImportHistory() {
  const { books, knowledge, loading, error } = useManuscriptCatalog();
  const { txt } = useAstroClockLanguage();

  if (loading) return <p className="font-inter text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("ലഭ്യമാക്കുന്നു...", "Loading...", "Yükleniyor...")}</p>;
  if (error) return <p className="font-inter text-xs text-center py-4" style={{ color: "#F87171" }}>{error}</p>;

  const totalBooks = books.length;
  const totalOriginalPages = books.reduce((s, b) => s + (b.total_pages || 0), 0);

  const importedPageSet = new Set();
  for (const k of knowledge) { if (k.source_page_number && k.source_book_id) importedPageSet.add(`${k.source_book_id}|${k.source_page_number}`); }
  const totalImportedPages = importedPageSet.size;

  const totalRecords = knowledge.length;

  let lastImport = null;
  for (const b of books) { const d = b.upload_date || b.updated_date; if (d && (!lastImport || d > lastImport)) lastImport = d; }

  const progress = totalOriginalPages > 0 ? Math.min(100, Math.round((totalImportedPages / totalOriginalPages) * 100)) : (totalBooks ? 100 : 0);

  const verifiedBooks = books.filter(b => b.verification_status === "verified").length;
  const completedBooks = books.filter(b => b.extraction_status === "completed").length;
  const integrityOk = totalBooks > 0 && completedBooks === totalBooks;
  const verificationPct = totalBooks > 0 ? Math.round((verifiedBooks / totalBooks) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Stat icon={BookOpen} label={txt("ഗ്രന്ഥങ്ങൾ", "Books Uploaded", "Yüklenen Kitap")} value={totalBooks} color="#F5D060" />
        <Stat icon={FileText} label={txt("മൊത്തം പേജുകൾ", "Original Pages", "Orijinal Sayfa")} value={totalOriginalPages} color="rgba(255,255,255,0.85)" />
        <Stat icon={FileText} label={txt("ഇറക്കുമതി ചെയ്ത പേജുകൾ", "Imported Pages", "İçe Aktarılan")} value={totalImportedPages} color="#4ADE80" />
        <Stat icon={Database} label={txt("രേഖകൾ", "Extracted Records", "Çıkarılan Kayıt")} value={totalRecords} color="#818CF8" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-xl p-2.5 flex items-center gap-2.5" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
          <Clock className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(212,175,55,0.60)" }} />
          <div className="flex-1 min-w-0">
            <span className="font-inter text-[9px] uppercase tracking-wider font-bold block" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("അവസാന ഇറക്കുമതി", "Last Import", "Son İçe Aktarma")}</span>
            <span className="font-inter text-xs font-bold" style={{ color: "#F5D060" }}>{fmtDate(lastImport)}</span>
          </div>
        </div>
        <div className="rounded-xl p-2.5" style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.15)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-inter text-[9px] uppercase tracking-wider font-bold flex items-center gap-1" style={{ color: "rgba(74,222,128,0.60)" }}>
              <FileText className="w-3 h-3" />{txt("��റക്കുമതി പുരോഗതി", "Import Progress", "İçe Aktarma İlerlemesi")}
            </span>
            <span className="font-inter text-xs font-bold tabular-nums" style={{ color: "#4ADE80" }}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg,#4ADE80,#86EFAC)" }} />
          </div>
          <span className="font-inter text-[9px] mt-1 block" style={{ color: "rgba(255,255,255,0.40)" }}>{totalImportedPages} / {totalOriginalPages} {txt("പേജുകൾ", "pages", "sayfa")}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-xl p-2.5 flex items-center gap-2.5" style={{
          background: verificationPct === 100 ? "rgba(74,222,128,0.04)" : "rgba(251,191,36,0.04)",
          border: `1px solid ${verificationPct === 100 ? "rgba(74,222,128,0.15)" : "rgba(251,191,36,0.15)"}`,
        }}>
          <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: verificationPct === 100 ? "#4ADE80" : "#FBBF24" }} />
          <div className="flex-1 min-w-0">
            <span className="font-inter text-[9px] uppercase tracking-wider font-bold block" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("പരിശോധന നില", "Verification Status", "Doğrulama Durumu")}</span>
            <span className="font-inter text-xs font-bold" style={{ color: verificationPct === 100 ? "#4ADE80" : "#FBBF24" }}>
              {verifiedBooks} / {totalBooks} {txt("ഗ്രന്ഥങ്ങൾ പരിശോധിച്ചു", "books verified", "kitap doğrulandı")} · {verificationPct}%
            </span>
          </div>
        </div>
        <div className="rounded-xl p-2.5 flex items-center gap-2.5" style={{
          background: integrityOk ? "rgba(74,222,128,0.04)" : "rgba(248,113,113,0.04)",
          border: `1px solid ${integrityOk ? "rgba(74,222,128,0.15)" : "rgba(248,113,113,0.15)"}`,
        }}>
          {integrityOk ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#4ADE80" }} /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#F87171" }} />}
          <div className="flex-1 min-w-0">
            <span className="font-inter text-[9px] uppercase tracking-wider font-bold block" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("സമഗ്രത നില", "Integrity Status", "Bütünlük Durumu")}</span>
            <span className="font-inter text-xs font-bold" style={{ color: integrityOk ? "#4ADE80" : "#F87171" }}>
              {integrityOk
                ? txt("എല്ലാ ഗ്രന്ഥങ്ങളും പൂർണ്ണം", "All books fully ingested", "Tüm kitaplar tam aktarıldı")
                : txt("ചില ഗ്രന്ഥങ്ങൾ പാക്കേജിൽ", "Some books incomplete", "Bazı kitaplar eksik")}
            </span>
          </div>
        </div>
      </div>

      {/* ── Per-book import history ── */}
      {books.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,175,55,0.12)" }}>
          <div className="px-2.5 py-2" style={{ borderBottom: "1px solid rgba(212,175,55,0.12)" }}>
            <span className="font-inter text-[9px] uppercase tracking-wider font-bold" style={{ color: "rgba(212,175,55,0.60)" }}>
              {txt("പ്രതി ഗ്രന്ഥ ചരിത്രം", "Per-Book Import History", "حسب الكتاب")}
            </span>
          </div>
          <div className="max-h-[280px] overflow-y-auto scrollbar-none">
            {books.map(b => {
              const bRecs = knowledge.filter(k => k.source_book_id === b.book_id);
              const bPages = new Set(bRecs.map(k => k.source_page_number).filter(Boolean));
              const exColor = b.extraction_status === "completed" ? "#4ADE80" : b.extraction_status === "failed" ? "#F87171" : "#FBBF24";
              const vColor = b.verification_status === "verified" ? "#4ADE80" : b.verification_status === "unverified" ? "rgba(255,255,255,0.40)" : "#FBBF24";
              return (
                <div key={b.book_id} className="px-2.5 py-2 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(212,175,55,0.45)" }} />
                  <div className="flex-1 min-w-0">
                    <span className="font-inter text-[10px] font-bold block truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{b.book_title || b.book_id}</span>
                    <span className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.35)" }}>{fmtDate(b.upload_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="font-inter text-[9px] font-bold tabular-nums" style={{ color: "#4ADE80" }}>{bPages.size}</span>
                      <span className="font-inter text-[7px] uppercase" style={{ color: "rgba(255,255,255,0.30)" }}>{txt("പേജ്", "pg", "ص")}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-inter text-[9px] font-bold tabular-nums" style={{ color: "#818CF8" }}>{bRecs.length}</span>
                      <span className="font-inter text-[7px] uppercase" style={{ color: "rgba(255,255,255,0.30)" }}>{txt("രേഖ", "rec", "سج")}</span>
                    </div>
                    <span className="font-inter text-[8px] px-1.5 py-0.5 rounded" style={{ background: `${exColor}15`, color: exColor, border: `1px solid ${exColor}30` }}>{b.extraction_status || "—"}</span>
                    <span className="font-inter text-[8px] px-1.5 py-0.5 rounded" style={{ background: `${vColor}15`, color: vColor, border: `1px solid ${vColor}30` }}>{b.verification_status || "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}