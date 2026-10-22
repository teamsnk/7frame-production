const root = document.documentElement;
const themeSelect = document.getElementById("themeSelect");
const themes = ["blue","light","dark","white","green","purple","yellow"];
function setTheme(theme){
  if(!themes.includes(theme)) theme="dark";
  root.dataset.theme=theme;
  themeSelect.value=theme;
  try{localStorage.setItem("frame7-premium-theme",theme)}catch(e){}
}
let initialTheme="dark";
try{initialTheme=localStorage.getItem("frame7-premium-theme")||"dark"}catch(e){}
setTheme(initialTheme);
themeSelect.addEventListener("change",e=>setTheme(e.target.value));

const menuButton=document.getElementById("menuButton");
const nav=document.getElementById("nav");
menuButton.addEventListener("click",()=>{
  const open=nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded",String(open));
  menuButton.setAttribute("aria-label",open?"Close menu":"Open menu");
  menuButton.textContent=open?"×":"☰";
});
nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
  nav.classList.remove("open");
  menuButton.setAttribute("aria-expanded","false");
  menuButton.setAttribute("aria-label","Open menu");
  menuButton.textContent="☰";
}));

document.getElementById("year").textContent=new Date().getFullYear();

const filterButtons=[...document.querySelectorAll(".filter")];
const projects=[...document.querySelectorAll(".project-card")];
filterButtons.forEach(button=>button.addEventListener("click",()=>{
  const filter=button.dataset.filter;
  filterButtons.forEach(item=>item.classList.toggle("active",item===button));
  projects.forEach(project=>{
    const visible=filter==="all"||project.dataset.category===filter;
    project.classList.toggle("hidden",!visible);
  });
}));

const revealEls=document.querySelectorAll(".reveal");
if("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target)}
    });
  },{threshold:.12});
  revealEls.forEach(el=>observer.observe(el));
}else{revealEls.forEach(el=>el.classList.add("visible"))}

const sections=[...document.querySelectorAll("main section[id]")];
const navLinks=[...nav.querySelectorAll("a")];
if("IntersectionObserver" in window){
  const navObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        navLinks.forEach(link=>link.classList.toggle("active",link.getAttribute("href")===`#${entry.target.id}`));
      }
    });
  },{rootMargin:"-35% 0px -55% 0px"});
  sections.forEach(section=>navObserver.observe(section));
}
