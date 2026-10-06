/**
 * Anasir (Elements) Engine
 * Calculates elemental domination based on Arabic letter properties
 */

import { ELEMENTS } from './anasirValues';

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
const ANASIR_NORM = { 'ء':'ا','أ':'ا','إ':'ا','آ':'ا','ؤ':'و','ئ':'ي' };
export function getElementForLetter(letter) {
  const normalized = ANASIR_NORM[letter.trim()] || letter.trim();

  // Fire letters (carrier set — Hamza inherits Alif via ANASIR_NORM)
  if ('اهطمر'.includes(normalized)) return 'fire';
  // Air letters
  if ('دزكوي'.includes(normalized)) return 'air';
  // Water letters
  if ('بجلن'.includes(normalized)) return 'water';
  // Earth letters
  if ('سعفصقثخذضظغخشت'.includes(normalized)) return 'earth';

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
  
  const total = letters.length;
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
  onProgress?.(10);
  await new Promise(resolve => setTimeout(resolve, 50));
  
  const result = analyzeElements(text);
  
  onProgress?.(100);
  return result;
}