/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-12 | 大模型：Copilot（具体模型名称未提供） */
(() => {
  const ma_endpoint = "/api/knowledge/chat";
  const ma_form = document.querySelector("#ma_service-form");
  const ma_input = document.querySelector("#ma_service-input");
  const ma_submit = document.querySelector("#ma_service-submit");
  const ma_messagesElement = document.querySelector("#ma_service-messages");
  const ma_status = document.querySelector("#ma_service-status");
  const ma_history = [];

  function ma_addMessage(ma_role, ma_content, ma_sources) {
    const ma_item = document.createElement("li");
    const ma_avatar = document.createElement("span");
    const ma_answer = document.createElement("div");
    const ma_bubble = document.createElement("p");
    const ma_isAssistant = ma_role === "assistant";

    ma_item.className = `ma_chat-message ma_chat-message--${ma_role}`;
    ma_avatar.className = "ma_chat-avatar";
    ma_avatar.textContent = ma_isAssistant ? "AI" : "我";
    ma_avatar.setAttribute("aria-hidden", "true");
    ma_answer.className = "ma_service-answer";
    ma_bubble.className = "ma_chat-bubble";
    ma_bubble.textContent = ma_content;
    ma_answer.append(ma_bubble);

    if (ma_sources && ma_sources.length) {
      const ma_sourceLine = document.createElement("span");
      ma_sourceLine.className = "ma_service-sources";
      ma_sourceLine.textContent = `参考资料：${ma_sources.map((ma_source) => ma_source.ma_name).join("、")}`;
      ma_answer.append(ma_sourceLine);
    }

    ma_item.append(ma_avatar, ma_answer);
    ma_messagesElement.append(ma_item);
    ma_messagesElement.scrollTop = ma_messagesElement.scrollHeight;
    return ma_item;
  }

  async function ma_sendQuestion(ma_event) {
    ma_event.preventDefault();
    const ma_question = ma_input.value.trim();
    if (!ma_question || ma_submit.disabled) {
      return;
    }

    while (ma_history.length > 8) {
      ma_history.splice(0, 2);
    }
    const ma_previousHistory = [...ma_history];
    const ma_userItem = ma_addMessage("user", ma_question);
    const ma_pendingItem = ma_addMessage("assistant", "正在检索知识库并整理答案…");
    const ma_requestBody = { ma_question, ma_history: ma_previousHistory };
    ma_submit.disabled = true;
    ma_input.disabled = true;
    ma_status.textContent = "正在检索资料并咨询 AI…";
    console.log("发送给知识库客服的提示词：", ma_requestBody);

    try {
      const ma_response = await fetch(ma_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ma_requestBody)
      });
      const ma_result = await ma_response.json();
      console.log("知识库客服接口返回数据：", ma_result);
      if (!ma_response.ok || ma_result.code !== 0) {
        throw new Error(ma_result.msg || `客服请求失败（HTTP ${ma_response.status}）`);
      }

      ma_pendingItem.remove();
      ma_addMessage("assistant", ma_result.data.ma_reply, ma_result.data.ma_sources || []);
      ma_history.push(
        { role: "user", content: ma_question },
        { role: "assistant", content: ma_result.data.ma_reply }
      );
      while (ma_history.length > 10) {
        ma_history.splice(0, 2);
      }
      ma_status.textContent = ma_result.msg;
      ma_input.value = "";
    } catch (ma_error) {
      console.error("知识库客服请求失败：", ma_error);
      ma_userItem.remove();
      ma_pendingItem.remove();
      ma_input.value = ma_question;
      ma_status.textContent = ma_error.message || "客服暂时不可用，请检查后端服务和 AI 配置。";
    } finally {
      ma_submit.disabled = false;
      ma_input.disabled = false;
      ma_input.focus();
    }
  }

  ma_form.addEventListener("submit", ma_sendQuestion);
  ma_input.addEventListener("keydown", (ma_event) => {
    if (ma_event.key === "Enter" && !ma_event.shiftKey) {
      ma_event.preventDefault();
      ma_form.requestSubmit();
    }
  });
})();
