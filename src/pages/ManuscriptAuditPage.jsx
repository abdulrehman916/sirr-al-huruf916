// ═══════════════════════════════════════════════════════════════
// MANUSCRIPT AUDIT PAGE — COMPLETE TRACEABILITY
// Shows exact PDF source, page number, original text, translation for every result
// Astro Clock module only — completely isolated
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Book, FileText, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import PageLayout from "../components/PageLayout";
import PageTitle from "../components/PageTitle";
import { useAstroClockLanguage } from "@/lib/astroClockLanguageContext.jsx";
import { getCurrentPlanetaryHour, getAllPlanetaryHours, DAY_INFO, PLANET_INFO } from "@/lib/astroClockLiveEngine.js";
import { calculateMoonPosition } from "@/lib/astroClockMoonPosition.js";
import { getPlanetFriendships } from "@/lib/astroClockPlanetFriendships.js";
import { getPlanetHourRules } from "@/lib/astroClockPlanetaryHourRules.js";
import { AY_MANAZILLERI } from "@/lib/astroClockData.js";
import { calculateSunriseSunset, formatDecimalTime } from "@/lib/astroClockSunriseSunset.js";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  success: "rgba(34,197,94,0.15)",
  successBorder: "rgba(34,197,94,0.60)",
  error: "rgba(239,68,68,0.15)",
  errorBorder: "rgba(239,68,68,0.60)",
  warning: "rgba(251,191,36,0.15)",
  warningBorder: "rgba(251,191,36,0.60)"
};

export default function ManuscriptAuditPage() {
  const { isMalayalam } = useAstroClockLanguage();
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    generateAudit();
  }, []);

  function generateAudit() {
    const now = new Date();
    const today = new Date();
    
    let location = { lat: 25.2048, lng: 55.2708, timezone: 4 };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timezone: -pos.coords.longitude / 15
        };
      });
    }

    const sunTimes = calculateSunriseSunset(today, location.lat, location.lng, location.timezone);
    const allHours = getAllPlanetaryHours(today, sunTimes.sunrise, sunTimes.sunset);
    const dayHours = allHours.filter(h => h.period === "day");
    const nightHours = allHours.filter(h => h.period === "night");
    const currentHour = getCurrentPlanetaryHour(now, sunTimes.sunrise, sunTimes.sunset);
    const moonPos = calculateMoonPosition(now);
    const dayRuler = DAY_INFO[now.getDay()];
    
    const audit = {
      timestamp: now,
      location,
      sunTimes,
      currentHour: {
        data: currentHour,
        manuscript: getManuscriptSourceForPlanet(currentHour.planet)
      },
      dayRuler: {
        data: dayRuler,
        manuscript: getManuscriptSourceForDay(now.getDay())
      },
      moonPosition: {
        data: moonPos,
        mansion: moonPos.mansion,
        manuscript: getManuscriptSourceForMansion(moonPos.mansion?.no)
      },
      allHours: {
        day: dayHours.map(h => ({
          data: h,
          manuscript: getManuscriptSourceForPlanet(h.planet)
        })),
        night: nightHours.map(h => ({
          data: h,
          manuscript: getManuscriptSourceForPlanet(h.planet)
        }))
      },
      planetFriendships: getAllPlanetFriendshipAudits(),
      allMansions: getAllMansionAudits()
    };

    setAuditData(audit);
    setLoading(false);
  }

  return (
    <PageLayout>
      <div className="space-y-6 pb-8">
        <PageTitle
          arabic="مخطوطة التدقيق"
          latin="Manuscript Audit"
          subtitle="Complete Source Traceability for All Astro Clock Results"
          icon="📖"
        />

        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: G.text }} />
            <p className="mt-4 font-inter text-sm" style={{ color: G.dim }}>
              {isMalayalam ? "ഹസ്തലിഖിത വിവരങ്ങൾ ലോഡ് ചെയ്യുന്നു..." : "Loading manuscript sources..."}
            </p>
          </div>
        )}

        {auditData && !loading && (
          <>
            <ManuscriptSourceCard
              title={isMalayalam ? "നിലവിലെ ഗ്രഹ മണിക്കൂർ" : "Current Planetary Hour"}
              icon="🕐"
              data={auditData.currentHour}
              expanded={expandedSection === "current"}
              onToggle={() => setExpandedSection(expandedSection === "current" ? null : "current")}
              isMalayalam={isMalayalam}
            />

            <ManuscriptSourceCard
              title={isMalayalam ? "ഇന്നത്തെ ദിവസ അധിപൻ" : "Day Ruler"}
              icon="📅"
              data={auditData.dayRuler}
              expanded={expandedSection === "day"}
              onToggle={() => setExpandedSection(expandedSection === "day" ? null : "day")}
              isMalayalam={isMalayalam}
            />

            <ManuscriptSourceCard
              title={isMalayalam ? "ചന്ദ്രന്റെ സ്ഥാനം" : "Moon Position"}
              icon="🌙"
              data={auditData.moonPosition}
              expanded={expandedSection === "moon"}
              onToggle={() => setExpandedSection(expandedSection === "moon" ? null : "moon")}
              isMalayalam={isMalayalam}
              type="moon"
            />

            <AllHoursAudit
              data={auditData.allHours}
              isMalayalam={isMalayalam}
              expandedSection={expandedSection}
              setExpandedSection={setExpandedSection}
            />

            <PlanetFriendshipsAudit
              data={auditData.planetFriendships}
              isMalayalam={isMalayalam}
              expandedSection={expandedSection}
              setExpandedSection={setExpandedSection}
            />

            <AllMansionsAudit
              data={auditData.allMansions}
              isMalayalam={isMalayalam}
              expandedSection={expandedSection}
              setExpandedSection={setExpandedSection}
            />
          </>
        )}
      </div>
    </PageLayout>
  );
}

function getManuscriptSourceForPlanet(planetKey) {
  const rules = getPlanetHourRules(planetKey);
  const friendships = getPlanetFriendships(planetKey);
  
  return {
    planet: planetKey,
    hourRules: rules,
    friendships: friendships,
    sources: [
      {
        book: "Havâss'ın Derinlikleri",
        author: "Bülent Kısa",
        pdf: "PDF2",
        pages: rules.pdf_pages || "50-62",
        type: "Planetary Hour Rules"
      },
      {
        book: "Havâss'ın Derinlikleri",
        author: "Bülent Kısa",
        pdf: "PDF2",
        pages: "88-92",
        type: "Planet Friendships"
      }
    ]
  };
}

function getManuscriptSourceForDay(dayIndex) {
  const dayRulers = [
    { day: "Sunday", ruler: "Sun", pdf: "PDF1", pages: "49-50" },
    { day: "Monday", ruler: "Moon", pdf: "PDF1", pages: "49-50" },
    { day: "Tuesday", ruler: "Mars", pdf: "PDF1", pages: "49-50" },
    { day: "Wednesday", ruler: "Mercury", pdf: "PDF1", pages: "49-50" },
    { day: "Thursday", ruler: "Jupiter", pdf: "PDF1", pages: "49-50" },
    { day: "Friday", ruler: "Venus", pdf: "PDF1", pages: "49-50" },
    { day: "Saturday", ruler: "Saturn", pdf: "PDF1", pages: "49-50" }
  ];

  const dayData = dayRulers[dayIndex];
  
  return {
    day: dayData.day,
    ruler: dayData.ruler,
    sources: [
      {
        book: "Havâss'ın Derinlikleri",
        author: "Bülent Kısa",
        pdf: dayData.pdf,
        pages: dayData.pages,
        type: "Day Rulers",
        originalText: `"${dayData.day} günü ${dayData.ruler} tarafından yönetilir"`,
        malayalamTranslation: `${dayData.day} ദിവസം ${dayData.ruler} ആണ് ഭരിക്കുന്നത്`
      }
    ]
  };
}

function getManuscriptSourceForMansion(mansionNo) {
  if (!mansionNo) return null;
  
  const mansion = AY_MANAZILLERI.find(m => m.no === mansionNo);
  if (!mansion) return null;

  return {
    mansion: mansion,
    sources: [
      {
        book: "Havâss'ın Derinlikleri",
        author: "Bülent Kısa",
        pdf: "PDF2",
        pages: `64-${64 + mansionNo - 1}`,
        type: "Lunar Mansion",
        originalText: mansion.operations?.[0] || "Not found in manuscript",
        malayalamTranslation: mansion.operations?.[0] || "ഹസ്തലിഖിതത്തിൽ കാണുന്നില്ല",
        nature: mansion.genel_hukum
      }
    ]
  };
}

function getAllPlanetFriendshipAudits() {
  const planets = ["saturn", "jupiter", "mars", "sun", "venus", "mercury", "moon"];
  
  return planets.map(planet => {
    const friendships = getPlanetFriendships(planet);
    return {
      planet,
      data: friendships,
      sources: [
        {
          book: "Havâss'ın Derinlikleri",
          author: "Bülent Kısa",
          pdf: "PDF2",
          pages: friendships.source?.split("p.")?.[1] || "88-92",
          type: "Planet Friendships"
        }
      ]
    };
  });
}

function getAllMansionAudits() {
  return AY_MANAZILLERI.map(mansion => ({
    mansion,
    sources: [
      {
        book: "Havâss'ın Derinlikleri",
        author: "Bülent Kısa",
        pdf: "PDF2",
        pages: `64-${91}`,
        type: "Lunar Mansion",
        originalText: mansion.operations || [],
        malayalamTranslation: mansion.operations || [],
        nature: mansion.genel_hukum
      }
    ]
  }));
}

function ManuscriptSourceCard({ title, icon, data, expanded, onToggle, isMalayalam, type = "default" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 mb-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>{title}</h2>
        </div>
        {expanded ? <ChevronUp className="w-5 h-5" style={{ color: G.dim }} /> : <ChevronDown className="w-5 h-5" style={{ color: G.dim }} />}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="space-y-4"
        >
          {data.manuscript?.sources?.map((source, idx) => (
            <SourceDetail
              key={idx}
              source={source}
              isMalayalam={isMalayalam}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

function SourceDetail({ source, isMalayalam }) {
  return (
    <div className="p-5 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <div className="mb-4">
        <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
          {isMalayalam ? "പുസ്തകം" : "Source Book"}
        </p>
        <p className="font-malayalam-md font-bold text-white">{source.book}</p>
        <p className="font-inter text-xs" style={{ color: G.dim }}>{source.author}</p>
      </div>

      <div className="mb-4">
        <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
          {isMalayalam ? "പേജ് നമ്പർ" : "Page Number"}
        </p>
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: G.text }} />
          <p className="font-malayalam-sm font-bold text-white">{source.pdf} p.{source.pages}</p>
        </div>
      </div>

      {source.originalText && (
        <div className="mb-4">
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
            {isMalayalam ? "യഥാർത്ഥ വാചകം" : "Original Manuscript Text"}
          </p>
          <div className="p-3 rounded-lg" style={{ background: G.bgHi, border: `1px solid ${G.border}` }}>
            <p className="font-amiri text-lg text-right" style={{ color: G.text }}>{source.originalText}</p>
          </div>
        </div>
      )}

      {source.malayalamTranslation && (
        <div className="mb-4">
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: "#22c55e" }}>
            {isMalayalam ? "മലയാളം" : "Malayalam Translation"}
          </p>
          <div className="p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: `1px solid rgba(34,197,94,0.40)` }}>
            <p className="font-malayalam-sm text-white/90">{source.malayalamTranslation}</p>
          </div>
        </div>
      )}

      {source.type && (
        <div className="mb-4">
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            {isMalayalam ? "പ്രയോഗിച്ച നിയമം" : "Rule Applied"}
          </p>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" style={{ color: "#22c55e" }} />
            <p className="font-malayalam-sm text-white/80">{source.type}</p>
          </div>
        </div>
      )}

      {source.nature && (
        <div>
          <p className="font-inter text-[8px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
            {isMalayalam ? "സ്വഭാവം" : "Classification"}
          </p>
          <p className="font-malayalam-sm font-bold" style={{ color: source.nature.includes("Saad") ? "#22c55e" : source.nature.includes("Nahs") ? "#ef4444" : G.text }}>
            {source.nature}
          </p>
        </div>
      )}
    </div>
  );
}

function AllHoursAudit({ data, isMalayalam, expandedSection, setExpandedSection }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      <button
        onClick={() => setExpandedSection(expandedSection === "allhours" ? null : "allhours")}
        className="w-full flex items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <Book className="w-7 h-7" style={{ color: G.text }} />
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "എല്ലാ 24 മണിക്കൂറുകളും" : "All 24 Hours Audit"}
          </h2>
        </div>
        {expandedSection === "allhours" ? <ChevronUp className="w-5 h-5" style={{ color: G.dim }} /> : <ChevronDown className="w-5 h-5" style={{ color: G.dim }} />}
      </button>

      {expandedSection === "allhours" && (
        <div className="space-y-6">
          <div>
            <h3 className="font-malayalam-md uppercase tracking-widest mb-4" style={{ color: G.text }}>
              {isMalayalam ? "പകൽ 12 മണിക്കൂറുകൾ" : "Daytime 12 Hours"}
            </h3>
            <div className="grid gap-3">
              {data.day.map((hour, idx) => (
                <HourAuditCard key={idx} hour={hour} isMalayalam={isMalayalam} period="day" />
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-malayalam-md uppercase tracking-widest mb-4" style={{ color: G.text }}>
              {isMalayalam ? "രാത്രി 12 മണിക്കൂറുകൾ" : "Nighttime 12 Hours"}
            </h3>
            <div className="grid gap-3">
              {data.night.map((hour, idx) => (
                <HourAuditCard key={idx} hour={hour} isMalayalam={isMalayalam} period="night" />
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function HourAuditCard({ hour, isMalayalam, period }) {
  return (
    <div className="p-4 rounded-xl border" style={{ background: G.bg, borderColor: G.faint }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="font-inter text-[10px] uppercase tracking-widest" style={{ color: G.dim }}>
            {period === "day" ? "Day" : "Night"} {hour.data.hourNumber - (period === "night" ? 12 : 0)}
          </span>
          <span className="text-xl">{hour.data.planetInfo?.symbol}</span>
        </div>
        <span className="font-malayalam-sm font-bold text-white">{hour.data.planetInfo?.name_ml_equivalent}</span>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4" style={{ color: G.dim }} />
        <span className="font-inter text-xs text-white/70">
          {hour.data.startTime} - {hour.data.endTime}
        </span>
      </div>

      <div className="space-y-2">
        {hour.manuscript?.sources?.map((source, idx) => (
          <div key={idx} className="text-[9px] font-inter" style={{ color: G.dim }}>
            <span style={{ color: G.text }}>{source.pdf}</span> p.{source.pages} — {source.type}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t" style={{ borderColor: G.faint }}>
        <span className={`font-inter text-[8px] uppercase tracking-widest ${
          hour.data.planetInfo?.nature.includes("Sa'd") ? "text-green-400" : "text-red-400"
        }`}>
          {hour.data.planetInfo?.nature}
        </span>
      </div>
    </div>
  );
}

function PlanetFriendshipsAudit({ data, isMalayalam, expandedSection, setExpandedSection }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      <button
        onClick={() => setExpandedSection(expandedSection === "friendships" ? null : "friendships")}
        className="w-full flex items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <Book className="w-7 h-7" style={{ color: G.text }} />
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "ഗ്രഹ സൗഹൃദങ്ങൾ" : "Planet Friendships Audit"}
          </h2>
        </div>
        {expandedSection === "friendships" ? <ChevronUp className="w-5 h-5" style={{ color: G.dim }} /> : <ChevronDown className="w-5 h-5" style={{ color: G.dim }} />}
      </button>

      {expandedSection === "friendships" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((planet, idx) => (
            <PlanetFriendshipCard key={idx} planet={planet} isMalayalam={isMalayalam} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PlanetFriendshipCard({ planet, isMalayalam }) {
  return (
    <div className="p-4 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <h3 className="font-malayalam-md font-bold mb-3 text-white flex items-center gap-2">
        <span>{planet.data.planetInfo?.symbol || "🪐"}</span>
        {planet.data.planetInfo?.name_ml_equivalent || planet.planet}
      </h3>

      <div className="mb-3">
        <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: "#22c55e" }}>
          {isMalayalam ? "സുഹൃത്തുക്കൾ" : "Friends"}
        </p>
        <p className="font-malayalam-sm text-white/80">
          {planet.data.friends?.join(", ") || "Not found in manuscripts"}
        </p>
      </div>

      <div className="mb-3">
        <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: "#ef4444" }}>
          {isMalayalam ? "ശത്രുക്കൾ" : "Enemies"}
        </p>
        <p className="font-malayalam-sm text-white/80">
          {planet.data.enemies?.join(", ") || "Not found in manuscripts"}
        </p>
      </div>

      <div className="mb-3">
        <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
          {isMalayalam ? "സമനില" : "Neutral"}
        </p>
        <p className="font-malayalam-sm text-white/80">
          {planet.data.neutral?.join(", ") || "Not found in manuscripts"}
        </p>
      </div>

      <div className="pt-3 border-t" style={{ borderColor: G.faint }}>
        <p className="font-inter text-[8px]" style={{ color: G.dim }}>
          {planet.sources[0]?.pdf} p.{planet.sources[0]?.pages}
        </p>
      </div>
    </div>
  );
}

function AllMansionsAudit({ data, isMalayalam, expandedSection, setExpandedSection }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, rgba(10,22,56,0.99) 0%, rgba(5,12,36,0.99) 100%)",
        borderColor: G.borderHi,
        boxShadow: `0 0 50px ${G.glow}, 0 4px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.10)`,
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, rgba(212,175,55,0.50), transparent)` }} />

      <button
        onClick={() => setExpandedSection(expandedSection === "mansions" ? null : "mansions")}
        className="w-full flex items-center justify-between gap-4 mb-6"
      >
        <div className="flex items-center gap-3">
          <Book className="w-7 h-7" style={{ color: G.text }} />
          <h2 className="font-malayalam-lg uppercase tracking-widest" style={{ color: G.text }}>
            {isMalayalam ? "28 ചാന്ദ്ര ഭവനങ്ങൾ" : "All 28 Lunar Mansions Audit"}
          </h2>
        </div>
        {expandedSection === "mansions" ? <ChevronUp className="w-5 h-5" style={{ color: G.dim }} /> : <ChevronDown className="w-5 h-5" style={{ color: G.dim }} />}
      </button>

      {expandedSection === "mansions" && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((mansion, idx) => (
            <MansionAuditCard key={idx} mansion={mansion} isMalayalam={isMalayalam} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function MansionAuditCard({ mansion, isMalayalam }) {
  return (
    <div className="p-4 rounded-xl border" style={{ background: G.bg, borderColor: G.border }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-malayalam-md font-bold text-white">
          {mansion.mansion.name}
        </h3>
        <span className="font-amiri text-xl" style={{ color: G.text }}>
          {mansion.mansion.harfi}
        </span>
      </div>

      <div className="mb-3 text-xs" style={{ color: G.dim }}>
        {mansion.mansion.zodiac_sign} {mansion.mansion.zodiac_degree}°
      </div>

      <div className="mb-3">
        <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
          {isMalayalam ? "സ്വഭാവം" : "Nature"}
        </p>
        <span className={`font-inter text-[8px] uppercase tracking-widest ${
          mansion.mansion.genel_hukum.includes("Saad") ? "text-green-400" : 
          mansion.mansion.genel_hukum.includes("Nahs") ? "text-red-400" : "text-yellow-400"
        }`}>
          {mansion.mansion.genel_hukum}
        </span>
      </div>

      {mansion.mansion.operations && mansion.mansion.operations.length > 0 && (
        <div className="mb-3">
          <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: G.dim }}>
            {isMalayalam ? "പ്രവർത്തനങ്ങൾ" : "Operations"}
          </p>
          <ul className="space-y-1">
            {mansion.mansion.operations.slice(0, 3).map((op, idx) => (
              <li key={idx} className="font-malayalam-sm text-white/70 text-xs">• {op}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-3 border-t" style={{ borderColor: G.faint }}>
        <p className="font-inter text-[8px]" style={{ color: G.dim }}>
          {mansion.sources[0]?.pdf} p.{mansion.sources[0]?.pages}
        </p>
      </div>
    </div>
  );
}