/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-12 | 大模型：Copilot（具体模型名称未提供） */
const ma_llmModel = require("../models/llmModel");

async function ma_createChatCompletion(ma_request, ma_response) {
  const ma_messages = ma_request.body && ma_request.body.ma_messages;
  if (!Array.isArray(ma_messages) || ma_messages.length === 0 || ma_messages.length > 20) {
    return ma_response.status(400).json({
      code: 1,
      msg: "对话内容无效，请发送消息后重试。",
      data: {}
    });
  }

  const ma_hasInvalidMessage = ma_messages.some((ma_message) =>
    !ma_message
    || !["user", "assistant"].includes(ma_message.role)
    || typeof ma_message.content !== "string"
    || !ma_message.content.trim()
    || ma_message.content.length > 4000
  );
  if (ma_hasInvalidMessage || ma_messages[ma_messages.length - 1].role !== "user") {
    return ma_response.status(400).json({
      code: 1,
      msg: "对话内容格式无效，请检查后重试。",
      data: {}
    });
  }

  try {
    const ma_reply = await ma_llmModel.ma_requestCompletion([
      { role: "system", content: "你是一个有用的助手" },
      ...ma_messages
    ]);
    return ma_response.json({
      code: 0,
      msg: "AI 回复成功。",
      data: { ma_reply }
    });
  } catch (ma_error) {
    return ma_response.status(ma_error.status || 502).json({
      code: 1,
      msg: ma_error.message || "AI 服务请求失败，请稍后重试。",
      data: {}
    });
  }
}

module.exports = { ma_createChatCompletion };
