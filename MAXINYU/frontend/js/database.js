/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） */
(() => {
  const ma_form = document.querySelector("#ma_database-form");
  const ma_username = document.querySelector("#ma_username");
  const ma_password = document.querySelector("#ma_password");
  const ma_submit = document.querySelector("#ma_database-submit");
  const ma_message = document.querySelector("#ma_database-message");

  function ma_showMessage(ma_text, ma_state) {
    ma_message.textContent = ma_text;
    ma_message.className = `ma_database-message ma_database-message--${ma_state}`;
  }

  async function ma_connectDatabase(ma_event) {
    ma_event.preventDefault();
    ma_submit.disabled = true;
    ma_showMessage("正在验证账号并连接数据库…", "pending");

    try {
      const ma_response = await fetch("/api/database/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ma_username: ma_username.value,
          ma_password: ma_password.value
        })
      });
      const ma_result = await ma_response.json();

      if (!ma_response.ok || ma_result.code !== 0) {
        console.error("数据库连接失败：", ma_result);
        ma_showMessage(ma_result.msg || "数据库连接失败，请检查账号和数据库服务。", "error");
        return;
      }

      console.log("服务器返回数据：", ma_result);
      ma_showMessage(ma_result.msg || "数据库连接成功。", "success");
    } catch (ma_error) {
      console.error("请求数据库连接接口失败：", ma_error);
      ma_showMessage("无法连接服务器，请确认后台服务已启动后重试。", "error");
    } finally {
      ma_password.value = "";
      ma_submit.disabled = false;
    }
  }

  ma_form.addEventListener("submit", ma_connectDatabase);
})();
