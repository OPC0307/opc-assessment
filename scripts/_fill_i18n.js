// Fill zh.json and en.json by direct tag-anchored extraction
// Walks template (with {{t.KEY}} placeholders) and source side by side
// Matching happens at HTML tag boundaries
const fs = require('fs');
const path = require('path');

const DEPLOY = __dirname + '/..';
const I18N = DEPLOY + '/i18n';

let zh = JSON.parse(fs.readFileSync(I18N + '/zh.json', 'utf8'));
let en = JSON.parse(fs.readFileSync(I18N + '/en.json', 'utf8'));

function set(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!node[parts[i]] || typeof node[parts[i]] !== 'object') node[parts[i]] = {};
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
}

function needsFill(dict, key) {
  const parts = key.split('.');
  let node = dict;
  for (const p of parts) {
    if (!node || typeof node !== 'object' || !(p in node)) return true;
    node = node[p];
  }
  if (typeof node !== 'string') return true;
  return node.startsWith('__ZH__') || node.startsWith('__EN__');
}

// Walk template and source together, extracting text where template has placeholders
function extractValues(tplRaw, srcRaw) {
  // Process template for zh/lang-appropriate
  let tpl = tplRaw
    .replace(/\{\{#if zh\}\}/g, '')
    .replace(/\{\{#if en\}\}[\s\S]*?\{\{\/if\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '');

  // Collect placeholders with positions
  const placeholders = [];
  const phRe = /\{\{\{?t\.([a-z0-9_.]+)\}\}\}?/g;
  let m;
  while ((m = phRe.exec(tpl)) !== null) {
    placeholders.push({ key: m[1], start: m.index, end: m.index + m[0].length });
  }

  if (placeholders.length === 0) return {};

  // Replace placeholders with unique sentinels (reversed order to preserve indices)
  let tplClean = tpl;
  for (let i = placeholders.length - 1; i >= 0; i--) {
    const ph = placeholders[i];
    const sentinel = `\x00PH${i}\x00`;
    tplClean = tplClean.substring(0, ph.start) + sentinel + tplClean.substring(ph.end);
  }

  // Split both strings into tokens: tags and text
  function tokenize(str) {
    const tokens = [];
    const re = /(<[^>]+>|[^<]+)/g;
    let m;
    while ((m = re.exec(str)) !== null) {
      tokens.push(m[1]);
    }
    return tokens;
  }

  const tplTokens = tokenize(tplClean);
  const srcTokens = tokenize(srcRaw);

  // Walk through both token arrays simultaneously
  // Match on tags (structural anchors), extract text where template has sentinel
  const result = {};
  let ti = 0, si = 0;

  while (ti < tplTokens.length && si < srcTokens.length) {
    const tt = tplTokens[ti];
    const st = srcTokens[si];

    const ttIsTag = tt.startsWith('<');
    const stIsTag = st.startsWith('<');

    if (ttIsTag && stIsTag) {
      // Both tags: normalize and compare
      const ttNorm = tt.replace(/\s+/g, ' ').trim();
      const stNorm = st.replace(/\s+/g, ' ').trim();
      if (ttNorm === stNorm) {
        ti++; si++;
      } else {
        // Tags don't match - try to sync
        // If template tag has placeholder content, it might be different
        if (tt.includes('\x00PH')) {
          ti++;
        } else {
          si++;
        }
      }
    } else if (!ttIsTag && !stIsTag) {
      // Both text
      const ttTrim = tt.trim();
      const stTrim = st.trim();

      if (ttTrim === stTrim) {
        // Same text, advance both
        ti++; si++;
      } else if (ttTrim.includes('\x00PH')) {
        // Template has a sentinel - extract source text
        const phMatch = ttTrim.match(/\x00PH(\d+)\x00/);
        if (phMatch) {
          const phIdx = parseInt(phMatch[1]);
          const key = placeholders[phIdx].key;
          // The source text at this position is the value
          // Clean it up
          let val = stTrim
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .trim();
          if (val && val.length > 0) {
            result[key] = val;
          }
        }
        ti++; si++;
      } else {
        // Texts differ, advance the one that seems "behind"
        // Try to find the shorter text in the longer one
        if (stTrim.length < ttTrim.length || ttTrim.includes(stTrim)) {
          si++;
        } else {
          ti++;
        }
      }
    } else if (ttIsTag && !stIsTag) {
      // Template has tag, source has text - skip source text
      si++;
    } else {
      // Template has text, source has tag - skip template text
      ti++;
    }
  }

  return result;
}

// Process all 13 pages
const pages = [
  // First 5 core pages (original source at deploy/)
  ['index', 'templates/index.html', 'index.html'],
  ['about', 'templates/about.html', 'about.html'],
  ['privacy', 'templates/privacy.html', 'privacy.html'],
  ['checkout', 'templates/checkout.html', 'checkout.html'],
  ['page404', 'templates/404.html', '404.html'],
  // 8 new pages
  ['cases', 'templates/cases.html', 'cases.html'],
  ['services_index', 'templates/services/index.html', 'services/index.html'],
  ['services_process', 'templates/services/process.html', 'services/process.html'],
  ['services_registration', 'templates/services/registration.html', 'services/registration.html'],
  ['services_subsidy', 'templates/services/subsidy.html', 'services/subsidy.html'],
  ['services_tax', 'templates/services/tax-basics.html', 'services/tax-basics.html'],
  ['subsidy_index', 'templates/subsidy/index.html', 'subsidy/index.html'],
  ['subsidy_checklist', 'templates/subsidy/checklist.html', 'subsidy/checklist.html'],
];

const enPages = [
  // For en, the source files are in en/ directory
  ['cases', 'templates/cases.html', 'en/cases.html'],
  ['services_index', 'templates/services/index.html', 'en/services/index.html'],
  ['services_process', 'templates/services/process.html', 'en/services/process.html'],
  ['services_registration', 'templates/services/registration.html', 'en/services/registration.html'],
  ['services_subsidy', 'templates/services/subsidy.html', 'en/services/subsidy.html'],
  ['services_tax', 'templates/services/tax-basics.html', 'en/services/tax-basics.html'],
  ['subsidy_index', 'templates/subsidy/index.html', 'en/subsidy/index.html'],
  ['subsidy_checklist', 'templates/subsidy/checklist.html', 'en/subsidy/checklist.html'],
];

// For the first 5 en pages, the en/ versions were generated and have existing English text
// but their keys are under different names. Let me handle them manually.
// Actually, looking at the existing en.json, the first 5 have values under different prefixes.

console.log('=== Filling zh.json ===');
let zhTotal = 0;
for (const [prefix, tplFile, srcFile] of pages) {
  const tplPath = path.join(DEPLOY, tplFile);
  const srcPath = path.join(DEPLOY, srcFile);
  if (!fs.existsSync(tplPath) || !fs.existsSync(srcPath)) {
    console.log(`  SKIP: ${tplFile} or ${srcFile} missing`);
    continue;
  }
  const tpl = fs.readFileSync(tplPath, 'utf8');
  const src = fs.readFileSync(srcPath, 'utf8');
  const values = extractValues(tpl, src);
  let filled = 0;
  for (const [key, val] of Object.entries(values)) {
    if (!val) continue;
    // Only fill if key is under this prefix
    if (!key.startsWith(prefix + '.') && key !== prefix) continue;
    if (needsFill(zh, key)) {
      set(zh, key, val);
      filled++;
    }
  }
  console.log(`  ${prefix}: ${filled} keys (${Object.keys(values).length} extracted)`);
  zhTotal += filled;
}
console.log(`Total zh filled: ${zhTotal}`);

console.log('\n=== Filling en.json ===');
let enTotal = 0;
for (const [prefix, tplFile, enFile] of enPages) {
  const tplPath = path.join(DEPLOY, tplFile);
  const enPath = path.join(DEPLOY, enFile);
  if (!fs.existsSync(tplPath) || !fs.existsSync(enPath)) {
    console.log(`  SKIP: ${tplFile} or ${enFile} missing`);
    continue;
  }
  const tpl = fs.readFileSync(tplPath, 'utf8');
  const enSrc = fs.readFileSync(enPath, 'utf8');
  const values = extractValues(tpl, enSrc);
  let filled = 0;
  for (const [key, val] of Object.entries(values)) {
    if (!val) continue;
    if (!key.startsWith(prefix + '.') && key !== prefix) continue;
    if (needsFill(en, key)) {
      set(en, key, val);
      filled++;
    }
  }
  console.log(`  ${prefix}: ${filled} keys (${Object.keys(values).length} extracted)`);
  enTotal += filled;
}
console.log(`Total en filled: ${enTotal}`);

// Save
fs.writeFileSync(I18N + '/zh.json', JSON.stringify(zh, null, 2) + '\n');
fs.writeFileSync(I18N + '/en.json', JSON.stringify(en, null, 2) + '\n');

function countPH(obj) {
  let n = 0;
  for (const v of Object.values(obj)) {
    if (typeof v === 'string') { if (v.startsWith('__ZH__') || v.startsWith('__EN__')) n++; }
    else if (typeof v === 'object') n += countPH(v);
  }
  return n;
}
console.log(`\nRemaining: zh=${countPH(zh)}, en=${countPH(en)}`);
