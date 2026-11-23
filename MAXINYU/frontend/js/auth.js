/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash */
/*
 * 登录 / 注册 / 个人中心 的页面逻辑
 *   KT3  考点：表单元素、自定义校验规则、失焦校验与错误提示
 *   KT20 考点：Canvas 绘制图形验证码（随机字符、旋转、干扰线、干扰点）
 *   KT25 考点：fetch 发送 JSON、localStorage 保存 token 维持登录状态
 */
(() => {
  "use strict";

  const ma_tokenKey = "ma_token";
  const ma_userKey = "ma_user";

  function ma_escapeHtml(ma_value) {
    return String(ma_value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function ma_setStatus(ma_element, ma_text, ma_type) {
    if (!ma_element) {
      return;
    }
    ma_element.textContent = ma_text;
    ma_element.className = "ma_auth-status";
    if (ma_type === "error") {
      ma_element.classList.add("ma_auth-status--error");
    } else if (ma_type === "success") {
      ma_element.classList.add("ma_auth-status--success");
    }
  }

  function ma_showNotice(ma_element, ma_type, ma_html) {
    if (!ma_element) {
      return;
    }
    ma_element.hidden = false;
    ma_element.className = `ma_auth-notice ma_auth-notice--${ma_type}`;
    ma_element.innerHTML = ma_html;
  }

  /* ============================================================
   * KT20：Canvas 图形验证码
   * ============================================================ */
  const ma_captchaChars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  function ma_createCaptcha(ma_canvas) {
    if (!ma_canvas) {
      return null;
    }
    const ma_context = ma_canvas.getContext("2d");
    const ma_palette = ["#a6b7ff", "#78e2d0", "#f0c37a", "#ff9ab0", "#c9d4f2"];
    const ma_width = 132;
    const ma_height = 46;
    let ma_code = "";

    function ma_paint() {
      const ma_ratio = Math.min(window.devicePixelRatio || 1, 2);
      ma_canvas.width = ma_width * ma_ratio;
      ma_canvas.height = ma_height * ma_ratio;
      ma_context.setTransform(ma_ratio, 0, 0, ma_ratio, 0, 0);
      ma_context.clearRect(0, 0, ma_width, ma_height);

      const ma_background = ma_context.createLinearGradient(0, 0, ma_width, ma_height);
      ma_background.addColorStop(0, "rgba(38, 46, 68, 0.96)");
      ma_background.addColorStop(1, "rgba(20, 25, 38, 0.96)");
      ma_context.fillStyle = ma_background;
      ma_context.fillRect(0, 0, ma_width, ma_height);

      /* 干扰线 */
      for (let ma_index = 0; ma_index < 5; ma_index += 1) {
        ma_context.beginPath();
        ma_context.strokeStyle = `rgba(155, 175, 255, ${0.12 + Math.random() * 0.18})`;
        ma_context.lineWidth = 1;
        ma_context.moveTo(Math.random() * ma_width, Math.random() * ma_height);
        ma_context.lineTo(Math.random() * ma_width, Math.random() * ma_height);
        ma_context.stroke();
      }

      /* 4 个随机字符：随机角度、字号、颜色 */
      ma_code = "";
      const ma_step = (ma_width - 28) / 4;
      for (let ma_index = 0; ma_index < 4; ma_index += 1) {
        const ma_char = ma_captchaChars[Math.floor(Math.random() * ma_captchaChars.length)];
        ma_code += ma_char;
        ma_context.save();
        ma_context.translate(14 + ma_index * ma_step + ma_step / 2, ma_height / 2 + 2);
        ma_context.rotate((Math.random() - 0.5) * 0.5);
        ma_context.font = `${21 + Math.floor(Math.random() * 5)}px "Segoe UI", "Microsoft YaHei", sans-serif`;
        ma_context.fillStyle = ma_palette[Math.floor(Math.random() * ma_palette.length)];
        ma_context.textAlign = "center";
        ma_context.textBaseline = "middle";
        ma_context.fillText(ma_char, 0, 0);
        ma_context.restore();
      }

      /* 干扰点 */
      for (let ma_index = 0; ma_index < 36; ma_index += 1) {
        ma_context.beginPath();
        ma_context.fillStyle = `rgba(200, 214, 245, ${0.1 + Math.random() * 0.25})`;
        ma_context.arc(
          Math.random() * ma_width,
          Math.random() * ma_height,
          Math.random() * 1.4 + 0.4,
          0,
          Math.PI * 2
        );
        ma_context.fill();
      }
    }

    ma_paint();
    ma_canvas.addEventListener("click", ma_paint);
    ma_canvas.parentElement.addEventListener("click", (ma_event) => {
      if (ma_event.target !== ma_canvas) {
        ma_paint();
      }
    });

    return {
      ma_refresh: ma_paint,
      ma_getCode: () => ma_code,
      ma_verify: (ma_value) => String(ma_value).trim().toUpperCase() === ma_code
    };
  }

  /* ============================================================
   * KT3：表单校验规则
   * ============================================================ */
  const ma_rules = {
    ma_username(ma_value) {
      const ma_text = ma_value.trim();
      if (!ma_text) {
        return "请输入用户名。";
      }
      if (!/^[A-Za-z0-9_]{3,16}$/.test(ma_text)) {
        return "用户名需为 3-16 位字母、数字或下划线。";
      }
      return "";
    },
    ma_password(ma_value) {
      if (!ma_value) {
        return "请输入密码。";
      }
      if (!/^(?=.*[A-Za-z])(?=.*\d)[\S]{6,20}$/.test(ma_value)) {
        return "密码需为 6-20 位，且同时包含字母和数字。";
      }
      return "";
    },
    ma_loginPassword(ma_value) {
      if (!ma_value) {
        return "请输入密码。";
      }
      return "";
    },
    ma_email(ma_value) {
      const ma_text = ma_value.trim();
      if (!ma_text) {
        return "请输入邮箱。";
      }
      if (!/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(ma_text)) {
        return "邮箱格式不正确，例如 name@example.com。";
      }
      return "";
    },
    ma_phone(ma_value) {
      const ma_text = ma_value.trim();
      if (!ma_text) {
        return "请输入手机号。";
      }
      if (!/^1[3-9]\d{9}$/.test(ma_text)) {
        return "手机号需为 11 位数字，且以 13-19 开头。";
      }
      return "";
    }
  };

  function ma_bindField(ma_input, ma_error, ma_rule) {
    if (!ma_input || !ma_error) {
      return () => true;
    }
    const ma_show = () => {
      const ma_message = ma_rule(ma_input.value);
      ma_error.textContent = ma_message;
      ma_input.classList.toggle("is-invalid", Boolean(ma_message));
      ma_input.setAttribute("aria-invalid", ma_message ? "true" : "false");
      return !ma_message;
    };
    ma_input.addEventListener("blur", ma_show);
    ma_input.addEventListener("input", () => {
      if (ma_input.classList.contains("is-invalid")) {
        ma_show();
      }
    });
    return ma_show;
  }

  function ma_bindPasswordToggles() {
    document.querySelectorAll("[data-ma-password-toggle]").forEach((ma_button) => {
      ma_button.addEventListener("click", () => {
        const ma_selector = ma_button.getAttribute("data-ma-password-toggle");
        const ma_target = ma_selector ? document.querySelector(ma_selector) : null;
        if (!ma_target) {
          return;
        }
        const ma_hidden = ma_target.type === "password";
        ma_target.type = ma_hidden ? "text" : "password";
        ma_button.textContent = ma_hidden ? "隐藏" : "显示";
        ma_button.setAttribute("aria-label", ma_hidden ? "隐藏密码" : "显示密码");
        ma_target.focus();
      });
    });
  }

  /* ============================================================
   * 登录页
   * ============================================================ */
  function ma_initLoginPage() {
    const ma_form = document.querySelector("#ma_login-form");
    if (!ma_form) {
      return;
    }

    const ma_captcha = ma_createCaptcha(document.querySelector("#ma_login-captcha-canvas"));
    const ma_notice = document.querySelector("#ma_login-notice");
    const ma_status = document.querySelector("#ma_login-status");
    const ma_submit = document.querySelector("#ma_login-submit");
    const ma_username = document.querySelector("#ma_login-username");
    const ma_password = document.querySelector("#ma_login-password");
    const ma_captchaInput = document.querySelector("#ma_login-captcha");

    const ma_checks = [
      ma_bindField(ma_username, document.querySelector("#ma_login-username-error"), ma_rules.ma_username),
      ma_bindField(ma_password, document.querySelector("#ma_login-password-error"), ma_rules.ma_loginPassword),
      ma_bindField(ma_captchaInput, document.querySelector("#ma_login-captcha-error"), (ma_value) => {
        if (!ma_value.trim()) {
          return "请输入图形验证码。";
        }
        if (ma_captcha && !ma_captcha.ma_verify(ma_value)) {
          return "验证码不正确，请重新输入。";
        }
        return "";
      })
    ];

    /* 从注册页跳转过来时回填用户名并提示 */
    const ma_search = new URLSearchParams(window.location.search);
    const ma_prefill = ma_search.get("ma_username");
    if (ma_prefill) {
      ma_username.value = ma_prefill;
    }
    if (ma_search.get("ma_registered") === "1") {
      ma_showNotice(
        ma_notice,
        "success",
        `注册成功，请使用账号 <strong>${ma_escapeHtml(ma_prefill || "")}</strong> 登录。`
      );
    }

    /* KT25：页面加载时用 localStorage 中的 token 校验登录状态 */
    const ma_storedToken = window.localStorage.getItem(ma_tokenKey);
    if (ma_storedToken) {
      window
        .fetch("/api/auth/profile", { headers: { Authorization: `Bearer ${ma_storedToken}` } })
        .then((ma_response) => ma_response.json())
        .then((ma_result) => {
          if (ma_result.code === 0) {
            console.log("检测到本地 token，登录状态有效：", ma_result.data);
            const ma_name = ma_result.data.ma_user.ma_username;
            ma_showNotice(
              ma_notice,
              "info",
              `检测到已登录账号 <strong>${ma_escapeHtml(ma_name)}</strong>，<a href="./account.html">进入个人中心 →</a>`
            );
          } else {
            console.error("本地 token 已失效，已清除：", ma_result.msg);
            window.localStorage.removeItem(ma_tokenKey);
            window.localStorage.removeItem(ma_userKey);
          }
        })
        .catch((ma_error) => console.error("校验本地登录状态失败：", ma_error));
    }

    let ma_redirecting = false;

    ma_form.addEventListener("submit", async (ma_event) => {
      ma_event.preventDefault();
      if (ma_submit.disabled) {
        return;
      }

      const ma_valid = ma_checks.map((ma_check) => ma_check()).every(Boolean);
      if (!ma_valid) {
        ma_setStatus(ma_status, "请先修正表单中标红的内容。", "error");
        const ma_firstInvalid = ma_form.querySelector(".is-invalid");
        if (ma_firstInvalid) {
          ma_firstInvalid.focus();
        }
        return;
      }

      const ma_payload = {
        ma_username: ma_username.value.trim(),
        ma_password: ma_password.value
      };
      console.log("登录请求参数：", ma_payload);

      ma_submit.disabled = true;
      ma_submit.textContent = "登录中…";
      ma_setStatus(ma_status, "正在校验账号信息…", "");

      try {
        const ma_response = await window.fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ma_payload)
        });
        const ma_result = await ma_response.json();
        console.log("登录接口返回：", ma_result);

        if (ma_result.code !== 0) {
          ma_setStatus(ma_status, ma_result.msg, "error");
          if (ma_captcha) {
            ma_captcha.ma_refresh();
          }
          ma_captchaInput.value = "";
          ma_captchaInput.focus();
          return;
        }

        window.localStorage.setItem(ma_tokenKey, ma_result.data.ma_token);
        window.localStorage.setItem(ma_userKey, JSON.stringify(ma_result.data.ma_user));
        console.log("token 已写入 localStorage：", ma_result.data.ma_token);
        ma_setStatus(ma_status, "登录成功，正在进入个人中心…", "success");

        ma_redirecting = true;
        window.setTimeout(() => {
          window.location.href = "./account.html";
        }, 650);
      } catch (ma_error) {
        console.error("登录请求失败：", ma_error);
        ma_setStatus(ma_status, "登录请求失败，请稍后重试。", "error");
      } finally {
        if (!ma_redirecting) {
          ma_submit.disabled = false;
          ma_submit.textContent = "登 录";
        }
      }
    });
  }

  /* ============================================================
   * 注册页
   * ============================================================ */
  function ma_initRegisterPage() {
    const ma_form = document.querySelector("#ma_register-form");
    if (!ma_form) {
      return;
    }

    const ma_captcha = ma_createCaptcha(document.querySelector("#ma_register-captcha-canvas"));
    const ma_status = document.querySelector("#ma_register-status");
    const ma_submit = document.querySelector("#ma_register-submit");
    const ma_username = document.querySelector("#ma_register-username");
    const ma_email = document.querySelector("#ma_register-email");
    const ma_phone = document.querySelector("#ma_register-phone");
    const ma_password = document.querySelector("#ma_register-password");
    const ma_confirm = document.querySelector("#ma_register-confirm");
    const ma_captchaInput = document.querySelector("#ma_register-captcha");
    const ma_agreement = document.querySelector("#ma_register-agreement");
    const ma_agreementError = document.querySelector("#ma_register-agreement-error");
    const ma_usernameError = document.querySelector("#ma_register-username-error");

    const ma_confirmCheck = ma_bindField(ma_confirm, document.querySelector("#ma_register-confirm-error"), (ma_value) => {
      if (!ma_value) {
        return "请再次输入密码。";
      }
      if (ma_value !== ma_password.value) {
        return "两次输入的密码不一致。";
      }
      return "";
    });

    ma_password.addEventListener("input", () => {
      if (ma_confirm.value) {
        ma_confirmCheck();
      }
    });

    const ma_checks = [
      ma_bindField(ma_username, ma_usernameError, ma_rules.ma_username),
      ma_bindField(ma_email, document.querySelector("#ma_register-email-error"), ma_rules.ma_email),
      ma_bindField(ma_phone, document.querySelector("#ma_register-phone-error"), ma_rules.ma_phone),
      ma_bindField(ma_password, document.querySelector("#ma_register-password-error"), ma_rules.ma_password),
      ma_confirmCheck,
      ma_bindField(ma_captchaInput, document.querySelector("#ma_register-captcha-error"), (ma_value) => {
        if (!ma_value.trim()) {
          return "请输入图形验证码。";
        }
        if (ma_captcha && !ma_captcha.ma_verify(ma_value)) {
          return "验证码不正确，请重新输入。";
        }
        return "";
      })
    ];

    function ma_checkAgreement() {
      const ma_checked = Boolean(ma_agreement && ma_agreement.checked);
      if (ma_agreementError) {
        ma_agreementError.textContent = ma_checked ? "" : "请先阅读并勾选用户协议。";
      }
      return ma_checked;
    }

    if (ma_agreement) {
      ma_agreement.addEventListener("change", ma_checkAgreement);
    }

    let ma_redirecting = false;

    ma_form.addEventListener("submit", async (ma_event) => {
      ma_event.preventDefault();
      if (ma_submit.disabled) {
        return;
      }

      const ma_valid = ma_checks.map((ma_check) => ma_check()).every(Boolean);
      const ma_agreed = ma_checkAgreement();
      if (!ma_valid || !ma_agreed) {
        ma_setStatus(ma_status, "请先修正表单中标红的内容。", "error");
        const ma_firstInvalid = ma_form.querySelector(".is-invalid");
        if (ma_firstInvalid) {
          ma_firstInvalid.focus();
        }
        return;
      }

      const ma_payload = {
        ma_username: ma_username.value.trim(),
        ma_email: ma_email.value.trim(),
        ma_phone: ma_phone.value.trim(),
        ma_password: ma_password.value
      };
      console.log("注册请求参数：", ma_payload);

      ma_submit.disabled = true;
      ma_submit.textContent = "注册中…";
      ma_setStatus(ma_status, "正在提交注册信息…", "");

      try {
        const ma_response = await window.fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ma_payload)
        });
        const ma_result = await ma_response.json();
        console.log("注册接口返回：", ma_result);

        if (ma_result.code !== 0) {
          ma_setStatus(ma_status, ma_result.msg, "error");
          if (ma_result.code === 1001) {
            ma_usernameError.textContent = ma_result.msg;
            ma_username.classList.add("is-invalid");
            ma_username.focus();
          }
          if (ma_captcha) {
            ma_captcha.ma_refresh();
          }
          ma_captchaInput.value = "";
          return;
        }

        ma_setStatus(ma_status, "注册成功，正在跳转到登录页…", "success");
        ma_redirecting = true;
        window.setTimeout(() => {
          const ma_query = new URLSearchParams({
            ma_username: ma_payload.ma_username,
            ma_registered: "1"
          });
          window.location.href = `./login.html?${ma_query.toString()}`;
        }, 700);
      } catch (ma_error) {
        console.error("注册请求失败：", ma_error);
        ma_setStatus(ma_status, "注册请求失败，请稍后重试。", "error");
      } finally {
        if (!ma_redirecting) {
          ma_submit.disabled = false;
          ma_submit.textContent = "注 册";
        }
      }
    });
  }

  /* ============================================================
   * 个人中心（需要 token 才能访问）
   * ============================================================ */
  function ma_initAccountPage() {
    const ma_root = document.querySelector("#ma_account-page");
    if (!ma_root) {
      return;
    }

    const ma_token = window.localStorage.getItem(ma_tokenKey);
    if (!ma_token) {
      console.warn("未找到 token，返回登录页。");
      window.location.replace("./login.html");
      return;
    }

    const ma_status = document.querySelector("#ma_account-status");
    const ma_elements = {
      ma_avatar: document.querySelector("#ma_account-avatar"),
      ma_username: document.querySelector("#ma_account-username"),
      ma_subtitle: document.querySelector("#ma_account-subtitle"),
      ma_email: document.querySelector("#ma_account-email"),
      ma_phone: document.querySelector("#ma_account-phone"),
      ma_created: document.querySelector("#ma_account-created"),
      ma_issued: document.querySelector("#ma_account-issued"),
      ma_expires: document.querySelector("#ma_account-expires"),
      ma_token: document.querySelector("#ma_account-token")
    };

    if (ma_elements.ma_token) {
      ma_elements.ma_token.textContent = `${ma_token.slice(0, 14)}…${ma_token.slice(-6)}`;
    }

    window
      .fetch("/api/auth/profile", { headers: { Authorization: `Bearer ${ma_token}` } })
      .then((ma_response) => ma_response.json())
      .then((ma_result) => {
        console.log("个人中心接口返回：", ma_result);

        if (ma_result.code !== 0) {
          console.error("登录状态校验失败：", ma_result.msg);
          window.localStorage.removeItem(ma_tokenKey);
          window.localStorage.removeItem(ma_userKey);
          window.location.replace("./login.html");
          return;
        }

        const ma_user = ma_result.data.ma_user;
        if (ma_elements.ma_avatar) {
          ma_elements.ma_avatar.textContent = ma_user.ma_username.slice(0, 2).toUpperCase();
        }
        if (ma_elements.ma_username) {
          ma_elements.ma_username.textContent = ma_user.ma_username;
        }
        if (ma_elements.ma_subtitle) {
          ma_elements.ma_subtitle.textContent = `用户编号 #${ma_user.ma_user_id} · 注册于 ${ma_user.ma_created_at}`;
        }
        if (ma_elements.ma_email) {
          ma_elements.ma_email.textContent = ma_user.ma_email;
        }
        if (ma_elements.ma_phone) {
          ma_elements.ma_phone.textContent = ma_user.ma_phone;
        }
        if (ma_elements.ma_created) {
          ma_elements.ma_created.textContent = ma_user.ma_created_at;
        }
        if (ma_elements.ma_issued) {
          ma_elements.ma_issued.textContent = ma_result.data.ma_issued_at;
        }
        if (ma_elements.ma_expires) {
          ma_elements.ma_expires.textContent = ma_result.data.ma_expires_at;
        }
        if (ma_status) {
          ma_status.textContent = "登录状态有效，token 保存在 localStorage 中。";
        }
      })
      .catch((ma_error) => {
        console.error("获取个人信息失败：", ma_error);
        if (ma_status) {
          ma_status.textContent = "获取个人信息失败，请刷新重试。";
          ma_status.classList.add("ma_account-status--error");
        }
      });

    const ma_copy = document.querySelector("#ma_account-copy");
    if (ma_copy) {
      ma_copy.addEventListener("click", () => {
        navigator.clipboard
          .writeText(ma_token)
          .then(() => {
            if (ma_status) {
              ma_status.textContent = "token 已复制到剪贴板。";
              ma_status.classList.remove("ma_account-status--error");
            }
          })
          .catch((ma_error) => {
            console.error("复制 token 失败：", ma_error);
            if (ma_status) {
              ma_status.textContent = "复制失败，请手动选择 token。";
              ma_status.classList.add("ma_account-status--error");
            }
          });
      });
    }

    const ma_logout = document.querySelector("#ma_account-logout");
    if (ma_logout) {
      ma_logout.addEventListener("click", async () => {
        ma_logout.disabled = true;
        try {
          const ma_response = await window.fetch("/api/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${ma_token}` }
          });
          const ma_result = await ma_response.json();
          console.log("退出登录接口返回：", ma_result);
        } catch (ma_error) {
          console.error("退出登录请求失败：", ma_error);
        } finally {
          window.localStorage.removeItem(ma_tokenKey);
          window.localStorage.removeItem(ma_userKey);
          window.location.replace("./login.html");
        }
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    ma_bindPasswordToggles();
    ma_initLoginPage();
    ma_initRegisterPage();
    ma_initAccountPage();
  });
})();
