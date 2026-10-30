/* Native At-Towfiiq prayer dock. Times come from the masjid's MasjidBox listing via our Worker. */
(() => {
 "use strict";
 const NAMES=["Fajr","Dhuhr","Asr","Maghrib","Isha"];
 const $=id=>document.getElementById(id);
 const panel=$("prayerDockPanel"),toggle=$("prayerDockToggle"),bar=$("prayerDockTimes");
 const rows=$("prayerDockRows"),displayDate=$("prayerDockDate"),jumuah=$("prayerDockJumuah");
 if(!panel||!toggle||!bar||!rows||!displayDate||!jumuah)return;
 let loading=false;
 function render(list,next){
   bar.replaceChildren(...list.map(p=>{
     const el=document.createElement("span");
     if(p.name===next)el.classList.add("next");
     const name=document.createElement("small");name.textContent=p.name;
     const time=document.createElement("strong");time.textContent=p.jamaah||"—";
     el.append(name,time);return el;
   }));
   rows.replaceChildren(...list.map(p=>{
     const el=document.createElement("div");
     el.className="at-prayer-row"+(p.name===next?" next":"");
     const name=document.createElement("strong");name.textContent=p.name;
     const begins=document.createElement("span");begins.textContent=p.begins||"—";
     const congregation=document.createElement("b");congregation.textContent=p.jamaah||"—";
     el.append(name,begins,congregation);return el;
   }));
 }
 function empty(message) {
   render(NAMES.map(name=>({name,begins:null,jamaah:null})),"");
   jumuah.textContent="—";
   displayDate.textContent=message;
 }
 async function refresh() {
   if(loading)return;
   loading=true;
   try {
     const response=await fetch("/api/public/prayer-times",{cache:"no-store"});
     if(!response.ok)throw Error("Upstream timetable unavailable");
     const data=await response.json();
     if(!Array.isArray(data.prayers)||data.prayers.length!==5||!data.displayDate)throw Error("Invalid timetable");
     const prayers=NAMES.map(name=>data.prayers.find(p=>p.name===name)||{name,begins:null,jamaah:null});
     render(prayers,data.nextPrayer?.name||"");
     jumuah.textContent=data.jumuah||"—";
     displayDate.textContent=data.displayDate;
   }catch(err){
     empty("Live times unavailable · View MasjidBox ↗");
   }finally{loading=false;}
 }
 function setOpen(open,focus=true) {
   panel.hidden=!open;
   toggle.setAttribute("aria-expanded",String(open));
   if(focus)(open?$("prayerDockClose"):toggle).focus();
 }
 toggle.addEventListener("click",()=>setOpen(panel.hidden));
 $("prayerDockClose").addEventListener("click",()=>setOpen(false));
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)setOpen(false);});
 document.addEventListener("pointerdown",e=>{
   if(!panel.hidden&&!$("prayerDock").contains(e.target))setOpen(false,false);
 });
 empty("Loading today's iqamah…");
 refresh();
 setInterval(refresh,5*60*1000);
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();});
})();
