# fhopc.top 全站审计报告

**审计日期**: 2026-05-15
**站点规模**: ~106 HTML 页面 | 2 CSS 文件 | 6 生产 JS 文件 | 22 篇博客
**部署平台**: GitHub Pages (自定义域名 fhopc.top)

---

## 总览评分

| 维度 | 评分 | 状态 |
|------|------|------|
| SEO 基础 | C+ | 缺大量 og:image、sitemap 不完整 |
| 性能 | C | 无压缩/缓存/CSS 过大 |
| 安全 | D | API Key 明文暴露、无 CSP |
| 可访问性 | D | 大量图片缺 alt、无 ARIA、无跳转链接 |
| 代码质量 | C+ | 内联样式、重复代码、构建脚本残留 |
| 移动端 | B | 响应式设计良好但缺少移动端测试细节 |
| 国际化 | B | zh/en 双语言但覆盖面不完整 |
| 内容 | B- | 22篇博客质量好，但案例/城市页内容单薄 |

**综合评级**: **C+** — 网站结构良好但存在 1 个阻塞级安全问题和多个高优先级 SEO/性能缺陷。

---

## 一、阻塞级问题 (CRITICAL — 必须立即修复)

### 1.1 API Key 明文暴露在生产代码中

**位置**:
- `chat-widget.js:12` — `var API_KEY = 'sk-v9Ig2HymT3vWmFPYJomLXqcoXuU9YW25';`
- 该文件通过 `<script src="chat-widget.js">` 在所有页面加载

**风险**: 任何访问网站的人都可以查看源代码获取 API Key。该 Key 可被用于无限调用 SenseNova API，产生账单。

**修复方案**:
1. 短期：通过后端代理转发 API 请求（如已有的 `proxy-auth.js`），前端不持有 Key
2. 中期：使用 Cloudflare Workers 或其他边缘函数做 API 代理
3. 长期：搭建自有 API Gateway 做鉴权和限流

### 1.2 无 Content Security Policy (CSP)

**风险**: 站点完全依赖浏览器的同源策略，无任何 XSS 防御层。聊天组件动态插入 HTML 无 CSP 约束。

**修复**: 在 HTML `<head>` 添加：
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://hm.baidu.com https://zz.bdstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src https://token.sensenova.cn;">
```

---

## 二、高优先级问题 (HIGH — 本周修复)

### 2.1 Sitemap 严重不完整

当前 sitemap.xml 仅收录 **~50 个 URL**，实际站点有 **~90+ 个公开页面**。

**缺失的页面**:
- 15 个案例详情页 (`/cases/*.html`)
- 16 个城市补贴页 (`/subsidy/city/*.html` — 只收录了 20 个中的 20 个？等一下——重新审计)
- 实际缺失: about.html, cases.html, services/index.html, services/process.html, subsidy/checklist.html, privacy.html, blog/posts/ 下约 10 篇文章
- 所有 10 个英文页面
- 404 页面不应在 sitemap 中（但目前也没有）

**另外缺失的页面检查**：
- `/about.html` — 不在 sitemap
- `/cases.html` — 不在 sitemap
- `/services/` — 不在 sitemap
- `/services/process.html` — 不在 sitemap
- `/subsidy/checklist.html` — 不在 sitemap
- `/privacy.html` — 不在 sitemap
- 全部 10 个 EN 页面 — 不在 sitemap
- 案例页 15 个 — 全部不在 sitemap

**修复**: 重新生成完整 sitemap，按优先级分 tier：
- Tier 1 (1.0-0.8): 首页、blog/、subsidy/
- Tier 2 (0.7-0.6): 博客文章、主要服务页、一线城市
- Tier 3 (0.5-0.4): 案例页、二三线城市、英文页

### 2.2 大量页面缺少 og:image 和 twitter:image

**影响**: 社交分享时无预览图，严重影响点击率。

**缺少 og:image 的页面类型**:
- 所有 15 个案例页
- 所有服务页 (services/*.html)
- 所有城市补贴页 (subsidy/city/*.html)
- 关于页、隐私页
- 首页 og:image 使用 200x200 QR 码，不符合 1200x675 标准

### 2.3 英文页面缺少 hreflang

中文页面（部分）有 `<link rel="alternate" hreflang="en">`，但英文页面（`/en/*.html`）均缺少对应的 `<link rel="alternate" hreflang="zh">`，Google 无法正确识别双语关系。

### 2.4 博客封面格式不一致

`blog-covers/` 目录下：
- 较新的 10 篇文章：同时有 `.svg` 和 `.png`（AI 生成）
- 较旧的 11 篇：仅有 `.svg`（手工 SVG）
- 1 篇（今天的辽宁 OPC）：仅有 `.png`，缺 `.svg`

且有文章引用 `.svg`（如 `2026-05-15-opc-subsidy-application-guide.html`）但该 SVG 是简单占位符，非 AI 封面。

### 2.5 Twitter Card 类型不一致

- 首页: `twitter:card` = `summary` (小图)
- Blog 文章（已修复的）: `summary_large_image`
- 其他页面: 大多缺 `twitter:card`

应统一为 `summary_large_image`（有封面图的页面）或 `summary`（无封面图的页面）。

---

## 三、中优先级问题 (MEDIUM — 两周内修复)

### 3.1 性能优化缺失

| 问题 | 影响 | 修复 |
|------|------|------|
| Google Fonts `@import` 阻塞渲染 | FCP +1-2s | 改用 `<link rel="preload">` + `font-display: swap` |
| 无 CSS 压缩 | style.css 约 50KB | 构建时 minify |
| 无 JS 压缩 | app-core.js / app.js | 构建时 minify |
| 图片用 JPG 而非 WebP | 每张省 30-50% | 转 WebP + 保留 JPG 回退 |
| 无图片懒加载 | LCP 被折叠图片拖累 | 添加 `loading="lazy"` |
| 无资源缓存策略 | 重复访问全量下载 | GitHub Pages 无 server 控制，用 meta cache-control |

### 3.2 可访问性 (Accessibility) 缺陷

| 问题 | 涉及范围 |
|------|----------|
| 大量 `<img>` 缺 `alt` 属性 | 案例页、服务页、城市页的图片 |
| 无 "跳到主内容" (Skip to content) 链接 | 全站 |
| 无 ARIA landmark (`<main>`, `<nav>` 虽有但缺 `aria-label`) | 全站 |
| 焦点样式被覆盖 | 需确认 `:focus-visible` 样式 |
| 无 `lang` 属性在英文页面部分内容 | en/ 页面 body 内容可能有 zh 片段 |

### 3.3 代码质量问题

**内联样式污染**: `index.html` 的 `.hero-wrapper`、`.service-link`、`.trust-compact` 样式内联在 `<style>` 标签而非 style.css。类似问题可能存在于其他页面。

**构建脚本残留在生产目录**: `scripts/` 下有 20 个脚本文件，其中 14 个是 `_fill_*.js` 的临时脚本，不应部署到生产环境。

**开发文件泄露**:
- `plan.md` — 内部开发计划
- `_check_i18n.py` — 开发工具脚本
- 以上文件可通过 URL 直接访问（GitHub Pages 默认允许）

**没有 .gitignore 保护这些文件不被部署。**

### 3.4 结构化数据不完整

- 首页有 `WebSite` + `FAQPage` + `Organization`
- 博客文章页有 `BlogPosting` + `BreadcrumbList`
- 但服务页、案例页、城市页均无结构化数据
- English 页面完全没有 JSON-LD

### 3.5 404 页面无 JavaScript 恢复功能

`404.html` 是静态页面，无 "您可能在找..." 的建议链接，无站点搜索。

---

## 四、低优先级问题 (LOW — 下个迭代)

### 4.1 PWA 缺失
- 无 `manifest.json`（无法添加到主屏幕）
- 无 Service Worker（无离线缓存）
- 对于"工具类"网站，PWA 可显著提升移动端留存

### 4.2 百度站长验证
- `baidu_verify_codeva-ZAc7vhn5zi.html` 存在，验证已完成
- 但百度自动推送代码仅在 `index.html` 中

### 4.3 其他
- 无 500/503 错误页面（虽然 GitHub Pages 很少出 500）
- `profile.html`, `quiz.html` 等工具页链向支付流程，但支付集成状态不明确
- 无 Cookie 同意横幅（如使用百度统计 + 未来欧洲用户需 GDPR）
- 案例页 `cases/*.html` 各有不同结构和格式，视觉效果不统一

---

## 五、按页面类型的审计 Checklist

### 首页 (index.html)
- [x] Title / Description / Keywords
- [x] Canonical URL
- [x] hreflang (zh ↔ en)
- [x] 结构化数据 (WebSite + FAQ + Organization)
- [x] 百度统计 + 自动推送
- [!] og:image 尺寸不符合标准 (200x200 → 应为 1200x675)
- [!] twitter:card = summary (应为 summary_large_image)
- [!] 内联样式在 HTML 中

### 博客列表 (blog/index.html)
- [x] Canonical URL
- [!] 缺 og:image / og:title / og:description
- [!] 缺 hreflang
- [!] 缺结构化数据 (Blog 列表页应用 CollectionPage 或 Blog type)

### 博客文章 (blog/posts/*.html)
- [x] Title / Description / Keywords
- [x] Canonical URL
- [x] 结构化数据 (BlogPosting + BreadcrumbList)
- [!] 部分缺 og:image (已为辽宁 OPC 修复)
- [!] 部分仍引用 .svg 封面
- [!] 缺 hreflang
- [!] 缺 related posts 结构化数据

### 服务页 (services/*.html)
- [!] 缺 og:image、twitter 标签
- [!] 缺 hreflang
- [!] 缺结构化数据 (Service type)
- [!] services/index.html 内容是导航还是实际内容？

### 案例页 (cases/*.html)
- [!] 缺统一格式和样式
- [!] 缺 og:image、结构化数据
- [!] 图片是否有 alt？

### 城市补贴页 (subsidy/city/*.html)
- [!] 缺 og 标签
- [!] 缺结构化数据
- [!] 缺 hreflang

### 英文页面 (en/*.html)
- [!] 均缺 hreflang 指向中文对应页
- [!] 均缺结构化数据
- [!] 仅有 10 页，博客文章无英文版

---

## 六、修复优先级路线图

### 第一阶段：安全 (本周)
1. 移除 chat-widget.js 中的硬编码 API Key → 用代理
2. 添加 CSP meta 标签

### 第二阶段：SEO 修复 (本周)
3. 重新生成完整 sitemap.xml（补充 40+ 缺失页面）
4. 为所有页面统一添加 og:image（用对应的 blog-covers 或站点默认图）
5. 英文页面补充 hreflang 标签
6. 统一 twitter:card 类型

### 第三阶段：性能 + 代码 (两周)
7. CSS/JS 压缩
8. 图片转 WebP
9. 添加图片懒加载
10. 清理生产目录中的构建脚本和开发文件
11. 修复 .gitignore

### 第四阶段：体验 (一个月)
12. 可访问性修复（alt 文本、skip link、ARIA）
13. 统一案例页格式
14. PWA 支持
15. 完善结构化数据覆盖

---

## 七、正面发现

以下方面做得很好，应继续保持：

1. **Apple-style 设计系统**: 极简主义设计、大字体排版、良好留白。CSS 自定义属性设计规范
2. **响应式设计**: 4 个断点 (374/414/680/860px)，clamp() 排版
3. **i18n 架构**: 运行时 + 构建时混合方案，JSON 字典，URL 路由
4. **结构化数据**: 首页的 FAQPage + Organization 已做好，博客文章有 BlogPosting + BreadcrumbList
5. **SEO 基础**: canonical URL、robots.txt、sitemap 三件套齐全
6. **百度生态**: 统计 + 自动推送已集成
7. **博客内容**: 22 篇文章覆盖创业、税务、补贴、AI 等核心话题，质量扎实
8. **AI 聊天**: 浮动客服按钮 + 知识库注入（虽然 API Key 需要安全加固）
9. **404 页面**: 中英文双版本
10. **打印样式**: @media print 已考虑
