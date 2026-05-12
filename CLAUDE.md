# CLAUDE.md — OPC 一人公司孵化器

## 会话启动（每次必须执行）

1. 先读 `F:\言堇知识库\言堇知识库\ClaudeCode\项目状态.md` 恢复上下文
2. 再读 `F:\言堇知识库\言堇知识库\ClaudeCode\会话日志.md` 了解上次做了什么

## 会话结束或关键操作后

追加记录到 `F:\言堇知识库\言堇知识库\ClaudeCode\会话日志.md`：
- 日期+操作内容+Git commit+结果
- 更新 `项目状态.md` 中变化的部分（页面清单、规则变动、待办状态）

## 项目部署

- **生产目录**: `F:\OPC测评系统\deploy`
- **镜像目录**: `F:\OPC测评系统\refactor`（每次 deploy 改动后同步）
- **GitHub**: `git@github.com:OPC0307/opc-assessment.git` (main 分支)
- **域名**: fhopc.top (GitHub Pages)
- **百度统计**: `a5621eae6e5f4f4f530c462888dae44f`

## i18n 铁律（不可违反）

1. i18n.js 不再自动检测浏览器语言，默认永远中文
2. 新增**纯中文内容页**：不加任何 data-i18n 属性
3. 新增**双语页面**：所有可见文字必须加 data-i18n，zh.json 和 en.json 各一份
4. 百度统计在 `<head>` 里静态埋点 `<script>` 块

## 代码规范

- 4 space indentation（与现有代码一致）
- 不引入新依赖，不创建构建系统
- 修改 deploy/ 后必须同步到 refactor/
- commit message 用英文，描述 why 而非 what
- push 前确保所有文件已 staged
