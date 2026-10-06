/**
 * LUNAR MANSION MALAYALAM TRANSLATIONS
 * All 28 Mansions with Malayalam translations
 * Source: Havâss'ın Derinlikleri - PDF knowledge base
 * STRICTLY ISOLATED: Astro Clock module only
 */

import { AY_MANAZILLERI } from './astroClockData.js';
import { getLetterInfo } from './arabicLetterNamesML.js';
import { MANSION_ML_NAMES, ZODIAC_ML, MANSION_OPERATIONS_ML, MANSION_NOTES_ML, NATURE_ML } from './astroClockMansionsML.js';

export const LUNAR_MANSION_DATA = AY_MANAZILLERI.map(mansion => ({
  number: mansion.no,
  name_en: mansion.name,
  name_ml: MANSION_ML_NAMES[mansion.name] || mansion.name,
  name_arabic: mansion.name_arabic || mansion.harfi,
  letter_arabic: mansion.harf_arabic,
  letter_malayalam: getLetterInfo(mansion.harf_arabic).malayalam,
  nature: mansion.genel_hukum === "Uygun (Saad)" ? "Saad" : mansion.genel_hukum === "Uğursuz (Nahs)" ? "Nahs" : "Mixed",
  nature_ml: NATURE_ML[mansion.genel_hukum] || "മിശ്രം",
  zodiac_sign: mansion.zodiac_sign,
  zodiac_sign_ml: ZODIAC_ML[mansion.zodiac_sign] || mansion.zodiac_sign,
  zodiac_degree: mansion.zodiac_degree,
  operations: mansion.operations,
  operations_ml: MANSION_OPERATIONS_ML[mansion.no] || mansion.operations,
  note: mansion.note,
  note_ml: MANSION_NOTES_ML[mansion.no] || mansion.note
}));