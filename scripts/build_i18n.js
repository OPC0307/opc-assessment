const fs = require('fs');
const path = require('path');

const DEPLOY = __dirname + '/..';
const TEMPLATES = DEPLOY + '/templates';
const I18N = DEPLOY + '/i18n';

const zh = JSON.parse(fs.readFileSync(I18N + '/zh.json', 'utf8'));
const en = JSON.parse(fs.readFileSync(I18N + '/en.json', 'utf8'));

function resolve(dict, keyPath) {
  const parts = keyPath.split('.');
  let node = dict;
  for (const p of parts) {
    if (node && typeof node === 'object' && p in node) node = node[p];
    else return null;
  }
  return typeof node === 'string' ? node : null;
}

function processTemplate(filePath, lang) {
  let content = fs.readFileSync(filePath, 'utf8');
  const dict = lang === 'zh' ? zh : en;

  // {{#if zh}}...{{/if}}
  content = content.replace(/\{\{#if zh\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, block) => lang === 'zh' ? block : '');
  // {{#if en}}...{{/if}}
  content = content.replace(/\{\{#if en\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_, block) => lang === 'en' ? block : '');

  // {{t.key.path}}
  content = content.replace(/\{\{t\.([a-z0-9_.]+)\}\}/g, (match, key) => {
    const val = resolve(dict, key);
    if (val === null) {
      console.warn(`  WARN: missing key "${key}" for ${lang}`);
      return `{{${key}}}`;
    }
    return val;
  });

  return content;
}

// Template list: [templateRelPath, outRelPath]
const pages = [
  ['index.html', 'index.html'],
  ['about.html', 'about.html'],
  ['privacy.html', 'privacy.html'],
  ['checkout.html', 'checkout.html'],
  ['404.html', '404.html'],
  ['cases.html', 'cases.html'],
  ['services/index.html', 'services/index.html'],
  ['services/process.html', 'services/process.html'],
  ['services/registration.html', 'services/registration.html'],
  ['services/subsidy.html', 'services/subsidy.html'],
  ['services/tax-basics.html', 'services/tax-basics.html'],
  ['subsidy/index.html', 'subsidy/index.html'],
  ['subsidy/checklist.html', 'subsidy/checklist.html'],
];

let zhCount = 0, enCount = 0;

for (const [tplRel, outRel] of pages) {
  const tplPath = path.join(TEMPLATES, tplRel);
  if (!fs.existsSync(tplPath)) {
    console.warn(`SKIP: template not found: ${tplRel}`);
    continue;
  }

  const zhOut = processTemplate(tplPath, 'zh');
  const zhOutPath = path.join(DEPLOY, outRel);
  fs.mkdirSync(path.dirname(zhOutPath), { recursive: true });
  fs.writeFileSync(zhOutPath, zhOut);
  zhCount++;

  const enOut = processTemplate(tplPath, 'en');
  const enOutPath = path.join(DEPLOY, 'en', outRel);
  fs.mkdirSync(path.dirname(enOutPath), { recursive: true });
  fs.writeFileSync(enOutPath, enOut);
  enCount++;

  console.log(`  ${outRel} → zh + en`);
}

console.log(`\nDone. ${zhCount} zh + ${enCount} en pages generated.`);
