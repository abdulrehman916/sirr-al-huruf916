// ═══════════════════════════════════════════════════════════════
// ZODIAC DETAIL CARD — Single sign expandable with ALL manuscript data
// Havâss (basic properties) + GIH (favorable items, health, rituals, compatibility)
// Arabic names preserved; Turkish never shown to users
// ═══════════════════════════════════════════════════════════════
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { zodiacEnToML, signsToML, elementToML, PLANET_AR_ML } from "@/lib/astroClockLabelMap";
import { GIH_SIGN_PROPERTIES, GIH_ZODIAC_RELATIONSHIPS, GIH_ZODIAC_PROPERTIES, GIH_ELEMENT_RELATIONSHIPS, GIH_TWELVE_HOUSES, GIH_RITUAL_INCENSE } from "@/lib/gizliIlimlerHazinesiZodiacData";
import EntityKnowledgePanel from "./EntityKnowledgePanel";
import MagicalPeriodPanel from "./MagicalPeriodPanel";
import AstroClockCategoryVisuals from "@/components/astroclock/AstroClockCategoryVisuals";
import { normalizeDisplay, normalizeArray } from "@/lib/astroClockLanguageNormalizer";
import { useIsOwner } from "@/hooks/useIsOwner";

function TagList({ items, color }) {
  if (!items?.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((c, i) => (
        <span key={i} className="font-inter text-[9px] px-1.5 py-0.5 rounded"
          style={{ background: color + "0D", color: color + "AA" }}>{c}</span>
      ))}
    </div>
  );
}

export default function ZodiacDetailCard({ signKey, zodiacData, isCurrent, isExpanded, onToggle }) {
  const { txt, language } = useAstroClockLanguage();
  const isOwner = useIsOwner();
  if (!zodiacData) return null;

  const gih = GIH_SIGN_PROPERTIES[signKey] || {};
  const gihRel = GIH_ZODIAC_RELATIONSHIPS.find(r => r.sign_en === zodiacData.name_en);

  const zName = language === "ml" ? zodiacEnToML(zodiacData.name_en) : language === "ar" ? (zodiacData.name_ar || "") : zodiacData.name_en;
  const zElement = normalizeDisplay(language === "ml" ? zodiacData.element_ml : zodiacData.element);
  const zGender = normalizeDisplay(language === "ml" ? zodiacData.gender_ml : zodiacData.gender);
  const zRuler = normalizeDisplay(language === "ml" ? zodiacData.ruling_planet_ml : zodiacData.ruling_planet);
  const zMetal = normalizeDisplay(language === "ml" ? zodiacData.metal_ml : zodiacData.metal);
  const zIncense = normalizeDisplay(language === "ml" ? zodiacData.incense_ml : zodiacData.incense);
  const zExplanation = language === "ar" ? "" : normalizeDisplay(language === "ml" ? zodiacData.explanation_ml : zodiacData.explanation_en);
  const friendlyDisplay = language === "ml"
    ? (signsToML(zodiacData.friendly_signs).join(", ") || "—")
    : (zodiacData.friendly_signs?.join(", ") || "—");
  const enemyDisplay = language === "ml"
    ? (signsToML(zodiacData.enemy_signs).join(", ") || "—")
    : (zodiacData.enemy_signs?.join(", ") || "—");

  const color = isCurrent ? "#F5D060" : "rgba(255,255,255,0.70)";
  const borderColor = isCurrent ? "rgba(212,175,55,0.40)" : "rgba(255,255,255,0.08)";
  const G = "#D4AF37";
  const G_DIM = "rgba(212,175,55,0.50)";

  return (
    <div className="rounded-lg overflow-hidden" style={{
      background: isCurrent ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${borderColor}`,
    }}>
      <button onClick={onToggle} className="w-full flex items-center gap-2 p-2.5 text-left">
        <span className="text-lg leading-none w-7 text-center">{zodiacData.symbol}</span>
        <div className="flex-1 min-w-0">
          <span className="font-inter text-xs font-bold block truncate" style={{ color }}>{zName}</span>
          <span className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.40)" }}>{zElement} · {zRuler}</span>
        </div>
        {language === "en" && <span className="font-amiri text-sm" style={{ color: "rgba(212,175,55,0.50)" }}>{zodiacData.name_ar}</span>}
        {isCurrent && <span className="font-inter text-[7px] uppercase px-1.5 py-0.5 rounded"
          style={{ background: "rgba(212,175,55,0.15)", color: "#F5D060" }}>{txt("നിലവിലെ", "Now", "Şimdi")}</span>}
        <ChevronDown className="w-3.5 h-3.5 transition-transform flex-shrink-0"
          style={{ color: "rgba(212,175,55,0.40)", transform: isExpanded ? "rotate(180deg)" : "none" }} />
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="px-2.5 pb-2.5 space-y-2">
              {/* ── Basic Properties (Havâss) ── */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("മൂലകം", "Element", "Element")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{zElement}</span></div>
                <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("ലിംഗം", "Gender", "Gender")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{zGender}</span></div>
                <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("ലോഹം", "Metal", "Metal")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{zMetal}</span></div>
                <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("നാഥൻ", "Ruler", "Ruler")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{zRuler}</span></div>
                <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("സുഗന്ധം", "Incense", "Incense")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{zIncense}</span></div>
                <div><span className="font-bold" style={{ color: "rgba(255,255,255,0.40)" }}>{txt("അക്ഷരങ്ങൾ", "Letters", "Letters")}: </span><span className="font-amiri" style={{ color: "rgba(255,255,255,0.65)" }}>{zodiacData.letters?.join(" ") || "—"}</span></div>
              </div>

              {zExplanation && (
                <p className="font-inter text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{zExplanation}</p>
              )}

              {/* ── Havâss Friendships ── */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="rounded p-1.5" style={{ background: "rgba(74,222,128,0.04)" }}>
                  <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(74,222,128,0.50)" }}>{txt("സൌഹൃദ", "Friendly", "Friendly")}</p>
                  <p className="font-inter text-[9px]" style={{ color: "rgba(74,222,128,0.70)" }}>{friendlyDisplay}</p>
                </div>
                <div className="rounded p-1.5" style={{ background: "rgba(248,113,113,0.04)" }}>
                  <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(248,113,113,0.50)" }}>{txt("ശത്രു", "Enemy", "Enemy")}</p>
                  <p className="font-inter text-[9px]" style={{ color: "rgba(248,113,113,0.70)" }}>{enemyDisplay}</p>
                </div>
              </div>

              {/* ── GIH Favorable Properties ── */}
              {language === "en" && gih.favorable_colors?.length > 0 && (
                <div>
                  <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: G_DIM }}>📖 {txt("അനുകൂല നിറങ്ങൾ", "Favorable Colors", "Colors")} {isOwner && <>(GIH p.{gih.source_page})</>}</p>
                  <TagList items={normalizeArray(gih.favorable_colors)} color={G} />
                </div>
              )}
              {language === "en" && gih.favorable_stones?.length > 0 && (
                <div>
                  <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: G_DIM }}>📖 {txt("അനുകൂല രത്നങ്ങൾ", "Favorable Stones", "Stones")} {isOwner && <>(GIH p.{gih.source_page})</>}</p>
                  <TagList items={normalizeArray(gih.favorable_stones)} color={G} />
                </div>
              )}
              {language === "en" && gih.favorable_metals?.length > 0 && (
                <div>
                  <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: G_DIM }}>📖 {txt("അനുകൂല ലോഹങ്ങൾ", "Favorable Metals", "Metals")} {isOwner && <>(GIH p.{gih.source_page})</>}</p>
                  <TagList items={normalizeArray(gih.favorable_metals)} color={G} />
                </div>
              )}

              {/* ── GIH Favorable Days, Numbers, Hour, Months ── */}
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                {language === "en" && gih.favorable_days?.length > 0 && (
                  <div><span className="font-bold" style={{ color: G_DIM }}>📖 {txt("ദിവസങ്ങൾ", "Days", "Days")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{normalizeArray(gih.favorable_days).join(", ")}</span></div>
                )}
                {gih.favorable_number != null && (
                  <div><span className="font-bold" style={{ color: G_DIM }}>📖 {txt("സംഖ്യ", "Number", "Number")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{gih.favorable_number}</span></div>
                )}
                {gih.favorable_hour_planet && (
                  <div><span className="font-bold" style={{ color: G_DIM }}>📖 {txt("ഗ്രഹമണിക്കൂർ", "Hour Planet", "Hour")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{language === "ml" ? (PLANET_AR_ML[gih.favorable_hour_planet?.toLowerCase()]?.ml || gih.favorable_hour_planet) : gih.favorable_hour_planet}</span></div>
                )}
                {language === "en" && gih.favorable_months?.length > 0 && (
                  <div><span className="font-bold" style={{ color: G_DIM }}>📖 {txt("മാസങ്ങൾ", "Months", "Months")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{gih.favorable_months.join(", ")}</span></div>
                )}
                {language === "en" && gih.favorable_night && (
                  <div><span className="font-bold" style={{ color: G_DIM }}>📖 {txt("രാത്രി", "Fav. Night", "Night")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{gih.favorable_night}</span></div>
                )}
                {language === "en" && gih.favorable_incense?.length > 0 && (
                  <div><span className="font-bold" style={{ color: G_DIM }}>📖 {txt("തൂപം", "Incense", "Incense")}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{normalizeArray(gih.favorable_incense).join(", ")}</span></div>
                )}
              </div>

              {/* ── GIH Health Vulnerabilities ── */}
              {language === "en" && gih.health_vulnerabilities_en?.length > 0 && (
                <div>
                  <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(248,113,113,0.50)" }}>📖 {txt("ആരോഗ്യ ദൗർബല്യങ്ങൾ", "Health Vulnerabilities", "Health")} {isOwner && <>(GIH p.{gih.source_page})</>}</p>
                  <TagList items={normalizeArray(gih.health_vulnerabilities_en)} color="#F87171" />
                </div>
              )}

              {/* ── GIH Ritual Timing ── */}
              {language === "en" && gih.ritual_timing_note_en && (
                <div className="rounded-lg p-2" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.12)" }}>
                  <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(129,140,248,0.60)" }}>📖 {txt("ആചാര സമയം", "Ritual Timing", "Ritual")} {isOwner && <>(GIH p.{gih.source_page})</>}</p>
                  <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>{gih.ritual_timing_note_en}</p>
                  {gih.ritual_day && (
                    <p className="font-inter text-[9px] mt-0.5" style={{ color: "rgba(129,140,248,0.50)" }}>{txt("ദിവസം", "Day", "Day")}: {gih.ritual_day}</p>
                  )}
                </div>
              )}

              {/* ── GIH Compatibility ── */}
              {gih.compatible_signs_en?.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="rounded p-1.5" style={{ background: "rgba(74,222,128,0.04)" }}>
                    <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(74,222,128,0.50)" }}>📖 {txt("അനുയോജ്യം (GIH)", "Compatible (GIH)", "Compatible")}</p>
                    <p className="font-inter text-[9px]" style={{ color: "rgba(74,222,128,0.70)" }}>{language === "ml" ? signsToML(gih.compatible_signs_en).join(", ") : gih.compatible_signs_en.join(", ")}</p>
                  </div>
                  <div className="rounded p-1.5" style={{ background: "rgba(248,113,113,0.04)" }}>
                    <p className="font-inter text-[8px] uppercase tracking-wider font-bold" style={{ color: "rgba(248,113,113,0.50)" }}>📖 {txt("അനനുകൂലം (GIH)", "Incompatible (GIH)", "Incompatible")}</p>
                    <p className="font-inter text-[9px]" style={{ color: "rgba(248,113,113,0.70)" }}>{language === "ml" ? (signsToML(gih.incompatible_signs_en || []).join(", ") || "—") : (gih.incompatible_signs_en?.join(", ") || "—")}</p>
                  </div>
                </div>
              )}

              {/* ── GIH Zodiac Relationship (p.1418) ── */}
              {gihRel && (
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div><span className="font-bold" style={{ color: G_DIM }}>📖 GIH {txt("സുഹൃത്", "Friend", "Friend")} {isOwner && <>(p.{gihRel.source_page})</>}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{language === "ml" ? zodiacEnToML(gihRel.friendly_sign_en) : gihRel.friendly_sign_en}</span></div>
                  <div><span className="font-bold" style={{ color: G_DIM }}>📖 GIH {txt("ശത്രു", "Enemy", "Enemy")} {isOwner && <>(p.{gihRel.source_page})</>}: </span><span style={{ color: "rgba(255,255,255,0.65)" }}>{language === "ml" ? zodiacEnToML(gihRel.enemy_sign_en) : gihRel.enemy_sign_en}</span></div>
                </div>
              )}

              {/* ── GIH Zodiac Classification (Cardinal/Fixed/Mutable, Triplicity, Gender, Hemisphere) ── */}
              {(() => {
                const signName = zodiacData.name_en;
                const props = GIH_ZODIAC_PROPERTIES;
                const classifications = [];
                if (props.munkalibe_signs.signs.includes(signName)) classifications.push({ label: txt("മാറ്റായ്വരുന്ന", "Cardinal", "Cardinal"), page: props.munkalibe_signs.source_page });
                if (props.sabite_signs.signs.includes(signName)) classifications.push({ label: txt("സ്ഥിരം", "Fixed", "Fixed"), page: props.sabite_signs.source_page });
                if (props.mumtezic_signs.signs.includes(signName)) classifications.push({ label: txt("മിശ്രം", "Mutable", "Mutable"), page: props.mumtezic_signs.source_page });
                if (props.nar_teslisler.signs.includes(signName)) classifications.push({ label: `${language === "ml" ? elementToML(props.nar_teslisler.element) : props.nar_teslisler.element} ${txt("ത്രികോണം", "Triplicity", "Triplicity")}`, page: props.nar_teslisler.source_page });
                if (props.turab_teslisler.signs.includes(signName)) classifications.push({ label: `${language === "ml" ? elementToML(props.turab_teslisler.element) : props.turab_teslisler.element} ${txt("ത്രികോണം", "Triplicity", "Triplicity")}`, page: props.turab_teslisler.source_page });
                if (props.heva_teslisler.signs.includes(signName)) classifications.push({ label: `${language === "ml" ? elementToML(props.heva_teslisler.element) : props.heva_teslisler.element} ${txt("ത്രികോണം", "Triplicity", "Triplicity")}`, page: props.heva_teslisler.source_page });
                if (props.maiyye_teslisler.signs.includes(signName)) classifications.push({ label: `${language === "ml" ? elementToML(props.maiyye_teslisler.element) : props.maiyye_teslisler.element} ${txt("ത്രികോണം", "Triplicity", "Triplicity")}`, page: props.maiyye_teslisler.source_page });
                if (props.masculine_signs.signs.includes(signName)) classifications.push({ label: txt("പുരുഷ/പകൽ", "Masculine/Day", "Masculine"), page: props.masculine_signs.source_page });
                if (props.feminine_signs.signs.includes(signName)) classifications.push({ label: txt("സ്ത്രീ/രാത്രി", "Feminine/Night", "Feminine"), page: props.feminine_signs.source_page });
                if (props.northern_signs.signs.includes(signName)) classifications.push({ label: txt("വടക്കൻ", "Northern", "Northern"), page: props.northern_signs.source_page });
                if (props.southern_signs.signs.includes(signName)) classifications.push({ label: txt("തെക്കൻ", "Southern", "Southern"), page: props.southern_signs.source_page });
                const horizonMin = props.horizon_minutes.durations[signName];
                if (classifications.length === 0 && !horizonMin) return null;
                return (
                  <div className="flex flex-wrap gap-1">
                    {classifications.map((c, i) => (
                      <span key={i} className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.08)", color: "rgba(212,175,55,0.70)" }}>{isOwner && "📖 "}{c.label} {isOwner && <span style={{ color: "rgba(74,222,128,0.35)" }}>p.{c.page}</span>}</span>
                    ))}
                    {horizonMin && (
                      <span className="font-inter text-[9px] px-1.5 py-0.5 rounded" style={{ background: "rgba(129,140,248,0.08)", color: "rgba(129,140,248,0.70)" }}>{isOwner && "📖 "}{txt("ഷാഫക് സമയം", "Horizon Duration", "Horizon")}: {horizonMin}m {isOwner && <span style={{ color: "rgba(74,222,128,0.35)" }}>p.1419</span>}</span>
                    )}
                  </div>
                );
              })()}

              {/* ── GIH Element Relationship (p.1419) ── */}
              {(() => {
                const elemKey = (zodiacData.element || "").toLowerCase();
                const elemRel = GIH_ELEMENT_RELATIONSHIPS[elemKey];
                if (!elemRel) return null;
                return (
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div><span className="font-bold" style={{ color: G_DIM }}>📖 GIH {txt("മൂലക സുഹൃത്", "Elem. Friend", "Elem Friend")} {isOwner && <>(p.{elemRel.source_page})</>}: </span><span style={{ color: "rgba(74,222,128,0.70)" }}>{language === "ml" ? elementToML(elemRel.friend) : elemRel.friend}</span></div>
                    <div><span className="font-bold" style={{ color: G_DIM }}>📖 GIH {txt("മൂലക ശത്രു", "Elem. Enemy", "Elem Enemy")} {isOwner && <>(p.{elemRel.source_page})</>}: </span><span style={{ color: "rgba(248,113,113,0.70)" }}>{language === "ml" ? elementToML(elemRel.enemy) : elemRel.enemy}</span></div>
                  </div>
                );
              })()}

              {/* ── GIH 12-House Rulership (pp.1429-1432) ── */}
              {(() => {
                const house = GIH_TWELVE_HOUSES.houses.find(h => h.sign_en === zodiacData.name_en);
                if (!house) return null;
                return (
                  <div className="rounded-lg p-2" style={{ background: "rgba(129,140,248,0.04)", border: "1px solid rgba(129,140,248,0.12)" }}>
                    <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "rgba(129,140,248,0.60)" }}>📖 {txt("12-ാം ഭവനം", "12th House Rulership", "12th House")} {isOwner && <>(GIH p.{GIH_TWELVE_HOUSES.source_page})</>}</p>
                    <p className="font-inter text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>#{house.hane} — {txt("ഭവനം", "House", "House")} · {txt("ഗ്രഹം", "Planet", "Planet")}: {language === "ml" ? (PLANET_AR_ML[house.planet_en?.toLowerCase()]?.ml || house.planet_en) : house.planet_en}</p>
                  </div>
                );
              })()}

              {/* ── GIH Ritual Incense (per-sign protection ritual) ── */}
              {(() => {
                const ritual = GIH_RITUAL_INCENSE.universal_protection_ritual[`${signKey}_ritual`];
                if (!ritual || language !== "en") return null;
                return (
                  <div className="rounded-lg p-2" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
                    <p className="font-inter text-[8px] uppercase tracking-wider font-bold mb-0.5" style={{ color: G_DIM }}>📖 {txt("ആചാര തൂപം", "Ritual Incense", "Ritual Incense")} {isOwner && <>(GIH p.{ritual.source_page})</>}</p>
                    <p className="font-inter text-[9px]" style={{ color: "rgba(255,255,255,0.55)" }}>{txt("തൂപം", "Incense", "Incense")}: {ritual.incense.join(", ")}</p>
                    <p className="font-inter text-[9px]" style={{ color: "rgba(129,140,248,0.55)" }}>{txt("സമയം", "Timing", "Timing")}: {ritual.timing}</p>
                  </div>
                );
              })()}

              {/* Magical period from manuscript (if available) */}
              <MagicalPeriodPanel entityType="zodiac" entityKey={zodiacData.name_en} />

              {/* Entity Knowledge from unified ingestion pipeline */}
              <EntityKnowledgePanel entityType="zodiac" entityKey={zodiacData.name_en} />

              {/* Source visuals (rashi table, zodiac diagram) attached to zodiac records */}
              <AstroClockCategoryVisuals categories={['zodiac']} entityAliases={[]} />

              {/* ── Source References ── */}
              <div className="pt-2" style={{ borderTop: "1px solid rgba(212,175,55,0.10)" }}>
                {isOwner && language === "en" && <p className="font-inter text-[8px]" style={{ color: "rgba(74,222,128,0.35)" }}>📖 {normalizeDisplay("Havâss'ın Derinlikleri")} — {zodiacData.date_range}</p>}
                {isOwner && language === "en" && gih.source && <p className="font-inter text-[8px]" style={{ color: "rgba(74,222,128,0.35)" }}>📖 {normalizeDisplay(gih.source)} — pp.{gih.source_page}</p>}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}