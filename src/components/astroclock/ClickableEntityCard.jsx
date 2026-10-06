/**
 * CLICKABLE ENTITY CARD COMPONENT
 * Universal wrapper for all astrological entities with manuscript reference counts
 * Provides consistent styling, hover effects, and explorer integration
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Star, Moon, Sun, Sparkles, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const G = {
  border: "rgba(212,175,55,0.40)",
  borderHi: "rgba(212,175,55,0.65)",
  text: "#F5D060",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  bgHi: "rgba(212,175,55,0.14)",
  saad: "rgba(34,197,94,0.70)",
  nahs: "rgba(239,68,68,0.70)"
};

/**
 * Entity type configurations
 */
const ENTITY_CONFIG = {
  LUNAR_MANSION: {
    icon: Moon,
    label: 'Mansion',
    color: G.text
  },
  ARABIC_LETTER: {
    icon: Sparkles,
    label: 'Letter',
    color: G.text
  },
  PLANET: {
    icon: Sun,
    label: 'Planet',
    color: G.text
  },
  ZODIAC: {
    icon: Star,
    label: 'Zodiac',
    color: G.text
  },
  ELEMENT: {
    icon: Sparkles,
    label: 'Element',
    color: G.text
  },
  SAAD_NAHS: {
    icon: Shield,
    label: 'Nature',
    color: G.text
  }
};

/**
 * Clickable entity card with manuscript reference count
 * @param {string} entityType - Type of entity (LUNAR_MANSION, ARABIC_LETTER, etc.)
 * @param {string} entityValue - Arabic value of the entity
 * @param {string} displayName - Display name (Malayalam/English)
 * @param {string} arabicDisplay - Arabic script display
 * @param {function} onClick - Click handler (opens ManuscriptKnowledgeExplorer)
 * @param {boolean} showCount - Show manuscript reference count
 * @param {string} size - Size variant: sm, md, lg
 */
export function ClickableEntityCard({
  entityType,
  entityValue,
  displayName,
  arabicDisplay,
  onClick,
  showCount = false,
  size = 'md'
}) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const config = ENTITY_CONFIG[entityType] || ENTITY_CONFIG.LUNAR_MANSION;
  const Icon = config.icon;

  // Fetch manuscript reference count
  useEffect(() => {
    if (!showCount || !entityType || !entityValue) return;

    async function fetchCount() {
      setLoading(true);
      try {
        const result = await base44.functions.invoke('queryManuscriptLibrary', {
          entity_type: entityType,
          entity_value: entityValue
        });
        setCount((result.data?.rules || []).length);
      } catch (err) {
        console.error('Failed to fetch manuscript count:', err);
        setCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchCount();
  }, [entityType, entityValue, showCount]);

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all"
      style={{ background: G.bg, borderColor: G.border }}
      onClick={() => onClick && onClick(entityType, entityValue, displayName)}
    >
      {/* Icon */}
      <Icon className="w-4 h-4" style={{ color: G.dim }} />

      {/* Arabic Display */}
      <span 
        className={`font-amiri font-bold ${sizeClasses[size]}`}
        style={{ color: G.text }}
        dir="rtl"
      >
        {arabicDisplay || entityValue}
      </span>

      {/* Display Name */}
      {displayName && (
        <span className="font-inter text-xs" style={{ color: G.dim }}>
          {displayName}
        </span>
      )}

      {/* Reference Count */}
      {showCount && (
        <div className="flex items-center gap-1 mt-1">
          <Book className="w-3 h-3" style={{ color: G.dim }} />
          <span className="font-inter text-[9px]" style={{ color: G.text }}>
            {loading ? '...' : count} refs
          </span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Saad/Nahs nature badge - specialized display
 */
export function NatureBadge({ nature, onClick, showCount = false }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!showCount || !nature) return;

    async function fetchCount() {
      try {
        const result = await base44.functions.invoke('queryManuscriptLibrary', {
          entity_type: 'SAAD_NAHS',
          entity_value: nature
        });
        setCount((result.data?.rules || []).length);
      } catch (err) {
        setCount(0);
      }
    }

    fetchCount();
  }, [nature, showCount]);

  const isSaad = nature?.includes('Saad');
  const isNahs = nature?.includes('Nahs');
  const color = isSaad ? G.saad : isNahs ? G.nahs : 'rgba(255,193,7,0.70)';
  const icon = isSaad ? '🟢' : isNahs ? '🔴' : '🟡';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all"
      style={{ background: color + "15", borderColor: color }}
      onClick={() => onClick && onClick('SAAD_NAHS', nature)}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-inter text-sm font-bold uppercase tracking-wider" style={{ color }}>
        {nature}
      </span>
      {showCount && (
        <span className="font-inter text-[9px]" style={{ color }}>
          {count} refs
        </span>
      )}
    </motion.div>
  );
}

/**
 * Entity breadcrumb navigation
 */
export function EntityBreadcrumb({ current, previous, onNavigate }) {
  if (!current) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {previous && (
        <>
          <button
            onClick={() => onNavigate(previous.entityType, previous.entityValue)}
            className="hover:underline"
            style={{ color: G.dim }}
          >
            {previous.displayName}
          </button>
          <span style={{ color: G.faint }}>→</span>
        </>
      )}
      <span className="font-bold" style={{ color: G.text }}>
        {current.displayName}
      </span>
    </div>
  );
}

export default ClickableEntityCard;