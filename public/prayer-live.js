/* Native At-Towfiiq prayer UI: data exclusively from our server-side MasjidBox feed. */
(() => {
  "use strict";
  const NAMES=["Fajr","Dhuhr","Asr","Maghrib","Isha"];
  const $=id=>document.getElementById(id);
  const panel=$("prayerDockPanel"),toggle=$("prayerDockToggle");
  let loading=false, successful=false;
  function row(name,begins,jamaah,next) {
    const el=document.createElement("div");el.className="at-prayer-row"+(next?" next":"");
    const label=document.createElement("strong");label.textContent=name;
    const start=document.createElement("span");start.textContent=begins||"—";
    const iq=document.createElement("b");iq.textContent=jamaah||"—";
    el.append(label,start,iq);return el;
  }
  function renderBars(prayers,nextName) {
    $("prayerDockTimes").replaceChildren(...prayers.map(p=>{
      const cell=document.createElement("span");
      if(nextName===p.name)cell.classList.add("next");
      const name=document.createElement("small");name.textContent=p.name;
      const value=document.createElement("strong");value.textContent=p.jamaah||"—";
      cell.append(name,value);return cell;
    }));
    $("prayerDockRows").replaceChildren(...prayers.map(p=>row(p.name,p.begins,p.jamaah,nextName===p.name)));
    $("prayerRows").replaceChildren(...prayers.map(p=>row(p.name,p.begins,p.jamaah,nextName===p.name)));
  }
  function placeholders(){
    renderBars(NAMES.map(name=>({name,begins:null,jamaah:null})),"");
    $("jumuahTime").textContent="—";$("prayerDockJumuah").textContent="—";
    $("prayerNext").textContent="Please check the mosque's live published timetable for upcoming iqamah times.";
  }
  async function refresh() {
    if(loading)return;
    loading=true;$("prayerRetry").disabled=true;
    try {
      const res=await fetch("/api/public/prayer-times",{cache:"no-store"});
      if(!res.ok)throw Error("Source unavailable");
      const data=await res.json();
      if(!data.date||!Array.isArray(data.prayers)||data.prayers.length!==5)throw Error("Incomplete source");
      const prayers=NAMES.map(name=>data.prayers.find(p=>p.name===name)||{name,begins:null,jamaah:null});
      renderBars(prayers,data.nextPrayer?.name||"");
      $("todayDate").textContent=data.displayDate+" · Bolton";
      $("prayerDockDate").textContent=data.displayDate;
      $("jumuahTime").textContent=data.jumuah||"—";
      $("prayerDockJumuah").textContent=data.jumuah||"—";
      $("prayerNext").textContent=data.nextPrayer?.time
        ? "Next iqamah: "+data.nextPrayer.name+" at "+data.nextPrayer.time
        : "No further iqamah time is currently published for today.";
      const state=$("prayerTimesStatus");
      state.textContent=data.verified?"Live At-Towfiiq MasjidBox timetable":"At-Towfiiq published MasjidBox timetable · confirm important changes with the masjid";
      state.dataset.state="ready";
      $("prayerDataNote").textContent=prayers.some(p=>!p.jamaah||!p.begins)
        ? "Some Athan or Iqamah entries are missing or invalid and are shown as — rather than guessed. Confirm on MasjidBox."
        : "Times come from the published Masjid At-Towfiiq MasjidBox listing.";
      successful=true;
    } catch {
      // Do not leave yesterday's schedule shown as if current.
      placeholders();
      const state=$("prayerTimesStatus");
      state.textContent="Live prayer times are temporarily unavailable; use At-Towfiiq's MasjidBox listing.";
      state.dataset.state="error";
      $("prayerDataNote").textContent="An unavailable feed is never replaced with estimated timings.";
      $("prayerDockDate").textContent="See MasjidBox for current times";
      successful=false;
    } finally {loading=false;$("prayerRetry").disabled=false;}
  }
  function openPanel(open,focus=true) {
    panel.hidden=!open;toggle.setAttribute("aria-expanded",String(open));
    if(focus)(open?$("prayerDockClose"):toggle).focus();
  }
  toggle.addEventListener("click",()=>openPanel(panel.hidden));
  $("prayerDockClose").addEventListener("click",()=>openPanel(false));
  $("prayerRetry").addEventListener("click",refresh);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)openPanel(false);});
  document.addEventListener("pointerdown",e=>{
    if(!panel.hidden && !$("prayerDock").contains(e.target))openPanel(false,false);
  });
  placeholders();
  refresh();
  setInterval(refresh,5*60*1000);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh();});
})();