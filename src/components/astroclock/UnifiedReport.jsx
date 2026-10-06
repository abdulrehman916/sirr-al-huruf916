// ═══════════════════════════════════════════════════════════════
// UNIFIED REPORT COMPONENT — 18 SECTIONS
// Knowledge Preservation Compliant
// Malayalam-first display with Arabic preservation
// ═══════════════════════════════════════════════════════════════

import { Book, CheckCircle, Info, Moon, Sun, Clock, Sparkles, Calendar, AlertCircle, Star } from "lucide-react";
import { 
  translatePlanetToMalayalam, 
  translateDayToMalayalam,
  translateMansionToMalayalam,
  formatPlanetDisplay,
  formatDayDisplay,
  formatMansionDisplay,
  translateTurkishToMalayalam
} from "@/lib/astroClockTurkishToMalayalam.js";

const SECTION_ICONS = {
  1: Book,
  2: Book,
  3: Info,
  4: Moon,
  5: Sun,
  6: Clock,
  7: CheckCircle,
  8: Clock,
  9: Calendar,
  10: Clock,
  11: Sparkles,
  12: CheckCircle,
  13: AlertCircle,
  14: Book,
  15: Book,
  16: Book,
  17: Book,
  18: Book
};

export default function UnifiedReport({ report, isMalayalam }) {
  if (!report) return null;
  
  const sections = [
    { id: 1, data: report.section1_meaning },
    { id: 2, data: report.section2_historical },
    { id: 3, data: report.section3_categories },
    { id: 4, data: report.section4_mansion },
    { id: 5, data: report.section5_day },
    { id: 6, data: report.section6_hour },
    { id: 7, data: report.section7_suitability },
    { id: 8, data: report.section8_next_window },
    { id: 9, data: report.section9_best_day },
    { id: 10, data: report.section10_best_hour },
    { id: 11, data: report.section11_zodiac },
    { id: 12, data: report.section12_friendly },
    { id: 13, data: report.section13_opposing },
    { id: 14, data: report.section14_sources },
    { id: 15, data: report.section15_book_citations },
    { id: 16, data: report.section16_pdf_citations },
    { id: 17, data: report.section17_manuscript_citations },
    { id: 18, data: report.section18_summary }
  ];
  
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <PreservationSectionCard 
          key={section.id}
          section={section}
          isMalayalam={isMalayalam}
        />
      ))}
      
      {/* Preservation Notice */}
      <div className="rounded-xl border p-4 mt-4" style={{ 
        background: "rgba(212,175,55,0.05)", 
        borderColor: "rgba(212,175,55,0.25)" 
      }}>
        <div className="flex items-center gap-2 mb-2">
          <Book className="w-4 h-4" style={{ color: "#D4AF37" }} />
          <p className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.80)" }}>
            {isMalayalam ? "ജ്ഞാന സംരക്ഷണം" : "Knowledge Preservation"}
          </p>
        </div>
        <p className="font-inter text-xs mb-1" style={{ color: "rgba(255,255,255,0.70)" }}>
          {isMalayalam 
            ? "എല്ലാ വിവരങ്ങളും സംരക്ഷിത സ്രോതസ്സുകളിൽ നിന്നാണ്" 
            : "All information from preserved knowledge sources"}
        </p>
        <p className="font-inter text-xs" style={{ color: "rgba(212,175,55,0.60)" }}>
          {isMalayalam 
            ? `കൈയെഴുത്തുപ്രതി: ${report._preservation_metadata?.manuscript_references_preserved || 0} | പുസ്തകം: ${report._preservation_metadata?.book_references_preserved || 0} | PDF: ${report._preservation_metadata?.pdf_references_preserved || 0}`
            : `Manuscripts: ${report._preservation_metadata?.manuscript_references_preserved || 0} | Books: ${report._preservation_metadata?.book_references_preserved || 0} | PDFs: ${report._preservation_metadata?.pdf_references_preserved || 0}`}
        </p>
      </div>
    </div>
  );
}

function PreservationSectionCard({ section, isMalayalam }) {
  const SectionIcon = SECTION_ICONS[section.id] || Book;
  const data = section.data;
  
  return (
    <div className="rounded-xl border p-4" style={{ 
      background: "rgba(8,18,44,0.95)", 
      borderColor: "rgba(212,175,55,0.25)" 
    }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "rgba(212,175,55,0.15)" }}>
          <SectionIcon className="w-4 h-4" style={{ color: "#D4AF37" }} />
        </div>
        <div>
          <h3 className="font-inter text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(212,175,55,0.80)" }}>
            {isMalayalam ? (data.title_ml || data.title_en) : data.title_en}
          </h3>
          {data.title_ar && (
            <p className="font-amiri text-sm" style={{ color: "rgba(212,175,55,0.60)" }}>
              {data.title_ar}
            </p>
          )}
        </div>
      </div>
      
      <div className="space-y-2 pl-11">
        {/* Malayalam first, then English */}
        {data.description_ml && (
          <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.80)" }}>
            {data.description_ml}
          </p>
        )}
        {data.description_en && (
          <p className="font-inter text-sm" style={{ color: "rgba(255,255,255,0.60)" }}>
            {data.description_en}
          </p>
        )}
        
        {/* Render manuscripts */}
        {data.manuscripts && data.manuscripts.length > 0 && (
          <div className="space-y-2 mt-2">
            {data.manuscripts.map((m, idx) => (
              <div key={idx} className="p-2 rounded-lg" style={{ background: "rgba(212,175,55,0.08)" }}>
                <p className="font-amiri text-sm mb-1" style={{ color: "#D4AF37" }}>{m.original_text}</p>
                <p className="font-inter text-xs" style={{ color: "rgba(255,255,255,0.60)" }}>
                  {m.book_name} — p.{m.page_number} {m.verified ? '✓ Verified' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
        
        {/* Render categories */}
        {data.categories && data.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.categories.map((cat, idx) => (
              <span key={idx} className="px-2 py-1 rounded-lg text-xs" style={{ 
                background: "rgba(212,175,55,0.15)", 
                color: "#F5D060" 
              }}>
                {cat}
              </span>
            ))}
          </div>
        )}
        
        {/* Render citations */}
        {data.citations && data.citations.length > 0 && (
          <div className="space-y-1 mt-2">
            {data.citations.map((cite, idx) => (
              <p key={idx} className="font-inter text-xs" style={{ color: "rgba(212,175,55,0.60)" }}>
                • {typeof cite === 'object' ? JSON.stringify(cite) : cite}
              </p>
            ))}
          </div>
        )}
        
        {/* Render other data */}
        {renderOtherData(data, isMalayalam)}
      </div>
    </div>
  );
}

function renderOtherData(data, isMalayalam) {
  const skipKeys = ['title_ml', 'title_en', 'title_ar', 'description_ml', 'description_en', 'manuscripts', 'categories', 'citations'];
  
  return Object.entries(data)
    .filter(([key]) => !skipKeys.includes(key))
    .map(([key, value]) => {
      // Handle arrays (planets, mansions, days, etc.)
      if (Array.isArray(value)) {
        if (value.length === 0) return null;
        return (
          <div key={key} className="flex items-start gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "rgba(212,175,55,0.60)" }} />
            <div className="flex-1">
              <span className="font-inter text-xs font-semibold capitalize" style={{ color: "rgba(212,175,55,0.70)" }}>
                {key.replace(/_/g, ' ')}: 
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {value.map((item, idx) => {
                  let displayItem = String(item);
                  if (typeof item === 'string') {
                    // Use centralized translator for ALL Turkish text
                    displayItem = translateTurkishToMalayalam(item);
                  }
                  return (
                    <span key={idx} className="px-2 py-0.5 rounded text-xs" style={{ 
                      background: "rgba(212,175,55,0.10)", 
                      color: "rgba(255,255,255,0.80)" 
                    }}>
                      {displayItem}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }
      
      // Handle simple values
      if (typeof value === 'object' && value !== null) {
        return null; // Skip complex nested objects
      }
      
      // Translate Turkish text before display
      const displayValue = typeof value === 'string' ? translateTurkishToMalayalam(value) : String(value);
      
      return (
        <div key={key} className="flex items-start gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "rgba(212,175,55,0.60)" }} />
          <div className="flex-1">
            <span className="font-inter text-xs font-semibold capitalize" style={{ color: "rgba(212,175,55,0.70)" }}>
              {key.replace(/_/g, ' ')}: 
            </span>
            <span className="font-inter text-sm ml-1" style={{ color: "rgba(255,255,255,0.80)" }}>
              {displayValue}
            </span>
          </div>
        </div>
      );
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTE: Translation functions imported from lib/astroClockTurkishToMalayalam.js
// Display-only translation. Database values remain unchanged.
// ─────────────────────────────────────────────────────────────────────────────