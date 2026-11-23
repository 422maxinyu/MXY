/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-16 | 大模型：Trae */
const ma_visionModel = require("../models/visionModel");

const ma_maxBase64Len = Math.floor(10 * 1024 * 1024 * 4 / 3); // 约 13.3 MB base64 上限

async function ma_analyzeImage(ma_request, ma_response) {
  try {
    const ma_body = ma_request.body || {};
    const ma_base64Data = String(ma_body.ma_content || "").trim();
    const ma_fileName = String(ma_body.ma_file_name || "image.png").trim();
    const ma_question = String(ma_body.ma_question || "").trim();

    if (!ma_base64Data) {
      return ma_response.status(400).json({ code: 1, msg: "未检测到图片数据，请选择图片后重试。", data: {} });
    }
    if (ma_base64Data.length > ma_maxBase64Len) {
      return ma_response.status(400).json({ code: 1, msg: "图片过大（超过约 10 MB），请使用更小的图片。", data: {} });
    }

    const ma_description = await ma_visionModel.ma_analyzeImage(ma_base64Data, ma_fileName, ma_question);

    return ma_response.json({
      code: 0,
      msg: "图片识别完成。",
      data: { ma_description, ma_model: ma_visionModel.ma_model }
    });
  } catch (ma_error) {
    console.error("图片识别失败:", ma_error.message);
    return ma_response.status(ma_error.status || 502).json({
      code: 1,
      msg: ma_error.message || "图片识别暂时不可用，请稍后重试。",
      data: {}
    });
  }
}

module.exports = { ma_analyzeImage };
