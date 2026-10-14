import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const book = JSON.parse(fs.readFileSync('src/data/birhatiahSharedBookAccounts.json', 'utf8'));
const figures = [...book.figures, ...book.source_figures];
assert.equal(book.figures.length, 8);
assert.equal(book.source_figures.length, 3);
assert.equal(new Set(figures.map(figure => figure.id)).size, 11);
const accounts = new Set(book.accounts.map(entry => entry.id));
for (const figure of figures) {
  assert.ok(accounts.has(figure.owner_account_id));
  assert.ok(figure.related_account_ids.includes(figure.owner_account_id));
  assert.ok(figure.related_account_ids.every(id => accounts.has(id)));
  assert.ok(figure.caption.ml && figure.caption.en);
  for (const image of [figure, figure.arabic_comparison].filter(Boolean)) {
    assert.match(image.image_path, /^\/figures\/[\w-]+\.png$/);
    const data = fs.readFileSync(`public${image.image_path}`);
    if (image.crop) {
      const [x,y,w,h] = image.crop.view_box.split(' ').map(Number);
      assert.deepEqual([image.crop.source_width, image.crop.source_height], [data.readUInt32BE(16), data.readUInt32BE(20)], 'Source dimensions must match the unchanged PNG');
      assert.ok([x,y,w,h].every(Number.isFinite));
      assert.ok(x >= 0 && y >= 0 && w > 0 && h > 0 && x+w <= image.crop.source_width && y+h <= image.crop.source_height);
    }
  }
}
for (const [id,page] of [['shared-013',78],['shared-038',82]]) {
  const entry = book.accounts.find(item => item.id === id);
  assert.equal(entry.source_word_note.arabic, 'قرنفل');
  assert.equal(entry.source_word_note.printed_page, page);
  assert.ok(entry.translation.en.includes('cloves') && entry.translation.ml.includes('ഗ്രാമ്പൂ'));
  assert.ok(!entry.translation.en.includes('carnation') && !entry.translation.ml.includes('കാർണേഷൻ'));
}
const output = path.join(os.tmpdir(), `section-c-collective-figures-${process.pid}.cjs`);
try {
  await build({stdin: {contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import Shared from './src/components/holynameknowledge/BirhatiahSharedBookAccounts.jsx'; import {HolyNamesLanguageContext} from './src/components/holynameknowledge/HolyNamesLanguageContext.jsx'; export const render = (language, initialQuery = '') => renderToStaticMarkup(React.createElement(HolyNamesLanguageContext.Provider, {value:{language}}, React.createElement(Shared,{initialQuery})));`, resolveDir:process.cwd(),loader:'jsx'}, outfile:output,bundle:true,platform:'node',format:'cjs',jsx:'automatic',alias:{'@':path.join(process.cwd(),'src')}});
  const {render} = createRequire(import.meta.url)(output);
  for (const language of ['ml','en']) {
    const html = render(language);
    assert.equal((html.match(/data-shared-figure=/g) || []).length, 11, 'Show each original figure once');
    assert.equal((html.match(/data-source-image="inline-arabic-shared-account"/g) || []).length, 8);
    for (const figure of figures) {
      const start = html.indexOf(`data-shared-account="${figure.owner_account_id}"`);
      const next = html.indexOf('data-shared-account=', start+1);
      const accountHtml = html.slice(start, next < 0 ? undefined : next);
      assert.ok(accountHtml.includes(`data-shared-figure="${figure.id}"`), 'Figure must appear with its correct account');
      assert.equal((html.match(new RegExp(`id="${figure.id}"`, 'g')) || []).length, 1);
    }
    const entry = book.accounts.find(item => item.id === 'shared-041');
    const searched = render(language, entry.translation[language].slice(0,90));
    assert.equal((searched.match(/data-shared-figure=/g) || []).length, 1, 'Searching a related account must still reveal its referenced image');
    assert.ok(searched.includes('data-shared-figure="shared-figure-172"'));
    assert.ok(!searched.includes('shared-figure-180'));
    const empty = render(language, 'NO_MATCH_982735');
    assert.ok(!empty.includes('data-shared-figure=') && !empty.includes('href="#shared-'));
  }
  console.log('PASS: card 29 links 8 supplied figures and 3 additional original-sign regions to their accounts; Arabic comparisons, untouched cells, both languages and filtered-image placement verified.');
} finally {
  fs.rmSync(output, {force:true});
}
