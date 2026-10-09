import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { transform } from 'esbuild';

const read = (name) => JSON.parse(fs.readFileSync(name, 'utf8'));
const root = process.cwd();
const file = p => fs.readFileSync(path.join(root, p), 'utf8');
const chapter = read('src/data/birhatiahFullSourceChapter.json');
const single = read('src/data/birhatiahArabicSinglePage.json');
const invocation = read('src/data/birhatiahArabicInvocationSources.json');
const shared = read('src/data/birhatiahSharedBookAccounts.json');
const expanded = read('src/data/birhatiahExpandedVersions.json');
const guides = read('src/data/birhatiahReaderGuide.json');
const outside2020 = read('src/data/birhatiahOutsideMethods2020.json');
const outside2023 = read('src/data/birhatiahOutsideMethods2023.json');

assert.equal(chapter.pages.length, 24);
assert.equal(Object.keys(chapter.name_pages).length, 28);
assert.deepEqual(chapter.pages.map(p => p.printed_page), Array.from({length:24}, (_, i) => i + 67));
assert.equal(invocation.pages.length, 3);
assert.equal(invocation.transcription.length, 10);
assert.equal(shared.accounts.length, 55);
assert.equal(shared.figures.length, 8);
assert.equal(expanded.versions.length, 6);
assert.equal(Object.keys(guides).length, 28);
const listedPages = new Set(chapter.pages.map(p => p.printed_page));
for (let i = 1; i <= 28; i++) {
  const id = `HNK-MHC-${String(i).padStart(3, '0')}`;
  assert.ok(chapter.name_pages[id]?.length, `${id}: no source pages mapped`);
  for (const n of chapter.name_pages[id]) assert.ok(listedPages.has(n), `${id}: unmapped source page ${n}`);
}
const invPages = new Set(invocation.pages.map(page => page.pdf_page));
for (const t of invocation.transcription) {
  assert.ok(invPages.has(t.pdf_page), `${t.id}: no inline source page found`);
  assert.ok(t.arabic && t.translation?.ml && t.translation?.en, `${t.id}: incomplete bilingual source`);
}
const referencedImages = [
  ...chapter.pages.map(p => p.image_path),
  single.image_path,
  ...invocation.pages.map(p => p.image_path),
  ...invocation.accounts.map(p => p.image_path),
  ...shared.figures.map(p => p.image_path),
  ...shared.accounts.map(p => p.edition_comparison?.image_path),
  ...expanded.versions.flatMap(v => v.arabic_pages.map(n => `/figures/birhatiah-manba-p${n}.png`)),
  ...Object.values(guides).flatMap(g => [g, ...(g.other_methods || [])])
    .flatMap(m => [m.figure?.image_path, ...(m.source_pages || []).map(n => `/figures/birhatiah-manba-p${n}.png`)]),
  ...[...outside2020.methods, ...outside2023.methods].map(m => m.figure?.image_path),
].filter(Boolean);
const localImages = [...new Set(referencedImages)];
for (const imagePath of localImages) {
  assert.match(imagePath, /^\/figures\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|svg|webp)$/, `Invalid relative figure path: ${imagePath}`);
  assert.ok(fs.existsSync(path.join(root, 'public', imagePath.slice(1))), `Missing on-site image: ${imagePath}`);
}

const sourceFiles = [
  'src/components/holynameknowledge/BirhatiahArabicInvocationSources.jsx',
  'src/components/holynameknowledge/BirhatiahSharedBookAccounts.jsx',
  'src/components/holynameknowledge/BirhatiahExpandedVersions.jsx',
  'src/components/holynameknowledge/BirhatiahCollectiveVersion.jsx',
  'src/components/holynameknowledge/BirhatiahFullSourceChapter.jsx',
  'src/components/holynameknowledge/SectionCNames.jsx',
];
for (const p of sourceFiles) await transform(file(p), { loader:'jsx', sourcefile:p, target:'es2022' });
const invocationUI = file(sourceFiles[0]);
const sharedUI = file(sourceFiles[1]);
const extendedUI = file(sourceFiles[2]);
const collectiveUI = file(sourceFiles[3]);
const nameUI = file(sourceFiles[5]);
assert.ok(invocationUI.includes('data-source-image="inline-edition"'));
assert.ok(invocationUI.includes('data-reader-section="optional-source-links"'));
assert.ok(!invocationUI.includes('source.pages.find(page => page.pdf_page === entry.pdf_page).image_path'), 'Clickable page-only references still remain');
assert.ok(sharedUI.includes('data-source-image="inline-comparison"'));
for (const [label, html] of [['Invocation pages', invocationUI], ['Shared figures', sharedUI], ['Expanded recensions', extendedUI], ['Collective text', collectiveUI]]) {
  assert.ok(!/<a\b[^>]*>\s*<img\b/i.test(html), `${label} must not use an image-opening link`);
}
assert.ok(nameUI.includes('data-testid="section-c-retry"'), 'A working retry action is required');
assert.ok(nameUI.includes('onClick={() => setRetryIndex(index => index + 1)}'), 'Retry control does not retrigger the loader');
assert.ok(nameUI.includes('[retryIndex]'), 'Retry state does not trigger an effect');
assert.ok(nameUI.includes('data-testid="section-c-incomplete-count"'), 'Partial 28-name results need a warning');
assert.ok(nameUI.includes('aria-expanded={isOpen}') && nameUI.includes('aria-controls={`section-c-detail-${card.name_id}`}'));
console.log(`PASS: ${localImages.length} verified on-site source images, 24 chapter pages across 28 names, 55 shared accounts, 3 Arabic invocation pages, inline figures, retry action, and JSX.`);
