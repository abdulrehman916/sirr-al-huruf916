// ═══════════════════════════════════════════════════════════════
// KNOWLEDGE INTELLIGENCE SEARCH HOOK
//
// Combines the Knowledge Intelligence Engine with the existing
// Astro Timing Engine (read-only — timing engine NOT modified).
//
// WORKFLOW:
//   1. User triggers search → engine collects ALL verified knowledge
//   2. LLM analyzes intent + classifies every relevant record
//   3. Hook combines LLM output with timing engine data (allHours)
//   4. Returns complete knowledge package for UI display
//
// ISOLATED:
//   Does NOT modify timing engine, calculation engine, or any other module.
//   Reads allHours/currentHour/planetInfo from useAstroData (read-only).
// ═══════════════════════════════════════════════════════════════
import { useState, useCallback, useMemo, useRef } from "react";
import { runKnowledgeIntelligenceSearch } from "@/lib/knowledgeIntelligenceEngine";
import { getKashfOperationsForPurpose } from "@/lib/astroClockManuscriptMerger";

const WEEKDAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAY_ABBR_TO_FULL = { sun: "sunday", mon: "monday", tue: "tuesday", wed: "wednesday", thu: "thursday", fri: "friday", sat: "saturday" };
const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function useKnowledgeIntelligenceSearch(d) {
  const [query, setQuery] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [engineResult, setEngineResult] = useState(null);
  const requestIdRef = useRef(0);

  // ── Search: triggers the knowledge intelligence engine ──
  const search = useCallback(async (input) => {
    if (!input.trim()) return;
    const requestId = ++requestIdRef.current;
    setQuery(input);
    setSearchTriggered(true);
    setLoading(true);
    setError(null);

    try {
      const weekdayName = WEEKDAY_NAMES[d.activeDayIndex] || "Sunday";
      const result = await runKnowledgeIntelligenceSearch(
        input.trim(),
        d.activeDayIndex,
        weekdayName
      );
      // Ignore stale responses (user searched again while LLM was running)
      if (requestId !== requestIdRef.current) return;
      setEngineResult(result);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message || "Knowledge engine error");
      setEngineResult(null);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [d.activeDayIndex]);

  const reset = useCallback(() => {
    requestIdRef.current++;
    setQuery("");
    setSearchTriggered(false);
    setLoading(false);
    setError(null);
    setEngineResult(null);
  }, []);

  // ── Combine engine output with timing engine data ──
  const result = useMemo(() => {
    if (!engineResult || !d.allHours) return null;

    const {
      canonicalId,
      canonicalAction,
      relatedConcepts,
      preferredPlanets,
      avoidPlanets,
      preferredDays,
      relevantRecords,
      reasoningSummary,
      confidence,
    } = engineResult;

    // ── Timing: filter allHours by LLM-determined preferred/avoided planets ──
    const recommendedHours = d.allHours
      .filter(h => h.status !== "past" && preferredPlanets.includes(h.planet))
      .sort((a, b) => {
        if (a.status === "current") return -1;
        if (b.status === "current") return 1;
        return 0;
      })
      .slice(0, 3);

    const alternativeHours = d.allHours
      .filter(h => h.status !== "past" && !preferredPlanets.includes(h.planet) && !avoidPlanets.includes(h.planet))
      .slice(0, 3);

    const avoidedHours = d.allHours
      .filter(h => h.status !== "past" && avoidPlanets.includes(h.planet))
      .slice(0, 3);

    // ── Suitability determination ──
    const hasRecommendedHours = recommendedHours.length > 0;
    const currentHourBlocked = d.currentHour && avoidPlanets.includes(d.currentHour.planet);
    const normalizedPreferredDays = preferredDays.map(d => DAY_ABBR_TO_FULL[d] || d);
    const isPreferredDay = normalizedPreferredDays.includes(WEEKDAY_KEYS[d.activeDayIndex]);
    const isSuitable = hasRecommendedHours && !currentHourBlocked;

    // ── Blocking reasons ──
    const blockingReasons = [];
    if (!hasRecommendedHours) {
      blockingReasons.push({
        ml: "ഇന്ന് അനുകൂല സഅാതുകൾ ബാക്കിയില്ല",
        en: "No favorable hours remaining today",
      });
    }
    if (currentHourBlocked) {
      blockingReasons.push({
        ml: "നിലവിലെ സഅാത് പ്രതികൂല ഗ്രഹത്തിന്റെ ഭരണത്തിലാണ്",
        en: "Current hour is governed by an unfavorable planet",
      });
    }
    if (!isPreferredDay) {
      blockingReasons.push({
        ml: "ഈ പ്രവൃത്തിക്ക് ഏറ്റവും അനുകൂലമായ ദിവസം ഇന്നല്ല",
        en: "Today is not the most favorable day for this action",
      });
    }

    // ── Separate relevant records by LLM classification ──
    const sortByRelevance = (a, b) => (b.relevance || 0) - (a.relevance || 0);
    const supportingRules = relevantRecords.filter(r => r.classification === "supporting").sort(sortByRelevance);
    const blockingRules = relevantRecords.filter(r => r.classification === "blocking").sort(sortByRelevance);
    const conditionalRules = relevantRecords.filter(r => r.classification === "conditional").sort(sortByRelevance);
    const exceptions = relevantRecords.filter(r => r.classification === "exception").sort(sortByRelevance);
    const indirectRules = relevantRecords.filter(r => r.classification === "indirect").sort(sortByRelevance);

    // ── Collect all unique source references ──
    const allSources = new Set();
    relevantRecords.forEach(r => {
      if (r.source) allSources.add(r.source);
      (r.supporting_sources || []).forEach(s => {
        if (s.book_title) allSources.add(s.book_title);
      });
    });

    // ── Kashf operations (existing data, read-only) ──
    const kashfOps = canonicalId && canonicalId !== "unknown"
      ? (getKashfOperationsForPurpose(canonicalId) || [])
      : [];

    return {
      // Reasoning
      suitable: isSuitable,
      confidence,
      detectedAction: query,
      canonicalAction,
      canonicalId,
      relatedActions: relatedConcepts,
      reasoningSummary,

      // Timing
      recommendedHours,
      alternativeHours,
      avoidedHours,
      isPreferredDay,
      blockingReasons,
      preferredPlanets,
      avoidPlanets,

      // Knowledge rules (ranked by relevance)
      supportingRules,
      blockingRules,
      conditionalRules,
      exceptions,
      indirectRules,
      knowledgeRulesUsed: relevantRecords.length,

      // Sources
      sources: Array.from(allSources),
      kashfOps,
    };
  }, [engineResult, d, query]);

  return { query, search, reset, loading, error, result, searched: searchTriggered };
}