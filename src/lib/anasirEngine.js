/**
 * Anasir (Elements) Engine
 * Calculates elemental domination based on Arabic letter properties
 */

import { ELEMENTS } from './anasirValues.js';

/**
 * Normalize Arabic text - remove diacritics and standardize forms
 */
export function normalizeText(text) {
  return text
    .replace(/[\u064B-\u065F]/g, '') // Remove diacritics
    .replace(/[^\u0600-\u06FF\s]/g, '') // Keep only Arabic letters
    .trim();
}

/**
 * Get element for a single Arabic letter
 */
const ANASIR_NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ؤ':'و','ئ':'ي','ى':'ي','ة':'ه' };
export function getElementForLetter(letter) {
  const normalized = ANASIR_NORM[letter.trim()] || letter.trim();

  if (!normalized) return null;
  // Use the same source-checked seven-letter sets as the page configuration.
  for (const [element, config] of Object.entries(ELEMENTS)) {
    if (config.letters.includes(normalized)) return element;
  }

  return null;
}

/**
 * Analyze text for elemental composition
 */
export function analyzeElements(text) {
  const normalized = normalizeText(text);
  const letters = normalized.split('').filter(l => l.trim());
  
  const counts = { fire: 0, air: 0, water: 0, earth: 0 };
  const letterDetails = [];
  
  letters.forEach(letter => {
    const element = getElementForLetter(letter);
    if (element) {
      counts[element]++;
      letterDetails.push({ letter, element });
    }
  });
  
  return summarizeElements(counts, letterDetails);
}

function summarizeElements(counts, letterDetails) {
  const total = letterDetails.length; // Count classified letters, not punctuation or marks.
  const percentages = {
    fire: total > 0 ? Math.round((counts.fire / total) * 100) : 0,
    air: total > 0 ? Math.round((counts.air / total) * 100) : 0,
    water: total > 0 ? Math.round((counts.water / total) * 100) : 0,
    earth: total > 0 ? Math.round((counts.earth / total) * 100) : 0,
  };
  
  // Find dominant element
  let dominant = null;
  let maxValue = 0;
  const ties = [];
  
  Object.entries(counts).forEach(([element, count]) => {
    if (count > maxValue) {
      maxValue = count;
      dominant = element;
      ties.length = 0;
      ties.push(element);
    } else if (count === maxValue && count > 0) {
      ties.push(element);
    }
  });
  
  return {
    total,
    counts,
    percentages,
    dominant,
    tiebreak: ties.length > 1 ? {
      tiedElements: ties,
      rankName: null // Could be extended with ranking logic
    } : null,
    letterDetails
  };
}

/**
 * Async version with progress tracking
 */
export async function analyzeAnasirAsync(text, onProgress) {
  const chunkSize = 12000;
  const counts = { fire: 0, air: 0, water: 0, earth: 0 };
  const letterDetails = [];
  onProgress?.(0);
  for (let offset = 0; offset < text.length; offset += chunkSize) {
    const part = analyzeElements(text.slice(offset, offset + chunkSize));
    for (const element of Object.keys(counts)) counts[element] += part.counts[element];
    for (const detail of part.letterDetails) letterDetails.push(detail);
    onProgress?.(Math.min(99, Math.round((offset + chunkSize) / text.length * 100)));
    // Let the browser paint progress and respond to input between batches.
    await new Promise(resolve => setTimeout(resolve, 0));
  }
  onProgress?.(100);
  return summarizeElements(counts, letterDetails);
}
