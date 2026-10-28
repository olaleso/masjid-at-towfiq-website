(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  $('#currentYear').textContent = String(new Date().getFullYear());
  const fmt = new Intl.DateTimeFormat('en-GB', {timeZone:'Europe/London',weekday:'long',day:'numeric',month:'long',year:'numeric'});
  $('#todayDate').textContent = fmt.format(new Date()) + ' · Bolton';

  // Responsive menu
  const toggle = $('#menuToggle'), mobileNav = $('#mobileMenu');
  toggle.addEventListener('click', () => {
    const opening = mobileNav.hidden;
    mobileNav.hidden = !opening;
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-label', opening ? 'Close menu' : 'Open menu');
  });
  $$('#mobileMenu a').forEach((a) => a.addEventListener('click', () => {
    mobileNav.hidden = true; toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Open menu');
  }));
  document.addEventListener('keydown', e => {if(e.key === 'Escape') closeModal();});

  const backdrop = $('#modalBackdrop'), modal = backdrop.querySelector('.modal');
  let lastFocus = null;
  function openModal(kicker, title, body){
    lastFocus = document.activeElement;
    $('#modalKicker').textContent = kicker;
    $('#modalTitle').textContent = title;
    $('#modalContent').innerHTML = body;
    backdrop.hidden = false;
    document.body.classList.add('modal-open');
    modal.focus();
  }
  function closeModal(){
    if(backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.classList.remove('modal-open');
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  $('#modalClose').addEventListener('click',closeModal);
  $('#modalDismiss').addEventListener('click',closeModal);
  backdrop.addEventListener('click',e=>{if(e.target === backdrop) closeModal();});
  // Prevent focus from leaving the modal while open.
  backdrop.addEventListener('keydown',e=>{
    if(e.key !== 'Tab') return;
    const focusable = [...backdrop.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')].filter(el=>el.offsetParent!==null);
    if(!focusable.length) return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey && document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey && document.activeElement===last){e.preventDefault();first.focus();}
  });

  const separateSite = () => openModal('THE MADRASAH HAS ITS OWN HOME', 'A dedicated Madrasah website',
    '<p>As requested, the Madrasah is separate from this masjid website. Its admissions, parent/guardian accounts, student management and school communications will live on the dedicated Madrasah domain.</p><p><strong>This is a concept preview.</strong> Once the new Madrasah URL is confirmed, this link will open that external website directly.</p>');
  ['#madrasahAction','#mobileMadrasah','#footerMadrasah'].forEach(s=>$(s).addEventListener('click',separateSite));
  $('#timetableAction').addEventListener('click',()=>openModal('PRAYER TIMES • IMPLEMENTATION', 'The full masjid timetable',
    '<p>In the live website this will show the <strong>official At-Towfiq timetable</strong>, including start and jama’ah times, separate Jumu’ah arrangements, and a downloadable monthly PDF.</p><p>The currently displayed times are <strong>illustrative only</strong>, not verified. We will publish real times only after the masjid approves its timetable or connects its existing prayer-time system.</p>'));
  const eventInfo={
    jumuah:['FRIDAY WORSHIP','Jumu’ah at At-Towfiq','<p>This page will show the verified Jumu’ah congregation time(s), khutbah language, accessibility guidance and any special Friday announcements.</p><p>Until the masjid provides confirmed information, no Friday service time has been advertised in this preview.</p>'],
    talks:['LEARNING AT THE MASJID','Knowledge & reflection','<p>A future hub for confirmed talks, Qur’an reflections, beneficial reminders and recordings from verified speakers, with topic filters and event registration where appropriate.</p><p>This card is a sample of the proposed programme categories, not an advertised event.</p>'],
    gatherings:['TOGETHER IN COMMUNITY','Our community gatherings','<p>Here the masjid can share authentic updates about Ramadan iftars, Eid celebrations, youth and elder initiatives, volunteering and wider community activities.</p><p>When an event is confirmed it will show its actual date, venue, availability and organiser contact.</p>']
  };
  $$('[data-event]').forEach(b=>b.addEventListener('click',()=>{const c=eventInfo[b.dataset.event];openModal(...c);}));
  $('#alertsAction').addEventListener('click',()=>openModal('COMMUNITY COMMUNICATIONS','Masjid announcements',
    '<p>The proposed live website includes a subscribe-by-email option for Jumu’ah notices, Ramadan and Eid updates, event announcements and community reminders.</p><p>To respect privacy, subscriptions will be added only after the masjid selects a mailing provider, publishes a privacy notice and enables verified consent. <strong>No subscription is collected by this demonstration.</strong></p>'));

  // Demonstration donation chooser (no banking/payment integration)
  let amount=25;
  $$('.amount-button').forEach(b=>b.addEventListener('click',()=>{
    amount=Number(b.dataset.amount);
    $$('.amount-button').forEach(el=>{el.classList.toggle('selected',el===b);el.setAttribute('aria-pressed',String(el===b));});
    $('#customAmount').value='';
  }));
  $('#customAmount').addEventListener('input',()=>{
    const input=Number($('#customAmount').value);
    amount=Number.isFinite(input)?input:0;
    $$('.amount-button').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-pressed','false');});
  });
  $('#donateAction').addEventListener('click',()=>{
    if(!Number.isFinite(amount)||amount<1||amount>100000){
      openModal('DONATION PREVIEW','Enter a valid amount','<p>Please enter an amount between £1 and £100,000 to preview this flow. No money is processed on this prototype.</p>');return;
    }
    const kind=document.querySelector('input[name="donationKind"]:checked').value;
    openModal('DONATION FLOW • CONCEPT ONLY','Your giving journey',
      `<p>You selected <strong>£${amount.toLocaleString('en-GB',{minimumFractionDigits:2,maximumFractionDigits:2})} ${kind === 'monthly'?'per month':'one-off'}</strong> to support Masjid At-Towfiq.</p><p>A production version can securely connect to Stripe, provide the approved donation fund choices, offer UK Gift Aid declarations where eligible, and send receipts.</p><p><strong>No payment was taken or initiated.</strong> The masjid's authorised payment details and donation policy must be approved before launch.</p>`);
  });
  // Scroll-based appearance. Accessible fallback for browsers without IntersectionObserver.
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches){
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}
    },{threshold:.07,rootMargin:'0px 0px 30px 0px'});
    $$('.reveal').forEach(el=>observer.observe(el));
  } else $$('.reveal').forEach(el=>el.classList.add('visible'));
  const sections=['home','prayer-times','whatson','community','visit'];
  const navLinks=$$('.desktop-nav .nav-link');
  function updateActive(){
    let current='home';
    for(const id of sections){const s=document.getElementById(id);if(s&&s.getBoundingClientRect().top<220)current=id;}
    navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')==='#'+current));
  }
  window.addEventListener('scroll',updateActive,{passive:true});updateActive();
})();
