/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
/*
 * KT25 考点：AJAX 请求 + JSON 数据交换 + localStorage 持久化
 *
 * 本文件在浏览器端模拟后端接口（无需启动 Node 服务）：
 *   POST /api/auth/register   注册账号
 *   POST /api/auth/login      登录并签发 token
 *   GET  /api/auth/profile    携带 token 读取当前用户
 *   POST /api/auth/logout     退出登录
 *
 * 用户表存放在 localStorage 的 ma_mock_users 中，
 * token 表存放在 localStorage 的 ma_mock_tokens 中。
 * 页面中直接使用 fetch 发送 JSON，请求与返回都会打印到控制台。
 */
(() => {
  "use strict";

  const ma_usersKey = "ma_mock_users";
  const ma_tokensKey = "ma_mock_tokens";
  const ma_latency = 420;
  const ma_tokenLife = 24 * 60 * 60 * 1000;

  /* ---------- localStorage 读写 ---------- */
  function ma_read(ma_key, ma_fallback) {
    try {
      const ma_raw = window.localStorage.getItem(ma_key);
      return ma_raw ? JSON.parse(ma_raw) : ma_fallback;
    } catch (ma_error) {
      console.error("读取本地数据失败：", ma_key, ma_error);
      return ma_fallback;
    }
  }

  function ma_write(ma_key, ma_value) {
    window.localStorage.setItem(ma_key, JSON.stringify(ma_value));
  }

  /* 简易散列，避免在 localStorage 中直接看到明文密码（仅演示用） */
  function ma_hashPassword(ma_password) {
    let ma_hash = 5381;
    for (let ma_index = 0; ma_index < ma_password.length; ma_index += 1) {
      ma_hash = ((ma_hash * 33) ^ ma_password.charCodeAt(ma_index)) >>> 0;
    }
    return `ma_pwd_${ma_hash.toString(16)}`;
  }

  /* ---------- 内置 8 条测试账号 ---------- */
  const ma_seedAccounts = [
    { ma_username: "maxinyu", ma_password: "Maxinyu2026", ma_email: "maxinyu@xiaomi.com", ma_phone: "13800138000" },
    { ma_username: "xiaomi_li", ma_password: "Xiaomi1234", ma_email: "li@xiaomi.com", ma_phone: "13900139000" },
    { ma_username: "mi_fan_01", ma_password: "Mifan2026", ma_email: "mifan01@qq.com", ma_phone: "13700137000" },
    { ma_username: "leizong", ma_password: "Lei123456", ma_email: "lei@miui.cn", ma_phone: "13600136000" },
    { ma_username: "shop_admin", ma_password: "Shop2026", ma_email: "admin@shop.cn", ma_phone: "13500135000" },
    { ma_username: "wang_yu", ma_password: "Wangyu888", ma_email: "wangyu@163.com", ma_phone: "13400134000" },
    { ma_username: "chen_xi", ma_password: "Chenxi666", ma_email: "chenxi@126.com", ma_phone: "13300133000" },
    { ma_username: "test_user", ma_password: "Test1234", ma_email: "test@example.com", ma_phone: "13200132000" }
  ];

  function ma_seedUsers() {
    const ma_existing = ma_read(ma_usersKey, null);
    if (Array.isArray(ma_existing) && ma_existing.length > 0) {
      return;
    }
    const ma_users = ma_seedAccounts.map((ma_account, ma_index) => ({
      ma_user_id: ma_index + 1,
      ma_username: ma_account.ma_username,
      ma_email: ma_account.ma_email,
      ma_phone: ma_account.ma_phone,
      ma_password_hash: ma_hashPassword(ma_account.ma_password),
      ma_created_at: "2026-11-19 09:00"
    }));
    ma_write(ma_usersKey, ma_users);
    console.log("已初始化模拟用户表（8 条测试账号）：", ma_users);
  }

  /* ---------- 工具函数 ---------- */
  function ma_json(ma_body) {
    return new Response(JSON.stringify(ma_body), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  function ma_fail(ma_code, ma_msg) {
    return { code: ma_code, msg: ma_msg, data: {} };
  }

  function ma_publicUser(ma_user) {
    return {
      ma_user_id: ma_user.ma_user_id,
      ma_username: ma_user.ma_username,
      ma_email: ma_user.ma_email,
      ma_phone: ma_user.ma_phone,
      ma_created_at: ma_user.ma_created_at
    };
  }

  function ma_nowText() {
    const ma_date = new Date();
    const ma_pad = (ma_number) => String(ma_number).padStart(2, "0");
    return `${ma_date.getFullYear()}-${ma_pad(ma_date.getMonth() + 1)}-${ma_pad(ma_date.getDate())} ${ma_pad(ma_date.getHours())}:${ma_pad(ma_date.getMinutes())}`;
  }

  function ma_validateRegister(ma_payload) {
    if (!ma_payload || typeof ma_payload !== "object") {
      return "请求体必须是 JSON 对象。";
    }
    const ma_username = String(ma_payload.ma_username || "");
    const ma_password = String(ma_payload.ma_password || "");
    const ma_email = String(ma_payload.ma_email || "");
    const ma_phone = String(ma_payload.ma_phone || "");
    if (!/^[A-Za-z0-9_]{3,16}$/.test(ma_username)) {
      return "用户名需为 3-16 位字母、数字或下划线。";
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[\S]{6,20}$/.test(ma_password)) {
      return "密码需为 6-20 位，且同时包含字母和数字。";
    }
    if (!/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(ma_email)) {
      return "邮箱格式不正确。";
    }
    if (!/^1[3-9]\d{9}$/.test(ma_phone)) {
      return "手机号格式不正确。";
    }
    return "";
  }

  /* ---------- 具体接口实现 ---------- */
  function ma_register(ma_payload) {
    const ma_error = ma_validateRegister(ma_payload);
    if (ma_error) {
      return ma_fail(1004, ma_error);
    }
    const ma_users = ma_read(ma_usersKey, []);
    const ma_username = String(ma_payload.ma_username).trim();
    const ma_exists = ma_users.some(
      (ma_user) => ma_user.ma_username.toLowerCase() === ma_username.toLowerCase()
    );
    if (ma_exists) {
      return ma_fail(1001, "该用户名已被注册，请换一个。");
    }
    const ma_newUser = {
      ma_user_id: ma_users.length > 0
        ? Math.max(...ma_users.map((ma_user) => ma_user.ma_user_id)) + 1
        : 1,
      ma_username: ma_username,
      ma_email: String(ma_payload.ma_email).trim(),
      ma_phone: String(ma_payload.ma_phone).trim(),
      ma_password_hash: ma_hashPassword(String(ma_payload.ma_password)),
      ma_created_at: ma_nowText()
    };
    ma_users.push(ma_newUser);
    ma_write(ma_usersKey, ma_users);
    return {
      code: 0,
      msg: "注册成功，请使用新账号登录。",
      data: { ma_user: ma_publicUser(ma_newUser) }
    };
  }

  function ma_login(ma_payload) {
    if (!ma_payload || typeof ma_payload !== "object") {
      return ma_fail(1004, "请求体必须是 JSON 对象。");
    }
    const ma_username = String(ma_payload.ma_username || "").trim();
    const ma_password = String(ma_payload.ma_password || "");
    if (!ma_username || !ma_password) {
      return ma_fail(1004, "用户名和密码不能为空。");
    }
    const ma_users = ma_read(ma_usersKey, []);
    const ma_user = ma_users.find(
      (ma_item) => ma_item.ma_username.toLowerCase() === ma_username.toLowerCase()
    );
    if (!ma_user || ma_user.ma_password_hash !== ma_hashPassword(ma_password)) {
      return ma_fail(1002, "用户名或密码错误。");
    }
    const ma_token = `ma_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    const ma_tokens = ma_read(ma_tokensKey, {});
    ma_tokens[ma_token] = {
      ma_username: ma_user.ma_username,
      ma_issued_at: ma_nowText(),
      ma_expires_at: Date.now() + ma_tokenLife
    };
    ma_write(ma_tokensKey, ma_tokens);
    return {
      code: 0,
      msg: "登录成功。",
      data: {
        ma_token: ma_token,
        ma_token_type: "Bearer",
        ma_expires_in: ma_tokenLife,
        ma_user: ma_publicUser(ma_user)
      }
    };
  }

  function ma_profile(ma_token) {
    if (!ma_token) {
      return ma_fail(1003, "未登录或登录已过期，请重新登录。");
    }
    const ma_tokens = ma_read(ma_tokensKey, {});
    const ma_record = ma_tokens[ma_token];
    if (!ma_record) {
      return ma_fail(1003, "token 无效，请重新登录。");
    }
    if (Date.now() > ma_record.ma_expires_at) {
      delete ma_tokens[ma_token];
      ma_write(ma_tokensKey, ma_tokens);
      return ma_fail(1003, "token 已过期，请重新登录。");
    }
    const ma_users = ma_read(ma_usersKey, []);
    const ma_user = ma_users.find((ma_item) => ma_item.ma_username === ma_record.ma_username);
    if (!ma_user) {
      return ma_fail(1003, "账号不存在，请重新注册。");
    }
    return {
      code: 0,
      msg: "获取登录信息成功。",
      data: {
        ma_user: ma_publicUser(ma_user),
        ma_issued_at: ma_record.ma_issued_at,
        ma_expires_at: new Date(ma_record.ma_expires_at).toLocaleString("zh-CN")
      }
    };
  }

  function ma_logout(ma_token) {
    const ma_tokens = ma_read(ma_tokensKey, {});
    if (ma_token && ma_tokens[ma_token]) {
      delete ma_tokens[ma_token];
      ma_write(ma_tokensKey, ma_tokens);
    }
    return { code: 0, msg: "已退出登录。", data: {} };
  }

  /* 从请求头中取出 Bearer token */
  function ma_readToken(ma_input, ma_init) {
    const ma_headers = new Headers(
      (ma_init && ma_init.headers) || (typeof ma_input !== "string" && ma_input.headers) || {}
    );
    const ma_value = ma_headers.get("Authorization") || "";
    return ma_value.startsWith("Bearer ") ? ma_value.slice(7).trim() : "";
  }

  /* ---------- 拦截 fetch，命中 /api/auth/* 时走模拟实现 ---------- */
  const ma_realFetch = window.fetch.bind(window);

  window.fetch = async function ma_mockFetch(ma_input, ma_init = {}) {
    let ma_url;
    try {
      ma_url = new URL(typeof ma_input === "string" ? ma_input : ma_input.url, window.location.origin);
    } catch (ma_error) {
      console.error("无法解析请求地址：", ma_error);
      return ma_realFetch(ma_input, ma_init);
    }

    if (!ma_url.pathname.startsWith("/api/auth/")) {
      return ma_realFetch(ma_input, ma_init);
    }

    const ma_method = String(
      ma_init.method || (typeof ma_input !== "string" && ma_input.method) || "GET"
    ).toUpperCase();
    const ma_path = ma_url.pathname;

    let ma_payload = null;
    if (typeof ma_init.body === "string" && ma_init.body) {
      try {
        ma_payload = JSON.parse(ma_init.body);
      } catch (ma_error) {
        console.error("请求体不是合法 JSON：", ma_init.body, ma_error);
      }
    }

    console.log("【模拟接口 · 发送】", ma_method, ma_path, ma_payload || "（无请求体）");

    await new Promise((ma_resolve) => window.setTimeout(ma_resolve, ma_latency));

    let ma_result;
    if (ma_method === "POST" && ma_path === "/api/auth/register") {
      ma_result = ma_register(ma_payload);
    } else if (ma_method === "POST" && ma_path === "/api/auth/login") {
      ma_result = ma_login(ma_payload);
    } else if (ma_method === "GET" && ma_path === "/api/auth/profile") {
      ma_result = ma_profile(ma_readToken(ma_input, ma_init));
    } else if (ma_method === "POST" && ma_path === "/api/auth/logout") {
      ma_result = ma_logout(ma_readToken(ma_input, ma_init));
    } else {
      ma_result = ma_fail(1005, `模拟接口未实现：${ma_method} ${ma_path}`);
    }

    if (ma_result.code === 0) {
      console.log("【模拟接口 · 返回】", ma_result);
    } else {
      console.error("【模拟接口 · 返回错误】", ma_result);
    }
    return ma_json(ma_result);
  };

  ma_seedUsers();
})();
