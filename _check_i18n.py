import re, json, glob

# Load zh.json keys
with open('F:/OPC测评系统/deploy/i18n/zh.json', 'r', encoding='utf-8') as f:
    zh = json.load(f)

def extract_keys(obj, prefix=''):
    keys = set()
    for k, v in obj.items():
        key = f'{prefix}.{k}' if prefix else k
        if isinstance(v, dict):
            keys.update(extract_keys(v, key))
        else:
            keys.add(key)
    return keys

zh_keys = extract_keys(zh)

# Scan HTML files for data-i18n keys
data_i18n_keys = set()
for html_file in sorted(glob.glob('F:/OPC测评系统/deploy/*.html')):
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    for m in re.finditer(r'data-i18n="([^"]+)"', content):
        data_i18n_keys.add(m.group(1))

# Scan app.js for _t() keys
with open('F:/OPC测评系统/deploy/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

t_keys = set()
for m in re.finditer(r'_t\("([^"]+)"', app_js):
    t_keys.add(m.group(1))

print(f"zh.json keys: {len(zh_keys)}")
print(f"HTML data-i18n keys: {len(data_i18n_keys)}")
print(f"app.js _t() keys: {len(t_keys)}")
print()

all_refs = data_i18n_keys | t_keys
print(f"Total referenced keys: {len(all_refs)}")

# Check missing in zh.json
missing_in_zh = all_refs - zh_keys
if missing_in_zh:
    print(f"\n⚠️ Referenced but MISSING in zh.json ({len(missing_in_zh)}):")
    for k in sorted(missing_in_zh):
        print(f"  ✗ {k}")
else:
    print("\n✅ All referenced keys exist in zh.json")

# Check unused in zh.json
unused = zh_keys - all_refs
if unused:
    print(f"\nℹ️ Unused keys in zh.json ({len(unused)}):")
    for k in sorted(unused):
        print(f"  ? {k}")
else:
    print("✅ All zh.json keys are referenced")
