"""提取 HTML 文件中所有 data-i18n key 及其中文 fallback 文本"""
import os, json, re
from html.parser import HTMLParser

deploy_dir = "F:/OPC测评系统/deploy"
html_files = ["index.html", "pay.html", "profile.html", "quiz.html",
              "report-free.html", "report-paid.html", "report-pdf.html"]

class KeyExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.current_key = None
        self.current_is_i18n = False
        self.text_parts = []
        self.keys = {}  # key -> {fallback: str, files: [str]}

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if "data-i18n" in attr_dict:
            key = attr_dict["data-i18n"]
            if key:
                self.current_key = key
                self.current_is_i18n = True
                self.text_parts = []
                if key not in self.keys:
                    self.keys[key] = {"fallback": "", "files": []}

    def handle_data(self, data):
        if self.current_is_i18n:
            text = data.strip()
            if text:
                self.text_parts.append(text)

    def handle_endtag(self, tag):
        if self.current_is_i18n:
            text = " ".join(self.text_parts)
            if self.current_key:
                if not self.keys[self.current_key]["fallback"]:
                    self.keys[self.current_key]["fallback"] = text
                self.keys[self.current_key]["files"].append(current_file)
            self.current_key = None
            self.current_is_i18n = False
            self.text_parts = []

extractor = KeyExtractor()

for fname in html_files:
    fpath = os.path.join(deploy_dir, fname)
    if not os.path.exists(fpath):
        print(f"⚠ 不存在: {fname}")
        continue
    current_file = fname
    with open(fpath, "r", encoding="utf-8") as f:
        html = f.read()
    extractor.feed(html)

# 加载现有 zh.json
zh_path = os.path.join(deploy_dir, "i18n", "zh.json")
with open(zh_path, "r", encoding="utf-8") as f:
    zh_dict = json.load(f)

# 加载现有 en.json
en_path = os.path.join(deploy_dir, "i18n", "en.json")
with open(en_path, "r", encoding="utf-8") as f:
    en_dict = json.load(f)

# 展平 en.json 的所有 key（用于检查是否缺少英文翻译）
def flatten_keys(d, prefix=""):
    keys = {}
    for k, v in d.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.update(flatten_keys(v, full_key))
        else:
            keys[full_key] = v
    return keys

en_flat = flatten_keys(en_dict)
zh_flat = flatten_keys(zh_dict)

print(f"\n{'='*60}")
print(f"HTML data-i18n keys: {len(extractor.keys)}")
print(f"zh.json keys: {len(zh_flat)}")
print(f"en.json keys: {len(en_flat)}")
print(f"{'='*60}\n")

# 分类
in_zh = []
missing_zh = []
in_en = []
missing_en = []

for key, info in sorted(extractor.keys.items()):
    if key in zh_flat:
        in_zh.append(key)
    else:
        missing_zh.append(key)
    if key in en_flat:
        in_en.append(key)
    else:
        missing_en.append(key)

print(f"✅ data-i18n key 已在 zh.json 中: {len(in_zh)}")
print(f"❌ data-i18n key 不在 zh.json 中: {len(missing_zh)}")
print(f"✅ data-i18n key 已在 en.json 中: {len(in_en)}")
print(f"❌ data-i18n key 不在 en.json 中: {len(missing_en)}")

print(f"\n{'='*60}")
print(f"缺失的 zh.json key（需要从 HTML fallback 补充到 zh.json）:")
print(f"{'='*60}")
if missing_zh:
    print(json.dumps([{"key": k, "fallback": extractor.keys[k]["fallback"], "files": list(set(extractor.keys[k]["files"]))} for k in sorted(missing_zh)], ensure_ascii=False, indent=2))
else:
    print("（无）")

print(f"\n{'='*60}")
print(f"缺失的 en.json key（需要补充英文翻译）:")
print(f"{'='*60}")
if missing_en:
    for k in sorted(missing_en):
        print(f"  {k}  ← 中文: {extractor.keys[k]['fallback']}")
else:
    print("（无）")

# 输出完整的 key 映射表（用于验证）
print(f"\n{'='*60}")
print(f"所有 HTML data-i18n key 及其中文 fallback:")
print(f"{'='*60}")
for key in sorted(extractor.keys.keys()):
    info = extractor.keys[key]
    print(f"  {key}")
    print(f"    fallback: {info['fallback']}")
    print(f"    files: {', '.join(set(info['files']))}")
