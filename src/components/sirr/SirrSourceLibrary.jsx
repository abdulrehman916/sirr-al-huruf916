// ═══════════════════════════════════════════════════════════════
// SIRR SOURCE LIBRARY — ENTERPRISE MANUSCRIPT DATABASE
// ═══════════════════════════════════════════════════════════════
// Shows ALL imported manuscripts from the ManuscriptBook database
// (OneDrive-sourced PDFs) plus pre-existing static manuscripts.
// The original PDF always remains the master source.
// ═══════════════════════════════════════════════════════════════
import { ChevronLeft, BookMarked, FileText, Globe, Database, Loader2, CheckCircle2, AlertCircle, FileCheck2, ClipboardList, Cloud, FolderTree, ListTree } from "lucide-react";

function StatusBadge({ status, isMl }) {
  const config = {
    completed: { color: "#4ADE80", icon: CheckCircle2, label: isMl ? "പൂർത്തിയായി" : "Completed" },
    processing: { color: "#FBBF24", icon: Loader2, label: isMl ? "പ്രോസസ്സ് ചെയ്യുന്നു" : "Processing" },
    pending: { color: "#94A3B8", icon: AlertCircle, label: isMl ? "തീരുമാനിക്കാത്തത്" : "Pending" },
    failed: { color: "#F87171", icon: AlertCircle, label: isMl ? "പരാജയപ്പെട്ടു" : "Failed" },
    partial: { color: "#FBBF24", icon: AlertCircle, label: isMl ? "ഭാഗികം" : "Partial" },
  };
  const c = config[status] || config.pending;
  const Icon = c.icon;
  return (
    <span className="font-inter text-[9px] flex items-center gap-1 px-1.5 py-0.5 rounded"
      style={{ background: `${c.color}15`, color: c.color, border: `1px solid ${c.color}30` }}>
      <Icon className={`w-2.5 h-2.5 ${status === "processing" ? "animate-spin" : ""}`} />
      {c.label}
    </span>
  );
}

function BookCard({ book, isDb, isMl, onShowValidationReport, onSelectBook }) {
  return (
    <div className="rounded-xl p-4"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: isDb ? "1px solid rgba(212,175,55,0.33)" : "1px solid rgba(212,175,55,0.22)",
      }}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.30)" }}>
          {isDb ? <Database className="w-5 h-5" style={{ color: "#D4AF37" }} /> : <BookMarked className="w-5 h-5" style={{ color: "#D4AF37" }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-amiri text-base" style={{ color: "#D4AF37", direction: "rtl" }}>
              {book.book_title_ar || book.book_name_ar || ""}
            </p>
            {isDb && book.extraction_status && (
              <StatusBadge status={book.extraction_status} isMl={isMl} />
            )}
          </div>
          <p className="font-inter text-sm font-bold" style={{ color: "rgba(255,255,255,0.80)" }}>
            {book.book_title || book.book_name}
          </p>
          <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>
            {book.author}
          </p>
        </div>
      </div>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3 h-3" style={{ color: "rgba(212,175,55,0.60)" }} />
          <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            {book.language}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <FileText className="w-3 h-3" style={{ color: "rgba(212,175,55,0.60)" }} />
          <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
            {isDb
              ? `${isMl ? "പേജുകൾ" : "Pages"}: ${book.total_pages || "?"}`
              : `${isMl ? "പേജുകൾ" : "Pages"}: ${book.pages_ingested || "?"}`}
          </span>
        </div>
        {isDb && (
          <div className="flex items-center gap-1.5">
            <Database className="w-3 h-3" style={{ color: "rgba(212,175,55,0.60)" }} />
            <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
              {book.total_entries_extracted || 0} {isMl ? "രേഖകൾ" : "entries"}
            </span>
          </div>
        )}
        {isDb && book.source && (
          <div className="flex items-center gap-1.5">
            <span className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.50)" }}>
              {isMl ? "ഉറവിടം" : "Source"}: {book.source}
            </span>
          </div>
        )}
      </div>

      {/* Categories */}
      {(book.categories_covered || book.categories) && (book.categories_covered || book.categories).length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {(book.categories_covered || book.categories).map((cat, idx) => (
            <span key={idx} className="font-inter text-[9px] px-2 py-0.5 rounded"
              style={{ background: "rgba(212,175,55,0.08)", color: "rgba(212,175,55,0.70)", border: "1px solid rgba(212,175,55,0.15)" }}>
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <p className="font-inter text-[10px] mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
        {book.tradition || ""}{isDb && book.upload_date ? ` · ${isMl ? "ഇറക്കുമതി" : "Imported"}: ${new Date(book.upload_date).toLocaleDateString()}` : ""}
      </p>

      {/* Table of Contents Button */}
      {isDb && onSelectBook && (book.total_entries_extracted || 0) > 0 && (
        <button
          onClick={() => onSelectBook(book)}
          className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: "rgba(212,175,55,0.08)",
            color: "#D4AF37",
            border: "1px solid rgba(212,175,55,0.20)",
          }}
        >
          <ListTree className="w-3.5 h-3.5" />
          {isMl ? "മൂല ഗ്രന്ഥ ഉള്ളടക്കം കാണുക" : "View Table of Contents"}
        </button>
      )}

      {/* Validation Report Button */}
      {isDb && book.validation_status && book.validation_status !== "not_validated" && onShowValidationReport && (
        <button
          onClick={() => onShowValidationReport?.(book)}
          className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-bold transition-all"
          style={{
            background: book.validation_status === "passed" ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
            color: book.validation_status === "passed" ? "#4ADE80" : "#F87171",
            border: `1px solid ${book.validation_status === "passed" ? "rgba(74,222,128,0.20)" : "rgba(248,113,113,0.20)"}`,
          }}
        >
          {book.validation_status === "passed"
            ? <><FileCheck2 className="w-3.5 h-3.5" /> {isMl ? "പരിശോധന റിപ്പോർട്ട് കാണുക" : "View Validation Report"}</>
            : <><ClipboardList className="w-3.5 h-3.5" /> {isMl ? "പരിശോധന റിപ്പോർട്ട് കാണുക" : "View Validation Report"}</>}
        </button>
      )}
    </div>
  );
}

export default function SirrSourceLibrary({ sourceLibrary, databaseBooks, loadingDb, onBack, onShowValidationReport, onImportFromOneDrive, onImportFolderFromOneDrive, onSelectBook, language }) {
  const isMl = language === "ml";

  return (
    <div className="space-y-3">
      {/* Back button + Import from OneDrive */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {isMl ? "തിരികെ" : "Back"}
        </button>
        <div className="flex items-center gap-2 ml-auto">
          {onImportFromOneDrive && (
            <button onClick={onImportFromOneDrive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <Cloud className="w-3.5 h-3.5" />
              {isMl ? "PDF ഇറക്കുമതി" : "Import PDF"}
            </button>
          )}
          {onImportFolderFromOneDrive && (
            <button onClick={onImportFolderFromOneDrive}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all btn-gold">
              <FolderTree className="w-3.5 h-3.5" />
              {isMl ? "ഫോൾഡർ ഇറക്കുമതി" : "Import Folder"}
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="text-center pb-2">
        <h2 className="font-amiri text-2xl font-bold" style={{ color: "#D4AF37", direction: "rtl" }}>المكتبة</h2>
        <p className={`text-sm font-bold mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "#D4AF37" }}>
          {isMl ? "എന്റർപ്രൈസ് ഗ്രന്ഥ ശേഖരം" : "Enterprise Manuscript Library"}
        </p>
        <p className="font-inter text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>
          {databaseBooks.length} {isMl ? "ഡാറ്റാബേസ് ഗ്രന്ഥങ്ങൾ" : "database books"} · {sourceLibrary.length} {isMl ? "സ്റ്റാറ്റിക് ഗ്രന്ഥങ്ങൾ" : "static manuscripts"}
        </p>
      </div>

      {/* Loading state */}
      {loadingDb && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#D4AF37" }} />
          <span className="font-inter text-xs ml-2" style={{ color: "rgba(255,255,255,0.50)" }}>
            {isMl ? "ഡാറ്റാബേസിൽ നിന്ന് ഗ്രന്ഥങ്ങൾ ലഭ്യമാക്കുന്നു..." : "Loading books from database..."}
          </span>
        </div>
      )}

      {/* Database manuscripts */}
      {!loadingDb && databaseBooks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <Database className="w-4 h-4" style={{ color: "#D4AF37" }} />
            <span className="font-inter text-xs font-bold" style={{ color: "#D4AF37" }}>
              {isMl ? "ഡാറ്റാബേസ് ഗ്രന്ഥങ്ങൾ (OneDrive)" : "Database Manuscripts (OneDrive)"}
            </span>
          </div>
          {databaseBooks.map((book) => (
            <BookCard key={book.id || book.book_id} book={book} isDb={true} isMl={isMl} onShowValidationReport={onShowValidationReport} onSelectBook={onSelectBook} />
          ))}
        </div>
      )}

      {/* Static/pre-existing manuscripts */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <BookMarked className="w-4 h-4" style={{ color: "rgba(212,175,55,0.60)" }} />
          <span className="font-inter text-xs font-bold" style={{ color: "rgba(212,175,55,0.60)" }}>
            {isMl ? "നിലവിലുള്ള ഗ്രന്ഥങ്ങൾ" : "Pre-existing Manuscripts"}
          </span>
        </div>
        {sourceLibrary.map((ms) => (
          <BookCard key={ms.book_id} book={ms} isDb={false} isMl={isMl} />
        ))}
      </div>

      {/* Authority notice */}
      <div className="rounded-lg p-2.5 text-center" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.10)" }}>
        <p className={`text-[10px] ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.45)" }}>
          {isMl
            ? "⚖️ മൂല PDF എല്ലായ്പ്പോഴും പ്രാഥമിക അധികാരം. ഒരിക്കലും പകർത്തോ മാറ്റമൊന്നും വരുത്തുന്നില്ല."
            : "⚖️ The original PDF always remains the master source. Never copied or modified."}
        </p>
      </div>
    </div>
  );
}