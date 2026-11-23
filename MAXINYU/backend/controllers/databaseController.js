/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） */
const { ma_pool } = require("../models/database");

async function ma_connectDatabase(ma_request, ma_response) {
  const ma_credentials = ma_request.body || {};
  const ma_username = ma_credentials.ma_username;
  const ma_password = ma_credentials.ma_password;

  if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST || !process.env.DB_NAME) {
    return ma_response.status(503).json({
      code: 1,
      msg: "数据库尚未配置，请检查 backend/.env。",
      data: {}
    });
  }

  if (
    typeof ma_username !== "string" ||
    typeof ma_password !== "string" ||
    ma_username.length === 0 ||
    ma_password.length === 0 ||
    ma_username.length > 128 ||
    ma_password.length > 256
  ) {
    return ma_response.status(400).json({
      code: 1,
      msg: "请输入有效的数据库用户名和密码。",
      data: {}
    });
  }

  if (ma_username !== process.env.DB_USER || ma_password !== process.env.DB_PASSWORD) {
    return ma_response.status(401).json({
      code: 1,
      msg: "用户名或密码不正确。",
      data: {}
    });
  }

  try {
    await ma_pool.query("SELECT 1 AS ma_connected");
    return ma_response.json({
      code: 0,
      msg: "数据库连接成功。",
      data: {
        ma_connected: true
      }
    });
  } catch (ma_error) {
    console.error("数据库连接失败：", ma_error.message);
    return ma_response.status(503).json({
      code: 1,
      msg: "数据库连接失败，请检查 MySQL 服务和后端环境配置。",
      data: {}
    });
  }
}

module.exports = { ma_connectDatabase };
