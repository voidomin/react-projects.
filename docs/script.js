/**
 * React Projects Studio - Core Logic
 * Modularized & Refactored for a professional finish.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide Icons
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // ===== LOADING SCREEN =====
  const loadingScreen = document.getElementById("loading-screen");
  const loaderProgress = document.getElementById("loader-progress");

  if (loadingScreen) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          loadingScreen.classList.add("hidden");
        }, 400);
      }
      if (loaderProgress) loaderProgress.style.width = `${progress}%`;
    }, 150);
  }

  // ===== THEME MANAGEMENT =====
  const body = document.body;
  const themeBtns = document.querySelectorAll(".theme-btn");

  const setTheme = (theme, silent = true) => {
    // Remove all theme classes
    body.classList.remove(
      "dark-mode",
      "matrix-theme",
      "retro-theme",
      "greyscale-theme",
    );

    // Deactivate all buttons
    themeBtns.forEach((btn) => btn.classList.remove("active"));

    let displayTheme = theme.replace("-theme", "").toUpperCase();

    if (theme === "light") {
      const lightBtn = document.getElementById("light-btn");
      if (lightBtn) lightBtn.classList.add("active");
      displayTheme = "LIGHT";
    } else {
      const themeClass = theme === "dark" ? "dark-mode" : theme;
      body.classList.add(themeClass);

      const btnId =
        theme === "dark" ? "dark-btn" : `${theme.replace("-theme", "")}-btn`;
      const activeBtn = document.getElementById(btnId);
      if (activeBtn) activeBtn.classList.add("active");
    }

    localStorage.setItem("studio-theme", theme);
    if (!silent) showNotification(`${displayTheme} MODE ACTIVATED`);
  };

  // Initialize Theme
  const savedTheme = localStorage.getItem("studio-theme") || "light";
  setTheme(savedTheme);

  themeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const themeId = btn.id.replace("-btn", "");
      let finalTheme = themeId;
      if (themeId !== "light" && themeId !== "dark") {
        finalTheme = `${themeId}-theme`;
      }
      setTheme(finalTheme, false);
    });
  });

  // ===== NOTIFICATIONS =====
  function showNotification(message) {
    let notification = document.querySelector(".notification");
    if (!notification) {
      notification = document.createElement("div");
      notification.className = "notification";
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.classList.add("show");

    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  // ===== EASTER EGGS (RESTORED) =====

  // 1. Konami Code
  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let konamiIndex = 0;

  // 2. Secret words
  let keyBuffer = "";
  const secrets = {
    matrix: "matrix-theme",
    retro: "retro-theme",
    grey: "greyscale-theme",
  };

  document.addEventListener("keydown", (e) => {
    // Konami check
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        createConfetti();
        cycleThemes();
        konamiIndex = 0;
      }
    } else {
      konamiIndex = 0;
    }

    // Word check
    keyBuffer += e.key.toLowerCase();
    if (keyBuffer.length > 10) keyBuffer = keyBuffer.slice(-10);

    for (const [word, theme] of Object.entries(secrets)) {
      if (keyBuffer.includes(word)) {
        setTheme(theme, false);
        createConfetti();
        keyBuffer = "";
      }
    }
  });

  // 3. Double-Click Logo
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("dblclick", () => {
      cycleThemes();
      createConfetti();
    });
  }

  function cycleThemes() {
    const themes = ["light", "dark", "matrix-theme", "retro-theme", "greyscale-theme"];
    const currentTheme = localStorage.getItem("studio-theme") || "light";
    let nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
    setTheme(themes[nextIndex], false);
  }

  // 4. Confetti Effect
  function createConfetti() {
    const colors = [
      "#ff6b35",
      "#f7931e",
      "#ff8a5c",
      "#00ff41",
      "#ff00ff",
      "#00ffff",
    ];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "fixed";
      confetti.style.width = "10px";
      confetti.style.height = "10px";
      confetti.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.top = "-20px";
      confetti.style.borderRadius = "50%";
      confetti.style.zIndex = "10001";
      confetti.style.pointerEvents = "none";
      document.body.appendChild(confetti);

      const animation = confetti.animate(
        [
          { transform: `translate3d(0,0,0) rotate(0deg)`, opacity: 1 },
          {
            transform: `translate3d(${(Math.random() - 0.5) * 200}px, ${globalThis.innerHeight + 20}px, 0) rotate(${Math.random() * 360}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: Math.random() * 2000 + 1000,
          easing: "cubic-bezier(0, .9, .6, 1)",
        },
      );

      animation.onfinish = () => confetti.remove();
    }
  }

  // ===== STICKY HEADER SYNC =====
  const topBar = document.querySelector(".top-bar");
  const topBarContainer = document.querySelector(".top-bar-container");
  const scrollTopBtn = document.querySelector(".scroll-top");
  let ticking = false;

  const handleScroll = () => {
    if (!topBar || !topBarContainer) return;

    const scrollPos = globalThis.scrollY;

    if (scrollPos > 40) {
      topBar.classList.add("sticky");
      topBarContainer.classList.add("sticky");
    } else {
      topBar.classList.remove("sticky");
      topBarContainer.classList.remove("sticky");
    }

    // Scroll Progress
    const scrollPercent =
      (scrollPos /
        (document.documentElement.scrollHeight - globalThis.innerHeight)) *
      100;
    const progressBar = document.querySelector(".scroll-progress");
    if (progressBar) progressBar.style.width = `${scrollPercent}%`;

    // Scroll Top Visibility
    if (scrollTopBtn) {
      if (scrollPos > 400) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    }

    ticking = false;
  };

  globalThis.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        globalThis.requestAnimationFrame(handleScroll);
        ticking = true;
      }
    },
    { passive: true },
  );
  handleScroll();

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => {
      globalThis.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ===== PARTICLE SYSTEM =====
  const initParticles = () => {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let particlesArray = [];

    const mouse = { x: null, y: null, radius: 100 };
    globalThis.addEventListener("mousemove", (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    const resize = () => {
      canvas.width = globalThis.innerWidth;
      canvas.height = globalThis.innerHeight;
    };
    globalThis.addEventListener("resize", resize);
    resize();

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = "rgba(255, 107, 53, 0.15)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const count = (canvas.width * canvas.height) / 18000;
    for (let i = 0; i < count; i++) particlesArray.push(new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();
  };
  initParticles();

  // ===== 3D CARD TILT =====
  const cards = document.querySelectorAll(".app-card");
  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0deg)";
    });
  });

  // ===== CURSOR SPOTLIGHT =====
  const spotlight = document.querySelector(".cursor-spotlight");
  if (spotlight) {
    document.addEventListener("mousemove", (e) => {
      spotlight.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  }
});
