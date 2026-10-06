import { useState } from "react";
import { ChevronLeft, ZoomIn, X, BookOpen, FileText, Layers,
  FlaskConical, Clock, Archive, AlertTriangle, Package, Wrench,
  ListChecks, BookMarked, GitBranch, Link2 } from "lucide-react";
import { getPreparationTypeLabel } from "@/lib/preparationLibrarySync";

const NOT_SPECIFIED_ML = "ഗ്രന്ഥത്തിൽ വ്യക്തമാക്കാത്തത്";
const NOT_SPECIFIED_EN = "Not specified in the manuscript";

function FieldRow({ icon: Icon, label, value, accent, language, isArabic }) {
  const isMl = language === "ml";
  const notSpecified = isMl ? NOT_SPECIFIED_ML : NOT_SPECIFIED_EN;
  const hasValue = value && String(value).trim().length > 0;

  return (
    <div className="flex gap-2.5 py-2" style={{ borderBottom: `1px solid ${accent}10` }}>
      <div className="flex-shrink-0 w-7 flex justify-center pt-0.5">
        {Icon && <Icon className="w-4 h-4" style={{ color: `${accent}99` }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-inter text-[10px] font-bold uppercase tracking-wide" style={{ color: `${accent}99` }}>
          {label}
        </p>
        <p
          className={`text-sm mt-1 ${isArabic ? "font-amiri" : isMl ? "font-malayalam" : "font-inter"}`}
          style={{
            color: hasValue ? "rgba(255,255,255,0.80)" : "rgba(255,255,255,0.25)",
            direction: isArabic ? "rtl" : "ltr",
            lineHeight: isArabic ? 2.2 : 1.6,
          }}
        >
          {hasValue ? value : notSpecified}
        </p>
      </div>
    </div>
  );
}

function ImageViewer({ images, diagrams, accent }) {
  const [fullscreen, setFullscreen] = useState(null);
  const [zoom, setZoom] = useState(1);
  const allImages = [
    ...(images || []).map((img) => ({ url: img.url || img, caption: img.caption || "", page: img.page_number || "" })),
    ...(diagrams || []).map((d) => ({ url: d.url || d, caption: d.caption || "", page: d.page_number || "" })),
  ];

  if (allImages.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {allImages.map((img, idx) => (
          <button key={idx} onClick={() => { setFullscreen(img); setZoom(1); }}
            className="relative rounded-lg overflow-hidden" style={{ border: `1px solid ${accent}33` }}>
            <img src={img.url} alt={img.caption || `Figure ${idx + 1}`} className="w-full h-32 object-contain" style={{ background: "rgba(0,0,0,0.3)" }} />
            <div className="absolute bottom-1 right-1 rounded p-1 flex items-center gap-1" style={{ background: "rgba(0,0,0,0.6)" }}>
              <ZoomIn className="w-3 h-3" style={{ color: accent }} />
              {img.page && <span className="font-inter text-[8px] text-white">p.{img.page}</span>}
            </div>
          </button>
        ))}
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setFullscreen(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full" style={{ background: "rgba(255,255,255,0.10)" }}
            onClick={(e) => { e.stopPropagation(); setFullscreen(null); }}>
            <X className="w-6 h-6 text-white" />
          </button>
          {fullscreen.caption && (
            <p className="text-white text-sm mb-2 font-inter">{fullscreen.caption}</p>
          )}
          <div className="flex gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="px-3 py-1.5 rounded-lg font-bold text-white" style={{ background: "rgba(255,255,255,0.10)" }}>
              −
            </button>
            <span className="px-3 py-1.5 font-inter text-sm text-white" style={{ background: "rgba(255,255,255,0.10)" }}>
              {Math.round(zoom * 100)}%
            </span>
            <button onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              className="px-3 py-1.5 rounded-lg font-bold text-white" style={{ background: "rgba(255,255,255,0.10)" }}>
              +
            </button>
          </div>
          <img src={fullscreen.url} alt="Full view" className="max-w-full max-h-[80vh] object-contain transition-transform"
            style={{ transform: `scale(${zoom})` }} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}

export default function SirrPreparationDetail({ preparation, onBack, language, accent, onSelectMethod }) {
  const isMl = language === "ml";
  const notSpecified = isMl ? NOT_SPECIFIED_ML : NOT_SPECIFIED_EN;
  const typeAccent = accent || "#34D399";
  const typeLabel = getPreparationTypeLabel(preparation.preparation_type, language);
  const images = preparation.images || [];
  const diagrams = preparation.diagrams || [];
  const ingredients = preparation.ingredients || [];
  const usedByMethods = preparation.used_by_methods || [];
  const supportingSources = preparation.supporting_sources || [];
  const revisionHistory = preparation.revision_history || [];
  const primarySource = preparation.primary_source || {};

  const displayName = isMl
    ? preparation.name_ml || preparation.name || preparation.name_en
    : preparation.name_en || preparation.name || preparation.name_ml;

  return (
    <div className="space-y-3">
      {/* Back button */}
      <div className="flex items-center gap-3 pt-2">
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.10)" }}>
          <ChevronLeft className="w-4 h-4" /> {isMl ? "തയ്യാറാക്കലുകൾ" : "Preparations"}
        </button>
      </div>

      {/* Header */}
      <div className="rounded-xl p-4" style={{ background: `${typeAccent}08`, border: `1px solid ${typeAccent}22` }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-inter text-[10px] font-bold px-2 py-0.5 rounded"
            style={{ background: `${typeAccent}15`, color: typeAccent, border: `1px solid ${typeAccent}30` }}>
            {typeLabel}
          </span>
          {(preparation.source_count || 1) > 1 && (
            <span className="flex items-center gap-1 font-inter text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: "rgba(212,175,55,0.10)", color: "#D4AF37" }}>
              <Layers className="w-2.5 h-2.5" /> {preparation.source_count} {isMl ? "ഉറവിടങ്ങൾ" : "sources"}
            </span>
          )}
        </div>
        {preparation.name_ar && (
          <h2 className="font-amiri text-2xl font-bold text-center" style={{ color: typeAccent, direction: "rtl", lineHeight: 2.2 }}>
            {preparation.name_ar}
          </h2>
        )}
        <p className={`text-lg font-bold text-center mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.85)" }}>
          {displayName}
        </p>
        {preparation.purpose && (
          <p className={`text-sm text-center mt-1 ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: `${typeAccent}99` }}>
            {isMl ? (preparation.purpose_ml || preparation.purpose) : preparation.purpose}
          </p>
        )}
      </div>

      {/* Ingredients */}
      {ingredients.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${typeAccent}15` }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: `${typeAccent}99` }}>
            <Package className="w-3 h-3 inline mr-1" />
            {isMl ? "ചേരുവകൾ" : "Ingredients"}
          </p>
          <div className="space-y-1.5">
            {ingredients.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1.5" style={{ borderBottom: idx < ingredients.length - 1 ? `1px solid ${typeAccent}08` : "none" }}>
                {ing.name_ar && (
                  <span className="font-amiri text-sm" style={{ color: typeAccent, direction: "rtl" }}>
                    {ing.name_ar}
                  </span>
                )}
                <span className={`flex-1 text-sm ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.75)" }}>
                  {ing.name}
                </span>
                {(ing.quantity || ing.unit) && (
                  <span className="font-inter text-[10px] px-2 py-0.5 rounded" style={{ background: `${typeAccent}10`, color: `${typeAccent}99` }}>
                    {ing.quantity} {ing.unit}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Original Arabic */}
      {preparation.original_arabic && (
        <div className="rounded-xl p-4" style={{ background: "rgba(212,175,55,0.06)", border: `1px solid ${typeAccent}30` }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide text-center" style={{ color: `${typeAccent}99` }}>
            {isMl ? "മൂല അറബി പാഠം" : "Original Arabic (Manuscript)"}
          </p>
          <p className="font-amiri text-xl text-center mt-2 selectable" style={{
            color: typeAccent, direction: "rtl", lineHeight: 2.4, letterSpacing: "0.04em",
          }}>
            {preparation.original_arabic}
          </p>
        </div>
      )}

      {/* Verified Arabic */}
      {preparation.verified_arabic && (
        <div className="rounded-xl p-4" style={{ background: "rgba(212,175,55,0.08)", border: `1px solid rgba(212,175,55,0.30)` }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide text-center mb-1" style={{ color: "#D4AF37" }}>
            {isMl ? "സ്ഥിരീകരിച്ച അറബി (ഹരകത്തോടെ)" : "Verified Arabic with Harakat"}
          </p>
          <p className="font-amiri text-xl text-center selectable" style={{
            color: "#D4AF37", direction: "rtl", lineHeight: 2.8, letterSpacing: "0.06em",
          }}>
            {preparation.verified_arabic}
          </p>
        </div>
      )}

      {/* Images */}
      {(images.length > 0 || diagrams.length > 0) && (
        <div className="rounded-xl p-4" style={{ background: `${typeAccent}08`, border: `1px solid ${typeAccent}22` }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: `${typeAccent}99` }}>
            {isMl ? "ചിത്രങ്ങൾ / രേഖാചിത്രങ്ങൾ" : "Images / Diagrams"}
          </p>
          <ImageViewer images={images} diagrams={diagrams} accent={typeAccent} />
        </div>
      )}

      {/* All remaining fields */}
      <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${typeAccent}15` }}>
        <FieldRow icon={ListChecks} label={isMl ? "തയ്യാറാക്കൽ നടപടികൾ" : "Preparation Steps"} value={preparation.preparation_steps} accent={typeAccent} language={language} />
        <FieldRow icon={Wrench} label={isMl ? "ആവശ്യമായ ഉപകരണങ്ങൾ" : "Required Tools"} value={preparation.required_tools} accent={typeAccent} language={language} />
        <FieldRow icon={Clock} label={isMl ? "സമയം" : "Timing"} value={preparation.timing} accent={typeAccent} language={language} />
        <FieldRow icon={FlaskConical} label={isMl ? "ഉപയോഗ നിർദ്ദേശങ്ങൾ" : "Usage Instructions"} value={preparation.usage_instructions} accent={typeAccent} language={language} />
        <FieldRow icon={Archive} label={isMl ? "സംഭരണ നിർദ്ദേശങ്ങൾ" : "Storage Instructions"} value={preparation.storage_instructions} accent={typeAccent} language={language} />
        <FieldRow icon={Clock} label={isMl ? "ഷെൽഫ് ലൈഫ്" : "Shelf Life"} value={preparation.shelf_life} accent={typeAccent} language={language} />
        <FieldRow icon={AlertTriangle} label={isMl ? "മുന്നറിയിപ്പുകൾ" : "Warnings"} value={preparation.warnings} accent={typeAccent} language={language} />
        <FieldRow label={isMl ? "മലയാളം പരിഭാഷ" : "Malayalam Translation"} value={preparation.malayalam_translation} accent={typeAccent} language={language} />
        <FieldRow label={isMl ? "English Translation" : "English Translation"} value={preparation.english_translation} accent={typeAccent} language={language} />
      </div>

      {/* Used By Methods (Cross-link) */}
      {usedByMethods.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: `${typeAccent}08`, border: `1px solid ${typeAccent}22` }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: `${typeAccent}99` }}>
            <Link2 className="w-3 h-3 inline mr-1" />
            {isMl ? "ഉപയോഗിക്കുന്ന രീതികൾ" : "Used By Methods"}
          </p>
          <div className="space-y-1.5">
            {usedByMethods.map((m, idx) => (
              <button
                key={idx}
                onClick={() => onSelectMethod && onSelectMethod(m)}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg text-left transition-all hover:scale-[1.01]"
                style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${typeAccent}15` }}
              >
                <BookMarked className="w-3 h-3 flex-shrink-0" style={{ color: `${typeAccent}99` }} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.75)" }}>
                    {m.topic || m.purpose || (isMl ? "രീതി" : "Method")}
                  </p>
                  <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {m.book_title} · {isMl ? "പേജ്" : "p."} {m.page_number}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Supporting Sources */}
      {supportingSources.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${typeAccent}15` }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: `${typeAccent}99` }}>
            <Layers className="w-3 h-3 inline mr-1" />
            {isMl ? "പിന്തുണയ്ക്കുന്ന ഉറവിടങ്ങൾ" : "Supporting Sources"}
          </p>
          <div className="space-y-1">
            {supportingSources.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1.5" style={{ borderBottom: idx < supportingSources.length - 1 ? `1px solid ${typeAccent}08` : "none" }}>
                <BookOpen className="w-3 h-3 flex-shrink-0" style={{ color: `${typeAccent}99` }} />
                <div className="flex-1 min-w-0">
                  <p className="font-inter text-xs font-bold" style={{ color: "rgba(255,255,255,0.70)" }}>
                    {s.book_title}
                  </p>
                  <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {s.author} · {isMl ? "പേജ്" : "p."} {s.page_number}
                    {s.edition && ` · ${s.edition}`}
                    {s.year && ` · ${s.year}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revision History */}
      {revisionHistory.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "rgba(8,16,38,0.60)", border: `1px solid ${typeAccent}15` }}>
          <p className="font-inter text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color: `${typeAccent}99` }}>
            <GitBranch className="w-3 h-3 inline mr-1" />
            {isMl ? "പരിഷ്കരണ ചരിത്രം" : "Revision History"}
          </p>
          <div className="space-y-1.5">
            {revisionHistory.map((r, idx) => (
              <div key={idx} className="py-1.5" style={{ borderBottom: idx < revisionHistory.length - 1 ? `1px solid ${typeAccent}08` : "none" }}>
                <div className="flex items-center gap-2">
                  <span className="font-inter text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${typeAccent}10`, color: `${typeAccent}99` }}>
                    v{r.revision_number}
                  </span>
                  <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>
                    {r.date}
                  </span>
                </div>
                <p className="font-inter text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.50)" }}>
                  {r.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source Reference */}
      <div className="text-center py-3">
        <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          {isMl ? "ഗ്രന്ഥം" : "Book"}: {preparation.book_title || primarySource.book_title || notSpecified}
          {" · "}
          {isMl ? "പേജ്" : "Page"}: {preparation.page_number || primarySource.page_number || notSpecified}
        </p>
        {(preparation.author || primarySource.author) && (
          <p className="font-inter text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.20)" }}>
            {isMl ? "രചയിതാവ്" : "Author"}: {preparation.author || primarySource.author}
            {preparation.edition && ` · ${isMl ? "എഡിഷൻ" : "Edition"}: ${preparation.edition}`}
          </p>
        )}
      </div>
    </div>
  );
}