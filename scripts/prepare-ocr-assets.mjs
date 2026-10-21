// Serve OCR code/models from this app. Document pixels never leave the device.
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
const target = path.resolve('public/ocr/v7');
await mkdir(`${target}/core`, { recursive: true });
await mkdir(`${target}/lang`, { recursive: true });
await copyFile('node_modules/tesseract.js/dist/worker.min.js', `${target}/worker.min.js`);
for (const name of await readdir('node_modules/tesseract.js-core')) {
  if (/\.wasm(?:\.js)?$/.test(name)) await copyFile(`node_modules/tesseract.js-core/${name}`, `${target}/core/${name}`);
}
for (const lang of ['ara', 'eng', 'mal']) {
  await copyFile(`node_modules/@tesseract.js-data/${lang}/4.0.0_best_int/${lang}.traineddata.gz`, `${target}/lang/${lang}.traineddata.gz`);
}
console.log('Prepared local OCR worker, WebAssembly cores and Arabic/English/Malayalam models.');
