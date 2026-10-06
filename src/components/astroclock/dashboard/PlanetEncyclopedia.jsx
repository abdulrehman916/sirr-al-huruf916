// ═══════════════════════════════════════════════════════════════
// SECTION 7 — PLANET ENCYCLOPEDIA (UNIFIED TOPIC MODEL)
// One card per planet. Content is organized BY TOPIC, not by book.
// Every statement is tagged with its manuscript source(s).
// Where manuscripts AGREE, the fact is shown once with all sources.
// Where manuscripts CONTRADICT, each opinion is shown separately.
// Unique additions from a single manuscript are appended under the
// topic with that manuscript's label. No calculations or data changed.
// ═══════════════════════════════════════════════════════════════
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useAstroData } from "./useAstroData";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import ManuscriptSourcePanel from "./ManuscriptSourcePanel";
import { normalizeDisplay, normalizeArray } from "@/lib/astroClockLanguageNormalizer";
import { getKashfOperationsForPlanet, getKashfDirectionForElement } from "@/lib/astroClockManuscriptMerger";
import { elementToML, planetArabicMLDisplay, PLANET_AR_ML } from "@/lib/astroClockLabelMap";
import { GIH_PLANET_INFLUENCE_CHARACTERISTICS, GIH_PLANET_RELATIONSHIPS, GIH_VENUS_VEFK, GIH_SUN_DEGREE_TABLE } from "@/lib/gizliIlimlerHazinesiZodiacData";
import EntityKnowledgePanel from "./EntityKnowledgePanel";
import MagicalPeriodPanel from "./MagicalPeriodPanel";
import AstroClockCategoryVisuals from "@/components/astroclock/AstroClockCategoryVisuals";
import { useIsOwner } from "@/hooks/useIsOwner";

const PLANET_ORDER = ["sun", "moon", "mars", "mercury", "jupiter", "venus", "saturn"];

// ── Source tag ── small, language-aware label proving provenance on every fact
const SRC_HAVASS = { key: "havass", short: { en: "Havâss", ml: "ഹാവാസ്സ്", ar: "هواس" }, color: "#D4AF37" };
const SRC_GIH = { key: "gih", short: { en: "GIH", ml: "GIH", ar: "GIH" }, color: "#818CF8" };
const SRC_KASHF = { key: "kashf", short: { en: "Kashf", ml: "കശ്ഫ്", ar: "كشف" }, color: "#C084FC" };

function Src({ src, page, language, isOwner }) {
  const label = src.short[language] || src.short.en;
  return (
    <span className="font-inter text-[7px] uppercase tracking-wider px-1 py-0.5 rounded align-middle" style={{
      background: src.color + "14", color: src.color + "AA", border: `1px solid ${src.color}33`,
    }}>
      📖 {label}{isOwner && page ? ` p.${page}` : ""}
    </span>
  );
}

// ── Topic wrapper ── one heading per topic; source-tagged facts inside
function Topic({ title, children }) {
  return (
    <div className="space-y-1">
      <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(255,255,255,0.45)" }}>{title}</p>
      {children}
    </div>
  );
}

// Element derived from ruling signs (display only — not a manuscript statement)
function getPlanetElements(planetKey, zodiacSigns) {
  const elements = new Set();
  Object.values(zodiacSigns || {}).forEach(s => {
    if (s.ruling_planet?.toLowerCase() === planetKey.charAt(0).toUpperCase() + planetKey.slice(1)) {
      elements.add(s.element);
    }
  });
  return Array.from(elements);
}

export default function PlanetEncyclopedia() {
  const d = useAstroData();
  const { txt, language } = useAstroClockLanguage();
  const isOwner = useIsOwner();
  const [expanded, setExpanded] = useState(null);
  const currentPlanet = d.currentHour?.planet;

  return (
    <div className="space-y-1.5">
      {PLANET_ORDER.map(key => {
        const info = d.planetInfo[key];
        if (!info) return null;
        const friends = d.planetFriendships[key];
        const isCurrent = key === currentPlanet;
        const isOpen = expanded === key;
        const displayName = language === "ml" ? (planetArabicMLDisplay(key) || info.name_ml_equivalent) : language === "ar" ? (PLANET_AR_ML[key]?.ar || info.name_ar || "") : info.name_en;
        const nature = language === "ar" ? "—" : normalizeDisplay(language === "ml" ? info.nature_ml : info.nature_en);
        const elements = getPlanetElements(key, d.zodiacSigns);
        const color = isCurrent ? "#F5D060" : "rgba(255,255,255,0.70)";
        const borderColor = isCurrent ? "rgba(212,175,55,0.40)" : "rgba(255,255,255,0.08)";

        const goodActions = normalizeArray(language === "ml" ? info.goodActions_ml : language === "ar" ? [] : info.goodActions_en);
        const badActions = normalizeArray(language === "ml" ? info.badActions_ml : language === "ar" ? [] : info.badActions_en);

        const planetNameByLang = (p) => language === "ml" ? d.planetInfo[p]?.name_ml_equivalent : language === "ar" ? (PLANET_AR_ML[p]?.ar || d.planetInfo[p]?.name_ar || "—") : d.planetInfo[p]?.name_en;
        const friendNamesHavass = (friends?.friends || []).map(planetNameByLang);
        const enemyNamesHavass = (friends?.enemies || []).map(planetNameByLang);
        const neutralNamesHavass = (friends?.neutral || []).map(planetNameByLang);

        // GIH planet relationship (separate opinion — may contradict Havâss)
        const gihRel = GIH_PLANET_RELATIONSHIPS.find(r => r.planet_en === info.name_en);
        const gihFriend = gihRel ? (language === "ml" ? (PLANET_AR_ML[gihRel.friend_en?.toLowerCase()]?.ml || gihRel.friend_en) : gihRel.friend_en) : null;
        const gihEnemy = gihRel ? (language === "ml" ? (PLANET_AR_ML[gihRel.enemy_en?.toLowerCase()]?.ml || gihRel.enemy_en) : gihRel.enemy_en) : null;

        const kashfOps = getKashfOperationsForPlanet(key);
        const kashfDir = getKashfDirectionForElement(elements[0]);
        const infl = GIH_PLANET_INFLUENCE_CHARACTERISTICS[key];

        return (
          <div key={key} className="rounded-lg overflow-hidden" style={{
            background: isCurrent ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${borderColor}`,
          }}>
            <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center gap-2 p-2.5 text-left">
              <span className="text-lg leading-none w-7 text-center">{info.symbol}</span>
              <div className="flex-1 min-w-0">
                <span className="font-inter text-xs font-bold block truncate" style={{ color }}>{displayName}</span>
                <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>{nature}</span>
              </div>
              {language === "ar" && <span className="font-amiri text-sm" style={{ color: "rgba(212,175,55,0.40)" }}>{PLANET_AR_ML[key]?.ar || info.name_ar}</span>}
              {isCurrent && <span className="font-inter text-[7px] uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.15)", color: "#F5D060" }}>{txt("നിലവിലെ", "Now", "Şimdi")}</span>}
              <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0" style={{ color: "rgba(212,175,55,0.40)", transform: isOpen ? "rotate(180deg)" : "none" }} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
                  <div className="px-2.5 pb-2.5 space-y-2.5">

                    {/* ── TOPIC: Identity & Element ── */}
                    <Topic title={txt("തിരിച്ചറിയലും മൂലകവും", "Identity & Element", "Kimlik & Element")}>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                        {language === "ar" && <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("അറബി പദം", "Arabic", "العربية")}: </span><span className="font-amiri" style={{ color: "rgba(255,255,255,0.65)" }}>{PLANET_AR_ML[key]?.ar || info.name_ar}</span></div>}
                        {language === "ml" && <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("മലയാള അർത്ഥം", "Malayalam", "مالايالام")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{PLANET_AR_ML[key]?.ml || info.name_ml_equivalent}</span></div>}
                        <div>
                          <span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("മൂലകം", "Elements", "العناصر")}: </span>
                          <span style={{ color: "rgba(255,255,255,0.65)" }}>{language === "ml" ? (elements.map(e => elementToML(e)).join(", ") || "—") : language === "ar" ? "—" : (elements.join(", ") || "—")}</span>
                          <span className="ml-1"><Src src={SRC_HAVASS} page="50-51" language={language} isOwner={isOwner} /></span>
                        </div>
                      </div>
                    </Topic>

                    {/* ── TOPIC: Nature (Sa'd / Nahs) ── */}
                    <Topic title={txt("സ്വഭാവം (Sa'd / Nahs)", "Nature (Sa'd / Nahs)", "Doğa (Sa'd / Nahs)")}>
                      <p className="font-inter text-[11px]" style={{ color: "rgba(255,255,255,0.70)" }}>
                        {nature} <Src src={SRC_HAVASS} page="50-51" language={language} isOwner={isOwner} />
                      </p>
                    </Topic>

                    {/* ── TOPIC: Friendships — manuscripts CONTRADICT → shown separately ── */}
                    <Topic title={txt("ഗ്രഹ ബന്ധങ്ങൾ (രണ്ട് ഗ്രന്ഥ പട്ടികകൾ)", "Friendships (two manuscript tables)", "Gezegen İlişkileri (iki kaynak tablo)")}>
                      {/* Havâss opinion */}
                      {friends && (
                        <div className="rounded p-1.5 space-y-1" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.12)" }}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Src src={SRC_HAVASS} page="88-92" language={language} isOwner={isOwner} />
                            <div className="grid grid-cols-3 gap-1.5 w-full">
                              <div>
                                <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(74,222,128,0.50)" }}>{txt("സുഹൃത്തുകൾ", "Friends", "Dostlar")}</p>
                                <p className="font-inter text-[9px]" style={{ color: "rgba(74,222,128,0.70)" }}>{friendNamesHavass.join(", ") || "—"}</p>
                              </div>
                              <div>
                                <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(248,113,113,0.50)" }}>{txt("ശത്രു", "Enemies", "Düşmanlar")}</p>
                                <p className="font-inter text-[9px]" style={{ color: "rgba(248,113,113,0.70)" }}>{enemyNamesHavass.join(", ") || "—"}</p>
                              </div>
                              <div>
                                <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(251,191,36,0.50)" }}>{txt("നിഷ്പക്ഷം", "Neutral", "Nötr")}</p>
                                <p className="font-inter text-[9px]" style={{ color: "rgba(251,191,36,0.70)" }}>{neutralNamesHavass.join(", ") || "—"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* GIH opinion (may contradict Havâss) */}
                      {gihRel && (
                        <div className="rounded p-1.5 space-y-1" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.12)" }}>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Src src={SRC_GIH} page={gihRel.source_page} language={language} isOwner={isOwner} />
                            <div className="grid grid-cols-2 gap-1.5 w-full">
                              <div>
                                <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(74,222,128,0.50)" }}>{txt("സുഹൃത്ത്", "Friend", "Dost")}</p>
                                <p className="font-inter text-[9px]" style={{ color: "rgba(74,222,128,0.70)" }}>{gihFriend || "—"}</p>
                              </div>
                              <div>
                                <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(248,113,113,0.50)" }}>{txt("ശത്രു", "Enemy", "Düşman")}</p>
                                <p className="font-inter text-[9px]" style={{ color: "rgba(248,113,113,0.70)" }}>{gihEnemy || "—"}</p>
                              </div>
                            </div>
                          </div>
                          <p className="font-inter text-[8px] italic" style={{ color: "rgba(255,255,255,0.35)" }}>
                            {txt("ഓരോ ഗ്രന്ഥവും സ്വതന്ത്രമായ സ്രോതസ്സായി കാണിക്കുന്നു. ഹാവാസ്സ് സുഹൃത്/ശത്രു/നിരപേക്ഷ ഗ്രഹങ്ങൾ നൽകുന്നു; GIH ഒരു സുഹൃത്, ഒരു ശത്രു എന്നിവ നൽകുന്നു. വ്യത്യാസങ്ങൾ മുൻകൂട്ടി തരംതിരിക്കുന്നില്ല — ഓരോന്നും യോജിപ്പ്, കൂട്ടിച്ചേർക്കൽ, അല്ലെങ്കിൽ ഭിന്നത എന്ന് തരംതിരിക്കുന്നതിന് മുമ്പ് മൂല പേജുകൾ (ഹാവാസ്സ് പേ.88-92, GIH പേ.1419) സ്ഥിരീകരിക്കണം.", "Each manuscript is shown as an independent source. Havâss lists friends, enemies, and neutral planets; GIH lists one friend and one enemy. Differences are not pre-classified — each must be verified against the original pages (Havâss p.88-92, GIH p.1419) before being treated as agreement, addition, or disagreement.", "Her kaynak bağımsız olarak gösterilir. Havâss dost/düşman/nötr gezegenleri listeler; GIH tek dost ve tek düşman verir. Farklar önceden sınıflandırılmaz — her biri orijinal sayfalar (Havâss s.88-92, GIH s.1419) doğrulanmadan uyum, ekleme veya ayrışma olarak değerlendirilemez.")}
                          </p>
                        </div>
                      )}
                    </Topic>

                    {/* ── TOPIC: Recommended actions (Havâss) ── */}
                    {goodActions?.length > 0 && (
                      <Topic title={txt("അനുയോജ്യമായ പ്രവൃത്തികൾ", "Recommended Actions", "Önerilen Eylemler")}>
                        <div className="flex items-center gap-1 mb-1"><Src src={SRC_HAVASS} page="50-51" language={language} isOwner={isOwner} /></div>
                        <div className="flex flex-wrap gap-1">
                          {goodActions.map((a, i) => <span key={i} className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(74,222,128,0.06)", color: "rgba(74,222,128,0.65)" }}>{a}</span>)}
                        </div>
                      </Topic>
                    )}

                    {/* ── TOPIC: Actions to avoid (Havâss) ── */}
                    {badActions?.length > 0 && (
                      <Topic title={txt("ഒഴിവാക്കേണ്ട പ്രവൃത്തികൾ", "Actions to Avoid", "Kaçınılacak Eylemler")}>
                        <div className="flex items-center gap-1 mb-1"><Src src={SRC_HAVASS} page="50-51" language={language} isOwner={isOwner} /></div>
                        <div className="flex flex-wrap gap-1">
                          {badActions.map((a, i) => <span key={i} className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(248,113,113,0.06)", color: "rgba(248,113,113,0.65)" }}>{a}</span>)}
                        </div>
                      </Topic>
                    )}

                    {/* ── TOPIC: Physical & character traits (GIH — unique addition) ── */}
                    {infl && language === "en" && (
                      <Topic title={txt("ശാരീരിക-സ്വഭാവ സവിശേഷതകൾ", "Physical & Character Traits", "Fiziksel & Karakter Özellikleri")}>
                        <div className="rounded-lg p-2 space-y-1" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.15)" }}>
                          <div className="flex items-center gap-1"><Src src={SRC_GIH} page={infl.source_page} language={language} isOwner={isOwner} /></div>
                          <div>
                            <p className="font-inter text-[8px] font-bold" style={{ color: "rgba(129,140,248,0.50)" }}>{txt("ശാരീരികം", "Physical", "Fiziksel")}</p>
                            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>{infl.physical_traits_en}</p>
                          </div>
                          <div>
                            <p className="font-inter text-[8px] font-bold" style={{ color: "rgba(129,140,248,0.50)" }}>{txt("സ്വഭാവം", "Character", "Karakter")}</p>
                            <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>{infl.character_traits_en}</p>
                          </div>
                          {infl.moon_phase_note_en && (
                            <p className="font-inter text-[9px] italic" style={{ color: "rgba(129,140,248,0.55)" }}>🌙 {infl.moon_phase_note_en}</p>
                          )}
                          {infl.moon_independence_note_en && (
                            <p className="font-inter text-[9px] italic" style={{ color: "rgba(129,140,248,0.50)" }}>☾ {infl.moon_independence_note_en}</p>
                          )}
                        </div>
                      </Topic>
                    )}

                    {/* ── TOPIC: Venus talisman (GIH — Venus only) ── */}
                    {key === "venus" && (() => {
                      const v = GIH_VENUS_VEFK;
                      return (
                        <Topic title={txt("ശുക്ര വെഫ്ക് (7×7)", "Venus Talisman (7×7)", "Venus Vefki (7×7)")}>
                          <div className="rounded-lg p-2" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.15)" }}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-amiri text-lg" style={{ color: "rgba(129,140,248,0.60)" }}>{v.planet_ar}</span>
                              <Src src={SRC_GIH} page={v.source_page} language={language} isOwner={isOwner} />
                              <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.50)" }}>{txt("മാന്ത്രിക സ്ഥിരാങ്കം", "Magic Constant", "Sabit")}: {v.magic_constant}</span>
                            </div>
                            <div className="inline-block rounded overflow-hidden" style={{ border: "1px solid rgba(129,140,248,0.20)" }}>
                              {v.grid.map((row, ri) => (
                                <div key={ri} className="flex">
                                  {row.map((cell, ci) => (
                                    <span key={ci} className="font-inter text-[9px] tabular-nums w-6 h-6 flex items-center justify-center"
                                      style={{
                                        background: (ri === ci || ri + ci === 6) ? "rgba(129,140,248,0.12)" : "rgba(255,255,255,0.02)",
                                        color: (ri === ci || ri + ci === 6) ? "#A5B4FC" : "rgba(255,255,255,0.55)",
                                        borderRight: ci < 6 ? "1px solid rgba(129,140,248,0.08)" : "none",
                                        borderBottom: ri < 6 ? "1px solid rgba(129,140,248,0.08)" : "none",
                                      }}>{cell}</span>
                                  ))}
                                </div>
                              ))}
                            </div>
                            {language === "en" && <p className="font-inter text-[9px] mt-1" style={{ color: "rgba(255,255,255,0.50)" }}>{v.ritual_timing_en}</p>}
                          </div>
                        </Topic>
                      );
                    })()}

                    {/* ── TOPIC: Sun degree method (GIH — Sun only) ── */}
                    {key === "sun" && language === "en" && (() => {
                      const t = GIH_SUN_DEGREE_TABLE;
                      return (
                        <Topic title={txt("സൂര്യ ഡിഗ്രി പട്ടിക", "Sun Degree Method", "Güneş Derece Yöntemi")}>
                          <div className="rounded-lg p-2" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.15)" }}>
                            <div className="flex items-center gap-1 mb-1"><Src src={SRC_GIH} page={t.source_page} language={language} isOwner={isOwner} /></div>
                            <p className="font-inter text-[9px] mb-1" style={{ color: "rgba(255,255,255,0.50)" }}>{t.method}</p>
                            <div className="grid grid-cols-3 gap-0.5">
                              {t.monthly_reference.map((m, i) => (
                                <span key={i} className="font-inter text-[8px]" style={{ color: "rgba(255,255,255,0.50)" }}>{m.month_en}: {m.sign_en} (+{m.degree_offset}°)</span>
                              ))}
                            </div>
                          </div>
                        </Topic>
                      );
                    })()}

                    {/* ── TOPIC: Kashf operations & direction (Kashf — unique addition) ── */}
                    {(kashfOps.length > 0 || kashfDir) && (
                      <Topic title={txt("കശ്ഫ് പ്രയോഗങ്ങളും ദിശയും", "Kashf Operations & Direction", "Kashf Uygulamaları & Yön")}>
                        <ManuscriptSourcePanel
                          sources={[{
                            id: "kashf",
                            label: txt("കശ്ഫ് അൽ-ഹഖാഇഖ് (ഒമാൻ)", "Kashf al-Haqa'iq (Omani)", "Kashf al-Haqa'iq (Omani)"),
                            items: [
                              ...(kashfDir ? [{ ...kashfDir, type: "info" }] : []),
                              ...kashfOps.map(op => ({ ...op, type: "info" })),
                            ]
                          }]}
                        />
                      </Topic>
                    )}

                    {/* ── Preserved sub-panels (unchanged) ── */}
                    <MagicalPeriodPanel entityType="planet" entityKey={key} />
                    <EntityKnowledgePanel entityType="planet" entityKey={key} />
                    <AstroClockCategoryVisuals
                      categories={['gemstones', 'metals', 'planetary relationships', 'planet']}
                      entityAliases={[key]}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
