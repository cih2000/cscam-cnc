document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const gnb = document.querySelector(".gnb");
  if (toggle && gnb) {
    toggle.addEventListener("click", () => {
      gnb.classList.toggle("open");
      toggle.classList.toggle("open");
    });
    gnb.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        gnb.classList.remove("open");
        toggle.classList.remove("open");
      })
    );
  }

  // Scroll spy: highlight the active gnb link as the user scrolls
  // through the category sections on the long-form homepage.
  const sections = document.querySelectorAll("[data-section]");
  const navLinks = document.querySelectorAll(".gnb a[data-nav-target]");
  if (sections.length && navLinks.length) {
    const setActive = (id) => {
      navLinks.forEach((a) => a.classList.toggle("active", a.dataset.navTarget === id));
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.dataset.section);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }

  // Spec table popups: open/close via data-modal-open / data-modal-close.
  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest("[data-modal-open]");
    if (openBtn) {
      const modal = document.getElementById(openBtn.dataset.modalOpen);
      if (modal) {
        modal.classList.add("open");
        document.body.classList.add("modal-open");
      }
      return;
    }
    const closeBtn = e.target.closest("[data-modal-close]");
    if (closeBtn) {
      const modal = closeBtn.closest(".spec-modal-overlay");
      if (modal) {
        modal.classList.remove("open");
        document.body.classList.remove("modal-open");
      }
      return;
    }
    if (e.target.classList.contains("spec-modal-overlay")) {
      e.target.classList.remove("open");
      document.body.classList.remove("modal-open");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".spec-modal-overlay.open").forEach((m) => m.classList.remove("open"));
      document.body.classList.remove("modal-open");
    }
  });

  // 히어로 영상: Laser(engraving) 사이트처럼 poster 이미지를 잠깐 보여준 뒤 재생을 시작한다.
  // (HTML의 autoplay 속성은 제거하고 여기서 지연 후 직접 play()를 호출한다)
  const heroVideo = document.querySelector(".hero-video video");
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    let started = false;
    const tryPlay = () => {
      if (!started) return;
      const p = heroVideo.play();
      if (p && typeof p.catch === "function") p.catch(() => { /* 실패 시 아래 재시도들이 다시 시도한다 */ });
    };
    // preload="auto"로 정지 프레임만 표시된 채 재생이 안 걸리는 경우를 대비해
    // 데이터 준비 이벤트 + 시간차로 여러 번 재시도한다.
    ["loadeddata", "canplay", "canplaythrough", "playing"].forEach((ev) => {
      heroVideo.addEventListener(ev, tryPlay);
    });
    setTimeout(() => { started = true; tryPlay(); }, 600);
    [900, 1500, 2500, 4000].forEach((delay) => {
      setTimeout(() => { if (started && heroVideo.paused) tryPlay(); }, delay);
    });
  }
});
