/* Masjid At-Towfiq public contact page. No email app or local storage. */
(()=>{
 'use strict';
 const form=document.getElementById('contactEnquiryForm');
 if(!form)return;
 const api='https://portal.attowfiqmasjid.org/api/public/masjid-enquiries';
 const status=document.getElementById('contactStatus');
 const submit=document.getElementById('sendEnquiry');
 const success=document.getElementById('enquirySuccess');
 const content=document.getElementById('contactFormContent');
 const started=document.getElementById('formStartedAt');
 const topics=new Set(['general','nikah','counselling','funeral','sheikh','volunteering','other']);
 const query=new URLSearchParams(location.search);
 const preferred=query.get('topic')||'general';
 document.getElementById('enquiryTopic').value=topics.has(preferred)?preferred:'general';
 document.getElementById('currentYear').textContent=String(new Date().getFullYear());
 started.value=String(Date.now());
 let sending=false,finished=false;
 const tell=message=>{status.textContent=message;status.hidden=!message;};
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(sending||finished)return;
  if(!form.reportValidity())return;
  const data=new FormData(form);
  const payload={
   name:String(data.get('name')||'').trim(),email:String(data.get('email')||'').trim(),
   phone:String(data.get('phone')||'').trim(),topic:String(data.get('topic')||''),
   message:String(data.get('message')||'').trim(),
   website:String(data.get('website')||''),
   form_started_at:Number(started.value),privacy_confirmed:data.has('privacy_confirmed')
  };
  if(payload.message.length<20){tell('Please provide at least 20 characters in your message.');form.elements.message.focus();return;}
  sending=true;submit.disabled=true;submit.textContent='Sending securely…';tell('');
  try{
   const response=await fetch(api,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',
     headers:{'Content-Type':'application/json',Accept:'application/json'},
     body:JSON.stringify(payload),signal:AbortSignal.timeout(20000)});
   const answer=await response.json().catch(()=>({}));
   if(!response.ok||answer.ok!==true||!answer.reference)
     throw new Error(answer.error||'Your enquiry could not be submitted. Please phone the masjid.');
   finished=true;content.hidden=true;success.hidden=false;
   document.getElementById('enquiryReference').textContent=answer.reference;
   success.focus({preventScroll:true});
   success.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){
   tell(err?.name==='TimeoutError'
     ?'The request timed out and may already have reached us. Please phone the masjid before submitting again to avoid duplicates.'
     :String(err?.message||'Your message could not be sent. Please phone the masjid.'));
   status.scrollIntoView({behavior:'smooth',block:'center'});
  }finally{
   sending=false;
   if(!finished){submit.disabled=false;submit.innerHTML='Send enquiry securely <span aria-hidden="true">↗</span>';}
  }
 });
})();
