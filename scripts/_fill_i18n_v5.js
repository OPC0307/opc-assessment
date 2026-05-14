// v5: Final fill — targeted extraction for remaining keys
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

function safeRegex(html, re) {
  const m = html.match(re);
  if (!m) return null;
  return m[1] !== undefined ? m[1] : m[0];
}

let total = 0;

// ============================================================
// ABOUT — zh
// ============================================================
const aboutZh = readSrc('about.html');
if (aboutZh) {
  // Section 01: thesis
  total += tryFill(zh, 'about.thesis_heading', safeRegex(aboutZh, /政策\s*=\s*普通人最后的公开信息差/));
  total += tryFill(zh, 'about.thesis_text', safeRegex(aboutZh, /政府每年发放数以亿计的个体工商户补贴[\s\S]*?这就是信息差。而信息差，就是变现的起点。/));

  // Section 02: pains
  total += tryFill(zh, 'about.pain_heading', safeRegex(aboutZh, /为什么普通人拿不到政策红利？/));
  // The pain titles are in h3-like divs: "找不到", "看不懂", "来不及", "不会用"
  // Match: <div style="font-size:0.9375rem;font-weight:600;color:#1d1d1f;margin-bottom:4px;">找不到</div>
  const painTitles = aboutZh.match(/font-size:0\.9375rem;font-weight:600;color:#1d1d1f;margin-bottom:4px;">([^<]+)<\//g);
  if (painTitles && painTitles.length >= 4) {
    total += tryFill(zh, 'about.pain_1', painTitles[0].match(/>([^<]+)</)[1]);
    total += tryFill(zh, 'about.pain_2', painTitles[1].match(/>([^<]+)</)[1]);
    total += tryFill(zh, 'about.pain_3', painTitles[2].match(/>([^<]+)</)[1]);
    total += tryFill(zh, 'about.pain_4', painTitles[3].match(/>([^<]+)</)[1]);
  }

  // Section 03: solutions
  total += tryFill(zh, 'about.solution_heading', safeRegex(aboutZh, /OPC 一人公司孵化器/));
  total += tryFill(zh, 'about.solution_1', '智能政策引擎');
  total += tryFill(zh, 'about.solution_2', '211 专家矩阵');
  total += tryFill(zh, 'about.solution_3', '双 Agent 产研');
  total += tryFill(zh, 'about.solution_4', '变现闭环');

  // Section 04: position
  total += tryFill(zh, 'about.position_heading', safeRegex(aboutZh, /fhopc\.top — 政策数据就是第一桶金/));
  total += tryFill(zh, 'about.position_text', safeRegex(aboutZh, /每个城市数万元补贴[\s\S]*?可行动的资产/));

  // Section 05: data
  total += tryFill(zh, 'about.data_heading', safeRegex(aboutZh, /真实政策 → 真实变现/));
  total += tryFill(zh, 'about.data_text', safeRegex(aboutZh, /这只是冰山一角[^<]*/));

  // Section 06: funnel
  total += tryFill(zh, 'about.funnel_heading', safeRegex(aboutZh, /从信息差到财富杠杆的完整链路/));
  total += tryFill(zh, 'about.funnel_text', safeRegex(aboutZh, /政策补贴是启动资金[\s\S]*?持续收入的引擎/));

  // Section 07: founder
  total += tryFill(zh, 'about.founder_heading', safeRegex(aboutZh, /政策变现的实操者/));
  total += tryFill(zh, 'about.founder_text', safeRegex(aboutZh, /政策是普通人最后的公开信息差[^"]*/));

  // Section 08: window
  total += tryFill(zh, 'about.window_heading', safeRegex(aboutZh, /2026 年，政策变现的窗口已经打开/));
  total += tryFill(zh, 'about.window_text', safeRegex(aboutZh, /AI Agent 可以独立完成编程[^<]*/));

  // Section 09: vision
  total += tryFill(zh, 'about.vision_heading', safeRegex(aboutZh, /一人公司经济的基建层/));
  total += tryFill(zh, 'about.vision_text', safeRegex(aboutZh, /OPC 的定位不是工具[\s\S]*?启动这一切的第一把钥匙/));

  // Section 10: formula
  total += tryFill(zh, 'about.formula_heading', safeRegex(aboutZh, /财富杠杆公式/));
  total += tryFill(zh, 'about.formula_text', safeRegex(aboutZh, /政策红利 \+ AI 工具 \+ 一人公司 = 财富杠杆/));

  // CTA
  total += tryFill(zh, 'about.cta_title', safeRegex(aboutZh, /让每个独立个体都掌握政策变现的财富杠杆/));
  total += tryFill(zh, 'about.cta_desc', safeRegex(aboutZh, /从查询你所在城市的补贴开始[\s\S]*?迈出第一步/));
  total += tryFill(zh, 'about.cta_button', safeRegex(aboutZh, /<a href="\/subsidy\/"[^>]*>([^<]+)</));
}
console.log('about zh done');

// ============================================================
// ABOUT — en
// ============================================================
const aboutEn = readSrc('en/about.html');
if (aboutEn) {
  total += tryFill(en, 'about.thesis_heading', safeRegex(aboutEn, /Policy = The Last Open Information Arbitrage for Ordinary People/));
  total += tryFill(en, 'about.thesis_text', safeRegex(aboutEn, /Governments issue billions in subsidies[\s\S]*?starting point of monetization/));

  total += tryFill(en, 'about.pain_heading', safeRegex(aboutEn, /Why Can't Ordinary People Access Policy Dividends\?/));
  const enPainTitles = aboutEn.match(/font-size:0\.9375rem;font-weight:600;color:#1d1d1f;margin-bottom:4px;">([^<]+)<\//g);
  if (enPainTitles && enPainTitles.length >= 4) {
    total += tryFill(en, 'about.pain_1', enPainTitles[0].match(/>([^<]+)</)[1]);
    total += tryFill(en, 'about.pain_2', enPainTitles[1].match(/>([^<]+)</)[1]);
    total += tryFill(en, 'about.pain_3', enPainTitles[2].match(/>([^<]+)</)[1]);
    total += tryFill(en, 'about.pain_4', enPainTitles[3].match(/>([^<]+)</)[1]);
  }

  total += tryFill(en, 'about.solution_heading', safeRegex(aboutEn, /OPC One Person Company Incubator/));
  total += tryFill(en, 'about.solution_1', 'Intelligent Policy Engine');
  total += tryFill(en, 'about.solution_2', '211 Expert Matrix');
  total += tryFill(en, 'about.solution_3', 'Dual Agent R&D');
  total += tryFill(en, 'about.solution_4', 'Monetization Loop');

  total += tryFill(en, 'about.position_heading', safeRegex(aboutEn, /fhopc\.top — Policy Data is Your First Pot of Gold/));
  total += tryFill(en, 'about.position_text', safeRegex(aboutEn, /Tens of thousands in subsidies per city[\s\S]*?actionable asset/));

  total += tryFill(en, 'about.data_heading', safeRegex(aboutEn, /Real Policy → Real Monetization/));
  total += tryFill(en, 'about.data_text', safeRegex(aboutEn, /This is just the tip of the iceberg[^<]*/));

  total += tryFill(en, 'about.funnel_heading', safeRegex(aboutEn, /Complete Chain from Information Arbitrage to Wealth Leverage/));
  total += tryFill(en, 'about.funnel_text', safeRegex(aboutEn, /Policy subsidies are the startup capital[\s\S]*?sustained income/));

  total += tryFill(en, 'about.founder_heading', safeRegex(aboutEn, /Policy Monetization Practitioner/));
  total += tryFill(en, 'about.founder_text', safeRegex(aboutEn, /Policy is the last open information arbitrage[^"]*/));

  total += tryFill(en, 'about.window_heading', safeRegex(aboutEn, /2026 The Window for Policy Monetization Has Opened/));
  total += tryFill(en, 'about.window_text', safeRegex(aboutEn, /AI Agents can independently complete programming[^<]*/));

  total += tryFill(en, 'about.vision_heading', safeRegex(aboutEn, /The Infrastructure Layer of the One-Person Company Economy/));
  total += tryFill(en, 'about.vision_text', safeRegex(aboutEn, /OPC is positioned not as a tool[\s\S]*?first key to all of this/));

  total += tryFill(en, 'about.formula_heading', safeRegex(aboutEn, /Wealth Leverage Formula/));
  total += tryFill(en, 'about.formula_text', safeRegex(aboutEn, /Policy Dividends \+ AI Tools \+ One Person Company = Wealth Leverage/));

  total += tryFill(en, 'about.cta_title', safeRegex(aboutEn, /Empowering every independent individual[\s\S]*?wealth leverage of policy monetization/));
  total += tryFill(en, 'about.cta_desc', safeRegex(aboutEn, /Start by looking up the subsidies in your city[\s\S]*?take the first step/));
  total += tryFill(en, 'about.cta_button', safeRegex(aboutEn, /<a href="\/en\/subsidy\/"[^>]*>([^<]+)</));
}
console.log('about en done');

// ============================================================
// INDEX — zh
// ============================================================
const idxZh = readSrc('index.html');
if (idxZh) {
  total += tryFill(zh, 'index.stat_income', safeRegex(idxZh, /stat-count[^>]*>([^<]+)</));
  // stat_income_label: first stat-label text
  const statLabels = idxZh.match(/fw-data__label[^>]*>([^<]+)<\//g);
  if (statLabels && statLabels.length >= 1) {
    total += tryFill(zh, 'index.stat_income_label', statLabels[0].match(/>([^<]+)</)[1]);
  }

  total += tryFill(zh, 'index.services_heading', '基础设施');
  total += tryFill(zh, 'index.service2_title', '一人公司启动包');
  total += tryFill(zh, 'index.service1_cta', '开始 →');
  total += tryFill(zh, 'index.service3_cta', '了解 →');

  total += tryFill(zh, 'index.cases_heading', '行业案例');

  // Case cards from JS data
  total += tryFill(zh, 'index.case1_title', '深圳 · 装修工长');
  total += tryFill(zh, 'index.case1_desc', '脱离挂靠公司，以个体户身份独立接单');
  total += tryFill(zh, 'index.case1_cta', '看完整案例 →');

  total += tryFill(zh, 'index.case2_title', '上海 · UI设计师');
  total += tryFill(zh, 'index.case2_desc', '从被裁到签月度合作');
  total += tryFill(zh, 'index.case2_cta', '看完整案例 →');

  total += tryFill(zh, 'index.trust_heading', safeRegex(idxZh, /为什么选择 OPC/));
  total += tryFill(zh, 'index.trust_text', safeRegex(idxZh, /我们花了一年时间[^<]*/));

  total += tryFill(zh, 'index.cta_title', '从评估开始');
  total += tryFill(zh, 'index.cta_desc', safeRegex(idxZh, /免费评估，约三分钟[^<]*/));
  total += tryFill(zh, 'index.cta_button', '开始评估');
}
console.log('index zh done');

// ============================================================
// INDEX — en
// ============================================================
const idxEn = readSrc('en/index.html');
if (idxEn) {
  total += tryFill(en, 'index.stat_income', safeRegex(idxEn, /stat-count[^>]*>([^<]+)</));
  const enStatLabels = idxEn.match(/fw-data__label[^>]*>([^<]+)<\//g);
  if (enStatLabels && enStatLabels.length >= 1) {
    total += tryFill(en, 'index.stat_income_label', enStatLabels[0].match(/>([^<]+)</)[1]);
  }

  total += tryFill(en, 'index.services_heading', 'Infrastructure');
  total += tryFill(en, 'index.service1_title', 'OPC Fitness Assessment');
  total += tryFill(en, 'index.service1_cta', 'Start →');
  total += tryFill(en, 'index.service2_title', 'OPC Launch Pack');
  total += tryFill(en, 'index.service2_desc', 'Industry report, roadmap, subsidy SOP, toolkit');
  total += tryFill(en, 'index.service2_cta', 'Get →');
  total += tryFill(en, 'index.service3_title', 'Deep Incubation');
  total += tryFill(en, 'index.service3_cta', 'Learn →');

  total += tryFill(en, 'index.cases_heading', 'Industry Cases');
  total += tryFill(en, 'index.case1_title', 'Shenzhen · Renovation Foreman');
  total += tryFill(en, 'index.case1_desc', 'Independent contractor breaking free from agency');
  total += tryFill(en, 'index.case1_cta', 'Full Case →');
  total += tryFill(en, 'index.case2_title', 'Shanghai · UI Designer');
  total += tryFill(en, 'index.case2_desc', 'From layoff to monthly retainer contracts');
  total += tryFill(en, 'index.case2_cta', 'Full Case →');

  total += tryFill(en, 'index.trust_heading', 'Why OPC');
  total += tryFill(en, 'index.trust_text', 'We spent a year researching across 12 industries and 20 cities');

  total += tryFill(en, 'index.cta_title', 'Start with Assessment');
  total += tryFill(en, 'index.cta_desc', 'Free assessment, about three minutes');
  total += tryFill(en, 'index.cta_button', 'Start Assessment');
}
console.log('index en done');

// ============================================================
// 404 — zh & en
// ============================================================
const pg404Zh = readSrc('404.html');
if (pg404Zh) {
  total += tryFill(zh, '404.code', '404');
  total += tryFill(zh, '404.heading', safeRegex(pg404Zh, /font-size:1\.25rem[^>]*>([^<]+)</));
  total += tryFill(zh, '404.sub', safeRegex(pg404Zh, /font-size:0\.9375rem[^>]*>([^<]+)</));
  total += tryFill(zh, '404.home_url', '/');
  total += tryFill(zh, '404.home_link', safeRegex(pg404Zh, /margin-right:16px;">([^<]+)</));
  total += tryFill(zh, '404.canonical', 'https://fhopc.top/404.html');
  total += tryFill(zh, '404.lang_switch_url', '/en/404.html');
}

const pg404En = readSrc('en/404.html');
if (pg404En) {
  total += tryFill(en, '404.code', '404');
  total += tryFill(en, '404.heading', safeRegex(pg404En, /font-size:1\.25rem[^>]*>([^<]+)</));
  total += tryFill(en, '404.sub', safeRegex(pg404En, /font-size:0\.9375rem[^>]*>([^<]+)</));
  total += tryFill(en, '404.home_url', '/en/');
  total += tryFill(en, '404.home_link', safeRegex(pg404En, /margin-right:16px;">([^<]+)</));
  total += tryFill(en, '404.canonical', 'https://fhopc.top/en/404.html');
  total += tryFill(en, '404.lang_switch_url', '/404.html');
}
console.log('404 done');

// ============================================================
// CHECKOUT — zh & en
// ============================================================
const checkoutZh = readSrc('checkout.html');
if (checkoutZh) {
  total += tryFill(zh, 'checkout.canonical', 'https://fhopc.top/checkout.html');
  total += tryFill(zh, 'checkout.og_title', '¥399 办理付款 — OPC 一人公司孵化器');
  total += tryFill(zh, 'checkout.og_url', 'https://fhopc.top/checkout.html');
  total += tryFill(zh, 'checkout.price_note', safeRegex(checkoutZh, /font-size:0\.8125rem;color:#86868b;margin-bottom:32px;">([^<]+)</));
  // qr_instruction: first step text
  total += tryFill(zh, 'checkout.qr_instruction', safeRegex(checkoutZh, /margin-right:8px;">1<\/span>([^<]+)<\//));
}

const checkoutEn = readSrc('en/checkout.html');
if (checkoutEn) {
  total += tryFill(en, 'checkout.canonical', 'https://fhopc.top/en/checkout.html');
  total += tryFill(en, 'checkout.og_title', '¥399 Payment — OPC One Person Company Incubator');
  total += tryFill(en, 'checkout.og_url', 'https://fhopc.top/en/checkout.html');
  total += tryFill(en, 'checkout.price_note', safeRegex(checkoutEn, /font-size:0\.8125rem;color:#86868b;margin-bottom:32px;">([^<]+)</));
  total += tryFill(en, 'checkout.qr_instruction', safeRegex(checkoutEn, /margin-right:8px;">1<\/span>([^<]+)<\//));
}
console.log('checkout done');

// ============================================================
// PRIVACY — zh & en
// ============================================================
const privacyZh = readSrc('privacy.html');
if (privacyZh) {
  const m = privacyZh.match(/<section[^>]*class="privacy-content"[^>]*>([\s\S]*?)<\/section>/);
  if (m) {
    total += tryFill(zh, 'privacy.content', m[1].trim());
    total += tryFill(zh, 'privacy.canonical', 'https://fhopc.top/privacy.html');
    total += tryFill(zh, 'privacy.og_url', 'https://fhopc.top/privacy.html');
  }
}

const privacyEn = readSrc('en/privacy.html');
if (privacyEn) {
  const m = privacyEn.match(/<section[^>]*class="privacy-content"[^>]*>([\s\S]*?)<\/section>/);
  if (m) {
    total += tryFill(en, 'privacy.content', m[1].trim());
    total += tryFill(en, 'privacy.canonical', 'https://fhopc.top/en/privacy.html');
    total += tryFill(en, 'privacy.og_url', 'https://fhopc.top/en/privacy.html');
  }
}
console.log('privacy done');

// ============================================================
// CASES — remaining content keys
// ============================================================
const casesZh = readSrc('cases.html');
if (casesZh) {
  total += tryFill(zh, 'cases.case1_bg_text2', safeRegex(casesZh, /case1_bg_text2[^>]*>([^<]+)</) || '在深圳做了8年装修工长');
  total += tryFill(zh, 'cases.case2_bg_text2', safeRegex(casesZh, /case2_bg_text2[^>]*>([^<]+)</) || '在上海做了5年UI设计师');
  total += tryFill(zh, 'cases.case3_bg_text2', safeRegex(casesZh, /case3_bg_text2[^>]*>([^<]+)</) || '在成都做了3年内容运营');
}
console.log('cases done');

// ============================================================
// SAVE & REPORT
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
console.log(`\nTotal filled: ${total}`);
console.log(`zh remaining: ${zhRem}, en remaining: ${enRem}`);

if (zhRem > 0) {
  console.log('\n=== Remaining zh ===');
  listPH(zh, '').forEach(k => console.log('  ' + k));
}
if (enRem > 0) {
  console.log('\n=== Remaining en ===');
  listPH(en, '').forEach(k => console.log('  ' + k));
}
