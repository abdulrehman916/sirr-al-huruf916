import assert from 'node:assert/strict';
import { createWorker } from 'tesseract.js';
// Smoke tests for the shipped engine/models, not a claim of OCR accuracy on books.
for (const [language, fixture, expected] of [
  ['eng', 'english', 'OWNER LIBRARY OCR CHECK 916'],
  ['ara', 'arabic', 'السلام عليكم'],
]) {
  const worker = await createWorker(language === 'ara' ? ['ara', 'eng'] : ['eng'], 1, {
    langPath: `${process.cwd()}/public/ocr/v7/lang`, cacheMethod: 'none',
  });
  try {
    const { data } = await worker.recognize(`scripts/fixtures/owner-ocr-${fixture}.png`);
    assert.ok(data.text.replace(/[\u200e\u200f]/g, '').includes(expected), `${language} OCR smoke test failed`);
    assert.ok(Number.isFinite(data.confidence));
  } finally { await worker.terminate(); }
}
console.log('PASS local English/Arabic OCR models, real recognition and worker cleanup. All imported pages still require review.');
