import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import process from 'node:process';

const lock = JSON.parse(await readFile(new URL('../calculation-core.lock.json', import.meta.url), 'utf8'));
const mismatches = [];

for (const [file, expected] of Object.entries(lock.files)) {
  try {
    const contents = await readFile(new URL(`../${file}`, import.meta.url));
    const actual = createHash('sha256').update(contents).digest('hex');
    if (actual !== expected) mismatches.push({ file, expected, actual });
  } catch (error) {
    mismatches.push({ file, expected, actual: `unreadable: ${error.message}` });
  }
}

if (mismatches.length) {
  console.error('\nCalculation core integrity check FAILED.');
  console.error('A locked formula, method, or source-value file changed.');
  for (const item of mismatches) {
    console.error(`- ${item.file}`);
    console.error(`  expected: ${item.expected}`);
    console.error(`  actual:   ${item.actual}`);
  }
  console.error('\nOnly update the lock after a source-verified, reviewed correction.\n');
  process.exit(1);
}

console.log(`Calculation core integrity check passed (${Object.keys(lock.files).length} locked files).`);
