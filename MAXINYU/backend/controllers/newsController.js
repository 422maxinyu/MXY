/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） */
const ma_newsModel = require("../models/newsModel");

async function ma_listNews(ma_request, ma_response) {
  try {
    const ma_news = await ma_newsModel.ma_getPublishedNews();

    return ma_response.json({
      code: 0,
      msg: "科技新闻获取成功。",
      data: {
        ma_news,
        ma_total: ma_news.length
      }
    });
  } catch (ma_error) {
    console.error("获取科技新闻失败：", ma_error.message);
    return ma_response.status(503).json({
      code: 1,
      msg: "暂时无法获取科技新闻，请检查数据库连接。",
      data: {}
    });
  }
}

module.exports = { ma_listNews };
