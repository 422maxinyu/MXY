/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） */
(() => {
  const ma_apiUrl = new URL("/api/gallery", window.location.href);
  const ma_apiLink = document.querySelector("#ma_gallery-api-link");
  const ma_galleryGrid = document.querySelector("#ma_gallery-grid");
  const ma_galleryTotal = document.querySelector("#ma_gallery-total");
  const ma_galleryStatus = document.querySelector("#ma_gallery-status");
  const ma_galleryJson = document.querySelector("#ma_gallery-json");
  const ma_currencyFormatter = new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  });

  ma_apiLink.href = ma_apiUrl.href;
  ma_apiLink.textContent = ma_apiUrl.href;

  function ma_createGalleryCard(ma_item, ma_index) {
    const ma_article = document.createElement("article");
    const ma_imageLink = document.createElement("a");
    const ma_image = document.createElement("img");
    const ma_imageLabel = document.createElement("span");
    const ma_content = document.createElement("div");
    const ma_meta = document.createElement("div");
    const ma_category = document.createElement("span");
    const ma_number = document.createElement("span");
    const ma_title = document.createElement("h3");
    const ma_description = document.createElement("p");
    const ma_footer = document.createElement("div");
    const ma_price = document.createElement("strong");
    const ma_details = document.createElement("span");

    ma_article.className = "ma_gallery-card";
    ma_imageLink.className = "ma_gallery-image-link";
    ma_imageLink.href = ma_item.ma_image_url;
    ma_imageLink.target = "_blank";
    ma_imageLink.rel = "noopener";
    ma_image.alt = ma_item.ma_title;
    ma_image.src = ma_item.ma_image_url;
    ma_image.loading = "lazy";
    ma_image.decoding = "async";
    ma_imageLabel.className = "ma_gallery-image-label";
    ma_imageLabel.textContent = "MI COLLECTION";
    ma_imageLink.append(ma_image, ma_imageLabel);

    ma_content.className = "ma_gallery-content";
    ma_meta.className = "ma_gallery-meta";
    ma_category.className = "ma_gallery-category";
    ma_category.textContent = ma_item.ma_category;
    ma_number.className = "ma_gallery-number";
    ma_number.textContent = `NO. ${String(ma_index + 1).padStart(2, "0")}`;
    ma_meta.append(ma_category, ma_number);

    ma_title.className = "ma_gallery-card-title";
    ma_title.textContent = ma_item.ma_title;
    ma_description.className = "ma_gallery-description";
    ma_description.textContent = ma_item.ma_description;

    ma_footer.className = "ma_gallery-card-footer";
    ma_price.className = "ma_gallery-price";
    ma_price.textContent = ma_currencyFormatter.format(ma_item.ma_price);
    ma_details.className = "ma_gallery-detail-hint";
    ma_details.textContent = "精选好物";
    ma_footer.append(ma_price, ma_details);

    ma_content.append(ma_meta, ma_title, ma_description, ma_footer);
    ma_article.append(ma_imageLink, ma_content);
    return ma_article;
  }

  async function ma_loadGalleryItems() {
    try {
      const ma_response = await fetch(ma_apiUrl);
      const ma_result = await ma_response.json();
      ma_galleryJson.textContent = JSON.stringify(ma_result, null, 2);

      if (!ma_response.ok || ma_result.code !== 0) {
        console.error("获取图文列表失败：", ma_result);
        ma_galleryTotal.textContent = "加载失败";
        ma_galleryStatus.textContent = ma_result.msg || "图文列表加载失败，请稍后重试。";
        ma_galleryStatus.classList.add("ma_gallery-status--error");
        ma_galleryGrid.replaceChildren();
        return;
      }

      console.log("图文列表接口返回数据：", ma_result);
      const ma_items = ma_result.data.ma_items;
      ma_galleryTotal.textContent = `${ma_result.data.ma_total} 件`;
      ma_galleryStatus.textContent = ma_result.msg;
      ma_galleryGrid.replaceChildren(...ma_items.map(ma_createGalleryCard));

      if (ma_items.length === 0) {
        const ma_empty = document.createElement("p");
        ma_empty.className = "ma_gallery-empty";
        ma_empty.textContent = "目前还没有上架的精选好物。";
        ma_galleryGrid.append(ma_empty);
      }
    } catch (ma_error) {
      console.error("请求图文列表接口失败：", ma_error);
      ma_galleryTotal.textContent = "加载失败";
      ma_galleryStatus.textContent = "无法连接后端，请确认服务和数据库已启动。";
      ma_galleryStatus.classList.add("ma_gallery-status--error");
      ma_galleryGrid.replaceChildren();
      ma_galleryJson.textContent = ma_error.message;
    }
  }

  ma_loadGalleryItems();
})();
