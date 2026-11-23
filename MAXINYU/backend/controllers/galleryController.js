/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） */
const ma_galleryModel = require("../models/galleryModel");

async function ma_listGalleryItems(ma_request, ma_response) {
  try {
    const ma_items = await ma_galleryModel.ma_getPublishedGalleryItems();

    return ma_response.json({
      code: 0,
      msg: "图文列表获取成功。",
      data: {
        ma_items,
        ma_total: ma_items.length
      }
    });
  } catch (ma_error) {
    console.error("获取图文列表失败：", ma_error.message);
    return ma_response.status(503).json({
      code: 1,
      msg: "暂时无法获取图文列表，请检查数据库连接。",
      data: {}
    });
  }
}

module.exports = { ma_listGalleryItems };
