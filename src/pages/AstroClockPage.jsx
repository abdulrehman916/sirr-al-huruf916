// ═══════════════════════════════════════════════════════════════
// ASTRO CLOCK PAGE — PROFESSIONAL KNOWLEDGE DASHBOARD
// 8 Sections, each with unique responsibility — zero duplication
// UI-only redesign: no calculation/engine changes
// ═══════════════════════════════════════════════════════════════
import { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { requestLocationPermission, startLocationWatch, stopLocationWatch, setManualLocation, setManualLocationByCoords, getUserLocation, subscribeLocation } from "@/lib/astroClockGeolocation";
import { KNOWN_LOCATIONS } from "@/lib/astroClockSunriseSunset";
import { AstroClockLanguageProvider, useAstroClockLanguage } from "@/lib/astroClockLanguageContext";
import { useAuth } from "@/lib/AuthContext";
import PageLayout from "@/components/PageLayout";
import PageTitle from "@/components/PageTitle";
import DashboardSection from "@/components/astroclock/dashboard/DashboardSection";
import AstroClockErrorBoundary from "@/components/astroclock/AstroClockErrorBoundary";

// Lazy-load admin screenshot uploader
const AstroScreenshotUploader = lazy(() => import("@/components/astroclock/AstroScreenshotUploader"));

// Lazy-load all sections — only renders when expanded
const IntelligentDashboard = lazy(() => import("@/components/astroclock/dashboard/IntelligentDashboard"));
const DailyMantras = lazy(() => import("@/components/astroclock/dashboard/DailyMantras"));
const SmartSearch = lazy(() => import("@/components/astroclock/dashboard/SmartSearch"));
const SaatGrid = lazy(() => import("@/components/astroclock/dashboard/SaatGrid"));
const MoonCenter = lazy(() => import("@/components/astroclock/dashboard/MoonCenter"));
const MansionsReference = lazy(() => import("@/components/astroclock/dashboard/MansionsReference"));
const PlanetEncyclopedia = lazy(() => import("@/components/astroclock/dashboard/PlanetEncyclopedia"));
const ZodiacEncyclopedia = lazy(() => import("@/components/astroclock/dashboard/ZodiacEncyclopedia"));
const ReferenceLibrary = lazy(() => import("@/components/astroclock/dashboard/ReferenceLibrary"));
const ImportHistory = lazy(() => import("@/components/astroclock/dashboard/ImportHistory"));
const EntityKnowledgeReviewQueue = lazy(() => import("@/components/astroclock/dashboard/EntityKnowledgeReviewQueue"));
const AstroVerifiedKnowledge = lazy(() => import("@/components/astroclock/AstroVerifiedKnowledge"));
import SourceBookPanel from "@/components/astroclock/dashboard/SourceBookPanel";


function LangSelector() {
  const { language, setLanguage, txt } = useAstroClockLanguage();
  const langs = [
    { key: "ml", label: "Malayalam" },
    { key: "en", label: "English" },
    { key: "ar", label: "Arabic" },
  ];
  return (
    <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(212,175,55,0.30)" }}>
      {langs.map(l => (
        <button key={l.key} onClick={() => setLanguage(l.key)}
          className="px-3 py-2 font-inter text-[10px] font-bold uppercase tracking-wider transition-colors"
          style={{
            background: language === l.key ? "rgba(212,175,55,0.15)" : "transparent",
            color: language === l.key ? "#F5D060" : "rgba(255,255,255,0.40)",
          }}>{l.label}</button>
      ))}
    </div>
  );
}

function CustomDatePicker() {
  const { customDate, setCustomDate, clearCustomDate, txt } = useAstroClockLanguage();
  return (
    <div className="flex items-center gap-1.5">
      <input type="date"
        value={customDate ? customDate.toISOString().split("T")[0] : ""}
        min="2020-01-01" max="2030-12-31"
        onChange={(e) => {
          if (e.target.value) setCustomDate(new Date(e.target.value + "T12:00:00"));
          else clearCustomDate();
        }}
        className="px-2 py-2 rounded-xl font-inter text-[10px] font-bold uppercase tracking-wider cursor-pointer"
        style={{
          background: customDate ? "rgba(212,175,55,0.15)" : "transparent",
          color: customDate ? "#F5D060" : "rgba(255,255,255,0.40)",
          border: "1px solid rgba(212,175,55,0.30)",
          colorScheme: "dark",
        }}
      />
      {customDate && (
        <button onClick={clearCustomDate}
          className="px-3 py-2 rounded-xl font-inter text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
          style={{ background: "rgba(74,222,128,0.10)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.25)" }}>
          ↻ {txt("ഇന്ന്", "Today")}
        </button>
      )}
    </div>
  );
}

function LocationSelector() {
  const { txt } = useAstroClockLanguage();
  const [loc, setLoc] = useState(() => getUserLocation());
  const [showCoords, setShowCoords] = useState(false);
  const [latInput, setLatInput] = useState("");
  const [lngInput, setLngInput] = useState("");
  useEffect(() => {
    const unsub = subscribeLocation(() => setLoc(getUserLocation()));
    setLoc(getUserLocation());
    return unsub;
  }, []);
  const cities = Object.entries(KNOWN_LOCATIONS);
  const label = loc.source === "gps"
    ? txt("GPS", "GPS", "GPS")
    : (loc.name || "Dubai").toString().slice(0, 14);
  const applyCoords = () => {
    const la = parseFloat(latInput);
    const ln = parseFloat(lngInput);
    if (!isFinite(la) || !isFinite(ln) || la < -90 || la > 90 || ln < -180 || ln > 180) return;
    setManualLocationByCoords(la, ln);
    setShowCoords(false);
    setLatInput(""); setLngInput("");
  };
  return (
    <div className="flex items-center gap-1.5">
      <button onClick={() => requestLocationPermission()}
        title={txt("നിലവിലെ സ്ഥാനം ഉപയോഗിക്കുക", "Use my GPS location", "GPS konumumu kullan")}
        className="px-2.5 py-2 rounded-xl font-inter text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
        style={{ background: loc.source === "gps" ? "rgba(74,222,128,0.10)" : "rgba(212,175,55,0.10)", color: loc.source === "gps" ? "#4ADE80" : "#F5D060", border: "1px solid rgba(212,175,55,0.30)" }}>
        📍 {label}
      </button>
      <select
        value=""
        onChange={(e) => { const c = cities.find(([k]) => k === e.target.value); if (c) setManualLocation({ ...c[1], source: "manual" }); }}
        className="px-2 py-2 rounded-xl font-inter text-[10px] font-bold uppercase tracking-wider cursor-pointer"
        style={{ background: "transparent", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(212,175,55,0.30)", colorScheme: "dark" }}>
        <option value="">{txt("സ്ഥാനം", "Location", "Konum")}</option>
        {cities.map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
      </select>
      <button onClick={() => setShowCoords(s => !s)}
        title={txt("ഏതെങ്കിലും സ്ഥാനം (അക്ഷാംശം/രേഖാംശം)", "Any location (lat/lng)", "Herhangi bir konum")}
        className="px-2 py-2 rounded-xl font-inter text-[10px] font-bold uppercase tracking-wider"
        style={{ background: showCoords ? "rgba(212,175,55,0.15)" : "transparent", color: "#F5D060", border: "1px solid rgba(212,175,55,0.30)" }}>
        ⊕
      </button>
      {showCoords && (
        <div className="flex items-center gap-1">
          <input type="number" step="any" placeholder="lat" value={latInput}
            onChange={(e) => setLatInput(e.target.value)}
            className="w-16 px-1.5 py-2 rounded-lg font-inter text-[10px]"
            style={{ background: "rgba(255,255,255,0.04)", color: "#fff", border: "1px solid rgba(212,175,55,0.30)", colorScheme: "dark" }} />
          <input type="number" step="any" placeholder="lng" value={lngInput}
            onChange={(e) => setLngInput(e.target.value)}
            className="w-16 px-1.5 py-2 rounded-lg font-inter text-[10px]"
            style={{ background: "rgba(255,255,255,0.04)", color: "#fff", border: "1px solid rgba(212,175,55,0.30)", colorScheme: "dark" }} />
          <button onClick={applyCoords}
            className="px-2 py-2 rounded-lg font-inter text-[10px] font-bold uppercase"
            style={{ background: "rgba(74,222,128,0.10)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.25)" }}>
            ✓
          </button>
        </div>
      )}
    </div>
  );
}

function AstroClockContent() {
  const { txt, language } = useAstroClockLanguage();
  const { role } = useAuth();
  const isAdmin = role === 'admin' || role === 'owner';

  // Verified Knowledge Cache query — current weekday (deterministic, no engine dependency).
  // The Owner populates the cache by running unifiedKnowledgeSearch for the weekday name;
  // on cache miss this layer renders nothing and the existing Astro Clock panels remain.
  const currentWeekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // ── VERIFICATION PAUSE ───────────────────────────────────────────
  // Newly transcribed Arabic-only source-book cards are HIDDEN from the UI
  // until every line is verified against a clearer source image / original PDF.
  // Data is preserved untouched in src/lib/astroClockSourceBookData.js.
  // Set to false to restore the cards after verification.
  const HIDE_UNVERIFIED_ARABIC = true;
  // ────────────────────────────────────────────────────────────────

  // Request GPS permission + start continuous location watch on mount.
  useEffect(() => {
    requestLocationPermission();
    startLocationWatch();
    return () => stopLocationWatch();
  }, []);

  return (
    <PageLayout>
      <div className="space-y-3 pb-8 max-w-4xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <PageTitle arabic="الساعة الفلكية" latin={language === "en" ? "Astro Clock" : undefined} subtitle={txt("പാരമ്പര്യ സമയ വ്യവസ്ഥ", "Traditional Timing System", "Geleneksel Zaman Sistemi")} icon="🕰" />
          <div className="flex items-center gap-2">
            <Link to="/manuscript-library" className="px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5"
              style={{ background: "rgba(212,175,55,0.10)", color: "#F5D060", borderColor: "rgba(212,175,55,0.30)" }}>
              📚 {txt("ഗ്രന്ഥശേഖരം", "Library", "Kütüphane")}
            </Link>
            <LangSelector />
            <CustomDatePicker />
            <LocationSelector />
          </div>
        </div>

        {/* ── Verified Knowledge Cache (additive — renders null on miss, existing panels remain) ── */}
        <AstroClockErrorBoundary label="Verified Knowledge">
          <Suspense fallback={null}>
            <AstroVerifiedKnowledge query={currentWeekday} />
          </Suspense>
        </AstroClockErrorBoundary>

        {/* ── 8 Sections — each unique, no duplication ── */}
        {/* ── Section 1 — Intelligent Today's Dashboard (PRIMARY · always open · live decision engine) ── */}
        <AstroClockErrorBoundary label="Today Dashboard">
          <DashboardSection icon="🧭" title={txt("ഇന്നത്തെ തിരുമാനം", "Today's Dashboard", "لوحة اليوم")}
            subtitle={txt("തത്സമയ ഗ്രന്ഥ വിധായക യന്ത്രം — എല്ലാ പാളികളുടെയും സംയോജനം", "Live manuscript decision engine — synthesis of all layers", "محرّك القرار الحي — تركيب جميع الطبقات")}
            alwaysOpen badge="●">
            <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
              <IntelligentDashboard />
            </Suspense>
          </DashboardSection>
        </AstroClockErrorBoundary>

        {/* ── Reference & Study sections (non-operational) ── */}
        <AstroClockErrorBoundary label="Daily Mantras">
          <DashboardSection icon="📿" title={txt("ദൈനംദിന മന്ത്രങ്ങൾ", "Daily Mantras", "Günlük Mantralar")}
            subtitle={txt("ഇന്നത്തെ ആത്മിക പാരായണങ്ങൾ", "Today's Spiritual Recitations", "Bugünün Ruani Zikirleri")}>
            <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
              <DailyMantras />
            </Suspense>
          </DashboardSection>
        </AstroClockErrorBoundary>

        <AstroClockErrorBoundary label="Smart Search">
          <DashboardSection icon="🔍" title={txt("സ്മാർട്ട് തിരച്ചിൽ", "Smart Search", "Akıllı Arama")}
            subtitle={txt("ഉദ്ദേശം → മികച്ച സഅാത്", "Purpose → Best Saat", "Amaç → En İyi Saat")}>
            <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
              <SmartSearch />
            </Suspense>
          </DashboardSection>
        </AstroClockErrorBoundary>

        <AstroClockErrorBoundary label="Saat Grid">
          <DashboardSection icon="⏰" title={txt("ഇന്നത്തെ 24 സഅാത്", "Today's 24 Saat", "Bugünün 24 Saati")}
            subtitle={txt("12 പകൽ + 12 രാത്രി ഗ്രഹ മണിക്കൂറുകൾ", "12 Day + 12 Night Planetary Hours", "12 Gündüz + 12 Gece Gezegen Saati")}>
            <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
              <SaatGrid />
            </Suspense>
          </DashboardSection>
        </AstroClockErrorBoundary>

        {/* ── Preserved panels (kept collapsed; not removed) ── */}
        <AstroClockErrorBoundary label="Moon Center">
          <DashboardSection icon="🌙" title={txt("ചന്ദ്ര കേന്ദ്രം", "Moon Center", "Ay Merkezi")}
            subtitle={txt("രാശി, ഘട്ടം, ചാന്ദ്ര മൻസിൽ, ശക്തി, സ്വഭാവം", "Zodiac, Phase, Mansion, Strength, Nature", "Burç, Evre, Menzil, Güç, Doğa")}>
            <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
              <MoonCenter />
            </Suspense>
          </DashboardSection>
        </AstroClockErrorBoundary>

        <AstroClockErrorBoundary label="Zodiac Encyclopedia">
          <DashboardSection icon="♈" title={txt("12 രാശികൾ", "12 Zodiac Signs", "12 Burç")}
            subtitle={txt("എല്ലാ രാശികളുടെയും പൂർണ്ണ വിശദാംശങ്ങൾ", "Full Details for All Signs", "Tüm Burçların Tam Detayları")}>
            <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
              <ZodiacEncyclopedia />
            </Suspense>
          </DashboardSection>
        </AstroClockErrorBoundary>

        {/* ── HIDDEN: Fixed Stars — pending Arabic verification ── */}
        {!HIDE_UNVERIFIED_ARABIC && (
        <AstroClockErrorBoundary label="Fixed Stars">
          <DashboardSection icon="⭐" title="النجوم الثوابت" subtitle="Fixed Stars">
            <SourceBookPanel topicId="fixedStars" />
          </DashboardSection>
        </AstroClockErrorBoundary>
        )}

        {/* ── HIDDEN: Months Calendar — pending Arabic verification ── */}
        {!HIDE_UNVERIFIED_ARABIC && (
        <AstroClockErrorBoundary label="Months Calendar">
          <DashboardSection icon="📅" title="أسماء الأشهر الميلادية والرومية والقبطية" subtitle="Months Calendar">
            <SourceBookPanel topicId="monthsCalendar" />
          </DashboardSection>
        </AstroClockErrorBoundary>
        )}

        {/* ── HIDDEN: التحصينات — pending Arabic verification ── */}
        {!HIDE_UNVERIFIED_ARABIC && (
        <AstroClockErrorBoundary label="Tahsinat">
          <DashboardSection icon="🛡" title="التحصينات" subtitle="Protective Formulas">
            <SourceBookPanel topicId="tahsinatHijabs" />
          </DashboardSection>
        </AstroClockErrorBoundary>
        )}

        <AstroClockErrorBoundary label="Mansions">
          <DashboardSection icon="⭐" title={txt("28 അറബി ചാന്ദ്ര മൻസിലുകൾ", "28 Lunar Mansions", "28 Ay Menzili")}
            subtitle={txt("യഥാർത്ഥ അറബി പേരുകളോടെയുള്ള മൻസിൽ റഫറൻസ്", "Manzil / Nakshatra Reference", "Menzil / Nakşatra Referansı")}>
            <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
              <MansionsReference />
            </Suspense>
          </DashboardSection>
        </AstroClockErrorBoundary>

        {/* ── HIDDEN: Weekday Planetary Luck — pending Arabic verification ── */}
        {!HIDE_UNVERIFIED_ARABIC && (
        <AstroClockErrorBoundary label="Weekday Planetary Luck">
          <DashboardSection icon="🪐" title="سعود الكواكب من الأيام السبعة" subtitle="Weekday Planetary Luck">
            <SourceBookPanel topicId="weekdayLuck" />
          </DashboardSection>
        </AstroClockErrorBoundary>
        )}

        {/* ── HIDDEN: Inauspicious Directions — pending Arabic verification ── */}
        {!HIDE_UNVERIFIED_ARABIC && (
        <AstroClockErrorBoundary label="Inauspicious Directions">
          <DashboardSection icon="🧭" title="نحوس الاتجاهات" subtitle="Inauspicious Directions">
            <SourceBookPanel topicId="inauspiciousDirections" />
          </DashboardSection>
        </AstroClockErrorBoundary>
        )}

        {/* ── HIDDEN: Inauspicious Days — pending Arabic verification ── */}
        {!HIDE_UNVERIFIED_ARABIC && (
        <AstroClockErrorBoundary label="Inauspicious Days">
          <DashboardSection icon="⛔" title="أيام الكوامل السبع" subtitle="Inauspicious Days (Al-Kawamil)">
            <SourceBookPanel topicId="kawamilDays" />
          </DashboardSection>
        </AstroClockErrorBoundary>
        )}

        {/* ── HIDDEN: Lunar Month Days — pending Arabic verification ── */}
        {!HIDE_UNVERIFIED_ARABIC && (
        <AstroClockErrorBoundary label="Lunar Month Days">
          <DashboardSection icon="🗓️" title="بيان بأيام الشهر وأعمالها" subtitle="Lunar Month Days 1–30">
            <SourceBookPanel topicId="lunarMonthDays" />
          </DashboardSection>
        </AstroClockErrorBoundary>
        )}

        {/* ── HIDDEN: Planting & Building — pending Arabic verification ── */}
        {!HIDE_UNVERIFIED_ARABIC && (
        <AstroClockErrorBoundary label="Planting & Building">
          <DashboardSection icon="🌱" title="ما يصلح لغرس الشجر والبناء" subtitle="Planting & Building">
            <SourceBookPanel topicId="plantingPoem" />
          </DashboardSection>
        </AstroClockErrorBoundary>
        )}

        {/* ── HIDDEN: Clothing — pending Arabic verification ── */}
        {!HIDE_UNVERIFIED_ARABIC && (
        <AstroClockErrorBoundary label="Clothing">
          <DashboardSection icon="👔" title="ومما وجدته في اللباس" subtitle="Clothing (Al-Libas)">
            <SourceBookPanel topicId="clothingPoem" />
          </DashboardSection>
        </AstroClockErrorBoundary>
        )}

        <AstroClockErrorBoundary label="Planets">
          <DashboardSection icon="🪐" title={txt("ഗ്രഹ വിജ്ഞാനകോശം", "Planet Encyclopedia", "Gezegen Ansiklopedisi")}
            subtitle={txt("7 ഗ്രഹ ഭരണികൾ", "7 Planetary Rulers", "7 Gezegen Hükümdarı")}>
            <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
              <PlanetEncyclopedia />
            </Suspense>
          </DashboardSection>
        </AstroClockErrorBoundary>


        <AstroClockErrorBoundary label="Import History">
          <DashboardSection icon="📥" title={txt("ഇറക്കുമതി ചരിത്രം", "Import History", "İçe Aktarma Geçmişi")}
            subtitle={txt("ഗ്രന്ഥങ്ങൾ, പേജുകൾ, രേഖകൾ, പുരോഗതി, പരിശോധന", "Books, Pages, Records, Progress, Verification", "Kitap, Sayfa, Kayıt, İlerleme, Doğrulama")}>
            <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
              <ImportHistory />
            </Suspense>
          </DashboardSection>
        </AstroClockErrorBoundary>

        <AstroClockErrorBoundary label="References">
          <DashboardSection icon="📖" title={txt("റഫറൻസ് ലൈബ്രറി", "Reference Library", "Kaynak Kitaplığı")}
            subtitle={txt("എല്ലാ ഗ്രന്ഥങ്ങളുടെയും പൂർണ്ണ കാറ്റലോഗ്", "Master Manuscript Catalog", "Ana El Yazması Kataloğu")}>
            <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
              <ReferenceLibrary />
            </Suspense>
          </DashboardSection>
        </AstroClockErrorBoundary>

        {/* ── Admin-only: Screenshot Analysis & Merge ── */}
        {isAdmin && (
          <AstroClockErrorBoundary label="Screenshot Uploader">
            <DashboardSection icon="📷" title={txt("സ്ക്രീൻഷോട്ട് വിശകലനം", "Screenshot Analysis", "تحليل لقطة الشاشة")}
              subtitle={txt("ഗ്രന്ഥ സ്ക്രീൻഷോട്ട് → ദിവസം+സഅാത്+കവ്കബ് വിജ്ഞാനം", "Manuscript screenshot → Day+Saat+Kawkab knowledge", "لقطة المخطوطة → معرفة اليوم+الساعة+الكوكب")}>
              <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
                <AstroScreenshotUploader />
              </Suspense>
            </DashboardSection>
          </AstroClockErrorBoundary>
        )}

        {/* ── Admin-only: Knowledge Review Queue ── */}
        {isAdmin && (
          <AstroClockErrorBoundary label="Knowledge Review Queue">
            <DashboardSection icon="📋" title={txt("വിജ്ഞാന അവലോകന ക്യൂ", "Knowledge Review Queue", "قائمة مراجعة المعرفة")}
              subtitle={txt("അവലോകനം കാത്തിരിക്കുന്ന രേഖകൾ", "Records pending admin review", "سجلات تنتظر المراجعة")}>
              <Suspense fallback={<div className="py-8 text-center font-inter text-xs" style={{ color: "rgba(255,255,255,0.30)" }}>...</div>}>
                <EntityKnowledgeReviewQueue />
              </Suspense>
            </DashboardSection>
          </AstroClockErrorBoundary>
        )}
      </div>
    </PageLayout>
  );
}

export default function AstroClockPage() {
  return (
    <AstroClockLanguageProvider>
      <AstroClockContent />
    </AstroClockLanguageProvider>
  );
}
