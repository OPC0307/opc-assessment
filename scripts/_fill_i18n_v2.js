// Fill dictionaries using improved tokenizer
// Key fix: when template has a sentinel, consume multiple source text tokens + inline tags
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

function extractValues(tplRaw, srcRaw) {
  let tpl = tplRaw
    .replace(/\{\{#if zh\}\}/g, '')
    .replace(/\{\{#if en\}\}[\s\S]*?\{\{\/if\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '');

  const placeholders = [];
  const phRe = /\{\{\{?t\.([a-z0-9_.]+)\}\}\}?/g;
  let m;
  while ((m = phRe.exec(tpl)) !== null) {
    placeholders.push({ key: m[1], start: m.index, end: m.index + m[0].length, triple: m[0].startsWith('{{{') });
  }

  if (placeholders.length === 0) return {};

  let tplClean = tpl;
  for (let i = placeholders.length - 1; i >= 0; i--) {
    const ph = placeholders[i];
    tplClean = tplClean.substring(0, ph.start) + `\x00PH${i}\x00` + tplClean.substring(ph.end);
  }

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

  // Improved algorithm: walk both token lists, using tags as sync points
  const result = {};
  let ti = 0, si = 0;

  function tagSignature(tag) {
    // Extract tag name and key attributes for matching
    const m = tag.match(/^<\/?(\w+)/);
    return m ? m[1].toLowerCase() : tag.substring(0, 10);
  }

  function tokensEqual(a, b) {
    return a.replace(/\s+/g, ' ').trim() === b.replace(/\s+/g, ' ').trim();
  }

  while (ti < tplTokens.length && si < srcTokens.length) {
    const tt = tplTokens[ti];
    const st = srcTokens[si];
    const ttIsTag = tt.startsWith('<');
    const stIsTag = st.startsWith('<');

    if (ttIsTag && stIsTag) {
      if (tokensEqual(tt, st)) {
        ti++; si++;
      } else if (tagSignature(tt) === tagSignature(st)) {
        // Same tag type but different attributes - skip both
        ti++; si++;
      } else {
        // Different tags - try to find next matching point
        // Look ahead in source for this template tag
        let found = false;
        for (let look = si + 1; look < Math.min(si + 5, srcTokens.length); look++) {
          if (srcTokens[look].startsWith('<') && tokensEqual(tt, srcTokens[look])) {
            si = look;
            found = true;
            break;
          }
        }
        if (!found) si++;
      }
    } else if (tt.includes('\x00PH')) {
      // Template has placeholder - extract text from source
      const phMatch = tt.match(/\x00PH(\d+)\x00/);
      if (phMatch) {
        const idx = parseInt(phMatch[1]);
        const ph = placeholders[idx];
        const isTriple = ph.triple;

        // Collect text from source until next tag that matches template's next tag
        let val = '';
        let nextTagInTpl = null;
        for (let look = ti + 1; look < Math.min(ti + 10, tplTokens.length); look++) {
          if (tplTokens[look].startsWith('<') && !tplTokens[look].includes('\x00PH')) {
            nextTagInTpl = tplTokens[look];
            break;
          }
        }

        // Collect source tokens until we hit the matching next tag
        while (si < srcTokens.length) {
          const st = srcTokens[si];
          if (st.startsWith('<') && nextTagInTpl && tokensEqual(st, nextTagInTpl)) {
            // Stop before this tag
            break;
          }
          if (st.startsWith('<') && !isTriple) {
            // For non-triple placeholders, inline tags go into value
            if (/^<\/?(?:strong|b|i|em|span|a|br)\b/.test(st)) {
              // Inline formatting allowed in regular {{t.*}}
              // But for regular placeholders, we strip tags
              si++;
              continue;
            }
            // Structural tag - stop
            break;
          }
          val += st;
          si++;
        }

        // Clean up
        val = val.replace(/\s+/g, ' ').trim();
        if (val && !isTriple) {
          // Strip inline tags for non-triple placeholders
          val = val.replace(/<[^>]+>/g, '').trim();
        }
        if (val.length > 0) {
          result[ph.key] = val;
        }
      }
      ti++;
    } else if (!ttIsTag && !stIsTag) {
      // Both plain text - compare
      const ttClean = tt.replace(/\s+/g, ' ').trim();
      const stClean = st.replace(/\s+/g, ' ').trim();
      if (ttClean === stClean) {
        ti++; si++;
      } else {
        // Texts differ - try to find st in tt or advance
        if (ttClean.length > 0 && stClean.includes(ttClean.substring(0, Math.min(10, ttClean.length)))) {
          ti++;
        } else {
          si++;
        }
      }
    } else if (ttIsTag && !stIsTag) {
      si++;
    } else {
      ti++;
    }
  }

  return result;
}

// Process zh
console.log('=== zh.json ===');
const pages = [
  ['index', 'templates/index.html', 'index.html'],
  ['about', 'templates/about.html', 'about.html'],
  ['privacy', 'templates/privacy.html', 'privacy.html'],
  ['checkout', 'templates/checkout.html', 'checkout.html'],
  ['page404', 'templates/404.html', '404.html'],
  ['cases', 'templates/cases.html', 'cases.html'],
  ['services_index', 'templates/services/index.html', 'services/index.html'],
  ['services_process', 'templates/services/process.html', 'services/process.html'],
  ['services_registration', 'templates/services/registration.html', 'services/registration.html'],
  ['services_subsidy', 'templates/services/subsidy.html', 'services/subsidy.html'],
  ['services_tax', 'templates/services/tax-basics.html', 'services/tax-basics.html'],
  ['subsidy_index', 'templates/subsidy/index.html', 'subsidy/index.html'],
  ['subsidy_checklist', 'templates/subsidy/checklist.html', 'subsidy/checklist.html'],
];

let zhTotal = 0;
for (const [prefix, tplFile, srcFile] of pages) {
  const tplPath = path.join(DEPLOY, tplFile);
  const srcPath = path.join(DEPLOY, srcFile);
  if (!fs.existsSync(srcPath)) { console.log(`  SKIP ${srcFile}`); continue; }
  const tpl = fs.readFileSync(tplPath, 'utf8');
  const src = fs.readFileSync(srcPath, 'utf8');
  const vals = extractValues(tpl, src);
  let filled = 0;
  for (const [key, val] of Object.entries(vals)) {
    if (needsFill(zh, key)) { set(zh, key, val); filled++; }
  }
  console.log(`  ${prefix}: ${filled}/${Object.keys(vals).length}`);
  zhTotal += filled;
}
console.log(`zh total: ${zhTotal}`);

// Process en
console.log('\n=== en.json ===');
const enPages = [
  ['index', 'templates/index.html', 'en/index.html'],
  ['about', 'templates/about.html', 'en/about.html'],
  ['page404', 'templates/404.html', 'en/404.html'],
  ['privacy', 'templates/privacy.html', 'en/privacy.html'],
  ['checkout', 'templates/checkout.html', 'en/checkout.html'],
  ['cases', 'templates/cases.html', 'en/cases.html'],
  ['services_index', 'templates/services/index.html', 'en/services/index.html'],
  ['services_process', 'templates/services/process.html', 'en/services/process.html'],
  ['services_registration', 'templates/services/registration.html', 'en/services/registration.html'],
  ['services_subsidy', 'templates/services/subsidy.html', 'en/services/subsidy.html'],
  ['services_tax', 'templates/services/tax-basics.html', 'en/services/tax-basics.html'],
  ['subsidy_index', 'templates/subsidy/index.html', 'en/subsidy/index.html'],
  ['subsidy_checklist', 'templates/subsidy/checklist.html', 'en/subsidy/checklist.html'],
];

let enTotal = 0;
for (const [prefix, tplFile, enFile] of enPages) {
  const tplPath = path.join(DEPLOY, tplFile);
  const enPath = path.join(DEPLOY, enFile);
  if (!fs.existsSync(enPath)) { console.log(`  SKIP ${enFile}`); continue; }
  const tpl = fs.readFileSync(tplPath, 'utf8');
  const enSrc = fs.readFileSync(enPath, 'utf8');
  const vals = extractValues(tpl, enSrc);
  let filled = 0;
  for (const [key, val] of Object.entries(vals)) {
    if (needsFill(en, key)) { set(en, key, val); filled++; }
  }
  console.log(`  ${prefix}: ${filled}/${Object.keys(vals).length}`);
  enTotal += filled;
}
console.log(`en total: ${enTotal}`);

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
console.log(`\nzh PH: ${countPH(zh)}, en PH: ${countPH(en)}`);
