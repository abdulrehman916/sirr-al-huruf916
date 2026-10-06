import { ChevronRight, Leaf, FlaskConical, Droplet, Circle, Wind,
  Flower2, PenTool, Square, BookOpen, Archive, Info, Package, Ruler,
  Wrench, AlertTriangle, Layers, FileText } from "lucide-react";
import { getPreparationTypeLabel } from "@/lib/preparationLibrarySync";

const ICON_MAP = {
  Leaf, FlaskConical, Droplet, Circle, Wind,
  Flower2, PenTool, Square, BookOpen, Archive, Info, Package, Ruler,
  Wrench, AlertTriangle,
};

const TYPE_ACCENTS = {
  herb: "#34D399",
  natural_medicine: "#34D399",
  oil: "#FBBF24",
  powder: "#A78BFA",
  mixture: "#60A5FA",
  incense: "#F87171",
  perfume: "#F472B6",
  ink: "#D4AF37",
  wafq_material: "#60A5FA",
  recipe: "#34D399",
  storage_method: "#94A3B8",
  usage_instruction: "#94A3B8",
  ingredient: "#34D399",
  measurement: "#94A3B8",
  tool: "#94A3B8",
  safety_note: "#F87171",
};

export default function SirrPreparationCard({ preparation, onSelect, language, accent }) {
  const isMl = language === "ml";
  const typeAccent = TYPE_ACCENTS[preparation.preparation_type] || accent || "#34D399";
  const typeLabel = getPreparationTypeLabel(preparation.preparation_type, language);
  const Icon = ICON_MAP[
    (preparation.preparation_type && PREPARATION_TYPE_ICONS[preparation.preparation_type]) || "Leaf"
  ] || Leaf;

  const displayName = isMl
    ? preparation.name_ml || preparation.name || preparation.name_en
    : preparation.name_en || preparation.name || preparation.name_ml;

  const sourceCount = preparation.source_count || 1;
  const imageCount = (preparation.images || []).length + (preparation.diagrams || []).length;

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{
        background: "linear-gradient(145deg, rgba(8,16,38,0.98) 0%, rgba(4,10,24,0.99) 100%)",
        border: `1px solid ${typeAccent}22`,
      }}
    >
      {/* Type icon */}
      <span className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: `${typeAccent}10` }}>
        <Icon className="w-4 h-4" style={{ color: typeAccent }} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {preparation.name_ar && (
          <p className="font-amiri text-sm truncate" style={{ color: typeAccent, direction: "rtl" }}>
            {preparation.name_ar}
          </p>
        )}
        <p className={`text-sm font-bold ${isMl ? "font-malayalam" : "font-inter"}`} style={{ color: "rgba(255,255,255,0.80)" }}>
          {displayName}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-inter text-[9px] px-1.5 py-0.5 rounded"
            style={{ background: `${typeAccent}10`, color: `${typeAccent}99` }}>
            {typeLabel}
          </span>
          {sourceCount > 1 && (
            <span className="flex items-center gap-0.5 font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              <Layers className="w-2.5 h-2.5" /> {sourceCount}
            </span>
          )}
          {imageCount > 0 && (
            <span className="flex items-center gap-0.5 font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.35)" }}>
              <FileText className="w-2.5 h-2.5" /> {imageCount}
            </span>
          )}
        </div>
      </div>

      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: `${typeAccent}99` }} />
    </button>
  );
}

const PREPARATION_TYPE_ICONS = {
  herb: "Leaf",
  natural_medicine: "FlaskConical",
  oil: "Droplet",
  powder: "Circle",
  mixture: "FlaskConical",
  incense: "Wind",
  perfume: "Flower2",
  ink: "PenTool",
  wafq_material: "Square",
  recipe: "BookOpen",
  storage_method: "Archive",
  usage_instruction: "Info",
  ingredient: "Package",
  measurement: "Ruler",
  tool: "Wrench",
  safety_note: "AlertTriangle",
};