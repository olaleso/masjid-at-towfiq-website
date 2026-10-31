/* Madrasah At-Towfiq: secure public admissions client, no local persistence. */
(() => {
  'use strict';
  const API='https://portal.attowfiqmasjid.org/api/public/admissions';
  const form=document.getElementById('madrasahAdmissionForm');
  const availability=document.getElementById('admissionAvailability');
  const submit=document.getElementById('submitAdmission');
  const feedback=document.getElementById('applicationFeedback');
  const success=document.getElementById('applicationSuccess');
  const previous=document.getElementById('previousAttended');
  const previousRow=document.getElementById('previousInstituteRow');
  const previousInput=document.getElementById('previousInstitute');
  const initialTime=document.getElementById('formStartedAt');
  if(!form || !availability || !submit)return;
  const boolFields=['level_starting','level_qaaidah','level_quran','arabic_read_write','consent_first_aid','consent_photos','parent_confirmed'];
  const textFields=['first_name','last_name','dob','gender','home_address','postcode','home_telephone',
    'guardian_name','guardian_email','guardian_phone','emergency_phone','guardian_relationship',
    'previous_attended','previous_institute','qaaidah_page','quran_surah','medical_information',
    'allergies','additional_learning_needs','message','website'];
  let ready=false,working=false;
  initialTime.value=String(Date.now());
  const setAvailability=(ok,message)=>{
    ready=ok;
    submit.disabled=!ok||working;
    availability.textContent=message;
    availability.classList.toggle('is-active',ok);
    availability.classList.toggle('is-unavailable',!ok);
  };
  const refreshPrevious=()=>{
    const isYes=previous.value==='yes';
    previousRow.hidden=!isYes;
    previousInput.required=isYes;
    if(!isYes)previousInput.value='';
  };
  previous.addEventListener('change',refreshPrevious);
  refreshPrevious();
  const checkAvailability=async()=>{
    try{
      const response=await fetch(API,{method:'GET',mode:'cors',credentials:'omit',cache:'no-store',
        headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
      if(!response.ok)throw Error('Admissions service unavailable');
      const data=await response.json();
      if(data.accepting!==true)throw Error('Admissions service not yet available');
      setAvailability(true,'Online applications are available. Complete the form below and submit when ready.');
    }catch(err){
      setAvailability(false,'Online submission is not yet available. Please contact info@attowfiiqmasjid.org or call 01204 775864 for admissions assistance.');
    }
  };
  const escapeFieldName=(name)=>{
    const labels={first_name:'Student forename',last_name:'Student surname',dob:'Date of birth',
      gender:'Gender',guardian_email:'Guardian email',guardian_name:'Guardian name',
      guardian_phone:'Guardian mobile',home_address:'Home address',postcode:'Postcode'};
    return labels[name]||name;
  };
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!ready||working)return;
    feedback.textContent='';
    if(!form.checkValidity()){
      const bad=form.querySelector(':invalid');
      if(bad){
        feedback.textContent='Please complete the required fields and declarations before submitting.';
        bad.focus();bad.reportValidity();
      }
      return;
    }
    const fd=new FormData(form);
    const payload={form_started_at:Number(initialTime.value)};
    for(const name of textFields)payload[name]=String(fd.get(name)||'').trim();
    for(const name of boolFields)payload[name]=fd.has(name);
    if(!payload.parent_confirmed){
      feedback.textContent='Please confirm the parent or guardian declaration.';return;
    }
    if(payload.previous_attended==='yes'&&!payload.previous_institute){
      feedback.textContent='Please enter the previous madrasah.';previousInput.focus();return;
    }
    working=true;submit.disabled=true;submit.textContent='Submitting application…';
    try{
      const response=await fetch(API,{method:'POST',mode:'cors',credentials:'omit',cache:'no-store',
        headers:{'Content-Type':'application/json',Accept:'application/json'},
        body:JSON.stringify(payload),signal:AbortSignal.timeout(25000)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||data.ok!==true)throw Error(data.error||'Application could not be submitted. Please try again or contact the madrasah.');
      form.hidden=true;
      const ref=String(data.reference||'');
      document.getElementById('successReference').textContent=ref||'Please contact the madrasah for a reference';
      const sent=data.acknowledgement_status==='sent';
      document.getElementById('successEmailMessage').textContent=sent?
        'An acknowledgement has been sent to the parent / guardian email address.':
        'Your application has been saved. An acknowledgement email may not be available; please keep this reference.';
      success.hidden=false;
      availability.textContent='Application submitted securely.';
      availability.classList.remove('is-unavailable');
      availability.classList.add('is-active');
      success.focus();success.scrollIntoView({behavior:'smooth',block:'start'});
    }catch(err){
      // If a request timed out after being saved, do not retry automatically.
      feedback.textContent=err?.name==='TimeoutError'?
        'The submission timed out. Please contact the madrasah before submitting again to avoid duplicates.':
        String(err?.message||'Unable to submit. Please contact the madrasah.');
      feedback.scrollIntoView({behavior:'smooth',block:'center'});
    }finally{
      working=false;
      if(!success.hidden)return;
      submit.disabled=!ready;
      submit.textContent='Submit admission application ↗';
    }
  });
  document.getElementById('copyReference')?.addEventListener('click',async()=>{
    const val=document.getElementById('successReference').textContent;
    try{await navigator.clipboard.writeText(val);document.getElementById('copyReference').textContent='Copied';}
    catch{document.getElementById('copyReference').textContent='Select and copy the reference above';}
  });
  checkAvailability();
})();
