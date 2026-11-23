# AGENTS.md

## What this repo is

Static, no-toolchain HTML/CSS coursework: 马欣宇's《高级网页设计》classroom exercises (folder name `网页`, Windows, Chinese-language content).

- **No build, no package manager, no test runner, no linter, no git, no CI.** There is nothing to install or compile — do not add tooling, `package.json`, CDNs, or frameworks unless explicitly asked.
- Open pages directly in a browser (`file://`) or serve the folder with any static server. Relative paths are used everywhere.

## Hard constraints (from the assignment text in `index.html`)

- 原生代码（原生 HTML + CSS），**不使用 CDN**。Only `2-2.html` has external links (exercise hyperlinks), which is intentional.
- `index.html` is the required entry point and must contain the assignment prompt verbatim inside its `.prompt-section` blockquote.

## Structure

- `index.html` — hub page. Its `.work-grid` nav lists every exercise page; **the header claims "13 pages", so adding or renaming an exercise page means updating both the nav cards and that count.** Currently linked: `1, 2, 2-2, 3, 4, 5-1, 5-2, 6-1, 6-2, 7-1, 7-2, 8-1, 9-1`.
- **Unlinked pages exist**: `10-1-animation.html`, `10-2.html`, `10-3.html`, `10-4.html`, `page1.html` (a 小米商城 clone). Do not assume every `*.html` in the root is reachable from the index; do not delete them.
- Numbered names map to class sessions (`N.html`, `N-M.html`). Keep that naming for new exercise pages.
- `css.css` — tiny shared stylesheet, **only referenced by `5-1.html`** (it is the 层叠/外部样式表 lesson). Every other page uses an inline `<style>` block. Do not "consolidate" styles into `css.css`; inline styles are part of the lesson.
- `img/` — local assets (`1.jpg`–`5.jpg`, `b*/c*/m*` sets, `neu.png`, `ic_launcher_background.png`). Referenced as `./img/...`. Keep image references relative.

## Conventions

- `<html lang="zh-CN">`, `charset UTF-8`, viewport meta on every page. Body copy is Simplified Chinese; keep it consistent when editing.
- Design tokens for `index.html` live in `:root` custom properties (`--ink`, `--paper`, `--coral`, `--teal`, `--gold`, ...). Reuse them instead of hardcoding colors on that page.
- `index.html` has a single `@media (max-width: 760px)` block covering its responsive behavior; edit inside it rather than adding parallel breakpoints.
- Card numbering in `index.html` (`01 / HTML`, `02 / CSS`, ...) is positional — `.work-card:nth-child(n)` styling depends on DOM order, so inserting a card mid-grid shifts colors.

## Verify manually

There is no automated check. After editing, open the touched page and `index.html` in a browser and confirm: images resolve, links navigate, and mobile width (~760px) still lays out correctly.

## 后续开发规则

以下规则用于后续新增或修改功能；如与上方对现有静态课程作业的描述不一致，按当前用户明确提出的功能需求执行。

### 项目结构与技术栈

- 前端位于 `frontend/`，使用原生 HTML、CSS、JavaScript；禁止使用第三方库、框架或 CDN 链接。
- 在 `frontend/` 下建立 `css/`、`js/`、`fonts/`、`images/` 子目录；如有 iconfont 图标文件，放入 `fonts/`。
- 后端位于 `backend/`，使用 Node.js + Express，采用 RESTful + MVC 风格；所有接口以 `/api/` 为前缀，端口固定为 `8422`，并使用 `express.static` 托管 `frontend/`。
- 后端支持所有跨域访问。
- 安装后端依赖时，优先使用 `cnpm i 包名`；失败或超时后使用 `npm i 包名`。
- 数据库使用 MySQL。数据库连接配置写入 `backend/.env`，变量名为 `DB_USER`、`DB_PASSWORD`、`DB_HOST`、`DB_NAME`；不得将凭据写入代码或 `AGENTS.md`。将 `.env` 加入 `.gitignore`。
- 根据后端需求建立或修改数据库表；每张表建立后插入至少 8 条具有真实业务意义的测试数据。
- 统一 JSON 响应格式为 `{ "code": 0, "msg": "提示信息", "data": {} }`；`code: 0` 表示成功，非 0 表示失败。

### 命名与注释

- CSS 类名、JavaScript 变量名和函数名、数据库表名及字段名一律以 `ma_` 开头。
- 每个文件头部包含注释块，注明：`姓名：马欣宇 | 学号：24001010422 | 时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}`。按文件格式使用对应的注释语法。

### 记录文件

- 记录文件一律追加写入，禁止覆盖已有内容。
- 每次向 AI 发出开发指令后，在项目根目录 `maxinyu_prompt.md` 追加记录：时间、提示词全文、大模型名称。
- 每次创建或修改接口后，在 `backend/ma_interface.md` 追加记录：接口路径、HTTP 方法、请求参数（含示例）、响应格式（含 JSON 示例）、修改时间。
- 每次建表、改表或插入数据后，在 `backend/ma_database.md` 按执行顺序追加对应 SQL（包括测试数据的 `INSERT`）；仅凭该文件即可在新机器上完整重建数据库。

### 前端约定

- 将服务器返回的数据和错误信息输出到浏览器控制台，分别使用 `console.log` 和 `console.error`。
- 新建 HTML 页面后，在 `frontend/index.html` 追加其超链接入口；文件名包含 `detail` 的页面除外。
