/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
/*
 * 后台实体管理：3 个实体的列表、搜索、分页、新增、编辑、删除、详情跳转
 *   KT3  考点：新增 / 编辑弹窗表单的必填与格式校验
 *   KT25 考点：fetch 调用模拟接口，关键词与页码通过查询字符串发送
 */
(() => {
  "use strict";

  const ma_pageSize = 6;

  const ma_schemas = {
    products: {
      ma_title: "商品",
      ma_endpoint: "/api/products",
      ma_columns: [
        { ma_key: "ma_id", ma_label: "ID" },
        { ma_key: "ma_name", ma_label: "商品名称" },
        { ma_key: "ma_category", ma_label: "分类" },
        { ma_key: "ma_price", ma_label: "价格", ma_format: (ma_value) => `¥ ${Number(ma_value).toLocaleString("zh-CN")}` },
        { ma_key: "ma_stock", ma_label: "库存" },
        { ma_key: "ma_status", ma_label: "状态", ma_badge: true }
      ],
      ma_fields: [
        { ma_key: "ma_name", ma_label: "商品名称 *", ma_type: "text", ma_placeholder: "例如：小米 15 Pro", ma_full: true, ma_rule: (ma_value) => (ma_value.trim() ? "" : "请输入商品名称。") },
        { ma_key: "ma_category", ma_label: "分类 *", ma_type: "select", ma_options: ["手机", "耳机", "穿戴", "笔记本", "家电", "配件"] },
        { ma_key: "ma_status", ma_label: "状态 *", ma_type: "select", ma_options: ["在售", "下架"] },
        { ma_key: "ma_price", ma_label: "价格（元）*", ma_type: "number", ma_placeholder: "0", ma_rule: (ma_value) => (ma_value !== "" && Number(ma_value) >= 0 ? "" : "请输入不小于 0 的价格。") },
        { ma_key: "ma_stock", ma_label: "库存 *", ma_type: "number", ma_placeholder: "0", ma_rule: (ma_value) => (ma_value !== "" && Number(ma_value) >= 0 ? "" : "请输入不小于 0 的库存。") }
      ]
    },
    orders: {
      ma_title: "订单",
      ma_endpoint: "/api/orders",
      ma_columns: [
        { ma_key: "ma_id", ma_label: "ID" },
        { ma_key: "ma_order_no", ma_label: "订单号" },
        { ma_key: "ma_customer", ma_label: "客户" },
        { ma_key: "ma_product", ma_label: "商品" },
        { ma_key: "ma_amount", ma_label: "金额", ma_format: (ma_value) => `¥ ${Number(ma_value).toLocaleString("zh-CN")}` },
        { ma_key: "ma_status", ma_label: "状态", ma_badge: true }
      ],
      ma_fields: [
        { ma_key: "ma_order_no", ma_label: "订单号 *", ma_type: "text", ma_placeholder: "MI202611013", ma_rule: (ma_value) => (/^MI\d{9,}$/.test(ma_value.trim()) ? "" : "订单号需以 MI 开头并包含至少 9 位数字。") },
        { ma_key: "ma_customer", ma_label: "客户姓名 *", ma_type: "text", ma_placeholder: "例如：马欣宇", ma_rule: (ma_value) => (ma_value.trim() ? "" : "请输入客户姓名。") },
        { ma_key: "ma_product", ma_label: "商品名称 *", ma_type: "text", ma_placeholder: "例如：小米 15 Pro", ma_full: true, ma_rule: (ma_value) => (ma_value.trim() ? "" : "请输入商品名称。") },
        { ma_key: "ma_amount", ma_label: "订单金额（元）*", ma_type: "number", ma_placeholder: "0", ma_rule: (ma_value) => (ma_value !== "" && Number(ma_value) >= 0 ? "" : "请输入不小于 0 的金额。") },
        { ma_key: "ma_status", ma_label: "订单状态 *", ma_type: "select", ma_options: ["待付款", "待发货", "已发货", "已完成", "已取消"] }
      ]
    },
    users: {
      ma_title: "用户",
      ma_endpoint: "/api/users",
      ma_columns: [
        { ma_key: "ma_id", ma_label: "ID" },
        { ma_key: "ma_username", ma_label: "用户名" },
        { ma_key: "ma_phone", ma_label: "手机号" },
        { ma_key: "ma_level", ma_label: "会员等级", ma_badge: true },
        { ma_key: "ma_points", ma_label: "积分", ma_format: (ma_value) => Number(ma_value).toLocaleString("zh-CN") },
        { ma_key: "ma_created_at", ma_label: "注册时间" }
      ],
      ma_fields: [
        { ma_key: "ma_username", ma_label: "用户名 *", ma_type: "text", ma_placeholder: "3-16 位字母、数字或下划线", ma_rule: (ma_value) => (/^[A-Za-z0-9_]{3,16}$/.test(ma_value.trim()) ? "" : "用户名需为 3-16 位字母、数字或下划线。") },
        { ma_key: "ma_phone", ma_label: "手机号 *", ma_type: "text", ma_placeholder: "11 位手机号", ma_rule: (ma_value) => (/^1[3-9]\d{9}$/.test(ma_value.trim()) ? "" : "手机号需为 11 位数字。") },
        { ma_key: "ma_level", ma_label: "会员等级 *", ma_type: "select", ma_options: ["普通会员", "银卡会员", "金卡会员"] },
        { ma_key: "ma_points", ma_label: "积分 *", ma_type: "number", ma_placeholder: "0", ma_rule: (ma_value) => (ma_value !== "" && Number(ma_value) >= 0 ? "" : "请输入不小于 0 的积分。") }
      ]
    }
  };

  const ma_state = {
    ma_entity: "products",
    ma_page: 1,
    ma_keyword: "",
    ma_editingId: null
  };

  const ma_elements = {
    ma_tabs: document.querySelector("#ma_tabs"),
    ma_tableHead: document.querySelector("#ma_table-head"),
    ma_tableBody: document.querySelector("#ma_table-body"),
    ma_pagerInfo: document.querySelector("#ma_pager-info"),
    ma_pagerButtons: document.querySelector("#ma_pager-buttons"),
    ma_searchForm: document.querySelector("#ma_search-form"),
    ma_searchInput: document.querySelector("#ma_search-input"),
    ma_add: document.querySelector("#ma_add"),
    ma_modal: document.querySelector("#ma_modal"),
    ma_modalTitle: document.querySelector("#ma_modal-title"),
    ma_modalDesc: document.querySelector("#ma_modal-desc"),
    ma_form: document.querySelector("#ma_form"),
    ma_formGrid: document.querySelector("#ma_form-grid"),
    ma_formError: document.querySelector("#ma_form-error"),
    ma_formCancel: document.querySelector("#ma_form-cancel"),
    ma_formSubmit: document.querySelector("#ma_form-submit"),
    ma_toast: document.querySelector("#ma_toast")
  };

  let ma_toastTimer = 0;

  function ma_showToast(ma_text, ma_isError) {
    if (!ma_elements.ma_toast) {
      return;
    }
    ma_elements.ma_toast.textContent = ma_text;
    ma_elements.ma_toast.className = ma_isError ? "ma_toast ma_toast--error" : "ma_toast";
    ma_elements.ma_toast.hidden = false;
    window.clearTimeout(ma_toastTimer);
    ma_toastTimer = window.setTimeout(() => {
      ma_elements.ma_toast.hidden = true;
    }, 2600);
  }

  function ma_badgeClass(ma_value) {
    if (["在售", "已完成", "金卡会员"].includes(ma_value)) {
      return "ma_badge--green";
    }
    if (["待发货", "已发货", "银卡会员"].includes(ma_value)) {
      return "ma_badge--blue";
    }
    if (ma_value === "待付款") {
      return "ma_badge--gold";
    }
    if (["下架", "已取消", "普通会员"].includes(ma_value)) {
      return "ma_badge--pink";
    }
    return "";
  }

  /* ---------------- 表格 ---------------- */
  function ma_renderHead() {
    const ma_schema = ma_schemas[ma_state.ma_entity];
    const ma_row = document.createElement("tr");
    ma_schema.ma_columns.forEach((ma_column) => {
      const ma_th = document.createElement("th");
      ma_th.scope = "col";
      ma_th.textContent = ma_column.ma_label;
      ma_row.appendChild(ma_th);
    });
    const ma_actions = document.createElement("th");
    ma_actions.scope = "col";
    ma_actions.textContent = "操作";
    ma_row.appendChild(ma_actions);
    ma_elements.ma_tableHead.replaceChildren(ma_row);
  }

  function ma_renderRows(ma_rows) {
    const ma_schema = ma_schemas[ma_state.ma_entity];
    ma_elements.ma_tableBody.replaceChildren();

    if (ma_rows.length === 0) {
      const ma_tr = document.createElement("tr");
      const ma_td = document.createElement("td");
      ma_td.colSpan = ma_schema.ma_columns.length + 1;
      ma_td.className = "ma_table-empty";
      ma_td.textContent = "没有匹配的数据，试试更换关键词或新增一条。";
      ma_tr.appendChild(ma_td);
      ma_elements.ma_tableBody.appendChild(ma_tr);
      return;
    }

    ma_rows.forEach((ma_item) => {
      const ma_tr = document.createElement("tr");

      ma_schema.ma_columns.forEach((ma_column) => {
        const ma_td = document.createElement("td");
        const ma_value = ma_item[ma_column.ma_key];
        if (ma_column.ma_badge) {
          const ma_badge = document.createElement("span");
          ma_badge.className = `ma_badge ${ma_badgeClass(ma_value)}`.trim();
          ma_badge.textContent = ma_value ?? "—";
          ma_td.appendChild(ma_badge);
        } else if (ma_column.ma_format) {
          ma_td.textContent = ma_column.ma_format(ma_value, ma_item);
        } else {
          ma_td.textContent = ma_value === undefined || ma_value === null || ma_value === "" ? "—" : String(ma_value);
        }
        ma_tr.appendChild(ma_td);
      });

      const ma_tdActions = document.createElement("td");
      const ma_actionsWrap = document.createElement("div");
      ma_actionsWrap.className = "ma_cell-actions";

      const ma_detailLink = document.createElement("a");
      ma_detailLink.className = "ma_btn ma_btn--small";
      ma_detailLink.textContent = "详情";
      ma_detailLink.href = `./admin-detail.html?ma_type=${ma_state.ma_entity}&ma_id=${ma_item.ma_id}`;
      ma_actionsWrap.appendChild(ma_detailLink);

      const ma_edit = document.createElement("button");
      ma_edit.className = "ma_btn ma_btn--small";
      ma_edit.type = "button";
      ma_edit.textContent = "编辑";
      ma_edit.addEventListener("click", () => ma_openModal(ma_item.ma_id));
      ma_actionsWrap.appendChild(ma_edit);

      const ma_delete = document.createElement("button");
      ma_delete.className = "ma_btn ma_btn--small ma_btn--danger";
      ma_delete.type = "button";
      ma_delete.textContent = "删除";
      ma_delete.addEventListener("click", () => ma_deleteRow(ma_item));
      ma_actionsWrap.appendChild(ma_delete);

      ma_tdActions.appendChild(ma_actionsWrap);
      ma_tr.appendChild(ma_tdActions);
      ma_elements.ma_tableBody.appendChild(ma_tr);
    });
  }

  function ma_renderPager(ma_data) {
    ma_elements.ma_pagerInfo.textContent =
      `共 ${ma_data.ma_total} 条 · 第 ${ma_data.ma_page} / ${ma_data.ma_pages} 页 · 每页 ${ma_data.ma_size} 条`;
    ma_elements.ma_pagerButtons.replaceChildren();

    const ma_makeButton = (ma_label, ma_page, ma_disabled, ma_active) => {
      const ma_button = document.createElement("button");
      ma_button.type = "button";
      ma_button.className = "ma_page-btn";
      ma_button.textContent = ma_label;
      if (ma_active) {
        ma_button.classList.add("is-active");
      }
      ma_button.disabled = Boolean(ma_disabled);
      ma_button.addEventListener("click", () => {
        ma_state.ma_page = ma_page;
        ma_loadList();
      });
      return ma_button;
    };

    ma_elements.ma_pagerButtons.appendChild(ma_makeButton("上一页", ma_data.ma_page - 1, ma_data.ma_page <= 1, false));

    const ma_start = Math.max(1, Math.min(ma_data.ma_page - 2, ma_data.ma_pages - 4));
    const ma_end = Math.min(ma_data.ma_pages, ma_start + 4);
    for (let ma_page = ma_start; ma_page <= ma_end; ma_page += 1) {
      ma_elements.ma_pagerButtons.appendChild(ma_makeButton(String(ma_page), ma_page, false, ma_page === ma_data.ma_page));
    }

    ma_elements.ma_pagerButtons.appendChild(ma_makeButton("下一页", ma_data.ma_page + 1, ma_data.ma_page >= ma_data.ma_pages, false));
  }

  /* ---------------- 加载列表 ---------------- */
  async function ma_loadList() {
    const ma_schema = ma_schemas[ma_state.ma_entity];
    const ma_params = new URLSearchParams({
      ma_page: String(ma_state.ma_page),
      ma_size: String(ma_pageSize)
    });
    if (ma_state.ma_keyword) {
      ma_params.set("ma_keyword", ma_state.ma_keyword);
    }

    ma_elements.ma_pagerInfo.textContent = "正在加载…";

    try {
      const ma_response = await window.fetch(`${ma_schema.ma_endpoint}?${ma_params.toString()}`);
      const ma_result = await ma_response.json();
      if (ma_result.code !== 0) {
        throw new Error(ma_result.msg);
      }
      ma_state.ma_page = ma_result.data.ma_page;
      ma_renderRows(ma_result.data.ma_list);
      ma_renderPager(ma_result.data);
    } catch (ma_error) {
      console.error("加载列表失败：", ma_error);
      ma_elements.ma_pagerInfo.textContent = "加载失败";
      ma_showToast(`加载${ma_schema.ma_title}列表失败。`, true);
    }
  }

  /* ---------------- 弹窗表单 ---------------- */
  function ma_openModal(ma_id) {
    const ma_schema = ma_schemas[ma_state.ma_entity];
    ma_state.ma_editingId = ma_id || null;
    ma_elements.ma_modalTitle.textContent = `${ma_id ? "编辑" : "新增"}${ma_schema.ma_title}`;
    ma_elements.ma_modalDesc.textContent = "带 * 的字段为必填项，失焦与提交时都会校验。";
    ma_elements.ma_formError.textContent = "";
    ma_elements.ma_formSubmit.disabled = false;
    ma_elements.ma_formSubmit.textContent = "保存";
    ma_elements.ma_formGrid.replaceChildren();

    ma_schema.ma_fields.forEach((ma_field) => {
      const ma_item = document.createElement("div");
      ma_item.className = ma_field.ma_full ? "ma_form-item ma_form-item--full" : "ma_form-item";

      const ma_label = document.createElement("label");
      ma_label.textContent = ma_field.ma_label;
      ma_label.htmlFor = `ma_field-${ma_field.ma_key}`;
      ma_item.appendChild(ma_label);

      let ma_input;
      if (ma_field.ma_type === "select") {
        ma_input = document.createElement("select");
        ma_field.ma_options.forEach((ma_option) => {
          const ma_optionElement = document.createElement("option");
          ma_optionElement.value = ma_option;
          ma_optionElement.textContent = ma_option;
          ma_input.appendChild(ma_optionElement);
        });
      } else {
        ma_input = document.createElement("input");
        ma_input.type = ma_field.ma_type === "number" ? "number" : "text";
        if (ma_field.ma_placeholder) {
          ma_input.placeholder = ma_field.ma_placeholder;
        }
        if (ma_field.ma_type === "number") {
          ma_input.min = "0";
          ma_input.step = "1";
        }
      }
      ma_input.id = `ma_field-${ma_field.ma_key}`;
      ma_input.name = ma_field.ma_key;
      ma_input.dataset.maKey = ma_field.ma_key;
      ma_item.appendChild(ma_input);

      const ma_error = document.createElement("p");
      ma_error.className = "ma_form-error";
      ma_error.dataset.maErrorFor = ma_field.ma_key;
      ma_item.appendChild(ma_error);

      if (ma_field.ma_rule) {
        const ma_check = () => {
          const ma_message = ma_field.ma_rule(ma_input.value);
          ma_error.textContent = ma_message;
          ma_input.classList.toggle("is-invalid", Boolean(ma_message));
          return !ma_message;
        };
        ma_input.addEventListener("blur", ma_check);
        ma_input.addEventListener("input", () => {
          if (ma_input.classList.contains("is-invalid")) {
            ma_check();
          }
        });
        ma_input.__ma_check = ma_check;
      }

      ma_elements.ma_formGrid.appendChild(ma_item);
    });

    ma_elements.ma_modal.hidden = false;

    if (ma_id) {
      ma_fillForm(ma_id);
    } else {
      ma_elements.ma_form.querySelector("input, select")?.focus();
    }
  }

  async function ma_fillForm(ma_id) {
    const ma_schema = ma_schemas[ma_state.ma_entity];
    try {
      const ma_response = await window.fetch(`${ma_schema.ma_endpoint}/${ma_id}`);
      const ma_result = await ma_response.json();
      if (ma_result.code !== 0) {
        throw new Error(ma_result.msg);
      }
      const ma_row = ma_result.data.ma_row;
      ma_schema.ma_fields.forEach((ma_field) => {
        const ma_input = ma_elements.ma_form.querySelector(`[data-ma-key="${ma_field.ma_key}"]`);
        if (ma_input && ma_row[ma_field.ma_key] !== undefined) {
          ma_input.value = String(ma_row[ma_field.ma_key]);
        }
      });
    } catch (ma_error) {
      console.error("获取详情失败：", ma_error);
      ma_showToast("获取详情失败，请重试。", true);
    }
  }

  function ma_closeModal() {
    ma_elements.ma_modal.hidden = true;
    ma_state.ma_editingId = null;
  }

  async function ma_submitForm(ma_event) {
    ma_event.preventDefault();
    if (ma_elements.ma_formSubmit.disabled) {
      return;
    }
    const ma_schema = ma_schemas[ma_state.ma_entity];

    let ma_valid = true;
    ma_schema.ma_fields.forEach((ma_field) => {
      const ma_input = ma_elements.ma_form.querySelector(`[data-ma-key="${ma_field.ma_key}"]`);
      if (ma_input && ma_input.__ma_check) {
        if (!ma_input.__ma_check()) {
          ma_valid = false;
        }
      }
    });
    if (!ma_valid) {
      ma_elements.ma_formError.textContent = "请先修正标红的字段。";
      ma_elements.ma_form.querySelector(".is-invalid")?.focus();
      return;
    }

    const ma_payload = {};
    ma_schema.ma_fields.forEach((ma_field) => {
      const ma_input = ma_elements.ma_form.querySelector(`[data-ma-key="${ma_field.ma_key}"]`);
      ma_payload[ma_field.ma_key] = ma_input ? ma_input.value : "";
    });

    const ma_isEdit = Boolean(ma_state.ma_editingId);
    ma_elements.ma_formSubmit.disabled = true;
    ma_elements.ma_formSubmit.textContent = "保存中…";
    ma_elements.ma_formError.textContent = "";

    try {
      const ma_response = await window.fetch(
        ma_isEdit ? `${ma_schema.ma_endpoint}/${ma_state.ma_editingId}` : ma_schema.ma_endpoint,
        {
          method: ma_isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ma_payload)
        }
      );
      const ma_result = await ma_response.json();

      if (ma_result.code !== 0) {
        ma_elements.ma_formError.textContent = ma_result.msg;
        if (ma_result.code === 1004) {
          ma_elements.ma_form.querySelector("input, select")?.focus();
        }
        return;
      }

      ma_showToast(ma_result.msg, false);
      ma_closeModal();
      ma_loadList();
    } catch (ma_error) {
      console.error("保存失败：", ma_error);
      ma_elements.ma_formError.textContent = "保存请求失败，请稍后重试。";
    } finally {
      ma_elements.ma_formSubmit.disabled = false;
      ma_elements.ma_formSubmit.textContent = "保存";
    }
  }

  async function ma_deleteRow(ma_item) {
    const ma_schema = ma_schemas[ma_state.ma_entity];
    const ma_confirmed = window.confirm(`确定删除这条${ma_schema.ma_title}记录（ID：${ma_item.ma_id}）吗？`);
    if (!ma_confirmed) {
      return;
    }
    try {
      const ma_response = await window.fetch(`${ma_schema.ma_endpoint}/${ma_item.ma_id}`, {
        method: "DELETE"
      });
      const ma_result = await ma_response.json();
      if (ma_result.code !== 0) {
        ma_showToast(ma_result.msg, true);
        return;
      }
      ma_showToast(ma_result.msg, false);
      ma_loadList();
    } catch (ma_error) {
      console.error("删除失败：", ma_error);
      ma_showToast("删除请求失败，请稍后重试。", true);
    }
  }

  /* ---------------- 实体切换 ---------------- */
  function ma_switchEntity(ma_entity) {
    if (!ma_schemas[ma_entity]) {
      return;
    }
    ma_state.ma_entity = ma_entity;
    ma_state.ma_page = 1;
    ma_state.ma_keyword = "";
    ma_elements.ma_searchInput.value = "";
    ma_elements.ma_add.textContent = `+ 新增${ma_schemas[ma_entity].ma_title}`;

    ma_elements.ma_tabs.querySelectorAll(".ma_tab").forEach((ma_tab) => {
      ma_tab.classList.toggle("is-active", ma_tab.dataset.maEntity === ma_entity);
    });

    ma_renderHead();
    ma_loadList();
  }

  /* ---------------- 事件绑定 ---------------- */
  ma_elements.ma_tabs.addEventListener("click", (ma_event) => {
    const ma_tab = ma_event.target.closest(".ma_tab");
    if (ma_tab) {
      ma_switchEntity(ma_tab.dataset.maEntity);
    }
  });

  ma_elements.ma_searchForm.addEventListener("submit", (ma_event) => {
    ma_event.preventDefault();
    ma_state.ma_keyword = ma_elements.ma_searchInput.value.trim();
    ma_state.ma_page = 1;
    ma_loadList();
  });

  document.querySelector("#ma_search-reset").addEventListener("click", () => {
    ma_elements.ma_searchInput.value = "";
    ma_state.ma_keyword = "";
    ma_state.ma_page = 1;
    ma_loadList();
  });

  ma_elements.ma_add.addEventListener("click", () => ma_openModal(null));
  ma_elements.ma_form.addEventListener("submit", ma_submitForm);
  ma_elements.ma_formCancel.addEventListener("click", ma_closeModal);

  ma_elements.ma_modal.addEventListener("click", (ma_event) => {
    if (ma_event.target === ma_elements.ma_modal) {
      ma_closeModal();
    }
  });

  document.addEventListener("keydown", (ma_event) => {
    if (ma_event.key === "Escape" && !ma_elements.ma_modal.hidden) {
      ma_closeModal();
    }
  });

  ma_renderHead();
  ma_switchEntity("products");
})();
