/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） */
const ma_path = require("node:path");
const ma_express = require("express");
const ma_cors = require("cors");
const ma_apiRoutes = require("./routes/apiRoutes");

const ma_app = ma_express();
const ma_frontendPath = ma_path.join(__dirname, "..", "frontend");

ma_app.use(ma_cors());
ma_app.use(ma_express.json({ limit: "10mb" }));
ma_app.use("/api", ma_apiRoutes);
ma_app.use("/api", ma_handleUnknownApi);
ma_app.use(ma_express.static(ma_frontendPath));
ma_app.use(ma_handleNotFound);
ma_app.use(ma_handleError);

function ma_handleUnknownApi(ma_request, ma_response) {
  ma_response.status(404).json({
    code: 1,
    msg: "接口不存在",
    data: {}
  });
}

function ma_handleNotFound(ma_request, ma_response) {
  ma_response.status(404).type("text").send("页面不存在");
}

function ma_handleError(ma_error, ma_request, ma_response, ma_next) {
  console.error("请求处理失败：", ma_error);
  if (ma_response.headersSent) {
    return ma_next(ma_error);
  }
  ma_response.status(500).json({
    code: 1,
    msg: "服务器内部错误",
    data: {}
  });
}

module.exports = ma_app;
