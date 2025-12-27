// Simple i18n key checker for FireInvent-UI (CommonJS)
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const enFile = path.join(srcDir, 'i18n', 'locales', 'en', 'translation.json');
const deFile = path.join(srcDir, 'i18n', 'locales', 'de', 'translation.json');

function flatten(obj, prefix = '') {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value, newKey));
    } else {
      out[newKey] = value;
    }
  }
  return out;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx|js|jsx)$/.test(entry)) files.push(full);
  }
  return files;
}

function extractKeysFromFile(file) {
  const content = fs.readFileSync(file, 'utf8');
  const keys = new Set();
  const reSingle = /\bt\(\s*'([^'\n]+)'\s*\)/g;
  const reDouble = /\bt\(\s*"([^"\n]+)"\s*\)/g;
  let m;
  while ((m = reSingle.exec(content))) keys.add(m[1]);
  while ((m = reDouble.exec(content))) keys.add(m[1]);
  const reI18nSingle = /i18n\.t\(\s*'([^'\n]+)'\s*\)/g;
  const reI18nDouble = /i18n\.t\(\s*"([^"\n]+)"\s*\)/g;
  while ((m = reI18nSingle.exec(content))) keys.add(m[1]);
  while ((m = reI18nDouble.exec(content))) keys.add(m[1]);
  return keys;
}

function main() {
  const en = flatten(readJson(enFile));
  const de = flatten(readJson(deFile));

  const files = walk(srcDir, []);
  const used = new Set();
  for (const f of files) {
    const ks = extractKeysFromFile(f);
    ks.forEach((k) => used.add(k));
  }

  const dynamicPrefixes = ['itemCondition.', 'orderStatus.'];
  function isDynamic(k) {
    return dynamicPrefixes.some((p) => k.startsWith(p));
  }

  const missingEn = [];
  const missingDe = [];
  for (const k of used) {
    if (isDynamic(k)) continue;
    if (!(k in en)) missingEn.push(k);
    if (!(k in de)) missingDe.push(k);
  }

  missingEn.sort();
  missingDe.sort();

  const uniqueMissing = Array.from(
    new Set([...missingEn, ...missingDe]),
  ).sort();

  console.log('Total used keys:', used.size);
  console.log('Missing in EN:', missingEn.length);
  console.log('Missing in DE:', missingDe.length);
  console.log('--- Missing keys (union) ---');
  for (const k of uniqueMissing) console.log(k);
}

main();
