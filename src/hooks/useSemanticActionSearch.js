// ═══════════════════════════════════════════════════════════════
// SEMANTIC ACTION SEARCH HOOK — Knowledge Reasoning Engine
//
// Combines Semantic Reasoning + Knowledge Matching + Timing Engine
//
// WORKFLOW:
//   1. User types any action (ML/AR/EN) → resolveAction finds canonical action
//   2. expandAction collects ALL related terms (synonyms, children, related, equivalent)
//   3. Query AstroClockKnowledge (today's weekday) + EntityKnowledge (verified only)
//   4. Filter both sets by semantic text matching using the FULL expansion
//   5. Combine with existing timing engine (allHours) — timing engine NOT modified
//   6. Return recommendation with reasoning summary
//
// SAFETY:
//   - Only verified knowledge appears (verification_status: "verified")
//   - Pending review content NEVER appears to customers
//   - Timing engine is NOT replaced — only consumed read-only
//   - No schema, OCR, ingestion, or calculation changes
//
// ISOLATED:
//   - Does NOT modify astroActionClassifier.js (still used for quick tags)
//   - Does NOT modify timing engine, calculation engine, or any other module
//   - The reasoning engine is a pure additive layer
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { resolveAction, expandAction, textMatchesExpansion, generateReasoningSummary } from "@/lib/semanticReasoningEngine";
import { SEMANTIC_GRAPH } from "@/lib/semanticKnowledgeGraph";
import { ACTION_CATEGORIES } from "@/lib/astroActionClassifier";
import { useAstroData } from "@/components/astroclock/dashboard/useAstroData";
import { getKashfOperationsForPurpose } from "@/lib/astroClockManuscriptMerger";

export function useSemanticActionSearch() {
  const d = useAstroData();
  const [query, setQuery] = useState("");
  const [searchTriggered, setSearchTriggered] = useState(false);
  const [ackRecords, setAckRecords] = useState([]);
  const [ekRecords, setEkRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Semantic resolution: resolves any input to a canonical action ──
  const resolution = useMemo(() => resolveAction(query), [query]);

  // ── Semantic expansion: collects ALL related terms ──
  const expansion = useMemo(() => {
    if (!resolution) return null;
    return expandAction(resolution.canonicalId);
  }, [resolution]);

  // ── Knowledge query: fires when search is triggered + resolution succeeds ──
  useEffect(() => {
    if (!searchTriggered || !resolution || !expansion) {
      setAckRecords([]);
      setEkRecords([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Query 1: AstroClockKnowledge for today's weekday (all saat/planet combos)
    const ackQuery = {
      weekday: d.activeDayIndex,
      is_marker: false,
    };

    // Query 2: EntityKnowledge — verified only, pending_review NEVER shown
    const ekQuery = {
      is_marker: false,
      verification_status: "verified",
    };

    Promise.all([
      base44.entities.AstroClockKnowledge.filter(ackQuery, "-source_count", 50),
      base44.entities.EntityKnowledge.filter(ekQuery, "-source_count", 50),
    ])
      .then(([ackData, ekData]) => {
        if (cancelled) return;

        // Filter AstroClockKnowledge: records with actions matching the FULL expansion
        const matchedACK = (ackData || []).filter(r => {
          if (r.source_type !== 'full_context') return false;
          const checkActions = (actions) => Array.isArray(actions) && actions.some(a =>
            textMatchesExpansion(a.en, expansion) ||
            textMatchesExpansion(a.ml, expansion) ||
            textMatchesExpansion(a.ar, expansion)
          );
          return checkActions(r.recommended_actions) ||
                 checkActions(r.forbidden_actions) ||
                 checkActions(r.enemy_actions) ||
                 checkActions(r.friendship_actions) ||
                 textMatchesExpansion(r.ritual_suitability, expansion) ||
                 textMatchesExpansion(r.knowledge_text_en, expansion);
        });

        // Filter EntityKnowledge: text matching the FULL expansion
        const matchedEK = (ekData || []).filter(r =>
          textMatchesExpansion(r.knowledge_text_en, expansion) ||
          textMatchesExpansion(r.knowledge_text_ml, expansion) ||
          textMatchesExpansion(r.knowledge_text_ar, expansion)
        );

        setAckRecords(matchedACK);
        setEkRecords(matchedEK);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setAckRecords([]);
        setEkRecords([]);
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [searchTriggered, resolution, expansion, d.activeDayIndex]);

  // ── Build recommendation result with full reasoning ──
  const result = useMemo(() => {
    if (!resolution || !expansion || !d.allHours) return null;

    const graphEntry = SEMANTIC_GRAPH[resolution.canonicalId];
    if (!graphEntry) return null;

    const preferredPlanets = expansion.preferredPlanets;
    const avoidPlanets = expansion.avoidPlanets;
    const preferredDays = expansion.preferredDays;

    // Check if today is a preferred day
    const isPreferredDay = preferredDays.includes(d.dayKey);

    // ── Timing engine: find recommended/alternative/avoided hours ──
    // Uses the EXISTING allHours from useAstroData — NO calculation changes
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
    const isSuitable = hasRecommendedHours && !currentHourBlocked;

    // ── Blocking reasons (if not suitable) ──
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

    // ── Supporting rules from matched AstroClockKnowledge ──
    const supportingRules = ackRecords.map(r => {
      const relevantActions = [];
      const collectActions = (actions, type) => {
        if (!Array.isArray(actions)) return;
        actions.forEach(a => {
          if (textMatchesExpansion(a.en, expansion) ||
              textMatchesExpansion(a.ml, expansion) ||
              textMatchesExpansion(a.ar, expansion)) {
            relevantActions.push({ type, en: a.en, ml: a.ml, ar: a.ar });
          }
        });
      };
      collectActions(r.recommended_actions, 'recommended');
      collectActions(r.forbidden_actions, 'forbidden');
      collectActions(r.friendship_actions, 'friendship');
      collectActions(r.enemy_actions, 'enemy');

      return {
        saat: r.saat_number,
        planet: r.planet,
        period: r.period,
        actions: relevantActions,
        ritual_suitability: r.ritual_suitability || '',
        summary: r.knowledge_text_en || '',
        summary_ml: r.knowledge_text_ml || '',
        source: r.source_book_title || 'Screenshot Upload',
        page: r.source_page_number,
        screenshot: r.source_screenshot_url,
        sources: r.supporting_sources || [],
        source_count: r.source_count || 1,
      };
    });

    // ── Blocking rules from knowledge database (forbidden_actions) ──
    // These are knowledge rules that explicitly FORBID the action at a
    // specific saat/planet combination — separate from timing-based blocks.
    const blockingRules = ackRecords.map(r => {
      const blockedActions = [];
      if (Array.isArray(r.forbidden_actions)) {
        r.forbidden_actions.forEach(a => {
          if (textMatchesExpansion(a.en, expansion) ||
              textMatchesExpansion(a.ml, expansion) ||
              textMatchesExpansion(a.ar, expansion)) {
            blockedActions.push({ en: a.en, ml: a.ml, ar: a.ar });
          }
        });
      }
      if (blockedActions.length === 0) return null;
      return {
        saat: r.saat_number,
        planet: r.planet,
        period: r.period,
        actions: blockedActions,
        summary: r.knowledge_text_en || '',
        source: r.source_book_title || 'Screenshot Upload',
        page: r.source_page_number,
        screenshot: r.source_screenshot_url,
        source_count: r.source_count || 1,
      };
    }).filter(Boolean);

    // ── Supporting manuscripts from matched EntityKnowledge ──
    const supportingManuscripts = ekRecords.map(r => ({
      text: r.knowledge_text_en || '',
      text_ml: r.knowledge_text_ml || '',
      text_ar: r.knowledge_text_ar || '',
      category: r.knowledge_category,
      entity_type: r.entity_type,
      entity_key: r.entity_key,
      source: r.source_book_title || 'Manuscript',
      page: r.source_page_number,
      screenshot: r.source_screenshot_url,
      sources: r.supporting_sources || [],
      source_count: r.source_count || 1,
    })).filter(r => r.text);

    // ── Warnings from knowledge records (forbidden actions + warnings) ──
    const warnings = [];
    ackRecords.forEach(r => {
      if (Array.isArray(r.forbidden_actions)) {
        r.forbidden_actions.forEach(a => {
          if (textMatchesExpansion(a.en, expansion) || textMatchesExpansion(a.ml, expansion)) {
            warnings.push({ text: a.en || a.ml, source: r.source_book_title || 'Knowledge' });
          }
        });
      }
    });

    // ── Recommendations from knowledge records (recommended actions) ──
    const recommendations = [];
    ackRecords.forEach(r => {
      if (Array.isArray(r.recommended_actions)) {
        r.recommended_actions.forEach(a => {
          if (textMatchesExpansion(a.en, expansion) || textMatchesExpansion(a.ml, expansion)) {
            recommendations.push({ text: a.en || a.ml, source: r.source_book_title || 'Knowledge' });
          }
        });
      }
    });

    // ── Collect all unique source references ──
    const allSources = new Set();
    [...ackRecords, ...ekRecords].forEach(r => {
      if (r.source_book_title) allSources.add(r.source_book_title);
      (r.supporting_sources || []).forEach(s => {
        if (s.book_title) allSources.add(s.book_title);
      });
    });

    // ── Kashf manuscript operations (existing data, read-only) ──
    const kashfOps = getKashfOperationsForPurpose(resolution.canonicalId) || [];

    // ── Confidence calculation ──
    const resolutionConfidence = resolution.confidence;
    const knowledgeMatchCount = ackRecords.length + ekRecords.length;
    const knowledgeConfidence = knowledgeMatchCount > 0
      ? Math.min(100, 50 + knowledgeMatchCount * 10)
      : 30;
    const timingConfidence = hasRecommendedHours ? 80 : 20;
    const overallConfidence = Math.round(
      (resolutionConfidence + knowledgeConfidence + timingConfidence) / 3
    );

    // ── Reasoning summary ──
    const reasoningSummary = generateReasoningSummary({
      resolution,
      expansion,
      knowledgeRuleCount: knowledgeMatchCount,
      suitable: isSuitable,
      preferredPlanets,
      avoidPlanets,
    });

    return {
      // Category info
      category: resolution.canonicalId,
      categoryLabel: expansion.canonicalLabel,
      suitable: isSuitable,
      confidence: overallConfidence,

      // Reasoning info (NEW)
      detectedAction: query,
      canonicalAction: expansion.canonicalLabel,
      relatedTopics: [...expansion.relatedTopics, ...expansion.equivalentTopics],
      knowledgeRulesUsed: knowledgeMatchCount,
      reasoningSummary,
      warnings,
      recommendations,

      // Timing
      recommendedHours,
      alternativeHours,
      avoidedHours,
      isPreferredDay,
      blockingReasons,

      // Knowledge
      supportingRules,
      blockingRules,
      supportingManuscripts,
      sources: Array.from(allSources),
      kashfOps,
      preferredPlanets,
      avoidPlanets,
      knowledgeMatchCount,

      // Expansion details (for display)
      expansionTermsCount: expansion.allTerms.length,
    };
  }, [resolution, expansion, d, ackRecords, ekRecords, query]);

  const search = (q) => {
    setQuery(q);
    setSearchTriggered(true);
  };

  const reset = () => {
    setQuery("");
    setSearchTriggered(false);
    setAckRecords([]);
    setEkRecords([]);
  };

  return { query, search, reset, resolution, result, loading, searched: searchTriggered };
}