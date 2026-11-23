/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-12 | 大模型：Copilot（具体模型名称未提供） */
(() => {
  const ma_apiUrl = new URL("/api/knowledge", window.location.href);
  const ma_input = document.querySelector("#ma_upload-input");
  const ma_dropzone = document.querySelector("#ma_upload-dropzone");
  const ma_list = document.querySelector("#ma_knowledge-list");
  const ma_count = document.querySelector("#ma_knowledge-count");
  const ma_status = document.querySelector("#ma_knowledge-status");

  function ma_setStatus(ma_message, ma_isError) {
    ma_status.textContent = ma_message;
    ma_status.classList.toggle("ma_knowledge-status--error", ma_isError);
  }

  async function ma_readJson(ma_response) {
    const ma_result = await ma_response.json();
    console.log("知识库接口返回数据：", ma_result);
    if (!ma_response.ok || ma_result.code !== 0) {
      throw new Error(ma_result.msg || `请求失败（HTTP ${ma_response.status}）`);
    }
    return ma_result;
  }

  function ma_formatDate(ma_value) {
    const ma_date = new Date(ma_value);
    return Number.isNaN(ma_date.getTime())
      ? String(ma_value)
      : new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(ma_date);
  }

  function ma_renderDocuments(ma_documents) {
    ma_count.textContent = `${ma_documents.length} 个`;
    if (ma_documents.length === 0) {
      const ma_empty = document.createElement("li");
      ma_empty.className = "ma_knowledge-empty";
      ma_empty.textContent = "知识库还没有文件。上传 TXT 或 PDF 后，客服即可基于资料回答。";
      ma_list.replaceChildren(ma_empty);
      return;
    }

    ma_list.replaceChildren(...ma_documents.map((ma_document) => {
      const ma_item = document.createElement("li");
      const ma_fileIcon = document.createElement("span");
      const ma_details = document.createElement("span");
      const ma_name = document.createElement("strong");
      const ma_meta = document.createElement("span");
      const ma_delete = document.createElement("button");

      ma_item.className = "ma_knowledge-item";
      ma_fileIcon.className = "ma_knowledge-file-icon";
      ma_fileIcon.textContent = ma_document.ma_type;
      ma_fileIcon.setAttribute("aria-hidden", "true");
      ma_details.className = "ma_knowledge-details";
      ma_name.className = "ma_knowledge-name";
      ma_name.textContent = ma_document.ma_name;
      ma_meta.className = "ma_knowledge-meta";
      ma_meta.textContent = `${ma_document.ma_char_count.toLocaleString("zh-CN")} 字符 · ${ma_formatDate(ma_document.ma_uploaded_at)}`;
      ma_delete.className = "ma_knowledge-delete";
      ma_delete.type = "button";
      ma_delete.textContent = "删除";
      ma_delete.setAttribute("aria-label", `删除 ${ma_document.ma_name}`);
      ma_delete.addEventListener("click", () => ma_deleteDocument(ma_document));
      ma_details.append(ma_name, ma_meta);
      ma_item.append(ma_fileIcon, ma_details, ma_delete);
      return ma_item;
    }));
  }

  async function ma_loadDocuments() {
    try {
      const ma_response = await fetch(ma_apiUrl);
      const ma_result = await ma_readJson(ma_response);
      ma_renderDocuments(ma_result.data.ma_documents);
    } catch (ma_error) {
      console.error("读取知识库失败：", ma_error);
      ma_setStatus(ma_error.message || "无法读取知识库，请确认后端服务已启动。", true);
      ma_list.replaceChildren();
    }
  }

  async function ma_uploadFile(ma_file) {
    const ma_extension = ma_file.name.split(".").pop().toLowerCase();
    if (!["txt", "pdf"].includes(ma_extension)) {
      throw new Error(`${ma_file.name}：仅支持 TXT 和 PDF 文件。`);
    }
    if (!ma_file.size || ma_file.size > 6 * 1024 * 1024) {
      throw new Error(`${ma_file.name}：文件为空或超过 6 MB。`);
    }

    const ma_dataUrl = await new Promise((ma_resolve, ma_reject) => {
      const ma_reader = new FileReader();
      ma_reader.onload = () => ma_resolve(ma_reader.result);
      ma_reader.onerror = () => ma_reject(new Error(`${ma_file.name}：读取文件失败。`));
      ma_reader.readAsDataURL(ma_file);
    });
    const ma_payload = {
      ma_name: ma_file.name,
      ma_content: ma_dataUrl.slice(ma_dataUrl.indexOf(",") + 1)
    };
    console.log("上传知识库文件：", { ma_name: ma_file.name, ma_size: ma_file.size, ma_type: ma_extension });
    const ma_response = await fetch(ma_apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ma_payload)
    });
    return ma_readJson(ma_response);
  }

  async function ma_handleFiles(ma_files) {
    if (!ma_files.length) {
      return;
    }
    ma_input.disabled = true;
    let ma_uploaded = 0;
    const ma_errors = [];
    for (const ma_file of ma_files) {
      ma_setStatus(`正在解析并上传：${ma_file.name}`);
      try {
        await ma_uploadFile(ma_file);
        ma_uploaded += 1;
      } catch (ma_error) {
        console.error("上传知识库文件失败：", ma_error);
        ma_errors.push(ma_error.message || `${ma_file.name} 上传失败。`);
      }
    }
    ma_input.disabled = false;
    ma_input.value = "";
    await ma_loadDocuments();
    if (ma_errors.length) {
      ma_setStatus(`${ma_uploaded} 个文件上传成功；${ma_errors.join("；")}`, true);
    } else {
      ma_setStatus(`${ma_uploaded} 个文件已解析并加入知识库。`, false);
    }
  }

  async function ma_deleteDocument(ma_document) {
    if (!window.confirm(`确定从知识库中删除“${ma_document.ma_name}”吗？`)) {
      return;
    }
    try {
      const ma_deleteUrl = new URL(`${ma_apiUrl.pathname}/${encodeURIComponent(ma_document.ma_id)}`, ma_apiUrl);
      const ma_response = await fetch(ma_deleteUrl, { method: "DELETE" });
      await ma_readJson(ma_response);
      ma_setStatus(`已删除：${ma_document.ma_name}`, false);
      await ma_loadDocuments();
    } catch (ma_error) {
      console.error("删除知识库文件失败：", ma_error);
      ma_setStatus(ma_error.message || "删除失败，请稍后重试。", true);
    }
  }

  ma_input.addEventListener("change", () => ma_handleFiles(Array.from(ma_input.files)));
  ma_dropzone.addEventListener("dragover", (ma_event) => {
    ma_event.preventDefault();
    ma_dropzone.classList.add("ma_upload-dropzone--active");
  });
  ma_dropzone.addEventListener("dragleave", () => ma_dropzone.classList.remove("ma_upload-dropzone--active"));
  ma_dropzone.addEventListener("drop", (ma_event) => {
    ma_event.preventDefault();
    ma_dropzone.classList.remove("ma_upload-dropzone--active");
    ma_handleFiles(Array.from(ma_event.dataTransfer.files));
  });

  ma_loadDocuments();
})();
