/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-16 | 大模型：Copilot（具体模型名称未提供） */
(() => {
  const ma_fileInput = document.querySelector("#ma_reviews-file");
  const ma_fileName = document.querySelector("#ma_reviews-file-name");
  const ma_submit = document.querySelector("#ma_reviews-submit");
  const ma_status = document.querySelector("#ma_reviews-status");
  const ma_results = document.querySelector("#ma_reviews-results");
  const ma_chart = document.querySelector("#ma_reviews-chart");
  const ma_legend = document.querySelector("#ma_reviews-legend");
  const ma_highlights = document.querySelector("#ma_reviews-highlights");
  const ma_reviewList = document.querySelector("#ma_reviews-list");
  const ma_json = document.querySelector("#ma_reviews-json");
  const ma_reviewFileMaxSize = 5 * 1024 * 1024;
  const ma_colors = [
    { ma_sentiment: "好评", ma_color: "#78e2d0" },
    { ma_sentiment: "中评", ma_color: "#f0c37a" },
    { ma_sentiment: "差评", ma_color: "#ff899d" }
  ];
  let ma_selectedFile = null;

  function ma_setStatus(ma_message, ma_isError) {
    ma_status.textContent = ma_message;
    ma_status.classList.toggle("ma_reviews-status--error", ma_isError);
  }

  function ma_selectFile(ma_file) {
    ma_selectedFile = ma_file || null;
    ma_fileName.textContent = ma_selectedFile ? ma_selectedFile.name : "选择 Excel 文件";
    ma_submit.disabled = !ma_selectedFile;
    if (ma_selectedFile) {
      ma_setStatus(`已选择 ${ma_selectedFile.name}，准备开始分析。`, false);
    }
  }

  function ma_readFile(ma_file) {
    return new Promise((ma_resolve, ma_reject) => {
      const ma_reader = new FileReader();
      ma_reader.onload = () => {
        if (typeof ma_reader.result !== "string") {
          ma_reject(new Error("读取 Excel 文件失败，请重新选择。"));
          return;
        }
        ma_resolve(ma_reader.result.slice(ma_reader.result.indexOf(",") + 1));
      };
      ma_reader.onerror = () => ma_reject(new Error("读取 Excel 文件失败，请重新选择。"));
      ma_reader.readAsDataURL(ma_file);
    });
  }

  function ma_createPieSlice(ma_value, ma_startAngle, ma_color) {
    const ma_radius = 92;
    const ma_center = 110;
    if (ma_value >= 1) {
      const ma_circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      ma_circle.setAttribute("cx", String(ma_center));
      ma_circle.setAttribute("cy", String(ma_center));
      ma_circle.setAttribute("r", String(ma_radius));
      ma_circle.setAttribute("fill", ma_color);
      return ma_circle;
    }
    const ma_endAngle = ma_startAngle + ma_value * Math.PI * 2;
    const ma_largeArc = ma_value > 0.5 ? 1 : 0;
    const ma_start = {
      x: ma_center + ma_radius * Math.cos(ma_startAngle),
      y: ma_center + ma_radius * Math.sin(ma_startAngle)
    };
    const ma_end = {
      x: ma_center + ma_radius * Math.cos(ma_endAngle),
      y: ma_center + ma_radius * Math.sin(ma_endAngle)
    };
    const ma_path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    ma_path.setAttribute("d", `M ${ma_center} ${ma_center} L ${ma_start.x} ${ma_start.y} A ${ma_radius} ${ma_radius} 0 ${ma_largeArc} 1 ${ma_end.x} ${ma_end.y} Z`);
    ma_path.setAttribute("fill", ma_color);
    return ma_path;
  }

  function ma_renderChart(ma_summary) {
    const ma_counts = [ma_summary.ma_positive, ma_summary.ma_neutral, ma_summary.ma_negative];
    let ma_angle = -Math.PI / 2;
    const ma_chartSlices = [];
    if (ma_summary.ma_total === 0) {
      ma_chartSlices.push(ma_createPieSlice(1, ma_angle, "rgba(194, 207, 238, 0.13)"));
    } else {
      ma_counts.forEach((ma_count, ma_index) => {
        if (ma_count > 0) {
          const ma_fraction = ma_count / ma_summary.ma_total;
          ma_chartSlices.push(ma_createPieSlice(ma_fraction, ma_angle, ma_colors[ma_index].ma_color));
          ma_angle += ma_fraction * Math.PI * 2;
        }
      });
    }
    ma_chart.replaceChildren(...ma_chartSlices);

    ma_legend.replaceChildren(...ma_colors.map((ma_item, ma_index) => {
      const ma_entry = document.createElement("li");
      const ma_marker = document.createElement("span");
      const ma_label = document.createElement("span");
      const ma_count = document.createElement("strong");
      ma_entry.className = "ma_reviews-legend-item";
      ma_marker.className = "ma_reviews-legend-marker";
      ma_marker.style.backgroundColor = ma_item.ma_color;
      ma_marker.setAttribute("aria-hidden", "true");
      ma_label.textContent = ma_item.ma_sentiment;
      ma_count.textContent = String(ma_counts[ma_index]);
      ma_entry.append(ma_marker, ma_label, ma_count);
      return ma_entry;
    }));
  }

  function ma_createReviewCard(ma_review, ma_isHighlight) {
    const ma_item = document.createElement("li");
    const ma_meta = document.createElement("div");
    const ma_sentiment = document.createElement("span");
    const ma_product = document.createElement("span");
    const ma_content = document.createElement("p");
    const ma_reason = document.createElement("p");

    ma_item.className = ma_isHighlight ? "ma_reviews-highlight" : "ma_reviews-item";
    ma_meta.className = "ma_reviews-item-meta";
    ma_sentiment.className = `ma_reviews-sentiment ma_reviews-sentiment--${ma_review.ma_sentiment}`;
    ma_sentiment.textContent = ma_review.ma_sentiment;
    ma_product.className = "ma_reviews-product";
    ma_product.textContent = ma_review.ma_product || `评论 ${ma_review.ma_review_id}`;
    ma_content.className = "ma_reviews-item-content";
    ma_content.textContent = ma_review.ma_content;
    ma_reason.className = "ma_reviews-reason";
    ma_reason.textContent = `${ma_isHighlight ? "精选原因" : "判断依据"}：${ma_review.ma_reason}`;
    ma_meta.append(ma_sentiment, ma_product);
    ma_item.append(ma_meta, ma_content, ma_reason);
    return ma_item;
  }

  function ma_renderResults(ma_data) {
    const ma_summary = ma_data.ma_summary;
    ma_results.hidden = false;
    document.querySelector("#ma_reviews-total").textContent = `${ma_summary.ma_total} 条评论`;
    document.querySelector("#ma_reviews-highlight-count").textContent = `${ma_data.ma_highlights.length} 条`;
    ma_renderChart(ma_summary);
    ma_highlights.replaceChildren();
    if (ma_data.ma_highlights.length) {
      ma_highlights.append(...ma_data.ma_highlights.map((ma_review) => ma_createReviewCard(ma_review, true)));
    } else {
      const ma_empty = document.createElement("li");
      ma_empty.className = "ma_reviews-empty";
      ma_empty.textContent = "本次分析未发现足够具体、可行动的精选评论。";
      ma_highlights.append(ma_empty);
    }
    ma_reviewList.replaceChildren(...ma_data.ma_reviews.map((ma_review) => ma_createReviewCard(ma_review, false)));
    ma_json.textContent = JSON.stringify({ code: 0, msg: "商业评论分析完成。", data: ma_data }, null, 2);
    ma_results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function ma_analyzeReviews() {
    if (!ma_selectedFile || ma_submit.disabled) {
      return;
    }
    if (!ma_selectedFile.name.toLowerCase().endsWith(".xlsx")) {
      ma_setStatus("仅支持 .xlsx 格式的 Excel 文件。", true);
      return;
    }
    if (!ma_selectedFile.size || ma_selectedFile.size > ma_reviewFileMaxSize) {
      ma_setStatus("文件为空或超过 5 MB，请使用较小的 Excel 文件。", true);
      return;
    }

    ma_submit.disabled = true;
    ma_fileInput.disabled = true;
    ma_setStatus("正在读取文件并请求 AI 逐条分析，请稍候…", false);
    ma_results.hidden = true;
    try {
      const ma_payload = {
        ma_name: ma_selectedFile.name,
        ma_content: await ma_readFile(ma_selectedFile)
      };
      console.log("发送商业评论分析请求：", { ma_name: ma_payload.ma_name, ma_file_size: ma_selectedFile.size });
      const ma_response = await fetch("/api/commercial-reviews/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ma_payload)
      });
      const ma_result = await ma_response.json();
      console.log("商业评论分析接口返回数据：", ma_result);
      if (!ma_response.ok || ma_result.code !== 0) {
        throw new Error(ma_result.msg || `分析失败（HTTP ${ma_response.status}）`);
      }
      ma_renderResults(ma_result.data);
      ma_setStatus(ma_result.msg, false);
    } catch (ma_error) {
      console.error("商业评论分析请求失败：", ma_error);
      ma_setStatus(ma_error.message || "分析失败，请检查服务状态后重试。", true);
    } finally {
      ma_submit.disabled = !ma_selectedFile;
      ma_fileInput.disabled = false;
    }
  }

  ma_fileInput.addEventListener("change", () => ma_selectFile(ma_fileInput.files[0]));
  ma_submit.addEventListener("click", ma_analyzeReviews);
  document.querySelector(".ma_reviews-file").addEventListener("dragover", (ma_event) => {
    ma_event.preventDefault();
    ma_event.currentTarget.classList.add("ma_reviews-file--active");
  });
  document.querySelector(".ma_reviews-file").addEventListener("dragleave", (ma_event) => {
    ma_event.currentTarget.classList.remove("ma_reviews-file--active");
  });
  document.querySelector(".ma_reviews-file").addEventListener("drop", (ma_event) => {
    ma_event.preventDefault();
    ma_event.currentTarget.classList.remove("ma_reviews-file--active");
    const ma_file = Array.from(ma_event.dataTransfer.files).find((ma_item) => ma_item.name.toLowerCase().endsWith(".xlsx"));
    if (!ma_file) {
      ma_setStatus("未找到 .xlsx 文件，请重新拖入 Excel 文件。", true);
      return;
    }
    ma_selectFile(ma_file);
  });
})();
