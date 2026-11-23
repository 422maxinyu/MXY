/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
/*
 * 图表仪表盘
 *   KT20 考点：全部图表用 Canvas 2D 手绘（柱状图、折线、环形图、条形图），不依赖任何图表库
 *   KT25 考点：通过 fetch 请求 /api/stats/dashboard，数据变化后图表同步重绘
 */
(() => {
  "use strict";

  const ma_colors = ["#9bafff", "#78e2d0", "#f0c37a", "#ff9ab0", "#b9a5ff", "#7fd1ff"];
  const ma_font = '"Segoe UI", "Microsoft YaHei", sans-serif';
  let ma_cache = null;

  const ma_canvasIds = ["ma_chart-monthly", "ma_chart-category", "ma_chart-status", "ma_chart-top"];

  function ma_prepareCanvas(ma_canvas) {
    const ma_rect = ma_canvas.getBoundingClientRect();
    const ma_ratio = Math.min(window.devicePixelRatio || 1, 2);
    const ma_width = Math.max(280, ma_rect.width);
    const ma_height = Math.max(180, ma_rect.height || 240);
    ma_canvas.width = Math.round(ma_width * ma_ratio);
    ma_canvas.height = Math.round(ma_height * ma_ratio);
    const ma_context = ma_canvas.getContext("2d");
    ma_context.setTransform(ma_ratio, 0, 0, ma_ratio, 0, 0);
    ma_context.clearRect(0, 0, ma_width, ma_height);
    return { ma_context, ma_width, ma_height };
  }

  function ma_roundRect(ma_context, ma_x, ma_y, ma_width, ma_height, ma_radius) {
    if (typeof ma_context.roundRect === "function") {
      ma_context.beginPath();
      ma_context.roundRect(ma_x, ma_y, ma_width, ma_height, ma_radius);
      return;
    }
    ma_context.beginPath();
    ma_context.rect(ma_x, ma_y, ma_width, ma_height);
  }

  function ma_shortNumber(ma_value) {
    if (ma_value >= 10000) {
      return `${(ma_value / 10000).toFixed(1)}万`;
    }
    return String(Math.round(ma_value));
  }

  function ma_money(ma_value) {
    return `¥ ${Number(ma_value).toLocaleString("zh-CN")}`;
  }

  /* ---------------- 柱状图 + 折线（月度） ---------------- */
  function ma_drawMonthly(ma_canvas, ma_rows) {
    const { ma_context, ma_width, ma_height } = ma_prepareCanvas(ma_canvas);
    if (!ma_rows.length) {
      ma_context.fillStyle = "#9aa5bb";
      ma_context.font = `12px ${ma_font}`;
      ma_context.fillText("暂无数据", 16, 30);
      return;
    }

    const ma_pad = { ma_left: 54, ma_right: 44, ma_top: 20, ma_bottom: 32 };
    const ma_chartWidth = ma_width - ma_pad.ma_left - ma_pad.ma_right;
    const ma_chartHeight = ma_height - ma_pad.ma_top - ma_pad.ma_bottom;
    const ma_maxSales = Math.max(1, ...ma_rows.map((ma_row) => ma_row.ma_sales));
    const ma_maxOrders = Math.max(1, ...ma_rows.map((ma_row) => ma_row.ma_orders));

    /* 横向网格与左侧金额刻度 */
    ma_context.font = `10px ${ma_font}`;
    ma_context.textAlign = "right";
    ma_context.textBaseline = "middle";
    for (let ma_index = 0; ma_index <= 4; ma_index += 1) {
      const ma_y = ma_pad.ma_top + (ma_chartHeight * ma_index) / 4;
      ma_context.strokeStyle = "rgba(194, 207, 238, 0.11)";
      ma_context.beginPath();
      ma_context.moveTo(ma_pad.ma_left, ma_y);
      ma_context.lineTo(ma_width - ma_pad.ma_right, ma_y);
      ma_context.stroke();

      ma_context.fillStyle = "#9aa5bb";
      ma_context.fillText(ma_shortNumber(ma_maxSales * (1 - ma_index / 4)), ma_pad.ma_left - 8, ma_y);
    }

    const ma_slot = ma_chartWidth / ma_rows.length;
    const ma_barWidth = Math.min(48, ma_slot * 0.48);

    ma_rows.forEach((ma_row, ma_index) => {
      const ma_x = ma_pad.ma_left + ma_slot * ma_index + (ma_slot - ma_barWidth) / 2;
      const ma_barHeight = Math.max(2, (ma_chartHeight * ma_row.ma_sales) / ma_maxSales);
      const ma_y = ma_pad.ma_top + ma_chartHeight - ma_barHeight;

      const ma_gradient = ma_context.createLinearGradient(0, ma_y, 0, ma_pad.ma_top + ma_chartHeight);
      ma_gradient.addColorStop(0, "rgba(166, 183, 255, 0.95)");
      ma_gradient.addColorStop(1, "rgba(166, 183, 255, 0.22)");
      ma_context.fillStyle = ma_gradient;
      ma_roundRect(ma_context, ma_x, ma_y, ma_barWidth, ma_barHeight, [6, 6, 0, 0]);
      ma_context.fill();

      ma_context.fillStyle = "#f0f3fb";
      ma_context.textAlign = "center";
      ma_context.textBaseline = "bottom";
      ma_context.fillText(ma_shortNumber(ma_row.ma_sales), ma_x + ma_barWidth / 2, ma_y - 4);

      ma_context.fillStyle = "#9aa5bb";
      ma_context.textAlign = "center";
      ma_context.textBaseline = "top";
      ma_context.fillText(ma_row.ma_month, ma_x + ma_barWidth / 2, ma_pad.ma_top + ma_chartHeight + 8);
    });

    /* 订单数折线 */
    const ma_points = ma_rows.map((ma_row, ma_index) => ({
      ma_x: ma_pad.ma_left + ma_slot * ma_index + ma_slot / 2,
      ma_y: ma_pad.ma_top + ma_chartHeight - (ma_chartHeight * ma_row.ma_orders) / ma_maxOrders * 0.9
    }));

    ma_context.strokeStyle = "#78e2d0";
    ma_context.lineWidth = 2;
    ma_context.beginPath();
    ma_points.forEach((ma_point, ma_index) => {
      if (ma_index === 0) {
        ma_context.moveTo(ma_point.ma_x, ma_point.ma_y);
      } else {
        ma_context.lineTo(ma_point.ma_x, ma_point.ma_y);
      }
    });
    ma_context.stroke();

    ma_points.forEach((ma_point, ma_index) => {
      ma_context.beginPath();
      ma_context.fillStyle = "#78e2d0";
      ma_context.arc(ma_point.ma_x, ma_point.ma_y, 3.2, 0, Math.PI * 2);
      ma_context.fill();

      ma_context.fillStyle = "#78e2d0";
      ma_context.font = `10px ${ma_font}`;
      ma_context.textAlign = "left";
      ma_context.textBaseline = "middle";
      ma_context.fillText(String(ma_rows[ma_index].ma_orders), ma_point.ma_x + 5, ma_point.ma_y - 8);
    });
    ma_context.lineWidth = 1;
  }

  /* ---------------- 环形图 ---------------- */
  function ma_drawDonut(ma_canvas, ma_rows, ma_legend) {
    const { ma_context, ma_width, ma_height } = ma_prepareCanvas(ma_canvas);
    const ma_total = ma_rows.reduce((ma_sum, ma_row) => ma_sum + ma_row.ma_value, 0) || 1;
    const ma_centerX = ma_width / 2;
    const ma_centerY = ma_height / 2;
    const ma_radius = Math.min(ma_width, ma_height) / 2 - 18;

    let ma_start = -Math.PI / 2;
    ma_rows.forEach((ma_row, ma_index) => {
      const ma_angle = (ma_row.ma_value / ma_total) * Math.PI * 2;
      ma_context.beginPath();
      ma_context.strokeStyle = ma_colors[ma_index % ma_colors.length];
      ma_context.lineWidth = 24;
      ma_context.arc(
        ma_centerX,
        ma_centerY,
        ma_radius,
        ma_start + 0.02,
        ma_start + Math.max(ma_angle - 0.02, 0.03)
      );
      ma_context.stroke();
      ma_start += ma_angle;
    });

    ma_context.fillStyle = "#f0f3fb";
    ma_context.font = `600 24px ${ma_font}`;
    ma_context.textAlign = "center";
    ma_context.textBaseline = "middle";
    ma_context.fillText(String(ma_rows.reduce((ma_sum, ma_row) => ma_sum + ma_row.ma_value, 0)), ma_centerX, ma_centerY - 7);

    ma_context.fillStyle = "#9aa5bb";
    ma_context.font = `11px ${ma_font}`;
    ma_context.fillText("件商品", ma_centerX, ma_centerY + 17);

    if (ma_legend) {
      ma_legend.replaceChildren();
      ma_rows.forEach((ma_row, ma_index) => {
        const ma_item = document.createElement("span");
        const ma_dot = document.createElement("i");
        ma_dot.style.background = ma_colors[ma_index % ma_colors.length];
        ma_item.appendChild(ma_dot);
        ma_item.appendChild(document.createTextNode(`${ma_row.ma_name} ${ma_row.ma_value}`));
        ma_legend.appendChild(ma_item);
      });
    }
  }

  /* ---------------- 横向条形图 ---------------- */
  function ma_drawBars(ma_canvas, ma_rows, ma_options) {
    const { ma_context, ma_width, ma_height } = ma_prepareCanvas(ma_canvas);
    if (!ma_rows.length) {
      return;
    }

    const ma_labelWidth = ma_options.ma_labelWidth || 86;
    const ma_valueWidth = ma_options.ma_valueWidth || 58;
    const ma_chartWidth = ma_width - ma_labelWidth - ma_valueWidth - 8;
    const ma_rowHeight = (ma_height - 16) / ma_rows.length;
    const ma_max = Math.max(1, ...ma_rows.map((ma_row) => ma_row.ma_value));

    ma_context.font = `11px ${ma_font}`;
    ma_rows.forEach((ma_row, ma_index) => {
      const ma_y = 8 + ma_rowHeight * ma_index + ma_rowHeight * 0.2;
      const ma_barHeight = Math.max(12, ma_rowHeight * 0.56);

      ma_context.fillStyle = "#9aa5bb";
      ma_context.textAlign = "right";
      ma_context.textBaseline = "middle";
      ma_context.fillText(ma_row.ma_name, ma_labelWidth - 10, ma_y + ma_barHeight / 2);

      ma_context.fillStyle = "rgba(194, 207, 238, 0.08)";
      ma_roundRect(ma_context, ma_labelWidth, ma_y, Math.max(ma_chartWidth, 1), ma_barHeight, 5);
      ma_context.fill();

      const ma_fillWidth = Math.max(3, (ma_chartWidth * ma_row.ma_value) / ma_max);
      ma_context.fillStyle = ma_colors[ma_index % ma_colors.length];
      ma_roundRect(ma_context, ma_labelWidth, ma_y, ma_fillWidth, ma_barHeight, 5);
      ma_context.fill();

      ma_context.fillStyle = ma_options.ma_valueColor || "#f0f3fb";
      ma_context.textAlign = "left";
      ma_context.textBaseline = "middle";
      ma_context.fillText(
        ma_options.ma_valueFormat ? ma_options.ma_valueFormat(ma_row.ma_value) : String(ma_row.ma_value),
        ma_labelWidth + ma_fillWidth + 8,
        ma_y + ma_barHeight / 2
      );
    });
  }

  /* ---------------- 页面渲染 ---------------- */
  function ma_renderKpi(ma_kpi) {
    document.querySelector("#ma_kpi-products").textContent = ma_kpi.ma_product_total;
    document.querySelector("#ma_kpi-orders").textContent = ma_kpi.ma_order_total;
    document.querySelector("#ma_kpi-users").textContent = ma_kpi.ma_user_total;
    document.querySelector("#ma_kpi-revenue").textContent = `¥ ${ma_kpi.ma_revenue.toLocaleString("zh-CN")}`;
  }

  function ma_renderCharts(ma_data) {
    const ma_monthly = document.querySelector("#ma_chart-monthly");
    const ma_category = document.querySelector("#ma_chart-category");
    const ma_status = document.querySelector("#ma_chart-status");
    const ma_top = document.querySelector("#ma_chart-top");

    ma_drawMonthly(ma_monthly, ma_data.ma_monthly);
    ma_drawDonut(ma_category, ma_data.ma_category, document.querySelector("#ma_chart-category-legend"));
    ma_drawBars(ma_status, ma_data.ma_status, {
      ma_labelWidth: 78,
      ma_valueWidth: 50
    });
    ma_drawBars(ma_top, ma_data.ma_top, {
      ma_labelWidth: 130,
      ma_valueWidth: 76,
      ma_valueFormat: (ma_value) => ma_money(ma_value)
    });

    /* 订单状态图例 */
    const ma_legend = document.querySelector("#ma_chart-status-legend");
    ma_legend.replaceChildren();
    ma_data.ma_status.forEach((ma_row, ma_index) => {
      const ma_item = document.createElement("span");
      const ma_dot = document.createElement("i");
      ma_dot.style.background = ma_colors[ma_index % ma_colors.length];
      ma_item.appendChild(ma_dot);
      ma_item.appendChild(document.createTextNode(`${ma_row.ma_name} ${ma_row.ma_value} 单`));
      ma_legend.appendChild(ma_item);
    });
  }

  function ma_showToast(ma_text) {
    const ma_toast = document.querySelector("#ma_toast");
    ma_toast.textContent = ma_text;
    ma_toast.className = "ma_toast ma_toast--error";
    ma_toast.hidden = false;
    window.setTimeout(() => {
      ma_toast.hidden = true;
    }, 2600);
  }

  async function ma_loadDashboard() {
    const ma_updated = document.querySelector("#ma_dashboard-updated");
    ma_updated.textContent = "正在加载数据…";

    try {
      const ma_response = await window.fetch("/api/stats/dashboard");
      const ma_result = await ma_response.json();

      if (ma_result.code !== 0) {
        throw new Error(ma_result.msg);
      }

      ma_cache = ma_result.data;
      ma_renderKpi(ma_cache.ma_kpi);
      ma_renderCharts(ma_cache);
      ma_updated.textContent = `数据更新时间：${ma_cache.ma_updated_at}`;
    } catch (ma_error) {
      console.error("加载仪表盘数据失败：", ma_error);
      ma_updated.textContent = "加载失败，请点击刷新重试。";
      ma_showToast("加载仪表盘数据失败。");
    }
  }

  let ma_resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(ma_resizeTimer);
    ma_resizeTimer = window.setTimeout(() => {
      if (ma_cache) {
        ma_renderCharts(ma_cache);
      }
    }, 180);
  });

  document.querySelector("#ma_dashboard-refresh").addEventListener("click", ma_loadDashboard);

  /* 等布局稳定后再画，避免读取到 0 宽高 */
  window.setTimeout(ma_loadDashboard, 60);
})();
