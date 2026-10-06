/**
 * MANUSCRIPT EXPLORER HOOKS
 * Centralized state management for ManuscriptKnowledgeExplorer integration
 * Provides reference counts and entity navigation across Astro Clock
 */

import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook: Manage ManuscriptKnowledgeExplorer state
 * @returns {Object} Explorer state and handlers
 */
export function useManuscriptExplorer() {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState(null);

  /**
   * Open explorer with entity details
   * @param {string} entityType - LUNAR_MANSION | ARABIC_LETTER | PLANET | ZODIAC | ELEMENT | SAAD_NAHS
   * @param {string} entityData - Arabic value (e.g., الشرطان, ا, Mars)
   * @param {string} displayName - Optional display name
   */
  const openExplorer = useCallback((entityType, entityData, displayName = entityData) => {
    setSelectedEntity({ entityType, entityData, displayName });
    setExplorerOpen(true);
  }, []);

  /**
   * Close explorer modal
   */
  const closeExplorer = useCallback(() => {
    setExplorerOpen(false);
    setSelectedEntity(null);
  }, []);

  return {
    explorerOpen,
    selectedEntity,
    openExplorer,
    closeExplorer
  };
}

/**
 * Hook: Fetch manuscript reference counts for entities
 * @param {Array} entities - Array of { type, value } objects
 * @returns {Object} Map of entity keys to reference counts
 */
export function useManuscriptReferenceCounts(entities = []) {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!entities || entities.length === 0) return;

    async function fetchCounts() {
      setLoading(true);
      const results = {};

      try {
        const promises = entities.map(async (entity) => {
          try {
            const result = await base44.functions.invoke('queryManuscriptLibrary', {
              entity_type: entity.type,
              entity_value: entity.value
            });
            const key = `${entity.type}_${entity.value}`;
            results[key] = (result.data?.rules || []).length;
          } catch (err) {
            console.error(`Failed to fetch count for ${entity.type}:${entity.value}`, err);
            const key = `${entity.type}_${entity.value}`;
            results[key] = 0;
          }
        });

        await Promise.all(promises);
        setCounts(results);
      } catch (err) {
        console.error('Failed to fetch manuscript counts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCounts();
  }, [entities]);

  return { counts, loading };
}

/**
 * Hook: Navigate between related entities
 * Creates breadcrumb trail for entity exploration
 */
export function useEntityNavigation() {
  const [navigationHistory, setNavigationHistory] = useState([]);

  /**
   * Navigate to related entity
   * @param {string} entityType 
   * @param {string} entityData
   * @param {string} previousType - Entity type we came from
   */
  const navigate = useCallback((entityType, entityData, previousType = null) => {
    setNavigationHistory(prev => [
      ...prev,
      { entityType, entityData, previousType, timestamp: Date.now() }
    ]);
  }, []);

  /**
   * Get current entity in navigation chain
   */
  const current = navigationHistory.length > 0 
    ? navigationHistory[navigationHistory.length - 1] 
    : null;

  /**
   * Get previous entity
   */
  const previous = navigationHistory.length > 1
    ? navigationHistory[navigationHistory.length - 2]
    : null;

  /**
   * Reset navigation
   */
  const reset = useCallback(() => {
    setNavigationHistory([]);
  }, []);

  return {
    current,
    previous,
    history: navigationHistory,
    navigate,
    reset
  };
}

/**
 * Helper: Generate entity key for count lookup
 */
export function getEntityKey(type, value) {
  return `${type}_${value}`;
}

/**
 * Helper: Extract entity type from display component
 */
export function getEntityTypeFromComponent(componentName) {
  const mapping = {
    'LunarMansionDisplay': 'LUNAR_MANSION',
    'ArabicLetterDisplay': 'ARABIC_LETTER',
    'PlanetDisplay': 'PLANET',
    'ZodiacSignDisplay': 'ZODIAC',
    'ElementDisplay': 'ELEMENT',
    'SaadNahsDisplay': 'SAAD_NAHS'
  };
  return mapping[componentName] || null;
}