// Fill zh.json by directly extracting text from original source files
// using DOM-like text extraction and sequential matching
const fs = require('fs');
const path = require('path');

const DEPLOY = __dirname + '/..';
const I18N = DEPLOY + '/i18n';

const zh = JSON.parse(fs.readFileSync(I18N + '/zh.json', 'utf8'));

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

// Extract all text leaf nodes from HTML in document order
function extractTextNodes(html) {
  // Remove scripts, styles, comments
  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const texts = [];
  // Match text between > and <, excluding tags
  const regex = />([^<]*)</g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const text = m[1].trim();
    if (text && text.length > 0) {
      texts.push(text);
    }
  }
  return texts;
}

// Replace {{t.*}} and {{{t.*}}} in template with sentinels, extract keys
function getTemplateKeys(tplContent) {
  const keys = [];
  // Process for zh first
  let tpl = tplContent
    .replace(/\{\{#if zh\}\}/g, '')
    .replace(/\{\{#if en\}\}[\s\S]*?\{\{\/if\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '');

  // Replace triple-brace first (HTML content)
  tpl = tpl.replace(/\{\{\{t\.([a-z0-9_.]+)\}\}\}/g, (m, key) => {
    keys.push(key);
    return ` SENTINEL_${keys.length - 1} `;
  });

  // Replace double-brace
  tpl = tpl.replace(/\{\{t\.([a-z0-9_.]+)\}\}/g, (m, key) => {
    keys.push(key);
    return ` SENTINEL_${keys.length - 1} `;
  });

  // Now extract text nodes from this processed template
  // The sentinels will appear in the text nodes
  const textNodes = extractTextNodes(tpl);
  const orderedKeys = [];
  for (const node of textNodes) {
    const sentinelRegex = /SENTINEL_(\d+)/g;
    let sm;
    while ((sm = sentinelRegex.exec(node)) !== null) {
      orderedKeys.push(keys[parseInt(sm[1])]);
    }
  }

  return orderedKeys;
}

function fillFromPair(tplPath, srcPath, dict, langCheck) {
  const tpl = fs.readFileSync(path.join(DEPLOY, tplPath), 'utf8');
  const src = fs.readFileSync(path.join(DEPLOY, srcPath), 'utf8');

  // Get ordered keys from template
  const orderedKeys = getTemplateKeys(tpl);

  // Get ordered text nodes from source
  const srcTexts = extractTextNodes(src);

  // Match keys to source texts
  // We need to align them. Since template has the same structure as source,
  // we can use position heuristics.

  let filled = 0;
  let srcIdx = 0;

  for (let i = 0; i < orderedKeys.length && srcIdx < srcTexts.length; i++) {
    const key = orderedKeys[i];
    const existing = langCheck(dict, key);

    // Skip if already has a proper value
    if (existing && !existing.startsWith('__ZH__') && !existing.startsWith('__EN__')) {
      // Still need to advance srcIdx - find a matching text
      continue;
    }

    // Try to find a text that's not a single character or purely numeric/HTML entity
    let found = false;
    for (let j = srcIdx; j < srcTexts.length; j++) {
      const candidate = srcTexts[j];
      if (candidate && candidate.length > 1 && !/^[&;a-z]+$/.test(candidate)) {
        setNested(dict, key, candidate);
        srcIdx = j + 1;
        filled++;
        found = true;
        break;
      }
    }
    if (!found) srcIdx++;
  }

  return filled;
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

let totalFilled = 0;
for (const [tplPath, srcPath] of pairs) {
  if (!fs.existsSync(path.join(DEPLOY, srcPath))) {
    console.log(`SKIP: ${srcPath} (not found)`);
    continue;
  }
  const filled = fillFromPair(tplPath, srcPath, zh,
    (d, k) => getNested(d, k));
  console.log(`  ${srcPath}: filled ${filled} zh keys`);
  totalFilled += filled;
}

console.log(`\nTotal zh keys filled: ${totalFilled}`);

fs.writeFileSync(I18N + '/zh.json', JSON.stringify(zh, null, 2) + '\n');
console.log('zh.json saved');

// Count remaining placeholders
function countPH(obj) {
  let n = 0;
  for (const v of Object.values(obj)) {
    if (typeof v === 'string') {
      if (v.startsWith('__ZH__') || v.startsWith('__EN__')) n++;
    } else if (typeof v === 'object') n += countPH(v);
  }
  return n;
}
console.log(`Remaining placeholders: ${countPH(zh)}`);
