/* Masjid At-Towfiq prayer time system, v1.
 * Reference beginning times: AlAdhan calculations (never official unless separately approved).
 * Jama'ah: only date-specific entries approved by the masjid. No guessed jama'ah times.
 */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const PRAYERS = [ ['Fajr','الفجر'], ['Dhuhr','الظهر'], ['Asr','العصر'], ['Maghrib','المغرب'], ['Isha','العشاء'] ];
  const BEGIN_KEYS = ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'];
  const CACHE = new Map();
  const fmtLong = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/London',weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const fmtDate = new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'});
  const dateKey = (date) => {
    const p = Object.fromEntries(fmtDate.formatToParts(date).map(x => [x.type,x.value]));
    return p.year + '-' + p.month + '-' + p.day;
  };
  const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(s + 'T12:00:00Z').toISOString().slice(0,10) === s;
  const addDays = (iso, days) => {
    const d = new Date(iso + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0,10);
  };
  const formatDay = (iso) => fmtLong.format(new Date(iso + 'T12:00:00Z'));
  const clock = (s) => {
    if (typeof s !== 'string') return null;
    const m = /^(\d{1,2}):(\d{2})(?:\s*\([^)]*\))?$/.exec(s.trim());
    if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) return null;
    return m[1].padStart(2,'0') + ':' + m[2];
  };
  function ukTimestamp(iso, time) {
    const [year,month,day] = iso.split('-').map(Number);
    const [hour,minute] = time.split(':').map(Number);
    const noon = new Date(Date.UTC(year,month - 1,day,12));
    const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/London',hour:'2-digit',hourCycle:'h23'}).formatToParts(noon);
    const offsetHours = Number(parts.find(p => p.type === 'hour').value) - 12;
    return Date.UTC(year,month - 1,day,hour,minute) - offsetHours * 3600000;
  }
  const liveToday = () => dateKey(new Date());
  let selected = liveToday();
  let config = null;
  let current = null;
  let nextDay = null;
  let requestNo = 0;
  const alert = $('#prayerStatus');
  const rowBox = $('#prayerRows');
  const dateLabel = $('#todayDate');
  const nextEl = $('#prayerNext');
  const sunriseEl = $('#sunriseTime');
  const fridayEl = $('#jumuahMessage');
  const info = $('#prayerSource');
  const dialog = $('#timetableDialog');
  const monthData = $('#monthlyRows');
  let month = selected.slice(0,7);
  let monthlyRequest = 0;
  let dailyRefresh = null;
  let countdownTimer = null;
  function setStatus(message, variant) {
    alert.textContent = message;
    alert.dataset.status = variant || 'notice';
  }
  function apiUrl(path) {
    const c = config.calculation;
    const params = new URLSearchParams({
      latitude:String(c.latitude), longitude:String(c.longitude), method:String(c.method),
      school:String(c.school), latitudeAdjustmentMethod:String(c.latitudeAdjustmentMethod),
      timezonestring:config.timeZone
    });
    return 'https://api.aladhan.com/v1/' + path + '?' + params;
  }
  async function getJSON(url) {
    const r = await fetch(url, {cache:'no-store'});
    if (!r.ok) throw Error('Unable to retrieve timetable');
    return r.json();
  }
  function officialEntry(iso) {
    const official = config.official;
    if (!official.approvedByMasjid || !official.reviewedAt) return null;
    const entry = official.days[iso];
    if (!entry || entry.status !== 'approved') return null;
    if (!BEGIN_KEYS.every(k => clock(entry.begins && entry.begins[k]))) return null;
    if (!PRAYERS.every(([k]) => clock(entry.jamaah && entry.jamaah[k]))) return null;
    if (entry.jumuah && !clock(entry.jumuah)) return null;
    return entry;
  }
  function normalize(iso, timings) {
    if (!timings || !BEGIN_KEYS.every(k => clock(timings[k]))) throw Error('Invalid calculated timetable');
    const o = officialEntry(iso);
    const begins = {};
    const jamaah = {};
    for (const key of BEGIN_KEYS) begins[key] = o ? clock(o.begins[key]) : clock(timings[key]);
    for (const [key] of PRAYERS) jamaah[key] = o ? clock(o.jamaah[key]) : null;
    return {iso, begins, jamaah, official:!!o, jumuah:o ? clock(o.jumuah) : null};
  }
  async function loadDay(iso) {
    if (CACHE.has(iso)) return CACHE.get(iso);
    const official = officialEntry(iso);
    if (official) {
      const approved = normalize(iso,official.begins);
      CACHE.set(iso, approved);
      return approved;
    }
    const path = 'timings/' + iso.slice(8,10) + '-' + iso.slice(5,7) + '-' + iso.slice(0,4);
    const body = await getJSON(apiUrl(path));
    if (body.code !== 200 || !body.data || !body.data.timings) throw Error('Calculation service unavailable');
    const actual = body.data.date && body.data.date.gregorian && body.data.date.gregorian.date;
    const expected = iso.slice(8,10) + '-' + iso.slice(5,7) + '-' + iso.slice(0,4);
    if (actual && actual !== expected) throw Error('Unexpected date from calculation service');
    const item = normalize(iso, body.data.timings);
    CACHE.set(iso,item);
    return item;
  }
  function row(prayer, arabic, start, congregation, isNext) {
    const r = document.createElement('div'); r.className = 'prayer-row' + (isNext?' featured':''); r.setAttribute('role','row');
    const name = document.createElement('span'); name.className='prayer-name'; name.textContent=prayer+' ';
    const ar = document.createElement('small'); ar.lang='ar'; ar.dir='rtl'; ar.textContent=arabic; name.append(ar);
    const begin = document.createElement('time'); begin.textContent=start||'—';
    const jam = document.createElement('strong'); jam.textContent=congregation||'—';
    r.append(name,begin,jam); return r;
  }
  function renderDay(data) {
    current = data;
    dateLabel.textContent = formatDay(data.iso) + ' · Bolton (UK time)';
    $('#prayerToday').disabled = (selected === liveToday());
    rowBox.replaceChildren(...PRAYERS.map(([name,arabic]) => row(name,arabic,data.begins[name],data.jamaah[name],false)));
    sunriseEl.textContent = data.begins.Sunrise;
    setStatus(data.official ? 'Masjid-approved schedule for this date' : 'Calculated beginnings only · NOT the masjid timetable',data.official ? 'approved':'reference');
    info.textContent = data.official ? 'Verified against the masjid-approved daily schedule; all times are local to Bolton.' : 'Reference: AlAdhan · ' + config.calculation.methodLabel + ' · ' + config.calculation.schoolLabel + '. Calculation can differ from At-Towfiq. Jama’ah times will appear only after committee approval.';
    const friday = new Date(data.iso + 'T12:00:00Z').getUTCDay() === 5;
    fridayEl.textContent = friday ? (data.jumuah ? 'Jumu’ah jama’ah: ' + data.jumuah + ' (approved)' : 'Jumu’ah time has not been confirmed on this website. Please contact the masjid.') : 'Friday Jumu’ah times are published separately once confirmed by the masjid.';
    drawNext();
  }
  function drawNext() {
    const today = liveToday();
    if (selected !== today) {
      nextEl.textContent='Browse dates, or select Today to see the next prayer countdown.';
      return;
    }
    const now = Date.now();
    const options = [];
    for (const day of [current,nextDay]) {
      if (!day) continue;
      for (const [name] of PRAYERS) options.push({name,at:ukTimestamp(day.iso,day.begins[name]),day});
    }
    const next = options.filter(v=>v.at>now).sort((a,b)=>a.at-b.at)[0];
    if (!next) {nextEl.textContent='Checking the next prayer…'; return;}
    const seconds = Math.max(0,Math.ceil((next.at-now)/1000));
    const h = Math.floor(seconds/3600), m = Math.floor(seconds%3600/60), s = seconds%60;
    nextEl.textContent = 'Next beginning: ' + next.name + ' at ' + next.day.begins[next.name] + (next.day.iso!==today?' tomorrow':'') + ' · ' + (h? h+'h ':'') + String(m).padStart(2,'0')+'m '+String(s).padStart(2,'0')+'s' + (next.day.official?' (masjid approved)':' (calculated reference)');
    const active = rowBox.querySelectorAll('.prayer-row');
    active.forEach((r,i)=>r.classList.toggle('featured',next.day.iso === today && PRAYERS[i][0]===next.name));
  }
  async function showDay(iso) {
    if (!isDate(iso)) return;
    selected = iso;
    const n = ++requestNo;
    current = null;
    rowBox.replaceChildren(...PRAYERS.map(([name,ar])=>row(name,ar,null,null,false)));
    dateLabel.textContent = formatDay(iso) + ' · Bolton (UK time)';
    sunriseEl.textContent='—'; nextEl.textContent='Loading prayer beginnings…';
    setStatus('Loading calculated prayer beginnings…');
    try {
      const item = await loadDay(iso);
      if (n !== requestNo) return;
      nextDay = null;
      renderDay(item);
      if (iso === liveToday()) {
        try { nextDay = await loadDay(addDays(iso,1)); if(n===requestNo) drawNext(); }
        catch { if(n===requestNo) drawNext(); }
      }
    } catch (e) {
      if (n !== requestNo) return;
      setStatus('Prayer times temporarily unavailable — please consult the masjid', 'error');
      info.textContent='We cannot safely show times without a verified response. See the independent published timetable linked below.';
      nextEl.textContent='No reliable countdown is available.';
      fridayEl.textContent='Contact the masjid for the confirmed Jumu’ah time.';
    }
  }
  async function init() {
    $('#prayerPrev').addEventListener('click',()=>showDay(addDays(selected,-1)));
    $('#prayerNextDay').addEventListener('click',()=>showDay(addDays(selected,1)));
    $('#prayerToday').addEventListener('click',()=>showDay(liveToday()));
    $('#timetableAction').addEventListener('click',openTimetable);
    $('#timetableClose').addEventListener('click',()=>dialog.close());
    $('#monthPrev').addEventListener('click',()=>moveMonth(-1));
    $('#monthNext').addEventListener('click',()=>moveMonth(1));
    $('#monthPicker').addEventListener('change',e=>{if(/^\d{4}-\d{2}$/.test(e.target.value)){month=e.target.value;showMonth();}});
    $('#downloadTimetable').addEventListener('click',downloadCSV);
    try {
      config = await getJSON('data/prayer-config.json');
      if (config.schemaVersion!==1 || config.timeZone!=='Europe/London' || !config.calculation || !config.official) throw Error('Invalid configuration');
      $('#externalTimetable').href=config.independentTimetableUrl;
      await showDay(liveToday());
    } catch (e) {
      setStatus('Timetable service is not configured. Please contact the masjid.', 'error');
      info.textContent='No times are displayed until the configuration is available.';
    }
    countdownTimer = window.setInterval(()=>{
      if (!current) return;
      if (selected===liveToday()) drawNext();
      if (current.iso !== liveToday() && selected === current.iso) showDay(liveToday());
    },1000);
    dailyRefresh = window.setInterval(()=>{
      const today=liveToday();
      if (selected!==today && current && current.iso===addDays(today,-1)) showDay(today);
    },60000);
  }
  function moveMonth(n) {
    const [y,m]=month.split('-').map(Number);
    const d=new Date(Date.UTC(y,m-1+n,1));
    month=d.toISOString().slice(0,7);
    showMonth();
  }
  async function openTimetable(){
    month=selected.slice(0,7);
    dialog.showModal();
    await showMonth();
  }
  let currentMonthItems=[];
  async function showMonth() {
    if (!config) return;
    const request=++monthlyRequest;
    $('#monthPicker').value=month;
    $('#monthHeading').textContent=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(month+'-01T12:00:00Z'));
    monthData.textContent='Loading monthly prayer starts…';
    $('#downloadTimetable').disabled=true;
    try {
      const [y,m]=month.split('-').map(Number);
      const body=await getJSON(apiUrl('calendar/'+y+'/'+m));
      if (body.code!==200 || !Array.isArray(body.data)) throw Error('Monthly service unavailable');
      const expectedDays=new Date(Date.UTC(y,m,0)).getUTCDate();
      if(body.data.length!==expectedDays) throw Error('Incomplete calendar');
      const items=body.data.map((v,i)=>normalize(month+'-'+String(i+1).padStart(2,'0'),v.timings));
      if(request!==monthlyRequest) return;
      for (const item of items) CACHE.set(item.iso,item);
      currentMonthItems=items;
      const table=document.createElement('table');table.className='monthly-table';
      const head=document.createElement('thead');const header=document.createElement('tr');
      ['Date','Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha','Fajr jama’ah','Dhuhr jama’ah','Asr jama’ah','Maghrib jama’ah','Isha jama’ah'].forEach(v=>{const th=document.createElement('th');th.textContent=v;header.append(th);});
      head.append(header);table.append(head);
      const tbody=document.createElement('tbody');
      for(const item of items){
        const tr=document.createElement('tr');
        if(item.official)tr.className='approved-day';
        const vals=[item.iso,...BEGIN_KEYS.map(k=>item.begins[k]),...PRAYERS.map(([k])=>item.jamaah[k]||'—')];
        vals.forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.append(td);});
        tbody.append(tr);
      }
      table.append(tbody);monthData.replaceChildren(table);
      $('#downloadTimetable').disabled=false;
    } catch(e) {
      if(request!==monthlyRequest)return;
      currentMonthItems=[];
      monthData.textContent='Unable to load this month. Please use the independent timetable link or contact the masjid.';
    }
  }
  function downloadCSV() {
    if(!currentMonthItems.length) return;
    const rows=[['Date','Fajr begins','Sunrise','Dhuhr begins','Asr begins','Maghrib begins','Isha begins','Fajr jamaah','Dhuhr jamaah','Asr jamaah','Maghrib jamaah','Isha jamaah','Masjid approved']];
    for(const item of currentMonthItems)rows.push([item.iso,...BEGIN_KEYS.map(k=>item.begins[k]),...PRAYERS.map(([k])=>item.jamaah[k]||''),item.official?'YES':'NO — CALCULATED REFERENCE']);
    const csv='NOTICE: Beginning times are calculated references unless a row says YES. No unapproved jamaah times are included.\r\n'+rows.map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(',')).join('\r\n');
    const link=document.createElement('a');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    link.href=url;link.download='at-towfiq-'+month+'-reference-not-official.csv';document.body.append(link);link.click();link.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),3000);
  }
  init();
})();
