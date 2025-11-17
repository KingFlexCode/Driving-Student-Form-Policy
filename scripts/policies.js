(function () {
  /* ========= Language Switcher ========= */

  const langToggle = document.getElementById("policyLangToggle");
  const langList = document.getElementById("policyLangList");
  const langLabel = document.getElementById("policyLangLabel");
  const htmlEl = document.documentElement;
  const currentLang = (htmlEl.getAttribute("lang") || "en").slice(0, 2);

  if (langToggle && langList && langLabel) {
    // Initialize selected state
    Array.from(langList.querySelectorAll("[data-lang]")).forEach((li) => {
      const isCurrent = li.dataset.lang === currentLang;
      li.setAttribute("aria-selected", isCurrent ? "true" : "false");
      if (isCurrent) {
        langLabel.textContent = li.textContent.trim();
      }
    });

    function openList() {
      langList.hidden = false;
      langToggle.setAttribute("aria-expanded", "true");
      const selected =
        langList.querySelector('[aria-selected="true"]') ||
        langList.querySelector("[data-lang]");
      if (selected) selected.focus();
      document.addEventListener("click", outsideClose, { once: true });
    }

    function closeList() {
      langList.hidden = true;
      langToggle.setAttribute("aria-expanded", "false");
    }

    function outsideClose(e) {
      if (!langList.contains(e.target) && e.target !== langToggle) {
        closeList();
      }
    }

    langToggle.addEventListener("click", () => {
      if (langList.hidden) openList();
      else closeList();
    });

    langToggle.addEventListener("keydown", (e) => {
      if (["Enter", " ", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        openList();
      }
    });

    langList.addEventListener("keydown", (e) => {
      const items = Array.from(langList.querySelectorAll("[data-lang]"));
      const idx = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        (items[idx + 1] || items[0]).focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        (items[idx - 1] || items[items.length - 1]).focus();
      } else if (e.key === "Escape") {
        e.preventDefault();
        closeList();
        langToggle.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const li = document.activeElement;
        if (li && li.dataset && li.dataset.lang) {
          handleLangChoice(li.dataset.lang);
        }
      }
    });

    langList.addEventListener("click", (e) => {
      const li = e.target.closest("[data-lang]");
      if (!li) return;
      handleLangChoice(li.dataset.lang);
    });

    function handleLangChoice(lang) {
      if (!lang) return;

      // Update UI quickly
      Array.from(langList.querySelectorAll("[data-lang]")).forEach((li) => {
        const selected = li.dataset.lang === lang;
        li.setAttribute("aria-selected", selected ? "true" : "false");
        if (selected) langLabel.textContent = li.textContent.trim();
      });
      closeList();

      // Compute URL for chosen language
      const path = window.location.pathname;
      let target = path;

      if (lang === "en") {
        if (!path.includes("english-policy")) {
          target = path.replace("spanish-policy", "english-policy");
        }
      } else if (lang === "es") {
        if (!path.includes("spanish-policy")) {
          target = path.replace("english-policy", "spanish-policy");
        }
      }

      // Navigate only if different
      if (target !== path) {
        window.location.href = target;
      }
    }
  }

  /* ========= Smooth scroll for TOC links ========= */

  function setupSmoothScroll(container) {
    if (!container) return;
    container.addEventListener("click", (e) => {
      const link = e.target.closest("a[href^='#']");
      if (!link) return;
      const id = link.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const tocMain = document.getElementById("policyTocMain");
  const tocSidebarList = document.getElementById("policyTocSidebarList");

  // Clone links into sidebar
  if (tocMain && tocSidebarList) {
    tocSidebarList.innerHTML =
      tocMain.querySelector("ul")?.innerHTML || tocMain.innerHTML;
  }

  setupSmoothScroll(tocMain);
  setupSmoothScroll(document.getElementById("policyTocSidebar"));

  /* ========= Sidebar toggle ========= */

  const tocToggleBtn = document.getElementById("policyTocToggle");
  const tocSidebar = document.getElementById("policyTocSidebar");
  const tocCloseBtn = document.getElementById("policyTocClose");

  function openSidebar() {
    if (!tocSidebar) return;
    tocSidebar.classList.add("open");
  }
  function closeSidebar() {
    if (!tocSidebar) return;
    tocSidebar.classList.remove("open");
  }

  if (tocToggleBtn && tocSidebar) {
    tocToggleBtn.addEventListener("click", openSidebar);
  }
  if (tocCloseBtn && tocSidebar) {
    tocCloseBtn.addEventListener("click", closeSidebar);
  }

  // Close sidebar on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });

  /* ========= Back to top button ========= */

  const backToTopBtn = document.getElementById("policyBackToTop");

  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add("visible");
      } else {
        backToTopBtn.classList.remove("visible");
      }
    });
  }
})();
