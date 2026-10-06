/**
 * ARABIC LETTER DISPLAY COMPONENT
 * Shows Arabic glyph as primary, Malayalam as secondary description
 * NEVER displays Malayalam as the primary value
 */

import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const G = {
  arabic: "#F5D060",
  malayalam: "rgba(34,197,94,0.80)",
  dim: "rgba(212,175,55,0.55)",
  bg: "rgba(212,175,55,0.07)",
  border: "rgba(212,175,55,0.40)",
  saad: "rgba(34,197,94,0.70)",
  nahs: "rgba(239,68,68,0.70)"
};

/**
 * Display a single Arabic letter with optional Malayalam description
 */
export function ArabicLetterDisplay({ letter, malayalam, name, size = "lg", onClick, showCount = false, count = 0 }) {
  if (!letter) return null;

  const sizeClasses = {
    sm: "text-2xl",
    md: "text-4xl", 
    lg: "text-6xl",
    xl: "text-8xl"
  };

  const isClickable = !!onClick;

  return (
    <div 
      className={`flex flex-col items-center gap-2 ${isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
    >
      <span 
        className={`font-amiri font-bold ${sizeClasses[size]}`}
        style={{ color: G.arabic }}
        dir="rtl"
      >
        {letter}
      </span>
      {malayalam && (
        <span className="font-malayalam-sm" style={{ color: G.malayalam }}>
          {malayalam}
        </span>
      )}
      {name && (
        <span className="font-inter text-xs" style={{ color: G.dim }}>
          {name}
        </span>
      )}
      {showCount && count > 0 && (
        <span className="font-inter text-[9px] px-2 py-0.5 rounded-full" style={{ background: G.dim + "33", color: G.dim }}>
          {count} references
        </span>
      )}
    </div>
  );
}

/**
 * Display lunar mansion with Arabic name primary
 */
export function LunarMansionDisplay({ arabic, name, malayalam, number, onClick, showCount = false, count = 0 }) {
  const isClickable = !!onClick;

  return (
    <div 
      className={`flex items-center gap-3 ${isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
    >
      {number && (
        <span className="font-inter text-xs px-2 py-1 rounded" style={{ background: G.dim + "33", color: G.dim }}>
          #{number}
        </span>
      )}
      <div className="flex flex-col">
        <span className="font-amiri text-2xl font-bold" style={{ color: G.arabic }} dir="rtl">
          {arabic || name}
        </span>
        {name && arabic && (
          <span className="font-inter text-xs" style={{ color: G.dim }}>
            {name}
          </span>
        )}
        {malayalam && (
          <span className="font-malayalam-sm" style={{ color: G.malayalam }}>
            {malayalam}
          </span>
        )}
      </div>
      {showCount && count > 0 && (
        <span className="font-inter text-[9px] px-2 py-0.5 rounded-full" style={{ background: G.dim + "33", color: G.dim }}>
          {count} refs
        </span>
      )}
    </div>
  );
}

/**
 * Display zodiac sign with Arabic name primary
 */
export function ZodiacSignDisplay({ arabic, name, malayalam, onClick, showCount = false, count = 0 }) {
  const isClickable = !!onClick;

  return (
    <div 
      className={`flex flex-col gap-1 ${isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
    >
      <span className="font-amiri text-xl font-bold" style={{ color: G.arabic }} dir="rtl">
        {arabic || name}
      </span>
      {name && arabic && (
        <span className="font-inter text-xs" style={{ color: G.dim }}>
          {name}
        </span>
      )}
      {malayalam && (
        <span className="font-malayalam-sm" style={{ color: G.malayalam }}>
          {malayalam}
        </span>
      )}
      {showCount && count > 0 && (
        <span className="font-inter text-[9px] px-2 py-0.5 rounded-full" style={{ background: G.dim + "33", color: G.dim }}>
          {count} refs
        </span>
      )}
    </div>
  );
}

/**
 * Parse and display Arabic text with Malayalam translation
 */
export function ArabicTextWithTranslation({ arabic, malayalam, className = "" }) {
  if (!arabic && !malayalam) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {arabic && (
        <p className="font-amiri text-lg text-right" style={{ color: G.arabic }} dir="rtl">
          {arabic}
        </p>
      )}
      {malayalam && (
        <p className="font-malayalam-sm" style={{ color: G.malayalam }}>
          {malayalam}
        </p>
      )}
    </div>
  );
}

/**
 * Display planet with Arabic name primary (clickable)
 */
export function PlanetDisplay({ arabic, name, malayalam, symbol, onClick, showCount = false, count = 0 }) {
  const isClickable = !!onClick;

  return (
    <div 
      className={`flex flex-col items-center gap-2 ${isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
    >
      {symbol && (
        <span className="font-inter text-2xl" style={{ color: G.dim }}>{symbol}</span>
      )}
      <span className="font-amiri text-3xl font-bold" style={{ color: G.arabic }} dir="rtl">
        {arabic || name}
      </span>
      {name && arabic && (
        <span className="font-inter text-xs" style={{ color: G.dim }}>
          {name}
        </span>
      )}
      {malayalam && (
        <span className="font-malayalam-sm" style={{ color: G.malayalam }}>
          {malayalam}
        </span>
      )}
      {showCount && count > 0 && (
        <span className="font-inter text-[9px] px-2 py-0.5 rounded-full" style={{ background: G.dim + "33", color: G.dim }}>
          {count} refs
        </span>
      )}
    </div>
  );
}

/**
 * Display element badge (clickable)
 */
export function ElementDisplay({ arabic, name, malayalam, onClick, showCount = false, count = 0 }) {
  const isClickable = !!onClick;

  return (
    <div 
      className={`p-3 rounded-lg border ${isClickable ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
      onClick={onClick}
      style={{ background: G.dim + "11", borderColor: G.dim + "44" }}
    >
      <span className="font-amiri text-2xl font-bold block text-center" style={{ color: G.arabic }} dir="rtl">
        {arabic || name}
      </span>
      {name && arabic && (
        <span className="font-inter text-[9px] block text-center" style={{ color: G.dim }}>
          {name}
        </span>
      )}
      {malayalam && (
        <span className="font-malayalam-sm block text-center" style={{ color: G.malayalam }}>
          {malayalam}
        </span>
      )}
      {showCount && count > 0 && (
        <span className="font-inter text-[9px] px-2 py-0.5 rounded-full block text-center mt-1" style={{ background: G.dim + "33", color: G.dim }}>
          {count} refs
        </span>
      )}
    </div>
  );
}

/**
 * Display Saad/Nahs badge (clickable)
 */
export function SaadNahsDisplay({ nature, onClick, showCount = false, count = 0 }) {
  const isClickable = !!onClick;
  const isSaad = nature?.includes('Saad');
  const isNahs = nature?.includes('Nahs');
  
  const colors = {
    bg: isSaad ? 'rgba(34,197,94,0.15)' : isNahs ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)',
    border: isSaad ? 'rgba(34,197,94,0.60)' : isNahs ? 'rgba(239,68,68,0.60)' : 'rgba(251,191,36,0.60)',
    text: isSaad ? '#22c55e' : isNahs ? '#ef4444' : '#fbbf24'
  };

  return (
    <div 
      className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm cursor-pointer hover:scale-105 transition-transform`}
      onClick={onClick}
      style={{ background: colors.bg, border: `2px solid ${colors.border}`, color: colors.text }}
    >
      {isSaad ? '🟢' : isNahs ? '🔴' : '🟡'} {nature || 'Mixed'}
      {showCount && count > 0 && (
        <span className="block text-[9px] mt-1 font-normal tracking-normal">
          {count} references
        </span>
      )}
    </div>
  );
}