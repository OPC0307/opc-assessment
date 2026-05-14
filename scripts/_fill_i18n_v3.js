// Fill dictionaries using improved tokenizer with source pre-processing
// Key: pre-process source to remove tags not in template (like i18n.js)
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

// Pre-process source to make it structurally match the template
function preprocessSource(src, tpl) {
  // Remove i18n.js script tag (build-time i18n doesn't need it)
  src = src.replace(/<script\s+src="[^"]*i18n\.js"[^>]*><\/script>/g, '');
  src = src.replace(/<script\s+src="[^"]*i18n\.js"[^>]*\s+defer[^>]*><\/script>/g, '');

  // For templates that have nav but source doesn't, we need special handling
  // Check if template has nav and source doesn't
  const tplHasNav = tpl.includes('class="site-nav"');
  const srcHasNav = src.includes('class="site-nav"');

  if (tplHasNav && !srcHasNav) {
    // Source lacks nav - insert a placeholder nav from template
    // Extract nav from template
    const navMatch = tpl.match(/<nav\s+class="site-nav"[\s\S]*?<\/nav>/);
    if (navMatch) {
      // Find <body...> tag and insert nav after it
      src = src.replace(/(<body[^>]*>)/, '$1\n' + navMatch[0]);
    }
  }

  return src;
}

function extractValues(tplRaw, srcRaw) {
  let tpl = tplRaw
    .replace(/\{\{#if zh\}\}/g, '')
    .replace(/\{\{#if en\}\}[\s\S]*?\{\{\/if\}\}/g, '')
    .replace(/\{\{\/if\}\}/g, '');

  // Pre-process source to align structure
  let src = preprocessSource(srcRaw, tpl);

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
      const token = m[1];
      if (token.trim()) tokens.push(token);
    }
    return tokens;
  }

  const tplTokens = tokenize(tplClean);
  const srcTokens = tokenize(src);

  const result = {};
  let ti = 0, si = 0;

  function tagsMatch(a, b) {
    const aNorm = a.replace(/\s+/g, ' ').trim();
    const bNorm = b.replace(/\s+/g, ' ').trim();
    if (aNorm === bNorm) return true;
    // Match by tag name only for simple tags
    const aTag = a.match(/^<\/?(\w+)/);
    const bTag = b.match(/^<\/?(\w+)/);
    if (aTag && bTag && aTag[1] === bTag[1] && a.startsWith('</') === b.startsWith('</')) {
      return true;
    }
    return false;
  }

  let consecutiveSkips = 0;
  const MAX_SKIPS = 50;

  while (ti < tplTokens.length && si < srcTokens.length && consecutiveSkips < MAX_SKIPS) {
    const tt = tplTokens[ti];
    const st = srcTokens[si];
    const ttIsTag = tt.startsWith('<');
    const stIsTag = st.startsWith('<');

    if (ttIsTag && stIsTag) {
      if (tagsMatch(tt, st)) {
        ti++; si++;
        consecutiveSkips = 0;
      } else {
        // Tags don't match - try to find matching tag
        // Look ahead in source
        let found = false;
        for (let look = si + 1; look < Math.min(si + 20, srcTokens.length); look++) {
          if (srcTokens[look].startsWith('<') && tagsMatch(tt, srcTokens[look])) {
            si = look;
            found = true;
            break;
          }
        }
        if (!found) {
          // Look ahead in template instead
          for (let look = ti + 1; look < Math.min(ti + 20, tplTokens.length); look++) {
            if (tplTokens[look].startsWith('<') && tagsMatch(tplTokens[look], st)) {
              ti = look;
              found = true;
              break;
            }
          }
        }
        if (!found) { si++; consecutiveSkips++; }
      }
    } else if (tt.includes('\x00PH')) {
      // Template has placeholder - extract source text
      const phMatch = tt.match(/\x00PH(\d+)\x00/);
      if (phMatch) {
        const idx = parseInt(phMatch[1]);
        const ph = placeholders[idx];

        // Find the next matching tag in template after this placeholder
        let nextTplTag = null;
        for (let look = ti + 1; look < Math.min(ti + 10, tplTokens.length); look++) {
          if (tplTokens[look].startsWith('<') && !tplTokens[look].includes('\x00PH')) {
            nextTplTag = tplTokens[look];
            break;
          }
        }

        // Collect source tokens until matching next tag
        let val = '';
        let foundEnd = false;
        while (si < srcTokens.length) {
          const st = srcTokens[si];
          if (st.startsWith('<')) {
            if (nextTplTag && tagsMatch(st, nextTplTag)) {
              foundEnd = true;
              break;
            }
            // Inline formatting tags in triple-brace mode: include them
            if (ph.triple && /^<\/?(?:strong|b|i|em|span|a|br)\b/.test(st)) {
              val += st;
              si++;
              continue;
            }
            // Non-inline structural tag: stop for non-triple
            if (!ph.triple) break;
            // For triple, include if it looks like inline
            if (/^<\/?(?:p|div|section|h[1-6]|ul|ol|li|table|tr|td|th|blockquote|article|nav|footer|head|body|html)\b/.test(st)) {
              break;
            }
            val += st;
            si++;
            continue;
          }
          val += st;
          si++;
        }

        if (!foundEnd && nextTplTag && si >= srcTokens.length) {
          // Reached end without matching; use what we have
        }

        val = val.replace(/\s+/g, ' ').trim();
        if (!ph.triple) {
          val = val.replace(/<[^>]+>/g, '').trim();
        }
        if (val.length > 0) {
          result[ph.key] = val;
        }
      }
      ti++;
      consecutiveSkips = 0;
    } else if (!ttIsTag && !stIsTag) {
      // Both text - compare
      const ttClean = tt.replace(/\s+/g, ' ').trim();
      const stClean = st.replace(/\s+/g, ' ').trim();
      if (ttClean === stClean) {
        ti++; si++; consecutiveSkips = 0;
      } else if (ttClean.length > 0 && stClean.includes(ttClean.substring(0, Math.min(15, ttClean.length)))) {
        ti++;
      } else {
        si++;
        consecutiveSkips++;
      }
    } else if (ttIsTag && !stIsTag) {
      si++; consecutiveSkips++;
    } else {
      ti++; consecutiveSkips++;
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
    if (!val) continue;
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
    if (!val) continue;
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
