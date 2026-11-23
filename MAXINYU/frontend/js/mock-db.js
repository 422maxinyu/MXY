/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
/*
 * KT25 考点：AJAX（fetch）+ JSON + localStorage
 *
 * 本文件在浏览器端模拟后台接口，数据全部存放在 localStorage：
 *   GET    /api/products            商品列表（支持 ma_keyword / ma_page / ma_size）
 *   GET    /api/products/:ma_id     商品详情
 *   POST   /api/products            新增商品
 *   PUT    /api/products/:ma_id     修改商品
 *   DELETE /api/products/:ma_id     删除商品
 *   GET    /api/stats/dashboard     仪表盘统计数据
 *
 * 订单 orders 与用户 users 的接口结构完全一致，只是实体名不同。
 * 双击 HTML 直接打开（file://）也能运行，无需启动后端。
 */
(() => {
  "use strict";

  const ma_dbPrefix = "ma_db_";
  const ma_latency = 260;

  /* ---------------- localStorage 工具 ---------------- */
  function ma_readTable(ma_name) {
    try {
      const ma_raw = window.localStorage.getItem(ma_dbPrefix + ma_name);
      return ma_raw ? JSON.parse(ma_raw) : [];
    } catch (ma_error) {
      console.error("读取本地数据失败：", ma_name, ma_error);
      return [];
    }
  }

  function ma_writeTable(ma_name, ma_rows) {
    window.localStorage.setItem(ma_dbPrefix + ma_name, JSON.stringify(ma_rows));
  }

  /* ---------------- 模拟数据（每张表 10 条以上） ---------------- */
  const ma_seed = {
    products: [
      { ma_id: 1, ma_name: "小米 15 Pro", ma_category: "手机", ma_price: 4999, ma_stock: 128, ma_status: "在售", ma_created_at: "2026-06-12" },
      { ma_id: 2, ma_name: "Redmi K80", ma_category: "手机", ma_price: 2499, ma_stock: 86, ma_status: "在售", ma_created_at: "2026-06-18" },
      { ma_id: 3, ma_name: "小米 Buds 5", ma_category: "耳机", ma_price: 699, ma_stock: 260, ma_status: "在售", ma_created_at: "2026-07-02" },
      { ma_id: 4, ma_name: "Redmi Buds 6", ma_category: "耳机", ma_price: 299, ma_stock: 410, ma_status: "在售", ma_created_at: "2026-07-09" },
      { ma_id: 5, ma_name: "小米手环 9", ma_category: "穿戴", ma_price: 249, ma_stock: 530, ma_status: "在售", ma_created_at: "2026-07-21" },
      { ma_id: 6, ma_name: "小米 Watch S4", ma_category: "穿戴", ma_price: 999, ma_stock: 74, ma_status: "在售", ma_created_at: "2026-08-03" },
      { ma_id: 7, ma_name: "Redmi Book 16", ma_category: "笔记本", ma_price: 4599, ma_stock: 32, ma_status: "在售", ma_created_at: "2026-08-15" },
      { ma_id: 8, ma_name: "小米平板 7", ma_category: "笔记本", ma_price: 2399, ma_stock: 58, ma_status: "下架", ma_created_at: "2026-08-27" },
      { ma_id: 9, ma_name: "米家空气净化器 5", ma_category: "家电", ma_price: 1299, ma_stock: 41, ma_status: "在售", ma_created_at: "2026-09-05" },
      { ma_id: 10, ma_name: "米家扫地机器人", ma_category: "家电", ma_price: 2199, ma_stock: 26, ma_status: "在售", ma_created_at: "2026-09-19" },
      { ma_id: 11, ma_name: "小米电视 S Pro", ma_category: "家电", ma_price: 5999, ma_stock: 18, ma_status: "在售", ma_created_at: "2026-10-08" },
      { ma_id: 12, ma_name: "小米移动电源 3", ma_category: "配件", ma_price: 129, ma_stock: 700, ma_status: "在售", ma_created_at: "2026-10-22" }
    ],
    orders: [
      { ma_id: 1, ma_order_no: "MI202606001", ma_customer: "马欣宇", ma_product: "小米 15 Pro", ma_amount: 4999, ma_status: "已完成", ma_created_at: "2026-06-15" },
      { ma_id: 2, ma_order_no: "MI202606002", ma_customer: "王小宇", ma_product: "Redmi K80", ma_amount: 2499, ma_status: "已完成", ma_created_at: "2026-06-28" },
      { ma_id: 3, ma_order_no: "MI202607003", ma_customer: "李雷", ma_product: "小米 Buds 5", ma_amount: 699, ma_status: "已完成", ma_created_at: "2026-07-06" },
      { ma_id: 4, ma_order_no: "MI202607004", ma_customer: "韩梅梅", ma_product: "小米手环 9", ma_amount: 249, ma_status: "已取消", ma_created_at: "2026-07-18" },
      { ma_id: 5, ma_order_no: "MI202608005", ma_customer: "张伟", ma_product: "Redmi Book 16", ma_amount: 4599, ma_status: "已完成", ma_created_at: "2026-08-09" },
      { ma_id: 6, ma_order_no: "MI202608006", ma_customer: "刘洋", ma_product: "小米 Watch S4", ma_amount: 999, ma_status: "已发货", ma_created_at: "2026-08-21" },
      { ma_id: 7, ma_order_no: "MI202609007", ma_customer: "陈曦", ma_product: "米家空气净化器 5", ma_amount: 1299, ma_status: "已完成", ma_created_at: "2026-09-11" },
      { ma_id: 8, ma_order_no: "MI202609008", ma_customer: "赵敏", ma_product: "米家扫地机器人", ma_amount: 2199, ma_status: "待发货", ma_created_at: "2026-09-26" },
      { ma_id: 9, ma_order_no: "MI202610009", ma_customer: "周杰", ma_product: "小米电视 S Pro", ma_amount: 5999, ma_status: "已完成", ma_created_at: "2026-10-12" },
      { ma_id: 10, ma_order_no: "MI202610010", ma_customer: "吴亦", ma_product: "小米移动电源 3", ma_amount: 129, ma_status: "待付款", ma_created_at: "2026-10-30" },
      { ma_id: 11, ma_order_no: "MI202611011", ma_customer: "孙悦", ma_product: "Redmi Buds 6", ma_amount: 299, ma_status: "已发货", ma_created_at: "2026-11-04" },
      { ma_id: 12, ma_order_no: "MI202611012", ma_customer: "郑爽", ma_product: "小米 15 Pro", ma_amount: 4999, ma_status: "待发货", ma_created_at: "2026-11-13" }
    ],
    users: [
      { ma_id: 1, ma_username: "maxinyu", ma_phone: "13800138000", ma_level: "金卡会员", ma_points: 12860, ma_created_at: "2026-06-01" },
      { ma_id: 2, ma_username: "xiaomi_li", ma_phone: "13900139000", ma_level: "银卡会员", ma_points: 6420, ma_created_at: "2026-06-08" },
      { ma_id: 3, ma_username: "mi_fan_01", ma_phone: "13700137000", ma_level: "普通会员", ma_points: 860, ma_created_at: "2026-06-22" },
      { ma_id: 4, ma_username: "leizong", ma_phone: "13600136000", ma_level: "金卡会员", ma_points: 15320, ma_created_at: "2026-07-03" },
      { ma_id: 5, ma_username: "shop_admin", ma_phone: "13500135000", ma_level: "银卡会员", ma_points: 4310, ma_created_at: "2026-07-16" },
      { ma_id: 6, ma_username: "wang_yu", ma_phone: "13400134000", ma_level: "普通会员", ma_points: 1220, ma_created_at: "2026-07-29" },
      { ma_id: 7, ma_username: "chen_xi", ma_phone: "13300133000", ma_level: "银卡会员", ma_points: 5680, ma_created_at: "2026-08-10" },
      { ma_id: 8, ma_username: "test_user", ma_phone: "13200132000", ma_level: "普通会员", ma_points: 320, ma_created_at: "2026-08-24" },
      { ma_id: 9, ma_username: "zhao_min", ma_phone: "13100131000", ma_level: "金卡会员", ma_points: 9860, ma_created_at: "2026-09-07" },
      { ma_id: 10, ma_username: "zhou_jie", ma_phone: "13000130000", ma_level: "普通会员", ma_points: 1740, ma_created_at: "2026-09-21" }
    ]
  };

  function ma_seedTables() {
    Object.keys(ma_seed).forEach((ma_name) => {
      if (ma_readTable(ma_name).length === 0) {
        ma_writeTable(ma_name, ma_seed[ma_name]);
        console.log(`已初始化模拟数据表 ${ma_name}：`, ma_seed[ma_name].length, "条");
      }
    });
  }

  /* ---------------- 通用工具 ---------------- */
  function ma_respond(ma_body) {
    return new Response(JSON.stringify(ma_body), {
      status: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" }
    });
  }

  function ma_ok(ma_data, ma_msg) {
    return { code: 0, msg: ma_msg || "操作成功。", data: ma_data || {} };
  }

  function ma_fail(ma_msg, ma_code) {
    return { code: ma_code || 1, msg: ma_msg, data: {} };
  }

  function ma_number(ma_value) {
    const ma_result = Number(ma_value);
    return Number.isFinite(ma_result) ? ma_result : NaN;
  }

  function ma_pickFields(ma_body, ma_fields) {
    const ma_row = {};
    ma_fields.forEach((ma_field) => {
      ma_row[ma_field] = typeof ma_body[ma_field] === "string" ? ma_body[ma_field].trim() : ma_body[ma_field];
    });
    return ma_row;
  }

  /* ---------------- 各实体的字段与校验规则 ---------------- */
  const ma_schemas = {
    products: {
      ma_title: "商品",
      ma_fields: ["ma_name", "ma_category", "ma_price", "ma_stock", "ma_status"],
      ma_validate(ma_row) {
        if (!ma_row.ma_name) return "商品名称不能为空。";
        if (!ma_row.ma_category) return "请选择商品分类。";
        if (!Number.isFinite(ma_number(ma_row.ma_price)) || Number(ma_row.ma_price) < 0) return "商品价格必须是不小于 0 的数字。";
        if (!Number.isFinite(ma_number(ma_row.ma_stock)) || Number(ma_row.ma_stock) < 0) return "库存必须是不小于 0 的整数。";
        if (!ma_row.ma_status) return "请选择商品状态。";
        return "";
      },
      ma_normalize(ma_row) {
        return {
          ...ma_row,
          ma_price: ma_number(ma_row.ma_price),
          ma_stock: Math.round(ma_number(ma_row.ma_stock))
        };
      }
    },
    orders: {
      ma_title: "订单",
      ma_fields: ["ma_order_no", "ma_customer", "ma_product", "ma_amount", "ma_status"],
      ma_validate(ma_row) {
        if (!/^MI\d{9,}$/.test(ma_row.ma_order_no || "")) return "订单号需以 MI 开头并包含至少 9 位数字。";
        if (!ma_row.ma_customer) return "客户姓名不能为空。";
        if (!ma_row.ma_product) return "商品名称不能为空。";
        if (!Number.isFinite(ma_number(ma_row.ma_amount)) || Number(ma_row.ma_amount) < 0) return "订单金额必须是不小于 0 的数字。";
        if (!ma_row.ma_status) return "请选择订单状态。";
        return "";
      },
      ma_normalize(ma_row) {
        return { ...ma_row, ma_amount: ma_number(ma_row.ma_amount) };
      }
    },
    users: {
      ma_title: "用户",
      ma_fields: ["ma_username", "ma_phone", "ma_level", "ma_points"],
      ma_validate(ma_row) {
        if (!/^[A-Za-z0-9_]{3,16}$/.test(ma_row.ma_username || "")) return "用户名需为 3-16 位字母、数字或下划线。";
        if (!/^1[3-9]\d{9}$/.test(ma_row.ma_phone || "")) return "手机号需为 11 位数字。";
        if (!ma_row.ma_level) return "请选择会员等级。";
        if (!Number.isFinite(ma_number(ma_row.ma_points)) || Number(ma_row.ma_points) < 0) return "积分必须是不小于 0 的数字。";
        return "";
      },
      ma_normalize(ma_row) {
        return { ...ma_row, ma_points: Math.round(ma_number(ma_row.ma_points)) };
      }
    }
  };

  /* ---------------- 列表：搜索 + 分页 ---------------- */
  function ma_list(ma_name, ma_params) {
    const ma_rows = ma_readTable(ma_name);
    const ma_keyword = String(ma_params.get("ma_keyword") || "").trim().toLowerCase();
    const ma_page = Math.max(1, Number(ma_params.get("ma_page")) || 1);
    const ma_size = Math.max(1, Number(ma_params.get("ma_size")) || 6);

    const ma_filtered = ma_keyword
      ? ma_rows.filter((ma_row) => JSON.stringify(ma_row).toLowerCase().includes(ma_keyword))
      : ma_rows;

    ma_filtered.sort((ma_a, ma_b) => ma_b.ma_id - ma_a.ma_id);

    const ma_total = ma_filtered.length;
    const ma_pages = Math.max(1, Math.ceil(ma_total / ma_size));
    const ma_current = Math.min(ma_page, ma_pages);
    const ma_start = (ma_current - 1) * ma_size;

    return ma_ok({
      ma_list: ma_filtered.slice(ma_start, ma_start + ma_size),
      ma_total: ma_total,
      ma_page: ma_current,
      ma_pages: ma_pages,
      ma_size: ma_size
    });
  }

  function ma_detail(ma_name, ma_id) {
    const ma_row = ma_readTable(ma_name).find((ma_item) => ma_item.ma_id === Number(ma_id));
    return ma_row ? ma_ok({ ma_row: ma_row }) : ma_fail("未找到对应记录。", 404);
  }

  function ma_create(ma_name, ma_body) {
    const ma_schema = ma_schemas[ma_name];
    const ma_row = ma_pickFields(ma_body || {}, ma_schema.ma_fields);
    const ma_error = ma_schema.ma_validate(ma_row);
    if (ma_error) {
      return ma_fail(ma_error, 1004);
    }
    const ma_rows = ma_readTable(ma_name);
    const ma_newId = ma_rows.length ? Math.max(...ma_rows.map((ma_item) => ma_item.ma_id)) + 1 : 1;
    const ma_record = {
      ma_id: ma_newId,
      ...ma_schema.ma_normalize(ma_row),
      ma_created_at: new Date().toISOString().slice(0, 10)
    };
    ma_rows.push(ma_record);
    ma_writeTable(ma_name, ma_rows);
    return ma_ok({ ma_row: ma_record }, `${ma_schema.ma_title}新增成功。`);
  }

  function ma_update(ma_name, ma_id, ma_body) {
    const ma_schema = ma_schemas[ma_name];
    const ma_rows = ma_readTable(ma_name);
    const ma_index = ma_rows.findIndex((ma_item) => ma_item.ma_id === Number(ma_id));
    if (ma_index < 0) {
      return ma_fail("未找到要修改的记录。", 404);
    }
    const ma_row = ma_pickFields(ma_body || {}, ma_schema.ma_fields);
    const ma_error = ma_schema.ma_validate(ma_row);
    if (ma_error) {
      return ma_fail(ma_error, 1004);
    }
    ma_rows[ma_index] = {
      ...ma_rows[ma_index],
      ...ma_schema.ma_normalize(ma_row)
    };
    ma_writeTable(ma_name, ma_rows);
    return ma_ok({ ma_row: ma_rows[ma_index] }, `${ma_schema.ma_title}修改成功。`);
  }

  function ma_remove(ma_name, ma_id) {
    const ma_rows = ma_readTable(ma_name);
    const ma_left = ma_rows.filter((ma_item) => ma_item.ma_id !== Number(ma_id));
    if (ma_left.length === ma_rows.length) {
      return ma_fail("未找到要删除的记录。", 404);
    }
    ma_writeTable(ma_name, ma_left);
    return ma_ok({}, `${ma_schemas[ma_name].ma_title}删除成功。`);
  }

  /* ---------------- 仪表盘统计 ---------------- */
  function ma_dashboardStats() {
    const ma_products = ma_readTable("products");
    const ma_orders = ma_readTable("orders");
    const ma_users = ma_readTable("users");

    const ma_validOrders = ma_orders.filter((ma_order) => ma_order.ma_status !== "已取消");
    const ma_revenue = ma_validOrders.reduce((ma_sum, ma_order) => ma_sum + Number(ma_order.ma_amount || 0), 0);

    /* 按月汇总销售额（6 月 - 11 月） */
    const ma_months = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
    const ma_monthly = ma_months.map((ma_month) => {
      const ma_inMonth = ma_validOrders.filter((ma_order) => String(ma_order.ma_created_at).startsWith(ma_month));
      return {
        ma_month: `${Number(ma_month.slice(5))} 月`,
        ma_sales: ma_inMonth.reduce((ma_sum, ma_order) => ma_sum + Number(ma_order.ma_amount || 0), 0),
        ma_orders: ma_inMonth.length
      };
    });

    /* 按分类统计商品数量 */
    const ma_categoryMap = {};
    ma_products.forEach((ma_product) => {
      ma_categoryMap[ma_product.ma_category] = (ma_categoryMap[ma_product.ma_category] || 0) + 1;
    });
    const ma_category = Object.keys(ma_categoryMap).map((ma_key) => ({
      ma_name: ma_key,
      ma_value: ma_categoryMap[ma_key]
    }));

    /* 按状态统计订单数量 */
    const ma_statusMap = {};
    ma_orders.forEach((ma_order) => {
      ma_statusMap[ma_order.ma_status] = (ma_statusMap[ma_order.ma_status] || 0) + 1;
    });
    const ma_status = Object.keys(ma_statusMap).map((ma_key) => ({
      ma_name: ma_key,
      ma_value: ma_statusMap[ma_key]
    }));

    /* 商品销售额 Top5 */
    const ma_salesMap = {};
    ma_validOrders.forEach((ma_order) => {
      ma_salesMap[ma_order.ma_product] = (ma_salesMap[ma_order.ma_product] || 0) + Number(ma_order.ma_amount || 0);
    });
    const ma_top = Object.keys(ma_salesMap)
      .map((ma_key) => ({ ma_name: ma_key, ma_value: ma_salesMap[ma_key] }))
      .sort((ma_a, ma_b) => ma_b.ma_value - ma_a.ma_value)
      .slice(0, 5);

    return ma_ok({
      ma_kpi: {
        ma_product_total: ma_products.length,
        ma_order_total: ma_orders.length,
        ma_user_total: ma_users.length,
        ma_revenue: ma_revenue
      },
      ma_monthly: ma_monthly,
      ma_category: ma_category,
      ma_status: ma_status,
      ma_top: ma_top,
      ma_updated_at: new Date().toLocaleString("zh-CN")
    });
  }

  /* ---------------- 路由分发 ---------------- */
  async function ma_handle(ma_method, ma_path, ma_params, ma_body) {
    await new Promise((ma_resolve) => window.setTimeout(ma_resolve, ma_latency));

    if (ma_path === "/api/stats/dashboard" && ma_method === "GET") {
      return ma_dashboardStats();
    }

    if (ma_path === "/api/auth/profile" || ma_path.startsWith("/api/auth/")) {
      return null;
    }

    const ma_match = ma_path.match(/^\/api\/(products|orders|users)(?:\/(\d+))?$/);
    if (!ma_match) {
      return null;
    }
    const ma_name = ma_match[1];
    const ma_id = ma_match[2];

    if (!ma_schemas[ma_name]) {
      return ma_fail("未知实体。", 404);
    }

    if (ma_method === "GET" && !ma_id) {
      return ma_list(ma_name, ma_params);
    }
    if (ma_method === "GET" && ma_id) {
      return ma_detail(ma_name, ma_id);
    }
    if (ma_method === "POST" && !ma_id) {
      return ma_create(ma_name, ma_body);
    }
    if (ma_method === "PUT" && ma_id) {
      return ma_update(ma_name, ma_id, ma_body);
    }
    if (ma_method === "DELETE" && ma_id) {
      return ma_remove(ma_name, ma_id);
    }
    return ma_fail("不支持的请求方式。", 405);
  }

  /* ---------------- 拦截 fetch ---------------- */
  const ma_realFetch = window.fetch.bind(window);

  window.fetch = async function ma_mockFetch(ma_input, ma_init = {}) {
    const ma_method = String(ma_init.method || "GET").toUpperCase();
    let ma_url;
    try {
      ma_url = new URL(typeof ma_input === "string" ? ma_input : ma_input.url, window.location.href);
    } catch (ma_error) {
      console.error("无法解析请求地址：", ma_error);
      return ma_realFetch(ma_input, ma_init);
    }

    if (window.location.protocol === "file:" && !ma_url.pathname.startsWith("/api/")) {
      return ma_realFetch(ma_input, ma_init);
    }

    let ma_body = null;
    if (typeof ma_init.body === "string" && ma_init.body) {
      try {
        ma_body = JSON.parse(ma_init.body);
      } catch (ma_error) {
        console.error("请求体不是合法 JSON：", ma_init.body, ma_error);
      }
    }

    const ma_result = await ma_handle(ma_method, ma_url.pathname, ma_url.searchParams, ma_body);

    if (ma_result === null) {
      /* 不是本文件负责的接口（如 /api/chat），交给真实 fetch */
      return ma_realFetch(ma_input, ma_init);
    }

    console.log("【模拟接口 · 发送】", ma_method, ma_url.pathname + ma_url.search, ma_body || "");

    if (ma_result.code === 0) {
      console.log("【模拟接口 · 返回】", ma_result);
    } else {
      console.error("【模拟接口 · 返回错误】", ma_result);
    }
    return ma_respond(ma_result);
  };

  ma_seedTables();
})();
