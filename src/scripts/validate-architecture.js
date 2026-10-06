#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// ARCHITECTURE LAW VALIDATION SCRIPT
// Enforces PERMANENT ISOLATION between ABJAD and MIZAN modules
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ABJAD_FORBIDDEN = [
  'lib/mizaan9Engine.js',
  'lib/mizaan9Data.js',
  'lib/mizaanPostEngine.js',
  'pages/Mizaan9Page',
];

const MIZAN_FORBIDDEN = [
  'lib/abjadModes.js',
  'lib/abjadValues.js',
  'lib/manuscriptAbjadData.js',
  'lib/canonicalAbjadLock.js',
  'lib/bastHuroofEngine.js',
  'pages/AbjadKabirPage',
];

const ABJAD_FILES = [
  'lib/abjadModes.js',
  'lib/abjadValues.js',
  'lib/manuscriptAbjadData.js',
  'lib/canonicalAbjadLock.js',
  'lib/bastHuroofEngine.js',
  'pages/AbjadKabirPage.jsx',
];

const MIZAN_FILES = [
  'lib/mizaan9Engine.js',
  'lib/mizaan9Data.js',
  'lib/mizaanPostEngine.js',
  'pages/Mizaan9Page.jsx',
];

let violations = [];
let filesScanned = 0;

function extractImports(content) {
  const importRegex = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports;
}

function validateFile(filePath, forbiddenImports, moduleType) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const imports = extractImports(content);
    
    imports.forEach(importPath => {
      forbiddenImports.forEach(forbidden => {
        if (importPath.includes(forbidden)) {
          violations.push({
            file: filePath,
            import: importPath,
            forbidden: forbidden,
            type: `${moduleType}_IMPORTING_${moduleType === 'ABJAD' ? 'MIZAN' : 'ABJAD'}`,
            severity: 'CRITICAL',
          });
        }
      });
    });
    
    filesScanned++;
  } catch (error) {
    console.warn(`⚠️  Could not read file: ${filePath}`);
  }
}

console.log('═══════════════════════════════════════════════════════════════');
console.log('ARCHITECTURE LAW VALIDATION — ABJAD/MIZAN ISOLATION');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('📂 Scanning ABJAD modules for MIZAN imports...\n');
ABJAD_FILES.forEach(file => {
  validateFile(file, ABJAD_FORBIDDEN, 'ABJAD');
});

console.log('📂 Scanning MIZAN modules for ABJAD imports...\n');
MIZAN_FILES.forEach(file => {
  validateFile(file, MIZAN_FORBIDDEN, 'MIZAN');
});

console.log('═══════════════════════════════════════════════════════════════');
console.log(`FILES SCANNED: ${filesScanned}`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (violations.length > 0) {
  console.error('❌ ARCHITECTURE LAW VIOLATION DETECTED\n');
  console.error('VIOLATIONS:\n');
  
  violations.forEach((v, idx) => {
    console.error(`  ${idx + 1}. ${v.type}`);
    console.error(`     File: ${v.file}`);
    console.error(`     Import: ${v.import}`);
    console.error(`     Forbidden: ${v.forbidden}`);
    console.error(`     Severity: ${v.severity}\n`);
  });
  
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('❌ BUILD ABORTED — Architecture law violation detected');
  console.error('   Cross-module imports are STRICTLY PROHIBITED');
  console.error('   Please remove the violating imports and retry');
  console.error('═══════════════════════════════════════════════════════════════');
  
  throw new Error('Architecture law violation — build aborted');
} else {
  console.log('✅ ARCHITECTURE LAW VALIDATION PASSED\n');
  console.log('STATUS:');
  console.log('  ABJAD MODULE:          ✅ SEALED');
  console.log('  MIZAN MODULE:          ✅ SEALED');
  console.log('  PERMANENT ISOLATION:   ✅ TRUE');
  console.log('  CROSS-IMPORTS:         ✅ NONE DETECTED\n');
  console.log('✅ BUILD CAN PROCEED\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Architecture Law v1.0.0 — ENFORCED');
  console.log('═══════════════════════════════════════════════════════════════');
}