// MAGICAL HOLY NAMES AUDIT SCRIPT
// Run this to verify all names for errors

import { HOLY_NAMES } from './magicalHolyNamesData.js';

const ABJAD_MAP = {
  "\u0627": 1,  "\u0628": 2,  "\u062C": 3,  "\u062F": 4,  "\u0647": 5,
  "\u0648": 6,  "\u0632": 7,  "\u062D": 8,  "\u0637": 9,  "\u064A": 10,
  "\u0643": 20, "\u0644": 30, "\u0645": 40, "\u0646": 50, "\u0633": 60,
  "\u0639": 70, "\u0641": 80, "\u0635": 90, "\u0642": 100, "\u0631": 200,
  "\u0634": 300, "\u062A": 400, "\u062B": 500, "\u062E": 600, "\u0630": 700,
  "\u0636": 800, "\u0638": 900, "\u063A": 1000,
  "\u0623": 1,  "\u0625": 1,  "\u0622": 1,  "\u0649": 10,
  "\u0629": 5,  "\u0624": 6,  "\u0626": 10, "\u0621": 1,
};

function calcAbjad(s) {
  return s.split("").reduce(function(n, c) { return n + (ABJAD_MAP[c] || 0); }, 0);
}

function countLetters(s) {
  return s.replace(/[^\u0600-\u06FF]/g, "").replace(/[\u064B-\u065F\u0640]/g, "").length;
}

// Audit results
const correct = [];
const suspected = [];
const incorrect = [];
const duplicates = new Map();

console.log("═══════════════════════════════════════════════════════════");
console.log("MAGICAL HOLY NAMES - COMPLETE DATA AUDIT");
console.log("═══════════════════════════════════════════════════════════\n");

HOLY_NAMES.forEach((name) => {
  const issues = [];
  
  // Check for duplicate IDs
  if (duplicates.has(name.id)) {
    issues.push(`DUPLICATE ID: ${name.id}`);
  }
  duplicates.set(name.id, true);
  
  // Recalculate Abjad value
  const expectedAbjad = calcAbjad(name.arabicPlain);
  if (name.abjadValue !== expectedAbjad) {
    issues.push(`ABJAD MISMATCH: Expected ${expectedAbjad}, got ${name.abjadValue}`);
  }
  
  // Recalculate letter count
  const expectedLetters = countLetters(name.arabicPlain);
  if (name.letterCount !== expectedLetters) {
    issues.push(`LETTER COUNT MISMATCH: Expected ${expectedLetters}, got ${name.letterCount}`);
  }
  
  // Check for missing or empty fields
  if (!name.arabicName || name.arabicName.trim() === "") {
    issues.push("MISSING: Arabic Name with Harakat");
  }
  if (!name.arabicPlain || name.arabicPlain.trim() === "") {
    issues.push("MISSING: Plain Arabic");
  }
  if (!name.englishName || name.englishName.trim() === "") {
    issues.push("MISSING: English Name");
  }
  
  // Check for non-Arabic characters in arabicPlain (except spaces)
  const nonArabic = name.arabicPlain.replace(/[\u0600-\u06FF\s]/g, "");
  if (nonArabic.length > 0) {
    issues.push(`NON-ARABIC CHARACTERS in arabicPlain: "${nonArabic}"`);
  }
  
  // Check for Hebrew characters (common mistake in mystical texts)
  const hebrewChars = name.arabicName.match(/[\u0590-\u05FF]/g);
  if (hebrewChars) {
    issues.push(`HEBREW CHARACTERS DETECTED: ${hebrewChars.join(', ')}`);
  }
  
  // Categorize
  if (issues.length === 0) {
    correct.push(name);
  } else if (issues.some(i => i.includes("DUPLICATE") || i.includes("MISMATCH") || i.includes("MISSING") || i.includes("HEBREW"))) {
    incorrect.push({ name, issues });
  } else {
    suspected.push({ name, issues });
  }
});

// Print results
console.log(`\n✅ CORRECT RECORDS: ${correct.length} of ${HOLY_NAMES.length}`);
console.log(`⚠️  SUSPECTED RECORDS: ${suspected.length}`);
console.log(`❌ INCORRECT RECORDS: ${incorrect.length}\n`);

if (incorrect.length > 0) {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("❌ INCORRECT RECORDS (REQUIRE FIXING):");
  console.log("═══════════════════════════════════════════════════════════\n");
  
  incorrect.forEach(({ name, issues }) => {
    console.log(`\nID ${name.id}: "${name.englishName}"`);
    console.log(`  Arabic: ${name.arabicName}`);
    console.log(`  Plain:  ${name.arabicPlain}`);
    issues.forEach(issue => console.log(`  ⚠️  ${issue}`));
  });
}

if (suspected.length > 0) {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("⚠️  SUSPECTED RECORDS (MINOR ISSUES):");
  console.log("═══════════════════════════════════════════════════════════\n");
  
  suspected.forEach(({ name, issues }) => {
    console.log(`\nID ${name.id}: "${name.englishName}"`);
    console.log(`  Arabic: ${name.arabicName}`);
    issues.forEach(issue => console.log(`  ⚠️  ${issue}`));
  });
}

// Check for duplicate English names (potential data entry errors)
const englishNames = new Map();
HOLY_NAMES.forEach(name => {
  const en = name.englishName.toLowerCase();
  if (englishNames.has(en)) {
    englishNames.get(en).push(name);
  } else {
    englishNames.set(en, [name]);
  }
});

const dupEnglish = Array.from(englishNames.entries()).filter(([_, names]) => names.length > 1);

if (dupEnglish.length > 0) {
  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("🔄 DUPLICATE ENGLISH NAMES (POTENTIAL ISSUE):");
  console.log("═══════════════════════════════════════════════════════════\n");
  
  dupEnglish.forEach(([en, names]) => {
    console.log(`"${en}" appears ${names.length} time(s):`);
    names.forEach(n => console.log(`  - ID ${n.id}: ${n.arabicName}`));
  });
}

console.log("\n═══════════════════════════════════════════════════════════");
console.log("AUDIT COMPLETE");
console.log("═══════════════════════════════════════════════════════════\n");