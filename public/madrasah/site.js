/* Public Madrasah website: accessible navigation only; no student data is collected. */
(() => {
  "use strict";
  const toggle=document.getElementById("menuToggle");
  const nav=document.getElementById("primaryNav");
  const year=document.getElementById("currentYear");
  if(year) year.textContent=String(new Date().getFullYear());
  if(toggle&&nav){
    function close(){
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded","false");
      toggle.setAttribute("aria-label","Open navigation");
    }
    toggle.addEventListener("click",()=>{
      const open=!nav.classList.contains("is-open");
      nav.classList.toggle("is-open",open);
      toggle.setAttribute("aria-expanded",String(open));
      toggle.setAttribute("aria-label",open?"Close navigation":"Open navigation");
    });
    nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",close));
    document.addEventListener("keydown",e=>{
      if(e.key==="Escape"&&nav.classList.contains("is-open")){close();toggle.focus();}
    });
    document.addEventListener("click",e=>{
      if(nav.classList.contains("is-open")&&!nav.contains(e.target)&&!toggle.contains(e.target))close();
    });
    const breakpoint=window.matchMedia("(min-width: 921px)");
    if(typeof breakpoint.addEventListener==="function") breakpoint.addEventListener("change",e=>{if(e.matches)close();});
  }
})();
