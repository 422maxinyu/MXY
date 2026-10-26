---
description: "Use when creating or editing project HTML, CSS, and JavaScript. Requires native browser APIs, local iconfont assets, no third-party libraries or CDN assets, and fetch for server-provided data."
applyTo: ["**/*.html", "**/*.css", "**/*.js"]
---

# 原生网页、图标与服务器数据规则

- 使用浏览器原生 HTML、CSS 和 JavaScript 实现功能。不要引入框架、第三方 JavaScript/CSS 库、图标库或 CDN 资源。
- 页面需要图标时，使用项目 `font/` 目录中的本地 iconfont 字体和映射。通过项目内相对路径加载本地字体；不要从网络下载图标或引入其他图标方案。为遵守命名规范，新增的自定义类名和 `id` 仍以 `yl_` 开始。
- 需要读取服务器端数据时，使用原生 `fetch()` 请求实际提供该数据的服务器接口，并显式处理 HTTP 错误和请求失败。不要把静态示例数据、虚构接口或浏览器本地数据描述成服务器端数据；如果任务没有提供可用接口，先说明依赖并询问或标记为待接入，不要静默回退到假数据。
- 只有在任务明确要求展示超链接、教学对照或其他外部页面导航时，才添加普通外部链接；不得通过这些链接加载第三方库、脚本、样式、字体或图标资源。
- 现有页面若有明确的课堂示例要求，保留其教学目的；新增或修改实现仍应遵守以上技术约束。
