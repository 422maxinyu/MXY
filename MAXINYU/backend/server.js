/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） */
require("dotenv").config();

const ma_app = require("./app");
const ma_port = 8422;
const ma_server = ma_app.listen(ma_port, ma_onListen);

function ma_onListen() {
  console.log(`服务已启动：http://localhost:${ma_port}`);
}

function ma_onError(ma_error) {
  console.error("服务启动失败：", ma_error);
  process.exitCode = 1;
}

ma_server.on("error", ma_onError);

