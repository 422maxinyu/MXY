/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-16 | 大模型：Trae */
const ma_asrModel = require("../models/asrModel");

async function ma_transcribeAudio(ma_request, ma_response) {
  let ma_audioBuffer;
  let ma_fileName;
  try {
    // 支持 multipart 上传的 file 字段（优先）
    if (ma_request.file && Buffer.isBuffer(ma_request.file.buffer)) {
      ma_audioBuffer = ma_request.file.buffer;
      ma_fileName = ma_request.file.originalname || "recording.webm";
    } else {
      // 也支持前端发送的 base64 / raw body
      const ma_rawBody = ma_request.body;
      if (Buffer.isBuffer(ma_rawBody)) {
        ma_audioBuffer = ma_rawBody;
        ma_fileName = "recording.webm";
      } else if (ma_rawBody && typeof ma_rawBody.ma_content === "string") {
        ma_audioBuffer = Buffer.from(ma_rawBody.ma_content, "base64");
        ma_fileName = ma_rawBody.ma_file_name || "recording.webm";
      } else if (ma_rawBody && Buffer.isBuffer(ma_rawBody.buffer)) {
        ma_audioBuffer = ma_rawBody.buffer;
        ma_fileName = ma_rawBody.originalname || "recording.webm";
      }
    }

    if (!ma_audioBuffer || !ma_audioBuffer.length) {
      return ma_response.status(400).json({
        code: 1,
        msg: "未检测到音频数据，请录音后再发送。",
        data: {}
      });
    }
    console.log("收到语音识别请求：", { ma_fileName, ma_size: ma_audioBuffer.length });

    const ma_text = await ma_asrModel.ma_transcribe(ma_audioBuffer, ma_fileName);
    console.log("语音识别结果：", ma_text);

    return ma_response.json({
      code: 0,
      msg: "语音识别完成。",
      data: { ma_text }
    });
  } catch (ma_error) {
    console.error("语音识别失败：", ma_error.message);
    return ma_response.status(ma_error.status || 502).json({
      code: 1,
      msg: ma_error.message || "语音识别暂时不可用，请稍后重试。",
      data: {}
    });
  }
}

module.exports = { ma_transcribeAudio };
