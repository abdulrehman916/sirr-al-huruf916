/**
 * EXPANDED PLANETARY HOUR CARD
 * Displays comprehensive planetary hour data including:
 * - Hour number, start/end times, ruling planet
 * - Element, status (Sa'd/Nahs)
 * - Planet friends (Mithram), enemies (Shathru), neutral
 * - Actions strengthened/weakened
 * - Suitable/unsuitable operations from manuscripts
 * - Full manuscript source citation
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Users, Sword, Shield, CheckCircle, XCircle, Book } from "lucide-react";
import { getPlanetHourRules } from "@/lib/astroClockPlanetaryHourRules.js";
import { getPlanetFriendships } from "@/lib/astroClockPlanetFriendships.js";
import { getSahathQuality } from "@/lib/astroClockSahathQuality.js";

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  glow: "rgba(212,175,55,0.22)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  faint: "rgba(212,175,55,0.22)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  excellent: "rgba(34,197,94,0.15)",
  excellentBorder: "rgba(34,197,94,0.60)",
  avoid: "rgba(239,68,68,0.15)",
  avoidBorder: "rgba(239,68,68,0.60)"
};

export default function ExpandedPlanetaryHourCard({ hour, isMalayalam }) {
  const [expanded, setExpanded] = useState(false);
  const planetRules = getPlanetHourRules(hour.planet);
  const friendships = getPlanetFriendships(hour.planet);
  const isSaad = planetRules?.nature?.includes("Sa'd");

  // ── Status-based styling (Completed / Active Now / Upcoming) ──
  // Completed: dimmed opacity, still fully clickable & expandable
  // Current: highlighted border + glow
  // Upcoming: full visibility, no dimming
  const hourStatus = hour.status || 'upcoming';
  const isCompleted = hourStatus === 'past';
  const isCurrent = hourStatus === 'current';
  const quality = getSahathQuality(hour.planet, hour.dayRuler || null);
  const qualityLabel = isMalayalam ? quality.label_ml : quality.label_en;

  return (
    <div className="rounded-xl border p-5 w-full max-w-full overflow-x-hidden"
      style={{
        background: isCurrent ? "rgba(212,175,55,0.16)" : G.bg,
        borderColor: isCurrent ? G.borderHi : G.border,
        boxShadow: isCurrent ? `0 0 28px ${G.glow}, 0 2px 12px rgba(0,0,0,0.3)` : "0 2px 12px rgba(0,0,0,0.3)",
        opacity: isCompleted ? 0.55 : 1,
        transition: "opacity 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
      }}>
      {/* Header: Basic Info */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl flex-shrink-0">{hour.planetInfo?.symbol}</span>
          <div className="min-w-0">
            <p className="font-amiri text-3xl font-bold" style={{ color: G.text }}>
              {hour.planetInfo?.name_ar}
            </p>
            {isMalayalam && hour.planetInfo?.name_ml_reading && (
              <p className="font-malayalam-sm" style={{ color: 'rgba(212,175,55,0.60)', marginTop: '-0.25rem' }}>
                ({hour.planetInfo.name_ml_reading})
              </p>
            )}
            <p className="font-malayalam-md font-bold text-white">
              {isMalayalam ? hour.planetInfo?.name_ml_equivalent : hour.planetInfo?.name_en}
            </p>
            <p className="font-inter text-[9px]" style={{ color: G.dim }}>
              {isMalayalam ? `മണിക്കൂർ ${hour.hourNumber}` : `Hour ${hour.hourNumber}`}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 pl-1">
          <p className="font-malayalam-sm text-white/90 font-bold">
            {hour.startTime} → {hour.endTime}
          </p>
          <p className="font-malayalam-sm" style={{ color: G.dim }}>
            {hour.duration}
          </p>
        </div>

        {/* Status Badge — Completed / Active Now / Upcoming */}
        <div className="flex items-center gap-2 pl-1">
          {isCompleted && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.40)", border: "1px solid rgba(255,255,255,0.10)" }}>
              {isMalayalam ? "പൂർത്തിയായി" : "Completed"}
            </span>
          )}
          {isCurrent && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"
              style={{ background: "rgba(74,222,128,0.12)", color: "#4ADE80", border: "1px solid rgba(74,222,128,0.45)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4ADE80" }} />
              {isMalayalam ? "സജീവം" : "Active Now"}
            </span>
          )}
          {!isCompleted && !isCurrent && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest"
              style={{ background: G.bgHi, color: G.dim, border: `1px solid ${G.faint}` }}>
              {isMalayalam ? "വരാനിരിക്കുന്ന" : "Upcoming"}
            </span>
          )}
          {isCurrent && hour.timeRemaining && (
            <span className="font-inter text-[9px]" style={{ color: "#4ADE80" }}>⏳ {hour.timeRemaining}</span>
          )}
          {!isCompleted && !isCurrent && hour.timeUntilStart && (
            <span className="font-inter text-[9px]" style={{ color: G.dim }}>⏳ {hour.timeUntilStart}</span>
          )}
        </div>

        {/* Quality Badge — Excellent / Very Good / Good / Moderate / Weak */}
        <div className="flex items-center gap-2 pl-1">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1"
            style={{ background: `${quality.color}15`, color: quality.color, border: `1px solid ${quality.color}40` }}>
            <span>{quality.dot}</span>
            {qualityLabel}
          </span>
        </div>
      </div>

      {/* Quick Info: Status & Element */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <InfoCard
          label={isMalayalam ? "സ്ഥിതി" : "Status"}
          value={isMalayalam ? planetRules?.nature_ml : planetRules?.nature}
          color={isSaad ? "#22c55e" : "#ef4444"}
          bg={isSaad ? G.excellent : G.avoid}
          border={isSaad ? G.excellentBorder : G.avoidBorder}
        />
        <InfoCard
          label={isMalayalam ? "മൂലകം" : "Element"}
          value={isMalayalam ? planetRules?.element_ml : planetRules?.element}
          color={G.text}
          bg={G.bgHi}
          border={G.border}
        />
      </div>

      {/* Expand Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-3 rounded-lg border flex items-center justify-center gap-2 transition-all"
        style={{
          background: expanded ? G.bgHi : G.bg,
          borderColor: G.border,
          color: G.text
        }}>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        <span className="font-inter text-[9px] uppercase tracking-widest">
          {expanded 
            ? (isMalayalam ? "കുറയ്ക്കുക" : "Show Less") 
            : (isMalayalam ? "വിപുലീകരിക്കുക" : "Show Details")}
        </span>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", width: "100%", maxWidth: "100%" }}
          >
            <div className="pt-4 space-y-4 w-full max-w-full">
              {/* Planet Friendships */}
              <PlanetFriendshipsSection friendships={friendships} isMalayalam={isMalayalam} />
              
              {/* Actions Strengthened/Weakened */}
              <ActionsSection planetRules={planetRules} isMalayalam={isMalayalam} />
              
              {/* Suitable/Less Suitable Activities */}
              <OperationsSection planetRules={planetRules} isMalayalam={isMalayalam} />
              
              {/* Warnings and Conditions */}
              <WarningsSection hour={hour} isMalayalam={isMalayalam} />
              
              {/* Manuscript Source */}
              <ManuscriptSourceSection planetRules={planetRules} isMalayalam={isMalayalam} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoCard({ label, value, color, bg, border }) {
  return (
    <div className="p-3 rounded-lg border text-center" style={{ background: bg, borderColor: border }}>
      <p className="font-inter text-[8px] uppercase tracking-widest mb-1" style={{ color: color }}>{label}</p>
      <p className="font-malayalam-md font-bold text-white">{value}</p>
    </div>
  );
}

function PlanetFriendshipsSection({ friendships, isMalayalam }) {
  if (!friendships.found) {
    return (
      <div className="p-4 rounded-lg border text-center" style={{ background: G.bg, borderColor: G.faint }}>
        <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.dim }}>
          {isMalayalam ? "ഗ്രഹ ബന്ധങ്ങൾ" : "Planet Friendships"}
        </p>
        <p className="font-malayalam-sm text-white/60">
          {isMalayalam ? friendships.message : friendships.message}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg border" style={{ background: G.bgHi, borderColor: G.border }}>
      <p className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: G.text }}>
        {isMalayalam ? "ഗ്രഹ ബന്ധങ്ങൾ" : "Planet Relationships"}
      </p>
      
      <div className="grid grid-cols-1 gap-3">
        {/* Friends */}
        <div className="p-3 rounded-lg" style={{ background: G.excellent, border: `1px solid ${G.excellentBorder}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4" style={{ color: "#22c55e" }} />
            <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: "#22c55e" }}>
              {isMalayalam ? "മിത്രങ്ങൾ" : "Friends (Mithram)"}
            </p>
          </div>
          <p className="font-malayalam-sm text-white/80">
            {friendships.friends?.join(", ") || "None specified"}
          </p>
        </div>
        
        {/* Enemies */}
        <div className="p-3 rounded-lg" style={{ background: G.avoid, border: `1px solid ${G.avoidBorder}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Sword className="w-4 h-4" style={{ color: "#ef4444" }} />
            <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: "#ef4444" }}>
              {isMalayalam ? "ശത്രുക്കൾ" : "Enemies (Shathru)"}
            </p>
          </div>
          <p className="font-malayalam-sm text-white/80">
            {friendships.enemies?.join(", ") || "None specified"}
          </p>
        </div>
        
        {/* Neutral */}
        <div className="p-3 rounded-lg" style={{ background: G.bg, border: `1px solid ${G.border}` }}>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4" style={{ color: G.text }} />
            <p className="font-inter text-[8px] uppercase tracking-widest" style={{ color: G.text }}>
              {isMalayalam ? "സമം" : "Neutral"}
            </p>
          </div>
          <p className="font-malayalam-sm text-white/80">
            {friendships.neutral?.join(", ") || "None specified"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ActionsSection({ planetRules, isMalayalam }) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="p-4 rounded-lg border" style={{ background: G.excellent, borderColor: G.excellentBorder }}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4" style={{ color: "#22c55e" }} />
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "#22c55e" }}>
            {isMalayalam ? "ഏറ്റവും അനുയോജ്യ പ്രവർത്തനങ്ങൾ" : "Best Suited Activities"}
          </p>
        </div>
        <div className="space-y-1">
          {(Array.isArray(isMalayalam ? planetRules?.strengthenedActions?.ml : planetRules?.strengthenedActions?.en) ? (isMalayalam ? planetRules.strengthenedActions.ml : planetRules.strengthenedActions.en) : []).map((action, idx) => (
            <p key={idx} className="font-malayalam-sm text-white/80 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#22c55e" }} />
              {action}
            </p>
          ))}
          {(!planetRules?.strengthenedActions || (isMalayalam ? !planetRules.strengthenedActions.ml : !planetRules.strengthenedActions.en)) && (
            <p className="font-malayalam-sm text-white/60">
              {isMalayalam ? "ഹസ്തലിഖിതങ്ങളിൽ കാണുന്നില്ല" : "Not found in uploaded manuscripts"}
            </p>
          )}
        </div>
      </div>
      
      <div className="p-4 rounded-lg border" style={{ background: G.avoid, borderColor: G.avoidBorder }}>
        <div className="flex items-center gap-2 mb-3">
          <XCircle className="w-4 h-4" style={{ color: "#ef4444" }} />
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "#ef4444" }}>
            {isMalayalam ? "ശ്രദ്ധിക്കേണ്ട പ്രവർത്തനങ്ങൾ" : "Activities Requiring Caution"}
          </p>
        </div>
        <div className="space-y-1">
          {(Array.isArray(isMalayalam ? planetRules?.weakenedActions?.ml : planetRules?.weakenedActions?.en) ? (isMalayalam ? planetRules.weakenedActions.ml : planetRules.weakenedActions.en) : []).map((action, idx) => (
            <p key={idx} className="font-malayalam-sm text-white/80 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#ef4444" }} />
              {action}
            </p>
          ))}
          {(!planetRules?.weakenedActions || (isMalayalam ? !planetRules.weakenedActions.ml : !planetRules.weakenedActions.en)) && (
            <p className="font-malayalam-sm text-white/60">
              {isMalayalam ? "ഹസ്തലിഖിതങ്ങളിൽ കാണുന്നില്ല" : "Not found in uploaded manuscripts"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function OperationsSection({ planetRules, isMalayalam }) {
  const suitableActions = isMalayalam ? planetRules?.suitableActions?.ml : planetRules?.suitableActions?.en;
  const unsuitableActions = isMalayalam ? planetRules?.unsuitableActions?.ml : planetRules?.unsuitableActions?.en;

  return (
    <div className="grid grid-cols-1 gap-3">
      <div className="p-4 rounded-lg border" style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.30)" }}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-4 h-4" style={{ color: "#22c55e" }} />
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "#22c55e" }}>
            {isMalayalam ? "അനുയോജ്യ പ്രവർത്തനങ്ങൾ" : "Suitable Activities"}
          </p>
        </div>
        <div className="space-y-1">
          {(suitableActions || []).map((action, idx) => (
            <p key={idx} className="font-malayalam-sm text-white/80 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#22c55e" }} />
              {action}
            </p>
          ))}
          {(!suitableActions || suitableActions.length === 0) && (
            <p className="font-malayalam-sm text-white/60">
              {isMalayalam ? "ഹസ്തലിഖിതങ്ങളിൽ കാണുന്നില്ല" : "Not found in uploaded manuscripts"}
            </p>
          )}
        </div>
      </div>
      
      <div className="p-4 rounded-lg border" style={{ background: "rgba(239,68,68,0.05)", borderColor: "rgba(239,68,68,0.30)" }}>
        <div className="flex items-center gap-2 mb-3">
          <XCircle className="w-4 h-4" style={{ color: "#ef4444" }} />
          <p className="font-inter text-[9px] uppercase tracking-widest" style={{ color: "#ef4444" }}>
            {isMalayalam ? "കുറവ് അനുയോജ്യ പ്രവർത്തനങ്ങൾ" : "Less Suitable Activities"}
          </p>
        </div>
        <div className="space-y-1">
          {(unsuitableActions || []).map((action, idx) => (
            <p key={idx} className="font-malayalam-sm text-white/80 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#ef4444" }} />
              {action}
            </p>
          ))}
          {(!unsuitableActions || unsuitableActions.length === 0) && (
            <p className="font-malayalam-sm text-white/60">
              {isMalayalam ? "ഹസ്തലിഖിതങ്ങളിൽ കാണുന്നില്ല" : "Not found in uploaded manuscripts"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function WarningsSection({ hour, isMalayalam }) {
  const warnings = isMalayalam ? hour.planetInfo?.warnings_ml : hour.planetInfo?.warnings_en;
  const warningsArr = Array.isArray(warnings) ? warnings : (warnings ? [warnings] : []);
  if (warningsArr.length === 0) return null;

  return (
    <div className="p-4 rounded-lg border" style={{ background: "rgba(251,191,36,0.04)", borderColor: "rgba(251,191,36,0.25)" }}>
      <p className="font-inter text-[9px] uppercase tracking-widest mb-3" style={{ color: "#FBBF24" }}>
        {isMalayalam ? "മുന്നറിയിപ്പുകളും വ്യവസ്ഥകളും" : "Warnings & Conditions"}
      </p>
      <div className="space-y-1">
        {warningsArr.map((w, idx) => (
          <p key={idx} className="font-malayalam-sm text-white/70 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#FBBF24" }} />
            {w}
          </p>
        ))}
      </div>
    </div>
  );
}

function ManuscriptSourceSection({ planetRules, isMalayalam }) {
  return (
    <div className="p-4 rounded-lg border" style={{ 
      background: "rgba(212,175,55,0.04)",
      borderColor: planetRules?.manuscript_verified ? "rgba(34,197,94,0.40)" : "rgba(251,191,36,0.40)"
    }}>
      <div className="flex items-start gap-3">
        <Book className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: G.text }} />
        <div className="flex-1 min-w-0">
          <p className="font-inter text-[9px] uppercase tracking-widest mb-2" style={{ color: G.text }}>
            {isMalayalam ? "ഹസ്തലിഖിത സ്രോതസ്സ്" : "Manuscript Source"}
          </p>
          {planetRules?.manuscript_verified ? (
            <>
              <div className="space-y-1">
                <p className="font-malayalam-sm text-white/80">
                  <span className="font-bold">{isMalayalam ? "പുസ്തകം:" : "Book:"}</span> {planetRules.source?.split(',')[0]}
                </p>
                <p className="font-malayalam-sm text-white/80">
                  <span className="font-bold">{isMalayalam ? "പേജുകൾ:" : "Pages:"}</span> {planetRules.pdf_pages}
                </p>
                <p className="font-malayalam-sm text-white/80">
                  <span className="font-bold">{isMalayalam ? "PDF ഐഡി:" : "PDF ID:"}</span> {planetRules.pdf_id}
                </p>
              </div>
              <p className="font-inter text-[8px] mt-3" style={{ color: "rgba(34,197,94,0.70)" }}>
                ✓ {isMalayalam ? "ഹസ്തലിഖിതത്തിൽ നിന്ന്" : "From uploaded manuscripts"}
              </p>
            </>
          ) : (
            <p className="font-malayalam-sm text-white/60">
              {isMalayalam ? "ഹസ്തലിഖിതങ്ങളിൽ കാണുന്നില്ല" : "Not found in uploaded manuscripts"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}