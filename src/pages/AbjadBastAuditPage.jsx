import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { 
  MANUSCRIPT_METADATA,
  EBCEDI_KEBIR,
  EBCEDI_SAGHIR,
  BAST_MANUSCRIPT,
  LETTER_NAMES_CUMELI,
  SAKIT_LETTERS,
} from "../lib/manuscriptAbjadData";
import { istintak, GALIB_ANASIR_VALUES } from "../lib/mizaanPostEngine";

// Design tokens
const G = {
  gold: "#F5D060",
  goldDim: "rgba(245,208,96,0.55)",
  goldFaint: "rgba(245,208,96,0.12)",
  goldBorder: "rgba(212,175,55,0.40)",
  goldBorderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.18)",
  bg: "rgba(3,6,20,0.99)",
  bgCard: "rgba(8,16,40,0.98)",
  bgInner: "rgba(212,175,55,0.06)",
  green: "#4ADE80",
  greenDim: "rgba(74,222,128,0.15)",
  blue: "#93C5FD",
  blueDim: "rgba(147,197,253,0.15)",
  dim: "rgba(255,255,255,0.35)",
  red: "#F87171",
  purple: "#C4B5FD",
};

function SectionHeader({ label, arabic, step, color = G.gold }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg font-inter text-xs font-black flex-shrink-0"
        style={{ background: color + "22", border: `1px solid ${color}55`, color }}>
        {step}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-inter text-[9px] uppercase tracking-[0.2em] font-bold" style={{ color }}>{label}</span>
          {arabic && <span className="font-amiri text-sm" style={{ color: G.goldDim }}>{arabic}</span>}
        </div>
      </div>
      <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(to right, ${color}40, transparent)` }} />
    </div>
  );
}

function Card({ children, accent, title }) {
  return (
    <div className="rounded-xl border p-4"
      style={{
        background: G.bgCard,
        borderColor: accent ? accent + "55" : G.goldBorder,
        borderLeft: accent ? `3px solid ${accent}` : undefined,
        boxShadow: `0 2px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,175,55,0.05)`,
      }}>
      {title && (
        <div className="mb-3 pb-2 border-b" style={{ borderColor: G.goldBorder + "40" }}>
          <h3 className="font-inter text-[9px] uppercase tracking-widest font-bold" style={{ color: accent || G.gold }}>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

function LetterCell({ letter, color = G.gold, size = "md" }) {
  const sizeClasses = {
    sm: "w-7 h-7 text-base",
    md: "w-9 h-9 text-xl",
    lg: "w-11 h-11 text-2xl",
    xl: "w-14 h-14 text-3xl",
  };
  return (
    <div className={`${sizeClasses[size]} rounded-lg border flex items-center justify-center font-amiri font-bold flex-shrink-0`}
      style={{ background: G.bgInner, borderColor: color + "55", color }}>
      <span dir="rtl">{letter}</span>
    </div>
  );
}

function OrnamentalDivider() {
  return (
    <div className="flex items-center justify-center gap-2 py-1">
      <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${G.goldBorder})` }} />
      <span style={{ color: G.goldDim, fontSize: 10 }}>✦</span>
      <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${G.goldBorder})` }} />
    </div>
  );
}

function ManuscriptBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-4"
      style={{ background: G.goldFaint, borderColor: G.goldBorderHi }}>
      <span className="font-inter text-[7px] uppercase tracking-wider font-bold" style={{ color: G.gold }}>
        ✓ Manuscript Locked
      </span>
      <span className="font-inter text-[7px]" style={{ color: G.goldDim }}>
        Pages {MANUSCRIPT_METADATA.sourcePages.join(", ")}
      </span>
    </div>
  );
}

export default function AbjadBastAuditPage() {
  const [activeTab, setActiveTab] = useState("kebir");

  const letters = useMemo(() => {
    return Object.keys(EBCEDI_KEBIR).sort();
  }, []);

  const tabs = [
    { id: "kebir", label: "Ebcedi Kebir", arabic: "الكبير", color: G.gold },
    { id: "saghir", label: "Ebcedi Sağir", arabic: "الصغير", color: G.blue },
    { id: "bast1", label: "Birinci Bast", arabic: "الأول", color: G.green },
    { id: "bast2", label: "İkinci Bast", arabic: "الثاني", color: G.purple },
    { id: "bast3", label: "Üçüncü Bast", arabic: "الثالث", color: G.red },
    { id: "bast4", label: "Dördüncü Bast", arabic: "الرابع", color: G.gold },
    { id: "bast5", label: "Beşinci Bast", arabic: "الخامس", color: G.blue },
  ];

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-6">
        
        <PageTitle
          arabic="جدول الأبجد والبسط"
          latin="ABJAD & BAST TABLES"
          subtitle="Manuscript-Locked Reference Data"
          icon="✦"
        />

        <div className="text-center">
          <ManuscriptBadge />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 justify-center flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-3 py-2 rounded-lg border font-inter text-[7px] uppercase tracking-wider font-semibold flex items-center gap-2 transition-all"
              style={{
                background: activeTab === tab.id ? tab.color + "18" : "transparent",
                borderColor: activeTab === tab.id ? tab.color + "60" : G.goldBorder + "40",
                color: activeTab === tab.id ? tab.color : G.dim,
              }}
            >
              <span>{tab.label}</span>
              <span className="font-amiri text-sm" style={{ color: activeTab === tab.id ? tab.color : G.goldDim }}>{tab.arabic}</span>
            </button>
          ))}
        </div>

        {/* ══ EBCEDİ KEBIR TAB ══ */}
        {activeTab === "kebir" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card accent={G.gold} title="EBCEDİ KEBİR / الأبجد الكبير">
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${G.goldBorder}` }}>
                      <th className="font-inter text-[7px] uppercase tracking-widest text-center py-2 px-2" style={{ color: G.dim }}>Letter</th>
                      <th className="font-inter text-[7px] uppercase tracking-widest text-right py-2 px-2" style={{ color: G.dim }}>Value</th>
                      <th className="font-inter text-[7px] uppercase tracking-widest text-left py-2 px-2" style={{ color: G.dim }}>Arabic Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {letters.map((letter, i) => (
                      <tr key={letter} style={{ borderBottom: `1px solid ${G.goldBorder}22`, background: i % 2 === 0 ? "transparent" : G.bgInner + "55" }}>
                        <td className="py-2 px-2 text-center">
                          <LetterCell letter={letter} size="md" />
                        </td>
                        <td className="font-inter tabular-nums text-right py-2 px-2 font-bold" style={{ color: G.gold, fontSize: 12 }}>{EBCEDI_KEBIR[letter].toLocaleString()}</td>
                        <td className="font-amiri text-lg text-left py-2 px-2" style={{ color: G.goldDim, direction: "rtl" }}>{LETTER_NAMES_CUMELI[letter]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ══ EBCEDİ SAĞIR TAB ══ */}
        {activeTab === "saghir" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card accent={G.blue} title="EBCEDİ SAĞİR / الأبجد الصغير">
              <div className="mb-3 p-3 rounded-lg border" style={{ background: G.blueDim, borderColor: G.blue + "40" }}>
                <p className="font-inter text-[8px] uppercase tracking-wider" style={{ color: G.dim }}>
                  Sakıt (Silent) Letters: <span style={{ color: G.red, fontWeight: "bold" }}>{SAKIT_LETTERS.join(", ")}</span>
                </p>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${G.blue}60` }}>
                      <th className="font-inter text-[7px] uppercase tracking-widest text-center py-2 px-2" style={{ color: G.dim }}>Letter</th>
                      <th className="font-inter text-[7px] uppercase tracking-widest text-right py-2 px-2" style={{ color: G.dim }}>Value</th>
                      <th className="font-inter text-[7px] uppercase tracking-widest text-left py-2 px-2" style={{ color: G.dim }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {letters.map((letter, i) => {
                      const value = EBCEDI_SAGHIR[letter];
                      const isSakit = value === 0;
                      return (
                        <tr key={letter} style={{ borderBottom: `1px solid ${G.blue}22`, background: i % 2 === 0 ? "transparent" : G.bgInner + "55" }}>
                          <td className="py-2 px-2 text-center">
                            <LetterCell letter={letter} size="md" color={G.blue} />
                          </td>
                          <td className="font-inter tabular-nums text-right py-2 px-2 font-bold" style={{ color: isSakit ? G.red : G.blue, fontSize: 12 }}>{value.toLocaleString()}</td>
                          <td className="text-left py-2 px-2">
                            {isSakit ? (
                              <span className="font-inter text-[7px] uppercase tracking-wider font-bold px-2 py-1 rounded" style={{ background: G.red + "22", color: G.red }}>Sakıt</span>
                            ) : (
                              <span className="font-inter text-[7px] uppercase tracking-wider font-bold px-2 py-1 rounded" style={{ background: G.green + "22", color: G.green }}>Active</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ══ BAST TABLES (1-5) ══ */}
        {activeTab.startsWith("bast") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {(() => {
              const bastNum = parseInt(activeTab.replace("bast", ""));
              const bastColors = {
                1: G.green,
                2: G.purple,
                3: G.red,
                4: G.gold,
                5: G.blue,
              };
              const color = bastColors[bastNum];
              const bastLabels = {
                1: "BİRİNCİ BAST / البسط الأول",
                2: "İKİNCİ BAST / البسط الثاني",
                3: "ÜÇÜNCÜ BAST / البسط الثالث",
                4: "DÖRDÜNCÜ BAST / البسط الرابع",
                5: "BEŞİNCİ BAST / البسط الخامس",
              };

              return (
                <Card accent={color} title={bastLabels[bastNum]}>
                  <div className="overflow-x-auto">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${color}60` }}>
                          <th className="font-inter text-[7px] uppercase tracking-widest text-center py-2 px-2" style={{ color: G.dim }}>Letter</th>
                          <th className="font-inter text-[7px] uppercase tracking-widest text-right py-2 px-2" style={{ color: G.dim }}>Ebcedi Kebir</th>
                          <th className="font-inter text-[7px] uppercase tracking-widest text-right py-2 px-2" style={{ color: G.dim }}>Bast Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {letters.map((letter, i) => {
                          const bastData = BAST_MANUSCRIPT[letter];
                          const bastValue = bastData[`bast${bastNum}`];
                          return (
                            <tr key={letter} style={{ borderBottom: `1px solid ${color}22`, background: i % 2 === 0 ? "transparent" : G.bgInner + "55" }}>
                              <td className="py-2 px-2 text-center">
                                <LetterCell letter={letter} size="md" color={color} />
                              </td>
                              <td className="font-inter tabular-nums text-right py-2 px-2" style={{ color: G.goldDim, fontSize: 10 }}>{bastData.kebir.toLocaleString()}</td>
                              <td className="font-inter tabular-nums text-right py-2 px-2 font-bold" style={{ color, fontSize: 12 }}>{bastValue.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              );
            })()}
          </motion.div>
        )}

        {/* ══ MANUSCRIPT LOCK NOTICE ══ */}
        <div className="pt-6 border-t" style={{ borderColor: G.goldBorder + "40" }}>
          <div className="p-4 rounded-xl border" style={{ background: G.bgInner, borderColor: G.goldBorder }}>
            <div className="flex items-start gap-3">
              <span className="font-amiri text-xl" style={{ color: G.gold }}>✦</span>
              <div>
                <h4 className="font-inter text-[8px] uppercase tracking-widest font-bold mb-1" style={{ color: G.gold }}>Manuscript Source Authority</h4>
                <p className="font-inter text-[7px] leading-relaxed" style={{ color: G.dim }}>
                  All values on this page are locked to the manuscript source (pages {MANUSCRIPT_METADATA.sourcePages.join(", ")}). 
                  These tables represent the canonical authority for Ebcedi Kebir, Ebcedi Sağir, and all five Bast levels.
                  No modifications allowed without manual unlock.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PageLayout>
  );
}