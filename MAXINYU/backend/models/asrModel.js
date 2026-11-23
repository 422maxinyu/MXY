/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-16 | 大模型：Trae */
const ma_https = require("node:https");
const ma_http = require("node:http");

const ma_endpoint = "api.siliconflow.cn";
const ma_path = "/v1/audio/transcriptions";
const ma_model = "Qwen/Qwen3-ASR-1.7B";
const ma_maxAudioSize = 25 * 1024 * 1024; // 25 MB
const ma_maxDurationMs = 60 * 1000; // 60 秒

async function ma_transcribe(ma_audioBuffer, ma_fileName) {
  if (!Buffer.isBuffer(ma_audioBuffer) || !ma_audioBuffer.length) {
    throw ma_createError(400, "音频数据为空，请重新录音后发送。");
  }
  if (ma_audioBuffer.length > ma_maxAudioSize) {
    throw ma_createError(400, "音频文件超过 25 MB，请控制录音时长。");
  }

  const ma_apiKey = process.env.SILICONFLOW_API_KEY;
  if (!ma_apiKey) {
    throw ma_createError(503, "AI 服务尚未配置，请在 backend/.env 中设置 SILICONFLOW_API_KEY。");
  }

  const ma_boundary = "----MaAsrBoundary" + Date.now() + Math.random().toString(36).slice(2, 8);
  const ma_nl = "\r\n";
  const ma_parts = [
    Buffer.from("--" + ma_boundary + ma_nl),
    Buffer.from('Content-Disposition: form-data; name="model"' + ma_nl + ma_nl + ma_model + ma_nl),
    Buffer.from("--" + ma_boundary + ma_nl),
    Buffer.from('Content-Disposition: form-data; name="file"; filename="' + (ma_fileName || "recording.webm") + '"' + ma_nl),
    Buffer.from("Content-Type: audio/webm" + ma_nl + ma_nl),
    ma_audioBuffer,
    Buffer.from(ma_nl + "--" + ma_boundary + "--" + ma_nl)
  ];
  const ma_body = Buffer.concat(ma_parts);

  return new Promise((ma_resolve, ma_reject) => {
    const ma_transport = ma_endpoint.startsWith("https://") ? ma_https : ma_https;
    const ma_req = ma_https.request(
      {
        hostname: ma_endpoint,
        path: ma_path,
        method: "POST",
        headers: {
          Authorization: "Bearer " + ma_apiKey,
          "Content-Type": "multipart/form-data; boundary=" + ma_boundary,
          "Content-Length": ma_body.length
        },
        timeout: 60000
      },
      (ma_res) => {
        let ma_data = "";
        ma_res.on("data", (ma_chunk) => (ma_data += ma_chunk));
        ma_res.on("end", () => {
          console.log("ASR API 返回原始数据:", ma_data);
          if (ma_res.statusCode !== 200) {
            console.error("ASR API 错误，HTTP", ma_res.statusCode, ma_data);
            return ma_reject(ma_createError(502, "语音识别服务暂时不可用，请稍后重试。"));
          }
          let ma_json;
          try {
            ma_json = JSON.parse(ma_data);
          } catch (ma_error) {
            console.error("ASR API 返回无效 JSON:", ma_error.message);
            return ma_reject(ma_createError(502, "语音识别服务返回无效数据，请稍后重试。"));
          }
          if (typeof ma_json.text !== "string") {
            return ma_reject(ma_createError(502, "语音识别结果格式异常，请稍后重试。"));
          }
          ma_resolve(ma_json.text.trim());
        });
      }
    );
    ma_req.on("error", (ma_error) => {
      console.error("ASR API 连接失败:", ma_error.message);
      ma_reject(ma_createError(502, "暂时无法连接语音识别服务，请检查网络后重试。"));
    });
    ma_req.on("timeout", () => {
      console.error("ASR API 请求超时");
      ma_req.destroy();
      ma_reject(ma_createError(504, "语音识别服务响应超时，请稍后重试。"));
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

module.exports = { ma_transcribe, ma_model, ma_maxDurationMs };
