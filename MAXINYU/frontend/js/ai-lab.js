/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
/*
 * 大模型调用实验：商品评论智能分析
 *   KT3  考点：评论输入框的必填与最小长度校验
 *   KT25 考点：以 JSON 发送请求并解析大模型返回的 JSON
 *
 * 两种调用方式：
 *   1. 离线模拟（默认）：使用关键词规则在前端生成同结构 JSON，无需后端，双击 HTML 即可运行。
 *   2. 真实接口：向项目后端 POST /api/chat 发送 messages，由后端转发给 SiliconFlow 大模型。
 */
(() => {
  "use strict";

  const ma_samples = [
    "手机屏幕很清晰，系统也很流畅，拍照效果超出预期，就是充电时有点发热，整体还是很满意，值得推荐。",
    "物流很快，包装完好，耳机音质不错，续航也够用，价格合适，会推荐给朋友。",
    "用了三天就开始卡顿，电池掉电特别快，客服还一直推脱，非常失望，准备退货。",
    "手环外观好看，功能比较全，就是睡眠监测不太准，日常使用还可以，性价比一般。"
  ];

  const ma_positiveWords = ["满意", "推荐", "流畅", "清晰", "快", "好", "喜欢", "值得", "超出预期", "不错", "合适", "够用"];
  const ma_negativeWords = ["卡顿", "卡", "慢", "差", "失望", "发热", "退货", "噪音", "贵", "推脱", "掉电", "不准"];

  const ma_elements = {
    ma_form: document.querySelector("#ma_ai-form"),
    ma_text: document.querySelector("#ma_ai-text"),
    ma_textError: document.querySelector("#ma_ai-text-error"),
    ma_mode: document.querySelector("#ma_ai-mode"),
    ma_submit: document.querySelector("#ma_ai-submit"),
    ma_sample: document.querySelector("#ma_ai-sample"),
    ma_status: document.querySelector("#ma_ai-status"),
    ma_modeLabel: document.querySelector("#ma_ai-mode-label"),
    ma_empty: document.querySelector("#ma_ai-empty"),
    ma_result: document.querySelector("#ma_ai-result"),
    ma_sentiment: document.querySelector("#ma_ai-sentiment"),
    ma_score: document.querySelector("#ma_ai-score"),
    ma_keywords: document.querySelector("#ma_ai-keywords"),
    ma_summary: document.querySelector("#ma_ai-summary"),
    ma_suggestion: document.querySelector("#ma_ai-suggestion"),
    ma_json: document.querySelector("#ma_ai-json")
  };

  let ma_sampleIndex = 0;

  function ma_setStatus(ma_text, ma_isError) {
    ma_elements.ma_status.textContent = ma_text;
    ma_elements.ma_status.className = ma_isError ? "ma_ai-status ma_ai-status--error" : "ma_ai-status";
  }

  function ma_countWords(ma_text, ma_words) {
    return ma_words.reduce((ma_count, ma_word) => (ma_text.includes(ma_word) ? ma_count + 1 : ma_count), 0);
  }

  /* ---------------- 离线模拟分析 ---------------- */
  function ma_mockAnalyze(ma_text) {
    const ma_positive = ma_countWords(ma_text, ma_positiveWords);
    const ma_negative = ma_countWords(ma_text, ma_negativeWords);
    const ma_score = Math.max(5, Math.min(98, 68 + ma_positive * 8 - ma_negative * 9));

    let ma_sentiment = "中评";
    if (ma_score >= 80) {
      ma_sentiment = "好评";
    } else if (ma_score < 60) {
      ma_sentiment = "差评";
    }

    const ma_hitKeywords = [...ma_positiveWords, ...ma_negativeWords]
      .filter((ma_word) => ma_text.includes(ma_word))
      .slice(0, 5);

    const ma_summary = ma_sentiment === "好评"
      ? `用户对商品整体满意，正面描述集中在「${ma_hitKeywords.slice(0, 2).join("、") || "体验"}」，可以继续放大卖点。`
      : ma_sentiment === "差评"
        ? `用户体验较差，主要不满集中在「${ma_hitKeywords.slice(0, 2).join("、") || "质量"}」，需要尽快跟进售后。`
        : `用户评价褒贬参半，优点是「${ma_hitKeywords.slice(0, 1).join("") || "外观"}」，不足需要重点优化。`;

    const ma_suggestion = ma_sentiment === "好评"
      ? "建议邀请用户追加晒单，并在详情页引用该评价作为口碑素材。"
      : ma_sentiment === "差评"
        ? "建议客服 24 小时内回访，确认问题原因并给出退换或补偿方案。"
        : "建议针对用户提到的具体问题补充使用说明，并跟踪后续评价变化。";

    return {
      sentiment: ma_sentiment,
      score: ma_score,
      keywords: ma_hitKeywords.length ? ma_hitKeywords : ["体验"],
      summary: ma_summary,
      suggestion: ma_suggestion
    };
  }

  /* ---------------- 结果渲染 ---------------- */
  function ma_renderResult(ma_data, ma_raw) {
    ma_elements.ma_empty.hidden = true;
    ma_elements.ma_result.hidden = false;

    ma_elements.ma_sentiment.textContent = ma_data.sentiment || "—";
    ma_elements.ma_score.textContent = `${ma_data.score ?? "—"} / 100`;

    ma_elements.ma_keywords.replaceChildren();
    const ma_tags = Array.isArray(ma_data.keywords) ? ma_data.keywords : [];
    ma_tags.forEach((ma_keyword) => {
      const ma_tag = document.createElement("em");
      ma_tag.textContent = String(ma_keyword);
      ma_elements.ma_keywords.appendChild(ma_tag);
    });

    ma_elements.ma_summary.textContent = ma_data.summary || "—";
    ma_elements.ma_suggestion.textContent = ma_data.suggestion || "—";
    ma_elements.ma_json.textContent = JSON.stringify(ma_raw, null, 2);
  }

  /* ---------------- 从大模型回复中提取 JSON ---------------- */
  function ma_extractJson(ma_text) {
    const ma_cleaned = String(ma_text).replace(/```json|```/gi, "").trim();
    const ma_start = ma_cleaned.indexOf("{");
    const ma_end = ma_cleaned.lastIndexOf("}");
    if (ma_start < 0 || ma_end <= ma_start) {
      throw new Error("大模型返回的内容不是 JSON。");
    }
    return JSON.parse(ma_cleaned.slice(ma_start, ma_end + 1));
  }

  /* ---------------- 提交 ---------------- */
  async function ma_submit(ma_event) {
    ma_event.preventDefault();
    if (ma_elements.ma_submit.disabled) {
      return;
    }

    const ma_text = ma_elements.ma_text.value.trim();
    if (ma_text.length < 10) {
      ma_elements.ma_textError.textContent = "评论内容至少需要 10 个字符。";
      ma_elements.ma_text.classList.add("is-invalid");
      ma_elements.ma_text.focus();
      return;
    }
    ma_elements.ma_textError.textContent = "";
    ma_elements.ma_text.classList.remove("is-invalid");

    const ma_mode = ma_elements.ma_mode.value;
    ma_elements.ma_submit.disabled = true;
    ma_elements.ma_submit.textContent = "分析中…";
    ma_setStatus("正在调用大模型，请稍候…", false);

    try {
      if (ma_mode === "mock") {
        console.log("【大模型 · 模拟请求】", { ma_mode: "mock", ma_text: ma_text });
        await new Promise((ma_resolve) => window.setTimeout(ma_resolve, 600));
        const ma_result = ma_mockAnalyze(ma_text);
        console.log("【大模型 · 模拟返回】", ma_result);
        ma_renderResult(ma_result, ma_result);
        ma_setStatus("分析完成（离线模拟接口）。", false);
      } else {
        const ma_prompt = [
          "你是电商评论分析助手。请只输出 JSON，不要输出多余文字。",
          "JSON 字段：sentiment（好评/中评/差评）、score（0-100 整数）、keywords（字符串数组，最多 5 个）、summary（不超过 60 字）、suggestion（不超过 60 字）。",
          `评论内容：${ma_text}`
        ].join("\n");

        const ma_payload = {
          ma_messages: [{ role: "user", content: ma_prompt }]
        };
        console.log("【大模型 · 真实请求】POST /api/chat", ma_payload);

        const ma_response = await window.fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ma_payload)
        });
        const ma_result = await ma_response.json();
        console.log("【大模型 · 真实返回】", ma_result);

        if (ma_result.code !== 0) {
          throw new Error(ma_result.msg || "大模型接口返回失败。");
        }

        const ma_parsed = ma_extractJson(ma_result.data.ma_reply);
        console.log("【大模型 · 解析后的 JSON】", ma_parsed);
        ma_renderResult(ma_parsed, ma_parsed);
        ma_setStatus("分析完成（真实大模型接口）。", false);
      }
    } catch (ma_error) {
      console.error("调用大模型失败：", ma_error);
      ma_setStatus(`调用失败：${ma_error.message}。可切换为离线模拟接口重试。`, true);
    } finally {
      ma_elements.ma_submit.disabled = false;
      ma_elements.ma_submit.textContent = "开始分析";
    }
  }

  /* ---------------- 事件 ---------------- */
  ma_elements.ma_form.addEventListener("submit", ma_submit);

  ma_elements.ma_text.addEventListener("input", () => {
    if (ma_elements.ma_text.classList.contains("is-invalid")) {
      const ma_text = ma_elements.ma_text.value.trim();
      ma_elements.ma_textError.textContent = ma_text.length >= 10 ? "" : "评论内容至少需要 10 个字符。";
      ma_elements.ma_text.classList.toggle("is-invalid", ma_text.length < 10);
    }
  });

  ma_elements.ma_sample.addEventListener("click", () => {
    ma_sampleIndex = (ma_sampleIndex + 1) % ma_samples.length;
    ma_elements.ma_text.value = ma_samples[ma_sampleIndex];
    ma_elements.ma_textError.textContent = "";
    ma_elements.ma_text.classList.remove("is-invalid");
  });

  ma_elements.ma_mode.addEventListener("change", () => {
    ma_elements.ma_modeLabel.textContent = ma_elements.ma_mode.value === "mock"
      ? "当前模式：离线模拟接口"
      : "当前模式：真实大模型接口（需启动 backend，端口 8422）";
  });
})();
