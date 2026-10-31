/* Reversible Phase 1: all new public features are disabled by default.
   A private portal-admin switch gates the feed. No fake events are published.
   On failure or disabled state, original HTML/CSS/behaviour is untouched. */
(() => {
  'use strict';
  const section=document.querySelector('.programmes-section');
  const grid=section?.querySelector('.programme-grid');
  if(!section||!grid)return;
  const el=(tag,className,text)=>{
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=String(text);
    return node;
  };
  const clean=s=>String(s||'').trim();
  function formattedDate(date){
    const parsed=new Date(date+'T12:00:00Z');
    if(!Number.isFinite(parsed.getTime()))return date;
    return new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/London',weekday:'short',day:'numeric',month:'short',year:'numeric'}).format(parsed);
  }
  function eventCard(event){
    const card=el('article','community-event-card');
    const meta=el('div','community-event-meta');
    meta.append(el('span','community-event-date',formattedDate(event.event_date)));
    if(event.event_time)meta.append(el('span','community-event-time',event.event_time+' · UK time'));
    const title=el('h3','',event.title);
    const body=el('p','',event.body);
    card.append(meta,title,body);
    if(event.location)card.append(el('div','community-event-location','⌖ '+event.location));
    return card;
  }
  function renderEvents(events){
    grid.classList.add('community-events-grid');
    grid.replaceChildren();
    if(!events.length){
      const empty=el('div','community-events-empty');
      empty.append(el('strong','','No upcoming confirmed events'),
        el('p','','New programmes will appear here after the masjid team publishes their details.'));
      grid.append(empty);
      return;
    }
    events.forEach(event=>grid.append(eventCard(event)));
  }
  function renderNotices(notices){
    const previous=section.querySelector('.news-strip');
    if(previous)previous.hidden=true; // Original promotional subscribe button is not a real opt-in.
    if(!notices.length)return;
    const list=el('section','community-notices');
    list.setAttribute('aria-label','Latest masjid announcements');
    list.append(el('h3','','Latest masjid announcements'));
    notices.forEach(item=>{
      const article=el('article','community-notice-card');
      article.append(el('strong','',item.title),el('p','',item.body));
      if(item.pinned)article.classList.add('is-pinned');
      list.append(article);
    });
    grid.insertAdjacentElement('afterend',list);
  }
  function mobileActions(){
    const nav=el('nav','community-mobile-actions');
    nav.setAttribute('aria-label','Quick masjid actions');
    const links=[
      ['Prayer times','#prayer-times'],
      ["What's on",'#whatson'],
      ['Directions','#visit'],
      ['Donate','#give']
    ];
    links.forEach(([label,url])=>{
      const a=el('a','',label);
      a.href=url;nav.append(a);
    });
    document.body.append(nav);
  }
  async function load(){
    try{
      const res=await fetch('/api/public/community',{cache:'no-store',headers:{Accept:'application/json'}});
      if(!res.ok)throw Error('Community information unavailable');
      const feed=await res.json();
      if(feed?.enabled!==true)return;
      if(!Array.isArray(feed.events)||!Array.isArray(feed.announcements))throw Error('Invalid community feed');
      const events=feed.events.filter(e=>e&&typeof e.title==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(e.event_date)).slice(0,9);
      const notices=feed.announcements.filter(e=>e&&typeof e.title==='string').slice(0,5);
      renderEvents(events);
      renderNotices(notices);
      const copy=section.querySelector('.programme-description');
      if(copy)copy.textContent='Confirmed events, lectures and community notices, published by the Masjid At-Towfiq team.';
      const heading=section.querySelector('.section-kicker');
      if(heading)heading.textContent="03 / MASJID LIFE & EVENTS";
      section.classList.add('community-phase1-active');
      document.body.classList.add('community-phase1-enabled');
      mobileActions();
    }catch(err){
      console.warn('Community upgrade unavailable. Showing the original website.',err);
    }
  }
  load();
})();
