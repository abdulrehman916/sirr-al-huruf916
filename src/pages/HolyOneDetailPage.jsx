import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Heart, BookOpen, Star, Clock, Calculator } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PageLayout from "@/components/PageLayout";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { ABJAD_VALUES } from "@/lib/abjadValues";
import { usePageState } from "@/context/PageStateContext";
import HolyNameImportedSections from "@/components/holynameknowledge/HolyNameImportedSections";
import HolyOneScholarlySections from "@/components/holynameknowledge/HolyOneScholarlySections";
import HolyNameVerifiedKnowledge from "@/components/holynameknowledge/HolyNameVerifiedKnowledge";
import SectionCVisualDisplay from "@/components/sectionc/SectionCVisualDisplay";
import { useIsOwner } from "@/hooks/useIsOwner";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
};

export default function HolyOneDetailPage() {
  const { nameId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPageState, setPageState, pushNavState, popNavState } = usePageState();
  const [name, setName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("A"); // A or B
  const isOwner = useIsOwner();

  // Save navigation state before navigating to detail
  useEffect(() => {
    const tab = searchParams.get('tab');
    const listKey = tab === 'b' || nameId?.startsWith('PDF-') 
      ? 'magical-holy-names-section-b' 
      : 'magical-holy-names-section-a';
    
    const currentState = getPageState(listKey, {});
    pushNavState('holy-names', {
      listKey,
      ...currentState,
      fromPage: '/holy-names'
    });

    // Cleanup on unmount - restore state when returning
    return () => {
      const savedState = popNavState('holy-names');
      if (savedState && savedState.listKey) {
        // State will be restored by the list page on mount
      }
    };
  }, [nameId, searchParams.get('tab')]);

  useEffect(() => {
    loadName();
  }, [nameId, searchParams.get('tab')]);

  const loadName = async () => {
    setLoading(true);
    try {
      const tab = searchParams.get('tab');
      
      if (tab === 'b' || nameId.startsWith('PDF-')) {
        // Section B: PDF Holy Names
        const result = await base44.entities.HolyOnePDFName.filter({ pdf_name_id: nameId });
        if (result && result.length > 0) {
          setName(result[0]);
          setSource("B");
        } else {
          toast({ title: "Name not found", variant: "destructive" });
          navigate("/holy-names");
        }
      } else {
        // Section A: Original Holy Names
        const result = await base44.entities.HolyOneName.filter({ name_id: nameId });
        if (result && result.length > 0) {
          setName(result[0]);
          setSource("A");
        } else {
          toast({ title: "Name not found", variant: "destructive" });
          navigate("/holy-names/one");
        }
      }
    } catch (e) {
      toast({ title: "Failed to load", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!name) return;
    try {
      if (source === "A") {
        await base44.entities.HolyOneName.update(name.id, { is_favorite: !name.is_favorite });
      } else {
        await base44.entities.HolyOnePDFName.update(name.id, { is_favorite: !name.is_favorite });
      }
      loadName();
      toast({ title: name.is_favorite ? "Removed from favorites" : "Added to favorites" });
    } catch (e) {
      toast({ title: "Failed to update", description: e.message, variant: "destructive" });
    }
  };

  // ── Divine Name extraction + dual Abjad (Section B only) ──
  // The PDF chapter heading is "اسمه <Divine Name> <explanatory phrase>".
  // ONLY the Divine Name (the heading's first word, with ال) is used for
  // every Abjad calculation — never the full chapter heading. Honorific /
  // explanatory phrases (جلت قدرته, تبارك وتعالى, عز وجل, سبحانه, جل جلاله,
  // تعالى, جل شأنه, قدس سره, and ANY similar text after the name) are ignored.
  // The full heading is still displayed verbatim above; nothing inside the
  // imported PDF Knowledge is altered or recalculated. Two values are shown:
  // with ال and without ال, each with its own square (value × value).
  // Computed at render time → applies automatically to every existing and
  // future Holy Name card; no database change.
  const divineNameInfo = useMemo(() => {
    if (source !== "B" || !name || !name.arabic_name) return null;
    // Strip the "اسمه" chapter marker (and any leading "اسم" prefix).
    const heading = String(name.arabic_name)
      .replace(/^\s*اسمه\s+/, "")
      .replace(/^\s*اسم\s+/, "")
      .trim();
    const tokens = heading.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return null;
    // Divine Name = the FIRST word of the heading (with ال). Everything
    // after it is explanatory/honorific and is never used for calculation.
    const withAL = tokens[0].replace(/\u0640/g, ""); // strip tatweel only
    let withoutAL = withAL;
    const bareFirst = withAL.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
    if (bareFirst.startsWith("\u0627\u0644") && bareFirst.length > 2) {
      withoutAL = withAL.replace(/^\u0627\u0644/, "");
    }
    const calcAbjad = (txt) => {
      const clean = String(txt)
        .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, "")
        .replace(/\s+/g, "");
      let total = 0;
      for (const ch of clean) {
        if (ABJAD_VALUES[ch]) total += ABJAD_VALUES[ch];
      }
      return total;
    };
    const withALValue = calcAbjad(withAL);
    const withoutALValue = calcAbjad(withoutAL);
    return {
      withAL,
      withoutAL,
      withALValue,
      withoutALValue,
      withALSquare: withALValue * withALValue,
      withoutALSquare: withoutALValue * withoutALValue,
    };
  }, [name?.arabic_name, source]);

  if (loading) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!name) {
    return (
      <PageLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <ChevronLeft className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="font-inter text-xl font-bold text-white mb-2">Record Not Found</h2>
          <p className="text-gray-400 text-sm mb-6">This Holy Name record does not exist in the database.</p>
          <button
            onClick={() => navigate("/holy-names")}
            className="px-6 py-3 rounded-xl border border-gold-dim text-gold hover:bg-gold/10 transition-colors"
          >
            Back to Holy Names
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl"
          style={{
            color: G.text,
            background: G.bg,
            border: `1px solid ${G.border}`,
            fontSize: 16
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to List</span>
        </button>

        {/* Source Badge */}
        <div className="flex justify-center mb-4">
          <Badge style={{ 
            background: source === "A" ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
            borderColor: source === "A" ? "rgba(34,197,94,0.40)" : "rgba(59,130,246,0.40)",
            color: source === "A" ? "#4ade80" : "#60a5fa",
            fontSize: 12
          }}>
            {source === "A" ? "Section A - Original" : "Section B - PDF"}
          </Badge>
        </div>

        {/* Arabic Name */}
        <div className="text-center mb-6">
          <h1 className={source === "B" ? "font-quranic text-gold mb-3" : "font-amiri text-4xl font-bold text-gold mb-3"}>{name.arabic_name || "Unknown"}</h1>
          <p className="text-lg text-white/60 mb-2">{name.malayalam_pronunciation || ""}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge style={{ background: G.bg, borderColor: G.border, fontSize: 12 }}>
              {name.view_count || 0} views
            </Badge>
            {name.last_viewed && (
              <Badge style={{ background: G.bg, borderColor: G.border, fontSize: 12 }}>
                Last viewed {new Date(name.last_viewed).toLocaleDateString()}
              </Badge>
            )}
            {isOwner && source === "B" && name.source_pdf_page && (
              <Badge style={{ background: G.bg, borderColor: G.border, fontSize: 12 }}>
                PDF Page {name.source_pdf_page}
              </Badge>
            )}
          </div>
        </div>

        {/* Favorite Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={toggleFavorite}
            className="flex items-center gap-2 px-6 py-3 rounded-xl"
            style={{
              color: name.is_favorite ? G.text : "rgba(255,255,255,0.40)",
              background: name.is_favorite ? G.bg : "rgba(255,255,255,0.03)",
              border: `1px solid ${name.is_favorite ? G.border : "rgba(255,255,255,0.08)"}`,
              fontSize: 16
            }}
          >
            <Heart className={`w-5 h-5 ${name.is_favorite ? "fill-current" : ""}`} />
            <span>{name.is_favorite ? "In Favorites" : "Add to Favorites"}</span>
          </button>
        </div>

        {/* Abjad Calculation - Section B Only
            ONLY the Divine Name (heading's first word) is calculated — never
            the full chapter heading. Two values: with ال and without ال,
            each with its own square (value × value). The full heading is
            displayed verbatim above; PDF Knowledge below is never altered. */}
        {source === "B" && divineNameInfo && (
          <div className="space-y-5 mb-6">
            {/* With ال */}
            <div>
              <div className="text-center mb-3">
                <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.text }}>
                  Holy Name (with ال)
                </span>
                <p className="font-quranic text-gold mt-1">{divineNameInfo.withAL}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border p-5 text-center" style={{
                  background: "linear-gradient(145deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.05) 100%)",
                  border: "1px solid rgba(212,175,55,0.40)",
                  boxShadow: "0 0 20px rgba(212,175,55,0.12)"
                }}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Calculator className="w-5 h-5" style={{ color: G.text }} />
                    <h3 className="font-inter font-semibold text-white text-sm">Abjad Value</h3>
                  </div>
                  <p className="font-amiri text-4xl font-bold" style={{ color: G.text, textShadow: "0 0 20px rgba(212,175,55,0.35)" }}>
                    {divineNameInfo.withALValue}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{divineNameInfo.withAL}</p>
                </div>
                <div className="rounded-xl border p-5 text-center" style={{
                  background: "linear-gradient(145deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.05) 100%)",
                  border: "1px solid rgba(212,175,55,0.40)",
                  boxShadow: "0 0 20px rgba(212,175,55,0.12)"
                }}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Calculator className="w-5 h-5" style={{ color: G.text }} />
                    <h3 className="font-inter font-semibold text-white text-sm">Abjad Square</h3>
                  </div>
                  <p className="font-amiri text-3xl font-bold" style={{ color: G.text, textShadow: "0 0 20px rgba(212,175,55,0.35)" }}>
                    {divineNameInfo.withALSquare}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {divineNameInfo.withALValue} × {divineNameInfo.withALValue} = {divineNameInfo.withALSquare}
                  </p>
                </div>
              </div>
            </div>

            {/* Without ال */}
            <div>
              <div className="text-center mb-3">
                <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.text }}>
                  Holy Name (without ال)
                </span>
                <p className="font-quranic text-gold mt-1">{divineNameInfo.withoutAL}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border p-5 text-center" style={{
                  background: "linear-gradient(145deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.05) 100%)",
                  border: "1px solid rgba(212,175,55,0.40)",
                  boxShadow: "0 0 20px rgba(212,175,55,0.12)"
                }}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Calculator className="w-5 h-5" style={{ color: G.text }} />
                    <h3 className="font-inter font-semibold text-white text-sm">Abjad Value</h3>
                  </div>
                  <p className="font-amiri text-4xl font-bold" style={{ color: G.text, textShadow: "0 0 20px rgba(212,175,55,0.35)" }}>
                    {divineNameInfo.withoutALValue}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">{divineNameInfo.withoutAL}</p>
                </div>
                <div className="rounded-xl border p-5 text-center" style={{
                  background: "linear-gradient(145deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.05) 100%)",
                  border: "1px solid rgba(212,175,55,0.40)",
                  boxShadow: "0 0 20px rgba(212,175,55,0.12)"
                }}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Calculator className="w-5 h-5" style={{ color: G.text }} />
                    <h3 className="font-inter font-semibold text-white text-sm">Abjad Square</h3>
                  </div>
                  <p className="font-amiri text-3xl font-bold" style={{ color: G.text, textShadow: "0 0 20px rgba(212,175,55,0.35)" }}>
                    {divineNameInfo.withoutALSquare}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {divineNameInfo.withoutALValue} × {divineNameInfo.withoutALValue} = {divineNameInfo.withoutALSquare}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verified Knowledge Cache — checked first (zero AI on hit) */}
        {name.arabic_name && (
          <div className="mb-4">
            <HolyNameVerifiedKnowledge
              arabicName={name.arabic_name}
              nameId={name.name_id || nameId}
              englishName={name.malayalam_pronunciation}
            />
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-4">
          
          {/* Meaning */}
          {name.meaning_malayalam ? (
            <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5" style={{ color: G.text }} />
                <h2 className="font-inter font-semibold text-white">അർത്ഥം (Meaning)</h2>
              </div>
              <p className="text-white/80 leading-relaxed">{name.meaning_malayalam}</p>
            </div>
          ) : null}

          {/* Explanation */}
          {name.explanation_malayalam ? (
            <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5" style={{ color: G.text }} />
                <h2 className="font-inter font-semibold text-white">വിശദീകരണം (Explanation)</h2>
              </div>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{name.explanation_malayalam}</p>
            </div>
          ) : null}

          {/* Virtues & Benefits */}
          {name.virtues_benefits ? (
            <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5" style={{ color: G.text }} />
                <h2 className="font-inter font-semibold text-white">ഗുണങ്ങളും ആനുകൂല്യങ്ങളും (Virtues & Benefits)</h2>
              </div>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{name.virtues_benefits}</p>
            </div>
          ) : null}

          {/* Islamic Information */}
          {name.islamic_information ? (
            <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5" style={{ color: G.text }} />
                <h2 className="font-inter font-semibold text-white">ഇസ്ലാമിക വിവരങ്ങൾ (Islamic Information)</h2>
              </div>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{name.islamic_information}</p>
            </div>
          ) : null}

          {/* Authentic Notes */}
          {name.authentic_notes ? (
            <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5" style={{ color: G.text }} />
                <h2 className="font-inter font-semibold text-white">ആധികാരിക കുറിപ്പുകൾ (Authentic Notes)</h2>
              </div>
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{name.authentic_notes}</p>
            </div>
          ) : null}

          {/* Attached Visuals — original source page images (magic squares, wafq, symbols, seals, diagrams) */}
          {source === "B" && Array.isArray(name.attached_visuals) && name.attached_visuals.length > 0 && (
            <SectionCVisualDisplay visuals={name.attached_visuals} />
          )}

          {/* Source Reference — provenance Owner-only; Surah kept as content */}
          <div className="text-center text-xs text-white/30 mt-6">
            {isOwner && source === "A" && name.source_reference && (
              <>
                <p>Source: {name.source_reference}</p>
                {name.source_page && <p>Page {name.source_page}</p>}
              </>
            )}
            {isOwner && source === "B" && name.source_pdf_page && (
              <p>Page {name.source_pdf_page}</p>
            )}
            {source === "B" && name.surah_name && (
              <p>Surah: {name.surah_name}</p>
            )}
          </div>

        </div>

        {/* Imported PDF Knowledge — enriches this Holy Name's existing card */}
        <div className="mt-6">
          <HolyNameImportedSections
            sourceSection={source === "B" ? "section_b" : "section_a"}
            sourceNameKey={source === "B" ? (name.pdf_name_id || nameId) : nameId}
          />
        </div>

        {/* Section B scholarly library — append-only research arrays.
            Section-B-only; never shown for Section A. */}
        {source === "B" && (
          <div className="mt-6">
            <HolyOneScholarlySections card={name} />
          </div>
        )}

      </motion.div>
    </PageLayout>
  );
}