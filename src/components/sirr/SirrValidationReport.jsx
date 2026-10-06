// ═══════════════════════════════════════════════════════════════
// SIRR VALIDATION REPORT — COMPLETE IMPORT VERIFICATION DISPLAY
// ═══════════════════════════════════════════════════════════════
// Displays the full validation report for a single-PDF import test:
//   - Pass/Fail status banner
//   - Metrics grid (pages, entries, images, Arabic texts, etc.)
//   - Validation criteria checklist
//   - Entries by Sirr section
//   - Image type breakdown
//   - Pages with images / errors / skipped
//   - Bulk import gate status
// ═══════════════════════════════════════════════════════════════
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle, FileText, Image, BookOpen, Sparkles, Lock, Unlock, Loader2 } from "lucide-react";

function MetricCard({ icon: Icon, label, value, color, sublabel }) {
  return (
    <div className="rounded-xl p-3" style={{ background: `${color}08`, border: `1px solid ${color}22` }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="font-inter text-[10px] font-bold uppercase tracking-wide" style={{ color: `${color}99` }}>
          {label}
        </span>
      </div>
      <p className="font-inter text-2xl font-bold" style={{ color }}>{value}</p>
      {sublabel && <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(255,255,255,0.40)" }}>{sublabel}</p>}
    </div>
  );
}

function CriteriaRow({ label, passed, isMl }) {
  return (
    <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      {passed ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#4ADE80" }} />
             : <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#F87171" }} />}
      <span className="font-inter text-xs flex-1" style={{ color: passed ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.50)" }}>
        {label}
      </span>
    </div>
  );
}

export default function SirrValidationReport({ book, onBack, language }) {
  const isMl = language === "ml";
  const report = book.validation_report || {};
  const summary = report.summary || {};
  const criteria = report.validation_criteria || {};
  const entriesBySection = report.entries_by_section || {};
  const imageTypes = report.image_type_breakdown || {};
  const passed = book.validation_status === "passed";

  const accent = passed ? "#4ADE80" : "#F87171";

  return (
    <div className="space-y-3">
      {/* Back button */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {isMl ? "ഗ്രന്ഥ ശേഖരം" : "Library"}
        </button>
      </div>

      {/* Pass/Fail Banner */}
      <div className="rounded-xl p-4 text-center" style={{
        background: passed ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
        border: `1px solid ${accent}33`,
      }}>
        {passed ? <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: accent }} />
                : <XCircle className="w-10 h-10 mx-auto" style={{ color: accent }} />}
        <p className="font-inter text-lg font-bold mt-2" style={{ color: accent }}>
          {passed ? (isMl ? "പരിശോധന വിജയിച്ചു" : "Validation Passed") : (isMl ? "പരിശോധന പരാജയപ്പെട്ടു" : "Validation Failed")}
        </p>
        <p className="font-inter text-xs mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>
          {book.book_title}
        </p>
        <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
          {isMl ? "പരിശോധന തീയതി" : "Validation date"}: {book.validation_date ? new Date(book.validation_date).toLocaleString() : "—"}
        </p>
      </div>

      {/* Bulk Import Gate */}
      <div className="rounded-xl p-3 flex items-center gap-3" style={{
        background: passed ? "rgba(74,222,128,0.06)" : "rgba(248,113,113,0.06)",
        border: `1px solid ${accent}22`,
      }}>
        {passed ? <Unlock className="w-5 h-5" style={{ color: accent }} />
                : <Lock className="w-5 h-5" style={{ color: accent }} />}
        <div className="flex-1">
          <p className="font-inter text-xs font-bold" style={{ color: accent }}>
            {passed
              ? (isMl ? "ബൾക്ക് ഇറക്കുമതി തുറന്നു" : "Bulk Import Unlocked")
              : (isMl ? "ബൾക്ക് ഇറക്കുമതി പൂട്ടിയിരിക്കുന്നു" : "Bulk Import Locked")}
          </p>
          <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.40)" }}>
            {passed
              ? (isMl ? "പൂർണ്ണ OneDrive ലൈബ്രറി ഇറക്കുമതി ചെയ്യാൻ സജ്ജമാണ്" : "Ready to import full OneDrive library")
              : (isMl ? "പരിശോധന വിജയിച്ച ശേഷം മാത്രം" : "Requires validation pass first")}
          </p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard icon={FileText} label={isMl ? "പേജുകൾ പ്രോസസ്സ് ചെയ്തു" : "Pages Processed"} value={summary.total_pages_processed || 0} color="#60A5FA" />
        <MetricCard icon={BookOpen} label={isMl ? "രേഖകൾ എക്സ്ട്രാക്റ്റ് ചെയ്തു" : "Entries Extracted"} value={summary.total_entries_extracted || 0} color="#D4AF37" />
        <MetricCard icon={Image} label={isMl ? "ചിത്രങ്ങൾ" : "Images Found"} value={summary.total_images_extracted || 0} color="#A78BFA"
          sublabel={isMl ? "വഫ്പ്, താവീസ്, രേഖാചിത്രങ്ങൾ" : "Wafq, Taweez, Diagrams"} />
        <MetricCard icon={Sparkles} label={isMl ? "അറബി പാഠങ്ങൾ" : "Arabic Texts"} value={summary.total_arabic_texts || 0} color="#34D399"
          sublabel={`${summary.total_arabic_preserved || 0} ${isMl ? "സംരക്ഷിച്ചു" : "preserved"}`} />
        <MetricCard icon={CheckCircle2} label={isMl ? "സ്ഥിരീകരിച്ച അറബി" : "Verified Arabic"} value={summary.total_verified_arabic || 0} color="#4ADE80" />
        <MetricCard icon={AlertCircle} label={isMl ? "പരിശോധന ആവശ്യം" : "Manual Review"} value={summary.total_manual_review || 0} color="#FBBF24" />
        <MetricCard icon={Sparkles} label={isMl ? "വർഗ്ഗീകരണം" : "Classifications"} value={summary.total_classifications || 0} color="#F87171"
          sublabel={isMl ? "സിർ വിഭാഗങ്ങൾ" : "Sirr sections"} />
        <MetricCard icon={CheckCircle2} label={isMl ? "അറബി സംരക്ഷണ നിരക്ക്" : "Arabic Preservation"} value={`${summary.arabic_preservation_rate || 0}%`} color={summary.arabic_preservation_rate >= 80 ? "#4ADE80" : "#F87171"} />
      </div>

      {/* Validation Criteria */}
      <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${accent}15` }}>
        <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: `${accent}99` }}>
          {isMl ? "പരിശോധന മാനദണ്ഡങ്ങൾ" : "Validation Criteria"}
        </p>
        <CriteriaRow label={isMl ? "ഗുരുതര പിശകുകളില്ല" : "No critical errors"} passed={criteria.no_critical_errors} isMl={isMl} />
        <CriteriaRow label={isMl ? "എല്ലാ പേജുകളും പ്രോസസ്സ് ചെയ്തു" : "All pages processed"} passed={criteria.all_pages_processed} isMl={isMl} />
        <CriteriaRow label={isMl ? "രേഖകൾ എക്സ്ട്രാക്റ്റ് ചെയ്തു" : "Entries extracted"} passed={criteria.has_entries} isMl={isMl} />
        <CriteriaRow label={isMl ? `അറബി സംരക്ഷണം ≥ 80% (${summary.arabic_preservation_rate || 0}%)` : `Arabic preservation ≥ 80% (${summary.arabic_preservation_rate || 0}%)`} passed={criteria.arabic_well_preserved} isMl={isMl} />
        <CriteriaRow label={isMl ? "എല്ലാ രേഖകളും വർഗ്ഗീകരിച്ചു" : "All entries classified"} passed={criteria.all_entries_classified} isMl={isMl} />
      </div>

      {/* Entries by Sirr Section */}
      <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: "1px solid rgba(212,175,55,0.15)" }}>
        <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "rgba(212,175,55,0.70)" }}>
          {isMl ? "സിർ വിഭാഗങ്ങൾ പ്രകാരം" : "Entries by Sirr Section"}
        </p>
        {Object.entries(entriesBySection).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2 py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.10)", color: "#D4AF37" }}>
              {key.replace("sirr_", "Sirr ")}
            </span>
            <span className="font-inter text-xs flex-1" style={{ color: "rgba(255,255,255,0.70)" }}>
              {val.name}
            </span>
            <span className="font-inter text-sm font-bold" style={{ color: val.count > 0 ? "#D4AF37" : "rgba(255,255,255,0.25)" }}>
              {val.count}
            </span>
          </div>
        ))}
      </div>

      {/* Image Type Breakdown */}
      {Object.keys(imageTypes).length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: "1px solid rgba(167,139,250,0.15)" }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "rgba(167,139,250,0.70)" }}>
            {isMl ? "ചിത്ര തരം" : "Image Type Breakdown"}
          </p>
          {Object.entries(imageTypes).map(([type, count]) => (
            <div key={type} className="flex items-center gap-2 py-1">
              <span className="font-inter text-xs flex-1 capitalize" style={{ color: "rgba(255,255,255,0.70)" }}>{type}</span>
              <span className="font-inter text-sm font-bold" style={{ color: "#A78BFA" }}>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Pages with Images */}
      {report.pages_with_images && report.pages_with_images.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: "1px solid rgba(167,139,250,0.15)" }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "rgba(167,139,250,0.70)" }}>
            {isMl ? "ചിത്രങ്ങളുള്ള പേജുകൾ" : "Pages with Images"}
          </p>
          <div className="flex flex-wrap gap-1">
            {report.pages_with_images.map((pg, i) => (
              <span key={i} className="font-inter text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(167,139,250,0.10)", color: "#A78BFA" }}>
                {isMl ? "പേജ്" : "p."} {pg}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Errors and Skipped Pages */}
      {(report.errors && report.errors.length > 0) || (report.skipped_pages && report.skipped_pages.length > 0) ? (
        <div className="rounded-xl p-4" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.20)" }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: "rgba(248,113,113,0.70)" }}>
            {isMl ? "പിശകുകളും ഒഴിവാക്കിയ പേജുകളും" : "Errors & Skipped Pages"}
          </p>
          {report.skipped_pages && report.skipped_pages.length > 0 && (
            <p className="font-inter text-xs mb-2" style={{ color: "rgba(248,113,113,0.80)" }}>
              {isMl ? "ഒഴിവാക്കിയ പേജുകൾ" : "Skipped pages"}: {report.skipped_pages.join(", ")}
            </p>
          )}
          {report.errors && report.errors.map((err, i) => (
            <p key={i} className="font-inter text-xs py-1" style={{ color: "rgba(255,255,255,0.60)" }}>
              • {err}
            </p>
          ))}
        </div>
      ) : null}

      {/* Book ID */}
      <div className="text-center py-2">
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Book ID: {book.book_id}
        </p>
      </div>
    </div>
  );
}