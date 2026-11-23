/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） */
const { ma_pool } = require("./database");

async function ma_getPublishedGalleryItems() {
  const [ma_rows] = await ma_pool.execute(
    `SELECT ma_id, ma_slug, ma_title, ma_description, ma_category,
            ma_price, ma_image_url, ma_published_at
     FROM ma_gallery_items
     WHERE ma_status = 1
     ORDER BY ma_published_at DESC, ma_id DESC`
  );

  return ma_rows;
}

module.exports = { ma_getPublishedGalleryItems };
