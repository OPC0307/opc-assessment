// Fill zh.json by walking template and source in lockstep
// Template has {{t.KEY}} where source has actual text
// We walk through both strings, matching structural elements,
// and extract text from source where template has placeholders
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

function extractValues(tplContent, srcContent) {
  // Process template as zh
  let tpl = tplContent
    .replace(/\{\{#if zh\}\}/g, '')
    .replace(/\{\{#if en\}\}[\s\S]*?\{\{\/if\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '');

  const results = {};
  const replacements = []; // [{start, end, key}]

  // Find all {{t.KEY}} and {{{t.KEY}}}
  const placeholderRe = /\{\{\{?t\.([a-z0-9_.]+)\}\}\}?/g;
  let m;
  while ((m = placeholderRe.exec(tpl)) !== null) {
    replacements.push({ start: m.index, end: m.index + m[0].length, key: m[1] });
  }

  if (replacements.length === 0) return results;

  // Now walk through tpl and src character by character
  // The idea: remove all placeholders from tpl to get "structural" template
  // The source should match this structure exactly (modulo whitespace)

  // Build a regex from tpl that captures text between structural elements
  let tplClean = tpl;
  // Replace placeholders with a unique marker that won't appear in HTML
  const markers = [];
  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i];
    const marker = `\x00\x00${i}\x00\x00`;
    tplClean = tplClean.substring(0, r.start) + marker + tplClean.substring(r.end);
    markers.unshift({ marker, key: r.key });
  }

  // Now tplClean has markers where placeholders were
  // Split on markers to get structural parts
  const parts = tplClean.split(/\x00\x00\d+\x00\x00/);

  // For each part, find it in src and extract text between parts
  let srcIdx = 0;
  const extracted = {};

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i === 0) {
      // First part: skip whitespace and find in src
      const trimmed = part.trim();
      if (trimmed) {
        // Find start of first part in src
        const searchStart = trimmed.substring(0, Math.min(60, trimmed.length));
        const found = src.indexOf(searchStart);
        if (found !== -1) srcIdx = found + searchStart.length;
      }
      continue;
    }

    // This is part after marker[i-1]
    // The text between previous srcIdx and start of this part in src is the value for marker[i-1]
    const trimmed = part.trim();
    let found = -1;

    if (trimmed) {
      const searchStart = trimmed.substring(0, Math.min(60, trimmed.length));
      found = src.indexOf(searchStart, srcIdx);
    } else if (i < parts.length - 1) {
      // Empty part between two markers
      const nextPart = parts[i + 1].trim();
      if (nextPart) {
        const searchStart = nextPart.substring(0, Math.min(60, nextPart.length));
        found = src.indexOf(searchStart, srcIdx);
      }
    }

    if (found !== -1) {
      const extractedText = src.substring(srcIdx, found).trim();
      const key = markers[i - 1].key;
      if (extractedText && !extracted.match(/^\s*$/)) {
        // Clean up: remove HTML but preserve text
        let clean = extractedText
          .replace(/<[^>]+>/g, '') // Remove HTML tags
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim();
        if (clean && clean.length > 1) {
          extracted[key] = clean;
        }
      }
      srcIdx = found + (trimmed ? searchStart.length : 0);
    }
  }

  return extracted;
}

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

function fill(dict, pairsList, langCheck) {
  let total = 0;
  for (const [tplPath, srcPath] of pairsList) {
    if (!fs.existsSync(path.join(DEPLOY, srcPath))) {
      console.log(`SKIP: ${srcPath}`);
      continue;
    }
    const tpl = fs.readFileSync(path.join(DEPLOY, tplPath), 'utf8');
    const src = fs.readFileSync(path.join(DEPLOY, srcPath), 'utf8');
    const extracted = extractValues(tpl, src);
    let filled = 0;
    for (const [key, value] of Object.entries(extracted)) {
      const existing = getNested(dict, key);
      if (!existing || langCheck(existing)) {
        setNested(dict, key, value);
        filled++;
      }
    }
    console.log(`  ${srcPath}: ${filled} keys`);
    total += filled;
  }
  return total;
}

console.log('=== Filling zh.json ===');
const zhFilled = fill(zh, pairs, v => v.startsWith('__ZH__') || v.startsWith('__EN__'));
console.log(`zh filled: ${zhFilled}`);

console.log('\n=== Filling en.json ===');
const enFilled = fill(en, enPairs, v => v.startsWith('__EN__') || v.startsWith('__ZH__'));
console.log(`en filled: ${enFilled}`);

fs.writeFileSync(I18N + '/zh.json', JSON.stringify(zh, null, 2) + '\n');
fs.writeFileSync(I18N + '/en.json', JSON.stringify(en, null, 2) + '\n');

function countPH(obj) {
  let n = 0;
  for (const v of Object.values(obj)) {
    if (typeof v === 'string') {
      if (v.startsWith('__ZH__') || v.startsWith('__EN__')) n++;
    } else if (typeof v === 'object') n += countPH(v);
  }
  return n;
}
console.log(`\nRemaining zh PH: ${countPH(zh)}, en PH: ${countPH(en)}`);
