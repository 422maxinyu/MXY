/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-16 | 大模型：Trae */
const ma_https = require("node:https");

const ma_endpoint = "api.siliconflow.cn";
const ma_path = "/v1/chat/completions";
const ma_model = "Qwen/Qwen3-VL-8B-Instruct";
const ma_maxImageBytes = 8 * 1024 * 1024; // 8 MB（原图未压缩 base64 前的原始大小）

function ma_guessMime(ma_fileName, ma_mimeType) {
  if (ma_mimeType && ma_mimeType.startsWith("image/")) return ma_mimeType;
  if (!ma_fileName) return "image/png";
  const ma_ext = String(ma_fileName).split(".").pop().toLowerCase();
  const ma_map = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    bmp: "image/bmp"
  };
  return ma_map[ma_ext] || "image/png";
}

async function ma_analyzeImage(ma_base64Data, ma_fileName, ma_userQuestion) {
  if (typeof ma_base64Data !== "string" || !ma_base64Data.trim()) {
    throw ma_createError(400, "图片数据为空，请选择图片后重试。");
  }
  const ma_apiKey = process.env.SILICONFLOW_API_KEY;
  if (!ma_apiKey) {
    throw ma_createError(503, "AI 服务尚未配置，请在 backend/.env 中设置 SILICONFLOW_API_KEY。");
  }

  const ma_mime = ma_guessMime(ma_fileName, null);
  const ma_dataUrl = `data:${ma_mime};base64,${ma_base64Data}`;
  const ma_userText = (ma_userQuestion && ma_userQuestion.trim()) || "请用中文详细描述这张图片里的内容，包括主要物体、颜色、文字、场景和整体氛围。";

  const ma_body = JSON.stringify({
    model: ma_model,
    messages: [
      {
        role: "system",
        content: "你是一个简洁的图片识别助手。请用中文用 1-3 段、不超过 300 字准确描述图片中的主要内容（物体、文字、颜色、场景）。"
      },
      {
        role: "user",
        content: [
          { type: "text", text: ma_userText },
          { type: "image_url", image_url: { url: ma_dataUrl } }
        ]
      }
    ],
    max_tokens: 400
  });

  console.log("发送图片识别请求:", { ma_fileName, ma_mime, ma_base64_len: ma_base64Data.length, ma_question: ma_userText.slice(0, 80) });

  return new Promise((ma_resolve, ma_reject) => {
    const ma_req = ma_https.request(
      {
        hostname: ma_endpoint,
        path: ma_path,
        method: "POST",
        headers: {
          Authorization: "Bearer " + ma_apiKey,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(ma_body)
        },
        timeout: 120000
      },
      (ma_res) => {
        let ma_data = "";
        ma_res.on("data", (ma_chunk) => (ma_data += ma_chunk));
        ma_res.on("end", () => {
          console.log("图片识别 API 返回原始数据:", ma_data.slice(0, 500));
          if (ma_res.statusCode !== 200) {
            console.error("图片识别 API 错误 HTTP", ma_res.statusCode);
            return ma_reject(ma_createError(502, "图片识别服务暂时不可用，请稍后重试。"));
          }
          let ma_json;
          try { ma_json = JSON.parse(ma_data); }
          catch (ma_error) {
            console.error("图片识别 API 返回无效 JSON:", ma_error.message);
            return ma_reject(ma_createError(502, "图片识别服务返回无效数据，请稍后重试。"));
          }
          const ma_reply = ma_json && ma_json.choices && ma_json.choices[0] && ma_json.choices[0].message && ma_json.choices[0].message.content;
          if (typeof ma_reply !== "string" || !ma_reply.trim()) {
            return ma_reject(ma_createError(502, "图片识别结果为空，请稍后重试。"));
          }
          console.log("图片识别结果:", ma_reply.slice(0, 200));
          ma_resolve(ma_reply.trim());
        });
      }
    );
    ma_req.on("error", (ma_error) => {
      console.error("图片识别 API 连接失败:", ma_error.message);
      ma_reject(ma_createError(502, "暂时无法连接图片识别服务，请检查网络后重试。"));
    });
    ma_req.on("timeout", () => {
      console.error("图片识别 API 请求超时");
      ma_req.destroy();
      ma_reject(ma_createError(504, "图片识别服务响应超时，请稍后重试。"));
    });
    ma_req.write(ma_body);
    ma_req.end();
  });
}

function ma_createError(ma_status, ma_message) {
  const ma_error = new Error(ma_message);
  ma_error.status = ma_status;
  return ma_error;
}

module.exports = { ma_analyzeImage, ma_model };
