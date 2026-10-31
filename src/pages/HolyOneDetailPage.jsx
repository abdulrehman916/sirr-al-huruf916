import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Heart, BookOpen, Star, Clock, Calculator } from "lucide-react";
import { platform } from "@/api/platformClient";
import PageLayout from "@/components/PageLayout";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { getHolyNameAbjad } from "@/lib/holyNameAbjad";
import { usePageState } from "@/context/PageStateContext";
import { useNavigation } from "@/context/NavigationContext";
import HolyNameImportedSections from "@/components/holynameknowledge/HolyNameImportedSections";
import HolyOneSourceVisuals from "@/components/holynameknowledge/HolyOneSourceVisuals";
import HolyOneScholarlySections from "@/components/holynameknowledge/HolyOneScholarlySections";
import HolyNameSectionBReader from "@/components/holynameknowledge/HolyNameSectionBReader";
import HolyNameOutsideSources from "@/components/holynameknowledge/HolyNameOutsideSources";
import tilimsaniChapters from "@/data/holyNamesTilimsaniChapters.json";
import { withSectionBBaseTranslations } from '@/lib/holyNames/baseTranslations';
import { withSectionBMeaning } from '@/lib/holyNames/sectionBMeanings';
import { unlinkedSectionBVisuals } from '@/lib/holyNames/sectionBReading';
import reviewedCards from "@/data/holyNamesReviewedCards.json";
import HolyNameVerifiedKnowledge from "@/components/holynameknowledge/HolyNameVerifiedKnowledge";
import { useIsOwner } from "@/hooks/useIsOwner";
import { HolyNamesLanguageContext, HolyNamesLanguageToggle, useHolyNamesLanguagePreference } from "@/components/holynameknowledge/HolyNamesLanguageContext";

import { CardNotes } from "@/components/owner/OwnerContent";
import mergedCards from "@/data/holyNamesMergedCards.json";

const G = {
  border: "rgba(212,175,55,0.40)",
  text: "#F5D060",
  bg: "rgba(212,175,55,0.07)",
};

function SelectedTranslation({ language, malayalam, english }) {
  const value = language === "ml" ? malayalam : english;
  if (value) {
    return <p className={`${language === "ml" ? "font-malayalam" : "font-inter"} text-white/80 leading-relaxed whitespace-pre-wrap`}>{value}</p>;
  }
  if (malayalam || english) {
    return <p className="font-inter text-sm text-white/50">{language === "ml" ? "മലയാള പരിഭാഷ ലഭ്യമല്ല." : "English translation not available yet."}</p>;
  }
  return null;
}

export default function HolyOneDetailPage() {
  const { nameId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { goBack } = useNavigation();
  const { toast } = useToast();
  const { getPageState, setPageState, pushNavState, popNavState } = usePageState();
  const [name, setName] = useState(null);
  const [mergedAliases, setMergedAliases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const loadSequence = useRef(0);
  const [source, setSource] = useState("A"); // A or B
  const [language, setLanguage] = useHolyNamesLanguagePreference();
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
    return () => { loadSequence.current += 1; };
  }, [nameId, searchParams.get('tab')]);

  const loadName = async () => {
    const sequence = ++loadSequence.current;
    setLoading(true);
    setLoadError(false);
    setName(null);
    try {
      const tab = searchParams.get('tab');

      if (tab === 'b' || nameId.startsWith('PDF-')) {
        // A duplicate card now lives inside the card it was merged into.
        const mergedTarget = mergedCards.merged_into[nameId];
        if (mergedTarget) {
          navigate(`/holy-names/one/${mergedTarget}?tab=b`, { replace: true });
          return;
        }
        // Section B: PDF Holy Names
        const aliasIds = Object.entries(mergedCards.merged_into).filter(([, target]) => target === nameId).map(([alias]) => alias);
        setMergedAliases([]);
        if (aliasIds.length) {
          Promise.all(aliasIds.map(alias => platform.entities.HolyOnePDFName.filter({ pdf_name_id: alias })))
            .then(results => { if (sequence === loadSequence.current) setMergedAliases(results.map(r => r?.[0]).filter(Boolean).map(withSectionBMeaning)); })
            .catch(() => {});
        }
        const result = await platform.entities.HolyOnePDFName.filter({ pdf_name_id: nameId });
        if (sequence !== loadSequence.current) return;
        if (result && result.length > 0) {
          const reviewed = reviewedCards[nameId];
          setName(withSectionBMeaning(withSectionBBaseTranslations(reviewed?.pdf_name_id === nameId && reviewed.review_status === "checked_against_digital_text"
            ? { ...result[0], ...reviewed }
            : result[0])));
          setSource("B");
        } else {
          toast({ title: "Name not found", variant: "destructive" });
          navigate("/holy-names");
        }
      } else {
        // Section A: Original Holy Names
        const result = await platform.entities.HolyOneName.filter({ name_id: nameId });
        if (sequence !== loadSequence.current) return;
        if (result && result.length > 0) {
          setName(result[0]);
          setSource("A");
        } else {
          toast({ title: "Name not found", variant: "destructive" });
          navigate("/holy-names/one");
        }
      }
    } catch (e) {
      if (sequence !== loadSequence.current) return;
      setLoadError(true);
      toast({ title: "Failed to load", description: e.message, variant: "destructive" });
    } finally {
      if (sequence === loadSequence.current) setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    if (!name) return;
    try {
      if (source === "A") {
        await platform.entities.HolyOneName.update(name.id, { is_favorite: !name.is_favorite });
      } else {
        await platform.entities.HolyOnePDFName.update(name.id, { is_favorite: !name.is_favorite });
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
    return getHolyNameAbjad(name.arabic_name);
  }, [name?.arabic_name, source]);

  if (loading) {
    return (
      <PageLayout>
        <div role="status" aria-live="polite" className="min-h-[60vh] flex flex-col gap-4 items-center justify-center">
          <p className="text-white/70">{language === "ml" ? "കാർഡിന്റെ വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു…" : "Loading card information…"}</p>
          <div className="w-10 h-10 border-4 border-t-yellow-400 rounded-full animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (loadError) {
    return <PageLayout><div role="alert" className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-white/85">{language === "ml" ? "ഈ നാമത്തിന്റെ വിവരങ്ങൾ ലോഡ് ചെയ്യാനായില്ല." : "This name could not be loaded."}</p>
      <button type="button" onClick={loadName} className="rounded-xl border border-gold-dim px-4 py-2 text-gold">{language === "ml" ? "വീണ്ടും ശ്രമിക്കുക" : "Try again"}</button>
    </div></PageLayout>;
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
      <HolyNamesLanguageContext.Provider value={{ language, setLanguage }}>
      <motion.div className="holy-name-reader" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>

        <div className="flex justify-end mb-3"><HolyNamesLanguageToggle /></div>

        {/* Back Button */}
        <button
          onClick={goBack}
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
            {source === "A" ? "Section A" : "Section B"}
          </Badge>
        </div>

        {/* Arabic Name */}
        <div className="text-center mb-6">
          <h1 className={source === "B" ? "font-quranic text-gold mb-3" : "font-amiri text-4xl font-bold text-gold mb-3"}>{name.arabic_name || "Unknown"}</h1>
          <p className="font-inter text-lg text-white/80 mb-2">{name.arabic_transliteration || name.english_name || ""}</p>
          {language === "ml" && name.malayalam_pronunciation && <p className="font-malayalam text-base text-white/60 mb-2">{name.malayalam_pronunciation}</p>}
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
            {divineNameInfo.withAL !== divineNameInfo.withoutAL && (<div>
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
            </div>)}
          </div>
        )}

        {/* Verified Knowledge Cache — checked first (zero AI on hit) */}
        {name.arabic_name && !reviewedCards[nameId] && (
          <div className="mb-4">
            <HolyNameVerifiedKnowledge
              arabicName={name.arabic_name}
              nameId={name.name_id || nameId}
              englishName={name.arabic_transliteration || name.english_name}
            />
          </div>
        )}

        <CardNotes cardKey={nameId} kind={source === "B" ? "holy-b" : "holy-a"} language={language} />
        {/* Content Sections */}
        <div className="space-y-4">

          {/* Meaning */}
          {(name.meaning_malayalam || name.meaning_english || name.english_meaning) ? (
            <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5" style={{ color: G.text }} />
                <h2 className="font-inter font-semibold text-white">{language === 'ml' ? 'അർഥം' : 'Meaning'}</h2>
              </div>
              <SelectedTranslation language={language} malayalam={name.meaning_malayalam} english={name.meaning_english || name.english_meaning} />
              {name.editorial_meaning && <p className="text-xs text-white/55 mt-3 leading-relaxed">{language === 'ml' ? 'ഇത് നൽകിയ അറബി തലക്കെട്ടിന്റെ ലളിതമായ അർഥമാണ്. തബാറക, തആലാ, സുബ്ഹാനഹു തുടങ്ങിയവ സ്തുതിപദങ്ങളാണ്. ഒരു പദത്തെ സ്വതന്ത്ര ദൈവനാമമായി സ്ഥിരീകരിക്കുന്ന തെളിവായി ഈ അർഥം കണക്കാക്കരുത്.' : 'This is an editorial meaning of the supplied Arabic heading. Tabaraka, taala and subhanahu are expressions of praise. This gloss does not authenticate a word as an independent divine name.'}</p>}
            </div>
          ) : null}

          {/* Explanation */}
          {(name.explanation_malayalam || name.explanation_english || name.english_explanation) ? (
            <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5" style={{ color: G.text }} />
                <h2 className="font-inter font-semibold text-white">{language === 'ml' ? 'വിശദീകരണം' : 'Explanation'}</h2>
              </div>
              <SelectedTranslation language={language} malayalam={name.explanation_malayalam} english={name.explanation_english || name.english_explanation} />
            </div>
          ) : null}

        {source === "B" && <HolyNameSectionBReader key={name.pdf_name_id || nameId} card={name} chapter={tilimsaniChapters[name.pdf_name_id || nameId]} nameId={name.pdf_name_id || nameId} />}
        {source === "B" && <HolyNameOutsideSources nameId={name.pdf_name_id || nameId} />}

        {source === "B" && mergedAliases.map(alias => (
          <div key={alias.pdf_name_id} className="rounded-xl border p-4 space-y-4" style={{ background: "rgba(255,255,255,0.02)", borderColor: G.border }} data-testid="merged-card-content">
            <h2 className="font-inter font-semibold text-white">
              {language === "ml" ? "ഇതേ നാമത്തിന്റെ മുൻ കാർഡിൽ നിന്ന് ചേർത്തത്" : "Merged from this Name's earlier card"} <span dir="rtl" className="font-amiri text-amber-200">{alias.arabic_name}</span>
            </h2>
            {(alias.explanation_malayalam || alias.explanation_english || alias.english_explanation) ? (
              <SelectedTranslation language={language} malayalam={alias.explanation_malayalam} english={alias.explanation_english || alias.english_explanation} />
            ) : null}
            {(alias.virtues_benefits || alias.virtues_benefits_english || alias.benefits_english) ? (
              <SelectedTranslation language={language} malayalam={alias.virtues_benefits} english={alias.virtues_benefits_english || alias.benefits_english} />
            ) : null}
            <HolyNameSectionBReader card={alias} chapter={tilimsaniChapters[alias.pdf_name_id]} nameId={alias.pdf_name_id} />
            <HolyNameImportedSections sourceSection="section_b" sourceNameKey={alias.pdf_name_id} />
          </div>
        ))}

          {/* Virtues & Benefits */}
          {(name.virtues_benefits || name.virtues_benefits_english || name.benefits_english) ? (
            <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-5 h-5" style={{ color: G.text }} />
                <h2 className="font-inter font-semibold text-white">{language === 'ml' ? 'ഗുണങ്ങളെക്കുറിച്ചുള്ള പരാമർശങ്ങൾ' : 'Virtues & Benefits'}</h2>
              </div>
              <SelectedTranslation language={language} malayalam={name.virtues_benefits} english={name.virtues_benefits_english || name.benefits_english} />
            </div>
          ) : null}

          {/* Islamic Information */}
          {(name.islamic_information || name.islamic_information_english) ? (
            <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5" style={{ color: G.text }} />
                <h2 className="font-inter font-semibold text-white">{language === 'ml' ? 'ഇസ്‌ലാമിക വിവരങ്ങൾ' : 'Islamic Information'}</h2>
              </div>
              <SelectedTranslation language={language} malayalam={name.islamic_information} english={name.islamic_information_english} />
            </div>
          ) : null}

          {/* Authentic Notes */}
          {(name.authentic_notes || name.authentic_notes_english) ? (
            <div className="rounded-xl border p-4" style={{ background: "rgba(255,255,255,0.03)", borderColor: G.border }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5" style={{ color: G.text }} />
                <h2 className="font-inter font-semibold text-white">{language === 'ml' ? 'കുറിപ്പുകൾ' : 'Notes'}</h2>
              </div>
              <SelectedTranslation language={language} malayalam={name.authentic_notes} english={name.authentic_notes_english} />
            </div>
          ) : null}

          {/* Original figures remain access-controlled; the API resolves temporary URLs. */}
          {source === "B" && <HolyOneSourceVisuals visuals={unlinkedSectionBVisuals(name)} cardId={name.pdf_name_id} />}

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
            {source === "B" && name.surah_name && name.surah_name !== "Tilimsani" && (
              <p>Surah: {name.surah_name}</p>
            )}
          </div>

        </div>

        {isOwner && name.archived_import_errors?.length > 0 && <details className="mt-4 rounded-xl border border-white/10 p-3 text-xs text-white/55"><summary className="cursor-pointer">{language === 'ml' ? 'പഴയ import പിശകുകൾ' : 'Archived import errors'}</summary>{name.archived_import_errors.map(entry => <p key={entry.field} className="mt-2 whitespace-pre-wrap">{entry.field}: {language === 'ml' ? entry.text : entry.english}</p>)}</details>}

        {/* Imported PDF Knowledge — enriches this Holy Name's existing card */}
        {<div className="mt-6">
          <HolyNameImportedSections
            key={`${source}:${nameId}`}
            sourceSection={source === "B" ? "section_b" : "section_a"}
            sourceNameKey={source === "B" ? (name.pdf_name_id || nameId) : nameId}
          />
        </div>}

        {/* Section B scholarly library — append-only research arrays.
            Section-B-only; never shown for Section A. */}
        {source === "B" && (
          <div className="mt-6">
            <details className="rounded-xl border border-yellow-500/20 p-4">
              <summary className="cursor-pointer text-yellow-200">{isOwner ? (language === 'ml' ? 'പഴയ രേഖകളും സ്രോതസ്സ് പരിശോധനയുടെ നിലയും' : 'Earlier records and source review status') : (language === 'ml' ? 'കൂടുതൽ വിവരങ്ങൾ' : 'More information')}</summary>
              {isOwner && <p className="my-3 text-sm text-white/65 leading-relaxed">{language === 'ml' ? 'വിശദമായ വായന മുകളിലുണ്ട്. ഇവിടെ പഴയ രേഖകൾ അതേപടി സൂക്ഷിച്ചിരിക്കുന്നു; ചില രേഖകളുടെ പരിഭാഷയും സ്രോതസ്സ് പരിശോധനയും ബാക്കിയുണ്ട്. ഇത് മുഴുവൻ കാർഡും ശൂന്യമാണെന്നോ വിവരങ്ങൾ നഷ്ടമായെന്നോ അർഥമാക്കുന്നില്ല.' : 'The detailed reading is above. Earlier records are preserved here; some still need translation or source review. This does not mean the whole card is empty or its content is lost.'}</p>}
              <HolyOneScholarlySections card={name} pendingOnly />
            </details>
          </div>
        )}

      </motion.div>
      </HolyNamesLanguageContext.Provider>
    </PageLayout>
  );
}
