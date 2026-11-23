<!-- 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） -->

# 小米商城

- 姓名：马欣宇
- 学号：24001010422
- 项目名称：小米商城
- 项目类别：自选

## 项目结构

- `frontend/`：原生 HTML、CSS、JavaScript 前端页面、样式、脚本、字体和图片。
- `backend/`：Node.js + Express 后端、REST API、MVC 模块和 MySQL 连接池。
- `backend/.env`：本地数据库连接配置，不纳入版本控制。首次使用时可参考 `backend/.env.example` 配置。
- `frontend/database.html`：输入本地数据库凭据并测试 MySQL 连接；页面不会保存密码。
- `frontend/news.html`：科技新闻列表，从 MySQL 新闻表通过 `/api/news` 加载数据，并提供原始 JSON 查看。
- `frontend/gallery.html`：图文商品列表，从 MySQL 商品表通过 `/api/gallery` 加载数据，配套原创本地 SVG 商品插画。
- `frontend/knowledge.html`：上传、解析、查看和删除本地 TXT / PDF 知识库文件。
- `frontend/service.html`：检索本地知识库内容并调用 AI 的客服问答页面。
- `frontend/knowledge-samples/`：两份可用于测试上传的示例 TXT 资料。
- `frontend/commercial-reviews.html`：上传 Excel 商业评论，调用 AI 逐条分类并查看情绪饼图与精选评论。
- `ma_commercial_reviews_template.xlsx`：商业评论上传模板；根目录 `ma_commercial_reviews_sample_1.xlsx` 至 `ma_commercial_reviews_sample_3.xlsx` 各含 20 条模拟评论。
- 商业评论分析最多接收 100 条评论（单条不超过 1000 字符）；AI 结果使用 JSON 字段 `ma_review_id`、`ma_sentiment`（好评/中评/差评）、`ma_is_valuable` 和 `ma_reason`，具体接口结构见 `backend/ma_interface.md`。评论内容会发送至配置的 AI 服务并记录在后端控制台，请勿上传敏感数据。
- 知识库解析后的文本保存在 `backend/data/ma_knowledge.json`，无需 MySQL 表；PDF 支持可提取文本的文档，扫描版 PDF 需先进行 OCR。
- 知识库 AI 问答复用 `backend/.env` 中的 `SILICONFLOW_API_KEY`；前端请求和模型回复会输出到浏览器控制台，API Key 不会发送到浏览器。

## 启动

1. 首次运行时，在 `backend/` 安装依赖：`npm install`。
2. 确认 MySQL 服务已启动，并按需设置 `backend/.env` 中的数据库连接信息。
3. 双击项目根目录的 `启动项目.bat`，脚本会启动后端、等待服务就绪并打开项目首页。若服务已运行，则直接打开首页。
4. 也可以在 `backend/` 手动运行 `npm start`，然后访问 `http://localhost:8422/`；接口健康检查地址为 `http://localhost:8422/api/health`。

首页 canvas 动画由原生 JavaScript 绘制；所有页面均通过首页导航链接访问。目前完成的 HTML 页面为 `frontend/index.html`。
