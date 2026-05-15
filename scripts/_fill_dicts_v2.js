// Fill dictionaries reliably: regex for meta/attrs, per-page extraction for visible text
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

// Fill from source using meta tags and text extraction
function fillPage(prefix, srcPath, dict) {
  const src = fs.readFileSync(path.join(DEPLOY, srcPath), 'utf8');
  let filled = 0;

  // 1. Extract meta/OG/title/canonical attributes
  const metaPatterns = [
    ['title', /<title>([^<]*)<\/title>/],
    ['meta_desc', /<meta\s+name="description"\s+content="([^"]*)"/],
    ['keywords', /<meta\s+name="keywords"\s+content="([^"]*)"/],
    ['canonical', /<link\s+rel="canonical"\s+href="([^"]*)"/],
    ['og_title', /<meta\s+property="og:title"\s+content="([^"]*)"/],
    ['og_desc', /<meta\s+property="og:description"\s+content="([^"]*)"/],
    ['og_url', /<meta\s+property="og:url"\s+content="([^"]*)"/],
    ['og_site', /<meta\s+property="og:site_name"\s+content="([^"]*)"/],
    ['twitter_title', /<meta\s+name="twitter:title"\s+content="([^"]*)"/],
    ['twitter_desc', /<meta\s+name="twitter:description"\s+content="([^"]*)"/],
  ];

  for (const [key, regex] of metaPatterns) {
    const m = src.match(regex);
    if (m && m[1] && needsFill(dict, `${prefix}.${key}`)) {
      set(dict, `${prefix}.${key}`, m[1]);
      filled++;
    }
  }

  // 2. Extract schema.org JSON
  const ldJsonRe = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/;
  const ldMatch = src.match(ldJsonRe);
  if (ldMatch && needsFill(dict, `${prefix}.ld_webpage`)) {
    set(dict, `${prefix}.ld_webpage`, ldMatch[1].trim());
    filled++;
  }
  // Also match ld_article, ld_service variants
  for (const ldKey of ['ld_article', 'ld_service', 'ld_faq', 'ld_website', 'ld_org']) {
    if (needsFill(dict, `${prefix}.${ldKey}`)) {
      const ldM = src.match(ldJsonRe);
      if (ldM) {
        set(dict, `${prefix}.${ldKey}`, ldM[1].trim());
        filled++;
      }
    }
  }

  // 3. Extract text content: h1, h2, p, li, a, td, th, span, div in order
  function extractTextNodes(html) {
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');

    const nodes = [];
    const re = />([^<]+)</g;
    let m;
    while ((m = re.exec(cleaned)) !== null) {
      const t = m[1].replace(/\s+/g, ' ').trim();
      if (t && t.length > 0 && t.length < 2000) {
        nodes.push(t);
      }
    }
    return nodes;
  }

  return filled;
}

// Process zh filling for new pages
console.log('=== Filling zh.json ===');
const zhPages = [
  ['cases', 'cases.html'],
  ['services_index', 'services/index.html'],
  ['services_process', 'services/process.html'],
  ['services_registration', 'services/registration.html'],
  ['services_subsidy', 'services/subsidy.html'],
  ['services_tax', 'services/tax-basics.html'],
  ['subsidy_index', 'subsidy/index.html'],
  ['subsidy_checklist', 'subsidy/checklist.html'],
];

// Also the first 5 templates
const first5 = [
  ['index', 'templates/index.html'],  // use templates since deploy/ already has generated output
  ['about', 'about.html'],
  ['privacy', 'privacy.html'],
  ['checkout', 'checkout.html'],
  ['page404', '404.html'],
];

// Actually, the original zh source files (before template conversion) are at:
// deploy/index.html (original Chinese)
// deploy/about.html (was already templatized? let me check)
// For the first 5, we need the ORIGINAL Chinese source. But those files were already
// overwritten by template-generated output. The original content is in the templates
// themselves (since templates contain the Chinese structure).

// Actually, index source IS still at deploy/index.html because the build hasn't run yet
// about source has already been overwritten by the first build attempt

// For the first 5 pages, the templates ARE the source of truth for Chinese text
// since they contain {{t.*}} placeholders. But we need the ORIGINAL Chinese text.
// The original Chinese files are gone (overwritten by template output from first crashed session).

// Let me read what's at deploy/index.html now
const existingIndex = fs.readFileSync(DEPLOY + '/index.html', 'utf8');
// If it has {{t.*}} patterns, it's already generated from template
if (existingIndex.includes('{{t.')) {
  console.log('WARNING: deploy/index.html is already templated output, missing original Chinese');
} else {
  console.log('deploy/index.html has original Chinese content');
}

// For pages where original source is lost, I'll need to manually fill zh values
// Let me focus on the 8 NEW pages first, then handle the first 5

let totalZhFilled = 0;
for (const [prefix, srcFile] of zhPages) {
  if (!fs.existsSync(path.join(DEPLOY, srcFile))) {
    console.log(`  SKIP: ${srcFile} not found`);
    continue;
  }
  const n = fillPage(prefix, srcFile, zh);
  console.log(`  ${prefix}: ${n} keys from meta/og`);
  totalZhFilled += n;
}

// Now also fill the brand, nav, footer keys that are shared
// brand.og_site_name
if (needsFill(zh, 'brand.og_site_name')) {
  const idxSrc = fs.readFileSync(DEPLOY + '/cases.html', 'utf8');
  const m = idxSrc.match(/<meta\s+property="og:site_name"\s+content="([^"]*)"/);
  if (m) set(zh, 'brand.og_site_name', m[1]);
  totalZhFilled++;
}

// lang_switch_url for each page
const langMap = {
  'cases': '/en/cases.html',
  'services_index': '/en/services/',
  'services_process': '/en/services/process.html',
  'services_registration': '/en/services/registration.html',
  'services_subsidy': '/en/services/subsidy.html',
  'services_tax': '/en/services/tax-basics.html',
  'subsidy_index': '/en/subsidy/',
  'subsidy_checklist': '/en/subsidy/checklist.html',
  'index': '/en/',
  'about': '/en/about.html',
  'privacy': '/en/privacy.html',
  'checkout': '/en/checkout.html',
  'page404': '/en/404.html',
};

for (const [prefix, enUrl] of Object.entries(langMap)) {
  if (needsFill(zh, `${prefix}.lang_switch_url`)) {
    set(zh, `${prefix}.lang_switch_url`, enUrl);
    totalZhFilled++;
  }
  // lang_toggle
  if (needsFill(zh, `${prefix}.lang_toggle`)) {
    set(zh, `${prefix}.lang_toggle`, 'EN');
    totalZhFilled++;
  }
}

// nav shared keys
const navZh = {
  brand_url: '/',
  quiz: '测评',
  quiz_url: '/quiz.html',
  subsidy: '补贴查询',
  subsidy_url: '/subsidy/',
  services: '服务',
  services_url: '/services/',
  blog: '博客',
  blog_url: '/blog/',
  about: '关于',
  about_url: '/about.html',
};
for (const [k, v] of Object.entries(navZh)) {
  if (needsFill(zh, `nav.${k}`)) {
    set(zh, `nav.${k}`, v);
    totalZhFilled++;
  }
}

// footer shared keys
const footerZh = {
  brand: '一人公司孵化器',
  home: '首页',
  home_url: '/',
  privacy: '隐私政策',
  privacy_url: '/privacy.html',
};
for (const [k, v] of Object.entries(footerZh)) {
  if (needsFill(zh, `footer.${k}`)) {
    set(zh, `footer.${k}`, v);
    totalZhFilled++;
  }
}

console.log(`Total zh filled: ${totalZhFilled}`);

fs.writeFileSync(I18N + '/zh.json', JSON.stringify(zh, null, 2) + '\n');
console.log('zh.json saved');

// Count remaining
function countPH(obj) {
  let n = 0;
  for (const v of Object.values(obj)) {
    if (typeof v === 'string') { if (v.startsWith('__ZH__') || v.startsWith('__EN__')) n++; }
    else if (typeof v === 'object') n += countPH(v);
  }
  return n;
}
const remZh = countPH(zh);
console.log(`Remaining zh placeholders: ${remZh}`);

// List which keys still have placeholders
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
if (remZh > 0) {
  const remaining = listPH(zh, '');
  console.log('\nRemaining keys:');
  remaining.forEach(k => console.log(`  ${k}`));
}
