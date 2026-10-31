/* Madrasah At-Towfiq: accessible four-step admissions form.
   Parents' information is held in the form until explicit final submission.
   No localStorage, analytics or applicant-data logging. */
(() => {
  "use strict";
  const API="https://portal.attowfiqmasjid.org/api/public/admissions";
  const form=document.getElementById("madrasahAdmissionForm");
  if(!form)return;
  const panels=[...form.querySelectorAll(".wizard-panel")];
  const progress=[...document.querySelectorAll(".wizard-step")];
  const next=document.getElementById("nextStep");
  const back=document.getElementById("backStep");
  const submit=document.getElementById("submitAdmission");
  const feedback=document.getElementById("applicationFeedback");
  const availability=document.getElementById("admissionAvailability");
  const success=document.getElementById("applicationSuccess");
  const review=document.getElementById("applicationReview");
  const stepper=document.querySelector(".wizard-stepper");
  const prevSelect=document.getElementById("previousAttended");
  const prevRow=document.getElementById("previousInstituteRow");
  const prevInput=document.getElementById("previousInstitute");
  const started=document.getElementById("formStartedAt");
  let active=0,visited=0,available=false,sending=false,finished=false;

  const booleanFields=["level_starting","level_qaaidah","level_quran","arabic_read_write",
    "consent_first_aid","consent_photos","parent_confirmed"];
  const textFields=["first_name","last_name","dob","gender","home_address","postcode","home_telephone",
    "guardian_name","guardian_email","guardian_phone","emergency_phone","guardian_relationship",
    "previous_attended","previous_institute","qaaidah_page","quran_surah","medical_information",
    "allergies","additional_learning_needs","message","website"];
  started.value=String(Date.now());
  document.getElementById("currentYear").textContent=String(new Date().getFullYear());

  function showMessage(message){feedback.textContent=message||"";}
  function updatePrevious(){
    const yes=prevSelect.value==="yes";
    prevRow.hidden=!yes;
    prevInput.required=yes;
    if(!yes)prevInput.value="";
  }
  prevSelect.addEventListener("change",updatePrevious);
  updatePrevious();

  function setAvailability(ok,message){
    available=ok;
    availability.textContent=message;
    availability.classList.toggle("is-active",ok);
    availability.classList.toggle("is-unavailable",!ok);
    submit.disabled=!ok||sending;
  }
  async function probe(){
    try{
      const res=await fetch(API,{method:"GET",mode:"cors",credentials:"omit",cache:"no-store",
        headers:{Accept:"application/json"},signal:AbortSignal.timeout(11000)});
      const data=await res.json().catch(()=>null);
      if(!res.ok||data?.accepting!==true)throw new Error("Public admissions API is not available");
      setAvailability(true,"Online admissions are available. Your details will only be sent when you select Submit application.");
    }catch(_error){
      setAvailability(false,"Online submission is currently unavailable. Please contact info@attowfiiqmasjid.org or call 01204 775864. You can review the application steps, but cannot submit while the service is unavailable.");
    }
  }
  function inputValue(name){const control=form.elements.namedItem(name);return control?.value?.trim()||"";}
  function checkboxValue(name){return Boolean(form.elements.namedItem(name)?.checked);}
  function field(label,text){
    const wrap=document.createElement("div");wrap.className="review-pair";
    const dt=document.createElement("dt");dt.textContent=label;
    const dd=document.createElement("dd");dd.textContent=text||"Not provided";
    wrap.append(dt,dd);return wrap;
  }
  function group(title,step,rows){
    const section=document.createElement("section");section.className="review-group";
    const header=document.createElement("div");header.className="review-group-top";
    const heading=document.createElement("h3");heading.textContent=title;
    const edit=document.createElement("button");edit.type="button";edit.textContent="Edit";
    edit.setAttribute("aria-label","Edit "+title.toLowerCase());
    edit.addEventListener("click",()=>display(step));
    header.append(heading,edit);
    const list=document.createElement("dl");list.className="review-pairs";
    for(const [label,value] of rows)list.append(field(label,value));
    section.append(header,list);return section;
  }
  const yesNo=name=>checkboxValue(name)?"Yes":"No";
  function buildReview(){
    review.replaceChildren();
    const childName=[inputValue("first_name"),inputValue("last_name")].filter(Boolean).join(" ");
    review.append(group("Child details",0,[
      ["Child's name",childName],["Date of birth",inputValue("dob")],
      ["Gender",inputValue("gender")],["Home address",inputValue("home_address")],
      ["Postcode",inputValue("postcode")],["Home telephone",inputValue("home_telephone")]
    ]));
    review.append(group("Parent / guardian",1,[
      ["Full name",inputValue("guardian_name")],["Relationship",inputValue("guardian_relationship")],
      ["Mobile",inputValue("guardian_phone")],["Emergency telephone",inputValue("emergency_phone")],
      ["Email address",inputValue("guardian_email")]
    ]));
    review.append(group("Learning and support",2,[
      ["Previous madrasah",inputValue("previous_attended")==="yes"?"Yes — "+inputValue("previous_institute"):
        inputValue("previous_attended")==="no"?"No":"Not known"],
      ["Beginner",yesNo("level_starting")],["Qaaidah",yesNo("level_qaaidah")],
      ["Currently reading Qur'an",yesNo("level_quran")],
      ["Can read and write Arabic",yesNo("arabic_read_write")],
      ["Qaaidah page",inputValue("qaaidah_page")],["Surah / passage",inputValue("quran_surah")],
      ["Medical information",inputValue("medical_information")],
      ["Allergies",inputValue("allergies")],
      ["Additional learning needs",inputValue("additional_learning_needs")],
      ["First aid consent",yesNo("consent_first_aid")],
      ["Photographs consent",yesNo("consent_photos")],
      ["Notes",inputValue("message")]
    ]));
  }
  function display(index){
    if(index<0||index>3||finished)return;
    active=index;visited=Math.max(visited,index);
    panels.forEach((panel,i)=>{panel.hidden=i!==index;});
    progress.forEach((button,i)=>{
      const current=i===index;
      button.classList.toggle("is-current",current);
      button.classList.toggle("is-complete",i<visited&&!current);
      button.disabled=i>visited;
      if(current)button.setAttribute("aria-current","step");
      else button.removeAttribute("aria-current");
    });
    if(index===3)buildReview();
    back.hidden=index===0;
    next.hidden=index===3;
    submit.hidden=index!==3;
    submit.disabled=!available||sending;
    showMessage("");
    // Preserve the user's inputs when changing steps. No data is persisted.
    const heading=panels[index].querySelector("h2");
    if(heading)heading.focus({preventScroll:true});
    stepper.scrollIntoView({behavior:"instant",block:"start"});
  }
  function firstInvalid(panel){
    const controls=panel.querySelectorAll("input,select,textarea");
    for(const control of controls){
      if(!control.willValidate)continue;
      const hiddenAncestor=control.closest("[hidden]");
      if(hiddenAncestor && hiddenAncestor!==panel)continue;
      if(!control.checkValidity())return control;
    }
    return null;
  }
  function validate(index){
    const invalid=firstInvalid(panels[index]);
    if(!invalid)return true;
    display(index);
    const label=invalid.closest("label");
    const labelText=label?.textContent?.replace("*","").trim();
    showMessage("Please complete "+(labelText||"the required field")+" before continuing.");
    invalid.focus();
    invalid.reportValidity();
    return false;
  }
  progress.forEach((button,i)=>button.addEventListener("click",()=>{
    if(i>visited||sending||finished||i===active)return;
    if(i>active){
      for(let j=active;j<i;j++)if(!validate(j))return;
    }
    display(i);
  }));
  next.addEventListener("click",()=>{
    if(sending||!validate(active))return;
    if(active<3)display(active+1);
  });
  back.addEventListener("click",()=>{if(!sending&&active>0)display(active-1);});

  async function submitForm(event){
    event.preventDefault();
    if(!available||sending||finished){
      if(!available)showMessage("Online submissions are unavailable. Please contact the madrasah team.");
      return;
    }
    for(let i=0;i<4;i++)if(!validate(i))return;
    // The declaration on step 4 must be explicitly checked.
    if(!checkboxValue("parent_confirmed")){
      display(3);showMessage("Please agree to the parent / guardian declaration.");return;
    }
    const data=new FormData(form);
    const payload={form_started_at:Number(started.value)};
    for(const name of textFields)payload[name]=String(data.get(name)||"").trim();
    for(const name of booleanFields)payload[name]=data.has(name);
    sending=true;
    submit.disabled=true;
    submit.textContent="Submitting securely…";
    showMessage("");
    try{
      const response=await fetch(API,{method:"POST",mode:"cors",credentials:"omit",cache:"no-store",
        headers:{"Content-Type":"application/json",Accept:"application/json"},
        body:JSON.stringify(payload),signal:AbortSignal.timeout(30000)});
      const answer=await response.json().catch(()=>({}));
      if(!response.ok||answer.ok!==true||!answer.reference)
        throw new Error(answer.error||"The application could not be submitted. Please contact the admissions team.");
      finished=true;
      form.hidden=true;
      document.getElementById("successReference").textContent=String(answer.reference);
      document.getElementById("successEmailMessage").textContent=answer.acknowledgement_status==="sent"?
        "An acknowledgement email has been sent to the address provided.":
        "Your application has been saved, but an acknowledgement email could not be confirmed. Please keep your reference.";
      success.hidden=false;
      availability.textContent="Application submitted securely.";
      availability.classList.remove("is-unavailable");
      availability.classList.add("is-active");
      success.focus({preventScroll:true});
      success.scrollIntoView({behavior:"smooth",block:"start"});
    }catch(err){
      showMessage(err?.name==="TimeoutError"?
        "The request timed out. It may have been received. Before trying again, please contact the madrasah to avoid submitting twice.":
        String(err?.message||"Submission failed. Please contact the madrasah."));
      feedback.scrollIntoView({behavior:"smooth",block:"center"});
    }finally{
      sending=false;
      if(!finished){submit.disabled=!available;submit.textContent="Submit application →";}
    }
  }
  form.addEventListener("submit",submitForm);
  document.getElementById("copyReference")?.addEventListener("click",async()=>{
    const value=document.getElementById("successReference").textContent;
    try{await navigator.clipboard.writeText(value);document.getElementById("copyReference").textContent="Copied";}
    catch{document.getElementById("copyReference").textContent="Select and copy the reference above";}
  });
  display(0);
  probe();
})();