/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
/* 实体详情页：根据地址栏 ma_type 与 ma_id 调用模拟接口 GET /api/{实体}/{id} */
(() => {
  "use strict";

  const ma_schemas = {
    products: {
      ma_title: "商品",
      ma_nameKey: "ma_name",
      ma_fields: [
        { ma_key: "ma_id", ma_label: "商品 ID" },
        { ma_key: "ma_name", ma_label: "商品名称" },
        { ma_key: "ma_category", ma_label: "商品分类" },
        { ma_key: "ma_price", ma_label: "商品价格", ma_format: (ma_value) => `¥ ${Number(ma_value).toLocaleString("zh-CN")}` },
        { ma_key: "ma_stock", ma_label: "库存数量" },
        { ma_key: "ma_status", ma_label: "销售状态" },
        { ma_key: "ma_created_at", ma_label: "上架日期" }
      ]
    },
    orders: {
      ma_title: "订单",
      ma_nameKey: "ma_order_no",
      ma_fields: [
        { ma_key: "ma_id", ma_label: "订单 ID" },
        { ma_key: "ma_order_no", ma_label: "订单号" },
        { ma_key: "ma_customer", ma_label: "客户姓名" },
        { ma_key: "ma_product", ma_label: "购买商品" },
        { ma_key: "ma_amount", ma_label: "订单金额", ma_format: (ma_value) => `¥ ${Number(ma_value).toLocaleString("zh-CN")}` },
        { ma_key: "ma_status", ma_label: "订单状态" },
        { ma_key: "ma_created_at", ma_label: "下单日期" }
      ]
    },
    users: {
      ma_title: "用户",
      ma_nameKey: "ma_username",
      ma_fields: [
        { ma_key: "ma_id", ma_label: "用户 ID" },
        { ma_key: "ma_username", ma_label: "用户名" },
        { ma_key: "ma_phone", ma_label: "手机号" },
        { ma_key: "ma_level", ma_label: "会员等级" },
        { ma_key: "ma_points", ma_label: "会员积分", ma_format: (ma_value) => Number(ma_value).toLocaleString("zh-CN") },
        { ma_key: "ma_created_at", ma_label: "注册日期" }
      ]
    }
  };

  const ma_params = new URLSearchParams(window.location.search);
  const ma_type = ma_params.get("ma_type");
  const ma_id = ma_params.get("ma_id");
  const ma_schema = ma_schemas[ma_type];

  const ma_elements = {
    ma_title: document.querySelector("#ma_detail-title"),
    ma_name: document.querySelector("#ma_detail-name"),
    ma_type: document.querySelector("#ma_detail-type"),
    ma_grid: document.querySelector("#ma_detail-grid"),
    ma_back: document.querySelector("#ma_detail-back"),
    ma_toast: document.querySelector("#ma_toast")
  };

  function ma_showToast(ma_text) {
    ma_elements.ma_toast.textContent = ma_text;
    ma_elements.ma_toast.hidden = false;
  }

  if (!ma_schema || !ma_id) {
    ma_elements.ma_name.textContent = "参数不完整";
    ma_elements.ma_type.textContent = "错误";
    ma_elements.ma_grid.innerHTML = "";
    const ma_tip = document.createElement("p");
    ma_tip.className = "ma_table-empty";
    ma_tip.textContent = "缺少 ma_type 或 ma_id 参数，请从列表页点击「详情」进入。";
    ma_elements.ma_grid.appendChild(ma_tip);
    return;
  }

  ma_elements.ma_title.textContent = `${ma_schema.ma_title}详情`;
  ma_elements.ma_type.textContent = `${ma_schema.ma_title} · ID ${ma_id}`;
  document.title = `${ma_schema.ma_title}详情 · 小米商城 · 马欣宇`;

  window
    .fetch(`/api/${ma_type}/${ma_id}`)
    .then((ma_response) => ma_response.json())
    .then((ma_result) => {
      if (ma_result.code !== 0) {
        throw new Error(ma_result.msg);
      }
      const ma_row = ma_result.data.ma_row;
      ma_elements.ma_name.textContent = ma_row[ma_schema.ma_nameKey] ?? `记录 ${ma_id}`;
      ma_elements.ma_grid.replaceChildren();

      ma_schema.ma_fields.forEach((ma_field) => {
        const ma_item = document.createElement("div");
        ma_item.className = "ma_detail-row";

        const ma_term = document.createElement("dt");
        ma_term.textContent = ma_field.ma_label;
        ma_item.appendChild(ma_term);

        const ma_desc = document.createElement("dd");
        const ma_value = ma_row[ma_field.ma_key];
        ma_desc.textContent = ma_field.ma_format
          ? ma_field.ma_format(ma_value, ma_row)
          : (ma_value === undefined || ma_value === "" ? "—" : String(ma_value));
        ma_item.appendChild(ma_desc);

        ma_elements.ma_grid.appendChild(ma_item);
      });
    })
    .catch((ma_error) => {
      console.error("加载详情失败：", ma_error);
      ma_elements.ma_name.textContent = "加载失败";
      ma_showToast(ma_error.message || "加载详情失败，请返回列表重试。");
    });
})();
