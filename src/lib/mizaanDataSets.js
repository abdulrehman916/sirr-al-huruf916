// ═══════════════════════════════════════════════════════════════
// MIZAAN DATA SETS — Section 1 (A) and Section 2 (B)
// Same pipeline structure. Different source values.
// ═══════════════════════════════════════════════════════════════

import { MIZAAN_ELEMENTS, MIZAAN_BAST2 } from './mizaan9Engine.js';
import {
  MIZAAN_DAYNIGHT_FULL,
  MIZAAN_HOURS,
  MIZAAN_DAYS,
  MIZAAN_PLANETS_ALL,
  MIZAAN_PURPOSES,
  MIZAAN_ELEMENT_DEGREES,
} from './mizaan9Data.js';
import {
  MIZAAN_ELEMENTS_B,
  MIZAAN_BAST2_B,
  MIZAAN_DAYNIGHT_B,
  MIZAAN_HOURS_B,
  MIZAAN_DAYS_B,
  MIZAAN_PLANETS_B,
  MIZAAN_PURPOSES_B,
  KHAYR_SHARR8_B,
  MIZAAN_ELEMENT_DEGREES_B,
  BAST_TABLE_B,
  getBastLevelB,
} from './mizaan9DataB.js';
import {
  MIZAAN_ELEMENTS_C,
  MIZAAN_BAST2_C,
  MIZAAN_DAYNIGHT_C,
  MIZAAN_HOURS_C,
  MIZAAN_DAYS_C,
  MIZAAN_PLANETS_C,
  MIZAAN_PURPOSES_C,
  KHAYR_SHARR8_C,
  MIZAAN_ELEMENT_DEGREES_C,
} from './mizaan9DataC.js';

// M8 Khayr/Sharr bast values for Section 1 (mirrors Mizaan8 local array)
const KHAYR_SHARR8_A = {
  khayr: { arabic: 'الخير', icon: '✨', bast: 2731, color: '#4ADE80' },
  sharr: { arabic: 'الشر',  icon: '⚡', bast: 2725, color: '#F87171' },
};

// ── Section 1 Dataset ──
export const DATASET_A = {
  elements:    MIZAAN_ELEMENTS,
  bast2:       MIZAAN_BAST2,
  dayNight:    MIZAAN_DAYNIGHT_FULL,
  hours:       MIZAAN_HOURS,
  days:        MIZAAN_DAYS,
  planets:     MIZAAN_PLANETS_ALL,
  purposes:    MIZAAN_PURPOSES,
  khayrSharr8: KHAYR_SHARR8_A,
  degrees:     MIZAAN_ELEMENT_DEGREES,
};

// ── Section 2 Dataset ──
// Bast1 = shared with Section 1 (identical, never changes)
// Bast2–Bast5 = manuscript pp.52–53 values via BAST_TABLE_B
export const DATASET_B = {
  elements:    MIZAAN_ELEMENTS_B,
  bast2:       MIZAAN_BAST2_B,
  dayNight:    MIZAAN_DAYNIGHT_B,
  hours:       MIZAAN_HOURS_B,
  days:        MIZAAN_DAYS_B,
  planets:     MIZAAN_PLANETS_B,
  purposes:    MIZAAN_PURPOSES_B,
  khayrSharr8: KHAYR_SHARR8_B,
  degrees:     MIZAAN_ELEMENT_DEGREES_B,
  bastTable:   BAST_TABLE_B,
  getBastLevel: getBastLevelB,
};

// ── Section 3 Dataset — Ebcedi Kebir (Abjad Kabir) values ──
export const DATASET_C = {
  elements:    MIZAAN_ELEMENTS_C,
  bast2:       MIZAAN_BAST2_C,
  dayNight:    MIZAAN_DAYNIGHT_C,
  hours:       MIZAAN_HOURS_C,
  days:        MIZAAN_DAYS_C,
  planets:     MIZAAN_PLANETS_C,
  purposes:    MIZAAN_PURPOSES_C,
  khayrSharr8: KHAYR_SHARR8_C,
  degrees:     MIZAAN_ELEMENT_DEGREES_C,
};

export function getDataSet(section) {
  if (section === 2) return DATASET_B;
  if (section === 3) return DATASET_C;
  return DATASET_A;
}