// v6: Final patch — exact text extraction for remaining ~14 keys
const fs = require('fs');
const path = require('path');

const DEPLOY = path.resolve(__dirname + '/..');
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
  if (val && val.trim() && needsFill(dict, key)) {
    set(dict, key, val);
    return true;
  }
  return false;
}

function readSrc(relPath) {
  const p = path.join(DEPLOY, relPath);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  return null;
}

let total = 0;

// --- ZH: index trust & CTA (template has these but original index.html doesn't) ---
total += tryFill(zh, 'index.trust_heading', '为什么选择 OPC');
total += tryFill(zh, 'index.trust_text', '我们花了一年时间，跑了12个行业、20个城市——先把路捋清楚了。');
total += tryFill(zh, 'index.cta_desc', '免费评估，约三分钟。看看你适合成为一人公司吗？');

// --- ZH: privacy.content ---
const privacyZh = readSrc('privacy.html');
if (privacyZh) {
  // Extract content between hero section and footer
  const m = privacyZh.match(/<section class="fw-section">\s*<div class="fw-inner" style="max-width:720px;">\s*<div style="font-size:0\.9375rem;color:#6e6e73;line-height:1\.8;">([\s\S]*?)<\/div>/);
  if (m) {
    total += tryFill(zh, 'privacy.content', m[1].trim());
  } else {
    // Fallback: try to get everything between nav and footer
    const m2 = privacyZh.match(/<\/nav>\s*([\s\S]*?)\s*<footer/);
    if (m2) total += tryFill(zh, 'privacy.content', m2[1].trim());
  }
}

// --- EN: about remaining ---
const aboutEn = readSrc('en/about.html');
if (aboutEn) {
  // Section 04 heading
  total += tryFill(en, 'about.position_heading',
    /fhopc\.top — Policy Data Is Your First Pot of Gold/.test(aboutEn) ? 'fhopc.top — Policy Data Is Your First Pot of Gold' : null);
  // Section 04 text
  total += tryFill(en, 'about.position_text',
    /Tens of thousands in subsidies per city[\s\S]*?actionable assets/.test(aboutEn) ? aboutEn.match(/Tens of thousands in subsidies per city[\s\S]*?actionable assets/)[0] : null);
  // Section 05 heading
  total += tryFill(en, 'about.data_heading', 'Real Policies → Real Monetization');
  // Section 05 text
  total += tryFill(en, 'about.data_text', 'This is just the tip of the iceberg. fhopc.top covers 20+ cities, 112+ policies, and keeps expanding.');
  // Section 06 heading
  total += tryFill(en, 'about.funnel_heading', 'The Complete Chain: From Information Arbitrage to Wealth Leverage');
  // Section 06 text
  total += tryFill(en, 'about.funnel_text', 'Policy subsidies are startup capital; the OPC system is the engine that turns capital into sustainable income.');
  // Section 07 heading
  total += tryFill(en, 'about.founder_heading', 'The Practitioner of Policy Monetization');
  // Section 07 text (the quote)
  total += tryFill(en, 'about.founder_text', '"Policy is the last open information arbitrage for ordinary people. Seize it, and you seize the next wealth cycle."');
  // Section 08 heading
  total += tryFill(en, 'about.window_heading', '2026: The Policy Monetization Window Is Open');
  // Section 08 text
  total += tryFill(en, 'about.window_text', 'AI Agents can independently handle programming, design, and content creation. One person + Agent = one team, no more hiring needed.');
  // Section 09 text
  total += tryFill(en, 'about.vision_text', "OPC isn't positioned as a tool — it's the infrastructure for individual entrepreneurship. Just as Shopify lets anyone open a store, OPC lets anyone become a company — and policy data is the first key that starts it all.");
  // CTA desc
  total += tryFill(en, 'about.cta_desc', 'Start by checking what subsidies are available in your city. Take the first step.');
  // CTA button
  total += tryFill(en, 'about.cta_button', 'View Subsidies');
}

// --- EN: privacy.content ---
const privacyEn = readSrc('en/privacy.html');
if (privacyEn) {
  const m = privacyEn.match(/<section class="fw-section">\s*<div class="fw-inner" style="max-width:720px;">\s*<div style="font-size:0\.9375rem;color:#6e6e73;line-height:1\.8;">([\s\S]*?)<\/div>/);
  if (m) {
    total += tryFill(en, 'privacy.content', m[1].trim());
  } else {
    const m2 = privacyEn.match(/<\/nav>\s*([\s\S]*?)\s*<footer/);
    if (m2) total += tryFill(en, 'privacy.content', m2[1].trim());
  }
}

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
console.log(`Filled: ${total}`);
console.log(`zh remaining: ${zhRem}, en remaining: ${enRem}`);

if (zhRem > 0) { console.log('\n=== Remaining zh ==='); listPH(zh, '').forEach(k => console.log('  ' + k)); }
if (enRem > 0) { console.log('\n=== Remaining en ==='); listPH(en, '').forEach(k => console.log('  ' + k)); }
