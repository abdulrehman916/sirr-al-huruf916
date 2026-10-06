import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, ShieldAlert, Sparkles, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import HolyNameEsotericResearchProfile from "@/components/holynameknowledge/HolyNameEsotericResearchProfile";
import SectionCVisualIntegrator from "@/components/sectionc/SectionCVisualIntegrator";

// ── Section C — Birhatīya / Esoteric Invocation Names ──
// INDEPENDENT module. Reads ONLY from HolyNameEsotericKnowledge.
// No data from Section A or Section B is used here.

const P = {
  border: "rgba(212,175,55,0.30)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(245,208,96,0.55)",
  faint: "rgba(212,175,55,0.14)",
  bg: "rgba(212,175,55,0.06)",
  bgHi: "rgba(212,175,55,0.14)",
};

export default function SectionCPage() {
  const { toast } = useToast();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await base44.entities.HolyNameEsotericKnowledge.list("order_index", 2000);
      setCards(r || []);
    } catch (e) {
      toast({ title: "Failed to load Section C names", description: String(e?.message || e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(c =>
      (c.arabic_name || "").toLowerCase().includes(q) ||
      (c.arabic_normalized || "").toLowerCase().includes(q) ||
      (c.transliteration || "").toLowerCase().includes(q) ||
      (c.exact_meaning || "").toLowerCase().includes(q) ||
      (c.name_id || "").toLowerCase().includes(q)
    );
  }, [cards, search]);

  return (
    <div className="min-h-screen w-full" style={{ background: "#020710", color: "rgba(255,255,255,0.92)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2 pt-4">
          <Sparkles className="w-7 h-7 mx-auto" style={{ color: P.text }} />
          <h1 className="font-amiri text-4xl font-bold" style={{ color: P.text, textShadow: `0 0 24px ${P.glow}` }} dir="rtl">
            البرهتيّة
          </h1>
          <p className="font-inter text-[10px] uppercase tracking-[0.3em]" style={{ color: P.dim }}>
            SECTION C · BIRHATĪYA · ESOTERIC INVOCATION NAMES
          </p>
          <p className="font-malayalam text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>
            ബർഹത്തിയ്യ ഗൂഢ നാമ ജ്ഞാന ശേഖരം — സ്വതന്ത്ര പണ്ഡിതോപയോഗിയായ ഡാറ്റാബേസ്
          </p>
        </motion.div>

        {/* Status bar */}
        <div className="flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(8,16,38,0.6)", border: `1px solid ${P.border}` }}>
          <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: P.dim }}>
            {filtered.length} OF {cards.length} NAMES
          </span>
          <span className="font-inter text-[9px] uppercase tracking-widest" style={{ color: cards.length > 0 ? P.text : "rgba(148,163,184,0.7)" }}>
            {cards.length === 0 ? "AWAITING NAMES" : "SOURCE #1 SEEDED · 28 NAMES"}
          </span>
        </div>

        {/* Search */}
        {cards.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: P.dim }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Arabic name, transliteration, meaning, or ID…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl font-inter text-sm bg-transparent outline-none"
              style={{ background: "rgba(8,16,38,0.6)", border: `1px solid ${P.border}`, color: "rgba(255,255,255,0.90)" }}
            />
          </div>
        )}

        {/* Visual Content Integrator — admin/owner only */}
        <SectionCVisualIntegrator />

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: P.dim }} />
            <span className="ml-2 font-inter text-[10px] uppercase tracking-widest" style={{ color: P.dim }}>Loading Section C…</span>
          </div>
        ) : cards.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-8 text-center space-y-3" style={{ background: "rgba(8,16,38,0.55)", border: `1px solid ${P.faint}` }}>
            <ShieldAlert className="w-8 h-8 mx-auto" style={{ color: "rgba(148,163,184,0.7)" }} />
            <p className="font-inter text-[10px] uppercase tracking-widest font-bold" style={{ color: "rgba(148,163,184,0.85)" }}>
              DATABASE STRUCTURE READY · NO NAMES YET
            </p>
            <p className="font-malayalam text-sm leading-relaxed max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
              ബർഹത്തിയ്യ നാമങ്ങൾ ലഭിച്ചുകഴിഞ്ഞാൽ ഇവിടെ കാർഡുകൾ പ്രത്യക്ഷപ്പെടും.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((card) => {
              const isOpen = expandedId === card.id;
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl overflow-hidden"
                  style={{ background: "rgba(8,16,38,0.55)", border: `1px solid ${isOpen ? P.borderHi : P.faint}` }}
                >
                  <button
                    onClick={() => setExpandedId(isOpen ? null : card.id)}
                    className="w-full text-left px-3 py-3 flex items-center gap-3"
                  >
                    <span className="font-inter text-[8px] uppercase tracking-widest flex-shrink-0" style={{ color: P.dim }}>
                      #{String(card.order_index || card.original_static_id).padStart(2, "0")}
                    </span>
                    <span className="font-amiri text-xl flex-1 truncate selectable" style={{ color: P.text }} dir="rtl">
                      {card.arabic_name}
                    </span>
                    {card.transliteration && (
                      <span className="font-inter text-[10px] flex-shrink-0 hidden sm:inline" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {card.transliteration}
                      </span>
                    )}
                    {card.total_abjad_value > 0 && (
                      <span className="font-inter text-[9px] flex-shrink-0 px-1.5 py-0.5 rounded" style={{ color: P.dim, background: P.bg, border: `1px solid ${P.faint}` }}>
                        {card.total_abjad_value}
                      </span>
                    )}
                    <span className="font-inter text-[8px] uppercase tracking-widest flex-shrink-0" style={{ color: "rgba(148,163,184,0.7)" }}>
                      {card.verification_status || "unverified"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3">
                      <HolyNameEsotericResearchProfile nameId={card.name_id} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        {!loading && cards.length > 0 && (
          <div className="text-center pt-4">
            <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "rgba(148,163,184,0.5)" }}>
              <BookOpen className="w-3 h-3 inline mr-1" style={{ color: P.dim }} />
              Source #1: N Wahid Azal · al-Būnī, Manbaʿ Uṣūl al-Ḥikma pp. 67–74 · No internet enrichment
            </p>
          </div>
        )}
      </div>
    </div>
  );
}