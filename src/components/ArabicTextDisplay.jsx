/**
 * ARABIC TEXT DISPLAY COMPONENT
 * Displays Arabic glyphs as primary value with optional Malayalam transliteration
 * NEVER replaces Arabic with Malayalam - Arabic is always primary
 */

import React from "react";

const G = {
  arabic: "#F5D060",
  malayalam: "rgba(255,255,255,0.60)",
  border: "rgba(212,175,55,0.35)"
};

/**
 * Display Arabic letter with optional Malayalam description
 * @param {string} arabicChar - The Arabic character (primary display)
 * @param {string} malayalamTranslit - Malayalam transliteration (secondary, optional)
 * @param {string} description - Additional description in English
 * @param {string} className - Additional CSS classes
 */
export function ArabicLetterDisplay({ arabicChar, malayalamTranslit, description, className = "" }) {
  if (!arabicChar) return null;

  return (
    <div className={`inline-flex items-baseline gap-2 ${className}`}>
      <span 
        className="font-amiri text-xl font-bold" 
        style={{ color: G.arabic }}
        dir="rtl"
      >
        {arabicChar}
      </span>
      {malayalamTranslit && (
        <span 
          className="font-malayalam-sm"
          style={{ color: G.malayalam }}
        >
          ({malayalamTranslit})
        </span>
      )}
      {description && (
        <span className="font-inter text-xs" style={{ color: G.malayalam }}>
          {description}
        </span>
      )}
    </div>
  );
}

/**
 * Display Arabic text (word or phrase) with optional translation
 */
export function ArabicTextDisplay({ arabicText, translation, showTranslation = true, className = "" }) {
  if (!arabicText) return null;

  return (
    <div className={className}>
      <p 
        className="font-amiri text-lg font-bold text-right"
        style={{ color: G.arabic }}
        dir="rtl"
      >
        {arabicText}
      </p>
      {showTranslation && translation && (
        <p className="font-inter text-xs text-left mt-1" style={{ color: G.malayalam }}>
          {translation}
        </p>
      )}
    </div>
  );
}

/**
 * Display lunar mansion with Arabic name primary
 */
export function LunarMansionDisplay({ arabicName, malayalamName, englishName, number }) {
  return (
    <div className="flex items-center gap-3">
      {number && (
        <span className="font-inter text-xs px-2 py-1 rounded" style={{ background: G.border, color: G.arabic }}>
          #{number}
        </span>
      )}
      <div>
        <p className="font-amiri text-lg font-bold" style={{ color: G.arabic }} dir="rtl">
          {arabicName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {malayalamName && (
            <span className="font-malayalam-sm" style={{ color: G.malayalam }}>
              {malayalamName}
            </span>
          )}
          {englishName && malayalamName && (
            <span className="font-inter text-xs" style={{ color: G.malayalam }}>
              • {englishName}
            </span>
          )}
          {englishName && !malayalamName && (
            <span className="font-inter text-xs" style={{ color: G.malayalam }}>
              {englishName}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Display zodiac sign with Arabic name primary
 */
export function ZodiacSignDisplay({ arabicName, malayalamName, englishName, element }) {
  return (
    <div className="flex items-center gap-3">
      <div>
        <p className="font-amiri text-lg font-bold" style={{ color: G.arabic }} dir="rtl">
          {arabicName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {malayalamName && (
            <span className="font-malayalam-sm" style={{ color: G.malayalam }}>
              {malayalamName}
            </span>
          )}
          {englishName && (
            <span className="font-inter text-xs" style={{ color: G.malayalam }}>
              {englishName}
              {element && ` • ${element}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Extract Arabic letters from text - prioritizes Arabic glyphs
 */
export function extractArabicLetters(text) {
  if (!text) return [];
  
  // Match Arabic Unicode range
  const arabicRange = /[\u0600-\u06FF]/g;
  const matches = text.match(arabicRange);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Check if text contains Arabic characters
 */
export function containsArabic(text) {
  if (!text) return false;
  return /[\u0600-\u06FF]/.test(text);
}