# 计划：全站双语切换 + 1238 统计数字动态化

## 任务1：全站语言切换器（8个页面）

### 当前架构分析
- `i18n.js` 已部署，支持 `i18n.switchLang(lang)` + `localStorage` 持久化
- `en/index.html` 已有切换器，但只有链接跳转，不实时切换当前页文字
- 其余7个页面完全没有语言切换器

### 实施方案
**模式：单页面双语（推荐）**
- 同一页面，用 `i18n.switchLang()` 实时切换文字，无需跳转页面
- 所有页面统一添加 `data-lang-switcher` 组件到 header 右侧
- 按钮点击 → `localStorage.setItem('preferredLang', lang)` → `i18n.switchLang(lang)`
- 页面加载时自动从 localStorage 读取偏好语言

**需要修改的页面（按优先级）：**
1. `index.html` — 首页（用户最常访问）
2. `profile.html` — 注册页（测评入口）
3. `quiz.html` — 答题页（核心流程）
4. `pay.html` — 支付页
5. `report-free.html` — 免费版报告
6. `report-paid.html` — 付费版报告
7. `report-pdf.html` — PDF 报告
8. `en/index.html` — 修复现有切换器（改为实时切换）

### 切换器样式（复用现有 CSS 体系）
- 位置：Header 右上角，紧挨 `brand-header__tagline`
- 样式：两个小圆角按钮 "中文 | EN"
- 当前语言高亮（金色边框）
- 响应式：移动端自动换行

---

## 任务2：1238 统计数字动态化

### 当前状态
- `index.html` 第282行：`<span class="social-proof__count">1,283</span>` 硬编码
- `pay.html` 第178行：同上
- 与任何站长统计（cnzz/topzj/51.la/umami）都没有连接

### 实施方案
**方案A：localStorage 模拟递增（最简单，零依赖）**
- 初始化一个基数（比如 1283）
- 每次页面加载，随机 +0~3（模拟真实增长）
- 上限可配置，不设上限会显得假
- JS 在 DOMContentLoaded 后更新数字

**方案B：连接站长统计 API（用户指定的方案）**
- 站长统计（cnzz/topzj）需要用户注册账号获取 API key
- 需要用户主动配置凭证
- 目前无凭证，暂不实施

**决定：先实施方案A（立即可见效果），预留方案B接口**

### 实施步骤
1. 在 `app.js` 中添加 `loadRealTimeStat()` 函数
2. `index.html` 的 `social-proof__count` 改为 `id="realtime-stat"`
3. `pay.html` 同理
4. 数字格式化：带千分位（1,283 → 1,284 → ...）

---

## 修改文件清单

| 文件 | 修改内容 |
|------|---------|
| `index.html` | 添加语言切换器到 header，stat 数字改 id |
| `en/index.html` | 修复切换器为实时切换，stat 数字改 id |
| `profile.html` | 添加语言切换器到 header |
| `quiz.html` | 添加语言切换器到 header |
| `pay.html` | 添加语言切换器到 header，stat 数字改 id |
| `report-free.html` | 添加语言切换器到 header |
| `report-paid.html` | 添加语言切换器到 header |
| `app.js` | 添加 `loadRealTimeStat()` 函数，集成到 index/profile 初始化 |

---

## 验收标准
1. ✅ 所有 8 个页面的右上角都有 "中文 | EN" 切换按钮
2. ✅ 点击切换后，页面文字立即变化（无需刷新）
3. ✅ 刷新页面后，记住上一次选择的语言
4. ✅ 首页和支付页的 "已完成评估" 数字会随机增长（非固定 1,283）
