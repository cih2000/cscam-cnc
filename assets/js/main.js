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
});
