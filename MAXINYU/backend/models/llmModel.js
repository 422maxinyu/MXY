/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-16 | 大模型：Copilot（具体模型名称未提供） */
const ma_endpoint = "https://api.siliconflow.cn/v1/chat/completions";
const ma_model = "deepseek-ai/DeepSeek-V4-Flash";

async function ma_requestCompletion(ma_messages) {
  const ma_apiKey = process.env.SILICONFLOW_API_KEY;
  if (!ma_apiKey) {
    throw ma_createError(503, "AI 服务尚未配置，请在 backend/.env 中设置 SILICONFLOW_API_KEY。");
  }

  const ma_abortController = new AbortController();
  const ma_timeout = setTimeout(() => ma_abortController.abort(), 60000);

  try {
    console.log("发送给 AI 服务的消息：", ma_messages);
    const ma_response = await fetch(ma_endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ma_apiKey}`
      },
      body: JSON.stringify({ model: ma_model, messages: ma_messages }),
      signal: ma_abortController.signal
    });
    const ma_responseText = await ma_response.text();
    if (!ma_response.ok) {
      console.error("AI 服务请求失败，HTTP 状态：", ma_response.status);
      throw ma_createError(502, "AI 服务暂时无法处理请求，请稍后重试。");
    }

    let ma_responseData;
    try {
      ma_responseData = JSON.parse(ma_responseText);
    } catch (ma_error) {
      console.error("AI 服务返回了无效 JSON：", ma_error.message);
      throw ma_createError(502, "AI 服务返回了无效数据，请稍后重试。");
    }

    const ma_reply = ma_responseData
      && Array.isArray(ma_responseData.choices)
      && ma_responseData.choices[0]
      && ma_responseData.choices[0].message
      && ma_responseData.choices[0].message.content;
    if (typeof ma_reply !== "string" || !ma_reply.trim()) {
      console.error("AI 服务响应中没有有效的回复内容。");
      throw ma_createError(502, "AI 服务暂时没有返回有效内容，请稍后重试。");
    }
    console.log("AI 服务返回的回复：", ma_reply);
    return ma_reply;
  } catch (ma_error) {
    if (ma_error.status) {
      throw ma_error;
    }
    if (ma_error.name === "AbortError") {
      console.error("AI 服务请求超时。");
      throw ma_createError(504, "AI 服务响应超时，请稍后重试。");
    }
    console.error("连接 AI 服务失败：", ma_error.message);
    throw ma_createError(502, "暂时无法连接 AI 服务，请检查网络后重试。");
  } finally {
    clearTimeout(ma_timeout);
  }
}

function ma_createError(ma_status, ma_message) {
  const ma_error = new Error(ma_message);
  ma_error.status = ma_status;
  return ma_error;
}

module.exports = { ma_requestCompletion };
