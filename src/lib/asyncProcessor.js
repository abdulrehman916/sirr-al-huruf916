// asyncProcessor.js — Abjad async processor only.
// Anasir analysis lives entirely in lib/anasirEngine.js
import { ABJAD_MAP } from "./abjadValues";

const CHUNK_SIZE = 500;

const NORMALIZE_MAP = {
  'ء': 'ا', 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا',
  'ى': 'ي', 'ئ': 'ي',
  'ؤ': 'و',
  'ة': 'ه',
};

function norm(char) {
  return NORMALIZE_MAP[char] || char;
}

/**
 * Strip spaces, punctuation, diacritics (tashkeel), and non-Arabic characters.
 */
export function preprocessArabic(text) {
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670]/g, '')
    .replace(/\u0640/g, '')
    .replace(/[^\u0600-\u06FF]/g, '');
}

// Yield to the browser between chunks so the UI stays responsive
function tick() {
  return new Promise((r) => setTimeout(r, 0));
}

/**
 * Async chunked Abjad text processor.
 * Returns { total, count, letters }
 */
export async function processTextAsync(text, onProgress) {
  text = preprocessArabic(text);
  let abjadTotal = 0;
  let count = 0;
  const letters = [];

  for (let i = 0; i < text.length; i += CHUNK_SIZE) {
    const chunk = text.slice(i, i + CHUNK_SIZE);

    for (const char of chunk) {
      const normalized = norm(char);
      const val = ABJAD_MAP[normalized];
      if (val !== undefined) {
        abjadTotal += val;
        count++;
        letters.push({ original: char, normalized, value: val });
      }
    }

    onProgress?.(Math.min(99, Math.round(((i + CHUNK_SIZE) / text.length) * 100)));
    await tick();
  }

  onProgress?.(100);
  return { total: abjadTotal, count, letters };
}