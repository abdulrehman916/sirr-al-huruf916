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
