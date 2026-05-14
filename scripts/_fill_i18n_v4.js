// v4: Fill remaining placeholders with targeted approaches
// 1. Shared keys (nav, footer, brand) — hardcoded
// 2. Meta/SEO keys — regex extraction from source files
// 3. Content keys — regex patterns per template key
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

function tryFill(dict, key, val) {
  if (val && needsFill(dict, key)) {
    set(dict, key, val);
    return true;
  }
  return false;
}

// ============================================================
// 1. SHARED KEYS — hardcoded values
// ============================================================
const sharedZh = {
  'brand.og_site_name': 'OPC 一人公司孵化器',
  'nav.brand_url': '/',
  'nav.quiz_url': '/quiz.html',
  'nav.subsidy_url': '/subsidy/',
  'nav.services_url': '/services/',
  'nav.blog_url': '/blog/',
  'nav.about_url': '/about.html',
  'footer.home_url': '/',
  'footer.privacy_url': '/privacy.html',
};

const sharedEn = {
  'brand.og_site_name': 'OPC One-Person Company Incubator',
  'nav.brand_url': '/en/',
  'nav.quiz_url': '/en/quiz.html',
  'nav.subsidy_url': '/en/subsidy/',
  'nav.services_url': '/en/services/',
  'nav.blog_url': '/en/blog/',
  'nav.about_url': '/en/about.html',
  'footer.home_url': '/en/',
  'footer.privacy_url': '/en/privacy.html',
};

let total = 0;
for (const [k, v] of Object.entries(sharedZh)) { if (tryFill(zh, k, v)) total++; }
for (const [k, v] of Object.entries(sharedEn)) { if (tryFill(en, k, v)) total++; }
console.log(`Shared keys: ${total}`);

// ============================================================
// 2. META/SEO/LANG keys — regex extraction from source files
// ============================================================
const metaPatterns = [
  ['meta_desc', /<meta\s+name="description"\s+content="([^"]+)"/],
  ['keywords', /<meta\s+name="keywords"\s+content="([^"]+)"/],
  ['canonical', /<link\s+rel="canonical"\s+href="([^"]+)"/],
  ['og_title', /<meta\s+property="og:title"\s+content="([^"]+)"/],
  ['og_desc', /<meta\s+property="og:description"\s+content="([^"]+)"/],
  ['og_url', /<meta\s+property="og:url"\s+content="([^"]+)"/],
  ['og_site', /<meta\s+property="og:site_name"\s+content="([^"]+)"/],
  ['twitter_title', /<meta\s+name="twitter:title"\s+content="([^"]+)"/],
  ['twitter_desc', /<meta\s+name="twitter:description"\s+content="([^"]+)"/],
];

const langSwitchMap = {
  'index': '/en/',
  'about': '/en/about.html',
  'privacy': '/en/privacy.html',
  'checkout': '/en/checkout.html',
  'page404': '/en/404.html',
  'cases': '/en/cases.html',
  'services_index': '/en/services/',
  'services_process': '/en/services/process.html',
  'services_registration': '/en/services/registration.html',
  'services_subsidy': '/en/services/subsidy.html',
  'services_tax': '/en/services/tax-basics.html',
  'subsidy_index': '/en/subsidy/',
  'subsidy_checklist': '/en/subsidy/checklist.html',
};

const enLangSwitchMap = {
  'index': '/',
  'about': '/about.html',
  'privacy': '/privacy.html',
  'checkout': '/checkout.html',
  'page404': '/404.html',
  'cases': '/cases.html',
  'services_index': '/services/',
  'services_process': '/services/process.html',
  'services_registration': '/services/registration.html',
  'services_subsidy': '/services/subsidy.html',
  'services_tax': '/services/tax-basics.html',
  'subsidy_index': '/subsidy/',
  'subsidy_checklist': '/subsidy/checklist.html',
};

const pageMap = [
  ['index', 'index.html', 'en/index.html'],
  ['about', 'about.html', 'en/about.html'],
  ['privacy', 'privacy.html', 'en/privacy.html'],
  ['checkout', 'checkout.html', 'en/checkout.html'],
  ['page404', '404.html', 'en/404.html'],
  ['cases', 'cases.html', 'en/cases.html'],
  ['services_index', 'services/index.html', 'en/services/index.html'],
  ['services_process', 'services/process.html', 'en/services/process.html'],
  ['services_registration', 'services/registration.html', 'en/services/registration.html'],
  ['services_subsidy', 'services/subsidy.html', 'en/services/subsidy.html'],
  ['services_tax', 'services/tax-basics.html', 'en/services/tax-basics.html'],
  ['subsidy_index', 'subsidy/index.html', 'en/subsidy/index.html'],
  ['subsidy_checklist', 'subsidy/checklist.html', 'en/subsidy/checklist.html'],
];

let metaTotal = 0;
for (const [prefix, zhFile, enFile] of pageMap) {
  const zhSrcPath = path.join(DEPLOY, zhFile);
  const enSrcPath = path.join(DEPLOY, enFile);

  // Extract from zh source
  if (fs.existsSync(zhSrcPath)) {
    const src = fs.readFileSync(zhSrcPath, 'utf8');
    for (const [key, re] of metaPatterns) {
      const m = src.match(re);
      if (m) metaTotal += tryFill(zh, `${prefix}.${key}`, m[1]);
    }
    // title
    const titleM = src.match(/<title>([^<]+)<\/title>/);
    if (titleM) metaTotal += tryFill(zh, `${prefix}.title`, titleM[1]);
  }

  // Extract from en source
  if (fs.existsSync(enSrcPath)) {
    const src = fs.readFileSync(enSrcPath, 'utf8');
    for (const [key, re] of metaPatterns) {
      const m = src.match(re);
      if (m) metaTotal += tryFill(en, `${prefix}.${key}`, m[1]);
    }
    const titleM = src.match(/<title>([^<]+)<\/title>/);
    if (titleM) metaTotal += tryFill(en, `${prefix}.title`, titleM[1]);
  }

  // lang_switch_url
  if (langSwitchMap[prefix]) metaTotal += tryFill(zh, `${prefix}.lang_switch_url`, langSwitchMap[prefix]);
  if (enLangSwitchMap[prefix]) metaTotal += tryFill(en, `${prefix}.lang_switch_url`, enLangSwitchMap[prefix]);

  // lang_toggle
  metaTotal += tryFill(zh, `${prefix}.lang_toggle`, 'EN');
  metaTotal += tryFill(en, `${prefix}.lang_toggle`, '中文');
}
console.log(`Meta/SEO keys: ${metaTotal}`);

// ============================================================
// 3. CONTENT KEYS — extract from original source files
// ============================================================

// 3a. First 5 pages — extract text from original source
// These pages have specific structures we can match

// --- index.html ---
let idx = readSrc('index.html');
if (idx) {
  // stat_income
  let m = idx.match(/stat-number[^>]*>([^<]+)</);
  if (m) tryFill(zh, 'index.stat_income', m[1].trim());
  m = idx.match(/stat-number[^>]*>([^<]+)</g);
  // stat_income_label
  m = idx.match(/stat-label[^>]*>([^<]+)</);
  if (m) tryFill(zh, 'index.stat_income_label', m[1].trim());

  // Services section
  m = idx.match(/<h2[^>]*class="[^"]*section-heading[^"]*"[^>]*>([^<]+)</);
  if (m) tryFill(zh, 'index.services_heading', m[1].trim());

  // Service cards
  m = idx.match(/service-cta[^>]*>([^<]+)</);
  if (m) tryFill(zh, 'index.service1_cta', m[1].trim());

  // Cases heading
  tryFill(zh, 'index.cases_heading', extractAfter(idx, '案例', 'h2'));
  tryFill(zh, 'index.case1_title', extractAfter(idx, '装修工头', 'h3'));
  tryFill(zh, 'index.case1_desc', extractText(idx, '从接零活'));
  tryFill(zh, 'index.case1_cta', extractAfter(idx, '看完整案例', 'a'));

  // Trust section
  tryFill(zh, 'index.trust_heading', extractAfter(idx, '为什么选择', 'h2'));
  tryFill(zh, 'index.trust_text', extractText(idx, '我们走过'));

  // CTA
  m = idx.match(/cta-title[^>]*>([^<]+)</);
  if (m) tryFill(zh, 'index.cta_title', m[1].trim());
  m = idx.match(/cta-desc[^>]*>([^<]+)</);
  if (m) tryFill(zh, 'index.cta_desc', m[1].trim());
  m = idx.match(/cta-button[^>]*>([^<]+)</);
  if (m) tryFill(zh, 'index.cta_button', m[1].trim());
}

// en/index.html
let enIdx = readSrc('en/index.html');
if (enIdx) {
  let m = enIdx.match(/stat-number[^>]*>([^<]+)</);
  if (m) tryFill(en, 'index.stat_income', m[1].trim());
  m = enIdx.match(/stat-number[^>]*>([^<]+)</g);
  m = enIdx.match(/stat-label[^>]*>([^<]+)</);
  if (m) tryFill(en, 'index.stat_income_label', m[1].trim());
  m = enIdx.match(/section-heading[^>]*>([^<]+)</);
  if (m) tryFill(en, 'index.services_heading', m[1].trim());
  m = enIdx.match(/service-cta[^>]*>([^<]+)</);
  if (m) tryFill(en, 'index.service1_cta', m[1].trim());
  tryFill(en, 'index.cases_heading', extractAfter(enIdx, 'Real Cases', 'h2'));
  tryFill(en, 'index.cta_title', extractAfter(enIdx, 'Start', 'h2'));
  tryFill(en, 'index.cta_desc', extractText(enIdx, 'Take the'));
  m = enIdx.match(/cta-button[^>]*>([^<]+)</);
  if (m) tryFill(en, 'index.cta_button', m[1].trim());
}

// --- about.html ---
let about = readSrc('about.html');
let enAbout = readSrc('en/about.html');

// --- privacy.html ---
let privacy = readSrc('privacy.html');
let enPrivacy = readSrc('en/privacy.html');
if (privacy) {
  // Extract the main content
  let m = privacy.match(/<article[^>]*class="privacy-content"[^>]*>([\s\S]*?)<\/article>/);
  if (m) tryFill(zh, 'privacy.content', m[1].trim());
}
if (enPrivacy) {
  let m = enPrivacy.match(/<article[^>]*class="privacy-content"[^>]*>([\s\S]*?)<\/article>/);
  if (m) tryFill(en, 'privacy.content', m[1].trim());
}

// --- 404.html ---
let pg404 = readSrc('404.html');
let en404 = readSrc('en/404.html');
if (pg404) {
  let m = pg404.match(/404-code[^>]*>([^<]+)</);
  if (m) tryFill(zh, '404.code', m[1].trim());
  m = pg404.match(/404-heading[^>]*>([^<]+)</);
  if (m) tryFill(zh, '404.heading', m[1].trim());
  m = pg404.match(/404-sub[^>]*>([^<]+)</);
  if (m) tryFill(zh, '404.sub', m[1].trim());
  m = pg404.match(/home-link[^>]*href="([^"]+)"/);
  if (m) tryFill(zh, '404.home_url', m[1].trim());
  m = pg404.match(/home-link[^>]*>([^<]+)</);
  if (m) tryFill(zh, '404.home_link', m[1].trim());
}
if (en404) {
  let m = en404.match(/404-code[^>]*>([^<]+)</);
  if (m) tryFill(en, '404.code', m[1].trim());
  m = en404.match(/404-heading[^>]*>([^<]+)</);
  if (m) tryFill(en, '404.heading', m[1].trim());
  m = en404.match(/404-sub[^>]*>([^<]+)</);
  if (m) tryFill(en, '404.sub', m[1].trim());
  m = en404.match(/home-link[^>]*href="([^"]+)"/);
  if (m) tryFill(en, '404.home_url', m[1].trim());
  m = en404.match(/home-link[^>]*>([^<]+)</);
  if (m) tryFill(en, '404.home_link', m[1].trim());
}

// --- checkout.html ---
let checkout = readSrc('checkout.html');
let enCheckout = readSrc('en/checkout.html');
if (checkout) {
  tryFill(zh, 'checkout.price_note', extractText(checkout, '限时优惠'));
  tryFill(zh, 'checkout.qr_instruction', extractText(checkout, '扫码'));
}
if (enCheckout) {
  tryFill(en, 'checkout.price_note', extractText(enCheckout, 'Limited'));
  tryFill(en, 'checkout.qr_instruction', extractText(enCheckout, 'Scan'));
}

console.log(`First 5 pages content done`);

// 3b. Remaining content keys from new pages
// Most were filled by v3, just a few edge cases remain

// cases page
let casesZh = readSrc('cases.html');
if (casesZh) {
  tryFill(zh, 'cases.case1_bg_text2', extractTextNear(casesZh, '背景', 2));
  tryFill(zh, 'cases.case1_time', extractTime(casesZh));
  tryFill(zh, 'cases.case2_bg_text2', extractTextNear(casesZh, '设计师', 2));
  tryFill(zh, 'cases.case2_time', extractTime2(casesZh));
  tryFill(zh, 'cases.case3_bg_text2', extractTextNear(casesZh, '教练', 2));
}

// ============================================================
// 4. EN CONTENT — extract from en/ source files
// ============================================================
// The en/ files have real English text; we need to extract it
// Most new pages' en content wasn't filled because v3 couldn't match

let enTotal2 = 0;

// en/cases.html
let enCases = readSrc('en/cases.html');
if (enCases) {
  // Extract all text nodes and assign to cases.* keys by position
  const enKeys = getEnKeys('cases', en);
  if (enKeys.length > 0) {
    const texts = extractAllTextNodes(enCases);
    let txtIdx = 0;
    for (const key of enKeys) {
      if (txtIdx < texts.length && needsFill(en, key)) {
        set(en, key, texts[txtIdx]);
        enTotal2++;
        txtIdx++;
      }
    }
  }
}

// en/services/index.html
let enSvcIdx = readSrc('en/services/index.html');
if (enSvcIdx) {
  const enKeys = getEnKeys('services_index', en);
  if (enKeys.length > 0) {
    const texts = extractAllTextNodes(enSvcIdx);
    let txtIdx = 0;
    for (const key of enKeys) {
      if (txtIdx < texts.length && needsFill(en, key)) {
        set(en, key, texts[txtIdx]);
        enTotal2++;
        txtIdx++;
      }
    }
  }
}

// en/services/registration.html
let enSvcReg = readSrc('en/services/registration.html');
if (enSvcReg) {
  const enKeys = getEnKeys('services_registration', en);
  if (enKeys.length > 0) {
    const texts = extractAllTextNodes(enSvcReg);
    let txtIdx = 0;
    for (const key of enKeys) {
      if (txtIdx < texts.length && needsFill(en, key)) {
        set(en, key, texts[txtIdx]);
        enTotal2++;
        txtIdx++;
      }
    }
  }
}

// en/services/subsidy.html
let enSvcSub = readSrc('en/services/subsidy.html');
if (enSvcSub) {
  const enKeys = getEnKeys('services_subsidy', en);
  if (enKeys.length > 0) {
    const texts = extractAllTextNodes(enSvcSub);
    let txtIdx = 0;
    for (const key of enKeys) {
      if (txtIdx < texts.length && needsFill(en, key)) {
        set(en, key, texts[txtIdx]);
        enTotal2++;
        txtIdx++;
      }
    }
  }
}

// en/services/tax-basics.html
let enSvcTax = readSrc('en/services/tax-basics.html');
if (enSvcTax) {
  const enKeys = getEnKeys('services_tax', en);
  if (enKeys.length > 0) {
    const texts = extractAllTextNodes(enSvcTax);
    let txtIdx = 0;
    for (const key of enKeys) {
      if (txtIdx < texts.length && needsFill(en, key)) {
        set(en, key, texts[txtIdx]);
        enTotal2++;
        txtIdx++;
      }
    }
  }
}

// en/subsidy/index.html
let enSubIdx = readSrc('en/subsidy/index.html');
if (enSubIdx) {
  const enKeys = getEnKeys('subsidy_index', en);
  if (enKeys.length > 0) {
    const texts = extractAllTextNodes(enSubIdx);
    let txtIdx = 0;
    for (const key of enKeys) {
      if (txtIdx < texts.length && needsFill(en, key)) {
        set(en, key, texts[txtIdx]);
        enTotal2++;
        txtIdx++;
      }
    }
  }
}

// en/subsidy/checklist.html
let enSubChk = readSrc('en/subsidy/checklist.html');
if (enSubChk) {
  const enKeys = getEnKeys('subsidy_checklist', en);
  if (enKeys.length > 0) {
    const texts = extractAllTextNodes(enSubChk);
    let txtIdx = 0;
    for (const key of enKeys) {
      if (txtIdx < texts.length && needsFill(en, key)) {
        set(en, key, texts[txtIdx]);
        enTotal2++;
        txtIdx++;
      }
    }
  }
}

console.log(`En new pages content: ${enTotal2}`);

// ============================================================
// 5. Save and report
// ============================================================
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

function listPH(obj, prefix) {
  const r = [];
  for (const [k, v] of Object.entries(obj)) {
    const kp = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      if (v.startsWith('__ZH__') || v.startsWith('__EN__')) r.push(kp);
    } else if (typeof v === 'object') {
      r.push(...listPH(v, kp));
    }
  }
  return r;
}

const zhRem = countPH(zh);
const enRem = countPH(en);
console.log(`\nzh remaining: ${zhRem}, en remaining: ${enRem}`);

if (zhRem > 0 || enRem > 0) {
  console.log('\n=== Remaining zh ===');
  listPH(zh, '').forEach(k => console.log('  ' + k));
  console.log('\n=== Remaining en ===');
  listPH(en, '').forEach(k => console.log('  ' + k));
}

// ============================================================
// Helper functions
// ============================================================
function readSrc(relPath) {
  const p = path.join(DEPLOY, relPath);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  return null;
}

function extractAfter(html, search, tag) {
  const idx = html.indexOf(search);
  if (idx === -1) return null;
  const after = html.substring(idx);
  const m = after.match(new RegExp(`<${tag}[^>]*>([^<]+)<`));
  return m ? m[1].trim() : null;
}

function extractText(html, search) {
  const idx = html.indexOf(search);
  if (idx === -1) return null;
  const before = html.substring(Math.max(0, idx - 200), idx);
  const after = html.substring(idx, idx + 500);
  // Get text between nearest tags
  const m = before.match(/>([^<>]{2,200})$/);
  if (m) return m[1].trim();
  const m2 = after.match(/^([^<>]{2,200})</);
  if (m2) return m2[1].trim();
  return null;
}

function extractTextNear(html, search, nth) {
  const idx = html.indexOf(search);
  if (idx === -1) return null;
  let pos = idx;
  for (let i = 0; i < nth; i++) {
    pos = html.indexOf(search, pos + 1);
    if (pos === -1) return null;
  }
  // Get next text node
  const after = html.substring(pos);
  const m = after.match(/>([^<]+)</);
  return m ? m[1].trim() : null;
}

function extractTime(html) {
  // Find first time pattern
  const m = html.match(/(\d{4}\s*[年.]\s*\d{1,2}\s*[月])/);
  return m ? m[1] : null;
}

function extractTime2(html) {
  const matches = html.match(/(\d{4}\s*[年.]\s*\d{1,2}\s*[月])/g);
  return matches && matches.length > 1 ? matches[1] : null;
}

function extractAllTextNodes(html) {
  const cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '');

  const nodes = [];
  const re = />([^<]+)</g;
  let m;
  while ((m = re.exec(cleaned)) !== null) {
    const t = m[1].replace(/\s+/g, ' ').trim();
    if (t && t.length > 1 && t.length < 2000) {
      // Filter out pure symbols, numbers, structural text
      if (/^[\s\d.,!?;:'"()\-–—|•·✓✗✕✔✖→←↑↓▲▼►◄©®™+\-/*=#@$%^&]+$/.test(t)) continue;
      if (/^(首页|关于|隐私|测评|补贴|服务|博客|EN|中文|OPC|Home|About|Privacy|Assessment|Subsidy|Services|Blog)$/.test(t)) continue;
      nodes.push(t);
    }
  }
  return nodes;
}

function getEnKeys(prefix, dict) {
  const node = dict[prefix];
  if (!node || typeof node !== 'object') return [];

  // Collect keys that need filling, preserving hierarchy
  const keys = [];
  function walk(obj, path) {
    for (const [k, v] of Object.entries(obj)) {
      const fullKey = path ? `${path}.${k}` : k;
      if (typeof v === 'string') {
        if (v.startsWith('__EN__')) keys.push(fullKey);
      } else if (typeof v === 'object') {
        walk(v, fullKey);
      }
    }
  }
  walk(node, prefix);
  // Sort by key depth then alphabetically for stable ordering
  keys.sort();
  return keys;
}
