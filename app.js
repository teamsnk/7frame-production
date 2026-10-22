const root = document.documentElement;
const themeSelect = document.getElementById("themeSelect");
const savedTheme = (() => {
  try { return localStorage.getItem("frame7-theme"); } catch (_) { return null; }
})();
const allowedThemes = ["blue", "light", "dark", "white", "green", "purple", "yellow"];

function setTheme(theme) {
  if (!allowedThemes.includes(theme)) theme = "dark";
  root.dataset.theme = theme;
  themeSelect.value = theme;
  try { localStorage.setItem("frame7-theme", theme); } catch (_) {}
}

setTheme(savedTheme || "dark");
themeSelect.addEventListener("change", event => setTheme(event.target.value));

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});
mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...mainNav.querySelectorAll("a")];
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  sections.forEach(section => observer.observe(section));
}
