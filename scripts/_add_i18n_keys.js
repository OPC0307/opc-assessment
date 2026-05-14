const fs = require('fs');
const path = require('path');

const DEPLOY = __dirname + '/..';
const TEMPLATES = DEPLOY + '/templates';
const I18N = DEPLOY + '/i18n';

const zh = JSON.parse(fs.readFileSync(I18N + '/zh.json', 'utf8'));
const en = JSON.parse(fs.readFileSync(I18N + '/en.json', 'utf8'));

function exists(dict, keyPath) {
  const parts = keyPath.split('.');
  let node = dict;
  for (const p of parts) {
    if (node && typeof node === 'object' && p in node) node = node[p];
    else return false;
  }
  return typeof node === 'string';
}

function setNested(dict, keyPath, value) {
  const parts = keyPath.split('.');
  let node = dict;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!node[parts[i]] || typeof node[parts[i]] !== 'object') {
      node[parts[i]] = {};
    }
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
}

function walkDir(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, callback);
    else if (entry.name.endsWith('.html')) callback(full);
  }
}

const newKeys = [];
let totalKeys = 0;

walkDir(TEMPLATES, (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = content.matchAll(/\{\{t\.([a-z0-9_.]+)\}\}/g);
  for (const m of matches) {
    totalKeys++;
    const key = m[1];
    if (!exists(zh, key)) {
      setNested(zh, key, `__ZH__${key}`);
      newKeys.push(key);
    }
    if (!exists(en, key)) {
      setNested(en, key, `__EN__${key}`);
    }
  }
});

if (newKeys.length > 0) {
  fs.writeFileSync(I18N + '/zh.json', JSON.stringify(zh, null, 2) + '\n');
  fs.writeFileSync(I18N + '/en.json', JSON.stringify(en, null, 2) + '\n');
  console.log(`Added ${newKeys.length} new keys:`);
  newKeys.forEach(k => console.log(`  ${k}`));
} else {
  console.log('No new keys found.');
}

console.log(`\nTotal {{t.*}} references in templates: ${totalKeys}`);
console.log(`zh.json: ${countLeaves(zh)} keys`);
console.log(`en.json: ${countLeaves(en)} keys`);

function countLeaves(d, n = 0) {
  for (const v of Object.values(d)) {
    n += (typeof v === 'object') ? countLeaves(v) : 1;
  }
  return n;
}
