import { calculateAbjad } from './abjadValues.js';

// Calculate the original card's first-word name, excluding its chapter marker.
// Preserve the imported spelling for display. Diacritics on the article must
// not prevent the separate "without ال" value from excluding alif and lam.
export function getHolyNameAbjad(arabicHeading) {
  const heading = String(arabicHeading || '')
    .replace(/^\s*اسمه\s+/, '')
    .replace(/^\s*اسم\s+/, '')
    .trim();
  const tokens = heading.split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  // Compound Names (ذو الجلال, مالك الملك, الشديد البطش …) are one Name made of
  // two words, so both words are counted; "without ال" drops the article from
  // each word that carries it.
  const bareTokens = tokens.map(t => t.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, ''));
  const COMPOUND_FIRST = ['ذو', 'مالك'];
  const COMPOUND_SECOND = ['العذاب', 'الحساب', 'البطش', 'الأخذ', 'الواحد'];
  if (tokens.length > 1 && (COMPOUND_FIRST.includes(bareTokens[0]) || COMPOUND_SECOND.includes(bareTokens[1]))) {
    const pair = tokens.slice(0, 2).map(t => t.replace(/\u0640/g, ''));
    const m = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*';
    const strip = w => w.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').startsWith('ال')
      ? w.replace(new RegExp('^ا' + m + 'ل' + m), '') : w;
    const withAL = pair.join(' ');
    const withoutAL = pair.map(strip).join(' ');
    const withALValue = calculateAbjad(pair.join(''));
    const withoutALValue = calculateAbjad(pair.map(strip).join(''));
    return { withAL, withoutAL, withALValue, withoutALValue,
      withALSquare: withALValue * withALValue,
      withoutALSquare: withoutALValue * withoutALValue };
  }
  const withAL = tokens[0].replace(/\u0640/g, '');
  const marks = '[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED]*';
  const bareFirst = withAL.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  const withoutAL = bareFirst !== 'الله' && bareFirst.startsWith('ال') && bareFirst.length > 2
    ? withAL.replace(new RegExp('^ا' + marks + 'ل' + marks), '')
    : withAL;
  const withALValue = calculateAbjad(withAL);
  const withoutALValue = calculateAbjad(withoutAL);
  return { withAL, withoutAL, withALValue, withoutALValue,
    withALSquare: withALValue * withALValue,
    withoutALSquare: withoutALValue * withoutALValue };
}
