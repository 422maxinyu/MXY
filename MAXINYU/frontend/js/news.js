/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） */
(() => {
  const ma_apiUrl = new URL("/api/news", window.location.href);
  const ma_apiLink = document.querySelector("#ma_news-api-link");
  const ma_newsList = document.querySelector("#ma_news-list");
  const ma_newsTotal = document.querySelector("#ma_news-total");
  const ma_newsStatus = document.querySelector("#ma_news-status");
  const ma_newsJson = document.querySelector("#ma_news-json");
  const ma_dateFormatter = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  ma_apiLink.href = ma_apiUrl.href;
  ma_apiLink.textContent = ma_apiUrl.href;

  function ma_formatDate(ma_value) {
    const ma_date = new Date(ma_value);
    return Number.isNaN(ma_date.getTime()) ? String(ma_value) : ma_dateFormatter.format(ma_date);
  }

  function ma_createNewsCard(ma_news) {
    const ma_article = document.createElement("article");
    const ma_meta = document.createElement("div");
    const ma_category = document.createElement("span");
    const ma_time = document.createElement("time");
    const ma_title = document.createElement("h3");
    const ma_summary = document.createElement("p");
    const ma_source = document.createElement("span");

    ma_article.className = "ma_news-card";
    ma_meta.className = "ma_news-meta";
    ma_category.className = "ma_news-category";
    ma_category.textContent = ma_news.ma_category;
    ma_time.className = "ma_news-time";
    ma_time.dateTime = ma_news.ma_published_at;
    ma_time.textContent = ma_formatDate(ma_news.ma_published_at);
    ma_title.className = "ma_news-title";
    ma_title.textContent = ma_news.ma_title;
    ma_summary.className = "ma_news-summary";
    ma_summary.textContent = ma_news.ma_summary;
    ma_source.className = "ma_news-source";
    ma_source.textContent = `来源：${ma_news.ma_source}`;

    ma_meta.append(ma_category, ma_time);
    ma_article.append(ma_meta, ma_title, ma_summary, ma_source);
    return ma_article;
  }

  async function ma_loadNews() {
    try {
      const ma_response = await fetch(ma_apiUrl);
      const ma_result = await ma_response.json();
      ma_newsJson.textContent = JSON.stringify(ma_result, null, 2);

      if (!ma_response.ok || ma_result.code !== 0) {
        console.error("获取科技新闻失败：", ma_result);
        ma_newsTotal.textContent = "加载失败";
        ma_newsStatus.textContent = ma_result.msg || "新闻加载失败，请稍后重试。";
        ma_newsStatus.classList.add("ma_news-status--error");
        ma_newsList.replaceChildren();
        return;
      }

      console.log("科技新闻接口返回数据：", ma_result);
      const ma_news = ma_result.data.ma_news;
      ma_newsTotal.textContent = `${ma_result.data.ma_total} 条`;
      ma_newsStatus.textContent = ma_result.msg;
      ma_newsList.replaceChildren(
        ...ma_news.map(ma_createNewsCard)
      );

      if (ma_news.length === 0) {
        ma_newsList.innerHTML = '<p class="ma_news-empty">数据库中暂时没有已发布的科技新闻。</p>';
      }
    } catch (ma_error) {
      console.error("请求科技新闻接口失败：", ma_error);
      ma_newsTotal.textContent = "加载失败";
      ma_newsStatus.textContent = "无法连接后端，请确认服务和数据库已启动。";
      ma_newsStatus.classList.add("ma_news-status--error");
      ma_newsList.replaceChildren();
      ma_newsJson.textContent = ma_error.message;
    }
  }

  ma_loadNews();
})();
