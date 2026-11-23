/* 姓名：马欣宇 | 学号：24001010422 | 时间：2026-11-09 | 大模型：Copilot（具体模型名称未提供） */
(() => {
  const ma_canvas = document.querySelector(".ma_background");
  const ma_context = ma_canvas.getContext("2d");
  const ma_reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let ma_width = 0;
  let ma_height = 0;
  let ma_particles = [];
  let ma_frame = 0;
  let ma_animationFrame = 0;

  function ma_resizeCanvas() {
    window.cancelAnimationFrame(ma_animationFrame);
    const ma_pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    ma_width = window.innerWidth;
    ma_height = window.innerHeight;
    ma_canvas.width = Math.round(ma_width * ma_pixelRatio);
    ma_canvas.height = Math.round(ma_height * ma_pixelRatio);
    ma_context.setTransform(ma_pixelRatio, 0, 0, ma_pixelRatio, 0, 0);
    ma_particles = Array.from({ length: Math.min(42, Math.round(ma_width / 28)) }, () => ({
      ma_x: Math.random() * ma_width,
      ma_y: Math.random() * ma_height,
      ma_radius: Math.random() * 1.5 + 0.4,
      ma_speed: Math.random() * 0.22 + 0.06,
      ma_phase: Math.random() * Math.PI * 2
    }));
    ma_drawFrame();
  }

  function ma_drawFrame() {
    ma_context.clearRect(0, 0, ma_width, ma_height);
    ma_particles.forEach((ma_particle, ma_index) => {
      const ma_alpha = 0.2 + (Math.sin(ma_frame * 0.012 + ma_particle.ma_phase) + 1) * 0.16;
      ma_context.beginPath();
      ma_context.arc(ma_particle.ma_x, ma_particle.ma_y, ma_particle.ma_radius, 0, Math.PI * 2);
      ma_context.fillStyle = `rgba(170, 190, 255, ${ma_alpha})`;
      ma_context.fill();

      if (!ma_reduceMotion.matches) {
        ma_particle.ma_y -= ma_particle.ma_speed;
        ma_particle.ma_x += Math.sin(ma_frame * 0.003 + ma_index) * 0.08;
        if (ma_particle.ma_y < -4) {
          ma_particle.ma_y = ma_height + 4;
          ma_particle.ma_x = Math.random() * ma_width;
        }
      }
    });

    ma_frame += 1;
    if (!ma_reduceMotion.matches) {
      ma_animationFrame = window.requestAnimationFrame(ma_drawFrame);
    }
  }

  function ma_loadHealth() {
    /* 以 file:// 直接打开页面时没有后端，跳过健康检查，避免控制台报错 */
    if (window.location.protocol === "file:") {
      return;
    }
    window.fetch("/api/health")
      .then((ma_response) => {
        if (!ma_response.ok) {
          throw new Error(`健康检查请求失败：HTTP ${ma_response.status}`);
        }
        return ma_response.json();
      })
      .then((ma_data) => {
        console.log("服务器返回数据：", ma_data);
      })
      .catch((ma_error) => {
        console.error("无法获取服务器状态：", ma_error);
      });
  }

  window.addEventListener("resize", ma_resizeCanvas, { passive: true });
  ma_resizeCanvas();
  ma_loadHealth();
})();
