"""构建合并后的 zh.json（保留 app.js 的 96 个 key + 补充 HTML 的 218 个 key）"""
import os, json, re
from html.parser import HTMLParser

deploy_dir = "F:/OPC测评系统/deploy"
html_files = ["index.html", "pay.html", "profile.html", "quiz.html",
              "report-free.html", "report-paid.html", "report-pdf.html"]

# ---- 1. 提取 HTML data-i18n key + fallback ----
class KeyExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.current_key = None
        self.current_is_i18n = False
        self.text_parts = []
        self.keys = {}  # key -> fallback text

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if "data-i18n" in attr_dict:
            key = attr_dict["data-i18n"]
            if key and key not in self.keys:
                self.current_key = key
                self.current_is_i18n = True
                self.text_parts = []

    def handle_data(self, data):
        if self.current_is_i18n:
            text = data.strip()
            if text:
                self.text_parts.append(text)

    def handle_endtag(self, tag):
        if self.current_is_i18n and self.current_key:
            text = " ".join(self.text_parts)
            # 只取纯文本，如果已经有过 fallback 不覆盖
            if self.current_key not in self.keys:
                self.keys[self.current_key] = text
            elif not self.keys[self.current_key]:
                self.keys[self.current_key] = text
            self.current_key = None
            self.current_is_i18n = False
            self.text_parts = []

extractor = KeyExtractor()
for fname in html_files:
    fpath = os.path.join(deploy_dir, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        extractor.feed(f.read())

html_keys = extractor.keys

# ---- 2. 读取现有 zh.json ----
zh_path = os.path.join(deploy_dir, "i18n", "zh.json")
with open(zh_path, "r", encoding="utf-8") as f:
    zh_dict = json.load(f)

# ---- 3. 读取现有 en.json ----
en_path = os.path.join(deploy_dir, "i18n", "en.json")
with open(en_path, "r", encoding="utf-8") as f:
    en_dict = json.load(f)

# ---- 4. 将扁平 key 写入嵌套字典 ----
def set_nested(d, key_path, value):
    """将 'a.b.c' 写入嵌套字典 d[a][b][c] = value"""
    parts = key_path.split(".")
    for i, part in enumerate(parts[:-1]):
        if part not in d:
            d[part] = {}
        d = d[part]
        if not isinstance(d, dict):
            # 覆盖冲突
            d = {}
            d[part] = d
    d[parts[-1]] = value

# 为 zh.json 补充 html keys
for key, fallback in sorted(html_keys.items()):
    parts = key.split(".")
    # 检查是否已存在于 zh_dict
    current = zh_dict
    exists = True
    for part in parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            exists = False
            break
    if not exists or not isinstance(current, str):
        # 需要插入
        current = zh_dict
        for i, part in enumerate(parts[:-1]):
            if part not in current:
                current[part] = {}
            current = current[part]
            if not isinstance(current, dict):
                # 冲突：用 dict 替换
                current = {}
        current[parts[-1]] = fallback if fallback else f"__{key}__"

# ---- 5. 补全 en.json 缺失的 7 个 key ----
missing_en = {
    "brand.header_logo": "OPC Incubator",
    "brand.header_tagline": "Professional Assessment Tool",
    "brand.quiz_logo": "OPC One-Person Company Assessment",
    "brand.report_free_logo": "OPC Incubator",
    "brand.report_free_tagline": "Professional Assessment Tool",
    "brand.report_paid_logo": "OPC Incubator",
    "brand.report_paid_tagline": "Professional Tool · Full Report"
}
for key, eng in missing_en.items():
    parts = key.split(".")
    current = en_dict
    for i, part in enumerate(parts[:-1]):
        if part not in current:
            current[part] = {}
        current = current[part]
        if not isinstance(current, dict):
            current = {}
    if parts[-1] not in current:
        current[parts[-1]] = eng

# ---- 6. 写回文件 ----
zh_out = json.dumps(zh_dict, ensure_ascii=False, indent=2) + "\n"
en_out = json.dumps(en_dict, ensure_ascii=False, indent=2) + "\n"

with open(zh_path, "w", encoding="utf-8") as f:
    f.write(zh_out)

with open(en_path, "w", encoding="utf-8") as f:
    f.write(en_out)

# ---- 7. 统计 ----
def count_leaves(d, prefix=""):
    n = 0
    for k, v in d.items():
        fk = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            n += count_leaves(v, fk)
        else:
            n += 1
    return n

zh_total = count_leaves(zh_dict)
en_total = count_leaves(en_dict)

print(f"✅ zh.json 更新完成：{count_leaves(zh_dict)} 个 key")
print(f"✅ en.json 更新完成：{count_leaves(en_dict)} 个 key")
print(f"✅ 新增 HTML data-i18n key 到 zh.json：{len(html_keys)} 个")
print(f"✅ 补全 en.json 缺失 key：{len(missing_en)} 个")
