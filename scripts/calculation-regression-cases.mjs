import * as abjad from '../src/lib/abjadModes.js';
import * as elements from '../src/lib/anasirEngine.js';
import * as bast from '../src/lib/bastHuroofEngine.js';
import * as hadim from '../src/lib/hadimEngine.js';
import * as mizaan from '../src/lib/mizaan9Engine.js';
import { getKawkabForSaat } from '../src/lib/mizaanSaatCalculator.js';

export function regressionResults() {
  const alphabet = 'ابجدهوزحطيكلمنسعفصقرشتثخذضظغ';
  const samples = ['', 'الله', 'بسم الله الرحمن الرحيم', 'أإآٱؤئءىة', 'اللَّهُ', '١٢٣ English മലയാളം', ...alphabet];
  let seed = 916;
  for (let i = 0; i < 128; i++) {
    let text = '';
    for (let j = 0; j < 1 + i % 12; j++) {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      text += alphabet[seed % alphabet.length];
    }
    samples.push(text);
  }
  const results = samples.map(text => ({
    text,
    kebir: abjad.calcKebir(text),
    saghir: abjad.calcSaghir(text),
    cumeli: abjad.calcCumeli(text),
    bast: [1, 2, 3, 4, 5].map(level => abjad.calcBast(text, level)),
    bast2: [1, 2, 3, 4, 5].map(level => bast.calcBastHuroof(text, level)),
    elements: elements.analyzeElements(text),
    hadim: ['ulvi', 'sufli'].map(mode => hadim.calculateHadim(text, 'الرحمن', 'الله', mode)),
    mizaan: mizaan.mizaanAnalyze(text),
  }));
  const hours = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].flatMap(day =>
    ['gunduz', 'gece'].flatMap(period => Array.from({ length: 12 }, (_, i) => ({
      day, period, hour: i + 1, planet: getKawkabForSaat(i + 1, day, period),
    }))),
  );
  // Generated report timestamps are metadata, outside the calculations.
  return JSON.parse(JSON.stringify({ results, hours }, (key, value) => key === 'timestamp' ? undefined : value));
}
