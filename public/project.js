/* Bank transfer information can be copied locally; no donation is processed here. */
(() => {
  'use strict';
  const status=document.getElementById('bankCopyStatus');
  const fields={
    charity:'AT-TOWFIIQ ISLAMIC AND CULTURAL CHARITY',
    sort:'40-12-25',
    account:'72268922'
  };
  async function copyValue(value){
    if(navigator.clipboard && window.isSecureContext){
      try{await navigator.clipboard.writeText(value);return true;}catch(_e){}
    }
    const field=document.createElement('textarea');
    field.value=value;
    field.setAttribute('readonly','');
    field.style.position='fixed';
    field.style.left='-10000px';
    document.body.appendChild(field);
    field.select();
    const ok=document.execCommand('copy');
    field.remove();
    return ok;
  }
  async function handleCopy(value){
    try{
      const success=await copyValue(value);
      status.textContent=success?'Copied to clipboard.':'Copy unavailable. Please select and copy the details manually.';
    }catch(_e){
      status.textContent='Copy unavailable. Please select and copy the details manually.';
    }
  }
  document.querySelectorAll('[data-copy-bank]').forEach(button=>{
    button.addEventListener('click',()=>handleCopy(button.getAttribute('data-copy-bank')));
  });
  document.getElementById('copyBankDetails')?.addEventListener('click',()=>handleCopy(
    'Account name: '+fields.charity+'\nSort code: '+fields.sort+'\nAccount number: '+fields.account+'\nSuggested reference: NEW MASJID'
  ));
})();
