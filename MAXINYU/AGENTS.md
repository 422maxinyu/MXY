<!-- 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） -->
# 项目开发规则

## 项目结构与技术栈

- 前端位于 `frontend/`，使用原生 HTML、CSS、JavaScript；禁止使用任何第三方库、框架或 CDN 链接。
- 在 `frontend/` 下建立 `css/`、`js/`、`fonts/`、`images/` 子目录；如有 iconfont 图标文件，放入 `fonts/`。
- 后端位于 `backend/`，使用 Node.js + Express，采用 RESTful + MVC 风格；所有接口以 `/api/` 为前缀，端口固定为 `8422`，并使用 `express.static` 托管 `frontend/`。
- 后端支持所有跨域访问。
- 安装后端依赖时，优先使用 `cnpm i 包名`；失败或超时后使用 `npm i 包名`。
- 数据库使用 MySQL。数据库连接配置写入 `backend/.env`，变量名为 `DB_USER`、`DB_PASSWORD`、`DB_HOST`、`DB_NAME`；不得将凭据写入代码或 `AGENTS.md`。将 `.env` 加入 `.gitignore`。
- 根据后端需求建立或修改数据库表；每张表建立后插入至少 8 条具有真实业务意义的测试数据。
- 统一 JSON 响应格式为 `{ "code": 0, "msg": "提示信息", "data": {} }`；`code: 0` 表示成功，非 0 表示失败。

## 命名与注释

- CSS 类名、JavaScript 变量名和函数名、数据库表名及字段名一律以 `ma_` 开头。
- 每个文件头部包含注释块，注明：`姓名：马欣宇 | 学号：24001010422 | 时间：yyyy-mm-dd | 大模型：{本次使用的大模型名称}`。按文件格式使用对应的注释语法。

## 记录文件

- 记录文件一律追加写入，禁止覆盖已有内容。
- 每次向 AI 发出开发指令后，在项目根目录 `maxinyu_prompt.md` 追加记录：时间、提示词全文、大模型名称。
- 每次创建或修改接口后，在 `backend/ma_interface.md` 追加记录：接口路径、HTTP 方法、请求参数（含示例）、响应格式（含 JSON 示例）、修改时间。
- 每次建表、改表或插入数据后，在 `backend/ma_database.md` 按执行顺序追加对应 SQL（包括测试数据的 `INSERT`）；仅凭该文件即可在新机器上完整重建数据库。

## 前端约定

- 将服务器返回的数据和错误信息输出到浏览器控制台，分别使用 `console.log` 和 `console.error`。
- 新建 HTML 页面后，在 `frontend/index.html` 追加其超链接入口；文件名包含 `detail` 的页面除外。
