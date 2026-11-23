<!-- 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） -->

## 接口记录

### 健康检查

- 接口路径：`/api/health`
- HTTP 方法：`GET`
- 请求参数：无。示例：`curl http://localhost:8422/api/health`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": {} }`
- JSON 示例：`{ "code": 0, "msg": "服务运行正常", "data": { "ma_status": "ok" } }`
- 修改时间：2026-11-09 14:09（UTC+08:00）

### 未知 API 路径

- 接口路径：`/api/*`
- HTTP 方法：所有方法（未匹配已注册接口时）
- 请求参数：无。示例：`curl http://localhost:8422/api/not-found`
- 响应格式：`{ "code": 1, "msg": "提示信息", "data": {} }`
- JSON 示例：`{ "code": 1, "msg": "接口不存在", "data": {} }`（HTTP 404）
- 修改时间：2026-11-09 14:09（UTC+08:00）

### 验证并连接 MySQL

- 接口路径：`/api/database/connect`
- HTTP 方法：`POST`
- 请求参数：JSON 字段 `ma_username`（字符串，最多 128 字符）和 `ma_password`（字符串，最多 256 字符）。示例：`{ "ma_username": "root", "ma_password": "<在页面中输入的数据库密码>" }`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": {} }`；成功时执行 `SELECT 1`，请求凭据须与 `backend/.env` 配置一致；凭据仅用于本次验证，不会存储或写入日志。
- 成功示例：`{ "code": 0, "msg": "数据库连接成功。", "data": { "ma_connected": true } }`
- 凭据错误示例：`{ "code": 1, "msg": "用户名或密码不正确。", "data": {} }`（HTTP 401）
- 数据库不可用示例：`{ "code": 1, "msg": "数据库连接失败，请检查 MySQL 服务和后端环境配置。", "data": {} }`（HTTP 503）
- 修改时间：2026-11-09 14:25（UTC+08:00）

### 获取科技新闻列表

- 接口路径：`/api/news`
- HTTP 方法：`GET`
- 请求参数：无。示例：`curl http://localhost:8422/api/news`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": { "ma_news": [], "ma_total": 0 } }`
- 成功示例：`{ "code": 0, "msg": "科技新闻获取成功。", "data": { "ma_news": [{ "ma_id": 1, "ma_slug": "ai-workflow-assistant-20261109", "ma_title": "示例新闻标题", "ma_summary": "示例新闻摘要", "ma_category": "人工智能", "ma_source": "课程项目演示", "ma_published_at": "2026-11-09T05:30:00.000Z" }], "ma_total": 1 } }`
- 数据库不可用示例：`{ "code": 1, "msg": "暂时无法获取科技新闻，请检查数据库连接。", "data": {} }`（HTTP 503）
- 修改时间：2026-11-09 14:40（UTC+08:00）

### 获取商城图文商品列表

- 接口路径：`/api/gallery`
- HTTP 方法：`GET`
- 请求参数：无。示例：`curl http://localhost:8422/api/gallery`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": { "ma_items": [], "ma_total": 0 } }`
- 成功示例：`{ "code": 0, "msg": "图文列表获取成功。", "data": { "ma_items": [{ "ma_id": 1, "ma_slug": "xiaomi-phone-20261109", "ma_title": "Xiaomi 轻旗舰手机", "ma_description": "轻薄机身搭配高刷屏幕与多焦段影像，适合日常沟通、内容创作和移动办公。", "ma_category": "手机", "ma_price": "2999.00", "ma_image_url": "./images/ma_gallery_phone.svg", "ma_published_at": "2026-11-09T06:00:00.000Z" }], "ma_total": 1 } }`
- 数据库不可用示例：`{ "code": 1, "msg": "暂时无法获取图文列表，请检查数据库连接。", "data": {} }`（HTTP 503）
- 修改时间：2026-11-09 14:45（UTC+08:00）

### AI 聊天

- 接口路径：`/api/chat`
- HTTP 方法：`POST`
- 请求参数：JSON 字段 `ma_messages`，包含 1 至 20 条对话，每条的 `role` 为 `user` 或 `assistant`、`content` 为最多 4000 字符的非空字符串，且最后一条须为 `user`。示例：`{ "ma_messages": [{ "role": "user", "content": "你好，请介绍一下你自己" }] }`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": { "ma_reply": "..." } }`
- 成功示例：`{ "code": 0, "msg": "AI 回复成功。", "data": { "ma_reply": "你好！我是一个有用的助手。" } }`
- 配置缺失示例：`{ "code": 1, "msg": "AI 服务尚未配置，请在 backend/.env 中设置 SILICONFLOW_API_KEY。", "data": {} }`（HTTP 503）
- 修改时间：2026-11-12 13:58（UTC+08:00）

### 查询知识库文件

- 接口路径：`/api/knowledge`
- HTTP 方法：`GET`
- 请求参数：无。示例：`curl http://localhost:8422/api/knowledge`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": { "ma_documents": [], "ma_total": 0 } }`
- 成功示例：`{ "code": 0, "msg": "知识库文件获取成功。", "data": { "ma_documents": [{ "ma_id": "uuid", "ma_name": "ma_退换货与配送示例.txt", "ma_type": "TXT", "ma_char_count": 420, "ma_uploaded_at": "2026-11-12T06:39:00.000Z" }], "ma_total": 1 } }`
- 修改时间：2026-11-12 14:39（UTC+08:00）

### 下载商业评论 Excel 模板

- 接口路径：`/api/commercial-reviews/template`
- HTTP 方法：`GET`
- 请求参数：无。示例：`curl -OJ http://localhost:8422/api/commercial-reviews/template`
- 响应格式：Excel `.xlsx` 二进制文件下载；异常时使用 `{ "code": 1, "msg": "提示信息", "data": {} }` JSON 响应。
- 文件列：`评论ID`、`商品名称`、`评论内容`、`评分`、`评论时间`。
- 修改时间：2026-11-16 14:00（UTC+08:00）

### 下载商业评论模拟数据

- 接口路径：`/api/commercial-reviews/samples/:ma_sampleId`
- HTTP 方法：`GET`
- 请求参数：路径参数 `ma_sampleId` 为 `1`、`2` 或 `3`。示例：`curl -OJ http://localhost:8422/api/commercial-reviews/samples/1`
- 响应格式：Excel `.xlsx` 二进制文件下载，每份包含 20 条模拟评论；无效 ID 返回 `{ "code": 1, "msg": "未找到该示例文件。", "data": {} }`（HTTP 404）。
- 修改时间：2026-11-16 14:00（UTC+08:00）

### 上传并分析商业评论

- 接口路径：`/api/commercial-reviews/analyze`
- HTTP 方法：`POST`
- 请求参数：JSON 字段 `ma_name`（`.xlsx` 文件名）与 `ma_content`（Excel 原始字节的 Base64 编码）；首个工作表首行必须含 `评论内容`，可选列为 `评论ID`、`商品名称`、`评分`、`评论时间`。单个文件最大 5 MB、每条评论最多 1000 字符、每次最多 100 条。评论会按每批 20 条发送至 AI；每条须返回合法 JSON 评价。示例：`{ "ma_name": "reviews.xlsx", "ma_content": "UEsDB..." }`
- AI 返回格式：`{ "ma_results": [{ "ma_review_id": "R001", "ma_sentiment": "好评", "ma_is_valuable": true, "ma_reason": "续航表现具体且可用于产品反馈。" }] }`；`ma_sentiment` 仅允许 `好评`、`中评`、`差评`。
- 成功响应示例：`{ "code": 0, "msg": "商业评论分析完成。", "data": { "ma_summary": { "ma_total": 1, "ma_positive": 1, "ma_neutral": 0, "ma_negative": 0, "ma_valuable": 1 }, "ma_reviews": [{ "ma_review_id": "R001", "ma_product": "示例商品", "ma_content": "续航很稳定。", "ma_sentiment": "好评", "ma_is_valuable": true, "ma_reason": "续航反馈具体且可用于产品决策。" }], "ma_highlights": [{ "ma_review_id": "R001", "ma_product": "示例商品", "ma_content": "续航很稳定。", "ma_sentiment": "好评", "ma_is_valuable": true, "ma_reason": "续航反馈具体且可用于产品决策。" }] } }`
- 文件无效示例：`{ "code": 1, "msg": "请在首行设置“评论内容”列，可使用页面提供的 Excel 模板。", "data": {} }`（HTTP 400）；AI 输出无效 JSON 或与上传评论不匹配时返回非 0 错误，不会伪造分析结果。
- 修改时间：2026-11-16 14:00（UTC+08:00）

### 上传并解析知识库文件

- 接口路径：`/api/knowledge`
- HTTP 方法：`POST`
- 请求参数：JSON 字段 `ma_name`（文件名）和 `ma_content`（文件原始字节的 Base64 编码）；仅支持 TXT（UTF-8）和含可检索文字的 PDF，单个文件最大 6 MB。示例：`{ "ma_name": "faq.txt", "ma_content": "5L2g5aW9..." }`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": { "ma_document": {} } }`
- 成功示例：`{ "code": 0, "msg": "文件解析并加入知识库成功。", "data": { "ma_document": { "ma_id": "uuid", "ma_name": "faq.txt", "ma_type": "TXT", "ma_char_count": 8, "ma_uploaded_at": "2026-11-12T06:39:00.000Z" } } }`
- 修改时间：2026-11-12 14:39（UTC+08:00）

### 删除知识库文件

- 接口路径：`/api/knowledge/:ma_id`
- HTTP 方法：`DELETE`
- 请求参数：路径参数 `ma_id`（知识库文件 UUID）。示例：`curl -X DELETE http://localhost:8422/api/knowledge/uuid`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": {} }`
- 成功示例：`{ "code": 0, "msg": "知识库文件已删除。", "data": {} }`
- 文件不存在示例：`{ "code": 1, "msg": "未找到要删除的知识库文件。", "data": {} }`（HTTP 404）
- 修改时间：2026-11-12 14:39（UTC+08:00）

### 知识库客服问答

- 接口路径：`/api/knowledge/chat`
- HTTP 方法：`POST`
- 请求参数：JSON 字段 `ma_question`（1 至 1000 个字符）和可选 `ma_history`（最多 10 条、每条最多 2000 个字符的 user/assistant 对话）。服务器使用 BM25 风格词项匹配检索本地文件片段，再将问题、历史和检索资料发送给配置的 AI 服务。示例：`{ "ma_question": "怎么申请退货？", "ma_history": [] }`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": { "ma_reply": "...", "ma_sources": [] } }`
- 成功示例：`{ "code": 0, "msg": "客服回复成功。", "data": { "ma_reply": "请在签收后 7 天内联系在线客服申请。", "ma_sources": [{ "ma_name": "ma_退换货与配送示例.txt" }] } }`
- 修改时间：2026-11-12 14:39（UTC+08:00）

## 前端模拟接口（账号体系，拦截 fetch，无需后端）

> 说明：以下接口由 `frontend/js/mock-api.js` 在浏览器端模拟，用户表存放于 localStorage 的 `ma_mock_users`，token 表存放于 `ma_mock_tokens`，请求延迟约 420ms。

### 注册账号（模拟）

- 接口路径：`/api/auth/register`
- HTTP 方法：`POST`
- 请求参数：JSON 字段 `ma_username`（3-16 位字母、数字或下划线）、`ma_password`（6-20 位且含字母和数字）、`ma_email`、`ma_phone`（11 位手机号）。示例：`{ "ma_username": "maxinyu02", "ma_password": "Maxinyu2026", "ma_email": "maxinyu02@xiaomi.com", "ma_phone": "13800138002" }`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": { "ma_user": {} } }`
- 成功示例：`{ "code": 0, "msg": "注册成功，请使用新账号登录。", "data": { "ma_user": { "ma_user_id": 9, "ma_username": "maxinyu02", "ma_email": "maxinyu02@xiaomi.com", "ma_phone": "13800138002", "ma_created_at": "2026-11-19 13:42" } } }`
- 失败示例：`{ "code": 1001, "msg": "该用户名已被注册，请换一个。", "data": {} }`；`{ "code": 1004, "msg": "密码需为 6-20 位，且同时包含字母和数字。", "data": {} }`
- 修改时间：2026-11-19 13:42（UTC+08:00）

### 登录（模拟）

- 接口路径：`/api/auth/login`
- HTTP 方法：`POST`
- 请求参数：JSON 字段 `ma_username`、`ma_password`。示例：`{ "ma_username": "maxinyu", "ma_password": "Maxinyu2026" }`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": { "ma_token": "", "ma_token_type": "Bearer", "ma_expires_in": 86400000, "ma_user": {} } }`
- 成功示例：`{ "code": 0, "msg": "登录成功。", "data": { "ma_token": "ma_9f3c2a7b1k2j3h4", "ma_token_type": "Bearer", "ma_expires_in": 86400000, "ma_user": { "ma_user_id": 1, "ma_username": "maxinyu", "ma_email": "maxinyu@xiaomi.com", "ma_phone": "13800138000", "ma_created_at": "2026-11-19 09:00" } } }`
- 失败示例：`{ "code": 1002, "msg": "用户名或密码错误。", "data": {} }`
- 修改时间：2026-11-19 13:42（UTC+08:00）

### 读取当前登录用户（模拟）

- 接口路径：`/api/auth/profile`
- HTTP 方法：`GET`
- 请求参数：请求头 `Authorization: Bearer <token>`。示例：`curl -H "Authorization: Bearer ma_9f3c2a7b1k2j3h4" http://localhost:8422/api/auth/profile`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": { "ma_user": {}, "ma_issued_at": "", "ma_expires_at": "" } }`
- 成功示例：`{ "code": 0, "msg": "获取登录信息成功。", "data": { "ma_user": { "ma_user_id": 1, "ma_username": "maxinyu", "ma_email": "maxinyu@xiaomi.com", "ma_phone": "13800138000", "ma_created_at": "2026-11-19 09:00" }, "ma_issued_at": "2026-11-19 13:42", "ma_expires_at": "2026/11/20 13:42:00" } }`
- 失败示例：`{ "code": 1003, "msg": "token 无效，请重新登录。", "data": {} }`
- 修改时间：2026-11-19 13:42（UTC+08:00）

### 退出登录（模拟）

- 接口路径：`/api/auth/logout`
- HTTP 方法：`POST`
- 请求参数：请求头 `Authorization: Bearer <token>`，无请求体。示例：`curl -X POST -H "Authorization: Bearer ma_9f3c2a7b1k2j3h4" http://localhost:8422/api/auth/logout`
- 响应格式：`{ "code": 0, "msg": "提示信息", "data": {} }`
- 成功示例：`{ "code": 0, "msg": "已退出登录。", "data": {} }`
- 修改时间：2026-11-19 13:42（UTC+08:00）

## 前端模拟接口（后台实体管理 + 仪表盘，localStorage 充当数据表）

> 说明：以下接口由 `frontend/js/mock-db.js` 在浏览器端模拟，数据存放在 localStorage 的 `ma_db_products`、`ma_db_orders`、`ma_db_users` 中，双击 HTML 即可运行。

### 实体列表（商品 / 订单 / 用户通用）

- 接口路径：`/api/products`、`/api/orders`、`/api/users`
- HTTP 方法：`GET`
- 请求参数：查询字符串 `ma_keyword`（可选，任意字段模糊搜索）、`ma_page`（默认 1）、`ma_size`（默认 6）。示例：`/api/products?ma_keyword=耳机&ma_page=1&ma_size=6`
- 响应格式：`{ "code": 0, "msg": "", "data": { "ma_list": [], "ma_total": 0, "ma_page": 1, "ma_pages": 1, "ma_size": 6 } }`
- 成功示例：`{ "code": 0, "msg": "操作成功。", "data": { "ma_list": [{ "ma_id": 4, "ma_name": "Redmi Buds 6", "ma_category": "耳机", "ma_price": 299, "ma_stock": 410, "ma_status": "在售", "ma_created_at": "2026-07-09" }], "ma_total": 2, "ma_page": 1, "ma_pages": 1, "ma_size": 6 } }`
- 修改时间：2026-11-19 14:35（UTC+08:00）

### 实体详情

- 接口路径：`/api/products/:ma_id`（订单、用户同理）
- HTTP 方法：`GET`
- 请求参数：路径参数 `ma_id`。示例：`/api/products/3`
- 响应格式：`{ "code": 0, "msg": "操作成功。", "data": { "ma_row": {} } }`
- 失败示例：`{ "code": 404, "msg": "未找到对应记录。", "data": {} }`
- 修改时间：2026-11-19 14:35（UTC+08:00）

### 新增实体

- 接口路径：`/api/products`（订单、用户同理）
- HTTP 方法：`POST`
- 请求参数：JSON。商品示例：`{ "ma_name": "测试新品", "ma_category": "配件", "ma_price": 199, "ma_stock": 50, "ma_status": "在售" }`
- 响应格式：`{ "code": 0, "msg": "商品新增成功。", "data": { "ma_row": {} } }`
- 失败示例：`{ "code": 1004, "msg": "商品名称不能为空。", "data": {} }`
- 修改时间：2026-11-19 14:35（UTC+08:00）

### 修改实体

- 接口路径：`/api/products/:ma_id`
- HTTP 方法：`PUT`
- 请求参数：JSON，字段同新增。示例：`{ "ma_name": "测试新品 Pro", "ma_category": "配件", "ma_price": 299, "ma_stock": 60, "ma_status": "下架" }`
- 响应格式：`{ "code": 0, "msg": "商品修改成功。", "data": { "ma_row": {} } }`
- 修改时间：2026-11-19 14:35（UTC+08:00）

### 删除实体

- 接口路径：`/api/products/:ma_id`
- HTTP 方法：`DELETE`
- 请求参数：路径参数 `ma_id`。示例：`DELETE /api/products/13`
- 响应格式：`{ "code": 0, "msg": "商品删除成功。", "data": {} }`
- 修改时间：2026-11-19 14:35（UTC+08:00）

### 仪表盘统计

- 接口路径：`/api/stats/dashboard`
- HTTP 方法：`GET`
- 请求参数：无
- 响应格式：`{ "code": 0, "msg": "", "data": { "ma_kpi": {}, "ma_monthly": [], "ma_category": [], "ma_status": [], "ma_top": [], "ma_updated_at": "" } }`
- 成功示例：`{ "code": 0, "msg": "操作成功。", "data": { "ma_kpi": { "ma_product_total": 12, "ma_order_total": 12, "ma_user_total": 10, "ma_revenue": 28719 }, "ma_monthly": [{ "ma_month": "6 月", "ma_sales": 7498, "ma_orders": 2 }], "ma_category": [{ "ma_name": "手机", "ma_value": 2 }], "ma_status": [{ "ma_name": "已完成", "ma_value": 6 }], "ma_top": [{ "ma_name": "小米 15 Pro", "ma_value": 9998 }], "ma_updated_at": "2026/11/19 14:28:36" } }`
- 修改时间：2026-11-19 14:35（UTC+08:00）
