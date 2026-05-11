"""验证所有 HTML data-i18n key 是否在 zh.json 和 en.json 中都有对应"""
import os, json
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
        self.keys = set()
    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if "data-i18n" in attr_dict:
            key = attr_dict["data-i18n"]
            if key:
                self.keys.add(key)
    def handle_data(self, data):
        pass
    def handle_endtag(self, tag):
        self.current_key = None
        self.current_is_i18n = False
        self.text_parts = []

extractor = KeyExtractor()
for fname in html_files:
    with open(os.path.join(deploy_dir, fname), "r", encoding="utf-8") as f:
        extractor.feed(f.read())

def flatten_keys(d, prefix=""):
    keys = {}
    for k, v in d.items():
        fk = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.update(flatten_keys(v, fk))
        else:
            keys[fk] = v
    return keys

with open(os.path.join(deploy_dir, "i18n", "zh.json"), "r", encoding="utf-8") as f:
    zh = flatten_keys(json.load(f))

with open(os.path.join(deploy_dir, "i18n", "en.json"), "r", encoding="utf-8") as f:
    en = flatten_keys(json.load(f))

missing_zh = [k for k in sorted(extractor.keys) if k not in zh]
missing_en = [k for k in sorted(extractor.keys) if k not in en]

print(f"\n{'='*60}")
print(f"验证结果")
print(f"{'='*60}")
print(f"HTML data-i18n keys: {len(extractor.keys)}")
print(f"zh.json 总 keys: {len(zh)}")
print(f"en.json 总 keys: {len(en)}")

if not missing_zh:
    print(f"\n✅ zh.json: 全部 {len(extractor.keys)} 个 HTML key 已覆盖")
else:
    print(f"\n❌ zh.json 缺失 {len(missing_zh)} 个 key:")
    for k in missing_zh:
        print(f"   {k}")

if not missing_en:
    print(f"\n✅ en.json: 全部 {len(extractor.keys)} 个 HTML key 已覆盖")
else:
    print(f"\n❌ en.json 缺失 {len(missing_en)} 个 key:")
    for k in missing_en:
        print(f"   {k}")

# 额外检查：app.js 的 _t() 调用 key 是否还在
# 这些是原来 zh.json 特有的 key: grade.*, dim.* (中文key名), report.*, modal.*, sop.*, title.*, greeting.*, closing.*, glossary.*, feedback.*, share.*, profile.alert_incomplete, footer.brand_name, footer.timestamp, footer.watermark, pay.*
print(f"\n{'='*60}")
print(f"app.js 原有 key 检查")
print(f"{'='*60}")
app_js_keys = [k for k in zh if not k.startswith(("brand.", "hero.", "value.", "theory.", "faq.", "cta.", "quiz.", "report_free.", "report_paid.", "report_pay.", "report_pdf.", "profile."))]
# Actually let me list original zh.json top-level sections
original_sections = ["grade", "dim", "report", "modal", "cta", "sop", "title", "greeting", "closing", "glossary", "feedback", "share", "profile", "footer", "pay"]
found_sections = []
for sec in original_sections:
    found = [k for k in zh if k.startswith(sec+".")]
    if found:
        found_sections.append(f"  {sec}: {len(found)} keys")
    else:
        found_sections.append(f"  {sec}: MISSING!")

for s in found_sections:
    print(s)
