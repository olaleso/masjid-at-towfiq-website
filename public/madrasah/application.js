/* Madrasah At-Towfiq — family admissions. One guardian form, up to six
   separately reviewed children. No local storage or sensitive console logs. */
(()=>{
 'use strict';
 const API='https://portal.attowfiqmasjid.org/api/public/admissions';
 const form=document.getElementById('madrasahAdmissionForm');
 if(!form)return;
 const panels=[...form.querySelectorAll('.wizard-panel')];
 const progress=[...document.querySelectorAll('.wizard-step')];
 const next=document.getElementById('nextStep');
 const back=document.getElementById('backStep');
 const submit=document.getElementById('submitAdmission');
 const feedback=document.getElementById('applicationFeedback');
 const availability=document.getElementById('admissionAvailability');
 const success=document.getElementById('applicationSuccess');
 const review=document.getElementById('applicationReview');
 const stepper=document.querySelector('.wizard-stepper');
 const identityList=document.getElementById('childIdentityList');
 const supportList=document.getElementById('childSupportList');
 const addButton=document.getElementById('addAnotherChild');
 const childCountNote=document.getElementById('childCountNote');
 const started=document.getElementById('formStartedAt');
 const childText=['first_name','last_name','dob','gender','previous_attended','previous_institute',
  'qaaidah_page','quran_surah','medical_information','allergies','additional_learning_needs','message'];
 const childChecks=['level_starting','level_qaaidah','level_quran','arabic_read_write','consent_first_aid','consent_photos'];
 const commonText=['home_address','postcode','home_telephone','guardian_name','guardian_email',
  'guardian_phone','emergency_phone','guardian_relationship'];
 let active=0,visited=0,available=false,sending=false,finished=false;

 started.value=String(Date.now());
 document.getElementById('currentYear').textContent=String(new Date().getFullYear());
 const identityBlocks=()=>[...identityList.querySelectorAll('[data-child-basic]')];
 const supportBlocks=()=>[...supportList.querySelectorAll('[data-child-support]')];
 const textValue=(root,name)=>root.querySelector('[name="'+name+'"]')?.value?.trim()||'';
 const checkValue=(root,name)=>!!root.querySelector('[name="'+name+'"]')?.checked;
 const common=name=>form.elements.namedItem(name)?.value?.trim()||'';
 function notify(message){feedback.textContent=message||'';}
 function updatePrevious(block){
  const select=block.querySelector('[name="previous_attended"]');
  const row=block.querySelector('[name="previous_institute"]')?.closest('label');
  const input=block.querySelector('[name="previous_institute"]');
  if(!select||!row||!input)return;
  const yes=select.value==='yes';
  row.hidden=!yes;
  input.required=yes;
  if(!yes)input.value='';
 }
 function bindPrevious(block){
  const select=block.querySelector('[name="previous_attended"]');
  select?.addEventListener('change',()=>updatePrevious(block));
  updatePrevious(block);
 }
 bindPrevious(supportBlocks()[0]);
 function clearControls(block){
  block.querySelectorAll('input,textarea,select').forEach(element=>{
   if(element.type==='checkbox'||element.type==='radio')element.checked=false;
   else element.value='';
   element.removeAttribute('aria-invalid');
   if(element.id)element.removeAttribute('id');
   if(element.name==='previous_institute')element.required=false;
  });
  block.querySelectorAll('[id]').forEach(element=>element.removeAttribute('id'));
 }
 function renumber(){
  identityBlocks().forEach((block,index)=>{
   block.dataset.childBasic=String(index);
   const title=block.querySelector('.child-legend-text');
   if(title)title.textContent='Child '+(index+1)+' details';
   const rm=block.querySelector('[data-remove-child]');
   if(rm){rm.dataset.removeChild=String(index);rm.setAttribute('aria-label','Remove child '+(index+1));}
  });
  supportBlocks().forEach((block,index)=>{
   block.dataset.childSupport=String(index);
   block.querySelector('.child-support-heading').textContent=
    'Child '+(index+1)+' · Learning & support';
  });
  const count=identityBlocks().length;
  childCountNote.textContent=count+' '+(count===1?'child':'children')+' added · Maximum 6';
  addButton.disabled=count>=6;
  addButton.textContent=count>=6?'Maximum of six children':' + Add another child';
 }
 addButton.addEventListener('click',()=>{
  if(sending||finished||identityBlocks().length>=6)return;
  const number=identityBlocks().length+1;
  const identity=identityBlocks()[0].cloneNode(true);
  clearControls(identity);
  identity.removeAttribute('id');
  const remove=document.createElement('button');
  remove.type='button';
  remove.className='child-remove-button';
  remove.dataset.removeChild=String(number-1);
  remove.textContent='Remove this child';
  identity.append(remove);
  identityList.append(identity);
  const support=supportBlocks()[0].cloneNode(true);
  clearControls(support);
  support.querySelectorAll('[hidden]').forEach(node=>{if(node.classList.contains('previous-institute'))node.hidden=true;});
  supportList.append(support);
  bindPrevious(support);
  renumber();
  identity.querySelector('input[name="last_name"]')?.focus();
 });
 identityList.addEventListener('click',event=>{
  const remove=event.target.closest('[data-remove-child]');
  if(!remove||sending||finished)return;
  const index=Number(remove.dataset.removeChild);
  if(index<1||index>=identityBlocks().length)return;
  identityBlocks()[index].remove();
  supportBlocks()[index].remove();
  renumber();
  addButton.focus();
 });
 function setAvailability(ok,message){
  available=ok;
  availability.textContent=message;
  availability.classList.toggle('is-active',ok);
  availability.classList.toggle('is-unavailable',!ok);
  submit.disabled=!ok||sending;
 }
 async function probe(){
  try{
   const response=await fetch(API,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',
    headers:{Accept:'application/json'},signal:AbortSignal.timeout(11000)});
   const body=await response.json().catch(()=>null);
   if(!response.ok||body?.accepting!==true)throw Error('Admissions service unavailable');
   setAvailability(true,'Online family admissions are available. Your information is only sent when you submit.');
  }catch(_){
   setAvailability(false,'Online submissions are temporarily unavailable. Contact info@attowfiiqmasjid.org or 01204 775864.');
  }
 }
 function pair(label,value){
  const wrap=document.createElement('div');wrap.className='review-pair';
  const dt=document.createElement('dt');dt.textContent=label;
  const dd=document.createElement('dd');dd.textContent=value||'Not provided';
  wrap.append(dt,dd);return wrap;
 }
 function group(title,step,rows){
  const section=document.createElement('section');section.className='review-group';
  const head=document.createElement('div');head.className='review-group-top';
  const heading=document.createElement('h3');heading.textContent=title;
  const edit=document.createElement('button');edit.type='button';edit.textContent='Edit';
  edit.setAttribute('aria-label','Edit '+title.toLowerCase());
  edit.addEventListener('click',()=>display(step));
  head.append(heading,edit);
  const dl=document.createElement('dl');dl.className='review-pairs';
  rows.forEach(row=>dl.append(pair(row[0],row[1])));
  section.append(head,dl);
  return section;
 }
 function readChild(index){
  const basic=identityBlocks()[index],additional=supportBlocks()[index];
  const item={};
  for(const name of childText)item[name]=textValue(
   ['first_name','last_name','dob','gender'].includes(name)?basic:additional,name);
  for(const name of childChecks)item[name]=checkValue(additional,name);
  return item;
 }
 function buildReview(){
  review.replaceChildren();
  review.append(group('Shared household and guardian details',1,[
   ['Parent / guardian',common('guardian_name')],
   ['Relationship',common('guardian_relationship')],
   ['Email',common('guardian_email')],
   ['Mobile',common('guardian_phone')],
   ['Emergency telephone',common('emergency_phone')],
   ['Home address',common('home_address')],
   ['Postcode',common('postcode')],
   ['Home telephone',common('home_telephone')]
  ]));
  identityBlocks().forEach((_,i)=>{
   const child=readChild(i);
   const name=[child.first_name,child.last_name].filter(Boolean).join(' ');
   review.append(group('Child '+(i+1)+' · '+name,0,[
    ['Full name',name],['Date of birth',child.dob],['Gender',child.gender]
   ]));
   review.append(group('Child '+(i+1)+' · Learning and support',2,[
    ['Previous madrasah',child.previous_attended==='yes'?'Yes — '+child.previous_institute:
     child.previous_attended==='no'?'No':'Not known'],
    ['Beginner',child.level_starting?'Yes':'No'],
    ['Qaaidah',child.level_qaaidah?'Yes':'No'],
    ["Reading Qur'an",child.level_quran?'Yes':'No'],
    ['Can read and write Arabic',child.arabic_read_write?'Yes':'No'],
    ['Qaaidah page',child.qaaidah_page],['Surah / passage',child.quran_surah],
    ['Medical information',child.medical_information],
    ['Allergies',child.allergies],['Learning support needs',child.additional_learning_needs],
    ['First aid consent',child.consent_first_aid?'Yes':'No'],
    ['Internal photography consent',child.consent_photos?'Yes':'No'],
    ['Additional notes',child.message]
   ]));
  });
 }
 function display(index,focus=true){
  if(index<0||index>3||finished)return;
  active=index;visited=Math.max(visited,index);
  panels.forEach((panel,i)=>{panel.hidden=i!==index;});
  progress.forEach((button,i)=>{
   const current=i===index;
   button.classList.toggle('is-current',current);
   button.classList.toggle('is-complete',i<visited&&!current);
   button.disabled=i>visited;
   if(current)button.setAttribute('aria-current','step');
   else button.removeAttribute('aria-current');
  });
  if(index===3)buildReview();
  back.hidden=index===0;next.hidden=index===3;submit.hidden=index!==3;
  submit.disabled=!available||sending;
  notify('');
  if(focus){
   panels[index].querySelector('h2')?.focus({preventScroll:true});
   stepper.scrollIntoView({block:'start'});
  }
 }
 function firstInvalid(panel){
  for(const control of panel.querySelectorAll('input,select,textarea')){
   if(!control.willValidate)continue;
   const hiddenAncestor=control.closest('[hidden]');
   if(hiddenAncestor&&hiddenAncestor!==panel)continue;
   if(!control.checkValidity())return control;
  }
  return null;
 }
 function validate(index){
  const invalid=firstInvalid(panels[index]);
  if(!invalid)return true;
  display(index);
  const label=invalid.closest('label');
  notify('Please complete '+(label?.textContent?.replace('*','').trim()||'the required field')+' before continuing.');
  invalid.focus();invalid.reportValidity();
  return false;
 }
 progress.forEach((button,i)=>button.addEventListener('click',()=>{
  if(i>visited||sending||finished||i===active)return;
  if(i>active){for(let j=active;j<i;j++)if(!validate(j))return;}
  display(i);
 }));
 next.addEventListener('click',()=>{
  if(sending||!validate(active))return;
  if(active<3)display(active+1);
 });
 back.addEventListener('click',()=>{if(!sending&&active>0)display(active-1);});
 async function onSubmit(event){
  event.preventDefault();
  if(!available||sending||finished){
   if(!available)notify('Online submissions are unavailable. Please contact the admissions team.');
   return;
  }
  for(let i=0;i<4;i++)if(!validate(i))return;
  const declaration=form.elements.namedItem('parent_confirmed')?.checked;
  if(!declaration){display(3);notify('Please agree to the parent / guardian declaration.');return;}
  const payload={form_started_at:Number(started.value),
   parent_confirmed:true,website:common('website'),children:identityBlocks().map((_,i)=>readChild(i))};
  for(const name of commonText)payload[name]=common(name);
  sending=true;submit.disabled=true;submit.textContent='Submitting securely…';notify('');
  try{
   const response=await fetch(API,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',
    headers:{'Content-Type':'application/json',Accept:'application/json'},
    body:JSON.stringify(payload),signal:AbortSignal.timeout(30000)});
   const answer=await response.json().catch(()=>({}));
   if(!response.ok||answer.ok!==true||!answer.reference)
    throw Error(answer.error||'Unable to submit the application. Please contact the admissions team.');
   finished=true;form.hidden=true;
   document.getElementById('successReference').textContent=String(answer.reference);
   const childrenBox=document.getElementById('successChildren');
   childrenBox.replaceChildren();
   if(Array.isArray(answer.applications)){
    const heading=document.createElement('h3');
    heading.textContent='Applications recorded ('+answer.applications.length+')';
    const list=document.createElement('ul');
    for(const child of answer.applications){
     const entry=document.createElement('li');
     entry.textContent=String(child.student_name)+' — '+String(child.reference);
     list.append(entry);
    }
    childrenBox.append(heading,list);
   }
   document.getElementById('successEmailMessage').textContent=answer.acknowledgement_status==='sent'?
    'One acknowledgement email with your application references has been sent to the address provided.':
    'Your application records have been saved. Email delivery could not be confirmed; please keep the references shown.';
   success.hidden=false;
   availability.textContent='Family application submitted securely.';
   availability.classList.remove('is-unavailable');availability.classList.add('is-active');
   success.focus({preventScroll:true});
   success.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(error){
   notify(error?.name==='TimeoutError'?
    'The request timed out and may already have been received. Contact the madrasah before trying again to avoid duplicate applications.':
    String(error?.message||'Submission failed. Please contact the madrasah.'));
   feedback.scrollIntoView({behavior:'smooth',block:'center'});
  }finally{
   sending=false;
   if(!finished){submit.disabled=!available;submit.textContent='Submit family application →';}
  }
 }
 form.addEventListener('submit',onSubmit);
 document.getElementById('copyReference')?.addEventListener('click',async()=>{
  const label=document.getElementById('copyReference');
  try{
   await navigator.clipboard.writeText(document.getElementById('successReference').textContent);
   label.textContent='Copied';
  }catch{label.textContent='Select and copy the reference above';}
 });
 renumber();display(0,false);probe();
})();
