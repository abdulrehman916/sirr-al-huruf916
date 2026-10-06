#!/usr/bin/env node
/* eslint-disable no-undef */
// ═══════════════════════════════════════════════════════════════
// MIZAN PERMANENT LOCK VALIDATOR
// ═══════════════════════════════════════════════════════════════
// 
// PURPOSE: Enforce permanent isolation between ABJAD and MIZAN modules
// EXECUTION: Run before every build (pre-build hook)
// AUTHORITY: MIZAN MANUSCRIPT (Verified & Validated)
// 
// If ANY violation is detected:
// - FAIL VALIDATION
// - BLOCK BUILD
// - BLOCK DEPLOYMENT
// - REPORT FILE NAME & LINE NUMBER
// - REQUIRE MANUAL APPROVAL
// ═══════════════════════════════════════════════════════════════
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, relative } from 'path';

const PROJECT_ROOT = process.cwd();
const SRC_DIR = join(PROJECT_ROOT, 'src');

// Handle ES modules in Node.js
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── MODULE BOUNDARIES (ABSOLUTELY FORBIDDEN CROSS-IMPORTS) ──
const ABJAD_FILES = [
  'lib/abjadModes.js',
  'lib/abjadValues.js',
  'lib/manuscriptAbjadData.js',
  'lib/canonicalAbjadLock.js',
  'lib/bastHuroofEngine.js',
  'pages/AbjadKabirPage.jsx',
  'pages/AbjadBastAuditPage.jsx',
];

const MIZAN_FILES = [
  'lib/mizaan9Engine.js',
  'lib/mizaan9Data.js',
  'lib/mizaanPostEngine.js',
  'lib/mizanCanonicalLock.js',
  'pages/Mizaan9Page.jsx',
  'components/mizaan/',
];

// ── FORBIDDEN IMPORT PATTERNS ──
const FORBIDDEN_MIZAN_IMPORTS = [
  /from\s+['"].*abjadModes['"]/,
  /from\s+['"].*abjadValues['"]/,
  /from\s+['"].*canonicalAbjadLock['"]/,
  /from\s+['"].*bastHuroofEngine['"]/,
  /import\s+.*\s+from\s+['"].*\/AbjadKabirPage['"]/,
  /import\s+.*\s+from\s+['"].*\/AbjadBastAuditPage['"]/,
];

const FORBIDDEN_ABJAD_IMPORTS = [
  /from\s+['"].*mizaan9Engine['"]/,
  /from\s+['"].*mizaan9Data['"]/,
  /from\s+['"].*mizaanPostEngine['"]/,
  /from\s+['"].*mizanCanonicalLock['"]/,
  /import\s+.*\s+from\s+['"].*\/Mizaan9Page['"]/,
];

// ── FILE SCANNER ──
function scanDirectory(dir, fileList = []) {
  if (!existsSync(dir)) return fileList;
  
  const files = readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = join(dir, file.name);
    
    if (file.isDirectory()) {
      scanDirectory(fullPath, fileList);
    } else if (file.isFile() && (file.name.endsWith('.js') || file.name.endsWith('.jsx'))) {
      fileList.push(fullPath);
    }
  }
  
  return fileList;
}

// ── IMPORT EXTRACTOR ──
function extractImports(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const imports = [];
    
    lines.forEach((line, index) => {
      if (line.includes('import') || line.includes('from')) {
        imports.push({
          line: index + 1,
          content: line.trim(),
          file: filePath,
        });
      }
    });
    
    return imports;
  } catch (error) {
    console.warn(`⚠️  Warning: Could not read ${filePath}`);
    return [];
  }
}

// ── VIOLATION DETECTOR ──
function detectViolations() {
  const violations = [];
  const allFiles = scanDirectory(SRC_DIR);
  
  console.log(`🔍 Scanning ${allFiles.length} files for architecture violations...\n`);
  
  for (const fullPath of allFiles) {
    const relativePath = relative(PROJECT_ROOT, fullPath).replace(/^[\/\\]/, '');
    const imports = extractImports(fullPath);
    
    // Check MIZAN files for forbidden Abjad imports
    if (MIZAN_FILES.some(mizanFile => relativePath.includes(mizanFile))) {
      for (const imp of imports) {
        for (const pattern of FORBIDDEN_MIZAN_IMPORTS) {
          if (pattern.test(imp.content)) {
            violations.push({
              type: 'MIZAN_IMPORTS_ABJAD',
              file: relativePath,
              line: imp.line,
              import: imp.content,
              severity: 'CRITICAL',
            });
          }
        }
      }
    }
    
    // Check ABJAD files for forbidden Mizan imports
    if (ABJAD_FILES.some(abjadFile => relativePath.includes(abjadFile))) {
      for (const imp of imports) {
        for (const pattern of FORBIDDEN_ABJAD_IMPORTS) {
          if (pattern.test(imp.content)) {
            violations.push({
              type: 'ABJAD_IMPORTS_MIZAN',
              file: relativePath,
              line: imp.line,
              import: imp.content,
              severity: 'CRITICAL',
            });
          }
        }
      }
    }
  }
  
  return violations;
}

// ── MAIN VALIDATION ──
console.log('═══════════════════════════════════════════════════════════════');
console.log('   MIZAN PERMANENT LOCK VALIDATOR v1.0.0');
console.log('   Authority: MIZAN MANUSCRIPT (Verified & Validated)');
console.log('═══════════════════════════════════════════════════════════════\n');

const violations = detectViolations();

if (violations.length > 0) {
  console.error('❌ ARCHITECTURE LAW VIOLATION DETECTED\n');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error(`   Total Violations: ${violations.length}`);
  console.error('═══════════════════════════════════════════════════════════════\n');
  
  violations.forEach((v, i) => {
    console.error(`[${i + 1}] ${v.severity} — ${v.type}`);
    console.error(`    File: ${v.file}`);
    console.error(`    Line: ${v.line}`);
    console.error(`    Import: ${v.import}`);
    console.error('');
  });
  
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('   ❌ BUILD ABORTED — Architecture law violation detected');
  console.error('   Cross-module imports are STRICTLY PROHIBITED');
  console.error('   Please remove the violating imports and retry');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error('');
  console.error('   FORBIDDEN OPERATIONS:');
  console.error('   - MIZAN → ABJAD imports (functions, datasets, constants)');
  console.error('   - ABJAD → MIZAN imports (engines, tables, utilities)');
  console.error('   - Shared state, cache, or calculation engines');
  console.error('');
  console.error('   REQUIRED ACTION:');
  console.error('   1. Remove all cross-module imports listed above');
  console.error('   2. Use only module-local resources');
  console.error('   3. Re-run validation');
  console.error('═══════════════════════════════════════════════════════════════');
  
  throw new Error('Architecture law violation — build aborted');
}

console.log('✅ ARCHITECTURE LAW VALIDATION PASSED\n');
console.log('STATUS:');
console.log('  ABJAD MODULE:          ✅ SEALED');
console.log('  MIZAN MODULE:          ✅ SEALED');
console.log('  PERMANENT ISOLATION:   ✅ TRUE');
console.log('  CROSS-IMPORTS:         ✅ NONE DETECTED\n');
console.log('✅ BUILD CAN PROCEED\n');
console.log('═══════════════════════════════════════════════════════════════');
console.log('MIZAN Permanent Lock v1.0.0 — ENFORCED');
console.log('═══════════════════════════════════════════════════════════════');