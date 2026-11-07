/* Genuine exterior photos of the secured new masjid property.
   The original image remains visible until all four new assets are present. */
(()=>{
 'use strict';
 const mosaic=document.getElementById('newMasjidPhotoMosaic');
 const fallback=document.getElementById('newMasjidPhotoFallback');
 const dialog=document.getElementById('newMasjidPhotoDialog');
 if(!mosaic||!fallback||!dialog)return;
 const photos=[
  ['assets/new-masjid-2026-front.webp','Front elevation of the Temperance Street property and cobbled road'],
  ['assets/new-masjid-2026-elevation.webp','Main red-brick frontage and adjacent building'],
  ['assets/new-masjid-2026-side.webp','Side view of the property from the adjoining street'],
  ['assets/new-masjid-2026-corner.webp','Corner perspective of the property and its entrance']
 ];
 const full=document.getElementById('newMasjidPhotoFull');
 const caption=document.getElementById('newMasjidPhotoCaption');
 let selected=0,lastFocused=null,ready=false;
 function show(index){
  if(!ready)return;
  selected=(index+photos.length)%photos.length;
  full.src=photos[selected][0];full.alt=photos[selected][1];
  caption.textContent=(selected+1)+' / '+photos.length+' · '+photos[selected][1];
 }
 function open(index){
  if(!ready)return;
  lastFocused=document.activeElement;
  show(index);
  if(typeof dialog.showModal==='function')dialog.showModal();
  else window.open(photos[selected][0],'_blank','noopener');
 }
 mosaic.addEventListener('click',event=>{
  const button=event.target.closest('[data-new-masjid-photo]');
  if(button)open(Number(button.dataset.newMasjidPhoto));
 });
 document.getElementById('newMasjidPhotoClose').addEventListener('click',()=>dialog.close());
 document.getElementById('newMasjidPhotoPrev').addEventListener('click',()=>show(selected-1));
 document.getElementById('newMasjidPhotoNext').addEventListener('click',()=>show(selected+1));
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{full.removeAttribute('src');lastFocused?.focus?.();});
 dialog.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'){event.preventDefault();show(selected-1);}
  else if(event.key==='ArrowRight'){event.preventDefault();show(selected+1);}
 });
 // Fail closed: an incomplete asset upload cannot leave broken thumbnails.
 Promise.all(photos.map(([url])=>new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>img.naturalWidth>200?resolve():reject(Error('Photo too small'));
  img.onerror=()=>reject(Error('Photo unavailable'));
  img.src=url;
 }))).then(()=>{
  ready=true;
  fallback.hidden=true;
  mosaic.hidden=false;
 }).catch(()=>{ /* Keep pre-existing property photo until new assets are deployed. */ });
})();
