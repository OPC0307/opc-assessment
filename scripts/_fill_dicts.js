// Fill zh.json from original CN source files and en.json from existing EN files
const fs = require('fs');
const path = require('path');

const DEPLOY = __dirname + '/..';
const I18N = DEPLOY + '/i18n';

const zh = JSON.parse(fs.readFileSync(I18N + '/zh.json', 'utf8'));
const en = JSON.parse(fs.readFileSync(I18N + '/en.json', 'utf8'));

function setNested(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!node[parts[i]] || typeof node[parts[i]] !== 'object') node[parts[i]] = {};
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
}

function getNested(obj, keyPath) {
  const parts = keyPath.split('.');
  let node = obj;
  for (const p of parts) {
    if (!node || typeof node !== 'object' || !(p in node)) return null;
    node = node[p];
  }
  return typeof node === 'string' ? node : null;
}

// Replace {{t.*}} placeholders with sentinel, then diff with source
function extractFromPair(tplPath, srcPath) {
  const tpl = fs.readFileSync(path.join(DEPLOY, tplPath), 'utf8');
  const src = fs.readFileSync(path.join(DEPLOY, srcPath), 'utf8');

  // Process template for zh: keep zh blocks, remove en blocks
  let tplZh = tpl
    .replace(/\{\{#if zh\}\}/g, '')
    .replace(/\{\{#if en\}\}[\s\S]*?\{\{\/if\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '');

  // Collect all keys in order
  const keys = [];
  let sentinelIdx = 0;
  const sentinelMap = {};

  tplZh = tplZh.replace(/\{\{t\.([a-z0-9_.]+)\}\}/g, (match, key) => {
    const sentinel = `\x00S${sentinelIdx++}\x00`;
    sentinelMap[sentinel] = key;
    keys.push(key);
    return sentinel;
  });

  // Also replace {{{t.*}}} (triple-brace for HTML-containing values)
  tplZh = tplZh.replace(/\{\{\{t\.([a-z0-9_.]+)\}\}\}/g, (match, key) => {
    const sentinel = `\x00S${sentinelIdx++}\x00`;
    sentinelMap[sentinel] = key;
    keys.push(key);
    return sentinel;
  });

  // Now walk through tplZh and src character by character, extracting text
  const results = {};
  const sentinels = tplZh.match(/\x00S\d+\x00/g) || [];

  if (sentinels.length === 0) return results;

  // Build a regex that splits on sentinels
  const splitRegex = /\x00S\d+\x00/;
  const tplParts = tplZh.split(splitRegex);

  // For each gap between template parts, find the corresponding text in source
  let srcPos = 0;
  for (let i = 0; i < tplParts.length - 1; i++) {
    const part = tplParts[i];
    if (!part) { srcPos = 0; continue; }

    // Normalize part for matching (collapse whitespace)
    const partNorm = part.replace(/\s+/g, ' ');
    const partTrim = partNorm.trim();
    if (!partTrim) continue;

    // Find this part in source starting from srcPos
    // Use first 40 chars as search pattern
    const searchStr = partTrim.substring(0, Math.min(40, partTrim.length));
    const foundIdx = src.indexOf(searchStr, srcPos);
    if (foundIdx === -1) continue;

    // The text between srcPos and foundIdx is what was replaced by the previous sentinel
    if (i > 0 && sentinels[i - 1]) {
      const extractedText = src.substring(srcPos, foundIdx).trim();
      const key = sentinelMap[sentinels[i - 1]];
      if (key && extractedText && !results[key]) {
        // Clean up HTML entities and normalize
        let clean = extractedText
          .replace(/\n\s+/g, ' ')
          .replace(/<br>/g, '')
          .trim();
        if (clean) results[key] = clean;
      }
    }

    srcPos = foundIdx + searchStr.length;
    // Advance srcPos past the rest of the part
    const remainingPart = partTrim.substring(Math.min(40, partTrim.length));
    if (remainingPart) {
      const nextIdx = src.indexOf(remainingPart, srcPos);
      if (nextIdx !== -1 && nextIdx - srcPos < 200) {
        srcPos = nextIdx + remainingPart.length;
      }
    }
  }

  return results;
}

// Process each page pair
const pairs = [
  ['templates/cases.html', 'cases.html'],
  ['templates/services/index.html', 'services/index.html'],
  ['templates/services/process.html', 'services/process.html'],
  ['templates/services/registration.html', 'services/registration.html'],
  ['templates/services/subsidy.html', 'services/subsidy.html'],
  ['templates/services/tax-basics.html', 'services/tax-basics.html'],
  ['templates/subsidy/index.html', 'subsidy/index.html'],
  ['templates/subsidy/checklist.html', 'subsidy/checklist.html'],
];

let totalFilled = 0;
for (const [tplPath, srcPath] of pairs) {
  if (!fs.existsSync(path.join(DEPLOY, srcPath))) {
    console.log(`SKIP (no source): ${srcPath}`);
    continue;
  }
  const results = extractFromPair(tplPath, srcPath);
  let filled = 0;
  for (const [key, value] of Object.entries(results)) {
    const existing = getNested(zh, key);
    // Only fill if value is a placeholder or doesn't exist
    if (!existing || existing.startsWith('__ZH__') || existing.startsWith('__EN__')) {
      setNested(zh, key, value);
      filled++;
    }
  }
  console.log(`  ${srcPath}: filled ${filled} zh keys`);
  totalFilled += filled;
}

console.log(`\nTotal zh keys filled: ${totalFilled}`);

// Also try to fill en.json from existing en/ files
const enPairs = [
  ['templates/cases.html', 'en/cases.html'],
  ['templates/services/index.html', 'en/services/index.html'],
  ['templates/services/process.html', 'en/services/process.html'],
  ['templates/services/registration.html', 'en/services/registration.html'],
  ['templates/services/subsidy.html', 'en/services/subsidy.html'],
  ['templates/services/tax-basics.html', 'en/services/tax-basics.html'],
  ['templates/subsidy/index.html', 'en/subsidy/index.html'],
  ['templates/subsidy/checklist.html', 'en/subsidy/checklist.html'],
];

let totalEnFilled = 0;
for (const [tplPath, enPath] of enPairs) {
  if (!fs.existsSync(path.join(DEPLOY, enPath))) {
    console.log(`SKIP (no EN source): ${enPath}`);
    continue;
  }
  const results = extractFromPair(tplPath, enPath);
  let filled = 0;
  for (const [key, value] of Object.entries(results)) {
    const existing = getNested(en, key);
    if (!existing || existing.startsWith('__EN__') || existing.startsWith('__ZH__')) {
      setNested(en, key, value);
      filled++;
    }
  }
  console.log(`  ${enPath}: filled ${filled} en keys`);
  totalEnFilled += filled;
}

console.log(`\nTotal en keys filled: ${totalEnFilled}`);

// Write updated dictionaries
fs.writeFileSync(I18N + '/zh.json', JSON.stringify(zh, null, 2) + '\n');
fs.writeFileSync(I18N + '/en.json', JSON.stringify(en, null, 2) + '\n');

console.log('\nDictionaries saved.');

// Count remaining placeholders
let zhPlaceholders = 0;
let enPlaceholders = 0;
function countPlaceholders(obj) {
  let count = 0;
  for (const v of Object.values(obj)) {
    if (typeof v === 'string') {
      if (v.startsWith('__ZH__') || v.startsWith('__EN__')) count++;
    } else if (typeof v === 'object') {
      count += countPlaceholders(v);
    }
  }
  return count;
}
zhPlaceholders = countPlaceholders(zh);
enPlaceholders = countPlaceholders(en);
console.log(`Remaining zh placeholders: ${zhPlaceholders}`);
console.log(`Remaining en placeholders: ${enPlaceholders}`);
