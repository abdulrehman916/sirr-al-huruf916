// ═══════════════════════════════════════════════════════════════
// MIZAN VALIDATION SCRIPT
// Run before every build to verify Mizan data integrity
// ═══════════════════════════════════════════════════════════════

import { MIZAAN_ELEMENTS, MIZAAN_BAST2, MIZAAN_PLANETS, MIZAAN_DAYNIGHT, MIZAAN_SUITABILITY } from './mizaan9Engine.js';
import { MIZAAN_KHAYR_SHARR, MIZAAN_HOURS, MIZAAN_DAYS, MIZAAN_PLANETS_ALL, MIZAAN_PURPOSES, MIZAAN_ELEMENT_DEGREES } from './mizaan9Data.js';

const CANONICAL_BASELINE = {
  elements: {
    fire: { bast2: 2411 },
    earth: { bast2: 2599 },
    air: { bast2: 2322 },
    water: { bast2: 1484 },
  },
  khayrSharr: {
    khayr: { bast: 2731 },
    sharr: { bast: 2725 },
  },
  hours: [4832, 5604, 6132, 5592, 5565, 5511, 5506, 5748, 5443, 5489, 6785, 7294],
  days: { sun: 2024, mon: 3001, tue: 3784, wed: 2491, thu: 3077, fri: 3399, sat: 2590 },
  planets: [2963, 3980, 2970, 2971, 3189, 2665, 2029],
  purposes: [2754, 1339, 3029, 2036, 4070],
  elementDegrees: {
    fire: [6256, 6930, 8512, 4552],
    earth: [9958, 6668, 8900, 13066],
    air: [9813, 6418, 8791, 7783],
    water: [9535, 6772, 6188, 9929, 9073],
  },
};

let validationPassed = true;
const errors = [];

function validate(name, expected, actual) {
  if (expected !== actual) {
    errors.push(`❌ ${name}: Expected ${expected}, got ${actual}`);
    validationPassed = false;
  } else {
    console.log(`✅ ${name}: ${expected}`);
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('MIZAN DATA INTEGRITY VALIDATION');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('MIZAN 2 — Elements:');
validate('Fire Bast-2', CANONICAL_BASELINE.elements.fire.bast2, MIZAAN_ELEMENTS.fire.bast2);
validate('Earth Bast-2', CANONICAL_BASELINE.elements.earth.bast2, MIZAAN_ELEMENTS.earth.bast2);
validate('Air Bast-2', CANONICAL_BASELINE.elements.air.bast2, MIZAAN_ELEMENTS.air.bast2);
validate('Water Bast-2', CANONICAL_BASELINE.elements.water.bast2, MIZAAN_ELEMENTS.water.bast2);
console.log('');

console.log('MIZAN 3 — Khayr/Sharr:');
validate('Khayr Bast', CANONICAL_BASELINE.khayrSharr.khayr.bast, MIZAAN_KHAYR_SHARR.khayr.bast);
validate('Sharr Bast', CANONICAL_BASELINE.khayrSharr.sharr.bast, MIZAAN_KHAYR_SHARR.sharr.bast);
console.log('');

console.log('MIZAN 4 — Hours:');
MIZAAN_HOURS.forEach((hour, idx) => {
  validate(`Hour ${idx + 1}`, CANONICAL_BASELINE.hours[idx], hour.bast);
});
console.log('');

console.log('MIZAN 5 — Days:');
Object.entries(CANONICAL_BASELINE.days).forEach(([key, expected]) => {
  const day = MIZAAN_DAYS.find(d => d.key === key);
  validate(`${key} Bast`, expected, day?.bast);
});
console.log('');

console.log('MIZAN 6 — Planets:');
MIZAAN_PLANETS_ALL.forEach((planet, idx) => {
  validate(`${planet.key} Bast`, CANONICAL_BASELINE.planets[idx], planet.bast);
});
console.log('');

console.log('MIZAN 7 — Purposes:');
MIZAAN_PURPOSES.forEach((purpose, idx) => {
  validate(`${purpose.key} Bast`, CANONICAL_BASELINE.purposes[idx], purpose.bast);
});
console.log('');

console.log('MIZAN 9 — Element Degrees:');
Object.entries(CANONICAL_BASELINE.elementDegrees).forEach(([element, expectedValues]) => {
  console.log(`\n${element.toUpperCase()}:`);
  const degrees = MIZAAN_ELEMENT_DEGREES[element]?.degrees;
  if (degrees) {
    degrees.forEach((deg, idx) => {
      validate(`Degree ${idx + 1}`, expectedValues[idx], deg.bast);
    });
  }
});
console.log('');

console.log('═══════════════════════════════════════════════════════════════');
console.log('IMMUTABILITY CHECK:');
try {
  MIZAAN_ELEMENTS.fire.bast2 = 9999;
  if (MIZAAN_ELEMENTS.fire.bast2 === 9999) {
    errors.push('❌ MIZAAN_ELEMENTS is NOT frozen! Modification allowed.');
    validationPassed = false;
  } else {
    console.log('✅ MIZAAN_ELEMENTS is frozen (modification blocked)');
  }
} catch (e) {
  console.log('✅ MIZAAN_ELEMENTS is frozen (strict mode)');
}

console.log('\n═══════════════════════════════════════════════════════════════');
if (validationPassed) {
  console.log('✅ MIZAN VALIDATION PASSED — All values unchanged');
  console.log('BUILD CAN PROCEED');
} else {
  console.log('❌ MIZAN VALIDATION FAILED — Data integrity compromised');
  console.log('\nERRORS:');
  errors.forEach(err => console.log(err));
  console.log('\nBUILD ABORTED — Do not deploy');
  throw new Error('Mizan validation failed — data integrity compromised');
}
console.log('═══════════════════════════════════════════════════════════════');

export const validateMizan = () => validationPassed;