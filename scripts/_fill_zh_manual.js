// Directly populate zh.json from original source files
// Uses HTML parsing via regex to extract text between specific tags
const fs = require('fs');
const path = require('path');

const DEPLOY = __dirname + '/..';
const I18N = DEPLOY + '/i18n';

const zh = JSON.parse(fs.readFileSync(I18N + '/zh.json', 'utf8'));

function set(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!node[parts[i]] || typeof node[parts[i]] !== 'object') node[parts[i]] = {};
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
}

function get(obj, keyPath) {
  const parts = keyPath.split('.');
  let node = obj;
  for (const p of parts) {
    if (!node || typeof node !== 'object' || !(p in node)) return null;
    node = node[p];
  }
  return typeof node === 'string' ? node : null;
}

function needsFill(v) {
  return !v || v.startsWith('__ZH__') || v.startsWith('__EN__');
}

// Parse HTML and extract all actual text content node by node
function parseTextNodes(html) {
  // Remove scripts, styles, comments
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  const nodes = [];
  // Match everything between > and <
  const re = />([^<]*)</g;
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const text = m[1].replace(/\s+/g, ' ').trim();
    if (text && text.length > 0) {
      nodes.push(text);
    }
  }
  return nodes;
}

// Serial position-based alignment
function extractFromPair(tplPath, srcPath) {
  const tplRaw = fs.readFileSync(path.join(DEPLOY, tplPath), 'utf8');
  const srcRaw = fs.readFileSync(path.join(DEPLOY, srcPath), 'utf8');

  // Process template as zh
  let tpl = tplRaw
    .replace(/\{\{#if zh\}\}/g, '')
    .replace(/\{\{#if en\}\}[\s\S]*?\{\{\/if\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '');

  // Collect keys in order
  const keyOrder = [];
  tpl = tpl.replace(/\{\{\{?t\.([a-z0-9_.]+)\}\}\}?/g, (m, key) => {
    keyOrder.push(key);
    return '\x00KEY\x00';
  });

  // Get text nodes from template (with KEY sentinels)
  const tplNodes = parseTextNodes(tpl);
  const srcNodes = parseTextNodes(srcRaw);

  // Walk through both node lists, matching structural nodes and extracting text
  const result = {};
  let srcIdx = 0;
  let tplIdx = 0;

  for (const tplNode of tplNodes) {
    if (tplNode === 'KEY') {
      // This is a placeholder - find matching text in source
      // Try to find the next non-trivial text from source that isn't structural
      while (srcIdx < srcNodes.length) {
        const candidate = srcNodes[srcIdx];
        srcIdx++;

        // Skip structural markers: single chars, pure symbols, etc.
        if (candidate.length <= 1) continue;
        if (/^[|•·✓✗✕✔✖→←↑↓▲▼►◄]$/u.test(candidate)) continue;
        if (/^\d{2,4}[年]?\d{0,2}[月]?\d{0,2}[日]?$/.test(candidate)) continue;
        if (/^[A-Z]{2,}$/.test(candidate)) continue;

        // This is likely our text
        result[keyOrder[result._count || 0]] = candidate;
        if (!result._count) result._count = 0;
        result._count++;
        break;
      }
    } else {
      // Not a placeholder - advance src past this structural text
      // Find matching structural text in source
      for (let i = srcIdx; i < Math.min(srcIdx + 5, srcNodes.length); i++) {
        if (srcNodes[i] === tplNode) {
          srcIdx = i + 1;
          break;
        }
      }
      // If not found, try partial match
      if (srcIdx < srcNodes.length && tplNode.length > 3) {
        const search = tplNode.substring(0, Math.min(20, tplNode.length));
        for (let i = srcIdx; i < Math.min(srcIdx + 10, srcNodes.length); i++) {
          if (srcNodes[i].includes(search)) {
            srcIdx = i + (srcNodes[i] === tplNode ? 1 : 0);
            break;
          }
        }
      }
    }
  }

  const count = result._count || 0;
  delete result._count;
  return { data: result, count };
}

// Process all pages
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
let totalSkipped = 0;

for (const [tplPath, srcPath] of pairs) {
  if (!fs.existsSync(path.join(DEPLOY, srcPath))) {
    console.log(`SKIP source not found: ${srcPath}`);
    continue;
  }
  const { data, count } = extractFromPair(tplPath, srcPath);
  let filled = 0;
  let skipped = 0;
  for (const [key, value] of Object.entries(data)) {
    if (!value) continue;
    const existing = get(zh, key);
    if (needsFill(existing)) {
      set(zh, key, value);
      filled++;
    } else {
      skipped++;
    }
  }
  console.log(`  ${srcPath}: +${filled} new, ~${skipped} skipped (${count} keys found)`);
  totalFilled += filled;
  totalSkipped += skipped;
}

console.log(`\nTotal: ${totalFilled} filled, ${totalSkipped} skipped`);

fs.writeFileSync(I18N + '/zh.json', JSON.stringify(zh, null, 2) + '\n');

function countPH(obj) {
  let n = 0;
  for (const v of Object.values(obj)) {
    if (typeof v === 'string') { if (v.startsWith('__ZH__') || v.startsWith('__EN__')) n++; }
    else if (typeof v === 'object') n += countPH(v);
  }
  return n;
}
console.log(`Remaining zh placeholders: ${countPH(zh)}`);
