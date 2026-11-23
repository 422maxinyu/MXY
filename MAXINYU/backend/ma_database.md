<!-- 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） -->

## 数据库初始化

```sql
CREATE DATABASE IF NOT EXISTS ma_maxinyu
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

执行后验证当前连接数据库为 `ma_maxinyu`。

## 科技新闻表及演示数据

```sql
CREATE TABLE IF NOT EXISTS ma_tech_news (
  ma_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ma_slug VARCHAR(120) NOT NULL,
  ma_title VARCHAR(200) NOT NULL,
  ma_summary TEXT NOT NULL,
  ma_category VARCHAR(40) NOT NULL,
  ma_source VARCHAR(100) NOT NULL,
  ma_published_at DATETIME NOT NULL,
  ma_status TINYINT UNSIGNED NOT NULL DEFAULT 1,
  ma_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ma_id),
  UNIQUE KEY ma_uk_tech_news_slug (ma_slug),
  KEY ma_idx_tech_news_status_published (ma_status, ma_published_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

```sql
INSERT INTO ma_tech_news
  (ma_slug, ma_title, ma_summary, ma_category, ma_source, ma_published_at, ma_status)
VALUES
  ('ai-workflow-assistant-20261109', '人工智能工具开始融入日常办公流程', '这条课程演示资讯介绍人工智能工具如何辅助整理资料、生成摘要和处理重复任务，并提醒用户在使用时核对重要信息。', '人工智能', '课程项目演示', '2026-11-09 13:30:00', 1),
  ('mobile-device-privacy-20261109', '移动设备隐私设置迎来集中管理体验', '演示资讯关注移动设备的权限管理与隐私提示，建议用户定期检查应用权限、系统更新和账号安全设置。', '手机数码', '课程项目演示', '2026-11-09 11:15:00', 1),
  ('smart-home-interoperability-20261108', '智能家居设备互联体验持续优化', '演示资讯聚焦照明、传感器和家电设备之间的场景联动，说明统一设备管理对安装、维护和日常使用的重要性。', '智能家居', '课程项目演示', '2026-11-08 16:40:00', 1),
  ('robotics-industrial-inspection-20261108', '机器人技术拓展工业巡检应用场景', '演示资讯介绍移动机器人结合摄像头与环境传感器执行例行巡检的思路，现场人员仍需负责异常确认和安全处置。', '机器人', '课程项目演示', '2026-11-08 10:20:00', 1),
  ('chip-energy-efficiency-20261107', '芯片能效成为终端设备升级关注点', '演示资讯围绕处理器性能、功耗和散热之间的平衡，说明芯片设计会影响手机、电脑及边缘设备的续航表现。', '半导体', '课程项目演示', '2026-11-07 15:05:00', 1),
  ('cloud-backup-security-20261107', '云备份服务加强账号与数据保护提示', '演示资讯介绍云端备份中的多因素验证、设备管理和恢复流程，提醒用户为重要账号启用额外保护措施。', '云计算', '课程项目演示', '2026-11-07 09:50:00', 1),
  ('ev-battery-monitoring-20261106', '电动汽车电池管理关注长期健康监测', '演示资讯说明电池管理系统会持续监测温度、电压和充放电状态，合理使用与按时维护有助于保持车辆运行状态。', '智能汽车', '课程项目演示', '2026-11-06 14:10:00', 1),
  ('digital-accessibility-20261106', '数字产品设计逐步重视无障碍体验', '演示资讯关注键盘操作、清晰对比度、替代文本和易读提示，说明无障碍改进也能提升更多用户的产品使用体验。', '产品设计', '课程项目演示', '2026-11-06 08:45:00', 1)
ON DUPLICATE KEY UPDATE
  ma_title = VALUES(ma_title),
  ma_summary = VALUES(ma_summary),
  ma_category = VALUES(ma_category),
  ma_source = VALUES(ma_source),
  ma_published_at = VALUES(ma_published_at),
  ma_status = VALUES(ma_status);
```

## 小米商城图文商品表及演示数据

```sql
CREATE TABLE IF NOT EXISTS ma_gallery_items (
  ma_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ma_slug VARCHAR(120) NOT NULL,
  ma_title VARCHAR(200) NOT NULL,
  ma_description TEXT NOT NULL,
  ma_category VARCHAR(40) NOT NULL,
  ma_price DECIMAL(10, 2) UNSIGNED NOT NULL,
  ma_image_url VARCHAR(255) NOT NULL,
  ma_published_at DATETIME NOT NULL,
  ma_status TINYINT UNSIGNED NOT NULL DEFAULT 1,
  ma_created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ma_id),
  UNIQUE KEY ma_uk_gallery_slug (ma_slug),
  KEY ma_idx_gallery_status_published (ma_status, ma_published_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
```

```sql
INSERT INTO ma_gallery_items
  (ma_slug, ma_title, ma_description, ma_category, ma_price, ma_image_url, ma_published_at, ma_status)
VALUES
  ('xiaomi-phone-20261109', 'Xiaomi 轻旗舰手机', '轻薄机身搭配高刷屏幕与多焦段影像，适合日常沟通、内容创作和移动办公。', '手机', 2999.00, './images/ma_gallery_phone.svg', '2026-11-09 14:00:00', 1),
  ('xiaomi-watch-20261108', 'Xiaomi 智能手表', '清晰易读的腕上屏幕配合全天活动记录和消息提醒，让运动与日常安排一目了然。', '穿戴', 799.00, './images/ma_gallery_watch.svg', '2026-11-08 16:30:00', 1),
  ('xiaomi-earbuds-20261108', 'Xiaomi 真无线耳机', '轻巧的充电盒方便随身收纳，适合通勤听歌、线上会议和日常视频通话。', '音频', 499.00, './images/ma_gallery_earbuds.svg', '2026-11-08 13:15:00', 1),
  ('xiaomi-speaker-20261107', 'Xiaomi 智能音箱', '简洁的小巧机身适合居家摆放，可用于播放音乐、设置提醒和语音控制兼容设备。', '智能家居', 299.00, './images/ma_gallery_speaker.svg', '2026-11-07 17:20:00', 1),
  ('xiaomi-laptop-20261107', 'Xiaomi 轻薄笔记本', '便携机身与大尺寸显示区域兼顾移动效率，可用于课程学习、文档处理和轻量创作。', '笔记本', 4999.00, './images/ma_gallery_laptop.svg', '2026-11-07 10:45:00', 1),
  ('xiaomi-vacuum-20261106', 'Xiaomi 扫拖机器人', '通过规划清扫路线处理日常地面灰尘，适合希望减少重复家务时间的家庭空间。', '智能家居', 1899.00, './images/ma_gallery_vacuum.svg', '2026-11-06 15:10:00', 1),
  ('xiaomi-camera-20261106', 'Xiaomi 室内智能摄像机', '小巧的室内摄像机设计适用于家庭空间查看与看护，具体功能以实际产品规格为准。', '智能家居', 249.00, './images/ma_gallery_camera.svg', '2026-11-06 11:35:00', 1),
  ('xiaomi-powerbank-20261105', 'Xiaomi 便携移动电源', '轻便外观适合日常通勤携带，为手机等兼容设备补充电量，出行使用更从容。', '配件', 159.00, './images/ma_gallery_powerbank.svg', '2026-11-05 09:25:00', 1)
ON DUPLICATE KEY UPDATE
  ma_title = VALUES(ma_title),
  ma_description = VALUES(ma_description),
  ma_category = VALUES(ma_category),
  ma_price = VALUES(ma_price),
  ma_image_url = VALUES(ma_image_url),
  ma_published_at = VALUES(ma_published_at),
  ma_status = VALUES(ma_status);
```
