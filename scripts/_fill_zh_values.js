// Fill zh.json values from original Chinese source files
const fs = require('fs');
const path = require('path');

const DEPLOY = __dirname + '/..';
const I18N = DEPLOY + '/i18n';

const zh = JSON.parse(fs.readFileSync(I18N + '/zh.json', 'utf8'));

function setNested(obj, keyPath, value) {
  const parts = keyPath.split('.');
  let node = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!node[parts[i]]) node[parts[i]] = {};
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
}

// Mapping: [templatePath, sourcePath]
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

function extractTextFromSource(templatePath, sourcePath) {
  const tpl = fs.readFileSync(path.join(DEPLOY, templatePath), 'utf8');
  const src = fs.readFileSync(path.join(DEPLOY, sourcePath), 'utf8');

  // Process template as zh (keep {{#if zh}} blocks, remove {{#if en}} blocks)
  let tplZh = tpl
    .replace(/\{\{#if zh\}\}([\s\S]*?)\{\{\/if\}\}/g, '$1')
    .replace(/\{\{#if en\}\}[\s\S]*?\{\{\/if\}\}/g, '');

  // Find all {{t.*}} patterns with their positions
  const keyPositions = [];
  const re = /\{\{t\.([a-z0-9_.]+)\}\}/g;
  let m;
  while ((m = re.exec(tplZh)) !== null) {
    keyPositions.push({ key: m[1], index: m.index, length: m[0].length });
  }

  // Build output by replacing keys with source text
  // Strategy: walk through source and template simultaneously
  // Remove i18n markers from template, compare structure with source

  // Simpler approach: for each placeholder in template, the corresponding text in source
  // is at roughly the same structural position. Since we can't do perfect alignment,
  // we'll use a character-by-character diff approach.

  let tplClean = tplZh.replace(/\{\{t\.[a-z0-9_.]+\}\}/g, '\x00PLACEHOLDER\x00');
  // Remove {{#if}} markers
  tplClean = tplClean.replace(/\{\{#if (zh|en)\}\}/g, '').replace(/\{\{\/if\}\}/g, '');

  // Build a regex from tplClean by splitting on PLACEHOLDER
  const parts = tplClean.split('\x00PLACEHOLDER\x00');

  // Now try to match these parts against the source
  let srcRemaining = src;
  const extracted = {};

  for (let i = 0; i < parts.length && i <= keyPositions.length; i++) {
    const part = parts[i];
    if (!part) continue;

    // Find this part in src
    // We need to normalize whitespace for matching
    const partTrimmed = part.trim();
    if (!partTrimmed) continue;

    const idx = srcRemaining.indexOf(partTrimmed);
    if (idx === -1) {
      // Try looser match - just first/last few chars
      const firstChars = partTrimmed.substring(0, 20);
      const idx2 = srcRemaining.indexOf(firstChars);
      if (idx2 !== -1) {
        srcRemaining = srcRemaining.substring(idx2);
      }
      continue;
    }

    // Text before the match is our extracted value (if there's a placeholder before this part)
    const textBefore = srcRemaining.substring(0, idx);
    if (i > 0 && i - 1 < keyPositions.length) {
      const trimmed = textBefore.trim();
      if (trimmed && !trimmed.match(/^\s*$/)) {
        extracted[keyPositions[i - 1].key] = trimmed;
      }
    }

    srcRemaining = srcRemaining.substring(idx + partTrimmed.length);
  }

  return extracted;
}

// Manual fill - more reliable approach: use known source file structure
// Read original source files and manually extract text values

const manualMappings = {};

// === CASES PAGE ===
const casesSrc = fs.readFileSync(DEPLOY + '/cases.html', 'utf8');

// Helper to extract text between patterns
function between(text, before, after) {
  const startIdx = text.indexOf(before);
  if (startIdx === -1) return '';
  const afterStart = startIdx + before.length;
  const endIdx = text.indexOf(after, afterStart);
  if (endIdx === -1) return text.substring(afterStart).trim();
  return text.substring(afterStart, endIdx).trim();
}

// Extract title
let m1;
m1 = casesSrc.match(/<title>([^<]+)<\/title>/);
if (m1) manualMappings['cases.title'] = m1[1];

m1 = casesSrc.match(/<meta name="description" content="([^"]+)"/);
if (m1) manualMappings['cases.meta_desc'] = m1[1];

m1 = casesSrc.match(/<meta name="keywords" content="([^"]+)"/);
if (m1) manualMappings['cases.keywords'] = m1[1];

// Canonical, OG
m1 = casesSrc.match(/<link rel="canonical" href="([^"]+)"/);
if (m1) manualMappings['cases.canonical'] = m1[1];

m1 = casesSrc.match(/<meta property="og:title" content="([^"]+)"/);
if (m1) manualMappings['cases.og_title'] = m1[1];

m1 = casesSrc.match(/<meta property="og:description" content="([^"]+)"/);
if (m1) manualMappings['cases.og_desc'] = m1[1];

m1 = casesSrc.match(/<meta property="og:url" content="([^"]+)"/);
if (m1) manualMappings['cases.og_url'] = m1[1];

// h1
m1 = casesSrc.match(/<h1[^>]*>([^<]+)<\/h1>/);
if (m1) manualMappings['cases.hero_title'] = m1[1];

// hero sub
m1 = casesSrc.match(/fw-hero__sub[^>]*>([\s\S]+?)<\/p>/);
if (m1) manualMappings['cases.hero_sub'] = m1[1].replace(/\n\s+/g, ' ').trim();

// Extract all h2, h3, p, li text content patterns
function extractPatterns(src, patterns) {
  for (const [key, regex] of Object.entries(patterns)) {
    const m = src.match(regex);
    if (m) {
      manualMappings[key] = m[1].replace(/<br>/g, '').replace(/\s+/g, ' ').trim();
    }
  }
}

console.log(`\nExtracted ${Object.keys(manualMappings).length} values from cases.html`);
// Apply manual mappings
for (const [key, value] of Object.entries(manualMappings)) {
  setNested(zh, key, value);
}

fs.writeFileSync(I18N + '/zh.json', JSON.stringify(zh, null, 2) + '\n');
console.log('zh.json updated with manual mappings');
console.log('Manual extraction done. Run again for remaining pages.');
