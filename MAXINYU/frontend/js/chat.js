/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-16 | 大模型：Trae */
(() => {
  const ma_form = document.querySelector("#ma_chat-form");
  const ma_input = document.querySelector("#ma_chat-input");
  const ma_submit = document.querySelector("#ma_chat-submit");
  const ma_submitLabel = document.querySelector("#ma_chat-submit-label");
  const ma_messagesElement = document.querySelector("#ma_chat-messages");
  const ma_status = document.querySelector("#ma_chat-status");

  const ma_voiceBtn = document.querySelector("#ma_chat-voice");
  const ma_voiceTip = document.querySelector("#ma_chat-voice-tip");
  const ma_voiceCountdown = document.querySelector("#ma_chat-voice-countdown");

  const ma_imageBtn = document.querySelector("#ma_chat-image");
  const ma_imageInput = document.querySelector("#ma_chat-image-input");
  const ma_imagePreview = document.querySelector("#ma_chat-image-preview");
  const ma_imageThumb = document.querySelector("#ma_chat-image-thumb");
  const ma_imageName = document.querySelector("#ma_chat-image-name");
  const ma_imageSize = document.querySelector("#ma_chat-image-size");
  const ma_imageRemove = document.querySelector("#ma_chat-image-remove");

  const ma_messages = [];
  const ma_maxImageBytes = 10 * 1024 * 1024;
  let ma_selectedImage = null; // { ma_file, ma_base64 }

  // ========== 消息渲染 ==========
  function ma_addMessage(ma_role, ma_content, ma_imageUrl) {
    const ma_item = document.createElement("li");
    const ma_avatar = document.createElement("span");
    const ma_bubble = document.createElement("p");
    const ma_isAssistant = ma_role === "assistant";

    ma_item.className = `ma_chat-message ma_chat-message--${ma_role}`;
    ma_avatar.className = "ma_chat-avatar";
    ma_avatar.setAttribute("aria-hidden", "true");
    ma_avatar.textContent = ma_isAssistant ? "AI" : "我";
    ma_bubble.className = "ma_chat-bubble";

    if (ma_imageUrl) {
      const ma_img = document.createElement("img");
      ma_img.className = "ma_chat-image-inline";
      ma_img.src = ma_imageUrl;
      ma_img.alt = "用户上传的图片";
      ma_bubble.append(ma_img);
    }
    if (ma_content) {
      ma_bubble.append(ma_content);
    }

    ma_item.append(ma_avatar, ma_bubble);
    ma_messagesElement.append(ma_item);
    ma_messagesElement.scrollTop = ma_messagesElement.scrollHeight;
    return { ma_item, ma_bubble };
  }

  // ========== 图片选择 ==========
  function ma_formatSize(ma_bytes) {
    if (ma_bytes < 1024) return `${ma_bytes} B`;
    if (ma_bytes < 1024 * 1024) return `${(ma_bytes / 1024).toFixed(1)} KB`;
    return `${(ma_bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function ma_readImageAsBase64(ma_file) {
    return new Promise((ma_resolve, ma_reject) => {
      const ma_reader = new FileReader();
      ma_reader.onload = () => {
        const ma_result = ma_reader.result;
        if (typeof ma_result !== "string") return ma_reject(new Error("文件读取失败"));
        const ma_comma = ma_result.indexOf(",");
        ma_resolve(ma_comma >= 0 ? ma_result.slice(ma_comma + 1) : ma_result);
      };
      ma_reader.onerror = () => ma_reject(new Error("文件读取失败"));
      ma_reader.readAsDataURL(ma_file);
    });
  }

  async function ma_selectImage(ma_file) {
    if (!ma_file) return ma_clearImage();
    if (!ma_file.type.startsWith("image/")) {
      ma_status.textContent = "请选择图片文件（jpg / png / webp 等）。";
      return;
    }
    if (ma_file.size > ma_maxImageBytes) {
      ma_status.textContent = "图片超过 10 MB，请使用更小的图片。";
      return;
    }
    try {
      const ma_base64 = await ma_readImageAsBase64(ma_file);
      ma_selectedImage = { ma_file, ma_base64 };
      ma_imageThumb.src = URL.createObjectURL(ma_file);
      ma_imageName.textContent = ma_file.name;
      ma_imageSize.textContent = ma_formatSize(ma_file.size);
      ma_imagePreview.hidden = false;
      ma_imageBtn.classList.add("is-selected");
      ma_status.textContent = `已选择 ${ma_file.name}，可直接发送，或补充问题让 AI 分析。`;
      ma_input.focus();
    } catch (ma_error) {
      ma_status.textContent = "图片读取失败，请重新选择。";
    }
  }

  function ma_clearImage() {
    if (ma_selectedImage && ma_selectedImage.ma_file) {
      URL.revokeObjectURL(ma_imageThumb.src);
    }
    ma_selectedImage = null;
    ma_imageInput.value = "";
    ma_imagePreview.hidden = true;
    ma_imageBtn.classList.remove("is-selected");
  }

  // ========== 录音逻辑（保留原有） ==========
  let ma_mediaRecorder = null;
  let ma_recordedChunks = [];
  let ma_recordTimer = null;
  const ma_maxRecordMs = 60 * 1000;
  let ma_isRecording = false;
  let ma_stream = null;

  function ma_setRecordingUI(ma_active) {
    ma_isRecording = ma_active;
    ma_voiceBtn.classList.toggle("is-recording", ma_active);
    ma_voiceTip.hidden = !ma_active;
    // 录音时禁用发送和图片按钮，防止状态混乱
    ma_submit.disabled = ma_active;
    ma_imageBtn.disabled = ma_active;
    if (!ma_active) { clearInterval(ma_recordTimer); ma_recordTimer = null; }
  }

  function ma_formatSeconds(ma_ms) { return Math.floor(ma_ms / 1000); }

  async function ma_startRecording() {
    if (ma_isRecording || ma_voiceBtn.disabled) return;
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== "function") {
      ma_status.textContent = "当前浏览器不支持麦克风录音，请使用 Chrome / Edge。";
      return;
    }
    try {
      ma_stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (ma_error) {
      ma_status.textContent = "无法访问麦克风，请允许麦克风权限后重试。";
      return;
    }
    ma_recordedChunks = [];
    const ma_mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
    let ma_selectedType = "";
    for (const ma_type of ma_mimeTypes) {
      if (typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(ma_type)) {
        ma_selectedType = ma_type; break;
      }
    }
    try {
      ma_mediaRecorder = ma_selectedType
        ? new MediaRecorder(ma_stream, { mimeType: ma_selectedType })
        : new MediaRecorder(ma_stream);
    } catch (ma_error) {
      ma_status.textContent = "录音器初始化失败。";
      ma_cleanupStream();
      return;
    }
    ma_mediaRecorder.ondataavailable = (ma_event) => {
      if (ma_event.data && ma_event.data.size > 0) ma_recordedChunks.push(ma_event.data);
    };
    ma_mediaRecorder.onstop = ma_handleRecordingStop;
    ma_recordStartTime = Date.now();
    ma_mediaRecorder.start(100);
    ma_setRecordingUI(true);
    ma_status.textContent = "正在录音…再次点击停止，或等待 60 秒自动停止。";
    ma_recordTimer = setInterval(() => {
      const ma_elapsed = Date.now() - ma_recordStartTime;
      ma_voiceCountdown.textContent = `录音中 ${ma_formatSeconds(ma_elapsed)}s`;
      if (ma_elapsed >= ma_maxRecordMs) ma_stopRecording();
    }, 250);
  }

  function ma_stopRecording() {
    if (!ma_isRecording) return;
    ma_setRecordingUI(false);
    if (ma_mediaRecorder && ma_mediaRecorder.state !== "inactive") ma_mediaRecorder.stop();
    ma_cleanupStream();
  }

  function ma_cleanupStream() {
    if (ma_stream) { ma_stream.getTracks().forEach((ma_t) => ma_t.stop()); ma_stream = null; }
  }

  async function ma_blobToBase64(ma_blob) {
    return new Promise((ma_resolve, ma_reject) => {
      const ma_reader = new FileReader();
      ma_reader.onload = () => {
        const ma_comma = (typeof ma_reader.result === "string") ? ma_reader.result.indexOf(",") : -1;
        ma_resolve(ma_comma >= 0 ? ma_reader.result.slice(ma_comma + 1) : ma_reader.result);
      };
      ma_reader.onerror = () => ma_reject(new Error("FileReader 失败"));
      ma_reader.readAsDataURL(ma_blob);
    });
  }

  async function ma_handleRecordingStop() {
    const ma_blob = new Blob(ma_recordedChunks, { type: (ma_mediaRecorder && ma_mediaRecorder.mimeType) || "audio/webm" });
    ma_recordedChunks = [];
    if (!ma_blob.size) { ma_status.textContent = "录音数据为空。"; return; }
    ma_voiceBtn.disabled = true;
    ma_input.disabled = true;
    ma_status.textContent = "正在上传并识别语音…";
    try {
      const ma_base64 = await ma_blobToBase64(ma_blob);
      console.log("发送语音识别请求：", { ma_audio_size: ma_blob.size });
      const ma_response = await fetch("/api/asr/transcribe", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ma_file_name: "recording.webm", ma_content: ma_base64 })
      });
      const ma_result = await ma_response.json();
      console.log("语音识别接口返回数据：", ma_result);
      if (!ma_response.ok || ma_result.code !== 0) throw new Error(ma_result.msg || `语音识别失败`);
      const ma_text = (ma_result.data && ma_result.data.ma_text) || "";
      if (!ma_text.trim()) { ma_status.textContent = "未识别到有效语音内容。"; return; }
      ma_input.value = ma_text.trim();
      ma_input.focus();
      ma_status.textContent = `已识别 ${ma_text.length} 字，可编辑后发送。`;
    } catch (ma_error) {
      console.error("语音识别失败：", ma_error);
      ma_status.textContent = ma_error.message || "语音识别失败。";
    } finally {
      ma_voiceBtn.disabled = false;
      ma_input.disabled = false;
    }
  }

  // ========== 发送消息（统一处理纯文本、纯图片、图文混合） ==========
  function ma_setLoading(ma_loading, ma_label) {
    ma_submit.disabled = ma_loading;
    ma_input.disabled = ma_loading;
    ma_voiceBtn.disabled = ma_loading;
    ma_imageBtn.disabled = ma_loading;
    ma_submitLabel.textContent = ma_loading ? (ma_label || "处理中") : "发送";
  }

  async function ma_sendMessage(ma_event) {
    ma_event.preventDefault();
    const ma_prompt = ma_input.value.trim();
    const ma_hasImage = !!ma_selectedImage;

    if (!ma_prompt && !ma_hasImage) { ma_input.focus(); return; }
    if (ma_submit.disabled) return;

    // 图片识别路径：调用专门的 vision API（不走 chat /messages 历史上下文）
    if (ma_hasImage) {
      ma_setLoading(true, "识别中");
      const ma_imageUrl = ma_imageThumb.src; // data URL 用于显示
      ma_addMessage("user", ma_prompt || undefined, ma_imageUrl);
      ma_input.value = "";
      const ma_reply = ma_addMessage("assistant", "正在识别图片内容…").ma_bubble;
      ma_status.textContent = "正在调用视觉模型分析图片…";

      try {
        const ma_payload = {
          ma_file_name: ma_selectedImage.ma_file.name,
          ma_content: ma_selectedImage.ma_base64,
          ma_question: ma_prompt || ""
        };
        console.log("发送图片识别请求：", { ma_file: ma_payload.ma_file_name, ma_size: ma_selectedImage.ma_file.size, ma_question: ma_payload.ma_question.slice(0, 60) });
        const ma_response = await fetch("/api/vision/analyze", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ma_payload)
        });
        const ma_result = await ma_response.json();
        console.log("图片识别接口返回数据：", ma_result);
        if (!ma_response.ok || ma_result.code !== 0) throw new Error(ma_result.msg || `图片识别失败`);
        const ma_desc = ma_result.data && ma_result.data.ma_description;
        if (!ma_desc) throw new Error("图片识别结果为空。");
        ma_reply.textContent = ma_desc;
        ma_status.textContent = ma_result.msg || "图片识别完成。";
      } catch (ma_error) {
        console.error("图片识别失败：", ma_error);
        ma_reply.textContent = "识别失败：" + (ma_error.message || "请稍后重试。");
        ma_status.textContent = ma_error.message || "图片识别失败。";
      } finally {
        ma_clearImage();
        ma_setLoading(false);
        ma_input.focus();
      }
      return;
    }

    // 纯文本聊天路径（沿用原有）
    if (ma_messages.length >= 20) ma_messages.splice(0, 2);
    ma_messages.push({ role: "user", content: ma_prompt });
    ma_addMessage("user", ma_prompt);
    const ma_replyBubble = ma_addMessage("assistant", "正在思考…").ma_bubble;
    ma_setLoading(true, "思考中");
    ma_status.textContent = "正在连接 AI 助手…";

    console.log("发送给 AI 的提示词：", [...ma_messages]);
    try {
      const ma_response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ma_messages: [...ma_messages] })
      });
      const ma_result = await ma_response.json();
      console.log("AI 接口返回数据：", ma_result);
      if (!ma_response.ok || ma_result.code !== 0) throw new Error(ma_result.msg || `聊天请求失败`);
      const ma_reply = ma_result.data.ma_reply;
      if (typeof ma_reply !== "string" || !ma_reply.trim()) throw new Error("AI 返回内容为空。");
      ma_messages.push({ role: "assistant", content: ma_reply });
      ma_replyBubble.textContent = ma_reply;
      ma_status.textContent = ma_result.msg;
      ma_input.value = "";
    } catch (ma_error) {
      console.error("AI 聊天请求失败：", ma_error);
      ma_messages.pop();
      ma_replyBubble.textContent = "抱歉，出错了：" + (ma_error.message || "请稍后重试。");
      ma_status.textContent = ma_error.message || "暂时无法连接 AI 助手。";
    } finally {
      ma_setLoading(false);
      ma_input.focus();
    }
  }

  // ========== 事件绑定 ==========
  ma_voiceBtn.addEventListener("click", () => (ma_isRecording ? ma_stopRecording() : ma_startRecording()));
  ma_imageBtn.addEventListener("click", () => {
    if (ma_isRecording) {
      ma_status.textContent = "请先停止录音再选择图片。";
      ma_stopRecording();
      return;
    }
    ma_imageInput.click();
  });
  ma_imageInput.addEventListener("change", (ma_e) => ma_selectImage(ma_e.target.files[0]));
  ma_imageRemove.addEventListener("click", ma_clearImage);
  ma_form.addEventListener("submit", ma_sendMessage);
  ma_input.addEventListener("keydown", (ma_event) => {
    if (ma_event.key === "Enter" && !ma_event.shiftKey) { ma_event.preventDefault(); ma_form.requestSubmit(); }
    if (ma_event.key === "Escape" && ma_isRecording) { ma_stopRecording(); }
  });
  // Esc 键任何时候都能停录音
  document.addEventListener("keydown", (ma_event) => {
    if (ma_event.key === "Escape" && ma_isRecording) { ma_stopRecording(); }
  });

  window.addEventListener("beforeunload", () => {
    if (ma_isRecording) ma_stopRecording();
    ma_cleanupStream();
  });
})();
