---
description: "Use when creating or editing HTML pages in this project. Requires yl_ prefixes for variables, CSS classes and IDs, plus an author/date/function metadata comment on every HTML page."
applyTo: "**/*.html"
---

# HTML 命名与页面注释规则

- 所有 JavaScript 变量名（包括参数和局部变量）均以 `yl_` 开始，例如 `yl_userName`。
- 所有 CSS 类名和 HTML `id` 值均以 `yl_` 开始；同一元素的每个类名都必须符合规则。
- CSS 自定义属性遵循 CSS 语法并以 `--yl_` 开始，例如 `--yl_main-color`。
- 每个 HTML 页面都必须包含 HTML 注释，注明姓名、日期和功能名称。将注释放在 `<head>` 内靠前位置，使用简体中文和 `YYYY-MM-DD` 日期格式，例如：

  ```html
  <!-- 姓名：马欣宇；日期：2026-10-22；功能名称：JavaScript 输出与对话框练习 -->
  ```

- 新建页面时直接遵守以上规则。编辑已有页面时，确保该页面满足规则；重命名已有类名或 `id` 时同步更新全部引用，不要留下断开的选择器或链接。
- 保持页面原有教学内容和项目约定；本规则不要求改动无关页面。
