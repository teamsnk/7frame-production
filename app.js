
/* =========================================
   7FRAME PRODUCTION STUDIO
   File: app.js
   Features:
   - Dark / Light Mode
   - Mobile Navigation
   - Scroll Reveal Animations
   - Active Navigation Links
   - Contact Form Email
   - Newsletter Demo
   - Dynamic Footer Year
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // Select elements
  const html = document.documentElement;
  const header = document.querySelector(".site-header");
  const themeToggle = document.getElementById("themeToggle");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const contactForm = document.getElementById("contactForm");
  const newsletterForm = document.getElementById("newsletterForm");
  const yearElement = document.getElementById("year");

  // Change this to your real business email
  const BUSINESS_EMAIL = "hello@7frame.com";

  /* =========================================
     1. FOOTER YEAR
  ========================================= */

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  /* =========================================
     2. DARK / LIGHT THEME
  ========================================= */

  function getSavedTheme() {
    try {
      return localStorage.getItem("7frame-theme");
    } catch {
      return null;
    }
  }

  function saveTheme(theme) {
    try {
      localStorage.setItem("7frame-theme", theme);
    } catch {
      // The theme still works if storage is unavailable.
    }
  }

  function applyTheme(theme) {
    const selectedTheme = theme === "light" ? "light" : "dark";

    html.dataset.theme = selectedTheme;

    if (themeToggle) {
      const icon = themeToggle.querySelector(".theme-icon");
      const label = themeToggle.querySelector(".theme-label");
      const state = themeToggle.querySelector(".theme-state");

      if (icon) {
        icon.textContent = selectedTheme === "dark" ? "☀" : "☾";
      }

      if (label) {
        label.textContent =
          selectedTheme === "dark" ? "Light mode" : "Dark mode";
      }

      if (state) {
        state.textContent =
          selectedTheme === "dark" ? "OFF" : "ON";
      }

      themeToggle.setAttribute(
        "aria-label",
        selectedTheme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      );

      themeToggle.setAttribute("aria-pressed", String(selectedTheme === "light"));
    }
  }

  const savedTheme = getSavedTheme();

  applyTheme(savedTheme || html.dataset.theme || "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const nextTheme =
        html.dataset.theme === "dark" ? "light" : "dark";

      applyTheme(nextTheme);
      saveTheme(nextTheme);
    });
  }

  /* =========================================
     3. MOBILE NAVIGATION
  ========================================= */

  function closeMenu() {
    if (!menuToggle || !mainNav) return;

    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  }

  if (menuToggle && mainNav) {
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", String(isOpen));
      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    });

    mainNav.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        mainNav.classList.contains("open") &&
        !mainNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        closeMenu();
      }
    });
  }

  /* =========================================
     4. HEADER SCROLL EFFECT
  ========================================= */

  function updateHeader() {
    if (!header) return;

    header.classList.toggle("scrolled", window.scrollY > 30);
  }

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  /* =========================================
     5. ACTIVE NAVIGATION LINK
  ========================================= */

  const navLinks = Array.from(
    document.querySelectorAll('.main-nav a[href^="#"]')
  );

  const sections = navLinks
    .map((link) => {
      const target = document.querySelector(link.getAttribute("href"));
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  function updateActiveNav() {
    if (!sections.length) return;

    const marker = window.scrollY + window.innerHeight * 0.35;
    let currentSection = sections[0];

    sections.forEach((section) => {
      if (section.target.offsetTop <= marker) {
        currentSection = section;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });

    if (currentSection) {
      currentSection.link.classList.add("active");
      currentSection.link.setAttribute("aria-current", "location");
    }
  }

  window.addEventListener("scroll", updateActiveNav, { passive: true });
  window.addEventListener("resize", updateActiveNav);
  updateActiveNav();

  /* =========================================
     6. SCROLL REVEAL ANIMATIONS
  ========================================= */

  const revealElements = document.querySelectorAll(
    [
      ".intro-copy",
      ".intro-card",
      ".service-card",
      ".team-card",
      ".project-card",
      ".join-panel",
      ".contact-form",
      ".closing-content"
    ].join(",")
  );

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element, index) => {
      element.classList.add("reveal");

      // Slight stagger for cards
      if (
        element.matches(
          ".service-card, .team-card, .project-card"
        )
      ) {
        element.style.transitionDelay = `${(index % 4) * 80}ms`;
      }

      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }

  /* =========================================
     7. CONTACT FORM
  ========================================= */

  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!contactForm.reportValidity()) return;

      const formData = new FormData(contactForm);

      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const service = String(formData.get("service") || "").trim();
      const message = String(formData.get("message") || "").trim();

      const note = document.getElementById("formNote");

      const subject = `Website Inquiry from ${name}`;

      const body = [
        "Hello 7FRAME Production Studio,",
        "",
        "I would like to discuss a project.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Service: ${service || "Not specified"}`,
        "",
        "Project Details:",
        message
      ].join("\n");

      const mailtoURL =
        `mailto:${BUSINESS_EMAIL}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(body)}`;

      if (note) {
        note.textContent =
          "Opening your email app. Please review and send the message there.";
      }

      window.location.href = mailtoURL;
    });
  }

  /* =========================================
     8. NEWSLETTER DEMO FORM
  ========================================= */

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!newsletterForm.reportValidity()) return;

      const note = document.getElementById("newsletterNote");

      if (note) {
        note.textContent =
          "Thanks for your interest! Newsletter signup is not connected yet.";
      }

      newsletterForm.reset();
    });
  }

  /* =========================================
     9. CURRENT YEAR AND PAGE INITIALIZATION
  ========================================= */

  document.body.classList.add("js-ready");
});
